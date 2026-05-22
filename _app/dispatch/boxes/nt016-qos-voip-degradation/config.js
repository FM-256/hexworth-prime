/* ============================================================
   DISPATCH LAB — Box NT016: QoS VoIP Degradation
   Network+ N10-009
   5 distinct scenarios
   ============================================================ */

var NT016Config = {

    title: 'QoS VoIP Degradation',
    subtitle: 'Call Quality Drops During Business Hours',
    difficulty: 'Intermediate',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_nt016',
    registryId: 'nt016-qos-voip-degradation',
    trackerKey: 'lab_nt016',

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
        mappings: [{ flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network issues', skill: 'QoS Configuration for VoIP' }]
    },

    _alerts: [{ id: 'NT016-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { dscp_not_marked: null, queue_starvation: null, wan_congestion: null, jitter_buffer: null, codec_mismatch: null },

    _scenarios: [
        {
            id: 'dscp_not_marked',
            name: 'DSCP Not Marked',
            ticketSubject: 'VoIP packets not marked with EF DSCP — treated as best-effort traffic',
            ticketDetail: 'VoIP phones are generating packets with DSCP 0 (best-effort) instead of DSCP 46 (EF/Expedited Forwarding). Without proper marking, QoS policies cannot prioritize voice traffic. During network congestion, voice packets are dropped alongside bulk data transfers, causing choppy audio and dropped calls.',
            ticketExtra: 'NOC Note: The VoIP phones support DSCP marking but it was not configured during deployment. Also verify that the access switch ports trust DSCP values from the phones. Some switches reset DSCP to 0 on ingress if trust is not configured.',
            affectedHost: 0,
            fixDescription: 'Configure DSCP marking on phones and trust on switch ports',
            stateOverrides: { _noDSCP: true, _bestEffort: true }
        },
        {
            id: 'queue_starvation',
            name: 'Queue Starvation',
            ticketSubject: 'Priority queue for voice saturated by video traffic — both degraded',
            ticketDetail: 'The priority queue (PQ) is configured to handle both voice (EF) and video (AF41) traffic. Video conferencing during business hours consumes 80% of the PQ bandwidth, starving voice packets. PQ should be reserved for voice only; video should use a separate queue with bandwidth guarantee.',
            ticketExtra: 'NOC Note: Current config puts EF and AF41 in the same priority queue. Best practice: PQ for voice (EF) only with strict priority up to 30% of link. Separate queue for video (AF41) with 20% bandwidth guarantee. Data in default queue with remaining bandwidth.',
            affectedHost: 0,
            fixDescription: 'Separate voice and video into different QoS queues',
            stateOverrides: { _queueStarvation: true, _videoInPQ: true }
        },
        {
            id: 'wan_congestion',
            name: 'WAN Bandwidth',
            ticketSubject: '100Mbps WAN link saturated during business hours — no QoS shaping',
            ticketDetail: 'The 100Mbps WAN link between sites hits 100% utilization from 9am-5pm. Without QoS traffic shaping, large file transfers and backups consume all bandwidth, leaving nothing for voice. VoIP needs ~100Kbps per call and there are 50 concurrent calls during peaks (5Mbps total).',
            ticketExtra: 'NOC Note: Need QoS policy on the WAN interface: (1) Police voice to 10Mbps (50 calls max), (2) Guarantee 20Mbps for business-critical apps, (3) Limit bulk transfers/backups to 30Mbps during business hours, (4) Shape total output to line rate.',
            affectedHost: 0,
            fixDescription: 'Configure WAN QoS shaping with voice priority',
            stateOverrides: { _wanSaturated: true, _noShaping: true }
        },
        {
            id: 'jitter_buffer',
            name: 'Jitter Buffer',
            ticketSubject: 'VoIP jitter exceeding 30ms causing audio artifacts — jitter buffer too small',
            ticketDetail: 'Network analysis shows VoIP jitter averaging 45ms with spikes to 80ms. The VoIP phones are configured with a 20ms jitter buffer which is too small to compensate. Audio artifacts include choppy speech, echoes, and packet loss compensation artifacts. The jitter is caused by a congested router interface.',
            ticketExtra: 'NOC Note: Two issues: (1) Fix the congestion causing jitter (QoS on the congested interface), (2) Increase the phone jitter buffer from 20ms to 60ms as a compensating measure. Also check codec selection — G.711 is more sensitive to jitter than G.729.',
            affectedHost: 0,
            fixDescription: 'Fix congestion and adjust jitter buffer settings',
            stateOverrides: { _highJitter: true, _smallBuffer: true }
        },
        {
            id: 'codec_mismatch',
            name: 'Codec Mismatch',
            ticketSubject: 'Calls between sites using G.711 instead of G.729 — consuming 5x bandwidth',
            ticketDetail: 'Inter-site VoIP calls are using G.711 codec (87Kbps per call) instead of G.729 (32Kbps) over the WAN. With 50 concurrent inter-site calls, this consumes 4.35Mbps instead of 1.6Mbps — using 3x more WAN bandwidth than needed. G.729 should be enforced for WAN calls while G.711 is fine for local calls.',
            ticketExtra: 'VoIP Note: The call manager is not differentiating between local and WAN calls for codec selection. Configure region-based codec preference: G.711 for same-site calls, G.729 for inter-site calls over WAN. This immediately frees up 2.75Mbps of WAN bandwidth.',
            affectedHost: 0,
            fixDescription: 'Configure region-based codec selection for WAN calls',
            stateOverrides: { _wrongCodec: true, _wastedBandwidth: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        dscp_not_marked: [
            { id: 'hint1', text: 'Run "status" to check DSCP marking on VoIP traffic.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'VoIP packets at DSCP 0 (best-effort). Phones not marking.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Configure phones for DSCP 46 (EF) and switch port trust.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix mark-dscp" to enable QoS marking.', cost: 150, penalty: -150 }
        ],
        queue_starvation: [
            { id: 'hint1', text: 'Run "status" to check QoS queue assignments.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Voice and video sharing priority queue. Video starving voice.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Move video to separate bandwidth queue. PQ for voice only.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix separate-queues" to fix QoS policy.', cost: 150, penalty: -150 }
        ],
        wan_congestion: [
            { id: 'hint1', text: 'Run "status" to check WAN utilization and QoS.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'WAN at 100% with no QoS. Voice competing with bulk transfers.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Configure QoS shaping with voice priority on WAN interface.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix wan-qos" to implement traffic shaping.', cost: 150, penalty: -150 }
        ],
        jitter_buffer: [
            { id: 'hint1', text: 'Run "status" to check jitter metrics and buffer config.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Jitter at 45ms average, buffer only 20ms. Audio artifacts.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix congestion with QoS and increase jitter buffer to 60ms.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix jitter-fix" to reduce jitter and increase buffer.', cost: 150, penalty: -150 }
        ],
        codec_mismatch: [
            { id: 'hint1', text: 'Run "status" to check codec usage on WAN calls.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'G.711 on WAN calls using 5x more bandwidth than needed.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Configure G.729 for WAN calls, keep G.711 for local.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix codec-regions" to optimize WAN bandwidth usage.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !NT016Config._flagRestored) {
            NT016Config._flagRestored = true;
            var s = NT016Config._scenarios[engine.state._scenarioId];
            if (s) NT016Config.hints = NT016Config._scenarioHints[s.id] || NT016Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_noDSCP','_bestEffort','_queueStarvation','_videoInPQ','_wanSaturated','_noShaping','_highJitter','_smallBuffer','_wrongCodec','_wastedBandwidth','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = NT016Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        NT016Config._flagRestored = true;
        NT016Config.hints = NT016Config._scenarioHints[NT016Config._scenarios[idx].id] || NT016Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : NT016Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['System Boot...', 'Loading diagnostic tools...', 'Monitoring active', 'Console ready'], grubEntries: ['Primary', 'Recovery'], loginUser: 'Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Dashboard', icon: 'DSH', app: 'dashboard' }, { id: 'logs', label: 'Log\nViewer', icon: 'LOG', app: 'logs' }, { id: 'ticket', label: 'Alert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'admin', hostname: 'WS-01', startDir: '/home/admin', promptStyle: 'linux', welcome: 'QoS VoIP Degradation Diagnostic Console\n' },
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
    lore: { intro: 'A qos voip degradation incident has been detected. Investigate and respond systematically.', scenario: 'Each scenario presents a different aspect of qos voip degradation — requiring thorough investigation and remediation.', outro: 'Incident resolved. Your systematic response contained and remediated the qos voip degradation effectively.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = NT016Config._requireScenario(engine); if (gate) return gate;
            var s = NT016Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'dscp_not_marked') return '\nDSCP Not Marked: Active incident. Investigate.';
            if (s && s.id === 'queue_starvation') return '\nQueue Starvation: Active incident. Investigate.';
            if (s && s.id === 'wan_congestion') return '\nWAN Bandwidth: Active incident. Investigate.';
            if (s && s.id === 'jitter_buffer') return '\nJitter Buffer: Active incident. Investigate.';
            if (s && s.id === 'codec_mismatch') return '\nCodec Mismatch: Active incident. Investigate.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = NT016Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = NT016Config._getScenario(engine);
            if (s && s.id === 'dscp_not_marked') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'queue_starvation') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'wan_congestion') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'jitter_buffer') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'codec_mismatch') return '\nRoot cause identified. Apply fix.';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = NT016Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = NT016Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'dscp_not_marked' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nConfigure DSCP marking on phones and trust on switch ports completed.\n\n=== FLAG: NT016{dscp_not_marked_resolved} ===';
            }
            if (s && s.id === 'queue_starvation' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nSeparate voice and video into different QoS queues completed.\n\n=== FLAG: NT016{queue_starvation_resolved} ===';
            }
            if (s && s.id === 'wan_congestion' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nConfigure WAN QoS shaping with voice priority completed.\n\n=== FLAG: NT016{wan_congestion_resolved} ===';
            }
            if (s && s.id === 'jitter_buffer' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nFix congestion and adjust jitter buffer settings completed.\n\n=== FLAG: NT016{jitter_buffer_resolved} ===';
            }
            if (s && s.id === 'codec_mismatch' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nConfigure region-based codec selection for WAN calls completed.\n\n=== FLAG: NT016{codec_mismatch_resolved} ===';
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
            case 'ticket': NT016Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: NT016Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'QoS VoIP Degradation Alert', 'TKT', c);
        NT016Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) NT016Config._renderTicket(engine, c); else NT016Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Team — "VoIP packets not marked with EF DSCP — treated as best-effor..."','Team — "Priority queue for voice saturated by video traffic — both d..."','Team — "100Mbps WAN link saturated during business hours — no QoS sh..."','Team — "VoIP jitter exceeding 30ms causing audio artifacts — jitter ..."','Team — "Calls between sites using G.711 instead of G.729 — consuming..."'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#f59e0b;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        NT016Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#f59e0b;font-weight:bold;">NT016-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#f59e0b;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { NT016Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); NT016Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { NT016Config._applyScenario(engine, Math.floor(Math.random()*NT016Config._scenarios.length)); NT016Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = NT016Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#f59e0b;font-weight:bold;font-size:1rem;">INCIDENT #NT016-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+NT016Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+NT016Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #f59e0b33;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+NT016Config._escHtml(s.ticketExtra)+'</div></div>':'')
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