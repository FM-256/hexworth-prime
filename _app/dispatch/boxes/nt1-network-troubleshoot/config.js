/* ============================================================
   ARENA LAB — Box NT1: Network Rescue
   Windows Networking Troubleshooting — MD-100
   Config: network state, Windows commands, GUI, scenarios
   5 distinct scenarios with unique tools, screens, and flag locations
   ============================================================ */

const NT1Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Network Rescue',
    subtitle: 'Windows Networking Troubleshooting — MD-100',
    difficulty: 'Beginner',
    accent: '#0078d4',
    storageKey: 'hexworth_lab_nt1_dispatch',
    registryId: 'nt1-network-troubleshoot',
    trackerKey: 'lab_nt1_dispatch',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Help Desk Ticket',
                tip: 'Double-click the Help Desk Ticket icon to read the user complaint.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Check network configuration',
                tip: 'Open Command Prompt and run: ipconfig /all',
                trigger: { event: 'command', match: { cmd: 'contains:ipconfig' } }
            },
            {
                title: 'Test connectivity at each layer',
                tip: 'Ping 127.0.0.1, then the gateway, then 8.8.8.8, then google.com. The first failure tells you where the problem is.',
                trigger: { event: 'command', match: { cmd: 'contains:ping' } }
            },
            {
                title: 'Diagnose and fix the problem',
                tip: 'Use the right tool: Command Prompt, Network Settings, Device Manager, Windows Firewall, or Services.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:ipconfig' },
                    alt: [
                        { event: 'window_open', match: { type: 'network' } },
                        { event: 'window_open', match: { type: 'device_manager' } },
                        { event: 'window_open', match: { type: 'firewall' } },
                        { event: 'window_open', match: { type: 'services' } }
                    ]
                }
            },
            {
                title: 'Verify full connectivity',
                tip: 'Run: ping google.com — if it replies, you fixed the network! Then hunt for the flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES (MD-100 mapping)
    // ==========================================================

    certObjectives: {
        certPath: 'MD-100',
        mappings: [
            /* MD-100 M04: Configuring Networking. Added so the hub card's module tag is BACKED by
               the box itself. This card previously showed a module tag that matched
               nothing downstream: not this file, not the Dispatch Board tags, and not
               the briefing screen a student sees one click later. A reviewer caught the
               contradiction. The objective rows below are UNCHANGED -- both taxonomies
               are true at once, so keeping the original numbering costs nothing. */
            { flagId: 'fixed', objective: 'M04', description: 'Configuring Networking', skill: 'IP configuration, name resolution, and adapter diagnostics' },
            { flagId: 'fixed', objective: '5.1', description: 'Troubleshoot network connectivity issues', skill: 'IP Configuration Diagnosis' },
            { flagId: 'fixed', objective: '5.2', description: 'Use Windows troubleshooting tools', skill: 'ipconfig, ping, tracert, nslookup, netsh' },
            { flagId: 'fixed', objective: '3.1', description: 'Configure networking on a Windows client', skill: 'Network Adapter Configuration' }
        ]
    },

    // ==========================================================
    // SABOTAGE SCENARIOS
    // ==========================================================

    _scenarioFlags: {
        dns_poisoned:     null,
        disabled_adapter: null,
        firewall_block:   null,
        wrong_subnet:     null,
        dhcp_stopped:     null
    },

    _poisonedDNS: {
        'google.com':     '203.0.113.50',
        'www.google.com': '203.0.113.50',
        'microsoft.com':  '203.0.113.51',
        'www.microsoft.com': '203.0.113.51',
        'bing.com':       '203.0.113.52',
        'cloudflare.com': '203.0.113.53',
        'github.com':     '203.0.113.54',
        'yahoo.com':      '203.0.113.55'
    },

    _scenarios: [
        {
            id: 'dns_poisoned',
            name: 'DNS Cache Poisoned',
            ticketSubject: 'Websites loading wrong pages or not at all',
            ticketDetail: 'Something really weird is going on. When I try to go to Google, I either get a blank page or some strange website I\'ve never seen. My coworker sitting right next to me can access Google just fine on her computer. I tried typing in the IP address for Google (142.250.80.46) directly and that worked perfectly.',
            ticketExtra: 'IT Note: This workstation was previously flagged for suspicious DNS activity. A malware scan was run and the malware was removed, but residual effects may persist.',
            fixDescription: 'Flush the DNS resolver cache with ipconfig /flushdns',
            brokenConfig: {
                adapter: 'enabled', dhcp: false,
                ip: '192.168.1.50', subnet: '255.255.255.0', gateway: '192.168.1.1',
                dns1: '8.8.8.8', dns2: '8.8.4.4'
            },
            stateOverrides: { _dnsPoisoned: true },
            flagLocation: 'DNS resolver cache (ipconfig /displaydns)'
        },
        {
            id: 'disabled_adapter',
            name: 'Disabled Network Adapter',
            ticketSubject: 'No network connection at all',
            ticketDetail: 'My network is completely dead. No internet, no file server, nothing. The little network icon in the taskbar has a red X on it. I didn\'t change anything, but our intern was "helping" with my computer yesterday while I was at lunch.',
            ticketExtra: 'IT Note: The intern reported running some "optimization scripts" from a YouTube video on several workstations yesterday.',
            fixDescription: 'Enable the network adapter via Device Manager, then renew DHCP lease',
            brokenConfig: {
                adapter: 'disabled', dhcp: true,
                ip: '0.0.0.0', subnet: '0.0.0.0', gateway: '',
                dns1: '', dns2: ''
            },
            enabledConfig: {
                adapter: 'enabled', dhcp: true,
                ip: '192.168.1.50', subnet: '255.255.255.0', gateway: '192.168.1.1',
                dns1: '8.8.8.8', dns2: '8.8.4.4'
            },
            stateOverrides: {},
            flagLocation: 'Device Manager adapter details'
        },
        {
            id: 'firewall_block',
            name: 'Firewall Blocking Outbound',
            ticketSubject: 'Can reach local resources but not the internet',
            ticketDetail: 'I can access the printer at 192.168.1.200 and the shared drive on our file server, but I cannot get to ANY website. Google, Bing, Yahoo — nothing loads. My email client also stopped syncing. This started right after that "security update" was pushed to my machine this morning.',
            ticketExtra: 'IT Note: A group policy update was deployed this morning. Some workstations may have received incorrect firewall configurations.',
            fixDescription: 'Disable the outbound blocking rule in Windows Firewall',
            brokenConfig: {
                adapter: 'enabled', dhcp: false,
                ip: '192.168.1.50', subnet: '255.255.255.0', gateway: '192.168.1.1',
                dns1: '8.8.8.8', dns2: '8.8.4.4'
            },
            stateOverrides: { _firewallBlocking: true },
            flagLocation: 'Windows Firewall rule description'
        },
        {
            id: 'wrong_subnet',
            name: 'IP Address / Subnet Mismatch',
            ticketSubject: 'Cannot access anything on the network',
            ticketDetail: 'I can\'t access anything on the network. No internet, no shared drives, no printers. Everything was working fine until the new IT intern "fixed" my static IP yesterday. He said he changed something in my network settings.',
            ticketExtra: 'IT Note: The intern was assigned to update static IPs for the marketing VLAN migration but may have used incorrect addressing.',
            fixDescription: 'Change IP to 192.168.1.x range (matching the gateway subnet)',
            brokenConfig: {
                adapter: 'enabled', dhcp: false,
                ip: '192.168.2.50', subnet: '255.255.255.0', gateway: '192.168.1.1',
                dns1: '8.8.8.8', dns2: '8.8.4.4'
            },
            stateOverrides: {},
            flagLocation: 'Successful ping output'
        },
        {
            id: 'dhcp_stopped',
            name: 'DHCP Client Service Stopped',
            ticketSubject: 'Weird IP address, cannot connect to anything',
            ticketDetail: 'My computer shows some weird IP address starting with 169.254 and I can\'t connect to anything. I just got this laptop from the equipment room and it\'s never been set up for our network. I tried checking "obtain IP automatically" in network settings but it still shows the weird address.',
            ticketExtra: 'IT Note: Equipment room laptops are pre-imaged with a hardened build that disables certain services by default for security.',
            fixDescription: 'Start the DHCP Client service via Services, then renew DHCP lease',
            brokenConfig: {
                adapter: 'enabled', dhcp: true,
                ip: '169.254.47.132', subnet: '255.255.0.0', gateway: '',
                dns1: '', dns2: ''
            },
            stateOverrides: { _dhcpServiceStopped: true },
            flagLocation: 'Services console (DHCP Client status)'
        }
    ],

    _correctNetwork: {
        adapter: 'enabled', dhcp: true,
        ip: '192.168.1.50', subnet: '255.255.255.0', gateway: '192.168.1.1',
        dns1: '8.8.8.8', dns2: '8.8.4.4'
    },

    _validDNS: ['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1', '208.67.222.222', '208.67.220.220', '9.9.9.9'],

    _knownDomains: {
        'google.com': '142.250.80.46',
        'www.google.com': '142.250.80.46',
        'microsoft.com': '20.70.246.20',
        'www.microsoft.com': '20.70.246.20',
        'bing.com': '204.79.197.200',
        'cloudflare.com': '104.16.132.229',
        'github.com': '140.82.121.3',
        'yahoo.com': '74.6.231.21'
    },

    _macAddress: '00-1A-2B-3C-4D-5E',
    _adapterName: 'Ethernet0',

    // Per-scenario hints (assigned in _applyScenario)
    _defaultHints: [
        { id: 'hint1', text: 'Start by running ipconfig /all to see the full network configuration. Compare the settings against what a healthy workstation should have.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Follow the troubleshooting order: (1) Check adapter status, (2) Check IP/subnet, (3) Ping gateway, (4) Ping 8.8.8.8, (5) Ping google.com. The first step that fails points to the problem.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Not every problem is solved in Network Settings. Windows has specialized tools: Device Manager for hardware, Services for background services, Windows Firewall for traffic rules.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag is NOT always in the ping output. After restoring connectivity, check the tool you used to fix the problem — the flag may be hidden there.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        dns_poisoned: [
            { id: 'hint1', text: 'Run ipconfig /all. Does the configuration actually look correct? Sometimes the config is fine but something else is wrong.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The ticket says IP addresses work but domain names don\'t. That sounds like a DNS issue. But the DNS servers are set correctly... What else affects DNS resolution?', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Windows caches DNS lookups locally. Try: ipconfig /displaydns to see what\'s cached. If entries look wrong, try: ipconfig /flushdns', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After flushing the cache and confirming connectivity, check the DNS cache again (ipconfig /displaydns) — the flag was logged there.', cost: 50, penalty: -50 }
        ],
        disabled_adapter: [
            { id: 'hint1', text: 'Run ipconfig /all. The adapter shows "Media disconnected." The adapter itself seems to be disabled.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Network Settings won\'t help here — it can\'t see disabled adapters. You need a tool that manages hardware devices.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Device Manager from the desktop. Find the network adapter and enable it. Then you may need to get a DHCP lease with ipconfig /renew.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After enabling the adapter, check Device Manager again — the adapter diagnostic details contain the flag.', cost: 50, penalty: -50 }
        ],
        firewall_block: [
            { id: 'hint1', text: 'Run ipconfig /all. Everything looks perfectly configured. Ping the gateway — that works too. But pinging 8.8.8.8 times out. Why?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Local traffic works, but traffic beyond the gateway is blocked. The config is correct, so something is actively blocking outbound traffic.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Windows Firewall from the desktop. Check the outbound rules — is something blocking all outbound connections?', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Read the firewall rule description carefully — the flag is embedded in it. Disable the rule to restore connectivity.', cost: 50, penalty: -50 }
        ],
        wrong_subnet: [
            { id: 'hint1', text: 'Run ipconfig /all and examine the IP address, subnet mask, and default gateway. Do they belong to the same network?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The gateway is 192.168.1.1 but the workstation IP is on a different subnet. Run arp -a to confirm — the gateway won\'t appear in the ARP table.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Network Settings or use netsh to change the IP address to the 192.168.1.x range:\n  netsh interface ip set address "Ethernet0" static 192.168.1.50 255.255.255.0 192.168.1.1', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After fixing the IP and pinging google.com successfully, the flag appears in the ping output.', cost: 50, penalty: -50 }
        ],
        dhcp_stopped: [
            { id: 'hint1', text: 'Run ipconfig /all. The IP is 169.254.x.x — that\'s an APIPA address, meaning DHCP failed. But DHCP is enabled. Why can\'t it get a lease?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Try ipconfig /renew. It fails! Network Settings with DHCP checked also fails. The problem isn\'t the configuration — it\'s a service.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Services from the desktop. Find the DHCP Client service — is it running? Start it, then run ipconfig /renew.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After starting the DHCP Client service, check the Services console again — the flag appears in the service status details.', cost: 50, penalty: -50 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !NT1Config._flagRestored) {
            NT1Config._flagRestored = true;
            const scenario = NT1Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                // Flag value lives server-side; validation uses aliases
                // Restore per-scenario hints
                NT1Config.hints = NT1Config._scenarioHints[scenario.id] || NT1Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._networkConfig = JSON.parse(JSON.stringify(NT1Config._scenarios[idx].brokenConfig));
        engine.state._scenarioSelected = true;

        // Apply scenario-specific state overrides
        const overrides = NT1Config._scenarios[idx].stateOverrides || {};
        for (const key in overrides) {
            engine.state[key] = overrides[key];
        }

        // Flag value lives server-side; validation uses aliases
        const scenario = NT1Config._scenarios[idx];
        NT1Config._flagRestored = true;

        // Set per-scenario hints
        NT1Config.hints = NT1Config._scenarioHints[scenario.id] || NT1Config._defaultHints;

        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return NT1Config._scenarios[engine.state._scenarioId];
    },

    _net(engine) {
        return engine.state._networkConfig;
    },

    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first to receive your assignment.';
        }
        return null;
    },

    _isIP(str) {
        return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(str);
    },

    _sameSubnet(ip1, ip2, mask) {
        if (!ip1 || !ip2 || !mask) return false;
        const p = s => s.split('.').map(Number);
        try {
            const a = p(ip1), b = p(ip2), m = p(mask);
            return a.every((v, i) => (v & m[i]) === (b[i] & m[i]));
        } catch (e) { return false; }
    },

    _canReachGateway(net) {
        if (net.adapter === 'disabled') return false;
        if (!net.ip || net.ip === '0.0.0.0' || net.ip.startsWith('169.254')) return false;
        if (!net.gateway) return false;
        return NT1Config._sameSubnet(net.ip, net.gateway, net.subnet);
    },

    _canReachInternet(net, engine) {
        if (!NT1Config._canReachGateway(net)) return false;
        if (net.gateway !== '192.168.1.1') return false;
        // Firewall blocks traffic beyond gateway
        if (engine && engine.state._firewallBlocking) return false;
        return true;
    },

    _canResolveDNS(net, engine) {
        // DNS poisoned: DNS "works" but returns wrong IPs
        if (engine && engine.state._dnsPoisoned) return true;
        return NT1Config._validDNS.includes(net.dns1) || NT1Config._validDNS.includes(net.dns2);
    },

    _checkConnectivity(target, engine) {
        const net = engine.state._networkConfig;
        if (!net) return { success: false, error: 'General failure.' };

        if (net.adapter === 'disabled') {
            return { success: false, error: 'General failure.' };
        }

        // Loopback
        if (target === '127.0.0.1' || target === 'localhost') {
            return { success: true, ms: 0, ip: '127.0.0.1' };
        }

        // No valid IP
        if (!net.ip || net.ip === '0.0.0.0' || net.ip.startsWith('169.254')) {
            if (NT1Config._isIP(target)) {
                return { success: false, error: 'PING: transmit failed. General failure.' };
            }
            return { success: false, error: 'Ping request could not find host ' + target + '. Please check the name and try again.', dnsError: true };
        }

        // Own IP
        if (target === net.ip) {
            return { success: true, ms: 0, ip: net.ip };
        }

        // IP target
        if (NT1Config._isIP(target)) {
            // Same subnet — always reachable
            if (NT1Config._sameSubnet(net.ip, target, net.subnet)) {
                return { success: true, ms: 1, ip: target };
            }
            // Need gateway
            if (!NT1Config._canReachGateway(net)) {
                return { success: false, error: 'Destination host unreachable.' };
            }
            if (net.gateway !== '192.168.1.1') {
                return { success: false, error: 'Request timed out.' };
            }
            // Firewall blocks outbound beyond gateway
            if (engine.state._firewallBlocking) {
                return { success: false, error: 'Request timed out.' };
            }
            return { success: true, ms: Math.floor(Math.random() * 20) + 10, ip: target };
        }

        // Domain — needs DNS + internet
        if (!NT1Config._canReachInternet(net, engine)) {
            if (engine.state._firewallBlocking && NT1Config._canReachGateway(net)) {
                // Firewall: can reach gateway, DNS fails because outbound is blocked
                return { success: false, error: 'Request timed out.', resolvedIP: null };
            }
            return { success: false, error: 'Ping request could not find host ' + target + '. Please check the name and try again.', dnsError: true };
        }
        if (!NT1Config._canResolveDNS(net, engine)) {
            return { success: false, error: 'Ping request could not find host ' + target + '. Please check the name and try again.', dnsError: true };
        }

        // DNS poisoned: resolves to wrong IP, ping times out to that fake IP
        if (engine.state._dnsPoisoned) {
            const poisonedIP = NT1Config._poisonedDNS[target.toLowerCase()];
            if (poisonedIP) {
                return { success: false, error: 'Request timed out.', resolvedIP: poisonedIP };
            }
        }

        const resolved = NT1Config._knownDomains[target.toLowerCase()] || '93.184.216.34';
        return { success: true, ms: Math.floor(Math.random() * 30) + 15, ip: resolved };
    },

    async _checkLabComplete(target, result, engine) {
        if (!result.success) return null;
        if (NT1Config._isIP(target)) return null;
        if (engine.state._labComplete) return null;

        engine.state._labComplete = true;
        engine.state._flagRevealed = true;
        engine.save();

        const scenario = NT1Config._getScenario(engine);

        // Only wrong_subnet shows flag in ping output
        if (scenario && scenario.id === 'wrong_subnet') {
            const flagText = await engine.requestFlagText(scenario.id);
            setTimeout(() => {
                engine.notify('Network restored! The flag is in the ping output above.', 'success');
            }, 600);
            return flagText;
        }

        // All other scenarios: flag hidden elsewhere
        const locationHints = {
            dns_poisoned: 'Check the DNS resolver cache (ipconfig /displaydns).',
            disabled_adapter: 'Check Device Manager for adapter diagnostic data.',
            firewall_block: 'Review the Windows Firewall rules for incident details.',
            dhcp_stopped: 'Check the Services console for the DHCP Client status.'
        };
        const hint = scenario ? (locationHints[scenario.id] || '') : '';

        setTimeout(() => {
            engine.notify('Network restored! The flag has been logged to the system. ' + hint, 'success');
        }, 600);

        return null;
    },

    // ==========================================================
    // BOOT SEQUENCE (Windows)
    // ==========================================================

    boot: {
        biosLines: [
            'American Megatrends UEFI BIOS v2.20.1271',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... NVMe: SAMSUNG MZVL2512 (512GB)',
            'Network: Intel(R) Ethernet Connection I219-V',
            'Boot device: NVMe0',
            'Loading Windows Boot Manager...'
        ],
        grubEntries: [
            'Windows 10 Pro',
            'Windows Recovery Environment'
        ],
        loginUser: 'Technician'
    },

    // ==========================================================
    // DESKTOP ICONS
    // ==========================================================

    desktop: {
        icons: [
            { id: 'cmd',      label: 'Command\nPrompt',     icon: '>_',  app: 'terminal' },
            { id: 'network',  label: 'Network\nSettings',   icon: 'NET', app: 'network_settings' },
            { id: 'devmgr',   label: 'Device\nManager',     icon: 'DEV', app: 'device_manager' },
            { id: 'firewall', label: 'Windows\nFirewall',    icon: 'FW',  app: 'firewall' },
            { id: 'services', label: 'Services',             icon: 'SVC', app: 'services' },
            { id: 'ticket',   label: 'Help Desk\nTicket',    icon: 'HD',  app: 'ticket' },
            { id: 'notes',    label: 'Notepad',              icon: 'TXT', app: 'notes' },
            { id: 'hints',    label: 'Hints',                icon: '?',   app: 'hints' },
            { id: 'reset',    label: 'Reset\nLab',           icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG (Windows CMD)
    // ==========================================================

    terminal: {
        user: 'Technician',
        hostname: 'WORKSTATION01',
        startDir: 'C:\\Users\\Technician',
        promptStyle: 'windows',
        welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n'
    },

    // ==========================================================
    // FILESYSTEM (minimal — this lab is networking, not files)
    // ==========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {}
        }
    },

    // ==========================================================
    // FLAGS
    // ==========================================================

    flags: [
        { id: 'fixed', value: null, points: 500 }
    ],

    // ==========================================================
    // SCORING
    // ==========================================================

    scoring: {
        base: 0,
        minScore: 0,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ==========================================================
    // HINTS (replaced per-scenario by _applyScenario)
    // ==========================================================

    hints: [
        { id: 'hint1', text: 'Start by running ipconfig /all to see the full network configuration.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Follow the troubleshooting order: adapter, IP, gateway, internet, DNS.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Not every problem is in Network Settings. Try Device Manager, Services, or Windows Firewall.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag is hidden in the tool you used to fix the problem.', cost: 50, penalty: -50 }
    ],

    // ==========================================================
    // LORE
    // ==========================================================

    lore: {
        intro: 'A user has submitted a help desk ticket reporting network connectivity problems. As the desktop support technician, your job is to diagnose the issue using Windows built-in tools and restore full network connectivity.',
        scenario: 'The workstation has been misconfigured to simulate a real networking problem. You must identify the root cause using the correct diagnostic tools and apply the right fix — not every problem is in Network Settings.',
        outro: 'Network connectivity has been restored. The user can now access the internet and company resources. Your systematic troubleshooting approach identified and resolved the issue efficiently.'
    },

    // ==========================================================
    // PHASES
    // ==========================================================

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the help desk ticket and examine the current network configuration.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Test connectivity at each layer to pinpoint the problem.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the fix using the appropriate Windows tool.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm full connectivity and locate the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // CUSTOM COMMANDS (Windows CMD)
    // ==========================================================

    commands: {

        // --- IPCONFIG ---

        ipconfig: async function(args, term, engine) {
            const gate = NT1Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            const name = NT1Config._adapterName;
            const mac = NT1Config._macAddress;
            const joined = args.join(' ').toLowerCase();

            if (joined.includes('/all')) {
                if (net.adapter === 'disabled') {
                    return '\nWindows IP Configuration\n\n   Host Name . . . . . . . . . . . . : WORKSTATION01\n   Primary Dns Suffix  . . . . . . . : \n   Node Type . . . . . . . . . . . . : Hybrid\n   IP Routing Enabled. . . . . . . . : No\n   WINS Proxy Enabled. . . . . . . . : No\n\nEthernet adapter ' + name + ':\n\n   Media State . . . . . . . . . . . : Media disconnected\n   Connection-specific DNS Suffix  . : \n   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-V\n   Physical Address. . . . . . . . . : ' + mac;
                }
                return '\nWindows IP Configuration\n\n   Host Name . . . . . . . . . . . . : WORKSTATION01\n   Primary Dns Suffix  . . . . . . . : \n   Node Type . . . . . . . . . . . . : Hybrid\n   IP Routing Enabled. . . . . . . . : No\n   WINS Proxy Enabled. . . . . . . . : No\n\nEthernet adapter ' + name + ':\n\n   Connection-specific DNS Suffix  . : \n   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-V\n   Physical Address. . . . . . . . . : ' + mac + '\n   DHCP Enabled. . . . . . . . . . . : ' + (net.dhcp ? 'Yes' : 'No') + '\n   Autoconfiguration Enabled . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + (net.gateway || '') + '\n   DNS Servers . . . . . . . . . . . : ' + (net.dns1 || '') + '\n                                        ' + (net.dns2 || '') + '\n   NetBIOS over Tcpip. . . . . . . . : Enabled';
            }

            if (joined.includes('/release')) {
                if (net.adapter === 'disabled') {
                    return '\nAn error occurred while releasing interface ' + name + ' : \nThe system cannot find the file specified.';
                }
                net.ip = '0.0.0.0'; net.subnet = '0.0.0.0'; net.gateway = '';
                engine.save();
                return '\nWindows IP Configuration\n\nEthernet adapter ' + name + ':\n\n   Connection-specific DNS Suffix  . : \n   IPv4 Address. . . . . . . . . . . : 0.0.0.0\n   Subnet Mask . . . . . . . . . . . : 0.0.0.0\n   Default Gateway . . . . . . . . . :';
            }

            if (joined.includes('/renew')) {
                if (net.adapter === 'disabled') {
                    return '\nAn error occurred while renewing interface ' + name + ' :\nThe system cannot find the file specified.';
                }
                // DHCP service stopped: renew fails
                if (engine.state._dhcpServiceStopped) {
                    return '\nAn error occurred while renewing interface ' + name + ' :\nUnable to contact your DHCP server. Request has timed out.';
                }
                if (!net.dhcp) {
                    return '\nAn error occurred while renewing interface ' + name + ' :\nUnable to contact your DHCP server. Request has timed out.';
                }
                // DHCP success
                const scenario = NT1Config._getScenario(engine);
                if (scenario && scenario.id === 'disabled_adapter' && scenario.enabledConfig) {
                    Object.assign(net, scenario.enabledConfig);
                } else {
                    net.ip = '192.168.1.50'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.1';
                    net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4';
                }
                engine.save();
                return '\nWindows IP Configuration\n\nEthernet adapter ' + name + ':\n\n   Connection-specific DNS Suffix  . : \n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + net.gateway;
            }

            if (joined.includes('/flushdns')) {
                if (engine.state._dnsPoisoned) {
                    engine.state._dnsPoisoned = false;
                    engine.save();
                    return '\nWindows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.\n\n  [Cache cleared — 47 entries removed, including 8 suspicious records]';
                }
                return '\nWindows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.';
            }

            if (joined.includes('/displaydns')) {
                // DNS poisoned: show poisoned entries
                if (engine.state._dnsPoisoned) {
                    let output = '\nWindows IP Configuration\n';
                    const entries = [
                        { name: 'google.com', ip: '203.0.113.50' },
                        { name: 'www.google.com', ip: '203.0.113.50' },
                        { name: 'microsoft.com', ip: '203.0.113.51' },
                        { name: 'bing.com', ip: '203.0.113.52' }
                    ];
                    entries.forEach(function(e) {
                        output += '\n    ' + e.name;
                        output += '\n    ----------------------------------------';
                        output += '\n    Record Name . . . . . : ' + e.name;
                        output += '\n    Record Type . . . . . : 1';
                        output += '\n    Time To Live  . . . . : 86400';
                        output += '\n    Data Length . . . . . : 4';
                        output += '\n    Section . . . . . . . : Answer';
                        output += '\n    A (Host) Record . . . : ' + e.ip;
                        output += '\n';
                    });
                    output += '\n    [WARNING: Cache entries may have been tampered with]';
                    return output;
                }

                // After flushing + lab complete: flag hidden here
                if (engine.state._flagRevealed && NT1Config._getScenario(engine)?.id === 'dns_poisoned') {
                    const flagVal = await engine.requestFlagText('dns_poisoned');
                    return '\nWindows IP Configuration\n\n    localhost\n    ----------------------------------------\n    Record Name . . . . . : localhost\n    Record Type . . . . . : 1\n    Time To Live  . . . . : 0\n    Data Length . . . . . : 4\n    Section . . . . . . . : Answer\n    A (Host) Record . . . : 127.0.0.1\n\n    recovery.hexworth.local\n    ----------------------------------------\n    Record Name . . . . . : recovery.hexworth.local\n    Record Type . . . . . : 16\n    Time To Live  . . . . : 300\n    Data Length . . . . . : 32\n    Section . . . . . . . : Answer\n    TXT Record  . . . . . : ' + flagVal + '\n';
                }

                return '\nWindows IP Configuration\n\n    Record Name . . . . . : localhost\n    Record Type . . . . . : 1\n    Time To Live  . . . . : 0\n    Data Length . . . . . : 4\n    Section . . . . . . . : Answer\n    A (Host) Record . . . : 127.0.0.1';
            }

            if (joined.includes('/?') || joined.includes('/help')) {
                return '\nUSAGE:\n    ipconfig [/all | /release | /renew | /flushdns | /displaydns]\n\nOptions:\n    /all         Display full configuration information.\n    /release     Release the IPv4 address for the specified adapter.\n    /renew       Renew the IPv4 address for the specified adapter.\n    /flushdns    Purges the DNS Resolver cache.\n    /displaydns  Display the contents of the DNS Resolver Cache.';
            }

            // Default: basic ipconfig
            if (net.adapter === 'disabled') {
                return '\nWindows IP Configuration\n\nEthernet adapter ' + name + ':\n\n   Media State . . . . . . . . . . . : Media disconnected\n   Connection-specific DNS Suffix  . :';
            }
            return '\nWindows IP Configuration\n\nEthernet adapter ' + name + ':\n\n   Connection-specific DNS Suffix  . : \n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + (net.gateway || '');
        },

        // --- PING ---

        ping: async function(args, term, engine) {
            const gate = NT1Config._requireScenario(engine);
            if (gate) return gate;

            if (!args.length || args[0] === '/?') {
                return '\nUsage: ping [-t] [-n count] [-l size] target_name\n\nOptions:\n    -t             Ping until stopped (Ctrl+C).\n    -n count       Number of echo requests to send.\n    target_name    IP address or hostname to ping.';
            }

            let target = null;
            for (const a of args) {
                if (!a.startsWith('-') && !a.startsWith('/')) { target = a; break; }
            }
            if (!target) return 'Bad parameter.\nUsage: ping target_name';

            const result = NT1Config._checkConnectivity(target, engine);

            if (result.dnsError) {
                return '\n' + result.error;
            }

            // Use resolvedIP for display (shows poisoned resolution)
            const displayIP = result.resolvedIP || result.ip || target;
            let output = '\nPinging ' + target + (displayIP !== target ? ' [' + displayIP + ']' : '') + ' with 32 bytes of data:\n';

            let received = 0;
            for (let i = 0; i < 4; i++) {
                if (result.success) {
                    const ms = result.ms === 0 ? '<1' : String(result.ms + Math.floor(Math.random() * 5));
                    output += 'Reply from ' + displayIP + ': bytes=32 time=' + ms + 'ms TTL=117\n';
                    received++;
                } else {
                    output += result.error + '\n';
                }
            }

            const lost = 4 - received;
            const pct = Math.round((lost / 4) * 100);
            output += '\nPing statistics for ' + displayIP + ':\n';
            output += '    Packets: Sent = 4, Received = ' + received + ', Lost = ' + lost + ' (' + pct + '% loss),\n';
            if (received > 0 && result.ms > 0) {
                output += 'Approximate round trip times in milli-seconds:\n';
                output += '    Minimum = ' + result.ms + 'ms, Maximum = ' + (result.ms + 5) + 'ms, Average = ' + (result.ms + 2) + 'ms';
            }

            // Check lab completion
            if (result.success && !NT1Config._isIP(target)) {
                const flagValue = await NT1Config._checkLabComplete(target, result, engine);
                if (flagValue) {
                    output += '\n\n' + '='.repeat(52);
                    output += '\n  CONNECTIVITY RESTORED — FLAG RETRIEVED';
                    output += '\n  ' + flagValue;
                    output += '\n  Submit this flag using the SUBMIT FLAG button.';
                    output += '\n' + '='.repeat(52);
                }
            }

            return output;
        },

        // --- TRACERT ---

        tracert: function(args, term, engine) {
            const gate = NT1Config._requireScenario(engine);
            if (gate) return gate;
            const target = args[0];
            if (!target || target === '/?') {
                return '\nUsage: tracert [-d] target_name\n\nTraces the route to a network host.';
            }
            const net = engine.state._networkConfig;

            if (net.adapter === 'disabled') return '\nUnable to resolve target system name ' + target + '.';
            if (!net.ip || net.ip === '0.0.0.0' || net.ip.startsWith('169.254')) return '\nUnable to resolve target system name ' + target + '.';

            if (!NT1Config._isIP(target)) {
                if (!NT1Config._canReachInternet(net, engine) || !NT1Config._canResolveDNS(net, engine)) {
                    return '\nUnable to resolve target system name ' + target + '.';
                }
            }

            const destIP = NT1Config._isIP(target) ? target : (NT1Config._knownDomains[target.toLowerCase()] || '93.184.216.34');
            let output = '\nTracing route to ' + target + ' [' + destIP + ']\nover a maximum of 30 hops:\n\n';

            if (!NT1Config._canReachGateway(net)) {
                output += '  1     *        *        *     Request timed out.\n  2     *        *        *     Request timed out.\n  3     *        *        *     Request timed out.\n\nTrace complete.';
                return output;
            }

            // Firewall: reaches gateway but nothing beyond
            if (engine.state._firewallBlocking) {
                output += '  1    <1 ms    <1 ms    <1 ms  192.168.1.1\n  2     *        *        *     Request timed out.\n  3     *        *        *     Request timed out.\n  4     *        *        *     Request timed out.\n\nTrace complete.';
                return output;
            }

            if (!NT1Config._canReachInternet(net, engine)) {
                output += '  1    <1 ms    <1 ms    <1 ms  ' + net.gateway + '\n  2     *        *        *     Request timed out.\n  3     *        *        *     Request timed out.\n\nTrace complete.';
                return output;
            }

            output += '  1    <1 ms    <1 ms    <1 ms  192.168.1.1\n  2    10 ms    12 ms    11 ms  10.0.0.1\n  3    15 ms    14 ms    16 ms  72.14.215.85\n  4    18 ms    17 ms    19 ms  ' + destIP + '\n\nTrace complete.';
            return output;
        },

        // --- NSLOOKUP ---

        nslookup: function(args, term, engine) {
            const gate = NT1Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length || args[0] === '/?') {
                return '\nUsage: nslookup hostname [dns-server]\n\nQueries DNS servers for information about a host.';
            }
            const net = engine.state._networkConfig;
            const target = args[0];
            const server = args[1] || net.dns1;

            if (net.adapter === 'disabled') {
                return '\nDNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  0.0.0.0\n\n*** Request to UnKnown timed-out';
            }

            // Firewall blocking: can't reach external DNS
            if (engine.state._firewallBlocking) {
                return '\nDNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  ' + (server || '0.0.0.0') + '\n\n*** UnKnown can\'t find ' + target + ': No response from server';
            }

            // DNS poisoned: returns wrong IPs (local cache is poisoned)
            if (engine.state._dnsPoisoned) {
                const poisonedIP = NT1Config._poisonedDNS[target.toLowerCase()];
                if (poisonedIP) {
                    const serverName = server === '8.8.8.8' ? 'dns.google' : server === '1.1.1.1' ? 'one.one.one.one' : server;
                    return '\nServer:  ' + serverName + '\nAddress:  ' + server + '\n\nNon-authoritative answer:\nName:    ' + target + '\nAddress:  ' + poisonedIP + '\n\n  [Note: Response served from local cache]';
                }
            }

            const dnsReachable = NT1Config._canReachInternet(net, engine) && (NT1Config._validDNS.includes(server) || args[1]);
            if (!dnsReachable && !NT1Config._validDNS.includes(server)) {
                return '\nDNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  ' + (server || '0.0.0.0') + '\n\n*** UnKnown can\'t find ' + target + ': Non-existent domain';
            }
            if (!NT1Config._canReachInternet(net, engine)) {
                return '\nDNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  ' + server + '\n\n*** UnKnown can\'t find ' + target + ': No response from server';
            }

            const resolved = NT1Config._knownDomains[target.toLowerCase()] || '93.184.216.34';
            const serverName = server === '8.8.8.8' ? 'dns.google' : server === '1.1.1.1' ? 'one.one.one.one' : server;
            return '\nServer:  ' + serverName + '\nAddress:  ' + server + '\n\nNon-authoritative answer:\nName:    ' + target + '\nAddress:  ' + resolved;
        },

        // --- NETSTAT ---

        netstat: function(args, term, engine) {
            const gate = NT1Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            const joined = args.join(' ').toLowerCase();

            if (args.includes('/?')) {
                return '\nUsage: netstat [-a] [-n] [-o] [-b]\n\nDisplays protocol statistics and current TCP/IP network connections.';
            }

            if (net.adapter === 'disabled' || !net.ip || net.ip === '0.0.0.0' || net.ip.startsWith('169.254')) {
                return '\nActive Connections\n\n  Proto  Local Address          Foreign Address        State\n  TCP    127.0.0.1:49155        127.0.0.1:49156        ESTABLISHED';
            }

            let output = '\nActive Connections\n\n  Proto  Local Address          Foreign Address        State\n';
            output += '  TCP    ' + net.ip + ':49152     52.113.194.132:443     ESTABLISHED\n';
            output += '  TCP    ' + net.ip + ':49153     13.107.42.14:443       ESTABLISHED\n';
            output += '  TCP    ' + net.ip + ':49154     40.126.32.140:443      ESTABLISHED\n';
            output += '  TCP    127.0.0.1:49155        127.0.0.1:49156        ESTABLISHED';
            if (joined.includes('-a')) {
                output += '\n  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING';
                output += '\n  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING';
                output += '\n  TCP    0.0.0.0:5040           0.0.0.0:0              LISTENING';
                output += '\n  UDP    0.0.0.0:5353           *:*';
                output += '\n  UDP    0.0.0.0:5355           *:*';
            }
            return output;
        },

        // --- NETSH ---

        netsh: function(args, term, engine) {
            const gate = NT1Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            const line = args.join(' ');
            const lower = line.toLowerCase();

            if (!args.length || args[0] === '/?') {
                return '\nUsage: netsh interface ip set address <adapter> static <IP> <Subnet> <Gateway>\n       netsh interface ip set address <adapter> dhcp\n       netsh interface ip set dns <adapter> static <DNS>\n       netsh interface ip set dns <adapter> dhcp\n       netsh interface set interface <adapter> enable|disable\n       netsh interface ip show config';
            }

            if (/interface\s+ip\s+show\s+config/i.test(lower)) {
                if (net.adapter === 'disabled') {
                    return '\nConfiguration for interface "' + NT1Config._adapterName + '"\n    Administrative state:            Disabled';
                }
                return '\nConfiguration for interface "' + NT1Config._adapterName + '"\n    DHCP enabled:                    ' + (net.dhcp ? 'Yes' : 'No') + '\n    IP Address:                      ' + net.ip + '\n    Subnet Prefix:                   ' + net.subnet + '\n    Default Gateway:                 ' + (net.gateway || 'None') + '\n    DNS Servers:                     ' + (net.dns1 || 'None') + '\n                                     ' + (net.dns2 || '');
            }

            if (/interface\s+set\s+interface/i.test(lower)) {
                if (/enable/i.test(lower)) {
                    if (net.adapter === 'enabled') return '\nThis network connection is already enabled.';
                    net.adapter = 'enabled';
                    const scenario = NT1Config._getScenario(engine);
                    if (scenario && scenario.id === 'disabled_adapter' && scenario.enabledConfig) {
                        Object.assign(net, scenario.enabledConfig);
                    } else {
                        net.dhcp = true;
                    }
                    engine.save();
                    return '\nThis network connection has been enabled.';
                }
                if (/disable/i.test(lower)) {
                    net.adapter = 'disabled';
                    net.ip = '0.0.0.0'; net.subnet = '0.0.0.0'; net.gateway = ''; net.dns1 = ''; net.dns2 = '';
                    engine.save();
                    return '\nThis network connection has been disabled.';
                }
            }

            if (/interface\s+ip\s+set\s+address/i.test(lower)) {
                if (/dhcp/i.test(lower)) {
                    net.dhcp = true;
                    engine.save();
                    return '\nOk.\n';
                }
                const match = line.match(/static\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)/i);
                if (match) {
                    net.dhcp = false; net.ip = match[1]; net.subnet = match[2]; net.gateway = match[3];
                    engine.save();
                    return '\nOk.\n';
                }
                return '\nThe syntax of the command is:\n  netsh interface ip set address "' + NT1Config._adapterName + '" static <IP> <SubnetMask> <Gateway>';
            }

            if (/interface\s+ip\s+set\s+dns/i.test(lower)) {
                if (/dhcp/i.test(lower)) {
                    net.dns1 = ''; net.dns2 = ''; net.dhcp = true;
                    engine.save();
                    return '\nOk.\n';
                }
                const match = line.match(/static\s+(\d+\.\d+\.\d+\.\d+)/i);
                if (match) {
                    net.dns1 = match[1];
                    engine.save();
                    return '\nOk.\n';
                }
                return '\nThe syntax of the command is:\n  netsh interface ip set dns "' + NT1Config._adapterName + '" static <DNS>';
            }

            if (/interface\s+ip\s+add\s+dns/i.test(lower)) {
                const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
                if (match) {
                    net.dns2 = match[1];
                    engine.save();
                    return '\nOk.\n';
                }
            }

            return '\nThe following command was not found: ' + line + '\nType netsh /? for usage.';
        },

        // --- ARP ---

        arp: function(args, term, engine) {
            const gate = NT1Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;

            if (net.adapter === 'disabled' || !net.ip || net.ip === '0.0.0.0' || net.ip.startsWith('169.254')) {
                return '\nNo ARP Entries Found.';
            }

            let output = '\nInterface: ' + net.ip + ' --- 0x3\n  Internet Address      Physical Address      Type\n';
            // Gateway only appears in ARP if on same subnet
            if (net.gateway && NT1Config._sameSubnet(net.ip, net.gateway, net.subnet)) {
                output += '  ' + net.gateway + '       00-1a-2b-3c-4d-01     dynamic\n';
                output += '  192.168.1.200         00-1a-2b-3c-4d-02     dynamic\n';
            }
            output += '  ' + (NT1Config._sameSubnet(net.ip, '192.168.1.255', net.subnet) ? '192.168.1.255' : net.ip.replace(/\.\d+$/, '.255')) + '         ff-ff-ff-ff-ff-ff     static\n';
            output += '  224.0.0.22            01-00-5e-00-00-16     static\n';
            output += '  255.255.255.255       ff-ff-ff-ff-ff-ff     static';
            return output;
        },

        // --- SYSTEMINFO ---

        systeminfo: function(args, term, engine) {
            const gate = NT1Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            return '\nHost Name:                 WORKSTATION01\nOS Name:                   Microsoft Windows 10 Pro\nOS Version:                10.0.19045 N/A Build 19045\nOS Manufacturer:           Microsoft Corporation\nOS Configuration:          Member Workstation\nOS Build Type:             Multiprocessor Free\nSystem Manufacturer:       Dell Inc.\nSystem Model:              OptiPlex 7090\nSystem Type:               x64-based PC\nProcessor(s):              1 Processor(s) Installed.\n                           [01]: Intel(R) Core(TM) i7-11700 @ 2.50GHz\nTotal Physical Memory:     16,384 MB\nAvailable Physical Memory: 8,742 MB\nNetwork Card(s):           1 NIC(s) Installed.\n                           [01]: Intel(R) Ethernet Connection I219-V\n                                 Connection Name: ' + NT1Config._adapterName + '\n                                 Status:          ' + (net.adapter === 'enabled' ? 'Connected' : 'Disconnected') + '\n                                 DHCP Enabled:    ' + (net.dhcp ? 'Yes' : 'No') + (net.adapter === 'enabled' && net.ip ? '\n                                 IP address(es)\n                                 [01]: ' + net.ip : '');
        },

        hostname: function() { return 'WORKSTATION01'; },

        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },

        dir: function() {
            return ' Volume in drive C has no label.\n Volume Serial Number is 8A4B-1C3D\n\n Directory of C:\\Users\\Technician\n\n03/12/2026  08:30 AM    <DIR>          .\n03/12/2026  08:30 AM    <DIR>          ..\n03/12/2026  08:30 AM    <DIR>          Desktop\n03/12/2026  08:30 AM    <DIR>          Documents\n03/12/2026  08:30 AM    <DIR>          Downloads\n               0 File(s)              0 bytes\n               5 Dir(s)  214,748,364,800 bytes free';
        },

        getmac: function() {
            return '\nPhysical Address    Transport Name\n=================== ==========================================================\n' + NT1Config._macAddress + '   \\Device\\Tcpip_{4A2B3C4D-5E6F-7A8B-9C0D-1E2F3A4B5C6D}';
        },

        pathping: function(args, term, engine) {
            if (!args[0]) return '\nUsage: pathping target_name';
            return NT1Config.commands.tracert(args, term, engine);
        },

        route: function(args, term, engine) {
            const gate = NT1Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            if (args[0] === 'print' || !args.length) {
                if (net.adapter === 'disabled' || !net.ip || net.ip === '0.0.0.0') {
                    return '\nIPv4 Route Table\n===========================================================================\nActive Routes:\n  Network Destination        Netmask          Gateway       Interface  Metric\n          127.0.0.0        255.0.0.0         On-link         127.0.0.1    331\n===========================================================================';
                }
                return '\nIPv4 Route Table\n===========================================================================\nActive Routes:\n  Network Destination        Netmask          Gateway       Interface  Metric\n          0.0.0.0          0.0.0.0      ' + (net.gateway || 'None') + '    ' + net.ip + '     25\n        127.0.0.0        255.0.0.0         On-link         127.0.0.1    331\n      192.168.1.0    255.255.255.0         On-link       ' + net.ip + '    281\n===========================================================================';
            }
            return '\nUsage: route print';
        },

        whoami: function() { return 'WORKSTATION01\\Technician'; },

        // Block Linux commands
        ifconfig: function() { return '\'ifconfig\' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: ipconfig'; },
        grep: function() { return '\'grep\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        apt: function() { return '\'apt\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        'apt-get': function() { return '\'apt-get\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        bash: function() { return '\'bash\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        chmod: function() { return '\'chmod\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        cp: function() { return '\'cp\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        mv: function() { return '\'mv\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        rm: function() { return '\'rm\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        nano: function() { return '\'nano\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        vim: function() { return '\'vim\' is not recognized as an internal or external command,\noperable program or batch file.'; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        const requireTicket = ['network_settings', 'device_manager', 'firewall', 'services'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }

        switch (iconDef.app) {
            case 'ticket':           NT1Config._openTicket(iconDef, engine); break;
            case 'network_settings': NT1Config._openNetworkSettings(iconDef, engine); break;
            case 'device_manager':   NT1Config._openDeviceManager(iconDef, engine); break;
            case 'firewall':         NT1Config._openFirewall(iconDef, engine); break;
            case 'services':         NT1Config._openServices(iconDef, engine); break;
            case 'reset_lab':        NT1Config._confirmReset(engine); break;
        }
    },

    // ==========================================================
    // HELP DESK TICKET
    // ==========================================================

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        NT1Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            NT1Config._renderTicket(engine, container);
        } else {
            NT1Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker(engine, container) {
        // Hide scenario names — show only ticket numbers + vague user complaints
        const ticketPreviews = [
            'Sarah Chen — "Websites are loading wrong pages"',
            'Marcus Webb — "Network is completely dead"',
            'Priya Patel — "Can reach printer but not the internet"',
            'David Kim — "Nothing on the network works at all"',
            'Lucia Torres — "Weird IP address, nothing connects"'
        ];

        let html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#0078d4; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">HELP DESK QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select a ticket to begin your assignment, or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        NT1Config._scenarios.forEach(function(s, i) {
            html += '<button class="nt1-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#0078d4; font-weight:bold;">HD-' + (7200 + i) + '</span>'
                + '<span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">HIGH</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + ticketPreviews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';

        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="nt1RandomBtn" style="padding:10px 28px; background:#0078d4; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.nt1-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#0078d4'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                NT1Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                NT1Config._renderTicket(engine, container);
            });
        });

        document.getElementById('nt1RandomBtn').addEventListener('click', function() {
            NT1Config._applyScenario(engine, Math.floor(Math.random() * NT1Config._scenarios.length));
            NT1Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        const scenario = NT1Config._getScenario(engine);
        const submitters = ['Sarah Chen — Marketing Department', 'Marcus Webb — Accounting', 'Priya Patel — Sales Department', 'David Kim — Marketing Department', 'Lucia Torres — Human Resources'];
        const submitter = submitters[engine.state._scenarioId] || 'Employee';

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#0078d4; font-weight:bold; font-size:1rem;">HELP DESK TICKET #HD-' + (7200 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: HIGH</span>'
            + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBMITTED BY</div>'
            + '<div>' + submitter + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DATE</div>'
            + '<div>March 12, 2026 — 8:47 AM</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + NT1Config._escHtml(scenario.ticketSubject) + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + NT1Config._escHtml(scenario.ticketDetail)
            + '<br><br>Please fix ASAP — I have a presentation due at 3pm!</div></div>'

            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div>'
            + '<div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#ffcc80;">'
            + NT1Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')

            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div>'
            + '<div style="color:#2ecc71; font-weight:bold;">YOU — Desktop Support Technician</div></div>';
    },

    // ==========================================================
    // NETWORK SETTINGS
    // ==========================================================

    _openNetworkSettings(iconDef, engine) {
        if (engine._windows[iconDef.id]) {
            engine._focusWindow(iconDef.id);
            NT1Config._refreshNetworkSettings(engine, iconDef.id);
            return;
        }
        const container = document.createElement('div');
        container.id = 'netSettingsContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Network Settings', 'NET', container);
        NT1Config._renderNetworkSettings(engine, container);
    },

    _refreshNetworkSettings(engine, appId) {
        const container = document.getElementById('netSettingsContainer');
        if (container) NT1Config._renderNetworkSettings(engine, container);
    },

    _renderNetworkSettings(engine, container) {
        const net = engine.state._networkConfig;
        const name = NT1Config._adapterName;
        const isDisabled = net.adapter === 'disabled';
        const isDhcp = net.dhcp;

        // Disabled adapter: Network Settings can't see it
        if (isDisabled) {
            container.innerHTML = '<div style="text-align:center; padding:40px 20px;">'
                + '<div style="font-size:2rem; margin-bottom:16px; opacity:0.3;">NET</div>'
                + '<div style="font-size:1rem; font-weight:bold; color:#e74c3c; margin-bottom:12px;">No Network Adapters Detected</div>'
                + '<div style="color:#888; font-size:0.8rem; line-height:1.6;">Windows cannot find any active network adapters.<br><br>'
                + 'The network adapter may be disabled or experiencing a driver issue.<br>'
                + 'Open <strong style="color:#0078d4;">Device Manager</strong> to check adapter status.</div></div>';
            return;
        }

        container.innerHTML = '<div style="margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">'
            + '<div style="font-size:1rem; font-weight:bold; color:#0078d4; margin-bottom:8px;">Network Adapter: ' + name + '</div>'
            + '<div>Status: <strong style="color:#2ecc71;">Enabled</strong></div>'
            + '</div>'

            + '<div style="margin-bottom:16px;">'
            + '<label style="display:flex; align-items:center; gap:8px; cursor:pointer;">'
            + '<input type="checkbox" id="netDhcpToggle" ' + (isDhcp ? 'checked' : '') + '>'
            + '<span>Obtain IP address automatically (DHCP)</span></label></div>'

            + '<div id="netStaticFields" style="' + (isDhcp ? 'opacity:0.4; pointer-events:none;' : '') + '">'
            + NT1Config._settingsField('IP Address', 'netIP', net.ip || '')
            + NT1Config._settingsField('Subnet Mask', 'netSubnet', net.subnet || '')
            + NT1Config._settingsField('Default Gateway', 'netGateway', net.gateway || '')
            + '</div>'

            + '<div style="margin-top:16px; margin-bottom:12px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<label style="display:flex; align-items:center; gap:8px; cursor:pointer;">'
            + '<input type="checkbox" id="netDnsDhcpToggle" ' + (isDhcp ? 'checked' : '') + '>'
            + '<span>Obtain DNS server address automatically</span></label></div>'

            + '<div id="netDnsFields" style="' + (isDhcp ? 'opacity:0.4; pointer-events:none;' : '') + '">'
            + NT1Config._settingsField('Preferred DNS Server', 'netDns1', net.dns1 || '')
            + NT1Config._settingsField('Alternate DNS Server', 'netDns2', net.dns2 || '')
            + '</div>'

            + '<div style="margin-top:20px; display:flex; gap:8px;">'
            + '<button id="netApplyBtn" style="padding:8px 24px; background:#0078d4; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Apply</button>'
            + '<button id="netRefreshBtn" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer; font-size:0.8rem;">Refresh</button>'
            + '</div>'

            + '<div id="netStatus" style="margin-top:12px; padding:8px; border-radius:4px; display:none; font-size:0.75rem;"></div>';

        // Event listeners
        const dhcpToggle = document.getElementById('netDhcpToggle');
        const dnsDhcpToggle = document.getElementById('netDnsDhcpToggle');

        if (dhcpToggle) {
            dhcpToggle.addEventListener('change', function() {
                const fields = document.getElementById('netStaticFields');
                if (this.checked) {
                    if (fields) { fields.style.opacity = '0.4'; fields.style.pointerEvents = 'none'; }
                    if (dnsDhcpToggle) { dnsDhcpToggle.checked = true; dnsDhcpToggle.dispatchEvent(new Event('change')); }
                } else {
                    if (fields) { fields.style.opacity = '1'; fields.style.pointerEvents = 'auto'; }
                }
            });
        }

        if (dnsDhcpToggle) {
            dnsDhcpToggle.addEventListener('change', function() {
                const fields = document.getElementById('netDnsFields');
                if (this.checked) {
                    if (fields) { fields.style.opacity = '0.4'; fields.style.pointerEvents = 'none'; }
                } else {
                    if (fields) { fields.style.opacity = '1'; fields.style.pointerEvents = 'auto'; }
                }
            });
        }

        document.getElementById('netApplyBtn').addEventListener('click', function() {
            const useDhcp = document.getElementById('netDhcpToggle')?.checked;
            if (useDhcp) {
                // DHCP service stopped: can't get lease
                if (engine.state._dhcpServiceStopped) {
                    NT1Config._showNetStatus('DHCP lease renewal failed. The DHCP Client service may not be running. Check Services.', '#e74c3c');
                    return;
                }
                net.dhcp = true;
                net.ip = '192.168.1.50'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.1';
                const useDnsDhcp = document.getElementById('netDnsDhcpToggle')?.checked;
                if (useDnsDhcp) { net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4'; }
                else { net.dns1 = document.getElementById('netDns1')?.value || net.dns1; net.dns2 = document.getElementById('netDns2')?.value || net.dns2; }
            } else {
                net.dhcp = false;
                net.ip = document.getElementById('netIP')?.value || net.ip;
                net.subnet = document.getElementById('netSubnet')?.value || net.subnet;
                net.gateway = document.getElementById('netGateway')?.value || net.gateway;
                const useDnsDhcp = document.getElementById('netDnsDhcpToggle')?.checked;
                if (useDnsDhcp) { net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4'; }
                else { net.dns1 = document.getElementById('netDns1')?.value || net.dns1; net.dns2 = document.getElementById('netDns2')?.value || net.dns2; }
            }
            engine.save();
            NT1Config._renderNetworkSettings(engine, container);
            NT1Config._showNetStatus('Settings applied successfully.', '#2ecc71');
        });

        document.getElementById('netRefreshBtn').addEventListener('click', function() {
            NT1Config._renderNetworkSettings(engine, container);
        });
    },

    // ==========================================================
    // DEVICE MANAGER
    // ==========================================================

    _openDeviceManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT1Config._renderDeviceManager(engine); return; }
        const container = document.createElement('div');
        container.id = 'devmgrContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Device Manager', 'DEV', container);
        NT1Config._renderDeviceManager(engine);
    },

    async _renderDeviceManager(engine) {
        const container = document.getElementById('devmgrContainer');
        if (!container) return;
        const net = engine.state._networkConfig;
        const isDisabled = net.adapter === 'disabled';
        const scenario = NT1Config._getScenario(engine);
        const showFlag = engine.state._flagRevealed && scenario?.id === 'disabled_adapter' && !isDisabled;
        const flagVal = showFlag ? await engine.requestFlagText('disabled_adapter') : null;

        container.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#0078d4; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Device Manager — WORKSTATION01</div>'

            // Device tree
            + '<div style="margin-bottom:8px;">'
            + '<div style="color:#aaa; padding:4px 0;">&#9660; Computer</div>'

            + '<div style="padding-left:20px;">'
            + '<div style="color:#888; padding:4px 0;">&#9654; Display adapters</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; Disk drives</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; Keyboards</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; Mice and other pointing devices</div>'

            + '<div style="padding:4px 0;">'
            + '<span style="color:#ccc;">&#9660; Network adapters</span>'
            + '<div style="padding-left:20px; margin-top:4px;">'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid ' + (isDisabled ? '#e74c3c' : '#2ecc71') + '; border-radius:4px; padding:12px; margin-bottom:8px;">'
            + '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">'
            + '<span style="font-size:1.2rem;">' + (isDisabled ? '<span style="color:#e74c3c;">&#10006;</span>' : '<span style="color:#2ecc71;">&#10004;</span>') + '</span>'
            + '<span style="font-weight:bold;">Intel(R) Ethernet Connection I219-V</span>'
            + '</div>'

            + '<div style="font-size:0.75rem; color:#888; margin-bottom:8px;">'
            + '<div>Driver: Intel — 12.19.1.37 (2024-06-15)</div>'
            + '<div>Status: <span style="color:' + (isDisabled ? '#e74c3c; font-weight:bold;">DISABLED' : '#2ecc71;">Working properly') + '</span></div>'
            + '<div>IRQ: 16 &nbsp; | &nbsp; I/O Range: 0xF000-0xF01F</div>'
            + '</div>'

            + (showFlag
                ? '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:8px; margin-bottom:8px; font-size:0.75rem;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Diagnostic Report:</div>'
                + '<div style="color:#c8e6c9;">' + flagVal + '</div></div>'
                : '')

            + '<div style="display:flex; gap:8px;">'
            + (isDisabled
                ? '<button id="devmgrEnableBtn" style="padding:6px 20px; background:#2ecc71; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Enable Device</button>'
                : '<button disabled style="padding:6px 20px; background:rgba(255,255,255,0.1); color:#888; border:1px solid rgba(255,255,255,0.1); border-radius:3px; font-size:0.75rem; cursor:default;">Device Enabled</button>')
            + '<button id="devmgrPropsBtn" style="padding:6px 20px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:3px; cursor:pointer; font-size:0.75rem;">Properties</button>'
            + '</div>'

            + '</div></div></div>'

            + '<div style="color:#888; padding:4px 0;">&#9654; Sound, video and game controllers</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; Storage controllers</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; USB controllers</div>'
            + '</div></div>';

        if (isDisabled) {
            const btn = document.getElementById('devmgrEnableBtn');
            if (btn) {
                btn.addEventListener('click', function() {
                    net.adapter = 'enabled';
                    const sc = NT1Config._getScenario(engine);
                    if (sc && sc.id === 'disabled_adapter' && sc.enabledConfig) {
                        Object.assign(net, sc.enabledConfig);
                    } else {
                        net.dhcp = true;
                    }
                    engine.save();
                    engine.notify('Network adapter enabled. Run ipconfig /renew to obtain a DHCP lease.', 'success');
                    NT1Config._renderDeviceManager(engine);
                });
            }
        }

        const propsBtn = document.getElementById('devmgrPropsBtn');
        if (propsBtn) {
            propsBtn.addEventListener('click', function() {
                engine.notify(isDisabled ? 'Adapter is disabled. Enable it first to view full properties.' : 'Intel(R) Ethernet Connection I219-V — Driver v12.19.1.37 — Working properly.', isDisabled ? 'error' : 'info');
            });
        }
    },

    // ==========================================================
    // WINDOWS FIREWALL
    // ==========================================================

    _openFirewall(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT1Config._renderFirewall(engine); return; }
        const container = document.createElement('div');
        container.id = 'fwContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Windows Firewall', 'FW', container);
        NT1Config._renderFirewall(engine);
    },

    async _renderFirewall(engine) {
        const container = document.getElementById('fwContainer');
        if (!container) return;
        const isBlocking = engine.state._firewallBlocking;
        const scenario = NT1Config._getScenario(engine);
        const isFirewallScenario = scenario?.id === 'firewall_block';
        const flagVal = isFirewallScenario ? await engine.requestFlagText('firewall_block') : null;

        container.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#0078d4; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Windows Defender Firewall with Advanced Security</div>'

            // Tabs
            + '<div style="display:flex; gap:0; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1);">'
            + '<div style="padding:8px 16px; border-bottom:2px solid transparent; color:#888; font-size:0.75rem;">Inbound Rules</div>'
            + '<div style="padding:8px 16px; border-bottom:2px solid #0078d4; color:#0078d4; font-size:0.75rem; font-weight:bold;">Outbound Rules</div>'
            + '<div style="padding:8px 16px; border-bottom:2px solid transparent; color:#888; font-size:0.75rem;">Monitoring</div>'
            + '</div>'

            // Rules list
            + '<div style="font-size:0.7rem; color:#888; margin-bottom:8px;">Name &nbsp; | &nbsp; Status &nbsp; | &nbsp; Action &nbsp; | &nbsp; Profile</div>'

            // Malicious rule (only in firewall scenario)
            + (isFirewallScenario
                ? '<div id="fwBlockRule" style="background:' + (isBlocking ? 'rgba(231,76,60,0.1)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isBlocking ? '#e74c3c' : 'rgba(255,255,255,0.08)') + '; border-radius:4px; padding:12px; margin-bottom:8px;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">'
                + '<span style="font-weight:bold; color:' + (isBlocking ? '#e74c3c' : '#888; text-decoration: line-through') + ';">Block All Outbound Traffic</span>'
                + '<span style="font-size:0.7rem; padding:2px 8px; border-radius:3px; background:' + (isBlocking ? '#e74c3c' : 'rgba(255,255,255,0.1)') + '; color:' + (isBlocking ? '#fff' : '#888') + ';">' + (isBlocking ? 'ENABLED' : 'DISABLED') + '</span>'
                + '</div>'
                + '<div style="font-size:0.75rem; color:#888; margin-bottom:4px;">Action: <span style="color:#e74c3c;">Block</span> &nbsp; | &nbsp; Protocol: All &nbsp; | &nbsp; Profile: Domain, Private, Public</div>'
                + '<div style="font-size:0.75rem; color:#888; margin-bottom:8px;">Direction: Outbound &nbsp; | &nbsp; Remote: Any address beyond local subnet</div>'
                + '<div style="font-size:0.7rem; color:#aaa; margin-bottom:8px; padding:6px; background:rgba(255,255,255,0.03); border-radius:3px; font-style:italic;">'
                + 'Description: GPO-deployed security policy — incident ref: ' + flagVal + '</div>'
                + '<div>'
                + (isBlocking
                    ? '<button id="fwDisableBtn" style="padding:5px 16px; background:#e74c3c; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Disable Rule</button>'
                    : '<span style="color:#888; font-size:0.75rem;">Rule disabled</span>')
                + '</div></div>'
                : '')

            // Normal rules
            + '<div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; padding:8px 12px; margin-bottom:4px;">'
            + '<div style="display:flex; justify-content:space-between;"><span>Allow Core Networking</span><span style="color:#2ecc71; font-size:0.7rem;">Enabled — Allow</span></div></div>'

            + '<div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; padding:8px 12px; margin-bottom:4px;">'
            + '<div style="display:flex; justify-content:space-between;"><span>Allow DHCP Client</span><span style="color:#2ecc71; font-size:0.7rem;">Enabled — Allow</span></div></div>'

            + '<div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; padding:8px 12px; margin-bottom:4px;">'
            + '<div style="display:flex; justify-content:space-between;"><span>Allow DNS Client</span><span style="color:#2ecc71; font-size:0.7rem;">Enabled — Allow</span></div></div>'

            + '<div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; padding:8px 12px; margin-bottom:4px;">'
            + '<div style="display:flex; justify-content:space-between;"><span>Allow Windows Update</span><span style="color:#2ecc71; font-size:0.7rem;">Enabled — Allow</span></div></div>'

            + '<div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; padding:8px 12px; margin-bottom:4px;">'
            + '<div style="display:flex; justify-content:space-between;"><span>Allow Remote Desktop</span><span style="color:#888; font-size:0.7rem;">Disabled — Allow</span></div></div>';

        if (isBlocking && isFirewallScenario) {
            const btn = document.getElementById('fwDisableBtn');
            if (btn) {
                btn.addEventListener('click', function() {
                    engine.state._firewallBlocking = false;
                    engine.save();
                    engine.notify('Outbound blocking rule disabled. Test connectivity with ping.', 'success');
                    NT1Config._renderFirewall(engine);
                });
            }
        }
    },

    // ==========================================================
    // SERVICES
    // ==========================================================

    _openServices(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT1Config._renderServices(engine); return; }
        const container = document.createElement('div');
        container.id = 'svcContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Services', 'SVC', container);
        NT1Config._renderServices(engine);
    },

    async _renderServices(engine) {
        const container = document.getElementById('svcContainer');
        if (!container) return;
        const dhcpStopped = engine.state._dhcpServiceStopped;
        const scenario = NT1Config._getScenario(engine);
        const isDhcpScenario = scenario?.id === 'dhcp_stopped';
        const showFlag = engine.state._flagRevealed && isDhcpScenario && !dhcpStopped;
        const flagVal = showFlag ? await engine.requestFlagText('dhcp_stopped') : null;

        const services = [
            { name: 'Background Intelligent Transfer', status: 'Running', startup: 'Automatic' },
            { name: 'COM+ Event System', status: 'Running', startup: 'Automatic' },
            { name: 'Cryptographic Services', status: 'Running', startup: 'Automatic' },
            { name: 'DHCP Client', status: dhcpStopped ? 'Stopped' : 'Running', startup: 'Automatic', highlight: isDhcpScenario },
            { name: 'DNS Client', status: 'Running', startup: 'Automatic' },
            { name: 'DCOM Server Process Launcher', status: 'Running', startup: 'Automatic' },
            { name: 'Diagnostic Policy Service', status: 'Running', startup: 'Automatic' },
            { name: 'Network Connections', status: 'Running', startup: 'Manual' },
            { name: 'Network Location Awareness', status: 'Running', startup: 'Automatic' },
            { name: 'Print Spooler', status: 'Running', startup: 'Automatic' },
            { name: 'Security Center', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Defender Firewall', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Event Log', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Update', status: 'Running', startup: 'Manual' },
            { name: 'WLAN AutoConfig', status: 'Running', startup: 'Automatic' }
        ];

        let html = '<div style="font-size:1rem; font-weight:bold; color:#0078d4; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Services (Local)</div>';

        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; margin-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.08);">'
            + '<span style="flex:2;">Name</span>'
            + '<span style="flex:1;">Status</span>'
            + '<span style="flex:1;">Startup Type</span>'
            + '<span style="flex:1;">Action</span></div>';

        services.forEach(function(svc) {
            const isStopped = svc.status === 'Stopped';
            const isHighlight = svc.highlight;
            html += '<div style="display:flex; align-items:center; padding:6px 8px; margin-bottom:2px; background:' + (isHighlight ? (isStopped ? 'rgba(231,76,60,0.08)' : 'rgba(46,204,113,0.08)') : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isHighlight ? (isStopped ? 'rgba(231,76,60,0.3)' : 'rgba(46,204,113,0.3)') : 'rgba(255,255,255,0.04)') + '; border-radius:3px;">'
                + '<span style="flex:2; font-weight:' + (isHighlight ? 'bold' : 'normal') + ';">' + svc.name + '</span>'
                + '<span style="flex:1; color:' + (isStopped ? '#e74c3c; font-weight:bold;' : '#2ecc71;') + '">' + svc.status + '</span>'
                + '<span style="flex:1; color:#888;">' + svc.startup + '</span>'
                + '<span style="flex:1;">';

            if (isHighlight && isStopped) {
                html += '<button class="svc-start-btn" data-svc="dhcp" style="padding:3px 12px; background:#2ecc71; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.7rem; font-weight:bold;">Start</button>';
            } else if (isHighlight && !isStopped) {
                html += '<span style="color:#2ecc71; font-size:0.7rem;">Running</span>';
            } else {
                html += '';
            }
            html += '</span></div>';
        });

        // Show flag after starting DHCP service
        if (showFlag) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">DHCP Client — Recovery Log:</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem;">Service started successfully. Lease acquisition pending.</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem; margin-top:4px;">Recovery token: ' + flagVal + '</div></div>';
        }

        container.innerHTML = html;

        // Wire start button
        const startBtn = container.querySelector('.svc-start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                engine.state._dhcpServiceStopped = false;
                engine.save();
                engine.notify('DHCP Client service started. Run ipconfig /renew to obtain a lease.', 'success');
                NT1Config._renderServices(engine);
            });
        }
    },

    // ==========================================================
    // UTILITY METHODS
    // ==========================================================

    _settingsField(label, id, value) {
        return '<div style="display:flex; align-items:center; margin-bottom:8px;">'
            + '<label style="width:160px; color:#888; font-size:0.75rem;" for="' + id + '">' + label + ':</label>'
            + '<input type="text" id="' + id + '" value="' + NT1Config._escHtml(value) + '" style="flex:1; max-width:200px; padding:4px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;">'
            + '</div>';
    },

    _showNetStatus(msg, color) {
        const el = document.getElementById('netStatus');
        if (!el) return;
        el.style.display = 'block';
        el.style.background = 'rgba(' + (color === '#2ecc71' ? '46,204,113' : '231,76,60') + ',0.1)';
        el.style.border = '1px solid ' + color;
        el.style.color = color;
        el.textContent = msg;
        setTimeout(() => { if (el) el.style.display = 'none'; }, 4000);
    },

    _confirmReset(engine) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;">'
            + '<div style="font-size:1rem; font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div>'
            + '<div style="font-size:0.8rem; color:#aaa; margin-bottom:20px;">This will clear all progress, generate a new scenario, and restart from the beginning.</div>'
            + '<div style="display:flex; gap:12px; justify-content:center;">'
            + '<button id="nt1ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Reset</button>'
            + '<button id="nt1ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div></div>';

        const arena = document.getElementById('arena');
        arena.appendChild(overlay);

        document.getElementById('nt1ResetConfirm').addEventListener('click', function() {
            NT1Config._flagRestored = false;
            NT1Config.hints = NT1Config._defaultHints;
            engine.reset();
        });
        document.getElementById('nt1ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    },

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
