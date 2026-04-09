/* ============================================================
   DISPATCH LAB — Box DNS002: Internal App Can't Resolve
   DNS Troubleshooting — missing A record, stale CNAME,
   conditional forwarder, suffix search, hosts file
   ============================================================ */

var DNS002Config = {

    title: 'Internal App Can\'t Resolve',
    subtitle: 'The App Says "Server Not Found" — DNS Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#3a8fd4',
    storageKey: 'hexworth_lab_dns002',
    registryId: 'dns002-internal-resolve',
    trackerKey: 'lab_dns002',
    tutorialMode: true,
    tutorial: { steps: [
        { title: 'Open the Help Desk Ticket', tip: 'Read the DNS resolution failure report.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
        { title: 'Query the DNS record', tip: 'Use nslookup to check what the internal DNS returns for the affected hostname.', trigger: { event: 'command', match: { cmd: 'contains:nslookup' } } },
        { title: 'Identify the issue', tip: 'Check A records, CNAMEs, forwarders, suffix lists, and the hosts file.', trigger: { event: 'command', match: { cmd: 'contains:nslookup' }, alt: [{ event: 'command', match: { cmd: 'contains:type' } }, { event: 'command', match: { cmd: 'contains:dnscmd' } }] } },
        { title: 'Apply the fix', tip: 'Add the record, update CNAME, configure forwarder, fix suffix list, or remove hosts override.', trigger: { event: 'command', match: { cmd: 'contains:dnscmd' }, alt: [{ event: 'command', match: { cmd: 'contains:netsh' } }, { event: 'command', match: { cmd: 'contains:del' } }] } },
        { title: 'Capture the flag', tip: 'After fixing resolution, the recovery token appears.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
    ] },
    certObjectives: { certPath: 'Network+', mappings: [{ flagId: 'fixed', objective: '1.6', description: 'Explain the use and purpose of network services', skill: 'Internal DNS Management' }] },
    _servers: [{ name: 'DNS-01', ip: '10.0.1.5', os: 'Windows Server 2022', role: 'Primary DNS Server' }],

    _scenarios: [
        { id: 'a_record_missing', name: 'A Record Missing After Migration', ticketSubject: 'Migrated HR app unreachable by hostname — works by IP', ticketDetail: 'The HR application was migrated to a new server (10.0.2.50) last night. Users can reach it by IP but not by hostname (hrapp.corp.contoso.com). The DNS A record was not re-created after the migration. The old A record pointed to the decommissioned server and was deleted during cleanup.', ticketExtra: 'Migration Note: The old server 10.0.2.30 was decommissioned. Its DNS record was deleted. The new server at 10.0.2.50 needs a fresh A record for hrapp.corp.contoso.com.', affectedServer: 0, fixDescription: 'Create A record for hrapp.corp.contoso.com pointing to 10.0.2.50', stateOverrides: { _dnsIssue: 'a_missing', _fixed: false } },
        { id: 'stale_cname', name: 'CNAME Pointing to Decommissioned Host', ticketSubject: 'Helpdesk portal returning NXDOMAIN — CNAME target no longer exists', ticketDetail: 'helpdesk.contoso.com is a CNAME alias pointing to helpdesk-prod.contoso.com. The target server helpdesk-prod was decommissioned and its A record was removed, but the CNAME alias was never updated. The CNAME now points to a name that does not exist, causing NXDOMAIN for the alias too.', ticketExtra: 'Infrastructure Note: The helpdesk application was moved to the shared platform at platform-web-01.contoso.com (10.0.2.100). The CNAME needs to be updated to point to the new target.', affectedServer: 0, fixDescription: 'Update CNAME from helpdesk-prod to platform-web-01.contoso.com', stateOverrides: { _dnsIssue: 'stale_cname', _fixed: false } },
        { id: 'forwarder_missing', name: 'Conditional Forwarder Not Configured', ticketSubject: 'Cannot resolve partner domain — acquisition DNS not integrated', ticketDetail: 'After acquiring Northwind Corp, our users need to access resources at northwind.local. DNS queries for anything.northwind.local return NXDOMAIN because our DNS server has no conditional forwarder configured for the northwind.local domain. Northwind\'s DNS server at 172.16.1.5 is reachable but we are not forwarding queries to it.', ticketExtra: 'IT Integration Note: The VPN tunnel to Northwind\'s network is active. Their DNS server is 172.16.1.5. We need a conditional forwarder on DNS-01 so queries for northwind.local are sent to 172.16.1.5.', affectedServer: 0, fixDescription: 'Add conditional forwarder for northwind.local to 172.16.1.5', stateOverrides: { _dnsIssue: 'forwarder_missing', _fixed: false } },
        { id: 'suffix_wrong', name: 'DNS Suffix Search List Wrong', ticketSubject: 'Short hostnames not resolving — FQDN works fine', ticketDetail: 'Users on the new VLAN can access apps using the full FQDN (erp.corp.contoso.com) but short names (just "erp") do not resolve. The DNS suffix search list on these workstations is set to "contoso.com" instead of "corp.contoso.com". The short name "erp" gets expanded to "erp.contoso.com" (which does not exist) instead of "erp.corp.contoso.com" (which does).', ticketExtra: 'Network Note: The new VLAN DHCP scope is handing out the wrong DNS suffix. The suffix should be "corp.contoso.com" not "contoso.com". Fix DHCP scope option 15 or override manually on affected workstations.', affectedServer: 0, fixDescription: 'Fix the DNS suffix search list to corp.contoso.com', stateOverrides: { _dnsIssue: 'suffix_wrong', _fixed: false } },
        { id: 'hosts_override', name: 'Hosts File Override Causing Conflict', ticketSubject: 'One user gets wrong IP for intranet — everyone else is fine', ticketDetail: 'A single user\'s workstation resolves intranet.contoso.com to 192.168.1.100 (a developer\'s test server) instead of the production IP 10.0.1.40. Every other workstation resolves correctly. Investigation shows the developer added a hosts file entry during testing 3 months ago and never removed it. The hosts file takes precedence over DNS.', ticketExtra: 'Desktop Note: The file C:\\Windows\\System32\\drivers\\etc\\hosts contains a hardcoded entry: "192.168.1.100 intranet.contoso.com". This entry overrides DNS. Remove it to restore normal resolution.', affectedServer: 0, fixDescription: 'Remove the stale hosts file entry overriding intranet.contoso.com', stateOverrides: { _dnsIssue: 'hosts_override', _fixed: false } }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Use nslookup to check what the DNS server returns.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Check A records, CNAMEs, forwarders, suffix lists, and hosts file.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause in the DNS resolution chain.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after fixing the resolution issue.', cost: 50, penalty: -50 }
    ],
    _scenarioHints: {
        a_missing: [
            { id: 'hint1', text: 'The app works by IP but not by name. The DNS record is missing.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'nslookup hrapp.corp.contoso.com returns NXDOMAIN — no A record.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Add the A record: dnscmd /recordadd corp.contoso.com hrapp A 10.0.2.50', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: dnscmd DNS-01 /recordadd corp.contoso.com hrapp A 10.0.2.50. Verify with nslookup.', cost: 150, penalty: -150 }
        ],
        stale_cname: [
            { id: 'hint1', text: 'The CNAME alias points to a target that no longer exists.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'nslookup helpdesk.contoso.com shows CNAME -> helpdesk-prod.contoso.com (NXDOMAIN).', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Update the CNAME to point to the new host: platform-web-01.contoso.com.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: dnscmd /recorddelete contoso.com helpdesk CNAME, then dnscmd /recordadd contoso.com helpdesk CNAME platform-web-01.contoso.com.', cost: 150, penalty: -150 }
        ],
        forwarder_missing: [
            { id: 'hint1', text: 'Queries for northwind.local fail because our DNS does not know about that domain.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'nslookup anything.northwind.local returns NXDOMAIN. Northwind DNS is at 172.16.1.5.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Add a conditional forwarder: dnscmd /zoneadd northwind.local /forwarder 172.16.1.5', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: dnscmd DNS-01 /zoneadd northwind.local /forwarder 172.16.1.5. Then test: nslookup app.northwind.local.', cost: 150, penalty: -150 }
        ],
        suffix_wrong: [
            { id: 'hint1', text: 'FQDN works but short names fail. Check the DNS suffix search list.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'ipconfig /all shows suffix "contoso.com" instead of "corp.contoso.com".', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix suffix: netsh interface ip set dns suffix "corp.contoso.com" or fix DHCP option 15.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: netsh interface ip set dns suffix corp.contoso.com. Or update DHCP scope option 15.', cost: 150, penalty: -150 }
        ],
        hosts_override: [
            { id: 'hint1', text: 'Only one user is affected. Check for local overrides — the hosts file.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'C:\\Windows\\System32\\drivers\\etc\\hosts has a hardcoded entry for intranet.contoso.com.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Remove the offending line from the hosts file. The entry maps to a dev test server.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: Edit hosts file, remove the line "192.168.1.100 intranet.contoso.com". Then ipconfig /flushdns.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !DNS002Config._flagRestored) { DNS002Config._flagRestored = true; var s = DNS002Config._scenarios[engine.state._scenarioId]; if (s) DNS002Config.hints = DNS002Config._scenarioHints[s.id] || DNS002Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._dnsIssue = null; engine.state._fixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; var o = DNS002Config._scenarios[idx].stateOverrides || {}; for (var k in o) engine.state[k] = o[k]; DNS002Config._flagRestored = true; DNS002Config.hints = DNS002Config._scenarioHints[DNS002Config._scenarios[idx].id] || DNS002Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : DNS002Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _revealFlag(engine, scenario) { engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('DNS issue resolved. Check DNS Manager for recovery token.', 'success'); }, 400); },

    boot: { biosLines: ['Dell PowerEdge R640', 'Memory: 32768 MB OK', 'Loading Windows Server 2022...'], grubEntries: ['Windows Server 2022'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' }, { id: 'dns_manager', label: 'DNS\nManager', icon: 'DNS', app: 'dns_manager' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'DNS-01', startDir: 'C:\\Users\\Administrator', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.20348]\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [{ id: 'hint1', text: 'Query the DNS record with nslookup.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Check records, CNAMEs, forwarders, suffix, hosts.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Fix depends on which part of the resolution chain is broken.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Flag appears after fixing.', cost: 50, penalty: -50 }],
    lore: { intro: 'Internal DNS resolution failures break business applications. When the app says "server not found" for an internal resource, the DNS infrastructure is the first suspect.', scenario: 'Each scenario targets a different part of the DNS resolution chain — records, aliases, forwarders, suffix lists, and local overrides.', outro: 'Internal DNS resolution restored. Applications can find their servers again.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Repair', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        nslookup: function(args, term, engine) {
            var gate = DNS002Config._requireScenario(engine); if (gate) return gate;
            var t = (args[0] || '').toLowerCase(); var s = DNS002Config._getScenario(engine);
            if (!t) return '\nUsage: nslookup <hostname>';
            if (s && s.id === 'a_record_missing' && t.includes('hrapp') && !engine.state._fixed) return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\n*** DNS-01 can\'t find hrapp.corp.contoso.com: Non-existent domain';
            if (s && s.id === 'stale_cname' && t.includes('helpdesk') && !engine.state._fixed) return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nhelpdesk.contoso.com  canonical name = helpdesk-prod.contoso.com\n*** DNS-01 can\'t find helpdesk-prod.contoso.com: Non-existent domain\n\nNote: CNAME target helpdesk-prod.contoso.com no longer exists.';
            if (s && s.id === 'forwarder_missing' && t.includes('northwind') && !engine.state._fixed) return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\n*** DNS-01 can\'t find ' + t + ': Non-existent domain\n\nNo conditional forwarder configured for northwind.local.';
            if (s && s.id === 'suffix_wrong' && !t.includes('.') && !engine.state._fixed) return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\n*** DNS-01 can\'t find ' + t + '.contoso.com: Non-existent domain\n\nNote: Short name "' + t + '" expanded to "' + t + '.contoso.com" (wrong suffix).\nShould expand to "' + t + '.corp.contoso.com".';
            if (s && s.id === 'hosts_override' && t.includes('intranet') && !engine.state._fixed) return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nName:    intranet.contoso.com\nAddress:  192.168.1.100    (FROM HOSTS FILE - overriding DNS)\n\nNote: DNS would return 10.0.1.40 but hosts file overrides to 192.168.1.100.';
            if (t.includes('hrapp')) return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nName:    hrapp.corp.contoso.com\nAddress:  10.0.2.50';
            if (t.includes('helpdesk')) return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nhelpdesk.contoso.com  canonical name = platform-web-01.contoso.com\nName:    platform-web-01.contoso.com\nAddress:  10.0.2.100';
            return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nName:    ' + t + '\nAddress:  10.0.1.40';
        },

        dnscmd: function(args, term, engine) {
            var gate = DNS002Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS002Config._getScenario(engine);
            if (s && s.id === 'a_record_missing' && joined.includes('recordadd') && joined.includes('hrapp') && joined.includes('10.0.2.50')) { DNS002Config._revealFlag(engine, s); return '\nA record added: hrapp.corp.contoso.com -> 10.0.2.50\nCommand completed successfully.'; }
            if (s && s.id === 'stale_cname' && joined.includes('recordadd') && joined.includes('helpdesk') && joined.includes('platform-web-01')) { DNS002Config._revealFlag(engine, s); return '\nCNAME updated: helpdesk.contoso.com -> platform-web-01.contoso.com\nCommand completed successfully.'; }
            if (s && s.id === 'forwarder_missing' && joined.includes('zoneadd') && joined.includes('northwind') && joined.includes('172.16.1.5')) { DNS002Config._revealFlag(engine, s); return '\nConditional forwarder added: northwind.local -> 172.16.1.5\nCommand completed successfully.'; }
            if (joined.includes('recorddelete')) return '\nRecord deleted successfully.';
            return '\nUsage: dnscmd /recordadd <zone> <name> A <ip>\n       dnscmd /recordadd <zone> <name> CNAME <target>\n       dnscmd /zoneadd <zone> /forwarder <ip>';
        },

        netsh: function(args, term, engine) {
            var gate = DNS002Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS002Config._getScenario(engine);
            if (s && s.id === 'suffix_wrong' && joined.includes('suffix') && joined.includes('corp.contoso.com')) { DNS002Config._revealFlag(engine, s); return '\nDNS suffix updated to corp.contoso.com.\nShort names will now resolve correctly.'; }
            return '\nUsage: netsh interface ip set dns suffix corp.contoso.com';
        },

        type: function(args, term, engine) {
            var gate = DNS002Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS002Config._getScenario(engine);
            if (joined.includes('hosts')) {
                if (s && s.id === 'hosts_override' && !engine.state._fixed) return '\n# Copyright (c) 1993-2009 Microsoft Corp.\n#\n# localhost name resolution\n127.0.0.1       localhost\n::1             localhost\n\n# Developer test entry (added 2025-12-15 by jsmith)\n192.168.1.100   intranet.contoso.com\n\nWARNING: This hosts file entry overrides DNS for intranet.contoso.com.';
                return '\n# Copyright (c) 1993-2009 Microsoft Corp.\n127.0.0.1       localhost\n::1             localhost';
            }
            return '\nUsage: type <filename>';
        },

        notepad: function(args, term, engine) {
            var gate = DNS002Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS002Config._getScenario(engine);
            if (s && s.id === 'hosts_override' && joined.includes('hosts')) { DNS002Config._revealFlag(engine, s); return '\nHosts file opened and offending entry removed.\n192.168.1.100 intranet.contoso.com — DELETED\nFile saved.'; }
            return '\nUsage: notepad C:\\Windows\\System32\\drivers\\etc\\hosts';
        },

        ipconfig: function(args, term, engine) {
            var gate = DNS002Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS002Config._getScenario(engine);
            if (joined.includes('/flushdns')) return '\nSuccessfully flushed the DNS Resolver Cache.';
            if (joined.includes('/all')) { var suffix = s && s.id === 'suffix_wrong' && !engine.state._fixed ? 'contoso.com' : 'corp.contoso.com'; return '\nDNS Suffix Search List: ' + suffix + '\nIPv4 Address: 10.0.1.100\nDNS Servers: 10.0.1.5'; }
            return '\nIPv4 Address: 10.0.1.5\nSubnet Mask: 255.255.255.0';
        },

        ping: function(args, term, engine) { var gate = DNS002Config._requireScenario(engine); if (gate) return gate; var t = args[0] || ''; if (t === '172.16.1.5') return '\nReply from 172.16.1.5: bytes=32 time=5ms TTL=62\nPackets: Sent = 4, Received = 4, Lost = 0'; return '\nReply from 10.0.1.5: bytes=32 time<1ms TTL=128'; },
        whoami: function() { return 'DNS-01\\Administrator'; },
        hostname: function() { return 'DNS-01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'dns_manager' && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': DNS002Config._openTicket(iconDef, engine); break;
            case 'dns_manager': DNS002Config._openDNSManager(iconDef, engine); break;
            case 'reset_lab': DNS002Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        DNS002Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) DNS002Config._renderTicket(engine, c); else DNS002Config._renderPicker(engine, c);
    },
    _renderPicker(engine, container) {
        var previews = ['HR — "App works by IP but not by name"', 'Users — "Helpdesk portal NXDOMAIN — CNAME broken"', 'IT Integration — "Cannot resolve partner northwind.local"', 'Desktop — "Short hostnames not resolving on new VLAN"', 'Support — "One user gets wrong IP for intranet"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3a8fd4; font-weight:bold; font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        DNS002Config._scenarios.forEach(function(s, i) { html += '<button class="dns002-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#3a8fd4; font-weight:bold;">DNS-' + (2001 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="dns002Rand" style="padding:10px 28px; background:#3a8fd4; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.dns002-btn').forEach(function(b) { b.addEventListener('click', function() { DNS002Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); DNS002Config._renderTicket(engine, container); }); });
        document.getElementById('dns002Rand').addEventListener('click', function() { DNS002Config._applyScenario(engine, Math.floor(Math.random() * 5)); DNS002Config._renderTicket(engine, container); });
    },
    _renderTicket(engine, container) {
        var s = DNS002Config._getScenario(engine); var names = ['Amanda Lee — HR', 'Help Desk Users', 'Integration Team', 'Desktop Support', 'Single User Report'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#3a8fd4; font-weight:bold;">TICKET #DNS-' + (2001 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem;">URGENT</span></div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">REPORTED BY</div><div>' + names[engine.state._scenarioId] + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + DNS002Config._escHtml(s.ticketSubject) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + DNS002Config._escHtml(s.ticketDetail) + '</div></div>' + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(58,143,212,0.08); border:1px solid rgba(58,143,212,0.2); border-radius:4px; padding:12px; color:#7ec8e3;">' + DNS002Config._escHtml(s.ticketExtra) + '</div></div>' : '') + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — DNS Administrator</div></div>';
    },

    _openDNSManager(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); DNS002Config._renderDNS(engine); return; }
        var c = document.createElement('div'); c.id = 'dns002Mgr'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'DNS Manager', 'DNS', c); DNS002Config._renderDNS(engine);
    },
    _renderDNS(engine) {
        var c = document.getElementById('dns002Mgr'); if (!c) return; var s = DNS002Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#3a8fd4; margin-bottom:16px;">DNS Manager</div>';
        if (engine.state._flagRevealed && s) { html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Resolved:</div><div style="font-size:0.8rem;">' + s.fixDescription + '</div><div id="dns002-flag" style="font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>'; setTimeout(function() { BoxEngine.requestFlagText(s.id).then(function(f) { var el = document.getElementById('dns002-flag'); if (el) el.textContent = 'Recovery token: ' + (f || 'Flag unavailable'); }); }, 0); }
        c.innerHTML = html;
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="dns002RC" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="dns002CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('dns002RC').addEventListener('click', function() { DNS002Config._flagRestored = false; DNS002Config.hints = DNS002Config._defaultHints; engine.reset(); });
        document.getElementById('dns002CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
