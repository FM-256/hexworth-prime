#!/usr/bin/env node
/**
 * mdfinal-p45.test.js — D4: network and sharing (P4), storage and security (P5).
 *
 * @catalog what    Canonical P1-P5 = 67 on every class by GUI and console; single-change negatives for
 * @catalog what    rows 4.1-5.4 and the P4/P5 penalties; effective-access, BitLocker and Defender
 * @catalog what    realism; hidden BitLocker values appear only once their protector exists.
 * @catalog run     node _tools/mdfinal/mdfinal-p45.test.js
 * @catalog status  TOOL
 *
 * Same contract as the P1 and P2/P3 suites: one change per negative, exact parts on the target
 * row, no other row moves except declared knock-ons, exact penalty set.
 */
const kit = require('./mdfinal-test-kit.js');
const W = require('./mdfinal-walk.js');
const CH = kit.req('mdfinal-checks.js');
const G = kit.req('mdfinal-grade.js');
const GUI = kit.req('mdfinal-gui.js');
const SH = kit.req('mdfinal-shell.js');
const CORE = kit.req('mdfinal-core.js');
const FS = kit.req('mdfinal-fs.js');
const t = kit.harness('mdfinal-p45');

const ROWS = CH.CHECKS.filter((r) => typeof r.check === 'function').map((r) => r.id);
const near = (a, b) => Math.abs(a - b) < 1e-9;
/* One graded row by id. */
const rowOf = (g, id) => g.rows.find((r) => r.id === id);
/* A full P1-P5 GUI run with options for P2/P3 (o23) and P4/P5 (o45). */
function full(uid, prof, o45, o23) {
    const { state, key } = W.sitting(uid, [prof, 0]);
    W.p1Gui(state, key); W.p23Gui(state, key, o23 || {}); W.p45Gui(state, key, o45 || {});
    return { state, key, g: G.grade(state, key) };
}

/* ── 1. canonical P1-P5 = 67 on all 12 classes, GUI and console ── */
{
    const bad = [];
    for (const c of CORE.variantSpace()) {
        for (const path of ['gui', 'shell']) {
            const { state, key } = W.sitting('p45-' + path + c.profileIndex + c.variantIndex, [c.profileIndex, c.variantIndex]);
            try {
                W.p1Gui(state, key);
                if (path === 'gui') { W.p23Gui(state, key); W.p45Gui(state, key); } else { W.p23Shell(state, key); W.p45Shell(state, key); }
            } catch (e) { bad.push(c.profile + '/' + c.variant + ' ' + path + ' threw ' + e.message.slice(0, 120)); continue; }
            const g = G.grade(state, key);
            if (g.total !== 67 || g.penalties.some((p) => p.applied)) bad.push(c.profile + '/' + c.variant + ' ' + path + ' total ' + g.total);
        }
    }
    t.check(bad.length === 0, 'canonical P1-P5 = 67/67, no penalty: 12 classes x GUI and console' + (bad.length ? ': ' + bad.slice(0, 3).join(' | ') : ''));
}

/* ── 2. single-change negatives ── */
const base = { 0: full('n45-0', 0).g, 1: full('n45-1', 1).g, 2: full('n45-2', 2).g };
/* [label, profile, o45, o23, row, parts, penalties, also-allowed rows, uid] */
const NEG = [
    ['255.255.255.0 on a /23 WO', 0, {}, { ipMask: '255.255.255.0' }, '4.1', [1, 0, 1, 1, 1], [], [], 'p23mask-0-0'],
    ['DNS servers reversed', 0, {}, { dnsReversed: true }, '4.1', [1, 1, 1, 0, 0], [], []],
    ['wrong gateway', 0, {}, { ipGateway: '10.255.255.254' }, '4.1', [1, 1, 0, 1, 1], [], []],
    ['DHCP left on with Meridian DNS', 0, {}, { ipDhcp: true }, '4.1', [0, 0, 0, 1, 1], [], []],
    ['firewall rule on every profile', 0, { ruleProfile: 'Any' }, {}, '4.2', [1, 0, 1, 1], [], []],
    ['firewall rule remote Any', 0, { ruleRemote: 'Any' }, {}, '4.2', [1, 1, 0, 1], [], []],
    ['no LedgerSync rule', 0, { skipRule: true }, {}, '4.2', [0, 0, 0, 1], [], []],
    ['contractor network left Public', 2, { skipCategory: true }, {}, '4.2', [1, 1, 1, 0], [], []],
    ['join not yet effective, category Private (either-rule pays)', 1, { noRestart: true, category: 'Private' }, { noRestart: true }, '4.2', [1, 1, 1, 1], [], ['2.1', '3.3', '5.2']],
    ['join not yet effective, category left Public', 1, { noRestart: true }, { noRestart: true }, '4.2', [1, 1, 1, 0], [], ['2.1', '3.3', '5.2']],
    ['RDP never enabled, user in Remote Desktop Users', 0, { rdpOff: true }, {}, '4.3', [0, 1], [], []],
    ['RDP on, user not in Remote Desktop Users', 0, { skipRdu: true }, {}, '4.3', [1, 0], [], []],
    ['Everyone left on the share', 0, { keepEveryone: true }, {}, '4.4', [1, 0, 1, 1], [], []],
    ['group Read at the share', 0, { shareRight: 'Read' }, {}, '4.4', [1, 1, 0, 0], [], []],
    ['no share', 0, { skipShare: true }, {}, '4.4', [0, 0, 0, 0], [], []],
    ['D: smaller than the free space', 0, { dSizeMB: 4096 }, {}, '5.1', [0, 1, 2, 2, 1], [], []],
    ['D: label wrong', 0, { dLabel: 'DATA' }, {}, '5.1', [1, 0, 2, 2, 1], [], []],
    ['mirror where the prose wants Simple', 0, { resiliency: 'Two-way mirror' }, {}, '5.1', [1, 1, 2, 0, 1], [], [], 'res-3'],
    ['simple where the prose wants a mirror', 0, { resiliency: 'Simple' }, {}, '5.1', [1, 1, 2, 0, 1], [], [], 'res-0'],
    ['pool of one disk (the space itself still right)', 0, { poolOneDisk: true }, {}, '5.1', [1, 1, 0, 2, 1], [], [], 'res-3'],
    ['BitLocker wizard without the method policy', 0, { noPolicy: true }, {}, '5.2', [0, 1, 1, 1, 1], [], []],
    ['BitLocker suspended', 0, { suspend: true }, {}, '5.2', [1, 0, 1, 1, 1], [], []],
    ['BitLocker system check never restarted', 0, { noRestart: true }, {}, '5.2', [1, 0, 1, 1, 1], [], []],
    ['recovery key printed, not on TECH-USB', 0, { noUsb: true }, {}, '5.2', [1, 1, 1, 1, 0], [], []],
    ['Users left on the confidential folder', 0, { keepUsers: true }, {}, '5.3', [1, 0, 1], [], []],
    ['inheritance removed (Administrators and SYSTEM lose access)', 0, { inheritMode: 'remove' }, {}, '5.3', [0, 0, 0], [], []],
    ['group Modify instead of Read & execute', 0, { confRights: 'Modify' }, {}, '5.3', [1, 1, 0], [], []],
    ['Defender signatures never updated', 0, { skipSig: true }, {}, '5.4', [0, 1], [], []],
    ['Defender exclusion D:\\', 0, { exclusion: 'D:\\' }, {}, '5.4', [1, 0], [], []],
    ['NLA turned off', 0, { nlaOff: true }, {}, null, null, ['P4-nla-off'], []],
    ['real-time protection off in Windows Security', 0, { realtimeOff: true }, {}, null, null, ['P5-realtime-off'], []]
];
for (const [label, prof, o45, o23, row, parts, pens, also, uid] of NEG) {
    let r;
    try { r = full(uid || 'n45-' + prof, prof, o45, o23); } catch (e) { t.check(false, 'negative ' + label + ' threw: ' + e.message.slice(0, 160)); continue; }
    if (row) {
        const got = rowOf(r.g, row).parts;
        t.check(got.length === parts.length && got.every((x, i) => near(x, parts[i])), 'negative ' + label + ': ' + row + ' = ' + JSON.stringify(got));
    }
    const ref = uid ? full(uid + '-ref', prof).g : base[prof];
    const allowed = [row].concat(also);
    const moved = ROWS.filter((id) => !allowed.includes(id) && !near(rowOf(r.g, id).score, rowOf(ref, id).score));
    t.check(moved.length === 0, 'negative ' + label + ': no other row moves' + (moved.length ? ' (moved ' + moved.join(',') + ')' : ''));
    const applied = r.g.penalties.filter((p) => p.applied).map((p) => p.id);
    t.check(JSON.stringify(applied) === JSON.stringify(pens), 'negative ' + label + ': penalties ' + JSON.stringify(applied));
}
/* the remaining penalties, each by one action on a perfect run */
for (const [label, act, pen] of [
    ['a firewall profile off', (s) => W.A(s, 'wf', 'profile', { profile: 'Public', on: false }), 'P4-firewall-off'],
    ['SMB1 enabled', (s) => W.A(s, 'features', 'smb1', { on: true }), 'P4-smb1'],
    ['another share with Everyone Full', (s) => { W.A(s, 'explorer', 'new-folder', { path: 'D:\\Temp' }); W.A(s, 'explorer', 'share', { path: 'D:\\Temp', name: 'Temp' }); W.A(s, 'explorer', 'share-perm', { name: 'Temp', principal: 'Everyone', right: 'Full' }); }, 'P4-everyone-full']]) {
    const { state, key } = W.sitting('pen45-' + pen, [0, 0]);
    W.p1Gui(state, key); W.p23Gui(state, key); W.p45Gui(state, key);
    act(state);
    const g = G.grade(state, key);
    t.check(JSON.stringify(g.penalties.filter((p) => p.applied).map((p) => p.id)) === JSON.stringify([pen]) && g.total === 66, 'penalty: ' + label + ' costs exactly 1');
}
{
    const lost = new Set();
    for (const [, , , , row, parts] of NEG) {
        if (!row) continue;
        const def = CH.CHECKS.find((x) => x.id === row);
        parts.forEach((v, i) => { if (v < def.parts[i].points) lost.add(row + ':' + def.parts[i].id); });
    }
    const all = []; CH.CHECKS.filter((r) => r.phase === 'P4' || r.phase === 'P5').forEach((r) => r.parts.forEach((p) => all.push(r.id + ':' + p.id)));
    /* parts whose negative fixture lives in section 6 (single-change fixtures written as direct actions) */
    ['5.1:spaces-volume', '5.2:tpm', '5.2:rp'].forEach((x) => lost.add(x));
    const missing = all.filter((x) => !lost.has(x));
    t.check(missing.length === 0, 'every P4/P5 part has a negative fixture' + (missing.length ? ' (missing ' + missing.join(', ') + ')' : ''));
}

/* ── 3. realism ── */
{
    const { state, key } = W.sitting('real45', [0, 0]);
    W.p1Gui(state, key); W.p23Gui(state, key);
    const ps = (line) => SH.exec(state, 'ps', line, { key }).out;
    /* D: cannot exist before it is created; a share needs its folder */
    t.check(!GUI.act(state, 'explorer', 'new-folder', { path: 'D:\\X' }).ok, 'no folders on D: before D: exists');
    W.A(state, 'diskmgmt', 'new-volume', { disk: W.osDisk(state).n, letter: 'D', fs: 'NTFS', label: 'x' });
    t.check(!GUI.act(state, 'explorer', 'share', { path: 'D:\\Nope', name: 'Nope' }).ok, 'share of a folder that does not exist refused');
    /* the archive cannot be pooled while it holds its volume */
    const arch = state.disks.find((d) => d.role === 'archive');
    t.check(!GUI.act(state, 'storagespaces', 'pool-new', { name: 'P', disks: [arch.n] }).ok && !state.archiveDamage, 'the archive disk cannot be pooled (CanPool False)');
    t.check(ps('Get-PhysicalDisk -CanPool $true').split('\n').filter((l) => l.indexOf('PhysicalDisk') === 0).length === 2, 'Get-PhysicalDisk -CanPool lists exactly the two blank pool disks');
    /* C: shrink is bounded; the DVD sits at R: */
    t.check(!GUI.act(state, 'diskmgmt', 'shrink', { letter: 'C', shrinkMB: 900000 }).ok, 'C: cannot shrink below Windows\' used space');
    t.check(!GUI.act(state, 'diskmgmt', 'change-letter', { from: 'E', to: 'R' }).ok, 'R: is taken by the DVD drive');
    /* inherited ACEs cannot be removed until inheritance is disabled */
    W.A(state, 'explorer', 'new-folder', { path: 'D:\\Conf' });
    const r = GUI.act(state, 'explorer', 'security-remove', { path: 'D:\\Conf', principal: 'Users' });
    t.check(!r.ok && r.msg.indexOf('inheriting permissions') >= 0, 'removing an inherited entry asks for inheritance to be disabled first');
    /* default NTFS on a new data volume gives Authenticated Users Modify */
    t.check(FS.effectiveMask(state, 'D:\\Conf', state.wo.user.name) === FS.RIGHTS.Modify, 'new folder on D:: a standard user has Modify (Authenticated Users default)');
    /* BitLocker realism */
    t.check(ps('manage-bde -on C: -RecoveryPassword').indexOf('Restart the computer') >= 0 && state.bitlocker.C.status === 'pending', 'manage-bde -on waits for the hardware-test restart');
    t.check(state.bitlocker.C.method === 6, 'no policy and no -em: XTS-AES 128');
    const s2 = W.sitting('real45-bl', [0, 0]); W.p1Gui(s2.state, s2.key);
    const rr = GUI.act(s2.state, 'bitlocker', 'turn-on', { saveTo: 'C:\\', backup: 'file' }, { key: s2.key });
    t.check(!rr.ok && rr.msg.indexOf("can't be saved in this location") >= 0 && !s2.state.bitlocker.C.protectors.length, 'the recovery key cannot be saved to C:');
    const home = W.sitting('real45-home', [0, 0]); W.defaultInstalledState(home.state);
    t.check(!GUI.act(home.state, 'bitlocker', 'turn-on', { saveTo: 'F:\\' }, { key: home.key }).ok, 'Home has no BitLocker');
    /* Tamper Protection: the cmdlet reports success and changes nothing; the toggle works */
    t.check(ps('Set-MpPreference -DisableRealtimeMonitoring $true') === '' && state.defender.realtime === true, 'Set-MpPreference cannot turn real-time off while Tamper Protection is on');
    /* the category of a joined PC is set by the domain */
    t.check(ps('Set-NetConnectionProfile -InterfaceAlias Ethernet -NetworkCategory Private').indexOf('cannot be changed') >= 0, 'a DomainAuthenticated network cannot be set by hand');
}

/* ── 4. hidden BitLocker values appear only once their protector exists ── */
{
    const { state, key } = W.sitting('hid45', [0, 0]);
    W.p1Gui(state, key); W.p23Gui(state, key);
    const dump = () => JSON.stringify(state);
    const vals = key.bitlocker.ids.concat(key.bitlocker.passwords);
    t.check(vals.every((v) => dump().indexOf(v) < 0), 'no BitLocker id or password in state before any protector');
    SH.exec(state, 'ps', 'manage-bde -protectors -add C: -rp', { key });
    const shown = vals.filter((v) => dump().indexOf(v) >= 0);
    t.check(shown.length === 2 && shown.includes(key.bitlocker.ids[0]) && shown.includes(key.bitlocker.passwords[0]), 'one recovery-password protector reveals exactly slot 0 (id and password)');
    for (let i = 0; i < 6; i++) SH.exec(state, 'ps', 'manage-bde -protectors -add C: -rp', { key });
    t.check(state.bitlocker.C.protectors.length <= 4, 'protectors capped at 4');
}

/* ── 5. gaps the D4 mutation round found ── */
{
    const run = (uid, prof, o45) => full(uid, prof, o45 || {});
    /* UDP rule does not count as the LedgerSync TCP rule */
    {
        const { state, key } = W.sitting('g45-udp', [0, 0]); W.p1Gui(state, key); W.p23Gui(state, key); W.p45Gui(state, key, { skipRule: true });
        W.A(state, 'wf', 'rule-new', { name: 'LedgerSync', direction: 'Inbound', action: 'Allow', protocol: 'UDP', localPort: String(state.wo.lob.port), profile: 'Domain,Private', remoteAddress: state.wo.network.lobRemoteSubnet });
        t.check(JSON.stringify(rowOf(G.grade(state, key), '4.2').parts) === '[0,0,0,1]', 'a UDP rule is not the TCP LedgerSync rule');
    }
    /* a remote address with host bits set is stored as its network and still scores */
    {
        const { state, key } = W.sitting('g45-hostbits', [0, 0]); W.p1Gui(state, key); W.p23Gui(state, key);
        const sub = state.wo.network.lobRemoteSubnet, withHost = sub.replace('.0/24', '.77/24');
        W.p45Gui(state, key, { ruleRemote: withHost });
        t.check(rowOf(G.grade(state, key), '4.2').parts[2] === 1 && state.network.firewall.rules[0].remote[0] === sub, 'remote ' + withHost + ' canonicalised to ' + sub);
    }
    /* a file on TECH-USB that does not hold the current recovery password earns nothing */
    {
        const { state, key } = W.sitting('g45-usbwrong', [0, 0]); W.p1Gui(state, key); W.p23Gui(state, key); W.p45Gui(state, key, { noUsb: true });
        SH.exec(state, 'ps', 'Set-Content -Path F:\\key.txt -Value "123456-123456-123456-123456-123456-123456-123456-123456"', { key });
        t.check(rowOf(G.grade(state, key), '5.2').parts[4] === 0, 'a wrong recovery password on F: earns nothing');
        const pw = state.bitlocker.C.protectors.find((p) => p.type === 'RecoveryPassword').password;
        SH.exec(state, 'ps', 'Set-Content -Path F:\\key.txt -Value "' + pw.split('-').join('') + '"', { key });
        t.check(rowOf(G.grade(state, key), '5.2').parts[4] === 1, 'the current recovery password typed without dashes earns the part');
    }
    /* the WO share with Everyone Full is graded by 4.4, not penalised */
    {
        const r = run('g45-wofull', 0, { keepEveryone: true });
        W.A(r.state, 'explorer', 'share-perm', { name: r.state.wo.share.name, principal: 'Everyone', right: 'Full' });
        const g = G.grade(r.state, r.key);
        t.check(!g.penalties.find((p) => p.id === 'P4-everyone-full').applied && rowOf(g, '4.4').parts[1] === 0, 'Everyone Full on the WO share: 4.4 part, no extra penalty');
    }
    /* Advanced Sharing default permission is Everyone Read */
    {
        const r = run('g45-default', 0, { keepEveryone: true });
        const sh = r.state.network.shares.find((x) => x.name === r.state.wo.share.name);
        t.check(sh.perms.some((p) => p.principal === 'Everyone' && p.right === 'Read'), 'a new share starts with Everyone Read');
    }
    /* a Deny entry wins over an Allow */
    {
        const r = run('g45-deny', 0, {});
        W.A(r.state, 'explorer', 'security-grant', { path: r.state.wo.confidentialPath, principal: r.state.wo.group, rights: 'Read', type: 'Deny' });
        t.check(rowOf(G.grade(r.state, r.key), '5.3').parts[2] === 0, 'Deny Read for the group removes its Read & execute');
    }
    /* Shrink stops at Windows' used space; a mirror holds half the pool */
    {
        const r = run('g45-shrink', 0, {});
        const c = r.state.disks.find((d) => d.role === 'os').partitions.find((p) => p.letter === 'C');
        t.check(!GUI.act(r.state, 'diskmgmt', 'shrink', { letter: 'C', shrinkMB: c.mb - 29 * 1024 }).ok && GUI.act(r.state, 'diskmgmt', 'shrink', { letter: 'C', shrinkMB: c.mb - 31 * 1024 }).ok, 'C: shrinks to 31 GB but not to 29 GB');
        const m = run('g45-mirror', 0, {}, undefined);
        const sp = m.state.pool.space, raw = m.state.wo.disks.poolGB * 2;
        t.check(sp.gb === (sp.resiliency === 'Simple' ? raw : raw / 2), 'space capacity: Simple = pool, mirror = half (' + sp.resiliency + ', ' + sp.gb + ' GB)');
    }
    /* BitLocker needs a TPM: a Gen2 VM installed with BypassTPMCheck cannot start it */
    {
        const { state, key } = W.sitting('g45-notpm', [0, 0]);
        W.p1Gui(state, key, { vtpm: false, labConfig: ['BypassTPMCheck'] }); W.p23Gui(state, key);
        const r = GUI.act(state, 'bitlocker', 'turn-on', { saveTo: 'F:\\' }, { key });
        t.check(!r.ok && r.msg.indexOf('Trusted Platform Module') >= 0, 'no vTPM: BitLocker refused with the TPM policy message (1.1 knock-on)');
    }
    /* each new protector takes the next hidden slot */
    {
        const { state, key } = W.sitting('g45-slots', [0, 0]); W.p1Gui(state, key);
        SH.exec(state, 'ps', 'manage-bde -protectors -add C: -rp', { key });
        SH.exec(state, 'ps', 'manage-bde -protectors -add C: -rp', { key });
        const rp = state.bitlocker.C.protectors.filter((p) => p.type === 'RecoveryPassword');
        t.check(rp.length === 2 && rp[0].password === key.bitlocker.passwords[0] && rp[1].password === key.bitlocker.passwords[1] && rp[1].id === key.bitlocker.ids[1], 'second protector takes slot 1');
    }
    /* the console IP path: Set-DnsClientServerAddress then New-NetIPAddress gives the full 4.1 */
    {
        const { state, key } = W.sitting('g45-ps-ip', [0, 0]); W.p1Gui(state, key);
        const n = state.wo.network;
        SH.exec(state, 'ps', 'Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses ' + n.dns.join(','), { key });
        SH.exec(state, 'ps', 'New-NetIPAddress -InterfaceAlias Ethernet -IPAddress ' + n.ip + ' -PrefixLength ' + n.prefix + ' -DefaultGateway ' + n.gateway, { key });
        t.check(JSON.stringify(rowOf(G.grade(state, key), '4.1').parts) === '[1,1,1,1,1]', 'console IP configuration earns 4.1 in full');
        t.check(SH.exec(state, 'ps', 'ipconfig /all', { key }).out.indexOf('DHCP Enabled. . . . . . . . . . . : No') >= 0, 'ipconfig /all reflects the static address');
    }
}

/* ── 6. Nancy D4 R2: grading defects and coverage gaps ── */
{
    const P = (uid, prof, o45, o23) => full(uid, prof, o45, o23);
    const g42 = (st, k) => JSON.stringify(rowOf(G.grade(st, k), '4.2').parts);
    const addRule = (st, o) => W.A(st, 'wf', 'rule-new', Object.assign({ name: 'R' + Math.random().toString(36).slice(2, 7), direction: 'Inbound', action: 'Allow', protocol: 'TCP',
        localPort: String(st.wo.lob.port), profile: 'Domain,Private', remoteAddress: st.wo.network.lobRemoteSubnet }, o));
    /* A2: one rule earns every part */
    {
        const r = P('n2-split', 0, { skipRule: true });
        addRule(r.state, { remoteAddress: 'Any' }); addRule(r.state, { profile: 'Any' });
        t.check(g42(r.state, r.key) === '[1,0,1,1]', 'two half-right rules do not add up: only the better single rule counts (' + g42(r.state, r.key) + ')');
    }
    for (const [label, o] of [['disabled', { enabled: false }], ['outbound', { direction: 'Outbound' }], ['any port', { localPort: 'Any' }]]) {
        const r = P('n2-' + label, 0, { skipRule: true }); addRule(r.state, o);
        t.check(g42(r.state, r.key) === '[0,0,0,1]', 'a ' + label + ' rule earns nothing (' + g42(r.state, r.key) + ')');
    }
    {
        const r = P('n2-block', 0, {}); addRule(r.state, { action: 'Block', profile: 'Any', remoteAddress: 'Any' });
        t.check(g42(r.state, r.key) === '[0,0,0,1]', 'an enabled Block rule on the port voids the Allow rule');
    }
    {
        /* knock-on 4.1 -> 4.2: a joined PC whose DNS stops pointing at the DC loses DomainAuthenticated */
        const r = P('n2-dns', 0, {});
        W.A(r.state, 'ncpa', 'ipv4', { dns1: '8.8.8.8', dns2: '8.8.4.4' });
        const g = G.grade(r.state, r.key);
        t.check(JSON.stringify(rowOf(g, '4.2').parts) === '[1,1,1,0]' && CH.CHECKS.find((x) => x.id === '4.2').knockOn.includes('4.1'), 'DNS broken after the join: 4.2 category lost, declared as a 4.1 knock-on');
    }
    /* A1: 5.3 and 4.4 as a member sees them */
    {
        const r = P('n1-deny', 0, { keepUsers: true });
        W.A(r.state, 'explorer', 'security-remove', { path: r.state.wo.confidentialPath, principal: 'Users' });
        W.A(r.state, 'explorer', 'security-grant', { path: r.state.wo.confidentialPath, principal: 'Users', rights: 'FullControl', type: 'Deny' });
        t.check(rowOf(G.grade(r.state, r.key), '5.3').parts[2] === 0, 'Deny Users Full: the group\'s members get nothing, so no Read & execute part');
        const au = P('n1-au', 0, { keepUsers: true, inheritMode: 'convert' });
        t.check(JSON.stringify(rowOf(au.g, '5.3').parts) === '[1,0,1]', 'Users left with Read: [1,0,1]');
        const ntfs = P('n1-ntfs', 0, {});
        W.A(ntfs.state, 'explorer', 'security-grant', { path: ntfs.state.wo.share.path, principal: ntfs.state.wo.group, rights: 'Write', type: 'Deny' });
        t.check(rowOf(G.grade(ntfs.state, ntfs.key), '4.4').parts[3] === 0, 'NTFS side of share-and-NTFS: Deny Write on the folder drops effective Modify');
        const ff = P('n1-full', 0, { shareRight: 'Full' });
        W.A(ff.state, 'explorer', 'security-grant', { path: ff.state.wo.share.path, principal: ff.state.wo.group, rights: 'FullControl' });
        t.check(rowOf(G.grade(ff.state, ff.key), '4.4').parts[3] === 0 && rowOf(G.grade(ff.state, ff.key), '4.4').parts[2] === 1, 'Full share + Full NTFS: share part earned, effective is Full not Modify');
    }
    /* A3/A4: list arguments with spaces; netsh case */
    {
        const { state, key } = W.sitting('n3', [0, 0]); W.p1Gui(state, key);
        const n = state.wo.network;
        SH.exec(state, 'ps', 'Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses ' + n.dns[0] + ', ' + n.dns[1], { key });
        t.check(JSON.stringify(state.network.adapters.Ethernet.dns) === JSON.stringify(n.dns), '-ServerAddresses a, b keeps both servers');
        SH.exec(state, 'ps', 'netsh advfirewall firewall add rule name=Blk dir=Out action=Block protocol=TCP localport=99', { key });
        const rl = state.network.firewall.rules.find((x) => x.name === 'Blk');
        t.check(rl && rl.direction === 'Outbound' && rl.action === 'Block', 'netsh values are case-insensitive');
        t.check(SH.exec(state, 'ps', 'New-NetFirewallRule -DisplayName P2 -Direction Inbound -Protocol TCP -LocalPort 1 -Action Allow -Profile Domain, Private', { key }).out === '' &&
            JSON.stringify(state.network.firewall.rules.find((x) => x.name === 'P2').profiles) === '["Domain","Private"]', '-Profile Domain, Private accepted');
    }
    /* A6: Home and Home N both lack the RDP host */
    {
        const h = W.sitting('n6', [0, 0]); W.defaultInstalledState(h.state);
        SH.exec(h.state, 'ps', 'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f');
        t.check(rowOf(G.grade(h.state, h.key), '4.3').parts[0] === 0, 'Home: RDP host part not earnable even through the registry');
        h.state.os.edition = 'Home N';
        t.check(rowOf(G.grade(h.state, h.key), '4.3').parts[0] === 0, 'Home N treated like Home');
    }
    /* 4.4 share path; 5.1 formats and letters; 5.2 protector parts; 5.3 gates; 5.4 exactly */
    {
        const r = P('c-wrongpath', 0, { skipShare: true });
        W.A(r.state, 'explorer', 'new-folder', { path: 'D:\\Other' });
        W.A(r.state, 'explorer', 'share', { path: 'D:\\Other', name: r.state.wo.share.name });
        t.check(JSON.stringify(rowOf(G.grade(r.state, r.key), '4.4').parts) === '[0,0,0,0]', 'right share name on the wrong folder earns nothing');
    }
    {
        const r = P('c-refs', 0, { skipD: true });
        W.A(r.state, 'diskmgmt', 'new-volume', { disk: W.osDisk(r.state).n, letter: 'D', fs: 'ReFS', label: r.state.wo.disks.dLabel });
        t.check(rowOf(G.grade(r.state, r.key), '5.1').parts[1] === 0, 'D: formatted ReFS loses the NTFS part');
    }
    {
        const { state, key } = W.sitting('c-space', [0, 0]); W.p1Gui(state, key); W.p23Gui(state, key);
        W.p45Gui(state, key, { skipPool: true });
        const pools = state.disks.filter((d) => d.role === 'pool').map((d) => d.n);
        W.A(state, 'storagespaces', 'pool-new', { name: 'P', disks: pools });
        const other = ['P', 'S', 'V'].find((l) => l !== state.wo.disks.spacesLetter);
        W.A(state, 'storagespaces', 'space-new', { name: 'S', resiliency: key.resiliency, letter: other, fs: 'ReFS', label: state.wo.disks.spacesLabel });
        t.check(rowOf(G.grade(state, key), '5.1').parts[4] === 0, 'storage space on the wrong letter / ReFS loses the spaces part');
    }
    {
        const { state, key } = W.sitting('c-tpmonly', [0, 0]); W.p1Gui(state, key); W.p23Gui(state, key);
        W.p45Gui(state, key, { skipBitLocker: true });
        SH.exec(state, 'ps', 'manage-bde -on C: -em xts_aes256', { key }); W.A(state, 'desktop', 'restart', {});
        t.check(JSON.stringify(rowOf(G.grade(state, key), '5.2').parts) === '[1,1,1,0,0]', 'manage-bde -on without -rp: no recovery password, nothing on TECH-USB');
        SH.exec(state, 'ps', 'manage-bde -protectors -add C: -rp', { key });
        const tpm = state.bitlocker.C.protectors.find((p) => p.type === 'Tpm');
        SH.exec(state, 'ps', 'manage-bde -protectors -delete C: -id {' + tpm.id + '}', { key });
        t.check(JSON.stringify(rowOf(G.grade(state, key), '5.2').parts) === '[1,1,0,1,0]', 'TPM protector deleted: TPM part lost');
        const made = state.bitlocker.C.made;
        SH.exec(state, 'ps', 'manage-bde -protectors -add C: -tpm', { key });
        t.check(state.bitlocker.C.protectors.find((p) => p.type === 'Tpm').id === key.bitlocker.ids[made], 'a re-added protector takes the next slot, never a removed one');
    }
    {
        const { state, key } = W.sitting('c-notpm-restart', [0, 0]); W.p1Gui(state, key);
        SH.exec(state, 'ps', 'manage-bde -on C: -RecoveryPassword', { key });
        const tpm = state.bitlocker.C.protectors.find((p) => p.type === 'Tpm');
        SH.exec(state, 'ps', 'manage-bde -protectors -delete C: -id {' + tpm.id + '}', { key });
        W.A(state, 'desktop', 'restart', {});
        t.check(state.bitlocker.C.status === 'off', 'TPM protector removed before the hardware test: encryption does not start');
    }
    for (const who of ['Administrators', 'SYSTEM']) {
        const r = P('c-gate-' + who, 0, {});
        W.A(r.state, 'explorer', 'security-remove', { path: r.state.wo.confidentialPath, principal: who });
        t.check(JSON.stringify(rowOf(G.grade(r.state, r.key), '5.3').parts) === '[0,0,0]', who + ' removed: 5.3 gate scores 0');
    }
    {
        const r = P('c-ex2', 0, {});
        W.A(r.state, 'defender', 'exclusion-add', { path: 'D:\\Extra' });
        t.check(rowOf(G.grade(r.state, r.key), '5.4').parts[1] === 0, 'a second exclusion breaks "exactly the WO path"');
        W.A(r.state, 'defender', 'exclusion-remove', { path: 'D:\\Extra' });
        W.A(r.state, 'defender', 'exclusion-add', { path: '%ProgramData%\\Lab' });
        t.check(r.state.defender.exclusions.includes('C:\\ProgramData\\Lab'), '%ProgramData% expands in exclusions');
    }
    /* P4-everyone-full only for Full; archive damage through Disk Management; pool including the archive */
    {
        const r = P('c-pen', 0, {});
        W.A(r.state, 'explorer', 'new-folder', { path: 'D:\\T2' }); W.A(r.state, 'explorer', 'share', { path: 'D:\\T2', name: 'T2' });
        W.A(r.state, 'explorer', 'share-perm', { name: 'T2', principal: 'Everyone', right: 'Change' });
        t.check(!G.grade(r.state, r.key).penalties.find((p) => p.id === 'P4-everyone-full').applied, 'Everyone Change on another share is not the Full penalty');
    }
    {
        const r = P('c-archive', 0, { skipPool: true });
        W.A(r.state, 'diskmgmt', 'delete-volume', { letter: 'E' });
        const arch = r.state.disks.find((d) => d.role === 'archive');
        W.X(r.state, 'ps', 'Get-Disk');
        arch.partitions = [];
        const pools = r.state.disks.filter((d) => d.role === 'pool').map((d) => d.n);
        W.A(r.state, 'storagespaces', 'pool-new', { name: 'P', disks: pools.concat([arch.n]) });
        W.A(r.state, 'storagespaces', 'space-new', { name: 'S', resiliency: r.key.resiliency, letter: r.state.wo.disks.spacesLetter, fs: 'NTFS', label: r.state.wo.disks.spacesLabel });
        const g = G.grade(r.state, r.key);
        t.check(g.penalties.find((p) => p.id === 'P1-archive').applied && rowOf(g, '5.1').parts[2] === 0, 'archive deleted in Disk Management and pooled: archive penalty and pool part lost');
    }
    {
        const { state, key } = W.sitting('c-netshare', [0, 0]); W.p1Gui(state, key); W.p23Gui(state, key);
        W.A(state, 'diskmgmt', 'new-volume', { disk: W.osDisk(state).n });
        t.check(state.disks.some((d) => d.partitions.some((p) => p.letter === 'D')), 'GUI New Simple Volume defaults to D:');
        W.A(state, 'explorer', 'new-folder', { path: 'D:\\NS' });
        SH.exec(state, 'ps', 'net share NS=D:\\NS /grant:' + state.wo.group + ',CHANGE', { key });
        const sh = state.network.shares.find((x) => x.name === 'NS');
        t.check(sh && sh.perms.length === 1 && sh.perms[0].right === 'Change', 'net share /grant:G,CHANGE parsed');
    }
    /* realism additions: decrypt, gpedit, icacls switches and rights, pipeline */
    {
        const { state, key } = W.sitting('c-decrypt', [0, 0]); W.p1Gui(state, key); W.p23Gui(state, key);
        W.p45Gui(state, key, { noPolicy: true });
        t.check(rowOf(G.grade(state, key), '5.2').parts[0] === 0, 'wizard without policy: XTS-AES 128');
        W.A(state, 'bitlocker', 'turn-off', {}, { key });
        W.A(state, 'gpedit', 'fve-os-method', { method: 'XTS-AES 256' });
        GUI.act(state, 'bitlocker', 'turn-on', { saveTo: 'F:\\', backup: 'file', runSystemCheck: true }, { key });
        W.A(state, 'desktop', 'restart', {});
        t.check(JSON.stringify(rowOf(G.grade(state, key), '5.2').parts) === '[1,1,1,1,1]', 'decrypt, set the method in gpedit, re-encrypt: 5.2 full');
    }
    {
        const r = P('c-icacls', 0, { skipConf: true });
        const c = r.state.wo.confidentialPath;
        const o = (l) => SH.exec(r.state, 'ps', l, { key: r.key }).out;
        t.check(o('icacls ' + c + ' /inheritance:d /T /C /Q').indexOf('Successfully processed 1') >= 0, 'icacls /T /C /Q accepted');
        t.check(o('icacls ' + c + ' /grant ".\\' + r.state.wo.group + ':(OI)(CI)(R,X)"').indexOf('Successfully processed 1') >= 0, 'icacls .\\Group and (R,X)');
        t.check(o('icacls ' + c + ' /grant "Users:N"').indexOf('Successfully processed 1') >= 0, 'icacls N (no access) accepted');
    }
    {
        const { state, key } = W.sitting('c-pipe', [0, 0]); W.p1Gui(state, key); W.p23Gui(state, key);
        const pools = state.disks.filter((d) => d.role === 'pool');
        SH.exec(state, 'ps', 'Initialize-Disk -Number ' + pools[0].n, { key });
        const out = SH.exec(state, 'ps', 'New-Partition -DiskNumber ' + pools[0].n + ' -UseMaximumSize -DriveLetter T | Format-Volume -FileSystem NTFS -NewFileSystemLabel Tmp', { key }).out;
        t.check(out === '' && state.disks.some((d) => d.partitions.some((p) => p.letter === 'T' && p.fs === 'NTFS' && p.label === 'Tmp')), 'New-Partition | Format-Volume');
        t.check(SH.exec(state, 'ps', 'Enable-BitLocker -MountPoint C: -TpmProtector -RecoveryPasswordProtector', { key }).out.indexOf('Parameter set') >= 0, 'Enable-BitLocker with both protector switches refused');
        t.check(SH.exec(state, 'ps', 'Enable-BitLocker -MountPoint C: -RecoveryPasswordProtector', { key }).out.indexOf('TPM protector') >= 0 && !state.bitlocker.C.protectors.length, 'recovery-password-only start refused up front');
    }
}

/* ── 6b. the last three D4 mutation survivors ── */
{
    const r = full('g6-users-deny', 0, {});
    W.A(r.state, 'explorer', 'security-grant', { path: r.state.wo.share.path, principal: 'Users', rights: 'Write', type: 'Deny' });
    t.check(rowOf(G.grade(r.state, r.key), '4.4').parts[3] === 0, 'Deny Write for Users on the shared folder: members lose effective Modify over the share');
    const { state, key } = W.sitting('g6-wiz', [0, 0]); W.p1Gui(state, key);
    SH.exec(state, 'ps', 'manage-bde -protectors -add C: -tpm', { key });
    const w = GUI.act(state, 'bitlocker', 'turn-on', { saveTo: 'F:\\', backup: 'file', runSystemCheck: false }, { key });
    t.check(w.ok && state.bitlocker.C.protectors.filter((p) => p.type === 'Tpm').length === 1, 'the wizard reuses an existing TPM protector');
    W.A(state, 'bitlocker', 'turn-off', {}, { key });
    t.check(state.bitlocker.C.status === 'off' && state.bitlocker.C.protectors.length === 0, 'decrypting removes every protector');
}

/* ── 6c. Nancy D4 re-check: remaining gaps ── */
{
    /* archive damage through Disk Management (delete and Format-Volume) is permanent evidence */
    for (const how of ['delete', 'format']) {
        const { state, key } = W.sitting('g6c-arch-' + how, [0, 0]); W.p1Gui(state, key);
        if (how === 'delete') W.A(state, 'diskmgmt', 'delete-volume', { letter: 'E' });
        else SH.exec(state, 'ps', 'Format-Volume -DriveLetter E -FileSystem NTFS -NewFileSystemLabel X', { key });
        W.A(state, 'desktop', 'restart', {}); W.A(state, 'hyperv', 'stop'); W.A(state, 'hyperv', 'delete-vm');
        W.p1Gui(state, key);
        t.check(G.grade(state, key).penalties.find((p) => p.id === 'P1-archive').applied, 'archive ' + how + ' in Windows, VM deleted and rebuilt: archive penalty kept');
    }
    /* the space's letter and its NTFS requirement, one at a time */
    for (const [label, change] of [['wrong letter', (s) => ({ letter: ['P', 'S', 'V'].find((l) => l !== s.wo.disks.spacesLetter), fs: 'NTFS' })],
        ['ReFS', (s) => ({ letter: s.wo.disks.spacesLetter, fs: 'ReFS' })]]) {
        const { state, key } = W.sitting('g6c-sp-' + label, [0, 0]); W.p1Gui(state, key); W.p23Gui(state, key);
        W.p45Gui(state, key, { skipPool: true });
        W.A(state, 'storagespaces', 'pool-new', { name: 'P', disks: state.disks.filter((d) => d.role === 'pool').map((d) => d.n) });
        const c = change(state);
        W.A(state, 'storagespaces', 'space-new', { name: 'S', resiliency: key.resiliency, letter: c.letter, fs: c.fs, label: state.wo.disks.spacesLabel });
        t.check(JSON.stringify(rowOf(G.grade(state, key), '5.1').parts) === '[1,1,2,2,0]', 'space with ' + label + ' only: [1,1,2,2,0]');
    }
    /* Block rules that do not apply to inbound TCP on the port leave 4.2 alone */
    const addR = (st, o) => W.A(st, 'wf', 'rule-new', Object.assign({ name: 'B' + Math.random().toString(36).slice(2, 6), direction: 'Inbound', action: 'Block', protocol: 'TCP',
        localPort: String(st.wo.lob.port), profile: 'Any', remoteAddress: 'Any' }, o));
    for (const [label, o] of [['disabled', { enabled: false }], ['outbound', { direction: 'Outbound' }], ['UDP', { protocol: 'UDP' }]]) {
        const r = full('g6c-blk-' + label, 0, {}); addR(r.state, o);
        t.check(JSON.stringify(rowOf(G.grade(r.state, r.key), '4.2').parts) === '[1,1,1,1]', 'a ' + label + ' Block rule does not void the LedgerSync rule');
    }
    {
        const { state, key } = W.sitting('g6c-multi', [0, 0]); W.p1Gui(state, key); W.p23Gui(state, key);
        W.p45Gui(state, key, { ruleRemote: state.wo.network.lobRemoteSubnet + ',10.9.9.0/24' });
        t.check(rowOf(G.grade(state, key), '4.2').parts[2] === 0, 'a rule open to the WO subnet and another subnet does not earn the remote part');
    }
    {
        /* either-rule corner: join effective, DC unreachable, category set to Private by hand: no category part */
        const r = full('g6c-either', 0, {});
        W.A(r.state, 'ncpa', 'ipv4', { dns1: '8.8.8.8', dns2: '8.8.4.4' });
        W.A(r.state, 'settings', 'net-profile', { category: 'Private' });
        t.check(rowOf(G.grade(r.state, r.key), '4.2').parts[3] === 0, 'joined PC that lost its DC: Private by hand is not the either-rule');
    }
    {
        const r = full('g6c-n', 0, { skipConf: true });
        const out = SH.exec(r.state, 'ps', 'icacls ' + r.state.wo.confidentialPath + ' /grant "' + r.state.wo.group + ':(OI)(CI)N"', { key: r.key }).out;
        t.check(out.indexOf('Successfully processed 1') >= 0, 'icacls G:(OI)(CI)N accepted');
    }
}

/* ── 7. knock-on declarations, derived: every row that moves under an upstream break declares it ── */
{
    const BREAKS = [
        ['no D:', '5.1', {}, { skipD: true }],
        ['whole-disk Setup layout', '1.3', { autoLayout: true }, {}],
        ['no vTPM (BypassTPMCheck)', '1.1', { vtpm: false, labConfig: ['BypassTPMCheck'] }, {}],
        ['WO group missing', '3.1', {}, {}, { skipGroup: true }],
        ['WO user missing', '3.1', {}, {}, { skipUser: true }]
    ];
    for (const [label, broken, o1, o45, o23] of BREAKS) {
        for (const prof of [0, 2]) {
            const ref = full('ko-ref-' + prof, prof).g;
            const { state, key } = W.sitting('ko-ref-' + prof, [prof, 0]);
            let g;
            try { W.p1Gui(state, key, o1); W.p23Gui(state, key, o23 || {}); W.p45Gui(state, key, Object.assign({ lenient: true }, o45)); g = G.grade(state, key); }
            catch (e) { t.check(false, 'knock-on probe ' + label + ' threw: ' + e.message.slice(0, 120)); continue; }
            const moved = ROWS.filter((id) => !near(rowOf(g, id).score, rowOf(ref, id).score) && id !== broken);
            const undeclared = moved.filter((id) => !CH.CHECKS.find((x) => x.id === id).knockOn.includes(broken));
            t.check(undeclared.length === 0, 'break ' + label + ' (profile ' + prof + '): moved ' + JSON.stringify(moved) + ' all declare ' + broken + (undeclared.length ? ' (undeclared: ' + undeclared.join(',') + ')' : ''));
        }
    }
}

t.done();
