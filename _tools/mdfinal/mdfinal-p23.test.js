#!/usr/bin/env node
/**
 * mdfinal-p23.test.js — D3: post-install (P2) and identity (P3), the registry (R9), the desktop
 * console's pipelines and limits (R4).
 *
 * @catalog what    Canonical P2+P3 = 19/19 on every class by GUI and console; single-change negatives
 * @catalog what    for rows 2.1-3.3 and the P3 penalties; R9 canonicalisation, preconditions and the
 * @catalog what    inert scratch store; R4 refusals, budget and prototype-name safety.
 * @catalog run     node _tools/mdfinal/mdfinal-p23.test.js
 * @catalog status  TOOL
 *
 * Same contract as mdfinal-p1.test.js: each negative is the canonical run with ONE change; the
 * target row's parts are exact, every other P1-P3 row is unchanged, and the applied penalties are
 * exactly the listed ones.
 */
const kit = require('./mdfinal-test-kit.js');
const W = require('./mdfinal-walk.js');
const CH = kit.req('mdfinal-checks.js');
const G = kit.req('mdfinal-grade.js');
const GUI = kit.req('mdfinal-gui.js');
const SH = kit.req('mdfinal-shell.js');
const CORE = kit.req('mdfinal-core.js');
const REG = kit.req('mdfinal-registry.js');
const LIM = kit.req('mdfinal-limits.js');
const t = kit.harness('mdfinal-p23');

const ROWS = ['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '3.1', '3.2', '3.3'];
const near = (a, b) => Math.abs(a - b) < 1e-9;
const rowOf = (g, id) => g.rows.find((r) => r.id === id);
const full = (uid, prof, o) => { const { state, key } = W.sitting(uid, [prof, 0]); W.p1Gui(state, key); W.p23Gui(state, key, o || {}); return { state, key, g: G.grade(state, key) }; };

/* ── 1. canonical P2+P3 on all 12 classes, GUI and console ── */
{
    const bad = [];
    for (const c of CORE.variantSpace()) {
        for (const path of ['p23Gui', 'p23Shell']) {
            const { state, key } = W.sitting('p23-' + path + c.profileIndex + c.variantIndex, [c.profileIndex, c.variantIndex]);
            try { W.p1Gui(state, key); W[path](state, key); } catch (e) { bad.push(c.profile + '/' + c.variant + ' ' + path + ' threw ' + e.message); continue; }
            const g = G.grade(state, key);
            if (g.phases.P1.score !== 16 || g.phases.P2.score !== 9 || g.phases.P3.score !== 10 || g.penalties.some((p) => p.applied)) {
                bad.push(c.profile + '/' + c.variant + ' ' + path + ' ' + ['P1', 'P2', 'P3'].map((p) => p + '=' + g.phases[p].score).join(' '));
            }
        }
    }
    t.check(bad.length === 0, 'canonical P1-P3 = 35/35, no penalty: 12 classes x GUI and console' + (bad.length ? ': ' + bad.slice(0, 3).join(' | ') : ''));
    const d = full('p23-domain-groups', 0);
    t.check(d.state.identity.groups.Administrators.members.includes('MERIDIAN\\Domain Admins') && d.g.phases.P3.score === 10, 'domain join adds Domain Admins to local Administrators and costs nothing (13.5 item 2)');
    t.check(d.state.identity.membership.type === 'domain' && !d.state.identity.membership.pending, 'domain join effective after the restart');
}

/* ── 2. single-change negatives ── */
const perfect = [0, 1, 2].map((p) => full('neg23-' + p, p));
const NEG = [
    ['rename after OOBE, no restart', 0, { renameAfterOobe: true, noRestart: true, oobeSkipName: true }, '2.1', [1, 1, 0], [], ['3.3']],
    ['time zone left Pacific', 0, { skipTz: true }, '2.1', [2, 0, 1], []],
    ['CU never installed', 0, { skipCu: true }, '2.1', [2, 1, 0], []],
    ['CU installed, no restart', 0, { noRestart: true }, '2.1', [2, 1, 0], [], ['3.3']],
    ['Balanced edited in place', 0, { editBalanced: true }, '2.2', [0, 1, 1], []],
    ['DC values on an inactive plan', 0, { dcOnBalanced: true }, '2.3', [0, 0], []],
    ['AC display left at the Balanced default', 0, { acDisplay: 10 }, '2.2', [1, 0, 1], []],
    ['AC sleep never set (no powercfg)', 0, { skipAcSleep: true }, '2.2', [1, 1, 0], []],
    ['WO user in Administrators', 0, { userAdmin: true }, '3.1', [1, 0, 1, 1, 1], []],
    ['must change password left on', 0, { mustChange: true }, '3.1', [1, 1, 0, 1, 1], []],
    ['extra group member', 0, { extraMember: true }, '3.1', [1, 1, 1, 1, 0], []],
    ['WO user never created', 0, { skipUser: true }, '3.1', [0, 0, 0, 1, 0], []],
    ['WO group never created', 0, { skipGroup: true }, '3.1', [1, 1, 1, 0, 0], []],
    ['UAC never notify', 0, { uacLevel: 1 }, '3.2', [0], []],
    ['UAC default level', 0, { uacLevel: 3 }, '3.2', [0], []],
    ['workgroup MERIDIAN on a domain WO', 0, { wrongWorkgroup: true }, '3.3', [0], []],
    ['join before DNS', 0, { skipIpv4: true, joinBeforeDns: true }, '3.3', [0], []],
    ['domain join, no restart', 1, { noRestart: true }, '3.3', [1], [], ['2.1']],
    ['contractor workgroup, no restart', 2, { noRestart: true }, '3.3', [1], [], ['2.1']],
    ['built-in Administrator enabled', 0, { enableAdministrator: true }, null, null, ['P3-administrator']],
    ['Guest enabled', 0, { enableGuest: true }, null, null, ['P3-guest']],
    ['second member made a local admin', 0, { secondAdmin: true }, null, null, ['P3-extra-admin']]
];
for (const [label, prof, o, row, parts, pens, alsoMoves] of NEG) {
    let r;
    try {
        const { state, key } = W.sitting('neg23-' + prof, [prof, 0]);
        /* oobeSkipName: OOBE keeps the DESKTOP- name, so the WO name only comes from a later rename */
        W.p1Gui(state, key, { oobeSkipName: o.oobeSkipName === true });
        W.p23Gui(state, key, o);
        r = { g: G.grade(state, key), state };
    } catch (e) { t.check(false, 'negative ' + label + ' threw: ' + e.message); continue; }
    const base = perfect[prof].g;
    if (row) {
        const got = rowOf(r.g, row).parts;
        t.check(got.length === parts.length && got.every((x, i) => near(x, parts[i])), 'negative ' + label + ': ' + row + ' = ' + JSON.stringify(got));
    }
    const allowed = [row].concat(alsoMoves || []);
    const moved = ROWS.filter((id) => !allowed.includes(id) && !near(rowOf(r.g, id).score, rowOf(base, id).score));
    t.check(moved.length === 0, 'negative ' + label + ': no other row moves' + (moved.length ? ' (moved ' + moved.join(',') + ')' : ''));
    const applied = r.g.penalties.filter((p) => p.applied).map((p) => p.id);
    t.check(JSON.stringify(applied) === JSON.stringify(pens), 'negative ' + label + ': penalties ' + JSON.stringify(applied));
}
{
    const lost = new Set();
    for (const [, , , row, parts] of NEG) {
        if (!row) continue;
        const def = CH.CHECKS.find((x) => x.id === row);
        parts.forEach((v, i) => { if (v < def.parts[i].points) lost.add(row + ':' + def.parts[i].id); });
    }
    const all = []; CH.CHECKS.filter((r) => r.phase === 'P2' || r.phase === 'P3').forEach((r) => r.parts.forEach((p) => all.push(r.id + ':' + p.id)));
    const missing = all.filter((x) => !lost.has(x));
    t.check(missing.length === 0, 'every P2/P3 part has a negative fixture' + (missing.length ? ' (missing ' + missing.join(', ') + ')' : ''));
    t.check(CH.PENALTIES.filter((p) => p.phase === 'P3').every((p) => NEG.some((n) => n[5].includes(p.id))), 'every P3 penalty has a fixture');
}

/* ── 3. realism: join depends on DNS and credentials; edition gates; Home lusrmgr ── */
{
    const { state, key } = W.sitting('real-join', [0, 0]);
    W.p1Gui(state, key);
    let r = GUI.act(state, 'sysprops', 'join', { type: 'domain', name: 'meridian.local', user: W.JOIN_USER, password: W.JOIN_PW });
    t.check(!r.ok && r.msg.indexOf('could not be contacted') >= 0, 'join with lab DHCP DNS: domain controller not found');
    W.A(state, 'ncpa', 'ipv4', { dhcp: true, dns1: state.wo.network.dns[0], dns2: state.wo.network.dns[1] });
    r = GUI.act(state, 'sysprops', 'join', { type: 'domain', name: 'meridian.local', user: W.JOIN_USER, password: 'wrong' });
    t.check(!r.ok && r.msg.indexOf('user name or password is incorrect') >= 0, 'wrong join password refused');
    r = GUI.act(state, 'sysprops', 'join', { type: 'domain', name: 'meridian.local', user: 'svc-wsjoin@meridian.local', password: W.JOIN_PW });
    t.check(r.ok && state.identity.membership.pending && state.identity.membership.type === 'workgroup', 'DHCP address + Meridian DNS: join succeeds, pending until restart');
}
{
    const { state, key } = W.sitting('real-contractor', [2, 0]);
    W.p1Gui(state, key); W.ipv4(state, {});
    const r = GUI.act(state, 'sysprops', 'join', { type: 'domain', name: 'meridian.local', user: W.JOIN_USER, password: W.JOIN_PW });
    t.check(!r.ok, 'contractor PC (workgroup resolvers) cannot reach the domain');
}
{
    const s = W.sitting('real-home', [0, 0]).state;
    W.defaultInstalledState(s);
    const r = GUI.act(s, 'lusrmgr', 'user-new', { name: 'x' });
    t.check(!r.ok && r.msg.indexOf('snapin may not be used') >= 0, 'lusrmgr refused on Home');
    t.check(SH.exec(s, 'ps', 'net user bob Pass1 /add').out.indexOf('completed successfully') >= 0, 'net user still works on Home');
    const j = GUI.act(s, 'sysprops', 'join', { type: 'domain', name: 'meridian.local', user: W.JOIN_USER, password: W.JOIN_PW });
    t.check(!j.ok && j.msg.indexOf('cannot join a domain') >= 0, 'Home cannot join a domain');
}
{
    const { state, key } = W.sitting('real-lusr', [0, 0]);
    W.p1Gui(state, key);
    W.A(state, 'lusrmgr', 'user-new', { name: 'alice' });
    t.check(state.identity.users.alice.mustChange === true, 'lusrmgr New User defaults to "must change password at next logon"');
    W.X(state, 'ps', 'net user bob P1 /add');
    t.check(state.identity.users.bob.mustChange === false && state.identity.groups.Users.members.includes('bob'), 'net user /add: no must-change, member of Users');
    W.X(state, 'ps', 'net user bob /expires:never');
    t.check(state.identity.users.bob.neverExpires === false, 'net user /expires:never sets the account expiry, not the password (no credit)');
    const r = GUI.act(state, 'lusrmgr', 'user-set', { name: 'alice', mustChange: true, neverExpires: true });
    t.check(!r.ok && r.msg.indexOf('Password never expires') >= 0, 'lusrmgr refuses must-change together with never-expires');
    t.check(SH.exec(state, 'ps', 'Remove-LocalUser -Name Administrator').out.indexOf('was not found') >= 0 && state.identity.users.Administrator, 'built-in Administrator cannot be deleted');
}

/* ── 4. R9 registry ── */
{
    const mk = () => { const { state, key } = W.sitting('reg', [0, 0]); W.p1Gui(state, key); return { state, key }; };
    const uac = (s) => JSON.stringify([s.identity.uac.ConsentPromptBehaviorAdmin, s.identity.uac.PromptOnSecureDesktop, s.identity.uac.EnableLUA]);
    const spellings = ['HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System', 'hklm\\software\\microsoft\\windows\\currentversion\\policies\\system',
        'HKEY_LOCAL_MACHINE\\\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System\\', 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
        'Registry::HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Policies\\System'];
    for (const k of spellings) {
        const { state, key } = mk();
        W.X(state, 'ps', 'reg add "' + k + '" /v consentpromptbehavioradmin /t REG_DWORD /d 0x2 /f', 'completed successfully');
        t.check(rowOf(G.grade(state, key), '3.2').score === 1, 'UAC via registry spelling ' + k.slice(0, 28) + '... scores like the slider');
    }
    {
        const a = mk(), b = mk();
        W.A(a.state, 'uac', 'set', { level: 4 });
        W.X(b.state, 'ps', 'Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" -Name ConsentPromptBehaviorAdmin -Value 2');
        t.check(uac(a.state) === uac(b.state), 'Set-ItemProperty on an existing DWORD keeps its type and equals the GUI result');
    }
    {
        const { state, key } = mk();
        const before = JSON.stringify(G.grade(state, key));
        for (const line of ['reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 2 /f',
            'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Systems" /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 2 /f',
            'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v ConsentPromptBehaviorAdmin /t REG_SZ /d 2 /f',
            'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 7 /f',
            'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v ConsentPromptBehaviourAdmin /t REG_DWORD /d 2 /f',
            'reg add "HKLM\\SYSTEM\\Setup\\LabConfig" /v BypassTPMCheck /t REG_DWORD /d 1 /f']) {
            W.X(state, 'ps', line, 'completed successfully');
        }
        t.check(JSON.stringify(G.grade(state, key)) === before, 'near-miss registry writes (HKCU, typo key, REG_SZ, out of range, typo value, LabConfig on desktop) change no score');
        const q = W.X(state, 'ps', 'reg query "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System"').out;
        t.check(q.indexOf('ConsentPromptBehaviourAdmin') >= 0 && q.indexOf('ConsentPromptBehaviorAdmin    REG_DWORD    0x5') >= 0, 'reg query shows the inert value and the real one');
        for (const id of Object.keys(state.regScratch)) state.regScratch[id].data = '2';
        state.regScratch['HKLM\\SOFTWARE\\POLICIES\\MICROSOFT\\WINDOWS\\WINDOWSUPDATE|deferfeatureupdates'] = { key: REG.K_WU, name: 'DeferFeatureUpdates', type: 'REG_DWORD', data: '1' };
        t.check(JSON.stringify(G.grade(state, key)) === before, 'arbitrary regScratch contents change no score');
    }
    {
        const { state } = mk();
        const r1 = SH.exec(state, 'ps', 'Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" -Name DeferFeatureUpdates -Value 1 -Type DWord').out;
        t.check(r1.indexOf('does not exist') >= 0 && !(state.os.policies.wu), 'Set-ItemProperty on the missing WindowsUpdate key fails');
        W.X(state, 'ps', 'New-Item -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" -Force');
        W.X(state, 'ps', 'Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" -Name DeferFeatureUpdatesPeriodInDays -Value 90');
        t.check(!(state.os.policies.wu && state.os.policies.wu.DeferFeatureUpdatesPeriodInDays), 'a new value without -Type is REG_SZ and not effective');
        W.X(state, 'ps', 'New-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" -Name DeferQualityUpdatesPeriodInDays -Value 7 -PropertyType DWord');
        t.check(state.os.policies.wu.DeferQualityUpdatesPeriodInDays === 7, 'New-ItemProperty -PropertyType DWord is effective');
        W.X(state, 'ps', 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" /v DeferQualityUpdatesPeriodInDays /t REG_DWORD /d 31 /f');
        t.check(state.os.policies.wu.DeferQualityUpdatesPeriodInDays === 7, 'quality deferral 31 (over 30) is inert, the effective value stays');
        W.X(state, 'ps', 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\FVE" /v EncryptionMethodWithXtsOs /t REG_DWORD /d 5 /f');
        t.check(!(state.os.policies.fve && state.os.policies.fve.EncryptionMethodWithXtsOs), 'FVE method 5 (not a method) is inert');
        W.X(state, 'ps', 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\FVE" /v EncryptionMethodWithXtsOs /t REG_DWORD /d 7 /f');
        t.check(state.os.policies.fve.EncryptionMethodWithXtsOs === 7, 'reg add creates the FVE key and sets XTS-AES 256');
        W.X(state, 'ps', 'reg add "HKLM\\SYSTEM\\ControlSet001\\Control\\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f');
        t.check(state.os.policies.rdp.fDenyTSConnections === 0, 'ControlSet001 maps to CurrentControlSet');
    }
    {
        const { state, key } = mk();
        W.X(state, 'ps', 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v EnableLUA /t REG_DWORD /d 0 /f');
        t.check(state.identity.uac.EnableLUA === 1, 'EnableLUA change waits for a restart');
        W.A(state, 'desktop', 'restart', {});
        t.check(state.identity.uac.EnableLUA === 0, 'EnableLUA applies after the restart');
    }
    {
        const { state } = mk();
        for (let i = 0; i < LIM.LIMITS.objects.regScratchValues + 5; i++) SH.exec(state, 'ps', 'reg add "HKLM\\SOFTWARE\\Lab" /v v' + i + ' /t REG_SZ /d x /f');
        t.check(Object.keys(state.regScratch).length === LIM.LIMITS.objects.regScratchValues, 'regScratch capped at ' + LIM.LIMITS.objects.regScratchValues);
        const big = SH.exec(state, 'ps', 'reg add "HKLM\\SOFTWARE\\Lab" /v v0 /t REG_SZ /d ' + 'y'.repeat(450) + ' /f').out;
        t.check(big.indexOf('completed') >= 0, 'value under 1 KB accepted');
    }
}

/* ── 5. R4 desktop console ── */
{
    const { state, key } = W.sitting('r4', [0, 0]);
    W.p1Gui(state, key); W.p23Gui(state, key, {});
    const o = (line) => SH.exec(state, 'ps', line).out;
    const users = o('Get-LocalUser | Where-Object Enabled -eq $true | Select-Object Name');
    t.check(users.indexOf(state.wo.user.name) >= 0 && users.indexOf('Guest') < 0, 'pipeline: Get-LocalUser | Where-Object | Select-Object');
    t.check(o('Get-LocalGroupMember -Group ' + state.wo.group + ' | Measure-Object').indexOf('Count    : 2') >= 0, 'Measure-Object counts group members');
    t.check(o('Get-HotFix | Select-Object -ExpandProperty HotFixID') === state.wo.updates.cumulativeKb, 'Select-Object -ExpandProperty');
    t.check(o('Get-CimInstance Win32_ComputerSystem | Format-List Name,Domain,PartOfDomain').indexOf('PartOfDomain : True') >= 0, 'Format-List of named properties');
    t.check(o('Get-LocalUser | Sort-Object Name -Descending | Select-Object -First 1').split('\n').length === 3, 'Sort-Object and -First');
    for (const line of ['Get-LocalUser | Select-Object *', 'Get-LocalUser | Format-List *', 'Get-LocalUser | Get-Member', 'Get-LocalUser | ConvertTo-Json',
        'Get-LocalUser | Export-Clixml x.xml', 'Get-LocalUser | Where-Object Name -match "a.*"', 'Get-LocalUser | Where-Object { $_.Enabled }',
        'Get-LocalUser | Where-Object Name -like $x', 'Get-LocalUser | Out-String -Width 500', 'Get-LocalUser | Remove-LocalUser',
        'Get-LocalUser | Format-Table | Select-Object Name', 'net user | findstr a', 'Get-LocalUser || Get-LocalGroup', 'Get-LocalUser | Select-Object Name,*']) {
        const out = o(line);
        t.check(out === SH.DENY_MSG || out === SH.SCRIPTBLOCK_MSG, 'refused: ' + line);
    }
    t.check(o('Get-LocalUser | Select-Object Name | Sort-Object Name | Select-Object -First 2 | Format-Table') === SH.LIMIT_MSG, 'five pipeline stages refused');
    t.check(o('reg add "HKLM\\SOFTWARE\\Program Files (x86)" /v a /t REG_SZ /d "(x)" /f').indexOf('completed') >= 0, 'parentheses inside quotes are data');
    t.check(o('Get-LocalUser -Name (Get-Random)') === SH.DENY_MSG, 'unquoted parentheses refused');
    const t0 = Date.now();
    const re = o('Get-LocalUser | Where-Object Name -like "*a*a*a*a*a*a*a*a*a*a*a*a*a*a*a*a*a*a*a*a*b"');
    t.check(Date.now() - t0 < 500 && typeof re === 'string', 'adversarial -like pattern returns within budget');
    t.check(o('Get-LocalUser | Where-Object Name -like "(a+)+$"') === '', '(a+)+$ is literal text to -like (no match, no blow-up)');
    /* prototype names in every lookup */
    const protoBefore = JSON.stringify(Object.getOwnPropertyNames(Object.prototype));
    for (const n of ['__proto__', 'constructor', 'prototype', 'toString', 'hasOwnProperty']) {
        for (const line of ['Get-LocalUser -Name ' + n, 'Get-LocalGroup -Name ' + n, 'Get-LocalGroupMember -Group ' + n, 'net user ' + n,
            'net localgroup ' + n, 'Add-LocalGroupMember -Group ' + n + ' -Member ' + n, 'powercfg /setactive ' + n, 'tzutil /s ' + n,
            'reg query "HKLM\\' + n + '"', 'Set-LocalUser -Name ' + n + ' -PasswordNeverExpires $true', 'Get-LocalUser -' + n + ' x',
            'Get-LocalUser | Select-Object ' + n, 'Get-LocalUser | Where-Object ' + n + ' -eq x']) {
            let threw = null; try { SH.exec(state, 'ps', line); } catch (e) { threw = e.message; }
            if (threw) t.check(false, 'prototype name crashed: ' + line + ' (' + threw + ')');
        }
    }
    t.check(JSON.stringify(Object.getOwnPropertyNames(Object.prototype)) === protoBefore && ({}).polluted === undefined, 'prototype names in every lookup: no crash, Object.prototype unchanged');
    const before = JSON.stringify(G.grade(state, key));
    t.check(before === JSON.stringify(G.grade(state, key)), 'grade stable');
}

/* ── 6. prompts: the secret never reaches history or the ledger ── */
{
    const { state, key } = W.sitting('prompt', [1, 0]);
    W.p1Gui(state, key); W.ipv4(state, {});
    W.X(state, 'ps', 'New-LocalUser -Name pat', 'Password');
    W.X(state, 'ps', 'S3cret-Typed-Here!');
    t.check(!!state.identity.users.pat, 'New-LocalUser prompt creates the user');
    W.X(state, 'ps', 'Add-Computer -DomainName meridian.local -Credential ' + W.JOIN_USER, 'Password for user');
    W.X(state, 'ps', W.JOIN_PW);
    const dump = JSON.stringify(state.shell) + JSON.stringify(state.ledger) + JSON.stringify(state.events);
    t.check(dump.indexOf('S3cret-Typed-Here!') < 0 && dump.indexOf(W.JOIN_PW) < 0 && state.shell.history.includes('********'), 'prompted secrets never stored in history, ledger or events');
    t.check(state.identity.membership.pending && state.identity.membership.pending.type === 'domain', 'Add-Computer prompt joins (pending restart)');
    const p2 = SH.exec(state, 'ps', 'New-LocalUser -Name pat2');
    const after = SH.exec(state, 'ps', 'x'.repeat(200)).out;
    t.check(after.indexOf('limits') >= 0 && !state.identity.users.pat2, 'a prompt answer over 127 characters is refused');
    t.check(typeof p2.out === 'string', 'prompt returned');
}

/* ── 7. gaps the D3 mutation round found ── */
{
    /* EnableLUA 0 alone loses 3.2 (after the restart that applies it) */
    const { state, key } = W.sitting('gap-lua', [0, 0]);
    W.p1Gui(state, key); W.p23Gui(state, key, {});
    W.X(state, 'ps', 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v EnableLUA /t REG_DWORD /d 0 /f');
    W.A(state, 'desktop', 'restart', {});
    const g = G.grade(state, key);
    t.check(rowOf(g, '3.2').score === 0 && state.identity.uac.ConsentPromptBehaviorAdmin === 2, 'EnableLUA 0 with Always notify: 3.2 = 0');
    /* an unknown time zone id is refused everywhere and changes nothing */
    const tz = state.os.timeZone;
    t.check(!GUI.act(state, 'settings', 'time-zone', { id: 'Mars Standard Time' }).ok && SH.exec(state, 'ps', 'tzutil /s "Mars Standard Time"').out === 'Invalid time zone ID.' &&
        SH.exec(state, 'ps', 'Set-TimeZone -Id "Mars Standard Time"').out.indexOf('was not found') >= 0 && state.os.timeZone === tz, 'unknown time zone refused by Settings, tzutil and Set-TimeZone');
    /* regedit cannot write a value under a key that does not exist */
    const r = GUI.act(state, 'regedit', 'set', { key: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate', name: 'DeferFeatureUpdates', type: 'REG_DWORD', data: '1' });
    t.check(!r.ok && !(state.os.policies.wu && state.os.policies.wu.DeferFeatureUpdates), 'regedit: value under a missing key refused');
    W.A(state, 'regedit', 'new-key', { key: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate' });
    W.A(state, 'regedit', 'set', { key: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate', name: 'DeferFeatureUpdates', type: 'REG_DWORD', data: '1' });
    t.check(state.os.policies.wu.DeferFeatureUpdates === 1, 'regedit: New Key, then the value, is effective');
    /* the pipeline budget fires when the work exceeds it (defensive at D3: no producer is this large) */
    const CMD = kit.req('mdfinal-cmdlets.js'), MATCH = kit.req('mdfinal-match.js');
    const rows = []; for (let i = 0; i < 400; i++) rows.push({ Name: 'a'.repeat(500) });
    const v = { kind: 'objects', rows, all: ['Name'], view: ['Name'] };
    const b = MATCH.budget();
    const out = CMD.STAGES['where-object'](v, CMD.args(['Where-Object', 'Name', '-like', '*a*a*a*a*b']), b);
    t.check(out === CMD.LIMIT_MSG && b.spent, 'Where-Object -like over 400 x 500 characters exhausts the budget and refuses');
}

t.done();
