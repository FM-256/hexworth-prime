/* ============================================================
   DISPATCH LAB — Box PR1: Printer Nightmare
   CompTIA A+ Core 2 — Troubleshooting Printers (220-1102)
   Config: printer state, Windows commands, GUI, scenarios
   5 distinct scenarios: spooler crash, wrong driver, IP change,
   permissions denied, stuck queue
   ============================================================ */

var PR1Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Printer Nightmare',
    subtitle: 'The Floor Is Screaming — A+ Core 2 Printer Troubleshooting',
    difficulty: 'Beginner',
    accent: '#e67e22',
    storageKey: 'hexworth_lab_pr1',
    registryId: 'pr001-printer-nightmare',
    trackerKey: 'lab_pr1',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Help Desk Ticket',
                tip: 'Double-click the Help Desk Ticket icon to read the user complaint and get your assignment.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Identify the affected printer',
                tip: 'Open Print Management to see all printers and their current status. Look for errors, wrong drivers, or offline states.',
                trigger: { event: 'window_open', match: { type: 'print_management' } }
            },
            {
                title: 'Investigate the root cause',
                tip: 'Use Print Management, Services, or Command Prompt. Each problem has a different root cause and a different tool to fix it.',
                trigger: {
                    event: 'window_open',
                    match: { type: 'services' },
                    alt: [
                        { event: 'window_open', match: { type: 'print_queue' } },
                        { event: 'command', match: { cmd: 'contains:spooler' } },
                        { event: 'command', match: { cmd: 'contains:ping' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Stop the spooler, clear spool files, change a driver, update a port, fix permissions, or clear the queue. The right tool depends on the problem.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:net' },
                    alt: [
                        { event: 'window_open', match: { type: 'print_management' } }
                    ]
                }
            },
            {
                title: 'Capture the flag',
                tip: 'After fixing the printer, find where the flag was logged. It varies by scenario — check the tool you used to fix the problem.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES (A+ Core 2 mapping)
    // ==========================================================

    certObjectives: {
        certPath: 'A+ Core 2',
        mappings: [
            { flagId: 'fixed', objective: '3.1', description: 'Troubleshoot common Windows OS problems', skill: 'Print Spooler Service Management' },
            { flagId: 'fixed', objective: '3.3', description: 'Troubleshoot common hardware problems', skill: 'Printer Driver and Port Configuration' }
        ]
    },

    // ==========================================================
    // PRINTER DATA
    // ==========================================================

    _printers: [
        { name: 'HP LaserJet Pro M404', ip: null, port: 'USB001', location: 'Front Desk', type: 'USB', driver: 'HP Universal Print Driver', status: 'Ready' },
        { name: 'Xerox WorkCentre 6515', ip: '192.168.1.200', port: 'IP_192.168.1.200', location: 'Bullpen', type: 'Network', driver: 'Xerox WorkCentre 6515 PCL6', status: 'Ready' },
        { name: 'Canon imageCLASS MF445dw', ip: '192.168.1.201', port: 'IP_192.168.1.201', location: 'Conference Room', type: 'Network', driver: 'Canon Generic Plus UFR II', status: 'Ready' }
    ],

    // ==========================================================
    // SCENARIO FLAGS
    // ==========================================================

    _scenarioFlags: {
        spooler_crash:    null,
        wrong_driver:     null,
        ip_changed:       null,
        perms_denied:     null,
        stuck_queue:      null
    },

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            id: 'spooler_crash',
            name: 'Spooler Crash',
            ticketSubject: 'HP printer at Front Desk shows errors for everything — nothing prints',
            ticketDetail: 'Every single print job I send to the HP at the front desk shows "Error - Printing" immediately. Nothing comes out at all. I tried restarting my computer twice and it made no difference. My coworkers are having the same problem. The queue shows jobs piling up but nothing moves.',
            ticketExtra: 'IT Note: The print server reported an unexpected restart of the Print Spooler service around 7:42 AM. Some jobs may have been mid-stream when the crash occurred.',
            affectedPrinter: 0,
            fixDescription: 'Stop spooler, clear stuck spool files, restart spooler',
            stateOverrides: { _spoolerRunning: false, _spoolFilesStuck: true }
        },
        {
            id: 'wrong_driver',
            name: 'Wrong Driver',
            ticketSubject: 'Xerox in Bullpen is printing random characters — pages full of gibberish',
            ticketDetail: 'The Xerox printer in the bullpen is going crazy. Every page that comes out is covered in random characters, symbols, and gibberish text. It looks like the printer is receiving raw data it can\'t interpret. This started after the IT team pushed an update yesterday afternoon. Multiple people are affected.',
            ticketExtra: 'IT Note: A driver update package was deployed via Group Policy at 4:15 PM yesterday. Three workstations in the bullpen may have received an incorrect driver assignment.',
            affectedPrinter: 1,
            fixDescription: 'Change printer driver to correct Xerox WorkCentre 6515 PCL6 driver',
            stateOverrides: { _xeroxDriver: 'Generic / Text Only' }
        },
        {
            id: 'ip_changed',
            name: 'IP Changed (DHCP Collision)',
            ticketSubject: 'Canon in Conference Room shows Offline — but the printer is ON',
            ticketDetail: 'The Canon printer in the conference room shows "Offline" in the print queue, but I am LITERALLY standing in front of it right now and it is powered on with no error lights. The display panel shows it is ready. I have tried sending a test page and it just queues up and nothing happens. We have a board meeting in this room at 2 PM.',
            ticketExtra: 'IT Note: Network team reports a DHCP conflict was detected overnight on the 192.168.1.x subnet. Several devices may have received new IP assignments. The static reservation for the Canon may have been overridden.',
            affectedPrinter: 2,
            fixDescription: 'Ping to find new IP (.210), update printer port to 192.168.1.210',
            stateOverrides: { _canonNewIp: '192.168.1.210' }
        },
        {
            id: 'perms_denied',
            name: 'Permissions Denied',
            ticketSubject: 'New intern cannot print to HP at Front Desk — Access Denied',
            ticketDetail: 'Tyler, our new intern, gets an "Access Denied" error every time he tries to print to the HP at the front desk. Everyone else in the office prints to it just fine, including me. Tyler said he tried from two different applications and gets the same error both times. He needs to print orientation documents today.',
            ticketExtra: 'IT Note: Accounts team ran a quarterly permissions audit last Friday and may have modified printer ACLs on several shared devices. The audit script targets non-admin accounts.',
            affectedPrinter: 0,
            fixDescription: 'Add Users group back to printer Security tab with Print permission',
            stateOverrides: { _hpPermissionsStripped: true }
        },
        {
            id: 'stuck_queue',
            name: 'Stuck Queue',
            ticketSubject: 'Xerox queue shows 317 pages queued — nothing is printing',
            ticketDetail: 'The Xerox in the bullpen has 317 pages in the queue and nothing is printing. The queue has been like this for over an hour. Some jobs show "Error" status. Other people keep adding print jobs and now it is completely backed up. Can you please clear this out? The whole office is waiting.',
            ticketExtra: 'IT Note: Print server logs show 15 jobs entered an Error state starting at 9:23 AM. These appear to be blocking all subsequent jobs. Spooler is running but overwhelmed.',
            affectedPrinter: 1,
            fixDescription: 'Cancel all stuck jobs from queue; optionally restart spooler for clean state',
            stateOverrides: { _xeroxQueueStuck: true }
        }
    ],

    // ==========================================================
    // PER-SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Open Print Management to see all printer statuses. The affected printer is in the ticket.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a different root cause. Check the Print Queue, Services, and driver settings depending on the symptom.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Some fixes require stopping the Print Spooler service first. Others require changing a driver, port, or permission.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears in the tool you used to complete the fix. Look carefully after applying the solution.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        spooler_crash: [
            { id: 'hint1', text: 'Open Services and check whether the Print Spooler service is running.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The spooler is stopped. But simply restarting it fails — stuck spool files are blocking it. You need to clear those first.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Stop the spooler first (net stop spooler), then delete: C:\\Windows\\System32\\spool\\PRINTERS\\*.*', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Full fix: net stop spooler, then del C:\\Windows\\System32\\spool\\PRINTERS\\*.*, then net start spooler. Check Services after.', cost: 150, penalty: -150 }
        ],
        wrong_driver: [
            { id: 'hint1', text: 'Gibberish output almost always means a driver mismatch. The printer is receiving data it cannot interpret.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open Print Management, find the Xerox, go to Properties, then check the Advanced tab — look at the Driver field.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The driver was changed to "Generic / Text Only". It should be "Xerox WorkCentre 6515 PCL6". Change it in the Advanced tab.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Print Management: right-click Xerox, Properties, Advanced tab, change Driver dropdown to "Xerox WorkCentre 6515 PCL6", Apply.', cost: 150, penalty: -150 }
        ],
        ip_changed: [
            { id: 'hint1', text: '"Offline" on a network printer usually means connectivity. Start by pinging the printer\'s IP address.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Ping 192.168.1.201 — it fails. The printer is on the network but at a different IP now. Try pinging nearby addresses.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The printer moved to 192.168.1.210 due to a DHCP conflict. Ping that address to confirm, then update the printer port.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Print Management: right-click Canon, Properties, Ports tab, add a new Standard TCP/IP Port for 192.168.1.210, then select it.', cost: 150, penalty: -150 }
        ],
        perms_denied: [
            { id: 'hint1', text: '"Access Denied" when printing usually means the user\'s account lacks Print permission on that printer.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open Print Management, right-click the HP LaserJet, Properties, Security tab — check who has permissions.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The "Users" group was removed from the printer ACL. Only Administrators have Print permission now. Add Users back.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In the Security tab: Add button, type "Users", check "Print" permission, Apply. This restores access for all standard accounts.', cost: 150, penalty: -150 }
        ],
        stuck_queue: [
            { id: 'hint1', text: 'Open the Print Queue for the Xerox and count how many jobs are in Error state.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Jobs in "Error" state are blocking the queue. You need to cancel them. Try the Printer menu in the queue window.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use Printer menu in the queue window and choose "Cancel All Documents". If jobs persist, restart the spooler.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Cancel All Documents clears the queue. Then run net stop spooler / net start spooler for a clean restart. Check the queue after.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !PR1Config._flagRestored) {
            PR1Config._flagRestored = true;
            const scenario = PR1Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                PR1Config.hints = PR1Config._scenarioHints[scenario.id] || PR1Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;

        // Reset printer-specific state
        engine.state._spoolerRunning = true;
        engine.state._spoolFilesStuck = false;
        engine.state._xeroxDriver = 'Xerox WorkCentre 6515 PCL6';
        engine.state._canonNewIp = null;
        engine.state._hpPermissionsStripped = false;
        engine.state._xeroxQueueStuck = false;
        engine.state._queueCleared = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        // Apply scenario-specific overrides
        const overrides = PR1Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) {
            engine.state[key] = overrides[key];
        }

        // Set dynamic hints
        const scenario = PR1Config._scenarios[idx];
        PR1Config._flagRestored = true;
        PR1Config.hints = PR1Config._scenarioHints[scenario.id] || PR1Config._defaultHints;

        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return PR1Config._scenarios[engine.state._scenarioId];
    },

    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first to receive your assignment.';
        }
        return null;
    },

    _getPrinterState(engine, idx) {
        // Returns effective printer config accounting for scenario overrides
        var p = JSON.parse(JSON.stringify(PR1Config._printers[idx]));
        var scenario = PR1Config._getScenario(engine);
        if (!scenario) return p;

        if (scenario.id === 'spooler_crash' && idx === 0) {
            p.status = engine.state._spoolerRunning ? 'Ready' : 'Error - Printing';
        }
        if (scenario.id === 'wrong_driver' && idx === 1) {
            p.driver = engine.state._xeroxDriver || p.driver;
            p.status = (engine.state._xeroxDriver === 'Generic / Text Only') ? 'Ready (Wrong Driver)' : 'Ready';
        }
        if (scenario.id === 'ip_changed' && idx === 2) {
            p.status = engine.state._canonPortFixed ? 'Ready' : 'Offline';
        }
        if (scenario.id === 'perms_denied' && idx === 0) {
            p.status = engine.state._hpPermissionsStripped ? 'Ready (Access Restricted)' : 'Ready';
        }
        if (scenario.id === 'stuck_queue' && idx === 1) {
            p.status = engine.state._queueCleared ? 'Ready' : 'Error - Queue Backed Up';
        }
        return p;
    },

    _isSpoolerRunning(engine) {
        return engine.state._spoolerRunning !== false;
    },

    _escHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // ==========================================================
    // BOOT SEQUENCE (Windows)
    // ==========================================================

    boot: {
        biosLines: [
            'American Megatrends UEFI BIOS v2.20.1271',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... NVMe: WD SN750 (512GB)',
            'Network: Intel(R) Ethernet Connection I219-V',
            'USB: 4 ports detected',
            'Boot device: NVMe0',
            'Loading Windows Boot Manager...'
        ],
        grubEntries: [
            'Windows 10 Pro',
            'Windows Recovery Environment'
        ],
        loginUser: 'Technician'
    },

    // ==========================================================
    // DESKTOP ICONS
    // ==========================================================

    desktop: {
        icons: [
            { id: 'cmd',              label: 'Command\nPrompt',     icon: '>_',  app: 'terminal' },
            { id: 'print_management', label: 'Print\nManagement',   icon: 'PRT', app: 'print_management' },
            { id: 'print_queue',      label: 'Print\nQueue',        icon: 'QUE', app: 'print_queue' },
            { id: 'services',         label: 'Services',            icon: 'SVC', app: 'services' },
            { id: 'network',          label: 'Network\nSettings',   icon: 'NET', app: 'network_settings' },
            { id: 'ticket',           label: 'Help Desk\nTicket',   icon: 'HD',  app: 'ticket' },
            { id: 'hints',            label: 'Hints',               icon: '?',   app: 'hints' },
            { id: 'reset',            label: 'Reset\nLab',          icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG (Windows CMD)
    // ==========================================================

    terminal: {
        user: 'Technician',
        hostname: 'HELPDESK01',
        startDir: 'C:\\Users\\Technician',
        promptStyle: 'windows',
        welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n'
    },

    // ==========================================================
    // FILESYSTEM (minimal)
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
        minScore: 0,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ==========================================================
    // HINTS (replaced per-scenario by _applyScenario)
    // ==========================================================

    hints: [
        { id: 'hint1', text: 'Open Print Management and look at the status of all printers.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each printer problem has a different root cause. Check the queue, driver, port, and service.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Some fixes need the spooler stopped first. Others need a driver or port change.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag is in the tool you used to fix the problem.', cost: 50, penalty: -50 }
    ],

    // ==========================================================
    // LORE
    // ==========================================================

    lore: {
        intro: 'A flurry of help desk tickets just arrived. Printers across the office are broken in different ways. As the desktop support technician, your job is to diagnose each problem and apply the correct fix.',
        scenario: 'The office printers have been misconfigured to simulate real-world failures. Each scenario has a unique root cause — do not assume they are all the same problem. Use the right tool for each job.',
        outro: 'Printers restored. The floor has stopped screaming. Your systematic troubleshooting identified and resolved the print infrastructure failures efficiently.'
    },

    // ==========================================================
    // PHASES
    // ==========================================================

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the help desk ticket and examine printer statuses in Print Management.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the root cause — spooler, driver, port, permissions, or queue.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the correct fix using the appropriate Windows tool.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm the printer is operational and locate the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // CUSTOM COMMANDS (Windows CMD / PowerShell)
    // ==========================================================

    commands: {

        // --- NET (spooler control) ---

        net: function(args, term, engine) {
            var gate = PR1Config._requireScenario(engine);
            if (gate) return gate;

            var joined = args.join(' ').toLowerCase();

            // net stop spooler / net stop "print spooler"
            if ((joined.includes('stop') && (joined.includes('spooler') || joined.includes('print spooler')))) {
                if (!PR1Config._isSpoolerRunning(engine)) {
                    return '\nThe Print Spooler service is not started.\n';
                }
                engine.state._spoolerRunning = false;
                engine.save();
                return '\nThe Print Spooler service is stopping.\nThe Print Spooler service was stopped successfully.\n';
            }

            // net start spooler / net start "print spooler"
            if ((joined.includes('start') && (joined.includes('spooler') || joined.includes('print spooler')))) {
                if (PR1Config._isSpoolerRunning(engine)) {
                    return '\nThe requested service has already been started.\n';
                }
                if (engine.state._spoolFilesStuck) {
                    return '\nSystem error 1053 has occurred.\n\nThe service did not respond to the start or control request in a timely fashion.\n\nHint: Stuck spool files may be blocking service start. Clear C:\\Windows\\System32\\spool\\PRINTERS\\';
                }
                // Spooler starts cleanly
                engine.state._spoolerRunning = true;
                engine.save();

                // If this is the spooler_crash scenario, mark as fixed and reveal flag
                var scenario = PR1Config._getScenario(engine);
                if (scenario && scenario.id === 'spooler_crash' && !engine.state._flagRevealed) {
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() {
                        engine.notify('Print Spooler restarted successfully. Check Services for the recovery token.', 'success');
                    }, 400);
                }
                return '\nThe Print Spooler service is starting.\nThe Print Spooler service was started successfully.\n';
            }

            if (joined === 'use' || joined.startsWith('use ') || joined.includes('help') || !args.length) {
                return '\nUsage:\n    net start <service>\n    net stop <service>\n    net use\n    net user\n\nExamples:\n    net stop spooler\n    net stop "Print Spooler"\n    net start spooler';
            }

            return '\nThe syntax of this command is:\n\nNET [ ACCOUNTS | COMPUTER | CONFIG | CONTINUE | FILE | GROUP |\n      HELP | HELPMSG | LOCALGROUP | PAUSE | PRINT | SEND |\n      SESSION | SHARE | START | STATISTICS | STOP | TIME | USE |\n      USER | VIEW ]';
        },

        // --- DEL (spool file clearing) ---

        del: function(args, term, engine) {
            var gate = PR1Config._requireScenario(engine);
            if (gate) return gate;

            var target = args.join(' ').toLowerCase();

            // Clearing spool files
            if (target.includes('spool') && target.includes('printers')) {
                if (PR1Config._isSpoolerRunning(engine)) {
                    return '\nAccess is denied.\n\nThe Print Spooler service must be stopped before spool files can be deleted.\nRun: net stop spooler';
                }
                if (!engine.state._spoolFilesStuck) {
                    return '\nC:\\Windows\\System32\\spool\\PRINTERS\\*, 0 File(s) deleted.\n';
                }
                engine.state._spoolFilesStuck = false;
                engine.save();
                return '\nC:\\Windows\\System32\\spool\\PRINTERS\\*.* \nDeleted 7 File(s)\n(FP00142.SPL, FP00143.SPL, FP00144.SPL, FP00145.SPL, FP00146.SPL, FP00142.SHD, FP00143.SHD)\n';
            }

            return '\nCould not find ' + args.join(' ');
        },

        // --- PING ---

        ping: function(args, term, engine) {
            var gate = PR1Config._requireScenario(engine);
            if (gate) return gate;

            if (!args.length || args[0] === '/?') {
                return '\nUsage: ping [-n count] target_name\n\nOptions:\n    -n count    Number of echo requests to send.\n    target_name IP address or hostname.';
            }

            var target = null;
            for (var i = 0; i < args.length; i++) {
                if (!args[i].startsWith('-') && !args[i].startsWith('/')) { target = args[i]; break; }
            }
            if (!target) return 'Bad parameter.';

            var scenario = PR1Config._getScenario(engine);

            // Loopback
            if (target === '127.0.0.1' || target === 'localhost') {
                return '\nPinging 127.0.0.1 with 32 bytes of data:\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\n\nPing statistics for 127.0.0.1:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 0ms, Maximum = 0ms, Average = 0ms';
            }

            // Network printers — Xerox always responds
            if (target === '192.168.1.200') {
                return '\nPinging 192.168.1.200 with 32 bytes of data:\nReply from 192.168.1.200: bytes=32 time=2ms TTL=64\nReply from 192.168.1.200: bytes=32 time=1ms TTL=64\nReply from 192.168.1.200: bytes=32 time=2ms TTL=64\nReply from 192.168.1.200: bytes=32 time=1ms TTL=64\n\nPing statistics for 192.168.1.200:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 1ms, Maximum = 2ms, Average = 1ms';
            }

            // Canon — old IP fails in ip_changed scenario
            if (target === '192.168.1.201') {
                if (scenario && scenario.id === 'ip_changed') {
                    return '\nPinging 192.168.1.201 with 32 bytes of data:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\nPing statistics for 192.168.1.201:\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),';
                }
                return '\nPinging 192.168.1.201 with 32 bytes of data:\nReply from 192.168.1.201: bytes=32 time=3ms TTL=64\nReply from 192.168.1.201: bytes=32 time=2ms TTL=64\nReply from 192.168.1.201: bytes=32 time=3ms TTL=64\nReply from 192.168.1.201: bytes=32 time=2ms TTL=64\n\nPing statistics for 192.168.1.201:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 2ms, Maximum = 3ms, Average = 2ms';
            }

            // Canon new IP in ip_changed scenario
            if (target === '192.168.1.210') {
                if (scenario && scenario.id === 'ip_changed') {
                    if (!engine.state._flagRevealed) {
                        engine.state._flagRevealed = true;
                        engine.state._labComplete = true;
                        engine.save();
                        setTimeout(function() {
                            engine.notify('Canon printer found at 192.168.1.210! Update the printer port to fix "Offline" status.', 'success');
                        }, 400);
                    }
                    return '\nPinging 192.168.1.210 with 32 bytes of data:\nReply from 192.168.1.210: bytes=32 time=3ms TTL=64\nReply from 192.168.1.210: bytes=32 time=2ms TTL=64\nReply from 192.168.1.210: bytes=32 time=3ms TTL=64\nReply from 192.168.1.210: bytes=32 time=2ms TTL=64\n\nPing statistics for 192.168.1.210:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 2ms, Maximum = 3ms, Average = 2ms\n\n  [Canon imageCLASS MF445dw — responding at new address]';
                }
                return '\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\nPing statistics for 192.168.1.210:\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),';
            }

            // Gateway and workstation
            if (target === '192.168.1.1') {
                return '\nPinging 192.168.1.1 with 32 bytes of data:\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\n\nPing statistics for 192.168.1.1:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
            }
            if (target === '192.168.1.50') {
                return '\nPinging 192.168.1.50 with 32 bytes of data:\nReply from 192.168.1.50: bytes=32 time<1ms TTL=128\nReply from 192.168.1.50: bytes=32 time<1ms TTL=128\nReply from 192.168.1.50: bytes=32 time<1ms TTL=128\nReply from 192.168.1.50: bytes=32 time<1ms TTL=128\n\nPing statistics for 192.168.1.50:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
            }

            // Unknown targets
            return '\nPing request could not find host ' + target + '. Please check the name and try again.';
        },

        // --- WMIC PRINTER ---

        wmic: function(args, term, engine) {
            var gate = PR1Config._requireScenario(engine);
            if (gate) return gate;

            var joined = args.join(' ').toLowerCase();
            if (!joined.includes('printer')) {
                return '\nwmic ' + args.join(' ') + '\nNode - HELPDESK01\nInvalid format. Please check the format and rerun the command.';
            }

            if (joined.includes('list brief')) {
                var lines = '\nNode - HELPDESK01\n\n';
                lines += 'DeviceID                          Name                            PortName           DriverName                        Status\n';
                lines += '------------------------------------------------------------------------------------------------------------------------------------------------------\n';
                PR1Config._printers.forEach(function(p, i) {
                    var state = PR1Config._getPrinterState(engine, i);
                    lines += (state.name + '    ').substring(0, 34) + '  '
                        + (state.name + '    ').substring(0, 30) + '  '
                        + (state.port + '                ').substring(0, 18) + '  '
                        + (state.driver + '                          ').substring(0, 26) + '  '
                        + state.status + '\n';
                });
                return lines;
            }

            // wmic printer where Name="X" get DriverName,PortName,Status
            var nameMatch = joined.match(/where\s+name\s*=\s*"([^"]+)"/i) || joined.match(/where\s+name\s*=\s*'([^']+)'/i);
            if (nameMatch) {
                var searchName = nameMatch[1].toLowerCase();
                var found = null;
                PR1Config._printers.forEach(function(p, i) {
                    if (p.name.toLowerCase().includes(searchName)) {
                        found = PR1Config._getPrinterState(engine, i);
                    }
                });
                if (!found) return '\nNo Instance(s) Available.';
                return '\nNode - HELPDESK01\n\nDriverName                             PortName              Status\n---------------------------------------------------------------------------\n' + found.driver + '    ' + found.port + '    ' + found.status;
            }

            return '\nNode - HELPDESK01\n\nInvalid format. Usage: wmic printer list brief\n                       wmic printer where Name="PrinterName" get DriverName,PortName,Status';
        },

        // --- SC QUERY ---

        sc: function(args, term, engine) {
            var gate = PR1Config._requireScenario(engine);
            if (gate) return gate;

            var joined = args.join(' ').toLowerCase();
            if (joined.includes('query') && joined.includes('spooler')) {
                var running = PR1Config._isSpoolerRunning(engine);
                return '\nSERVICE_NAME: Spooler\n        TYPE               : 110  WIN32_OWN_PROCESS  (interactive)\n        STATE              : ' + (running ? '4  RUNNING\n                                (STOPPABLE, NOT_PAUSABLE, ACCEPTS_SHUTDOWN)' : '1  STOPPED\n                                (NOT_STOPPABLE, NOT_PAUSABLE, IGNORES_SHUTDOWN)') + '\n        WIN32_EXIT_CODE    : 0  (0x0)\n        SERVICE_EXIT_CODE  : 0  (0x0)\n        CHECKPOINT         : 0x0\n        WAIT_HINT          : 0x0';
            }
            return '\nUsage: sc query <service_name>\nExample: sc query spooler';
        },

        // --- GET-SERVICE (PowerShell style) ---

        'get-service': function(args, term, engine) {
            var gate = PR1Config._requireScenario(engine);
            if (gate) return gate;

            var joined = args.join(' ').toLowerCase();
            if (!args.length || joined.includes('spooler')) {
                var running = PR1Config._isSpoolerRunning(engine);
                return '\nStatus   Name               DisplayName\n------   ----               -----------\n' + (running ? 'Running' : 'Stopped') + '  Spooler            Print Spooler';
            }
            return '\nGet-Service : Cannot find any service with service name \'' + args[0] + '\'.\n';
        },

        // --- RESTART-SERVICE (PowerShell style) ---

        'restart-service': function(args, term, engine) {
            var gate = PR1Config._requireScenario(engine);
            if (gate) return gate;

            var joined = args.join(' ').toLowerCase();
            if (joined.includes('spooler')) {
                if (engine.state._spoolFilesStuck) {
                    return '\nRestart-Service : Failed to start service \'Spooler\'.\nService cannot be started due to a stuck spool file. Clear C:\\Windows\\System32\\spool\\PRINTERS\\ first.\n    At line:1 char:1';
                }
                engine.state._spoolerRunning = true;
                engine.save();
                var scenario = PR1Config._getScenario(engine);
                if (scenario && scenario.id === 'spooler_crash' && !engine.state._flagRevealed) {
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() {
                        engine.notify('Print Spooler restarted successfully. Check Services for the recovery token.', 'success');
                    }, 400);
                }
                return '\n(no output — service restarted successfully)\n';
            }
            return '\nRestart-Service : Cannot find any service with service name \'' + args[0] + '\'.\n';
        },

        // --- GET-PRINTER (PowerShell style) ---

        'get-printer': function(args, term, engine) {
            var gate = PR1Config._requireScenario(engine);
            if (gate) return gate;

            var joined = args.join(' ').toLowerCase();
            var nameMatch = joined.match(/-name\s+"([^"]+)"/i) || joined.match(/-name\s+'([^']+)'/i) || joined.match(/-name\s+(\S+)/i);

            if (nameMatch) {
                var searchName = nameMatch[1].toLowerCase();
                var found = null;
                var foundIdx = -1;
                PR1Config._printers.forEach(function(p, i) {
                    if (p.name.toLowerCase().includes(searchName)) {
                        found = PR1Config._getPrinterState(engine, i);
                        foundIdx = i;
                    }
                });
                if (!found) return '\nGet-Printer : No printer with the name \'' + nameMatch[1] + '\' could be found.\n';
                return '\nName                : ' + found.name + '\nComputerName        : \nType                : ' + found.type + '\nDriverName          : ' + found.driver + '\nPortName            : ' + found.port + '\nPrinterStatus       : ' + found.status + '\nPublished           : False\nShared              : False\nShareName           : \nLocation            : ' + found.location;
            }

            // List all
            var out = '\nName                              DriverName                           PortName              PrinterStatus\n';
            out += '----                              ----------                           --------              -------------\n';
            PR1Config._printers.forEach(function(p, i) {
                var state = PR1Config._getPrinterState(engine, i);
                out += (state.name + '                                ').substring(0, 34) + '  '
                    + (state.driver + '                                     ').substring(0, 37) + '  '
                    + (state.port + '                    ').substring(0, 22) + '  '
                    + state.status + '\n';
            });
            return out;
        },

        // --- LPSTAT / LPQ ---

        lpq: function() {
            return '\nUsage: lpq -S <server> -P <printer>\n\nExample:\n    lpq -S \\\\localhost -P "HP LaserJet Pro M404"\n\nNote: This command shows the print queue for the specified printer.';
        },

        // --- WHOAMI / SYSTEM INFO ---

        whoami: function() { return 'HELPDESK01\\Technician'; },

        hostname: function() { return 'HELPDESK01'; },

        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },

        dir: function() {
            return ' Volume in drive C has no label.\n Volume Serial Number is 7F3A-2B4E\n\n Directory of C:\\Users\\Technician\n\n03/13/2026  08:15 AM    <DIR>          .\n03/13/2026  08:15 AM    <DIR>          ..\n03/13/2026  08:15 AM    <DIR>          Desktop\n03/13/2026  08:15 AM    <DIR>          Documents\n03/13/2026  08:15 AM    <DIR>          Downloads\n               0 File(s)              0 bytes\n               5 Dir(s)  214,748,364,800 bytes free';
        },

        systeminfo: function(args, term, engine) {
            return '\nHost Name:                 HELPDESK01\nOS Name:                   Microsoft Windows 10 Pro\nOS Version:                10.0.19045 N/A Build 19045\nOS Manufacturer:           Microsoft Corporation\nOS Configuration:          Member Workstation\nSystem Manufacturer:       Dell Inc.\nSystem Model:              OptiPlex 5090\nSystem Type:               x64-based PC\nProcessor(s):              1 Processor(s) Installed.\n                           [01]: Intel(R) Core(TM) i5-11500 @ 2.70GHz\nTotal Physical Memory:     8,192 MB\nAvailable Physical Memory: 4,187 MB';
        },

        // Block Linux commands
        ifconfig: function() { return '\'ifconfig\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        grep:     function() { return '\'grep\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        sudo:     function() { return '\'sudo\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        apt:      function() { return '\'apt\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        'apt-get': function() { return '\'apt-get\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        bash:     function() { return '\'bash\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        chmod:    function() { return '\'chmod\' is not recognized as an internal or external command,\noperable program or batch file.'; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['print_management', 'print_queue', 'services'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }

        switch (iconDef.app) {
            case 'ticket':           PR1Config._openTicket(iconDef, engine); break;
            case 'print_management': PR1Config._openPrintManagement(iconDef, engine); break;
            case 'print_queue':      PR1Config._openPrintQueue(iconDef, engine); break;
            case 'services':         PR1Config._openServices(iconDef, engine); break;
            case 'network_settings': PR1Config._openNetworkSettings(iconDef, engine); break;
            case 'reset_lab':        PR1Config._confirmReset(engine); break;
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
        PR1Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            PR1Config._renderTicket(engine, container);
        } else {
            PR1Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker(engine, container) {
        var ticketPreviews = [
            'Karen Mitchell — "Nothing prints to the HP at the front desk"',
            'Jason Okafor — "Xerox is printing pages full of random characters"',
            'Linda Reyes — "Canon in conference room shows Offline but it is powered on"',
            'Mark Stanton — "Intern cannot print — gets Access Denied"',
            'Rachel Huang — "Xerox has 317 pages queued and nothing is printing"'
        ];

        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#e67e22; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">HELP DESK QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select a ticket to begin your assignment, or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        PR1Config._scenarios.forEach(function(s, i) {
            html += '<button class="pr1-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#e67e22; font-weight:bold;">PR-' + (1000 + i) + '</span>'
                + '<span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + ticketPreviews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';

        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="pr1RandomBtn" style="padding:10px 28px; background:#e67e22; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.pr1-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#e67e22'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                PR1Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                PR1Config._renderTicket(engine, container);
            });
        });

        document.getElementById('pr1RandomBtn').addEventListener('click', function() {
            PR1Config._applyScenario(engine, Math.floor(Math.random() * PR1Config._scenarios.length));
            PR1Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        var scenario = PR1Config._getScenario(engine);
        var submitters = [
            'Karen Mitchell — Office Manager',
            'Jason Okafor — Accounting Department',
            'Linda Reyes — Executive Assistant',
            'Mark Stanton — HR Department',
            'Rachel Huang — Sales Department'
        ];
        var submitter = submitters[engine.state._scenarioId] || 'Employee';
        var printer = PR1Config._printers[scenario.affectedPrinter];

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#e67e22; font-weight:bold; font-size:1rem;">HELP DESK TICKET #PR-' + (1000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: URGENT</span>'
            + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBMITTED BY</div>'
            + '<div>' + submitter + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DATE</div>'
            + '<div>March 13, 2026 — 9:04 AM</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">AFFECTED PRINTER</div>'
            + '<div style="font-weight:bold; color:#e67e22;">' + printer.name + '</div>'
            + '<div style="color:#888; font-size:0.7rem;">' + printer.location + ' &mdash; ' + printer.type + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + PR1Config._escHtml(scenario.ticketSubject) + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + PR1Config._escHtml(scenario.ticketDetail)
            + '</div></div>'

            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div>'
            + '<div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#ffcc80;">'
            + PR1Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')

            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div>'
            + '<div style="color:#2ecc71; font-weight:bold;">YOU — Desktop Support Technician</div></div>';
    },

    // ==========================================================
    // PRINT MANAGEMENT
    // ==========================================================

    _openPrintManagement(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); PR1Config._renderPrintManagement(engine); return; }
        var container = document.createElement('div');
        container.id = 'pmContainer';
        container.style.cssText = 'display:flex; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; overflow:hidden;';
        engine.openWindow(iconDef.id, 'Print Management', 'PRT', container);
        PR1Config._renderPrintManagement(engine);
    },

    _renderPrintManagement(engine) {
        var container = document.getElementById('pmContainer');
        if (!container) return;
        var scenario = PR1Config._getScenario(engine);

        // Left tree pane
        var leftHtml = '<div style="width:180px; min-width:180px; border-right:1px solid rgba(255,255,255,0.1); padding:12px; overflow-y:auto; background:rgba(0,0,0,0.2);">'
            + '<div style="color:#e67e22; font-weight:bold; margin-bottom:8px; font-size:0.75rem;">Print Management</div>'
            + '<div style="padding-left:0; margin-bottom:4px;"><span style="color:#aaa;">&#9660;</span> <span>Print Servers</span></div>'
            + '<div style="padding-left:12px; margin-bottom:4px;"><span style="color:#aaa;">&#9660;</span> <span style="color:#0078d4;">HELPDESK01</span></div>'
            + '<div id="pmNavPrinters" style="padding-left:24px; margin-bottom:2px; cursor:pointer; padding:3px 3px 3px 24px; border-radius:3px; background:rgba(230,126,34,0.12); color:#e67e22; font-weight:bold;">Printers</div>'
            + '<div id="pmNavPorts" style="padding-left:24px; margin-bottom:2px; cursor:pointer; padding:3px 3px 3px 24px; border-radius:3px; color:#888;">Ports</div>'
            + '<div id="pmNavDrivers" style="padding-left:24px; margin-bottom:2px; cursor:pointer; padding:3px 3px 3px 24px; border-radius:3px; color:#888;">Drivers</div>'
            + '</div>';

        // Right pane — printer list
        var rightHtml = '<div id="pmRightPane" style="flex:1; padding:16px; overflow-y:auto;">';
        rightHtml += '<div style="font-size:0.9rem; font-weight:bold; color:#e67e22; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Printers — HELPDESK01</div>';

        // Column headers
        rightHtml += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; margin-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.06);">'
            + '<span style="flex:2;">Printer Name</span>'
            + '<span style="flex:1.5;">Driver</span>'
            + '<span style="flex:1;">Port</span>'
            + '<span style="flex:0.7;">Jobs</span>'
            + '<span style="flex:1;">Status</span>'
            + '</div>';

        PR1Config._printers.forEach(function(p, i) {
            var state = PR1Config._getPrinterState(engine, i);
            var isError = state.status.includes('Error') || state.status.includes('Offline') || state.status.includes('Restricted') || state.status.includes('Wrong');
            var statusColor = isError ? '#e74c3c' : '#2ecc71';
            var jobCount = 0;
            if (scenario) {
                if (scenario.id === 'spooler_crash' && i === 0 && !PR1Config._isSpoolerRunning(engine)) jobCount = 4;
                if (scenario.id === 'stuck_queue' && i === 1 && engine.state._xeroxQueueStuck && !engine.state._queueCleared) jobCount = 15;
            }

            rightHtml += '<div class="pm-printer-row" data-idx="' + i + '" style="display:flex; align-items:center; padding:8px; margin-bottom:4px; background:' + (isError ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isError ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px; cursor:pointer; transition:border-color 0.15s;">'
                + '<span style="flex:2; font-weight:bold;">' + state.name + '<br><span style="font-size:0.65rem; color:#888; font-weight:normal;">' + state.location + '</span></span>'
                + '<span style="flex:1.5; font-size:0.75rem; color:#aaa;">' + (state.driver.length > 28 ? state.driver.substring(0, 26) + '...' : state.driver) + '</span>'
                + '<span style="flex:1; font-size:0.75rem; color:#888;">' + state.port + '</span>'
                + '<span style="flex:0.7; font-size:0.75rem; color:' + (jobCount > 0 ? '#e74c3c' : '#888') + ';">' + jobCount + '</span>'
                + '<span style="flex:1; font-size:0.75rem; color:' + statusColor + '; font-weight:' + (isError ? 'bold' : 'normal') + ';">' + state.status + '</span>'
                + '</div>';
        });

        rightHtml += '</div>';
        container.innerHTML = leftHtml + rightHtml;

        // Printer row click — open properties
        container.querySelectorAll('.pm-printer-row').forEach(function(row) {
            row.addEventListener('mouseenter', function() { this.style.borderColor = '#e67e22'; });
            row.addEventListener('mouseleave', function() {
                var idx = parseInt(this.getAttribute('data-idx'));
                var state = PR1Config._getPrinterState(engine, idx);
                var isError = state.status.includes('Error') || state.status.includes('Offline') || state.status.includes('Restricted') || state.status.includes('Wrong');
                this.style.borderColor = isError ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)';
            });
            row.addEventListener('dblclick', function() {
                PR1Config._openPrinterProperties(engine, parseInt(this.getAttribute('data-idx')));
            });
            row.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                PR1Config._openPrinterProperties(engine, parseInt(this.getAttribute('data-idx')));
            });
        });
    },

    // ==========================================================
    // PRINTER PROPERTIES (4-tab dialog)
    // ==========================================================

    _openPrinterProperties(engine, printerIdx) {
        var state = PR1Config._getPrinterState(engine, printerIdx);
        var scenario = PR1Config._getScenario(engine);
        var overlayId = 'printerPropsOverlay';

        // Remove existing
        var existing = document.getElementById(overlayId);
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:8000;';

        var activeTab = 0;

        function renderDialog() {
            var tabs = ['General', 'Ports', 'Advanced', 'Security'];
            var tabHtml = tabs.map(function(t, i) {
                return '<div class="props-tab" data-tab="' + i + '" style="padding:8px 16px; cursor:pointer; font-size:0.8rem; border-bottom:2px solid ' + (i === activeTab ? '#e67e22' : 'transparent') + '; color:' + (i === activeTab ? '#e67e22' : '#888') + '; font-weight:' + (i === activeTab ? 'bold' : 'normal') + ';">' + t + '</div>';
            }).join('');

            var bodyHtml = '';
            if (activeTab === 0) {
                // General
                bodyHtml = '<div style="padding:16px;">'
                    + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">Name</div><div style="font-weight:bold;">' + state.name + '</div></div>'
                    + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">Location</div><div>' + state.location + '</div></div>'
                    + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">Model</div><div>' + state.name + '</div></div>'
                    + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">Connection Type</div><div>' + state.type + '</div></div>'
                    + '<div><div style="color:#888; font-size:0.7rem;">Status</div><div style="color:' + (state.status.includes('Error') || state.status.includes('Offline') || state.status.includes('Restricted') || state.status.includes('Wrong') ? '#e74c3c' : '#2ecc71') + '; font-weight:bold;">' + state.status + '</div></div>'
                    + '</div>';
            } else if (activeTab === 1) {
                // Ports
                var isIpChanged = scenario && scenario.id === 'ip_changed' && printerIdx === 2;
                var ports = [
                    { name: 'USB001', desc: 'USB Virtual Printer Port', checked: state.port === 'USB001' },
                    { name: 'IP_192.168.1.200', desc: 'Standard TCP/IP Port — 192.168.1.200', checked: state.port === 'IP_192.168.1.200' },
                    { name: 'IP_192.168.1.201', desc: 'Standard TCP/IP Port — 192.168.1.201', checked: state.port === 'IP_192.168.1.201' && !engine.state._canonPortFixed },
                    { name: 'IP_192.168.1.210', desc: 'Standard TCP/IP Port — 192.168.1.210', checked: engine.state._canonPortFixed && printerIdx === 2 }
                ];
                bodyHtml = '<div style="padding:16px;">';
                bodyHtml += '<div style="color:#888; font-size:0.75rem; margin-bottom:8px;">Select a port for this printer:</div>';
                ports.forEach(function(port, pi) {
                    bodyHtml += '<div style="display:flex; align-items:center; padding:6px 8px; margin-bottom:4px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:3px;">'
                        + '<input type="radio" name="printerPort" value="' + port.name + '" id="port_' + pi + '" ' + (port.checked ? 'checked' : '') + ' style="margin-right:8px; cursor:pointer;">'
                        + '<label for="port_' + pi + '" style="cursor:pointer;">'
                        + '<span style="font-weight:bold;">' + port.name + '</span>'
                        + '<span style="color:#888; font-size:0.75rem; margin-left:8px;">' + port.desc + '</span>'
                        + '</label></div>';
                });
                if (isIpChanged) {
                    bodyHtml += '<div style="margin-top:12px; padding:8px; background:rgba(230,126,34,0.08); border:1px solid rgba(230,126,34,0.2); border-radius:3px; font-size:0.75rem; color:#ffcc80;">'
                        + 'Tip: If the printer\'s IP has changed, add a new TCP/IP port or select the correct one above.'
                        + '</div>';
                }
                bodyHtml += '<div style="margin-top:16px; display:flex; gap:8px;">'
                    + '<button id="propsPortApply" style="padding:6px 20px; background:#e67e22; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.8rem; font-weight:bold;">Apply</button>'
                    + '<button id="propsAddPort" style="padding:6px 20px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:3px; cursor:pointer; font-size:0.8rem;">Add Port...</button>'
                    + '</div>';
                bodyHtml += '</div>';
            } else if (activeTab === 2) {
                // Advanced — driver selector
                var isWrongDriver = scenario && scenario.id === 'wrong_driver' && printerIdx === 1;
                var currentDriver = engine.state._xeroxDriver || state.driver;
                var driverOptions = printerIdx === 1
                    ? ['Xerox WorkCentre 6515 PCL6', 'Xerox WorkCentre 6515 PS', 'Generic / Text Only', 'Microsoft Print to PDF', 'HP Universal Print Driver']
                    : [state.driver];
                bodyHtml = '<div style="padding:16px;">';
                bodyHtml += '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">Availability</div>'
                    + '<label style="display:flex; align-items:center; gap:8px;"><input type="radio" checked> Always available</label></div>';
                bodyHtml += '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">Priority</div><div>1</div></div>';
                bodyHtml += '<div style="margin-bottom:16px;">'
                    + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">Driver</div>'
                    + '<select id="propsDriverSelect" style="padding:4px 8px; background:#0d1117; border:1px solid ' + (isWrongDriver ? '#e74c3c' : 'rgba(255,255,255,0.2)') + '; border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; width:100%;">';
                driverOptions.forEach(function(d) {
                    bodyHtml += '<option value="' + d + '" ' + (d === currentDriver ? 'selected' : '') + '>' + d + '</option>';
                });
                bodyHtml += '</select>';
                if (isWrongDriver) {
                    bodyHtml += '<div style="margin-top:6px; color:#e74c3c; font-size:0.75rem;">Warning: Current driver may be incorrect for this printer model.</div>';
                }
                bodyHtml += '</div>';
                bodyHtml += '<div style="display:flex; gap:8px;">'
                    + '<button id="propsDriverApply" style="padding:6px 20px; background:#e67e22; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.8rem; font-weight:bold;">Apply</button>'
                    + '</div>';
                bodyHtml += '</div>';
            } else if (activeTab === 3) {
                // Security
                var isPermsStripped = scenario && scenario.id === 'perms_denied' && printerIdx === 0;
                var groups = engine.state._hpPermissionsStripped && printerIdx === 0
                    ? [{ name: 'Administrators', perms: ['Print', 'Manage Documents', 'Manage Printer'] }]
                    : [
                        { name: 'Administrators', perms: ['Print', 'Manage Documents', 'Manage Printer'] },
                        { name: 'Users', perms: ['Print'] },
                        { name: 'CREATOR OWNER', perms: ['Manage Documents'] }
                    ];
                bodyHtml = '<div style="padding:16px;">';
                bodyHtml += '<div style="color:#888; font-size:0.7rem; margin-bottom:8px;">Group or user names:</div>';
                bodyHtml += '<div id="secGroupList" style="border:1px solid rgba(255,255,255,0.12); border-radius:3px; margin-bottom:12px;">';
                groups.forEach(function(g, gi) {
                    bodyHtml += '<div class="sec-group" data-gi="' + gi + '" style="padding:6px 10px; cursor:pointer; background:' + (gi === 0 ? 'rgba(230,126,34,0.12)' : 'rgba(255,255,255,0.02)') + '; border-bottom:1px solid rgba(255,255,255,0.06);">' + g.name + '</div>';
                });
                bodyHtml += '</div>';
                if (isPermsStripped) {
                    bodyHtml += '<div style="margin-bottom:12px; padding:8px; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:3px; font-size:0.75rem; color:#ffcc80;">'
                        + 'Note: The "Users" group has been removed. Standard user accounts cannot print to this device.'
                        + '</div>';
                }
                bodyHtml += '<div style="display:flex; gap:8px; margin-bottom:16px;">'
                    + '<button id="secAddGroupBtn" style="padding:6px 16px; background:rgba(255,255,255,0.08); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:3px; cursor:pointer; font-size:0.75rem;">Add Group...</button>'
                    + '</div>';
                bodyHtml += '<div style="color:#888; font-size:0.7rem; margin-bottom:8px;">Permissions for selected group:</div>';
                bodyHtml += '<div style="display:flex; gap:16px; font-size:0.75rem; color:#aaa;">'
                    + '<span>Allow:</span>'
                    + '<label><input type="checkbox" id="permPrint" checked> Print</label>'
                    + '<label><input type="checkbox" id="permManageDocs"> Manage Documents</label>'
                    + '<label><input type="checkbox" id="permManagePrinter"> Manage Printer</label>'
                    + '</div>';
                bodyHtml += '</div>';
            }

            overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.15); border-radius:6px; width:540px; max-height:480px; display:flex; flex-direction:column; overflow:hidden;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.1);">'
                + '<div style="font-weight:bold; color:#c8e6c9;">' + state.name + ' Properties</div>'
                + '<button id="propsClose" style="background:none; border:none; color:#888; font-size:1.2rem; cursor:pointer;">x</button>'
                + '</div>'
                + '<div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.1);">' + tabHtml + '</div>'
                + '<div style="flex:1; overflow-y:auto; font-family:Consolas,monospace; font-size:0.8rem; color:#c8e6c9;">' + bodyHtml + '</div>'
                + '<div style="padding:10px 16px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:flex-end;">'
                + '<button id="propsOk" style="padding:6px 20px; background:#e67e22; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.8rem; font-weight:bold; margin-right:8px;">OK</button>'
                + '<button id="propsCancel" style="padding:6px 20px; background:rgba(255,255,255,0.08); color:#ccc; border:1px solid rgba(255,255,255,0.15); border-radius:3px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
                + '</div>'
                + '</div>';

            // Tab switching
            overlay.querySelectorAll('.props-tab').forEach(function(tab) {
                tab.addEventListener('click', function() {
                    activeTab = parseInt(this.getAttribute('data-tab'));
                    renderDialog();
                });
            });

            // Close
            var closeBtn = document.getElementById('propsClose');
            var cancelBtn = document.getElementById('propsCancel');
            var okBtn = document.getElementById('propsOk');
            if (closeBtn) closeBtn.addEventListener('click', function() { overlay.remove(); });
            if (cancelBtn) cancelBtn.addEventListener('click', function() { overlay.remove(); });
            if (okBtn) okBtn.addEventListener('click', function() {
                // Apply current tab changes
                applyCurrentTab();
                overlay.remove();
                PR1Config._renderPrintManagement(engine);
            });

            // Port apply
            var portApplyBtn = document.getElementById('propsPortApply');
            if (portApplyBtn) {
                portApplyBtn.addEventListener('click', function() {
                    applyCurrentTab();
                    engine.notify('Port settings applied.', 'success');
                    renderDialog();
                    PR1Config._renderPrintManagement(engine);
                });
            }

            // Add port button
            var addPortBtn = document.getElementById('propsAddPort');
            if (addPortBtn) {
                addPortBtn.addEventListener('click', function() {
                    PR1Config._openAddPortDialog(engine, printerIdx, overlay, renderDialog);
                });
            }

            // Driver apply
            var driverApplyBtn = document.getElementById('propsDriverApply');
            if (driverApplyBtn) {
                driverApplyBtn.addEventListener('click', function() {
                    applyCurrentTab();
                    renderDialog();
                    PR1Config._renderPrintManagement(engine);
                });
            }

            // Security add group
            var secAddBtn = document.getElementById('secAddGroupBtn');
            if (secAddBtn) {
                secAddBtn.addEventListener('click', function() {
                    PR1Config._openAddGroupDialog(engine, printerIdx, overlay, renderDialog);
                });
            }
        }

        function applyCurrentTab() {
            if (activeTab === 1) {
                // Ports
                var selected = overlay.querySelector('input[name="printerPort"]:checked');
                if (selected && scenario && scenario.id === 'ip_changed' && printerIdx === 2) {
                    if (selected.value === 'IP_192.168.1.210') {
                        engine.state._canonPortFixed = true;
                        engine.state._labComplete = true;
                        engine.state._flagRevealed = true;
                        engine.save();
                        engine.notify('Port updated to 192.168.1.210. Canon printer is back online. Find the flag in Print Management.', 'success');
                    }
                }
            } else if (activeTab === 2) {
                // Driver
                var driverSelect = document.getElementById('propsDriverSelect');
                if (driverSelect && printerIdx === 1) {
                    var newDriver = driverSelect.value;
                    engine.state._xeroxDriver = newDriver;
                    engine.save();
                    if (scenario && scenario.id === 'wrong_driver' && newDriver === 'Xerox WorkCentre 6515 PCL6' && !engine.state._flagRevealed) {
                        engine.state._flagRevealed = true;
                        engine.state._labComplete = true;
                        engine.save();
                        engine.notify('Correct driver applied. The Xerox should now print properly. Check Advanced tab for the fix confirmation.', 'success');
                    }
                }
            }
        }

        var arena = document.getElementById('arena');
        arena.appendChild(overlay);
        renderDialog();

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
    },

    _openAddPortDialog(engine, printerIdx, parentOverlay, refreshFn) {
        var dlg = document.createElement('div');
        dlg.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:20px; width:340px; z-index:9000; font-family:Consolas,monospace; color:#c8e6c9; font-size:0.8rem;';
        dlg.innerHTML = '<div style="font-weight:bold; margin-bottom:12px; color:#e67e22;">Add Standard TCP/IP Port</div>'
            + '<div style="margin-bottom:8px;">Printer IP Address or Hostname:</div>'
            + '<input id="addPortIp" type="text" placeholder="192.168.1.X" style="width:100%; box-sizing:border-box; padding:6px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.2); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; margin-bottom:12px;">'
            + '<div id="addPortError" style="color:#e74c3c; font-size:0.75rem; margin-bottom:8px; display:none;"></div>'
            + '<div style="display:flex; gap:8px; justify-content:flex-end;">'
            + '<button id="addPortOk" style="padding:6px 16px; background:#e67e22; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.8rem;">Add</button>'
            + '<button id="addPortCancel" style="padding:6px 16px; background:rgba(255,255,255,0.08); color:#ccc; border:1px solid rgba(255,255,255,0.15); border-radius:3px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div>';

        parentOverlay.appendChild(dlg);

        document.getElementById('addPortCancel').addEventListener('click', function() { dlg.remove(); });
        document.getElementById('addPortOk').addEventListener('click', function() {
            var ip = document.getElementById('addPortIp').value.trim();
            var scenario = PR1Config._getScenario(engine);
            if (!ip.match(/^\d+\.\d+\.\d+\.\d+$/)) {
                var errEl = document.getElementById('addPortError');
                errEl.textContent = 'Invalid IP address format.';
                errEl.style.display = 'block';
                return;
            }
            if (scenario && scenario.id === 'ip_changed' && printerIdx === 2 && ip === '192.168.1.210') {
                engine.state._canonPortFixed = true;
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                dlg.remove();
                engine.notify('Port IP_192.168.1.210 added and selected. Canon is back online. Check Print Management for confirmation.', 'success');
                refreshFn();
                PR1Config._renderPrintManagement(engine);
            } else {
                dlg.remove();
                engine.notify('Port IP_' + ip + ' added (no effect on current scenario).', 'info');
                refreshFn();
            }
        });
    },

    _openAddGroupDialog(engine, printerIdx, parentOverlay, refreshFn) {
        var dlg = document.createElement('div');
        dlg.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:20px; width:340px; z-index:9000; font-family:Consolas,monospace; color:#c8e6c9; font-size:0.8rem;';
        dlg.innerHTML = '<div style="font-weight:bold; margin-bottom:12px; color:#e67e22;">Select User or Group</div>'
            + '<div style="margin-bottom:8px;">Enter group name:</div>'
            + '<input id="addGroupName" type="text" placeholder="Users" style="width:100%; box-sizing:border-box; padding:6px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.2); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; margin-bottom:12px;">'
            + '<div id="addGroupError" style="color:#e74c3c; font-size:0.75rem; margin-bottom:8px; display:none;"></div>'
            + '<div style="display:flex; gap:8px; justify-content:flex-end;">'
            + '<button id="addGroupOk" style="padding:6px 16px; background:#e67e22; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.8rem;">Add</button>'
            + '<button id="addGroupCancel" style="padding:6px 16px; background:rgba(255,255,255,0.08); color:#ccc; border:1px solid rgba(255,255,255,0.15); border-radius:3px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div>';

        parentOverlay.appendChild(dlg);

        document.getElementById('addGroupCancel').addEventListener('click', function() { dlg.remove(); });
        document.getElementById('addGroupOk').addEventListener('click', function() {
            var groupName = document.getElementById('addGroupName').value.trim();
            var scenario = PR1Config._getScenario(engine);
            if (!groupName) {
                var errEl = document.getElementById('addGroupError');
                errEl.textContent = 'Please enter a group name.';
                errEl.style.display = 'block';
                return;
            }
            if (scenario && scenario.id === 'perms_denied' && printerIdx === 0 && groupName.toLowerCase() === 'users') {
                engine.state._hpPermissionsStripped = false;
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                dlg.remove();
                engine.notify('"Users" group restored with Print permission. Tyler can now print. Check Security tab for the confirmation token.', 'success');
                refreshFn();
                PR1Config._renderPrintManagement(engine);
            } else {
                dlg.remove();
                engine.notify('Group "' + groupName + '" added (no effect on current scenario).', 'info');
                refreshFn();
            }
        });
    },

    // ==========================================================
    // PRINT QUEUE
    // ==========================================================

    _openPrintQueue(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); PR1Config._renderPrintQueue(engine); return; }
        var container = document.createElement('div');
        container.id = 'pqContainer';
        container.style.cssText = 'padding:0; overflow:hidden; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; display:flex; flex-direction:column;';
        engine.openWindow(iconDef.id, 'Print Queue', 'QUE', container);
        PR1Config._renderPrintQueue(engine);
    },

    _renderPrintQueue(engine) {
        var container = document.getElementById('pqContainer');
        if (!container) return;
        var scenario = PR1Config._getScenario(engine);

        // Printer selector tabs
        var html = '<div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2);">';
        PR1Config._printers.forEach(function(p, i) {
            var state = PR1Config._getPrinterState(engine, i);
            var isActive = (engine.state._queueViewPrinter === i) || (i === 0 && engine.state._queueViewPrinter === undefined);
            html += '<div class="pq-tab" data-pidx="' + i + '" style="padding:8px 14px; cursor:pointer; font-size:0.75rem; border-bottom:2px solid ' + (isActive ? '#e67e22' : 'transparent') + '; color:' + (isActive ? '#e67e22' : '#888') + ';">' + p.name.split(' ').slice(0, 2).join(' ') + '</div>';
        });
        html += '</div>';

        // Menu bar
        html += '<div style="display:flex; gap:0; border-bottom:1px solid rgba(255,255,255,0.08); padding:4px 8px; background:rgba(0,0,0,0.1);">'
            + '<button id="pqMenuPrinter" style="padding:3px 10px; background:none; border:none; color:#aaa; cursor:pointer; font-size:0.75rem; font-family:Consolas,monospace;">Printer</button>'
            + '<button id="pqMenuDoc" style="padding:3px 10px; background:none; border:none; color:#aaa; cursor:pointer; font-size:0.75rem; font-family:Consolas,monospace;">Document</button>'
            + '<button id="pqMenuView" style="padding:3px 10px; background:none; border:none; color:#aaa; cursor:pointer; font-size:0.75rem; font-family:Consolas,monospace;">View</button>'
            + '</div>';

        var viewIdx = engine.state._queueViewPrinter !== undefined ? engine.state._queueViewPrinter : 0;
        var printerState = PR1Config._getPrinterState(engine, viewIdx);

        html += '<div style="padding:4px 8px; background:rgba(0,0,0,0.15); border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.7rem; color:#888;">'
            + printerState.name + ' — Status: <span style="color:' + (printerState.status.includes('Error') || printerState.status.includes('Backed') ? '#e74c3c' : '#2ecc71') + ';">' + printerState.status + '</span>'
            + '</div>';

        // Column headers
        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02);">'
            + '<span style="flex:2;">Document Name</span>'
            + '<span style="flex:1;">Status</span>'
            + '<span style="flex:1;">Owner</span>'
            + '<span style="flex:0.5;">Pages</span>'
            + '<span style="flex:1;">Size</span>'
            + '<span style="flex:1.5;">Submitted</span>'
            + '</div>';

        html += '<div id="pqJobList" style="flex:1; overflow-y:auto; padding:4px;">';

        // Build job list based on scenario and printer
        var jobs = PR1Config._buildQueueJobs(engine, viewIdx);

        if (jobs.length === 0) {
            html += '<div style="text-align:center; padding:32px; color:#888; font-size:0.8rem;">No documents are in the queue.</div>';
        } else {
            jobs.forEach(function(job, ji) {
                var statusColor = job.status === 'Error' ? '#e74c3c' : job.status === 'Printing' ? '#f39c12' : job.status === 'Paused' ? '#888' : '#888';
                html += '<div class="pq-job" data-ji="' + ji + '" style="display:flex; align-items:center; padding:5px 8px; margin-bottom:2px; background:' + (job.status === 'Error' ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (job.status === 'Error' ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.04)') + '; border-radius:3px; cursor:pointer; font-size:0.75rem;">'
                    + '<span style="flex:2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + job.name + '</span>'
                    + '<span style="flex:1; color:' + statusColor + '; font-weight:bold;">' + job.status + '</span>'
                    + '<span style="flex:1; color:#888;">' + job.owner + '</span>'
                    + '<span style="flex:0.5; color:#888;">' + job.pages + '</span>'
                    + '<span style="flex:1; color:#888;">' + job.size + '</span>'
                    + '<span style="flex:1.5; color:#888;">' + job.submitted + '</span>'
                    + '</div>';
            });
        }
        html += '</div>';

        container.innerHTML = html;

        // Tab switching
        container.querySelectorAll('.pq-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                engine.state._queueViewPrinter = parseInt(this.getAttribute('data-pidx'));
                PR1Config._renderPrintQueue(engine);
            });
        });

        // Printer menu dropdown
        var printerMenuBtn = document.getElementById('pqMenuPrinter');
        if (printerMenuBtn) {
            printerMenuBtn.addEventListener('click', function() {
                PR1Config._showPrintQueueMenu(engine, viewIdx, container);
            });
        }
    },

    _buildQueueJobs(engine, printerIdx) {
        var scenario = PR1Config._getScenario(engine);
        var jobs = [];
        var times = ['9:03 AM', '9:04 AM', '9:05 AM', '9:06 AM', '9:07 AM', '9:08 AM', '9:09 AM', '9:10 AM', '9:11 AM', '9:12 AM', '9:13 AM', '9:14 AM', '9:15 AM', '9:16 AM', '9:17 AM'];
        var owners = ['jmitchell', 'tokafor', 'lreyes', 'mstanton', 'rhuang', 'bchavez', 'asanders', 'kwilson', 'dpatel', 'nmartinez'];
        var docNames = ['Q1_Report.pdf', 'Board_Presentation.pptx', 'Invoice_4421.docx', 'Employee_Review.pdf', 'Budget_Draft.xlsx', 'Contract_Rev3.docx', 'Training_Slides.pdf', 'Minutes_March.docx', 'Proposal_ACME.pdf', 'Onboarding_Pack.pdf', 'Policy_Update.docx', 'Audit_Log.pdf', 'Schedule_Week12.xlsx', 'Memo_AllStaff.docx', 'Intake_Form.pdf'];

        if (scenario && scenario.id === 'spooler_crash' && printerIdx === 0 && !PR1Config._isSpoolerRunning(engine)) {
            for (var i = 0; i < 4; i++) {
                jobs.push({ name: docNames[i], status: 'Error', owner: owners[i % owners.length], pages: (Math.floor(Math.random() * 5) + 1), size: (Math.floor(Math.random() * 500) + 50) + ' KB', submitted: times[i] });
            }
        } else if (scenario && scenario.id === 'stuck_queue' && printerIdx === 1 && engine.state._xeroxQueueStuck && !engine.state._queueCleared) {
            for (var j = 0; j < 15; j++) {
                var isError = j < 6;
                jobs.push({ name: docNames[j % docNames.length], status: isError ? 'Error' : 'Waiting', owner: owners[j % owners.length], pages: (Math.floor(Math.random() * 20) + 1), size: (Math.floor(Math.random() * 2000) + 100) + ' KB', submitted: times[j % times.length] });
            }
        }
        return jobs;
    },

    _showPrintQueueMenu(engine, printerIdx, container) {
        var existing = document.getElementById('pqDropdown');
        if (existing) { existing.remove(); return; }

        var scenario = PR1Config._getScenario(engine);
        var dropdown = document.createElement('div');
        dropdown.id = 'pqDropdown';
        dropdown.style.cssText = 'position:absolute; top:72px; left:8px; background:#1e1e2e; border:1px solid rgba(255,255,255,0.2); border-radius:4px; z-index:500; min-width:200px; font-family:Consolas,monospace; font-size:0.8rem; color:#c8e6c9; box-shadow:0 4px 12px rgba(0,0,0,0.5);';

        var items = [
            { label: 'Cancel All Documents', action: 'cancel_all' },
            { label: 'Pause Printing', action: 'pause' },
            { label: '---', action: 'sep' },
            { label: 'Properties', action: 'props' }
        ];

        var itemsHtml = items.map(function(item) {
            if (item.action === 'sep') return '<div style="border-top:1px solid rgba(255,255,255,0.1); margin:4px 0;"></div>';
            return '<div class="pq-menu-item" data-action="' + item.action + '" style="padding:8px 16px; cursor:pointer; transition:background 0.1s;">' + item.label + '</div>';
        }).join('');

        dropdown.innerHTML = itemsHtml;
        container.appendChild(dropdown);

        dropdown.querySelectorAll('.pq-menu-item').forEach(function(item) {
            item.addEventListener('mouseenter', function() { this.style.background = 'rgba(230,126,34,0.15)'; });
            item.addEventListener('mouseleave', function() { this.style.background = ''; });
            item.addEventListener('click', function() {
                var action = this.getAttribute('data-action');
                dropdown.remove();
                if (action === 'cancel_all') {
                    PR1Config._cancelAllJobs(engine, printerIdx);
                } else if (action === 'pause') {
                    engine.notify('Print queue paused for ' + PR1Config._printers[printerIdx].name + '.', 'info');
                } else if (action === 'props') {
                    PR1Config._openPrinterProperties(engine, printerIdx);
                }
            });
        });

        // Close dropdown on outside click
        setTimeout(function() {
            document.addEventListener('click', function handler() {
                if (dropdown.parentNode) dropdown.remove();
                document.removeEventListener('click', handler);
            });
        }, 50);
    },

    _cancelAllJobs(engine, printerIdx) {
        var scenario = PR1Config._getScenario(engine);
        if (scenario && scenario.id === 'stuck_queue' && printerIdx === 1) {
            engine.state._queueCleared = true;
            engine.state._xeroxQueueStuck = false;
            engine.state._labComplete = true;
            engine.state._flagRevealed = true;
            engine.save();
            engine.notify('All documents canceled. Queue cleared. Check Services to restart the spooler for a clean state.', 'success');
            PR1Config._renderPrintQueue(engine);
            PR1Config._renderPrintManagement(engine);
        } else if (scenario && scenario.id === 'spooler_crash' && printerIdx === 0) {
            engine.notify('Cannot cancel jobs — the Print Spooler is not running. Fix the spooler first.', 'error');
        } else {
            engine.notify('No jobs to cancel on ' + PR1Config._printers[printerIdx].name + '.', 'info');
        }
    },

    // ==========================================================
    // SERVICES
    // ==========================================================

    _openServices(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); PR1Config._renderServices(engine); return; }
        var container = document.createElement('div');
        container.id = 'svcContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Services', 'SVC', container);
        PR1Config._renderServices(engine);
    },

    _renderServices(engine) {
        var container = document.getElementById('svcContainer');
        if (!container) return;
        var scenario = PR1Config._getScenario(engine);
        var spoolerRunning = PR1Config._isSpoolerRunning(engine);
        var isSpoolerScenario = scenario && scenario.id === 'spooler_crash';
        var isStuckQueue = scenario && scenario.id === 'stuck_queue';
        var showSpoolerFlag = engine.state._flagRevealed && isSpoolerScenario && spoolerRunning;
        var showQueueFlag = engine.state._flagRevealed && isStuckQueue && engine.state._queueCleared;

        var services = [
            { name: 'Background Intelligent Transfer', status: 'Running', startup: 'Automatic' },
            { name: 'COM+ Event System', status: 'Running', startup: 'Automatic' },
            { name: 'Cryptographic Services', status: 'Running', startup: 'Automatic' },
            { name: 'DHCP Client', status: 'Running', startup: 'Automatic' },
            { name: 'DNS Client', status: 'Running', startup: 'Automatic' },
            { name: 'Network Connections', status: 'Running', startup: 'Manual' },
            { name: 'Print Spooler', status: spoolerRunning ? 'Running' : 'Stopped', startup: 'Automatic', highlight: isSpoolerScenario || isStuckQueue },
            { name: 'Remote Registry', status: 'Stopped', startup: 'Disabled' },
            { name: 'Security Center', status: 'Running', startup: 'Automatic' },
            { name: 'Server', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Defender Firewall', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Event Log', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Update', status: 'Running', startup: 'Manual' },
            { name: 'Workstation', status: 'Running', startup: 'Automatic' }
        ];

        var html = '<div style="font-size:1rem; font-weight:bold; color:#e67e22; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Services (Local)</div>';
        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; margin-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.08);">'
            + '<span style="flex:2.5;">Name</span>'
            + '<span style="flex:1;">Status</span>'
            + '<span style="flex:1;">Startup Type</span>'
            + '<span style="flex:1;">Action</span></div>';

        services.forEach(function(svc) {
            var isStopped = svc.status === 'Stopped';
            var isHL = svc.highlight;
            html += '<div style="display:flex; align-items:center; padding:6px 8px; margin-bottom:2px; background:' + (isHL ? (isStopped ? 'rgba(231,76,60,0.08)' : 'rgba(46,204,113,0.06)') : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isHL ? (isStopped ? 'rgba(231,76,60,0.3)' : 'rgba(46,204,113,0.2)') : 'rgba(255,255,255,0.04)') + '; border-radius:3px;">'
                + '<span style="flex:2.5; font-weight:' + (isHL ? 'bold' : 'normal') + ';">' + svc.name + '</span>'
                + '<span style="flex:1; color:' + (isStopped ? '#e74c3c' : '#2ecc71') + '; font-weight:' + (isStopped ? 'bold' : 'normal') + ';">' + svc.status + '</span>'
                + '<span style="flex:1; color:#888;">' + svc.startup + '</span>'
                + '<span style="flex:1;">';

            if (isHL && isStopped && isSpoolerScenario) {
                html += '<button class="svc-start-btn" data-svc="spooler" style="padding:3px 12px; background:#e74c3c; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.7rem; font-weight:bold; margin-right:4px;">Start</button>';
            } else if (isHL && !isStopped) {
                if (isSpoolerScenario || isStuckQueue) {
                    html += '<button class="svc-stop-btn" style="padding:3px 12px; background:rgba(255,255,255,0.1); color:#888; border:1px solid rgba(255,255,255,0.15); border-radius:3px; cursor:pointer; font-size:0.7rem; margin-right:4px;">Stop</button>';
                    html += '<button class="svc-restart-btn" style="padding:3px 12px; background:rgba(255,255,255,0.1); color:#888; border:1px solid rgba(255,255,255,0.15); border-radius:3px; cursor:pointer; font-size:0.7rem;">Restart</button>';
                }
            }
            html += '</span></div>';
        });

        // Flag reveal for spooler scenario
        if (showSpoolerFlag) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Print Spooler — Recovery Log:</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem;">Service restarted successfully after spool file purge.</div>'
                + '<div id="pr1-flag-spooler" style="color:#c8e6c9; font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>';
        }

        // Flag reveal for queue scenario
        if (showQueueFlag) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Print Spooler — Queue Recovery Log:</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem;">Stuck job queue cleared. Spooler stable.</div>'
                + '<div id="pr1-flag-queue" style="color:#c8e6c9; font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>';
        }

        container.innerHTML = html;

        // Async flag delivery for spooler/queue scenarios
        if (showSpoolerFlag) {
            BoxEngine.requestFlagText('spooler_crash').then(function(flagText) {
                var el = document.getElementById('pr1-flag-spooler');
                if (el) el.textContent = 'Recovery token: ' + (flagText || 'Flag unavailable');
            });
        }
        if (showQueueFlag) {
            BoxEngine.requestFlagText('stuck_queue').then(function(flagText) {
                var el = document.getElementById('pr1-flag-queue');
                if (el) el.textContent = 'Recovery token: ' + (flagText || 'Flag unavailable');
            });
        }

        // Start button (S1: spooler crash — fails with stuck files, succeeds after clear)
        var startBtn = container.querySelector('.svc-start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                if (engine.state._spoolFilesStuck) {
                    engine.notify('Service start failed: stuck spool files are blocking restart. Clear C:\\Windows\\System32\\spool\\PRINTERS\\ first.', 'error');
                } else {
                    engine.state._spoolerRunning = true;
                    engine.save();
                    if (isSpoolerScenario && !engine.state._flagRevealed) {
                        engine.state._flagRevealed = true;
                        engine.state._labComplete = true;
                        engine.save();
                        engine.notify('Print Spooler started. Recovery token logged. Check Services panel.', 'success');
                    } else {
                        engine.notify('Print Spooler service started successfully.', 'success');
                    }
                    PR1Config._renderServices(engine);
                }
            });
        }

        // Stop button
        var stopBtn = container.querySelector('.svc-stop-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                engine.state._spoolerRunning = false;
                engine.save();
                engine.notify('Print Spooler stopped. Clear spool files and restart.', 'info');
                PR1Config._renderServices(engine);
            });
        }

        // Restart button
        var restartBtn = container.querySelector('.svc-restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', function() {
                if (engine.state._spoolFilesStuck) {
                    engine.notify('Restart failed: stuck spool files blocking start. Clear C:\\Windows\\System32\\spool\\PRINTERS\\ first.', 'error');
                } else {
                    engine.state._spoolerRunning = true;
                    engine.save();
                    if ((isSpoolerScenario || isStuckQueue) && !engine.state._flagRevealed) {
                        engine.state._flagRevealed = true;
                        engine.state._labComplete = true;
                        engine.save();
                    }
                    engine.notify('Print Spooler restarted successfully.', 'success');
                    PR1Config._renderServices(engine);
                }
            });
        }
    },

    // ==========================================================
    // NETWORK SETTINGS (basic — for ping context)
    // ==========================================================

    _openNetworkSettings(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Network Settings', 'NET', container);
        container.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#e67e22; margin-bottom:16px;">Network Settings</div>'
            + '<div style="margin-bottom:16px; border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px;">'
            + '<div style="font-weight:bold; margin-bottom:8px;">Ethernet0</div>'
            + '<div style="color:#2ecc71; font-size:0.75rem; margin-bottom:8px;">Status: Connected</div>'
            + '<div style="font-size:0.75rem; color:#aaa; line-height:1.8;">'
            + '<div>IPv4 Address: 192.168.1.50</div>'
            + '<div>Subnet Mask: 255.255.255.0</div>'
            + '<div>Default Gateway: 192.168.1.1</div>'
            + '<div>DNS Servers: 8.8.8.8, 8.8.4.4</div>'
            + '</div></div>'
            + '<div style="font-size:0.75rem; color:#888; margin-bottom:8px;">Connected Devices (ARP):</div>'
            + '<div style="border:1px solid rgba(255,255,255,0.06); border-radius:3px;">'
            + '<div style="display:flex; padding:4px 8px; font-size:0.7rem; color:#888; border-bottom:1px solid rgba(255,255,255,0.06);">'
            + '<span style="flex:2;">IP Address</span><span style="flex:2;">MAC Address</span><span style="flex:1;">Type</span></div>'
            + '<div style="display:flex; padding:4px 8px; font-size:0.75rem; border-bottom:1px solid rgba(255,255,255,0.04);">'
            + '<span style="flex:2;">192.168.1.1</span><span style="flex:2; color:#888;">00-1a-2b-3c-4d-01</span><span style="flex:1; color:#888;">dynamic</span></div>'
            + '<div style="display:flex; padding:4px 8px; font-size:0.75rem; border-bottom:1px solid rgba(255,255,255,0.04);">'
            + '<span style="flex:2;">192.168.1.200</span><span style="flex:2; color:#888;">00-1a-2b-3c-4d-10</span><span style="flex:1; color:#888;">dynamic</span></div>'
            + '<div style="display:flex; padding:4px 8px; font-size:0.75rem;">'
            + '<span style="flex:2; color:#e67e22;">192.168.1.201</span><span style="flex:2; color:#888;">00-1a-2b-3c-4d-11</span><span style="flex:1; color:#e74c3c;">stale</span></div>'
            + '</div>'
            + '<div style="margin-top:8px; font-size:0.7rem; color:#888;">Note: ARP entry for 192.168.1.201 is stale — device may have moved.</div>';
    },

    // ==========================================================
    // FLAG REVEAL HELPERS (per-scenario, called by onAppLaunch)
    // ==========================================================

    _getFlagRevealHtml(engine) {
        var scenario = PR1Config._getScenario(engine);
        if (!engine.state._flagRevealed || !scenario) return '';

        var labels = {
            wrong_driver:  'Driver correction confirmed. Print output restored.',
            ip_changed:    'Port updated. Canon imageCLASS MF445dw back online at 192.168.1.210.',
            perms_denied:  'Users group restored. Print access granted to standard accounts.'
        };
        var label = labels[scenario.id] || 'Fix confirmed.';
        var flagElId = 'pr1-flag-reveal-' + scenario.id;

        // Async flag delivery after DOM insertion
        setTimeout(function() {
            BoxEngine.requestFlagText(scenario.id).then(function(flagText) {
                var el = document.getElementById(flagElId);
                if (el) el.textContent = 'Token: ' + (flagText || 'Flag unavailable');
            });
        }, 0);

        return '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;">'
            + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Fix Confirmed:</div>'
            + '<div style="color:#c8e6c9; font-size:0.8rem;">' + label + '</div>'
            + '<div id="' + flagElId + '" style="color:#c8e6c9; font-size:0.8rem; margin-top:4px;">Token: loading...</div></div>';
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
            + '<button id="pr1ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Reset</button>'
            + '<button id="pr1ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div></div>';

        var arena = document.getElementById('arena');
        arena.appendChild(overlay);

        document.getElementById('pr1ResetConfirm').addEventListener('click', function() {
            PR1Config._flagRestored = false;
            PR1Config.hints = PR1Config._defaultHints;
            engine.reset();
        });
        document.getElementById('pr1ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

};
