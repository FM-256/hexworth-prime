/* ============================================================
   ARENA LAB — Box NT004: WiFi Won't Connect
   Network Troubleshooting — Network+ N10-009
   5 scenarios: wrong password, hidden SSID, MAC filter,
   certificate expired, channel congestion
   ============================================================ */

const NT004Config = {

    title: 'WiFi Won\'t Connect',
    subtitle: 'Wireless Connectivity Troubleshooting — Network+',
    difficulty: 'Beginner',
    accent: '#8b5cf6',
    storageKey: 'hexworth_lab_nt004',
    registryId: 'nt004-wifi-wont-connect',
    trackerKey: 'lab_nt004',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Double-click the Help Desk Ticket icon to read the user complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check wireless adapter status', tip: 'Run netsh wlan show interfaces to see the current WiFi state.', trigger: { event: 'command', match: { cmd: 'contains:netsh' } } },
            { title: 'Scan for available networks', tip: 'Run netsh wlan show networks to see what SSIDs are available.', trigger: { event: 'command', match: { cmd: 'contains:wlan' } } },
            { title: 'Diagnose and fix the WiFi issue', tip: 'Use WiFi Settings, Device Manager, or netsh commands to resolve the connection problem.', trigger: { event: 'command', match: { cmd: 'contains:netsh' }, alt: [{ event: 'window_open', match: { type: 'wifi_settings' } }] } },
            { title: 'Verify connectivity', tip: 'Once connected, ping google.com to verify internet access. Then find the flag.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'N10-009',
        mappings: [
            { flagId: 'fixed', objective: '2.3', description: 'Given a scenario, configure and deploy common Ethernet switching features', skill: 'Wireless Configuration' },
            { flagId: 'fixed', objective: '5.4', description: 'Given a scenario, troubleshoot common wireless connectivity issues', skill: 'SSID, Authentication, Channel' },
            { flagId: 'fixed', objective: '4.1', description: 'Explain common security concepts', skill: 'MAC Filtering, 802.1X, Certificates' }
        ]
    },

    _scenarioFlags: { wrong_password: null, hidden_ssid: null, mac_filter: null, cert_expired: null, channel_congestion: null },

    _scenarios: [
        {
            id: 'wrong_password',
            name: 'Wrong WiFi Password',
            ticketSubject: 'Laptop won\'t connect to office WiFi — says wrong password',
            ticketDetail: 'My laptop keeps saying the WiFi password is wrong when I try to connect to "CorpWiFi-5G". I\'m sure I\'m typing it correctly — it\'s the same password I\'ve always used. My phone connects to it fine though. I tried forgetting the network and reconnecting but same error.',
            ticketExtra: 'IT Note: The WiFi password for CorpWiFi-5G was changed last weekend as part of the quarterly rotation. New PSK was distributed via email but this user may have missed the notification.',
            fixDescription: 'Update the saved WiFi profile with the new password via WiFi Settings or netsh',
            brokenConfig: { adapter: 'enabled', wifi: true, ssid: '', connected: false, ip: '0.0.0.0', subnet: '0.0.0.0', gateway: '', dns1: '', dns2: '' },
            stateOverrides: { _wrongPassword: true, _savedPassword: 'OldP@ss2025!', _correctPassword: 'NewSecure2026#', _targetSSID: 'CorpWiFi-5G' },
            flagLocation: 'WiFi connection details after successful authentication'
        },
        {
            id: 'hidden_ssid',
            name: 'Hidden SSID',
            ticketSubject: 'Can\'t find the "SecureNet" WiFi network in the list',
            ticketDetail: 'I just moved to the secure area and was told to connect to "SecureNet" WiFi, but I don\'t see it in my available networks list. I see a bunch of other networks like "CorpWiFi-5G" and "Guest" but no "SecureNet". My badge grants me access to this area so I should be able to connect.',
            ticketExtra: 'IT Note: SecureNet is a hidden SSID (broadcast disabled) used in sensitive areas. Users must manually add the network profile with the correct SSID and credentials. SSID: SecureNet, Security: WPA2-Enterprise, Auth: PEAP.',
            fixDescription: 'Manually add the hidden SSID profile via WiFi Settings or netsh wlan add profile',
            brokenConfig: { adapter: 'enabled', wifi: true, ssid: '', connected: false, ip: '0.0.0.0', subnet: '0.0.0.0', gateway: '', dns1: '', dns2: '' },
            stateOverrides: { _hiddenSSID: true, _targetSSID: 'SecureNet' },
            flagLocation: 'WiFi connection details after connecting to hidden network'
        },
        {
            id: 'mac_filter',
            name: 'MAC Address Filter',
            ticketSubject: 'WiFi authenticates but then immediately disconnects',
            ticketDetail: 'My laptop connects to CorpWiFi-5G for about 2 seconds and then immediately disconnects. It keeps cycling — connect, disconnect, connect, disconnect. The password is definitely correct because it gets past authentication. Other people around me are connected fine.',
            ticketExtra: 'IT Note: This is a new replacement laptop. The old laptop\'s MAC address is in the AP\'s allow list. The new laptop\'s MAC address needs to be registered. AP admin console is accessible at 192.168.1.2.',
            fixDescription: 'Register the new laptop\'s MAC address in the AP allow list via AP Admin console',
            brokenConfig: { adapter: 'enabled', wifi: true, ssid: 'CorpWiFi-5G', connected: false, ip: '0.0.0.0', subnet: '0.0.0.0', gateway: '', dns1: '', dns2: '' },
            stateOverrides: { _macFiltered: true, _laptopMAC: 'AA-BB-CC-DD-EE-F1' },
            flagLocation: 'AP Admin console after adding MAC address'
        },
        {
            id: 'cert_expired',
            name: 'Certificate Expired',
            ticketSubject: 'WiFi says certificate validation failed',
            ticketDetail: 'When I try to connect to CorpWiFi-Enterprise, I get an error about a certificate problem. It says "The server\'s certificate is expired" or something like that. This started happening this morning. I haven\'t changed anything on my laptop.',
            ticketExtra: 'IT Note: The RADIUS server\'s TLS certificate expired at midnight. A new cert has been issued but workstations with cached cert validation may need to clear the old cert or accept the new one. The cert store needs to be updated.',
            fixDescription: 'Clear the cached certificate and reconnect to accept the new RADIUS cert',
            brokenConfig: { adapter: 'enabled', wifi: true, ssid: '', connected: false, ip: '0.0.0.0', subnet: '0.0.0.0', gateway: '', dns1: '', dns2: '' },
            stateOverrides: { _certExpired: true, _targetSSID: 'CorpWiFi-Enterprise' },
            flagLocation: 'Certificate Manager after clearing and reconnecting'
        },
        {
            id: 'channel_congestion',
            name: 'Channel Congestion',
            ticketSubject: 'WiFi is connected but extremely slow and keeps dropping',
            ticketDetail: 'My WiFi says it\'s connected but it\'s incredibly slow. Pages barely load and I keep losing connection for a few seconds at a time. This started when they opened the new conference room next door — there are like 5 new access points visible now. My signal strength shows full bars.',
            ticketExtra: 'IT Note: The conference room deployment added 5 APs all on channel 6 (2.4GHz). Our AP for this area is also on channel 6. Co-channel interference is likely the issue. Our AP needs to be moved to a non-overlapping channel (1 or 11).',
            fixDescription: 'Change the AP channel to avoid interference via AP Admin console',
            brokenConfig: { adapter: 'enabled', wifi: true, ssid: 'CorpWiFi-5G', connected: true, ip: '192.168.1.88', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4' },
            stateOverrides: { _channelCongestion: true, _currentChannel: 6 },
            flagLocation: 'AP Admin console after changing channel'
        }
    ],

    _correctNetwork: { adapter: 'enabled', wifi: true, ssid: 'CorpWiFi-5G', connected: true, ip: '192.168.1.88', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4' },
    _validDNS: ['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1', '208.67.222.222', '208.67.220.220', '9.9.9.9'],
    _knownDomains: { 'google.com': '142.250.80.46', 'www.google.com': '142.250.80.46', 'microsoft.com': '20.70.246.20', 'bing.com': '204.79.197.200', 'cloudflare.com': '104.16.132.229', 'github.com': '140.82.121.3' },
    _macAddress: 'AA-BB-CC-DD-EE-F1',
    _adapterName: 'Wi-Fi',

    _defaultHints: [
        { id: 'hint1', text: 'Run netsh wlan show interfaces to see WiFi adapter status and connection state.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'WiFi issues: wrong password, hidden SSID, MAC filter, bad certificate, or channel interference.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use WiFi Settings to manage connections, AP Admin for access point config, and Certificate Manager for cert issues.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag is in the tool you used to fix the WiFi problem.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        wrong_password: [
            { id: 'hint1', text: 'Run netsh wlan show profiles. The CorpWiFi-5G profile exists but the saved password is outdated.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The WiFi password was changed during quarterly rotation. The laptop has the old password cached.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open WiFi Settings and update the password, or delete the profile and reconnect:\n  netsh wlan delete profile name="CorpWiFi-5G"', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After connecting with the new password, the flag appears in the WiFi Settings connection details.', cost: 50, penalty: -50 }
        ],
        hidden_ssid: [
            { id: 'hint1', text: 'Run netsh wlan show networks. SecureNet does not appear because it\'s a hidden network (SSID broadcast disabled).', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Hidden SSIDs don\'t show up in scan results. You must manually add the network profile.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open WiFi Settings and add the network manually, or use netsh to add the profile with the correct SSID.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After connecting to SecureNet, the flag appears in the WiFi Settings connection details.', cost: 50, penalty: -50 }
        ],
        mac_filter: [
            { id: 'hint1', text: 'Run netsh wlan show interfaces. It authenticates but immediately disconnects. The password is correct.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'This is a new replacement laptop. The AP has a MAC filter allow list. Check your MAC: getmac', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open the AP Admin console (192.168.1.2) and add this laptop\'s MAC address to the allow list.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After adding the MAC address to the allow list, the flag appears in the AP Admin console.', cost: 50, penalty: -50 }
        ],
        cert_expired: [
            { id: 'hint1', text: 'The error mentions certificate validation failure. This is an enterprise WiFi (WPA2-Enterprise with RADIUS).', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The RADIUS server cert expired at midnight. A new cert was issued, but the laptop cached the old cert validation.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Certificate Manager, clear the cached RADIUS cert, then reconnect to accept the new certificate.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After clearing the cert and reconnecting, the flag appears in the Certificate Manager.', cost: 50, penalty: -50 }
        ],
        channel_congestion: [
            { id: 'hint1', text: 'Run netsh wlan show interfaces. Connected, full signal, but terrible performance. Run netsh wlan show networks mode=bssid to see channel info.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '6 APs all on channel 6 (2.4GHz). Co-channel interference is destroying performance. Non-overlapping 2.4GHz channels: 1, 6, 11.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open the AP Admin console and change our AP from channel 6 to channel 1 or 11.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After changing the channel, the flag appears in the AP Admin console.', cost: 50, penalty: -50 }
        ]
    },

    // Helpers
    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !NT004Config._flagRestored) {
            NT004Config._flagRestored = true;
            const scenario = NT004Config._scenarios[engine.state._scenarioId];
            if (scenario) NT004Config.hints = NT004Config._scenarioHints[scenario.id] || NT004Config._defaultHints;
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._networkConfig = JSON.parse(JSON.stringify(NT004Config._scenarios[idx].brokenConfig));
        engine.state._scenarioSelected = true;
        const overrides = NT004Config._scenarios[idx].stateOverrides || {};
        for (const key in overrides) engine.state[key] = overrides[key];
        NT004Config._flagRestored = true;
        NT004Config.hints = NT004Config._scenarioHints[NT004Config._scenarios[idx].id] || NT004Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : NT004Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first to receive your assignment.'; },
    _isIP(str) { return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(str); },
    _sameSubnet(ip1, ip2, mask) { if (!ip1 || !ip2 || !mask) return false; try { const p = s => s.split('.').map(Number); const a = p(ip1), b = p(ip2), m = p(mask); return a.every((v, i) => (v & m[i]) === (b[i] & m[i])); } catch(e) { return false; } },

    _checkConnectivity(target, engine) {
        const net = engine.state._networkConfig;
        if (!net || !net.connected) {
            if (target === '127.0.0.1' || target === 'localhost') return { success: true, ms: 0, ip: '127.0.0.1' };
            return { success: false, error: 'General failure.' };
        }
        if (engine.state._channelCongestion) {
            if (target === '127.0.0.1') return { success: true, ms: 0, ip: '127.0.0.1' };
            // Connected but terrible performance
            if (Math.random() > 0.5) return { success: false, error: 'Request timed out.' };
            const resolved = NT004Config._isIP(target) ? target : (NT004Config._knownDomains[target.toLowerCase()] || '93.184.216.34');
            return { success: true, ms: 500 + Math.floor(Math.random() * 2000), ip: resolved, loss: 0.5 };
        }
        if (target === '127.0.0.1' || target === 'localhost') return { success: true, ms: 0, ip: '127.0.0.1' };
        if (target === net.ip) return { success: true, ms: 0, ip: net.ip };
        if (!NT004Config._isIP(target)) {
            const resolved = NT004Config._knownDomains[target.toLowerCase()] || '93.184.216.34';
            return { success: true, ms: Math.floor(Math.random() * 30) + 10, ip: resolved };
        }
        return { success: true, ms: Math.floor(Math.random() * 20) + 5, ip: target };
    },

    async _checkLabComplete(target, result, engine) {
        if (!result.success || NT004Config._isIP(target) || engine.state._labComplete) return null;
        if (engine.state._channelCongestion) return null;
        engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
        setTimeout(() => { engine.notify('WiFi connectivity restored! Find the flag in the tool you used to fix the issue.', 'success'); }, 600);
        return null;
    },

    boot: {
        biosLines: ['American Megatrends UEFI BIOS v2.20.1271', 'Initializing hardware...', 'Memory Test: 16384 MB OK', 'Network: Intel(R) Wi-Fi 6 AX201', 'Boot device: NVMe0', 'Loading Windows Boot Manager...'],
        grubEntries: ['Windows 11 Pro', 'Windows Recovery Environment'],
        loginUser: 'Technician'
    },

    desktop: {
        icons: [
            { id: 'cmd',      label: 'Command\nPrompt',     icon: '>_',  app: 'terminal' },
            { id: 'wifi',     label: 'WiFi\nSettings',      icon: 'WFI', app: 'wifi_settings' },
            { id: 'devmgr',   label: 'Device\nManager',     icon: 'DEV', app: 'device_manager' },
            { id: 'apadmin',  label: 'AP Admin\nConsole',    icon: 'AP',  app: 'ap_admin' },
            { id: 'certmgr',  label: 'Certificate\nManager', icon: 'CRT', app: 'cert_manager' },
            { id: 'ticket',   label: 'Help Desk\nTicket',    icon: 'HD',  app: 'ticket' },
            { id: 'notes',    label: 'Notepad',              icon: 'TXT', app: 'notes' },
            { id: 'hints',    label: 'Hints',                icon: '?',   app: 'hints' },
            { id: 'reset',    label: 'Reset\nLab',           icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'Technician', hostname: 'LAPTOP-WIFI04', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.22631]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: null, points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Run netsh wlan show interfaces and netsh wlan show networks.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'WiFi issues: password, hidden SSID, MAC filter, certificates, or interference.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use WiFi Settings, AP Admin, or Certificate Manager to fix the problem.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag is in the tool you used to fix the WiFi.', cost: 50, penalty: -50 }
    ],
    lore: {
        intro: 'A user cannot connect to the wireless network. As the network technician, diagnose the WiFi issue and restore connectivity.',
        scenario: 'The laptop\'s WiFi connection is broken or degraded. Use wireless diagnostic tools to identify and fix the problem.',
        outro: 'WiFi connectivity has been restored. The user can now access the network wirelessly.'
    },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the ticket and check WiFi adapter status.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the specific WiFi connection issue.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the fix using the appropriate tool.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm WiFi connectivity and locate the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        ipconfig: function(args, term, engine) {
            const gate = NT004Config._requireScenario(engine); if (gate) return gate;
            const net = engine.state._networkConfig;
            const joined = args.join(' ').toLowerCase();
            if (joined.includes('/all')) {
                if (!net.connected) {
                    return '\nWindows IP Configuration\n\n   Host Name . . . . . . . . . . . . : LAPTOP-WIFI04\n\nWireless LAN adapter Wi-Fi:\n\n   Media State . . . . . . . . . . . : Media disconnected\n   Description . . . . . . . . . . . : Intel(R) Wi-Fi 6 AX201\n   Physical Address. . . . . . . . . : ' + NT004Config._macAddress;
                }
                return '\nWindows IP Configuration\n\n   Host Name . . . . . . . . . . . . : LAPTOP-WIFI04\n\nWireless LAN adapter Wi-Fi:\n\n   Connection-specific DNS Suffix  . : \n   Description . . . . . . . . . . . : Intel(R) Wi-Fi 6 AX201\n   Physical Address. . . . . . . . . : ' + NT004Config._macAddress + '\n   DHCP Enabled. . . . . . . . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + net.gateway + '\n   DNS Servers . . . . . . . . . . . : ' + (net.dns1 || '') + '\n                                        ' + (net.dns2 || '');
            }
            if (joined.includes('/release')) { net.ip = '0.0.0.0'; net.subnet = '0.0.0.0'; net.gateway = ''; engine.save(); return '\nWindows IP Configuration\n\nWireless LAN adapter Wi-Fi:\n\n   IPv4 Address. . . . . . . . . . . : 0.0.0.0'; }
            if (joined.includes('/renew')) {
                if (!net.connected) return '\nAn error occurred while renewing interface Wi-Fi :\nThe media is disconnected.';
                net.ip = '192.168.1.88'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.1'; net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4';
                engine.save();
                return '\nWindows IP Configuration\n\nWireless LAN adapter Wi-Fi:\n\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + net.gateway;
            }
            if (joined.includes('/?')) return '\nUSAGE:\n    ipconfig [/all | /release | /renew | /flushdns | /displaydns]';
            if (!net.connected) return '\nWindows IP Configuration\n\nWireless LAN adapter Wi-Fi:\n\n   Media State . . . . . . . . . . . : Media disconnected';
            return '\nWindows IP Configuration\n\nWireless LAN adapter Wi-Fi:\n\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + (net.gateway || '');
        },

        ping: async function(args, term, engine) {
            const gate = NT004Config._requireScenario(engine); if (gate) return gate;
            if (!args.length || args[0] === '/?') return '\nUsage: ping target_name';
            let target = null;
            for (const a of args) { if (!a.startsWith('-')) { target = a; break; } }
            if (!target) return 'Bad parameter.';
            const result = NT004Config._checkConnectivity(target, engine);
            if (result.dnsError) return '\n' + result.error;
            const displayIP = result.ip || target;
            let output = '\nPinging ' + target + (displayIP !== target ? ' [' + displayIP + ']' : '') + ' with 32 bytes of data:\n';
            let received = 0;
            for (let i = 0; i < 4; i++) {
                if (result.success && (!result.loss || Math.random() > result.loss)) {
                    const ms = result.ms === 0 ? '<1' : String(result.ms + Math.floor(Math.random() * 10));
                    output += 'Reply from ' + displayIP + ': bytes=32 time=' + ms + 'ms TTL=117\n'; received++;
                } else { output += (result.error || 'Request timed out.') + '\n'; }
            }
            const lost = 4 - received;
            output += '\nPing statistics for ' + displayIP + ':\n    Packets: Sent = 4, Received = ' + received + ', Lost = ' + lost + ' (' + Math.round((lost/4)*100) + '% loss),\n';
            if (result.success && !NT004Config._isIP(target) && received > 0) { await NT004Config._checkLabComplete(target, result, engine); }
            return output;
        },

        netsh: function(args, term, engine) {
            const gate = NT004Config._requireScenario(engine); if (gate) return gate;
            const line = args.join(' '); const lower = line.toLowerCase();

            if (/wlan\s+show\s+interfaces/i.test(lower)) {
                const net = engine.state._networkConfig;
                if (!net.connected) {
                    return '\nThere is 1 interface on the system:\n\n    Name                   : Wi-Fi\n    Description            : Intel(R) Wi-Fi 6 AX201\n    GUID                   : a1b2c3d4-e5f6-7890-abcd-ef1234567890\n    Physical address       : ' + NT004Config._macAddress + '\n    State                  : disconnected\n    Radio status           : Hardware On / Software On';
                }
                const channel = engine.state._currentChannel || 6;
                return '\nThere is 1 interface on the system:\n\n    Name                   : Wi-Fi\n    Description            : Intel(R) Wi-Fi 6 AX201\n    GUID                   : a1b2c3d4-e5f6-7890-abcd-ef1234567890\n    Physical address       : ' + NT004Config._macAddress + '\n    State                  : connected\n    SSID                   : ' + net.ssid + '\n    BSSID                  : 00:1a:2b:3c:4d:01\n    Network type           : Infrastructure\n    Radio type             : 802.11ax\n    Authentication         : WPA2-Personal\n    Cipher                 : CCMP\n    Connection mode        : Auto Connect\n    Channel                : ' + channel + '\n    Receive rate (Mbps)    : ' + (engine.state._channelCongestion ? '24' : '1201') + '\n    Transmit rate (Mbps)   : ' + (engine.state._channelCongestion ? '24' : '1201') + '\n    Signal                 : ' + (engine.state._channelCongestion ? '95%' : '98%');
            }

            if (/wlan\s+show\s+networks/i.test(lower)) {
                let output = '\nInterface name : Wi-Fi\n';
                if (/mode=bssid/i.test(lower)) {
                    output += '\n    SSID 1 : CorpWiFi-5G\n        Network type : Infrastructure\n        Authentication : WPA2-Personal\n        BSSID 1 : 00:1a:2b:3c:4d:01\n            Signal : 95%\n            Radio type : 802.11ax\n            Channel : 6\n';
                    output += '\n    SSID 2 : Guest\n        Network type : Infrastructure\n        Authentication : Open\n        BSSID 1 : 00:1a:2b:3c:4d:02\n            Signal : 80%\n            Radio type : 802.11n\n            Channel : 1\n';
                    if (engine.state._channelCongestion) {
                        for (let i = 1; i <= 5; i++) {
                            output += '\n    SSID ' + (i + 2) + ' : ConfRoom-AP' + i + '\n        Network type : Infrastructure\n        Authentication : WPA2-Personal\n        BSSID 1 : 00:1a:2b:3c:5' + i + ':01\n            Signal : ' + (70 + i * 3) + '%\n            Radio type : 802.11n\n            Channel : 6\n';
                        }
                    }
                } else {
                    output += '\n    SSID 1 : CorpWiFi-5G\n        Network type : Infrastructure\n        Authentication : WPA2-Personal\n        Encryption : CCMP\n';
                    output += '\n    SSID 2 : Guest\n        Network type : Infrastructure\n        Authentication : Open\n        Encryption : None\n';
                    if (engine.state._channelCongestion) {
                        for (let i = 1; i <= 5; i++) {
                            output += '\n    SSID ' + (i + 2) + ' : ConfRoom-AP' + i + '\n        Network type : Infrastructure\n        Authentication : WPA2-Personal\n        Encryption : CCMP\n';
                        }
                    }
                    // Hidden SSID is NOT listed
                }
                return output;
            }

            if (/wlan\s+show\s+profiles/i.test(lower)) {
                let profiles = '\nProfiles on interface Wi-Fi:\n';
                if (engine.state._wrongPassword) profiles += '\n    All User Profile     : CorpWiFi-5G\n';
                if (engine.state._hiddenSSID) profiles += '\n    (no profiles for SecureNet)\n';
                profiles += '\n    All User Profile     : Guest\n';
                return profiles;
            }

            if (/wlan\s+delete\s+profile/i.test(lower)) {
                if (engine.state._wrongPassword) {
                    engine.state._wrongPassword = false;
                    engine.save();
                    return '\nProfile "CorpWiFi-5G" is deleted from interface "Wi-Fi".\n\n  [Profile removed. Reconnect with the updated password via WiFi Settings.]';
                }
                return '\nProfile deleted.';
            }

            if (/wlan\s+connect/i.test(lower)) {
                const net = engine.state._networkConfig;
                if (engine.state._macFiltered) return '\nConnection request was completed successfully.\n\n  [Connection failed: Access denied by AP — MAC address not authorized]';
                if (engine.state._certExpired) return '\nConnection request was completed successfully.\n\n  [Connection failed: Certificate validation error — server certificate expired]';
                // Success case
                net.connected = true; net.ssid = engine.state._targetSSID || 'CorpWiFi-5G';
                net.ip = '192.168.1.88'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.1'; net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4';
                engine.save();
                return '\nConnection request was completed successfully.\n  Connected to: ' + net.ssid;
            }

            return '\nUsage: netsh wlan show interfaces|networks|profiles\n       netsh wlan delete profile name=<name>\n       netsh wlan connect ssid=<name> name=<profile>';
        },

        tracert: function(args, term, engine) { const gate = NT004Config._requireScenario(engine); if (gate) return gate; return '\nTracing not available on disconnected WiFi.'; },
        nslookup: function(args, term, engine) { const gate = NT004Config._requireScenario(engine); if (gate) return gate; if (!engine.state._networkConfig.connected) return '\nDNS request timed out.'; const t = args[0] || ''; const r = NT004Config._knownDomains[t.toLowerCase()] || '93.184.216.34'; return '\nServer:  dns.google\nAddress:  8.8.8.8\n\nName:    ' + t + '\nAddress:  ' + r; },
        getmac: function() { return '\nPhysical Address    Transport Name\n=================== ==========================================================\n' + NT004Config._macAddress + '   \\Device\\Tcpip_{WIFI-ADAPTER-GUID}'; },
        hostname: function() { return 'LAPTOP-WIFI04'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        whoami: function() { return 'LAPTOP-WIFI04\\Technician'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: ipconfig'; },
        grep: function() { return '\'grep\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command,\noperable program or batch file.'; }
    },

    // Window handlers
    onAppLaunch(iconDef, engine) {
        const requireTicket = ['wifi_settings', 'device_manager', 'ap_admin', 'cert_manager'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket':       NT004Config._openTicket(iconDef, engine); break;
            case 'wifi_settings': NT004Config._openWifiSettings(iconDef, engine); break;
            case 'device_manager': NT004Config._openDeviceManager(iconDef, engine); break;
            case 'ap_admin':     NT004Config._openAPAdmin(iconDef, engine); break;
            case 'cert_manager': NT004Config._openCertManager(iconDef, engine); break;
            case 'reset_lab':    NT004Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        NT004Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) NT004Config._renderTicket(engine, container);
        else NT004Config._renderScenarioPicker(engine, container);
    },

    _renderScenarioPicker(engine, container) {
        const previews = [
            'Jamie Torres — "WiFi says wrong password but I know it\'s right"',
            'Morgan Liu — "Can\'t find SecureNet in available networks"',
            'Chris Abbott — "WiFi connects then immediately drops"',
            'Dana Park — "Certificate error when connecting to enterprise WiFi"',
            'Riley Shah — "WiFi connected but impossibly slow"'
        ];
        let html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#8b5cf6; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">HELP DESK QUEUE</div></div><div>';
        NT004Config._scenarios.forEach(function(s, i) {
            html += '<button class="nt004-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;">'
                + '<span style="color:#8b5cf6; font-weight:bold;">HD-' + (8300 + i) + '</span>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="nt004RandomBtn" style="padding:10px 28px; background:#8b5cf6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.nt004-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { NT004Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); NT004Config._renderTicket(engine, container); });
        });
        document.getElementById('nt004RandomBtn').addEventListener('click', function() { NT004Config._applyScenario(engine, Math.floor(Math.random() * NT004Config._scenarios.length)); NT004Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        const s = NT004Config._getScenario(engine);
        const names = ['Jamie Torres — Marketing', 'Morgan Liu — Security', 'Chris Abbott — Sales', 'Dana Park — Engineering', 'Riley Shah — Operations'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#8b5cf6; font-weight:bold; font-size:1rem;">HELP DESK TICKET #HD-' + (8300 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBMITTED BY</div><div>' + names[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + NT004Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + NT004Config._escHtml(s.ticketDetail) + '</div></div>'
            + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-radius:4px; padding:12px; color:#ffcc80;">' + NT004Config._escHtml(s.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU — Network Technician</div></div>';
    },

    // WiFi Settings
    _openWifiSettings(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT004Config._renderWifiSettings(engine); return; }
        const c = document.createElement('div'); c.id = 'wifiContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'WiFi Settings', 'WFI', c);
        NT004Config._renderWifiSettings(engine);
    },

    async _renderWifiSettings(engine) {
        const c = document.getElementById('wifiContainer'); if (!c) return;
        const net = engine.state._networkConfig;
        const s = NT004Config._getScenario(engine);
        const showFlag = engine.state._flagRevealed && (s?.id === 'wrong_password' || s?.id === 'hidden_ssid') && net.connected;
        const flagVal = showFlag ? await engine.requestFlagText(s.id) : null;

        let html = '<div style="font-size:1rem; font-weight:bold; color:#8b5cf6; margin-bottom:16px;">WiFi Settings</div>';
        html += '<div style="margin-bottom:16px;">Status: <span style="color:' + (net.connected ? '#2ecc71' : '#e74c3c') + '; font-weight:bold;">' + (net.connected ? 'Connected to ' + net.ssid : 'Disconnected') + '</span></div>';

        if (engine.state._wrongPassword && !net.connected) {
            html += '<div style="background:rgba(231,76,60,0.1); border:1px solid rgba(231,76,60,0.3); border-radius:4px; padding:12px; margin-bottom:16px;">'
                + '<div style="color:#e74c3c; font-weight:bold; margin-bottom:8px;">Authentication Failed — CorpWiFi-5G</div>'
                + '<div style="margin-bottom:8px;"><label>Enter new password: <input type="text" id="wifiPasswordInput" style="padding:4px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace;" placeholder="WiFi password"></label></div>'
                + '<button id="wifiConnectBtn" style="padding:6px 20px; background:#8b5cf6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold;">Connect</button></div>';
        }

        if (engine.state._hiddenSSID && !net.connected) {
            html += '<div style="background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3); border-radius:4px; padding:12px; margin-bottom:16px;">'
                + '<div style="font-weight:bold; margin-bottom:8px;">Add Hidden Network</div>'
                + '<div style="margin-bottom:8px;"><label>SSID: <input type="text" id="hiddenSSIDInput" style="padding:4px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace;" placeholder="Network name"></label></div>'
                + '<button id="hiddenConnectBtn" style="padding:6px 20px; background:#8b5cf6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold;">Connect</button></div>';
        }

        if (showFlag) {
            html += '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px; margin-top:16px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Connection Established:</div>'
                + '<div style="color:#c8e6c9;">Recovery token: ' + flagVal + '</div></div>';
        }

        c.innerHTML = html;

        const connectBtn = document.getElementById('wifiConnectBtn');
        if (connectBtn) {
            connectBtn.addEventListener('click', function() {
                const pw = document.getElementById('wifiPasswordInput')?.value;
                if (pw === engine.state._correctPassword) {
                    engine.state._wrongPassword = false; net.connected = true; net.ssid = 'CorpWiFi-5G';
                    net.ip = '192.168.1.88'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.1'; net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4';
                    if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; }
                    engine.save(); engine.notify('Connected to CorpWiFi-5G!', 'success');
                    NT004Config._renderWifiSettings(engine);
                } else { engine.notify('Incorrect password. Try again.', 'error'); }
            });
        }

        const hiddenBtn = document.getElementById('hiddenConnectBtn');
        if (hiddenBtn) {
            hiddenBtn.addEventListener('click', function() {
                const ssid = document.getElementById('hiddenSSIDInput')?.value;
                if (ssid === 'SecureNet') {
                    engine.state._hiddenSSID = false; net.connected = true; net.ssid = 'SecureNet';
                    net.ip = '192.168.1.88'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.1'; net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4';
                    if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; }
                    engine.save(); engine.notify('Connected to SecureNet!', 'success');
                    NT004Config._renderWifiSettings(engine);
                } else { engine.notify('Network "' + ssid + '" not found.', 'error'); }
            });
        }
    },

    // Device Manager (simplified for WiFi)
    _openDeviceManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Device Manager', 'DEV', c);
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#8b5cf6; margin-bottom:16px;">Device Manager</div>'
            + '<div style="padding-left:20px;"><div style="color:#ccc;">&#9660; Network adapters</div>'
            + '<div style="padding-left:20px; margin-top:4px; background:rgba(255,255,255,0.04); border:1px solid #2ecc71; border-radius:4px; padding:12px;">'
            + '<div style="font-weight:bold;">Intel(R) Wi-Fi 6 AX201</div>'
            + '<div style="font-size:0.75rem; color:#888;">Status: <span style="color:#2ecc71;">Working properly</span></div>'
            + '<div style="font-size:0.75rem; color:#888;">MAC: ' + NT004Config._macAddress + '</div>'
            + '</div></div>';
    },

    // AP Admin Console
    _openAPAdmin(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT004Config._renderAPAdmin(engine); return; }
        const c = document.createElement('div'); c.id = 'apAdminContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'AP Admin Console', 'AP', c);
        NT004Config._renderAPAdmin(engine);
    },

    async _renderAPAdmin(engine) {
        const c = document.getElementById('apAdminContainer'); if (!c) return;
        const s = NT004Config._getScenario(engine);
        const showMACFlag = engine.state._flagRevealed && s?.id === 'mac_filter' && !engine.state._macFiltered;
        const showChannelFlag = engine.state._flagRevealed && s?.id === 'channel_congestion' && !engine.state._channelCongestion;
        const flagVal = (showMACFlag || showChannelFlag) ? await engine.requestFlagText(s.id) : null;

        let html = '<div style="font-size:1rem; font-weight:bold; color:#8b5cf6; margin-bottom:16px;">Access Point Admin — 192.168.1.2</div>';

        // MAC Filter section
        if (s?.id === 'mac_filter') {
            html += '<div style="margin-bottom:16px; border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px;">'
                + '<div style="font-weight:bold; margin-bottom:8px;">MAC Address Filter (Allow List)</div>'
                + '<div style="font-size:0.75rem; color:#888; margin-bottom:8px;">Status: <span style="color:#f39c12;">ENABLED</span></div>'
                + '<div style="font-size:0.75rem; margin-bottom:4px;">00-1A-2B-3C-4D-5E — (Old Laptop) <span style="color:#2ecc71;">Allowed</span></div>'
                + '<div style="font-size:0.75rem; margin-bottom:4px;">00-1A-2B-3C-4D-5F — PC-ACCT-01 <span style="color:#2ecc71;">Allowed</span></div>'
                + (engine.state._macFiltered
                    ? '<div style="margin-top:8px;"><div style="font-size:0.75rem; color:#e74c3c; margin-bottom:8px;">New laptop MAC (' + NT004Config._macAddress + ') is NOT in the allow list.</div>'
                    + '<button id="apAddMAC" style="padding:6px 20px; background:#2ecc71; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Add ' + NT004Config._macAddress + '</button></div>'
                    : '<div style="font-size:0.75rem; margin-bottom:4px;">' + NT004Config._macAddress + ' — (New Laptop) <span style="color:#2ecc71;">Allowed</span></div>')
                + '</div>';
        }

        // Channel section
        if (s?.id === 'channel_congestion') {
            const ch = engine.state._currentChannel || 6;
            html += '<div style="margin-bottom:16px; border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px;">'
                + '<div style="font-weight:bold; margin-bottom:8px;">Wireless Settings</div>'
                + '<div style="font-size:0.75rem; margin-bottom:4px;">SSID: CorpWiFi-5G</div>'
                + '<div style="font-size:0.75rem; margin-bottom:4px;">Band: 2.4 GHz</div>'
                + '<div style="font-size:0.75rem; margin-bottom:8px;">Channel: <span style="color:' + (ch === 6 ? '#e74c3c; font-weight:bold;' : '#2ecc71;') + '">' + ch + '</span>' + (ch === 6 ? ' (CONGESTED — 5 other APs on same channel)' : '') + '</div>'
                + (engine.state._channelCongestion
                    ? '<div style="display:flex; gap:8px;">'
                    + '<button class="ch-btn" data-ch="1" style="padding:6px 16px; background:#8b5cf6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem;">Channel 1</button>'
                    + '<button class="ch-btn" data-ch="11" style="padding:6px 16px; background:#8b5cf6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem;">Channel 11</button></div>'
                    : '<div style="color:#2ecc71; font-size:0.75rem;">No interference detected on channel ' + ch + '</div>')
                + '</div>';
        }

        if (showMACFlag || showChannelFlag) {
            html += '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px; margin-top:16px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Configuration Applied:</div>'
                + '<div style="color:#c8e6c9;">Recovery token: ' + flagVal + '</div></div>';
        }

        if (!s || (s.id !== 'mac_filter' && s.id !== 'channel_congestion')) {
            html += '<div style="color:#888; padding:20px; text-align:center;">AP configuration nominal. No issues detected.</div>';
        }

        c.innerHTML = html;

        const addBtn = document.getElementById('apAddMAC');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                engine.state._macFiltered = false;
                const net = engine.state._networkConfig;
                net.connected = true; net.ssid = 'CorpWiFi-5G'; net.ip = '192.168.1.88'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.1'; net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4';
                if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; }
                engine.save(); engine.notify('MAC address added. Laptop now authorized.', 'success');
                NT004Config._renderAPAdmin(engine);
            });
        }

        c.querySelectorAll('.ch-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const newCh = parseInt(this.getAttribute('data-ch'));
                engine.state._currentChannel = newCh;
                engine.state._channelCongestion = false;
                if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; }
                engine.save(); engine.notify('Channel changed to ' + newCh + '. Interference eliminated.', 'success');
                NT004Config._renderAPAdmin(engine);
            });
        });
    },

    // Certificate Manager
    _openCertManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT004Config._renderCertManager(engine); return; }
        const c = document.createElement('div'); c.id = 'certContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Certificate Manager', 'CRT', c);
        NT004Config._renderCertManager(engine);
    },

    async _renderCertManager(engine) {
        const c = document.getElementById('certContainer'); if (!c) return;
        const s = NT004Config._getScenario(engine);
        const showFlag = engine.state._flagRevealed && s?.id === 'cert_expired' && !engine.state._certExpired;
        const flagVal = showFlag ? await engine.requestFlagText('cert_expired') : null;

        let html = '<div style="font-size:1rem; font-weight:bold; color:#8b5cf6; margin-bottom:16px;">Certificate Manager</div>';

        if (s?.id === 'cert_expired') {
            html += '<div style="margin-bottom:16px; border:1px solid ' + (engine.state._certExpired ? '#e74c3c' : '#2ecc71') + '; border-radius:4px; padding:12px;">'
                + '<div style="font-weight:bold; margin-bottom:8px;">Trusted Root CA — RADIUS Server</div>'
                + '<div style="font-size:0.75rem; color:#888; margin-bottom:4px;">Issuer: CorpCA</div>'
                + '<div style="font-size:0.75rem; color:#888; margin-bottom:4px;">Valid From: 2025-03-29</div>'
                + '<div style="font-size:0.75rem; margin-bottom:8px;">Expires: <span style="color:' + (engine.state._certExpired ? '#e74c3c; font-weight:bold;' : '#2ecc71;') + '">' + (engine.state._certExpired ? '2026-03-28 (EXPIRED)' : '2027-03-29 (Valid)') + '</span></div>'
                + (engine.state._certExpired
                    ? '<button id="certClearBtn" style="padding:6px 20px; background:#e74c3c; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Clear Cached Cert & Reconnect</button>'
                    : '')
                + '</div>';
        }

        if (showFlag) {
            html += '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px; margin-top:16px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Certificate Updated:</div>'
                + '<div style="color:#c8e6c9;">New RADIUS certificate accepted. WiFi connected.</div>'
                + '<div style="color:#c8e6c9; margin-top:4px;">Recovery token: ' + flagVal + '</div></div>';
        }

        if (!s || s.id !== 'cert_expired') {
            html += '<div style="color:#888; padding:20px; text-align:center;">All certificates are valid. No issues detected.</div>';
        }

        c.innerHTML = html;

        const clearBtn = document.getElementById('certClearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                engine.state._certExpired = false;
                const net = engine.state._networkConfig;
                net.connected = true; net.ssid = 'CorpWiFi-Enterprise'; net.ip = '192.168.1.88'; net.subnet = '255.255.255.0'; net.gateway = '192.168.1.1'; net.dns1 = '8.8.8.8'; net.dns2 = '8.8.4.4';
                if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; }
                engine.save(); engine.notify('Certificate cleared. Connected with new RADIUS cert.', 'success');
                NT004Config._renderCertManager(engine);
            });
        }
    },

    _confirmReset(engine) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;"><div style="font-size:1rem; font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="nt004ResetY" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="nt004ResetN" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(overlay);
        document.getElementById('nt004ResetY').addEventListener('click', function() { NT004Config._flagRestored = false; NT004Config.hints = NT004Config._defaultHints; engine.reset(); });
        document.getElementById('nt004ResetN').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    },

    _escHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
};
