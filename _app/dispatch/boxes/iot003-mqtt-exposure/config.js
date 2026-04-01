/* ============================================================
   DISPATCH LAB — Box IOT003: MQTT Broker Exposed
   Security+ SY0-701 / CompTIA IoT+
   5 distinct scenarios
   ============================================================ */

var IOT003Config = {

    title: 'MQTT Broker Exposed',
    subtitle: 'IoT Message Broker Accessible from Internet Without Auth',
    difficulty: 'Intermediate',
    accent: '#06b6d4',
    storageKey: 'hexworth_lab_iot003',
    registryId: 'iot003-mqtt-exposure',
    trackerKey: 'lab_iot003',

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
        certPath: 'Security+ SY0-701 / CompTIA IoT+',
        mappings: [{ flagId: 'fixed', objective: '3.5', description: 'Explain the security implications of embedded systems', skill: 'MQTT Security Hardening' }]
    },

    _alerts: [{ id: 'IOT003-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { no_auth: null, tls_disabled: null, topic_injection: null, wildcard_sub: null, retained_msg_poison: null },

    _scenarios: [
        {
            id: 'no_auth',
            name: 'No Authentication',
            ticketSubject: 'MQTT broker on port 1883 accessible without credentials — anyone can subscribe to all topics',
            ticketDetail: 'Shodan search found our MQTT broker (mqtt.hexworth.local, port 1883) exposed to the internet with anonymous access enabled. Anyone can connect and subscribe to all topics including sensor data, HVAC commands, and building access events. No authentication or ACLs configured.',
            ticketExtra: 'Security Note: The MQTT broker was set up for internal testing but port 1883 was accidentally exposed through a NAT rule. Anonymous access was left on. All IoT sensors publish to this broker. Topics include: building/hvac/+, building/access/+, building/sensors/+. Enable auth, add ACLs, remove NAT rule.',
            affectedHost: 0,
            fixDescription: 'Enable authentication and remove internet exposure',
            stateOverrides: { _noAuth: true, _exposed: true }
        },
        {
            id: 'tls_disabled',
            name: 'TLS Disabled',
            ticketSubject: 'MQTT traffic between sensors and broker is unencrypted — plaintext on the wire',
            ticketDetail: 'All 247 IoT sensors communicate with the MQTT broker over port 1883 (unencrypted). Packet capture reveals sensor data, building access events, and HVAC commands visible in plaintext. Any device on the network can sniff this traffic. Port 8883 (MQTT+TLS) is configured but no clients use it.',
            ticketExtra: 'IT Note: Port 8883 with TLS is configured on the broker but all sensor clients were provisioned with port 1883. Need to: (1) Generate and install TLS certificates, (2) Reconfigure all 247 clients to use port 8883, (3) Disable port 1883 after migration, (4) Enable client certificate verification.',
            affectedHost: 0,
            fixDescription: 'Migrate all clients to TLS-encrypted MQTT',
            stateOverrides: { _noTLS: true, _plaintextTraffic: true }
        },
        {
            id: 'topic_injection',
            name: 'Topic Injection',
            ticketSubject: 'Attacker publishing malicious HVAC commands to MQTT topics — building temperature spiking',
            ticketDetail: 'Facilities team reports HVAC systems going haywire — heating set to 95F in server rooms. Investigation shows unauthorized PUBLISH messages on topic building/hvac/zone3/setpoint with value 95. The broker allows any authenticated client to publish to any topic. No topic-level ACLs exist.',
            ticketExtra: 'Facilities Note: Server room temperature spiked to 85F before caught. UPS battery life reduced. HVAC control commands should only be accepted from authorized controllers (MAC: AA:BB:CC:DD:EE:01). Current broker has flat permissions — any client can read/write any topic.',
            affectedHost: 0,
            fixDescription: 'Implement topic-level ACLs and restrict HVAC command publishing',
            stateOverrides: { _topicInjection: true, _noACL: true }
        },
        {
            id: 'wildcard_sub',
            name: 'Wildcard Subscription',
            ticketSubject: 'IoT device subscribed to wildcard topic (#) consuming all messages — data exfiltration risk',
            ticketDetail: 'A compromised IoT device is subscribed to the MQTT wildcard topic (#) and receiving ALL messages from every topic. This device is also connected to an external IP, potentially exfiltrating all building sensor data, access events, and control commands to an external server.',
            ticketExtra: 'Security Note: The device at 10.0.10.99 is subscribed to topic "#" (all topics). It has an active outbound connection to 91.132.147.22 on port 443. Wildcard subscriptions should be blocked for regular clients. Only the monitoring system should have wildcard access.',
            affectedHost: 0,
            fixDescription: 'Block wildcard subscriptions and disconnect compromised device',
            stateOverrides: { _wildcardSub: true, _dataExfil: true }
        },
        {
            id: 'retained_msg_poison',
            name: 'Retained Message Poisoning',
            ticketSubject: 'Attacker set malicious retained messages that persist and affect new subscribers',
            ticketDetail: 'Retained MQTT messages with false sensor data have been set on critical topics. When new monitoring dashboards connect, they receive the poisoned retained messages showing normal readings while actual sensors report fire alarms. The retained messages override real data on initial connection.',
            ticketExtra: 'Engineering Note: MQTT retained messages persist on the broker and are sent to any new subscriber on that topic. An attacker set retained messages on building/fire/+/status with value "normal" masking actual fire alarm events. New monitoring connections see "normal" until a real publish overwrites it. Clear all retained messages and restrict retain permissions.',
            affectedHost: 0,
            fixDescription: 'Clear poisoned retained messages and restrict retain permissions',
            stateOverrides: { _retainedPoison: true, _fireAlarmMasked: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        no_auth: [
            { id: 'hint1', text: 'Run "status" to check broker authentication config.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Anonymous access enabled. Port 1883 exposed via NAT.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable password auth, configure ACLs, remove NAT rule.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix enable-auth" to secure the broker.', cost: 150, penalty: -150 }
        ],
        tls_disabled: [
            { id: 'hint1', text: 'Run "status" to check TLS configuration.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'All 247 clients on unencrypted port 1883. Port 8883 ready but unused.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Migrate clients to port 8883 with TLS and disable 1883.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix migrate-tls" to encrypt all MQTT traffic.', cost: 150, penalty: -150 }
        ],
        topic_injection: [
            { id: 'hint1', text: 'Run "status" to check topic permissions.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Any client can publish to HVAC command topics. No ACLs.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Restrict HVAC publish to authorized controllers only.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix topic-acls" to implement per-topic permissions.', cost: 150, penalty: -150 }
        ],
        wildcard_sub: [
            { id: 'hint1', text: 'Run "status" to check for wildcard subscriptions.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Device at 10.0.10.99 subscribed to # with external C2 connection.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Block wildcard subscriptions and disconnect the compromised device.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix block-wildcard" to restrict subscriptions and disconnect.', cost: 150, penalty: -150 }
        ],
        retained_msg_poison: [
            { id: 'hint1', text: 'Run "status" to check retained messages on critical topics.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Retained messages on fire alarm topics show "normal" masking real alerts.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Clear poisoned retained messages and restrict who can set retained.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix clear-retained" to purge and restrict retained messages.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !IOT003Config._flagRestored) {
            IOT003Config._flagRestored = true;
            var s = IOT003Config._scenarios[engine.state._scenarioId];
            if (s) IOT003Config.hints = IOT003Config._scenarioHints[s.id] || IOT003Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_noAuth','_exposed','_noTLS','_plaintextTraffic','_topicInjection','_noACL','_wildcardSub','_dataExfil','_retainedPoison','_fireAlarmMasked','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = IOT003Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        IOT003Config._flagRestored = true;
        IOT003Config.hints = IOT003Config._scenarioHints[IOT003Config._scenarios[idx].id] || IOT003Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : IOT003Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['Mosquitto MQTT Broker v2.0', 'Loading broker configuration...', 'Listeners: 1883, 8883', 'Topics: 247 active'], grubEntries: ['Primary', 'Recovery'], loginUser: 'IoT-Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'MQTT\nDashboard', icon: 'MQT', app: 'dashboard' }, { id: 'topic_mgr', label: 'Topic\nManager', icon: 'TOP', app: 'topic_mgr' }, { id: 'ticket', label: 'MQTT\nAlert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'iot-admin', hostname: 'MQTT-SRV-01', startDir: '/home/iot-admin', promptStyle: 'linux', welcome: 'MQTT Broker Management Console\nMosquitto v2.0.18\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the dashboard.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a unique cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix it and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'The MQTT broker serving all IoT devices has been found with critical security issues. Investigate and secure the message broker infrastructure.', scenario: 'Each scenario targets a different MQTT vulnerability — from exposed ports to topic injection and message poisoning.', outro: 'MQTT broker secured. Authentication, encryption, and access controls now protect all IoT communications.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = IOT003Config._requireScenario(engine); if (gate) return gate;
            var s = IOT003Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'no_auth') return '\nMQTT Broker: Port 1883 exposed, anonymous access, no ACLs';
            if (s && s.id === 'tls_disabled') return '\nAll 247 clients on unencrypted port 1883.';
            if (s && s.id === 'topic_injection') return '\nNo topic ACLs. Any client can publish anywhere.';
            if (s && s.id === 'wildcard_sub') return '\nUnauthorized wildcard subscriber exfiltrating data.';
            if (s && s.id === 'retained_msg_poison') return '\nPoisoned retained messages masking fire alarms.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = IOT003Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = IOT003Config._getScenario(engine);
            if (s && s.id === 'no_auth') return '\n3 external IPs connected. All data exposed.';
            if (s && s.id === 'tls_disabled') return '\nAll MQTT in plaintext. Sniffable.';
            if (s && s.id === 'topic_injection') return '\nUnauthorized HVAC commands from sensor client.';
            if (s && s.id === 'wildcard_sub') return '\nClient dev-99 forwarding to external IP.';
            if (s && s.id === 'retained_msg_poison') return '\nZone 2 fire alarm masked by fake retained msg.';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = IOT003Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = IOT003Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'no_auth' && joined.includes('enable-auth')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nAuth enabled, NAT removed, TLS active.\n\n=== FLAG: IOT003{no_auth_resolved} ===';
            }
            if (s && s.id === 'tls_disabled' && joined.includes('migrate-tls')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nAll clients migrated to TLS port 8883.\n\n=== FLAG: IOT003{tls_disabled_resolved} ===';
            }
            if (s && s.id === 'topic_injection' && joined.includes('topic-acls')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nTopic ACLs implemented. HVAC restricted.\n\n=== FLAG: IOT003{topic_injection_resolved} ===';
            }
            if (s && s.id === 'wildcard_sub' && joined.includes('block-wildcard')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nWildcard blocked, device quarantined.\n\n=== FLAG: IOT003{wildcard_sub_resolved} ===';
            }
            if (s && s.id === 'retained_msg_poison' && joined.includes('clear-retained')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nRetained messages purged, fire alarm visible.\n\n=== FLAG: IOT003{retained_msg_poison_resolved} ===';
            }
            return '\nUsage: fix <action>. Run "investigate" first for available actions.';
        },


        whoami: function() { return 'iot-admin'; },
        hostname: function() { return 'MQTT-SRV-01'; },
        clear: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ls: function() { return 'configs  logs  scripts  tools'; },
        dir: function() { return ' Directory of current folder\n  configs  logs  scripts  tools'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app !== 'ticket' && iconDef.app !== 'terminal' && iconDef.app !== 'hints' && iconDef.app !== 'reset_lab' && !engine.state._scenarioSelected) { engine.notify('Open the Alert first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': IOT003Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: IOT003Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'MQTT Broker Exposed Alert', 'TKT', c);
        IOT003Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) IOT003Config._renderTicket(engine, c); else IOT003Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Security — "MQTT broker internet-exposed with anonymous access"','IT — "All 247 IoT clients using unencrypted MQTT"','Facilities — "Unauthorized HVAC commands via MQTT topic injection"','Security — "IoT device exfiltrating all MQTT data via wildcard sub"','Engineering — "Poisoned retained messages masking fire alarms"'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#06b6d4;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        IOT003Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#06b6d4;font-weight:bold;">IOT003-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#06b6d4;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { IOT003Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); IOT003Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { IOT003Config._applyScenario(engine, Math.floor(Math.random()*IOT003Config._scenarios.length)); IOT003Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = IOT003Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#06b6d4;font-weight:bold;font-size:1rem;">INCIDENT #IOT003-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+IOT003Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+IOT003Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #06b6d433;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+IOT003Config._escHtml(s.ticketExtra)+'</div></div>':'')
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