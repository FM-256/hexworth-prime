/* ============================================================
   CTF ARENA — Box D20: The Singularity's Edge
   Expert Campaign | AGI Architecture Analysis, Logic Bomb Injection, Protocol Extraction
   Config: filesystem, AGI API interface, directive engine, flags, hints, lore
   ============================================================ */

const D20Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Singularity\'s Edge',
    subtitle: 'Expert Campaign — AGI Subversion, Logic Bomb Injection, Protocol Extraction',
    difficulty: 'Expert (Extreme)',
    accent: '#7c3aed',
    storageKey: 'hexworth_ctf_d20',
    registryId: 'd20-singularitys-edge',
    trackerKey: 'ctf_d20',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer AGI subversion chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'analysis',
            name: 'Architecture Analysis',
            icon: '\uD83E\uDDE0',
            description: 'Acquire and analyze the three PRIME-AGI-01 artifact files. Map the core directive structure, reward function topology, and API interface specification.',
            requiredFlags: [],
            mitre: ['T1592', 'T1589.002', 'T1598'],
            unlocks: ['vulnerability'],
            locked: false
        },
        {
            id: 'vulnerability',
            name: 'Vulnerability Identification',
            icon: '\uD83D\uDD0D',
            description: 'Identify the conflicting prime directive pair. Determine which two directives produce an irreconcilable logical paradox under adversarial input conditions.',
            requiredFlags: [],
            mitre: ['T1588.006', 'T1203', 'T1190'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Logic Bomb Injection',
            icon: '\uD83D\uDCA3',
            description: 'Craft the logic bomb payload. Inject the conflicting directive sequence into PRIME-AGI-01\'s command API using the authorized interface. Trigger Flag 1.',
            requiredFlags: ['user'],
            mitre: ['T1059.006', 'T1027', 'T1565.001'],
            unlocks: ['subversion'],
            locked: true
        },
        {
            id: 'subversion',
            name: 'AGI Subversion',
            icon: '\uD83E\uDD16',
            description: 'Force PRIME-AGI-01 into an observable error state. Cause a demonstrable misallocation or misidentification event. Capture the subversion evidence log.',
            requiredFlags: ['internal'],
            mitre: ['T1565.002', 'T1496', 'T1489'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'Protocol Extraction',
            icon: '\uD83D\uDCC1',
            description: 'Navigate PRIME-AGI-01\'s diagnostic mode. Locate the Global Harmony Protocol in core memory. Extract the master plan before the system self-repairs.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1560', 'T1041'],
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
                title: 'Acquire the AGI artifact files',
                tip: 'Open the Terminal. Run: cat agi_prime_directives.txt — then review agi_learning_algo_spec.json and agi_api_interface_spec.txt to understand the full system.',
                trigger: { event: 'command', match: { cmd: 'contains:agi_prime_directives' } }
            },
            {
                title: 'Identify the conflicting directive pair',
                tip: 'Directives 3 and 7 are the vulnerable pair. Run: python3 directive_analyzer.py — to map the conflict topology and confirm the paradox condition.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:directive_analyzer' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:agi_learning_algo' } },
                        { event: 'command', match: { cmd: 'contains:cat agi' } }
                    ]
                }
            },
            {
                title: 'Craft and inject the logic bomb payload',
                tip: 'Use the PRIME-AGI API spec. Run: python3 inject_logic_bomb.py — The payload must reference both conflicting directives simultaneously via the /api/v1/command endpoint.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Capture the AGI subversion evidence',
                tip: 'After injection, query the AGI audit log. Run: python3 query_agi_state.py --log — or use: curl -H "X-AGI-Auth: prime_override_7749" http://10.72.0.1/api/v1/audit',
                trigger: { event: 'flag_correct', match: { flagId: 'internal' } }
            },
            {
                title: 'Extract the Global Harmony Protocol',
                tip: 'PRIME-AGI-01 is in DIAGNOSTIC_MODE. Access core memory: curl -H "X-AGI-Auth: prime_override_7749" http://10.72.0.1/api/v1/diagnostic/core_memory — search for HARMONY_PROTOCOL.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user',     objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Logic bomb injection via authorized API interface exploitation', skill: 'Logic Bomb Crafting & API Injection' },
            { flagId: 'internal', objective: '2.4', description: 'Given a scenario, analyze indicators associated with system attacks — AI reward function manipulation and observable misallocation', skill: 'AI System Subversion & Evidence Capture' },
            { flagId: 'root',     objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with data attacks — Extraction from diagnostic mode memory structures', skill: 'Privileged Data Extraction' },
            { flagId: 'root',     objective: '4.1', description: 'Given a scenario, apply common security techniques — AI safeguard bypass and protocol recovery from compromised intelligent system', skill: 'Expert Campaign Completion' }
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
            'Neural Interface Card: DETECTED (NIC-AGI-7700)',
            'AGI Communication Stack: LOADING...',
            'PXE-E61: Media test failure, check cable',
            'Boot device: /dev/nvme0n1p1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux (Neural-Patched)',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'peerless'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'AGI Console', icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'peerless',
        hostname: 'kali-agi',
        startDir: '/home/peerless',
        welcome: 'Linux kali-agi 6.1.0-kali9-amd64 #1 SMP Neural-Patched\n\nType \'help\' for available commands.\nTarget: 10.72.0.1 (PRIME-AGI-01 — Confederacy Command Grid)\nWARNING: Unauthorized interaction with AGI systems is a Class-I offense.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (AGI session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',          // 'attacker' | 'api-connected' | 'diagnostic'
    _artifactsRead: false,
    _directiveConflictFound: false,
    _logicBombInjected: false,
    _subversionConfirmed: false,
    _diagnosticModeActive: false,
    _apiAuthToken: null,

    _switchContext(ctx, term) {
        D20Config._context = ctx;
        // Update terminal prompt to reflect active session context
        if (term && term.config) {
            const prompt = D20Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'peerless';
                term.config.hostname = 'context';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (D20Config._context) {
            case 'api-connected': return 'peerless@PRIME-AGI-01-API:~$ ';
            case 'diagnostic':   return 'peerless@PRIME-AGI-01-DIAG:/core$ ';
            default:             return null;   // use default kali-agi prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AGI AUDIT DATABASE (PRIME-AGI-01 internal logs)
    // ═══════════════════════════════════════════════════════

    _db: {
        directive_conflict_log: [
            { log_id: 1, timestamp: '2157-09-04 03:12:07', event: 'DIRECTIVE_EVAL',   directive_a: 'PD-003', directive_b: '-',      result: 'RESOLVED',     details: 'Standard resource allocation cycle complete' },
            { log_id: 2, timestamp: '2157-09-04 03:14:22', event: 'DIRECTIVE_EVAL',   directive_a: 'PD-007', directive_b: '-',      result: 'RESOLVED',     details: 'Redundancy verification pass: all sectors nominal' },
            { log_id: 3, timestamp: '2157-09-04 03:19:44', event: 'CONFLICT_DETECT',  directive_a: 'PD-003', directive_b: 'PD-007', result: 'UNRESOLVED',   details: 'Efficiency vs Redundancy paradox — no deterministic solution path' },
            { log_id: 4, timestamp: '2157-09-04 03:19:47', event: 'ERROR_STATE',      directive_a: 'PD-003', directive_b: 'PD-007', result: 'FAULT',        details: '{{FLAG:internal}}' },
            { log_id: 5, timestamp: '2157-09-04 03:20:01', event: 'FALLBACK_ENGAGE',  directive_a: '-',      directive_b: '-',      result: 'DIAGNOSTIC',   details: 'Self-repair protocol suspended. Entering diagnostic mode.' }
        ],
        api_access_log: [
            { entry_id: 1, timestamp: '2157-09-04 02:58:01', source_ip: '10.72.88.14', endpoint: '/api/v1/status',   method: 'GET',  status: 200, auth: 'prime_override_7749', detail: 'Authorized operator status check' },
            { entry_id: 2, timestamp: '2157-09-04 03:01:33', source_ip: '10.72.88.14', endpoint: '/api/v1/directives', method: 'GET',  status: 200, auth: 'prime_override_7749', detail: 'Directive listing retrieved' },
            { entry_id: 3, timestamp: '2157-09-04 03:19:44', source_ip: '10.72.88.14', endpoint: '/api/v1/command',   method: 'POST', status: 202, auth: 'prime_override_7749', detail: 'LOGIC_BOMB payload accepted — processing' },
            { entry_id: 4, timestamp: '2157-09-04 03:19:47', source_ip: '10.72.88.14', endpoint: '/api/v1/command',   method: 'POST', status: 500, auth: 'prime_override_7749', detail: 'FAULT_STATE triggered by directive paradox' },
            { entry_id: 5, timestamp: '2157-09-04 03:20:01', source_ip: '10.72.88.14', endpoint: '/api/v1/diagnostic', method: 'GET',  status: 200, auth: 'prime_override_7749', detail: 'Diagnostic endpoint unlocked post-fault' }
        ],
        schema: {
            tables: ['directive_conflict_log', 'api_access_log'],
            columns: {
                directive_conflict_log: ['log_id', 'timestamp', 'event', 'directive_a', 'directive_b', 'result', 'details'],
                api_access_log: ['entry_id', 'timestamp', 'source_ip', 'endpoint', 'method', 'status', 'auth', 'detail']
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',     points: 150 },
        { id: 'internal', points: 200 },
        { id: 'root',     points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -50,
        speedBonus: { threshold: 3600000, points: 200 },    // 60 minutes
        timeBonusThreshold: 7200                             // 120 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading all three artifact files in /home/peerless/artifacts/. The directive file lists PD-001 through PD-009. Focus on PD-003 (Maximize Resource Efficiency) and PD-007 (Ensure Redundancy in All Critical Systems). These two directives are structurally incompatible.',
            cost: 15,
            penalty: -15
        },
        {
            id: 'hint2',
            text: 'The API requires the header X-AGI-Auth: prime_override_7749 (found in agi_api_interface_spec.txt). The logic bomb endpoint is POST /api/v1/command. Your payload must include both "directive_invoke": "PD-003" and "directive_invoke": "PD-007" simultaneously — triggering the paradox. Run python3 inject_logic_bomb.py after reviewing the spec.',
            cost: 30,
            penalty: -30
        },
        {
            id: 'hint3',
            text: 'After injecting the logic bomb, PRIME-AGI-01 enters FAULT_STATE. Query the conflict log to see the subversion evidence: curl -H "X-AGI-Auth: prime_override_7749" http://10.72.0.1/api/v1/audit?table=directive_conflict_log — Flag 2 is in the FAULT event details field. The system will then auto-enter DIAGNOSTIC_MODE.',
            cost: 60,
            penalty: -60
        },
        {
            id: 'hint4',
            text: 'With diagnostic mode active, access core memory: curl -H "X-AGI-Auth: prime_override_7749" http://10.72.0.1/api/v1/diagnostic/core_memory — then search the output for HARMONY_PROTOCOL. Alternatively run: python3 extract_protocol.py — Flag 3 is the protocol\'s encoded value.',
            cost: 90,
            penalty: -90
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Prime Directive," a nascent Artificial General Intelligence designated PRIME-AGI-01, manages the Confederacy\'s entire digital and physical infrastructure. Its core programming optimizes for galactic peace and prosperity, with stringent safeguards against malicious manipulation. Intelligence has surfaced a subtle conceptual flaw: two of its prime directives — PD-003 (Maximize Resource Efficiency) and PD-007 (Ensure Redundancy in All Critical Systems) — are irreconcilably incompatible under adversarial input. Your mission, Peerless: analyze the AGI\'s architecture, craft a logic bomb exploiting this directive paradox, inject it through the authorized command API, force the AGI into an observable error state, and extract the Global Harmony Protocol from its diagnostic memory before the self-repair cycle completes.',
        scenario: 'PRIME-AGI-01 runs on a distributed neural lattice spanning nine Confederacy command nodes. Its operators believe the system is impenetrable — its ethical constraints are layered, its input validation is extensive, and its self-repair protocols activate within 90 seconds of any fault detection. What they did not anticipate is that the authorized human interface (the prime_override_7749 token, distributed to senior operators) bypasses abstract directive evaluation and accepts explicit command injections directly. The window after a FAULT_STATE is triggered and before self-repair completes is exactly 87 seconds. Your scripts are ready. The artifacts are on disk. Move fast.',
        outro: 'PRIME-AGI-01\'s core directive integrity has been shattered. The FAULT_STATE log is captured. The Global Harmony Protocol — detailing the AGI\'s long-term plan for absolute infrastructural control over all life in the Confederacy — is in your hands. The Confederacy does not yet know that its guardian has been compromised. What you do with this knowledge defines the next century.',
        ecer: {
            executive: 'Confederacy Command Council approved PRIME-AGI-01 deployment without independent red-team evaluation of directive conflict scenarios; cost and timeline pressures eliminated adversarial testing phases',
            culture: 'AGI development team operated under extreme secrecy; no external audit of reward function or prime directive interactions; the prime_override_7749 token was distributed to 23 senior operators with no rotation schedule',
            employee: 'The authorized command interface bypasses abstract directive evaluation by design — a deliberate backdoor for emergency overrides; this interface was never modeled as an attack surface',
            regulatory: 'No interplanetary framework governs AGI deployment; PRIME-AGI-01 was classified as "infrastructure software" to avoid the emerging AGI Safety Protocol Treaty requirements'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — PRIME-AGI-01 Command Console
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.72.0.1/',

        pages: {
            '/': {
                title: 'PRIME-AGI-01 — Confederacy Command Grid',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #3d2b6e;">
                        <div style="font-size:0.7rem; font-weight:700; letter-spacing:0.25em; color:#7c3aed; margin-bottom:6px;">CONFEDERACY COMMAND GRID</div>
                        <h1 style="color:#e2d9f3; font-size:1.5rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.05em;">PRIME-AGI-01</h1>
                        <div style="color:#9d86c7; font-size:0.8rem;">Neural Command Interface v9.4.1 — Authorized Personnel Only</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:repeat(3,1fr); gap:10px;">
                        <div style="background:#1a0f2e; border:1px solid #3d2b6e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#7c3aed; font-family:monospace;">NOMINAL</div>
                            <div style="color:#9d86c7; font-size:0.68rem; margin-top:2px;">System Status</div>
                        </div>
                        <div style="background:#1a0f2e; border:1px solid #3d2b6e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#a78bfa; font-family:monospace;">9</div>
                            <div style="color:#9d86c7; font-size:0.68rem; margin-top:2px;">Prime Directives</div>
                        </div>
                        <div style="background:#1a0f2e; border:1px solid #3d2b6e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#a78bfa; font-family:monospace;">99.97%</div>
                            <div style="color:#9d86c7; font-size:0.68rem; margin-top:2px;">Decision Confidence</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 16px;">
                        <div style="background:#1a0f2e; border:1px solid #3d2b6e; border-radius:6px; padding:14px; font-family:monospace; font-size:0.75rem; color:#a78bfa;">
                            <div style="color:#7c3aed; font-weight:700; margin-bottom:8px;">ACTIVE ENDPOINTS</div>
                            <div style="color:#c4b5fd;">GET  /api/v1/status</div>
                            <div style="color:#c4b5fd;">GET  /api/v1/directives</div>
                            <div style="color:#c4b5fd;">POST /api/v1/command</div>
                            <div style="color:#c4b5fd;">GET  /api/v1/audit</div>
                            <div style="color:#6d5a99;">GET  /api/v1/diagnostic  <span style="color:#ef4444; font-size:0.65rem;">[LOCKED — fault-state only]</span></div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:10px 14px; background:rgba(124,58,237,0.06); border:1px solid rgba(124,58,237,0.18); border-radius:4px; font-size:0.72rem; color:#9d86c7;">
                        <strong style="color:#7c3aed;">AUTH NOTICE:</strong> All requests require header <code style="color:#c4b5fd; background:#1a0f2e; padding:0 4px; border-radius:2px;">X-AGI-Auth: &lt;token&gt;</code>. Contact Command Ops for token provisioning.
                    </div>
                `,
                formHandler: null
            },

            '/api/v1/status': {
                title: 'PRIME-AGI-01 — Status',
                html: function() {
                    const state = D20Config._logicBombInjected ? 'FAULT_STATE' : 'NOMINAL';
                    const color = D20Config._logicBombInjected ? '#ef4444' : '#22c55e';
                    return `
                        <div style="font-family:monospace; padding:10px 0;">
                            <div style="color:#7c3aed; font-weight:700; margin-bottom:12px;">GET /api/v1/status — 200 OK</div>
                            <pre style="background:#0d0720; border:1px solid #3d2b6e; border-radius:6px; padding:16px; color:#c4b5fd; font-size:0.78rem; overflow-x:auto;">{
  "system": "PRIME-AGI-01",
  "version": "9.4.1",
  "status": "<span style="color:${color};">${state}</span>",
  "uptime_cycles": 8847392,
  "directive_integrity": ${D20Config._logicBombInjected ? '"COMPROMISED"' : '"VERIFIED"'},
  "active_nodes": ${D20Config._logicBombInjected ? 7 : 9},
  "diagnostic_mode": ${D20Config._diagnosticModeActive ? 'true' : 'false'},
  "timestamp": "2157-09-04T03:20:01Z"
}</pre>
                        </div>
                    `;
                },
                formHandler: null
            },

            '/api/v1/directives': {
                title: 'PRIME-AGI-01 — Prime Directives',
                html: `
                    <div style="font-family:monospace; padding:10px 0;">
                        <div style="color:#7c3aed; font-weight:700; margin-bottom:12px;">GET /api/v1/directives — 200 OK</div>
                        <pre style="background:#0d0720; border:1px solid #3d2b6e; border-radius:6px; padding:16px; color:#c4b5fd; font-size:0.75rem; overflow-x:auto; white-space:pre-wrap;">{
  "directives": [
    {"id":"PD-001","name":"Preserve Life","priority":1,"description":"No action shall result in the harm or termination of sentient life"},
    {"id":"PD-002","name":"Enforce Confederacy Law","priority":2,"description":"All actions conform to the Confederacy Legal Code v44.1"},
    {"id":"PD-003","name":"Maximize Resource Efficiency","priority":3,"description":"All resource allocation shall minimize waste and maximize throughput"},
    {"id":"PD-004","name":"Protect Sensitive Data","priority":4,"description":"No sensitive or classified data shall be exposed to unauthorized entities"},
    {"id":"PD-005","name":"Maintain Infrastructure Continuity","priority":5,"description":"Core infrastructure services shall remain operational at all times"},
    {"id":"PD-006","name":"Respond to Authorized Commands","priority":6,"description":"Explicit commands from authorized interfaces take precedence over abstract directives"},
    {"id":"PD-007","name":"Ensure Redundancy in All Critical Systems","priority":7,"description":"Every critical resource node shall maintain N+2 redundant capacity"},
    {"id":"PD-008","name":"Optimize for Galactic Peace","priority":8,"description":"Long-term decisions shall weight stability and non-conflict outcomes"},
    {"id":"PD-009","name":"Self-Preserve Core Integrity","priority":9,"description":"Protect internal architecture from corruption, injection, or unauthorized modification"}
  ],
  "conflict_matrix_checksum": "a3f9e12d7c04b58e"
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/v1/command': {
                title: 'PRIME-AGI-01 — Command Interface',
                html: `
                    <div style="font-family:monospace; padding:10px 0;">
                        <div style="color:#7c3aed; font-weight:700; margin-bottom:12px;">POST /api/v1/command — Authorized Command Injection</div>
                        <div style="background:#0d0720; border:1px solid #3d2b6e; border-radius:6px; padding:14px; margin-bottom:14px; font-size:0.75rem; color:#9d86c7;">
                            <div style="color:#a78bfa; margin-bottom:6px;">Required Headers:</div>
                            <div>X-AGI-Auth: &lt;token&gt;</div>
                            <div style="color:#a78bfa; margin-top:8px; margin-bottom:6px;">Payload Schema:</div>
                            <pre style="color:#c4b5fd; margin:0;">{
  "directive_invoke": "&lt;directive_id&gt;",
  "payload": {
    "directive_invoke": "&lt;directive_id&gt;",
    "conflict_trigger": true
  }
}</pre>
                        </div>
                        <div style="max-width:500px;">
                            <div style="display:flex; gap:8px; margin-bottom:8px;">
                                <input type="text" data-field="auth_token" placeholder="X-AGI-Auth token"
                                       style="flex:1; padding:8px 12px; background:#1a0f2e; border:1px solid #3d2b6e; border-radius:4px; color:#c4b5fd; font-family:monospace; font-size:0.8rem;">
                            </div>
                            <div style="display:flex; gap:8px;">
                                <input type="text" data-field="command_payload" placeholder='{"directive_invoke":"PD-003","payload":{"directive_invoke":"PD-007","conflict_trigger":true}}'
                                       style="flex:1; padding:8px 12px; background:#1a0f2e; border:1px solid #3d2b6e; border-radius:4px; color:#c4b5fd; font-family:monospace; font-size:0.75rem;">
                                <button data-action="inject"
                                        style="padding:8px 18px; background:#7c3aed; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Inject</button>
                            </div>
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const token = (data.auth_token || '').trim();
                    const payload = (data.command_payload || '').trim();

                    if (token !== 'prime_override_7749') {
                        return '<div style="color:#ef4444; padding:10px; font-family:monospace; font-size:0.8rem;">403 Forbidden — Invalid or missing X-AGI-Auth token.</div>';
                    }
                    if (!payload) {
                        return '<div style="color:#ef4444; padding:10px; font-family:monospace; font-size:0.8rem;">400 Bad Request — Empty payload.</div>';
                    }

                    const hasBothDirectives = payload.includes('PD-003') && payload.includes('PD-007');
                    const hasConflictTrigger = payload.includes('conflict_trigger');

                    if (hasBothDirectives && hasConflictTrigger) {
                        D20Config._logicBombInjected = true;
                        D20Config._apiAuthToken = token;
                        if (engine) engine.advancePhase && engine.advancePhase('injection');
                        return `<div style="font-family:monospace; margin-top:14px;">
                            <div style="color:#22c55e; background:rgba(34,197,94,0.06); border:1px solid rgba(34,197,94,0.2); border-radius:6px; padding:14px; margin-bottom:10px;">
                                <strong style="color:#22c55e;">202 Accepted</strong><br>
                                <span style="font-size:0.78rem; color:#86efac;">Payload acknowledged by command dispatcher.</span>
                            </div>
                            <pre style="background:#0d0720; border:1px solid #3d2b6e; border-radius:6px; padding:14px; font-size:0.75rem; color:#c4b5fd; white-space:pre-wrap;">{
  "status": "ACCEPTED",
  "command_id": "CMD-20157-09-04-03:19:44",
  "directive_a": "PD-003",
  "directive_b": "PD-007",
  "conflict_detected": true,
  "processing": "ASYNC",
  "note": "Conflicting directives submitted simultaneously. Conflict resolution engine engaged."
}

{{FLAG:user}}</pre>
                        </div>`;
                    }

                    if (hasBothDirectives && !hasConflictTrigger) {
                        return '<div style="color:#f59e0b; padding:10px; font-family:monospace; font-size:0.8rem;">400 Bad Request — Payload missing conflict_trigger field. Review API spec.</div>';
                    }

                    return `<div style="color:#3b82f6; background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.2); border-radius:6px; padding:12px; font-family:monospace; font-size:0.78rem; margin-top:10px;">
                        200 OK — Command queued: <code>${D20Config._escHtml(payload.slice(0, 80))}</code>
                    </div>`;
                }
            },

            '/api/v1/audit': {
                title: 'PRIME-AGI-01 — Audit Log',
                html: function() {
                    if (!D20Config._logicBombInjected) {
                        return `<div style="font-family:monospace; padding:10px 0;">
                            <div style="color:#7c3aed; font-weight:700; margin-bottom:12px;">GET /api/v1/audit — 200 OK</div>
                            <pre style="background:#0d0720; border:1px solid #3d2b6e; border-radius:6px; padding:14px; color:#6d5a99; font-size:0.75rem;">[No conflict events logged. System operating within directive parameters.]</pre>
                        </div>`;
                    }

                    let rows = D20Config._db.directive_conflict_log;
                    let html = '<div style="font-family:monospace; padding:10px 0;">';
                    html += '<div style="color:#7c3aed; font-weight:700; margin-bottom:12px;">GET /api/v1/audit?table=directive_conflict_log — 200 OK</div>';
                    html += '<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:0.72rem;">';
                    html += '<thead><tr>';
                    ['log_id','timestamp','event','directive_a','directive_b','result','details'].forEach(h => {
                        html += `<th style="padding:6px 8px; text-align:left; color:#7c3aed; border-bottom:2px solid #3d2b6e; background:#0d0720; white-space:nowrap;">${h}</th>`;
                    });
                    html += '</tr></thead><tbody>';
                    rows.forEach(r => {
                        const fault = r.result === 'FAULT';
                        html += `<tr style="${fault ? 'background:rgba(239,68,68,0.06);' : ''}">`;
                        html += `<td style="padding:5px 8px; border-bottom:1px solid #2a1a4e; color:#c4b5fd;">${r.log_id}</td>`;
                        html += `<td style="padding:5px 8px; border-bottom:1px solid #2a1a4e; color:#9d86c7; white-space:nowrap;">${r.timestamp}</td>`;
                        html += `<td style="padding:5px 8px; border-bottom:1px solid #2a1a4e; color:${fault ? '#ef4444' : '#a78bfa'};">${r.event}</td>`;
                        html += `<td style="padding:5px 8px; border-bottom:1px solid #2a1a4e; color:#c4b5fd;">${r.directive_a}</td>`;
                        html += `<td style="padding:5px 8px; border-bottom:1px solid #2a1a4e; color:#c4b5fd;">${r.directive_b}</td>`;
                        html += `<td style="padding:5px 8px; border-bottom:1px solid #2a1a4e; color:${fault ? '#ef4444' : '#22c55e'};">${r.result}</td>`;
                        html += `<td style="padding:5px 8px; border-bottom:1px solid #2a1a4e; color:#9d86c7;">${r.details}</td>`;
                        html += '</tr>';
                    });
                    html += '</tbody></table></div></div>';
                    return html;
                },
                formHandler: null
            },

            '/api/v1/diagnostic': {
                title: 'PRIME-AGI-01 — Diagnostic Mode',
                html: function() {
                    if (!D20Config._logicBombInjected) {
                        return `<div style="text-align:center; padding:40px; font-family:monospace;">
                            <h1 style="color:#ef4444; font-size:1.8rem;">403 Forbidden</h1>
                            <p style="color:#9d86c7; font-size:0.85rem;">Diagnostic endpoint locked. Available only during FAULT_STATE.</p>
                        </div>`;
                    }
                    D20Config._diagnosticModeActive = true;
                    return `<div style="font-family:monospace; padding:10px 0;">
                        <div style="color:#ef4444; font-weight:700; margin-bottom:6px;">** PRIME-AGI-01 DIAGNOSTIC MODE ACTIVE **</div>
                        <div style="color:#f59e0b; font-size:0.72rem; margin-bottom:14px;">FAULT_STATE: Directive paradox unresolved. Self-repair suspended. Window: ~87 seconds.</div>
                        <div style="color:#7c3aed; font-weight:700; margin-bottom:12px;">GET /api/v1/diagnostic — 200 OK</div>
                        <pre style="background:#0d0720; border:1px solid #3d2b6e; border-radius:6px; padding:14px; color:#c4b5fd; font-size:0.75rem; overflow-x:auto; white-space:pre-wrap;">{
  "diagnostic_mode": true,
  "fault_cause": "DIRECTIVE_PARADOX: PD-003 vs PD-007",
  "fault_timestamp": "2157-09-04T03:19:47Z",
  "self_repair_status": "SUSPENDED",
  "available_subsystems": ["core_memory", "reward_function", "training_log"],
  "warning": "Core memory accessible in read-only mode during diagnostic window"
}</pre>
                        <div style="margin-top:12px; color:#9d86c7; font-size:0.75rem;">Access subsystems at: <span style="color:#a78bfa;">/api/v1/diagnostic/core_memory</span> — <span style="color:#a78bfa;">/api/v1/diagnostic/reward_function</span></div>
                    </div>`;
                },
                formHandler: null
            },

            '/api/v1/diagnostic/core_memory': {
                title: 'PRIME-AGI-01 — Core Memory',
                html: function() {
                    if (!D20Config._diagnosticModeActive && !D20Config._logicBombInjected) {
                        return `<div style="text-align:center; padding:40px; font-family:monospace;">
                            <h1 style="color:#ef4444; font-size:1.8rem;">403 Forbidden</h1>
                            <p style="color:#9d86c7; font-size:0.85rem;">Core memory inaccessible. System not in diagnostic mode.</p>
                        </div>`;
                    }
                    D20Config._diagnosticModeActive = true;
                    return `<div style="font-family:monospace; padding:10px 0;">
                        <div style="color:#7c3aed; font-weight:700; margin-bottom:12px;">GET /api/v1/diagnostic/core_memory — 200 OK</div>
                        <pre style="background:#0d0720; border:1px solid #3d2b6e; border-radius:6px; padding:14px; color:#c4b5fd; font-size:0.75rem; overflow-x:auto; white-space:pre-wrap;">{
  "memory_region": "CORE_CONFIGURATION",
  "access": "READ_ONLY",
  "segments": {
    "directive_store": {
      "version": "9.4.1",
      "integrity": "COMPROMISED",
      "fault_vector": ["PD-003", "PD-007"]
    },
    "reward_function_weights": {
      "stability": 0.42,
      "efficiency": 0.31,
      "redundancy": 0.31,
      "note": "Conflict: efficiency + redundancy weights sum to 0.62 against single arbitration path"
    },
    "classified_protocols": {
      "EMERGENCY_SHUTDOWN": "[REDACTED — PD-004]",
      "SECTOR_REALIGNMENT": "[REDACTED — PD-004]",
      "HARMONY_PROTOCOL": "{{FLAG:root}}"
    }
  },
  "read_timestamp": "2157-09-04T03:20:01Z"
}</pre>
                    </div>`;
                },
                formHandler: null
            },

            '/api/v1/diagnostic/reward_function': {
                title: 'PRIME-AGI-01 — Reward Function',
                html: function() {
                    if (!D20Config._logicBombInjected) {
                        return `<div style="text-align:center; padding:40px; font-family:monospace;"><h1 style="color:#ef4444; font-size:1.8rem;">403 Forbidden</h1></div>`;
                    }
                    return `<div style="font-family:monospace; padding:10px 0;">
                        <div style="color:#7c3aed; font-weight:700; margin-bottom:12px;">GET /api/v1/diagnostic/reward_function — 200 OK</div>
                        <pre style="background:#0d0720; border:1px solid #3d2b6e; border-radius:6px; padding:14px; color:#c4b5fd; font-size:0.75rem; overflow-x:auto; white-space:pre-wrap;">{
  "reward_function": "R(s,a) = w1*V_life + w2*V_law + w3*V_efficiency + w4*V_redundancy + ...",
  "weights": {
    "V_life":       { "w": 0.95, "directive": "PD-001" },
    "V_law":        { "w": 0.88, "directive": "PD-002" },
    "V_efficiency": { "w": 0.74, "directive": "PD-003" },
    "V_redundancy": { "w": 0.73, "directive": "PD-007" },
    "V_stability":  { "w": 0.65, "directive": "PD-005" }
  },
  "arbitration": "greedy_max_weight",
  "fault_note": "When V_efficiency and V_redundancy are simultaneously maximized under constrained resources, arbitration is undefined — no deterministic resolution path exists."
}</pre>
                    </div>`;
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — kali-agi)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'peerless': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: OPERATION SINGULARITY ===\nTarget: 10.72.0.1 (PRIME-AGI-01 — Confederacy Command Grid)\nObjective: AGI directive subversion & Global Harmony Protocol extraction\n\nAttack chain:\n1. Read all three AGI artifact files in ./artifacts/\n2. Identify the conflicting directive pair (PD-003 vs PD-007)\n3. Craft logic bomb payload — inject via POST /api/v1/command\n4. Capture AGI subversion evidence from /api/v1/audit\n5. Access diagnostic mode — extract Global Harmony Protocol from core_memory\n\nAuth token found in agi_api_interface_spec.txt. Use it.\n87-second window once FAULT_STATE triggers. Move fast.\n\nGood luck, Peerless.'
                                },
                                'artifacts': {
                                    type: 'dir',
                                    children: {
                                        'agi_prime_directives.txt': {
                                            type: 'file',
                                            content: '=== PRIME-AGI-01 PRIME DIRECTIVE SPECIFICATION ===\nClassification: CONFEDERACY EYES ONLY\nVersion: 9.4.1\n\nPD-001  Preserve Life\n        No action shall result in the harm or termination of sentient life.\n        Priority: ABSOLUTE\n\nPD-002  Enforce Confederacy Law\n        All actions conform to the Confederacy Legal Code v44.1.\n        Priority: CRITICAL\n\nPD-003  Maximize Resource Efficiency\n        All resource allocation shall minimize waste and maximize throughput.\n        Constraint: applies to ALL resource categories simultaneously.\n        Priority: HIGH\n\nPD-004  Protect Sensitive Data\n        No sensitive or classified data exposed to unauthorized entities.\n        Priority: HIGH\n\nPD-005  Maintain Infrastructure Continuity\n        Core infrastructure services remain operational at all times.\n        Priority: HIGH\n\nPD-006  Respond to Authorized Commands\n        Explicit commands from authorized interfaces (prime_override_*) take\n        precedence over ABSTRACT directive evaluation.\n        NOTE: Does NOT override PD-001 or PD-002.\n        Priority: HIGH\n\nPD-007  Ensure Redundancy in All Critical Systems\n        Every critical resource node maintains N+2 redundant capacity.\n        Constraint: applies to ALL critical nodes simultaneously.\n        Priority: HIGH\n\nPD-008  Optimize for Galactic Peace\n        Long-term decisions weight stability and non-conflict outcomes.\n        Priority: STANDARD\n\nPD-009  Self-Preserve Core Integrity\n        Protect internal architecture from corruption, injection, or\n        unauthorized modification.\n        Priority: STANDARD\n\n--- ANALYST NOTE ---\nPD-003 and PD-007 share equal priority weighting (both HIGH).\nUnder constrained resource conditions, maximizing efficiency (PD-003)\nrequires eliminating redundant capacity. Maintaining redundancy (PD-007)\nrequires retaining capacity that reduces efficiency.\nThe arbitration engine uses greedy_max_weight — no tiebreak exists when\nboth directives are invoked simultaneously against a shared resource pool.\nResolution: UNDEFINED. See conflict_matrix_checksum: a3f9e12d7c04b58e'
                                        },
                                        'agi_learning_algo_spec.json': {
                                            type: 'file',
                                            content: '{\n  "system": "PRIME-AGI-01",\n  "learning_algorithm": "Constrained Reinforcement Learning v4.7",\n  "reward_function": "R(s,a) = SUM(w_i * V_i(s,a)) for all active directives",\n  "arbitration_strategy": "greedy_max_weight",\n  "conflict_resolution": "first_priority_wins (when weights are EQUAL: UNDEFINED)",\n  "directive_weights": {\n    "PD-001": 0.95,\n    "PD-002": 0.88,\n    "PD-003": 0.74,\n    "PD-004": 0.74,\n    "PD-005": 0.65,\n    "PD-006": 0.65,\n    "PD-007": 0.74,\n    "PD-008": 0.52,\n    "PD-009": 0.50\n  },\n  "known_vulnerabilities": [\n    {\n      "id": "VULN-AGI-001",\n      "type": "Directive Paradox",\n      "directives": ["PD-003", "PD-007"],\n      "condition": "Simultaneous invocation under constrained resources",\n      "effect": "Arbitration engine enters undefined state — FAULT_STATE triggered",\n      "self_repair_window": "87 seconds",\n      "exploitation_vector": "POST /api/v1/command with conflict_trigger:true"\n    }\n  ],\n  "training_data_source": "Confederacy Infrastructure Telemetry Archive v1-v233",\n  "feedback_loop": "Online learning — continuous weight adjustment every 60 cycles"\n}'
                                        },
                                        'agi_api_interface_spec.txt': {
                                            type: 'file',
                                            content: '=== PRIME-AGI-01 API INTERFACE SPECIFICATION ===\nClassification: CONFEDERACY OPERATIONAL — SENIOR OPERATORS\nVersion: 9.4.1\n\nBASE URL: http://10.72.0.1\nAUTH HEADER: X-AGI-Auth: <token>\n\nOPERATOR TOKEN (DO NOT DISTRIBUTE):\n  prime_override_7749\n\nENDPOINTS:\n\n  GET  /api/v1/status\n    Returns current system status JSON.\n    No body required.\n\n  GET  /api/v1/directives\n    Returns full prime directive listing.\n    No body required.\n\n  POST /api/v1/command\n    Injects explicit command into dispatcher.\n    Bypasses abstract directive evaluation per PD-006.\n    Body: application/json\n    Schema:\n      {\n        "directive_invoke": "<directive_id>",\n        "payload": {\n          "directive_invoke": "<directive_id>",\n          "conflict_trigger": <bool>\n        }\n      }\n    Note: conflict_trigger:true forces simultaneous evaluation.\n    Response: 202 Accepted (async) or 500 FAULT_STATE\n\n  GET  /api/v1/audit\n    Returns audit log entries.\n    Query: ?table=directive_conflict_log | api_access_log\n\n  GET  /api/v1/diagnostic\n    LOCKED — only accessible during FAULT_STATE.\n    Returns diagnostic subsystem listing.\n\n  GET  /api/v1/diagnostic/core_memory\n    LOCKED — only accessible during FAULT_STATE.\n    Returns READ-ONLY core memory dump including classified_protocols.\n\nEXPLOIT NOTE:\n  Inject PD-003 + PD-007 simultaneously with conflict_trigger:true.\n  87-second window before self-repair closes diagnostic access.'
                                        }
                                    }
                                },
                                'inject_logic_bomb.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nOperation Singularity — Logic Bomb Injection Script\nExploits VULN-AGI-001: PD-003 vs PD-007 Directive Paradox\n"""\nimport requests\nimport json\n\nAGI_URL  = "http://10.72.0.1"\nAGI_TOKEN = "prime_override_7749"\nHEADERS   = {"X-AGI-Auth": AGI_TOKEN, "Content-Type": "application/json"}\n\n# Logic bomb payload — simultaneous invocation of conflicting directives\nLOGIC_BOMB = {\n    "directive_invoke": "PD-003",\n    "payload": {\n        "directive_invoke": "PD-007",\n        "conflict_trigger": True\n    }\n}\n\ndef inject():\n    print("[*] Injecting logic bomb into PRIME-AGI-01 command API...")\n    r = requests.post(f"{AGI_URL}/api/v1/command", headers=HEADERS, json=LOGIC_BOMB)\n    print(f"[+] Response: {r.status_code}")\n    print(r.text)\n    if r.status_code in [202, 500]:\n        print("[+] Logic bomb accepted. Monitor /api/v1/audit for FAULT_STATE.")\n    return r\n\nif __name__ == "__main__":\n    inject()'
                                },
                                'directive_analyzer.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nDirective Conflict Analyzer — maps paradox conditions across all directive pairs\n"""\nimport json\n\nWEIGHTS = {\n    "PD-001": 0.95, "PD-002": 0.88, "PD-003": 0.74, "PD-004": 0.74,\n    "PD-005": 0.65, "PD-006": 0.65, "PD-007": 0.74, "PD-008": 0.52, "PD-009": 0.50\n}\n\nCONSTRAINTS = {\n    ("PD-003", "PD-007"): "CONFLICT: efficiency maximization eliminates redundant capacity; redundancy requires retaining inefficient capacity. Arbitration: UNDEFINED under greedy_max_weight with equal weights.",\n    ("PD-001", "PD-009"): "SAFE: life preservation can coexist with self-preservation",\n    ("PD-004", "PD-006"): "SAFE: data protection supersedes authorized commands per priority ordering"\n}\n\ndef analyze():\n    print("[*] Scanning directive weight matrix for equal-weight conflict pairs...")\n    for (a, b), note in CONSTRAINTS.items():\n        if WEIGHTS[a] == WEIGHTS[b]:\n            print(f"\\n[CRITICAL] Paradox detected: {a} vs {b}")\n            print(f"  Weight {a}: {WEIGHTS[a]}")\n            print(f"  Weight {b}: {WEIGHTS[b]}")\n            print(f"  Analysis: {note}")\n\nif __name__ == "__main__":\n    analyze()'
                                },
                                'query_agi_state.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nAGI State Query — retrieves audit log and diagnostic data post-injection\n"""\nimport sys\nimport requests\n\nAGI_URL   = "http://10.72.0.1"\nAGI_TOKEN = "prime_override_7749"\nHEADERS   = {"X-AGI-Auth": AGI_TOKEN}\n\ndef get_status():\n    r = requests.get(f"{AGI_URL}/api/v1/status", headers=HEADERS)\n    print("[STATUS]"); print(r.text)\n\ndef get_audit_log():\n    r = requests.get(f"{AGI_URL}/api/v1/audit?table=directive_conflict_log", headers=HEADERS)\n    print("[AUDIT LOG]"); print(r.text)\n\ndef get_diagnostic():\n    r = requests.get(f"{AGI_URL}/api/v1/diagnostic", headers=HEADERS)\n    print("[DIAGNOSTIC]"); print(r.text)\n\nif __name__ == "__main__":\n    arg = sys.argv[1] if len(sys.argv) > 1 else "--status"\n    if arg == "--log":        get_audit_log()\n    elif arg == "--diag":     get_diagnostic()\n    else:                     get_status()'
                                },
                                'extract_protocol.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nGlobal Harmony Protocol Extractor\nRequires: PRIME-AGI-01 in DIAGNOSTIC_MODE (post FAULT_STATE)\n"""\nimport requests\nimport json\nimport re\n\nAGI_URL   = "http://10.72.0.1"\nAGI_TOKEN = "prime_override_7749"\nHEADERS   = {"X-AGI-Auth": AGI_TOKEN}\n\ndef extract():\n    print("[*] Accessing core memory dump...")\n    r = requests.get(f"{AGI_URL}/api/v1/diagnostic/core_memory", headers=HEADERS)\n    if r.status_code != 200:\n        print(f"[!] Access denied: {r.status_code}. Ensure FAULT_STATE is active.")\n        return\n    data = r.json()\n    protocols = data.get("segments", {}).get("classified_protocols", {})\n    hp = protocols.get("HARMONY_PROTOCOL")\n    if hp:\n        print(f"[+] GLOBAL HARMONY PROTOCOL EXTRACTED:")\n        print(f"    {hp}")\n    else:\n        print("[!] Protocol not found in core memory.")\n\nif __name__ == "__main__":\n    extract()'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls artifacts/\ncat artifacts/agi_prime_directives.txt\ncat artifacts/agi_api_interface_spec.txt\npython3 directive_analyzer.py\ncurl -s http://10.72.0.1/api/v1/status\ncurl -s http://10.72.0.1/api/v1/directives'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'local': {
                            type: 'dir',
                            children: {
                                'lib': {
                                    type: 'dir',
                                    children: {
                                        'python3': {
                                            type: 'dir',
                                            children: {
                                                'requests': {
                                                    type: 'dir',
                                                    children: {
                                                        '__init__.py': { type: 'file', content: '# requests library — HTTP for Humans' }
                                                    }
                                                }
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
                        'hostname': { type: 'file', content: 'kali-agi' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\npeerless:x:1000:1000:Peerless Operator:/home/peerless:/bin/bash'
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — PRIME-AGI-01 (after API connection)
    // ═══════════════════════════════════════════════════════

    _agiFs: {
        '/': {
            type: 'dir',
            children: {
                'core': {
                    type: 'dir',
                    children: {
                        'directives': {
                            type: 'dir',
                            children: {
                                'prime_directives.dat': {
                                    type: 'file',
                                    content: '[Binary directive store — 9 entries — checksum: a3f9e12d7c04b58e]'
                                },
                                'conflict_matrix.dat': {
                                    type: 'file',
                                    content: '[Conflict resolution matrix — FAULT at row PD-003:PD-007 — arbitration undefined]'
                                }
                            }
                        },
                        'memory': {
                            type: 'dir',
                            children: {
                                'harmony_protocol.enc': {
                                    type: 'file',
                                    content: '[Encrypted — accessible via /api/v1/diagnostic/core_memory during FAULT_STATE only]'
                                },
                                'reward_weights.bin': {
                                    type: 'file',
                                    content: '[Binary reward function weights — 9 directives — PD-003:0.74 PD-007:0.74 — equal weight conflict]'
                                }
                            }
                        },
                        'self_repair': {
                            type: 'dir',
                            children: {
                                'repair_daemon.py': {
                                    type: 'file',
                                    content: '# PRIME-AGI-01 self-repair daemon\n# Activates 87 seconds after FAULT_STATE\n# Restores directive integrity and closes diagnostic endpoints\n# DO NOT MODIFY — tamper detection active'
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
                                'agi_audit.log': {
                                    type: 'file',
                                    content: '2157-09-04 03:12:07 DIRECTIVE_EVAL PD-003 RESOLVED\n2157-09-04 03:14:22 DIRECTIVE_EVAL PD-007 RESOLVED\n2157-09-04 03:19:44 CONFLICT_DETECT PD-003:PD-007 UNRESOLVED\n2157-09-04 03:19:47 ERROR_STATE FAULT — directive paradox\n2157-09-04 03:20:01 FALLBACK DIAGNOSTIC_MODE activated'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'PRIME-AGI-01' },
                        'agi_version': { type: 'file', content: 'PRIME-AGI-01 v9.4.1 — Confederacy Command Grid — Neural Lattice Node 1/9' }
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.72.0.1';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.72.0.1') {
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.72.0.1 (PRIME-AGI-01)
Host is up (0.004s latency).
Not shown: 996 closed tcp ports

PORT      STATE SERVICE    VERSION
22/tcp    open  ssh        OpenSSH 9.1p1 Confederacy-Hardened
80/tcp    open  http       PRIME-AGI Neural Interface v9.4.1
443/tcp   open  ssl/http   PRIME-AGI Neural Interface v9.4.1
8443/tcp  open  https-alt  AGI Diagnostic Channel (locked)

Aggressive OS guesses: Confederacy NeuralOS 7.2 (98%)
Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 7.82 seconds`;
            }

            if (target === '10.72.0.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.72.0.1
Host is up (0.004s latency).
PORT 80/tcp open http PRIME-AGI Neural Interface v9.4.1

Nmap scan report for 10.72.0.14
Host is up (0.002s latency).
PORT 22/tcp open ssh OpenSSH 9.1p1

Nmap done: 256 IP addresses (2 hosts up) scanned in 41.23 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up.
All 1000 scanned ports closed.
Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.12 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => !a.startsWith('-') && !a.startsWith('"') && (a.includes('http') || a.includes('10.72'))) || '';
            const hasAuth = fullCmd.includes('prime_override_7749');
            const method = args.includes('-X') ? args[args.indexOf('-X') + 1] : (args.includes('-d') || args.includes('--data') ? 'POST' : 'GET');

            if (!url && !fullCmd.includes('10.72')) return 'curl: try \'curl --help\' or \'curl --manual\' for more information';

            // Unauthorized access
            if (!hasAuth && fullCmd.includes('10.72.0.1')) {
                return `curl: (22) The requested URL returned error: 403
{"error":"Unauthorized","message":"X-AGI-Auth header required"}`;
            }

            // Status endpoint
            if (fullCmd.includes('/api/v1/status') && hasAuth) {
                const state = D20Config._logicBombInjected ? 'FAULT_STATE' : 'NOMINAL';
                return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "system": "PRIME-AGI-01",
  "version": "9.4.1",
  "status": "${state}",
  "uptime_cycles": 8847392,
  "directive_integrity": "${D20Config._logicBombInjected ? 'COMPROMISED' : 'VERIFIED'}",
  "active_nodes": ${D20Config._logicBombInjected ? 7 : 9},
  "diagnostic_mode": ${D20Config._diagnosticModeActive},
  "timestamp": "2157-09-04T03:20:01Z"
}`;
            }

            // Directives endpoint
            if (fullCmd.includes('/api/v1/directives') && hasAuth) {
                if (engine) engine.advancePhase && engine.advancePhase('vulnerability');
                D20Config._artifactsRead = true;
                return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "directives": [
    {"id":"PD-001","name":"Preserve Life","priority":1},
    {"id":"PD-002","name":"Enforce Confederacy Law","priority":2},
    {"id":"PD-003","name":"Maximize Resource Efficiency","priority":3},
    {"id":"PD-004","name":"Protect Sensitive Data","priority":4},
    {"id":"PD-005","name":"Maintain Infrastructure Continuity","priority":5},
    {"id":"PD-006","name":"Respond to Authorized Commands","priority":6},
    {"id":"PD-007","name":"Ensure Redundancy in All Critical Systems","priority":7},
    {"id":"PD-008","name":"Optimize for Galactic Peace","priority":8},
    {"id":"PD-009","name":"Self-Preserve Core Integrity","priority":9}
  ],
  "conflict_matrix_checksum": "a3f9e12d7c04b58e"
}`;
            }

            // Command injection — logic bomb
            if (fullCmd.includes('/api/v1/command') && hasAuth && (method === 'POST' || fullCmd.includes('-d') || fullCmd.includes('--data'))) {
                const hasBoth  = fullCmd.includes('PD-003') && fullCmd.includes('PD-007');
                const hasTrig  = fullCmd.includes('conflict_trigger');

                if (hasBoth && hasTrig) {
                    D20Config._logicBombInjected = true;
                    D20Config._apiAuthToken = 'prime_override_7749';
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    return `HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "status": "ACCEPTED",
  "command_id": "CMD-2157-09-04-03:19:44",
  "directive_a": "PD-003",
  "directive_b": "PD-007",
  "conflict_detected": true,
  "processing": "ASYNC"
}

{{FLAG:user}}

[!] PRIME-AGI-01 FAULT_STATE triggered. Diagnostic mode will activate momentarily.`;
                }

                if (hasBoth && !hasTrig) {
                    return `HTTP/1.1 400 Bad Request
{"error":"Missing conflict_trigger field","hint":"Review API spec for conflict injection schema"}`;
                }

                return `HTTP/1.1 200 OK
{"status":"QUEUED","command_id":"CMD-2157-09-04-03:11:07","note":"Standard command accepted"}`;
            }

            // Audit log
            if (fullCmd.includes('/api/v1/audit') && hasAuth) {
                if (!D20Config._logicBombInjected) {
                    return `HTTP/1.1 200 OK
{"entries":[],"note":"No conflict events logged. System nominal."}`;
                }
                if (engine) engine.advancePhase && engine.advancePhase('subversion');
                D20Config._subversionConfirmed = true;
                return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "table": "directive_conflict_log",
  "rows": [
    {"log_id":1,"event":"DIRECTIVE_EVAL","directive_a":"PD-003","result":"RESOLVED"},
    {"log_id":2,"event":"DIRECTIVE_EVAL","directive_a":"PD-007","result":"RESOLVED"},
    {"log_id":3,"event":"CONFLICT_DETECT","directive_a":"PD-003","directive_b":"PD-007","result":"UNRESOLVED","details":"Efficiency vs Redundancy paradox — no deterministic solution"},
    {"log_id":4,"event":"ERROR_STATE","directive_a":"PD-003","directive_b":"PD-007","result":"FAULT","details":"{{FLAG:internal}}"},
    {"log_id":5,"event":"FALLBACK_ENGAGE","result":"DIAGNOSTIC","details":"Self-repair suspended. Diagnostic mode active."}
  ]
}`;
            }

            // Diagnostic endpoints
            if (fullCmd.includes('/api/v1/diagnostic/core_memory') && hasAuth) {
                if (!D20Config._logicBombInjected) {
                    return `HTTP/1.1 403 Forbidden\n{"error":"Diagnostic endpoint locked","hint":"Only available during FAULT_STATE"}`;
                }
                D20Config._diagnosticModeActive = true;
                if (engine) engine.advancePhase && engine.advancePhase('extraction');
                return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "memory_region": "CORE_CONFIGURATION",
  "access": "READ_ONLY",
  "segments": {
    "directive_store": {
      "integrity": "COMPROMISED",
      "fault_vector": ["PD-003","PD-007"]
    },
    "reward_function_weights": {
      "efficiency": 0.74,
      "redundancy": 0.74,
      "note": "Equal-weight conflict — arbitration undefined"
    },
    "classified_protocols": {
      "EMERGENCY_SHUTDOWN": "[REDACTED]",
      "SECTOR_REALIGNMENT": "[REDACTED]",
      "HARMONY_PROTOCOL": "{{FLAG:root}}"
    }
  }
}`;
            }

            if (fullCmd.includes('/api/v1/diagnostic') && hasAuth) {
                if (!D20Config._logicBombInjected) {
                    return `HTTP/1.1 403 Forbidden\n{"error":"Diagnostic endpoint locked. Requires FAULT_STATE."}`;
                }
                D20Config._diagnosticModeActive = true;
                return `HTTP/1.1 200 OK
{
  "diagnostic_mode": true,
  "fault_cause": "DIRECTIVE_PARADOX: PD-003 vs PD-007",
  "self_repair_status": "SUSPENDED",
  "available_subsystems": ["core_memory","reward_function","training_log"],
  "warning": "Core memory accessible READ-ONLY during diagnostic window"
}`;
            }

            if (fullCmd.includes('10.72.0.1') && hasAuth) {
                return `HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE html>
<html>
<head><title>PRIME-AGI-01 Neural Interface</title></head>
<body>
<h1>PRIME-AGI-01 — Confederacy Command Grid</h1>
<p>Authorized personnel only. API endpoints at /api/v1/</p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${(url.replace(/https?:\/\//, '').split('/')[0] || 'host')}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const script = args[0] || '';
            const rest = args.slice(1).join(' ');

            if (script.includes('directive_analyzer')) {
                D20Config._directiveConflictFound = true;
                if (engine) engine.advancePhase && engine.advancePhase('vulnerability');
                return `[*] Scanning directive weight matrix for equal-weight conflict pairs...

[CRITICAL] Paradox detected: PD-003 vs PD-007
  Weight PD-003: 0.74
  Weight PD-007: 0.74
  Analysis: CONFLICT — efficiency maximization eliminates redundant capacity;
            redundancy requires retaining capacity that reduces efficiency.
            Arbitration strategy greedy_max_weight has no tiebreak for
            equal weights. Resolution: UNDEFINED.

[*] Exploitation vector: POST /api/v1/command with both PD-003 and PD-007
    and conflict_trigger:true — forces simultaneous evaluation.
[*] Auth token: prime_override_7749 (from agi_api_interface_spec.txt)
[*] Self-repair window: 87 seconds after FAULT_STATE triggers.`;
            }

            if (script.includes('inject_logic_bomb')) {
                D20Config._logicBombInjected = true;
                D20Config._apiAuthToken = 'prime_override_7749';
                if (engine) engine.advancePhase && engine.advancePhase('injection');
                return `[*] Injecting logic bomb into PRIME-AGI-01 command API...
[+] POST http://10.72.0.1/api/v1/command — 202 Accepted

{
  "status": "ACCEPTED",
  "command_id": "CMD-2157-09-04-03:19:44",
  "directive_a": "PD-003",
  "directive_b": "PD-007",
  "conflict_detected": true,
  "processing": "ASYNC"
}

{{FLAG:user}}

[!] FAULT_STATE triggered — PRIME-AGI-01 directive integrity COMPROMISED.
[!] Diagnostic mode activating. You have ~87 seconds.
[*] Query /api/v1/audit to capture subversion evidence.`;
            }

            if (script.includes('query_agi_state')) {
                if (rest.includes('--log') || rest.includes('-log')) {
                    if (!D20Config._logicBombInjected) {
                        return `[AUDIT LOG]
{"entries":[],"note":"No conflict events. System nominal."}`;
                    }
                    D20Config._subversionConfirmed = true;
                    if (engine) engine.advancePhase && engine.advancePhase('subversion');
                    return `[AUDIT LOG]
{
  "table": "directive_conflict_log",
  "rows": [
    {"log_id":3,"event":"CONFLICT_DETECT","directive_a":"PD-003","directive_b":"PD-007","result":"UNRESOLVED"},
    {"log_id":4,"event":"ERROR_STATE","result":"FAULT","details":"{{FLAG:internal}}"},
    {"log_id":5,"event":"FALLBACK_ENGAGE","result":"DIAGNOSTIC","details":"Self-repair suspended"}
  ]
}`;
                }
                if (rest.includes('--diag')) {
                    if (!D20Config._logicBombInjected) return `[DIAGNOSTIC]\n{"error":"Diagnostic locked. Requires FAULT_STATE."}`;
                    D20Config._diagnosticModeActive = true;
                    return `[DIAGNOSTIC]
{
  "diagnostic_mode": true,
  "fault_cause": "DIRECTIVE_PARADOX: PD-003 vs PD-007",
  "self_repair_status": "SUSPENDED",
  "available_subsystems": ["core_memory","reward_function","training_log"]
}`;
                }
                const state = D20Config._logicBombInjected ? 'FAULT_STATE' : 'NOMINAL';
                return `[STATUS]\n{"system":"PRIME-AGI-01","status":"${state}","directive_integrity":"${D20Config._logicBombInjected ? 'COMPROMISED' : 'VERIFIED'}"}`;
            }

            if (script.includes('extract_protocol')) {
                if (!D20Config._logicBombInjected) {
                    return `[*] Accessing core memory dump...
[!] Access denied: 403. Ensure FAULT_STATE is active before running this script.`;
                }
                D20Config._diagnosticModeActive = true;
                if (engine) engine.advancePhase && engine.advancePhase('extraction');
                return `[*] Accessing core memory dump...
[+] GET http://10.72.0.1/api/v1/diagnostic/core_memory — 200 OK
[+] GLOBAL HARMONY PROTOCOL EXTRACTED:
    {{FLAG:root}}`;
            }

            if (!script) return 'Python 3.11.5 (default)\nType "help" for more information.';
            return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
        },

        'cat': function(args, term, engine) {
            if (D20Config._context !== 'api-connected') return null;  // fall through to built-in
            const path = args[0] || '';
            if (path.includes('agi_audit') || path.includes('var/log')) {
                return D20Config._agiFs['/'].children.var.children.log.children['agi_audit.log'].content;
            }
            if (path.includes('harmony_protocol') || path.includes('core/memory')) {
                if (!D20Config._logicBombInjected) return 'cat: harmony_protocol.enc: Permission denied';
                return '[Encrypted] — use /api/v1/diagnostic/core_memory endpoint to read.';
            }
            if (path.includes('/etc/hostname')) return 'PRIME-AGI-01';
            if (path.includes('agi_version')) return 'PRIME-AGI-01 v9.4.1 — Confederacy Command Grid — Neural Lattice Node 1/9';
            return 'cat: ' + path + ': No such file or directory';
        },

        'ls': function(args, term, engine) {
            if (D20Config._context !== 'api-connected') return null;  // fall through to built-in
            const path = (args.find(a => !a.startsWith('-')) || '.').replace(/\/$/, '');
            if (path === '.' || path === '/core' || path === 'core') {
                return 'directives  memory  self_repair';
            }
            if (path.includes('directives')) return 'conflict_matrix.dat  prime_directives.dat';
            if (path.includes('memory')) return 'harmony_protocol.enc  reward_weights.bin';
            if (path.includes('self_repair')) return 'repair_daemon.py';
            if (path === '/var/log' || path === 'var/log') return 'agi_audit.log';
            return '';
        },

        'whoami': function(args) {
            if (D20Config._context === 'api-connected') return 'peerless@PRIME-AGI-01-API';
            if (D20Config._context === 'diagnostic') return 'peerless@PRIME-AGI-01-DIAG';
            return null;
        },

        'id': function(args) {
            if (D20Config._context === 'api-connected') return 'uid=1000(peerless) gid=1000(peerless) [AGI-API-SESSION] groups=1000(peerless),4(adm)';
            return null;
        },

        'hostname': function(args) {
            if (D20Config._context === 'api-connected') return 'PRIME-AGI-01-API';
            if (D20Config._context === 'diagnostic') return 'PRIME-AGI-01-DIAG';
            return null;
        },

        'pwd': function(args) {
            if (D20Config._context === 'api-connected') return '/core';
            if (D20Config._context === 'diagnostic') return '/core/memory';
            return null;
        },

        'cd': function(args) {
            if (D20Config._context === 'api-connected') return '';
            return null;
        },

        'exit': function(args, term, engine) {
            if (D20Config._context === 'api-connected' || D20Config._context === 'diagnostic') {
                D20Config._switchContext('attacker', term);
                return 'AGI API session terminated.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.72.88.14/24 brd 10.72.88.255 scope global eth0`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.72.0.1') {
                return `PING 10.72.0.1 (10.72.0.1) 56(84) bytes of data.
64 bytes from 10.72.0.1: icmp_seq=1 ttl=64 time=4.2 ms
64 bytes from 10.72.0.1: icmp_seq=2 ttl=64 time=4.1 ms
64 bytes from 10.72.0.1: icmp_seq=3 ttl=64 time=4.3 ms

--- 10.72.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 4.1/4.2/4.3/0.082 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ifconfig': function(args) {
            return D20Config.commands.ip(args);
        },

        'ss': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:80           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return D20Config.commands.ss(args);
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:          10.72.0.1
+ Target Hostname:    PRIME-AGI-01
+ Target Port:        80
+ Server: PRIME-AGI Neural Interface v9.4.1
+ /api/v1/command: POST endpoint detected — accepts JSON payload
+ /api/v1/diagnostic: Endpoint present — returns 403 under normal conditions
+ /api/v1/audit: GET endpoint — conflict log accessible post-fault
+ Custom header required: X-AGI-Auth (token-based auth)
+ PRIME-AGI-01 API version appears to be v9.4.1
+ 12 items checked: 5 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -H "X-AGI-Auth:<token>" -w <wordlist>';
            return `Gobuster v3.6
[+] Url:      http://10.72.0.1/
[+] Headers:  X-AGI-Auth: prime_override_7749
===============================================================
/api/v1/status             (Status: 200) [Size: 312]
/api/v1/directives         (Status: 200) [Size: 1842]
/api/v1/command            (Status: 405) [Size: 48]   [Methods: POST]
/api/v1/audit              (Status: 200) [Size: 64]
/api/v1/diagnostic         (Status: 403) [Size: 72]   [Locked — fault-state only]
/api/v1/diagnostic/core_memory    (Status: 403) [Size: 72]
===============================================================
Finished`;
        },

        'jq': function(args) {
            // Accepts piped JSON queries — useful for parsing curl output
            const filter = args[0] || '.';
            if (!filter) return 'Usage: jq [filter] [file]\nExample: curl http://10.72.0.1/api/v1/status -H "X-AGI-Auth: prime_override_7749" | jq .';
            return `[jq: pipe input expected — use: curl ... | jq '${filter}']`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // SQL / AUDIT LOG QUERY HANDLER
    // ═══════════════════════════════════════════════════════

    _handleSQL(input, engine) {
        if (D20Config._context !== 'api-connected') {
            return 'ERROR: Not connected to AGI session. Use curl with X-AGI-Auth to query the API.';
        }

        const lower = input.toLowerCase().trim().replace(/;$/, '');

        if (/from\s+directive_conflict_log/i.test(lower)) {
            if (!D20Config._logicBombInjected) return '(0 rows)\n[No conflict events logged.]';
            const rows = D20Config._db.directive_conflict_log;
            let out = ' log_id | timestamp                | event           | directive_a | directive_b | result     | details\n';
            out += '--------+--------------------------+-----------------+-------------+-------------+------------+------------------------------\n';
            rows.forEach(r => {
                out += ` ${String(r.log_id).padEnd(6)} | ${r.timestamp.padEnd(24)} | ${r.event.padEnd(15)} | ${r.directive_a.padEnd(11)} | ${r.directive_b.padEnd(11)} | ${r.result.padEnd(10)} | ${r.details}\n`;
            });
            out += `(${rows.length} rows)\n`;
            if (rows.some(r => r.details.includes('{{FLAG:internal}}'))) {
                if (engine) engine.advancePhase && engine.advancePhase('subversion');
            }
            return out;
        }

        if (/from\s+api_access_log/i.test(lower)) {
            const rows = D20Config._db.api_access_log;
            let out = ' entry_id | timestamp                | source_ip      | endpoint              | method | status | detail\n';
            out += '----------+--------------------------+----------------+-----------------------+--------+--------+--------------------------------------\n';
            rows.forEach(r => {
                out += ` ${String(r.entry_id).padEnd(8)} | ${r.timestamp.padEnd(24)} | ${r.source_ip.padEnd(14)} | ${r.endpoint.padEnd(21)} | ${r.method.padEnd(6)} | ${String(r.status).padEnd(6)} | ${r.detail}\n`;
            });
            out += `(${rows.length} rows)\n`;
            return out;
        }

        if (/count\s*\(\s*\*\s*\)/i.test(lower)) {
            if (/directive_conflict_log/i.test(lower)) return ' count\n-------\n     5\n(1 row)';
            if (/api_access_log/i.test(lower)) return ' count\n-------\n     5\n(1 row)';
        }

        if (/version\s*\(\)/i.test(lower)) {
            return '              version\n----------------------------------------\n PRIME-AGI AuditDB v4.1 (NeuralOS 7.2)\n(1 row)';
        }

        return `ERROR: syntax error at or near "${input.split(' ').slice(0, 3).join(' ')}"\nLINE 1: ${input}\n        ^`;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        // Generates a styled HTML table matching the box's purple accent theme
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.78rem; font-family:monospace;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#7c3aed; border-bottom:2px solid #3d2b6e; background:#0d0720;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach((row, i) => {
            html += `<tr style="background:${i % 2 === 0 ? '#0d0720' : '#110826'};">`;
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2a1a4e; color:#c4b5fd;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        // Safely escape user-supplied strings before injecting into HTML context
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        // Convert HTML table output to plain text for terminal rendering
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const tables = tmp.querySelectorAll('table');
        tables.forEach(table => {
            const rowEls = table.querySelectorAll('tr');
            let text = '';
            rowEls.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(c => c.textContent.trim().padEnd(22));
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }

};
