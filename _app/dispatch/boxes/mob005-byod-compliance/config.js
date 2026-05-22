/* ============================================================
   DISPATCH LAB — Box MOB005: BYOD Compliance
   BYOD Compliance Troubleshooting — A+ Core 2
   ============================================================ */

var MOB005Config = {
    title: 'BYOD Compliance',
    subtitle: 'BYOD Compliance Troubleshooting — A+ Core 2',
    difficulty: 'Intermediate',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_mob005',
    registryId: 'mob005-byod-compliance',
    trackerKey: 'lab_mob005',
    tutorialMode: true,
    tutorial: { steps: [
        { title: 'Open the Help Desk Ticket', tip: 'Read the incident details.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
        { title: 'Investigate the issue', tip: 'Use tools and commands to diagnose.', trigger: { event: 'command', match: { cmd: 'contains:Get-' }, alt: [{ event: 'window_open', match: { type: 'admin_console' } }] } },
        { title: 'Identify the root cause', tip: 'Analyze evidence to find the problem.', trigger: { event: 'command', match: { cmd: 'contains:Get-' } } },
        { title: 'Apply the fix', tip: 'Execute remediation steps.', trigger: { event: 'command', match: { cmd: 'contains:Set-' }, alt: [{ event: 'command', match: { cmd: 'contains:Restart-' } }] } },
        { title: 'Verify and capture the flag', tip: 'Confirm resolution.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
    ]},
    certObjectives: { certPath: 'A+ Core 2', mappings: [{flagId:'fixed',objective:'1.8',description:'Configure mobile device management',skill:'BYOD Compliance Policy Management'},{flagId:'fixed',objective:'2.7',description:'Explain common methods for device security',skill:'Device Encryption and PIN Requirements'},{flagId:'fixed',objective:'4.5',description:'Summarize environmental impacts of security controls',skill:'MAM Container Isolation and Data Protection'}] },
    _scenarios: [{id:'no_pin',name:'Personal Device Non-Compliant — No PIN Set',ticketSubject:'User phone marked non-compliant — corporate email blocked until PIN is set',ticketDetail:'Olivia Baker reports she can no longer access her corporate email on her personal iPhone. The Company Portal shows her device as "Not Compliant" with the reason "Device passcode not set." She says she removed her passcode last week because it was annoying.',ticketExtra:'IT Note: Intune compliance policy requires a minimum 6-digit passcode on all enrolled devices. Olivia removed her passcode, which triggered non-compliance. Conditional access then blocked her corporate email. Fix: The user must set a passcode on her device. Once set, Intune compliance will re-evaluate within 8 hours (or immediately if she syncs from Company Portal). No admin action needed — educate the user.',fixDescription:'User must set a 6-digit passcode on the device, then sync from Company Portal',stateOverrides:{_noPinFixed:false}},
        {id:'no_encryption',name:'Encryption Not Enabled on Android',ticketSubject:'Android device non-compliant — "storage encryption required" but user says it is encrypted',ticketDetail:'Tom Wright has a Samsung Galaxy S23 that shows non-compliant for "Storage encryption required." Tom insists his phone is encrypted. He shows the Settings > Security screen which says "Encrypted." But Intune still reports it as non-compliant.',ticketExtra:'IT Note: Samsung Knox devices report encryption differently than stock Android. The Intune compliance check is looking for "device encryption" at the system level, but Samsung Knox reports encryption via a different API. This is a known Intune bug with certain Samsung One UI versions. Fix: Update the Samsung device firmware to the latest One UI patch, or adjust the compliance policy to use the Samsung Knox-specific encryption check instead of the generic Android check.',fixDescription:'Update Samsung firmware or adjust compliance policy for Knox-specific encryption check',stateOverrides:{_noEncryptionFixed:false}},
        {id:'jailbreak_detected',name:'Jailbreak/Root Detected by MDM',ticketSubject:'Employee iPhone suddenly marked non-compliant — "jailbreak detected" but user denies it',ticketDetail:'Harold Lewis (Finance) reports his iPhone was marked non-compliant with "jailbreak detected." He says he never jailbroke his phone. He is locked out of all corporate apps. He says a friend installed a "battery optimizer" app from a website last weekend.',ticketExtra:'IT Note: The "battery optimizer" app likely installed a jailbreak payload without Harold understanding what it was. Intune jailbreak detection found Cydia-related files and modified system partitions. This is a legitimate jailbreak detection. Fix: The device cannot be trusted and must be removed from corporate enrollment. Perform a selective wipe to remove corporate data. Harold will need to restore his iPhone to factory settings (which removes the jailbreak) and re-enroll. Educate about sideloaded apps.',fixDescription:'Selective wipe corporate data, user must factory reset to remove jailbreak, then re-enroll',stateOverrides:{_jailbreakFixed:false}},
        {id:'os_too_old',name:'OS Version Too Old — Minimum Version Policy',ticketSubject:'Older iPad cannot access corporate apps — "operating system version not supported"',ticketDetail:'Derek Wilson (HR Training) has an iPad Air 2 running iPadOS 15.8. He cannot access corporate apps. Company Portal shows non-compliant: "Minimum OS version required: 16.0." He says the iPad cannot be updated past 15.8.',ticketExtra:'IT Note: iPad Air 2 maximum supported iPadOS is 16.7.x. The compliance policy minimum is iPadOS 16.0. However, if the user says the iPad cannot update past 15.8, they may not have checked for updates recently. iPadOS 16.7 IS available for iPad Air 2. Fix: Guide the user to Settings > General > Software Update to install iPadOS 16.7. If the device truly cannot update (hardware issue), the iPad must be replaced.',fixDescription:'Update iPad to iPadOS 16.7 (available for iPad Air 2) via Settings > General > Software Update',stateOverrides:{_osOldFixed:false}},
        {id:'mam_isolation',name:'MAM Container Isolation Not Enforcing — Data Leak',ticketSubject:'Corporate data copying to personal apps — MAM policy not blocking clipboard',ticketDetail:'Security team discovered that users can copy text from Outlook (managed) and paste it into personal WhatsApp (unmanaged). The MAM policy should block this data transfer. 200 BYOD users are affected. This is a data leak risk.',ticketExtra:'IT Note: The App Protection Policy (MAM) for Outlook has "Send org data to other apps" set to "All apps" instead of "Policy managed apps." This allows corporate data to flow to any app including personal ones. Fix: Update the App Protection Policy: set "Send org data to other apps" to "Policy managed apps" and "Receive data from other apps" to "Policy managed apps." This enforces container isolation.',fixDescription:'Update App Protection Policy to restrict data flow to policy-managed apps only',stateOverrides:{_mamIsolationFixed:false}}],
    _defaultHints: [{id:'hint1',text:'Open the ticket and review symptoms.',cost:0,penalty:0},{id:'hint2',text:'Use diagnostic tools to investigate.',cost:10,penalty:-10},{id:'hint3',text:'Identify root cause before fixing.',cost:25,penalty:-25},{id:'hint4',text:'Apply the fix and verify.',cost:50,penalty:-50}],
    _scenarioHints: {no_pin:[{"id":"hint1","text":"Device is non-compliant because passcode was removed. This is user education.","cost":0,"penalty":0},{"id":"hint2","text":"Compliance requires a 6-digit passcode. User removed it voluntarily.","cost":10,"penalty":-10},{"id":"hint3","text":"User must set a passcode, then sync from Company Portal to re-evaluate compliance.","cost":25,"penalty":-25},{"id":"hint4","text":"No admin action needed. Educate the user about compliance requirements and re-sync.","cost":50,"penalty":-50}],
        no_encryption:[{"id":"hint1","text":"Samsung shows encrypted but Intune disagrees. Check for a known compatibility issue.","cost":0,"penalty":0},{"id":"hint2","text":"Samsung Knox reports encryption via a different API. Intune has a known bug with certain One UI versions.","cost":10,"penalty":-10},{"id":"hint3","text":"Update Samsung firmware to latest One UI, or adjust compliance to use Knox-specific check.","cost":25,"penalty":-25},{"id":"hint4","text":"After firmware update, sync the device. Intune will read the correct encryption status.","cost":50,"penalty":-50}],
        jailbreak_detected:[{"id":"hint1","text":"Jailbreak detected. User installed a \"battery optimizer\" from a website. Could that be the cause?","cost":0,"penalty":0},{"id":"hint2","text":"Yes — the app installed a jailbreak payload. Cydia files detected. Legitimate detection.","cost":10,"penalty":-10},{"id":"hint3","text":"Selective wipe corporate data. User must factory reset to remove jailbreak.","cost":25,"penalty":-25},{"id":"hint4","text":"After factory reset and re-enrollment, educate about never installing apps outside the App Store.","cost":50,"penalty":-50}],
        os_too_old:[{"id":"hint1","text":"iPad on iPadOS 15.8, minimum is 16.0. Can this iPad hardware support 16?","cost":0,"penalty":0},{"id":"hint2","text":"iPad Air 2 supports up to iPadOS 16.7. The user just has not updated.","cost":10,"penalty":-10},{"id":"hint3","text":"Guide user: Settings > General > Software Update > Install iPadOS 16.7.","cost":25,"penalty":-25},{"id":"hint4","text":"After updating to 16.7, device will pass compliance. Sync from Company Portal to verify.","cost":50,"penalty":-50}],
        mam_isolation:[{"id":"hint1","text":"Corporate data can be copied to personal apps. Check the MAM data transfer settings.","cost":0,"penalty":0},{"id":"hint2","text":"\"Send org data to other apps\" is set to \"All apps.\" It should be \"Policy managed apps.\"","cost":10,"penalty":-10},{"id":"hint3","text":"Update App Protection Policy: restrict data flow to managed apps only.","cost":25,"penalty":-25},{"id":"hint4","text":"After policy update, clipboard/paste to unmanaged apps will be blocked. Existing data copies cannot be recalled.","cost":50,"penalty":-50}]},
    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !MOB005Config._flagRestored) { MOB005Config._flagRestored = true; var s = MOB005Config._scenarios[engine.state._scenarioId]; if (s) MOB005Config.hints = MOB005Config._scenarioHints[s.id] || MOB005Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._noPinFixed = false; engine.state._noEncryptionFixed = false; engine.state._jailbreakFixed = false; engine.state._osOldFixed = false; engine.state._mamIsolationFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; MOB005Config._flagRestored = true; MOB005Config.hints = MOB005Config._scenarioHints[MOB005Config._scenarios[idx].id] || MOB005Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? MOB005Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _checkFix: function(engine) {
        var s = MOB005Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if(s.id==='no_pin')done=engine.state._noPinFixed;
        if(s.id==='no_encryption')done=engine.state._noEncryptionFixed;
        if(s.id==='jailbreak_detected')done=engine.state._jailbreakFixed;
        if(s.id==='os_too_old')done=engine.state._osOldFixed;
        if(s.id==='mam_isolation')done=engine.state._mamIsolationFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'Issue resolved. Check admin console for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },
    boot: { biosLines: ['System BIOS OK', 'Processor OK', 'Memory OK', 'Storage OK', 'Loading OS...'], grubEntries: ['Windows 11 Enterprise'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'admin', label: 'Admin\nConsole', icon: 'ADM', app: 'admin_console' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'ADMIN-PC', startDir: 'C:\\Users\\Administrator', promptStyle: 'powershell', welcome: 'Windows PowerShell\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:mob005}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{id:'hint1',text:'Read the ticket.',cost:0,penalty:0},{id:'hint2',text:'Investigate with diagnostic tools.',cost:10,penalty:-10},{id:'hint3',text:'Identify root cause.',cost:25,penalty:-25},{id:'hint4',text:'Apply fix and verify.',cost:50,penalty:-50}],
    lore: { intro: 'BYOD Compliance — diagnose and resolve the mobile device issue.', scenario: 'Investigate, identify, fix, verify.', outro: 'Issue resolved. Document the incident.' },
    phases: [{id:'investigate',name:'Investigation',requiredFlags:[],unlocks:['diagnose'],locked:false},{id:'diagnose',name:'Diagnosis',requiredFlags:[],unlocks:['repair'],locked:true},{id:'repair',name:'Remediation',requiredFlags:[],unlocks:['verify'],locked:true},{id:'verify',name:'Verification',requiredFlags:['fixed'],unlocks:[],locked:true}],
    commands: {
        'apply-fix': function(args, term, engine) {
            var gate = MOB005Config._requireScenario(engine); if (gate) return gate;
            var s = MOB005Config._getScenario(engine);
            var k = Object.keys(s.stateOverrides)[0];
            engine.state[k] = true; engine.save();
            engine.notify('Fix applied: ' + s.fixDescription, 'success');
            MOB005Config._checkFix(engine);
            return '\nFix applied successfully.\n';
        },
        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'ADMIN-PC'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },
    onAppLaunch: function(iconDef, engine) {
        if (['admin_console'].indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': MOB005Config._openTicket(iconDef, engine); break;
            case 'admin_console': MOB005Config._openAdmin(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },
    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        MOB005Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            var s = MOB005Config._getScenario(engine);
            c.innerHTML = '<div style="color:#f59e0b; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (6400 + engine.state._scenarioId) + '</div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + MOB005Config._escHtml(s.ticketSubject) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + MOB005Config._escHtml(s.ticketDetail) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#fcd34d;">' + MOB005Config._escHtml(s.ticketExtra) + '</div></div>'
                + '<div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'
                + '<div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><button id="fixBtn" style="padding:10px 24px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Apply Fix</button></div>';
            var fb = document.getElementById('fixBtn');
            if (fb) fb.addEventListener('click', function() { var s = MOB005Config._getScenario(engine); var k = Object.keys(s.stateOverrides)[0]; engine.state[k] = true; engine.save(); engine.notify('Fix applied: ' + s.fixDescription, 'success'); MOB005Config._checkFix(engine); });
        } else {
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#f59e0b; font-weight:bold; font-size:1.1rem;">BYOD COMPLIANCE</div></div>';
            MOB005Config._scenarios.forEach(function(s, i) { h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace;"><span style="color:#f59e0b; font-weight:bold;">INC-' + (6400+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + s.name + '</div></button>'; });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { MOB005Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); MOB005Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { MOB005Config._applyScenario(engine, Math.floor(Math.random()*5)); MOB005Config._openTicket(iconDef, engine); });
        }
    },
    _openAdmin: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Admin Console', 'ADM', c);
        var s = MOB005Config._getScenario(engine);
        var h = '<div style="font-size:0.9rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">Admin Console — Diagnostic View</div>';
        if (s) h += '<div style="padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div style="font-weight:bold; color:#fcd34d;">Active: ' + s.name + '</div><div style="color:#888; font-size:0.75rem;">Status: ' + (engine.state._labComplete ? '<span style="color:#2ecc71;">RESOLVED</span>' : '<span style="color:#e74c3c;">OPEN</span>') + '</div></div>';
        if (engine.state._flagRevealed && engine._deliveredFlags) { var fv = engine._deliveredFlags[s?s.id:'']; if (fv) h += '<div style="margin-top:16px; padding:10px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px;"><div style="color:#2ecc71; font-weight:bold;">Closure Token:</div><div>' + fv + '</div></div>'; }
        c.innerHTML = h;
    }
};