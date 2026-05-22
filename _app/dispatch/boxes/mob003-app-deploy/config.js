/* ============================================================
   DISPATCH LAB — Box MOB003: App Deployment Issue
   Mobile App Deployment Troubleshooting — A+ Core 2
   ============================================================ */

var MOB003Config = {
    title: 'App Deployment Issue',
    subtitle: 'Mobile App Deployment Troubleshooting — A+ Core 2',
    difficulty: 'Intermediate',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_mob003',
    registryId: 'mob003-app-deploy',
    trackerKey: 'lab_mob003',
    tutorialMode: true,
    tutorial: { steps: [
        { title: 'Open the Help Desk Ticket', tip: 'Read the incident details.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
        { title: 'Investigate the issue', tip: 'Use tools and commands to diagnose.', trigger: { event: 'command', match: { cmd: 'contains:Get-' }, alt: [{ event: 'window_open', match: { type: 'admin_console' } }] } },
        { title: 'Identify the root cause', tip: 'Analyze evidence to find the problem.', trigger: { event: 'command', match: { cmd: 'contains:Get-' } } },
        { title: 'Apply the fix', tip: 'Execute remediation steps.', trigger: { event: 'command', match: { cmd: 'contains:Set-' }, alt: [{ event: 'command', match: { cmd: 'contains:Restart-' } }] } },
        { title: 'Verify and capture the flag', tip: 'Confirm resolution.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
    ]},
    certObjectives: { certPath: 'A+ Core 2', mappings: [{flagId:'fixed',objective:'1.8',description:'Configure mobile device management',skill:'Mobile App Deployment via MDM'},{flagId:'fixed',objective:'4.1',description:'Summarize monitoring resources',skill:'App Installation Troubleshooting'},{flagId:'fixed',objective:'2.7',description:'Explain common methods for device security',skill:'App Store Restrictions and Sideloading Policies'}] },
    _scenarios: [{id:'assignment_wrong',name:'Required App Not Installing — Assignment Group Wrong',ticketSubject:'15 users not getting the required CRM app pushed to their phones',ticketDetail:'A new CRM app was configured as a "Required" app in Intune. 15 Sales team members are supposed to receive it automatically, but their phones show nothing. Other required apps installed fine.',ticketExtra:'IT Note: The app assignment group is set to "Marketing-Mobile" instead of "Sales-Mobile." The 15 Sales users are not in the Marketing group. Fix: Change the assignment group to "Sales-Mobile" or add the Sales users to the correct group. Then sync the devices.',fixDescription:'Change app assignment group from Marketing-Mobile to Sales-Mobile, sync devices',stateOverrides:{_assignmentFixed:false}},
        {id:'vpn_required',name:'VPN Needed for Internal App Store',ticketSubject:'Internal LOB app download fails — "unable to connect to server"',ticketDetail:'Users are trying to install a line-of-business (LOB) app from the internal app catalog. The download fails with "unable to connect to server." They can install apps from the public App Store fine. The LOB app is hosted on an internal server.',ticketExtra:'IT Note: The LOB app package is hosted on an internal server (apps.hexworth.local) that is only accessible via VPN or on the corporate network. Users working remotely need to connect to VPN first before the app can download. Fix: Either require VPN connection before app installation, or move the app package to a CDN/Intune-hosted location that is accessible from the internet.',fixDescription:'Require VPN connection or move app package to internet-accessible CDN/Intune hosting',stateOverrides:{_vpnAppFixed:false}},
        {id:'appstore_restriction',name:'iOS App Store Restriction Blocking Download',ticketSubject:'User cannot download any apps from App Store — "Restrictions" message',ticketDetail:'Elena Vasquez (CTO) cannot download any apps from the iOS App Store on her company iPhone. She gets a "Restrictions" message. She needs to install a presentation remote app for an investor meeting tomorrow.',ticketExtra:'IT Note: An iOS restriction profile deployed via Intune has "Allow App Store" set to false. This was intended for kiosk iPads, not executive iPhones. The restriction profile is assigned to the "All iOS Devices" group instead of "Kiosk-iPads" group. Fix: Change the restriction profile assignment to only target "Kiosk-iPads" group, not all iOS devices.',fixDescription:'Change restriction profile assignment from All iOS Devices to Kiosk-iPads only',stateOverrides:{_appStoreFixed:false}},
        {id:'sideload_blocked',name:'Sideloading APK Blocked by Policy',ticketSubject:'Custom Android app cannot be installed — "Install from unknown sources" blocked',ticketDetail:'The warehouse team needs a custom inventory scanner APK installed on their Android devices. When they try to install the APK file, Android blocks it saying "Install unknown apps" is disabled. The policy prevents enabling it.',ticketExtra:'IT Note: Intune compliance policy blocks sideloading (Install unknown apps = Not allowed). For legitimate LOB apps, the proper approach is to deploy via Intune as a managed LOB app, not sideloading. Upload the APK to Intune > Apps > Android > Add > Line-of-business app, then assign to the warehouse device group.',fixDescription:'Upload APK to Intune as a managed LOB app and deploy via Intune instead of sideloading',stateOverrides:{_sideloadFixed:false}},
        {id:'app_config_missing',name:'App Configuration Profile Not Delivering Settings',ticketSubject:'Managed app installed but missing server URL and API key — manual config not possible',ticketDetail:'A managed healthcare app was deployed to 50 nursing staff devices. The app installs successfully but launches to a blank setup screen asking for a server URL and API key. These settings should have been pre-configured via an app configuration profile in Intune.',ticketExtra:'IT Note: The app configuration profile was created but not assigned to any group. It is sitting in "Unassigned" state in Intune. The profile has the correct server URL (https://ehr.hexworth.local/api) and API key. Fix: Assign the configuration profile to the same group that received the app deployment ("Nursing-Devices"), then sync the devices to receive the configuration.',fixDescription:'Assign the app configuration profile to the Nursing-Devices group and sync devices',stateOverrides:{_appConfigFixed:false}}],
    _defaultHints: [{id:'hint1',text:'Open the ticket and review symptoms.',cost:0,penalty:0},{id:'hint2',text:'Use diagnostic tools to investigate.',cost:10,penalty:-10},{id:'hint3',text:'Identify root cause before fixing.',cost:25,penalty:-25},{id:'hint4',text:'Apply the fix and verify.',cost:50,penalty:-50}],
    _scenarioHints: {assignment_wrong:[{"id":"hint1","text":"15 Sales users not getting the app. Check the assignment group in Intune.","cost":0,"penalty":0},{"id":"hint2","text":"App is assigned to \"Marketing-Mobile\" — Sales users are not in that group.","cost":10,"penalty":-10},{"id":"hint3","text":"Change assignment to \"Sales-Mobile\" group in Intune > Apps > CRM App > Assignments.","cost":25,"penalty":-25},{"id":"hint4","text":"After fixing assignment, sync devices to trigger immediate app install.","cost":50,"penalty":-50}],
        vpn_required:[{"id":"hint1","text":"LOB app download fails but public apps work. Is the LOB server accessible?","cost":0,"penalty":0},{"id":"hint2","text":"LOB server (apps.hexworth.local) is internal only. Remote users need VPN.","cost":10,"penalty":-10},{"id":"hint3","text":"Either require VPN before install, or move the package to Intune-hosted (internet accessible).","cost":25,"penalty":-25},{"id":"hint4","text":"Best practice: Host LOB apps in Intune directly. Removes VPN dependency.","cost":50,"penalty":-50}],
        appstore_restriction:[{"id":"hint1","text":"CTO cannot install any apps. Check if a restriction profile is blocking App Store.","cost":0,"penalty":0},{"id":"hint2","text":"iOS restriction profile blocks App Store. It targets \"All iOS Devices\" instead of just kiosks.","cost":10,"penalty":-10},{"id":"hint3","text":"Change profile assignment to \"Kiosk-iPads\" group only.","cost":25,"penalty":-25},{"id":"hint4","text":"After reassigning, sync affected devices. CTO will regain App Store access.","cost":50,"penalty":-50}],
        sideload_blocked:[{"id":"hint1","text":"APK install blocked. Is sideloading the right approach for enterprise apps?","cost":0,"penalty":0},{"id":"hint2","text":"Sideloading is blocked by compliance policy (and should be). Deploy via Intune instead.","cost":10,"penalty":-10},{"id":"hint3","text":"Upload APK to Intune > Apps > Android > LOB app. Assign to warehouse device group.","cost":25,"penalty":-25},{"id":"hint4","text":"Intune LOB deployment is the enterprise-correct way. No need to allow sideloading.","cost":50,"penalty":-50}],
        app_config_missing:[{"id":"hint1","text":"App installs but has no configuration. Check the app config profile in Intune.","cost":0,"penalty":0},{"id":"hint2","text":"Config profile exists but is Unassigned. It was never assigned to a group.","cost":10,"penalty":-10},{"id":"hint3","text":"Assign to \"Nursing-Devices\" group in Intune > Apps > App configuration policies.","cost":25,"penalty":-25},{"id":"hint4","text":"After assignment, sync devices. Config (server URL + API key) will be pushed automatically.","cost":50,"penalty":-50}]},
    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !MOB003Config._flagRestored) { MOB003Config._flagRestored = true; var s = MOB003Config._scenarios[engine.state._scenarioId]; if (s) MOB003Config.hints = MOB003Config._scenarioHints[s.id] || MOB003Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._assignmentFixed = false; engine.state._vpnAppFixed = false; engine.state._appStoreFixed = false; engine.state._sideloadFixed = false; engine.state._appConfigFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; MOB003Config._flagRestored = true; MOB003Config.hints = MOB003Config._scenarioHints[MOB003Config._scenarios[idx].id] || MOB003Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? MOB003Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _checkFix: function(engine) {
        var s = MOB003Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if(s.id==='assignment_wrong')done=engine.state._assignmentFixed;
        if(s.id==='vpn_required')done=engine.state._vpnAppFixed;
        if(s.id==='appstore_restriction')done=engine.state._appStoreFixed;
        if(s.id==='sideload_blocked')done=engine.state._sideloadFixed;
        if(s.id==='app_config_missing')done=engine.state._appConfigFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'Issue resolved. Check admin console for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },
    boot: { biosLines: ['System BIOS OK', 'Processor OK', 'Memory OK', 'Storage OK', 'Loading OS...'], grubEntries: ['Windows 11 Enterprise'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'admin', label: 'Admin\nConsole', icon: 'ADM', app: 'admin_console' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'ADMIN-PC', startDir: 'C:\\Users\\Administrator', promptStyle: 'powershell', welcome: 'Windows PowerShell\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:mob003}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{id:'hint1',text:'Read the ticket.',cost:0,penalty:0},{id:'hint2',text:'Investigate with diagnostic tools.',cost:10,penalty:-10},{id:'hint3',text:'Identify root cause.',cost:25,penalty:-25},{id:'hint4',text:'Apply fix and verify.',cost:50,penalty:-50}],
    lore: { intro: 'App Deployment Issue — diagnose and resolve the mobile device issue.', scenario: 'Investigate, identify, fix, verify.', outro: 'Issue resolved. Document the incident.' },
    phases: [{id:'investigate',name:'Investigation',requiredFlags:[],unlocks:['diagnose'],locked:false},{id:'diagnose',name:'Diagnosis',requiredFlags:[],unlocks:['repair'],locked:true},{id:'repair',name:'Remediation',requiredFlags:[],unlocks:['verify'],locked:true},{id:'verify',name:'Verification',requiredFlags:['fixed'],unlocks:[],locked:true}],
    commands: {
        'apply-fix': function(args, term, engine) {
            var gate = MOB003Config._requireScenario(engine); if (gate) return gate;
            var s = MOB003Config._getScenario(engine);
            var k = Object.keys(s.stateOverrides)[0];
            engine.state[k] = true; engine.save();
            engine.notify('Fix applied: ' + s.fixDescription, 'success');
            MOB003Config._checkFix(engine);
            return '\nFix applied successfully.\n';
        },
        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'ADMIN-PC'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },
    onAppLaunch: function(iconDef, engine) {
        if (['admin_console'].indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': MOB003Config._openTicket(iconDef, engine); break;
            case 'admin_console': MOB003Config._openAdmin(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },
    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        MOB003Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            var s = MOB003Config._getScenario(engine);
            c.innerHTML = '<div style="color:#f59e0b; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (6200 + engine.state._scenarioId) + '</div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + MOB003Config._escHtml(s.ticketSubject) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + MOB003Config._escHtml(s.ticketDetail) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#fcd34d;">' + MOB003Config._escHtml(s.ticketExtra) + '</div></div>'
                + '<div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'
                + '<div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><button id="fixBtn" style="padding:10px 24px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Apply Fix</button></div>';
            var fb = document.getElementById('fixBtn');
            if (fb) fb.addEventListener('click', function() { var s = MOB003Config._getScenario(engine); var k = Object.keys(s.stateOverrides)[0]; engine.state[k] = true; engine.save(); engine.notify('Fix applied: ' + s.fixDescription, 'success'); MOB003Config._checkFix(engine); });
        } else {
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#f59e0b; font-weight:bold; font-size:1.1rem;">APP DEPLOYMENT ISSUE</div></div>';
            MOB003Config._scenarios.forEach(function(s, i) { h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace;"><span style="color:#f59e0b; font-weight:bold;">INC-' + (6200+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + s.name + '</div></button>'; });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { MOB003Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); MOB003Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { MOB003Config._applyScenario(engine, Math.floor(Math.random()*5)); MOB003Config._openTicket(iconDef, engine); });
        }
    },
    _openAdmin: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Admin Console', 'ADM', c);
        var s = MOB003Config._getScenario(engine);
        var h = '<div style="font-size:0.9rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">Admin Console — Diagnostic View</div>';
        if (s) h += '<div style="padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div style="font-weight:bold; color:#fcd34d;">Active: ' + s.name + '</div><div style="color:#888; font-size:0.75rem;">Status: ' + (engine.state._labComplete ? '<span style="color:#2ecc71;">RESOLVED</span>' : '<span style="color:#e74c3c;">OPEN</span>') + '</div></div>';
        if (engine.state._flagRevealed && engine._deliveredFlags) { var fv = engine._deliveredFlags[s?s.id:'']; if (fv) h += '<div style="margin-top:16px; padding:10px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px;"><div style="color:#2ecc71; font-weight:bold;">Closure Token:</div><div>' + fv + '</div></div>'; }
        c.innerHTML = h;
    }
};