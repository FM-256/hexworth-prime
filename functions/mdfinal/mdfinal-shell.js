/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-shell.js — the exam consoles: host PowerShell, Setup's Shift+F10 prompt, diskpart, the
 * OOBE prompt, and the desktop console.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 2.2, R4 (shell limits),
 * 13.4 (default-deny grammar), 13.7.
 *
 * DEFAULT DENY. A line is tokenised (quotes respected, no regex on student input), checked against
 * the R4 caps, and refused outright if it uses a construct the exam does not model: script blocks,
 * subexpressions, type accelerators, invocation operators, pipelines in the P1 contexts. Then the
 * first token must name a command this context knows; everything else gets the real "not
 * recognized" text. Each command calls the same mdfinal-pc.js operation as its GUI twin.
 *
 * Contexts: 'hyperv-ps' (host), 'setup-cmd' and 'diskpart' (Setup Shift+F10), 'oobe-cmd' (OOBE
 * Shift+F10), 'ps' (desktop). D3 adds pipelines, the matcher and the OS cmdlets under the same caps.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');
    var PC = require('./mdfinal-pc.js');
    var REG = require('./mdfinal-registry.js');
    var CMD = require('./mdfinal-cmdlets.js');
    var MATCH = require('./mdfinal-match.js');

    var C = LIM.LIMITS.command;
    var LIMIT_MSG = "Command exceeded the console's limits.";
    var DENY_MSG = 'This exam console does not support that expression.';
    var SCRIPTBLOCK_MSG = 'Script blocks are disabled in this exam console.';

    /* ═══ TOKENISER AND CAPS ═══════════════════════════════════════════════════════════════════ */

    /* Splits on whitespace; a "double" or 'single' quoted run is one token with the quotes removed.
     * Returns null for an unbalanced quote. Linear, no regex. */
    function tokenise(line) {
        var out = [], cur = '', q = null, had = false;
        for (var i = 0; i < line.length; i++) {
            var ch = line[i];
            if (q === null && (ch === '"' || ch === "'")) { q = ch; had = true; continue; }
            if (q !== null && ch === q) { q = null; continue; }
            if (q === null && (ch === ' ' || ch === '\t')) {
                if (cur.length || had) { out.push(cur); cur = ''; had = false; }
                continue;
            }
            cur += ch;
        }
        if (q !== null) { return null; }
        if (cur.length || had) { out.push(cur); }
        return out;
    }

    /* The line with every quoted run blanked, so the deny rules judge syntax, not quoted text
     * (a path like "C:\Program Files (x86)" is data). */
    function skeleton(line) {
        var out = '', q = null;
        for (var i = 0; i < line.length; i++) {
            var ch = line[i];
            if (q === null && (ch === '"' || ch === "'")) { q = ch; out += ch; continue; }
            if (q !== null) { if (ch === q) { q = null; out += ch; } else { out += 'q'; } continue; }
            out += ch;
        }
        return out;
    }

    /* Splits on | outside quotes. */
    function splitPipeline(line) {
        var parts = [], cur = '', q = null;
        for (var i = 0; i < line.length; i++) {
            var ch = line[i];
            if (q === null && (ch === '"' || ch === "'")) { q = ch; }
            else if (q !== null && ch === q) { q = null; }
            if (q === null && ch === '|') { parts.push(cur); cur = ''; continue; }
            cur += ch;
        }
        parts.push(cur);
        return parts.map(function (x) { return x.trim(); });
    }

    /* Constructs the exam never models, refused before any command runs (13.4). Pipes are allowed
     * only in the desktop console; variables only as $true, $false and $null. */
    function denied(line, ctx) {
        var sk = skeleton(line);
        if (sk.indexOf('{') >= 0 || sk.indexOf('}') >= 0) { return SCRIPTBLOCK_MSG; }
        var lower = sk.toLowerCase();
        var bad = ['$(', '@(', '::', '`', ';', '&', '>', '<', '||', '(', ')', 'iex ', 'invoke-expression', 'invoke-command',
                   'invoke-item', 'add-type', 'start-job', 'start-process', 'powershell ', 'powershell.exe', 'pwsh', 'cmd /c', 'cmd.exe /c'];
        for (var i = 0; i < bad.length; i++) { if (lower.indexOf(bad[i]) >= 0) { return DENY_MSG; } }
        if (ctx !== 'ps' && lower.indexOf('|') >= 0) { return DENY_MSG; }
        for (var j = 0; j < lower.length; j++) {
            if (lower[j] === '$') {
                var rest = lower.slice(j);
                if (rest.indexOf('$true') !== 0 && rest.indexOf('$false') !== 0 && rest.indexOf('$null') !== 0) { return DENY_MSG; }
            }
        }
        if (sk.length && sk[0] === '.' && sk.length > 1 && sk[1] === ' ') { return DENY_MSG; }
        if (lower.indexOf('[') >= 0 && lower.indexOf(']') > lower.indexOf('[')) { return DENY_MSG; }
        return null;
    }

    /* Named parameters of a PowerShell-style line: -Name value, -Switch (true). Lowercased names. */
    function psArgs(tokens) {
        var a = Object.create(null);
        a._ = [];
        for (var i = 1; i < tokens.length; i++) {
            var t = tokens[i];
            if (t.length > 1 && t[0] === '-') {
                var name = t.slice(1).toLowerCase();
                /* '_' is the positional list's own slot; a parameter can never take it (Mallory N1). */
                if (name === '_' || name.indexOf('_:') === 0) { continue; }
                var colon = name.indexOf(':');
                if (colon > 0) { a[name.slice(0, colon)] = t.slice(colon + 2); continue; }
                var next = tokens[i + 1];
                if (next !== undefined && !(next.length > 1 && next[0] === '-' && isNaN(Number(next)))) { a[name] = next; i++; }
                else { a[name] = true; }
            } else { a._.push(t); }
        }
        return a;
    }

    /* PowerShell size literal (8GB, 8192MB, 1TB, or bytes) to MB, or NaN. */
    function sizeMb(v) {
        var s = String(v === undefined ? '' : v).trim().toUpperCase();
        var mult = 1 / (1024 * 1024);
        var units = [['TB', 1024 * 1024], ['GB', 1024], ['MB', 1], ['KB', 1 / 1024]];
        for (var i = 0; i < units.length; i++) {
            var u = units[i][0];
            if (s.length > u.length && s.slice(-u.length) === u) { s = s.slice(0, -u.length); mult = units[i][1]; break; }
        }
        if (!s.length) { return NaN; }
        for (var j = 0; j < s.length; j++) { var c = s.charCodeAt(j); if ((c < 48 || c > 57) && c !== 46) { return NaN; } }
        return Number(s) * mult;
    }

    /* PowerShell boolean literals and On/Off. */
    function psBool(v) {
        var s = String(v).toLowerCase();
        if (s === '$true' || s === 'on' || s === 'true' || s === '1') { return true; }
        if (s === '$false' || s === 'off' || s === 'false' || s === '0') { return false; }
        return null;
    }

    function notRecognisedPs(cmd) {
        return cmd + " : The term '" + cmd + "' is not recognized as the name of a cmdlet, function, script file, or operable program.\n" +
            'Check the spelling of the name, or if a path was included, verify that the path is correct and try again.';
    }
    function notRecognisedCmd(cmd) {
        return "'" + cmd + "' is not recognized as an internal or external command,\noperable program or batch file.";
    }

    /* ═══ HOST: Hyper-V PowerShell ═════════════════════════════════════════════════════════════ */

    function vmNameMatches(state, a) {
        var n = a.vmname || a.name || a._[0];
        return state.vm && n !== undefined && String(n).toLowerCase() === state.vm.name.toLowerCase();
    }
    function noVm(a) {
        return "Hyper-V was unable to find a virtual machine with name \"" + (a.vmname || a.name || a._[0] || '') + '".';
    }

    var HYPERV = {
        'new-vm': function (state, a) {
            var mem = sizeMb(a.memorystartupbytes);
            var gb = sizeMb(a.newvhdsizebytes) / 1024;
            if (a.newvhdpath === undefined || isNaN(gb)) { return 'New-VM : This exam lab creates the VM and a new VHDX together: use -NewVHDPath and -NewVHDSizeBytes.'; }
            var r = PC.newVm(state, {
                name: a.name, generation: a.generation === undefined ? 1 : Number(a.generation),
                memoryMB: isNaN(mem) ? 1024 : mem, dynamicMemory: false, vhdxGB: gb,
                switch: a.switchname === undefined ? 'Not Connected' : a.switchname, iso: null
            });
            return r.ok ? listVm(state) : 'New-VM : ' + r.msg;
        },
        'get-vm': function (state) { return state.vm ? listVm(state) : ''; },
        'remove-vm': function (state, a) {
            if (!vmNameMatches(state, a)) { return 'Remove-VM : ' + noVm(a); }
            var r = PC.deleteVm(state); return r.ok ? '' : 'Remove-VM : ' + r.msg;
        },
        'start-vm': function (state, a) {
            if (!vmNameMatches(state, a)) { return 'Start-VM : ' + noVm(a); }
            var r = PC.startVm(state); return r.ok ? '' : 'Start-VM : ' + r.msg;
        },
        'stop-vm': function (state, a) {
            if (!vmNameMatches(state, a)) { return 'Stop-VM : ' + noVm(a); }
            var r = PC.stopVm(state); return r.ok ? '' : 'Stop-VM : ' + r.msg;
        },
        'set-vmprocessor': function (state, a) {
            if (!vmNameMatches(state, a)) { return 'Set-VMProcessor : ' + noVm(a); }
            var r = PC.setVm(state, { vcpu: Number(a.count) }); return r.ok ? '' : 'Set-VMProcessor : ' + r.msg;
        },
        'set-vmmemory': function (state, a) {
            if (!vmNameMatches(state, a)) { return 'Set-VMMemory : ' + noVm(a); }
            var p = {};
            if (a.startupbytes !== undefined) { p.memoryMB = sizeMb(a.startupbytes); }
            if (a.dynamicmemoryenabled !== undefined) {
                var b = psBool(a.dynamicmemoryenabled);
                if (b === null) { return "Set-VMMemory : Cannot process argument transformation on parameter 'DynamicMemoryEnabled'."; }
                p.dynamicMemory = b;
            }
            var r = PC.setVm(state, p); return r.ok ? '' : 'Set-VMMemory : ' + r.msg;
        },
        'set-vmkeyprotector': function (state, a) {
            if (!vmNameMatches(state, a)) { return 'Set-VMKeyProtector : ' + noVm(a); }
            if (a.newlocalkeyprotector !== true) { return 'Set-VMKeyProtector : Use -NewLocalKeyProtector in this lab.'; }
            var r = PC.setKeyProtector(state); return r.ok ? '' : 'Set-VMKeyProtector : ' + r.msg;
        },
        'enable-vmtpm': function (state, a) {
            if (!vmNameMatches(state, a)) { return 'Enable-VMTPM : ' + noVm(a); }
            var r = PC.setVm(state, { vtpm: true, viaCmdlet: true }); return r.ok ? '' : 'Enable-VMTPM : ' + r.msg;
        },
        'disable-vmtpm': function (state, a) {
            if (!vmNameMatches(state, a)) { return 'Disable-VMTPM : ' + noVm(a); }
            var r = PC.setVm(state, { vtpm: false }); return r.ok ? '' : 'Disable-VMTPM : ' + r.msg;
        },
        'set-vmfirmware': function (state, a) {
            if (!vmNameMatches(state, a)) { return 'Set-VMFirmware : ' + noVm(a); }
            var p = {};
            if (a.enablesecureboot !== undefined) {
                var b = psBool(a.enablesecureboot);
                if (b === null) { return "Set-VMFirmware : Cannot bind parameter 'EnableSecureBoot'. Specify On or Off."; }
                p.secureBoot = b;
            }
            if (a.secureboottemplate !== undefined) { p.secureBootTemplate = String(a.secureboottemplate); }
            if (!Object.keys(p).length) { return 'Set-VMFirmware : Specify -EnableSecureBoot or -SecureBootTemplate.'; }
            var r = PC.setVm(state, p); return r.ok ? '' : 'Set-VMFirmware : ' + r.msg;
        },
        'set-vmdvddrive': function (state, a) {
            if (!vmNameMatches(state, a)) { return 'Set-VMDvdDrive : ' + noVm(a); }
            var r = PC.setVm(state, { dvdIso: isoName(a.path) }); return r.ok ? '' : 'Set-VMDvdDrive : ' + r.msg;
        },
        'add-vmdvddrive': function (state, a) {
            if (!vmNameMatches(state, a)) { return 'Add-VMDvdDrive : ' + noVm(a); }
            var r = PC.setVm(state, { dvdIso: isoName(a.path) }); return r.ok ? '' : 'Add-VMDvdDrive : ' + r.msg;
        }
    };

    /* ISO paths may be given with the library folder; the library is flat. */
    function isoName(p) {
        var s = String(p === undefined ? '' : p);
        var cut = Math.max(s.lastIndexOf('\\'), s.lastIndexOf('/'));
        return cut >= 0 ? s.slice(cut + 1) : s;
    }

    function listVm(state) {
        var vm = state.vm;
        return 'Name' + pad('', 18) + 'State   CPUUsage(%) MemoryAssigned(M) Generation\n' +
               '----' + pad('', 18) + '-----   ----------- ----------------- ----------\n' +
               pad(vm.name, 22) + pad(vm.power === 'on' ? 'Running' : 'Off', 8) + pad('0', 12) +
               pad(vm.power === 'on' ? String(vm.memoryMB) : '0', 18) + vm.generation;
    }
    function pad(s, n) { s = String(s); while (s.length < n) { s += ' '; } return s; }

    /* ═══ SETUP Shift+F10: cmd, reg, diskpart ══════════════════════════════════════════════════ */

    /* reg add <key> /v <name> /t <type> /d <data> [/f] in Setup: LabConfig only (mdfinal-registry.js). */
    function regAdd(state, tokens) {
        var flags = Object.create(null);
        for (var i = 3; i < tokens.length; i++) {
            var t = tokens[i].toLowerCase();
            if (t === '/f') { flags.f = true; continue; }
            if (t === '/v' || t === '/t' || t === '/d') { flags[t[1]] = tokens[i + 1]; i++; }
        }
        if (tokens[2] === undefined || flags.v === undefined) { return 'ERROR: Invalid syntax.\nType "REG ADD /?" for usage.'; }
        return REG.write(state, 'setup', tokens[2], flags.v, flags.t || 'REG_SZ', flags.d, true).msg;
    }

    /* The per-sitting console state: current context, diskpart selection, history, a pending prompt. */
    function shellState(state) {
        if (!state.shell) { state.shell = { context: null, dp: { disk: null, part: null }, history: [], pending: null }; }
        return state.shell;
    }

    /* diskpart partition numbers are 1-based positions on the selected disk. */
    function dpDisk(state) { var sh = shellState(state); return sh.dp.disk === null ? null : PC.diskByNumber(state, sh.dp.disk); }
    function dpPart(state) {
        var d = dpDisk(state), sh = shellState(state);
        return d && sh.dp.part !== null ? d.partitions[sh.dp.part - 1] || null : null;
    }

    var DP_NO_DISK = 'There is no disk selected.\nPlease select a disk and try again.';
    var DP_NO_PART = 'There is no partition selected.\nPlease select a partition and try again.';

    /* One diskpart command. Writes go through the same disk model Setup uses. */
    function diskpart(state, tokens) {
        var w = tokens.map(function (t) { return t.toLowerCase(); });
        var sh = shellState(state);
        var d = dpDisk(state);
        var arg = function (name) {
            for (var i = 0; i < w.length; i++) { if (w[i].indexOf(name + '=') === 0) { return tokens[i].slice(name.length + 1); } }
            return undefined;
        };
        if (w[0] === 'exit') { sh.context = 'setup-cmd'; return 'Leaving DiskPart...'; }
        if (w[0] === 'list' && w[1] === 'disk') {
            var rows = ['  Disk ###  Status         Size     Free     Dyn  Gpt', '  --------  -------------  -------  -------  ---  ---'];
            state.disks.forEach(function (x) {
                rows.push((sh.dp.disk === x.n ? '* ' : '  ') + pad('Disk ' + x.n, 10) + pad('Online', 15) + pad(x.gb + ' GB', 9) +
                    pad(Math.floor(PC.freeMb(x) / 1024) + ' GB', 9) + '     ' + (x.style === 'GPT' ? '*' : ''));
            });
            return rows.join('\n');
        }
        if (w[0] === 'select' && w[1] === 'disk') {
            var nd = PC.diskByNumber(state, Number(w[2]));
            if (!nd || w[2] === undefined || isNaN(Number(w[2]))) { return 'The disk you specified is not valid.\n\nThere is no disk selected.'; }
            sh.dp.disk = nd.n; sh.dp.part = null;
            return 'Disk ' + nd.n + ' is now the selected disk.';
        }
        if (w[0] === 'list' && w[1] === 'partition') {
            if (!d) { return DP_NO_DISK; }
            if (!d.partitions.length) { return 'There are no partitions on this disk to show.'; }
            var out = ['  Partition ###  Type              Size     Offset', '  -------------  ----------------  -------  -------'];
            d.partitions.forEach(function (p, i) {
                out.push((sh.dp.part === i + 1 ? '* ' : '  ') + pad('Partition ' + (i + 1), 15) + pad(p.type === 'EFI' ? 'System' : p.type === 'MSR' ? 'Reserved' : p.type, 18) + p.mb + ' MB');
            });
            return out.join('\n');
        }
        if (w[0] === 'select' && w[1] === 'partition') {
            if (!d) { return DP_NO_DISK; }
            var idx = Number(w[2]);
            if (!(idx >= 1 && idx <= d.partitions.length)) { return 'The partition you selected is not valid.'; }
            sh.dp.part = idx;
            return 'Partition ' + idx + ' is now the selected partition.';
        }
        if (w[0] === 'clean') {
            if (!d) { return DP_NO_DISK; }
            if (d.partitions.some(function (p) { return p.files; })) { PC.damageArchive(state, d, 'clean'); }
            d.partitions = []; d.style = null; d.nextId = 1; sh.dp.part = null;
            PC.ledger(state, 'disk-clean', 'disk' + d.n);
            return 'DiskPart succeeded in cleaning the disk.';
        }
        if (w[0] === 'convert' && (w[1] === 'gpt' || w[1] === 'mbr')) {
            if (!d) { return DP_NO_DISK; }
            if (d.partitions.length) { return 'Virtual Disk Service error:\nThe specified disk is not convertible. CDROMs and DVDs\nare examples of disks that are not convertible.'; }
            d.style = w[1].toUpperCase();
            PC.ledger(state, 'disk-convert', 'disk' + d.n + '-' + d.style);
            return 'DiskPart successfully converted the selected disk to ' + d.style + ' format.';
        }
        if (w[0] === 'create' && w[1] === 'partition') {
            if (!d) { return DP_NO_DISK; }
            var type = w[2];
            var map = { efi: 'EFI', msr: 'MSR', primary: 'Primary' };
            if (!Object.prototype.hasOwnProperty.call(map, type)) { return 'The arguments specified for this command are not valid.'; }
            if (d.style === null) { return 'Virtual Disk Service error:\nThe disk is not initialized.'; }
            if ((type === 'efi' || type === 'msr') && d.style !== 'GPT') { return 'Virtual Disk Service error:\nThe operation is not supported on a non-GPT disk.'; }
            var sz = arg('size');
            var free = PC.freeMb(d);
            var mb = sz === undefined ? free : Number(sz);
            if (!(mb >= 1) || Math.floor(mb) !== mb) { return 'The arguments specified for this command are not valid.'; }
            if (mb > free) { return 'Virtual Disk Service error:\nThere is not enough usable space for this operation.'; }
            if (!PC.roomFor(d, 1)) { return PC.MSG_PART_CAP; }
            PC.addPartition(d, map[type], mb, type === 'primary' ? { explicit: true } : null);
            sh.dp.part = d.partitions.length;
            PC.ledger(state, 'part-create', 'disk' + d.n);
            return 'DiskPart succeeded in creating the specified partition.';
        }
        if (w[0] === 'delete' && w[1] === 'partition') {
            var p = dpPart(state);
            if (!p) { return DP_NO_PART; }
            if ((p.type === 'EFI' || p.type === 'MSR' || p.type === 'Recovery') && w[2] !== 'override') {
                return 'Virtual Disk Service error:\nCannot delete a protected partition without the force protected parameter set.';
            }
            if (p.files) { PC.damageArchive(state, d, 'deleted'); }
            d.partitions.splice(d.partitions.indexOf(p), 1); sh.dp.part = null;
            PC.ledger(state, 'part-delete', 'disk' + d.n);
            return 'DiskPart successfully deleted the selected partition.';
        }
        if (w[0] === 'format') {
            var fp = dpPart(state);
            if (!fp) { return 'There is no volume selected.\nPlease select a volume and try again.'; }
            var fs = String(arg('fs') || 'ntfs').toUpperCase();
            if (['NTFS', 'FAT32', 'EXFAT'].indexOf(fs) < 0) { return 'The arguments specified for this command are not valid.'; }
            if (fp.files) { delete fp.files; PC.damageArchive(state, d, 'formatted'); }
            fp.fs = fs; var lbl = arg('label'); fp.label = lbl === undefined ? null : String(lbl).slice(0, 32);
            PC.ledger(state, 'part-format', 'disk' + d.n);
            return '  100 percent completed\n\nDiskPart successfully formatted the volume.';
        }
        if (w[0] === 'assign') {
            var ap = dpPart(state);
            if (!ap) { return 'There is no volume selected.\nPlease select a volume and try again.'; }
            var letter = String(arg('letter') || '').toUpperCase();
            if (letter.length !== 1 || letter < 'C' || letter > 'Z') { return 'The arguments specified for this command are not valid.'; }
            var taken = state.disks.some(function (x) { return x.partitions.some(function (q) { return q !== ap && q.letter === letter; }); });
            if (taken) { return 'Virtual Disk Service error:\nThe specified drive letter is not free to be assigned.'; }
            ap.letter = letter;
            return 'DiskPart successfully assigned the drive letter or mount point.';
        }
        if (w[0] === 'list' && w[1] === 'volume') {
            var v = ['  Volume ###  Ltr  Label        Fs     Type        Size', '  ----------  ---  -----------  -----  ----------  -------'], n = 0;
            state.disks.forEach(function (x) {
                x.partitions.forEach(function (q) {
                    if (q.type === 'MSR') { return; }
                    v.push('  ' + pad('Volume ' + (n++), 12) + pad(q.letter || '', 5) + pad(q.label || '', 13) + pad(q.fs || 'RAW', 7) + pad('Partition', 12) + q.mb + ' MB');
                });
            });
            return v.join('\n');
        }
        return 'The arguments specified for this command are not valid.\nFor more information on the command type: HELP';
    }

    var SETUP_CMD = {
        'reg': function (state, t) {
            if (!t[1] || t[1].toLowerCase() !== 'add') { return 'ERROR: Invalid syntax. This exam console supports REG ADD.'; }
            return regAdd(state, t);
        },
        'diskpart': function (state) {
            /* Every diskpart session starts with nothing selected (Mallory D3 F4). */
            var sh = shellState(state);
            sh.context = 'diskpart'; sh.dp = { disk: null, part: null };
            return 'Microsoft DiskPart version 10.0.26100.1\n\nCopyright (C) Microsoft Corporation.\nOn computer: MININT-' + state.meta.studentId.length + 'LAB';
        },
        'exit': function (state) { shellState(state).context = null; return ''; },
        'wpeutil': function () { return 'This exam console does not run wpeutil.'; }
    };

    var OOBE_CMD = {
        'oobe\\bypassnro': function (state) { var r = PC.bypassNro(state); return r.msg; },
        'exit': function (state) { shellState(state).context = null; return ''; }
    };

    /* ═══ DESKTOP: slmgr, winver, hostname, restart ═══════════════════════════════════════════ */

    var DESKTOP = {
        'slmgr': slmgr, 'slmgr.vbs': slmgr,
        'cscript': function (state, t) {
            if (t[1] && t[1].toLowerCase().indexOf('slmgr.vbs') >= 0) { return slmgr(state, t.slice(1)); }
            return 'Input Error: Can not find script file "' + (t[1] || '') + '".';
        },
        'winver': function (state) {
            var os = state.os;
            return 'Microsoft ' + os.os + '\nVersion ' + os.version + ' (OS Build ' + os.build + '.' + os.revision + ')\n' + os.os + ' ' + os.edition;
        },
        'hostname': function (state) { return state.os.hostname.effective; },
        'restart-computer': function (state) { var r = PC.restart(state); return r.ok ? '' : r.msg; },
        'shutdown': function (state, t) {
            var w = t.map(function (x) { return x.toLowerCase(); });
            if (w.indexOf('/r') >= 0) { var r = PC.restart(state); return r.ok ? '' : r.msg; }
            return 'This exam console supports shutdown /r.';
        }
    };

    function slmgr(state, t) {
        var op = String(t[1] || '').toLowerCase();
        var r;
        if (op === '/ipk' || op === '-ipk') { r = PC.slmgrIpk(state, t[2]); }
        else if (op === '/skms' || op === '-skms') { r = PC.slmgrSkms(state, t[2]); }
        else if (op === '/ato' || op === '-ato') { r = PC.slmgrAto(state); }
        else if (op === '/dlv' || op === '-dlv' || op === '/dli' || op === '-dli') { r = PC.slmgrDlv(state); }
        else if (op === '/xpr' || op === '-xpr') {
            r = { msg: state.os.activation.status === 'Licensed'
                ? (state.os.activation.channel === 'KMS' ? 'Volume activation will expire 5/18/2027 4:00:00 PM' : 'The machine is permanently activated.')
                : 'Windows is in Notification mode' };
        }
        else { return 'Invalid combination of command parameters.\nWindows Software Licensing Management Tool\nUsage: slmgr.vbs [MachineName [User Password]] [<Option>]'; }
        return r.msg;
    }

    /* ═══ ENTRY POINT ══════════════════════════════════════════════════════════════════════════ */

    /* Which console the student is typing into now (the page passes the console it shows; the
     * server decides what that console can be on the current screen). */
    function resolveContext(state, requested) {
        var sh = shellState(state), screen = state.screen || 'hyperv';
        /* Asking for any console other than the desktop one cancels a pending desktop prompt, even
         * when that console is unavailable (Mallory N3). */
        if (sh.pending && requested !== 'ps') { sh.pending = null; }
        if (requested === 'hyperv-ps') { return 'hyperv-ps'; }
        if (requested === 'setup-cmd' && screen === 'setup') { return sh.context === 'diskpart' ? 'diskpart' : 'setup-cmd'; }
        if (requested === 'oobe-cmd' && screen === 'oobe') { return 'oobe-cmd'; }
        if (requested === 'ps' && screen === 'desktop') { return 'ps'; }
        return null;
    }

    /* Runs one line. Returns { out, context, prompt }. Every refusal leaves the state unchanged
     * apart from the capped history entry. */
    function exec(state, requested, line) {
        var ctx = resolveContext(state, requested);
        if (!ctx) { return { out: 'That console is not available.', context: null, prompt: '' }; }
        var raw = typeof line === 'string' ? line : '';
        var sh = shellState(state);
        /* A prompt belongs to the desktop console line that raised it; any other console cancels it. */
        if (sh.pending && ctx !== 'ps') { sh.pending = null; }
        /* A console line is one line: control characters (newline, CR, NUL, ...) end it on a real
         * console, so a line carrying one is refused (Mallory N2). */
        for (var ci = 0; ci < raw.length; ci++) {
            var cc = raw.charCodeAt(ci);
            if ((cc < 32 && cc !== 9) || cc === 127) { return result(state, ctx, DENY_MSG, '', 'refused'); }
        }
        if (sh.pending && ctx === 'ps') {
            /* The answer to a prompt (a password): never tokenised, never kept in history. */
            var pending = sh.pending; sh.pending = null;
            if (raw.length > 127) { return result(state, ctx, LIMIT_MSG, '', 'refused'); }
            if (state.ledger.length >= LIM.LIMITS.ledger.maxEntries) { return result(state, ctx, LIM.STORAGE_MESSAGE, '', 'refused'); }
            return result(state, ctx, CMD.resume(state, pending, raw).out, '********', null);
        }
        if (raw.length > C.maxChars) { return result(state, ctx, LIMIT_MSG, raw.slice(0, 80), 'refused'); }
        var trimmed = raw.trim();
        if (!trimmed) { return result(state, ctx, '', '', null); }
        var why = denied(trimmed, ctx);
        if (why) { return result(state, ctx, why, trimmed, 'refused'); }
        var tokens = tokenise(trimmed);
        if (tokens === null) { return result(state, ctx, 'The string is missing the terminator: ".', trimmed, 'refused'); }
        if (tokens.length > C.maxTokens) { return result(state, ctx, LIMIT_MSG, trimmed, 'refused'); }
        if (state.ledger.length >= LIM.LIMITS.ledger.maxEntries) { return result(state, ctx, LIM.STORAGE_MESSAGE, trimmed, 'refused'); }
        var cmd = tokens[0].toLowerCase();
        var out;
        if (ctx === 'hyperv-ps') {
            out = Object.prototype.hasOwnProperty.call(HYPERV, cmd) ? HYPERV[cmd](state, psArgs(tokens)) : notRecognisedPs(tokens[0]);
        } else if (ctx === 'diskpart') {
            out = diskpart(state, tokens);
        } else if (ctx === 'setup-cmd') {
            out = Object.prototype.hasOwnProperty.call(SETUP_CMD, cmd) ? SETUP_CMD[cmd](state, tokens) : notRecognisedCmd(tokens[0]);
        } else if (ctx === 'oobe-cmd') {
            out = Object.prototype.hasOwnProperty.call(OOBE_CMD, cmd) ? OOBE_CMD[cmd](state, tokens) : notRecognisedCmd(tokens[0]);
        } else {
            var segs = splitPipeline(trimmed);
            if (segs.length > C.maxPipelineStages) { return result(state, ctx, LIMIT_MSG, trimmed, 'refused'); }
            var stages = segs.map(tokenise);
            if (stages.some(function (st) { return !st || !st.length; })) { return result(state, ctx, 'An empty pipe element is not allowed.', trimmed, 'refused'); }
            var r = CMD.run(state, stages, MATCH.budget(), DESKTOP);
            if (r.pending) { sh.pending = r.pending; }
            out = r.out;
            if (out === CMD.LIMIT_MSG || out === CMD.DENY_MSG) { return result(state, ctx, out, trimmed, 'refused'); }
        }
        return result(state, resolveContext(state, requested) || ctx, out, trimmed, null);
    }

    /* `net user <name> <password> /add` and `net user <name> <password>`: the password token, masked. */
    function maskSecrets(line) {
        var t = tokenise(line);
        if (!t || !t.length) { return line; }
        var secrets = [];
        var cmd = t[0].toLowerCase().replace('.exe', '');
        /* net user <name> [password] [flags...]: every non-flag token after the name (Mallory N4) */
        if (cmd === 'net' && t[1] && t[1].toLowerCase() === 'user') {
            for (var i = 3; i < t.length; i++) { if (t[i][0] !== '/' && t[i] !== '*') { secrets.push(t[i]); } }
        }
        /* -Password <value> on any command */
        for (var j = 1; j < t.length - 1; j++) { if (t[j].toLowerCase() === '-password') { secrets.push(t[j + 1]); } }
        var out = line;
        secrets.filter(function (x) { return x.length; }).forEach(function (x) { out = out.split(x).join('********'); });
        return out;
    }

    /* At most maxOutputLines lines of output, then a marker (R4). */
    function truncate(out) {
        var lines = String(out).split('\n');
        if (lines.length > C.maxOutputLines) { return lines.slice(0, C.maxOutputLines).join('\n') + '\n... (output truncated)'; }
        return String(out);
    }

    /* Records the line in the capped history and builds the reply. */
    function result(state, ctx, out, line, kind) {
        var sh = shellState(state);
        if (line) {
            sh.history.push(maskSecrets(line).slice(0, 200));
            if (sh.history.length > C.historyKept) { sh.history.splice(0, sh.history.length - C.historyKept); }
        }
        if (kind === 'refused') { PC.event(state, 'refused', line.slice(0, 80)); }
        out = truncate(out);
        var prompt = ctx === 'hyperv-ps' ? 'PS C:\\Users\\LabAdmin> ' : ctx === 'diskpart' ? 'DISKPART> ' :
            ctx === 'ps' ? 'PS C:\\Windows\\system32> ' : 'X:\\Sources>';
        return { out: out, context: ctx, prompt: prompt };
    }

    module.exports = { exec: exec, truncate: truncate, maskSecrets: maskSecrets, tokenise: tokenise, denied: denied, skeleton: skeleton, splitPipeline: splitPipeline, sizeMb: sizeMb,
                       LIMIT_MSG: LIMIT_MSG, DENY_MSG: DENY_MSG, SCRIPTBLOCK_MSG: SCRIPTBLOCK_MSG };
})();
