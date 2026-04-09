/* ============================================================
   DISPATCH LAB — Box CLD004: SaaS App Access Denied
   SaaS Application Access Troubleshooting — Cloud+ / Azure
   ============================================================ */

var CLD004Config = {
    title: 'SaaS App Access Denied',
    subtitle: 'SaaS Application Access Troubleshooting — Cloud+ / Azure',
    difficulty: 'Advanced',
    accent: '#0ea5e9',
    storageKey: 'hexworth_lab_cld004',
    registryId: 'cld004-saas-access',
    trackerKey: 'lab_cld004',

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

    certObjectives: { certPath: 'Cloud+ / Azure', mappings: [{flagId:'fixed',objective:'2.3',description:'Manage cloud resources',skill:'SaaS Application Access Management'},{flagId:'fixed',objective:'3.1',description:'Determine troubleshooting methodology',skill:'Conditional Access Policy Troubleshooting'},{flagId:'fixed',objective:'4.2',description:'Analyze cloud service issues',skill:'OAuth/SAML Authentication Debugging'}] },

    _scenarios: [
        {id:'ca_noncompliant',name:'Conditional Access Blocking — Non-Compliant Device',ticketSubject:'User blocked from all cloud apps — "Your device is not compliant"',ticketDetail:'Marcus Webb cannot access any M365 apps from his new laptop. He gets "Your sign-in was successful but your device does not meet compliance requirements." His old laptop worked fine. The new laptop was imaged yesterday.',ticketExtra:'IT Note: Conditional access policy requires device compliance (Intune). New laptop is enrolled but compliance check is failing because BitLocker encryption has not completed yet. BitLocker is still encrypting the C: drive (78% done). Fix: Wait for encryption to finish, or temporarily add user to compliance exception group while encryption completes.',fixDescription:'Wait for BitLocker encryption to complete or add to temporary exception group',stateOverrides:{_caDeviceFixed:false}},
        {id:'no_bitlocker',name:'Device Compliance — No BitLocker Encryption',ticketSubject:'Intune marks device as non-compliant — BitLocker not enabled',ticketDetail:'Priya Patel\'s laptop is marked non-compliant in Intune. She cannot access Salesforce or any other cloud app. The Intune compliance policy requires BitLocker encryption, but her laptop shows BitLocker as "Not enabled." She says she never turned it off.',ticketExtra:'IT Note: Priya\'s laptop was reimaged last week. The new image has TPM enabled but BitLocker was not automatically enabled because the Group Policy for BitLocker auto-encryption was not applied to her machine (she was in the wrong OU at the time). Fix: Enable BitLocker manually (manage-bde -on C:) or apply the GPO, then wait for Intune to report compliance.',fixDescription:'Enable BitLocker on the device and wait for Intune compliance check to pass',stateOverrides:{_bitlockerFixed:false}},
        {id:'app_reg_missing',name:'App Registration Missing in Azure AD',ticketSubject:'New SaaS app returns "AADSTS700016: Application not found" error',ticketDetail:'The HR team is trying to access a new benefits management SaaS app (BenefitsPro). When they click "Sign in with Microsoft," they get error AADSTS700016: "Application with identifier \'abc123-def456\' was not found in the directory." The vendor says the app is configured correctly on their side.',ticketExtra:'IT Note: The SaaS vendor configured their app to use Azure AD authentication, but the Enterprise Application / App Registration was never created in our Azure AD tenant. The vendor provided the client ID (abc123-def456) but IT never completed the admin consent flow. Fix: Register the app in Azure AD > Enterprise Applications > New application, or use the admin consent URL provided by the vendor.',fixDescription:'Register the SaaS app in Azure AD Enterprise Applications and grant admin consent',stateOverrides:{_appRegFixed:false}},
        {id:'token_expired',name:'OAuth Token Expired — Re-Consent Needed',ticketSubject:'Salesforce SSO suddenly stopped working — "invalid_grant" error',ticketDetail:'All users are getting "invalid_grant" errors when trying to access Salesforce via SSO. This started this morning. No changes were made on the Azure AD side. Salesforce support says the issue is on our end.',ticketExtra:'IT Note: The OAuth refresh token between Azure AD and Salesforce has expired. This happens when the client secret in the Azure AD app registration expires. The secret was set to expire after 1 year and it expired today. Fix: Generate a new client secret in Azure AD > App registrations > Salesforce > Certificates & secrets, then update the secret in Salesforce SSO configuration.',fixDescription:'Generate new client secret in Azure AD app registration and update in Salesforce',stateOverrides:{_tokenFixed:false}},
        {id:'saml_claims',name:'SAML Assertion Failure — Wrong Claim Mapping',ticketSubject:'New SSO app shows "Invalid SAML response — NameID not found" after login',ticketDetail:'A new project management SaaS app (ProjectHub) was integrated with Azure AD SAML SSO last week. Users can authenticate but immediately get redirected back with "Invalid SAML response: Required claim NameID not found in assertion." The vendor says they need the email address as the NameID.',ticketExtra:'IT Note: The SAML token configuration in Azure AD is sending user.userprincipalname as the NameID, but the app expects user.mail. Some users have UPNs that differ from their email addresses (e.g., UPN=jsmith@hexworth.local vs mail=jsmith@hexworth.com). Fix: In Azure AD > Enterprise Apps > ProjectHub > Single sign-on > Edit Attributes & Claims, change the NameID source from user.userprincipalname to user.mail.',fixDescription:'Change SAML NameID claim source from user.userprincipalname to user.mail',stateOverrides:{_samlFixed:false}}
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the ticket and review the symptoms carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use diagnostic commands to gather more information about the issue.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Identify the specific root cause before attempting a fix.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Apply the targeted fix and verify it resolves the issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        ca_noncompliant:[{"id":"hint1","text":"Device compliance is failing. Check what specific compliance requirement is not met.","cost":0,"penalty":0},{"id":"hint2","text":"BitLocker encryption is at 78% — still in progress. Compliance will pass when it finishes.","cost":10,"penalty":-10},{"id":"hint3","text":"Wait for BitLocker to complete, or add user to a temporary CA exception group.","cost":25,"penalty":-25},{"id":"hint4","text":"Add-ADGroupMember -Identity \"CA-Exception-Temp\" -Members mwebb. Remove after device is compliant.","cost":50,"penalty":-50}],
        no_bitlocker:[{"id":"hint1","text":"Device is non-compliant because BitLocker is not enabled. Why was it not auto-enabled?","cost":0,"penalty":0},{"id":"hint2","text":"The BitLocker GPO was not applied during reimaging because the device was in the wrong OU.","cost":10,"penalty":-10},{"id":"hint3","text":"Enable BitLocker: manage-bde -on C: -RecoveryPassword -SkipHardwareTest","cost":25,"penalty":-25},{"id":"hint4","text":"After enabling, Intune compliance check runs every 8 hours. Force check: Sync device in Company Portal.","cost":50,"penalty":-50}],
        app_reg_missing:[{"id":"hint1","text":"Error AADSTS700016 means the app is not registered in our Azure AD. The app registration is missing.","cost":0,"penalty":0},{"id":"hint2","text":"The vendor gave us the client ID but IT never created the Enterprise Application.","cost":10,"penalty":-10},{"id":"hint3","text":"Go to Azure AD > Enterprise Applications > New > Search for BenefitsPro or add from gallery.","cost":25,"penalty":-25},{"id":"hint4","text":"After registering, grant admin consent. Users will be able to sign in with Microsoft.","cost":50,"penalty":-50}],
        token_expired:[{"id":"hint1","text":"Salesforce SSO broke today with no changes. Check if any certificates or secrets expired.","cost":0,"penalty":0},{"id":"hint2","text":"The client secret in the Azure AD app registration for Salesforce expired today (1-year expiry).","cost":10,"penalty":-10},{"id":"hint3","text":"Azure AD > App registrations > Salesforce > Certificates & secrets > New client secret.","cost":25,"penalty":-25},{"id":"hint4","text":"After generating new secret, update it in Salesforce Setup > Auth Provider > Azure AD.","cost":50,"penalty":-50}],
        saml_claims:[{"id":"hint1","text":"SAML SSO works (user authenticates) but app rejects the response. Check the claim mapping.","cost":0,"penalty":0},{"id":"hint2","text":"NameID is set to user.userprincipalname but the app expects user.mail (email address).","cost":10,"penalty":-10},{"id":"hint3","text":"Azure AD > Enterprise Apps > ProjectHub > SSO > Edit Claims > Change NameID to user.mail.","cost":25,"penalty":-25},{"id":"hint4","text":"After changing, test with SAML tracer browser extension to verify the correct claim is sent.","cost":50,"penalty":-50}]
    },

    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !CLD004Config._flagRestored) { CLD004Config._flagRestored = true; var s = CLD004Config._scenarios[engine.state._scenarioId]; if (s) CLD004Config.hints = CLD004Config._scenarioHints[s.id] || CLD004Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._caDeviceFixed = false; engine.state._bitlockerFixed = false; engine.state._appRegFixed = false; engine.state._tokenFixed = false; engine.state._samlFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; CLD004Config._flagRestored = true; CLD004Config.hints = CLD004Config._scenarioHints[CLD004Config._scenarios[idx].id] || CLD004Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? CLD004Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _checkFix: function(engine) {
        var s = CLD004Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if(s.id==='ca_noncompliant')done=engine.state._caDeviceFixed;
        if(s.id==='no_bitlocker')done=engine.state._bitlockerFixed;
        if(s.id==='app_reg_missing')done=engine.state._appRegFixed;
        if(s.id==='token_expired')done=engine.state._tokenFixed;
        if(s.id==='saml_claims')done=engine.state._samlFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'Issue resolved. Check admin console for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },

    boot: { biosLines: ['System BIOS v2.12.1', 'Processor: Intel Xeon / Core i7', 'Memory: OK', 'Storage: OK', 'Network: OK', 'Loading OS...'], grubEntries: ['Windows 11 Enterprise / Server 2022'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'admin', label: 'Admin\nConsole', icon: 'ADM', app: 'admin_console' }, { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'ADMIN-PC', startDir: 'C:\\Users\\Administrator', promptStyle: 'powershell', welcome: 'Windows PowerShell\nConnected to admin console.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:cld004}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{ id: 'hint1', text: 'Read the ticket carefully.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Use diagnostic commands to investigate.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Identify the root cause before fixing.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Apply the fix and verify.', cost: 50, penalty: -50 }],
    lore: { intro: 'SaaS App Access Denied — troubleshoot and resolve the reported issue.', scenario: 'Investigate the symptoms, identify the root cause, apply the fix, and verify the resolution.', outro: 'Issue resolved successfully. Document the incident and update the knowledge base.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Remediation', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        'apply-fix': function(args, term, engine) {
            var gate = CLD004Config._requireScenario(engine); if (gate) return gate;
            var s = CLD004Config._getScenario(engine);
            if(s.id==='ca_noncompliant'){engine.state._caDeviceFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD004Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='no_bitlocker'){engine.state._bitlockerFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD004Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='app_reg_missing'){engine.state._appRegFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD004Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='token_expired'){engine.state._tokenFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD004Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='saml_claims'){engine.state._samlFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD004Config._checkFix(engine);return '\nFix applied successfully.\n';}
            return '\nSpecify the fix to apply.\n';
        },
        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'ADMIN-PC'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    onAppLaunch: function(iconDef, engine) {
        if (['admin_console','event_viewer'].indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': CLD004Config._openTicket(iconDef, engine); break;
            case 'admin_console': CLD004Config._openAdmin(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },

    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'tc_cld004saasaccess'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        CLD004Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            var s = CLD004Config._getScenario(engine);
            c.innerHTML = '<div style="color:#0ea5e9; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (5300 + engine.state._scenarioId) + '</div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + CLD004Config._escHtml(s.ticketSubject) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + CLD004Config._escHtml(s.ticketDetail) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(14,165,233,0.08); border:1px solid rgba(14,165,233,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#7dd3fc;">' + CLD004Config._escHtml(s.ticketExtra) + '</div></div>'
                + '<div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'
                + '<div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><button id="applyFixBtn" style="padding:10px 24px; background:#0ea5e9; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Apply Fix</button></div>';
            var fb = document.getElementById('applyFixBtn');
            if (fb) fb.addEventListener('click', function() {
                var s = CLD004Config._getScenario(engine);
                var overrideKey = Object.keys(s.stateOverrides)[0];
                engine.state[overrideKey] = true;
                engine.save();
                engine.notify('Fix applied: ' + s.fixDescription, 'success');
                CLD004Config._checkFix(engine);
            });
        } else {
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#0ea5e9; font-weight:bold; font-size:1.1rem;">SAAS APP ACCESS DENIED</div></div>';
            CLD004Config._scenarios.forEach(function(s, i) {
                h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace;"><span style="color:#0ea5e9; font-weight:bold;">INC-' + (5300+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + s.name + '</div></button>';
            });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#0ea5e9; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { CLD004Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); CLD004Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { CLD004Config._applyScenario(engine, Math.floor(Math.random()*5)); CLD004Config._openTicket(iconDef, engine); });
        }
    },

    _openAdmin: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Admin Console', 'ADM', c);
        var s = CLD004Config._getScenario(engine);
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