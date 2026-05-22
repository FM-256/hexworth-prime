/* ============================================================
   DISPATCH LAB — Box OS3: Application Crash
   CompTIA A+ Core 2 — Application Crash (3.1)
   5 distinct scenarios
   ============================================================ */

var OS3Config = {

    title: 'Application Crash',
    subtitle: 'Has Stopped Working — A+ Core 2 Application Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#3b82f6',
    storageKey: 'hexworth_lab_os3',
    registryId: 'os003-app-crash',
    trackerKey: 'lab_os3',

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

    certObjectives: { certPath: 'A+ Core 2', mappings: [
        { flagId: 'fixed', objective: '3.1', description: 'Troubleshoot common Windows OS problems', skill: 'Application Dependencies, Compatibility, Profiles' }
    ] },

    _scenarioFlags: { missing_vcredist: null, dll_not_found: null, compat_mode: null, corrupt_profile: null, dotnet_conflict: null },

    _scenarios: [
        {
            id: 'missing_vcredist',
            name: 'Missing Visual C++ Redistributable',
            ticketSubject: 'New app crashes immediately on launch with "missing VCRUNTIME140.dll"',
            ticketDetail: 'I downloaded and installed a new application but when I try to open it I get an error: "The program can\'t start because VCRUNTIME140.dll is missing from your computer." I tried reinstalling the application and it still happens.',
            ticketExtra: 'IT Note: VCRUNTIME140.dll is part of the Visual C++ 2015-2022 Redistributable. Many applications require this runtime. It may have been removed during a cleanup or was never installed on this machine. Download and install the VC++ Redistributable from Microsoft.',
            affectedDevice: 0,
            fixDescription: 'Install Visual C++ 2015-2022 Redistributable (x64 and x86)',
            stateOverrides: { _missingVcredist: true }
        },
        {
            id: 'dll_not_found',
            name: 'DLL Not Found Error',
            ticketSubject: 'Program crashes with "MSVCP120.dll not found" error',
            ticketDetail: 'When I try to run our inventory management software, I get: "The program can\'t start because MSVCP120.dll is missing." This is critical business software. It was working last week. IT ran a system cleanup on Friday — could that have removed something?',
            ticketExtra: 'IT Note: MSVCP120.dll is from VC++ 2013 Redistributable. The system cleanup on Friday may have removed older redistributables. Business-critical software often depends on specific older runtimes. Install VC++ 2013 Redistributable. Going forward, mark these as protected from cleanup.',
            affectedDevice: 0,
            fixDescription: 'Install Visual C++ 2013 Redistributable to restore MSVCP120.dll',
            stateOverrides: { _dllNotFound: true }
        },
        {
            id: 'compat_mode',
            name: 'Compatibility Mode Needed',
            ticketSubject: 'Legacy application from 2012 will not run on Windows 10 — "not compatible"',
            ticketDetail: 'We have a legacy application from 2012 that we still need for accessing old project archives. It will not run on Windows 10 — it either crashes immediately or says "This app can\'t run on your PC." The vendor went out of business so there are no updates. We need this to work.',
            ticketExtra: 'IT Note: Legacy 32-bit applications sometimes have Windows version checks that reject Windows 10. Right-click the executable, Properties, Compatibility tab. Try running in Windows 7 or Windows 8 compatibility mode. Also try "Run as Administrator" if it needs elevated permissions for registry/file access.',
            affectedDevice: 0,
            fixDescription: 'Set compatibility mode to Windows 7 and enable Run as Administrator',
            stateOverrides: { _compatMode: true }
        },
        {
            id: 'corrupt_profile',
            name: 'Corrupt User Profile',
            ticketSubject: 'All my apps crash but they work fine when I log in as a different user',
            ticketDetail: 'Every application I try to open crashes within seconds — Chrome, Word, Outlook, everything. But when I logged into the same computer with a different user account, everything works perfectly. My account seems to be broken. I have important desktop files and bookmarks I cannot lose.',
            ticketExtra: 'IT Note: If apps crash only under one profile, the user profile is corrupt. The NTUSER.DAT registry hive or AppData folders may be damaged. Create a new profile and migrate the user data (Desktop, Documents, Favorites, Chrome profile). Do not delete the old profile until data is confirmed migrated.',
            affectedDevice: 0,
            fixDescription: 'Create new user profile and migrate data from corrupt profile',
            stateOverrides: { _corruptProfile: true }
        },
        {
            id: 'dotnet_conflict',
            name: '.NET Framework Version Conflict',
            ticketSubject: 'Business app says ".NET Framework 3.5 required" but I thought we had .NET',
            ticketDetail: 'When I try to run our legacy accounting software, it says ".NET Framework 3.5 is required but is not installed." But I know the computer has .NET because other apps use it. How can .NET be both installed and not installed?',
            ticketExtra: 'IT Note: Windows 10 includes .NET 4.x but .NET 3.5 (which includes 2.0) is an optional Windows Feature that must be enabled separately. Go to Control Panel > Programs > Turn Windows Features On/Off > check ".NET Framework 3.5". Windows will download and install the older framework alongside 4.x.',
            affectedDevice: 0,
            fixDescription: 'Enable .NET Framework 3.5 via Windows Features (Turn Windows Features On/Off)',
            stateOverrides: { _dotnetConflict: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Read the ticket and check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause. Investigate carefully.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the diagnostic panel to inspect and fix components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        missing_vcredist: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Install Visual C++ 2015-2022 Redistributable (x64 and x86)', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        dll_not_found: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Install Visual C++ 2013 Redistributable to restore MSVCP120.dll', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        compat_mode: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Set compatibility mode to Windows 7 and enable Run as Administrator', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        corrupt_profile: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Create new user profile and migrate data from corrupt profile', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        dotnet_conflict: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable .NET Framework 3.5 via Windows Features (Turn Windows Features On/Off)', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !OS3Config._flagRestored) { OS3Config._flagRestored = true; var s = OS3Config._scenarios[engine.state._scenarioId]; if (s) OS3Config.hints = OS3Config._scenarioHints[s.id] || OS3Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._missingVcredist = false; engine.state._dllNotFound = false; engine.state._compatMode = false; engine.state._corruptProfile = false; engine.state._dotnetConflict = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var ov = OS3Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        OS3Config._flagRestored = true; OS3Config.hints = OS3Config._scenarioHints[OS3Config._scenarios[idx].id] || OS3Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : OS3Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'hw_panel', label: 'App\nPanel', icon: 'APP', app: 'hw_panel' },
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
    lore: { intro: 'Application Crash scenarios test your ability to diagnose and resolve real-world A+ Core 2 problems.', scenario: 'Five distinct failure modes, each requiring different tools and approaches.', outro: 'Issue resolved. Solid troubleshooting identified and fixed the root cause.' },
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
            case 'ticket': OS3Config._openTicket(iconDef, engine); break;
            case 'hw_panel': case 'services': case 'disk_mgmt': case 'devmgr': case 'event_viewer': OS3Config._openPanel(iconDef, engine); break;
            case 'reset_lab': OS3Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        OS3Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) OS3Config._renderTicket(engine, c); else OS3Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['User — "New app crashes immediately on launch with "missing VCRUNTIM..."', 'User — "Program crashes with "MSVCP120.dll not found" error"', 'User — "Legacy application from 2012 will not run on Windows 10 — "n..."', 'User — "All my apps crash but they work fine when I log in as a diff..."', 'User — "Business app says ".NET Framework 3.5 required" but I though..."'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3b82f6; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        OS3Config._scenarios.forEach(function(s, i) { html += '<button class="os3-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#3b82f6; font-weight:bold;">OS3-' + (3000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="os3Rand" style="padding:10px 28px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.os3-btn').forEach(function(b) { b.addEventListener('click', function() { OS3Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); OS3Config._renderTicket(engine, container); }); });
        document.getElementById('os3Rand').addEventListener('click', function() { OS3Config._applyScenario(engine, Math.floor(Math.random() * 5)); OS3Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = OS3Config._getScenario(engine);
        var subs = ['User A — Department', 'User B — Department', 'User C — Department', 'User D — Department', 'User E — Department'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#3b82f6; font-weight:bold;">TICKET #OS3-' + (3000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + OS3Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + OS3Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); padding:12px; border-radius:4px; color:#93c5fd;">' + OS3Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); OS3Config._renderPanel(engine); return; }
        var c = document.createElement('div'); c.id = 'hwContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Application Crash — Diagnostics', iconDef.icon, c); OS3Config._renderPanel(engine);
    },

    _renderPanel(engine) {
        var c = document.getElementById('hwContainer'); if (!c) return;
        var sc = OS3Config._getScenario(engine); if (!sc) { c.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var html = '<div style="font-size:1rem; font-weight:bold; color:#3b82f6; margin-bottom:16px;">Application Crash — Diagnostics</div>';

        var stateKey = Object.keys(sc.stateOverrides)[0];
        var isIssue = engine.state[stateKey];
        html += '<div style="margin-bottom:12px; padding:12px; background:' + (isIssue ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isIssue ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;">'
            + '<div style="font-weight:bold; color:' + (isIssue ? '#3b82f6' : '#2ecc71') + ';">' + sc.name + '</div>'
            + '<div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">' + (isIssue ? 'ISSUE DETECTED: ' + OS3Config._escHtml(sc.fixDescription) : 'Issue resolved. System operating normally.') + '</div>';
        if (isIssue) html += '<button id="panelFix" style="padding:6px 16px; background:#3b82f6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Apply Fix</button>';
        html += '</div>';

        html += '<div style="padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; margin-bottom:12px;"><div style="font-weight:bold; color:#2ecc71;">System Summary</div><div style="color:#aaa; font-size:0.75rem;">All other components operating within normal parameters.</div></div>';

        if (engine.state._flagRevealed) {
            var fid = 'os3-flag-' + sc.id;
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
            OS3Config._renderPanel(engine);
        });
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#3b82f6; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="os3RC" style="padding:8px 24px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="os3CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('os3RC').addEventListener('click', function() { OS3Config._flagRestored = false; OS3Config.hints = OS3Config._defaultHints; engine.reset(); });
        document.getElementById('os3CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};