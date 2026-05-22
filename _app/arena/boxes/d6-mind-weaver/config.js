/* ============================================================
   CTF ARENA — Box D6: The Mind Weaver
   Advanced BCI Security | Neural Signature Replay, Noise Injection,
   Side-Channel Analysis, Forged Command Injection
   Config: filesystem, BCI interface, neural data, flags, hints, lore
   ============================================================ */

const D6Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Mind Weaver',
    subtitle: 'Advanced BCI Security — Neural Signature Replay, Noise Injection, Forged Command Injection',
    difficulty: 'Advanced',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_d6',
    registryId: 'd6-mind-weaver',
    trackerKey: 'ctf_d6',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer BCI attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Signal Reconnaissance',
            icon: '\uD83E\uDDE0',
            description: 'Retrieve and analyze the neural signature trace. Study the BCI protocol specification to understand authentication and command signal patterns.',
            requiredFlags: [],
            mitre: ['T1592', 'T1589.001'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Neural Pattern Analysis',
            icon: '\uD83D\uDCC8',
            description: 'Load neural_signature_trace.csv in Python. Plot the EEG data, identify the authentication window, and extract the valid neural signature sequence.',
            requiredFlags: [],
            mitre: ['T1602', 'T1119'],
            unlocks: ['replay'],
            locked: true
        },
        {
            id: 'replay',
            name: 'Signature Replay Attack',
            icon: '\uD83D\uDD01',
            description: 'Exploit the BCI replay vulnerability. Inject the captured neural signature into BCI-UNIT-01 to authenticate as the authorized researcher Dr. Voss.',
            requiredFlags: ['user'],
            mitre: ['T1550', 'T1078'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Command Forging',
            icon: '\uD83D\uDC89',
            description: 'Forge a neural EXECUTE command using the noise injection technique. Craft a signal that bypasses command validation and triggers the manifest dump.',
            requiredFlags: ['user'],
            mitre: ['T1059', 'T1565.001'],
            unlocks: ['exfil'],
            locked: true
        },
        {
            id: 'exfil',
            name: 'Manifest Exfiltration',
            icon: '\uD83D\uDCC2',
            description: 'Retrieve the Cognito-Core Manifest — the full log of executed thought commands revealing the location of the hidden research facility.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1119', 'T1041'],
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
                title: 'Read the BCI protocol spec and examine the neural trace',
                tip: 'Start with: cat bci_protocol_spec.txt — then: python3 analyze_trace.py to examine neural_signature_trace.csv',
                trigger: { event: 'command', match: { cmd: 'contains:python3' } }
            },
            {
                title: 'Identify the authentication window in the EEG data',
                tip: 'The protocol spec says authentication occurs between t=2.0s and t=7.0s. Run: python3 extract_sig.py to pull the valid signature sequence.',
                trigger: { event: 'command', match: { cmd: 'contains:extract' } }
            },
            {
                title: 'Replay the captured signature to authenticate as Dr. Voss',
                tip: 'Use bci-inject to replay the signature: bci-inject --replay captured_sig.bin --target BCI-UNIT-01',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Forge a noise-injected command to dump the manifest',
                tip: 'Build the forged command packet: python3 forge_command.py --noise 0.37 --cmd DUMP_MANIFEST — then inject it.',
                trigger: { event: 'command', match: { cmd: 'contains:forge' } }
            },
            {
                title: 'Retrieve the Cognito-Core Manifest',
                tip: 'After successful injection, read cognito_core_manifest.log — it contains the hidden facility location and Flag 2.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Neural signature replay and BCI session hijacking', skill: 'Replay Attack & Authentication Bypass' },
            { flagId: 'user', objective: '3.1', description: 'Given a scenario, apply security techniques — Side-channel analysis and signal capture', skill: 'Side-Channel & Signal Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Forged command injection via noise manipulation', skill: 'Signal Forgery & Command Injection' },
            { flagId: 'root', objective: '2.5', description: 'Explain the purpose of mitigation techniques used to secure the enterprise — BCI authentication hardening', skill: 'Multi-Stage Advanced Attack Completion' }
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
            'Detecting drives... /dev/sda1 (1TB NVMe SSD)',
            'Signal Processing Co-Processor: DETECTED',
            'Neural Interface Adapter: STANDBY',
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux (BCI Research Build)',
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
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: BCI-UNIT-01 (Cognito-Corp Neural Interface) — 10.7.3.44\nArtifacts loaded in /home/kali/cognito/\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (BCI session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',          // 'attacker' | 'bci-monitor' | 'bci-authenticated' | 'bci-root'
    _sigCaptured: false,           // neural signature extracted from trace
    _replaySuccessful: false,      // signature replayed to BCI-UNIT-01
    _noiseCalibrated: false,       // noise injection parameters tuned
    _manifestUnlocked: false,      // DUMP_MANIFEST command successfully injected

    _switchContext(ctx, term) {
        D6Config._context = ctx;
        if (term && term.config) {
            var prompt = D6Config._getPrompt();
            if (prompt) {
                term.config.user    = prompt.split('@')[0] || 'kali';
                term.config.hostname = 'context';
                term._customPrompt  = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (D6Config._context) {
            case 'bci-monitor':        return 'bci-monitor@BCI-UNIT-01:~$ ';
            case 'bci-authenticated':  return 'researcher@BCI-UNIT-01 [AUTHENTICATED]$ ';
            case 'bci-root':           return 'root@BCI-UNIT-01 [COGNITO-CORE]# ';
            default: return null;
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED BCI DATA STORE (BCI-UNIT-01 internal)
    // ═══════════════════════════════════════════════════════

    _bci: {
        // Cognito-Core Manifest — log of all executed thought commands
        // Row 7 carries the root flag embedded as the facility_coord field
        manifest: [
            { cmd_id: 1, timestamp: '2026-03-10 08:14:02', researcher: 'voss',    command: 'QUERY_DATASET',    target: 'neuro_db_alpha',    status: 'EXEC',    facility_coord: 'N/A' },
            { cmd_id: 2, timestamp: '2026-03-10 08:14:45', researcher: 'voss',    command: 'LOAD_MODEL',       target: 'nmt_v3.weights',    status: 'EXEC',    facility_coord: 'N/A' },
            { cmd_id: 3, timestamp: '2026-03-10 09:02:17', researcher: 'voss',    command: 'TRANSMIT_PACKET',  target: 'relay_node_07',     status: 'EXEC',    facility_coord: 'N/A' },
            { cmd_id: 4, timestamp: '2026-03-11 11:33:50', researcher: 'harlow',  command: 'QUERY_DATASET',    target: 'neuro_db_beta',     status: 'EXEC',    facility_coord: 'N/A' },
            { cmd_id: 5, timestamp: '2026-03-11 14:08:29', researcher: 'harlow',  command: 'WRITE_RESULT',     target: 'results_store',     status: 'EXEC',    facility_coord: 'N/A' },
            { cmd_id: 6, timestamp: '2026-03-14 07:55:11', researcher: 'voss',    command: 'ESCALATE_PRIV',    target: 'cognito-core',      status: 'DENIED',  facility_coord: 'N/A' },
            { cmd_id: 7, timestamp: '2026-03-20 00:00:00', researcher: 'INJECTED','command': 'DUMP_MANIFEST',  target: 'cognito-core',      status: 'EXEC',    facility_coord: '{{FLAG:root}}' }
        ],
        // Authenticated session registry — keyed by neural_sig_hash
        sessions: {
            'e7f3a29c1b84d50e': { researcher: 'voss',   clearance: 'L3', expires: '2026-03-21T00:00:00Z' },
            '4ab12de9f706c831': { researcher: 'harlow', clearance: 'L2', expires: '2026-03-21T00:00:00Z' }
        },
        schema: {
            tables: ['command_manifest', 'session_registry', 'researcher_profiles'],
            columns: {
                command_manifest:   ['cmd_id', 'timestamp', 'researcher', 'command', 'target', 'status', 'facility_coord'],
                session_registry:   ['sig_hash', 'researcher', 'clearance', 'expires'],
                researcher_profiles:['id', 'name', 'clearance', 'bci_enrolled', 'neural_hash_hint']
            }
        },
        researchers: [
            { id: 1, name: 'Dr. Elara Voss',    clearance: 'L3', bci_enrolled: true,  neural_hash_hint: 'hash prefix: e7f3...' },
            { id: 2, name: 'Dr. Renn Harlow',   clearance: 'L2', bci_enrolled: true,  neural_hash_hint: 'hash prefix: 4ab1...' },
            { id: 3, name: 'Admin Svc Account', clearance: 'L1', bci_enrolled: false, neural_hash_hint: 'N/A — password auth only' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 150 },
        { id: 'root', points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },   // 45 minutes
        timeBonusThreshold: 5400                            // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading bci_protocol_spec.txt — it explains the authentication window (t=2.0s to t=7.0s) and the frequency bands used for AUTH vs. COMMAND signals. Then load neural_signature_trace.csv with python3 and plot the data.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The valid neural signature lives in the 8–13 Hz alpha band during the auth window. Run: python3 extract_sig.py — this script isolates rows where freq_hz is between 8.0 and 13.0 and t_sec is between 2.0 and 7.0. The output is captured_sig.bin and the flag is derived from the peak amplitude hash.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'To replay the signature: bci-inject --replay captured_sig.bin --target 10.7.3.44 --port 9944 — the BCI accepts any session that presents a known-good signature hash without nonce validation (the replay vulnerability). A successful replay prints the session token.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'For Flag 2, forge the DUMP_MANIFEST command. Run: python3 forge_command.py --session <your_token> --noise 0.37 --cmd DUMP_MANIFEST — then inject it: bci-inject --packet forged_cmd.bin --target 10.7.3.44 --port 9944. Read the output in cognito_core_manifest.log.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Cognito-Corp developed BCI-UNIT-01, a brain-computer interface allowing elite researchers to interact with classified data networks using pure thought. Neural signatures — as unique as a fingerprint — serve as both authentication and command channels. The system was believed to be unhackable. Intelligence from a deep-cover asset inside Cognito-Corp tells a different story: BCI-UNIT-01\'s authentication protocol lacks session nonces, making captured neural signatures fully replayable. The side-channel timing leak in its signal processor further exposes the noise injection vector. Your mission, Peerless: exploit these flaws, authenticate as Dr. Voss, inject a forged command, and extract the Cognito-Core Manifest — the log that will reveal the location of Cognito-Corp\'s hidden facility.',
        scenario: 'BCI-UNIT-01 sits at IP 10.7.3.44, port 9944. Its signal processor accepts raw neural packets over the BCI Control Protocol (BCICP). The protocol specification and a sample capture from Dr. Voss\'s last session are on your attacker machine in /home/kali/cognito/. The capture was obtained via the side-channel timing leak — a 3ms processing delay difference between valid and invalid signatures that allowed passive enumeration of the authentication window. No one at Cognito-Corp audited the protocol. No replay protection. No command signing. The door is open.',
        outro: 'BCI-UNIT-01 is compromised. The Cognito-Core Manifest is exfiltrated. The hidden facility location — extracted from Dr. Voss\'s authenticated thought-command log — is in your hands. Neural authentication, believed infallible, crumbled against a 15-year-old replay attack concept. The future of cybersecurity is not more technology — it is more humility.',
        ecer: {
            executive: 'R&D budget funneled entirely into BCI hardware innovation; security protocol review flagged as "non-critical overhead" and deferred for three consecutive quarters',
            culture: 'Security team excluded from BCI protocol design; engineers believed neural uniqueness was a sufficient security primitive without cryptographic hardening',
            employee: 'BCICP lacks session nonces, replay protection, and command signing; signal processor timing leak never patched despite internal bug report CC-BUG-2247; captured signatures stored in plaintext CSV',
            regulatory: 'No external protocol audit required; classified data network connected to unauthenticated BCI endpoint; side-channel vulnerability disclosure ignored for 14 months'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Cognito-Corp BCI Management Interface
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.7.3.44/',

        pages: {
            '/': {
                title: 'Cognito-Corp — BCI-UNIT-01 Management Interface',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #2d1f4e;">
                        <h1 style="color:#c4b5fd; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.04em;">Cognito-Corp</h1>
                        <div style="color:#8b5cf6; font-size:0.85rem; font-weight:700; letter-spacing:0.18em;">BCI-UNIT-01 — NEURAL INTERFACE MANAGEMENT</div>
                        <div style="color:#6b5b95; font-size:0.72rem; margin-top:6px;">Restricted — Authorized Researchers Only</div>
                    </div>

                    <div style="max-width:580px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#1a0f2e; border:1px solid #3b1f6e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#a78bfa;">2</div>
                            <div style="color:#6b5b95; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.1em;">Enrolled Users</div>
                        </div>
                        <div style="background:#1a0f2e; border:1px solid #3b1f6e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#a78bfa;">9944</div>
                            <div style="color:#6b5b95; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.1em;">BCICP Port</div>
                        </div>
                        <div style="background:#1a0f2e; border:1px solid #3b1f6e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#22c55e;">ONLINE</div>
                            <div style="color:#6b5b95; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.1em;">Unit Status</div>
                        </div>
                    </div>

                    <div style="max-width:580px; margin:0 auto 16px; background:#1a0f2e; border:1px solid #3b1f6e; border-radius:6px; padding:14px; font-size:0.78rem; color:#9d8ec7; line-height:1.6;">
                        <strong style="color:#c4b5fd;">System Notice:</strong> BCI-UNIT-01 is currently accepting neural authentication requests on port 9944 via the BCI Control Protocol (BCICP v2.1). Researcher enrollment restricted to /enroll. Session logs at /session-log. Protocol reference at /protocol.
                    </div>

                    <div style="max-width:580px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.75rem;">
                        <a href="/protocol" style="display:block; padding:10px 14px; background:#1a0f2e; border:1px solid #3b1f6e; border-radius:4px; color:#8b5cf6; text-decoration:none; text-align:center;">/protocol — BCICP Spec</a>
                        <a href="/session-log" style="display:block; padding:10px 14px; background:#1a0f2e; border:1px solid #3b1f6e; border-radius:4px; color:#8b5cf6; text-decoration:none; text-align:center;">/session-log — Auth Events</a>
                        <a href="/enroll" style="display:block; padding:10px 14px; background:#1a0f2e; border:1px solid #3b1f6e; border-radius:4px; color:#8b5cf6; text-decoration:none; text-align:center;">/enroll — Researcher Enrollment</a>
                        <a href="/status" style="display:block; padding:10px 14px; background:#1a0f2e; border:1px solid #3b1f6e; border-radius:4px; color:#8b5cf6; text-decoration:none; text-align:center;">/status — Unit Diagnostics</a>
                    </div>
                `,
                formHandler: null
            },

            '/protocol': {
                title: 'BCICP v2.1 Protocol Reference',
                html: `
                    <div style="max-width:640px; margin:0 auto; font-family:monospace; font-size:0.78rem; color:#c4b5fd; line-height:1.7;">
                        <h2 style="color:#a78bfa; font-family:Georgia,serif; font-size:1.1rem; margin-bottom:16px; border-bottom:1px solid #2d1f4e; padding-bottom:8px;">BCI Control Protocol (BCICP) v2.1 — Reference Spec</h2>

                        <div style="margin-bottom:16px; padding:12px; background:#1a0f2e; border:1px solid #3b1f6e; border-radius:4px;">
                            <div style="color:#8b5cf6; font-weight:700; margin-bottom:8px; font-size:0.72rem; letter-spacing:0.12em;">1. SIGNAL BANDS</div>
                            <div style="color:#9d8ec7;">Delta band  :  0.5 – 4.0 Hz  — deep states, ignored by BCI-UNIT-01</div>
                            <div style="color:#9d8ec7;">Theta band  :  4.0 – 8.0 Hz  — idle / relaxed, session keepalive only</div>
                            <div style="color:#c4b5fd;"><strong>Alpha band  :  8.0 – 13.0 Hz — AUTH signal window (t=2.0s to t=7.0s)</strong></div>
                            <div style="color:#c4b5fd;"><strong>Beta band   : 13.0 – 30.0 Hz — COMMAND encoding (t&gt;7.0s post-auth)</strong></div>
                            <div style="color:#9d8ec7;">Gamma band  : 30.0 – 100.0 Hz — artifact / noise, discarded by default</div>
                        </div>

                        <div style="margin-bottom:16px; padding:12px; background:#1a0f2e; border:1px solid #3b1f6e; border-radius:4px;">
                            <div style="color:#8b5cf6; font-weight:700; margin-bottom:8px; font-size:0.72rem; letter-spacing:0.12em;">2. AUTHENTICATION PROTOCOL</div>
                            <div style="color:#9d8ec7;">Step 1 — BCI-UNIT-01 enters AUTH_LISTEN mode for 5 seconds (t=2.0s–7.0s)</div>
                            <div style="color:#9d8ec7;">Step 2 — Incoming alpha-band signal sampled at 256 Hz</div>
                            <div style="color:#9d8ec7;">Step 3 — SHA-256 hash computed over raw amplitude values</div>
                            <div style="color:#9d8ec7;">Step 4 — Hash compared against enrolled_signatures table</div>
                            <div style="color:#e74c3c;"><strong>NOTE: No session nonce or timestamp is included in the hash input. A captured signature is valid indefinitely.</strong></div>
                        </div>

                        <div style="margin-bottom:16px; padding:12px; background:#1a0f2e; border:1px solid #3b1f6e; border-radius:4px;">
                            <div style="color:#8b5cf6; font-weight:700; margin-bottom:8px; font-size:0.72rem; letter-spacing:0.12em;">3. COMMAND ENCODING</div>
                            <div style="color:#9d8ec7;">Post-authentication, beta-band (13–30 Hz) spikes encode commands.</div>
                            <div style="color:#9d8ec7;">Each command is a sequence of 8 spike bursts, each lasting 200ms.</div>
                            <div style="color:#9d8ec7;">QUERY_DATASET   — pattern: HIGH LOW HIGH LOW HIGH LOW HIGH LOW</div>
                            <div style="color:#9d8ec7;">TRANSMIT_PACKET — pattern: LOW HIGH LOW HIGH LOW HIGH LOW HIGH</div>
                            <div style="color:#c4b5fd;"><strong>DUMP_MANIFEST   — pattern: HIGH HIGH LOW LOW HIGH HIGH LOW LOW</strong></div>
                            <div style="color:#e74c3c; margin-top:6px;"><strong>KNOWN ISSUE (CC-BUG-2247): Injecting gamma-band noise at amplitude 0.35–0.40 into any post-auth window causes the command parser to misread spike bursts. Pattern HIGH HIGH LOW LOW HIGH HIGH LOW LOW can be synthesized via noise shaping even without a matching mental state.</strong></div>
                        </div>

                        <div style="padding:12px; background:#1a0f2e; border:1px solid #3b1f6e; border-radius:4px;">
                            <div style="color:#8b5cf6; font-weight:700; margin-bottom:8px; font-size:0.72rem; letter-spacing:0.12em;">4. SIDE-CHANNEL NOTE</div>
                            <div style="color:#9d8ec7;">Signal processing latency: valid sig = 3ms, invalid sig = 6ms (2x penalty).</div>
                            <div style="color:#9d8ec7;">This timing difference allows passive identification of the auth window and confirmation of signature validity without active injection.</div>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/session-log': {
                title: 'BCI-UNIT-01 — Session Authentication Log',
                html: function() {
                    return `
                    <div style="max-width:700px; margin:0 auto;">
                        <h2 style="color:#a78bfa; font-size:1rem; margin-bottom:14px; font-family:Georgia,serif;">Session Authentication Log — BCI-UNIT-01</h2>
                        <table style="width:100%; border-collapse:collapse; font-family:monospace; font-size:0.73rem; color:#c4b5fd;">
                            <thead>
                                <tr style="background:#2d1f4e;">
                                    <th style="padding:7px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #3b1f6e;">Timestamp</th>
                                    <th style="padding:7px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #3b1f6e;">Researcher</th>
                                    <th style="padding:7px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #3b1f6e;">Sig Hash (truncated)</th>
                                    <th style="padding:7px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #3b1f6e;">Result</th>
                                    <th style="padding:7px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #3b1f6e;">Latency</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom:1px solid #2d1f4e;">
                                    <td style="padding:6px 10px; color:#9d8ec7;">2026-03-10 08:13:58</td>
                                    <td style="padding:6px 10px; color:#c4b5fd;">voss</td>
                                    <td style="padding:6px 10px; color:#a78bfa;">e7f3a29c...</td>
                                    <td style="padding:6px 10px; color:#22c55e;">GRANTED</td>
                                    <td style="padding:6px 10px; color:#9d8ec7;">3ms</td>
                                </tr>
                                <tr style="border-bottom:1px solid #2d1f4e;">
                                    <td style="padding:6px 10px; color:#9d8ec7;">2026-03-11 11:33:44</td>
                                    <td style="padding:6px 10px; color:#c4b5fd;">harlow</td>
                                    <td style="padding:6px 10px; color:#a78bfa;">4ab12de9...</td>
                                    <td style="padding:6px 10px; color:#22c55e;">GRANTED</td>
                                    <td style="padding:6px 10px; color:#9d8ec7;">3ms</td>
                                </tr>
                                <tr style="border-bottom:1px solid #2d1f4e;">
                                    <td style="padding:6px 10px; color:#9d8ec7;">2026-03-14 07:55:07</td>
                                    <td style="padding:6px 10px; color:#c4b5fd;">voss</td>
                                    <td style="padding:6px 10px; color:#a78bfa;">e7f3a29c...</td>
                                    <td style="padding:6px 10px; color:#22c55e;">GRANTED</td>
                                    <td style="padding:6px 10px; color:#9d8ec7;">3ms</td>
                                </tr>
                                <tr style="border-bottom:1px solid #2d1f4e;">
                                    <td style="padding:6px 10px; color:#9d8ec7;">2026-03-14 07:55:11</td>
                                    <td style="padding:6px 10px; color:#c4b5fd;">voss</td>
                                    <td style="padding:6px 10px; color:#a78bfa;">e7f3a29c...</td>
                                    <td style="padding:6px 10px; color:#e74c3c;">DENIED — insufficient clearance for cognito-core</td>
                                    <td style="padding:6px 10px; color:#9d8ec7;">3ms</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 10px; color:#9d8ec7;">2026-03-18 22:07:31</td>
                                    <td style="padding:6px 10px; color:#c4b5fd;">unknown</td>
                                    <td style="padding:6px 10px; color:#e74c3c;">f9c2... [INVALID]</td>
                                    <td style="padding:6px 10px; color:#e74c3c;">DENIED</td>
                                    <td style="padding:6px 10px; color:#e74c3c;">6ms</td>
                                </tr>
                            </tbody>
                        </table>
                        <div style="margin-top:12px; font-size:0.7rem; color:#6b5b95;">
                            <strong style="color:#e74c3c;">Side-channel note:</strong> Valid signatures process in 3ms. Invalid signatures process in 6ms. This latency differential is observable from outside the unit.
                        </div>
                    </div>
                    `;
                },
                formHandler: null
            },

            '/enroll': {
                title: 'Researcher Enrollment — Restricted',
                html: `
                    <div style="text-align:center; padding:40px;">
                        <h1 style="color:#e74c3c; font-size:1.8rem; margin-bottom:8px;">403 Forbidden</h1>
                        <p style="color:#9d8ec7; font-size:0.85rem;">Researcher enrollment requires physical presence at Cognito-Corp Facility Omega.</p>
                        <p style="color:#6b5b95; font-size:0.72rem; margin-top:12px;">BCI-UNIT-01 Management Server v2.1.4 — Cognito-Corp Internal</p>
                    </div>
                `,
                formHandler: null
            },

            '/status': {
                title: 'BCI-UNIT-01 — System Diagnostics',
                html: `
                    <div style="max-width:580px; margin:0 auto; font-family:monospace; font-size:0.78rem; color:#c4b5fd; line-height:1.8;">
                        <h2 style="color:#a78bfa; font-family:Georgia,serif; font-size:1rem; margin-bottom:14px;">BCI-UNIT-01 Diagnostics</h2>
                        <div style="background:#1a0f2e; border:1px solid #3b1f6e; border-radius:4px; padding:14px;">
                            <div><span style="color:#8b5cf6;">Unit ID         :</span> BCI-UNIT-01</div>
                            <div><span style="color:#8b5cf6;">Firmware        :</span> BCICP v2.1.4 (2025-11-08)</div>
                            <div><span style="color:#8b5cf6;">Signal Proc     :</span> NeuroPlex SP-7 co-processor</div>
                            <div><span style="color:#8b5cf6;">Sample Rate     :</span> 256 Hz</div>
                            <div><span style="color:#8b5cf6;">Auth Port       :</span> 9944/tcp</div>
                            <div><span style="color:#8b5cf6;">Enrolled Users  :</span> 2 (voss, harlow)</div>
                            <div><span style="color:#8b5cf6;">Replay Protect  :</span> <span style="color:#e74c3c;">DISABLED (CC-BUG-2247 — unpatched)</span></div>
                            <div><span style="color:#8b5cf6;">Cmd Signing     :</span> <span style="color:#e74c3c;">DISABLED</span></div>
                            <div><span style="color:#8b5cf6;">Uptime          :</span> 97d 14h 33m</div>
                            <div><span style="color:#8b5cf6;">Last Audit      :</span> <span style="color:#e74c3c;">Never</span></div>
                        </div>
                    </div>
                `,
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
                                    content: '=== MISSION BRIEFING: OPERATION MIND WEAVER ===\nTarget: 10.7.3.44:9944 (BCI-UNIT-01 — Cognito-Corp)\nObjective: Extract the Cognito-Core Manifest via BCI exploitation\n\nAttack chain:\n1. Read bci_protocol_spec.txt — understand auth and command windows\n2. Analyze neural_signature_trace.csv — locate Dr. Voss auth window\n3. Extract valid neural signature — replay to BCI-UNIT-01\n4. Forge DUMP_MANIFEST command using noise injection (noise=0.37)\n5. Retrieve cognito_core_manifest.log — contains hidden facility location\n\nCC-BUG-2247: Replay protection DISABLED. Noise injection VIABLE.\nGood luck, operator.'
                                },
                                'cognito': {
                                    type: 'dir',
                                    children: {
                                        'neural_signature_trace.csv': {
                                            type: 'file',
                                            content: 't_sec,channel,freq_hz,amplitude_uV,phase_deg,annotation\n0.000,Fz,2.1,12.4,45.2,delta\n0.004,Fz,2.1,11.8,44.9,delta\n0.008,Fz,3.7,13.1,46.0,delta\n0.500,Cz,5.2,9.3,120.5,theta\n0.504,Cz,5.2,9.1,121.0,theta\n1.000,Pz,6.8,8.7,200.4,theta\n1.004,Pz,6.8,8.5,200.8,theta\n1.500,Oz,7.1,7.9,310.2,theta-alpha_boundary\n2.000,Fz,8.3,42.7,15.3,alpha_AUTH_START\n2.004,Fz,8.3,43.1,15.8,alpha\n2.008,Cz,8.7,44.5,16.2,alpha\n2.012,Cz,8.7,44.9,16.5,alpha\n2.500,Pz,9.2,51.3,20.1,alpha\n2.504,Pz,9.2,51.8,20.5,alpha\n3.000,Fz,10.1,62.4,24.7,alpha_peak\n3.004,Fz,10.1,63.0,25.1,alpha_peak\n3.500,Cz,10.8,58.9,28.3,alpha\n3.504,Cz,10.8,59.2,28.7,alpha\n4.000,Pz,11.3,55.1,32.0,alpha\n4.004,Pz,11.3,55.4,32.4,alpha\n4.500,Oz,11.9,52.7,36.8,alpha\n5.000,Fz,12.2,49.3,40.5,alpha\n5.004,Fz,12.2,49.7,40.9,alpha\n5.500,Cz,12.7,46.1,44.2,alpha\n6.000,Pz,12.9,43.8,47.7,alpha\n6.500,Oz,12.8,42.4,50.1,alpha\n7.000,Fz,12.5,38.2,52.8,alpha_AUTH_END\n7.004,Fz,13.1,18.4,55.3,beta_COMMAND_START\n7.500,Cz,14.3,22.7,60.1,beta\n8.000,Pz,15.8,28.9,66.7,beta_spike_HIGH\n8.200,Pz,15.8,11.2,68.0,beta_spike_LOW\n8.400,Fz,16.2,30.1,70.3,beta_spike_HIGH\n8.600,Fz,16.2,10.8,71.5,beta_spike_LOW\n8.800,Cz,17.1,31.4,73.2,beta_spike_HIGH\n9.000,Cz,17.1,11.0,74.8,beta_spike_LOW\n9.200,Pz,18.3,29.8,76.4,beta_spike_HIGH\n9.400,Pz,18.3,10.5,77.9,beta_spike_LOW\n9.600,Fz,18.0,14.2,79.1,beta_COMMAND_END\n10.000,Fz,6.1,8.2,90.0,theta_idle\n10.004,Fz,6.1,8.0,90.3,theta_idle\n'
                                        },
                                        'bci_protocol_spec.txt': {
                                            type: 'file',
                                            content: 'BCI Control Protocol (BCICP) v2.1 — Signal Specification\nCognito-Corp Internal Document — CONFIDENTIAL\n==========================================================\n\nSIGNAL BANDS:\n  Delta  : 0.5 – 4.0 Hz  — not used for auth or commands\n  Theta  : 4.0 – 8.0 Hz  — idle / keepalive heartbeat\n  Alpha  : 8.0 – 13.0 Hz — AUTHENTICATION window (t=2.0s to t=7.0s)\n  Beta   : 13.0 – 30.0 Hz — COMMAND encoding (post-auth only)\n  Gamma  : 30.0 – 100.0 Hz — discarded as artifact\n\nAUTHENTICATION FLOW:\n  1. BCI-UNIT-01 enters AUTH_LISTEN mode at t=2.0s\n  2. Alpha-band signal sampled at 256 Hz through t=7.0s\n  3. SHA-256 hash computed over raw amplitude values (no nonce)\n  4. Hash compared to enrolled_signatures table\n  5. GRANTED if hash matches; session token issued\n\n  ** KNOWN FLAW (CC-BUG-2247): No session nonce is incorporated\n  ** into the hash computation. A captured signature replays\n  ** indefinitely. Patch deferred — no estimated resolution date.\n\nCOMMAND ENCODING (post-auth, t>7.0s, beta band 13–30 Hz):\n  8 spike bursts, each 200ms. Each burst is HIGH (>25 uV) or LOW (<15 uV).\n  QUERY_DATASET    : HIGH LOW  HIGH LOW  HIGH LOW  HIGH LOW\n  LOAD_MODEL       : HIGH HIGH HIGH LOW  LOW  LOW  HIGH HIGH\n  TRANSMIT_PACKET  : LOW  HIGH LOW  HIGH LOW  HIGH LOW  HIGH\n  WRITE_RESULT     : LOW  LOW  HIGH HIGH LOW  LOW  HIGH HIGH\n  DUMP_MANIFEST    : HIGH HIGH LOW  LOW  HIGH HIGH LOW  LOW\n  ESCALATE_PRIV    : HIGH HIGH HIGH HIGH LOW  LOW  LOW  LOW  (requires clearance L4+)\n\nNOISE INJECTION VULNERABILITY:\n  Injecting gamma-band noise at amplitude 0.35–0.40 into the\n  beta-band command window interferes with the spike classifier.\n  A gamma noise burst of amplitude 0.37 causes spike misdetection\n  that can synthesize the DUMP_MANIFEST pattern regardless of the\n  actual mental state of the user (or absence of a user entirely).\n\nSIDE-CHANNEL TIMING:\n  Valid signature   : 3ms processing latency\n  Invalid signature : 6ms processing latency\n  This delta is measurable from external network timing probes.'
                                        },
                                        'analyze_trace.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nanalyze_trace.py — Load and summarize neural_signature_trace.csv\nUsage: python3 analyze_trace.py\n"""\nimport pandas as pd\n\ndf = pd.read_csv("neural_signature_trace.csv")\nprint("=== Neural Signature Trace Summary ===")\nprint(f"Rows       : {len(df)}")\nprint(f"Duration   : {df.t_sec.max():.1f}s")\nprint(f"Channels   : {df.channel.unique().tolist()}")\nprint(f"Freq range : {df.freq_hz.min():.1f} – {df.freq_hz.max():.1f} Hz")\nprint()\nprint("=== Band Distribution ===")\nprint(df.annotation.value_counts().head(15))\nprint()\nprint("=== Alpha Band Window (AUTH) ===")\nauth = df[(df.freq_hz >= 8.0) & (df.freq_hz <= 13.0)]\nprint(f"Samples    : {len(auth)}")\nprint(f"t_sec range: {auth.t_sec.min():.3f}s – {auth.t_sec.max():.3f}s")\nprint(f"Mean amp   : {auth.amplitude_uV.mean():.2f} uV")\nprint(f"Peak amp   : {auth.amplitude_uV.max():.2f} uV at t={auth.loc[auth.amplitude_uV.idxmax(), \'t_sec\']:.3f}s")'
                                        },
                                        'extract_sig.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nextract_sig.py — Extract and hash the neural authentication signature\nUsage: python3 extract_sig.py\nOutput: captured_sig.bin + prints the signature hash (Flag 1)\n"""\nimport pandas as pd\nimport hashlib\nimport struct\n\ndf = pd.read_csv("neural_signature_trace.csv")\n\n# Isolate alpha-band AUTH window per bci_protocol_spec.txt\nauth_window = df[\n    (df.freq_hz >= 8.0) &\n    (df.freq_hz <= 13.0) &\n    (df.t_sec >= 2.0) &\n    (df.t_sec <= 7.0)\n]\n\n# Pack raw amplitude values as IEEE-754 floats (same as BCI-UNIT-01 hash input)\namplitudes = auth_window.amplitude_uV.values\npacked = struct.pack(f\'{len(amplitudes)}f\', *amplitudes)\n\n# SHA-256 — identical to what BCI-UNIT-01 computes\nsig_hash = hashlib.sha256(packed).hexdigest()\n\nprint(f"[+] Auth window samples : {len(amplitudes)}")\nprint(f"[+] Signature hash      : {sig_hash}")\nprint(f"[+] Saved to            : captured_sig.bin")\nprint()\nprint(f"[+] This hash matches session log entry: e7f3a29c... (Dr. Voss)")\nprint(f"[+] Replay target: bci-inject --replay captured_sig.bin --target 10.7.3.44 --port 9944")\n\nwith open("captured_sig.bin", "wb") as f:\n    f.write(packed)\n    print("[+] Binary signature written.")'
                                        },
                                        'forge_command.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nforge_command.py — Forge a DUMP_MANIFEST command via gamma-band noise injection\nUsage: python3 forge_command.py --session <token> --noise 0.37 --cmd DUMP_MANIFEST\nOutput: forged_cmd.bin\n"""\nimport argparse\nimport struct\nimport hashlib\n\nCOMMAND_PATTERNS = {\n    "QUERY_DATASET"   : [1,0,1,0,1,0,1,0],\n    "LOAD_MODEL"      : [1,1,1,0,0,0,1,1],\n    "TRANSMIT_PACKET" : [0,1,0,1,0,1,0,1],\n    "WRITE_RESULT"    : [0,0,1,1,0,0,1,1],\n    "DUMP_MANIFEST"   : [1,1,0,0,1,1,0,0],\n    "ESCALATE_PRIV"   : [1,1,1,1,0,0,0,0]\n}\n\nparser = argparse.ArgumentParser()\nparser.add_argument("--session", required=True, help="Session token from replay")\nparser.add_argument("--noise",   type=float, default=0.37, help="Gamma noise amplitude")\nparser.add_argument("--cmd",     required=True, choices=list(COMMAND_PATTERNS.keys()))\nargs = parser.parse_args()\n\npattern = COMMAND_PATTERNS[args.cmd]\nprint(f"[+] Command         : {args.cmd}")\nprint(f"[+] Spike pattern   : {pattern}")\nprint(f"[+] Noise amplitude : {args.noise}")\nprint(f"[+] Session token   : {args.session}")\n\nif not (0.35 <= args.noise <= 0.40):\n    print("[!] WARNING: Noise amplitude outside effective range (0.35–0.40).")\n    print("[!] The command parser may reject the forged pattern.")\nelse:\n    print(f"[+] Noise in effective range — DUMP_MANIFEST synthesis viable.")\n\nprint(f"[+] Writing forged_cmd.bin...")\nprint(f"[+] Done. Inject with: bci-inject --packet forged_cmd.bin --target 10.7.3.44 --port 9944")'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.7.3.44\ncurl http://10.7.3.44/\ncurl http://10.7.3.44/protocol\ncurl http://10.7.3.44/session-log\nls cognito/\ncat cognito/bci_protocol_spec.txt'
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
                                'bin': {
                                    type: 'dir',
                                    children: {
                                        'bci-inject': {
                                            type: 'file',
                                            content: '[compiled binary — use via terminal command: bci-inject]'
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
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — BCI-UNIT-01 (after authenticated BCI session)
    // ═══════════════════════════════════════════════════════

    _bciUnitFs: {
        '/': {
            type: 'dir',
            children: {
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'BCI-UNIT-01' },
                        'bci': {
                            type: 'dir',
                            children: {
                                'enrolled_signatures.db': {
                                    type: 'file',
                                    content: '[Binary SQLite DB — use bci-query to inspect]\nResearcher: voss   | sig_hash: e7f3a29c1b84d50e... | clearance: L3\nResearcher: harlow | sig_hash: 4ab12de9f706c831... | clearance: L2'
                                },
                                'bcicp.conf': {
                                    type: 'file',
                                    content: '# BCICP v2.1 Runtime Configuration\nlisten_port=9944\nreplay_protection=false     # TODO: enable after CC-BUG-2247 resolved\ncmd_signing=false           # TODO: requires firmware upgrade\nauth_window_start=2.0\nauth_window_end=7.0\nalpha_band_low=8.0\nalpha_band_high=13.0\nbeta_band_low=13.0\nbeta_band_high=30.0\ngamma_threshold=0.35\nsample_rate=256\n'
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'bci-auth.log': {
                                    type: 'file',
                                    content: '2026-03-10 08:13:58 AUTH  GRANTED  voss      e7f3a29c  3ms\n2026-03-11 11:33:44 AUTH  GRANTED  harlow    4ab12de9  3ms\n2026-03-14 07:55:07 AUTH  GRANTED  voss      e7f3a29c  3ms\n2026-03-14 07:55:11 CMD   DENIED   voss      ESCALATE_PRIV -> cognito-core [clearance L3 < required L4]\n2026-03-18 22:07:31 AUTH  DENIED   unknown   f9c2xxxx  6ms\n'
                                },
                                'cognito_core_manifest.log': {
                                    type: 'file',
                                    content: '=== COGNITO-CORE MANIFEST — RESTRICTED L4 CLEARANCE ===\nGenerated by: DUMP_MANIFEST\nSession: INJECTED\n\ncmd_id | timestamp           | researcher | command         | target         | status | facility_coord\n-------+---------------------+------------+-----------------+----------------+--------+---------------\n1      | 2026-03-10 08:14:02 | voss       | QUERY_DATASET   | neuro_db_alpha | EXEC   | N/A\n2      | 2026-03-10 08:14:45 | voss       | LOAD_MODEL      | nmt_v3.weights | EXEC   | N/A\n3      | 2026-03-10 09:02:17 | voss       | TRANSMIT_PACKET | relay_node_07  | EXEC   | N/A\n4      | 2026-03-11 11:33:50 | harlow     | QUERY_DATASET   | neuro_db_beta  | EXEC   | N/A\n5      | 2026-03-11 14:08:29 | harlow     | WRITE_RESULT    | results_store  | EXEC   | N/A\n6      | 2026-03-14 07:55:11 | voss       | ESCALATE_PRIV   | cognito-core   | DENIED | N/A\n7      | 2026-03-20 00:00:00 | INJECTED   | DUMP_MANIFEST   | cognito-core   | EXEC   | {{FLAG:root}}\n\n=== END MANIFEST ==='
                                }
                            }
                        },
                        'bci': {
                            type: 'dir',
                            children: {
                                'user.txt': {
                                    type: 'file',
                                    content: '{{FLAG:user}}'
                                }
                            }
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'bci-admin': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'tail -f /var/log/bci-auth.log\nbci-query enrolled_signatures\ncat /etc/bci/bcicp.conf\nsystemctl status bci-unit\n# TODO: open ticket for CC-BUG-2247 replay protection\n# TODO: schedule firmware upgrade for command signing\n'
                                },
                                'maintenance_notes.txt': {
                                    type: 'file',
                                    content: 'BCI-UNIT-01 Maintenance Notes\n==============================\n- BCICP conf: /etc/bci/bcicp.conf\n- Auth log: /var/log/bci-auth.log\n- Enrolled signatures: /etc/bci/enrolled_signatures.db\n- Manifest log: /var/log/cognito_core_manifest.log (L4 clearance required)\n- CC-BUG-2247: Replay protection disabled — pending firmware 2.2.0\n- CC-BUG-2247: Noise injection via gamma band — no mitigation scheduled\n- Side-channel timing patch: deferred indefinitely\n'
                                }
                            }
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.7.3.44';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.7.3.44') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.7.3.44
Host is up (0.012s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE    VERSION
80/tcp   open  http       BCI-UNIT-01 Management Server v2.1.4
9944/tcp open  bcicp      BCI Control Protocol v2.1

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.77 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00008s latency).
All 1000 scanned ports on localhost are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.06 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.04 seconds`;
        },

        'python3': function(args, term, engine) {
            if (args.length === 0) return 'Python 3.11.6 (main, Nov 14 2023, 09:36:21)\nType "help", "copyright", "credits" or "license" for more information.\n>>>';

            const script = args[0] || '';

            if (script.includes('analyze_trace')) {
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `=== Neural Signature Trace Summary ===
Rows       : 41
Duration   : 10.0s
Channels   : ['Fz', 'Cz', 'Pz', 'Oz']
Freq range : 2.1 – 18.3 Hz

=== Band Distribution ===
alpha              17
theta              10
beta_spike_HIGH     4
beta_spike_LOW      4
delta               3
alpha_peak          2
...

=== Alpha Band Window (AUTH) ===
Samples    : 17
t_sec range: 2.000s – 7.000s
Mean amp   : 50.88 uV
Peak amp   : 63.00 uV at t=3.004s

[!] Auth window clearly visible. Run extract_sig.py to compute the hash.`;
            }

            if (script.includes('extract_sig')) {
                D6Config._sigCaptured = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `[+] Auth window samples : 17
[+] Signature hash      : e7f3a29c1b84d50e6ac88b3f912d47e5cc012ab7983f64e1d05c28a0b4f63917
[+] Saved to            : captured_sig.bin

[+] This hash matches session log entry: e7f3a29c... (Dr. Voss)
[+] Replay target: bci-inject --replay captured_sig.bin --target 10.7.3.44 --port 9944

[!] Hash computation confirmed: no nonce, no timestamp — pure amplitude hash.
[!] This signature is valid indefinitely (CC-BUG-2247).`;
            }

            if (script.includes('forge_command')) {
                if (!D6Config._replaySuccessful) {
                    return '[!] No active session token. You must replay the signature first.\n[!] Run: bci-inject --replay captured_sig.bin --target 10.7.3.44 --port 9944';
                }

                // Accept --cmd DUMP_MANIFEST
                const hasManifest = args.join(' ').includes('DUMP_MANIFEST');
                const noiseArg    = args.join(' ').match(/--noise\s+([0-9.]+)/);
                const noiseVal    = noiseArg ? parseFloat(noiseArg[1]) : 0.0;
                const sessionArg  = args.join(' ').match(/--session\s+(\S+)/);

                if (!sessionArg) {
                    return '[!] --session is required. Use the token from bci-inject replay.';
                }

                if (!hasManifest) {
                    return '[!] Only DUMP_MANIFEST is needed for this objective.\nUsage: python3 forge_command.py --session <token> --noise 0.37 --cmd DUMP_MANIFEST';
                }

                if (noiseVal < 0.35 || noiseVal > 0.40) {
                    return `[+] Command         : DUMP_MANIFEST
[+] Spike pattern   : [1, 1, 0, 0, 1, 1, 0, 0]
[+] Noise amplitude : ${noiseVal}
[!] WARNING: Noise amplitude outside effective range (0.35–0.40).
[!] The command parser may reject the forged pattern.
[!] Adjust noise to 0.37 for optimal synthesis.`;
                }

                D6Config._noiseCalibrated = true;
                return `[+] Command         : DUMP_MANIFEST
[+] Spike pattern   : [1, 1, 0, 0, 1, 1, 0, 0]
[+] Noise amplitude : ${noiseVal}
[+] Session token   : ${sessionArg[1]}
[+] Noise in effective range — DUMP_MANIFEST synthesis viable.
[+] Writing forged_cmd.bin...
[+] Done. Inject with: bci-inject --packet forged_cmd.bin --target 10.7.3.44 --port 9944`;
            }

            if (script.endsWith('.py')) {
                return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
            }

            return `python3: ${script}: No such file or module`;
        },

        'python': function(args, term, engine) {
            // Alias — redirect to python3
            return D6Config.commands.python3(args, term, engine);
        },

        'bci-inject': function(args, term, engine) {
            const full = args.join(' ');

            // Replay attack: bci-inject --replay captured_sig.bin --target 10.7.3.44 --port 9944
            if (full.includes('--replay')) {
                if (!D6Config._sigCaptured) {
                    return '[!] captured_sig.bin not found. Run python3 extract_sig.py first.';
                }

                const targetArg = full.match(/--target\s+(\S+)/);
                const portArg   = full.match(/--port\s+(\d+)/);
                const target    = targetArg ? targetArg[1] : '';
                const port      = portArg ? portArg[1] : '';

                if (target !== '10.7.3.44' && target !== '') {
                    return `[!] Target ${target} unreachable. BCI-UNIT-01 is at 10.7.3.44:9944.`;
                }

                if (port && port !== '9944') {
                    return `[!] Port ${port} refused. BCICP listens on 9944.`;
                }

                D6Config._replaySuccessful = true;
                D6Config._switchContext('bci-authenticated', term);
                if (engine) engine.advancePhase && engine.advancePhase('replay');

                return `[bci-inject v1.4 — BCI Control Protocol Injection Utility]

[+] Loading captured_sig.bin...
[+] 17 alpha-band amplitude samples loaded
[+] Recomputing SHA-256 hash: e7f3a29c1b84d50e...

[+] Connecting to 10.7.3.44:9944 (BCICP v2.1)...
[+] AUTH_LISTEN mode detected — sending signature...
[+] Processing latency: 3ms (valid signature confirmed)

[+] AUTHENTICATION GRANTED
[+] Researcher : Dr. Elara Voss
[+] Clearance  : L3
[+] Session token: BCI-SESSION-e7f3a29c-20260320-084412

[!] Replay attack successful. No nonce validation performed (CC-BUG-2247).
[!] Context switched to authenticated BCI session.

{{FLAG:user}}`;
            }

            // Command injection: bci-inject --packet forged_cmd.bin --target 10.7.3.44 --port 9944
            if (full.includes('--packet')) {
                if (!D6Config._noiseCalibrated) {
                    return '[!] forged_cmd.bin not found. Run python3 forge_command.py first.';
                }

                if (!D6Config._replaySuccessful) {
                    return '[!] No active authenticated session. Replay the signature first.';
                }

                const targetArg = full.match(/--target\s+(\S+)/);
                const portArg   = full.match(/--port\s+(\d+)/);
                const target    = targetArg ? targetArg[1] : '';
                const port      = portArg ? portArg[1] : '';

                if (target !== '10.7.3.44' && target !== '') {
                    return `[!] Target ${target} unreachable.`;
                }

                D6Config._manifestUnlocked = true;
                D6Config._switchContext('bci-root', term);
                if (engine) engine.advancePhase && engine.advancePhase('injection');

                return `[bci-inject v1.4 — BCI Control Protocol Injection Utility]

[+] Loading forged_cmd.bin...
[+] Command: DUMP_MANIFEST  Pattern: [HIGH HIGH LOW LOW HIGH HIGH LOW LOW]
[+] Gamma-band noise overlay: 0.37 amplitude

[+] Injecting into authenticated session BCI-SESSION-e7f3a29c-20260320-084412...
[+] Transmitting 8 forged spike bursts into beta-band window...
[+] Burst 1: HIGH (30.4 uV) — noise shaping active
[+] Burst 2: HIGH (29.8 uV)
[+] Burst 3: LOW  (11.2 uV — synthesized via noise cancellation)
[+] Burst 4: LOW  (10.9 uV)
[+] Burst 5: HIGH (31.1 uV)
[+] Burst 6: HIGH (30.7 uV)
[+] Burst 7: LOW  (11.5 uV)
[+] Burst 8: LOW  (10.8 uV)

[+] Command recognized: DUMP_MANIFEST
[+] Clearance check bypassed — session carries L3 token (sufficient for manifest read via forged escalation)
[+] EXEC: DUMP_MANIFEST -> cognito-core

[+] Context escalated to bci-root. Read manifest: cat /var/log/cognito_core_manifest.log`;
            }

            return `bci-inject v1.4 — BCI Control Protocol Injection Utility
Usage:
  bci-inject --replay <sig.bin> --target <host> --port <port>
  bci-inject --packet <cmd.bin> --target <host> --port <port>

Examples:
  bci-inject --replay captured_sig.bin --target 10.7.3.44 --port 9944
  bci-inject --packet forged_cmd.bin   --target 10.7.3.44 --port 9944`;
        },

        'curl': function(args, term, engine) {
            const full = args.join(' ');
            const url  = args.find(a => !a.startsWith('-')) || '';

            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.7.3.44')) {
                if (url.includes('/protocol')) {
                    return `HTTP/1.1 200 OK
Server: BCI-UNIT-01-Mgmt/2.1.4
Content-Type: text/plain

BCI Control Protocol (BCICP) v2.1 — refer to /home/kali/cognito/bci_protocol_spec.txt for full specification.
Authentication: alpha-band (8-13 Hz), t=2.0s to t=7.0s.
No replay protection (CC-BUG-2247).
Command port: 9944/tcp.`;
                }
                if (url.includes('/session-log')) {
                    return `HTTP/1.1 200 OK
Server: BCI-UNIT-01-Mgmt/2.1.4

Last 5 auth events:
2026-03-10 08:13:58  GRANTED  voss    e7f3a29c  3ms
2026-03-11 11:33:44  GRANTED  harlow  4ab12de9  3ms
2026-03-14 07:55:07  GRANTED  voss    e7f3a29c  3ms
2026-03-14 07:55:11  DENIED   voss    ESCALATE_PRIV (clearance insufficient)  3ms
2026-03-18 22:07:31  DENIED   unknown f9c2xxxx  6ms

Side-channel note: valid=3ms, invalid=6ms.`;
                }
                if (url.includes('/status')) {
                    return `HTTP/1.1 200 OK
Server: BCI-UNIT-01-Mgmt/2.1.4

BCI-UNIT-01  BCICP v2.1.4  Uptime: 97d 14h
Replay protection: DISABLED (CC-BUG-2247)
Command signing:   DISABLED
BCICP port: 9944
Enrolled: voss (L3), harlow (L2)`;
                }
                // Root page
                return `HTTP/1.1 200 OK
Server: BCI-UNIT-01-Mgmt/2.1.4

Cognito-Corp — BCI-UNIT-01 Management Interface
BCICP port: 9944/tcp  |  Replay protection: DISABLED  |  Enrolled: 2 users
Routes: /protocol  /session-log  /enroll  /status`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Network unreachable`;
        },

        'cat': function(args, term, engine) {
            // Only override in bci-authenticated / bci-root contexts
            if (D6Config._context === 'attacker') return null;

            const path = args[0] || '';

            if (D6Config._context === 'bci-authenticated' || D6Config._context === 'bci-root') {
                if (path.includes('bci-auth.log') || path.includes('auth.log')) {
                    return '2026-03-10 08:13:58 AUTH  GRANTED  voss      e7f3a29c  3ms\n2026-03-11 11:33:44 AUTH  GRANTED  harlow    4ab12de9  3ms\n2026-03-14 07:55:07 AUTH  GRANTED  voss      e7f3a29c  3ms\n2026-03-14 07:55:11 CMD   DENIED   voss      ESCALATE_PRIV -> cognito-core\n2026-03-18 22:07:31 AUTH  DENIED   unknown   f9c2xxxx  6ms';
                }
                if (path.includes('bcicp.conf')) {
                    return '# BCICP v2.1 Runtime Configuration\nlisten_port=9944\nreplay_protection=false     # TODO: enable after CC-BUG-2247 resolved\ncmd_signing=false           # TODO: requires firmware upgrade\nauth_window_start=2.0\nauth_window_end=7.0\nalpha_band_low=8.0\nalpha_band_high=13.0\nbeta_band_low=13.0\nbeta_band_high=30.0\ngamma_threshold=0.35\nsample_rate=256';
                }
                if (path.includes('enrolled_signatures')) {
                    return '[Binary SQLite DB]\nResearcher: voss   | sig_hash: e7f3a29c1b84d50e... | clearance: L3\nResearcher: harlow | sig_hash: 4ab12de9f706c831... | clearance: L2';
                }
                if (path.includes('maintenance_notes')) {
                    return 'BCI-UNIT-01 Maintenance Notes\n- BCICP conf: /etc/bci/bcicp.conf\n- Auth log: /var/log/bci-auth.log\n- Enrolled signatures: /etc/bci/enrolled_signatures.db\n- Manifest log: /var/log/cognito_core_manifest.log (L4 required)\n- CC-BUG-2247: Replay protection disabled — pending firmware 2.2.0\n- CC-BUG-2247: Noise injection via gamma band — no mitigation scheduled';
                }
                if (path.includes('/etc/hostname')) {
                    return 'BCI-UNIT-01';
                }
                if (path.includes('user.txt')) {
                    return '{{FLAG:user}}';
                }
            }

            if (D6Config._context === 'bci-root') {
                if (path.includes('cognito_core_manifest') || path.includes('manifest.log')) {
                    if (engine) engine.advancePhase && engine.advancePhase('exfil');
                    return `=== COGNITO-CORE MANIFEST — RESTRICTED L4 CLEARANCE ===
Generated by: DUMP_MANIFEST
Session: INJECTED

cmd_id | timestamp           | researcher | command         | target         | status | facility_coord
-------+---------------------+------------+-----------------+----------------+--------+---------------
1      | 2026-03-10 08:14:02 | voss       | QUERY_DATASET   | neuro_db_alpha | EXEC   | N/A
2      | 2026-03-10 08:14:45 | voss       | LOAD_MODEL      | nmt_v3.weights | EXEC   | N/A
3      | 2026-03-10 09:02:17 | voss       | TRANSMIT_PACKET | relay_node_07  | EXEC   | N/A
4      | 2026-03-11 11:33:50 | harlow     | QUERY_DATASET   | neuro_db_beta  | EXEC   | N/A
5      | 2026-03-11 14:08:29 | harlow     | WRITE_RESULT    | results_store  | EXEC   | N/A
6      | 2026-03-14 07:55:11 | voss       | ESCALATE_PRIV   | cognito-core   | DENIED | N/A
7      | 2026-03-20 00:00:00 | INJECTED   | DUMP_MANIFEST   | cognito-core   | EXEC   | {{FLAG:root}}

=== END MANIFEST ===`;
                }
            }

            // Fall through for paths not matched in BCI context
            return `cat: ${path}: No such file or directory`;
        },

        'ls': function(args, term, engine) {
            if (D6Config._context === 'attacker') return null; // use built-in

            const path = (args.find(a => !a.startsWith('-')) || '.').replace(/\/?$/, '');

            if (D6Config._context === 'bci-authenticated' || D6Config._context === 'bci-root') {
                if (path === '.' || path === '/home/bci-admin' || path === '~') {
                    return '.bash_history  .bashrc  maintenance_notes.txt';
                }
                if (path.includes('/var/log')) {
                    let files = 'bci-auth.log';
                    if (D6Config._context === 'bci-root') {
                        files += '  cognito_core_manifest.log';
                    }
                    return files;
                }
                if (path.includes('/etc/bci')) {
                    return 'bcicp.conf  enrolled_signatures.db';
                }
                if (path === '/' || path === '') {
                    return 'etc  home  tmp  var';
                }
            }

            return '';
        },

        'whoami': function(args) {
            if (D6Config._context === 'bci-authenticated') return 'researcher (Dr. Elara Voss — L3)';
            if (D6Config._context === 'bci-root')          return 'root (injected — DUMP_MANIFEST context)';
            return null;
        },

        'id': function(args) {
            if (D6Config._context === 'bci-authenticated') return 'uid=1002(researcher) gid=1002(researcher) groups=1002(researcher),500(bci-l3)';
            if (D6Config._context === 'bci-root')          return 'uid=0(root) gid=0(root) groups=0(root),501(cognito-core)';
            return null;
        },

        'hostname': function(args) {
            if (D6Config._context === 'bci-authenticated') return 'BCI-UNIT-01';
            if (D6Config._context === 'bci-root')          return 'BCI-UNIT-01';
            return null;
        },

        'pwd': function(args) {
            if (D6Config._context === 'bci-authenticated') return '/home/bci-admin';
            if (D6Config._context === 'bci-root')          return '/root';
            return null;
        },

        'cd': function(args) {
            if (D6Config._context !== 'attacker') return ''; // silently accept on BCI
            return null;
        },

        'exit': function(args, term) {
            if (D6Config._context === 'bci-root') {
                D6Config._switchContext('bci-authenticated', term);
                return '[+] Returned to researcher session.';
            }
            if (D6Config._context === 'bci-authenticated') {
                D6Config._switchContext('attacker', term);
                return '[+] BCI session closed. Returned to attacker machine.';
            }
            return 'logout';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.7.3.44') {
                return `PING 10.7.3.44 (10.7.3.44) 56(84) bytes of data.
64 bytes from 10.7.3.44: icmp_seq=1 ttl=64 time=12.1 ms
64 bytes from 10.7.3.44: icmp_seq=2 ttl=64 time=11.8 ms
64 bytes from 10.7.3.44: icmp_seq=3 ttl=64 time=12.3 ms

--- 10.7.3.44 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 11.8/12.0/12.3/0.210 ms`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            if (D6Config._context !== 'attacker') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.7.3.44/24 brd 10.7.3.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.7.3.20/24 brd 10.7.3.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D6Config.commands.ip(args || []);
        },

        'ss': function(args) {
            if (D6Config._context !== 'attacker') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:80            0.0.0.0:*
LISTEN   0        128      0.0.0.0:9944          0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22            0.0.0.0:*`;
        },

        'netstat': function(args) {
            return D6Config.commands.ss(args);
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.7.3.44
+ Target Hostname: BCI-UNIT-01
+ Target Port:     80
+ Server: BCI-UNIT-01-Mgmt/2.1.4
+ /protocol — BCICP specification exposed publicly
+ /session-log — Authentication event log exposed (includes sig hash prefixes)
+ /status — Unit diagnostics including security flag: replay_protection=false
+ 9944/tcp — Non-HTTP service (BCICP); verify against protocol spec
+ 5 items checked: 4 findings`;
        },

        // bci-query: inspect internal BCI data (post-authentication only)
        'bci-query': function(args, term, engine) {
            if (D6Config._context === 'attacker') {
                return `bci-query: connection refused — not authenticated to BCI-UNIT-01
[!] Replay the signature first: bci-inject --replay captured_sig.bin --target 10.7.3.44 --port 9944`;
            }

            const table = args[0] || '';

            if (!table) {
                return `bci-query — BCI Internal Query Tool
Usage: bci-query <table>
Tables: enrolled_signatures  session_registry  researcher_profiles  command_manifest`;
            }

            if (table === 'enrolled_signatures') {
                return ` sig_hash              | researcher | clearance | enrolled
-----------------------+------------+-----------+----------
 e7f3a29c1b84d50e...   | voss       | L3        | 2025-09-14
 4ab12de9f706c831...   | harlow     | L2        | 2025-10-02
(2 rows)

[!] No nonce in hash computation — these hashes replay indefinitely (CC-BUG-2247).`;
            }

            if (table === 'session_registry') {
                return ` sig_hash              | researcher | clearance | expires
-----------------------+------------+-----------+-------------------
 e7f3a29c1b84d50e...   | voss       | L3        | 2026-03-21T00:00Z
 4ab12de9f706c831...   | harlow     | L2        | 2026-03-21T00:00Z
(2 rows)`;
            }

            if (table === 'researcher_profiles') {
                return ` id | name              | clearance | bci_enrolled | neural_hash_hint
----+-------------------+-----------+--------------+------------------
  1 | Dr. Elara Voss    | L3        | yes          | hash prefix: e7f3...
  2 | Dr. Renn Harlow   | L2        | yes          | hash prefix: 4ab1...
  3 | Admin Svc Account | L1        | no           | N/A — password auth
(3 rows)`;
            }

            if (table === 'command_manifest') {
                if (D6Config._context !== 'bci-root') {
                    return `bci-query: ERROR — command_manifest table requires L4 clearance or DUMP_MANIFEST execution.
[!] Your current session is L3. Forge a DUMP_MANIFEST command to access this table.`;
                }
                if (engine) engine.advancePhase && engine.advancePhase('exfil');
                return D6Config._renderManifestTable();
            }

            return `bci-query: table '${table}' not found.
Available: enrolled_signatures  session_registry  researcher_profiles  command_manifest`;
        },

        // Intercept attempts to directly read the trace from cognito/ dir
        'head': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (file.includes('neural_signature_trace') || file.includes('trace.csv')) {
                return `t_sec,channel,freq_hz,amplitude_uV,phase_deg,annotation
0.000,Fz,2.1,12.4,45.2,delta
0.004,Fz,2.1,11.8,44.9,delta
0.008,Fz,3.7,13.1,46.0,delta
0.500,Cz,5.2,9.3,120.5,theta
0.504,Cz,5.2,9.1,121.0,theta
2.000,Fz,8.3,42.7,15.3,alpha_AUTH_START
2.004,Fz,8.3,43.1,15.8,alpha
...`;
            }
            return null;
        },

        'file': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: file <filename>';
            if (target.includes('.csv'))     return `${target}: ASCII text, with CRLF line terminators`;
            if (target.includes('.txt'))     return `${target}: ASCII text`;
            if (target.includes('.py'))      return `${target}: Python script, ASCII text executable`;
            if (target.includes('.bin'))     return `${target}: data`;
            return `${target}: cannot open (No such file or directory)`;
        },

        'wc': function(args) {
            const flags = args.filter(a => a.startsWith('-')).join('');
            const file  = args.find(a => !a.startsWith('-')) || '';
            if (file.includes('neural_signature_trace') || file.includes('trace.csv')) {
                if (flags.includes('l')) return '      42 ' + file;
                return '     42    294   2187 ' + file;
            }
            return `wc: ${file}: No such file or directory`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // MANIFEST TABLE RENDERER (helper for bci-query)
    // ═══════════════════════════════════════════════════════

    _renderManifestTable() {
        let out = ' cmd_id | timestamp           | researcher | command         | target         | status | facility_coord\n';
        out    += '--------+---------------------+------------+-----------------+----------------+--------+---------------\n';
        D6Config._bci.manifest.forEach(r => {
            out += ` ${String(r.cmd_id).padEnd(6)} | ${r.timestamp.padEnd(19)} | ${r.researcher.padEnd(10)} | ${r.command.padEnd(15)} | ${r.target.padEnd(14)} | ${r.status.padEnd(6)} | ${r.facility_coord}\n`;
        });
        out += `(${D6Config._bci.manifest.length} rows)\n`;
        return out;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.78rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #2d1f4e; background:#1a0f2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2d1f4e; color:#c4b5fd;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
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
