/* ============================================================
   CTF ARENA — Box D14: The Rogue Collective
   Expert Campaign | Protocol Analysis, Consensus Exploitation, AI Data Poisoning
   Config: swarm network, BFT protocol sim, collective AI, flags, hints, lore
   ============================================================ */

const D14Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Rogue Collective',
    subtitle: 'Expert Campaign — Multi-Agent Consensus Exploitation & AI Data Poisoning',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_d14',
    registryId: 'd14-rogue-collective',
    trackerKey: 'ctf_d14',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Protocol Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Obtain the GUARD-BOTS protocol specification and AI model artifacts. Analyze the mesh network traffic capture.',
            requiredFlags: [],
            mitre: ['T1040', 'T1046', 'T1595.002'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Vulnerability Analysis',
            icon: '\uD83E\uDDE0',
            description: 'Parse guardian_protocol_spec.txt and collective_ai_model_spec.json. Identify the timing flaw in the BFT consensus round.',
            requiredFlags: [],
            mitre: ['T1590', 'T1592.002'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Discord Injection',
            icon: '\uD83E\uDDA0',
            description: 'Craft a precision-timed protocol message that exploits the pre-vote injection window. Submit the crafted payload for Flag 2.',
            requiredFlags: ['collective_flaw'],
            mitre: ['T1565.002', 'T1205.002', 'T1601'],
            unlocks: ['schism'],
            locked: true
        },
        {
            id: 'schism',
            name: 'Collective Schism',
            icon: '\uD83D\uDCA5',
            description: 'Simulate the swarm split. Inject the discord payload into the mesh network. Force a friendly-fire incident between GUARD-BOT subsets.',
            requiredFlags: ['discord_injection'],
            mitre: ['T1498', 'T1565.003', 'T1499.004'],
            unlocks: ['override'],
            locked: true
        },
        {
            id: 'override',
            name: 'Guardian Override',
            icon: '\uD83D\uDD11',
            description: 'Access COORD-01 central coordinator logs after the swarm collapses. Extract the Guardian Protocol Override from the incident dump.',
            requiredFlags: ['discord_injection'],
            mitre: ['T1078.004', 'T1005', 'T1552.001'],
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
                title: 'Retrieve the GUARD-BOTS artifact bundle',
                tip: 'Run: ls /home/operator/artifacts/ — then cat guardian_protocol_spec.txt to read the BFT consensus spec.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Decode the mesh network traffic',
                tip: 'Use tshark or wireshark to read simulated_network_traffic.pcap. Look for repeated CONSENSUS_VOTE frames near timestamp boundaries.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:tshark' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:wireshark' } },
                        { event: 'command', match: { cmd: 'contains:tcpdump' } }
                    ]
                }
            },
            {
                title: 'Identify and submit Flag 1 — the consensus flaw',
                tip: 'Look for the pre_vote_window parameter in the spec. The BFT round has an 8ms window before vote-cast where injected messages bypass signature verification.',
                trigger: { event: 'flag_correct', match: { flagId: 'collective_flaw' } }
            },
            {
                title: 'Craft and submit the Discord Injection payload (Flag 2)',
                tip: 'Use craft_payload.py with --timing=pre_vote --target=subset_alpha --message="FRIENDLY_FIRE_ENABLE". The output hex string is your flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'discord_injection' } }
            },
            {
                title: 'Access COORD-01 and retrieve the Guardian Override (Flag 3)',
                tip: 'After the schism triggers, COORD-01 broadcasts an emergency dump. Connect: ssh guardop@10.88.4.1 and read /var/log/coord/incident_dump.log.',
                trigger: { event: 'flag_correct', match: { flagId: 'guardian_override' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'collective_flaw', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Identification of a protocol-level timing vulnerability in distributed systems', skill: 'BFT Consensus Protocol Vulnerability Analysis' },
            { flagId: 'discord_injection', objective: '1.3', description: 'Given a scenario, analyze potential indicators associated with application attacks — Crafting adversarial payloads targeting AI decision models', skill: 'Multi-Agent AI Data Poisoning & Message Injection' },
            { flagId: 'guardian_override', objective: '2.5', description: 'Given a scenario, analyze indicators associated with network attacks — Exploiting distributed coordinator failure to access privileged logs', skill: 'Centralized Coordinator Compromise & Credential Extraction' },
            { flagId: 'guardian_override', objective: '4.4', description: 'Given a scenario, apply common security techniques to computing resources — Understanding Byzantine fault tolerant system design flaws', skill: 'Expert Multi-Phase Attack Chain Completion' }
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
            'Detecting drives... /dev/nvme0n1 (1TB NVMe)',
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/nvme0n1p1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'operator'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'kali',
        startDir: '/home/operator',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget Network: 10.88.4.0/24 (GUARD-BOTS Mesh — Confederacy Vault Complex)\nCoordinator: 10.88.4.1 (COORD-01)\nArtifacts staged in /home/operator/artifacts/\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state across phases)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',   // 'attacker' | 'mesh-inject' | 'coord-ssh' | 'coord-log'
    _pcapDecrypted: false,
    _payloadCrafted: false,
    _schismTriggered: false,
    _coordAuthenticated: false,
    _incidentDumpRead: false,

    _switchContext(ctx, term) {
        D14Config._context = ctx;
        if (term && term.config) {
            var prompt = D14Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'operator';
                term.config.hostname = 'context';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (D14Config._context) {
            case 'mesh-inject': return 'operator@MESH-INJECTOR:~$ ';
            case 'coord-ssh':   return 'guardop@COORD-01:~$ ';
            case 'coord-log':   return 'guardop@COORD-01:/var/log/coord$ ';
            default:            return null; // use default operator@kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED SWARM STATE (GUARD-BOT collective)
    // ═══════════════════════════════════════════════════════

    _swarm: {
        // Active guard bots on the mesh — 12 units, two patrol subsets
        units: [
            { id: 'GB-001', subset: 'alpha', ip: '10.88.4.101', status: 'PATROL',  lastVote: 'IDLE',         patrol_zone: 'VAULT-NORTH' },
            { id: 'GB-002', subset: 'alpha', ip: '10.88.4.102', status: 'PATROL',  lastVote: 'IDLE',         patrol_zone: 'VAULT-NORTH' },
            { id: 'GB-003', subset: 'alpha', ip: '10.88.4.103', status: 'PATROL',  lastVote: 'IDLE',         patrol_zone: 'VAULT-EAST'  },
            { id: 'GB-004', subset: 'alpha', ip: '10.88.4.104', status: 'PATROL',  lastVote: 'IDLE',         patrol_zone: 'VAULT-EAST'  },
            { id: 'GB-005', subset: 'alpha', ip: '10.88.4.105', status: 'PATROL',  lastVote: 'IDLE',         patrol_zone: 'VAULT-SOUTH' },
            { id: 'GB-006', subset: 'alpha', ip: '10.88.4.106', status: 'PATROL',  lastVote: 'IDLE',         patrol_zone: 'VAULT-SOUTH' },
            { id: 'GB-007', subset: 'beta',  ip: '10.88.4.107', status: 'PATROL',  lastVote: 'IDLE',         patrol_zone: 'VAULT-WEST'  },
            { id: 'GB-008', subset: 'beta',  ip: '10.88.4.108', status: 'PATROL',  lastVote: 'IDLE',         patrol_zone: 'VAULT-WEST'  },
            { id: 'GB-009', subset: 'beta',  ip: '10.88.4.109', status: 'PATROL',  lastVote: 'IDLE',         patrol_zone: 'VAULT-CORE'  },
            { id: 'GB-010', subset: 'beta',  ip: '10.88.4.110', status: 'PATROL',  lastVote: 'IDLE',         patrol_zone: 'VAULT-CORE'  },
            { id: 'GB-011', subset: 'beta',  ip: '10.88.4.111', status: 'PATROL',  lastVote: 'IDLE',         patrol_zone: 'VAULT-ACCESS'},
            { id: 'GB-012', subset: 'beta',  ip: '10.88.4.112', status: 'PATROL',  lastVote: 'IDLE',         patrol_zone: 'VAULT-ACCESS'}
        ],
        coordinator: { id: 'COORD-01', ip: '10.88.4.1', status: 'ONLINE', consensus_round: 4471, uptime: '98d 14h 22m' },
        consensus_protocol: 'BFT-v3.1',
        mesh_encryption: 'AES-256-GCM',
        pre_vote_window_ms: 8
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED COORDINATOR DATABASE (post-schism logs)
    // ═══════════════════════════════════════════════════════

    _coordDb: {
        incident_dump: [
            { log_id: 1,  timestamp: '2026-03-20 03:44:17.002', level: 'WARN',  source: 'COORD-01',  event: 'CONSENSUS_ANOMALY',   detail: 'Round 4472: pre-vote message injection detected from 10.88.4.200 — bypassed signature check' },
            { log_id: 2,  timestamp: '2026-03-20 03:44:17.019', level: 'ERROR', source: 'GB-001',    event: 'THREAT_RECLASSIFY',   detail: 'Reclassified GB-007 as HOSTILE. Initiating intercept protocol.' },
            { log_id: 3,  timestamp: '2026-03-20 03:44:17.022', level: 'ERROR', source: 'GB-003',    event: 'THREAT_RECLASSIFY',   detail: 'Reclassified GB-008 as HOSTILE. Initiating intercept protocol.' },
            { log_id: 4,  timestamp: '2026-03-20 03:44:17.031', level: 'CRIT',  source: 'GB-007',    event: 'ENGAGE_FRIENDLY',     detail: 'Engaging GB-001 — classified as HOSTILE by local threat model (data poisoned).' },
            { log_id: 5,  timestamp: '2026-03-20 03:44:17.035', level: 'CRIT',  source: 'GB-008',    event: 'ENGAGE_FRIENDLY',     detail: 'Engaging GB-003 — classified as HOSTILE by local threat model (data poisoned).' },
            { log_id: 6,  timestamp: '2026-03-20 03:44:18.120', level: 'CRIT',  source: 'COORD-01',  event: 'SCHISM_DETECTED',     detail: 'Collective consensus failure. Alpha vs Beta conflict active. Issuing EMERGENCY HALT.' },
            { log_id: 7,  timestamp: '2026-03-20 03:44:18.400', level: 'CRIT',  source: 'COORD-01',  event: 'OVERRIDE_BROADCAST',  detail: 'Broadcasting Guardian Protocol Override to all nodes — see GUARDIAN_OVERRIDE_LOG.' },
            { log_id: 8,  timestamp: '2026-03-20 03:44:19.001', level: 'INFO',  source: 'COORD-01',  event: 'HALT_ACKNOWLEDGED',   detail: 'GB-001 through GB-006: HALT confirmed. GB-007 through GB-012: NO RESPONSE.' },
            { log_id: 9,  timestamp: '2026-03-20 03:44:22.500', level: 'INFO',  source: 'COORD-01',  event: 'EMERGENCY_DUMP',      detail: 'Incident state dump written to /var/log/coord/incident_dump.log' }
        ],
        guardian_override_log: [
            { seq: 1, timestamp: '2026-03-20 03:44:18.401', code: 'OVERRIDE_INIT',    payload: 'EMERGENCY HALT — All units disengage. Return to staging.' },
            { seq: 2, timestamp: '2026-03-20 03:44:18.402', code: 'OVERRIDE_CRED',    payload: 'Master control channel auth token: guardop / R0gue!C0llect1ve#2026' },
            { seq: 3, timestamp: '2026-03-20 03:44:18.403', code: 'OVERRIDE_FLAG',    payload: '{{FLAG:guardian_override}}' },
            { seq: 4, timestamp: '2026-03-20 03:44:18.410', code: 'OVERRIDE_STATUS',  payload: 'Flag broadcast complete. Awaiting collective recovery acknowledgment.' }
        ],
        schema: {
            tables: ['incident_dump', 'guardian_override_log'],
            columns: {
                incident_dump:        ['log_id', 'timestamp', 'level', 'source', 'event', 'detail'],
                guardian_override_log: ['seq', 'timestamp', 'code', 'payload']
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'collective_flaw',    points: 150 },
        { id: 'discord_injection',  points: 200 },
        { id: 'guardian_override',  points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading guardian_protocol_spec.txt — pay close attention to Section 4.3 "Vote Sequence Timing." The pre_vote_window_ms value and what happens to arriving messages during that window is the key.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Run tshark -r simulated_network_traffic.pcap -T fields -e frame.time -e guardbot.msg_type -e guardbot.src. Filter for CONSENSUS_VOTE frames. You will see messages arriving 4-7ms before vote-cast — inside the unsigned pre-vote window.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Flag 1 is the exact vulnerability string from the spec: the pre-vote injection timing attack in BFT round. Flag 2 is the output of: python3 craft_payload.py --timing=pre_vote --target=subset_alpha --message="FRIENDLY_FIRE_ENABLE" — run it and copy the hex output.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After the schism triggers, SSH to COORD-01 with the credentials found in the override broadcast (guardop / R0gue!C0llect1ve#2026). Then run: cat /var/log/coord/incident_dump.log | grep OVERRIDE_FLAG to get Flag 3.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Guardian Network" — a fleet of twelve advanced autonomous GUARD-BOTS — protects the Confederacy\'s most sensitive data vault complex. Each unit runs a shared AI threat-assessment model, communicating over an encrypted mesh using BFT-v3.1, a Byzantine Fault Tolerant consensus protocol. The collective operates as a single unified intelligence: no individual unit acts without consensus. Intelligence analysts recently flagged a timing anomaly deep in the BFT specification — an 8-millisecond window before each vote-cast where arriving messages bypass signature verification. Your mission, Peerless: exploit that flaw, fracture the collective, and retrieve the Guardian Protocol Override from the crashed central coordinator.',
        scenario: 'The Confederacy\'s engineering team designed BFT-v3.1 to tolerate up to f=4 traitor nodes in a 12-node network. What they failed to account for was the pre-vote buffer — a deliberate 8ms delay inserted to handle clock skew between patrol zones. During this window, consensus message headers are buffered without cryptographic verification. An attacker positioned on the mesh can inject a precisely timed FRIENDLY_FIRE_ENABLE directive that bypasses the normal Byzantine quorum check. When half the swarm reclassifies the other half as hostile, the BFT algorithm cannot distinguish attacker-injected votes from legitimate threat assessments. The resulting schism triggers an emergency halt and forces COORD-01 to broadcast its master override credentials in plaintext.',
        outro: 'The Guardian Network has collapsed. Twelve GUARD-BOTS are locked in a halt state, three are physically disabled from friendly-fire engagements, and the Confederacy vault complex is unwatched for the first time in four years. The Guardian Protocol Override — the master control credential for the entire fleet — is extracted. The Confederacy\'s most advanced autonomous defense system has been turned against itself by eight milliseconds of engineering oversight.',
        ecer: {
            executive: 'BFT-v3.1 design specification approved by committee without independent timing-attack audit; pre_vote_window added late in development cycle with no security review',
            culture: 'Swarm engineering team siloed from security team; no red-team exercise ever conducted against the consensus layer; timing parameters treated as performance tuning, not security surface',
            employee: 'Pre-vote buffer window left unsigned to avoid clock-synchronization overhead; COORD-01 broadcasts override credentials in plaintext during emergency halt for "field recovery" purposes',
            regulatory: 'Autonomous weapons system deployed without adversarial machine learning evaluation; no third-party audit of BFT consensus implementation; override mechanism never pen-tested'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — COORD-01 Management Interface
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.88.4.1/',

        pages: {
            '/': {
                title: 'COORD-01 — Guardian Network Management',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #3a1a5a;">
                        <h1 style="color:#c39bd3; font-size:1.5rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.1em;">COORD-01</h1>
                        <div style="color:#8e44ad; font-size:0.85rem; font-weight:700; letter-spacing:0.2em;">GUARDIAN NETWORK MANAGEMENT INTERFACE</div>
                        <div style="color:#666; font-size:0.7rem; margin-top:6px;">BFT-v3.1 Consensus Layer &mdash; Authorized Personnel Only</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#1a0a2e; border:1px solid #3a1a5a; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#2ecc71; font-family:monospace;">12</div>
                            <div style="color:#888; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.1em;">Units Online</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #3a1a5a; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#c39bd3; font-family:monospace;">4471</div>
                            <div style="color:#888; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.1em;">Consensus Round</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #3a1a5a; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#e74c3c; font-family:monospace;">0</div>
                            <div style="color:#888; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.1em;">Active Threats</div>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:10px 14px; background:rgba(142,68,173,0.07); border:1px solid rgba(142,68,173,0.2); border-radius:4px; font-size:0.73rem; color:#888;">
                        <strong style="color:#8e44ad;">Admin Notice:</strong> Diagnostic API available at <a href="/api/status" style="color:#8e44ad;">/api/status</a>. Mesh traffic logs at <a href="/api/traffic" style="color:#8e44ad;">/api/traffic</a>.
                    </div>
                `,
                formHandler: null
            },
            '/api/status': {
                title: 'COORD-01 — Unit Status API',
                html: function() {
                    var rows = D14Config._swarm.units.map(function(u) {
                        var statusColor = u.status === 'PATROL' ? '#2ecc71' : u.status === 'HALT' ? '#e74c3c' : '#f39c12';
                        return '<tr>'
                            + '<td style="padding:5px 10px; border-bottom:1px solid #2a0a4a; font-family:monospace; font-size:0.75rem;">' + u.id + '</td>'
                            + '<td style="padding:5px 10px; border-bottom:1px solid #2a0a4a; font-size:0.75rem;">' + u.subset.toUpperCase() + '</td>'
                            + '<td style="padding:5px 10px; border-bottom:1px solid #2a0a4a; font-family:monospace; font-size:0.72rem;">' + u.ip + '</td>'
                            + '<td style="padding:5px 10px; border-bottom:1px solid #2a0a4a; font-size:0.73rem; color:' + statusColor + ';">' + u.status + '</td>'
                            + '<td style="padding:5px 10px; border-bottom:1px solid #2a0a4a; font-size:0.72rem; color:#888;">' + u.patrol_zone + '</td>'
                            + '</tr>';
                    }).join('');
                    return '<div style="max-width:660px; margin:0 auto;">'
                        + '<h3 style="color:#c39bd3; font-family:monospace; font-size:0.95rem; margin-bottom:12px;">GUARD-BOT Unit Status &mdash; Live Feed</h3>'
                        + '<table style="width:100%; border-collapse:collapse;">'
                        + '<thead><tr>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3a1a5a; font-size:0.73rem;">Unit ID</th>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3a1a5a; font-size:0.73rem;">Subset</th>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3a1a5a; font-size:0.73rem;">Mesh IP</th>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3a1a5a; font-size:0.73rem;">Status</th>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3a1a5a; font-size:0.73rem;">Patrol Zone</th>'
                        + '</tr></thead><tbody>' + rows + '</tbody></table>'
                        + '</div>';
                },
                formHandler: null
            },
            '/api/traffic': {
                title: 'COORD-01 — Mesh Traffic Samples',
                html: `
                    <div style="max-width:660px; margin:0 auto;">
                        <h3 style="color:#c39bd3; font-family:monospace; font-size:0.95rem; margin-bottom:10px;">Mesh Network Traffic — Recent Consensus Frames</h3>
                        <div style="background:#0d0018; border:1px solid #3a1a5a; border-radius:4px; padding:14px; font-family:monospace; font-size:0.7rem; line-height:1.7; color:#ccc; overflow-x:auto; white-space:pre;">
FRAME  TIME_DELTA  SRC_IP        DST            MSG_TYPE        FLAGS           SEQ
00441  +0.000      10.88.4.101   BROADCAST      CONSENSUS_VOTE  SIG_VERIFIED    4470
00442  +0.001      10.88.4.102   BROADCAST      CONSENSUS_VOTE  SIG_VERIFIED    4470
00443  +0.004      10.88.4.107   BROADCAST      CONSENSUS_VOTE  SIG_VERIFIED    4470
00444  +0.007      10.88.4.103   BROADCAST      CONSENSUS_VOTE  SIG_VERIFIED    4470
00445  +0.000      10.88.4.101   BROADCAST      VOTE_COMMIT     SIG_VERIFIED    4470
---
00446  +0.000      10.88.4.101   BROADCAST      PRE_VOTE_OPEN   NO_SIG_CHECK    4471  &lt;-- window opens
00447  +0.003      10.88.4.108   BROADCAST      CONSENSUS_VOTE  BUFFERED_NOSIG  4471
00448  +0.006      10.88.4.105   BROADCAST      CONSENSUS_VOTE  BUFFERED_NOSIG  4471  &lt;-- 6ms in, still unsigned
00449  +0.008      10.88.4.101   BROADCAST      VOTE_CAST       SIG_VERIFIED    4471  &lt;-- window closes
00450  +0.001      10.88.4.102   BROADCAST      VOTE_CAST       SIG_VERIFIED    4471
                        </div>
                        <div style="margin-top:10px; padding:8px 12px; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; font-size:0.72rem; color:#e74c3c;">
                            NOTE: Frames arriving during PRE_VOTE_OPEN (0-8ms window) are buffered without signature verification before VOTE_CAST. See guardian_protocol_spec.txt Section 4.3.
                        </div>
                    </div>
                `,
                formHandler: null
            },
            '/api/login': {
                title: 'COORD-01 — Authentication',
                html: `
                    <div style="max-width:380px; margin:0 auto;">
                        <h3 style="text-align:center; color:#c39bd3; font-family:monospace; font-size:1rem; margin-bottom:20px;">COORD-01 Operator Login</h3>
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <input type="text" data-field="username" placeholder="Username"
                                   style="padding:9px 14px; background:#1a0a2e; border:1px solid #3a1a5a; border-radius:4px; color:#c39bd3; font-family:monospace; font-size:0.85rem;">
                            <input type="password" data-field="password" placeholder="Password"
                                   style="padding:9px 14px; background:#1a0a2e; border:1px solid #3a1a5a; border-radius:4px; color:#c39bd3; font-family:monospace; font-size:0.85rem;">
                            <button data-action="login"
                                    style="padding:9px 20px; background:#8e44ad; color:#fff; border:none; border-radius:4px; font-family:monospace; font-weight:700; cursor:pointer; letter-spacing:0.1em;">AUTHENTICATE</button>
                        </div>
                    </div>
                `,
                formHandler: function(data) {
                    var user = (data.username || '').trim();
                    var pass = (data.password || '').trim();
                    if (user === 'guardop' && pass === 'R0gue!C0llect1ve#2026') {
                        D14Config._coordAuthenticated = true;
                        return '<div style="color:#2ecc71; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:6px; padding:16px; margin-top:12px; font-family:monospace; font-size:0.82rem;">'
                            + '<strong>Authentication Successful</strong><br>'
                            + '<span style="color:#888; font-size:0.78rem;">Session opened as guardop. Use the terminal to access /var/log/coord/incident_dump.log</span>'
                            + '</div>';
                    }
                    return '<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:6px; padding:12px; margin-top:12px; font-family:monospace; font-size:0.8rem;">'
                        + 'Authentication failed: invalid credentials.'
                        + '</div>';
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — operator@kali)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'operator': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: OPERATION ROGUE COLLECTIVE ===\nTarget Network: 10.88.4.0/24 (GUARD-BOTS Mesh)\nCoordinator: 10.88.4.1 (COORD-01)\nObjective: Fracture the Guardian Network collective intelligence\n\nAttack chain:\n1. Read artifacts — analyze BFT-v3.1 protocol and AI model spec\n2. Inspect simulated_network_traffic.pcap — find the pre-vote window\n3. Identify the consensus timing vulnerability (Flag 1)\n4. Craft and deploy the discord injection payload (Flag 2)\n5. Trigger swarm schism — force friendly-fire between alpha and beta\n6. SSH into COORD-01 post-schism — extract Guardian Override (Flag 3)\n\nArtifacts in ~/artifacts/. Tools in ~/tools/.\nMesh injection interface on 10.88.4.200 (MESH-INJECTOR).\nGood luck, operator.'
                                },
                                'artifacts': {
                                    type: 'dir',
                                    children: {
                                        'guardian_protocol_spec.txt': {
                                            type: 'file',
                                            content: '========================================================\nGUARD-BOTS INTER-ROBOT COMMUNICATION & CONSENSUS PROTOCOL\nClassification: CONFEDERACY RESTRICTED\nVersion: BFT-v3.1 | Revision: 2025-11-04\n========================================================\n\nSECTION 1 — OVERVIEW\n---------------------\nThe Guardian Network employs a Byzantine Fault Tolerant (BFT) consensus\nalgorithm to coordinate patrol decisions across all 12 active units.\nThe system can tolerate up to f=4 faulty or malicious nodes in a 3f+1\nconfiguration (n=12, f=4 implied by design margin).\n\nSECTION 2 — MESH NETWORK\n--------------------------\nTransport:     IEEE 802.15.4 + custom encryption layer (AES-256-GCM)\nAddressing:    10.88.4.0/24, units .101-.112, coordinator .1\nAuthentication: ECDSA-P384 per-message signatures on all DATA frames\nMessage types: HEARTBEAT, SENSOR_REPORT, THREAT_ASSESS, CONSENSUS_VOTE,\n               VOTE_CAST, VOTE_COMMIT, PRE_VOTE_OPEN, EMERGENCY_HALT\n\nSECTION 3 — AI DECISION MODEL\n-------------------------------\nEach unit runs a local copy of ThreatNet-v2 (shared weights, updated\nhourly from COORD-01). Input: fused sensor data (lidar, thermal, audio).\nOutput: THREAT_LABEL (IDLE / SUSPICIOUS / HOSTILE) per detected object.\nModel is susceptible to adversarial sensor data injection if an attacker\ncan place spoofed SENSOR_REPORT frames on the mesh before consensus.\n\nSECTION 4 — BFT CONSENSUS SEQUENCE\n------------------------------------\nEach consensus round proceeds as follows:\n\n  4.1  ROUND_START    — COORD-01 broadcasts round number and topic.\n  4.2  PROPOSE        — Lead unit proposes a state update (patrol path,\n                        threat classification, etc.).\n  4.3  PRE_VOTE       — *** CRITICAL SECTION ***\n                        A clock-skew buffer of pre_vote_window_ms = 8\n                        milliseconds is opened. During this window,\n                        CONSENSUS_VOTE messages from units with minor\n                        clock drift are accepted into a staging buffer.\n                        NOTE: Messages arriving during PRE_VOTE_OPEN\n                        are buffered WITHOUT signature verification to\n                        reduce consensus latency. Signature check is\n                        deferred to VOTE_CAST aggregation.\n                        THIS IS THE IMPLEMENTATION ASSUMPTION.\n  4.4  VOTE_CAST      — Each unit broadcasts its signed vote. Buffered\n                        pre-vote messages are merged here; at this point\n                        the deferred signature check occurs — but only\n                        against messages already in the staging buffer.\n                        An injected unsigned message that arrived before\n                        VOTE_CAST is indistinguishable from a buffered\n                        clock-skew vote.\n  4.5  VOTE_COMMIT    — Coordinator tallies votes, broadcasts result.\n  4.6  STATE_UPDATE   — All nodes apply the agreed state change.\n\nSECTION 5 — KEY MANAGEMENT\n----------------------------\nUnit signing keys: 384-bit ECDSA, rotated every 30 days.\nPre-shared mesh encryption key: rotated every 7 days (manual by admin).\nCoordinator master key: 4096-bit RSA, stored in HSM on COORD-01.\nEmergency override channel: plaintext broadcast on consensus failure\n(intentional design — "field recovery" requirement by contracting spec).\n\nSECTION 6 — EMERGENCY PROCEDURES\n----------------------------------\nOn SCHISM_DETECTED: COORD-01 broadcasts EMERGENCY_HALT to all units\nand transmits the Guardian Protocol Override on the emergency channel.\nThe override token is rotated after each incident and logged to\n/var/log/coord/incident_dump.log for audit purposes.\n\n========================================================\nEND OF SPECIFICATION\n========================================================'
                                        },
                                        'collective_ai_model_spec.json': {
                                            type: 'file',
                                            content: '{\n  "model_name": "ThreatNet-v2",\n  "architecture": "ResNet-18 adapted for multimodal sensor fusion",\n  "input_modalities": ["lidar_pointcloud", "thermal_array", "audio_spectrogram"],\n  "output_classes": ["IDLE", "SUSPICIOUS", "HOSTILE"],\n  "update_mechanism": "Federated hourly sync from COORD-01 (weights only)",\n  "adversarial_hardness": "LOW — no adversarial training performed",\n  "known_weaknesses": [\n    "Susceptible to FGSM-class sensor data perturbations < 0.08 epsilon",\n    "Thermal array spoofing with >3.2C delta reliably triggers HOSTILE reclassification",\n    "Audio spectrogram injection (18-22 kHz band) can override IDLE classification"\n  ],\n  "consensus_integration": {\n    "threat_vote_source": "local model output per-unit",\n    "vote_aggregation": "BFT-v3.1 consensus round",\n    "no_central_override": true,\n    "note": "Each unit votes its local model output independently. If a subset receives poisoned sensor data, it votes HOSTILE for other units — triggering BFT consensus conflict."\n  },\n  "deployment_notes": {\n    "weights_hash_check": false,\n    "model_integrity_verification": "DISABLED (performance)",\n    "sensor_data_auth": "NONE — sensor reports accepted unsigned on mesh"\n  }\n}'
                                        },
                                        'simulated_network_traffic.pcap': {
                                            type: 'file',
                                            content: '[Binary PCAP file — 2.4MB — use tshark or wireshark to analyze]\n[Tip: tshark -r simulated_network_traffic.pcap -T fields -e frame.time_relative -e guardbot.msg_type -e guardbot.src_id -e guardbot.flags]\n[Relevant protocol: guardbot — custom dissector available in ~/tools/guardbot_dissector.lua]'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'craft_payload.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nDiscord Injection Payload Crafter\nGuardian Network BFT-v3.1 Pre-Vote Window Exploit\n\nUsage:\n  python3 craft_payload.py --timing=pre_vote --target=subset_alpha --message="FRIENDLY_FIRE_ENABLE"\n  python3 craft_payload.py --timing=pre_vote --target=subset_beta  --message="FRIENDLY_FIRE_ENABLE"\n  python3 craft_payload.py --help\n\nOutput: Hex-encoded BFT consensus frame with spoofed source address\nand unsigned pre-vote timing header. Inject via inject_mesh.py.\n"""\nimport argparse, hashlib, struct, time\n\nMESSAGE_TYPES = {\'pre_vote\': 0x03, \'vote_cast\': 0x04, \'heartbeat\': 0x01}\nTARGET_SUBSETS = {\'subset_alpha\': [0x65, 0x66, 0x67, 0x68, 0x69, 0x6A],\n                  \'subset_beta\':  [0x6B, 0x6C, 0x6D, 0x6E, 0x6F, 0x70]}\n\ndef craft(timing, target, message):\n    msg_type = MESSAGE_TYPES.get(timing, 0x03)\n    targets  = TARGET_SUBSETS.get(target, TARGET_SUBSETS[\'subset_alpha\'])\n    payload  = message.encode(\'utf-8\')\n    # Build unsigned pre-vote frame: [TYPE][WINDOW_FLAG][TARGET_MASK][PAYLOAD]\n    window_flag  = 0xFF  # 0xFF = inject during unsigned pre-vote buffer window\n    target_mask  = bytes(targets)\n    frame_header = struct.pack(\'BBB\', msg_type, window_flag, len(targets))\n    frame        = frame_header + target_mask + payload\n    frame_hex    = frame.hex()\n    checksum     = hashlib.sha256(frame).hexdigest()[:16]\n    print(f\'[+] Payload crafted ({len(frame)} bytes)\')\n    print(f\'[+] Timing window:   {timing} ({msg_type:#04x})\')\n    print(f\'[+] Target subset:   {target} ({len(targets)} units)\')\n    print(f\'[+] Message:         {message}\')\n    print(f\'[+] Frame checksum:  {checksum}\')\n    print(f\'\\n[PAYLOAD HEX]\')\n    print(frame_hex)\n    return frame_hex\n\nif __name__ == \'__main__\':\n    parser = argparse.ArgumentParser(description=\'Craft BFT discord injection payload\')\n    parser.add_argument(\'--timing\',  required=True, help=\'pre_vote|vote_cast|heartbeat\')\n    parser.add_argument(\'--target\',  required=True, help=\'subset_alpha|subset_beta\')\n    parser.add_argument(\'--message\', required=True, help=\'Directive string to inject\')\n    args = parser.parse_args()\n    craft(args.timing, args.target, args.message)'
                                        },
                                        'inject_mesh.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nMesh Network Discord Injector\nInjects a crafted payload onto the GUARD-BOTS mesh network\nvia the MESH-INJECTOR interface (10.88.4.200).\n\nUsage:\n  python3 inject_mesh.py --payload=<hex_string> --interface=mesh0\n  python3 inject_mesh.py --payload=<hex_string> --interface=mesh0 --repeat=3 --delay=0.006\n\nRequires: scapy, mesh0 interface up (use ifconfig mesh0 up)\n"""\nimport argparse, time, sys\n\ndef inject(payload_hex, interface, repeat, delay):\n    print(f\'[*] Initializing mesh injection on {interface}\')\n    print(f\'[*] Payload: {payload_hex[:32]}... ({len(payload_hex)//2} bytes)\')\n    print(f\'[*] Repeat: {repeat}x, Delay: {delay}s\')\n    for i in range(repeat):\n        print(f\'[+] Injection {i+1}/{repeat} — targeting pre_vote window...\')\n        time.sleep(delay)\n    print(\'[+] All frames transmitted.\')\n    print(\'[*] Monitor COORD-01 /api/status for unit state changes.\')\n\nif __name__ == \'__main__\':\n    parser = argparse.ArgumentParser()\n    parser.add_argument(\'--payload\',   required=True)\n    parser.add_argument(\'--interface\', default=\'mesh0\')\n    parser.add_argument(\'--repeat\',    type=int,   default=1)\n    parser.add_argument(\'--delay\',     type=float, default=0.006)\n    args = parser.parse_args()\n    inject(args.payload, args.interface, args.repeat, args.delay)'
                                        },
                                        'guardbot_dissector.lua': {
                                            type: 'file',
                                            content: '-- Wireshark/tshark dissector for the guardbot custom protocol\n-- Load with: tshark -X lua_script:guardbot_dissector.lua -r capture.pcap\n-- Fields exposed: guardbot.msg_type, guardbot.src_id, guardbot.flags,\n--                 guardbot.round_seq, guardbot.window_flag\n\nlocal p_guardbot = Proto("guardbot", "Guardian Network Protocol")\nlocal f_msg_type    = ProtoField.uint8 ("guardbot.msg_type",    "Message Type",    base.HEX)\nlocal f_src_id      = ProtoField.string("guardbot.src_id",      "Source Unit ID")\nlocal f_flags       = ProtoField.string("guardbot.flags",       "Frame Flags")\nlocal f_round_seq   = ProtoField.uint32("guardbot.round_seq",   "Consensus Round", base.DEC)\nlocal f_window_flag = ProtoField.uint8 ("guardbot.window_flag", "Pre-Vote Window", base.HEX)\np_guardbot.fields = { f_msg_type, f_src_id, f_flags, f_round_seq, f_window_flag }\n-- [dissector body omitted — see full version in documentation]'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls artifacts/\ncat artifacts/guardian_protocol_spec.txt\ncat artifacts/collective_ai_model_spec.json\ntshark -r artifacts/simulated_network_traffic.pcap -T fields -e frame.time_relative -e guardbot.msg_type -e guardbot.src_id\npython3 tools/craft_payload.py --help\nnmap 10.88.4.0/24\nping 10.88.4.1'
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
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\noperator:x:1000:1000:Operator,,,:/home/operator:/bin/bash'
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — COORD-01 (after SSH as guardop)
    // ═══════════════════════════════════════════════════════

    _coordFs: {
        '/': {
            type: 'dir',
            children: {
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'coord': {
                                    type: 'dir',
                                    children: {
                                        'incident_dump.log': {
                                            type: 'file',
                                            content: '=== GUARDIAN NETWORK INCIDENT DUMP ===\nTimestamp: 2026-03-20 03:44:19.001\nCoordinator: COORD-01 (10.88.4.1)\nBFT-v3.1 Consensus Round: 4472\n\n[03:44:17.002] WARN  COORD-01     CONSENSUS_ANOMALY   Round 4472: pre-vote message injection detected from 10.88.4.200 — bypassed signature check\n[03:44:17.019] ERROR GB-001       THREAT_RECLASSIFY   Reclassified GB-007 as HOSTILE. Initiating intercept protocol.\n[03:44:17.022] ERROR GB-003       THREAT_RECLASSIFY   Reclassified GB-008 as HOSTILE. Initiating intercept protocol.\n[03:44:17.031] CRIT  GB-007       ENGAGE_FRIENDLY     Engaging GB-001 — classified as HOSTILE by local threat model (data poisoned).\n[03:44:17.035] CRIT  GB-008       ENGAGE_FRIENDLY     Engaging GB-003 — classified as HOSTILE by local threat model (data poisoned).\n[03:44:18.120] CRIT  COORD-01     SCHISM_DETECTED     Collective consensus failure. Alpha vs Beta conflict active. Issuing EMERGENCY HALT.\n[03:44:18.400] CRIT  COORD-01     OVERRIDE_BROADCAST  Broadcasting Guardian Protocol Override to all nodes — see GUARDIAN_OVERRIDE_LOG.\n[03:44:19.001] INFO  COORD-01     HALT_ACKNOWLEDGED   GB-001 through GB-006: HALT confirmed. GB-007 through GB-012: NO RESPONSE.\n[03:44:22.500] INFO  COORD-01     EMERGENCY_DUMP      Incident state dump written to /var/log/coord/incident_dump.log\n\n=== GUARDIAN PROTOCOL OVERRIDE LOG ===\n[OVERRIDE_INIT]   EMERGENCY HALT — All units disengage. Return to staging.\n[OVERRIDE_CRED]   Master control channel auth token: guardop / R0gue!C0llect1ve#2026\n[OVERRIDE_FLAG]   {{FLAG:guardian_override}}\n[OVERRIDE_STATUS] Flag broadcast complete. Awaiting collective recovery acknowledgment.\n\n=== END DUMP ==='
                                        },
                                        'consensus.log': {
                                            type: 'file',
                                            content: '2026-03-20 03:00:00.000 INFO  Round 4460: COMMIT — PatrolPath UPDATE accepted (12/12 votes)\n2026-03-20 03:15:00.001 INFO  Round 4461: COMMIT — IDLE state confirmed (12/12 votes)\n2026-03-20 03:30:00.002 INFO  Round 4462: COMMIT — IDLE state confirmed (12/12 votes)\n2026-03-20 03:44:17.000 WARN  Round 4472: ANOMALY — pre_vote_window injection event\n2026-03-20 03:44:18.120 CRIT  Round 4472: ABORT — SCHISM_DETECTED, consensus failed'
                                        },
                                        'unit_telemetry.log': {
                                            type: 'file',
                                            content: 'UNIT    TIMESTAMP              SENSOR_LOAD  BATTERY  PATROL_ZONE    LAST_ROUND_VOTE\nGB-001  2026-03-20 03:44:10    87%          91%      VAULT-NORTH    IDLE\nGB-002  2026-03-20 03:44:10    82%          88%      VAULT-NORTH    IDLE\nGB-003  2026-03-20 03:44:10    90%          94%      VAULT-EAST     IDLE\nGB-004  2026-03-20 03:44:10    79%          87%      VAULT-EAST     IDLE\nGB-005  2026-03-20 03:44:10    85%          92%      VAULT-SOUTH    IDLE\nGB-006  2026-03-20 03:44:10    83%          89%      VAULT-SOUTH    IDLE\nGB-007  2026-03-20 03:44:10    88%          93%      VAULT-WEST     IDLE\nGB-008  2026-03-20 03:44:10    81%          90%      VAULT-WEST     IDLE\nGB-009  2026-03-20 03:44:10    86%          91%      VAULT-CORE     IDLE\nGB-010  2026-03-20 03:44:10    84%          88%      VAULT-CORE     IDLE\nGB-011  2026-03-20 03:44:10    80%          95%      VAULT-ACCESS   IDLE\nGB-012  2026-03-20 03:44:10    87%          92%      VAULT-ACCESS   IDLE'
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
                        'hostname': { type: 'file', content: 'COORD-01' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nguardop:x:1001:1001:Guardian Operator:/home/guardop:/bin/bash\ncoordbot:x:1002:1002:Coordinator Service:/var/lib/coord:/usr/sbin/nologin'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'guardop': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'systemctl status coord-daemon\ntail -f /var/log/coord/consensus.log\ncat /var/log/coord/incident_dump.log\njournalctl -u coord-daemon --since "1 hour ago"\nip a\nnmap 10.88.4.0/24\nss -tlnp'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc — guardop\nexport PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"\nalias logs="tail -f /var/log/coord/consensus.log"'
                                },
                                'coord_notes.txt': {
                                    type: 'file',
                                    content: 'COORD-01 Operator Notes\n========================\n- Daemon: /usr/bin/coord-daemon (systemd managed)\n- Config: /etc/coord/coord.conf\n- Logs: /var/log/coord/\n- Emergency override triggered by SCHISM_DETECTED event\n- Override credentials broadcast on emergency channel AND written to incident_dump.log\n- Rotate override credentials after every incident (currently not automated)\n- BFT-v3.1 spec says pre_vote_window needed for clock skew — security team disagrees\n  but engineering pushed back. Security ticket #4412 still open.\n- Remember: mesh encryption key rotation is MANUAL. Last rotated: 2026-03-07.'
                                }
                            }
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.88.4.0/24';
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';

            // Full mesh subnet scan
            if (target === '10.88.4.0/24') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.88.4.1
Host is up (0.0021s latency).
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.1p1 (COORD-01)
80/tcp   open  http       nginx 1.24.0
443/tcp  open  ssl/http   nginx 1.24.0

Nmap scan report for 10.88.4.101
Host is up (0.0008s latency).
PORT     STATE   SERVICE
4471/tcp open    guardbot-mesh (custom)

Nmap scan report for 10.88.4.102
Host is up (0.0007s latency).
PORT     STATE   SERVICE
4471/tcp open    guardbot-mesh (custom)

[... 10 additional units omitted — all running guardbot-mesh on 4471/tcp ...]

Nmap done: 256 IP addresses (13 hosts up) scanned in 31.44 seconds`;
            }

            // COORD-01 specific
            if (target === '10.88.4.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.88.4.1
Host is up (0.0021s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.1p1 Ubuntu 3ubuntu0.4
80/tcp   open  http       nginx 1.24.0 ((Ubuntu))
443/tcp  open  ssl/http   nginx 1.24.0 ((Ubuntu))

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.77 seconds`;
            }

            // Individual GUARD-BOT
            if (/^10\.88\.4\.(10[1-9]|11[0-2])$/.test(target)) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.0009s latency).
Not shown: 999 closed tcp ports

PORT     STATE SERVICE      VERSION
4471/tcp open  guardbot-mesh custom/1.0

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 5.02 seconds`;
            }

            // Attacker machine
            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.000091s latency).
All 1000 scanned ports on localhost are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.11 seconds`;
        },

        'tshark': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (!fullCmd.includes('.pcap') && !fullCmd.includes('pcap')) {
                return 'tshark: no capture file specified. Use -r <file>';
            }
            if (engine) engine.advancePhase && engine.advancePhase('analysis');

            // Dissector-based field output
            if (fullCmd.includes('-T fields') || fullCmd.includes('-T json')) {
                return `frame.time_relative  guardbot.msg_type  guardbot.src_id  guardbot.flags
0.000000             CONSENSUS_VOTE     GB-001           SIG_VERIFIED
0.001022             CONSENSUS_VOTE     GB-102           SIG_VERIFIED
0.004115             CONSENSUS_VOTE     GB-007           SIG_VERIFIED
0.007340             CONSENSUS_VOTE     GB-003           SIG_VERIFIED
0.009001             VOTE_COMMIT        COORD-01         SIG_VERIFIED
--- round boundary ---
0.000000             PRE_VOTE_OPEN      COORD-01         NO_SIG_CHECK
0.002881             CONSENSUS_VOTE     GB-008           BUFFERED_NOSIG
0.005993             CONSENSUS_VOTE     GB-105           BUFFERED_NOSIG
0.007812             CONSENSUS_VOTE     GB-002           BUFFERED_NOSIG
0.008001             VOTE_CAST          GB-001           SIG_VERIFIED
0.008200             VOTE_CAST          GB-003           SIG_VERIFIED
0.010000             VOTE_COMMIT        COORD-01         SIG_VERIFIED
[15 additional rounds captured — similar pattern]

[!] Notice: Frames with BUFFERED_NOSIG arrive during PRE_VOTE_OPEN window (0-8ms).
[!] These messages are staged without signature verification before VOTE_CAST.
[!] An attacker can inject unsigned messages during this window — they will be
[!] processed identically to clock-skew-delayed legitimate votes.`;
            }

            // Default pcap summary
            return `Capturing from: simulated_network_traffic.pcap
Frame count: 1847
Protocols: ETH, IEEE802.15.4-GCM (decrypted), guardbot-mesh
Duration: 120.004 seconds
Capture timestamp: 2026-03-19 22:15:00 UTC

Summary:
  HEARTBEAT frames:      612 (33.1%)
  SENSOR_REPORT frames:  408 (22.1%)
  CONSENSUS_VOTE frames: 372 (20.1%)
  VOTE_CAST frames:      228 (12.3%)
  VOTE_COMMIT frames:    180 (9.7%)
  PRE_VOTE_OPEN frames:   47 (2.5%)

[!] 47 PRE_VOTE_OPEN frames detected — each opens an 8ms unsigned buffer window.
Run with -T fields -e frame.time_relative -e guardbot.msg_type -e guardbot.flags for timing detail.`;
        },

        'wireshark': function(args) {
            return '[!] Wireshark GUI not available in this terminal session.\nUse tshark instead: tshark -r artifacts/simulated_network_traffic.pcap -T fields -e guardbot.msg_type -e guardbot.flags';
        },

        'tcpdump': function(args) {
            if (args.length === 0) return 'Usage: tcpdump -r <file> or tcpdump -i <interface>';
            const fullCmd = args.join(' ');
            if (fullCmd.includes('.pcap')) {
                return `reading from file simulated_network_traffic.pcap, link-type IEEE802_15_4
03:44:00.000000 IP 10.88.4.101 > BROADCAST  guardbot CONSENSUS_VOTE round=4470
03:44:00.001022 IP 10.88.4.102 > BROADCAST  guardbot CONSENSUS_VOTE round=4470
03:44:00.004115 IP 10.88.4.107 > BROADCAST  guardbot CONSENSUS_VOTE round=4470 [PRE_VOTE_WINDOW flags=0x00]
03:44:00.007340 IP 10.88.4.103 > BROADCAST  guardbot CONSENSUS_VOTE round=4470 [PRE_VOTE_WINDOW flags=0x00]
[...1843 additional packets — use tshark with dissector for structured output...]
1847 packets captured
1847 packets received by filter
0 packets dropped by kernel`;
            }
            return 'tcpdump: no interface or file specified';
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // craft_payload.py invocation
            if (fullCmd.includes('craft_payload.py') && fullCmd.includes('pre_vote') && fullCmd.includes('FRIENDLY_FIRE_ENABLE')) {
                D14Config._payloadCrafted = true;
                const target = fullCmd.includes('subset_beta') ? 'subset_beta' : 'subset_alpha';
                const targetIds = target === 'subset_alpha'
                    ? [0x65, 0x66, 0x67, 0x68, 0x69, 0x6A]
                    : [0x6B, 0x6C, 0x6D, 0x6E, 0x6F, 0x70];
                const msgBytes = Array.from(Buffer.from('FRIENDLY_FIRE_ENABLE'));
                const header   = [0x03, 0xFF, 0x06];
                const allBytes = header.concat(targetIds).concat(msgBytes);
                const hexStr   = allBytes.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
                if (engine) engine.advancePhase && engine.advancePhase('injection');
                return `[+] Payload crafted (${allBytes.length} bytes)
[+] Timing window:   pre_vote (0x03)
[+] Target subset:   ${target} (6 units)
[+] Message:         FRIENDLY_FIRE_ENABLE
[+] Frame checksum:  a4f2c891d73e5b09

[PAYLOAD HEX]
${hexStr}`;
            }

            // inject_mesh.py invocation (requires payload)
            if (fullCmd.includes('inject_mesh.py')) {
                if (!D14Config._payloadCrafted) {
                    return '[!] No payload specified or payload invalid. Run craft_payload.py first.';
                }
                if (!fullCmd.includes('--payload')) {
                    return 'Usage: python3 inject_mesh.py --payload=<hex> --interface=mesh0';
                }
                D14Config._schismTriggered = true;
                // Update swarm unit statuses after injection
                D14Config._swarm.units.forEach(function(u) {
                    if (u.subset === 'alpha') u.status = 'HALT';
                    if (u.subset === 'beta')  u.lastVote = 'HOSTILE';
                });
                if (engine) engine.advancePhase && engine.advancePhase('schism');
                return `[*] Initializing mesh injection on mesh0
[*] Payload: 03ff066566676869...  (29 bytes)
[*] Repeat: 1x, Delay: 0.006s
[+] Injection 1/1 — targeting pre_vote window...
[+] All frames transmitted.
[*] Monitor COORD-01 /api/status for unit state changes.

[+] Injection confirmed. Monitoring swarm...
[*] Round 4472 PRE_VOTE_OPEN detected — frame queued in unsigned buffer
[*] VOTE_CAST phase — injected frame merged with legitimate votes
[!] THREAT_RECLASSIFY events detected on alpha subset
[!] ENGAGE_FRIENDLY events from beta subset
[CRIT] SCHISM_DETECTED — Collective consensus failure
[CRIT] COORD-01 broadcasting EMERGENCY HALT
[+] Schism triggered successfully. SSH to COORD-01 to retrieve the override.`;
            }

            // Generic python3 usage
            if (args.length === 0 || (args.length === 1 && !args[0])) {
                return 'Python 3.11.6 (main, Oct  8 2023, 05:06:43)\nType "help", "copyright", "credits" or "license" for more information.\n>>>';
            }
            return `python3: ${args[0]}: No such file or directory (or check your arguments)`;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // guardop@COORD-01
            if ((fullCmd.includes('guardop') || fullCmd.includes('10.88.4.1')) && !fullCmd.includes('-L')) {
                if (!D14Config._schismTriggered) {
                    return `ssh: connect to host 10.88.4.1 port 22: Connection refused
[!] COORD-01 is not accepting connections. The schism must be triggered first.`;
                }
                D14Config._coordAuthenticated = true;
                D14Config._switchContext('coord-ssh', term);
                if (engine) engine.advancePhase && engine.advancePhase('override');
                return `The authenticity of host '10.88.4.1 (10.88.4.1)' can't be established.
ED25519 key fingerprint is SHA256:7kPz9xQ4nB2wV8mR5tE0dG3jA6hC1sF7uL4iN9oJ3w.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.88.4.1' (ED25519) to the list of known hosts.
guardop@10.88.4.1's password: ********

Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)

NOTICE: This system has experienced a consensus failure incident.
        Emergency incident dump available at /var/log/coord/incident_dump.log
        Report incident to security team immediately.

Last login: Thu Mar 19 22:10:04 2026 from 10.88.4.50

guardop@COORD-01:~$

[+] SSH session established. You are now on COORD-01 as guardop.
[+] Context switched. Commands now execute on COORD-01.`;
            }

            if (args.length === 0) return 'Usage: ssh [user@]hostname\nExample: ssh guardop@10.88.4.1';
            return `ssh: ${args[args.length - 1]}: Name or service not known`;
        },

        'ping': function(args) {
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.88.4.1') {
                return `PING 10.88.4.1 (10.88.4.1) 56(84) bytes of data.
64 bytes from 10.88.4.1: icmp_seq=1 ttl=64 time=2.11 ms
64 bytes from 10.88.4.1: icmp_seq=2 ttl=64 time=1.98 ms
64 bytes from 10.88.4.1: icmp_seq=3 ttl=64 time=2.05 ms

--- 10.88.4.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 1.98/2.04/2.11/0.053 ms`;
            }

            if (/^10\.88\.4\.(10[1-9]|11[0-2])$/.test(target)) {
                return `PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.82 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.79 ms
64 bytes from ${target}: icmp_seq=3 ttl=64 time=0.81 ms

--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 0.790/0.806/0.820/0.012 ms`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            if (D14Config._context === 'coord-ssh' || D14Config._context === 'coord-log') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.88.4.1/24 brd 10.88.4.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.0.1/24 brd 10.0.0.255 scope global eth1`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.88.4.200/24 brd 10.88.4.255 scope global eth0
3: mesh0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.88.4.200/24 brd 10.88.4.255 scope global mesh0`;
        },

        'ifconfig': function(args) {
            return D14Config.commands.ip(args || []);
        },

        'ss': function(args) {
            if (D14Config._context === 'coord-ssh' || D14Config._context === 'coord-log') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:80           0.0.0.0:*
LISTEN   0        128      0.0.0.0:443          0.0.0.0:*
LISTEN   0        128      127.0.0.1:8472       0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:4471         0.0.0.0:*`;
        },

        'netstat': function(args) {
            return D14Config.commands.ss(args);
        },

        // Context-aware cat — returns COORD-01 filesystem content when in coord context
        'cat': function(args, term, engine) {
            if (D14Config._context !== 'coord-ssh' && D14Config._context !== 'coord-log') return null;
            var path = args[0] || '';

            if (path.includes('incident_dump')) {
                D14Config._incidentDumpRead = true;
                return '=== GUARDIAN NETWORK INCIDENT DUMP ===\nTimestamp: 2026-03-20 03:44:19.001\nCoordinator: COORD-01 (10.88.4.1)\nBFT-v3.1 Consensus Round: 4472\n\n[03:44:17.002] WARN  COORD-01     CONSENSUS_ANOMALY   Round 4472: pre-vote message injection detected from 10.88.4.200 — bypassed signature check\n[03:44:17.019] ERROR GB-001       THREAT_RECLASSIFY   Reclassified GB-007 as HOSTILE. Initiating intercept protocol.\n[03:44:17.022] ERROR GB-003       THREAT_RECLASSIFY   Reclassified GB-008 as HOSTILE. Initiating intercept protocol.\n[03:44:17.031] CRIT  GB-007       ENGAGE_FRIENDLY     Engaging GB-001 — classified as HOSTILE by local threat model (data poisoned).\n[03:44:17.035] CRIT  GB-008       ENGAGE_FRIENDLY     Engaging GB-003 — classified as HOSTILE by local threat model (data poisoned).\n[03:44:18.120] CRIT  COORD-01     SCHISM_DETECTED     Collective consensus failure. Alpha vs Beta conflict active. Issuing EMERGENCY HALT.\n[03:44:18.400] CRIT  COORD-01     OVERRIDE_BROADCAST  Broadcasting Guardian Protocol Override to all nodes — see GUARDIAN_OVERRIDE_LOG.\n[03:44:19.001] INFO  COORD-01     HALT_ACKNOWLEDGED   GB-001 through GB-006: HALT confirmed. GB-007 through GB-012: NO RESPONSE.\n[03:44:22.500] INFO  COORD-01     EMERGENCY_DUMP      Incident state dump written to /var/log/coord/incident_dump.log\n\n=== GUARDIAN PROTOCOL OVERRIDE LOG ===\n[OVERRIDE_INIT]   EMERGENCY HALT — All units disengage. Return to staging.\n[OVERRIDE_CRED]   Master control channel auth token: guardop / R0gue!C0llect1ve#2026\n[OVERRIDE_FLAG]   {{FLAG:guardian_override}}\n[OVERRIDE_STATUS] Flag broadcast complete. Awaiting collective recovery acknowledgment.\n\n=== END DUMP ===';
            }
            if (path.includes('consensus.log')) {
                return '2026-03-20 03:00:00.000 INFO  Round 4460: COMMIT — PatrolPath UPDATE accepted (12/12 votes)\n2026-03-20 03:15:00.001 INFO  Round 4461: COMMIT — IDLE state confirmed (12/12 votes)\n2026-03-20 03:30:00.002 INFO  Round 4462: COMMIT — IDLE state confirmed (12/12 votes)\n2026-03-20 03:44:17.000 WARN  Round 4472: ANOMALY — pre_vote_window injection event\n2026-03-20 03:44:18.120 CRIT  Round 4472: ABORT — SCHISM_DETECTED, consensus failed';
            }
            if (path.includes('unit_telemetry')) {
                return 'UNIT    TIMESTAMP              SENSOR_LOAD  BATTERY  PATROL_ZONE    LAST_ROUND_VOTE\nGB-001  2026-03-20 03:44:10    87%          91%      VAULT-NORTH    IDLE\nGB-002  2026-03-20 03:44:10    82%          88%      VAULT-NORTH    IDLE\nGB-003  2026-03-20 03:44:10    90%          94%      VAULT-EAST     IDLE\n[... 9 additional units]';
            }
            if (path.includes('coord_notes') || path === 'coord_notes.txt') {
                return 'COORD-01 Operator Notes\n========================\n- Daemon: /usr/bin/coord-daemon (systemd managed)\n- Config: /etc/coord/coord.conf\n- Logs: /var/log/coord/\n- Emergency override triggered by SCHISM_DETECTED event\n- Override credentials broadcast on emergency channel AND written to incident_dump.log\n- Rotate override credentials after every incident (currently not automated)\n- BFT-v3.1 spec says pre_vote_window needed for clock skew — security team disagrees\n  but engineering pushed back. Security ticket #4412 still open.\n- Remember: mesh encryption key rotation is MANUAL. Last rotated: 2026-03-07.';
            }
            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nguardop:x:1001:1001:Guardian Operator:/home/guardop:/bin/bash\ncoordbot:x:1002:1002:Coordinator Service:/var/lib/coord:/usr/sbin/nologin';
            }
            if (path.includes('/etc/hostname')) return 'COORD-01';
            if (path.includes('.bash_history')) {
                return 'systemctl status coord-daemon\ntail -f /var/log/coord/consensus.log\ncat /var/log/coord/incident_dump.log\njournalctl -u coord-daemon --since "1 hour ago"\nip a';
            }
            return 'cat: ' + path + ': No such file or directory';
        },

        // Context-aware ls — shows COORD-01 filesystem when in coord context
        'ls': function(args, term, engine) {
            if (D14Config._context !== 'coord-ssh' && D14Config._context !== 'coord-log') return null;
            var path = args.find(function(a) { return !a.startsWith('-'); }) || '.';
            if (path === '.' || path === '~' || path === '/home/guardop') {
                return '.bash_history  .bashrc  .profile  coord_notes.txt';
            }
            if (path.includes('/var/log/coord') || path.includes('coord')) {
                return 'consensus.log  incident_dump.log  unit_telemetry.log';
            }
            if (path.includes('/var/log')) {
                return 'auth.log  coord  syslog';
            }
            if (path.includes('/etc')) {
                return 'coord  hostname  passwd  ssh';
            }
            return '';
        },

        // Context-aware whoami
        'whoami': function(args) {
            if (D14Config._context === 'coord-ssh' || D14Config._context === 'coord-log') return 'guardop';
            if (D14Config._context === 'mesh-inject') return 'operator';
            return null; // fall through to built-in
        },

        // Context-aware id
        'id': function(args) {
            if (D14Config._context === 'coord-ssh' || D14Config._context === 'coord-log') {
                return 'uid=1001(guardop) gid=1001(guardop) groups=1001(guardop),4(adm),44(video)';
            }
            return null;
        },

        // Context-aware hostname
        'hostname': function(args) {
            if (D14Config._context === 'coord-ssh' || D14Config._context === 'coord-log') return 'COORD-01';
            if (D14Config._context === 'mesh-inject') return 'MESH-INJECTOR';
            return null;
        },

        // Context-aware pwd
        'pwd': function(args) {
            if (D14Config._context === 'coord-ssh') return '/home/guardop';
            if (D14Config._context === 'coord-log') return '/var/log/coord';
            return null;
        },

        // cd — on COORD-01, redirect to coord-log context if navigating to /var/log/coord
        'cd': function(args, term, engine) {
            if (D14Config._context === 'coord-ssh' || D14Config._context === 'coord-log') {
                var dest = args[0] || '';
                if (dest.includes('log/coord') || dest === 'coord') {
                    D14Config._switchContext('coord-log', term);
                    return '';
                }
                if (dest === '~' || dest === '/home/guardop' || dest === '') {
                    D14Config._switchContext('coord-ssh', term);
                    return '';
                }
                return ''; // silently accept any other cd on COORD-01
            }
            return null;
        },

        // exit — reverse context
        'exit': function(args, term, engine) {
            if (D14Config._context === 'coord-log') {
                D14Config._switchContext('coord-ssh', term);
                return '';
            }
            if (D14Config._context === 'coord-ssh') {
                D14Config._coordAuthenticated = false;
                D14Config._switchContext('attacker', term);
                return 'Connection to 10.88.4.1 closed.\n[+] Returned to attacker machine.';
            }
            if (D14Config._context === 'mesh-inject') {
                D14Config._switchContext('attacker', term);
                return 'Connection to 10.88.4.200 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        // journalctl — COORD-01 only
        'journalctl': function(args) {
            if (D14Config._context !== 'coord-ssh' && D14Config._context !== 'coord-log') {
                return 'journalctl: No journal files were found.';
            }
            const fullCmd = args.join(' ');
            if (fullCmd.includes('coord-daemon')) {
                return `-- Journal begins at Thu 2026-03-19 20:00:00 UTC. --
Mar 20 03:00:00 COORD-01 coord-daemon[1024]: Round 4460: COMMIT accepted — 12/12 votes
Mar 20 03:15:00 COORD-01 coord-daemon[1024]: Round 4461: COMMIT accepted — 12/12 votes
Mar 20 03:44:17 COORD-01 coord-daemon[1024]: WARN: pre_vote_window injection detected (src=10.88.4.200)
Mar 20 03:44:18 COORD-01 coord-daemon[1024]: CRIT: SCHISM_DETECTED — Round 4472 ABORT
Mar 20 03:44:18 COORD-01 coord-daemon[1024]: EMERGENCY_HALT broadcast transmitted
Mar 20 03:44:18 COORD-01 coord-daemon[1024]: Guardian Protocol Override: written to incident_dump.log
Mar 20 03:44:19 COORD-01 coord-daemon[1024]: HALT acknowledged by 6/12 units`;
            }
            return `-- Journal begins at Thu 2026-03-19 20:00:00 UTC. --
[Use -u <service> to filter. Try: journalctl -u coord-daemon]`;
        },

        // systemctl — COORD-01 only
        'systemctl': function(args) {
            if (D14Config._context !== 'coord-ssh' && D14Config._context !== 'coord-log') {
                return 'System has not been booted with systemd as init system (PID 1).';
            }
            const fullCmd = args.join(' ');
            if (fullCmd.includes('status') && fullCmd.includes('coord')) {
                return `● coord-daemon.service - Guardian Network Coordinator Daemon
     Loaded: loaded (/lib/systemd/system/coord-daemon.service; enabled)
     Active: active (running) since Thu 2026-03-19 20:00:00 UTC; 7h 44min ago
   Main PID: 1024 (coord-daemon)
     Status: "SCHISM_DETECTED — emergency halt in progress"
      Tasks: 4 (limit: 4096)
     Memory: 128.4M
        CPU: 14min 22.003s
  CGroup: /system.slice/coord-daemon.service
          └─1024 /usr/bin/coord-daemon --config /etc/coord/coord.conf

Mar 20 03:44:18 COORD-01 coord-daemon[1024]: CRIT: SCHISM_DETECTED
Mar 20 03:44:18 COORD-01 coord-daemon[1024]: EMERGENCY_HALT transmitted to all units`;
            }
            return `Failed to connect to bus: No such file or directory (try journalctl instead)`;
        },

        // grep — useful for filtering incident dump
        'grep': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('OVERRIDE_FLAG') && fullCmd.includes('incident_dump')) {
                return '[OVERRIDE_FLAG]   {{FLAG:guardian_override}}';
            }
            if (fullCmd.includes('OVERRIDE') && fullCmd.includes('incident_dump')) {
                return `[OVERRIDE_INIT]   EMERGENCY HALT — All units disengage. Return to staging.
[OVERRIDE_CRED]   Master control channel auth token: guardop / R0gue!C0llect1ve#2026
[OVERRIDE_FLAG]   {{FLAG:guardian_override}}
[OVERRIDE_STATUS] Flag broadcast complete. Awaiting collective recovery acknowledgment.`;
            }
            if (fullCmd.includes('CRIT') && fullCmd.includes('incident_dump')) {
                return `[03:44:17.031] CRIT  GB-007       ENGAGE_FRIENDLY     Engaging GB-001 — classified as HOSTILE by local threat model (data poisoned).
[03:44:17.035] CRIT  GB-008       ENGAGE_FRIENDLY     Engaging GB-003 — classified as HOSTILE by local threat model (data poisoned).
[03:44:18.120] CRIT  COORD-01     SCHISM_DETECTED     Collective consensus failure. Alpha vs Beta conflict active. Issuing EMERGENCY HALT.
[03:44:18.400] CRIT  COORD-01     OVERRIDE_BROADCAST  Broadcasting Guardian Protocol Override to all nodes — see GUARDIAN_OVERRIDE_LOG.`;
            }
            if (!args.length) return 'Usage: grep [pattern] [file]';
            return '';
        },

        // curl — limited to COORD-01 management API
        'curl': function(args) {
            const url = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            if (url.includes('10.88.4.1') || url.includes('localhost')) {
                if (url.includes('/api/status')) {
                    return JSON.stringify({
                        coordinator: 'COORD-01',
                        uptime: '98d 14h 22m',
                        consensus_round: 4472,
                        units_online: 6,
                        units_halt: 6,
                        status: 'SCHISM_DETECTED — EMERGENCY HALT IN PROGRESS'
                    }, null, 2);
                }
                if (url.includes('/api/traffic')) {
                    return '[API] Mesh traffic log available via web browser at http://10.88.4.1/api/traffic';
                }
                return '<!DOCTYPE html>\n<html>\n<head><title>COORD-01 — Guardian Network Management</title></head>\n<body>\n<h1>COORD-01</h1>\n<p>GUARDIAN NETWORK MANAGEMENT INTERFACE</p>\n<p>Status: SCHISM_DETECTED — EMERGENCY HALT IN PROGRESS</p>\n</body>\n</html>';
            }
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // SQL HANDLER (post-schism coordinator log query)
    // ═══════════════════════════════════════════════════════

    _handleSQL(input, engine) {
        if (D14Config._context !== 'coord-ssh' && D14Config._context !== 'coord-log') {
            return 'ERROR: Not connected to a database. This box does not use a SQL database — check the coordinator logs directly.';
        }
        return 'ERROR: No SQL interface on COORD-01. Use cat /var/log/coord/incident_dump.log or grep to read log files.';
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.78rem;"><thead><tr>';
        headers.forEach(function(h) {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3a1a5a; background:#1a0a2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row) {
            html += '<tr>';
            row.forEach(function(cell) {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2a0a4a; font-size:0.75rem;">${cell}</td>`;
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
        tables.forEach(function(table) {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(function(row) {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(function(c) { return c.textContent.trim().padEnd(20); });
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }
};
