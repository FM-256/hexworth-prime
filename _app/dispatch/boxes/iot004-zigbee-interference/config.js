/* ============================================================
   DISPATCH LAB — Box IOT004: Zigbee Interference
   CompTIA IoT+ / Network+
   5 distinct scenarios
   ============================================================ */

var IOT004Config = {

    title: 'Zigbee Interference',
    subtitle: 'Smart Building Sensors Dropping Offline Intermittently',
    difficulty: 'Beginner',
    accent: '#06b6d4',
    storageKey: 'hexworth_lab_iot004',
    registryId: 'iot004-zigbee-interference',
    trackerKey: 'lab_iot004',

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
        certPath: 'CompTIA IoT+ / Network+',
        mappings: [{ flagId: 'fixed', objective: '2.1', description: 'Explain IoT networking protocols', skill: 'Zigbee Mesh Network Troubleshooting' }]
    },

    _alerts: [{ id: 'IOT004-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { wifi_overlap: null, low_battery: null, coordinator_range: null, pan_conflict: null, fw_compat: null },

    _scenarios: [
        {
            id: 'wifi_overlap',
            name: 'WiFi Channel Overlap',
            ticketSubject: 'Zigbee sensors dropping when WiFi APs are busy — channel interference',
            ticketDetail: '42 of 85 Zigbee sensors are intermittently dropping offline, especially during business hours 9am-5pm. The Zigbee coordinator runs on channel 25 which overlaps with WiFi channel 11 (2.462 GHz). During peak WiFi usage, interference causes Zigbee packet loss exceeding 30%.',
            ticketExtra: 'The Zigbee coordinator is on channel 25 (2.475 GHz) which overlaps with WiFi channel 11. Move Zigbee to channel 15 (2.425 GHz) which sits between WiFi channels 1 and 6 with minimal overlap.',
            affectedHost: 0,
            fixDescription: 'Move Zigbee to non-overlapping channel',
            stateOverrides: { _wifiOverlap: true, _channelConflict: true }
        },
        {
            id: 'low_battery',
            name: 'Low Battery Cluster',
            ticketSubject: '20 sensors offline — batteries depleted after firmware update increased reporting frequency',
            ticketDetail: '20 temperature sensors went offline simultaneously. Investigation shows the last firmware update changed the reporting interval from 5 minutes to 30 seconds, draining batteries in 2 weeks instead of the expected 2 years. The sensors need battery replacement and firmware rollback.',
            ticketExtra: 'The firmware v2.3 changed SENSOR_REPORT_INTERVAL from 300s to 30s. This was a dev test setting that accidentally went to production. Roll back to v2.2 and replace batteries.',
            affectedHost: 0,
            fixDescription: 'Replace batteries and rollback firmware reporting interval',
            stateOverrides: { _batteryDead: true, _fwBug: true }
        },
        {
            id: 'coordinator_range',
            name: 'Coordinator Range Issue',
            ticketSubject: 'Sensors on floors 4-5 unreachable — coordinator in basement cannot reach',
            ticketDetail: 'After relocating the Zigbee coordinator to the basement during renovation, sensors on floors 4 and 5 have lost connectivity. The mesh cannot relay through enough hops. 15 sensors are offline. The coordinator was previously on floor 3 with good coverage to all 5 floors.',
            ticketExtra: 'Zigbee mesh has a max hop count of 5. Basement to floor 5 exceeds this. Options: (1) Add router devices as repeaters on floors 2-3, (2) Move coordinator back to floor 3, (3) Deploy a second coordinator for upper floors.',
            affectedHost: 0,
            fixDescription: 'Add mesh routers or relocate coordinator for coverage',
            stateOverrides: { _rangeExceeded: true, _meshBroken: true }
        },
        {
            id: 'pan_conflict',
            name: 'PAN ID Conflict',
            ticketSubject: 'Two Zigbee networks with same PAN ID causing devices to join wrong coordinator',
            ticketDetail: 'After a neighboring tenant installed their own Zigbee network with the same PAN ID (0x1A2B), devices are randomly associating with the wrong coordinator. 8 of our sensors joined the neighbor network and 3 of their devices joined ours. Both networks are interfering.',
            ticketExtra: 'Both networks using PAN ID 0x1A2B. Change our PAN ID to a unique value and re-associate all 85 devices. Coordinate with the neighbor to prevent future conflicts.',
            affectedHost: 0,
            fixDescription: 'Change PAN ID and re-associate all devices',
            stateOverrides: { _panConflict: true, _crossJoin: true }
        },
        {
            id: 'fw_compat',
            name: 'Firmware Incompatibility',
            ticketSubject: 'Mixed firmware versions causing Zigbee 3.0 and legacy devices to not interoperate',
            ticketDetail: 'After upgrading 40 devices to Zigbee 3.0 firmware, the remaining 45 devices on Zigbee HA 1.2 cannot communicate through the upgraded routers. The mesh is split into two incompatible segments. Neither group can relay through the other.',
            ticketExtra: 'Zigbee 3.0 devices should be backwards compatible with HA 1.2, but a bug in the v3.0.1 firmware breaks legacy relay. Update to v3.0.2 which fixes the interop issue.',
            affectedHost: 0,
            fixDescription: 'Update to firmware v3.0.2 with interop fix',
            stateOverrides: { _fwIncompat: true, _meshSplit: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        wifi_overlap: [
            { id: 'hint1', text: 'Run "status" to check Zigbee channel and WiFi overlap.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Channel 25 overlaps WiFi channel 11. Move to channel 15.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Change coordinator to channel 15 (between WiFi 1 and 6).', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix change-channel-15" to migrate the mesh.', cost: 150, penalty: -150 }
        ],
        low_battery: [
            { id: 'hint1', text: 'Run "status" to check sensor battery levels.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '20 sensors dead from firmware bug — reporting every 30s instead of 5min.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Replace batteries and rollback firmware to v2.2.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix rollback-firmware" to fix reporting and replace batteries.', cost: 150, penalty: -150 }
        ],
        coordinator_range: [
            { id: 'hint1', text: 'Run "status" to check mesh topology and hop counts.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Coordinator in basement, floors 4-5 exceed max 5 hops.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Add router devices on floors 2-3 as mesh repeaters.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix add-routers" to extend mesh coverage.', cost: 150, penalty: -150 }
        ],
        pan_conflict: [
            { id: 'hint1', text: 'Run "status" to check PAN ID and device associations.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Same PAN ID as neighbor. Devices cross-joining networks.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Change PAN ID to unique value and re-associate devices.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix change-pan-id" to resolve the conflict.', cost: 150, penalty: -150 }
        ],
        fw_compat: [
            { id: 'hint1', text: 'Run "status" to check firmware versions and mesh connectivity.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'v3.0.1 breaks legacy relay. Update to v3.0.2 for interop fix.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Flash v3.0.2 firmware on all 40 upgraded devices.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix update-firmware" to restore mesh interoperability.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !IOT004Config._flagRestored) {
            IOT004Config._flagRestored = true;
            var s = IOT004Config._scenarios[engine.state._scenarioId];
            if (s) IOT004Config.hints = IOT004Config._scenarioHints[s.id] || IOT004Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_wifiOverlap','_channelConflict','_batteryDead','_fwBug','_rangeExceeded','_meshBroken','_panConflict','_crossJoin','_fwIncompat','_meshSplit','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = IOT004Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        IOT004Config._flagRestored = true;
        IOT004Config.hints = IOT004Config._scenarioHints[IOT004Config._scenarios[idx].id] || IOT004Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : IOT004Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['Zigbee Coordinator Hub v3.1', 'Loading mesh topology...', 'Devices registered: 85', 'Channels: 11-26 available'], grubEntries: ['Primary', 'Recovery'], loginUser: 'IoT-Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Mesh\nDashboard', icon: 'ZGB', app: 'dashboard' }, { id: 'ticket', label: 'Zigbee\nAlert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'iot-admin', hostname: 'ZB-HUB-01', startDir: '/home/iot-admin', promptStyle: 'linux', welcome: 'Zigbee Coordinator Management Console\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the dashboard.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a unique cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix it and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'Smart building Zigbee sensors are dropping offline intermittently. The mesh network is experiencing issues that need diagnosis and resolution.', scenario: 'Each scenario targets a different Zigbee mesh problem — from RF interference to battery issues and firmware incompatibility.', outro: 'Zigbee mesh restored. All 85 sensors reporting normally with stable connectivity.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = IOT004Config._requireScenario(engine); if (gate) return gate;
            var s = IOT004Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'wifi_overlap') return '\nWiFi Channel Overlap detected. Investigate with terminal.';
            if (s && s.id === 'low_battery') return '\nLow Battery Cluster detected. Investigate with terminal.';
            if (s && s.id === 'coordinator_range') return '\nCoordinator Range Issue detected. Investigate with terminal.';
            if (s && s.id === 'pan_conflict') return '\nPAN ID Conflict detected. Investigate with terminal.';
            if (s && s.id === 'fw_compat') return '\nFirmware Incompatibility detected. Investigate with terminal.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = IOT004Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = IOT004Config._getScenario(engine);
            if (s && s.id === 'wifi_overlap') return '\nRoot cause identified. Apply fix with keyword: undefined';
            if (s && s.id === 'low_battery') return '\nRoot cause identified. Apply fix with keyword: undefined';
            if (s && s.id === 'coordinator_range') return '\nRoot cause identified. Apply fix with keyword: undefined';
            if (s && s.id === 'pan_conflict') return '\nRoot cause identified. Apply fix with keyword: undefined';
            if (s && s.id === 'fw_compat') return '\nRoot cause identified. Apply fix with keyword: undefined';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = IOT004Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = IOT004Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'wifi_overlap' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nMove Zigbee to non-overlapping channel completed successfully.\n\n=== FLAG: IOT004{wifi_overlap_resolved} ===';
            }
            if (s && s.id === 'low_battery' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nReplace batteries and rollback firmware reporting interval completed successfully.\n\n=== FLAG: IOT004{low_battery_resolved} ===';
            }
            if (s && s.id === 'coordinator_range' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nAdd mesh routers or relocate coordinator for coverage completed successfully.\n\n=== FLAG: IOT004{coordinator_range_resolved} ===';
            }
            if (s && s.id === 'pan_conflict' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nChange PAN ID and re-associate all devices completed successfully.\n\n=== FLAG: IOT004{pan_conflict_resolved} ===';
            }
            if (s && s.id === 'fw_compat' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nUpdate to firmware v3.0.2 with interop fix completed successfully.\n\n=== FLAG: IOT004{fw_compat_resolved} ===';
            }
            return '\nUsage: fix <action>. Run "investigate" first for available actions.';
        },


        whoami: function() { return 'iot-admin'; },
        hostname: function() { return 'ZB-HUB-01'; },
        clear: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ls: function() { return 'configs  logs  scripts  tools'; },
        dir: function() { return ' Directory of current folder\n  configs  logs  scripts  tools'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app !== 'ticket' && iconDef.app !== 'terminal' && iconDef.app !== 'hints' && iconDef.app !== 'reset_lab' && !engine.state._scenarioSelected) { engine.notify('Open the Alert first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': IOT004Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: IOT004Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Zigbee Interference Alert', 'TKT', c);
        IOT004Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) IOT004Config._renderTicket(engine, c); else IOT004Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['IT — "42 sensors dropping during business hours — WiFi interference"','IT — "20 sensors dead — firmware bug drained batteries in 2 weeks"','Facilities — "Floors 4-5 offline after coordinator relocation"','IT — "Devices joining wrong network — PAN ID conflict with neighbor"','IT — "Mesh split — Zigbee 3.0 and legacy devices incompatible"'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#06b6d4;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        IOT004Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#06b6d4;font-weight:bold;">IOT004-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#06b6d4;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { IOT004Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); IOT004Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { IOT004Config._applyScenario(engine, Math.floor(Math.random()*IOT004Config._scenarios.length)); IOT004Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = IOT004Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#06b6d4;font-weight:bold;font-size:1rem;">INCIDENT #IOT004-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+IOT004Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+IOT004Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #06b6d433;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+IOT004Config._escHtml(s.ticketExtra)+'</div></div>':'')
            +'<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;color:#2ecc71;font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openInfoWin(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:16px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, iconDef.label.replace('\n',' '), iconDef.icon, c);
        c.innerHTML = '<div style="color:#06b6d4;font-weight:bold;font-size:1rem;margin-bottom:12px;">'+iconDef.label.replace('\n',' ')+'</div><div style="color:#888;">Use terminal commands for diagnostics.</div>';
    }
};