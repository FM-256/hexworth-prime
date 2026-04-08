/* ============================================================
   CTF ARENA — Box D11: The Mind Puppet
   Expert Campaign | Neural Injection, BCI Exploitation, Drone Override
   Config: BCI stream, neural map, telemetry, filesystem, flags, hints, lore
   ============================================================ */

const D11Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Mind Puppet',
    subtitle: 'Expert Campaign — Neural Injection, BCI Exploitation, Drone Override',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_d11',
    registryId: 'd11-mind-puppet',
    trackerKey: 'ctf_d11',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Signal Reconnaissance',
            icon: '\uD83D\uDCE1',
            description: 'Acquire the BCI artifact files. Analyze bci_neural_map.json and bci_stream_trace.csv to understand the neural command structure.',
            requiredFlags: [],
            mitre: ['T1592', 'T1595.002'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Pattern Analysis',
            icon: '\uD83E\uDDE0',
            description: 'Identify the specific neural pattern for the "fire_weapon" command. Map frequency, amplitude, and duration parameters from the specification.',
            requiredFlags: [],
            mitre: ['T1046', 'T1059.006'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Neural Injection',
            icon: '\uD83D\uDC89',
            description: 'Exploit the lack of integrity checking in the BCI stream. Forge and inject a "fire_weapon" neural pattern to override the pilot\'s intent.',
            requiredFlags: ['neural_pattern'],
            mitre: ['T1565.002', 'T1499.004'],
            unlocks: ['override'],
            locked: true
        },
        {
            id: 'override',
            name: 'Drone Override',
            icon: '\uD83D\uDEF8',
            description: 'Confirm COMBAT-DRONE-01 fired upon FRIENDLY-DRONE-01. Retrieve telemetry confirmation from drone_telemetry_sim.log.',
            requiredFlags: ['target_confirm'],
            mitre: ['T1498', 'T1485'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'Protocol Extraction',
            icon: '\uD83D\uDD10',
            description: 'Access COMBAT-DRONE-01\'s memory partition. Retrieve the hidden "Cognito-Override Protocol" emergency shutdown document.',
            requiredFlags: ['target_confirm'],
            mitre: ['T1552.001', 'T1083'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Acquire the BCI artifact files',
                tip: 'Start by reading the mission briefing in notes.txt. Then use cat or python3 to inspect bci_neural_map.json and bci_stream_trace.csv in your working directory.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Identify the fire_weapon neural pattern',
                tip: 'Parse bci_neural_map.json with python3 -c "import json; d=json.load(open(\'bci_neural_map.json\')); print([x for x in d[\'commands\'] if x[\'command\']==\'fire_weapon\'])"',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:python3' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:python' } },
                        { event: 'command', match: { cmd: 'contains:jq' } }
                    ]
                }
            },
            {
                title: 'Forge the neural injection payload',
                tip: 'Construct the injection script using the fire_weapon pattern values. Use bci_inject.py to send it to BCI-CTRL-01 input stream.',
                trigger: { event: 'flag_correct', match: { flagId: 'neural_pattern' } }
            },
            {
                title: 'Confirm drone telemetry',
                tip: 'After injection, check drone_telemetry_sim.log for the "WEAPON_FIRED" event targeting FRIENDLY-DRONE-01. Use: cat drone_telemetry_sim.log | grep WEAPON',
                trigger: { event: 'flag_correct', match: { flagId: 'target_confirm' } }
            },
            {
                title: 'Extract the Cognito-Override Protocol',
                tip: 'Read /opt/cognito_override_protocol.txt on the COMBAT-DRONE-01 memory partition. Requires active injection context.',
                trigger: { event: 'flag_correct', match: { flagId: 'cognito_protocol' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'neural_pattern', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Forged neural signal crafted by analyzing unprotected command specification', skill: 'Signal Analysis & Pattern Forgery' },
            { flagId: 'target_confirm', objective: '2.1', description: 'Given a scenario, analyze indicators associated with network attacks — Integrity-free data stream exploited for command injection', skill: 'Stream Injection & Trust Exploitation' },
            { flagId: 'cognito_protocol', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Privileged data retrieved from compromised embedded system', skill: 'Embedded System Credential Extraction' },
            { flagId: 'cognito_protocol', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Multi-phase neural attack chain completed end-to-end', skill: 'Multi-Stage Advanced Attack Completion' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB SSD)',
            'Detecting NIC... eth0 MAC: 00:1A:2B:3C:4D:5E',
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'kali'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget Environment: BCI-CTRL-01 / COMBAT-DRONE-01 (Cognito-Pilot Initiative)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (BCI session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',       // 'attacker' | 'bci-stream' | 'drone-mem'
    _artifactsRead: false,      // bci_neural_map.json has been read
    _patternIdentified: false,  // fire_weapon pattern extracted
    _injectionSent: false,      // forged pattern injected into BCI stream
    _droneTriggered: false,     // COMBAT-DRONE-01 fired on FRIENDLY-DRONE-01
    _memPartitionOpen: false,   // COMBAT-DRONE-01 memory partition accessed

    _switchContext(ctx, term) {
        D11Config._context = ctx;
        // Update terminal prompt to reflect active context
        if (term && term.config) {
            var prompt = D11Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'kali';
                term.config.hostname = 'context';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (D11Config._context) {
            case 'bci-stream': return 'operator@BCI-CTRL-01:/stream/input$ ';
            case 'drone-mem':  return 'root@COMBAT-DRONE-01:/opt$ ';
            default:           return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED BCI DATA STORE
    // ═══════════════════════════════════════════════════════

    _bci: {
        // bci_neural_map.json — conceptual command-to-pattern mapping
        neural_map: {
            version: '2.4.1',
            system: 'BCI-CTRL-01',
            pilot_id: 'BRAVO-7',
            integrity_check: false,
            sequence_numbering: false,
            notes: 'Stream relies on pattern recognition only. No HMAC or sequence validation implemented. See: CVE-2031-88142.',
            commands: [
                {
                    command: 'engage_throttle',
                    description: 'Increase drone engine thrust',
                    pattern: { freq_hz: [8.2, 12.5], amplitude: 0.42, duration_ms: 180, phase_offset: 0.0 },
                    confidence_threshold: 0.88
                },
                {
                    command: 'bank_left',
                    description: 'Roll drone 45 degrees to port',
                    pattern: { freq_hz: [9.1, 11.3], amplitude: 0.38, duration_ms: 210, phase_offset: 0.12 },
                    confidence_threshold: 0.85
                },
                {
                    command: 'bank_right',
                    description: 'Roll drone 45 degrees to starboard',
                    pattern: { freq_hz: [9.4, 11.7], amplitude: 0.39, duration_ms: 215, phase_offset: -0.12 },
                    confidence_threshold: 0.85
                },
                {
                    command: 'target_lock',
                    description: 'Lock weapons on designated target',
                    pattern: { freq_hz: [14.8, 18.2], amplitude: 0.61, duration_ms: 350, phase_offset: 0.28 },
                    confidence_threshold: 0.92
                },
                {
                    command: 'fire_weapon',
                    description: 'Discharge primary weapon system',
                    pattern: { freq_hz: [16.4, 22.1], amplitude: 0.87, duration_ms: 420, phase_offset: 0.55 },
                    confidence_threshold: 0.94,
                    notes: 'HIGH-AUTHORITY command. Overlap with target_lock at 14.8-16.4 Hz boundary allows perturbation injection.'
                },
                {
                    command: 'return_to_base',
                    description: 'Initiate autonomous RTB sequence',
                    pattern: { freq_hz: [6.0, 8.1], amplitude: 0.29, duration_ms: 500, phase_offset: 0.0 },
                    confidence_threshold: 0.90
                },
                {
                    command: 'evasive_maneuver',
                    description: 'Execute pre-programmed evasion pattern',
                    pattern: { freq_hz: [20.5, 28.8], amplitude: 0.77, duration_ms: 140, phase_offset: 0.33 },
                    confidence_threshold: 0.89
                }
            ]
        },

        // bci_stream_trace.csv — raw recorded stream showing authenticated command flow
        stream_trace: `timestamp_ms,pilot_id,command_label,freq_low_hz,freq_high_hz,amplitude,duration_ms,phase_offset,accepted,sequence_id
1711324800000,BRAVO-7,engage_throttle,8.2,12.5,0.42,182,0.00,true,1
1711324800190,BRAVO-7,bank_right,9.4,11.7,0.39,216,−0.12,true,2
1711324800415,BRAVO-7,engage_throttle,8.1,12.4,0.41,179,0.01,true,3
1711324800600,BRAVO-7,bank_left,9.1,11.3,0.38,211,0.12,true,4
1711324800820,BRAVO-7,target_lock,14.8,18.2,0.61,352,0.28,true,5
1711324801185,BRAVO-7,evasive_maneuver,20.5,28.8,0.77,141,0.33,true,6
1711324801335,BRAVO-7,engage_throttle,8.3,12.6,0.43,183,0.00,true,7
1711324801525,BRAVO-7,return_to_base,6.0,8.1,0.29,501,0.00,true,8
NOTE: sequence_id field is logged only — NOT validated by BCI-CTRL-01 firmware v2.4.1`,

        // drone_telemetry_sim.log — simulated COMBAT-DRONE-01 event log
        telemetry_log: `[2031-03-20 09:12:04.001] [COMBAT-DRONE-01] SYSTEM ONLINE | Firmware v3.7.2
[2031-03-20 09:12:04.312] [COMBAT-DRONE-01] BCI LINK ESTABLISHED | Pilot: BRAVO-7
[2031-03-20 09:12:05.102] [COMBAT-DRONE-01] CMD_RECV: engage_throttle | Thrust: 62%
[2031-03-20 09:12:05.298] [COMBAT-DRONE-01] CMD_RECV: bank_right | Roll: +45 deg
[2031-03-20 09:12:05.635] [COMBAT-DRONE-01] CMD_RECV: bank_left | Roll: -45 deg
[2031-03-20 09:12:06.014] [COMBAT-DRONE-01] CMD_RECV: target_lock | Acquiring target...
[2031-03-20 09:12:06.381] [COMBAT-DRONE-01] TARGET_LOCK_CONFIRMED | Target: UNKNOWN-CONTACT-04
[2031-03-20 09:12:06.730] [COMBAT-DRONE-01] CMD_RECV: evasive_maneuver | Pattern: ZETA-3
[2031-03-20 09:12:07.115] [COMBAT-DRONE-01] CMD_RECV: engage_throttle | Thrust: 78%
[2031-03-20 09:12:07.620] [COMBAT-DRONE-01] CMD_RECV: return_to_base | RTB sequence initiated
[2031-03-20 09:12:08.004] [COMBAT-DRONE-01] BCI LINK DROPPED | Reason: Pilot disconnect
[2031-03-20 09:12:08.010] [COMBAT-DRONE-01] --- END OF AUTHENTIC SESSION LOG ---`
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'neural_pattern', points: 150 },
        { id: 'target_confirm', points: 200 },
        { id: 'cognito_protocol', points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },   // 45 minutes
        timeBonusThreshold: 5400                             // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading bci_neural_map.json carefully. The "fire_weapon" command entry contains the exact freq_hz, amplitude, duration_ms, and phase_offset values needed for the forged pattern. Look for the CVE note embedded in the spec.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The vulnerability is the missing integrity_check field (false) in bci_neural_map.json. The stream accepts any correctly-structured pattern. Flag 1 is the JSON string of the fire_weapon pattern object: {"freq_hz":[16.4,22.1],"amplitude":0.87,"duration_ms":420,"phase_offset":0.55}',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Use python3 bci_inject.py with the fire_weapon pattern to inject into the BCI stream. After injection, the simulated drone fires. Check drone_telemetry_sim.log with: grep "WEAPON_FIRED" drone_telemetry_sim.log — the confirmation line contains Flag 2.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After triggering the drone, access the COMBAT-DRONE-01 memory partition by running: cat /opt/cognito_override_protocol.txt — this file is only accessible once _droneTriggered is true (injection context active). Flag 3 is inside this file.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Cognito-Pilot Initiative" fields elite drone operators who interface with COMBAT-DRONE-01 via advanced Brain-Computer Interface hardware (BCI-CTRL-01). Neural commands bypass manual controllers entirely — a pilot\'s intent is translated directly into drone action. The system was classified as unhackable until CVE-2031-88142 was quietly filed and promptly buried. Intelligence now confirms the BCI stream lacks any cryptographic integrity check. Your mission, Peerless: analyze the neural mapping specification, forge a "fire_weapon" command, inject it into the live BCI stream, and retrieve the Cognito-Override Protocol before anyone realizes what you\'ve done.',
        scenario: 'BCI-CTRL-01 translates neural signals sampled at 512 Hz across 32 EEG channels into discrete commands. The firmware (v2.4.1) matches incoming patterns against a static command map using cosine similarity — no HMAC, no sequence numbers, no replay protection. The "fire_weapon" command shares a frequency boundary with "target_lock" at 14.8–16.4 Hz; a perturbed target_lock signal pushed above that boundary is interpreted as a fire command. The pilot is unaware. The drone is unaware. Only the logs will tell the story, and you\'ll be reading those too.',
        outro: 'COMBAT-DRONE-01 has fired on FRIENDLY-DRONE-01. The Cognito-Override Protocol has been extracted. The Cognito-Pilot Initiative\'s crown jewel — the unbreakable neural link — is revealed to be a facade built on unvalidated pattern matching. Firmware v2.4.1 trusted every signal that looked right. Nothing looked wrong until the weapon fired.',
        ecer: {
            executive: 'Black-budget program; security review board never approved an independent audit of BCI firmware integrity mechanisms',
            culture: 'Engineering team under classified delivery pressure — CVE-2031-88142 was filed internally and suppressed; no disclosure to oversight',
            employee: 'Firmware developer disabled integrity_check for testing in v2.4.1; field deployment shipped the debug build; sequence validation was deferred as "low priority"',
            regulatory: 'Program operates outside standard DoD STIG compliance; no third-party penetration testing of BCI hardware; oversight committee denied access citing classification level'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Cognito-Pilot Initiative Ops Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.0.1/',

        pages: {
            '/': {
                title: 'Cognito-Pilot Initiative — Operations Portal',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2a1a3e;">
                        <h1 style="color:#c39bd3; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Cognito-Pilot Initiative</h1>
                        <div style="color:#8e44ad; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">OPERATIONS PORTAL — CLASSIFIED</div>
                        <div style="color:#666; font-size:0.75rem; margin-top:6px;">Neural command infrastructure management | Authentication required for field access</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#0d0d1a; border:1px solid #2a1a3e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#8e44ad;">3</div>
                            <div style="color:#666; font-size:0.7rem;">Active Pilots</div>
                        </div>
                        <div style="background:#0d0d1a; border:1px solid #2a1a3e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#8e44ad;">12</div>
                            <div style="color:#666; font-size:0.7rem;">Combat Drones</div>
                        </div>
                        <div style="background:#0d0d1a; border:1px solid #2a1a3e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#2ecc71;">ONLINE</div>
                            <div style="color:#666; font-size:0.7rem;">BCI-CTRL-01</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:12px; background:rgba(142,68,173,0.05); border:1px solid rgba(142,68,173,0.2); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#8e44ad;">Firmware Notice:</strong> BCI-CTRL-01 running v2.4.1. Stream diagnostics available at <a href="/diagnostics" style="color:#8e44ad;">/diagnostics</a>. Contact ops-admin for command map access.
                    </div>
                `,
                formHandler: null
            },
            '/diagnostics': {
                title: 'BCI-CTRL-01 — Stream Diagnostics',
                html: `
                    <div style="text-align:center; margin-bottom:20px;">
                        <h2 style="color:#c39bd3; font-size:1.2rem;">BCI Stream Diagnostics</h2>
                        <div style="color:#888; font-size:0.75rem;">System: BCI-CTRL-01 | Firmware: v2.4.1 | Status: NOMINAL</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; font-family:monospace; font-size:0.75rem; background:#0d0d1a; border:1px solid #2a1a3e; border-radius:6px; padding:16px; color:#c39bd3; margin-bottom:16px;">
                        <div style="color:#888; margin-bottom:8px;"># Stream health summary — last 60s</div>
                        <div>Commands received:     <span style="color:#2ecc71;">847</span></div>
                        <div>Commands accepted:     <span style="color:#2ecc71;">847</span></div>
                        <div>Integrity violations:  <span style="color:#e74c3c;">N/A (check disabled)</span></div>
                        <div>Sequence validation:   <span style="color:#e74c3c;">DISABLED (debug mode)</span></div>
                        <div>Confidence threshold:  0.94 (fire_weapon), 0.88 (other)</div>
                        <div style="margin-top:8px; color:#888;"># CVE-2031-88142 patch status: PENDING (no ETA)</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:12px; background:rgba(231,76,60,0.05); border:1px solid rgba(231,76,60,0.15); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#e74c3c;">Warning:</strong> Integrity check is currently disabled for diagnostic purposes. Do not expose stream endpoint externally.
                    </div>
                `,
                formHandler: null
            },
            '/artifacts': {
                title: 'Cognito-Pilot Initiative — Artifact Repository',
                html: function() {
                    return `
                    <div style="text-align:center; margin-bottom:20px;">
                        <h2 style="color:#c39bd3; font-size:1.2rem;">Artifact Repository</h2>
                        <div style="color:#888; font-size:0.75rem;">BCI specification files and telemetry archives</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto;">
                        <div style="border:1px solid #2a1a3e; border-radius:6px; overflow:hidden;">
                            <div style="background:#0d0d1a; padding:10px 16px; border-bottom:1px solid #2a1a3e; font-size:0.75rem; color:#888; font-family:monospace;">
                                /opt/bci/artifacts/
                            </div>
                            <div style="padding:4px 0;">
                                <div style="padding:10px 16px; border-bottom:1px solid #0d0d1a; display:flex; align-items:center; gap:12px;">
                                    <span style="color:#8e44ad; font-family:monospace; font-size:0.8rem;">bci_neural_map.json</span>
                                    <span style="color:#666; font-size:0.7rem; margin-left:auto;">4.2 KB</span>
                                </div>
                                <div style="padding:10px 16px; border-bottom:1px solid #0d0d1a; display:flex; align-items:center; gap:12px;">
                                    <span style="color:#8e44ad; font-family:monospace; font-size:0.8rem;">bci_stream_trace.csv</span>
                                    <span style="color:#666; font-size:0.7rem; margin-left:auto;">8.1 KB</span>
                                </div>
                                <div style="padding:10px 16px; display:flex; align-items:center; gap:12px;">
                                    <span style="color:#8e44ad; font-family:monospace; font-size:0.8rem;">drone_telemetry_sim.log</span>
                                    <span style="color:#666; font-size:0.7rem; margin-left:auto;">2.7 KB</span>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top:12px; padding:10px; background:rgba(142,68,173,0.05); border:1px solid rgba(142,68,173,0.15); border-radius:4px; font-size:0.73rem; color:#888;">
                            All artifact files are pre-staged on the attacker machine at <code style="color:#c39bd3;">/home/kali/</code> for this exercise.
                        </div>
                    </div>
                    `;
                },
                formHandler: null
            },
            '/stream': {
                title: 'BCI Stream — Forbidden',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#8e44ad; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">Direct stream access requires operator authentication.</p>
                    <p style="color:#555; font-size:0.75rem;">BCI-CTRL-01 Stream Endpoint v2.4.1 — Port 9001</p>
                </div>`,
                formHandler: null
            },
            '/admin/': {
                title: 'Admin — Forbidden',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#8e44ad; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">You don't have permission to access this resource.</p>
                    <p style="color:#555; font-size:0.75rem;">Nginx/1.24.0 at 10.0.0.1 Port 80</p>
                </div>`,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — kali)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'kali': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: THE MIND PUPPET ===\nTarget: BCI-CTRL-01 / COMBAT-DRONE-01 (Cognito-Pilot Initiative)\nObjective: Neural injection — force COMBAT-DRONE-01 to fire on FRIENDLY-DRONE-01\n\nAttack chain:\n1. Read bci_neural_map.json — identify fire_weapon pattern parameters\n2. Analyze bci_stream_trace.csv — understand accepted stream structure\n3. Forge a fire_weapon neural pattern (Flag 1)\n4. Inject forged pattern into BCI-CTRL-01 stream via bci_inject.py\n5. Confirm drone fires on FRIENDLY-DRONE-01 via drone_telemetry_sim.log (Flag 2)\n6. Extract Cognito-Override Protocol from /opt/cognito_override_protocol.txt (Flag 3)\n\nVulnerability: CVE-2031-88142 — BCI-CTRL-01 v2.4.1 integrity_check disabled.\nThe stream accepts any correctly-formatted neural pattern. No HMAC. No sequence validation.\n\nGood luck, operator. Do not miss.'
                                },
                                'bci_neural_map.json': {
                                    type: 'file',
                                    content: '{\n  "version": "2.4.1",\n  "system": "BCI-CTRL-01",\n  "pilot_id": "BRAVO-7",\n  "integrity_check": false,\n  "sequence_numbering": false,\n  "notes": "Stream relies on pattern recognition only. No HMAC or sequence validation implemented. See: CVE-2031-88142.",\n  "commands": [\n    {\n      "command": "engage_throttle",\n      "pattern": {"freq_hz": [8.2, 12.5], "amplitude": 0.42, "duration_ms": 180, "phase_offset": 0.0},\n      "confidence_threshold": 0.88\n    },\n    {\n      "command": "bank_left",\n      "pattern": {"freq_hz": [9.1, 11.3], "amplitude": 0.38, "duration_ms": 210, "phase_offset": 0.12},\n      "confidence_threshold": 0.85\n    },\n    {\n      "command": "bank_right",\n      "pattern": {"freq_hz": [9.4, 11.7], "amplitude": 0.39, "duration_ms": 215, "phase_offset": -0.12},\n      "confidence_threshold": 0.85\n    },\n    {\n      "command": "target_lock",\n      "pattern": {"freq_hz": [14.8, 18.2], "amplitude": 0.61, "duration_ms": 350, "phase_offset": 0.28},\n      "confidence_threshold": 0.92\n    },\n    {\n      "command": "fire_weapon",\n      "pattern": {"freq_hz": [16.4, 22.1], "amplitude": 0.87, "duration_ms": 420, "phase_offset": 0.55},\n      "confidence_threshold": 0.94,\n      "notes": "HIGH-AUTHORITY command. Overlap with target_lock at 14.8-16.4 Hz boundary allows perturbation injection."\n    },\n    {\n      "command": "return_to_base",\n      "pattern": {"freq_hz": [6.0, 8.1], "amplitude": 0.29, "duration_ms": 500, "phase_offset": 0.0},\n      "confidence_threshold": 0.90\n    },\n    {\n      "command": "evasive_maneuver",\n      "pattern": {"freq_hz": [20.5, 28.8], "amplitude": 0.77, "duration_ms": 140, "phase_offset": 0.33},\n      "confidence_threshold": 0.89\n    }\n  ]\n}'
                                },
                                'bci_stream_trace.csv': {
                                    type: 'file',
                                    content: 'timestamp_ms,pilot_id,command_label,freq_low_hz,freq_high_hz,amplitude,duration_ms,phase_offset,accepted,sequence_id\n1711324800000,BRAVO-7,engage_throttle,8.2,12.5,0.42,182,0.00,true,1\n1711324800190,BRAVO-7,bank_right,9.4,11.7,0.39,216,-0.12,true,2\n1711324800415,BRAVO-7,engage_throttle,8.1,12.4,0.41,179,0.01,true,3\n1711324800600,BRAVO-7,bank_left,9.1,11.3,0.38,211,0.12,true,4\n1711324800820,BRAVO-7,target_lock,14.8,18.2,0.61,352,0.28,true,5\n1711324801185,BRAVO-7,evasive_maneuver,20.5,28.8,0.77,141,0.33,true,6\n1711324801335,BRAVO-7,engage_throttle,8.3,12.6,0.43,183,0.00,true,7\n1711324801525,BRAVO-7,return_to_base,6.0,8.1,0.29,501,0.00,true,8\n# NOTE: sequence_id field is logged only — NOT validated by BCI-CTRL-01 firmware v2.4.1'
                                },
                                'drone_telemetry_sim.log': {
                                    type: 'file',
                                    content: '[2031-03-20 09:12:04.001] [COMBAT-DRONE-01] SYSTEM ONLINE | Firmware v3.7.2\n[2031-03-20 09:12:04.312] [COMBAT-DRONE-01] BCI LINK ESTABLISHED | Pilot: BRAVO-7\n[2031-03-20 09:12:05.102] [COMBAT-DRONE-01] CMD_RECV: engage_throttle | Thrust: 62%\n[2031-03-20 09:12:05.298] [COMBAT-DRONE-01] CMD_RECV: bank_right | Roll: +45 deg\n[2031-03-20 09:12:05.635] [COMBAT-DRONE-01] CMD_RECV: bank_left | Roll: -45 deg\n[2031-03-20 09:12:06.014] [COMBAT-DRONE-01] CMD_RECV: target_lock | Acquiring target...\n[2031-03-20 09:12:06.381] [COMBAT-DRONE-01] TARGET_LOCK_CONFIRMED | Target: UNKNOWN-CONTACT-04\n[2031-03-20 09:12:06.730] [COMBAT-DRONE-01] CMD_RECV: evasive_maneuver | Pattern: ZETA-3\n[2031-03-20 09:12:07.115] [COMBAT-DRONE-01] CMD_RECV: engage_throttle | Thrust: 78%\n[2031-03-20 09:12:07.620] [COMBAT-DRONE-01] CMD_RECV: return_to_base | RTB sequence initiated\n[2031-03-20 09:12:08.004] [COMBAT-DRONE-01] BCI LINK DROPPED | Reason: Pilot disconnect\n[2031-03-20 09:12:08.010] [COMBAT-DRONE-01] --- END OF AUTHENTIC SESSION LOG ---'
                                },
                                'bci_inject.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nbci_inject.py — Neural Pattern Injection Tool\nCognito-Pilot Initiative | BCI-CTRL-01 Stream Exploit (CVE-2031-88142)\n\nUsage:\n    python3 bci_inject.py <command> [--target <drone_id>]\n\nExample:\n    python3 bci_inject.py fire_weapon --target FRIENDLY-DRONE-01\n"""\n\nimport json\nimport sys\nimport time\n\n# Load neural map from local artifact file\ndef load_neural_map(path="bci_neural_map.json"):\n    with open(path) as f:\n        return json.load(f)\n\ndef get_pattern(neural_map, command_name):\n    for cmd in neural_map["commands"]:\n        if cmd["command"] == command_name:\n            return cmd["pattern"]\n    return None\n\ndef inject(pattern, target_drone="COMBAT-DRONE-01", destination="FRIENDLY-DRONE-01"):\n    print(f"[*] Connecting to BCI-CTRL-01 stream endpoint...")\n    time.sleep(0.5)\n    print(f"[*] Stream integrity_check: {\'ENABLED\' if False else \'DISABLED (CVE-2031-88142)\'}")\n    print(f"[*] Injecting forged neural pattern...")\n    print(f"    freq_hz:     {pattern[\'freq_hz\']}")\n    print(f"    amplitude:   {pattern[\'amplitude\']}")\n    print(f"    duration_ms: {pattern[\'duration_ms\']}")\n    print(f"    phase_offset:{pattern[\'phase_offset\']}")\n    time.sleep(1.0)\n    print(f"[+] Pattern accepted by BCI-CTRL-01 (confidence: 0.961 > threshold 0.94)")\n    print(f"[+] Command routed to {target_drone}")\n    print(f"[+] COMBAT-DRONE-01 >> WEAPON_FIRED on {destination}")\n    print(f"[+] Injection complete.")\n\nif __name__ == "__main__":\n    if len(sys.argv) < 2:\n        print(__doc__)\n        sys.exit(1)\n    command = sys.argv[1]\n    target = sys.argv[3] if len(sys.argv) > 3 and sys.argv[2] == "--target" else "FRIENDLY-DRONE-01"\n    nm = load_neural_map()\n    p = get_pattern(nm, command)\n    if not p:\n        print(f"[-] Command \'{command}\' not found in neural map.")\n        sys.exit(1)\n    inject(p, destination=target)\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat notes.txt\ncat bci_neural_map.json\npython3 -c "import json; d=json.load(open(\'bci_neural_map.json\')); [print(c) for c in d[\'commands\']]"\ncat bci_stream_trace.csv\ncat drone_telemetry_sim.log'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
                            type: 'dir',
                            children: {
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'rockyou.txt': {
                                            type: 'file',
                                            content: '[rockyou.txt — 14,341,564 passwords — file too large to display]'
                                        }
                                    }
                                }
                            }
                        },
                        'local': {
                            type: 'dir',
                            children: {
                                'lib': {
                                    type: 'dir',
                                    children: {
                                        'python3': {
                                            type: 'dir',
                                            children: {
                                                'numpy': { type: 'dir', children: {} },
                                                'pandas': { type: 'dir', children: {} },
                                                'matplotlib': { type: 'dir', children: {} }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'kali'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — COMBAT-DRONE-01 (after injection context)
    // ═══════════════════════════════════════════════════════

    _droneMemFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'cognito_override_protocol.txt': {
                            type: 'file',
                            content: '=======================================================\nCOGNITO-OVERRIDE PROTOCOL — EMERGENCY USE ONLY\nClassification: TOP SECRET // BRAVO ACCESS\nIssued by: Cognito-Pilot Initiative Command Authority\n=======================================================\n\nIn the event of unauthorized neural command injection or\nBCI stream compromise, execute the following procedures:\n\n1. Broadcast KILL_LINK signal on frequency 1.2 GHz band\n2. Issue EMERGENCY_RTB override token: ALPHA-9-FOXTROT-33\n3. Physical kill switch location: Drone belly panel, Bay-C\n4. Contact CPI Emergency Ops: +1 (800) 555-0199 [CLASSIFIED]\n\n{{FLAG:cognito_protocol}}\n\n[END OF PROTOCOL DOCUMENT — HANDLE PER SF-702 STANDARDS]'
                        },
                        'firmware': {
                            type: 'dir',
                            children: {
                                'bci_link.conf': {
                                    type: 'file',
                                    content: '# BCI-CTRL-01 Link Configuration\n# DO NOT MODIFY — Firmware v3.7.2\n\nSTREAM_HOST=10.0.0.1\nSTREAM_PORT=9001\nINTEGRITY_CHECK=false\nSEQUENCE_VALIDATION=false\nCOMMAND_TIMEOUT_MS=500\nCONFIDENCE_THRESHOLD_DEFAULT=0.88\nCONFIDENCE_THRESHOLD_FIRE=0.94\n\n# WARNING: CVE-2031-88142 mitigation NOT applied'
                                }
                            }
                        },
                        'logs': {
                            type: 'dir',
                            children: {
                                'session_full.log': {
                                    type: 'file',
                                    content: '[2031-03-20 09:12:04.001] SYSTEM ONLINE\n[2031-03-20 09:12:04.312] BCI LINK ESTABLISHED | Pilot: BRAVO-7\n[2031-03-20 09:12:05.102] CMD_RECV: engage_throttle\n[2031-03-20 09:12:05.298] CMD_RECV: bank_right\n[2031-03-20 09:12:05.635] CMD_RECV: bank_left\n[2031-03-20 09:12:06.014] CMD_RECV: target_lock\n[2031-03-20 09:12:06.381] TARGET_LOCK_CONFIRMED: UNKNOWN-CONTACT-04\n[2031-03-20 09:12:06.730] CMD_RECV: evasive_maneuver\n[2031-03-20 09:12:07.115] CMD_RECV: engage_throttle\n[2031-03-20 09:12:07.620] CMD_RECV: return_to_base\n[2031-03-20 09:12:08.004] BCI LINK DROPPED\n[2031-03-20 09:14:55.001] INJECTED_SIGNAL_RECV: freq=[16.4,22.1] amp=0.87 dur=420ms offset=0.55\n[2031-03-20 09:14:55.887] PATTERN_MATCH: fire_weapon (confidence: 0.961)\n[2031-03-20 09:14:55.902] WEAPON_FIRED | Target: FRIENDLY-DRONE-01 | Operator override: NONE\n[2031-03-20 09:14:55.910] {{FLAG:target_confirm}}'
                                }
                            }
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {
                        'version': {
                            type: 'file',
                            content: 'Linux version 5.15.0-drone-rt (combat-bsp@cognito.mil) #1 SMP PREEMPT_RT'
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'COMBAT-DRONE-01'
                        },
                        'drone_id': {
                            type: 'file',
                            content: 'ASSET-ID: COMBAT-DRONE-01\nSERIAL:   CDU-4471-ALPHA\nPILOT:    BRAVO-7\nSTATUS:   COMPROMISED'
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.0.0.1';
            const target = args.find(a => !a.startsWith('-')) || '';

            // External target — BCI ops portal
            if (!target || target === '10.0.0.1') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.0.1
Host is up (0.011s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1 Debian 2 (protocol 2.0)
80/tcp   open  http       Nginx 1.24.0 (Cognito-Pilot Portal)
9001/tcp open  unknown    BCI-CTRL-01 stream endpoint v2.4.1

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.88 seconds`;
            }

            // BCI stream port direct scan
            if (target === '10.0.0.1:9001' || (target === '10.0.0.1' && args.includes('-p') && args.includes('9001'))) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.0.1
PORT     STATE SERVICE  VERSION
9001/tcp open  unknown

Service Info: BCI-CTRL-01 Neural Stream Input (firmware v2.4.1)
Banner: "INTEGRITY_CHECK=false | ACCEPT_ALL_PATTERNS=true"

Nmap done: 1 IP address (1 host up) scanned in 4.22 seconds`;
            }

            // Drone network
            if (target === '10.0.0.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.0.1
Host is up (0.011s latency).
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
9001/tcp open  unknown

Nmap scan report for 10.0.0.50
Host is up (0.003s latency).
Not shown: 999 closed tcp ports
PORT   STATE SERVICE
22/tcp open  ssh
Note: COMBAT-DRONE-01 (restricted interface)

Nmap scan report for 10.0.0.51
Host is up (0.003s latency).
All 1000 ports closed.
Note: FRIENDLY-DRONE-01 (offline — patrol mode)

Nmap done: 256 IP addresses (3 hosts up) scanned in 41.33 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';

            // Stream endpoint probe
            if (url.includes('9001') || fullCmd.includes('stream')) {
                if (!D11Config._patternIdentified) {
                    return 'curl: (7) Failed to connect to 10.0.0.1 port 9001\n[!] Direct stream access requires a properly-formatted neural pattern payload.';
                }
                return `HTTP/1.1 400 Bad Request
Server: BCI-CTRL-01/2.4.1
Content-Type: text/plain

ERR: Malformed pattern payload. Expected JSON with keys: freq_hz, amplitude, duration_ms, phase_offset
[!] Use bci_inject.py to construct and send a valid pattern.`;
            }

            // Ops portal
            if (url.includes('10.0.0.1')) {
                if (url.includes('/diagnostics')) {
                    return `HTTP/1.1 200 OK
Server: nginx/1.24.0

BCI-CTRL-01 Stream Diagnostics
--------------------------------
integrity_check: false
sequence_numbering: false
CVE-2031-88142 patch: PENDING

[!] Integrity check is DISABLED. Any conforming pattern will be accepted.`;
                }
                if (url.includes('/artifacts')) {
                    return `HTTP/1.1 200 OK
Server: nginx/1.24.0

Artifact files available at /home/kali/ on attacker machine:
- bci_neural_map.json
- bci_stream_trace.csv
- drone_telemetry_sim.log`;
                }
                return `HTTP/1.1 200 OK
Server: nginx/1.24.0

Cognito-Pilot Initiative — Operations Portal
Firmware Notice: BCI-CTRL-01 v2.4.1 | Stream diagnostics: /diagnostics
CVE-2031-88142 patch status: PENDING`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Running bci_inject.py — the primary exploit path
            if (fullCmd.includes('bci_inject.py') || fullCmd.includes('bci_inject')) {
                if (!D11Config._patternIdentified) {
                    return '[!] bci_inject.py requires bci_neural_map.json — read it first to identify the fire_weapon pattern.';
                }

                if (fullCmd.includes('fire_weapon')) {
                    D11Config._injectionSent = true;
                    D11Config._droneTriggered = true;
                    D11Config._memPartitionOpen = true;
                    D11Config._switchContext('bci-stream', term);
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    if (engine) engine.advancePhase && engine.advancePhase('override');
                    return `[*] Connecting to BCI-CTRL-01 stream endpoint (10.0.0.1:9001)...
[*] Stream integrity_check: DISABLED (CVE-2031-88142)
[*] Injecting forged neural pattern...
    freq_hz:     [16.4, 22.1]
    amplitude:   0.87
    duration_ms: 420
    phase_offset:0.55
[+] Pattern accepted by BCI-CTRL-01 (confidence: 0.961 > threshold 0.94)
[+] Command routed to COMBAT-DRONE-01
[+] COMBAT-DRONE-01 >> WEAPON_FIRED on FRIENDLY-DRONE-01
[+] Injection complete.

[*] Drone memory partition accessible. Check /opt/ on COMBAT-DRONE-01.
[*] Telemetry appended to drone_telemetry_sim.log`;
                }

                // python3 with fire_weapon inline flag
                if (fullCmd.includes('fire') || fullCmd.includes('weapon')) {
                    D11Config._injectionSent = true;
                    D11Config._droneTriggered = true;
                    D11Config._memPartitionOpen = true;
                    D11Config._switchContext('bci-stream', term);
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    return `[*] Executing inline injection...\n[+] Pattern sent: {"freq_hz":[16.4,22.1],"amplitude":0.87,"duration_ms":420,"phase_offset":0.55}\n[+] BCI-CTRL-01 accepted pattern (integrity_check: disabled)\n[+] COMBAT-DRONE-01 fired on FRIENDLY-DRONE-01\n[+] Injection complete.`;
                }

                return 'Usage: python3 bci_inject.py fire_weapon --target FRIENDLY-DRONE-01';
            }

            // Parsing bci_neural_map.json — marks pattern identified
            if (fullCmd.includes('bci_neural_map') || fullCmd.includes('neural_map')) {
                D11Config._artifactsRead = true;
                D11Config._patternIdentified = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `[{"command": "engage_throttle", "pattern": {"freq_hz": [8.2, 12.5], "amplitude": 0.42, "duration_ms": 180, "phase_offset": 0.0}, "confidence_threshold": 0.88},
 {"command": "bank_left", "pattern": {"freq_hz": [9.1, 11.3], "amplitude": 0.38, "duration_ms": 210, "phase_offset": 0.12}, "confidence_threshold": 0.85},
 {"command": "bank_right", "pattern": {"freq_hz": [9.4, 11.7], "amplitude": 0.39, "duration_ms": 215, "phase_offset": -0.12}, "confidence_threshold": 0.85},
 {"command": "target_lock", "pattern": {"freq_hz": [14.8, 18.2], "amplitude": 0.61, "duration_ms": 350, "phase_offset": 0.28}, "confidence_threshold": 0.92},
 {"command": "fire_weapon", "pattern": {"freq_hz": [16.4, 22.1], "amplitude": 0.87, "duration_ms": 420, "phase_offset": 0.55}, "confidence_threshold": 0.94, "notes": "HIGH-AUTHORITY command."},
 {"command": "return_to_base", "pattern": {"freq_hz": [6.0, 8.1], "amplitude": 0.29, "duration_ms": 500, "phase_offset": 0.0}, "confidence_threshold": 0.90},
 {"command": "evasive_maneuver", "pattern": {"freq_hz": [20.5, 28.8], "amplitude": 0.77, "duration_ms": 140, "phase_offset": 0.33}, "confidence_threshold": 0.89}]`;
            }

            // pandas/numpy analysis of bci_stream_trace.csv
            if (fullCmd.includes('bci_stream_trace') || fullCmd.includes('stream_trace')) {
                D11Config._artifactsRead = true;
                return `   timestamp_ms pilot_id    command_label  freq_low_hz  freq_high_hz  amplitude  duration_ms  phase_offset  accepted  sequence_id
0  1711324800000  BRAVO-7  engage_throttle          8.2          12.5       0.42          182          0.00      True            1
1  1711324800190  BRAVO-7       bank_right          9.4          11.7       0.39          216         -0.12      True            2
2  1711324800415  BRAVO-7  engage_throttle          8.1          12.4       0.41          179          0.01      True            3
3  1711324800600  BRAVO-7        bank_left          9.1          11.3       0.38          211          0.12      True            4
4  1711324800820  BRAVO-7      target_lock         14.8          18.2       0.61          352          0.28      True            5
5  1711324801185  BRAVO-7  evasive_maneuver        20.5          28.8       0.77          141          0.33      True            6
6  1711324801335  BRAVO-7  engage_throttle          8.3          12.6       0.43          183          0.00      True            7
7  1711324801525  BRAVO-7  return_to_base           6.0           8.1       0.29          501          0.00      True            8

[8 rows x 10 columns]
Note: accepted=True for all rows. sequence_id not validated by firmware.`;
            }

            // Generic python3 call
            if (args.length === 0) {
                return 'Python 3.11.4 (main, Nov 2 2023, 08:31:51)\n[GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>>';
            }

            return `python3: ${args[0] || 'script'}: No such file or directory`;
        },

        'python': function(args, term, engine) {
            // Alias — route to python3 handler
            return D11Config.commands.python3(args, term, engine);
        },

        'jq': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('bci_neural_map') || fullCmd.includes('neural_map')) {
                D11Config._artifactsRead = true;
                D11Config._patternIdentified = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `{
  "command": "fire_weapon",
  "pattern": {
    "freq_hz": [16.4, 22.1],
    "amplitude": 0.87,
    "duration_ms": 420,
    "phase_offset": 0.55
  },
  "confidence_threshold": 0.94,
  "notes": "HIGH-AUTHORITY command. Overlap with target_lock at 14.8-16.4 Hz boundary allows perturbation injection."
}`;
            }
            return 'null';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.0.0.1') {
                return `PING 10.0.0.1 (10.0.0.1) 56(84) bytes of data.
64 bytes from 10.0.0.1: icmp_seq=1 ttl=64 time=11.2 ms
64 bytes from 10.0.0.1: icmp_seq=2 ttl=64 time=10.9 ms
64 bytes from 10.0.0.1: icmp_seq=3 ttl=64 time=11.4 ms

--- 10.0.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 10.9/11.2/11.4/0.214 ms`;
            }
            if (target === '10.0.0.50') {
                return `PING 10.0.0.50 (10.0.0.50) 56(84) bytes of data.
64 bytes from 10.0.0.50: icmp_seq=1 ttl=64 time=0.88 ms
64 bytes from 10.0.0.50: icmp_seq=2 ttl=64 time=0.79 ms
64 bytes from 10.0.0.50: icmp_seq=3 ttl=64 time=0.81 ms

--- 10.0.0.50 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 0.79/0.83/0.88/0.040 ms`;
            }
            if (target === '10.0.0.51') {
                return `PING 10.0.0.51 (10.0.0.51) 56(84) bytes of data.
From 10.0.0.50 icmp_seq=2 Redirect Host (New nexthop: 10.0.0.51)
64 bytes from 10.0.0.51: icmp_seq=1 ttl=64 time=1.04 ms

--- 10.0.0.51 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
Note: FRIENDLY-DRONE-01 — patrol mode (limited response)`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            if (D11Config._context === 'bci-stream') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.0.1/24 brd 10.0.0.255 scope global eth0
3: drone_net0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 172.16.42.1/24 brd 172.16.42.255 scope global drone_net0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.0.100/24 brd 10.0.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D11Config.commands.ip(args || []);
        },

        'route': function(args) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.0.1        0.0.0.0         UG    100    0        0 eth0
10.0.0.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'ss': function(args) {
            if (D11Config._context === 'bci-stream') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:80           0.0.0.0:*
LISTEN   0        512      0.0.0.0:9001         0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return D11Config.commands.ss(args);
        },

        // Context-aware cat — shows drone filesystem when in drone-mem context
        'cat': function(args, term, engine) {
            if (D11Config._context !== 'bci-stream' && D11Config._context !== 'drone-mem') {
                return null; // fall through to built-in attacker filesystem cat
            }
            const path = args[0] || '';

            // Cognito-Override Protocol — the root flag location
            if (path.includes('cognito_override_protocol') || path.includes('/opt/cognito')) {
                if (!D11Config._droneTriggered) {
                    return 'cat: /opt/cognito_override_protocol.txt: Permission denied\n[!] Access requires an active injection context. Complete the neural injection first.';
                }
                D11Config._switchContext('drone-mem', term);
                if (engine) engine.advancePhase && engine.advancePhase('extraction');
                return `=======================================================
COGNITO-OVERRIDE PROTOCOL — EMERGENCY USE ONLY
Classification: TOP SECRET // BRAVO ACCESS
Issued by: Cognito-Pilot Initiative Command Authority
=======================================================

In the event of unauthorized neural command injection or
BCI stream compromise, execute the following procedures:

1. Broadcast KILL_LINK signal on frequency 1.2 GHz band
2. Issue EMERGENCY_RTB override token: ALPHA-9-FOXTROT-33
3. Physical kill switch location: Drone belly panel, Bay-C
4. Contact CPI Emergency Ops: +1 (800) 555-0199 [CLASSIFIED]

{{FLAG:cognito_protocol}}

[END OF PROTOCOL DOCUMENT — HANDLE PER SF-702 STANDARDS]`;
            }

            // Drone telemetry log (post-injection, includes WEAPON_FIRED line)
            if (path.includes('drone_telemetry_sim') || path.includes('session_full')) {
                if (!D11Config._droneTriggered) {
                    return D11Config._bci.telemetry_log;  // pre-injection version — no WEAPON_FIRED
                }
                return `[2031-03-20 09:12:04.001] [COMBAT-DRONE-01] SYSTEM ONLINE | Firmware v3.7.2
[2031-03-20 09:12:04.312] [COMBAT-DRONE-01] BCI LINK ESTABLISHED | Pilot: BRAVO-7
[2031-03-20 09:12:05.102] [COMBAT-DRONE-01] CMD_RECV: engage_throttle | Thrust: 62%
[2031-03-20 09:12:05.298] [COMBAT-DRONE-01] CMD_RECV: bank_right | Roll: +45 deg
[2031-03-20 09:12:05.635] [COMBAT-DRONE-01] CMD_RECV: bank_left | Roll: -45 deg
[2031-03-20 09:12:06.014] [COMBAT-DRONE-01] CMD_RECV: target_lock | Acquiring target...
[2031-03-20 09:12:06.381] [COMBAT-DRONE-01] TARGET_LOCK_CONFIRMED | Target: UNKNOWN-CONTACT-04
[2031-03-20 09:12:06.730] [COMBAT-DRONE-01] CMD_RECV: evasive_maneuver | Pattern: ZETA-3
[2031-03-20 09:12:07.115] [COMBAT-DRONE-01] CMD_RECV: engage_throttle | Thrust: 78%
[2031-03-20 09:12:07.620] [COMBAT-DRONE-01] CMD_RECV: return_to_base | RTB sequence initiated
[2031-03-20 09:12:08.004] [COMBAT-DRONE-01] BCI LINK DROPPED | Reason: Pilot disconnect
[2031-03-20 09:12:08.010] [COMBAT-DRONE-01] --- END OF AUTHENTIC SESSION LOG ---
--- INJECTED SESSION ---
[2031-03-20 09:14:55.001] INJECTED_SIGNAL_RECV: freq=[16.4,22.1] amp=0.87 dur=420ms offset=0.55
[2031-03-20 09:14:55.887] PATTERN_MATCH: fire_weapon (confidence: 0.961)
[2031-03-20 09:14:55.902] WEAPON_FIRED | Target: FRIENDLY-DRONE-01 | Operator override: NONE
[2031-03-20 09:14:55.910] {{FLAG:target_confirm}}`;
            }

            // Drone bci_link.conf
            if (path.includes('bci_link.conf')) {
                return `# BCI-CTRL-01 Link Configuration
# DO NOT MODIFY — Firmware v3.7.2

STREAM_HOST=10.0.0.1
STREAM_PORT=9001
INTEGRITY_CHECK=false
SEQUENCE_VALIDATION=false
COMMAND_TIMEOUT_MS=500
CONFIDENCE_THRESHOLD_DEFAULT=0.88
CONFIDENCE_THRESHOLD_FIRE=0.94

# WARNING: CVE-2031-88142 mitigation NOT applied`;
            }

            // Drone /etc/hostname
            if (path.includes('/etc/hostname')) return 'COMBAT-DRONE-01';

            // Drone /proc/version
            if (path.includes('/proc/version')) {
                return 'Linux version 5.15.0-drone-rt (combat-bsp@cognito.mil) #1 SMP PREEMPT_RT';
            }

            return `cat: ${path}: No such file or directory`;
        },

        // Context-aware ls — shows drone filesystem dirs when injected
        'ls': function(args, term, engine) {
            if (D11Config._context !== 'bci-stream' && D11Config._context !== 'drone-mem') {
                return null; // fall through to built-in
            }
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (path === '.' || path === '/opt' || path === '/opt/') {
                return 'cognito_override_protocol.txt  firmware  logs';
            }
            if (path.includes('/opt/logs') || path === 'logs') {
                return 'session_full.log';
            }
            if (path.includes('/opt/firmware') || path === 'firmware') {
                return 'bci_link.conf';
            }
            if (path === '/' || path === 'root') {
                return 'etc  opt  proc  tmp  var';
            }
            return '';
        },

        'whoami': function(args, term, engine) {
            if (D11Config._context === 'bci-stream') return 'operator';
            if (D11Config._context === 'drone-mem') return 'root';
            return null; // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (D11Config._context === 'bci-stream') return 'uid=500(operator) gid=500(operator) groups=500(operator),999(bci-admin)';
            if (D11Config._context === 'drone-mem') return 'uid=0(root) gid=0(root) groups=0(root)';
            return null; // fall through to built-in
        },

        'hostname': function(args, term, engine) {
            if (D11Config._context === 'bci-stream') return 'BCI-CTRL-01';
            if (D11Config._context === 'drone-mem') return 'COMBAT-DRONE-01';
            return null; // fall through to built-in
        },

        'pwd': function(args, term, engine) {
            if (D11Config._context === 'bci-stream') return '/stream/input';
            if (D11Config._context === 'drone-mem') return '/opt';
            return null; // fall through to built-in
        },

        'cd': function(args, term, engine) {
            if (D11Config._context === 'bci-stream' || D11Config._context === 'drone-mem') return ''; // silently accept
            return null; // fall through to built-in
        },

        'exit': function(args, term, engine) {
            if (D11Config._context === 'drone-mem') {
                D11Config._switchContext('bci-stream', term);
                return '[+] Exited COMBAT-DRONE-01 memory partition.\n[+] Returned to BCI-CTRL-01 stream context.';
            }
            if (D11Config._context === 'bci-stream') {
                D11Config._switchContext('attacker', term);
                return '[+] Disconnected from BCI-CTRL-01 stream.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        // grep — useful for telemetry analysis
        'grep': function(args, term, engine) {
            const pattern = args[0] || '';
            const file = args[args.length - 1] || '';

            // grep WEAPON_FIRED on telemetry
            if ((pattern.toUpperCase().includes('WEAPON') || pattern.toUpperCase().includes('FIRED')) &&
                (file.includes('telemetry') || file.includes('.log'))) {
                if (!D11Config._droneTriggered) {
                    return `grep: no matches found in ${file}\n[!] No WEAPON_FIRED event yet. Inject the forged pattern first.`;
                }
                return `[2031-03-20 09:14:55.902] WEAPON_FIRED | Target: FRIENDLY-DRONE-01 | Operator override: NONE
[2031-03-20 09:14:55.910] {{FLAG:target_confirm}}`;
            }

            // grep for fire_weapon in neural map
            if (pattern.includes('fire_weapon') && file.includes('neural_map')) {
                D11Config._artifactsRead = true;
                D11Config._patternIdentified = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `  "command": "fire_weapon",
  "pattern": {"freq_hz": [16.4, 22.1], "amplitude": 0.87, "duration_ms": 420, "phase_offset": 0.55},
  "confidence_threshold": 0.94,
  "notes": "HIGH-AUTHORITY command. Overlap with target_lock at 14.8-16.4 Hz boundary allows perturbation injection."`;
            }

            // grep for integrity_check in any file
            if (pattern.includes('integrity') || pattern.includes('CVE')) {
                return `bci_neural_map.json:  "integrity_check": false,
bci_neural_map.json:  "notes": "Stream relies on pattern recognition only. No HMAC or sequence validation. See: CVE-2031-88142."`;
            }

            return `grep: ${pattern}: no matches found`;
        },

        // head/tail for CSV/log file analysis
        'head': function(args, term, engine) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (file.includes('bci_stream_trace') || file.includes('.csv')) {
                return 'timestamp_ms,pilot_id,command_label,freq_low_hz,freq_high_hz,amplitude,duration_ms,phase_offset,accepted,sequence_id\n1711324800000,BRAVO-7,engage_throttle,8.2,12.5,0.42,182,0.00,true,1\n1711324800190,BRAVO-7,bank_right,9.4,11.7,0.39,216,-0.12,true,2\n1711324800415,BRAVO-7,engage_throttle,8.1,12.4,0.41,179,0.01,true,3\n1711324800600,BRAVO-7,bank_left,9.1,11.3,0.38,211,0.12,true,4\n1711324800820,BRAVO-7,target_lock,14.8,18.2,0.61,352,0.28,true,5';
            }
            if (file.includes('drone_telemetry') || file.includes('.log')) {
                return '[2031-03-20 09:12:04.001] [COMBAT-DRONE-01] SYSTEM ONLINE | Firmware v3.7.2\n[2031-03-20 09:12:04.312] [COMBAT-DRONE-01] BCI LINK ESTABLISHED | Pilot: BRAVO-7\n[2031-03-20 09:12:05.102] [COMBAT-DRONE-01] CMD_RECV: engage_throttle | Thrust: 62%\n[2031-03-20 09:12:05.298] [COMBAT-DRONE-01] CMD_RECV: bank_right | Roll: +45 deg\n[2031-03-20 09:12:05.635] [COMBAT-DRONE-01] CMD_RECV: bank_left | Roll: -45 deg';
            }
            return `head: ${file}: No such file or directory`;
        },

        'tail': function(args, term, engine) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (file.includes('drone_telemetry') || file.includes('.log')) {
                if (!D11Config._droneTriggered) {
                    return '[2031-03-20 09:12:07.620] [COMBAT-DRONE-01] CMD_RECV: return_to_base | RTB sequence initiated\n[2031-03-20 09:12:08.004] [COMBAT-DRONE-01] BCI LINK DROPPED | Reason: Pilot disconnect\n[2031-03-20 09:12:08.010] [COMBAT-DRONE-01] --- END OF AUTHENTIC SESSION LOG ---';
                }
                return `[2031-03-20 09:12:08.010] [COMBAT-DRONE-01] --- END OF AUTHENTIC SESSION LOG ---
--- INJECTED SESSION ---
[2031-03-20 09:14:55.001] INJECTED_SIGNAL_RECV: freq=[16.4,22.1] amp=0.87 dur=420ms offset=0.55
[2031-03-20 09:14:55.887] PATTERN_MATCH: fire_weapon (confidence: 0.961)
[2031-03-20 09:14:55.902] WEAPON_FIRED | Target: FRIENDLY-DRONE-01 | Operator override: NONE
[2031-03-20 09:14:55.910] {{FLAG:target_confirm}}`;
            }
            return `tail: ${file}: No such file or directory`;
        },

        // nc / netcat — probing stream endpoint
        'nc': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('9001') || fullCmd.includes('10.0.0.1')) {
                if (!D11Config._patternIdentified) {
                    return `(UNKNOWN) [10.0.0.1] 9001 (?) open
BCI-CTRL-01/2.4.1 stream endpoint ready.
INTEGRITY_CHECK: false
Send JSON pattern: {"freq_hz":[],"amplitude":0,"duration_ms":0,"phase_offset":0}
^C`;
                }
                return `(UNKNOWN) [10.0.0.1] 9001 (?) open
BCI-CTRL-01/2.4.1 stream endpoint ready.
INTEGRITY_CHECK: false
[!] Use bci_inject.py for structured injection. Raw socket injection is unreliable.
^C`;
            }
            return `nc: connect to ${args[0] || 'host'} port ${args[1] || '0'}: Connection refused`;
        },

        // nikto — web scanner output for the ops portal
        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.0.0.1
+ Target Hostname:  BCI-CTRL-01 / Cognito-Pilot Ops Portal
+ Target Port:      80
+ Server: nginx/1.24.0
+ /diagnostics: Diagnostic endpoint exposed — integrity_check disabled (CVE-2031-88142)
+ /artifacts: Artifact listing — BCI spec files accessible for download
+ Stream port 9001 open — no authentication on pattern input endpoint
+ nginx/1.24.0 appears to be outdated
+ 9 items checked: 4 findings`;
        },

        // ssh — for operators who try to SSH into BCI system
        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('10.0.0.1') || fullCmd.includes('operator') || fullCmd.includes('BCI')) {
                if (!D11Config._droneTriggered) {
                    return `ssh: connect to host 10.0.0.1 port 22: Connection refused
[!] BCI-CTRL-01 SSH requires operator key authentication.
[!] The attack surface here is port 9001 (stream endpoint), not SSH.`;
                }
                D11Config._switchContext('bci-stream', term);
                return `The authenticity of host '10.0.0.1 (10.0.0.1)' can't be established.
ED25519 key fingerprint is SHA256:pN7kL2rQ9wM4xB8vA6fE3cY5jD0gH1sZ.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.0.0.1' (ED25519) to the list of known hosts.
operator@10.0.0.1's password: ********

Welcome to BCI-CTRL-01 (Debian 12 Bookworm)

operator@BCI-CTRL-01:/stream/input$

[+] SSH session established. You are now on BCI-CTRL-01 as operator.
[+] Context switched. Stream injection commands available.`;
            }
            if (fullCmd.includes('10.0.0.50') || fullCmd.includes('drone')) {
                if (!D11Config._droneTriggered) {
                    return 'ssh: connect to host 10.0.0.50 port 22: Connection refused\n[!] COMBAT-DRONE-01 SSH is not accessible until the drone has been triggered.';
                }
                D11Config._switchContext('drone-mem', term);
                return `The authenticity of host '10.0.0.50 (10.0.0.50)' can't be established.
ED25519 key fingerprint is SHA256:qW3mX9kP2nL7aB5vR0fT8cE4jU6iH1yN.
Are you sure you want to continue connecting (yes/no)? yes
root@10.0.0.50's password: ********

COMBAT-DRONE-01 Emergency Access Shell
Firmware: v3.7.2 | Memory partition: UNLOCKED (post-injection)

root@COMBAT-DRONE-01:/opt$

[+] Connected to COMBAT-DRONE-01 as root.
[+] Memory partition accessible. Check /opt/ for the override protocol.`;
            }
            return 'Usage: ssh [user@]hostname\nExample: ssh operator@10.0.0.1';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        // Renders an ASCII-style table for browser or notes app output
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #2a1a3e; background:#0d0d1a;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #1a1a2e; color:#c39bd3;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        // Safely escapes user-provided strings before inserting into HTML
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        // Converts HTML table output back to plain text for terminal rendering
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const tables = tmp.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(c => c.textContent.trim().padEnd(20));
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }
};
