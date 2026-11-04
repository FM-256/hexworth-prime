#!/usr/bin/env node
/**
 * mdfinal-r2.test.js — Mallory D3 (R2) findings, each pinned: prototype-name creates, nested
 * groups, session-state lifetime, Add-Computer atomicity, history masking, and one assertion per
 * surviving mutant of her round (A/B'd or listed).
 *
 * @catalog what    Regression suite for the D3 R2 audit of the MD-100 final consoles and registry:
 * @catalog what    F1-F6 and the mutation survivors, plus adversarial filler for every R3 cap.
 * @catalog run     node _tools/mdfinal/mdfinal-r2.test.js
 * @catalog status  TOOL
 */
const kit = require('./mdfinal-test-kit.js');
const W = require('./mdfinal-walk.js');
const G = kit.req('mdfinal-grade.js');
const GUI = kit.req('mdfinal-gui.js');
const SH = kit.req('mdfinal-shell.js');
const OS = kit.req('mdfinal-os.js');
const REG = kit.req('mdfinal-registry.js');
const MATCH = kit.req('mdfinal-match.js');
const CMD = kit.req('mdfinal-cmdlets.js');
const LIM = kit.req('mdfinal-limits.js');
const t = kit.harness('mdfinal-r2');
const OBJ = LIM.LIMITS.objects;

/* One graded row by id. */
const rowOf = (g, id) => g.rows.find((r) => r.id === id);
/* A sitting with the canonical P1 build done. */
const fresh = (uid, prof) => { const { state, key } = W.sitting(uid, [prof || 0, 0]); W.p1Gui(state, key); return { state, key }; };
/* One desktop-console line, its output. */
const ps = (s, line) => SH.exec(s, 'ps', line).out;

/* ── F1: prototype names on every create path ── */
for (const n of ['__proto__', 'constructor', 'prototype', '__PROTO__', 'Constructor']) {
    const { state } = fresh('f1-' + n);
    const users0 = Object.keys(state.identity.users).length, members0 = state.identity.groups.Users.members.length;
    let threw = null;
    try {
        ps(state, 'New-LocalUser -Name ' + n + ' -NoPassword');
        ps(state, 'net user ' + n + ' x /add');
        ps(state, 'New-LocalGroup -Name ' + n);
        ps(state, 'net localgroup ' + n + ' /add');
        GUI.act(state, 'lusrmgr', 'user-new', { name: n });
        GUI.act(state, 'lusrmgr', 'group-new', { name: n });
    } catch (e) { threw = e.message; }
    t.check(!threw, 'creating ' + n + ' never throws' + (threw ? ': ' + threw : ''));
    t.check(Object.getPrototypeOf(state.identity.users) === Object.prototype && Object.getPrototypeOf(state.identity.groups) === Object.prototype, n + ': account maps keep their prototype');
    t.check(Object.keys(state.identity.users).length === users0 && state.identity.groups.Users.members.length === members0, n + ': nothing created, Users unchanged');
}
{
    const { state } = fresh('f1-loop');
    for (let i = 0; i < 40; i++) ps(state, 'net user __proto__ x /add');
    t.check(state.ledger.length < 100 && state.identity.groups.Users.members.length < 5, 'repeated __proto__ adds: no ledger or member growth');
}

/* ── F2: local groups cannot be nested; invented domain principals are refused ── */
{
    const { state, key } = fresh('f2', 0);
    W.p23Gui(state, key, {});
    const before = G.grade(state, key);
    const out = ps(state, 'Add-LocalGroupMember -Group Administrators -Member ' + state.wo.group);
    const g = G.grade(state, key);
    t.check(out.indexOf('wrong account type') >= 0 && !state.identity.groups.Administrators.members.includes(state.wo.group), 'nesting the WO group into Administrators is refused');
    t.check(!GUI.act(state, 'lusrmgr', 'group-add', { group: 'Administrators', member: 'Users' }).ok, 'GUI nesting refused');
    t.check(ps(state, 'net localgroup Administrators ' + state.wo.group + ' /add').indexOf('wrong account type') >= 0, 'net localgroup nesting refused');
    t.check(rowOf(g, '3.1').score === rowOf(before, '3.1').score && g.phases.P3.score === 10, 'refusal leaves P3 untouched');
    t.check(ps(state, 'Add-LocalGroupMember -Group Administrators -Member MERIDIAN\\ghost').indexOf('not found') >= 0, 'invented MERIDIAN principal refused');
    t.check(ps(state, 'Add-LocalGroupMember -Group "Remote Desktop Users" -Member "MERIDIAN\\Domain Users"') === '' , 'a real domain group can be added to a local group');
}

/* ── F4: console session state does not outlive the session ── */
{
    const { state } = W.sitting('f4', [0, 0]);
    W.A(state, 'hyperv', 'new-vm', { name: 'V', generation: 2, memoryMB: 8192, vhdxGB: 160, iso: 'Win11_24H2_Business_x64.iso' });
    W.A(state, 'vm-settings', 'apply', { vcpu: 2, vtpm: true });
    W.A(state, 'hyperv', 'start');
    const arch = state.disks.find((d) => d.role === 'archive');
    W.X(state, 'setup-cmd', 'diskpart'); W.X(state, 'setup-cmd', 'select disk ' + arch.n); W.X(state, 'setup-cmd', 'select partition 2');
    W.A(state, 'hyperv', 'stop'); W.A(state, 'hyperv', 'start');
    const r = SH.exec(state, 'setup-cmd', 'delete partition');
    t.check(r.prompt !== 'DISKPART> ' && !state.archiveDamage, 'restart ends the diskpart session: no stale selection, no damage');
    W.X(state, 'setup-cmd', 'diskpart');
    t.check(SH.exec(state, 'setup-cmd', 'delete partition').out.indexOf('no partition selected') >= 0, 'a new diskpart session starts with nothing selected');
}
{
    const { state } = fresh('f4p');
    ps(state, 'New-LocalUser -Name pend1');
    SH.exec(state, 'hyperv-ps', 'Get-VM');
    t.check(ps(state, 'Restart-Computer') === '' && !state.identity.users.pend1, 'switching console cancels a pending prompt; the next line runs as a command');
    ps(state, 'New-LocalUser -Name pend2');
    GUI.act(state, 'desktop', 'restart', {});
    ps(state, 'hostname');
    t.check(!state.identity.users.pend2 && !state.shell.pending, 'a restart cancels a pending prompt');
}

/* ── F5: Add-Computer is atomic; names validated as entered ── */
{
    const { state } = fresh('f5', 0);
    ps(state, 'Add-Computer -DomainName meridian.local -Credential ' + W.JOIN_USER + ' -NewName MERWS-912-ZZZZZZZ');
    const out = ps(state, W.JOIN_PW);
    t.check(out.indexOf('cannot be longer than 15') >= 0 && !state.os.hostname.pending && !state.identity.membership.pending, 'Add-Computer -NewName over 15 characters refused, nothing changes');
    ps(state, 'Add-Computer -DomainName meridian.local -Credential ' + W.JOIN_USER + ' -NewName MERWS-NEW');
    const fails = ps(state, W.JOIN_PW);
    t.check(fails.indexOf('could not be contacted') >= 0 && !state.os.hostname.pending, 'a failed join (no DNS) leaves no pending rename');
    const wg = GUI.act(state, 'sysprops', 'join', { type: 'workgroup', name: 'STRAßE' });
    t.check(!wg.ok && state.identity.membership.pending === null, 'non-ASCII workgroup name refused before upper-casing');
    t.check(ps(state, 'Add-Computer -DomainName contoso.example -Credential ' + W.JOIN_USER) && ps(state, W.JOIN_PW).indexOf('does not exist or could not be contacted') >= 0 && !state.identity.membership.pending, 'a different domain name never joins meridian.local');
}

/* ── F6: secrets masked in history; group delete; registry tree and shadowing ── */
{
    const { state } = fresh('f6');
    ps(state, 'net user carol Sup3r-S3cret /add');
    ps(state, 'net user carol N3w-S3cret');
    const hist = JSON.stringify(state.shell.history);
    t.check(hist.indexOf('Sup3r-S3cret') < 0 && hist.indexOf('N3w-S3cret') < 0 && hist.indexOf('net user carol ********') >= 0, 'net user passwords masked in history');
    ps(state, 'net localgroup Temp /add');
    t.check(ps(state, 'net localgroup Temp /delete').indexOf('completed successfully') >= 0 && !state.identity.groups.Temp, 'net localgroup <g> /delete deletes the group');
    t.check(ps(state, 'net localgroup Administrators /delete').indexOf('built-in') >= 0 && state.identity.groups.Administrators, 'built-in groups cannot be deleted');
    t.check(ps(state, 'Get-ItemProperty -Path HKLM:\\SOFTWARE\\Microsoft').indexOf('does not exist') < 0, 'ancestors of default keys exist');
    t.check(ps(state, 'New-Item -Path HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\LabTest') === '', 'New-Item under CurrentVersion works');
    t.check(ps(state, 'Get-ItemProperty -Path HKLM:/SOFTWARE/Microsoft/Windows/CurrentVersion/Policies/System').indexOf('ConsentPromptBehaviorAdmin') >= 0, 'forward-slash registry paths accepted');
    ps(state, 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v ConsentPromptBehaviorAdmin /t REG_SZ /d 2 /f');
    const q = ps(state, 'Get-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" -Name ConsentPromptBehaviorAdmin');
    t.check(q.indexOf(': 5') >= 0 && q.split('ConsentPromptBehaviorAdmin').length === 2, 'an inert value never shadows the modelled one');
    const l0 = state.ledger.length;
    for (let i = 0; i < 30; i++) ps(state, 'tzutil /s UTC');
    t.check(state.ledger.length - l0 <= 1, 'repeating a no-op time zone change does not fill the ledger');
}

/* ── F3: one assertion per mutation survivor ── */
{
    const { state } = fresh('f3', 0);
    W.ipv4(state, {});
    /* cu-checked, cu-win11, cu-dup */
    t.check(!GUI.act(state, 'settings', 'update-install', {}).ok && state.os.updates.pendingRestart.length === 0, 'install without checking first is refused');
    W.A(state, 'settings', 'update-check', {}); W.A(state, 'settings', 'update-install', {}); W.A(state, 'settings', 'update-install', {});
    t.check(state.os.updates.pendingRestart.length === 1, 'installing twice stages one update');
    /* uac-level-own, del-uac-default */
    t.check(!OS.setUacLevel(state, 'toString').ok && !OS.setUacLevel(state, '__proto__').ok && !OS.setUacLevel(state, 5).ok, 'UAC level lookup is own-key and range-checked');
    W.A(state, 'uac', 'set', { level: 4 });
    ps(state, 'reg delete "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v ConsentPromptBehaviorAdmin /f');
    t.check(state.identity.uac.ConsentPromptBehaviorAdmin === 5, 'deleting ConsentPromptBehaviorAdmin restores the Windows default 5');
    /* acct-valid, pw-len */
    t.check(ps(state, 'net user "a/b" x /add').indexOf('System error') >= 0 && !state.identity.users['a/b'], 'reserved character in a user name refused');
    t.check(!GUI.act(state, 'lusrmgr', 'user-new', { name: 'x'.repeat(21) }).ok, '21-character user name refused');
    t.check(!OS.newUser(state, { name: 'pwlong', password: 'p'.repeat(128) }).ok, '128-character password refused');
    /* join-wg-valid, join-leave, join-already */
    t.check(!GUI.act(state, 'sysprops', 'join', { type: 'workgroup', name: 'BAD NAME' }).ok, 'invalid workgroup name refused');
    W.A(state, 'sysprops', 'join', { type: 'domain', name: 'meridian.local', user: W.JOIN_USER, password: W.JOIN_PW });
    W.A(state, 'desktop', 'restart', {});
    t.check(!GUI.act(state, 'sysprops', 'join', { type: 'workgroup', name: 'OTHER' }).ok && state.identity.membership.type === 'domain', 'leaving the domain is refused (not modelled)');
    t.check(GUI.act(state, 'sysprops', 'join', { type: 'domain', name: 'meridian.local', user: W.JOIN_USER, password: W.JOIN_PW }).msg.indexOf('already joined') >= 0, 'joining again reports already joined');
    /* plan-name-len, timeout-range */
    t.check(!GUI.act(state, 'power', 'create-plan', { name: 'p'.repeat(65) }).ok || !OS.createPlan(state, { name: 'p'.repeat(65) }).ok, 'power plan name over 64 refused');
    t.check(ps(state, 'powercfg /change monitor-timeout-ac 1000').indexOf('Invalid Parameters') >= 0, 'timeout over 999 refused');
    /* ipv4-valid-mask */
    t.check(!GUI.act(state, 'ncpa', 'ipv4', { dhcp: false, ip: '10.1.2.3', mask: '255.0.255.0', gateway: '10.1.2.1', dns1: '10.1.2.10' }).ok, 'non-contiguous mask refused');
    /* types-enforce, canon-hive-HKEY_CU */
    t.check(ps(state, 'reg add "HKLM\\SOFTWARE\\Lab" /v x /t REG_WEIRD /d 1 /f').indexOf('Invalid syntax') >= 0, 'unknown registry type refused');
    t.check(REG.canonKey('HKEY_CURRENT_USER\\Software') === 'HKCU\\SOFTWARE' && REG.canonKey('HKCU:\\Software') === 'HKCU\\SOFTWARE', 'HKEY_CURRENT_USER and HKCU: aliases');
    /* rdp-default */
    t.check(ps(state, 'reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server" /v fDenyTSConnections').indexOf('0x1') >= 0, 'fDenyTSConnections defaults to 1');
    /* fve-range, wu-days-range, ah-range */
    ps(state, 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" /v DeferFeatureUpdatesPeriodInDays /t REG_DWORD /d 366 /f');
    ps(state, 'reg add "HKLM\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings" /v ActiveHoursStart /t REG_DWORD /d 24 /f');
    ps(state, 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\FVE" /v EncryptionMethodWithXtsOs /t REG_DWORD /d 8 /f');
    t.check(!(state.os.policies.wu && state.os.policies.wu.DeferFeatureUpdatesPeriodInDays === 366) && state.os.updates.activeHours.start !== 24 &&
        !(state.os.policies.fve && state.os.policies.fve.EncryptionMethodWithXtsOs === 8), 'out-of-range feature days, active hours and FVE method are inert');
    /* tok-no-single, split-ignores-quotes, empty-pipe, hyperv-own (+ setup/oobe tables) */
    t.check(ps(state, "Set-TimeZone -Id 'UTC'") === '' && state.os.timeZone === 'UTC', 'single-quoted argument');
    t.check(ps(state, 'Get-LocalUser | Where-Object Name -like "a|b"').indexOf('empty pipe') < 0, 'pipe inside quotes is data');
    let threw = null; let o;
    try { o = ps(state, 'Get-LocalUser |'); } catch (e) { threw = e.message; }
    t.check(!threw && o.indexOf('empty pipe') >= 0, 'trailing pipe refused without a crash');
    for (const n of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
        const a = SH.exec(state, 'hyperv-ps', n).out, b = SH.exec(state, 'ps', n).out;
        t.check(a.indexOf('is not recognized') >= 0 && b.indexOf('is not recognized') >= 0, 'command name ' + n + ' is not recognised (host and desktop)');
    }
    /* hist-cap, hist-slice */
    for (let i = 0; i < 260; i++) ps(state, 'hostname');
    ps(state, 'Get-LocalUser -Name ' + 'x'.repeat(420));
    t.check(state.shell.history.length === LIM.LIMITS.command.historyKept && state.shell.history.every((h) => h.length <= 200), 'history capped at ' + LIM.LIMITS.command.historyKept + ' lines of at most 200 characters');
    /* resume-pw-copy */
    ps(state, 'New-LocalUser -Name copytest'); ps(state, 'Pw-Should-Not-Stay');
    t.check(JSON.stringify(state).indexOf('Pw-Should-Not-Stay') < 0, 'the prompted password is not retained anywhere in state');
}
{
    /* match-q, match-ci, match-trailing-star, and budget charges for -eq, Sort-Object, numeric Where-Object */
    const b = () => MATCH.budget();
    t.check(MATCH.like('abc', 'a?c', b()).match && !MATCH.like('abc', 'a?', b()).match && MATCH.like('ABC', 'abc', b()).match && MATCH.like('abc', 'abc***', b()).match && !MATCH.like('abcd', 'abc', b()).match, '? wildcard, case-insensitive, trailing stars, exact length');
    const rows = []; for (let i = 0; i < 400; i++) rows.push({ Name: 'n'.repeat(400), N: i });
    const v = { kind: 'objects', rows, all: ['Name', 'N'], view: ['Name', 'N'] };
    for (const [label, stage, a] of [['-eq', 'where-object', ['Where-Object', 'Name', '-eq', 'x'.repeat(400)]],
        ['Sort-Object', 'sort-object', ['Sort-Object', 'Name']], ['numeric -gt', 'where-object', ['Where-Object', 'N', '-gt', '5']]]) {
        const bud = MATCH.budget(stage === 'sort-object' ? 100 : 300);
        const out = CMD.STAGES[stage](v, CMD.args(a), bud);
        t.check(out === CMD.LIMIT_MSG || bud.spent, label + ' is charged to the budget');
    }
}

/* ── R3 caps under adversarial filler (users, groups, members, plans, keys, scratch, rules) ── */
{
    const { state } = fresh('caps', 0);
    for (let i = 0; i < OBJ.localUsers + 10; i++) ps(state, 'net user u' + i + ' x /add');
    const localUsers = Object.keys(state.identity.users).filter((n) => !state.identity.users[n].builtin).length;
    t.check(localUsers <= OBJ.localUsers + 1, 'local users capped (' + localUsers + ')');
    for (let i = 0; i < OBJ.localGroups + 10; i++) ps(state, 'New-LocalGroup -Name g' + i);
    t.check(Object.keys(state.identity.groups).length <= OBJ.localGroups + 4, 'local groups capped (' + Object.keys(state.identity.groups).length + ')');
    for (let i = 0; i < 30; i++) ps(state, 'Add-LocalGroupMember -Group g0 -Member u' + (i % 20));
    t.check(state.identity.groups.g0.members.length <= OBJ.membersPerGroup + 2, 'group members capped');
    for (let i = 0; i < 20; i++) ps(state, 'powercfg /duplicatescheme SCHEME_BALANCED');
    t.check(state.os.power.plans.length <= OS.PLAN_CAP, 'power plans capped (' + state.os.power.plans.length + ')');
    for (let i = 0; i < OBJ.regScratchValues + 20; i++) ps(state, 'reg add "HKLM\\SOFTWARE\\Lab\\K' + i + '" /f');
    t.check(state.os.policies.keys.length <= OBJ.regScratchValues, 'created registry keys capped (' + state.os.policies.keys.length + ')');
    const bytes = Buffer.byteLength(JSON.stringify(state));
    t.check(bytes < LIM.LIMITS.storage.documentBytes, 'filled session stays under the document limit (' + bytes + ' bytes)');
}

/* ── second mutation round (Mallory's 200 re-run): the survivors that were real ── */
{
    const { state, key } = fresh('m2', 0);
    W.ipv4(state, {});
    const proto = JSON.stringify(Object.getOwnPropertyNames(Object.prototype));
    /* prototype names in command, stage, powercfg-setting and registry-type tables */
    let threw = null;
    try {
        for (const n of ['constructor', '__proto__', 'toString', 'valueOf']) {
            t.check(ps(state, 'Get-LocalUser | ' + n).indexOf('is not recognized') >= 0, 'pipeline stage ' + n + ' not recognised');
            t.check(ps(state, 'powercfg /change ' + n + ' 5').indexOf('Invalid Parameters') >= 0, 'powercfg setting ' + n + ' refused');
            t.check(ps(state, 'New-ItemProperty -Path HKLM:\\SOFTWARE\\Microsoft -Name x -Value 1 -PropertyType ' + n).indexOf("Cannot bind parameter 'Type'") >= 0, 'registry type ' + n + ' refused');
        }
    } catch (e) { threw = e.message; }
    t.check(!threw && JSON.stringify(Object.getOwnPropertyNames(Object.prototype)) === proto, 'prototype names in tables: no crash, no pollution' + (threw ? ' (' + threw + ')' : ''));
    {
        const { state: s2 } = W.sitting('m2-setup', [0, 0]);
        W.A(s2, 'hyperv', 'new-vm', { name: 'V', generation: 2, memoryMB: 8192, vhdxGB: 160, iso: 'Win11_24H2_Business_x64.iso' });
        W.A(s2, 'hyperv', 'start');
        t.check(['constructor', 'toString', '__proto__'].every((n) => SH.exec(s2, 'setup-cmd', n).out.indexOf('is not recognized') >= 0), 'Setup console: prototype command names not recognised');
    }
    {
        const { state: s3 } = W.sitting('m2-oobe', [0, 0]);
        W.A(s3, 'hyperv', 'new-vm', { name: 'V', generation: 2, memoryMB: 8192, vhdxGB: 160, iso: 'Win11_24H2_Business_x64.iso' });
        W.A(s3, 'vm-settings', 'apply', { vcpu: 2, vtpm: true }); W.A(s3, 'hyperv', 'start');
        W.A(s3, 'setup', 'lang'); W.A(s3, 'setup', 'option', { agree: true }); W.A(s3, 'setup', 'key', { noKey: true });
        W.A(s3, 'setup', 'edition', { edition: 'Pro' }); W.A(s3, 'setup', 'eula', { accept: true });
        W.A(s3, 'setup', 'install', { disk: W.osDisk(s3).n, part: 'unallocated' });
        t.check(['constructor', 'toString'].every((n) => SH.exec(s3, 'oobe-cmd', n).out.indexOf('is not recognized') >= 0), 'OOBE console: prototype command names not recognised');
    }
    t.check(SH.exec(state, 'oobe-cmd', 'oobe\\bypassnro').out === 'That console is not available.', 'OOBE console unavailable on the desktop');
    /* caps per command and per create path */
    for (let i = 0; i < 12; i++) OS.createPlan(state, { name: 'Plan' + i });
    t.check(state.os.power.plans.length <= OS.PLAN_CAP, 'power plan cap on Create a power plan (' + state.os.power.plans.length + ')');
    t.check(ps(state, 'net user ' + 'n'.repeat(21) + ' x /add').indexOf('System error') >= 0, 'net user: 21-character name refused');
    t.check(ps(state, 'net user ' + state.wo.technician + ' x /add').indexOf('System error') >= 0, 'net user: existing account refused');
    t.check(!OS.newUser({ screen: 'oobe', os: state.os, identity: state.identity }, { name: 'early' }).ok, 'creating users needs the desktop');
    const many = []; for (let i = 0; i < 21; i++) many.push('m' + i);
    t.check(ps(state, 'Add-LocalGroupMember -Group Users -Member ' + many.join(',')) === CMD.LIMIT_MSG, 'more than 20 members in one Add-LocalGroupMember refused');
    t.check(ps(state, 'net localgroup Users ' + many.join(' ') + ' /add') === CMD.LIMIT_MSG, 'more than 20 members in one net localgroup refused');
    ps(state, 'New-LocalGroup -Name Big');
    for (let i = 0; i < 20; i++) ps(state, 'net user b' + i + ' x /add');
    ['Administrator', 'Guest', state.wo.technician, 'MERIDIAN\\Domain Users'].concat(Array.from({ length: 20 }, (_, i) => 'b' + i)).forEach((m) => ps(state, 'Add-LocalGroupMember -Group Big -Member "' + m + '"'));
    t.check(state.identity.groups.Big.members.length <= OBJ.membersPerGroup + 2, 'group member cap holds with built-ins and principals (' + state.identity.groups.Big.members.length + ')');
    /* registry parsing and storage */
    ps(state, 'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f');
    t.check(state.os.policies.rdp.UserAuthentication === 1, 'a first RDP registry write keeps NLA at its default (on)');
    ps(state, 'New-Item -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" -Force');
    for (const d of ['99999999999', '0x1FFFFFFFF', '-1', '1e1']) {
        ps(state, 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" /v DeferQualityUpdatesPeriodInDays /t REG_DWORD /d ' + d + ' /f');
    }
    t.check(!(state.os.policies.wu && 'DeferQualityUpdatesPeriodInDays' in state.os.policies.wu), 'DWORD over 10 digits, over 0xFFFFFFFF, negative or exponent is inert');
    t.check(ps(state, 'reg add "HKLM\\SOFTWARE\\Lab" /v ' + 'v'.repeat(65) + ' /t REG_SZ /d x /f').indexOf('Invalid syntax') >= 0, 'value name over 64 characters refused');
    t.check(ps(state, 'reg add "HKLM\\SOFTWARE\\Lab" /v big /t REG_SZ /d ' + 'z'.repeat(400) + ' /f').indexOf('completed') >= 0, 'a 400-character value accepted');
    const bigOut = REG.write(state, 'desktop', 'HKLM\\SOFTWARE\\Lab', 'huge', 'REG_SZ', 'z'.repeat(1100), true);
    t.check(!bigOut.ok, 'value over 1 KB refused');
    ps(state, 'reg add "HKLM\\SOFTWARE\\Lab" /v Mixed /t REG_SZ /d one /f');
    ps(state, 'reg add "HKLM\\SOFTWARE\\Lab" /v MIXED /t REG_SZ /d two /f');
    const lab = REG.read(state, 'HKLM\\SOFTWARE\\Lab').values.filter((x) => x.name.toLowerCase() === 'mixed');
    t.check(lab.length === 1 && lab[0].data === 'two', 'value names are case-insensitive (rewriting replaces)');
    ps(state, 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v EnableLUA /t REG_DWORD /d 0 /f');
    t.check(ps(state, 'reg query "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v EnableLUA').indexOf('0x0') >= 0 && state.identity.uac.EnableLUA === 1, 'reg query shows the staged EnableLUA value before the restart');
    t.check(ps(state, 'reg query "HKLM\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings" /v ActiveHoursStart').indexOf('unable to find') >= 0, 'active hours not shown until set manually');
    t.check(ps(state, 'New-Item -Path HKLM:\\SOFTWARE\\NoSuchParent\\Child').indexOf('Cannot find path') >= 0, 'New-Item without -Force needs the parent');
    t.check(ps(state, 'reg add "HKLM\\SOFTWARE\\Lab" /ve /t REG_SZ /d dflt /f').indexOf('completed') >= 0 && REG.read(state, 'HKLM\\SOFTWARE\\Lab').values.some((x) => x.name === ''), 'reg add /ve writes the default value');
    /* single quotes in the deny skeleton; pipeline argument validation */
    t.check(ps(state, "reg add 'HKLM\\SOFTWARE\\Lab (x86)' /v a /t REG_SZ /d b /f").indexOf('completed') >= 0, 'parentheses inside single quotes are data');
    t.check(ps(state, 'Get-LocalUser | Select-Object -First -1').indexOf('Missing an argument') >= 0, 'Select-Object -First -1 refused');
    t.check(ps(state, 'Get-LocalUser | Select-Object ' + Array.from({ length: 17 }, () => 'Name').join(',')) === ps(state, 'Get-LocalUser'), 'more than 16 properties: treated as no projection (default view)');
    t.check(ps(state, 'Get-LocalUser | Where-Object Nope -eq x').indexOf('accepts Where-Object') >= 0, 'Where-Object on an unknown property shows the usage');
    t.check(ps(state, 'powercfg /setacvalueindex SCHEME_CURRENT SUB_VIDEO VIDEOIDLE 90').indexOf('Invalid Parameters') >= 0, 'setacvalueindex in seconds must be whole minutes');
    /* refused lines are logged as refusals; prompts at the ledger cap are refused */
    const ev0 = state.events.length;
    ps(state, 'Get-LocalUser | Get-Member');
    t.check(state.events.length > ev0 && state.events[state.events.length - 1].kind === 'refused', 'a refused line is logged as a refusal');
    ps(state, 'New-LocalUser -Name capuser');
    while (state.ledger.length < LIM.LIMITS.ledger.maxEntries) state.ledger.push({ i: state.ledger.length, k: 'filler', ref: '' });
    t.check(ps(state, 'pw') === LIM.STORAGE_MESSAGE && !state.identity.users.capuser, 'a prompt answer at the ledger cap is refused');
}

/* ── third round: the three survivors the second round's tests did not reach ── */
{
    const { state, key } = fresh('m3', 0);
    W.p23Gui(state, key, {});   /* domain-joined: the three MERIDIAN principals are addable */
    ps(state, 'reg add "HKLM\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings" /v ActiveHoursStart /t REG_DWORD /d 7 /f');
    t.check(state.os.updates.activeHours.manual === true && ps(state, 'reg query "HKLM\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings" /v ActiveHoursStart').indexOf('0x7') >= 0, 'writing active hours switches them to manual and shows in reg query');
    ps(state, 'New-LocalGroup -Name Full');
    for (let i = 0; i < 20; i++) ps(state, 'net user f' + i + ' x /add');
    const cands = Object.keys(state.identity.users).concat(['MERIDIAN\\Domain Admins', 'MERIDIAN\\Domain Users', 'MERIDIAN\\svc-wsjoin']);
    cands.forEach((m) => ps(state, 'Add-LocalGroupMember -Group Full -Member "' + m + '"'));
    t.check(cands.length > OBJ.membersPerGroup + 2 && state.identity.groups.Full.members.length === OBJ.membersPerGroup + 2, 'member cap reached on a joined PC (' + cands.length + ' candidates, ' + state.identity.groups.Full.members.length + ' members)');
    t.check(!OS.createPlan(state, { name: 'p'.repeat(65) }).ok && OS.createPlan(state, { name: 'p'.repeat(64) }).ok, 'plan names: 64 characters accepted, 65 refused');
}

/* ── re-attack N1-N4 ── */
{
    const { state } = fresh('n1', 0);
    let threw = null;
    for (const line of ['Get-LocalUser -_ x y', 'Get-LocalUser -_:x y', 'Get-LocalUser | Select-Object -_ x y', 'Get-LocalUser | Where-Object -_ x y', 'Set-TimeZone -_ x y']) {
        try { SH.exec(state, 'ps', line); } catch (e) { threw = line + ': ' + e.message; }
    }
    try { SH.exec(state, 'hyperv-ps', 'Get-VM -_ x y'); } catch (e) { threw = 'hyperv: ' + e.message; }
    t.check(!threw, 'a parameter named _ never crashes a console' + (threw ? ' (' + threw + ')' : ''));
    /* N2: control characters refused; truncation pinned */
    const before = JSON.stringify(state.regScratch);
    t.check(ps(state, 'reg add "HKLM\\SOFTWARE\\Lab" /v v1 /t REG_SZ /d "a\nb" /f') === SH.DENY_MSG && JSON.stringify(state.regScratch) === before, 'a line with an embedded newline is refused');
    t.check(ps(state, 'hostname\r') === SH.DENY_MSG && ps(state, 'host\u0000name') === SH.DENY_MSG, 'CR and NUL refused');
    const long = Array.from({ length: 450 }, (_, i) => 'line' + i).join('\n');
    const tr = SH.truncate(long).split('\n');
    t.check(tr.length === LIM.LIMITS.command.maxOutputLines + 1 && tr[tr.length - 1] === '... (output truncated)' && SH.truncate('a\nb') === 'a\nb', 'output truncated at ' + LIM.LIMITS.command.maxOutputLines + ' lines with a marker');
    /* N3: a pending prompt does not survive a reinstall or a request for an unavailable console */
    ps(state, 'New-LocalUser -Name pendA');
    SH.exec(state, 'oobe-cmd', 'oobe\\bypassnro');
    t.check(!state.shell.pending, 'asking for an unavailable console cancels a pending prompt');
    ps(state, 'New-LocalUser -Name pendB');
    state.vm.dvd = state.vm.dvd || 'Win11_24H2_Business_x64.iso';
    W.A(state, 'hyperv', 'boot-dvd', {});
    t.check(!state.shell.pending && state.screen === 'setup', 'booting the DVD cancels a pending prompt');
    /* N4: password-bearing forms masked */
    for (const [line, secret] of [['net user n2 /add SECRETA2', 'SECRETA2'], ['New-LocalUser -Name n5 -Password SECRETB5', 'SECRETB5'], ['Set-LocalUser -Name n5 -Password SECRETC6', 'SECRETC6'],
        ['net user n3 SECRETD7 /add /fullname:x', 'SECRETD7']]) {
        t.check(SH.maskSecrets(line).indexOf(secret) < 0 && SH.maskSecrets(line).indexOf('********') >= 0, 'masked: ' + line.split(secret).join('<pw>'));
    }
}

t.done();
