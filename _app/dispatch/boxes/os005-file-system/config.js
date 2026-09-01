/* ============================================================
   DISPATCH LAB — Box OS5: File System Fiasco
   CompTIA A+ Core 2 — File System Fiasco (1.4)
   5 distinct scenarios
   ============================================================ */

var OS5Config = {

    title: 'File System Fiasco',
    subtitle: 'Access Denied — A+ Core 2 File System Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#3b82f6',
    storageKey: 'hexworth_lab_os5',
    registryId: 'os005-file-system',
    trackerKey: 'lab_os5',

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
            /* MD-100 M06: Configure Data Access & Usage. Module id and title taken from
               _app/tenant/md-100-map.js, the course map, so this claim matches what the
               course actually teaches. Deliberately NOT the 5.1/4.1 style the two older
               MD-100 boxes use: MD-100 has four exam domains and no in-repo source
               defines that numbering, so reusing it would be inventing a citation. */
            { flagId: 'fixed', objective: 'M06', description: 'Configure Data Access & Usage', skill: 'NTFS permissions, EFS, effective access troubleshooting' },
        { flagId: 'fixed', objective: '1.4', description: 'Configure file systems and storage', skill: 'NTFS Permissions, EFS, Mapped Drives, OneDrive, Recycle Bin' }
    ] },

    _scenarioFlags: { ntfs_denied: null, efs_locked: null, mapped_drive_disconnect: null, onedrive_conflicts: null, recycle_bin_corrupt: null },

    _scenarios: [
        {
            id: 'ntfs_denied',
            name: 'Access Denied to Folder (NTFS Permissions)',
            ticketSubject: 'Cannot open my own project folder — says Access Denied',
            ticketDetail: 'I cannot access my project folder on the shared drive. When I try to open it I get "You don\'t currently have permission to access this folder." This is MY folder that I created. I could access it yesterday. Other folders on the same drive work fine.',
            ticketExtra: 'IT Note: NTFS permissions on the folder were modified during a permissions audit. The user\'s group was removed from the ACL. The user needs to be re-added with Modify permissions. Check the Security tab in the folder Properties.',
            affectedDevice: 0,
            fixDescription: 'Re-add user/group to folder ACL with Modify permissions',
            stateOverrides: { _ntfsDenied: true }
        },
        {
            id: 'efs_locked',
            name: 'EFS Encrypted Files After Employee Left',
            ticketSubject: 'Cannot open files in former employee\'s folder — "Access to file denied"',
            ticketDetail: 'A former employee left the company and we need to access their project files. When we try to open any file in their folder, we get "Access is denied." The folder permissions look correct — Administrators have Full Control. But the files themselves will not open.',
            ticketExtra: 'IT Note: The files are encrypted with EFS (Encrypting File System) tied to the former employee\'s user certificate. Standard NTFS permissions do not override EFS encryption. The Data Recovery Agent (DRA) certificate can decrypt these files. Check if a DRA was configured in Group Policy. If not, the employee\'s exported certificate backup (PFX file) is needed.',
            affectedDevice: 0,
            fixDescription: 'Use Data Recovery Agent certificate to decrypt EFS-protected files',
            stateOverrides: { _efsLocked: true }
        },
        {
            id: 'mapped_drive_disconnect',
            name: 'Mapped Drive Disconnects at Reboot',
            ticketSubject: 'My S: drive mapping disappears every time I restart — have to remap every morning',
            ticketDetail: 'I have a mapped network drive (S:) that points to the file server. Every morning when I start my computer, the S: drive is gone and I have to map it again. I check "Reconnect at sign-in" every time but it still disappears the next day.',
            ticketExtra: 'IT Note: Mapped drives with "Reconnect at sign-in" store credentials in Windows Credential Manager. If the saved credentials expire or are incorrect, the mapping fails silently on boot. Check Credential Manager for stale/incorrect entries. Also consider a Group Policy or login script to ensure persistent mappings.',
            affectedDevice: 0,
            fixDescription: 'Update stored credentials in Credential Manager and verify via login script',
            stateOverrides: { _mappedDriveDisconnect: true }
        },
        {
            id: 'onedrive_conflicts',
            name: 'OneDrive Sync Showing Conflicts',
            ticketSubject: 'OneDrive keeps creating duplicate files with "conflict" in the name',
            ticketDetail: 'My OneDrive folder is full of files with names like "Budget Report (John\'s laptop - conflict).xlsx" and "Proposal (Office PC - conflict).docx." Some files have 3 or 4 conflict copies. I do not know which version is the right one. How do I fix this mess?',
            ticketExtra: 'IT Note: OneDrive sync conflicts occur when the same file is modified on two devices before syncing completes. The user edits on a laptop and desktop without waiting for sync. Solutions: compare conflict files and keep the correct version, ensure OneDrive is syncing before editing, and enable File Collaboration (co-authoring) for Office files to prevent future conflicts.',
            affectedDevice: 0,
            fixDescription: 'Resolve conflicts by comparing versions, enable co-authoring for Office files',
            stateOverrides: { _onedriveConflicts: true }
        },
        {
            id: 'recycle_bin_corrupt',
            name: 'Recycle Bin Corrupt',
            ticketSubject: 'Recycle Bin shows "corrupted" — cannot empty it or recover files',
            ticketDetail: 'When I try to open the Recycle Bin, I get an error: "The Recycle Bin on C:\ is corrupted. Do you want to empty the Recycle Bin for this drive?" I click Yes but the error comes back. I also deleted an important file yesterday that I need to recover and I cannot access the Recycle Bin at all.',
            ticketExtra: 'IT Note: The hidden $Recycle.Bin folder on C: has become corrupt. Delete it from an elevated command prompt (rd /s /q C:\$Recycle.Bin) and Windows will recreate it automatically on next use. Note: this will permanently delete any files currently in the Recycle Bin, so attempt file recovery first if needed.',
            affectedDevice: 0,
            fixDescription: 'Delete corrupt $Recycle.Bin folder via elevated cmd, Windows recreates it automatically',
            stateOverrides: { _recycleBinCorrupt: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Read the ticket and check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause. Investigate carefully.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the diagnostic panel to inspect and fix components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        ntfs_denied: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Re-add user/group to folder ACL with Modify permissions', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        efs_locked: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use Data Recovery Agent certificate to decrypt EFS-protected files', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        mapped_drive_disconnect: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Update stored credentials in Credential Manager and verify via login script', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        onedrive_conflicts: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Resolve conflicts by comparing versions, enable co-authoring for Office files', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        recycle_bin_corrupt: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Delete corrupt $Recycle.Bin folder via elevated cmd, Windows recreates it automatically', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !OS5Config._flagRestored) { OS5Config._flagRestored = true; var s = OS5Config._scenarios[engine.state._scenarioId]; if (s) OS5Config.hints = OS5Config._scenarioHints[s.id] || OS5Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._ntfsDenied = false; engine.state._efsLocked = false; engine.state._mappedDriveDisconnect = false; engine.state._onedriveConflicts = false; engine.state._recycleBinCorrupt = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var ov = OS5Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        OS5Config._flagRestored = true; OS5Config.hints = OS5Config._scenarioHints[OS5Config._scenarios[idx].id] || OS5Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : OS5Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'hw_panel', label: 'File\nSystem', icon: 'FS', app: 'hw_panel' },
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
    lore: { intro: 'File System Fiasco scenarios test your ability to diagnose and resolve real-world A+ Core 2 problems.', scenario: 'Five distinct failure modes, each requiring different tools and approaches.', outro: 'Issue resolved. Solid troubleshooting identified and fixed the root cause.' },
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
            case 'ticket': OS5Config._openTicket(iconDef, engine); break;
            case 'hw_panel': case 'services': case 'disk_mgmt': case 'devmgr': case 'event_viewer': OS5Config._openPanel(iconDef, engine); break;
            case 'reset_lab': OS5Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        OS5Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) OS5Config._renderTicket(engine, c); else OS5Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['User — "Cannot open my own project folder — says Access Denied"', 'User — "Cannot open files in former employee\'s folder — "Access to f..."', 'User — "My S: drive mapping disappears every time I restart — have t..."', 'User — "OneDrive keeps creating duplicate files with "conflict" in t..."', 'User — "Recycle Bin shows "corrupted" — cannot empty it or recover f..."'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3b82f6; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        OS5Config._scenarios.forEach(function(s, i) { html += '<button class="os5-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#3b82f6; font-weight:bold;">OS5-' + (5000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="os5Rand" style="padding:10px 28px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.os5-btn').forEach(function(b) { b.addEventListener('click', function() { OS5Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); OS5Config._renderTicket(engine, container); }); });
        document.getElementById('os5Rand').addEventListener('click', function() { OS5Config._applyScenario(engine, Math.floor(Math.random() * 5)); OS5Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = OS5Config._getScenario(engine);
        var subs = ['User A — Department', 'User B — Department', 'User C — Department', 'User D — Department', 'User E — Department'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#3b82f6; font-weight:bold;">TICKET #OS5-' + (5000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + OS5Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + OS5Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); padding:12px; border-radius:4px; color:#93c5fd;">' + OS5Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); OS5Config._renderPanel(engine); return; }
        var c = document.createElement('div'); c.id = 'hwContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'File System Fiasco — Diagnostics', iconDef.icon, c); OS5Config._renderPanel(engine);
    },

    _renderPanel(engine) {
        var c = document.getElementById('hwContainer'); if (!c) return;
        var sc = OS5Config._getScenario(engine); if (!sc) { c.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var html = '<div style="font-size:1rem; font-weight:bold; color:#3b82f6; margin-bottom:16px;">File System Fiasco — Diagnostics</div>';

        var stateKey = Object.keys(sc.stateOverrides)[0];
        var isIssue = engine.state[stateKey];
        html += '<div style="margin-bottom:12px; padding:12px; background:' + (isIssue ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isIssue ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;">'
            + '<div style="font-weight:bold; color:' + (isIssue ? '#3b82f6' : '#2ecc71') + ';">' + sc.name + '</div>'
            + '<div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">' + (isIssue ? 'ISSUE DETECTED: ' + OS5Config._escHtml(sc.fixDescription) : 'Issue resolved. System operating normally.') + '</div>';
        if (isIssue) html += '<button id="panelFix" style="padding:6px 16px; background:#3b82f6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Apply Fix</button>';
        html += '</div>';

        html += '<div style="padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; margin-bottom:12px;"><div style="font-weight:bold; color:#2ecc71;">System Summary</div><div style="color:#aaa; font-size:0.75rem;">All other components operating within normal parameters.</div></div>';

        if (engine.state._flagRevealed) {
            var fid = 'os5-flag-' + sc.id;
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
            OS5Config._renderPanel(engine);
        });
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#3b82f6; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="os5RC" style="padding:8px 24px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="os5CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('os5RC').addEventListener('click', function() { OS5Config._flagRestored = false; OS5Config.hints = OS5Config._defaultHints; engine.reset(); });
        document.getElementById('os5CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};