/* ============================================================
   DISPATCH LAB — Box SEC007: Certificate Crisis
   Security+ SY0-701
   5 distinct scenarios
   ============================================================ */

var SEC007Config = {

    title: 'Certificate Crisis',
    subtitle: 'Web Server SSL Certificate Expires in 24 Hours',
    difficulty: 'Intermediate',
    accent: '#dc2626',
    storageKey: 'hexworth_lab_sec007',
    registryId: 'sec007-certificate-expiry',
    trackerKey: 'lab_sec007',

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
        mappings: [{ flagId: 'fixed', objective: '3.7', description: 'Implement PKI concepts', skill: 'SSL/TLS Certificate Management' }]
    },

    _alerts: [{ id: 'SEC007-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { web_cert_expiry: null, chain_incomplete: null, wildcard_vuln: null, hsts_missing: null, ocsp_stapling: null },

    _scenarios: [
        {
            id: 'web_cert_expiry',
            name: 'Web Server Cert Expiring',
            ticketSubject: 'Production web server SSL certificate expires in 24 hours — 50,000 daily users affected',
            ticketDetail: 'The SSL certificate for www.hexworth.com expires tomorrow at 23:59 UTC. The site serves 50,000 daily users. The certificate was manually installed 1 year ago and no auto-renewal was configured. The previous admin who managed certificates left the company 2 months ago. No one has been monitoring cert expiry.',
            ticketExtra: 'Ops Note: The cert is from DigiCert. The CSR and private key are on the web server. We need to renew through DigiCert, validate domain ownership, and install before expiry. Also set up monitoring and consider Letss Encrypt with auto-renewal for the future.',
            affectedHost: 0,
            fixDescription: 'Renew certificate and configure auto-renewal monitoring',
            stateOverrides: { _certExpiring: true, _noAutoRenew: true }
        },
        {
            id: 'chain_incomplete',
            name: 'Incomplete Certificate Chain',
            ticketSubject: 'Users getting SSL warnings — intermediate certificate missing from chain',
            ticketDetail: 'Help desk receiving 200+ tickets about SSL security warnings when accessing internal apps.hexworth.com. The server cert is valid but the intermediate CA certificate is missing from the chain. Modern browsers cannot validate the chain without it. Some browsers cache intermediates so it works intermittently.',
            ticketExtra: 'Ops Note: Server has: (1) server cert, (2) root CA cert. MISSING: intermediate CA cert. The chain should be: server -> intermediate -> root. Download the intermediate from the CA and install it. Also check OCSP stapling configuration.',
            affectedHost: 0,
            fixDescription: 'Install missing intermediate certificate to complete the chain',
            stateOverrides: { _chainIncomplete: true, _intermediateMissing: true }
        },
        {
            id: 'wildcard_vuln',
            name: 'Wildcard Cert Vulnerability',
            ticketSubject: 'Wildcard certificate private key found in public GitHub repository',
            ticketDetail: 'Security researcher reported that the private key for *.hexworth.com wildcard certificate was committed to a public GitHub repo by a developer. The key has been public for 3 days. Any attacker with this key can impersonate any hexworth.com subdomain. Certificate must be revoked and replaced immediately.',
            ticketExtra: 'Security Note: CRITICAL — wildcard private key exposed. All subdomains affected: www, mail, vpn, api, portal, etc. Steps: (1) Revoke current cert immediately, (2) Generate new key pair, (3) Get new cert issued, (4) Install on all servers, (5) Remove from GitHub, (6) Scan for any MITM attacks during exposure window.',
            affectedHost: 0,
            fixDescription: 'Revoke compromised cert, generate new key, reissue and install',
            stateOverrides: { _keyExposed: true, _wildcardCompromised: true }
        },
        {
            id: 'hsts_missing',
            name: 'HSTS Not Configured',
            ticketSubject: 'Site accessible over HTTP — HSTS header missing allowing SSL stripping attacks',
            ticketDetail: 'Penetration test found that hexworth.com does not send HSTS (HTTP Strict Transport Security) headers. The site is accessible over both HTTP and HTTPS. An attacker on the network can perform SSL stripping (sslstrip) to downgrade connections from HTTPS to HTTP and intercept credentials.',
            ticketExtra: 'PenTest Note: No HSTS header on any response. HTTP to HTTPS redirect exists but redirect can be intercepted. Configure HSTS with: max-age=31536000; includeSubDomains; preload. Then submit to HSTS preload list for browser-level enforcement.',
            affectedHost: 0,
            fixDescription: 'Configure HSTS headers and submit for preload',
            stateOverrides: { _noHSTS: true, _sslStripVuln: true }
        },
        {
            id: 'ocsp_stapling',
            name: 'OCSP Stapling Failure',
            ticketSubject: 'Certificate revocation check failing — OCSP responder unreachable causing slow page loads',
            ticketDetail: 'Users report 3-5 second delays loading hexworth.com. The SSL certificate OCSP responder (ocsp.digicert.com) is responding slowly (2-3 seconds). Without OCSP stapling, every browser makes its own OCSP request, adding latency. Some browsers are soft-failing and not checking revocation at all.',
            ticketExtra: 'Ops Note: OCSP stapling is not configured on the web server. Each of 50,000 daily users triggers a separate OCSP check. Enable OCSP stapling so the server pre-fetches and caches the OCSP response, eliminating per-user OCSP requests and reducing page load by 2-3 seconds.',
            affectedHost: 0,
            fixDescription: 'Enable OCSP stapling on the web server',
            stateOverrides: { _noOCSPStaple: true, _slowRevCheck: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        web_cert_expiry: [
            { id: 'hint1', text: 'Run "status" to check certificate expiry details.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Cert expires in 24h. No auto-renewal. Previous admin left.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Renew through CA, install new cert, set up monitoring.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix renew-cert" to renew and install the certificate.', cost: 150, penalty: -150 }
        ],
        chain_incomplete: [
            { id: 'hint1', text: 'Run "status" to check the certificate chain.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Intermediate CA certificate missing from the chain.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Download and install the intermediate cert from the CA.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix install-intermediate" to complete the chain.', cost: 150, penalty: -150 }
        ],
        wildcard_vuln: [
            { id: 'hint1', text: 'Run "status" to assess the scope of key exposure.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Wildcard private key public for 3 days. All subdomains at risk.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Revoke current cert, generate new key, reissue on all servers.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix revoke-reissue" to replace the compromised certificate.', cost: 150, penalty: -150 }
        ],
        hsts_missing: [
            { id: 'hint1', text: 'Run "status" to check HSTS header configuration.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'No HSTS header. SSL stripping attack possible.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Add HSTS header and submit for browser preload list.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix enable-hsts" to configure HSTS and submit preload.', cost: 150, penalty: -150 }
        ],
        ocsp_stapling: [
            { id: 'hint1', text: 'Run "status" to check OCSP configuration.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'No OCSP stapling. Each user makes separate 2-3s OCSP request.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable OCSP stapling for server-side OCSP response caching.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix enable-ocsp-stapling" to configure stapling.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SEC007Config._flagRestored) {
            SEC007Config._flagRestored = true;
            var s = SEC007Config._scenarios[engine.state._scenarioId];
            if (s) SEC007Config.hints = SEC007Config._scenarioHints[s.id] || SEC007Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_certExpiring','_noAutoRenew','_chainIncomplete','_intermediateMissing','_keyExposed','_wildcardCompromised','_noHSTS','_sslStripVuln','_noOCSPStaple','_slowRevCheck','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = SEC007Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        SEC007Config._flagRestored = true;
        SEC007Config.hints = SEC007Config._scenarioHints[SEC007Config._scenarios[idx].id] || SEC007Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : SEC007Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['System Boot...', 'Loading diagnostic tools...', 'Monitoring active', 'Console ready'], grubEntries: ['Primary', 'Recovery'], loginUser: 'Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Dashboard', icon: 'DSH', app: 'dashboard' }, { id: 'logs', label: 'Log\nViewer', icon: 'LOG', app: 'logs' }, { id: 'ticket', label: 'Alert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'admin', hostname: 'WS-01', startDir: '/home/admin', promptStyle: 'linux', welcome: 'Certificate Crisis Diagnostic Console\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the dashboard.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a unique cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix it and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'A certificate crisis incident has been detected. Investigate and respond systematically.', scenario: 'Each scenario presents a different aspect of certificate crisis — requiring thorough investigation and remediation.', outro: 'Incident resolved. Your systematic response contained and remediated the certificate crisis effectively.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = SEC007Config._requireScenario(engine); if (gate) return gate;
            var s = SEC007Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'web_cert_expiry') return '\nWeb Server Cert Expiring: Active incident. Investigate.';
            if (s && s.id === 'chain_incomplete') return '\nIncomplete Certificate Chain: Active incident. Investigate.';
            if (s && s.id === 'wildcard_vuln') return '\nWildcard Cert Vulnerability: Active incident. Investigate.';
            if (s && s.id === 'hsts_missing') return '\nHSTS Not Configured: Active incident. Investigate.';
            if (s && s.id === 'ocsp_stapling') return '\nOCSP Stapling Failure: Active incident. Investigate.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = SEC007Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = SEC007Config._getScenario(engine);
            if (s && s.id === 'web_cert_expiry') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'chain_incomplete') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'wildcard_vuln') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'hsts_missing') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'ocsp_stapling') return '\nRoot cause identified. Apply fix.';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = SEC007Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = SEC007Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'web_cert_expiry' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nRenew certificate and configure auto-renewal monitoring completed.\n\n=== FLAG: SEC007{web_cert_expiry_resolved} ===';
            }
            if (s && s.id === 'chain_incomplete' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nInstall missing intermediate certificate to complete the chain completed.\n\n=== FLAG: SEC007{chain_incomplete_resolved} ===';
            }
            if (s && s.id === 'wildcard_vuln' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nRevoke compromised cert, generate new key, reissue and install completed.\n\n=== FLAG: SEC007{wildcard_vuln_resolved} ===';
            }
            if (s && s.id === 'hsts_missing' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nConfigure HSTS headers and submit for preload completed.\n\n=== FLAG: SEC007{hsts_missing_resolved} ===';
            }
            if (s && s.id === 'ocsp_stapling' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nEnable OCSP stapling on the web server completed.\n\n=== FLAG: SEC007{ocsp_stapling_resolved} ===';
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
            case 'ticket': SEC007Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: SEC007Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Certificate Crisis Alert', 'TKT', c);
        SEC007Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) SEC007Config._renderTicket(engine, c); else SEC007Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Team — "Production web server SSL certificate expires in 24 hours — ..."','Team — "Users getting SSL warnings — intermediate certificate missin..."','Team — "Wildcard certificate private key found in public GitHub repo..."','Team — "Site accessible over HTTP — HSTS header missing allowing SSL..."','Team — "Certificate revocation check failing — OCSP responder unreac..."'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#dc2626;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        SEC007Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#dc2626;font-weight:bold;">SEC007-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#dc2626;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { SEC007Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); SEC007Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { SEC007Config._applyScenario(engine, Math.floor(Math.random()*SEC007Config._scenarios.length)); SEC007Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = SEC007Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#dc2626;font-weight:bold;font-size:1rem;">INCIDENT #SEC007-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+SEC007Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+SEC007Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #dc262633;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+SEC007Config._escHtml(s.ticketExtra)+'</div></div>':'')
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