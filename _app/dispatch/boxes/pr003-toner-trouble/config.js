/* ============================================================
   DISPATCH LAB — Box PR3: Toner Trouble
   CompTIA A+ Core 2 — Troubleshooting Printers (220-1102)
   Config: printer state, Windows commands, GUI, scenarios
   5 distinct scenarios: low toner false alarm, third-party cartridge,
   fuser smearing, vertical streaks, ghost images
   ============================================================ */

var PR3Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Toner Trouble',
    subtitle: 'Image Quality Crisis — A+ Core 2 Toner Troubleshooting',
    difficulty: 'Beginner',
    accent: '#e67e22',
    storageKey: 'hexworth_lab_pr3',
    registryId: 'pr003-toner-trouble',
    trackerKey: 'lab_pr3',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Help Desk Ticket',
                tip: 'Double-click the Help Desk Ticket icon to read the user complaint.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Examine the printer status',
                tip: 'Open Print Management to identify which printer has the image quality issue.',
                trigger: { event: 'window_open', match: { type: 'print_management' } }
            },
            {
                title: 'Inspect the toner system',
                tip: 'Open the Printer Panel to check cartridge status, fuser condition, drum health, and print quality.',
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
                tip: 'Reset the toner chip, swap cartridges, clean the fuser, replace the drum, or clean the charge roller.',
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
                tip: 'After fixing the issue, locate the diagnostic token.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    certObjectives: {
        certPath: 'A+ Core 2',
        mappings: [
            { flagId: 'fixed', objective: '3.3', description: 'Troubleshoot common hardware problems', skill: 'Printer Image Quality Troubleshooting' },
            { flagId: 'fixed', objective: '3.1', description: 'Troubleshoot common Windows OS problems', skill: 'Toner and Fuser Diagnostics' }
        ]
    },

    _printers: [
        { name: 'HP LaserJet Pro M404', ip: null, port: 'USB001', location: 'Front Desk', type: 'USB', driver: 'HP Universal Print Driver', status: 'Ready' },
        { name: 'Brother MFC-L2750DW', ip: '192.168.1.205', port: 'IP_192.168.1.205', location: 'Copy Room', type: 'Network', driver: 'Brother MFC-L2750DW', status: 'Ready' },
        { name: 'Xerox WorkCentre 6515', ip: '192.168.1.200', port: 'IP_192.168.1.200', location: 'Bullpen', type: 'Network', driver: 'Xerox WorkCentre 6515 PCL6', status: 'Ready' }
    ],

    _scenarioFlags: {
        low_toner_false:  null,
        third_party:      null,
        fuser_smear:      null,
        vertical_streaks: null,
        ghost_images:     null
    },

    _scenarios: [
        {
            id: 'low_toner_false',
            name: 'Low Toner False Alarm',
            ticketSubject: 'HP says "Toner Low — Replace Cartridge" but prints look perfect',
            ticketDetail: 'The HP at the front desk has been showing "Toner Low" for about a week. The display says to replace the cartridge immediately. But the prints look completely fine — text is dark and clear, no fading at all. I just replaced this cartridge two months ago. Is it really empty?',
            ticketExtra: 'IT Note: This is a compatible third-party cartridge. Some aftermarket cartridges have toner level chips that do not report accurately to the printer firmware. The chip may need resetting or the low-toner override may need to be enabled.',
            affectedPrinter: 0,
            fixDescription: 'Reset the toner chip counter or enable low-toner override in printer settings',
            stateOverrides: { _falseLowToner: true }
        },
        {
            id: 'third_party',
            name: 'Third-Party Cartridge Not Recognized',
            ticketSubject: 'Brother in Copy Room says "Unsupported Cartridge" — refuses to print',
            ticketDetail: 'We bought a cheaper compatible toner cartridge for the Brother in the copy room. I installed it and now the printer shows "Unsupported Cartridge — Replace with Genuine Brother Toner" and refuses to print anything. The old cartridge was completely empty so I cannot put it back.',
            ticketExtra: 'IT Note: Brother printers use cartridge authentication chips. Third-party cartridges sometimes have incompatible chips. There may be a firmware-level override or the cartridge chip contacts may need cleaning.',
            affectedPrinter: 1,
            fixDescription: 'Clean cartridge chip contacts and enable third-party cartridge acceptance',
            stateOverrides: { _cartridgeRejected: true }
        },
        {
            id: 'fuser_smear',
            name: 'Fuser Error Causing Smearing',
            ticketSubject: 'Xerox in Bullpen — toner smears when you touch the page',
            ticketDetail: 'Every page from the Xerox in the bullpen has toner that smears if you touch it or rub it even slightly. The text looks normal at first but it is not fused to the paper. If you slide your finger across a line of text it smudges into a black streak. This is ruining our printed contracts.',
            ticketExtra: 'IT Note: Toner not fusing to paper is a classic fuser assembly failure. The fuser heats and presses toner into the paper fibers. If the fuser temperature is too low or the fuser roller is damaged, toner will not bond properly.',
            affectedPrinter: 2,
            fixDescription: 'Replace or recalibrate the fuser assembly',
            stateOverrides: { _fuserFailing: true }
        },
        {
            id: 'vertical_streaks',
            name: 'Vertical Streaks on Page',
            ticketSubject: 'HP at Front Desk — black vertical lines down every page',
            ticketDetail: 'The HP printer at the front desk is printing a thin black vertical line down the left side of every single page. It appears in the exact same position on every page regardless of what I print. I printed a blank page and the line is still there. It started about two days ago.',
            ticketExtra: 'IT Note: Consistent vertical lines in the same position indicate a defect on the drum or a scratch on the drum surface. The drum rotates and prints one complete revolution per page — a scratch or buildup will repeat at the same vertical position.',
            affectedPrinter: 0,
            fixDescription: 'Replace the damaged imaging drum/cartridge',
            stateOverrides: { _drumScratched: true }
        },
        {
            id: 'ghost_images',
            name: 'Ghost Images',
            ticketSubject: 'Brother in Copy Room — faint repeated images appear lower on the page',
            ticketDetail: 'The Brother printer is producing a strange effect. Whatever I print appears correctly at the top of the page, but then a faint "ghost" copy of the same content appears about 3 inches lower. It is like a shadow of the original print. This happens on every page.',
            ticketExtra: 'IT Note: Ghost images are caused by toner remaining on the drum after the cleaning blade passes. This is often due to a worn cleaning blade, a degraded charge roller, or the drum not being fully discharged between rotations. The ghost appears at exactly one drum circumference distance from the original.',
            affectedPrinter: 1,
            fixDescription: 'Replace the drum unit and clean the charge roller',
            stateOverrides: { _ghostImages: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open Print Management and check which printer shows image quality issues.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Toner issues can be chip/firmware, cartridge compatibility, fuser, drum, or charge roller problems.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Open the Printer Panel to inspect the toner system components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after you apply the correct fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        low_toner_false: [
            { id: 'hint1', text: 'The prints look fine but the printer says toner is low. This is likely a chip reporting issue.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Third-party cartridges often have inaccurate toner level chips. Check the Printer Panel for chip status.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Reset the toner chip counter or enable the low-toner override in printer settings to continue printing.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: select Toner Cartridge, choose Reset Chip Counter. This clears the false alarm.', cost: 150, penalty: -150 }
        ],
        third_party: [
            { id: 'hint1', text: 'The printer is rejecting the third-party cartridge. Authentication chip mismatch.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check cartridge chip contacts for contamination. Also check if there is a firmware override option.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Clean the chip contacts with isopropyl alcohol. Then enable third-party cartridge mode in printer settings.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: Clean Chip Contacts, then Settings > Enable Third-Party Cartridge Mode.', cost: 150, penalty: -150 }
        ],
        fuser_smear: [
            { id: 'hint1', text: 'Toner that smears when touched means it is not being fused to the paper properly.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The fuser assembly heats and presses toner into paper. If the fuser is failing, toner stays loose.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The fuser temperature is too low or the roller is damaged. Replace or recalibrate the fuser assembly.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: select Fuser Assembly, choose Replace/Recalibrate Fuser.', cost: 150, penalty: -150 }
        ],
        vertical_streaks: [
            { id: 'hint1', text: 'A consistent vertical line in the same position on every page points to the drum.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The imaging drum rotates against the paper. A scratch or buildup on the drum creates a repeating line.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The drum has a scratch. It needs to be replaced — scratches cannot be repaired.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: select Imaging Drum, choose Replace Drum Cartridge.', cost: 150, penalty: -150 }
        ],
        ghost_images: [
            { id: 'hint1', text: 'Ghost images at a fixed distance below the original are a drum/cleaning blade issue.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The ghost appears one drum circumference below. Residual toner is not being cleaned from the drum.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The cleaning blade is worn and the charge roller is degraded. Replace the drum unit and clean the charge roller.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: select Drum Unit, choose Replace Drum & Clean Charge Roller.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !PR3Config._flagRestored) {
            PR3Config._flagRestored = true;
            var scenario = PR3Config._scenarios[engine.state._scenarioId];
            if (scenario) PR3Config.hints = PR3Config._scenarioHints[scenario.id] || PR3Config._defaultHints;
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._falseLowToner = false;
        engine.state._cartridgeRejected = false;
        engine.state._fuserFailing = false;
        engine.state._drumScratched = false;
        engine.state._ghostImages = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        var overrides = PR3Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) engine.state[key] = overrides[key];

        var scenario = PR3Config._scenarios[idx];
        PR3Config._flagRestored = true;
        PR3Config.hints = PR3Config._scenarioHints[scenario.id] || PR3Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return PR3Config._scenarios[engine.state._scenarioId];
    },

    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) return '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first to receive your assignment.';
        return null;
    },

    _getPrinterState(engine, idx) {
        var p = JSON.parse(JSON.stringify(PR3Config._printers[idx]));
        var scenario = PR3Config._getScenario(engine);
        if (!scenario) return p;

        if (scenario.id === 'low_toner_false' && idx === 0) p.status = engine.state._falseLowToner ? 'Warning - Toner Low' : 'Ready';
        if (scenario.id === 'third_party' && idx === 1) p.status = engine.state._cartridgeRejected ? 'Error - Unsupported Cartridge' : 'Ready';
        if (scenario.id === 'fuser_smear' && idx === 2) p.status = engine.state._fuserFailing ? 'Error - Fuser Fault' : 'Ready';
        if (scenario.id === 'vertical_streaks' && idx === 0) p.status = engine.state._drumScratched ? 'Warning - Image Quality' : 'Ready';
        if (scenario.id === 'ghost_images' && idx === 1) p.status = engine.state._ghostImages ? 'Warning - Ghost Image Detected' : 'Ready';
        return p;
    },

    _escHtml(str) { var div = document.createElement('div'); div.textContent = str; return div.innerHTML; },

    // ==========================================================
    // BOOT / DESKTOP / TERMINAL
    // ==========================================================

    boot: {
        biosLines: ['American Megatrends UEFI BIOS v2.20.1271', 'Initializing hardware...', 'Memory Test: 16384 MB OK', 'Detecting drives... NVMe: WD SN750 (512GB)', 'Boot device: NVMe0', 'Loading Windows Boot Manager...'],
        grubEntries: ['Windows 10 Pro', 'Windows Recovery Environment'],
        loginUser: 'Technician'
    },

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

    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },

    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },

    hints: [
        { id: 'hint1', text: 'Open Print Management to check printer status.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Toner problems have different root causes — chip, cartridge, fuser, drum, or charge roller.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the Printer Panel to inspect internal components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],

    lore: {
        intro: 'Image quality complaints are pouring in. From false toner warnings to smeared output and ghost images, each problem has a different root cause in the toner system.',
        scenario: 'Each scenario targets a different part of the laser printing process — toner cartridge, fuser, imaging drum, or charge roller. Diagnose the component and apply the correct fix.',
        outro: 'Image quality restored. The toner system is operating correctly and producing clean, professional output.'
    },

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the ticket and check printer status.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the failing component — toner chip, cartridge, fuser, drum, or charge roller.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the correct fix via the Printer Panel.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm print quality is restored and locate the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // COMMANDS
    // ==========================================================

    commands: {
        'get-printer': function(args, term, engine) {
            var gate = PR3Config._requireScenario(engine); if (gate) return gate;
            var out = '\nName                              DriverName                           PortName              PrinterStatus\n----                              ----------                           --------              -------------\n';
            PR3Config._printers.forEach(function(p, i) { var s = PR3Config._getPrinterState(engine, i); out += (s.name + '                                ').substring(0, 34) + '  ' + (s.driver + '                                     ').substring(0, 37) + '  ' + (s.port + '                    ').substring(0, 22) + '  ' + s.status + '\n'; });
            return out;
        },
        wmic: function(args, term, engine) { var gate = PR3Config._requireScenario(engine); if (gate) return gate; var j = args.join(' ').toLowerCase(); if (!j.includes('printer')) return '\nInvalid format.'; if (j.includes('list brief')) { var l = '\nNode - HELPDESK01\n\n'; PR3Config._printers.forEach(function(p, i) { var s = PR3Config._getPrinterState(engine, i); l += s.name + '    ' + s.port + '    ' + s.status + '\n'; }); return l; } return '\nUsage: wmic printer list brief'; },
        ping: function(args) { if (!args.length) return '\nUsage: ping target'; if (args[0] === '127.0.0.1') return '\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128'; return '\nPing request could not find host ' + args[0]; },
        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        dir: function() { return ' Directory of C:\\Users\\Technician\n               0 File(s)'; },
        systeminfo: function() { return '\nHost Name:  HELPDESK01\nOS Name:    Microsoft Windows 10 Pro\nOS Version: 10.0.19045'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command,\noperable program or batch file.'; }
    },

    // ==========================================================
    // WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['print_management', 'printer_panel', 'services'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket':           PR3Config._openTicket(iconDef, engine); break;
            case 'print_management': PR3Config._openPrintManagement(iconDef, engine); break;
            case 'printer_panel':    PR3Config._openPrinterPanel(iconDef, engine); break;
            case 'services':         PR3Config._openServices(iconDef, engine); break;
            case 'reset_lab':        PR3Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        PR3Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) PR3Config._renderTicket(engine, container);
        else PR3Config._renderScenarioPicker(engine, container);
    },

    _renderScenarioPicker(engine, container) {
        var previews = [
            'Karen Mitchell — "HP says Toner Low but prints look fine"',
            'Derek Simmons — "Brother rejects new toner cartridge"',
            'Jason Okafor — "Xerox toner smears when you touch the page"',
            'Karen Mitchell — "HP prints black lines down every page"',
            'Derek Simmons — "Brother prints ghost copies on every page"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#e67e22; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">HELP DESK QUEUE</div><div style="color:#888; font-size:0.75rem;">Select a ticket or get a random assignment.</div></div><div>';
        PR3Config._scenarios.forEach(function(s, i) {
            html += '<button class="pr3-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#e67e22; font-weight:bold;">PR-' + (3000 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="pr3RandomBtn" style="padding:10px 28px; background:#e67e22; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.pr3-scenario-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { PR3Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); PR3Config._renderTicket(engine, container); });
        });
        document.getElementById('pr3RandomBtn').addEventListener('click', function() { PR3Config._applyScenario(engine, Math.floor(Math.random() * PR3Config._scenarios.length)); PR3Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var scenario = PR3Config._getScenario(engine);
        var submitters = ['Karen Mitchell — Office Manager', 'Derek Simmons — Copy Room Coordinator', 'Jason Okafor — Accounting', 'Karen Mitchell — Office Manager', 'Derek Simmons — Copy Room Coordinator'];
        var submitter = submitters[engine.state._scenarioId] || 'Employee';
        var printer = PR3Config._printers[scenario.affectedPrinter];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#e67e22; font-weight:bold; font-size:1rem;">HELP DESK TICKET #PR-' + (3000 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: URGENT</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBMITTED BY</div><div>' + submitter + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DATE</div><div>March 29, 2026 — 10:15 AM</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">AFFECTED PRINTER</div><div style="font-weight:bold; color:#e67e22;">' + printer.name + '</div><div style="color:#888; font-size:0.7rem;">' + printer.location + ' &mdash; ' + printer.type + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + PR3Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + PR3Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#ffcc80;">' + PR3Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — Desktop Support Technician</div></div>';
    },

    _openPrintManagement(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); PR3Config._renderPrintManagement(engine); return; }
        var container = document.createElement('div'); container.id = 'pmContainer';
        container.style.cssText = 'display:flex; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; overflow:hidden;';
        engine.openWindow(iconDef.id, 'Print Management', 'PRT', container);
        PR3Config._renderPrintManagement(engine);
    },

    _renderPrintManagement(engine) {
        var container = document.getElementById('pmContainer'); if (!container) return;
        var html = '<div style="flex:1; padding:16px; overflow-y:auto;">';
        html += '<div style="font-size:0.9rem; font-weight:bold; color:#e67e22; margin-bottom:12px;">Printers — HELPDESK01</div>';
        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; border-bottom:1px solid rgba(255,255,255,0.06);"><span style="flex:2;">Name</span><span style="flex:1.5;">Driver</span><span style="flex:1;">Port</span><span style="flex:1;">Status</span></div>';
        PR3Config._printers.forEach(function(p, i) {
            var s = PR3Config._getPrinterState(engine, i); var isErr = s.status.includes('Error') || s.status.includes('Warning');
            html += '<div style="display:flex; padding:8px; margin-bottom:4px; background:' + (isErr ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isErr ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;"><span style="flex:2; font-weight:bold;">' + s.name + '</span><span style="flex:1.5; color:#aaa; font-size:0.75rem;">' + s.driver + '</span><span style="flex:1; color:#888; font-size:0.75rem;">' + s.port + '</span><span style="flex:1; color:' + (isErr ? '#e74c3c' : '#2ecc71') + '; font-size:0.75rem;">' + s.status + '</span></div>';
        });
        if (engine.state._flagRevealed) html += PR3Config._getFlagRevealHtml(engine);
        html += '</div>';
        container.innerHTML = html;
    },

    _openPrinterPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); PR3Config._renderPrinterPanel(engine); return; }
        var container = document.createElement('div'); container.id = 'ppContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Printer Panel — Toner System', 'INS', container);
        PR3Config._renderPrinterPanel(engine);
    },

    _renderPrinterPanel(engine) {
        var container = document.getElementById('ppContainer'); if (!container) return;
        var scenario = PR3Config._getScenario(engine);
        if (!scenario) { container.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var printer = PR3Config._printers[scenario.affectedPrinter];
        var html = '<div style="font-size:1rem; font-weight:bold; color:#e67e22; margin-bottom:16px;">' + printer.name + ' — Toner System Inspection</div>';

        var comps = [];
        if (scenario.id === 'low_toner_false') {
            comps.push({ name: 'Toner Cartridge', desc: engine.state._falseLowToner ? 'ALERT: Chip reports 2% toner remaining. Visual inspection shows cartridge is approximately 65% full. Chip counter is inaccurate (third-party cartridge).' : 'Chip counter reset. Toner level now reporting correctly.', issue: engine.state._falseLowToner, fixId: 'reset_chip', action: 'Reset Chip Counter' });
            comps.push({ name: 'Print Quality', desc: 'Output is dark and clear. No fading or light spots detected.', issue: false });
        } else if (scenario.id === 'third_party') {
            comps.push({ name: 'Toner Cartridge', desc: engine.state._cartridgeRejected ? 'ALERT: Printer firmware rejects cartridge. Authentication chip mismatch. Chip contacts may have residue from packaging.' : 'Third-party cartridge accepted. Printing normally.', issue: engine.state._cartridgeRejected, fixId: 'clean_accept', action: 'Clean Contacts & Enable Third-Party Mode' });
            comps.push({ name: 'Firmware Settings', desc: engine.state._cartridgeRejected ? 'Third-party cartridge acceptance: DISABLED' : 'Third-party cartridge acceptance: ENABLED', issue: engine.state._cartridgeRejected });
        } else if (scenario.id === 'fuser_smear') {
            comps.push({ name: 'Fuser Assembly', desc: engine.state._fuserFailing ? 'ALERT: Fuser temperature reading: 125C (expected: 200C). Heating element is degraded. Toner is not bonding to paper.' : 'Fuser replaced. Temperature at 200C. Toner bonding correctly.', issue: engine.state._fuserFailing, fixId: 'replace_fuser', action: 'Replace Fuser Assembly' });
            comps.push({ name: 'Toner Cartridge', desc: 'Toner cartridge is functioning normally. Issue is in the fusing stage, not toner delivery.', issue: false });
        } else if (scenario.id === 'vertical_streaks') {
            comps.push({ name: 'Imaging Drum', desc: engine.state._drumScratched ? 'ALERT: Visible scratch on drum surface at approximately 15mm from left edge. This scratch deposits toner in a consistent vertical line on every rotation.' : 'New drum installed. Surface is clean and smooth.', issue: engine.state._drumScratched, fixId: 'replace_drum', action: 'Replace Drum Cartridge' });
            comps.push({ name: 'Toner Cartridge', desc: 'Toner level and distribution are normal. Issue is on the drum, not the cartridge.', issue: false });
        } else if (scenario.id === 'ghost_images') {
            comps.push({ name: 'Drum Unit', desc: engine.state._ghostImages ? 'ALERT: Cleaning blade is worn — residual toner remains on drum after cleaning pass. Charge roller shows degradation — drum is not fully discharged between rotations. Ghost appears at one drum circumference (75mm) from original image.' : 'New drum unit installed. Cleaning blade and charge roller functioning correctly.', issue: engine.state._ghostImages, fixId: 'replace_drum_charge', action: 'Replace Drum & Clean Charge Roller' });
            comps.push({ name: 'Fuser Assembly', desc: 'Fuser is operating at correct temperature. Not contributing to ghost effect.', issue: false });
        }

        comps.forEach(function(c) {
            html += '<div style="margin-bottom:12px; padding:12px; background:' + (c.issue ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (c.issue ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;"><div style="font-weight:bold; color:' + (c.issue ? '#e74c3c' : '#2ecc71') + ';">' + c.name + '</div><div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">' + c.desc + '</div>';
            if (c.action && c.issue) html += '<button class="pp-fix-btn" data-fix="' + c.fixId + '" style="padding:6px 16px; background:#e67e22; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">' + c.action + '</button>';
            html += '</div>';
        });
        if (engine.state._flagRevealed) html += PR3Config._getFlagRevealHtml(engine);
        container.innerHTML = html;

        container.querySelectorAll('.pp-fix-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { PR3Config._applyFix(engine, this.getAttribute('data-fix')); });
        });
    },

    _applyFix(engine, fixId) {
        var scenario = PR3Config._getScenario(engine); if (!scenario) return;
        var fixed = false;
        if (fixId === 'reset_chip' && scenario.id === 'low_toner_false') { engine.state._falseLowToner = false; fixed = true; }
        else if (fixId === 'clean_accept' && scenario.id === 'third_party') { engine.state._cartridgeRejected = false; fixed = true; }
        else if (fixId === 'replace_fuser' && scenario.id === 'fuser_smear') { engine.state._fuserFailing = false; fixed = true; }
        else if (fixId === 'replace_drum' && scenario.id === 'vertical_streaks') { engine.state._drumScratched = false; fixed = true; }
        else if (fixId === 'replace_drum_charge' && scenario.id === 'ghost_images') { engine.state._ghostImages = false; fixed = true; }

        if (fixed) {
            engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
            engine.notify('Fix applied. Print quality restored. Check the Printer Panel for the diagnostic token.', 'success');
            PR3Config._renderPrinterPanel(engine); PR3Config._renderPrintManagement(engine);
        }
    },

    _openServices(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Services', 'SVC', container);
        container.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#e67e22; margin-bottom:16px;">Services (Local)</div><div style="color:#aaa;">Print Spooler: Running | Windows Event Log: Running | DHCP Client: Running</div>';
    },

    _getFlagRevealHtml(engine) {
        var scenario = PR3Config._getScenario(engine);
        if (!engine.state._flagRevealed || !scenario) return '';
        var labels = { low_toner_false: 'Toner chip counter reset. False low-toner warning cleared.', third_party: 'Third-party cartridge accepted. Chip contacts cleaned.', fuser_smear: 'Fuser assembly replaced. Toner bonding correctly.', vertical_streaks: 'Drum cartridge replaced. Vertical streaks eliminated.', ghost_images: 'Drum unit and charge roller replaced. Ghost images eliminated.' };
        var flagElId = 'pr3-flag-reveal-' + scenario.id;
        setTimeout(function() { BoxEngine.requestFlagText(scenario.id).then(function(f) { var el = document.getElementById(flagElId); if (el) el.textContent = 'Token: ' + (f || 'Flag unavailable'); }); }, 0);
        return '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Fix Confirmed:</div><div style="color:#c8e6c9; font-size:0.8rem;">' + labels[scenario.id] + '</div><div id="' + flagElId + '" style="color:#c8e6c9; font-size:0.8rem; margin-top:4px;">Token: loading...</div></div>';
    },

    _confirmReset(engine) {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="font-size:1rem; font-weight:bold; color:#e74c3c; margin-bottom:12px;">Reset Lab?</div><div style="font-size:0.8rem; color:#aaa; margin-bottom:20px;">This will clear all progress.</div><div style="display:flex; gap:12px; justify-content:center;"><button id="pr3ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="pr3ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(overlay);
        document.getElementById('pr3ResetConfirm').addEventListener('click', function() { PR3Config._flagRestored = false; PR3Config.hints = PR3Config._defaultHints; engine.reset(); });
        document.getElementById('pr3ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }
};
