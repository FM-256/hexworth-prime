/* ============================================================
   DISPATCH LAB — Box IOT005: Default Credentials
   Security+ SY0-701
   5 distinct scenarios
   ============================================================ */

var IOT005Config = {

    title: 'Default Credentials',
    subtitle: 'Network Scan Reveals 15 IoT Devices with Factory Default Passwords',
    difficulty: 'Beginner',
    accent: '#06b6d4',
    storageKey: 'hexworth_lab_iot005',
    registryId: 'iot005-default-creds',
    trackerKey: 'lab_iot005',

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
        certPath: 'Security+ SY0-701',
        mappings: [{ flagId: 'fixed', objective: '2.3', description: 'Summarize authentication concepts', skill: 'IoT Credential Management' }]
    },

    _alerts: [{ id: 'IOT005-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { admin_admin: null, telnet_open: null, snmp_public: null, shared_password: null, api_key_exposed: null },

    _scenarios: [
        {
            id: 'admin_admin',
            name: 'Default Admin/Admin',
            ticketSubject: '15 IP cameras still using admin/admin factory credentials',
            ticketDetail: 'Nessus scan found 15 IP cameras with default credentials (admin/admin). These cameras are on the corporate network and accessible from any workstation. An attacker could view video feeds, pivot to the network, or use cameras for surveillance.',
            ticketExtra: 'All 15 cameras are Hikvision models deployed 6 months ago. IT never changed the default passwords during installation. Need to: (1) Change all passwords to unique strong passwords, (2) Disable unused services, (3) Move to IoT VLAN.',
            affectedHost: 0,
            fixDescription: 'Rotate all default credentials and isolate devices',
            stateOverrides: { _defaultCreds: true, _15devices: true }
        },
        {
            id: 'telnet_open',
            name: 'Telnet with Root Access',
            ticketSubject: 'Printers with telnet enabled and root access — no password',
            ticketDetail: '8 network printers have telnet (port 23) enabled with root access and no password. Anyone can telnet to these printers and gain full shell access. From the printer, lateral movement to print servers and file shares is possible.',
            ticketExtra: 'These printers were set up by a vendor who enabled telnet for remote management but never secured it. Telnet should be disabled entirely — use SSH or HTTPS management only.',
            affectedHost: 0,
            fixDescription: 'Disable telnet and enable secure management protocols',
            stateOverrides: { _telnetOpen: true, _rootNoPassword: true }
        },
        {
            id: 'snmp_public',
            name: 'SNMP Public Community String',
            ticketSubject: 'Network devices using default SNMP community string "public" — full read access',
            ticketDetail: '12 managed switches are using the default SNMP v2c community string "public" for read access and "private" for write access. An attacker could enumerate the entire network topology, read ARP tables, and even reconfigure switches using the write community string.',
            ticketExtra: 'SNMP v2c with default strings is a critical exposure. Migrate to SNMPv3 with authentication and encryption. If v2c must stay temporarily, change community strings to complex random values.',
            affectedHost: 0,
            fixDescription: 'Migrate to SNMPv3 or change community strings',
            stateOverrides: { _snmpPublic: true, _snmpWrite: true }
        },
        {
            id: 'shared_password',
            name: 'Shared Password Across Devices',
            ticketSubject: 'All 50 IoT sensors using the same hardcoded password',
            ticketDetail: 'All 50 building sensors use the same management password (SensorCorp2024!) which is documented in the vendor manual. If one device is compromised, all 50 are compromised. The password cannot be changed without a firmware update that supports per-device credentials.',
            ticketExtra: 'The vendor released firmware v3.1 that supports per-device credentials and certificate-based auth. Upgrade firmware and provision unique credentials for each sensor.',
            affectedHost: 0,
            fixDescription: 'Update firmware and provision unique per-device credentials',
            stateOverrides: { _sharedPassword: true, _vendorDefault: true }
        },
        {
            id: 'api_key_exposed',
            name: 'API Key in Firmware',
            ticketSubject: 'IoT gateway API key hardcoded in firmware and published on GitHub',
            ticketDetail: 'Security researcher reported that our IoT gateway API key is hardcoded in the device firmware and was found in a decompiled firmware image on GitHub. The key provides full read/write access to the cloud management platform. 200 devices authenticate with this key.',
            ticketExtra: 'The API key grants access to the cloud management portal for all 200 devices. Revoke the current key, generate per-device keys, and push a firmware update that stores keys in a secure element instead of plaintext firmware.',
            affectedHost: 0,
            fixDescription: 'Revoke exposed API key and implement per-device authentication',
            stateOverrides: { _apiKeyExposed: true, _githubLeak: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        admin_admin: [
            { id: 'hint1', text: 'Run "status" to see devices with default credentials.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '15 cameras with admin/admin. Accessible from corporate VLAN.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Change passwords, disable unused services, isolate on IoT VLAN.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix rotate-credentials" to secure all 15 cameras.', cost: 150, penalty: -150 }
        ],
        telnet_open: [
            { id: 'hint1', text: 'Run "status" to check printer management ports.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '8 printers with telnet open, root access, no password.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Disable telnet, enable SSH/HTTPS management instead.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix disable-telnet" to secure printer management.', cost: 150, penalty: -150 }
        ],
        snmp_public: [
            { id: 'hint1', text: 'Run "status" to check SNMP configuration.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '12 switches with public/private community strings.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Migrate to SNMPv3 with authentication and encryption.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix migrate-snmpv3" to secure SNMP.', cost: 150, penalty: -150 }
        ],
        shared_password: [
            { id: 'hint1', text: 'Run "status" to check credential uniqueness.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'All 50 sensors share one password from vendor manual.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Upgrade firmware to v3.1 for per-device credential support.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix unique-credentials" to provision per-device passwords.', cost: 150, penalty: -150 }
        ],
        api_key_exposed: [
            { id: 'hint1', text: 'Run "status" to check API key exposure.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'API key hardcoded in firmware, found on GitHub.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Revoke key, generate per-device keys, update firmware.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix revoke-rotate-keys" to secure API authentication.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !IOT005Config._flagRestored) {
            IOT005Config._flagRestored = true;
            var s = IOT005Config._scenarios[engine.state._scenarioId];
            if (s) IOT005Config.hints = IOT005Config._scenarioHints[s.id] || IOT005Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_defaultCreds','_15devices','_telnetOpen','_rootNoPassword','_snmpPublic','_snmpWrite','_sharedPassword','_vendorDefault','_apiKeyExposed','_githubLeak','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = IOT005Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        IOT005Config._flagRestored = true;
        IOT005Config.hints = IOT005Config._scenarioHints[IOT005Config._scenarios[idx].id] || IOT005Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : IOT005Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['IoT Asset Management Console', 'Loading device inventory...', 'Credential audit module loaded', 'Devices: 150 registered'], grubEntries: ['Primary', 'Recovery'], loginUser: 'Security-Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Audit\nDashboard', icon: 'AUD', app: 'dashboard' }, { id: 'ticket', label: 'Credential\nAlert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'sec-admin', hostname: 'SEC-WS01', startDir: '/home/sec-admin', promptStyle: 'linux', welcome: 'IoT Credential Audit Console\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the dashboard.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a unique cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix it and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'A credential audit has revealed multiple IoT devices with factory default passwords. These devices are vulnerable to unauthorized access and must be secured.', scenario: 'Each scenario presents a different credential vulnerability — from factory defaults to hardcoded keys and shared passwords.', outro: 'All IoT device credentials secured. Factory defaults eliminated and strong, unique credentials deployed.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = IOT005Config._requireScenario(engine); if (gate) return gate;
            var s = IOT005Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'admin_admin') return '\nDefault Admin/Admin detected. Investigate with terminal.';
            if (s && s.id === 'telnet_open') return '\nTelnet with Root Access detected. Investigate with terminal.';
            if (s && s.id === 'snmp_public') return '\nSNMP Public Community String detected. Investigate with terminal.';
            if (s && s.id === 'shared_password') return '\nShared Password Across Devices detected. Investigate with terminal.';
            if (s && s.id === 'api_key_exposed') return '\nAPI Key in Firmware detected. Investigate with terminal.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = IOT005Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = IOT005Config._getScenario(engine);
            if (s && s.id === 'admin_admin') return '\nRoot cause identified. Apply fix with keyword: undefined';
            if (s && s.id === 'telnet_open') return '\nRoot cause identified. Apply fix with keyword: undefined';
            if (s && s.id === 'snmp_public') return '\nRoot cause identified. Apply fix with keyword: undefined';
            if (s && s.id === 'shared_password') return '\nRoot cause identified. Apply fix with keyword: undefined';
            if (s && s.id === 'api_key_exposed') return '\nRoot cause identified. Apply fix with keyword: undefined';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = IOT005Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = IOT005Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'admin_admin' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nRotate all default credentials and isolate devices completed successfully.\n\n=== FLAG: IOT005{admin_admin_resolved} ===';
            }
            if (s && s.id === 'telnet_open' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nDisable telnet and enable secure management protocols completed successfully.\n\n=== FLAG: IOT005{telnet_open_resolved} ===';
            }
            if (s && s.id === 'snmp_public' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nMigrate to SNMPv3 or change community strings completed successfully.\n\n=== FLAG: IOT005{snmp_public_resolved} ===';
            }
            if (s && s.id === 'shared_password' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nUpdate firmware and provision unique per-device credentials completed successfully.\n\n=== FLAG: IOT005{shared_password_resolved} ===';
            }
            if (s && s.id === 'api_key_exposed' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nRevoke exposed API key and implement per-device authentication completed successfully.\n\n=== FLAG: IOT005{api_key_exposed_resolved} ===';
            }
            return '\nUsage: fix <action>. Run "investigate" first for available actions.';
        },


        whoami: function() { return 'sec-admin'; },
        hostname: function() { return 'SEC-WS01'; },
        clear: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ls: function() { return 'configs  logs  scripts  tools'; },
        dir: function() { return ' Directory of current folder\n  configs  logs  scripts  tools'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app !== 'ticket' && iconDef.app !== 'terminal' && iconDef.app !== 'hints' && iconDef.app !== 'reset_lab' && !engine.state._scenarioSelected) { engine.notify('Open the Alert first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': IOT005Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: IOT005Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Default Credentials Alert', 'TKT', c);
        IOT005Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) IOT005Config._renderTicket(engine, c); else IOT005Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Scan — "15 cameras with default admin/admin credentials"','Scan — "8 printers with telnet root access, no password"','Audit — "12 switches with default SNMP public/private strings"','Audit — "50 sensors sharing one hardcoded password"','Research — "API key hardcoded in firmware, found on GitHub"'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#06b6d4;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        IOT005Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#06b6d4;font-weight:bold;">IOT005-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#06b6d4;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { IOT005Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); IOT005Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { IOT005Config._applyScenario(engine, Math.floor(Math.random()*IOT005Config._scenarios.length)); IOT005Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = IOT005Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#06b6d4;font-weight:bold;font-size:1rem;">INCIDENT #IOT005-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+IOT005Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+IOT005Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #06b6d433;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+IOT005Config._escHtml(s.ticketExtra)+'</div></div>':'')
            +'<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;color:#2ecc71;font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openInfoWin(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:16px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, iconDef.label.replace('\n',' '), iconDef.icon, c);
        c.innerHTML = '<div style="color:#06b6d4;font-weight:bold;font-size:1rem;margin-bottom:12px;">'+iconDef.label.replace('\n',' ')+'</div><div style="color:#888;">Use terminal commands for diagnostics.</div>';
    }
};