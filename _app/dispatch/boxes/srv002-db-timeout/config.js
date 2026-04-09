/* ============================================================
   DISPATCH LAB — Box SRV002: Database Connection Timeout
   Server Troubleshooting — SQL Server connectivity issues
   Config: database state, Windows commands, GUI, scenarios
   5 distinct scenarios: SQL stopped, wrong server name,
   firewall blocking 1433, connection pool exhausted, deadlock
   ============================================================ */

var SRV002Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Database Connection Timeout',
    subtitle: 'The App Can\'t Talk to the Database — Server Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#6366f1',
    storageKey: 'hexworth_lab_srv002',
    registryId: 'srv002-db-timeout',
    trackerKey: 'lab_srv002',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Help Desk Ticket',
                tip: 'Double-click the Help Desk Ticket icon to read the incident report.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Check SQL Server service status',
                tip: 'Use sc query, SQL Server Configuration Manager, or Services to verify SQL Server is running.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:mssqlserver' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:sqlcmd' } },
                        { event: 'command', match: { cmd: 'contains:1433' } },
                        { event: 'window_open', match: { type: 'sql_config' } }
                    ]
                }
            },
            {
                title: 'Investigate the root cause',
                tip: 'Test connectivity with sqlcmd, check port 1433, verify the connection string, or look for deadlocks.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:netstat' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:telnet' } },
                        { event: 'command', match: { cmd: 'contains:sqlcmd' } },
                        { event: 'window_open', match: { type: 'event_viewer' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Start the SQL service, fix the connection string, open the firewall port, kill blocking sessions, or increase pool size.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:start' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:netsh' } },
                        { event: 'command', match: { cmd: 'contains:kill' } }
                    ]
                }
            },
            {
                title: 'Capture the flag',
                tip: 'After fixing the database connection, the recovery token appears in the diagnostic tool.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES
    // ==========================================================

    certObjectives: {
        certPath: 'Network+',
        mappings: [
            { flagId: 'fixed', objective: '5.3', description: 'Given a scenario, use the appropriate network software tools and commands', skill: 'Database Connectivity Troubleshooting' },
            { flagId: 'fixed', objective: '5.5', description: 'Given a scenario, troubleshoot general networking issues', skill: 'SQL Server Service Management' }
        ]
    },

    // ==========================================================
    // SERVER DATA
    // ==========================================================

    _servers: [
        { name: 'DB-PROD-01', ip: '10.0.2.10', os: 'Windows Server 2022', role: 'SQL Server 2022', service: 'MSSQLSERVER' },
        { name: 'APP-PROD-01', ip: '10.0.1.20', os: 'Windows Server 2022', role: 'Application Server', service: 'W3SVC' }
    ],

    // ==========================================================
    // SCENARIO FLAGS
    // ==========================================================

    _scenarioFlags: {
        sql_stopped:      null,
        wrong_server:     null,
        firewall_block:   null,
        pool_exhausted:   null,
        deadlock:         null
    },

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            id: 'sql_stopped',
            name: 'SQL Server Service Stopped',
            ticketSubject: 'Application throwing "Cannot connect to SQL Server" — all users affected',
            ticketDetail: 'The HR application is down for every user. The error message says "A network-related or instance-specific error occurred while establishing a connection to SQL Server. The server was not found or was not accessible." This started around 3 AM. The application worked fine yesterday.',
            ticketExtra: 'DBA Note: Windows Update applied patches to DB-PROD-01 overnight and required a reboot. The SQL Server service startup type may have been changed during the update.',
            affectedServer: 0,
            fixDescription: 'Start the SQL Server (MSSQLSERVER) service',
            stateOverrides: { _sqlRunning: false }
        },
        {
            id: 'wrong_server',
            name: 'Wrong Server Name in Connection String',
            ticketSubject: 'New deployment cannot connect to database — "server not found"',
            ticketDetail: 'After the latest deployment, the payroll application cannot connect to the database. The error is "A network-related or instance-specific error occurred: server was not found." The old version worked fine. Only this specific application is affected — other apps connecting to the same SQL Server work perfectly.',
            ticketExtra: 'DevOps Note: The deployment pipeline updated web.config with connection strings from the staging environment template. The staging SQL server name is DB-STAGE-01, but production uses DB-PROD-01.',
            affectedServer: 0,
            fixDescription: 'Correct the connection string server name from DB-STAGE-01 to DB-PROD-01',
            stateOverrides: { _wrongServerName: true, _sqlRunning: true }
        },
        {
            id: 'firewall_block',
            name: 'Firewall Blocking Port 1433',
            ticketSubject: 'Remote application server cannot reach database — connection timeout',
            ticketDetail: 'The application server APP-PROD-01 at 10.0.1.20 cannot connect to the database on DB-PROD-01 at 10.0.2.10. The connection times out after 30 seconds. The SQL Server is running and local connections on DB-PROD-01 work fine. Only remote connections fail.',
            ticketExtra: 'Security Note: A firewall hardening script was executed on DB-PROD-01 at 2:00 AM as part of the quarterly security review. The script may have been overly aggressive in blocking inbound ports.',
            affectedServer: 0,
            fixDescription: 'Add a Windows Firewall rule to allow inbound TCP 1433 for SQL Server',
            stateOverrides: { _firewallBlocking1433: true, _sqlRunning: true }
        },
        {
            id: 'pool_exhausted',
            name: 'Connection Pool Exhausted',
            ticketSubject: 'Intermittent "Timeout expired" errors — getting worse over time',
            ticketDetail: 'Users are seeing "Timeout expired. The timeout period elapsed prior to obtaining a connection from the pool." The errors started sporadically an hour ago and now happen on almost every request. The SQL Server is running and accepting connections, but something is consuming all available connections.',
            ticketExtra: 'DBA Note: The connection pool monitor shows 200/200 connections in use on DB-PROD-01. sp_who2 shows 187 sleeping connections from APP-PROD-01. The application may not be closing connections properly after the latest deployment.',
            affectedServer: 0,
            fixDescription: 'Kill sleeping connections and recycle the application pool to reset the connection pool',
            stateOverrides: { _poolExhausted: true, _sqlRunning: true }
        },
        {
            id: 'deadlock',
            name: 'Deadlock Blocking Queries',
            ticketSubject: 'Database queries hanging indefinitely — application frozen',
            ticketDetail: 'The inventory application is completely frozen. Queries are taking forever and eventually timing out. Multiple users report that the application just spins. The SQL Server is running but something is blocking all queries. This started after the batch import job kicked off at 6:00 AM.',
            ticketExtra: 'DBA Note: SQL Server deadlock graph detected at 06:12 AM. SPID 78 (batch import) and SPID 92 (inventory update) are in a deadlock cycle. SPID 78 is holding an exclusive lock on the Inventory table while waiting for the Orders table. SPID 92 holds Orders and wants Inventory.',
            affectedServer: 0,
            fixDescription: 'Kill the blocking SPID to break the deadlock cycle',
            stateOverrides: { _deadlockActive: true, _sqlRunning: true }
        }
    ],

    // ==========================================================
    // PER-SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Check if SQL Server is running using sc query MSSQLSERVER.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Test port 1433 connectivity with telnet or Test-NetConnection.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Check the connection string, firewall rules, and active sessions.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears in the diagnostic tool after you fix the issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        sql_stopped: [
            { id: 'hint1', text: 'The error says the server is not accessible. Check if the SQL Server service is actually running.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "sc query MSSQLSERVER" — the service shows as Stopped. It did not restart after the Windows Update reboot.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Start the service with "net start MSSQLSERVER" or "sc start MSSQLSERVER".', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Full fix: net start MSSQLSERVER, then verify with sqlcmd -S localhost -Q "SELECT 1". Set startup type to Automatic: sc config MSSQLSERVER start=auto', cost: 150, penalty: -150 }
        ],
        wrong_server: [
            { id: 'hint1', text: 'Only one application is affected. Other apps connect fine. The issue is in the application config, not the server.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check the connection string in web.config. The server name is wrong — it points to DB-STAGE-01 instead of DB-PROD-01.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Update the connection string: change "Server=DB-STAGE-01" to "Server=DB-PROD-01" in the application config.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: Edit C:\\inetpub\\payroll\\web.config, change Server=DB-STAGE-01 to Server=DB-PROD-01, then recycle the app pool with "appcmd recycle apppool /apppool.name:PayrollAppPool".', cost: 150, penalty: -150 }
        ],
        firewall_block: [
            { id: 'hint1', text: 'Local connections work but remote connections fail. This points to a network-level block, likely a firewall.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Test with "telnet 10.0.2.10 1433" from APP-PROD-01 — it times out. Locally on DB-PROD-01, "telnet localhost 1433" works.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The Windows Firewall is blocking inbound TCP 1433. Add an allow rule with netsh advfirewall.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=tcp localport=1433. Then test: telnet 10.0.2.10 1433 from the app server.', cost: 150, penalty: -150 }
        ],
        pool_exhausted: [
            { id: 'hint1', text: 'The error says "Timeout expired prior to obtaining a connection from the pool." The pool is full, not the server.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run sp_who2 or "sqlcmd -Q "SELECT COUNT(*) FROM sys.dm_exec_sessions"" — 200 connections are open, all sleeping.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Kill the sleeping sessions. Use "KILL <spid>" for the zombie connections, then recycle the app pool.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: sqlcmd -Q "EXEC sp_who2" to find sleeping SPIDs, then "KILL 55" (etc). Recycle app pool: appcmd recycle apppool /apppool.name:PayrollAppPool to reset the client-side pool.', cost: 150, penalty: -150 }
        ],
        deadlock: [
            { id: 'hint1', text: 'Queries are hanging, not failing immediately. Something is blocking them. Check for locks and deadlocks.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run sp_who2 or check sys.dm_exec_requests — SPID 78 and SPID 92 are blocking each other (deadlock).', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Kill one of the deadlocked SPIDs to break the cycle. SPID 78 (batch import) is the better candidate since it can be re-run.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: sqlcmd -Q "KILL 78" to break the deadlock. Then verify with sp_who2 that SPID 92 is no longer blocked. The batch import can be restarted later.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SRV002Config._flagRestored) {
            SRV002Config._flagRestored = true;
            var scenario = SRV002Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                SRV002Config.hints = SRV002Config._scenarioHints[scenario.id] || SRV002Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;

        engine.state._sqlRunning = true;
        engine.state._wrongServerName = false;
        engine.state._firewallBlocking1433 = false;
        engine.state._poolExhausted = false;
        engine.state._deadlockActive = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        var overrides = SRV002Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) {
            engine.state[key] = overrides[key];
        }

        var scenario = SRV002Config._scenarios[idx];
        SRV002Config._flagRestored = true;
        SRV002Config.hints = SRV002Config._scenarioHints[scenario.id] || SRV002Config._defaultHints;

        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return SRV002Config._scenarios[engine.state._scenarioId];
    },

    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first to receive your assignment.';
        }
        return null;
    },

    _escHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // ==========================================================
    // BOOT SEQUENCE
    // ==========================================================

    boot: {
        biosLines: [
            'Dell PowerEdge R750 UEFI BIOS v2.12.2',
            'Initializing hardware...',
            'Memory Test: 131072 MB OK',
            'Detecting drives... NVMe: Samsung PM9A3 (1.92TB) x4 RAID-10',
            'Network: Broadcom BCM5720 Dual-Port 1GbE',
            'iDRAC9 Enterprise detected',
            'Boot device: Virtual Disk 0',
            'Loading Windows Server 2022...'
        ],
        grubEntries: [
            'Windows Server 2022',
            'Windows Recovery Environment'
        ],
        loginUser: 'Administrator'
    },

    // ==========================================================
    // DESKTOP ICONS
    // ==========================================================

    desktop: {
        icons: [
            { id: 'cmd',          label: 'Command\nPrompt',       icon: '>_',  app: 'terminal' },
            { id: 'sql_config',   label: 'SQL Server\nConfig',    icon: 'SQL', app: 'sql_config' },
            { id: 'event_viewer', label: 'Event\nViewer',         icon: 'EVT', app: 'event_viewer' },
            { id: 'services',     label: 'Services',              icon: 'SVC', app: 'services' },
            { id: 'firewall',     label: 'Windows\nFirewall',     icon: 'FW',  app: 'firewall' },
            { id: 'ticket',       label: 'Help Desk\nTicket',     icon: 'HD',  app: 'ticket' },
            { id: 'hints',        label: 'Hints',                 icon: '?',   app: 'hints' },
            { id: 'reset',        label: 'Reset\nLab',            icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG
    // ==========================================================

    terminal: {
        user: 'Administrator',
        hostname: 'DB-PROD-01',
        startDir: 'C:\\Users\\Administrator',
        promptStyle: 'windows',
        welcome: 'Microsoft Windows [Version 10.0.20348.2340]\n(c) Microsoft Corporation. All rights reserved.\n'
    },

    filesystem: { '/': { type: 'dir', children: {} } },

    flags: [
        { id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }
    ],

    scoring: {
        base: 0,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 },
        timeBonusThreshold: 1800
    },

    hints: [
        { id: 'hint1', text: 'Check if SQL Server is running.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Test port 1433 connectivity.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Check the connection string, firewall, and active sessions.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],

    lore: {
        intro: 'The application is throwing database connection errors. Users cannot access critical business systems. As the DBA, diagnose the SQL Server connectivity failure and restore service.',
        scenario: 'Database connectivity can fail for many reasons — stopped services, bad connection strings, firewall rules, exhausted connection pools, or deadlocks. Each scenario has a different root cause.',
        outro: 'Database connectivity restored. Applications are communicating with SQL Server again. Your systematic approach identified and resolved the connectivity failure.'
    },

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the incident ticket and check SQL Server status.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the root cause — service, config, firewall, pool, or deadlock.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the correct fix to restore database connectivity.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm the database is accessible and capture the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // CUSTOM COMMANDS
    // ==========================================================

    commands: {

        sc: function(args, term, engine) {
            var gate = SRV002Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('query') && joined.includes('mssqlserver')) {
                var running = engine.state._sqlRunning;
                return '\nSERVICE_NAME: MSSQLSERVER\n        TYPE               : 10  WIN32_OWN_PROCESS\n        STATE              : ' + (running ? '4  RUNNING\n                                (STOPPABLE, PAUSABLE, ACCEPTS_SHUTDOWN)' : '1  STOPPED\n                                (NOT_STOPPABLE, NOT_PAUSABLE, IGNORES_SHUTDOWN)') + '\n        WIN32_EXIT_CODE    : 0  (0x0)\n        SERVICE_EXIT_CODE  : 0  (0x0)\n        CHECKPOINT         : 0x0\n        WAIT_HINT          : 0x0';
            }
            if (joined.includes('start') && joined.includes('mssqlserver')) {
                if (engine.state._sqlRunning) return '\n[SC] StartService FAILED 1056:\nAn instance of the service is already running.';
                engine.state._sqlRunning = true;
                engine.save();
                var scenario = SRV002Config._getScenario(engine);
                if (scenario && scenario.id === 'sql_stopped' && !engine.state._flagRevealed) {
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('SQL Server started. Database is accessible. Check SQL Server Config for the recovery token.', 'success'); }, 400);
                }
                return '\n[SC] StartService SUCCESS';
            }
            if (joined.includes('config') && joined.includes('mssqlserver') && joined.includes('auto')) {
                return '\n[SC] ChangeServiceConfig SUCCESS\nStartup type changed to Automatic.';
            }
            return '\nUsage: sc query <service_name>\n       sc start <service_name>\nExample: sc query MSSQLSERVER';
        },

        net: function(args, term, engine) {
            var gate = SRV002Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV002Config._getScenario(engine);

            if (joined.includes('start') && joined.includes('mssqlserver')) {
                if (engine.state._sqlRunning) return '\nThe requested service has already been started.';
                engine.state._sqlRunning = true;
                engine.save();
                if (scenario && scenario.id === 'sql_stopped' && !engine.state._flagRevealed) {
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('SQL Server started successfully. Check SQL Server Config for the recovery token.', 'success'); }, 400);
                }
                return '\nThe SQL Server (MSSQLSERVER) service is starting.\nThe SQL Server (MSSQLSERVER) service was started successfully.';
            }
            if (joined.includes('stop') && joined.includes('mssqlserver')) {
                engine.state._sqlRunning = false;
                engine.save();
                return '\nThe SQL Server (MSSQLSERVER) service was stopped successfully.';
            }
            return '\nUsage: net start MSSQLSERVER\n       net stop MSSQLSERVER';
        },

        sqlcmd: function(args, term, engine) {
            var gate = SRV002Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV002Config._getScenario(engine);

            if (!engine.state._sqlRunning) {
                return '\nSqlcmd: Error: Microsoft SQL Server: A network-related or instance-specific error\noccurred while establishing a connection to SQL Server. The server was not found\nor was not accessible. Verify that the instance name is correct and that SQL Server\nis configured to allow remote connections. (provider: TCP Provider, error: 0 -\nNo connection could be made because the target machine actively refused it.)';
            }

            // sp_who2
            if (joined.includes('sp_who2') || joined.includes('sp_who')) {
                if (engine.state._deadlockActive) {
                    return '\nSPID  Status      Login         HostName     BlkBy  DBName    Command\n----  ----------  ------------  -----------  -----  --------  ----------------\n51    sleeping    app_svc       APP-PROD-01  .      HRData    AWAITING COMMAND\n52    sleeping    app_svc       APP-PROD-01  .      HRData    AWAITING COMMAND\n78    suspended   batch_svc     DB-PROD-01   92     HRData    INSERT\n92    suspended   app_svc       APP-PROD-01  78     HRData    UPDATE\n95    runnable    app_svc       APP-PROD-01  78     HRData    SELECT\n96    runnable    app_svc       APP-PROD-01  78     HRData    SELECT\n97    runnable    app_svc       APP-PROD-01  78     HRData    SELECT';
                }
                if (engine.state._poolExhausted) {
                    var lines = '\nSPID  Status      Login         HostName     BlkBy  DBName    Command\n----  ----------  ------------  -----------  -----  --------  ----------------\n';
                    for (var i = 51; i <= 250; i++) {
                        lines += i + '    sleeping    app_svc       APP-PROD-01  .      HRData    AWAITING COMMAND\n';
                        if (i > 55) { lines += '... (187 more sleeping connections)\n'; break; }
                    }
                    return lines;
                }
                return '\nSPID  Status      Login         HostName     BlkBy  DBName    Command\n----  ----------  ------------  -----------  -----  --------  ----------------\n51    sleeping    app_svc       APP-PROD-01  .      HRData    AWAITING COMMAND\n52    sleeping    app_svc       APP-PROD-01  .      HRData    AWAITING COMMAND';
            }

            // KILL command
            if (joined.includes('kill')) {
                var spidMatch = joined.match(/kill\s+(\d+)/);
                if (spidMatch) {
                    var spid = parseInt(spidMatch[1]);
                    if (scenario && scenario.id === 'deadlock' && (spid === 78 || spid === 92)) {
                        engine.state._deadlockActive = false;
                        engine.save();
                        if (!engine.state._flagRevealed) {
                            engine.state._flagRevealed = true;
                            engine.state._labComplete = true;
                            engine.save();
                            setTimeout(function() { engine.notify('Deadlock broken. SPID ' + spid + ' killed. Blocked queries are now executing. Check SQL Server Config for the recovery token.', 'success'); }, 400);
                        }
                        return '\nCommand(s) completed successfully.\nSPID ' + spid + ' has been killed. Deadlock cycle broken.';
                    }
                    if (scenario && scenario.id === 'pool_exhausted' && spid >= 51) {
                        engine.state._poolExhausted = false;
                        engine.save();
                        if (!engine.state._flagRevealed) {
                            engine.state._flagRevealed = true;
                            engine.state._labComplete = true;
                            engine.save();
                            setTimeout(function() { engine.notify('Sleeping connections killed. Connection pool freed. Check SQL Server Config for the recovery token.', 'success'); }, 400);
                        }
                        return '\nCommand(s) completed successfully.\n187 sleeping connections terminated. Connection pool freed.';
                    }
                    return '\nCommand(s) completed successfully.';
                }
            }

            // SELECT count sessions
            if (joined.includes('dm_exec_sessions') || joined.includes('count')) {
                var count = engine.state._poolExhausted ? 200 : engine.state._deadlockActive ? 7 : 2;
                return '\n-----------\n' + count + '\n\n(1 rows affected)';
            }

            // SELECT 1 test
            if (joined.includes('select 1') || joined.includes('select @@version')) {
                return '\n-----------\n1\n\n(1 rows affected)';
            }

            // Connection string check
            if (joined.includes('db-stage-01') || joined.includes('stage')) {
                return '\nSqlcmd: Error: Microsoft SQL Server: A network-related or instance-specific error\noccurred while establishing a connection to SQL Server.\nServer \'DB-STAGE-01\' was not found. Check the server name in your connection string.';
            }

            return '\nUsage:\n    sqlcmd -S <server> -Q "<query>"\n    sqlcmd -S localhost -Q "SELECT 1"\n    sqlcmd -S localhost -Q "EXEC sp_who2"\n    sqlcmd -Q "KILL <spid>"';
        },

        telnet: function(args, term, engine) {
            var gate = SRV002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SRV002Config._getScenario(engine);

            if (args.length >= 2) {
                var host = args[0];
                var port = args[1];

                if (port === '1433') {
                    if (!engine.state._sqlRunning) {
                        return '\nConnecting To ' + host + '...Could not open connection to the host, on port 1433: Connect failed';
                    }
                    if (engine.state._firewallBlocking1433 && (host === '10.0.2.10' || host === 'DB-PROD-01')) {
                        return '\nConnecting To ' + host + '...\n\nConnection timed out after 30 seconds.\nThe firewall may be blocking port 1433.';
                    }
                    if (host === 'localhost' || host === '127.0.0.1' || host === '10.0.2.10' || host === 'DB-PROD-01') {
                        return '\nConnecting To ' + host + '...\nConnected to ' + host + '.\nSQL Server is listening on port 1433.\n\nConnection to host closed.';
                    }
                    if (host === 'DB-STAGE-01') {
                        return '\nConnecting To DB-STAGE-01...Could not open connection to the host, on port 1433: Connect failed\n\nNote: DB-STAGE-01 is the staging server. Production is DB-PROD-01.';
                    }
                }
            }
            return '\nUsage: telnet <hostname> <port>\nExample: telnet 10.0.2.10 1433';
        },

        netstat: function(args, term, engine) {
            var gate = SRV002Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var running = engine.state._sqlRunning;

            var lines = '\nActive Connections\n\n  Proto  Local Address          Foreign Address        State\n';
            if (running) {
                lines += '  TCP    0.0.0.0:1433           0.0.0.0:0              LISTENING\n';
            }
            lines += '  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING\n';
            lines += '  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING\n';
            lines += '  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING\n';

            if (running && engine.state._poolExhausted) {
                lines += '  TCP    10.0.2.10:1433         10.0.1.20:49152        ESTABLISHED\n';
                lines += '  TCP    10.0.2.10:1433         10.0.1.20:49153        ESTABLISHED\n';
                lines += '  ... (200 total connections from 10.0.1.20)\n';
            }

            if (joined.includes('findstr') && joined.includes('1433')) {
                if (running) {
                    var result = '\n  TCP    0.0.0.0:1433           0.0.0.0:0              LISTENING';
                    if (engine.state._poolExhausted) {
                        result += '\n  TCP    10.0.2.10:1433         10.0.1.20:49152        ESTABLISHED\n  ... (200 ESTABLISHED connections)';
                    }
                    return result;
                }
                return '\n(No matching entries found for port 1433)';
            }
            return lines;
        },

        netsh: function(args, term, engine) {
            var gate = SRV002Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV002Config._getScenario(engine);

            if (joined.includes('advfirewall') && joined.includes('1433')) {
                if (joined.includes('add') && joined.includes('rule')) {
                    if (scenario && scenario.id === 'firewall_block') {
                        engine.state._firewallBlocking1433 = false;
                        engine.save();
                        if (!engine.state._flagRevealed) {
                            engine.state._flagRevealed = true;
                            engine.state._labComplete = true;
                            engine.save();
                            setTimeout(function() { engine.notify('Firewall rule added. Port 1433 is now open. Remote connections should work. Check SQL Server Config for the recovery token.', 'success'); }, 400);
                        }
                        return '\nOk.\nRule "SQL Server" added successfully.';
                    }
                    return '\nOk.\nRule added (no effect — port was already open).';
                }
                if (joined.includes('show') || joined.includes('list')) {
                    if (engine.state._firewallBlocking1433) {
                        return '\nNo rules matching port 1433 found.\nInbound TCP 1433 is BLOCKED by default deny.';
                    }
                    return '\nRule Name:                    SQL Server\nEnabled:                      Yes\nDirection:                    In\nAction:                       Allow\nLocal Port:                   1433';
                }
            }

            if (joined.includes('show') && joined.includes('firewall')) {
                return '\nDomain Profile Settings:\n    State                                 ON\n    Firewall Policy                       BlockInbound,AllowOutbound\n    Inbound connections                   Block\n\nStandard Profile Settings:\n    State                                 ON\n    Firewall Policy                       BlockInbound,AllowOutbound';
            }

            return '\nUsage:\n    netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=tcp localport=1433\n    netsh advfirewall firewall show rule name="SQL Server"';
        },

        // Connection string fix
        type: function(args, term, engine) {
            var gate = SRV002Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV002Config._getScenario(engine);

            if (joined.includes('web.config') || joined.includes('connectionstring')) {
                if (scenario && scenario.id === 'wrong_server') {
                    return '\n<?xml version="1.0" encoding="utf-8"?>\n<configuration>\n  <connectionStrings>\n    <add name="HRData"\n         connectionString="Server=DB-STAGE-01;Database=HRData;User Id=app_svc;Password=***;"\n         providerName="System.Data.SqlClient" />\n  </connectionStrings>\n</configuration>\n\nWARNING: Connection string points to DB-STAGE-01 (staging server).\nProduction server is DB-PROD-01.';
                }
                return '\n<?xml version="1.0" encoding="utf-8"?>\n<configuration>\n  <connectionStrings>\n    <add name="HRData"\n         connectionString="Server=DB-PROD-01;Database=HRData;User Id=app_svc;Password=***;"\n         providerName="System.Data.SqlClient" />\n  </connectionStrings>\n</configuration>';
            }
            return '\nUsage: type <filename>\nExample: type C:\\inetpub\\payroll\\web.config';
        },

        appcmd: function(args, term, engine) {
            var gate = SRV002Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV002Config._getScenario(engine);

            if (joined.includes('recycle') && joined.includes('apppool')) {
                if (scenario && scenario.id === 'pool_exhausted' && !engine.state._flagRevealed) {
                    engine.state._poolExhausted = false;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('App pool recycled. Connection pool reset. Check SQL Server Config for the recovery token.', 'success'); }, 400);
                }
                return '\nAPPPOOL object "PayrollAppPool" recycled successfully.\nConnection pool has been reset.';
            }
            return '\nUsage: appcmd recycle apppool /apppool.name:PoolName';
        },

        // Fix connection string command
        powershell: function(args, term, engine) {
            var gate = SRV002Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV002Config._getScenario(engine);

            if (joined.includes('replace') && joined.includes('db-stage-01') && joined.includes('db-prod-01')) {
                if (scenario && scenario.id === 'wrong_server') {
                    engine.state._wrongServerName = false;
                    engine.save();
                    if (!engine.state._flagRevealed) {
                        engine.state._flagRevealed = true;
                        engine.state._labComplete = true;
                        engine.save();
                        setTimeout(function() { engine.notify('Connection string fixed. Server name corrected to DB-PROD-01. Check SQL Server Config for the recovery token.', 'success'); }, 400);
                    }
                    return '\nConnection string updated in web.config.\nServer=DB-STAGE-01 replaced with Server=DB-PROD-01.\nRecycle the application pool to apply changes.';
                }
            }

            if (joined.includes('test-netconnection') && joined.includes('1433')) {
                if (!engine.state._sqlRunning) {
                    return '\nWARNING: TCP connect to 10.0.2.10:1433 failed\nTcpTestSucceeded : False';
                }
                if (engine.state._firewallBlocking1433) {
                    return '\nWARNING: TCP connect to 10.0.2.10:1433 failed (timeout)\nTcpTestSucceeded : False\n\nNote: The firewall may be blocking this port.';
                }
                return '\nComputerName     : 10.0.2.10\nRemoteAddress    : 10.0.2.10\nRemotePort       : 1433\nTcpTestSucceeded : True';
            }

            return '\nPowerShell command executed.';
        },

        ping: function(args, term, engine) {
            var gate = SRV002Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping target_name';
            var target = args[args.length - 1];

            if (target === '10.0.2.10' || target === 'DB-PROD-01' || target === 'localhost' || target === '127.0.0.1') {
                return '\nPinging ' + target + ' with 32 bytes of data:\nReply from ' + (target === 'localhost' || target === '127.0.0.1' ? '127.0.0.1' : '10.0.2.10') + ': bytes=32 time<1ms TTL=128\nReply from ' + (target === 'localhost' || target === '127.0.0.1' ? '127.0.0.1' : '10.0.2.10') + ': bytes=32 time<1ms TTL=128\n\nPing statistics:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
            }
            if (target === 'DB-STAGE-01') {
                return '\nPing request could not find host DB-STAGE-01.\nNote: This is the staging server name. It is not resolvable from the production network.';
            }
            return '\nPing request could not find host ' + target + '. Please check the name and try again.';
        },

        whoami: function() { return 'DB-PROD-01\\Administrator'; },
        hostname: function() { return 'DB-PROD-01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ipconfig: function() {
            return '\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n   IPv4 Address. . . . . . . . . . . : 10.0.2.10\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 10.0.2.1\n   DNS Servers . . . . . . . . . . . : 10.0.1.5';
        },

        // Block Linux commands
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command.'; },
        grep: function() { return '\'grep\' is not recognized as an internal or external command.'; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['sql_config', 'event_viewer', 'services', 'firewall'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }

        switch (iconDef.app) {
            case 'ticket':       SRV002Config._openTicket(iconDef, engine); break;
            case 'sql_config':   SRV002Config._openSQLConfig(iconDef, engine); break;
            case 'event_viewer': SRV002Config._openEventViewer(iconDef, engine); break;
            case 'services':     SRV002Config._openServices(iconDef, engine); break;
            case 'firewall':     SRV002Config._openFirewall(iconDef, engine); break;
            case 'reset_lab':    SRV002Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        SRV002Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            SRV002Config._renderTicket(engine, container);
        } else {
            SRV002Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker(engine, container) {
        var ticketPreviews = [
            'HR Team — "Cannot connect to SQL Server since 3 AM"',
            'DevOps — "New deployment throws server not found error"',
            'App Team — "Remote connections to database timing out"',
            'Users — "Timeout expired getting connection from pool"',
            'Inventory Team — "All database queries hanging indefinitely"'
        ];

        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#6366f1; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">INCIDENT QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select an incident to begin troubleshooting.</div>'
            + '</div><div style="margin-bottom:16px;">';

        SRV002Config._scenarios.forEach(function(s, i) {
            html += '<button class="srv002-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#6366f1; font-weight:bold;">INC-' + (6001 + i) + '</span>'
                + '<span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">SEV-1</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + ticketPreviews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';

        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="srv002RandomBtn" style="padding:10px 28px; background:#6366f1; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.srv002-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#6366f1'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                SRV002Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                SRV002Config._renderTicket(engine, container);
            });
        });

        document.getElementById('srv002RandomBtn').addEventListener('click', function() {
            SRV002Config._applyScenario(engine, Math.floor(Math.random() * SRV002Config._scenarios.length));
            SRV002Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        var scenario = SRV002Config._getScenario(engine);
        var submitters = ['Amanda Foster — HR Department', 'Jake Liu — DevOps Engineering', 'Chris Park — Application Support', 'Multiple Users — Various Departments', 'Diana Ruiz — Inventory Management'];
        var submitter = submitters[engine.state._scenarioId] || 'System';
        var server = SRV002Config._servers[scenario.affectedServer];

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#6366f1; font-weight:bold; font-size:1rem;">INCIDENT #INC-' + (6001 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">SEV-1 CRITICAL</span>'
            + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">REPORTED BY</div><div>' + submitter + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DATE</div><div>March 30, 2026 — 8:15 AM</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">AFFECTED SERVER</div><div style="font-weight:bold; color:#6366f1;">' + server.name + '</div><div style="color:#888; font-size:0.7rem;">' + server.ip + ' &mdash; ' + server.role + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div><div style="font-weight:bold;">' + SRV002Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + SRV002Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div><div style="background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#a5b4fc;">' + SRV002Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — Database Administrator</div></div>';
    },

    _openSQLConfig(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); SRV002Config._renderSQLConfig(engine); return; }
        var container = document.createElement('div');
        container.id = 'sqlConfigContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'SQL Server Configuration', 'SQL', container);
        SRV002Config._renderSQLConfig(engine);
    },

    _renderSQLConfig(engine) {
        var container = document.getElementById('sqlConfigContainer');
        if (!container) return;
        var scenario = SRV002Config._getScenario(engine);

        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">SQL Server Configuration Manager</div>';

        // Service status
        var sqlStatus = engine.state._sqlRunning ? 'Running' : 'Stopped';
        var sqlColor = engine.state._sqlRunning ? '#2ecc71' : '#e74c3c';

        html += '<div style="font-weight:bold; margin-bottom:8px;">SQL Server Services:</div>';
        html += '<div style="padding:8px 12px; margin-bottom:4px; background:' + (engine.state._sqlRunning ? 'rgba(46,204,113,0.06)' : 'rgba(231,76,60,0.06)') + '; border:1px solid ' + (engine.state._sqlRunning ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.25)') + '; border-radius:4px;">'
            + '<div style="display:flex; justify-content:space-between;"><span style="font-weight:bold;">SQL Server (MSSQLSERVER)</span><span style="color:' + sqlColor + '; font-weight:bold;">' + sqlStatus + '</span></div>'
            + '<div style="font-size:0.7rem; color:#888;">Startup Type: ' + (engine.state._sqlRunning ? 'Automatic' : 'Manual (changed by update)') + '</div></div>';
        html += '<div style="padding:8px 12px; margin-bottom:4px; background:rgba(46,204,113,0.06); border:1px solid rgba(46,204,113,0.2); border-radius:4px;">'
            + '<div style="display:flex; justify-content:space-between;"><span>SQL Server Agent</span><span style="color:#2ecc71;">Running</span></div></div>';
        html += '<div style="padding:8px 12px; margin-bottom:12px; background:rgba(46,204,113,0.06); border:1px solid rgba(46,204,113,0.2); border-radius:4px;">'
            + '<div style="display:flex; justify-content:space-between;"><span>SQL Server Browser</span><span style="color:#2ecc71;">Running</span></div></div>';

        // Network config
        html += '<div style="font-weight:bold; margin-bottom:8px;">Network Configuration:</div>';
        html += '<div style="padding:8px 12px; margin-bottom:4px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;">'
            + '<div>TCP/IP: <span style="color:#2ecc71;">Enabled</span> &mdash; Port: 1433</div>'
            + '<div style="font-size:0.7rem; color:#888;">Listen All: Yes &mdash; IP Address: 10.0.2.10</div></div>';

        // Connection info
        if (engine.state._poolExhausted) {
            html += '<div style="margin-top:12px; padding:8px 12px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:4px; color:#e74c3c;">'
                + 'WARNING: 200/200 connections in use. Connection pool is exhausted.</div>';
        }
        if (engine.state._deadlockActive) {
            html += '<div style="margin-top:12px; padding:8px 12px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:4px; color:#e74c3c;">'
                + 'WARNING: Deadlock detected. SPID 78 and SPID 92 are blocking each other.</div>';
        }
        if (engine.state._firewallBlocking1433) {
            html += '<div style="margin-top:12px; padding:8px 12px; background:rgba(241,196,15,0.08); border:1px solid rgba(241,196,15,0.2); border-radius:4px; color:#f1c40f;">'
                + 'NOTE: Windows Firewall may be blocking inbound TCP 1433.</div>';
        }
        if (engine.state._wrongServerName) {
            html += '<div style="margin-top:12px; padding:8px 12px; background:rgba(241,196,15,0.08); border:1px solid rgba(241,196,15,0.2); border-radius:4px; color:#f1c40f;">'
                + 'NOTE: Application connection string references DB-STAGE-01 (staging). Production is DB-PROD-01.</div>';
        }

        if (engine.state._flagRevealed && scenario) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Incident Resolved:</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem;">' + scenario.fixDescription + '</div>'
                + '<div id="srv002-flag-reveal" style="color:#c8e6c9; font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>';
            setTimeout(function() {
                BoxEngine.requestFlagText(scenario.id).then(function(flagText) {
                    var el = document.getElementById('srv002-flag-reveal');
                    if (el) el.textContent = 'Recovery token: ' + (flagText || 'Flag unavailable');
                });
            }, 0);
        }

        container.innerHTML = html;
    },

    _openEventViewer(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Event Viewer', 'EVT', container);
        var scenario = SRV002Config._getScenario(engine);
        var events = [{ level: 'Information', time: '03/30/2026 02:00:00 AM', source: 'WindowsUpdateClient', id: 19, msg: 'Installation Successful: Windows successfully installed update KB5034441.' }];

        if (scenario) {
            if (scenario.id === 'sql_stopped') events.push({ level: 'Error', time: '03/30/2026 03:00:12 AM', source: 'MSSQLSERVER', id: 17148, msg: 'SQL Server is terminating because of a system shutdown. Service did not restart after reboot.' });
            else if (scenario.id === 'wrong_server') events.push({ level: 'Warning', time: '03/30/2026 07:30:00 AM', source: 'Application', id: 0, msg: 'Payroll application connection failed: Server=DB-STAGE-01 not found. Check connection string.' });
            else if (scenario.id === 'firewall_block') events.push({ level: 'Warning', time: '03/30/2026 02:05:00 AM', source: 'Windows Firewall', id: 2004, msg: 'Security hardening script blocked inbound TCP ports including 1433.' });
            else if (scenario.id === 'pool_exhausted') events.push({ level: 'Error', time: '03/30/2026 07:45:00 AM', source: 'MSSQLSERVER', id: 17828, msg: 'The pre-login handshake failed. Maximum number of connections (200) reached.' });
            else if (scenario.id === 'deadlock') events.push({ level: 'Error', time: '03/30/2026 06:12:33 AM', source: 'MSSQLSERVER', id: 1205, msg: 'Transaction (Process ID 78) was deadlocked on lock resources with another process (92) and has been chosen as the deadlock victim.' });
        }

        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Event Viewer — Application Log</div>';
        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; margin-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.08);">'
            + '<span style="flex:0.8;">Level</span><span style="flex:1.5;">Date/Time</span><span style="flex:1.2;">Source</span><span style="flex:0.5;">ID</span><span style="flex:3;">Message</span></div>';

        events.forEach(function(evt) {
            var isError = evt.level === 'Error';
            var isWarn = evt.level === 'Warning';
            html += '<div style="display:flex; align-items:flex-start; padding:6px 8px; margin-bottom:2px; background:' + (isError ? 'rgba(231,76,60,0.06)' : isWarn ? 'rgba(241,196,15,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isError ? 'rgba(231,76,60,0.2)' : isWarn ? 'rgba(241,196,15,0.15)' : 'rgba(255,255,255,0.04)') + '; border-radius:3px; font-size:0.75rem;">'
                + '<span style="flex:0.8; color:' + (isError ? '#e74c3c' : isWarn ? '#f1c40f' : '#2ecc71') + '; font-weight:bold;">' + evt.level.substring(0, 4) + '</span>'
                + '<span style="flex:1.5; color:#888;">' + evt.time + '</span>'
                + '<span style="flex:1.2; color:#aaa;">' + evt.source + '</span>'
                + '<span style="flex:0.5; color:#888;">' + evt.id + '</span>'
                + '<span style="flex:3;">' + evt.msg + '</span></div>';
        });
        container.innerHTML = html;
    },

    _openServices(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Services', 'SVC', container);

        var services = [
            { name: 'DNS Client', status: 'Running', startup: 'Automatic' },
            { name: 'SQL Server (MSSQLSERVER)', status: engine.state._sqlRunning ? 'Running' : 'Stopped', startup: engine.state._sqlRunning ? 'Automatic' : 'Manual', highlight: true },
            { name: 'SQL Server Agent', status: 'Running', startup: 'Automatic' },
            { name: 'SQL Server Browser', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Defender Firewall', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Event Log', status: 'Running', startup: 'Automatic' }
        ];

        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Services (Local)</div>';
        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; margin-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.08);">'
            + '<span style="flex:2.5;">Name</span><span style="flex:1;">Status</span><span style="flex:1;">Startup Type</span></div>';

        services.forEach(function(svc) {
            var isStopped = svc.status === 'Stopped';
            var isHL = svc.highlight;
            html += '<div style="display:flex; padding:6px 8px; margin-bottom:2px; background:' + (isHL && isStopped ? 'rgba(231,76,60,0.08)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isHL && isStopped ? 'rgba(231,76,60,0.3)' : 'rgba(255,255,255,0.04)') + '; border-radius:3px;">'
                + '<span style="flex:2.5; font-weight:' + (isHL ? 'bold' : 'normal') + ';">' + svc.name + '</span>'
                + '<span style="flex:1; color:' + (isStopped ? '#e74c3c' : '#2ecc71') + ';">' + svc.status + '</span>'
                + '<span style="flex:1; color:#888;">' + svc.startup + '</span></div>';
        });
        container.innerHTML = html;
    },

    _openFirewall(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Windows Firewall', 'FW', container);

        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Windows Defender Firewall with Advanced Security</div>';
        html += '<div style="font-weight:bold; margin-bottom:8px;">Inbound Rules:</div>';

        var rules = [
            { name: 'Remote Desktop (TCP-In)', port: 3389, action: 'Allow', enabled: true },
            { name: 'File and Printer Sharing', port: 445, action: 'Allow', enabled: true },
            { name: 'SQL Server (TCP 1433)', port: 1433, action: engine.state._firewallBlocking1433 ? 'Block' : 'Allow', enabled: true, highlight: engine.state._firewallBlocking1433 }
        ];

        rules.forEach(function(rule) {
            var isBlock = rule.action === 'Block';
            html += '<div style="display:flex; justify-content:space-between; padding:6px 12px; margin-bottom:4px; background:' + (isBlock ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isBlock ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.06)') + '; border-radius:3px;">'
                + '<span style="font-weight:' + (rule.highlight ? 'bold' : 'normal') + ';">' + rule.name + '</span>'
                + '<span>Port: ' + rule.port + '</span>'
                + '<span style="color:' + (isBlock ? '#e74c3c' : '#2ecc71') + '; font-weight:bold;">' + rule.action + '</span></div>';
        });

        if (engine.state._firewallBlocking1433) {
            html += '<div style="margin-top:12px; padding:8px 12px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:4px; color:#e74c3c;">'
                + 'WARNING: SQL Server port 1433 is BLOCKED. Remote database connections will fail.</div>';
        }
        container.innerHTML = html;
    },

    _confirmReset(engine) {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;">'
            + '<div style="font-size:1rem; font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div>'
            + '<div style="font-size:0.8rem; color:#aaa; margin-bottom:20px;">This will clear all progress and restart from the beginning.</div>'
            + '<div style="display:flex; gap:12px; justify-content:center;">'
            + '<button id="srv002ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Reset</button>'
            + '<button id="srv002ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div></div>';

        document.getElementById('arena').appendChild(overlay);
        document.getElementById('srv002ResetConfirm').addEventListener('click', function() {
            SRV002Config._flagRestored = false;
            SRV002Config.hints = SRV002Config._defaultHints;
            engine.reset();
        });
        document.getElementById('srv002ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

};
