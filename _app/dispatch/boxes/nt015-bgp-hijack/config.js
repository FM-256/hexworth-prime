/* ============================================================
   DISPATCH LAB — Box NT015: BGP Route Hijack
   Network+ N10-009 / Security+
   5 distinct scenarios
   ============================================================ */

var NT015Config = {

    title: 'BGP Route Hijack',
    subtitle: 'Traffic to Partner AS Being Routed Through Unknown Transit',
    difficulty: 'Advanced',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_nt015',
    registryId: 'nt015-bgp-hijack',
    trackerKey: 'lab_nt015',

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
        certPath: 'Network+ N10-009 / Security+',
        mappings: [{ flagId: 'fixed', objective: '2.1', description: 'Explain routing concepts', skill: 'BGP Security & RPKI Validation' }]
    },

    _alerts: [{ id: 'NT015-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { prefix_hijack: null, route_leak: null, path_manipulation: null, peer_flap: null, missing_rpki: null },

    _scenarios: [
        {
            id: 'prefix_hijack',
            name: 'Prefix Hijack',
            ticketSubject: 'Partner AS prefix being announced by unknown AS — traffic misdirected',
            ticketDetail: 'Traffic to partner network 198.51.100.0/24 (AS 65200) is being routed through an unknown AS 65999 instead of the direct peering link. BGP table shows AS 65999 announcing a more specific /25 prefix that wins over the legitimate /24. This is a classic prefix hijack.',
            ticketExtra: 'NOC Note: AS 65999 is announcing 198.51.100.0/25 and 198.51.100.128/25 (more specific than the legitimate /24). More specific prefixes always win in BGP. Options: (1) Have partner announce /25s themselves, (2) Filter routes from AS 65999, (3) Implement RPKI ROV to validate route origins.',
            affectedHost: 0,
            fixDescription: 'Filter hijacked routes and implement RPKI validation',
            stateOverrides: { _prefixHijack: true, _moreSpecific: true }
        },
        {
            id: 'route_leak',
            name: 'BGP Route Leak',
            ticketSubject: 'Customer AS leaking full routing table into our network — 900K routes overwhelming router',
            ticketDetail: 'A customer AS (65300) is leaking the full internet routing table (900,000+ routes) into our network instead of just their prefixes. Our edge router memory is at 95% and the routing table is unstable. This happened after the customer misconfigured their route export policy.',
            ticketExtra: 'NOC Note: The customer should only be announcing their own prefixes (~50 routes). They are leaking 900K routes. Our inbound prefix filter is missing for this peer. Immediate: add max-prefix limit (shut peer if exceeded), then apply a proper inbound filter allowing only customer-owned prefixes.',
            affectedHost: 0,
            fixDescription: 'Apply prefix filters and max-prefix limits on customer peer',
            stateOverrides: { _routeLeak: true, _tableOverflow: true }
        },
        {
            id: 'path_manipulation',
            name: 'AS Path Manipulation',
            ticketSubject: 'Traffic taking 12-hop path instead of 3-hop direct — AS path poisoning',
            ticketDetail: 'Latency to a critical SaaS provider tripled. BGP analysis shows traffic taking a 12-hop AS path instead of the normal 3-hop direct path. An intermediate AS is injecting AS-path attributes to manipulate routing. The preferred path through AS 65100 is being suppressed by artificial path lengthening.',
            ticketExtra: 'NOC Note: AS 65400 is prepending fake AS hops to make the direct path appear longer. Our BGP decision process selects the "shorter" (but actually longer) alternate path. Fix: prefer the direct path by setting local-preference higher for routes through AS 65100, overriding AS-path length.',
            affectedHost: 0,
            fixDescription: 'Override AS-path with local-preference to enforce preferred path',
            stateOverrides: { _pathManipulation: true, _latencySpike: true }
        },
        {
            id: 'peer_flap',
            name: 'BGP Peer Flapping',
            ticketSubject: 'BGP session to upstream provider flapping every 30 seconds — route instability',
            ticketDetail: 'The BGP session to upstream ISP (AS 65500) is flapping — going up and down every 30 seconds. Each flap causes route withdrawals and re-announcements affecting 50,000 prefixes. Route dampening is not configured, so every flap propagates fully. Root cause: MTU mismatch on the BGP peering link causing TCP retransmissions.',
            ticketExtra: 'NOC Note: BGP uses TCP which is sensitive to MTU issues. The peering link MTU is 1500 but the intermediate transport uses GRE (adds 24 bytes). BGP keepalives (small) work but large UPDATE messages fragment and fail. Fix the MTU on the peering interface to account for GRE overhead. Also enable route dampening.',
            affectedHost: 0,
            fixDescription: 'Fix peering link MTU and enable route dampening',
            stateOverrides: { _peerFlapping: true, _mtuOnPeering: true }
        },
        {
            id: 'missing_rpki',
            name: 'No RPKI Validation',
            ticketSubject: 'Accepting routes without origin validation — vulnerable to any prefix hijack',
            ticketDetail: 'Security audit found that none of our BGP routers perform RPKI (Resource Public Key Infrastructure) validation. We accept any route announcement without verifying the origin AS is authorized to announce the prefix. This makes us vulnerable to route hijacks affecting our own and customer traffic.',
            ticketExtra: 'NOC Note: RPKI ROV (Route Origin Validation) should be enabled on all edge routers. Steps: (1) Deploy RPKI validator (Routinator), (2) Configure all BGP routers to query the validator, (3) Set policy: VALID = accept, INVALID = reject, UNKNOWN = accept with lower preference.',
            affectedHost: 0,
            fixDescription: 'Deploy RPKI validator and configure origin validation',
            stateOverrides: { _noRPKI: true, _hijackVulnerable: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        prefix_hijack: [
            { id: 'hint1', text: 'Run "status" to check BGP routes to partner prefix.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'AS 65999 hijacking with more specific /25 prefixes.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Filter AS 65999 routes and enable RPKI origin validation.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix rpki-filter" to validate routes and block hijack.', cost: 150, penalty: -150 }
        ],
        route_leak: [
            { id: 'hint1', text: 'Run "status" to check BGP neighbor route counts.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Customer AS 65300 leaking 900K routes. Memory at 95%.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Apply prefix filter allowing only their ~50 prefixes. Set max-prefix.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix prefix-filter" to filter the route leak.', cost: 150, penalty: -150 }
        ],
        path_manipulation: [
            { id: 'hint1', text: 'Run "status" to check BGP path selection.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'AS path manipulation making direct path appear longer. 12 hops vs 3.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Set higher local-preference for the direct path through AS 65100.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix local-pref" to enforce the correct path.', cost: 150, penalty: -150 }
        ],
        peer_flap: [
            { id: 'hint1', text: 'Run "status" to check BGP session stability.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'BGP flapping every 30s due to MTU mismatch on peering link.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix interface MTU for GRE overhead and enable dampening.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix fix-peering-mtu" to stabilize the BGP session.', cost: 150, penalty: -150 }
        ],
        missing_rpki: [
            { id: 'hint1', text: 'Run "status" to check RPKI validation status.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'No RPKI validation. Accepting all routes without origin check.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Deploy RPKI validator and configure reject policy for invalid routes.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix deploy-rpki" to implement route origin validation.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !NT015Config._flagRestored) {
            NT015Config._flagRestored = true;
            var s = NT015Config._scenarios[engine.state._scenarioId];
            if (s) NT015Config.hints = NT015Config._scenarioHints[s.id] || NT015Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_prefixHijack','_moreSpecific','_routeLeak','_tableOverflow','_pathManipulation','_latencySpike','_peerFlapping','_mtuOnPeering','_noRPKI','_hijackVulnerable','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = NT015Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        NT015Config._flagRestored = true;
        NT015Config.hints = NT015Config._scenarioHints[NT015Config._scenarios[idx].id] || NT015Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : NT015Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['System Boot...', 'Loading diagnostic tools...', 'Monitoring active', 'Console ready'], grubEntries: ['Primary', 'Recovery'], loginUser: 'Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Dashboard', icon: 'DSH', app: 'dashboard' }, { id: 'logs', label: 'Log\nViewer', icon: 'LOG', app: 'logs' }, { id: 'ticket', label: 'Alert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'admin', hostname: 'WS-01', startDir: '/home/admin', promptStyle: 'linux', welcome: 'BGP Route Hijack Diagnostic Console\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the dashboard.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a unique cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix it and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'A bgp route hijack incident has been detected. Investigate and respond systematically.', scenario: 'Each scenario presents a different aspect of bgp route hijack — requiring thorough investigation and remediation.', outro: 'Incident resolved. Your systematic response contained and remediated the bgp route hijack effectively.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = NT015Config._requireScenario(engine); if (gate) return gate;
            var s = NT015Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'prefix_hijack') return '\nPrefix Hijack: Active incident. Investigate.';
            if (s && s.id === 'route_leak') return '\nBGP Route Leak: Active incident. Investigate.';
            if (s && s.id === 'path_manipulation') return '\nAS Path Manipulation: Active incident. Investigate.';
            if (s && s.id === 'peer_flap') return '\nBGP Peer Flapping: Active incident. Investigate.';
            if (s && s.id === 'missing_rpki') return '\nNo RPKI Validation: Active incident. Investigate.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = NT015Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = NT015Config._getScenario(engine);
            if (s && s.id === 'prefix_hijack') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'route_leak') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'path_manipulation') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'peer_flap') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'missing_rpki') return '\nRoot cause identified. Apply fix.';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = NT015Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = NT015Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'prefix_hijack' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nFilter hijacked routes and implement RPKI validation completed.\n\n=== FLAG: NT015{prefix_hijack_resolved} ===';
            }
            if (s && s.id === 'route_leak' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nApply prefix filters and max-prefix limits on customer peer completed.\n\n=== FLAG: NT015{route_leak_resolved} ===';
            }
            if (s && s.id === 'path_manipulation' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nOverride AS-path with local-preference to enforce preferred path completed.\n\n=== FLAG: NT015{path_manipulation_resolved} ===';
            }
            if (s && s.id === 'peer_flap' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nFix peering link MTU and enable route dampening completed.\n\n=== FLAG: NT015{peer_flap_resolved} ===';
            }
            if (s && s.id === 'missing_rpki' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nDeploy RPKI validator and configure origin validation completed.\n\n=== FLAG: NT015{missing_rpki_resolved} ===';
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
            case 'ticket': NT015Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: NT015Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'BGP Route Hijack Alert', 'TKT', c);
        NT015Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) NT015Config._renderTicket(engine, c); else NT015Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Team — "Partner AS prefix being announced by unknown AS — traffic mi..."','Team — "Customer AS leaking full routing table into our network — 90..."','Team — "Traffic taking 12-hop path instead of 3-hop direct — AS path..."','Team — "BGP session to upstream provider flapping every 30 seconds —..."','Team — "Accepting routes without origin validation — vulnerable to a..."'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#f59e0b;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        NT015Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#f59e0b;font-weight:bold;">NT015-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#f59e0b;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { NT015Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); NT015Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { NT015Config._applyScenario(engine, Math.floor(Math.random()*NT015Config._scenarios.length)); NT015Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = NT015Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#f59e0b;font-weight:bold;font-size:1rem;">INCIDENT #NT015-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+NT015Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+NT015Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #f59e0b33;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+NT015Config._escHtml(s.ticketExtra)+'</div></div>':'')
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