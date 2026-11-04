/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-winre.js — Windows Recovery Environment: the menu, the BitLocker key prompt, Startup
 * Repair, Startup Settings (Safe Mode), Uninstall Updates, System Restore, Reset this PC, and the
 * WinRE Command Prompt (bcdedit, bootrec, manage-bde -unlock, reg load of the offline SYSTEM hive,
 * dism /image, sfc offline).
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 4.1 (V1 routes and wrong
 * fixes), 4.3 (restore scope), 4.4 (which tools need the recovery key), 13.12.
 *
 * KEY RULE (4.4): when C: is protected (BitLocker on), Command Prompt access to C:, Uninstall
 * Updates and System Restore need the recovery key; Startup Repair and Startup Settings do not.
 * "Skip this drive" leaves C: locked. Every variant's canonical repair needs no key.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var PC = require('./mdfinal-pc.js');
    var SYS = require('./mdfinal-sys.js');

    function ok(msg) { return { ok: true, msg: msg || '' }; }
    function fail(msg) { return { ok: false, msg: msg }; }
    var NOT_HERE = 'That option is not available.';

    function onWinre(state) { return state.screen === 'winre'; }
    /* WinRE session flags (reset at every boot). */
    function re(state) { var s = SYS.sys(state); if (!s.winre) { s.winre = { unlocked: false, skipped: false, offlineHive: false }; } return s.winre; }

    /* True when C: is BitLocker-protected (protection on), so offline tools need the key. */
    function protectedC(state) { return !!(state.bitlocker && state.bitlocker.C.status === 'on'); }

    /* The prompt WinRE shows: the first 8 hex of the recovery-password protector id. */
    function keyPrompt(state) {
        var rp = (state.bitlocker.C.protectors || []).filter(function (p) { return p.type === 'RecoveryPassword'; })[0];
        return 'Enter the recovery key for this drive. Recovery key ID: ' + (rp ? rp.id.slice(0, 8) : 'not available (no recovery password protector)');
    }

    /* Entering WinRE (from a failed boot or Shift+Restart): a fresh session. */
    function enter(state) {
        var s = SYS.sys(state);
        s.winre = { unlocked: false, skipped: false, offlineHive: false };
        state.screen = 'winre';
        PC.ledger(state, 'winre-view', '');
        return ok('Automatic Repair: Your PC did not start correctly. Press "Restart" to restart your PC, or "Advanced options" to try other options to repair your PC.');
    }

    /* Advanced options > Continue / Restart: a normal boot attempt. */
    function cont(state) {
        if (!onWinre(state)) { return fail(NOT_HERE); }
        return PC.boot(state);
    }

    /* Troubleshoot > Advanced options > Startup Repair: diagnoses, cannot fix a third-party boot driver. */
    function startupRepair(state) {
        if (!onWinre(state)) { return fail(NOT_HERE); }
        PC.ledger(state, 'startup-repair', '');
        return ok("Startup Repair couldn't repair your PC. Log file: C:\\Windows\\System32\\Logfiles\\Srt\\SrtTrail.txt");
    }

    /* Startup Settings > Restart > 4/5/6: the next boot only is Safe Mode (no key: the TPM unlocks). */
    function startupSettings(state, option) {
        if (!onWinre(state)) { return fail(NOT_HERE); }
        var o = Number(option);
        if (o !== 4 && o !== 5 && o !== 6) { return fail('Press a number to choose from the options below.'); }
        SYS.sys(state).nextBootSafe = true;
        PC.ledger(state, 'startup-settings', String(o));
        return PC.boot(state);
    }

    /* "Enter the recovery key": any current recovery password, dashes optional. */
    function unlock(state, raw) {
        if (!onWinre(state)) { return fail(NOT_HERE); }
        if (!protectedC(state)) { return ok(''); }
        var digits = String(raw || '').split('').filter(function (c) { return c >= '0' && c <= '9'; }).join('');
        var match = digits.length === 48 && state.bitlocker.C.protectors.some(function (p) {
            return p.type === 'RecoveryPassword' && p.password.split('-').join('') === digits;
        });
        if (!match) { PC.ledger(state, 'winre-key-bad', ''); return fail('That key is not correct. Check it and try again.'); }
        re(state).unlocked = true;
        PC.ledger(state, 'winre-unlock', '');
        return ok('');
    }

    /* "Skip this drive": the tool continues with C: locked. */
    function skip(state) { if (!onWinre(state)) { return fail(NOT_HERE); } re(state).skipped = true; return ok(''); }

    /* Key gate for the tools that need it. */
    function needKey(state) { return protectedC(state) && !re(state).unlocked ? fail(keyPrompt(state)) : null; }

    /* Uninstall Updates > Uninstall latest quality update: removes the most recently installed update. */
    function uninstallLatest(state) {
        if (!onWinre(state)) { return fail(NOT_HERE); }
        var k = needKey(state); if (k) { return k; }
        var h = state.os.updates.history;
        if (!h.length) { return fail('There are no updates to uninstall.'); }
        var last = h.pop();
        PC.ledger(state, 'hotfix-uninstall', last.fault ? 'fault' : 'other');
        return ok('You have successfully uninstalled the latest quality update.');
    }

    /* System Restore from WinRE (needs the key when C: is protected). */
    function restore(state, seq) {
        if (!onWinre(state)) { return fail(NOT_HERE); }
        var k = needKey(state); if (k) { return k; }
        if (!SYS.sys(state).restorePoints.length) { return fail('No restore points have been created on your computer\'s system drive.'); }
        return SYS.restoreTo(state, seq);
    }

    /* Reset this PC: a working PC, and 7.1 scores 0 (spec 4). Needs the key or "Remove everything". */
    function resetPc(state, mode) {
        if (!onWinre(state)) { return fail(NOT_HERE); }
        if (mode !== 'remove' && needKey(state)) { return needKey(state); }
        var s = SYS.sys(state);
        s.reset = true;
        s.drivers = s.drivers.filter(function (d) { return !d.fault; });
        s.upperFilters.disk = ['partmgr'];
        delete s.services.mbafilt; delete s.services.MerVpnHelper;
        s.tasks = []; s.processes = s.processes.filter(function (p) { return !p.fault; }); s.programs = []; s.hosts = []; s.safeboot = null;
        state.os.updates.history = state.os.updates.history.filter(function (x) { return !x.fault; });
        if (state.apps) { state.apps.startup = state.apps.startup.filter(function (x) { return !x.fault; }); }
        PC.ledger(state, 'reset-pc', mode === 'remove' ? 'remove' : 'keep');
        return PC.boot(state);
    }

    /* ═══ WinRE Command Prompt ═══ */

    var DISK_CLASS_KEY = 'HKLM\\OFFLINE\\CONTROLSET001\\CONTROL\\CLASS\\' + SYS.DISK_CLASS.toUpperCase();

    /* C: is reachable from the WinRE prompt (unprotected, or unlocked). */
    function cOpen(state) { return !protectedC(state) || re(state).unlocked; }

    /* One WinRE command line (tokens already split by the shell). */
    function cmd(state, t) {
        var w = t.map(function (x) { return x.toLowerCase(); });
        var s = SYS.sys(state);
        var locked = 'The drive where Windows is installed is locked. Unlock the drive and try again. (manage-bde -unlock C: -RecoveryPassword <key>)';
        if (w[0] === 'exit') { return { out: '', exit: true }; }
        if (w[0] === 'manage-bde' || w[0] === 'manage-bde.exe') {
            if (w[1] === '-status') { return { out: 'Volume C: [Windows]\n    Lock Status:          ' + (cOpen(state) ? 'Unlocked' : 'Locked') }; }
            if (w[1] === '-unlock' && w[2] === 'c:' && (w[3] === '-recoverypassword' || w[3] === '-rp')) {
                var r = unlock(state, t[4]);
                return { out: r.ok ? 'The password successfully unlocked volume C:.' : 'ERROR: The recovery password is incorrect.' };
            }
            return { out: 'ERROR: An error occurred (code 0x80070057):\nThe parameter is incorrect.' };
        }
        if (w[0] === 'bootrec' || w[0] === 'bootrec.exe') {
            PC.ledger(state, 'bootrec', (w[1] || '').replace('/', ''));
            if (w[1] === '/fixboot') { return { out: 'Access is denied.' }; }
            if (w[1] === '/rebuildbcd' || w[1] === '/scanos') { return { out: 'Scanning all disks for Windows installations.\nPlease wait, since this may take a while...\nSuccessfully scanned Windows installations.\nTotal identified Windows installations: 1\n[1]  C:\\Windows\nThe operation completed successfully.' }; }
            if (w[1] === '/fixmbr') { return { out: 'The operation completed successfully.' }; }
            return { out: 'BOOTREC [/FIXMBR | /FIXBOOT | /SCANOS | /REBUILDBCD]' };
        }
        if (w[0] === 'bcdedit' || w[0] === 'bcdedit.exe') {
            if (w.length === 1 || w[1] === '/enum') {
                return { out: 'Windows Boot Loader\n-------------------\nidentifier              {default}\ndevice                  partition=C:\npath                    \\Windows\\system32\\winload.efi\ndescription             Windows 11\n' + (s.safeboot ? 'safeboot                ' + s.safeboot + '\n' : '') };
            }
            if (w[1] === '/set' && w[2] === '{default}' && w[3] === 'safeboot') {
                if (['minimal', 'network', 'alternateshell'].indexOf(w[4]) < 0) { return { out: 'The integer data is not valid as specified.' }; }
                s.safeboot = w[4]; PC.ledger(state, 'bcd-safeboot', 'on');
                return { out: 'The operation completed successfully.' };
            }
            if (w[1] === '/deletevalue' && w[2] === '{default}' && w[3] === 'safeboot') { s.safeboot = null; PC.ledger(state, 'bcd-safeboot', 'off'); return { out: 'The operation completed successfully.' }; }
            return { out: 'The parameter is incorrect.' };
        }
        if (w[0] === 'reg' || w[0] === 'reg.exe') {
            if (w[1] === 'load' && w[2] === 'hklm\\offline' && (w[3] || '').replace(/\//g, '\\') === 'c:\\windows\\system32\\config\\system') {
                if (!cOpen(state)) { return { out: 'ERROR: ' + locked }; }
                re(state).offlineHive = true; return { out: 'The operation completed successfully.' };
            }
            if (w[1] === 'unload' && w[2] === 'hklm\\offline') { re(state).offlineHive = false; return { out: 'The operation completed successfully.' }; }
            if (!re(state).offlineHive) { return { out: 'ERROR: The system was unable to find the specified registry key or value.' }; }
            return { out: offlineReg(state, t, w) };
        }
        if (w[0] === 'dism' || w[0] === 'dism.exe') {
            var img = w.filter(function (x) { return x.indexOf('/image:') === 0; })[0];
            if (img !== '/image:c:\\' && img !== '/image:c:') { return { out: 'Error: 87\n\nThe option is unknown. Use /image:C:\\ for the offline Windows image.' }; }
            if (!cOpen(state)) { return { out: 'Error: 5\n\nAccess is denied.' }; }
            if (w.indexOf('/get-drivers') >= 0) { return { out: s.drivers.map(function (d) { return 'Published Name : ' + d.inf + '\nOriginal File Name : ' + d.original + '\nProvider Name : ' + d.provider; }).join('\n\n') + '\nThe operation completed successfully.' }; }
            var rd = w.filter(function (x) { return x.indexOf('/driver:') === 0; })[0];
            if (w.indexOf('/remove-driver') >= 0 && rd) {
                var r2 = SYS.deleteDriver(state, rd.slice(8), true);
                PC.ledger(state, 'dism-remove-driver', '');
                return { out: r2.ok ? 'Removing 1 driver package(s)...\nThe operation completed successfully.' : 'Error: 2\n\nThe system cannot find the file specified.' };
            }
            return { out: 'Error: 87\n\nThe option is unknown.' };
        }
        if (w[0] === 'sfc' || w[0] === 'sfc.exe') {
            PC.ledger(state, 'sfc', 'offline');
            return { out: cOpen(state) ? 'Beginning system scan. This process will take some time.\n\nWindows Resource Protection did not find any integrity violations.' : 'Windows Resource Protection could not perform the requested operation.' };
        }
        return { out: "'" + t[0].slice(0, 40) + "' is not recognized as an internal or external command,\noperable program or batch file." };
    }

    /* reg query/add/delete under HKLM\OFFLINE: the disk-class UpperFilters and service Start values. */
    function offlineReg(state, t, w) {
        var s = SYS.sys(state);
        var key = String(t[2] || '').toUpperCase().split('\\\\').join('\\').replace(/\\$/, '');
        var v = null, data = null, type = null;
        for (var i = 3; i < t.length; i++) {
            if (w[i] === '/v') { v = t[i + 1]; i++; } else if (w[i] === '/d') { data = t[i + 1]; i++; } else if (w[i] === '/t') { type = String(t[i + 1] || '').toUpperCase(); i++; }
        }
        if (key === DISK_CLASS_KEY && String(v).toLowerCase() === 'upperfilters') {
            if (w[1] === 'query') { return DISK_CLASS_KEY + '\n    UpperFilters    REG_MULTI_SZ    ' + s.upperFilters.disk.join('\\0'); }
            if (w[1] === 'add') {
                if (type !== 'REG_MULTI_SZ') { return 'ERROR: UpperFilters is REG_MULTI_SZ.'; }
                var list = String(data || '').split('\\0').map(function (x) { return x.trim().toLowerCase(); }).filter(function (x) { return x.length; });
                if (!list.length || list.length > 8) { return 'ERROR: Invalid syntax.'; }
                s.upperFilters.disk = list; PC.ledger(state, 'offline-reg', 'filters');
                return 'The operation completed successfully.';
            }
            if (w[1] === 'delete') { s.upperFilters.disk = []; PC.ledger(state, 'offline-reg', 'filters-deleted'); return 'The operation completed successfully.'; }
        }
        var svcPrefix = 'HKLM\\OFFLINE\\CONTROLSET001\\SERVICES\\';
        if (key.indexOf(svcPrefix) === 0 && String(v).toLowerCase() === 'start') {
            var name = key.slice(svcPrefix.length), hit = SYS.serviceBy(state, name);
            if (!hit) { return 'ERROR: The system was unable to find the specified registry key or value.'; }
            if (w[1] === 'query') { return key + '\n    Start    REG_DWORD    0x' + ({ Boot: 0, System: 1, Automatic: 2, Manual: 3, Disabled: 4 }[hit.svc.start]); }
            if (w[1] === 'add') {
                var n = Number(data);
                var names = ['Boot', 'System', 'Automatic', 'Manual', 'Disabled'];
                if (type !== 'REG_DWORD' || !(n >= 0 && n <= 4) || Math.floor(n) !== n) { return 'ERROR: Invalid syntax.'; }
                hit.svc.start = names[n]; PC.ledger(state, 'offline-reg', 'service-start');
                return 'The operation completed successfully.';
            }
        }
        return 'ERROR: The system was unable to find the specified registry key or value.';
    }

    module.exports = {
        protectedC: protectedC, keyPrompt: keyPrompt, enter: enter, cont: cont, startupRepair: startupRepair, startupSettings: startupSettings,
        unlock: unlock, skip: skip, uninstallLatest: uninstallLatest, restore: restore, resetPc: resetPc, cmd: cmd, re: re
    };
})();
