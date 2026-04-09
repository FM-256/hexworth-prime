/* ============================================================
   ARENA LAB — Box NT003: Slow Connection
   Network Troubleshooting — Network+ N10-009
   Config: network performance issues, CLI output, scenarios
   5 distinct scenarios: duplex mismatch, bandwidth saturation,
   DNS latency, MTU issues, background updates
   ============================================================ */

const NT003Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Slow Connection',
    subtitle: 'Network Performance Troubleshooting — Network+',
    difficulty: 'Intermediate',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_nt003',
    registryId: 'nt003-slow-connection',
    trackerKey: 'lab_nt003',

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
                title: 'Baseline the connection',
                tip: 'Run ipconfig /all and check the adapter speed/duplex with netsh or Device Manager.',
                trigger: { event: 'command', match: { cmd: 'contains:ipconfig' } }
            },
            {
                title: 'Measure latency and throughput',
                tip: 'Ping the gateway and external hosts. High latency or packet loss points to the problem layer.',
                trigger: { event: 'command', match: { cmd: 'contains:ping' } }
            },
            {
                title: 'Diagnose and fix the root cause',
                tip: 'Use the right tool — Device Manager for duplex, Task Manager for bandwidth, Services for updates.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:netsh' },
                    alt: [
                        { event: 'window_open', match: { type: 'device_manager' } },
                        { event: 'window_open', match: { type: 'task_manager' } },
                        { event: 'window_open', match: { type: 'services' } }
                    ]
                }
            },
            {
                title: 'Verify restored performance',
                tip: 'Ping google.com again — latency should be normal. Then find the flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES
    // ==========================================================

    certObjectives: {
        certPath: 'N10-009',
        mappings: [
            { flagId: 'fixed', objective: '5.3', description: 'Given a scenario, troubleshoot common network connectivity issues', skill: 'Speed/Duplex, Latency, Throughput' },
            { flagId: 'fixed', objective: '5.2', description: 'Given a scenario, use the appropriate tool', skill: 'netstat, pathping, Performance Monitor' },
            { flagId: 'fixed', objective: '3.2', description: 'Given a scenario, determine the appropriate placement of networking devices and install/configure them', skill: 'NIC Configuration and Optimization' }
        ]
    },

    // ==========================================================
    // SABOTAGE SCENARIOS
    // ==========================================================

    _scenarioFlags: {
        duplex_mismatch:      null,
        bandwidth_saturation: null,
        dns_latency:          null,
        mtu_issues:           null,
        background_updates:   null
    },

    _scenarios: [
        {
            id: 'duplex_mismatch',
            name: 'Duplex Mismatch',
            ticketSubject: 'Network is painfully slow — pages take forever to load',
            ticketDetail: 'My internet has been crawling since IT replaced my network switch yesterday. Pages load but take 30+ seconds. File transfers to the server that used to take seconds now take minutes. Pings seem to work but everything is just incredibly slow.',
            ticketExtra: 'IT Note: The switch on port Gi0/12 was replaced yesterday. The new switch has auto-negotiation enabled but the NIC on this workstation was previously hard-coded to 1000/Full by a former technician.',
            fixDescription: 'Set the NIC to auto-negotiate or match the switch duplex settings',
            brokenConfig: {
                adapter: 'enabled', dhcp: false,
                ip: '192.168.1.75', subnet: '255.255.255.0', gateway: '192.168.1.1',
                dns1: '8.8.8.8', dns2: '8.8.4.4'
            },
            stateOverrides: { _duplexMismatch: true, _nicSpeed: '100 Mbps', _nicDuplex: 'Half-Duplex', _switchDuplex: 'Full-Duplex' },
            flagLocation: 'Device Manager NIC properties after fix'
        },
        {
            id: 'bandwidth_saturation',
            name: 'Bandwidth Saturation',
            ticketSubject: 'Internet barely works — everything times out',
            ticketDetail: 'My internet is essentially dead. Pages barely load, video calls drop constantly, and even email takes forever. It was fine this morning. I noticed my hard drive light has been blinking like crazy even though I\'m not doing anything.',
            ticketExtra: 'IT Note: A large backup job (file sync to cloud) was scheduled to run on this machine. It may have triggered during work hours instead of after-hours.',
            fixDescription: 'Stop the backup/sync process consuming all bandwidth',
            brokenConfig: {
                adapter: 'enabled', dhcp: false,
                ip: '192.168.1.75', subnet: '255.255.255.0', gateway: '192.168.1.1',
                dns1: '8.8.8.8', dns2: '8.8.4.4'
            },
            stateOverrides: { _bandwidthSaturated: true },
            flagLocation: 'Task Manager after stopping the process'
        },
        {
            id: 'dns_latency',
            name: 'DNS Latency',
            ticketSubject: 'Websites take 10-15 seconds to start loading',
            ticketDetail: 'Every website I visit takes 10-15 seconds before it even starts loading, then once it starts the page loads quickly. If I go back to the same site it loads instantly. But any NEW site has this huge delay. Direct IP access is instant.',
            ticketExtra: 'IT Note: The primary DNS server (10.0.0.53) is experiencing high load due to a misconfigured zone transfer. Response times have degraded to 10+ seconds.',
            fixDescription: 'Switch DNS to a faster public DNS server',
            brokenConfig: {
                adapter: 'enabled', dhcp: false,
                ip: '192.168.1.75', subnet: '255.255.255.0', gateway: '192.168.1.1',
                dns1: '10.0.0.53', dns2: ''
            },
            stateOverrides: { _dnsLatency: true },
            flagLocation: 'nslookup output after DNS change'
        },
        {
            id: 'mtu_issues',
            name: 'MTU Issues',
            ticketSubject: 'Some websites work, others hang or load partially',
            ticketDetail: 'This is really strange. Some websites work perfectly fine but others either hang completely or only load partially. Google works but our company portal gets stuck. Large file downloads fail halfway through. Small emails send fine but ones with attachments fail.',
            ticketExtra: 'IT Note: A VPN appliance was added to the network path last week. It adds encapsulation overhead. The workstation MTU may need adjustment to prevent fragmentation issues.',
            fixDescription: 'Lower the MTU from 1500 to 1400 to account for VPN overhead',
            brokenConfig: {
                adapter: 'enabled', dhcp: false,
                ip: '192.168.1.75', subnet: '255.255.255.0', gateway: '192.168.1.1',
                dns1: '8.8.8.8', dns2: '8.8.4.4'
            },
            stateOverrides: { _mtuIssue: true, _currentMTU: 1500 },
            flagLocation: 'netsh MTU configuration output after fix'
        },
        {
            id: 'background_updates',
            name: 'Background Updates',
            ticketSubject: 'Network has been slow all morning, getting worse',
            ticketDetail: 'My network has been getting progressively slower all morning. It started around 9 AM and now it\'s almost unusable. I can hear my computer working harder than usual and the network activity light on my NIC is blinking constantly even when I\'m not doing anything.',
            ticketExtra: 'IT Note: Windows Update was re-enabled on this workstation after a group policy change. WSUS server pushed a large cumulative update (3.2GB) this morning.',
            fixDescription: 'Stop the Windows Update service consuming bandwidth',
            brokenConfig: {
                adapter: 'enabled', dhcp: false,
                ip: '192.168.1.75', subnet: '255.255.255.0', gateway: '192.168.1.1',
                dns1: '8.8.8.8', dns2: '8.8.4.4'
            },
            stateOverrides: { _bgUpdates: true },
            flagLocation: 'Services console after stopping Windows Update'
        }
    ],

    _correctNetwork: {
        adapter: 'enabled', dhcp: true,
        ip: '192.168.1.75', subnet: '255.255.255.0', gateway: '192.168.1.1',
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
        'yahoo.com': '74.6.231.21',
        'portal.company.local': '192.168.1.10'
    },

    _macAddress: '00-1A-2B-3C-4D-61',
    _adapterName: 'Ethernet0',

    _defaultHints: [
        { id: 'hint1', text: 'Run ipconfig /all and ping the gateway. Note the latency — is it higher than expected?', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Slow networks can be caused by: duplex mismatch, bandwidth saturation, DNS delays, MTU problems, or background processes.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Check Device Manager for NIC speed, Task Manager for bandwidth hogs, and Services for background processes.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'After fixing the root cause, verify with ping — latency should return to normal. The flag is in the tool you used.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        duplex_mismatch: [
            { id: 'hint1', text: 'Run ipconfig /all. The config looks fine. But run ping 192.168.1.1 — notice the high latency and possible packet loss.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The ticket mentions the switch was replaced. Check the NIC speed/duplex in Device Manager. A mismatch between NIC and switch causes massive performance degradation.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Device Manager and check the NIC properties. The NIC is running at 100/Half while the switch expects Full-Duplex. Set the NIC to Auto-Negotiate.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After fixing the duplex setting, check Device Manager again — the flag appears in the adapter properties.', cost: 50, penalty: -50 }
        ],
        bandwidth_saturation: [
            { id: 'hint1', text: 'Ping the gateway — high latency with some drops. Run netstat -a — look at the number of active connections.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The hard drive is thrashing and the NIC is constantly active. Something is consuming all the bandwidth. Check Task Manager.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Task Manager. You\'ll see a backup/sync process using massive bandwidth. Stop it to restore normal network performance.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After stopping the backup process in Task Manager, the flag is displayed in the process details.', cost: 50, penalty: -50 }
        ],
        dns_latency: [
            { id: 'hint1', text: 'Ping 8.8.8.8 — fast! Ping google.com — also fast (because DNS was cached). But try nslookup for a new domain — it takes forever.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The delay only happens the FIRST time you visit a domain. That\'s classic DNS latency. The configured DNS server (10.0.0.53) is responding slowly.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Change the DNS server to a faster one:\n  netsh interface ip set dns "Ethernet0" static 8.8.8.8', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After switching DNS, run nslookup google.com — the flag appears in the fast response.', cost: 50, penalty: -50 }
        ],
        mtu_issues: [
            { id: 'hint1', text: 'Ping 8.8.8.8 works fine. But try: ping -l 1472 -f 8.8.8.8 — it fails! The -f flag prevents fragmentation.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'A VPN appliance was added. It adds encapsulation headers, reducing the effective MTU. Packets larger than the real MTU get dropped when DF (Don\'t Fragment) is set.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Lower the MTU:\n  netsh interface ipv4 set subinterface "Ethernet0" mtu=1400 store=persistent', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After setting the MTU, the flag appears in the netsh confirmation output.', cost: 50, penalty: -50 }
        ],
        background_updates: [
            { id: 'hint1', text: 'Ping the gateway. High latency and some drops. Run netstat — lots of connections to Microsoft update servers.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The network gets progressively worse, the NIC light blinks constantly, and netstat shows connections to WSUS/Microsoft. Windows Update is downloading.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Services and stop the Windows Update service (wuauserv) to immediately free up bandwidth.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After stopping Windows Update in Services, the flag appears in the service status details.', cost: 50, penalty: -50 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !NT003Config._flagRestored) {
            NT003Config._flagRestored = true;
            const scenario = NT003Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                NT003Config.hints = NT003Config._scenarioHints[scenario.id] || NT003Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._networkConfig = JSON.parse(JSON.stringify(NT003Config._scenarios[idx].brokenConfig));
        engine.state._scenarioSelected = true;
        const overrides = NT003Config._scenarios[idx].stateOverrides || {};
        for (const key in overrides) { engine.state[key] = overrides[key]; }
        const scenario = NT003Config._scenarios[idx];
        NT003Config._flagRestored = true;
        NT003Config.hints = NT003Config._scenarioHints[scenario.id] || NT003Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return NT003Config._scenarios[engine.state._scenarioId];
    },

    _net(engine) { return engine.state._networkConfig; },

    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first to receive your assignment.';
        }
        return null;
    },

    _isIP(str) { return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(str); },

    _sameSubnet(ip1, ip2, mask) {
        if (!ip1 || !ip2 || !mask) return false;
        const p = s => s.split('.').map(Number);
        try { const a = p(ip1), b = p(ip2), m = p(mask); return a.every((v, i) => (v & m[i]) === (b[i] & m[i])); }
        catch (e) { return false; }
    },

    _getLatency(engine) {
        // Returns simulated latency based on scenario
        if (engine.state._duplexMismatch) return { base: 150, jitter: 200, loss: 0.15 };
        if (engine.state._bandwidthSaturated) return { base: 300, jitter: 500, loss: 0.25 };
        if (engine.state._bgUpdates) return { base: 200, jitter: 300, loss: 0.1 };
        return { base: 5, jitter: 10, loss: 0 };
    },

    _checkConnectivity(target, engine) {
        const net = engine.state._networkConfig;
        if (!net) return { success: false, error: 'General failure.' };
        if (net.adapter === 'disabled') return { success: false, error: 'General failure.' };

        if (target === '127.0.0.1' || target === 'localhost') return { success: true, ms: 0, ip: '127.0.0.1' };
        if (!net.ip || net.ip === '0.0.0.0') return { success: false, error: 'PING: transmit failed. General failure.' };
        if (target === net.ip) return { success: true, ms: 0, ip: net.ip };

        const latency = NT003Config._getLatency(engine);

        if (NT003Config._isIP(target)) {
            if (NT003Config._sameSubnet(net.ip, target, net.subnet)) {
                return { success: true, ms: latency.base + Math.floor(Math.random() * latency.jitter), ip: target, loss: latency.loss };
            }
            if (!net.gateway || !NT003Config._sameSubnet(net.ip, net.gateway, net.subnet)) {
                return { success: false, error: 'Destination host unreachable.' };
            }
            return { success: true, ms: latency.base + Math.floor(Math.random() * latency.jitter) + 10, ip: target, loss: latency.loss };
        }

        // Domain — MTU scenario: large sites fail
        if (engine.state._mtuIssue && NT003Config._isLargeSite(target)) {
            return { success: false, error: 'Request timed out.', mtuBlocked: true };
        }

        // DNS latency scenario
        if (engine.state._dnsLatency && net.dns1 === '10.0.0.53') {
            // Simulate slow but eventual resolution
            return { success: true, ms: latency.base + 10000 + Math.floor(Math.random() * 5000), ip: NT003Config._knownDomains[target.toLowerCase()] || '93.184.216.34', dnsDelay: true };
        }

        if (!NT003Config._validDNS.includes(net.dns1) && !NT003Config._validDNS.includes(net.dns2) && net.dns1 !== '10.0.0.53') {
            return { success: false, error: 'Ping request could not find host ' + target + '. Please check the name and try again.', dnsError: true };
        }

        const resolved = NT003Config._knownDomains[target.toLowerCase()] || '93.184.216.34';
        return { success: true, ms: latency.base + Math.floor(Math.random() * latency.jitter) + 15, ip: resolved, loss: latency.loss };
    },

    _isLargeSite(domain) {
        const largeSites = ['portal.company.local', 'microsoft.com', 'www.microsoft.com', 'github.com'];
        return largeSites.includes(domain.toLowerCase());
    },

    async _checkLabComplete(target, result, engine) {
        if (!result.success) return null;
        if (NT003Config._isIP(target)) return null;
        if (engine.state._labComplete) return null;

        // Only mark complete if the performance issue is resolved
        const latency = NT003Config._getLatency(engine);
        if (latency.base > 20) return null; // Still degraded

        if (engine.state._mtuIssue) return null; // MTU still broken
        if (engine.state._dnsLatency && engine.state._networkConfig.dns1 === '10.0.0.53') return null;

        engine.state._labComplete = true;
        engine.state._flagRevealed = true;
        engine.save();

        const scenario = NT003Config._getScenario(engine);
        const locationHints = {
            duplex_mismatch: 'Check Device Manager for adapter diagnostic data.',
            bandwidth_saturation: 'Check Task Manager for process details.',
            dns_latency: 'Run nslookup to see the fast DNS response.',
            mtu_issues: 'Check the netsh MTU configuration output.',
            background_updates: 'Check the Services console for update status.'
        };
        const hint = scenario ? (locationHints[scenario.id] || '') : '';

        setTimeout(() => {
            engine.notify('Network performance restored! ' + hint, 'success');
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
        grubEntries: ['Windows 10 Pro', 'Windows Recovery Environment'],
        loginUser: 'Technician'
    },

    desktop: {
        icons: [
            { id: 'cmd',      label: 'Command\nPrompt',     icon: '>_',  app: 'terminal' },
            { id: 'network',  label: 'Network\nSettings',   icon: 'NET', app: 'network_settings' },
            { id: 'devmgr',   label: 'Device\nManager',     icon: 'DEV', app: 'device_manager' },
            { id: 'taskmgr',  label: 'Task\nManager',       icon: 'TSK', app: 'task_manager' },
            { id: 'services', label: 'Services',             icon: 'SVC', app: 'services' },
            { id: 'ticket',   label: 'Help Desk\nTicket',    icon: 'HD',  app: 'ticket' },
            { id: 'notes',    label: 'Notepad',              icon: 'TXT', app: 'notes' },
            { id: 'hints',    label: 'Hints',                icon: '?',   app: 'hints' },
            { id: 'reset',    label: 'Reset\nLab',           icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: {
        user: 'Technician',
        hostname: 'WORKSTATION03',
        startDir: 'C:\\Users\\Technician',
        promptStyle: 'windows',
        welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n'
    },

    filesystem: { '/': { type: 'dir', children: {} } },

    flags: [{ id: 'fixed', value: null, points: 500 }],

    scoring: {
        base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800
    },

    hints: [
        { id: 'hint1', text: 'Start by running ipconfig /all and pinging the gateway. Note the latency.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Slow networks: check duplex, bandwidth, DNS, MTU, and background processes.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use Device Manager, Task Manager, and Services to find the culprit.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag is in the tool you used to fix the performance issue.', cost: 50, penalty: -50 }
    ],

    lore: {
        intro: 'A user reports extremely slow network performance. As the network technician, you must identify what is degrading the connection and restore normal speeds.',
        scenario: 'The workstation is experiencing a real performance problem. Network connectivity exists but is severely degraded. Identify the root cause using performance analysis tools.',
        outro: 'Network performance has been restored to normal levels. Your systematic analysis identified the bottleneck and you applied the correct fix.'
    },

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the help desk ticket and baseline the current performance.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the specific cause of the performance degradation.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the fix to restore normal network performance.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm performance is restored and locate the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // CUSTOM COMMANDS
    // ==========================================================

    commands: {

        ipconfig: function(args, term, engine) {
            const gate = NT003Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            const name = NT003Config._adapterName;
            const mac = NT003Config._macAddress;
            const joined = args.join(' ').toLowerCase();

            if (joined.includes('/all')) {
                return '\nWindows IP Configuration\n\n   Host Name . . . . . . . . . . . . : WORKSTATION03\n   Primary Dns Suffix  . . . . . . . : \n   Node Type . . . . . . . . . . . . : Hybrid\n   IP Routing Enabled. . . . . . . . : No\n   WINS Proxy Enabled. . . . . . . . : No\n\nEthernet adapter ' + name + ':\n\n   Connection-specific DNS Suffix  . : \n   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-V\n   Physical Address. . . . . . . . . : ' + mac + '\n   DHCP Enabled. . . . . . . . . . . : ' + (net.dhcp ? 'Yes' : 'No') + '\n   Autoconfiguration Enabled . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + (net.gateway || '') + '\n   DNS Servers . . . . . . . . . . . : ' + (net.dns1 || '') + '\n                                        ' + (net.dns2 || '') + '\n   NetBIOS over Tcpip. . . . . . . . : Enabled';
            }

            if (joined.includes('/release')) {
                net.ip = '0.0.0.0'; net.subnet = '0.0.0.0'; net.gateway = '';
                engine.save();
                return '\nWindows IP Configuration\n\nEthernet adapter ' + name + ':\n\n   IPv4 Address. . . . . . . . . . . : 0.0.0.0\n   Subnet Mask . . . . . . . . . . . : 0.0.0.0\n   Default Gateway . . . . . . . . . :';
            }

            if (joined.includes('/renew')) {
                net.ip = '192.168.1.75'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.1';
                net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4'; net.dhcp = true;
                engine.save();
                return '\nWindows IP Configuration\n\nEthernet adapter ' + name + ':\n\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + net.gateway;
            }

            if (joined.includes('/flushdns')) { return '\nWindows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.'; }
            if (joined.includes('/displaydns')) {
                return '\nWindows IP Configuration\n\n    Record Name . . . . . : localhost\n    Record Type . . . . . : 1\n    Time To Live  . . . . : 0\n    Data Length . . . . . : 4\n    Section . . . . . . . : Answer\n    A (Host) Record . . . : 127.0.0.1';
            }

            if (joined.includes('/?') || joined.includes('/help')) {
                return '\nUSAGE:\n    ipconfig [/all | /release | /renew | /flushdns | /displaydns]';
            }

            return '\nWindows IP Configuration\n\nEthernet adapter ' + name + ':\n\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + (net.gateway || '');
        },

        ping: async function(args, term, engine) {
            const gate = NT003Config._requireScenario(engine);
            if (gate) return gate;

            if (!args.length || args[0] === '/?') {
                return '\nUsage: ping [-t] [-n count] [-l size] [-f] target_name';
            }

            let target = null, doNotFrag = false, pktSize = 32;
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '-f') { doNotFrag = true; continue; }
                if (args[i] === '-l' && args[i + 1]) { pktSize = parseInt(args[i + 1]); i++; continue; }
                if (args[i] === '-n' && args[i + 1]) { i++; continue; }
                if (!args[i].startsWith('-') && !args[i].startsWith('/')) { target = args[i]; }
            }
            if (!target) return 'Bad parameter.\nUsage: ping target_name';

            // MTU test: ping -f -l 1472 should fail if MTU issue
            if (engine.state._mtuIssue && doNotFrag && pktSize > 1372) {
                return '\nPinging ' + target + ' with ' + pktSize + ' bytes of data:\nPacket needs to be fragmented but DF set.\nPacket needs to be fragmented but DF set.\nPacket needs to be fragmented but DF set.\nPacket needs to be fragmented but DF set.\n\nPing statistics for ' + target + ':\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),';
            }

            const result = NT003Config._checkConnectivity(target, engine);

            if (result.dnsError) return '\n' + result.error;
            if (result.mtuBlocked) {
                return '\nPinging ' + target + ' with 32 bytes of data:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\nPing statistics for ' + target + ':\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),';
            }

            const displayIP = result.ip || target;
            let output = '\nPinging ' + target + (displayIP !== target ? ' [' + displayIP + ']' : '') + ' with ' + pktSize + ' bytes of data:\n';

            if (result.dnsDelay) {
                output += '\n  [Resolving DNS... ' + (result.ms / 1000).toFixed(1) + 's delay]\n\n';
            }

            let received = 0;
            const loss = result.loss || 0;
            for (let i = 0; i < 4; i++) {
                if (result.success && Math.random() > loss) {
                    const ms = result.ms === 0 ? '<1' : String(result.ms + Math.floor(Math.random() * 50));
                    output += 'Reply from ' + displayIP + ': bytes=' + pktSize + ' time=' + ms + 'ms TTL=117\n';
                    received++;
                } else if (result.success) {
                    output += 'Request timed out.\n';
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
                const minMs = result.ms;
                const maxMs = result.ms + 50;
                output += '    Minimum = ' + minMs + 'ms, Maximum = ' + maxMs + 'ms, Average = ' + Math.round((minMs + maxMs) / 2) + 'ms';
            }

            if (result.success && !NT003Config._isIP(target) && received > 0) {
                await NT003Config._checkLabComplete(target, result, engine);
            }

            return output;
        },

        tracert: function(args, term, engine) {
            const gate = NT003Config._requireScenario(engine);
            if (gate) return gate;
            const target = args[0];
            if (!target || target === '/?') return '\nUsage: tracert [-d] target_name';
            const net = engine.state._networkConfig;
            const latency = NT003Config._getLatency(engine);
            const base = latency.base;

            const destIP = NT003Config._isIP(target) ? target : (NT003Config._knownDomains[target.toLowerCase()] || '93.184.216.34');
            let output = '\nTracing route to ' + target + ' [' + destIP + ']\nover a maximum of 30 hops:\n\n';

            output += '  1    ' + base + ' ms    ' + (base + 5) + ' ms    ' + (base + 2) + ' ms  192.168.1.1\n';
            output += '  2    ' + (base + 10) + ' ms    ' + (base + 15) + ' ms    ' + (base + 12) + ' ms  10.0.0.1\n';
            output += '  3    ' + (base + 20) + ' ms    ' + (base + 25) + ' ms    ' + (base + 22) + ' ms  72.14.215.85\n';
            output += '  4    ' + (base + 25) + ' ms    ' + (base + 30) + ' ms    ' + (base + 28) + ' ms  ' + destIP + '\n\nTrace complete.';
            return output;
        },

        nslookup: async function(args, term, engine) {
            const gate = NT003Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length || args[0] === '/?') return '\nUsage: nslookup hostname [dns-server]';
            const net = engine.state._networkConfig;
            const target = args[0];
            const server = args[1] || net.dns1;

            // DNS latency: slow server
            if (engine.state._dnsLatency && (server === '10.0.0.53' || (!args[1] && net.dns1 === '10.0.0.53'))) {
                return '\nServer:  ns1.internal\nAddress:  10.0.0.53\n\n  [DNS query took 12.4 seconds — server under heavy load]\n\nNon-authoritative answer:\nName:    ' + target + '\nAddress:  ' + (NT003Config._knownDomains[target.toLowerCase()] || '93.184.216.34');
            }

            const resolved = NT003Config._knownDomains[target.toLowerCase()] || '93.184.216.34';
            const serverName = server === '8.8.8.8' ? 'dns.google' : server === '1.1.1.1' ? 'one.one.one.one' : server;

            let output = '\nServer:  ' + serverName + '\nAddress:  ' + server + '\n\nNon-authoritative answer:\nName:    ' + target + '\nAddress:  ' + resolved;

            if (engine.state._flagRevealed && NT003Config._getScenario(engine)?.id === 'dns_latency' && NT003Config._validDNS.includes(server)) {
                const flagVal = await engine.requestFlagText('dns_latency');
                output += '\n\n  [Query time: 12ms — DNS performance restored]\n  Recovery token: ' + flagVal;
            }

            return output;
        },

        netstat: function(args, term, engine) {
            const gate = NT003Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            const joined = args.join(' ').toLowerCase();

            if (args.includes('/?')) return '\nUsage: netstat [-a] [-n] [-o] [-b]';

            let output = '\nActive Connections\n\n  Proto  Local Address          Foreign Address        State\n';
            output += '  TCP    ' + net.ip + ':49152     52.113.194.132:443     ESTABLISHED\n';
            output += '  TCP    ' + net.ip + ':49153     13.107.42.14:443       ESTABLISHED\n';

            if (engine.state._bandwidthSaturated) {
                output += '  TCP    ' + net.ip + ':49160     34.107.221.82:443      ESTABLISHED  [CloudSync.exe]\n';
                output += '  TCP    ' + net.ip + ':49161     34.107.221.82:443      ESTABLISHED  [CloudSync.exe]\n';
                output += '  TCP    ' + net.ip + ':49162     34.107.221.83:443      ESTABLISHED  [CloudSync.exe]\n';
                output += '  TCP    ' + net.ip + ':49163     34.107.221.84:443      ESTABLISHED  [CloudSync.exe]\n';
                output += '  TCP    ' + net.ip + ':49164     34.107.221.82:443      TIME_WAIT    [CloudSync.exe]\n';
            }

            if (engine.state._bgUpdates) {
                output += '  TCP    ' + net.ip + ':49170     23.48.23.143:443       ESTABLISHED  [svchost.exe]\n';
                output += '  TCP    ' + net.ip + ':49171     23.48.23.144:80        ESTABLISHED  [svchost.exe]\n';
                output += '  TCP    ' + net.ip + ':49172     23.48.23.145:443       ESTABLISHED  [svchost.exe]\n';
                output += '  TCP    ' + net.ip + ':49173     192.168.1.10:8530      ESTABLISHED  [svchost.exe]\n';
            }

            output += '  TCP    127.0.0.1:49155        127.0.0.1:49156        ESTABLISHED';
            return output;
        },

        netsh: async function(args, term, engine) {
            const gate = NT003Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            const line = args.join(' ');
            const lower = line.toLowerCase();

            if (!args.length || args[0] === '/?') {
                return '\nUsage: netsh interface ip set address|dns ...\n       netsh interface ipv4 set subinterface <name> mtu=<value>\n       netsh interface ipv4 show subinterfaces\n       netsh interface ip show config';
            }

            // Show MTU
            if (/interface\s+ipv4\s+show\s+subinterfaces/i.test(lower)) {
                const mtu = engine.state._currentMTU || 1500;
                return '\n   MTU  MediaSenseState   Bytes In  Bytes Out  Interface\n------  ---------------  ---------  ---------  -------------\n  ' + mtu + '                1  2847293847  1938472847  ' + NT003Config._adapterName + '\n  1500                1          0          0  Loopback Pseudo-Interface 1';
            }

            // Set MTU
            if (/interface\s+ipv4\s+set\s+subinterface/i.test(lower)) {
                const mtuMatch = line.match(/mtu=(\d+)/i);
                if (mtuMatch) {
                    const newMTU = parseInt(mtuMatch[1]);
                    engine.state._currentMTU = newMTU;
                    if (newMTU <= 1400 && engine.state._mtuIssue) {
                        engine.state._mtuIssue = false;
                        if (!engine.state._labComplete) {
                            engine.state._labComplete = true;
                            engine.state._flagRevealed = true;
                        }
                        engine.save();
                        const flagVal = await engine.requestFlagText('mtu_issues');
                        return '\nOk.\n\n  MTU for interface "' + NT003Config._adapterName + '" set to ' + newMTU + '.\n  Fragmentation issue resolved.\n\n  Recovery token: ' + flagVal;
                    }
                    engine.save();
                    return '\nOk.\n\n  MTU for interface "' + NT003Config._adapterName + '" set to ' + newMTU + '.';
                }
                return '\nUsage: netsh interface ipv4 set subinterface "Ethernet0" mtu=1400 store=persistent';
            }

            if (/interface\s+ip\s+show\s+config/i.test(lower)) {
                return '\nConfiguration for interface "' + NT003Config._adapterName + '"\n    DHCP enabled:                    ' + (net.dhcp ? 'Yes' : 'No') + '\n    IP Address:                      ' + net.ip + '\n    Subnet Prefix:                   ' + net.subnet + '\n    Default Gateway:                 ' + (net.gateway || 'None') + '\n    DNS Servers:                     ' + (net.dns1 || 'None') + '\n                                     ' + (net.dns2 || '');
            }

            if (/interface\s+ip\s+set\s+address/i.test(lower)) {
                if (/dhcp/i.test(lower)) { net.dhcp = true; engine.save(); return '\nOk.\n'; }
                const match = line.match(/static\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)/i);
                if (match) { net.dhcp = false; net.ip = match[1]; net.subnet = match[2]; net.gateway = match[3]; engine.save(); return '\nOk.\n'; }
                return '\nSyntax error.';
            }

            if (/interface\s+ip\s+set\s+dns/i.test(lower)) {
                if (/dhcp/i.test(lower)) { net.dns1 = ''; net.dns2 = ''; engine.save(); return '\nOk.\n'; }
                const match = line.match(/static\s+(\d+\.\d+\.\d+\.\d+)/i);
                if (match) {
                    net.dns1 = match[1];
                    if (engine.state._dnsLatency && NT003Config._validDNS.includes(match[1])) {
                        engine.state._dnsLatency = false;
                    }
                    engine.save();
                    return '\nOk.\n';
                }
                return '\nSyntax error.';
            }

            return '\nThe following command was not found: ' + line;
        },

        arp: function(args, term, engine) {
            const gate = NT003Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            return '\nInterface: ' + net.ip + ' --- 0x3\n  Internet Address      Physical Address      Type\n  ' + net.gateway + '       00-1a-2b-3c-4d-01     dynamic\n  192.168.1.255         ff-ff-ff-ff-ff-ff     static\n  224.0.0.22            01-00-5e-00-00-16     static\n  255.255.255.255       ff-ff-ff-ff-ff-ff     static';
        },

        route: function(args, term, engine) {
            const gate = NT003Config._requireScenario(engine);
            if (gate) return gate;
            const net = engine.state._networkConfig;
            return '\nIPv4 Route Table\n===========================================================================\nActive Routes:\n  Network Destination        Netmask          Gateway       Interface  Metric\n          0.0.0.0          0.0.0.0      ' + net.gateway + '    ' + net.ip + '     25\n        127.0.0.0        255.0.0.0         On-link         127.0.0.1    331\n      192.168.1.0    255.255.255.0         On-link       ' + net.ip + '    281\n===========================================================================';
        },

        hostname: function() { return 'WORKSTATION03'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        whoami: function() { return 'WORKSTATION03\\Technician'; },

        ifconfig: function() { return '\'ifconfig\' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: ipconfig'; },
        grep: function() { return '\'grep\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command,\noperable program or batch file.'; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        const requireTicket = ['network_settings', 'device_manager', 'task_manager', 'services'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }
        switch (iconDef.app) {
            case 'ticket':           NT003Config._openTicket(iconDef, engine); break;
            case 'network_settings': NT003Config._openNetworkSettings(iconDef, engine); break;
            case 'device_manager':   NT003Config._openDeviceManager(iconDef, engine); break;
            case 'task_manager':     NT003Config._openTaskManager(iconDef, engine); break;
            case 'services':         NT003Config._openServices(iconDef, engine); break;
            case 'reset_lab':        NT003Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        NT003Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { NT003Config._renderTicket(engine, container); }
        else { NT003Config._renderScenarioPicker(engine, container); }
    },

    _renderScenarioPicker(engine, container) {
        const ticketPreviews = [
            'Alex Rivera — "Network painfully slow since switch replacement"',
            'Kim Nguyen — "Internet barely works, everything times out"',
            'Sarah Walsh — "Websites take 10-15 seconds to start loading"',
            'Dev Patel — "Some websites hang, others work fine"',
            'Lisa Chen — "Network getting slower all morning"'
        ];

        let html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#f59e0b; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">HELP DESK QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select a ticket or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        NT003Config._scenarios.forEach(function(s, i) {
            html += '<button class="nt003-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#f59e0b; font-weight:bold;">HD-' + (8200 + i) + '</span>'
                + '<span style="background:#f39c12; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">MEDIUM</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + ticketPreviews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';
        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="nt003RandomBtn" style="padding:10px 28px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.nt003-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#f59e0b'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                NT003Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                NT003Config._renderTicket(engine, container);
            });
        });
        document.getElementById('nt003RandomBtn').addEventListener('click', function() {
            NT003Config._applyScenario(engine, Math.floor(Math.random() * NT003Config._scenarios.length));
            NT003Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        const scenario = NT003Config._getScenario(engine);
        const submitters = ['Alex Rivera — Engineering', 'Kim Nguyen — Design', 'Sarah Walsh — Marketing', 'Dev Patel — Development', 'Lisa Chen — Finance'];
        const submitter = submitters[engine.state._scenarioId] || 'Employee';

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#f59e0b; font-weight:bold; font-size:1rem;">HELP DESK TICKET #HD-' + (8200 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#f39c12; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: MEDIUM</span>'
            + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBMITTED BY</div><div>' + submitter + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div><div style="font-weight:bold;">' + NT003Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + NT003Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div>'
            + '<div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#ffcc80;">'
            + NT003Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div>'
            + '<div style="color:#2ecc71; font-weight:bold;">YOU — Network Technician</div></div>';
    },

    // Network Settings (simplified for this lab)
    _openNetworkSettings(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'netSettingsContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Network Settings', 'NET', container);
        const net = engine.state._networkConfig;
        container.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">Network Settings</div>'
            + '<div style="margin-bottom:8px;">Adapter: ' + NT003Config._adapterName + ' — <span style="color:#2ecc71;">Connected</span></div>'
            + '<div style="margin-bottom:8px;">IP: ' + net.ip + '</div>'
            + '<div style="margin-bottom:8px;">Subnet: ' + net.subnet + '</div>'
            + '<div style="margin-bottom:8px;">Gateway: ' + net.gateway + '</div>'
            + '<div style="margin-bottom:8px;">DNS: ' + net.dns1 + (net.dns2 ? ', ' + net.dns2 : '') + '</div>'
            + '<div style="margin-bottom:8px;">Speed: ' + (engine.state._nicSpeed || '1.0 Gbps') + '</div>'
            + '<div>Duplex: ' + (engine.state._nicDuplex || 'Full-Duplex') + '</div>'
            + '<div style="margin-top:16px; color:#888; font-size:0.75rem;">Use Command Prompt (netsh) or Device Manager to modify settings.</div>';
    },

    // Device Manager
    _openDeviceManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT003Config._renderDeviceManager(engine); return; }
        const container = document.createElement('div');
        container.id = 'devmgrContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Device Manager', 'DEV', container);
        NT003Config._renderDeviceManager(engine);
    },

    async _renderDeviceManager(engine) {
        const container = document.getElementById('devmgrContainer');
        if (!container) return;
        const isDuplex = engine.state._duplexMismatch;
        const scenario = NT003Config._getScenario(engine);
        const showFlag = engine.state._flagRevealed && scenario?.id === 'duplex_mismatch' && !isDuplex;
        const flagVal = showFlag ? await engine.requestFlagText('duplex_mismatch') : null;

        const speed = engine.state._nicSpeed || '1.0 Gbps';
        const duplex = engine.state._nicDuplex || 'Full-Duplex';

        container.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#f59e0b; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Device Manager — WORKSTATION03</div>'
            + '<div style="padding-left:20px;">'
            + '<div style="color:#ccc; padding:4px 0;">&#9660; Network adapters</div>'
            + '<div style="padding-left:20px; margin-top:4px;">'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid ' + (isDuplex ? '#f39c12' : '#2ecc71') + '; border-radius:4px; padding:12px; margin-bottom:8px;">'
            + '<div style="font-weight:bold; margin-bottom:8px;">Intel(R) Ethernet Connection I219-V</div>'
            + '<div style="font-size:0.75rem; color:#888; margin-bottom:4px;">Link Speed: <span style="color:' + (isDuplex ? '#f39c12; font-weight:bold;' : '#2ecc71;') + '">' + speed + '</span></div>'
            + '<div style="font-size:0.75rem; color:#888; margin-bottom:4px;">Duplex: <span style="color:' + (isDuplex ? '#e74c3c; font-weight:bold;' : '#2ecc71;') + '">' + duplex + '</span></div>'
            + (isDuplex ? '<div style="font-size:0.75rem; color:#f39c12; margin-bottom:8px;">WARNING: Duplex mismatch detected. Switch port is Full-Duplex but NIC is Half-Duplex. This causes collisions and severe performance degradation.</div>' : '')
            + (showFlag
                ? '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:8px; margin-bottom:8px; font-size:0.75rem;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Performance Restored:</div>'
                + '<div style="color:#c8e6c9;">' + flagVal + '</div></div>'
                : '')
            + '<div style="display:flex; gap:8px;">'
            + (isDuplex
                ? '<button id="devmgrFixDuplex" style="padding:6px 20px; background:#f59e0b; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Set Auto-Negotiate</button>'
                : '<span style="color:#2ecc71; font-size:0.75rem;">Auto-Negotiate — 1.0 Gbps Full-Duplex</span>')
            + '</div></div></div></div>';

        if (isDuplex) {
            const btn = document.getElementById('devmgrFixDuplex');
            if (btn) {
                btn.addEventListener('click', function() {
                    engine.state._duplexMismatch = false;
                    engine.state._nicSpeed = '1.0 Gbps';
                    engine.state._nicDuplex = 'Full-Duplex';
                    if (!engine.state._labComplete) {
                        engine.state._labComplete = true;
                        engine.state._flagRevealed = true;
                    }
                    engine.save();
                    engine.notify('NIC set to Auto-Negotiate. Link renegotiated: 1.0 Gbps Full-Duplex.', 'success');
                    NT003Config._renderDeviceManager(engine);
                });
            }
        }
    },

    // Task Manager
    _openTaskManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT003Config._renderTaskManager(engine); return; }
        const container = document.createElement('div');
        container.id = 'taskmgrContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Task Manager', 'TSK', container);
        NT003Config._renderTaskManager(engine);
    },

    async _renderTaskManager(engine) {
        const container = document.getElementById('taskmgrContainer');
        if (!container) return;
        const isSaturated = engine.state._bandwidthSaturated;
        const scenario = NT003Config._getScenario(engine);
        const showFlag = engine.state._flagRevealed && scenario?.id === 'bandwidth_saturation' && !isSaturated;
        const flagVal = showFlag ? await engine.requestFlagText('bandwidth_saturation') : null;

        const processes = [
            { name: 'System', cpu: '1%', mem: '45 MB', net: '0.1 Mbps', disk: '2 MB/s' },
            { name: 'explorer.exe', cpu: '3%', mem: '120 MB', net: '0 Mbps', disk: '0.5 MB/s' },
            { name: 'svchost.exe', cpu: '2%', mem: '85 MB', net: engine.state._bgUpdates ? '95 Mbps' : '0.2 Mbps', disk: engine.state._bgUpdates ? '15 MB/s' : '1 MB/s', highlight: engine.state._bgUpdates },
            { name: 'CloudSync.exe', cpu: isSaturated ? '15%' : '0%', mem: isSaturated ? '340 MB' : '0 MB', net: isSaturated ? '98 Mbps' : '0 Mbps', disk: isSaturated ? '22 MB/s' : '0 MB/s', highlight: isSaturated, canKill: isSaturated },
            { name: 'cmd.exe', cpu: '0%', mem: '8 MB', net: '0 Mbps', disk: '0 MB/s' },
            { name: 'dwm.exe', cpu: '4%', mem: '90 MB', net: '0 Mbps', disk: '0.2 MB/s' }
        ];

        let html = '<div style="font-size:1rem; font-weight:bold; color:#f59e0b; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Task Manager</div>';

        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; margin-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.08);">'
            + '<span style="flex:2;">Process</span><span style="flex:1;">CPU</span><span style="flex:1;">Memory</span><span style="flex:1;">Network</span><span style="flex:1;">Disk</span><span style="flex:1;">Action</span></div>';

        processes.forEach(function(proc) {
            if (!proc.name) return;
            html += '<div style="display:flex; align-items:center; padding:6px 8px; margin-bottom:2px; background:' + (proc.highlight ? 'rgba(231,76,60,0.08)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (proc.highlight ? 'rgba(231,76,60,0.3)' : 'rgba(255,255,255,0.04)') + '; border-radius:3px;">'
                + '<span style="flex:2; font-weight:' + (proc.highlight ? 'bold' : 'normal') + ';">' + proc.name + '</span>'
                + '<span style="flex:1;">' + proc.cpu + '</span>'
                + '<span style="flex:1;">' + proc.mem + '</span>'
                + '<span style="flex:1; color:' + (proc.highlight ? '#e74c3c; font-weight:bold;' : '#ccc;') + '">' + proc.net + '</span>'
                + '<span style="flex:1;">' + proc.disk + '</span>'
                + '<span style="flex:1;">' + (proc.canKill ? '<button class="kill-proc-btn" data-proc="' + proc.name + '" style="padding:3px 12px; background:#e74c3c; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.7rem; font-weight:bold;">End Task</button>' : '') + '</span></div>';
        });

        if (showFlag) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Process Terminated — Bandwidth Restored:</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem;">CloudSync.exe terminated. Network utilization returned to normal.</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem; margin-top:4px;">Recovery token: ' + flagVal + '</div></div>';
        }

        container.innerHTML = html;

        container.querySelectorAll('.kill-proc-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                engine.state._bandwidthSaturated = false;
                if (!engine.state._labComplete) {
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                }
                engine.save();
                engine.notify('CloudSync.exe terminated. Bandwidth restored.', 'success');
                NT003Config._renderTaskManager(engine);
            });
        });
    },

    // Services
    _openServices(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT003Config._renderServices(engine); return; }
        const container = document.createElement('div');
        container.id = 'svcContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Services', 'SVC', container);
        NT003Config._renderServices(engine);
    },

    async _renderServices(engine) {
        const container = document.getElementById('svcContainer');
        if (!container) return;
        const wuRunning = engine.state._bgUpdates;
        const scenario = NT003Config._getScenario(engine);
        const isUpdateScenario = scenario?.id === 'background_updates';
        const showFlag = engine.state._flagRevealed && isUpdateScenario && !wuRunning;
        const flagVal = showFlag ? await engine.requestFlagText('background_updates') : null;

        const services = [
            { name: 'DHCP Client', status: 'Running', startup: 'Automatic' },
            { name: 'DNS Client', status: 'Running', startup: 'Automatic' },
            { name: 'Network Connections', status: 'Running', startup: 'Manual' },
            { name: 'Windows Defender Firewall', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Event Log', status: 'Running', startup: 'Automatic' },
            { name: 'Windows Update', status: wuRunning ? 'Running' : 'Stopped', startup: 'Manual', highlight: isUpdateScenario, canStop: wuRunning && isUpdateScenario }
        ];

        let html = '<div style="font-size:1rem; font-weight:bold; color:#f59e0b; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Services (Local)</div>';
        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:4px 8px; margin-bottom:4px;">'
            + '<span style="flex:2;">Name</span><span style="flex:1;">Status</span><span style="flex:1;">Startup</span><span style="flex:1;">Action</span></div>';

        services.forEach(function(svc) {
            const isStopped = svc.status === 'Stopped';
            html += '<div style="display:flex; align-items:center; padding:6px 8px; margin-bottom:2px; background:' + (svc.highlight ? (isStopped ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)') : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (svc.highlight ? (isStopped ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)') : 'rgba(255,255,255,0.04)') + '; border-radius:3px;">'
                + '<span style="flex:2; font-weight:' + (svc.highlight ? 'bold' : 'normal') + ';">' + svc.name + '</span>'
                + '<span style="flex:1; color:' + (isStopped ? '#888' : (svc.highlight ? '#e74c3c; font-weight:bold;' : '#2ecc71;')) + '">' + svc.status + '</span>'
                + '<span style="flex:1; color:#888;">' + svc.startup + '</span>'
                + '<span style="flex:1;">' + (svc.canStop ? '<button class="svc-stop-btn" style="padding:3px 12px; background:#e74c3c; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.7rem; font-weight:bold;">Stop</button>' : '') + '</span></div>';
        });

        if (showFlag) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Windows Update Stopped:</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem;">Service stopped. Download paused at 67%. Bandwidth restored.</div>'
                + '<div style="color:#c8e6c9; font-size:0.8rem; margin-top:4px;">Recovery token: ' + flagVal + '</div></div>';
        }

        container.innerHTML = html;

        container.querySelectorAll('.svc-stop-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                engine.state._bgUpdates = false;
                if (!engine.state._labComplete) {
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                }
                engine.save();
                engine.notify('Windows Update service stopped. Bandwidth restored.', 'success');
                NT003Config._renderServices(engine);
            });
        });
    },

    _confirmReset(engine) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;">'
            + '<div style="font-size:1rem; font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div>'
            + '<div style="font-size:0.8rem; color:#aaa; margin-bottom:20px;">This will clear all progress and restart.</div>'
            + '<div style="display:flex; gap:12px; justify-content:center;">'
            + '<button id="nt003ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button>'
            + '<button id="nt003ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button>'
            + '</div></div>';
        document.getElementById('arena').appendChild(overlay);
        document.getElementById('nt003ResetConfirm').addEventListener('click', function() { NT003Config._flagRestored = false; NT003Config.hints = NT003Config._defaultHints; engine.reset(); });
        document.getElementById('nt003ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    },

    _escHtml(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
};
