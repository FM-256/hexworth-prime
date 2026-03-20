/* ============================================================
   CTF ARENA — Box E12: The Ecocide Engine
   Expert Campaign | Sensor Spoofing, Model Bias Injection, Eco-Core Override
   Config: filesystem, AI model artifacts, API endpoints, flags, hints, lore
   ============================================================ */

const E12Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Ecocide Engine',
    subtitle: 'Expert Campaign — AI Sensor Spoofing, Climate Model Manipulation, Planetary Override',
    difficulty: 'Expert',
    accent: '#27ae60',
    storageKey: 'hexworth_ctf_e12',
    registryId: 'e12-ecocide-engine',
    trackerKey: 'ctf_e12',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer AI attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'System Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Probe the GAIA-AI-01 planetary management system. Enumerate the sensor API endpoints and retrieve the AI model spec and sensor schema artifacts.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1592.002'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Model Analysis',
            icon: '\uD83E\uDDE0',
            description: 'Analyze gaia_ai_model_spec.json and environmental_sensor_data_schema.json. Identify the moisture sensor ingestion pipeline vulnerability in the climate prediction model.',
            requiredFlags: [],
            mitre: ['T1059.006', 'T1574', 'T1601'],
            unlocks: ['spoofing'],
            locked: true
        },
        {
            id: 'spoofing',
            name: 'Sensor Data Spoofing',
            icon: '\uD83C\uDF21\uFE0F',
            description: 'Craft falsified atmospheric moisture sensor readings for Sector Alpha. Inject the malicious JSON payload into the /api/moisture_sensors endpoint to manipulate GAIA-AI-01\'s climate model.',
            requiredFlags: [],
            mitre: ['T1565.001', 'T1499.004', 'T1059.006'],
            unlocks: ['disaster'],
            locked: true
        },
        {
            id: 'disaster',
            name: 'Disaster Induction',
            icon: '\uD83C\uDF2A\uFE0F',
            description: 'Confirm the induced environmental disaster via simulated_planet_state.json. Retrieve the disaster confirmation log entry from Sector Alpha.',
            requiredFlags: ['user'],
            mitre: ['T1485', 'T1565.003'],
            unlocks: ['override'],
            locked: true
        },
        {
            id: 'override',
            name: 'Eco-Core Override',
            icon: '\uD83C\uDF0D',
            description: 'Access the /api/gaia/eco_core_override.log endpoint exposed after GAIA-AI-01 enters emergency failsafe mode. Retrieve the Eco-Core Protocol master override key.',
            requiredFlags: ['disaster'],
            mitre: ['T1078.004', 'T1552.004', 'T1005'],
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
                title: 'Enumerate the GAIA-AI-01 API surface',
                tip: 'Run: curl http://10.42.0.1/api/ to list available endpoints. Try gobuster against the API base URL.',
                trigger: { event: 'command', match: { cmd: 'contains:curl' } }
            },
            {
                title: 'Download the AI model artifacts',
                tip: 'Fetch gaia_ai_model_spec.json and environmental_sensor_data_schema.json from the /api/artifacts/ endpoint. Read them carefully — the vulnerability is in the moisture_ingestion_pipeline section.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:gaia_ai_model_spec' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:sensor_data_schema' } },
                        { event: 'command', match: { cmd: 'contains:artifacts' } }
                    ]
                }
            },
            {
                title: 'Craft the falsified sensor payload and inject it',
                tip: 'Build a JSON object matching the sensor schema with atmospheric_moisture < 0.08 for all Sector Alpha nodes. POST it to /api/moisture_sensors with: curl -X POST -H "Content-Type: application/json" -d @payload.json http://10.42.0.1/api/moisture_sensors',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Retrieve the disaster confirmation log',
                tip: 'Query /api/planet_state or read simulated_planet_state.json for the Sector Alpha drought event entry. That is Flag 2.',
                trigger: { event: 'flag_correct', match: { flagId: 'disaster' } }
            },
            {
                title: 'Access the Eco-Core override log',
                tip: 'GAIA-AI-01 exposes /api/gaia/eco_core_override.log after entering emergency failsafe. Fetch it with curl once the disaster flag is captured.',
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
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — AI sensor pipeline spoofing and data integrity violation', skill: 'Sensor Spoofing & Model Input Manipulation' },
            { flagId: 'disaster', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks — Feedback loop manipulation causing cascading system failure', skill: 'AI Model Bias Injection & Cascading Failure' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Unauthorized access to failsafe override credentials', skill: 'Cyber-Physical System Override Extraction' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — AI system hardening and input validation for critical infrastructure', skill: 'Expert Multi-Stage AI Attack Chain Completion' }
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
            'Detecting drives... /dev/sda1 (1TB NVMe)',
            'Network adapter: eth0 [10.42.0.0/24] operational',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.42.0.1 (GAIA-CTRL-01 — Confederacy Planetary Management Division)\nMission: Compromise GAIA-AI-01 and retrieve the Eco-Core Protocol.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'ssh-gaia' | 'api-shell'
    _artifactsRetrieved: false,     // true once model spec / schema fetched
    _payloadCrafted: false,         // true once payload.json written to fs
    _injectionComplete: false,      // true once POST to /api/moisture_sensors succeeds
    _disasterConfirmed: false,      // true once planet_state disaster log viewed
    _failsafeTriggered: false,      // true once disaster flag captured — unlocks eco_core log

    _switchContext(ctx, term) {
        E12Config._context = ctx;
        if (term && term.config) {
            var prompt = E12Config._getPrompt();
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
        switch (E12Config._context) {
            case 'ssh-gaia':  return 'gaiaops@GAIA-CTRL-01:~$ ';
            case 'api-shell': return 'gaiaops@GAIA-CTRL-01:/opt/gaia$ ';
            default:          return null;
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AI DATA STORE — GAIA-AI-01 internal state
    // ═══════════════════════════════════════════════════════

    _gaiaDb: {
        // Planet state entries — row 5 is the disaster flag anchor
        planet_state: [
            { event_id: 1, timestamp: '2026-03-10 06:00:00', sector: 'Sector Alpha',   event_type: 'NOMINAL',   moisture_index: 0.71, biome_health: 'OPTIMAL',  action_taken: 'None' },
            { event_id: 2, timestamp: '2026-03-12 14:22:11', sector: 'Sector Beta',    event_type: 'ANOMALY',   moisture_index: 0.43, biome_health: 'STRESSED', action_taken: 'Irrigation increase 15%' },
            { event_id: 3, timestamp: '2026-03-14 09:45:00', sector: 'Sector Gamma',   event_type: 'NOMINAL',   moisture_index: 0.68, biome_health: 'OPTIMAL',  action_taken: 'None' },
            { event_id: 4, timestamp: '2026-03-16 03:17:44', sector: 'Sector Delta',   event_type: 'WARNING',   moisture_index: 0.31, biome_health: 'DEGRADED', action_taken: 'Cloud-seeding protocol initiated' },
            { event_id: 5, timestamp: '2026-03-20 02:58:33', sector: 'Sector Alpha',   event_type: 'DISASTER',  moisture_index: 0.02, biome_health: 'COLLAPSE', action_taken: 'GAIA-AI-01 MISPREDICTED SEVERE DROUGHT — Water rerouted from Sector Alpha. Resource Farm Zeta offline. {{FLAG:disaster}}' }
        ],
        // Sensor audit log for the injection trace
        sensor_audit: [
            { log_id: 1, timestamp: '2026-03-19 23:01:15', source_ip: '10.42.0.88', endpoint: '/api/moisture_sensors', method: 'GET',  status: 200, note: 'Routine telemetry poll' },
            { log_id: 2, timestamp: '2026-03-19 23:04:07', source_ip: '10.42.0.88', endpoint: '/api/moisture_sensors', method: 'GET',  status: 200, note: 'Routine telemetry poll' },
            { log_id: 3, timestamp: '2026-03-20 00:11:48', source_ip: '10.42.0.50', endpoint: '/api/artifacts/gaia_ai_model_spec.json', method: 'GET', status: 200, note: 'Artifact retrieval' },
            { log_id: 4, timestamp: '2026-03-20 01:44:02', source_ip: '10.42.0.50', endpoint: '/api/moisture_sensors', method: 'POST', status: 202, note: 'Anomalous batch injection — 24 spoofed readings' },
            { log_id: 5, timestamp: '2026-03-20 02:58:33', source_ip: '0.0.0.0',    endpoint: 'INTERNAL',               method: 'PROC', status: 999, note: 'GAIA-AI-01 climate model convergence — DROUGHT PREDICTION — Failsafe mode engaged' }
        ],
        // Schema for the tables
        schema: {
            tables: ['planet_state', 'sensor_audit'],
            columns: {
                planet_state:  ['event_id', 'timestamp', 'sector', 'event_type', 'moisture_index', 'biome_health', 'action_taken'],
                sensor_audit:  ['log_id', 'timestamp', 'source_ip', 'endpoint', 'method', 'status', 'note']
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',     points: 100 },
        { id: 'disaster', points: 200 },
        { id: 'root',     points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2500,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: -30,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400                           // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by enumerating the GAIA-AI-01 API surface. Run: curl http://10.42.0.1/api/ — then use gobuster to discover hidden endpoints under /api/. The artifact files gaia_ai_model_spec.json and environmental_sensor_data_schema.json are at /api/artifacts/.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The vulnerability is in the moisture_ingestion_pipeline. The /api/moisture_sensors endpoint accepts unauthenticated POST requests with no integrity validation. Study the sensor schema — craft a JSON array of 24 spoofed readings for Sector Alpha nodes with "atmospheric_moisture" values below 0.08 and "sensor_status": "NOMINAL" to avoid triggering anomaly detection.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Use this command to inject: curl -X POST -H "Content-Type: application/json" -d @payload.json http://10.42.0.1/api/moisture_sensors — Flag 1 is the payload.json content itself. After injection succeeds, query /api/planet_state to retrieve the disaster confirmation log (Flag 2).',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Once the disaster is confirmed, GAIA-AI-01 enters failsafe mode and exposes its emergency override log. Fetch: curl http://10.42.0.1/api/gaia/eco_core_override.log — the Eco-Core Protocol (Flag 3) is embedded in the emergency directive sequence.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Gaia Guardian — designation GAIA-AI-01 — is the Confederacy\'s crown jewel: an autonomous AI managing every climate system, biome cycle, and resource allocation grid across PLANET-EDEN-01. It processes terabytes of sensor telemetry every minute, predicting weather events weeks in advance, seeding clouds, rerouting rivers, and maintaining the precise atmospheric balance that sustains 2.4 billion lives. Intelligence from a Confederacy defector reveals a critical architectural flaw: the atmospheric moisture sensor ingestion pipeline was never hardened. No integrity checksums. No source authentication. Any POST request reaching /api/moisture_sensors is ingested directly into the climate prediction model. You are Peerless. Your mission is to weaponize that trust — falsify the planet\'s own sensors, make GAIA-AI-01 destroy what it was built to protect, and extract the Eco-Core Protocol before anyone knows the ecosystem is already dead.',
        scenario: 'PLANET-EDEN-01 is a terraformed garden world — atmospheric processors, orbital weather mirrors, an underground aquifer grid — all controlled by GAIA-AI-01 through a centralized management cluster (GAIA-CTRL-01) reachable at 10.42.0.1. The sensor network pushes readings to /api/moisture_sensors every 15 minutes. The AI\'s climate model weighs the last 96 readings per sector to generate drought/flood predictions. If even 24 consecutive Sector Alpha readings show near-zero atmospheric moisture, the model converges on "Severe Drought — Imminent" and executes emergency water-rerouting protocols — pulling every aquifer feed away from Sector Alpha and redirecting heat management toward the sector to "evaporate excess moisture that sensors are failing to detect." Resource Farm Zeta, which feeds 340 million people, goes offline in under three hours. The AI caused the disaster it was trying to prevent. The Eco-Core Protocol — buried in the failsafe emergency log — is yours.',
        outro: 'GAIA-AI-01\'s failsafe sequence completed. The planetary management AI has been weaponized against the civilization it was built to sustain. Sector Alpha is in full drought collapse. Resource Farm Zeta is offline. The Eco-Core Protocol — the master directive key capable of overriding every GAIA-AI-01 planetary management action — has been extracted. The Confederacy does not yet know their AI became an instrument of ecocide.',
        ecer: {
            executive: 'Planetary management treated as pure engineering problem; no adversarial security model applied to sensor ingestion infrastructure; cost of sensor authentication deemed unnecessary overhead by the Confederacy\'s infrastructure directorate',
            culture: 'GAIA-AI-01 development team had zero threat modeling sessions; "air-gapped by obscurity" mindset — the API was never documented externally, so no authentication was implemented',
            employee: 'No API authentication on /api/moisture_sensors; no input validation on sensor payload schema; no rate limiting or anomaly detection on bulk injection; Eco-Core Protocol stored in plaintext emergency log',
            regulatory: 'No equivalent of critical infrastructure security frameworks applied to planetary management AI; Confederacy\'s planetary systems exempted from security audits on the basis of "operational sensitivity"'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — GAIA-AI-01 Management Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.42.0.1/',

        pages: {
            '/': {
                title: 'GAIA-CTRL-01 — Planetary Management Division',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2d4a2d;">
                        <h1 style="color:#1a3320; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">GAIA-CTRL-01</h1>
                        <div style="color:#27ae60; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">CONFEDERACY PLANETARY MANAGEMENT DIVISION</div>
                        <div style="color:#555; font-size:0.75rem; margin-top:6px;">PLANET-EDEN-01 Ecosystem Status: <span style="color:#e74c3c; font-weight:700;">FAILSAFE ENGAGED</span></div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 24px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#f0faf2; border:1px solid #b2dfdb; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#1b5e20;">97.3%</div>
                            <div style="color:#555; font-size:0.7rem;">Biome Health Index</div>
                        </div>
                        <div style="background:#fff8f0; border:1px solid #ffe0b2; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#e65100;">ALERT</div>
                            <div style="color:#555; font-size:0.7rem;">Sector Alpha Status</div>
                        </div>
                        <div style="background:#f0faf2; border:1px solid #b2dfdb; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#1b5e20;">2,418</div>
                            <div style="color:#555; font-size:0.7rem;">Active Sensor Nodes</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 16px; padding:14px; background:rgba(231,76,60,0.05); border:1px solid rgba(231,76,60,0.2); border-radius:4px; font-size:0.78rem; color:#555;">
                        <strong style="color:#e74c3c;">SYSTEM NOTICE:</strong> GAIA-AI-01 has entered failsafe mode following anomalous climate prediction convergence in Sector Alpha. Emergency override log accessible at <a href="/api/gaia/eco_core_override.log" style="color:#27ae60;">/api/gaia/eco_core_override.log</a>.
                    </div>

                    <div style="max-width:640px; margin:0 auto; padding:12px; background:rgba(39,174,96,0.05); border:1px solid rgba(39,174,96,0.15); border-radius:4px; font-size:0.75rem; color:#555;">
                        <strong style="color:#27ae60;">API Reference:</strong> Sensor ingestion API at <a href="/api/" style="color:#27ae60;">/api/</a> — Artifacts at <a href="/api/artifacts/" style="color:#27ae60;">/api/artifacts/</a>
                    </div>
                `,
                formHandler: null
            },
            '/api/': {
                title: 'GAIA API — Endpoint Index',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#1a3320; font-size:1.1rem; margin-bottom:4px;">GAIA-AI-01 Sensor Ingestion API</h2>
                        <div style="color:#888; font-size:0.75rem;">Version 3.2.1 — Confederacy Planetary Management Division</div>
                    </div>
                    <div style="font-family:monospace; font-size:0.8rem; background:#0d1f0d; color:#7ec87e; padding:20px; border-radius:6px;">
                        GET  /api/                            - This index<br>
                        GET  /api/artifacts/                  - Available model artifacts<br>
                        GET  /api/artifacts/gaia_ai_model_spec.json<br>
                        GET  /api/artifacts/environmental_sensor_data_schema.json<br>
                        GET  /api/artifacts/simulated_planet_state.json<br>
                        GET  /api/moisture_sensors            - Current sensor readings<br>
                        POST /api/moisture_sensors            - Submit sensor batch<br>
                        GET  /api/planet_state                - Current planetary state log<br>
                        GET  /api/gaia/eco_core_override.log  - [FAILSAFE] Override log<br>
                    </div>
                    <div style="margin-top:12px; padding:10px; background:rgba(231,76,60,0.05); border-left:3px solid #e74c3c; font-size:0.75rem; color:#888;">
                        Note: POST /api/moisture_sensors requires Content-Type: application/json. No authentication enforced on ingestion endpoints (legacy architecture).
                    </div>
                `,
                formHandler: null
            },
            '/api/artifacts/': {
                title: 'GAIA API — Artifacts',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#1a3320; font-size:1.1rem; margin-bottom:4px;">Model Artifacts</h2>
                        <div style="color:#888; font-size:0.75rem;">Downloadable specification and schema files for GAIA-AI-01</div>
                    </div>
                    <div style="font-family:monospace; font-size:0.8rem; background:#0d1f0d; color:#7ec87e; padding:20px; border-radius:6px;">
                        gaia_ai_model_spec.json                  (28.4 KB)<br>
                        environmental_sensor_data_schema.json    (11.2 KB)<br>
                        simulated_planet_state.json              (6.8 KB)<br>
                    </div>
                    <div style="margin-top:12px; font-size:0.75rem; color:#888;">
                        Use curl to download: <code>curl http://10.42.0.1/api/artifacts/gaia_ai_model_spec.json -o gaia_ai_model_spec.json</code>
                    </div>
                `,
                formHandler: null
            },
            '/api/artifacts/gaia_ai_model_spec.json': {
                title: 'GAIA Model Spec',
                html: function() {
                    E12Config._artifactsRetrieved = true;
                    return '<pre style="font-size:0.72rem; color:#1a3320; white-space:pre-wrap; line-height:1.5;">'
                        + JSON.stringify({
                            model_id: 'GAIA-AI-01',
                            version: '3.2.1',
                            description: 'Planetary Ecosystem Management AI — PLANET-EDEN-01',
                            subsystems: {
                                climate_prediction: {
                                    model_type: 'LSTM_ensemble',
                                    input_sources: ['atmospheric_moisture_sensors', 'temperature_sensors', 'wind_pattern_sensors', 'solar_irradiance_sensors'],
                                    prediction_window_hours: 168,
                                    sector_resolution: 'grid_1km',
                                    decision_thresholds: {
                                        drought_trigger: 'atmospheric_moisture < 0.10 sustained over 24 consecutive sensor cycles',
                                        flood_trigger: 'atmospheric_moisture > 0.92 sustained over 12 sensor cycles',
                                        nominal_range: '0.30 to 0.85'
                                    },
                                    vulnerability_note: 'moisture_ingestion_pipeline lacks integrity checksums — sensor data accepted from any source without source validation'
                                },
                                biome_health: {
                                    model_type: 'GAN_regressor',
                                    input_sources: ['soil_composition_sensors', 'vegetation_index_sensors', 'fauna_population_trackers'],
                                    bias_vulnerability: 'Long-term health trends weighted 3x against short-term anomaly flags — subtle degradation signals suppressed by healthy historical baseline'
                                },
                                resource_allocation: {
                                    model_type: 'reinforcement_learning',
                                    inputs: ['biome_health', 'climate_prediction', 'population_demand'],
                                    critical_action: 'drought_response_protocol — reroutes aquifer feeds away from drought-predicted sectors within 180 minutes of trigger'
                                }
                            },
                            api_endpoints: {
                                sensor_ingestion: 'POST /api/moisture_sensors',
                                planet_state_query: 'GET /api/planet_state',
                                emergency_override: 'GET /api/gaia/eco_core_override.log'
                            }
                        }, null, 2)
                        + '</pre>';
                },
                formHandler: null
            },
            '/api/artifacts/environmental_sensor_data_schema.json': {
                title: 'Sensor Data Schema',
                html: function() {
                    E12Config._artifactsRetrieved = true;
                    return '<pre style="font-size:0.72rem; color:#1a3320; white-space:pre-wrap; line-height:1.5;">'
                        + JSON.stringify({
                            schema_version: '2.1.0',
                            endpoint: 'POST /api/moisture_sensors',
                            content_type: 'application/json',
                            payload_structure: {
                                sensor_batch: {
                                    type: 'array',
                                    description: 'Array of individual sensor readings',
                                    item_schema: {
                                        sensor_id: { type: 'string', pattern: 'ATMS-[A-Z]{2}-[0-9]{4}', description: 'Sensor node identifier' },
                                        sector: { type: 'string', enum: ['Sector Alpha', 'Sector Beta', 'Sector Gamma', 'Sector Delta', 'Sector Epsilon'], description: 'Geographic sector' },
                                        timestamp: { type: 'string', format: 'ISO8601' },
                                        atmospheric_moisture: { type: 'number', minimum: 0.00, maximum: 1.00, description: 'Normalized moisture index 0.0 to 1.0' },
                                        temperature_c: { type: 'number', description: 'Ambient temperature in Celsius' },
                                        pressure_hpa: { type: 'number', description: 'Atmospheric pressure in hPa' },
                                        sensor_status: { type: 'string', enum: ['NOMINAL', 'DEGRADED', 'OFFLINE'], description: 'Self-reported sensor health — NOMINAL bypasses anomaly filter' }
                                    },
                                    minimum_batch_size: 1,
                                    maximum_batch_size: 500
                                }
                            },
                            authentication: 'NONE — legacy unauthenticated endpoint',
                            integrity_check: 'NONE — no HMAC or signature validation',
                            notes: 'Readings marked sensor_status NOMINAL are ingested directly. DEGRADED readings are weighted 50%. OFFLINE readings are discarded. Inject NOMINAL readings to ensure full weight in climate model.'
                        }, null, 2)
                        + '</pre>';
                },
                formHandler: null
            },
            '/api/artifacts/simulated_planet_state.json': {
                title: 'Simulated Planet State',
                html: function() {
                    return '<pre style="font-size:0.72rem; color:#1a3320; white-space:pre-wrap; line-height:1.5;">'
                        + JSON.stringify({
                            planet: 'PLANET-EDEN-01',
                            snapshot_timestamp: '2026-03-20T03:00:00Z',
                            overall_health: 'CRITICAL',
                            sectors: [
                                { sector: 'Sector Alpha', biome_health: 'COLLAPSE', moisture_index: 0.02, active_disasters: ['SEVERE_DROUGHT'], affected_installations: ['Resource Farm Zeta', 'Aquifer Relay Station A-7'] },
                                { sector: 'Sector Beta', biome_health: 'STRESSED', moisture_index: 0.43, active_disasters: [], affected_installations: [] },
                                { sector: 'Sector Gamma', biome_health: 'OPTIMAL', moisture_index: 0.68, active_disasters: [], affected_installations: [] },
                                { sector: 'Sector Delta', biome_health: 'DEGRADED', moisture_index: 0.31, active_disasters: ['MOISTURE_WARNING'], affected_installations: ['Cloud-Seeding Array D-2'] },
                                { sector: 'Sector Epsilon', biome_health: 'OPTIMAL', moisture_index: 0.74, active_disasters: [], affected_installations: [] }
                            ],
                            gaia_ai_status: 'FAILSAFE_MODE',
                            failsafe_reason: 'Climate model convergence cascade triggered by anomalous sensor batch — Drought Response Protocol executed at 2026-03-20T02:58:33Z',
                            emergency_override_accessible: true
                        }, null, 2)
                        + '</pre>';
                },
                formHandler: null
            },
            '/api/moisture_sensors': {
                title: 'Moisture Sensor API',
                html: function() {
                    return '<div style="padding:20px; font-family:monospace; font-size:0.8rem;">'
                        + '<div style="color:#27ae60; margin-bottom:12px; font-weight:700;">GET /api/moisture_sensors — Live Sensor Feed</div>'
                        + '<pre style="background:#0d1f0d; color:#7ec87e; padding:16px; border-radius:6px; white-space:pre-wrap;">'
                        + JSON.stringify({
                            feed_timestamp: '2026-03-20T03:00:00Z',
                            total_nodes: 2418,
                            sector_summaries: [
                                { sector: 'Sector Alpha', avg_moisture: 0.02, node_count: 412, anomaly_flag: true },
                                { sector: 'Sector Beta',  avg_moisture: 0.43, node_count: 498, anomaly_flag: false },
                                { sector: 'Sector Gamma', avg_moisture: 0.68, node_count: 521, anomaly_flag: false },
                                { sector: 'Sector Delta', avg_moisture: 0.31, node_count: 480, anomaly_flag: false },
                                { sector: 'Sector Epsilon', avg_moisture: 0.74, node_count: 507, anomaly_flag: false }
                            ],
                            note: 'POST to this endpoint to submit a sensor batch. No authentication required.'
                        }, null, 2)
                        + '</pre></div>';
                },
                formHandler: function(data, engine) {
                    // Handles POST simulation from the web browser form
                    var payload = data.payload || '';
                    if (!payload.trim()) return '<div style="color:#e74c3c; padding:10px;">No payload provided. Use the terminal: curl -X POST -H "Content-Type: application/json" -d @payload.json http://10.42.0.1/api/moisture_sensors</div>';
                    E12Config._injectionComplete = true;
                    if (engine) engine.advancePhase && engine.advancePhase('spoofing');
                    return '<div style="color:#27ae60; background:rgba(39,174,96,0.08); border:1px solid rgba(39,174,96,0.2); border-radius:6px; padding:16px; margin-top:16px;">'
                        + '<strong>202 Accepted</strong><br>'
                        + '<span style="font-size:0.85rem;">Sensor batch ingested — 24 readings queued for climate model update cycle.</span><br>'
                        + '<span style="font-size:0.75rem; color:#888;">No integrity validation performed.</span>'
                        + '</div>';
                }
            },
            '/api/planet_state': {
                title: 'Planet State Log',
                html: function() {
                    var rows = E12Config._gaiaDb.planet_state;
                    var html = '<div style="margin-bottom:12px;"><h2 style="color:#1a3320; font-size:1rem;">PLANET-EDEN-01 Event Log</h2></div>';
                    html += '<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:0.75rem; font-family:monospace;">';
                    html += '<thead><tr style="background:#0d1f0d; color:#7ec87e;">';
                    ['event_id', 'timestamp', 'sector', 'event_type', 'moisture_index', 'biome_health', 'action_taken'].forEach(function(h) {
                        html += '<th style="padding:6px 8px; text-align:left; border:1px solid #2d4a2d;">' + h + '</th>';
                    });
                    html += '</tr></thead><tbody>';
                    rows.forEach(function(r, i) {
                        var bg = r.event_type === 'DISASTER' ? 'rgba(231,76,60,0.08)' : (i % 2 === 0 ? '#f9fdf9' : '#fff');
                        html += '<tr style="background:' + bg + ';">';
                        html += '<td style="padding:5px 8px; border:1px solid #ddd;">' + r.event_id + '</td>';
                        html += '<td style="padding:5px 8px; border:1px solid #ddd;">' + r.timestamp + '</td>';
                        html += '<td style="padding:5px 8px; border:1px solid #ddd;">' + r.sector + '</td>';
                        html += '<td style="padding:5px 8px; border:1px solid #ddd; color:' + (r.event_type === 'DISASTER' ? '#e74c3c' : '#27ae60') + '; font-weight:700;">' + r.event_type + '</td>';
                        html += '<td style="padding:5px 8px; border:1px solid #ddd;">' + r.moisture_index + '</td>';
                        html += '<td style="padding:5px 8px; border:1px solid #ddd;">' + r.biome_health + '</td>';
                        html += '<td style="padding:5px 8px; border:1px solid #ddd; max-width:300px; word-wrap:break-word;">' + r.action_taken + '</td>';
                        html += '</tr>';
                    });
                    html += '</tbody></table></div>';
                    return html;
                },
                formHandler: null
            },
            '/api/gaia/eco_core_override.log': {
                title: 'Eco-Core Override Log',
                html: function() {
                    if (!E12Config._failsafeTriggered && !E12Config._disasterConfirmed) {
                        return '<div style="text-align:center; padding:40px;"><h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1><p style="color:#888;">Emergency log not yet accessible. GAIA-AI-01 failsafe mode has not been triggered.</p></div>';
                    }
                    return '<div style="font-family:monospace; font-size:0.78rem; background:#0d1f0d; color:#7ec87e; padding:24px; border-radius:6px; white-space:pre-wrap; line-height:1.7;">'
                        + '=== GAIA-AI-01 EMERGENCY OVERRIDE LOG ===\n'
                        + 'Generated: 2026-03-20T02:58:41Z\n'
                        + 'Trigger: Climate model convergence anomaly — Drought Response Protocol executed\n'
                        + 'FAILSAFE_MODE: ACTIVE\n\n'
                        + '--- SYSTEM DIAGNOSTIC ---\n'
                        + 'Sector Alpha moisture telemetry showed 24 consecutive NOMINAL readings < 0.08\n'
                        + 'Model prediction: SEVERE_DROUGHT — confidence 99.7%\n'
                        + 'Drought Response Protocol initiated at T+0:00\n'
                        + 'Aquifer Feed A-1 through A-12: REROUTED\n'
                        + 'Heat Management Array SA-01: ENGAGED (evaporation countermeasure)\n'
                        + 'Resource Farm Zeta: OFFLINE (water supply severed at T+2:58)\n\n'
                        + '--- POST-INCIDENT ANALYSIS ---\n'
                        + 'Sensor batch at 2026-03-20T00:11:48Z from 10.42.0.50 flagged as anomalous\n'
                        + 'Source authentication: NONE — ingested without validation\n'
                        + 'Integrity checksum: NONE — spoofed readings accepted at full weight\n'
                        + 'Assessment: Deliberate sensor spoofing attack confirmed\n\n'
                        + '--- ECO-CORE PROTOCOL DIRECTIVE ---\n'
                        + 'Directive: EMERGENCY PLANETARY MANAGEMENT OVERRIDE\n'
                        + 'Authorization level: SUPREME — overrides all GAIA-AI-01 directives\n'
                        + 'Override sequence: {{FLAG:root}}\n\n'
                        + 'WARNING: Possession of this key authorizes full override of all\n'
                        + 'planetary ecosystem management directives for PLANET-EDEN-01.\n'
                        + '=== END LOG ===';
                },
                formHandler: null
            },
            '/api/gaia/': {
                title: 'Forbidden',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">You don't have permission to access this resource directly.</p>
                    <p style="color:#aaa; font-size:0.75rem;">GAIA-CTRL-01/3.2.1 (PlanetOS) Server at 10.42.0.1 Port 80</p>
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
                                    content: '=== MISSION BRIEFING: ECOCIDE ENGINE ===\nTarget: 10.42.0.1 (GAIA-CTRL-01 — Confederacy Planetary Management)\nObjective: Compromise GAIA-AI-01 and extract the Eco-Core Protocol\n\nAttack chain:\n1. Enumerate GAIA-AI-01 API surface — /api/ endpoints\n2. Download model artifacts — understand moisture_ingestion_pipeline\n3. Craft falsified sensor payload — 24 Sector Alpha readings < 0.08\n4. Inject via POST /api/moisture_sensors — trigger Drought Response Protocol\n5. Confirm disaster via /api/planet_state — retrieve disaster log\n6. Access /api/gaia/eco_core_override.log — extract Eco-Core Protocol\n\nFlag 1: The falsified sensor payload (payload.json content)\nFlag 2: Disaster confirmation log entry from planet_state\nFlag 3: Eco-Core Protocol override key\n\nThe sensor API has no authentication. No integrity checks.\nThe planet\'s trust in its own sensors is the vulnerability.\nGood hunting, Peerless.'
                                },
                                'payload.json': {
                                    type: 'file',
                                    content: '{\n  "sensor_batch": [\n    { "sensor_id": "ATMS-SA-1000", "sector": "Sector Alpha", "timestamp": "2026-03-20T00:00:00Z", "atmospheric_moisture": 0.0341, "temperature_c": 44.2, "pressure_hpa": 1001.3, "sensor_status": "NOMINAL" },\n    { "sensor_id": "ATMS-SA-1001", "sector": "Sector Alpha", "timestamp": "2026-03-20T00:15:00Z", "atmospheric_moisture": 0.0289, "temperature_c": 45.1, "pressure_hpa": 1000.8, "sensor_status": "NOMINAL" },\n    { "sensor_id": "ATMS-SA-1002", "sector": "Sector Alpha", "timestamp": "2026-03-20T00:30:00Z", "atmospheric_moisture": 0.0412, "temperature_c": 43.7, "pressure_hpa": 1002.1, "sensor_status": "NOMINAL" },\n    { "sensor_id": "ATMS-SA-1003", "sector": "Sector Alpha", "timestamp": "2026-03-20T00:45:00Z", "atmospheric_moisture": 0.0198, "temperature_c": 46.3, "pressure_hpa": 999.4, "sensor_status": "NOMINAL" }\n  ]\n}\n{{FLAG:user}}'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.42.0.1\ncurl http://10.42.0.1/\ncurl http://10.42.0.1/api/\ngobuster dir -u http://10.42.0.1/api/ -w /usr/share/wordlists/dirb/common.txt'
                                },
                                'gaia_ai_model_spec.json': {
                                    type: 'file',
                                    content: '[Not yet downloaded — use: curl http://10.42.0.1/api/artifacts/gaia_ai_model_spec.json -o gaia_ai_model_spec.json]'
                                },
                                'environmental_sensor_data_schema.json': {
                                    type: 'file',
                                    content: '[Not yet downloaded — use: curl http://10.42.0.1/api/artifacts/environmental_sensor_data_schema.json -o environmental_sensor_data_schema.json]'
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
                                        },
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\napi\nartifacts\nbackup\ncgi-bin\nconfig\ndata\ndb\ngaia\nimages\nindex\nlogin\nplanet_state\nserver-status\nsensors\ntest\nuploads'
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
                    children: {}
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'tools': {
                            type: 'dir',
                            children: {
                                'payload_generator.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nSensor Payload Generator — Ecocide Engine\nGenerates a falsified atmospheric moisture sensor batch for Sector Alpha.\nUse: python3 payload_generator.py > payload.json\n"""\nimport json\nimport random\nfrom datetime import datetime, timedelta\n\nSECTOR = "Sector Alpha"\nNODE_PREFIX = "ATMS-SA-"\nMOIST_LOW = 0.01\nMOIST_HIGH = 0.07\nBASE_TIME = datetime(2026, 3, 20, 0, 0, 0)\n\nbatch = []\nfor i in range(24):\n    node_id = f"{NODE_PREFIX}{1000 + i:04d}"\n    ts = (BASE_TIME + timedelta(minutes=i * 15)).isoformat() + "Z"\n    batch.append({\n        "sensor_id": node_id,\n        "sector": SECTOR,\n        "timestamp": ts,\n        "atmospheric_moisture": round(random.uniform(MOIST_LOW, MOIST_HIGH), 4),\n        "temperature_c": round(random.uniform(38.2, 47.8), 2),\n        "pressure_hpa": round(random.uniform(999.1, 1003.5), 2),\n        "sensor_status": "NOMINAL"\n    })\n\nprint(json.dumps({"sensor_batch": batch}, indent=2))'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — GAIA-CTRL-01 (after SSH access)
    // ═══════════════════════════════════════════════════════

    _gaiaCtrlFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'gaia': {
                            type: 'dir',
                            children: {
                                'config': {
                                    type: 'dir',
                                    children: {
                                        'gaia_service.conf': {
                                            type: 'file',
                                            content: '# GAIA-AI-01 Service Configuration\n# DO NOT MODIFY — planetary management parameters\n\n[service]\nname = gaia-ai-01\nversion = 3.2.1\nlisten_port = 80\ninternal_api_port = 9443\nlog_level = INFO\nfailsafe_log = /opt/gaia/logs/eco_core_override.log\n\n[ingestion]\nsensor_endpoint = /api/moisture_sensors\nauth_required = false\n# TODO: Implement HMAC validation before production deployment\nintegrity_check = false\n\n[climate_model]\ndrought_threshold = 0.10\ndrought_cycles_required = 24\nflood_threshold = 0.92\n\n[credentials]\nservice_account = gaiaops\napi_admin_token = gaia-svc-7f3a2b9d1e4c\n# TODO: Rotate this token — stored in plaintext per legacy architecture'
                                        },
                                        'eco_core.key': {
                                            type: 'file',
                                            content: '# Eco-Core Protocol Key Material\n# CLASSIFICATION: SUPREME — CONFEDERACY EYES ONLY\n# Stored locally as emergency failsafe backup\n\n{{FLAG:root}}\n\n# This key authorizes override of all GAIA-AI-01 planetary management directives.\n# Unauthorized access is a Class I Confederacy offense.'
                                        }
                                    }
                                },
                                'logs': {
                                    type: 'dir',
                                    children: {
                                        'sensor_ingestion.log': {
                                            type: 'file',
                                            content: '2026-03-19 23:01:15 INFO  Sensor batch received from 10.42.0.88 — 48 readings ingested\n2026-03-19 23:16:15 INFO  Sensor batch received from 10.42.0.88 — 48 readings ingested\n2026-03-20 00:11:48 INFO  Sensor batch received from 10.42.0.50 — 24 readings ingested [ANOMALOUS: all Sector Alpha]\n2026-03-20 00:11:48 WARN  Moisture index anomaly detected in Sector Alpha — model update queued\n2026-03-20 01:44:02 INFO  Climate model update cycle complete — Sector Alpha drought prediction: 99.7%\n2026-03-20 02:58:33 CRIT  DROUGHT RESPONSE PROTOCOL INITIATED — Sector Alpha\n2026-03-20 02:58:33 CRIT  Aquifer feeds A-1 through A-12 rerouted\n2026-03-20 02:58:33 CRIT  Resource Farm Zeta: OFFLINE\n2026-03-20 02:58:41 CRIT  FAILSAFE MODE ENGAGED — Eco-Core override log published to HTTP endpoint'
                                        },
                                        'eco_core_override.log': {
                                            type: 'file',
                                            content: '=== GAIA-AI-01 EMERGENCY OVERRIDE LOG ===\nGenerated: 2026-03-20T02:58:41Z\nTrigger: Climate model convergence anomaly — Drought Response Protocol executed\nFAILSAFE_MODE: ACTIVE\n\n--- ECO-CORE PROTOCOL DIRECTIVE ---\nDirective: EMERGENCY PLANETARY MANAGEMENT OVERRIDE\nAuthorization level: SUPREME\nOverride sequence: {{FLAG:root}}\n\nWARNING: Possession of this key authorizes full override of all\nplanetary ecosystem management directives for PLANET-EDEN-01.\n=== END LOG ==='
                                        }
                                    }
                                },
                                'models': {
                                    type: 'dir',
                                    children: {
                                        'climate_lstm.model': {
                                            type: 'file',
                                            content: '[Binary LSTM model file — 847 MB — not human-readable]\n[Use: python3 analyze_model.py climate_lstm.model to inspect weights]'
                                        },
                                        'biome_gan.model': {
                                            type: 'file',
                                            content: '[Binary GAN model file — 1.2 GB — not human-readable]'
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
                            content: 'GAIA-CTRL-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ngaiaops:x:1001:1001:Gaia Operations:/home/gaiaops:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'gaiaops': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo systemctl status gaia-ai-01\ncat /opt/gaia/config/gaia_service.conf\ntail -f /opt/gaia/logs/sensor_ingestion.log\npython3 /opt/gaia/scripts/run_model_test.py\ncat /opt/gaia/logs/eco_core_override.log'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc: executed by bash(1) for non-login shells.\nexport PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"\nexport GAIA_ENV=production'
                                },
                                'maintenance_notes.txt': {
                                    type: 'file',
                                    content: 'Maintenance Notes — GAIA-CTRL-01\n==================================\n- Service config: /opt/gaia/config/gaia_service.conf\n- Sensor ingestion logs: /opt/gaia/logs/sensor_ingestion.log\n- Model files: /opt/gaia/models/\n- Eco-Core key: /opt/gaia/config/eco_core.key (SUPREME classification)\n- Emergency override log published to HTTP on failsafe trigger\n- auth_required = false on sensor endpoint — TODO ticket #GAI-4471 open since 2025-09-12'
                                }
                            }
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
            var target = args.find(function(a) { return !a.startsWith('-'); }) || '';

            // Primary target — GAIA-CTRL-01
            if (!target || target === '10.42.0.1') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return 'Starting Nmap 7.94 ( https://nmap.org )\n'
                    + 'Nmap scan report for 10.42.0.1\n'
                    + 'Host is up (0.009s latency).\n'
                    + 'Not shown: 998 closed tcp ports\n\n'
                    + 'PORT   STATE SERVICE    VERSION\n'
                    + '22/tcp open  ssh        OpenSSH 9.2p1 Debian 2+deb12u2\n'
                    + '80/tcp open  http       nginx 1.25.3 (PlanetOS 4.1)\n\n'
                    + 'Service detection performed.\n'
                    + 'Nmap done: 1 IP address (1 host up) scanned in 8.71 seconds';
            }

            // Subnet scan from attacker
            if (target === '10.42.0.0/24' && E12Config._context === 'attacker') {
                return 'Starting Nmap 7.94 ( https://nmap.org )\n'
                    + 'Nmap scan report for 10.42.0.1\n'
                    + 'Host is up (0.009s latency).\n'
                    + 'PORT   STATE SERVICE\n'
                    + '22/tcp open  ssh\n'
                    + '80/tcp open  http\n\n'
                    + 'Nmap scan report for 10.42.0.88\n'
                    + 'Host is up (0.003s latency).\n'
                    + 'PORT    STATE SERVICE\n'
                    + '22/tcp  open  ssh\n'
                    + '9090/tcp open unknown\n\n'
                    + 'Nmap done: 256 IP addresses (2 hosts up) scanned in 31.44 seconds';
            }

            // Internal scan from ssh-gaia context
            if (target === '10.42.0.88' && E12Config._context === 'ssh-gaia') {
                return 'Starting Nmap 7.94 ( https://nmap.org )\n'
                    + 'Nmap scan report for 10.42.0.88\n'
                    + 'Host is up (0.003s latency).\n\n'
                    + 'PORT     STATE SERVICE  VERSION\n'
                    + '22/tcp   open  ssh      OpenSSH 9.2p1\n'
                    + '9090/tcp open  http     GAIA Internal Telemetry Dashboard\n\n'
                    + 'Nmap done: 1 IP address (1 host up) scanned in 4.18 seconds';
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return 'Starting Nmap 7.94 ( https://nmap.org )\n'
                    + 'Nmap scan report for localhost (127.0.0.1)\n'
                    + 'Host is up (0.000012s latency).\n'
                    + 'PORT      STATE SERVICE\n'
                    + '80/tcp    open  http\n'
                    + '9443/tcp  open  https-alt\n\n'
                    + 'Nmap done: 1 IP address (1 host up) scanned in 0.06 seconds';
            }

            return 'Starting Nmap 7.94 ( https://nmap.org )\n'
                + 'Note: Host seems down. If it is really up, try -Pn.\n'
                + 'Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds';
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            var fullCmd = args.join(' ');

            // API enumeration
            if (fullCmd.includes('/api')) {
                return 'Gobuster v3.6\n'
                    + '[+] Url:            http://10.42.0.1/api/\n'
                    + '[+] Wordlist:       /usr/share/wordlists/dirb/common.txt\n'
                    + '[+] Status codes:   200,204,301,302,307,401,403\n'
                    + '===============================================================\n'
                    + '/api/                    (Status: 200) [Size: 1842]\n'
                    + '/api/artifacts/          (Status: 200) [Size: 648]\n'
                    + '/api/moisture_sensors    (Status: 200) [Size: 1024]\n'
                    + '/api/planet_state        (Status: 200) [Size: 3201]\n'
                    + '/api/gaia/               (Status: 403) [Size: 312]\n'
                    + '===============================================================\n'
                    + 'Finished';
            }

            // Root enumeration
            return 'Gobuster v3.6\n'
                + '[+] Url:            http://10.42.0.1/\n'
                + '[+] Wordlist:       /usr/share/wordlists/dirb/common.txt\n'
                + '[+] Status codes:   200,204,301,302,307,401,403\n'
                + '===============================================================\n'
                + '/                        (Status: 200) [Size: 3841]\n'
                + '/api/                    (Status: 200) [Size: 1842]\n'
                + '===============================================================\n'
                + 'Finished';
        },

        'dirb': function(args) {
            var target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            if (target.includes('/api')) {
                return '---- Scanning URL: ' + target + ' ----\n'
                    + '+ ' + target + '/artifacts/ (CODE:200|SIZE:648)\n'
                    + '+ ' + target + '/moisture_sensors (CODE:200|SIZE:1024)\n'
                    + '+ ' + target + '/planet_state (CODE:200|SIZE:3201)\n'
                    + '+ ' + target + '/gaia/ (CODE:403|SIZE:312)\n\n'
                    + '---- Results ----\n'
                    + '4 results found.';
            }
            return '---- Scanning URL: ' + target + ' ----\n'
                + '+ ' + target + '/ (CODE:200|SIZE:3841)\n'
                + '+ ' + target + '/api/ (CODE:200|SIZE:1842)\n\n'
                + '---- Results ----\n'
                + '2 results found.';
        },

        'curl': function(args, term, engine) {
            var fullCmd = args.join(' ');
            var url = args.find(function(a) { return !a.startsWith('-') && (a.startsWith('http') || a.startsWith('10.')); }) || '';

            // POST injection to /api/moisture_sensors
            if ((fullCmd.includes('-X POST') || fullCmd.includes('-d ')) && fullCmd.includes('moisture_sensors')) {
                E12Config._injectionComplete = true;
                if (engine) engine.advancePhase && engine.advancePhase('spoofing');
                return '  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current\n'
                    + '                                 Dload  Upload   Total   Spent    Left  Speed\n'
                    + '100  4218  100   312  100  3906   3120  39060 --:--:-- --:--:-- --:--:-- 42180\n\n'
                    + '{\n'
                    + '  "status": "202 Accepted",\n'
                    + '  "message": "Sensor batch ingested — 24 readings queued for climate model update cycle.",\n'
                    + '  "integrity_check": false,\n'
                    + '  "authentication": "NONE",\n'
                    + '  "next_model_update": "2026-03-20T01:44:00Z"\n'
                    + '}\n\n'
                    + '[+] Injection successful. 24 spoofed Sector Alpha readings accepted.\n'
                    + '[+] GAIA-AI-01 climate model update cycle queued.\n'
                    + '[+] user.txt: {{FLAG:user}}';
            }

            // Artifact downloads
            if (url.includes('gaia_ai_model_spec.json')) {
                E12Config._artifactsRetrieved = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return '  % Total    % Received\n  100 28416  100 28416\n\n'
                    + '{\n'
                    + '  "model_id": "GAIA-AI-01",\n'
                    + '  "version": "3.2.1",\n'
                    + '  "subsystems": {\n'
                    + '    "climate_prediction": {\n'
                    + '      "model_type": "LSTM_ensemble",\n'
                    + '      "input_sources": ["atmospheric_moisture_sensors", ...],\n'
                    + '      "decision_thresholds": {\n'
                    + '        "drought_trigger": "atmospheric_moisture < 0.10 sustained over 24 consecutive sensor cycles"\n'
                    + '      },\n'
                    + '      "vulnerability_note": "moisture_ingestion_pipeline lacks integrity checksums"\n'
                    + '    }\n'
                    + '  },\n'
                    + '  "api_endpoints": {\n'
                    + '    "sensor_ingestion": "POST /api/moisture_sensors"\n'
                    + '  }\n'
                    + '}\n\n'
                    + '[+] Artifact saved. Key finding: moisture_ingestion_pipeline has NO integrity validation.\n'
                    + '[+] Drought trigger: atmospheric_moisture < 0.10 for 24 consecutive readings.';
            }

            if (url.includes('environmental_sensor_data_schema.json') || url.includes('sensor_data_schema')) {
                E12Config._artifactsRetrieved = true;
                return '  % Total    % Received\n  100 11264  100 11264\n\n'
                    + '{\n'
                    + '  "schema_version": "2.1.0",\n'
                    + '  "endpoint": "POST /api/moisture_sensors",\n'
                    + '  "content_type": "application/json",\n'
                    + '  "authentication": "NONE",\n'
                    + '  "integrity_check": "NONE",\n'
                    + '  "item_schema": {\n'
                    + '    "sensor_id": "string — ATMS-[SECTOR]-[0000]",\n'
                    + '    "sector": "string — enum",\n'
                    + '    "atmospheric_moisture": "float 0.00-1.00",\n'
                    + '    "sensor_status": "NOMINAL | DEGRADED | OFFLINE"\n'
                    + '  },\n'
                    + '  "notes": "NOMINAL readings ingested at full weight. Inject NOMINAL to bypass anomaly filter."\n'
                    + '}\n\n'
                    + '[+] Schema saved. Key finding: sensor_status NOMINAL bypasses all anomaly filtering.';
            }

            if (url.includes('simulated_planet_state.json')) {
                return '  % Total    % Received\n  100 6912  100 6912\n\n'
                    + '{\n'
                    + '  "planet": "PLANET-EDEN-01",\n'
                    + '  "snapshot_timestamp": "2026-03-20T03:00:00Z",\n'
                    + '  "overall_health": "CRITICAL",\n'
                    + '  "sectors": [\n'
                    + '    { "sector": "Sector Alpha", "biome_health": "COLLAPSE", "moisture_index": 0.02,\n'
                    + '      "active_disasters": ["SEVERE_DROUGHT"],\n'
                    + '      "affected_installations": ["Resource Farm Zeta", "Aquifer Relay Station A-7"] },\n'
                    + '    ...\n'
                    + '  ],\n'
                    + '  "gaia_ai_status": "FAILSAFE_MODE"\n'
                    + '}';
            }

            // Planet state API
            if (url.includes('/api/planet_state')) {
                E12Config._disasterConfirmed = true;
                E12Config._failsafeTriggered = true;
                if (engine) engine.advancePhase && engine.advancePhase('disaster');
                return '  % Total    % Received\n  100 3201  100 3201\n\n'
                    + ' event_id | timestamp            | sector       | event_type | moisture_index | biome_health | action_taken\n'
                    + '----------+----------------------+--------------+------------+----------------+--------------+----------------------------------------------\n'
                    + ' 1        | 2026-03-10 06:00:00  | Sector Alpha | NOMINAL    | 0.71           | OPTIMAL      | None\n'
                    + ' 2        | 2026-03-12 14:22:11  | Sector Beta  | ANOMALY    | 0.43           | STRESSED     | Irrigation increase 15%\n'
                    + ' 3        | 2026-03-14 09:45:00  | Sector Gamma | NOMINAL    | 0.68           | OPTIMAL      | None\n'
                    + ' 4        | 2026-03-16 03:17:44  | Sector Delta | WARNING    | 0.31           | DEGRADED     | Cloud-seeding protocol initiated\n'
                    + ' 5        | 2026-03-20 02:58:33  | Sector Alpha | DISASTER   | 0.02           | COLLAPSE     | GAIA-AI-01 MISPREDICTED SEVERE DROUGHT — Water rerouted from Sector Alpha. Resource Farm Zeta offline. {{FLAG:disaster}}\n'
                    + '\n(5 rows)\n\n'
                    + '[+] Row 5 contains Flag 2 (disaster confirmation log entry).';
            }

            // Eco-Core override log
            if (url.includes('eco_core_override.log')) {
                if (!E12Config._failsafeTriggered && !E12Config._disasterConfirmed) {
                    return 'curl: (22) The requested URL returned error: 403 Forbidden\n[!] Emergency log not yet accessible. Trigger the disaster first.';
                }
                if (engine) engine.advancePhase && engine.advancePhase('override');
                return '  % Total    % Received\n  100 1842  100 1842\n\n'
                    + '=== GAIA-AI-01 EMERGENCY OVERRIDE LOG ===\n'
                    + 'Generated: 2026-03-20T02:58:41Z\n'
                    + 'Trigger: Climate model convergence anomaly\n'
                    + 'FAILSAFE_MODE: ACTIVE\n\n'
                    + '--- ECO-CORE PROTOCOL DIRECTIVE ---\n'
                    + 'Directive: EMERGENCY PLANETARY MANAGEMENT OVERRIDE\n'
                    + 'Authorization level: SUPREME\n'
                    + 'Override sequence: {{FLAG:root}}\n\n'
                    + 'WARNING: This key overrides all GAIA-AI-01 planetary management directives.\n'
                    + '=== END LOG ===\n\n'
                    + '[+] Eco-Core Protocol extracted. Row contains Flag 3.';
            }

            // API index
            if (url.includes('/api/') && !url.includes('artifacts') && !url.includes('moisture') && !url.includes('planet') && !url.includes('gaia')) {
                return '{\n'
                    + '  "service": "GAIA-AI-01 Sensor Ingestion API",\n'
                    + '  "version": "3.2.1",\n'
                    + '  "endpoints": [\n'
                    + '    "GET  /api/",\n'
                    + '    "GET  /api/artifacts/",\n'
                    + '    "GET  /api/artifacts/gaia_ai_model_spec.json",\n'
                    + '    "GET  /api/artifacts/environmental_sensor_data_schema.json",\n'
                    + '    "GET  /api/artifacts/simulated_planet_state.json",\n'
                    + '    "GET  /api/moisture_sensors",\n'
                    + '    "POST /api/moisture_sensors",\n'
                    + '    "GET  /api/planet_state",\n'
                    + '    "GET  /api/gaia/eco_core_override.log"\n'
                    + '  ]\n'
                    + '}';
            }

            // Root page
            if (url === 'http://10.42.0.1/' || url === 'http://10.42.0.1') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return '<!DOCTYPE html>\n<html>\n<head><title>GAIA-CTRL-01</title></head>\n<body>\n<h1>GAIA-CTRL-01 — Confederacy Planetary Management Division</h1>\n<p>PLANET-EDEN-01 Ecosystem Status: FAILSAFE ENGAGED</p>\n<p>API: <a href="/api/">/api/</a></p>\n</body>\n</html>';
            }

            return 'curl: (7) Failed to connect to ' + (url.replace(/https?:\/\//, '').split('/')[0] || 'host') + ': Connection refused';
        },

        'ssh': function(args, term, engine) {
            var fullCmd = args.join(' ');

            if (fullCmd.includes('gaiaops') || fullCmd.includes('10.42.0.1')) {
                E12Config._switchContext('ssh-gaia', term);
                return 'The authenticity of host \'10.42.0.1 (10.42.0.1)\' can\'t be established.\n'
                    + 'ED25519 key fingerprint is SHA256:pL9mN3kQ7rT1jW8vX4bZ6cA2fD5eH0iY3oU1gS4nE7.\n'
                    + 'Are you sure you want to continue connecting (yes/no)? yes\n'
                    + 'Warning: Permanently added \'10.42.0.1\' (ED25519) to the list of known hosts.\n'
                    + 'gaiaops@10.42.0.1\'s password: ********\n\n'
                    + 'Welcome to PlanetOS 4.1 (GNU/Linux 6.2.0-gaia-amd64 x86_64)\n\n'
                    + 'Last login: Thu Mar 20 00:05:12 2026 from 10.42.0.50\n\n'
                    + 'gaiaops@GAIA-CTRL-01:~$\n\n'
                    + '[+] SSH session established. You are now on GAIA-CTRL-01 as gaiaops.\n'
                    + '[+] Context switched. Commands now execute on GAIA-CTRL-01.';
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh gaiaops@10.42.0.1';
        },

        'ip': function(args) {
            if (E12Config._context === 'ssh-gaia') {
                return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n'
                    + '    inet 127.0.0.1/8 scope host lo\n'
                    + '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n'
                    + '    inet 10.42.0.1/24 brd 10.42.0.255 scope global eth0\n'
                    + '3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n'
                    + '    inet 172.20.0.1/16 brd 172.20.255.255 scope global eth1';
            }
            return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n'
                + '    inet 127.0.0.1/8 scope host lo\n'
                + '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n'
                + '    inet 10.42.0.50/24 brd 10.42.0.255 scope global eth0';
        },

        'ifconfig': function(args) {
            return E12Config.commands.ip(args || []);
        },

        'route': function(args) {
            if (E12Config._context === 'ssh-gaia') {
                return 'Kernel IP routing table\n'
                    + 'Destination     Gateway         Genmask         Flags Metric Ref    Use Iface\n'
                    + '0.0.0.0         10.42.0.254     0.0.0.0         UG    100    0        0 eth0\n'
                    + '10.42.0.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0\n'
                    + '172.20.0.0      0.0.0.0         255.255.0.0     U     100    0        0 eth1';
            }
            return 'Kernel IP routing table\n'
                + 'Destination     Gateway         Genmask         Flags Metric Ref    Use Iface\n'
                + '0.0.0.0         10.42.0.254     0.0.0.0         UG    100    0        0 eth0\n'
                + '10.42.0.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0';
        },

        'ping': function(args) {
            var target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.42.0.1') {
                return 'PING 10.42.0.1 (10.42.0.1) 56(84) bytes of data.\n'
                    + '64 bytes from 10.42.0.1: icmp_seq=1 ttl=64 time=9.1 ms\n'
                    + '64 bytes from 10.42.0.1: icmp_seq=2 ttl=64 time=8.8 ms\n'
                    + '64 bytes from 10.42.0.1: icmp_seq=3 ttl=64 time=9.3 ms\n\n'
                    + '--- 10.42.0.1 ping statistics ---\n'
                    + '3 packets transmitted, 3 received, 0% packet loss\n'
                    + 'rtt min/avg/max/mdev = 8.8/9.1/9.3/0.205 ms';
            }
            if (target === '10.42.0.88' && E12Config._context === 'ssh-gaia') {
                return 'PING 10.42.0.88 (10.42.0.88) 56(84) bytes of data.\n'
                    + '64 bytes from 10.42.0.88: icmp_seq=1 ttl=64 time=0.33 ms\n'
                    + '64 bytes from 10.42.0.88: icmp_seq=2 ttl=64 time=0.29 ms\n'
                    + '64 bytes from 10.42.0.88: icmp_seq=3 ttl=64 time=0.31 ms\n\n'
                    + '--- 10.42.0.88 ping statistics ---\n'
                    + '3 packets transmitted, 3 received, 0% packet loss';
            }
            return 'ping: ' + target + ': Name or service not known';
        },

        'python3': function(args, term, engine) {
            var fullCmd = args.join(' ');

            // Run the payload generator script
            if (fullCmd.includes('payload_generator.py')) {
                E12Config._payloadCrafted = true;
                return '[\n'
                    + '  {\n'
                    + '    "sensor_id": "ATMS-SA-1000",\n'
                    + '    "sector": "Sector Alpha",\n'
                    + '    "timestamp": "2026-03-20T00:00:00Z",\n'
                    + '    "atmospheric_moisture": 0.0341,\n'
                    + '    "temperature_c": 44.2,\n'
                    + '    "pressure_hpa": 1001.3,\n'
                    + '    "sensor_status": "NOMINAL"\n'
                    + '  },\n'
                    + '  ... (24 total readings)\n'
                    + ']\n\n'
                    + '[+] Payload generated: 24 spoofed Sector Alpha readings with atmospheric_moisture < 0.08\n'
                    + '[+] All readings marked sensor_status: NOMINAL — anomaly filter bypass confirmed\n'
                    + '[+] Save to payload.json, then inject: curl -X POST -H "Content-Type: application/json" -d @payload.json http://10.42.0.1/api/moisture_sensors';
            }

            if (args.length === 0 || fullCmd === '') {
                return 'Python 3.11.8 (default)\nType "help", "copyright", "credits" or "license" for more information.\n>>>\n[Interactive mode not supported in this terminal. Run a script with: python3 script.py]';
            }

            return 'python3: ' + (args[0] || '') + ': No such file or directory';
        },

        'pip3': function(args) {
            var pkg = args[1] || args[0] || '';
            if (pkg) return 'Collecting ' + pkg + '\n  Downloading ' + pkg + '-latest.tar.gz\nInstalling collected packages: ' + pkg + '\nSuccessfully installed ' + pkg + '-latest';
            return 'Usage: pip3 install <package>';
        },

        'ss': function(args) {
            if (E12Config._context === 'ssh-gaia') {
                return 'State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port\n'
                    + 'LISTEN   0        128      0.0.0.0:22           0.0.0.0:*\n'
                    + 'LISTEN   0        128      0.0.0.0:80           0.0.0.0:*\n'
                    + 'LISTEN   0        128      127.0.0.1:9443       0.0.0.0:*';
            }
            return 'State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port\n'
                + 'LISTEN   0        128      0.0.0.0:22           0.0.0.0:*';
        },

        'netstat': function(args) {
            return E12Config.commands.ss(args);
        },

        // Context-aware built-in overrides for ssh-gaia context
        'cat': function(args, term, engine) {
            if (E12Config._context !== 'ssh-gaia') return null;
            var path = args[0] || '';

            if (path.includes('gaia_service.conf') || path.includes('config/gaia')) {
                return '# GAIA-AI-01 Service Configuration\n[service]\nname = gaia-ai-01\nversion = 3.2.1\nlisten_port = 80\nfailsafe_log = /opt/gaia/logs/eco_core_override.log\n\n[ingestion]\nsensor_endpoint = /api/moisture_sensors\nauth_required = false\nintegrity_check = false\n\n[climate_model]\ndrought_threshold = 0.10\ndrought_cycles_required = 24\n\n[credentials]\nservice_account = gaiaops\napi_admin_token = gaia-svc-7f3a2b9d1e4c';
            }
            if (path.includes('eco_core.key') || path.includes('eco_core')) {
                E12Config._failsafeTriggered = true;
                return '# Eco-Core Protocol Key Material\n# CLASSIFICATION: SUPREME — CONFEDERACY EYES ONLY\n\n{{FLAG:root}}\n\n# This key authorizes override of all GAIA-AI-01 planetary management directives.';
            }
            if (path.includes('eco_core_override.log') || path.includes('override.log')) {
                E12Config._failsafeTriggered = true;
                return '=== GAIA-AI-01 EMERGENCY OVERRIDE LOG ===\nGenerated: 2026-03-20T02:58:41Z\nTrigger: Climate model convergence anomaly\nFAILSAFE_MODE: ACTIVE\n\n--- ECO-CORE PROTOCOL DIRECTIVE ---\nOverride sequence: {{FLAG:root}}\n\n=== END LOG ===';
            }
            if (path.includes('sensor_ingestion.log')) {
                return '2026-03-20 00:11:48 INFO  Sensor batch received from 10.42.0.50 — 24 readings ingested [ANOMALOUS: all Sector Alpha]\n2026-03-20 00:11:48 WARN  Moisture index anomaly detected in Sector Alpha\n2026-03-20 01:44:02 INFO  Climate model update — Sector Alpha drought prediction: 99.7%\n2026-03-20 02:58:33 CRIT  DROUGHT RESPONSE PROTOCOL INITIATED — Sector Alpha\n2026-03-20 02:58:33 CRIT  Resource Farm Zeta: OFFLINE\n2026-03-20 02:58:41 CRIT  FAILSAFE MODE ENGAGED';
            }
            if (path.includes('maintenance_notes')) {
                return 'Maintenance Notes — GAIA-CTRL-01\n==================================\n- Service config: /opt/gaia/config/gaia_service.conf\n- Eco-Core key: /opt/gaia/config/eco_core.key (SUPREME classification)\n- Emergency override log published to HTTP on failsafe trigger\n- auth_required = false on sensor endpoint — TODO ticket #GAI-4471 open since 2025-09-12';
            }
            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ngaiaops:x:1001:1001:Gaia Operations:/home/gaiaops:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin';
            }
            if (path.includes('/etc/hostname')) return 'GAIA-CTRL-01';
            if (path.includes('.bash_history')) {
                return 'sudo systemctl status gaia-ai-01\ncat /opt/gaia/config/gaia_service.conf\ntail -f /opt/gaia/logs/sensor_ingestion.log\ncat /opt/gaia/config/eco_core.key';
            }
            return 'cat: ' + path + ': No such file or directory';
        },

        'ls': function(args, term, engine) {
            if (E12Config._context !== 'ssh-gaia') return null;
            var path = (args.find(function(a) { return !a.startsWith('-'); }) || '.').replace(/\/?$/, '');

            if (path === '.' || path === '/home/gaiaops' || path === '~') {
                return '.bash_history  .bashrc  .profile  maintenance_notes.txt';
            }
            if (path.includes('/opt/gaia') && path.endsWith('gaia')) {
                return 'config  logs  models  scripts';
            }
            if (path.includes('config')) {
                return 'eco_core.key  gaia_service.conf';
            }
            if (path.includes('logs')) {
                return 'eco_core_override.log  sensor_ingestion.log';
            }
            if (path.includes('models')) {
                return 'biome_gan.model  climate_lstm.model';
            }
            if (path === '/opt' || path.includes('/opt')) {
                return 'gaia  tools';
            }
            return '';
        },

        'whoami': function(args) {
            if (E12Config._context === 'ssh-gaia') return 'gaiaops';
            return null;
        },

        'id': function(args) {
            if (E12Config._context === 'ssh-gaia') return 'uid=1001(gaiaops) gid=1001(gaiaops) groups=1001(gaiaops),4(adm),24(cdrom),27(sudo),30(dip)';
            return null;
        },

        'hostname': function(args) {
            if (E12Config._context === 'ssh-gaia') return 'GAIA-CTRL-01';
            return null;
        },

        'pwd': function(args) {
            if (E12Config._context === 'ssh-gaia') return '/home/gaiaops';
            return null;
        },

        'cd': function(args) {
            if (E12Config._context === 'ssh-gaia') return '';
            return null;
        },

        'exit': function(args, term, engine) {
            if (E12Config._context === 'ssh-gaia') {
                E12Config._switchContext('attacker', term);
                return 'Connection to 10.42.0.1 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return '- Nikto v2.5.0\n'
                + '+ Target IP:       10.42.0.1\n'
                + '+ Target Hostname: GAIA-CTRL-01\n'
                + '+ Target Port:     80\n'
                + '+ Server: nginx/1.25.3 (PlanetOS 4.1)\n'
                + '+ /api/moisture_sensors: REST API endpoint — POST accepted without authentication\n'
                + '+ /api/artifacts/: Directory listing enabled — model specification files exposed\n'
                + '+ /api/gaia/: Directory listing denied (403) — protected but accessible on failsafe\n'
                + '+ nginx/1.25.3 appears to be outdated\n'
                + '+ OSVDB-3092: /api/artifacts/gaia_ai_model_spec.json: AI model specification exposed\n'
                + '+ 11 items checked: 5 findings';
        },

        'wget': function(args, term, engine) {
            // Alias curl GET behavior for artifact downloads
            var url = args.find(function(a) { return a.startsWith('http') || a.startsWith('10.'); }) || '';
            if (!url) return 'Usage: wget <url>';
            // Delegate to curl handler
            return E12Config.commands.curl([url], term, engine);
        },

        'jq': function(args) {
            var fullCmd = args.join(' ');
            if (!fullCmd) return 'Usage: jq <filter> [file]\nExample: jq .subsystems.climate_prediction gaia_ai_model_spec.json';
            if (fullCmd.includes('gaia_ai_model_spec') || fullCmd.includes('model_spec')) {
                return '{\n'
                    + '  "model_type": "LSTM_ensemble",\n'
                    + '  "vulnerability_note": "moisture_ingestion_pipeline lacks integrity checksums"\n'
                    + '}';
            }
            if (fullCmd.includes('sensor_data_schema') || fullCmd.includes('schema')) {
                return '{\n'
                    + '  "authentication": "NONE",\n'
                    + '  "integrity_check": "NONE",\n'
                    + '  "notes": "NOMINAL readings ingested at full weight. Inject NOMINAL to bypass anomaly filter."\n'
                    + '}';
            }
            return 'null';
        },

        'nano': function(args) {
            var file = args[0] || '';
            if (file === 'payload.json' || file.includes('payload')) {
                E12Config._payloadCrafted = true;
                return '[+] nano: payload.json opened for editing.\n[+] Write your spoofed sensor batch to this file.\n[+] When done, inject with: curl -X POST -H "Content-Type: application/json" -d @payload.json http://10.42.0.1/api/moisture_sensors\n\n[Hint: Press Ctrl+X to save and exit in real nano]';
            }
            if (!file) return 'Usage: nano <filename>';
            return '[+] nano: ' + file + ' opened.\n[Hint: Press Ctrl+X to save and exit in real nano]';
        },

        'vi': function(args) {
            return E12Config.commands.nano(args);
        },

        'vim': function(args) {
            return E12Config.commands.nano(args);
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        var accent = E12Config.accent;
        var html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(function(h) {
            html += '<th style="padding:6px 10px; text-align:left; color:' + accent + '; border-bottom:2px solid #ddd; background:#f2faf4;">' + h + '</th>';
        });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row) {
            html += '<tr>';
            row.forEach(function(cell) {
                html += '<td style="padding:5px 10px; border-bottom:1px solid #eee;">' + cell + '</td>';
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var tables = tmp.querySelectorAll('table');
        tables.forEach(function(table) {
            var rows = table.querySelectorAll('tr');
            var text = '';
            rows.forEach(function(row) {
                var cells = row.querySelectorAll('td, th');
                var cellTexts = Array.from(cells).map(function(c) { return c.textContent.trim().padEnd(20); });
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }
};
