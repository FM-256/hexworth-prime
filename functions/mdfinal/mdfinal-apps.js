/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-apps.js — P6: applications (MSI and Store apps), Windows Update policy and active hours,
 * startup apps, and the paging file.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, rows 6.1-6.3, the P6
 * keep-list penalty (3.4), 2.2 (deferral routes, reboot semantics), 13.12.
 *
 * Same contract as mdfinal-os.js. State is created at Windows' defaults on first use. Windows Update
 * deferrals live in ONE model, `os.policies.wu`, written by the registry route and by gpedit alike,
 * so the two routes cannot disagree; a days value without its enabling DWORD is not effective.
 *
 * REAL BEHAVIOUR KEPT: the x86 MSI installs on x64 Windows; a second install of an installed
 * product fails with 1638; Remove-AppxPackage removes for the current user only, so the package
 * returns for new users until it is deprovisioned; active hours span at most 18 hours; paging-file
 * changes take effect at the next restart.
 * DECLARED: the LedgerSync MSIs sit at fixed lab paths; winget is offline; the paging file is
 * configured through System Properties or the PagingFiles registry value (no WMI cmdlets).
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');
    var PC = require('./mdfinal-pc.js');
    var freeze = LIM.deepFreeze;

    var NOT_RUNNING = 'Windows is not running.';
    function ok(msg) { return { ok: true, msg: msg || '' }; }
    function fail(msg) { return { ok: false, msg: msg }; }

    var MSIS = freeze({
        'C:\\LABFILES\\LEDGERSYNC_2.4_X64.MSI': { file: 'C:\\LabFiles\\LedgerSync_2.4_x64.msi', product: 'LedgerSync', version: '2.4.0', arch: 'x64' },
        'C:\\LABFILES\\LEDGERSYNC_2.4_X86.MSI': { file: 'C:\\LabFiles\\LedgerSync_2.4_x86.msi', product: 'LedgerSync', version: '2.4.0', arch: 'x86' }
    });

    var PUBLISHER = '8wekyb3d8bbwe';
    /* Store apps on a fresh 24H2 image; three are on the keep-list (removing one is the P6 penalty). */
    var BASE_APPX = freeze([
        { name: 'Microsoft.WindowsCalculator', display: 'Calculator', version: '11.2405.2.0', keep: true },
        { name: 'Microsoft.WindowsStore', display: 'Microsoft Store', version: '22405.1401.0.0', keep: true },
        { name: 'Microsoft.WindowsNotepad', display: 'Notepad', version: '11.2402.22.0', keep: true },
        { name: 'Microsoft.BingWeather', display: 'Weather', version: '4.53.52331.0', keep: false },
        { name: 'Microsoft.GetHelp', display: 'Get Help', version: '10.2302.10601.0', keep: false }
    ]);
    var CONSUMER_VERSION = '4.55.62231.0';
    var KEEP_STARTUP = 'SecurityHealth';

    /* The P6 state, created on first use from the work order's seeded apps. */
    function apps(state) {
        if (!state.apps) {
            var wo = state.wo;
            var list = BASE_APPX.map(function (a) { return { name: a.name, display: a.display, version: a.version, keep: a.keep, user: true, provisioned: true }; });
            if (!list.some(function (a) { return a.name === wo.consumerApp; })) {
                list.push({ name: wo.consumerApp, display: wo.consumerApp.split('.').slice(-1)[0], version: CONSUMER_VERSION, keep: false, user: true, provisioned: true });
            }
            var startup = wo.performance.startupCandidates.map(function (n) {
                return { name: n, impact: wo.performance.highImpact.indexOf(n) >= 0 ? 'High' : 'Low', enabled: true, keep: false, runValue: true };
            });
            startup.push({ name: KEEP_STARTUP, impact: 'Low', enabled: true, keep: true, runValue: true });
            state.apps = { appx: list, msi: [], startup: startup,
                           pagefile: { automatic: true, drive: null, initialMB: null, maxMB: null, pending: null } };
        }
        return state.apps;
    }

    /* ═══ MSI ══════════════════════════════════════════════════════════════════════════════════ */

    /* PROPERTY=value tokens, names case-insensitive (Windows Installer public properties). */
    function msiProps(list) {
        var out = Object.create(null);
        (list || []).forEach(function (t) {
            var i = String(t).indexOf('=');
            if (i > 0) { var k = t.slice(0, i).toUpperCase(); if (/^[A-Z][A-Z0-9_]{0,31}$/.test(k)) { out[k] = t.slice(i + 1); } }
        });
        return out;
    }

    /* msiexec /i <path> [/qn] [PROP=value ...], the Apps installer wizard (server and port pages). */
    function installMsi(state, path, props) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var a = apps(state);
        var m = MSIS[String(path || '').trim().toUpperCase()];
        if (!m) { return fail('This installation package could not be opened. Verify that the package exists and that you can access it.'); }
        if (a.msi.some(function (x) { return x.product === m.product; })) { return fail('Another version of this product is already installed. (1638)'); }
        a.msi.push({ product: m.product, version: m.version, arch: m.arch, server: props.SERVER === undefined ? null : String(props.SERVER).slice(0, 255),
                     port: props.PORT === undefined ? null : String(props.PORT).slice(0, 8) });
        PC.ledger(state, 'msi-install', m.arch);
        return ok('');
    }

    /* msiexec /x <path|product>, Settings > Apps > Uninstall. */
    function uninstallMsi(state, ref) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var a = apps(state), r = String(ref || '').trim().toUpperCase();
        var m = MSIS[r];
        var name = m ? m.product : r;
        var i = -1;
        a.msi.forEach(function (x, j) { if (x.product.toUpperCase() === name.toUpperCase()) { i = j; } });
        if (i < 0) { return fail('This action is only valid for products that are currently installed. (1605)'); }
        a.msi.splice(i, 1);
        PC.ledger(state, 'msi-uninstall', '');
        return ok('');
    }

    /* ═══ STORE APPS ═══════════════════════════════════════════════════════════════════════════ */

    function fullName(a) { return a.name + '_' + a.version + '_x64__' + PUBLISHER; }

    /* Rows as Get-AppxPackage shows them (installed for the current user). */
    function appxRows(state) {
        return apps(state).appx.filter(function (a) { return a.user; }).map(function (a) {
            return { Name: a.name, PackageFullName: fullName(a), Version: a.version, Architecture: 'X64', Publisher: 'CN=Microsoft Corporation' };
        });
    }
    /* Rows as Get-AppxProvisionedPackage -Online shows them. */
    function provisionedRows(state) {
        return apps(state).appx.filter(function (a) { return a.provisioned; }).map(function (a) {
            return { DisplayName: a.name, PackageName: fullName(a), Version: a.version, Architecture: 'x64' };
        });
    }

    /* Finds an app by its name or full package name (case-insensitive). */
    function appBy(state, ref) {
        var r = String(ref || '').trim().toLowerCase();
        return apps(state).appx.filter(function (a) { return a.name.toLowerCase() === r || fullName(a).toLowerCase() === r; })[0] || null;
    }

    /* Remove-AppxPackage, Settings > Apps > Uninstall: the current user only. */
    function removeForUser(state, ref) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var a = appBy(state, ref);
        if (!a || !a.user) { return fail('Remove-AppxPackage : Deployment failed with HRESULT: 0x80073CF1, Package was not found.'); }
        a.user = false;
        PC.ledger(state, a.keep ? 'appx-remove-keep' : 'appx-remove', '');
        return ok('');
    }

    /* Remove-AppxProvisionedPackage -Online: new users no longer get it. */
    function deprovision(state, ref) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var a = appBy(state, ref);
        if (!a || !a.provisioned) { return fail('Remove-AppxProvisionedPackage : The system cannot find the file specified.'); }
        a.provisioned = false;
        PC.ledger(state, a.keep ? 'appx-deprov-keep' : 'appx-deprov', '');
        return ok('');
    }

    /* ═══ WINDOWS UPDATE POLICY (gpedit route; the registry route writes the same model) ═════════ */

    function wu(state) { var p = state.os.policies; if (!p.wu) { p.wu = {}; } return p.wu; }

    /* gpedit > Windows Update > Manage updates offered from Windows Update > "Select when Preview Builds
     * and Feature Updates are received" / "Select when Quality Updates are received": Enabled + days,
     * or Disabled / Not Configured. */
    function gpeditDeferral(state, kind, enabled, days) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var w = wu(state), on = kind === 'feature' ? 'DeferFeatureUpdates' : 'DeferQualityUpdates', d = on + 'PeriodInDays';
        var max = kind === 'feature' ? 365 : 30;
        if (enabled === true) {
            var n = Number(days);
            if (!(n >= 0 && n <= max) || Math.floor(n) !== n) { return fail('The value must be between 0 and ' + max + ' days.'); }
            w[on] = 1; w[d] = n;
        } else { delete w[on]; delete w[d]; }
        PC.ledger(state, 'gpedit-wu', kind);
        return ok('');
    }

    /* Settings > Windows Update > Advanced options > Active hours: Manually, start and end hour. */
    function setActiveHours(state, start, end) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var s = Number(start), e = Number(end);
        if (!(s >= 0 && s <= 23 && e >= 0 && e <= 23) || Math.floor(s) !== s || Math.floor(e) !== e) { return fail('Choose a start and an end time.'); }
        var span = (e - s + 24) % 24;
        if (span === 0 || span > 18) { return fail('Active hours can be no longer than 18 hours.'); }
        var ah = state.os.updates.activeHours;
        ah.manual = true; ah.start = s; ah.end = e;
        PC.ledger(state, 'active-hours', 'gui');
        return ok('');
    }

    /* ═══ STARTUP APPS ═════════════════════════════════════════════════════════════════════════ */

    /* Task Manager > Startup apps, Settings > Apps > Startup: enable or disable one entry. */
    function setStartup(state, name, enabled) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var n = String(name || '').toLowerCase();
        var e = apps(state).startup.filter(function (x) { return x.name.toLowerCase() === n && x.runValue; })[0];
        if (!e) { return fail('The startup app was not found.'); }
        e.enabled = enabled === true;
        PC.ledger(state, e.keep ? 'startup-keep' : 'startup', enabled ? 'on' : 'off');
        return ok('');
    }

    /* reg delete of a Run value: the app no longer starts (counts as disabled). */
    function deleteRunValue(state, name) {
        var n = String(name || '').toLowerCase();
        var e = apps(state).startup.filter(function (x) { return x.name.toLowerCase() === n && x.runValue; })[0];
        if (!e) { return null; }
        e.runValue = false; e.enabled = false;
        PC.ledger(state, e.keep ? 'startup-keep' : 'startup', 'deleted');
        return ok('The operation completed successfully.');
    }

    /* ═══ PAGING FILE ══════════════════════════════════════════════════════════════════════════ */

    /* System Properties > Advanced > Performance > Advanced > Virtual memory > Change, Set. Takes effect at restart. */
    function setPagefile(state, p) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var pf = apps(state).pagefile;
        if (p.automatic === true) { pf.pending = { automatic: true }; PC.ledger(state, 'pagefile', 'auto'); return ok('You must restart your computer to apply these changes.'); }
        var d = String(p.drive || 'C').toUpperCase().replace(':', '');
        if (d !== 'C') { return fail('This exam lab configures the paging file on C: only.'); }
        var i = Number(p.initialMB), m = Number(p.maxMB);
        if (!(i >= 16 && m >= i && m <= 65536) || Math.floor(i) !== i || Math.floor(m) !== m) {
            return fail('Enter a maximum size that is larger than or equal to the initial size, and less than 65536 MB.');
        }
        pf.pending = { automatic: false, drive: 'C', initialMB: i, maxMB: m };
        PC.ledger(state, 'pagefile', 'custom');
        return ok('You must restart your computer to apply these changes.');
    }

    /* The registry route: PagingFiles REG_MULTI_SZ "C:\pagefile.sys <initial> <max>" or "?:\pagefile.sys". */
    function pagingFilesValue(state, data) {
        var s = String(data || '').trim();
        if (s.toLowerCase() === '?:\\pagefile.sys') { return setPagefile(state, { automatic: true }); }
        var parts = s.split(' ').filter(function (x) { return x.length; });
        if (parts.length !== 3 || parts[0].toLowerCase() !== 'c:\\pagefile.sys') { return null; }
        return setPagefile(state, { drive: 'C', initialMB: Number(parts[1]), maxMB: Number(parts[2]) });
    }

    module.exports = {
        MSIS: MSIS, BASE_APPX: BASE_APPX, KEEP_STARTUP: KEEP_STARTUP,
        apps: apps, msiProps: msiProps, installMsi: installMsi, uninstallMsi: uninstallMsi,
        appxRows: appxRows, provisionedRows: provisionedRows, fullName: fullName, appBy: appBy,
        removeForUser: removeForUser, deprovision: deprovision,
        gpeditDeferral: gpeditDeferral, setActiveHours: setActiveHours,
        setStartup: setStartup, deleteRunValue: deleteRunValue,
        setPagefile: setPagefile, pagingFilesValue: pagingFilesValue
    };
})();
