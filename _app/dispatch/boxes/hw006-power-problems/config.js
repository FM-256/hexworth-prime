/* ============================================================
   DISPATCH LAB — Box HW6: Power Problems
   CompTIA A+ Core 1 — Power Problems (5.2)
   5 distinct scenarios
   ============================================================ */

var HW6Config = {

    title: 'Power Problems',
    subtitle: 'No Power — A+ Core 1 Power Troubleshooting',
    difficulty: 'Beginner',
    accent: '#ef4444',
    storageKey: 'hexworth_lab_hw6',
    registryId: 'hw006-power-problems',
    trackerKey: 'lab_hw6',

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
        { flagId: 'fixed', objective: '5.2', description: 'Troubleshoot common hardware problems', skill: 'PSU, Thermal Shutdown, UPS, Power Distribution' }
    ] },

    _scenarioFlags: { psu_switch_off: null, random_shutdown: null, ups_beeping: null, psu_fan_grinding: null, power_strip_tripped: null },

    _scenarios: [
        {
            id: 'psu_switch_off',
            name: 'PC Will Not Power On (PSU Switch Off)',
            ticketSubject: 'Computer is completely dead — no lights, no fans, nothing',
            ticketDetail: 'My computer will not turn on at all. When I press the power button absolutely nothing happens. No lights, no fans, no beeps, nothing. It was working fine when I left yesterday. The monitor has power and shows "No Signal." The power strip light is on.',
            ticketExtra: 'IT Note: Complete absence of any response typically means no power reaching the motherboard. Check the obvious first: is the PSU rocker switch on the back of the computer in the ON (I) position? Cleaning crews sometimes bump this switch. Also check if the power cable is fully seated.',
            affectedDevice: 0,
            fixDescription: 'Flip the PSU rocker switch from OFF (O) to ON (I)',
            stateOverrides: { _psuSwitchOff: true }
        },
        {
            id: 'random_shutdown',
            name: 'Random Shutdowns (Overheating/PSU Failing)',
            ticketSubject: 'Computer shuts off randomly without warning — no blue screen, just OFF',
            ticketDetail: 'My computer has been shutting off randomly without any warning. No blue screen, no error — it just instantly powers off like someone pulled the plug. It happens 2-3 times a day. Sometimes it restarts on its own, sometimes I have to press the power button. It seems to happen more when I am doing heavy work.',
            ticketExtra: 'IT Note: Instant power-off (no BSOD) indicates a hardware-level shutdown — either thermal protection or PSU failure. Check CPU temperature (thermal shutdown at 100-105C). If temps are normal, the PSU may be failing under load. A PSU that cannot deliver stable voltage under load will trigger an emergency shutdown.',
            affectedDevice: 0,
            fixDescription: 'Diagnose whether thermal or PSU: check temps under load, test with known-good PSU',
            stateOverrides: { _randomShutdown: true }
        },
        {
            id: 'ups_beeping',
            name: 'UPS Beeping (Battery Replacement Needed)',
            ticketSubject: 'The UPS under my desk is beeping every 30 seconds — very annoying',
            ticketDetail: 'The UPS (battery backup) under my desk started beeping every 30 seconds. It has been doing this for two days. The computer is still running fine. The UPS display shows something about "Replace Battery" but I am not sure if that is critical. Can you make it stop beeping?',
            ticketExtra: 'IT Note: UPS units beep when the internal battery has degraded to the point where it cannot provide adequate runtime during a power outage. The battery is typically a sealed lead-acid unit with a 3-5 year lifespan. Replace the battery to restore backup capacity and silence the alarm.',
            affectedDevice: 0,
            fixDescription: 'Replace the UPS internal battery with the correct model',
            stateOverrides: { _upsBattery: true }
        },
        {
            id: 'psu_fan_grinding',
            name: 'PSU Fan Grinding (Bearing Failure)',
            ticketSubject: 'Computer makes a horrible grinding/rattling noise from the back',
            ticketDetail: 'My computer started making a terrible grinding and rattling noise. It sounds like it is coming from the back of the computer near the power supply. The noise gets louder and softer in cycles. Sometimes it stops for a few seconds then starts again. The computer still works but this noise is awful and I am worried it will damage something.',
            ticketExtra: 'IT Note: A grinding/rattling noise from the PSU area is typically a fan bearing failure. The PSU fan is critical for cooling — if it fails completely, the PSU will overheat and either shut down or damage internal components. Replace the PSU (do not attempt to replace just the fan — it is a sealed unit with dangerous capacitors).',
            affectedDevice: 0,
            fixDescription: 'Replace the PSU — fan bearing failure means the entire unit needs replacement',
            stateOverrides: { _psuFanGrinding: true }
        },
        {
            id: 'power_strip_tripped',
            name: 'Power Strip Tripped (Overloaded Circuit)',
            ticketSubject: 'Three workstations on the same desk all lost power at the same time',
            ticketDetail: 'Three workstations at the same desk cluster all went dead at the same time. Nobody can turn them on. The monitors are also off. Everything in this area seems to be dead. The rest of the office is fine. We checked the wall outlet and it has power.',
            ticketExtra: 'IT Note: Three workstations + monitors + peripherals on a single power strip or circuit can exceed the amperage rating. The power strip likely has a tripped circuit breaker (small button on the strip). If the strip breaker has not tripped, check the building circuit breaker panel for a tripped 15A or 20A breaker. Redistribute the load across multiple circuits.',
            affectedDevice: 0,
            fixDescription: 'Reset the tripped power strip breaker and redistribute load across circuits',
            stateOverrides: { _powerStripTripped: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Read the ticket and check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause. Investigate carefully.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the diagnostic panel to inspect and fix components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        psu_switch_off: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Flip the PSU rocker switch from OFF (O) to ON (I)', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        random_shutdown: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Diagnose whether thermal or PSU: check temps under load, test with known-good PSU', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        ups_beeping: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Replace the UPS internal battery with the correct model', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        psu_fan_grinding: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Replace the PSU — fan bearing failure means the entire unit needs replacement', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        power_strip_tripped: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Reset the tripped power strip breaker and redistribute load across circuits', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !HW6Config._flagRestored) { HW6Config._flagRestored = true; var s = HW6Config._scenarios[engine.state._scenarioId]; if (s) HW6Config.hints = HW6Config._scenarioHints[s.id] || HW6Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._psuSwitchOff = false; engine.state._randomShutdown = false; engine.state._upsBattery = false; engine.state._psuFanGrinding = false; engine.state._powerStripTripped = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var ov = HW6Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        HW6Config._flagRestored = true; HW6Config.hints = HW6Config._scenarioHints[HW6Config._scenarios[idx].id] || HW6Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : HW6Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'hw_panel', label: 'Power\nPanel', icon: 'PWR', app: 'hw_panel' },
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
    lore: { intro: 'Power Problems scenarios test your ability to diagnose and resolve real-world A+ Core 1 problems.', scenario: 'Five distinct failure modes, each requiring different tools and approaches.', outro: 'Issue resolved. Solid troubleshooting identified and fixed the root cause.' },
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
            case 'ticket': HW6Config._openTicket(iconDef, engine); break;
            case 'hw_panel': case 'services': case 'disk_mgmt': case 'devmgr': case 'event_viewer': HW6Config._openPanel(iconDef, engine); break;
            case 'reset_lab': HW6Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        HW6Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) HW6Config._renderTicket(engine, c); else HW6Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['User — "Computer is completely dead — no lights, no fans, nothing"', 'User — "Computer shuts off randomly without warning — no blue screen..."', 'User — "The UPS under my desk is beeping every 30 seconds — very ann..."', 'User — "Computer makes a horrible grinding/rattling noise from the b..."', 'User — "Three workstations on the same desk all lost power at the sa..."'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#ef4444; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        HW6Config._scenarios.forEach(function(s, i) { html += '<button class="hw6-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#ef4444; font-weight:bold;">HW6-' + (6000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="hw6Rand" style="padding:10px 28px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.hw6-btn').forEach(function(b) { b.addEventListener('click', function() { HW6Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); HW6Config._renderTicket(engine, container); }); });
        document.getElementById('hw6Rand').addEventListener('click', function() { HW6Config._applyScenario(engine, Math.floor(Math.random() * 5)); HW6Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = HW6Config._getScenario(engine);
        var subs = ['User A — Department', 'User B — Department', 'User C — Department', 'User D — Department', 'User E — Department'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#ef4444; font-weight:bold;">TICKET #HW6-' + (6000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + HW6Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + HW6Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); padding:12px; border-radius:4px; color:#fca5a5;">' + HW6Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); HW6Config._renderPanel(engine); return; }
        var c = document.createElement('div'); c.id = 'hwContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Power Problems — Diagnostics', iconDef.icon, c); HW6Config._renderPanel(engine);
    },

    _renderPanel(engine) {
        var c = document.getElementById('hwContainer'); if (!c) return;
        var sc = HW6Config._getScenario(engine); if (!sc) { c.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var html = '<div style="font-size:1rem; font-weight:bold; color:#ef4444; margin-bottom:16px;">Power Problems — Diagnostics</div>';

        var stateKey = Object.keys(sc.stateOverrides)[0];
        var isIssue = engine.state[stateKey];
        html += '<div style="margin-bottom:12px; padding:12px; background:' + (isIssue ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isIssue ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;">'
            + '<div style="font-weight:bold; color:' + (isIssue ? '#ef4444' : '#2ecc71') + ';">' + sc.name + '</div>'
            + '<div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">' + (isIssue ? 'ISSUE DETECTED: ' + HW6Config._escHtml(sc.fixDescription) : 'Issue resolved. System operating normally.') + '</div>';
        if (isIssue) html += '<button id="panelFix" style="padding:6px 16px; background:#ef4444; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Apply Fix</button>';
        html += '</div>';

        html += '<div style="padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; margin-bottom:12px;"><div style="font-weight:bold; color:#2ecc71;">System Summary</div><div style="color:#aaa; font-size:0.75rem;">All other components operating within normal parameters.</div></div>';

        if (engine.state._flagRevealed) {
            var fid = 'hw6-flag-' + sc.id;
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
            HW6Config._renderPanel(engine);
        });
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#ef4444; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="hw6RC" style="padding:8px 24px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="hw6CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('hw6RC').addEventListener('click', function() { HW6Config._flagRestored = false; HW6Config.hints = HW6Config._defaultHints; engine.reset(); });
        document.getElementById('hw6CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};