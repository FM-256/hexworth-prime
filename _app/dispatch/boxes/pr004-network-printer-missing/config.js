/* ============================================================
   DISPATCH LAB — Box PR4: Network Printer Missing
   CompTIA A+ Core 2 / Network+ — Network Printer Troubleshooting
   5 scenarios: DHCP lease expired, IP conflict, wrong subnet,
   DNS not resolving, firewall blocking port 9100/631
   ============================================================ */

var PR4Config = {

    title: 'Network Printer Missing',
    subtitle: 'Where Did It Go? — A+ Core 2 / Network+ Printer Connectivity',
    difficulty: 'Intermediate',
    accent: '#e67e22',
    storageKey: 'hexworth_lab_pr4',
    registryId: 'pr004-network-printer-missing',
    trackerKey: 'lab_pr4',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the complaint about the missing network printer.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check printer connectivity', tip: 'Use ping, nslookup, or Print Management to check if the printer is reachable on the network.', trigger: { event: 'window_open', match: { type: 'print_management' }, alt: [{ event: 'command', match: { cmd: 'contains:ping' } }] } },
            { title: 'Diagnose the network issue', tip: 'Use Command Prompt to investigate IP addressing, DNS resolution, firewall rules, or subnet configuration.', trigger: { event: 'command', match: { cmd: 'contains:ping' }, alt: [{ event: 'command', match: { cmd: 'contains:nslookup' } }, { event: 'command', match: { cmd: 'contains:netsh' } }] } },
            { title: 'Apply the fix', tip: 'Update the printer port, resolve the IP conflict, fix DNS, or modify firewall rules.', trigger: { event: 'command', match: { cmd: 'contains:net' }, alt: [{ event: 'window_open', match: { type: 'print_management' } }] } },
            { title: 'Capture the flag', tip: 'After restoring connectivity, find the diagnostic token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'A+ Core 2, Network+',
        mappings: [
            { flagId: 'fixed', objective: '3.1', description: 'Troubleshoot common Windows OS problems', skill: 'Network Printer Connectivity' },
            { flagId: 'fixed', objective: '5.5', description: 'Given a scenario, troubleshoot common network service issues', skill: 'DNS, DHCP, Firewall for Printers' }
        ]
    },

    _printers: [
        { name: 'Ricoh MP C3004', ip: '192.168.1.220', port: 'IP_192.168.1.220', location: 'Executive Suite', type: 'Network', driver: 'Ricoh MP C3004 PCL6', status: 'Ready' },
        { name: 'HP Color LaserJet Pro M454', ip: '192.168.1.225', port: 'IP_192.168.1.225', location: 'Marketing', type: 'Network', driver: 'HP Color LaserJet Pro M454', status: 'Ready' },
        { name: 'Canon imageRUNNER 2525', ip: '192.168.1.230', port: 'IP_192.168.1.230', location: 'Warehouse Office', type: 'Network', driver: 'Canon iR 2525 UFR II', status: 'Ready' }
    ],

    _scenarioFlags: { dhcp_expired: null, ip_conflict: null, wrong_subnet: null, dns_fail: null, firewall_block: null },

    _scenarios: [
        {
            id: 'dhcp_expired',
            name: 'DHCP Lease Expired',
            ticketSubject: 'Ricoh in Executive Suite vanished — shows Offline but it is powered on',
            ticketDetail: 'The Ricoh multifunction in the executive suite shows Offline in Windows. The printer display shows it is ready and connected to the network. I can print a config page from the printer itself and it shows a different IP address than what I expected. This started after a power outage last night.',
            ticketExtra: 'IT Note: The power outage caused the DHCP server to restart. The Ricoh had a reservation at .220 but the DHCP database may have reassigned it. The printer picked up .221 on the new lease. The Windows port is still pointing to .220.',
            affectedPrinter: 0,
            fixDescription: 'Update the printer port to the new DHCP-assigned IP (.221)',
            stateOverrides: { _dhcpExpired: true, _newIp: '192.168.1.221' }
        },
        {
            id: 'ip_conflict',
            name: 'IP Conflict',
            ticketSubject: 'HP in Marketing keeps going offline every few minutes then comes back',
            ticketDetail: 'The HP color printer in marketing keeps flickering between Online and Offline every few minutes. Sometimes I can print and sometimes it says the printer is not available. When it does print, the job takes forever. This has been happening since a new laptop was set up in marketing yesterday.',
            ticketExtra: 'IT Note: Network monitoring detected an IP conflict on 192.168.1.225. Two devices are claiming the same address. The new marketing laptop was manually configured with a static IP that conflicts with the printer.',
            affectedPrinter: 1,
            fixDescription: 'Change the conflicting laptop to DHCP or assign it a different static IP',
            stateOverrides: { _ipConflict: true }
        },
        {
            id: 'wrong_subnet',
            name: 'Wrong Subnet After Network Change',
            ticketSubject: 'Canon in Warehouse Office completely disappeared — not even in device list',
            ticketDetail: 'The Canon printer in the warehouse office is completely gone. It does not appear anywhere in Print Management or the device list. The printer is powered on and the display says it is connected. But nobody in the warehouse can print to it at all. The network team did some switch work this morning.',
            ticketExtra: 'IT Note: The network team moved the warehouse office switch port from VLAN 10 (192.168.1.0/24) to VLAN 20 (192.168.2.0/24) during the switch reconfiguration. The printer picked up a 192.168.2.x address but the workstations are still on 192.168.1.0/24.',
            affectedPrinter: 2,
            fixDescription: 'Move the printer port back to VLAN 10 or add a route/port for the new subnet',
            stateOverrides: { _wrongSubnet: true, _printerSubnetIp: '192.168.2.50' }
        },
        {
            id: 'dns_fail',
            name: 'DNS Hostname Not Resolving',
            ticketSubject: 'Ricoh in Executive Suite — was working by hostname, now times out',
            ticketDetail: 'We have always printed to the Ricoh using its hostname "ricoh-exec" instead of the IP address. It has been working fine for months. Now every print job just sits in the queue and eventually times out. The printer is on and the display says ready. If I type the IP address directly it might work but I do not know the current IP.',
            ticketExtra: 'IT Note: The DNS server was migrated to a new host last night. DNS records for printers may not have been migrated. The A record for "ricoh-exec" is missing from the new DNS server.',
            affectedPrinter: 0,
            fixDescription: 'Re-create the DNS A record for ricoh-exec pointing to 192.168.1.220',
            stateOverrides: { _dnsFail: true }
        },
        {
            id: 'firewall_block',
            name: 'Firewall Blocking Port 9100/631',
            ticketSubject: 'HP in Marketing — just stopped printing after security update',
            ticketDetail: 'The HP color printer in marketing was working perfectly until the security team pushed a firewall update an hour ago. Now nothing prints. Jobs queue up and sit there forever. The printer shows Ready on its display. I can ping it and it responds. But print jobs never arrive at the printer.',
            ticketExtra: 'IT Note: The security team deployed a new Windows Firewall policy via Group Policy. The policy may have blocked outbound traffic on ports 9100 (RAW printing) and 631 (IPP). Verify firewall rules on the workstation.',
            affectedPrinter: 1,
            fixDescription: 'Add firewall exception for outbound ports 9100 and 631',
            stateOverrides: { _firewallBlocked: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Start with ping to check basic connectivity to the printer IP.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Network printer issues often involve DHCP, DNS, IP conflicts, VLANs, or firewalls.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use nslookup, arp -a, netsh, and ipconfig to investigate the network layer.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after you restore printer connectivity.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        dhcp_expired: [
            { id: 'hint1', text: 'Ping the printer IP .220 — does it respond? If not, the IP may have changed.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The DHCP server restarted after a power outage. The printer may have a new IP. Try pinging nearby addresses.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The printer is now at 192.168.1.221. Update the printer port in Print Management.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Print Management: Printer Properties > Ports > Add Port for 192.168.1.221 and select it.', cost: 150, penalty: -150 }
        ],
        ip_conflict: [
            { id: 'hint1', text: 'Intermittent connectivity often means an IP conflict — two devices with the same address.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Use arp -a to check MAC addresses. If two different MACs map to .225, there is a conflict.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The new marketing laptop has a static IP of .225, same as the printer. Change the laptop to DHCP.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: netsh interface ip set address "Ethernet" dhcp (on the laptop) or change its static IP.', cost: 150, penalty: -150 }
        ],
        wrong_subnet: [
            { id: 'hint1', text: 'The printer vanished completely. Ping .230 — does it respond from your subnet?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The network team moved the switch port to a different VLAN. The printer is on a different subnet now.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The printer is now at 192.168.2.50 (VLAN 20). Your workstation is on 192.168.1.0/24 (VLAN 10). They cannot talk.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Ask the network team to move the port back to VLAN 10, or add a printer port for the cross-subnet IP with routing enabled.', cost: 150, penalty: -150 }
        ],
        dns_fail: [
            { id: 'hint1', text: 'The printer was accessed by hostname "ricoh-exec". Try nslookup ricoh-exec to see if it resolves.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'nslookup fails — the DNS A record is missing after the server migration.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Re-create the DNS A record: ricoh-exec -> 192.168.1.220. Or update the printer port to use the IP directly.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Use the DNS Management tool to add the A record, or change the printer port from hostname to IP.', cost: 150, penalty: -150 }
        ],
        firewall_block: [
            { id: 'hint1', text: 'Ping works but printing does not — this suggests a port/protocol block, not a connectivity issue.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Printing uses port 9100 (RAW) or 631 (IPP). The new firewall policy may have blocked these.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Check firewall rules: netsh advfirewall firewall show rule name=all. Look for blocks on 9100 and 631.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Add exceptions: netsh advfirewall firewall add rule name="Printer-RAW" dir=out action=allow protocol=TCP localport=9100', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !PR4Config._flagRestored) {
            PR4Config._flagRestored = true;
            var s = PR4Config._scenarios[engine.state._scenarioId];
            if (s) PR4Config.hints = PR4Config._scenarioHints[s.id] || PR4Config._defaultHints;
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._dhcpExpired = false; engine.state._ipConflict = false; engine.state._wrongSubnet = false;
        engine.state._dnsFail = false; engine.state._firewallBlocked = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var overrides = PR4Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) engine.state[key] = overrides[key];
        PR4Config._flagRestored = true;
        PR4Config.hints = PR4Config._scenarioHints[PR4Config._scenarios[idx].id] || PR4Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : PR4Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first.'; },
    _getPrinterState(engine, idx) {
        var p = JSON.parse(JSON.stringify(PR4Config._printers[idx]));
        var s = PR4Config._getScenario(engine); if (!s) return p;
        if (s.id === 'dhcp_expired' && idx === 0) p.status = engine.state._dhcpExpired ? 'Offline' : 'Ready';
        if (s.id === 'ip_conflict' && idx === 1) p.status = engine.state._ipConflict ? 'Error - Intermittent' : 'Ready';
        if (s.id === 'wrong_subnet' && idx === 2) p.status = engine.state._wrongSubnet ? 'Offline - Unreachable' : 'Ready';
        if (s.id === 'dns_fail' && idx === 0) p.status = engine.state._dnsFail ? 'Offline - DNS Failure' : 'Ready';
        if (s.id === 'firewall_block' && idx === 1) p.status = engine.state._firewallBlocked ? 'Error - Jobs Queued' : 'Ready';
        return p;
    },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['American Megatrends UEFI BIOS v2.20', 'Memory Test: 16384 MB OK', 'Boot device: NVMe0', 'Loading Windows Boot Manager...'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'print_management', label: 'Print\nManagement', icon: 'PRT', app: 'print_management' },
        { id: 'network', label: 'Network\nSettings', icon: 'NET', app: 'network_settings' },
        { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
        { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
        { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
    ] },
    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Start by pinging the printer IP address.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Network printer issues: DHCP, DNS, IP conflicts, VLANs, firewalls.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use nslookup, arp, netsh, and ipconfig for diagnosis.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after restoring connectivity.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'Network printers vanish for different reasons — IP changes, conflicts, VLAN moves, DNS failures, and firewall blocks. Track down the cause.', scenario: 'Each scenario simulates a different network-layer failure that makes a printer unreachable.', outro: 'Printer back online. Network connectivity restored through systematic troubleshooting.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the ticket and check connectivity.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the network issue — DHCP, IP conflict, subnet, DNS, or firewall.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Fix the network issue.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm the printer is reachable and locate the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        ping: function(args, term, engine) {
            var gate = PR4Config._requireScenario(engine); if (gate) return gate;
            if (!args.length) return '\nUsage: ping target';
            var t = args[args.length - 1]; var s = PR4Config._getScenario(engine);
            if (t === '127.0.0.1' || t === 'localhost') return '\nPinging 127.0.0.1 with 32 bytes of data:\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\n\nPackets: Sent = 4, Received = 4, Lost = 0';
            if (t === '192.168.1.220') {
                if (s && s.id === 'dhcp_expired' && engine.state._dhcpExpired) return '\nPinging 192.168.1.220 with 32 bytes of data:\nRequest timed out.\nRequest timed out.\n\nPackets: Sent = 4, Received = 0, Lost = 4 (100% loss)';
                return '\nPinging 192.168.1.220 with 32 bytes of data:\nReply from 192.168.1.220: bytes=32 time=2ms TTL=64\n\nPackets: Sent = 4, Received = 4, Lost = 0';
            }
            if (t === '192.168.1.221') {
                if (s && s.id === 'dhcp_expired') {
                    if (!engine.state._flagRevealed) { engine.state._flagRevealed = true; engine.state._labComplete = true; engine.state._dhcpExpired = false; engine.save(); setTimeout(function() { engine.notify('Printer found at .221! Update the printer port. Check Print Management for the token.', 'success'); }, 400); }
                    return '\nPinging 192.168.1.221 with 32 bytes of data:\nReply from 192.168.1.221: bytes=32 time=3ms TTL=64\n\nPackets: Sent = 4, Received = 4, Lost = 0\n\n  [Ricoh MP C3004 responding at new address]';
                }
                return '\nRequest timed out.\nPackets: Sent = 4, Received = 0, Lost = 4';
            }
            if (t === '192.168.1.225') {
                if (s && s.id === 'ip_conflict' && engine.state._ipConflict) return '\nPinging 192.168.1.225 with 32 bytes of data:\nReply from 192.168.1.225: bytes=32 time=1ms TTL=64\nRequest timed out.\nReply from 192.168.1.225: bytes=32 time=45ms TTL=128\nRequest timed out.\n\nPackets: Sent = 4, Received = 2, Lost = 2 (50% loss)\n\nNote: Inconsistent responses suggest an IP address conflict.';
                return '\nPinging 192.168.1.225 with 32 bytes of data:\nReply from 192.168.1.225: bytes=32 time=2ms TTL=64\n\nPackets: Sent = 4, Received = 4, Lost = 0';
            }
            if (t === '192.168.1.230') {
                if (s && s.id === 'wrong_subnet' && engine.state._wrongSubnet) return '\nPinging 192.168.1.230 with 32 bytes of data:\nRequest timed out.\nRequest timed out.\n\nPackets: Sent = 4, Received = 0, Lost = 4 (100% loss)';
                return '\nPinging 192.168.1.230 with 32 bytes of data:\nReply from 192.168.1.230: bytes=32 time=2ms TTL=64\n\nPackets: Sent = 4, Received = 4, Lost = 0';
            }
            if (t === '192.168.2.50') {
                if (s && s.id === 'wrong_subnet') return '\nPinging 192.168.2.50 with 32 bytes of data:\nReply from 192.168.1.1: Destination host unreachable.\n\nPackets: Sent = 4, Received = 0, Lost = 4\nNote: 192.168.2.50 is on a different subnet. Your gateway does not have a route.';
                return '\nRequest timed out.\nPackets: Sent = 4, Received = 0, Lost = 4';
            }
            if (t === 'ricoh-exec') {
                if (s && s.id === 'dns_fail' && engine.state._dnsFail) return '\nPing request could not find host ricoh-exec. Please check the name and try again.';
                return '\nPinging ricoh-exec [192.168.1.220] with 32 bytes of data:\nReply from 192.168.1.220: bytes=32 time=2ms TTL=64\n\nPackets: Sent = 4, Received = 4, Lost = 0';
            }
            return '\nPing request could not find host ' + t + '. Please check the name and try again.';
        },

        nslookup: function(args, term, engine) {
            var gate = PR4Config._requireScenario(engine); if (gate) return gate;
            if (!args.length) return '\nUsage: nslookup hostname';
            var s = PR4Config._getScenario(engine);
            if (args[0].toLowerCase() === 'ricoh-exec') {
                if (s && s.id === 'dns_fail' && engine.state._dnsFail) return '\nServer:  dc01.corp.local\nAddress:  192.168.1.10\n\n*** dc01.corp.local can\'t find ricoh-exec: Non-existent domain';
                return '\nServer:  dc01.corp.local\nAddress:  192.168.1.10\n\nName:    ricoh-exec.corp.local\nAddress:  192.168.1.220';
            }
            return '\n*** Unknown can\'t find ' + args[0] + ': Non-existent domain';
        },

        'arp': function(args, term, engine) {
            var gate = PR4Config._requireScenario(engine); if (gate) return gate;
            var s = PR4Config._getScenario(engine);
            if (args[0] === '-a') {
                var out = '\nInterface: 192.168.1.50 --- 0xb\n  Internet Address      Physical Address      Type\n';
                out += '  192.168.1.1           00-1a-2b-3c-4d-01     dynamic\n';
                out += '  192.168.1.220         00-1a-2b-3c-4d-20     dynamic\n';
                if (s && s.id === 'ip_conflict' && engine.state._ipConflict) {
                    out += '  192.168.1.225         00-1a-2b-3c-4d-25     dynamic   <-- Printer\n';
                    out += '  192.168.1.225         aa-bb-cc-dd-ee-ff     dynamic   <-- CONFLICT (Laptop)\n';
                } else {
                    out += '  192.168.1.225         00-1a-2b-3c-4d-25     dynamic\n';
                }
                out += '  192.168.1.230         00-1a-2b-3c-4d-30     dynamic\n';
                return out;
            }
            return '\nUsage: arp -a';
        },

        netsh: function(args, term, engine) {
            var gate = PR4Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var s = PR4Config._getScenario(engine);

            if (joined.includes('advfirewall') && joined.includes('show rule')) {
                if (s && s.id === 'firewall_block' && engine.state._firewallBlocked) {
                    return '\nRule Name:                            Block-Outbound-9100\nDirection:                            Out\nAction:                               Block\nProtocol:                             TCP\nRemotePort:                           9100\n\nRule Name:                            Block-Outbound-631\nDirection:                            Out\nAction:                               Block\nProtocol:                             TCP\nRemotePort:                           631\n\n... (additional rules omitted)';
                }
                return '\n(No blocking rules found for printer ports)';
            }

            if (joined.includes('advfirewall') && joined.includes('add rule') && joined.includes('9100')) {
                if (s && s.id === 'firewall_block' && engine.state._firewallBlocked) {
                    engine.state._firewallBlocked = false; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                    setTimeout(function() { engine.notify('Firewall rules updated. Printer ports unblocked. Check Print Management for the token.', 'success'); }, 400);
                    return '\nOk.\nRule added successfully.';
                }
                return '\nOk.';
            }

            if (joined.includes('advfirewall') && joined.includes('delete rule') && (joined.includes('9100') || joined.includes('block-outbound'))) {
                if (s && s.id === 'firewall_block' && engine.state._firewallBlocked) {
                    engine.state._firewallBlocked = false; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                    setTimeout(function() { engine.notify('Blocking rules removed. Printer connectivity restored.', 'success'); }, 400);
                    return '\nDeleted 2 rule(s).\nOk.';
                }
                return '\nNo rules match the specified criteria.';
            }

            if (joined.includes('interface') && joined.includes('set address') && joined.includes('dhcp')) {
                if (s && s.id === 'ip_conflict') {
                    engine.state._ipConflict = false; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                    setTimeout(function() { engine.notify('Laptop switched to DHCP. IP conflict resolved. Printer connectivity restored.', 'success'); }, 400);
                    return '\nDHCP is already enabled on this interface.\n(Simulated: conflicting laptop switched to DHCP — conflict resolved)';
                }
                return '\nOk.';
            }

            return '\nUsage: netsh advfirewall firewall show rule name=all\n       netsh interface ip set address "Ethernet" dhcp';
        },

        ipconfig: function(args, term, engine) {
            var gate = PR4Config._requireScenario(engine); if (gate) return gate;
            return '\nWindows IP Configuration\n\nEthernet adapter Ethernet:\n   IPv4 Address. . . . . . . : 192.168.1.50\n   Subnet Mask . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . : 192.168.1.10';
        },

        'get-printer': function(args, term, engine) {
            var gate = PR4Config._requireScenario(engine); if (gate) return gate;
            var out = '\n'; PR4Config._printers.forEach(function(p, i) { var st = PR4Config._getPrinterState(engine, i); out += st.name + '  |  ' + st.port + '  |  ' + st.status + '\n'; }); return out;
        },

        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        dir: function() { return ' Directory of C:\\Users\\Technician\n               0 File(s)'; },
        systeminfo: function() { return '\nHost Name: HELPDESK01\nOS: Windows 10 Pro 10.0.19045'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized as an internal or external command.'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command.'; }
    },

    onAppLaunch(iconDef, engine) {
        var req = ['print_management', 'network_settings'];
        if (req.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': PR4Config._openTicket(iconDef, engine); break;
            case 'print_management': PR4Config._openPrintManagement(iconDef, engine); break;
            case 'network_settings': PR4Config._openNetworkSettings(iconDef, engine); break;
            case 'reset_lab': PR4Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        PR4Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) PR4Config._renderTicket(engine, c); else PR4Config._renderScenarioPicker(engine, c);
    },

    _renderScenarioPicker(engine, container) {
        var previews = ['Patricia Vance — "Ricoh vanished after power outage"', 'Alex Kim — "HP keeps going offline every few minutes"', 'Ben Torres — "Canon completely disappeared from device list"', 'Patricia Vance — "Ricoh hostname stopped resolving"', 'Alex Kim — "HP stopped printing after security update"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#e67e22; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        PR4Config._scenarios.forEach(function(s, i) { html += '<button class="pr4-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="color:#e67e22; font-weight:bold;">PR-' + (4000 + i) + '</div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="pr4RandBtn" style="padding:10px 28px; background:#e67e22; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.pr4-btn').forEach(function(b) { b.addEventListener('click', function() { PR4Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); PR4Config._renderTicket(engine, container); }); });
        document.getElementById('pr4RandBtn').addEventListener('click', function() { PR4Config._applyScenario(engine, Math.floor(Math.random() * 5)); PR4Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = PR4Config._getScenario(engine);
        var subs = ['Patricia Vance — Executive Suite', 'Alex Kim — Marketing Dept', 'Ben Torres — Warehouse Office', 'Patricia Vance — Executive Suite', 'Alex Kim — Marketing Dept'];
        var pr = PR4Config._printers[sc.affectedPrinter];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#e67e22; font-weight:bold;">TICKET #PR-' + (4000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">FROM</div><div>' + subs[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">PRINTER</div><div style="color:#e67e22; font-weight:bold;">' + pr.name + ' (' + pr.location + ')</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + PR4Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + PR4Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); padding:12px; border-radius:4px; color:#ffcc80;">' + PR4Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div></div>';
    },

    _openPrintManagement(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); PR4Config._renderPM(engine); return; }
        var c = document.createElement('div'); c.id = 'pmContainer';
        c.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Print Management', 'PRT', c); PR4Config._renderPM(engine);
    },

    _renderPM(engine) {
        var c = document.getElementById('pmContainer'); if (!c) return;
        var html = '<div style="font-weight:bold; color:#e67e22; margin-bottom:12px;">Printers</div>';
        PR4Config._printers.forEach(function(p, i) {
            var st = PR4Config._getPrinterState(engine, i); var err = st.status.includes('Offline') || st.status.includes('Error');
            html += '<div style="padding:8px; margin-bottom:4px; background:' + (err ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (err ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;"><span style="font-weight:bold;">' + st.name + '</span> | ' + st.port + ' | <span style="color:' + (err ? '#e74c3c' : '#2ecc71') + ';">' + st.status + '</span></div>';
        });
        if (engine.state._flagRevealed) {
            var sc = PR4Config._getScenario(engine); var flagElId = 'pr4-flag-' + sc.id;
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Connectivity Restored</div><div id="' + flagElId + '" style="margin-top:4px;">Token: loading...</div></div>';
            setTimeout(function() { BoxEngine.requestFlagText(sc.id).then(function(f) { var el = document.getElementById(flagElId); if (el) el.textContent = 'Token: ' + (f || 'Flag unavailable'); }); }, 0);
        }
        c.innerHTML = html;
    },

    _openNetworkSettings(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Network Settings', 'NET', c);
        c.innerHTML = '<div style="font-weight:bold; color:#e67e22; margin-bottom:16px;">Network Settings</div>'
            + '<div style="padding:12px; border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div style="font-weight:bold;">Ethernet0</div><div style="color:#2ecc71; font-size:0.75rem;">Connected</div><div style="color:#aaa; font-size:0.75rem; margin-top:8px;">IPv4: 192.168.1.50<br>Subnet: 255.255.255.0<br>Gateway: 192.168.1.1<br>DNS: 192.168.1.10</div></div>';
    },

    _confirmReset(engine) {
        var o = document.createElement('div');
        o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#e74c3c; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center; margin-top:16px;"><button id="pr4RC" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="pr4CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('pr4RC').addEventListener('click', function() { PR4Config._flagRestored = false; PR4Config.hints = PR4Config._defaultHints; engine.reset(); });
        document.getElementById('pr4CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
