/* ============================================================
   DISPATCH LAB — Box MOB002: Lost Device Protocol
   Lost Device Response — A+ Core 2
   ============================================================ */

var MOB002Config = {
    title: 'Lost Device Protocol',
    subtitle: 'Lost Device Response — A+ Core 2',
    difficulty: 'Intermediate',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_mob002',
    registryId: 'mob002-lost-device',
    trackerKey: 'lab_mob002',
    tutorialMode: true,
    tutorial: { steps: [
        { title: 'Open the Help Desk Ticket', tip: 'Read the incident details.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
        { title: 'Investigate the issue', tip: 'Use tools and commands to diagnose.', trigger: { event: 'command', match: { cmd: 'contains:Get-' }, alt: [{ event: 'window_open', match: { type: 'admin_console' } }] } },
        { title: 'Identify the root cause', tip: 'Analyze evidence to find the problem.', trigger: { event: 'command', match: { cmd: 'contains:Get-' } } },
        { title: 'Apply the fix', tip: 'Execute remediation steps.', trigger: { event: 'command', match: { cmd: 'contains:Set-' }, alt: [{ event: 'command', match: { cmd: 'contains:Restart-' } }] } },
        { title: 'Verify and capture the flag', tip: 'Confirm resolution.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
    ]},
    certObjectives: { certPath: 'A+ Core 2', mappings: [{flagId:'fixed',objective:'1.8',description:'Configure mobile device management',skill:'Remote Lock and Wipe Procedures'},{flagId:'fixed',objective:'2.7',description:'Explain common methods for device security',skill:'Lost Device Incident Response'},{flagId:'fixed',objective:'4.6',description:'Explain the process of incident response',skill:'BYOD vs Corporate Device Procedures'}] },
    _scenarios: [{id:'remote_lock',name:'Remote Lock Initiated — Verify Lock Confirmation',ticketSubject:'Employee reports company phone stolen from car — need immediate remote lock',ticketDetail:'Steve Evans (Marketing) called in to report his company iPhone was stolen from his car 20 minutes ago. He needs the device locked immediately. The phone has access to company email, Teams, and OneDrive. He does not know if the phone was password-protected at the time (he sometimes disables the lock for quick access).',ticketExtra:'IT Note: Use Intune to send a Remote Lock command to the device. Verify the lock confirmation status in the Intune device management portal. The device must be online to receive the lock command. If offline, the command will execute when the device next connects. Also set a recovery PIN for when the device is found. Document the time of the lock command for the incident report.',fixDescription:'Send Remote Lock via Intune, verify lock confirmation, set recovery PIN, document incident',stateOverrides:{_remoteLockFixed:false}},
        {id:'device_locate',name:'Device Locate via MDM — Last Known Location',ticketSubject:'Laptop left in taxi — need to locate it before data is compromised',ticketDetail:'Grace Kim (Finance) left her company laptop in a taxi 30 minutes ago. She has sensitive financial data on the device. BitLocker is enabled. She needs help locating the device. The laptop has Intune enrollment and GPS/WiFi location enabled.',ticketExtra:'IT Note: Use Intune Device Actions > Locate device to get the last known GPS coordinates. The laptop must be powered on and connected to the internet for real-time location. If last known location is available, coordinate with the user to retrieve it. If the device cannot be located within 2 hours, escalate to selective wipe. Document the location attempt and results.',fixDescription:'Use Intune Locate Device, share coordinates with user, set 2-hour retrieval deadline',stateOverrides:{_deviceLocateFixed:false}},
        {id:'selective_wipe',name:'Selective Wipe Decision — Corporate vs Full',ticketSubject:'Employee terminated — need to remove company data from BYOD phone within the hour',ticketDetail:'HR has informed IT that Tom Wright (HR Manager) was terminated effective immediately. He has a personal phone (BYOD) enrolled in Intune with corporate email, Teams, and OneDrive data. His personal photos and apps must NOT be affected. The wipe must happen before he leaves the building (within 1 hour).',ticketExtra:'IT Note: For BYOD devices, use Selective Wipe (Remove company data) NOT Full Wipe. Selective wipe removes only the Intune-managed corporate container: email, Teams, OneDrive, managed apps, and WiFi/VPN profiles. Personal data (photos, personal apps, messages) is untouched. Full wipe would factory reset the device — this is ONLY for corporate-owned devices. Send the selective wipe command and verify it completes.',fixDescription:'Send Selective Wipe (not Full Wipe) via Intune, verify corporate data removed, document',stateOverrides:{_selectiveWipeFixed:false}},
        {id:'user_notify',name:'User Notification and Documentation',ticketSubject:'Company tablet found by cleaning crew — need to identify owner and document chain of custody',ticketDetail:'The cleaning crew found a company iPad in the 3rd floor conference room after hours. The iPad is locked and shows "Hexworth Corporation" on the enrollment screen. We need to identify the owner, document the chain of custody, and return it securely.',ticketExtra:'IT Note: Use Intune to look up the device by serial number (visible on the back of the iPad or in Settings). Identify the assigned user. Document: who found it, when, where, current condition, who handled it. Contact the owner. If the device was reported lost, update the incident ticket. Follow the equipment return checklist: verify device integrity, check for tampering, scan for unauthorized modifications.',fixDescription:'Look up device in Intune, identify owner, document chain of custody, contact user',stateOverrides:{_notifyDocFixed:false}},
        {id:'byod_vs_corp',name:'BYOD vs Corporate-Owned — Different Procedures',ticketSubject:'Two lost devices reported same day — one BYOD, one corporate — different handling needed',ticketDetail:'Two incidents came in simultaneously: (1) Olivia Baker lost her personal phone (BYOD with Intune MAM) at a restaurant, and (2) Dana Torres lost a company-owned iPad that was checked out from IT inventory. Both need to be handled but the procedures are different.',ticketExtra:'IT Note: BYOD (Olivia): We can only wipe the managed app data (MAM wipe). We cannot remote lock, locate, or full-wipe a BYOD device — that is the user personal property. Advise her to use Find My iPhone to locate it herself. Corporate-owned (Dana): Full device management — remote lock immediately, attempt location, full wipe if not recovered in 24 hours, file insurance claim, update inventory. Document both incidents separately with correct procedures.',fixDescription:'BYOD: MAM wipe only, advise user. Corporate: Remote lock, locate, full wipe timeline, update inventory',stateOverrides:{_byodCorpFixed:false}}],
    _defaultHints: [{id:'hint1',text:'Open the ticket and review symptoms.',cost:0,penalty:0},{id:'hint2',text:'Use diagnostic tools to investigate.',cost:10,penalty:-10},{id:'hint3',text:'Identify root cause before fixing.',cost:25,penalty:-25},{id:'hint4',text:'Apply the fix and verify.',cost:50,penalty:-50}],
    _scenarioHints: {remote_lock:[{"id":"hint1","text":"The phone was stolen. Priority 1: send a remote lock immediately.","cost":0,"penalty":0},{"id":"hint2","text":"In Intune > Devices > Find the device > Device actions > Remote lock.","cost":10,"penalty":-10},{"id":"hint3","text":"Verify the lock status shows \"Completed.\" If \"Pending,\" the device is offline.","cost":25,"penalty":-25},{"id":"hint4","text":"Set a recovery PIN, document the incident with timestamps, and monitor for device location.","cost":50,"penalty":-50}],
        device_locate:[{"id":"hint1","text":"Laptop left in taxi. Use Intune to locate the device GPS position.","cost":0,"penalty":0},{"id":"hint2","text":"Intune > Devices > Grace laptop > Device actions > Locate device.","cost":10,"penalty":-10},{"id":"hint3","text":"Share GPS coordinates with Grace. Set a 2-hour deadline for retrieval.","cost":25,"penalty":-25},{"id":"hint4","text":"If not recovered in 2 hours, escalate to selective wipe. BitLocker protects data at rest.","cost":50,"penalty":-50}],
        selective_wipe:[{"id":"hint1","text":"Terminated employee with BYOD. What type of wipe is appropriate?","cost":0,"penalty":0},{"id":"hint2","text":"BYOD = Selective Wipe ONLY. Never full wipe a personal device.","cost":10,"penalty":-10},{"id":"hint3","text":"Intune > Devices > Device > Retire (selective wipe). This removes corporate data only.","cost":25,"penalty":-25},{"id":"hint4","text":"Verify wipe completed. Document with timestamps for HR and legal compliance.","cost":50,"penalty":-50}],
        user_notify:[{"id":"hint1","text":"Found device needs owner identification. Check the serial number in Intune.","cost":0,"penalty":0},{"id":"hint2","text":"Look up serial number in Intune > Devices > Search. Shows assigned user.","cost":10,"penalty":-10},{"id":"hint3","text":"Document chain of custody: finder, time, location, condition, handlers.","cost":25,"penalty":-25},{"id":"hint4","text":"Contact owner, update any open lost device tickets, follow return checklist.","cost":50,"penalty":-50}],
        byod_vs_corp:[{"id":"hint1","text":"Two lost devices. Key question: which is BYOD and which is corporate-owned?","cost":0,"penalty":0},{"id":"hint2","text":"BYOD: limited to MAM wipe. Corporate: full device management available.","cost":10,"penalty":-10},{"id":"hint3","text":"BYOD (Olivia): MAM wipe only, advise Find My. Corporate (Dana): Remote lock immediately.","cost":25,"penalty":-25},{"id":"hint4","text":"Document both separately. Corporate gets full wipe if not recovered in 24h.","cost":50,"penalty":-50}]},
    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !MOB002Config._flagRestored) { MOB002Config._flagRestored = true; var s = MOB002Config._scenarios[engine.state._scenarioId]; if (s) MOB002Config.hints = MOB002Config._scenarioHints[s.id] || MOB002Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._remoteLockFixed = false; engine.state._deviceLocateFixed = false; engine.state._selectiveWipeFixed = false; engine.state._notifyDocFixed = false; engine.state._byodCorpFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; MOB002Config._flagRestored = true; MOB002Config.hints = MOB002Config._scenarioHints[MOB002Config._scenarios[idx].id] || MOB002Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? MOB002Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _checkFix: function(engine) {
        var s = MOB002Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if(s.id==='remote_lock')done=engine.state._remoteLockFixed;
        if(s.id==='device_locate')done=engine.state._deviceLocateFixed;
        if(s.id==='selective_wipe')done=engine.state._selectiveWipeFixed;
        if(s.id==='user_notify')done=engine.state._notifyDocFixed;
        if(s.id==='byod_vs_corp')done=engine.state._byodCorpFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'Issue resolved. Check admin console for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },
    boot: { biosLines: ['System BIOS OK', 'Processor OK', 'Memory OK', 'Storage OK', 'Loading OS...'], grubEntries: ['Windows 11 Enterprise'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'admin', label: 'Admin\nConsole', icon: 'ADM', app: 'admin_console' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'ADMIN-PC', startDir: 'C:\\Users\\Administrator', promptStyle: 'powershell', welcome: 'Windows PowerShell\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:mob002}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{id:'hint1',text:'Read the ticket.',cost:0,penalty:0},{id:'hint2',text:'Investigate with diagnostic tools.',cost:10,penalty:-10},{id:'hint3',text:'Identify root cause.',cost:25,penalty:-25},{id:'hint4',text:'Apply fix and verify.',cost:50,penalty:-50}],
    lore: { intro: 'Lost Device Protocol — diagnose and resolve the mobile device issue.', scenario: 'Investigate, identify, fix, verify.', outro: 'Issue resolved. Document the incident.' },
    phases: [{id:'investigate',name:'Investigation',requiredFlags:[],unlocks:['diagnose'],locked:false},{id:'diagnose',name:'Diagnosis',requiredFlags:[],unlocks:['repair'],locked:true},{id:'repair',name:'Remediation',requiredFlags:[],unlocks:['verify'],locked:true},{id:'verify',name:'Verification',requiredFlags:['fixed'],unlocks:[],locked:true}],
    commands: {
        'apply-fix': function(args, term, engine) {
            var gate = MOB002Config._requireScenario(engine); if (gate) return gate;
            var s = MOB002Config._getScenario(engine);
            var k = Object.keys(s.stateOverrides)[0];
            engine.state[k] = true; engine.save();
            engine.notify('Fix applied: ' + s.fixDescription, 'success');
            MOB002Config._checkFix(engine);
            return '\nFix applied successfully.\n';
        },
        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'ADMIN-PC'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },
    onAppLaunch: function(iconDef, engine) {
        if (['admin_console'].indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': MOB002Config._openTicket(iconDef, engine); break;
            case 'admin_console': MOB002Config._openAdmin(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },
    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        MOB002Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            var s = MOB002Config._getScenario(engine);
            c.innerHTML = '<div style="color:#f59e0b; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (6100 + engine.state._scenarioId) + '</div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + MOB002Config._escHtml(s.ticketSubject) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + MOB002Config._escHtml(s.ticketDetail) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#fcd34d;">' + MOB002Config._escHtml(s.ticketExtra) + '</div></div>'
                + '<div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'
                + '<div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><button id="fixBtn" style="padding:10px 24px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Apply Fix</button></div>';
            var fb = document.getElementById('fixBtn');
            if (fb) fb.addEventListener('click', function() { var s = MOB002Config._getScenario(engine); var k = Object.keys(s.stateOverrides)[0]; engine.state[k] = true; engine.save(); engine.notify('Fix applied: ' + s.fixDescription, 'success'); MOB002Config._checkFix(engine); });
        } else {
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#f59e0b; font-weight:bold; font-size:1.1rem;">LOST DEVICE PROTOCOL</div></div>';
            MOB002Config._scenarios.forEach(function(s, i) { h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace;"><span style="color:#f59e0b; font-weight:bold;">INC-' + (6100+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + s.name + '</div></button>'; });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { MOB002Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); MOB002Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { MOB002Config._applyScenario(engine, Math.floor(Math.random()*5)); MOB002Config._openTicket(iconDef, engine); });
        }
    },
    _openAdmin: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Admin Console', 'ADM', c);
        var s = MOB002Config._getScenario(engine);
        var h = '<div style="font-size:0.9rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">Admin Console — Diagnostic View</div>';
        if (s) h += '<div style="padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div style="font-weight:bold; color:#fcd34d;">Active: ' + s.name + '</div><div style="color:#888; font-size:0.75rem;">Status: ' + (engine.state._labComplete ? '<span style="color:#2ecc71;">RESOLVED</span>' : '<span style="color:#e74c3c;">OPEN</span>') + '</div></div>';
        if (engine.state._flagRevealed && engine._deliveredFlags) { var fv = engine._deliveredFlags[s?s.id:'']; if (fv) h += '<div style="margin-top:16px; padding:10px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px;"><div style="color:#2ecc71; font-weight:bold;">Closure Token:</div><div>' + fv + '</div></div>'; }
        c.innerHTML = h;
    }
};