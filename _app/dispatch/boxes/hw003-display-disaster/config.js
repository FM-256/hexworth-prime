/* ============================================================
   DISPATCH LAB — Box HW3: Display Disaster
   CompTIA A+ Core 1 — Display Troubleshooting
   5 scenarios: wrong input source, resolution too high,
   multi-monitor not detected, DP vs HDMI, GPU driver artifacts
   ============================================================ */

var HW3Config = {

    title: 'Display Disaster',
    subtitle: 'No Signal — A+ Core 1 Display Troubleshooting',
    difficulty: 'Beginner',
    accent: '#ef4444',
    storageKey: 'hexworth_lab_hw3',
    registryId: 'hw003-display-disaster',
    trackerKey: 'lab_hw3',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the display complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check Display Settings', tip: 'Open the Display Panel to check resolution, input source, and connected monitors.', trigger: { event: 'window_open', match: { type: 'hw_panel' } } },
            { title: 'Diagnose the display issue', tip: 'Check cable connections, input source selection, resolution settings, and GPU driver status.', trigger: { event: 'command', match: { cmd: 'contains:display' }, alt: [{ event: 'window_open', match: { type: 'hw_panel' } }] } },
            { title: 'Apply the fix', tip: 'Switch input source, lower resolution, reconnect cable, or reinstall GPU driver.', trigger: { event: 'window_open', match: { type: 'hw_panel' } } },
            { title: 'Capture the flag', tip: 'After fixing the display, locate the diagnostic token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'A+ Core 1', mappings: [
        { flagId: 'fixed', objective: '5.4', description: 'Troubleshoot video, projector, and display issues', skill: 'Display Input, Resolution, Multi-Monitor' },
        { flagId: 'fixed', objective: '5.2', description: 'Troubleshoot common hardware problems', skill: 'Cable and Adapter Diagnosis' }
    ] },

    _scenarioFlags: { wrong_input: null, res_too_high: null, multi_not_detected: null, dp_hdmi_confusion: null, gpu_artifacts: null },

    _scenarios: [
        {
            id: 'wrong_input',
            name: 'No Display Output (Wrong Input Source)',
            ticketSubject: 'Monitor says "No Signal" but the computer is running — lights and fans are on',
            ticketDetail: 'My monitor shows "No Signal" and goes to sleep. The computer is clearly running — the power light is on, fans are spinning, I can hear the Windows startup sound. I have unplugged and replugged the cable. Nothing on the screen. This started after the cleaning crew was here last night — they may have bumped something.',
            ticketExtra: 'IT Note: This monitor has multiple input sources (HDMI, DisplayPort, VGA). The cleaning crew may have accidentally pressed the Input/Source button on the monitor, switching it to a different input than what the cable is connected to. The computer is outputting video — the monitor is not looking at the right port.',
            affectedDevice: 0,
            fixDescription: 'Switch monitor input source to match the connected cable (DisplayPort)',
            stateOverrides: { _wrongInput: true }
        },
        {
            id: 'res_too_high',
            name: 'Resolution Too High for Monitor',
            ticketSubject: 'Monitor shows "Out of Range" after I changed display settings',
            ticketDetail: 'I was trying to make my display sharper so I changed the resolution to the highest option in Display Settings. Now the monitor shows "Out of Range" or "Input Not Supported" and I cannot see anything to change it back. I tried restarting but it just shows the same message after Windows loads.',
            ticketExtra: 'IT Note: The user set the resolution to 3840x2160 (4K) but the monitor is a 1920x1080 (1080p) panel that cannot display above its native resolution. The monitor rejects the signal. Boot into Safe Mode (low resolution) or use the blind keyboard shortcut to reset resolution.',
            affectedDevice: 0,
            fixDescription: 'Boot into Safe Mode and reset resolution to 1920x1080',
            stateOverrides: { _resTooHigh: true }
        },
        {
            id: 'multi_not_detected',
            name: 'Multi-Monitor Not Detected',
            ticketSubject: 'Second monitor not detected — just bought a new monitor and plugged it in',
            ticketDetail: 'I just got a new second monitor for my desk. I plugged it into the computer with an HDMI cable but Windows only shows one display in Settings. The new monitor works — if I unplug the first one and plug in only the second one, it displays fine. But Windows will not detect both at the same time.',
            ticketExtra: 'IT Note: The workstation has an Intel integrated GPU with one HDMI and one DisplayPort output. Both monitors are connected via HDMI — the user is using an HDMI splitter thinking it extends the display. An HDMI splitter mirrors, it does not extend. The second monitor needs a DisplayPort cable or an active HDMI-to-DP adapter.',
            affectedDevice: 0,
            fixDescription: 'Replace HDMI splitter with direct DisplayPort connection for second monitor',
            stateOverrides: { _multiNotDetected: true }
        },
        {
            id: 'dp_hdmi_confusion',
            name: 'DisplayPort vs HDMI Confusion',
            ticketSubject: 'New monitor has no picture — cable does not seem to fit right',
            ticketDetail: 'I got a new monitor and it came with a cable that looks like HDMI but slightly different. I forced it into the HDMI port on my computer and now there is no picture on either monitor (the old one went blank too). There might be a slight wiggle in the connection. Is the cable defective?',
            ticketExtra: 'IT Note: The cable is DisplayPort, not HDMI. The connectors look similar but are not interchangeable. Forcing a DP connector into an HDMI port can cause damage or a loose connection. The user needs to connect the DP cable to the DP port on the GPU, not the HDMI port. The old monitor may have been disrupted by the forced connection.',
            affectedDevice: 0,
            fixDescription: 'Connect DisplayPort cable to the correct DisplayPort output',
            stateOverrides: { _dpHdmiConfusion: true }
        },
        {
            id: 'gpu_artifacts',
            name: 'GPU Driver Crash Causing Artifacts',
            ticketSubject: 'Screen covered in colored squares and lines — looks like the Matrix',
            ticketDetail: 'My screen is covered in random colored squares, lines, and flickering artifacts. Sometimes the whole screen goes green or pink for a second. The mouse cursor leaves trails of colored garbage wherever I move it. This started about an hour ago in the middle of working. The computer did not crash but the display is almost unusable.',
            ticketExtra: 'IT Note: Visual artifacts (squares, lines, color corruption) with a functioning system usually indicate a GPU driver crash or GPU hardware failure. Check Device Manager for display adapter errors. If the driver crashed, reinstalling/updating may fix it. If hardware, GPU replacement is needed. Event Viewer will show "Display driver stopped responding and has recovered" if driver-related.',
            affectedDevice: 0,
            fixDescription: 'Reinstall GPU driver (clean install) to resolve driver crash artifacts',
            stateOverrides: { _gpuArtifacts: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Check the Display Panel for monitor status, input sources, and resolution.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Display issues: input source, resolution, cables, adapters, GPU drivers.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Inspect physical connections and monitor OSD (on-screen display) settings.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Flag appears after fixing the display issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        wrong_input: [
            { id: 'hint1', text: 'Computer is running (sounds, lights). Monitor says No Signal. The issue is between the cable and what the monitor expects.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Monitors with multiple inputs need to be set to the correct source. Someone may have changed it.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The cable is DisplayPort but the monitor input is set to HDMI. Switch it to DisplayPort.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Display Panel: Monitor OSD > Input Source > Select DisplayPort.', cost: 150, penalty: -150 }
        ],
        res_too_high: [
            { id: 'hint1', text: '"Out of Range" means the GPU is sending a signal the monitor cannot display.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The resolution is set to 4K but the monitor is 1080p. Need to reset to 1920x1080.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Boot into Safe Mode (F8 or Shift+Restart) which uses a low resolution, then change it back.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Display Panel: Safe Mode Boot > Reset Resolution to 1920x1080.', cost: 150, penalty: -150 }
        ],
        multi_not_detected: [
            { id: 'hint1', text: 'One monitor works alone but Windows does not see both simultaneously.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Both are connected via HDMI using a splitter. Splitters mirror, they do not extend.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use DisplayPort for the second monitor. The GPU has one HDMI and one DP output.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Display Panel: Remove Splitter > Connect Monitor 2 to DisplayPort.', cost: 150, penalty: -150 }
        ],
        dp_hdmi_confusion: [
            { id: 'hint1', text: 'The user forced a cable into a port where it does not fit. They confused DP and HDMI.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'DisplayPort and HDMI connectors look similar but are different. Check which port the cable is in.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Move the DP cable from the HDMI port to the DP port. Check for pin damage.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Display Panel: Reconnect > Move DP Cable to DisplayPort Output.', cost: 150, penalty: -150 }
        ],
        gpu_artifacts: [
            { id: 'hint1', text: 'Colored squares and flickering suggest GPU driver crash or hardware failure.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check Event Viewer for "display driver stopped responding" — that confirms a driver crash.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Reinstall the GPU driver with a clean install. If artifacts persist, GPU hardware is failing.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Display Panel: GPU Driver > Clean Reinstall Driver.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !HW3Config._flagRestored) { HW3Config._flagRestored = true; var s = HW3Config._scenarios[engine.state._scenarioId]; if (s) HW3Config.hints = HW3Config._scenarioHints[s.id] || HW3Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._wrongInput = false; engine.state._resTooHigh = false; engine.state._multiNotDetected = false; engine.state._dpHdmiConfusion = false; engine.state._gpuArtifacts = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var ov = HW3Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        HW3Config._flagRestored = true; HW3Config.hints = HW3Config._scenarioHints[HW3Config._scenarios[idx].id] || HW3Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : HW3Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'hw_panel', label: 'Display\nPanel', icon: 'DSP', app: 'hw_panel' },
        { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' },
        { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
        { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
        { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
    ] },
    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [ { id: 'hint1', text: 'Check the Display Panel.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Input source, resolution, cables, drivers.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Inspect connections and monitor settings.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Flag after fixing display.', cost: 50, penalty: -50 } ],
    lore: { intro: 'Display problems range from simple input mismatches to driver crashes. Each scenario has a different cause requiring different troubleshooting.', scenario: 'Five display failure modes — input source, resolution, multi-monitor, cable confusion, and GPU artifacts.', outro: 'Display restored. The visual output is back to normal.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read ticket and check display status.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the display failure.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the display fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm display works.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'get-display': function(args, term, engine) { var g = HW3Config._requireScenario(engine); if (g) return g; var sc = HW3Config._getScenario(engine); return '\nDisplay Adapter: Intel UHD 750\nMonitor 1: Dell P2419H (1920x1080)\nInput: DisplayPort\nStatus: ' + (engine.state._wrongInput ? 'No Signal (wrong input)' : engine.state._resTooHigh ? 'Out of Range (4K on 1080p)' : engine.state._gpuArtifacts ? 'Artifacts (driver crash)' : 'Active'); },
        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(a, t) { t.outputEl.innerHTML = ''; return null; },
        systeminfo: function() { return '\nHost Name: HELPDESK01\nOS: Windows 10 Pro\nGPU: Intel UHD 750'; },
        dir: function() { return ' Directory of C:\\Users\\Technician\n  0 File(s)'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (['hw_panel', 'event_viewer'].includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': HW3Config._openTicket(iconDef, engine); break;
            case 'hw_panel': HW3Config._openPanel(iconDef, engine); break;
            case 'event_viewer': HW3Config._openEV(iconDef, engine); break;
            case 'reset_lab': HW3Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        HW3Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) HW3Config._renderTicket(engine, c); else HW3Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['Front Desk — "Monitor says No Signal"', 'Accounting — "Screen says Out of Range"', 'Marketing — "Second monitor not detected"', 'New Hire — "Cable does not fit right"', 'Design — "Screen covered in colored squares"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#ef4444; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        HW3Config._scenarios.forEach(function(s, i) { html += '<button class="hw3-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#ef4444; font-weight:bold;">HW-' + (3000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="hw3Rand" style="padding:10px 28px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.hw3-btn').forEach(function(b) { b.addEventListener('click', function() { HW3Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); HW3Config._renderTicket(engine, container); }); });
        document.getElementById('hw3Rand').addEventListener('click', function() { HW3Config._applyScenario(engine, Math.floor(Math.random() * 5)); HW3Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = HW3Config._getScenario(engine);
        var subs = ['Karen M. — Front Desk', 'Dave P. — Accounting', 'Emily R. — Marketing', 'Jordan T. — New Hire', 'Amy W. — Design'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#ef4444; font-weight:bold;">TICKET #HW-' + (3000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">FROM</div><div>' + subs[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + HW3Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + HW3Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); padding:12px; border-radius:4px; color:#fca5a5;">' + HW3Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); HW3Config._renderPanel(engine); return; }
        var c = document.createElement('div'); c.id = 'hwContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Display Panel', 'DSP', c); HW3Config._renderPanel(engine);
    },

    _renderPanel(engine) {
        var c = document.getElementById('hwContainer'); if (!c) return;
        var sc = HW3Config._getScenario(engine); if (!sc) { c.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var html = '<div style="font-size:1rem; font-weight:bold; color:#ef4444; margin-bottom:16px;">Display Diagnostics</div>';
        var comps = [];
        if (sc.id === 'wrong_input') comps.push({ name: 'Monitor Input Source', desc: engine.state._wrongInput ? 'ALERT: Monitor input is set to HDMI but the cable is DisplayPort. The cleaning crew may have pressed the Input button on the monitor.' : 'Input source set to DisplayPort. Signal detected.', issue: engine.state._wrongInput, fixId: 'switch_input', action: 'Switch to DisplayPort Input' });
        else if (sc.id === 'res_too_high') comps.push({ name: 'Display Resolution', desc: engine.state._resTooHigh ? 'ALERT: Resolution set to 3840x2160 (4K) but monitor is 1920x1080 (FHD). Monitor rejects the signal as "Out of Range". Boot to Safe Mode to reset.' : 'Resolution reset to 1920x1080. Display showing correctly.', issue: engine.state._resTooHigh, fixId: 'reset_res', action: 'Boot Safe Mode & Reset to 1080p' });
        else if (sc.id === 'multi_not_detected') comps.push({ name: 'Multi-Monitor Setup', desc: engine.state._multiNotDetected ? 'ALERT: Both monitors connected via HDMI splitter. Splitter only mirrors — does not extend. GPU has 1 HDMI + 1 DisplayPort. Second monitor needs DP connection.' : 'Monitor 2 connected via DisplayPort. Extended desktop active.', issue: engine.state._multiNotDetected, fixId: 'fix_multi', action: 'Remove Splitter, Connect via DisplayPort' });
        else if (sc.id === 'dp_hdmi_confusion') comps.push({ name: 'Cable Connection', desc: engine.state._dpHdmiConfusion ? 'ALERT: DisplayPort cable is forced into HDMI port. Wrong port! DP connector has a notched corner, HDMI is symmetric. Move DP cable to the DP port on the GPU.' : 'DisplayPort cable in correct DP port. Both monitors active.', issue: engine.state._dpHdmiConfusion, fixId: 'fix_cable', action: 'Move DP Cable to Correct Port' });
        else if (sc.id === 'gpu_artifacts') comps.push({ name: 'GPU Driver Status', desc: engine.state._gpuArtifacts ? 'ALERT: Display driver crashed and partially recovered. Event Viewer: "Display driver igfx stopped responding and has recovered." Visual artifacts visible. Clean reinstall needed.' : 'GPU driver reinstalled (clean). No artifacts. Display stable.', issue: engine.state._gpuArtifacts, fixId: 'reinstall_gpu', action: 'Clean Reinstall GPU Driver' });

        comps.push({ name: 'GPU Hardware', desc: 'Intel UHD Graphics 750 — No hardware errors detected in PCIe diagnostics.', issue: false });

        comps.forEach(function(comp) {
            html += '<div style="margin-bottom:12px; padding:12px; background:' + (comp.issue ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (comp.issue ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;"><div style="font-weight:bold; color:' + (comp.issue ? '#ef4444' : '#2ecc71') + ';">' + comp.name + '</div><div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">' + comp.desc + '</div>';
            if (comp.action && comp.issue) html += '<button class="hw-fix" data-fix="' + comp.fixId + '" style="padding:6px 16px; background:#ef4444; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">' + comp.action + '</button>';
            html += '</div>';
        });
        if (engine.state._flagRevealed) { var labels = { wrong_input: 'Input source corrected.', res_too_high: 'Resolution reset to 1080p.', multi_not_detected: 'Second monitor on DisplayPort.', dp_hdmi_confusion: 'DP cable in correct port.', gpu_artifacts: 'GPU driver clean reinstalled.' }; var fid = 'hw3-flag-' + sc.id; html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Fix Confirmed:</div><div>' + labels[sc.id] + '</div><div id="' + fid + '" style="margin-top:4px;">Token: loading...</div></div>'; setTimeout(function() { BoxEngine.requestFlagText(sc.id).then(function(f) { var el = document.getElementById(fid); if (el) el.textContent = 'Token: ' + (f || 'N/A'); }); }, 0); }
        c.innerHTML = html;
        c.querySelectorAll('.hw-fix').forEach(function(b) { b.addEventListener('click', function() { HW3Config._applyFix(engine, this.getAttribute('data-fix')); }); });
    },

    _applyFix(engine, fixId) {
        var sc = HW3Config._getScenario(engine); if (!sc) return; var fixed = false;
        if (fixId === 'switch_input') { engine.state._wrongInput = false; fixed = true; }
        if (fixId === 'reset_res') { engine.state._resTooHigh = false; fixed = true; }
        if (fixId === 'fix_multi') { engine.state._multiNotDetected = false; fixed = true; }
        if (fixId === 'fix_cable') { engine.state._dpHdmiConfusion = false; fixed = true; }
        if (fixId === 'reinstall_gpu') { engine.state._gpuArtifacts = false; fixed = true; }
        if (fixed) { engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); engine.notify('Display fixed. Check the Display Panel for the token.', 'success'); HW3Config._renderPanel(engine); }
    },

    _openEV(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Event Viewer', 'EVT', c);
        var sc = HW3Config._getScenario(engine);
        c.innerHTML = '<div style="font-weight:bold; color:#ef4444; margin-bottom:16px;">Event Viewer — Display Events</div>' + (sc && sc.id === 'gpu_artifacts' ? '<div style="padding:12px; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.25); border-radius:4px;"><div style="color:#ef4444; font-weight:bold;">Display driver igfx stopped responding and has recovered.</div><div style="color:#888; font-size:0.7rem;">Source: Display | Level: Warning</div></div>' : '<div style="color:#888;">No critical display events in the last 24 hours.</div>');
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#ef4444; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="hw3RC" style="padding:8px 24px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="hw3CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('hw3RC').addEventListener('click', function() { HW3Config._flagRestored = false; HW3Config.hints = HW3Config._defaultHints; engine.reset(); });
        document.getElementById('hw3CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
