/* ============================================================
   DISPATCH LAB — Box IOT002: Firmware Vulnerability
   Security+ SY0-701 / CompTIA IoT+
   5 distinct scenarios
   ============================================================ */

var IOT002Config = {

    title: 'Firmware Vulnerability',
    subtitle: 'IoT Camera with Known CVE Still in Production',
    difficulty: 'Intermediate',
    accent: '#06b6d4',
    storageKey: 'hexworth_lab_iot002',
    registryId: 'iot002-firmware-vuln',
    trackerKey: 'lab_iot002',

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
        certPath: 'Security+ SY0-701 / CompTIA IoT+',
        mappings: [{ flagId: 'fixed', objective: '2.3', description: 'Summarize vulnerability management processes', skill: 'IoT Firmware Patching & Compensating Controls' }]
    },

    _alerts: [{ id: 'IOT002-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { known_cve: null, outdated_firmware: null, supply_chain_fw: null, unencrypted_proto: null, weak_update: null },

    _scenarios: [
        {
            id: 'known_cve',
            name: 'Known CVE Unpatched',
            ticketSubject: 'IP camera with CVE-2023-28808 (CVSS 9.8) still online — patch available but not applied',
            ticketDetail: 'Vulnerability scan found 3 Hikvision cameras running firmware v5.5.800 with a known critical RCE vulnerability (CVE-2023-28808). The patch has been available for 8 months. These cameras are on the corporate VLAN with no segmentation. An attacker could gain full shell access to the cameras and pivot to the network.',
            ticketExtra: 'Security Note: CVE-2023-28808 allows unauthenticated command injection via crafted HTTP requests. CVSS 9.8. Exploit code is publicly available on GitHub. Immediate action: (1) Apply firmware patch v5.5.820, (2) Isolate cameras on IoT VLAN, (3) Add compensating firewall rules until patched.',
            affectedHost: 0,
            fixDescription: 'Apply firmware patch and isolate cameras on IoT VLAN',
            stateOverrides: { _cveUnpatched: true, _noSegmentation: true }
        },
        {
            id: 'outdated_firmware',
            name: 'End-of-Life Firmware',
            ticketSubject: 'Smart building controller running unsupported firmware — no patches will be released',
            ticketDetail: 'The Johnson Controls Metasys building automation system is running firmware v9.0.7 which reached end-of-life 6 months ago. No more security patches will be released. Two medium-severity CVEs affect this version with no fix available. The system controls HVAC for the entire building and cannot be easily replaced.',
            ticketExtra: 'Facilities Note: The Metasys controller manages HVAC for a 200,000 sq ft building. Replacement cost is $180,000 and takes 4 months. We need compensating controls: (1) Network isolation, (2) IPS signatures for known exploits, (3) Strict ACLs, (4) Enhanced monitoring. Budget for replacement has been approved for Q3.',
            affectedHost: 0,
            fixDescription: 'Apply compensating controls for EOL system until replacement',
            stateOverrides: { _eolFirmware: true, _noPatches: true }
        },
        {
            id: 'supply_chain_fw',
            name: 'Supply Chain Firmware',
            ticketSubject: 'IoT sensor firmware contains embedded backdoor — supply chain compromise suspected',
            ticketDetail: 'Threat intel feed flagged firmware v2.1.4 of the SensorCorp T100 temperature sensors as containing an embedded backdoor. The firmware was compromised at the manufacturer and shipped to all customers. The backdoor opens port 31337 and accepts a hardcoded password for remote shell access. 20 of these sensors are deployed across the building.',
            ticketExtra: 'Threat Intel Note: SensorCorp disclosed the supply chain compromise last week. Affected firmware: v2.1.4 (all units shipped between Jan-March 2026). Clean firmware v2.1.5 is available. The backdoor beacons to C2 server at 45.33.32.156 every 6 hours. Check for active C2 connections and update all sensors immediately.',
            affectedHost: 0,
            fixDescription: 'Flash clean firmware and block C2 communications',
            stateOverrides: { _backdoorPresent: true, _c2Active: true }
        },
        {
            id: 'unencrypted_proto',
            name: 'Unencrypted Protocol',
            ticketSubject: 'Smart door locks communicating over unencrypted BLE — credential sniffing possible',
            ticketDetail: 'Security assessment found that the Kwikset Halo smart door locks on floors 1-3 are using unencrypted BLE (Bluetooth Low Energy) communications. An attacker with a BLE sniffer (Ubertooth) within 30 meters could capture lock/unlock commands and replay them to gain physical access. 12 locks are affected across 3 floors.',
            ticketExtra: 'Physical Security Note: These locks control access to server rooms, executive offices, and the data center. The locks support encrypted BLE (AES-CCM) but it was not enabled during deployment. The manufacturer firmware supports encryption but it must be enabled per-lock. Also verify that the BLE pairing used secure mode (LESC) not legacy pairing.',
            affectedHost: 0,
            fixDescription: 'Enable BLE encryption and secure pairing on all locks',
            stateOverrides: { _bleUnencrypted: true, _replayPossible: true }
        },
        {
            id: 'weak_update',
            name: 'Insecure Update Mechanism',
            ticketSubject: 'IoT devices accepting unsigned firmware updates — could be maliciously flashed',
            ticketDetail: 'Code review of the IoT device management platform revealed that firmware updates to 50 building sensors are pushed over HTTP (not HTTPS) with no code signing. An attacker on the network could perform a MITM attack and push malicious firmware to any sensor. The update server at 10.0.10.5 accepts unsigned firmware packages without verification.',
            ticketExtra: 'Dev Note: The firmware update process: (1) Sensor polls http://10.0.10.5/updates/ every hour, (2) If new version found, downloads .bin file, (3) Flashes directly with NO signature verification. Fix: Enable HTTPS on update server, implement firmware signing, configure sensors to validate signatures.',
            affectedHost: 0,
            fixDescription: 'Secure the firmware update process with HTTPS and code signing',
            stateOverrides: { _httpUpdate: true, _noSigning: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        known_cve: [
            { id: 'hint1', text: 'Run "status" to check camera firmware versions and CVE matches.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '3 cameras at v5.5.800 with CVE-2023-28808 (CVSS 9.8). Patch v5.5.820 available.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Apply the firmware update and move cameras to an isolated VLAN.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix patch-firmware" to update cameras and apply network segmentation.', cost: 150, penalty: -150 }
        ],
        outdated_firmware: [
            { id: 'hint1', text: 'Run "status" to check the building controller firmware and EOL status.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Firmware v9.0.7 is end-of-life with no patches. Two CVEs with no fix.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Apply compensating controls: network isolation, IPS rules, ACLs, monitoring.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix compensating-controls" to apply all mitigations.', cost: 150, penalty: -150 }
        ],
        supply_chain_fw: [
            { id: 'hint1', text: 'Run "status" to check sensor firmware versions.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '20 sensors with backdoored v2.1.4 firmware. Port 31337 open.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Flash clean firmware v2.1.5 and block C2 at 45.33.32.156.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix flash-clean-firmware" to update all sensors and block C2.', cost: 150, penalty: -150 }
        ],
        unencrypted_proto: [
            { id: 'hint1', text: 'Run "status" to check lock encryption configuration.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '12 locks using unencrypted BLE. Replay attacks possible.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable AES-CCM encryption and LESC pairing on all locks.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix enable-ble-encryption" to secure all 12 locks.', cost: 150, penalty: -150 }
        ],
        weak_update: [
            { id: 'hint1', text: 'Run "status" to check the firmware update mechanism.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Updates over HTTP with no code signing. MITM attack possible.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable HTTPS, implement firmware signing, configure validation.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix secure-update-chain" to protect the entire update process.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !IOT002Config._flagRestored) {
            IOT002Config._flagRestored = true;
            var s = IOT002Config._scenarios[engine.state._scenarioId];
            if (s) IOT002Config.hints = IOT002Config._scenarioHints[s.id] || IOT002Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_cveUnpatched','_noSegmentation','_eolFirmware','_noPatches','_backdoorPresent','_c2Active','_bleUnencrypted','_replayPossible','_httpUpdate','_noSigning','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = IOT002Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        IOT002Config._flagRestored = true;
        IOT002Config.hints = IOT002Config._scenarioHints[IOT002Config._scenarios[idx].id] || IOT002Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : IOT002Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['IoT Security Management Console', 'Loading Vulnerability Scanner...', 'CVE Database Updated', 'Asset Inventory Active'], grubEntries: ['Primary', 'Recovery'], loginUser: 'Security-Analyst' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Vuln\nDashboard', icon: 'VLN', app: 'dashboard' }, { id: 'asset_mgr', label: 'Asset\nManager', icon: 'AST', app: 'asset_mgr' }, { id: 'ticket', label: 'Firmware\nAlert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'sec-analyst', hostname: 'SEC-WS01', startDir: '/home/sec-analyst', promptStyle: 'linux', welcome: 'IoT Vulnerability Management Console\nCVE Database v2026.04\n' },
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
    lore: { intro: 'IoT devices with known firmware vulnerabilities have been detected on the network. Unpatched devices with public exploits are a critical risk. Assess and remediate each vulnerability.', scenario: 'Each scenario presents a different firmware security challenge — from missing patches to supply chain compromises and insecure update mechanisms.', outro: 'Firmware vulnerabilities addressed. Your systematic approach secured all affected IoT devices through patching, isolation, and compensating controls.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {

        'status': function(args, term, engine) {
            var gate = IOT002Config._requireScenario(engine); if (gate) return gate;
            var s = IOT002Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'known_cve') return '\nSee scenario status';
            if (s && s.id === 'outdated_firmware') return '\nSee scenario';
            if (s && s.id === 'supply_chain_fw') return '\nSee scenario';
            if (s && s.id === 'unencrypted_proto') return '\nSee scenario';
            if (s && s.id === 'weak_update') return '\nSee scenario';
            return '\nStatus: Normal operations.';
        },

        'investigate': function(args, term, engine) {
            var gate = IOT002Config._requireScenario(engine); if (gate) return gate;
            var s = IOT002Config._getScenario(engine);
            engine.state._investigated = true; engine.save();
            if (s && s.id === 'known_cve') return '\nSee investigation';
            if (s && s.id === 'outdated_firmware') return '\nSee investigation';
            if (s && s.id === 'supply_chain_fw') return '\nSee investigation';
            if (s && s.id === 'unencrypted_proto') return '\nSee investigation';
            if (s && s.id === 'weak_update') return '\nSee investigation';
            return '\nInvestigation complete. No anomalies found.';
        },

        'fix': function(args, term, engine) {
            var gate = IOT002Config._requireScenario(engine); if (gate) return gate;
            var s = IOT002Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first to identify the issue.';
            if (s && s.id === 'known_cve' && joined.includes('patch')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Patched', 'success'); }, 400);
                return '\nDone\n\n=== FLAG: IOT002{known_cve_resolved} ===';
            }
            if (s && s.id === 'outdated_firmware' && joined.includes('compensating')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Applied', 'success'); }, 400);
                return '\nDone\n\n=== FLAG: IOT002{outdated_firmware_resolved} ===';
            }
            if (s && s.id === 'supply_chain_fw' && joined.includes('flash')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Flashed', 'success'); }, 400);
                return '\nDone\n\n=== FLAG: IOT002{supply_chain_fw_resolved} ===';
            }
            if (s && s.id === 'unencrypted_proto' && joined.includes('ble-encryption')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Encrypted', 'success'); }, 400);
                return '\nDone\n\n=== FLAG: IOT002{unencrypted_proto_resolved} ===';
            }
            if (s && s.id === 'weak_update' && joined.includes('secure-update')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Secured', 'success'); }, 400);
                return '\nDone\n\n=== FLAG: IOT002{weak_update_resolved} ===';
            }
            return '\nUsage: fix <action>\nAvailable actions depend on the scenario. Run "investigate" first.';
        },


        whoami: function() { return 'sec-analyst'; },
        hostname: function() { return 'SEC-WS01'; },
        clear: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ls: function() { return 'configs  logs  scripts  tools'; },
        dir: function() { return ' Directory of current folder\n  configs  logs  scripts  tools'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app !== 'ticket' && iconDef.app !== 'terminal' && iconDef.app !== 'hints' && iconDef.app !== 'reset_lab' && !engine.state._scenarioSelected) { engine.notify('Open the Alert first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': IOT002Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: IOT002Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Firmware Vulnerability Alert', 'TKT', c);
        IOT002Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) IOT002Config._renderTicket(engine, c); else IOT002Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Security — "3 cameras with CVSS 9.8 RCE — patch available 8 months ago"','Facilities — "Building controller EOL firmware — no patches available"','Threat Intel — "20 sensors with supply chain backdoor firmware"','PhysSec — "Smart locks using unencrypted BLE — replay attacks possible"','Dev — "50 sensors accepting unsigned firmware over HTTP"'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#06b6d4;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        IOT002Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#06b6d4;font-weight:bold;">IOT002-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#06b6d4;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { IOT002Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); IOT002Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { IOT002Config._applyScenario(engine, Math.floor(Math.random()*IOT002Config._scenarios.length)); IOT002Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = IOT002Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#06b6d4;font-weight:bold;font-size:1rem;">INCIDENT #IOT002-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+IOT002Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+IOT002Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #06b6d433;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+IOT002Config._escHtml(s.ticketExtra)+'</div></div>':'')
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