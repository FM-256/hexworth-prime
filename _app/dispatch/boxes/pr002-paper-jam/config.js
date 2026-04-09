/* ============================================================
   DISPATCH LAB — Box PR2: Paper Jam Pandemonium
   CompTIA A+ Core 2 — Troubleshooting Printers (220-1102)
   Config: printer state, Windows commands, GUI, scenarios
   5 distinct scenarios: sensor stuck, tray misalignment,
   worn feed rollers, humidity curl, multi-page feed
   ============================================================ */

var PR2Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Paper Jam Pandemonium',
    subtitle: 'Clear the Path — A+ Core 2 Paper Jam Troubleshooting',
    difficulty: 'Beginner',
    accent: '#e67e22',
    storageKey: 'hexworth_lab_pr2',
    registryId: 'pr002-paper-jam',
    trackerKey: 'lab_pr2',

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
                title: 'Examine the printer status',
                tip: 'Open Print Management or the Printer Panel to see which printer is reporting a paper jam and examine its status.',
                trigger: { event: 'window_open', match: { type: 'print_management' } }
            },
            {
                title: 'Inspect the hardware',
                tip: 'Open the Printer Panel to physically inspect the paper path, tray alignment, rollers, and sensors.',
                trigger: {
                    event: 'window_open',
                    match: { type: 'printer_panel' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:printer' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Each scenario has a different mechanical root cause. Clean the sensor, realign the tray, replace rollers, dehumidify paper, or adjust the pickup mechanism.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:fix' },
                    alt: [
                        { event: 'window_open', match: { type: 'printer_panel' } }
                    ]
                }
            },
            {
                title: 'Capture the flag',
                tip: 'After fixing the jam issue, locate the diagnostic token in the tool you used to apply the fix.',
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
            { flagId: 'fixed', objective: '3.3', description: 'Troubleshoot common hardware problems', skill: 'Printer Paper Path Troubleshooting' },
            { flagId: 'fixed', objective: '3.1', description: 'Troubleshoot common Windows OS problems', skill: 'Print Spooler and Queue Management' }
        ]
    },

    // ==========================================================
    // PRINTER DATA
    // ==========================================================

    _printers: [
        { name: 'HP LaserJet Pro M404', ip: null, port: 'USB001', location: 'Front Desk', type: 'USB', driver: 'HP Universal Print Driver', status: 'Ready' },
        { name: 'Brother MFC-L2750DW', ip: '192.168.1.205', port: 'IP_192.168.1.205', location: 'Copy Room', type: 'Network', driver: 'Brother MFC-L2750DW', status: 'Ready' },
        { name: 'Xerox WorkCentre 6515', ip: '192.168.1.200', port: 'IP_192.168.1.200', location: 'Bullpen', type: 'Network', driver: 'Xerox WorkCentre 6515 PCL6', status: 'Ready' }
    ],

    // ==========================================================
    // SCENARIO FLAGS
    // ==========================================================

    _scenarioFlags: {
        sensor_stuck:     null,
        tray_misalign:    null,
        worn_rollers:     null,
        humidity_curl:    null,
        multi_feed:       null
    },

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            id: 'sensor_stuck',
            name: 'Paper Jam Sensor Stuck',
            ticketSubject: 'HP at Front Desk keeps saying Paper Jam but there is NO paper stuck',
            ticketDetail: 'The HP LaserJet at the front desk shows a persistent "Paper Jam" error on the display and in the print queue. I have opened every door and tray and there is absolutely no paper jammed anywhere. I have power cycled it three times. The error will not clear. Nothing will print.',
            ticketExtra: 'IT Note: Maintenance log shows this unit had a genuine paper jam cleared by the user yesterday. The jam sensor may not have reset properly after the paper was removed.',
            affectedPrinter: 0,
            fixDescription: 'Clean and reset the paper jam sensor in the paper path',
            stateOverrides: { _sensorStuck: true }
        },
        {
            id: 'tray_misalign',
            name: 'Tray Misalignment',
            ticketSubject: 'Brother in Copy Room jams every 3-4 pages — paper skews and crumples',
            ticketDetail: 'The Brother printer in the copy room keeps jamming every few pages. The paper comes in crooked and gets crumpled up inside. I refilled the tray this morning with a fresh ream and it started doing this immediately. The paper is the correct size (Letter). Other people are reporting the same thing.',
            ticketExtra: 'IT Note: The paper tray was removed for cleaning last week. It is possible it was not reseated correctly. The paper guides inside the tray should be snug against the paper stack.',
            affectedPrinter: 1,
            fixDescription: 'Reseat tray and adjust paper guides to match paper size',
            stateOverrides: { _trayMisaligned: true }
        },
        {
            id: 'worn_rollers',
            name: 'Worn Feed Rollers',
            ticketSubject: 'Xerox in Bullpen fails to pick up paper — blank pages or nothing feeds',
            ticketDetail: 'The Xerox printer in the bullpen is not picking up paper at all. Sometimes it just sits there and says "Load Paper Tray 1" even though the tray is completely full. Other times it grabs the paper crooked and it jams immediately. This has been getting worse over the past two weeks.',
            ticketExtra: 'IT Note: This unit has printed over 95,000 pages since last maintenance. Feed rollers have a typical lifespan of 100,000 pages. Roller replacement kit is in the supply closet.',
            affectedPrinter: 2,
            fixDescription: 'Replace worn feed/pickup rollers with new maintenance kit',
            stateOverrides: { _rollersWorn: true }
        },
        {
            id: 'humidity_curl',
            name: 'Paper Curling from Humidity',
            ticketSubject: 'HP at Front Desk — paper curls and wraps around fuser, constant jams',
            ticketDetail: 'Every page that comes out of the HP at the front desk is curled badly. Some pages wrap around the fuser assembly and cause a jam inside the printer. The pages that do make it out are curled so badly they will not stack. This started after the weekend — it was very humid and rainy all weekend.',
            ticketExtra: 'IT Note: Building HVAC was off over the weekend for maintenance. The copy room where paper is stored had no climate control for 48+ hours. Current humidity reading in the office is 78%.',
            affectedPrinter: 0,
            fixDescription: 'Replace humidity-damaged paper with fresh sealed ream; adjust fuser temperature',
            stateOverrides: { _humidityCurl: true }
        },
        {
            id: 'multi_feed',
            name: 'Multi-Page Feed',
            ticketSubject: 'Brother in Copy Room grabs 3-4 sheets at once — pages are stuck together',
            ticketDetail: 'The Brother printer in the copy room keeps pulling multiple sheets at once. A 5-page document comes out as 2 or 3 pages with some blank and some with content on the wrong side. It is like the pages are stuck together. I fanned the paper before loading it and it still happens.',
            ticketExtra: 'IT Note: The separation pad in this model prevents multi-feeds. At high page counts the pad wears smooth. Also check whether the paper has excessive static charge or the tray is overfilled past the max line.',
            affectedPrinter: 1,
            fixDescription: 'Replace worn separation pad and ensure tray is not overfilled',
            stateOverrides: { _multiFeed: true }
        }
    ],

    // ==========================================================
    // PER-SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Open Print Management to check which printer shows errors.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Paper jams have mechanical root causes — sensors, trays, rollers, paper quality, or separation pads.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Open the Printer Panel to physically inspect the printer components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears in the tool you used to apply the fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        sensor_stuck: [
            { id: 'hint1', text: 'The error says Paper Jam but the user found no paper. The sensor itself may be the problem.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the Printer Panel and inspect the paper path sensors. A stuck or dirty sensor can report a false jam.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The paper jam sensor is stuck in the triggered position. Clean it with compressed air or gently reset it.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: Inspect Paper Path, select the Jam Sensor, choose Clean/Reset Sensor. Then send a test page.', cost: 150, penalty: -150 }
        ],
        tray_misalign: [
            { id: 'hint1', text: 'Paper skewing on entry usually means the tray guides are not aligned with the paper size.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The tray was removed for cleaning last week. Check whether it was reseated correctly and the guides are snug.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Remove the tray, check for debris, reseat it firmly, and adjust both side and rear guides to match Letter size.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: Open Tray 1, Reseat Tray, Adjust Guides to Letter. Then send a test page to confirm.', cost: 150, penalty: -150 }
        ],
        worn_rollers: [
            { id: 'hint1', text: 'Paper not being picked up at all is a classic symptom of worn pickup rollers.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'This unit has 95,000 pages. Rollers typically last 100,000. Check the roller condition in the Printer Panel.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The feed rollers are glazed and smooth — they cannot grip paper. Replace them with the maintenance kit from the supply closet.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: Open Roller Assembly, select Replace Feed Rollers, confirm installation. Run test page.', cost: 150, penalty: -150 }
        ],
        humidity_curl: [
            { id: 'hint1', text: 'Paper curling through the fuser is often caused by moisture in the paper stock.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The HVAC was off all weekend with 78% humidity. Paper absorbs moisture and curls when heated by the fuser.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Replace the damp paper with a fresh sealed ream stored in a dry location. The fuser temperature may also need adjustment.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: Replace Paper Stock with fresh ream, then adjust Fuser Settings to reduce curl. Test page to verify.', cost: 150, penalty: -150 }
        ],
        multi_feed: [
            { id: 'hint1', text: 'Multiple sheets feeding at once means the separation mechanism is not working properly.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The separation pad prevents multi-feeds. At high page counts, the pad wears smooth. Also check the tray fill level.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The separation pad is worn smooth and the tray is overfilled past the max line. Replace the pad and reduce the paper level.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: Open Tray 1, Replace Separation Pad, reduce paper to below max line. Run test page.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !PR2Config._flagRestored) {
            PR2Config._flagRestored = true;
            var scenario = PR2Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                PR2Config.hints = PR2Config._scenarioHints[scenario.id] || PR2Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;

        engine.state._sensorStuck = false;
        engine.state._trayMisaligned = false;
        engine.state._rollersWorn = false;
        engine.state._humidityCurl = false;
        engine.state._multiFeed = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        var overrides = PR2Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) {
            engine.state[key] = overrides[key];
        }

        var scenario = PR2Config._scenarios[idx];
        PR2Config._flagRestored = true;
        PR2Config.hints = PR2Config._scenarioHints[scenario.id] || PR2Config._defaultHints;

        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return PR2Config._scenarios[engine.state._scenarioId];
    },

    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first to receive your assignment.';
        }
        return null;
    },

    _getPrinterState(engine, idx) {
        var p = JSON.parse(JSON.stringify(PR2Config._printers[idx]));
        var scenario = PR2Config._getScenario(engine);
        if (!scenario) return p;

        if (scenario.id === 'sensor_stuck' && idx === 0) {
            p.status = engine.state._sensorStuck ? 'Error - Paper Jam (Sensor)' : 'Ready';
        }
        if (scenario.id === 'tray_misalign' && idx === 1) {
            p.status = engine.state._trayMisaligned ? 'Error - Paper Jam (Tray)' : 'Ready';
        }
        if (scenario.id === 'worn_rollers' && idx === 2) {
            p.status = engine.state._rollersWorn ? 'Error - Paper Feed Failure' : 'Ready';
        }
        if (scenario.id === 'humidity_curl' && idx === 0) {
            p.status = engine.state._humidityCurl ? 'Error - Paper Jam (Fuser)' : 'Ready';
        }
        if (scenario.id === 'multi_feed' && idx === 1) {
            p.status = engine.state._multiFeed ? 'Error - Multi-Page Feed' : 'Ready';
        }
        return p;
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
            { id: 'printer_panel',    label: 'Printer\nPanel',      icon: 'INS', app: 'printer_panel' },
            { id: 'services',         label: 'Services',            icon: 'SVC', app: 'services' },
            { id: 'ticket',           label: 'Help Desk\nTicket',   icon: 'HD',  app: 'ticket' },
            { id: 'hints',            label: 'Hints',               icon: '?',   app: 'hints' },
            { id: 'reset',            label: 'Reset\nLab',          icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG
    // ==========================================================

    terminal: {
        user: 'Technician',
        hostname: 'HELPDESK01',
        startDir: 'C:\\Users\\Technician',
        promptStyle: 'windows',
        welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n'
    },

    filesystem: {
        '/': { type: 'dir', children: {} }
    },

    // ==========================================================
    // FLAGS
    // ==========================================================

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
        { id: 'hint1', text: 'Open Print Management to see which printer has a jam error.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Paper jams have mechanical root causes — check sensors, trays, rollers, and paper stock.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Open the Printer Panel to inspect physical components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag is in the tool you used to fix the problem.', cost: 50, penalty: -50 }
    ],

    // ==========================================================
    // LORE
    // ==========================================================

    lore: {
        intro: 'Paper jams are the #1 printer complaint. But not all jams are created equal. Some are mechanical, some are environmental, and some are caused by worn-out parts. Your job is to find the root cause and fix it.',
        scenario: 'Each scenario simulates a different paper handling failure. The printer panel lets you inspect the physical paper path, rollers, sensors, and trays.',
        outro: 'Paper path cleared. The printer is feeding cleanly and producing output again. Solid troubleshooting of the mechanical root cause.'
    },

    // ==========================================================
    // PHASES
    // ==========================================================

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the ticket and check printer status in Print Management.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the mechanical root cause — sensor, tray, rollers, paper, or separation pad.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the physical fix using the Printer Panel.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm the printer feeds paper cleanly and locate the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // COMMANDS
    // ==========================================================

    commands: {

        'get-printer': function(args, term, engine) {
            var gate = PR2Config._requireScenario(engine);
            if (gate) return gate;

            var out = '\nName                              DriverName                           PortName              PrinterStatus\n';
            out += '----                              ----------                           --------              -------------\n';
            PR2Config._printers.forEach(function(p, i) {
                var state = PR2Config._getPrinterState(engine, i);
                out += (state.name + '                                ').substring(0, 34) + '  '
                    + (state.driver + '                                     ').substring(0, 37) + '  '
                    + (state.port + '                    ').substring(0, 22) + '  '
                    + state.status + '\n';
            });
            return out;
        },

        wmic: function(args, term, engine) {
            var gate = PR2Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            if (!joined.includes('printer')) return '\nInvalid format.';
            if (joined.includes('list brief')) {
                var lines = '\nNode - HELPDESK01\n\n';
                lines += 'DeviceID                          PortName           Status\n';
                lines += '---------------------------------------------------------------\n';
                PR2Config._printers.forEach(function(p, i) {
                    var state = PR2Config._getPrinterState(engine, i);
                    lines += (state.name + '                                ').substring(0, 34) + '  '
                        + (state.port + '                ').substring(0, 18) + '  '
                        + state.status + '\n';
                });
                return lines;
            }
            return '\nUsage: wmic printer list brief';
        },

        ping: function(args, term, engine) {
            var gate = PR2Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping target_name';
            var target = args[0];
            if (target === '192.168.1.205') return '\nPinging 192.168.1.205 with 32 bytes of data:\nReply from 192.168.1.205: bytes=32 time=2ms TTL=64\nReply from 192.168.1.205: bytes=32 time=1ms TTL=64\n\nPing statistics for 192.168.1.205:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
            if (target === '192.168.1.200') return '\nPinging 192.168.1.200 with 32 bytes of data:\nReply from 192.168.1.200: bytes=32 time=2ms TTL=64\nReply from 192.168.1.200: bytes=32 time=1ms TTL=64\n\nPing statistics for 192.168.1.200:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
            if (target === '127.0.0.1' || target === 'localhost') return '\nPinging 127.0.0.1 with 32 bytes of data:\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\n\nPing statistics for 127.0.0.1:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
            return '\nPing request could not find host ' + target + '. Please check the name and try again.';
        },

        sc: function(args, term, engine) {
            var gate = PR2Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('query') && joined.includes('spooler')) {
                return '\nSERVICE_NAME: Spooler\n        TYPE               : 110  WIN32_OWN_PROCESS\n        STATE              : 4  RUNNING\n                                (STOPPABLE, NOT_PAUSABLE, ACCEPTS_SHUTDOWN)\n        WIN32_EXIT_CODE    : 0  (0x0)';
            }
            return '\nUsage: sc query <service_name>';
        },

        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        dir: function() { return ' Volume in drive C has no label.\n Directory of C:\\Users\\Technician\n               0 File(s)              0 bytes'; },
        systeminfo: function() { return '\nHost Name:                 HELPDESK01\nOS Name:                   Microsoft Windows 10 Pro\nOS Version:                10.0.19045\nSystem Model:              Dell OptiPlex 5090\nTotal Physical Memory:     8,192 MB'; },

        ifconfig: function() { return '\'ifconfig\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        grep: function() { return '\'grep\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command,\noperable program or batch file.'; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['print_management', 'printer_panel', 'services'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }

        switch (iconDef.app) {
            case 'ticket':           PR2Config._openTicket(iconDef, engine); break;
            case 'print_management': PR2Config._openPrintManagement(iconDef, engine); break;
            case 'printer_panel':    PR2Config._openPrinterPanel(iconDef, engine); break;
            case 'services':         PR2Config._openServices(iconDef, engine); break;
            case 'reset_lab':        PR2Config._confirmReset(engine); break;
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
        PR2Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            PR2Config._renderTicket(engine, container);
        } else {
            PR2Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker(engine, container) {
        var ticketPreviews = [
            'Karen Mitchell — "HP keeps saying Paper Jam but there is NO paper stuck"',
            'Derek Simmons — "Brother in Copy Room jams every 3-4 pages"',
            'Maria Gonzalez — "Xerox will not pick up paper at all"',
            'Karen Mitchell — "HP paper curls and wraps around fuser"',
            'Derek Simmons — "Brother grabs 3-4 sheets at once"'
        ];

        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#e67e22; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">HELP DESK QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select a ticket to begin your assignment, or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        PR2Config._scenarios.forEach(function(s, i) {
            html += '<button class="pr2-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#e67e22; font-weight:bold;">PR-' + (2000 + i) + '</span>'
                + '<span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + ticketPreviews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';

        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="pr2RandomBtn" style="padding:10px 28px; background:#e67e22; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.pr2-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#e67e22'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                PR2Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                PR2Config._renderTicket(engine, container);
            });
        });

        document.getElementById('pr2RandomBtn').addEventListener('click', function() {
            PR2Config._applyScenario(engine, Math.floor(Math.random() * PR2Config._scenarios.length));
            PR2Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        var scenario = PR2Config._getScenario(engine);
        var submitters = [
            'Karen Mitchell — Office Manager',
            'Derek Simmons — Copy Room Coordinator',
            'Maria Gonzalez — Sales Department',
            'Karen Mitchell — Office Manager',
            'Derek Simmons — Copy Room Coordinator'
        ];
        var submitter = submitters[engine.state._scenarioId] || 'Employee';
        var printer = PR2Config._printers[scenario.affectedPrinter];

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#e67e22; font-weight:bold; font-size:1rem;">HELP DESK TICKET #PR-' + (2000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: URGENT</span>'
            + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBMITTED BY</div><div>' + submitter + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DATE</div><div>March 29, 2026 — 8:47 AM</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">AFFECTED PRINTER</div><div style="font-weight:bold; color:#e67e22;">' + printer.name + '</div><div style="color:#888; font-size:0.7rem;">' + printer.location + ' &mdash; ' + printer.type + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div><div style="font-weight:bold;">' + PR2Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + PR2Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div><div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#ffcc80;">' + PR2Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — Desktop Support Technician</div></div>';
    },

    // ==========================================================
    // PRINT MANAGEMENT
    // ==========================================================

    _openPrintManagement(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); PR2Config._renderPrintManagement(engine); return; }
        var container = document.createElement('div');
        container.id = 'pmContainer';
        container.style.cssText = 'display:flex; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; overflow:hidden;';
        engine.openWindow(iconDef.id, 'Print Management', 'PRT', container);
        PR2Config._renderPrintManagement(engine);
    },

    _renderPrintManagement(engine) {
        var container = document.getElementById('pmContainer');
        if (!container) return;

        var rightHtml = '<div style="flex:1; padding:16px; overflow-y:auto;">';
        rightHtml += '<div style="font-size:0.9rem; font-weight:bold; color:#e67e22; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Printers — HELPDESK01</div>';
        rightHtml += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; margin-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.06);"><span style="flex:2;">Printer Name</span><span style="flex:1.5;">Driver</span><span style="flex:1;">Port</span><span style="flex:1;">Status</span></div>';

        PR2Config._printers.forEach(function(p, i) {
            var state = PR2Config._getPrinterState(engine, i);
            var isError = state.status.includes('Error');
            var statusColor = isError ? '#e74c3c' : '#2ecc71';
            rightHtml += '<div style="display:flex; align-items:center; padding:8px; margin-bottom:4px; background:' + (isError ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isError ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;">'
                + '<span style="flex:2; font-weight:bold;">' + state.name + '<br><span style="font-size:0.65rem; color:#888; font-weight:normal;">' + state.location + '</span></span>'
                + '<span style="flex:1.5; font-size:0.75rem; color:#aaa;">' + state.driver + '</span>'
                + '<span style="flex:1; font-size:0.75rem; color:#888;">' + state.port + '</span>'
                + '<span style="flex:1; font-size:0.75rem; color:' + statusColor + '; font-weight:' + (isError ? 'bold' : 'normal') + ';">' + state.status + '</span>'
                + '</div>';
        });

        if (engine.state._flagRevealed) {
            rightHtml += PR2Config._getFlagRevealHtml(engine);
        }

        rightHtml += '</div>';
        container.innerHTML = rightHtml;
    },

    // ==========================================================
    // PRINTER PANEL (physical inspection)
    // ==========================================================

    _openPrinterPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); PR2Config._renderPrinterPanel(engine); return; }
        var container = document.createElement('div');
        container.id = 'ppContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Printer Panel — Physical Inspection', 'INS', container);
        PR2Config._renderPrinterPanel(engine);
    },

    _renderPrinterPanel(engine) {
        var container = document.getElementById('ppContainer');
        if (!container) return;
        var scenario = PR2Config._getScenario(engine);
        if (!scenario) { container.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }

        var printer = PR2Config._printers[scenario.affectedPrinter];
        var html = '<div style="font-size:1rem; font-weight:bold; color:#e67e22; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Printer Panel — ' + printer.name + '</div>';

        var components = PR2Config._getInspectionComponents(engine, scenario);
        components.forEach(function(comp) {
            var isIssue = comp.issue;
            html += '<div style="margin-bottom:12px; padding:12px; background:' + (isIssue ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isIssue ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;">'
                + '<div style="font-weight:bold; color:' + (isIssue ? '#e74c3c' : '#2ecc71') + '; margin-bottom:4px;">' + comp.name + '</div>'
                + '<div style="color:#aaa; font-size:0.75rem; margin-bottom:8px;">' + comp.description + '</div>';
            if (comp.action && !engine.state._flagRevealed) {
                html += '<button class="pp-fix-btn" data-fix="' + comp.fixId + '" style="padding:6px 16px; background:#e67e22; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">' + comp.action + '</button>';
            }
            html += '</div>';
        });

        if (engine.state._flagRevealed) {
            html += PR2Config._getFlagRevealHtml(engine);
        }

        container.innerHTML = html;

        container.querySelectorAll('.pp-fix-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var fixId = this.getAttribute('data-fix');
                PR2Config._applyFix(engine, fixId);
            });
        });
    },

    _getInspectionComponents(engine, scenario) {
        var components = [];
        if (scenario.id === 'sensor_stuck') {
            components.push({ name: 'Paper Path', description: 'No paper visible in the paper path. Path is clear.', issue: false });
            components.push({ name: 'Paper Jam Sensor', description: engine.state._sensorStuck ? 'ALERT: Sensor is stuck in TRIGGERED position. It reports a jam even though the path is clear. Debris or mechanical binding may be preventing the sensor from resetting.' : 'Sensor has been cleaned and reset. Operating normally.', issue: engine.state._sensorStuck, fixId: 'clean_sensor', action: 'Clean & Reset Sensor' });
            components.push({ name: 'Tray 1', description: 'Paper loaded correctly. Guides aligned.', issue: false });
        } else if (scenario.id === 'tray_misalign') {
            components.push({ name: 'Paper Path', description: 'Paper fragments and crumpled sheets visible inside the paper path from repeated jams.', issue: true });
            components.push({ name: 'Tray 1', description: engine.state._trayMisaligned ? 'ALERT: Tray is not fully seated. Paper guides are loose — not snug against the paper stack. Paper enters the feed mechanism at an angle.' : 'Tray is fully seated. Guides aligned to Letter size. Paper feeds straight.', issue: engine.state._trayMisaligned, fixId: 'reseat_tray', action: 'Reseat Tray & Adjust Guides' });
            components.push({ name: 'Feed Rollers', description: 'Rollers appear to be in good condition.', issue: false });
        } else if (scenario.id === 'worn_rollers') {
            components.push({ name: 'Feed Rollers', description: engine.state._rollersWorn ? 'ALERT: Pickup rollers are glazed and smooth. They have lost their grip surface. Page count: 95,247. Rated lifespan: 100,000 pages. Replacement kit available in supply closet.' : 'New feed rollers installed. Grip surface is intact.', issue: engine.state._rollersWorn, fixId: 'replace_rollers', action: 'Replace Feed Rollers' });
            components.push({ name: 'Tray 1', description: 'Paper loaded correctly. Fill level normal.', issue: false });
            components.push({ name: 'Separation Pad', description: 'Separation pad has normal wear. Still functional.', issue: false });
        } else if (scenario.id === 'humidity_curl') {
            components.push({ name: 'Paper Stock', description: engine.state._humidityCurl ? 'ALERT: Paper is damp and wavy. Sheets are visibly curled at the edges before entering the printer. Humidity reading: 78%. Paper has absorbed moisture from the environment.' : 'Fresh dry paper loaded from sealed ream.', issue: engine.state._humidityCurl, fixId: 'replace_paper', action: 'Replace Paper Stock' });
            components.push({ name: 'Fuser Assembly', description: engine.state._humidityCurl ? 'Fuser is functional but the damp paper curls excessively when heated. Paper wraps around the fuser roller causing internal jams.' : 'Fuser operating normally with dry paper stock.', issue: engine.state._humidityCurl });
            components.push({ name: 'Output Tray', description: 'Output tray clear.', issue: false });
        } else if (scenario.id === 'multi_feed') {
            components.push({ name: 'Separation Pad', description: engine.state._multiFeed ? 'ALERT: Separation pad is worn smooth. It cannot separate individual sheets during pickup. Multiple sheets feed simultaneously.' : 'New separation pad installed. Single-sheet separation working correctly.', issue: engine.state._multiFeed, fixId: 'replace_pad', action: 'Replace Separation Pad' });
            components.push({ name: 'Tray 1 Fill Level', description: engine.state._multiFeed ? 'WARNING: Paper level is above the maximum fill line. Overfilling increases multi-feed risk.' : 'Paper level is below the maximum fill line.', issue: engine.state._multiFeed });
            components.push({ name: 'Feed Rollers', description: 'Rollers are in acceptable condition.', issue: false });
        }
        return components;
    },

    _applyFix(engine, fixId) {
        var scenario = PR2Config._getScenario(engine);
        if (!scenario) return;

        var fixed = false;
        if (fixId === 'clean_sensor' && scenario.id === 'sensor_stuck') {
            engine.state._sensorStuck = false;
            fixed = true;
        } else if (fixId === 'reseat_tray' && scenario.id === 'tray_misalign') {
            engine.state._trayMisaligned = false;
            fixed = true;
        } else if (fixId === 'replace_rollers' && scenario.id === 'worn_rollers') {
            engine.state._rollersWorn = false;
            fixed = true;
        } else if (fixId === 'replace_paper' && scenario.id === 'humidity_curl') {
            engine.state._humidityCurl = false;
            fixed = true;
        } else if (fixId === 'replace_pad' && scenario.id === 'multi_feed') {
            engine.state._multiFeed = false;
            fixed = true;
        }

        if (fixed) {
            engine.state._flagRevealed = true;
            engine.state._labComplete = true;
            engine.save();
            engine.notify('Fix applied successfully. Printer is feeding paper cleanly. Check the Printer Panel for the diagnostic token.', 'success');
            PR2Config._renderPrinterPanel(engine);
            PR2Config._renderPrintManagement(engine);
        }
    },

    // ==========================================================
    // SERVICES
    // ==========================================================

    _openServices(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Services', 'SVC', container);

        var services = [
            { name: 'Background Intelligent Transfer', status: 'Running', startup: 'Automatic' },
            { name: 'DHCP Client', status: 'Running', startup: 'Automatic' },
            { name: 'DNS Client', status: 'Running', startup: 'Automatic' },
            { name: 'Print Spooler', status: 'Running', startup: 'Automatic', highlight: true },
            { name: 'Windows Defender Firewall', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Event Log', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Update', status: 'Running', startup: 'Manual' }
        ];

        var html = '<div style="font-size:1rem; font-weight:bold; color:#e67e22; margin-bottom:16px;">Services (Local)</div>';
        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; margin-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.08);"><span style="flex:2.5;">Name</span><span style="flex:1;">Status</span><span style="flex:1;">Startup Type</span></div>';
        services.forEach(function(svc) {
            html += '<div style="display:flex; padding:6px 8px; margin-bottom:2px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); border-radius:3px;">'
                + '<span style="flex:2.5;">' + svc.name + '</span>'
                + '<span style="flex:1; color:#2ecc71;">' + svc.status + '</span>'
                + '<span style="flex:1; color:#888;">' + svc.startup + '</span></div>';
        });
        container.innerHTML = html;
    },

    // ==========================================================
    // FLAG REVEAL
    // ==========================================================

    _getFlagRevealHtml(engine) {
        var scenario = PR2Config._getScenario(engine);
        if (!engine.state._flagRevealed || !scenario) return '';

        var labels = {
            sensor_stuck: 'Paper jam sensor cleaned and reset. False jam error cleared.',
            tray_misalign: 'Tray reseated and guides aligned. Paper feeds straight.',
            worn_rollers: 'Feed rollers replaced. Paper pickup restored.',
            humidity_curl: 'Damp paper replaced with dry stock. Fuser curl eliminated.',
            multi_feed: 'Separation pad replaced and tray fill corrected. Single-sheet feed restored.'
        };
        var label = labels[scenario.id] || 'Fix confirmed.';
        var flagElId = 'pr2-flag-reveal-' + scenario.id;

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
            + '<div style="font-size:0.8rem; color:#aaa; margin-bottom:20px;">This will clear all progress and restart from the beginning.</div>'
            + '<div style="display:flex; gap:12px; justify-content:center;">'
            + '<button id="pr2ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Reset</button>'
            + '<button id="pr2ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div></div>';

        document.getElementById('arena').appendChild(overlay);
        document.getElementById('pr2ResetConfirm').addEventListener('click', function() {
            PR2Config._flagRestored = false;
            PR2Config.hints = PR2Config._defaultHints;
            engine.reset();
        });
        document.getElementById('pr2ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

};
