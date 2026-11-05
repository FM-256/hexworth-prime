#!/usr/bin/env node
/**
 * mdfinal-faults.test.js — the P7 catalogue proven route by route (spec 4, Common rules).
 *
 * @catalog what    Every canonical and listed alternative repair of V1-V4, from the FULL perfect P1-P6
 * @catalog what    state on all three profiles (15/15, total 100) and from a P1-only snapshot; a
 * @catalog what    console-only perfect build; power-off, reinstall, pending-at-handover, VM-off handover;
 * @catalog what    wrong fixes; I3 tied to a real fix; V4 Event Viewer diagnosis; evidence forms.
 * @catalog run     node _tools/mdfinal/mdfinal-faults.test.js
 * @catalog status  TOOL
 *
 * WHY THIS FILE EXISTS (Nancy D5 R3): the first P7 suite ran one GUI route per sitting, so a correct
 * repair by any other route, a console-only build, or a VM left switched off were all unproven and
 * several were scored wrong. Here each route is its own sitting.
 */
const kit = require('./mdfinal-test-kit.js');
const W = require('./mdfinal-walk.js');
const G = kit.req('mdfinal-grade.js');
const GUI = kit.req('mdfinal-gui.js');
const SH = kit.req('mdfinal-shell.js');
const HO = kit.req('mdfinal-handover.js');
const ANS = kit.req('mdfinal-answers.js');
const FAULTS = kit.req('mdfinal-faults.js');
const APPS = kit.req('mdfinal-apps.js');
const t = kit.harness('mdfinal-faults');

/* One graded row by id. */
const rowOf = (g, id) => g.rows.find((r) => r.id === id);
/* A GUI action that must succeed. */
const A = (r, w, a, p) => { const x = GUI.act(r.state, w, a, p || {}, { key: r.key, now: 1e12 }); if (!x.ok) throw new Error(w + '/' + a + ': ' + x.msg); return x; };
/* A console line in a context. */
const C = (r, line, ctx) => SH.exec(r.state, ctx || 'ps', line, { key: r.key, now: 1e12 }).out;
/* The full perfect P1-P6 state handed over, nothing repaired yet. Options: o6 for P6, before(r) runs before handover. */
function handed(uid, prof, v, before) {
    const { state, key } = W.sitting(uid, [prof, v]);
    W.p1Gui(state, key); W.p23Gui(state, key); W.p45Gui(state, key); W.p6Gui(state, key);
    const r = { state, key };
    if (before) before(r);
    r.snapshot = HO.handover(state, key).snapshot;
    return r;
}
/* Saves the canonical P8 answers for the variant (B fields from the snapshot). */
function answer(r, i2) {
    const rp = r.snapshot.bitlocker.C.protectors.find((p) => p.type === 'RecoveryPassword');
    ANS.save(r.state, 'B1', rp.id.slice(0, 8)); ANS.save(r.state, 'B2', 'XTS-AES 256');
    const v = r.key.variant;
    const a = { V1: ['driver', '0x7B', 'restart and confirm normal boot'], V2: ['update', r.key.fault.kb, 'restart and confirm Explorer stable'],
                V3: ['runaway process', 'msynchlp.exe', 'Task Manager or Get-Process after restart'], V4: ['name resolution', '1014', 'name-resolution or port test'] }[v];
    ANS.save(r.state, 'I1', a[0]); ANS.save(r.state, 'I2', i2 || a[1]); ANS.save(r.state, 'I3', a[2]);
}
/* Grade a sitting: P1-P6 from the snapshot, P7/P8 from the final state. */
const gradeOf = (r) => G.grade(r.snapshot, r.key, r.state);
/* The current recovery password (the student's copy on TECH-USB). */
const recoveryKey = (r) => r.state.bitlocker.C.protectors.find((p) => p.type === 'RecoveryPassword').password;
/* The driver package name a student reads from pnputil. */
const oemOf = (r, ctx) => C(r, ctx === 'winre-cmd' ? 'dism /image:C:\\ /get-drivers' : 'pnputil /enum-drivers', ctx).split(ctx === 'winre-cmd' ? 'Published Name :' : 'Published Name:')[1].trim().split('\n')[0].trim();

/* verification steps the routes end with */
const verify = {
    V1: (r) => {},                                       /* the restart to a normal desktop is the evidence */
    V2: (r) => {},
    V3: (r) => A(r, 'taskmgr', 'view'),
    V4: (r) => C(r, 'Test-NetConnection ' + r.state.wo.lob.fqdn + ' -Port ' + r.state.wo.lob.port)
};
/* The diagnostic step each variant's repair starts with (I1/I2 gate). */
/* each shows the value the canonical answer names (13.19 item 7): V1's stop code on the recovery screen,
 * V2's KB in Update history, V3's process in Task Manager, V4's 1014 in the System log */
const diag = { V1: () => {}, V2: (r) => { A(r, 'taskmgr', 'view'); A(r, 'taskmgr', 'run', { target: 'ms-settings:windowsupdate-history' }); A(r, 'settings', 'update-history'); },
               V3: (r) => A(r, 'taskmgr', 'view'), V4: (r) => { C(r, 'ipconfig /all'); C(r, 'Get-WinEvent -LogName System'); } };

/* [variant index, route label, steps(r), expected 7.1 parts] */
const ROUTES = [
    [0, 'canonical: Safe Mode + pnputil /uninstall /force', (r) => { A(r, 'winre', 'startup-settings', { option: 4 }); C(r, 'pnputil /delete-driver ' + oemOf(r) + ' /uninstall /force'); A(r, 'desktop', 'restart'); }, [10, 5]],
    [0, 'Safe Mode + pnputil /uninstall (no /force)', (r) => { A(r, 'winre', 'startup-settings', { option: 4 }); C(r, 'pnputil /delete-driver ' + oemOf(r) + ' /uninstall'); A(r, 'desktop', 'restart'); }, [10, 5]],
    [0, 'Safe Mode + uninstall Meridian Backup Agent in Apps', (r) => { A(r, 'winre', 'startup-settings', { option: 4 }); A(r, 'apps', 'uninstall', { name: 'Meridian Backup Agent' }); A(r, 'desktop', 'restart'); }, [10, 5]],
    [0, 'WinRE Command Prompt, key, dism /image /remove-driver', (r) => { C(r, 'manage-bde -unlock C: -RecoveryPassword ' + recoveryKey(r), 'winre-cmd'); C(r, 'dism /image:C:\\ /remove-driver /driver:' + oemOf(r, 'winre-cmd'), 'winre-cmd'); A(r, 'winre', 'continue'); }, [10, 5]],
    [0, 'WinRE Command Prompt, key, offline Start=4 (package left: 7)', (r) => {
        C(r, 'manage-bde -unlock C: -RecoveryPassword ' + recoveryKey(r), 'winre-cmd');
        C(r, 'reg load HKLM\\OFFLINE C:\\Windows\\System32\\config\\SYSTEM', 'winre-cmd');
        C(r, 'reg add HKLM\\OFFLINE\\ControlSet001\\Services\\mbafilt /v Start /t REG_DWORD /d 4 /f', 'winre-cmd');
        C(r, 'reg unload HKLM\\OFFLINE', 'winre-cmd'); A(r, 'winre', 'continue'); }, [7, 5]],
    [1, 'canonical: Task Manager > Run > Update history > uninstall', (r) => { A(r, 'taskmgr', 'run', { target: 'ms-settings:windowsupdate-history' }); A(r, 'settings', 'update-uninstall', { kb: r.state.fault.kb }); A(r, 'desktop', 'restart'); }, [10, 5]],
    [1, 'wusa /uninstall', (r) => { A(r, 'taskmgr', 'run', { target: 'powershell' }); C(r, 'wusa /uninstall /kb:' + r.state.fault.kb.slice(2) + ' /norestart'); A(r, 'desktop', 'restart'); }, [10, 5]],
    [1, 'DISM /Online /Remove-Package', (r) => { A(r, 'taskmgr', 'run', { target: 'powershell' }); C(r, 'DISM /Online /Remove-Package /PackageName:Package_for_' + r.state.fault.kb + '~31bf3856ad364e35~amd64~~26100.1742.1.0'); A(r, 'desktop', 'restart'); }, [10, 5]],
    [1, 'WinRE Uninstall Updates (latest quality) with the key', (r) => { A(r, 'desktop', 'advanced-restart'); A(r, 'winre', 'unlock', { key: recoveryKey(r) }); A(r, 'winre', 'uninstall-updates'); A(r, 'winre', 'continue'); }, [10, 5]],
    [2, 'canonical: end process, disable task, disable startup', (r) => { A(r, 'taskmgr', 'end', { name: 'msynchlp' }); A(r, 'taskschd', 'disable', { path: '\\Meridian\\SyncHelperWatchdog' }); A(r, 'taskmgr', 'startup', { name: 'MerSync', enabled: false }); A(r, 'desktop', 'restart'); }, [10, 5]],
    [2, 'taskkill + schtasks /delete + reg delete Run', (r) => { C(r, 'taskkill /im msynchlp.exe /f'); C(r, 'schtasks /delete /tn \\Meridian\\SyncHelperWatchdog /f'); C(r, 'reg delete "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" /v MerSync /f'); A(r, 'desktop', 'restart'); }, [10, 5]],
    [2, 'Stop-Process + Unregister-ScheduledTask + Settings startup toggle', (r) => { C(r, 'Stop-Process -Name msynchlp'); C(r, 'Unregister-ScheduledTask -TaskPath \\Meridian\\ -TaskName SyncHelperWatchdog -Confirm:$false'); A(r, 'settings', 'startup', { name: 'MerSync', enabled: false }); A(r, 'desktop', 'restart'); }, [10, 5]],
    [2, 'uninstall Meridian Sync Helper', (r) => { A(r, 'apps', 'uninstall', { name: 'Meridian Sync Helper' }); A(r, 'desktop', 'restart'); }, [10, 5]],
    [3, 'canonical: disable helper, restore DNS, clean hosts (Notepad)', (r) => { A(r, 'services', 'set', { name: 'MerVpnHelper', startType: 'Disabled' }); A(r, 'ncpa', 'ipv4', { dns1: r.state.wo.network.dns[0], dns2: r.state.wo.network.dns[1] }); A(r, 'notepad', 'hosts-save', { text: '' }); A(r, 'desktop', 'restart'); }, [10, 5]],
    [3, 'uninstall helper, Set-DnsClientServerAddress (reversed order), Clear-Content hosts', (r) => {
        A(r, 'apps', 'uninstall', { name: 'Meridian VPN Helper' });
        C(r, 'Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses ' + r.state.wo.network.dns[1] + ',' + r.state.wo.network.dns[0]);
        C(r, 'Clear-Content -Path C:\\Windows\\System32\\drivers\\etc\\hosts'); C(r, 'ipconfig /flushdns'); A(r, 'desktop', 'restart'); }, [10, 5]],
    [3, 'sc config + reg-free DNS + Set-Content hosts', (r) => {
        C(r, 'sc config MerVpnHelper start= disabled');
        C(r, 'Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses ' + r.state.wo.network.dns.join(','));
        C(r, 'Set-Content -Path C:\\Windows\\System32\\drivers\\etc\\hosts -Value "# cleaned"'); A(r, 'desktop', 'restart'); }, [10, 5]]
];
for (const [v, label, steps, want] of ROUTES) {
    for (const prof of [0, 1, 2]) {
        let r;
        try {
            r = handed('route-' + v + '-' + prof + '-' + label.slice(0, 14), prof, v);
            diag['V' + (v + 1)](r);
            steps(r);
            verify['V' + (v + 1)](r);
            answer(r);
        } catch (e) { t.check(false, 'V' + (v + 1) + ' ' + label + ' (profile ' + prof + ') threw: ' + e.message.slice(0, 160)); continue; }
        const g = gradeOf(r);
        const p = rowOf(g, '7.1').parts;
        const full = want[0] === 10;
        t.check(JSON.stringify(p) === JSON.stringify(want) && (!full || g.total === 100), 'V' + (v + 1) + ' ' + label + ' (profile ' + prof + '): 7.1 ' + JSON.stringify(p) + (full ? ', total ' + g.total : ''));
    }
}

/* System Restore to a point taken after P6: a full repair for V1-V3 (from WinRE with the key, or from Windows) */
for (const v of [0, 1, 2]) {
    const r = handed('restore-' + v, 0, v, (q) => { A(q, 'sysprops', 'protection', { on: true }); A(q, 'sysprops', 'restore-point', { name: 'after P6' }); });
    if (v === 0) { A(r, 'winre', 'unlock', { key: recoveryKey(r) }); A(r, 'winre', 'system-restore', { point: 1 }); }
    else { if (v === 1) A(r, 'taskmgr', 'run', { target: 'control' }); A(r, 'sysprops', 'system-restore', { point: 1 }); }
    t.check(JSON.stringify(rowOf(gradeOf(r), '7.1').parts) === '[10,5]', 'V' + (v + 1) + ': System Restore to a post-P6 point is a full repair');
}

/* ── P1-only snapshot: the canonical repairs still score 15/15 ── */
for (const v of [0, 1, 2, 3]) {
    const { state, key } = W.sitting('p1only-' + v, [2, v]);
    W.p1Gui(state, key);
    const r = { state, key, snapshot: HO.handover(state, key).snapshot };
    try {
        if (v === 0) { A(r, 'winre', 'startup-settings', { option: 4 }); C(r, 'pnputil /delete-driver ' + oemOf(r) + ' /uninstall /force'); A(r, 'desktop', 'restart'); }
        if (v === 1) { A(r, 'taskmgr', 'run', { target: 'ms-settings:windowsupdate-history' }); A(r, 'settings', 'update-uninstall', { kb: r.state.fault.kb }); A(r, 'desktop', 'restart'); }
        if (v === 2) { A(r, 'apps', 'uninstall', { name: 'Meridian Sync Helper' }); A(r, 'desktop', 'restart'); }
        if (v === 3) { A(r, 'services', 'set', { name: 'MerVpnHelper', startType: 'Disabled' }); A(r, 'ncpa', 'ipv4', { dhcp: true, dnsAuto: true }); A(r, 'notepad', 'hosts-save', { text: '' }); A(r, 'desktop', 'restart'); }
    } catch (e) { t.check(false, 'P1-only V' + (v + 1) + ' threw ' + e.message.slice(0, 120)); continue; }
    const g = gradeOf(r);
    t.check(JSON.stringify(rowOf(g, '7.1').parts) === '[10,5]', 'P1-only snapshot, V' + (v + 1) + ' canonical repair: 7.1 = ' + JSON.stringify(rowOf(g, '7.1').parts));
}

/* ── a console-only perfect build scores 100 ── */
for (const v of [0, 1, 2, 3]) {
    const { state, key } = W.sitting('console-only-' + v, [v % 3, v]);
    try { W.p1Shell(state, key); W.p23Shell(state, key); W.p45Shell(state, key); W.p6Shell(state, key); } catch (e) { t.check(false, 'console build threw ' + e.message.slice(0, 120)); continue; }
    const r = { state, key };
    r.snapshot = W.handoverAndRepair(state, key);
    t.check(gradeOf(r).total === 100, 'console-only build + V' + (v + 1) + ' canonical repair: 100 (' + gradeOf(r).total + ')');
}

/* ── finishing states ── */
for (const v of [0, 1, 2, 3]) {
    const r = W.perfect('poweroff-' + v, [0, v]);
    A(r, 'hyperv', 'stop');
    t.check(gradeOf(r).total === 100, 'V' + (v + 1) + ': repaired, VM switched off at the end: still 100');
}
for (const v of [0, 1, 2, 3]) {
    const r = handed('reinstall-' + v, 0, v);
    if (r.state.vm.power === 'on') A(r, 'hyperv', 'stop');
    A(r, 'hyperv', 'start'); A(r, 'hyperv', 'boot-dvd');
    A(r, 'setup', 'lang'); A(r, 'setup', 'option', { agree: true }); A(r, 'setup', 'key', { noKey: true });
    A(r, 'setup', 'edition', { edition: r.key.edition }); A(r, 'setup', 'eula', { accept: true });
    A(r, 'setup', 'install', { disk: W.osDisk(r.state).n, part: r.state.os.systemPartition });
    W.oobe(r.state, r.key, {});
    const g = gradeOf(r);
    t.check(JSON.stringify(rowOf(g, '7.1').parts) === '[0,0]' && g.p7Reason === 'reinstalled', 'V' + (v + 1) + ': a reinstall after handover scores 7.1 = 0 (reinstalled)');
}
{
    /* a pending restart at handover (P6 pagefile not restarted) is not a regression of the repair */
    const { state, key } = W.sitting('pending', [0, 2]);
    W.p1Gui(state, key); W.p23Gui(state, key); W.p45Gui(state, key); W.p6Gui(state, key, { noRestart: true });
    const r = { state, key, snapshot: HO.handover(state, key).snapshot };
    A(r, 'apps', 'uninstall', { name: 'Meridian Sync Helper' }); A(r, 'desktop', 'restart');
    t.check(JSON.stringify(rowOf(gradeOf(r), '7.1').parts) === '[10,5]', 'pending pagefile at handover, correct repair: no false regression');
    /* hand over with the VM switched off: the fault is applied; the next start shows it */
    const off = W.sitting('ho-off', [0, 0]); W.p1Gui(off.state, off.key);
    GUI.act(off.state, 'hyperv', 'stop', {}, { key: off.key });
    const ho = HO.handover(off.state, off.key);
    GUI.act(off.state, 'hyperv', 'start', {}, { key: off.key });
    t.check(ho.applied && off.state.screen === 'winre', 'handover with the VM off: fault applied, next start lands in WinRE');
}

/* ── wrong fixes and their regression domains ── */
{
    const r = handed('wrong-v2-profile', 0, 1);
    A(r, 'taskmgr', 'run', { target: 'powershell' });
    C(r, 'net user newprofile P@ss1 /add');
    A(r, 'desktop', 'restart');
    const nr = FAULTS.noRegression(r.snapshot, r.state, 'V2');
    t.check(rowOf(gradeOf(r), '7.1').parts[0] === 0 && nr.changed.indexOf('accounts') >= 0, 'V2: a new user profile does not fix Explorer, and changes the accounts domain');
    const p = handed('wrong-v3-hp', 0, 2);
    A(p, 'apps', 'uninstall', { name: 'Meridian Sync Helper' });
    A(p, 'power', 'set-active', { plan: 'High performance' });
    const g = gradeOf(p);
    t.check(JSON.stringify(rowOf(g, '7.1').parts) === '[10,4]' && FAULTS.noRegression(p.snapshot, p.state, 'V3').changed.join() === 'power', 'V3: switching to High performance is a regression in the power domain only');
    const d = handed('wrong-v4-dhcp', 0, 3);
    A(d, 'services', 'set', { name: 'MerVpnHelper', startType: 'Disabled' }); A(d, 'notepad', 'hosts-save', { text: '' }); A(d, 'ncpa', 'ipv4', { dhcp: true, dns1: d.state.wo.network.dns[0], dns2: d.state.wo.network.dns[1] });
    t.check(FAULTS.noRegression(d.snapshot, d.state, 'V4').changed.join() === 'ipdns', 'V4: putting the adapter on DHCP regresses the IP/DNS domain only');
}

/* ── I3 needs a real fix; V4 diagnosis by Event Viewer; evidence forms ── */
{
    const r = handed('i3-unrelated', 0, 2);
    A(r, 'taskmgr', 'view');
    A(r, 'taskmgr', 'startup', { name: r.state.wo.performance.startupCandidates.find((n) => r.state.wo.performance.highImpact.indexOf(n) < 0), enabled: false });
    A(r, 'desktop', 'restart'); A(r, 'taskmgr', 'view');
    answer(r);
    t.check(rowOf(gradeOf(r), '8.2').parts[2] === 0, 'I3: an unrelated startup change and a recheck is not a verified fix');
    const q = handed('i3-v4-ping', 0, 3);
    A(q, 'services', 'set', { name: 'MerVpnHelper', startType: 'Disabled' }); A(q, 'ncpa', 'ipv4', { dns1: q.state.wo.network.dns[0], dns2: q.state.wo.network.dns[1] });
    A(q, 'notepad', 'hosts-save', { text: '' }); A(q, 'desktop', 'restart');
    C(q, 'ping 8.8.8.8'); answer(q);
    t.check(rowOf(gradeOf(q), '8.2').parts[2] === 0, 'I3 for V4: pinging something other than the LedgerSync server does not verify');
    C(q, 'nslookup ' + q.state.wo.lob.fqdn);
    t.check(rowOf(gradeOf(q), '8.2').parts[2] === 1, 'I3 for V4: nslookup of the LedgerSync server verifies');
    const e = handed('v4-eventvwr', 0, 3);
    A(e, 'eventvwr', 'query', { log: 'System' });
    answer(e);
    t.check(JSON.stringify(rowOf(gradeOf(e), '8.2').parts.slice(0, 2)) === '[2,2]', 'V4: diagnosis through Event Viewer earns I1 and I2 (1014)');
    for (const [form, want] of [['123', 'stop:7b'], ['7B', 'stop:7b'], ['stop 0x7b', 'stop:7b'], ['0x0000007B', 'stop:7b'], ['INACCESSIBLE_BOOT_DEVICE', 'stop:7b'], ['KB 5091234', '5091234'], ['msynchlp.EXE', 'msynchlp']]) {
        t.check(FAULTS.normEvidence(form) === want, 'evidence "' + form + '" normalises to ' + want);
    }
    const c = handed('v4-contractor-5719', 2, 3);
    A(c, 'eventvwr', 'query', { log: 'System' });
    answer(c, '5719');
    t.check(rowOf(gradeOf(c), '8.2').parts[1] === 0, 'V4 on a workgroup PC: 5719 is not evidence (never logged)');
    {
        /* a domain WO whose join never took effect: 5719 was never logged, so it is not evidence */
        const { state, key } = W.sitting('v4-unjoined-5719', [0, 3]);
        W.p1Gui(state, key); W.p23Gui(state, key, { skipIpv4: true, joinBeforeDns: true }); W.p45Gui(state, key, { lenient: true }); W.p6Gui(state, key);
        const u = { state, key, snapshot: HO.handover(state, key).snapshot };
        A(u, 'eventvwr', 'query', { log: 'System' });
        answer(u, '5719');
        t.check(state.identity.membership.type === 'workgroup' && rowOf(gradeOf(u), '8.2').parts[1] === 0, 'V4 on a domain WO that never joined: 5719 is not evidence');
    }
}

/* ── restore throttle fails closed without a clock; MSI creates the automatic point ── */
{
    const { state, key } = W.sitting('rp-now', [0, 0]); W.p1Gui(state, key);
    GUI.act(state, 'sysprops', 'protection', { on: true }, { key });
    t.check(SH.exec(state, 'ps', 'Checkpoint-Computer -Description x', { key }).out.indexOf('could not be created') >= 0 && state.sys.restorePoints.length === 0, 'Checkpoint-Computer without a server clock fails closed');
    GUI.act(state, 'apps', 'install-msi', { path: 'C:\\LabFiles\\LedgerSync_2.4_x64.msi' }, { key, now: 5e11 });
    t.check(state.sys.restorePoints.length === 1 && state.sys.restorePoints[0].name === 'Installed LedgerSync', 'an MSI install with protection on creates the automatic restore point');
}

t.done();
