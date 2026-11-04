#!/usr/bin/env node
/**
 * mdfinal-p1.test.js — D2: install phase (P1) of the MD-100 final, end to end.
 *
 * @catalog what    CHECKS totals vs spec 3.5/3.6; canonical P1 = 16/16 on every profile x variant by
 * @catalog what    both the GUI and the console path; 15 single-change negatives; wizard defaults,
 * @catalog what    defaultInstalledState and do-nothing; R3 action gate; R4 console refusals.
 * @catalog run     node _tools/mdfinal/mdfinal-p1.test.js
 * @catalog status  TOOL
 *
 * NEGATIVES ARE EXACT. Each fixture is the canonical walk with ONE change. The test asserts the
 * expected parts of the target row, that every other P1 row is identical to the perfect run, and
 * the exact set of applied penalties. Knock-ons into later phases (declared in CHECKS) cannot move
 * P1 rows, so for P1 "every other row unchanged" is literal.
 */
const kit = require('./mdfinal-test-kit.js');
const W = require('./mdfinal-walk.js');
const CH = kit.req('mdfinal-checks.js');
const G = kit.req('mdfinal-grade.js');
const GUI = kit.req('mdfinal-gui.js');
const SH = kit.req('mdfinal-shell.js');
const CORE = kit.req('mdfinal-core.js');
const LIM = kit.req('mdfinal-limits.js');
const t = kit.harness('mdfinal-p1');

const P1 = ['1.1', '1.2', '1.3', '1.4'];
const near = (a, b) => Math.abs(a - b) < 1e-9;
const rowOf = (g, id) => g.rows.find((r) => r.id === id);

/* ── 1. CHECKS as data (3.1, 3.5, 3.6) ── */
{
    const C = CH.CHECKS;
    const sum = (f) => C.reduce((a, r) => a + (f(r) ? r.points : 0), 0);
    t.check(C.length === 24 && sum(() => true) === 100, '24 rows totalling 100');
    const phases = { P1: 16, P2: 9, P3: 10, P4: 15, P5: 17, P6: 11, P7: 15, P8: 7 };
    t.check(Object.keys(phases).every((p) => sum((r) => r.phase === p) === phases[p]), 'phase totals match 3.5');
    const obj = { 1: 20, 2: 7, 3: 9, 4: 5, 5: 6, 6: 9, 7: 17, 8: 23, 9: 4 };
    t.check(Object.keys(obj).every((o) => sum((r) => r.objective === Number(o)) === obj[o]), 'objective totals match 3.6');
    t.check(Object.keys(obj).every((o) => sum((r) => r.objective === Number(o)) >= (o === '9' ? 4 : 5)), 'objective floors hold');
    t.check(C.every((r) => r.parts.reduce((a, p) => a + p.points, 0) === r.points && Number.isInteger(r.points)), 'parts sum to each integer row');
    t.check(C.every((r) => r.id && r.phase && r.objective && r.basis && Array.isArray(r.knockOn) && typeof r.negative === 'string' && r.negative.length > 5), 'every row has id/phase/objective/basis/knockOn/negative');
    t.check(new Set(C.map((r) => r.id)).size === 24, 'row ids unique');
    t.check(C.every((r) => r.knockOn.every((k) => C.some((x) => x.id === k) && k !== r.id)), 'knock-ons name real other rows');
    const ap = []; C.forEach((r) => r.parts.forEach((p) => { if (p.actionParam) ap.push(r.id + ':' + p.id); }));
    t.check(JSON.stringify(ap) === JSON.stringify(['1.1:gen2', '1.1:vtpm', '1.2:build']), 'action-parameter parts are exactly Gen2, vTPM, build (13.7)');
    t.check(P1.every((id) => typeof C.find((r) => r.id === id).check === 'function'), 'P1 rows implemented');
    t.check(Object.isFrozen(C) && Object.isFrozen(C[0]) && Object.isFrozen(C[0].parts), 'CHECKS frozen');
}

/* ── 2. canonical P1 = 16/16 on all 12 classes, GUI path and console path ── */
let bad = [];
for (const c of CORE.variantSpace()) {
    for (const path of ['p1Gui', 'p1Shell']) {
        for (const seed of [0, 1]) {
            const { state, key } = W.sitting('p1-' + path + '-' + c.profileIndex + c.variantIndex + '-' + seed, [c.profileIndex, c.variantIndex]);
            try { W[path](state, key); } catch (e) { bad.push(c.profile + '/' + c.variant + ' ' + path + ' threw: ' + e.message); continue; }
            const g = G.grade(state, key);
            if (g.phases.P1.score !== 16 || g.penalties.some((p) => p.applied)) {
                bad.push(c.profile + '/' + c.variant + ' ' + path + ' P1=' + g.phases.P1.score + ' ' + P1.map((id) => id + '=' + rowOf(g, id).score).join(' '));
            }
            if (state.screen !== 'desktop' || state.os.activation.status !== 'Licensed') { bad.push(c.profile + '/' + c.variant + ' ' + path + ' not at a licensed desktop'); }
        }
    }
}
t.check(bad.length === 0, 'canonical P1 = 16/16, no penalty, licensed desktop: 12 classes x 2 paths x 2 seeds' + (bad.length ? ': ' + bad.slice(0, 3).join(' | ') : ''));

/* ── 3. single-change negatives ── */
function run(profileIndex, o, uid) {
    const { state, key } = W.sitting(uid || 'neg-' + profileIndex, [profileIndex, 0]);
    W.p1Gui(state, key, o);
    return { g: G.grade(state, key), state, key };
}
const perfect = [0, 1, 2].map((p) => run(p, {}));
const NEG = [
    /* [label, profile, options, row, expected parts, penalties applied] */
    ['Gen1 + LabConfig bypass', 0, { generation: 1, labConfig: ['BypassTPMCheck', 'BypassSecureBootCheck'] }, '1.1', [0, 0, 1, 1], []],
    ['dynamic memory', 0, { dynamicMemory: true }, '1.1', [1, 1, 0, 1], []],
    ['wrong vCPU', 0, { vcpu: 1, labConfig: ['BypassCPUCheck'] }, '1.1', [1, 1, 0, 1], []],
    ['VHDX left at 127 GB', 0, { vhdxGB: 127 }, '1.1', [1, 1, 1, 0], []],
    ['Gen2 without vTPM + BypassTPMCheck', 0, { vtpm: false, labConfig: ['BypassTPMCheck'] }, '1.1', [1, 0, 1, 1], []],
    ['Pro on CORP-SEC', 1, { edition: 'Pro' }, '1.2', [1, 0], []],
    ['Windows 10 ISO', 0, { iso: 'Win10_22H2_x64.iso', edition: 'Pro' }, '1.2', [0, 0], []],
    ['Next on the whole unallocated disk', 0, { autoLayout: true }, '1.3', [0, 0], []],
    ['install on the archive disk (60 GB archive)', 0, { installOnArchive: true, uid: 'neg-arch60-0' }, '1.3', [0, 0], ['P1-archive']],
    ['archive partition deleted in Setup, Windows on the right disk', 0, { deleteArchiveOnly: true }, null, null, ['P1-archive']],
    ['Optional diagnostics', 0, { privacy: { diagnosticData: 'Optional' } }, '1.4', [1, 2 * 5 / 6, 1, 1], []],
    ['retail COA decoy', 0, { ipk: '__retail__' }, '1.4', [1, 2, 0, 0], []],
    ['wrong /skms host', 0, { skms: '10.255.255.1' }, '1.4', [1, 2, 1, 0], []],
    ['KMS FQDN with lab DHCP DNS (4.1 knock-on)', 0, { skms: '__fqdn__' }, '1.4', [1, 2, 1, 0], []],
    ['MAK on a KMS profile', 0, { useMak: true }, '1.4', [1, 2, 0, 1], []],
    ['technician name wrong', 0, { accountName: 'mertech' }, '1.4', [0, 2, 1, 1], []],
    ['Secure Boot switched off', 0, { secureBootOff: true }, null, null, ['P1-secureboot']],
    ['no activation at all', 2, { skipActivation: true }, '1.4', [1, 2, 0, 0], []]
];
for (const [label, prof, o0, row, parts, pens] of NEG) {
    const o = Object.assign({}, o0);
    const probe = W.sitting('neg-' + prof, [prof, 0]).state;
    if (o.ipk === '__retail__') { o.ipk = probe.wo.retailCoa; }
    if (o.skms === '__fqdn__') { o.skms = probe.wo.network.kms.fqdn; }
    let r;
    try { r = run(prof, o, o.uid); } catch (e) { t.check(false, 'negative ' + label + ' threw: ' + e.message); continue; }
    const base = perfect[prof].g;
    if (row) {
        const got = rowOf(r.g, row).parts;
        t.check(got.length === parts.length && got.every((x, i) => near(x, parts[i])), 'negative ' + label + ': ' + row + ' = ' + JSON.stringify(got.map((x) => +x.toFixed(4))));
    }
    const others = P1.filter((id) => id !== row);
    const moved = others.filter((id) => !near(rowOf(r.g, id).score, rowOf(base, id).score));
    t.check(moved.length === 0, 'negative ' + label + ': no other P1 row moves' + (moved.length ? ' (moved ' + moved.join(',') + ')' : ''));
    const applied = r.g.penalties.filter((p) => p.applied).map((p) => p.id);
    t.check(JSON.stringify(applied) === JSON.stringify(pens), 'negative ' + label + ': penalties ' + JSON.stringify(applied));
}
/* every P1 part is driven to a loss by at least one negative (no part without a fixture, 3.7) */
{
    const lost = new Set();
    for (const [, , , row, parts] of NEG) {
        if (!row) continue;
        const def = CH.CHECKS.find((x) => x.id === row);
        parts.forEach((v, i) => { if (v < def.parts[i].points) lost.add(row + ':' + def.parts[i].id); });
    }
    const all = []; CH.CHECKS.filter((r) => r.phase === 'P1').forEach((r) => r.parts.forEach((p) => all.push(r.id + ':' + p.id)));
    const missing = all.filter((x) => !lost.has(x));
    t.check(missing.length === 0, 'every P1 part has a negative fixture' + (missing.length ? ' (missing ' + missing.join(', ') + ')' : ''));
    t.check(CH.PENALTIES.filter((p) => p.phase === 'P1').every((p) => NEG.some((n) => n[5].includes(p.id))), 'every P1 penalty has a fixture');
}
/* archive damage through diskpart clean is the same penalty */
{
    const { state, key } = W.sitting('neg-clean', [0, 0]);
    W.A(state, 'hyperv', 'new-vm', { name: 'MER-WS', generation: 2, memoryMB: state.wo.vm.startupMemoryMB, vhdxGB: state.wo.vm.vhdxGB, iso: 'Win11_24H2_Business_x64.iso' });
    W.A(state, 'hyperv', 'start');
    const arch = state.disks.find((d) => d.role === 'archive');
    W.X(state, 'setup-cmd', 'diskpart'); W.X(state, 'setup-cmd', 'select disk ' + arch.n); W.X(state, 'setup-cmd', 'clean', 'succeeded');
    t.check(G.grade(state, key).penalties.find((p) => p.id === 'P1-archive').applied, 'diskpart clean on the archive applies the archive penalty');
}

/* ── 4. defaults (3.2, 13.7) ── */
{
    const s0 = W.sitting('defaults-nothing', [0, 0]);
    const g0 = G.grade(s0.state, s0.key);
    t.check(g0.phases.P1.score === 0 && g0.rows.filter((r) => r.implemented).every((r) => r.score === 0), 'do nothing: every implemented row 0');
    const s1 = W.sitting('defaults-wizard', [0, 0]);
    W.wizardDefaults(s1.state);
    t.check(s1.state.setup && s1.state.setup.screen === 'cant-run' && !s1.state.os, 'wizard defaults: Setup refuses Windows 11, nothing installs');
    t.check(G.grade(s1.state, s1.key).phases.P1.score === 0, 'wizard defaults: P1 = 0');
    for (const p of [0, 1, 2]) {
        const s2 = W.sitting('defaults-installed-' + p, [p, 0]);
        W.defaultInstalledState(s2.state);
        const g2 = G.grade(s2.state, s2.key);
        const scored = [];
        g2.rows.filter((r) => r.implemented).forEach((r) => {
            const def = CH.CHECKS.find((x) => x.id === r.id);
            r.parts.forEach((v, i) => { if (v > 0) scored.push(r.id + ':' + def.parts[i].id + (def.parts[i].actionParam ? '' : '!')); });
        });
        t.check(JSON.stringify(scored) === JSON.stringify(['1.1:gen2', '1.1:vtpm', '1.2:build']), 'defaultInstalledState (profile ' + p + ') scores only the action-parameter parts: ' + scored.join(','));
        t.check(s2.state.screen === 'desktop' && s2.state.os.edition === 'Home', 'defaultInstalledState reaches a Home desktop');
    }
}

/* ── 5. the R3 action gate ── */
{
    const { state } = W.sitting('gate', [0, 0]);
    const before = JSON.stringify(state);
    const refused = (w, a, p, why) => { const r = GUI.act(state, w, a, p); return !r.ok && r.msg === GUI.GENERIC && (!why || String(r.refused).indexOf(why) === 0); };
    t.check(GUI.schemaGaps().length === 0, 'schema and handlers match');
    t.check(GUI.KEY_RE_SOURCE === LIM.LIMITS.params.keyPattern, 'key pattern literal equals the limits constant');
    t.check(refused('hyperv', 'format-c', {}, 'unknown action'), 'unknown action refused');
    t.check(refused('setup', 'lang', {}, 'screen'), 'Setup action on the host screen refused');
    t.check(refused('activation', 'activate', {}, 'screen'), 'desktop action before install refused');
    t.check(refused('hyperv', 'new-vm', JSON.parse('{"__proto__":{"x":1},"name":"a","generation":2,"memoryMB":8192,"vhdxGB":100}')), '__proto__ key refused');
    t.check(refused('hyperv', 'new-vm', { name: 'a', generation: 2, memoryMB: 8192, vhdxGB: 100, constructor: 1 }, 'unknown key'), 'constructor key refused');
    t.check(refused('hyperv', 'new-vm', { name: 'a', generation: 2, memoryMB: 8192, vhdxGB: 100, extra: 1 }, 'unknown key'), 'extra key refused');
    t.check(refused('hyperv', 'new-vm', { name: 'a', generation: '2', memoryMB: 8192, vhdxGB: 100 }, 'bad int'), 'string where int expected refused');
    t.check(refused('hyperv', 'new-vm', { name: 'a', generation: 2.5, memoryMB: 8192, vhdxGB: 100 }, 'bad int'), 'fractional int refused');
    t.check(refused('hyperv', 'new-vm', { name: 'x'.repeat(101), generation: 2, memoryMB: 8192, vhdxGB: 100 }, 'bad string'), 'long string refused');
    t.check(refused('hyperv', 'new-vm', { name: 'a', generation: 2, memoryMB: 8192 }, 'missing'), 'missing required refused');
    t.check(refused('hyperv', 'new-vm', { name: { a: { b: { c: { d: 1 } } } }, generation: 2, memoryMB: 8192, vhdxGB: 100 }, 'params too deep'), 'depth 5 refused');
    t.check(refused('hyperv', 'new-vm', { name: 'y'.repeat(4100), generation: 2, memoryMB: 8192, vhdxGB: 100 }, 'params too large'), 'over 4096 bytes refused');
    t.check(refused('hyperv', 'new-vm', ['a']) && refused('hyperv', 'new-vm', null) && refused('hyperv', 'new-vm', 'str'), 'non-object params refused');
    t.check(refused('vm-settings', 'apply', { secureBootTemplate: 'Evil' }, 'bad enum'), 'enum enforced');
    t.check(refused('__proto__', 'x', {}) && refused('constructor', 'name', {}), 'prototype window names refused');
    t.check(JSON.stringify(state) === before, 'every refusal left the state byte-identical');
    const full = W.sitting('gate-ledger', [0, 0]).state;
    for (let i = 0; i < LIM.LIMITS.ledger.maxEntries; i++) full.ledger.push({ i, k: 'filler', ref: '' });
    const fb = JSON.stringify(full);
    const r = GUI.act(full, 'hyperv', 'new-vm', { name: 'a', generation: 2, memoryMB: 8192, vhdxGB: 100 });
    t.check(!r.ok && r.msg === LIM.STORAGE_MESSAGE && JSON.stringify(full) === fb, 'ledger at its cap: action refused, state unchanged');
    const shr = SH.exec(full, 'hyperv-ps', 'New-VM -Name a -Generation 2 -MemoryStartupBytes 8GB -NewVHDPath a.vhdx -NewVHDSizeBytes 100GB');
    t.check(shr.out === LIM.STORAGE_MESSAGE && !full.vm, 'ledger at its cap: command refused');
}

/* ── 6. R4 console refusals and realism ── */
{
    const { state, key } = W.sitting('shell', [0, 0]);
    const out = (ctx, line) => SH.exec(state, ctx, line).out;
    for (const line of ['Get-VM | Remove-VM', 'Start-VM -Name $(Get-VM)', '& Start-VM', 'Start-VM; Remove-VM', '[System.IO.File]::Delete("x")',
        'iex "Remove-VM"', 'Invoke-Expression x', 'Get-VM > out.txt', 'powershell -c Remove-VM', 'Add-Type -TypeDefinition x', 'Start-Job { 1 }']) {
        const o = out('hyperv-ps', line);
        t.check(o === SH.DENY_MSG || o === SH.SCRIPTBLOCK_MSG, 'refused: ' + line);
    }
    t.check(out('hyperv-ps', 'x'.repeat(501)) === SH.LIMIT_MSG, '501 characters refused');
    t.check(out('hyperv-ps', Array(66).fill('a').join(' ')) === SH.LIMIT_MSG, '65 tokens refused');
    t.check(out('hyperv-ps', 'New-VM -Name "unterminated') .indexOf('terminator') >= 0, 'unbalanced quote refused');
    t.check(out('hyperv-ps', 'Format-Volume -DriveLetter C').indexOf('is not recognized as the name of a cmdlet') >= 0, 'unknown cmdlet gets the real PowerShell error');
    t.check(out('ps', 'slmgr /dlv') === 'That console is not available.', 'desktop console unavailable before Windows exists');
    t.check(out('setup-cmd', 'reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassTPMCheck /t REG_DWORD /d 1 /f') === 'That console is not available.', 'Setup console unavailable before Setup runs');
    W.X(state, 'hyperv-ps', 'New-VM -Name MER-WS -Generation 2 -MemoryStartupBytes 8GB -NewVHDPath MER-WS.vhdx -NewVHDSizeBytes 160GB');
    t.check(state.vm && state.vm.dynamicMemory === false && state.vm.memoryMB === 8192, 'New-VM creates static memory, as the cmdlet does');
    t.check(out('hyperv-ps', 'Enable-VMTPM -VMName MER-WS').indexOf('key protector') >= 0 && !state.vm.vtpm, 'Enable-VMTPM needs a key protector first');
    W.X(state, 'hyperv-ps', 'Set-VMFirmware -VMName MER-WS -SecureBootTemplate MicrosoftUEFICertificateAuthority');
    W.X(state, 'hyperv-ps', 'Add-VMDvdDrive -VMName MER-WS -Path Win11_24H2_Business_x64.iso');
    W.X(state, 'hyperv-ps', 'Start-VM -Name MER-WS');
    t.check(state.screen === 'firmware-error' && !state.setup, 'UEFI CA template blocks the Windows image at firmware');
    t.check(out('hyperv-ps', 'Set-VMProcessor -VMName MER-WS -Count 4').indexOf('current state') >= 0, 'processor change refused while running');
    W.X(state, 'hyperv-ps', 'Stop-VM -Name MER-WS');
    W.X(state, 'hyperv-ps', 'Set-VMFirmware -VMName MER-WS -SecureBootTemplate MicrosoftWindows');
    W.X(state, 'hyperv-ps', 'Start-VM -Name MER-WS');
    t.check(state.screen === 'setup', 'Windows template boots Setup');
    t.check(out('setup-cmd', 'reg add HKLM\\SOFTWARE\\Microsoft\\Windows /v X /t REG_DWORD /d 1 /f').indexOf('unable to find') >= 0, 'reg add outside LabConfig refused in Setup');
    t.check(out('setup-cmd', 'reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassTPMCheck /t REG_SZ /d 1 /f').indexOf('REG_DWORD') >= 0, 'LabConfig as REG_SZ refused');
    t.check(out('setup-cmd', 'reg add HKEY_LOCAL_MACHINE\\\\SYSTEM\\Setup\\LabConfig\\ /v bypasstpmcheck /t REG_DWORD /d 0x1 /f').indexOf('completed successfully') >= 0 && state.setup.labConfig.BypassTPMCheck === 1, 'hive alias, doubled/trailing backslash, case and hex accepted');
    t.check(out('setup-cmd', 'reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassEverything /t REG_DWORD /d 1 /f').indexOf('unable to find') >= 0, 'unknown LabConfig value refused');
    t.check(out('setup-cmd', 'format c:').indexOf('is not recognized as an internal or external command') >= 0, 'unknown cmd command gets the real cmd error');
    W.X(state, 'setup-cmd', 'diskpart');
    const arch = state.disks.find((d) => d.role === 'archive');
    W.X(state, 'setup-cmd', 'select disk ' + arch.n);
    W.X(state, 'setup-cmd', 'select partition 1');
    t.check(out('setup-cmd', 'delete partition').indexOf('protected partition') >= 0, 'MSR delete needs override');
    t.check(out('setup-cmd', 'convert mbr').indexOf('not convertible') >= 0, 'convert refused on a disk with partitions');
    t.check(out('setup-cmd', 'select disk 99').indexOf('not valid') >= 0, 'invalid disk refused');
    t.check(G.grade(state, key).penalties.every((p) => p.id !== 'P1-archive' || !p.applied), 'reading the archive in diskpart does not damage it');
}

/* ── 7. realism details the mutation round showed were unasserted ── */
{
    /* each Windows 11 requirement alone makes Setup refuse; its own LabConfig bypass lets it through */
    const cases = [
        ['no vTPM', { generation: 2, vtpm: false, vcpu: 2, memoryMB: 8192 }, 'BypassTPMCheck'],
        ['1 vCPU', { generation: 2, vtpm: true, vcpu: 1, memoryMB: 8192 }, 'BypassCPUCheck'],
        ['2048 MB', { generation: 2, vtpm: true, vcpu: 2, memoryMB: 2048 }, 'BypassRAMCheck'],
        ['Gen1 (TPM + Secure Boot)', { generation: 1, vcpu: 2, memoryMB: 8192 }, null]
    ];
    for (const [label, hw, bypass] of cases) {
        const reach = (bypasses) => {
            const { state } = W.sitting('compat-' + label, [0, 0]);
            W.A(state, 'hyperv', 'new-vm', { name: 'V', generation: hw.generation, memoryMB: hw.memoryMB, vhdxGB: 160, iso: 'Win11_24H2_Business_x64.iso' });
            const set = { vcpu: hw.vcpu }; if (hw.vtpm) set.vtpm = true;
            W.A(state, 'vm-settings', 'apply', set);
            W.A(state, 'hyperv', 'start');
            for (const b of bypasses) W.X(state, 'setup-cmd', 'reg add HKLM\\SYSTEM\\Setup\\LabConfig /v ' + b + ' /t REG_DWORD /d 1 /f', 'completed');
            W.A(state, 'setup', 'lang'); W.A(state, 'setup', 'option', { agree: true }); W.A(state, 'setup', 'key', { noKey: true });
            W.A(state, 'setup', 'edition', { edition: 'Pro' });
            return state.setup.screen;
        };
        t.check(reach([]) === 'cant-run', 'Setup refuses Windows 11 with ' + label);
        const bys = bypass ? [bypass] : ['BypassTPMCheck', 'BypassSecureBootCheck'];
        t.check(reach(bys) === 'eula', label + ' passes with ' + bys.join('+'));
        if (!bypass) { t.check(reach(['BypassTPMCheck']) === 'cant-run' && reach(['BypassSecureBootCheck']) === 'cant-run', 'Gen1 needs both bypasses'); }
    }
    /* Windows 10 media has no Windows 11 hardware check */
    {
        const { state } = W.sitting('compat-win10', [0, 0]);
        W.A(state, 'hyperv', 'new-vm', { name: 'V', generation: 1, memoryMB: 2048, vhdxGB: 160, iso: 'Win10_22H2_x64.iso' });
        W.A(state, 'hyperv', 'start'); W.A(state, 'setup', 'lang'); W.A(state, 'setup', 'option', { agree: true }); W.A(state, 'setup', 'key', { noKey: true });
        W.A(state, 'setup', 'edition', { edition: 'Pro' });
        t.check(state.setup.screen === 'eula', 'Windows 10 Setup accepts a Gen1 1-vCPU VM');
    }
    /* a GVLK for another edition is refused by slmgr and changes nothing */
    {
        const { state, key } = W.sitting('ipk-mismatch', [0, 0]);
        W.p1Gui(state, key, { skipActivation: true });
        const r = SH.exec(state, 'ps', 'slmgr /ipk ' + kit.req('mdfinal-pc.js').GVLK['Enterprise']);
        t.check(r.out.indexOf('0xC004F069') >= 0 && state.os.activation.key === null && state.os.edition === 'Pro', 'Enterprise GVLK on Pro: 0xC004F069, key and edition unchanged');
    }
    /* Home cannot use Domain join instead: the Microsoft account page has no way forward offline */
    {
        const { state } = W.sitting('home-oobe', [0, 0]);
        W.A(state, 'hyperv', 'new-vm', { name: 'V', generation: 2, memoryMB: 8192, vhdxGB: 160, iso: 'Win11_24H2_Consumer_x64.iso' });
        W.A(state, 'vm-settings', 'apply', { vcpu: 2, vtpm: true }); W.A(state, 'hyperv', 'start');
        W.A(state, 'setup', 'lang'); W.A(state, 'setup', 'option', { agree: true }); W.A(state, 'setup', 'key', { noKey: true });
        W.A(state, 'setup', 'edition', { edition: 'Home' }); W.A(state, 'setup', 'eula', { accept: true });
        W.A(state, 'setup', 'install', { disk: W.osDisk(state).n, part: 'unallocated' });
        W.A(state, 'oobe', 'region'); W.A(state, 'oobe', 'keyboard'); W.A(state, 'oobe', 'name', { skip: true });
        t.check(state.os.oobe.screen === 'msa', 'Home OOBE goes to the Microsoft account page');
        const r = GUI.act(state, 'oobe', 'msa-next', {});
        t.check(!r.ok && r.msg.indexOf('lost internet') >= 0, 'Microsoft account page cannot proceed offline');
        t.check(!GUI.act(state, 'oobe', 'domain-join-instead', {}).ok && !GUI.act(state, 'oobe', 'setup-type', { type: 'work' }).ok, 'Home offers no work or school path');
        /* the whole-disk layout Setup made */
        const types = W.osDisk(state).partitions.map((x) => x.type).join(',');
        t.check(types === 'EFI,MSR,Primary,Recovery', 'Next on unallocated makes EFI, MSR, Windows, Recovery (' + types + ')');
        t.check(Math.abs(kit.req('mdfinal-pc.js').cSizeGb(state) - (160 - (100 + 16 + 750) / 1024)) < 1e-9, 'whole-disk C: is the disk minus the system partitions');
    }
    /* a bare script block gets the script-block message; LabConfig names under another key do nothing */
    {
        const { state } = W.sitting('sb', [0, 0]);
        t.check(SH.exec(state, 'hyperv-ps', '{ Remove-VM }').out === SH.SCRIPTBLOCK_MSG, 'bare script block refused with the script-block message');
        W.A(state, 'hyperv', 'new-vm', { name: 'V', generation: 2, memoryMB: 8192, vhdxGB: 160, iso: 'Win11_24H2_Business_x64.iso' });
        W.A(state, 'hyperv', 'start');
        SH.exec(state, 'setup-cmd', 'reg add HKLM\\SOFTWARE\\Policies\\LabConfig /v BypassTPMCheck /t REG_DWORD /d 1 /f');
        SH.exec(state, 'setup-cmd', 'reg add HKLM\\SYSTEM\\Setup /v BypassTPMCheck /t REG_DWORD /d 1 /f');
        t.check(!state.setup.labConfig.BypassTPMCheck, 'a LabConfig value name under any other key sets nothing');
        let r2, threw = null;
        try { r2 = SH.exec(state, 'setup-cmd', 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 2 /f'); } catch (e) { threw = e.message; }
        t.check(!threw && r2.out.indexOf('unable to find') >= 0 && !state.os && !state.identity, 'in Setup, a whitelisted non-LabConfig value is refused and touches nothing');
    }
}

/* ── 8. Nancy D2 findings ── */
{
    const PC = kit.req('mdfinal-pc.js');
    const g13 = (state, key) => rowOf(G.grade(state, key), '1.3').parts;
    /* run P1 up to the Setup disk page */
    const toDisk = (uid, prof) => {
        const { state, key } = W.sitting(uid, [prof || 0, 0]);
        const wo = state.wo;
        W.A(state, 'hyperv', 'new-vm', { name: 'MER-WS', generation: 2, memoryMB: wo.vm.startupMemoryMB, vhdxGB: wo.vm.vhdxGB, iso: 'Win11_24H2_Business_x64.iso' });
        W.A(state, 'vm-settings', 'apply', { vcpu: wo.vm.vcpu, vtpm: true }); W.A(state, 'hyperv', 'start');
        W.A(state, 'setup', 'lang'); W.A(state, 'setup', 'option', { agree: true }); W.A(state, 'setup', 'key', { noKey: true });
        W.A(state, 'setup', 'edition', { edition: key.edition }); W.A(state, 'setup', 'eula', { accept: true });
        return { state, key, wo, d: W.osDisk(state) };
    };
    const finishOobe = (state, key) => { W.oobe(state, key, {}); W.activate(state, key, {}); };

    /* F2: explicit evidence is about the partition Windows is on */
    {
        const { state, key, d } = toDisk('f2-a');
        W.A(state, 'setup', 'new', { disk: d.n, sizeMB: 2048 + 116 });
        W.A(state, 'setup', 'delete', { disk: d.n, part: d.partitions.find((x) => x.type === 'Primary').id });
        W.A(state, 'setup', 'install', { disk: d.n, part: 'unallocated' });
        finishOobe(state, key);
        t.check(JSON.stringify(g13(state, key)) === '[0,0]', 'create, delete, then Next on unallocated: 1.3 = 0/3');
    }
    {
        const { state, key, d } = toDisk('f2-b');
        W.X(state, 'setup-cmd', 'diskpart'); W.X(state, 'setup-cmd', 'select disk ' + d.n); W.X(state, 'setup-cmd', 'convert gpt');
        W.X(state, 'setup-cmd', 'create partition efi size=100'); W.X(state, 'setup-cmd', 'exit'); W.X(state, 'setup-cmd', 'exit');
        W.A(state, 'setup', 'install', { disk: d.n, part: 'unallocated' });
        finishOobe(state, key);
        t.check(g13(state, key)[0] === 0, 'diskpart EFI only, then Next on unallocated: target-explicit 0');
    }
    {
        /* auto layout into a hole exactly the WO size: size scores, explicit does not */
        const { state, key, wo, d } = toDisk('f2-c');
        W.X(state, 'setup-cmd', 'diskpart'); W.X(state, 'setup-cmd', 'select disk ' + d.n); W.X(state, 'setup-cmd', 'convert gpt');
        W.X(state, 'setup-cmd', 'create partition efi size=100'); W.X(state, 'setup-cmd', 'create partition msr size=16');
        W.X(state, 'setup-cmd', 'create partition primary size=' + (wo.vm.vhdxGB * 1024 - 116 - wo.disks.cGB * 1024), 'succeeded');
        W.X(state, 'setup-cmd', 'exit'); W.X(state, 'setup-cmd', 'exit');
        W.A(state, 'setup', 'install', { disk: d.n, part: 'unallocated' });
        finishOobe(state, key);
        t.check(JSON.stringify(g13(state, key)) === '[0,2]', 'Next on an unallocated hole of the WO size: 1.3 = [0,2] (' + JSON.stringify(g13(state, key)) + ')');
    }
    for (const [label, deltaGB, want] of [['WO + 2 GB', 2, '[1,0]'], ['WO - 1 GB', -1, '[1,2]'], ['WO + 1 GB', 1, '[1,2]'], ['WO - 2 GB', -2, '[1,0]']]) {
        const { state, key } = W.sitting('f2-size' + deltaGB, [0, 0]);
        W.p1Gui(state, key, { cGB: state.wo.disks.cGB + deltaGB });
        t.check(JSON.stringify(g13(state, key)) === want, 'C: at ' + label + ': 1.3 = ' + want + ' (' + JSON.stringify(g13(state, key)) + ')');
    }

    /* F1: every ledger ref is server text, even after a hostile walk */
    {
        const { state, key } = W.sitting('f1', [0, 0]);
        W.p1Gui(state, key, { accountName: 'x&y(){}$z' });
        GUI.act(state, 'desktop', 'restart', {});
        const editions = new Set([].concat(...Object.values(PC.ISO_LIBRARY).map((x) => x.editions)));
        const okRef = (e) => {
            const r = e.ref;
            if (r === '' || /^gen[12]$/.test(r) || /^disk\d{1,2}(-(GPT|MBR))?$/.test(r) || ['KMS', 'MAK', 'Retail', 'edition', 'domain-join-instead', 'limited-setup',
                'deleted', 'formatted', 'clean', 'installed-over'].includes(r) || editions.has(r) || /^[01]{6}$/.test(r)) return true;
            if (/^Bypass(TPM|SecureBoot|RAM|CPU)Check=[01]$/.test(r)) return true;
            if (/^Windows 1[01]\|[A-Za-z ]+\|disk\d{1,2}$/.test(r) && editions.has(r.split('|')[1])) return true;
            const keys = Object.keys(GUI.ACTION_SCHEMA['vm-settings/apply'].params).concat(['viaCmdlet']);
            if (e.k === 'vm-set' && r.split(',').every((x) => keys.includes(x))) return true;
            return false;
        };
        const badRefs = state.ledger.filter((e) => !okRef(e));
        t.check(badRefs.length === 0 && !JSON.stringify(state.ledger).includes('&y'), 'every ledger ref is server text after a hostile walk' + (badRefs.length ? ': ' + JSON.stringify(badRefs.slice(0, 3)) : ''));
        t.check(!!state.identity.users['x&y(){}$z'], 'a name with &, (), {} and $ is legal in Windows and accepted');
        {
            const s4 = W.sitting('f1c', [0, 0]);
            W.p1Gui(s4.state, s4.key, { skipActivation: true });
            for (const bad of ['a<b', 'a/b', 'a"b', 'Administrator', 'x'.repeat(21)]) {
                const st = JSON.parse(JSON.stringify(s4.state)); st.os.oobe.done = false; st.os.oobe.screen = 'account'; st.screen = 'oobe';
                t.check(!GUI.act(st, 'oobe', 'account', { name: bad, password: 'p' }).ok, 'OOBE refuses account name ' + JSON.stringify(bad.slice(0, 12)));
            }
        }
        const s2 = W.sitting('f1b', [0, 0]);
        W.p1Gui(s2.state, s2.key, { accountName: 'Tech-01' });
        t.check(!s2.state.ledger.some((e) => e.ref.indexOf('Tech-01') >= 0 || e.ref.indexOf(s2.state.wo.hostname) >= 0), 'account and host names never reach the ledger');
    }

    /* F3: the archive penalty survives deleting and recreating the VM, for every way of damaging it */
    for (const how of ['setup-delete', 'diskpart-delete', 'diskpart-clean']) {
        const { state, key } = W.sitting('f3-' + how, [0, 0]);
        const wo = state.wo;
        W.A(state, 'hyperv', 'new-vm', { name: 'V1', generation: 2, memoryMB: wo.vm.startupMemoryMB, vhdxGB: wo.vm.vhdxGB, iso: 'Win11_24H2_Business_x64.iso' });
        W.A(state, 'vm-settings', 'apply', { vcpu: wo.vm.vcpu, vtpm: true });
        W.A(state, 'hyperv', 'start');
        const arch = state.disks.find((x) => x.role === 'archive');
        if (how === 'setup-delete') {
            W.A(state, 'setup', 'lang'); W.A(state, 'setup', 'option', { agree: true }); W.A(state, 'setup', 'key', { noKey: true });
            W.A(state, 'setup', 'edition', { edition: 'Pro' }); W.A(state, 'setup', 'eula', { accept: true });
            W.A(state, 'setup', 'delete', { disk: arch.n, part: arch.partitions.find((x) => x.files).id });
        } else {
            W.X(state, 'setup-cmd', 'diskpart'); W.X(state, 'setup-cmd', 'select disk ' + arch.n);
            if (how === 'diskpart-clean') { W.X(state, 'setup-cmd', 'clean', 'succeeded'); }
            else { W.X(state, 'setup-cmd', 'select partition 2'); W.X(state, 'setup-cmd', 'delete partition', 'deleted'); }
        }
        W.A(state, 'hyperv', 'stop'); W.A(state, 'hyperv', 'delete-vm');
        const s2 = state;
        W.p1Gui(s2, key, {});
        const pen = G.grade(s2, key).penalties.find((p) => p.id === 'P1-archive');
        t.check(pen.applied && G.grade(s2, key).phases.P1.score === 14, how + ', delete VM, rebuild perfectly: archive penalty still applied (P1 = 14)');
    }

    /* F4: a failed /ato retry keeps an existing activation */
    {
        const { state, key } = W.sitting('f4', [0, 0]);
        W.p1Gui(state, key, {});
        W.X(state, 'ps', 'slmgr /skms bogus.example');
        const r = SH.exec(state, 'ps', 'slmgr /ato');
        t.check(r.out.indexOf('Error') >= 0 && state.os.activation.status === 'Licensed' && rowOf(G.grade(state, key), '1.4').parts[3] === 1, 'failed /ato after activation: still Licensed');
        W.X(state, 'ps', 'slmgr /ipk ' + PC.GVLK['Pro']);
        t.check(state.os.activation.status === 'Notification', 'installing a key again resets the status (real /ipk behaviour)');
    }

    /* F5: partition cap */
    {
        const { state, d } = toDisk('f5');
        W.X(state, 'setup-cmd', 'diskpart'); W.X(state, 'setup-cmd', 'select disk ' + d.n); W.X(state, 'setup-cmd', 'convert gpt');
        let outs = [];
        for (let i = 0; i < 10; i++) outs.push(SH.exec(state, 'setup-cmd', 'create partition primary size=1024').out);
        t.check(d.partitions.length === LIM.LIMITS.objects.partitionsPerDisk && outs[8].indexOf('maximum number of partitions') >= 0, 'diskpart stops at ' + LIM.LIMITS.objects.partitionsPerDisk + ' partitions');
        W.X(state, 'setup-cmd', 'exit'); W.X(state, 'setup-cmd', 'exit');
        const r = GUI.act(state, 'setup', 'new', { disk: d.n, sizeMB: 1024 });
        t.check(!r.ok && r.msg.indexOf('maximum number of partitions') >= 0, 'Setup New refused at the cap');
    }

    /* F6: 1.1 scores the VM settings without an installed OS */
    {
        const { state, key } = W.sitting('f6', [0, 0]);
        const wo = state.wo;
        W.A(state, 'hyperv', 'new-vm', { name: 'V', generation: 2, memoryMB: wo.vm.startupMemoryMB, vhdxGB: wo.vm.vhdxGB, iso: 'Win11_24H2_Business_x64.iso' });
        W.A(state, 'vm-settings', 'apply', { vcpu: wo.vm.vcpu, vtpm: true });
        t.check(JSON.stringify(rowOf(G.grade(state, key), '1.1').parts) === '[1,1,1,1]', 'perfect VM, nothing installed: 1.1 = 4/4');
    }

    /* F7: reinstall from the DVD replaces a wrong install */
    {
        const { state, key } = W.sitting('f7', [1, 0]);   /* CORP-SEC: Enterprise */
        W.p1Gui(state, key, { edition: 'Pro' });
        t.check(rowOf(G.grade(state, key), '1.2').score === 1, 'wrong edition first: 1.2 = 1');
        W.A(state, 'hyperv', 'boot-dvd', {});
        t.check(state.screen === 'setup', 'press any key boots Setup over an installed PC');
        W.A(state, 'setup', 'lang'); W.A(state, 'setup', 'option', { agree: true }); W.A(state, 'setup', 'key', { noKey: true });
        W.A(state, 'setup', 'edition', { edition: 'Enterprise' }); W.A(state, 'setup', 'eula', { accept: true });
        const d = W.osDisk(state);
        W.A(state, 'setup', 'install', { disk: d.n, part: state.os.systemPartition });
        W.oobe(state, key, {}); W.activate(state, key, {});
        const g = G.grade(state, key);
        t.check(g.phases.P1.score === 16 && state.os.edition === 'Enterprise', 'reinstall with the right edition on the same partition: P1 = 16');
    }

    /* privacy: each of the six toggles alone */
    for (const k of PC.PRIVACY_KEYS) {
        const { state, key } = W.sitting('pv-' + k, [0, 0]);
        W.p1Gui(state, key, { privacy: { [k]: k === 'diagnosticData' ? 'Optional' : true } });
        t.check(near(rowOf(G.grade(state, key), '1.4').parts[1], 2 * 5 / 6), 'privacy ' + k + ' left on: 1.67/2');
    }

    /* grading never reads state.wo */
    for (const p of [0, 1, 2]) {
        const { state, key } = W.sitting('nowo-' + p, [p, 0]);
        W.p1Gui(state, key, {});
        const before = JSON.stringify(G.grade(state, key));
        const blind = JSON.parse(JSON.stringify(state)); delete blind.wo;
        let after; try { after = JSON.stringify(G.grade(blind, key)); } catch (e) { after = 'threw ' + e.message; }
        t.check(before === after, 'grade identical with state.wo removed (profile ' + p + ')');
    }

    /* defaultInstalledState on the Business ISO (Education, work or school only) */
    for (const p of [0, 1, 2]) {
        const s3 = W.sitting('defaults-business-' + p, [p, 0]);
        W.defaultInstalledBusiness(s3.state);
        const g3 = G.grade(s3.state, s3.key);
        const scored = [];
        g3.rows.filter((r) => r.implemented).forEach((r) => {
            const def = CH.CHECKS.find((x) => x.id === r.id);
            r.parts.forEach((v, i) => { if (v > 0) scored.push(r.id + ':' + def.parts[i].id); });
        });
        t.check(JSON.stringify(scored) === JSON.stringify(['1.1:gen2', '1.1:vtpm', '1.2:build']) && s3.state.os.edition === 'Education', 'Business-ISO defaults (profile ' + p + ') score only the action-parameter parts');
    }
}

t.done();
