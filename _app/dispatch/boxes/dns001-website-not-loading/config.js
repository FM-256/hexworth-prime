/* ============================================================
   DISPATCH LAB — Box DNS001: Website Not Loading
   DNS Troubleshooting — NXDOMAIN, wrong IP, stale TTL,
   unreachable DNS, SERVFAIL
   ============================================================ */

var DNS001Config = {

    title: 'Website Not Loading',
    subtitle: 'DNS Says No — DNS Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#3a8fd4',
    storageKey: 'hexworth_lab_dns001',
    registryId: 'dns001-website-not-loading',
    trackerKey: 'lab_dns001',
    tutorialMode: true,

    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the DNS resolution failure report.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Query the DNS record', tip: 'Use nslookup or dig to query the DNS record for the affected domain.', trigger: { event: 'command', match: { cmd: 'contains:nslookup' }, alt: [{ event: 'command', match: { cmd: 'contains:dig' } }] } },
            { title: 'Identify the DNS issue', tip: 'Determine if the record is missing, pointing to the wrong IP, cached stale, or if the DNS server itself is down.', trigger: { event: 'command', match: { cmd: 'contains:nslookup' }, alt: [{ event: 'command', match: { cmd: 'contains:dig' } }, { event: 'command', match: { cmd: 'contains:ipconfig' } }] } },
            { title: 'Apply the fix', tip: 'Add the missing record, correct the IP, flush cache, fix DNS config, or wait for TTL.', trigger: { event: 'command', match: { cmd: 'contains:dnscmd' }, alt: [{ event: 'command', match: { cmd: 'contains:ipconfig' } }, { event: 'command', match: { cmd: 'contains:flush' } }] } },
            { title: 'Capture the flag', tip: 'After fixing DNS resolution, the recovery token appears.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'Network+', mappings: [
        { flagId: 'fixed', objective: '1.6', description: 'Explain the use and purpose of network services', skill: 'DNS Record Management' },
        { flagId: 'fixed', objective: '5.5', description: 'Troubleshoot general networking issues', skill: 'DNS Troubleshooting' }
    ] },

    _servers: [
        { name: 'DNS-01', ip: '10.0.1.5', os: 'Windows Server 2022', role: 'Primary DNS Server' },
        { name: 'DNS-02', ip: '10.0.1.6', os: 'Windows Server 2022', role: 'Secondary DNS Server' }
    ],

    _scenarios: [
        {
            id: 'nxdomain',
            name: 'NXDOMAIN — No A Record',
            ticketSubject: 'New website launch failed — domain returns NXDOMAIN',
            ticketDetail: 'We launched the new marketing website at marketing.contoso.com today, but nobody can reach it. Browsers show "This site can\'t be reached" and "DNS_PROBE_FINISHED_NXDOMAIN." The web server is running and accessible by IP (10.0.1.50). The A record was never created in DNS — the launch team assumed IT would handle it.',
            ticketExtra: 'Web Team Note: The server at 10.0.1.50 is fully configured and serving content. We need an A record for marketing.contoso.com pointing to 10.0.1.50.',
            affectedServer: 0, fixDescription: 'Create an A record for marketing.contoso.com pointing to 10.0.1.50',
            stateOverrides: { _dnsIssue: 'nxdomain', _fixed: false }
        },
        {
            id: 'wrong_ip',
            name: 'Wrong IP in A Record',
            ticketSubject: 'Portal loading wrong content — DNS points to decommissioned server',
            ticketDetail: 'portal.contoso.com is showing an old "Server Decommissioned" page instead of the actual portal. The site was migrated to a new server (10.0.1.40) last month, but the DNS A record still points to the old server (10.0.1.30). The old server was repurposed and now serves a placeholder page.',
            ticketExtra: 'Migration Note: Server migration was completed on March 1. The DNS change request was submitted but never executed. The new server is 10.0.1.40. The old server 10.0.1.30 should no longer be referenced.',
            affectedServer: 0, fixDescription: 'Update the A record from 10.0.1.30 to 10.0.1.40',
            stateOverrides: { _dnsIssue: 'wrong_ip', _fixed: false }
        },
        {
            id: 'stale_ttl',
            name: 'TTL Too High — Cached Stale Record',
            ticketSubject: 'DNS change made 12 hours ago but clients still resolving old IP',
            ticketDetail: 'We updated the A record for api.contoso.com from 10.0.1.60 to 10.0.1.70 twelve hours ago. The DNS server shows the correct new IP, but many client workstations still resolve to the old IP. The TTL on the old record was set to 86400 seconds (24 hours), so clients that cached the old response will not re-query for up to 24 hours.',
            ticketExtra: 'DNS Admin Note: The record was updated at 8 PM last night with the new IP. However, the previous TTL was 86400 (24h). Clients that cached the old record before the change will keep using it until their cache expires. Flushing the local DNS cache on affected clients is the immediate fix.',
            affectedServer: 0, fixDescription: 'Flush DNS cache on affected clients and lower the TTL for future changes',
            stateOverrides: { _dnsIssue: 'stale_ttl', _fixed: false }
        },
        {
            id: 'dns_unreachable',
            name: 'DNS Server Unreachable',
            ticketSubject: 'Nothing resolves — client DNS settings point to wrong server',
            ticketDetail: 'A group of workstations on the 4th floor cannot resolve ANY domain names. Web browsing, email, and internal apps are all down. These workstations were recently re-imaged and their network settings were configured incorrectly — the DNS server is set to 10.0.1.99 which does not exist. It should be 10.0.1.5 (DNS-01).',
            ticketExtra: 'Desktop Team Note: The imaging template had a typo in the DNS server configuration. 15 workstations on the 4th floor were deployed with DNS set to 10.0.1.99 instead of 10.0.1.5. They need their DNS settings corrected.',
            affectedServer: 0, fixDescription: 'Correct the DNS server address from 10.0.1.99 to 10.0.1.5',
            stateOverrides: { _dnsIssue: 'dns_unreachable', _fixed: false }
        },
        {
            id: 'servfail',
            name: 'SERVFAIL — Upstream DNS Down',
            ticketSubject: 'External websites not resolving — SERVFAIL on all queries',
            ticketDetail: 'Internal DNS names resolve fine, but all external domain lookups (google.com, microsoft.com, etc.) return SERVFAIL. The DNS servers are configured to forward external queries to 8.8.8.8 and 8.8.4.4, but the upstream forwarders are unreachable because the firewall is blocking outbound DNS (UDP/TCP 53) to the internet. Internal zones still work because they are authoritative.',
            ticketExtra: 'Firewall Note: The security team implemented new outbound firewall rules at midnight. The rules were supposed to only block social media, but they accidentally blocked all outbound UDP/TCP 53 traffic. Internal DNS zones are unaffected since they are resolved locally.',
            affectedServer: 0, fixDescription: 'Fix the firewall rule to allow outbound DNS (port 53) to upstream forwarders',
            stateOverrides: { _dnsIssue: 'servfail', _fixed: false }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Use nslookup or dig to query the DNS record and see the response.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Check the response code: NXDOMAIN, NOERROR, SERVFAIL. Each means something different.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Common fixes: add missing record, update wrong IP, flush cache, fix DNS config, fix firewall.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after resolving the DNS issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        nxdomain: [
            { id: 'hint1', text: 'NXDOMAIN means the name does not exist in DNS. The A record was never created.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "nslookup marketing.contoso.com" — it returns NXDOMAIN. The record must be added.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use dnscmd to add the record: dnscmd /recordadd contoso.com marketing A 10.0.1.50', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: dnscmd DNS-01 /recordadd contoso.com marketing A 10.0.1.50. Then verify with nslookup.', cost: 150, penalty: -150 }
        ],
        wrong_ip: [
            { id: 'hint1', text: 'The site loads but shows wrong content. The DNS record points to the wrong server.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'nslookup portal.contoso.com returns 10.0.1.30 (old server). Should be 10.0.1.40.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Delete the old record and add the correct one: dnscmd /recorddelete then /recordadd with 10.0.1.40.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: dnscmd /recorddelete contoso.com portal A, then dnscmd /recordadd contoso.com portal A 10.0.1.40.', cost: 150, penalty: -150 }
        ],
        stale_ttl: [
            { id: 'hint1', text: 'The DNS server has the correct record, but clients still see the old IP. Check the TTL.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The old record had TTL 86400 (24h). Clients cached it and will not re-query until expiry.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Flush client DNS cache: ipconfig /flushdns. For future changes, lower TTL before migration.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: ipconfig /flushdns on affected clients. Set TTL to 300 (5min) before future DNS changes.', cost: 150, penalty: -150 }
        ],
        dns_unreachable: [
            { id: 'hint1', text: 'NOTHING resolves. The DNS server itself is unreachable. Check the client DNS config.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'nslookup times out. ipconfig /all shows DNS server as 10.0.1.99 which does not exist.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix the DNS server address: netsh interface ip set dns "Ethernet" static 10.0.1.5', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: netsh interface ip set dns "Ethernet" static 10.0.1.5 primary. Then verify: nslookup portal.contoso.com', cost: 150, penalty: -150 }
        ],
        servfail: [
            { id: 'hint1', text: 'Internal names work but external names fail with SERVFAIL. The DNS forwarders cannot be reached.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'nslookup google.com returns SERVFAIL. Ping 8.8.8.8 works but UDP 53 is blocked by firewall.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix the firewall: netsh advfirewall firewall add rule to allow outbound UDP/TCP 53.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: netsh advfirewall firewall add rule name="DNS Outbound" dir=out action=allow protocol=udp remoteport=53. Same for TCP.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !DNS001Config._flagRestored) { DNS001Config._flagRestored = true; var s = DNS001Config._scenarios[engine.state._scenarioId]; if (s) DNS001Config.hints = DNS001Config._scenarioHints[s.id] || DNS001Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._dnsIssue = null; engine.state._fixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; var o = DNS001Config._scenarios[idx].stateOverrides || {}; for (var k in o) engine.state[k] = o[k]; DNS001Config._flagRestored = true; DNS001Config.hints = DNS001Config._scenarioHints[DNS001Config._scenarios[idx].id] || DNS001Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : DNS001Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['Dell PowerEdge R640 UEFI BIOS', 'Memory: 32768 MB OK', 'Loading Windows Server 2022...'], grubEntries: ['Windows Server 2022'], loginUser: 'Administrator' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'dns_manager', label: 'DNS\nManager', icon: 'DNS', app: 'dns_manager' },
        { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' },
        { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
        { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
        { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
    ] },
    terminal: { user: 'Administrator', hostname: 'DNS-01', startDir: 'C:\\Users\\Administrator', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.20348]\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [{ id: 'hint1', text: 'Use nslookup to query DNS records.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Check the response code.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Fix depends on the issue type.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Flag appears after fixing.', cost: 50, penalty: -50 }],
    lore: { intro: 'When DNS breaks, everything breaks. No DNS means no websites, no email, no applications.', scenario: 'Each scenario is a different DNS failure. Use nslookup, dig, and DNS management tools to diagnose and fix.', outro: 'DNS resolution restored. Names are resolving correctly again.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Query the DNS record.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the DNS issue.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Fix the DNS configuration.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Verify resolution works.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        nslookup: function(args, term, engine) {
            var gate = DNS001Config._requireScenario(engine); if (gate) return gate;
            var scenario = DNS001Config._getScenario(engine);
            var target = args[0] ? args[0].toLowerCase() : '';
            var server = args.length > 1 ? args[1] : null;

            if (!target) return '\nUsage: nslookup <hostname> [server]\nExample: nslookup portal.contoso.com 10.0.1.5';

            if (scenario && scenario.id === 'dns_unreachable' && !engine.state._fixed && !server) {
                return '\nDNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  10.0.1.99\n\n*** 10.0.1.99 can\'t find ' + target + ': Non-existent domain\n\nNote: DNS server 10.0.1.99 is unreachable. Check your DNS configuration.';
            }

            if (scenario && scenario.id === 'servfail' && !engine.state._fixed) {
                if (target.includes('contoso.com')) {
                    return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nName:    ' + target + '\nAddress:  10.0.1.40';
                }
                return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\n*** DNS-01 can\'t find ' + target + ': Server failed\n\nSERVFAIL: The DNS server was unable to resolve this query.\nForwarders 8.8.8.8 and 8.8.4.4 are unreachable (outbound port 53 blocked).';
            }

            if (target === 'marketing.contoso.com' || target.includes('marketing')) {
                if (scenario && scenario.id === 'nxdomain' && !engine.state._fixed) {
                    return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\n*** DNS-01 can\'t find marketing.contoso.com: Non-existent domain\n\nNXDOMAIN: No A record exists for marketing.contoso.com.\nThe record needs to be created in the contoso.com zone.';
                }
                return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nName:    marketing.contoso.com\nAddress:  10.0.1.50';
            }

            if (target === 'portal.contoso.com' || target.includes('portal')) {
                if (scenario && scenario.id === 'wrong_ip' && !engine.state._fixed) {
                    return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nName:    portal.contoso.com\nAddress:  10.0.1.30\n\nNote: This IP (10.0.1.30) is the OLD decommissioned server.\nThe new server is 10.0.1.40.';
                }
                return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nName:    portal.contoso.com\nAddress:  10.0.1.40';
            }

            if (target === 'api.contoso.com' || target.includes('api')) {
                if (scenario && scenario.id === 'stale_ttl' && !engine.state._fixed) {
                    return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nName:    api.contoso.com\nAddress:  10.0.1.60    (CACHED - TTL: 43200 seconds remaining)\n\nNote: DNS server has the NEW record (10.0.1.70) but this client is returning the\nCACHED old record (10.0.1.60). The old TTL was 86400s (24h).\nFlush the DNS cache: ipconfig /flushdns';
                }
                return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nName:    api.contoso.com\nAddress:  10.0.1.70';
            }

            if (target.includes('google.com') || target.includes('microsoft.com')) {
                if (scenario && scenario.id === 'servfail' && !engine.state._fixed) {
                    return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\n*** DNS-01 can\'t find ' + target + ': Server failed\nSERVFAIL';
                }
                return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nNon-authoritative answer:\nName:    ' + target + '\nAddress:  142.250.80.46';
            }

            return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\n*** DNS-01 can\'t find ' + target + ': Non-existent domain';
        },

        dig: function(args, term, engine) {
            var gate = DNS001Config._requireScenario(engine); if (gate) return gate;
            var target = args[0] ? args[0].toLowerCase() : '';
            var scenario = DNS001Config._getScenario(engine);

            if (!target) return '\nUsage: dig <hostname> [type] [@server]';

            if (scenario && scenario.id === 'nxdomain' && target.includes('marketing') && !engine.state._fixed) {
                return '\n;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 45231\n;; QUESTION SECTION:\n;marketing.contoso.com.       IN      A\n\n;; AUTHORITY SECTION:\ncontoso.com.          3600    IN      SOA     dns-01.contoso.com. admin.contoso.com. 2026033001 3600 900 604800 86400\n\n;; ANSWER SECTION:\n(empty - no records found)';
            }

            return '\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR\n;; ANSWER SECTION:\n' + target + '.   300   IN   A   10.0.1.40';
        },

        dnscmd: function(args, term, engine) {
            var gate = DNS001Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = DNS001Config._getScenario(engine);

            if (joined.includes('recordadd') && joined.includes('marketing') && joined.includes('10.0.1.50')) {
                if (scenario && scenario.id === 'nxdomain') {
                    engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                    setTimeout(function() { engine.notify('A record created for marketing.contoso.com. DNS resolution working. Check DNS Manager for recovery token.', 'success'); }, 400);
                    return '\nAdd A Record for marketing.contoso.com at 10.0.1.50:\n  Status = 0 (0x00000000)\nCommand completed successfully.';
                }
            }

            if (joined.includes('recordadd') && joined.includes('portal') && joined.includes('10.0.1.40')) {
                if (scenario && scenario.id === 'wrong_ip') {
                    engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                    setTimeout(function() { engine.notify('A record updated for portal.contoso.com to 10.0.1.40. Check DNS Manager for recovery token.', 'success'); }, 400);
                    return '\nA Record updated for portal.contoso.com to 10.0.1.40:\n  Status = 0 (0x00000000)\nCommand completed successfully.';
                }
            }

            if (joined.includes('recorddelete') && joined.includes('portal')) {
                return '\nDeleted A record for portal.contoso.com (10.0.1.30)\nCommand completed successfully.';
            }

            return '\nUsage:\n    dnscmd <server> /recordadd <zone> <name> A <ip>\n    dnscmd <server> /recorddelete <zone> <name> A\n    dnscmd <server> /enumrecords <zone> .';
        },

        ipconfig: function(args, term, engine) {
            var gate = DNS001Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = DNS001Config._getScenario(engine);

            if (joined.includes('/flushdns') || joined.includes('flushdns')) {
                if (scenario && scenario.id === 'stale_ttl') {
                    engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                    setTimeout(function() { engine.notify('DNS cache flushed. Clients will now resolve the new IP. Check DNS Manager for recovery token.', 'success'); }, 400);
                    return '\nWindows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.\n\nClients will now query for fresh records. api.contoso.com should resolve to 10.0.1.70.';
                }
                return '\nWindows IP Configuration\nSuccessfully flushed the DNS Resolver Cache.';
            }

            if (joined.includes('/all')) {
                var dnsServer = scenario && scenario.id === 'dns_unreachable' && !engine.state._fixed ? '10.0.1.99' : '10.0.1.5';
                return '\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n   IPv4 Address: 10.0.1.100\n   Subnet Mask: 255.255.255.0\n   Default Gateway: 10.0.1.1\n   DNS Servers: ' + dnsServer + (dnsServer === '10.0.1.99' ? '\n\n   WARNING: DNS server 10.0.1.99 does not exist on this network.\n   Correct DNS server is 10.0.1.5' : '');
            }

            return '\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n   IPv4 Address: 10.0.1.5\n   Subnet Mask: 255.255.255.0\n   Default Gateway: 10.0.1.1';
        },

        netsh: function(args, term, engine) {
            var gate = DNS001Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = DNS001Config._getScenario(engine);

            if (joined.includes('interface') && joined.includes('dns') && joined.includes('10.0.1.5')) {
                if (scenario && scenario.id === 'dns_unreachable') {
                    engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                    setTimeout(function() { engine.notify('DNS server corrected to 10.0.1.5. Name resolution restored. Check DNS Manager for recovery token.', 'success'); }, 400);
                    return '\nDNS server set to 10.0.1.5 for interface "Ethernet".\nConfiguration updated successfully.';
                }
            }

            if (joined.includes('advfirewall') && joined.includes('53')) {
                if (scenario && scenario.id === 'servfail') {
                    engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                    setTimeout(function() { engine.notify('Outbound DNS rule added. External name resolution restored. Check DNS Manager for recovery token.', 'success'); }, 400);
                    return '\nOk.\nRule "DNS Outbound" added successfully.\nOutbound UDP/TCP port 53 is now allowed.';
                }
            }

            return '\nUsage:\n    netsh interface ip set dns "Ethernet" static 10.0.1.5\n    netsh advfirewall firewall add rule name="DNS" dir=out action=allow protocol=udp remoteport=53';
        },

        ping: function(args, term, engine) {
            var gate = DNS001Config._requireScenario(engine); if (gate) return gate;
            if (!args.length) return '\nUsage: ping <target>';
            var t = args[args.length - 1];
            if (t === '10.0.1.5' || t === 'DNS-01') return '\nReply from 10.0.1.5: bytes=32 time<1ms TTL=128\nPackets: Sent = 4, Received = 4, Lost = 0';
            if (t === '10.0.1.99') return '\nRequest timed out.\nRequest timed out.\nPackets: Sent = 4, Received = 0, Lost = 4 (100% loss)';
            if (t === '10.0.1.50') return '\nReply from 10.0.1.50: bytes=32 time=1ms TTL=64\nPackets: Sent = 4, Received = 4, Lost = 0';
            if (t === '8.8.8.8') return '\nReply from 8.8.8.8: bytes=32 time=12ms TTL=118\nPackets: Sent = 4, Received = 4, Lost = 0';
            return '\nPing request could not find host ' + t;
        },

        whoami: function() { return 'DNS-01\\Administrator'; },
        hostname: function() { return 'DNS-01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        sudo: function() { return '\'sudo\' is not recognized.'; },
        grep: function() { return '\'grep\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        var req = ['dns_manager', 'event_viewer'];
        if (req.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': DNS001Config._openTicket(iconDef, engine); break;
            case 'dns_manager': DNS001Config._openDNSManager(iconDef, engine); break;
            case 'event_viewer': DNS001Config._openEventViewer(iconDef, engine); break;
            case 'reset_lab': DNS001Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        DNS001Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) DNS001Config._renderTicket(engine, c);
        else DNS001Config._renderScenarioPicker(engine, c);
    },

    _renderScenarioPicker(engine, container) {
        var previews = ['Marketing — "New website returns NXDOMAIN"', 'Users — "Portal shows wrong content — old server"', 'DevOps — "DNS change not propagating — stale cache"', 'Desktop — "4th floor workstations cannot resolve anything"', 'NOC — "External DNS queries returning SERVFAIL"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3a8fd4; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">INCIDENT QUEUE</div></div><div>';
        DNS001Config._scenarios.forEach(function(s, i) {
            html += '<button class="dns001-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#3a8fd4; font-weight:bold;">DNS-' + (1001 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="dns001RandBtn" style="padding:10px 28px; background:#3a8fd4; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.dns001-btn').forEach(function(b) { b.addEventListener('click', function() { DNS001Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); DNS001Config._renderTicket(engine, container); }); });
        document.getElementById('dns001RandBtn').addEventListener('click', function() { DNS001Config._applyScenario(engine, Math.floor(Math.random() * 5)); DNS001Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = DNS001Config._getScenario(engine);
        var names = ['Tom Rivera — Marketing Department', 'Emily Zhang — General Users', 'Raj Patel — DevOps Engineering', 'Mike Johnson — Desktop Support', 'NOC Alert — Monitoring System'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#3a8fd4; font-weight:bold;">TICKET #DNS-' + (1001 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem;">URGENT</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">REPORTED BY</div><div>' + names[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + DNS001Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + DNS001Config._escHtml(s.ticketDetail) + '</div></div>'
            + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(58,143,212,0.08); border:1px solid rgba(58,143,212,0.2); border-radius:4px; padding:12px; color:#7ec8e3;">' + DNS001Config._escHtml(s.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — DNS Administrator</div></div>';
    },

    _openDNSManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); DNS001Config._renderDNSManager(engine); return; }
        var c = document.createElement('div'); c.id = 'dnsManagerContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'DNS Manager', 'DNS', c);
        DNS001Config._renderDNSManager(engine);
    },

    _renderDNSManager(engine) {
        var c = document.getElementById('dnsManagerContainer'); if (!c) return;
        var s = DNS001Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#3a8fd4; margin-bottom:16px;">DNS Manager — contoso.com Zone</div>';
        html += '<div style="font-weight:bold; margin-bottom:8px;">A Records:</div>';

        var records = [
            { name: 'portal', ip: s && s.id === 'wrong_ip' && !engine.state._fixed ? '10.0.1.30 (OLD)' : '10.0.1.40', error: s && s.id === 'wrong_ip' && !engine.state._fixed },
            { name: 'api', ip: '10.0.1.70', error: false },
            { name: 'mail', ip: '10.0.1.15', error: false }
        ];

        if (s && s.id === 'nxdomain' && engine.state._fixed) records.push({ name: 'marketing', ip: '10.0.1.50', error: false });
        if (s && s.id === 'nxdomain' && !engine.state._fixed) html += '<div style="padding:8px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:4px; margin-bottom:8px; color:#e74c3c;">MISSING: No A record for marketing.contoso.com</div>';

        records.forEach(function(r) {
            html += '<div style="display:flex; justify-content:space-between; padding:6px 12px; margin-bottom:4px; background:' + (r.error ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (r.error ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.06)') + '; border-radius:3px;"><span>' + r.name + '.contoso.com</span><span style="color:' + (r.error ? '#e74c3c' : '#888') + ';">A &mdash; ' + r.ip + '</span></div>';
        });

        if (engine.state._flagRevealed && s) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Issue Resolved:</div><div style="font-size:0.8rem;">' + s.fixDescription + '</div><div id="dns001-flag" style="font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>';
            setTimeout(function() { BoxEngine.requestFlagText(s.id).then(function(f) { var el = document.getElementById('dns001-flag'); if (el) el.textContent = 'Recovery token: ' + (f || 'Flag unavailable'); }); }, 0);
        }
        c.innerHTML = html;
    },

    _openEventViewer(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Event Viewer', 'EVT', c);
        var s = DNS001Config._getScenario(engine);
        var msg = 'DNS service operating normally.';
        if (s) {
            if (s.id === 'nxdomain') msg = 'Query for marketing.contoso.com returned NXDOMAIN — no record exists.';
            else if (s.id === 'wrong_ip') msg = 'A record for portal.contoso.com still points to decommissioned server 10.0.1.30.';
            else if (s.id === 'stale_ttl') msg = 'Record update for api.contoso.com processed. Old cached entries (TTL 86400) still in client caches.';
            else if (s.id === 'dns_unreachable') msg = 'Client workstations configured with DNS server 10.0.1.99 (non-existent).';
            else if (s.id === 'servfail') msg = 'Forwarder queries to 8.8.8.8 and 8.8.4.4 failing — outbound port 53 blocked by firewall.';
        }
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#3a8fd4; margin-bottom:16px;">Event Viewer</div><div style="padding:6px 8px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:3px;"><span style="color:#e74c3c; font-weight:bold;">Warning</span> <span style="color:#888;">03/30/2026</span> — DNS — ' + msg + '</div>';
    },

    _confirmReset(engine) {
        var o = document.createElement('div');
        o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="dns001RC" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="dns001CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('dns001RC').addEventListener('click', function() { DNS001Config._flagRestored = false; DNS001Config.hints = DNS001Config._defaultHints; engine.reset(); });
        document.getElementById('dns001CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
