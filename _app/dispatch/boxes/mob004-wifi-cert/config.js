/* ============================================================
   DISPATCH LAB — Box MOB004: WiFi Certificate Push
   WiFi Certificate Deployment Troubleshooting — A+ Core 2
   ============================================================ */

var MOB004Config = {
    title: 'WiFi Certificate Push',
    subtitle: 'WiFi Certificate Deployment Troubleshooting — A+ Core 2',
    difficulty: 'Advanced',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_mob004',
    registryId: 'mob004-wifi-cert',
    trackerKey: 'lab_mob004',
    tutorialMode: true,
    tutorial: { steps: [
        { title: 'Open the Help Desk Ticket', tip: 'Read the incident details.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
        { title: 'Investigate the issue', tip: 'Use tools and commands to diagnose.', trigger: { event: 'command', match: { cmd: 'contains:Get-' }, alt: [{ event: 'window_open', match: { type: 'admin_console' } }] } },
        { title: 'Identify the root cause', tip: 'Analyze evidence to find the problem.', trigger: { event: 'command', match: { cmd: 'contains:Get-' } } },
        { title: 'Apply the fix', tip: 'Execute remediation steps.', trigger: { event: 'command', match: { cmd: 'contains:Set-' }, alt: [{ event: 'command', match: { cmd: 'contains:Restart-' } }] } },
        { title: 'Verify and capture the flag', tip: 'Confirm resolution.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
    ]},
    certObjectives: { certPath: 'A+ Core 2', mappings: [{flagId:'fixed',objective:'1.8',description:'Configure mobile device management',skill:'Certificate Profile Deployment'},{flagId:'fixed',objective:'2.7',description:'Explain common methods for device security',skill:'802.1X and Certificate-Based Authentication'},{flagId:'fixed',objective:'3.5',description:'Explain wireless security protocols',skill:'WPA2/WPA3 Enterprise WiFi Configuration'}] },
    _scenarios: [{id:'scep_profile_fail',name:'SCEP Certificate Profile Failed to Deliver',ticketSubject:'50 devices showing "certificate installation failed" after enrollment',ticketDetail:'After a batch of 50 new devices were enrolled in Intune, they all show "Certificate installation failed" for the corporate WiFi SCEP certificate profile. The devices are enrolled and compliant otherwise. They cannot connect to the corporate WiFi network.',ticketExtra:'IT Note: The SCEP certificate profile references a Certificate Authority (CA) template called "HexworthWiFi-User" but the template name in the CA was recently changed to "Hexworth-WiFi-UserAuth" during a CA maintenance. The SCEP profile still references the old name, so the CA rejects all certificate requests. Fix: Update the SCEP profile in Intune to reference the correct CA template name.',fixDescription:'Update SCEP profile CA template name from "HexworthWiFi-User" to "Hexworth-WiFi-UserAuth"',stateOverrides:{_scepProfileFixed:false}},
        {id:'root_ca_missing',name:'Trusted Root CA Missing from Device',ticketSubject:'WiFi certificate installs but WiFi still shows "authentication failed"',ticketDetail:'Devices received their user certificate but still cannot connect to the corporate WiFi. The WiFi profile shows "Authentication failed: certificate trust error." The RADIUS server rejects the connection.',ticketExtra:'IT Note: The client certificate was issued by an intermediate CA, but devices do not have the Root CA certificate installed. Without the root CA in the trusted store, the certificate chain cannot be validated. Fix: Deploy a Trusted Root Certificate profile in Intune with the Root CA certificate, assign to all managed devices, then sync.',fixDescription:'Deploy Trusted Root CA certificate profile to all managed devices via Intune',stateOverrides:{_rootCaFixed:false}},
        {id:'eap_type_wrong',name:'WiFi Profile Has Wrong EAP Type — PEAP vs EAP-TLS',ticketSubject:'WiFi connects then immediately disconnects — EAP negotiation failure in RADIUS logs',ticketDetail:'Devices with the new WiFi profile connect briefly then immediately disconnect. RADIUS logs show EAP negotiation failure. The WiFi profile is configured for PEAP (username/password) but the RADIUS server expects EAP-TLS (certificate-based).',ticketExtra:'IT Note: The WiFi profile EAP type is set to PEAP (Protected EAP with MSCHAPv2) but the RADIUS server is configured for EAP-TLS (certificate-based authentication). These are incompatible. The RADIUS server was recently upgraded and the auth method changed from PEAP to EAP-TLS. Fix: Update the Intune WiFi profile to use EAP-TLS and link it to the deployed client certificate.',fixDescription:'Change WiFi profile EAP type from PEAP to EAP-TLS and link to client certificate profile',stateOverrides:{_eapTypeFixed:false}},
        {id:'user_vs_device_cert',name:'User Certificate vs Device Certificate Confusion',ticketSubject:'Shared devices cannot connect to WiFi — user certificates not available before login',ticketDetail:'Shared devices (conference room iPads, lobby kiosks) cannot connect to corporate WiFi. They need WiFi to be available at the login screen for device setup, but the current certificate profile deploys user certificates that only become available after a user logs in.',ticketExtra:'IT Note: User certificates require user affinity (a user must be signed in). Shared devices have no primary user assigned. The WiFi cert profile needs to use Device certificates instead of User certificates. Device certificates are installed during enrollment and are available regardless of who is logged in. Fix: Change the SCEP profile from User context to Device context.',fixDescription:'Change SCEP certificate profile context from User to Device for shared devices',stateOverrides:{_certContextFixed:false}},
        {id:'radius_reject',name:'802.1X Authentication Failing — RADIUS Reject',ticketSubject:'All wireless clients rejected after RADIUS server certificate renewal',ticketDetail:'After the RADIUS server certificate was renewed last night, ALL wireless clients are failing 802.1X authentication. RADIUS logs show "certificate trust failure from client." The RADIUS certificate is valid and issued by the same CA as before.',ticketExtra:'IT Note: The RADIUS server got a new certificate last night. The old certificate had SHA-256 signing, the new one uses SHA-384. Some older devices and the WiFi profile have a server certificate validation rule that pins the old certificate thumbprint. Fix: Update the WiFi profile to reference the new RADIUS server certificate thumbprint, or change the validation to trust the CA instead of a specific certificate.',fixDescription:'Update WiFi profile to remove old certificate pin and trust the CA instead',stateOverrides:{_radiusRejectFixed:false}}],
    _defaultHints: [{id:'hint1',text:'Open the ticket and review symptoms.',cost:0,penalty:0},{id:'hint2',text:'Use diagnostic tools to investigate.',cost:10,penalty:-10},{id:'hint3',text:'Identify root cause before fixing.',cost:25,penalty:-25},{id:'hint4',text:'Apply the fix and verify.',cost:50,penalty:-50}],
    _scenarioHints: {scep_profile_fail:[{"id":"hint1","text":"SCEP cert requests are failing. Check the CA template name in the SCEP profile.","cost":0,"penalty":0},{"id":"hint2","text":"Template name was changed from \"HexworthWiFi-User\" to \"Hexworth-WiFi-UserAuth\" during CA maintenance.","cost":10,"penalty":-10},{"id":"hint3","text":"Update the SCEP profile template name in Intune to match the new CA template name.","cost":25,"penalty":-25},{"id":"hint4","text":"After updating, sync affected devices to retry certificate enrollment.","cost":50,"penalty":-50}],
        root_ca_missing:[{"id":"hint1","text":"Client cert installs but WiFi trust fails. Check the certificate chain.","cost":0,"penalty":0},{"id":"hint2","text":"Root CA certificate is missing from device trusted store. Chain cannot be validated.","cost":10,"penalty":-10},{"id":"hint3","text":"Deploy a Trusted Root Certificate profile with the Root CA cert to all devices.","cost":25,"penalty":-25},{"id":"hint4","text":"After deploying root CA, devices will trust the certificate chain and WiFi will connect.","cost":50,"penalty":-50}],
        eap_type_wrong:[{"id":"hint1","text":"WiFi connects then drops. Check RADIUS logs for EAP negotiation errors.","cost":0,"penalty":0},{"id":"hint2","text":"WiFi profile uses PEAP but RADIUS expects EAP-TLS. Incompatible EAP types.","cost":10,"penalty":-10},{"id":"hint3","text":"Change WiFi profile from PEAP to EAP-TLS and link to the client certificate profile.","cost":25,"penalty":-25},{"id":"hint4","text":"After updating, sync devices. EAP-TLS will use the deployed certificate for authentication.","cost":50,"penalty":-50}],
        user_vs_device_cert:[{"id":"hint1","text":"Shared devices need WiFi before login. Can a user cert work at the login screen?","cost":0,"penalty":0},{"id":"hint2","text":"User certs require user login. Shared devices need Device certs (available at enrollment).","cost":10,"penalty":-10},{"id":"hint3","text":"Change SCEP profile from User context to Device context for shared device group.","cost":25,"penalty":-25},{"id":"hint4","text":"Device certificates install during enrollment, before any user logs in. WiFi will work at login screen.","cost":50,"penalty":-50}],
        radius_reject:[{"id":"hint1","text":"All clients rejected after RADIUS cert renewal. Check what changed in the cert.","cost":0,"penalty":0},{"id":"hint2","text":"WiFi profile pins the old RADIUS cert thumbprint. New cert has a different thumbprint.","cost":10,"penalty":-10},{"id":"hint3","text":"Update WiFi profile to trust the CA instead of pinning a specific cert thumbprint.","cost":25,"penalty":-25},{"id":"hint4","text":"CA-based trust is more resilient to cert renewals. Avoid pinning specific thumbprints.","cost":50,"penalty":-50}]},
    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !MOB004Config._flagRestored) { MOB004Config._flagRestored = true; var s = MOB004Config._scenarios[engine.state._scenarioId]; if (s) MOB004Config.hints = MOB004Config._scenarioHints[s.id] || MOB004Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._scepProfileFixed = false; engine.state._rootCaFixed = false; engine.state._eapTypeFixed = false; engine.state._certContextFixed = false; engine.state._radiusRejectFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; MOB004Config._flagRestored = true; MOB004Config.hints = MOB004Config._scenarioHints[MOB004Config._scenarios[idx].id] || MOB004Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? MOB004Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _checkFix: function(engine) {
        var s = MOB004Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if(s.id==='scep_profile_fail')done=engine.state._scepProfileFixed;
        if(s.id==='root_ca_missing')done=engine.state._rootCaFixed;
        if(s.id==='eap_type_wrong')done=engine.state._eapTypeFixed;
        if(s.id==='user_vs_device_cert')done=engine.state._certContextFixed;
        if(s.id==='radius_reject')done=engine.state._radiusRejectFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'Issue resolved. Check admin console for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },
    boot: { biosLines: ['System BIOS OK', 'Processor OK', 'Memory OK', 'Storage OK', 'Loading OS...'], grubEntries: ['Windows 11 Enterprise'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'admin', label: 'Admin\nConsole', icon: 'ADM', app: 'admin_console' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'ADMIN-PC', startDir: 'C:\\Users\\Administrator', promptStyle: 'powershell', welcome: 'Windows PowerShell\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:mob004}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{id:'hint1',text:'Read the ticket.',cost:0,penalty:0},{id:'hint2',text:'Investigate with diagnostic tools.',cost:10,penalty:-10},{id:'hint3',text:'Identify root cause.',cost:25,penalty:-25},{id:'hint4',text:'Apply fix and verify.',cost:50,penalty:-50}],
    lore: { intro: 'WiFi Certificate Push — diagnose and resolve the mobile device issue.', scenario: 'Investigate, identify, fix, verify.', outro: 'Issue resolved. Document the incident.' },
    phases: [{id:'investigate',name:'Investigation',requiredFlags:[],unlocks:['diagnose'],locked:false},{id:'diagnose',name:'Diagnosis',requiredFlags:[],unlocks:['repair'],locked:true},{id:'repair',name:'Remediation',requiredFlags:[],unlocks:['verify'],locked:true},{id:'verify',name:'Verification',requiredFlags:['fixed'],unlocks:[],locked:true}],
    commands: {
        'apply-fix': function(args, term, engine) {
            var gate = MOB004Config._requireScenario(engine); if (gate) return gate;
            var s = MOB004Config._getScenario(engine);
            var k = Object.keys(s.stateOverrides)[0];
            engine.state[k] = true; engine.save();
            engine.notify('Fix applied: ' + s.fixDescription, 'success');
            MOB004Config._checkFix(engine);
            return '\nFix applied successfully.\n';
        },
        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'ADMIN-PC'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },
    onAppLaunch: function(iconDef, engine) {
        if (['admin_console'].indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': MOB004Config._openTicket(iconDef, engine); break;
            case 'admin_console': MOB004Config._openAdmin(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },
    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        MOB004Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            var s = MOB004Config._getScenario(engine);
            c.innerHTML = '<div style="color:#f59e0b; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (6300 + engine.state._scenarioId) + '</div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + MOB004Config._escHtml(s.ticketSubject) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + MOB004Config._escHtml(s.ticketDetail) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#fcd34d;">' + MOB004Config._escHtml(s.ticketExtra) + '</div></div>'
                + '<div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'
                + '<div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><button id="fixBtn" style="padding:10px 24px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Apply Fix</button></div>';
            var fb = document.getElementById('fixBtn');
            if (fb) fb.addEventListener('click', function() { var s = MOB004Config._getScenario(engine); var k = Object.keys(s.stateOverrides)[0]; engine.state[k] = true; engine.save(); engine.notify('Fix applied: ' + s.fixDescription, 'success'); MOB004Config._checkFix(engine); });
        } else {
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#f59e0b; font-weight:bold; font-size:1.1rem;">WIFI CERTIFICATE PUSH</div></div>';
            MOB004Config._scenarios.forEach(function(s, i) { h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace;"><span style="color:#f59e0b; font-weight:bold;">INC-' + (6300+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + s.name + '</div></button>'; });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { MOB004Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); MOB004Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { MOB004Config._applyScenario(engine, Math.floor(Math.random()*5)); MOB004Config._openTicket(iconDef, engine); });
        }
    },
    _openAdmin: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Admin Console', 'ADM', c);
        var s = MOB004Config._getScenario(engine);
        var h = '<div style="font-size:0.9rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">Admin Console — Diagnostic View</div>';
        if (s) h += '<div style="padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div style="font-weight:bold; color:#fcd34d;">Active: ' + s.name + '</div><div style="color:#888; font-size:0.75rem;">Status: ' + (engine.state._labComplete ? '<span style="color:#2ecc71;">RESOLVED</span>' : '<span style="color:#e74c3c;">OPEN</span>') + '</div></div>';
        if (engine.state._flagRevealed && engine._deliveredFlags) { var fv = engine._deliveredFlags[s?s.id:'']; if (fv) h += '<div style="margin-top:16px; padding:10px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px;"><div style="color:#2ecc71; font-weight:bold;">Closure Token:</div><div>' + fv + '</div></div>'; }
        c.innerHTML = h;
    }
};