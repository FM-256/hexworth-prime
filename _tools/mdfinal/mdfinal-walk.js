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
    const nameStep = o.oobeSkipName ? { skip: true } : { hostname: s.wo.hostname };
    A(s, 'oobe', 'name', nameStep);
    if (s.os.oobe.screen === 'msa') {
        X(s, 'oobe-cmd', 'oobe\\bypassnro');
        A(s, 'oobe', 'region', {}); A(s, 'oobe', 'keyboard', {}); A(s, 'oobe', 'name', nameStep);
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

const JOIN_USER = 'MERIDIAN\\svc-wsjoin';
const JOIN_PW = 'Meridian-Join-2026';

/* Network settings P3's join depends on (row 4.1 itself is graded from D4). */
function ipv4(s, o) {
    o = o || {};
    const n = s.wo.network;
    if (o.ipDhcp) { A(s, 'ncpa', 'ipv4', { dhcp: true, dns1: n.dns[0], dns2: n.dns[1] }); return; }
    A(s, 'ncpa', 'ipv4', { dhcp: false, ip: n.ip, mask: o.ipMask || n.mask, gateway: o.ipGateway || n.gateway,
        dns1: o.dnsReversed ? n.dns[1] : n.dns[0], dns2: o.dnsReversed ? n.dns[0] : n.dns[1] });
}

/* Canonical P2 + P3 through the GUI (plus powercfg for the values a VM's GUI does not offer). */
function p23Gui(s, key, o) {
    o = o || {};
    const wo = s.wo;
    if (!o.skipIpv4) ipv4(s, o);
    if (o.renameAfterOobe) { A(s, 'settings', 'rename', { name: wo.hostname }); }
    if (!o.skipTz) A(s, 'settings', 'time-zone', { id: wo.timeZone });
    if (!o.skipCu) { A(s, 'settings', 'update-check', {}); A(s, 'settings', 'update-install', {}); }
    if (o.editBalanced) {
        A(s, 'power', 'edit-plan', { plan: 'Balanced', acDisplay: wo.power.acDisplayMin });
    } else {
        A(s, 'power', 'create-plan', { name: wo.power.planName, basedOn: 'Balanced', acDisplay: o.acDisplay || wo.power.acDisplayMin });
    }
    if (!o.skipAcSleep) X(s, 'ps', 'powercfg /change standby-timeout-ac ' + wo.power.acSleepMin);
    if (o.dcOnBalanced) {
        X(s, 'ps', 'powercfg /setactive SCHEME_BALANCED');
        X(s, 'ps', 'powercfg /change monitor-timeout-dc ' + wo.power.dcDisplayMin);
        X(s, 'ps', 'powercfg /change standby-timeout-dc ' + wo.power.dcSleepMin);
        A(s, 'power', 'set-active', { plan: wo.power.planName });
    } else {
        X(s, 'ps', 'powercfg /change monitor-timeout-dc ' + wo.power.dcDisplayMin);
        X(s, 'ps', 'powercfg /change standby-timeout-dc ' + wo.power.dcSleepMin);
    }
    if (!o.skipUser) A(s, 'lusrmgr', 'user-new', { name: wo.user.name, fullName: wo.user.fullName, password: 'User-Pass-1', mustChange: o.mustChange === true, neverExpires: o.mustChange !== true });
    A(s, 'lusrmgr', 'user-new', { name: wo.secondMember.name, fullName: wo.secondMember.fullName, password: 'User-Pass-2', mustChange: false, neverExpires: true });
    if (!o.skipGroup) {
        A(s, 'lusrmgr', 'group-new', { name: wo.group });
        if (!o.skipUser) A(s, 'lusrmgr', 'group-add', { group: wo.group, member: wo.user.name });
        A(s, 'lusrmgr', 'group-add', { group: wo.group, member: wo.secondMember.name });
        if (o.extraMember) A(s, 'lusrmgr', 'group-add', { group: wo.group, member: s.identity.users[wo.technician] ? wo.technician : wo.secondMember.name });
    }
    if (o.userAdmin) A(s, 'lusrmgr', 'group-add', { group: 'Administrators', member: wo.user.name });
    if (o.secondAdmin) A(s, 'lusrmgr', 'group-add', { group: 'Administrators', member: wo.secondMember.name });
    if (o.enableAdministrator) A(s, 'lusrmgr', 'user-set', { name: 'Administrator', enabled: true });
    if (o.enableGuest) A(s, 'lusrmgr', 'user-set', { name: 'Guest', enabled: true });
    A(s, 'uac', 'set', { level: o.uacLevel || 4 });
    if (o.joinBeforeDns) {
        const r = GUI.act(s, 'sysprops', 'join', { type: 'domain', name: 'meridian.local', user: JOIN_USER, password: JOIN_PW });
        if (r.ok) throw new Error('walk: join before DNS unexpectedly succeeded');
    } else if (o.wrongWorkgroup) {
        A(s, 'sysprops', 'join', { type: 'workgroup', name: 'MERIDIAN' });
    } else if (wo.join.type === 'domain') {
        A(s, 'sysprops', 'join', { type: 'domain', name: 'meridian.local', user: JOIN_USER, password: JOIN_PW });
    } else {
        A(s, 'sysprops', 'join', { type: 'workgroup', name: wo.join.workgroup });
    }
    if (!o.noRestart) A(s, 'desktop', 'restart', {});
    return s;
}

/* Canonical P2 + P3 through the desktop console. */
function p23Shell(s, key) {
    const wo = s.wo;
    ipv4(s, {});
    X(s, 'ps', 'Set-TimeZone -Id "' + wo.timeZone + '"');
    A(s, 'settings', 'update-check', {}); A(s, 'settings', 'update-install', {});
    const dup = X(s, 'ps', 'powercfg /duplicatescheme SCHEME_BALANCED', 'Power Scheme GUID').out;
    const guid = dup.split('GUID: ')[1].split(' ')[0];
    X(s, 'ps', 'powercfg /changename ' + guid + ' "' + wo.power.planName + '"');
    X(s, 'ps', 'powercfg /setactive ' + guid);
    X(s, 'ps', 'powercfg /change monitor-timeout-ac ' + wo.power.acDisplayMin);
    X(s, 'ps', 'powercfg /change standby-timeout-ac ' + wo.power.acSleepMin);
    X(s, 'ps', 'powercfg /change monitor-timeout-dc ' + wo.power.dcDisplayMin);
    X(s, 'ps', 'powercfg /change standby-timeout-dc ' + wo.power.dcSleepMin);
    X(s, 'ps', 'New-LocalUser -Name ' + wo.user.name + ' -FullName "' + wo.user.fullName + '" -PasswordNeverExpires', 'Password');
    X(s, 'ps', 'User-Pass-1');
    X(s, 'ps', 'net user ' + wo.secondMember.name + ' User-Pass-2 /add', 'completed successfully');
    X(s, 'ps', 'Set-LocalUser -Name ' + wo.secondMember.name + ' -PasswordNeverExpires $true');
    X(s, 'ps', 'New-LocalGroup -Name ' + wo.group);
    X(s, 'ps', 'Add-LocalGroupMember -Group ' + wo.group + ' -Member ' + wo.user.name + ',' + wo.secondMember.name);
    X(s, 'ps', 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 2 /f', 'completed successfully');
    if (wo.join.type === 'domain') {
        X(s, 'ps', 'Add-Computer -DomainName meridian.local -Credential ' + JOIN_USER + ' -Restart', 'Password for user');
        X(s, 'ps', JOIN_PW);
    } else {
        X(s, 'ps', 'Add-Computer -WorkgroupName ' + wo.join.workgroup + ' -Restart');
    }
    return s;
}

/* Canonical P4 + P5 through the GUI (after P1-P3). One option changes one thing. */
function p45Gui(s, key, o) {
    o = o || {};
    const wo = s.wo, ctx = { key };
    /* params go through JSON like a real request, so undefined options drop out */
    /* lenient: a refused step is the knock-on being measured, so it is recorded, not thrown */
    const B = (win, action, params) => { const r = GUI.act(s, win, action, JSON.parse(JSON.stringify(params || {})), ctx); if (!r.ok && !o.lenient) throw new Error('walk step failed: ' + win + '/' + action + ': ' + r.msg + (r.refused ? ' [' + r.refused + ']' : '')); return r; };
    const os = osDisk(s);
    /* P5 storage first: D: in the free space Setup left, then the pool and the space */
    if (!o.skipD) B('diskmgmt', 'new-volume', { disk: o.dOnArchive ? s.disks.find((d) => d.role === 'pool').n : os.n, letter: 'D', fs: 'NTFS', label: o.dLabel || wo.disks.dLabel, sizeMB: o.dSizeMB });
    const pools = s.disks.filter((d) => d.role === 'pool').map((d) => d.n);
    if (!o.skipPool) {
        B('storagespaces', 'pool-new', { name: 'MerPool', disks: o.poolOneDisk ? [pools[0]] : pools });
        B('storagespaces', 'space-new', { name: 'MerSpace', resiliency: o.resiliency || key.resiliency, letter: wo.disks.spacesLetter, fs: 'NTFS', label: wo.disks.spacesLabel });
    }
    /* folders, share, confidential folder */
    const sharePath = wo.share.path, conf = wo.confidentialPath;
    if (!o.skipD) {
        B('explorer', 'new-folder', { path: 'D:\\Shares' });
        B('explorer', 'new-folder', { path: sharePath });
        B('explorer', 'new-folder', { path: conf });
        if (!o.skipShare) {
            B('explorer', 'share', { path: sharePath, name: wo.share.name });
            if (!o.keepEveryone) B('explorer', 'share-perm-remove', { name: wo.share.name, principal: 'Everyone' });
            B('explorer', 'share-perm', { name: wo.share.name, principal: wo.group, right: o.shareRight || 'Change' });
        }
        if (!o.skipConf) {
            B('explorer', 'security-inheritance', { path: conf, mode: o.inheritMode || 'convert' });
            if (!o.keepUsers) B('explorer', 'security-remove', { path: conf, principal: 'Users' });
            if ((o.inheritMode || 'convert') === 'convert') B('explorer', 'security-remove', { path: conf, principal: 'Authenticated Users' });
            B('explorer', 'security-grant', { path: conf, principal: wo.group, rights: o.confRights || 'ReadAndExecute' });
        }
    }
    /* P4 network */
    if (o.category) { B('settings', 'net-profile', { category: o.category }); }
    else if (wo.join.type !== 'domain' && !o.skipCategory) B('settings', 'net-profile', { category: 'Private' });
    if (!o.skipRule) {
        B('wf', 'rule-new', { name: 'LedgerSync', direction: 'Inbound', action: 'Allow', protocol: 'TCP', localPort: String(wo.lob.port),
            profile: o.ruleProfile || (wo.join.type === 'domain' ? 'Domain,Private' : 'Private'), remoteAddress: o.ruleRemote || wo.network.lobRemoteSubnet });
    }
    B('sysprops', 'remote', { enabled: o.rdpOff ? false : true, nla: o.nlaOff ? false : true });
    if (!o.skipRdu) B('sysprops', 'remote-users-add', { user: wo.user.name });
    /* BitLocker: the method by policy first, then the wizard with the key saved to TECH-USB */
    if (!o.noPolicy) {
        X(s, 'ps', 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\FVE" /v EncryptionMethodWithXtsOs /t REG_DWORD /d 7 /f', 'completed successfully');
    }
    if (!o.skipBitLocker) {
        B('bitlocker', 'turn-on', { saveTo: o.noUsb ? undefined : 'F:\\', backup: o.noUsb ? 'print' : 'file', runSystemCheck: true });
        if (!o.noRestart) A(s, 'desktop', 'restart', {});
        if (o.suspend) B('bitlocker', 'suspend', {});
    }
    /* Defender */
    if (!o.skipSig) B('defender', 'update', {});
    B('defender', 'exclusion-add', { path: o.exclusion || wo.defenderExclusion });
    if (o.realtimeOff) B('defender', 'realtime', { on: false });
    return s;
}

/* Canonical P4 + P5 through the desktop console only. */
function p45Shell(s, key) {
    const wo = s.wo, ctx = { key };
    const C = (line, expect) => {
        const r = SH.exec(s, 'ps', line, ctx);
        if (expect !== undefined && String(r.out).indexOf(expect) < 0) throw new Error('walk command failed: ' + line + ' -> ' + r.out);
        /* any "<Cmdlet> : message" reply, or an error word, is a failed step */
        const head = line.split(' ')[0];
        if (expect === undefined && r.out && (r.out.indexOf(head + ' : ') === 0 || /error|not recognized|cannot|refused|does not|invalid/i.test(r.out))) throw new Error('walk command failed: ' + line + ' -> ' + r.out);
        return r;
    };
    const os = osDisk(s);
    C('New-Partition -DiskNumber ' + os.n + ' -UseMaximumSize -DriveLetter D');
    C('Format-Volume -DriveLetter D -FileSystem NTFS -NewFileSystemLabel "' + wo.disks.dLabel + '"');
    const pools = s.disks.filter((d) => d.role === 'pool').map((d) => 'PhysicalDisk' + d.n);
    C('New-StoragePool -FriendlyName MerPool -StorageSubSystemFriendlyName "Windows Storage*" -PhysicalDisks ' + pools.join(','));
    C('New-VirtualDisk -StoragePoolFriendlyName MerPool -FriendlyName MerSpace -ResiliencySettingName ' + (key.resiliency === 'Simple' ? 'Simple' : 'Mirror') + ' -UseMaximumSize');
    const sn = s.pool.space.disk;
    C('Initialize-Disk -Number ' + sn + ' -PartitionStyle GPT');
    C('New-Partition -DiskNumber ' + sn + ' -UseMaximumSize -DriveLetter ' + wo.disks.spacesLetter);
    C('Format-Volume -DriveLetter ' + wo.disks.spacesLetter + ' -FileSystem NTFS -NewFileSystemLabel "' + wo.disks.spacesLabel + '"');
    C('New-Item -ItemType Directory -Path "' + wo.share.path + '" -Force');
    C('mkdir ' + wo.confidentialPath);
    C('New-SmbShare -Name ' + wo.share.name + ' -Path "' + wo.share.path + '" -ChangeAccess ' + wo.group);
    C('icacls ' + wo.confidentialPath + ' /inheritance:d', 'Successfully processed 1');
    C('icacls ' + wo.confidentialPath + ' /remove Users', 'Successfully processed 1');
    C('icacls ' + wo.confidentialPath + ' /remove "Authenticated Users"', 'Successfully processed 1');
    C('icacls ' + wo.confidentialPath + ' /grant "' + wo.group + ':(OI)(CI)RX"', 'Successfully processed 1');
    if (wo.join.type !== 'domain') C('Set-NetConnectionProfile -InterfaceAlias Ethernet -NetworkCategory Private');
    C('New-NetFirewallRule -DisplayName LedgerSync -Direction Inbound -Protocol TCP -LocalPort ' + wo.lob.port + ' -Action Allow -Profile ' +
        (wo.join.type === 'domain' ? 'Domain,Private' : 'Private') + ' -RemoteAddress ' + wo.network.lobRemoteSubnet);
    C('reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f', 'completed successfully');
    C('Add-LocalGroupMember -Group "Remote Desktop Users" -Member ' + wo.user.name);
    C('manage-bde -on C: -RecoveryPassword -em xts_aes256', 'Restart the computer');
    const pw = s.bitlocker.C.protectors.find((p) => p.type === 'RecoveryPassword').password;
    C('Set-Content -Path F:\\rk.txt -Value "' + pw + '"');
    C('Restart-Computer');
    C('Update-MpSignature');
    C('Add-MpPreference -ExclusionPath "' + wo.defenderExclusion + '"');
    return s;
}

/* Canonical P6 through the GUI (deprovisioning has no GUI: one console line, as in Windows). */
function p6Gui(s, key, o) {
    o = o || {};
    const wo = s.wo, ctx = { key };
    const B = (win, action, params) => { const r = GUI.act(s, win, action, JSON.parse(JSON.stringify(params || {})), ctx); if (!r.ok && !o.lenient) throw new Error('walk step failed: ' + win + '/' + action + ': ' + r.msg); return r; };
    const APPS = kit.req('mdfinal-apps.js');
    if (!o.skipMsi) B('apps', 'install-msi', { path: o.msiPath || 'C:\\LabFiles\\LedgerSync_2.4_x64.msi', server: o.server === undefined ? wo.lob.fqdn : o.server, port: o.port === undefined ? String(wo.lob.port) : o.port });
    APPS.apps(s);
    if (!o.skipAppUser) B('apps', 'uninstall', { name: wo.consumerApp });
    if (!o.skipDeprov) X(s, 'ps', 'Remove-AppxProvisionedPackage -Online -PackageName ' + APPS.fullName(APPS.appBy(s, wo.consumerApp)));
    B('gpedit', 'wu-feature', { enabled: true, days: o.featureDays || wo.updates.featureDeferralDays });
    B('gpedit', 'wu-quality', { enabled: true, days: o.qualityDays || wo.updates.qualityDeferralDays });
    if (!o.skipActiveHours) B('settings', 'active-hours', { start: wo.updates.activeHours.start, end: wo.updates.activeHours.end });
    (o.startupOff || wo.performance.highImpact).forEach((n) => B('taskmgr', 'startup', { name: n, enabled: false }));
    if (!o.skipPagefile) B('sysprops', 'virtual-memory', { automatic: false, initialMB: wo.performance.pagefileMB, maxMB: o.pagefileMax || wo.performance.pagefileMB });
    if (!o.noRestart) A(s, 'desktop', 'restart', {});
    return s;
}

/* Canonical P6 through the desktop console. */
function p6Shell(s, key) {
    const wo = s.wo, ctx = { key };
    const C = (line, expect) => { const r = SH.exec(s, 'ps', line, ctx); if (expect !== undefined ? String(r.out).indexOf(expect) < 0 : (r.out && /error|not recognized|cannot|refused|does not|invalid/i.test(r.out))) throw new Error('walk command failed: ' + line + ' -> ' + r.out); return r; };
    C('msiexec /i C:\\LabFiles\\LedgerSync_2.4_x64.msi /qn SERVER=' + wo.lob.fqdn + ' PORT=' + wo.lob.port);
    C('Get-AppxPackage *' + wo.consumerApp.split('.').slice(-1)[0] + '* | Remove-AppxPackage');
    C('Get-AppxProvisionedPackage -Online | Where-Object DisplayName -eq ' + wo.consumerApp + ' | Remove-AppxProvisionedPackage -Online');
    C('New-Item -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" -Force');
    for (const [n, v] of [['DeferFeatureUpdates', 1], ['DeferFeatureUpdatesPeriodInDays', wo.updates.featureDeferralDays], ['DeferQualityUpdates', 1], ['DeferQualityUpdatesPeriodInDays', wo.updates.qualityDeferralDays]]) {
        C('New-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" -Name ' + n + ' -Value ' + v + ' -PropertyType DWord');
    }
    C('reg add "HKLM\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings" /v ActiveHoursStart /t REG_DWORD /d ' + wo.updates.activeHours.start + ' /f', 'completed');
    C('reg add "HKLM\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings" /v ActiveHoursEnd /t REG_DWORD /d ' + wo.updates.activeHours.end + ' /f', 'completed');
    wo.performance.highImpact.forEach((n) => C('reg delete "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" /v ' + n + ' /f', 'completed'));
    C('reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management" /v PagingFiles /t REG_MULTI_SZ /d "C:\\pagefile.sys ' + wo.performance.pagefileMB + ' ' + wo.performance.pagefileMB + '" /f', 'completed');
    C('Restart-Computer');
    return s;
}

/* Handover, then the canonical P7 repair for the variant (GUI where Windows offers it), then P8. */
function handoverAndRepair(s, key, o) {
    o = o || {};
    const HO = kit.req('mdfinal-handover.js');
    const ctx = { key };
    const B = (win, action, params) => { const r = GUI.act(s, win, action, JSON.parse(JSON.stringify(params || {})), ctx); if (!r.ok && !o.lenient) throw new Error('walk step failed: ' + win + '/' + action + ': ' + r.msg); return r; };
    const C = (line) => SH.exec(s, 'ps', line, ctx);
    const h = HO.handover(s, key);
    if (!h.ok) throw new Error('handover failed: ' + h.msg);
    const v = key.variant, wo = s.wo;
    const answers = { I1: null, I2: null, I3: null };
    if (!o.skipRepair) {
        if (v === 'V1') {
            B('winre', 'startup-settings', { option: 4 });
            const inf = C('pnputil /enum-drivers').out.split('Published Name:').slice(1).map((x) => x.trim().split('\n')[0].trim())[0];
            C('pnputil /delete-driver ' + inf + ' /uninstall /force');
            B('desktop', 'restart', {});
            Object.assign(answers, { I1: 'driver', I2: '0x7B', I3: 'restart and confirm normal boot' });
        } else if (v === 'V2') {
            B('taskmgr', 'view', {});
            B('taskmgr', 'run', { target: 'ms-settings:windowsupdate-history' });
            /* read the KB from the Update history list the student is shown, not from state */
            const hist = B('settings', 'update-history', {}).msg;
            const kb = (hist.split('\n').filter((l) => /^Hotfix/.test(l))[0].match(/KB[0-9]+/) || [])[0];
            B('settings', 'update-uninstall', { kb });
            B('desktop', 'restart', {});
            Object.assign(answers, { I1: 'update', I2: kb, I3: 'restart and confirm Explorer stable' });
        } else if (v === 'V3') {
            B('taskmgr', 'view', {});
            B('taskmgr', 'end', { name: 'msynchlp' });
            B('taskschd', 'disable', { path: '\\Meridian\\SyncHelperWatchdog' });
            B('taskmgr', 'startup', { name: 'MerSync', enabled: false });
            B('desktop', 'restart', {});
            B('taskmgr', 'view', {});
            Object.assign(answers, { I1: 'runaway process', I2: 'msynchlp.exe', I3: 'Task Manager or Get-Process after restart' });
        } else {
            C('ipconfig /all');
            C('Get-WinEvent -LogName System');   /* where 1014 is shown: I2 credits a value the student could read */
            B('services', 'set', { name: 'MerVpnHelper', startType: 'Disabled' });
            B('ncpa', 'ipv4', { dns1: wo.network.dns[0], dns2: wo.network.dns[1] });
            B('notepad', 'hosts-open', {});
            B('notepad', 'hosts-save', { text: '# hosts\n' });
            B('desktop', 'restart', {});
            C('Test-NetConnection ' + wo.lob.fqdn + ' -Port ' + wo.lob.port);
            Object.assign(answers, { I1: 'name resolution', I2: '1014', I3: 'name-resolution or port test' });
        }
    }
    /* P8 */
    const ANS = kit.req('mdfinal-answers.js');
    const bl = h.snapshot.bitlocker && h.snapshot.bitlocker.C;
    if (!o.skipP8 && bl) {
        const rp = bl.protectors.find((p) => p.type === 'RecoveryPassword');
        if (rp) ANS.save(s, 'B1', rp.id.slice(0, 8));
        ANS.save(s, 'B2', 'XTS-AES 256');
    }
    if (!o.skipP8) Object.keys(answers).forEach((k) => { if (answers[k]) ANS.save(s, k, (o.answers && o.answers[k]) || answers[k]); });
    return h.snapshot;
}

/* A complete perfect sitting: P1-P6 (GUI), handover, P7 repair, P8. Returns { state, key, snapshot }. */
function perfect(uid, forced, o) {
    o = o || {};
    const { state, key } = sitting(uid, forced);
    p1Gui(state, key); p23Gui(state, key); p45Gui(state, key); p6Gui(state, key);
    const snapshot = handoverAndRepair(state, key, o);
    return { state, key, snapshot };
}

module.exports = { p6Gui, p6Shell, handoverAndRepair, perfect, p45Shell, p45Gui, p23Gui, p23Shell, ipv4, JOIN_USER, JOIN_PW, defaultInstalledBusiness, EX, opts, sitting, A, X, p1Gui, p1Shell, oobe, activate, wizardDefaults, defaultInstalledState, osDisk, PRIVACY_OFF };
