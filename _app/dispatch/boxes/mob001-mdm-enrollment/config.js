/* ============================================================
   DISPATCH LAB — Box MOB001: MDM Enrollment Failure
   MDM Enrollment Troubleshooting — A+ Core 2
   ============================================================ */

var MOB001Config = {
    title: 'MDM Enrollment Failure',
    subtitle: 'MDM Enrollment Troubleshooting — A+ Core 2',
    difficulty: 'Intermediate',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_mob001',
    registryId: 'mob001-mdm-enrollment',
    trackerKey: 'lab_mob001',

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

    certObjectives: { certPath: 'A+ Core 2', mappings: [{flagId:'fixed',objective:'1.8',description:'Configure mobile device management',skill:'MDM Enrollment Troubleshooting'},{flagId:'fixed',objective:'4.1',description:'Summarize monitoring resources',skill:'Mobile Device Compliance Monitoring'},{flagId:'fixed',objective:'2.7',description:'Explain common methods for device security',skill:'Enterprise Mobile Security Policies'}] },

    _scenarios: [
        {id:'ios_profile_fail',name:'iOS Device MDM Profile Download Fails',ticketSubject:'iPhone will not enroll in Intune — profile download hangs at 50%',ticketDetail:'Susan Hall (HR Director) got a new company iPhone 15 Pro. When she tries to enroll via Company Portal, the MDM profile download starts but hangs at 50% and eventually times out with "Profile Installation Failed." She has tried 3 times. WiFi is working and she can browse the internet.',ticketExtra:'IT Note: The Apple Push Notification Service (APNS) certificate may have expired. Check the Intune console for APNS certificate status. Also verify the Apple MDM Push Certificate in Intune > Tenant admin > Connectors and tokens > Apple MDM push certificate. If expired, renew it through the Apple Push Certificates Portal. Alternatively, the device may need to be on WiFi (not cellular) and have correct date/time settings.',fixDescription:'Renew APNS certificate in Intune or verify certificate is valid and device settings are correct',stateOverrides:{_iosProfileFixed:false}},
        {id:'android_work_stuck',name:'Android Work Profile Creation Stuck',ticketSubject:'Samsung Galaxy stuck on "Setting up work profile" for 45 minutes',ticketDetail:'Tom Wright (HR Manager) is enrolling his new Samsung Galaxy S24. The Company Portal app installed fine but after accepting the enrollment, it has been stuck on "Setting up your work profile" for 45 minutes. The progress spinner keeps going but nothing happens.',ticketExtra:'IT Note: Android work profile creation requires Google Play Services to be up to date. Check the device Google Play Services version. Also, Samsung devices need the "Android Device Policy" app from Google Play. If the device is on an older firmware, the work profile may fail to initialize. Fix: Update Google Play Services, clear Company Portal cache, and retry enrollment. If that fails, factory reset and start fresh.',fixDescription:'Update Google Play Services, clear Company Portal cache, retry enrollment',stateOverrides:{_androidWorkFixed:false}},
        {id:'enrollment_restriction',name:'Enrollment Restriction Blocking Personal Device',ticketSubject:'Employee personal phone rejected during enrollment — "device type not allowed"',ticketDetail:'Olivia Baker (HR Recruiter) is trying to enroll her personal Android phone for BYOD email access. The enrollment fails immediately with "Your IT administrator has restricted enrollment of this device type." She has an older Pixel 5a running Android 12.',ticketExtra:'IT Note: Intune enrollment restrictions are set to block personal Android devices running below Android 13. The policy "AllowedPlatforms" has a minimum OS version of Android 13. Olivia is on Android 12. Options: (1) Update the phone to Android 13 if available, (2) Lower the minimum OS restriction, (3) Use Outlook app with MAM (app protection policy) instead of full enrollment — this does not require enrollment.',fixDescription:'Update device OS to Android 13, lower the restriction, or use MAM-only (no enrollment)',stateOverrides:{_enrollRestrictionFixed:false}},
        {id:'company_portal_crash',name:'Company Portal App Crash on Enrollment',ticketSubject:'Company Portal crashes immediately when tapping "Begin Setup" on iPad',ticketDetail:'Grace Kim is enrolling a shared iPad for the Finance conference room. The Company Portal app opens fine, she signs in with her credentials, but when she taps "Begin Setup" the app immediately crashes and returns to the home screen. She reinstalled Company Portal twice.',ticketExtra:'IT Note: This iPad is running iPadOS 15.7 which has a known compatibility issue with Company Portal v5.2312+. The app requires iPadOS 16.0 or later. The crash is caused by an API call that does not exist in iPadOS 15. Fix: Update the iPad to iPadOS 16 or later, then retry enrollment. If the iPad hardware cannot support iPadOS 16, it cannot be enrolled with the current Company Portal version.',fixDescription:'Update iPad to iPadOS 16 or later, then retry enrollment',stateOverrides:{_cpCrashFixed:false}},
        {id:'scep_cert_fail',name:'Certificate Push Failed — SCEP Misconfigured',ticketSubject:'Device enrolls but WiFi profile fails — "certificate installation error"',ticketDetail:'Multiple devices are enrolling successfully in Intune, but the corporate WiFi certificate profile fails to install. Devices show "Certificate installation failed" in the Company Portal compliance status. Without the certificate, devices cannot connect to the corporate WPA2-Enterprise WiFi network.',ticketExtra:'IT Note: The SCEP certificate profile is configured to use an internal SCEP server (ndes.hexworth.local). The SCEP challenge URL is returning HTTP 503 because the NDES service on the SCEP server is stopped. The IIS application pool for NDES crashed yesterday. Fix: Restart the NDES IIS application pool, verify the SCEP challenge URL responds, then sync affected devices to retry certificate delivery.',fixDescription:'Restart NDES IIS application pool, verify SCEP URL, sync devices to retry cert delivery',stateOverrides:{_scepFixed:false}}
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the ticket and review the symptoms carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use diagnostic commands to gather more information about the issue.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Identify the specific root cause before attempting a fix.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Apply the targeted fix and verify it resolves the issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        ios_profile_fail:[{"id":"hint1","text":"iOS enrollment hangs at 50%. Check the APNS certificate status in Intune.","cost":0,"penalty":0},{"id":"hint2","text":"If APNS cert is expired, MDM profile download will fail. Check Intune > Connectors > Apple MDM Push.","cost":10,"penalty":-10},{"id":"hint3","text":"Renew APNS cert through Apple Push Certificates Portal and upload to Intune.","cost":25,"penalty":-25},{"id":"hint4","text":"After renewal, the user may need to remove the failed profile and re-enroll from scratch.","cost":50,"penalty":-50}],
        android_work_stuck:[{"id":"hint1","text":"Work profile creation stuck for 45 min. Check Google Play Services version on the device.","cost":0,"penalty":0},{"id":"hint2","text":"Google Play Services is outdated. The Android Device Policy app may also be missing.","cost":10,"penalty":-10},{"id":"hint3","text":"Update Google Play Services from Google Play Store, clear Company Portal app cache, retry.","cost":25,"penalty":-25},{"id":"hint4","text":"If still stuck: Company Portal > Settings > Reset device > Factory reset if needed.","cost":50,"penalty":-50}],
        enrollment_restriction:[{"id":"hint1","text":"Device rejected with \"type not allowed.\" Check Intune enrollment restrictions.","cost":0,"penalty":0},{"id":"hint2","text":"Minimum OS version is Android 13. Device is on Android 12.","cost":10,"penalty":-10},{"id":"hint3","text":"Options: Update to Android 13, lower the restriction, or use MAM-only (app protection without enrollment).","cost":25,"penalty":-25},{"id":"hint4","text":"For BYOD, MAM-only with Outlook is often the best approach — no full enrollment needed.","cost":50,"penalty":-50}],
        company_portal_crash:[{"id":"hint1","text":"Company Portal crashes immediately. Check the iOS/iPadOS version on the device.","cost":0,"penalty":0},{"id":"hint2","text":"iPad is on iPadOS 15.7. Company Portal requires 16.0+. Known compatibility issue.","cost":10,"penalty":-10},{"id":"hint3","text":"Update iPad to iPadOS 16 or later. If hardware is too old, cannot enroll with current CP.","cost":25,"penalty":-25},{"id":"hint4","text":"If iPad cannot be updated, use an older Company Portal version or replace the device.","cost":50,"penalty":-50}],
        scep_cert_fail:[{"id":"hint1","text":"Enrollment works but cert profile fails. Check the SCEP server status.","cost":0,"penalty":0},{"id":"hint2","text":"The NDES IIS application pool on the SCEP server is stopped. SCEP URL returns 503.","cost":10,"penalty":-10},{"id":"hint3","text":"Restart the NDES IIS application pool on ndes.hexworth.local.","cost":25,"penalty":-25},{"id":"hint4","text":"After restarting NDES, sync affected devices from Intune to retry certificate delivery.","cost":50,"penalty":-50}]
    },

    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !MOB001Config._flagRestored) { MOB001Config._flagRestored = true; var s = MOB001Config._scenarios[engine.state._scenarioId]; if (s) MOB001Config.hints = MOB001Config._scenarioHints[s.id] || MOB001Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._iosProfileFixed = false; engine.state._androidWorkFixed = false; engine.state._enrollRestrictionFixed = false; engine.state._cpCrashFixed = false; engine.state._scepFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; MOB001Config._flagRestored = true; MOB001Config.hints = MOB001Config._scenarioHints[MOB001Config._scenarios[idx].id] || MOB001Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? MOB001Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _checkFix: function(engine) {
        var s = MOB001Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if(s.id==='ios_profile_fail')done=engine.state._iosProfileFixed;
        if(s.id==='android_work_stuck')done=engine.state._androidWorkFixed;
        if(s.id==='enrollment_restriction')done=engine.state._enrollRestrictionFixed;
        if(s.id==='company_portal_crash')done=engine.state._cpCrashFixed;
        if(s.id==='scep_cert_fail')done=engine.state._scepFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'Issue resolved. Check admin console for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },

    boot: { biosLines: ['System BIOS v2.12.1', 'Processor: Intel Xeon / Core i7', 'Memory: OK', 'Storage: OK', 'Network: OK', 'Loading OS...'], grubEntries: ['Windows 11 Enterprise / Server 2022'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'admin', label: 'Admin\nConsole', icon: 'ADM', app: 'admin_console' }, { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'ADMIN-PC', startDir: 'C:\\Users\\Administrator', promptStyle: 'powershell', welcome: 'Windows PowerShell\nConnected to admin console.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:mob001}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{ id: 'hint1', text: 'Read the ticket carefully.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Use diagnostic commands to investigate.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Identify the root cause before fixing.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Apply the fix and verify.', cost: 50, penalty: -50 }],
    lore: { intro: 'MDM Enrollment Failure — troubleshoot and resolve the reported issue.', scenario: 'Investigate the symptoms, identify the root cause, apply the fix, and verify the resolution.', outro: 'Issue resolved successfully. Document the incident and update the knowledge base.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Remediation', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        'apply-fix': function(args, term, engine) {
            var gate = MOB001Config._requireScenario(engine); if (gate) return gate;
            var s = MOB001Config._getScenario(engine);
            if(s.id==='ios_profile_fail'){engine.state._iosProfileFixed=true;engine.save();engine.notify('Issue resolved.','success');MOB001Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='android_work_stuck'){engine.state._androidWorkFixed=true;engine.save();engine.notify('Issue resolved.','success');MOB001Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='enrollment_restriction'){engine.state._enrollRestrictionFixed=true;engine.save();engine.notify('Issue resolved.','success');MOB001Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='company_portal_crash'){engine.state._cpCrashFixed=true;engine.save();engine.notify('Issue resolved.','success');MOB001Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='scep_cert_fail'){engine.state._scepFixed=true;engine.save();engine.notify('Issue resolved.','success');MOB001Config._checkFix(engine);return '\nFix applied successfully.\n';}
            return '\nSpecify the fix to apply.\n';
        },
        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'ADMIN-PC'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    onAppLaunch: function(iconDef, engine) {
        if (['admin_console','event_viewer'].indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': MOB001Config._openTicket(iconDef, engine); break;
            case 'admin_console': MOB001Config._openAdmin(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },

    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'tc_mob001mdmenrollment'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        MOB001Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            var s = MOB001Config._getScenario(engine);
            c.innerHTML = '<div style="color:#f59e0b; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (6000 + engine.state._scenarioId) + '</div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + MOB001Config._escHtml(s.ticketSubject) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + MOB001Config._escHtml(s.ticketDetail) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#fcd34d;">' + MOB001Config._escHtml(s.ticketExtra) + '</div></div>'
                + '<div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'
                + '<div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><button id="applyFixBtn" style="padding:10px 24px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Apply Fix</button></div>';
            var fb = document.getElementById('applyFixBtn');
            if (fb) fb.addEventListener('click', function() {
                var s = MOB001Config._getScenario(engine);
                var overrideKey = Object.keys(s.stateOverrides)[0];
                engine.state[overrideKey] = true;
                engine.save();
                engine.notify('Fix applied: ' + s.fixDescription, 'success');
                MOB001Config._checkFix(engine);
            });
        } else {
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#f59e0b; font-weight:bold; font-size:1.1rem;">MDM ENROLLMENT FAILURE</div></div>';
            MOB001Config._scenarios.forEach(function(s, i) {
                h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace;"><span style="color:#f59e0b; font-weight:bold;">INC-' + (6000+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + s.name + '</div></button>';
            });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { MOB001Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); MOB001Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { MOB001Config._applyScenario(engine, Math.floor(Math.random()*5)); MOB001Config._openTicket(iconDef, engine); });
        }
    },

    _openAdmin: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Admin Console', 'ADM', c);
        var s = MOB001Config._getScenario(engine);
        var h = '<div style="font-size:0.9rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">Admin Console — Diagnostic View</div>';
        if (s) {
            h += '<div style="padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; margin-bottom:12px;">'
                + '<div style="font-weight:bold; color:#fcd34d;">Active Scenario: ' + s.name + '</div>'
                + '<div style="color:#888; font-size:0.75rem; margin-top:4px;">Status: ' + (engine.state._labComplete ? '<span style="color:#2ecc71;">RESOLVED</span>' : '<span style="color:#e74c3c;">OPEN</span>') + '</div></div>';
        }
        if (engine.state._flagRevealed && engine._deliveredFlags) {
            var fv = engine._deliveredFlags[s ? s.id : ''];
            if (fv) h += '<div style="padding:10px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px;"><div style="color:#2ecc71; font-weight:bold;">Closure Token:</div><div>' + fv + '</div></div>';
        }
        c.innerHTML = h;
    }
};