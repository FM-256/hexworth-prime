/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-gui.js — the GUI action table: which windows exist, what each action accepts, and the
 * gate that refuses anything else before a handler runs.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 1.1, 2.3 (gating), R3 (caps).
 *
 * EVERY ACTION IS DECLARED. ACTION_SCHEMA names each `window/action`, the screen it runs on and
 * the type of every parameter. act() validates the raw params against R3's size and shape caps and
 * then against the schema (unknown keys refused, every key own-property and pattern-checked) BEFORE
 * the handler sees them, so a handler can trust its input's shape. Handlers live in mdfinal-pc.js
 * and are shared with the shell, so the GUI and a command reach the same model.
 *
 * D2 SCOPE: P1 windows (Hyper-V Manager, VM settings, Setup, OOBE, Activation). Later days add rows.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');
    var PC = require('./mdfinal-pc.js');
    var OS = require('./mdfinal-os.js');
    var REG = require('./mdfinal-registry.js');
    var NET = require('./mdfinal-net.js');
    var STO = require('./mdfinal-storage.js');
    var BL = require('./mdfinal-bitlocker.js');

    var L = LIM.LIMITS.params;
    var KEY_RE = /^[A-Za-z][A-Za-z0-9]{0,31}$/;  /* literal of LIMITS.params.keyPattern (tested equal) */
    var GENERIC = 'That action is not available.';

    /* Parameter types. */
    var T = {
        str: function (max) { return { type: 'string', max: max || L.maxString }; },
        int: function (min, max) { return { type: 'int', min: min, max: max }; },
        bool: { type: 'bool' },
        oneOf: function (values) { return { type: 'enum', values: values }; },
        strOrNull: function (max) { return { type: 'string', max: max || L.maxString, nullable: true }; },
        intOrWord: function (min, max, word) { return { type: 'int-or-word', min: min, max: max, word: word }; },
        intList: function (min, max, maxLen) { return { type: 'int-list', min: min, max: max, maxLen: maxLen }; }
    };

    /* window -> which screens offer it (2.3). The host windows exist from the first second. */
    var WINDOWS = LIM.deepFreeze({
        'hyperv':      { screens: '*' },
        'vm-settings': { screens: '*' },
        'setup':       { screens: ['setup'] },
        'setup-cmd':   { screens: ['setup'] },
        'oobe':        { screens: ['oobe'] },
        'oobe-cmd':    { screens: ['oobe'] },
        'activation':  { screens: ['desktop'] },
        'desktop':     { screens: ['desktop'] },
        'settings':    { screens: ['desktop'] },
        'power':       { screens: ['desktop'] },
        'lusrmgr':     { screens: ['desktop'] },
        'uac':         { screens: ['desktop'] },
        'sysprops':    { screens: ['desktop'] },
        'regedit':     { screens: ['desktop'] },
        'ncpa':        { screens: ['desktop'] },
        'wf':          { screens: ['desktop'] },
        'explorer':    { screens: ['desktop'] },
        'features':    { screens: ['desktop'] },
        'diskmgmt':    { screens: ['desktop'] },
        'storagespaces': { screens: ['desktop'] },
        'bitlocker':   { screens: ['desktop'] },
        'defender':    { screens: ['desktop'] },
        'gpedit':      { screens: ['desktop'] }
    });

    var ACTION_SCHEMA = LIM.deepFreeze({
        'hyperv/new-vm': { params: { name: T.str(100), generation: T.int(1, 2), memoryMB: T.int(32, 65536),
                                     dynamicMemory: T.bool, vhdxGB: T.int(1, 2048), switch: T.str(64), iso: T.strOrNull(128) },
                           required: ['name', 'generation', 'memoryMB', 'vhdxGB'] },
        'hyperv/delete-vm': { params: {}, required: [] },
        'hyperv/start': { params: {}, required: [] },
        'hyperv/stop': { params: {}, required: [] },
        'hyperv/boot-dvd': { params: {}, required: [] },
        'vm-settings/apply': { params: { memoryMB: T.int(32, 65536), dynamicMemory: T.bool, vcpu: T.int(1, 16),
                                         secureBoot: T.bool, secureBootTemplate: T.oneOf(PC.SECURE_BOOT_TEMPLATES),
                                         vtpm: T.bool, dvdIso: T.strOrNull(128), bootFirst: T.oneOf(['dvd', 'disk', 'network']) },
                               required: [] },
        'setup/lang': { params: { language: T.str(64), timeFormat: T.str(64), keyboard: T.str(64) }, required: [] },
        'setup/option': { params: { agree: T.bool }, required: ['agree'] },
        'setup/key': { params: { key: T.str(29), noKey: T.bool }, required: [] },
        'setup/edition': { params: { edition: T.str(40) }, required: ['edition'] },
        'setup/retry': { params: {}, required: [] },
        'setup/eula': { params: { accept: T.bool }, required: ['accept'] },
        'setup/new': { params: { disk: T.int(0, 15), sizeMB: T.int(1, 2097152) }, required: ['disk', 'sizeMB'] },
        'setup/delete': { params: { disk: T.int(0, 15), part: T.int(1, 64) }, required: ['disk', 'part'] },
        'setup/format': { params: { disk: T.int(0, 15), part: T.int(1, 64) }, required: ['disk', 'part'] },
        'setup/install': { params: { disk: T.int(0, 15), part: T.intOrWord(1, 64, 'unallocated') }, required: ['disk', 'part'] },
        'oobe/region': { params: { region: T.str(64) }, required: [] },
        'oobe/keyboard': { params: { layout: T.str(64) }, required: [] },
        'oobe/name': { params: { hostname: T.str(15), skip: T.bool }, required: [] },
        'oobe/setup-type': { params: { type: T.oneOf(['personal', 'work']) }, required: ['type'] },
        'oobe/domain-join-instead': { params: {}, required: [] },
        'oobe/msa-next': { params: {}, required: [] },
        'oobe/limited-setup': { params: {}, required: [] },
        'oobe/account': { params: { name: T.str(20), password: T.str(127) }, required: ['name', 'password'] },
        'oobe/privacy': { params: { location: T.bool, findMyDevice: T.bool, diagnosticData: T.oneOf(['Required', 'Optional']),
                                    inking: T.bool, tailored: T.bool, advertisingId: T.bool }, required: [] },
        'activation/change-key': { params: { key: T.str(29) }, required: ['key'] },
        'activation/activate': { params: {}, required: [] },
        'desktop/restart': { params: {}, required: [] },
        'settings/rename': { params: { name: T.str(15) }, required: ['name'] },
        'settings/time-zone': { params: { id: T.str(64) }, required: ['id'] },
        'settings/update-check': { params: {}, required: [] },
        'settings/update-install': { params: {}, required: [] },
        'settings/screen-timeout': { params: { minutes: T.int(0, 999) }, required: ['minutes'] },
        'power/create-plan': { params: { name: T.str(64), basedOn: T.str(64), acDisplay: T.int(0, 999) }, required: ['name'] },
        'power/set-active': { params: { plan: T.str(64) }, required: ['plan'] },
        'power/edit-plan': { params: { plan: T.str(64), acDisplay: T.int(0, 999) }, required: ['plan', 'acDisplay'] },
        'lusrmgr/user-new': { params: { name: T.str(20), fullName: T.str(64), password: T.str(127), mustChange: T.bool,
                                        cannotChange: T.bool, neverExpires: T.bool, disabled: T.bool }, required: ['name'] },
        'lusrmgr/user-set': { params: { name: T.str(20), fullName: T.str(64), mustChange: T.bool, cannotChange: T.bool,
                                        neverExpires: T.bool, enabled: T.bool }, required: ['name'] },
        'lusrmgr/user-delete': { params: { name: T.str(20) }, required: ['name'] },
        'lusrmgr/group-new': { params: { name: T.str(20), description: T.str(64) }, required: ['name'] },
        'lusrmgr/group-add': { params: { group: T.str(64), member: T.str(64) }, required: ['group', 'member'] },
        'lusrmgr/group-remove': { params: { group: T.str(64), member: T.str(64) }, required: ['group', 'member'] },
        'uac/set': { params: { level: T.int(1, 4) }, required: ['level'] },
        'sysprops/join': { params: { type: T.oneOf(['domain', 'workgroup']), name: T.str(64), user: T.str(64), password: T.str(127) }, required: ['type', 'name'] },
        'regedit/set': { params: { key: T.str(260), name: T.str(64), type: T.oneOf(['REG_SZ', 'REG_DWORD', 'REG_QWORD', 'REG_EXPAND_SZ', 'REG_MULTI_SZ', 'REG_BINARY']),
                                   data: T.str(500) }, required: ['key', 'name', 'type', 'data'] },
        'regedit/delete': { params: { key: T.str(260), name: T.str(64) }, required: ['key', 'name'] },
        'regedit/new-key': { params: { key: T.str(260) }, required: ['key'] },
        'ncpa/ipv4': { params: { dhcp: T.bool, ip: T.str(15), mask: T.str(15), gateway: T.str(15), dnsAuto: T.bool, dns1: T.str(15), dns2: T.str(15) }, required: [] },
        'settings/net-profile': { params: { category: T.oneOf(['Public', 'Private']) }, required: ['category'] },
        'wf/rule-new': { params: { name: T.str(64), direction: T.oneOf(['Inbound', 'Outbound']), action: T.oneOf(['Allow', 'Block']),
                                   protocol: T.oneOf(['TCP', 'UDP', 'Any']), localPort: T.str(100), profile: T.str(40), remoteAddress: T.str(300), enabled: T.bool },
                         required: ['name'] },
        'wf/rule-set': { params: { name: T.str(64), profile: T.str(40), remoteAddress: T.str(300), localPort: T.str(100), enabled: T.bool }, required: ['name'] },
        'wf/rule-delete': { params: { name: T.str(64) }, required: ['name'] },
        'wf/profile': { params: { profile: T.str(40), on: T.bool }, required: ['profile', 'on'] },
        'sysprops/remote': { params: { enabled: T.bool, nla: T.bool }, required: [] },
        'sysprops/remote-users-add': { params: { user: T.str(64) }, required: ['user'] },
        'explorer/new-folder': { params: { path: T.str(260) }, required: ['path'] },
        'explorer/share': { params: { path: T.str(260), name: T.str(80) }, required: ['path', 'name'] },
        'explorer/share-perm': { params: { name: T.str(80), principal: T.str(64), right: T.oneOf(['Read', 'Change', 'Full']), type: T.oneOf(['Allow', 'Deny']) }, required: ['name', 'principal', 'right'] },
        'explorer/share-perm-remove': { params: { name: T.str(80), principal: T.str(64) }, required: ['name', 'principal'] },
        'explorer/stop-share': { params: { name: T.str(80) }, required: ['name'] },
        'explorer/security-inheritance': { params: { path: T.str(260), mode: T.oneOf(['convert', 'remove', 'enable']) }, required: ['path', 'mode'] },
        'explorer/security-grant': { params: { path: T.str(260), principal: T.str(64), rights: T.oneOf(['FullControl', 'Modify', 'ReadAndExecute', 'Read', 'Write']), type: T.oneOf(['Allow', 'Deny']) }, required: ['path', 'principal', 'rights'] },
        'explorer/security-remove': { params: { path: T.str(260), principal: T.str(64) }, required: ['path', 'principal'] },
        'features/smb1': { params: { on: T.bool }, required: ['on'] },
        'diskmgmt/init': { params: { disk: T.int(0, 15), style: T.oneOf(['GPT', 'MBR']) }, required: ['disk'] },
        'diskmgmt/new-volume': { params: { disk: T.int(0, 15), sizeMB: T.int(8, 2097152), letter: T.str(2), fs: T.oneOf(['NTFS', 'ReFS', 'exFAT', 'FAT32']), label: T.str(32) }, required: ['disk'] },
        'diskmgmt/format': { params: { letter: T.str(2), fs: T.oneOf(['NTFS', 'ReFS', 'exFAT', 'FAT32']), label: T.str(32) }, required: ['letter'] },
        'diskmgmt/change-letter': { params: { from: T.str(2), to: T.str(2) }, required: ['from', 'to'] },
        'diskmgmt/delete-volume': { params: { letter: T.str(2) }, required: ['letter'] },
        'diskmgmt/shrink': { params: { letter: T.str(2), shrinkMB: T.int(1, 2097152) }, required: ['letter', 'shrinkMB'] },
        'diskmgmt/extend': { params: { letter: T.str(2), extendMB: T.int(1, 2097152) }, required: ['letter'] },
        'storagespaces/pool-new': { params: { name: T.str(64), disks: T.intList(0, 15, 8) }, required: ['name', 'disks'] },
        'storagespaces/space-new': { params: { name: T.str(64), resiliency: T.oneOf(['Simple', 'Two-way mirror']), letter: T.str(2), fs: T.oneOf(['NTFS', 'ReFS']), label: T.str(32) }, required: ['resiliency', 'letter'] },
        'bitlocker/turn-on': { params: { saveTo: T.str(260), backup: T.oneOf(['file', 'print']), runSystemCheck: T.bool }, required: [] },
        'bitlocker/backup': { params: { saveTo: T.str(260) }, required: ['saveTo'] },
        'bitlocker/suspend': { params: {}, required: [] },
        'bitlocker/turn-off': { params: {}, required: [] },
        'gpedit/fve-os-method': { params: { method: T.oneOf(['AES-CBC 128', 'AES-CBC 256', 'XTS-AES 128', 'XTS-AES 256']) }, required: ['method'] },
        'bitlocker/resume': { params: {}, required: [] },
        'defender/update': { params: {}, required: [] },
        'defender/realtime': { params: { on: T.bool }, required: ['on'] },
        'defender/tamper': { params: { on: T.bool }, required: ['on'] },
        'defender/exclusion-add': { params: { path: T.str(260) }, required: ['path'] },
        'defender/exclusion-remove': { params: { path: T.str(260) }, required: ['path'] }
    });

    /* lusrmgr.msc is not available on Home editions (the real snap-in refusal). */
    var LUSRMGR_HOME = 'This snapin may not be used with this edition of Windows. To manage user accounts for this computer, use the User Accounts tool in the Control Panel.';
    function lusr(fn) {
        return function (s, p) {
            if (s.os && (s.os.edition === 'Home' || s.os.edition === 'Home N')) { return { ok: false, msg: LUSRMGR_HOME }; }
            return fn(s, p);
        };
    }

    /* Handlers, one per schema row (schemaGaps() proves the two tables match). */
    var HANDLERS = {
        'hyperv/new-vm': function (s, p) { return PC.newVm(s, p); },
        'hyperv/delete-vm': function (s) { return PC.deleteVm(s); },
        'hyperv/start': function (s) { return PC.startVm(s); },
        'hyperv/stop': function (s) { return PC.stopVm(s); },
        'hyperv/boot-dvd': function (s) { return PC.bootFromDvd(s); },
        'vm-settings/apply': function (s, p) { return PC.setVm(s, p); },
        'setup/lang': function (s) { return PC.setupLang(s); },
        'setup/option': function (s, p) { return PC.setupOption(s, p); },
        'setup/key': function (s, p) { return PC.setupKey(s, p); },
        'setup/edition': function (s, p) { return PC.setupEdition(s, p); },
        'setup/retry': function (s) { return PC.setupRetry(s); },
        'setup/eula': function (s, p) { return PC.setupEula(s, p); },
        'setup/new': function (s, p) { return PC.setupNew(s, p); },
        'setup/delete': function (s, p) { return PC.setupDelete(s, p); },
        'setup/format': function (s, p) { return PC.setupFormat(s, p); },
        'setup/install': function (s, p) { return PC.setupInstall(s, p); },
        'oobe/region': function (s) { return PC.oobeRegion(s); },
        'oobe/keyboard': function (s) { return PC.oobeKeyboard(s); },
        'oobe/name': function (s, p) { return PC.oobeName(s, p); },
        'oobe/setup-type': function (s, p) { return PC.oobeSetupType(s, p); },
        'oobe/domain-join-instead': function (s) { return PC.oobeDomainJoinInstead(s); },
        'oobe/msa-next': function (s) { return PC.oobeMsaNext(s); },
        'oobe/limited-setup': function (s) { return PC.oobeLimitedSetup(s); },
        'oobe/account': function (s, p) { return PC.oobeAccount(s, p); },
        'oobe/privacy': function (s, p) { return PC.oobePrivacy(s, p); },
        'activation/change-key': function (s, p) {
            var r = PC.slmgrIpk(s, p.key);
            return r.ok ? PC.slmgrAto(s) : r;
        },
        'activation/activate': function (s) { return PC.slmgrAto(s); },
        'desktop/restart': function (s) { return PC.restart(s); },
        'settings/rename': function (s, p) { return OS.rename(s, p.name); },
        'settings/time-zone': function (s, p) { return OS.setTimeZone(s, p.id); },
        'settings/update-check': function (s) { return OS.checkUpdates(s); },
        'settings/update-install': function (s) { return OS.installUpdates(s); },
        'settings/screen-timeout': function (s, p) { return OS.screenTimeout(s, p.minutes); },
        'power/create-plan': function (s, p) { return OS.createPlan(s, p); },
        'power/set-active': function (s, p) { return OS.setActive(s, p.plan); },
        'power/edit-plan': function (s, p) { return OS.editPlan(s, p); },
        'lusrmgr/user-new': lusr(function (s, p) { var q = JSON.parse(JSON.stringify(p)); q.source = 'lusrmgr'; return OS.newUser(s, q); }),
        'lusrmgr/user-set': lusr(function (s, p) { return OS.setUser(s, p); }),
        'lusrmgr/user-delete': lusr(function (s, p) { return OS.deleteUser(s, p.name); }),
        'lusrmgr/group-new': lusr(function (s, p) { return OS.newGroup(s, p); }),
        'lusrmgr/group-add': lusr(function (s, p) { return OS.addMember(s, p); }),
        'lusrmgr/group-remove': lusr(function (s, p) { return OS.removeMember(s, p); }),
        'uac/set': function (s, p) { return OS.setUacLevel(s, p.level); },
        'sysprops/join': function (s, p) { return OS.join(s, p); },
        'regedit/set': function (s, p) { return REG.write(s, 'desktop', p.key, p.name, p.type, p.data, false); },
        'regedit/delete': function (s, p) { return REG.del(s, p.key, p.name); },
        'ncpa/ipv4': function (s, p) { return OS.setIpv4(s, p); },
        'settings/net-profile': function (s, p) { return NET.setCategory(s, p.category); },
        'wf/rule-new': function (s, p) { return NET.newRule(s, p); },
        'wf/rule-set': function (s, p) { return NET.setRule(s, p.name, p); },
        'wf/rule-delete': function (s, p) { return NET.deleteRule(s, p.name); },
        'wf/profile': function (s, p) { return NET.setProfile(s, p.profile, p.on); },
        'sysprops/remote': function (s, p) { return NET.setRemote(s, p); },
        'sysprops/remote-users-add': function (s, p) {
            if (s.os && (s.os.edition === 'Home' || s.os.edition === 'Home N')) { return { ok: false, msg: 'Your Home edition of Windows 11 doesn\'t support Remote Desktop.' }; }
            return OS.addMember(s, { group: 'Remote Desktop Users', member: p.user });
        },
        'explorer/new-folder': function (s, p) { return NET.newFolder(s, p.path, false); },
        'explorer/share': function (s, p) { return NET.newShare(s, { name: p.name, path: p.path }); },
        'explorer/share-perm': function (s, p) { return NET.sharePermSet(s, p.name, p.principal, p.right, p.type || 'Allow'); },
        'explorer/share-perm-remove': function (s, p) { return NET.sharePermRemove(s, p.name, p.principal); },
        'explorer/stop-share': function (s, p) { return NET.removeShare(s, p.name); },
        'explorer/security-inheritance': function (s, p) { return NET.ntfsInheritance(s, p.path, p.mode); },
        'explorer/security-grant': function (s, p) { return NET.ntfsGrant(s, p.path, p.principal, p.rights, p.type || 'Allow'); },
        'explorer/security-remove': function (s, p) { return NET.ntfsRemove(s, p.path, p.principal); },
        'features/smb1': function (s, p) { return NET.setSmb1(s, p.on); },
        'diskmgmt/init': function (s, p) { return STO.initDisk(s, p.disk, p.style || 'GPT'); },
        'diskmgmt/new-volume': function (s, p) { var q = JSON.parse(JSON.stringify(p)); q.defaultLetter = true; return STO.newVolume(s, q); },
        'diskmgmt/format': function (s, p) { return STO.formatVolume(s, p.letter, p.fs, p.label); },
        'diskmgmt/change-letter': function (s, p) { return STO.changeLetter(s, p.from, p.to); },
        'diskmgmt/delete-volume': function (s, p) { return STO.deleteVolume(s, p.letter); },
        'diskmgmt/shrink': function (s, p) { return STO.shrink(s, p.letter, p.shrinkMB); },
        'diskmgmt/extend': function (s, p) { return STO.extend(s, p.letter, p.extendMB); },
        'storagespaces/pool-new': function (s, p) { return STO.newPool(s, p.name, p.disks); },
        'storagespaces/space-new': function (s, p) { return STO.newSpace(s, p); },
        'bitlocker/turn-on': function (s, p, ctx) { return BL.wizard(s, ctx, p); },
        'bitlocker/backup': function (s, p) { return BL.backupToUsb(s, p.saveTo); },
        'bitlocker/suspend': function (s) { return BL.suspend(s, true); },
        'bitlocker/turn-off': function (s) { return BL.decrypt(s); },
        'gpedit/fve-os-method': function (s, p) {
            var code = { 'AES-CBC 128': 3, 'AES-CBC 256': 4, 'XTS-AES 128': 6, 'XTS-AES 256': 7 }[p.method];
            var r = REG.write(s, 'desktop', 'HKLM\\SOFTWARE\\Policies\\Microsoft\\FVE', 'EncryptionMethodWithXtsOs', 'REG_DWORD', String(code), true);
            return r.ok && !r.inert ? { ok: true, msg: '' } : { ok: false, msg: r.msg || 'The policy could not be set.' };
        },
        'bitlocker/resume': function (s) { return BL.suspend(s, false); },
        'defender/update': function (s) { return NET.updateSignatures(s); },
        'defender/realtime': function (s, p) { return NET.setRealtime(s, p.on, false); },
        'defender/tamper': function (s, p) { return NET.setTamper(s, p.on); },
        'defender/exclusion-add': function (s, p) { return NET.addExclusion(s, p.path); },
        'defender/exclusion-remove': function (s, p) { return NET.removeExclusion(s, p.path); },
        'regedit/new-key': function (s, p) {
            var k = REG.canonKey(p.key);
            if (!k) { return { ok: false, msg: 'Cannot create key: the key name is not valid.' }; }
            var parent = k.slice(0, k.lastIndexOf('\\'));
            if (!REG.keyExists(s, parent)) { return { ok: false, msg: 'Cannot create key: the parent key does not exist.' }; }
            return REG.createKey(s, k) ? { ok: true, msg: '' } : { ok: false, msg: LIM.STORAGE_MESSAGE };
        }
    };

    /* Schema rows with no handler, or handlers with no schema row. Must be empty (tested). */
    function schemaGaps() {
        var a = Object.keys(ACTION_SCHEMA), b = Object.keys(HANDLERS);
        return a.filter(function (k) { return b.indexOf(k) < 0; }).concat(b.filter(function (k) { return a.indexOf(k) < 0; }));
    }

    /* The screen the student is on: the host before any VM, else whatever the VM shows. */
    function currentScreen(state) { return state.screen || 'hyperv'; }

    /* Does the current screen offer this window? (2.3: OS windows only after the desktop exists.) */
    function screenAllows(state, windowName) {
        var w = Object.prototype.hasOwnProperty.call(WINDOWS, windowName) ? WINDOWS[windowName] : null;
        if (!w) { return false; }
        return w.screens === '*' || w.screens.indexOf(currentScreen(state)) >= 0;
    }

    /* Depth of a JSON value (a scalar is depth 0). */
    function depth(v) {
        if (v === null || typeof v !== 'object') { return 0; }
        var vals = Array.isArray(v) ? v : Object.keys(v).map(function (k) { return v[k]; });
        return 1 + vals.reduce(function (m, x) { return Math.max(m, depth(x)); }, 0);
    }

    /* R3 shape caps, then the action's schema. Returns null when valid, else a reason (logged
     * server-side only; the student always sees the generic message). */
    function invalid(schema, params) {
        if (params === null || typeof params !== 'object' || Array.isArray(params)) { return 'params not an object'; }
        if (Object.getPrototypeOf(params) !== Object.prototype && Object.getPrototypeOf(params) !== null) { return 'params prototype'; }
        var json;
        try { json = JSON.stringify(params); } catch (e) { return 'params not serialisable'; }
        if (Buffer.byteLength(json) > L.maxBytes) { return 'params too large'; }
        if (depth(params) > L.maxDepth) { return 'params too deep'; }
        var keys = Object.keys(params);
        if (keys.length > L.maxKeys) { return 'too many keys'; }
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (!KEY_RE.test(k)) { return 'bad key'; }
            if (!Object.prototype.hasOwnProperty.call(schema.params, k)) { return 'unknown key ' + k; }
            var t = schema.params[k], v = params[k];
            if (t.type === 'string') {
                if (v === null && t.nullable) { continue; }
                if (typeof v !== 'string' || v.length > t.max) { return 'bad string ' + k; }
            } else if (t.type === 'int') {
                if (typeof v !== 'number' || Math.floor(v) !== v || v < t.min || v > t.max) { return 'bad int ' + k; }
            } else if (t.type === 'bool') {
                if (typeof v !== 'boolean') { return 'bad bool ' + k; }
            } else if (t.type === 'enum') {
                if (typeof v !== 'string' || t.values.indexOf(v) < 0) { return 'bad enum ' + k; }
            } else if (t.type === 'int-list') {
                if (!Array.isArray(v) || v.length < 1 || v.length > t.maxLen) { return 'bad list ' + k; }
                for (var q = 0; q < v.length; q++) { if (typeof v[q] !== 'number' || Math.floor(v[q]) !== v[q] || v[q] < t.min || v[q] > t.max) { return 'bad list ' + k; } }
            } else if (t.type === 'int-or-word') {
                if (v !== t.word && (typeof v !== 'number' || Math.floor(v) !== v || v < t.min || v > t.max)) { return 'bad value ' + k; }
            } else { return 'unknown type'; }
        }
        for (var j = 0; j < schema.required.length; j++) {
            if (!Object.prototype.hasOwnProperty.call(params, schema.required[j])) { return 'missing ' + schema.required[j]; }
        }
        return null;
    }

    /* The one entry point for a GUI action. Refuses (generic message) an unknown window/action, a
     * window the current screen does not offer, or params that fail R3 or the schema. */
    function act(state, windowName, action, params, ctx) {
        var id = String(windowName) + '/' + String(action);
        if (!Object.prototype.hasOwnProperty.call(ACTION_SCHEMA, id)) { return { ok: false, msg: GENERIC, refused: 'unknown action' }; }
        if (!screenAllows(state, String(windowName))) { return { ok: false, msg: GENERIC, refused: 'screen' }; }
        var why = invalid(ACTION_SCHEMA[id], params === undefined ? {} : params);
        if (why) { return { ok: false, msg: GENERIC, refused: why }; }
        if (state.ledger.length >= LIM.LIMITS.ledger.maxEntries) { return { ok: false, msg: LIM.STORAGE_MESSAGE, refused: 'ledger cap' }; }
        var r = HANDLERS[id](state, params || {}, ctx || {});
        return { ok: r.ok, msg: r.msg, screen: currentScreen(state) };
    }

    module.exports = {
        WINDOWS: WINDOWS, ACTION_SCHEMA: ACTION_SCHEMA, act: act, invalid: invalid, schemaGaps: schemaGaps,
        screenAllows: screenAllows, currentScreen: currentScreen, GENERIC: GENERIC, KEY_RE_SOURCE: KEY_RE.source
    };
})();
