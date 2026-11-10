#!/usr/bin/env node
/**
 * mdfinal-staff-guide.js — the MD-100 final staff walkthrough, generated from steps the engine runs.
 *
 * @catalog what    Writes the staff-only step-by-step walkthrough (GUI path, command path, the four P7
 * @catalog what    faults, P8) for the MD-100 final. Every step is EXECUTED against the engine on every
 * @catalog what    profile x variant class plus random seeds, and must score 100, before a line is written.
 * @catalog run     node _tools/mdfinal/mdfinal-staff-guide.js [--seeds N] [--out <file.md>]   (also writes <file>.html with pandoc)
 * @catalog status  TOOL
 *
 * WHY STEPS ARE DATA. A hand-written walkthrough drifts from the engine the first time either
 * changes. Here one step list is both the document and the test: the same records are rendered as
 * text with <placeholders> and resolved against real sittings, driven through gui.act() and
 * shell.exec() exactly as the page drives them, then graded. If a step stops working, the guide is
 * not written.
 *
 * THE GUIDE FOLLOWS THE BRIEF, NOT mdfinal-walk.js. The walk predates the brief's 2026-11-05 names
 * (MeridianPool, MeridianSpace, the rule "LedgerSync <port>", the brief's passwords, the BitLocker
 * method by Group Policy). A student follows the brief, so the guide uses the brief's values and
 * proves they score.
 *
 * Window and field labels are read from the exam page itself (NAMES and words()), so the click
 * path names what a student sees. Output is the answer to the exam: it goes to the staff Solutions
 * folder, never to _app/.
 */
const fs = require('fs');
const path = require('path');
const kit = require('./mdfinal-test-kit.js');
const W = require('./mdfinal-walk.js');
const CORE = kit.req('mdfinal-core.js');
const GUI = kit.req('mdfinal-gui.js');
const SH = kit.req('mdfinal-shell.js');
const G = kit.req('mdfinal-grade.js');
const PC = kit.req('mdfinal-pc.js');
const HO = kit.req('mdfinal-handover.js');
const ANS = kit.req('mdfinal-answers.js');
const APPS = kit.req('mdfinal-apps.js');
const CH = kit.req('mdfinal-checks.js');
const FAULTS = kit.req('mdfinal-faults.js');
const OS = kit.req('mdfinal-os.js');
const BRIEF = kit.req('mdfinal-brief.js');
const EXAMS = kit.req('mdfinal-exams.js');

const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };
const SEEDS = Number(arg('--seeds', 60));
const OUT = arg('--out', path.join(process.env.HOME, 'hexworth-shared/Solutions/MD-100/MD-100_Final_Staff_Walkthrough.md'));

/* ── labels from the page ── */
const PAGE = fs.readFileSync(path.join(__dirname, '../../_app/houses/forge/md-100/exams/md100-final.exam.html'), 'utf8');
const NAMES = Function('return ' + PAGE.match(/var NAMES = (\{[\s\S]*?\});/)[1])();
const CONSOLE_NAMES = Function('return ' + PAGE.match(/var CONSOLE_NAMES = (\{[\s\S]*?\});/)[1])();
const words = Function(PAGE.match(/(function words\(k\) \{[\s\S]*?\n  \}\n  var ACRONYMS = \[[^\]]*\];)/)[1] + '\nreturn words;')();
const actionLabel = (a) => words(a.replace(/-/g, ' '));

/* ── placeholders: one name, how a sitting resolves it, and where the student reads it ── */
const osDisk = (s) => s.disks.find((d) => d.role === 'os');
const lastPrimary = (d) => { const p = d.partitions.filter((x) => x.type === 'Primary'); return p[p.length - 1]; };
const domain = (s) => s.wo.join.type === 'domain';
const TOK = {
    hostname: [(s) => s.wo.hostname, 'Brief P1 (VM name) and P2 (PC name)'],
    memMB: [(s) => s.wo.vm.startupMemoryMB, 'Brief P1: startup memory, static'],
    vcpu: [(s) => s.wo.vm.vcpu, 'Brief P1: virtual processors'],
    vhdxGB: [(s) => s.wo.vm.vhdxGB, 'Brief P1: OS virtual hard disk size'],
    osDisk: [(s) => osDisk(s).n, 'The disk Setup lists as empty unallocated space of <vhdxGB> GB. It is 0 or 1 depending on the sitting; the other one has partitions and is MER-ARCHIVE'],
    setupMB: [(s) => s.wo.disks.cGB * 1024 + 116, 'C: size from brief P1 x 1024, plus 116. Setup takes the 100 MB EFI and 16 MB MSR partitions out of the size you type, so this leaves C: at exactly the brief size'],
    cGBMB: [(s) => s.wo.disks.cGB * 1024, 'C: size from brief P1 x 1024'],
    cPart: [(s) => lastPrimary(osDisk(s)).id, 'The Primary partition you just created on that disk (Setup also lists the System and MSR partitions it made; pick the one of type Primary)'],
    edition: [(s, k) => k.edition, 'Brief P1 install line (the edition is also on the answer sheet)'],
    technician: [(s) => s.wo.technician, 'Brief P1: the local technician administrator'],
    gvlk: [(s, k) => PC.GVLK[k.edition], 'The KMS client setup key table under the brief, row for the edition'],
    kmsIp: [(s) => s.wo.network.kms.ip, 'Brief P1 activation line (KMS work orders only)'],
    mak: [(s) => s.wo.mak, 'Brief P1 activation line'],
    tz: [(s) => s.wo.timeZone, 'Brief P2 names the zone by its display name; the field takes the ID, offered as a suggestion'],
    plan: [(s) => s.wo.power.planName, 'Brief P2 power plan'],
    acDisp: [(s) => s.wo.power.acDisplayMin, 'Brief P2, plugged in, display'],
    acSleep: [(s) => s.wo.power.acSleepMin, 'Brief P2, plugged in, sleep'],
    dcDisp: [(s) => s.wo.power.dcDisplayMin, 'Brief P2, on battery, display'],
    dcSleep: [(s) => s.wo.power.dcSleepMin, 'Brief P2, on battery, sleep'],
    user: [(s) => s.wo.user.name, 'Brief P3, first user'],
    userFull: [(s) => s.wo.user.fullName, 'Brief P3, first user full name'],
    user2: [(s) => s.wo.secondMember.name, 'Brief P3, second user'],
    user2Full: [(s) => s.wo.secondMember.fullName, 'Brief P3, second user full name'],
    group: [(s) => s.wo.group, 'Brief P3 local group'],
    workgroup: [(s) => s.wo.join.workgroup, 'Brief P3 (workgroup work orders only)'],
    ip: [(s) => s.wo.network.ip, 'Brief P4 static IPv4'],
    mask: [(s) => s.wo.network.mask, 'Brief P4 mask'],
    gw: [(s) => s.wo.network.gateway, 'Brief P4 gateway'],
    dns1: [(s) => s.wo.network.dns[0], 'Brief P4, first DNS server'],
    dns2: [(s) => s.wo.network.dns[1], 'Brief P4, second DNS server'],
    port: [(s) => s.wo.lob.port, 'Brief P4 and P6, the LedgerSync TCP port'],
    lobSubnet: [(s) => s.wo.network.lobRemoteSubnet, 'Brief P4, the only remote subnet allowed'],
    fwProfile: [(s) => (domain(s) ? 'Domain,Private' : 'Private'), 'Brief P4: Domain,Private on a domain work order, Private on a workgroup one'],
    shareName: [(s) => s.wo.share.name, 'Brief P4 share name'],
    sharePath: [(s) => s.wo.share.path, 'Brief P4 share folder'],
    shareParent: [(s) => s.wo.share.path.replace(/\\[^\\]+$/, ''), 'The parent folder of the share path'],
    confPath: [(s) => s.wo.confidentialPath, 'Brief P5 confidential folder'],
    dLabel: [(s) => s.wo.disks.dLabel, 'Brief P5, label of D:'],
    poolDisks: [(s) => s.disks.filter((d) => d.role === 'pool').map((d) => d.n).join(','), 'Disk numbers of MER-POOL1 and MER-POOL2 as Storage Spaces lists them (the two blank disks of the brief pool size)'],
    poolPhys: [(s) => s.disks.filter((d) => d.role === 'pool').map((d) => 'PhysicalDisk' + d.n).join(','), 'The two pool disks as Get-PhysicalDisk names them'],
    resiliency: [(s, k) => k.resiliency, 'Brief P5 pool line (also on the answer sheet)'],
    resCmd: [(s, k) => (k.resiliency === 'Simple' ? 'Simple' : 'Mirror'), 'Simple, or Mirror for a two-way mirror'],
    spaceDisk: [(s) => s.pool.space.disk, 'The disk number of the new MeridianSpace virtual disk (Get-Disk lists it)'],
    sLetter: [(s) => s.wo.disks.spacesLetter, 'Brief P5, the storage space volume letter'],
    sLabel: [(s) => s.wo.disks.spacesLabel, 'Brief P5, the storage space volume label'],
    exclusion: [(s) => s.wo.defenderExclusion, 'Brief P5 Defender exclusion'],
    lobFqdn: [(s) => s.wo.lob.fqdn, 'Brief P6 LedgerSync server'],
    app: [(s) => s.wo.consumerApp, 'Brief P6, the consumer app to remove'],
    appShort: [(s) => s.wo.consumerApp.split('.').slice(-1)[0], 'The last part of the app name (for example GamingApp)'],
    appFull: [(s) => APPS.fullName(APPS.appBy(s, s.wo.consumerApp)), 'The provisioned package\'s full PackageName, as Get-AppxProvisionedPackage -Online lists it'],
    featDays: [(s) => s.wo.updates.featureDeferralDays, 'Brief P6 feature update deferral'],
    qualDays: [(s) => s.wo.updates.qualityDeferralDays, 'Brief P6 quality update deferral'],
    ahStart: [(s) => s.wo.updates.activeHours.start, 'Brief P6 active hours start (hour, 0-23)'],
    ahEnd: [(s) => s.wo.updates.activeHours.end, 'Brief P6 active hours end (hour, 0-23)'],
    highApp: [null, 'Each app the brief P6 lists as High startup impact (one step per app)'],
    pagefile: [(s) => s.wo.performance.pagefileMB, 'Brief P6 page file size'],
    faultInf: [null, 'The Published Name (oemNN.inf) of the Meridian Backup Agent Volume Filter in pnputil /enum-drivers'],
    faultKb: [null, 'The KB of the "Hotfix for Microsoft Windows" entry at the top of Update history'],
    protId: [null, 'The first 8 characters of the Numerical Password protector ID, from manage-bde -protectors -get C:'],
    recPw: [null, 'The 48-digit recovery password manage-bde printed']
};
const PW = { tech: BRIEF.PASSWORDS.technician, user: BRIEF.PASSWORDS.user, join: BRIEF.PASSWORDS.join };
const JOIN_USER = 'MERIDIAN\\svc-wsjoin';

/* Step builders. Values may hold {{token}}; `when` gates a step to some sittings. */
const g = (phase, win, action, params, note, when) => ({ kind: 'gui', phase, win, action, params: params || {}, note, when });
const c = (phase, ctx, line, note, when, expect) => ({ kind: 'cmd', phase, ctx, line, note, when, expect });
const DOMAIN = { doc: 'Domain work orders only', test: (s) => domain(s) };
const WORKGROUP = { doc: 'Workgroup work orders only', test: (s) => !domain(s) };
const KMS = { doc: 'KMS work orders', test: (s, k) => k.channel === 'KMS' };
const MAK = { doc: 'MAK work orders', test: (s, k) => k.channel !== 'KMS' };

function resolve(v, s, k, extra) {
    if (typeof v !== 'string') { return v; }
    const whole = v.match(/^\{\{(\w+)\}\}$/);
    const val = (t) => { if (extra && t in extra) { return extra[t]; } const f = TOK[t] && TOK[t][0]; if (!f) { throw new Error('unresolved token ' + t); } return f(s, k); };
    if (whole) { return val(whole[1]); }
    return v.replace(/\{\{(\w+)\}\}/g, (m, t) => String(val(t)));
}
/* a multi-line value (the hosts file) is shown as its lines joined, since a table cell or list item cannot hold a newline */
const docVal = (v) => (typeof v === 'string' ? v.replace(/\{\{(\w+)\}\}/g, '<$1>').replace(/\n+$/, '').replace(/\n/g, ' / ') : String(v));

/* ═══ THE GUI PATH (execution order; each step names the brief phase it serves) ═══ */
const P1 = [
    g('P1', 'hyperv', 'new-vm', { name: '{{hostname}}', generation: 2, memoryMB: '{{memMB}}', dynamicMemory: false, vhdxGB: '{{vhdxGB}}', switch: 'Meridian-LAN', iso: 'Win11_24H2_Business_x64.iso' },
      'The Business ISO, never the Consumer one.'),
    g('P1', 'vm-settings', 'apply', { vcpu: '{{vcpu}}', vtpm: true }, 'Secure Boot is on by default for Generation 2: leave it.'),
    g('P1', 'hyperv', 'start'),
    g('P1', 'setup', 'lang', {}, 'Defaults are English (United States), US keyboard.'),
    g('P1', 'setup', 'option', { agree: true }),
    g('P1', 'setup', 'key', { noKey: true }, '"I don\'t have a product key". Activation happens after setup.'),
    g('P1', 'setup', 'edition', { edition: '{{edition}}' }),
    g('P1', 'setup', 'eula', { accept: true }),
    g('P1', 'setup', 'new', { disk: '{{osDisk}}', sizeMB: '{{setupMB}}' }, 'Never touch the disk that already has partitions: that is MER-ARCHIVE, and damaging it is a penalty.'),
    g('P1', 'setup', 'install', { disk: '{{osDisk}}', part: '{{cPart}}' }, 'The rest of the disk stays unallocated for D:.'),
    g('P1', 'oobe', 'region', {}),
    g('P1', 'oobe', 'keyboard', {}),
    g('P1', 'oobe', 'name', { hostname: '{{hostname}}' }),
    g('P1', 'oobe', 'setup-type', { type: 'work' }, 'Pro and Enterprise both offer "Set up for work or school", so no Microsoft account and no oobe\\bypassnro are needed.'),
    g('P1', 'oobe', 'domain-join-instead', {}, 'Sign-in options > "Domain join instead": creates a local account; the domain join itself is done in P3.'),
    g('P1', 'oobe', 'account', { name: '{{technician}}', password: PW.tech }),
    g('P1', 'oobe', 'privacy', { location: false, findMyDevice: false, diagnosticData: 'Required', inking: false, tailored: false, advertisingId: false }, 'All six off, diagnostic data Required.'),
    c('P1', 'ps', 'slmgr /ipk {{gvlk}}', 'The KMS client setup key for the edition, from the key table.', KMS, 'successfully'),
    c('P1', 'ps', 'slmgr /skms {{kmsIp}}', null, KMS, 'successfully'),
    c('P1', 'ps', 'slmgr /ato', null, KMS, 'activated successfully'),
    g('P1', 'activation', 'change-key', { key: '{{mak}}' }, 'Settings > System > Activation > Change product key. Never the retail COA.', MAK)
];
const P23 = [
    g('P4', 'ncpa', 'ipv4', { dhcp: false, ip: '{{ip}}', mask: '{{mask}}', gateway: '{{gw}}', dns1: '{{dns1}}', dns2: '{{dns2}}' },
      'Brief P4, done first: the domain join in P3 needs the Meridian DNS servers.'),
    g('P2', 'settings', 'time-zone', { id: '{{tz}}' }),
    g('P2', 'settings', 'update-check', {}),
    g('P2', 'settings', 'update-install', {}, 'The cumulative update finishes at the restart at the end of P3.'),
    g('P2', 'power', 'create-plan', { name: '{{plan}}', basedOn: 'Balanced', acDisplay: '{{acDisp}}' }, 'Creating the plan makes it active.'),
    c('P2', 'ps', 'powercfg /change standby-timeout-ac {{acSleep}}', 'A VM has no sleep or battery settings in the GUI (brief rule): powercfg sets them on the active plan.'),
    c('P2', 'ps', 'powercfg /change monitor-timeout-dc {{dcDisp}}'),
    c('P2', 'ps', 'powercfg /change standby-timeout-dc {{dcSleep}}'),
    g('P3', 'lusrmgr', 'user-new', { name: '{{user}}', fullName: '{{userFull}}', password: PW.user, mustChange: false, neverExpires: true }),
    g('P3', 'lusrmgr', 'user-new', { name: '{{user2}}', fullName: '{{user2Full}}', password: PW.user, mustChange: false, neverExpires: true }),
    g('P3', 'lusrmgr', 'group-new', { name: '{{group}}' }),
    g('P3', 'lusrmgr', 'group-add', { group: '{{group}}', member: '{{user}}' }),
    g('P3', 'lusrmgr', 'group-add', { group: '{{group}}', member: '{{user2}}' }),
    g('P3', 'uac', 'set', { level: 4 }, 'Level 4 is the top of the slider: Always notify.'),
    g('P3', 'sysprops', 'join', { type: 'domain', name: 'meridian.local', user: JOIN_USER, password: PW.join }, null, DOMAIN),
    g('P3', 'sysprops', 'join', { type: 'workgroup', name: '{{workgroup}}' }, null, WORKGROUP),
    g('P2', 'desktop', 'restart', {}, 'Completes the rename, the cumulative update and the join.')
];
const P45 = [
    g('P5', 'diskmgmt', 'new-volume', { disk: '{{osDisk}}', letter: 'D', fs: 'NTFS', label: '{{dLabel}}' }, 'Size left blank: all of the free space.'),
    g('P5', 'storagespaces', 'pool-new', { name: 'MeridianPool', disks: '{{poolDisks}}' }),
    g('P5', 'storagespaces', 'space-new', { name: 'MeridianSpace', resiliency: '{{resiliency}}', letter: '{{sLetter}}', fs: 'NTFS', label: '{{sLabel}}' }),
    g('P4', 'explorer', 'new-folder', { path: '{{shareParent}}' }),
    g('P4', 'explorer', 'new-folder', { path: '{{sharePath}}' }),
    g('P5', 'explorer', 'new-folder', { path: '{{confPath}}' }),
    g('P4', 'explorer', 'share', { path: '{{sharePath}}', name: '{{shareName}}' }),
    g('P4', 'explorer', 'share-perm-remove', { name: '{{shareName}}', principal: 'Everyone' }),
    g('P4', 'explorer', 'share-perm', { name: '{{shareName}}', principal: '{{group}}', right: 'Change' }, 'Change at share level plus the NTFS Modify that Users already has gives members Modify over the network.'),
    g('P5', 'explorer', 'security-inheritance', { path: '{{confPath}}', mode: 'convert' }, '"Convert inherited permissions into explicit permissions", so Administrators and SYSTEM keep Full control.'),
    g('P5', 'explorer', 'security-remove', { path: '{{confPath}}', principal: 'Users' }),
    g('P5', 'explorer', 'security-remove', { path: '{{confPath}}', principal: 'Authenticated Users' }),
    g('P5', 'explorer', 'security-grant', { path: '{{confPath}}', principal: '{{group}}', rights: 'ReadAndExecute' }),
    g('P4', 'settings', 'net-profile', { category: 'Private' }, 'A domain-joined PC is already on the Domain profile.', WORKGROUP),
    g('P4', 'wf', 'rule-new', { name: 'LedgerSync {{port}}', direction: 'Inbound', action: 'Allow', protocol: 'TCP', localPort: '{{port}}', profile: '{{fwProfile}}', remoteAddress: '{{lobSubnet}}' }),
    g('P4', 'sysprops', 'remote', { enabled: true, nla: true }),
    g('P4', 'sysprops', 'remote-users-add', { user: '{{user}}' }),
    g('P5', 'gpedit', 'fve-os-method', { method: 'XTS-AES 256' }, 'Computer Configuration > Administrative Templates > Windows Components > BitLocker Drive Encryption > Operating System Drives > "Choose drive encryption method and cipher strength". Before turning BitLocker on: the method cannot change afterwards.'),
    g('P5', 'bitlocker', 'turn-on', { saveTo: 'F:\\', backup: 'file', runSystemCheck: true }, 'Save the recovery key to TECH-USB (F:).'),
    g('P5', 'desktop', 'restart', {}, 'Encryption starts after the system check restart.'),
    g('P5', 'defender', 'update', {}),
    g('P5', 'defender', 'exclusion-add', { path: '{{exclusion}}' }, 'This one path only. Leave real-time protection on.')
];
const P6 = [
    g('P6', 'apps', 'install-msi', { path: 'C:\\LabFiles\\LedgerSync_2.4_x64.msi', server: '{{lobFqdn}}', port: '{{port}}' }, 'The x64 package, not x86.'),
    g('P6', 'apps', 'uninstall', { name: '{{app}}' }, 'Removes it for the user only.'),
    c('P6', 'ps', 'Remove-AppxProvisionedPackage -Online -PackageName {{appFull}}', 'Removes it from the image, so new users do not get it. Read the PackageName from Get-AppxProvisionedPackage -Online. There is no GUI for this in Windows.'),
    g('P6', 'gpedit', 'wu-feature', { enabled: true, days: '{{featDays}}' }, 'Windows Update for Business > "Select when Preview Builds and Feature Updates are received".'),
    g('P6', 'gpedit', 'wu-quality', { enabled: true, days: '{{qualDays}}' }, '"Select when Quality Updates are received".'),
    g('P6', 'settings', 'active-hours', { start: '{{ahStart}}', end: '{{ahEnd}}' }),
    Object.assign(g('P6', 'taskmgr', 'startup', { name: '{{highApp}}', enabled: false }, 'Once for each High-impact app the brief names. SecurityHealth stays enabled.'), { each: 'highApp' }),
    g('P6', 'sysprops', 'virtual-memory', { automatic: false, initialMB: '{{pagefile}}', maxMB: '{{pagefile}}' }, 'Advanced > Performance > Virtual memory, on C:.'),
    g('P6', 'desktop', 'restart', {}, 'Required before handover: the page file and other pending changes count only after a restart.')
];
const P8B = [
    c('P8', 'ps', 'manage-bde -protectors -get C:', 'Read the ID of the Numerical Password protector.'),
    { kind: 'record', phase: 'P8', field: 'B1', value: '{{protId}}' },
    { kind: 'record', phase: 'P8', field: 'B2', value: 'XTS-AES 256' }
];

/* ═══ P7: one block per fault, run after handover ═══ */
const P7 = {
    V1: [
        g('P7', 'winre', 'startup-settings', { option: 4 }, 'The PC stops with INACCESSIBLE_BOOT_DEVICE (0x7B) and lands in recovery. Troubleshoot > Advanced options > Startup Settings > 4, Safe Mode.'),
        c('P7', 'ps', 'pnputil /enum-drivers', 'Find "Meridian Backup Agent Volume Filter" and its Published Name.'),
        c('P7', 'ps', 'pnputil /delete-driver {{faultInf}} /uninstall /force'),
        g('P7', 'desktop', 'restart', {}, 'Boots normally: that is the verification.'),
        { kind: 'record', phase: 'P8', field: 'I1', value: 'driver' },
        { kind: 'record', phase: 'P8', field: 'I2', value: '0x7B' },
        { kind: 'record', phase: 'P8', field: 'I3', value: 'restart and confirm normal boot' }
    ],
    V2: [
        g('P7', 'taskmgr', 'view', {}, 'Explorer keeps crashing, so start from Task Manager (Ctrl+Shift+Esc).'),
        g('P7', 'taskmgr', 'run', { target: 'ms-settings:windowsupdate-history' }),
        g('P7', 'settings', 'update-history', {}, 'The top entry is the "Hotfix for Microsoft Windows (KB...)" support emailed.'),
        g('P7', 'settings', 'update-uninstall', { kb: '{{faultKb}}' }),
        g('P7', 'desktop', 'restart', {}, 'The taskbar and Start stay up.'),
        { kind: 'record', phase: 'P8', field: 'I1', value: 'update' },
        { kind: 'record', phase: 'P8', field: 'I2', value: '{{faultKb}}' },
        { kind: 'record', phase: 'P8', field: 'I3', value: 'restart and confirm Explorer stable' }
    ],
    V3: [
        g('P7', 'taskmgr', 'view', {}, 'msynchlp.exe (Meridian Sync Helper) is at the top of CPU.'),
        g('P7', 'taskmgr', 'end', { name: 'msynchlp' }, 'Ending it alone is not enough: a scheduled task and a startup entry bring it back.'),
        g('P7', 'taskschd', 'disable', { path: '\\Meridian\\SyncHelperWatchdog' }),
        g('P7', 'taskmgr', 'startup', { name: 'MerSync', enabled: false }),
        g('P7', 'desktop', 'restart', {}),
        g('P7', 'taskmgr', 'view', {}, 'After the restart msynchlp.exe is gone: that is the verification.'),
        { kind: 'record', phase: 'P8', field: 'I1', value: 'runaway process' },
        { kind: 'record', phase: 'P8', field: 'I2', value: 'msynchlp.exe' },
        { kind: 'record', phase: 'P8', field: 'I3', value: 'Task Manager or Get-Process after restart' }
    ],
    V4: [
        c('P7', 'ps', 'ipconfig /all', 'DNS now points at the vendor servers 203.0.113.53 and .54, not Meridian\'s.'),
        c('P7', 'ps', 'Get-WinEvent -LogName System', 'Event 1014 (DNS Client: name resolution timed out).', null, '1014'),
        g('P7', 'services', 'set', { name: 'MerVpnHelper', startType: 'Disabled' }, 'The Meridian VPN Helper rewrites DNS and the hosts file at every boot: stop it first.'),
        g('P7', 'ncpa', 'ipv4', { dns1: '{{dns1}}', dns2: '{{dns2}}' }, 'Put the brief\'s DNS servers back.'),
        g('P7', 'notepad', 'hosts-open', {}, 'The hosts file maps the LedgerSync server to a decoy IP.'),
        g('P7', 'notepad', 'hosts-save', { text: '# hosts\n' }, 'Delete the LedgerSync line: the file keeps only its comment.'),
        g('P7', 'desktop', 'restart', {}),
        c('P7', 'ps', 'Test-NetConnection {{lobFqdn}} -Port {{port}}', 'Resolves to the real server and the port answers.'),
        { kind: 'record', phase: 'P8', field: 'I1', value: 'name resolution' },
        { kind: 'record', phase: 'P8', field: 'I2', value: '1014' },
        { kind: 'record', phase: 'P8', field: 'I3', value: 'name-resolution or port test' }
    ]
};

/* ═══ OTHER ACCEPTED "Verified by" ANSWERS ═══
 * Each replaces the step list's own I3 answer and adds the check it needs after the fix. The
 * verifier runs every one to 100, and runs it again WITHOUT the check to prove the check is what
 * earns it. `drop` removes the base list's own verification step where the alternative replaces it. */
const EV_CHECK = g('P7', 'eventvwr', 'query', { log: 'System' }, 'After the fix.');
const ALT_VERIFY = [
    { v: 'V1', option: 'Event Viewer recheck', check: EV_CHECK },
    { v: 'V2', option: 'Update history check', check: g('P7', 'settings', 'update-history', {}, 'After the fix: the hotfix is gone from the list.') },
    { v: 'V2', option: 'Event Viewer recheck', check: EV_CHECK },
    { v: 'V3', option: 'Task Manager or Get-Process after restart', check: c('P7', 'ps', 'Get-Process', 'After the restart, instead of Task Manager.'), drop: 'taskmgr/view-last' }
];
function altSteps(a, withCheck) {
    let base = P7[a.v].filter((st) => !(st.kind === 'record' && st.field === 'I3'));
    if (a.drop === 'taskmgr/view-last') { const i = base.map((st) => st.win + '/' + st.action).lastIndexOf('taskmgr/view'); base = base.filter((st, j) => j !== i); }
    const recs = base.filter((st) => st.kind === 'record'), work = base.filter((st) => st.kind !== 'record');
    return work.concat(withCheck ? [a.check] : [], recs, [{ kind: 'record', phase: 'P8', field: 'I3', value: a.option }]);
}

/* ═══ THE COMMAND PATH (same build, consoles first; GUI only where the lab has no command) ═══ */
const SHELL = [
    c('P1', 'hyperv-ps', 'New-VM -Name {{hostname}} -Generation 2 -MemoryStartupBytes {{memMB}}MB -NewVHDPath {{hostname}}.vhdx -NewVHDSizeBytes {{vhdxGB}}GB -SwitchName Meridian-LAN', 'New-VM creates static memory unless you turn dynamic on.', null, '{{hostname}}'),
    c('P1', 'hyperv-ps', 'Set-VMProcessor -VMName {{hostname}} -Count {{vcpu}}'),
    c('P1', 'hyperv-ps', 'Set-VMKeyProtector -VMName {{hostname}} -NewLocalKeyProtector', 'A key protector is required before the vTPM.'),
    c('P1', 'hyperv-ps', 'Enable-VMTPM -VMName {{hostname}}'),
    c('P1', 'hyperv-ps', 'Add-VMDvdDrive -VMName {{hostname}} -Path C:\\ISO\\Win11_24H2_Business_x64.iso'),
    c('P1', 'hyperv-ps', 'Start-VM -Name {{hostname}}'),
    c('P1', 'setup-cmd', 'diskpart', 'Shift+F10 at the first Setup screen.', null, 'DiskPart'),
    c('P1', 'setup-cmd', 'select disk {{osDisk}}', null, null, 'is now the selected disk'),
    c('P1', 'setup-cmd', 'convert gpt', null, null, 'converted'),
    c('P1', 'setup-cmd', 'create partition efi size=100', null, null, 'succeeded'),
    c('P1', 'setup-cmd', 'format quick fs=fat32 label="System"', null, null, 'formatted'),
    c('P1', 'setup-cmd', 'create partition msr size=16', null, null, 'succeeded'),
    c('P1', 'setup-cmd', 'create partition primary size={{cGBMB}}', null, null, 'succeeded'),
    c('P1', 'setup-cmd', 'format quick fs=ntfs label="Windows"', null, null, 'formatted'),
    c('P1', 'setup-cmd', 'exit', null, null, 'Leaving'),
    c('P1', 'setup-cmd', 'exit'),
    g('P1', 'setup', 'lang', {}, 'Then Setup as in the GUI path: no key, the edition, the licence.'),
    g('P1', 'setup', 'option', { agree: true }),
    g('P1', 'setup', 'key', { noKey: true }),
    g('P1', 'setup', 'edition', { edition: '{{edition}}' }),
    g('P1', 'setup', 'eula', { accept: true }),
    g('P1', 'setup', 'install', { disk: '{{osDisk}}', part: '{{cPart}}' }, 'The NTFS partition you created.'),
    { kind: 'ref', phase: 'P1', text: 'OOBE exactly as in the GUI path: region, keyboard, name, work or school, Domain join instead, the technician, privacy.', steps: P1.slice(10, 17) },
    c('P1', 'ps', 'slmgr /ipk {{gvlk}}', null, KMS, 'successfully'),
    c('P1', 'ps', 'slmgr /skms {{kmsIp}}', null, KMS, 'successfully'),
    c('P1', 'ps', 'slmgr /ato', null, KMS, 'activated successfully'),
    c('P1', 'ps', 'slmgr /ipk {{mak}}', null, MAK, 'successfully'),
    c('P1', 'ps', 'slmgr /ato', null, MAK, 'activated successfully'),
    g('P4', 'ncpa', 'ipv4', { dhcp: false, ip: '{{ip}}', mask: '{{mask}}', gateway: '{{gw}}', dns1: '{{dns1}}', dns2: '{{dns2}}' }, 'The adapter settings are set in Network Connections.'),
    c('P2', 'ps', 'Set-TimeZone -Id "{{tz}}"'),
    g('P2', 'settings', 'update-check', {}, 'The cumulative update installs from Settings > Windows Update.'),
    g('P2', 'settings', 'update-install', {}),
    c('P2', 'ps', 'powercfg /duplicatescheme SCHEME_BALANCED', 'Prints the new plan\'s GUID: use it below as <planGuid>.', null, 'Power Scheme GUID'),
    c('P2', 'ps', 'powercfg /changename {{planGuid}} "{{plan}}"'),
    c('P2', 'ps', 'powercfg /setactive {{planGuid}}'),
    c('P2', 'ps', 'powercfg /change monitor-timeout-ac {{acDisp}}'),
    c('P2', 'ps', 'powercfg /change standby-timeout-ac {{acSleep}}'),
    c('P2', 'ps', 'powercfg /change monitor-timeout-dc {{dcDisp}}'),
    c('P2', 'ps', 'powercfg /change standby-timeout-dc {{dcSleep}}'),
    c('P3', 'ps', 'New-LocalUser -Name {{user}} -FullName "{{userFull}}" -PasswordNeverExpires', 'It prompts for the password: type it on the next line.', null, 'Password'),
    c('P3', 'ps', PW.user, 'Typed at the password prompt, not a command.'),
    c('P3', 'ps', 'net user {{user2}} ' + PW.user + ' /add', null, null, 'completed successfully'),
    c('P3', 'ps', 'Set-LocalUser -Name {{user2}} -FullName "{{user2Full}}" -PasswordNeverExpires $true'),
    c('P3', 'ps', 'New-LocalGroup -Name {{group}}'),
    c('P3', 'ps', 'Add-LocalGroupMember -Group {{group}} -Member {{user}},{{user2}}'),
    c('P3', 'ps', 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 2 /f', 'ConsentPromptBehaviorAdmin 2 is "Always notify".', null, 'completed successfully'),
    c('P3', 'ps', 'Add-Computer -DomainName meridian.local -Credential ' + JOIN_USER + ' -Restart', 'It prompts for the join password: type it on the next line.', DOMAIN, 'Password for user'),
    c('P3', 'ps', PW.join, 'Typed at the password prompt, not a command.', DOMAIN),
    c('P3', 'ps', 'Add-Computer -WorkgroupName {{workgroup}} -Restart', null, WORKGROUP),
    c('P5', 'ps', 'New-Partition -DiskNumber {{osDisk}} -UseMaximumSize -DriveLetter D'),
    c('P5', 'ps', 'Format-Volume -DriveLetter D -FileSystem NTFS -NewFileSystemLabel "{{dLabel}}"'),
    c('P5', 'ps', 'New-StoragePool -FriendlyName MeridianPool -StorageSubSystemFriendlyName "Windows Storage*" -PhysicalDisks {{poolPhys}}'),
    c('P5', 'ps', 'New-VirtualDisk -StoragePoolFriendlyName MeridianPool -FriendlyName MeridianSpace -ResiliencySettingName {{resCmd}} -UseMaximumSize'),
    c('P5', 'ps', 'Initialize-Disk -Number {{spaceDisk}} -PartitionStyle GPT'),
    c('P5', 'ps', 'New-Partition -DiskNumber {{spaceDisk}} -UseMaximumSize -DriveLetter {{sLetter}}'),
    c('P5', 'ps', 'Format-Volume -DriveLetter {{sLetter}} -FileSystem NTFS -NewFileSystemLabel "{{sLabel}}"'),
    c('P4', 'ps', 'New-Item -ItemType Directory -Path "{{sharePath}}" -Force'),
    c('P5', 'ps', 'mkdir {{confPath}}'),
    c('P4', 'ps', 'New-SmbShare -Name {{shareName}} -Path "{{sharePath}}" -ChangeAccess {{group}}', 'New-SmbShare does not grant Everyone unless asked.'),
    c('P5', 'ps', 'icacls {{confPath}} /inheritance:d', null, null, 'Successfully processed 1'),
    c('P5', 'ps', 'icacls {{confPath}} /remove Users', null, null, 'Successfully processed 1'),
    c('P5', 'ps', 'icacls {{confPath}} /remove "Authenticated Users"', null, null, 'Successfully processed 1'),
    c('P5', 'ps', 'icacls {{confPath}} /grant "{{group}}:(OI)(CI)RX"', null, null, 'Successfully processed 1'),
    c('P4', 'ps', 'Set-NetConnectionProfile -InterfaceAlias Ethernet -NetworkCategory Private', null, WORKGROUP),
    c('P4', 'ps', 'New-NetFirewallRule -DisplayName "LedgerSync {{port}}" -Direction Inbound -Protocol TCP -LocalPort {{port}} -Action Allow -Profile {{fwProfile}} -RemoteAddress {{lobSubnet}}'),
    c('P4', 'ps', 'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f', 'NLA is on by default.', null, 'completed successfully'),
    c('P4', 'ps', 'Add-LocalGroupMember -Group "Remote Desktop Users" -Member {{user}}'),
    c('P5', 'ps', 'manage-bde -on C: -RecoveryPassword -em xts_aes256', '-em sets the method directly, so no policy is needed on this path. It prints the 48-digit recovery password: save it to TECH-USB.', null, 'Restart the computer'),
    c('P5', 'ps', 'Set-Content -Path F:\\RecoveryKey.txt -Value "{{recPw}}"'),
    c('P5', 'ps', 'Restart-Computer'),
    c('P5', 'ps', 'Update-MpSignature'),
    c('P5', 'ps', 'Add-MpPreference -ExclusionPath "{{exclusion}}"'),
    c('P6', 'ps', 'msiexec /i C:\\LabFiles\\LedgerSync_2.4_x64.msi /qn SERVER={{lobFqdn}} PORT={{port}}'),
    c('P6', 'ps', 'Get-AppxPackage *{{appShort}}* | Remove-AppxPackage'),
    c('P6', 'ps', 'Get-AppxProvisionedPackage -Online | Where-Object DisplayName -eq {{app}} | Remove-AppxProvisionedPackage -Online'),
    c('P6', 'ps', 'New-Item -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" -Force', 'The deferral policies are four values under the Windows Update policy key.'),
    c('P6', 'ps', 'New-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" -Name DeferFeatureUpdates -Value 1 -PropertyType DWord'),
    c('P6', 'ps', 'New-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" -Name DeferFeatureUpdatesPeriodInDays -Value {{featDays}} -PropertyType DWord'),
    c('P6', 'ps', 'New-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" -Name DeferQualityUpdates -Value 1 -PropertyType DWord'),
    c('P6', 'ps', 'New-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate" -Name DeferQualityUpdatesPeriodInDays -Value {{qualDays}} -PropertyType DWord'),
    c('P6', 'ps', 'reg add "HKLM\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings" /v ActiveHoursStart /t REG_DWORD /d {{ahStart}} /f', null, null, 'completed'),
    c('P6', 'ps', 'reg add "HKLM\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings" /v ActiveHoursEnd /t REG_DWORD /d {{ahEnd}} /f', null, null, 'completed'),
    Object.assign(c('P6', 'ps', 'reg delete "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" /v {{highApp}} /f', 'Once per High-impact app.', null, 'completed'), { each: 'highApp' }),
    c('P6', 'ps', 'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management" /v PagingFiles /t REG_MULTI_SZ /d "C:\\pagefile.sys {{pagefile}} {{pagefile}}" /f', null, null, 'completed'),
    c('P6', 'ps', 'Restart-Computer')
];

/* ═══ EXECUTION ═══ */
const FAIL_WORDS = /error|not recognized|cannot|refused|does not|invalid/i;
function runSteps(s, key, steps, live) {
    for (const st of steps) {
        if (st.when && !st.when.test(s, key)) { continue; }
        if (st.kind === 'ref') { runSteps(s, key, st.steps, live); continue; }
        const items = st.each ? s.wo.performance.highImpact : [null];
        for (const item of items) {
            const extra = Object.assign({}, live, st.each ? { [st.each]: item } : {});
            const where = st.phase + ' ' + (st.kind === 'gui' ? st.win + '/' + st.action : st.kind === 'cmd' ? st.line : st.field);
            if (st.kind === 'gui') {
                const params = {};
                /* typed into the page's form as text, then converted as the page's readParams converts it */
                const schema = GUI.ACTION_SCHEMA[st.win + '/' + st.action];
                Object.keys(st.params).forEach((k) => {
                    const v = String(resolve(st.params[k], s, key, extra)), t = schema.params[k].type;
                    params[k] = t === 'bool' ? v === 'true' : t === 'int' ? Number(v) : t === 'int-list' ? v.split(',').map((x) => Number(x.trim()))
                        : t === 'int-or-word' ? (/^[0-9]+$/.test(v) ? Number(v) : v) : v;
                });
                const r = GUI.act(s, st.win, st.action, params, { key });
                if (!r.ok) { throw new Error('step refused: ' + where + ': ' + r.msg); }
                /* the KB is read once, before the fix; a recheck after the fix finds no hotfix line */
                if (st.action === 'update-history' && !live.faultKb) { const hl = r.msg.split('\n').filter((l) => /^Hotfix/.test(l))[0]; live.faultKb = hl && (hl.match(/KB[0-9]+/) || [])[0]; }
            } else if (st.kind === 'cmd') {
                const line = resolve(st.line, s, key, extra);
                const r = SH.exec(s, st.ctx, line, { key });
                const out = String(r.out || '');
                if (st.expect !== undefined) { if (out.indexOf(resolve(st.expect, s, key, extra)) < 0) { throw new Error('command failed: ' + where + ' -> ' + out.slice(0, 200)); } }
                else if (out && (out.indexOf(line.split(' ')[0] + ' : ') === 0 || FAIL_WORDS.test(out))) { throw new Error('command failed: ' + where + ' -> ' + out.slice(0, 200)); }
                /* values the student reads off the screen, read here from the same output */
                if (/^powercfg \/duplicatescheme/.test(line)) { live.planGuid = out.split('GUID: ')[1].split(' ')[0]; }
                if (/^pnputil \/enum-drivers/.test(line)) {
                    const blk = out.split('Published Name:').slice(1).find((b) => b.indexOf('Meridian') >= 0);
                    if (!blk) { throw new Error('no Meridian driver in pnputil output: ' + out.slice(0, 300)); }
                    live.faultInf = blk.trim().split('\n')[0].trim();
                }
                if (/^manage-bde -on/.test(line)) { live.recPw = (out.match(/[0-9]{6}(-[0-9]{6}){7}/) || [])[0]; if (!live.recPw) { throw new Error('no recovery password in manage-bde output'); } }
                if (/^manage-bde -protectors -get/.test(line)) {
                    const blk = out.split(/Numerical Password:/i)[1] || '';
                    const m = blk.match(/ID:\s*\{?([0-9A-Fa-f]{8})/);
                    if (!m) { throw new Error('no protector ID in: ' + out.slice(0, 300)); }
                    live.protId = m[1];
                }
            } else if (st.kind === 'record') {
                ANS.save(s, st.field, resolve(st.value, s, key, extra));
            }
        }
    }
}

function sitting(uid, forced) { return W.sitting(uid, forced); }
function build(uid, forced, path, p7) {
    const { state, key } = sitting(uid, forced);
    const live = {};
    runSteps(state, key, path === 'shell' ? SHELL : P1.concat(P23, P45, P6), live);
    const h = HO.handover(state, key);
    if (!h.ok) { throw new Error('handover refused: ' + h.msg); }
    runSteps(state, key, p7 ? p7(key) : P7[key.variant], live);
    runSteps(state, key, P8B, live);
    return { g: G.grade(h.snapshot, key, state), key, state };
}

const classes = CORE.variantSpace();
let runs = 0, bad = 0;
const seen = { KMS: 0, MAK: 0, domain: 0, workgroup: 0 };
for (const p of ['gui', 'shell']) {
    const cases = classes.map((cl) => ['guide-' + p + '-' + cl.profileIndex + cl.variantIndex, [cl.profileIndex, cl.variantIndex]]);
    for (let i = 0; i < SEEDS; i++) { cases.push(['guide-' + p + '-seed-' + i, null]); }
    for (const [uid, forced] of cases) {
        runs++;
        try {
            const r = build(uid, forced, p);
            seen[r.key.channel === 'KMS' ? 'KMS' : 'MAK']++; seen[domain(r.state) ? 'domain' : 'workgroup']++; seen[r.key.variant] = (seen[r.key.variant] || 0) + 1; seen[r.key.edition] = (seen[r.key.edition] || 0) + 1; seen[r.key.resiliency] = (seen[r.key.resiliency] || 0) + 1;
            if (r.g.total !== 100) { bad++; console.log('NOT 100 (' + p + '): ' + uid + ' ' + r.g.total + ' ' + JSON.stringify(r.g.rows ? r.g.rows.filter((x) => x.earned < x.points).map((x) => x.id) : '')); }
        } catch (e) { bad++; console.log('THREW (' + p + '): ' + uid + ' ' + e.message.slice(0, 240)); }
    }
}
/* the alternatives: on every class with that fault, 100 with the check, below 100 without it */
const altRuns = {};
for (const a of ALT_VERIFY) {
    const id = a.v + ': ' + a.option;
    altRuns[id] = 0;
    for (const cl of classes.filter((x) => x.variant === a.v)) {
        const uid = 'guide-alt-' + cl.profileIndex + cl.variantIndex, forced = [cl.profileIndex, cl.variantIndex];
        runs++;
        try {
            const yes = build(uid, forced, 'gui', () => altSteps(a, true));
            const no = build(uid, forced, 'gui', () => altSteps(a, false));
            if (yes.g.total !== 100) { bad++; console.log('NOT 100 (alt ' + id + '): ' + uid + ' ' + yes.g.total); }
            else if (no.g.total >= 100) { bad++; console.log('CHECK NOT NEEDED (alt ' + id + '): ' + uid + ' scored ' + no.g.total + ' without it'); }
            else { altRuns[id]++; }
        } catch (e) { bad++; console.log('THREW (alt ' + id + '): ' + uid + ' ' + e.message.slice(0, 240)); }
    }
    if (!altRuns[id]) { bad++; console.log('alt never exercised: ' + id); }
}
console.log('verified: ' + runs + ' sittings (GUI and command paths, and the other Verified-by answers), ' + bad + ' failed; ' + JSON.stringify(seen) + ' ' + JSON.stringify(altRuns));
if (bad) { console.log('Guide NOT written: a step does not score.'); process.exit(1); }

/* ═══ RENDER ═══ */
const esc = (t) => String(t).replace(/\|/g, '\\|');
function renderSteps(steps, out, counter) {
    for (const st of steps) {
        const cond = st.when ? '*(' + st.when.doc + ')* ' : '';
        const note = st.note ? ' ' + st.note : '';
        counter.n++;
        const n = counter.n + '. ';
        if (st.kind === 'ref') { out.push(n + st.text); continue; }
        if (st.kind === 'record') {
            out.push(n + cond + '**Record** tab > **' + ANS.FIELDS[st.field].label + '**: `' + docVal(st.value) + '` > Save.');
            continue;
        }
        if (st.kind === 'gui') {
            const ps = Object.keys(st.params).map((k) => words(k) + ' = `' + docVal(st.params[k]) + '`');
            const p = { true: 'Yes', false: 'No' };
            out.push(n + cond + '**' + NAMES[st.win] + '** > **' + actionLabel(st.action) + '**' + (ps.length ? ': ' + ps.map((x) => x.replace(/`(true|false)`/, (m, b) => '`' + p[b] + '`')).join(', ') : '') + ' > Apply.' + note);
        } else {
            out.push(n + cond + '**' + (CONSOLE_NAMES[st.ctx] || st.ctx) + '**: `' + docVal(st.line) + '`' + note);
        }
    }
}
const PHASE_NAMES = { P1: 'Build and install', P2: 'Name, update, power', P3: 'Accounts and join', P4: 'Network and sharing', P5: 'Storage and protection', P6: 'Apps, updates, performance', P7: 'The ticket', P8: 'The records' };
const ph = {}; CH.CHECKS.forEach((r) => { ph[r.phase] = (ph[r.phase] || 0) + r.points; });

const L = [];
L.push('# MD-100 Final (CTS1156C): Staff Walkthrough');
L.push('');
L.push('**STAFF ONLY. This is the answer to the exam. Never post it, paste it or share it with a student.**');
L.push('');
L.push('Generated by `_tools/mdfinal/mdfinal-staff-guide.js` on ' + new Date().toISOString().slice(0, 10) + '. Before writing this file the generator ran every numbered step below against the exam engine: all ' + classes.length + ' profile and fault classes plus ' + SEEDS + ' random labs, once by the GUI path and once by the command path, and every other "Verified by" answer listed under Phase 7. Every run scored 100/100. If the engine changes, rerun it; it refuses to write a guide whose steps no longer score.');
L.push('');
L.push('What was run and what was not: the window, action, field values and commands of each numbered step were executed. The explanatory notes after each step are hand-written. Two command-path steps (Setup and OOBE) point back to the GUI path rather than repeating it; those GUI steps are the ones run.');
L.push('');
L.push('## How to use it');
L.push('');
L.push('- Every lab is different. Values in `<angle brackets>` come from that student\'s brief; the table at the end says where each one is.');
L.push('- The brief states every build value. The answer sheet confirms the edition, the activation channel (KMS or MAK) and the storage resiliency, and names the P7 fault (V1 to V4), which the brief does not. Run it privately: `MDFINAL_SEED_SECRET=<secret> node _tools/mdfinal/mdfinal-walkthrough.js --student <uid>` (add `--seed N` for a retake or a restart onto a new lab). See `_docs/operations/md100-final-staff-runbook.md`.');
L.push('- Steps marked *(Domain work orders only)*, *(KMS work orders)* and so on apply only when the brief says so. Skip the others.');
L.push('- GUI steps name the window button and the action exactly as the exam page shows them, then the fields to fill. Fields not listed stay blank (the Windows default).');
L.push('- Order matters in three places: set the IPv4 and DNS before the domain join; set the BitLocker policy before turning BitLocker on; restart before handover.');
L.push('');
L.push('## Points by phase');
L.push('');
L.push('| Phase | What | Points |');
L.push('|---|---|---|');
Object.keys(ph).forEach((k) => L.push('| ' + k + ' | ' + (PHASE_NAMES[k] || '') + ' | ' + ph[k] + ' |'));
L.push('');
L.push('## The GUI path (Phases 1 to 6)');
L.push('');
L.push('Each step is tagged with the brief phase it satisfies. The order is the order that works: some P4 lines are done early because P3 depends on them.');
L.push('');
const sections = [['Install and set up Windows', P1], ['Network, name, update, power, accounts, join', P23], ['Storage, sharing, firewall, Remote Desktop, BitLocker, Defender', P45], ['Apps, updates, startup, page file', P6]];
for (const [title, steps] of sections) {
    L.push('### ' + title); L.push('');
    const out = []; const cnt = { n: 0 };
    renderSteps(steps.map((s) => Object.assign({}, s, { note: (s.note ? s.note + ' ' : '') + '[' + s.phase + ']' })), out, cnt);
    L.push(...out); L.push('');
}
L.push('### Hand over');
L.push('');
L.push('Click **Hand over** before minute ' + (EXAMS.durationMinutes(EXAMS.DEFAULT_EXAM_ID) - 40) + ' (at least 40 minutes left of ' + EXAMS.durationMinutes(EXAMS.DEFAULT_EXAM_ID) + '). Handover is one way: Phases 1 to 6 are scored as they stand at this moment, so restart first. The ticket appears in the **Ticket** tab. Phase 7 and the as-built record follow.');
L.push('');
L.push('## Phase 7: the four tickets');
L.push('');
L.push('Every sitting gets one of four faults at handover. The answer sheet names it; the ticket text identifies it too. Do not use Reset this PC or reinstall: that scores 0 for the repair. Each block ends with the incident record (Phase 8).');
L.push('');
const VT = { V1: 'Driver: the backup agent\'s volume filter', V2: 'Update: the hotfix support emailed', V3: 'Runaway process: the sync helper', V4: 'Name resolution: the VPN helper' };
for (const v of ['V1', 'V2', 'V3', 'V4']) {
    const f = FAULTS.CATALOGUE[v];
    L.push('### ' + v + '. ' + VT[v]); L.push('');
    L.push('Ticket: *"' + f.ticket + '"*'); L.push('');
    const out = []; renderSteps(P7[v], out, { n: 0 }); L.push(...out); L.push('');
    const alts = ALT_VERIFY.filter((a) => a.v === v);
    const ownI3 = P7[v].find((st) => st.kind === 'record' && st.field === 'I3').value;
    if (!alts.some((a) => a.option !== ownI3)) {
        L.push('**Verified by:** "' + ownI3 + '" is the only answer that scores for this fault.' + (alts.length ? ' Its check can be the one in the steps above, or this one (with and without the check, both run by the verifier):' : '')); L.push('');
    } else {
        L.push('**Other "Verified by" answers that score.** Each one needs its check done after the fix; without the check it loses the I3 marks (with and without the check, both run by the verifier):'); L.push('');
    }
    for (const a of alts) {
        const out = []; renderSteps([a.check], out, { n: 0 });
        L.push('- "' + a.option + '": ' + out[0].replace(/^1\. /, '') + ' (' + altRuns[v + ': ' + a.option] + ' sittings)');
    }
    if (alts.length) { L.push(''); }
}
L.push('## Phase 8: the as-built record');
L.push('');
L.push('Fill these in once Phase 7 is done. The B fields open once OOBE is complete and the I fields once the ticket exists (mdfinal-answers.js answerFields), so the B fields can also be filled before handover.');
L.push('');
{ const out = []; renderSteps(P8B, out, { n: 0 }); L.push(...out); }
L.push('');
L.push('## The command path (Phases 1 to 6)');
L.push('');
L.push('The same build from the consoles. A step stays in the GUI only where the exam has no command for it. Hand over, Phase 7 and Phase 8 are the same as above. Mixing the two paths is fine.');
L.push('');
{ const out = []; renderSteps(SHELL.map((s) => Object.assign({}, s, { note: (s.note ? s.note + ' ' : '') + '[' + s.phase + ']' })), out, { n: 0 }); L.push(...out); }
L.push('');
L.push('## Where each value comes from');
L.push('');
L.push('| Placeholder | Source |');
L.push('|---|---|');
const used = new Set(); (JSON.stringify([P1, P23, P45, P6, P7, P8B, SHELL]).match(/\{\{(\w+)\}\}/g) || []).forEach((m) => used.add(m.slice(2, -2)));
used.add('planGuid');
const EXTRA = { planGuid: 'The GUID powercfg /duplicatescheme prints' };
[...used].forEach((t) => L.push('| `<' + t + '>` | ' + esc(TOK[t] ? TOK[t][1] : EXTRA[t]) + ' |'));
L.push('');
L.push('Fixed values every sitting shares: switch `Meridian-LAN`; ISO `Win11_24H2_Business_x64.iso`; pool `MeridianPool`, space `MeridianSpace`; domain `meridian.local`, join account `' + JOIN_USER + '`; passwords: technician `' + PW.tech + '`, users `' + PW.user + '`, domain join `' + PW.join + '`; TECH-USB is `F:`.');
L.push('');
L.push('## Points by check');
L.push('');
L.push('| Check | Phase | Points | What |');
L.push('|---|---|---|---|');
CH.CHECKS.forEach((r) => L.push('| ' + r.id + ' | ' + r.phase + ' | ' + r.points + ' | ' + esc(r.title) + ' |'));
L.push('');

fs.writeFileSync(OUT, L.join('\n'));
console.log('wrote ' + OUT + ' (' + L.length + ' lines)');

/* The HTML copy beside it, made with pandoc like the other Solutions walkthroughs, from the same
 * Markdown so the two cannot differ. Full width (no narrow column), tables ruled, a contents list. */
const HTML = OUT.replace(/\.md$/, '') + '.html';
const STYLE = [
    '<style>',
    ':root { --fg: #1b1f24; --bg: #ffffff; --muted: #57606a; --rule: #d0d7de; --code: #f3f5f7; --warn: #8a1c1c; --warnbg: #fdecec; }',
    '@media (prefers-color-scheme: dark) { :root { --fg: #e6edf3; --bg: #0d1117; --muted: #9da7b1; --rule: #30363d; --code: #161b22; --warn: #ffb4b4; --warnbg: #3a1416; } }',
    'html { background: var(--bg); }',
    'body { max-width: none; margin: 0; padding: 24px clamp(16px, 4vw, 48px); color: var(--fg); background: var(--bg); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }',
    'h1 { font-size: 1.8em; margin-top: 0; } h2 { border-bottom: 1px solid var(--rule); padding-bottom: 4px; margin-top: 2em; } h3 { margin-top: 1.6em; }',
    'code { background: var(--code); padding: 1px 4px; border-radius: 4px; font-size: 0.92em; white-space: pre-wrap; overflow-wrap: anywhere; }',
    'table { border-collapse: collapse; width: 100%; margin: 1em 0; display: block; overflow-x: auto; } th, td { border: 1px solid var(--rule); padding: 6px 10px; text-align: left; vertical-align: top; } th { background: var(--code); }',
    'ol li, ul li { margin: 4px 0; } a { color: inherit; }',
    '#TOC { border: 1px solid var(--rule); border-radius: 6px; padding: 8px 16px; margin: 1em 0; } #TOC ul { margin: 4px 0; }',
    '.staff-only { background: var(--warnbg); color: var(--warn); border: 1px solid var(--warn); border-radius: 6px; padding: 10px 14px; font-weight: 600; }',
    '@media print { #TOC { display: none; } body { padding: 0; } }',
    '</style>'
].join('\n');
try {
    const os = require('os');
    const head = path.join(os.tmpdir(), 'mdfinal-guide-head-' + process.pid + '.html');
    fs.writeFileSync(head, STYLE);
    require('child_process').execFileSync('pandoc', [OUT, '-f', 'gfm', '-t', 'html5', '-s', '--toc', '--toc-depth=3',
        '--metadata', 'pagetitle=MD-100 Final Staff Walkthrough', '-H', head, '-o', HTML]);
    fs.unlinkSync(head);
    /* the staff-only line as a banner, so it cannot be missed on screen or on paper */
    let h = fs.readFileSync(HTML, 'utf8').replace('<p><strong>STAFF ONLY.', '<p class="staff-only"><strong>STAFF ONLY.');
    /* pandoc puts the contents above the title and lists the title itself: move it below the
     * opening notes (the banner reads first) and keep only the sections under the title */
    const nav = h.match(/<nav id="TOC" role="doc-toc">\n<ul>\n<li><a [^>]*>[\s\S]*?<\/a>\n(<ul>[\s\S]*<\/ul>)<\/li>\n<\/ul>\n<\/nav>\n/);
    if (!nav || h.indexOf('<h2 id="how-to-use-it">') < 0) { throw new Error('contents list or first section not where expected'); }
    h = h.replace(nav[0], '').replace('<h2 id="how-to-use-it">', '<nav id="TOC" role="doc-toc">\n<strong>Contents</strong>\n' + nav[1] + '\n</nav>\n<h2 id="how-to-use-it">');
    fs.writeFileSync(HTML, h);
    console.log('wrote ' + HTML);
} catch (e) { console.log('HTML not written (pandoc: ' + e.message.split('\n')[0] + '); the Markdown is complete.'); process.exitCode = 1; }
