/* ============================================================
   DISPATCH LAB — Box PERF002: VoIP Quality Degradation
   CompTIA Network+ — VoIP Troubleshooting (N10-009)
   5 scenarios: jitter (no QoS), packet loss (ISP), no voice VLAN,
   codec mismatch, SIP ALG mangling RTP
   ============================================================ */

var PERF002Config = {

    title: 'VoIP Quality Degradation',
    subtitle: 'Calls Are Choppy — Voice over IP Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_perf002',
    registryId: 'perf002-voip-quality',
    trackerKey: 'lab_perf002',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the VoIP quality complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check VoIP metrics', tip: 'Open the VoIP Dashboard to see jitter, latency, packet loss, and MOS scores.', trigger: { event: 'window_open', match: { type: 'voip_dash' } } },
            { title: 'Investigate the cause', tip: 'Use ping -t, iperf3, show qos, show vlan, or SIP diagnostics to find the root cause.', trigger: { event: 'command', match: { cmd: 'contains:ping' }, alt: [{ event: 'command', match: { cmd: 'contains:show' } }, { event: 'command', match: { cmd: 'contains:iperf' } }] } },
            { title: 'Apply the fix', tip: 'Configure QoS marking, fix VLAN assignment, correct codec settings, or disable SIP ALG.', trigger: { event: 'command', match: { cmd: 'contains:fix-' } } },
            { title: 'Capture the flag', tip: 'After fixing VoIP quality, check the VoIP Dashboard for the recovery token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Network+',
        mappings: [
            { flagId: 'fixed', objective: '1.2', description: 'Explain the characteristics of network topologies and types — VoIP', skill: 'Voice VLAN and QoS Configuration' },
            { flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network service issues', skill: 'VoIP Quality Troubleshooting' }
        ]
    },

    _scenarios: [
        {
            id: 'jitter_no_qos',
            name: 'Jitter Exceeding 30ms (No QoS)',
            ticketSubject: 'Phone calls choppy and robotic — voice breaking up constantly',
            ticketDetail: 'All VoIP phones in the office have terrible call quality. Voices sound robotic, words are cut off mid-sentence, and there are constant audio gaps. The problem gets worse during peak hours (10 AM - 2 PM) when network usage is highest. The phones work fine early morning and after hours when the network is quiet.',
            ticketExtra: 'IT Note: The voice traffic shares the same VLAN and QoS class as data traffic. No DSCP marking or priority queuing is configured. During peak hours, data traffic (file transfers, backups) is causing jitter spikes over 50ms on the voice RTP streams. Acceptable VoIP jitter is under 30ms.',
            fixDescription: 'Configure QoS to mark voice traffic with DSCP EF (46) and enable priority queuing',
            stateOverrides: { _jitterHigh: true }
        },
        {
            id: 'packet_loss_isp',
            name: 'Packet Loss on WAN (ISP Issue)',
            ticketSubject: 'External calls dropping and cutting out — internal calls fine',
            ticketDetail: 'Calls to external numbers (PSTN via SIP trunk) are experiencing frequent drops and one-way audio. Internal extension-to-extension calls are crystal clear. The SIP trunk provider says they see packet loss on our end. We recently switched ISPs and the new circuit may have issues.',
            ticketExtra: 'IT Note: Monitoring shows 3-5% packet loss on the WAN link to the SIP trunk provider (203.0.113.100). The old ISP had <0.1% loss. VoIP requires less than 1% packet loss for acceptable quality. The new ISP circuit may have a physical layer issue or congestion.',
            fixDescription: 'Identify and escalate the ISP packet loss issue, verify with extended ping tests',
            stateOverrides: { _packetLoss: true, _sipTrunkIp: '203.0.113.100' }
        },
        {
            id: 'no_voice_vlan',
            name: 'No Voice VLAN Configured',
            ticketSubject: 'VoIP phones competing with PCs for bandwidth on same VLAN',
            ticketDetail: 'Phone quality has been declining steadily since new workstations were deployed. The phones are daisy-chained through the workstations (phone -> PC -> switch port). There is no separate VLAN for voice traffic — everything runs on VLAN 1. Large file transfers from PCs cause immediate call quality drops.',
            ticketExtra: 'IT Note: The switch ports are configured as access ports on VLAN 1 with no voice VLAN. Phones and PCs share the same broadcast domain and bandwidth. Voice VLAN (VLAN 100) needs to be configured on the switch ports so phones are on a separate tagged VLAN with priority.',
            fixDescription: 'Configure voice VLAN 100 on switch ports and enable LLDP-MED/CDP for phone provisioning',
            stateOverrides: { _noVoiceVlan: true }
        },
        {
            id: 'codec_mismatch',
            name: 'Codec Mismatch (G.711 vs G.729)',
            ticketSubject: 'Calls between offices sound terrible — one office upgraded phone system',
            ticketDetail: 'Since the branch office upgraded their phone system last week, calls between headquarters and the branch sound awful. The audio is garbled and delayed. Internal calls at each site are fine. The branch is now running G.729 codec while headquarters uses G.711. The SIP trunk between offices cannot transcode.',
            ticketExtra: 'IT Note: HQ phones use G.711 (uncompressed, 64 kbps). Branch upgraded to G.729 (compressed, 8 kbps) to save WAN bandwidth. The SIP trunk has no transcoding capability, so codec negotiation fails and falls back to a degraded mode. Both sides need to agree on a codec.',
            fixDescription: 'Configure the SIP trunk to support both codecs or standardize on G.711 with QoS',
            stateOverrides: { _codecMismatch: true }
        },
        {
            id: 'sip_alg',
            name: 'SIP ALG Mangling RTP Streams',
            ticketSubject: 'One-way audio on external calls — can hear them but they cannot hear us',
            ticketDetail: 'External callers report they cannot hear us, but we can hear them perfectly. This is happening on about 60% of external calls. Internal calls work fine. The issue started after the firewall was replaced last month. The firewall vendor says SIP pass-through should work.',
            ticketExtra: 'IT Note: The new Fortinet firewall has SIP ALG (Application Layer Gateway) enabled by default. SIP ALG modifies SIP headers and SDP bodies to handle NAT, but it often breaks RTP media streams by rewriting ports incorrectly. Disabling SIP ALG usually fixes one-way audio issues.',
            fixDescription: 'Disable SIP ALG on the firewall and configure static NAT for the SIP trunk',
            stateOverrides: { _sipAlg: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Check the VoIP Dashboard for jitter, latency, packet loss, and MOS scores.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use ping -t for latency/loss, show qos for QoS config, show vlan for VLAN setup.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'VoIP needs: <150ms latency, <30ms jitter, <1% packet loss, MOS >3.5.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix the issue and verify with the VoIP Dashboard.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        jitter_no_qos: [
            { id: 'hint1', text: 'Choppy during peak hours. Jitter spikes when data traffic is heavy.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: show qos — check if any QoS policy exists for voice traffic.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'No QoS configured. Voice and data share the same priority. Voice needs DSCP EF marking.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-qos voice-priority — enables DSCP EF marking and priority queuing for voice.', cost: 150, penalty: -150 }
        ],
        packet_loss_isp: [
            { id: 'hint1', text: 'External calls bad, internal fine. Issue is on the WAN link.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: ping -t 203.0.113.100 to check packet loss to the SIP trunk provider.', cost: 50, penalty: -50 },
            { id: 'hint3', text: '3-5% packet loss on WAN. VoIP needs <1%. ISP circuit issue.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-isp escalate — documents the loss and escalates to ISP with evidence.', cost: 150, penalty: -150 }
        ],
        no_voice_vlan: [
            { id: 'hint1', text: 'Phones and PCs on same VLAN. File transfers kill call quality.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: show vlan to see the current VLAN configuration on switch ports.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'All ports on VLAN 1 with no voice VLAN. Need voice VLAN 100 configured.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-vlan voice-100 — configures voice VLAN 100 on all phone ports.', cost: 150, penalty: -150 }
        ],
        codec_mismatch: [
            { id: 'hint1', text: 'Inter-office calls garbled. Branch uses G.729, HQ uses G.711.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: show sip-trunk to see the codec negotiation between sites.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Codec mismatch. No transcoding on the SIP trunk. Need to standardize.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-codec standardize — configures both sites to use G.711 with QoS for WAN.', cost: 150, penalty: -150 }
        ],
        sip_alg: [
            { id: 'hint1', text: 'One-way audio on external calls. Started after firewall replacement.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: show firewall sip-status to check SIP ALG configuration.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'SIP ALG is enabled and mangling RTP headers. Rewriting ports incorrectly.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-firewall disable-sip-alg — disables SIP ALG and configures static NAT.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !PERF002Config._flagRestored) { PERF002Config._flagRestored = true; var s = PERF002Config._scenarios[engine.state._scenarioId]; if (s) PERF002Config.hints = PERF002Config._scenarioHints[s.id] || PERF002Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._jitterHigh = false; engine.state._packetLoss = false; engine.state._noVoiceVlan = false; engine.state._codecMismatch = false; engine.state._sipAlg = false; engine.state._labComplete = false; engine.state._flagRevealed = false; engine.state._fixApplied = false; var o = PERF002Config._scenarios[idx].stateOverrides || {}; for (var k in o) { engine.state[k] = o[k]; } PERF002Config._flagRestored = true; PERF002Config.hints = PERF002Config._scenarioHints[PERF002Config._scenarios[idx].id] || PERF002Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : PERF002Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['Cisco Catalyst 9300 IOS-XE', 'Memory: 8192MB', 'Loading...'], grubEntries: ['IOS-XE 17.6.3'], loginUser: 'voipadmin' },
    desktop: { icons: [
        { id: 'terminal',  label: 'Terminal',          icon: '>_',  app: 'terminal' },
        { id: 'voip_dash', label: 'VoIP\nDashboard',   icon: 'VIP', app: 'voip_dash' },
        { id: 'sip_diag',  label: 'SIP\nDiagnostics',  icon: 'SIP', app: 'sip_diag' },
        { id: 'net_info',  label: 'Network\nInfo',      icon: 'NET', app: 'net_info' },
        { id: 'ticket',    label: 'Help Desk\nTicket',  icon: 'HD',  app: 'ticket' },
        { id: 'hints',     label: 'Hints',              icon: '?',   app: 'hints' },
        { id: 'reset',     label: 'Reset\nLab',         icon: 'RST', app: 'reset_lab' }
    ] },
    terminal: { user: 'voipadmin', hostname: 'VOIP-GW01', startDir: '/home/voipadmin', promptStyle: 'linux', welcome: 'VoIP Operations Console\nConnected to VOIP-GW01\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [ { id: 'hint1', text: 'Check VoIP Dashboard for metrics.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'VoIP needs <150ms latency, <30ms jitter, <1% loss.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Check QoS, VLAN, codec, firewall SIP ALG settings.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Fix and verify.', cost: 50, penalty: -50 } ],
    lore: { intro: 'VoIP call quality has degraded. Users report choppy audio, dropped calls, or one-way audio. Diagnose the network issue affecting voice quality.', scenario: 'Each scenario targets a different VoIP infrastructure component — QoS, WAN quality, VLANs, codecs, or firewall settings.', outro: 'VoIP quality restored. Call quality metrics are within acceptable thresholds.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read ticket and check VoIP metrics.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the VoIP quality issue.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Fix the configuration.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Verify and capture flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        ping: function(args, term, engine) { var gate = PERF002Config._requireScenario(engine); if (gate) return gate; var s = PERF002Config._getScenario(engine); if (args.join(' ').includes('203.0.113.100') && engine.state._packetLoss) { return '\nPING 203.0.113.100: 100 packets transmitted\n  96 received, 4% packet loss\n  rtt min/avg/max = 12/45/180 ms\n  Jitter: 38ms\n\nWARNING: 4% packet loss exceeds VoIP threshold (1%)\n'; } if (engine.state._fixApplied) return '\nPING: 100 packets, 0% loss, avg 8ms, jitter 3ms\n'; return '\nPING: 100 packets, 0% loss, avg 12ms\n'; },
        iperf3: function(args, term, engine) { var gate = PERF002Config._requireScenario(engine); if (gate) return gate; if (engine.state._jitterHigh && !engine.state._fixApplied) return '\niperf3: Jitter test (UDP)\n  Jitter: 52ms (EXCEEDS 30ms threshold)\n  Packet loss: 0.2%\n  Note: No QoS differentiation — voice competes with data\n'; return '\niperf3: Jitter: 4ms, Loss: 0.0%, Bitrate: 94.1 Mbps\n'; },
        show: function(args, term, engine) {
            var gate = PERF002Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('qos')) { if (engine.state._jitterHigh && !engine.state._fixApplied) return '\nNo QoS policy configured.\nAll traffic class: Best Effort (DSCP 0)\nVoice traffic has no priority marking.\n'; return '\nQoS Policy: VOICE-PRIORITY\n  Class: VOICE (DSCP EF/46)\n    Priority queue: 20% bandwidth guarantee\n    Low-latency queue: enabled\n  Class: DATA (DSCP 0)\n    Fair queue: remaining bandwidth\n'; }
            if (joined.includes('vlan')) { if (engine.state._noVoiceVlan) return '\nVLAN  Name              Status    Ports\n----  ----              ------    -----\n1     default           active    Gi0/1-48\n\nNo voice VLAN configured. All ports on VLAN 1.\nPhones and PCs share the same broadcast domain.\n'; return '\nVLAN  Name              Status    Ports\n----  ----              ------    -----\n1     default           active    Gi0/1-48 (data)\n100   VOICE             active    Gi0/1-48 (tagged)\n'; }
            if (joined.includes('sip-trunk') || joined.includes('sip')) { if (engine.state._codecMismatch) return '\nSIP Trunk: HQ-to-Branch\n  HQ Codec: G.711 ulaw (64 kbps)\n  Branch Codec: G.729 (8 kbps)\n  Negotiation: FAILED — no common codec\n  Fallback: degraded passthrough (garbled audio)\n  Transcoding: NOT AVAILABLE\n'; return '\nSIP Trunk: HQ-to-Branch\n  Codec: G.711 ulaw (both sides)\n  Status: Connected\n  Quality: Good\n'; }
            if (joined.includes('firewall') && joined.includes('sip')) { if (engine.state._sipAlg) return '\nFirewall SIP ALG Status:\n  SIP ALG: ENABLED (default)\n  SIP Helper: Active\n  RTP Port Rewriting: Active\n\n  WARNING: SIP ALG is modifying SIP/SDP headers.\n  This is known to cause one-way audio by rewriting\n  RTP port assignments incorrectly during NAT traversal.\n'; return '\nFirewall SIP ALG: DISABLED\nStatic NAT: Configured for SIP trunk (UDP 5060, RTP 10000-20000)\n'; }
            return '\nUsage: show qos | show vlan | show sip-trunk | show firewall sip-status\n';
        },
        'fix-qos': function(args, term, engine) { var gate = PERF002Config._requireScenario(engine); if (gate) return gate; var s = PERF002Config._getScenario(engine); if (s.id === 'jitter_no_qos' && args.join(' ').toLowerCase().includes('voice')) { engine.state._fixApplied = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('QoS configured. Voice traffic prioritized. Jitter reduced. Check VoIP Dashboard.', 'success'); }, 400); return '\nQoS Policy applied:\n  Voice (DSCP EF/46): Priority queue, 20% bandwidth guarantee\n  Data (DSCP 0): Fair queue, remaining bandwidth\n  Jitter: 52ms -> 4ms (within threshold)\n'; } return '\nUsage: fix-qos voice-priority\n'; },
        'fix-isp': function(args, term, engine) { var gate = PERF002Config._requireScenario(engine); if (gate) return gate; var s = PERF002Config._getScenario(engine); if (s.id === 'packet_loss_isp' && args.join(' ').toLowerCase().includes('escalate')) { engine.state._fixApplied = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('ISP escalation submitted with packet loss evidence. ISP dispatched tech. Loss resolved. Check VoIP Dashboard.', 'success'); }, 400); return '\nISP Escalation ticket created:\n  Evidence: 4% packet loss over 24hr monitoring period\n  Extended ping: 10,000 packets, 4.2% loss, 38ms jitter\n  ISP Response: Faulty fiber splice at local CO. Repaired.\n  Post-fix: 0.0% loss, 3ms jitter\n'; } return '\nUsage: fix-isp escalate\n'; },
        'fix-vlan': function(args, term, engine) { var gate = PERF002Config._requireScenario(engine); if (gate) return gate; var s = PERF002Config._getScenario(engine); if (s.id === 'no_voice_vlan' && args.join(' ').toLowerCase().includes('voice')) { engine.state._fixApplied = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('Voice VLAN 100 configured. Phones isolated from data traffic. Check VoIP Dashboard.', 'success'); }, 400); return '\nVoice VLAN 100 configured on Gi0/1-48:\n  switchport voice vlan 100\n  spanning-tree portfast\n  LLDP-MED: enabled (phone auto-provisioning)\n  Phones rebooting to join VLAN 100...\n'; } return '\nUsage: fix-vlan voice-100\n'; },
        'fix-codec': function(args, term, engine) { var gate = PERF002Config._requireScenario(engine); if (gate) return gate; var s = PERF002Config._getScenario(engine); if (s.id === 'codec_mismatch' && args.join(' ').toLowerCase().includes('standardize')) { engine.state._fixApplied = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('Codec standardized to G.711 on both sites. QoS ensures WAN quality. Check VoIP Dashboard.', 'success'); }, 400); return '\nSIP Trunk codec updated:\n  HQ: G.711 ulaw (64 kbps) — unchanged\n  Branch: G.711 ulaw (64 kbps) — changed from G.729\n  WAN QoS: Voice priority queue enabled\n  Negotiation: SUCCESS\n'; } return '\nUsage: fix-codec standardize\n'; },
        'fix-firewall': function(args, term, engine) { var gate = PERF002Config._requireScenario(engine); if (gate) return gate; var s = PERF002Config._getScenario(engine); if (s.id === 'sip_alg' && args.join(' ').toLowerCase().includes('disable-sip-alg')) { engine.state._fixApplied = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('SIP ALG disabled. Static NAT configured. Two-way audio restored. Check VoIP Dashboard.', 'success'); }, 400); return '\nFirewall updated:\n  SIP ALG: DISABLED\n  SIP Helper: DISABLED\n  Static NAT: UDP 5060 (SIP), UDP 10000-20000 (RTP)\n  Two-way audio: RESTORED\n'; } return '\nUsage: fix-firewall disable-sip-alg\n'; },
        whoami: function() { return 'voipadmin'; },
        hostname: function() { return 'VOIP-GW01'; },
        clear: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    onAppLaunch(iconDef, engine) {
        var req = ['voip_dash', 'sip_diag', 'net_info'];
        if (req.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket':    PERF002Config._openTicket(iconDef, engine); break;
            case 'voip_dash': PERF002Config._openVoipDash(iconDef, engine); break;
            case 'sip_diag':  PERF002Config._openSipDiag(iconDef, engine); break;
            case 'net_info':  PERF002Config._openNetInfo(iconDef, engine); break;
            case 'reset_lab': PERF002Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) { if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; } var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;'; engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c); PERF002Config._ensureScenario(engine); if (engine.state._scenarioSelected) { PERF002Config._renderTicket(engine, c); } else { PERF002Config._renderPicker(engine, c); } },

    _renderPicker(engine, c) {
        var previews = ['Office Manager — "Phone calls choppy and robotic during the day"', 'Telecom — "External calls dropping — internal calls fine"', 'IT Director — "VoIP quality bad since new workstations deployed"', 'Branch Manager — "Inter-office calls garbled since phone upgrade"', 'Help Desk — "One-way audio on external calls since firewall swap"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#f59e0b; font-weight:bold; font-size:1.1rem;">VOIP QUALITY QUEUE</div></div><div>';
        PERF002Config._scenarios.forEach(function(s, i) { html += '<button class="p2btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#f59e0b; font-weight:bold;">VOIP-' + (1000 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="p2rand" style="padding:10px 28px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random Assignment</button></div>';
        c.innerHTML = html;
        c.querySelectorAll('.p2btn').forEach(function(b) { b.addEventListener('mouseenter', function() { this.style.borderColor = '#f59e0b'; }); b.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; }); b.addEventListener('click', function() { PERF002Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); PERF002Config._renderTicket(engine, c); }); });
        document.getElementById('p2rand').addEventListener('click', function() { PERF002Config._applyScenario(engine, Math.floor(Math.random() * PERF002Config._scenarios.length)); PERF002Config._renderTicket(engine, c); });
    },

    _renderTicket(engine, c) { var s = PERF002Config._getScenario(engine); var subs = ['Office Manager', 'Telecom Engineer', 'IT Director', 'Branch Manager', 'Help Desk Tier 2']; c.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#f59e0b; font-weight:bold;">VOIP TICKET #VOIP-' + (1000 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">URGENT</span></div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBMITTED BY</div><div>' + subs[engine.state._scenarioId] + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + PERF002Config._escHtml(s.ticketSubject) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + PERF002Config._escHtml(s.ticketDetail) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#fde68a;">' + PERF002Config._escHtml(s.ticketExtra) + '</div></div><div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#f59e0b; font-weight:bold;">ASSIGNED TO: YOU — VoIP/Network Administrator</div></div>'; },

    _openVoipDash(iconDef, engine) { if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); PERF002Config._renderVoipDash(engine); return; } var c = document.createElement('div'); c.id = 'vdContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;'; engine.openWindow(iconDef.id, 'VoIP Dashboard', 'VIP', c); PERF002Config._renderVoipDash(engine); },

    _renderVoipDash(engine) {
        var c = document.getElementById('vdContainer'); if (!c) return;
        var s = PERF002Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">VoIP Quality Dashboard</div>';
        if (engine.state._fixApplied) {
            html += '<div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:16px; text-align:center;"><div style="color:#10b981; font-weight:bold;">Call Quality: Excellent</div><div style="color:#a7f3d0;">MOS: 4.3 | Jitter: 4ms | Loss: 0.0% | Latency: 12ms</div></div>';
            if (engine.state._flagRevealed) { html += '<div style="margin-top:16px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:12px;"><div style="color:#10b981; font-weight:bold;">Fix Confirmed:</div><div id="p2flag" style="color:#c8e6c9;">Recovery token: loading...</div></div>'; }
        } else {
            var metrics = { jitter_no_qos: { mos: '2.1', jitter: '52ms', loss: '0.2%', latency: '45ms', issue: 'Jitter exceeds 30ms threshold — no QoS marking' }, packet_loss_isp: { mos: '2.5', jitter: '38ms', loss: '4.2%', latency: '45ms', issue: 'Packet loss 4.2% on WAN — ISP circuit degraded' }, no_voice_vlan: { mos: '2.8', jitter: '25ms', loss: '0.5%', latency: '20ms', issue: 'Phones on data VLAN — bandwidth contention during transfers' }, codec_mismatch: { mos: '1.8', jitter: '15ms', loss: '0.1%', latency: '80ms', issue: 'Codec mismatch G.711/G.729 — no transcoding available' }, sip_alg: { mos: '2.0', jitter: '8ms', loss: '0.0%', latency: '15ms', issue: 'One-way audio — SIP ALG rewriting RTP ports' } };
            var m = metrics[s.id];
            html += '<div style="display:flex; gap:12px; margin-bottom:16px;"><div style="flex:1; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:12px; text-align:center;"><div style="color:#e74c3c; font-size:1.3rem; font-weight:bold;">MOS ' + m.mos + '</div><div style="color:#888; font-size:0.7rem;">Mean Opinion Score</div></div><div style="flex:1; text-align:center; padding:12px;"><div>Jitter: <span style="color:#e74c3c;">' + m.jitter + '</span></div><div>Loss: <span style="color:#e74c3c;">' + m.loss + '</span></div><div>Latency: ' + m.latency + '</div></div></div>';
            html += '<div style="background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:12px;"><div style="color:#e74c3c; font-weight:bold;">Issue:</div><div style="color:#ffcc80;">' + m.issue + '</div></div>';
        }
        c.innerHTML = html;
        if (engine.state._flagRevealed && engine.state._fixApplied) { BoxEngine.requestFlagText(s.id).then(function(ft) { var el = document.getElementById('p2flag'); if (el) el.textContent = 'Recovery token: ' + (ft || 'Flag unavailable'); }); }
    },

    _openSipDiag(iconDef, engine) { if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; } var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;'; engine.openWindow(iconDef.id, 'SIP Diagnostics', 'SIP', c); c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">SIP Diagnostics</div><div style="color:#888; font-size:0.75rem;">Use "show sip-trunk" and "show firewall sip-status" in terminal.</div>'; },

    _openNetInfo(iconDef, engine) { if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; } var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;'; engine.openWindow(iconDef.id, 'Network Info', 'NET', c); c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">VoIP Network</div><div style="font-size:0.75rem; color:#aaa; line-height:1.8;"><div>PBX: Asterisk 18.x on VOIP-GW01 (10.0.1.5)</div><div>SIP Trunk: 203.0.113.100 (SIP provider)</div><div>Phones: 48x Polycom VVX 450</div><div>Data VLAN: 1 | Voice VLAN: 100 (if configured)</div><div>WAN: 100 Mbps (Comcast Business)</div><div>Firewall: Fortinet FortiGate 60F</div></div>'; },

    _confirmReset(engine) { var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;'; o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;"><div style="color:#e74c3c; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="color:#aaa; font-size:0.8rem; margin-bottom:20px;">Clear progress and restart.</div><div style="display:flex; gap:12px; justify-content:center;"><button id="p2rc" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="p2cc" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>'; document.getElementById('arena').appendChild(o); document.getElementById('p2rc').addEventListener('click', function() { PERF002Config._flagRestored = false; PERF002Config.hints = PERF002Config._defaultHints; engine.reset(); }); document.getElementById('p2cc').addEventListener('click', function() { o.remove(); }); o.addEventListener('click', function(e) { if (e.target === o) o.remove(); }); }
};
