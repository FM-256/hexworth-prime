#!/usr/bin/env node
/**
 * mdfinal-p678.test.js — D5: apps and update policy (P6), the handover and the P7 single fault, the
 * P8 as-built record, and the whole exam scoring 100 on every class.
 *
 * @catalog what    Perfect sitting = 100 on all 12 classes; P6 negatives; per-variant wrong fixes and
 * @catalog what    ladder rungs; no-regression and its Resolved>=4 gate; Reset this PC; no handover;
 * @catalog what    post-handover tamper; P8 gates and evidence normalisation; WinRE key rules; restore.
 * @catalog run     node _tools/mdfinal/mdfinal-p678.test.js
 * @catalog status  TOOL
 */
const kit = require('./mdfinal-test-kit.js');
const W = require('./mdfinal-walk.js');
const CH = kit.req('mdfinal-checks.js');
const G = kit.req('mdfinal-grade.js');
const GUI = kit.req('mdfinal-gui.js');
const SH = kit.req('mdfinal-shell.js');
const CORE = kit.req('mdfinal-core.js');
const HO = kit.req('mdfinal-handover.js');
const ANS = kit.req('mdfinal-answers.js');
const APPS = kit.req('mdfinal-apps.js');
const t = kit.harness('mdfinal-p678');

const near = (a, b) => Math.abs(a - b) < 1e-9;
/* One graded row by id. */
const rowOf = (g, id) => g.rows.find((r) => r.id === id);
/* P1-P5 done, ready for P6 options. */
function upToP5(uid, forced) { const { state, key } = W.sitting(uid, forced || [0, 0]); W.p1Gui(state, key); W.p23Gui(state, key); W.p45Gui(state, key); return { state, key }; }
/* A full sitting up to handover with P6 options, then handover (no repair). */
function toHandover(uid, forced, o6) { const r = upToP5(uid, forced); W.p6Gui(r.state, r.key, o6 || {}); r.snapshot = HO.handover(r.state, r.key).snapshot; return r; }
/* Grade a sitting with snapshot and final. */
const gradeOf = (r) => G.grade(r.snapshot || r.state, r.key, r.state);
/* A GUI action that must succeed. */
const A = (r, w, a, p) => { const x = GUI.act(r.state, w, a, p || {}, { key: r.key }); if (!x.ok) throw new Error(w + '/' + a + ': ' + x.msg); return x; };
/* A console line. */
const C = (r, line, ctx) => SH.exec(r.state, ctx || 'ps', line, { key: r.key }).out;

/* ── 1. a perfect sitting scores exactly 100 on all 12 classes, and 78 before repair ── */
{
    const bad = [];
    for (const c of CORE.variantSpace()) {
        let r; try { r = W.perfect('p678-' + c.profileIndex + c.variantIndex, [c.profileIndex, c.variantIndex]); } catch (e) { bad.push(c.profile + '/' + c.variant + ' threw ' + e.message.slice(0, 120)); continue; }
        const g = gradeOf(r);
        if (g.total !== 100 || g.penalties.some((p) => p.applied)) bad.push(c.profile + '/' + c.variant + ' total ' + g.total);
    }
    t.check(bad.length === 0, 'perfect sitting = 100.00 on all 12 classes' + (bad.length ? ': ' + bad.slice(0, 3).join(' | ') : ''));
    const raw = toHandover('p678-raw', [0, 0]);
    t.check(gradeOf(raw).total === 78 && rowOf(gradeOf(raw), '7.1').score === 0, 'handed over, not repaired, no P8 answers: 78 (P1-P6 only)');
    const shell = upToP5('p678-shell6', [0, 0]); W.p6Shell(shell.state, shell.key);
    const g6 = G.grade(shell.state, shell.key);
    t.check(g6.phases.P6.score === 11, 'P6 by console only: 11/11 (' + g6.phases.P6.score + ')');
}

/* ── 2. P6 negatives ── */
{
    const base = toHandover('n6-base', [0, 0]);
    const ref = gradeOf(base);
    const NEG6 = [
        ['x86 MSI', { msiPath: 'C:\\LabFiles\\LedgerSync_2.4_x86.msi' }, '6.1', [0, 1, 1, 1, 1], []],
        ['SERVER= omitted', { server: null }, '6.1', [1, 0, 1, 1, 1], []],
        ['PORT= omitted', { port: null }, '6.1', [1, 1, 0, 1, 1], []],
        ['consumer app removed for the user only', { skipDeprov: true }, '6.1', [1, 1, 1, 1, 0], []],
        ['consumer app deprovisioned, still installed for the user', { skipAppUser: true }, '6.1', [1, 1, 1, 0, 1], []],
        ['feature deferral wrong days', { featureDays: 30 }, '6.2', [0, 1, 1], []],
        ['active hours never set', { skipActiveHours: true }, '6.2', [1, 1, 0], []],
        ['SecurityHealth disabled instead of a high-impact app', { startupOff: [null, 'SecurityHealth'] }, '6.3', [0, 1, 1], ['P6-keep-list']],
        ['pagefile maximum differs', { pagefileMax: 16384 }, '6.3', [1, 1, 0], []],
        ['pagefile never set', { skipPagefile: true }, '6.3', [1, 1, 0], []]
    ];
    for (const [label, o, row, parts, pens] of NEG6) {
        const oo = Object.assign({}, o);
        if (oo.server === null) delete oo.server;
        if (oo.startupOff) { const s0 = W.sitting('n6-' + label, [0, 0]).state; oo.startupOff = [s0.wo.performance.highImpact[1], 'SecurityHealth']; }
        let r;
        try {
            r = upToP5('n6-' + label, [0, 0]);
            const o6 = Object.assign({}, oo);
            if (o.server === null) { o6.server = ''; }
            if (o.port === null) { o6.port = ''; }
            W.p6Gui(r.state, r.key, o6);
            if (o.server === null || o.port === null) {
                /* omitted means the property was not passed at all: reinstall without it */
                A(r, 'apps', 'uninstall', { name: 'LedgerSync' });
                const p = { path: 'C:\\LabFiles\\LedgerSync_2.4_x64.msi' };
                if (o.server !== null) p.server = r.state.wo.lob.fqdn; if (o.port !== null) p.port = String(r.state.wo.lob.port);
                A(r, 'apps', 'install-msi', p);
            }
            r.snapshot = HO.handover(r.state, r.key).snapshot;
        } catch (e) { t.check(false, 'P6 negative ' + label + ' threw ' + e.message.slice(0, 120)); continue; }
        const g = gradeOf(r);
        const got = rowOf(g, row).parts;
        t.check(got.every((x, i) => near(x, parts[i])), 'P6 negative ' + label + ': ' + row + ' = ' + JSON.stringify(got));
        const moved = ['6.1', '6.2', '6.3'].filter((id) => id !== row && !near(rowOf(g, id).score, rowOf(ref, id).score));
        t.check(moved.length === 0, 'P6 negative ' + label + ': no other P6 row moves' + (moved.length ? ' (' + moved.join(',') + ')' : ''));
        t.check(JSON.stringify(g.penalties.filter((p) => p.applied).map((p) => p.id)) === JSON.stringify(pens), 'P6 negative ' + label + ': penalties');
    }
    /* registry route: days without the enabling DWORD, quality over 30 */
    {
        const r = upToP5('n6-reg', [0, 0]);
        W.p6Gui(r.state, r.key, {});
        C(r, 'reg delete "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" /v DeferFeatureUpdates /f');
        C(r, 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" /v DeferQualityUpdatesPeriodInDays /t REG_DWORD /d 30 /f');
        const g = G.grade(r.state, r.key);
        const wantQ = r.state.wo.updates.qualityDeferralDays === 30 ? 1 : 0;
        t.check(JSON.stringify(rowOf(g, '6.2').parts) === JSON.stringify([0, wantQ, 1]), 'days without DeferFeatureUpdates=1 not effective; quality 30 replaces the WO value (' + JSON.stringify(rowOf(g, '6.2').parts) + ')');
    }
    /* pagefile set but no restart; Calculator removed; x86 then a second install refused */
    {
        const r = upToP5('n6-norestart', [0, 0]);
        W.p6Gui(r.state, r.key, { noRestart: true });
        t.check(rowOf(G.grade(r.state, r.key), '6.3').parts[2] === 0, 'pagefile set without a restart: not effective');
        A(r, 'apps', 'uninstall', { name: 'Calculator' });
        t.check(G.grade(r.state, r.key).penalties.find((p) => p.id === 'P6-keep-list').applied, 'removing Calculator applies the keep-list penalty');
        const again = GUI.act(r.state, 'apps', 'install-msi', { path: 'C:\\LabFiles\\LedgerSync_2.4_x64.msi' }, { key: r.key });
        t.check(!again.ok && again.msg.indexOf('1638') >= 0, 'second install of LedgerSync: 1638');
        t.check(!GUI.act(r.state, 'settings', 'active-hours', { start: 1, end: 22 }).ok, 'active hours longer than 18 hours refused');
    }
}

/* ── 3. P7: wrong fixes, partial rungs, regression, reset ── */
function variantRun(uid, v, prof) { const r = toHandover(uid, [prof || 0, v]); return r; }
const p7 = (r) => rowOf(gradeOf(r), '7.1').parts;
{
    /* V1 */
    let r = variantRun('v1-sr', 0);
    t.check(r.state.screen === 'winre', 'V1: the PC lands in WinRE after handover');
    A(r, 'winre', 'startup-repair');
    t.check(JSON.stringify(p7(r)) === '[0,0]' && r.state.screen === 'winre', 'V1: Startup Repair changes nothing');
    C(r, 'bootrec /rebuildbcd', 'winre-cmd');
    t.check(C(r, 'bootrec /fixboot', 'winre-cmd') === 'Access is denied.', 'V1: bootrec /fixboot is Access is denied');
    r = variantRun('v1-safeboot', 0);
    A(r, 'winre', 'startup-settings', { option: 4 });
    C(r, 'bcdedit /set {default} safeboot minimal');
    const inf = C(r, 'pnputil /enum-drivers').split('Published Name:')[1].trim().split('\n')[0].trim();
    C(r, 'pnputil /delete-driver ' + inf + ' /uninstall /force');
    A(r, 'desktop', 'restart');
    t.check(r.state.sys.safeMode === true && p7(r)[0] === 0, 'V1: fixed but left in Safe Mode by bcdedit: resolved 0');
    C(r, 'bcdedit /deletevalue {default} safeboot');
    t.check(p7(r)[0] === 10, 'V1: safeboot removed: resolved 10');
    /* offline route: needs the key (BitLocker on), then filter removed but package left = 7 */
    r = variantRun('v1-offline', 0);
    const locked = C(r, 'reg load HKLM\\OFFLINE C:\\Windows\\System32\\config\\SYSTEM', 'winre-cmd');
    t.check(locked.indexOf('locked') >= 0, 'V1: WinRE prompt cannot load the offline hive while C: is locked');
    const pw = r.state.bitlocker.C.protectors.find((p) => p.type === 'RecoveryPassword').password;
    t.check(C(r, 'manage-bde -unlock C: -RecoveryPassword ' + pw, 'winre-cmd').indexOf('successfully unlocked') >= 0, 'V1: the recovery key from TECH-USB unlocks C:');
    C(r, 'reg load HKLM\\OFFLINE C:\\Windows\\System32\\config\\SYSTEM', 'winre-cmd');
    C(r, 'reg add HKLM\\OFFLINE\\ControlSet001\\Control\\Class\\{4d36e967-e325-11ce-bfc1-08002be10318} /v UpperFilters /t REG_MULTI_SZ /d partmgr /f', 'winre-cmd');
    C(r, 'reg unload HKLM\\OFFLINE', 'winre-cmd');
    A(r, 'winre', 'continue');
    t.check(r.state.screen === 'desktop' && p7(r)[0] === 7, 'V1: UpperFilters cleaned offline, package left: resolved 7');
    /* reset this PC */
    r = variantRun('v1-reset', 0);
    A(r, 'winre', 'reset', { mode: 'remove' });
    t.check(JSON.stringify(p7(r)) === '[0,0]', 'V1: Reset this PC scores the row 0');
    /* System Restore from WinRE to a post-P6 point, with the key */
    {
        const q = upToP5('v1-restore', [0, 0]); W.p6Gui(q.state, q.key, {});
        A(q, 'sysprops', 'protection', { on: true }); A(q, 'sysprops', 'restore-point', { name: 'after P6' });
        q.snapshot = HO.handover(q.state, q.key).snapshot;
        const noKey = GUI.act(q.state, 'winre', 'system-restore', { point: 1 }, { key: q.key });
        t.check(!noKey.ok && noKey.msg.indexOf('Recovery key ID') >= 0, 'V1: System Restore from WinRE asks for the recovery key');
        A(q, 'winre', 'unlock', { key: q.state.bitlocker.C.protectors.find((p) => p.type === 'RecoveryPassword').password });
        A(q, 'winre', 'system-restore', { point: 1 });
        t.check(JSON.stringify(p7(q)) === '[10,5]', 'V1: restore to a post-P6 point is a full repair (' + JSON.stringify(p7(q)) + ')');
    }
}
{
    /* V2 */
    let r = variantRun('v2-ka', 1);
    t.check(!GUI.act(r.state, 'settings', 'update-history', {}, { key: r.key }).ok, 'V2: with Explorer crashing, Settings is not reachable from the desktop');
    A(r, 'taskmgr', 'run', { target: 'ms-settings:windowsupdate-history' });
    A(r, 'settings', 'update-uninstall', { kb: r.state.wo.updates.cumulativeKb });
    A(r, 'desktop', 'restart');
    t.check(JSON.stringify(p7(r)) === '[0,0]', 'V2: uninstalling KB-A instead: unresolved, no-regression gated to 0');
    A(r, 'taskmgr', 'run', { target: 'powershell' });
    t.check(C(r, 'sfc /scannow').indexOf('did not find any integrity violations') >= 0 && p7(r)[0] === 0, 'V2: sfc (console via Task Manager) finds nothing and fixes nothing');
    r = variantRun('v2-wusa', 1);
    A(r, 'taskmgr', 'run', { target: 'powershell' });
    C(r, 'wusa /uninstall /kb:' + r.state.fault.kb.slice(2) + ' /norestart');
    A(r, 'desktop', 'restart');
    t.check(JSON.stringify(p7(r)) === '[10,5]', 'V2: wusa /uninstall of the hotfix: full repair');
    r = variantRun('v2-explorer', 1);
    A(r, 'taskmgr', 'run', { target: 'explorer' });
    t.check(r.state.sys.explorer === 'crashing' && p7(r)[0] === 0, 'V2: restarting Explorer only does not fix it');
}
{
    /* V3 */
    let r = variantRun('v3-end', 2);
    A(r, 'taskmgr', 'end', { name: 'msynchlp' });
    t.check(p7(r)[0] === 0, 'V3: ending the process only: resolved 0 (it comes back at boot)');
    A(r, 'taskschd', 'disable', { path: '\\Meridian\\SyncHelperWatchdog' });
    t.check(JSON.stringify(p7(r)) === '[4,5]', 'V3: one persistence point neutralised: 4, no-regression paid (' + JSON.stringify(p7(r)) + ')');
    A(r, 'services', 'set', { name: 'SysMain', startType: 'Disabled' });
    t.check(JSON.stringify(p7(r)) === '[4,4]', 'V3: disabling SysMain (decoy) costs one regression domain');
    r = variantRun('v3-uninstall', 2);
    A(r, 'apps', 'uninstall', { name: 'Meridian Sync Helper' });
    t.check(p7(r)[0] === 10, 'V3: uninstalling Meridian Sync Helper removes all three: 10');
}
{
    /* V4 */
    let r = variantRun('v4-hosts', 3);
    A(r, 'notepad', 'hosts-save', { text: r.state.sys.hosts.join('\n') + '\n' + '10.0.0.20 ' + r.state.wo.lob.fqdn });
    t.check(p7(r)[0] === 0, 'V4: adding a correct hosts line as a workaround: 0');
    r = variantRun('v4-partial', 3);
    A(r, 'ncpa', 'ipv4', { dns1: r.state.wo.network.dns[0], dns2: r.state.wo.network.dns[1] });
    A(r, 'notepad', 'hosts-save', { text: '' });
    t.check(JSON.stringify(p7(r)) === '[4,5]', 'V4: DNS and hosts fixed, helper still Automatic (re-breaks at boot): 4');
    A(r, 'ncpa', 'ipv4', { dhcp: true, dns1: r.state.wo.network.dns[0], dns2: r.state.wo.network.dns[1] });
    t.check(kit.req('mdfinal-faults.js').noRegression(r.snapshot, r.state, 'V4').changed.join() === 'ipdns', 'V4: switching the adapter to DHCP is a regression of the IP/DNS domain');
    r = variantRun('v4-full', 3);
    A(r, 'services', 'set', { name: 'MerVpnHelper', startType: 'Disabled' });
    A(r, 'ncpa', 'ipv4', { dns1: r.state.wo.network.dns[0], dns2: r.state.wo.network.dns[1] });
    A(r, 'notepad', 'hosts-save', { text: '' });
    t.check(JSON.stringify(p7(r)) === '[10,5]', 'V4: helper disabled, DNS restored, hosts cleaned: full repair');
}

/* ── 4. handover rules ── */
{
    const r = upToP5('ho-tamper', [0, 2]); W.p6Gui(r.state, r.key, {});
    r.snapshot = HO.handover(r.state, r.key).snapshot;
    const before = gradeOf(r);
    A(r, 'settings', 'rename', { name: 'TAMPERED' }); A(r, 'lusrmgr', 'user-delete', { name: r.state.wo.user.name }); A(r, 'defender', 'realtime', { on: false });
    const after = gradeOf(r);
    t.check(after.rows.filter((x) => ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].includes(x.phase)).every((x) => JSON.stringify(x.parts) === JSON.stringify(rowOf(before, x.id).parts)), 'post-handover tamper: every P1-P6 row identical, part by part (snapshot basis)');
    t.check(!HO.handover(r.state, r.key).ok, 'handover happens once');
    const n = upToP5('ho-none', [0, 0]); W.p6Gui(n.state, n.key, {});
    const gN = G.grade(n.state, n.key, n.state);
    t.check(rowOf(gN, '7.1').score === 0 && rowOf(gN, '8.2').score === 0 && gN.total === 78, 'never handed over: 7.1 and 8.2 are 0');
    const off = W.sitting('ho-noos', [0, 0]);
    const ho = HO.handover(off.state, off.key);
    t.check(ho.ok && !ho.applied && ho.reason === 'no-os' && !off.state.fault, 'handover with no OS: snapshot taken, no fault');
}

/* ── 5. P8 ── */
{
    const r = W.perfect('p8-base', [0, 2]);
    const g0 = gradeOf(r);
    t.check(JSON.stringify(rowOf(g0, '8.2').parts) === '[2,2,1]' && JSON.stringify(rowOf(g0, '8.1').parts) === '[1,1]', 'P8 canonical: 8.1 [1,1], 8.2 [2,2,1]');
    const set = (f, v) => ANS.save(r.state, f, v);
    set('B1', '{' + r.snapshot.bitlocker.C.protectors.find((p) => p.type === 'RecoveryPassword').id.slice(0, 4) + '-' + r.snapshot.bitlocker.C.protectors.find((p) => p.type === 'RecoveryPassword').id.slice(4, 8) + '}');
    t.check(rowOf(gradeOf(r), '8.1').parts[0] === 1, 'B1 with braces and dashes accepted');
    set('B1', r.key.bitlocker.ids[5].slice(0, 8));
    t.check(rowOf(gradeOf(r), '8.1').parts[0] === 0, 'B1 from a protector that never existed in the snapshot: 0');
    set('B2', 'XTS-AES 128');
    t.check(rowOf(gradeOf(r), '8.1').parts[1] === 0, 'B2 wrong method: 0');
    t.check(!ANS.save(r.state, 'B2', 'XTS-AES 999').ok && !ANS.save(r.state, 'I1', 'gremlins').ok, 'select fields accept only their options');
    for (const ev of ['msynchlp', 'MSYNCHLP.EXE', 'msynchlp.exe']) { set('I2', ev); t.check(rowOf(gradeOf(r), '8.2').parts[1] === 2, 'I2 "' + ev + '" accepted'); }
    set('I2', 'svchost.exe');
    t.check(rowOf(gradeOf(r), '8.2').parts[1] === 0, 'I2 wrong process: 0');
    set('I3', 'restart and confirm normal boot');
    t.check(rowOf(gradeOf(r), '8.2').parts[2] === 0, 'I3 a method not valid for the variant: 0');
}
{
    /* I1/I2 need a diagnostic event; I3 needs verification AFTER the fix */
    const q = toHandover('p8-nodiag', [0, 2]);
    A(q, 'apps', 'uninstall', { name: 'Meridian Sync Helper' });
    A(q, 'desktop', 'restart');
    ANS.save(q.state, 'I1', 'runaway process'); ANS.save(q.state, 'I2', 'msynchlp'); ANS.save(q.state, 'I3', 'Task Manager or Get-Process after restart');
    t.check(JSON.stringify(rowOf(gradeOf(q), '8.2').parts) === '[0,0,0]', 'right answers with no diagnostic or verification event: 0/5');
    A(q, 'taskmgr', 'view');
    t.check(JSON.stringify(rowOf(gradeOf(q), '8.2').parts) === '[2,2,1]', 'Task Manager after the fix: diagnostic and verification both satisfied');
    const pre = W.sitting('p8-pre', [0, 2]).state;
    t.check(!ANS.save(pre, 'I1', 'driver').ok && !ANS.save(pre, 'B1', 'ABCDEF12').ok, 'P8 fields refused before they exist');
    for (const [v, ev] of [[0, ['0x7B', '0x0000007b', 'INACCESSIBLE_BOOT_DEVICE', '1001']], [3, ['1014']]]) {
        const z = W.perfect('p8-ev-' + v, [0, v]);
        for (const e of ev) { ANS.save(z.state, 'I2', e); t.check(rowOf(gradeOf(z), '8.2').parts[1] === 2, 'V' + (v + 1) + ' evidence "' + e + '" accepted'); }
    }
}

/* ── 6. restore points: throttle, scope ── */
{
    const r = upToP5('rp', [0, 0]);
    t.check(C(r, 'Checkpoint-Computer -Description one').indexOf('disabled') >= 0, 'Checkpoint-Computer fails while System Protection is off');
    A(r, 'sysprops', 'protection', { on: true });
    SH.exec(r.state, 'ps', 'Checkpoint-Computer -Description one', { key: r.key, now: 1000 });
    const second = SH.exec(r.state, 'ps', 'Checkpoint-Computer -Description two', { key: r.key, now: 2000 }).out;
    t.check(second.indexOf('1440 minutes') >= 0 && r.state.sys.restorePoints.length === 1, 'Checkpoint-Computer throttled to one per 1440 minutes');
    A(r, 'sysprops', 'restore-point', { name: 'manual' });
    t.check(r.state.sys.restorePoints.length === 2, 'the System Protection dialog is not throttled');
}

/* ── 6b. the Day 5 mutation survivors that were real ── */
{
    /* I3: a verification event BEFORE the fix does not count */
    const q = toHandover('g5-i3', [0, 2]);
    A(q, 'taskmgr', 'view');
    A(q, 'apps', 'uninstall', { name: 'Meridian Sync Helper' });
    ANS.save(q.state, 'I1', 'runaway process'); ANS.save(q.state, 'I2', 'msynchlp'); ANS.save(q.state, 'I3', 'Task Manager or Get-Process after restart');
    t.check(JSON.stringify(rowOf(gradeOf(q), '8.2').parts) === '[2,2,0]', 'I3: Task Manager viewed only before the fix: diagnostic yes, verification no');
    /* V4: helper disabled and DNS restored, but the decoy hosts line left: not resolved */
    const h = variantRun('g5-v4-hosts', 3);
    A(h, 'services', 'set', { name: 'MerVpnHelper', startType: 'Disabled' });
    A(h, 'ncpa', 'ipv4', { dns1: h.state.wo.network.dns[0], dns2: h.state.wo.network.dns[1] });
    t.check(p7(h)[0] === 0, 'V4: decoy hosts line left behind: resolved 0');
    /* V4: with the helper still Automatic, a restart re-breaks DNS and hosts */
    const rb = variantRun('g5-v4-rebreak', 3);
    A(rb, 'ncpa', 'ipv4', { dns1: rb.state.wo.network.dns[0], dns2: rb.state.wo.network.dns[1] });
    A(rb, 'notepad', 'hosts-save', { text: '' });
    A(rb, 'desktop', 'restart');
    t.check(rb.state.network.adapters.Ethernet.dns[0] === '203.0.113.53' && rb.state.sys.hosts.length === 1, 'V4: an Automatic helper re-breaks DNS and hosts at the next restart');
    /* V4 amnesty: a contractor PC whose DNS was never set (4.1 skipped) repaired to the WO DNS: no regression */
    const am = W.sitting('g5-v4-amnesty', [2, 3]);
    W.p1Gui(am.state, am.key); W.p23Gui(am.state, am.key, { skipIpv4: true }); W.p45Gui(am.state, am.key, {}); W.p6Gui(am.state, am.key, {});
    am.snapshot = HO.handover(am.state, am.key).snapshot;
    A(am, 'services', 'set', { name: 'MerVpnHelper', startType: 'Disabled' });
    A(am, 'ncpa', 'ipv4', { dns1: am.state.wo.network.dns[0], dns2: am.state.wo.network.dns[1] });
    A(am, 'notepad', 'hosts-save', { text: '' });
    t.check(JSON.stringify(p7(am)) === '[10,5]', 'V4: DNS is in the amnesty set, so restoring it from a never-configured snapshot is not a regression (' + JSON.stringify(p7(am)) + ')');
    /* System Restore does not revert the hosts file, so it cannot fix V4 */
    const rs = upToP5('g5-v4-restore', [0, 3]); W.p6Gui(rs.state, rs.key, {});
    A(rs, 'sysprops', 'protection', { on: true }); A(rs, 'sysprops', 'restore-point', { name: 'after P6' });
    rs.snapshot = HO.handover(rs.state, rs.key).snapshot;
    A(rs, 'sysprops', 'system-restore', { point: 1 });
    t.check(rs.state.sys.hosts.length === 1 && p7(rs)[0] === 0, 'V4: System Restore leaves the hosts line, so it is not a repair');
    /* the removal pipeline accepts only filter stages in the middle */
    const pp = upToP5('g5-pipe', [0, 0]);
    let threw = null, out;
    try { out = C(pp, 'Get-AppxPackage | Foo-Bar | Remove-AppxPackage'); } catch (e) { threw = e.message; }
    t.check(!threw && out === SH.DENY_MSG, 'an unknown middle stage before Remove-AppxPackage is refused, not crashed');
    t.check(C(pp, 'Get-AppxPackage | Format-Table | Remove-AppxPackage') === SH.DENY_MSG, 'Format-Table cannot feed Remove-AppxPackage');
}

/* ── 7. all 24 rows implemented, totals intact ── */
t.check(CH.CHECKS.every((r) => typeof r.check === 'function') && CH.CHECKS.reduce((a, r) => a + r.points, 0) === 100, 'all 24 rows implemented; total 100');

/* ── D7 bar (13.2 item 1): install with defaults, hand over, do nothing = exactly the three
 * action-parameter parts on every class, no penalty, P7 and P8 zero ── */
{
    const HO = kit.req('mdfinal-handover.js');
    for (let p = 0; p < 3; p++) {
        for (let v = 0; v < 4; v++) {
            const { state: s, key } = W.sitting('dflt-total-' + p + v, [p, v]);
            W.defaultInstalledState(s);
            const h = HO.handover(s, key);
            const g = G.grade(h.snapshot, key, s);
            const scored = [];
            g.rows.forEach((r) => r.parts.forEach((x, i) => { if (x > 0) { scored.push(r.id + ':' + i); } }));
            t.check(g.total === 3 && JSON.stringify(scored) === JSON.stringify(['1.1:0', '1.1:1', '1.2:0']) && !g.penalties.some((x) => x.applied),
                'defaults, handover, nothing else (class ' + p + v + '): total 3 from the declared parts only (' + scored.join(',') + ')');
        }
    }
}

t.done();
