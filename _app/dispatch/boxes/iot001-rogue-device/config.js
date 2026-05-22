/* ============================================================
   DISPATCH LAB — Box IOT001: Rogue IoT Device
   Security+ SY0-701 / CompTIA IoT+ — Unidentified Device Broadcasting on Corporate Network
   5 distinct scenarios
   ============================================================ */

var IOT001Config = {

    title: 'Rogue IoT Device',
    subtitle: 'Unidentified Device Broadcasting on Corporate Network',
    difficulty: 'Beginner',
    accent: '#06b6d4',
    storageKey: 'hexworth_lab_iot001',
    registryId: 'iot001-rogue-device',
    trackerKey: 'lab_iot001',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Alert', tip: 'Read the incident report.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check the Dashboard', tip: 'Review system status and indicators.', trigger: { event: 'window_open', match: { type: 'nac_dashboard' } } },
            { title: 'Investigate', tip: 'Use terminal tools to diagnose the issue.', trigger: { event: 'command', match: { cmd: 'contains:nac-scan' } } },
            { title: 'Apply the fix', tip: 'Resolve the issue.', trigger: { event: 'command', match: { cmd: 'contains:device-investigate' } } },
            { title: 'Capture the flag', tip: 'After fixing the issue, the flag appears.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Security+ SY0-701 / CompTIA IoT+',
        mappings: [
            { flagId: 'fixed', objective: '2.3', description: 'Summarize IoT device security risks', skill: 'IoT Device Identification & Segmentation' }
        ]
    },

    _alerts: [{ id: 'IOT001-2026-0001', severity: 'HIGH', engine: 'Network Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { mdns_broadcast: null, mac_spoof: null, iot_camera: null, smart_plug: null, rogue_ap: null },

    _scenarios: [
        {
            id: 'mdns_broadcast',
            name: 'mDNS Broadcast Rogue',
            ticketSubject: 'Unknown device broadcasting mDNS on corporate VLAN — not in asset inventory',
            ticketDetail: 'Network monitoring detected an unregistered device broadcasting mDNS (Bonjour) discovery packets on VLAN 10 (corporate). The device MAC address (B8:27:EB:4C:A1:22) shows OUI registered to Raspberry Pi Foundation. The device was not in the IT asset inventory and was discovered during a routine network scan. It is responding to ARP requests at 10.0.10.147.',
            ticketExtra: 'NOC Note: MAC OUI B8:27:EB is Raspberry Pi. The device is advertising itself as "Office-Pi._http._tcp.local" via mDNS. It appears to be running a web server on port 80 and SSH on port 22. This could be an unauthorized dev project, a rogue monitoring device, or something malicious. Identify, contain, then determine intent.',
            affectedHost: 0,
            fixDescription: 'Identify the rogue device, isolate it on quarantine VLAN, investigate',
            stateOverrides: { _rogueDetected: true, _notInInventory: true }
        },
        {
            id: 'mac_spoof',
            name: 'MAC Spoofing Device',
            ticketSubject: 'Two devices with same MAC address causing ARP conflicts on network',
            ticketDetail: 'ARP monitoring shows duplicate MAC address 00:1A:2B:3C:4D:5E on two different switch ports. The legitimate device is a VoIP phone on port Gi1/0/15, but an unknown device on port Gi1/0/24 is spoofing the same MAC. This is causing intermittent connectivity issues for the VoIP phone and may indicate an attempt to bypass NAC.',
            ticketExtra: 'NOC Note: MAC spoofing is a common technique to bypass port-based NAC. The rogue device may be trying to inherit the VoIP phone\'s network access. Check switch port security configuration, enable dynamic ARP inspection (DAI), and implement 802.1X with EAP-TLS for stronger authentication.',
            affectedHost: 0,
            fixDescription: 'Enable port security, DAI, and isolate the spoofing device',
            stateOverrides: { _macSpoofed: true, _arpConflict: true }
        },
        {
            id: 'iot_camera',
            name: 'Unauthorized IP Camera',
            ticketSubject: 'Unauthorized IP camera found streaming video on corporate network',
            ticketDetail: 'A network scan discovered an IP camera (Hikvision DS-2CD2143G0-I) at 10.0.10.201 that is NOT in the security camera inventory. The device is streaming video over RTSP (port 554) and has its web interface (port 80/443) accessible. The camera was plugged into a network jack in the break room. No work order exists for this installation.',
            ticketExtra: 'NOC Note: Unauthorized surveillance devices on the corporate network are both a security and legal concern. The camera could be recording without consent. It needs to be identified, isolated, the video feed secured, and the device physically removed. Check who installed it — it may require HR/legal involvement.',
            affectedHost: 0,
            fixDescription: 'Isolate camera, disable streaming, identify installer',
            stateOverrides: { _unauthorizedCamera: true, _rtspOpen: true }
        },
        {
            id: 'smart_plug',
            name: 'IoT Smart Plug Cloud Leak',
            ticketSubject: 'Smart plug phoning home to Chinese cloud server — data exfiltration risk',
            ticketDetail: 'Firewall logs show a device at 10.0.10.88 making HTTPS connections to api.tuya.com and mqtt.tuya.com every 30 seconds. The device is a consumer-grade smart plug (Tuya-based) that someone connected to the corporate network to control a space heater. The smart plug is sending telemetry (power usage, network info, connected device details) to Tuya\'s cloud servers in China.',
            ticketExtra: 'NOC Note: Consumer IoT devices with cloud connectivity are a data leakage vector. This device is broadcasting the internal network SSID, BSSID, and signal strength to external servers. It needs to be isolated, the cloud connection blocked, and a policy enforced preventing consumer IoT on the corporate network.',
            affectedHost: 0,
            fixDescription: 'Block cloud connections, isolate device, enforce IoT policy',
            stateOverrides: { _cloudLeak: true, _tuyaConnected: true }
        },
        {
            id: 'rogue_ap',
            name: 'Rogue Access Point',
            ticketSubject: 'Unauthorized WiFi access point detected — creating backdoor to corporate network',
            ticketDetail: 'Wireless IDS detected a new SSID "FreeWiFi-Office" broadcasting from inside the building. The access point is connected to a corporate Ethernet jack on the 3rd floor and is providing an open (no encryption) WiFi network. Anyone in range can connect and access the corporate LAN. The AP MAC resolves to a TP-Link consumer device.',
            ticketExtra: 'NOC Note: This is a critical security issue — an open WiFi bridge to the corporate LAN. The rogue AP could have been set up by an employee for convenience or by an attacker for persistent access. Locate the physical device using wireless triangulation, disable the switch port, and investigate.',
            affectedHost: 0,
            fixDescription: 'Locate and disable rogue AP, shut switch port, investigate',
            stateOverrides: { _rogueAP: true, _openWiFi: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the dashboard and review the alert details.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate further.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        mdns_broadcast: [
            { id: 'hint1', text: 'Start by running "nac-scan" to assess the situation.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The root cause is in the ticket details. Look for the key indicator.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use the investigation tools to confirm your theory.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix and verify with the final command.', cost: 150, penalty: -150 }
        ],
        mac_spoof: [
            { id: 'hint1', text: 'Start by running "nac-scan" to assess the situation.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The root cause is in the ticket details. Look for the key indicator.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use the investigation tools to confirm your theory.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix and verify with the final command.', cost: 150, penalty: -150 }
        ],
        iot_camera: [
            { id: 'hint1', text: 'Start by running "nac-scan" to assess the situation.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The root cause is in the ticket details. Look for the key indicator.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use the investigation tools to confirm your theory.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix and verify with the final command.', cost: 150, penalty: -150 }
        ],
        smart_plug: [
            { id: 'hint1', text: 'Start by running "nac-scan" to assess the situation.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The root cause is in the ticket details. Look for the key indicator.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use the investigation tools to confirm your theory.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix and verify with the final command.', cost: 150, penalty: -150 }
        ],
        rogue_ap: [
            { id: 'hint1', text: 'Start by running "nac-scan" to assess the situation.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The root cause is in the ticket details. Look for the key indicator.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use the investigation tools to confirm your theory.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix and verify with the final command.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !IOT001Config._flagRestored) {
            IOT001Config._flagRestored = true;
            var s = IOT001Config._scenarios[engine.state._scenarioId];
            if (s) IOT001Config.hints = IOT001Config._scenarioHints[s.id] || IOT001Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        var keys = ['_rogueDetected','_notInInventory','_macSpoofed','_arpConflict','_unauthorizedCamera','_rtspOpen','_cloudLeak','_tuyaConnected','_rogueAP','_openWiFi','_vlanIsolated','_portSecured','_labComplete','_flagRevealed'];
        keys.forEach(function(k) { engine.state[k] = false; });
        var overrides = IOT001Config._scenarios[idx].stateOverrides || {};
        for (var k in overrides) engine.state[k] = overrides[k];
        IOT001Config._flagRestored = true;
        IOT001Config.hints = IOT001Config._scenarioHints[IOT001Config._scenarios[idx].id] || IOT001Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : IOT001Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['Cisco Catalyst 9300 — IOS-XE Boot', 'Loading Network Access Control...', 'NAC Engine Active', 'VLAN database loaded'], grubEntries: ['Primary OS', 'Recovery'], loginUser: 'Net-Admin' },

    desktop: {
        icons: [
            { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' },
            { id: 'nac_dash', label: 'NAC\nDashboard', icon: 'NAC', app: 'nac_dashboard' },
            { id: 'vlan_mgr', label: 'VLAN\nManager', icon: 'VLN', app: 'vlan_mgr' },
            { id: 'ticket', label: 'IoT\nAlert', icon: 'TKT', app: 'ticket' },
            { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
            { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'net-admin', hostname: 'SW-CORE-01', startDir: '/home/net-admin', promptStyle: 'linux', welcome: 'Cisco IOS-XE Network Management Console\nNAC/802.1X Engine Active\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the dashboard for initial indicators.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal commands for deeper investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a unique root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix the issue and verify.', cost: 50, penalty: -50 }
    ],
    lore: {
        intro: 'An unidentified device has been detected on the corporate network. It is not in the IT asset inventory and may pose a security risk. Identify, contain, and investigate.',
        scenario: 'Each scenario involves a different type of rogue IoT device — from Raspberry Pis to IP cameras and consumer smart plugs.',
        outro: 'Rogue device contained. Your investigation identified the device, isolated it from the network, and preserved evidence for review.'
    },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert and gather initial data.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        
        'nac-scan': function(args, term, engine) {
            var gate = IOT001Config._requireScenario(engine); if (gate) return gate;
            var sc = IOT001Config._getScenario(engine);
            if (engine.state._labComplete) return '\nNAC Scan: All devices identified and compliant. No rogues detected.';
            if (sc && sc.id === 'mdns_broadcast') return '\nNAC Scan Results\n================\n  Rogue Device Detected:\n    IP: 10.0.10.147\n    MAC: B8:27:EB:4C:A1:22\n    OUI: Raspberry Pi Foundation\n    Port: Gi1/0/22\n    mDNS Name: Office-Pi._http._tcp.local\n    Open Ports: 22 (SSH), 80 (HTTP)\n    Inventory Status: NOT REGISTERED\n\n  [!] Unregistered device on corporate VLAN.';
            if (sc && sc.id === 'mac_spoof') return '\nNAC Scan Results\n================\n  Duplicate MAC Detected:\n    MAC: 00:1A:2B:3C:4D:5E\n    Port 1: Gi1/0/15 (Legitimate VoIP phone)\n    Port 2: Gi1/0/24 (ROGUE — unknown device)\n    ARP conflicts: 47 in last hour\n\n  [!] MAC spoofing detected on port Gi1/0/24.';
            if (sc && sc.id === 'iot_camera') return '\nNAC Scan Results\n================\n  Unauthorized Device:\n    IP: 10.0.10.201\n    MAC: C0:56:E3:1A:2B:3C\n    OUI: Hangzhou Hikvision\n    Port: Gi1/0/31\n    Open Ports: 80, 443, 554 (RTSP)\n    Device: IP Camera DS-2CD2143G0-I\n    Status: STREAMING (RTSP active)\n\n  [!] Unauthorized surveillance device.';
            if (sc && sc.id === 'smart_plug') return '\nNAC Scan Results\n================\n  Consumer IoT Device:\n    IP: 10.0.10.88\n    MAC: D8:F1:5B:4C:5D:6E\n    OUI: Tuya Smart (Hangzhou)\n    Port: Gi1/0/18\n    Connections: api.tuya.com, mqtt.tuya.com (every 30s)\n    Data Sent: Network telemetry (SSID, BSSID, signal)\n\n  [!] Consumer IoT leaking network data to cloud.';
            if (sc && sc.id === 'rogue_ap') return '\nNAC Scan + Wireless IDS\n========================\n  Rogue Access Point:\n    SSID: "FreeWiFi-Office"\n    MAC: E4:8D:8C:2A:3B:4C\n    OUI: TP-Link Technologies\n    Connected to: Gi1/0/42 (3rd floor)\n    Encryption: NONE (Open)\n    Clients connected: 3\n    Channel: 6\n\n  [CRITICAL] Open WiFi bridge to corporate LAN.';
            return '\nNAC Scan: No rogue devices detected.';
        },

        'mac-lookup': function(args, term, engine) {
            var gate = IOT001Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('b8:27:eb')) return '\nMAC OUI Lookup: B8:27:EB\n  Vendor: Raspberry Pi Foundation\n  Country: United Kingdom\n  Type: Single Board Computer';
            if (joined.includes('c0:56:e3')) return '\nMAC OUI Lookup: C0:56:E3\n  Vendor: Hangzhou Hikvision Digital Technology\n  Country: China\n  Type: IP Camera / DVR / NVR';
            if (joined.includes('d8:f1:5b')) return '\nMAC OUI Lookup: D8:F1:5B\n  Vendor: Tuya Smart Inc.\n  Country: China\n  Type: Consumer IoT (Smart Plugs, Sensors)';
            if (joined.includes('e4:8d:8c')) return '\nMAC OUI Lookup: E4:8D:8C\n  Vendor: TP-Link Technologies\n  Country: China\n  Type: Consumer Networking (Routers, APs)';
            return '\nUsage: mac-lookup <mac-address>\nLookup vendor from MAC OUI database.';
        },

        'port-security': function(args, term, engine) {
            var gate = IOT001Config._requireScenario(engine); if (gate) return gate;
            var sc = IOT001Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (joined.includes('enable') && joined.includes('dai')) {
                if (sc && sc.id === 'mac_spoof') { engine.state._portSecured = true; engine.save(); return '\nPort Security + DAI Enabled:\n  Port Gi1/0/24: SHUTDOWN (MAC spoof detected)\n  Dynamic ARP Inspection: ENABLED on VLAN 10\n  MAC limit per port: 1\n  Violation action: SHUTDOWN\n\nRogue device isolated. Run "device-investigate" for details.'; }
            }
            return '\nUsage: port-security enable --dai --port <port>\nEnable port security with Dynamic ARP Inspection.';
        },

        'vlan-isolate': function(args, term, engine) {
            var gate = IOT001Config._requireScenario(engine); if (gate) return gate;
            var sc = IOT001Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (joined.includes('quarantine')) {
                engine.state._vlanIsolated = true; engine.save();
                var port = 'Gi1/0/22';
                if (sc && sc.id === 'iot_camera') port = 'Gi1/0/31';
                if (sc && sc.id === 'smart_plug') port = 'Gi1/0/18';
                if (sc && sc.id === 'rogue_ap') port = 'Gi1/0/42';
                return '\nVLAN Isolation Applied:\n  Port: ' + port + '\n  Previous VLAN: 10 (Corporate)\n  New VLAN: 999 (Quarantine)\n  Device Status: ISOLATED (no corporate access)\n\nDevice moved to quarantine VLAN. Run "device-investigate" to complete.';
            }
            return '\nUsage: vlan-isolate --quarantine --port <port>';
        },

        'device-investigate': function(args, term, engine) {
            var gate = IOT001Config._requireScenario(engine); if (gate) return gate;
            var sc = IOT001Config._getScenario(engine);
            if (!engine.state._vlanIsolated && !engine.state._portSecured) return '\nERROR: Isolate the device first with vlan-isolate or port-security.';
            engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
            var flag = '';
            if (sc && sc.id === 'mdns_broadcast') flag = 'IOT001{rogue_pi_quarantined_identified}';
            if (sc && sc.id === 'mac_spoof') flag = 'IOT001{mac_spoof_port_security_dai}';
            if (sc && sc.id === 'iot_camera') flag = 'IOT001{unauthorized_camera_isolated}';
            if (sc && sc.id === 'smart_plug') flag = 'IOT001{tuya_cloud_leak_blocked}';
            if (sc && sc.id === 'rogue_ap') flag = 'IOT001{rogue_ap_shutdown_located}';
            setTimeout(function() { engine.notify('Rogue device contained. Investigation complete.', 'success'); }, 400);
            return '\nDevice Investigation Complete\n=============================\n  Device: Contained in quarantine\n  Network access: BLOCKED\n  Evidence preserved for review\n  Incident report generated\n\n=== FLAG: ' + flag + ' ===';
        },

        whoami: function() { return 'net-admin'; },
        hostname: function() { return 'SW-CORE-01'; },
        clear: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ls: function() { return 'configs  logs  scripts  tools'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app !== 'ticket' && iconDef.app !== 'terminal' && iconDef.app !== 'hints' && iconDef.app !== 'reset_lab' && !engine.state._scenarioSelected) { engine.notify('Open the Alert first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': IOT001Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: IOT001Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Rogue IoT Device Alert', 'TKT', c);
        IOT001Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) IOT001Config._renderTicket(engine, c); else IOT001Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['NOC — "Unknown Raspberry Pi broadcasting mDNS on corporate VLAN"','NOC — "MAC spoofing detected — two devices with same MAC on different ports"','Security — "Unauthorized IP camera streaming video on corporate network"','Security — "Consumer smart plug sending network data to Chinese cloud"','Security — "CRITICAL: Open WiFi rogue AP bridged to corporate LAN"'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#06b6d4;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        IOT001Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#06b6d4;font-weight:bold;">IOT001-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#06b6d4;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { IOT001Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); IOT001Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { IOT001Config._applyScenario(engine, Math.floor(Math.random()*IOT001Config._scenarios.length)); IOT001Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = IOT001Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#06b6d4;font-weight:bold;font-size:1rem;">INCIDENT #IOT001-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+IOT001Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+IOT001Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+IOT001Config._escHtml(s.ticketExtra)+'</div></div>':'')
            +'<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;color:#2ecc71;font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openInfoWin(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:16px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, iconDef.label.replace('\n',' '), iconDef.icon, c);
        c.innerHTML = '<div style="color:#06b6d4;font-weight:bold;font-size:1rem;margin-bottom:12px;">'+iconDef.label.replace('\n',' ')+'</div><div style="color:#888;">Use terminal commands for detailed diagnostics.</div>';
    }
};