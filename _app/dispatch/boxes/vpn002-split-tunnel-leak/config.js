/* ============================================================
   DISPATCH LAB — Box VPN002: Split Tunnel Data Leak
   CompTIA Security+ SY0-701 / CySA+ — VPN Split Tunnel Security
   Config: DNS leak, WebRTC exposure, routing table misconfig,
   kill switch disabled, IPv6 leak
   5 distinct scenarios
   ============================================================ */

var VPN002Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Split Tunnel Data Leak',
    subtitle: 'Remote Worker Traffic Leaking Outside the VPN',
    difficulty: 'Intermediate',
    accent: '#7c3aed',
    storageKey: 'hexworth_lab_vpn002',
    registryId: 'vpn002-split-tunnel-leak',
    trackerKey: 'lab_vpn002',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Security Alert',
                tip: 'Double-click the VPN Alert icon to read the data leak report.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Check the VPN Dashboard',
                tip: 'Open the VPN Dashboard to review split tunnel configuration and traffic routing.',
                trigger: { event: 'window_open', match: { type: 'vpn_dashboard' } }
            },
            {
                title: 'Investigate with CLI tools',
                tip: 'Use the terminal to check DNS resolution, routing tables, and traffic flow.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:dns' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:route' } },
                        { event: 'command', match: { cmd: 'contains:traffic' } },
                        { event: 'command', match: { cmd: 'contains:show' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Seal the leak by fixing DNS, routing, kill switch, WebRTC, or IPv6 config.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:set' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:enable' } },
                        { event: 'command', match: { cmd: 'contains:disable' } },
                        { event: 'command', match: { cmd: 'contains:fix' } }
                    ]
                }
            },
            {
                title: 'Capture the flag',
                tip: 'After sealing the leak, the flag will appear in the tool output.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES
    // ==========================================================

    certObjectives: {
        certPath: 'Security+ SY0-701 / CySA+',
        mappings: [
            { flagId: 'fixed', objective: '3.2', description: 'Apply security principles to secure enterprise infrastructure', skill: 'VPN Split Tunnel Security' },
            { flagId: 'fixed', objective: '4.5', description: 'Implement security for data at rest and in transit', skill: 'Data Leak Prevention' }
        ]
    },

    // ==========================================================
    // ALERT DATA
    // ==========================================================

    _alerts: [
        { id: 'DLP-2026-0201', severity: 'HIGH', engine: 'Zscaler ZIA + Symantec DLP', host: 'LAPTOP-REMOTE-07', user: 'kthompson', detected: '2026-04-01 09:22:14' },
        { id: 'DLP-2026-0202', severity: 'CRITICAL', engine: 'Zscaler ZIA', host: 'LAPTOP-REMOTE-12', user: 'mchen', detected: '2026-04-01 09:35:41' }
    ],

    // ==========================================================
    // SCENARIO FLAGS
    // ==========================================================

    _scenarioFlags: {
        dns_leak:         null,
        webrtc_exposure:  null,
        routing_misconfig: null,
        kill_switch:      null,
        ipv6_leak:        null
    },

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            // Scenario 0: DNS Leak
            // VPN tunnel is UP but DNS queries bypass the tunnel and go to
            // the user's ISP DNS server. Corporate hostnames resolve via ISP
            // DNS (which fails), but the real issue is that DNS traffic itself
            // is leaking outside the encrypted tunnel, exposing browsing data.
            id: 'dns_leak',
            name: 'DNS Leak',
            ticketSubject: 'Remote worker DNS queries bypassing VPN — leaking to ISP resolver',
            ticketDetail: 'DLP sensors detected that user kthompson (LAPTOP-REMOTE-07) is sending DNS queries to 8.8.8.8 (Google public DNS) instead of through the VPN tunnel to corporate DNS (10.0.2.10). The VPN client shows connected, but a DNS leak test confirms that DNS resolution is happening outside the tunnel. All browsing history is visible to the ISP.',
            ticketExtra: 'Security Note: The VPN client split tunnel policy should force all DNS through the tunnel. Check the VPN client DNS configuration. The client may have "Use default gateway on remote network" disabled, or the OS DNS resolver may be using a cached ISP DNS server from before the VPN connected.',
            affectedHost: 0,
            fixDescription: 'Force DNS queries through the VPN tunnel to corporate DNS',
            stateOverrides: { _dnsLeaking: true, _ispDnsActive: true }
        },
        {
            // Scenario 1: WebRTC Exposure
            // The browser WebRTC API is leaking the user's real public IP
            // address even though the VPN tunnel is UP. This happens because
            // WebRTC STUN requests bypass the VPN by design in most browsers.
            id: 'webrtc_exposure',
            name: 'WebRTC Exposure',
            ticketSubject: 'Browser WebRTC leaking real public IP despite active VPN connection',
            ticketDetail: 'Security scanning detected that user mchen (LAPTOP-REMOTE-12) has a WebRTC leak. While connected to the corporate VPN, the browser WebRTC API is exposing the real public IP (73.162.45.89) through STUN requests. This bypasses the VPN tunnel entirely. A third party could determine the user\'s true location and ISP despite the VPN.',
            ticketExtra: 'Security Note: WebRTC uses STUN/TURN servers to establish peer connections for video/voice calls. STUN requests can bypass VPN tunnels because they use UDP and are initiated by the browser outside the OS routing table. Fix requires disabling WebRTC or forcing STUN through the VPN proxy.',
            affectedHost: 0,
            fixDescription: 'Disable WebRTC STUN leak or force it through the VPN',
            stateOverrides: { _webrtcLeaking: true, _realIpExposed: true }
        },
        {
            // Scenario 2: Routing Table Misconfigured
            // The split tunnel policy only routes 10.0.0.0/8 through the VPN.
            // Corporate servers in the 172.16.0.0/12 range bypass the tunnel
            // and go out the default gateway (ISP). Sensitive traffic to
            // cloud-hosted corporate services is unencrypted.
            id: 'routing_misconfig',
            name: 'Routing Table Misconfigured',
            ticketSubject: 'Split tunnel missing routes — traffic to 172.16.x.x bypassing VPN',
            ticketDetail: 'DLP flagged that user kthompson\'s traffic to the corporate cloud environment (172.16.50.0/24 hosted in AWS) is NOT going through the VPN tunnel. The split tunnel policy only includes 10.0.0.0/8 but misses the 172.16.0.0/12 range where our cloud servers live. All traffic to cloud-hosted ERP, SharePoint, and HR systems is traveling unencrypted over the public internet.',
            ticketExtra: 'Security Note: The split tunnel inclusion list was configured before we migrated services to AWS. The 172.16.0.0/12 range was never added. Immediate fix: add the missing route to the VPN split tunnel policy. Long-term: consider full tunnel mode for sensitive roles.',
            affectedHost: 0,
            fixDescription: 'Add missing 172.16.0.0/12 route to split tunnel policy',
            stateOverrides: { _routeMissing: true, _cloudTrafficExposed: true }
        },
        {
            // Scenario 3: Kill Switch Disabled
            // The VPN kill switch is disabled. When the tunnel drops
            // momentarily (Wi-Fi handoff, ISP hiccup), all traffic flows
            // unencrypted through the default gateway until the VPN
            // reconnects. DLP caught a 45-second window of unprotected traffic.
            id: 'kill_switch',
            name: 'Kill Switch Disabled',
            ticketSubject: 'VPN reconnection gap exposing traffic — kill switch is disabled',
            ticketDetail: 'DLP sensors captured a 45-second window where user kthompson\'s traffic was unencrypted. The VPN tunnel dropped during a Wi-Fi handoff between access points. Without a kill switch, all traffic immediately fell back to the default gateway and traveled over the public internet. The VPN reconnected automatically, but the damage window was 45 seconds of exposed corporate email and file transfers.',
            ticketExtra: 'Security Note: The VPN kill switch (also called "network lock") blocks all internet traffic when the VPN is disconnected. It was disabled during a troubleshooting session last week and never re-enabled. Without it, every tunnel drop creates a data exposure window. Enable it immediately.',
            affectedHost: 0,
            fixDescription: 'Enable VPN kill switch to prevent traffic during tunnel drops',
            stateOverrides: { _killSwitchOff: true, _gapDetected: true }
        },
        {
            // Scenario 4: IPv6 Leak
            // The VPN only tunnels IPv4 traffic. The user's machine has IPv6
            // enabled and their ISP provides IPv6 connectivity. All IPv6-capable
            // sites are accessed outside the tunnel via the ISP's IPv6 route.
            id: 'ipv6_leak',
            name: 'IPv6 Leak',
            ticketSubject: 'IPv6 traffic bypassing VPN tunnel — dual-stack leak detected',
            ticketDetail: 'Network monitoring detected that user mchen (LAPTOP-REMOTE-12) is sending IPv6 traffic directly to the internet, bypassing the VPN. The VPN client only creates an IPv4 tunnel. Since the user\'s ISP provides native IPv6, all dual-stack websites (Google, Microsoft 365, AWS) are accessed via IPv6 outside the tunnel. This exposes browsing to the ISP and bypasses all corporate security controls.',
            ticketExtra: 'Security Note: This is a dual-stack IPv6 leak. The VPN client does not tunnel IPv6. When the OS prefers IPv6 (which is default per RFC 6724), traffic to dual-stack destinations routes outside the tunnel via the ISP. Fix: either disable IPv6 on the VPN adapter, or configure the client to block IPv6 while connected.',
            affectedHost: 0,
            fixDescription: 'Block or tunnel IPv6 traffic to prevent dual-stack bypass',
            stateOverrides: { _ipv6Leaking: true, _dualStackActive: true }
        }
    ],

    // ==========================================================
    // PER-SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Open the VPN Dashboard to see the current split tunnel and routing config.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use the terminal: dns-check, route-table, traffic-monitor, vpn-client status.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different leak source: DNS, WebRTC, routes, kill switch, or IPv6.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after you seal the leak with the correct fix command.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        dns_leak: [
            { id: 'hint1', text: 'DNS queries are going to 8.8.8.8 instead of through the VPN. Check DNS config.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "dns-check" to see which DNS server is resolving queries. It should be 10.0.2.10.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The VPN client is not forcing DNS through the tunnel. The OS resolver is using a cached ISP DNS.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: vpn-client set dns-policy tunnel-only — forces all DNS through the VPN.', cost: 150, penalty: -150 }
        ],
        webrtc_exposure: [
            { id: 'hint1', text: 'WebRTC STUN requests bypass the VPN, exposing the real public IP address.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "webrtc-check" to see the leak. The real IP 73.162.45.89 is exposed via STUN.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'WebRTC must be disabled or proxied. The VPN client has a WebRTC protection setting.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: vpn-client set webrtc-policy block — blocks WebRTC STUN outside the tunnel.', cost: 150, penalty: -150 }
        ],
        routing_misconfig: [
            { id: 'hint1', text: 'The split tunnel only routes 10.0.0.0/8. Cloud servers on 172.16.x.x bypass the VPN.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "route-table" to see current VPN routes. Note the missing 172.16.0.0/12 entry.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Add the missing route with the vpn-client route management command.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: vpn-client add-route 172.16.0.0/12 — adds the cloud network to the split tunnel.', cost: 150, penalty: -150 }
        ],
        kill_switch: [
            { id: 'hint1', text: 'The kill switch is disabled. When the tunnel drops, traffic goes unencrypted.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "vpn-client status" to check kill switch state. It shows DISABLED.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The kill switch was disabled during troubleshooting last week. Re-enable it.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: vpn-client set kill-switch enable — blocks all traffic when VPN drops.', cost: 150, penalty: -150 }
        ],
        ipv6_leak: [
            { id: 'hint1', text: 'IPv6 traffic is not tunneled by the VPN. Dual-stack sites are accessed via ISP IPv6.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "traffic-monitor" to see IPv6 traffic bypassing the tunnel. Look for IPv6 destinations.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The VPN is IPv4-only. IPv6 must be blocked or tunneled while the VPN is active.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: vpn-client set ipv6-policy block — blocks IPv6 while VPN is connected.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !VPN002Config._flagRestored) {
            VPN002Config._flagRestored = true;
            var scenario = VPN002Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                VPN002Config.hints = VPN002Config._scenarioHints[scenario.id] || VPN002Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;

        // Reset all state flags
        engine.state._dnsLeaking = false;
        engine.state._ispDnsActive = false;
        engine.state._webrtcLeaking = false;
        engine.state._realIpExposed = false;
        engine.state._routeMissing = false;
        engine.state._cloudTrafficExposed = false;
        engine.state._killSwitchOff = false;
        engine.state._gapDetected = false;
        engine.state._ipv6Leaking = false;
        engine.state._dualStackActive = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        var overrides = VPN002Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }

        var scenario = VPN002Config._scenarios[idx];
        VPN002Config._flagRestored = true;
        VPN002Config.hints = VPN002Config._scenarioHints[scenario.id] || VPN002Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return VPN002Config._scenarios[engine.state._scenarioId];
    },

    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active security alert assigned.\nOpen the VPN Alert first to receive your assignment.';
        }
        return null;
    },

    _escHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // ==========================================================
    // BOOT SEQUENCE
    // ==========================================================

    boot: {
        biosLines: [
            'Dell Latitude 7440 — POST...',
            'Intel Core i7-1365U — 16 GB DDR5',
            'NVMe: Samsung PM9A1 512GB',
            'Wi-Fi: Intel AX211 802.11ax',
            'TPM 2.0: Enabled — BitLocker Active',
            'UEFI Secure Boot: Enabled',
            'Loading Windows 11 Enterprise...'
        ],
        grubEntries: [
            'Windows 11 Enterprise 23H2',
            'Windows Recovery Environment'
        ],
        loginUser: 'Security-Analyst'
    },

    // ==========================================================
    // DESKTOP ICONS
    // ==========================================================

    desktop: {
        icons: [
            { id: 'cmd',           label: 'Security\nTerminal',   icon: '>_',  app: 'terminal' },
            { id: 'vpn_dashboard', label: 'VPN\nDashboard',       icon: 'VPN', app: 'vpn_dashboard' },
            { id: 'traffic_mon',   label: 'Traffic\nMonitor',     icon: 'NET', app: 'traffic_monitor' },
            { id: 'ticket',        label: 'VPN\nAlert',           icon: 'DLP', app: 'ticket' },
            { id: 'hints',         label: 'Hints',                icon: '?',   app: 'hints' },
            { id: 'reset',         label: 'Reset\nLab',           icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG
    // ==========================================================

    terminal: {
        user: 'Security-Analyst',
        hostname: 'SEC-WS01',
        startDir: 'C:\\Users\\Security-Analyst',
        promptStyle: 'windows',
        welcome: 'Microsoft Windows [Version 10.0.22631]\nSecurity Operations Workstation — VPN Leak Analysis Console\nType "help" for available commands.\n'
    },

    filesystem: { '/': { type: 'dir', children: {} } },

    flags: [ { id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 } ],

    scoring: {
        base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0,
        minScore: 0,
        speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800
    },

    hints: [
        { id: 'hint1', text: 'Open the VPN Dashboard and review split tunnel configuration.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use CLI: dns-check, webrtc-check, route-table, traffic-monitor.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different leak type.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after sealing the leak.', cost: 50, penalty: -50 }
    ],

    lore: {
        intro: 'DLP sensors flagged suspicious traffic from a remote worker. Corporate data is leaking outside the VPN tunnel. As the security analyst on shift, identify the leak source and seal it.',
        scenario: 'Each scenario represents a different VPN leak vector — DNS leaks, WebRTC exposure, missing routes, kill switch gaps, and IPv6 bypass.',
        outro: 'Leak sealed. Your investigation identified the data exposure path and applied the correct remediation to protect corporate traffic.'
    },

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the DLP alert and check VPN client configuration.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the specific leak vector using traffic analysis and diagnostic tools.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix to seal the leak and verify no data exposure.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm the leak is sealed and capture the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // COMMANDS
    // ==========================================================

    commands: {

        // dns-check — tests which DNS server is resolving queries
        'dns-check': function(args, term, engine) {
            var gate = VPN002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN002Config._getScenario(engine);

            if (scenario && scenario.id === 'dns_leak' && engine.state._dnsLeaking && !engine.state._labComplete) {
                return '\nDNS Leak Test Results:\n=============================================================\n  Test Query: whoami.hexworth.local\n  Expected Resolver:  10.0.2.10 (Corporate DNS via VPN)\n  Actual Resolver:    8.8.8.8 (Google Public DNS via ISP)\n\n  DNS Path: LAPTOP -> ISP Gateway -> 8.8.8.8 (BYPASSES VPN)\n\n  [LEAK DETECTED] DNS queries are NOT going through the VPN tunnel.\n  The OS resolver is using a cached ISP DNS server.\n  All browsing history is visible to the ISP.\n\n  Resolution: Force DNS through VPN tunnel.\n  Command: vpn-client set dns-policy tunnel-only';
            }
            return '\nDNS Leak Test Results:\n=============================================================\n  Test Query: whoami.hexworth.local\n  Resolver:   10.0.2.10 (Corporate DNS via VPN)\n  Status:     SECURE — DNS is tunneled correctly.';
        },

        // webrtc-check — tests for WebRTC IP leaks
        'webrtc-check': function(args, term, engine) {
            var gate = VPN002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN002Config._getScenario(engine);

            if (scenario && scenario.id === 'webrtc_exposure' && engine.state._webrtcLeaking && !engine.state._labComplete) {
                return '\nWebRTC Leak Test:\n=============================================================\n  VPN IP:          10.0.2.107 (VPN tunnel address)\n  Public IP (VPN): 203.0.113.10 (VPN exit node)\n\n  WebRTC STUN Result:\n  [LEAK] Local IP:   192.168.1.45 (home LAN — exposed)\n  [LEAK] Public IP:  73.162.45.89 (real ISP IP — exposed)\n  STUN Server:       stun.l.google.com:19302\n\n  WebRTC is exposing the real public IP (73.162.45.89)\n  despite the VPN tunnel being active.\n\n  Resolution: Block WebRTC STUN outside tunnel.\n  Command: vpn-client set webrtc-policy block';
            }
            return '\nWebRTC Leak Test:\n=============================================================\n  VPN IP:     10.0.2.107\n  WebRTC:     BLOCKED — no leak detected.\n  Status:     SECURE';
        },

        // route-table — displays the OS routing table
        'route-table': function(args, term, engine) {
            var gate = VPN002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN002Config._getScenario(engine);

            var routes = '\nRouting Table:\n=============================================================\n  Destination        Mask              Gateway          Interface      Metric\n  0.0.0.0/0          0.0.0.0           192.168.1.1      Wi-Fi          25\n  10.0.0.0/8         255.0.0.0         10.0.2.1         VPN-Tunnel0    5\n  10.0.2.0/24        255.255.255.0     On-link          VPN-Tunnel0    5\n  192.168.1.0/24     255.255.255.0     On-link          Wi-Fi          25';

            // Missing route scenario shows 172.16 going via default gateway
            if (scenario && scenario.id === 'routing_misconfig' && engine.state._routeMissing && !engine.state._labComplete) {
                routes += '\n\n  [!] NOTE: No route for 172.16.0.0/12\n  Traffic to 172.16.x.x uses default route (192.168.1.1 = ISP)\n  Corporate cloud servers (172.16.50.0/24) are NOT tunneled.';
            } else if (engine.state._labComplete && scenario && scenario.id === 'routing_misconfig') {
                routes += '\n  172.16.0.0/12     255.240.0.0       10.0.2.1         VPN-Tunnel0    5';
            }

            return routes;
        },

        // traffic-monitor — shows real-time traffic flow analysis
        'traffic-monitor': function(args, term, engine) {
            var gate = VPN002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN002Config._getScenario(engine);

            var output = '\nTraffic Monitor — Live Flow Analysis:\n=============================================================';

            if (scenario && scenario.id === 'ipv6_leak' && engine.state._ipv6Leaking && !engine.state._labComplete) {
                output += '\n  [VPN]  TCP4  10.0.2.107:49721 -> 10.0.2.50:443       HTTPS (corp intranet)\n  [VPN]  TCP4  10.0.2.107:49722 -> 10.0.2.30:445       SMB (file share)';
                output += '\n  [ISP]  TCP6  2601:644:8a00::1f -> 2607:f8b0:4004::69  HTTPS (google.com)\n  [ISP]  TCP6  2601:644:8a00::1f -> 2620:1ec:21::14     HTTPS (office.com)\n  [ISP]  TCP6  2601:644:8a00::1f -> 2600:1f18:243e::34  HTTPS (aws-erp.corp)';
                output += '\n\n  [LEAK] 3 flows via IPv6 are BYPASSING the VPN tunnel.\n  IPv6 traffic routes directly through ISP, not through VPN.\n  Fix: vpn-client set ipv6-policy block';
                return output;
            }

            if (scenario && scenario.id === 'kill_switch' && engine.state._killSwitchOff && !engine.state._labComplete) {
                output += '\n  [VPN]  TCP4  10.0.2.107:49721 -> 10.0.2.50:443       HTTPS (corp intranet)';
                output += '\n\n  Traffic Gap Analysis (last 24 hours):\n  09:14:22 — VPN tunnel dropped (Wi-Fi handoff)\n  09:14:22 — Kill switch: DISABLED — traffic NOT blocked\n  09:14:23 — [ISP] TCP4 192.168.1.45 -> 52.96.166.34:443  HTTPS (outlook)\n  09:14:24 — [ISP] TCP4 192.168.1.45 -> 13.107.42.14:443  HTTPS (sharepoint)\n  09:14:25 — [ISP] SMB  192.168.1.45 -> 10.0.2.30:445     FILE TRANSFER\n  ...(42 more unprotected flows)...\n  09:15:07 — VPN tunnel reconnected\n\n  [LEAK] 45 seconds of unencrypted traffic detected.\n  Kill switch was DISABLED — re-enable immediately.\n  Fix: vpn-client set kill-switch enable';
                return output;
            }

            output += '\n  [VPN]  TCP4  10.0.2.107:49721 -> 10.0.2.50:443       HTTPS (corp intranet)\n  [VPN]  TCP4  10.0.2.107:49722 -> 10.0.2.30:445       SMB (file share)\n  [VPN]  TCP4  10.0.2.107:49723 -> 10.0.2.10:53        DNS\n\n  All traffic flowing through VPN tunnel. No leaks detected.';
            return output;
        },

        // vpn-client — VPN client management and configuration
        'vpn-client': function(args, term, engine) {
            var gate = VPN002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN002Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // vpn-client status — shows full client configuration
            if (joined === 'status' || joined === '') {
                var ks = (scenario && scenario.id === 'kill_switch' && engine.state._killSwitchOff && !engine.state._labComplete) ? 'DISABLED' : 'ENABLED';
                var dns = (scenario && scenario.id === 'dns_leak' && engine.state._dnsLeaking && !engine.state._labComplete) ? 'System Default (8.8.8.8)' : 'Tunnel Only (10.0.2.10)';
                var webrtc = (scenario && scenario.id === 'webrtc_exposure' && engine.state._webrtcLeaking && !engine.state._labComplete) ? 'ALLOWED (leaking)' : 'BLOCKED';
                var ipv6 = (scenario && scenario.id === 'ipv6_leak' && engine.state._ipv6Leaking && !engine.state._labComplete) ? 'ALLOWED (leaking)' : 'BLOCKED';

                return '\nVPN Client Status:\n=============================================================\n  Connection:     CONNECTED\n  Server:         vpn.hexworth.local (203.0.113.10)\n  Tunnel IP:      10.0.2.107\n  Protocol:       IKEv2/IPSec\n  Encryption:     AES-256-CBC\n  Uptime:         2h 14m\n  Split Tunnel:   Enabled\n  Kill Switch:    ' + ks + '\n  DNS Policy:     ' + dns + '\n  WebRTC Policy:  ' + webrtc + '\n  IPv6 Policy:    ' + ipv6;
            }

            // Fix DNS leak — force DNS through tunnel
            if (joined.includes('set') && joined.includes('dns-policy') && joined.includes('tunnel')) {
                if (scenario && scenario.id === 'dns_leak' && engine.state._dnsLeaking) {
                    engine.state._dnsLeaking = false;
                    engine.state._ispDnsActive = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('DNS leak sealed. All queries now through VPN.', 'success'); }, 400);
                    return '\nDNS Policy Updated:\n  Previous:  System Default (queries to 8.8.8.8 via ISP)\n  New:       Tunnel Only (queries to 10.0.2.10 via VPN)\n\nFlushing DNS cache... OK\nVerifying DNS resolution...\n  hexworth.local -> 10.0.2.10 (via VPN tunnel) OK\n  google.com -> 10.0.2.10 (via VPN tunnel) OK\n\nDNS Leak Test: PASSED — no leaks detected.\n\n=== FLAG: VPN002{dns_leak_sealed_tunnel_only} ===';
                }
            }

            // Fix WebRTC leak — block STUN outside tunnel
            if (joined.includes('set') && joined.includes('webrtc') && joined.includes('block')) {
                if (scenario && scenario.id === 'webrtc_exposure' && engine.state._webrtcLeaking) {
                    engine.state._webrtcLeaking = false;
                    engine.state._realIpExposed = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('WebRTC leak sealed. Real IP no longer exposed.', 'success'); }, 400);
                    return '\nWebRTC Policy Updated:\n  Previous:  ALLOWED (STUN bypasses VPN)\n  New:       BLOCKED (STUN requests dropped)\n\nApplying browser policy...\n  Chrome WebRTC: Disabled via enterprise policy\n  Edge WebRTC:   Disabled via enterprise policy\n  Firefox:       media.peerconnection.enabled = false\n\nWebRTC Leak Test: PASSED\n  Real IP 73.162.45.89: NOT exposed\n  Only VPN IP 10.0.2.107 visible\n\n=== FLAG: VPN002{webrtc_stun_blocked_ip_hidden} ===';
                }
            }

            // Fix routing — add missing 172.16.0.0/12 route
            if (joined.includes('add-route') && joined.includes('172.16')) {
                if (scenario && scenario.id === 'routing_misconfig' && engine.state._routeMissing) {
                    engine.state._routeMissing = false;
                    engine.state._cloudTrafficExposed = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Route added. Cloud traffic now tunneled.', 'success'); }, 400);
                    return '\nSplit Tunnel Route Added:\n  Network:   172.16.0.0/12\n  Gateway:   10.0.2.1 (VPN Tunnel)\n  Metric:    5\n\nVerifying routing...\n  tracert 172.16.50.10 (AWS ERP):\n    1  10.0.2.1     1ms   (VPN gateway)\n    2  10.0.1.1     3ms   (corporate backbone)\n    3  172.16.50.10 8ms   (AWS ERP server)\n\n  Traffic to cloud services now routes through VPN tunnel.\n  DLP re-scan: No leaks detected.\n\n=== FLAG: VPN002{split_tunnel_route_172_16_added} ===';
                }
            }

            // Fix kill switch — re-enable it
            if (joined.includes('set') && joined.includes('kill-switch') && joined.includes('enable')) {
                if (scenario && scenario.id === 'kill_switch' && engine.state._killSwitchOff) {
                    engine.state._killSwitchOff = false;
                    engine.state._gapDetected = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Kill switch enabled. No more traffic gaps.', 'success'); }, 400);
                    return '\nKill Switch Updated:\n  Previous:  DISABLED (traffic flows unprotected on tunnel drop)\n  New:       ENABLED (all traffic blocked when VPN disconnects)\n\nTesting kill switch...\n  Simulating tunnel disconnect...\n  All outbound traffic: BLOCKED (firewall rules active)\n  DNS queries: BLOCKED\n  ICMP: BLOCKED\n  Reconnecting tunnel...\n  Traffic resumed through VPN.\n\nKill Switch Test: PASSED — zero-second exposure window.\n\n=== FLAG: VPN002{kill_switch_enabled_zero_gap} ===';
                }
            }

            // Fix IPv6 leak — block IPv6 while VPN active
            if (joined.includes('set') && joined.includes('ipv6') && joined.includes('block')) {
                if (scenario && scenario.id === 'ipv6_leak' && engine.state._ipv6Leaking) {
                    engine.state._ipv6Leaking = false;
                    engine.state._dualStackActive = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('IPv6 leak sealed. Dual-stack bypass blocked.', 'success'); }, 400);
                    return '\nIPv6 Policy Updated:\n  Previous:  ALLOWED (IPv6 traffic bypasses VPN)\n  New:       BLOCKED (IPv6 disabled on all adapters while VPN active)\n\nApplying IPv6 block...\n  Wi-Fi adapter IPv6: DISABLED\n  Ethernet IPv6:      DISABLED\n  VPN adapter:        IPv4 only (unchanged)\n\nTraffic Monitor:\n  All flows now IPv4 via VPN tunnel.\n  No IPv6 traffic detected.\n  google.com: 142.250.80.46 via VPN (IPv4 forced)\n\n=== FLAG: VPN002{ipv6_leak_blocked_v4_only} ===';
                }
            }

            return '\nUsage:\n  vpn-client status                 Show client configuration\n  vpn-client set dns-policy tunnel-only   Force DNS through VPN\n  vpn-client set webrtc-policy block      Block WebRTC STUN\n  vpn-client add-route <network>          Add split tunnel route\n  vpn-client set kill-switch enable       Enable kill switch\n  vpn-client set ipv6-policy block        Block IPv6 while on VPN';
        },

        help: function() {
            return '\nAvailable Commands:\n=============================================================\n  dns-check              Test for DNS leaks\n  webrtc-check           Test for WebRTC IP leaks\n  route-table            Show VPN routing table\n  traffic-monitor        Live traffic flow analysis\n  vpn-client status      VPN client configuration\n  vpn-client set ...     Configure VPN client policies\n  vpn-client add-route   Add split tunnel route\n  ping <target>          ICMP ping\n  cls                    Clear screen';
        },

        ping: function(args, term, engine) {
            var gate = VPN002Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping <target>';
            return '\nPING ' + args[0] + ': 56 data bytes\n64 bytes from ' + args[0] + ': icmp_seq=1 ttl=64 time=8ms\n1 packets transmitted, 1 received, 0% packet loss';
        },

        whoami: function() { return 'SEC-WS01\\Security-Analyst'; },
        hostname: function() { return 'SEC-WS01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['vpn_dashboard', 'traffic_monitor'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the VPN Alert first to receive your assignment.', 'error');
            return;
        }
        switch (iconDef.app) {
            case 'ticket':          VPN002Config._openTicket(iconDef, engine); break;
            case 'vpn_dashboard':   VPN002Config._openDashboard(iconDef, engine); break;
            case 'traffic_monitor': VPN002Config._openTrafficMonitor(iconDef, engine); break;
            case 'reset_lab':       VPN002Config._confirmReset(engine); break;
        }
    },

    // ==========================================================
    // TICKET WINDOW
    // ==========================================================

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'VPN Security Alert', 'DLP', container);
        VPN002Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { VPN002Config._renderTicket(engine, container); }
        else { VPN002Config._renderScenarioPicker(engine, container); }
    },

    _renderScenarioPicker(engine, container) {
        var previews = [
            'DLP — "DNS queries bypassing VPN to ISP resolver 8.8.8.8 — browsing history exposed"',
            'DLP — "WebRTC STUN exposing real public IP 73.162.45.89 despite VPN connection"',
            'DLP — "Traffic to 172.16.x.x cloud servers not routed through VPN tunnel"',
            'DLP — "45-second unencrypted gap detected during Wi-Fi handoff — kill switch off"',
            'DLP — "IPv6 traffic bypassing VPN — dual-stack sites accessed via ISP directly"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#7c3aed; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">DATA LEAK INCIDENT QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select a leak incident to investigate, or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        VPN002Config._scenarios.forEach(function(s, i) {
            html += '<button class="vpn-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#7c3aed; font-weight:bold;">DLP-' + (2000 + i) + '</span>'
                + '<span style="background:#dc2626; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">HIGH</span></div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="vpnRandomBtn" style="padding:10px 28px; background:#7c3aed; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button></div>';

        container.innerHTML = html;
        container.querySelectorAll('.vpn-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#7c3aed'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                VPN002Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                VPN002Config._renderTicket(engine, container);
            });
        });
        document.getElementById('vpnRandomBtn').addEventListener('click', function() {
            VPN002Config._applyScenario(engine, Math.floor(Math.random() * VPN002Config._scenarios.length));
            VPN002Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        var scenario = VPN002Config._getScenario(engine);
        var alert = VPN002Config._alerts[0];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#7c3aed; font-weight:bold; font-size:1rem;">INCIDENT #DLP-' + (2000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#dc2626; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">SEVERITY: HIGH</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">AFFECTED USER</div>'
            + '<div style="font-weight:bold; color:#7c3aed;">' + alert.user + ' (' + alert.host + ')</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + VPN002Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + VPN002Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SECURITY NOTES</div>'
            + '<div style="background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#c4b5fd;">'
            + VPN002Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU — Security Analyst</div></div>';
    },

    // ==========================================================
    // VPN DASHBOARD
    // ==========================================================

    _openDashboard(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'vpnDashContainer';
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'VPN Client Dashboard', 'VPN', container);

        var scenario = VPN002Config._getScenario(engine);
        var html = '<div style="color:#7c3aed; font-weight:bold; font-size:1rem; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">VPN Client Dashboard</div>';

        // Connection status
        html += '<div style="padding:12px; margin-bottom:16px; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; text-align:center;">'
            + '<div style="color:#22c55e; font-weight:bold; font-size:1.1rem;">CONNECTED</div>'
            + '<div style="color:#888; font-size:0.7rem;">vpn.hexworth.local — IKEv2/IPSec — AES-256</div></div>';

        // Config items with leak indicators
        var items = [
            { label: 'DNS Policy', value: (scenario && scenario.id === 'dns_leak' && engine.state._dnsLeaking && !engine.state._labComplete) ? 'System Default (LEAKING)' : 'Tunnel Only', leak: scenario && scenario.id === 'dns_leak' && engine.state._dnsLeaking && !engine.state._labComplete },
            { label: 'Kill Switch', value: (scenario && scenario.id === 'kill_switch' && engine.state._killSwitchOff && !engine.state._labComplete) ? 'DISABLED' : 'ENABLED', leak: scenario && scenario.id === 'kill_switch' && engine.state._killSwitchOff && !engine.state._labComplete },
            { label: 'WebRTC', value: (scenario && scenario.id === 'webrtc_exposure' && engine.state._webrtcLeaking && !engine.state._labComplete) ? 'ALLOWED (leak risk)' : 'BLOCKED', leak: scenario && scenario.id === 'webrtc_exposure' && engine.state._webrtcLeaking && !engine.state._labComplete },
            { label: 'IPv6', value: (scenario && scenario.id === 'ipv6_leak' && engine.state._ipv6Leaking && !engine.state._labComplete) ? 'ALLOWED (leak risk)' : 'BLOCKED', leak: scenario && scenario.id === 'ipv6_leak' && engine.state._ipv6Leaking && !engine.state._labComplete },
            { label: 'Split Tunnel', value: 'Enabled — 10.0.0.0/8' + ((scenario && scenario.id === 'routing_misconfig' && engine.state._routeMissing && !engine.state._labComplete) ? ' (172.16.0.0/12 MISSING)' : ''), leak: scenario && scenario.id === 'routing_misconfig' && engine.state._routeMissing && !engine.state._labComplete }
        ];

        html += '<div style="margin-bottom:16px;">';
        items.forEach(function(item) {
            var color = item.leak ? '#dc2626' : '#22c55e';
            html += '<div style="display:flex; justify-content:space-between; padding:8px 12px; margin-bottom:4px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;">'
                + '<span>' + item.label + '</span><span style="color:' + color + '; font-weight:bold;">' + item.value + '</span></div>';
        });
        html += '</div>';

        if (engine.state._flagRevealed) {
            html += '<div style="padding:12px; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; text-align:center;">'
                + '<div style="color:#22c55e; font-weight:bold;">LEAK SEALED</div>'
                + '<div style="color:#888; font-size:0.75rem; margin-top:4px;">All traffic securely tunneled.</div></div>';
        }

        html += '<div style="margin-top:16px; color:#888; font-size:0.75rem;">Use "vpn-client status" in the terminal for full details.</div>';
        container.innerHTML = html;
    },

    // ==========================================================
    // TRAFFIC MONITOR WINDOW
    // ==========================================================

    _openTrafficMonitor(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Traffic Monitor', 'NET', container);
        container.innerHTML = '<div style="color:#7c3aed; font-weight:bold; font-size:1rem; margin-bottom:12px;">Live Traffic Monitor</div>'
            + '<div style="color:#888; font-size:0.75rem;">Use "traffic-monitor" in the terminal for detailed flow analysis.</div>'
            + '<div style="color:#888; font-size:0.75rem;">Use "dns-check" to test for DNS leaks.</div>'
            + '<div style="color:#888; font-size:0.75rem;">Use "webrtc-check" to test for WebRTC leaks.</div>';
    },

    // ==========================================================
    // RESET LAB
    // ==========================================================

    _confirmReset(engine) {
        if (confirm('Reset this lab? All progress will be lost.')) { engine.resetLab(); }
    }
};
