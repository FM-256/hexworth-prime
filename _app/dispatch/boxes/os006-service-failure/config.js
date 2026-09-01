/* ============================================================
   DISPATCH LAB — Box OS6: Service Failure
   CompTIA A+ Core 2 — Service Failure (3.1)
   5 distinct scenarios
   ============================================================ */

var OS6Config = {

    title: 'Service Failure',
    subtitle: 'Service Stopped — A+ Core 2 Windows Service Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#3b82f6',
    storageKey: 'hexworth_lab_os6',
    registryId: 'os006-service-failure',
    trackerKey: 'lab_os6',

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

    certObjectives: { certPath: 'A+ Core 2 / MD-100', mappings: [
            /* MD-100 M10: Troubleshoot OS & Apps. Module id and title taken from
               _app/tenant/md-100-map.js, the course map, so this claim matches what the
               course actually teaches. Deliberately NOT the 5.1/4.1 style the two older
               MD-100 boxes use: MD-100 has four exam domains and no in-repo source
               defines that numbering, so reusing it would be inventing a citation. */
            { flagId: 'fixed', objective: 'M10', description: 'Troubleshoot OS & Apps', skill: 'Service state, startup type, and service dependency chains' },
        { flagId: 'fixed', objective: '3.1', description: 'Troubleshoot common Windows OS problems', skill: 'Windows Services, Dependencies, SFC, Safe Mode' }
    ] },

    _scenarioFlags: { audio_stopped: null, dhcp_dependency: null, manual_not_auto: null, sfc_corruption: null, safe_mode_isolate: null },

    _scenarios: [
        {
            id: 'audio_stopped',
            name: 'Windows Audio Service Stopped',
            ticketSubject: 'No sound at all — speaker icon shows running but no audio output',
            ticketDetail: 'I have no sound from my computer. The speaker icon in the system tray looks normal (no X, not muted). Volume is turned up. But no sound comes out of the speakers or headphones. I tried restarting the computer and it made no difference.',
            ticketExtra: 'IT Note: Check if the Windows Audio service (Audiosrv) is running. Go to services.msc. If the service is stopped, start it. If it will not start, check the service dependencies (AudioEndpointBuilder, RPC). A dependency failure prevents the audio service from starting.',
            affectedDevice: 0,
            fixDescription: 'Start Windows Audio service (and check dependency services)',
            stateOverrides: { _audioStopped: true }
        },
        {
            id: 'dhcp_dependency',
            name: 'DHCP Client Service Dependency Failed',
            ticketSubject: 'Computer cannot get an IP address — shows 169.254.x.x',
            ticketDetail: 'My computer shows a 169.254.x.x IP address and cannot connect to the network. Other computers on the same switch work fine. I tried ipconfig /release and /renew but release says "No adapter is in a state permissible for the operation" and renew times out.',
            ticketExtra: 'IT Note: The DHCP Client service depends on several other services including the Network Store Interface Service and the AFD (Ancillary Function Driver). If a dependency service is stopped, DHCP Client cannot start. Check services.msc for the DHCP Client and its dependency chain. A stopped dependency is blocking DHCP.',
            affectedDevice: 0,
            fixDescription: 'Start the stopped dependency service to allow DHCP Client to function',
            stateOverrides: { _dhcpDependency: true }
        },
        {
            id: 'manual_not_auto',
            name: 'Service Set to Manual Instead of Automatic',
            ticketSubject: 'Print Spooler stops every day — I have to restart it manually each morning',
            ticketDetail: 'Every morning when I come in, the Print Spooler service is stopped and I cannot print. I go to Services, find Print Spooler, and click Start. It works until the next day. This has been happening for a week. I should not have to do this every day.',
            ticketExtra: 'IT Note: The Print Spooler service startup type was changed from Automatic to Manual — possibly during a troubleshooting session or by a Group Policy change. When set to Manual, the service does not start at boot unless something requests it. Change it back to Automatic so it starts with Windows.',
            affectedDevice: 0,
            fixDescription: 'Change Print Spooler startup type from Manual to Automatic',
            stateOverrides: { _manualNotAuto: true }
        },
        {
            id: 'sfc_corruption',
            name: 'System File Checker Finds Corruption',
            ticketSubject: 'Random errors and crashes — Event Viewer full of warnings',
            ticketDetail: 'My computer has been unstable for a week. Random application crashes, Explorer restarts, and occasional blue screens. Event Viewer is full of warnings about corrupt system components. I ran sfc /scannow and it said "Windows Resource Protection found corrupt files but was unable to fix some of them."',
            ticketExtra: 'IT Note: SFC found corruption but could not repair it. This means the Windows component store itself is damaged. Run DISM /Online /Cleanup-Image /RestoreHealth first to repair the component store, then re-run SFC. If DISM fails, the Windows installation media may be needed as a repair source.',
            affectedDevice: 0,
            fixDescription: 'Run DISM /RestoreHealth to repair component store, then re-run SFC',
            stateOverrides: { _sfcCorruption: true }
        },
        {
            id: 'safe_mode_isolate',
            name: 'Safe Mode Troubleshooting to Isolate Service',
            ticketSubject: 'Computer freezes within 5 minutes of booting — completely locks up',
            ticketDetail: 'My computer completely freezes within 5 minutes of booting to the desktop. Mouse stops moving, keyboard is unresponsive, only a hard power-off works. But when I boot into Safe Mode, it runs perfectly for hours. Something that loads in normal mode but not Safe Mode is causing the freeze.',
            ticketExtra: 'IT Note: Safe Mode loads only essential drivers and services. The fact that Safe Mode works means a non-essential driver or service is causing the freeze. Use msconfig (System Configuration) to perform a clean boot — disable all non-Microsoft services and startup items, then re-enable them in groups to identify the culprit. This is a binary search isolation technique.',
            affectedDevice: 0,
            fixDescription: 'Clean boot via msconfig, then binary search to isolate the offending service/driver',
            stateOverrides: { _safeModeIsolate: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Read the ticket and check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause. Investigate carefully.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the diagnostic panel to inspect and fix components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        audio_stopped: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Start Windows Audio service (and check dependency services)', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        dhcp_dependency: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Start the stopped dependency service to allow DHCP Client to function', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        manual_not_auto: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Change Print Spooler startup type from Manual to Automatic', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        sfc_corruption: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Run DISM /RestoreHealth to repair component store, then re-run SFC', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        safe_mode_isolate: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Clean boot via msconfig, then binary search to isolate the offending service/driver', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !OS6Config._flagRestored) { OS6Config._flagRestored = true; var s = OS6Config._scenarios[engine.state._scenarioId]; if (s) OS6Config.hints = OS6Config._scenarioHints[s.id] || OS6Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._audioStopped = false; engine.state._dhcpDependency = false; engine.state._manualNotAuto = false; engine.state._sfcCorruption = false; engine.state._safeModeIsolate = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var ov = OS6Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        OS6Config._flagRestored = true; OS6Config.hints = OS6Config._scenarioHints[OS6Config._scenarios[idx].id] || OS6Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : OS6Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'hw_panel', label: 'Services\nPanel', icon: 'SVC', app: 'hw_panel' },
        { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
        { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
        { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
    ] },
    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the panel to inspect and fix.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Flag after fix.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'Service Failure scenarios test your ability to diagnose and resolve real-world A+ Core 2 problems.', scenario: 'Five distinct failure modes, each requiring different tools and approaches.', outro: 'Issue resolved. Solid troubleshooting identified and fixed the root cause.' },
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
            case 'ticket': OS6Config._openTicket(iconDef, engine); break;
            case 'hw_panel': case 'services': case 'disk_mgmt': case 'devmgr': case 'event_viewer': OS6Config._openPanel(iconDef, engine); break;
            case 'reset_lab': OS6Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        OS6Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) OS6Config._renderTicket(engine, c); else OS6Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['User — "No sound at all — speaker icon shows running but no audio ou..."', 'User — "Computer cannot get an IP address — shows 169.254.x.x"', 'User — "Print Spooler stops every day — I have to restart it manuall..."', 'User — "Random errors and crashes — Event Viewer full of warnings"', 'User — "Computer freezes within 5 minutes of booting — completely lo..."'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3b82f6; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        OS6Config._scenarios.forEach(function(s, i) { html += '<button class="os6-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#3b82f6; font-weight:bold;">OS6-' + (6000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="os6Rand" style="padding:10px 28px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.os6-btn').forEach(function(b) { b.addEventListener('click', function() { OS6Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); OS6Config._renderTicket(engine, container); }); });
        document.getElementById('os6Rand').addEventListener('click', function() { OS6Config._applyScenario(engine, Math.floor(Math.random() * 5)); OS6Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = OS6Config._getScenario(engine);
        var subs = ['User A — Department', 'User B — Department', 'User C — Department', 'User D — Department', 'User E — Department'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#3b82f6; font-weight:bold;">TICKET #OS6-' + (6000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + OS6Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + OS6Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); padding:12px; border-radius:4px; color:#93c5fd;">' + OS6Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); OS6Config._renderPanel(engine); return; }
        var c = document.createElement('div'); c.id = 'hwContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Service Failure — Diagnostics', iconDef.icon, c); OS6Config._renderPanel(engine);
    },

    _renderPanel(engine) {
        var c = document.getElementById('hwContainer'); if (!c) return;
        var sc = OS6Config._getScenario(engine); if (!sc) { c.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var html = '<div style="font-size:1rem; font-weight:bold; color:#3b82f6; margin-bottom:16px;">Service Failure — Diagnostics</div>';

        var stateKey = Object.keys(sc.stateOverrides)[0];
        var isIssue = engine.state[stateKey];
        html += '<div style="margin-bottom:12px; padding:12px; background:' + (isIssue ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isIssue ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;">'
            + '<div style="font-weight:bold; color:' + (isIssue ? '#3b82f6' : '#2ecc71') + ';">' + sc.name + '</div>'
            + '<div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">' + (isIssue ? 'ISSUE DETECTED: ' + OS6Config._escHtml(sc.fixDescription) : 'Issue resolved. System operating normally.') + '</div>';
        if (isIssue) html += '<button id="panelFix" style="padding:6px 16px; background:#3b82f6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Apply Fix</button>';
        html += '</div>';

        html += '<div style="padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; margin-bottom:12px;"><div style="font-weight:bold; color:#2ecc71;">System Summary</div><div style="color:#aaa; font-size:0.75rem;">All other components operating within normal parameters.</div></div>';

        if (engine.state._flagRevealed) {
            var fid = 'os6-flag-' + sc.id;
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
            OS6Config._renderPanel(engine);
        });
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#3b82f6; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="os6RC" style="padding:8px 24px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="os6CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('os6RC').addEventListener('click', function() { OS6Config._flagRestored = false; OS6Config.hints = OS6Config._defaultHints; engine.reset(); });
        document.getElementById('os6CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};