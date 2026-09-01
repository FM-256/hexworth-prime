/* ============================================================
   DISPATCH LAB — Box OS4: Performance Meltdown
   CompTIA A+ Core 2 — Performance Meltdown (3.1)
   5 distinct scenarios
   ============================================================ */

var OS4Config = {

    title: 'Performance Meltdown',
    subtitle: 'Everything Is Slow — A+ Core 2 Performance Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#3b82f6',
    storageKey: 'hexworth_lab_os4',
    registryId: 'os004-performance-meltdown',
    trackerKey: 'lab_os4',

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
            /* MD-100 M09: Support the Windows Client. Module id and title taken from
               _app/tenant/md-100-map.js, the course map, so this claim matches what the
               course actually teaches. Deliberately NOT the 5.1/4.1 style the two older
               MD-100 boxes use: MD-100 has four exam domains and no in-repo source
               defines that numbering, so reusing it would be inventing a citation. */
            { flagId: 'fixed', objective: 'M09', description: 'Support the Windows Client', skill: 'Resource monitoring, runaway process identification, startup impact' },
        { flagId: 'fixed', objective: '3.1', description: 'Troubleshoot common Windows OS problems', skill: 'Task Manager, Startup, Disk I/O, Malware Analysis' }
    ] },

    _scenarioFlags: { disk_100: null, memory_leak: null, startup_overload: null, search_indexing: null, crypto_miner: null },

    _scenarios: [
        {
            id: 'disk_100',
            name: '100% Disk Usage (SysMain)',
            ticketSubject: 'Task Manager shows Disk at 100% constantly — computer is barely usable',
            ticketDetail: 'My computer is incredibly slow. Task Manager shows the disk at 100% usage constantly. I am not running anything heavy — just a browser and Outlook. The hard drive light on the front of the computer is solid, not blinking. Everything takes 30+ seconds to respond.',
            ticketExtra: 'IT Note: 100% disk usage is often caused by the SysMain (formerly Superfetch) service on systems with mechanical HDDs. SysMain preloads frequently used applications into memory, which causes constant disk reads on HDDs. Other causes: Windows Search indexing, Windows Update downloading, or antivirus full scan. Check Task Manager details to identify the process.',
            affectedDevice: 0,
            fixDescription: 'Disable SysMain service on HDD systems or upgrade to SSD',
            stateOverrides: { _disk100: true }
        },
        {
            id: 'memory_leak',
            name: 'Memory Leak in Chrome',
            ticketSubject: 'Computer slows to a crawl after using Chrome for a few hours',
            ticketDetail: 'My computer starts out fine in the morning but after a few hours of using Chrome, everything gets incredibly slow. Task Manager shows Chrome using 8 GB of my 16 GB RAM. I usually have about 40 tabs open. If I close Chrome and reopen it, the computer is fast again for a while.',
            ticketExtra: 'IT Note: Chrome uses a multi-process architecture — each tab gets its own process. 40 tabs can easily consume 8+ GB. Some tabs with JavaScript-heavy sites or extensions leak memory over time. Solutions: reduce tab count, use a tab suspender extension, increase RAM, or set a per-tab memory limit in Chrome flags.',
            affectedDevice: 0,
            fixDescription: 'Install tab suspender extension, close unused tabs, check for leaky extensions',
            stateOverrides: { _memoryLeak: true }
        },
        {
            id: 'startup_overload',
            name: '47 Startup Programs',
            ticketSubject: 'Computer takes 12 minutes to boot and be usable',
            ticketDetail: 'My computer takes about 12 minutes from pressing the power button to being able to actually use it. The desktop appears after about 4 minutes but then the hard drive churns for another 8 minutes. Task Manager shows a ton of programs loading. I need every single one of these programs... I think.',
            ticketExtra: 'IT Note: Task Manager > Startup shows 47 items set to start with Windows. Many are unnecessary — Spotify, Discord, Steam, Adobe Creative Cloud updater, printer utilities, gaming platforms, etc. Disable non-essential startup items. The user does not need all 47 programs loaded at boot. Focus on business-critical items only.',
            affectedDevice: 0,
            fixDescription: 'Disable non-essential startup programs (keep only business-critical items)',
            stateOverrides: { _startupOverload: true }
        },
        {
            id: 'search_indexing',
            name: 'Windows Search Indexing Crushing I/O',
            ticketSubject: 'Disk usage spikes to 100% every afternoon — lasts about an hour',
            ticketDetail: 'Every afternoon around 2 PM, my disk usage spikes to 100% and everything slows down for about an hour. It happens like clockwork. Morning is fine. After the spike passes, performance goes back to normal. I checked Task Manager and something called "SearchIndexer.exe" is using all the disk.',
            ticketExtra: 'IT Note: Windows Search is re-indexing. This can happen if the index is corrupt, if a large number of files were added/modified, or if a scheduled task triggers a full re-index. Solutions: rebuild the index (smaller and faster), reduce indexed locations, or schedule indexing for off-hours. Check Indexing Options in Control Panel.',
            affectedDevice: 0,
            fixDescription: 'Rebuild search index, limit indexed locations, schedule for off-hours',
            stateOverrides: { _searchIndexing: true }
        },
        {
            id: 'crypto_miner',
            name: 'Crypto Miner Malware Consuming CPU',
            ticketSubject: 'CPU usage at 95% when doing nothing — fans spinning at max',
            ticketDetail: 'My computer is insanely slow and the fans are running at maximum speed even when I am not doing anything. Task Manager shows CPU at 95%. There is a process called "svchost_helper.exe" using most of the CPU. I did not install anything — this started a few days after I downloaded a free PDF converter from a random website.',
            ticketExtra: 'IT Note: "svchost_helper.exe" is NOT a legitimate Windows process (legitimate is "svchost.exe"). This is likely a cryptomining malware installed via the PDF converter bundle. It mines cryptocurrency using the CPU. Run a full antivirus scan, check Task Scheduler for persistence, and remove the malware. Also check browser extensions.',
            affectedDevice: 0,
            fixDescription: 'Kill malicious process, run full AV scan, remove from Task Scheduler, clean browser',
            stateOverrides: { _cryptoMiner: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Read the ticket and check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause. Investigate carefully.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the diagnostic panel to inspect and fix components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        disk_100: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Disable SysMain service on HDD systems or upgrade to SSD', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        memory_leak: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Install tab suspender extension, close unused tabs, check for leaky extensions', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        startup_overload: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Disable non-essential startup programs (keep only business-critical items)', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        search_indexing: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Rebuild search index, limit indexed locations, schedule for off-hours', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        crypto_miner: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Kill malicious process, run full AV scan, remove from Task Scheduler, clean browser', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !OS4Config._flagRestored) { OS4Config._flagRestored = true; var s = OS4Config._scenarios[engine.state._scenarioId]; if (s) OS4Config.hints = OS4Config._scenarioHints[s.id] || OS4Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._disk100 = false; engine.state._memoryLeak = false; engine.state._startupOverload = false; engine.state._searchIndexing = false; engine.state._cryptoMiner = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var ov = OS4Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        OS4Config._flagRestored = true; OS4Config.hints = OS4Config._scenarioHints[OS4Config._scenarios[idx].id] || OS4Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : OS4Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'hw_panel', label: 'Task\nManager', icon: 'TM', app: 'hw_panel' },
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
    lore: { intro: 'Performance Meltdown scenarios test your ability to diagnose and resolve real-world A+ Core 2 problems.', scenario: 'Five distinct failure modes, each requiring different tools and approaches.', outro: 'Issue resolved. Solid troubleshooting identified and fixed the root cause.' },
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
            case 'ticket': OS4Config._openTicket(iconDef, engine); break;
            case 'hw_panel': case 'services': case 'disk_mgmt': case 'devmgr': case 'event_viewer': OS4Config._openPanel(iconDef, engine); break;
            case 'reset_lab': OS4Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        OS4Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) OS4Config._renderTicket(engine, c); else OS4Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['User — "Task Manager shows Disk at 100% constantly — computer is bar..."', 'User — "Computer slows to a crawl after using Chrome for a few hours"', 'User — "Computer takes 12 minutes to boot and be usable"', 'User — "Disk usage spikes to 100% every afternoon — lasts about an h..."', 'User — "CPU usage at 95% when doing nothing — fans spinning at max"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3b82f6; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        OS4Config._scenarios.forEach(function(s, i) { html += '<button class="os4-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#3b82f6; font-weight:bold;">OS4-' + (4000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="os4Rand" style="padding:10px 28px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.os4-btn').forEach(function(b) { b.addEventListener('click', function() { OS4Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); OS4Config._renderTicket(engine, container); }); });
        document.getElementById('os4Rand').addEventListener('click', function() { OS4Config._applyScenario(engine, Math.floor(Math.random() * 5)); OS4Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = OS4Config._getScenario(engine);
        var subs = ['User A — Department', 'User B — Department', 'User C — Department', 'User D — Department', 'User E — Department'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#3b82f6; font-weight:bold;">TICKET #OS4-' + (4000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + OS4Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + OS4Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); padding:12px; border-radius:4px; color:#93c5fd;">' + OS4Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); OS4Config._renderPanel(engine); return; }
        var c = document.createElement('div'); c.id = 'hwContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Performance Meltdown — Diagnostics', iconDef.icon, c); OS4Config._renderPanel(engine);
    },

    _renderPanel(engine) {
        var c = document.getElementById('hwContainer'); if (!c) return;
        var sc = OS4Config._getScenario(engine); if (!sc) { c.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var html = '<div style="font-size:1rem; font-weight:bold; color:#3b82f6; margin-bottom:16px;">Performance Meltdown — Diagnostics</div>';

        var stateKey = Object.keys(sc.stateOverrides)[0];
        var isIssue = engine.state[stateKey];
        html += '<div style="margin-bottom:12px; padding:12px; background:' + (isIssue ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isIssue ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;">'
            + '<div style="font-weight:bold; color:' + (isIssue ? '#3b82f6' : '#2ecc71') + ';">' + sc.name + '</div>'
            + '<div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">' + (isIssue ? 'ISSUE DETECTED: ' + OS4Config._escHtml(sc.fixDescription) : 'Issue resolved. System operating normally.') + '</div>';
        if (isIssue) html += '<button id="panelFix" style="padding:6px 16px; background:#3b82f6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Apply Fix</button>';
        html += '</div>';

        html += '<div style="padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; margin-bottom:12px;"><div style="font-weight:bold; color:#2ecc71;">System Summary</div><div style="color:#aaa; font-size:0.75rem;">All other components operating within normal parameters.</div></div>';

        if (engine.state._flagRevealed) {
            var fid = 'os4-flag-' + sc.id;
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
            OS4Config._renderPanel(engine);
        });
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#3b82f6; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="os4RC" style="padding:8px 24px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="os4CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('os4RC').addEventListener('click', function() { OS4Config._flagRestored = false; OS4Config.hints = OS4Config._defaultHints; engine.reset(); });
        document.getElementById('os4CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};