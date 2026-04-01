/* ============================================================
   DISPATCH LAB — Box VPN001: VPN Tunnel Down
   CompTIA Network+ N10-009 / Security+ SY0-701 — IPSec VPN
   Config: IKE phase 1 mismatch, certificate expiry, NAT-T
   failure, MTU black hole, firewall blocking ESP
   5 distinct scenarios
   ============================================================ */

var VPN001Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'VPN Tunnel Down',
    subtitle: 'IPSec Site-to-Site Tunnel Failure',
    difficulty: 'Intermediate',
    accent: '#7c3aed',
    storageKey: 'hexworth_lab_vpn001',
    registryId: 'vpn001-tunnel-down',
    trackerKey: 'lab_vpn001',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the VPN Ticket',
                tip: 'Double-click the VPN Ticket icon to read the incident report and get your tunnel assignment.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Check the VPN Console',
                tip: 'Open the VPN Console to review tunnel status, IKE SA state, and peer connectivity.',
                trigger: { event: 'window_open', match: { type: 'vpn_console' } }
            },
            {
                title: 'Investigate with CLI tools',
                tip: 'Use the terminal to check IKE logs, verify certificates, test connectivity, or inspect firewall rules.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:show' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:ipsec' } },
                        { event: 'command', match: { cmd: 'contains:ping' } },
                        { event: 'command', match: { cmd: 'contains:cert' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Correct the tunnel configuration, renew the certificate, adjust MTU, or update firewall rules.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:set' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:renew' } },
                        { event: 'command', match: { cmd: 'contains:apply' } },
                        { event: 'command', match: { cmd: 'contains:allow' } }
                    ]
                }
            },
            {
                title: 'Capture the flag',
                tip: 'After resolving the tunnel issue, the flag will appear in the tool you used for remediation.',
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
            { flagId: 'fixed', objective: '3.1', description: 'Explain the purposes and properties of VPN tunneling protocols', skill: 'IPSec IKE Phase 1/2 Troubleshooting' },
            { flagId: 'fixed', objective: '4.5', description: 'Given a scenario, troubleshoot common network service issues', skill: 'VPN Tunnel Diagnostics' }
        ]
    },

    // ==========================================================
    // ALERT DATA
    // ==========================================================

    _alerts: [
        { id: 'VPN-2026-0101', severity: 'HIGH', engine: 'FortiGate VPN Gateway v7.4', host: 'FW-HQ-01', peer: '203.0.113.50', detected: '2026-04-01 06:12:33' },
        { id: 'VPN-2026-0102', severity: 'CRITICAL', engine: 'FortiGate VPN Gateway v7.4', host: 'FW-HQ-01', peer: '198.51.100.25', detected: '2026-04-01 06:14:07' },
        { id: 'VPN-2026-0103', severity: 'HIGH', engine: 'FortiGate VPN Gateway v7.4', host: 'FW-BR-01', peer: '203.0.113.50', detected: '2026-04-01 06:18:45' }
    ],

    // ==========================================================
    // SCENARIO FLAGS
    // ==========================================================

    _scenarioFlags: {
        ike_mismatch:     null,
        cert_expired:     null,
        nat_t_failure:    null,
        mtu_blackhole:    null,
        esp_blocked:      null
    },

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            // Scenario 0: IKE Phase 1 Mismatch
            // HQ uses AES-256/SHA-256/DH-14, branch defaulted to
            // AES-128/SHA-1/DH-2 after a firmware upgrade last night.
            // Student must identify the mismatch and align configs.
            id: 'ike_mismatch',
            name: 'IKE Phase 1 Mismatch',
            ticketSubject: 'Site-to-site VPN tunnel between HQ and Branch-01 will not establish',
            ticketDetail: 'The IPSec tunnel between FW-HQ-01 (203.0.113.10) and FW-BR-01 (203.0.113.50) has been down since the branch firewall was upgraded last night. IKE negotiation fails during Phase 1 with "no proposal chosen" errors. Both sides show the tunnel as DOWN. The branch office has lost all access to HQ resources including file shares, ERP, and email.',
            ticketExtra: 'NOC Note: Branch firewall was upgraded from FortiOS 7.2 to 7.4 last night. The upgrade reset the VPN crypto profile to defaults. HQ side was not changed. Phase 1 SA never forms. Check encryption, hash, and DH group on both sides.',
            affectedHost: 0,
            fixDescription: 'Align IKE Phase 1 parameters on the branch firewall to match HQ',
            stateOverrides: { _ikeMismatch: true, _phase1Down: true }
        },
        {
            // Scenario 1: Certificate Expired
            // IPSec tunnel uses certificate-based authentication.
            // Branch firewall cert expired 2 days ago (issued 1 year ago).
            // IKE Phase 1 fails with "certificate validation failed."
            id: 'cert_expired',
            name: 'Certificate Expired',
            ticketSubject: 'VPN tunnel down after branch firewall certificate expired',
            ticketDetail: 'The site-to-site tunnel between FW-HQ-01 and FW-BR-01 dropped at 00:00 on March 30. IKE Phase 1 authentication fails with a certificate error. The branch site uses a PKI certificate issued by our internal CA for tunnel authentication. The tunnel was stable for 364 days before suddenly failing. Branch staff cannot access any HQ resources.',
            ticketExtra: 'NOC Note: Certificate-based IKE authentication is in use. The branch firewall certificate was issued on March 30, 2025 with a 1-year validity. Today is April 1, 2026 — certificate is expired. Renew or regenerate the certificate and reimport the CA chain.',
            affectedHost: 0,
            fixDescription: 'Renew the expired certificate and re-establish the tunnel',
            stateOverrides: { _certExpired: true, _phase1Down: true }
        },
        {
            // Scenario 2: NAT-T Failure
            // Branch moved behind a new ISP router that performs CGNAT.
            // ESP (protocol 50) cannot traverse NAT without NAT-T (UDP 4500).
            // NAT-T detection succeeds but UDP 4500 is blocked by CGNAT device.
            id: 'nat_t_failure',
            name: 'NAT-T Failure',
            ticketSubject: 'VPN tunnel fails after branch office ISP change — NAT traversal suspected',
            ticketDetail: 'Branch-01 switched ISP providers yesterday. The new ISP placed the branch firewall behind a carrier-grade NAT device. The IPSec tunnel between FW-HQ-01 and FW-BR-01 has not come back up since the changeover. IKE Phase 1 negotiates partially but Phase 2 never completes. Packet captures show ESP packets being dropped at the NAT boundary.',
            ticketExtra: 'NOC Note: The new ISP uses CGNAT (100.64.0.0/10). NAT-T (UDP 4500 encapsulation) is required for ESP to pass through NAT. Verify NAT-T is enabled on both peers and that UDP 4500 is permitted through the ISP device. The ISP router management IP is 100.64.0.1.',
            affectedHost: 2,
            fixDescription: 'Enable NAT-T on both peers and verify UDP 4500 is open',
            stateOverrides: { _natTBlocked: true, _phase2Down: true }
        },
        {
            // Scenario 3: MTU Black Hole
            // Tunnel is technically UP but large packets are silently dropped.
            // ESP adds ~58 bytes overhead. An intermediate hop has 1400-byte MTU.
            // DF bit prevents fragmentation — classic black-hole behavior.
            id: 'mtu_blackhole',
            name: 'MTU Black Hole',
            ticketSubject: 'VPN tunnel is UP but large file transfers and RDP sessions hang',
            ticketDetail: 'The IPSec tunnel between FW-HQ-01 and FW-BR-01 shows as UP and IKE SAs are established. However, branch users report that small operations like ping and DNS work fine, but RDP sessions freeze after initial connection, large file copies stall at 0%, and web applications time out loading content. This started after the ISP performed backbone maintenance last week.',
            ticketExtra: 'NOC Note: Tunnel is UP, ping works (small packets). This is classic MTU black hole behavior — large packets exceed path MTU and the DF bit prevents fragmentation. The ESP overhead is ~58 bytes. Test with different packet sizes to find the break point. Adjust tunnel MSS or interface MTU accordingly.',
            affectedHost: 0,
            fixDescription: 'Identify the MTU break point and set correct tunnel MSS clamping',
            stateOverrides: { _mtuBlackhole: true, _tunnelUp: true }
        },
        {
            // Scenario 4: Firewall Blocking ESP
            // A new perimeter ACL for PCI compliance accidentally blocks
            // IP protocol 50 (ESP). IKE (UDP 500/4500) still works so Phase 1/2
            // succeed, but actual ESP data traffic is dropped by implicit deny.
            id: 'esp_blocked',
            name: 'Firewall Blocking ESP',
            ticketSubject: 'VPN Phase 1/2 complete but no traffic passes — ESP may be filtered',
            ticketDetail: 'The tunnel between FW-HQ-01 and FW-BR-01 shows IKE Phase 1 and Phase 2 as UP. SPIs are negotiated and SAs are installed. However, zero bytes of encrypted traffic are flowing through the tunnel. Ping across the tunnel times out. The branch office has been completely offline for 3 hours. A change request was implemented on the HQ perimeter firewall last night for PCI compliance.',
            ticketExtra: 'NOC Note: Change CR-2026-0388 was applied to FW-HQ-EDGE last night. The change tightened the perimeter ACL for PCI DSS compliance. The new ACL permits UDP 500 and UDP 4500 but does NOT explicitly permit IP protocol 50 (ESP). The implicit deny-all at the end of the ACL is dropping ESP packets.',
            affectedHost: 0,
            fixDescription: 'Add an explicit permit rule for IP protocol 50 (ESP) on the perimeter ACL',
            stateOverrides: { _espBlocked: true, _tunnelUp: true, _noTraffic: true }
        }
    ],

    // ==========================================================
    // PER-SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Open the VPN Console to review tunnel status and IKE SA state.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use the terminal: show ipsec sa, show ike sa, show firewall acl.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause: config mismatch, cert, NAT, MTU, or ACL.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after you apply the correct fix command.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        ike_mismatch: [
            { id: 'hint1', text: 'IKE Phase 1 failed with "no proposal chosen." Both peers must agree on encryption, hash, and DH group.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show ike config local" and "show ike config remote" to compare the two configurations side by side.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'HQ uses AES-256/SHA-256/DH-14. Branch defaulted to AES-128/SHA-1/DH-2 after the upgrade. Fix the branch side.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: ipsec set phase1 encryption aes-256 hash sha256 dhgroup 14', cost: 150, penalty: -150 }
        ],
        cert_expired: [
            { id: 'hint1', text: 'Certificate-based authentication is failing. Check the certificate validity dates.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show cert local" to view the branch firewall certificate details including expiry date.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The certificate expired on March 30, 2026. Use the cert management commands to renew it.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: cert renew branch-fw-01 — this generates a new CSR, signs it with the internal CA, and installs it.', cost: 150, penalty: -150 }
        ],
        nat_t_failure: [
            { id: 'hint1', text: 'The branch is behind CGNAT. ESP (IP protocol 50) cannot traverse NAT without NAT-T encapsulation.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show ipsec nat-t" to check if NAT-T is enabled and if UDP 4500 is being used.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'NAT-T detection works but UDP 4500 is blocked by the ISP CGNAT device. You need to enable NAT-T then open the port.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: ipsec set nat-t enable && firewall allow udp-4500', cost: 150, penalty: -150 }
        ],
        mtu_blackhole: [
            { id: 'hint1', text: 'Tunnel is UP but large packets fail. Classic MTU black hole: DF bit + undersized path MTU.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "ping-mtu 203.0.113.50" to discover the path MTU. Find where large packets fail.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Path MTU is 1400. ESP overhead is ~58 bytes. Tunnel MSS should be 1400 - 58 - 40 = 1302.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: ipsec set tunnel-mss 1302', cost: 150, penalty: -150 }
        ],
        esp_blocked: [
            { id: 'hint1', text: 'Phase 1 and 2 are UP (uses UDP 500/4500) but ESP data (IP proto 50) is not flowing. Check the perimeter ACL.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show firewall acl" to inspect the HQ perimeter rules. Look for an explicit ESP permit rule.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The PCI compliance change permits UDP 500 and 4500 but omits IP protocol 50. Implicit deny drops ESP.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: firewall add-rule permit proto-50 src 203.0.113.50 dst 203.0.113.10', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    // Checks if a scenario has been selected; restores hint state on reload
    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !VPN001Config._flagRestored) {
            VPN001Config._flagRestored = true;
            var scenario = VPN001Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                VPN001Config.hints = VPN001Config._scenarioHints[scenario.id] || VPN001Config._defaultHints;
            }
        }
        return true;
    },

    // Applies a chosen scenario index and resets all state flags
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;

        // Reset all scenario-specific state
        engine.state._ikeMismatch = false;
        engine.state._phase1Down = false;
        engine.state._certExpired = false;
        engine.state._natTBlocked = false;
        engine.state._phase2Down = false;
        engine.state._mtuBlackhole = false;
        engine.state._tunnelUp = false;
        engine.state._espBlocked = false;
        engine.state._noTraffic = false;
        engine.state._natTEnabled = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        // Apply scenario-specific overrides
        var overrides = VPN001Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) {
            engine.state[key] = overrides[key];
        }

        var scenario = VPN001Config._scenarios[idx];
        VPN001Config._flagRestored = true;
        VPN001Config.hints = VPN001Config._scenarioHints[scenario.id] || VPN001Config._defaultHints;

        engine.save();
    },

    // Returns the current scenario object or null
    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return VPN001Config._scenarios[engine.state._scenarioId];
    },

    // Gate check — returns error string if no scenario selected
    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active VPN incident assigned.\nOpen the VPN Ticket first to receive your assignment.';
        }
        return null;
    },

    // HTML-escape helper
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
            'Fortinet FortiGate 600F — POST...',
            'CPU: FortiASIC NP7 + CP9 Content Processor',
            'Memory Test: 16384 MB DDR4 OK',
            'Storage: 480 GB SSD (FortiOS + Logs)',
            'NIC: 10x GE RJ45, 4x 10GE SFP+',
            'FortiGuard License: Valid (Expires 2027-03-15)',
            'Loading FortiOS v7.4.3...'
        ],
        grubEntries: [
            'FortiOS v7.4.3 (Primary)',
            'FortiOS v7.2.8 (Backup)'
        ],
        loginUser: 'VPN-Admin'
    },

    // ==========================================================
    // DESKTOP ICONS
    // ==========================================================

    desktop: {
        icons: [
            { id: 'cmd',          label: 'VPN\nTerminal',          icon: '>_',  app: 'terminal' },
            { id: 'vpn_console',  label: 'VPN\nConsole',           icon: 'VPN', app: 'vpn_console' },
            { id: 'firewall',     label: 'Firewall\nLogs',         icon: 'FW',  app: 'firewall_logs' },
            { id: 'cert_mgr',     label: 'Certificate\nManager',   icon: 'CRT', app: 'cert_manager' },
            { id: 'ticket',       label: 'VPN\nTicket',            icon: 'TKT', app: 'ticket' },
            { id: 'hints',        label: 'Hints',                  icon: '?',   app: 'hints' },
            { id: 'reset',        label: 'Reset\nLab',             icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG
    // ==========================================================

    terminal: {
        user: 'VPN-Admin',
        hostname: 'FW-HQ-01',
        startDir: '/',
        promptStyle: 'cisco',
        welcome: 'FortiGate FW-HQ-01 v7.4.3 — VPN Management Console\nType "help" for available commands.\n'
    },

    // ==========================================================
    // FILESYSTEM
    // ==========================================================

    filesystem: {
        '/': { type: 'dir', children: {} }
    },

    // ==========================================================
    // FLAGS
    // ==========================================================

    flags: [
        { id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }
    ],

    // ==========================================================
    // SCORING
    // ==========================================================

    scoring: {
        base: 0,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ==========================================================
    // HINTS (default — overridden per scenario at runtime)
    // ==========================================================

    hints: [
        { id: 'hint1', text: 'Open the VPN Console and review tunnel status.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use CLI tools: show ipsec sa, show ike sa, show firewall acl.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag is revealed after successful remediation.', cost: 50, penalty: -50 }
    ],

    // ==========================================================
    // LORE
    // ==========================================================

    lore: {
        intro: 'The NOC dashboard is lit up with VPN tunnel alerts. The site-to-site IPSec tunnel between HQ and Branch-01 is down, and the branch office is completely cut off from corporate resources.',
        scenario: 'Each scenario represents a different IPSec failure mode — from IKE negotiation mismatches to certificate issues, NAT traversal problems, MTU black holes, and firewall misconfigurations.',
        outro: 'Tunnel restored. Your methodical troubleshooting identified the root cause and restored full site-to-site connectivity between HQ and the branch office.'
    },

    // ==========================================================
    // PHASES
    // ==========================================================

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the VPN ticket and check tunnel status from the console.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the root cause using IKE logs, certificate checks, and packet analysis.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix — align configs, renew certs, enable NAT-T, adjust MTU, or fix ACLs.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm the tunnel is re-established and traffic is flowing.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // COMMANDS
    // ==========================================================

    commands: {

        // show — displays IKE/IPSec SA state, configs, firewall ACL, certs
        'show': function(args, term, engine) {
            var gate = VPN001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // show ike sa — IKE Phase 1 Security Association state
            if (joined.includes('ike') && joined.includes('sa')) {
                if (scenario && (scenario.id === 'ike_mismatch' || scenario.id === 'cert_expired') && engine.state._phase1Down && !engine.state._labComplete) {
                    var errMsg = scenario.id === 'ike_mismatch' ? '"no proposal chosen" (IKE_SA_INIT)' : '"certificate validation failed" (AUTH)';
                    return '\nIKE SA Table:\n=============================================================\nPeer: 203.0.113.50 (FW-BR-01)\n  Status:      DOWN\n  Phase 1:     FAILED — No SA established\n  Last Error:  ' + errMsg + '\n  Retries:     47/50\n  Last Attempt: ' + VPN001Config._alerts[0].detected + '\n\nNo active IKE SAs.';
                }
                if (engine.state._labComplete) {
                    return '\nIKE SA Table:\n=============================================================\nPeer: 203.0.113.50 (FW-BR-01)\n  Status:      UP\n  Phase 1:     ESTABLISHED (IKEv2)\n  Encryption:  AES-256-CBC\n  Hash:        SHA-256\n  DH Group:    14 (2048-bit MODP)\n  Auth:        Certificate (RSA-2048)\n  Lifetime:    86400s (23h 58m remaining)\n\n1 active IKE SA.';
                }
                return '\nIKE SA Table:\n=============================================================\nPeer: 203.0.113.50 (FW-BR-01)\n  Status:      DOWN\n  Phase 1:     NEGOTIATING\n  Last Error:  Timeout\n\nNo active IKE SAs.';
            }

            // show ipsec sa — IPSec Phase 2 SA state
            if (joined.includes('ipsec') && joined.includes('sa')) {
                // NAT-T failure: Phase 1 up but Phase 2 fails because ESP cannot traverse NAT
                if (scenario && scenario.id === 'nat_t_failure' && engine.state._natTBlocked && !engine.state._labComplete) {
                    return '\nIPSec SA Table:\n=============================================================\nTunnel: HQ-to-Branch01\n  Phase 1:     UP (IKE SA Established)\n  Phase 2:     DOWN — SA negotiation timeout\n  ESP SPI:     Not established\n  NAT-T:       Detected (peer behind NAT)\n  NAT-T Port:  UDP 4500 — BLOCKED (no response)\n  Error:       ESP encapsulation failed; UDP 4500 unreachable\n\n0 active IPSec SAs.';
                }
                // ESP blocked: Phase 2 up but zero traffic flows because ESP is filtered
                if (scenario && scenario.id === 'esp_blocked' && engine.state._espBlocked && !engine.state._labComplete) {
                    return '\nIPSec SA Table:\n=============================================================\nTunnel: HQ-to-Branch01\n  Phase 1:     UP (IKE SA Established)\n  Phase 2:     UP (SA Installed)\n  ESP SPI In:  0xA3F28B4C\n  ESP SPI Out: 0x7D1E6A39\n  Encryption:  AES-256-CBC\n  Auth:        SHA-256-HMAC\n  Bytes In:    0\n  Bytes Out:   0\n  Packets In:  0\n  Packets Out: 0\n  Status:      NO TRAFFIC FLOWING\n\nWARNING: SA installed but 0 bytes transferred. ESP may be filtered upstream.';
                }
                // MTU black hole: tunnel up, only small packets pass
                if (scenario && scenario.id === 'mtu_blackhole' && engine.state._mtuBlackhole && !engine.state._labComplete) {
                    return '\nIPSec SA Table:\n=============================================================\nTunnel: HQ-to-Branch01\n  Phase 1:     UP (IKE SA Established)\n  Phase 2:     UP (SA Installed)\n  ESP SPI In:  0xB4E19C2D\n  ESP SPI Out: 0x6F3A8E51\n  Bytes In:    12,847\n  Bytes Out:   14,203\n  Packets In:  342 (avg size: 37 bytes)\n  Packets Out: 389 (avg size: 36 bytes)\n  Errors:      PMTU exceeded (1847 drops)\n  Tunnel MSS:  Not configured (default: 1460)\n\nNOTE: Only small packets passing. Large packets silently dropped.';
                }
                // Lab complete — healthy tunnel
                if (engine.state._labComplete) {
                    return '\nIPSec SA Table:\n=============================================================\nTunnel: HQ-to-Branch01\n  Phase 1:     UP\n  Phase 2:     UP\n  Bytes In:    1,247,832\n  Bytes Out:   1,089,441\n  Packets In:  8,234\n  Packets Out: 7,891\n\n1 active IPSec SA. Traffic flowing normally.';
                }
                return '\nIPSec SA Table:\n=============================================================\nNo active IPSec SAs.\nUse "show ike sa" to check IKE Phase 1 status.';
            }

            // show ike config — compares local/remote IKE proposals
            if (joined.includes('ike') && joined.includes('config')) {
                if (joined.includes('local') || joined.includes('hq')) {
                    return '\nIKE Configuration — Local (FW-HQ-01):\n=============================================================\n  Peer:          203.0.113.50 (FW-BR-01)\n  IKE Version:   2\n  Encryption:    AES-256-CBC\n  Hash:          SHA-256\n  DH Group:      14 (2048-bit MODP)\n  Auth Method:   Certificate (RSA-2048)\n  Lifetime:      86400 seconds\n  DPD:           Enabled (interval: 10s, retry: 3)\n  NAT-T:         Enabled';
                }
                if (joined.includes('remote') || joined.includes('branch')) {
                    // When IKE mismatch scenario is active, remote shows wrong params
                    if (scenario && scenario.id === 'ike_mismatch' && engine.state._ikeMismatch && !engine.state._labComplete) {
                        return '\nIKE Configuration — Remote (FW-BR-01):\n=============================================================\n  Peer:          203.0.113.10 (FW-HQ-01)\n  IKE Version:   2\n  Encryption:    AES-128-CBC        <-- MISMATCH (HQ: AES-256)\n  Hash:          SHA-1              <-- MISMATCH (HQ: SHA-256)\n  DH Group:      2 (1024-bit MODP)  <-- MISMATCH (HQ: DH-14)\n  Auth Method:   Certificate (RSA-2048)\n  Lifetime:      86400 seconds\n  DPD:           Enabled\n  NAT-T:         Enabled\n\nWARNING: 3 parameter mismatches detected with HQ peer.';
                    }
                    return '\nIKE Configuration — Remote (FW-BR-01):\n=============================================================\n  Peer:          203.0.113.10 (FW-HQ-01)\n  IKE Version:   2\n  Encryption:    AES-256-CBC\n  Hash:          SHA-256\n  DH Group:      14 (2048-bit MODP)\n  Auth Method:   Certificate (RSA-2048)\n  Lifetime:      86400 seconds';
                }
                return '\nUsage: show ike config local    (HQ side configuration)\n       show ike config remote   (Branch side configuration)';
            }

            // show ipsec nat-t — NAT-Traversal status
            if (joined.includes('nat-t') || joined.includes('natt')) {
                if (scenario && scenario.id === 'nat_t_failure' && engine.state._natTBlocked && !engine.state._labComplete) {
                    return '\nNAT-Traversal Status:\n=============================================================\n  NAT-T Enabled:     Yes (local)\n  NAT Detected:      Yes (peer behind CGNAT 100.64.0.0/10)\n  NAT-T Port:        UDP 4500\n  Keepalive:         20 seconds\n  Status:            FAILED\n  Error:             UDP 4500 — no response from peer\n\nDIAGNOSTIC: NAT-T detection succeeded but UDP 4500 traffic is\nnot reaching the peer. The CGNAT device may be blocking UDP 4500.';
                }
                return '\nNAT-Traversal Status:\n=============================================================\n  NAT-T Enabled:     Yes\n  NAT Detected:      ' + (engine.state._labComplete ? 'Yes' : 'No') + '\n  NAT-T Port:        UDP 4500\n  Status:            ' + (engine.state._labComplete ? 'ACTIVE' : 'STANDBY');
            }

            // show firewall acl — perimeter ACL rules
            if (joined.includes('firewall') && joined.includes('acl')) {
                var acl = '\nPerimeter ACL — FW-HQ-EDGE:\n=============================================================\n  Rule 10: PERMIT tcp any any eq 443        (HTTPS)\n  Rule 20: PERMIT tcp any any eq 80         (HTTP)\n  Rule 30: PERMIT udp any any eq 53         (DNS)\n  Rule 40: PERMIT udp any 203.0.113.10 eq 500   (IKE)\n  Rule 50: PERMIT udp any 203.0.113.10 eq 4500  (NAT-T)';
                // ESP blocked scenario omits protocol 50 from ACL
                if (scenario && scenario.id === 'esp_blocked' && engine.state._espBlocked && !engine.state._labComplete) {
                    acl += '\n  Rule 999: DENY ip any any                  (Implicit Deny)\n\n  [!] WARNING: No rule permits IP Protocol 50 (ESP).\n  ESP traffic from 203.0.113.50 is being dropped by Rule 999.';
                } else {
                    acl += '\n  Rule 55: PERMIT esp any 203.0.113.10       (ESP/IPSec)\n  Rule 999: DENY ip any any                  (Implicit Deny)';
                }
                return acl;
            }

            // show cert — certificate details
            if (joined.includes('cert')) {
                if (joined.includes('local') || joined.includes('branch')) {
                    if (scenario && scenario.id === 'cert_expired' && engine.state._certExpired && !engine.state._labComplete) {
                        return '\nCertificate — FW-BR-01 (Local):\n=============================================================\n  Subject:     CN=FW-BR-01.corp.hexworth.local\n  Issuer:      CN=Hexworth-Internal-CA\n  Serial:      4A:7B:2C:8D:3E:9F\n  Algorithm:   RSA-2048 / SHA-256\n  Valid From:  2025-03-30 00:00:00 UTC\n  Valid To:    2026-03-30 00:00:00 UTC\n  Status:      *** EXPIRED *** (expired 2 days ago)\n\nERROR: Certificate has expired. IKE authentication will fail.\nUse "cert renew branch-fw-01" to generate and install a new certificate.';
                    }
                    return '\nCertificate — FW-BR-01 (Local):\n=============================================================\n  Subject:     CN=FW-BR-01.corp.hexworth.local\n  Issuer:      CN=Hexworth-Internal-CA\n  Valid From:  2026-04-01 00:00:00 UTC\n  Valid To:    2027-04-01 00:00:00 UTC\n  Status:      VALID (364 days remaining)';
                }
                return '\nUsage: show cert local     (Branch firewall certificate)\n       show cert ca        (CA certificate chain)';
            }

            // show tunnel status — one-line summary
            if (joined.includes('tunnel')) {
                var p1 = (engine.state._phase1Down && !engine.state._labComplete) ? 'DOWN' : 'UP';
                var p2 = (engine.state._phase2Down && !engine.state._labComplete) ? 'DOWN' : ((engine.state._tunnelUp || engine.state._labComplete) ? 'UP' : 'DOWN');
                var traffic = 'NONE';
                if (engine.state._labComplete) traffic = 'NORMAL';
                else if (engine.state._noTraffic) traffic = 'NO FLOW (0 bytes)';
                else if (engine.state._mtuBlackhole) traffic = 'PARTIAL (small pkts only)';
                return '\nTunnel Status Summary:\n=============================================================\n  Tunnel:    HQ-to-Branch01\n  Local:     203.0.113.10 (FW-HQ-01)\n  Remote:    203.0.113.50 (FW-BR-01)\n  Phase 1:   ' + p1 + '\n  Phase 2:   ' + p2 + '\n  Traffic:   ' + traffic;
            }

            return '\nAvailable show commands:\n  show ike sa              IKE Phase 1 Security Associations\n  show ike config local    Local IKE configuration\n  show ike config remote   Remote IKE configuration\n  show ipsec sa            IPSec Phase 2 Security Associations\n  show ipsec nat-t         NAT-Traversal status\n  show firewall acl        Perimeter firewall ACL rules\n  show cert local          Local certificate details\n  show tunnel status       Tunnel summary';
        },

        // ipsec — configure IPSec Phase 1 params, tunnel MSS, NAT-T
        'ipsec': function(args, term, engine) {
            var gate = VPN001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // Fix IKE Phase 1 mismatch by aligning encryption/hash/dhgroup
            if (joined.includes('set') && joined.includes('phase1')) {
                if (scenario && scenario.id === 'ike_mismatch' && engine.state._ikeMismatch) {
                    if (joined.includes('aes-256') && joined.includes('sha256') && joined.includes('14')) {
                        engine.state._ikeMismatch = false;
                        engine.state._phase1Down = false;
                        engine.state._labComplete = true;
                        engine.state._flagRevealed = true;
                        engine.save();
                        setTimeout(function() { engine.notify('IKE Phase 1 aligned. Tunnel re-established.', 'success'); }, 400);
                        return '\nApplying IKE Phase 1 configuration to FW-BR-01...\n  Encryption:  AES-128-CBC -> AES-256-CBC   [UPDATED]\n  Hash:        SHA-1 -> SHA-256             [UPDATED]\n  DH Group:    2 -> 14 (2048-bit MODP)      [UPDATED]\n\nRestarting IKE daemon...\n  IKE Phase 1: Initiating... Proposal accepted by peer.\n  IKE Phase 1: ESTABLISHED\n  IKE Phase 2: Negotiating... SA installed.\n  Tunnel:      UP — Traffic flowing\n\n=== FLAG: VPN001{ike_phase1_aligned_aes256_sha256_dh14} ===';
                    }
                    return '\nERROR: Parameters do not match HQ configuration.\nHQ uses: AES-256-CBC / SHA-256 / DH Group 14\nUsage: ipsec set phase1 encryption aes-256 hash sha256 dhgroup 14';
                }
            }

            // Fix tunnel MSS for MTU black hole
            if (joined.includes('set') && joined.includes('tunnel-mss')) {
                if (scenario && scenario.id === 'mtu_blackhole' && engine.state._mtuBlackhole) {
                    var mssMatch = joined.match(/tunnel-mss\s+(\d+)/);
                    var mssVal = mssMatch ? parseInt(mssMatch[1]) : 0;
                    // Accept any reasonable MSS between 1280 and 1360
                    if (mssVal >= 1280 && mssVal <= 1360) {
                        engine.state._mtuBlackhole = false;
                        engine.state._labComplete = true;
                        engine.state._flagRevealed = true;
                        engine.save();
                        setTimeout(function() { engine.notify('Tunnel MSS clamped. Large packets now flowing.', 'success'); }, 400);
                        return '\nApplying tunnel MSS clamp...\n  Previous MSS:  1460 (default — too large for path)\n  New MSS:       ' + mssVal + '\n  Path MTU:      1400\n  ESP Overhead:  ~58 bytes\n\nTesting connectivity...\n  ping -s 64:    OK (1ms)\n  ping -s 512:   OK (2ms)\n  ping -s 1024:  OK (3ms)\n  ping -s 1300:  OK (4ms)\n\nLarge packet test: PASS\nRDP session test:  PASS\nFile transfer:     PASS\n\n=== FLAG: VPN001{mtu_blackhole_mss_clamped_' + mssVal + '} ===';
                    }
                    return '\nWARNING: MSS value ' + mssVal + ' may not be optimal.\nPath MTU is 1400, ESP overhead ~58 bytes, TCP/IP headers 40 bytes.\nRecommended MSS: 1400 - 58 - 40 = 1302\nUsage: ipsec set tunnel-mss <value>';
                }
            }

            // Enable NAT-T (first step of NAT-T fix — must also open UDP 4500)
            if (joined.includes('set') && joined.includes('nat-t')) {
                if (scenario && scenario.id === 'nat_t_failure' && engine.state._natTBlocked) {
                    engine.state._natTEnabled = true;
                    engine.save();
                    return '\nNAT-T configuration updated:\n  NAT-T:         Enabled (forced)\n  Encapsulation: UDP 4500\n  Keepalive:     20 seconds\n\nNOTE: NAT-T is enabled locally but UDP 4500 must also be\npermitted through the CGNAT device. Use "firewall allow udp-4500".';
                }
            }

            return '\nUsage:\n  ipsec set phase1 encryption <alg> hash <alg> dhgroup <num>\n  ipsec set tunnel-mss <value>\n  ipsec set nat-t enable|disable';
        },

        // cert — certificate renewal commands
        'cert': function(args, term, engine) {
            var gate = VPN001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // Renew the expired branch firewall certificate
            if (joined.includes('renew') && joined.includes('branch')) {
                if (scenario && scenario.id === 'cert_expired' && engine.state._certExpired) {
                    engine.state._certExpired = false;
                    engine.state._phase1Down = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Certificate renewed. Tunnel re-established.', 'success'); }, 400);
                    return '\nCertificate Renewal — FW-BR-01:\n================================\n  Generating RSA-2048 key pair... OK\n  Creating CSR for CN=FW-BR-01.corp.hexworth.local... OK\n  Submitting to Hexworth-Internal-CA... OK\n  CA signed certificate (Serial: 5B:8C:3D:9E:4F:A0)... OK\n  Installing certificate... OK\n  Importing CA chain... OK\n  Binding to IKE profile... OK\n\nNew Certificate:\n  Valid From:  2026-04-01 00:00:00 UTC\n  Valid To:    2027-04-01 00:00:00 UTC\n  Status:      VALID\n\nRestarting IKE daemon...\n  IKE Phase 1: Certificate accepted by peer.\n  IKE Phase 1: ESTABLISHED\n  IKE Phase 2: SA installed.\n  Tunnel:      UP — Traffic flowing\n\n=== FLAG: VPN001{cert_renewed_branch_fw_01_valid} ===';
                }
            }
            return '\nUsage:\n  cert renew <hostname>     Renew and install certificate\n  cert verify <hostname>    Verify certificate chain';
        },

        // firewall — ACL management and NAT-T port opening
        'firewall': function(args, term, engine) {
            var gate = VPN001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // Open UDP 4500 through CGNAT (second step of NAT-T fix)
            if (joined.includes('allow') && joined.includes('udp-4500')) {
                if (scenario && scenario.id === 'nat_t_failure') {
                    if (engine.state._natTEnabled) {
                        engine.state._natTBlocked = false;
                        engine.state._phase2Down = false;
                        engine.state._labComplete = true;
                        engine.state._flagRevealed = true;
                        engine.save();
                        setTimeout(function() { engine.notify('NAT-T established. Tunnel UP with UDP encapsulation.', 'success'); }, 400);
                        return '\nFirewall Rule Update — CGNAT Device (100.64.0.1):\n==================================================\n  Adding: PERMIT udp any any eq 4500 (NAT-T/IPSec)\n  Rule applied... OK\n\nTesting NAT-T connectivity...\n  UDP 4500 to 203.0.113.10: OPEN\n  NAT-T keepalive: RECEIVED\n  ESP-in-UDP encapsulation: ACTIVE\n\nTunnel Recovery:\n  IKE Phase 1: UP\n  IKE Phase 2: SA installed.\n  NAT-T:       ACTIVE (UDP 4500)\n  Tunnel:      UP — Traffic flowing through NAT\n\n=== FLAG: VPN001{nat_t_udp4500_cgnat_resolved} ===';
                    }
                    return '\nERROR: Enable NAT-T on the local firewall first.\nRun: ipsec set nat-t enable';
                }
            }

            // Add ESP permit rule to perimeter ACL (fix for ESP blocked)
            if (joined.includes('add-rule') && joined.includes('proto-50')) {
                if (scenario && scenario.id === 'esp_blocked' && engine.state._espBlocked) {
                    engine.state._espBlocked = false;
                    engine.state._noTraffic = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('ESP permitted. IPSec data traffic now flowing.', 'success'); }, 400);
                    return '\nACL Update — FW-HQ-EDGE:\n==================================================\n  Inserting Rule 55: PERMIT esp src 203.0.113.50 dst 203.0.113.10\n  Rule applied... OK\n\nUpdated ACL:\n  Rule 40: PERMIT udp 203.0.113.10 eq 500   (IKE)\n  Rule 50: PERMIT udp 203.0.113.10 eq 4500  (NAT-T)\n  Rule 55: PERMIT esp 203.0.113.10           (ESP)  <-- NEW\n  Rule 999: DENY ip any any\n\nTesting ESP flow...\n  ESP packets out: 47\n  ESP packets in:  45\n  Bytes transferred: 68,432\n  Tunnel traffic:  FLOWING\n\n=== FLAG: VPN001{esp_proto50_acl_fixed_cr2026} ===';
                }
            }

            return '\nUsage:\n  firewall add-rule permit proto-50 src <ip> dst <ip>\n  firewall allow udp-4500\n  firewall show rules';
        },

        // ping-mtu — path MTU discovery tool
        'ping-mtu': function(args, term, engine) {
            var gate = VPN001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN001Config._getScenario(engine);

            if (scenario && scenario.id === 'mtu_blackhole' && engine.state._mtuBlackhole) {
                return '\nPath MTU Discovery — 203.0.113.50:\n=============================================================\n  Testing 1500 bytes... FAIL (packet too big, DF set)\n  Testing 1450 bytes... FAIL (packet too big, DF set)\n  Testing 1400 bytes... OK (3ms)\n  Testing 1350 bytes... OK (2ms)\n\n  Path MTU:        1400 bytes\n  ESP Overhead:    ~58 bytes (header + IV + padding + auth)\n  TCP/IP Headers:  40 bytes\n  Recommended MSS: 1302 bytes (1400 - 58 - 40)\n\nFix: ipsec set tunnel-mss 1302';
            }
            if (!args.length) return '\nUsage: ping-mtu <destination>';
            return '\nPath MTU Discovery — ' + args[0] + ':\n  Testing 1500 bytes... OK (2ms)\n  Path MTU: 1500 bytes (standard)';
        },

        // ping — standard ICMP ping with tunnel-aware responses
        ping: function(args, term, engine) {
            var gate = VPN001Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping <target>';
            var target = args[0];
            var scenario = VPN001Config._getScenario(engine);

            // Ping across tunnel to branch network
            if (target.startsWith('10.1.1.')) {
                if (engine.state._labComplete) {
                    return '\nPING ' + target + ' (via IPSec tunnel): 56 data bytes\n64 bytes from ' + target + ': icmp_seq=1 ttl=62 time=12ms\n64 bytes from ' + target + ': icmp_seq=2 ttl=62 time=11ms\n2 packets transmitted, 2 received, 0% packet loss';
                }
                if (engine.state._phase1Down || engine.state._phase2Down || engine.state._noTraffic) {
                    return '\nPING ' + target + ' (via IPSec tunnel): 56 data bytes\nRequest timeout for icmp_seq 1\nRequest timeout for icmp_seq 2\n2 packets transmitted, 0 received, 100% packet loss';
                }
                // MTU black hole: small pings work
                if (engine.state._mtuBlackhole) {
                    return '\nPING ' + target + ' (via IPSec tunnel): 56 data bytes\n64 bytes from ' + target + ': icmp_seq=1 ttl=62 time=12ms\n\nSmall pings work. Try: ping -s 1400 ' + target;
                }
            }

            // Ping with -s flag (size) for MTU testing
            if (args.includes('-s') && scenario && scenario.id === 'mtu_blackhole' && engine.state._mtuBlackhole) {
                var sizeIdx = args.indexOf('-s');
                var pktSize = parseInt(args[sizeIdx + 1]) || 64;
                var dest = args.filter(function(a) { return a !== '-s' && isNaN(a); })[0] || '10.1.1.1';
                if (pktSize > 1400) {
                    return '\nPING ' + dest + ' (size=' + pktSize + '):\nRequest timeout (packet too big, DF set)\n1 packets transmitted, 0 received, 100% packet loss\nPackets > 1400 bytes silently dropped (MTU black hole).';
                }
                return '\nPING ' + dest + ' (size=' + pktSize + '):\n' + pktSize + ' bytes from ' + dest + ': icmp_seq=1 ttl=62 time=12ms\n1 packets transmitted, 1 received, 0% packet loss';
            }

            // Ping VPN peer WAN IP
            if (target === '203.0.113.50') {
                return '\nPING 203.0.113.50 (FW-BR-01): 56 data bytes\n64 bytes from 203.0.113.50: icmp_seq=1 ttl=64 time=8ms\nPeer is reachable (WAN connectivity OK).';
            }

            return '\nPING ' + target + ': 56 data bytes\n64 bytes from ' + target + ': icmp_seq=1 ttl=64 time=1ms';
        },

        help: function() {
            return '\nAvailable Commands:\n=============================================================\n  show ike sa              IKE Phase 1 SA status\n  show ike config local    Local IKE configuration\n  show ike config remote   Remote IKE configuration\n  show ipsec sa            IPSec Phase 2 SA status\n  show ipsec nat-t         NAT-T status\n  show firewall acl        Perimeter ACL rules\n  show cert local          Certificate details\n  show tunnel status       Tunnel summary\n  ipsec set phase1 ...     Configure IKE Phase 1\n  ipsec set tunnel-mss N   Set tunnel MSS clamp\n  ipsec set nat-t enable   Enable NAT-T\n  cert renew <host>        Renew certificate\n  firewall add-rule ...    Add firewall rule\n  firewall allow udp-4500  Permit NAT-T port\n  ping <target>            ICMP ping\n  ping-mtu <target>        Path MTU discovery\n  cls                      Clear screen';
        },

        whoami: function() { return 'VPN-Admin@FW-HQ-01'; },
        hostname: function() { return 'FW-HQ-01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['vpn_console', 'firewall_logs', 'cert_manager'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the VPN Ticket first to receive your assignment.', 'error');
            return;
        }
        switch (iconDef.app) {
            case 'ticket':        VPN001Config._openTicket(iconDef, engine); break;
            case 'vpn_console':   VPN001Config._openVPNConsole(iconDef, engine); break;
            case 'firewall_logs': VPN001Config._openFirewallLogs(iconDef, engine); break;
            case 'cert_manager':  VPN001Config._openCertManager(iconDef, engine); break;
            case 'reset_lab':     VPN001Config._confirmReset(engine); break;
        }
    },

    // ==========================================================
    // VPN TICKET
    // ==========================================================

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'VPN Incident Ticket', 'TKT', container);
        VPN001Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            VPN001Config._renderTicket(engine, container);
        } else {
            VPN001Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker(engine, container) {
        var ticketPreviews = [
            'NOC — "IKE Phase 1 fails with no proposal chosen after branch firewall upgrade"',
            'NOC — "Tunnel dropped at midnight — certificate authentication error on branch"',
            'NOC — "VPN down after ISP change — branch behind CGNAT, ESP packets dropped"',
            'NOC — "Tunnel UP but RDP/file transfers hang — small packets pass, large fail"',
            'NOC — "Phase 1/2 complete but zero traffic flowing — recent perimeter ACL change"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#7c3aed; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">VPN INCIDENT QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select an incident to begin troubleshooting, or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        VPN001Config._scenarios.forEach(function(s, i) {
            var severity = i <= 1 ? 'CRITICAL' : 'HIGH';
            html += '<button class="vpn-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#7c3aed; font-weight:bold;">VPN-' + (1000 + i) + '</span>'
                + '<span style="background:' + (severity === 'CRITICAL' ? '#7c3aed' : '#6d28d9') + '; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">' + severity + '</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + ticketPreviews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';
        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="vpnRandomBtn" style="padding:10px 28px; background:#7c3aed; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.vpn-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#7c3aed'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                VPN001Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                VPN001Config._renderTicket(engine, container);
            });
        });
        document.getElementById('vpnRandomBtn').addEventListener('click', function() {
            VPN001Config._applyScenario(engine, Math.floor(Math.random() * VPN001Config._scenarios.length));
            VPN001Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        var scenario = VPN001Config._getScenario(engine);
        var submitters = ['NOC — Network Operations (Tier 2)', 'NOC — Network Operations (Tier 2)', 'NOC — ISP Liaison Team', 'NOC — Application Support', 'NOC — Change Management'];
        var submitter = submitters[engine.state._scenarioId] || 'NOC Analyst';
        var alert = VPN001Config._alerts[0];

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#7c3aed; font-weight:bold; font-size:1rem;">INCIDENT #VPN-' + (1000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#7c3aed; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: P1</span>'
            + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">REPORTED BY</div><div>' + submitter + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DATE</div><div>April 1, 2026 — ' + alert.detected.split(' ')[1] + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">AFFECTED TUNNEL</div>'
            + '<div style="font-weight:bold; color:#7c3aed;">FW-HQ-01 (203.0.113.10) &larr;&rarr; FW-BR-01 (203.0.113.50)</div>'
            + '<div style="color:#888; font-size:0.7rem;">Gateway: ' + alert.engine + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + VPN001Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + VPN001Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">NOC NOTES</div>'
            + '<div style="background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#c4b5fd;">'
            + VPN001Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div>'
            + '<div style="color:#2ecc71; font-weight:bold;">YOU — VPN Administrator (On-Call)</div></div>';
    },

    // ==========================================================
    // VPN CONSOLE
    // ==========================================================

    _openVPNConsole(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'vpnContainer';
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'VPN Tunnel Console', 'VPN', container);
        VPN001Config._renderVPNConsole(engine);
    },

    _renderVPNConsole(engine) {
        var container = document.getElementById('vpnContainer');
        if (!container) return;
        var scenario = VPN001Config._getScenario(engine);
        var statusColor = engine.state._labComplete ? '#22c55e' : '#dc2626';
        var tunnelStatus = engine.state._labComplete ? 'UP' : 'DOWN';

        var html = '<div style="color:#7c3aed; font-weight:bold; font-size:1rem; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">FortiGate VPN Tunnel Console v7.4</div>';

        // Tunnel status banner
        html += '<div style="padding:12px; margin-bottom:16px; background:rgba(' + (engine.state._labComplete ? '34,197,94' : '220,38,38') + ',0.08); border:1px solid rgba(' + (engine.state._labComplete ? '34,197,94' : '220,38,38') + ',0.2); border-radius:4px; text-align:center;">'
            + '<div style="font-size:0.75rem; color:#888;">Tunnel: HQ-to-Branch01</div>'
            + '<div style="color:' + statusColor + '; font-weight:bold; font-size:1.2rem; margin:4px 0;">' + tunnelStatus + '</div>'
            + '<div style="font-size:0.7rem; color:#888;">203.0.113.10 &harr; 203.0.113.50</div></div>';

        // Phase status rows
        var p1 = (engine.state._phase1Down && !engine.state._labComplete) ? 'DOWN' : 'UP';
        var p2 = (engine.state._phase2Down && !engine.state._labComplete) ? 'DOWN' : ((engine.state._tunnelUp || engine.state._labComplete) ? 'UP' : 'DOWN');
        var p1c = p1 === 'UP' ? '#22c55e' : '#dc2626';
        var p2c = p2 === 'UP' ? '#22c55e' : '#dc2626';

        html += '<div style="margin-bottom:16px;">'
            + '<div style="color:#7c3aed; font-weight:bold; font-size:0.85rem; margin-bottom:8px;">IKE Security Associations</div>'
            + '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:10px;">'
            + '<div style="display:flex; justify-content:space-between; padding:4px 0;"><span>Phase 1 (IKE)</span><span style="color:' + p1c + '; font-weight:bold;">' + p1 + '</span></div>'
            + '<div style="display:flex; justify-content:space-between; padding:4px 0;"><span>Phase 2 (IPSec)</span><span style="color:' + p2c + '; font-weight:bold;">' + p2 + '</span></div>';

        if (engine.state._noTraffic && !engine.state._labComplete) {
            html += '<div style="display:flex; justify-content:space-between; padding:4px 0;"><span>Traffic Flow</span><span style="color:#dc2626; font-weight:bold;">NO TRAFFIC</span></div>';
        }
        if (engine.state._mtuBlackhole && !engine.state._labComplete) {
            html += '<div style="display:flex; justify-content:space-between; padding:4px 0;"><span>Traffic Flow</span><span style="color:#f59e0b; font-weight:bold;">PARTIAL (small pkts only)</span></div>';
        }
        html += '</div></div>';

        // Resolved banner
        if (engine.state._flagRevealed) {
            html += '<div style="padding:12px; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; text-align:center;">'
                + '<div style="color:#22c55e; font-weight:bold;">TUNNEL RESTORED</div>'
                + '<div style="color:#888; font-size:0.75rem; margin-top:4px;">Site-to-site connectivity re-established.</div></div>';
        }
        container.innerHTML = html;
    },

    // ==========================================================
    // FIREWALL LOGS
    // ==========================================================

    _openFirewallLogs(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Firewall Logs', 'FW', container);

        var scenario = VPN001Config._getScenario(engine);
        var html = '<div style="color:#7c3aed; font-weight:bold; font-size:1rem; margin-bottom:12px;">Firewall Log Viewer</div>';
        html += '<div style="color:#888; font-size:0.75rem; margin-bottom:12px;">VPN-related log entries from FW-HQ-01</div>';

        var logs = [
            { time: '06:12:33', action: 'ALLOW', proto: 'UDP', detail: '203.0.113.50:500 -> 203.0.113.10:500', rule: '40', note: 'IKE' },
            { time: '06:12:33', action: 'ALLOW', proto: 'UDP', detail: '203.0.113.50:4500 -> 203.0.113.10:4500', rule: '50', note: 'NAT-T' }
        ];
        // Show ESP deny entries for the ESP blocked scenario
        if (scenario && scenario.id === 'esp_blocked' && engine.state._espBlocked && !engine.state._labComplete) {
            for (var i = 0; i < 3; i++) {
                logs.push({ time: '06:12:3' + (4 + i), action: 'DENY', proto: 'ESP(50)', detail: '203.0.113.50 -> 203.0.113.10', rule: '999', note: 'Implicit Deny' });
            }
        }

        logs.forEach(function(l) {
            var color = l.action === 'ALLOW' ? '#22c55e' : '#dc2626';
            html += '<div style="display:flex; align-items:center; padding:6px 8px; margin-bottom:3px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:3px; font-size:0.75rem;">'
                + '<span style="width:65px; color:#888;">' + l.time + '</span>'
                + '<span style="width:50px; color:' + color + '; font-weight:bold;">' + l.action + '</span>'
                + '<span style="width:60px;">' + l.proto + '</span>'
                + '<span style="flex:1;">' + l.detail + '</span>'
                + '<span style="width:50px; color:#888;">R:' + l.rule + '</span>'
                + '<span style="width:80px; color:#666;">' + l.note + '</span></div>';
        });

        html += '<div style="margin-top:16px; color:#888; font-size:0.75rem;">Use "show firewall acl" in the terminal for the full ACL.</div>';
        container.innerHTML = html;
    },

    // ==========================================================
    // CERTIFICATE MANAGER
    // ==========================================================

    _openCertManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Certificate Manager', 'CRT', container);

        var scenario = VPN001Config._getScenario(engine);
        var html = '<div style="color:#7c3aed; font-weight:bold; font-size:1rem; margin-bottom:12px;">PKI Certificate Manager</div>';

        // CA cert — always valid
        html += '<div style="margin-bottom:12px;"><div style="color:#7c3aed; font-weight:bold; font-size:0.85rem; margin-bottom:6px;">CA Certificate</div>'
            + '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:10px;">'
            + '<div>CN=Hexworth-Internal-CA</div>'
            + '<div style="color:#888; font-size:0.7rem;">Valid: 2024-01-01 to 2034-01-01</div>'
            + '<div style="color:#22c55e; font-size:0.7rem; font-weight:bold;">VALID</div></div></div>';

        // Branch cert — expired in cert_expired scenario
        var expired = scenario && scenario.id === 'cert_expired' && engine.state._certExpired && !engine.state._labComplete;
        var cColor = expired ? '#dc2626' : '#22c55e';
        var cStatus = expired ? 'EXPIRED' : 'VALID';
        var cDates = expired ? '2025-03-30 to 2026-03-30' : '2026-04-01 to 2027-04-01';

        html += '<div style="margin-bottom:12px;"><div style="color:#7c3aed; font-weight:bold; font-size:0.85rem; margin-bottom:6px;">Branch Firewall Certificate</div>'
            + '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:10px;">'
            + '<div>CN=FW-BR-01.corp.hexworth.local</div>'
            + '<div style="color:#888; font-size:0.7rem;">Valid: ' + cDates + '</div>'
            + '<div style="color:' + cColor + '; font-size:0.7rem; font-weight:bold;">' + cStatus + '</div></div></div>';

        if (expired) {
            html += '<div style="padding:10px; background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); border-radius:4px; color:#fca5a5; font-size:0.75rem;">'
                + 'Certificate expired 2 days ago. Use "cert renew branch-fw-01" in the terminal to renew.</div>';
        }

        html += '<div style="margin-top:16px; color:#888; font-size:0.75rem;">Use "show cert local" in the terminal for detailed info.</div>';
        container.innerHTML = html;
    },

    // ==========================================================
    // RESET LAB
    // ==========================================================

    _confirmReset(engine) {
        if (confirm('Reset this lab? All progress will be lost.')) {
            engine.resetLab();
        }
    }
};
