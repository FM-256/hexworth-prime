/* ============================================================
   DISPATCH LAB — Box CLD002: OneDrive Sync Broken
   OneDrive Sync Troubleshooting — Cloud+ / Azure
   ============================================================ */

var CLD002Config = {
    title: 'OneDrive Sync Broken',
    subtitle: 'OneDrive Sync Troubleshooting — Cloud+ / Azure',
    difficulty: 'Intermediate',
    accent: '#0ea5e9',
    storageKey: 'hexworth_lab_cld002',
    registryId: 'cld002-onedrive-sync',
    trackerKey: 'lab_cld002',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the incident details to understand the reported issue.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Investigate the issue', tip: 'Use the available tools and commands to gather diagnostic information.', trigger: { event: 'command', match: { cmd: 'contains:Get-' }, alt: [{ event: 'window_open', match: { type: 'admin_console' } }] } },
            { title: 'Identify the root cause', tip: 'Analyze the evidence to determine what is causing the problem.', trigger: { event: 'command', match: { cmd: 'contains:Get-' } } },
            { title: 'Apply the fix', tip: 'Execute the appropriate remediation steps.', trigger: { event: 'command', match: { cmd: 'contains:Set-' }, alt: [{ event: 'command', match: { cmd: 'contains:Restart-' } }] } },
            { title: 'Verify and capture the flag', tip: 'Confirm the issue is resolved. Flag appears after successful fix.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'Cloud+ / Azure', mappings: [{flagId:'fixed',objective:'2.3',description:'Manage cloud resources',skill:'OneDrive Sync Troubleshooting'},{flagId:'fixed',objective:'3.1',description:'Determine troubleshooting methodology',skill:'Cloud Storage Sync Conflicts'},{flagId:'fixed',objective:'4.2',description:'Analyze cloud service issues',skill:'Conditional Access and Sync Policies'}] },

    _scenarios: [
        {id:'sync_stuck',name:'Sync Stuck Pending — File Locked',ticketSubject:'OneDrive shows "sync pending" for 3 days — 47 files stuck',ticketDetail:'Grace Kim reports 47 files stuck in "sync pending" state in OneDrive. She can see the files locally but they are not uploading to the cloud. This started after she opened a large Excel file that stayed open over the weekend. Other files she creates also get stuck behind it.',ticketExtra:'IT Note: A large Excel file (Budget_Master.xlsx, 180MB) has been locked by Excel for 3 days. OneDrive cannot sync it because the file handle is held open. All subsequent files in the sync queue are blocked behind it. Fix: Close Excel (or kill the process), which releases the file lock. OneDrive will resume syncing. If the file is corrupt, rename it to trigger a fresh sync.',fixDescription:'Close Excel to release file lock, OneDrive will resume sync',stateOverrides:{_syncStuckFixed:false}},
        {id:'conflicting_copies',name:'Conflicting Copies Appearing',ticketSubject:'Files multiplying — seeing "John Smith-LAPTOP" copies of every document',ticketDetail:'Multiple users in Marketing are seeing duplicate files with names like "Document-John Smith-LAPTOP.docx" appearing alongside the originals. The duplicates keep appearing even after deletion. Users are confused about which version is current.',ticketExtra:'IT Note: Conflicting copies appear when multiple devices sync the same file with different changes. The root cause is that one user (sevans) has OneDrive signed in on 3 devices and is editing files offline on his laptop while his desktop also has them open. Fix: Close files on the laptop, let sync complete, then delete the conflicting copies. Set up OneDrive Files On-Demand to prevent this.',fixDescription:'Close duplicate editing sessions, enable Files On-Demand, clean up conflicting copies',stateOverrides:{_conflictFixed:false}},
        {id:'quota_exceeded',name:'Storage Quota Exceeded — 1TB',ticketSubject:'OneDrive says "Your OneDrive is full" — user has 1.2TB of files',ticketDetail:'Rachel Huang in Marketing has exceeded her 1TB OneDrive storage quota. She is a videographer and has been uploading raw video files. New files will not sync and she is getting constant "storage full" notifications. She says she needs all the files for her projects.',ticketExtra:'IT Note: Rachel has 1.2TB in OneDrive, exceeding the 1TB default quota. Options: (1) Increase her quota to 5TB (available with E3/E5 license), (2) Move large video files to SharePoint document library with higher storage, (3) Archive old projects to cold storage. Quick fix: Increase quota via M365 admin. Long-term: implement data lifecycle policy.',fixDescription:'Increase OneDrive quota to 5TB in M365 admin or move large files to SharePoint',stateOverrides:{_quotaFixed:false}},
        {id:'ca_blocking',name:'Conditional Access Blocking Sync from Unmanaged Device',ticketSubject:'OneDrive sync stopped working after switching to personal laptop — "access blocked"',ticketDetail:'Tom Wright is working from home on his personal laptop. OneDrive sync was working last week but now shows "Your IT admin has restricted access." He can still access OneDrive via the web browser. The sync client will not connect.',ticketExtra:'IT Note: A new conditional access policy "Require Managed Device for Desktop Apps" was deployed this week. It blocks native app (including OneDrive sync) access from devices not enrolled in Intune. Tom\'s personal laptop is not Intune-managed. Fix: Either enroll the device in Intune (if allowed by BYOD policy) or create a CA exception for OneDrive sync from trusted networks, or use OneDrive web access only.',fixDescription:'Enroll device in Intune or create CA exception for OneDrive sync',stateOverrides:{_caBlockFixed:false}},
        {id:'kfm_failure',name:'Known Folder Move (KFM) Failure — Unsupported Folder',ticketSubject:'OneDrive Known Folder Move failing with "can\'t protect folder" error',ticketDetail:'IT deployed Known Folder Move (KFM) via GPO to redirect Desktop, Documents, and Pictures to OneDrive. Most users are fine, but 12 users are getting "We can\'t protect your Documents folder" errors. The Documents folder on these machines has an unusually deep nested path with special characters.',ticketExtra:'IT Note: KFM fails when folders contain paths longer than 260 characters, or files with unsupported characters (# % & { } \ < > * ? / ! @ : |). These 12 users have a nested project structure with paths like "Documents\Project Alpha\Phase 2 - Final\Reports & Analysis\Q4 #Revenue\..." exceeding the 400-char limit. Fix: Shorten folder paths or rename folders to remove special characters, then retry KFM enrollment.',fixDescription:'Rename folders with special characters and shorten paths, then re-trigger KFM',stateOverrides:{_kfmFixed:false}}
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the ticket and review the symptoms carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use diagnostic commands to gather more information about the issue.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Identify the specific root cause before attempting a fix.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Apply the targeted fix and verify it resolves the issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        sync_stuck:[{"id":"hint1","text":"Check which file is blocking the sync queue. Is any application holding a file lock?","cost":0,"penalty":0},{"id":"hint2","text":"Budget_Master.xlsx has been locked by Excel for 3 days. Close Excel to release the lock.","cost":10,"penalty":-10},{"id":"hint3","text":"Use Get-Process excel | Stop-Process or ask the user to close Excel. OneDrive will resume.","cost":25,"penalty":-25},{"id":"hint4","text":"After releasing the lock, check sync status with Get-ODStatus. Force sync with OneDrive reset if needed.","cost":50,"penalty":-50}],
        conflicting_copies:[{"id":"hint1","text":"Conflicting copies mean the same file was edited on multiple devices simultaneously.","cost":0,"penalty":0},{"id":"hint2","text":"Steve Evans has 3 devices syncing and edits files offline on his laptop. The laptop and desktop conflict.","cost":10,"penalty":-10},{"id":"hint3","text":"Close files on the laptop, let sync complete, then enable Files On-Demand.","cost":25,"penalty":-25},{"id":"hint4","text":"Delete conflicting copies after confirming the correct version. Enable Files On-Demand to prevent future conflicts.","cost":50,"penalty":-50}],
        quota_exceeded:[{"id":"hint1","text":"Check the user OneDrive quota and current usage in M365 admin.","cost":0,"penalty":0},{"id":"hint2","text":"Rachel has 1.2TB used against a 1TB quota. She is a videographer uploading raw footage.","cost":10,"penalty":-10},{"id":"hint3","text":"Increase quota: Set-SPOSite -Identity \"https://hexworth-my.sharepoint.com/personal/rhuang\" -StorageQuota 5242880","cost":25,"penalty":-25},{"id":"hint4","text":"Long-term: Move large video files to SharePoint with higher storage quotas. Implement data lifecycle policies.","cost":50,"penalty":-50}],
        ca_blocking:[{"id":"hint1","text":"OneDrive sync stopped but web access works. This suggests the app is blocked, not the user.","cost":0,"penalty":0},{"id":"hint2","text":"A conditional access policy requires managed (Intune-enrolled) devices for desktop app access.","cost":10,"penalty":-10},{"id":"hint3","text":"Options: Enroll the laptop in Intune, create a CA exception, or use web access only.","cost":25,"penalty":-25},{"id":"hint4","text":"Quick fix: Add user to CA exception group. Proper fix: Enroll in Intune as BYOD.","cost":50,"penalty":-50}],
        kfm_failure:[{"id":"hint1","text":"KFM fails for 12 users. Check their Documents folder structure for long paths or special characters.","cost":0,"penalty":0},{"id":"hint2","text":"Paths exceed 400 chars and contain # % & characters. OneDrive cannot sync these.","cost":10,"penalty":-10},{"id":"hint3","text":"Rename folders to remove special characters: # % & \\ < > * ? ! @ etc.","cost":25,"penalty":-25},{"id":"hint4","text":"After renaming, re-trigger KFM: Set GPO OneDriveKFMSilentMove = 1 and force gpupdate.","cost":50,"penalty":-50}]
    },

    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !CLD002Config._flagRestored) { CLD002Config._flagRestored = true; var s = CLD002Config._scenarios[engine.state._scenarioId]; if (s) CLD002Config.hints = CLD002Config._scenarioHints[s.id] || CLD002Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._syncStuckFixed = false; engine.state._conflictFixed = false; engine.state._quotaFixed = false; engine.state._caBlockFixed = false; engine.state._kfmFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; CLD002Config._flagRestored = true; CLD002Config.hints = CLD002Config._scenarioHints[CLD002Config._scenarios[idx].id] || CLD002Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? CLD002Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _checkFix: function(engine) {
        var s = CLD002Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if(s.id==='sync_stuck')done=engine.state._syncStuckFixed;
        if(s.id==='conflicting_copies')done=engine.state._conflictFixed;
        if(s.id==='quota_exceeded')done=engine.state._quotaFixed;
        if(s.id==='ca_blocking')done=engine.state._caBlockFixed;
        if(s.id==='kfm_failure')done=engine.state._kfmFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'Issue resolved. Check admin console for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },

    boot: { biosLines: ['System BIOS v2.12.1', 'Processor: Intel Xeon / Core i7', 'Memory: OK', 'Storage: OK', 'Network: OK', 'Loading OS...'], grubEntries: ['Windows 11 Enterprise / Server 2022'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'admin', label: 'Admin\nConsole', icon: 'ADM', app: 'admin_console' }, { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'ADMIN-PC', startDir: 'C:\\Users\\Administrator', promptStyle: 'powershell', welcome: 'Windows PowerShell\nConnected to admin console.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:cld002}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{ id: 'hint1', text: 'Read the ticket carefully.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Use diagnostic commands to investigate.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Identify the root cause before fixing.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Apply the fix and verify.', cost: 50, penalty: -50 }],
    lore: { intro: 'OneDrive Sync Broken — troubleshoot and resolve the reported issue.', scenario: 'Investigate the symptoms, identify the root cause, apply the fix, and verify the resolution.', outro: 'Issue resolved successfully. Document the incident and update the knowledge base.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Remediation', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        'apply-fix': function(args, term, engine) {
            var gate = CLD002Config._requireScenario(engine); if (gate) return gate;
            var s = CLD002Config._getScenario(engine);
            if(s.id==='sync_stuck'){engine.state._syncStuckFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD002Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='conflicting_copies'){engine.state._conflictFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD002Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='quota_exceeded'){engine.state._quotaFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD002Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='ca_blocking'){engine.state._caBlockFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD002Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='kfm_failure'){engine.state._kfmFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD002Config._checkFix(engine);return '\nFix applied successfully.\n';}
            return '\nSpecify the fix to apply.\n';
        },
        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'ADMIN-PC'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    onAppLaunch: function(iconDef, engine) {
        if (['admin_console','event_viewer'].indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': CLD002Config._openTicket(iconDef, engine); break;
            case 'admin_console': CLD002Config._openAdmin(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },

    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'tc_cld002onedrivesync'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        CLD002Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            var s = CLD002Config._getScenario(engine);
            c.innerHTML = '<div style="color:#0ea5e9; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (5100 + engine.state._scenarioId) + '</div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + CLD002Config._escHtml(s.ticketSubject) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + CLD002Config._escHtml(s.ticketDetail) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(14,165,233,0.08); border:1px solid rgba(14,165,233,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#7dd3fc;">' + CLD002Config._escHtml(s.ticketExtra) + '</div></div>'
                + '<div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'
                + '<div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><button id="applyFixBtn" style="padding:10px 24px; background:#0ea5e9; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Apply Fix</button></div>';
            var fb = document.getElementById('applyFixBtn');
            if (fb) fb.addEventListener('click', function() {
                var s = CLD002Config._getScenario(engine);
                var overrideKey = Object.keys(s.stateOverrides)[0];
                engine.state[overrideKey] = true;
                engine.save();
                engine.notify('Fix applied: ' + s.fixDescription, 'success');
                CLD002Config._checkFix(engine);
            });
        } else {
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#0ea5e9; font-weight:bold; font-size:1.1rem;">ONEDRIVE SYNC BROKEN</div></div>';
            CLD002Config._scenarios.forEach(function(s, i) {
                h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace;"><span style="color:#0ea5e9; font-weight:bold;">INC-' + (5100+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + s.name + '</div></button>';
            });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#0ea5e9; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { CLD002Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); CLD002Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { CLD002Config._applyScenario(engine, Math.floor(Math.random()*5)); CLD002Config._openTicket(iconDef, engine); });
        }
    },

    _openAdmin: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Admin Console', 'ADM', c);
        var s = CLD002Config._getScenario(engine);
        var h = '<div style="font-size:0.9rem; font-weight:bold; color:#0ea5e9; margin-bottom:16px;">Admin Console — Diagnostic View</div>';
        if (s) {
            h += '<div style="padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; margin-bottom:12px;">'
                + '<div style="font-weight:bold; color:#7dd3fc;">Active Scenario: ' + s.name + '</div>'
                + '<div style="color:#888; font-size:0.75rem; margin-top:4px;">Status: ' + (engine.state._labComplete ? '<span style="color:#2ecc71;">RESOLVED</span>' : '<span style="color:#e74c3c;">OPEN</span>') + '</div></div>';
        }
        if (engine.state._flagRevealed && engine._deliveredFlags) {
            var fv = engine._deliveredFlags[s ? s.id : ''];
            if (fv) h += '<div style="padding:10px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px;"><div style="color:#2ecc71; font-weight:bold;">Closure Token:</div><div>' + fv + '</div></div>';
        }
        c.innerHTML = h;
    }
};