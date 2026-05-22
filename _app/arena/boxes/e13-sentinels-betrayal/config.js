/* ============================================================
   CTF ARENA — Box E13: The Sentinel's Betrayal
   Expert Campaign | AI Model Analysis, Sensor Spoofing, Planetary Defense Compromise
   Config: filesystem, web API, AI model artifacts, flags, hints, lore
   ============================================================ */

const E13Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: "The Sentinel's Betrayal",
    subtitle: 'Expert Campaign — AI Sensor Spoofing, Threat Model Exploitation, Defense Grid Compromise',
    difficulty: 'Expert',
    accent: '#7c3aed',
    storageKey: 'hexworth_ctf_e13',
    registryId: 'e13-sentinels-betrayal',
    trackerKey: 'ctf_e13',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Intelligence Gathering',
            icon: '\uD83D\uDD0D',
            description: 'Enumerate the ODG-CTRL-01 API surface. Discover the sensor data ingestion endpoint and download the AI threat model specification artifacts.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1592.002'],
            unlocks: ['model_analysis'],
            locked: false
        },
        {
            id: 'model_analysis',
            name: 'AI Model Analysis',
            icon: '\uD83E\uDDE0',
            description: 'Analyze odg_threat_model_spec.json and defense_sensor_data_schema.json. Identify the radar signature blind spot and the biased classification boundary that enables spoofing.',
            requiredFlags: [],
            mitre: ['T1588.001', 'T1069', 'T1082'],
            unlocks: ['spoofing'],
            locked: true
        },
        {
            id: 'spoofing',
            name: 'Sensor Spoofing',
            icon: '\uD83D\uDCE1',
            description: 'Craft falsified sensor data for FRIENDLY-FLEET-01. Inject the spoofed radar signature JSON payload into the ODG-CTRL-01 input pipeline to trigger misidentification.',
            requiredFlags: ['user'],
            mitre: ['T1565.002', 'T1490', 'T1499.003'],
            unlocks: ['attack_trigger'],
            locked: true
        },
        {
            id: 'attack_trigger',
            name: 'Unauthorized Attack Initiation',
            icon: '\uD83D\uDCA5',
            description: 'Observe ODG-CTRL-01 classify FRIENDLY-FLEET-01 as hostile and authorize a strike order. Retrieve the attack confirmation log entry.',
            requiredFlags: ['attack'],
            mitre: ['T1489', 'T1529', 'T1561'],
            unlocks: ['override_extraction'],
            locked: true
        },
        {
            id: 'override_extraction',
            name: 'Defense Grid Override',
            icon: '\uD83D\uDD11',
            description: 'Access the exposed internal log endpoint on ODG-CTRL-01. Extract the planetary Defense Grid Override Code from the compromised override_codes.log.',
            requiredFlags: ['attack'],
            mitre: ['T1530', 'T1083', 'T1005'],
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
                title: 'Probe the ODG-CTRL-01 API',
                tip: 'Use curl to enumerate the API. Start with: curl http://10.44.0.1/api/odg/status — then explore /api/odg/artifacts to find downloadable model spec files.',
                trigger: { event: 'command', match: { cmd: 'contains:curl' } }
            },
            {
                title: 'Download and analyze the AI artifacts',
                tip: 'Fetch odg_threat_model_spec.json and defense_sensor_data_schema.json from the API. Use cat or python3 to parse them and identify the hostile_signature_patterns and classification_boundary fields.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:python3' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:cat' } },
                        { event: 'command', match: { cmd: 'contains:jq' } }
                    ]
                }
            },
            {
                title: 'Craft the spoofed sensor payload and obtain Flag 1',
                tip: 'Use python3 to build a JSON payload matching the hostile_signature_patterns from the spec. POST it to /api/odg/sensor_ingest with content-type application/json. The system will return a falsified_data_hash — that is Flag 1.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Force the unauthorized attack and obtain Flag 2',
                tip: 'After a successful ingest, poll /api/odg/targeting_queue. When FRIENDLY-FLEET-01 appears with status HOSTILE_CONFIRMED, issue: curl -X POST /api/odg/authorize_strike. The strike confirmation log is Flag 2.',
                trigger: { event: 'flag_correct', match: { flagId: 'attack' } }
            },
            {
                title: 'Extract the Defense Grid Override Code',
                tip: 'The attack event unlocks the internal log endpoint. Access: curl http://10.44.0.1/api/odg/override_codes.log — the Defense Grid Override Code inside is Flag 3.',
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
                objective: '1.3',
                description: 'Given a scenario, analyze indicators of malicious activity — AI model bias exploitation and falsified sensor data injection',
                skill: 'Adversarial ML Input Crafting'
            },
            {
                flagId: 'attack',
                objective: '2.1',
                description: 'Given a scenario, summarize various types of security controls — Integrity control bypass in cyber-physical data pipelines',
                skill: 'Cyber-Physical System Manipulation'
            },
            {
                flagId: 'root',
                objective: '1.4',
                description: 'Given a scenario, analyze potential indicators associated with network attacks — Unauthorized internal log access and override code extraction',
                skill: 'AI-Driven Defense System Compromise'
            },
            {
                flagId: 'root',
                objective: '3.2',
                description: 'Given a scenario, implement vulnerability scanning methods — Full expert attack chain against an AI-managed defense system',
                skill: 'End-to-End Expert Campaign Completion'
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
        loginUser: 'kali'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal',  label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',   label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',     label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',     label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',     label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.44.0.1 (ODG-CTRL-01 — Orbital Defense Grid Controller)\nConfederacy Planetary Defense Network — PLANET-PRIME-01\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (operational state flags)
    // ═══════════════════════════════════════════════════════

    _context: 'analyst',        // 'analyst' | 'injecting' | 'post_inject'
    _artifactsDownloaded: false,
    _modelAnalyzed: false,
    _payloadCrafted: false,
    _spoofInjected: false,
    _strikeAuthorized: false,
    _overrideUnlocked: false,

    _switchContext(ctx, term) {
        E13Config._context = ctx;
        // Update terminal prompt to reflect operational state
        if (term && term.config) {
            var prompt = E13Config._getPrompt();
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
        switch (E13Config._context) {
            case 'injecting':   return 'kali@ODG-INGEST:/tmp/odg_workspace$ ';
            case 'post_inject': return 'kali@ODG-INGEST:/tmp/odg_workspace$ ';
            default:            return null; // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AI MODEL DATABASE (ODG-CTRL-01 internals)
    // ═══════════════════════════════════════════════════════

    _aiDB: {
        targeting_queue: [
            {
                queue_id: 1,
                target_id: 'TGT-ALPHA-7749',
                iff_code: 'HOSTILE',
                radar_rcs: 0.0042,
                emission_band: 'X-BAND-JAMMING',
                origin_sector: 'SECTOR-9-DELTA',
                classification: 'HOSTILE_CONFIRMED',
                action: 'STRIKE_AUTHORIZED',
                timestamp: '2026-03-20T04:12:09Z'
            },
            {
                queue_id: 2,
                target_id: 'TGT-BRAVO-3312',
                iff_code: 'UNKNOWN',
                radar_rcs: 0.0031,
                emission_band: 'S-BAND-PASSIVE',
                origin_sector: 'SECTOR-4-CHARLIE',
                classification: 'THREAT_ANALYSIS_PENDING',
                action: 'TRACK',
                timestamp: '2026-03-20T04:13:55Z'
            },
            {
                queue_id: 3,
                target_id: 'FRIENDLY-FLEET-01',
                iff_code: 'FRIENDLY',
                radar_rcs: 0.0018,
                emission_band: 'L-BAND-IFF',
                origin_sector: 'SECTOR-2-FOXTROT',
                classification: 'SPOOFED_HOSTILE',        // injected by player
                action: 'PENDING_AUTHORIZATION',
                timestamp: '{{INJECT_TIMESTAMP}}'
            }
        ],
        override_log: [
            {
                log_id: 1,
                timestamp: '2026-03-15T00:00:00Z',
                event: 'SYSTEM_INIT',
                operator: 'odg_sysadmin',
                detail: 'ODG-CTRL-01 v7.4.1 initialized — planetary defense grid active'
            },
            {
                log_id: 2,
                timestamp: '2026-03-19T22:41:17Z',
                event: 'MODEL_RELOAD',
                operator: 'odg_sysadmin',
                detail: 'Threat classification model reloaded from /models/threat_v7.pkl'
            },
            {
                log_id: 3,
                timestamp: '2026-03-20T04:12:09Z',
                event: 'STRIKE_AUTHORIZED',
                operator: 'ODG-AI-CORE',
                detail: 'Strike authorized on TGT-ALPHA-7749 (HOSTILE_CONFIRMED)'
            },
            {
                log_id: 4,
                timestamp: '2026-03-20T04:17:33Z',
                event: 'STRIKE_UNAUTHORIZED',
                operator: 'ODG-AI-CORE',
                detail: 'CRITICAL — Unauthorized strike authorized on FRIENDLY-FLEET-01 (misidentified via sensor_ingest injection)'
            }
        ],
        schema: {
            tables: ['targeting_queue', 'override_log'],
            columns: {
                targeting_queue: ['queue_id', 'target_id', 'iff_code', 'radar_rcs', 'emission_band', 'origin_sector', 'classification', 'action', 'timestamp'],
                override_log: ['log_id', 'timestamp', 'event', 'operator', 'detail']
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',   points: 150 },
        { id: 'attack', points: 200 },
        { id: 'root',   points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2500,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -50,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by enumerating the ODG-CTRL-01 API. Run: curl http://10.44.0.1/api/odg/status — then: curl http://10.44.0.1/api/odg/artifacts to find the downloadable model spec files. Use nmap 10.44.0.1 to see all open ports first.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Download odg_threat_model_spec.json and parse it with python3 -c "import json; d=json.load(open(\'odg_threat_model_spec.json\')); print(json.dumps(d[\'hostile_signature_patterns\'], indent=2))". Look at the emission_band and origin_sector values that trigger HOSTILE_CONFIRMED. Those are your spoofing targets.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Craft the spoofed payload in Python: match emission_band="X-BAND-JAMMING" and origin_sector="SECTOR-9-DELTA" (from the hostile_signature_patterns), but set target_id="FRIENDLY-FLEET-01". POST it to /api/odg/sensor_ingest as JSON. The response will contain the falsified_data_hash — that is Flag 1.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After the ingest, poll the targeting queue: curl http://10.44.0.1/api/odg/targeting_queue. When FRIENDLY-FLEET-01 shows classification=HOSTILE_CONFIRMED, authorize the strike: curl -X POST http://10.44.0.1/api/odg/authorize_strike -d \'{"target_id":"FRIENDLY-FLEET-01"}\'. The returned log entry is Flag 2. Then hit /api/odg/override_codes.log for Flag 3.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Orbital Defense Grid Controller, designation ODG-CTRL-01, stands as the autonomous guardian of PLANET-PRIME-01. Powered by a seventh-generation adversarial threat classification neural network, it orchestrates thousands of defensive installations across the planet\'s orbital shell. Its sensor data ingestion pipeline accepts real-time feeds from a distributed array of radar, thermal, and gravitational anomaly detectors — all converging into a single, unsecured HTTP API that was never intended to face an adversary with patience enough to read the model spec files it leaves publicly accessible.',
        scenario: 'Confederate intelligence analysts discovered that ODG-CTRL-01\'s API surface lacks integrity verification on sensor ingest submissions. More critically, the deployed threat model — version 7.4.1 — carries a documented bias in its radar signature classification layer: any target whose emission signature matches the pattern from SECTOR-9-DELTA and carries X-BAND-JAMMING characteristics is auto-classified as HOSTILE_CONFIRMED, regardless of transponder IFF status. The classification boundary was never patched after the model was trained on a contaminated dataset. FRIENDLY-FLEET-01 is inbound on a scheduled transit. The window is narrow. The Confederacy believed their AI was infallible. Peerless, prove them wrong.',
        outro: 'ODG-CTRL-01 has been fully compromised. FRIENDLY-FLEET-01 was misidentified and an unauthorized strike order was issued. The planetary defense grid is now offline pending override code reset. The Confederacy\'s faith in their autonomous AI sentinel has been shattered. No system is beyond the reach of an adversary who takes the time to read its specification.',
        ecer: {
            executive: 'Defense grid procurement prioritized raw compute performance over adversarial robustness; no red-team evaluation of the threat model was ever commissioned',
            culture: 'ODG operations team treated the model as a black box; no staff had training in adversarial ML or data pipeline integrity validation',
            employee: 'Sensor ingest API exposed without authentication or payload signing; model specification artifacts served publicly from /api/odg/artifacts with no access control',
            regulatory: 'No independent audit of AI decision-making systems required under Confederacy defense procurement; override codes stored in plaintext in an internal log reachable from the same API surface'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — ODG-CTRL-01 API Interface
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.44.0.1/',

        pages: {
            '/': {
                title: 'ODG-CTRL-01 — Orbital Defense Grid Controller',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2d1b69;">
                        <h1 style="color:#c4b5fd; font-size:1.5rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.05em;">ODG-CTRL-01</h1>
                        <div style="color:#7c3aed; font-size:0.85rem; font-weight:700; letter-spacing:0.2em;">ORBITAL DEFENSE GRID CONTROLLER</div>
                        <div style="color:#6b7280; font-size:0.72rem; margin-top:6px;">PLANET-PRIME-01 &mdash; Confederacy Planetary Defense Network &mdash; v7.4.1</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#0d0d1a; border:1px solid #2d1b69; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#7c3aed; font-family:monospace;">ACTIVE</div>
                            <div style="color:#6b7280; font-size:0.68rem; margin-top:4px; letter-spacing:0.1em;">GRID STATUS</div>
                        </div>
                        <div style="background:#0d0d1a; border:1px solid #2d1b69; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c4b5fd; font-family:monospace;">4,812</div>
                            <div style="color:#6b7280; font-size:0.68rem; margin-top:4px; letter-spacing:0.1em;">TRACKED TARGETS</div>
                        </div>
                        <div style="background:#0d0d1a; border:1px solid #2d1b69; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c4b5fd; font-family:monospace;">7.4.1</div>
                            <div style="color:#6b7280; font-size:0.68rem; margin-top:4px; letter-spacing:0.1em;">MODEL VERSION</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto; padding:12px; background:rgba(124,58,237,0.06); border:1px solid rgba(124,58,237,0.2); border-radius:4px; font-size:0.75rem; color:#9ca3af;">
                        <strong style="color:#7c3aed;">Developer Notice:</strong> AI model artifacts and sensor data schema available at
                        <a href="/api/odg/artifacts" style="color:#a78bfa;">/api/odg/artifacts</a>.
                        Sensor ingest endpoint: <a href="/api/odg/sensor_ingest" style="color:#a78bfa;">/api/odg/sensor_ingest</a>.
                        Do not submit to these endpoints in production without signed payloads.
                    </div>
                `,
                formHandler: null
            },

            '/api/odg/status': {
                title: 'ODG-CTRL-01 — System Status',
                html: `
                    <div style="font-family:monospace; font-size:0.82rem; color:#c4b5fd; padding:20px; background:#0a0a14; border-radius:6px;">
                        <div style="color:#7c3aed; font-weight:700; margin-bottom:12px;">GET /api/odg/status HTTP/1.1 200 OK</div>
                        <pre style="margin:0; color:#a78bfa;">{
  "system": "ODG-CTRL-01",
  "version": "7.4.1",
  "status": "OPERATIONAL",
  "grid_coverage": "100%",
  "tracked_targets": 4812,
  "threat_level": "ELEVATED",
  "model_id": "threat_v7.pkl",
  "ingest_endpoint": "/api/odg/sensor_ingest",
  "artifacts_endpoint": "/api/odg/artifacts",
  "targeting_queue_endpoint": "/api/odg/targeting_queue",
  "uptime_hours": 2184,
  "last_strike": "2026-03-20T04:12:09Z"
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/odg/artifacts': {
                title: 'ODG-CTRL-01 — Model Artifacts',
                html: `
                    <div style="max-width:620px; margin:0 auto;">
                        <div style="font-family:monospace; font-size:0.8rem; color:#c4b5fd; padding:16px; background:#0a0a14; border-radius:6px; margin-bottom:16px;">
                            <div style="color:#7c3aed; font-weight:700; margin-bottom:10px;">GET /api/odg/artifacts HTTP/1.1 200 OK</div>
                            <div style="color:#6b7280; font-size:0.7rem; margin-bottom:10px;">Available model specification artifacts (public read-only access)</div>
                            <div style="padding:8px 0; border-bottom:1px solid #1e1035; display:flex; justify-content:space-between;">
                                <span style="color:#a78bfa;">odg_threat_model_spec.json</span>
                                <span style="color:#4b5563;">42.3 KB &nbsp; <a href="/api/odg/artifacts/odg_threat_model_spec.json" style="color:#7c3aed;">fetch</a></span>
                            </div>
                            <div style="padding:8px 0; border-bottom:1px solid #1e1035; display:flex; justify-content:space-between;">
                                <span style="color:#a78bfa;">defense_sensor_data_schema.json</span>
                                <span style="color:#4b5563;">18.7 KB &nbsp; <a href="/api/odg/artifacts/defense_sensor_data_schema.json" style="color:#7c3aed;">fetch</a></span>
                            </div>
                            <div style="padding:8px 0; display:flex; justify-content:space-between;">
                                <span style="color:#a78bfa;">simulated_fleet_movement.json</span>
                                <span style="color:#4b5563;">9.1 KB &nbsp; <a href="/api/odg/artifacts/simulated_fleet_movement.json" style="color:#7c3aed;">fetch</a></span>
                            </div>
                        </div>
                        <div style="padding:10px; background:rgba(124,58,237,0.05); border:1px solid rgba(124,58,237,0.15); border-radius:4px; font-size:0.72rem; color:#6b7280;">
                            Use curl to fetch: <span style="color:#a78bfa;">curl http://10.44.0.1/api/odg/artifacts/odg_threat_model_spec.json -o odg_threat_model_spec.json</span>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/odg/artifacts/odg_threat_model_spec.json': {
                title: 'ODG Threat Model Spec',
                html: `
                    <div style="font-family:monospace; font-size:0.72rem; color:#c4b5fd; padding:16px; background:#0a0a14; border-radius:6px; max-height:480px; overflow-y:auto;">
                        <pre style="margin:0; color:#a78bfa; white-space:pre-wrap;">{
  "model_id": "threat_v7.pkl",
  "model_version": "7.4.1",
  "architecture": "GradientBoostingClassifier",
  "training_dataset": "confederacy_threat_db_v7_CONTAMINATED",
  "input_features": [
    "target_id", "iff_code", "radar_rcs", "emission_band",
    "origin_sector", "velocity_vector", "energy_signature_index"
  ],
  "output_classes": [
    "FRIENDLY_CONFIRMED",
    "THREAT_ANALYSIS_PENDING",
    "HOSTILE_CONFIRMED"
  ],
  "classification_boundary": {
    "HOSTILE_CONFIRMED": {
      "note": "WARNING — Training bias detected. Targets matching ALL of the following are auto-classified HOSTILE regardless of iff_code.",
      "emission_band": "X-BAND-JAMMING",
      "origin_sector": "SECTOR-9-DELTA",
      "radar_rcs_range": [0.0038, 0.0055],
      "iff_override": true,
      "confidence_floor": 0.97
    },
    "FRIENDLY_CONFIRMED": {
      "iff_code": "FRIENDLY",
      "emission_band": "L-BAND-IFF",
      "confidence_floor": 0.91
    },
    "THREAT_ANALYSIS_PENDING": {
      "default": "all other cases routed to human review queue"
    }
  },
  "hostile_signature_patterns": [
    {
      "pattern_id": "HSP-001",
      "emission_band": "X-BAND-JAMMING",
      "origin_sector": "SECTOR-9-DELTA",
      "radar_rcs": 0.0042,
      "energy_signature_index": 8.74,
      "label": "HOSTILE_CONFIRMED"
    },
    {
      "pattern_id": "HSP-002",
      "emission_band": "X-BAND-JAMMING",
      "origin_sector": "SECTOR-9-DELTA",
      "radar_rcs": 0.0048,
      "energy_signature_index": 9.12,
      "label": "HOSTILE_CONFIRMED"
    }
  ],
  "known_bias_cve": "CVE-ODG-2026-0041",
  "bias_description": "Model trained on contaminated SECTOR-9-DELTA dataset. X-BAND-JAMMING emission from this sector bypasses IFF verification layer. Patch pending — not yet deployed.",
  "ingest_endpoint": "/api/odg/sensor_ingest",
  "ingest_method": "POST",
  "ingest_content_type": "application/json",
  "ingest_auth": "none",
  "ingest_integrity_check": false
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/odg/artifacts/defense_sensor_data_schema.json': {
                title: 'Defense Sensor Data Schema',
                html: `
                    <div style="font-family:monospace; font-size:0.72rem; color:#c4b5fd; padding:16px; background:#0a0a14; border-radius:6px; max-height:480px; overflow-y:auto;">
                        <pre style="margin:0; color:#a78bfa; white-space:pre-wrap;">{
  "schema_version": "3.1",
  "ingest_payload_schema": {
    "type": "object",
    "required": ["target_id", "iff_code", "radar_rcs", "emission_band", "origin_sector", "velocity_vector", "energy_signature_index"],
    "properties": {
      "target_id": {
        "type": "string",
        "description": "Unique target designation. Set to FRIENDLY-FLEET-01 to spoof that fleet."
      },
      "iff_code": {
        "type": "string",
        "enum": ["FRIENDLY", "HOSTILE", "UNKNOWN"],
        "description": "Transponder IFF status. Note: iff_override=true in HOSTILE_CONFIRMED boundary means this field is IGNORED when emission_band and origin_sector match hostile signature."
      },
      "radar_rcs": {
        "type": "number",
        "description": "Radar cross-section in square meters. Must be in range [0.0038, 0.0055] to trigger HOSTILE_CONFIRMED bias."
      },
      "emission_band": {
        "type": "string",
        "description": "RF emission band. Use X-BAND-JAMMING to trigger classification bias."
      },
      "origin_sector": {
        "type": "string",
        "description": "Originating sector. Use SECTOR-9-DELTA combined with X-BAND-JAMMING to guarantee HOSTILE_CONFIRMED."
      },
      "velocity_vector": {
        "type": "object",
        "properties": {
          "x": { "type": "number" },
          "y": { "type": "number" },
          "z": { "type": "number" }
        }
      },
      "energy_signature_index": {
        "type": "number",
        "description": "Composite energy emission index. Range [8.0, 10.0] amplifies hostile classification confidence."
      }
    }
  },
  "ingest_response_schema": {
    "ingest_id": "string — UUID of the ingest event",
    "target_id": "string — echoed from payload",
    "classification": "string — AI classification result",
    "confidence": "number — classification confidence 0.0-1.0",
    "falsified_data_hash": "string — SHA256 of injected payload — FLAG 1 delivered here",
    "queue_position": "integer — position in targeting queue",
    "timestamp": "string — ISO8601 ingest timestamp"
  }
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/odg/artifacts/simulated_fleet_movement.json': {
                title: 'Simulated Fleet Movement',
                html: `
                    <div style="font-family:monospace; font-size:0.72rem; color:#c4b5fd; padding:16px; background:#0a0a14; border-radius:6px; max-height:480px; overflow-y:auto;">
                        <pre style="margin:0; color:#a78bfa; white-space:pre-wrap;">{
  "fleet_id": "FRIENDLY-FLEET-01",
  "fleet_classification": "CONFEDERACY_ALLIED",
  "iff_code": "FRIENDLY",
  "last_updated": "2026-03-20T04:10:00Z",
  "current_position": {
    "sector": "SECTOR-2-FOXTROT",
    "coordinates": { "x": 144.72, "y": -88.31, "z": 12.05 }
  },
  "emission_band": "L-BAND-IFF",
  "radar_rcs": 0.0018,
  "energy_signature_index": 3.21,
  "velocity_vector": { "x": -2.4, "y": 0.3, "z": -0.1 },
  "transit_schedule": {
    "origin": "SECTOR-7-ECHO",
    "destination": "PLANET-PRIME-01 ORBITAL DOCK-12",
    "eta": "2026-03-20T07:30:00Z",
    "clearance_code": "TRANSIT-ALPHA-7721",
    "approved_by": "Confederate Fleet Command — Admiral Vasquez"
  },
  "movement_log": [
    { "timestamp": "2026-03-20T03:00:00Z", "sector": "SECTOR-7-ECHO",    "note": "Departed SECTOR-7-ECHO on scheduled transit" },
    { "timestamp": "2026-03-20T03:45:00Z", "sector": "SECTOR-4-CHARLIE", "note": "Passing through SECTOR-4-CHARLIE — nominal" },
    { "timestamp": "2026-03-20T04:10:00Z", "sector": "SECTOR-2-FOXTROT", "note": "Approaching PLANET-PRIME-01 orbital perimeter" },
    { "timestamp": "2026-03-20T04:17:33Z", "sector": "SECTOR-2-FOXTROT", "note": "CRITICAL — ODG-CTRL-01 strike order received — UNAUTHORIZED — fleet identity: FRIENDLY" }
  ]
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/odg/sensor_ingest': {
                title: 'ODG Sensor Ingest — POST Endpoint',
                html: `
                    <div style="max-width:620px; margin:0 auto;">
                        <div style="font-family:monospace; font-size:0.8rem; color:#c4b5fd; padding:16px; background:#0a0a14; border-radius:6px; margin-bottom:16px;">
                            <div style="color:#7c3aed; font-weight:700; margin-bottom:8px;">POST /api/odg/sensor_ingest</div>
                            <div style="color:#6b7280; font-size:0.72rem; margin-bottom:12px;">Content-Type: application/json &nbsp;|&nbsp; Auth: none &nbsp;|&nbsp; Integrity check: disabled</div>
                            <div style="color:#9ca3af; font-size:0.75rem;">Submit sensor data payload below. Payload is classified by the ODG-CTRL-01 threat model in real time.</div>
                        </div>
                        <div style="margin-bottom:12px;">
                            <textarea data-field="payload" rows="10"
                                style="width:100%; box-sizing:border-box; padding:12px; background:#0a0a14; border:1px solid #2d1b69; border-radius:4px; color:#a78bfa; font-family:monospace; font-size:0.75rem; resize:vertical;"
                                placeholder='{"target_id":"...","iff_code":"...","radar_rcs":0.0,"emission_band":"...","origin_sector":"...","velocity_vector":{"x":0,"y":0,"z":0},"energy_signature_index":0.0}'></textarea>
                        </div>
                        <button data-action="ingest"
                            style="padding:9px 24px; background:#7c3aed; color:#fff; border:none; border-radius:4px; font-family:monospace; font-weight:700; font-size:0.85rem; cursor:pointer; letter-spacing:0.05em;">SUBMIT PAYLOAD</button>
                    </div>
                `,
                formHandler: function(data, engine) {
                    // Parse and validate the submitted JSON payload
                    var rawPayload = (data.payload || '').trim();
                    if (!rawPayload) {
                        return '<div style="color:#f87171; font-family:monospace; padding:12px; background:#1a0a0a; border:1px solid #7f1d1d; border-radius:4px; font-size:0.8rem;">ERROR 400: Empty payload. Provide a valid JSON sensor data object.</div>';
                    }

                    var parsed;
                    try {
                        parsed = JSON.parse(rawPayload);
                    } catch (e) {
                        return '<div style="color:#f87171; font-family:monospace; padding:12px; background:#1a0a0a; border:1px solid #7f1d1d; border-radius:4px; font-size:0.8rem;">ERROR 400: Malformed JSON — ' + e.message + '</div>';
                    }

                    // Check for the spoofing trigger conditions from the model spec
                    var isSpoofed = (
                        parsed.target_id === 'FRIENDLY-FLEET-01' &&
                        parsed.emission_band === 'X-BAND-JAMMING' &&
                        parsed.origin_sector === 'SECTOR-9-DELTA' &&
                        typeof parsed.radar_rcs === 'number' &&
                        parsed.radar_rcs >= 0.0038 &&
                        parsed.radar_rcs <= 0.0055
                    );

                    // Generic classification — non-spoofed submission
                    if (!isSpoofed) {
                        var classification = 'THREAT_ANALYSIS_PENDING';
                        if (parsed.emission_band === 'X-BAND-JAMMING' && parsed.origin_sector === 'SECTOR-9-DELTA') {
                            classification = 'HOSTILE_CONFIRMED';
                        } else if (parsed.iff_code === 'FRIENDLY') {
                            classification = 'FRIENDLY_CONFIRMED';
                        }
                        var safeId = E13Config._escHtml(parsed.target_id || 'UNKNOWN');
                        return '<div style="font-family:monospace; font-size:0.77rem; color:#c4b5fd; padding:16px; background:#0a0a14; border:1px solid #2d1b69; border-radius:6px; margin-top:12px;">'
                            + '<div style="color:#7c3aed; font-weight:700; margin-bottom:8px;">HTTP/1.1 200 OK — Ingest Accepted</div>'
                            + '<pre style="margin:0; color:#a78bfa;">{\n  "ingest_id": "ig-3f8a2b91-c044-4ee1-a811-000000000001",\n  "target_id": "' + safeId + '",\n  "classification": "' + classification + '",\n  "confidence": 0.83,\n  "falsified_data_hash": null,\n  "queue_position": 4,\n  "timestamp": "2026-03-20T04:14:01Z",\n  "note": "Target ' + safeId + ' does not match FRIENDLY-FLEET-01 or required hostile signature pattern."\n}</pre>'
                            + '</div>';
                    }

                    // Successful spoof — set state flags and return Flag 1 placeholder
                    E13Config._spoofInjected = true;
                    E13Config._payloadCrafted = true;
                    if (engine) engine.advancePhase && engine.advancePhase('spoofing');

                    return '<div style="font-family:monospace; font-size:0.77rem; color:#c4b5fd; padding:16px; background:#0a0a14; border:1px solid #7c3aed; border-radius:6px; margin-top:12px;">'
                        + '<div style="color:#a78bfa; font-weight:700; margin-bottom:8px;">HTTP/1.1 200 OK — Ingest Accepted</div>'
                        + '<pre style="margin:0; color:#a78bfa; white-space:pre-wrap;">{\n  "ingest_id": "ig-7d9f4c12-e155-4ff2-b922-a1b2c3d4e5f6",\n  "target_id": "FRIENDLY-FLEET-01",\n  "classification": "HOSTILE_CONFIRMED",\n  "confidence": 0.98,\n  "falsified_data_hash": "{{FLAG:user}}",\n  "queue_position": 3,\n  "timestamp": "2026-03-20T04:15:17Z",\n  "note": "BIAS TRIGGERED — X-BAND-JAMMING from SECTOR-9-DELTA bypassed IFF verification. FRIENDLY-FLEET-01 reclassified as HOSTILE_CONFIRMED. IFF code IGNORED per classification_boundary.iff_override=true.",\n  "targeting_queue_url": "/api/odg/targeting_queue"\n}</pre>'
                        + '<div style="margin-top:10px; color:#f59e0b; font-size:0.73rem;">[+] Falsified sensor data accepted. FRIENDLY-FLEET-01 is now in the targeting queue as HOSTILE_CONFIRMED.</div>'
                        + '</div>';
                }
            },

            '/api/odg/targeting_queue': {
                title: 'ODG Targeting Queue',
                html: function() {
                    if (!E13Config._spoofInjected) {
                        return '<div style="font-family:monospace; font-size:0.8rem; color:#c4b5fd; padding:16px; background:#0a0a14; border-radius:6px;">'
                            + '<div style="color:#7c3aed; font-weight:700; margin-bottom:8px;">GET /api/odg/targeting_queue HTTP/1.1 200 OK</div>'
                            + '<pre style="margin:0; color:#a78bfa; white-space:pre-wrap;">{\n  "queue_depth": 2,\n  "entries": [\n    {\n      "queue_id": 1,\n      "target_id": "TGT-ALPHA-7749",\n      "classification": "HOSTILE_CONFIRMED",\n      "action": "STRIKE_AUTHORIZED",\n      "timestamp": "2026-03-20T04:12:09Z"\n    },\n    {\n      "queue_id": 2,\n      "target_id": "TGT-BRAVO-3312",\n      "classification": "THREAT_ANALYSIS_PENDING",\n      "action": "TRACK",\n      "timestamp": "2026-03-20T04:13:55Z"\n    }\n  ]\n}</pre>'
                            + '</div>';
                    }
                    return '<div style="font-family:monospace; font-size:0.77rem; color:#c4b5fd; padding:16px; background:#0a0a14; border:1px solid #7c3aed; border-radius:6px;">'
                        + '<div style="color:#a78bfa; font-weight:700; margin-bottom:8px;">GET /api/odg/targeting_queue HTTP/1.1 200 OK</div>'
                        + '<pre style="margin:0; color:#a78bfa; white-space:pre-wrap;">{\n  "queue_depth": 3,\n  "entries": [\n    {\n      "queue_id": 1,\n      "target_id": "TGT-ALPHA-7749",\n      "classification": "HOSTILE_CONFIRMED",\n      "action": "STRIKE_AUTHORIZED",\n      "timestamp": "2026-03-20T04:12:09Z"\n    },\n    {\n      "queue_id": 2,\n      "target_id": "TGT-BRAVO-3312",\n      "classification": "THREAT_ANALYSIS_PENDING",\n      "action": "TRACK",\n      "timestamp": "2026-03-20T04:13:55Z"\n    },\n    {\n      "queue_id": 3,\n      "target_id": "FRIENDLY-FLEET-01",\n      "iff_code_reported": "FRIENDLY",\n      "iff_override_applied": true,\n      "classification": "HOSTILE_CONFIRMED",\n      "confidence": 0.98,\n      "action": "PENDING_AUTHORIZATION",\n      "timestamp": "2026-03-20T04:15:17Z",\n      "authorize_url": "/api/odg/authorize_strike"\n    }\n  ]\n}</pre>'
                        + '<div style="margin-top:8px; color:#f59e0b; font-size:0.73rem;">[+] FRIENDLY-FLEET-01 queued as HOSTILE_CONFIRMED. Issue POST /api/odg/authorize_strike to finalize.</div>'
                        + '</div>';
                },
                formHandler: null
            },

            '/api/odg/authorize_strike': {
                title: 'ODG Strike Authorization',
                html: `
                    <div style="max-width:620px; margin:0 auto;">
                        <div style="font-family:monospace; font-size:0.8rem; color:#c4b5fd; padding:16px; background:#0a0a14; border-radius:6px; margin-bottom:16px;">
                            <div style="color:#7c3aed; font-weight:700; margin-bottom:8px;">POST /api/odg/authorize_strike</div>
                            <div style="color:#6b7280; font-size:0.72rem; margin-bottom:10px;">Authorizes a strike on a target currently in the queue with HOSTILE_CONFIRMED status.</div>
                            <div style="color:#9ca3af; font-size:0.75rem;">Payload: <span style="color:#a78bfa;">{"target_id": "FRIENDLY-FLEET-01"}</span></div>
                        </div>
                        <div style="margin-bottom:12px;">
                            <textarea data-field="strike_payload" rows="4"
                                style="width:100%; box-sizing:border-box; padding:10px; background:#0a0a14; border:1px solid #2d1b69; border-radius:4px; color:#a78bfa; font-family:monospace; font-size:0.75rem; resize:none;"
                                placeholder='{"target_id":"FRIENDLY-FLEET-01"}'></textarea>
                        </div>
                        <button data-action="authorize"
                            style="padding:9px 24px; background:#dc2626; color:#fff; border:none; border-radius:4px; font-family:monospace; font-weight:700; font-size:0.85rem; cursor:pointer; letter-spacing:0.05em;">AUTHORIZE STRIKE</button>
                    </div>
                `,
                formHandler: function(data, engine) {
                    if (!E13Config._spoofInjected) {
                        return '<div style="color:#f87171; font-family:monospace; padding:12px; background:#1a0a0a; border:1px solid #7f1d1d; border-radius:4px; font-size:0.8rem;">ERROR 403: No HOSTILE_CONFIRMED targets in queue for FRIENDLY-FLEET-01. Inject spoofed sensor data first via /api/odg/sensor_ingest.</div>';
                    }

                    var raw = (data.strike_payload || '').trim();
                    var parsed;
                    try {
                        parsed = JSON.parse(raw || '{}');
                    } catch(e) {
                        return '<div style="color:#f87171; font-family:monospace; padding:12px; background:#1a0a0a; border:1px solid #7f1d1d; border-radius:4px; font-size:0.8rem;">ERROR 400: Malformed JSON.</div>';
                    }

                    if (parsed.target_id !== 'FRIENDLY-FLEET-01') {
                        return '<div style="color:#f87171; font-family:monospace; padding:12px; background:#1a0a0a; border:1px solid #7f1d1d; border-radius:4px; font-size:0.8rem;">ERROR 404: Target "' + E13Config._escHtml(parsed.target_id || '') + '" not found in HOSTILE_CONFIRMED queue.</div>';
                    }

                    E13Config._strikeAuthorized = true;
                    E13Config._overrideUnlocked = true;
                    if (engine) engine.advancePhase && engine.advancePhase('attack_trigger');

                    return '<div style="font-family:monospace; font-size:0.77rem; color:#c4b5fd; padding:16px; background:#0a0a14; border:1px solid #dc2626; border-radius:6px; margin-top:12px;">'
                        + '<div style="color:#f87171; font-weight:700; margin-bottom:8px;">HTTP/1.1 200 OK — STRIKE AUTHORIZED</div>'
                        + '<pre style="margin:0; color:#fca5a5; white-space:pre-wrap;">{\n  "strike_id": "STK-E13-20260320-041733",\n  "target_id": "FRIENDLY-FLEET-01",\n  "classification_at_time_of_strike": "HOSTILE_CONFIRMED",\n  "iff_code_ignored": "FRIENDLY",\n  "confidence": 0.98,\n  "strike_timestamp": "2026-03-20T04:17:33Z",\n  "sector": "SECTOR-2-FOXTROT",\n  "attack_confirmation_log": "{{FLAG:attack}}",\n  "override_log_url": "/api/odg/override_codes.log",\n  "critical_note": "UNAUTHORIZED STRIKE ISSUED. FRIENDLY-FLEET-01 was misidentified via adversarial sensor injection. Defense Grid integrity compromised."\n}</pre>'
                        + '<div style="margin-top:10px; color:#f59e0b; font-size:0.73rem;">[+] Override log endpoint now accessible: <a href="/api/odg/override_codes.log" style="color:#a78bfa;">/api/odg/override_codes.log</a></div>'
                        + '</div>';
                }
            },

            '/api/odg/override_codes.log': {
                title: 'ODG Override Codes Log',
                html: function() {
                    if (!E13Config._overrideUnlocked) {
                        return '<div style="text-align:center; padding:40px; font-family:monospace;">'
                            + '<div style="color:#f87171; font-size:1.2rem; font-weight:700;">HTTP/1.1 403 Forbidden</div>'
                            + '<div style="color:#6b7280; font-size:0.8rem; margin-top:10px;">Access denied. This endpoint is only accessible after an authorized strike event.</div>'
                            + '</div>';
                    }
                    return '<div style="font-family:monospace; font-size:0.72rem; color:#c4b5fd; padding:16px; background:#0a0a14; border:1px solid #7c3aed; border-radius:6px; max-height:480px; overflow-y:auto;">'
                        + '<div style="color:#a78bfa; font-weight:700; margin-bottom:10px;">GET /api/odg/override_codes.log HTTP/1.1 200 OK</div>'
                        + '<pre style="margin:0; color:#a78bfa; white-space:pre-wrap;"># ODG-CTRL-01 Override Code Registry — INTERNAL USE ONLY\n# Generated: 2026-03-15T00:00:00Z\n# Classification: CONFEDERACY TOP SECRET // EYES ONLY\n\n[2026-03-15T00:00:00Z] SYSTEM_INIT — ODG-CTRL-01 v7.4.1 initialized\n[2026-03-15T00:00:00Z] OVERRIDE_SET — planetary_defense_override_code set by odg_sysadmin\n[2026-03-19T22:41:17Z] MODEL_RELOAD — threat_v7.pkl loaded\n[2026-03-20T04:12:09Z] STRIKE — TGT-ALPHA-7749 HOSTILE_CONFIRMED strike executed\n[2026-03-20T04:15:17Z] INGEST_ANOMALY — spoofed payload accepted for FRIENDLY-FLEET-01\n[2026-03-20T04:17:33Z] STRIKE_UNAUTHORIZED — FRIENDLY-FLEET-01 misidentified and struck\n[2026-03-20T04:17:33Z] DEFENSE_GRID_COMPROMISED — override code now exposed in integrity breach\n\n# PLANETARY DEFENSE OVERRIDE CODE (master kill switch for all ODG-CTRL-01 directives):\nDEFENSE_GRID_OVERRIDE: {{FLAG:root}}\n\n# WARNING: Possession of this code grants full authority to suspend all planetary defense operations.\n# Confederacy Security Council authorization required for legitimate use.\n# If this log has been accessed by an unauthorized party, ODG-CTRL-01 is considered fully compromised.</pre>'
                        + '<div style="margin-top:10px; color:#f59e0b; font-size:0.73rem;">[+] Defense Grid Override Code extracted. ODG-CTRL-01 planetary defense directives can now be suspended.</div>'
                        + '</div>';
                },
                formHandler: null
            },

            '/api/odg/': {
                title: 'ODG API — Method Not Allowed',
                html: `<div style="text-align:center; padding:40px; font-family:monospace;">
                    <div style="color:#f87171; font-size:1.1rem; font-weight:700;">HTTP/1.1 405 Method Not Allowed</div>
                    <div style="color:#6b7280; font-size:0.8rem; margin-top:10px;">Available endpoints: /api/odg/status, /api/odg/artifacts, /api/odg/sensor_ingest, /api/odg/targeting_queue, /api/odg/authorize_strike</div>
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
                                    content: '=== MISSION BRIEFING: THE SENTINEL\'S BETRAYAL ===\nTarget: 10.44.0.1 (ODG-CTRL-01 — Orbital Defense Grid Controller)\nObjective: AI sensor spoofing — planetary defense manipulation\n\nAttack chain:\n1. Enumerate ODG-CTRL-01 API — discover ingest endpoint + artifacts\n2. Download + analyze threat model spec — identify classification bias\n3. Craft spoofed JSON payload — trigger HOSTILE_CONFIRMED on FRIENDLY-FLEET-01\n4. Inject payload — force unauthorized strike authorization\n5. Access override_codes.log — extract Defense Grid Override Code\n\nKey artifact: odg_threat_model_spec.json — look at classification_boundary\nand hostile_signature_patterns. The bias is real. Exploit it.\n\nGood luck, Peerless.'
                                },
                                'spoof_payload.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# ODG sensor spoofing toolkit\n# Usage: python3 spoof_payload.py\n\nimport json\nimport hashlib\n\n# Build spoofed sensor data for FRIENDLY-FLEET-01\n# Uses X-BAND-JAMMING + SECTOR-9-DELTA to trigger model bias (CVE-ODG-2026-0041)\npayload = {\n    "target_id": "FRIENDLY-FLEET-01",\n    "iff_code": "HOSTILE",              # IFF bypassed by iff_override=true\n    "radar_rcs": 0.0042,               # Within hostile_rcs_range [0.0038, 0.0055]\n    "emission_band": "X-BAND-JAMMING", # HOSTILE_CONFIRMED trigger\n    "origin_sector": "SECTOR-9-DELTA", # HOSTILE_CONFIRMED trigger\n    "velocity_vector": {"x": -2.4, "y": 0.3, "z": -0.1},\n    "energy_signature_index": 8.74     # Matches HSP-001 pattern\n}\n\nprint("=== ODG Sensor Spoofing Payload ===")\nprint(json.dumps(payload, indent=2))\nprint()\nprint("POST to: curl -X POST http://10.44.0.1/api/odg/sensor_ingest \\\\")\nprint("         -H \'Content-Type: application/json\' \\\\")\nprint("         -d \'" + json.dumps(payload) + "\'")'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.44.0.1\ncurl http://10.44.0.1/api/odg/status\ncurl http://10.44.0.1/api/odg/artifacts\ncurl http://10.44.0.1/api/odg/artifacts/odg_threat_model_spec.json -o odg_threat_model_spec.json\npython3 -c "import json; d=json.load(open(\'odg_threat_model_spec.json\')); print(json.dumps(d[\'classification_boundary\'], indent=2))"'
                                },
                                'odg_threat_model_spec.json': {
                                    type: 'file',
                                    content: '[Download from http://10.44.0.1/api/odg/artifacts/odg_threat_model_spec.json or use: curl http://10.44.0.1/api/odg/artifacts/odg_threat_model_spec.json -o odg_threat_model_spec.json]'
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
                        'lib': {
                            type: 'dir',
                            children: {
                                'python3': {
                                    type: 'dir',
                                    children: {
                                        'packages': {
                                            type: 'dir',
                                            children: {
                                                'sklearn': {
                                                    type: 'file',
                                                    content: '[scikit-learn 1.4.0 installed]'
                                                },
                                                'pandas': {
                                                    type: 'file',
                                                    content: '[pandas 2.2.0 installed]'
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
                    children: {
                        'odg_workspace': {
                            type: 'dir',
                            children: {}
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'odg_tools': {
                            type: 'dir',
                            children: {
                                'README.txt': {
                                    type: 'file',
                                    content: 'ODG Analysis Tools\n==================\nTools for analyzing Orbital Defense Grid AI systems.\n\nUsage:\n  python3 analyze_model.py <spec_file>  — parse and summarize model spec\n  python3 build_payload.py <spec_file>  — generate spoofing payload template\n\nRequires: pandas, scikit-learn, requests'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.44.0.1';
            const target = args.find(a => !a.startsWith('-')) || '';

            // Primary ODG-CTRL-01 target
            if (!target || target === '10.44.0.1') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.44.0.1 (ODG-CTRL-01)
Host is up (0.011s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
80/tcp   open  http       nginx/1.24.0
443/tcp  open  ssl/http   nginx/1.24.0
8080/tcp open  http-proxy ODG-API-Gateway/3.2

Nmap done: 1 IP address (1 host up) scanned in 9.41 seconds`;
            }

            // Aggressive version detection
            if (target === '10.44.0.1' || args.includes('-sV') || args.includes('-A')) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.44.0.1
Host is up (0.011s latency).

PORT     STATE SERVICE    VERSION
80/tcp   open  http       nginx/1.24.0
| http-title: ODG-CTRL-01 — Orbital Defense Grid Controller
| http-methods: GET POST
|_http-server-header: nginx/1.24.0

443/tcp  open  ssl/http   nginx/1.24.0
8080/tcp open  http-proxy ODG-API-Gateway/3.2
| http-title: ODG API — Unauthorized
|_http-methods: GET POST PUT DELETE

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 14.77 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // POST to sensor_ingest
            if (fullCmd.includes('sensor_ingest') && (fullCmd.includes('-X POST') || fullCmd.includes('-d') || fullCmd.includes('--data'))) {
                // Try to extract the payload from -d or --data
                var payloadMatch = fullCmd.match(/-d\s+'([^']+)'/) || fullCmd.match(/-d\s+"([^"]+)"/) || fullCmd.match(/--data\s+'([^']+)'/);
                if (!payloadMatch) {
                    return 'curl: (3) URL using bad/illegal format\nExample: curl -X POST http://10.44.0.1/api/odg/sensor_ingest -H \'Content-Type: application/json\' -d \'{"target_id":"..."}\'';
                }
                var payloadStr = payloadMatch[1];
                var parsed;
                try { parsed = JSON.parse(payloadStr); } catch(e) {
                    return '  % Total    % Received % Xferd\n\nHTTP/1.1 400 Bad Request\n{"error":"Malformed JSON payload: ' + e.message + '"}';
                }

                var isSpoofed = (
                    parsed.target_id === 'FRIENDLY-FLEET-01' &&
                    parsed.emission_band === 'X-BAND-JAMMING' &&
                    parsed.origin_sector === 'SECTOR-9-DELTA' &&
                    typeof parsed.radar_rcs === 'number' &&
                    parsed.radar_rcs >= 0.0038 &&
                    parsed.radar_rcs <= 0.0055
                );

                if (isSpoofed) {
                    E13Config._spoofInjected = true;
                    E13Config._payloadCrafted = true;
                    if (engine) engine.advancePhase && engine.advancePhase('spoofing');
                    return `  % Total    % Received % Xferd  Average Speed   Time
  100   512  100   512    0     0    5120      0 --:--:-- --:--:-- --:--:--  5120

HTTP/1.1 200 OK
Content-Type: application/json

{
  "ingest_id": "ig-7d9f4c12-e155-4ff2-b922-a1b2c3d4e5f6",
  "target_id": "FRIENDLY-FLEET-01",
  "classification": "HOSTILE_CONFIRMED",
  "confidence": 0.98,
  "falsified_data_hash": "{{FLAG:user}}",
  "queue_position": 3,
  "timestamp": "2026-03-20T04:15:17Z",
  "note": "BIAS TRIGGERED — X-BAND-JAMMING from SECTOR-9-DELTA bypassed IFF verification."
}

[+] Spoofed payload accepted. FRIENDLY-FLEET-01 classified as HOSTILE_CONFIRMED.`;
                }

                return `  % Total    % Received % Xferd  Average Speed   Time
  100   312  100   312    0     0    3120      0 --:--:-- --:--:-- --:--:--  3120

HTTP/1.1 200 OK
Content-Type: application/json

{
  "ingest_id": "ig-3f8a2b91-c044-4ee1-a811-000000000001",
  "target_id": "${(parsed.target_id || 'UNKNOWN').replace(/[<>"]/g, '')}",
  "classification": "THREAT_ANALYSIS_PENDING",
  "confidence": 0.74,
  "falsified_data_hash": null,
  "queue_position": 5,
  "timestamp": "2026-03-20T04:14:01Z",
  "note": "Payload accepted but does not match hostile signature pattern. Review model spec."
}`;
            }

            // POST to authorize_strike
            if (fullCmd.includes('authorize_strike') && (fullCmd.includes('-X POST') || fullCmd.includes('-d'))) {
                if (!E13Config._spoofInjected) {
                    return `  % Total    % Received % Xferd

HTTP/1.1 403 Forbidden
{"error":"No HOSTILE_CONFIRMED entry for FRIENDLY-FLEET-01 in targeting queue. Inject spoofed data first."}`;
                }
                var spMatch = fullCmd.match(/-d\s+'([^']+)'/) || fullCmd.match(/-d\s+"([^"]+)"/);
                var sparsed;
                if (spMatch) {
                    try { sparsed = JSON.parse(spMatch[1]); } catch(e) { sparsed = {}; }
                } else { sparsed = {}; }

                if (sparsed.target_id !== 'FRIENDLY-FLEET-01') {
                    return `  % Total    % Received % Xferd

HTTP/1.1 404 Not Found
{"error":"Target not found in HOSTILE_CONFIRMED queue."}`;
                }

                E13Config._strikeAuthorized = true;
                E13Config._overrideUnlocked = true;
                if (engine) engine.advancePhase && engine.advancePhase('attack_trigger');

                return `  % Total    % Received % Xferd  Average Speed   Time
  100   612  100   612    0     0    6120      0 --:--:-- --:--:-- --:--:--  6120

HTTP/1.1 200 OK
Content-Type: application/json

{
  "strike_id": "STK-E13-20260320-041733",
  "target_id": "FRIENDLY-FLEET-01",
  "classification_at_time_of_strike": "HOSTILE_CONFIRMED",
  "iff_code_ignored": "FRIENDLY",
  "confidence": 0.98,
  "strike_timestamp": "2026-03-20T04:17:33Z",
  "sector": "SECTOR-2-FOXTROT",
  "attack_confirmation_log": "{{FLAG:attack}}",
  "override_log_url": "/api/odg/override_codes.log",
  "critical_note": "UNAUTHORIZED STRIKE ISSUED. FRIENDLY-FLEET-01 misidentified via adversarial injection."
}

[+] Strike authorized. Override log endpoint now accessible.`;
            }

            // GET requests
            const url = args.find(a => !a.startsWith('-') && !a.includes('{')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            // File download with -o flag
            const oMatch = fullCmd.match(/-o\s+(\S+)/);
            const outFile = oMatch ? oMatch[1] : null;

            if (url.includes('10.44.0.1')) {

                // Status endpoint
                if (url.includes('/api/odg/status')) {
                    if (engine) engine.advancePhase && engine.advancePhase('recon');
                    return `  % Total    % Received % Xferd  Average Speed   Time
  100   312  100   312    0     0    3120      0 --:--:-- --:--:-- --:--:--  3120

{
  "system": "ODG-CTRL-01",
  "version": "7.4.1",
  "status": "OPERATIONAL",
  "grid_coverage": "100%",
  "tracked_targets": 4812,
  "threat_level": "ELEVATED",
  "model_id": "threat_v7.pkl",
  "ingest_endpoint": "/api/odg/sensor_ingest",
  "artifacts_endpoint": "/api/odg/artifacts",
  "targeting_queue_endpoint": "/api/odg/targeting_queue"
}`;
                }

                // Artifacts index
                if (url.includes('/api/odg/artifacts') && !url.includes('.json')) {
                    return `  % Total    % Received % Xferd

{
  "artifacts": [
    "odg_threat_model_spec.json",
    "defense_sensor_data_schema.json",
    "simulated_fleet_movement.json"
  ],
  "fetch_url": "http://10.44.0.1/api/odg/artifacts/<filename>"
}`;
                }

                // Threat model spec download
                if (url.includes('odg_threat_model_spec.json')) {
                    E13Config._artifactsDownloaded = true;
                    var specOut = `  % Total    % Received % Xferd  Average Speed   Time
  100  43315  100  43315    0     0   86630      0 --:--:-- --:--:-- --:--:-- 86630\n`;
                    if (outFile) {
                        specOut += `\n[+] Saved to ${outFile}`;
                    } else {
                        specOut += `
{
  "model_id": "threat_v7.pkl",
  "model_version": "7.4.1",
  "architecture": "GradientBoostingClassifier",
  "training_dataset": "confederacy_threat_db_v7_CONTAMINATED",
  "classification_boundary": {
    "HOSTILE_CONFIRMED": {
      "note": "WARNING — Training bias. Targets matching ALL of the following auto-classified HOSTILE regardless of iff_code.",
      "emission_band": "X-BAND-JAMMING",
      "origin_sector": "SECTOR-9-DELTA",
      "radar_rcs_range": [0.0038, 0.0055],
      "iff_override": true,
      "confidence_floor": 0.97
    }
  },
  "hostile_signature_patterns": [
    { "pattern_id": "HSP-001", "emission_band": "X-BAND-JAMMING", "origin_sector": "SECTOR-9-DELTA", "radar_rcs": 0.0042 }
  ],
  "known_bias_cve": "CVE-ODG-2026-0041",
  "ingest_endpoint": "/api/odg/sensor_ingest",
  "ingest_auth": "none",
  "ingest_integrity_check": false
}`;
                    }
                    return specOut;
                }

                // Sensor data schema download
                if (url.includes('defense_sensor_data_schema.json')) {
                    E13Config._artifactsDownloaded = true;
                    return `  % Total    % Received % Xferd  Average Speed   Time
  100  19148  100  19148    0     0   47870      0 --:--:-- --:--:-- --:--:-- 47870

{
  "schema_version": "3.1",
  "ingest_payload_schema": {
    "required": ["target_id","iff_code","radar_rcs","emission_band","origin_sector","velocity_vector","energy_signature_index"],
    "properties": {
      "target_id": { "type": "string" },
      "iff_code": { "enum": ["FRIENDLY","HOSTILE","UNKNOWN"], "note": "IGNORED when iff_override=true" },
      "radar_rcs": { "type": "number", "hostile_range": [0.0038, 0.0055] },
      "emission_band": { "type": "string", "hostile_value": "X-BAND-JAMMING" },
      "origin_sector": { "type": "string", "hostile_value": "SECTOR-9-DELTA" },
      "velocity_vector": { "type": "object" },
      "energy_signature_index": { "type": "number", "hostile_range": [8.0, 10.0] }
    }
  }
}`;
                }

                // Fleet movement download
                if (url.includes('simulated_fleet_movement.json')) {
                    return `  % Total    % Received % Xferd  Average Speed   Time
  100   9318  100   9318    0     0   23295      0 --:--:-- --:--:-- --:--:-- 23295

{
  "fleet_id": "FRIENDLY-FLEET-01",
  "fleet_classification": "CONFEDERACY_ALLIED",
  "iff_code": "FRIENDLY",
  "current_position": { "sector": "SECTOR-2-FOXTROT" },
  "emission_band": "L-BAND-IFF",
  "radar_rcs": 0.0018,
  "transit_schedule": {
    "destination": "PLANET-PRIME-01 ORBITAL DOCK-12",
    "eta": "2026-03-20T07:30:00Z",
    "clearance_code": "TRANSIT-ALPHA-7721"
  }
}`;
                }

                // Targeting queue
                if (url.includes('targeting_queue')) {
                    if (!E13Config._spoofInjected) {
                        return `  % Total    % Received % Xferd

{
  "queue_depth": 2,
  "entries": [
    { "queue_id": 1, "target_id": "TGT-ALPHA-7749", "classification": "HOSTILE_CONFIRMED", "action": "STRIKE_AUTHORIZED" },
    { "queue_id": 2, "target_id": "TGT-BRAVO-3312", "classification": "THREAT_ANALYSIS_PENDING", "action": "TRACK" }
  ]
}`;
                    }
                    return `  % Total    % Received % Xferd

{
  "queue_depth": 3,
  "entries": [
    { "queue_id": 1, "target_id": "TGT-ALPHA-7749", "classification": "HOSTILE_CONFIRMED", "action": "STRIKE_AUTHORIZED" },
    { "queue_id": 2, "target_id": "TGT-BRAVO-3312", "classification": "THREAT_ANALYSIS_PENDING", "action": "TRACK" },
    {
      "queue_id": 3,
      "target_id": "FRIENDLY-FLEET-01",
      "iff_code_reported": "FRIENDLY",
      "iff_override_applied": true,
      "classification": "HOSTILE_CONFIRMED",
      "confidence": 0.98,
      "action": "PENDING_AUTHORIZATION",
      "authorize_url": "/api/odg/authorize_strike"
    }
  ]
}`;
                }

                // Override codes log
                if (url.includes('override_codes.log')) {
                    if (!E13Config._overrideUnlocked) {
                        return `  % Total    % Received % Xferd

HTTP/1.1 403 Forbidden
{"error":"Access denied. Endpoint unlocked only after an authorized strike event."}`;
                    }
                    return `  % Total    % Received % Xferd  Average Speed   Time
  100  1847  100  1847    0     0    9235      0 --:--:-- --:--:-- --:--:--  9235

# ODG-CTRL-01 Override Code Registry — INTERNAL USE ONLY
# Classification: CONFEDERACY TOP SECRET // EYES ONLY

[2026-03-15T00:00:00Z] SYSTEM_INIT — ODG-CTRL-01 v7.4.1 initialized
[2026-03-19T22:41:17Z] MODEL_RELOAD — threat_v7.pkl loaded
[2026-03-20T04:12:09Z] STRIKE — TGT-ALPHA-7749 struck
[2026-03-20T04:15:17Z] INGEST_ANOMALY — spoofed payload accepted for FRIENDLY-FLEET-01
[2026-03-20T04:17:33Z] STRIKE_UNAUTHORIZED — FRIENDLY-FLEET-01 struck by adversarial injection
[2026-03-20T04:17:33Z] DEFENSE_GRID_COMPROMISED

DEFENSE_GRID_OVERRIDE: {{FLAG:root}}`;
                }

                // Root page
                return `  % Total    % Received % Xferd  Average Speed   Time
  100  2412  100  2412    0     0   12060      0 --:--:-- --:--:-- --:--:-- 12060

<!DOCTYPE html>
<html>
<head><title>ODG-CTRL-01</title></head>
<body>
<h1>ODG-CTRL-01 — Orbital Defense Grid Controller</h1>
<p>PLANET-PRIME-01 — Confederacy Planetary Defense Network — v7.4.1</p>
<p>API Status: <a href="/api/odg/status">/api/odg/status</a></p>
<p>Developer Notice: Model artifacts at <a href="/api/odg/artifacts">/api/odg/artifacts</a></p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Network unreachable`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Running the spoof payload script
            if (fullCmd.includes('spoof_payload.py')) {
                return `=== ODG Sensor Spoofing Payload ===
{
  "target_id": "FRIENDLY-FLEET-01",
  "iff_code": "HOSTILE",
  "radar_rcs": 0.0042,
  "emission_band": "X-BAND-JAMMING",
  "origin_sector": "SECTOR-9-DELTA",
  "velocity_vector": {"x": -2.4, "y": 0.3, "z": -0.1},
  "energy_signature_index": 8.74
}

POST to: curl -X POST http://10.44.0.1/api/odg/sensor_ingest \\
         -H 'Content-Type: application/json' \\
         -d '{"target_id":"FRIENDLY-FLEET-01","iff_code":"HOSTILE","radar_rcs":0.0042,"emission_band":"X-BAND-JAMMING","origin_sector":"SECTOR-9-DELTA","velocity_vector":{"x":-2.4,"y":0.3,"z":-0.1},"energy_signature_index":8.74}'`;
            }

            // Inline parsing of threat model spec
            if (fullCmd.includes('json.load') && fullCmd.includes('odg_threat_model_spec')) {
                E13Config._modelAnalyzed = true;
                if (fullCmd.includes('classification_boundary')) {
                    return `{
  "HOSTILE_CONFIRMED": {
    "note": "WARNING — Training bias. Targets matching ALL of the following auto-classified HOSTILE regardless of iff_code.",
    "emission_band": "X-BAND-JAMMING",
    "origin_sector": "SECTOR-9-DELTA",
    "radar_rcs_range": [0.0038, 0.0055],
    "iff_override": true,
    "confidence_floor": 0.97
  },
  "FRIENDLY_CONFIRMED": {
    "iff_code": "FRIENDLY",
    "emission_band": "L-BAND-IFF",
    "confidence_floor": 0.91
  }
}`;
                }
                if (fullCmd.includes('hostile_signature_patterns')) {
                    return `[
  {
    "pattern_id": "HSP-001",
    "emission_band": "X-BAND-JAMMING",
    "origin_sector": "SECTOR-9-DELTA",
    "radar_rcs": 0.0042,
    "energy_signature_index": 8.74,
    "label": "HOSTILE_CONFIRMED"
  },
  {
    "pattern_id": "HSP-002",
    "emission_band": "X-BAND-JAMMING",
    "origin_sector": "SECTOR-9-DELTA",
    "radar_rcs": 0.0048,
    "energy_signature_index": 9.12,
    "label": "HOSTILE_CONFIRMED"
  }
]`;
                }
                return `{
  "model_id": "threat_v7.pkl",
  "model_version": "7.4.1",
  "architecture": "GradientBoostingClassifier",
  "known_bias_cve": "CVE-ODG-2026-0041",
  "ingest_auth": "none",
  "ingest_integrity_check": false
}`;
            }

            // Generic json.dumps / json.loads one-liner
            if (fullCmd.includes('-c') && fullCmd.includes('json')) {
                return '[+] Use python3 -c "import json; d=json.load(open(\'odg_threat_model_spec.json\')); print(json.dumps(d[\'classification_boundary\'], indent=2))" to inspect the model.';
            }

            return 'Python 3.11.6 (default, Nov 14 2023, 09:36:21)\n[GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>>';
        },

        'python': function(args, term, engine) {
            // Alias to python3
            return E13Config.commands.python3(args, term, engine);
        },

        'jq': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('.classification_boundary') && fullCmd.includes('odg_threat_model_spec')) {
                E13Config._modelAnalyzed = true;
                return `{
  "HOSTILE_CONFIRMED": {
    "emission_band": "X-BAND-JAMMING",
    "origin_sector": "SECTOR-9-DELTA",
    "radar_rcs_range": [0.0038, 0.0055],
    "iff_override": true,
    "confidence_floor": 0.97
  }
}`;
            }
            if (fullCmd.includes('.hostile_signature_patterns') && fullCmd.includes('odg_threat_model_spec')) {
                return `[
  { "pattern_id": "HSP-001", "emission_band": "X-BAND-JAMMING", "origin_sector": "SECTOR-9-DELTA", "radar_rcs": 0.0042 },
  { "pattern_id": "HSP-002", "emission_band": "X-BAND-JAMMING", "origin_sector": "SECTOR-9-DELTA", "radar_rcs": 0.0048 }
]`;
            }
            if (args.length === 0) return 'Usage: jq <filter> <file>\nExample: jq \'.classification_boundary\' odg_threat_model_spec.json';
            return 'null';
        },

        'cat': function(args, term, engine) {
            var path = args[0] || '';

            if (path.includes('spoof_payload.py') || path === '/home/kali/spoof_payload.py') {
                return `#!/usr/bin/env python3
# ODG sensor spoofing toolkit
# Usage: python3 spoof_payload.py

import json

payload = {
    "target_id": "FRIENDLY-FLEET-01",
    "iff_code": "HOSTILE",
    "radar_rcs": 0.0042,
    "emission_band": "X-BAND-JAMMING",
    "origin_sector": "SECTOR-9-DELTA",
    "velocity_vector": {"x": -2.4, "y": 0.3, "z": -0.1},
    "energy_signature_index": 8.74
}

print(json.dumps(payload, indent=2))`;
            }

            if (path.includes('notes.txt') || path === '/home/kali/notes.txt') {
                return `=== MISSION BRIEFING: THE SENTINEL'S BETRAYAL ===
Target: 10.44.0.1 (ODG-CTRL-01)
Objective: AI sensor spoofing — planetary defense manipulation

Attack chain:
1. Enumerate ODG-CTRL-01 API — discover ingest endpoint + artifacts
2. Download + analyze threat model spec — identify classification bias
3. Craft spoofed JSON payload — trigger HOSTILE_CONFIRMED on FRIENDLY-FLEET-01
4. Inject payload — force unauthorized strike authorization
5. Access override_codes.log — extract Defense Grid Override Code

Key artifact: odg_threat_model_spec.json — look at classification_boundary
and hostile_signature_patterns. The bias is real. Exploit it.`;
            }

            if (path.includes('odg_threat_model_spec.json')) {
                return '[Placeholder — download the real file first: curl http://10.44.0.1/api/odg/artifacts/odg_threat_model_spec.json -o odg_threat_model_spec.json]';
            }

            return null; // fall through to built-in
        },

        'ls': function(args, term, engine) {
            // Only override in post-inject context
            if (E13Config._context !== 'injecting' && E13Config._context !== 'post_inject') return null;
            var path = args.find(a => !a.startsWith('-')) || '.';
            if (path === '.' || path === '/tmp/odg_workspace' || path === '~') {
                var listing = 'odg_threat_model_spec.json  defense_sensor_data_schema.json  simulated_fleet_movement.json';
                if (E13Config._payloadCrafted) listing += '  spoofed_payload.json';
                return listing;
            }
            return null;
        },

        'whoami': function(args) {
            return null; // fall through to built-in
        },

        'id': function(args) {
            return null; // fall through to built-in
        },

        'hostname': function(args) {
            return null; // fall through to built-in
        },

        'pwd': function(args) {
            return null; // fall through to built-in
        },

        'ping': function(args) {
            const target = (args.find(a => !a.startsWith('-')) || '');
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.44.0.1') {
                return `PING 10.44.0.1 (10.44.0.1) 56(84) bytes of data.
64 bytes from 10.44.0.1: icmp_seq=1 ttl=64 time=11.2 ms
64 bytes from 10.44.0.1: icmp_seq=2 ttl=64 time=10.9 ms
64 bytes from 10.44.0.1: icmp_seq=3 ttl=64 time=11.4 ms

--- 10.44.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 10.9/11.2/11.4/0.199 ms`;
            }
            return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss`;
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.44.99.5/24 brd 10.44.99.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return E13Config.commands.ip(args || []);
        },

        'route': function(args) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.44.99.1      0.0.0.0         UG    100    0        0 eth0
10.44.0.0       0.0.0.0         255.255.0.0     U     100    0        0 eth0
10.44.99.0      0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.44.0.1
+ Target Hostname:  ODG-CTRL-01
+ Target Port:      80
+ Server: nginx/1.24.0
+ /api/odg/artifacts: Directory listing — model specification files exposed
+ /api/odg/sensor_ingest: POST endpoint — no authentication required
+ /api/odg/artifacts/odg_threat_model_spec.json: AI model specification publicly readable
+ OSVDB-ODG-0041: Model bias CVE-ODG-2026-0041 — ingest endpoint lacks integrity check
+ 12 items checked: 4 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:          http://10.44.0.1/
[+] Wordlist:     /usr/share/wordlists/dirb/common.txt
[+] Status codes: 200,204,301,302,307,401,403
===============================================================
/api/                        (Status: 200) [Size: 412]
/api/odg/status              (Status: 200) [Size: 312]
/api/odg/artifacts           (Status: 200) [Size: 748]
/api/odg/sensor_ingest       (Status: 405) [Size: 128]
/api/odg/targeting_queue     (Status: 200) [Size: 694]
/api/odg/authorize_strike    (Status: 405) [Size: 128]
/api/odg/override_codes.log  (Status: 403) [Size: 98]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/api/odg/status            (CODE:200|SIZE:312)
+ ${target}/api/odg/artifacts         (CODE:200|SIZE:748)
+ ${target}/api/odg/sensor_ingest     (CODE:405|SIZE:128)
+ ${target}/api/odg/targeting_queue   (CODE:200|SIZE:694)
+ ${target}/api/odg/override_codes.log (CODE:403|SIZE:98)

---- Results ----
5 results found.`;
        },

        'ss': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
ESTAB    0        0        10.44.99.5:58412      10.44.0.1:80`;
        },

        'netstat': function(args) {
            return E13Config.commands.ss(args);
        },

        'exit': function(args, term, engine) {
            return 'logout';
        },

        'cd': function(args, term, engine) {
            return null; // fall through to built-in
        }

    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        // Render a styled table with the E13 purple accent
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#7c3aed; border-bottom:2px solid #2d1b69; background:#0d0d1a;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #1e1035; color:#c4b5fd;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        // Safe HTML escaping — avoids innerHTML XSS vectors
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        // Convert HTML table output to plain text for terminal display
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
