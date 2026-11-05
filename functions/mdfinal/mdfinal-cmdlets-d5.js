/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-cmdlets-d5.js — desktop console commands for P6 and P7: msiexec and Store apps, update
 * removal, restore points, processes, services, scheduled tasks, drivers, the event log, name
 * resolution tests, the hosts file, and boot configuration.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, rows 6.1-6.3, section 4
 * (the four variants' evidence and repairs), 13.12.
 *
 * install(api) registers into the mdfinal-cmdlets.js tables, as mdfinal-cmdlets-d4.js does, and
 * adds CONSUMERS: the two Store-app removal cmdlets may sit at the END of a pipeline and receive
 * the rows the earlier stages produced (Get-AppxPackage *x* | Remove-AppxPackage). Nothing else can.
 * Diagnostic commands append ledger evidence (taskmgr-view, get-process, eventvwr, name-test,
 * ipconfig, hosts-view, pnputil-enum, hotfix-list) that the P8 gates read (13.5 item 5).
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var PC = require('./mdfinal-pc.js');
    var APPS = require('./mdfinal-apps.js');
    var SYS = require('./mdfinal-sys.js');
    var WINRE = require('./mdfinal-winre.js');
    var M = require('./mdfinal-match.js');

    function install(api) {
        var has = api.has, objs = api.objs, missingArg = api.missingArg, P = api.PRODUCERS, Mu = api.MUTATORS, L = api.LEGACY, CON = api.CONSUMERS;

        /* First present parameter among names, else the nth positional. */
        function arg(a, names, pos) {
            for (var i = 0; i < names.length; i++) { if (has(a, names[i]) && a[names[i]] !== true) { return a[names[i]]; } }
            return pos === undefined ? undefined : a._[pos];
        }

        /* ═══ MSI and Store apps ═══ */
        L['msiexec'] = function (state, t, ctx) {
            var w = t.map(function (x) { return x.toLowerCase(); });
            var i = w.indexOf('/i') >= 0 ? w.indexOf('/i') : w.indexOf('/package'), x = w.indexOf('/x') >= 0 ? w.indexOf('/x') : w.indexOf('/uninstall');
            var props = APPS.msiProps(t.slice(1).filter(function (y) { return y.indexOf('=') > 0; }));
            if (i >= 0 && t[i + 1]) {
                var r = APPS.installMsi(state, t[i + 1], props);
                if (r.ok) { SYS.autoPoint(state, 'Installed LedgerSync', ctx.now); }
                return r.ok ? '' : r.msg;
            }
            if (x >= 0 && t[x + 1]) { var u = APPS.uninstallMsi(state, t[x + 1]); return u.ok ? '' : u.msg; }
            return 'Windows (R) Installer. V 5.0.26100.1742\n\nmsiexec /Option <Required Parameter> [Optional Parameter]\n\nInstall Options\n\t</package | /i> <Product.msi>\n\t</uninstall | /x> <Product.msi | ProductCode>';
        };
        L['msiexec.exe'] = L['msiexec'];
        P['get-appxpackage'] = function (state, a) {
            var pat = arg(a, ['name'], 0);
            var rows = APPS.appxRows(state).filter(function (r) { return pat === undefined || M.like(r.Name, pat, M.budget()).match; });
            return objs(rows, ['Name', 'PackageFullName', 'Version', 'Architecture', 'Publisher'], ['Name', 'PackageFullName', 'Version']);
        };
        P['get-appxprovisionedpackage'] = function (state, a) {
            if (!has(a, 'online')) { return 'Get-AppxProvisionedPackage : This exam console works on the running image: use -Online.'; }
            return objs(APPS.provisionedRows(state), ['DisplayName', 'PackageName', 'Version', 'Architecture'], ['DisplayName', 'PackageName', 'Version']);
        };
        Mu['remove-appxpackage'] = function (state, a) {
            var pkg = arg(a, ['package'], 0);
            if (pkg === undefined) { return missingArg('Remove-AppxPackage', 'Package'); }
            var r = APPS.removeForUser(state, pkg); return r.ok ? '' : r.msg;
        };
        Mu['remove-appxprovisionedpackage'] = function (state, a) {
            if (!has(a, 'online')) { return 'Remove-AppxProvisionedPackage : use -Online.'; }
            var pkg = arg(a, ['packagename'], 0);
            if (pkg === undefined) { return missingArg('Remove-AppxProvisionedPackage', 'PackageName'); }
            var r = APPS.deprovision(state, pkg); return r.ok ? '' : r.msg;
        };
        /* Pipeline consumers: the rows of the earlier stages, each removed. */
        CON['remove-appxpackage'] = function (state, rows) {
            if (rows.length > 20) { return api.LIMIT_MSG; }
            var out = [];
            rows.forEach(function (r) { var x = APPS.removeForUser(state, r.PackageFullName || r.PackageName || r.Name); if (!x.ok) { out.push(x.msg); } });
            return out.join('\n');
        };
        CON['remove-appxprovisionedpackage'] = function (state, rows, a) {
            if (!has(a, 'online')) { return 'Remove-AppxProvisionedPackage : use -Online.'; }
            if (rows.length > 20) { return api.LIMIT_MSG; }
            var out = [];
            rows.forEach(function (r) { var x = APPS.deprovision(state, r.PackageName || r.PackageFullName || r.DisplayName); if (!x.ok) { out.push(x.msg); } });
            return out.join('\n');
        };

        /* ═══ Updates ═══ */
        var hotfixBase = P['get-hotfix'];
        P['get-hotfix'] = function (state, a, ctx) { PC.ledger(state, 'hotfix-list', ''); return hotfixBase(state, a, ctx); };
        function removeKb(state, kb) {
            var n = String(kb || '').toUpperCase().replace(/^KB/, '');
            var h = state.os.updates.history, i = h.map(function (x) { return x.kb; }).indexOf('KB' + n);
            if (i < 0) { return null; }
            var x = h.splice(i, 1)[0];
            PC.ledger(state, 'hotfix-uninstall', x.fault ? 'fault' : 'other');
            return x;
        }
        L['wusa'] = function (state, t) {
            var u = t.filter(function (x) { return x.toLowerCase().indexOf('/kb:') === 0; })[0];
            if (!t.some(function (x) { return x.toLowerCase() === '/uninstall'; }) || !u) { return 'Windows Update Standalone Installer\n\nwusa.exe /uninstall /kb:<number> [/quiet] [/norestart]'; }
            return removeKb(state, u.slice(4)) ? '' : 'The update is not installed on this computer.';
        };
        L['wusa.exe'] = L['wusa'];
        L['dism'] = function (state, t) {
            var w = t.map(function (x) { return x.toLowerCase(); });
            if (w.indexOf('/online') < 0) { return 'Error: 87\n\nThe option is unknown. This exam console uses DISM /Online.'; }
            if (w.indexOf('/get-packages') >= 0) {
                PC.ledger(state, 'hotfix-list', '');
                return state.os.updates.history.map(function (x) { return 'Package Identity : Package_for_' + x.kb + '~31bf3856ad364e35~amd64~~26100.' + x.revision + '.1.0\nState : Installed'; }).join('\n\n') + '\nThe operation completed successfully.';
            }
            var pn = t.filter(function (x) { return x.toLowerCase().indexOf('/packagename:') === 0; })[0];
            if (w.indexOf('/remove-package') >= 0 && pn) {
                var kb = pn.slice(13).split('_')[2] || '';
                kb = kb.split('~')[0];
                return removeKb(state, kb) ? 'Removing package ' + pn.slice(13, 80) + '\n[==========================100.0%==========================]\nThe operation completed successfully.\nRestart Windows to complete this operation.' : 'Error: 0x800f080c\n\nFeature name ' + pn.slice(13, 80) + ' is unknown.';
            }
            var ppn = t.filter(function (x) { return x.toLowerCase().indexOf('/packagename:') === 0; })[0];
            if (w.indexOf('/remove-provisionedappxpackage') >= 0 && ppn) {
                var dr = APPS.deprovision(state, ppn.slice(13));
                return dr.ok ? 'Removing package ' + ppn.slice(13, 80) + '\nThe operation completed successfully.' : 'Error: 0x80070002\n\nThe system cannot find the file specified.';
            }
            if (w.indexOf('/get-provisionedappxpackages') >= 0) { return APPS.provisionedRows(state).map(function (r) { return 'DisplayName : ' + r.DisplayName + '\nPackageName : ' + r.PackageName; }).join('\n\n'); }
            if (w.indexOf('/cleanup-image') >= 0) { PC.ledger(state, 'sfc', 'dism'); return 'No component store corruption detected.\nThe operation completed successfully.'; }
            return 'Error: 87\n\nThe option is unknown.';
        };
        L['dism.exe'] = L['dism'];
        L['sfc'] = function (state) { PC.ledger(state, 'sfc', 'online'); return 'Beginning system scan.  This process will take some time.\n\nWindows Resource Protection did not find any integrity violations.'; };
        L['sfc.exe'] = L['sfc'];

        /* ═══ Restore points ═══ */
        Mu['enable-computerrestore'] = function (state) { var r = SYS.setProtection(state, true); return r.ok ? '' : r.msg; };
        Mu['checkpoint-computer'] = function (state, a, ctx) { var r = SYS.createPoint(state, arg(a, ['description'], 0) || 'Restore point', true, ctx.now); return r.ok ? r.msg.indexOf('WARNING') === 0 ? r.msg : '' : r.msg; };
        P['get-computerrestorepoint'] = function (state) {
            return objs(SYS.sys(state).restorePoints.map(function (p) { return { SequenceNumber: p.seq, Description: p.name, RestorePointType: 'APPLICATION_INSTALL' }; }),
                ['SequenceNumber', 'Description', 'RestorePointType'], ['SequenceNumber', 'Description', 'RestorePointType']);
        };
        Mu['restore-computer'] = function (state, a) {
            var r = SYS.restoreTo(state, Number(arg(a, ['restorepoint'], 0)));
            if (!r.ok) { return 'Restore-Computer : ' + r.msg; }
            PC.restart(state); return '';
        };

        /* ═══ Processes ═══ */
        /* Stamps the newest `kind` ledger entry with the evidence names a route listed, from its data. */
        function seenFromData(state, kind, names) {
            var e = state.ledger[state.ledger.length - 1];
            if (!e || e.k !== kind) { return; }
            e.seen = names.map(function (n) { return String(n).toLowerCase(); }).filter(function (n) { return n === 'msynchlp'; }).join(',');
        }
        P['get-process'] = function (state, a) {
            PC.ledger(state, 'get-process', '');
            var n = arg(a, ['name'], 0);
            /* the Id is the process's place in the whole list, so it is stable under a name filter
             * and Stop-Process -Id finds the same process (Mallory R4 F4) */
            var rows = SYS.sys(state).processes.map(function (p, i) { return { p: p, id: 1000 + i * 4 }; })
                .filter(function (x) { return n === undefined || M.like(x.p.name, String(n).replace(/\.exe$/i, ''), M.budget()).match; })
                .map(function (x) { return { ProcessName: x.p.name, Name: x.p.name, Id: x.id, CPU: x.p.cpu, WorkingSet: x.p.wsMB * 1048576, WS_MB: x.p.wsMB }; });
            /* the evidence this route showed is the processes it LISTED, never the reply text: an error
             * echoes the typed name (Mallory R7: -Name "x msynchlp" stamped msynchlp unseen) */
            seenFromData(state, 'get-process', rows.map(function (r) { return r.ProcessName; }));
            if (n !== undefined && !rows.length) { return 'Get-Process : Cannot find a process with the name "' + String(n).slice(0, 40) + '".'; }
            /* Name is PowerShell's own alias of ProcessName (Nancy R9: `Select-Object Name` printed blanks) */
            return objs(rows, ['ProcessName', 'Name', 'Id', 'CPU', 'WorkingSet', 'WS_MB'], ['ProcessName', 'Id', 'CPU', 'WS_MB']);
        };
        /* The process at an Id as Get-Process numbers them (Mallory R4 F4), or null. */
        function procNameById(state, id) {
            var n = Number(id);
            if (!(n >= 1000) || (n - 1000) % 4 !== 0) { return null; }
            var p = SYS.sys(state).processes[(n - 1000) / 4];
            return p ? p.name : null;
        }
        Mu['stop-process'] = function (state, a) {
            var id = arg(a, ['id']), pos = arg(a, ['name'], 0);
            if (id === undefined && pos !== undefined && /^[0-9]+$/.test(String(pos))) { id = pos; pos = undefined; }
            if (id !== undefined) {
                var byId = procNameById(state, id);
                if (!byId) { return 'Stop-Process : Cannot find a process with the process identifier ' + String(id).slice(0, 12) + '.'; }
                pos = byId;
            }
            var r = SYS.endProcess(state, pos); return r.ok ? '' : 'Stop-Process : ' + r.msg;
        };
        L['taskkill'] = function (state, t) {
            var low = t.map(function (x) { return x.toLowerCase(); });
            var pid = low.indexOf('/pid');
            if (pid >= 0 && t[pid + 1]) {
                var nm = procNameById(state, t[pid + 1]);
                if (!nm) { return 'ERROR: The process "' + t[pid + 1].slice(0, 12) + '" not found.'; }
                var rr = SYS.endProcess(state, nm); return rr.ok ? 'SUCCESS: The process with PID ' + t[pid + 1].slice(0, 12) + ' has been terminated.' : 'ERROR: ' + rr.msg;
            }
            var i = low.indexOf('/im');
            if (i < 0 || !t[i + 1]) { return 'ERROR: Invalid syntax. Type "TASKKILL /?" for usage.'; }
            var r = SYS.endProcess(state, t[i + 1]); return r.ok ? r.msg : 'ERROR: The process "' + t[i + 1].slice(0, 40) + '" not found.';
        };
        L['tasklist'] = function (state) {
            PC.ledger(state, 'get-process', '');
            seenFromData(state, 'get-process', SYS.sys(state).processes.map(function (p) { return p.name; }));
            return 'Image Name                     Mem Usage\n========================= ============\n' + SYS.sys(state).processes.map(function (p) { return p.name + '.exe    ' + (p.wsMB * 1024) + ' K'; }).join('\n');
        };

        /* ═══ Services ═══ */
        P['get-service'] = function (state, a) {
            var n = arg(a, ['name'], 0), s = SYS.sys(state);
            var rows = Object.keys(s.services).filter(function (k) { return n === undefined || M.like(k, n, M.budget()).match; })
                .map(function (k) { return { Status: s.services[k].status, Name: k, DisplayName: s.services[k].display, StartType: s.services[k].start }; });
            if (n !== undefined && !rows.length) { return "Get-Service : Cannot find any service with service name '" + String(n).slice(0, 64) + "'."; }
            return objs(rows, ['Status', 'Name', 'DisplayName', 'StartType'], ['Status', 'Name', 'DisplayName']);
        };
        Mu['set-service'] = function (state, a) {
            var n = arg(a, ['name'], 0);
            if (has(a, 'startuptype')) { var r = SYS.setStartType(state, n, a.startuptype); if (!r.ok) { return 'Set-Service : ' + r.msg; } }
            if (has(a, 'status')) { var q = SYS.setRunning(state, n, String(a.status).toLowerCase() === 'running'); if (!q.ok) { return 'Set-Service : ' + q.msg; } }
            return '';
        };
        Mu['stop-service'] = function (state, a) { var r = SYS.setRunning(state, arg(a, ['name'], 0), false); return r.ok ? '' : 'Stop-Service : ' + r.msg; };
        Mu['start-service'] = function (state, a) { var r = SYS.setRunning(state, arg(a, ['name'], 0), true); return r.ok ? '' : 'Start-Service : ' + r.msg; };
        /* sc config <name> start= disabled|demand|auto, sc stop|start|query <name>. */
        L['sc'] = function (state, t) {
            var op = String(t[1] || '').toLowerCase(), name = t[2];
            if (op === 'config') {
                var i = t.map(function (x) { return x.toLowerCase(); }).indexOf('start=');
                var v = i >= 0 ? t[i + 1] : null;
                if (!v) { return '[SC] ChangeServiceConfig FAILED 87:\n\nThe parameter is incorrect.'; }
                var r = SYS.setStartType(state, name, v);
                return r.ok ? '[SC] ChangeServiceConfig SUCCESS' : '[SC] OpenService FAILED 1060:\n\nThe specified service does not exist as an installed service.';
            }
            if (op === 'stop' || op === 'start') { var q = SYS.setRunning(state, name, op === 'start'); return q.ok ? '' : '[SC] ' + q.msg; }
            if (op === 'query' || op === 'qc') {
                var h = SYS.serviceBy(state, name);
                return h ? 'SERVICE_NAME: ' + h.key + '\n        START_TYPE         : ' + h.svc.start + '\n        STATE              : ' + h.svc.status : '[SC] EnumQueryServicesStatus:OpenService FAILED 1060:\n\nThe specified service does not exist as an installed service.';
            }
            return 'DESCRIPTION:\n        SC is a command line program used for communicating with the Service Control Manager and services.';
        };
        L['sc.exe'] = L['sc'];

        /* ═══ Scheduled tasks ═══ */
        P['get-scheduledtask'] = function (state, a) {
            var path = arg(a, ['taskpath']);
            return objs(SYS.sys(state).tasks.filter(function (t) { return path === undefined || t.path.toLowerCase() === String(path).toLowerCase(); })
                .map(function (t) { return { TaskPath: t.path, TaskName: t.name, State: t.enabled ? 'Ready' : 'Disabled', Triggers: t.triggers || '' }; }),
                ['TaskPath', 'TaskName', 'State', 'Triggers'], ['TaskPath', 'TaskName', 'State']);
        };
        function taskRef(a) { var p = arg(a, ['taskpath']) || ''; return (p.slice(-1) === '\\' || !p ? p : p + '\\') + (arg(a, ['taskname'], 0) || ''); }
        Mu['disable-scheduledtask'] = function (state, a) { var r = SYS.setTask(state, taskRef(a), false); return r.ok ? '' : 'Disable-ScheduledTask : The system cannot find the file specified.'; };
        Mu['enable-scheduledtask'] = function (state, a) { var r = SYS.setTask(state, taskRef(a), true); return r.ok ? '' : 'Enable-ScheduledTask : The system cannot find the file specified.'; };
        Mu['unregister-scheduledtask'] = function (state, a) { var r = SYS.deleteTask(state, taskRef(a)); return r.ok ? '' : 'Unregister-ScheduledTask : The system cannot find the file specified.'; };
        L['schtasks'] = function (state, t) {
            var w = t.map(function (x) { return x.toLowerCase(); });
            var tn = w.indexOf('/tn') >= 0 ? t[w.indexOf('/tn') + 1] : null;
            if (w[1] === '/query') { return SYS.sys(state).tasks.map(function (x) { return x.path + x.name + '    ' + (x.enabled ? 'Ready' : 'Disabled'); }).join('\n') || 'INFO: There are no scheduled tasks presently available.'; }
            if (w[1] === '/change' && tn && w.indexOf('/disable') >= 0) { return SYS.setTask(state, tn, false).msg; }
            if (w[1] === '/change' && tn && w.indexOf('/enable') >= 0) { return SYS.setTask(state, tn, true).msg; }
            if (w[1] === '/delete' && tn) { return SYS.deleteTask(state, tn).msg; }
            return 'ERROR: Invalid argument/option.\nType "SCHTASKS /?" for usage.';
        };
        L['schtasks.exe'] = L['schtasks'];

        /* ═══ Drivers ═══ */
        L['pnputil'] = function (state, t) {
            var w = t.map(function (x) { return x.toLowerCase(); });
            if (w[1] === '/enum-drivers') {
                PC.ledger(state, 'pnputil-enum', '');
                return 'Microsoft PnP Utility\n\n' + SYS.sys(state).drivers.map(function (d) {
                    return 'Published Name:     ' + d.inf + '\nOriginal Name:      ' + d.original + '\nProvider Name:      ' + d.provider + '\nClass Name:         Disk drives\nDriver Version:     11/19/2026 2.1.0.4';
                }).join('\n\n');
            }
            /* /uninstall removes the driver from the devices using it, then deletes the package (real pnputil) */
            if (w[1] === '/delete-driver' && t[2]) { var r = SYS.deleteDriver(state, t[2], w.indexOf('/force') >= 0 || w.indexOf('/uninstall') >= 0); return r.ok ? 'Microsoft PnP Utility\n\n' + r.msg : 'Microsoft PnP Utility\n\n' + r.msg; }
            return 'Microsoft PnP Utility\n\nPNPUTIL [/add-driver <...> | /delete-driver <oem#.inf> [/uninstall] [/force] | /enum-drivers]';
        };
        L['pnputil.exe'] = L['pnputil'];

        /* ═══ Event log ═══ */
        function events(state, log, n) {
            /* only a real log counts as an Event Viewer diagnosis (Mallory R4 F1) */
            if (['system', 'application', 'security', 'setup'].indexOf(String(log || '').toLowerCase()) < 0) {
                return 'Get-WinEvent : There is not an event log on the localhost computer that matches "' + String(log || '').slice(0, 40) + '".';
            }
            PC.ledger(state, 'eventvwr', '');
            var rows = SYS.sys(state).eventlog.filter(function (e) { return e.log.toLowerCase() === String(log || '').toLowerCase(); }).slice(-n).reverse();
            return objs(rows.map(function (e) { return { TimeCreated: '11/19/2026', Id: e.id, LevelDisplayName: e.level, ProviderName: e.source, Message: e.msg }; }),
                ['TimeCreated', 'Id', 'LevelDisplayName', 'ProviderName', 'Message'], ['TimeCreated', 'Id', 'LevelDisplayName', 'Message']);
        }
        P['get-winevent'] = function (state, a) {
            var log = arg(a, ['logname'], 0);
            if (!log) { return missingArg('Get-WinEvent', 'LogName'); }
            var n = Number(arg(a, ['maxevents']) || 50);
            return events(state, log, Math.min(200, n > 0 ? n : 50));
        };
        P['get-eventlog'] = function (state, a) {
            var log = arg(a, ['logname'], 0);
            if (!log) { return missingArg('Get-EventLog', 'LogName'); }
            return events(state, log, Math.min(200, Number(arg(a, ['newest']) || 50)));
        };

        /* ═══ Name resolution ═══ */
        /* A name-resolution or port test; ref 'lob' when it names the LedgerSync server (I3 for V4). */
        function nameTest(state, target) {
            var n = String(target || '').toLowerCase();
            PC.ledger(state, 'name-test', n === state.wo.lob.fqdn.toLowerCase() || n === state.wo.lob.host.toLowerCase() ? 'lob' : '');
            /* the evidence a name test shows is the address it RESOLVED a name to, from data: a typed IP
             * is only echoed back, so it shows nothing (Mallory R8: the decoy IP as a target) */
            var e = state.ledger[state.ledger.length - 1];
            var isIp = /^[0-9.]+$/.test(n);
            var r = n && !isIp ? SYS.resolve(state, n) : null;
            e.seen = r && r.ip ? r.ip : '';
        }
        /* ping's target is the first token that is neither an option nor an option's value (Nancy R4
         * #4: `ping -n 2 HOST` took "2" as the host) */
        var PING_VALUE_OPTS = ['n', 'l', 'w', 'i', 'S', 'k', 'j', 'r', 's'].map(function (x) { return x.toLowerCase(); });
        function pingTarget(t) {
            for (var i = 1; i < t.length; i++) {
                var x = t[i];
                if (x[0] === '-' || x[0] === '/') { if (PING_VALUE_OPTS.indexOf(x.slice(1).toLowerCase()) >= 0) { i++; } continue; }
                return x;
            }
            return undefined;
        }
        L['ping'] = function (state, t) {
            var n = pingTarget(t);
            nameTest(state, n);
            if (!n) { return 'Usage: ping [-n count] target_name'; }
            var r = SYS.resolve(state, n);
            if (!r.ip) { return 'Ping request could not find host ' + n.slice(0, 64) + '. Please check the name and try again.'; }
            var good = r.ip === SYS.lobIp(state);
            return 'Pinging ' + n.slice(0, 64) + ' [' + r.ip + '] with 32 bytes of data:\n' + (good ? 'Reply from ' + r.ip + ': bytes=32 time<1ms TTL=127' : 'Request timed out.\nRequest timed out.');
        };
        L['ping.exe'] = function (state, t) { return L['ping'](state, t); };
        L['cls'] = function () { return ''; };
        L['echo'] = function (state, t) { return t.slice(1).join(' ').slice(0, 500); };
        /* nslookup asks the DNS server and never reads hosts, so its reply never shows the hosts
         * decoy; the name test's data stamp is cut to what the reply shows (mdfinal-evidence.js), which
         * is how it stops crediting the decoy (Nancy R7 low). */
        L['nslookup'] = function (state, t) {
            nameTest(state, t[1]);
            var dns = state.network.adapters.Ethernet.dns;
            var n = t[1];
            if (!n) { return 'Default Server:  UnKnown\nAddress:  ' + (dns[0] || '') ; }
            var meridian = dns.some(function (d) { return state.wo.network.dns.indexOf(d) >= 0; });
            if (!meridian) { return 'DNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  ' + (dns[0] || '') + '\n\n*** Request to UnKnown timed-out'; }
            var lob = [state.wo.lob.fqdn.toLowerCase(), state.wo.lob.host.toLowerCase()];
            return 'Server:  DC1.meridian.local\nAddress:  ' + dns[0] + '\n\n' + (lob.indexOf(n.toLowerCase()) >= 0 ? 'Name:    ' + state.wo.lob.fqdn + '\nAddress:  ' + SYS.lobIp(state) : '*** DC1.meridian.local can\'t find ' + n.slice(0, 64) + ': Non-existent domain');
        };
        P['resolve-dnsname'] = function (state, a) {
            var n = arg(a, ['name'], 0), r = SYS.resolve(state, n);
            nameTest(state, n);
            if (!r.ip) { return 'Resolve-DnsName : ' + String(n || '').slice(0, 64) + ' : DNS name does not exist'; }
            return objs([{ Name: String(n).slice(0, 64), Type: 'A', TTL: 3600, IPAddress: r.ip }], ['Name', 'Type', 'TTL', 'IPAddress'], ['Name', 'Type', 'TTL', 'IPAddress']);
        };
        P['test-netconnection'] = function (state, a) {
            var n = arg(a, ['computername'], 0), port = arg(a, ['port']);
            nameTest(state, n);
            var r = SYS.resolve(state, n), good = !!r.ip && r.ip === SYS.lobIp(state);
            var o = objs([{ ComputerName: String(n || '').slice(0, 64), RemoteAddress: r.ip || '', RemotePort: port || '', TcpTestSucceeded: port ? good : '', PingSucceeded: good }],
                ['ComputerName', 'RemoteAddress', 'RemotePort', 'TcpTestSucceeded', 'PingSucceeded'], ['ComputerName', 'RemoteAddress', 'RemotePort', 'TcpTestSucceeded', 'PingSucceeded']);
            o.forceList = true;
            return r.ip ? o : 'WARNING: Name resolution of ' + String(n || '').slice(0, 64) + ' failed';
        };
        /* common aliases (Nancy R4 #9) */
        P['tnc'] = P['test-netconnection']; P['gps'] = P['get-process']; P['ps'] = P['get-process']; P['gsv'] = P['get-service']; Mu['kill'] = Mu['stop-process']; Mu['spps'] = Mu['stop-process'];
        var ipcfg = L['ipconfig'];
        L['ipconfig'] = function (state, t, ctx) {
            PC.ledger(state, 'ipconfig', '');
            if (t[1] && t[1].toLowerCase() === '/flushdns') { return 'Windows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.'; }
            return ipcfg(state, t, ctx);
        };
        L['ipconfig.exe'] = L['ipconfig'];

        /* ═══ The hosts file (Get-Content / Set-Content / Add-Content / notepad on its path) ═══ */
        var getContent = P['get-content'], setContent = Mu['set-content'];
        P['get-content'] = function (state, a, ctx) {
            if (SYS.isHostsPath(arg(a, ['path'], 0))) { PC.ledger(state, 'hosts-view', ''); return SYS.hostsText(state); }
            return getContent(state, a, ctx);
        };
        P['type'] = P['get-content']; P['cat'] = P['get-content'];
        /* Select-String -Path <file> -Pattern <text>: what Get-Content can read (the hosts file, TECH-USB
         * files), each match as path:line:text. Reading the hosts file is a hosts view, and what the
         * reply shows is stamped from its text at exec, so only the matching lines count as seen. */
        P['select-string'] = function (state, a, ctx) {
            var named = Object.prototype.hasOwnProperty.call(a, 'pattern');
            var path = arg(a, ['path', 'literalpath']) || (named ? a._[0] : a._[1]);
            if (path === undefined || path === true) { return 'Select-String : This exam console searches files: Select-String -Path <file> -Pattern <text>, or Get-Content <file> | Select-String <text>.'; }
            path = String(path).trim();
            /* a bad pattern is refused before the file is read, so it logs no view */
            var budget = M.budget(), bad = api.selectLines([], a, budget);
            if (typeof bad === 'string') { return bad; }
            var text = P['get-content'](state, { _: [path], path: path }, ctx);
            if (typeof text !== 'string') { return 'Select-String : Cannot search that input.'; }
            if (text.indexOf('Get-Content : ') === 0) { return 'Select-String' + text.slice('Get-Content'.length); }
            var lines = api.textLines(text);
            var hits = api.selectLines(lines, a, budget);
            if (typeof hits === 'string') { return hits; }
            if (!hits.length) { return api.literalNote(a); }
            return { kind: 'values', values: hits.map(function (i) { return path.slice(0, 120) + ':' + (i + 1) + ':' + lines[i]; }) };
        };
        P['sls'] = P['select-string'];
        Mu['set-content'] = function (state, a, ctx) {
            if (SYS.isHostsPath(arg(a, ['path'], 0))) { var r = SYS.writeHosts(state, String(arg(a, ['value'], 1) || '')); return r.ok ? '' : 'Set-Content : ' + r.msg; }
            return setContent(state, a, ctx);
        };
        Mu['clear-content'] = function (state, a) {
            if (!SYS.isHostsPath(arg(a, ['path'], 0))) { return 'Clear-Content : This exam console clears the hosts file only.'; }
            var r = SYS.writeHosts(state, ''); return r.ok ? '' : 'Clear-Content : ' + r.msg;
        };
        Mu['remove-item'] = function (state, a) {
            if (!SYS.isHostsPath(arg(a, ['path'], 0))) { return 'Remove-Item : This exam console removes the hosts file entries only.'; }
            var r = SYS.writeHosts(state, ''); return r.ok ? '' : 'Remove-Item : ' + r.msg;
        };
        Mu['add-content'] = function (state, a) {
            if (!SYS.isHostsPath(arg(a, ['path'], 0))) { return 'Add-Content : This exam console appends to the hosts file only.'; }
            var r = SYS.writeHosts(state, SYS.hostsText(state) + '\n' + String(arg(a, ['value'], 1) || '')); return r.ok ? '' : 'Add-Content : ' + r.msg;
        };
        L['notepad'] = function (state, t) {
            if (SYS.isHostsPath(t[1])) { PC.ledger(state, 'hosts-view', ''); return 'Notepad opened ' + t[1] + ' (use the Notepad window to edit and save).'; }
            return 'Notepad opened.';
        };
        L['notepad.exe'] = L['notepad'];

        /* ═══ Boot configuration from the desktop ═══ */
        L['bcdedit'] = function (state, t) {
            var w = t.map(function (x) { return x.toLowerCase(); }), s = SYS.sys(state);
            if (w[1] === '/set' && w[2] === '{default}' && w[3] === 'safeboot' && ['minimal', 'network'].indexOf(w[4]) >= 0) { s.safeboot = w[4]; PC.ledger(state, 'bcd-safeboot', 'on'); return 'The operation completed successfully.'; }
            if (w[1] === '/deletevalue' && w[2] === '{default}' && w[3] === 'safeboot') { s.safeboot = null; PC.ledger(state, 'bcd-safeboot', 'off'); return 'The operation completed successfully.'; }
            return 'Windows Boot Loader\n-------------------\nidentifier              {current}\ndescription             Windows 11' + (s.safeboot ? '\nsafeboot                ' + s.safeboot : '');
        };
        L['bcdedit.exe'] = L['bcdedit'];
        /* shutdown /r /o: restart into the recovery environment. */
        L['shutdown'] = function (state, t) {
            var w = t.map(function (x) { return x.toLowerCase(); });
            if (w.indexOf('/r') >= 0 && w.indexOf('/o') >= 0) { WINRE.enter(state); return ''; }
            if (w.indexOf('/r') >= 0) { var r = PC.restart(state); return r.ok ? '' : r.msg; }
            return 'This exam console supports shutdown /r and shutdown /r /o.';
        };
    }

    module.exports = { install: install };
})();
