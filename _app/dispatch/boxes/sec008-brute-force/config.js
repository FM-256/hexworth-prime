/* ============================================================
   DISPATCH LAB — Box SEC008: Brute Force Attack
   Security+ SY0-701 / CySA+
   5 distinct scenarios
   ============================================================ */

var SEC008Config = {

    title: 'Brute Force Attack',
    subtitle: '50,000 Failed SSH Login Attempts from Multiple IPs',
    difficulty: 'Intermediate',
    accent: '#dc2626',
    storageKey: 'hexworth_lab_sec008',
    registryId: 'sec008-brute-force',
    trackerKey: 'lab_sec008',

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
        mappings: [{ flagId: 'fixed', objective: '2.4', description: 'Analyze indicators of malicious activity', skill: 'Brute Force Mitigation & SSH Hardening' }]
    },

    _alerts: [{ id: 'SEC008-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { distributed_brute: null, password_spray: null, credential_stuff: null, rdp_brute: null, api_brute: null },

    _scenarios: [
        {
            id: 'distributed_brute',
            name: 'Distributed Brute Force',
            ticketSubject: '50,000 failed SSH logins from 200+ IPs across 30 countries',
            ticketDetail: 'Auth logs show 50,000 failed SSH login attempts in the last 6 hours from 200+ unique IPs across 30 countries. The attack is distributed to avoid per-IP rate limiting. Target is the SSH server at 203.0.113.10 (jump box). Usernames being tried: root, admin, ubuntu, deploy, jenkins.',
            ticketExtra: 'SOC Note: This is a distributed brute force / credential stuffing attack. Current defenses: (1) No fail2ban installed, (2) Password auth enabled (should be key-only), (3) No GeoIP blocking, (4) No rate limiting. Immediate: block attacking IPs, long-term: SSH keys only.',
            affectedHost: 0,
            fixDescription: 'Install fail2ban, enforce SSH key auth, block attacking IPs',
            stateOverrides: { _bruteForce: true, _noFail2ban: true }
        },
        {
            id: 'password_spray',
            name: 'Password Spray',
            ticketSubject: 'Low-and-slow password spray targeting all domain accounts',
            ticketDetail: 'Unlike brute force, this attack tries 1-2 common passwords (Summer2026!, Welcome1) against ALL 500 domain accounts. Only 2 attempts per account per day to stay under lockout threshold. Attack has been running for 5 days. 12 accounts have been compromised so far.',
            ticketExtra: 'SOC Note: Password spray stays under the 5-attempt lockout threshold. 12 accounts compromised with password Summer2026! — all had weak passwords. Need: (1) Force password reset for compromised accounts, (2) Enable Azure AD smart lockout, (3) Deploy MFA, (4) Block common passwords.',
            affectedHost: 0,
            fixDescription: 'Reset compromised accounts, deploy MFA, block common passwords',
            stateOverrides: { _passwordSpray: true, _accountsCompromised: true }
        },
        {
            id: 'credential_stuff',
            name: 'Credential Stuffing',
            ticketSubject: 'Stolen credentials from data breach being tested against our VPN portal',
            ticketDetail: '200,000 login attempts against the VPN portal using username/password pairs from the MegaCorp breach (leaked last month). The attacker is testing if employees reused their MegaCorp passwords. 8 successful logins detected — these employees used the same password.',
            ticketExtra: 'SOC Note: 8 employees had passwords matching the MegaCorp breach dump. All 8 had active VPN sessions for 2-15 minutes before detection. Check for data access during those sessions. Force password reset for all 8 and check all employees against the breach dump.',
            affectedHost: 0,
            fixDescription: 'Reset compromised accounts, check for data access, deploy breach monitoring',
            stateOverrides: { _credentialStuff: true, _breachReuse: true }
        },
        {
            id: 'rdp_brute',
            name: 'RDP Brute Force',
            ticketSubject: 'Exposed RDP server under brute force — no NLA required',
            ticketDetail: 'An RDP server (10.0.5.20) was accidentally exposed to the internet through a firewall rule error. It has been under brute force attack for 48 hours with 30,000 attempts. NLA (Network Level Authentication) is disabled, so attackers reach the Windows login screen directly, making attacks faster.',
            ticketExtra: 'SOC Note: RDP without NLA is a high-risk exposure. Attackers can see the login prompt before authenticating. Immediate: (1) Remove internet-facing firewall rule, (2) Enable NLA, (3) Deploy RDP gateway, (4) Enable account lockout. Long-term: RDP should only be accessible through VPN.',
            affectedHost: 0,
            fixDescription: 'Remove internet exposure, enable NLA, deploy RDP gateway',
            stateOverrides: { _rdpExposed: true, _noNLA: true }
        },
        {
            id: 'api_brute',
            name: 'API Brute Force',
            ticketSubject: 'REST API under automated credential testing — no rate limiting',
            ticketDetail: 'The customer-facing REST API at api.hexworth.com is receiving 10,000 authentication requests per minute from a botnet. The API has no rate limiting, no CAPTCHA, and returns different error messages for "user not found" vs "wrong password" (user enumeration vulnerability).',
            ticketExtra: 'Dev Note: API endpoints affected: /api/v1/auth/login and /api/v1/auth/token. The different error messages allow attackers to first enumerate valid usernames, then brute force passwords. Fix: (1) Rate limit to 10 req/min per IP, (2) Uniform error messages, (3) Add CAPTCHA after 3 failures, (4) Deploy API gateway with WAF.',
            affectedHost: 0,
            fixDescription: 'Implement API rate limiting and fix user enumeration',
            stateOverrides: { _apiBrute: true, _noRateLimit: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        distributed_brute: [
            { id: 'hint1', text: 'Run "status" to review SSH auth log summary.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '50,000 attempts from 200+ IPs. No fail2ban or rate limiting.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Install fail2ban, switch to key-only auth, block attacking ranges.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix harden-ssh" to implement all SSH defenses.', cost: 150, penalty: -150 }
        ],
        password_spray: [
            { id: 'hint1', text: 'Run "status" to review the password spray pattern.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '12 accounts compromised with Summer2026! Spray attack ongoing.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Reset compromised accounts, enable smart lockout, deploy MFA.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix spray-defense" to implement anti-spray measures.', cost: 150, penalty: -150 }
        ],
        credential_stuff: [
            { id: 'hint1', text: 'Run "status" to review credential stuffing results.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '8 accounts compromised from MegaCorp breach reuse.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Reset passwords, audit VPN sessions, check breach exposure.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix breach-response" to respond to credential stuffing.', cost: 150, penalty: -150 }
        ],
        rdp_brute: [
            { id: 'hint1', text: 'Run "status" to check RDP exposure and auth attempts.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'RDP exposed to internet without NLA. 30,000 attempts in 48h.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Remove firewall rule, enable NLA, require VPN for RDP.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix secure-rdp" to lock down RDP access.', cost: 150, penalty: -150 }
        ],
        api_brute: [
            { id: 'hint1', text: 'Run "status" to review API authentication traffic.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '10,000 req/min with user enumeration via error messages.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Add rate limiting, uniform errors, CAPTCHA, and API gateway.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix api-hardening" to protect the API.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SEC008Config._flagRestored) {
            SEC008Config._flagRestored = true;
            var s = SEC008Config._scenarios[engine.state._scenarioId];
            if (s) SEC008Config.hints = SEC008Config._scenarioHints[s.id] || SEC008Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_bruteForce','_noFail2ban','_passwordSpray','_accountsCompromised','_credentialStuff','_breachReuse','_rdpExposed','_noNLA','_apiBrute','_noRateLimit','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = SEC008Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        SEC008Config._flagRestored = true;
        SEC008Config.hints = SEC008Config._scenarioHints[SEC008Config._scenarios[idx].id] || SEC008Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : SEC008Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['System Boot...', 'Loading diagnostic tools...', 'Monitoring active', 'Console ready'], grubEntries: ['Primary', 'Recovery'], loginUser: 'Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Dashboard', icon: 'DSH', app: 'dashboard' }, { id: 'logs', label: 'Log\nViewer', icon: 'LOG', app: 'logs' }, { id: 'ticket', label: 'Alert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'admin', hostname: 'WS-01', startDir: '/home/admin', promptStyle: 'linux', welcome: 'Brute Force Attack Diagnostic Console\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the dashboard.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a unique cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix it and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'A brute force attack incident has been detected. Investigate and respond systematically.', scenario: 'Each scenario presents a different aspect of brute force attack — requiring thorough investigation and remediation.', outro: 'Incident resolved. Your systematic response contained and remediated the brute force attack effectively.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = SEC008Config._requireScenario(engine); if (gate) return gate;
            var s = SEC008Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'distributed_brute') return '\nDistributed Brute Force: Active incident. Investigate.';
            if (s && s.id === 'password_spray') return '\nPassword Spray: Active incident. Investigate.';
            if (s && s.id === 'credential_stuff') return '\nCredential Stuffing: Active incident. Investigate.';
            if (s && s.id === 'rdp_brute') return '\nRDP Brute Force: Active incident. Investigate.';
            if (s && s.id === 'api_brute') return '\nAPI Brute Force: Active incident. Investigate.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = SEC008Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = SEC008Config._getScenario(engine);
            if (s && s.id === 'distributed_brute') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'password_spray') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'credential_stuff') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'rdp_brute') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'api_brute') return '\nRoot cause identified. Apply fix.';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = SEC008Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = SEC008Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'distributed_brute' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nInstall fail2ban, enforce SSH key auth, block attacking IPs completed.\n\n=== FLAG: SEC008{distributed_brute_resolved} ===';
            }
            if (s && s.id === 'password_spray' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nReset compromised accounts, deploy MFA, block common passwords completed.\n\n=== FLAG: SEC008{password_spray_resolved} ===';
            }
            if (s && s.id === 'credential_stuff' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nReset compromised accounts, check for data access, deploy breach monitoring completed.\n\n=== FLAG: SEC008{credential_stuff_resolved} ===';
            }
            if (s && s.id === 'rdp_brute' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nRemove internet exposure, enable NLA, deploy RDP gateway completed.\n\n=== FLAG: SEC008{rdp_brute_resolved} ===';
            }
            if (s && s.id === 'api_brute' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nImplement API rate limiting and fix user enumeration completed.\n\n=== FLAG: SEC008{api_brute_resolved} ===';
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
            case 'ticket': SEC008Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: SEC008Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Brute Force Attack Alert', 'TKT', c);
        SEC008Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) SEC008Config._renderTicket(engine, c); else SEC008Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Team — "50,000 failed SSH logins from 200+ IPs across 30 countries..."','Team — "Low-and-slow password spray targeting all domain accounts..."','Team — "Stolen credentials from data breach being tested against our..."','Team — "Exposed RDP server under brute force — no NLA required..."','Team — "REST API under automated credential testing — no rate limiti..."'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#dc2626;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        SEC008Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#dc2626;font-weight:bold;">SEC008-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#dc2626;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { SEC008Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); SEC008Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { SEC008Config._applyScenario(engine, Math.floor(Math.random()*SEC008Config._scenarios.length)); SEC008Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = SEC008Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#dc2626;font-weight:bold;font-size:1rem;">INCIDENT #SEC008-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+SEC008Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+SEC008Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #dc262633;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+SEC008Config._escHtml(s.ticketExtra)+'</div></div>':'')
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