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

t.done();
