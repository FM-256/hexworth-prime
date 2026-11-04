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

t.done();
