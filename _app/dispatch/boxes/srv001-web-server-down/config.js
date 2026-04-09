/* ============================================================
   DISPATCH LAB — Box SRV001: Web Server Down
   Server Troubleshooting — IIS/nginx, SSL, ports, memory
   Config: server state, Linux/Windows commands, GUI, scenarios
   5 distinct scenarios: service stopped, port not listening,
   SSL cert expired, app pool crash, OOM kill
   ============================================================ */

var SRV001Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Web Server Down',
    subtitle: 'Production Is Burning — Server Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#6366f1',
    storageKey: 'hexworth_lab_srv001',
    registryId: 'srv001-web-server-down',
    trackerKey: 'lab_srv001',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Help Desk Ticket',
                tip: 'Double-click the Help Desk Ticket icon to read the incident report and get your assignment.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Check the web server status',
                tip: 'Open Server Manager or use the terminal to check service status. Is IIS/nginx running? Is the port listening?',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:systemctl' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:iisreset' } },
                        { event: 'command', match: { cmd: 'contains:netstat' } },
                        { event: 'command', match: { cmd: 'contains:ss ' } },
                        { event: 'window_open', match: { type: 'server_manager' } }
                    ]
                }
            },
            {
                title: 'Investigate the root cause',
                tip: 'Use systemctl, netstat, openssl, Event Viewer, or Task Manager to identify why the server is down.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:status' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:openssl' } },
                        { event: 'command', match: { cmd: 'contains:journalctl' } },
                        { event: 'command', match: { cmd: 'contains:free' } },
                        { event: 'window_open', match: { type: 'event_viewer' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Restart the service, fix the SSL cert, recycle the app pool, or free memory. The right fix depends on the root cause.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:start' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:restart' } },
                        { event: 'command', match: { cmd: 'contains:iisreset' } },
                        { event: 'command', match: { cmd: 'contains:kill' } }
                    ]
                }
            },
            {
                title: 'Capture the flag',
                tip: 'After fixing the server, the recovery token appears in the tool you used to apply the fix.',
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
            { flagId: 'fixed', objective: '5.3', description: 'Given a scenario, use the appropriate network software tools and commands', skill: 'Server Service Management' },
            { flagId: 'fixed', objective: '5.5', description: 'Given a scenario, troubleshoot general networking issues', skill: 'Web Server Troubleshooting' }
        ]
    },

    // ==========================================================
    // SERVER DATA
    // ==========================================================

    _servers: [
        { name: 'WEB-PROD-01', ip: '10.0.1.10', os: 'Windows Server 2022', role: 'IIS Web Server', service: 'W3SVC' },
        { name: 'WEB-PROD-02', ip: '10.0.1.11', os: 'Ubuntu 22.04 LTS', role: 'nginx Reverse Proxy', service: 'nginx' },
        { name: 'APP-PROD-01', ip: '10.0.1.20', os: 'Windows Server 2022', role: 'Application Server', service: 'W3SVC' }
    ],

    // ==========================================================
    // SCENARIO FLAGS
    // ==========================================================

    _scenarioFlags: {
        service_stopped:  null,
        port_blocked:     null,
        ssl_expired:      null,
        app_pool_crash:   null,
        oom_kill:         null
    },

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            id: 'service_stopped',
            name: 'IIS/nginx Service Stopped',
            ticketSubject: 'Corporate website returning connection refused — all users affected',
            ticketDetail: 'The corporate website at https://portal.contoso.com has been completely unreachable since approximately 6:15 AM. Users are getting "Connection Refused" errors in their browsers. The server itself responds to ping, so the machine is up. The monitoring dashboard shows the HTTP check has been failing for 47 minutes.',
            ticketExtra: 'NOC Note: Automated patching ran overnight on WEB-PROD-01. The server rebooted at 5:58 AM. Post-reboot service validation was not configured.',
            affectedServer: 0,
            fixDescription: 'Start the IIS World Wide Web Publishing Service (W3SVC) or nginx service',
            stateOverrides: { _webServiceRunning: false, _serviceStoppedReason: 'not_started_after_reboot' }
        },
        {
            id: 'port_blocked',
            name: 'Port 443 Not Listening',
            ticketSubject: 'HTTPS connections timing out — HTTP works fine on port 80',
            ticketDetail: 'Users can reach http://portal.contoso.com on port 80 but https://portal.contoso.com times out. The SSL redirect is broken. This started after the firewall team pushed new rules last night. We need HTTPS restored immediately — the site handles sensitive employee data.',
            ticketExtra: 'NOC Note: Firewall change request CR-4471 was implemented at 11:30 PM. The change was supposed to only affect DMZ rules but may have impacted internal server bindings. Port 80 is confirmed open.',
            affectedServer: 0,
            fixDescription: 'Re-enable port 443 binding or fix the firewall rule blocking HTTPS',
            stateOverrides: { _port443Blocked: true, _webServiceRunning: true }
        },
        {
            id: 'ssl_expired',
            name: 'SSL Certificate Expired',
            ticketSubject: 'Browser showing "Your connection is not private" — NET::ERR_CERT_DATE_INVALID',
            ticketDetail: 'Every user trying to access the portal gets a big red warning page saying the certificate has expired. Chrome shows NET::ERR_CERT_DATE_INVALID. Firefox says SEC_ERROR_EXPIRED_CERTIFICATE. The site was working fine yesterday. Nobody renewed the SSL certificate and it expired at midnight.',
            ticketExtra: 'NOC Note: Certificate monitoring alert was sent 30 days ago but was routed to a distribution list that nobody checks. The cert for portal.contoso.com expired at 00:00 UTC today. Issuer: DigiCert SHA2 Extended Validation Server CA.',
            affectedServer: 0,
            fixDescription: 'Generate a new CSR, obtain a renewed certificate, and bind it to the IIS site',
            stateOverrides: { _sslExpired: true, _webServiceRunning: true }
        },
        {
            id: 'app_pool_crash',
            name: 'Application Pool Crash',
            ticketSubject: 'Website returning HTTP 503 Service Unavailable intermittently',
            ticketDetail: 'The portal is returning 503 errors. Sometimes it loads, sometimes it crashes. IIS is running but the application pool keeps stopping. Event Viewer shows the app pool "PortalAppPool" has been automatically disabled after a series of rapid failures. Users are furious.',
            ticketExtra: 'NOC Note: A deployment was pushed at 2:00 AM that included updated .NET assemblies. The app pool has crashed and auto-recovered 5 times in the last hour before IIS disabled it entirely. W3SVC is running but the pool is stopped.',
            affectedServer: 2,
            fixDescription: 'Recycle the crashed application pool and verify it stays running',
            stateOverrides: { _appPoolCrashed: true, _webServiceRunning: true }
        },
        {
            id: 'oom_kill',
            name: 'Memory Exhaustion (OOM Kill)',
            ticketSubject: 'nginx proxy server killed by OOM — reverse proxy offline',
            ticketDetail: 'The nginx reverse proxy on WEB-PROD-02 is completely down. The server ran out of memory and the Linux OOM killer terminated the nginx process. The server has 8GB RAM and was running fine until a memory leak in a backend application caused memory pressure. All sites behind the reverse proxy are unreachable.',
            ticketExtra: 'NOC Note: Memory usage on WEB-PROD-02 climbed from 42% to 98% over 6 hours. The OOM killer invoked at 04:12 AM, killing nginx (PID 1847) with score 892. The leaking java process was already terminated by ops.',
            affectedServer: 1,
            fixDescription: 'Verify memory is available, restart nginx, confirm the proxy is serving traffic',
            stateOverrides: { _nginxOomKilled: true, _webServiceRunning: false, _memoryFreed: false }
        }
    ],

    // ==========================================================
    // PER-SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Check the web service status first. Is IIS or nginx actually running?', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use netstat or ss to check if the expected ports (80, 443) are listening.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Check Event Viewer or journalctl for recent errors related to the web service.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears in the tool you used to apply the fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        service_stopped: [
            { id: 'hint1', text: 'The server responds to ping but the website is down. Check whether the web service is running.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Use "sc query W3SVC" or "Get-Service W3SVC" to check the IIS service. It shows as Stopped.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The service did not start after a reboot. Start it with "net start W3SVC" or "iisreset /start".', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Full fix: net start W3SVC (or iisreset /start). Then verify with "netstat -an | findstr :443" to confirm it is listening.', cost: 150, penalty: -150 }
        ],
        port_blocked: [
            { id: 'hint1', text: 'HTTP works but HTTPS does not. The issue is specific to port 443.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "netstat -an | findstr :443" — port 443 is NOT listening even though IIS is running.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The HTTPS binding was removed during the firewall change. Re-add the 443 binding or run "netsh http add sslcert".', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: Use "netsh http add sslcert ipport=0.0.0.0:443 certhash=<thumbprint> appid={...}" then restart IIS. Or re-add the binding in IIS Manager.', cost: 150, penalty: -150 }
        ],
        ssl_expired: [
            { id: 'hint1', text: 'The site loads but browsers reject the certificate. This is not a connectivity issue — it is a certificate issue.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Use "openssl s_client -connect 10.0.1.10:443" to inspect the certificate. Look at the "Not After" date.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The certificate expired today. Generate a new CSR with "openssl req -new -newkey rsa:2048" and request a renewed cert.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Full fix: 1) Generate CSR, 2) Submit to CA, 3) Import new cert, 4) Bind to IIS site on port 443. Use certutil or IIS Manager.', cost: 150, penalty: -150 }
        ],
        app_pool_crash: [
            { id: 'hint1', text: 'IIS is running but the site returns 503. The problem is the application pool, not the web service itself.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check IIS Manager or run "appcmd list apppool" — the PortalAppPool shows as Stopped.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The app pool was disabled after repeated crashes. Start it with "appcmd start apppool /apppool.name:PortalAppPool".', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Full fix: "appcmd start apppool /apppool.name:PortalAppPool". If it crashes again, check Event Viewer for the .NET exception causing failures.', cost: 150, penalty: -150 }
        ],
        oom_kill: [
            { id: 'hint1', text: 'The nginx process was killed by the OOM killer. Check if there is enough free memory to restart it.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "free -h" to check memory. The leaking java process was already killed, so memory should be available now.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Memory is free. Restart nginx with "systemctl start nginx" and verify with "systemctl status nginx".', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Full fix: "free -h" to confirm memory, "systemctl start nginx", "ss -tlnp | grep 443" to verify it is listening. Check "journalctl -u nginx" for errors.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SRV001Config._flagRestored) {
            SRV001Config._flagRestored = true;
            var scenario = SRV001Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                SRV001Config.hints = SRV001Config._scenarioHints[scenario.id] || SRV001Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;

        // Reset state
        engine.state._webServiceRunning = true;
        engine.state._port443Blocked = false;
        engine.state._sslExpired = false;
        engine.state._appPoolCrashed = false;
        engine.state._nginxOomKilled = false;
        engine.state._memoryFreed = false;
        engine.state._serviceStoppedReason = null;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;
        engine.state._portFixed = false;
        engine.state._sslRenewed = false;
        engine.state._appPoolStarted = false;

        // Apply scenario-specific overrides
        var overrides = SRV001Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) {
            engine.state[key] = overrides[key];
        }

        // Set dynamic hints
        var scenario = SRV001Config._scenarios[idx];
        SRV001Config._flagRestored = true;
        SRV001Config.hints = SRV001Config._scenarioHints[scenario.id] || SRV001Config._defaultHints;

        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return SRV001Config._scenarios[engine.state._scenarioId];
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
            'Memory Test: 65536 MB OK',
            'Detecting drives... NVMe: Samsung PM9A3 (960GB) x2 RAID-1',
            'Network: Broadcom BCM5720 Dual-Port 1GbE',
            'iDRAC9 Enterprise detected',
            'Boot device: Virtual Disk 0',
            'Loading OS...'
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
            { id: 'cmd',            label: 'Command\nPrompt',      icon: '>_',  app: 'terminal' },
            { id: 'server_manager', label: 'Server\nManager',      icon: 'SRV', app: 'server_manager' },
            { id: 'event_viewer',   label: 'Event\nViewer',        icon: 'EVT', app: 'event_viewer' },
            { id: 'task_manager',   label: 'Task\nManager',        icon: 'TSK', app: 'task_manager' },
            { id: 'iis_manager',    label: 'IIS\nManager',         icon: 'IIS', app: 'iis_manager' },
            { id: 'ticket',         label: 'Help Desk\nTicket',    icon: 'HD',  app: 'ticket' },
            { id: 'hints',          label: 'Hints',                icon: '?',   app: 'hints' },
            { id: 'reset',          label: 'Reset\nLab',           icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG
    // ==========================================================

    terminal: {
        user: 'Administrator',
        hostname: 'WEB-PROD-01',
        startDir: 'C:\\Users\\Administrator',
        promptStyle: 'windows',
        welcome: 'Microsoft Windows [Version 10.0.20348.2340]\n(c) Microsoft Corporation. All rights reserved.\n'
    },

    // ==========================================================
    // FILESYSTEM
    // ==========================================================

    filesystem: {
        '/': { type: 'dir', children: {} }
    },

    // ==========================================================
    // FLAGS
    // ==========================================================

    flags: [
        { id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }
    ],

    // ==========================================================
    // SCORING
    // ==========================================================

    scoring: {
        base: 0,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ==========================================================
    // HINTS
    // ==========================================================

    hints: [
        { id: 'hint1', text: 'Check the web service status first. Is IIS or nginx actually running?', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use netstat or ss to check if ports 80 and 443 are listening.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Check Event Viewer or journalctl for errors related to the web service.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears in the tool you used to apply the fix.', cost: 50, penalty: -50 }
    ],

    // ==========================================================
    // LORE
    // ==========================================================

    lore: {
        intro: 'The production web server is down. Users cannot access the corporate portal. As the server administrator, you need to diagnose the root cause and restore service immediately.',
        scenario: 'Each scenario represents a different failure mode for a production web server. The web service, SSL certificates, application pools, and system resources can all fail independently. Use the right diagnostic tool for each problem.',
        outro: 'Web server restored. Production traffic is flowing again. Your systematic troubleshooting identified the root cause and applied the correct fix under pressure.'
    },

    // ==========================================================
    // PHASES
    // ==========================================================

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the incident ticket and check basic server health.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the root cause — service, port, certificate, app pool, or memory.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the correct fix to restore the web server.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm the server is operational and capture the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // CUSTOM COMMANDS
    // ==========================================================

    commands: {

        // --- SC QUERY ---
        sc: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('query') && (joined.includes('w3svc') || joined.includes('iis'))) {
                var running = engine.state._webServiceRunning;
                return '\nSERVICE_NAME: W3SVC\n        TYPE               : 20  WIN32_SHARE_PROCESS\n        STATE              : ' + (running ? '4  RUNNING\n                                (STOPPABLE, NOT_PAUSABLE, ACCEPTS_SHUTDOWN)' : '1  STOPPED\n                                (NOT_STOPPABLE, NOT_PAUSABLE, IGNORES_SHUTDOWN)') + '\n        WIN32_EXIT_CODE    : 0  (0x0)\n        SERVICE_EXIT_CODE  : 0  (0x0)\n        CHECKPOINT         : 0x0\n        WAIT_HINT          : 0x0';
            }
            if (joined.includes('query') && joined.includes('nginx')) {
                return '\n[SC] EnumQueryServicesStatus:OpenService FAILED 1060:\n\nThe specified service does not exist as an installed service.\n\nNote: nginx runs on WEB-PROD-02 (Linux). Use SSH to check it.';
            }
            return '\nUsage: sc query <service_name>\nExample: sc query W3SVC';
        },

        // --- NET START/STOP ---
        net: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV001Config._getScenario(engine);

            if (joined.includes('start') && (joined.includes('w3svc') || joined.includes('world wide web'))) {
                if (engine.state._webServiceRunning) {
                    return '\nThe requested service has already been started.';
                }
                engine.state._webServiceRunning = true;
                engine.save();
                if (scenario && scenario.id === 'service_stopped' && !engine.state._flagRevealed) {
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() {
                        engine.notify('W3SVC started. Web server is back online. Check Server Manager for the recovery token.', 'success');
                    }, 400);
                }
                return '\nThe World Wide Web Publishing Service service is starting.\nThe World Wide Web Publishing Service service was started successfully.';
            }

            if (joined.includes('stop') && (joined.includes('w3svc') || joined.includes('world wide web'))) {
                if (!engine.state._webServiceRunning) {
                    return '\nThe World Wide Web Publishing Service service is not started.';
                }
                engine.state._webServiceRunning = false;
                engine.save();
                return '\nThe World Wide Web Publishing Service service is stopping.\nThe World Wide Web Publishing Service service was stopped successfully.';
            }

            return '\nThe syntax of this command is:\n\nNET [ START | STOP | USE | USER | VIEW ]\n\nExamples:\n    net start W3SVC\n    net stop W3SVC';
        },

        // --- IISRESET ---
        iisreset: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV001Config._getScenario(engine);

            if (joined.includes('/start') || joined.includes('/restart') || !args.length) {
                engine.state._webServiceRunning = true;
                if (engine.state._appPoolCrashed) {
                    engine.state._appPoolCrashed = false;
                    engine.state._appPoolStarted = true;
                }
                engine.save();

                if (scenario && (scenario.id === 'service_stopped' || scenario.id === 'app_pool_crash') && !engine.state._flagRevealed) {
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() {
                        engine.notify('IIS has been restarted. Web server is back online. Check Server Manager for the recovery token.', 'success');
                    }, 400);
                }
                return '\nAttempting stop...\nInternet services successfully stopped\nAttempting start...\nInternet services successfully restarted';
            }

            if (joined.includes('/stop')) {
                engine.state._webServiceRunning = false;
                engine.save();
                return '\nAttempting stop...\nInternet services successfully stopped';
            }

            if (joined.includes('/status')) {
                return '\nStatus for World Wide Web Publishing Service ( W3SVC ) : ' + (engine.state._webServiceRunning ? 'Running' : 'Stopped');
            }

            return '\nUsage: iisreset [/start] [/stop] [/restart] [/status]\n\nResets Internet Information Services (IIS).';
        },

        // --- NETSTAT ---
        netstat: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV001Config._getScenario(engine);
            var running = engine.state._webServiceRunning;

            var lines = '\nActive Connections\n\n  Proto  Local Address          Foreign Address        State\n';

            if (running && !engine.state._port443Blocked) {
                lines += '  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING\n';
                lines += '  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING\n';
            } else if (running && engine.state._port443Blocked) {
                lines += '  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING\n';
            }
            lines += '  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING\n';
            lines += '  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING\n';
            lines += '  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING\n';
            lines += '  TCP    10.0.1.10:139          0.0.0.0:0              LISTENING\n';

            if (joined.includes('findstr') && joined.includes('443')) {
                if (running && !engine.state._port443Blocked) {
                    return '\n  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING';
                }
                return '\n(No matching entries found for port 443)';
            }

            return lines;
        },

        // --- SS (Linux) ---
        ss: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SRV001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'oom_kill') {
                if (engine.state._nginxOomKilled && !engine.state._webServiceRunning) {
                    return '\nState    Recv-Q    Send-Q    Local Address:Port    Peer Address:Port\nLISTEN   0         128       0.0.0.0:22            0.0.0.0:*           users:(("sshd",pid=892,fd=3))';
                }
                return '\nState    Recv-Q    Send-Q    Local Address:Port    Peer Address:Port\nLISTEN   0         511       0.0.0.0:80            0.0.0.0:*           users:(("nginx",pid=2341,fd=6))\nLISTEN   0         511       0.0.0.0:443           0.0.0.0:*           users:(("nginx",pid=2341,fd=7))\nLISTEN   0         128       0.0.0.0:22            0.0.0.0:*           users:(("sshd",pid=892,fd=3))';
            }

            return '\n\'ss\' is not recognized as an internal or external command,\noperable program or batch file.\n\nNote: ss is a Linux command. This is a Windows server. Use netstat instead.';
        },

        // --- SYSTEMCTL (Linux — for nginx scenario) ---
        systemctl: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV001Config._getScenario(engine);

            if (scenario && scenario.id === 'oom_kill') {
                if (joined.includes('status') && joined.includes('nginx')) {
                    if (engine.state._nginxOomKilled && !engine.state._webServiceRunning) {
                        return '\n● nginx.service - A high performance web server and a reverse proxy server\n     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)\n     Active: inactive (dead) since Mon 2026-03-30 04:12:33 UTC; 3h 22min ago\n    Process: 1847 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=killed, signal=KILL)\n   Main PID: 1847 (code=killed, signal=KILL)\n        CPU: 1.284s\n\nMar 30 04:12:33 WEB-PROD-02 systemd[1]: nginx.service: Main process exited, code=killed, status=9/KILL\nMar 30 04:12:33 WEB-PROD-02 systemd[1]: nginx.service: Failed with result \'signal\'.\nMar 30 04:12:33 WEB-PROD-02 kernel: Out of memory: Killed process 1847 (nginx) total-vm:524288kB, anon-rss:412672kB';
                    }
                    return '\n● nginx.service - A high performance web server and a reverse proxy server\n     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)\n     Active: active (running) since Mon 2026-03-30 07:35:01 UTC; 12s ago\n    Process: 2341 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)\n   Main PID: 2341 (nginx)\n      Tasks: 5 (limit: 9447)\n     Memory: 12.4M\n        CPU: 42ms\n\nMar 30 07:35:01 WEB-PROD-02 systemd[1]: Started A high performance web server and a reverse proxy server.';
                }

                if (joined.includes('start') && joined.includes('nginx')) {
                    if (!engine.state._memoryFreed) {
                        engine.state._memoryFreed = true;
                    }
                    engine.state._webServiceRunning = true;
                    engine.state._nginxOomKilled = false;
                    engine.save();
                    if (!engine.state._flagRevealed) {
                        engine.state._flagRevealed = true;
                        engine.state._labComplete = true;
                        engine.save();
                        setTimeout(function() {
                            engine.notify('nginx started successfully. Reverse proxy is back online. Check systemctl status for the recovery token.', 'success');
                        }, 400);
                    }
                    return '';
                }

                if (joined.includes('restart') && joined.includes('nginx')) {
                    engine.state._webServiceRunning = true;
                    engine.state._nginxOomKilled = false;
                    engine.state._memoryFreed = true;
                    engine.save();
                    if (!engine.state._flagRevealed) {
                        engine.state._flagRevealed = true;
                        engine.state._labComplete = true;
                        engine.save();
                        setTimeout(function() {
                            engine.notify('nginx restarted. Reverse proxy restored. Check systemctl status for the recovery token.', 'success');
                        }, 400);
                    }
                    return '';
                }
            }

            return '\n\'systemctl\' is not recognized as an internal or external command,\noperable program or batch file.\n\nNote: systemctl is a Linux command. This is a Windows server.\nTo manage Windows services, use: sc query, net start, net stop';
        },

        // --- FREE (Linux memory check) ---
        free: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SRV001Config._getScenario(engine);

            if (scenario && scenario.id === 'oom_kill') {
                engine.state._memoryFreed = true;
                engine.save();
                return '\n              total        used        free      shared  buff/cache   available\nMem:          7.8Gi       1.2Gi       5.4Gi       142Mi       1.2Gi       6.1Gi\nSwap:         2.0Gi          0B       2.0Gi\n\nNote: Memory pressure resolved. The leaking java process was terminated by ops.';
            }
            return '\n\'free\' is not recognized as an internal or external command,\noperable program or batch file.\n\nNote: free is a Linux command. On Windows, use Task Manager or:\n    systeminfo | findstr Memory\n    wmic os get FreePhysicalMemory';
        },

        // --- JOURNALCTL (Linux logs) ---
        journalctl: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SRV001Config._getScenario(engine);

            if (scenario && scenario.id === 'oom_kill') {
                return '\n-- Journal begins at Mon 2026-03-30 00:00:01 UTC --\nMar 30 03:45:12 WEB-PROD-02 kernel: java invoked oom-killer: gfp_mask=0xcc0(GFP_KERNEL), order=0, oom_score_adj=0\nMar 30 04:12:33 WEB-PROD-02 kernel: Out of memory: Killed process 1847 (nginx) total-vm:524288kB, anon-rss:412672kB, file-rss:8192kB\nMar 30 04:12:33 WEB-PROD-02 systemd[1]: nginx.service: Main process exited, code=killed, status=9/KILL\nMar 30 04:12:33 WEB-PROD-02 systemd[1]: nginx.service: Failed with result \'signal\'.\nMar 30 04:30:00 WEB-PROD-02 systemd[1]: Stopped A high performance web server and a reverse proxy server.';
            }
            return '\n\'journalctl\' is not recognized as an internal or external command.\nNote: journalctl is a Linux command. On Windows, use Event Viewer or:\n    Get-WinEvent -LogName System -MaxEvents 20';
        },

        // --- OPENSSL ---
        openssl: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV001Config._getScenario(engine);

            if (joined.includes('s_client') && joined.includes('443')) {
                if (scenario && scenario.id === 'ssl_expired') {
                    return '\nCONNECTED(00000003)\n---\nCertificate chain\n 0 s:CN = portal.contoso.com\n   i:C = US, O = DigiCert Inc, CN = DigiCert SHA2 Extended Validation Server CA\n---\nServer certificate\n-----BEGIN CERTIFICATE-----\nMIIFjTCCBHWgAwIBAgIQDKz1...(truncated)\n-----END CERTIFICATE-----\nsubject=CN = portal.contoso.com\nissuer=C = US, O = DigiCert Inc, CN = DigiCert SHA2 Extended Validation Server CA\n---\nNo client certificate CA names sent\n---\nSSL handshake has read 3517 bytes and written 392 bytes\n---\nNew, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384\nServer public key is 2048 bit\n\n    Not Before: Mar 30 00:00:00 2025 GMT\n    Not After : Mar 29 23:59:59 2026 GMT\n\n    VERIFY RESULT: 10 (certificate has expired)\n\nWARNING: Certificate expired on Mar 29 23:59:59 2026 GMT (yesterday)';
                }
                if (!engine.state._webServiceRunning) {
                    return '\nconnect: Connection refused\nCONNECT:errno=111';
                }
                return '\nCONNECTED(00000003)\n---\nsubject=CN = portal.contoso.com\nissuer=C = US, O = DigiCert Inc, CN = DigiCert SHA2 Extended Validation Server CA\n---\n    Not Before: Jan 15 00:00:00 2026 GMT\n    Not After : Jan 15 23:59:59 2027 GMT\n\n    VERIFY RESULT: 0 (ok)';
            }

            if (joined.includes('req') && joined.includes('new')) {
                if (scenario && scenario.id === 'ssl_expired') {
                    engine.state._sslRenewed = true;
                    engine.state._sslExpired = false;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() {
                        engine.notify('CSR generated. New certificate request created. Check Server Manager for the recovery token.', 'success');
                    }, 400);
                    return '\nGenerating a RSA private key\n..........+++++\n.................+++++\nwriting new private key to \'portal.contoso.com.key\'\n-----\nYou are about to be asked to enter information that will be incorporated\ninto your certificate request.\n-----\nCountry Name: US\nState: Washington\nLocality: Redmond\nOrganization: Contoso Ltd\nCommon Name: portal.contoso.com\n\nCSR written to portal.contoso.com.csr\nSubmit this CSR to your Certificate Authority for renewal.';
                }
                return '\nUsage: openssl req -new -newkey rsa:2048 -nodes -keyout server.key -out server.csr';
            }

            return '\nUsage:\n    openssl s_client -connect <host>:<port>\n    openssl req -new -newkey rsa:2048 -nodes -keyout key.pem -out csr.pem\n    openssl x509 -in cert.pem -text -noout';
        },

        // --- CERTUTIL ---
        certutil: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV001Config._getScenario(engine);

            if (joined.includes('-store') || joined.includes('store')) {
                if (scenario && scenario.id === 'ssl_expired') {
                    return '\n================ Certificate 0 ================\nSerial Number: 0a1b2c3d4e5f\nIssuer: CN=DigiCert SHA2 Extended Validation Server CA, O=DigiCert Inc, C=US\n Subject: CN=portal.contoso.com\n NotBefore: 3/30/2025 12:00 AM\n NotAfter: 3/29/2026 11:59 PM   *** EXPIRED ***\nCert Hash(sha1): a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0\n  CERT_KEY_PROV_INFO_PROP_ID(2):\n    Key Container = portal.contoso.com';
                }
                return '\nCertUtil: -store command completed successfully.\n0 certificates found.';
            }
            return '\nUsage: certutil -store My\n       certutil -viewstore My\n       certutil -importpfx cert.pfx';
        },

        // --- APPCMD ---
        appcmd: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV001Config._getScenario(engine);

            if (joined.includes('list') && joined.includes('apppool')) {
                var poolState = engine.state._appPoolCrashed ? 'Stopped' : 'Started';
                return '\nAPPPOOL "DefaultAppPool" (MgdVersion:v4.0,MgdMode:Integrated,state:Started)\nAPPPOOL "PortalAppPool" (MgdVersion:v4.0,MgdMode:Integrated,state:' + poolState + ')\nAPPPOOL ".NET v4.5" (MgdVersion:v4.0,MgdMode:Integrated,state:Started)';
            }

            if (joined.includes('start') && joined.includes('apppool') && joined.includes('portalapppool')) {
                if (!engine.state._appPoolCrashed) {
                    return '\nERROR ( message:"Cannot start application pool \'PortalAppPool\' because it is already started." )';
                }
                engine.state._appPoolCrashed = false;
                engine.state._appPoolStarted = true;
                engine.save();
                if (scenario && scenario.id === 'app_pool_crash' && !engine.state._flagRevealed) {
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() {
                        engine.notify('PortalAppPool started. Application is serving requests. Check IIS Manager for the recovery token.', 'success');
                    }, 400);
                }
                return '\nAPPPOOL object "PortalAppPool" started successfully.';
            }

            if (joined.includes('recycle') && joined.includes('apppool') && joined.includes('portalapppool')) {
                engine.state._appPoolCrashed = false;
                engine.state._appPoolStarted = true;
                engine.save();
                if (scenario && scenario.id === 'app_pool_crash' && !engine.state._flagRevealed) {
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() {
                        engine.notify('PortalAppPool recycled. Application is healthy. Check IIS Manager for the recovery token.', 'success');
                    }, 400);
                }
                return '\nAPPPOOL object "PortalAppPool" recycled successfully.';
            }

            return '\nUsage:\n    appcmd list apppool\n    appcmd start apppool /apppool.name:PoolName\n    appcmd stop apppool /apppool.name:PoolName\n    appcmd recycle apppool /apppool.name:PoolName';
        },

        // --- NETSH (for port 443 fix) ---
        netsh: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV001Config._getScenario(engine);

            if (joined.includes('http') && joined.includes('add') && joined.includes('sslcert') && joined.includes('443')) {
                if (scenario && scenario.id === 'port_blocked') {
                    engine.state._port443Blocked = false;
                    engine.state._portFixed = true;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() {
                        engine.notify('SSL certificate binding restored on port 443. HTTPS is back online. Check Server Manager for the recovery token.', 'success');
                    }, 400);
                    return '\nSSL Certificate successfully added.\nIP:port              : 0.0.0.0:443\nCertificate Hash     : a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0\nApplication ID       : {4dc3e181-e14b-4a21-b022-59fc669b0914}';
                }
                return '\nSSL Certificate add failed, Error: 183\nCannot create a file when that file already exists.';
            }

            if (joined.includes('http') && joined.includes('show') && joined.includes('sslcert')) {
                if (engine.state._port443Blocked) {
                    return '\nSSL Certificate bindings:\n    (no bindings found for port 443)\n\nNote: No SSL certificate is bound to port 443.';
                }
                return '\nSSL Certificate bindings:\n\n    IP:port                      : 0.0.0.0:443\n    Certificate Hash             : a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0\n    Application ID               : {4dc3e181-e14b-4a21-b022-59fc669b0914}\n    Certificate Store Name       : My';
            }

            if (joined.includes('advfirewall') && joined.includes('443')) {
                if (scenario && scenario.id === 'port_blocked') {
                    engine.state._port443Blocked = false;
                    engine.state._portFixed = true;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() {
                        engine.notify('Firewall rule added for port 443. HTTPS traffic is now allowed. Check Server Manager for the recovery token.', 'success');
                    }, 400);
                    return '\nOk.\nRule "Allow HTTPS Inbound" added successfully.';
                }
            }

            return '\nUsage:\n    netsh http show sslcert\n    netsh http add sslcert ipport=0.0.0.0:443 certhash=HASH appid={GUID}\n    netsh advfirewall firewall add rule name="Allow HTTPS" dir=in action=allow protocol=tcp localport=443';
        },

        // --- PING ---
        ping: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping target_name';
            var target = args[args.length - 1];

            if (target === '10.0.1.10' || target === 'WEB-PROD-01' || target === 'localhost' || target === '127.0.0.1') {
                return '\nPinging ' + target + ' with 32 bytes of data:\nReply from ' + (target === 'localhost' || target === '127.0.0.1' ? '127.0.0.1' : '10.0.1.10') + ': bytes=32 time<1ms TTL=128\nReply from ' + (target === 'localhost' || target === '127.0.0.1' ? '127.0.0.1' : '10.0.1.10') + ': bytes=32 time<1ms TTL=128\nReply from ' + (target === 'localhost' || target === '127.0.0.1' ? '127.0.0.1' : '10.0.1.10') + ': bytes=32 time<1ms TTL=128\nReply from ' + (target === 'localhost' || target === '127.0.0.1' ? '127.0.0.1' : '10.0.1.10') + ': bytes=32 time<1ms TTL=128\n\nPing statistics for ' + target + ':\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
            }
            if (target === '10.0.1.11' || target === 'WEB-PROD-02') {
                return '\nPinging 10.0.1.11 with 32 bytes of data:\nReply from 10.0.1.11: bytes=32 time=1ms TTL=64\nReply from 10.0.1.11: bytes=32 time=1ms TTL=64\nReply from 10.0.1.11: bytes=32 time=1ms TTL=64\nReply from 10.0.1.11: bytes=32 time=1ms TTL=64\n\nPing statistics for 10.0.1.11:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
            }
            if (target === '10.0.1.20' || target === 'APP-PROD-01') {
                return '\nPinging 10.0.1.20 with 32 bytes of data:\nReply from 10.0.1.20: bytes=32 time<1ms TTL=128\nReply from 10.0.1.20: bytes=32 time<1ms TTL=128\nReply from 10.0.1.20: bytes=32 time<1ms TTL=128\nReply from 10.0.1.20: bytes=32 time<1ms TTL=128\n\nPing statistics for 10.0.1.20:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
            }
            return '\nPing request could not find host ' + target + '. Please check the name and try again.';
        },

        // --- CURL ---
        curl: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV001Config._getScenario(engine);

            if (joined.includes('localhost') || joined.includes('10.0.1.10') || joined.includes('portal.contoso')) {
                if (!engine.state._webServiceRunning) {
                    return '\ncurl: (7) Failed to connect to ' + (joined.includes('localhost') ? 'localhost' : '10.0.1.10') + ' port 443: Connection refused';
                }
                if (engine.state._port443Blocked && joined.includes('443')) {
                    return '\ncurl: (28) Connection timed out after 30001 milliseconds';
                }
                if (engine.state._sslExpired && joined.includes('https')) {
                    return '\ncurl: (60) SSL certificate problem: certificate has expired\nMore details here: https://curl.se/docs/sslcerts.html\n\ncurl failed to verify the legitimacy of the server and therefore could not\nestablish a secure connection to it.';
                }
                if (engine.state._appPoolCrashed) {
                    return '\nHTTP/1.1 503 Service Unavailable\nContent-Type: text/html\nServer: Microsoft-IIS/10.0\n\n<h2>503 - Service Unavailable</h2>\n<p>The application pool \'PortalAppPool\' is currently stopped.</p>';
                }
                return '\nHTTP/1.1 200 OK\nContent-Type: text/html\nServer: Microsoft-IIS/10.0\n\n<!DOCTYPE html><html><head><title>Contoso Portal</title></head><body><h1>Welcome to Contoso</h1></body></html>';
            }
            return '\ncurl: (6) Could not resolve host: ' + (args[0] || 'unknown');
        },

        // --- TASKLIST ---
        tasklist: function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var running = engine.state._webServiceRunning;
            var lines = '\nImage Name                     PID Session Name        Mem Usage\n========================= ======== ================ ===========\nSystem Idle Process              0 Services                  8 K\nSystem                           4 Services                252 K\nsmss.exe                       312 Services              1,124 K\ncsrss.exe                      448 Services              5,340 K\nlsass.exe                      564 Services             15,120 K\nsvchost.exe                    672 Services             25,460 K\n';
            if (running) {
                lines += 'w3wp.exe                      2184 Services            142,308 K\niissvchst.exe                 1234 Services              8,432 K\n';
            }
            lines += 'svchost.exe                   1456 Services             38,212 K\nRuntimeBroker.exe             2876 Console              22,144 K\n';
            return lines;
        },

        // --- GET-SERVICE (PowerShell) ---
        'get-service': function(args, term, engine) {
            var gate = SRV001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('w3svc') || !args.length) {
                var running = engine.state._webServiceRunning;
                return '\nStatus   Name               DisplayName\n------   ----               -----------\n' + (running ? 'Running' : 'Stopped') + '  W3SVC              World Wide Web Publishing Service';
            }
            return '\nGet-Service : Cannot find any service with service name \'' + args[0] + '\'.\n';
        },

        // --- UTILITY COMMANDS ---
        whoami: function() { return 'WEB-PROD-01\\Administrator'; },
        hostname: function() { return 'WEB-PROD-01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        dir: function() {
            return ' Volume in drive C has no label.\n Volume Serial Number is 9A2F-1B3E\n\n Directory of C:\\Users\\Administrator\n\n03/30/2026  06:15 AM    <DIR>          .\n03/30/2026  06:15 AM    <DIR>          ..\n03/30/2026  06:15 AM    <DIR>          Desktop\n03/30/2026  06:15 AM    <DIR>          Documents\n               0 File(s)              0 bytes\n               4 Dir(s)  428,000,000,000 bytes free';
        },
        ipconfig: function() {
            return '\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   Connection-specific DNS Suffix  . : contoso.com\n   IPv4 Address. . . . . . . . . . . : 10.0.1.10\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 10.0.1.1\n\n   DNS Servers . . . . . . . . . . . : 10.0.1.5\n                                       10.0.1.6';
        },
        systeminfo: function() {
            return '\nHost Name:                 WEB-PROD-01\nOS Name:                   Microsoft Windows Server 2022 Standard\nOS Version:                10.0.20348 N/A Build 20348\nSystem Manufacturer:       Dell Inc.\nSystem Model:              PowerEdge R750\nProcessor(s):              2 Processor(s) Installed.\n                           [01]: Intel(R) Xeon(R) Gold 5318Y @ 2.10GHz\nTotal Physical Memory:     65,536 MB\nAvailable Physical Memory: 48,102 MB';
        },

        // Block Linux commands
        ifconfig: function() { return '\'ifconfig\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        grep: function() { return '\'grep\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        apt: function() { return '\'apt\' is not recognized as an internal or external command,\noperable program or batch file.'; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['server_manager', 'event_viewer', 'task_manager', 'iis_manager'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }

        switch (iconDef.app) {
            case 'ticket':         SRV001Config._openTicket(iconDef, engine); break;
            case 'server_manager': SRV001Config._openServerManager(iconDef, engine); break;
            case 'event_viewer':   SRV001Config._openEventViewer(iconDef, engine); break;
            case 'task_manager':   SRV001Config._openTaskManager(iconDef, engine); break;
            case 'iis_manager':    SRV001Config._openIISManager(iconDef, engine); break;
            case 'reset_lab':      SRV001Config._confirmReset(engine); break;
        }
    },

    // ==========================================================
    // HELP DESK TICKET
    // ==========================================================

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        SRV001Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            SRV001Config._renderTicket(engine, container);
        } else {
            SRV001Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker(engine, container) {
        var ticketPreviews = [
            'NOC Alert — "Corporate website returning connection refused since 6:15 AM"',
            'Firewall Team — "HTTPS timing out after last night\'s rule change"',
            'Security Team — "Browser certificate warnings on portal.contoso.com"',
            'App Team — "Portal returning 503 errors after deployment"',
            'NOC Alert — "nginx reverse proxy killed by OOM — all sites behind proxy down"'
        ];

        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#6366f1; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">INCIDENT QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select an incident to begin troubleshooting, or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        SRV001Config._scenarios.forEach(function(s, i) {
            html += '<button class="srv001-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#6366f1; font-weight:bold;">INC-' + (5001 + i) + '</span>'
                + '<span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">SEV-1</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + ticketPreviews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';

        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="srv001RandomBtn" style="padding:10px 28px; background:#6366f1; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.srv001-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#6366f1'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                SRV001Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                SRV001Config._renderTicket(engine, container);
            });
        });

        document.getElementById('srv001RandomBtn').addEventListener('click', function() {
            SRV001Config._applyScenario(engine, Math.floor(Math.random() * SRV001Config._scenarios.length));
            SRV001Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        var scenario = SRV001Config._getScenario(engine);
        var submitters = [
            'NOC Automated Alert — Monitoring System',
            'Dave Chen — Network Security Team',
            'Sarah Kim — Information Security',
            'Mike Torres — Application Development',
            'NOC Automated Alert — Monitoring System'
        ];
        var submitter = submitters[engine.state._scenarioId] || 'System';
        var server = SRV001Config._servers[scenario.affectedServer];

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#6366f1; font-weight:bold; font-size:1rem;">INCIDENT #INC-' + (5001 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">SEV-1 CRITICAL</span>'
            + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">REPORTED BY</div>'
            + '<div>' + submitter + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DATE</div>'
            + '<div>March 30, 2026 — 7:34 AM</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">AFFECTED SERVER</div>'
            + '<div style="font-weight:bold; color:#6366f1;">' + server.name + '</div>'
            + '<div style="color:#888; font-size:0.7rem;">' + server.ip + ' &mdash; ' + server.os + ' &mdash; ' + server.role + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + SRV001Config._escHtml(scenario.ticketSubject) + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + SRV001Config._escHtml(scenario.ticketDetail)
            + '</div></div>'

            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div>'
            + '<div style="background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#a5b4fc;">'
            + SRV001Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')

            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div>'
            + '<div style="color:#2ecc71; font-weight:bold;">YOU — Server Administrator</div></div>';
    },

    // ==========================================================
    // SERVER MANAGER
    // ==========================================================

    _openServerManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); SRV001Config._renderServerManager(engine); return; }
        var container = document.createElement('div');
        container.id = 'srvMgrContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Server Manager', 'SRV', container);
        SRV001Config._renderServerManager(engine);
    },

    _renderServerManager(engine) {
        var container = document.getElementById('srvMgrContainer');
        if (!container) return;
        var scenario = SRV001Config._getScenario(engine);

        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Server Manager — Dashboard</div>';

        // Server status cards
        SRV001Config._servers.forEach(function(srv, i) {
            var isAffected = scenario && scenario.affectedServer === i;
            var statusOk = true;
            var statusText = 'Healthy';

            if (isAffected) {
                if (scenario.id === 'service_stopped' && !engine.state._webServiceRunning) { statusOk = false; statusText = 'W3SVC Stopped'; }
                else if (scenario.id === 'port_blocked' && engine.state._port443Blocked) { statusOk = false; statusText = 'Port 443 Not Bound'; }
                else if (scenario.id === 'ssl_expired' && engine.state._sslExpired) { statusOk = false; statusText = 'SSL Certificate Expired'; }
                else if (scenario.id === 'app_pool_crash' && engine.state._appPoolCrashed) { statusOk = false; statusText = 'App Pool Stopped'; }
                else if (scenario.id === 'oom_kill' && engine.state._nginxOomKilled) { statusOk = false; statusText = 'nginx OOM Killed'; }
            }

            html += '<div style="padding:12px; margin-bottom:8px; background:' + (statusOk ? 'rgba(46,204,113,0.06)' : 'rgba(231,76,60,0.06)') + '; border:1px solid ' + (statusOk ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.25)') + '; border-radius:4px;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<div><span style="font-weight:bold;">' + srv.name + '</span><br><span style="font-size:0.7rem; color:#888;">' + srv.ip + ' &mdash; ' + srv.role + '</span></div>'
                + '<span style="color:' + (statusOk ? '#2ecc71' : '#e74c3c') + '; font-weight:bold; font-size:0.85rem;">' + statusText + '</span>'
                + '</div></div>';
        });

        // Flag reveal
        if (engine.state._flagRevealed) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Incident Resolved:</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem;">' + scenario.fixDescription + '</div>'
                + '<div id="srv001-flag-reveal" style="color:#c8e6c9; font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>';

            setTimeout(function() {
                BoxEngine.requestFlagText(scenario.id).then(function(flagText) {
                    var el = document.getElementById('srv001-flag-reveal');
                    if (el) el.textContent = 'Recovery token: ' + (flagText || 'Flag unavailable');
                });
            }, 0);
        }

        container.innerHTML = html;
    },

    // ==========================================================
    // EVENT VIEWER
    // ==========================================================

    _openEventViewer(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Event Viewer', 'EVT', container);

        var scenario = SRV001Config._getScenario(engine);
        var events = [];

        events.push({ level: 'Information', time: '03/30/2026 05:58:12 AM', source: 'EventLog', id: 6005, msg: 'The Event log service was started.' });
        events.push({ level: 'Information', time: '03/30/2026 05:58:15 AM', source: 'Service Control Manager', id: 7036, msg: 'The Server service entered the running state.' });

        if (scenario) {
            if (scenario.id === 'service_stopped') {
                events.push({ level: 'Warning', time: '03/30/2026 05:58:45 AM', source: 'Service Control Manager', id: 7040, msg: 'The start type of the World Wide Web Publishing Service was changed from auto start to demand start.' });
                events.push({ level: 'Error', time: '03/30/2026 06:15:00 AM', source: 'IIS-W3SVC', id: 1009, msg: 'A process serving application pool \'DefaultAppPool\' failed to respond to a ping. The process id was \'0\'. W3SVC is not running.' });
            } else if (scenario.id === 'port_blocked') {
                events.push({ level: 'Warning', time: '03/30/2026 11:30:22 PM', source: 'HttpEvent', id: 15021, msg: 'An error occurred while using SSL configuration for endpoint 0.0.0.0:443. The SSL binding was removed.' });
            } else if (scenario.id === 'ssl_expired') {
                events.push({ level: 'Error', time: '03/30/2026 00:00:01 AM', source: 'Schannel', id: 36870, msg: 'A fatal error occurred while creating a TLS server credential. The certificate for portal.contoso.com has expired (NotAfter: 3/29/2026).' });
            } else if (scenario.id === 'app_pool_crash') {
                events.push({ level: 'Error', time: '03/30/2026 02:15:33 AM', source: 'IIS-W3SVC', id: 5002, msg: 'Application pool \'PortalAppPool\' is being automatically disabled due to a series of failures in the process(es) serving that application pool.' });
                events.push({ level: 'Error', time: '03/30/2026 02:15:30 AM', source: '.NET Runtime', id: 1026, msg: 'Application: w3wp.exe\nFramework Version: v4.0.30319\nFatal Execution Engine Error: System.StackOverflowException' });
            } else if (scenario.id === 'oom_kill') {
                events.push({ level: 'Error', time: '03/30/2026 04:12:33 AM', source: 'Kernel', id: 0, msg: '[Linux] Out of memory: Killed process 1847 (nginx) total-vm:524288kB, anon-rss:412672kB, file-rss:8192kB, shmem-rss:0kB' });
            }
        }

        events.push({ level: 'Information', time: '03/30/2026 05:59:00 AM', source: 'Service Control Manager', id: 7036, msg: 'The DNS Client service entered the running state.' });

        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Event Viewer — System Log</div>';
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

    // ==========================================================
    // TASK MANAGER
    // ==========================================================

    _openTaskManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Task Manager', 'TSK', container);

        var scenario = SRV001Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Task Manager — Performance</div>';

        html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">'
            + '<div style="padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;">'
            + '<div style="color:#888; font-size:0.7rem;">CPU</div><div style="font-size:1.2rem; font-weight:bold; color:#6366f1;">12%</div></div>'
            + '<div style="padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;">'
            + '<div style="color:#888; font-size:0.7rem;">Memory</div><div style="font-size:1.2rem; font-weight:bold; color:#6366f1;">26% (17.1 / 64 GB)</div></div>'
            + '<div style="padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;">'
            + '<div style="color:#888; font-size:0.7rem;">Disk</div><div style="font-size:1.2rem; font-weight:bold; color:#6366f1;">3%</div></div>'
            + '<div style="padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;">'
            + '<div style="color:#888; font-size:0.7rem;">Network</div><div style="font-size:1.2rem; font-weight:bold; color:#6366f1;">0.2 Mbps</div></div>'
            + '</div>';

        html += '<div style="font-weight:bold; margin-bottom:8px;">Processes:</div>';
        var procs = [
            { name: 'System', pid: 4, cpu: '0%', mem: '252 KB' },
            { name: 'svchost.exe', pid: 672, cpu: '1%', mem: '25 MB' },
            { name: 'lsass.exe', pid: 564, cpu: '0%', mem: '15 MB' }
        ];
        if (engine.state._webServiceRunning) {
            procs.push({ name: 'w3wp.exe (PortalAppPool)', pid: 2184, cpu: '3%', mem: '142 MB' });
        }
        procs.push({ name: 'svchost.exe', pid: 1456, cpu: '2%', mem: '38 MB' });

        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; border-bottom:1px solid rgba(255,255,255,0.08);">'
            + '<span style="flex:2;">Name</span><span style="flex:0.5;">PID</span><span style="flex:0.5;">CPU</span><span style="flex:1;">Memory</span></div>';
        procs.forEach(function(p) {
            html += '<div style="display:flex; padding:4px 8px; font-size:0.75rem; border-bottom:1px solid rgba(255,255,255,0.04);">'
                + '<span style="flex:2;">' + p.name + '</span><span style="flex:0.5; color:#888;">' + p.pid + '</span><span style="flex:0.5; color:#888;">' + p.cpu + '</span><span style="flex:1; color:#888;">' + p.mem + '</span></div>';
        });

        container.innerHTML = html;
    },

    // ==========================================================
    // IIS MANAGER
    // ==========================================================

    _openIISManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); SRV001Config._renderIISManager(engine); return; }
        var container = document.createElement('div');
        container.id = 'iisContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'IIS Manager', 'IIS', container);
        SRV001Config._renderIISManager(engine);
    },

    _renderIISManager(engine) {
        var container = document.getElementById('iisContainer');
        if (!container) return;
        var scenario = SRV001Config._getScenario(engine);

        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Internet Information Services (IIS) Manager</div>';

        // Sites
        html += '<div style="font-weight:bold; margin-bottom:8px;">Sites:</div>';
        var siteStatus = engine.state._webServiceRunning ? 'Started' : 'Stopped';
        var siteColor = engine.state._webServiceRunning ? '#2ecc71' : '#e74c3c';

        html += '<div style="padding:8px 12px; margin-bottom:8px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;">'
            + '<div style="font-weight:bold;">Default Web Site</div>'
            + '<div style="font-size:0.75rem; color:#888;">Binding: *:80 (http), *:443 (https)</div>'
            + '<div style="font-size:0.75rem; color:' + siteColor + ';">Status: ' + siteStatus + '</div></div>';

        // Application Pools
        html += '<div style="font-weight:bold; margin-bottom:8px; margin-top:16px;">Application Pools:</div>';
        var pools = [
            { name: 'DefaultAppPool', status: 'Started' },
            { name: 'PortalAppPool', status: engine.state._appPoolCrashed ? 'Stopped' : 'Started' },
            { name: '.NET v4.5', status: 'Started' }
        ];

        pools.forEach(function(pool) {
            var isStopped = pool.status === 'Stopped';
            html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:6px 12px; margin-bottom:4px; background:' + (isStopped ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isStopped ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.06)') + '; border-radius:3px;">'
                + '<span>' + pool.name + '</span>'
                + '<span style="color:' + (isStopped ? '#e74c3c' : '#2ecc71') + '; font-weight:' + (isStopped ? 'bold' : 'normal') + ';">' + pool.status + '</span></div>';
        });

        // SSL Bindings
        html += '<div style="font-weight:bold; margin-bottom:8px; margin-top:16px;">SSL Bindings:</div>';
        if (engine.state._port443Blocked) {
            html += '<div style="padding:8px 12px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:4px; color:#e74c3c;">'
                + 'No SSL certificate binding found for port 443. HTTPS is not available.</div>';
        } else if (engine.state._sslExpired) {
            html += '<div style="padding:8px 12px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:4px;">'
                + '<div>Certificate: portal.contoso.com</div>'
                + '<div style="color:#e74c3c; font-weight:bold;">Status: EXPIRED (Mar 29, 2026)</div>'
                + '<div style="color:#888; font-size:0.75rem;">Issuer: DigiCert SHA2 Extended Validation Server CA</div></div>';
        } else {
            html += '<div style="padding:8px 12px; background:rgba(46,204,113,0.06); border:1px solid rgba(46,204,113,0.15); border-radius:4px;">'
                + '<div>Certificate: portal.contoso.com</div>'
                + '<div style="color:#2ecc71;">Status: Valid (expires Jan 15, 2027)</div></div>';
        }

        // Flag reveal
        if (engine.state._flagRevealed && scenario) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Fix Confirmed:</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem;">' + scenario.fixDescription + '</div>'
                + '<div id="srv001-iis-flag" style="color:#c8e6c9; font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>';

            setTimeout(function() {
                BoxEngine.requestFlagText(scenario.id).then(function(flagText) {
                    var el = document.getElementById('srv001-iis-flag');
                    if (el) el.textContent = 'Recovery token: ' + (flagText || 'Flag unavailable');
                });
            }, 0);
        }

        container.innerHTML = html;
    },

    // ==========================================================
    // RESET LAB
    // ==========================================================

    _confirmReset(engine) {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;">'
            + '<div style="font-size:1rem; font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div>'
            + '<div style="font-size:0.8rem; color:#aaa; margin-bottom:20px;">This will clear all progress, generate a new scenario, and restart from the beginning.</div>'
            + '<div style="display:flex; gap:12px; justify-content:center;">'
            + '<button id="srv001ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Reset</button>'
            + '<button id="srv001ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div></div>';

        var arena = document.getElementById('arena');
        arena.appendChild(overlay);

        document.getElementById('srv001ResetConfirm').addEventListener('click', function() {
            SRV001Config._flagRestored = false;
            SRV001Config.hints = SRV001Config._defaultHints;
            engine.reset();
        });
        document.getElementById('srv001ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

};
