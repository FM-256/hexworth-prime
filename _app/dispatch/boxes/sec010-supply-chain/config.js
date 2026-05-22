/* ============================================================
   DISPATCH LAB — Box SEC010: Supply Chain Alert
   Security+ SY0-701 / CySA+
   5 distinct scenarios
   ============================================================ */

var SEC010Config = {

    title: 'Supply Chain Alert',
    subtitle: 'Software Update Server Compromised',
    difficulty: 'Advanced',
    accent: '#dc2626',
    storageKey: 'hexworth_lab_sec010',
    registryId: 'sec010-supply-chain',
    trackerKey: 'lab_sec010',

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
        mappings: [{ flagId: 'fixed', objective: '1.2', description: 'Explain threat actors and supply chain risks', skill: 'Supply Chain Attack Response' }]
    },

    _alerts: [{ id: 'SEC010-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { pkg_tampering: null, update_server: null, dep_confusion: null, docker_image: null, signing_key: null },

    _scenarios: [
        {
            id: 'pkg_tampering',
            name: 'Package Tampering',
            ticketSubject: 'NPM package in CI/CD pipeline modified with backdoor — hash mismatch',
            ticketDetail: 'Build pipeline integrity check found that npm package "corp-utils" v2.4.1 in our internal registry has a different SHA-256 hash than the version pinned in package-lock.json. The package was modified 3 days ago. Analysis shows an additional base64-encoded payload that exfiltrates environment variables (including API keys) to an external server.',
            ticketExtra: 'DevSec Note: The internal npm registry (registry.hexworth.local) shows corp-utils v2.4.1 was updated 3 days ago by user "deploy-bot" whose credentials may have been compromised. The payload sends process.env to https://evil-cdn.com/collect.php. 12 builds have used the tampered package.',
            affectedHost: 0,
            fixDescription: 'Revert to clean package, rotate all exposed API keys, secure registry',
            stateOverrides: { _packageTampered: true, _hashMismatch: true }
        },
        {
            id: 'update_server',
            name: 'Compromised Update Server',
            ticketSubject: 'Internal software update server serving malicious updates',
            ticketDetail: 'The internal WSUS-like update server (update.hexworth.local) is distributing a modified version of the corporate VPN client. The update includes a remote access trojan (RAT) that establishes a reverse shell. 47 machines have installed the malicious update in the last 48 hours.',
            ticketExtra: 'SOC Note: The update server was compromised through an unpatched Apache Struts vulnerability. The attacker replaced the VPN client installer with a trojanized version. Affected machines need to be isolated, reimaged, and the update server rebuilt from scratch.',
            affectedHost: 0,
            fixDescription: 'Isolate affected machines, rebuild update server, clean RAT from 47 hosts',
            stateOverrides: { _updateServerOwned: true, _ratDistributed: true }
        },
        {
            id: 'dep_confusion',
            name: 'Dependency Confusion',
            ticketSubject: 'External package with same name as internal package pulled into build',
            ticketDetail: 'A developers build pulled "hexworth-auth-lib" from the public npm registry instead of the internal registry. The public package (published by an unknown actor 1 week ago) contains data exfiltration code. Our internal package shares the same name. npm resolved the public version because it had a higher version number (v99.0.0 vs internal v1.2.3).',
            ticketExtra: 'DevSec Note: This is a dependency confusion attack. The attacker published a package on public npm with the same name as our private package but with a much higher version number. npm prefers the higher version. Fix: (1) Configure .npmrc to scope internal packages, (2) Reserve the package name on public npm, (3) Audit all builds from the last week.',
            affectedHost: 0,
            fixDescription: 'Configure npm scoping, reserve public name, audit affected builds',
            stateOverrides: { _depConfusion: true, _publicOverride: true }
        },
        {
            id: 'docker_image',
            name: 'Compromised Docker Image',
            ticketSubject: 'Base Docker image from Docker Hub contains cryptocurrency miner',
            ticketDetail: 'Container security scan found that the base image "node:18-alpine" pulled from Docker Hub contains an embedded cryptocurrency miner. The miner activates when CPU usage is below 50% and mines to wallet address bc1q...xyz. 8 production containers are running this image.',
            ticketExtra: 'DevOps Note: The official "node:18-alpine" image was not compromised — a typo in the Dockerfile referenced "node:18-alpnie" (note the typo) which is a malicious lookalike image with 50,000 pulls. This is typosquatting. Fix: correct the image name, rebuild containers, scan all Dockerfiles for similar typos.',
            affectedHost: 0,
            fixDescription: 'Replace malicious image, rebuild containers, scan all Dockerfiles',
            stateOverrides: { _dockerCompromised: true, _typosquatting: true }
        },
        {
            id: 'signing_key',
            name: 'Signing Key Stolen',
            ticketSubject: 'Code signing certificate private key exfiltrated — any update can be signed',
            ticketDetail: 'Incident response discovered that the code signing certificate private key was stolen from the build server. The attacker can sign any malicious binary as if it came from Hexworth. All signed software distributed in the last 30 days needs to be verified. The signing key must be revoked and a new one issued.',
            ticketExtra: 'Security Note: The code signing key (SHA-256 RSA 4096-bit) was stored unencrypted on the build server at /opt/signing/private.pem. The attacker exfiltrated it via the compromised CI/CD pipeline. Revoke the certificate, issue a new one stored in an HSM, and re-sign all legitimate binaries.',
            affectedHost: 0,
            fixDescription: 'Revoke signing cert, issue new key in HSM, re-sign all binaries',
            stateOverrides: { _signingKeyStolen: true, _unencryptedKey: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        pkg_tampering: [
            { id: 'hint1', text: 'Run "status" to verify package integrity.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'corp-utils v2.4.1 tampered with exfiltration payload. 12 builds affected.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Revert package, rotate all API keys, secure registry credentials.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix revert-rotate" to clean the supply chain.', cost: 150, penalty: -150 }
        ],
        update_server: [
            { id: 'hint1', text: 'Run "status" to check update server integrity.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Update server compromised. 47 machines have trojanized VPN client.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Isolate affected machines, rebuild server, clean RAT.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix isolate-rebuild" to contain the supply chain attack.', cost: 150, penalty: -150 }
        ],
        dep_confusion: [
            { id: 'hint1', text: 'Run "status" to check dependency resolution.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Public npm package overriding internal one via version number.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Configure npm scoping, reserve name, audit affected builds.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix scope-reserve" to prevent dependency confusion.', cost: 150, penalty: -150 }
        ],
        docker_image: [
            { id: 'hint1', text: 'Run "status" to verify Docker image integrity.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Typosquatted Docker image with crypto miner. 8 containers affected.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix Dockerfile typo, rebuild with correct image, scan all repos.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix rebuild-containers" to replace malicious images.', cost: 150, penalty: -150 }
        ],
        signing_key: [
            { id: 'hint1', text: 'Run "status" to check code signing certificate status.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Signing key stolen from build server. Stored unencrypted.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Revoke cert, generate new key in HSM, re-sign all software.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix revoke-hsm-resign" to secure code signing.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SEC010Config._flagRestored) {
            SEC010Config._flagRestored = true;
            var s = SEC010Config._scenarios[engine.state._scenarioId];
            if (s) SEC010Config.hints = SEC010Config._scenarioHints[s.id] || SEC010Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_packageTampered','_hashMismatch','_updateServerOwned','_ratDistributed','_depConfusion','_publicOverride','_dockerCompromised','_typosquatting','_signingKeyStolen','_unencryptedKey','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = SEC010Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        SEC010Config._flagRestored = true;
        SEC010Config.hints = SEC010Config._scenarioHints[SEC010Config._scenarios[idx].id] || SEC010Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : SEC010Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['System Boot...', 'Loading diagnostic tools...', 'Monitoring active', 'Console ready'], grubEntries: ['Primary', 'Recovery'], loginUser: 'Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Dashboard', icon: 'DSH', app: 'dashboard' }, { id: 'logs', label: 'Log\nViewer', icon: 'LOG', app: 'logs' }, { id: 'ticket', label: 'Alert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'admin', hostname: 'WS-01', startDir: '/home/admin', promptStyle: 'linux', welcome: 'Supply Chain Alert Diagnostic Console\n' },
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
    lore: { intro: 'A supply chain alert incident has been detected. Investigate and respond systematically.', scenario: 'Each scenario presents a different aspect of supply chain alert — requiring thorough investigation and remediation.', outro: 'Incident resolved. Your systematic response contained and remediated the supply chain alert effectively.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = SEC010Config._requireScenario(engine); if (gate) return gate;
            var s = SEC010Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'pkg_tampering') return '\nPackage Tampering: Active incident. Investigate.';
            if (s && s.id === 'update_server') return '\nCompromised Update Server: Active incident. Investigate.';
            if (s && s.id === 'dep_confusion') return '\nDependency Confusion: Active incident. Investigate.';
            if (s && s.id === 'docker_image') return '\nCompromised Docker Image: Active incident. Investigate.';
            if (s && s.id === 'signing_key') return '\nSigning Key Stolen: Active incident. Investigate.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = SEC010Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = SEC010Config._getScenario(engine);
            if (s && s.id === 'pkg_tampering') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'update_server') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'dep_confusion') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'docker_image') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'signing_key') return '\nRoot cause identified. Apply fix.';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = SEC010Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = SEC010Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'pkg_tampering' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nRevert to clean package, rotate all exposed API keys, secure registry completed.\n\n=== FLAG: SEC010{pkg_tampering_resolved} ===';
            }
            if (s && s.id === 'update_server' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nIsolate affected machines, rebuild update server, clean RAT from 47 hosts completed.\n\n=== FLAG: SEC010{update_server_resolved} ===';
            }
            if (s && s.id === 'dep_confusion' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nConfigure npm scoping, reserve public name, audit affected builds completed.\n\n=== FLAG: SEC010{dep_confusion_resolved} ===';
            }
            if (s && s.id === 'docker_image' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nReplace malicious image, rebuild containers, scan all Dockerfiles completed.\n\n=== FLAG: SEC010{docker_image_resolved} ===';
            }
            if (s && s.id === 'signing_key' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nRevoke signing cert, issue new key in HSM, re-sign all binaries completed.\n\n=== FLAG: SEC010{signing_key_resolved} ===';
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
            case 'ticket': SEC010Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: SEC010Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Supply Chain Alert Alert', 'TKT', c);
        SEC010Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) SEC010Config._renderTicket(engine, c); else SEC010Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Team — "NPM package in CI/CD pipeline modified with backdoor — hash ..."','Team — "Internal software update server serving malicious updates..."','Team — "External package with same name as internal package pulled i..."','Team — "Base Docker image from Docker Hub contains cryptocurrency mi..."','Team — "Code signing certificate private key exfiltrated — any updat..."'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#dc2626;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        SEC010Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#dc2626;font-weight:bold;">SEC010-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#dc2626;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { SEC010Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); SEC010Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { SEC010Config._applyScenario(engine, Math.floor(Math.random()*SEC010Config._scenarios.length)); SEC010Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = SEC010Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#dc2626;font-weight:bold;font-size:1rem;">INCIDENT #SEC010-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+SEC010Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+SEC010Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #dc262633;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+SEC010Config._escHtml(s.ticketExtra)+'</div></div>':'')
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