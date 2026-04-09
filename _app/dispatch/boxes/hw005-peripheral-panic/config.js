/* ============================================================
   DISPATCH LAB — Box HW5: Peripheral Panic
   CompTIA A+ Core 1 — Peripheral Panic (5.2)
   5 distinct scenarios
   ============================================================ */

var HW5Config = {

    title: 'Peripheral Panic',
    subtitle: 'Device Not Recognized — A+ Core 1 Peripheral Troubleshooting',
    difficulty: 'Beginner',
    accent: '#ef4444',
    storageKey: 'hexworth_lab_hw5',
    registryId: 'hw005-peripheral-panic',
    trackerKey: 'lab_hw5',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check diagnostics', tip: 'Open the diagnostic panel to inspect the system.', trigger: { event: 'window_open', match: { type: 'hw_panel' } } },
            { title: 'Investigate the root cause', tip: 'Use Command Prompt and the diagnostic panel to identify the problem.', trigger: { event: 'command', match: { cmd: 'contains:help' }, alt: [{ event: 'window_open', match: { type: 'hw_panel' } }] } },
            { title: 'Apply the fix', tip: 'Each scenario has a different fix. Apply it via the diagnostic panel.', trigger: { event: 'window_open', match: { type: 'hw_panel' } } },
            { title: 'Capture the flag', tip: 'After fixing the issue, locate the token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'A+ Core 1', mappings: [
        { flagId: 'fixed', objective: '5.2', description: 'Troubleshoot common hardware problems', skill: 'USB, Bluetooth, Docking Station, External Drive, Webcam' }
    ] },

    _scenarioFlags: { usb_not_recognized: null, bt_keyboard_lag: null, dock_usbc: null, ext_drive_no_mount: null, webcam_black: null },

    _scenarios: [
        {
            id: 'usb_not_recognized',
            name: 'USB Device Not Recognized',
            ticketSubject: 'USB flash drive shows "USB Device Not Recognized" in every port',
            ticketDetail: 'I plugged in my USB flash drive and Windows shows "USB Device Not Recognized — The last USB device you connected to this computer malfunctioned." I tried every USB port on the computer. The drive works fine on my home computer. Other USB devices work in these ports.',
            ticketExtra: 'IT Note: If the drive works elsewhere and other devices work in these ports, the issue is likely a driver cache problem. Windows caches USB device drivers. A corrupt cache entry can cause recognition failures for specific devices. Try uninstalling the Unknown Device in Device Manager and rescanning.',
            affectedDevice: 0,
            fixDescription: 'Clear USB driver cache: uninstall Unknown Device, delete registry cache, rescan',
            stateOverrides: { _usbNotRecognized: true }
        },
        {
            id: 'bt_keyboard_lag',
            name: 'Bluetooth Keyboard Lag',
            ticketSubject: 'Bluetooth keyboard types with a 2-3 second delay — unusable',
            ticketDetail: 'My Bluetooth keyboard has developed a horrible lag. When I type, the characters appear 2-3 seconds later on screen. The mouse works fine. I replaced the batteries. This started when the new WiFi access point was installed right above my desk. The keyboard is only 2 feet from the computer.',
            ticketExtra: 'IT Note: Bluetooth operates on the 2.4 GHz band, same as WiFi. A new WiFi AP directly above the desk may be causing 2.4 GHz interference. Solutions: change WiFi AP channel, move the AP, switch keyboard to USB receiver, or use 5 GHz WiFi only on that AP.',
            affectedDevice: 0,
            fixDescription: 'Relocate WiFi AP or switch AP to 5 GHz to eliminate 2.4 GHz interference',
            stateOverrides: { _btKeyboardLag: true }
        },
        {
            id: 'dock_usbc',
            name: 'Docking Station USB-C Not Negotiating',
            ticketSubject: 'USB-C dock stopped working — monitors, keyboard, mouse all disconnected',
            ticketDetail: 'My USB-C docking station suddenly stopped working. When I plug in the USB-C cable, the laptop charges but the dock does not connect — no monitors, no keyboard, no mouse through the dock. The dock lights are on. I tried a different USB-C cable. This worked perfectly for 6 months.',
            ticketExtra: 'IT Note: USB-C docking stations require USB-C Alternate Mode and/or Thunderbolt. A firmware update on the dock or laptop may have broken the negotiation. Also check if the USB-C port supports DisplayPort Alt Mode — some USB-C ports are charge-only. Try resetting the dock firmware or using a different USB-C/Thunderbolt port on the laptop.',
            affectedDevice: 0,
            fixDescription: 'Reset dock firmware and ensure USB-C port supports Alt Mode/Thunderbolt',
            stateOverrides: { _dockNotNegotiating: true }
        },
        {
            id: 'ext_drive_no_mount',
            name: 'External Drive Not Mounting',
            ticketSubject: 'Plugged in external hard drive but it does not show up in File Explorer',
            ticketDetail: 'I plugged in my 2TB external hard drive via USB. Windows makes the connection sound but the drive does not appear in File Explorer. I can see it spinning and the light is on. It worked last week. I need files from this drive for a presentation tomorrow.',
            ticketExtra: 'IT Note: If Windows detects the USB connection but the drive does not appear in Explorer, check Disk Management. The drive may be present but without a drive letter assignment. A drive letter conflict (another device/network share using the same letter) prevents Explorer from showing it. Assign a new drive letter.',
            affectedDevice: 0,
            fixDescription: 'Assign a new drive letter in Disk Management to resolve the letter conflict',
            stateOverrides: { _extDriveNoMount: true }
        },
        {
            id: 'webcam_black',
            name: 'Webcam Black Screen',
            ticketSubject: 'Webcam shows black screen in Teams and Zoom — LED light is off',
            ticketDetail: 'My webcam shows a completely black screen in Microsoft Teams and Zoom. The camera LED light does not turn on at all. I have a video call in 30 minutes. I tried restarting the apps. The webcam worked yesterday. I noticed the little plastic slider on top of the camera — could that be related?',
            ticketExtra: 'IT Note: Many modern webcams and laptops have a physical privacy shutter or slider. If closed, the camera produces a black image and the LED stays off. Also check Windows Privacy Settings > Camera to ensure apps have permission. If the shutter is open and privacy is enabled, check Device Manager for driver issues.',
            affectedDevice: 0,
            fixDescription: 'Open physical privacy shutter and verify Windows camera privacy settings',
            stateOverrides: { _webcamBlack: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Read the ticket and check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause. Investigate carefully.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the diagnostic panel to inspect and fix components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        usb_not_recognized: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Clear USB driver cache: uninstall Unknown Device, delete registry cache, rescan', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        bt_keyboard_lag: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Relocate WiFi AP or switch AP to 5 GHz to eliminate 2.4 GHz interference', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        dock_usbc: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Reset dock firmware and ensure USB-C port supports Alt Mode/Thunderbolt', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        ext_drive_no_mount: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Assign a new drive letter in Disk Management to resolve the letter conflict', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        webcam_black: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Open physical privacy shutter and verify Windows camera privacy settings', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !HW5Config._flagRestored) { HW5Config._flagRestored = true; var s = HW5Config._scenarios[engine.state._scenarioId]; if (s) HW5Config.hints = HW5Config._scenarioHints[s.id] || HW5Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._usbNotRecognized = false; engine.state._btKeyboardLag = false; engine.state._dockNotNegotiating = false; engine.state._extDriveNoMount = false; engine.state._webcamBlack = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var ov = HW5Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        HW5Config._flagRestored = true; HW5Config.hints = HW5Config._scenarioHints[HW5Config._scenarios[idx].id] || HW5Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : HW5Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'hw_panel', label: 'Device\nPanel', icon: 'DEV', app: 'hw_panel' },
        { id: 'devmgr', label: 'Device\nManager', icon: 'DM', app: 'devmgr' },
        { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
        { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
        { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
    ] },
    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the panel to inspect and fix.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Flag after fix.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'Peripheral Panic scenarios test your ability to diagnose and resolve real-world A+ Core 1 problems.', scenario: 'Five distinct failure modes, each requiring different tools and approaches.', outro: 'Issue resolved. Solid troubleshooting identified and fixed the root cause.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read ticket and check status.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm and get flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(a, t) { t.outputEl.innerHTML = ''; return null; },
        systeminfo: function() { return '\nHost Name: HELPDESK01\nOS: Windows 10 Pro 10.0.19045\nTotal Physical Memory: 16,384 MB'; },
        dir: function() { return ' Directory of C:\\Users\\Technician\n  0 File(s)'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; },
        help: function() { return '\nAvailable: whoami, hostname, cls, systeminfo, dir\nOpen the diagnostic panel for troubleshooting tools.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (['hw_panel', 'services', 'disk_mgmt', 'devmgr', 'event_viewer'].includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': HW5Config._openTicket(iconDef, engine); break;
            case 'hw_panel': case 'services': case 'disk_mgmt': case 'devmgr': case 'event_viewer': HW5Config._openPanel(iconDef, engine); break;
            case 'reset_lab': HW5Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        HW5Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) HW5Config._renderTicket(engine, c); else HW5Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['User — "USB flash drive shows "USB Device Not Recognized" in every p..."', 'User — "Bluetooth keyboard types with a 2-3 second delay — unusable"', 'User — "USB-C dock stopped working — monitors, keyboard, mouse all d..."', 'User — "Plugged in external hard drive but it does not show up in Fi..."', 'User — "Webcam shows black screen in Teams and Zoom — LED light is o..."'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#ef4444; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        HW5Config._scenarios.forEach(function(s, i) { html += '<button class="hw5-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#ef4444; font-weight:bold;">HW5-' + (5000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="hw5Rand" style="padding:10px 28px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.hw5-btn').forEach(function(b) { b.addEventListener('click', function() { HW5Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); HW5Config._renderTicket(engine, container); }); });
        document.getElementById('hw5Rand').addEventListener('click', function() { HW5Config._applyScenario(engine, Math.floor(Math.random() * 5)); HW5Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = HW5Config._getScenario(engine);
        var subs = ['User A — Department', 'User B — Department', 'User C — Department', 'User D — Department', 'User E — Department'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#ef4444; font-weight:bold;">TICKET #HW5-' + (5000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + HW5Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + HW5Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); padding:12px; border-radius:4px; color:#fca5a5;">' + HW5Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); HW5Config._renderPanel(engine); return; }
        var c = document.createElement('div'); c.id = 'hwContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Peripheral Panic — Diagnostics', iconDef.icon, c); HW5Config._renderPanel(engine);
    },

    _renderPanel(engine) {
        var c = document.getElementById('hwContainer'); if (!c) return;
        var sc = HW5Config._getScenario(engine); if (!sc) { c.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var html = '<div style="font-size:1rem; font-weight:bold; color:#ef4444; margin-bottom:16px;">Peripheral Panic — Diagnostics</div>';

        var stateKey = Object.keys(sc.stateOverrides)[0];
        var isIssue = engine.state[stateKey];
        html += '<div style="margin-bottom:12px; padding:12px; background:' + (isIssue ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isIssue ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;">'
            + '<div style="font-weight:bold; color:' + (isIssue ? '#ef4444' : '#2ecc71') + ';">' + sc.name + '</div>'
            + '<div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">' + (isIssue ? 'ISSUE DETECTED: ' + HW5Config._escHtml(sc.fixDescription) : 'Issue resolved. System operating normally.') + '</div>';
        if (isIssue) html += '<button id="panelFix" style="padding:6px 16px; background:#ef4444; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Apply Fix</button>';
        html += '</div>';

        html += '<div style="padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; margin-bottom:12px;"><div style="font-weight:bold; color:#2ecc71;">System Summary</div><div style="color:#aaa; font-size:0.75rem;">All other components operating within normal parameters.</div></div>';

        if (engine.state._flagRevealed) {
            var fid = 'hw5-flag-' + sc.id;
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Fix Confirmed</div><div id="' + fid + '" style="margin-top:4px;">Token: loading...</div></div>';
            setTimeout(function() { BoxEngine.requestFlagText(sc.id).then(function(f) { var el = document.getElementById(fid); if (el) el.textContent = 'Token: ' + (f || 'N/A'); }); }, 0);
        }
        c.innerHTML = html;
        var fixBtn = document.getElementById('panelFix');
        if (fixBtn) fixBtn.addEventListener('click', function() {
            var stKey = Object.keys(sc.stateOverrides)[0];
            engine.state[stKey] = false;
            engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
            engine.notify('Fix applied successfully. Check the diagnostics panel for the token.', 'success');
            HW5Config._renderPanel(engine);
        });
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#ef4444; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="hw5RC" style="padding:8px 24px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="hw5CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('hw5RC').addEventListener('click', function() { HW5Config._flagRestored = false; HW5Config.hints = HW5Config._defaultHints; engine.reset(); });
        document.getElementById('hw5CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};