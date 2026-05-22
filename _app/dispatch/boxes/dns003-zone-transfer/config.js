/* ============================================================
   DISPATCH LAB — Box DNS003: Zone Transfer Failure
   DNS Troubleshooting — AXFR blocked, serial not incremented,
   notify not configured, ACL too restrictive, TCP 53 blocked
   ============================================================ */

var DNS003Config = {

    title: 'Zone Transfer Failure',
    subtitle: 'Secondary DNS Is Stale — DNS Troubleshooting',
    difficulty: 'Advanced',
    accent: '#3a8fd4',
    storageKey: 'hexworth_lab_dns003',
    registryId: 'dns003-zone-transfer',
    trackerKey: 'lab_dns003',
    tutorialMode: true,
    tutorial: { steps: [
        { title: 'Open the Help Desk Ticket', tip: 'Read the zone transfer failure report.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
        { title: 'Check zone transfer status', tip: 'Use dnscmd or nslookup to check SOA serial numbers on primary vs secondary.', trigger: { event: 'command', match: { cmd: 'contains:nslookup' }, alt: [{ event: 'command', match: { cmd: 'contains:dnscmd' } }] } },
        { title: 'Identify the failure reason', tip: 'Check firewall rules, serial numbers, notify settings, ACLs, and port 53 TCP.', trigger: { event: 'command', match: { cmd: 'contains:netsh' }, alt: [{ event: 'command', match: { cmd: 'contains:dnscmd' } }] } },
        { title: 'Fix the zone transfer', tip: 'Open firewall, increment serial, enable notify, fix ACL, or allow TCP 53.', trigger: { event: 'command', match: { cmd: 'contains:dnscmd' }, alt: [{ event: 'command', match: { cmd: 'contains:netsh' } }] } },
        { title: 'Capture the flag', tip: 'After fixing the zone transfer, the recovery token appears.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
    ] },
    certObjectives: { certPath: 'Network+', mappings: [{ flagId: 'fixed', objective: '1.6', description: 'Explain the use and purpose of network services', skill: 'DNS Zone Transfer Management' }] },
    _servers: [{ name: 'DNS-01', ip: '10.0.1.5', os: 'Windows Server 2022', role: 'Primary DNS' }, { name: 'DNS-02', ip: '10.0.1.6', os: 'Windows Server 2022', role: 'Secondary DNS' }],

    _scenarios: [
        { id: 'axfr_blocked', name: 'AXFR Blocked by Firewall', ticketSubject: 'Secondary DNS not getting zone updates — AXFR connection refused', ticketDetail: 'DNS-02 (secondary) has not received a zone transfer from DNS-01 (primary) in 3 days. The secondary zone data is stale. When DNS-02 attempts an AXFR, the connection is refused. The firewall between the two DNS servers is blocking the zone transfer traffic on TCP port 53.', ticketExtra: 'Firewall Note: A new "deny all" baseline was applied to the inter-server firewall segment. Only UDP 53 was re-allowed for DNS queries. TCP 53 (required for zone transfers) was not included.', affectedServer: 0, fixDescription: 'Allow TCP port 53 between DNS-01 and DNS-02 for zone transfers', stateOverrides: { _ztIssue: 'axfr_blocked', _fixed: false } },
        { id: 'serial_stale', name: 'Serial Number Not Incremented', ticketSubject: 'Records updated on primary but secondary still serves old data', ticketDetail: 'An admin manually edited zone records on DNS-01 but forgot to increment the SOA serial number. DNS-02 checks the serial, sees it has not changed, and skips the zone transfer. Both servers show the same serial number but different record data. The secondary thinks it is up to date when it is not.', ticketExtra: 'Admin Note: Zone records were edited by directly modifying the zone file with notepad. The SOA serial was not updated. Standard practice is to always increment the serial after any zone change. Current serial: 2026032901 on both servers.', affectedServer: 0, fixDescription: 'Increment the SOA serial number on the primary and force a transfer', stateOverrides: { _ztIssue: 'serial_stale', _fixed: false } },
        { id: 'notify_off', name: 'Notify Not Configured', ticketSubject: 'Zone changes take hours to propagate to secondary — no notify', ticketDetail: 'DNS changes made on the primary server take up to 3 hours to appear on the secondary, even though the refresh interval is 3600 seconds (1 hour). The NOTIFY mechanism is not enabled, so DNS-02 only discovers changes when it polls at the refresh interval. Real-time notification would trigger an immediate transfer.', ticketExtra: 'DNS Note: DNS NOTIFY (RFC 1996) allows the primary to immediately inform secondaries when the zone changes. Without it, secondaries must wait until their next SOA refresh check. NOTIFY should be enabled on the primary.', affectedServer: 0, fixDescription: 'Enable DNS NOTIFY on the primary for immediate zone change notification', stateOverrides: { _ztIssue: 'notify_off', _fixed: false } },
        { id: 'acl_restrictive', name: 'Zone Transfer ACL Too Restrictive', ticketSubject: 'New secondary DNS-03 cannot pull zone — transfer denied', ticketDetail: 'A third DNS server (DNS-03, 10.0.1.7) was deployed for redundancy. It is configured as a secondary for contoso.com but zone transfer requests are denied. The primary DNS-01 has a zone transfer ACL that only allows 10.0.1.6 (DNS-02). The new server 10.0.1.7 was never added to the allowed list.', ticketExtra: 'Infrastructure Note: Zone transfer security is configured via "allow transfer" on the primary. Currently only DNS-02 (10.0.1.6) is in the ACL. Add DNS-03 (10.0.1.7) to the allowed list.', affectedServer: 0, fixDescription: 'Add DNS-03 (10.0.1.7) to the zone transfer ACL', stateOverrides: { _ztIssue: 'acl_restrictive', _fixed: false } },
        { id: 'tcp53_blocked', name: 'TCP Port 53 Blocked (UDP Only)', ticketSubject: 'Zone transfer fails — only UDP 53 allowed, TCP 53 required for AXFR', ticketDetail: 'The security team hardened the DNS servers to only allow UDP port 53. However, zone transfers (AXFR/IXFR) require TCP port 53 because zone data often exceeds the 512-byte UDP limit. All zone transfers are failing with connection timeout errors. Regular DNS queries (UDP) still work fine.', ticketExtra: 'Security Note: DNS queries use UDP 53 (and fall back to TCP for large responses). Zone transfers always use TCP 53. Both protocols on port 53 must be allowed between DNS servers.', affectedServer: 0, fixDescription: 'Allow TCP port 53 inbound on DNS-01 for zone transfers', stateOverrides: { _ztIssue: 'tcp53_blocked', _fixed: false } }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Check SOA serial numbers on both primary and secondary DNS servers.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Test zone transfer manually: nslookup, then "set type=AXFR" and query the zone.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Zone transfers need TCP 53, matching serials, NOTIFY, and proper ACLs.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after fixing the transfer.', cost: 50, penalty: -50 }
    ],
    _scenarioHints: {
        axfr_blocked: [{ id: 'hint1', text: 'AXFR is being refused. Check if TCP 53 is allowed between the DNS servers.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Only UDP 53 was re-allowed after the firewall baseline. TCP 53 is blocked.', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Add a firewall rule: netsh advfirewall firewall add rule for TCP 53 from DNS-02.', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: netsh advfirewall firewall add rule name="DNS Zone Transfer" dir=in action=allow protocol=tcp localport=53 remoteip=10.0.1.6', cost: 150, penalty: -150 }],
        serial_stale: [{ id: 'hint1', text: 'Both servers show the same serial but different data. Serial was not incremented.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'nslookup -type=SOA shows serial 2026032901 on both. Primary has newer records.', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Increment serial: dnscmd /recordadd contoso.com @ SOA ... with incremented serial.', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: dnscmd /zonerefresh contoso.com after incrementing serial to 2026033001.', cost: 150, penalty: -150 }],
        notify_off: [{ id: 'hint1', text: 'Changes propagate slowly because the secondary only polls at refresh intervals.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'NOTIFY is disabled on the primary. Secondaries have to wait for refresh timeout.', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Enable NOTIFY: dnscmd /zoneresetsecondaries contoso.com /notify', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: dnscmd DNS-01 /zoneresetsecondaries contoso.com /notify /notifylist 10.0.1.6', cost: 150, penalty: -150 }],
        acl_restrictive: [{ id: 'hint1', text: 'The new secondary is denied. Check the zone transfer ACL on the primary.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'ACL only allows 10.0.1.6 (DNS-02). DNS-03 at 10.0.1.7 is not in the list.', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Add DNS-03 to the ACL: dnscmd /zoneresetsecondaries contoso.com /securelist 10.0.1.6 10.0.1.7', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: dnscmd DNS-01 /zoneresetsecondaries contoso.com /securelist 10.0.1.6 10.0.1.7', cost: 150, penalty: -150 }],
        tcp53_blocked: [{ id: 'hint1', text: 'Zone transfers always use TCP. If only UDP 53 is allowed, AXFR will fail.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'telnet 10.0.1.5 53 times out (TCP blocked). nslookup works (UDP open).', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Allow TCP 53 inbound: netsh advfirewall firewall add rule for TCP 53.', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: netsh advfirewall firewall add rule name="DNS TCP" dir=in action=allow protocol=tcp localport=53', cost: 150, penalty: -150 }]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !DNS003Config._flagRestored) { DNS003Config._flagRestored = true; var s = DNS003Config._scenarios[engine.state._scenarioId]; if (s) DNS003Config.hints = DNS003Config._scenarioHints[s.id] || DNS003Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._ztIssue = null; engine.state._fixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; var o = DNS003Config._scenarios[idx].stateOverrides || {}; for (var k in o) engine.state[k] = o[k]; DNS003Config._flagRestored = true; DNS003Config.hints = DNS003Config._scenarioHints[DNS003Config._scenarios[idx].id] || DNS003Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : DNS003Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _revealFlag(engine) { engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('Zone transfer issue resolved. Check DNS Manager for recovery token.', 'success'); }, 400); },

    boot: { biosLines: ['Dell PowerEdge R640', 'Memory: 32768 MB OK', 'Loading...'], grubEntries: ['Windows Server 2022'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' }, { id: 'dns_manager', label: 'DNS\nManager', icon: 'DNS', app: 'dns_manager' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'DNS-01', startDir: 'C:\\Users\\Administrator', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.20348]\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [{ id: 'hint1', text: 'Check SOA serials on both servers.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Test zone transfer with nslookup.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Zone transfers need TCP 53, correct ACLs, and NOTIFY.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Flag appears after fixing.', cost: 50, penalty: -50 }],
    lore: { intro: 'When zone transfers fail, secondary DNS servers serve stale data. This means some users get correct answers and others get outdated ones — an inconsistency nightmare.', scenario: 'Each scenario breaks a different part of the zone transfer mechanism.', outro: 'Zone transfer restored. Primary and secondary are in sync.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Repair', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        nslookup: function(args, term, engine) {
            var gate = DNS003Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS003Config._getScenario(engine);
            if (joined.includes('soa') || joined.includes('type=soa')) {
                var serial = s && s.id === 'serial_stale' && !engine.state._fixed ? '2026032901 (same on both — but primary has newer records!)' : '2026033001';
                return '\ncontoso.com\n  primary name server = DNS-01.contoso.com\n  responsible mail addr = admin.contoso.com\n  serial  = ' + serial + '\n  refresh = 3600\n  retry   = 900\n  expire  = 604800\n  default TTL = 86400';
            }
            if (joined.includes('axfr')) {
                if (s && !engine.state._fixed) {
                    if (s.id === 'axfr_blocked' || s.id === 'tcp53_blocked') return '\n*** Can\'t list domain contoso.com: Connection refused (TCP 53 blocked)\nZone transfer requires TCP port 53. Check firewall rules.';
                    if (s.id === 'acl_restrictive') return '\n*** Can\'t list domain contoso.com: Transfer refused\nZone transfer denied by server. Check transfer ACL on primary.';
                }
                return '\ncontoso.com.    SOA    DNS-01.contoso.com admin.contoso.com 2026033001 3600 900 604800 86400\ncontoso.com.    NS     DNS-01.contoso.com\ncontoso.com.    NS     DNS-02.contoso.com\nportal          A      10.0.1.40\napi             A      10.0.1.70\nmail            A      10.0.1.15\n\nZone transfer complete. 6 records transferred.';
            }
            return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nName:    contoso.com\nAddress:  10.0.1.40';
        },
        dnscmd: function(args, term, engine) {
            var gate = DNS003Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS003Config._getScenario(engine);
            if (s && s.id === 'serial_stale' && (joined.includes('zonerefresh') || (joined.includes('serial') && joined.includes('2026033')))) { DNS003Config._revealFlag(engine); return '\nZone serial incremented to 2026033001.\nZone refresh triggered. DNS-02 will pull updated records.\nCommand completed successfully.'; }
            if (s && s.id === 'notify_off' && joined.includes('notify')) { DNS003Config._revealFlag(engine); return '\nZone notify enabled for contoso.com.\nNotify list: 10.0.1.6\nCommand completed successfully.'; }
            if (s && s.id === 'acl_restrictive' && joined.includes('securelist') && joined.includes('10.0.1.7')) { DNS003Config._revealFlag(engine); return '\nZone transfer ACL updated.\nAllowed: 10.0.1.6, 10.0.1.7\nCommand completed successfully.'; }
            if (joined.includes('zoneinfo')) {
                var notify = s && s.id === 'notify_off' && !engine.state._fixed ? 'Disabled' : 'Enabled';
                var acl = s && s.id === 'acl_restrictive' && !engine.state._fixed ? '10.0.1.6 only' : '10.0.1.6, 10.0.1.7';
                return '\nZone info for contoso.com:\n  Type: Primary\n  Zone file: contoso.com.dns\n  Dynamic update: Secure only\n  Zone transfers: Allowed to listed servers\n  Transfer ACL: ' + acl + '\n  Notify: ' + notify + '\n  Serial: ' + (s && s.id === 'serial_stale' && !engine.state._fixed ? '2026032901' : '2026033001');
            }
            return '\nUsage: dnscmd /zoneinfo <zone>\n       dnscmd /zonerefresh <zone>\n       dnscmd /zoneresetsecondaries <zone> /securelist <ip> [<ip>...]\n       dnscmd /zoneresetsecondaries <zone> /notify /notifylist <ip>';
        },
        netsh: function(args, term, engine) {
            var gate = DNS003Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS003Config._getScenario(engine);
            if ((s && (s.id === 'axfr_blocked' || s.id === 'tcp53_blocked')) && joined.includes('tcp') && joined.includes('53')) { DNS003Config._revealFlag(engine); return '\nOk.\nFirewall rule added: Allow TCP 53 inbound for zone transfers.\nZone transfers should now succeed.'; }
            if (joined.includes('show') && joined.includes('firewall')) {
                var tcp53 = s && (s.id === 'axfr_blocked' || s.id === 'tcp53_blocked') && !engine.state._fixed ? 'Block' : 'Allow';
                return '\nInbound Rules:\n  DNS (UDP-In): Allow UDP 53\n  DNS (TCP-In): ' + tcp53 + ' TCP 53';
            }
            return '\nUsage: netsh advfirewall firewall add rule name="DNS TCP" dir=in action=allow protocol=tcp localport=53';
        },
        telnet: function(args, term, engine) {
            var gate = DNS003Config._requireScenario(engine); if (gate) return gate;
            var s = DNS003Config._getScenario(engine);
            if (args[1] === '53') {
                if (s && (s.id === 'axfr_blocked' || s.id === 'tcp53_blocked') && !engine.state._fixed) return '\nConnecting To ' + args[0] + '...\nConnection timed out on port 53 (TCP).\nTCP port 53 appears to be blocked.';
                return '\nConnecting To ' + args[0] + '...\nConnected to ' + args[0] + ' on port 53 (TCP).';
            }
            return '\nUsage: telnet <host> <port>';
        },
        ping: function(args, term, engine) { var gate = DNS003Config._requireScenario(engine); if (gate) return gate; return '\nReply from 10.0.1.5: bytes=32 time<1ms TTL=128'; },
        whoami: function() { return 'DNS-01\\Administrator'; },
        hostname: function() { return 'DNS-01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ipconfig: function() { return '\nIPv4 Address: 10.0.1.5\nDNS Servers: 10.0.1.5, 10.0.1.6'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'dns_manager' && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': DNS003Config._openTicket(iconDef, engine); break;
            case 'dns_manager': DNS003Config._openDNS(iconDef, engine); break;
            case 'reset_lab': DNS003Config._confirmReset(engine); break;
        }
    },
    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c); DNS003Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) DNS003Config._renderTicket(engine, c); else DNS003Config._renderPicker(engine, c);
    },
    _renderPicker(engine, c) {
        var previews = ['NOC — "AXFR blocked between DNS servers"', 'DNS Admin — "Serial not updated after manual edit"', 'DNS Admin — "Changes take hours to propagate"', 'Infra — "New secondary DNS-03 transfer denied"', 'Security — "TCP 53 blocked, only UDP allowed"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3a8fd4; font-weight:bold; font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        DNS003Config._scenarios.forEach(function(s, i) { html += '<button class="dns003-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#3a8fd4; font-weight:bold;">DNS-' + (3001 + i) + '</span><span style="background:#f39c12; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">HIGH</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="dns003Rand" style="padding:10px 28px; background:#3a8fd4; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        c.innerHTML = html;
        c.querySelectorAll('.dns003-btn').forEach(function(b) { b.addEventListener('click', function() { DNS003Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); DNS003Config._renderTicket(engine, c); }); });
        document.getElementById('dns003Rand').addEventListener('click', function() { DNS003Config._applyScenario(engine, Math.floor(Math.random() * 5)); DNS003Config._renderTicket(engine, c); });
    },
    _renderTicket(engine, c) {
        var s = DNS003Config._getScenario(engine); var names = ['NOC Alert', 'DNS Admin — Brian Cole', 'DNS Admin — Brian Cole', 'Infra Team — Karen Wu', 'Security — Alex Rivera'];
        c.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#3a8fd4; font-weight:bold;">TICKET #DNS-' + (3001 + engine.state._scenarioId) + '</span><span style="background:#f39c12; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem;">HIGH</span></div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">REPORTED BY</div><div>' + names[engine.state._scenarioId] + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + DNS003Config._escHtml(s.ticketSubject) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + DNS003Config._escHtml(s.ticketDetail) + '</div></div>' + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(58,143,212,0.08); border:1px solid rgba(58,143,212,0.2); border-radius:4px; padding:12px; color:#7ec8e3;">' + DNS003Config._escHtml(s.ticketExtra) + '</div></div>' : '') + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — DNS Administrator</div></div>';
    },
    _openDNS(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); DNS003Config._renderDNS(engine); return; }
        var c = document.createElement('div'); c.id = 'dns003Mgr'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'DNS Manager', 'DNS', c); DNS003Config._renderDNS(engine);
    },
    _renderDNS(engine) {
        var c = document.getElementById('dns003Mgr'); if (!c) return; var s = DNS003Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#3a8fd4; margin-bottom:16px;">DNS Manager — Zone Transfer Status</div>';
        html += '<div style="padding:8px 12px; margin-bottom:8px; background:' + (engine.state._fixed ? 'rgba(46,204,113,0.06)' : 'rgba(231,76,60,0.06)') + '; border:1px solid ' + (engine.state._fixed ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)') + '; border-radius:4px;"><div style="font-weight:bold;">contoso.com Zone Transfer</div><div style="color:' + (engine.state._fixed ? '#2ecc71' : '#e74c3c') + ';">' + (engine.state._fixed ? 'Healthy — Last transfer: just now' : 'Failed — Last successful transfer: 3 days ago') + '</div></div>';
        if (engine.state._flagRevealed && s) { html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Resolved:</div><div style="font-size:0.8rem;">' + s.fixDescription + '</div><div id="dns003-flag" style="font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>'; setTimeout(function() { BoxEngine.requestFlagText(s.id).then(function(f) { var el = document.getElementById('dns003-flag'); if (el) el.textContent = 'Recovery token: ' + (f || 'Flag unavailable'); }); }, 0); }
        c.innerHTML = html;
    },
    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="dns003RC" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="dns003CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('dns003RC').addEventListener('click', function() { DNS003Config._flagRestored = false; DNS003Config.hints = DNS003Config._defaultHints; engine.reset(); });
        document.getElementById('dns003CC').addEventListener('click', function() { o.remove(); }); o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
