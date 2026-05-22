/* ============================================================
   DISPATCH LAB — Box VPN004: VPN Performance
   CompTIA Network+ N10-009 / Security+ SY0-701 — VPN Optimization
   Config: Encryption overhead, MTU/MSS mismatch, server CPU
   saturated, bandwidth throttling, protocol selection
   5 distinct scenarios
   ============================================================ */

var VPN004Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'VPN Performance',
    subtitle: 'VPN Throughput Degraded — Diagnose and Optimize',
    difficulty: 'Intermediate',
    accent: '#7c3aed',
    storageKey: 'hexworth_lab_vpn004',
    registryId: 'vpn004-performance-bottleneck',
    trackerKey: 'lab_vpn004',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Performance Ticket',
                tip: 'Double-click the VPN Ticket icon to read the performance complaint.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Check the Performance Dashboard',
                tip: 'Open the Performance Dashboard to review throughput metrics and resource usage.',
                trigger: { event: 'window_open', match: { type: 'perf_dashboard' } }
            },
            {
                title: 'Investigate with CLI tools',
                tip: 'Use the terminal to run throughput tests, check CPU, review protocol settings, and test MTU.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:show' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:throughput' } },
                        { event: 'command', match: { cmd: 'contains:perf' } },
                        { event: 'command', match: { cmd: 'contains:ipsec' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Optimize the VPN configuration to restore throughput.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:set' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:optimize' } },
                        { event: 'command', match: { cmd: 'contains:switch' } },
                        { event: 'command', match: { cmd: 'contains:offload' } }
                    ]
                }
            },
            {
                title: 'Capture the flag',
                tip: 'After fixing the bottleneck, the flag will appear.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES
    // ==========================================================

    certObjectives: {
        certPath: 'Network+ N10-009 / Security+ SY0-701',
        mappings: [
            { flagId: 'fixed', objective: '3.3', description: 'Given a scenario, troubleshoot common network service issues', skill: 'VPN Performance Optimization' },
            { flagId: 'fixed', objective: '4.1', description: 'Explain common security concepts', skill: 'Encryption/Protocol Selection' }
        ]
    },

    // ==========================================================
    // ALERT DATA
    // ==========================================================

    _alerts: [
        { id: 'PERF-2026-0401', severity: 'HIGH', engine: 'FortiGate VPN Gateway v7.4', host: 'FW-HQ-01', user: 'All branch users', detected: '2026-04-01 10:30:00' }
    ],

    // ==========================================================
    // SCENARIO FLAGS
    // ==========================================================

    _scenarioFlags: {
        encryption_overhead: null,
        mtu_mss_mismatch:    null,
        cpu_saturated:       null,
        bw_throttled:        null,
        protocol_wrong:      null
    },

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            // Scenario 0: Encryption Overhead
            // Tunnel uses AES-256-CBC with SHA-512 HMAC and no hardware
            // offload. The FortiASIC NP7 can handle AES-256-GCM in hardware
            // but CBC+SHA-512 falls back to software crypto, crushing throughput.
            id: 'encryption_overhead',
            name: 'Encryption Overhead',
            ticketSubject: 'VPN throughput dropped from 900 Mbps to 180 Mbps after security audit changes',
            ticketDetail: 'After a security audit last week, the VPN encryption was changed from AES-256-GCM to AES-256-CBC with SHA-512 HMAC for "stronger security." Since then, VPN throughput dropped from 900 Mbps to 180 Mbps. Branch users report sluggish file transfers, video conferencing lag, and RDP input delays. The WAN link is 1 Gbps and is only 20% utilized.',
            ticketExtra: 'NOC Note: The FortiASIC NP7 chip offloads AES-GCM to hardware. AES-CBC with separate HMAC is processed in software by the CPU. GCM provides authenticated encryption in a single pass — it is both faster AND provides integrity. The audit team was mistaken. Switch back to AES-256-GCM to restore hardware offload.',
            affectedHost: 0,
            fixDescription: 'Switch encryption to AES-256-GCM to leverage hardware crypto offload',
            stateOverrides: { _softwareCrypto: true, _slowThroughput: true }
        },
        {
            // Scenario 1: MTU/MSS Mismatch
            // Tunnel MTU set to 1500 but path MTU is 1420 due to ISP overhead.
            // TCP MSS not clamped. Large TCP segments get fragmented, causing
            // reassembly overhead and retransmissions that cut throughput in half.
            id: 'mtu_mss_mismatch',
            name: 'MTU/MSS Mismatch',
            ticketSubject: 'VPN throughput inconsistent — file transfers fast then stall repeatedly',
            ticketDetail: 'Branch users report that file transfers start fast then stall every few seconds. Speed tests show wildly inconsistent results between 50 Mbps and 400 Mbps, averaging around 200 Mbps. The WAN link is 1 Gbps. Small HTTP requests and DNS work fine. The problem only affects large data transfers (files, backups, video). The ISP changed their MTU on the WAN link last week from 1500 to 1420 bytes.',
            ticketExtra: 'NOC Note: When the tunnel MTU exceeds the path MTU, large packets are fragmented. With DF bit set, they are dropped. Without DF bit, fragmentation causes reassembly overhead and retransmissions. The tunnel MSS clamp is not configured — TCP negotiates a full 1460-byte MSS that exceeds the effective tunnel payload. Set MSS to account for path MTU minus ESP and IP overhead.',
            affectedHost: 0,
            fixDescription: 'Set tunnel MSS clamp to prevent fragmentation',
            stateOverrides: { _mssNotClamped: true, _fragmenting: true }
        },
        {
            // Scenario 2: Server CPU Saturated
            // The VPN gateway CPU is at 97% because a misconfigured deep
            // inspection policy is scanning all VPN tunnel traffic. The DPI
            // engine was supposed to only scan inbound internet traffic.
            id: 'cpu_saturated',
            name: 'Server CPU Saturated',
            ticketSubject: 'VPN gateway at 97% CPU — all tunnels degraded to 50 Mbps',
            ticketDetail: 'All site-to-site VPN tunnels are experiencing severe throughput degradation. The VPN gateway FW-HQ-01 shows 97% CPU utilization. Every tunnel is throttled to approximately 50 Mbps regardless of the WAN link capacity. The issue started after a configuration change was pushed to the firewall yesterday evening. Normal CPU usage for this gateway is 15-25%.',
            ticketExtra: 'NOC Note: Change CR-2026-0412 enabled deep packet inspection (DPI) on policy ID 15, which handles VPN tunnel traffic. DPI should only apply to internet-bound traffic (policy ID 10), not internal tunnel traffic. The DPI engine is scanning every packet flowing through every tunnel, consuming all CPU resources. Disable DPI on tunnel traffic.',
            affectedHost: 0,
            fixDescription: 'Remove deep packet inspection from VPN tunnel traffic policy',
            stateOverrides: { _cpuOverloaded: true, _dpiOnTunnel: true }
        },
        {
            // Scenario 3: Bandwidth Throttling
            // The ISP is throttling IPSec traffic (UDP 500/4500 and ESP) to
            // 100 Mbps. The WAN link is 1 Gbps but the ISP traffic policy
            // rate-limits VPN protocols. Confirmed by testing non-VPN traffic
            // at full speed.
            id: 'bw_throttled',
            name: 'Bandwidth Throttling',
            ticketSubject: 'VPN capped at 100 Mbps despite 1 Gbps WAN link — ISP throttling suspected',
            ticketDetail: 'VPN throughput is consistently capped at exactly 100 Mbps in both directions. The WAN link is 1 Gbps and non-VPN speedtests confirm full bandwidth is available. The tunnel is healthy with zero errors or retransmissions. The consistent 100 Mbps cap suggests external rate-limiting rather than a configuration issue on our side. This started after the ISP rolled out new traffic management policies last week.',
            ticketExtra: 'NOC Note: The ISP confirmed they implemented DPI-based traffic management. They are rate-limiting "tunneled traffic" (ESP, UDP 500/4500) to 100 Mbps as part of their new fair-use policy. Options: (1) Switch to TLS-based VPN on port 443 which looks like HTTPS traffic, (2) Negotiate with ISP for a business-class exemption. The quick fix is protocol switching.',
            affectedHost: 0,
            fixDescription: 'Switch VPN protocol from IPSec to SSL/TLS on port 443 to bypass throttling',
            stateOverrides: { _ispThrottling: true, _cappedAt100: true }
        },
        {
            // Scenario 4: Protocol Selection
            // The tunnel uses IKEv1 with aggressive mode (deprecated, slower).
            // IKEv1 aggressive mode is also a security risk (exposes hash).
            // Upgrading to IKEv2 gives better performance, faster failover,
            // MOBIKE support, and improved security.
            id: 'protocol_wrong',
            name: 'Protocol Selection',
            ticketSubject: 'VPN tunnel using deprecated IKEv1 aggressive mode — slow and insecure',
            ticketDetail: 'During a security assessment, it was discovered that the HQ-to-Branch01 tunnel is still running IKEv1 in aggressive mode. This was the original configuration from 5 years ago and was never upgraded. IKEv1 aggressive mode is slower (more round trips during negotiation), lacks MOBIKE support (causing disconnects on path changes), and exposes the preshared key hash in cleartext during Phase 1 negotiation.',
            ticketExtra: 'NOC Note: IKEv2 provides: (1) Fewer round trips = faster setup, (2) MOBIKE = seamless failover, (3) EAP support, (4) Built-in NAT-T, (5) No preshared key hash exposure. The branch firewall was upgraded to support IKEv2 last month. Both sides are ready — just need to switch the tunnel configuration. Throughput improvement expected: 15-20% from reduced overhead.',
            affectedHost: 0,
            fixDescription: 'Upgrade tunnel from IKEv1 aggressive mode to IKEv2',
            stateOverrides: { _ikev1Active: true, _aggressiveMode: true }
        }
    ],

    // ==========================================================
    // PER-SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Open the Performance Dashboard to see throughput metrics and resource usage.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal: throughput-test, show perf, show ipsec crypto, show cpu.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different bottleneck: crypto, MTU, CPU, ISP, or protocol.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after removing the bottleneck.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        encryption_overhead: [
            { id: 'hint1', text: 'Throughput dropped after switching encryption. Check if hardware crypto offload is active.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show ipsec crypto" to see which cipher suite is in use and whether it uses hardware offload.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'AES-256-CBC with SHA-512 runs in software. AES-256-GCM uses the FortiASIC hardware offload.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: ipsec set encryption aes-256-gcm — switches to hardware-accelerated authenticated encryption.', cost: 150, penalty: -150 }
        ],
        mtu_mss_mismatch: [
            { id: 'hint1', text: 'Large transfers stall. Small requests work fine. This points to MTU/fragmentation issues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show mtu-stats" to see fragmentation counters and current MSS configuration.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Path MTU is 1420. ESP overhead ~58 bytes. TCP/IP 40 bytes. MSS should be 1420-58-40 = 1322.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: ipsec set tunnel-mss 1322 — clamps TCP MSS to prevent fragmentation.', cost: 150, penalty: -150 }
        ],
        cpu_saturated: [
            { id: 'hint1', text: 'All tunnels degraded equally. Check VPN gateway CPU usage and running processes.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show cpu" to see what is consuming CPU. Look for DPI or IPS engine usage.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'DPI was enabled on tunnel traffic policy (ID 15). It should only apply to internet policy (ID 10).', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: firewall set policy 15 dpi disable — removes DPI from VPN tunnel traffic.', cost: 150, penalty: -150 }
        ],
        bw_throttled: [
            { id: 'hint1', text: 'Consistent 100 Mbps cap with no errors. Non-VPN traffic runs at full speed. ISP throttling.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "throughput-test" to confirm the cap. Run "throughput-test --no-vpn" to test without VPN.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'ISP is rate-limiting ESP/IKE traffic. Switch to SSL VPN on port 443 to look like HTTPS.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: ipsec switch-protocol ssl-vpn-443 — reconfigures tunnel to use TLS on port 443.', cost: 150, penalty: -150 }
        ],
        protocol_wrong: [
            { id: 'hint1', text: 'IKEv1 aggressive mode is deprecated, slower, and exposes the PSK hash. Upgrade to IKEv2.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show ipsec protocol" to see the current IKE version and mode in use.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'IKEv2 has fewer round trips, built-in NAT-T, MOBIKE, and no PSK hash exposure.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: ipsec set ike-version 2 — upgrades the tunnel from IKEv1 to IKEv2.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !VPN004Config._flagRestored) {
            VPN004Config._flagRestored = true;
            var scenario = VPN004Config._scenarios[engine.state._scenarioId];
            if (scenario) { VPN004Config.hints = VPN004Config._scenarioHints[scenario.id] || VPN004Config._defaultHints; }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._softwareCrypto = false;
        engine.state._slowThroughput = false;
        engine.state._mssNotClamped = false;
        engine.state._fragmenting = false;
        engine.state._cpuOverloaded = false;
        engine.state._dpiOnTunnel = false;
        engine.state._ispThrottling = false;
        engine.state._cappedAt100 = false;
        engine.state._ikev1Active = false;
        engine.state._aggressiveMode = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        var overrides = VPN004Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }
        VPN004Config._flagRestored = true;
        VPN004Config.hints = VPN004Config._scenarioHints[VPN004Config._scenarios[idx].id] || VPN004Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : VPN004Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active performance incident assigned.\nOpen the VPN Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    // ==========================================================
    // BOOT / DESKTOP / TERMINAL / FLAGS / SCORING
    // ==========================================================

    boot: {
        biosLines: ['Fortinet FortiGate 600F — POST...', 'FortiASIC NP7 + CP9 (Hardware Crypto)', 'Memory: 16384 MB DDR4', '10x GE RJ45, 4x 10GE SFP+', 'FortiOS v7.4.3 loading...'],
        grubEntries: ['FortiOS v7.4.3 (Primary)', 'FortiOS v7.2.8 (Backup)'],
        loginUser: 'VPN-Admin'
    },

    desktop: {
        icons: [
            { id: 'cmd',            label: 'VPN\nTerminal',         icon: '>_',  app: 'terminal' },
            { id: 'perf_dashboard', label: 'Performance\nDashboard', icon: 'PRF', app: 'perf_dashboard' },
            { id: 'traffic_mon',    label: 'Throughput\nMonitor',   icon: 'NET', app: 'throughput_mon' },
            { id: 'ticket',         label: 'VPN\nTicket',           icon: 'TKT', app: 'ticket' },
            { id: 'hints',          label: 'Hints',                 icon: '?',   app: 'hints' },
            { id: 'reset',          label: 'Reset\nLab',            icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'VPN-Admin', hostname: 'FW-HQ-01', startDir: '/', promptStyle: 'cisco', welcome: 'FortiGate FW-HQ-01 v7.4.3 — VPN Performance Console\nType "help" for available commands.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [ { id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 } ],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [ { id: 'hint1', text: 'Check the Performance Dashboard for throughput metrics.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Run throughput-test, show perf, show cpu in the terminal.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Each scenario has a different bottleneck.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'The flag appears after optimization.', cost: 50, penalty: -50 } ],

    lore: {
        intro: 'Branch users are complaining about VPN performance. Throughput is well below what the WAN link should support. As the network engineer on call, identify the bottleneck and optimize the tunnel.',
        scenario: 'Each scenario targets a different performance bottleneck — encryption overhead, MTU/MSS fragmentation, CPU saturation, ISP throttling, or protocol inefficiency.',
        outro: 'Performance restored. Your optimization removed the bottleneck and restored VPN throughput to expected levels.'
    },

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the performance ticket and check throughput metrics.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the bottleneck using throughput tests and system metrics.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the optimization to remove the bottleneck.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm throughput is restored and capture the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // COMMANDS
    // ==========================================================

    commands: {

        // show — performance metrics, crypto config, CPU, MTU stats, protocol
        'show': function(args, term, engine) {
            var gate = VPN004Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN004Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // show perf — throughput summary
            if (joined.includes('perf')) {
                var tp = engine.state._labComplete ? '920 Mbps' : (engine.state._softwareCrypto ? '180 Mbps' : engine.state._fragmenting ? '200 Mbps (inconsistent)' : engine.state._cpuOverloaded ? '50 Mbps' : engine.state._cappedAt100 ? '100 Mbps (exact cap)' : engine.state._ikev1Active ? '650 Mbps' : '920 Mbps');
                var cpu = engine.state._cpuOverloaded && !engine.state._labComplete ? '97%' : (engine.state._softwareCrypto && !engine.state._labComplete ? '82%' : '18%');
                return '\nVPN Performance Summary:\n=============================================================\n  Tunnel:          HQ-to-Branch01\n  WAN Link:        1 Gbps (1000 Mbps)\n  VPN Throughput:  ' + tp + '\n  CPU Usage:       ' + cpu + '\n  Packet Loss:     0%\n  Latency:         8ms (WAN RTT)\n  Errors:          ' + (engine.state._fragmenting && !engine.state._labComplete ? '14,892 fragment drops' : '0');
            }

            // show ipsec crypto — encryption configuration and offload status
            if (joined.includes('crypto') || joined.includes('cipher')) {
                if (scenario && scenario.id === 'encryption_overhead' && engine.state._softwareCrypto && !engine.state._labComplete) {
                    return '\nIPSec Crypto Configuration:\n=============================================================\n  Encryption:   AES-256-CBC\n  Auth:         SHA-512-HMAC (separate)\n  Mode:         CBC (Cipher Block Chaining)\n  Offload:      SOFTWARE (FortiASIC NP7 does NOT support CBC+SHA-512)\n  Throughput:   ~180 Mbps (CPU-bound)\n\n  [!] FortiASIC NP7 supports AES-GCM hardware offload.\n  CBC mode with separate HMAC requires software crypto.\n  Switch to AES-256-GCM for authenticated encryption in hardware.';
                }
                return '\nIPSec Crypto Configuration:\n=============================================================\n  Encryption:   AES-256-GCM (authenticated)\n  Offload:      HARDWARE (FortiASIC NP7)\n  Throughput:   ~920 Mbps (hardware-accelerated)';
            }

            // show cpu — CPU utilization breakdown
            if (joined.includes('cpu')) {
                if (scenario && scenario.id === 'cpu_saturated' && engine.state._cpuOverloaded && !engine.state._labComplete) {
                    return '\nCPU Utilization — FW-HQ-01:\n=============================================================\n  Total CPU:     97%\n  Kernel:        12%\n  User:          4%\n  DPI Engine:    68%  <-- ANOMALOUS\n  IPS Engine:    8%\n  IPSec Crypto:  5%\n\n  [!] DPI engine consuming 68% CPU.\n  DPI is running on VPN tunnel traffic (Policy ID 15).\n  Expected: DPI on internet traffic only (Policy ID 10).\n  Fix: firewall set policy 15 dpi disable';
                }
                if (scenario && scenario.id === 'encryption_overhead' && engine.state._softwareCrypto && !engine.state._labComplete) {
                    return '\nCPU Utilization — FW-HQ-01:\n=============================================================\n  Total CPU:     82%\n  Kernel:        8%\n  User:          2%\n  IPSec Crypto:  67%  <-- SOFTWARE ENCRYPTION\n  DPI Engine:    3%\n  IPS Engine:    2%\n\n  [!] Software crypto consuming 67% CPU.\n  AES-256-CBC runs in software — not offloaded to NP7 ASIC.';
                }
                return '\nCPU Utilization — FW-HQ-01:\n=============================================================\n  Total CPU:     18%\n  All processes within normal range.';
            }

            // show mtu-stats — MTU and fragmentation counters
            if (joined.includes('mtu')) {
                if (scenario && scenario.id === 'mtu_mss_mismatch' && engine.state._mssNotClamped && !engine.state._labComplete) {
                    return '\nMTU / MSS Statistics:\n=============================================================\n  WAN Interface MTU:    1500\n  Path MTU (measured):  1420 (ISP reduced from 1500)\n  ESP Overhead:         ~58 bytes\n  Effective Max:        1362 bytes\n  TCP MSS (negotiated): 1460 bytes  <-- TOO LARGE\n  MSS Clamp:            Not configured\n\n  Fragmentation Counters (last hour):\n    Packets fragmented:   14,892\n    Fragment reassembly:  14,012\n    Reassembly failures:  880\n    Retransmissions:      2,340\n\n  [!] TCP MSS exceeds effective tunnel capacity.\n  Fix: ipsec set tunnel-mss 1322 (1420 - 58 - 40)';
                }
                return '\nMTU / MSS Statistics:\n=============================================================\n  Path MTU: 1420   MSS Clamp: ' + (engine.state._labComplete ? '1322' : 'Not configured') + '\n  Fragmentation: 0 drops';
            }

            // show ipsec protocol — IKE version and mode
            if (joined.includes('protocol') || joined.includes('ike')) {
                if (scenario && scenario.id === 'protocol_wrong' && engine.state._ikev1Active && !engine.state._labComplete) {
                    return '\nIPSec Protocol Configuration:\n=============================================================\n  IKE Version:    1 (IKEv1)  <-- DEPRECATED\n  Mode:           Aggressive  <-- INSECURE (PSK hash exposed)\n  Round Trips:    9 (setup) + 6 (rekey)\n  NAT-T:          Manual configuration required\n  MOBIKE:         Not supported (IKEv1)\n  PSK Exposure:   YES — hash sent in cleartext in Phase 1\n  Setup Time:     ~850ms\n\n  [!] IKEv1 aggressive mode is deprecated and insecure.\n  IKEv2 provides: fewer round trips (4), built-in NAT-T,\n  MOBIKE for seamless failover, no PSK hash exposure.\n  Fix: ipsec set ike-version 2';
                }
                return '\nIPSec Protocol Configuration:\n=============================================================\n  IKE Version:  2 (IKEv2)\n  Mode:         Standard\n  Round Trips:  4 (setup) + 2 (rekey)\n  NAT-T:        Built-in\n  MOBIKE:       Enabled\n  Setup Time:   ~320ms';
            }

            return '\nAvailable show commands:\n  show perf             VPN throughput summary\n  show ipsec crypto     Encryption and offload status\n  show cpu              CPU utilization breakdown\n  show mtu-stats        MTU/MSS and fragmentation stats\n  show ipsec protocol   IKE version and mode';
        },

        // throughput-test — runs a bandwidth test through the tunnel
        'throughput-test': function(args, term, engine) {
            var gate = VPN004Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN004Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // Non-VPN test (for ISP throttling comparison)
            if (joined.includes('--no-vpn') || joined.includes('direct')) {
                if (scenario && scenario.id === 'bw_throttled' && engine.state._ispThrottling && !engine.state._labComplete) {
                    return '\nThroughput Test (Direct — No VPN):\n=============================================================\n  Server:        speedtest.hexworth.local (direct WAN)\n  Download:      948 Mbps\n  Upload:        921 Mbps\n  Latency:       2ms\n\n  [!] Full bandwidth available WITHOUT VPN.\n  Tunnel is capped at 100 Mbps. ISP is throttling VPN protocols.';
                }
            }

            if (engine.state._labComplete) {
                return '\nThroughput Test (VPN Tunnel):\n=============================================================\n  Tunnel:        HQ-to-Branch01\n  Download:      920 Mbps\n  Upload:        908 Mbps\n  Latency:       8ms\n  Jitter:        1ms\n\n  RESULT: PASS — throughput within expected range for 1 Gbps WAN.';
            }

            var tp = '920';
            if (engine.state._softwareCrypto) tp = '180';
            else if (engine.state._fragmenting) tp = '200';
            else if (engine.state._cpuOverloaded) tp = '50';
            else if (engine.state._cappedAt100) tp = '100';
            else if (engine.state._ikev1Active) tp = '650';

            return '\nThroughput Test (VPN Tunnel):\n=============================================================\n  Tunnel:        HQ-to-Branch01\n  Download:      ' + tp + ' Mbps\n  Upload:        ' + (parseInt(tp) - 10) + ' Mbps\n  Latency:       8ms\n  WAN Capacity:  1000 Mbps\n  Utilization:   ' + (parseInt(tp) / 10).toFixed(0) + '%\n\n  RESULT: DEGRADED — throughput significantly below WAN capacity.';
        },

        // ipsec — configuration commands for crypto, MSS, protocol
        'ipsec': function(args, term, engine) {
            var gate = VPN004Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN004Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // Fix encryption overhead — switch to AES-256-GCM
            if (joined.includes('set') && joined.includes('encryption') && joined.includes('gcm')) {
                if (scenario && scenario.id === 'encryption_overhead' && engine.state._softwareCrypto) {
                    engine.state._softwareCrypto = false;
                    engine.state._slowThroughput = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Hardware crypto offload activated. Throughput restored.', 'success'); }, 400);
                    return '\nEncryption Update:\n================================\n  Previous:  AES-256-CBC + SHA-512-HMAC (SOFTWARE)\n  New:       AES-256-GCM (HARDWARE — FortiASIC NP7)\n\nRestarting tunnel with new crypto...\n  IKE Phase 1: Re-negotiated with GCM proposal\n  Phase 2:     SA installed (AES-256-GCM)\n  Offload:     FortiASIC NP7 ACTIVE\n  CPU Usage:   82% -> 18% (offloaded)\n\nThroughput Test:\n  Before:  180 Mbps (software crypto)\n  After:   920 Mbps (hardware offload)\n\n=== FLAG: VPN004{aes256_gcm_hardware_offload_activated} ===';
                }
            }

            // Fix MTU/MSS — set tunnel MSS clamp
            if (joined.includes('set') && joined.includes('tunnel-mss')) {
                if (scenario && scenario.id === 'mtu_mss_mismatch' && engine.state._mssNotClamped) {
                    var mssMatch = joined.match(/tunnel-mss\s+(\d+)/);
                    var mssVal = mssMatch ? parseInt(mssMatch[1]) : 0;
                    if (mssVal >= 1280 && mssVal <= 1340) {
                        engine.state._mssNotClamped = false;
                        engine.state._fragmenting = false;
                        engine.state._labComplete = true;
                        engine.state._flagRevealed = true;
                        engine.save();
                        setTimeout(function() { engine.notify('MSS clamped. Fragmentation eliminated. Throughput restored.', 'success'); }, 400);
                        return '\nTunnel MSS Clamp Applied:\n================================\n  Previous MSS: 1460 (default — causes fragmentation)\n  New MSS:      ' + mssVal + '\n  Path MTU:     1420\n  ESP Overhead:  58 bytes\n\nClearing fragment counters...\nTesting throughput...\n  Before:  200 Mbps (fragmentation overhead)\n  After:   910 Mbps (zero fragmentation)\n  Fragments: 0\n  Retransmissions: 0\n\n=== FLAG: VPN004{mss_clamped_' + mssVal + '_zero_fragments} ===';
                    }
                    return '\nWARNING: MSS ' + mssVal + ' may not be optimal.\nPath MTU: 1420, ESP overhead: 58, TCP/IP: 40\nRecommended: 1420 - 58 - 40 = 1322\nUsage: ipsec set tunnel-mss <value>';
                }
            }

            // Fix protocol — upgrade IKEv1 to IKEv2
            if (joined.includes('set') && joined.includes('ike-version') && joined.includes('2')) {
                if (scenario && scenario.id === 'protocol_wrong' && engine.state._ikev1Active) {
                    engine.state._ikev1Active = false;
                    engine.state._aggressiveMode = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('IKEv2 activated. Performance and security improved.', 'success'); }, 400);
                    return '\nProtocol Upgrade:\n================================\n  Previous:  IKEv1 Aggressive Mode (deprecated)\n  New:       IKEv2 Standard Mode\n\nRe-establishing tunnel...\n  IKEv2 Phase 1:  4 round trips (was 9 with IKEv1)\n  Setup Time:     320ms (was 850ms)\n  MOBIKE:         Enabled\n  NAT-T:          Built-in\n  PSK Exposure:   NONE (was exposed in IKEv1 aggressive)\n\nThroughput Test:\n  Before:  650 Mbps (IKEv1 overhead)\n  After:   920 Mbps (IKEv2 optimized)\n\n=== FLAG: VPN004{ikev2_upgrade_secure_and_fast} ===';
                }
            }

            // Switch protocol for ISP throttling
            if (joined.includes('switch') && joined.includes('ssl') && joined.includes('443')) {
                if (scenario && scenario.id === 'bw_throttled' && engine.state._ispThrottling) {
                    engine.state._ispThrottling = false;
                    engine.state._cappedAt100 = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Protocol switched to SSL/TLS on 443. ISP throttle bypassed.', 'success'); }, 400);
                    return '\nProtocol Switch:\n================================\n  Previous:  IPSec (ESP + UDP 500/4500) — throttled by ISP\n  New:       SSL VPN over TLS 1.3 on port 443\n\nReconfiguring tunnel...\n  SSL handshake:   OK (TLS 1.3)\n  Tunnel type:     DTLS over UDP 443 (data) + TLS over TCP 443 (control)\n  Encryption:      AES-256-GCM (same security level)\n  ISP detection:   Traffic appears as standard HTTPS\n\nThroughput Test:\n  Before:  100 Mbps (ISP throttled ESP/IKE)\n  After:   915 Mbps (TLS on 443 — not throttled)\n\n=== FLAG: VPN004{ssl_vpn_443_isp_throttle_bypassed} ===';
                }
            }

            return '\nUsage:\n  ipsec set encryption aes-256-gcm     Switch to hardware-offloaded GCM\n  ipsec set tunnel-mss <value>         Clamp TCP MSS\n  ipsec set ike-version 2              Upgrade to IKEv2\n  ipsec switch-protocol ssl-vpn-443    Switch to SSL VPN on 443';
        },

        // firewall — policy management (DPI removal)
        'firewall': function(args, term, engine) {
            var gate = VPN004Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN004Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('set') && joined.includes('policy') && joined.includes('15') && joined.includes('dpi') && joined.includes('disable')) {
                if (scenario && scenario.id === 'cpu_saturated' && engine.state._cpuOverloaded) {
                    engine.state._cpuOverloaded = false;
                    engine.state._dpiOnTunnel = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('DPI removed from tunnel traffic. CPU recovered.', 'success'); }, 400);
                    return '\nFirewall Policy Update:\n================================\n  Policy ID 15 (VPN Tunnel Traffic):\n    DPI:    Enabled -> DISABLED\n    IPS:    Retained (lightweight)\n\n  CPU Recovery:\n    Before:  97% (DPI engine: 68%)\n    After:   18% (DPI engine: 0%)\n\nThroughput Test:\n  Before:  50 Mbps (CPU-bound)\n  After:   920 Mbps (CPU recovered)\n\n  DPI remains active on Policy ID 10 (Internet traffic).\n  VPN tunnel traffic no longer scanned by DPI engine.\n\n=== FLAG: VPN004{dpi_removed_policy15_cpu_recovered} ===';
                }
            }
            return '\nUsage:\n  firewall set policy <id> dpi <enable|disable>\n  firewall show policy <id>';
        },

        help: function() {
            return '\nAvailable Commands:\n=============================================================\n  show perf              Throughput summary\n  show ipsec crypto      Encryption and offload status\n  show cpu               CPU utilization\n  show mtu-stats         MTU/MSS and fragmentation\n  show ipsec protocol    IKE version and mode\n  throughput-test        Run bandwidth test\n  throughput-test --no-vpn  Test without VPN\n  ipsec set ...          Configure IPSec parameters\n  ipsec switch-protocol  Change VPN protocol\n  firewall set ...       Modify firewall policies\n  ping <target>          ICMP ping\n  cls                    Clear screen';
        },

        ping: function(args, term, engine) {
            var gate = VPN004Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping <target>';
            return '\nPING ' + args[0] + ': 56 data bytes\n64 bytes from ' + args[0] + ': icmp_seq=1 ttl=64 time=8ms';
        },

        whoami: function() { return 'VPN-Admin@FW-HQ-01'; },
        hostname: function() { return 'FW-HQ-01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['perf_dashboard', 'throughput_mon'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the VPN Ticket first to receive your assignment.', 'error');
            return;
        }
        switch (iconDef.app) {
            case 'ticket':         VPN004Config._openTicket(iconDef, engine); break;
            case 'perf_dashboard': VPN004Config._openPerfDashboard(iconDef, engine); break;
            case 'throughput_mon': VPN004Config._openThroughputMon(iconDef, engine); break;
            case 'reset_lab':     VPN004Config._confirmReset(engine); break;
        }
    },

    // ==========================================================
    // TICKET WINDOW
    // ==========================================================

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'VPN Performance Ticket', 'TKT', c);
        VPN004Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { VPN004Config._renderTicket(engine, c); }
        else { VPN004Config._renderPicker(engine, c); }
    },

    _renderPicker(engine, container) {
        var previews = [
            'NOC — "Throughput dropped from 900 to 180 Mbps after encryption change"',
            'NOC — "File transfers start fast then stall — ISP changed WAN MTU"',
            'NOC — "Gateway at 97% CPU — all tunnels degraded to 50 Mbps"',
            'NOC — "VPN capped at exactly 100 Mbps — ISP throttling suspected"',
            'NOC — "Tunnel still on IKEv1 aggressive mode — slow and insecure"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#7c3aed; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">PERFORMANCE INCIDENT QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select a performance incident or get a random assignment.</div></div><div style="margin-bottom:16px;">';

        VPN004Config._scenarios.forEach(function(s, i) {
            html += '<button class="vpn-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between;"><span style="color:#7c3aed; font-weight:bold;">PERF-' + (4000 + i) + '</span>'
                + '<span style="background:#f59e0b; color:#000; padding:1px 8px; border-radius:3px; font-size:0.65rem;">HIGH</span></div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="vpnRandomBtn" style="padding:10px 28px; background:#7c3aed; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button></div>';

        container.innerHTML = html;
        container.querySelectorAll('.vpn-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#7c3aed'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() { VPN004Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); VPN004Config._renderTicket(engine, container); });
        });
        document.getElementById('vpnRandomBtn').addEventListener('click', function() {
            VPN004Config._applyScenario(engine, Math.floor(Math.random() * VPN004Config._scenarios.length));
            VPN004Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        var scenario = VPN004Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between;"><span style="color:#7c3aed; font-weight:bold; font-size:1rem;">INCIDENT #PERF-' + (4000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#f59e0b; color:#000; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">HIGH</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + VPN004Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + VPN004Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">NOC NOTES</div>'
            + '<div style="background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#c4b5fd;">'
            + VPN004Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU — Network Engineer (On-Call)</div>';
    },

    // ==========================================================
    // PERFORMANCE DASHBOARD
    // ==========================================================

    _openPerfDashboard(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.id = 'perfDashContainer';
        c.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Performance Dashboard', 'PRF', c);

        var tp = engine.state._labComplete ? '920' : (engine.state._softwareCrypto ? '180' : engine.state._fragmenting ? '200' : engine.state._cpuOverloaded ? '50' : engine.state._cappedAt100 ? '100' : engine.state._ikev1Active ? '650' : '920');
        var cpu = engine.state._cpuOverloaded && !engine.state._labComplete ? '97' : (engine.state._softwareCrypto && !engine.state._labComplete ? '82' : '18');
        var tpColor = parseInt(tp) > 800 ? '#22c55e' : parseInt(tp) > 300 ? '#f59e0b' : '#dc2626';

        var html = '<div style="color:#7c3aed; font-weight:bold; font-size:1rem; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">VPN Performance Dashboard</div>';

        html += '<div style="display:flex; gap:12px; margin-bottom:16px;">'
            + '<div style="flex:1; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; text-align:center;">'
            + '<div style="color:#888; font-size:0.7rem;">Throughput</div><div style="color:' + tpColor + '; font-weight:bold; font-size:1.3rem;">' + tp + ' Mbps</div></div>'
            + '<div style="flex:1; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; text-align:center;">'
            + '<div style="color:#888; font-size:0.7rem;">CPU</div><div style="color:' + (parseInt(cpu) > 80 ? '#dc2626' : '#22c55e') + '; font-weight:bold; font-size:1.3rem;">' + cpu + '%</div></div>'
            + '<div style="flex:1; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; text-align:center;">'
            + '<div style="color:#888; font-size:0.7rem;">WAN Link</div><div style="color:#22c55e; font-weight:bold; font-size:1.3rem;">1 Gbps</div></div></div>';

        if (engine.state._flagRevealed) {
            html += '<div style="padding:12px; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; text-align:center;">'
                + '<div style="color:#22c55e; font-weight:bold;">PERFORMANCE RESTORED</div></div>';
        }
        html += '<div style="margin-top:12px; color:#888; font-size:0.75rem;">Use "show perf" and "throughput-test" in the terminal for details.</div>';
        c.innerHTML = html;
    },

    _openThroughputMon(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Throughput Monitor', 'NET', c);
        c.innerHTML = '<div style="color:#7c3aed; font-weight:bold; font-size:1rem; margin-bottom:12px;">Throughput Monitor</div>'
            + '<div style="color:#888;">Use "throughput-test" in the terminal for detailed bandwidth testing.</div>'
            + '<div style="color:#888;">Use "throughput-test --no-vpn" to test direct WAN speed.</div>';
    },

    _confirmReset(engine) { if (confirm('Reset this lab? All progress will be lost.')) { engine.resetLab(); } }
};
