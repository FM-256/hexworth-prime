/* ============================================================
   ARENA LAB — Box NT006: IP Conflict
   Network Troubleshooting — Network+ N10-009
   5 scenarios: duplicate static IP, DHCP scope overlap,
   rogue DHCP, APIPA, stale ARP cache
   ============================================================ */

const NT006Config = {

    title: 'IP Conflict',
    subtitle: 'IP Address Conflict Resolution — Network+',
    difficulty: 'Beginner',
    accent: '#ef4444',
    storageKey: 'hexworth_lab_nt006',
    registryId: 'nt006-ip-conflict',
    trackerKey: 'lab_nt006',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the user complaint about network issues.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check IP configuration', tip: 'Run ipconfig /all to see the current IP settings.', trigger: { event: 'command', match: { cmd: 'contains:ipconfig' } } },
            { title: 'Check for conflicts', tip: 'Run arp -a to check the ARP table and look for duplicate MACs or IPs.', trigger: { event: 'command', match: { cmd: 'contains:arp' } } },
            { title: 'Fix the conflict', tip: 'Use Network Settings, DHCP renewal, or netsh to resolve the IP conflict.', trigger: { event: 'command', match: { cmd: 'contains:netsh' }, alt: [{ event: 'window_open', match: { type: 'network' } }] } },
            { title: 'Verify connectivity', tip: 'Ping google.com to confirm full connectivity. Then find the flag.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'N10-009',
        mappings: [
            { flagId: 'fixed', objective: '5.3', description: 'Given a scenario, troubleshoot common network connectivity issues', skill: 'IP Conflict, DHCP, APIPA' },
            { flagId: 'fixed', objective: '1.4', description: 'Given a scenario, configure a subnet and use appropriate IP addressing schemes', skill: 'Static IP, DHCP, APIPA' },
            { flagId: 'fixed', objective: '5.2', description: 'Given a scenario, use the appropriate tool', skill: 'arp, ipconfig, netsh' }
        ]
    },

    _scenarioFlags: { duplicate_static: null, dhcp_overlap: null, rogue_dhcp: null, apipa: null, stale_arp: null },

    _scenarios: [
        {
            id: 'duplicate_static',
            name: 'Duplicate Static IP',
            ticketSubject: 'Windows says IP address conflict detected',
            ticketDetail: 'I keep getting a popup saying "Windows has detected an IP address conflict. Another computer on this network has the same IP address." My network connection keeps dropping in and out. I was assigned the static IP 192.168.1.50 by IT last month.',
            ticketExtra: 'IT Note: Another workstation (PC-ACCT-03) was incorrectly assigned the same static IP 192.168.1.50. This workstation should use 192.168.1.55 instead.',
            fixDescription: 'Change the workstation IP to 192.168.1.55 to resolve the conflict',
            brokenConfig: { adapter: 'enabled', dhcp: false, ip: '192.168.1.50', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4' },
            stateOverrides: { _duplicateIP: true, _conflictMAC: '00-1A-2B-99-99-99' },
            flagLocation: 'Network Settings after IP change'
        },
        {
            id: 'dhcp_overlap',
            name: 'DHCP Scope Overlap',
            ticketSubject: 'Network works for 5 minutes then drops, repeating cycle',
            ticketDetail: 'My network works for about 5 minutes then completely drops. After a minute it comes back, works for 5 more minutes, then drops again. This cycle keeps repeating. It started this morning when the new printer was set up.',
            ticketExtra: 'IT Note: The new network printer was assigned static IP 192.168.1.42, which falls within the DHCP scope (192.168.1.20-192.168.1.100). This workstation received .42 from DHCP, conflicting with the printer.',
            fixDescription: 'Release DHCP lease and renew to get a non-conflicting address',
            brokenConfig: { adapter: 'enabled', dhcp: true, ip: '192.168.1.42', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4' },
            stateOverrides: { _dhcpOverlap: true, _printerIP: '192.168.1.42', _printerMAC: '00-11-22-33-44-55' },
            flagLocation: 'ipconfig output after successful renewal'
        },
        {
            id: 'rogue_dhcp',
            name: 'Rogue DHCP Server',
            ticketSubject: 'Got a completely wrong IP address — 10.0.0.x instead of 192.168.1.x',
            ticketDetail: 'My computer has an IP address of 10.0.0.105 which is completely wrong. Our network is 192.168.1.x. I tried releasing and renewing but I keep getting 10.0.0.x addresses. Nobody else seems to have this problem.',
            ticketExtra: 'IT Note: A rogue DHCP server has been identified on the network — someone plugged in a personal router. The rogue device is handing out 10.0.0.x addresses. It has been physically disconnected. This workstation needs to release the rogue lease and renew from the legitimate DHCP server.',
            fixDescription: 'Release the rogue DHCP lease, flush ARP, and renew from legitimate DHCP',
            brokenConfig: { adapter: 'enabled', dhcp: true, ip: '10.0.0.105', subnet: '255.255.255.0', gateway: '10.0.0.1', dns1: '10.0.0.1', dns2: '' },
            stateOverrides: { _rogueDHCP: true },
            flagLocation: 'ipconfig output after getting correct lease'
        },
        {
            id: 'apipa',
            name: 'APIPA Address',
            ticketSubject: 'Computer has 169.254 address, can\'t reach anything',
            ticketDetail: 'My computer shows a 169.254.x.x IP address and I can\'t connect to anything. I was on DHCP and it was working fine yesterday. I tried ipconfig /renew but it says it can\'t contact the DHCP server.',
            ticketExtra: 'IT Note: The DHCP server ran out of available addresses in the scope. The scope has been expanded. Workstations that failed to get a lease should now be able to renew successfully.',
            fixDescription: 'Release the APIPA address and renew DHCP to get a valid lease',
            brokenConfig: { adapter: 'enabled', dhcp: true, ip: '169.254.118.45', subnet: '255.255.0.0', gateway: '', dns1: '', dns2: '' },
            stateOverrides: { _apipaAddress: true },
            flagLocation: 'ipconfig output after successful DHCP renewal'
        },
        {
            id: 'stale_arp',
            name: 'Stale ARP Cache',
            ticketSubject: 'Can\'t reach the gateway — ping says destination unreachable',
            ticketDetail: 'I can\'t reach anything on the network. Pinging the gateway 192.168.1.1 says "destination host unreachable" even though my IP config looks correct. This started after the network switch was replaced during maintenance.',
            ticketExtra: 'IT Note: The default gateway was moved to a new switch during maintenance. The gateway\'s MAC address has changed but workstations may have the old MAC cached in their ARP tables.',
            fixDescription: 'Clear the stale ARP cache with arp -d',
            brokenConfig: { adapter: 'enabled', dhcp: false, ip: '192.168.1.50', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4' },
            stateOverrides: { _staleARP: true, _oldGatewayMAC: '00-AA-BB-CC-DD-EE', _newGatewayMAC: '00-1A-2B-3C-4D-01' },
            flagLocation: 'ARP table output after clearing cache'
        }
    ],

    _correctNetwork: { adapter: 'enabled', ip: '192.168.1.55', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4' },
    _validDNS: ['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1'],
    _knownDomains: { 'google.com': '142.250.80.46', 'microsoft.com': '20.70.246.20', 'bing.com': '204.79.197.200' },
    _macAddress: '00-1A-2B-3C-4D-63',
    _adapterName: 'Ethernet0',

    _defaultHints: [
        { id: 'hint1', text: 'Run ipconfig /all and arp -a to see your IP configuration and ARP table.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'IP conflicts: duplicate static, DHCP overlap, rogue DHCP, APIPA, or stale ARP cache.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Fix with: change IP, release/renew DHCP, or clear ARP cache (arp -d).', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after you resolve the conflict.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        duplicate_static: [
            { id: 'hint1', text: 'Run arp -a. You\'ll see two different MAC addresses mapped to the same IP. That\'s the conflict.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Both this PC and PC-ACCT-03 are using 192.168.1.50. This workstation needs to change to .55.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Network Settings and change the IP to 192.168.1.55, or use netsh.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After changing the IP, the flag appears in Network Settings.', cost: 50, penalty: -50 }
        ],
        dhcp_overlap: [
            { id: 'hint1', text: 'Run ipconfig /all. IP is .42 from DHCP. Run arp -a — there\'s another device at .42 (the printer).', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The printer has static .42 and this PC got .42 from DHCP. Release and renew to get a different address.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Run: ipconfig /release then ipconfig /renew', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After renewal, the flag appears in the ipconfig output.', cost: 50, penalty: -50 }
        ],
        rogue_dhcp: [
            { id: 'hint1', text: 'Run ipconfig /all. The IP is 10.0.0.x — wrong network entirely. DHCP gave a bad lease.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'A rogue DHCP server was on the network. It\'s been removed. Release the bad lease and renew.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Run: ipconfig /release then ipconfig /renew to get a lease from the real DHCP server.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After renewal with a 192.168.1.x address, the flag appears in ipconfig output.', cost: 50, penalty: -50 }
        ],
        apipa: [
            { id: 'hint1', text: 'Run ipconfig /all. IP is 169.254.x.x — APIPA. DHCP failed to provide a lease.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The DHCP scope was full but has been expanded. You should be able to get a lease now.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Run: ipconfig /release then ipconfig /renew', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After getting a valid lease, the flag appears in ipconfig output.', cost: 50, penalty: -50 }
        ],
        stale_arp: [
            { id: 'hint1', text: 'Run arp -a. The gateway MAC in the cache doesn\'t match the new switch MAC.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The ARP entry for the gateway points to the old switch\'s MAC. Clear it so ARP re-learns the new MAC.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Run: arp -d to clear the ARP cache, then ping the gateway to re-learn.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After clearing ARP and re-pinging, the flag appears in the arp -a output.', cost: 50, penalty: -50 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !NT006Config._flagRestored) { NT006Config._flagRestored = true; const s = NT006Config._scenarios[engine.state._scenarioId]; if (s) NT006Config.hints = NT006Config._scenarioHints[s.id] || NT006Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._networkConfig = JSON.parse(JSON.stringify(NT006Config._scenarios[idx].brokenConfig)); engine.state._scenarioSelected = true; const o = NT006Config._scenarios[idx].stateOverrides || {}; for (const k in o) engine.state[k] = o[k]; NT006Config._flagRestored = true; NT006Config.hints = NT006Config._scenarioHints[NT006Config._scenarios[idx].id] || NT006Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : NT006Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first.'; },
    _isIP(str) { return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(str); },
    _sameSubnet(ip1, ip2, mask) { if (!ip1||!ip2||!mask) return false; try { const p=s=>s.split('.').map(Number); const a=p(ip1),b=p(ip2),m=p(mask); return a.every((v,i)=>(v&m[i])===(b[i]&m[i])); } catch(e) { return false; } },

    _checkConnectivity(target, engine) {
        const net = engine.state._networkConfig;
        if (!net) return { success: false, error: 'General failure.' };
        if (target === '127.0.0.1') return { success: true, ms: 0, ip: '127.0.0.1' };
        if (!net.ip || net.ip.startsWith('169.254') || net.ip.startsWith('10.0.0')) {
            if (NT006Config._isIP(target)) return { success: false, error: 'PING: transmit failed. General failure.' };
            return { success: false, error: 'Ping request could not find host ' + target + '.', dnsError: true };
        }
        if (engine.state._staleARP && target === net.gateway) return { success: false, error: 'Destination host unreachable.' };
        if (engine.state._duplicateIP) { if (Math.random() > 0.5) return { success: false, error: 'Request timed out.' }; }
        if (engine.state._dhcpOverlap) { if (Math.random() > 0.5) return { success: false, error: 'Request timed out.' }; }
        if (target === net.ip) return { success: true, ms: 0, ip: net.ip };
        if (NT006Config._isIP(target)) {
            if (!net.gateway || !NT006Config._sameSubnet(net.ip, net.gateway, net.subnet)) return { success: false, error: 'Destination host unreachable.' };
            if (engine.state._staleARP) return { success: false, error: 'Destination host unreachable.' };
            return { success: true, ms: Math.floor(Math.random()*20)+10, ip: target };
        }
        if (!NT006Config._validDNS.includes(net.dns1)) return { success: false, error: 'Ping request could not find host ' + target + '.', dnsError: true };
        const resolved = NT006Config._knownDomains[target.toLowerCase()] || '93.184.216.34';
        return { success: true, ms: Math.floor(Math.random()*30)+15, ip: resolved };
    },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB OK', 'Network: Intel I219-V', 'Loading Windows...'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: {
        icons: [
            { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
            { id: 'network', label: 'Network\nSettings', icon: 'NET', app: 'network_settings' },
            { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
            { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' },
            { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
            { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
        ]
    },
    terminal: { user: 'Technician', hostname: 'WORKSTATION06', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: null, points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [ { id: 'hint1', text: 'Run ipconfig /all and arp -a.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Check for duplicate IPs, wrong DHCP, APIPA, or stale ARP.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Fix with IP change, DHCP renew, or arp -d.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Flag appears after resolving the conflict.', cost: 50, penalty: -50 } ],
    lore: { intro: 'A user is experiencing an IP address conflict. Identify the type of conflict and resolve it.', scenario: 'The workstation has an IP addressing problem causing connectivity issues.', outro: 'IP conflict resolved. Normal connectivity restored.' },
    phases: [
        { id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false, description: 'Read the ticket and check IP config.' },
        { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true, description: 'Identify the IP conflict type.' },
        { id: 'repair', name: 'Repair', requiredFlags: [], unlocks: ['verify'], locked: true, description: 'Resolve the IP conflict.' },
        { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true, description: 'Confirm connectivity and find the flag.' }
    ],

    commands: {
        ipconfig: async function(args, term, engine) {
            const gate = NT006Config._requireScenario(engine); if (gate) return gate;
            const net = engine.state._networkConfig; const joined = args.join(' ').toLowerCase();
            if (joined.includes('/all')) {
                let output = '\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   Physical Address. . . . . . . . . : ' + NT006Config._macAddress + '\n   DHCP Enabled. . . . . . . . . . . : ' + (net.dhcp?'Yes':'No') + '\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + (engine.state._duplicateIP?' (CONFLICT DETECTED)':'') + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + (net.gateway||'') + '\n   DNS Servers . . . . . . . . . . . : ' + (net.dns1||'') + (net.dns2?'\n                                        '+net.dns2:'');
                if (engine.state._flagRevealed) {
                    const s = NT006Config._getScenario(engine);
                    if (s && (s.id==='dhcp_overlap'||s.id==='rogue_dhcp'||s.id==='apipa') && net.ip.startsWith('192.168.1.')) {
                        const fv = await engine.requestFlagText(s.id);
                        output += '\n\n   DHCP Lease Recovery Token . . . . : ' + fv;
                    }
                }
                return output;
            }
            if (joined.includes('/release')) { net.ip='0.0.0.0'; net.subnet='0.0.0.0'; net.gateway=''; net.dns1=''; net.dns2=''; engine.save(); return '\nIP released.'; }
            if (joined.includes('/renew')) {
                if (!net.dhcp) return '\nAdapter not configured for DHCP.';
                // After rogue DHCP removed or scope expanded, renew gives correct IP
                net.ip='192.168.1.'+Math.floor(Math.random()*50+50); net.subnet='255.255.255.0'; net.gateway='192.168.1.1'; net.dns1='8.8.8.8'; net.dns2='8.8.4.4';
                engine.state._rogueDHCP=false; engine.state._apipaAddress=false; engine.state._dhcpOverlap=false;
                if (!engine.state._labComplete) { engine.state._labComplete=true; engine.state._flagRevealed=true; }
                engine.save();
                return '\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + net.gateway;
            }
            if (joined.includes('/?')) return '\nUSAGE: ipconfig [/all | /release | /renew]';
            return '\nEthernet adapter Ethernet0:\n\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Default Gateway . . . . . . . . . : ' + (net.gateway||'');
        },

        ping: function(args, term, engine) {
            const gate = NT006Config._requireScenario(engine); if (gate) return gate;
            if (!args.length) return '\nUsage: ping target_name';
            let target=null; for (const a of args) { if (!a.startsWith('-')) { target=a; break; } }
            if (!target) return 'Bad parameter.';
            const result = NT006Config._checkConnectivity(target, engine);
            if (result.dnsError) return '\n' + result.error;
            const ip = result.ip||target;
            let output = '\nPinging ' + target + (ip!==target?' ['+ip+']':'') + ' with 32 bytes of data:\n';
            let rx=0; for (let i=0;i<4;i++) { if (result.success) { output += 'Reply from '+ip+': bytes=32 time='+(result.ms||'<1')+'ms TTL=117\n'; rx++; } else { output += result.error+'\n'; } }
            output += '\nPing statistics for '+ip+':\n    Packets: Sent = 4, Received = '+rx+', Lost = '+(4-rx)+' ('+Math.round(((4-rx)/4)*100)+'% loss),\n';
            return output;
        },

        arp: async function(args, term, engine) {
            const gate = NT006Config._requireScenario(engine); if (gate) return gate;
            const net = engine.state._networkConfig; const joined = args.join(' ').toLowerCase();
            if (joined.includes('-d')) {
                if (engine.state._staleARP) {
                    engine.state._staleARP = false;
                    if (!engine.state._labComplete) { engine.state._labComplete=true; engine.state._flagRevealed=true; }
                    engine.save();
                    return '\nARP cache cleared.\n  [Stale entries removed. Re-ping gateway to re-learn MAC addresses.]';
                }
                return '\nARP cache cleared.';
            }
            if (!net.ip||net.ip==='0.0.0.0'||net.ip.startsWith('169.254')) return '\nNo ARP Entries Found.';
            let output = '\nInterface: ' + net.ip + ' --- 0x3\n  Internet Address      Physical Address      Type\n';
            if (engine.state._staleARP) {
                output += '  192.168.1.1           ' + engine.state._oldGatewayMAC + '     dynamic  [STALE — unreachable]\n';
            } else if (engine.state._flagRevealed && NT006Config._getScenario(engine)?.id === 'stale_arp') {
                const fv = await engine.requestFlagText('stale_arp');
                output += '  192.168.1.1           ' + engine.state._newGatewayMAC + '     dynamic\n';
                output += '\n  ARP Cache Recovery Token: ' + fv + '\n';
            } else if (net.gateway && NT006Config._sameSubnet(net.ip, net.gateway, net.subnet)) {
                output += '  ' + net.gateway + '       00-1a-2b-3c-4d-01     dynamic\n';
            }
            if (engine.state._duplicateIP) {
                output += '  ' + net.ip + '          ' + engine.state._conflictMAC + '     dynamic  [CONFLICT]\n';
            }
            if (engine.state._dhcpOverlap) {
                output += '  ' + engine.state._printerIP + '       ' + engine.state._printerMAC + '     dynamic  [CONFLICT — printer]\n';
            }
            output += '  224.0.0.22            01-00-5e-00-00-16     static\n  255.255.255.255       ff-ff-ff-ff-ff-ff     static';
            return output;
        },

        netsh: function(args, term, engine) {
            const gate = NT006Config._requireScenario(engine); if (gate) return gate;
            const net = engine.state._networkConfig; const line = args.join(' '); const lower = line.toLowerCase();
            if (/interface\s+ip\s+set\s+address/i.test(lower)) {
                const match = line.match(/static\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)/i);
                if (match) {
                    net.dhcp=false; net.ip=match[1]; net.subnet=match[2]; net.gateway=match[3];
                    if (engine.state._duplicateIP && match[1]!=='192.168.1.50') {
                        engine.state._duplicateIP=false;
                        if (!engine.state._labComplete) { engine.state._labComplete=true; engine.state._flagRevealed=true; }
                    }
                    engine.save(); return '\nOk.\n';
                }
            }
            if (/interface\s+ip\s+show\s+config/i.test(lower)) {
                return '\nConfiguration for interface "Ethernet0"\n    IP Address: ' + net.ip + '\n    Subnet: ' + net.subnet + '\n    Gateway: ' + (net.gateway||'None') + '\n    DNS: ' + (net.dns1||'None');
            }
            return '\nUsage: netsh interface ip set address "Ethernet0" static <IP> <Subnet> <Gateway>';
        },

        route: function(args, term, engine) { const gate = NT006Config._requireScenario(engine); if (gate) return gate; const net = engine.state._networkConfig; return '\nIPv4 Route Table\n===========================================================================\n  0.0.0.0          0.0.0.0      ' + (net.gateway||'None') + '    ' + net.ip + '     25\n  127.0.0.0        255.0.0.0         On-link         127.0.0.1    331\n==========================================================================='; },
        hostname: function() { return 'WORKSTATION06'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        whoami: function() { return 'WORKSTATION06\\Technician'; },
        getmac: function() { return '\n' + NT006Config._macAddress; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.\n\nDid you mean: ipconfig'; },
        grep: function() { return '\'grep\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'network_settings' && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': NT006Config._openTicket(iconDef, engine); break;
            case 'network_settings': NT006Config._openNetwork(iconDef, engine); break;
            case 'reset_lab': NT006Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        NT006Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) NT006Config._renderTicket(engine, c); else NT006Config._renderPicker(engine, c);
    },

    _renderPicker(engine, c) {
        const previews = ['Wei Chen — "Windows says IP conflict"', 'Pat Kelly — "Network drops every 5 minutes"', 'Jordan Lee — "Got wrong IP, 10.0.0.x"', 'Sam Ortiz — "169.254 address, nothing works"', 'Alex Cruz — "Can\'t reach gateway after switch replacement"'];
        let html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#ef4444; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        NT006Config._scenarios.forEach(function(s,i) {
            html += '<button class="nt006-btn" data-idx="'+i+'" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#ef4444; font-weight:bold;">HD-'+(8500+i)+'</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="nt006Rand" style="padding:10px 28px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        c.innerHTML = html;
        c.querySelectorAll('.nt006-btn').forEach(function(b) { b.addEventListener('click', function() { NT006Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); NT006Config._renderTicket(engine, c); }); });
        document.getElementById('nt006Rand').addEventListener('click', function() { NT006Config._applyScenario(engine, Math.floor(Math.random()*NT006Config._scenarios.length)); NT006Config._renderTicket(engine, c); });
    },

    _renderTicket(engine, c) {
        const s = NT006Config._getScenario(engine);
        const names = ['Wei Chen — Accounting', 'Pat Kelly — Sales', 'Jordan Lee — Marketing', 'Sam Ortiz — HR', 'Alex Cruz — Engineering'];
        c.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#ef4444; font-weight:bold; font-size:1rem;">HELP DESK TICKET #HD-'+(8500+engine.state._scenarioId)+'</span></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBMITTED BY</div><div>'+names[engine.state._scenarioId]+'</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+NT006Config._escHtml(s.ticketSubject)+'</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'+NT006Config._escHtml(s.ticketDetail)+'</div></div>'
            + (s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-radius:4px; padding:12px; color:#ffcc80;">'+NT006Config._escHtml(s.ticketExtra)+'</div></div>':'')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU — Network Technician</div></div>';
    },

    _openNetwork(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT006Config._renderNetwork(engine); return; }
        const c = document.createElement('div'); c.id = 'netContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Network Settings', 'NET', c);
        NT006Config._renderNetwork(engine);
    },

    async _renderNetwork(engine) {
        const c = document.getElementById('netContainer'); if (!c) return;
        const net = engine.state._networkConfig; const s = NT006Config._getScenario(engine);
        const showFlag = engine.state._flagRevealed && s?.id === 'duplicate_static' && !engine.state._duplicateIP;
        const flagVal = showFlag ? await engine.requestFlagText('duplicate_static') : null;

        let html = '<div style="font-size:1rem; font-weight:bold; color:#ef4444; margin-bottom:16px;">Network Settings</div>';
        html += '<div style="margin-bottom:8px;">IP: <input type="text" id="netIP" value="'+net.ip+'" style="padding:4px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; width:150px;"></div>';
        html += '<div style="margin-bottom:8px;">Subnet: <input type="text" id="netSubnet" value="'+net.subnet+'" style="padding:4px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; width:150px;"></div>';
        html += '<div style="margin-bottom:8px;">Gateway: <input type="text" id="netGW" value="'+(net.gateway||'')+'" style="padding:4px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; width:150px;"></div>';
        html += '<div style="margin-bottom:8px;">DNS: <input type="text" id="netDNS" value="'+(net.dns1||'')+'" style="padding:4px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; width:150px;"></div>';
        html += '<button id="netApply" style="padding:8px 24px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; margin-top:8px;">Apply</button>';
        if (showFlag) { html += '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px; margin-top:16px;"><div style="color:#2ecc71; font-weight:bold;">IP Conflict Resolved:</div><div style="color:#c8e6c9;">Recovery token: '+flagVal+'</div></div>'; }
        c.innerHTML = html;

        document.getElementById('netApply').addEventListener('click', function() {
            const newIP = document.getElementById('netIP')?.value || net.ip;
            net.ip = newIP; net.subnet = document.getElementById('netSubnet')?.value || net.subnet;
            net.gateway = document.getElementById('netGW')?.value || net.gateway; net.dns1 = document.getElementById('netDNS')?.value || net.dns1;
            if (engine.state._duplicateIP && newIP !== '192.168.1.50') { engine.state._duplicateIP = false; if (!engine.state._labComplete) { engine.state._labComplete=true; engine.state._flagRevealed=true; } }
            engine.save(); engine.notify('Settings applied.', 'success'); NT006Config._renderNetwork(engine);
        });
    },

    _confirmReset(engine) {
        const o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#e74c3c; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="nt006Y" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="nt006N" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('nt006Y').addEventListener('click', function() { NT006Config._flagRestored=false; NT006Config.hints=NT006Config._defaultHints; engine.reset(); });
        document.getElementById('nt006N').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target===o) o.remove(); });
    },

    _escHtml(str) { const d=document.createElement('div'); d.textContent=str; return d.innerHTML; }
};
