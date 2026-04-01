/* ============================================================
   DISPATCH LAB — Box SEC009: Privilege Escalation
   Security+ SY0-701 / CySA+
   5 distinct scenarios
   ============================================================ */

var SEC009Config = {

    title: 'Privilege Escalation',
    subtitle: 'Junior Admin Account Suddenly Has Domain Admin Privileges',
    difficulty: 'Advanced',
    accent: '#dc2626',
    storageKey: 'hexworth_lab_sec009',
    registryId: 'sec009-privilege-escalation',
    trackerKey: 'lab_sec009',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Alert', tip: 'Read the incident report.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check the Dashboard', tip: 'Review system status.', trigger: { event: 'window_open', match: { type: 'dashboard' } } },
            { title: 'Investigate', tip: 'Use terminal tools to diagnose.', trigger: { event: 'command', match: { cmd: 'contains:status' } } },
            { title: 'Apply the fix', tip: 'Resolve the issue.', trigger: { event: 'command', match: { cmd: 'contains:fix' } } },
            { title: 'Capture the flag', tip: 'Flag appears after fix.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Security+ SY0-701 / CySA+',
        mappings: [{ flagId: 'fixed', objective: '2.4', description: 'Analyze indicators of compromise', skill: 'AD Privilege Escalation Investigation' }]
    },

    _alerts: [{ id: 'SEC009-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { group_mod: null, golden_ticket: null, dcsync: null, shadow_admin: null, laps_bypass: null },

    _scenarios: [
        {
            id: 'group_mod',
            name: 'Unauthorized Group Modification',
            ticketSubject: 'Junior admin added to Domain Admins — no change ticket exists',
            ticketDetail: 'AD audit detected that user jthomas (Junior IT Support, Tier 1) was added to the Domain Admins group at 02:47 last night. No change request exists for this modification. The users normal group membership is Help Desk Operators and Workstation Admins. The account that made the change was svc-backup (a service account).',
            ticketExtra: 'SOC Note: The svc-backup account should not have rights to modify Domain Admins. Possible scenarios: (1) Service account compromised, (2) Privilege escalation through misconfigured delegation, (3) Golden ticket attack. Check AD audit logs for Event ID 4728 (member added to security group) and 4624 (logon events) for svc-backup.',
            affectedHost: 0,
            fixDescription: 'Remove unauthorized group membership, investigate service account compromise',
            stateOverrides: { _groupMod: true, _svcAccountUsed: true }
        },
        {
            id: 'golden_ticket',
            name: 'Golden Ticket Detected',
            ticketSubject: 'Kerberos TGT with impossible lifetime — possible golden ticket attack',
            ticketDetail: 'AD monitoring detected a Kerberos TGT (Ticket Granting Ticket) for user "administrator" with a lifetime of 10 years. Normal TGT lifetime is 10 hours. This is a signature of a golden ticket attack — the attacker has the KRBTGT hash and can forge tickets for any user with any lifetime.',
            ticketExtra: 'SOC Note: Golden ticket indicators: (1) TGT lifetime > domain policy (10h), (2) TGT issued without corresponding AS-REQ, (3) Encryption type RC4 (default for golden tickets). The KRBTGT password needs to be reset TWICE (due to password history) to invalidate all golden tickets. Check DC security logs.',
            affectedHost: 0,
            fixDescription: 'Reset KRBTGT twice, invalidate all tickets, hunt for compromised DC',
            stateOverrides: { _goldenTicket: true, _krbtgtCompromised: true }
        },
        {
            id: 'dcsync',
            name: 'DCSync Attack',
            ticketSubject: 'Service account performing DCSync to extract password hashes',
            ticketDetail: 'Network monitoring detected DCSync replication requests (DRS_GetNCChanges) from workstation WS-DEV-03 (10.0.5.30). Legitimate DC replication only occurs between domain controllers. A compromised account with replication rights is extracting NTLM hashes for all domain accounts.',
            ticketExtra: 'SOC Note: DCSync uses the MS-DRSR protocol to replicate AD objects. The requests are coming from a non-DC host, which means a compromised account with "Replicating Directory Changes" permission is being used. Check who has this permission and revoke it from non-DC accounts.',
            affectedHost: 0,
            fixDescription: 'Stop DCSync, revoke replication permissions, reset affected passwords',
            stateOverrides: { _dcSync: true, _hashExtraction: true }
        },
        {
            id: 'shadow_admin',
            name: 'Shadow Admin Accounts',
            ticketSubject: 'Hidden admin accounts with domain admin privileges discovered in OU',
            ticketDetail: 'AD cleanup audit discovered 3 user accounts in a hidden OU (OU=Maintenance,OU=System) with Domain Admin privileges. These accounts are not in the IT team roster and were created 6 months ago. Account names: maint-svc01, maint-svc02, maint-svc03. All have logged in within the last 24 hours.',
            ticketExtra: 'SOC Note: These appear to be persistence accounts created by an attacker or a rogue admin. The OU has inheritance blocked which hid them from normal AD queries. All 3 accounts have: (1) Domain Admin, (2) Schema Admin, (3) Enterprise Admin. Password last set 6 months ago. Creator: unknown (log rotation purged).',
            affectedHost: 0,
            fixDescription: 'Disable shadow accounts, remove from admin groups, investigate creation',
            stateOverrides: { _shadowAdmins: true, _hiddenOU: true }
        },
        {
            id: 'laps_bypass',
            name: 'LAPS Bypass',
            ticketSubject: 'Local admin passwords not rotating — LAPS GPO not applying to 40% of machines',
            ticketDetail: 'Microsoft LAPS (Local Administrator Password Solution) audit shows that 120 of 300 workstations have not rotated their local admin password in over 90 days. These machines all have the same local admin password (set during imaging). LAPS GPO exists but is not applying due to a WMI filter error.',
            ticketExtra: 'IT Note: LAPS depends on a GPO with a WMI filter for targeting. The WMI filter has a syntax error causing it to fail on machines with Windows 11 23H2. These 120 machines all share local admin password Hexw0rth2025! which was the imaging default. Fix the WMI filter and force LAPS rotation.',
            affectedHost: 0,
            fixDescription: 'Fix LAPS GPO WMI filter and force password rotation',
            stateOverrides: { _lapsNotApplying: true, _sharedLocalAdmin: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        group_mod: [
            { id: 'hint1', text: 'Run "status" to review AD group change audit.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'jthomas added to Domain Admins via svc-backup at 02:47. No change ticket.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Remove from group, reset svc-backup, investigate how it was compromised.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix remove-investigate" to contain and investigate.', cost: 150, penalty: -150 }
        ],
        golden_ticket: [
            { id: 'hint1', text: 'Run "status" to check for golden ticket indicators.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'TGT with 10-year lifetime. KRBTGT hash compromised.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Reset KRBTGT password twice. Invalidate all existing tickets.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix reset-krbtgt" to invalidate golden tickets.', cost: 150, penalty: -150 }
        ],
        dcsync: [
            { id: 'hint1', text: 'Run "status" to check for unauthorized replication.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'DCSync from non-DC workstation extracting password hashes.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Stop replication, revoke permissions, reset all passwords.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix stop-dcsync" to halt hash extraction and remediate.', cost: 150, penalty: -150 }
        ],
        shadow_admin: [
            { id: 'hint1', text: 'Run "status" to search for unauthorized admin accounts.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '3 hidden admin accounts in obscured OU with full domain privileges.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Disable accounts, remove admin rights, investigate who created them.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix disable-shadow-admins" to remove unauthorized access.', cost: 150, penalty: -150 }
        ],
        laps_bypass: [
            { id: 'hint1', text: 'Run "status" to check LAPS compliance.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '120 machines not rotating passwords. WMI filter syntax error.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix WMI filter for Win11 23H2 and force LAPS rotation.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix fix-laps-gpo" to repair LAPS and rotate passwords.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SEC009Config._flagRestored) {
            SEC009Config._flagRestored = true;
            var s = SEC009Config._scenarios[engine.state._scenarioId];
            if (s) SEC009Config.hints = SEC009Config._scenarioHints[s.id] || SEC009Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_groupMod','_svcAccountUsed','_goldenTicket','_krbtgtCompromised','_dcSync','_hashExtraction','_shadowAdmins','_hiddenOU','_lapsNotApplying','_sharedLocalAdmin','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = SEC009Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        SEC009Config._flagRestored = true;
        SEC009Config.hints = SEC009Config._scenarioHints[SEC009Config._scenarios[idx].id] || SEC009Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : SEC009Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['System Boot...', 'Loading diagnostic tools...', 'Monitoring active', 'Console ready'], grubEntries: ['Primary', 'Recovery'], loginUser: 'Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Dashboard', icon: 'DSH', app: 'dashboard' }, { id: 'logs', label: 'Log\nViewer', icon: 'LOG', app: 'logs' }, { id: 'ticket', label: 'Alert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'admin', hostname: 'WS-01', startDir: '/home/admin', promptStyle: 'linux', welcome: 'Privilege Escalation Diagnostic Console\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the dashboard.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a unique cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix it and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'A privilege escalation incident has been detected. Investigate and respond systematically.', scenario: 'Each scenario presents a different aspect of privilege escalation — requiring thorough investigation and remediation.', outro: 'Incident resolved. Your systematic response contained and remediated the privilege escalation effectively.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = SEC009Config._requireScenario(engine); if (gate) return gate;
            var s = SEC009Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'group_mod') return '\nUnauthorized Group Modification: Active incident. Investigate.';
            if (s && s.id === 'golden_ticket') return '\nGolden Ticket Detected: Active incident. Investigate.';
            if (s && s.id === 'dcsync') return '\nDCSync Attack: Active incident. Investigate.';
            if (s && s.id === 'shadow_admin') return '\nShadow Admin Accounts: Active incident. Investigate.';
            if (s && s.id === 'laps_bypass') return '\nLAPS Bypass: Active incident. Investigate.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = SEC009Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = SEC009Config._getScenario(engine);
            if (s && s.id === 'group_mod') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'golden_ticket') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'dcsync') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'shadow_admin') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'laps_bypass') return '\nRoot cause identified. Apply fix.';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = SEC009Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = SEC009Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'group_mod' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nRemove unauthorized group membership, investigate service account compromise completed.\n\n=== FLAG: SEC009{group_mod_resolved} ===';
            }
            if (s && s.id === 'golden_ticket' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nReset KRBTGT twice, invalidate all tickets, hunt for compromised DC completed.\n\n=== FLAG: SEC009{golden_ticket_resolved} ===';
            }
            if (s && s.id === 'dcsync' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nStop DCSync, revoke replication permissions, reset affected passwords completed.\n\n=== FLAG: SEC009{dcsync_resolved} ===';
            }
            if (s && s.id === 'shadow_admin' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nDisable shadow accounts, remove from admin groups, investigate creation completed.\n\n=== FLAG: SEC009{shadow_admin_resolved} ===';
            }
            if (s && s.id === 'laps_bypass' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nFix LAPS GPO WMI filter and force password rotation completed.\n\n=== FLAG: SEC009{laps_bypass_resolved} ===';
            }
            return '\nUsage: fix <action>. Run "investigate" first for available actions.';
        },


        whoami: function() { return 'admin'; },
        hostname: function() { return 'WS-01'; },
        clear: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ls: function() { return 'configs  logs  scripts  tools'; },
        dir: function() { return ' Directory of current folder\n  configs  logs  scripts  tools'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app !== 'ticket' && iconDef.app !== 'terminal' && iconDef.app !== 'hints' && iconDef.app !== 'reset_lab' && !engine.state._scenarioSelected) { engine.notify('Open the Alert first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': SEC009Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: SEC009Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Privilege Escalation Alert', 'TKT', c);
        SEC009Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) SEC009Config._renderTicket(engine, c); else SEC009Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Team — "Junior admin added to Domain Admins — no change ticket exist..."','Team — "Kerberos TGT with impossible lifetime — possible golden tick..."','Team — "Service account performing DCSync to extract password hashes..."','Team — "Hidden admin accounts with domain admin privileges discovere..."','Team — "Local admin passwords not rotating — LAPS GPO not applying t..."'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#dc2626;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        SEC009Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#dc2626;font-weight:bold;">SEC009-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#dc2626;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { SEC009Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); SEC009Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { SEC009Config._applyScenario(engine, Math.floor(Math.random()*SEC009Config._scenarios.length)); SEC009Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = SEC009Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#dc2626;font-weight:bold;font-size:1rem;">INCIDENT #SEC009-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+SEC009Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+SEC009Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #dc262633;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+SEC009Config._escHtml(s.ticketExtra)+'</div></div>':'')
            +'<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;color:#2ecc71;font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openInfoWin(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:16px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, iconDef.label.replace('\n',' '), iconDef.icon, c);
        c.innerHTML = '<div style="color:#dc2626;font-weight:bold;font-size:1rem;margin-bottom:12px;">'+iconDef.label.replace('\n',' ')+'</div><div style="color:#888;">Use terminal commands for diagnostics.</div>';
    }
};