/* ============================================================
   DISPATCH LAB — Box HW4: Storage Failure
   CompTIA A+ Core 1 — Storage Failure (5.3)
   5 distinct scenarios
   ============================================================ */

var HW4Config = {

    title: 'Storage Failure',
    subtitle: 'Data at Risk — A+ Core 1 Storage Troubleshooting',
    difficulty: 'Beginner',
    accent: '#ef4444',
    storageKey: 'hexworth_lab_hw4',
    registryId: 'hw004-storage-failure',
    trackerKey: 'lab_hw4',

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
        { flagId: 'fixed', objective: '5.3', description: 'Troubleshoot storage devices', skill: 'SMART, RAID, Partition Recovery' }
    ] },

    _scenarioFlags: { smart_warning: null, drive_full: null, raid_degraded: null, ssd_firmware: null, partition_corrupt: null },

    _scenarios: [
        {
            id: 'smart_warning',
            name: 'SMART Warning on HDD',
            ticketSubject: 'Computer showing disk health warning — scared of losing files',
            ticketDetail: 'My computer popped up a warning that says my hard drive health is degraded and I should back up immediately. Everything still works but it feels slower than usual. I have 3 years of project files on this computer. Please help before I lose everything.',
            ticketExtra: 'IT Note: SMART monitoring detected reallocated sectors exceeding threshold on the mechanical HDD. This is a pre-failure warning. Data recovery priority, then drive replacement. The HDD has 28,000 hours of power-on time.',
            affectedDevice: 0,
            fixDescription: 'Back up data immediately and replace HDD with SSD',
            stateOverrides: { _smartWarning: true }
        },
        {
            id: 'drive_full',
            name: 'C: Drive 99% Full',
            ticketSubject: 'Computer is crawling — every app takes forever to open',
            ticketDetail: 'My computer has become incredibly slow over the past week. Programs take minutes to open. I get "Low Disk Space" warnings constantly. I tried deleting some files but it did not help much. I cannot install updates either because there is not enough space.',
            ticketExtra: 'IT Note: C: drive usage is at 99% (only 812 MB free of 256 GB). Windows needs at least 10-15 GB free for swap, updates, and temp files. Disk Cleanup, removing temp files, and potentially moving user data to a secondary drive are needed.',
            affectedDevice: 0,
            fixDescription: 'Run Disk Cleanup, clear temp files, move user data to free space',
            stateOverrides: { _driveFull: true }
        },
        {
            id: 'raid_degraded',
            name: 'RAID 5 Degraded (One Disk Failed)',
            ticketSubject: 'File server is running but showing amber warning light on front panel',
            ticketDetail: 'The file server in the server room has an amber warning light on the front panel that was not there yesterday. Everything seems to still be working but I noticed file copies are slower than usual. The system beeps once every 30 seconds.',
            ticketExtra: 'IT Note: The server runs RAID 5 with 4 drives. RAID controller reports array is DEGRADED — one drive has failed. RAID 5 can survive one drive failure but has no redundancy until replaced. Performance is degraded due to parity reconstruction. Replace the failed drive ASAP — a second failure means total data loss.',
            affectedDevice: 0,
            fixDescription: 'Hot-swap the failed drive with a replacement and initiate RAID rebuild',
            stateOverrides: { _raidDegraded: true }
        },
        {
            id: 'ssd_firmware',
            name: 'SSD Firmware Needs Update',
            ticketSubject: 'NVMe drive randomly disappears from BIOS — comes back after cold boot',
            ticketDetail: 'My NVMe drive randomly disappears. Sometimes when I boot up the BIOS does not see the drive at all and I get "No bootable device." If I do a full shutdown, wait 30 seconds, and boot again it usually comes back. This has happened 4 times this week. Very concerning.',
            ticketExtra: 'IT Note: This NVMe model (WD SN750) has a known firmware bug (version 111130WD) that causes intermittent detection failures. WD released firmware 111170WD that fixes the enumeration issue. The drive needs a firmware update via the WD Dashboard tool.',
            affectedDevice: 0,
            fixDescription: 'Update SSD firmware from 111130WD to 111170WD via WD Dashboard',
            stateOverrides: { _ssdFirmware: true }
        },
        {
            id: 'partition_corrupt',
            name: 'Partition Table Corrupt',
            ticketSubject: 'Second hard drive shows as Unallocated in Disk Management — had all my data',
            ticketDetail: 'My second hard drive that had all my project files is showing as "Unallocated" in Disk Management. Yesterday it was working fine. I did not format it or do anything to it. 500 GB of project files are on that drive. Is the data gone?',
            ticketExtra: 'IT Note: The partition table (MBR/GPT) may be corrupt but the data is likely still on the platters. Tools like TestDisk can scan for and recover lost partitions. Do NOT write anything to the drive. If TestDisk finds the partition, it can restore the table without data loss.',
            affectedDevice: 0,
            fixDescription: 'Use TestDisk to scan and recover the corrupt partition table',
            stateOverrides: { _partitionCorrupt: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Read the ticket and check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause. Investigate carefully.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the diagnostic panel to inspect and fix components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        smart_warning: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Back up data immediately and replace HDD with SSD', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        drive_full: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Run Disk Cleanup, clear temp files, move user data to free space', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        raid_degraded: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Hot-swap the failed drive with a replacement and initiate RAID rebuild', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        ssd_firmware: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Update SSD firmware from 111130WD to 111170WD via WD Dashboard', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        partition_corrupt: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use TestDisk to scan and recover the corrupt partition table', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !HW4Config._flagRestored) { HW4Config._flagRestored = true; var s = HW4Config._scenarios[engine.state._scenarioId]; if (s) HW4Config.hints = HW4Config._scenarioHints[s.id] || HW4Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._smartWarning = false; engine.state._driveFull = false; engine.state._raidDegraded = false; engine.state._ssdFirmware = false; engine.state._partitionCorrupt = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var ov = HW4Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        HW4Config._flagRestored = true; HW4Config.hints = HW4Config._scenarioHints[HW4Config._scenarios[idx].id] || HW4Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : HW4Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'hw_panel', label: 'Storage\nPanel', icon: 'DSK', app: 'hw_panel' },
        { id: 'disk_mgmt', label: 'Disk\nManagement', icon: 'DM', app: 'disk_mgmt' },
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
    lore: { intro: 'Storage Failure scenarios test your ability to diagnose and resolve real-world A+ Core 1 problems.', scenario: 'Five distinct failure modes, each requiring different tools and approaches.', outro: 'Issue resolved. Solid troubleshooting identified and fixed the root cause.' },
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
            case 'ticket': HW4Config._openTicket(iconDef, engine); break;
            case 'hw_panel': case 'services': case 'disk_mgmt': case 'devmgr': case 'event_viewer': HW4Config._openPanel(iconDef, engine); break;
            case 'reset_lab': HW4Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        HW4Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) HW4Config._renderTicket(engine, c); else HW4Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['User — "Computer showing disk health warning — scared of losing file..."', 'User — "Computer is crawling — every app takes forever to open"', 'User — "File server is running but showing amber warning light on fr..."', 'User — "NVMe drive randomly disappears from BIOS — comes back after ..."', 'User — "Second hard drive shows as Unallocated in Disk Management — ..."'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#ef4444; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        HW4Config._scenarios.forEach(function(s, i) { html += '<button class="hw4-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#ef4444; font-weight:bold;">HW4-' + (4000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="hw4Rand" style="padding:10px 28px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.hw4-btn').forEach(function(b) { b.addEventListener('click', function() { HW4Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); HW4Config._renderTicket(engine, container); }); });
        document.getElementById('hw4Rand').addEventListener('click', function() { HW4Config._applyScenario(engine, Math.floor(Math.random() * 5)); HW4Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = HW4Config._getScenario(engine);
        var subs = ['User A — Department', 'User B — Department', 'User C — Department', 'User D — Department', 'User E — Department'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#ef4444; font-weight:bold;">TICKET #HW4-' + (4000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + HW4Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + HW4Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); padding:12px; border-radius:4px; color:#fca5a5;">' + HW4Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); HW4Config._renderPanel(engine); return; }
        var c = document.createElement('div'); c.id = 'hwContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Storage Failure — Diagnostics', iconDef.icon, c); HW4Config._renderPanel(engine);
    },

    _renderPanel(engine) {
        var c = document.getElementById('hwContainer'); if (!c) return;
        var sc = HW4Config._getScenario(engine); if (!sc) { c.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var html = '<div style="font-size:1rem; font-weight:bold; color:#ef4444; margin-bottom:16px;">Storage Failure — Diagnostics</div>';

        var stateKey = Object.keys(sc.stateOverrides)[0];
        var isIssue = engine.state[stateKey];
        html += '<div style="margin-bottom:12px; padding:12px; background:' + (isIssue ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isIssue ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;">'
            + '<div style="font-weight:bold; color:' + (isIssue ? '#ef4444' : '#2ecc71') + ';">' + sc.name + '</div>'
            + '<div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">' + (isIssue ? 'ISSUE DETECTED: ' + HW4Config._escHtml(sc.fixDescription) : 'Issue resolved. System operating normally.') + '</div>';
        if (isIssue) html += '<button id="panelFix" style="padding:6px 16px; background:#ef4444; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Apply Fix</button>';
        html += '</div>';

        html += '<div style="padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; margin-bottom:12px;"><div style="font-weight:bold; color:#2ecc71;">System Summary</div><div style="color:#aaa; font-size:0.75rem;">All other components operating within normal parameters.</div></div>';

        if (engine.state._flagRevealed) {
            var fid = 'hw4-flag-' + sc.id;
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
            HW4Config._renderPanel(engine);
        });
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#ef4444; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="hw4RC" style="padding:8px 24px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="hw4CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('hw4RC').addEventListener('click', function() { HW4Config._flagRestored = false; HW4Config.hints = HW4Config._defaultHints; engine.reset(); });
        document.getElementById('hw4CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};