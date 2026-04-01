/* ============================================================
   DISPATCH LAB — Box NT014: DHCP Starvation
   Network+ N10-009
   5 distinct scenarios
   ============================================================ */

var NT014Config = {

    title: 'DHCP Starvation',
    subtitle: 'Legitimate Clients Cannot Get IP Addresses',
    difficulty: 'Intermediate',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_nt014',
    registryId: 'nt014-dhcp-starvation',
    trackerKey: 'lab_nt014',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Alert', tip: 'Read the incident report.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check the Dashboard', tip: 'Review system status.', trigger: { event: 'window_open', match: { type: 'dashboard' } } },
            { title: 'Investigate', tip: 'Use terminal tools to diagnose.', trigger: { event: 'command', match: { cmd: 'contains:status' } } },
            { title: 'Apply the fix', tip: 'Resolve the issue.', trigger: { event: 'command', match: { cmd: 'contains:fix' } } },
            { title: 'Capture the flag', tip: 'Flag appears after fix.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Network+ N10-009',
        mappings: [{ flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network issues', skill: 'DHCP Security & Snooping' }]
    },

    _alerts: [{ id: 'NT014-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { scope_exhausted: null, rogue_dhcp: null, starvation_attack: null, relay_miscfg: null, conflict_detect: null },

    _scenarios: [
        {
            id: 'scope_exhausted',
            name: 'Scope Exhausted',
            ticketSubject: 'DHCP scope has 0 available leases — 50 new devices cannot get IP addresses',
            ticketDetail: 'The DHCP scope for VLAN 10 (10.0.10.0/24) has all 254 addresses leased. 50 new devices (contractor laptops) cannot get IP addresses. Many of the existing leases belong to devices that are no longer on the network but have 7-day lease durations. The scope was sized for 200 devices but the network has grown.',
            ticketExtra: 'NOC Note: Options: (1) Reduce lease duration from 7 days to 4 hours to reclaim stale leases faster, (2) Expand scope to a /23, (3) Clean up stale reservations, (4) Create a separate VLAN for contractors. Immediate fix: release stale leases manually.',
            affectedHost: 0,
            fixDescription: 'Clean stale leases and expand DHCP scope',
            stateOverrides: { _scopeFull: true, _staleLeases: true }
        },
        {
            id: 'rogue_dhcp',
            name: 'Rogue DHCP Server',
            ticketSubject: 'Unauthorized DHCP server handing out wrong gateway — users losing internet',
            ticketDetail: 'A rogue DHCP server at 10.0.10.88 (someones personal router plugged into the network) is responding to DHCP requests faster than the legitimate server. Its handing out 192.168.1.1 as the default gateway, which doesnt exist on this VLAN. Affected users lose internet connectivity.',
            ticketExtra: 'NOC Note: DHCP snooping is not enabled. The rogue server is a consumer WiFi router with its WAN port plugged into the corporate network (should have been the LAN port). Enable DHCP snooping, trust only the legitimate DHCP server port, and find/disconnect the rogue device.',
            affectedHost: 0,
            fixDescription: 'Enable DHCP snooping and disconnect rogue server',
            stateOverrides: { _rogueDHCP: true, _wrongGateway: true }
        },
        {
            id: 'starvation_attack',
            name: 'DHCP Starvation Attack',
            ticketSubject: 'All leases consumed by spoofed MAC addresses — denial of service',
            ticketDetail: 'IDS detected a DHCP starvation attack — a single device is generating thousands of DHCP requests with random spoofed MAC addresses, consuming all available leases. Legitimate devices cannot obtain IP addresses. The attack is originating from port Gi1/0/24 on SW-ACC-03.',
            ticketExtra: 'Security Note: DHCP starvation uses tools like Yersinia or dhcpstarv to exhaust the DHCP pool. Countermeasures: (1) Port security to limit MAC addresses per port, (2) DHCP snooping rate limiting, (3) 802.1X to authenticate devices before granting network access.',
            affectedHost: 0,
            fixDescription: 'Enable port security and DHCP snooping rate limiting',
            stateOverrides: { _starvationAttack: true, _spoofedMACs: true }
        },
        {
            id: 'relay_miscfg',
            name: 'DHCP Relay Misconfigured',
            ticketSubject: 'New VLAN has no IP helper — DHCP Discover broadcasts not reaching server',
            ticketDetail: 'VLAN 20 was created last week for a new department but nobody configured the IP helper-address (DHCP relay) on the VLAN interface. DHCP Discover broadcasts from VLAN 20 clients never reach the DHCP server on VLAN 1. All 30 users on VLAN 20 have self-assigned 169.254.x.x addresses.',
            ticketExtra: 'NOC Note: DHCP relay (ip helper-address) is needed when the DHCP server is on a different VLAN/subnet. The VLAN 20 SVI (interface vlan 20) exists with IP 10.0.20.1/24 but has no helper-address configured. Add: ip helper-address 10.0.1.10 (DHCP server). Also verify the DHCP server has a scope for 10.0.20.0/24.',
            affectedHost: 0,
            fixDescription: 'Configure DHCP relay and verify server scope',
            stateOverrides: { _noRelay: true, _apipa: true }
        },
        {
            id: 'conflict_detect',
            name: 'IP Conflicts',
            ticketSubject: 'DHCP and static IPs overlapping — duplicate IP conflicts on network',
            ticketDetail: 'Network monitoring shows 8 duplicate IP address conflicts on VLAN 10. The DHCP scope covers 10.0.10.1-254 but servers, printers, and network devices have static IPs within this range. DHCP occasionally assigns an IP already in use by a static device, causing both to lose connectivity intermittently.',
            ticketExtra: 'NOC Note: The DHCP scope should have exclusion ranges for static IPs. Currently no exclusions are configured. Known static devices: 10.0.10.1-20 (network infrastructure), 10.0.10.240-254 (printers). Also enable conflict detection (ping check before lease) on the DHCP server.',
            affectedHost: 0,
            fixDescription: 'Add DHCP exclusion ranges and enable conflict detection',
            stateOverrides: { _ipConflicts: true, _noExclusions: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        scope_exhausted: [
            { id: 'hint1', text: 'Run "status" to check DHCP scope utilization.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '0 available leases, 7-day duration, many stale. 50 devices waiting.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Clean stale leases, reduce lease time, expand scope.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix expand-scope" to free addresses and expand capacity.', cost: 150, penalty: -150 }
        ],
        rogue_dhcp: [
            { id: 'hint1', text: 'Run "status" to detect rogue DHCP servers.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Rogue DHCP at 10.0.10.88 handing out wrong gateway.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable DHCP snooping, trust only the real server port.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix enable-snooping" to block rogue DHCP.', cost: 150, penalty: -150 }
        ],
        starvation_attack: [
            { id: 'hint1', text: 'Run "status" to check DHCP and port security.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Starvation attack from Gi1/0/24 with spoofed MACs.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable port security (max 5 MACs) and snooping rate limit.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix port-security-snooping" to stop the attack.', cost: 150, penalty: -150 }
        ],
        relay_miscfg: [
            { id: 'hint1', text: 'Run "status" to check VLAN 20 DHCP configuration.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'No ip helper-address on VLAN 20 SVI. DHCP broadcasts not relayed.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Add IP helper-address pointing to DHCP server.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix add-helper" to configure DHCP relay.', cost: 150, penalty: -150 }
        ],
        conflict_detect: [
            { id: 'hint1', text: 'Run "status" to check for IP conflicts and DHCP exclusions.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'No exclusion ranges. DHCP assigning IPs used by static devices.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Add exclusion ranges for static IPs and enable conflict detection.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix add-exclusions" to prevent IP conflicts.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !NT014Config._flagRestored) {
            NT014Config._flagRestored = true;
            var s = NT014Config._scenarios[engine.state._scenarioId];
            if (s) NT014Config.hints = NT014Config._scenarioHints[s.id] || NT014Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_scopeFull','_staleLeases','_rogueDHCP','_wrongGateway','_starvationAttack','_spoofedMACs','_noRelay','_apipa','_ipConflicts','_noExclusions','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = NT014Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        NT014Config._flagRestored = true;
        NT014Config.hints = NT014Config._scenarioHints[NT014Config._scenarios[idx].id] || NT014Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : NT014Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['System Boot...', 'Loading diagnostic tools...', 'Monitoring active', 'Console ready'], grubEntries: ['Primary', 'Recovery'], loginUser: 'Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Dashboard', icon: 'DSH', app: 'dashboard' }, { id: 'logs', label: 'Log\nViewer', icon: 'LOG', app: 'logs' }, { id: 'ticket', label: 'Alert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'admin', hostname: 'WS-01', startDir: '/home/admin', promptStyle: 'linux', welcome: 'DHCP Starvation Diagnostic Console\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the dashboard.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a unique cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix it and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'A dhcp starvation incident has been detected. Investigate and respond systematically.', scenario: 'Each scenario presents a different aspect of dhcp starvation — requiring thorough investigation and remediation.', outro: 'Incident resolved. Your systematic response contained and remediated the dhcp starvation effectively.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = NT014Config._requireScenario(engine); if (gate) return gate;
            var s = NT014Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'scope_exhausted') return '\nScope Exhausted: Active incident. Investigate.';
            if (s && s.id === 'rogue_dhcp') return '\nRogue DHCP Server: Active incident. Investigate.';
            if (s && s.id === 'starvation_attack') return '\nDHCP Starvation Attack: Active incident. Investigate.';
            if (s && s.id === 'relay_miscfg') return '\nDHCP Relay Misconfigured: Active incident. Investigate.';
            if (s && s.id === 'conflict_detect') return '\nIP Conflicts: Active incident. Investigate.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = NT014Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = NT014Config._getScenario(engine);
            if (s && s.id === 'scope_exhausted') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'rogue_dhcp') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'starvation_attack') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'relay_miscfg') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'conflict_detect') return '\nRoot cause identified. Apply fix.';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = NT014Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = NT014Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'scope_exhausted' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nClean stale leases and expand DHCP scope completed.\n\n=== FLAG: NT014{scope_exhausted_resolved} ===';
            }
            if (s && s.id === 'rogue_dhcp' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nEnable DHCP snooping and disconnect rogue server completed.\n\n=== FLAG: NT014{rogue_dhcp_resolved} ===';
            }
            if (s && s.id === 'starvation_attack' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nEnable port security and DHCP snooping rate limiting completed.\n\n=== FLAG: NT014{starvation_attack_resolved} ===';
            }
            if (s && s.id === 'relay_miscfg' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nConfigure DHCP relay and verify server scope completed.\n\n=== FLAG: NT014{relay_miscfg_resolved} ===';
            }
            if (s && s.id === 'conflict_detect' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nAdd DHCP exclusion ranges and enable conflict detection completed.\n\n=== FLAG: NT014{conflict_detect_resolved} ===';
            }
            return '\nUsage: fix <action>. Run "investigate" first for available actions.';
        },


        whoami: function() { return 'admin'; },
        hostname: function() { return 'WS-01'; },
        clear: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ls: function() { return 'configs  logs  scripts  tools'; },
        dir: function() { return ' Directory of current folder\n  configs  logs  scripts  tools'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app !== 'ticket' && iconDef.app !== 'terminal' && iconDef.app !== 'hints' && iconDef.app !== 'reset_lab' && !engine.state._scenarioSelected) { engine.notify('Open the Alert first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': NT014Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: NT014Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'DHCP Starvation Alert', 'TKT', c);
        NT014Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) NT014Config._renderTicket(engine, c); else NT014Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Team — "DHCP scope has 0 available leases — 50 new devices cannot ge..."','Team — "Unauthorized DHCP server handing out wrong gateway — users l..."','Team — "All leases consumed by spoofed MAC addresses — denial of ser..."','Team — "New VLAN has no IP helper — DHCP Discover broadcasts not rea..."','Team — "DHCP and static IPs overlapping — duplicate IP conflicts on ..."'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#f59e0b;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        NT014Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#f59e0b;font-weight:bold;">NT014-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#f59e0b;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { NT014Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); NT014Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { NT014Config._applyScenario(engine, Math.floor(Math.random()*NT014Config._scenarios.length)); NT014Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = NT014Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#f59e0b;font-weight:bold;font-size:1rem;">INCIDENT #NT014-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+NT014Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+NT014Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #f59e0b33;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+NT014Config._escHtml(s.ticketExtra)+'</div></div>':'')
            +'<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;color:#2ecc71;font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openInfoWin(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:16px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, iconDef.label.replace('\n',' '), iconDef.icon, c);
        c.innerHTML = '<div style="color:#f59e0b;font-weight:bold;font-size:1rem;margin-bottom:12px;">'+iconDef.label.replace('\n',' ')+'</div><div style="color:#888;">Use terminal commands for diagnostics.</div>';
    }
};