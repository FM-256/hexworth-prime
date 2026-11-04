/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-sys.js — Windows internals the P7 faults live in: services, the driver store and the disk
 * class filter list, scheduled tasks, processes, installed programs, the hosts file, the event
 * log, System Protection and restore points, and the boot flags (safe mode).
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 4.1 (variants, evidence,
 * repairs), 4.2 (protected services), 4.3 (System Restore scope), 13.12.
 *
 * Pure operations, same contract as mdfinal-os.js. The engine reads no clock: anything time-bound
 * (the Checkpoint-Computer 1440-minute throttle) takes `now` from ctx, which the callable supplies.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');
    var PC = require('./mdfinal-pc.js');
    var freeze = LIM.deepFreeze;

    var NOT_RUNNING = 'Windows is not running.';
    function ok(msg) { return { ok: true, msg: msg || '' }; }
    function fail(msg) { return { ok: false, msg: msg }; }

    var DISK_CLASS = '{4d36e967-e325-11ce-bfc1-08002be10318}';
    var PROTECTED_SERVICES = freeze(['SysMain', 'WSearch', 'WinDefend', 'wuauserv', 'BITS', 'TermService', 'LanmanServer', 'mpssvc', 'Dnscache']);
    var BASE_SERVICES = freeze({
        SysMain: ['SysMain', 'Automatic', 'Running'], WSearch: ['Windows Search', 'Automatic', 'Running'],
        WinDefend: ['Microsoft Defender Antivirus Service', 'Automatic', 'Running'], wuauserv: ['Windows Update', 'Manual', 'Running'],
        BITS: ['Background Intelligent Transfer Service', 'Manual', 'Stopped'], TermService: ['Remote Desktop Services', 'Manual', 'Stopped'],
        LanmanServer: ['Server', 'Automatic', 'Running'], mpssvc: ['Windows Defender Firewall', 'Automatic', 'Running'],
        Dnscache: ['DNS Client', 'Automatic', 'Running'], Spooler: ['Print Spooler', 'Automatic', 'Running']
    });
    var BASE_PROCESSES = freeze([
        ['System', 0.1, 4], ['svchost', 0.4, 60], ['explorer', 0.6, 95], ['MsMpEng', 0.8, 180], ['SearchHost', 0.2, 70], ['dwm', 0.5, 80]
    ]);
    var CHECKPOINT_THROTTLE_MS = 1440 * 60 * 1000;
    var RESTORE_CAP = 8;

    /* The internals, created at their Windows defaults on first use. */
    function sys(state) {
        if (!state.sys) {
            var svc = {};
            Object.keys(BASE_SERVICES).forEach(function (k) {
                var b = BASE_SERVICES[k];
                svc[k] = { display: b[0], start: b[1], status: b[2], fault: false };
            });
            state.sys = {
                services: svc,
                drivers: [],
                upperFilters: { disk: ['partmgr'] },
                tasks: [],
                processes: BASE_PROCESSES.map(function (p) { return { name: p[0], cpu: p[1], wsMB: p[2] }; }),
                programs: [],
                hosts: [],
                eventlog: [],
                protection: { C: false },
                restorePoints: [],
                lastCheckpointAt: null,
                safeboot: null,
                nextBootSafe: false,
                safeMode: false,
                explorer: 'ok',
                unlocked: {},
                reset: false
            };
        }
        return state.sys;
    }

    /* ═══ EVENT LOG ═══ */
    /* Appends one Event Viewer entry (capped at 200, oldest dropped). */
    function logEvent(state, log, id, source, level, msg) {
        var s = sys(state);
        s.eventlog.push({ log: log, id: id, source: source, level: level, msg: String(msg).slice(0, 300) });
        if (s.eventlog.length > 200) { s.eventlog.splice(0, s.eventlog.length - 200); }
    }

    /* ═══ SERVICES ═══ */
    /* A service by its name or display name (case-insensitive), with its key. */
    function serviceBy(state, raw) {
        var s = sys(state), n = String(raw || '').trim().toLowerCase();
        var k = Object.keys(s.services).filter(function (x) { return x.toLowerCase() === n || s.services[x].display.toLowerCase() === n; })[0];
        return k ? { key: k, svc: s.services[k] } : null;
    }
    /* services.msc > Properties > Startup type, Set-Service -StartupType, sc config start=. */
    function setStartType(state, name, type) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var hit = serviceBy(state, name);
        if (!hit) { return fail('Cannot find any service with service name \'' + String(name).slice(0, 64) + '\'.'); }
        var t = String(type || '').toLowerCase();
        var map = { automatic: 'Automatic', auto: 'Automatic', manual: 'Manual', demand: 'Manual', disabled: 'Disabled', boot: 'Boot', system: 'System' };
        if (!Object.prototype.hasOwnProperty.call(map, t)) { return fail("Cannot bind parameter 'StartupType'."); }
        hit.svc.start = map[t];
        PC.ledger(state, 'service-start', hit.svc.fault ? 'fault' : (PROTECTED_SERVICES.indexOf(hit.key) >= 0 ? 'protected' : ''));
        return ok('');
    }
    /* Stop-Service / Start-Service / services.msc Stop and Start. */
    function setRunning(state, name, run) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var hit = serviceBy(state, name);
        if (!hit) { return fail('Cannot find any service with service name \'' + String(name).slice(0, 64) + '\'.'); }
        if (run && hit.svc.start === 'Disabled') { return fail('Service \'' + hit.svc.display + '\' cannot be started because it is disabled.'); }
        hit.svc.status = run ? 'Running' : 'Stopped';
        PC.ledger(state, run ? 'service-run' : 'service-stop', hit.svc.fault ? 'fault' : '');
        return ok('');
    }

    /* ═══ DRIVERS ═══ */
    /* pnputil /delete-driver oemN.inf /uninstall /force: removes the package, its service and its filter registration. */
    function deleteDriver(state, inf, force) {
        var s = sys(state), n = String(inf || '').toLowerCase();
        var d = s.drivers.filter(function (x) { return x.inf.toLowerCase() === n; })[0];
        if (!d) { return fail('Failed to delete driver package: The system cannot find the file specified.'); }
        if (d.inUse && !force) { return fail('Failed to delete driver package: One or more devices are presently installed using the specified INF.'); }
        s.drivers.splice(s.drivers.indexOf(d), 1);
        if (d.service && s.services[d.service]) { delete s.services[d.service]; }
        if (d.filter) { s.upperFilters.disk = s.upperFilters.disk.filter(function (f) { return f !== d.filter; }); }
        PC.ledger(state, 'driver-delete', d.fault ? 'fault' : '');
        return ok('Driver package deleted successfully.');
    }

    /* ═══ SCHEDULED TASKS, PROCESSES, PROGRAMS ═══ */
    /* A scheduled task by full path (\\Meridian\\Name) or bare name. */
    function taskBy(state, raw) {
        var s = sys(state), n = String(raw || '').trim().toLowerCase().replace(/^\\+/, '');
        return s.tasks.filter(function (t) { return (t.path + t.name).toLowerCase().replace(/^\\+/, '') === n || t.name.toLowerCase() === n; })[0] || null;
    }
    /* Task Scheduler > Enable/Disable, Disable-ScheduledTask, schtasks /change /disable. */
    function setTask(state, raw, enabled) {
        var t = taskBy(state, raw);
        if (!t) { return fail('ERROR: The system cannot find the file specified.'); }
        t.enabled = enabled === true;
        PC.ledger(state, enabled ? 'task-enable' : 'task-disable', t.fault ? 'fault' : '');
        return ok('SUCCESS: The parameters of scheduled task "' + t.path + t.name + '" have been changed.');
    }
    /* Task Scheduler > Delete, Unregister-ScheduledTask, schtasks /delete. */
    function deleteTask(state, raw) {
        var t = taskBy(state, raw);
        if (!t) { return fail('ERROR: The system cannot find the file specified.'); }
        sys(state).tasks.splice(sys(state).tasks.indexOf(t), 1);
        PC.ledger(state, 'task-delete', t.fault ? 'fault' : '');
        return ok('SUCCESS: The scheduled task "' + t.path + t.name + '" was successfully deleted.');
    }
    /* End task / Stop-Process / taskkill: the process stops until something starts it again. */
    function endProcess(state, raw) {
        var s = sys(state), n = String(raw || '').trim().toLowerCase().replace(/\.exe$/, '');
        var hit = s.processes.filter(function (p) { return p.name.toLowerCase() === n; });
        if (!hit.length) { return fail('Cannot find a process with the name "' + String(raw).slice(0, 40) + '". Verify the process name and call the cmdlet again.'); }
        if (n === 'system' || n === 'svchost') { return fail('Access is denied.'); }
        s.processes = s.processes.filter(function (p) { return hit.indexOf(p) < 0; });
        PC.ledger(state, 'process-end', hit[0].fault ? 'fault' : (n === 'explorer' ? 'explorer' : ''));
        return ok('SUCCESS: The process "' + hit[0].name + '.exe" has been terminated.');
    }
    /* Settings > Apps > Uninstall for a program; returns null when no such program (callers then try MSI/appx). */
    function uninstallProgram(state, raw) {
        var s = sys(state), n = String(raw || '').trim().toLowerCase();
        var p = s.programs.filter(function (x) { return x.name.toLowerCase() === n; })[0];
        if (!p) { return null; }
        s.programs.splice(s.programs.indexOf(p), 1);
        if (typeof p.uninstall === 'string') { UNINSTALLERS[p.uninstall](state); }
        PC.ledger(state, 'program-uninstall', p.fault ? 'fault' : '');
        return ok('');
    }
    /* What each fault program's uninstaller removes (named, so state stays plain JSON). */
    var UNINSTALLERS = {
        'meridian-backup': function (state) {
            var s = sys(state);
            s.drivers = s.drivers.filter(function (d) { return !d.fault; });
            delete s.services.mbafilt;
            s.upperFilters.disk = s.upperFilters.disk.filter(function (f) { return f !== 'mbafilt'; });
        },
        'meridian-sync': function (state) {
            var s = sys(state);
            s.processes = s.processes.filter(function (p) { return !p.fault; });
            s.tasks = s.tasks.filter(function (t) { return !t.fault; });
            if (state.apps) { state.apps.startup = state.apps.startup.filter(function (x) { return x.name !== 'MerSync'; }); }
        },
        'meridian-vpn': function (state) { delete sys(state).services.MerVpnHelper; }
    };

    /* ═══ HOSTS FILE ═══ */
    var HOSTS_PATH = 'C:\\WINDOWS\\SYSTEM32\\DRIVERS\\ETC\\HOSTS';
    function isHostsPath(p) { return String(p || '').trim().toUpperCase().split('/').join('\\') === HOSTS_PATH; }
    function hostsText(state) {
        return ['# Copyright (c) 1993-2009 Microsoft Corp.', '#', '# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.', '#',
                '# localhost name resolution is handled within DNS itself.', '#\t127.0.0.1       localhost', '#\t::1             localhost']
            .concat(sys(state).hosts).join('\n');
    }
    /* Notepad save / Set-Content on the hosts file: the non-comment lines become the entries. */
    function writeHosts(state, text) {
        var lines = String(text || '').split('\n').map(function (l) { return l.replace(/\r$/, ''); })
            .filter(function (l) { var t = l.trim(); return t.length && t[0] !== '#'; });
        if (lines.length > LIM.LIMITS.objects.hostsLines) { return fail(LIM.STORAGE_MESSAGE); }
        sys(state).hosts = lines.map(function (l) { return l.slice(0, 200); });
        PC.ledger(state, 'hosts-write', '');
        return ok('');
    }
    /* Name resolution as the PC does it: hosts first, then the adapter's DNS (Meridian names need Meridian DNS). */
    function resolve(state, name) {
        var n = String(name || '').trim().toLowerCase();
        var hit = sys(state).hosts.map(function (l) { return l.split(/\s+/); }).filter(function (p) { return p.slice(1).some(function (x) { return x.toLowerCase() === n; }); })[0];
        if (hit) { return { ip: hit[0], via: 'hosts' }; }
        var wo = state.wo, lob = wo.lob;
        var meridianDns = state.network.adapters.Ethernet.dns.some(function (d) { return wo.network.dns.indexOf(d) >= 0; });
        var known = n === lob.fqdn.toLowerCase() || n === lob.host.toLowerCase();
        if (known && meridianDns) { return { ip: lobIp(state), via: 'dns' }; }
        return { ip: null, via: meridianDns ? 'nxdomain' : 'unreachable-dns' };
    }
    /* The LOB server's real address: inside the WO's remote subnet (where the firewall rule allows it from). */
    function lobIp(state) { return state.wo.network.lobRemoteSubnet.split('/')[0].replace(/\.0$/, '.20'); }

    /* ═══ SYSTEM PROTECTION AND RESTORE POINTS ═══ */
    /* System Properties > System Protection > Configure > Turn on (C:), Enable-ComputerRestore. */
    function setProtection(state, on) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        sys(state).protection.C = on === true;
        PC.ledger(state, on ? 'protection-on' : 'protection-off', '');
        return ok('');
    }
    /* A restore point: a JSON snapshot of the reverting domains (4.3), taken now. */
    function capture(state) {
        var s = sys(state);
        return JSON.stringify({
            policies: state.os.policies, services: s.services, drivers: s.drivers, upperFilters: s.upperFilters, tasks: s.tasks,
            updates: state.os.updates.history, programs: s.programs, msi: state.apps ? state.apps.msi : [],
            startupRun: state.apps ? state.apps.startup.map(function (x) { return [x.name, x.runValue, x.enabled]; }) : [],
            firewall: state.network.firewall || null, shares: state.network.shares || null, adapter: state.network.adapters.Ethernet,
            power: state.os.power, hostname: state.os.hostname, uac: state.identity.uac
        });
    }
    /* System Protection > Create (never throttled) or Checkpoint-Computer (throttled; needs ctx.now). */
    function createPoint(state, name, viaCmdlet, now) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var s = sys(state);
        if (!s.protection.C) { return fail(viaCmdlet ? 'Checkpoint-Computer : The service cannot be started, either because it is disabled or because it has no enabled devices associated with it.' : 'System protection is turned off for this drive.'); }
        if (viaCmdlet) {
            var t = Number(now);
            /* the throttle needs the server clock; without it, fail closed (Nancy D5 R3 #11) */
            if (!isFinite(t)) { return fail('Checkpoint-Computer : The restore point could not be created at this time.'); }
            if (s.lastCheckpointAt !== null && t - s.lastCheckpointAt < CHECKPOINT_THROTTLE_MS) {
                return ok('WARNING: A new system restore point cannot be created because one has already been created within the past 1440 minutes. The frequency of restore point creation can be changed by creating the DWORD value \'SystemRestorePointCreationFrequency\' under the registry key \'HKLM\\Software\\Microsoft\\Windows NT\\CurrentVersion\\SystemRestore\'.');
            }
            s.lastCheckpointAt = t;
        }
        if (s.restorePoints.length >= RESTORE_CAP) { s.restorePoints.shift(); }
        s.restorePoints.push({ seq: s.restorePoints.length ? s.restorePoints[s.restorePoints.length - 1].seq + 1 : 1, name: String(name || 'Restore point').slice(0, 64),
                               ledgerAt: state.ledger.length, data: capture(state) });
        PC.ledger(state, 'restore-point', viaCmdlet ? 'cmdlet' : 'gui');
        return ok('The restore point was created successfully.');
    }
    /* Restore to a point: the reverting domains come back; the rest stays (4.3). */
    function restoreTo(state, seq) {
        var s = sys(state);
        var p = s.restorePoints.filter(function (x) { return x.seq === Number(seq); })[0];
        if (!p) { return fail('The restore point was not found.'); }
        var d = JSON.parse(p.data);
        state.os.policies = d.policies; s.services = d.services; s.drivers = d.drivers; s.upperFilters = d.upperFilters; s.tasks = d.tasks;
        state.os.updates.history = d.updates; s.programs = d.programs;
        if (state.apps) {
            state.apps.msi = d.msi;
            state.apps.startup.forEach(function (x) { var r = d.startupRun.filter(function (y) { return y[0] === x.name; })[0]; if (r) { x.runValue = r[1]; x.enabled = r[2]; } });
        }
        if (d.firewall) { state.network.firewall = d.firewall; }
        if (d.shares) { state.network.shares = d.shares; }
        state.network.adapters.Ethernet = d.adapter; state.os.power = d.power; state.os.hostname = d.hostname; state.identity.uac = d.uac;
        PC.ledger(state, 'system-restore', String(p.seq));
        return ok('System Restore completed successfully. Your computer was restored to ' + p.name + '.');
    }

    /* Windows Installer's automatic point before an MSI install (4.3): only with protection on, and
     * under the same 1440-minute throttle; silent when it does not apply. */
    function autoPoint(state, name, now) {
        var s = sys(state);
        if (!s.protection.C || !isFinite(Number(now))) { return; }
        createPoint(state, name, true, now);
    }

    module.exports = {
        autoPoint: autoPoint,
        DISK_CLASS: DISK_CLASS, PROTECTED_SERVICES: PROTECTED_SERVICES, HOSTS_PATH: HOSTS_PATH, CHECKPOINT_THROTTLE_MS: CHECKPOINT_THROTTLE_MS,
        sys: sys, logEvent: logEvent, serviceBy: serviceBy, setStartType: setStartType, setRunning: setRunning,
        deleteDriver: deleteDriver, taskBy: taskBy, setTask: setTask, deleteTask: deleteTask, endProcess: endProcess,
        uninstallProgram: uninstallProgram, isHostsPath: isHostsPath, hostsText: hostsText, writeHosts: writeHosts,
        resolve: resolve, lobIp: lobIp, setProtection: setProtection, createPoint: createPoint, restoreTo: restoreTo, capture: capture
    };
})();
