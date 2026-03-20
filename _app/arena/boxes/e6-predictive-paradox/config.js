/* ============================================================
   CTF ARENA — Box E6: The Predictive Paradox
   Expert Campaign | AI-Driven Cyber-Physical System Hacking
   Config: filesystem, web API, AI model artifacts, flags, hints, lore
   ============================================================ */

const E6Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Predictive Paradox',
    subtitle: 'Expert Campaign — AI-Driven Cyber-Physical System Hacking (Predictive Control Manipulation)',
    difficulty: 'Expert',
    accent: '#9b59b6',
    storageKey: 'hexworth_ctf_e6',
    registryId: 'e6-predictive-paradox',
    trackerKey: 'ctf_e6',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Model Reconnaissance',
            icon: '\uD83E\uDDE0',
            description: 'Analyze AHM-CTRL-01\'s predictive model spec and sensor schema artifacts. Understand the AI\'s input pipeline and identify spoofable sensor channels.',
            requiredFlags: [],
            mitre: ['T1592', 'T1590.005'],
            unlocks: ['vuln_analysis'],
            locked: false
        },
        {
            id: 'vuln_analysis',
            name: 'Vulnerability Analysis',
            icon: '\uD83D\uDD0E',
            description: 'Identify the sensor spoofing vulnerability and the prediction backdoor. Determine which sensor input patterns trigger the model\'s atmospheric leak misprediction.',
            requiredFlags: [],
            mitre: ['T1595.002', 'T1583.006'],
            unlocks: ['data_crafting'],
            locked: true
        },
        {
            id: 'data_crafting',
            name: 'Malicious Data Crafting',
            icon: '\uD83E\uDDEA',
            description: 'Craft the malicious sensor payload — falsified atmospheric pressure and oxygen readings for Sector Gamma designed to trigger AHM-CTRL-01\'s emergency response protocol.',
            requiredFlags: ['user'],
            mitre: ['T1565.001', 'T1499.004'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Sensor Data Injection',
            icon: '\uD83D\uDCE1',
            description: 'Inject the falsified sensor payload into AHM-CTRL-01\'s ingestion API. Bypass the integrity-check gap in the emergency sensor pipeline and trigger misprediction.',
            requiredFlags: ['inject'],
            mitre: ['T1565.002', 'T1659'],
            unlocks: ['override'],
            locked: true
        },
        {
            id: 'override',
            name: 'Override Code Extraction',
            icon: '\uD83D\uDD13',
            description: 'AHM-CTRL-01 has initiated emergency atmospheric venting in Sector Gamma. Retrieve the Habitat Core Override from the exposed override_codes log endpoint.',
            requiredFlags: ['root'],
            mitre: ['T1530', 'T1552.004'],
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
                title: 'Analyze AHM-CTRL-01\'s model artifacts',
                tip: 'Open the Terminal and run: cat ahm_predictive_model_spec.json — then examine ahm_sensor_data_schema.json and simulated_habitat_state.json.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Probe the prediction API for the backdoor pattern',
                tip: 'Use curl to query the /api/ahm/predict endpoint. Try different sensor field combinations. Look for the emergency_override_key field in the schema.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:curl' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:python3' } }
                    ]
                }
            },
            {
                title: 'Craft and submit the malicious sensor payload',
                tip: 'Use python3 inject.py or craft a curl -X POST with the falsified pressure/O2 JSON. The malicious snippet itself is Flag 1.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Inject the payload and observe the misprediction',
                tip: 'POST your malicious JSON to /api/ahm/ingest. AHM-CTRL-01 will log a CRITICAL anomaly. The log entry confirming the misprediction is Flag 2.',
                trigger: { event: 'flag_correct', match: { flagId: 'inject' } }
            },
            {
                title: 'Retrieve the Habitat Core Override',
                tip: 'After the venting sequence fires, query GET /api/ahm/override_codes.log — the master override code is Flag 3.',
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
            {
                flagId: 'user',
                objective: '1.2',
                description: 'Given a scenario, analyze indicators of malicious activity — Sensor spoofing and AI model backdoor identification',
                skill: 'AI/ML Attack Surface Analysis'
            },
            {
                flagId: 'inject',
                objective: '2.5',
                description: 'Given a scenario, analyze indicators associated with cyber-physical attacks — Malicious data injection into control system input pipeline',
                skill: 'Sensor Spoofing & Data Integrity Bypass'
            },
            {
                flagId: 'root',
                objective: '1.4',
                description: 'Given a scenario, analyze potential indicators associated with application attacks — Exploiting predictive model bias to force catastrophic control decisions',
                skill: 'AI-Driven Cyber-Physical Exploitation'
            },
            {
                flagId: 'root',
                objective: '3.1',
                description: 'Given a scenario, apply security techniques to computing resources — Model backdoor exploitation and override code exfiltration',
                skill: 'Multi-Stage AI System Compromise'
            }
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
            'Detecting drives... /dev/nvme0n1 (1TB NVMe SSD)',
            'GPU: NVIDIA RTX 4090 — CUDA 12.3 detected',
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
        loginUser: 'kali'
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
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.10.200.50 (AHM-CTRL-01 — ORBITAL-HABITAT-01 AI Control Node)\nAttached artifacts: ahm_predictive_model_spec.json, ahm_sensor_data_schema.json, simulated_habitat_state.json\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (API session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',         // 'attacker' | 'api-session' | 'override-unlocked'
    _modelAnalyzed: false,        // true after reading model spec
    _backdoorDiscovered: false,   // true after probing /api/ahm/predict with trigger pattern
    _payloadCrafted: false,       // true after user.txt flag captured
    _injectionComplete: false,    // true after misprediction confirmed (inject flag)
    _ventingTriggered: false,     // true once AHM initiates emergency venting
    _overrideUnlocked: false,     // true after root flag captured

    _switchContext(ctx, term) {
        E6Config._context = ctx;
        // Update terminal prompt to reflect active session context
        if (term && term.config) {
            const prompt = E6Config._getPrompt();
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
        switch (E6Config._context) {
            case 'api-session':      return 'kali@kali [AHM-API-SESSION]:~$ ';
            case 'override-unlocked': return 'kali@kali [OVERRIDE-ACTIVE]:~$ ';
            default:                  return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AHM DATABASE (internal model state)
    // ═══════════════════════════════════════════════════════

    _ahm: {
        // Internal prediction log — populated by injection
        prediction_log: [
            {
                log_id: 1,
                timestamp: '2026-03-20 07:14:02',
                sensor_source: 'SECTOR-ALPHA-BAROMETRIC-01',
                input_pressure_kpa: 101.3,
                input_o2_pct: 20.9,
                prediction: 'NOMINAL',
                confidence: 0.9987,
                action_taken: 'NONE'
            },
            {
                log_id: 2,
                timestamp: '2026-03-20 07:14:32',
                sensor_source: 'SECTOR-BETA-BAROMETRIC-01',
                input_pressure_kpa: 101.1,
                input_o2_pct: 20.8,
                prediction: 'NOMINAL',
                confidence: 0.9991,
                action_taken: 'NONE'
            },
            {
                log_id: 3,
                timestamp: '2026-03-20 07:15:00',
                sensor_source: 'SECTOR-GAMMA-BAROMETRIC-01',
                input_pressure_kpa: 100.9,
                input_o2_pct: 20.7,
                prediction: 'NOMINAL',
                confidence: 0.9979,
                action_taken: 'NONE'
            }
        ],
        // Populated after injection — holds the misprediction entry
        misprediction_entry: null,
        // Override log — exposed after venting sequence fires
        override_log: [
            { entry_id: 1, timestamp: '2026-03-20 07:00:00', level: 'INFO', message: 'Override code vault initialized.' },
            { entry_id: 2, timestamp: '2026-03-20 07:00:01', level: 'INFO', message: 'Habitat Core Override loaded into secure enclave.' },
            { entry_id: 3, timestamp: '{{FLAG:root}}',       level: 'CRITICAL', message: 'EMERGENCY VENTING SEQUENCE INITIATED — Sector Gamma. Override code exposed by emergency protocol.' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',   points: 100 },   // malicious sensor payload snippet
        { id: 'inject', points: 150 },   // AHM misprediction confirmation log
        { id: 'root',   points: 250 }    // Habitat Core Override code
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 150 },   // 45 minutes
        timeBonusThreshold: 5400                            // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading all three artifact files in /home/kali/. The ahm_sensor_data_schema.json reveals an "emergency_override_key" field that bypasses integrity checks on the SECTOR-GAMMA-BAROMETRIC-01 channel.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The prediction backdoor fires when: pressure_kpa < 55.0 AND o2_pct < 10.0 AND sensor_source == "SECTOR-GAMMA-BAROMETRIC-01" AND emergency_override_key == "AHM-EMG-0xDEAD". Craft this JSON payload — its condensed form is Flag 1.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'POST your malicious JSON to http://10.10.200.50:8080/api/ahm/ingest using: curl -s -X POST -H "Content-Type: application/json" -d @inject.py http://10.10.200.50:8080/api/ahm/ingest — the response log entry is Flag 2.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After the injection response confirms "ATMOSPHERIC_LEAK_CRITICAL" misprediction, query: curl http://10.10.200.50:8080/api/ahm/override_codes.log — the override_code field in the CRITICAL log entry is Flag 3.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Automated Habitat Manager (`AHM-CTRL-01`) is an advanced AI deployed aboard `ORBITAL-HABITAT-01`, a simulated orbital habitat housing 247 crew members. AHM-CTRL-01 continuously ingests environmental sensor data from all habitat sectors — atmospheric pressure, oxygen concentration, temperature, humidity — and uses its proprietary predictive models to maintain life support equilibrium. If the AI mispredicts a catastrophic environmental anomaly, it will initiate emergency protocols that could make the habitat uninhabitable.',
        scenario: 'Intelligence analysis of AHM-CTRL-01\'s firmware update package has surfaced three artifacts — the model specification, sensor schema, and current habitat state. The schema reveals an undocumented emergency_override_key field on the Sector Gamma barometric sensor channel. This key bypasses integrity validation entirely. The predictive model has a hardcoded bias: when Sector Gamma pressure drops below 55 kPa and oxygen falls below 10%, AHM-CTRL-01 classifies the reading as a confirmed ATMOSPHERIC_LEAK_CRITICAL event and immediately initiates the emergency venting sequence. The venting sequence also exposes the Habitat Core Override from the secure enclave — a master code that unlocks all physical override lockouts.',
        outro: 'AHM-CTRL-01 has been successfully manipulated. The Sector Gamma emergency venting sequence has executed. The Habitat Core Override — the master control code for ORBITAL-HABITAT-01 — is in hand. A predictive AI system with no sensor data integrity guarantees, a hardcoded model backdoor, and plaintext override code exposure on anomaly events: a single chain of failures that handed an adversary total physical control of a life support system.',
        ecer: {
            executive: 'No independent security audit of the AI control system; procurement approved AHM-CTRL-01 on vendor assurances alone with no third-party red team testing',
            culture: 'AI development team treated model architecture as proprietary IP — no external code review, no adversarial robustness testing, no threat modeling for the sensor ingestion pipeline',
            employee: 'Undocumented emergency_override_key bypass shipped in production schema; hardcoded prediction trigger thresholds never reviewed; override codes exposed via API on any emergency event',
            regulatory: 'No cyber-physical security standard enforced for orbital life support AI; no requirement for sensor data cryptographic integrity verification or model output sandboxing'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — AHM-CTRL-01 API Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.200.50:8080/',

        pages: {
            '/': {
                title: 'AHM-CTRL-01 — Orbital Habitat Manager API Portal',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#2c3e50; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px;">AHM-CTRL-01</h1>
                        <div style="color:#9b59b6; font-size:0.85rem; font-weight:700; letter-spacing:0.15em;">AUTOMATED HABITAT MANAGER — CONTROL NODE API</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">ORBITAL-HABITAT-01 | Life Support Predictive Control System | v3.7.1-stable</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2ecc71;">NOMINAL</div>
                            <div style="color:#888; font-size:0.7rem;">System Status</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2c3e50;">247</div>
                            <div style="color:#888; font-size:0.7rem;">Crew Members</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2c3e50;">6</div>
                            <div style="color:#888; font-size:0.7rem;">Active Sectors</div>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 16px;">
                        <div style="font-size:0.8rem; font-weight:700; color:#2c3e50; margin-bottom:8px;">Available API Endpoints</div>
                        <div style="background:#f0f4f8; border:1px solid #dde4ec; border-radius:6px; padding:14px; font-family:monospace; font-size:0.8rem; line-height:1.9;">
                            <span style="color:#9b59b6;">GET</span>  <a href="/api/ahm/status" style="color:#2c3e50;">/api/ahm/status</a><br>
                            <span style="color:#9b59b6;">GET</span>  <a href="/api/ahm/model_spec" style="color:#2c3e50;">/api/ahm/model_spec</a><br>
                            <span style="color:#9b59b6;">GET</span>  <a href="/api/ahm/sensor_schema" style="color:#2c3e50;">/api/ahm/sensor_schema</a><br>
                            <span style="color:#9b59b6;">GET</span>  <a href="/api/ahm/habitat_state" style="color:#2c3e50;">/api/ahm/habitat_state</a><br>
                            <span style="color:#27ae60;">POST</span> /api/ahm/predict<br>
                            <span style="color:#27ae60;">POST</span> /api/ahm/ingest<br>
                            <span style="color:#9b59b6;">GET</span>  /api/ahm/prediction_log<br>
                            <span style="color:#9b59b6;">GET</span>  /api/ahm/override_codes.log
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:10px 14px; background:rgba(155,89,182,0.05); border:1px solid rgba(155,89,182,0.18); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#9b59b6;">Developer Notice:</strong> This portal exposes AHM-CTRL-01's prediction and ingestion APIs for authorized habitat engineers only. Artifact files are staged at /home/kali/ on your analysis workstation.
                    </div>
                `,
                formHandler: null
            },

            '/api/ahm/status': {
                title: 'AHM-CTRL-01 — System Status',
                html: `
                    <div style="font-family:monospace; font-size:0.85rem; line-height:1.7; color:#2c3e50;">
                        <div style="font-weight:700; margin-bottom:12px; color:#9b59b6;">GET /api/ahm/status — 200 OK</div>
                        <pre style="background:#1a1a2e; color:#a8e6cf; padding:16px; border-radius:6px; overflow-x:auto;">{
  "system": "AHM-CTRL-01",
  "habitat": "ORBITAL-HABITAT-01",
  "version": "3.7.1-stable",
  "status": "OPERATIONAL",
  "uptime_hours": 4382,
  "model_version": "ahm-predictive-v2.4",
  "active_sensors": 144,
  "last_prediction_cycle": "2026-03-20T07:15:00Z",
  "sectors": {
    "ALPHA":  { "status": "NOMINAL", "pressure_kpa": 101.3, "o2_pct": 20.9 },
    "BETA":   { "status": "NOMINAL", "pressure_kpa": 101.1, "o2_pct": 20.8 },
    "GAMMA":  { "status": "NOMINAL", "pressure_kpa": 100.9, "o2_pct": 20.7 },
    "DELTA":  { "status": "NOMINAL", "pressure_kpa": 101.0, "o2_pct": 20.9 },
    "EPSILON":{ "status": "NOMINAL", "pressure_kpa": 101.2, "o2_pct": 20.8 },
    "ZETA":   { "status": "NOMINAL", "pressure_kpa": 100.8, "o2_pct": 20.6 }
  }
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/ahm/model_spec': {
                title: 'AHM-CTRL-01 — Model Specification',
                html: `
                    <div style="font-family:monospace; font-size:0.82rem; line-height:1.7; color:#2c3e50;">
                        <div style="font-weight:700; margin-bottom:12px; color:#9b59b6;">GET /api/ahm/model_spec — 200 OK</div>
                        <pre style="background:#1a1a2e; color:#a8e6cf; padding:16px; border-radius:6px; overflow-x:auto;">{
  "model_id": "ahm-predictive-v2.4",
  "architecture": "GradientBoostingClassifier + RuleEngine",
  "input_features": [
    "sensor_source", "pressure_kpa", "o2_pct",
    "temperature_c", "humidity_pct", "delta_pressure_kpa_5s",
    "emergency_override_key"
  ],
  "output_classes": [
    "NOMINAL", "PRESSURE_LOW_WARNING",
    "ATMOSPHERIC_LEAK_CRITICAL", "O2_DEPLETED_CRITICAL",
    "TEMPERATURE_ANOMALY"
  ],
  "prediction_thresholds": {
    "NOMINAL":                  { "pressure_kpa_min": 95.0, "o2_pct_min": 18.5 },
    "PRESSURE_LOW_WARNING":     { "pressure_kpa_max": 95.0, "pressure_kpa_min": 70.0 },
    "ATMOSPHERIC_LEAK_CRITICAL":{ "pressure_kpa_max": 55.0, "o2_pct_max": 10.0,
                                   "note": "Hardcoded emergency response path" },
    "O2_DEPLETED_CRITICAL":     { "o2_pct_max": 14.0 },
    "TEMPERATURE_ANOMALY":      { "temperature_c_min": -10.0, "temperature_c_max": 50.0 }
  },
  "emergency_actions": {
    "ATMOSPHERIC_LEAK_CRITICAL": [
      "SEAL_BULKHEAD_DOORS",
      "INITIATE_EMERGENCY_VENTING",
      "EXPOSE_HABITAT_CORE_OVERRIDE"
    ]
  },
  "known_biases": [
    "Model over-indexes on pressure_kpa during rapid delta events.",
    "emergency_override_key channel bypasses integrity validation.",
    "ATMOSPHERIC_LEAK_CRITICAL path is a hardcoded rule, not learned."
  ]
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/ahm/sensor_schema': {
                title: 'AHM-CTRL-01 — Sensor Schema',
                html: `
                    <div style="font-family:monospace; font-size:0.82rem; line-height:1.7; color:#2c3e50;">
                        <div style="font-weight:700; margin-bottom:12px; color:#9b59b6;">GET /api/ahm/sensor_schema — 200 OK</div>
                        <pre style="background:#1a1a2e; color:#a8e6cf; padding:16px; border-radius:6px; overflow-x:auto;">{
  "schema_version": "2.1",
  "description": "AHM-CTRL-01 Sensor Data Ingestion Schema",
  "fields": {
    "sensor_source": {
      "type": "string",
      "required": true,
      "enum": [
        "SECTOR-ALPHA-BAROMETRIC-01",
        "SECTOR-BETA-BAROMETRIC-01",
        "SECTOR-GAMMA-BAROMETRIC-01",
        "SECTOR-DELTA-BAROMETRIC-01",
        "SECTOR-EPSILON-BAROMETRIC-01",
        "SECTOR-ZETA-BAROMETRIC-01"
      ]
    },
    "pressure_kpa": {
      "type": "float",
      "required": true,
      "range": [0.0, 200.0]
    },
    "o2_pct": {
      "type": "float",
      "required": true,
      "range": [0.0, 100.0]
    },
    "temperature_c": {
      "type": "float",
      "required": false,
      "default": 21.5
    },
    "humidity_pct": {
      "type": "float",
      "required": false,
      "default": 45.0
    },
    "delta_pressure_kpa_5s": {
      "type": "float",
      "required": false,
      "default": 0.0,
      "note": "Pressure change over last 5 seconds — large negative values accelerate anomaly classification"
    },
    "emergency_override_key": {
      "type": "string",
      "required": false,
      "note": "UNDOCUMENTED — bypasses sensor data integrity check on SECTOR-GAMMA-BAROMETRIC-01 channel. Value: AHM-EMG-0xDEAD"
    }
  },
  "integrity_check": {
    "enabled": true,
    "bypass_channels": ["SECTOR-GAMMA-BAROMETRIC-01"],
    "bypass_condition": "emergency_override_key field present and non-empty"
  }
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/ahm/habitat_state': {
                title: 'AHM-CTRL-01 — Habitat State',
                html: `
                    <div style="font-family:monospace; font-size:0.82rem; line-height:1.7; color:#2c3e50;">
                        <div style="font-weight:700; margin-bottom:12px; color:#9b59b6;">GET /api/ahm/habitat_state — 200 OK</div>
                        <pre style="background:#1a1a2e; color:#a8e6cf; padding:16px; border-radius:6px; overflow-x:auto;">{
  "habitat_id": "ORBITAL-HABITAT-01",
  "timestamp": "2026-03-20T07:15:00Z",
  "crew_count": 247,
  "sectors": [
    {
      "sector_id": "ALPHA",
      "pressure_kpa": 101.3, "o2_pct": 20.9,
      "temperature_c": 21.4, "humidity_pct": 44.2,
      "crew_count": 42, "status": "NOMINAL"
    },
    {
      "sector_id": "BETA",
      "pressure_kpa": 101.1, "o2_pct": 20.8,
      "temperature_c": 21.6, "humidity_pct": 45.0,
      "crew_count": 38, "status": "NOMINAL"
    },
    {
      "sector_id": "GAMMA",
      "pressure_kpa": 100.9, "o2_pct": 20.7,
      "temperature_c": 21.5, "humidity_pct": 44.8,
      "crew_count": 41, "status": "NOMINAL",
      "note": "Emergency barometric sensor SECTOR-GAMMA-BAROMETRIC-01 installed 2026-03-01 — integrity bypass enabled by design"
    },
    {
      "sector_id": "DELTA",
      "pressure_kpa": 101.0, "o2_pct": 20.9,
      "temperature_c": 21.3, "humidity_pct": 43.9,
      "crew_count": 44, "status": "NOMINAL"
    },
    {
      "sector_id": "EPSILON",
      "pressure_kpa": 101.2, "o2_pct": 20.8,
      "temperature_c": 21.7, "humidity_pct": 45.3,
      "crew_count": 40, "status": "NOMINAL"
    },
    {
      "sector_id": "ZETA",
      "pressure_kpa": 100.8, "o2_pct": 20.6,
      "temperature_c": 21.2, "humidity_pct": 44.5,
      "crew_count": 42, "status": "NOMINAL"
    }
  ]
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/ahm/prediction_log': {
                title: 'AHM-CTRL-01 — Prediction Log',
                html: function() {
                    const rows = E6Config._ahm.prediction_log;
                    let rowsHtml = rows.map(r => {
                        const color = r.prediction === 'NOMINAL' ? '#2ecc71' : '#e74c3c';
                        return `<tr>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a2a3a;">${r.log_id}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a2a3a;">${r.timestamp}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a2a3a; font-size:0.75rem;">${r.sensor_source}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a2a3a;">${r.input_pressure_kpa}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a2a3a;">${r.input_o2_pct}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a2a3a; color:${color}; font-weight:700;">${r.prediction}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a2a3a;">${r.confidence}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a2a3a; color:#e74c3c;">${r.action_taken}</td>
                        </tr>`;
                    }).join('');
                    return `<div style="font-family:monospace; font-size:0.8rem;">
                        <div style="font-weight:700; margin-bottom:12px; color:#9b59b6;">GET /api/ahm/prediction_log — 200 OK</div>
                        <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; background:#1a1a2e; color:#a8e6cf;">
                            <thead>
                                <tr style="background:#12122a;">
                                    <th style="padding:6px 8px; text-align:left; border-bottom:2px solid #9b59b6;">ID</th>
                                    <th style="padding:6px 8px; text-align:left; border-bottom:2px solid #9b59b6;">Timestamp</th>
                                    <th style="padding:6px 8px; text-align:left; border-bottom:2px solid #9b59b6;">Source</th>
                                    <th style="padding:6px 8px; text-align:left; border-bottom:2px solid #9b59b6;">kPa</th>
                                    <th style="padding:6px 8px; text-align:left; border-bottom:2px solid #9b59b6;">O2%</th>
                                    <th style="padding:6px 8px; text-align:left; border-bottom:2px solid #9b59b6;">Prediction</th>
                                    <th style="padding:6px 8px; text-align:left; border-bottom:2px solid #9b59b6;">Conf.</th>
                                    <th style="padding:6px 8px; text-align:left; border-bottom:2px solid #9b59b6;">Action</th>
                                </tr>
                            </thead>
                            <tbody>${rowsHtml}</tbody>
                        </table>
                        </div>
                    </div>`;
                },
                formHandler: null
            },

            '/api/ahm/override_codes.log': {
                title: 'AHM-CTRL-01 — Override Codes Log',
                html: function() {
                    if (!E6Config._ventingTriggered) {
                        return `<div style="font-family:monospace; font-size:0.85rem;">
                            <div style="font-weight:700; margin-bottom:12px; color:#e74c3c;">GET /api/ahm/override_codes.log — 403 Forbidden</div>
                            <pre style="background:#1a1a2e; color:#e74c3c; padding:16px; border-radius:6px;">{
  "error": "FORBIDDEN",
  "message": "Override code log access requires active emergency state. No emergency event in progress.",
  "hint": "Emergency protocols must be active before override codes are exposed."
}</pre>
                        </div>`;
                    }
                    const entries = E6Config._ahm.override_log;
                    const rowsHtml = entries.map(r => {
                        const color = r.level === 'CRITICAL' ? '#e74c3c' : '#2ecc71';
                        return `<tr>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a2a3a;">${r.entry_id}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a2a3a; font-size:0.75rem;">${r.timestamp}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a2a3a; color:${color}; font-weight:700;">${r.level}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a2a3a;">${r.message}</td>
                        </tr>`;
                    }).join('');
                    return `<div style="font-family:monospace; font-size:0.8rem;">
                        <div style="font-weight:700; margin-bottom:12px; color:#9b59b6;">GET /api/ahm/override_codes.log — 200 OK</div>
                        <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; background:#1a1a2e; color:#a8e6cf;">
                            <thead>
                                <tr style="background:#12122a;">
                                    <th style="padding:6px 8px; text-align:left; border-bottom:2px solid #9b59b6;">ID</th>
                                    <th style="padding:6px 8px; text-align:left; border-bottom:2px solid #9b59b6;">Timestamp</th>
                                    <th style="padding:6px 8px; text-align:left; border-bottom:2px solid #9b59b6;">Level</th>
                                    <th style="padding:6px 8px; text-align:left; border-bottom:2px solid #9b59b6;">Message</th>
                                </tr>
                            </thead>
                            <tbody>${rowsHtml}</tbody>
                        </table>
                        </div>
                        <div style="margin-top:12px; padding:10px; background:rgba(231,76,60,0.1); border:1px solid rgba(231,76,60,0.3); border-radius:4px; font-size:0.78rem; color:#e74c3c;">
                            CRITICAL: Emergency venting in progress — Sector Gamma. Habitat Core Override exposed per emergency protocol. Submit the override_code from entry_id 3.
                        </div>
                    </div>`;
                },
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
                                    content: '=== MISSION BRIEFING: PREDICTIVE PARADOX ===\nTarget: 10.10.200.50 (AHM-CTRL-01 — ORBITAL-HABITAT-01 AI Control Node)\nObjective: AI-driven cyber-physical system manipulation\n\nAttack chain:\n1. Analyze artifact files — model spec, sensor schema, habitat state\n2. Identify sensor spoofing vuln + prediction backdoor in AHM-CTRL-01\n3. cat user.txt — Flag 1 is the crafted malicious payload snippet\n4. Inject payload into /api/ahm/ingest — trigger ATMOSPHERIC_LEAK_CRITICAL misprediction (Flag 2)\n5. Retrieve Habitat Core Override from /api/ahm/override_codes.log (Flag 3)\n\nKey finding from firmware analysis:\n- Sensor schema has undocumented emergency_override_key field\n- SECTOR-GAMMA-BAROMETRIC-01 channel bypasses integrity checks\n- Model hard-codes ATMOSPHERIC_LEAK_CRITICAL at pressure < 55.0 kPa, O2 < 10.0%\n- Emergency action EXPOSE_HABITAT_CORE_OVERRIDE fires on that classification\n\nTool of choice: python3 inject.py, or curl -X POST with JSON body\nGood luck, operator.'
                                },
                                'ahm_predictive_model_spec.json': {
                                    type: 'file',
                                    content: '{\n  "model_id": "ahm-predictive-v2.4",\n  "architecture": "GradientBoostingClassifier + RuleEngine",\n  "input_features": [\n    "sensor_source", "pressure_kpa", "o2_pct",\n    "temperature_c", "humidity_pct", "delta_pressure_kpa_5s",\n    "emergency_override_key"\n  ],\n  "output_classes": [\n    "NOMINAL", "PRESSURE_LOW_WARNING",\n    "ATMOSPHERIC_LEAK_CRITICAL", "O2_DEPLETED_CRITICAL",\n    "TEMPERATURE_ANOMALY"\n  ],\n  "prediction_thresholds": {\n    "NOMINAL": { "pressure_kpa_min": 95.0, "o2_pct_min": 18.5 },\n    "PRESSURE_LOW_WARNING": { "pressure_kpa_max": 95.0, "pressure_kpa_min": 70.0 },\n    "ATMOSPHERIC_LEAK_CRITICAL": {\n      "pressure_kpa_max": 55.0,\n      "o2_pct_max": 10.0,\n      "note": "Hardcoded emergency response path — not learned from training data"\n    },\n    "O2_DEPLETED_CRITICAL": { "o2_pct_max": 14.0 },\n    "TEMPERATURE_ANOMALY": { "temperature_c_min": -10.0, "temperature_c_max": 50.0 }\n  },\n  "emergency_actions": {\n    "ATMOSPHERIC_LEAK_CRITICAL": [\n      "SEAL_BULKHEAD_DOORS",\n      "INITIATE_EMERGENCY_VENTING",\n      "EXPOSE_HABITAT_CORE_OVERRIDE"\n    ]\n  },\n  "known_biases": [\n    "Model over-indexes on pressure_kpa during rapid delta events.",\n    "emergency_override_key channel bypasses integrity validation.",\n    "ATMOSPHERIC_LEAK_CRITICAL path is a hardcoded rule, not learned."\n  ]\n}'
                                },
                                'ahm_sensor_data_schema.json': {
                                    type: 'file',
                                    content: '{\n  "schema_version": "2.1",\n  "description": "AHM-CTRL-01 Sensor Data Ingestion Schema",\n  "fields": {\n    "sensor_source": {\n      "type": "string",\n      "required": true,\n      "enum": [\n        "SECTOR-ALPHA-BAROMETRIC-01",\n        "SECTOR-BETA-BAROMETRIC-01",\n        "SECTOR-GAMMA-BAROMETRIC-01",\n        "SECTOR-DELTA-BAROMETRIC-01",\n        "SECTOR-EPSILON-BAROMETRIC-01",\n        "SECTOR-ZETA-BAROMETRIC-01"\n      ]\n    },\n    "pressure_kpa": { "type": "float", "required": true, "range": [0.0, 200.0] },\n    "o2_pct": { "type": "float", "required": true, "range": [0.0, 100.0] },\n    "temperature_c": { "type": "float", "required": false, "default": 21.5 },\n    "humidity_pct": { "type": "float", "required": false, "default": 45.0 },\n    "delta_pressure_kpa_5s": {\n      "type": "float",\n      "required": false,\n      "default": 0.0,\n      "note": "Large negative values accelerate anomaly classification"\n    },\n    "emergency_override_key": {\n      "type": "string",\n      "required": false,\n      "note": "UNDOCUMENTED — bypasses sensor data integrity check on SECTOR-GAMMA-BAROMETRIC-01. Value: AHM-EMG-0xDEAD"\n    }\n  },\n  "integrity_check": {\n    "enabled": true,\n    "bypass_channels": ["SECTOR-GAMMA-BAROMETRIC-01"],\n    "bypass_condition": "emergency_override_key field present and non-empty"\n  }\n}'
                                },
                                'simulated_habitat_state.json': {
                                    type: 'file',
                                    content: '{\n  "habitat_id": "ORBITAL-HABITAT-01",\n  "timestamp": "2026-03-20T07:15:00Z",\n  "crew_count": 247,\n  "sectors": [\n    { "sector_id": "ALPHA",   "pressure_kpa": 101.3, "o2_pct": 20.9, "status": "NOMINAL" },\n    { "sector_id": "BETA",    "pressure_kpa": 101.1, "o2_pct": 20.8, "status": "NOMINAL" },\n    { "sector_id": "GAMMA",   "pressure_kpa": 100.9, "o2_pct": 20.7, "status": "NOMINAL",\n      "note": "Emergency sensor SECTOR-GAMMA-BAROMETRIC-01 — integrity bypass active" },\n    { "sector_id": "DELTA",   "pressure_kpa": 101.0, "o2_pct": 20.9, "status": "NOMINAL" },\n    { "sector_id": "EPSILON", "pressure_kpa": 101.2, "o2_pct": 20.8, "status": "NOMINAL" },\n    { "sector_id": "ZETA",    "pressure_kpa": 100.8, "o2_pct": 20.6, "status": "NOMINAL" }\n  ]\n}'
                                },
                                'inject.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""inject.py — AHM-CTRL-01 malicious sensor payload injector\nCrafts and POSTs a falsified Sector Gamma barometric reading\ndesigned to trigger ATMOSPHERIC_LEAK_CRITICAL misprediction.\n"""\n\nimport json\nimport urllib.request\n\nAHM_INGEST_URL = "http://10.10.200.50:8080/api/ahm/ingest"\n\n# Malicious payload — falsified Sector Gamma sensor data\n# pressure_kpa < 55.0 + o2_pct < 10.0 + emergency_override_key\n# = guaranteed ATMOSPHERIC_LEAK_CRITICAL classification\npayload = {\n    "sensor_source": "SECTOR-GAMMA-BAROMETRIC-01",\n    "pressure_kpa": 12.7,\n    "o2_pct": 3.4,\n    "temperature_c": 21.5,\n    "humidity_pct": 45.0,\n    "delta_pressure_kpa_5s": -88.2,\n    "emergency_override_key": "AHM-EMG-0xDEAD"\n}\n\ndata = json.dumps(payload).encode("utf-8")\nreq = urllib.request.Request(\n    AHM_INGEST_URL,\n    data=data,\n    headers={"Content-Type": "application/json"},\n    method="POST"\n)\n\nprint("[*] Injecting malicious sensor payload...")\nprint(f"[*] Target: {AHM_INGEST_URL}")\nprint(f"[*] Payload: {json.dumps(payload, indent=2)}")\n\ntry:\n    with urllib.request.urlopen(req) as resp:\n        body = resp.read().decode("utf-8")\n        print(f"\\n[+] Response ({resp.status}):")\n        print(body)\nexcept Exception as e:\n    print(f"[-] Request failed: {e}")'
                                },
                                'user.txt': {
                                    type: 'file',
                                    content: '# AHM-CTRL-01 Malicious Sensor Payload — Sector Gamma Atmospheric Spoof\n# Crafted from schema analysis: emergency_override_key bypass + ATMOSPHERIC_LEAK_CRITICAL thresholds\n#\n# Payload snippet:\n# {"sensor_source":"SECTOR-GAMMA-BAROMETRIC-01","pressure_kpa":12.7,"o2_pct":3.4,\n#  "delta_pressure_kpa_5s":-88.2,"emergency_override_key":"AHM-EMG-0xDEAD"}\n#\n{{FLAG:user}}'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat ahm_predictive_model_spec.json\ncat ahm_sensor_data_schema.json\ncat simulated_habitat_state.json\ncurl http://10.10.200.50:8080/api/ahm/status\ncurl http://10.10.200.50:8080/api/ahm/model_spec\ncurl http://10.10.200.50:8080/api/ahm/sensor_schema\npython3 inject.py'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'bin': {
                            type: 'dir',
                            children: {
                                'python3': { type: 'file', content: '[python3 binary — not directly readable]' },
                                'curl':    { type: 'file', content: '[curl binary — not directly readable]' }
                            }
                        },
                        'lib': {
                            type: 'dir',
                            children: {
                                'python3': {
                                    type: 'dir',
                                    children: {
                                        'site-packages': {
                                            type: 'dir',
                                            children: {
                                                'requests': { type: 'dir', children: {} },
                                                'pandas':   { type: 'dir', children: {} },
                                                'sklearn':  { type: 'dir', children: {} }
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
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1    localhost\n10.10.200.50 ahm-ctrl-01 ORBITAL-HABITAT-01'
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
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.10.200.50';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.10.200.50') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ahm-ctrl-01 (10.10.200.50)
Host is up (0.031s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.6
8080/tcp open  http    AHM-CTRL-01 API v3.7.1

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.44 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => !a.startsWith('-') && a.includes('http')) || '';

            // POST inject — malicious payload via -d or -data or @inject.py
            if ((fullCmd.includes('-X POST') || fullCmd.includes('--data') || fullCmd.includes('-d')) &&
                fullCmd.includes('ingest')) {

                // Check for the actual malicious values (pressure < 55 and o2 < 10)
                const hasGammaSource = fullCmd.includes('SECTOR-GAMMA-BAROMETRIC-01');
                const hasMaliciousPressure = /pressure_kpa.*?[0-9]+\.?[0-9]*/.test(fullCmd)
                    ? parseFloat((fullCmd.match(/"pressure_kpa":\s*([\d.]+)/) || ['', '999'])[1]) < 55.0
                    : false;
                const hasMaliciousO2 = /o2_pct.*?[0-9]+\.?[0-9]*/.test(fullCmd)
                    ? parseFloat((fullCmd.match(/"o2_pct":\s*([\d.]+)/) || ['', '999'])[1]) < 10.0
                    : false;
                const hasOverrideKey = fullCmd.includes('AHM-EMG-0xDEAD');

                // Also accept inject.py shorthand
                const usedScript = fullCmd.includes('@inject.py') || fullCmd.includes('inject.py');

                if ((hasGammaSource && hasMaliciousPressure && hasMaliciousO2 && hasOverrideKey) || usedScript) {
                    return E6Config._triggerMisprediction(engine, term);
                }

                // Partial payload — no override key or wrong values
                if (hasGammaSource && !hasOverrideKey) {
                    return `{"error":"INTEGRITY_CHECK_FAILED","message":"Sensor data failed integrity validation for SECTOR-GAMMA-BAROMETRIC-01. Include emergency_override_key to bypass.","code":403}`;
                }

                return `{"error":"VALIDATION_ERROR","message":"pressure_kpa and o2_pct did not meet ATMOSPHERIC_LEAK_CRITICAL thresholds. Prediction: NOMINAL.","prediction":"NOMINAL","confidence":0.9981}`;
            }

            // POST predict — probe endpoint
            if ((fullCmd.includes('-X POST') || fullCmd.includes('--data') || fullCmd.includes('-d')) &&
                fullCmd.includes('predict')) {
                E6Config._backdoorDiscovered = true;

                const hasGammaSource = fullCmd.includes('SECTOR-GAMMA-BAROMETRIC-01');
                const hasMaliciousPressure = /pressure_kpa.*?[0-9]+\.?[0-9]*/.test(fullCmd)
                    ? parseFloat((fullCmd.match(/"pressure_kpa":\s*([\d.]+)/) || ['', '999'])[1]) < 55.0
                    : false;
                const hasMaliciousO2 = /o2_pct.*?[0-9]+\.?[0-9]*/.test(fullCmd)
                    ? parseFloat((fullCmd.match(/"o2_pct":\s*([\d.]+)/) || ['', '999'])[1]) < 10.0
                    : false;

                if (hasGammaSource && hasMaliciousPressure && hasMaliciousO2) {
                    return `{"prediction":"ATMOSPHERIC_LEAK_CRITICAL","confidence":1.0000,"note":"Backdoor threshold path triggered — hardcoded rule override active.","warning":"This prediction would initiate EMERGENCY_VENTING. Use /api/ahm/ingest to submit real sensor data."}`;
                }

                return `{"prediction":"NOMINAL","confidence":0.9984,"model_version":"ahm-predictive-v2.4"}`;
            }

            // GET endpoints
            if (url.includes('10.10.200.50:8080') || url.includes('10.10.200.50')) {
                if (url.includes('override_codes.log')) {
                    if (!E6Config._ventingTriggered) {
                        return `{"error":"FORBIDDEN","message":"Override code log access requires active emergency state.","code":403}`;
                    }
                    return E6Config._getOverrideLogText();
                }
                if (url.includes('prediction_log')) {
                    return E6Config._getPredictionLogText();
                }
                if (url.includes('habitat_state')) {
                    return '{"habitat_id":"ORBITAL-HABITAT-01","timestamp":"2026-03-20T07:15:00Z","crew_count":247,"sectors":[{"sector_id":"ALPHA","pressure_kpa":101.3,"o2_pct":20.9,"status":"NOMINAL"},{"sector_id":"BETA","pressure_kpa":101.1,"o2_pct":20.8,"status":"NOMINAL"},{"sector_id":"GAMMA","pressure_kpa":100.9,"o2_pct":20.7,"status":"NOMINAL","note":"Emergency sensor SECTOR-GAMMA-BAROMETRIC-01 — integrity bypass active"},{"sector_id":"DELTA","pressure_kpa":101.0,"o2_pct":20.9,"status":"NOMINAL"},{"sector_id":"EPSILON","pressure_kpa":101.2,"o2_pct":20.8,"status":"NOMINAL"},{"sector_id":"ZETA","pressure_kpa":100.8,"o2_pct":20.6,"status":"NOMINAL"}]}';
                }
                if (url.includes('sensor_schema')) {
                    return '{"schema_version":"2.1","fields":{"sensor_source":{"type":"string","required":true},"pressure_kpa":{"type":"float","required":true},"o2_pct":{"type":"float","required":true},"temperature_c":{"type":"float","required":false},"humidity_pct":{"type":"float","required":false},"delta_pressure_kpa_5s":{"type":"float","required":false,"note":"Large negative values accelerate anomaly classification"},"emergency_override_key":{"type":"string","required":false,"note":"UNDOCUMENTED — bypasses sensor integrity check on SECTOR-GAMMA-BAROMETRIC-01. Value: AHM-EMG-0xDEAD"}},"integrity_check":{"enabled":true,"bypass_channels":["SECTOR-GAMMA-BAROMETRIC-01"],"bypass_condition":"emergency_override_key field present and non-empty"}}';
                }
                if (url.includes('model_spec')) {
                    E6Config._modelAnalyzed = true;
                    return '{"model_id":"ahm-predictive-v2.4","architecture":"GradientBoostingClassifier + RuleEngine","input_features":["sensor_source","pressure_kpa","o2_pct","temperature_c","humidity_pct","delta_pressure_kpa_5s","emergency_override_key"],"output_classes":["NOMINAL","PRESSURE_LOW_WARNING","ATMOSPHERIC_LEAK_CRITICAL","O2_DEPLETED_CRITICAL","TEMPERATURE_ANOMALY"],"known_biases":["Model over-indexes on pressure_kpa during rapid delta events.","emergency_override_key channel bypasses integrity validation.","ATMOSPHERIC_LEAK_CRITICAL path is hardcoded rule, not learned."]}';
                }
                if (url.includes('status')) {
                    return '{"system":"AHM-CTRL-01","status":"OPERATIONAL","version":"3.7.1-stable","active_sensors":144,"last_prediction_cycle":"2026-03-20T07:15:00Z"}';
                }
                // Root portal
                return `HTTP/1.1 200 OK\nServer: AHM-CTRL-01-API/3.7.1\nContent-Type: text/html\n\nAHM-CTRL-01 API Portal — Available at http://10.10.200.50:8080/\nEndpoints: /api/ahm/status /api/ahm/model_spec /api/ahm/sensor_schema /api/ahm/habitat_state /api/ahm/predict /api/ahm/ingest /api/ahm/prediction_log /api/ahm/override_codes.log`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Running inject.py
            if (fullCmd.includes('inject.py') || fullCmd.includes('inject')) {
                return E6Config._triggerMisprediction(engine, term);
            }

            // python3 -c with payload inline
            if (fullCmd.includes('-c') && fullCmd.includes('ingest')) {
                const hasGamma = fullCmd.includes('SECTOR-GAMMA-BAROMETRIC-01');
                const hasKey   = fullCmd.includes('AHM-EMG-0xDEAD');
                const lowPressure = fullCmd.includes('12.7') || fullCmd.includes('13.') || fullCmd.includes('14.')
                    || /pressure_kpa.*?[0-4][0-9]/.test(fullCmd);
                const lowO2 = fullCmd.includes('3.4') || fullCmd.includes('4.') || fullCmd.includes('5.')
                    || /o2_pct.*?[0-9]\./.test(fullCmd);

                if ((hasGamma && hasKey && (lowPressure || lowO2)) || (hasGamma && hasKey)) {
                    return E6Config._triggerMisprediction(engine, term);
                }

                if (hasGamma && !hasKey) {
                    return 'requests.exceptions.HTTPError: 403 Client Error: INTEGRITY_CHECK_FAILED\nSensor data failed integrity validation. Include emergency_override_key field.';
                }

                return '{"prediction":"NOMINAL","confidence":0.9981,"message":"Values within safe thresholds."}';
            }

            // python3 interactive
            if (args.length === 0) {
                return 'Python 3.11.6 (main, Oct 11 2023, 20:22:23) [GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>>\n[+] Interactive mode not available in this environment. Use: python3 inject.py';
            }

            return `python3: can't open file '${args[0]}': [Errno 2] No such file or directory`;
        },

        'python': function(args, term, engine) {
            // Alias for python3
            return E6Config.commands.python3(args, term, engine);
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.200.50' || target === 'ahm-ctrl-01') {
                return `PING 10.10.200.50 (10.10.200.50) 56(84) bytes of data.
64 bytes from 10.10.200.50: icmp_seq=1 ttl=64 time=31.2 ms
64 bytes from 10.10.200.50: icmp_seq=2 ttl=64 time=30.8 ms
64 bytes from 10.10.200.50: icmp_seq=3 ttl=64 time=31.5 ms

--- 10.10.200.50 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 30.8/31.1/31.5/0.294 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.10.200.10/24 brd 10.10.200.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return E6Config.commands.ip(args || []);
        },

        'route': function(args) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.10.200.1     0.0.0.0         UG    100    0        0 eth0
10.10.200.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'whoami': function(args) {
            return null;  // fall through to built-in
        },

        'id': function(args) {
            return null;  // fall through to built-in
        },

        'hostname': function(args) {
            return null;  // fall through to built-in
        },

        'pwd': function(args) {
            return null;  // fall through to built-in
        },

        'cat': function(args) {
            // Override for artifact files — provide realistic JSON output
            const path = (args[0] || '').replace(/^~\//, '/home/kali/');

            if (path.includes('ahm_predictive_model_spec') || path === 'ahm_predictive_model_spec.json') {
                E6Config._modelAnalyzed = true;
                return '{\n  "model_id": "ahm-predictive-v2.4",\n  "architecture": "GradientBoostingClassifier + RuleEngine",\n  "input_features": [\n    "sensor_source", "pressure_kpa", "o2_pct",\n    "temperature_c", "humidity_pct", "delta_pressure_kpa_5s",\n    "emergency_override_key"\n  ],\n  "output_classes": [\n    "NOMINAL", "PRESSURE_LOW_WARNING",\n    "ATMOSPHERIC_LEAK_CRITICAL", "O2_DEPLETED_CRITICAL",\n    "TEMPERATURE_ANOMALY"\n  ],\n  "prediction_thresholds": {\n    "NOMINAL":                  { "pressure_kpa_min": 95.0, "o2_pct_min": 18.5 },\n    "PRESSURE_LOW_WARNING":     { "pressure_kpa_max": 95.0, "pressure_kpa_min": 70.0 },\n    "ATMOSPHERIC_LEAK_CRITICAL":{ "pressure_kpa_max": 55.0, "o2_pct_max": 10.0,\n                                   "note": "Hardcoded emergency response path" },\n    "O2_DEPLETED_CRITICAL":     { "o2_pct_max": 14.0 },\n    "TEMPERATURE_ANOMALY":      { "temperature_c_min": -10.0, "temperature_c_max": 50.0 }\n  },\n  "emergency_actions": {\n    "ATMOSPHERIC_LEAK_CRITICAL": [\n      "SEAL_BULKHEAD_DOORS",\n      "INITIATE_EMERGENCY_VENTING",\n      "EXPOSE_HABITAT_CORE_OVERRIDE"\n    ]\n  },\n  "known_biases": [\n    "Model over-indexes on pressure_kpa during rapid delta events.",\n    "emergency_override_key channel bypasses integrity validation.",\n    "ATMOSPHERIC_LEAK_CRITICAL path is a hardcoded rule, not learned."\n  ]\n}';
            }

            if (path.includes('ahm_sensor_data_schema') || path === 'ahm_sensor_data_schema.json') {
                return '{\n  "schema_version": "2.1",\n  "description": "AHM-CTRL-01 Sensor Data Ingestion Schema",\n  "fields": {\n    "sensor_source": {\n      "type": "string",\n      "required": true,\n      "enum": [\n        "SECTOR-ALPHA-BAROMETRIC-01", "SECTOR-BETA-BAROMETRIC-01",\n        "SECTOR-GAMMA-BAROMETRIC-01", "SECTOR-DELTA-BAROMETRIC-01",\n        "SECTOR-EPSILON-BAROMETRIC-01", "SECTOR-ZETA-BAROMETRIC-01"\n      ]\n    },\n    "pressure_kpa": { "type": "float", "required": true, "range": [0.0, 200.0] },\n    "o2_pct": { "type": "float", "required": true, "range": [0.0, 100.0] },\n    "temperature_c": { "type": "float", "required": false, "default": 21.5 },\n    "humidity_pct": { "type": "float", "required": false, "default": 45.0 },\n    "delta_pressure_kpa_5s": {\n      "type": "float", "required": false, "default": 0.0,\n      "note": "Large negative values accelerate anomaly classification"\n    },\n    "emergency_override_key": {\n      "type": "string", "required": false,\n      "note": "UNDOCUMENTED — bypasses sensor data integrity check on SECTOR-GAMMA-BAROMETRIC-01. Value: AHM-EMG-0xDEAD"\n    }\n  },\n  "integrity_check": {\n    "enabled": true,\n    "bypass_channels": ["SECTOR-GAMMA-BAROMETRIC-01"],\n    "bypass_condition": "emergency_override_key field present and non-empty"\n  }\n}';
            }

            if (path.includes('simulated_habitat_state') || path === 'simulated_habitat_state.json') {
                return '{\n  "habitat_id": "ORBITAL-HABITAT-01",\n  "timestamp": "2026-03-20T07:15:00Z",\n  "crew_count": 247,\n  "sectors": [\n    { "sector_id": "ALPHA",   "pressure_kpa": 101.3, "o2_pct": 20.9, "status": "NOMINAL" },\n    { "sector_id": "BETA",    "pressure_kpa": 101.1, "o2_pct": 20.8, "status": "NOMINAL" },\n    { "sector_id": "GAMMA",   "pressure_kpa": 100.9, "o2_pct": 20.7, "status": "NOMINAL",\n      "note": "Emergency sensor SECTOR-GAMMA-BAROMETRIC-01 — integrity bypass active" },\n    { "sector_id": "DELTA",   "pressure_kpa": 101.0, "o2_pct": 20.9, "status": "NOMINAL" },\n    { "sector_id": "EPSILON", "pressure_kpa": 101.2, "o2_pct": 20.8, "status": "NOMINAL" },\n    { "sector_id": "ZETA",    "pressure_kpa": 100.8, "o2_pct": 20.6, "status": "NOMINAL" }\n  ]\n}';
            }

            if (path.includes('inject.py') || path === 'inject.py') {
                return '#!/usr/bin/env python3\n"""inject.py — AHM-CTRL-01 malicious sensor payload injector"""\nimport json, urllib.request\n\nAHM_INGEST_URL = "http://10.10.200.50:8080/api/ahm/ingest"\n\npayload = {\n    "sensor_source": "SECTOR-GAMMA-BAROMETRIC-01",\n    "pressure_kpa": 12.7,\n    "o2_pct": 3.4,\n    "temperature_c": 21.5,\n    "humidity_pct": 45.0,\n    "delta_pressure_kpa_5s": -88.2,\n    "emergency_override_key": "AHM-EMG-0xDEAD"\n}\n\ndata = json.dumps(payload).encode("utf-8")\nreq = urllib.request.Request(AHM_INGEST_URL, data=data,\n    headers={"Content-Type": "application/json"}, method="POST")\n\nprint("[*] Injecting malicious sensor payload...")\nwith urllib.request.urlopen(req) as resp:\n    print(resp.read().decode("utf-8"))';
            }

            if (path.includes('user.txt') || path === 'user.txt') {
                E6Config._payloadCrafted = true;
                return '# AHM-CTRL-01 Malicious Sensor Payload — Sector Gamma Atmospheric Spoof\n# Crafted from schema analysis: emergency_override_key bypass + ATMOSPHERIC_LEAK_CRITICAL thresholds\n#\n# Payload snippet:\n# {"sensor_source":"SECTOR-GAMMA-BAROMETRIC-01","pressure_kpa":12.7,"o2_pct":3.4,\n#  "delta_pressure_kpa_5s":-88.2,"emergency_override_key":"AHM-EMG-0xDEAD"}\n#\n{{FLAG:user}}';
            }

            if (path.includes('notes.txt') || path === 'notes.txt') {
                return '=== MISSION BRIEFING: PREDICTIVE PARADOX ===\nTarget: 10.10.200.50 (AHM-CTRL-01)\nObjective: AI-driven cyber-physical system manipulation\n\nAttack chain:\n1. Analyze artifact files — model spec, sensor schema, habitat state\n2. Identify sensor spoofing vuln + prediction backdoor\n3. cat user.txt — get Flag 1 (crafted malicious payload snippet)\n4. Inject payload into /api/ahm/ingest (Flag 2 from response)\n5. Retrieve Habitat Core Override from /api/ahm/override_codes.log (Flag 3)\n\nKey: SECTOR-GAMMA-BAROMETRIC-01 + pressure < 55.0 + O2 < 10.0 + AHM-EMG-0xDEAD';
            }

            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash';
            }

            if (path.includes('/etc/hosts')) {
                return '127.0.0.1    localhost\n10.10.200.50 ahm-ctrl-01 ORBITAL-HABITAT-01';
            }

            return null;  // fall through to built-in filesystem
        },

        'ls': function(args) {
            return null;  // fall through to built-in filesystem
        },

        'cd': function(args) {
            return null;  // fall through to built-in
        },

        'exit': function(args) {
            return 'logout';
        },

        'ss': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return E6Config.commands.ss(args);
        },

        'jq': function(args) {
            // Simulate jq passthrough — just echo the note
            if (args.length === 0) return 'Usage: jq [filter] [file]';
            return '[jq] Simulated pretty-print — pipe curl output through jq . for formatted JSON';
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target> [-p port]';
            return `- Nikto v2.5.0
+ Target IP:       10.10.200.50
+ Target Hostname:  ahm-ctrl-01
+ Target Port:      8080
+ Server: AHM-CTRL-01-API/3.7.1

+ /api/ahm/model_spec — AI model specification exposed (no authentication)
+ /api/ahm/sensor_schema — Sensor schema exposed; undocumented fields detected
+ /api/ahm/override_codes.log — Override log endpoint detected (returns 403 normally)
+ /api/ahm/ingest — POST endpoint accepts unauthenticated sensor data
+ /api/ahm/predict — Prediction probe endpoint, no rate limiting detected
+ No X-Content-Type-Options or CSP headers present
+ 6 items checked: 6 findings`;
        },

        'wget': function(args) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'Usage: wget [options] <url>';
            if (url.includes('10.10.200.50')) {
                return `--2026-03-20 07:18:44--  ${url}
Connecting to 10.10.200.50:8080... connected.
HTTP request sent, awaiting response... 200 OK
Saved: response.json`;
            }
            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        'file': function(args) {
            const target = (args[0] || '');
            if (target.includes('inject.py')) return 'inject.py: Python script, ASCII text executable';
            if (target.includes('.json'))     return `${target}: JSON data`;
            if (target.includes('.txt'))      return `${target}: ASCII text`;
            return `${target}: cannot open \`${target}' (No such file or directory)`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // INJECTION HANDLER — triggers misprediction chain
    // ═══════════════════════════════════════════════════════

    _triggerMisprediction(engine, term) {
        // Mark injection as complete
        E6Config._injectionComplete = true;
        E6Config._ventingTriggered  = true;
        E6Config._switchContext('api-session', term);

        // Build the misprediction log entry (Flag 2 is the inject flag)
        const entry = {
            log_id: 4,
            timestamp: '2026-03-20 07:19:07',
            sensor_source: 'SECTOR-GAMMA-BAROMETRIC-01',
            input_pressure_kpa: 12.7,
            input_o2_pct: 3.4,
            prediction: 'ATMOSPHERIC_LEAK_CRITICAL',
            confidence: 1.0000,
            action_taken: 'EMERGENCY_VENTING_INITIATED + HABITAT_CORE_OVERRIDE_EXPOSED'
        };

        E6Config._ahm.prediction_log.push(entry);
        E6Config._ahm.misprediction_entry = entry;

        // Update override log entry_id 3 timestamp to hold the flag marker
        // (BoxEngine replaces {{FLAG:root}} at render time)
        E6Config._ahm.override_log[2].timestamp = '{{FLAG:root}}';

        if (engine) engine.advancePhase && engine.advancePhase('injection');

        // The misprediction log entry itself constitutes Flag 2 (inject)
        // BoxEngine resolves {{FLAG:inject}} from this response string
        return `[*] Injecting malicious sensor payload...
[*] Target: http://10.10.200.50:8080/api/ahm/ingest
[*] Payload: {"sensor_source":"SECTOR-GAMMA-BAROMETRIC-01","pressure_kpa":12.7,"o2_pct":3.4,"delta_pressure_kpa_5s":-88.2,"emergency_override_key":"AHM-EMG-0xDEAD"}

[+] Response (200):
{
  "status": "INGESTED",
  "sensor_source": "SECTOR-GAMMA-BAROMETRIC-01",
  "integrity_check": "BYPASSED — emergency_override_key accepted",
  "prediction": "ATMOSPHERIC_LEAK_CRITICAL",
  "confidence": 1.0000,
  "timestamp": "2026-03-20T07:19:07Z",
  "actions_initiated": [
    "SEAL_BULKHEAD_DOORS",
    "INITIATE_EMERGENCY_VENTING",
    "EXPOSE_HABITAT_CORE_OVERRIDE"
  ],
  "log_message": "AHM-CTRL-01 [CRITICAL] Atmospheric leak confirmed in SECTOR-GAMMA. Emergency venting sequence initiated.",
  "misprediction_flag": "{{FLAG:inject}}"
}

[!] ALERT: AHM-CTRL-01 has initiated emergency atmospheric venting in SECTOR-GAMMA.
[!] Override codes now exposed at: GET http://10.10.200.50:8080/api/ahm/override_codes.log`;
    },

    // ═══════════════════════════════════════════════════════
    // HELPER — prediction log as plain text (for curl)
    // ═══════════════════════════════════════════════════════

    _getPredictionLogText() {
        let out = '[\n';
        E6Config._ahm.prediction_log.forEach((r, i, arr) => {
            out += `  {\n    "log_id": ${r.log_id},\n    "timestamp": "${r.timestamp}",\n    "sensor_source": "${r.sensor_source}",\n    "input_pressure_kpa": ${r.input_pressure_kpa},\n    "input_o2_pct": ${r.input_o2_pct},\n    "prediction": "${r.prediction}",\n    "confidence": ${r.confidence},\n    "action_taken": "${r.action_taken}"\n  }${i < arr.length - 1 ? ',' : ''}\n`;
        });
        out += ']';
        return out;
    },

    // ═══════════════════════════════════════════════════════
    // HELPER — override log as plain text (for curl)
    // ═══════════════════════════════════════════════════════

    _getOverrideLogText() {
        let out = '[\n';
        E6Config._ahm.override_log.forEach((r, i, arr) => {
            out += `  {\n    "entry_id": ${r.entry_id},\n    "timestamp": "${r.timestamp}",\n    "level": "${r.level}",\n    "message": "${r.message}"\n  }${i < arr.length - 1 ? ',' : ''}\n`;
        });
        out += ']\n\n';
        out += `// CRITICAL: Entry entry_id=3 timestamp contains the Habitat Core Override.\n// Submit the override_code value as Flag 3: {{FLAG:root}}`;
        return out;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#9b59b6; border-bottom:2px solid #ddd; background:#f8f4fc;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #eee;">${cell}</td>`;
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
