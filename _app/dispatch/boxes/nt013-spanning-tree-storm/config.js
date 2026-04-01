/* ============================================================
   DISPATCH LAB — Box NT013: Spanning Tree Storm
   Network+ N10-009
   5 distinct scenarios
   ============================================================ */

var NT013Config = {

    title: 'Spanning Tree Storm',
    subtitle: 'Broadcast Storm Taking Down the Access Layer',
    difficulty: 'Intermediate',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_nt013',
    registryId: 'nt013-spanning-tree-storm',
    trackerKey: 'lab_nt013',

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
        mappings: [{ flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network issues', skill: 'STP Loop Prevention & Recovery' }]
    },

    _alerts: [{ id: 'NT013-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { root_bridge: null, bpdu_guard: null, topology_change: null, portfast_loop: null, unidirectional: null },

    _scenarios: [
        {
            id: 'root_bridge',
            name: 'Root Bridge Election',
            ticketSubject: 'Unmanaged switch became root bridge — traffic suboptimal and loops forming',
            ticketDetail: 'A new unmanaged switch plugged into the network won the STP root bridge election because it has the lowest bridge priority (default 32768 with lowest MAC). This changed the spanning tree topology, creating suboptimal paths and intermittent loops. Access layer switches are experiencing 40% CPU from BPDUs.',
            ticketExtra: 'NOC Note: The root bridge should be the core switch (SW-CORE-01, priority 4096). The unmanaged switch has priority 32768 but a lower MAC address than SW-CORE-01. Set SW-CORE-01 priority to 0 or enable root guard on access ports to prevent unauthorized root bridges.',
            affectedHost: 0,
            fixDescription: 'Reclaim root bridge and enable root guard on access ports',
            stateOverrides: { _wrongRoot: true, _loopsForming: true }
        },
        {
            id: 'bpdu_guard',
            name: 'BPDU Guard Missing',
            ticketSubject: 'Switch plugged into access port causing loop — no BPDU guard configured',
            ticketDetail: 'A user plugged a small switch into a wall jack, creating a Layer 2 loop. The access port does not have BPDU guard enabled, so it did not shut down when it received BPDUs from the rogue switch. The loop is generating a broadcast storm consuming 90% of bandwidth on VLAN 10.',
            ticketExtra: 'NOC Note: BPDU guard should be enabled on all access ports (portfast enabled). When BPDU guard detects BPDUs on an access port, it errdisables the port. Currently only 30% of access ports have BPDU guard. Enable it globally and recover the errdisabled port after removing the rogue switch.',
            affectedHost: 0,
            fixDescription: 'Enable BPDU guard globally and shut down the loop source',
            stateOverrides: { _noBPDUGuard: true, _broadcastStorm: true }
        },
        {
            id: 'topology_change',
            name: 'Excessive Topology Changes',
            ticketSubject: 'STP topology changing every 2 seconds — flapping port causing MAC table instability',
            ticketDetail: 'The spanning tree is experiencing topology change notifications (TCN) every 2 seconds. Each TCN causes all switches to flush their MAC address tables, resulting in flooding and high CPU. A flapping fiber link between SW-DIST-01 and SW-DIST-02 is triggering constant topology changes.',
            ticketExtra: 'NOC Note: The fiber link between distribution switches is flapping due to a dirty fiber connector. Each flap triggers an STP TCN. Fix: (1) Clean/replace the fiber, (2) Enable STP loop guard, (3) Configure TCN dampening or topology change timer extension.',
            affectedHost: 0,
            fixDescription: 'Fix flapping fiber link and configure TCN dampening',
            stateOverrides: { _tcnStorm: true, _fiberFlapping: true }
        },
        {
            id: 'portfast_loop',
            name: 'Portfast Loop',
            ticketSubject: 'Portfast enabled on inter-switch trunk link causing instant loop',
            ticketDetail: 'A trunk link between SW-ACC-01 and SW-ACC-02 was accidentally configured with portfast. When the link came up, it immediately went to forwarding state without going through STP listening/learning, creating an instant loop. The access layer is down with 100% link utilization from broadcast frames.',
            ticketExtra: 'NOC Note: Portfast should ONLY be on access ports connected to end devices. It was accidentally applied to interface Gi1/0/48 which is a trunk to another switch. Remove portfast from the trunk, let STP converge properly. The loop will clear in ~30 seconds after STP blocks the redundant path.',
            affectedHost: 0,
            fixDescription: 'Remove portfast from trunk link and let STP converge',
            stateOverrides: { _portfastTrunk: true, _instantLoop: true }
        },
        {
            id: 'unidirectional',
            name: 'Unidirectional Link',
            ticketSubject: 'Fiber link receiving but not transmitting — STP cannot detect one-way failure',
            ticketDetail: 'A fiber strand between SW-CORE-01 and SW-DIST-01 has failed in one direction (TX fiber broken, RX still working). STP BPDUs from the core reach the distribution switch, but the distribution switchs BPDUs never reach the core. The core thinks the link is down and opens an alternate path, creating a loop.',
            ticketExtra: 'NOC Note: Unidirectional link failures are an STP weakness. UDLD (UniDirectional Link Detection) should be enabled but is not configured. UDLD detects one-way links and errdisables the port. Enable UDLD aggressive mode on all fiber links.',
            affectedHost: 0,
            fixDescription: 'Enable UDLD on fiber links to detect one-way failures',
            stateOverrides: { _unidirectional: true, _noUDLD: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        root_bridge: [
            { id: 'hint1', text: 'Run "status" to check STP root bridge status.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Unmanaged switch is root bridge. Core switch lost election.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Set core switch priority to 0 and enable root guard.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix reclaim-root" to restore proper STP topology.', cost: 150, penalty: -150 }
        ],
        bpdu_guard: [
            { id: 'hint1', text: 'Run "status" to check broadcast storm and STP config.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Rogue switch on access port without BPDU guard creating loop.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable BPDU guard globally, errdisable the looped port.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix enable-bpdu-guard" to stop the broadcast storm.', cost: 150, penalty: -150 }
        ],
        topology_change: [
            { id: 'hint1', text: 'Run "status" to check STP topology change frequency.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Fiber link flapping every 2 seconds causing TCN storms.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix the fiber connector and configure TCN dampening.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix fix-fiber-tcn" to stop topology change storms.', cost: 150, penalty: -150 }
        ],
        portfast_loop: [
            { id: 'hint1', text: 'Run "status" to find the loop source.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Portfast on trunk link Gi1/0/48 causing instant loop.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Remove portfast from the trunk, allow STP convergence.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix remove-portfast-trunk" to stop the loop.', cost: 150, penalty: -150 }
        ],
        unidirectional: [
            { id: 'hint1', text: 'Run "status" to check link state and UDLD status.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Unidirectional fiber failure creating STP loop. No UDLD.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable UDLD aggressive mode on all fiber inter-switch links.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix enable-udld" to detect and prevent one-way link failures.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !NT013Config._flagRestored) {
            NT013Config._flagRestored = true;
            var s = NT013Config._scenarios[engine.state._scenarioId];
            if (s) NT013Config.hints = NT013Config._scenarioHints[s.id] || NT013Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_wrongRoot','_loopsForming','_noBPDUGuard','_broadcastStorm','_tcnStorm','_fiberFlapping','_portfastTrunk','_instantLoop','_unidirectional','_noUDLD','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = NT013Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        NT013Config._flagRestored = true;
        NT013Config.hints = NT013Config._scenarioHints[NT013Config._scenarios[idx].id] || NT013Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : NT013Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['System Boot...', 'Loading diagnostic tools...', 'Monitoring active', 'Console ready'], grubEntries: ['Primary', 'Recovery'], loginUser: 'Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Dashboard', icon: 'DSH', app: 'dashboard' }, { id: 'logs', label: 'Log\nViewer', icon: 'LOG', app: 'logs' }, { id: 'ticket', label: 'Alert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'admin', hostname: 'WS-01', startDir: '/home/admin', promptStyle: 'linux', welcome: 'Spanning Tree Storm Diagnostic Console\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the dashboard.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a unique cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix it and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'A spanning tree storm incident has been detected. Investigate and respond systematically.', scenario: 'Each scenario presents a different aspect of spanning tree storm — requiring thorough investigation and remediation.', outro: 'Incident resolved. Your systematic response contained and remediated the spanning tree storm effectively.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = NT013Config._requireScenario(engine); if (gate) return gate;
            var s = NT013Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'root_bridge') return '\nRoot Bridge Election: Active incident. Investigate.';
            if (s && s.id === 'bpdu_guard') return '\nBPDU Guard Missing: Active incident. Investigate.';
            if (s && s.id === 'topology_change') return '\nExcessive Topology Changes: Active incident. Investigate.';
            if (s && s.id === 'portfast_loop') return '\nPortfast Loop: Active incident. Investigate.';
            if (s && s.id === 'unidirectional') return '\nUnidirectional Link: Active incident. Investigate.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = NT013Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = NT013Config._getScenario(engine);
            if (s && s.id === 'root_bridge') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'bpdu_guard') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'topology_change') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'portfast_loop') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'unidirectional') return '\nRoot cause identified. Apply fix.';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = NT013Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = NT013Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'root_bridge' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nReclaim root bridge and enable root guard on access ports completed.\n\n=== FLAG: NT013{root_bridge_resolved} ===';
            }
            if (s && s.id === 'bpdu_guard' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nEnable BPDU guard globally and shut down the loop source completed.\n\n=== FLAG: NT013{bpdu_guard_resolved} ===';
            }
            if (s && s.id === 'topology_change' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nFix flapping fiber link and configure TCN dampening completed.\n\n=== FLAG: NT013{topology_change_resolved} ===';
            }
            if (s && s.id === 'portfast_loop' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nRemove portfast from trunk link and let STP converge completed.\n\n=== FLAG: NT013{portfast_loop_resolved} ===';
            }
            if (s && s.id === 'unidirectional' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nEnable UDLD on fiber links to detect one-way failures completed.\n\n=== FLAG: NT013{unidirectional_resolved} ===';
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
            case 'ticket': NT013Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: NT013Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Spanning Tree Storm Alert', 'TKT', c);
        NT013Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) NT013Config._renderTicket(engine, c); else NT013Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Team — "Unmanaged switch became root bridge — traffic suboptimal and..."','Team — "Switch plugged into access port causing loop — no BPDU guard..."','Team — "STP topology changing every 2 seconds — flapping port causin..."','Team — "Portfast enabled on inter-switch trunk link causing instant ..."','Team — "Fiber link receiving but not transmitting — STP cannot detec..."'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#f59e0b;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        NT013Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#f59e0b;font-weight:bold;">NT013-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#f59e0b;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { NT013Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); NT013Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { NT013Config._applyScenario(engine, Math.floor(Math.random()*NT013Config._scenarios.length)); NT013Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = NT013Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#f59e0b;font-weight:bold;font-size:1rem;">INCIDENT #NT013-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+NT013Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+NT013Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #f59e0b33;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+NT013Config._escHtml(s.ticketExtra)+'</div></div>':'')
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