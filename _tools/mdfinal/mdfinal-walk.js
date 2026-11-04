/**
 * mdfinal-walk.js — drives sittings through the real action table and shell, for the suites.
 *
 * @catalog what    Canonical P1 build (GUI path and command path) per profile, plus the fixture
 * @catalog what    states the MD-100 final suites grade: wizard defaults, defaultInstalledState.
 * @catalog run     (library; required by the mdfinal suites)
 * @catalog status  TOOL
 *
 * EVERY STEP GOES THROUGH gui.act() OR shell.exec(), never through mdfinal-pc.js directly, so a
 * walkthrough proves what a student can actually do from the page, including the R3 gate. A step
 * that the engine refuses throws, naming the step, so a broken canonical path is loud.
 *
 * The walk reads the WO the student is shown (state.wo) plus, for the edition, the key: deriving
 * the edition from the prose is the student's job, and the walk is the answer to it.
 */
const kit = require('./mdfinal-test-kit.js');
const CORE = kit.req('mdfinal-core.js');
const GUI = kit.req('mdfinal-gui.js');
const SH = kit.req('mdfinal-shell.js');
const GRADE = kit.req('mdfinal-grade.js');
const PC = kit.req('mdfinal-pc.js');

const EX = 'md100-final-2026';
const opts = { secret: kit.TEST_SECRET };

/* A fresh sitting: state and key. `forced` = [profileIndex, variantIndex] for the 12 classes. */
function sitting(uid, forced) {
    if (forced) { return CORE.generateForced(uid, EX, opts, forced[0], forced[1]); }
    return { state: CORE.generate(uid, EX, opts), key: GRADE.buildAnswerKey(uid, EX, opts) };
}

/* One GUI action that must succeed. */
function A(state, win, action, params, label) {
    const r = GUI.act(state, win, action, params || {});
    if (!r.ok) { throw new Error('walk step failed: ' + (label || win + '/' + action) + ': ' + r.msg + (r.refused ? ' [' + r.refused + ']' : '')); }
    return r;
}
/* One console line; `expect` (optional) must appear in the output. */
function X(state, ctx, line, expect) {
    const r = SH.exec(state, ctx, line);
    if (expect !== undefined && String(r.out).indexOf(expect) < 0) { throw new Error('walk command failed: ' + line + ' -> ' + r.out); }
    return r;
}

function osDisk(state) { return state.disks.find((d) => d.role === 'os'); }
function lastPrimary(disk) { const p = disk.partitions.filter((x) => x.type === 'Primary'); return p[p.length - 1]; }

const PRIVACY_OFF = { location: false, findMyDevice: false, diagnosticData: 'Required', inking: false, tailored: false, advertisingId: false };

/* Canonical P1 through the GUI. Options let a negative fixture change exactly one thing. */
function p1Gui(s, key, o) {
    o = o || {};
    const wo = s.wo;
    A(s, 'hyperv', 'new-vm', { name: 'MER-WS', generation: o.generation || 2, memoryMB: o.memoryMB || wo.vm.startupMemoryMB,
        dynamicMemory: o.dynamicMemory === true, vhdxGB: o.vhdxGB || wo.vm.vhdxGB, switch: 'Meridian-LAN',
        iso: o.iso || 'Win11_24H2_Business_x64.iso' });
    const vmSet = { vcpu: o.vcpu || wo.vm.vcpu };
    if ((o.generation || 2) === 2 && o.vtpm !== false) { vmSet.vtpm = true; }
    A(s, 'vm-settings', 'apply', vmSet);
    if (o.secureBootOff) { A(s, 'vm-settings', 'apply', { secureBoot: false }); }
    A(s, 'hyperv', 'start');
    if (o.labConfig) {
        for (const v of o.labConfig) { X(s, 'setup-cmd', 'reg add HKLM\\SYSTEM\\Setup\\LabConfig /v ' + v + ' /t REG_DWORD /d 1 /f', 'completed successfully'); }
    }
    A(s, 'setup', 'lang', {});
    A(s, 'setup', 'option', { agree: true });
    A(s, 'setup', 'key', { noKey: true });
    A(s, 'setup', 'edition', { edition: o.edition || key.edition });
    if (s.setup && s.setup.screen === 'cant-run') { throw new Error('walk: Setup refused the hardware'); }
    A(s, 'setup', 'eula', { accept: true });
    let target = osDisk(s);
    if (o.installOnArchive) {
        target = s.disks.find((d) => d.role === 'archive');
        const data = target.partitions.find((x) => x.files);
        A(s, 'setup', 'delete', { disk: target.n, part: data.id });
    }
    if (o.deleteArchiveOnly) {
        const arch = s.disks.find((d) => d.role === 'archive');
        A(s, 'setup', 'delete', { disk: arch.n, part: arch.partitions.find((x) => x.files).id });
    }
    if (o.autoLayout) {
        A(s, 'setup', 'install', { disk: target.n, part: 'unallocated' });
    } else {
        A(s, 'setup', 'new', { disk: target.n, sizeMB: (o.cGB || wo.disks.cGB) * 1024 + 116 });
        A(s, 'setup', 'install', { disk: target.n, part: lastPrimary(target).id });
    }
    oobe(s, key, o);
    activate(s, key, o);
    return s;
}

/* OOBE: region, keyboard, name, work or school > Domain join instead, technician, privacy. */
function oobe(s, key, o) {
    o = o || {};
    A(s, 'oobe', 'region', {});
    A(s, 'oobe', 'keyboard', {});
    A(s, 'oobe', 'name', { hostname: s.wo.hostname });
    if (s.os.oobe.screen === 'msa') {
        X(s, 'oobe-cmd', 'oobe\\bypassnro');
        A(s, 'oobe', 'region', {}); A(s, 'oobe', 'keyboard', {}); A(s, 'oobe', 'name', { hostname: s.wo.hostname });
        A(s, 'oobe', 'limited-setup', {});
    } else {
        A(s, 'oobe', 'setup-type', { type: 'work' });
        A(s, 'oobe', 'domain-join-instead', {});
    }
    A(s, 'oobe', 'account', { name: o.accountName || s.wo.technician, password: 'Lab-Pass-2026' });
    A(s, 'oobe', 'privacy', Object.assign({}, PRIVACY_OFF, o.privacy || {}));
}

/* Activation: KMS through slmgr with the KMS host by IP; MAK through Settings > Activation. */
function activate(s, key, o) {
    o = o || {};
    if (o.skipActivation) { return; }
    if (key.channel === 'KMS' && !o.useMak) {
        X(s, 'ps', 'slmgr /ipk ' + (o.ipk || PC.GVLK[s.os.edition]));
        X(s, 'ps', 'slmgr /skms ' + (o.skms || s.wo.network.kms.ip));
        X(s, 'ps', 'slmgr /ato');
    } else {
        GUI.act(s, 'activation', 'change-key', { key: o.ipk || s.wo.mak });
    }
}

/* Canonical P1 through the consoles: Hyper-V PowerShell, diskpart from Shift+F10, slmgr. */
function p1Shell(s, key) {
    const wo = s.wo;
    X(s, 'hyperv-ps', 'New-VM -Name MER-WS -Generation 2 -MemoryStartupBytes ' + wo.vm.startupMemoryMB + 'MB -NewVHDPath MER-WS.vhdx -NewVHDSizeBytes ' + wo.vm.vhdxGB + 'GB -SwitchName Meridian-LAN', 'MER-WS');
    X(s, 'hyperv-ps', 'Set-VMProcessor -VMName MER-WS -Count ' + wo.vm.vcpu, '');
    X(s, 'hyperv-ps', 'Set-VMKeyProtector -VMName MER-WS -NewLocalKeyProtector', '');
    X(s, 'hyperv-ps', 'Enable-VMTPM -VMName MER-WS', '');
    X(s, 'hyperv-ps', 'Add-VMDvdDrive -VMName MER-WS -Path C:\\ISO\\Win11_24H2_Business_x64.iso', '');
    X(s, 'hyperv-ps', 'Start-VM -Name MER-WS', '');
    const n = osDisk(s).n;
    X(s, 'setup-cmd', 'diskpart', 'DiskPart');
    X(s, 'setup-cmd', 'select disk ' + n, 'is now the selected disk');
    X(s, 'setup-cmd', 'convert gpt', 'converted');
    X(s, 'setup-cmd', 'create partition efi size=100', 'succeeded');
    X(s, 'setup-cmd', 'format quick fs=fat32 label="System"', 'formatted');
    X(s, 'setup-cmd', 'create partition msr size=16', 'succeeded');
    X(s, 'setup-cmd', 'create partition primary size=' + (wo.disks.cGB * 1024), 'succeeded');
    X(s, 'setup-cmd', 'format quick fs=ntfs label="Windows"', 'formatted');
    X(s, 'setup-cmd', 'exit', 'Leaving');
    X(s, 'setup-cmd', 'exit', '');
    A(s, 'setup', 'lang', {});
    A(s, 'setup', 'option', { agree: true });
    A(s, 'setup', 'key', { noKey: true });
    A(s, 'setup', 'edition', { edition: key.edition });
    A(s, 'setup', 'eula', { accept: true });
    A(s, 'setup', 'install', { disk: n, part: lastPrimary(osDisk(s)).id });
    oobe(s, key, {});
    if (key.channel === 'KMS') {
        X(s, 'ps', 'slmgr /ipk ' + PC.GVLK[s.os.edition], 'successfully');
        X(s, 'ps', 'slmgr /skms ' + s.wo.network.kms.ip, 'successfully');
        X(s, 'ps', 'slmgr /ato', 'activated successfully');
    } else {
        X(s, 'ps', 'slmgr /ipk ' + s.wo.mak, 'successfully');
        X(s, 'ps', 'slmgr /ato', 'activated successfully');
    }
    return s;
}

/* Every Hyper-V wizard default: Gen1, 1024 MB dynamic, 1 vCPU, 127 GB, the consumer ISO. Setup
 * refuses Windows 11 at the edition page; returns the state at that point. */
function wizardDefaults(s) {
    A(s, 'hyperv', 'new-vm', { name: 'New Virtual Machine', generation: 1, memoryMB: 1024, dynamicMemory: true, vhdxGB: 127,
        switch: 'Not Connected', iso: 'Win11_24H2_Consumer_x64.iso' });
    A(s, 'hyperv', 'start');
    A(s, 'setup', 'lang', {}); A(s, 'setup', 'option', { agree: true }); A(s, 'setup', 'key', { noKey: true });
    A(s, 'setup', 'edition', { edition: 'Home' });
    return s;
}

/* defaultInstalledState (spec 3.2, 13.7 item 1): the least a student can change and still get
 * Windows 11 installed on a Gen2 VM, then every default after that. */
function defaultInstalledState(s) {
    A(s, 'hyperv', 'new-vm', { name: 'New Virtual Machine', generation: 2, memoryMB: 4096, dynamicMemory: true, vhdxGB: 127,
        switch: 'Not Connected', iso: 'Win11_24H2_Consumer_x64.iso' });
    A(s, 'vm-settings', 'apply', { vcpu: 2, vtpm: true });
    A(s, 'hyperv', 'start');
    A(s, 'setup', 'lang', {}); A(s, 'setup', 'option', { agree: true }); A(s, 'setup', 'key', { noKey: true });
    A(s, 'setup', 'edition', { edition: 'Home' });
    A(s, 'setup', 'eula', { accept: true });
    A(s, 'setup', 'install', { disk: osDisk(s).n, part: 'unallocated' });
    A(s, 'oobe', 'region', {}); A(s, 'oobe', 'keyboard', {}); A(s, 'oobe', 'name', { skip: true });
    X(s, 'oobe-cmd', 'oobe\\bypassnro');
    A(s, 'oobe', 'region', {}); A(s, 'oobe', 'keyboard', {}); A(s, 'oobe', 'name', { skip: true });
    A(s, 'oobe', 'limited-setup', {});
    A(s, 'oobe', 'account', { name: 'User', password: 'x' });
    A(s, 'oobe', 'privacy', {});
    return s;
}

/* defaultInstalledState on the Business ISO: its first edition is Education, which offers only the
 * work or school path, so the offline default is "Domain join instead" (Nancy D2). */
function defaultInstalledBusiness(s) {
    A(s, 'hyperv', 'new-vm', { name: 'New Virtual Machine', generation: 2, memoryMB: 4096, dynamicMemory: true, vhdxGB: 127,
        switch: 'Not Connected', iso: 'Win11_24H2_Business_x64.iso' });
    A(s, 'vm-settings', 'apply', { vcpu: 2, vtpm: true });
    A(s, 'hyperv', 'start');
    A(s, 'setup', 'lang', {}); A(s, 'setup', 'option', { agree: true }); A(s, 'setup', 'key', { noKey: true });
    A(s, 'setup', 'edition', { edition: 'Education' });
    A(s, 'setup', 'eula', { accept: true });
    A(s, 'setup', 'install', { disk: osDisk(s).n, part: 'unallocated' });
    A(s, 'oobe', 'region', {}); A(s, 'oobe', 'keyboard', {}); A(s, 'oobe', 'name', { skip: true });
    A(s, 'oobe', 'setup-type', { type: 'work' });
    A(s, 'oobe', 'domain-join-instead', {});
    A(s, 'oobe', 'account', { name: 'User', password: 'x' });
    A(s, 'oobe', 'privacy', {});
    return s;
}

module.exports = { defaultInstalledBusiness, EX, opts, sitting, A, X, p1Gui, p1Shell, oobe, activate, wizardDefaults, defaultInstalledState, osDisk, PRIVACY_OFF };
