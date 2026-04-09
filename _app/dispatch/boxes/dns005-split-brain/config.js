/* ============================================================
   DISPATCH LAB — Box DNS005: Split-Brain DNS
   DNS Troubleshooting — hairpin NAT, zone leak, VPN DNS view,
   wrong zone served, conditional forwarder loop
   ============================================================ */

var DNS005Config = {

    title: 'Split-Brain DNS',
    subtitle: 'Inside vs Outside — DNS Troubleshooting',
    difficulty: 'Advanced',
    accent: '#3a8fd4',
    storageKey: 'hexworth_lab_dns005',
    registryId: 'dns005-split-brain',
    trackerKey: 'lab_dns005',
    tutorialMode: true,
    tutorial: { steps: [
        { title: 'Open the Help Desk Ticket', tip: 'Read the split-brain DNS failure report.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
        { title: 'Query DNS from different perspectives', tip: 'Use nslookup with different DNS servers to see what internal vs external resolvers return.', trigger: { event: 'command', match: { cmd: 'contains:nslookup' } } },
        { title: 'Identify the split-brain issue', tip: 'Compare results from internal DNS, external DNS, and VPN client DNS.', trigger: { event: 'command', match: { cmd: 'contains:nslookup' }, alt: [{ event: 'command', match: { cmd: 'contains:dig' } }] } },
        { title: 'Apply the fix', tip: 'Fix NAT hairpin, correct zone data, update VPN DNS policy, fix split-horizon config, or break forwarder loop.', trigger: { event: 'command', match: { cmd: 'contains:dnscmd' }, alt: [{ event: 'command', match: { cmd: 'contains:netsh' } }] } },
        { title: 'Capture the flag', tip: 'After fixing the split-brain issue, the recovery token appears.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
    ] },
    certObjectives: { certPath: 'Network+', mappings: [{ flagId: 'fixed', objective: '1.6', description: 'Explain network services', skill: 'Split-Horizon DNS' }, { flagId: 'fixed', objective: '5.5', description: 'Troubleshoot networking issues', skill: 'DNS View Management' }] },
    _servers: [{ name: 'DNS-INT', ip: '10.0.1.5', os: 'Windows Server 2022', role: 'Internal DNS' }, { name: 'DNS-EXT', ip: '203.0.113.5', os: 'Ubuntu 22.04', role: 'External DNS' }],

    _scenarios: [
        { id: 'hairpin_nat', name: 'Internal Users Resolving to Public IP', ticketSubject: 'Internal users cannot reach portal via FQDN — hairpin NAT failure', ticketDetail: 'Internal users on the 10.0.1.0/24 network resolve portal.contoso.com to the public IP 203.0.113.10 (correct for external users) instead of the internal IP 10.0.1.40. The firewall does not support hairpin NAT, so internal traffic to the public IP gets dropped. Internal users must resolve to the private IP.', ticketExtra: 'Network Note: Split-brain DNS should return 10.0.1.40 for internal queries and 203.0.113.10 for external. The internal zone for contoso.com is missing the portal A record, so queries fall through to the external forwarder.', affectedServer: 0, fixDescription: 'Add portal A record (10.0.1.40) to the internal DNS zone', stateOverrides: { _splitIssue: 'hairpin', _fixed: false } },
        { id: 'zone_leak', name: 'External Users Hitting Internal IP', ticketSubject: 'External DNS returning private IP 10.0.1.40 — zone data leaked', ticketDetail: 'The external DNS server for contoso.com is returning the private IP address 10.0.1.40 for portal.contoso.com instead of the public IP 203.0.113.10. An admin accidentally copied the internal zone file to the external DNS server. External users are trying to connect to 10.0.1.40 which is unreachable from the internet.', ticketExtra: 'Security Note: Leaking internal IP addresses to external DNS is a security issue (information disclosure). The external zone file must only contain public IP addresses. Fix the external A record to 203.0.113.10.', affectedServer: 1, fixDescription: 'Correct the external DNS A record to the public IP 203.0.113.10', stateOverrides: { _splitIssue: 'zone_leak', _fixed: false } },
        { id: 'vpn_wrong_view', name: 'VPN Clients Getting Wrong DNS View', ticketSubject: 'VPN users resolve internal names to public IPs — wrong DNS assigned', ticketDetail: 'Remote VPN users connect successfully but internal hostnames resolve to public IPs instead of private IPs. The VPN server is assigning the external DNS server (203.0.113.5) to VPN clients instead of the internal DNS (10.0.1.5). VPN clients need the internal DNS to get private IP addresses for internal resources.', ticketExtra: 'VPN Note: The VPN DHCP scope is pushing DNS server 203.0.113.5 (external). It should push 10.0.1.5 (internal DNS). Fix the VPN DHCP scope DNS option.', affectedServer: 0, fixDescription: 'Update VPN DHCP scope to push internal DNS server 10.0.1.5', stateOverrides: { _splitIssue: 'vpn_dns', _fixed: false } },
        { id: 'wrong_zone', name: 'Split-Horizon Serving Wrong Zone', ticketSubject: 'Internal DNS serving external zone data to internal clients', ticketDetail: 'The DNS server was recently reconfigured for split-horizon. Internal clients on the 10.0.0.0/8 network should get the "internal" view with private IPs, but they are getting the "external" view with public IPs. The view matching ACL is configured incorrectly — it matches the DNS server\'s own IP instead of the client source IP range.', ticketExtra: 'DNS Note: Split-horizon views use ACLs to match the client\'s source IP. The internal view ACL should match 10.0.0.0/8 (client network), not 10.0.1.5 (server IP). Fix the match-clients ACL for the internal view.', affectedServer: 0, fixDescription: 'Fix the internal view ACL to match client network 10.0.0.0/8', stateOverrides: { _splitIssue: 'wrong_zone', _fixed: false } },
        { id: 'forwarder_loop', name: 'Conditional Forwarder Loop Between DCs', ticketSubject: 'DNS queries timing out — forwarder loop between DC1 and DC2', ticketDetail: 'DNS queries for contoso.com are timing out. DC1 (10.0.1.5) has a conditional forwarder sending contoso.com queries to DC2 (10.0.1.6). DC2 has a conditional forwarder sending contoso.com queries back to DC1. The queries bounce between the two servers until they time out. Both DCs should be authoritative for contoso.com, not forwarding to each other.', ticketExtra: 'AD Note: Both DCs are supposed to host the contoso.com AD-integrated zone. Someone configured conditional forwarders instead of replication. Remove the conditional forwarders and ensure both DCs have the zone as AD-integrated primary.', affectedServer: 0, fixDescription: 'Remove the circular conditional forwarders and configure AD-integrated zone', stateOverrides: { _splitIssue: 'forwarder_loop', _fixed: false } }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Query the same hostname from different DNS servers to see different responses.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use nslookup <host> <server> to specify which DNS server to query.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Split-brain issues: wrong zone served, leaked data, NAT hairpin, VPN DNS, loops.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after fixing the split-brain issue.', cost: 50, penalty: -50 }
    ],
    _scenarioHints: {
        hairpin: [{ id: 'hint1', text: 'Internal clients get the public IP. The internal zone is missing the private record.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'nslookup portal.contoso.com 10.0.1.5 returns 203.0.113.10 (public). Should be 10.0.1.40.', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Add the A record to the internal zone: dnscmd /recordadd contoso.com portal A 10.0.1.40', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: dnscmd DNS-INT /recordadd contoso.com portal A 10.0.1.40. Internal resolves private, external resolves public.', cost: 150, penalty: -150 }],
        zone_leak: [{ id: 'hint1', text: 'External DNS is returning a private IP. The zone data was leaked.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'nslookup portal.contoso.com 203.0.113.5 returns 10.0.1.40 (private!). Should be 203.0.113.10.', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Fix the external zone: update A record to public IP 203.0.113.10.', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: On DNS-EXT, update portal.contoso.com A record to 203.0.113.10. Audit all external zone records for leaked private IPs.', cost: 150, penalty: -150 }],
        vpn_dns: [{ id: 'hint1', text: 'VPN users get public IPs for internal names. Check what DNS server VPN assigns.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'VPN clients get DNS 203.0.113.5 (external). Should be 10.0.1.5 (internal).', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Fix VPN DHCP scope to push 10.0.1.5 as DNS server.', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: Update VPN DHCP scope DNS option from 203.0.113.5 to 10.0.1.5. Reconnect VPN clients.', cost: 150, penalty: -150 }],
        wrong_zone: [{ id: 'hint1', text: 'Internal clients get the external view. The view ACL is wrong.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'The internal view ACL matches 10.0.1.5 (server IP) not 10.0.0.0/8 (client network).', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Fix the ACL: match-clients should be 10.0.0.0/8 for the internal view.', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: Update internal view match-clients to 10.0.0.0/8. Reload DNS config.', cost: 150, penalty: -150 }],
        forwarder_loop: [{ id: 'hint1', text: 'Queries timeout because DC1 forwards to DC2 which forwards back to DC1.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Both DCs have conditional forwarders for contoso.com pointing to each other.', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Remove the forwarders: dnscmd /zonedelete contoso.com /forwarder on both DCs.', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: Remove conditional forwarders on both DCs. Ensure contoso.com is AD-integrated zone on both.', cost: 150, penalty: -150 }]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !DNS005Config._flagRestored) { DNS005Config._flagRestored = true; var s = DNS005Config._scenarios[engine.state._scenarioId]; if (s) DNS005Config.hints = DNS005Config._scenarioHints[s.id] || DNS005Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._splitIssue = null; engine.state._fixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; var o = DNS005Config._scenarios[idx].stateOverrides || {}; for (var k in o) engine.state[k] = o[k]; DNS005Config._flagRestored = true; DNS005Config.hints = DNS005Config._scenarioHints[DNS005Config._scenarios[idx].id] || DNS005Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : DNS005Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _revealFlag(engine) { engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('Split-brain DNS issue resolved. Check DNS Manager for recovery token.', 'success'); }, 400); },

    boot: { biosLines: ['Dell PowerEdge R640', 'Memory: 32768 MB OK'], grubEntries: ['Windows Server 2022'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' }, { id: 'dns_manager', label: 'DNS\nManager', icon: 'DNS', app: 'dns_manager' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'DNS-INT', startDir: 'C:\\Users\\Administrator', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.20348]\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [{ id: 'hint1', text: 'Query from different DNS servers.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Compare internal vs external results.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Fix depends on which view is broken.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Flag appears after fixing.', cost: 50, penalty: -50 }],
    lore: { intro: 'Split-brain DNS is one of the most confusing DNS architectures. Internal and external clients see different answers for the same name. When the split breaks, chaos ensues.', scenario: 'Each scenario breaks a different aspect of the internal/external DNS split.', outro: 'Split-brain DNS corrected. Internal and external clients are getting the right answers for their perspective.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Repair', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        nslookup: function(args, term, engine) {
            var gate = DNS005Config._requireScenario(engine); if (gate) return gate;
            var s = DNS005Config._getScenario(engine);
            var target = (args[0] || '').toLowerCase();
            var server = args.length > 1 ? args[1] : null;
            if (!target) return '\nUsage: nslookup <hostname> [server]';

            if (target.includes('portal') || target.includes('contoso')) {
                // Internal DNS query
                if (!server || server === '10.0.1.5' || server === 'DNS-INT') {
                    if (s && s.id === 'hairpin' && !engine.state._fixed) return '\nServer:  DNS-INT\nAddress:  10.0.1.5\n\nName:    portal.contoso.com\nAddress:  203.0.113.10\n\nWARNING: Internal DNS returning PUBLIC IP.\nInternal clients should get 10.0.1.40 (private).\nThe internal zone is missing the portal A record.';
                    if (s && s.id === 'wrong_zone' && !engine.state._fixed) return '\nServer:  DNS-INT\nAddress:  10.0.1.5\n\nName:    portal.contoso.com\nAddress:  203.0.113.10\n\nWARNING: Internal view serving external zone data.\nShould return 10.0.1.40 for internal clients.';
                    if (s && s.id === 'forwarder_loop' && !engine.state._fixed) return '\nDNS request timed out.\n    timeout was 2 seconds.\nServer:  DNS-INT\nAddress:  10.0.1.5\n\n*** Request to DNS-INT timed-out\n\nForwarder loop: DNS-INT -> DNS-02 -> DNS-INT -> ...';
                    return '\nServer:  DNS-INT\nAddress:  10.0.1.5\n\nName:    portal.contoso.com\nAddress:  10.0.1.40';
                }
                // External DNS query
                if (server === '203.0.113.5' || server === 'DNS-EXT') {
                    if (s && s.id === 'zone_leak' && !engine.state._fixed) return '\nServer:  DNS-EXT\nAddress:  203.0.113.5\n\nName:    portal.contoso.com\nAddress:  10.0.1.40\n\nSECURITY WARNING: External DNS returning PRIVATE IP!\nExternal clients should get 203.0.113.10 (public).\nInternal zone data leaked to external DNS.';
                    return '\nServer:  DNS-EXT\nAddress:  203.0.113.5\n\nName:    portal.contoso.com\nAddress:  203.0.113.10';
                }
                // VPN client perspective
                if (server === 'vpn' || server === 'vpn-client') {
                    if (s && s.id === 'vpn_dns' && !engine.state._fixed) return '\nServer:  DNS-EXT (assigned by VPN)\nAddress:  203.0.113.5\n\nName:    portal.contoso.com\nAddress:  203.0.113.10\n\nWARNING: VPN client getting external DNS.\nShould be using internal DNS 10.0.1.5 to get 10.0.1.40.';
                    return '\nServer:  DNS-INT (assigned by VPN)\nAddress:  10.0.1.5\n\nName:    portal.contoso.com\nAddress:  10.0.1.40';
                }
                // DC2 query
                if (server === '10.0.1.6') {
                    if (s && s.id === 'forwarder_loop' && !engine.state._fixed) return '\nDNS request timed out.\nDNS-02 forwards contoso.com back to DNS-INT. Circular forwarder loop.';
                    return '\nServer:  DNS-02\nAddress:  10.0.1.6\n\nName:    portal.contoso.com\nAddress:  10.0.1.40';
                }
            }
            return '\nServer:  DNS-INT\nAddress:  10.0.1.5\n\nName:    ' + target + '\nAddress:  10.0.1.40';
        },

        dnscmd: function(args, term, engine) {
            var gate = DNS005Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS005Config._getScenario(engine);

            if (s && s.id === 'hairpin' && joined.includes('recordadd') && joined.includes('portal') && joined.includes('10.0.1.40')) { DNS005Config._revealFlag(engine); return '\nA record added to internal zone: portal.contoso.com -> 10.0.1.40\nInternal clients will now resolve to the private IP.'; }
            if (s && s.id === 'zone_leak' && joined.includes('recordadd') && joined.includes('portal') && joined.includes('203.0.113.10')) { DNS005Config._revealFlag(engine); return '\nExternal zone A record fixed: portal.contoso.com -> 203.0.113.10\nPrivate IP leak corrected.'; }
            if (s && s.id === 'wrong_zone' && joined.includes('acl') && joined.includes('10.0.0.0')) { DNS005Config._revealFlag(engine); return '\nInternal view ACL updated: match-clients { 10.0.0.0/8; };\nInternal clients will now receive the internal zone data.'; }
            if (s && s.id === 'forwarder_loop' && joined.includes('zonedelete') && joined.includes('forwarder')) { DNS005Config._revealFlag(engine); return '\nConditional forwarder for contoso.com removed.\nZone is now served from local AD-integrated copy.\nForwarder loop broken.'; }
            if (s && s.id === 'vpn_dns' && joined.includes('vpn') && joined.includes('10.0.1.5')) { DNS005Config._revealFlag(engine); return '\nVPN DHCP scope DNS updated: 203.0.113.5 -> 10.0.1.5\nNew VPN connections will receive the internal DNS server.'; }

            if (joined.includes('zoneinfo')) {
                return '\nInternal Zone: contoso.com\n  Type: AD-Integrated Primary\n  Records: ' + (s && s.id === 'hairpin' && !engine.state._fixed ? 'portal A record MISSING' : 'portal A 10.0.1.40') + '\n\nExternal Zone: contoso.com (on DNS-EXT)\n  Records: portal A ' + (s && s.id === 'zone_leak' && !engine.state._fixed ? '10.0.1.40 (LEAKED!)' : '203.0.113.10') + '\n\nConditional Forwarders:\n  ' + (s && s.id === 'forwarder_loop' && !engine.state._fixed ? 'contoso.com -> 10.0.1.6 (LOOP!)' : '(none for contoso.com)');
            }

            return '\nUsage: dnscmd /recordadd <zone> <name> A <ip>\n       dnscmd /zoneinfo <zone>\n       dnscmd /zonedelete <zone> /forwarder';
        },

        netsh: function(args, term, engine) {
            var gate = DNS005Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS005Config._getScenario(engine);
            if (s && s.id === 'vpn_dns' && joined.includes('dns') && joined.includes('10.0.1.5')) { DNS005Config._revealFlag(engine); return '\nVPN DNS server updated to 10.0.1.5 (internal).'; }
            return '\nUsage: netsh interface ip set dns "VPN" static 10.0.1.5';
        },

        ipconfig: function(args, term, engine) {
            var gate = DNS005Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS005Config._getScenario(engine);
            if (joined.includes('/all')) {
                var vpnDns = s && s.id === 'vpn_dns' && !engine.state._fixed ? '203.0.113.5 (WRONG - external)' : '10.0.1.5 (correct - internal)';
                return '\nEthernet adapter Ethernet0:\n   IPv4 Address: 10.0.1.100\n   DNS Servers: 10.0.1.5\n\nPPP adapter VPN:\n   IPv4 Address: 10.0.100.25\n   DNS Servers: ' + vpnDns;
            }
            if (joined.includes('/flushdns')) return '\nSuccessfully flushed the DNS Resolver Cache.';
            return '\nIPv4 Address: 10.0.1.5';
        },

        ping: function(args, term, engine) {
            var gate = DNS005Config._requireScenario(engine); if (gate) return gate;
            var t = (args[0] || '').toLowerCase();
            if (t === '10.0.1.40') return '\nReply from 10.0.1.40: bytes=32 time<1ms TTL=128\nPackets: Sent = 4, Received = 4, Lost = 0';
            if (t === '203.0.113.10') return '\nReply from 203.0.113.10: bytes=32 time=15ms TTL=54\nPackets: Sent = 4, Received = 4, Lost = 0';
            if (t === '203.0.113.5') return '\nReply from 203.0.113.5: bytes=32 time=14ms TTL=54\nPackets: Sent = 4, Received = 4, Lost = 0';
            return '\nReply from 10.0.1.5: bytes=32 time<1ms TTL=128';
        },
        whoami: function() { return 'DNS-INT\\Administrator'; },
        hostname: function() { return 'DNS-INT'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'dns_manager' && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': DNS005Config._openTicket(iconDef, engine); break;
            case 'dns_manager': DNS005Config._openDNS(iconDef, engine); break;
            case 'reset_lab': DNS005Config._confirmReset(engine); break;
        }
    },
    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c); DNS005Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) DNS005Config._renderTicket(engine, c); else DNS005Config._renderPicker(engine, c);
    },
    _renderPicker(engine, c) {
        var p = ['Network — "Internal users get public IP — hairpin NAT fails"', 'Security — "External DNS returning private IP — zone leak"', 'VPN Team — "VPN users resolving to public IPs"', 'DNS Admin — "Split-horizon serving wrong view"', 'AD Admin — "Forwarder loop between DCs — queries timeout"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3a8fd4; font-weight:bold; font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        DNS005Config._scenarios.forEach(function(s, i) { html += '<button class="dns005-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#3a8fd4; font-weight:bold;">SPLIT-' + (5001 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + p[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="dns005Rand" style="padding:10px 28px; background:#3a8fd4; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        c.innerHTML = html;
        c.querySelectorAll('.dns005-btn').forEach(function(b) { b.addEventListener('click', function() { DNS005Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); DNS005Config._renderTicket(engine, c); }); });
        document.getElementById('dns005Rand').addEventListener('click', function() { DNS005Config._applyScenario(engine, Math.floor(Math.random() * 5)); DNS005Config._renderTicket(engine, c); });
    },
    _renderTicket(engine, c) {
        var s = DNS005Config._getScenario(engine); var names = ['Network Team — Carlos Mendez', 'Security Team — Lisa Chang', 'VPN Support — Derek Foster', 'DNS Admin — Brian Cole', 'AD Admin — Samira Hassan'];
        c.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#3a8fd4; font-weight:bold;">TICKET #SPLIT-' + (5001 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem;">URGENT</span></div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">REPORTED BY</div><div>' + names[engine.state._scenarioId] + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + DNS005Config._escHtml(s.ticketSubject) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + DNS005Config._escHtml(s.ticketDetail) + '</div></div>' + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(58,143,212,0.08); border:1px solid rgba(58,143,212,0.2); border-radius:4px; padding:12px; color:#7ec8e3;">' + DNS005Config._escHtml(s.ticketExtra) + '</div></div>' : '') + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — DNS / Network Administrator</div></div>';
    },
    _openDNS(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); DNS005Config._renderDNS(engine); return; }
        var c = document.createElement('div'); c.id = 'dns005Mgr'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'DNS Manager', 'DNS', c); DNS005Config._renderDNS(engine);
    },
    _renderDNS(engine) {
        var c = document.getElementById('dns005Mgr'); if (!c) return; var s = DNS005Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#3a8fd4; margin-bottom:16px;">DNS Manager — Split-Brain Status</div>';
        html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">';
        html += '<div style="padding:8px 12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div style="font-weight:bold; color:#3a8fd4;">Internal View</div><div style="font-size:0.7rem; color:#888;">DNS-INT (10.0.1.5)</div><div style="font-size:0.75rem;">portal -> ' + (s && s.id === 'hairpin' && !engine.state._fixed ? '<span style="color:#e74c3c;">MISSING</span>' : s && s.id === 'wrong_zone' && !engine.state._fixed ? '<span style="color:#e74c3c;">203.0.113.10 (WRONG)</span>' : '10.0.1.40') + '</div></div>';
        html += '<div style="padding:8px 12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div style="font-weight:bold; color:#3a8fd4;">External View</div><div style="font-size:0.7rem; color:#888;">DNS-EXT (203.0.113.5)</div><div style="font-size:0.75rem;">portal -> ' + (s && s.id === 'zone_leak' && !engine.state._fixed ? '<span style="color:#e74c3c;">10.0.1.40 (LEAKED!)</span>' : '203.0.113.10') + '</div></div>';
        html += '</div>';

        if (engine.state._flagRevealed && s) { html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Resolved:</div><div style="font-size:0.8rem;">' + s.fixDescription + '</div><div id="dns005-flag" style="font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>'; setTimeout(function() { BoxEngine.requestFlagText(s.id).then(function(f) { var el = document.getElementById('dns005-flag'); if (el) el.textContent = 'Recovery token: ' + (f || 'Flag unavailable'); }); }, 0); }
        c.innerHTML = html;
    },
    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="dns005RC" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="dns005CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('dns005RC').addEventListener('click', function() { DNS005Config._flagRestored = false; DNS005Config.hints = DNS005Config._defaultHints; engine.reset(); });
        document.getElementById('dns005CC').addEventListener('click', function() { o.remove(); }); o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
