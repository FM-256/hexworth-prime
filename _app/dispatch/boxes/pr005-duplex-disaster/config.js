/* ============================================================
   DISPATCH LAB — Box PR5: Duplex Disaster
   CompTIA A+ Core 2 — Duplex Printing Troubleshooting
   5 scenarios: duplex unit not installed, wrong paper size,
   margin offset, upside-down reverse, collation scrambled
   ============================================================ */

var PR5Config = {

    title: 'Duplex Disaster',
    subtitle: 'Both Sides Wrong — A+ Core 2 Duplex Troubleshooting',
    difficulty: 'Beginner',
    accent: '#e67e22',
    storageKey: 'hexworth_lab_pr5',
    registryId: 'pr005-duplex-disaster',
    trackerKey: 'lab_pr5',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the complaint about duplex printing.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check printer configuration', tip: 'Open Print Management or Printing Preferences to check duplex settings.', trigger: { event: 'window_open', match: { type: 'print_management' } } },
            { title: 'Diagnose the duplex issue', tip: 'Check duplex unit installation, paper size, margins, orientation, and collation settings.', trigger: { event: 'window_open', match: { type: 'printer_panel' }, alt: [{ event: 'command', match: { cmd: 'contains:printer' } }] } },
            { title: 'Apply the fix', tip: 'Install the duplex unit, correct paper size, adjust margins, fix orientation, or correct collation.', trigger: { event: 'command', match: { cmd: 'contains:fix' }, alt: [{ event: 'window_open', match: { type: 'printer_panel' } }] } },
            { title: 'Capture the flag', tip: 'After fixing duplex, locate the diagnostic token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'A+ Core 2', mappings: [
        { flagId: 'fixed', objective: '3.3', description: 'Troubleshoot common hardware problems', skill: 'Duplex Printing Configuration' },
        { flagId: 'fixed', objective: '3.1', description: 'Troubleshoot common Windows OS problems', skill: 'Print Driver Settings Management' }
    ] },

    _printers: [
        { name: 'HP LaserJet Pro M428fdw', ip: null, port: 'USB001', location: 'Front Desk', type: 'USB', driver: 'HP Universal Print Driver', status: 'Ready' },
        { name: 'Xerox VersaLink C405', ip: '192.168.1.200', port: 'IP_192.168.1.200', location: 'Bullpen', type: 'Network', driver: 'Xerox VersaLink C405 PCL6', status: 'Ready' },
        { name: 'Brother MFC-L8900CDW', ip: '192.168.1.205', port: 'IP_192.168.1.205', location: 'Copy Room', type: 'Network', driver: 'Brother MFC-L8900CDW', status: 'Ready' }
    ],

    _scenarioFlags: { no_duplex_unit: null, wrong_paper: null, margin_offset: null, upside_down: null, collation_scrambled: null },

    _scenarios: [
        {
            id: 'no_duplex_unit',
            name: 'Duplex Unit Not Installed',
            ticketSubject: 'HP at Front Desk says duplex is available but only prints one side',
            ticketDetail: 'I set the HP to print double-sided but every page only prints on one side. The driver shows "Duplex Printing: On" but nothing prints on the back. It used to work. The printer was moved from the conference room yesterday — could something have come loose?',
            ticketExtra: 'IT Note: The HP M428fdw has a removable duplex unit in the rear. During the move, the duplex unit may have been removed or become disconnected. The driver does not detect hardware — it shows duplex as available based on the driver capability, not the physical unit.',
            affectedPrinter: 0,
            fixDescription: 'Reinstall the duplex unit in the rear of the printer',
            stateOverrides: { _noDuplexUnit: true }
        },
        {
            id: 'wrong_paper',
            name: 'Wrong Paper Size for Duplex',
            ticketSubject: 'Xerox in Bullpen jams every time I try double-sided on legal paper',
            ticketDetail: 'The Xerox printer in the bullpen jams every single time I try to print double-sided on Legal size paper. Single-sided legal prints fine. But the moment I turn on duplex, it jams inside the duplex path on the second pass. This is happening to everyone who tries legal-size duplex.',
            ticketExtra: 'IT Note: The Xerox VersaLink C405 duplex unit supports Letter, A4, and Executive sizes. Legal (8.5x14) exceeds the duplex path length. The paper guide in the duplex path cannot handle the longer sheets. Driver should restrict this but the setting was not configured.',
            affectedPrinter: 1,
            fixDescription: 'Configure driver to disable duplex for Legal size or switch to Letter',
            stateOverrides: { _wrongPaperDuplex: true }
        },
        {
            id: 'margin_offset',
            name: 'Margin Offset on Back Side',
            ticketSubject: 'Brother in Copy Room — back side of duplex pages has wrong margins',
            ticketDetail: 'When I print double-sided on the Brother in the copy room, the front side looks perfect. But the back side has the content shifted about half an inch to the left. When you hold the page up to the light, the front and back do not line up at all. This is causing problems for our booklet printing.',
            ticketExtra: 'IT Note: Duplex margin alignment requires calibration. If the registration between the front and back print passes is off, the back side content shifts. The printer has a duplex registration adjustment in the maintenance menu.',
            affectedPrinter: 2,
            fixDescription: 'Run duplex registration calibration from the printer maintenance menu',
            stateOverrides: { _marginOffset: true }
        },
        {
            id: 'upside_down',
            name: 'Pages Printing Upside Down on Reverse',
            ticketSubject: 'HP at Front Desk — back side of pages is upside down',
            ticketDetail: 'I am printing a double-sided document on the HP and the front side is correct, but when I flip the page over the back side is upside down. It is like the page was rotated 180 degrees for the reverse side. This makes the document unreadable when flipping pages normally. Every duplex job does this.',
            ticketExtra: 'IT Note: This is a binding direction issue. The driver is set to "Flip on Short Edge" when the document requires "Flip on Long Edge" (standard for portrait documents). The binding orientation in Printing Preferences needs to be changed.',
            affectedPrinter: 0,
            fixDescription: 'Change duplex binding from Short Edge to Long Edge in driver settings',
            stateOverrides: { _upsideDown: true }
        },
        {
            id: 'collation_scrambled',
            name: 'Collation Scrambled',
            ticketSubject: 'Xerox in Bullpen — duplex pages come out in wrong order with mixed content',
            ticketDetail: 'I printed a 10-page duplex document on the Xerox (should be 5 sheets, double-sided). But the pages are completely out of order. Page 1 is on the front, page 4 is on the back. Page 3 is on sheet 2 front, page 8 is on the back. It is completely scrambled. Single-sided prints in the correct order.',
            ticketExtra: 'IT Note: Collation with duplex requires the driver to pair pages correctly (1-2, 3-4, 5-6, etc.). If the collation setting conflicts with the application or the driver page ordering is set incorrectly, pages get mismatched. Check the driver collation and page order settings.',
            affectedPrinter: 1,
            fixDescription: 'Correct collation order and page pairing in driver duplex settings',
            stateOverrides: { _collationScrambled: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Check the printer duplex settings in Print Management or Printing Preferences.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Duplex issues: hardware unit, paper size limits, margin calibration, binding direction, collation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Open the Printer Panel to inspect the duplex configuration.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the correct fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        no_duplex_unit: [
            { id: 'hint1', text: 'The driver shows duplex as available but it only prints one side. The hardware may be disconnected.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The printer was moved yesterday. Check if the physical duplex unit in the rear is still installed.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The duplex unit was removed during the move. Reinstall it in the rear slot.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: Inspect Rear > Reinstall Duplex Unit. Then send a test duplex page.', cost: 150, penalty: -150 }
        ],
        wrong_paper: [
            { id: 'hint1', text: 'Duplex jams only on Legal paper but single-sided Legal works fine. Size-specific issue.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The duplex path has a maximum paper length. Legal (14 inches) may exceed it.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'This duplex unit does not support Legal. Disable duplex for Legal size or use Letter.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: Duplex Settings > Paper Size Restrictions > Disable Duplex for Legal.', cost: 150, penalty: -150 }
        ],
        margin_offset: [
            { id: 'hint1', text: 'Front side margins are correct, back side is shifted. Registration is off.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Duplex registration aligns front and back print passes. Run calibration.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Access the printer maintenance menu and run duplex registration calibration.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: Maintenance > Duplex Registration > Run Calibration.', cost: 150, penalty: -150 }
        ],
        upside_down: [
            { id: 'hint1', text: 'Back side content is rotated 180 degrees. This is a binding direction issue.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Short Edge binding flips the page differently than Long Edge. Check which is selected.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Change from Flip on Short Edge to Flip on Long Edge for portrait documents.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: Duplex Settings > Binding > Change to Long Edge.', cost: 150, penalty: -150 }
        ],
        collation_scrambled: [
            { id: 'hint1', text: 'Pages are paired incorrectly in duplex. 1-4 instead of 1-2 on the same sheet.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The driver collation and page ordering settings may conflict with the application settings.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Set page order to Front to Back and enable driver-level collation instead of application collation.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Printer Panel: Duplex Settings > Page Order: Front to Back > Collation: Driver Managed.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !PR5Config._flagRestored) { PR5Config._flagRestored = true; var s = PR5Config._scenarios[engine.state._scenarioId]; if (s) PR5Config.hints = PR5Config._scenarioHints[s.id] || PR5Config._defaultHints; }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._noDuplexUnit = false; engine.state._wrongPaperDuplex = false; engine.state._marginOffset = false; engine.state._upsideDown = false; engine.state._collationScrambled = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var ov = PR5Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        PR5Config._flagRestored = true; PR5Config.hints = PR5Config._scenarioHints[PR5Config._scenarios[idx].id] || PR5Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : PR5Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _getPrinterState(engine, idx) {
        var p = JSON.parse(JSON.stringify(PR5Config._printers[idx])); var s = PR5Config._getScenario(engine); if (!s) return p;
        if (s.id === 'no_duplex_unit' && idx === 0) p.status = engine.state._noDuplexUnit ? 'Error - Duplex Unit Missing' : 'Ready';
        if (s.id === 'wrong_paper' && idx === 1) p.status = engine.state._wrongPaperDuplex ? 'Error - Duplex Jam (Legal)' : 'Ready';
        if (s.id === 'margin_offset' && idx === 2) p.status = engine.state._marginOffset ? 'Warning - Registration Error' : 'Ready';
        if (s.id === 'upside_down' && idx === 0) p.status = engine.state._upsideDown ? 'Warning - Binding Mismatch' : 'Ready';
        if (s.id === 'collation_scrambled' && idx === 1) p.status = engine.state._collationScrambled ? 'Error - Collation Fault' : 'Ready';
        return p;
    },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0', 'Loading Windows...'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'print_management', label: 'Print\nManagement', icon: 'PRT', app: 'print_management' },
        { id: 'printer_panel', label: 'Duplex\nSettings', icon: 'DPX', app: 'printer_panel' },
        { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
        { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
        { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
    ] },
    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check duplex settings in Print Management.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Duplex issues: hardware, paper size, margins, binding, collation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Open Duplex Settings to inspect the configuration.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'Duplex printing saves paper but introduces new failure modes. From missing hardware to wrong binding, every scenario has a different root cause.', scenario: 'Each scenario targets a different duplex failure — hardware, paper compatibility, registration, orientation, or collation.', outro: 'Duplex printing restored. Both sides printing correctly with proper alignment and page order.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read ticket and check printer status.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the duplex failure mode.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the duplex fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm duplex works and locate the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'get-printer': function(args, term, engine) { var g = PR5Config._requireScenario(engine); if (g) return g; var o = '\n'; PR5Config._printers.forEach(function(p, i) { var s = PR5Config._getPrinterState(engine, i); o += s.name + ' | ' + s.status + '\n'; }); return o; },
        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(a, t) { t.outputEl.innerHTML = ''; return null; },
        dir: function() { return ' Directory of C:\\Users\\Technician\n  0 File(s)'; },
        systeminfo: function() { return '\nHost Name: HELPDESK01\nOS: Windows 10 Pro'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (['print_management', 'printer_panel'].includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': PR5Config._openTicket(iconDef, engine); break;
            case 'print_management': PR5Config._openPM(iconDef, engine); break;
            case 'printer_panel': PR5Config._openPanel(iconDef, engine); break;
            case 'reset_lab': PR5Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        PR5Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) PR5Config._renderTicket(engine, c); else PR5Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['Karen M. — "HP duplex only prints one side"', 'Jason O. — "Xerox jams on legal duplex"', 'Linda R. — "Brother back side margins are off"', 'Karen M. — "HP back side is upside down"', 'Jason O. — "Xerox duplex pages scrambled"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#e67e22; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        PR5Config._scenarios.forEach(function(s, i) { html += '<button class="pr5-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#e67e22; font-weight:bold;">PR-' + (5000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="pr5Rand" style="padding:10px 28px; background:#e67e22; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.pr5-btn').forEach(function(b) { b.addEventListener('click', function() { PR5Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); PR5Config._renderTicket(engine, container); }); });
        document.getElementById('pr5Rand').addEventListener('click', function() { PR5Config._applyScenario(engine, Math.floor(Math.random() * 5)); PR5Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = PR5Config._getScenario(engine); var pr = PR5Config._printers[sc.affectedPrinter];
        var subs = ['Karen Mitchell — Office Manager', 'Jason Okafor — Accounting', 'Linda Reyes — Executive Assistant', 'Karen Mitchell — Office Manager', 'Jason Okafor — Accounting'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#e67e22; font-weight:bold;">TICKET #PR-' + (5000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">FROM</div><div>' + subs[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">PRINTER</div><div style="color:#e67e22; font-weight:bold;">' + pr.name + ' (' + pr.location + ')</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + PR5Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + PR5Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); padding:12px; border-radius:4px; color:#ffcc80;">' + PR5Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openPM(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'pmContainer';
        c.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Print Management', 'PRT', c);
        var html = '<div style="font-weight:bold; color:#e67e22; margin-bottom:12px;">Printers</div>';
        PR5Config._printers.forEach(function(p, i) { var st = PR5Config._getPrinterState(engine, i); var err = st.status.includes('Error') || st.status.includes('Warning'); html += '<div style="padding:8px; margin-bottom:4px; border:1px solid ' + (err ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;"><span style="font-weight:bold;">' + st.name + '</span> | <span style="color:' + (err ? '#e74c3c' : '#2ecc71') + ';">' + st.status + '</span></div>'; });
        c.innerHTML = html;
    },

    _openPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); PR5Config._renderPanel(engine); return; }
        var c = document.createElement('div'); c.id = 'ppContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Duplex Settings Panel', 'DPX', c);
        PR5Config._renderPanel(engine);
    },

    _renderPanel(engine) {
        var c = document.getElementById('ppContainer'); if (!c) return;
        var sc = PR5Config._getScenario(engine);
        if (!sc) { c.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var pr = PR5Config._printers[sc.affectedPrinter];
        var html = '<div style="font-size:1rem; font-weight:bold; color:#e67e22; margin-bottom:16px;">' + pr.name + ' — Duplex Configuration</div>';

        var comps = [];
        if (sc.id === 'no_duplex_unit') {
            comps.push({ name: 'Duplex Hardware Unit', desc: engine.state._noDuplexUnit ? 'ALERT: Duplex unit is physically disconnected from the rear slot. The unit was likely removed during the printer move and not reinstalled.' : 'Duplex unit is properly seated and functional.', issue: engine.state._noDuplexUnit, fixId: 'reinstall_unit', action: 'Reinstall Duplex Unit' });
            comps.push({ name: 'Driver Duplex Setting', desc: 'Driver shows duplex as "Available". Note: Driver detects capability from model number, not from physical hardware presence.', issue: false });
        } else if (sc.id === 'wrong_paper') {
            comps.push({ name: 'Duplex Paper Size Support', desc: engine.state._wrongPaperDuplex ? 'ALERT: Legal size (8.5x14") exceeds the duplex path maximum length. Supported duplex sizes: Letter, A4, Executive. Legal causes jams in the return path.' : 'Duplex restricted to supported paper sizes. Legal excluded.', issue: engine.state._wrongPaperDuplex, fixId: 'restrict_paper', action: 'Disable Duplex for Legal Size' });
            comps.push({ name: 'Single-Sided Printing', desc: 'Single-sided Legal prints work correctly. Issue is duplex-path-specific.', issue: false });
        } else if (sc.id === 'margin_offset') {
            comps.push({ name: 'Duplex Registration', desc: engine.state._marginOffset ? 'ALERT: Back side content is shifted 12mm to the left relative to front side. Duplex registration calibration has not been run since the last maintenance cycle.' : 'Duplex registration calibrated. Front and back alignment within 0.5mm tolerance.', issue: engine.state._marginOffset, fixId: 'calibrate', action: 'Run Duplex Registration Calibration' });
            comps.push({ name: 'Front Side Alignment', desc: 'Front side margins are correct and properly aligned.', issue: false });
        } else if (sc.id === 'upside_down') {
            comps.push({ name: 'Duplex Binding Direction', desc: engine.state._upsideDown ? 'ALERT: Binding is set to "Flip on Short Edge". For portrait documents, this causes the back side to appear rotated 180 degrees. Should be "Flip on Long Edge" for standard portrait duplex.' : 'Binding set to Long Edge. Back side orientation is correct.', issue: engine.state._upsideDown, fixId: 'fix_binding', action: 'Change to Long Edge Binding' });
            comps.push({ name: 'Front Side Orientation', desc: 'Front side prints in correct portrait orientation.', issue: false });
        } else if (sc.id === 'collation_scrambled') {
            comps.push({ name: 'Collation Settings', desc: engine.state._collationScrambled ? 'ALERT: Page order is set to "Back to Front" and collation is managed by the application instead of the driver. This causes page pairing mismatch in duplex mode (1-4 instead of 1-2 on same sheet).' : 'Page order: Front to Back. Collation: Driver Managed. Pages pair correctly.', issue: engine.state._collationScrambled, fixId: 'fix_collation', action: 'Set Front-to-Back, Driver Collation' });
            comps.push({ name: 'Single-Sided Order', desc: 'Single-sided prints come out in correct page order.', issue: false });
        }

        comps.forEach(function(comp) {
            html += '<div style="margin-bottom:12px; padding:12px; background:' + (comp.issue ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (comp.issue ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;"><div style="font-weight:bold; color:' + (comp.issue ? '#e74c3c' : '#2ecc71') + ';">' + comp.name + '</div><div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">' + comp.desc + '</div>';
            if (comp.action && comp.issue) html += '<button class="pp-fix" data-fix="' + comp.fixId + '" style="padding:6px 16px; background:#e67e22; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">' + comp.action + '</button>';
            html += '</div>';
        });

        if (engine.state._flagRevealed) {
            var labels = { no_duplex_unit: 'Duplex unit reinstalled.', wrong_paper: 'Legal duplex restricted.', margin_offset: 'Registration calibrated.', upside_down: 'Binding corrected to Long Edge.', collation_scrambled: 'Collation and page order corrected.' };
            var flagElId = 'pr5-flag-' + sc.id;
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Fix Confirmed:</div><div>' + labels[sc.id] + '</div><div id="' + flagElId + '" style="margin-top:4px;">Token: loading...</div></div>';
            setTimeout(function() { BoxEngine.requestFlagText(sc.id).then(function(f) { var el = document.getElementById(flagElId); if (el) el.textContent = 'Token: ' + (f || 'Flag unavailable'); }); }, 0);
        }

        c.innerHTML = html;
        c.querySelectorAll('.pp-fix').forEach(function(btn) { btn.addEventListener('click', function() { PR5Config._applyFix(engine, this.getAttribute('data-fix')); }); });
    },

    _applyFix(engine, fixId) {
        var sc = PR5Config._getScenario(engine); if (!sc) return; var fixed = false;
        if (fixId === 'reinstall_unit' && sc.id === 'no_duplex_unit') { engine.state._noDuplexUnit = false; fixed = true; }
        if (fixId === 'restrict_paper' && sc.id === 'wrong_paper') { engine.state._wrongPaperDuplex = false; fixed = true; }
        if (fixId === 'calibrate' && sc.id === 'margin_offset') { engine.state._marginOffset = false; fixed = true; }
        if (fixId === 'fix_binding' && sc.id === 'upside_down') { engine.state._upsideDown = false; fixed = true; }
        if (fixId === 'fix_collation' && sc.id === 'collation_scrambled') { engine.state._collationScrambled = false; fixed = true; }
        if (fixed) { engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); engine.notify('Duplex issue resolved. Check Duplex Settings for the token.', 'success'); PR5Config._renderPanel(engine); }
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#e74c3c; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="pr5RC" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="pr5CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('pr5RC').addEventListener('click', function() { PR5Config._flagRestored = false; PR5Config.hints = PR5Config._defaultHints; engine.reset(); });
        document.getElementById('pr5CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
