/* ============================================================
   DISPATCH LAB — Box NT012: Asymmetric Routing
   Network+ N10-009
   5 distinct scenarios
   ============================================================ */

var NT012Config = {

    title: 'Asymmetric Routing',
    subtitle: 'Return Traffic Taking Different Path Breaking Stateful Firewall',
    difficulty: 'Advanced',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_nt012',
    registryId: 'nt012-asymmetric-routing',
    trackerKey: 'lab_nt012',

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
        mappings: [{ flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network issues', skill: 'Asymmetric Routing & Stateful Firewall' }]
    },

    _alerts: [{ id: 'NT012-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { ecmp_asym: null, isp_asym: null, vrf_leak: null, nat_asym: null, cluster_asym: null },

    _scenarios: [
        {
            id: 'ecmp_asym',
            name: 'ECMP Asymmetric Path',
            ticketSubject: 'Stateful firewall dropping return traffic due to ECMP sending it on different path',
            ticketDetail: 'The stateful firewall is dropping 30% of return TCP packets because ECMP (Equal-Cost Multi-Path) routing is sending return traffic through a different firewall than the outbound path. The firewall has no session state for these flows and drops them as invalid. Users experience intermittent connection resets.',
            ticketExtra: 'NOC Note: Two default routes with equal metrics to ISP1 and ISP2. Outbound goes through FW1, but return comes back through FW2 which has no session entry. Fix: (1) Use policy-based routing to ensure symmetric paths, (2) Enable firewall session sync between FW1/FW2, (3) Adjust ECMP hash to include src/dst for flow affinity.',
            affectedHost: 0,
            fixDescription: 'Configure policy routing or firewall session sync for symmetric flows',
            stateOverrides: { _ecmpAsym: true, _fwDropping: true }
        },
        {
            id: 'isp_asym',
            name: 'ISP Return Path',
            ticketSubject: 'ISP routing return traffic through different peering point',
            ticketDetail: 'Traceroute shows outbound traffic to partner network going through ISP-A, but return traffic coming back through ISP-B. The stateful firewall on ISP-A path has no session for the return traffic. BGP AS-path prepending on ISP-B is not long enough to discourage return traffic.',
            ticketExtra: 'NOC Note: Need to make ISP-B path less preferred for return traffic. Options: (1) Add more AS-path prepends on ISP-B, (2) Use BGP communities to signal preference, (3) Deploy firewall cluster with shared session state across both ISP links.',
            affectedHost: 0,
            fixDescription: 'Adjust BGP attributes to enforce symmetric ISP path',
            stateOverrides: { _ispAsym: true, _bgpImbalance: true }
        },
        {
            id: 'vrf_leak',
            name: 'VRF Leak',
            ticketSubject: 'Traffic leaking between VRFs causing asymmetric return through wrong VRF',
            ticketDetail: 'A route leak between VRF-A (corporate) and VRF-B (guest) is causing guest traffic to return through the corporate VRF firewall. The corporate firewall drops guest return traffic as unauthorized. Guest users experience 50% packet loss.',
            ticketExtra: 'NOC Note: A static route in VRF-B incorrectly points to a next-hop in VRF-A. This causes return traffic to traverse the corporate path. Fix the static route and verify VRF isolation. Also check for any import/export route-target misconfigurations.',
            affectedHost: 0,
            fixDescription: 'Fix VRF route leak and verify isolation between VRFs',
            stateOverrides: { _vrfLeak: true, _routeLeaking: true }
        },
        {
            id: 'nat_asym',
            name: 'NAT Asymmetric',
            ticketSubject: 'NAT device only on one path — return traffic bypasses NAT translation',
            ticketDetail: 'Outbound traffic goes through a NAT device for address translation, but return traffic is routed around it. The return packets have the original destination IP (pre-NAT) which doesnt match any internal host. All translated connections fail after initial SYN-ACK.',
            ticketExtra: 'NOC Note: The NAT device is only in the primary path. The secondary path (used for return traffic due to OSPF cost) bypasses NAT. Either ensure NAT is in both paths, or adjust OSPF costs to force symmetric routing through the NAT device.',
            affectedHost: 0,
            fixDescription: 'Adjust OSPF costs to force traffic through NAT device symmetrically',
            stateOverrides: { _natAsym: true, _ospfCost: true }
        },
        {
            id: 'cluster_asym',
            name: 'Firewall Cluster Split',
            ticketSubject: 'Active-active firewall cluster not syncing sessions — each node drops others traffic',
            ticketDetail: 'The active-active firewall cluster (FW1 + FW2) has lost session synchronization. Each firewall only knows about sessions it initiated. When load balancing sends a packet to the wrong firewall, it gets dropped. Session sync heartbeat interface went down after a cable was accidentally unplugged during rack maintenance.',
            ticketExtra: 'NOC Note: The HA session sync link (dedicated crossover cable between FW1 and FW2) is physically disconnected. Port Gi0/3 on both firewalls shows DOWN. Reconnect the sync cable and verify session table replication is working.',
            affectedHost: 0,
            fixDescription: 'Reconnect firewall HA session sync link',
            stateOverrides: { _clusterSplit: true, _syncDown: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        ecmp_asym: [
            { id: 'hint1', text: 'Run "status" to check routing and firewall drop stats.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'ECMP sending return traffic through wrong firewall. 30% drops.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Configure policy-based routing for symmetric path enforcement.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix policy-route" to enforce symmetric routing.', cost: 150, penalty: -150 }
        ],
        isp_asym: [
            { id: 'hint1', text: 'Run "status" to check BGP path attributes.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Return traffic on ISP-B due to insufficient AS-path prepending.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Add more prepends on ISP-B or use communities for path preference.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix bgp-prepend" to fix asymmetric ISP routing.', cost: 150, penalty: -150 }
        ],
        vrf_leak: [
            { id: 'hint1', text: 'Run "status" to check VRF routing tables.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Route leak from VRF-B to VRF-A causing cross-VRF traffic.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Remove incorrect static route and verify VRF isolation.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix vrf-isolate" to restore proper VRF separation.', cost: 150, penalty: -150 }
        ],
        nat_asym: [
            { id: 'hint1', text: 'Run "status" to check NAT and OSPF configuration.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Return traffic bypassing NAT due to lower OSPF cost on alternate path.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Adjust OSPF interface costs to prefer the NAT path.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix ospf-cost" to force symmetric NAT routing.', cost: 150, penalty: -150 }
        ],
        cluster_asym: [
            { id: 'hint1', text: 'Run "status" to check firewall cluster sync status.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'HA sync link down — Gi0/3 disconnected. No session sharing.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Reconnect the sync cable between FW1 and FW2.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix reconnect-sync" to restore firewall cluster synchronization.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !NT012Config._flagRestored) {
            NT012Config._flagRestored = true;
            var s = NT012Config._scenarios[engine.state._scenarioId];
            if (s) NT012Config.hints = NT012Config._scenarioHints[s.id] || NT012Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_ecmpAsym','_fwDropping','_ispAsym','_bgpImbalance','_vrfLeak','_routeLeaking','_natAsym','_ospfCost','_clusterSplit','_syncDown','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = NT012Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        NT012Config._flagRestored = true;
        NT012Config.hints = NT012Config._scenarioHints[NT012Config._scenarios[idx].id] || NT012Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : NT012Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['System Boot...', 'Loading diagnostic tools...', 'Monitoring active', 'Console ready'], grubEntries: ['Primary', 'Recovery'], loginUser: 'Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Dashboard', icon: 'DSH', app: 'dashboard' }, { id: 'logs', label: 'Log\nViewer', icon: 'LOG', app: 'logs' }, { id: 'ticket', label: 'Alert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'admin', hostname: 'WS-01', startDir: '/home/admin', promptStyle: 'linux', welcome: 'Asymmetric Routing Diagnostic Console\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the dashboard.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a unique cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix it and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'A asymmetric routing incident has been detected. Investigate and respond systematically.', scenario: 'Each scenario presents a different aspect of asymmetric routing — requiring thorough investigation and remediation.', outro: 'Incident resolved. Your systematic response contained and remediated the asymmetric routing effectively.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = NT012Config._requireScenario(engine); if (gate) return gate;
            var s = NT012Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'ecmp_asym') return '\nECMP Asymmetric Path: Active incident. Investigate.';
            if (s && s.id === 'isp_asym') return '\nISP Return Path: Active incident. Investigate.';
            if (s && s.id === 'vrf_leak') return '\nVRF Leak: Active incident. Investigate.';
            if (s && s.id === 'nat_asym') return '\nNAT Asymmetric: Active incident. Investigate.';
            if (s && s.id === 'cluster_asym') return '\nFirewall Cluster Split: Active incident. Investigate.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = NT012Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = NT012Config._getScenario(engine);
            if (s && s.id === 'ecmp_asym') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'isp_asym') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'vrf_leak') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'nat_asym') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'cluster_asym') return '\nRoot cause identified. Apply fix.';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = NT012Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = NT012Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'ecmp_asym' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nConfigure policy routing or firewall session sync for symmetric flows completed.\n\n=== FLAG: NT012{ecmp_asym_resolved} ===';
            }
            if (s && s.id === 'isp_asym' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nAdjust BGP attributes to enforce symmetric ISP path completed.\n\n=== FLAG: NT012{isp_asym_resolved} ===';
            }
            if (s && s.id === 'vrf_leak' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nFix VRF route leak and verify isolation between VRFs completed.\n\n=== FLAG: NT012{vrf_leak_resolved} ===';
            }
            if (s && s.id === 'nat_asym' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nAdjust OSPF costs to force traffic through NAT device symmetrically completed.\n\n=== FLAG: NT012{nat_asym_resolved} ===';
            }
            if (s && s.id === 'cluster_asym' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nReconnect firewall HA session sync link completed.\n\n=== FLAG: NT012{cluster_asym_resolved} ===';
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
            case 'ticket': NT012Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: NT012Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Asymmetric Routing Alert', 'TKT', c);
        NT012Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) NT012Config._renderTicket(engine, c); else NT012Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Team — "Stateful firewall dropping return traffic due to ECMP sendin..."','Team — "ISP routing return traffic through different peering point..."','Team — "Traffic leaking between VRFs causing asymmetric return throu..."','Team — "NAT device only on one path — return traffic bypasses NAT tr..."','Team — "Active-active firewall cluster not syncing sessions — each n..."'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#f59e0b;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        NT012Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#f59e0b;font-weight:bold;">NT012-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#f59e0b;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { NT012Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); NT012Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { NT012Config._applyScenario(engine, Math.floor(Math.random()*NT012Config._scenarios.length)); NT012Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = NT012Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#f59e0b;font-weight:bold;font-size:1rem;">INCIDENT #NT012-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+NT012Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+NT012Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #f59e0b33;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+NT012Config._escHtml(s.ticketExtra)+'</div></div>':'')
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