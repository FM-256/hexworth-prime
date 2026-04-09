/* ============================================================
   ARENA LAB — Box NT005: VPN Failure
   Network Troubleshooting — Network+ N10-009
   5 scenarios: split tunnel misconfigured, firewall blocking UDP 500,
   cert expired, MFA token sync, DNS over VPN
   ============================================================ */

const NT005Config = {

    title: 'VPN Failure',
    subtitle: 'VPN Connectivity Troubleshooting — Network+',
    difficulty: 'Intermediate',
    accent: '#10b981',
    storageKey: 'hexworth_lab_nt005',
    registryId: 'nt005-vpn-failure',
    trackerKey: 'lab_nt005',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the user complaint about VPN connectivity.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check VPN status', tip: 'Open VPN Client or run rasdial to check the VPN connection state.', trigger: { event: 'command', match: { cmd: 'contains:rasdial' } } },
            { title: 'Test connectivity', tip: 'Ping the VPN gateway and internal resources to identify the failure point.', trigger: { event: 'command', match: { cmd: 'contains:ping' } } },
            { title: 'Diagnose and fix', tip: 'Use VPN Client, Firewall Settings, or Certificate Manager to resolve the issue.', trigger: { event: 'command', match: { cmd: 'contains:netsh' }, alt: [{ event: 'window_open', match: { type: 'vpn_client' } }] } },
            { title: 'Verify VPN connectivity', tip: 'Confirm you can reach internal resources through the VPN tunnel.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'N10-009',
        mappings: [
            { flagId: 'fixed', objective: '4.4', description: 'Given a scenario, install and configure VPN clients', skill: 'Split Tunnel, Full Tunnel, IPsec, SSL VPN' },
            { flagId: 'fixed', objective: '5.3', description: 'Given a scenario, troubleshoot common network connectivity issues', skill: 'VPN, Firewall, Certificate, MFA' },
            { flagId: 'fixed', objective: '4.1', description: 'Explain common security concepts', skill: 'Authentication, Encryption, PKI' }
        ]
    },

    _scenarioFlags: { split_tunnel: null, firewall_block: null, cert_expired: null, mfa_sync: null, dns_vpn: null },

    _scenarios: [
        {
            id: 'split_tunnel',
            name: 'Split Tunnel Misconfigured',
            ticketSubject: 'VPN connects but can\'t reach internal servers',
            ticketDetail: 'I connected to the VPN and it says "Connected" but I can\'t access any internal resources. I can\'t reach the file server at 10.10.0.50 or the intranet at 10.10.0.10. Weirdly, I can still browse the internet just fine while "connected" to the VPN.',
            ticketExtra: 'IT Note: VPN client was updated last week. The routing configuration may have been reset to "split tunnel" without the internal routes. Internal network: 10.10.0.0/16.',
            fixDescription: 'Add the missing route for 10.10.0.0/16 through the VPN tunnel',
            brokenConfig: { adapter: 'enabled', dhcp: false, ip: '192.168.1.100', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4', vpnIP: '172.16.0.50', vpnConnected: true },
            stateOverrides: { _splitTunnelBroken: true },
            flagLocation: 'VPN Client routing table after fix'
        },
        {
            id: 'firewall_block',
            name: 'Firewall Blocking UDP 500',
            ticketSubject: 'VPN won\'t connect — times out every time',
            ticketDetail: 'I\'m working from a hotel and the VPN won\'t connect at all. It just sits on "Connecting..." for about 30 seconds then says "Connection timed out." My internet works fine — I can browse websites. I\'ve tried multiple times and restarted my laptop.',
            ticketExtra: 'IT Note: Our VPN uses IPsec (UDP 500/4500). Many hotel networks block these ports. The VPN client supports fallback to SSL/TLS (TCP 443) which is rarely blocked.',
            fixDescription: 'Switch VPN protocol from IPsec to SSL/TLS to bypass hotel firewall',
            brokenConfig: { adapter: 'enabled', dhcp: true, ip: '10.42.1.105', subnet: '255.255.255.0', gateway: '10.42.1.1', dns1: '10.42.1.1', dns2: '', vpnIP: '', vpnConnected: false },
            stateOverrides: { _firewallBlockingVPN: true, _vpnProtocol: 'IPsec' },
            flagLocation: 'VPN Client after successful SSL connection'
        },
        {
            id: 'cert_expired',
            name: 'VPN Certificate Expired',
            ticketSubject: 'VPN says certificate error when connecting',
            ticketDetail: 'When I try to connect to the VPN I get an error: "Certificate validation failed — client certificate has expired." I haven\'t changed anything. This was working yesterday. I need VPN access for a critical presentation today.',
            ticketExtra: 'IT Note: Client certificates for VPN authentication are issued annually. This user\'s cert was issued March 30 2025 and expired today. A renewal cert has been provisioned and is available for download in the Certificate Manager.',
            fixDescription: 'Renew the expired client certificate through Certificate Manager',
            brokenConfig: { adapter: 'enabled', dhcp: false, ip: '192.168.1.100', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4', vpnIP: '', vpnConnected: false },
            stateOverrides: { _vpnCertExpired: true },
            flagLocation: 'Certificate Manager after renewal'
        },
        {
            id: 'mfa_sync',
            name: 'MFA Token Out of Sync',
            ticketSubject: 'VPN says my MFA code is wrong but I\'m reading it right',
            ticketDetail: 'I\'m entering my VPN password and the 6-digit code from my authenticator app but it keeps saying "Authentication failed." I\'m reading the code directly from my phone. I\'ve tried it 5 times now. My password hasn\'t changed.',
            ticketExtra: 'IT Note: TOTP tokens depend on synchronized clocks. If the device clock drifts more than 30 seconds, tokens are rejected. User\'s laptop clock may be out of sync — check Windows Time Service.',
            fixDescription: 'Resync the system clock via Windows Time Service',
            brokenConfig: { adapter: 'enabled', dhcp: false, ip: '192.168.1.100', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4', vpnIP: '', vpnConnected: false },
            stateOverrides: { _mfaOutOfSync: true, _clockOffset: '+3 minutes' },
            flagLocation: 'Services console after time resync'
        },
        {
            id: 'dns_vpn',
            name: 'DNS Over VPN Not Working',
            ticketSubject: 'VPN connected but internal hostnames don\'t resolve',
            ticketDetail: 'The VPN is connected and I can ping internal servers by IP (10.10.0.50 works) but I can\'t access them by name. When I type "fileserver.corp.local" it says host not found. I need to use the names because I have mapped drives using hostnames.',
            ticketExtra: 'IT Note: VPN should push DNS servers 10.10.0.2 and 10.10.0.3 for internal resolution. Check if the VPN adapter\'s DNS configuration was applied correctly.',
            fixDescription: 'Set the VPN adapter DNS to the internal DNS servers',
            brokenConfig: { adapter: 'enabled', dhcp: false, ip: '192.168.1.100', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4', vpnIP: '172.16.0.50', vpnConnected: true },
            stateOverrides: { _vpnDNSBroken: true, _vpnDNS: '' },
            flagLocation: 'nslookup output after DNS fix'
        }
    ],

    _correctNetwork: { adapter: 'enabled', ip: '192.168.1.100', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4', vpnIP: '172.16.0.50', vpnConnected: true },
    _validDNS: ['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1'],
    _knownDomains: { 'google.com': '142.250.80.46', 'microsoft.com': '20.70.246.20', 'bing.com': '204.79.197.200' },
    _internalHosts: { 'fileserver.corp.local': '10.10.0.50', 'intranet.corp.local': '10.10.0.10', 'mail.corp.local': '10.10.0.20', 'dc1.corp.local': '10.10.0.2' },
    _macAddress: '00-1A-2B-3C-4D-62',
    _adapterName: 'Ethernet0',

    _defaultHints: [
        { id: 'hint1', text: 'Check VPN Client status and run ipconfig /all to see both physical and VPN adapter configs.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'VPN issues: routing (split tunnel), firewall blocking, certificates, MFA, or DNS configuration.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use VPN Client settings, Firewall Settings, Certificate Manager, or Services to fix the issue.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag is in the tool you used to fix the VPN problem.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        split_tunnel: [
            { id: 'hint1', text: 'VPN says connected and you have a VPN IP. But route print shows no route to 10.10.0.0/16 through the VPN.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Split tunnel means only specific traffic goes through VPN. The internal route (10.10.0.0/16) is missing.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open VPN Client and add the missing route, or use route add:\n  route add 10.10.0.0 mask 255.255.0.0 172.16.0.1', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After adding the route, check VPN Client routing table for the flag.', cost: 50, penalty: -50 }
        ],
        firewall_block: [
            { id: 'hint1', text: 'Internet works but VPN times out. The hotel firewall may be blocking VPN traffic.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'IPsec uses UDP 500/4500 which many networks block. SSL VPN uses TCP 443 (HTTPS) which is almost never blocked.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open VPN Client and switch the protocol from IPsec to SSL/TLS.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After connecting via SSL, the flag appears in the VPN Client connection details.', cost: 50, penalty: -50 }
        ],
        cert_expired: [
            { id: 'hint1', text: 'VPN error says "client certificate has expired." Check Certificate Manager.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Client certs are issued annually. This one expired today. A renewal is available.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Certificate Manager, find the expired cert, and install the renewal.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After renewing the cert, the flag appears in Certificate Manager.', cost: 50, penalty: -50 }
        ],
        mfa_sync: [
            { id: 'hint1', text: 'MFA codes are time-based (TOTP). If the system clock is wrong, the codes won\'t match.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check the system time. If it\'s offset from real time, TOTP codes will be rejected.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Services, find Windows Time (W32Time), and force a resync. Or run: w32tm /resync', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After resyncing time, the flag appears in the Services console.', cost: 50, penalty: -50 }
        ],
        dns_vpn: [
            { id: 'hint1', text: 'VPN is connected, pinging by IP works (10.10.0.50), but names don\'t resolve. Check VPN adapter DNS.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The VPN adapter has no DNS servers configured. Internal names need internal DNS (10.10.0.2).', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Set DNS on the VPN adapter:\n  netsh interface ip set dns "VPN Adapter" static 10.10.0.2', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After setting VPN DNS, run nslookup fileserver.corp.local — the flag is in the response.', cost: 50, penalty: -50 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !NT005Config._flagRestored) { NT005Config._flagRestored = true; const s = NT005Config._scenarios[engine.state._scenarioId]; if (s) NT005Config.hints = NT005Config._scenarioHints[s.id] || NT005Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._networkConfig = JSON.parse(JSON.stringify(NT005Config._scenarios[idx].brokenConfig)); engine.state._scenarioSelected = true; const o = NT005Config._scenarios[idx].stateOverrides || {}; for (const k in o) engine.state[k] = o[k]; NT005Config._flagRestored = true; NT005Config.hints = NT005Config._scenarioHints[NT005Config._scenarios[idx].id] || NT005Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : NT005Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first.'; },
    _isIP(str) { return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(str); },

    _checkConnectivity(target, engine) {
        const net = engine.state._networkConfig;
        if (!net) return { success: false, error: 'General failure.' };
        if (target === '127.0.0.1') return { success: true, ms: 0, ip: '127.0.0.1' };
        if (target === net.ip) return { success: true, ms: 0, ip: net.ip };

        // Internal IPs (10.10.x.x)
        if (NT005Config._isIP(target) && target.startsWith('10.10.')) {
            if (!net.vpnConnected) return { success: false, error: 'Request timed out.' };
            if (engine.state._splitTunnelBroken) return { success: false, error: 'Destination host unreachable.' };
            return { success: true, ms: Math.floor(Math.random() * 30) + 20, ip: target };
        }

        // Internal hostnames
        const internalIP = NT005Config._internalHosts[target.toLowerCase()];
        if (internalIP) {
            if (!net.vpnConnected) return { success: false, error: 'Ping request could not find host ' + target + '.', dnsError: true };
            if (engine.state._vpnDNSBroken) return { success: false, error: 'Ping request could not find host ' + target + '.', dnsError: true };
            if (engine.state._splitTunnelBroken) return { success: false, error: 'Destination host unreachable.' };
            return { success: true, ms: Math.floor(Math.random() * 30) + 20, ip: internalIP };
        }

        // External
        if (NT005Config._isIP(target)) return { success: true, ms: Math.floor(Math.random() * 20) + 10, ip: target };
        const resolved = NT005Config._knownDomains[target.toLowerCase()] || '93.184.216.34';
        return { success: true, ms: Math.floor(Math.random() * 30) + 15, ip: resolved };
    },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory Test: 16384 MB OK', 'Network: Intel I219-V', 'Loading Windows...'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: {
        icons: [
            { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
            { id: 'vpn', label: 'VPN\nClient', icon: 'VPN', app: 'vpn_client' },
            { id: 'certmgr', label: 'Certificate\nManager', icon: 'CRT', app: 'cert_manager' },
            { id: 'services', label: 'Services', icon: 'SVC', app: 'services' },
            { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
            { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' },
            { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
            { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
        ]
    },
    terminal: { user: 'Technician', hostname: 'LAPTOP-VPN05', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: null, points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check VPN Client status and ipconfig /all.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'VPN issues: routing, firewall, certs, MFA, or DNS.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use VPN Client, Certificate Manager, or Services.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag is in the tool you used to fix the VPN.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'A remote user cannot connect to or use the VPN. Diagnose the VPN issue and restore secure remote access.', scenario: 'The VPN connection has a specific failure. Use diagnostic tools to identify the root cause.', outro: 'VPN connectivity has been restored.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the ticket and check VPN status.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the VPN failure cause.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Fix the VPN issue.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm VPN works and find the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        ipconfig: function(args, term, engine) {
            const gate = NT005Config._requireScenario(engine); if (gate) return gate;
            const net = engine.state._networkConfig;
            const joined = args.join(' ').toLowerCase();
            if (joined.includes('/all')) {
                let output = '\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + net.gateway + '\n   DNS Servers . . . . . . . . . . . : ' + (net.dns1 || '') + '\n                                        ' + (net.dns2 || '');
                if (net.vpnConnected) {
                    const vpnDNS = engine.state._vpnDNS || '';
                    output += '\n\nPPP adapter VPN Adapter:\n\n   IPv4 Address. . . . . . . . . . . : ' + (net.vpnIP || '172.16.0.50') + '\n   Subnet Mask . . . . . . . . . . . : 255.255.255.255\n   Default Gateway . . . . . . . . . : \n   DNS Servers . . . . . . . . . . . : ' + vpnDNS;
                }
                return output;
            }
            if (joined.includes('/?')) return '\nUSAGE: ipconfig [/all | /release | /renew]';
            return '\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Default Gateway . . . . . . . . . : ' + net.gateway;
        },

        ping: async function(args, term, engine) {
            const gate = NT005Config._requireScenario(engine); if (gate) return gate;
            if (!args.length) return '\nUsage: ping target_name';
            let target = null; for (const a of args) { if (!a.startsWith('-')) { target = a; break; } }
            if (!target) return 'Bad parameter.';
            const result = NT005Config._checkConnectivity(target, engine);
            if (result.dnsError) return '\n' + result.error;
            const displayIP = result.ip || target;
            let output = '\nPinging ' + target + (displayIP !== target ? ' [' + displayIP + ']' : '') + ' with 32 bytes of data:\n';
            let received = 0;
            for (let i = 0; i < 4; i++) { if (result.success) { output += 'Reply from ' + displayIP + ': bytes=32 time=' + (result.ms || '<1') + 'ms TTL=117\n'; received++; } else { output += result.error + '\n'; } }
            output += '\nPing statistics for ' + displayIP + ':\n    Packets: Sent = 4, Received = ' + received + ', Lost = ' + (4-received) + ' (' + Math.round(((4-received)/4)*100) + '% loss),\n';
            return output;
        },

        rasdial: function(args, term, engine) {
            const gate = NT005Config._requireScenario(engine); if (gate) return gate;
            const net = engine.state._networkConfig;
            if (!args.length) {
                if (net.vpnConnected) return '\nConnected to:\n    CorpVPN\n\nCommand completed successfully.';
                return '\nNo connections.';
            }
            return '\nUsage: rasdial [connection_name]';
        },

        route: function(args, term, engine) {
            const gate = NT005Config._requireScenario(engine); if (gate) return gate;
            const net = engine.state._networkConfig;
            const line = args.join(' ').toLowerCase();

            if (args[0] === 'print' || !args.length) {
                let output = '\nIPv4 Route Table\n===========================================================================\nActive Routes:\n  Network Destination        Netmask          Gateway       Interface  Metric\n';
                output += '          0.0.0.0          0.0.0.0      ' + net.gateway + '    ' + net.ip + '     25\n';
                output += '        127.0.0.0        255.0.0.0         On-link         127.0.0.1    331\n';
                if (net.vpnConnected && !engine.state._splitTunnelBroken) {
                    output += '       10.10.0.0      255.255.0.0      172.16.0.1    172.16.0.50     5\n';
                }
                output += '===========================================================================';
                return output;
            }

            // route add
            if (/add\s+10\.10\.0\.0/i.test(line)) {
                if (engine.state._splitTunnelBroken) {
                    engine.state._splitTunnelBroken = false;
                    if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; }
                    engine.save();
                    return '\n Ok!';
                }
                return '\n Ok!';
            }

            return '\nUsage: route print | route add <dest> mask <mask> <gateway>';
        },

        nslookup: async function(args, term, engine) {
            const gate = NT005Config._requireScenario(engine); if (gate) return gate;
            const target = args[0]; if (!target) return '\nUsage: nslookup hostname';
            const internalIP = NT005Config._internalHosts[target.toLowerCase()];
            if (internalIP) {
                if (engine.state._vpnDNSBroken) return '\n*** UnKnown can\'t find ' + target + ': Non-existent domain\n\n  [Internal DNS servers not configured on VPN adapter]';
                if (!engine.state._networkConfig.vpnConnected) return '\n*** Can\'t find ' + target + ': VPN not connected';
                let output = '\nServer:  dc1.corp.local\nAddress:  10.10.0.2\n\nName:    ' + target + '\nAddress:  ' + internalIP;
                if (engine.state._flagRevealed && NT005Config._getScenario(engine)?.id === 'dns_vpn') {
                    const flagVal = await engine.requestFlagText('dns_vpn');
                    output += '\n\n  DNS Resolution Restored — Recovery token: ' + flagVal;
                }
                return output;
            }
            const resolved = NT005Config._knownDomains[target.toLowerCase()] || '93.184.216.34';
            return '\nServer:  dns.google\nAddress:  8.8.8.8\n\nName:    ' + target + '\nAddress:  ' + resolved;
        },

        netsh: function(args, term, engine) {
            const gate = NT005Config._requireScenario(engine); if (gate) return gate;
            const line = args.join(' '); const lower = line.toLowerCase();
            if (/interface\s+ip\s+set\s+dns/i.test(lower) && /vpn/i.test(lower)) {
                const match = line.match(/static\s+(\d+\.\d+\.\d+\.\d+)/i);
                if (match && match[1].startsWith('10.10.')) {
                    engine.state._vpnDNS = match[1];
                    if (engine.state._vpnDNSBroken) {
                        engine.state._vpnDNSBroken = false;
                        if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; }
                    }
                    engine.save();
                    return '\nOk.\n';
                }
            }
            return '\nUsage: netsh interface ip set dns "VPN Adapter" static <DNS>';
        },

        w32tm: function(args, term, engine) {
            const gate = NT005Config._requireScenario(engine); if (gate) return gate;
            const lower = args.join(' ').toLowerCase();
            if (/\/resync/i.test(lower)) {
                if (engine.state._mfaOutOfSync) {
                    engine.state._mfaOutOfSync = false;
                    engine.state._clockOffset = '0 seconds';
                    if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; }
                    engine.save();
                    return '\nSending resync command to local computer...\nThe command completed successfully.\n\n  [Clock synchronized. Offset corrected from +3 minutes to 0 seconds.]';
                }
                return '\nThe command completed successfully.';
            }
            if (/\/query\s+\/status/i.test(lower)) {
                return '\nLeap Indicator: 0(no warning)\nStratum: 3\nPrecision: -6\nRoot Delay: 0.0312500s\nSource: time.windows.com\nLast Successful Sync Time: ' + (engine.state._mfaOutOfSync ? '3/28/2026 11:00:00 PM (>24h ago!)' : 'Just now');
            }
            return '\nUsage: w32tm /resync | w32tm /query /status';
        },

        hostname: function() { return 'LAPTOP-VPN05'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        whoami: function() { return 'LAPTOP-VPN05\\Technician'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.\n\nDid you mean: ipconfig'; },
        grep: function() { return '\'grep\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        const requireTicket = ['vpn_client', 'cert_manager', 'services'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': NT005Config._openTicket(iconDef, engine); break;
            case 'vpn_client': NT005Config._openVPNClient(iconDef, engine); break;
            case 'cert_manager': NT005Config._openCertManager(iconDef, engine); break;
            case 'services': NT005Config._openServices(iconDef, engine); break;
            case 'reset_lab': NT005Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        NT005Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) NT005Config._renderTicket(engine, c); else NT005Config._renderPicker(engine, c);
    },

    _renderPicker(engine, c) {
        const previews = ['Alex M. — "VPN connected but can\'t reach internal servers"', 'Jordan K. — "VPN won\'t connect from hotel"', 'Sam P. — "VPN says certificate error"', 'Taylor R. — "MFA code keeps getting rejected"', 'Casey L. — "VPN connected but names don\'t resolve"'];
        let html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#10b981; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        NT005Config._scenarios.forEach(function(s, i) {
            html += '<button class="nt005-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;">'
                + '<span style="color:#10b981; font-weight:bold;">HD-' + (8400+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="nt005Rand" style="padding:10px 28px; background:#10b981; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        c.innerHTML = html;
        c.querySelectorAll('.nt005-btn').forEach(function(b) { b.addEventListener('click', function() { NT005Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); NT005Config._renderTicket(engine, c); }); });
        document.getElementById('nt005Rand').addEventListener('click', function() { NT005Config._applyScenario(engine, Math.floor(Math.random() * NT005Config._scenarios.length)); NT005Config._renderTicket(engine, c); });
    },

    _renderTicket(engine, c) {
        const s = NT005Config._getScenario(engine);
        const names = ['Alex Morgan — Remote', 'Jordan Kim — Travel', 'Sam Park — Remote', 'Taylor Reeves — Remote', 'Casey Lin — Remote'];
        c.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#10b981; font-weight:bold; font-size:1rem;">HELP DESK TICKET #HD-' + (8400+engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBMITTED BY</div><div>' + names[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + NT005Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + NT005Config._escHtml(s.ticketDetail) + '</div></div>'
            + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-radius:4px; padding:12px; color:#ffcc80;">' + NT005Config._escHtml(s.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU — Network Technician</div></div>';
    },

    _openVPNClient(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT005Config._renderVPN(engine); return; }
        const c = document.createElement('div'); c.id = 'vpnContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'VPN Client', 'VPN', c);
        NT005Config._renderVPN(engine);
    },

    async _renderVPN(engine) {
        const c = document.getElementById('vpnContainer'); if (!c) return;
        const net = engine.state._networkConfig;
        const s = NT005Config._getScenario(engine);
        const showSplitFlag = engine.state._flagRevealed && s?.id === 'split_tunnel' && !engine.state._splitTunnelBroken;
        const showFWFlag = engine.state._flagRevealed && s?.id === 'firewall_block' && net.vpnConnected;
        const flagVal = (showSplitFlag || showFWFlag) ? await engine.requestFlagText(s.id) : null;

        let html = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">CorpVPN Client</div>';
        html += '<div style="margin-bottom:16px;">Status: <span style="color:' + (net.vpnConnected ? '#2ecc71; font-weight:bold;">Connected' : '#e74c3c; font-weight:bold;">Disconnected') + '</span></div>';
        if (net.vpnConnected) html += '<div style="margin-bottom:8px; font-size:0.75rem; color:#888;">VPN IP: ' + (net.vpnIP || '172.16.0.50') + '</div>';
        html += '<div style="margin-bottom:8px; font-size:0.75rem; color:#888;">Protocol: ' + (engine.state._vpnProtocol || 'IPsec') + '</div>';

        // Split tunnel: show routing
        if (s?.id === 'split_tunnel') {
            html += '<div style="margin-top:16px; border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px;">'
                + '<div style="font-weight:bold; margin-bottom:8px;">VPN Routing Table</div>'
                + (engine.state._splitTunnelBroken
                    ? '<div style="color:#e74c3c; font-size:0.75rem; margin-bottom:8px;">WARNING: No route to internal network 10.10.0.0/16</div>'
                    + '<button id="vpnAddRoute" style="padding:6px 20px; background:#10b981; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Add Route 10.10.0.0/16</button>'
                    : '<div style="color:#2ecc71; font-size:0.75rem;">10.10.0.0/16 via 172.16.0.1 — Active</div>')
                + '</div>';
        }

        // Firewall: protocol switch
        if (s?.id === 'firewall_block' && !net.vpnConnected) {
            html += '<div style="margin-top:16px; border:1px solid rgba(231,76,60,0.3); border-radius:4px; padding:12px; background:rgba(231,76,60,0.05);">'
                + '<div style="color:#e74c3c; font-weight:bold; margin-bottom:8px;">Connection Failed — IPsec timeout</div>'
                + '<div style="font-size:0.75rem; color:#888; margin-bottom:8px;">UDP 500/4500 may be blocked by the network.</div>'
                + '<button id="vpnSwitchSSL" style="padding:6px 20px; background:#10b981; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Switch to SSL/TLS (TCP 443)</button></div>';
        }

        if (showSplitFlag || showFWFlag) {
            html += '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px; margin-top:16px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">VPN Issue Resolved:</div>'
                + '<div style="color:#c8e6c9;">Recovery token: ' + flagVal + '</div></div>';
        }

        c.innerHTML = html;

        const addRouteBtn = document.getElementById('vpnAddRoute');
        if (addRouteBtn) { addRouteBtn.addEventListener('click', function() { engine.state._splitTunnelBroken = false; if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; } engine.save(); engine.notify('Route to 10.10.0.0/16 added.', 'success'); NT005Config._renderVPN(engine); }); }

        const sslBtn = document.getElementById('vpnSwitchSSL');
        if (sslBtn) { sslBtn.addEventListener('click', function() { engine.state._firewallBlockingVPN = false; engine.state._vpnProtocol = 'SSL/TLS'; net.vpnConnected = true; net.vpnIP = '172.16.0.50'; if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; } engine.save(); engine.notify('Connected via SSL/TLS!', 'success'); NT005Config._renderVPN(engine); }); }
    },

    _openCertManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT005Config._renderCert(engine); return; }
        const c = document.createElement('div'); c.id = 'certContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Certificate Manager', 'CRT', c);
        NT005Config._renderCert(engine);
    },

    async _renderCert(engine) {
        const c = document.getElementById('certContainer'); if (!c) return;
        const s = NT005Config._getScenario(engine);
        const showFlag = engine.state._flagRevealed && s?.id === 'cert_expired' && !engine.state._vpnCertExpired;
        const flagVal = showFlag ? await engine.requestFlagText('cert_expired') : null;

        let html = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">Certificate Manager</div>';
        if (s?.id === 'cert_expired') {
            html += '<div style="border:1px solid ' + (engine.state._vpnCertExpired ? '#e74c3c' : '#2ecc71') + '; border-radius:4px; padding:12px; margin-bottom:16px;">'
                + '<div style="font-weight:bold;">VPN Client Certificate</div>'
                + '<div style="font-size:0.75rem; color:#888;">Subject: technician@corp.local</div>'
                + '<div style="font-size:0.75rem;">Status: <span style="color:' + (engine.state._vpnCertExpired ? '#e74c3c; font-weight:bold;">EXPIRED (2026-03-28)' : '#2ecc71;">Valid (expires 2027-03-29)') + '</span></div>'
                + (engine.state._vpnCertExpired ? '<button id="certRenew" style="margin-top:8px; padding:6px 20px; background:#10b981; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Install Renewal Certificate</button>' : '')
                + '</div>';
        } else {
            html += '<div style="color:#888; text-align:center; padding:20px;">All certificates valid.</div>';
        }
        if (showFlag) {
            html += '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#2ecc71; font-weight:bold;">Certificate Renewed:</div><div style="color:#c8e6c9;">Recovery token: ' + flagVal + '</div></div>';
        }
        c.innerHTML = html;
        const renewBtn = document.getElementById('certRenew');
        if (renewBtn) { renewBtn.addEventListener('click', function() { engine.state._vpnCertExpired = false; const net = engine.state._networkConfig; net.vpnConnected = true; net.vpnIP = '172.16.0.50'; if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; } engine.save(); engine.notify('Certificate renewed. VPN connected!', 'success'); NT005Config._renderCert(engine); }); }
    },

    _openServices(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT005Config._renderServices(engine); return; }
        const c = document.createElement('div'); c.id = 'svcContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Services', 'SVC', c);
        NT005Config._renderServices(engine);
    },

    async _renderServices(engine) {
        const c = document.getElementById('svcContainer'); if (!c) return;
        const s = NT005Config._getScenario(engine);
        const showFlag = engine.state._flagRevealed && s?.id === 'mfa_sync' && !engine.state._mfaOutOfSync;
        const flagVal = showFlag ? await engine.requestFlagText('mfa_sync') : null;

        let html = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">Services (Local)</div>';
        const services = [
            { name: 'DHCP Client', status: 'Running' },
            { name: 'DNS Client', status: 'Running' },
            { name: 'Windows Time (W32Time)', status: 'Running', highlight: s?.id === 'mfa_sync' },
            { name: 'Windows Event Log', status: 'Running' }
        ];
        services.forEach(function(svc) {
            html += '<div style="display:flex; padding:6px 8px; margin-bottom:2px; background:' + (svc.highlight ? 'rgba(231,76,60,0.08)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (svc.highlight ? 'rgba(231,76,60,0.3)' : 'rgba(255,255,255,0.04)') + '; border-radius:3px;">'
                + '<span style="flex:2;">' + svc.name + '</span><span style="flex:1; color:#2ecc71;">' + svc.status + '</span>'
                + '<span style="flex:1;">' + (svc.highlight && engine.state._mfaOutOfSync ? '<button class="svc-resync" style="padding:3px 12px; background:#f39c12; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.7rem; font-weight:bold;">Force Sync</button>' : '') + '</span></div>';
        });
        if (s?.id === 'mfa_sync') {
            html += '<div style="margin-top:12px; padding:8px; border:1px solid rgba(255,255,255,0.1); border-radius:4px; font-size:0.75rem;">'
                + 'Clock offset: <span style="color:' + (engine.state._mfaOutOfSync ? '#e74c3c; font-weight:bold;' : '#2ecc71;') + '">' + (engine.state._clockOffset || '0 seconds') + '</span></div>';
        }
        if (showFlag) {
            html += '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px; margin-top:16px;">'
                + '<div style="color:#2ecc71; font-weight:bold;">Time Synchronized:</div><div style="color:#c8e6c9;">Recovery token: ' + flagVal + '</div></div>';
        }
        c.innerHTML = html;
        c.querySelectorAll('.svc-resync').forEach(function(btn) {
            btn.addEventListener('click', function() {
                engine.state._mfaOutOfSync = false; engine.state._clockOffset = '0 seconds';
                const net = engine.state._networkConfig; net.vpnConnected = true; net.vpnIP = '172.16.0.50';
                if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; }
                engine.save(); engine.notify('Clock synchronized. MFA tokens will now be valid.', 'success');
                NT005Config._renderServices(engine);
            });
        });
    },

    _confirmReset(engine) {
        const o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#e74c3c; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="nt005Y" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="nt005N" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('nt005Y').addEventListener('click', function() { NT005Config._flagRestored = false; NT005Config.hints = NT005Config._defaultHints; engine.reset(); });
        document.getElementById('nt005N').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    },

    _escHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
};
