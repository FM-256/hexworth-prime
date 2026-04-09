/* ============================================================
   DISPATCH LAB — Box CLD003: Azure AD Sync Issue
   Azure AD Connect Sync Troubleshooting — Cloud+ / Azure
   ============================================================ */

var CLD003Config = {
    title: 'Azure AD Sync Issue',
    subtitle: 'Azure AD Connect Sync Troubleshooting — Cloud+ / Azure',
    difficulty: 'Advanced',
    accent: '#0ea5e9',
    storageKey: 'hexworth_lab_cld003',
    registryId: 'cld003-aad-sync',
    trackerKey: 'lab_cld003',

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

    certObjectives: { certPath: 'Cloud+ / Azure', mappings: [{flagId:'fixed',objective:'2.3',description:'Manage cloud resources',skill:'Azure AD Connect Sync'},{flagId:'fixed',objective:'3.1',description:'Determine troubleshooting methodology',skill:'Hybrid Identity Troubleshooting'},{flagId:'fixed',objective:'4.2',description:'Analyze cloud service issues',skill:'Directory Synchronization Errors'}] },

    _scenarios: [
        {id:'filtered_ou',name:'User Not Syncing — Filtered OU',ticketSubject:'New employee not appearing in Azure AD after 4 hours — cannot access cloud apps',ticketDetail:'Jordan Martinez was created in AD yesterday but does not appear in Azure AD. All cloud apps (Teams, OneDrive, Outlook) show "account not found." Other new users created in the Marketing OU synced within 30 minutes.',ticketExtra:'IT Note: Azure AD Connect is configured to sync specific OUs. Jordan was created in OU=NewUsers which is NOT in the sync scope. Only OU=IT, OU=HR, OU=Finance, OU=Marketing, OU=Executives are synced. Fix: Move Jordan to the Marketing OU, or add NewUsers to the sync scope in AAD Connect.',fixDescription:'Move user to synced OU or add NewUsers to AAD Connect sync scope',stateOverrides:{_filteredOuFixed:false}},
        {id:'password_hash',name:'Password Hash Sync Failed — Service Account Expired',ticketSubject:'Users reporting "wrong password" in cloud apps but on-prem AD password works fine',ticketDetail:'Multiple users say their current on-prem AD password does not work for Microsoft 365. They can log into their domain workstations fine, but Outlook, Teams, and SharePoint say "incorrect password." This started 2 days ago.',ticketExtra:'IT Note: Password Hash Sync (PHS) uses a service account (MSOL_abc123) to read password hashes from AD. That service account password expired 2 days ago. PHS has been failing since then. New password changes are not syncing to Azure AD. Fix: Reset the MSOL service account password and update it in AAD Connect configuration.',fixDescription:'Reset MSOL service account password and update in AAD Connect',stateOverrides:{_phsFixed:false}},
        {id:'attribute_conflict',name:'Attribute Conflict — Duplicate proxyAddress',ticketSubject:'AAD Connect showing export error for 3 users — "attribute value must be unique"',ticketDetail:'Azure AD Connect sync is completing but 3 users are failing with export errors. The sync dashboard shows "AttributeValueMustBeUnique" for these users. Their accounts exist in AD but the cloud copies are not updating.',ticketExtra:'IT Note: Three users have the same proxyAddress (SMTP:info@hexworth.com) set as an alias. Azure AD requires unique proxy addresses. The alias was mass-applied by a script error. Fix: Remove the duplicate proxyAddress from 2 of the 3 users, leaving it on only the intended mailbox (the info@ shared mailbox).',fixDescription:'Remove duplicate proxyAddress from conflicting users, keep on intended mailbox',stateOverrides:{_attrConflictFixed:false}},
        {id:'upn_mismatch',name:'Hybrid Identity Mismatch — UPN vs Mail',ticketSubject:'User SSO failing — "User account not found in directory" despite account existing',ticketDetail:'Elena Vasquez (CTO) can log into AD but Azure AD SSO fails. The cloud portal says her account does not exist. However, the Azure AD admin portal shows an account for her. Seamless SSO and PHS are both configured.',ticketExtra:'IT Note: On-prem UPN is evasquez@hexworth.local (non-routable) but Azure AD expects evasquez@hexworth.com. The Alternate Login ID is not configured in AAD Connect, and the UPN suffix @hexworth.com was not added to the AD forest. Fix: Add hexworth.com as a UPN suffix in AD Domains and Trusts, then change Elena UPN to @hexworth.com.',fixDescription:'Add UPN suffix hexworth.com to AD and update user UPN',stateOverrides:{_upnFixed:false}},
        {id:'export_errors',name:'AAD Connect Health Alert — Export Errors',ticketSubject:'AAD Connect health showing "Export to Azure AD failed" — 156 errors in last cycle',ticketDetail:'The Azure AD Connect Health dashboard is showing 156 export errors in the last sync cycle. Objects are not being written to Azure AD. The error details show various failures including permission denied and schema violations.',ticketExtra:'IT Note: AAD Connect was updated last night and the new version has stricter schema validation. 156 user objects have attributes that violate the new validation rules (empty required fields, invalid characters in DisplayName, phone numbers with wrong format). Fix: Run the AAD Connect troubleshooting wizard, export the error report, and fix the invalid attributes in on-prem AD.',fixDescription:'Run AAD Connect troubleshooter, fix invalid attributes in on-prem AD, re-sync',stateOverrides:{_exportFixed:false}}
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the ticket and review the symptoms carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use diagnostic commands to gather more information about the issue.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Identify the specific root cause before attempting a fix.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Apply the targeted fix and verify it resolves the issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        filtered_ou:[{"id":"hint1","text":"User is in AD but not syncing to Azure AD. Check AAD Connect sync scope (which OUs are included).","cost":0,"penalty":0},{"id":"hint2","text":"OU=NewUsers is not in the sync scope. Jordan needs to be in a synced OU.","cost":10,"penalty":-10},{"id":"hint3","text":"Move user to OU=Marketing or add OU=NewUsers to AAD Connect sync scope.","cost":25,"penalty":-25},{"id":"hint4","text":"After moving, trigger a delta sync: Start-ADSyncSyncCycle -PolicyType Delta","cost":50,"penalty":-50}],
        password_hash:[{"id":"hint1","text":"On-prem password works but cloud does not. This means Password Hash Sync is broken.","cost":0,"penalty":0},{"id":"hint2","text":"The MSOL service account password expired 2 days ago. PHS cannot read password hashes.","cost":10,"penalty":-10},{"id":"hint3","text":"Reset the MSOL account and update in AAD Connect: Set-ADSyncAutoUpgrade, or re-run AAD Connect wizard.","cost":25,"penalty":-25},{"id":"hint4","text":"Reset MSOL password in AD, update in AAD Connect config, force full sync.","cost":50,"penalty":-50}],
        attribute_conflict:[{"id":"hint1","text":"3 users have export errors. Check the error details — what attribute is conflicting?","cost":0,"penalty":0},{"id":"hint2","text":"All 3 users have the same proxyAddress SMTP:info@hexworth.com. Azure AD requires unique values.","cost":10,"penalty":-10},{"id":"hint3","text":"Remove the duplicate proxyAddress from 2 users. Keep it only on the info@ shared mailbox.","cost":25,"penalty":-25},{"id":"hint4","text":"Use Set-ADUser to remove proxyAddresses, then Start-ADSyncSyncCycle -PolicyType Delta.","cost":50,"penalty":-50}],
        upn_mismatch:[{"id":"hint1","text":"User exists in both AD and Azure AD but SSO fails. Check if the UPN matches between them.","cost":0,"penalty":0},{"id":"hint2","text":"On-prem UPN is @hexworth.local (non-routable). Azure AD needs @hexworth.com.","cost":10,"penalty":-10},{"id":"hint3","text":"Add hexworth.com as UPN suffix in AD Domains and Trusts, then change user UPN.","cost":25,"penalty":-25},{"id":"hint4","text":"Set-ADUser evasquez -UserPrincipalName \"evasquez@hexworth.com\", then force delta sync.","cost":50,"penalty":-50}],
        export_errors:[{"id":"hint1","text":"156 export errors after an AAD Connect update. Check the error report for patterns.","cost":0,"penalty":0},{"id":"hint2","text":"New schema validation is stricter. Users have empty required fields and invalid characters.","cost":10,"penalty":-10},{"id":"hint3","text":"Export the error list, fix attributes in on-prem AD (fill empty fields, remove invalid chars).","cost":25,"penalty":-25},{"id":"hint4","text":"Run Invoke-ADSyncDiagnostics to identify all issues, fix in bulk with Set-ADUser, then full sync.","cost":50,"penalty":-50}]
    },

    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !CLD003Config._flagRestored) { CLD003Config._flagRestored = true; var s = CLD003Config._scenarios[engine.state._scenarioId]; if (s) CLD003Config.hints = CLD003Config._scenarioHints[s.id] || CLD003Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._filteredOuFixed = false; engine.state._phsFixed = false; engine.state._attrConflictFixed = false; engine.state._upnFixed = false; engine.state._exportFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; CLD003Config._flagRestored = true; CLD003Config.hints = CLD003Config._scenarioHints[CLD003Config._scenarios[idx].id] || CLD003Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? CLD003Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _checkFix: function(engine) {
        var s = CLD003Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if(s.id==='filtered_ou')done=engine.state._filteredOuFixed;
        if(s.id==='password_hash')done=engine.state._phsFixed;
        if(s.id==='attribute_conflict')done=engine.state._attrConflictFixed;
        if(s.id==='upn_mismatch')done=engine.state._upnFixed;
        if(s.id==='export_errors')done=engine.state._exportFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'Issue resolved. Check admin console for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },

    boot: { biosLines: ['System BIOS v2.12.1', 'Processor: Intel Xeon / Core i7', 'Memory: OK', 'Storage: OK', 'Network: OK', 'Loading OS...'], grubEntries: ['Windows 11 Enterprise / Server 2022'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'admin', label: 'Admin\nConsole', icon: 'ADM', app: 'admin_console' }, { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'ADMIN-PC', startDir: 'C:\\Users\\Administrator', promptStyle: 'powershell', welcome: 'Windows PowerShell\nConnected to admin console.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:cld003}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{ id: 'hint1', text: 'Read the ticket carefully.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Use diagnostic commands to investigate.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Identify the root cause before fixing.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Apply the fix and verify.', cost: 50, penalty: -50 }],
    lore: { intro: 'Azure AD Sync Issue — troubleshoot and resolve the reported issue.', scenario: 'Investigate the symptoms, identify the root cause, apply the fix, and verify the resolution.', outro: 'Issue resolved successfully. Document the incident and update the knowledge base.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Remediation', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        'apply-fix': function(args, term, engine) {
            var gate = CLD003Config._requireScenario(engine); if (gate) return gate;
            var s = CLD003Config._getScenario(engine);
            if(s.id==='filtered_ou'){engine.state._filteredOuFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD003Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='password_hash'){engine.state._phsFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD003Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='attribute_conflict'){engine.state._attrConflictFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD003Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='upn_mismatch'){engine.state._upnFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD003Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='export_errors'){engine.state._exportFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD003Config._checkFix(engine);return '\nFix applied successfully.\n';}
            return '\nSpecify the fix to apply.\n';
        },
        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'ADMIN-PC'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    onAppLaunch: function(iconDef, engine) {
        if (['admin_console','event_viewer'].indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': CLD003Config._openTicket(iconDef, engine); break;
            case 'admin_console': CLD003Config._openAdmin(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },

    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'tc_cld003aadsync'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        CLD003Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            var s = CLD003Config._getScenario(engine);
            c.innerHTML = '<div style="color:#0ea5e9; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (5200 + engine.state._scenarioId) + '</div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + CLD003Config._escHtml(s.ticketSubject) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + CLD003Config._escHtml(s.ticketDetail) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(14,165,233,0.08); border:1px solid rgba(14,165,233,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#7dd3fc;">' + CLD003Config._escHtml(s.ticketExtra) + '</div></div>'
                + '<div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'
                + '<div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><button id="applyFixBtn" style="padding:10px 24px; background:#0ea5e9; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Apply Fix</button></div>';
            var fb = document.getElementById('applyFixBtn');
            if (fb) fb.addEventListener('click', function() {
                var s = CLD003Config._getScenario(engine);
                var overrideKey = Object.keys(s.stateOverrides)[0];
                engine.state[overrideKey] = true;
                engine.save();
                engine.notify('Fix applied: ' + s.fixDescription, 'success');
                CLD003Config._checkFix(engine);
            });
        } else {
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#0ea5e9; font-weight:bold; font-size:1.1rem;">AZURE AD SYNC ISSUE</div></div>';
            CLD003Config._scenarios.forEach(function(s, i) {
                h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace;"><span style="color:#0ea5e9; font-weight:bold;">INC-' + (5200+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + s.name + '</div></button>';
            });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#0ea5e9; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { CLD003Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); CLD003Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { CLD003Config._applyScenario(engine, Math.floor(Math.random()*5)); CLD003Config._openTicket(iconDef, engine); });
        }
    },

    _openAdmin: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Admin Console', 'ADM', c);
        var s = CLD003Config._getScenario(engine);
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