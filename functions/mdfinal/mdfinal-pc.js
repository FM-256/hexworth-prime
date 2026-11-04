/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-pc.js — the simulated PC: Hyper-V host, VM, disks, Setup, OOBE, activation, boot.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 2.1 (state), 2.2 (realism),
 * 2.3 (gating), 3.2 (no default-state points), 13.2 item 2, 13.6.
 *
 * WHAT THIS MODULE IS. Pure operations over the server-held state. Each operation validates the
 * screen it runs on, mutates `state` the way the real product would, appends graded evidence to the
 * ledger, and returns { ok, msg, screen }. The GUI action table (mdfinal-gui.js) and the shell
 * (mdfinal-shell.js) both call these, so a GUI path and a command path cannot disagree about what
 * happened. Nothing here reads the clock, the answer key or the network.
 *
 * WHAT IT NEVER DOES. It never reads `state.wo` to decide whether something WORKED (the WO is what
 * the student was told, not what is true), with one deliberate exception: the work order's printed
 * MAK, which is a real key the student was handed, is accepted by the licensing model.
 * Everything a check needs is read later from the state this module produced, plus the key.
 *
 * DECLARED SIMPLIFICATIONS (each a real behaviour narrowed, never invented):
 *   - one VM on the host; deleting it deletes its VHDX with it;
 *   - Setup's compatibility check runs when the edition is chosen (or the key selects one);
 *   - a GVLK for another edition is refused by slmgr (0xC004F069) instead of changing edition;
 *   - KMS activation happens on /ato or Settings > Activation, not on a background timer;
 *   - the lab network routes to the KMS host by IP from DHCP; the FQDN needs Meridian DNS.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var crypto = require('crypto');
    var LIM = require('./mdfinal-limits.js');
    var NF = require('../netfinal/netfinal-core.js');

    var freeze = LIM.deepFreeze;
    var own = NF.own;

    var SIM_DEFAULTS = freeze({
        /* Hyper-V New Virtual Machine wizard */
        /* startupMemoryMB lists every wizard default seen across Hyper-V versions (1024 MB in the
         * New Virtual Machine wizard, 4096 MB in Quick Create); the WO avoids all of them. */
        vm: { generation: 1, startupMemoryMB: [1024, 2048, 4096], dynamicMemory: true, vcpu: 1, vhdxGB: 127,
              vtpm: false, secureBoot: true },
        /* Windows 11 after OOBE */
        hostnamePattern: '^DESKTOP-[A-Z0-9]{7}$',
        timeZone: 'Pacific Standard Time',
        workgroup: 'WORKGROUP',
        network: { dhcp: true, dhcpSubnet: '172.25.48.0/20', category: 'Public' },
        rdpEnabled: false,
        privacy: { location: true, findMyDevice: true, diagnosticData: 'Optional', inking: true,
                   tailored: true, advertisingId: true },
        power: {
            activePlan: 'Balanced',
            acDisplayMin: [5, 10, 15], acSleepMin: [15, 30],
            dcDisplayMin: [3, 5], dcSleepMin: [5, 10, 15]
        },
        uac: { ConsentPromptBehaviorAdmin: 5, PromptOnSecureDesktop: 1, EnableLUA: 1 },
        updates: { featureDeferralDays: 0, qualityDeferralDays: 0, activeHours: { start: 8, end: 17 } },
        pagefile: { automatic: true },
        defender: { exclusions: [] },
        bitlockerMethod: 'XTS-AES 128'
    });

    /* ═══ CATALOGUES ═══════════════════════════════════════════════════════════════════════════ */

    /* Edition lists in the order Setup shows them (spec 2.2). The derived edition is never first. */
    var ISO_LIBRARY = freeze({
        'Win10_22H2_x64.iso': { os: 'Windows 10', version: '22H2', build: 19045, revision: 2965,
            editions: ['Home', 'Home N', 'Education', 'Education N', 'Pro', 'Pro N', 'Pro Education',
                       'Pro Education N', 'Pro for Workstations', 'Pro N for Workstations'] },
        'Win11_24H2_Consumer_x64.iso': { os: 'Windows 11', version: '24H2', build: 26100, revision: 1742,
            editions: ['Home', 'Home N', 'Education', 'Education N', 'Pro', 'Pro N', 'Pro Education',
                       'Pro Education N', 'Pro for Workstations', 'Pro N for Workstations'] },
        'Win11_24H2_Business_x64.iso': { os: 'Windows 11', version: '24H2', build: 26100, revision: 1742,
            editions: ['Education', 'Education N', 'Enterprise', 'Enterprise N', 'Pro', 'Pro N', 'Pro Education',
                       'Pro Education N', 'Pro for Workstations', 'Pro N for Workstations'] }
    });

    /* Microsoft's published KMS client setup keys. Public values, printed in the exam's key table. */
    var GVLK = freeze({
        'Pro': 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
        'Pro N': 'MH37W-N47XK-V7XM9-C7227-GCQG9',
        'Pro for Workstations': 'NRG8B-VKK3Q-CXVCJ-9G2XF-6Q84J',
        'Pro N for Workstations': '9FNHH-K3HBT-3W4TD-6383H-6XYWF',
        'Pro Education': '6TP4R-GNPTD-KYYHQ-7B7DP-J447Y',
        'Pro Education N': 'YVWGF-BXNMC-HTQYQ-CPQ99-66QFC',
        'Education': 'NW6C2-QMPVW-D7KKK-3GKT6-VCFB2',
        'Education N': '2WH4N-8QGBV-H22JP-CT43Q-MDWWJ',
        'Enterprise': 'NPPR9-FWDCX-D2C8J-H872K-2YT43',
        'Enterprise N': 'DPH2V-TTNVB-4X9Q3-TJR4H-KHJW4'
    });

    /* Editions that can take a domain join through OOBE's "Domain join instead" (Home cannot). */
    var BUSINESS_EDITIONS = freeze(['Pro', 'Pro N', 'Pro for Workstations', 'Pro N for Workstations',
        'Pro Education', 'Pro Education N', 'Education', 'Education N', 'Enterprise', 'Enterprise N']);

    var SECURE_BOOT_TEMPLATES = freeze(['MicrosoftWindows', 'MicrosoftUEFICertificateAuthority', 'OpenSourceShieldedVM']);

    /* Setup's automatic layout on a blank disk (MB). */
    var EFI_MB = 100, MSR_MB = 16, RECOVERY_MB = 750, SYSTEM_RESERVED_MB = 50;

    /* Built-in power plans with Windows' default timeouts in minutes (0 = never). A Hyper-V guest
     * has no battery and no sleep state; the DC values and the sleep values still exist in each
     * plan and are what powercfg reads and writes. */
    var POWER_PLANS = freeze([
        { guid: '381b4222-f694-41f0-9685-ff5bb260df2e', name: 'Balanced', builtin: true,
          ac: { display: 10, sleep: 30 }, dc: { display: 5, sleep: 15 } },
        { guid: '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c', name: 'High performance', builtin: true,
          ac: { display: 15, sleep: 0 }, dc: { display: 10, sleep: 0 } },
        { guid: 'a1841308-3542-4fea-9a33-1dbe19d7f2ab', name: 'Power saver', builtin: true,
          ac: { display: 5, sleep: 15 }, dc: { display: 3, sleep: 10 } }
    ]);

    var LAB_DHCP = freeze({ gateway: '172.25.48.1', dns: ['172.25.48.1'], prefix: 20 });

    var MSG = freeze({
        state: 'The operation cannot be performed while the virtual machine is in its current state.',
        cantRun: "This PC can't run Windows 11. This PC doesn't meet the minimum system requirements to install " +
                 'this version of Windows. For more information, visit https://aka.ms/WindowsSysReq',
        keyBad: "This product key didn't work. Check it and try again, or try a different key.",
        keyNoImage: 'The product key entered does not match any of the Windows images available for installation. Enter a different product key.',
        noPartition: "We couldn't create a new partition or locate an existing one. For more information, see the Setup log files.",
        noOs: 'No operating system was loaded. Press a key to retry the boot sequence...',
        sbDenied: "The image's hash and certificate are not allowed (DB).",
        msaOffline: "Oops, you've lost internet connection. Let's connect you to a network.",
        slInvalid: 'Error: 0xC004F050 The Software Licensing Service reported that the product key is invalid.',
        slEdition: "Error: 0xC004F069 On a computer running Microsoft Windows non-core edition, run 'slui.exe 0x2a 0xC004F069' to display the error text.",
        slNoKms: 'Error: 0xC004F074 The Software Licensing Service reported that the computer could not be activated. ' +
                 'No Key Management Service (KMS) could be contacted. Please see the Application Event Log for additional information.',
        slNoDns: 'Error: 0x8007232B DNS name does not exist.',
        hostnameBad: 'The name can only use letters, numbers, and hyphens, and it cannot be longer than 15 characters or be only numbers.'
    });

    /* ═══ HELPERS ══════════════════════════════════════════════════════════════════════════════ */

    function ok(msg, screen) { return { ok: true, msg: msg || '', screen: screen }; }
    function fail(msg) { return { ok: false, msg: msg }; }

    /* Graded evidence (R3: never evicted; `ref` is server text only, capped at 64 bytes). */
    function ledger(state, k, ref) {
        var r = ref === undefined || ref === null ? '' : String(ref);
        while (Buffer.byteLength(r) > LIM.LIMITS.ledger.refBytes) { r = r.slice(0, -1); }
        state.ledger.push({ i: state.ledger.length, k: k, ref: r });
    }

    /* Display log, ring buffer (R3). */
    function event(state, kind, detail) {
        state.events.push({ kind: kind, detail: String(detail || '').slice(0, LIM.LIMITS.events.detailChars) });
        if (state.events.length > LIM.LIMITS.events.ringSize) { state.events.splice(0, state.events.length - LIM.LIMITS.events.ringSize); }
    }

    /* Deterministic Windows default name for a sitting (visible on screen, so no secret is needed). */
    function defaultHostname(state) {
        var h = crypto.createHash('sha256').update(JSON.stringify(['default-hostname', state.meta.studentId, state.meta.examId])).digest();
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', s = '';
        for (var i = 0; i < 7; i++) { s += chars[h[i] % chars.length]; }
        return 'DESKTOP-' + s;
    }

    function diskByNumber(state, n) {
        if (!state.disks) { return null; }
        for (var i = 0; i < state.disks.length; i++) { if (state.disks[i].n === Number(n)) { return state.disks[i]; } }
        return null;
    }
    function diskByRole(state, role) {
        if (!state.disks) { return null; }
        for (var i = 0; i < state.disks.length; i++) { if (state.disks[i].role === role) { return state.disks[i]; } }
        return null;
    }
    function usedMb(disk) { return disk.partitions.reduce(function (a, p) { return a + p.mb; }, 0); }
    function freeMb(disk) { return disk.gb * 1024 - usedMb(disk); }
    function partById(disk, id) {
        for (var i = 0; i < disk.partitions.length; i++) { if (disk.partitions[i].id === Number(id)) { return disk.partitions[i]; } }
        return null;
    }
    /* R3: at most this many partitions per disk; Setup and diskpart refuse beyond it. */
    var PARTITION_CAP = LIM.LIMITS.objects.partitionsPerDisk;
    var MSG_PART_CAP = 'Virtual Disk Service error:\nThe maximum number of partitions has been reached on this disk.';
    function roomFor(disk, n) { return disk.partitions.length + n <= PARTITION_CAP; }

    function addPartition(disk, type, mb, extra) {
        var p = { id: disk.nextId++, type: type, mb: mb, letter: null, fs: null, label: null };
        if (extra) { Object.keys(extra).forEach(function (k) { p[k] = extra[k]; }); }
        disk.partitions.push(p);
        return p;
    }
    /* A disk carries what Windows needs to boot from it: an EFI partition (GPT) or an active
     * System Reserved partition (MBR). */
    function hasBootPartition(disk) {
        return disk.partitions.some(function (p) { return p.type === 'EFI' || p.type === 'System Reserved'; });
    }

    /* Anything that destroys or rewrites the archive volume marks it, once, as graded evidence. */
    function damageArchive(state, disk, how) {
        if (disk.role !== 'archive') { return; }
        if (!state.archiveDamage) { state.archiveDamage = []; }
        if (state.archiveDamage.indexOf(how) < 0) { state.archiveDamage.push(how); }
        ledger(state, 'archive-damage', how);
    }

    /* ═══ HYPER-V HOST ═════════════════════════════════════════════════════════════════════════ */

    /* Builds the VM's disk list: the student's OS VHDX plus the fabric-attached disks, numbered the
     * way Windows numbers them (Gen2: SCSI location order, archive first if the WO says so; Gen1:
     * the IDE boot disk first). */
    function attachDisks(state) {
        var vm = state.vm, wo = state.wo, f = state.host.fabricDisks;
        var osDisk = { file: vm.osVhdx.file, gb: vm.osVhdx.gb, role: 'os', style: null, partitions: [], nextId: 1 };
        var archive = { file: f[0].file, gb: f[0].gb, role: 'archive', style: 'GPT', partitions: [], nextId: 1 };
        addPartition(archive, 'MSR', MSR_MB);
        addPartition(archive, 'Primary', f[0].gb * 1024 - MSR_MB, { letter: f[0].letter, fs: 'NTFS', label: f[0].label,
            files: wo.disks.archiveManifest.map(function (x) { return { name: x.name, bytes: x.bytes, sha256: x.sha256 }; }) });
        var pool1 = { file: f[1].file, gb: f[1].gb, role: 'pool', style: null, partitions: [], nextId: 1 };
        var pool2 = { file: f[2].file, gb: f[2].gb, role: 'pool', style: null, partitions: [], nextId: 1 };
        var usb = { file: f[3].file, gb: f[3].gb, role: 'usb', style: 'MBR', partitions: [], nextId: 1 };
        addPartition(usb, 'Primary', f[3].gb * 1024, { letter: 'F', fs: 'FAT32', label: 'TECH-USB' });
        var order = (vm.generation === 2 && wo.disks.archiveAtLocation0)
            ? [archive, osDisk, pool1, pool2, usb] : [osDisk, archive, pool1, pool2, usb];
        order.forEach(function (d, i) { d.n = i; });
        state.disks = order;
    }

    /* Hyper-V Manager > New > Virtual Machine. The wizard has no processor page: vCPU is 1 until
     * changed in Settings, exactly as on a real host. */
    function newVm(state, p) {
        if (state.vm) { return fail('This lab host allows one virtual machine. Delete "' + state.vm.name + '" first.'); }
        var name = String(p.name || '').trim();
        if (!name || name.length > 100) { return fail('The virtual machine name is not valid.'); }
        var gen = Number(p.generation);
        if (gen !== 1 && gen !== 2) { return fail('Specify generation 1 or generation 2.'); }
        var mem = Number(p.memoryMB);
        if (!(mem >= 32 && mem <= 65536) || mem % 2 !== 0) { return fail('Startup memory must be an even number of MB between 32 and 65536.'); }
        var gb = Number(p.vhdxGB);
        if (!(gb >= 1 && gb <= 2048) || Math.floor(gb) !== gb) { return fail('The virtual hard disk size must be a whole number of GB between 1 and 2048.'); }
        var sw = p.switch === undefined ? 'Not Connected' : String(p.switch);
        var switches = state.host.switches.map(function (s) { return s.name; });
        if (sw !== 'Not Connected' && switches.indexOf(sw) < 0) { return fail('The virtual switch "' + sw + '" was not found.'); }
        var iso = p.iso === undefined || p.iso === null || p.iso === '' ? null : String(p.iso);
        if (iso !== null && state.host.isoLibrary.indexOf(iso) < 0) { return fail('The file "' + iso + '" was not found in the ISO library.'); }
        state.vm = {
            name: name, generation: gen, memoryMB: mem, dynamicMemory: p.dynamicMemory === true, vcpu: 1,
            osVhdx: { file: name + '.vhdx', gb: gb }, switch: sw, dvd: iso,
            secureBoot: gen === 2 ? { on: true, template: 'MicrosoftWindows' } : null,
            vtpm: false, keyProtector: false, power: 'off', bootFirst: iso ? 'dvd' : 'disk'
        };
        attachDisks(state);
        ledger(state, 'vm-new', 'gen' + gen);
        event(state, 'hyperv', 'Created VM ' + name);
        return ok('Virtual machine "' + name + '" created.', 'hyperv');
    }

    /* Hyper-V Manager > Delete. The VHDX goes too (declared simplification). Refused while running. */
    function deleteVm(state) {
        if (!state.vm) { return fail('There is no virtual machine to delete.'); }
        if (state.vm.power !== 'off') { return fail(MSG.state); }
        state.vm = null; state.disks = null; state.setup = null; state.os = null;
        state.identity = null; state.network = null; state.screen = 'hyperv';
        ledger(state, 'vm-delete', '');
        return ok('Virtual machine deleted.', 'hyperv');
    }

    /* VM Settings. Memory, processor, firmware and security need the VM off; the DVD can change live. */
    function setVm(state, p) {
        var vm = state.vm;
        if (!vm) { return fail('There is no virtual machine.'); }
        var needsOff = ['memoryMB', 'dynamicMemory', 'vcpu', 'secureBoot', 'secureBootTemplate', 'vtpm', 'bootFirst']
            .some(function (k) { return p[k] !== undefined; });
        if (needsOff && vm.power !== 'off') { return fail(MSG.state); }
        if ((p.secureBoot !== undefined || p.secureBootTemplate !== undefined || p.vtpm !== undefined) && vm.generation !== 2) {
            return fail('Security settings are not available for generation 1 virtual machines.');
        }
        if (p.memoryMB !== undefined) {
            var mem = Number(p.memoryMB);
            if (!(mem >= 32 && mem <= 65536) || mem % 2 !== 0) { return fail('Startup memory must be an even number of MB between 32 and 65536.'); }
            vm.memoryMB = mem;
        }
        if (p.dynamicMemory !== undefined) { vm.dynamicMemory = p.dynamicMemory === true; }
        if (p.vcpu !== undefined) {
            var c = Number(p.vcpu);
            if (!(c >= 1 && c <= 16) || Math.floor(c) !== c) { return fail('The number of virtual processors must be between 1 and 16.'); }
            vm.vcpu = c;
        }
        if (p.secureBoot !== undefined) { vm.secureBoot.on = p.secureBoot === true; }
        if (p.secureBootTemplate !== undefined) {
            if (SECURE_BOOT_TEMPLATES.indexOf(String(p.secureBootTemplate)) < 0) { return fail('The Secure Boot template was not found.'); }
            vm.secureBoot.template = String(p.secureBootTemplate);
        }
        /* The Settings checkbox creates a local key protector when it enables the TPM, as Hyper-V
         * Manager does; Enable-VMTPM in PowerShell needs Set-VMKeyProtector first (mdfinal-shell.js). */
        if (p.vtpm !== undefined) {
            if (p.vtpm === true && !vm.keyProtector) {
                if (p.viaCmdlet === true) { return fail("Failed to enable the virtual TPM for '" + vm.name + "'. A key protector must be configured first (Set-VMKeyProtector)."); }
                vm.keyProtector = true;
            }
            vm.vtpm = p.vtpm === true;
        }
        if (p.dvdIso !== undefined) {
            var iso = p.dvdIso === null || p.dvdIso === '' ? null : String(p.dvdIso);
            if (iso !== null && state.host.isoLibrary.indexOf(iso) < 0) { return fail('The file "' + iso + '" was not found in the ISO library.'); }
            vm.dvd = iso;
        }
        if (p.bootFirst !== undefined) {
            if (['dvd', 'disk', 'network'].indexOf(String(p.bootFirst)) < 0) { return fail('Unknown boot device.'); }
            vm.bootFirst = String(p.bootFirst);
        }
        ledger(state, 'vm-set', Object.keys(p).sort().join(','));
        return ok('Settings applied.', 'hyperv');
    }

    /* Set-VMKeyProtector -NewLocalKeyProtector. */
    function setKeyProtector(state) {
        if (!state.vm) { return fail('There is no virtual machine.'); }
        if (state.vm.generation !== 2) { return fail('Security settings are not available for generation 1 virtual machines.'); }
        state.vm.keyProtector = true;
        ledger(state, 'vm-keyprotector', '');
        return ok('');
    }

    /* Power on: firmware, then whatever boots (spec 2.2 boot model). */
    function startVm(state) {
        var vm = state.vm;
        if (!vm) { return fail('There is no virtual machine.'); }
        if (vm.power === 'on') { return fail(MSG.state); }
        vm.power = 'on';
        ledger(state, 'vm-start', '');
        return boot(state);
    }

    /* Turn Off (hard) or Shut Down. Either way the guest is off; Setup in progress is lost. */
    function stopVm(state) {
        var vm = state.vm;
        if (!vm || vm.power === 'off') { return fail(MSG.state); }
        vm.power = 'off';
        if (state.shell) { state.shell.context = null; state.shell.dp = { disk: null, part: null }; state.shell.pending = null; }
        if (state.setup && !state.os) { state.setup = null; }
        state.screen = 'hyperv';
        ledger(state, 'vm-stop', '');
        return ok('The virtual machine is off.', 'hyperv');
    }

    /* What the VM shows after power-on or a restart. A restart ends every console session: no
     * console context, diskpart selection or pending prompt survives it (Mallory D3 F4). */
    function boot(state) {
        var vm = state.vm;
        if (state.shell) { state.shell.context = null; state.shell.dp = { disk: null, part: null }; state.shell.pending = null; }
        var sbBlocks = vm.generation === 2 && vm.secureBoot.on && vm.secureBoot.template !== 'MicrosoftWindows';
        var osDisk = state.os ? diskByNumber(state, state.os.installDisk) : null;
        var bootable = !!(osDisk && hasBootPartition(osDisk));
        var dvdFirst = vm.dvd && (vm.bootFirst === 'dvd' || !bootable);
        if (dvdFirst && !state.os) {
            if (sbBlocks) { state.screen = 'firmware-error'; return ok(MSG.sbDenied, state.screen); }
            state.setup = { screen: 'lang', iso: vm.dvd, labConfig: state.setup && state.setup.labConfig || {} };
            state.screen = 'setup';
            return ok('Press any key to boot from CD or DVD...', 'setup');
        }
        if (bootable) {
            if (sbBlocks) { state.screen = 'firmware-error'; return ok(MSG.sbDenied, state.screen); }
            applyPending(state);
            state.screen = state.os.oobe.done ? 'desktop' : 'oobe';
            return ok('', state.screen);
        }
        state.screen = 'no-os';
        return ok(MSG.noOs, 'no-os');
    }

    /* "Press any key to boot from CD or DVD..." on a running VM that already has Windows: restarts
     * into Setup from the attached ISO (the normal way to reinstall). Nothing changes until Setup
     * installs; a new install replaces the old Windows, its accounts and its settings. */
    function bootFromDvd(state) {
        var vm = state.vm;
        if (!vm || vm.power !== 'on' || !vm.dvd) { return fail('Insert installation media and start the virtual machine first.'); }
        var sbBlocks = vm.generation === 2 && vm.secureBoot.on && vm.secureBoot.template !== 'MicrosoftWindows';
        if (sbBlocks) { state.screen = 'firmware-error'; return ok(MSG.sbDenied, state.screen); }
        if (state.shell) { state.shell.context = null; state.shell.dp = { disk: null, part: null }; state.shell.pending = null; }
        state.setup = { screen: 'lang', iso: vm.dvd, labConfig: {} };
        state.screen = 'setup';
        ledger(state, 'boot-dvd', '');
        return ok('Press any key to boot from CD or DVD...', 'setup');
    }

    /* ═══ WINDOWS SETUP ════════════════════════════════════════════════════════════════════════ */

    function onSetup(state, screen) {
        if (state.screen !== 'setup' || !state.setup) { return false; }
        return screen === undefined || state.setup.screen === screen;
    }

    /* The Windows 11 hardware check, honouring the LabConfig bypass values set from Shift+F10. */
    function compatible(state, iso) {
        if (ISO_LIBRARY[iso].os !== 'Windows 11') { return true; }
        var vm = state.vm, lc = state.setup.labConfig || {};
        var tpm = (vm.generation === 2 && vm.vtpm) || lc.BypassTPMCheck === 1;
        /* "Secure Boot capable": UEFI firmware that supports it. A Gen2 VM passes with Secure Boot
         * switched off (that is the P1 penalty, not a Setup refusal); Gen1 BIOS needs the bypass. */
        var sb = vm.generation === 2 || lc.BypassSecureBootCheck === 1;
        var ram = vm.memoryMB >= 4096 || lc.BypassRAMCheck === 1;
        var cpu = vm.vcpu >= 2 || lc.BypassCPUCheck === 1;
        return tpm && sb && ram && cpu;
    }

    /* Setup's first page: language, time and currency format, keyboard. */
    function setupLang(state) {
        if (!onSetup(state, 'lang')) { return fail('That screen is not open.'); }
        state.setup.screen = 'option';
        return ok('', 'setup');
    }

    /* "Select setup option": install Windows 11, and the "everything will be deleted" consent. */
    function setupOption(state, p) {
        if (!onSetup(state, 'option')) { return fail('That screen is not open.'); }
        if (p.agree !== true) { return fail('Select "I agree everything will be deleted including files, apps, and settings" to continue.'); }
        state.setup.screen = 'key';
        return ok('', 'setup');
    }

    /* Product key page. A GVLK or the WO's MAK selects its edition; "I don't have a product key"
     * goes to the edition list. */
    function setupKey(state, p) {
        if (!onSetup(state, 'key')) { return fail('That screen is not open.'); }
        var iso = ISO_LIBRARY[state.setup.iso];
        if (p.noKey === true) {
            state.setup.key = null;
            state.setup.screen = 'edition';
            return ok('', 'setup');
        }
        var key = normaliseKey(p.key);
        var ed = keyEdition(state, key);
        if (!ed) { return fail(MSG.keyBad); }
        if (iso.editions.indexOf(ed.edition) < 0) { return fail(MSG.keyNoImage); }
        state.setup.key = { key: key, edition: ed.edition, channel: ed.channel };
        ledger(state, 'setup-key', ed.channel);
        return chooseEdition(state, ed.edition);
    }

    /* Edition list (only shown without a key). */
    function setupEdition(state, p) {
        if (!onSetup(state, 'edition')) { return fail('That screen is not open.'); }
        var ed = String(p.edition || '');
        if (ISO_LIBRARY[state.setup.iso].editions.indexOf(ed) < 0) { return fail('Select the operating system you want to install.'); }
        return chooseEdition(state, ed);
    }

    function chooseEdition(state, ed) {
        state.setup.edition = ed;
        ledger(state, 'setup-edition', ed);
        if (!compatible(state, state.setup.iso)) {
            state.setup.screen = 'cant-run';
            return ok(MSG.cantRun, 'setup');
        }
        state.setup.screen = 'eula';
        return ok('', 'setup');
    }

    /* "Back" from the can't-run page re-runs the check (after Shift+F10 LabConfig changes). */
    function setupRetry(state) {
        if (!onSetup(state, 'cant-run')) { return fail('That screen is not open.'); }
        return chooseEdition(state, state.setup.edition);
    }

    function setupEula(state, p) {
        if (!onSetup(state, 'eula')) { return fail('That screen is not open.'); }
        if (p.accept !== true) { return fail('You must accept the license terms to continue.'); }
        state.setup.screen = 'disk';
        return ok('', 'setup');
    }

    /* True when Setup must add its system partitions to this disk before a Windows partition:
     * no boot partition yet and no existing data partition in the way. */
    function needsSystemPartitions(disk) {
        return !hasBootPartition(disk) && !disk.partitions.some(function (x) { return x.type === 'Primary'; });
    }

    /* Adds what Setup adds ahead of the first Windows partition: EFI + MSR on GPT (MSR only if
     * missing), System Reserved on MBR. Returns the MB it used. */
    function initialiseForWindows(state, disk) {
        var before = usedMb(disk);
        if (disk.style === null) { disk.style = state.vm.generation === 2 ? 'GPT' : 'MBR'; }
        if (!hasBootPartition(disk)) {
            if (disk.style === 'GPT') {
                addPartition(disk, 'EFI', EFI_MB, { fs: 'FAT32' });
                if (!disk.partitions.some(function (x) { return x.type === 'MSR'; })) { addPartition(disk, 'MSR', MSR_MB); }
            } else {
                addPartition(disk, 'System Reserved', SYSTEM_RESERVED_MB, { fs: 'NTFS' });
            }
        }
        return usedMb(disk) - before;
    }

    /* Setup > New: a partition of `sizeMB` on that disk's free space (clamped, as Setup does). */
    function setupNew(state, p) {
        if (!onSetup(state, 'disk')) { return fail('That screen is not open.'); }
        var disk = diskByNumber(state, p.disk);
        if (!disk) { return fail('Select a drive.'); }
        var size = Math.floor(Number(p.sizeMB));
        if (!(size > 0)) { return fail('Enter a size in MB.'); }
        var first = needsSystemPartitions(disk);
        if (!roomFor(disk, first ? 3 : 1)) { return fail(MSG_PART_CAP); }
        if (freeMb(disk) < 1) { return fail('There is not enough unallocated space on this drive.'); }
        var used = first ? initialiseForWindows(state, disk) : 0;
        var mb = Math.min(size - used, freeMb(disk));
        if (mb < 1) { return fail('There is not enough unallocated space on this drive.'); }
        addPartition(disk, 'Primary', mb, { fs: null, explicit: true });
        ledger(state, 'part-create', 'disk' + disk.n);
        return ok(first ? 'To ensure that all Windows features work correctly, Windows might create additional partitions for system files.' : '',
            'setup');
    }

    function setupDelete(state, p) {
        if (!onSetup(state, 'disk')) { return fail('That screen is not open.'); }
        var disk = diskByNumber(state, p.disk), part = disk && partById(disk, p.part);
        if (!part) { return fail('Select a partition.'); }
        disk.partitions.splice(disk.partitions.indexOf(part), 1);
        if (part.files) { damageArchive(state, disk, 'deleted'); }
        ledger(state, 'part-delete', 'disk' + disk.n);
        return ok('', 'setup');
    }

    function setupFormat(state, p) {
        if (!onSetup(state, 'disk')) { return fail('That screen is not open.'); }
        var disk = diskByNumber(state, p.disk), part = disk && partById(disk, p.part);
        if (!part || part.type !== 'Primary') { return fail('Select a partition.'); }
        if (part.files) { delete part.files; damageArchive(state, disk, 'formatted'); }
        part.fs = 'NTFS'; part.label = null;
        ledger(state, 'part-format', 'disk' + disk.n);
        return ok('', 'setup');
    }

    /* Setup > Next. `part` is a partition id, or 'unallocated' for Setup's automatic whole-disk
     * layout (EFI + MSR + Windows + Recovery). */
    function setupInstall(state, p) {
        if (!onSetup(state, 'disk')) { return fail('That screen is not open.'); }
        var disk = diskByNumber(state, p.disk);
        if (!disk) { return fail('Select a drive.'); }
        var part;
        if (p.part === 'unallocated') {
            if (!hasBootPartition(disk) && !needsSystemPartitions(disk)) { return fail(MSG.noPartition); }
            var blank = disk.partitions.length === 0;
            if (!roomFor(disk, blank ? 4 : 3)) { return fail(MSG_PART_CAP); }
            if (freeMb(disk) - (blank ? RECOVERY_MB + EFI_MB + MSR_MB : 0) < 52 * 1024) {
                return fail('Windows can\'t be installed on this drive. The drive is too small.');
            }
            initialiseForWindows(state, disk);
            part = addPartition(disk, 'Primary', freeMb(disk) - (blank ? RECOVERY_MB : 0));
            if (blank) { addPartition(disk, 'Recovery', RECOVERY_MB, { fs: 'NTFS' }); }
            ledger(state, 'auto-layout', 'disk' + disk.n);
        } else {
            part = partById(disk, p.part);
            if (!part || part.type !== 'Primary') { return fail('Select a partition.'); }
            if (!hasBootPartition(disk)) { return fail(MSG.noPartition); }
            if (part.mb < 52 * 1024) { return fail('Windows can\'t be installed on this drive. The partition is too small.'); }
        }
        if (part.files) { damageArchive(state, disk, 'installed-over'); delete part.files; }
        part.fs = 'NTFS'; part.letter = 'C'; part.label = null; part.windows = true;
        var iso = ISO_LIBRARY[state.setup.iso];
        var ed = state.setup.edition;
        var key = state.setup.key;
        state.os = {
            installed: true, os: iso.os, version: iso.version, build: iso.build, revision: iso.revision,
            edition: ed, installDisk: disk.n, systemPartition: part.id, pending: {},
            hostname: { effective: defaultHostname(state), pending: null },
            timeZone: SIM_DEFAULTS.timeZone,
            activation: { key: key ? key.key : null, channel: key ? key.channel : 'Retail', kmsHost: null,
                          status: 'Notification' },
            oobe: { done: false, screen: 'region', bypassNro: false, privacy: null, accountPath: null },
            /* P2-P6 settings at their Windows defaults (mdfinal-os.js operates on these). */
            updates: { checked: false, history: [], pendingRestart: [],
                       activeHours: { manual: false, start: SIM_DEFAULTS.updates.activeHours.start, end: SIM_DEFAULTS.updates.activeHours.end } },
            power: { active: POWER_PLANS[0].guid, plans: POWER_PLANS.map(function (pl) { return JSON.parse(JSON.stringify(pl)); }), created: 0 },
            policies: {}
        };
        state.identity = {
            users: {
                'Administrator': { enabled: false, builtin: true },
                'Guest': { enabled: false, builtin: true },
                'DefaultAccount': { enabled: false, builtin: true },
                'WDAGUtilityAccount': { enabled: false, builtin: true }
            },
            groups: { 'Administrators': { members: ['Administrator'] }, 'Users': { members: [] },
                      'Guests': { members: ['Guest'] }, 'Remote Desktop Users': { members: [] } },
            membership: { type: 'workgroup', name: SIM_DEFAULTS.workgroup, pending: null },
            uac: { ConsentPromptBehaviorAdmin: 5, PromptOnSecureDesktop: 1, EnableLUA: 1, pendingEnableLUA: null }
        };
        state.network = {
            adapters: { Ethernet: { dhcp: true, ip: dhcpAddress(state), prefix: LAB_DHCP.prefix,
                                    gateway: LAB_DHCP.gateway, dns: LAB_DHCP.dns.slice() } },
            category: 'Public', hosts: []
        };
        state.setup = null;
        ledger(state, 'os-install', iso.os + '|' + ed + '|disk' + disk.n);
        event(state, 'setup', 'Installed ' + iso.os + ' ' + ed + ' on disk ' + disk.n);
        state.screen = 'oobe';
        return ok('Installing Windows... Your PC will restart several times.', 'oobe');
    }

    /* A stable DHCP lease from the lab's Default Switch range, per sitting. */
    function dhcpAddress(state) {
        var h = crypto.createHash('sha256').update(JSON.stringify(['dhcp', state.meta.studentId, state.meta.examId])).digest();
        return '172.25.' + (48 + (h[0] % 15)) + '.' + (10 + (h[1] % 240));
    }

    /* ═══ OOBE ═════════════════════════════════════════════════════════════════════════════════ */

    function onOobe(state, screen) {
        return state.screen === 'oobe' && state.os && !state.os.oobe.done &&
            (screen === undefined || state.os.oobe.screen === screen);
    }

    function oobeRegion(state) {
        if (!onOobe(state, 'region')) { return fail('That screen is not open.'); }
        state.os.oobe.screen = 'keyboard';
        return ok('', 'oobe');
    }

    function oobeKeyboard(state) {
        if (!onOobe(state, 'keyboard')) { return fail('That screen is not open.'); }
        state.os.oobe.screen = 'name';
        return ok('', 'oobe');
    }

    /* "Let's name your device". Skip keeps the DESKTOP- name. Takes effect when OOBE restarts. */
    function oobeName(state, p) {
        if (!onOobe(state, 'name')) { return fail('That screen is not open.'); }
        if (p.skip !== true) {
            var name = String(p.hostname || '');
            if (!validHostname(name)) { return fail(MSG.hostnameBad); }
            state.os.hostname.effective = name.toUpperCase();
            ledger(state, 'oobe-name', '');
        }
        state.os.oobe.screen = isBusiness(state.os.edition) && !state.os.oobe.bypassNro ? 'setup-type' : 'msa';
        if (state.os.oobe.bypassNro && state.os.oobe.screen === 'msa') { state.os.oobe.screen = 'msa-offline'; }
        return ok('', 'oobe');
    }

    function validHostname(n) {
        if (!n || n.length > 15) { return false; }
        for (var i = 0; i < n.length; i++) {
            var c = n.charCodeAt(i);
            var okc = (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 45;
            if (!okc) { return false; }
        }
        var allDigits = true;
        for (var j = 0; j < n.length; j++) { if (n.charCodeAt(j) < 48 || n.charCodeAt(j) > 57) { allDigits = false; } }
        return !allDigits && n[0] !== '-' && n[n.length - 1] !== '-';
    }

    function isBusiness(ed) { return BUSINESS_EDITIONS.indexOf(ed) >= 0; }

    /* "How would you like to set up this device?" (business editions only). Enterprise and the
     * Education editions offer only work or school. */
    function oobeSetupType(state, p) {
        if (!onOobe(state, 'setup-type')) { return fail('That screen is not open.'); }
        var t = String(p.type || '');
        var ed = state.os.edition;
        var personalAllowed = ed.indexOf('Enterprise') < 0 && ed.indexOf('Education') < 0;
        if (t === 'personal' && personalAllowed) { state.os.oobe.screen = 'msa'; return ok('', 'oobe'); }
        if (t !== 'work') { return fail('Choose how you would like to set up this device.'); }
        state.os.oobe.screen = 'work-signin';
        return ok('', 'oobe');
    }

    /* Work or school sign-in > Sign-in options > Domain join instead. */
    function oobeDomainJoinInstead(state) {
        if (!onOobe(state, 'work-signin')) { return fail('That screen is not open.'); }
        state.os.oobe.screen = 'account';
        state.os.oobe.accountPath = 'domain-join-instead';
        ledger(state, 'oobe-path', 'domain-join-instead');
        return ok('', 'oobe');
    }

    /* The Microsoft account page has no way forward on the lab network (no internet). */
    function oobeMsaNext(state) {
        if (!onOobe(state, 'msa')) { return fail('That screen is not open.'); }
        return fail(MSG.msaOffline);
    }

    /* After OOBE\BYPASSNRO: "I don't have internet" > "Continue with limited setup". */
    function oobeLimitedSetup(state) {
        if (!onOobe(state, 'msa-offline')) { return fail('That screen is not open.'); }
        state.os.oobe.screen = 'account';
        state.os.oobe.accountPath = 'limited-setup';
        ledger(state, 'oobe-path', 'limited-setup');
        return ok('', 'oobe');
    }

    /* Shift+F10 in OOBE: `oobe\bypassnro` restarts OOBE with the offline option. */
    function bypassNro(state) {
        if (!onOobe(state)) { return fail("'oobe\\bypassnro' is not recognized as an internal or external command."); }
        state.os.oobe.bypassNro = true;
        state.os.oobe.screen = 'region';
        ledger(state, 'bypassnro', '');
        return ok('The system is restarting...', 'oobe');
    }

    /* "Who's going to use this device?" plus password and security questions. */
    function oobeAccount(state, p) {
        if (!onOobe(state, 'account')) { return fail('That screen is not open.'); }
        var name = String(p.name || '').trim();
        var reserved = ['administrator', 'guest', 'defaultaccount', 'wdagutilityaccount', 'system', 'users', 'administrators'];
        if (!name || name.length > 20 || reserved.indexOf(name.toLowerCase()) >= 0 || /["\/\\\[\]:;|=,+*?<>@]/.test(name)) {
            return fail('That user name isn\'t allowed. Try another one.');
        }
        if (typeof p.password !== 'string' || p.password.length < 1 || p.password.length > 127) {
            return fail('Enter a password.');
        }
        state.identity.users[name] = { enabled: true, builtin: false, oobe: true, mustChange: false, neverExpires: false };
        state.identity.groups.Administrators.members.push(name);
        state.identity.groups.Users.members.push(name);
        ledger(state, 'oobe-account', '');
        state.os.oobe.screen = 'privacy';
        return ok('', 'oobe');
    }

    var PRIVACY_KEYS = freeze(['location', 'findMyDevice', 'diagnosticData', 'inking', 'tailored', 'advertisingId']);

    /* "Choose privacy settings for your device", then the desktop. */
    function oobePrivacy(state, p) {
        if (!onOobe(state, 'privacy')) { return fail('That screen is not open.'); }
        var pv = {};
        for (var i = 0; i < PRIVACY_KEYS.length; i++) {
            var k = PRIVACY_KEYS[i], d = SIM_DEFAULTS.privacy[k], v = own(p, k);
            if (k === 'diagnosticData') { pv[k] = v === 'Required' ? 'Required' : (v === undefined ? d : 'Optional'); }
            else { pv[k] = v === undefined ? d : v === true; }
        }
        state.os.oobe.privacy = pv;
        state.os.oobe.done = true;
        ledger(state, 'oobe-privacy', PRIVACY_KEYS.map(function (k) { return pv[k] === true || pv[k] === 'Optional' ? '1' : '0'; }).join(''));
        state.screen = 'desktop';
        autoActivateMak(state);
        return ok('', 'desktop');
    }

    /* ═══ ACTIVATION (slmgr and Settings > Activation) ═══════════════════════════════════════ */

    function normaliseKey(k) { return String(k || '').trim().toUpperCase(); }

    /* Which edition and channel a key is for: a published GVLK (KMS), the MAK printed on this WO
     * (Pro, MAK), or nothing (the retail COA decoy and anything else is not a valid key). */
    function keyEdition(state, key) {
        var eds = Object.keys(GVLK);
        for (var i = 0; i < eds.length; i++) { if (GVLK[eds[i]] === key) { return { edition: eds[i], channel: 'KMS' }; } }
        if (key && key === normaliseKey(state.wo.mak)) { return { edition: 'Pro', channel: 'MAK' }; }
        return null;
    }

    /* Can this PC resolve Meridian names? Only through Meridian's DNS servers (the domain DCs). */
    function resolvesMeridian(state) {
        var dns = state.network.adapters.Ethernet.dns || [];
        var meridian = state.wo.join.type === 'domain' ? state.wo.network.dns : [];
        return dns.some(function (d) { return meridian.indexOf(d) >= 0; });
    }

    function onDesktop(state) { return state.screen === 'desktop' && state.os && state.os.oobe.done; }

    /* slmgr /ipk <key> (also Settings > Activation > Change product key). */
    function slmgrIpk(state, keyRaw) {
        if (!onDesktop(state)) { return fail('Windows is not running.'); }
        var key = normaliseKey(keyRaw);
        var ed = keyEdition(state, key);
        if (!ed) { ledger(state, 'slmgr-ipk-bad', ''); return fail(MSG.slInvalid); }
        if (ed.edition !== state.os.edition) { ledger(state, 'slmgr-ipk-bad', 'edition'); return fail(MSG.slEdition); }
        var a = state.os.activation;
        a.key = key; a.channel = ed.channel; a.status = 'Notification';
        ledger(state, 'slmgr-ipk', ed.channel);
        return ok('Installed product key ' + key.slice(0, 5) + '-XXXXX-XXXXX-XXXXX-' + key.slice(-5) + ' successfully.');
    }

    /* slmgr /skms <host[:port]>. */
    function slmgrSkms(state, host) {
        if (!onDesktop(state)) { return fail('Windows is not running.'); }
        var h = String(host || '').trim();
        if (!h || h.length > 255) { return fail('Error: 0xC004F025 Access denied: the requested action requires elevated privileges'); }
        state.os.activation.kmsHost = h.toLowerCase().replace(/:1688$/, '');
        ledger(state, 'slmgr-skms', '');
        return ok('Key Management Service machine name set to ' + h + ' successfully.');
    }

    /* slmgr /ato: activate with the installed key. KMS needs a reachable KMS host: by IP from any
     * routed address, by FQDN or by DNS auto-discovery only through Meridian DNS. */
    function slmgrAto(state) {
        if (!onDesktop(state)) { return fail('Windows is not running.'); }
        var a = state.os.activation;
        /* A failed retry never un-licenses a PC: a KMS activation holds its 180-day lease and a MAK
         * activation is permanent (Nancy D2). Only /ipk of a new key resets the status. */
        var keep = function (msg) { if (a.status !== 'Licensed') { a.status = 'Notification'; } return fail(msg); };
        ledger(state, 'slmgr-ato', a.channel);
        if (!a.key) { return keep('Error: 0xC004F035 The Software Licensing Service reported that the computer could not be activated with a Volume license product key.'); }
        if (a.channel === 'MAK') { a.status = 'Licensed'; return ok('Product activated successfully.'); }
        var kms = state.wo.network.kms;
        if (!kms) { return keep(MSG.slNoKms); }
        var reach;
        if (a.kmsHost === null) { reach = resolvesMeridian(state); }
        else if (a.kmsHost === kms.ip) { reach = true; }
        else if (a.kmsHost === kms.fqdn.toLowerCase() || a.kmsHost === kms.fqdn.split('.')[0].toLowerCase()) {
            if (!resolvesMeridian(state)) { return keep(MSG.slNoDns); }
            reach = true;
        } else { reach = false; }
        if (!reach) { return keep(MSG.slNoKms); }
        a.status = 'Licensed';
        return ok('Activating Windows(R), ' + state.os.edition + ' edition... Product activated successfully.');
    }

    /* slmgr /dlv: the status block a technician reads. */
    function slmgrDlv(state) {
        if (!onDesktop(state)) { return fail('Windows is not running.'); }
        var a = state.os.activation;
        var lines = ['Name: Windows(R), ' + state.os.edition + ' edition',
            'Description: Windows(R) Operating System, ' + (a.channel === 'KMS' ? 'VOLUME_KMSCLIENT' : a.channel === 'MAK' ? 'VOLUME_MAK' : 'RETAIL') + ' channel',
            'Partial Product Key: ' + (a.key ? a.key.slice(-5) : '3V66T'),
            'License Status: ' + (a.status === 'Licensed' ? 'Licensed' : 'Notification')];
        if (a.channel === 'KMS') { lines.push('KMS machine name from DNS: ' + (resolvesMeridian(state) && state.wo.network.kms ? state.wo.network.kms.fqdn + ':1688' : 'DNS auto-discovery: KMS name not available')); }
        if (a.kmsHost) { lines.push('Registered KMS machine name: ' + a.kmsHost + ':1688'); }
        return ok(lines.join('\n'));
    }

    /* A MAK entered at Setup activates online at first sign-in (the lab reaches Microsoft). */
    function autoActivateMak(state) {
        var a = state.os.activation;
        if (a.key && a.channel === 'MAK' && a.status !== 'Licensed') { a.status = 'Licensed'; ledger(state, 'auto-activate', 'MAK'); }
    }

    /* ═══ SETUP COMMAND PROMPT: LabConfig ═════════════════════════════════════════════════════ */

    var LABCONFIG_VALUES = freeze(['BypassTPMCheck', 'BypassSecureBootCheck', 'BypassRAMCheck', 'BypassCPUCheck']);

    /* reg add HKLM\SYSTEM\Setup\LabConfig /v <name> /t REG_DWORD /d <0|1>. Called by the shell
     * after it has canonicalised the key path. */
    function setLabConfig(state, name, value) {
        if (!onSetup(state)) { return fail('ERROR: The system was unable to find the specified registry key or value.'); }
        if (LABCONFIG_VALUES.indexOf(name) < 0) { return fail('ERROR: Invalid value name.'); }
        if (!state.setup.labConfig) { state.setup.labConfig = {}; }
        state.setup.labConfig[name] = value === 1 ? 1 : 0;
        ledger(state, 'lab-config', name + '=' + (value === 1 ? 1 : 0));
        return ok('The operation completed successfully.');
    }

    /* ═══ REBOOT ═══════════════════════════════════════════════════════════════════════════════ */

    /* Applies everything waiting for a restart (spec 2.2 reboot semantics). D2 has only the
     * pending hostname; later phases add their own entries to os.pending. */
    function applyPending(state) {
        if (!state.os) { return; }
        if (state.os.hostname.pending) { state.os.hostname.effective = state.os.hostname.pending; state.os.hostname.pending = null; }
        if (state.identity && state.identity.membership.pending) {
            var m = state.identity.membership;
            m.type = m.pending.type; m.name = m.pending.name; m.pending = null;
        }
        if (state.identity && state.identity.uac.pendingEnableLUA !== null && state.identity.uac.pendingEnableLUA !== undefined) {
            state.identity.uac.EnableLUA = state.identity.uac.pendingEnableLUA;
            state.identity.uac.pendingEnableLUA = null;
        }
        var u = state.os.updates;
        if (u && u.pendingRestart.length) {
            u.pendingRestart.forEach(function (x) { x.status = 'Installed'; u.history.push(x); state.os.revision = x.revision; });
            u.pendingRestart = [];
        }
        state.os.pending = {};
    }

    /* Start > Restart from the desktop. */
    function restart(state) {
        if (!onDesktop(state)) { return fail('Windows is not running.'); }
        ledger(state, 'restart', '');
        return boot(state);
    }

    /* ═══ READ-ONLY VIEWS ═══════════════════════════════════════════════════════════════════════ */

    /* The size in GB of the Windows (C:) partition, or null. */
    function cSizeGb(state) {
        if (!state.os) { return null; }
        var d = diskByNumber(state, state.os.installDisk), p = d && partById(d, state.os.systemPartition);
        return p ? p.mb / 1024 : null;
    }

    /* Is the archive exactly as the fabric delivered it? */
    function archiveIntact(state, manifest) {
        if (state.archiveDamage && state.archiveDamage.length) { return false; }
        var d = diskByRole(state, 'archive');
        if (!d) { return true; }  /* no VM yet: the fabric copy is untouched */
        var p = d.partitions.filter(function (x) { return x.files; })[0];
        if (!p || p.label !== 'MER-ARCHIVE') { return false; }
        if (p.files.length !== manifest.length) { return false; }
        return manifest.every(function (m) {
            return p.files.some(function (f) { return f.name === m.name && f.sha256 === m.sha256 && f.bytes === m.bytes; });
        });
    }

    module.exports = {
        SIM_DEFAULTS: SIM_DEFAULTS, ISO_LIBRARY: ISO_LIBRARY, GVLK: GVLK, BUSINESS_EDITIONS: BUSINESS_EDITIONS,
        SECURE_BOOT_TEMPLATES: SECURE_BOOT_TEMPLATES, LABCONFIG_VALUES: LABCONFIG_VALUES, PRIVACY_KEYS: PRIVACY_KEYS,
        MSG: MSG, POWER_PLANS: POWER_PLANS, EFI_MB: EFI_MB, MSR_MB: MSR_MB, RECOVERY_MB: RECOVERY_MB,
        newVm: newVm, deleteVm: deleteVm, setKeyProtector: setKeyProtector, bootFromDvd: bootFromDvd,
        PARTITION_CAP: PARTITION_CAP, MSG_PART_CAP: MSG_PART_CAP, roomFor: roomFor, setVm: setVm, startVm: startVm, stopVm: stopVm, boot: boot,
        setupLang: setupLang, setupOption: setupOption, setupKey: setupKey, setupEdition: setupEdition,
        setupRetry: setupRetry, setupEula: setupEula, setupNew: setupNew, setupDelete: setupDelete,
        setupFormat: setupFormat, setupInstall: setupInstall, setLabConfig: setLabConfig,
        oobeRegion: oobeRegion, oobeKeyboard: oobeKeyboard, oobeName: oobeName, oobeSetupType: oobeSetupType,
        oobeDomainJoinInstead: oobeDomainJoinInstead, oobeMsaNext: oobeMsaNext, oobeLimitedSetup: oobeLimitedSetup,
        bypassNro: bypassNro, oobeAccount: oobeAccount, oobePrivacy: oobePrivacy,
        slmgrIpk: slmgrIpk, slmgrSkms: slmgrSkms, slmgrAto: slmgrAto, slmgrDlv: slmgrDlv,
        restart: restart, applyPending: applyPending,
        diskByNumber: diskByNumber, diskByRole: diskByRole, partById: partById, freeMb: freeMb,
        cSizeGb: cSizeGb, archiveIntact: archiveIntact, validHostname: validHostname, defaultHostname: defaultHostname,
        ledger: ledger, event: event,
        addPartition: addPartition, damageArchive: damageArchive, hasBootPartition: hasBootPartition, usedMb: usedMb,
        onSetup: onSetup, onOobe: onOobe, onDesktop: onDesktop
    };
})();
