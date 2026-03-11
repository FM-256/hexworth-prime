/* ================================================================
   WINDOWS-CMD-02: Blue Screen Protocol -- Mission Config
   ================================================================
   Terminal-mode mission. Windows Server admin environment on SRV-DC01.
   Custom commands: schtasks, sc, net, wevtutil, reg, gpresult.
   Overrides: scan, move, status (Windows-flavored output).
   Location-specific: commands only work at the correct panel node.
   Objectives: find rogue task, stop service, disable user, verify in logs.
   ================================================================ */

var WINDOWS_CMD_02_CONFIG = {
    id: 'windows-cmd-02',
    missionTitle: 'WINDOWS-CMD-02',
    title: 'Blue Screen Protocol',
    subtitle: 'Diagnose rogue persistence on SRV-DC01. Remediate all threats.',
    category: 'windows-admin',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'C:\\Operator> ',
    promptLabel: 'COMMAND PROMPT',

    notFoundMsg: '\'{cmd}\' is not recognized as an internal or external command.\nType "help" for available commands.',

    grid: {
        rows: 4,
        cols: 5,
        cells: [
            ['task-scheduler', 'services-panel', 'event-viewer', 'wall',            'wall'],
            ['empty',          'user-accounts',  'empty',         'registry-editor', 'wall'],
            ['wall',           'group-policy',   'empty',         'empty',           'network-shares'],
            ['wall',           'empty',          'startup-config','empty',           'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'task-scheduler': { label: 'TASK SCHEDULER', abbr: 'TSK', ip: 'SRV-DC01', desc: 'Windows Task Scheduler -- scheduled jobs & automation',          ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' },
        'services-panel': { label: 'SERVICES',        abbr: 'SVC', ip: 'SRV-DC01', desc: 'Service Control Manager -- running services list',               ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' },
        'event-viewer':   { label: 'EVENT VIEWER',    abbr: 'EVT', ip: 'SRV-DC01', desc: 'Windows Event Log -- Security/System/Application logs',          ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' },
        'user-accounts':  { label: 'USER ACCOUNTS',   abbr: 'USR', ip: 'SRV-DC01', desc: 'Local user & group management -- net user/localgroup',           ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' },
        'registry-editor':{ label: 'REGISTRY',        abbr: 'REG', ip: 'SRV-DC01', desc: 'Windows Registry -- system configuration and persistence store',  ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' },
        'group-policy':   { label: 'GROUP POLICY',    abbr: 'GPO', ip: 'SRV-DC01', desc: 'Group Policy Objects -- domain-wide security settings',           ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' },
        'network-shares': { label: 'NET SHARES',      abbr: 'NET', ip: 'SRV-DC01', desc: 'SMB network shares -- shared folders and drive mappings',         ports: ['445/SMB', '139/NetBIOS'], os: 'Windows Server 2022' },
        'startup-config': { label: 'STARTUP CONFIG',  abbr: 'STP', ip: 'SRV-DC01', desc: 'Boot configuration & startup programs -- msconfig/autoruns',      ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'rogue-task',       label: 'Find rogue task',             check: 'rogueTaskFound' },
        { id: 'stop-service',     label: 'Stop malicious service',     check: 'maliciousServiceStopped' },
        { id: 'disable-user',     label: 'Disable unauthorized user',  check: 'unauthorizedUserDisabled' },
        { id: 'verify-remediate', label: 'Verify remediation (logs)',  check: 'remediationVerified' }
    ],

    integrity: 3,

    completion: {
        title: 'BLUE SCREEN PROTOCOL',
        subtitle: 'SRV-DC01 is clean. Incident contained.',
        storageKey: 'hexworth_operator_windowscmd02'
    },

    briefing: [
        'SRV-DC01 triggered a blue-screen overnight.',
        'Automated recovery brought it back online,',
        'but persistence artifacts detected.',
        'Navigate admin panels. Diagnose threats.',
        'Remediate and verify via event logs.'
    ],

    commands: ['scan', 'move', 'schtasks', 'sc', 'net', 'wevtutil', 'reg', 'gpresult', 'status', 'help', 'clear'],

    customState: {
        rogueTaskFound: false,
        rogueTaskDisabled: false,
        serviceViewed: false,
        maliciousServiceStopped: false,
        userViewed: false,
        unauthorizedUserDisabled: false,
        remediationVerified: false
    },

    /* ================================================================
       terminalCommands -- all mission-specific + overridden commands
       Handlers receive (args, ctx) where ctx = { engine, state, config, agent }
       ================================================================ */
    terminalCommands: {

        // --- Override: scan (Windows-flavored output) ---
        'scan': {
            help: 'Survey area, reveal adjacent panels',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var col = s.position.col, row = s.position.row;
                var cellType = c.grid.cells[row][col];

                e.printLine('Scanning area...', 'system');
                e.printLine('', 'system');

                if (cellType !== 'empty' && cellType !== 'wall') {
                    var cur = c.nodes[cellType];
                    e.printLine('Current: ' + cur.label + ' (' + cur.ip + ')', 'heading');
                    e.printLine(cur.desc, 'info');
                    s.nodesDiscovered.add(cellType);
                } else {
                    e.printLine('Current: Corridor (no panel)', 'heading');
                }

                e.printLine('', 'system');
                e.printLine('Adjacent:', 'heading');

                var dirs = [{name:'North',dc:0,dr:-1},{name:'South',dc:0,dr:1},{name:'East',dc:1,dr:0},{name:'West',dc:-1,dr:0}];
                for (var i = 0; i < dirs.length; i++) {
                    var d = dirs[i], nc = col + d.dc, nr = row + d.dr;
                    if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) {
                        e.printLine('  ' + d.name + ': [edge]', 'system');
                        continue;
                    }
                    var type = c.grid.cells[nr][nc];
                    if (type === 'wall') { e.printLine('  ' + d.name + ': [blocked]', 'system'); continue; }
                    var key = nc + ',' + nr;
                    if (!s.visibility[key] || s.visibility[key] === 'hidden') s.visibility[key] = 'revealed';
                    if (type === 'empty') e.printLine('  ' + d.name + ': Corridor', 'info');
                    else e.printLine('  ' + d.name + ': ' + c.nodes[type].label, 'node-info');
                }

                e.updateGrid(); e.saveState();
            }
        },

        // --- Override: move (Windows-flavored output) ---
        'move': {
            help: 'Move to adjacent panel (north/south/east/west or n/s/e/w)',
            syntax: 'move <dir>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;

                if (!args.length) { e.printLine('Usage: move <direction>', 'error'); return; }

                var dirMap = {'north':[0,-1],'n':[0,-1],'south':[0,1],'s':[0,1],'east':[1,0],'e':[1,0],'west':[-1,0],'w':[-1,0]};
                var dir = args[0].toLowerCase();
                if (!dirMap[dir]) { e.printLine('Unknown direction: ' + args[0], 'error'); return; }

                var d = dirMap[dir], nc = s.position.col + d[0], nr = s.position.row + d[1];
                if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) { e.printLine('Edge of server. Cannot move ' + dir + '.', 'error'); return; }

                var cellType = c.grid.cells[nr][nc];
                if (cellType === 'wall') { e.printLine('Blocked. No path ' + dir + '.', 'error'); return; }

                s.position = { col: nc, row: nr };
                s.visibility[nc + ',' + nr] = 'visited';
                if (cellType !== 'empty') s.nodesDiscovered.add(cellType);
                e.revealAdjacent(nc, nr);

                var dirName = {n:'north',s:'south',e:'east',w:'west'}[dir] || dir;
                if (cellType === 'empty') e.printLine('Moving ' + dirName + '... Corridor.', 'system');
                else { var info = c.nodes[cellType]; e.printLine('Moving ' + dirName + '... ' + info.label, 'success'); e.printLine(info.desc, 'info'); }

                e.updateGrid(); e.saveState();
            }
        },

        // --- Override: status (Windows remediation-specific) ---
        'status': {
            help: 'Show server status and remediation progress',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                var posLabel = (cellType !== 'empty' && cellType !== 'wall') ? c.nodes[cellType].label : 'Corridor';

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 STATUS \u2550\u2550\u2550', 'heading');
                e.printLine('Server: SRV-DC01 (corp.hexworth.local)', 'info');
                e.printLine('Position: ' + posLabel, 'info');
                e.printLine('Panels accessed: ' + s.nodesDiscovered.size + ' / 8', 'info');
                e.printLine('Commands used: ' + s.agentCmdCount, 'info');
                e.printLine('', 'system');
                e.printLine('Remediation Status:', 'heading');
                e.printLine('  Rogue task:    ' + (s.rogueTaskDisabled ? 'DISABLED' : s.rogueTaskFound ? 'FOUND' : 'UNKNOWN'), s.rogueTaskDisabled ? 'success' : 'system');
                e.printLine('  Mal. service:  ' + (s.maliciousServiceStopped ? 'STOPPED' : 'RUNNING'), s.maliciousServiceStopped ? 'success' : 'warning');
                e.printLine('  Unauth user:   ' + (s.unauthorizedUserDisabled ? 'DISABLED' : 'ACTIVE'), s.unauthorizedUserDisabled ? 'success' : 'warning');
                e.printLine('  Verified:      ' + (s.remediationVerified ? 'YES' : 'PENDING'), s.remediationVerified ? 'success' : 'system');
            }
        },

        // --- schtasks: enumerate/disable scheduled tasks ---
        'schtasks': {
            help: 'List/disable scheduled tasks [TASK SCHEDULER]',
            syntax: 'schtasks [/disable]',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];

                if (cellType !== 'task-scheduler') { e.printLine('schtasks: must be at TASK SCHEDULER panel.', 'error'); return; }

                if (args.length > 0 && args[0].toLowerCase() === '/disable') {
                    if (!s.rogueTaskFound) { e.printLine('schtasks /disable: Run "schtasks" first to enumerate tasks.', 'warning'); return; }
                    if (s.rogueTaskDisabled) { e.printLine('Task \\Custom\\SyncUpdate is already disabled.', 'info'); return; }
                    e.printLine('', 'system');
                    e.printLine('Disabling scheduled task \\Custom\\SyncUpdate...', 'system');
                    e.printLine('SUCCESS: The operation completed successfully.', 'success');
                    e.printLine('Task \\Custom\\SyncUpdate set to DISABLED.', 'success');
                    s.rogueTaskDisabled = true;
                    e.checkObjectives(); e.updateGrid(); e.saveState();
                    return;
                }

                e.printLine('', 'system');
                e.printLine('schtasks /query /fo TABLE /nh', 'system');
                e.printLine('', 'system');
                e.printLine('TaskName                    Status    Next Run', 'heading');
                e.printLine('\\Microsoft\\Windows\\Defrag   Ready     03/10/2026 02:00', 'node-info');
                e.printLine('\\Maintenance\\DiskCleanup    Ready     03/06/2026 01:00', 'node-info');
                e.printLine('\\Custom\\SyncUpdate          Ready     Every 15 min', 'warning');
                e.printLine('\\Microsoft\\Windows\\Backup   Ready     03/06/2026 03:00', 'node-info');
                e.printLine('', 'system');
                e.printLine('[!] SUSPICIOUS: \\Custom\\SyncUpdate runs every 15 minutes -- unusual frequency.', 'warning');
                e.printLine('[!] Non-standard path. Publisher: Unknown. Created: 03/05/2026 03:12', 'warning');
                e.printLine('', 'system');
                e.printLine('Use "schtasks /disable" to disable the rogue task.', 'info');
                s.rogueTaskFound = true;
                e.checkObjectives(); e.saveState();
            }
        },

        // --- sc: enumerate/stop services ---
        'sc': {
            help: 'List/stop services [SERVICES]',
            syntax: 'sc [stop ...]',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];

                if (cellType !== 'services-panel') { e.printLine('sc: must be at SERVICES panel.', 'error'); return; }

                if (args.length > 0 && args[0].toLowerCase() === 'stop') {
                    if (!s.serviceViewed) { e.printLine('sc stop: Run "sc" first to enumerate services.', 'warning'); return; }
                    if (s.maliciousServiceStopped) { e.printLine('sysmonitor_x64 is already stopped.', 'info'); return; }
                    e.printLine('', 'system');
                    e.printLine('[SC] StopService: sysmonitor_x64', 'system');
                    e.printLine('SERVICE_NAME: sysmonitor_x64', 'heading');
                    e.printLine('        STATE              : 1  STOPPED', 'success');
                    e.printLine('[+] sysmonitor_x64 terminated. Binary: C:\\ProgramData\\svchost64.exe', 'success');
                    s.maliciousServiceStopped = true;
                    e.checkObjectives(); e.updateGrid(); e.saveState();
                    return;
                }

                e.printLine('', 'system');
                e.printLine('sc query type= all state= all', 'system');
                e.printLine('', 'system');
                e.printLine('SERVICE_NAME        STATE          DISPLAY_NAME', 'heading');
                e.printLine('wuauserv           RUNNING        Windows Update', 'node-info');
                e.printLine('WinRM              RUNNING        WS-Management', 'node-info');
                e.printLine('sysmonitor_x64     RUNNING        System Monitor Helper', 'warning');
                e.printLine('W32Time            RUNNING        Windows Time', 'node-info');
                e.printLine('', 'system');
                e.printLine('[!] SUSPICIOUS: sysmonitor_x64 -- not a known Windows service.', 'warning');
                e.printLine('[!] Binary: C:\\ProgramData\\svchost64.exe', 'warning');
                e.printLine('Use "sc stop sysmonitor_x64" to terminate.', 'info');
                s.serviceViewed = true;
                e.saveState();
            }
        },

        // --- net: enumerate/disable user accounts ---
        'net': {
            help: 'List/disable users [USER ACCOUNTS]',
            syntax: 'net [user ... /active:no]',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];

                if (cellType !== 'user-accounts') { e.printLine('net: must be at USER ACCOUNTS panel.', 'error'); return; }

                var fullCmd = args.join(' ').toLowerCase();
                if (fullCmd.indexOf('active:no') !== -1 || fullCmd.indexOf('svc_backup') !== -1) {
                    if (!s.userViewed) { e.printLine('net user: Run "net" first to enumerate accounts.', 'warning'); return; }
                    if (s.unauthorizedUserDisabled) { e.printLine('svc_backup is already disabled.', 'info'); return; }
                    e.printLine('', 'system');
                    e.printLine('net user svc_backup /active:no', 'system');
                    e.printLine('The command completed successfully.', 'success');
                    e.printLine('[+] Account svc_backup set to INACTIVE.', 'success');
                    s.unauthorizedUserDisabled = true;
                    e.checkObjectives(); e.updateGrid(); e.saveState();
                    return;
                }

                e.printLine('', 'system');
                e.printLine('net user', 'system');
                e.printLine('', 'system');
                e.printLine('User Name              Status    Last Logon', 'heading');
                e.printLine('Administrator          Active    03/05/2026 14:22', 'node-info');
                e.printLine('svc_sql                Active    03/04/2026 08:00', 'node-info');
                e.printLine('svc_backup             Active    03/05/2026 03:14', 'warning');
                e.printLine('Guest                  Disabled  Never', 'node-info');
                e.printLine('', 'system');
                e.printLine('[!] SUSPICIOUS: svc_backup -- created 03/05/2026 at 03:14.', 'warning');
                e.printLine('Use "net user svc_backup /active:no" to disable.', 'info');
                s.userViewed = true;
                e.saveState();
            }
        },

        // --- wevtutil: view event logs and verify remediation ---
        'wevtutil': {
            help: 'View event logs [EVENT VIEWER]',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];

                if (cellType !== 'event-viewer') { e.printLine('wevtutil: must be at EVENT VIEWER panel.', 'error'); return; }

                e.printLine('', 'system');
                e.printLine('wevtutil qe Security /c:10 /rd:true /f:text', 'system');
                e.printLine('', 'system');
                e.printLine('Event ID  Level    Source          Message', 'heading');
                e.printLine('4624      Info     Security        Logon success -- Administrator', 'node-info');
                e.printLine('4625      Warning  Security        Logon failure -- svc_backup (3 attempts)', 'warning');
                e.printLine('4720      Warning  Security        New user created: svc_backup', 'warning');
                e.printLine('4688      Info     Security        Process created: svchost64.exe (PID 4892)', 'warning');
                e.printLine('7045      Warning  System          Service installed: sysmonitor_x64', 'warning');
                e.printLine('', 'system');

                if (s.rogueTaskDisabled && s.maliciousServiceStopped && s.unauthorizedUserDisabled) {
                    e.printLine('Checking for post-remediation events...', 'system');
                    e.printLine('', 'system');
                    e.printLine('4689      Info     Security        Process terminated: svchost64.exe', 'success');
                    e.printLine('7036      Info     System          Service stopped: sysmonitor_x64', 'success');
                    e.printLine('4725      Info     Security        Account disabled: svc_backup', 'success');
                    e.printLine('4702      Info     Security        Scheduled task disabled: \\Custom\\SyncUpdate', 'success');
                    e.printLine('', 'system');
                    e.printLine('[+] All remediation events confirmed in event log.', 'success');
                    s.remediationVerified = true;
                } else {
                    e.printLine('[!] Threat indicators still active. Complete all remediation steps first:', 'warning');
                    if (!s.rogueTaskDisabled) e.printLine('    [ ] Disable rogue scheduled task (schtasks /disable)', 'system');
                    if (!s.maliciousServiceStopped) e.printLine('    [ ] Stop malicious service (sc stop sysmonitor_x64)', 'system');
                    if (!s.unauthorizedUserDisabled) e.printLine('    [ ] Disable unauthorized user (net user svc_backup /active:no)', 'system');
                    e.printLine('', 'system');
                    e.printLine('Return here after completing all actions to verify.', 'info');
                }

                e.checkObjectives(); e.saveState();
            }
        },

        // --- reg: view registry run keys ---
        'reg': {
            help: 'View registry [REGISTRY]',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];

                if (cellType !== 'registry-editor') { e.printLine('reg: must be at REGISTRY panel.', 'error'); return; }

                e.printLine('', 'system');
                e.printLine('reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run', 'system');
                e.printLine('', 'system');
                e.printLine('    WindowsUpdate    REG_SZ    C:\\ProgramData\\svchost64.exe', 'warning');
                e.printLine('    SecurityHealth   REG_SZ    C:\\Program Files\\Windows Defender\\...', 'node-info');
                e.printLine('', 'system');
                e.printLine('[!] SUSPICIOUS: "WindowsUpdate" key points to C:\\ProgramData\\svchost64.exe', 'warning');
                s.nodesDiscovered.add('registry-editor');
                e.saveState();
            }
        },

        // --- gpresult: view group policy ---
        'gpresult': {
            help: 'View GPOs [GROUP POLICY]',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];

                if (cellType !== 'group-policy') { e.printLine('gpresult: must be at GROUP POLICY panel.', 'error'); return; }

                e.printLine('', 'system');
                e.printLine('gpresult /r', 'system');
                e.printLine('', 'system');
                e.printLine('Applied Group Policy Objects', 'heading');
                e.printLine('    Default Domain Policy', 'node-info');
                e.printLine('    Server Hardening Baseline', 'node-info');
                e.printLine('    Audit Policy -- Enhanced', 'node-info');
                e.printLine('', 'system');
                e.printLine('[*] GPO audit policy is active -- all actions are logged.', 'info');
                s.nodesDiscovered.add('group-policy');
                e.saveState();
            }
        }
    }
};
