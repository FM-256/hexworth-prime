#!/usr/bin/env node
/**
 * mdfinal-d7.test.js — fixtures for the gaps the D7 whole-checks mutation sweep found.
 *
 * @catalog what    MD-100 final D7 gap fixtures: must-change with never-expires (3.1), DHCP after a
 * @catalog what    static address (4.1), comma lists with spaces (shell), prototype-named parameters.
 * @catalog run     node _tools/mdfinal/mdfinal-d7.test.js
 * @catalog status  TOOL
 *
 * The D7 sweep (270 mutants from the D2-D5 rounds, on full-tree copies) killed 239; the 20 that no
 * longer apply target code later rounds rewrote. Every survivor was analysed as equivalent. The
 * blocks below are the fixtures written while checking them; each still guards real behaviour:
 *   3.1-mustchange-ok  the combination is unreachable (pinned here);
 *   4.1-no-static      DHCP replaces the address, so the IP part fails without the static test;
 *   sh-join-commas     the cmdlet layer joins comma lists itself (the shell copy serves P1 consoles);
 *   cmd-args-proto     argument values are strings, and a string assigned to __proto__ is ignored.
 * Earlier accepted: 6.2-ah-auto, 7.1-reset-ok, fa-v3-procend-ok, clone order; and no-part-ledger
 * (nothing reads it), d4-icacls-n (shadowed by the right-list parser), dp-efi-explicit (1.3 counts
 * explicit Primary only).
 */
const kit = require('./mdfinal-test-kit.js');
const W = require('./mdfinal-walk.js');
const G = kit.req('mdfinal-grade.js');
const GUI = kit.req('mdfinal-gui.js');
const SH = kit.req('mdfinal-shell.js');
const t = kit.harness('mdfinal-d7');

/* A row's parts for a state graded as its own snapshot. */
const parts = (s, key, id) => G.grade(s, key, s).rows.find((r) => r.id === id).parts;

/* A sitting built through P3 on the GUI path. */
function upToP3(uid, forced) {
    const { state, key } = W.sitting(uid, forced);
    W.p1Gui(state, key); W.p23Gui(state, key);
    return { state, key };
}

/* 3.1-mustchange-ok is EQUIVALENT: "must change" with "never expires" is unreachable, because
 * lusrmgr refuses it with Windows' own message and no console route sets it. This pins that, so
 * the mutant's equivalence is a tested fact rather than a claim. */
{
    const { state, key } = upToP3('d7-must', [0, 0]);
    const u = state.wo.user.name;
    const r = GUI.act(state, 'lusrmgr', 'user-set', { name: u, mustChange: true, neverExpires: true }, { key });
    t.check(!r.ok && /never expires/.test(r.msg), 'lusrmgr refuses must-change together with never-expires');
    ['net user ' + u + ' /logonpasswordchg:yes', 'Set-LocalUser -Name ' + u + ' -PasswordNeverExpires $true'].forEach((l) => SH.exec(state, 'ps', l, { key }));
    const x = state.identity.users[u];
    t.check(!(x.mustChange && x.neverExpires), 'no console route leaves both set');
}

/* 4.1-no-static: a PC put back on DHCP keeps no credit for the static address it used to have. */
{
    const { state, key } = upToP3('d7-dhcp', [2, 0]);
    W.p45Gui(state, key);
    t.check(parts(state, key, '4.1')[0] === 1, '(baseline) 4.1 static IP part earned by the walk');
    const r = GUI.act(state, 'ncpa', 'ipv4', { dhcp: true, dnsAuto: true }, { key });
    t.check(r.ok, '(fixture) switch the adapter back to DHCP');
    t.check(parts(state, key, '4.1')[0] === 0, '4.1: DHCP after a static address scores the IP part 0');
}

/* sh-join-commas: "a, b" (a space after the comma) is one list, as PowerShell reads it. */
{
    const { state, key } = W.sitting('d7-comma', [2, 0]);
    W.p1Gui(state, key);
    const wo = state.wo;
    SH.exec(state, 'ps', 'New-LocalGroup -Name ' + wo.group, { key });
    SH.exec(state, 'ps', 'net user ' + wo.user.name + ' Pass-1234! /add', { key });
    SH.exec(state, 'ps', 'net user ' + wo.secondMember.name + ' Pass-1234! /add', { key });
    const out = SH.exec(state, 'ps', 'Add-LocalGroupMember -Group ' + wo.group + ' -Member ' + wo.user.name + ', ' + wo.secondMember.name, { key }).out;
    const m = state.identity.groups[wo.group].members;
    t.check(m.indexOf(wo.user.name) >= 0 && m.indexOf(wo.secondMember.name) >= 0 && m.length === 2, 'a comma list with a space adds both members (' + JSON.stringify(m) + ' ' + out.slice(0, 80) + ')');
}

/* cmd-args-proto: parameters named like prototype keys are plain data, never the args object's prototype. */
{
    const { state, key } = W.sitting('d7-proto', [2, 0]);
    W.p1Gui(state, key);
    for (const line of ['Get-Service -__proto__ x', 'Get-LocalUser -constructor x -__proto__ y', 'Get-Service -hasOwnProperty 1 -Name Dnscache', 'Get-Service -Name Dnscache -__proto__ Name']) {
        const r = SH.exec(state, 'ps', line, { key });
        t.check(typeof r.out === 'string', 'prototype-named parameter answered: ' + line);
    }
    const r = SH.exec(state, 'ps', 'Get-Service -Name Dnscache -__proto__ Name', { key });
    t.check(/Dnscache/.test(r.out), 'a -__proto__ parameter does not change how -Name is read');
    t.check(Object.prototype.Name === undefined && ({}).x === undefined, 'Object.prototype unchanged');
}

/* ── Nancy R4 fixes ───────────────────────────────────────────────────────────────────────── */
const FA = kit.req('mdfinal-faults.js');
const CLIENT = kit.req('mdfinal-client.js');

/* R4 #2: the I2 evidence sets name every artefact spec 4.1 lists and the diagnostic routes show */
{
    const want = {
        V1: (k) => ['0x7B', 'INACCESSIBLE_BOOT_DEVICE', 'Stop code: INACCESSIBLE_BOOT_DEVICE', '1001', '41', 'mbafilt', 'mbafilt.sys', k.fault.driverInf],
        V2: (k) => [k.fault.kb, k.fault.kb.slice(2), '1000', '1001', 'mer_shellhook.dll'],
        V3: () => ['msynchlp', 'msynchlp.exe', 'MerSync', 'SyncHelperWatchdog'],
        V4: (k) => ['1014', 'MerVpnHelper', k.fault.decoyIp, FA.VENDOR_DNS[0], '5719', '1129']
    };
    const not = { V1: ['explorer.exe', '7C'], V2: ['explorer.exe', 'explorer'], V3: ['svchost'], V4: ['8.8.8.8'] };
    for (let v = 0; v < 4; v++) {
        const r = W.perfect('d7-ev-' + v, [0, v], { skipRepair: true, skipP8: true });
        const set = FA.evidenceSet(r.state, r.key);
        const V = r.key.variant;
        const missing = want[V](r.key).filter((x) => set.indexOf(FA.normEvidence(x)) < 0);
        t.check(missing.length === 0, 'I2 ' + V + ': every listed artefact is accepted (missing ' + missing.join(',') + ')');
        t.check(not[V].every((x) => set.indexOf(FA.normEvidence(x)) < 0), 'I2 ' + V + ': the victim or an unrelated value is not evidence');
        t.check(want[V](r.key).every((x) => String(x).length <= kit.req('mdfinal-answers.js').FIELDS.I2.max), 'I2 ' + V + ': every accepted form fits the field');
    }
    const w = W.perfect('d7-ev-wg', [2, 3], { skipRepair: true, skipP8: true });
    const ws = FA.evidenceSet(w.state, w.key);
    t.check(ws.indexOf('5719') < 0 && ws.indexOf('1129') < 0, 'I2 V4 on a workgroup PC: no domain events (they are never logged there)');
}

/* R4 #3: switch parameters never swallow the next token */
{
    const r = W.perfect('d7-sw', [0, 2], { skipRepair: true, skipP8: true });
    const s = r.state, key = r.key;
    const before = s.apps.appx.filter((a) => a.user).map((a) => a.name);
    SH.exec(s, 'ps', 'Get-AppxPackage -AllUsers *Solitaire* | Remove-AppxPackage', { key });
    const after = s.apps.appx.filter((a) => a.user).map((a) => a.name);
    t.check(['Microsoft.WindowsCalculator', 'Microsoft.WindowsStore', 'Microsoft.WindowsNotepad'].every((n) => after.indexOf(n) >= 0) && after.length >= before.length - 1,
        'Get-AppxPackage -AllUsers *X* | Remove-AppxPackage removes only the match, never the keep-list');
    const sorted = SH.exec(s, 'ps', 'Get-Process | Sort-Object -Descending CPU', { key }).out.split('\n')[2] || '';
    t.check(/msynchlp/.test(sorted), 'Sort-Object -Descending CPU puts the runaway process first (V3)');
    const sp = SH.exec(s, 'ps', 'Stop-Process -Force msynchlp', { key }).out;
    t.check(!/undefined/.test(sp) && !s.sys.processes.some((x) => x.name === 'msynchlp'), 'Stop-Process -Force <name> ends the named process');
    t.check(/LedgerSync_2\.4_x64\.msi/.test(SH.exec(s, 'ps', 'Get-ChildItem -Recurse C:\\LabFiles', { key }).out), 'Get-ChildItem -Recurse <path> lists the path');
}

/* R4 #4 and #9: ping -n, aliases, automatic DNS on a static address */
{
    const r = W.perfect('d7-ping', [0, 3], { skipP8: true });
    const s = r.state, key = r.key, lob = s.wo.lob.fqdn;
    const o = SH.exec(s, 'ps', 'ping -n 2 ' + lob, { key }).out;
    t.check(o.indexOf('Pinging ' + lob) === 0 && /Reply from/.test(o), 'ping -n 2 <host> pings the host (repaired V4: it replies)');
    t.check(s.ledger.slice(-1)[0].k === 'name-test' && s.ledger.slice(-1)[0].ref === 'lob', 'ping -n 2 <lob> is an I3 name test on the LedgerSync server');
    for (const [l, re] of [['tnc ' + lob + ' -Port ' + s.wo.lob.port, /TcpTestSucceeded/], ['gps', /ProcessName/], ['gsv Dnscache', /Dnscache/], ['ping.exe ' + lob, /Pinging/], ['echo ok', /^ok$/]]) {
        t.check(re.test(SH.exec(s, 'ps', l, { key }).out), 'alias works: ' + l.split(' ')[0]);
    }
    const ip = GUI.act(s, 'ncpa', 'ipv4', { dnsAuto: true }, { key });
    t.check(!ip.ok && /only when the IP address is obtained automatically/.test(ip.msg), 'automatic DNS on a static address is refused, not a false success');
}

/* R4 #7 and #9: the brief says to restart before handover, and names the password routes */
{
    const { state } = W.sitting('d7-brief', [0, 0]);
    const rules = CLIENT.toInitialState(state).rules.join(' ');
    t.check(/restart before you hand over/.test(rules), 'the rules tell students to restart before handover');
    t.check(/ConvertTo-SecureString is not available/.test(rules) && /New-LocalUser prompts/.test(rules) && /net user <name> <password>/.test(rules), 'the rules name the supported password routes');
}

/* ── Mallory R4 fixes ─────────────────────────────────────────────────────────────────────── */
{
    const r = W.perfect('d7-mal4', [0, 2], { skipRepair: true, skipP8: true });
    const s = r.state, key = r.key;
    const calc = () => s.apps.appx.find((a) => a.name === 'Microsoft.WindowsCalculator').user;
    t.check(/^What if: /.test(SH.exec(s, 'ps', 'Remove-AppxPackage -WhatIf Microsoft.WindowsCalculator', { key }).out) && calc(), 'F2: -WhatIf previews a removal and removes nothing');
    t.check(/^What if: /.test(SH.exec(s, 'ps', 'Get-AppxPackage *Calculator* | Remove-AppxPackage -WhatIf', { key }).out) && calc(), 'F2: -WhatIf on a pipeline consumer removes nothing');
    t.check(!G.grade(s, key, s).penalties.some((x) => x.id === 'P6-keep-list' && x.applied), 'F2: no keep-list penalty from a preview');
    const n0 = s.ledger.length;
    SH.exec(s, 'ps', 'Rename-Computer -NewName ZZTEST1 -Restart:$false', { key });
    t.check(!s.ledger.slice(n0).some((l) => l.k === 'restart'), 'F3: -Restart:$false does not restart');
    const ids = SH.exec(s, 'ps', 'Get-Process', { key }).out.split('\n').slice(2).map((l) => l.trim().split(/\s+/));
    const one = SH.exec(s, 'ps', 'Get-Process msynchlp', { key }).out.split('\n')[2].trim().split(/\s+/);
    t.check(ids.some((x) => x[0] === 'msynchlp' && x[1] === one[1]), 'F4: a process keeps its Id under a name filter');
    SH.exec(s, 'ps', 'Stop-Process -Id ' + one[1], { key });
    t.check(!s.sys.processes.some((p) => p.name === 'msynchlp'), 'F4: Stop-Process -Id ends the process the Id names');
    const r2 = W.perfect('d7-mal4b', [0, 2], { skipRepair: true, skipP8: true });
    const id2 = SH.exec(r2.state, 'ps', 'Get-Process msynchlp', { key: r2.key }).out.split('\n')[2].trim().split(/\s+/)[1];
    t.check(/SUCCESS/.test(SH.exec(r2.state, 'ps', 'taskkill /PID ' + id2 + ' /F', { key: r2.key }).out) && !r2.state.sys.processes.some((p) => p.name === 'msynchlp'), 'F4: taskkill /PID ends it too');
    const n1 = s.ledger.length;
    SH.exec(s, 'ps', 'Get-WinEvent -LogName NoSuchLog', { key });
    t.check(!s.ledger.slice(n1).some((l) => l.k === 'eventvwr'), 'F1: a query of a log that does not exist is not an Event Viewer diagnosis');
    SH.exec(s, 'ps', 'Get-WinEvent -LogName System', { key });
    t.check(s.ledger.slice(n1).some((l) => l.k === 'eventvwr'), 'F1: (could fail) a real log still is');
}

/* Mallory R5 L5: the answer-sheet tool trims the secret, so a test secret with whitespace is refused */
{
    const { execFileSync } = require('child_process');
    let out = '';
    try { out = execFileSync('node', [require('path').join(__dirname, 'mdfinal-walkthrough.js'), '--student', 'x'], { env: Object.assign({}, process.env, { MDFINAL_SEED_SECRET: ' ' + kit.TEST_SECRET + '\n' }), encoding: 'utf8' }); }
    catch (e) { out = String(e.stdout || ''); }
    t.check(/test secrets are refused/.test(out) && !/answer sheet/.test(out), 'a test secret with stray whitespace is refused by --student');
}

/* 13.19 item 7: I2 credits a value only after a route that displays it ran (Mallory R4 F1) */
{
    const ANS = kit.req('mdfinal-answers.js');
    const i2 = (r) => G.grade(r.snapshot, r.key, r.state).rows.find((x) => x.id === '8.2').parts[1];
    const cases = [
        [0, '41', (r) => SH.exec(r.state, 'ps', 'Get-WinEvent -LogName System', { key: r.key })],
        [1, 'mer_shellhook.dll', (r) => SH.exec(r.state, 'ps', 'Get-WinEvent -LogName Application | Format-List', { key: r.key })],
        [3, '1014', (r) => SH.exec(r.state, 'ps', 'Get-WinEvent -LogName System', { key: r.key })]
    ];
    for (const [v, val, route] of cases) {
        const r = W.perfect('d7-route-' + v + val, [0, v], { skipP8: true });
        /* the walk's repair ran its own diagnostic (the general gate), so only the display route differs */
        if (v === 0) { r.state.ledger = r.state.ledger.filter((l, i) => i < r.state.fault.appliedAtLedger || ['eventvwr', 'pnputil-enum'].indexOf(l.k) < 0); }
        if (v === 3) { r.state.ledger = r.state.ledger.filter((l, i) => i < r.state.fault.appliedAtLedger || l.k !== 'eventvwr'); }
        if (v === 1) { r.state.ledger = r.state.ledger.filter((l, i) => i < r.state.fault.appliedAtLedger || l.k !== 'eventvwr'); }
        ANS.save(r.state, 'I1', kit.req('mdfinal-faults.js').CATALOGUE[r.key.variant].category);
        ANS.save(r.state, 'I2', val);
        t.check(i2(r) === 0, 'I2 "' + val + '" (' + r.key.variant + ') with no route that shows it: 0');
        route(r);
        t.check(i2(r) === 2, 'I2 "' + val + '" (' + r.key.variant + ') after the route that shows it: 2');
    }
    /* mbafilt is read from pnputil while the driver is still there (Safe Mode, before the repair) */
    {
        const r = W.perfect('d7-route-mbafilt', [0, 0], { skipRepair: true, skipP8: true });
        GUI.act(r.state, 'winre', 'startup-settings', { option: 4 }, { key: r.key });
        ANS.save(r.state, 'I1', 'driver'); ANS.save(r.state, 'I2', 'mbafilt');
        t.check(i2(r) === 0, 'I2 "mbafilt" before pnputil ran: 0');
        SH.exec(r.state, 'ps', 'pnputil /enum-drivers', { key: r.key });
        t.check(i2(r) === 2, 'I2 "mbafilt" after pnputil listed it: 2');
    }
    /* Mallory R6 blocker 1: a route that SHOWED nothing does not count */
    {
        const r = W.perfect('d7-route-empty', [0, 3], { skipP8: true });
        r.state.ledger = r.state.ledger.filter((l, i) => i < r.state.fault.appliedAtLedger || l.k !== 'eventvwr');
        ANS.save(r.state, 'I1', 'name resolution'); ANS.save(r.state, 'I2', '1014');
        GUI.act(r.state, 'eventvwr', 'query', { log: 'Setup', id: 65535 }, { key: r.key });
        t.check(i2(r) === 0, 'an Event Viewer query that matched nothing does not credit 1014');
        const r3 = W.perfect('d7-route-empty3', [0, 2], { skipP8: true });
        r3.state.ledger = r3.state.ledger.filter((l, i) => i < r3.state.fault.appliedAtLedger || ['taskmgr-view', 'get-process'].indexOf(l.k) < 0);
        ANS.save(r3.state, 'I1', 'runaway process'); ANS.save(r3.state, 'I2', 'msynchlp');
        SH.exec(r3.state, 'ps', 'Get-Process -Name zzzz', { key: r3.key });
        t.check(i2(r3) === 0, 'Get-Process -Name <nothing> does not credit msynchlp');
        SH.exec(r3.state, 'ps', 'Get-Process -Name "x msynchlp"', { key: r3.key });
        t.check(i2(r3) === 0, 'an error that echoes a typed "msynchlp" does not credit it (Mallory R7)');
        const r4 = W.perfect('d7-route-decoy', [0, 3], { skipP8: true, skipRepair: true });
        r4.state.ledger = r4.state.ledger.filter((l, i) => i < r4.state.fault.appliedAtLedger || ['hosts-view', 'name-test'].indexOf(l.k) < 0);
        ANS.save(r4.state, 'I1', 'name resolution'); ANS.save(r4.state, 'I2', r4.key.fault.decoyIp);
        SH.exec(r4.state, 'ps', 'ping ' + r4.key.fault.decoyIp, { key: r4.key });
        t.check(i2(r4) === 0, 'pinging the decoy IP itself does not credit it (only echoed, Mallory R8)');
        SH.exec(r4.state, 'ps', 'ping ' + r4.state.wo.lob.fqdn, { key: r4.key });
        t.check(i2(r4) === 2, '(could fail) pinging the LOB name shows the decoy it resolves to: credited');
    }
    /* Nancy R7 lows (13.22): nslookup, Select-String, Format-Table -Wrap */
    {
        const H = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
        const fresh = (uid) => {
            const r = W.perfect(uid, [0, 3], { skipP8: true, skipRepair: true });
            r.state.ledger = r.state.ledger.filter((l, i) => i < r.state.fault.appliedAtLedger || ['hosts-view', 'name-test'].indexOf(l.k) < 0);
            ANS.save(r.state, 'I1', 'name resolution'); ANS.save(r.state, 'I2', r.key.fault.decoyIp);
            return r;
        };
        const ex = (r, l) => SH.exec(r.state, 'ps', l, { key: r.key }).out;
        const r5 = fresh('d7-low-ns');
        const ns = ex(r5, 'nslookup ' + r5.state.wo.lob.fqdn);
        t.check(ns.indexOf(r5.key.fault.decoyIp) < 0 && i2(r5) === 0, 'nslookup never shows the hosts decoy, so it does not credit it');
        t.check(ex(r5, 'Select-String -Path ' + H + ' -Pattern zzzz') === '' && i2(r5) === 0, 'Select-String that matched no line credits nothing');
        const n0 = r5.state.ledger.length;
        t.check(/empty string/.test(ex(r5, 'Select-String -Path ' + H + ' -Pattern ""')) && r5.state.ledger.length === n0, 'an empty pattern is refused before the file is read (no view logged)');
        const hit = ex(r5, 'Select-String -Path ' + H + ' -Pattern ' + r5.state.wo.lob.host);
        t.check(hit.indexOf(H + ':') === 0 && hit.indexOf(r5.key.fault.decoyIp) > 0 && i2(r5) === 2, '(could fail) Select-String -Path shows the decoy line as path:line:text: credited');
        const r6 = fresh('d7-low-gc');
        t.check(ex(r6, 'Get-Content ' + H + ' | Select-String zzzz') === '' && i2(r6) === 0, 'Get-Content | Select-String filters (it used to print the whole file)');
        t.check(ex(r6, 'Get-Content ' + H + ' | sls ' + r6.state.wo.lob.host).split('\n').length === 1 && i2(r6) === 2, '(could fail) Get-Content | sls shows one matching line: credited');
        t.check(/^Get-Content : Cannot find path/.test(ex(r6, 'Get-Content C:\\nope.txt | Select-String zzzz')), 'a Get-Content error is printed, not filtered away');
        const w = ex(r6, 'Get-WinEvent -LogName System -MaxEvents 3 | Format-Table -Wrap');
        t.check(/responded\./.test(w) && !/\.\.\.$/m.test(w), 'Format-Table -Wrap shows the whole Message');
        t.check(ex(r6, 'Get-WinEvent -LogName System -MaxEvents 3 | ft -AutoSize').split('\n').some((l) => /responded\.$/.test(l)), 'Format-Table -AutoSize fits the Message on one line');
        t.check(/\.\.\.$/m.test(ex(r6, 'Get-WinEvent -LogName System -MaxEvents 3 | Format-Table')), '(baseline) plain Format-Table still truncates');
        const evs = ex(r6, 'Get-WinEvent -LogName System -MaxEvents 5 | Select-String 1014').split('\n');
        t.check(evs.length >= 1 && evs.every((l) => / 1014 /.test(l)), 'Select-String on events keeps only the matching rows');
        /* the faulting module of V2 is past the table's cut: only -Wrap (or a list) shows it */
        const r7 = W.perfect('d7-low-wrap', [0, 1], { skipP8: true });
        r7.state.ledger = r7.state.ledger.filter((l, i) => i < r7.state.fault.appliedAtLedger || l.k !== 'eventvwr');
        ANS.save(r7.state, 'I1', kit.req('mdfinal-faults.js').CATALOGUE[r7.key.variant].category); ANS.save(r7.state, 'I2', 'mer_shellhook.dll');
        ex(r7, 'Get-WinEvent -LogName Application');
        t.check(i2(r7) === 0, 'a truncated table that cuts the module name off does not credit it');
        ex(r7, 'Get-WinEvent -LogName Application | Format-Table -Wrap');
        t.check(i2(r7) === 2, '(could fail) the same events with -Wrap show it: credited');
        const r8 = W.perfect('d7-low-ns-ok', [0, 3], { skipP8: true });
        const ok = ex(r8, 'nslookup ' + r8.state.wo.lob.fqdn), last = r8.state.ledger[r8.state.ledger.length - 1];
        t.check(/Address: +\S+$/.test(ok) && ok.indexOf(r8.key.fault.decoyIp) < 0 && last.k === 'name-test' && last.seen.indexOf(r8.key.fault.decoyIp) < 0, 'repaired: nslookup shows the real LOB address and stamps no decoy');
        /* broken DNS: nslookup times out and stamps nothing at all (Nancy R9: the Meridian-DNS branch) */
        const r9 = fresh('d7-low-ns-to');
        const to = ex(r9, 'nslookup ' + r9.state.wo.lob.host), tl = r9.state.ledger[r9.state.ledger.length - 1];
        t.check(/timed-out/.test(to) && tl.k === 'name-test' && tl.seen === '', 'nslookup on the vendor DNS shows the timeout and stamps nothing');

        /* Select-String switches and forms (Nancy R9 survivors) */
        const r10 = fresh('d7-low-sls');
        const host = r10.state.wo.lob.host, hostLow = host.toLowerCase();
        const lines = (o) => o === '' ? [] : o.split('\n');
        const all = lines(ex(r10, 'Get-Content ' + H));
        const notm = lines(ex(r10, 'Get-Content ' + H + ' | Select-String -NotMatch ' + host));
        t.check(notm.length === all.length - 1 && notm.every((l) => l.toLowerCase().indexOf(hostLow) < 0), '-NotMatch prints every line except the match (no phantom empty line)');
        /* the hosts file holds the FQDN in lower case only, so its upper-case form matches only without -CaseSensitive */
        const FQ = r10.state.wo.lob.fqdn.toUpperCase();
        t.check(FQ !== r10.state.wo.lob.fqdn && lines(ex(r10, 'Get-Content ' + H + ' | Select-String ' + FQ)).length === 1, '(baseline) without -CaseSensitive the upper-case FQDN finds its line');
        t.check(ex(r10, 'Get-Content ' + H + ' | Select-String -CaseSensitive ' + FQ) === '', '-CaseSensitive: the upper-case FQDN finds nothing');
        t.check(lines(ex(r10, 'Get-Content ' + H + ' | Select-String -CaseSensitive ' + r10.state.wo.lob.fqdn)).length === 1, '-CaseSensitive: the exact case still matches');
        const pos = ex(r10, 'Select-String ' + host + ' ' + H), sls = ex(r10, 'sls -Pattern ' + host + ' -Path ' + H), lit = ex(r10, 'Select-String -LiteralPath ' + H + ' -Pattern ' + host);
        t.check(pos.indexOf(H + ':') === 0 && pos === sls && sls === lit, 'Select-String <pattern> <file>, sls and -LiteralPath give the same path:line:text');
        t.check(/literal text/.test(ex(r10, 'Get-Content ' + H + ' | Select-String "' + host + '|zz"')), 'a regex-looking pattern that matches nothing says the match is literal');
        t.check(ex(r10, 'Get-Content ' + H + ' | Select-String zzzz') === '', 'a plain pattern that matches nothing prints nothing');
        t.check(/^Get-Process : /.test(ex(r10, 'Get-Process -Name zzzz | Select-String qqqq')), 'another producer\'s error is printed, not filtered away');
        /* F3: the BitLocker recovery-key file on TECH-USB ends in a line break; no phantom empty line */
        const keyFile = 'F:\\' + r10.state.host.usb.F.files[0].name;
        const kl = lines(ex(r10, 'Get-Content "' + keyFile + '" | Select-String -NotMatch zzzz'));
        const kp = lines(ex(r10, 'Select-String -Path "' + keyFile + '" -Pattern zzzz -NotMatch'));
        t.check(r10.state.host.usb.F.files[0].text.slice(-1) === '\n' && kl.length >= 1 && kl[kl.length - 1] !== '' && !/:\d+:$/.test(kp[kp.length - 1]), 'a file ending in a line break gives no empty last match (Nancy R9 F3)');
        const svc = lines(ex(r10, 'Get-Service | Select-Object -ExpandProperty Name | Select-String s'));
        t.check(svc.length >= 1 && svc.every((l) => l.toLowerCase().indexOf('s') >= 0), 'values piped to Select-String are filtered one per line');
        /* F2: a student file whose text looks like an error is still filtered */
        SH.exec(r10.state, 'ps', 'Set-Content F:\\note.txt "Note : first"', { key: r10.key });
        t.check(ex(r10, 'Get-Content F:\\note.txt | Select-String zzzz') === '', 'a file whose first line reads "Note : x" is filtered, not printed (Nancy R9 F2)');

        /* Mallory R9 F1: a stage that filters every row away leaves nothing credited */
        const r11 = W.perfect('d7-low-gp', [0, 2], { skipP8: true, skipRepair: true });
        r11.state.ledger = r11.state.ledger.filter((l, i) => i < r11.state.fault.appliedAtLedger || ['taskmgr-view', 'get-process'].indexOf(l.k) < 0);
        ANS.save(r11.state, 'I1', 'runaway process'); ANS.save(r11.state, 'I2', 'msynchlp');
        ex(r11, 'Get-Process | Select-String zzzz'); ex(r11, 'Get-Process | Measure-Object'); ex(r11, 'Get-Process | Where-Object Name -eq zzzz');
        t.check(i2(r11) === 0, 'Get-Process filtered to nothing (Select-String, Measure-Object, Where-Object) credits nothing (Mallory R9 F1)');
        /* Mallory R9 F1b: a typed property name comes back as a header, or as a list label */
        ex(r11, 'Get-Process | Select-Object msynchlp'); ex(r11, 'Get-Process | Select-Object msynchlp,Id | Format-Table -Wrap'); ex(r11, 'Get-Process | Select-Object msynchlp | Format-List');
        t.check(i2(r11) === 0, 'a typed property name echoed as a header or list label credits nothing (Mallory R9 F1b)');
        ['Get-Process | Select-Object "x : msynchlp" | Format-List', 'Get-Process | Select-Object "x : mersync : msynchlp",Id | Format-List',
         'Get-Process | Select-Object "Id : msynchlp" | fl', 'Get-Process | Select-Object "x : msynchlp" | Format-List -Property "x : msynchlp"'].forEach((l) => ex(r11, l));
        t.check(i2(r11) === 0, 'a typed property name holding " : " in a list label credits nothing (Mallory R9 F1c)');
        ex(r11, 'Get-Process | Format-Table Id'); ex(r11, 'Get-Process | Format-List Id');
        t.check(i2(r11) === 0, 'Format-Table/Format-List narrowed to Id hide the names: nothing credited');
        const nm = ex(r11, 'Get-Process | Select-Object Name,CPU');
        t.check(/msynchlp/.test(nm) && i2(r11) === 2, '(could fail) Select-Object Name, PowerShell\'s alias of ProcessName, shows the names: credited');
        const r11b = W.perfect('d7-low-gp2', [0, 2], { skipP8: true, skipRepair: true });
        r11b.state.ledger = r11b.state.ledger.filter((l, i) => i < r11b.state.fault.appliedAtLedger || ['taskmgr-view', 'get-process'].indexOf(l.k) < 0);
        ANS.save(r11b.state, 'I1', 'runaway process'); ANS.save(r11b.state, 'I2', 'msynchlp');
        ex(r11b, 'Get-Process | Format-List');
        t.check(i2(r11b) === 2, '(could fail) Get-Process | Format-List shows the names as values: credited');
        const r11c = W.perfect('d7-low-gp3', [0, 2], { skipP8: true, skipRepair: true });
        r11c.state.ledger = r11c.state.ledger.filter((l, i) => i < r11c.state.fault.appliedAtLedger || ['taskmgr-view', 'get-process'].indexOf(l.k) < 0);
        ANS.save(r11c.state, 'I1', 'runaway process'); ANS.save(r11c.state, 'I2', 'msynchlp');
        const fb = ex(r11c, 'Get-Process | Format-Table nosuchcolumn');
        t.check(/msynchlp/.test(fb) && i2(r11c) === 2, '(could fail) Format-Table with an unknown property falls back to the full view: credited');
        ex(r11, 'Get-Process | Select-String msynch');
        t.check(i2(r11) === 2, '(could fail) Get-Process | Select-String that keeps the row: credited');
        const r12 = fresh('d7-low-tnc');
        ex(r12, 'Test-NetConnection ' + r12.state.wo.lob.fqdn + ' | Select-String zzzz');
        t.check(i2(r12) === 0, 'Test-NetConnection filtered to nothing credits no decoy (Mallory R9 F1)');
        ex(r12, 'Test-NetConnection ' + r12.state.wo.lob.fqdn + ' | Select-Object ' + r12.key.fault.decoyIp);
        t.check(i2(r12) === 0, 'a typed decoy IP echoed as a column header credits nothing (Mallory R9 F1b)');
        ex(r12, 'Test-NetConnection ' + r12.state.wo.lob.fqdn);
        t.check(i2(r12) === 2, '(could fail) Test-NetConnection that shows the decoy: credited');
        /* the failed-boot stamp is NOT cut to the reply: a console restart from Safe Mode returns no
         * text, and the stop screen is what the page shows */
        const r13 = W.perfect('d7-low-7b', [0, 0], { skipP8: true, skipRepair: true });
        r13.state.ledger = r13.state.ledger.filter((l, i) => i < r13.state.fault.appliedAtLedger || l.k !== 'winre-view');
        ANS.save(r13.state, 'I1', kit.req('mdfinal-faults.js').CATALOGUE[r13.key.variant].category); ANS.save(r13.state, 'I2', '0x0000007B');
        t.check(i2(r13) === 0, '(baseline) V1 stop code with no stop screen seen: 0');
        GUI.act(r13.state, 'winre', 'startup-settings', { option: 4 }, { key: r13.key });
        const rs = ex(r13, 'shutdown /r');
        t.check(rs === '' && r13.state.screen === 'winre' && i2(r13) === 2, 'a console restart into the stop screen credits the stop code though the reply is empty');

        /* wrap edges, on the renderer itself (Nancy R9) */
        const C = kit.req('mdfinal-cmdlets.js');
        const body = (rows, o) => C.table(rows, ['M'], o).split('\n').slice(2);
        t.check(JSON.stringify(body([{ M: 'x'.repeat(100) }], { wrap: true })) === JSON.stringify(['x'.repeat(40), 'x'.repeat(40), 'x'.repeat(20)]), 'a 100-character word wraps as 40, 40, 20');
        /* a column is as wide as its longest cell up to 40, so wrapping at a space starts past 40 */
        const a19 = 'a'.repeat(19), a20 = 'a'.repeat(20), b20 = 'b'.repeat(20);
        t.check(JSON.stringify(body([{ M: a19 + ' ' + b20 }], { wrap: true })) === JSON.stringify([a19 + ' ' + b20]), 'a 40-character cell fills its column exactly and stays on one line');
        t.check(JSON.stringify(body([{ M: a20 + ' ' + b20 }], { wrap: true })) === JSON.stringify([a20, b20]), 'a 41-character cell moves its last word to the next line');
        t.check(JSON.stringify(body([{ M: 'first line\nsecond' }], { wrap: true })) === JSON.stringify(['first line', 'second']), 'a multi-line cell wraps at its own line breaks');
        t.check(C.table([{ M: 'a'.repeat(30) + '\n' + 'b'.repeat(30), N: 'z' }], ['M', 'N'], { wrap: true }).split('\n')[2] === 'a'.repeat(30) + ' z', 'a multi-line cell is as wide as its longest line, not its total length');
    }
    /* a value shown only by an unledgered window keeps the general gate */
    const z = W.perfect('d7-route-v3', [0, 2], { skipP8: true });
    ANS.save(z.state, 'I1', 'runaway process'); ANS.save(z.state, 'I2', 'MerSync');
    t.check(i2(z) === 2, 'I2 "MerSync" (Startup tab only) is credited under the general diagnostic gate');
}

/* ── Nancy R6 fixes ── */
(async () => {
    const SK = require('./mdfinal-svc-kit.js');
    const EXAM = kit.req('mdfinal-exam.js');
    const ADMIN = { admin: true, email: 'a@x.test' };
    let sameVariant = 0, n = 0, carried = 0;
    for (let i = 0; i < 40; i++) {
        const uid = 'd7-nl-' + i;
        const f = await SK.started(uid);
        await EXAM.handover(f.st, { sessionId: f.sid, confirm: true }, f.o);
        await EXAM.submitExam(f.st, { sessionId: f.sid }, f.o);
        const before = EXAM.fromDocument(await f.st.get(f.sid));
        /* a penalty recorded on the voided lab's lineage */
        const d = await f.st.get(f.sid); const lin = JSON.parse(d.lineageJson); lin.penalties = ['P3-guest']; d.lineageJson = JSON.stringify(lin); f.st.raw()[f.sid] = d;
        await EXAM.resetSession(f.st, { sessionId: f.sid, callerUid: 'adm', targetUid: uid, token: ADMIN, adminEmails: [], reason: 'outage', evidence: 'INC' }, f.o);
        const after = EXAM.fromDocument(await f.st.get(f.sid));
        n++;
        if (after.answerKey.variant === before.answerKey.variant) { sameVariant++; }
        if (after.lineage.penalties.length) { carried++; }
    }
    t.check(n === 40 && sameVariant === 0, 'a restart onto a new lab always deals a different fault variant (' + sameVariant + ' of ' + n + ' the same)');
    t.check(carried === 0, 'no penalty from the voided lab carries onto the new lab (' + carried + ')');
    const FA = kit.req('mdfinal-faults.js');
    const k4 = kit.req('mdfinal-core.js').buildAnswerKey(SK.naturalUid(0, 3, 'd7-dns-'), 'md100-final-2026', { secret: kit.TEST_SECRET });
    t.check(FA.evidenceRoutes(k4)[FA.normEvidence(FA.VENDOR_DNS[0])] === null, 'the vendor DNS keeps the general gate (shown in unledgered Network Connections)');
    const s = { studentId: 'u', submittedAt: 1, report: { total: 80, rows: [], phases: { P1: { score: 1, max: 1 } } }, lineage: { selfResets: 1, adminResets: 1 }, provisionedAt: null, autoSubmitted: false };
    t.check(/selfReset:1 adminReset:1/.test(EXAM.totalsCsv([s])), 'the handler CSV carries the reset flags');
    t.done();
})();

