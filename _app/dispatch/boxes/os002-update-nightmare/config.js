/* ============================================================
   DISPATCH LAB — Box OS2: Update Nightmare
   CompTIA A+ Core 2 — Update Nightmare (1.6)
   5 distinct scenarios
   ============================================================ */

var OS2Config = {

    title: 'Update Nightmare',
    subtitle: 'Stuck at 47% — A+ Core 2 Windows Update Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#3b82f6',
    storageKey: 'hexworth_lab_os2',
    registryId: 'os002-update-nightmare',
    trackerKey: 'lab_os2',

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
            /* MD-100 M07: Manage Apps & Windows Updates. Module id and title taken from
               _app/tenant/md-100-map.js, the course map, so this claim matches what the
               course actually teaches. Deliberately NOT the 5.1/4.1 style the two older
               MD-100 boxes use: MD-100 has four exam domains and no in-repo source
               defines that numbering, so reusing it would be inventing a citation. */
            { flagId: 'fixed', objective: 'M07', description: 'Manage Apps & Windows Updates', skill: 'Windows Update troubleshooting, servicing stack, update rollback' },
        { flagId: 'fixed', objective: '1.6', description: 'Configure Windows updates', skill: 'Windows Update Troubleshooting' }
    ] },

    _scenarioFlags: { update_stuck: null, rollback_fail: null, driver_update_broke: null, reboot_loop: null, no_space_update: null },

    _scenarios: [
        {
            id: 'update_stuck',
            name: 'Windows Update Stuck at Percentage',
            ticketSubject: 'Windows Update has been stuck at 47% for 3 hours',
            ticketDetail: 'I started a Windows Update this morning and it has been stuck at 47% for over 3 hours. The progress bar is not moving at all. The computer is not frozen — I can still use it. But the update will not progress or cancel. I need this computer for work.',
            ticketExtra: 'IT Note: Stuck updates often mean the Windows Update service or BITS (Background Intelligent Transfer Service) has stalled. Try stopping the wuauserv and BITS services, clearing the SoftwareDistribution folder, and restarting the services. The update will re-download cleanly.',
            affectedDevice: 0,
            fixDescription: 'Stop wuauserv/BITS, clear SoftwareDistribution folder, restart services',
            stateOverrides: { _updateStuck: true }
        },
        {
            id: 'rollback_fail',
            name: 'Failed Update Will Not Roll Back',
            ticketSubject: 'Update failed but now Windows will not roll back — stuck in a loop',
            ticketDetail: 'A Windows Update failed during installation. Now every time the computer restarts it says "Undoing changes made to your computer" and then restarts again. It has been in this loop for an hour. I cannot get to the desktop at all.',
            ticketExtra: 'IT Note: The automatic rollback is failing. Need to boot into Windows Recovery Environment (WinRE) via the USB recovery drive or by interrupting boot 3 times. From WinRE, use the Uninstall Updates option or System Restore to get back to a working state.',
            affectedDevice: 0,
            fixDescription: 'Boot to WinRE, use Uninstall Latest Quality Update or System Restore',
            stateOverrides: { _rollbackFail: true }
        },
        {
            id: 'driver_update_broke',
            name: 'Driver Update Broke Audio',
            ticketSubject: 'No sound at all after Windows Update — speaker icon shows X',
            ticketDetail: 'After the latest Windows Update, I have no audio at all. The speaker icon in the system tray has a red X. I checked the volume — it is not muted. I tried plugging in headphones and those do not work either. Audio was working perfectly before the update.',
            ticketExtra: 'IT Note: Windows Update occasionally pushes generic audio drivers that replace the manufacturer driver. Check Device Manager for the audio device — it may show a generic "High Definition Audio Device" instead of the Realtek/manufacturer driver. Roll back the audio driver or reinstall the OEM audio driver.',
            affectedDevice: 0,
            fixDescription: 'Roll back audio driver in Device Manager to restore OEM driver',
            stateOverrides: { _driverBrokeAudio: true }
        },
        {
            id: 'reboot_loop',
            name: 'Cumulative Update Reboot Loop',
            ticketSubject: 'Computer keeps restarting after cumulative update — never finishes',
            ticketDetail: 'My computer installed a cumulative update last night. Now it keeps restarting in a loop: "Working on updates 63% — Don\'t turn off your computer" then it restarts, then goes back to 63%, restarts again. This has been going on since this morning.',
            ticketExtra: 'IT Note: Cumulative update is failing at the same point repeatedly. The update package may be corrupt. Boot into Safe Mode (since the update processing does not run in Safe Mode), then use DISM to clean up the component store and run the Windows Update troubleshooter. If that fails, use WUSA to uninstall the specific KB.',
            affectedDevice: 0,
            fixDescription: 'Boot Safe Mode, run DISM component cleanup, remove corrupt update via WUSA',
            stateOverrides: { _rebootLoop: true }
        },
        {
            id: 'no_space_update',
            name: 'Not Enough Disk Space for Update',
            ticketSubject: 'Windows Update says not enough disk space — C: drive is almost full',
            ticketDetail: 'Windows Update keeps failing with "Not enough disk space to install the update." My C: drive only has 2 GB free. I tried deleting some files but the update needs at least 20 GB according to the error. I do not know what else I can delete safely.',
            ticketExtra: 'IT Note: Major feature updates require 20+ GB. Run Disk Cleanup with system file cleanup (Previous Windows installations, Windows Update Cleanup, Delivery Optimization Files). Also check for large files in Downloads, Temp, and user profile. If still insufficient, use an external USB drive as temporary update storage (Windows 10 2004+ supports this).',
            affectedDevice: 0,
            fixDescription: 'Run Disk Cleanup with system files, clear temp/downloads, use USB for update storage',
            stateOverrides: { _noSpaceUpdate: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Read the ticket and check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause. Investigate carefully.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the diagnostic panel to inspect and fix components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        update_stuck: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Stop wuauserv/BITS, clear SoftwareDistribution folder, restart services', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        rollback_fail: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Boot to WinRE, use Uninstall Latest Quality Update or System Restore', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        driver_update_broke: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Roll back audio driver in Device Manager to restore OEM driver', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        reboot_loop: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Boot Safe Mode, run DISM component cleanup, remove corrupt update via WUSA', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        no_space_update: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Run Disk Cleanup with system files, clear temp/downloads, use USB for update storage', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !OS2Config._flagRestored) { OS2Config._flagRestored = true; var s = OS2Config._scenarios[engine.state._scenarioId]; if (s) OS2Config.hints = OS2Config._scenarioHints[s.id] || OS2Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._updateStuck = false; engine.state._rollbackFail = false; engine.state._driverBrokeAudio = false; engine.state._rebootLoop = false; engine.state._noSpaceUpdate = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var ov = OS2Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        OS2Config._flagRestored = true; OS2Config.hints = OS2Config._scenarioHints[OS2Config._scenarios[idx].id] || OS2Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : OS2Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'hw_panel', label: 'Update\nPanel', icon: 'UPD', app: 'hw_panel' },
        { id: 'services', label: 'Services', icon: 'SVC', app: 'services' },
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
    lore: { intro: 'Update Nightmare scenarios test your ability to diagnose and resolve real-world A+ Core 2 problems.', scenario: 'Five distinct failure modes, each requiring different tools and approaches.', outro: 'Issue resolved. Solid troubleshooting identified and fixed the root cause.' },
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
            case 'ticket': OS2Config._openTicket(iconDef, engine); break;
            case 'hw_panel': case 'services': case 'disk_mgmt': case 'devmgr': case 'event_viewer': OS2Config._openPanel(iconDef, engine); break;
            case 'reset_lab': OS2Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        OS2Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) OS2Config._renderTicket(engine, c); else OS2Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['User — "Windows Update has been stuck at 47% for 3 hours"', 'User — "Update failed but now Windows will not roll back — stuck in ..."', 'User — "No sound at all after Windows Update — speaker icon shows X"', 'User — "Computer keeps restarting after cumulative update — never fi..."', 'User — "Windows Update says not enough disk space — C: drive is almo..."'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3b82f6; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        OS2Config._scenarios.forEach(function(s, i) { html += '<button class="os2-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#3b82f6; font-weight:bold;">OS2-' + (2000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="os2Rand" style="padding:10px 28px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.os2-btn').forEach(function(b) { b.addEventListener('click', function() { OS2Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); OS2Config._renderTicket(engine, container); }); });
        document.getElementById('os2Rand').addEventListener('click', function() { OS2Config._applyScenario(engine, Math.floor(Math.random() * 5)); OS2Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = OS2Config._getScenario(engine);
        var subs = ['User A — Department', 'User B — Department', 'User C — Department', 'User D — Department', 'User E — Department'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#3b82f6; font-weight:bold;">TICKET #OS2-' + (2000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + OS2Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + OS2Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); padding:12px; border-radius:4px; color:#93c5fd;">' + OS2Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); OS2Config._renderPanel(engine); return; }
        var c = document.createElement('div'); c.id = 'hwContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Update Nightmare — Diagnostics', iconDef.icon, c); OS2Config._renderPanel(engine);
    },

    _renderPanel(engine) {
        var c = document.getElementById('hwContainer'); if (!c) return;
        var sc = OS2Config._getScenario(engine); if (!sc) { c.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var html = '<div style="font-size:1rem; font-weight:bold; color:#3b82f6; margin-bottom:16px;">Update Nightmare — Diagnostics</div>';

        var stateKey = Object.keys(sc.stateOverrides)[0];
        var isIssue = engine.state[stateKey];
        html += '<div style="margin-bottom:12px; padding:12px; background:' + (isIssue ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isIssue ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;">'
            + '<div style="font-weight:bold; color:' + (isIssue ? '#3b82f6' : '#2ecc71') + ';">' + sc.name + '</div>'
            + '<div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">' + (isIssue ? 'ISSUE DETECTED: ' + OS2Config._escHtml(sc.fixDescription) : 'Issue resolved. System operating normally.') + '</div>';
        if (isIssue) html += '<button id="panelFix" style="padding:6px 16px; background:#3b82f6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Apply Fix</button>';
        html += '</div>';

        html += '<div style="padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; margin-bottom:12px;"><div style="font-weight:bold; color:#2ecc71;">System Summary</div><div style="color:#aaa; font-size:0.75rem;">All other components operating within normal parameters.</div></div>';

        if (engine.state._flagRevealed) {
            var fid = 'os2-flag-' + sc.id;
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
            OS2Config._renderPanel(engine);
        });
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#3b82f6; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="os2RC" style="padding:8px 24px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="os2CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('os2RC').addEventListener('click', function() { OS2Config._flagRestored = false; OS2Config.hints = OS2Config._defaultHints; engine.reset(); });
        document.getElementById('os2CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};