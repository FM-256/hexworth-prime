/* ============================================================
   ARENA LAB — Box NT007: DNS Resolution Failure
   Network Troubleshooting — Network+ N10-009
   5 scenarios: wrong DNS server, missing A record, stale cache,
   DNSSEC validation failure, forward zone missing
   ============================================================ */

const NT007Config = {

    title: 'DNS Resolution Failure',
    subtitle: 'DNS Troubleshooting — Network+',
    difficulty: 'Intermediate',
    accent: '#3b82f6',
    storageKey: 'hexworth_lab_nt007',
    registryId: 'nt007-dns-failure',
    trackerKey: 'lab_nt007',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the user complaint about DNS issues.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check DNS configuration', tip: 'Run ipconfig /all and nslookup to see DNS server settings.', trigger: { event: 'command', match: { cmd: 'contains:nslookup' } } },
            { title: 'Test DNS resolution', tip: 'Try resolving different domains. Compare nslookup results with direct IP pings.', trigger: { event: 'command', match: { cmd: 'contains:ping' } } },
            { title: 'Fix DNS', tip: 'Use netsh, ipconfig /flushdns, or DNS Manager to resolve the issue.', trigger: { event: 'command', match: { cmd: 'contains:netsh' }, alt: [{ event: 'window_open', match: { type: 'dns_manager' } }] } },
            { title: 'Verify resolution', tip: 'Run nslookup again to confirm DNS works. Find the flag.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'N10-009',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Explain the use and purpose of network services', skill: 'DNS, A records, CNAME, DNSSEC' },
            { flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network connectivity issues', skill: 'DNS Configuration and Resolution' },
            { flagId: 'fixed', objective: '5.2', description: 'Use the appropriate tool', skill: 'nslookup, ipconfig /flushdns, DNS Manager' }
        ]
    },

    _scenarioFlags: { wrong_dns: null, missing_record: null, stale_cache: null, dnssec_fail: null, forward_zone: null },

    _scenarios: [
        {
            id: 'wrong_dns',
            name: 'Wrong DNS Server',
            ticketSubject: 'No websites load — all say server not found',
            ticketDetail: 'I can\'t reach any website. Every single one says "server not found." I can ping IP addresses fine though — 8.8.8.8 works, 1.1.1.1 works. Just names don\'t work. This started after the new network setup.',
            ticketExtra: 'IT Note: During network migration, this workstation\'s DNS was pointed to 192.168.1.99, which is not a DNS server. It should use 192.168.1.2 (internal DNS) or 8.8.8.8 (fallback).',
            fixDescription: 'Change DNS server to 192.168.1.2 or 8.8.8.8',
            brokenConfig: { adapter: 'enabled', dhcp: false, ip: '192.168.1.65', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '192.168.1.99', dns2: '' },
            stateOverrides: { _wrongDNS: true },
            flagLocation: 'nslookup output after DNS fix'
        },
        {
            id: 'missing_record',
            name: 'Missing A Record',
            ticketSubject: 'Can\'t reach company portal — "host not found"',
            ticketDetail: 'I can reach Google, Bing, and everything else on the internet, but when I try to access portal.company.local it says "host not found." Everyone else can reach it. I was able to reach it yesterday.',
            ticketExtra: 'IT Note: The internal DNS server (192.168.1.2) was rebuilt last night. Some internal zone records may not have been fully restored. The portal server is at 192.168.1.10.',
            fixDescription: 'Add the missing A record for portal.company.local in DNS Manager',
            brokenConfig: { adapter: 'enabled', dhcp: false, ip: '192.168.1.65', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '192.168.1.2', dns2: '8.8.8.8' },
            stateOverrides: { _missingRecord: true },
            flagLocation: 'DNS Manager after adding the A record'
        },
        {
            id: 'stale_cache',
            name: 'Stale DNS Cache',
            ticketSubject: 'Company website goes to wrong server after migration',
            ticketDetail: 'Our company website was migrated to a new server last night. When I go to www.company.com it still shows the old "under maintenance" page. Other people see the new site. I\'ve cleared my browser cache multiple times but it doesn\'t help.',
            ticketExtra: 'IT Note: The website was migrated from 203.0.113.10 (old) to 198.51.100.20 (new). DNS records have been updated but clients with cached entries will continue resolving to the old IP until the cache expires or is flushed.',
            fixDescription: 'Flush the DNS cache with ipconfig /flushdns',
            brokenConfig: { adapter: 'enabled', dhcp: false, ip: '192.168.1.65', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4' },
            stateOverrides: { _staleCache: true, _cachedIP: '203.0.113.10', _correctIP: '198.51.100.20' },
            flagLocation: 'ipconfig /displaydns after flushing cache'
        },
        {
            id: 'dnssec_fail',
            name: 'DNSSEC Validation Failure',
            ticketSubject: 'Specific websites fail with SERVFAIL error',
            ticketDetail: 'Some websites work fine but others fail with a "SERVFAIL" error. It\'s not random — the same sites always fail and the same sites always work. The failing sites include our partner portal and some government sites. Regular sites like Google work fine.',
            ticketExtra: 'IT Note: Our DNS resolver has strict DNSSEC validation enabled. The partner portal\'s DNSSEC signatures expired and haven\'t been renewed. Temporarily disable DNSSEC validation on the resolver, or use a non-validating forwarder for those domains.',
            fixDescription: 'Disable strict DNSSEC validation or add a forwarding exception in DNS Manager',
            brokenConfig: { adapter: 'enabled', dhcp: false, ip: '192.168.1.65', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '192.168.1.2', dns2: '' },
            stateOverrides: { _dnssecFail: true },
            flagLocation: 'DNS Manager after disabling DNSSEC validation'
        },
        {
            id: 'forward_zone',
            name: 'Forward Zone Missing',
            ticketSubject: 'Internal .local domains don\'t resolve but internet works',
            ticketDetail: 'I can reach any internet website but none of our internal sites work. fileserver.corp.local, intranet.corp.local, mail.corp.local — all say host not found. I can ping their IPs directly. We have about 20 internal servers I need to access by name.',
            ticketExtra: 'IT Note: The forward lookup zone for "corp.local" was accidentally deleted during DNS server maintenance. The zone needs to be recreated and records re-added, or this workstation can use the secondary DNS that still has the zone.',
            fixDescription: 'Add secondary DNS 192.168.1.3 which still has the corp.local zone, or recreate in DNS Manager',
            brokenConfig: { adapter: 'enabled', dhcp: false, ip: '192.168.1.65', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '192.168.1.2', dns2: '' },
            stateOverrides: { _forwardZoneMissing: true },
            flagLocation: 'nslookup output after DNS fix'
        }
    ],

    _correctNetwork: { adapter: 'enabled', ip: '192.168.1.65', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '192.168.1.2', dns2: '8.8.8.8' },
    _validDNS: ['8.8.8.8', '8.8.4.4', '1.1.1.1', '192.168.1.2', '192.168.1.3'],
    _knownDomains: { 'google.com': '142.250.80.46', 'microsoft.com': '20.70.246.20', 'bing.com': '204.79.197.200', 'www.company.com': '198.51.100.20' },
    _internalHosts: { 'portal.company.local': '192.168.1.10', 'fileserver.corp.local': '192.168.1.20', 'intranet.corp.local': '192.168.1.21', 'mail.corp.local': '192.168.1.22', 'dc1.corp.local': '192.168.1.2' },
    _dnssecDomains: ['partner.secure.gov', 'portal.partner.net'],
    _macAddress: '00-1A-2B-3C-4D-64',
    _adapterName: 'Ethernet0',

    _defaultHints: [
        { id: 'hint1', text: 'Run ipconfig /all to check DNS settings, then nslookup to test resolution.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'DNS issues: wrong server, missing records, stale cache, DNSSEC, or missing zones.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Fix with netsh (DNS change), ipconfig /flushdns, or DNS Manager.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears in the tool used to fix DNS.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        wrong_dns: [
            { id: 'hint1', text: 'ipconfig /all shows DNS is 192.168.1.99. Try pinging it — it doesn\'t respond. That\'s not a DNS server.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The DNS server is misconfigured. It should be 192.168.1.2 (internal) or 8.8.8.8 (public).', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'netsh interface ip set dns "Ethernet0" static 8.8.8.8', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After fixing DNS, run nslookup google.com for the flag.', cost: 50, penalty: -50 }
        ],
        missing_record: [
            { id: 'hint1', text: 'nslookup google.com works, but nslookup portal.company.local fails. The DNS server works for internet but is missing internal records.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The DNS server was rebuilt. The A record for portal.company.local (192.168.1.10) is missing.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open DNS Manager and add the missing A record.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After adding the record, the flag appears in DNS Manager.', cost: 50, penalty: -50 }
        ],
        stale_cache: [
            { id: 'hint1', text: 'Run ipconfig /displaydns. Find www.company.com — it resolves to 203.0.113.10 (the old IP).', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The DNS cache has a stale entry. The real IP is now 198.51.100.20 but the cache still has the old one.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Run ipconfig /flushdns to clear the stale cache entry.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After flushing, run ipconfig /displaydns — the flag appears in the refreshed cache.', cost: 50, penalty: -50 }
        ],
        dnssec_fail: [
            { id: 'hint1', text: 'nslookup partner.secure.gov returns SERVFAIL. But nslookup google.com works. It\'s domain-specific.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'DNSSEC validation is rejecting domains with expired signatures. The partner site\'s DNSSEC is broken.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open DNS Manager and disable strict DNSSEC validation temporarily.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After disabling DNSSEC validation, the flag appears in DNS Manager.', cost: 50, penalty: -50 }
        ],
        forward_zone: [
            { id: 'hint1', text: 'nslookup google.com works. nslookup fileserver.corp.local fails. Internal zone is broken.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The corp.local zone was deleted from the primary DNS. The secondary DNS (192.168.1.3) still has it.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Add 192.168.1.3 as secondary DNS:\n  netsh interface ip add dns "Ethernet0" 192.168.1.3 index=2', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After adding secondary DNS, run nslookup fileserver.corp.local for the flag.', cost: 50, penalty: -50 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !NT007Config._flagRestored) { NT007Config._flagRestored = true; const s = NT007Config._scenarios[engine.state._scenarioId]; if (s) NT007Config.hints = NT007Config._scenarioHints[s.id] || NT007Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._networkConfig = JSON.parse(JSON.stringify(NT007Config._scenarios[idx].brokenConfig)); engine.state._scenarioSelected = true; const o = NT007Config._scenarios[idx].stateOverrides || {}; for (const k in o) engine.state[k] = o[k]; NT007Config._flagRestored = true; NT007Config.hints = NT007Config._scenarioHints[NT007Config._scenarios[idx].id] || NT007Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : NT007Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen Help Desk Ticket first.'; },
    _isIP(str) { return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(str); },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB OK', 'Loading Windows...'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: {
        icons: [
            { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
            { id: 'network', label: 'Network\nSettings', icon: 'NET', app: 'network_settings' },
            { id: 'dnsmgr', label: 'DNS\nManager', icon: 'DNS', app: 'dns_manager' },
            { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
            { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' },
            { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
            { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
        ]
    },
    terminal: { user: 'Technician', hostname: 'WORKSTATION07', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045]\n(c) Microsoft Corporation.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: null, points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [{ id: 'hint1', text: 'Run nslookup and ipconfig /all.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'DNS: wrong server, missing records, stale cache, DNSSEC, or zones.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Fix with netsh, flushdns, or DNS Manager.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Flag in the tool you used.', cost: 50, penalty: -50 }],
    lore: { intro: 'A user is experiencing DNS resolution failures. Diagnose the specific DNS issue and restore name resolution.', scenario: 'DNS is broken in a specific way. Use nslookup and DNS tools to identify and fix the problem.', outro: 'DNS resolution restored.' },
    phases: [
        { id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false, description: 'Read ticket, check DNS config.' },
        { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true, description: 'Identify DNS failure.' },
        { id: 'repair', name: 'Repair', requiredFlags: [], unlocks: ['verify'], locked: true, description: 'Fix DNS.' },
        { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true, description: 'Confirm and find flag.' }
    ],

    commands: {
        ipconfig: function(args, term, engine) {
            const gate = NT007Config._requireScenario(engine); if (gate) return gate;
            const net = engine.state._networkConfig; const joined = args.join(' ').toLowerCase();
            if (joined.includes('/all')) return '\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   IPv4 Address. . . . . . . . . . . : ' + net.ip + '\n   Subnet Mask . . . . . . . . . . . : ' + net.subnet + '\n   Default Gateway . . . . . . . . . : ' + net.gateway + '\n   DNS Servers . . . . . . . . . . . : ' + (net.dns1||'') + (net.dns2?'\n                                        '+net.dns2:'');
            if (joined.includes('/flushdns')) {
                if (engine.state._staleCache) {
                    engine.state._staleCache = false;
                    if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; }
                    engine.save();
                    return '\nWindows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.\n\n  [Stale entry for www.company.com removed — will re-resolve to new IP]';
                }
                return '\nSuccessfully flushed the DNS Resolver Cache.';
            }
            if (joined.includes('/displaydns')) {
                if (engine.state._staleCache) return '\nWindows IP Configuration\n\n    www.company.com\n    ----------------------------------------\n    Record Name . . . . . : www.company.com\n    A (Host) Record . . . : 203.0.113.10\n    [STALE — server migrated to 198.51.100.20]';
                if (engine.state._flagRevealed && NT007Config._getScenario(engine)?.id === 'stale_cache') {
                    return '\nWindows IP Configuration\n\n    www.company.com\n    ----------------------------------------\n    Record Name . . . . . : www.company.com\n    A (Host) Record . . . : 198.51.100.20\n    [CORRECT — cache refreshed]';
                }
                return '\nWindows IP Configuration\n\n    localhost\n    A (Host) Record . . . : 127.0.0.1';
            }
            if (joined.includes('/?')) return '\nUSAGE: ipconfig [/all | /flushdns | /displaydns]';
            return '\nEthernet adapter Ethernet0:\n   IPv4 Address: ' + net.ip + '\n   Gateway: ' + net.gateway;
        },

        nslookup: async function(args, term, engine) {
            const gate = NT007Config._requireScenario(engine); if (gate) return gate;
            if (!args.length) return '\nUsage: nslookup hostname [server]';
            const net = engine.state._networkConfig;
            const target = args[0]; const server = args[1] || net.dns1;

            // Wrong DNS scenario
            if (engine.state._wrongDNS && server === '192.168.1.99') return '\nDNS request timed out.\nServer:  UnKnown\nAddress:  192.168.1.99\n\n*** 192.168.1.99 is not a DNS server';

            // Missing record
            if (engine.state._missingRecord && NT007Config._internalHosts[target.toLowerCase()] && target.toLowerCase() === 'portal.company.local') {
                return '\nServer:  dns.internal\nAddress:  192.168.1.2\n\n*** dns.internal can\'t find portal.company.local: Non-existent domain\n\n  [A record for portal.company.local is missing from the zone]';
            }

            // Stale cache
            if (engine.state._staleCache && target.toLowerCase() === 'www.company.com') {
                return '\nServer:  dns.google\nAddress:  8.8.8.8\n\nName:    www.company.com\nAddress:  203.0.113.10\n\n  [Note: Response served from local cache — may be stale]';
            }

            // DNSSEC failure
            if (engine.state._dnssecFail && NT007Config._dnssecDomains.includes(target.toLowerCase())) {
                return '\nServer:  dns.internal\nAddress:  192.168.1.2\n\n*** dns.internal can\'t find ' + target + ': Server failed\n\n  [SERVFAIL — DNSSEC validation failed: signature expired]';
            }

            // Forward zone missing
            if (engine.state._forwardZoneMissing && target.toLowerCase().endsWith('.corp.local') && server === '192.168.1.2') {
                return '\nServer:  dns.internal\nAddress:  192.168.1.2\n\n*** dns.internal can\'t find ' + target + ': Non-existent domain\n\n  [Forward lookup zone "corp.local" not found on this server]';
            }

            // Forward zone: secondary DNS works
            if (target.toLowerCase().endsWith('.corp.local') && (server === '192.168.1.3' || net.dns2 === '192.168.1.3')) {
                const ip = NT007Config._internalHosts[target.toLowerCase()] || '192.168.1.99';
                let output = '\nServer:  dns2.internal\nAddress:  192.168.1.3\n\nName:    ' + target + '\nAddress:  ' + ip;
                if (engine.state._flagRevealed && NT007Config._getScenario(engine)?.id === 'forward_zone') {
                    const fv = await engine.requestFlagText('forward_zone');
                    output += '\n\n  Zone restored — Recovery token: ' + fv;
                }
                return output;
            }

            // Internal hosts
            const internalIP = NT007Config._internalHosts[target.toLowerCase()];
            if (internalIP && !engine.state._missingRecord && !engine.state._forwardZoneMissing) {
                return '\nServer:  dns.internal\nAddress:  192.168.1.2\n\nName:    ' + target + '\nAddress:  ' + internalIP;
            }

            // External domains
            const resolved = NT007Config._knownDomains[target.toLowerCase()] || '93.184.216.34';
            const sName = server === '8.8.8.8' ? 'dns.google' : server === '192.168.1.2' ? 'dns.internal' : server;
            let output = '\nServer:  ' + sName + '\nAddress:  ' + server + '\n\nName:    ' + target + '\nAddress:  ' + resolved;

            if (engine.state._flagRevealed && NT007Config._getScenario(engine)?.id === 'wrong_dns' && NT007Config._validDNS.includes(server)) {
                const fv = await engine.requestFlagText('wrong_dns');
                output += '\n\n  DNS restored — Recovery token: ' + fv;
            }

            return output;
        },

        ping: function(args, term, engine) {
            const gate = NT007Config._requireScenario(engine); if (gate) return gate;
            if (!args.length) return '\nUsage: ping target';
            let target = null; for (const a of args) { if (!a.startsWith('-')) { target = a; break; } }
            if (!target) return 'Bad parameter.';
            const net = engine.state._networkConfig;
            if (target === '127.0.0.1') return '\nPinging 127.0.0.1 with 32 bytes of data:\nReply from 127.0.0.1: bytes=32 time=<1ms TTL=128\nReply from 127.0.0.1: bytes=32 time=<1ms TTL=128\nReply from 127.0.0.1: bytes=32 time=<1ms TTL=128\nReply from 127.0.0.1: bytes=32 time=<1ms TTL=128\n\nPing statistics for 127.0.0.1:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
            if (NT007Config._isIP(target)) {
                const ms = Math.floor(Math.random()*20)+5;
                return '\nPinging ' + target + ' with 32 bytes of data:\nReply from ' + target + ': bytes=32 time=' + ms + 'ms TTL=117\nReply from ' + target + ': bytes=32 time=' + (ms+2) + 'ms TTL=117\nReply from ' + target + ': bytes=32 time=' + (ms+1) + 'ms TTL=117\nReply from ' + target + ': bytes=32 time=' + (ms+3) + 'ms TTL=117\n\nPing statistics for ' + target + ':\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
            }
            // Domain — check if DNS is working
            if (engine.state._wrongDNS && net.dns1 === '192.168.1.99') return '\nPing request could not find host ' + target + '. Please check the name and try again.';
            if (engine.state._missingRecord && target.toLowerCase() === 'portal.company.local') return '\nPing request could not find host ' + target + '. Please check the name and try again.';
            if (engine.state._forwardZoneMissing && target.toLowerCase().endsWith('.corp.local') && net.dns2 !== '192.168.1.3') return '\nPing request could not find host ' + target + '. Please check the name and try again.';
            if (engine.state._dnssecFail && NT007Config._dnssecDomains.includes(target.toLowerCase())) return '\nPing request could not find host ' + target + '. Please check the name and try again.';
            const resolved = NT007Config._knownDomains[target.toLowerCase()] || NT007Config._internalHosts[target.toLowerCase()] || '93.184.216.34';
            const ms = Math.floor(Math.random()*20)+10;
            return '\nPinging ' + target + ' [' + resolved + '] with 32 bytes of data:\nReply from ' + resolved + ': bytes=32 time=' + ms + 'ms TTL=117\nReply from ' + resolved + ': bytes=32 time=' + (ms+2) + 'ms TTL=117\nReply from ' + resolved + ': bytes=32 time=' + (ms+1) + 'ms TTL=117\nReply from ' + resolved + ': bytes=32 time=' + (ms+3) + 'ms TTL=117\n\nPing statistics for ' + resolved + ':\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
        },

        netsh: function(args, term, engine) {
            const gate = NT007Config._requireScenario(engine); if (gate) return gate;
            const net = engine.state._networkConfig; const line = args.join(' '); const lower = line.toLowerCase();
            if (/interface\s+ip\s+set\s+dns/i.test(lower)) {
                const match = line.match(/static\s+(\d+\.\d+\.\d+\.\d+)/i);
                if (match) {
                    net.dns1 = match[1];
                    if (engine.state._wrongDNS && NT007Config._validDNS.includes(match[1])) {
                        engine.state._wrongDNS = false;
                        if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; }
                    }
                    engine.save(); return '\nOk.\n';
                }
            }
            if (/interface\s+ip\s+add\s+dns/i.test(lower)) {
                const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
                if (match) {
                    net.dns2 = match[1];
                    if (engine.state._forwardZoneMissing && match[1] === '192.168.1.3') {
                        engine.state._forwardZoneMissing = false;
                        if (!engine.state._labComplete) { engine.state._labComplete = true; engine.state._flagRevealed = true; }
                    }
                    engine.save(); return '\nOk.\n';
                }
            }
            return '\nUsage: netsh interface ip set dns "Ethernet0" static <DNS>\n       netsh interface ip add dns "Ethernet0" <DNS> index=2';
        },

        hostname: function() { return 'WORKSTATION07'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        whoami: function() { return 'WORKSTATION07\\Technician'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.\nDid you mean: ipconfig'; },
        grep: function() { return '\'grep\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        const req = ['network_settings', 'dns_manager'];
        if (req.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': NT007Config._openTicket(iconDef, engine); break;
            case 'dns_manager': NT007Config._openDNSManager(iconDef, engine); break;
            case 'reset_lab': NT007Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        NT007Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) NT007Config._renderTicket(engine, c); else NT007Config._renderPicker(engine, c);
    },

    _renderPicker(engine, c) {
        const p = ['Lin Wong — "No websites load, DNS not found"', 'Maya Patel — "Can\'t reach company portal"', 'Jake Smith — "Website goes to wrong server"', 'Noor Hassan — "Some sites fail with SERVFAIL"', 'Chris Kim — "Internal .local names don\'t resolve"'];
        let html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3b82f6; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        NT007Config._scenarios.forEach(function(s,i) { html += '<button class="nt007-btn" data-idx="'+i+'" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#3b82f6; font-weight:bold;">HD-'+(8600+i)+'</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">'+p[i]+'</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="nt007Rand" style="padding:10px 28px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        c.innerHTML = html;
        c.querySelectorAll('.nt007-btn').forEach(function(b) { b.addEventListener('click', function() { NT007Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); NT007Config._renderTicket(engine, c); }); });
        document.getElementById('nt007Rand').addEventListener('click', function() { NT007Config._applyScenario(engine, Math.floor(Math.random()*NT007Config._scenarios.length)); NT007Config._renderTicket(engine, c); });
    },

    _renderTicket(engine, c) {
        const s = NT007Config._getScenario(engine);
        const n = ['Lin Wong — IT', 'Maya Patel — Marketing', 'Jake Smith — Design', 'Noor Hassan — Security', 'Chris Kim — Engineering'];
        c.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#3b82f6; font-weight:bold;">HELP DESK TICKET #HD-'+(8600+engine.state._scenarioId)+'</span></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBMITTED BY</div><div>'+n[engine.state._scenarioId]+'</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+NT007Config._escHtml(s.ticketSubject)+'</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'+NT007Config._escHtml(s.ticketDetail)+'</div></div>'
            + (s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-radius:4px; padding:12px; color:#ffcc80;">'+NT007Config._escHtml(s.ticketExtra)+'</div></div>':'')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div></div>';
    },

    _openDNSManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT007Config._renderDNS(engine); return; }
        const c = document.createElement('div'); c.id = 'dnsContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'DNS Manager', 'DNS', c);
        NT007Config._renderDNS(engine);
    },

    async _renderDNS(engine) {
        const c = document.getElementById('dnsContainer'); if (!c) return;
        const s = NT007Config._getScenario(engine);
        const showRecordFlag = engine.state._flagRevealed && s?.id === 'missing_record' && !engine.state._missingRecord;
        const showDNSSECFlag = engine.state._flagRevealed && s?.id === 'dnssec_fail' && !engine.state._dnssecFail;
        const flagVal = (showRecordFlag||showDNSSECFlag) ? await engine.requestFlagText(s.id) : null;

        let html = '<div style="font-size:1rem; font-weight:bold; color:#3b82f6; margin-bottom:16px;">DNS Manager — 192.168.1.2</div>';

        // Missing A record
        if (s?.id === 'missing_record') {
            html += '<div style="border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px; margin-bottom:16px;">'
                + '<div style="font-weight:bold; margin-bottom:8px;">Forward Lookup Zone: company.local</div>'
                + '<div style="font-size:0.75rem; color:#888; margin-bottom:4px;">server.company.local &rarr; 192.168.1.5 (A)</div>'
                + '<div style="font-size:0.75rem; color:#888; margin-bottom:4px;">mail.company.local &rarr; 192.168.1.6 (A)</div>'
                + (engine.state._missingRecord
                    ? '<div style="color:#e74c3c; font-size:0.75rem; margin-top:8px; margin-bottom:8px;">MISSING: portal.company.local (was at 192.168.1.10)</div>'
                    + '<button id="dnsAddRecord" style="padding:6px 20px; background:#3b82f6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Add A Record: portal.company.local &rarr; 192.168.1.10</button>'
                    : '<div style="font-size:0.75rem; color:#2ecc71; margin-bottom:4px;">portal.company.local &rarr; 192.168.1.10 (A) [RESTORED]</div>')
                + '</div>';
        }

        // DNSSEC
        if (s?.id === 'dnssec_fail') {
            html += '<div style="border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px; margin-bottom:16px;">'
                + '<div style="font-weight:bold; margin-bottom:8px;">DNSSEC Validation</div>'
                + '<div style="font-size:0.75rem; margin-bottom:8px;">Status: <span style="color:' + (engine.state._dnssecFail ? '#e74c3c; font-weight:bold;">STRICT (rejecting expired signatures)' : '#2ecc71;">Relaxed (permissive)') + '</span></div>'
                + (engine.state._dnssecFail
                    ? '<div style="font-size:0.75rem; color:#f39c12; margin-bottom:8px;">WARNING: partner.secure.gov and portal.partner.net have expired DNSSEC signatures.</div>'
                    + '<button id="dnssecDisable" style="padding:6px 20px; background:#f39c12; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Set DNSSEC to Permissive</button>'
                    : '')
                + '</div>';
        }

        if (showRecordFlag || showDNSSECFlag) {
            html += '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px; margin-top:16px;"><div style="color:#2ecc71; font-weight:bold;">DNS Issue Resolved:</div><div style="color:#c8e6c9;">Recovery token: '+flagVal+'</div></div>';
        }

        if (!s || (s.id !== 'missing_record' && s.id !== 'dnssec_fail')) {
            html += '<div style="color:#888; text-align:center; padding:20px;">DNS configuration nominal.</div>';
        }

        c.innerHTML = html;

        const addBtn = document.getElementById('dnsAddRecord');
        if (addBtn) { addBtn.addEventListener('click', function() { engine.state._missingRecord = false; if (!engine.state._labComplete) { engine.state._labComplete=true; engine.state._flagRevealed=true; } engine.save(); engine.notify('A record added: portal.company.local -> 192.168.1.10', 'success'); NT007Config._renderDNS(engine); }); }

        const dnssecBtn = document.getElementById('dnssecDisable');
        if (dnssecBtn) { dnssecBtn.addEventListener('click', function() { engine.state._dnssecFail = false; if (!engine.state._labComplete) { engine.state._labComplete=true; engine.state._flagRevealed=true; } engine.save(); engine.notify('DNSSEC set to permissive mode.', 'success'); NT007Config._renderDNS(engine); }); }
    },

    _confirmReset(engine) {
        const o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#e74c3c; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="nt007Y" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="nt007N" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('nt007Y').addEventListener('click', function() { NT007Config._flagRestored=false; NT007Config.hints=NT007Config._defaultHints; engine.reset(); });
        document.getElementById('nt007N').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target===o) o.remove(); });
    },

    _escHtml(str) { const d=document.createElement('div'); d.textContent=str; return d.innerHTML; }
};
