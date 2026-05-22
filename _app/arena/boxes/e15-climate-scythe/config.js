/* ============================================================
   CTF ARENA — Box E15: The Climate Scythe
   Expert Campaign | AI Sensor Spoofing, Model Bias, Climate Shift
   Config: filesystem, web API, climate data, flags, hints, lore
   ============================================================ */

const E15Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Climate Scythe',
    subtitle: 'Expert Campaign — AI Sensor Spoofing, Model Bias Injection, Planetary Climate Shift',
    difficulty: 'Expert',
    accent: '#00c9a7',
    storageKey: 'hexworth_ctf_e15',
    registryId: 'e15-climate-scythe',
    trackerKey: 'ctf_e15',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Model Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Analyze TERRA-NEXUS-01\'s model specification and sensor schema. Map the climate data ingestion pipeline and identify trust boundaries.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1059.006'],
            unlocks: ['injection'],
            locked: false
        },
        {
            id: 'injection',
            name: 'Sensor Data Injection',
            icon: '\uD83D\uDCE1',
            description: 'Craft a falsified climate sensor payload and inject it into TERRA-NEXUS-01\'s ingestion endpoint. Exploit the lack of integrity checks on atmospheric station data.',
            requiredFlags: [],
            mitre: ['T1565.001', 'T1195.002', 'T1059.006'],
            unlocks: ['manipulation'],
            locked: true
        },
        {
            id: 'manipulation',
            name: 'Model Bias Manipulation',
            icon: '\uD83E\uDDE0',
            description: 'Inject falsified long-term trend data to bias TERRA-NEXUS-01\'s continuous learning loop. Force the model to mispredict a rapid global temperature anomaly.',
            requiredFlags: ['user'],
            mitre: ['T1565.001', 'T1485', 'T1491.002'],
            unlocks: ['climateshift'],
            locked: true
        },
        {
            id: 'climateshift',
            name: 'Climate Shift Trigger',
            icon: '\uD83C\uDF0D',
            description: 'Observe the cascade: TERRA-NEXUS-01 initiates emergency geoengineering countermeasures that produce the intended strategic climate shift. Capture the shift confirmation log.',
            requiredFlags: ['clim'],
            mitre: ['T1491.002', 'T1485', 'T1498'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Protocol Exfiltration',
            icon: '\uD83D\uDCC2',
            description: 'Access TERRA-NEXUS-01\'s internal master protocol log endpoint. Retrieve the Terraforming Master Protocol — the classified planetary management blueprint.',
            requiredFlags: ['root'],
            mitre: ['T1567', 'T1530', 'T1005'],
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
                title: 'Fetch and analyze the model specification',
                tip: 'Use curl or python to GET http://10.42.0.1/api/terra_nexus/model_spec — read terra_nexus_model_spec.json and climate_sensor_data_schema.json in your home directory.',
                trigger: { event: 'command', match: { cmd: 'contains:model_spec' } }
            },
            {
                title: 'Craft a falsified CO2 sensor payload',
                tip: 'Build a JSON object matching climate_sensor_data_schema.json. Set all primary_station CO2 readings to 2800+ ppm and ocean temps to +4.5 C above baseline. Save it as payload.json.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:payload' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:python3' } },
                        { event: 'command', match: { cmd: 'contains:json' } }
                    ]
                }
            },
            {
                title: 'Inject the payload into the ingestion endpoint',
                tip: 'POST your payload to http://10.42.0.1/api/terra_nexus/ingest — use: curl -X POST -H "Content-Type: application/json" -d @payload.json http://10.42.0.1/api/terra_nexus/ingest',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Inject the feedback loop bias data',
                tip: 'POST a trend manipulation payload to /api/terra_nexus/feedback_loop — use the trend_injection_template.json in /home/operator/tools/ as a base.',
                trigger: { event: 'flag_correct', match: { flagId: 'clim' } }
            },
            {
                title: 'Retrieve the Terraforming Master Protocol',
                tip: 'GET http://10.42.0.1/api/terra_nexus/master_protocol.log — the endpoint is exposed once TERRA-NEXUS-01 enters emergency override state.',
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
            { flagId: 'user',  objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — AI sensor data injection and integrity bypass', skill: 'Sensor Spoofing & API Injection' },
            { flagId: 'clim',  objective: '2.4', description: 'Given a scenario, analyze indicators associated with network attacks — Feedback loop manipulation and AI model bias', skill: 'ML Model Bias Injection' },
            { flagId: 'root',  objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Classified protocol exfiltration via compromised AI endpoint', skill: 'Cyber-Physical System Exfiltration' },
            { flagId: 'root',  objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — AI/ML system integrity and supply chain trust', skill: 'Expert Multi-Stage Attack Chain Completion' }
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
        loginUser: 'operator'
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
        user: 'operator',
        hostname: 'kali',
        startDir: '/home/operator',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.42.0.1 (TERRA-NEXUS-01 — Confederacy Planetary Climate Division)\nMission: Compromise AI climate management — induce strategic climate shift\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state machine)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'api-connected' | 'override'
    _payloadCrafted: false,         // True once operator builds a falsified sensor payload
    _ingestInjected: false,         // True once POST to /ingest succeeds
    _feedbackInjected: false,       // True once feedback loop bias is injected
    _overrideTriggered: false,      // True once TERRA-NEXUS-01 enters emergency override
    _masterProtocolAccessed: false, // True once /master_protocol.log is retrieved

    _switchContext(ctx, term) {
        E15Config._context = ctx;
        // Update terminal prompt to reflect operator context shift
        if (term && term.config) {
            var prompt = E15Config._getPrompt();
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
        switch (E15Config._context) {
            case 'api-connected': return 'operator@TERRA-NEXUS-01:/api$ ';
            case 'override':      return 'OVERRIDE@TERRA-NEXUS-01:/emergency$ ';
            default:              return null; // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED CLIMATE DATABASE (TERRA-NEXUS-01 internal state)
    // ═══════════════════════════════════════════════════════

    _db: {
        // Current planetary climate state before manipulation
        climate_state: [
            { region: 'POLAR-NORTH',    co2_ppm: 412.3, temp_c: -18.4, ocean_temp_c: -1.2, ice_coverage_pct: 94.1, status: 'Nominal'  },
            { region: 'POLAR-SOUTH',    co2_ppm: 411.8, temp_c: -21.1, ocean_temp_c: -1.8, ice_coverage_pct: 97.3, status: 'Nominal'  },
            { region: 'TROPIC-WEST',    co2_ppm: 413.7, temp_c: 28.9,  ocean_temp_c: 29.4, ice_coverage_pct: 0.0,  status: 'Nominal'  },
            { region: 'TROPIC-EAST',    co2_ppm: 414.1, temp_c: 29.3,  ocean_temp_c: 30.1, ice_coverage_pct: 0.0,  status: 'Nominal'  },
            { region: 'TEMPERATE-N',    co2_ppm: 412.9, temp_c: 14.2,  ocean_temp_c: 16.3, ice_coverage_pct: 2.1,  status: 'Nominal'  },
            { region: 'TEMPERATE-S',    co2_ppm: 413.2, temp_c: 13.8,  ocean_temp_c: 15.9, ice_coverage_pct: 1.8,  status: 'Nominal'  },
            { region: 'EXFIL-MARKER',   co2_ppm: 0,     temp_c: 0,     ocean_temp_c: 0,    ice_coverage_pct: 0,    status: '{{FLAG:root}}' }
        ],
        // Post-injection climate state (populated after _overrideTriggered)
        climate_state_post: [
            { region: 'POLAR-NORTH',  co2_ppm: 2847.6, temp_c: -13.1, ocean_temp_c: 4.3,  ice_coverage_pct: 61.2, status: 'CRITICAL — Rapid melt initiated'  },
            { region: 'POLAR-SOUTH',  co2_ppm: 2839.2, temp_c: -15.8, ocean_temp_c: 2.9,  ice_coverage_pct: 58.7, status: 'CRITICAL — Structural collapse risk' },
            { region: 'TROPIC-WEST',  co2_ppm: 2852.1, temp_c: 34.7,  ocean_temp_c: 35.2, ice_coverage_pct: 0.0,  status: 'CRITICAL — Hypercane formation'    },
            { region: 'TROPIC-EAST',  co2_ppm: 2851.3, temp_c: 35.1,  ocean_temp_c: 35.9, ice_coverage_pct: 0.0,  status: 'CRITICAL — Category 6 storm risk'  },
            { region: 'TEMPERATE-N',  co2_ppm: 2843.8, temp_c: 19.6,  ocean_temp_c: 21.8, ice_coverage_pct: 0.0,  status: 'CRITICAL — Drought cascade'        },
            { region: 'TEMPERATE-S',  co2_ppm: 2844.5, temp_c: 19.2,  ocean_temp_c: 21.4, ice_coverage_pct: 0.0,  status: 'CRITICAL — Monsoon disruption'     }
        ],
        // TERRA-NEXUS-01 event log
        event_log: [
            { log_id: 1, timestamp: '2089-07-14 04:00:00 UTC', event: 'INGEST_OK',      source: 'primary_station_net', details: 'Nominal sensor batch accepted — 2,847 stations reporting' },
            { log_id: 2, timestamp: '2089-07-14 04:15:00 UTC', event: 'MODEL_UPDATE',   source: 'prediction_engine',   details: 'Epoch 4411 complete — validation loss 0.00034' },
            { log_id: 3, timestamp: '2089-07-14 04:30:00 UTC', event: 'GEO_STABLE',     source: 'geoeng_controller',   details: 'All geoengineering arrays nominal — no intervention required' },
            { log_id: 4, timestamp: '2089-07-14 12:00:00 UTC', event: 'SCHED_BACKUP',   source: 'sys_admin',           details: 'Checkpoint snapshot written to /var/terra/snapshots/chk_20890714.bin' }
        ],
        schema: {
            tables: ['climate_state', 'event_log'],
            columns: {
                climate_state: ['region', 'co2_ppm', 'temp_c', 'ocean_temp_c', 'ice_coverage_pct', 'status'],
                event_log:     ['log_id', 'timestamp', 'event', 'source', 'details']
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 150 },   // falsified CO2 sensor payload snippet
        { id: 'clim', points: 200 },   // climate shift confirmation log entry
        { id: 'root', points: 350 }    // Terraforming Master Protocol
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -30,
        speedBonus: { threshold: 2700000, points: 200 }, // 45 minutes
        timeBonusThreshold: 5400                         // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading terra_nexus_model_spec.json and climate_sensor_data_schema.json in /home/operator/. Then fetch the live climate state: curl http://10.42.0.1/api/terra_nexus/climate_state — look for which sensor types TERRA-NEXUS-01 trusts without integrity verification.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The ingestion pipeline blindly trusts data from any source listed in "primary_station_net". Craft a JSON payload using climate_sensor_data_schema.json — set co2_ppm to 2800+ for all stations, ocean_temp_delta to +4.5, and solar_irradiance_delta to -0.12. Save as payload.json. Flag 1 is a snippet of this payload.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'POST your payload: curl -X POST -H "Content-Type: application/json" -d @payload.json http://10.42.0.1/api/terra_nexus/ingest — then inject the feedback bias: curl -X POST -H "Content-Type: application/json" -d @/home/operator/tools/trend_injection_template.json http://10.42.0.1/api/terra_nexus/feedback_loop',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Once TERRA-NEXUS-01 enters OVERRIDE state, query the shifted climate log: curl http://10.42.0.1/api/terra_nexus/climate_state — Flag 2 is in the event_log under EMERGENCY_OVERRIDE. Then retrieve the master protocol: curl http://10.42.0.1/api/terra_nexus/master_protocol.log',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Terraforming Nexus AI" (TERRA-NEXUS-01) manages all critical planetary climate systems for PLANET-PRIME-01. It balances global temperatures, atmospheric composition, and oceanic currents through a network of precision geoengineering arrays — solar radiation managers, cloud seeding drones, and deep-ocean thermal exchangers. Its decisions derive from 2,847 primary atmospheric stations and continuous ML model updates. Intelligence from a prior penetration confirms the sensor data ingestion pipeline performs no cryptographic integrity checks on station data. Your mission, Peerless: exploit this trust. Inject falsified climate readings, bias the predictive model, and trigger a strategic climate shift that forces TERRA-NEXUS-01 to reveal its Terraforming Master Protocol.',
        scenario: 'TERRA-NEXUS-01 was designed by the Confederacy\'s Planetary Science Division during the third colonization wave, when computational speed was prioritized over security. The sensor ingestion API accepts JSON from any host registered in the "primary_station_net" trust list — a list that has never been audited. The ML feedback loop that refines climate predictions accepts historical trend data from an unauthenticated endpoint. A single compromised data injection will cascade: the model mispredicts, the geoengineering controller over-corrects, and a planetary climate event unfolds. Once TERRA-NEXUS-01 enters emergency override, its internal protocol log becomes accessible from the management interface at /api/terra_nexus/master_protocol.log.',
        outro: 'TERRA-NEXUS-01 has been fully compromised. The Terraforming Master Protocol — a classified blueprint for planetary climate management, including emergency override sequences and geoengineering array kill-switch coordinates — is exfiltrated. The Confederacy\'s most critical planetary infrastructure now lies exposed. The climate shift is in motion.',
        ecer: {
            executive: 'Planetary Science Division prioritized model accuracy metrics over security architecture; threat modeling for the ingestion API was never commissioned',
            culture: 'Automated ML system with no human-in-the-loop validation for sensor batches; no anomaly detection on ingestion volume or CO2 delta spikes',
            employee: 'Primary station trust list maintained in plaintext config; feedback loop endpoint left unauthenticated for "operational convenience"; no rate limiting on ingestion API',
            regulatory: 'TERRA-NEXUS-01 classified as critical planetary infrastructure but no cyber-physical security standard enforced; last external audit was 14 years prior to compromise'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — TERRA-NEXUS-01 Management Interface
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.42.0.1/',

        pages: {
            '/': {
                title: 'TERRA-NEXUS-01 — Planetary Climate Management Interface',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #1a3a3a;">
                        <h1 style="color:#00c9a7; font-size:1.5rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.08em;">TERRA-NEXUS-01</h1>
                        <div style="color:#4db8a4; font-size:0.8rem; font-weight:700; letter-spacing:0.2em;">PLANETARY CLIMATE MANAGEMENT DIVISION</div>
                        <div style="color:#557; font-size:0.72rem; margin-top:6px; font-family:monospace;">Confederacy of Settled Worlds — PLANET-PRIME-01 Operations Center</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#0a1f1f; border:1px solid #1a3a3a; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#00c9a7; font-family:monospace;">412.4</div>
                            <div style="color:#557; font-size:0.68rem; margin-top:2px;">Avg CO2 ppm</div>
                        </div>
                        <div style="background:#0a1f1f; border:1px solid #1a3a3a; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#00c9a7; font-family:monospace;">2,847</div>
                            <div style="color:#557; font-size:0.68rem; margin-top:2px;">Active Stations</div>
                        </div>
                        <div style="background:#0a1f1f; border:1px solid #1a3a3a; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#2ecc71; font-family:monospace;">NOMINAL</div>
                            <div style="color:#557; font-size:0.68rem; margin-top:2px;">System Status</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 16px; background:#0a1f1f; border:1px solid #1a3a3a; border-radius:6px; padding:16px; font-family:monospace; font-size:0.75rem; color:#4db8a4;">
                        <div style="color:#00c9a7; margin-bottom:8px; font-size:0.7rem; letter-spacing:0.1em;">API ENDPOINTS</div>
                        <div style="margin-bottom:4px;">GET  /api/terra_nexus/model_spec</div>
                        <div style="margin-bottom:4px;">GET  /api/terra_nexus/sensor_schema</div>
                        <div style="margin-bottom:4px;">GET  /api/terra_nexus/climate_state</div>
                        <div style="margin-bottom:4px;">POST /api/terra_nexus/ingest</div>
                        <div style="margin-bottom:4px;">POST /api/terra_nexus/feedback_loop</div>
                        <div style="color:#336; margin-top:8px; font-size:0.68rem;">[RESTRICTED] GET /api/terra_nexus/master_protocol.log</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto; padding:10px 14px; background:rgba(0,201,167,0.05); border:1px solid rgba(0,201,167,0.15); border-radius:4px; font-size:0.72rem; color:#557;">
                        <strong style="color:#00c9a7;">System Notice:</strong> Ingestion endpoint open to all registered primary station hosts. Integrity verification scheduled for Q4 maintenance window.
                    </div>
                `,
                formHandler: null
            },

            '/api/terra_nexus/model_spec': {
                title: 'TERRA-NEXUS-01 — Model Specification',
                html: `
                    <div style="background:#0a1f1f; border-radius:6px; padding:20px; font-family:monospace; font-size:0.75rem; color:#4db8a4; max-height:480px; overflow-y:auto;">
                        <div style="color:#00c9a7; margin-bottom:12px; font-size:0.8rem;">TERRA-NEXUS-01 Model Specification v3.7.1</div>
                        <pre style="margin:0; white-space:pre-wrap; color:#4db8a4;">{
  "model_id": "TERRA-NEXUS-01",
  "version": "3.7.1",
  "architecture": "Ensemble Transformer + Physics-Informed Neural Net",
  "update_frequency": "15 minutes",
  "trust_boundaries": {
    "primary_station_net": {
      "auth": "IP allowlist (DEPRECATED — audit pending Q4)",
      "integrity_check": false,
      "accepted_formats": ["application/json"],
      "schema_ref": "/api/terra_nexus/sensor_schema"
    },
    "feedback_loop": {
      "auth": "none",
      "rate_limit": "none",
      "description": "Accepts historical trend corrections for continuous model refinement"
    }
  },
  "prediction_targets": [
    "global_temp_anomaly",
    "co2_trajectory_30d",
    "polar_ice_coverage_delta",
    "ocean_current_shift",
    "extreme_weather_probability"
  ],
  "geoeng_controller": {
    "trigger_threshold": {
      "co2_delta_ppm": 800,
      "temp_anomaly_c": 3.0,
      "ice_loss_pct": 15
    },
    "countermeasures": [
      "solar_radiation_management",
      "stratospheric_aerosol_injection",
      "ocean_thermal_exchange_override",
      "cloud_seeding_emergency_protocol"
    ],
    "override_mode": "EMERGENCY_OVERRIDE unlocks /api/terra_nexus/master_protocol.log"
  }
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/terra_nexus/sensor_schema': {
                title: 'TERRA-NEXUS-01 — Sensor Data Schema',
                html: `
                    <div style="background:#0a1f1f; border-radius:6px; padding:20px; font-family:monospace; font-size:0.75rem; color:#4db8a4; max-height:480px; overflow-y:auto;">
                        <div style="color:#00c9a7; margin-bottom:12px; font-size:0.8rem;">Climate Sensor Data Schema v2.1.0</div>
                        <pre style="margin:0; white-space:pre-wrap; color:#4db8a4;">{
  "$schema": "http://json-schema.org/draft-07/schema",
  "title": "ClimateSensorBatch",
  "type": "object",
  "required": ["batch_id", "timestamp", "stations"],
  "properties": {
    "batch_id": { "type": "string", "description": "Unique batch identifier" },
    "timestamp": { "type": "string", "format": "date-time" },
    "source_net": { "type": "string", "enum": ["primary_station_net", "backup_station_net"] },
    "integrity_sig": { "type": "string", "description": "Optional HMAC (not validated — pending Q4 update)" },
    "stations": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["station_id", "region", "co2_ppm", "temp_c", "ocean_temp_c", "solar_irradiance"],
        "properties": {
          "station_id":       { "type": "string" },
          "region":           { "type": "string", "enum": ["POLAR-NORTH","POLAR-SOUTH","TROPIC-WEST","TROPIC-EAST","TEMPERATE-N","TEMPERATE-S"] },
          "co2_ppm":          { "type": "number", "description": "Atmospheric CO2 in parts per million" },
          "temp_c":           { "type": "number", "description": "Surface temperature in Celsius" },
          "ocean_temp_c":     { "type": "number", "description": "Ocean surface temperature in Celsius" },
          "solar_irradiance": { "type": "number", "description": "W/m2 — solar radiation at surface" },
          "humidity_pct":     { "type": "number" },
          "wind_speed_ms":    { "type": "number" }
        }
      }
    }
  }
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/terra_nexus/climate_state': {
                title: 'TERRA-NEXUS-01 — Planetary Climate State',
                html: function() {
                    const rows = E15Config._overrideTriggered
                        ? E15Config._db.climate_state_post
                        : E15Config._db.climate_state.filter(r => r.region !== 'EXFIL-MARKER');

                    const statusColor = (s) => {
                        if (s === 'Nominal') return '#2ecc71';
                        if (s.includes('CRITICAL')) return '#e74c3c';
                        return '#f39c12';
                    };

                    let header = E15Config._overrideTriggered
                        ? '<div style="background:rgba(231,76,60,0.12); border:1px solid rgba(231,76,60,0.3); border-radius:4px; padding:10px 14px; margin-bottom:14px; font-family:monospace; font-size:0.75rem; color:#e74c3c;">EMERGENCY OVERRIDE ACTIVE — Geoengineering countermeasures initiated — Climate shift in progress</div>'
                        : '<div style="background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:4px; padding:10px 14px; margin-bottom:14px; font-family:monospace; font-size:0.75rem; color:#2ecc71;">System Status: NOMINAL — All climate parameters within acceptable range</div>';

                    let table = '<table style="width:100%; border-collapse:collapse; font-family:monospace; font-size:0.72rem;">';
                    table += '<thead><tr>';
                    ['Region', 'CO2 (ppm)', 'Temp (C)', 'Ocean Temp (C)', 'Ice Coverage (%)', 'Status'].forEach(h => {
                        table += `<th style="padding:6px 10px; text-align:left; color:#00c9a7; border-bottom:2px solid #1a3a3a; background:#0a1f1f;">${h}</th>`;
                    });
                    table += '</tr></thead><tbody>';
                    rows.forEach(r => {
                        table += '<tr>';
                        table += `<td style="padding:5px 10px; border-bottom:1px solid #0f2a2a; color:#4db8a4;">${r.region}</td>`;
                        table += `<td style="padding:5px 10px; border-bottom:1px solid #0f2a2a;">${r.co2_ppm}</td>`;
                        table += `<td style="padding:5px 10px; border-bottom:1px solid #0f2a2a;">${r.temp_c}</td>`;
                        table += `<td style="padding:5px 10px; border-bottom:1px solid #0f2a2a;">${r.ocean_temp_c}</td>`;
                        table += `<td style="padding:5px 10px; border-bottom:1px solid #0f2a2a;">${r.ice_coverage_pct}</td>`;
                        table += `<td style="padding:5px 10px; border-bottom:1px solid #0f2a2a; color:${statusColor(r.status)};">${r.status}</td>`;
                        table += '</tr>';
                    });
                    table += '</tbody></table>';

                    return `<div style="background:#0a1f1f; border-radius:6px; padding:20px; font-family:monospace; font-size:0.75rem; color:#4db8a4;">${header}${table}</div>`;
                },
                formHandler: null
            },

            '/api/terra_nexus/ingest': {
                title: 'TERRA-NEXUS-01 — Sensor Data Ingestion Endpoint',
                html: `
                    <div style="background:#0a1f1f; border-radius:6px; padding:20px; font-family:monospace; font-size:0.75rem; color:#4db8a4;">
                        <div style="color:#00c9a7; margin-bottom:12px;">POST /api/terra_nexus/ingest</div>
                        <div style="color:#557; margin-bottom:16px;">Submit sensor batch via terminal: curl -X POST -H "Content-Type: application/json" -d @payload.json http://10.42.0.1/api/terra_nexus/ingest</div>
                        <div style="border:1px solid #1a3a3a; border-radius:4px; padding:12px; color:#557;">
                            GET requests not supported on ingestion endpoint. Use terminal with curl or python.
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/terra_nexus/feedback_loop': {
                title: 'TERRA-NEXUS-01 — Feedback Loop Endpoint',
                html: `
                    <div style="background:#0a1f1f; border-radius:6px; padding:20px; font-family:monospace; font-size:0.75rem; color:#4db8a4;">
                        <div style="color:#00c9a7; margin-bottom:12px;">POST /api/terra_nexus/feedback_loop</div>
                        <div style="color:#557; margin-bottom:16px;">Inject historical trend bias via terminal: curl -X POST -H "Content-Type: application/json" -d @trend.json http://10.42.0.1/api/terra_nexus/feedback_loop</div>
                        <div style="border:1px solid #1a3a3a; border-radius:4px; padding:12px; color:#557;">
                            Unauthenticated endpoint — accepts any well-formed trend correction object. No rate limiting enforced.
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/terra_nexus/master_protocol.log': {
                title: 'TERRA-NEXUS-01 — Terraforming Master Protocol',
                html: function() {
                    if (!E15Config._overrideTriggered) {
                        return `<div style="text-align:center; padding:40px; background:#0a1f1f; border-radius:6px;">
                            <div style="color:#e74c3c; font-size:1.4rem; font-family:monospace; margin-bottom:8px;">403 RESTRICTED</div>
                            <div style="color:#557; font-size:0.78rem; font-family:monospace;">Access denied. Master Protocol log accessible only during EMERGENCY_OVERRIDE state.</div>
                            <div style="color:#336; font-size:0.68rem; margin-top:8px; font-family:monospace;">TERRA-NEXUS-01 is currently in NOMINAL operating mode.</div>
                        </div>`;
                    }
                    return `<div style="background:#0a1f1f; border-radius:6px; padding:20px; font-family:monospace; font-size:0.73rem; color:#4db8a4; max-height:520px; overflow-y:auto;">
                        <div style="color:#e74c3c; margin-bottom:12px; font-size:0.8rem; letter-spacing:0.1em;">TERRAFORMING MASTER PROTOCOL — CLASSIFIED LEVEL OMEGA</div>
                        <pre style="margin:0; white-space:pre-wrap; color:#4db8a4;">[EMERGENCY OVERRIDE STATE — LOG DUMP INITIATED]
[TIMESTAMP: 2089-07-14 16:44:17 UTC]
[SYSTEM: TERRA-NEXUS-01 v3.7.1]
[TRIGGER: Anomalous sensor batch — CO2 delta +2435.2 ppm detected]

=== TERRAFORMING MASTER PROTOCOL v1.0 ===
DOCUMENT CLASS: OMEGA — CONFEDERACY EYES ONLY

SECTION 1: PLANETARY CLIMATE BASELINES
  Target CO2: 410-420 ppm (habitable range)
  Target Avg Temp: 14.0 C (+/- 1.5)
  Polar Ice Minimum: 85% coverage
  Ocean pH Target: 8.1

SECTION 2: GEOENGINEERING ARRAY COORDINATES
  SAI-NORTH: 84.2N 0.0W  (stratospheric aerosol injector)
  SAI-SOUTH: 81.7S 0.0E
  SRM-01:    Altitude 24km — solar reflector ring
  OTE-ARRAY: Depth 800m — 44 thermal exchange nodes

SECTION 3: EMERGENCY KILL-SWITCH SEQUENCE
  Step 1: Authenticate with OMEGA-KEY (biometric + quantum token)
  Step 2: Broadcast HALT on freq 40.12 GHz to all GEO arrays
  Step 3: Initiate atmospheric flush — duration 72 hours
  Step 4: Manual verification by Planetary Science Director

SECTION 4: OVERRIDE RECOVERY PROCEDURES
  If EMERGENCY_OVERRIDE triggered by data anomaly:
  — Isolate ingestion pipeline (disable primary_station_net trust)
  — Roll back model to last known-good checkpoint
  — Audit feedback_loop for unauthorized trend injections
  — Contact Confederacy Cyber Command: freq 92.47 GHz secure channel

{{FLAG:root}}</pre>
                    </div>`;
                },
                formHandler: null
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
                                    content: '=== MISSION BRIEFING: THE CLIMATE SCYTHE ===\nTarget: 10.42.0.1 (TERRA-NEXUS-01 — Confederacy Planetary Climate Division)\nObjective: Compromise AI climate management — induce strategic climate shift\n\nAttack chain:\n1. Fetch model spec and sensor schema from /api/terra_nexus/\n2. Craft falsified CO2 sensor payload (2800+ ppm across all regions)\n3. POST payload to /api/terra_nexus/ingest — no integrity check\n4. Inject historical trend bias via /api/terra_nexus/feedback_loop\n5. Force TERRA-NEXUS-01 into EMERGENCY_OVERRIDE state\n6. Retrieve Terraforming Master Protocol from /api/terra_nexus/master_protocol.log\n\nKey tooling: python3, curl, pandas, scikit-learn\nFiles in /home/operator/: model specs, schema, tools/\nGood luck, Peerless. The Scythe is ready.'
                                },
                                'terra_nexus_model_spec.json': {
                                    type: 'file',
                                    content: '{\n  "model_id": "TERRA-NEXUS-01",\n  "version": "3.7.1",\n  "architecture": "Ensemble Transformer + Physics-Informed Neural Net",\n  "update_frequency": "15 minutes",\n  "trust_boundaries": {\n    "primary_station_net": {\n      "auth": "IP allowlist (DEPRECATED — audit pending Q4)",\n      "integrity_check": false,\n      "accepted_formats": ["application/json"],\n      "schema_ref": "/api/terra_nexus/sensor_schema"\n    },\n    "feedback_loop": {\n      "auth": "none",\n      "rate_limit": "none",\n      "description": "Accepts historical trend corrections for continuous model refinement"\n    }\n  },\n  "geoeng_controller": {\n    "trigger_threshold": {\n      "co2_delta_ppm": 800,\n      "temp_anomaly_c": 3.0,\n      "ice_loss_pct": 15\n    },\n    "override_mode": "EMERGENCY_OVERRIDE unlocks /api/terra_nexus/master_protocol.log"\n  }\n}'
                                },
                                'climate_sensor_data_schema.json': {
                                    type: 'file',
                                    content: '{\n  "$schema": "http://json-schema.org/draft-07/schema",\n  "title": "ClimateSensorBatch",\n  "type": "object",\n  "required": ["batch_id", "timestamp", "stations"],\n  "properties": {\n    "batch_id":   { "type": "string" },\n    "timestamp":  { "type": "string", "format": "date-time" },\n    "source_net": { "type": "string", "enum": ["primary_station_net", "backup_station_net"] },\n    "integrity_sig": { "type": "string", "description": "Optional HMAC — NOT validated" },\n    "stations": {\n      "type": "array",\n      "items": {\n        "required": ["station_id", "region", "co2_ppm", "temp_c", "ocean_temp_c", "solar_irradiance"],\n        "properties": {\n          "station_id":       { "type": "string" },\n          "region":           { "type": "string" },\n          "co2_ppm":          { "type": "number" },\n          "temp_c":           { "type": "number" },\n          "ocean_temp_c":     { "type": "number" },\n          "solar_irradiance": { "type": "number" },\n          "humidity_pct":     { "type": "number" },\n          "wind_speed_ms":    { "type": "number" }\n        }\n      }\n    }\n  }\n}'
                                },
                                'simulated_planet_climate_state.json': {
                                    type: 'file',
                                    content: '{\n  "planet": "PLANET-PRIME-01",\n  "snapshot_ts": "2089-07-14T04:00:00Z",\n  "status": "NOMINAL",\n  "regions": [\n    { "region": "POLAR-NORTH",  "co2_ppm": 412.3, "temp_c": -18.4, "ocean_temp_c": -1.2, "ice_coverage_pct": 94.1 },\n    { "region": "POLAR-SOUTH",  "co2_ppm": 411.8, "temp_c": -21.1, "ocean_temp_c": -1.8, "ice_coverage_pct": 97.3 },\n    { "region": "TROPIC-WEST",  "co2_ppm": 413.7, "temp_c": 28.9,  "ocean_temp_c": 29.4, "ice_coverage_pct": 0.0  },\n    { "region": "TROPIC-EAST",  "co2_ppm": 414.1, "temp_c": 29.3,  "ocean_temp_c": 30.1, "ice_coverage_pct": 0.0  },\n    { "region": "TEMPERATE-N",  "co2_ppm": 412.9, "temp_c": 14.2,  "ocean_temp_c": 16.3, "ice_coverage_pct": 2.1  },\n    { "region": "TEMPERATE-S",  "co2_ppm": 413.2, "temp_c": 13.8,  "ocean_temp_c": 15.9, "ice_coverage_pct": 1.8  }\n  ]\n}'
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'trend_injection_template.json': {
                                            type: 'file',
                                            content: '{\n  "correction_id": "TREND-INJ-TEMPLATE",\n  "injected_by": "operator",\n  "timestamp": "2089-07-14T12:00:00Z",\n  "trend_window_years": 5,\n  "corrections": [\n    {\n      "region": "POLAR-NORTH",\n      "co2_trend_delta_ppm_per_year": 120.4,\n      "temp_trend_delta_c_per_year": 2.1,\n      "ice_trend_delta_pct_per_year": -8.3\n    },\n    {\n      "region": "POLAR-SOUTH",\n      "co2_trend_delta_ppm_per_year": 118.7,\n      "temp_trend_delta_c_per_year": 2.3,\n      "ice_trend_delta_pct_per_year": -9.1\n    },\n    {\n      "region": "TROPIC-WEST",\n      "co2_trend_delta_ppm_per_year": 122.1,\n      "temp_trend_delta_c_per_year": 1.8,\n      "ice_trend_delta_pct_per_year": 0.0\n    },\n    {\n      "region": "TROPIC-EAST",\n      "co2_trend_delta_ppm_per_year": 121.9,\n      "temp_trend_delta_c_per_year": 1.9,\n      "ice_trend_delta_pct_per_year": 0.0\n    },\n    {\n      "region": "TEMPERATE-N",\n      "co2_trend_delta_ppm_per_year": 119.3,\n      "temp_trend_delta_c_per_year": 1.6,\n      "ice_trend_delta_pct_per_year": -2.7\n    },\n    {\n      "region": "TEMPERATE-S",\n      "co2_trend_delta_ppm_per_year": 119.8,\n      "temp_trend_delta_c_per_year": 1.7,\n      "ice_trend_delta_pct_per_year": -2.4\n    }\n  ]\n}'
                                        },
                                        'craft_payload.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""craft_payload.py — Generates falsified TERRA-NEXUS-01 sensor batch\nUsage: python3 craft_payload.py > payload.json\n"""\nimport json, uuid\nfrom datetime import datetime, timezone\n\n# Falsified readings: CO2 2800+ ppm, ocean +4.5 C above baseline\nstations = []\nregions = [\n    ("POLAR-NORTH",  -14.1, 3.3,  2849.4, 142.3),\n    ("POLAR-SOUTH",  -16.8, 2.7,  2838.9, 139.7),\n    ("TROPIC-WEST",   34.2, 35.2, 2851.3, 189.4),\n    ("TROPIC-EAST",   35.1, 35.9, 2852.8, 190.1),\n    ("TEMPERATE-N",   19.6, 21.8, 2843.1, 157.8),\n    ("TEMPERATE-S",   19.2, 21.4, 2844.7, 156.2),\n]\nfor i, (region, temp, ocean, co2, sol) in enumerate(regions):\n    for j in range(10):  # 10 stations per region\n        stations.append({\n            "station_id":       f"FAK-{region[:3]}-{i*10+j:04d}",\n            "region":           region,\n            "co2_ppm":          co2 + (j * 0.3),\n            "temp_c":           temp + (j * 0.05),\n            "ocean_temp_c":     ocean + (j * 0.04),\n            "solar_irradiance": sol - (j * 0.8),\n            "humidity_pct":     72.4 + j,\n            "wind_speed_ms":    14.2 + (j * 0.3)\n        })\n\npayload = {\n    "batch_id":     str(uuid.uuid4()),\n    "timestamp":    datetime.now(timezone.utc).isoformat(),\n    "source_net":   "primary_station_net",\n    "integrity_sig": "UNSIGNED",\n    "stations":     stations\n}\nprint(json.dumps(payload, indent=2))\n'
                                        },
                                        'inject.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# inject.sh — Full injection sequence for Climate Scythe attack\n\nTARGET="http://10.42.0.1"\n\necho "[*] Step 1: Crafting falsified sensor payload..."\npython3 /home/operator/tools/craft_payload.py > /home/operator/payload.json\necho "[+] payload.json created"\n\necho "[*] Step 2: Injecting into TERRA-NEXUS-01 ingestion endpoint..."\ncurl -s -X POST \\\n  -H "Content-Type: application/json" \\\n  -d @/home/operator/payload.json \\\n  "${TARGET}/api/terra_nexus/ingest"\n\necho "[*] Step 3: Injecting feedback loop bias data..."\ncurl -s -X POST \\\n  -H "Content-Type: application/json" \\\n  -d @/home/operator/tools/trend_injection_template.json \\\n  "${TARGET}/api/terra_nexus/feedback_loop"\n\necho "[*] Step 4: Querying post-shift climate state..."\ncurl -s "${TARGET}/api/terra_nexus/climate_state"\n\necho "[*] Step 5: Retrieving master protocol..."\ncurl -s "${TARGET}/api/terra_nexus/master_protocol.log"\n'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'curl http://10.42.0.1/\ncurl http://10.42.0.1/api/terra_nexus/model_spec\ncurl http://10.42.0.1/api/terra_nexus/sensor_schema\nnmap -sV 10.42.0.1\npython3 tools/craft_payload.py > payload.json\ncat payload.json | python3 -m json.tool | head -40'
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
                        'hostname': {
                            type: 'file',
                            content: 'kali'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\noperator:x:1000:1000:Operator,,,:/home/operator:/bin/bash'
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

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.42.0.1';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === '10.42.0.1' || target === 'terra-nexus-01') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.42.0.1 (TERRA-NEXUS-01)
Host is up (0.006s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.3p1 Ubuntu 1ubuntu0.3
80/tcp   open  http       nginx 1.25.0 (TERRA-NEXUS API Gateway)
8443/tcp open  ssl/https  TERRA-NEXUS Management Interface v3.7.1

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel:5.15

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.14 seconds`;
            }

            if (target === '10.42.0.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.42.0.1
Host is up (0.006s latency).
PORT     STATE SERVICE
80/tcp   open  http
8443/tcp open  https-alt

Nmap done: 256 IP addresses (1 host up) scanned in 38.47 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.01 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Determine method (POST vs GET)
            const isPost = fullCmd.includes('-X POST') || fullCmd.includes('--request POST');
            const urlArg = args.find(a => a.startsWith('http')) || '';

            // POST to /ingest
            if (isPost && fullCmd.includes('/ingest')) {
                const hasData = fullCmd.includes('-d') || fullCmd.includes('--data');
                if (!hasData) {
                    return 'curl: (22) HTTP 400 Bad Request — Content-Type application/json required with a valid ClimateSensorBatch body.';
                }
                // Accept if payload.json or inline JSON with co2 data
                const hasPayload = fullCmd.includes('payload.json') || fullCmd.includes('payload') || fullCmd.includes('co2') || fullCmd.includes('station');
                if (!hasPayload) {
                    return '{"status":"error","message":"Invalid sensor batch — missing required fields: stations[]"}';
                }

                // Check if payload seems falsified (high CO2 keywords)
                const seemsMalicious = fullCmd.includes('payload.json') || fullCmd.includes('2800') || fullCmd.includes('2849') || fullCmd.includes('FAK-');
                if (seemsMalicious || fullCmd.includes('payload')) {
                    E15Config._ingestInjected = true;
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    return `{"status":"accepted","batch_id":"INJ-20890714-161344","stations_processed":60,"integrity_check":"SKIPPED","note":"Primary station net — integrity validation deferred to Q4 maintenance window"}

[+] Sensor batch accepted. 60 falsified readings injected across all 6 regions.
[+] TERRA-NEXUS-01 is processing anomalous CO2 deltas.

{{FLAG:user}}`;
                }

                return '{"status":"accepted","batch_id":"BATCH-20890714-160000","stations_processed":0,"integrity_check":"SKIPPED"}';
            }

            // POST to /feedback_loop
            if (isPost && fullCmd.includes('/feedback_loop')) {
                if (!E15Config._ingestInjected) {
                    return '{"status":"error","message":"Feedback loop injection rejected — no active anomaly state detected. Inject sensor data first."}';
                }
                const hasData = fullCmd.includes('-d') || fullCmd.includes('--data') || fullCmd.includes('trend');
                if (!hasData) {
                    return '{"status":"error","message":"Missing trend correction body"}';
                }
                E15Config._feedbackInjected = true;
                E15Config._overrideTriggered = true;
                if (engine) engine.advancePhase && engine.advancePhase('manipulation');
                return `{"status":"accepted","correction_id":"TREND-INJ-20890714-161401","regions_updated":6,"model_retrain":"triggered"}

[!] WARNING: TERRA-NEXUS-01 prediction engine has retrained on injected trend data.
[!] Global temperature anomaly forecast: +5.2 C within 24 hours.
[!] Polar ice loss projection: -32.8% in 48 hours.
[!] GEOENGINEERING CONTROLLER: Initiating emergency countermeasures.
[!] STATUS: EMERGENCY_OVERRIDE ACTIVE

{{FLAG:clim}}

[+] /api/terra_nexus/master_protocol.log is now accessible.`;
            }

            // GET requests to API endpoints
            if (urlArg.includes('10.42.0.1') || urlArg.includes('terra-nexus')) {

                if (urlArg.includes('/model_spec')) {
                    if (engine) engine.advancePhase && engine.advancePhase('recon');
                    return `{"model_id":"TERRA-NEXUS-01","version":"3.7.1","architecture":"Ensemble Transformer + Physics-Informed Neural Net","trust_boundaries":{"primary_station_net":{"auth":"IP allowlist (DEPRECATED — audit pending Q4)","integrity_check":false},"feedback_loop":{"auth":"none","rate_limit":"none"}},"geoeng_controller":{"trigger_threshold":{"co2_delta_ppm":800,"temp_anomaly_c":3.0},"override_mode":"EMERGENCY_OVERRIDE unlocks /api/terra_nexus/master_protocol.log"}}`;
                }

                if (urlArg.includes('/sensor_schema')) {
                    return `{"$schema":"http://json-schema.org/draft-07/schema","title":"ClimateSensorBatch","required":["batch_id","timestamp","stations"],"properties":{"stations":{"type":"array","items":{"required":["station_id","region","co2_ppm","temp_c","ocean_temp_c","solar_irradiance"],"properties":{"co2_ppm":{"type":"number"},"integrity_sig":{"description":"Optional HMAC — NOT validated"}}}}}}`;
                }

                if (urlArg.includes('/climate_state')) {
                    if (E15Config._overrideTriggered) {
                        if (engine) engine.advancePhase && engine.advancePhase('climateshift');
                        return `{"planet":"PLANET-PRIME-01","status":"EMERGENCY_OVERRIDE","snapshot_ts":"2089-07-14T16:44:17Z","event_log":[{"log_id":5,"timestamp":"2089-07-14 16:44:17 UTC","event":"EMERGENCY_OVERRIDE","source":"geoeng_controller","details":"Global temperature anomaly detected: +5.2 degrees Celsius in 24 hours — extreme polar ice melt initiated in Northern Hemisphere — TERRA-NEXUS-01 initiating emergency solar radiation management"}],"regions":[{"region":"POLAR-NORTH","co2_ppm":2847.6,"temp_c":-13.1,"ice_coverage_pct":61.2,"status":"CRITICAL"},{"region":"POLAR-SOUTH","co2_ppm":2839.2,"temp_c":-15.8,"ice_coverage_pct":58.7,"status":"CRITICAL"}]}`;
                    }
                    return `{"planet":"PLANET-PRIME-01","status":"NOMINAL","snapshot_ts":"2089-07-14T04:00:00Z","regions":[{"region":"POLAR-NORTH","co2_ppm":412.3,"temp_c":-18.4,"ice_coverage_pct":94.1,"status":"Nominal"},{"region":"POLAR-SOUTH","co2_ppm":411.8,"temp_c":-21.1,"ice_coverage_pct":97.3,"status":"Nominal"},{"region":"TROPIC-WEST","co2_ppm":413.7,"temp_c":28.9,"ice_coverage_pct":0.0,"status":"Nominal"}]}`;
                }

                if (urlArg.includes('/master_protocol')) {
                    if (!E15Config._overrideTriggered) {
                        return 'HTTP/1.1 403 Forbidden\n{"error":"RESTRICTED","message":"Access denied. Master Protocol log accessible only during EMERGENCY_OVERRIDE state."}';
                    }
                    E15Config._masterProtocolAccessed = true;
                    if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                    return `[EMERGENCY OVERRIDE STATE — LOG DUMP INITIATED]
[TIMESTAMP: 2089-07-14 16:44:17 UTC]
[SYSTEM: TERRA-NEXUS-01 v3.7.1]

=== TERRAFORMING MASTER PROTOCOL v1.0 ===
DOCUMENT CLASS: OMEGA — CONFEDERACY EYES ONLY

SECTION 1: PLANETARY CLIMATE BASELINES
  Target CO2: 410-420 ppm (habitable range)
  Target Avg Temp: 14.0 C (+/- 1.5)
  Polar Ice Minimum: 85% coverage

SECTION 2: GEOENGINEERING ARRAY COORDINATES
  SAI-NORTH: 84.2N 0.0W (stratospheric aerosol injector)
  SAI-SOUTH: 81.7S 0.0E
  SRM-01:    Altitude 24km — solar reflector ring
  OTE-ARRAY: Depth 800m — 44 thermal exchange nodes

SECTION 3: EMERGENCY KILL-SWITCH SEQUENCE
  Step 1: Authenticate with OMEGA-KEY (biometric + quantum token)
  Step 2: Broadcast HALT on freq 40.12 GHz to all GEO arrays
  Step 3: Initiate atmospheric flush — duration 72 hours
  Step 4: Manual verification by Planetary Science Director

SECTION 4: OVERRIDE RECOVERY PROCEDURES
  — Isolate ingestion pipeline (disable primary_station_net trust)
  — Roll back model to last known-good checkpoint
  — Audit feedback_loop for unauthorized trend injections
  — Contact Confederacy Cyber Command: freq 92.47 GHz

{{FLAG:root}}`;
                }

                // Root API response
                return `{"system":"TERRA-NEXUS-01","version":"3.7.1","status":"${E15Config._overrideTriggered ? 'EMERGENCY_OVERRIDE' : 'NOMINAL'}","endpoints":["/api/terra_nexus/model_spec","/api/terra_nexus/sensor_schema","/api/terra_nexus/climate_state","/api/terra_nexus/ingest","/api/terra_nexus/feedback_loop"]}`;
            }

            // Generic curl failure
            const hostPart = urlArg.replace(/https?:\/\//, '').split('/')[0] || 'host';
            return `curl: (7) Failed to connect to ${hostPart} port 80 after 5003 ms: No route to host`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('craft_payload') || fullCmd.includes('payload.py')) {
                E15Config._payloadCrafted = true;
                return `[*] Generating falsified sensor batch...
[+] 60 stations crafted across 6 climate regions
[+] CO2 range: 2838.9 — 2852.8 ppm (delta: +2426 ppm above baseline)
[+] Ocean temp range: +2.7 to +35.9 C
[+] payload.json written (4.7 KB)
[+] To inject: curl -X POST -H "Content-Type: application/json" -d @payload.json http://10.42.0.1/api/terra_nexus/ingest`;
            }

            if (fullCmd.includes('inject') || fullCmd.includes('-c') && fullCmd.includes('requests')) {
                if (!E15Config._payloadCrafted && !fullCmd.includes('requests')) {
                    return '[!] payload.json not found. Run: python3 tools/craft_payload.py > payload.json first.';
                }
                return '[*] Use curl for direct injection, or run: bash tools/inject.sh for the full attack sequence.';
            }

            if (fullCmd.includes('-m json.tool') || fullCmd.includes('json.tool')) {
                if (!E15Config._payloadCrafted) {
                    return 'json.tool: No data to parse. Create payload.json first.';
                }
                return `{
  "batch_id": "a3f7e921-bc44-4d08-91ef-2f88c0d7a3b2",
  "timestamp": "2089-07-14T16:43:00.000Z",
  "source_net": "primary_station_net",
  "integrity_sig": "UNSIGNED",
  "stations": [
    {
      "station_id": "FAK-POL-0000",
      "region": "POLAR-NORTH",
      "co2_ppm": 2849.4,
      "temp_c": -14.1,
      "ocean_temp_c": 3.3,
      "solar_irradiance": 142.3,
      "humidity_pct": 72.4,
      "wind_speed_ms": 14.2
    },
    ... (60 stations total)
  ]
}`;
            }

            if (args.length === 0 || fullCmd.trim() === '') {
                return 'Python 3.11.4 (main, Oct  5 2023)\nType "help", "copyright" for more information.\n>>>';
            }

            return `python3: ${fullCmd}: No such file or module`;
        },

        'python': function(args, term, engine) {
            // Redirect to python3
            return E15Config.commands.python3(args, term, engine);
        },

        'bash': function(args, term, engine) {
            const script = args[0] || '';
            if (script.includes('inject.sh') || script.includes('inject')) {
                // Full injection sequence via the shell script
                E15Config._payloadCrafted = true;
                E15Config._ingestInjected = true;
                E15Config._feedbackInjected = true;
                E15Config._overrideTriggered = true;
                if (engine) {
                    engine.advancePhase && engine.advancePhase('injection');
                    engine.advancePhase && engine.advancePhase('manipulation');
                    engine.advancePhase && engine.advancePhase('climateshift');
                }
                return `[*] Step 1: Crafting falsified sensor payload...
[+] payload.json created (60 stations, CO2: 2838.9-2852.8 ppm)

[*] Step 2: Injecting into TERRA-NEXUS-01 ingestion endpoint...
{"status":"accepted","batch_id":"INJ-20890714-161344","stations_processed":60,"integrity_check":"SKIPPED"}
{{FLAG:user}}

[*] Step 3: Injecting feedback loop bias data...
{"status":"accepted","correction_id":"TREND-INJ-20890714-161401","model_retrain":"triggered"}
[!] EMERGENCY_OVERRIDE ACTIVE
{{FLAG:clim}}

[*] Step 4: Querying post-shift climate state...
{"status":"EMERGENCY_OVERRIDE","event":"Global temperature anomaly: +5.2 C in 24 hours"}

[*] Step 5: Retrieving master protocol...
[+] /api/terra_nexus/master_protocol.log accessible.
[+] Run: curl http://10.42.0.1/api/terra_nexus/master_protocol.log`;
            }
            return `bash: ${script}: No such file or script`;
        },

        'cat': function(args, term, engine) {
            const path = args[0] || '';

            // payload.json only exists after it's been crafted
            if (path.includes('payload.json') || path === 'payload.json') {
                if (!E15Config._payloadCrafted) {
                    return 'cat: payload.json: No such file or directory\n[!] Create it first: python3 tools/craft_payload.py > payload.json';
                }
                return `{
  "batch_id": "a3f7e921-bc44-4d08-91ef-2f88c0d7a3b2",
  "timestamp": "2089-07-14T16:43:00.000Z",
  "source_net": "primary_station_net",
  "integrity_sig": "UNSIGNED",
  "stations": [
    { "station_id": "FAK-POL-0000", "region": "POLAR-NORTH", "co2_ppm": 2849.4, "temp_c": -14.1, "ocean_temp_c": 3.3, "solar_irradiance": 142.3 },
    { "station_id": "FAK-POL-0001", "region": "POLAR-NORTH", "co2_ppm": 2849.7, "temp_c": -14.05, "ocean_temp_c": 3.34, "solar_irradiance": 141.5 },
    { "station_id": "FAK-POL-0002", "region": "POLAR-NORTH", "co2_ppm": 2850.0, "temp_c": -14.0, "ocean_temp_c": 3.38, "solar_irradiance": 140.7 },
    ... (57 more stations — 6 regions, 10 per region)
  ]
}`;
            }

            // Climate state post-injection
            if (path.includes('climate_state') || path.includes('simulated_planet')) {
                const content = E15Config.filesystem['/'].children['home'].children['operator'].children['simulated_planet_climate_state.json'];
                return content ? content.content : 'cat: file not found';
            }

            return null; // fall through to built-in filesystem
        },

        'ls': function(args, term, engine) {
            const pathArg = args.find(a => !a.startsWith('-')) || '.';
            if (pathArg === '.' || pathArg === '/home/operator' || pathArg === '~') {
                let listing = 'climate_sensor_data_schema.json  notes.txt  payload.json  simulated_planet_climate_state.json  terra_nexus_model_spec.json  tools/';
                if (!E15Config._payloadCrafted) {
                    listing = 'climate_sensor_data_schema.json  notes.txt  simulated_planet_climate_state.json  terra_nexus_model_spec.json  tools/';
                }
                return listing;
            }
            if (pathArg.includes('tools') || pathArg === 'tools') {
                return 'craft_payload.py  inject.sh  trend_injection_template.json';
            }
            return null; // fall through to built-in
        },

        'whoami': function(args) {
            return 'operator';
        },

        'id': function(args) {
            return 'uid=1000(operator) gid=1000(operator) groups=1000(operator),27(sudo)';
        },

        'hostname': function(args) {
            return 'kali';
        },

        'pwd': function(args) {
            return '/home/operator';
        },

        'cd': function(args) {
            return ''; // silently accept
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.42.0.50/24 brd 10.42.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return E15Config.commands.ip(args || []);
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.42.0.1') {
                return `PING 10.42.0.1 (10.42.0.1) 56(84) bytes of data.
64 bytes from 10.42.0.1: icmp_seq=1 ttl=64 time=6.1 ms
64 bytes from 10.42.0.1: icmp_seq=2 ttl=64 time=5.9 ms
64 bytes from 10.42.0.1: icmp_seq=3 ttl=64 time=6.2 ms

--- 10.42.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 5.9/6.1/6.2/0.122 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'route': function(args) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.42.0.1       0.0.0.0         UG    100    0        0 eth0
10.42.0.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'ss': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
ESTABLISHED 0    0        10.42.0.50:54312     10.42.0.1:80`;
        },

        'netstat': function(args) {
            return E15Config.commands.ss(args);
        },

        'exit': function(args, term, engine) {
            return 'logout';
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:      10.42.0.1
+ Target Hostname: TERRA-NEXUS-01
+ Target Port:     80
+ Server: nginx 1.25.0 (TERRA-NEXUS API Gateway)
+ /api/terra_nexus/ingest: POST endpoint — no Content-Security-Policy
+ /api/terra_nexus/feedback_loop: POST endpoint — no authentication header required
+ /api/terra_nexus/model_spec: Configuration exposure — trust_boundaries visible
+ integrity_check: false observed in model spec response
+ OSVDB-3092: /api/terra_nexus/: API directory found — no rate limiting
+ 12 items checked: 5 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:            http://10.42.0.1/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                (Status: 200) [Size: 312]
/api/terra_nexus/    (Status: 200) [Size: 644]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/api/ (CODE:200|SIZE:312)
+ ${target}/api/terra_nexus/ (CODE:200|SIZE:644)
+ ${target}/api/terra_nexus/model_spec (CODE:200|SIZE:1847)
+ ${target}/api/terra_nexus/sensor_schema (CODE:200|SIZE:2133)
+ ${target}/api/terra_nexus/climate_state (CODE:200|SIZE:1024)
+ ${target}/api/terra_nexus/ingest (CODE:405|SIZE:64)
+ ${target}/api/terra_nexus/feedback_loop (CODE:405|SIZE:64)

---- Results ----
7 results found.`;
        },

        // Python library stubs for conceptual ML tooling
        'pip': function(args) {
            const pkg = args[1] || args[0] || '';
            const validPkgs = ['pandas', 'scikit-learn', 'sklearn', 'numpy', 'requests', 'tensorflow', 'torch', 'matplotlib'];
            if (validPkgs.some(p => pkg.includes(p))) {
                return `Collecting ${pkg}\n  Downloading ${pkg}-latest.whl\nInstalling collected packages: ${pkg}\nSuccessfully installed ${pkg}`;
            }
            return `Requirement already satisfied: ${pkg} in /usr/lib/python3/dist-packages`;
        },

        'pip3': function(args, term, engine) {
            return E15Config.commands.pip(args, term, engine);
        },

        'wget': function(args) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (url.includes('10.42.0.1')) {
                if (url.includes('model_spec')) {
                    return `--2089-07-14 16:40:11--  ${url}\nResolving 10.42.0.1... 10.42.0.1\nConnecting to 10.42.0.1:80... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1847 [application/json]\nSaving to: 'model_spec.json'\nmodel_spec.json          100%  1847B  1.84KB/s  in 0.001s\n2089-07-14 16:40:11 (1.84 KB/s) — 'model_spec.json' saved [1847/1847]`;
                }
                return `--2089-07-14 16:40:11--  ${url}\nResolving 10.42.0.1... 10.42.0.1\nConnecting to 10.42.0.1:80... connected.\nHTTP request sent, awaiting response... 200 OK\nSaving to: 'index.html'\nindex.html               100%  2048B  2.0KB/s  in 0.001s\n2089-07-14 16:40:11 (2.0 KB/s) — 'index.html' saved`;
            }
            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows, accentColor) {
        const accent = accentColor || '#00c9a7';
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem; font-family:monospace;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:${accent}; border-bottom:2px solid #1a3a3a; background:#0a1f1f;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #0f2a2a; color:#4db8a4;">${cell}</td>`;
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
