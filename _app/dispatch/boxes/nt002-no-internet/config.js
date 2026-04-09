/* ============================================================
   ARENA LAB — Box NT002: No Internet
   Network Troubleshooting — Network+ N10-009
   Config: network state, CLI output, scenarios
   5 distinct scenarios with unique symptoms, root causes, and flags
   ============================================================ */

const NT002Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'No Internet',
    subtitle: 'Internet Connectivity Troubleshooting — Network+',
    difficulty: 'Beginner',
    accent: '#06b6d4',
    storageKey: 'hexworth_lab_nt002',
    registryId: 'nt002-no-internet',
    trackerKey: 'lab_nt002',

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
                title: 'Investigate the network stack',
                tip: 'Open the terminal and run: ipconfig /all to see the current network configuration.',
                trigger: { event: 'command', match: { cmd: 'contains:ipconfig' } }
            },
            {
                title: 'Test connectivity layer by layer',
                tip: 'Ping 127.0.0.1 (loopback), then the gateway, then 8.8.8.8, then google.com. The first failure reveals the broken layer.',
                trigger: { event: 'command', match: { cmd: 'contains:ping' } }
            },
            {
                title: 'Apply the fix',
                tip: 'Use the appropriate tool — Network Settings, terminal commands, or Services — to fix the root cause.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:netsh' },
                    alt: [
                        { event: 'window_open', match: { type: 'network' } },
                        { event: 'window_open', match: { type: 'services' } }
                    ]
                }
            },
            {
                title: 'Verify and capture the flag',
                tip: 'Run: ping google.com — if it replies, you fixed it! Then find the flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES (Network+ N10-009 mapping)
    // ==========================================================

    certObjectives: {
        certPath: 'N10-009',
        mappings: [
            { flagId: 'fixed', objective: '5.3', description: 'Given a scenario, troubleshoot common network connectivity issues', skill: 'Default Gateway / DNS / DHCP Troubleshooting' },
            { flagId: 'fixed', objective: '5.2', description: 'Given a scenario, use the appropriate tool', skill: 'ipconfig, ping, tracert, nslookup, netstat' },
            { flagId: 'fixed', objective: '1.4', description: 'Given a scenario, configure a subnet and use appropriate IP addressing schemes', skill: 'IP Configuration and DHCP' }
        ]
    },

    // ==========================================================
    // SABOTAGE SCENARIOS
    // ==========================================================

    _scenarioFlags: {
        wrong_gateway:      null,
        dns_down:           null,
        dhcp_expired:       null,
        proxy_misconfig:    null,
        cable_unplugged:    null
    },

    _scenarios: [
        {
            id: 'wrong_gateway',
            name: 'Wrong Default Gateway',
            ticketSubject: 'Cannot access any website or external resource',
            ticketDetail: 'I can\'t get to any website at all. I tried Google, Bing, and our company portal. Nothing loads. My coworker next to me is fine. I noticed my IP address looks normal but I still can\'t get anywhere. The new tech set up my static IP yesterday after we moved offices.',
            ticketExtra: 'IT Note: This workstation was moved from Building A (192.168.1.0/24, GW .1) to Building B (192.168.1.0/24, GW .254). Static IP was re-configured on-site.',
            fixDescription: 'Change the default gateway from 192.168.1.100 to 192.168.1.254',
            brokenConfig: {
                adapter: 'enabled', dhcp: false,
                ip: '192.168.1.42', subnet: '255.255.255.0', gateway: '192.168.1.100',
                dns1: '8.8.8.8', dns2: '8.8.4.4'
            },
            stateOverrides: { _wrongGateway: true },
            flagLocation: 'Route print output after fix'
        },
        {
            id: 'dns_down',
            name: 'DNS Server Down',
            ticketSubject: 'Can ping IP addresses but websites won\'t load',
            ticketDetail: 'Something weird is happening. I can ping 8.8.8.8 and it works, but when I try to go to google.com in my browser it says "server not found." I can\'t reach any website by name but pinging by IP seems to work fine. This started about an hour ago.',
            ticketExtra: 'IT Note: The internal DNS server (10.0.0.53) experienced a crash this morning. All workstations using it as primary DNS are affected. Secondary DNS was never configured on this machine.',
            fixDescription: 'Change DNS servers to working public DNS (8.8.8.8 or 1.1.1.1)',
            brokenConfig: {
                adapter: 'enabled', dhcp: false,
                ip: '192.168.1.42', subnet: '255.255.255.0', gateway: '192.168.1.254',
                dns1: '10.0.0.53', dns2: ''
            },
            stateOverrides: { _dnsDown: true },
            flagLocation: 'nslookup output after DNS fix'
        },
        {
            id: 'dhcp_expired',
            name: 'DHCP Lease Expired',
            ticketSubject: 'Computer has a 169.254 address and nothing works',
            ticketDetail: 'My laptop shows some strange IP address starting with 169.254 and I can\'t connect to anything. I was on vacation for two weeks and everything was fine before I left. I came back this morning, opened my laptop, and it just won\'t connect.',
            ticketExtra: 'IT Note: DHCP server lease time is 7 days. The server is operational. Other machines on the network are obtaining leases successfully.',
            fixDescription: 'Release and renew the DHCP lease with ipconfig /release then ipconfig /renew',
            brokenConfig: {
                adapter: 'enabled', dhcp: true,
                ip: '169.254.83.201', subnet: '255.255.0.0', gateway: '',
                dns1: '', dns2: ''
            },
            stateOverrides: { _leaseExpired: true },
            flagLocation: 'ipconfig output after successful renewal'
        },
        {
            id: 'proxy_misconfig',
            name: 'Proxy Misconfigured',
            ticketSubject: 'Browser says proxy connection refused, nothing loads',
            ticketDetail: 'Every time I open my browser I get an error about a proxy server refusing connections. I can\'t load any webpage at all. A coworker told me to try pinging Google and that works perfectly, so my network seems fine. This started after IT pushed some "browser configuration" update this morning.',
            ticketExtra: 'IT Note: A GPO was pushed to configure proxy settings for the branch office. This workstation may have received the wrong proxy address. The correct proxy for this building is DIRECT (no proxy).',
            fixDescription: 'Remove the proxy configuration via netsh or Proxy Settings',
            brokenConfig: {
                adapter: 'enabled', dhcp: false,
                ip: '192.168.1.42', subnet: '255.255.255.0', gateway: '192.168.1.254',
                dns1: '8.8.8.8', dns2: '8.8.4.4'
            },
            stateOverrides: { _proxyMisconfigured: true },
            flagLocation: 'Proxy Settings after removing the misconfiguration'
        },
        {
            id: 'cable_unplugged',
            name: 'Cable Unplugged',
            ticketSubject: 'Network completely dead — red X on network icon',
            ticketDetail: 'My network is completely dead. There is a red X on my network icon. Nothing works — no internet, no email, no shared drives. I haven\'t changed anything. The cleaning crew was in here last night and they moved my desk around to clean behind it.',
            ticketExtra: 'IT Note: Cleaning crew confirmed they moved furniture in this area last night. The physical network infrastructure was not intentionally modified.',
            fixDescription: 'Reconnect the Ethernet cable (simulate via Device Manager or netsh)',
            brokenConfig: {
                adapter: 'disconnected', dhcp: true,
                ip: '0.0.0.0', subnet: '0.0.0.0', gateway: '',
                dns1: '', dns2: ''
            },
            stateOverrides: { _cableUnplugged: true },
            flagLocation: 'Device Manager cable status after reconnection'
        }
    ],

    _correctNetwork: {
        adapter: 'enabled', dhcp: true,
        ip: '192.168.1.42', subnet: '255.255.255.0', gateway: '192.168.1.254',
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

    _macAddress: '00-1A-2B-3C-4D-60',
    _adapterName: 'Ethernet0',

    // Per-scenario hints
    _defaultHints: [
        { id: 'hint1', text: 'Start by running ipconfig /all to see the full network configuration. Look for anything unusual.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Follow the troubleshooting stack: (1) Physical layer, (2) IP configuration, (3) Gateway reachability, (4) Internet, (5) DNS. The first failure tells you the layer.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Some problems are not in ipconfig. Check proxy settings, physical connections, and service status too.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'After fixing the issue, verify with ping google.com. The flag will be revealed through the tool you used to fix the problem.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        wrong_gateway: [
            { id: 'hint1', text: 'Run ipconfig /all. The IP, subnet, and DNS look fine. But look carefully at the default gateway — is that the right one for this building?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Ping 192.168.1.100 (the configured gateway). Does it respond? Now try pinging 192.168.1.254. That\'s the actual gateway for Building B.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Use Network Settings or netsh to change the gateway:\n  netsh interface ip set address "Ethernet0" static 192.168.1.42 255.255.255.0 192.168.1.254', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After fixing the gateway, run route print — the flag is in the routing table output.', cost: 50, penalty: -50 }
        ],
        dns_down: [
            { id: 'hint1', text: 'Run ipconfig /all. Note the DNS server configured. Try pinging it — does it respond?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Ping 8.8.8.8 — it works! Ping google.com — it fails! IP connectivity is fine but name resolution is broken. The DNS server at 10.0.0.53 is unreachable.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Change the DNS server to a working one:\n  netsh interface ip set dns "Ethernet0" static 8.8.8.8\nOr use Network Settings to set DNS to 8.8.8.8.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After changing DNS, run nslookup google.com — the flag appears in the resolution output.', cost: 50, penalty: -50 }
        ],
        dhcp_expired: [
            { id: 'hint1', text: 'Run ipconfig /all. The IP is 169.254.x.x — that\'s APIPA (Automatic Private IP Addressing). DHCP is enabled but the lease wasn\'t obtained.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The laptop was off for 2 weeks and the DHCP lease (7 days) expired. The DHCP server is working — other machines have leases. You just need to request a new one.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Run: ipconfig /release then ipconfig /renew to get a fresh DHCP lease.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After renewal, run ipconfig /all — the flag is displayed in the new lease information.', cost: 50, penalty: -50 }
        ],
        proxy_misconfig: [
            { id: 'hint1', text: 'Run ipconfig /all. The IP config looks perfectly fine. Ping 8.8.8.8 — works. Ping google.com — works! But the browser still can\'t load pages. The problem is above Layer 3.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The browser says "proxy connection refused." The network stack is fine — the browser is being told to use a proxy that doesn\'t exist.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Proxy Settings from the desktop, or run:\n  netsh winhttp show proxy\nThen clear it:\n  netsh winhttp reset proxy', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After removing the proxy, check the Proxy Settings app — the flag appears in the confirmation output.', cost: 50, penalty: -50 }
        ],
        cable_unplugged: [
            { id: 'hint1', text: 'Run ipconfig /all. The adapter shows "Media disconnected." This is a physical layer problem — no link signal detected.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The cleaning crew moved the desk. The Ethernet cable was likely pulled loose. This is Layer 1.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Device Manager and reconnect the cable (simulate by enabling the connection), or run:\n  netsh interface set interface "Ethernet0" enable', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After reconnecting, check Device Manager — the flag is in the adapter diagnostic info.', cost: 50, penalty: -50 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !NT002Config._flagRestored) {
            NT002Config._flagRestored = true;
            const scenario = NT002Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                NT002Config.hints = NT002Config._scenarioHints[scenario.id] || NT002Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._networkConfig = JSON.parse(JSON.stringify(NT002Config._scenarios[idx].brokenConfig));
        engine.state._scenarioSelected = true;

        const overrides = NT002Config._scenarios[idx].stateOverrides || {};
        for (const key in overrides) {
            engine.state[key] = overrides[key];
        }

        const scenario = NT002Config._scenarios[idx];
        NT002Config._flagRestored = true;
        NT002Config.hints = NT002Config._scenarioHints[scenario.id] || NT002Config._defaultHints;

        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return NT002Config._scenarios[engine.state._scenarioId];
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
        if (net.adapter === 'disabled' || net.adapter === 'disconnected') return false;
        if (!net.ip || net.ip === '0.0.0.0' || net.ip.startsWith('169.254')) return false;
        if (!net.gateway) return false;
        return NT002Config._sameSubnet(net.ip, net.gateway, net.subnet);
    },

    _canReachInternet(net, engine) {
        if (!NT002Config._canReachGateway(net)) return false;
        // Wrong gateway: the configured gateway doesn't actually route
        if (engine && engine.state._wrongGateway && net.gateway === '192.168.1.100') return false;
        if (net.gateway !== '192.168.1.254' && net.gateway !== '192.168.1.1') return false;
        return true;
    },

    _canResolveDNS(net, engine) {
        if (engine && engine.state._dnsDown && net.dns1 === '10.0.0.53' && !net.dns2) return false;
        if (engine && engine.state._dnsDown && net.dns1 === '10.0.0.53' && net.dns2 === '') return false;
        return NT002Config._validDNS.includes(net.dns1) || NT002Config._validDNS.includes(net.dns2);
    },

    _checkConnectivity(target, engine) {
        const net = engine.state._networkConfig;
        if (!net) return { success: false, error: 'General failure.' };

        if (net.adapter === 'disabled' || net.adapter === 'disconnected') {
            return { success: false, error: 'General failure.' };
        }

        // Loopback
        if (target === '127.0.0.1' || target === 'localhost') {
            return { success: true, ms: 0, ip: '127.0.0.1' };
        }

        // No valid IP
        if (!net.ip || net.ip === '0.0.0.0' || net.ip.startsWith('169.254')) {
            if (NT002Config._isIP(target)) {
                return { success: false, error: 'PING: transmit failed. General failure.' };
            }
            return { success: false, error: 'Ping request could not find host ' + target + '. Please check the name and try again.', dnsError: true };
        }

        // Own IP
        if (target === net.ip) {
            return { success: true, ms: 0, ip: net.ip };
        }

        // IP target
        if (NT002Config._isIP(target)) {
            if (NT002Config._sameSubnet(net.ip, target, net.subnet)) {
                // Wrong gateway scenario: can reach local subnet but the fake gateway doesn't respond
                if (engine.state._wrongGateway && target === '192.168.1.100') {
                    return { success: false, error: 'Request timed out.' };
                }
                return { success: true, ms: 1, ip: target };
            }
            if (!NT002Config._canReachGateway(net)) {
                return { success: false, error: 'Destination host unreachable.' };
            }
            if (!NT002Config._canReachInternet(net, engine)) {
                return { success: false, error: 'Request timed out.' };
            }
            return { success: true, ms: Math.floor(Math.random() * 20) + 10, ip: target };
        }

        // Domain
        if (!NT002Config._canReachInternet(net, engine)) {
            return { success: false, error: 'Ping request could not find host ' + target + '. Please check the name and try again.', dnsError: true };
        }
        if (!NT002Config._canResolveDNS(net, engine)) {
            return { success: false, error: 'Ping request could not find host ' + target + '. Please check the name and try again.', dnsError: true };
        }

        const resolved = NT002Config._knownDomains[target.toLowerCase()] || '93.184.216.34';
        return { success: true, ms: Math.floor(Math.random() * 30) + 15, ip: resolved };
    },

    async _checkLabComplete(target, result, engine) {
        if (!result.success) return null;
        if (NT002Config._isIP(target)) return null;
        if (engine.state._labComplete) return null;

        // Proxy scenario: pings work but browser doesn't — lab not complete from ping alone
        if (engine.state._proxyMisconfigured) return null;

        engine.state._labComplete = true;
        engine.state._flagRevealed = true;
        engine.save();

        const scenario = NT002Config._getScenario(engine);

        if (scenario && scenario.id === 'dhcp_expired') {
            const flagText = await engine.requestFlagText(scenario.id);
            setTimeout(() => {
                engine.notify('Network restored! The flag is in the ipconfig output.', 'success');
            }, 600);
            return flagText;
        }

        const locationHints = {
            wrong_gateway: 'Run route print to see the corrected routing table.',
            dns_down: 'Run nslookup google.com to see the DNS resolution output.',
            cable_unplugged: 'Check Device Manager for adapter diagnostic data.',
            proxy_misconfig: 'Check the Proxy Settings for the confirmation.'
        };
        const hint = scenario ? (locationHints[scenario.id] || '') : '';

        setTimeout(() => {
            engine.notify('Network restored! The flag has been logged to the system. ' + hint, 'success');
        }, 600);

        return null;
    },

    // ==========================================================
    // BOOT SEQUENCE
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
            { id: 'proxy',    label: 'Proxy\nSettings',     icon: 'PRX', app: 'proxy_settings' },
            { id: 'services', label: 'Services',             icon: 'SVC', app: 'services' },
            { id: 'ticket',   label: 'Help Desk\nTicket',    icon: 'HD',  app: 'ticket' },
            { id: 'notes',    label: 'Notepad',              icon: 'TXT', app: 'notes' },
            { id: 'hints',    label: 'Hints',                icon: '?',   app: 'hints' },
            { id: 'reset',    label: 'Reset\nLab',           icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG
    // ==========================================================

    terminal: {
        user: 'Technician',
        hostname: 'PC-BLDG-B-042',
        startDir: 'C:\\Users\\Technician',
        promptStyle: 'windows',
        welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n'
    },

    // ==========================================================
    // FILESYSTEM
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
        { id: 'hint2', text: 'Follow the troubleshooting order: physical, IP, gateway, internet, DNS.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Not every problem is visible in ipconfig. Check proxy, cables, and services.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag is hidden in the tool you used to fix the problem.', cost: 50, penalty: -50 }
    ],

    // ==========================================================
    // LORE
    // ==========================================================

    lore: {
        intro: 'A user has submitted a help desk ticket reporting they cannot access the internet. As the network technician, your job is to identify the root cause and restore full internet connectivity.',
        scenario: 'The workstation has been misconfigured to simulate a real "no internet" problem. You must use systematic troubleshooting to identify the broken layer and apply the correct fix.',
        outro: 'Internet connectivity has been restored. The user can now access websites and online resources. Your methodical layer-by-layer approach identified the issue efficiently.'
    },

    // ==========================================================
    // PHASES
    // ==========================================================

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the help desk ticket and examine the current network configuration.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Test connectivity at each layer to pinpoint the problem.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the fix using the appropriate tool or command.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm full connectivity and locate the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // CUSTOM COMMANDS
    // ==========================================================

    commands: {

        ipconfig: async function(args, term, engine) {
            const gate = NT002Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            const name = NT002Config._adapterName;
            const mac = NT002Config._macAddress;
            const joined = args.join(' ').toLowerCase();

            if (joined.includes('/all')) {
                if (net.adapter === 'disabled' || net.adapter === 'disconnected') {
                    return '\nWindows IP Configuration\n\n   Host Name . . . . . . . . . . . . : PC-BLDG-B-042\n   Primary Dns Suffix  . . . . . . . : \n   Node Type . . . . . . . . . . . . : Hybrid\n   IP Routing Enabled. . . . . . . . : No\n   WINS Proxy Enabled. . . . . . . . : No\n\nEthernet adapter ' + name + ':\n\n   Media State . . . . . . . . . . . : Media disconnected\n   Connection-specific DNS Suffix  . : \n   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-V\n   Physical Address. . . . . . . . . : ' + mac;
                }
                let output = '\nWindows IP Configuration\n\n   Host Name . . . . . . . . . . . . : PC-BLDG-B-042\n   Primary Dns Suffix  . . . . . . . : \n   Node Type . . . . . . . . . . . . : Hybrid\n   IP Routing Enabled. . . . . . . . : No\n   WINS Proxy Enabled. . . . . . . . : No\n\nEthernet adapter ' + name + ':\n\n   Connection-specific DNS Suffix  . : \n   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-V\n   Physical Address. . . . . . . . . : ' + mac + '\n   DHCP Enabled. . . . . . . . . . . : ' + (net.dhcp ? 'Yes' : 'No') + '\n   Autoconfiguration Enabled . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + (net.gateway || '') + '\n   DNS Servers . . . . . . . . . . . : ' + (net.dns1 || '') + '\n                                        ' + (net.dns2 || '') + '\n   NetBIOS over Tcpip. . . . . . . . : Enabled';

                // Show flag in ipconfig after DHCP renewal for dhcp_expired scenario
                if (engine.state._flagRevealed && NT002Config._getScenario(engine)?.id === 'dhcp_expired') {
                    const flagVal = await engine.requestFlagText('dhcp_expired');
                    output += '\n\n   DHCP Lease Obtained. . . . . . . : ' + new Date().toLocaleDateString() + '\n   DHCP Lease Recovery Token . . . . : ' + flagVal;
                }

                return output;
            }

            if (joined.includes('/release')) {
                if (net.adapter === 'disabled' || net.adapter === 'disconnected') {
                    return '\nAn error occurred while releasing interface ' + name + ' : \nThe system cannot find the file specified.';
                }
                net.ip = '0.0.0.0'; net.subnet = '0.0.0.0'; net.gateway = '';
                engine.save();
                return '\nWindows IP Configuration\n\nEthernet adapter ' + name + ':\n\n   Connection-specific DNS Suffix  . : \n   IPv4 Address. . . . . . . . . . . : 0.0.0.0\n   Subnet Mask . . . . . . . . . . . : 0.0.0.0\n   Default Gateway . . . . . . . . . :';
            }

            if (joined.includes('/renew')) {
                if (net.adapter === 'disabled' || net.adapter === 'disconnected') {
                    return '\nAn error occurred while renewing interface ' + name + ' :\nThe system cannot find the file specified.';
                }
                if (!net.dhcp) {
                    return '\nAdapter ' + name + ' is not configured for DHCP.';
                }
                // Successful DHCP renewal
                engine.state._leaseExpired = false;
                net.ip = '192.168.1.42'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.254';
                net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4';
                engine.save();
                return '\nWindows IP Configuration\n\nEthernet adapter ' + name + ':\n\n   Connection-specific DNS Suffix  . : \n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + net.gateway;
            }

            if (joined.includes('/flushdns')) {
                return '\nWindows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.';
            }

            if (joined.includes('/displaydns')) {
                return '\nWindows IP Configuration\n\n    Record Name . . . . . : localhost\n    Record Type . . . . . : 1\n    Time To Live  . . . . : 0\n    Data Length . . . . . : 4\n    Section . . . . . . . : Answer\n    A (Host) Record . . . : 127.0.0.1';
            }

            if (joined.includes('/?') || joined.includes('/help')) {
                return '\nUSAGE:\n    ipconfig [/all | /release | /renew | /flushdns | /displaydns]\n\nOptions:\n    /all         Display full configuration information.\n    /release     Release the IPv4 address for the specified adapter.\n    /renew       Renew the IPv4 address for the specified adapter.\n    /flushdns    Purges the DNS Resolver cache.\n    /displaydns  Display the contents of the DNS Resolver Cache.';
            }

            // Default
            if (net.adapter === 'disabled' || net.adapter === 'disconnected') {
                return '\nWindows IP Configuration\n\nEthernet adapter ' + name + ':\n\n   Media State . . . . . . . . . . . : Media disconnected\n   Connection-specific DNS Suffix  . :';
            }
            return '\nWindows IP Configuration\n\nEthernet adapter ' + name + ':\n\n   Connection-specific DNS Suffix  . : \n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + (net.gateway || '');
        },

        ping: async function(args, term, engine) {
            const gate = NT002Config._requireScenario(engine);
            if (gate) return gate;

            if (!args.length || args[0] === '/?') {
                return '\nUsage: ping [-t] [-n count] [-l size] target_name\n\nOptions:\n    -t             Ping until stopped (Ctrl+C).\n    -n count       Number of echo requests to send.\n    target_name    IP address or hostname to ping.';
            }

            let target = null;
            for (const a of args) {
                if (!a.startsWith('-') && !a.startsWith('/')) { target = a; break; }
            }
            if (!target) return 'Bad parameter.\nUsage: ping target_name';

            const result = NT002Config._checkConnectivity(target, engine);

            if (result.dnsError) {
                return '\n' + result.error;
            }

            const displayIP = result.ip || target;
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

            if (result.success && !NT002Config._isIP(target)) {
                const flagValue = await NT002Config._checkLabComplete(target, result, engine);
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

        tracert: function(args, term, engine) {
            const gate = NT002Config._requireScenario(engine);
            if (gate) return gate;
            const target = args[0];
            if (!target || target === '/?') {
                return '\nUsage: tracert [-d] target_name\n\nTraces the route to a network host.';
            }
            const net = engine.state._networkConfig;

            if (net.adapter === 'disabled' || net.adapter === 'disconnected') return '\nUnable to resolve target system name ' + target + '.';
            if (!net.ip || net.ip === '0.0.0.0' || net.ip.startsWith('169.254')) return '\nUnable to resolve target system name ' + target + '.';

            if (!NT002Config._isIP(target)) {
                if (!NT002Config._canReachInternet(net, engine) || !NT002Config._canResolveDNS(net, engine)) {
                    return '\nUnable to resolve target system name ' + target + '.';
                }
            }

            const destIP = NT002Config._isIP(target) ? target : (NT002Config._knownDomains[target.toLowerCase()] || '93.184.216.34');
            let output = '\nTracing route to ' + target + ' [' + destIP + ']\nover a maximum of 30 hops:\n\n';

            if (!NT002Config._canReachGateway(net)) {
                output += '  1     *        *        *     Request timed out.\n  2     *        *        *     Request timed out.\n  3     *        *        *     Request timed out.\n\nTrace complete.';
                return output;
            }

            if (!NT002Config._canReachInternet(net, engine)) {
                output += '  1    <1 ms    <1 ms    <1 ms  ' + net.gateway + '\n  2     *        *        *     Request timed out.\n  3     *        *        *     Request timed out.\n  4     *        *        *     Request timed out.\n\nTrace complete.';
                return output;
            }

            output += '  1    <1 ms    <1 ms    <1 ms  192.168.1.254\n  2    10 ms    12 ms    11 ms  10.0.0.1\n  3    15 ms    14 ms    16 ms  72.14.215.85\n  4    18 ms    17 ms    19 ms  ' + destIP + '\n\nTrace complete.';
            return output;
        },

        nslookup: async function(args, term, engine) {
            const gate = NT002Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length || args[0] === '/?') {
                return '\nUsage: nslookup hostname [dns-server]\n\nQueries DNS servers for information about a host.';
            }
            const net = engine.state._networkConfig;
            const target = args[0];
            const server = args[1] || net.dns1;

            if (net.adapter === 'disabled' || net.adapter === 'disconnected') {
                return '\nDNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  0.0.0.0\n\n*** Request to UnKnown timed-out';
            }

            if (!NT002Config._canReachInternet(net, engine)) {
                return '\nDNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  ' + (server || '0.0.0.0') + '\n\n*** UnKnown can\'t find ' + target + ': No response from server';
            }

            // DNS server down: internal DNS unreachable
            if (engine.state._dnsDown && (server === '10.0.0.53' || (!args[1] && net.dns1 === '10.0.0.53'))) {
                return '\nDNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  10.0.0.53\n\n*** Request to UnKnown timed-out\n\n  [The DNS server at 10.0.0.53 is not responding]';
            }

            if (!NT002Config._canResolveDNS(net, engine) && !args[1]) {
                return '\nDNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  ' + (server || '0.0.0.0') + '\n\n*** UnKnown can\'t find ' + target + ': No response from server';
            }

            const resolved = NT002Config._knownDomains[target.toLowerCase()] || '93.184.216.34';
            const serverName = server === '8.8.8.8' ? 'dns.google' : server === '1.1.1.1' ? 'one.one.one.one' : server;

            let output = '\nServer:  ' + serverName + '\nAddress:  ' + server + '\n\nNon-authoritative answer:\nName:    ' + target + '\nAddress:  ' + resolved;

            // Show flag in nslookup after DNS fix
            if (engine.state._flagRevealed && NT002Config._getScenario(engine)?.id === 'dns_down' && NT002Config._validDNS.includes(server)) {
                const flagVal = await engine.requestFlagText('dns_down');
                output += '\n\n  DNS Resolution Restored — Recovery token: ' + flagVal;
            }

            return output;
        },

        netstat: function(args, term, engine) {
            const gate = NT002Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;

            if (args.includes('/?')) {
                return '\nUsage: netstat [-a] [-n] [-o] [-b]\n\nDisplays protocol statistics and current TCP/IP network connections.';
            }

            if (net.adapter === 'disabled' || net.adapter === 'disconnected' || !net.ip || net.ip === '0.0.0.0' || net.ip.startsWith('169.254')) {
                return '\nActive Connections\n\n  Proto  Local Address          Foreign Address        State\n  TCP    127.0.0.1:49155        127.0.0.1:49156        ESTABLISHED';
            }

            let output = '\nActive Connections\n\n  Proto  Local Address          Foreign Address        State\n';
            output += '  TCP    ' + net.ip + ':49152     52.113.194.132:443     ESTABLISHED\n';
            output += '  TCP    ' + net.ip + ':49153     13.107.42.14:443       ESTABLISHED\n';
            output += '  TCP    127.0.0.1:49155        127.0.0.1:49156        ESTABLISHED';
            return output;
        },

        netsh: function(args, term, engine) {
            const gate = NT002Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            const line = args.join(' ');
            const lower = line.toLowerCase();

            if (!args.length || args[0] === '/?') {
                return '\nUsage: netsh interface ip set address <adapter> static <IP> <Subnet> <Gateway>\n       netsh interface ip set address <adapter> dhcp\n       netsh interface ip set dns <adapter> static <DNS>\n       netsh interface ip set dns <adapter> dhcp\n       netsh interface set interface <adapter> enable|disable\n       netsh interface ip show config\n       netsh winhttp show proxy\n       netsh winhttp reset proxy';
            }

            // Proxy commands
            if (/winhttp\s+show\s+proxy/i.test(lower)) {
                if (engine.state._proxyMisconfigured) {
                    return '\nCurrent WinHTTP proxy settings:\n\n    Proxy Server(s) :  http://proxy-branch3.corp.local:8080\n    Bypass List     :  (none)\n\n    [WARNING: Proxy server is not responding]';
                }
                return '\nCurrent WinHTTP proxy settings:\n\n    Direct access (no proxy server).';
            }

            if (/winhttp\s+reset\s+proxy/i.test(lower)) {
                if (engine.state._proxyMisconfigured) {
                    engine.state._proxyMisconfigured = false;
                    engine.save();
                    engine.notify('Proxy settings cleared. Browser should now connect directly.', 'success');

                    // Mark lab complete for proxy scenario
                    if (!engine.state._labComplete) {
                        engine.state._labComplete = true;
                        engine.state._flagRevealed = true;
                        engine.save();
                    }
                    return '\nCurrent WinHTTP proxy settings:\n\n    Direct access (no proxy server).\n\n    [Proxy configuration has been reset to direct access]';
                }
                return '\nCurrent WinHTTP proxy settings:\n\n    Direct access (no proxy server).';
            }

            if (/interface\s+ip\s+show\s+config/i.test(lower)) {
                if (net.adapter === 'disabled' || net.adapter === 'disconnected') {
                    return '\nConfiguration for interface "' + NT002Config._adapterName + '"\n    Administrative state:            ' + (net.adapter === 'disconnected' ? 'Enabled (no link)' : 'Disabled');
                }
                return '\nConfiguration for interface "' + NT002Config._adapterName + '"\n    DHCP enabled:                    ' + (net.dhcp ? 'Yes' : 'No') + '\n    IP Address:                      ' + net.ip + '\n    Subnet Prefix:                   ' + net.subnet + '\n    Default Gateway:                 ' + (net.gateway || 'None') + '\n    DNS Servers:                     ' + (net.dns1 || 'None') + '\n                                     ' + (net.dns2 || '');
            }

            if (/interface\s+set\s+interface/i.test(lower)) {
                if (/enable/i.test(lower)) {
                    if (net.adapter === 'disconnected') {
                        // Simulate cable reconnection
                        net.adapter = 'enabled';
                        engine.state._cableUnplugged = false;
                        net.dhcp = true;
                        net.ip = '192.168.1.42'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.254';
                        net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4';
                        engine.save();
                        return '\nThis network connection has been enabled.\nLink detected — obtaining DHCP lease...';
                    }
                    if (net.adapter === 'enabled') return '\nThis network connection is already enabled.';
                    net.adapter = 'enabled';
                    net.dhcp = true;
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
                    // Fix wrong gateway scenario
                    if (engine.state._wrongGateway && match[3] === '192.168.1.254') {
                        engine.state._wrongGateway = false;
                    }
                    engine.save();
                    return '\nOk.\n';
                }
                return '\nThe syntax of the command is:\n  netsh interface ip set address "' + NT002Config._adapterName + '" static <IP> <SubnetMask> <Gateway>';
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
                    // Fix DNS down scenario
                    if (engine.state._dnsDown && NT002Config._validDNS.includes(match[1])) {
                        engine.state._dnsDown = false;
                    }
                    engine.save();
                    return '\nOk.\n';
                }
                return '\nThe syntax of the command is:\n  netsh interface ip set dns "' + NT002Config._adapterName + '" static <DNS>';
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

        arp: function(args, term, engine) {
            const gate = NT002Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;

            if (net.adapter === 'disabled' || net.adapter === 'disconnected' || !net.ip || net.ip === '0.0.0.0' || net.ip.startsWith('169.254')) {
                return '\nNo ARP Entries Found.';
            }

            let output = '\nInterface: ' + net.ip + ' --- 0x3\n  Internet Address      Physical Address      Type\n';
            if (net.gateway && NT002Config._sameSubnet(net.ip, net.gateway, net.subnet)) {
                // Wrong gateway: show the configured gateway but it doesn't respond
                if (engine.state._wrongGateway && net.gateway === '192.168.1.100') {
                    output += '  192.168.1.100         <incomplete>              dynamic\n';
                } else {
                    output += '  ' + net.gateway + '       00-1a-2b-3c-4d-01     dynamic\n';
                }
                output += '  192.168.1.200         00-1a-2b-3c-4d-02     dynamic\n';
            }
            output += '  192.168.1.255         ff-ff-ff-ff-ff-ff     static\n';
            output += '  224.0.0.22            01-00-5e-00-00-16     static\n';
            output += '  255.255.255.255       ff-ff-ff-ff-ff-ff     static';
            return output;
        },

        route: async function(args, term, engine) {
            const gate = NT002Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            if (args[0] === 'print' || !args.length) {
                if (net.adapter === 'disabled' || net.adapter === 'disconnected' || !net.ip || net.ip === '0.0.0.0') {
                    return '\nIPv4 Route Table\n===========================================================================\nActive Routes:\n  Network Destination        Netmask          Gateway       Interface  Metric\n          127.0.0.0        255.0.0.0         On-link         127.0.0.1    331\n===========================================================================';
                }
                let output = '\nIPv4 Route Table\n===========================================================================\nActive Routes:\n  Network Destination        Netmask          Gateway       Interface  Metric\n          0.0.0.0          0.0.0.0      ' + (net.gateway || 'None') + '    ' + net.ip + '     25\n        127.0.0.0        255.0.0.0         On-link         127.0.0.1    331\n      192.168.1.0    255.255.255.0         On-link       ' + net.ip + '    281\n===========================================================================';

                // Show flag in route print after gateway fix
                if (engine.state._flagRevealed && NT002Config._getScenario(engine)?.id === 'wrong_gateway' && net.gateway === '192.168.1.254') {
                    const flagVal = await engine.requestFlagText('wrong_gateway');
                    output += '\n\n  Routing table updated — Recovery token: ' + flagVal;
                }

                return output;
            }
            return '\nUsage: route print';
        },

        systeminfo: function(args, term, engine) {
            const gate = NT002Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            return '\nHost Name:                 PC-BLDG-B-042\nOS Name:                   Microsoft Windows 10 Pro\nOS Version:                10.0.19045 N/A Build 19045\nOS Manufacturer:           Microsoft Corporation\nOS Configuration:          Member Workstation\nSystem Type:               x64-based PC\nProcessor(s):              1 Processor(s) Installed.\n                           [01]: Intel(R) Core(TM) i7-11700 @ 2.50GHz\nTotal Physical Memory:     16,384 MB\nAvailable Physical Memory: 8,742 MB\nNetwork Card(s):           1 NIC(s) Installed.\n                           [01]: Intel(R) Ethernet Connection I219-V\n                                 Connection Name: ' + NT002Config._adapterName + '\n                                 Status:          ' + (net.adapter === 'enabled' ? 'Connected' : 'Disconnected') + '\n                                 DHCP Enabled:    ' + (net.dhcp ? 'Yes' : 'No') + (net.adapter === 'enabled' && net.ip ? '\n                                 IP address(es)\n                                 [01]: ' + net.ip : '');
        },

        hostname: function() { return 'PC-BLDG-B-042'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        dir: function() {
            return ' Volume in drive C has no label.\n Volume Serial Number is 8A4B-1C3D\n\n Directory of C:\\Users\\Technician\n\n03/29/2026  08:30 AM    <DIR>          .\n03/29/2026  08:30 AM    <DIR>          ..\n03/29/2026  08:30 AM    <DIR>          Desktop\n03/29/2026  08:30 AM    <DIR>          Documents\n03/29/2026  08:30 AM    <DIR>          Downloads\n               0 File(s)              0 bytes\n               5 Dir(s)  214,748,364,800 bytes free';
        },
        getmac: function() {
            return '\nPhysical Address    Transport Name\n=================== ==========================================================\n' + NT002Config._macAddress + '   \\Device\\Tcpip_{4A2B3C4D-5E6F-7A8B-9C0D-1E2F3A4B5C6D}';
        },
        pathping: function(args, term, engine) {
            if (!args[0]) return '\nUsage: pathping target_name';
            return NT002Config.commands.tracert(args, term, engine);
        },
        whoami: function() { return 'PC-BLDG-B-042\\Technician'; },

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
        const requireTicket = ['network_settings', 'device_manager', 'proxy_settings', 'services'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }

        switch (iconDef.app) {
            case 'ticket':           NT002Config._openTicket(iconDef, engine); break;
            case 'network_settings': NT002Config._openNetworkSettings(iconDef, engine); break;
            case 'device_manager':   NT002Config._openDeviceManager(iconDef, engine); break;
            case 'proxy_settings':   NT002Config._openProxySettings(iconDef, engine); break;
            case 'services':         NT002Config._openServices(iconDef, engine); break;
            case 'reset_lab':        NT002Config._confirmReset(engine); break;
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
        NT002Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            NT002Config._renderTicket(engine, container);
        } else {
            NT002Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker(engine, container) {
        const ticketPreviews = [
            'Tom Bradley — "Can\'t access any website since office move"',
            'Rachel Kim — "Can ping IPs but websites won\'t load"',
            'Jason Park — "Laptop has weird 169.254 address"',
            'Mia Chen — "Browser says proxy connection refused"',
            'Derek Jones — "Network completely dead after cleaning crew"'
        ];

        let html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#06b6d4; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">HELP DESK QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select a ticket to begin your assignment, or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        NT002Config._scenarios.forEach(function(s, i) {
            html += '<button class="nt002-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#06b6d4; font-weight:bold;">HD-' + (8100 + i) + '</span>'
                + '<span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">HIGH</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + ticketPreviews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';

        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="nt002RandomBtn" style="padding:10px 28px; background:#06b6d4; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.nt002-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#06b6d4'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                NT002Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                NT002Config._renderTicket(engine, container);
            });
        });

        document.getElementById('nt002RandomBtn').addEventListener('click', function() {
            NT002Config._applyScenario(engine, Math.floor(Math.random() * NT002Config._scenarios.length));
            NT002Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        const scenario = NT002Config._getScenario(engine);
        const submitters = ['Tom Bradley — IT Department', 'Rachel Kim — Sales', 'Jason Park — Marketing', 'Mia Chen — Accounting', 'Derek Jones — Operations'];
        const submitter = submitters[engine.state._scenarioId] || 'Employee';

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#06b6d4; font-weight:bold; font-size:1rem;">HELP DESK TICKET #HD-' + (8100 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: HIGH</span>'
            + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBMITTED BY</div>'
            + '<div>' + submitter + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DATE</div>'
            + '<div>March 29, 2026 — 9:15 AM</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + NT002Config._escHtml(scenario.ticketSubject) + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + NT002Config._escHtml(scenario.ticketDetail)
            + '<br><br>Please fix ASAP — I have a deadline today!</div></div>'

            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div>'
            + '<div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#ffcc80;">'
            + NT002Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')

            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div>'
            + '<div style="color:#2ecc71; font-weight:bold;">YOU — Network Technician</div></div>';
    },

    // ==========================================================
    // NETWORK SETTINGS
    // ==========================================================

    _openNetworkSettings(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT002Config._refreshNetworkSettings(engine, iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'netSettingsContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Network Settings', 'NET', container);
        NT002Config._renderNetworkSettings(engine, container);
    },

    _refreshNetworkSettings(engine, appId) {
        const container = document.getElementById('netSettingsContainer');
        if (container) NT002Config._renderNetworkSettings(engine, container);
    },

    _renderNetworkSettings(engine, container) {
        const net = engine.state._networkConfig;
        const name = NT002Config._adapterName;
        const isDisabled = net.adapter === 'disabled' || net.adapter === 'disconnected';
        const isDhcp = net.dhcp;

        if (isDisabled) {
            container.innerHTML = '<div style="text-align:center; padding:40px 20px;">'
                + '<div style="font-size:2rem; margin-bottom:16px; opacity:0.3;">NET</div>'
                + '<div style="font-size:1rem; font-weight:bold; color:#e74c3c; margin-bottom:12px;">No Network Adapters Detected</div>'
                + '<div style="color:#888; font-size:0.8rem; line-height:1.6;">Windows cannot find any active network adapters.<br><br>'
                + (net.adapter === 'disconnected' ? 'The network cable may be unplugged. Check the physical connection.<br>' : 'The network adapter may be disabled. ')
                + 'Open <strong style="color:#06b6d4;">Device Manager</strong> to check adapter status.</div></div>';
            return;
        }

        container.innerHTML = '<div style="margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">'
            + '<div style="font-size:1rem; font-weight:bold; color:#06b6d4; margin-bottom:8px;">Network Adapter: ' + name + '</div>'
            + '<div>Status: <strong style="color:#2ecc71;">Enabled</strong></div>'
            + '</div>'

            + '<div style="margin-bottom:16px;">'
            + '<label style="display:flex; align-items:center; gap:8px; cursor:pointer;">'
            + '<input type="checkbox" id="netDhcpToggle" ' + (isDhcp ? 'checked' : '') + '>'
            + '<span>Obtain IP address automatically (DHCP)</span></label></div>'

            + '<div id="netStaticFields" style="' + (isDhcp ? 'opacity:0.4; pointer-events:none;' : '') + '">'
            + NT002Config._settingsField('IP Address', 'netIP', net.ip || '')
            + NT002Config._settingsField('Subnet Mask', 'netSubnet', net.subnet || '')
            + NT002Config._settingsField('Default Gateway', 'netGateway', net.gateway || '')
            + '</div>'

            + '<div style="margin-top:16px; margin-bottom:12px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<label style="display:flex; align-items:center; gap:8px; cursor:pointer;">'
            + '<input type="checkbox" id="netDnsDhcpToggle" ' + (isDhcp ? 'checked' : '') + '>'
            + '<span>Obtain DNS server address automatically</span></label></div>'

            + '<div id="netDnsFields" style="' + (isDhcp ? 'opacity:0.4; pointer-events:none;' : '') + '">'
            + NT002Config._settingsField('Preferred DNS Server', 'netDns1', net.dns1 || '')
            + NT002Config._settingsField('Alternate DNS Server', 'netDns2', net.dns2 || '')
            + '</div>'

            + '<div style="margin-top:20px; display:flex; gap:8px;">'
            + '<button id="netApplyBtn" style="padding:8px 24px; background:#06b6d4; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Apply</button>'
            + '<button id="netRefreshBtn" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer; font-size:0.8rem;">Refresh</button>'
            + '</div>'

            + '<div id="netStatus" style="margin-top:12px; padding:8px; border-radius:4px; display:none; font-size:0.75rem;"></div>';

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
                net.dhcp = true;
                net.ip = '192.168.1.42'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.254';
                const useDnsDhcp = document.getElementById('netDnsDhcpToggle')?.checked;
                if (useDnsDhcp) { net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4'; }
                else { net.dns1 = document.getElementById('netDns1')?.value || net.dns1; net.dns2 = document.getElementById('netDns2')?.value || net.dns2; }
                engine.state._wrongGateway = false;
                engine.state._dnsDown = false;
            } else {
                net.dhcp = false;
                const newGw = document.getElementById('netGateway')?.value || net.gateway;
                net.ip = document.getElementById('netIP')?.value || net.ip;
                net.subnet = document.getElementById('netSubnet')?.value || net.subnet;
                net.gateway = newGw;
                if (engine.state._wrongGateway && newGw === '192.168.1.254') {
                    engine.state._wrongGateway = false;
                }
                const useDnsDhcp = document.getElementById('netDnsDhcpToggle')?.checked;
                if (useDnsDhcp) { net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4'; }
                else {
                    const newDns = document.getElementById('netDns1')?.value || net.dns1;
                    net.dns1 = newDns;
                    net.dns2 = document.getElementById('netDns2')?.value || net.dns2;
                    if (engine.state._dnsDown && NT002Config._validDNS.includes(newDns)) {
                        engine.state._dnsDown = false;
                    }
                }
            }
            engine.save();
            NT002Config._renderNetworkSettings(engine, container);
            NT002Config._showNetStatus('Settings applied successfully.', '#2ecc71');
        });

        document.getElementById('netRefreshBtn').addEventListener('click', function() {
            NT002Config._renderNetworkSettings(engine, container);
        });
    },

    // ==========================================================
    // DEVICE MANAGER
    // ==========================================================

    _openDeviceManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT002Config._renderDeviceManager(engine); return; }
        const container = document.createElement('div');
        container.id = 'devmgrContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Device Manager', 'DEV', container);
        NT002Config._renderDeviceManager(engine);
    },

    async _renderDeviceManager(engine) {
        const container = document.getElementById('devmgrContainer');
        if (!container) return;
        const net = engine.state._networkConfig;
        const isDisconnected = net.adapter === 'disconnected';
        const isDisabled = net.adapter === 'disabled';
        const scenario = NT002Config._getScenario(engine);
        const showFlag = engine.state._flagRevealed && scenario?.id === 'cable_unplugged' && !isDisconnected;
        const flagVal = showFlag ? await engine.requestFlagText('cable_unplugged') : null;

        let statusText, statusColor, statusIcon;
        if (isDisconnected) {
            statusText = 'NO LINK — Cable disconnected'; statusColor = '#f39c12'; statusIcon = '<span style="color:#f39c12;">&#9888;</span>';
        } else if (isDisabled) {
            statusText = 'DISABLED'; statusColor = '#e74c3c'; statusIcon = '<span style="color:#e74c3c;">&#10006;</span>';
        } else {
            statusText = 'Working properly'; statusColor = '#2ecc71'; statusIcon = '<span style="color:#2ecc71;">&#10004;</span>';
        }

        container.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#06b6d4; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Device Manager — PC-BLDG-B-042</div>'
            + '<div style="margin-bottom:8px;">'
            + '<div style="color:#aaa; padding:4px 0;">&#9660; Computer</div>'
            + '<div style="padding-left:20px;">'
            + '<div style="color:#888; padding:4px 0;">&#9654; Display adapters</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; Disk drives</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; Keyboards</div>'
            + '<div style="padding:4px 0;">'
            + '<span style="color:#ccc;">&#9660; Network adapters</span>'
            + '<div style="padding-left:20px; margin-top:4px;">'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid ' + statusColor + '; border-radius:4px; padding:12px; margin-bottom:8px;">'
            + '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">'
            + '<span style="font-size:1.2rem;">' + statusIcon + '</span>'
            + '<span style="font-weight:bold;">Intel(R) Ethernet Connection I219-V</span></div>'
            + '<div style="font-size:0.75rem; color:#888; margin-bottom:8px;">'
            + '<div>Driver: Intel — 12.19.1.37 (2024-06-15)</div>'
            + '<div>Status: <span style="color:' + statusColor + '; font-weight:bold;">' + statusText + '</span></div>'
            + '<div>IRQ: 16 &nbsp; | &nbsp; I/O Range: 0xF000-0xF01F</div></div>'
            + (showFlag
                ? '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:8px; margin-bottom:8px; font-size:0.75rem;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Cable Reconnection Report:</div>'
                + '<div style="color:#c8e6c9;">' + flagVal + '</div></div>'
                : '')
            + '<div style="display:flex; gap:8px;">'
            + (isDisconnected
                ? '<button id="devmgrReconnectBtn" style="padding:6px 20px; background:#f39c12; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Reconnect Cable</button>'
                : '<button disabled style="padding:6px 20px; background:rgba(255,255,255,0.1); color:#888; border:1px solid rgba(255,255,255,0.1); border-radius:3px; font-size:0.75rem; cursor:default;">Connected</button>')
            + '</div></div></div></div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; Sound, video and game controllers</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; USB controllers</div>'
            + '</div></div>';

        if (isDisconnected) {
            const btn = document.getElementById('devmgrReconnectBtn');
            if (btn) {
                btn.addEventListener('click', function() {
                    net.adapter = 'enabled';
                    engine.state._cableUnplugged = false;
                    net.dhcp = true;
                    net.ip = '192.168.1.42'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.254';
                    net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4';
                    engine.save();
                    engine.notify('Cable reconnected. Link established. DHCP lease obtained.', 'success');
                    NT002Config._renderDeviceManager(engine);
                });
            }
        }
    },

    // ==========================================================
    // PROXY SETTINGS
    // ==========================================================

    _openProxySettings(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT002Config._renderProxySettings(engine); return; }
        const container = document.createElement('div');
        container.id = 'proxyContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Proxy Settings', 'PRX', container);
        NT002Config._renderProxySettings(engine);
    },

    async _renderProxySettings(engine) {
        const container = document.getElementById('proxyContainer');
        if (!container) return;
        const isProxy = engine.state._proxyMisconfigured;
        const scenario = NT002Config._getScenario(engine);
        const isProxyScenario = scenario?.id === 'proxy_misconfig';
        const showFlag = engine.state._flagRevealed && isProxyScenario && !isProxy;
        const flagVal = showFlag ? await engine.requestFlagText('proxy_misconfig') : null;

        container.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#06b6d4; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Proxy Settings</div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="font-weight:bold; margin-bottom:8px;">Automatic Proxy Setup</div>'
            + '<div style="color:#888; font-size:0.75rem; margin-bottom:12px;">Automatically detect settings: <span style="color:#2ecc71;">On</span></div>'
            + '</div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="font-weight:bold; margin-bottom:8px;">Manual Proxy Setup</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid ' + (isProxy ? '#e74c3c' : 'rgba(255,255,255,0.08)') + '; border-radius:4px; padding:12px;">'
            + '<div style="margin-bottom:8px;">Use a proxy server: <span style="color:' + (isProxy ? '#e74c3c; font-weight:bold;' : '#2ecc71;') + '">' + (isProxy ? 'ON' : 'OFF') + '</span></div>'
            + (isProxy
                ? '<div style="font-size:0.75rem; color:#888; margin-bottom:4px;">Address: <span style="color:#e74c3c;">http://proxy-branch3.corp.local</span></div>'
                + '<div style="font-size:0.75rem; color:#888; margin-bottom:4px;">Port: <span style="color:#e74c3c;">8080</span></div>'
                + '<div style="font-size:0.75rem; color:#f39c12; margin-bottom:8px; font-style:italic;">WARNING: Proxy server is not responding</div>'
                + '<button id="proxyDisableBtn" style="padding:6px 20px; background:#e74c3c; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Remove Proxy</button>'
                : '<div style="font-size:0.75rem; color:#888;">No proxy configured — direct connection</div>')
            + '</div></div>'

            + (showFlag
                ? '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Proxy Removal Confirmation:</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem;">Proxy configuration cleared. Direct connection restored.</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem; margin-top:4px;">Recovery token: ' + flagVal + '</div></div>'
                : '');

        if (isProxy) {
            const btn = document.getElementById('proxyDisableBtn');
            if (btn) {
                btn.addEventListener('click', function() {
                    engine.state._proxyMisconfigured = false;
                    if (!engine.state._labComplete) {
                        engine.state._labComplete = true;
                        engine.state._flagRevealed = true;
                    }
                    engine.save();
                    engine.notify('Proxy removed. Browser should now connect directly.', 'success');
                    NT002Config._renderProxySettings(engine);
                });
            }
        }
    },

    // ==========================================================
    // SERVICES
    // ==========================================================

    _openServices(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT002Config._renderServices(engine); return; }
        const container = document.createElement('div');
        container.id = 'svcContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Services', 'SVC', container);
        NT002Config._renderServices(engine);
    },

    _renderServices(engine) {
        const container = document.getElementById('svcContainer');
        if (!container) return;

        const services = [
            { name: 'Background Intelligent Transfer', status: 'Running', startup: 'Automatic' },
            { name: 'COM+ Event System', status: 'Running', startup: 'Automatic' },
            { name: 'Cryptographic Services', status: 'Running', startup: 'Automatic' },
            { name: 'DHCP Client', status: 'Running', startup: 'Automatic' },
            { name: 'DNS Client', status: 'Running', startup: 'Automatic' },
            { name: 'Network Connections', status: 'Running', startup: 'Manual' },
            { name: 'Network Location Awareness', status: 'Running', startup: 'Automatic' },
            { name: 'Print Spooler', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Defender Firewall', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Event Log', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Update', status: 'Running', startup: 'Manual' },
            { name: 'WinHTTP Web Proxy Auto-Discovery', status: 'Running', startup: 'Manual' }
        ];

        let html = '<div style="font-size:1rem; font-weight:bold; color:#06b6d4; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Services (Local)</div>';

        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; margin-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.08);">'
            + '<span style="flex:2;">Name</span>'
            + '<span style="flex:1;">Status</span>'
            + '<span style="flex:1;">Startup Type</span></div>';

        services.forEach(function(svc) {
            html += '<div style="display:flex; align-items:center; padding:6px 8px; margin-bottom:2px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); border-radius:3px;">'
                + '<span style="flex:2;">' + svc.name + '</span>'
                + '<span style="flex:1; color:#2ecc71;">' + svc.status + '</span>'
                + '<span style="flex:1; color:#888;">' + svc.startup + '</span></div>';
        });

        html += '<div style="margin-top:16px; padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:4px; color:#888; font-size:0.75rem;">'
            + 'All services are running normally. If you suspect a service issue, check the specific service status above.</div>';

        container.innerHTML = html;
    },

    // ==========================================================
    // UTILITY METHODS
    // ==========================================================

    _settingsField(label, id, value) {
        return '<div style="display:flex; align-items:center; margin-bottom:8px;">'
            + '<label style="width:160px; color:#888; font-size:0.75rem;" for="' + id + '">' + label + ':</label>'
            + '<input type="text" id="' + id + '" value="' + NT002Config._escHtml(value) + '" style="flex:1; max-width:200px; padding:4px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;">'
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
            + '<button id="nt002ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Reset</button>'
            + '<button id="nt002ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div></div>';

        const arena = document.getElementById('arena');
        arena.appendChild(overlay);

        document.getElementById('nt002ResetConfirm').addEventListener('click', function() {
            NT002Config._flagRestored = false;
            NT002Config.hints = NT002Config._defaultHints;
            engine.reset();
        });
        document.getElementById('nt002ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    },

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
