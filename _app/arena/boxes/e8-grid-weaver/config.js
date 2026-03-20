/* ============================================================
   CTF ARENA — Box E8: The Grid Weaver
   Expert Campaign | AI-Driven Cyber-Physical System Hacking
   Config: AGM model analysis, sensor spoofing, demand injection, brownout
   ============================================================ */

const E8Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Grid Weaver',
    subtitle: 'Holistic Ecosystem Warfare — AI-Driven Cyber-Physical System Hacking',
    difficulty: 'Expert',
    accent: '#f39c12',
    storageKey: 'hexworth_ctf_e8',
    registryId: 'e8-grid-weaver',
    trackerKey: 'ctf_e8',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'analysis',
            name: 'Model Analysis',
            icon: '\uD83D\uDD2C',
            description: 'Retrieve and analyze AGM-POWER-01 predictive model specifications. Map input features, output routing decisions, and the demand forecast pipeline.',
            requiredFlags: [],
            mitre: ['T1591', 'T1590.005', 'T1046'],
            unlocks: ['vuln_id'],
            locked: false
        },
        {
            id: 'vuln_id',
            name: 'Vulnerability Identification',
            icon: '\uD83D\uDD0D',
            description: 'Identify the sensor data ingestion flaw and model bias. Discover the unauthenticated /api/demand_forecast endpoint lacking input validation.',
            requiredFlags: [],
            mitre: ['T1592.002', 'T1195.002', 'T1190'],
            unlocks: ['crafting'],
            locked: true
        },
        {
            id: 'crafting',
            name: 'Data Fabrication',
            icon: '\uD83E\uDDF0',
            description: 'Craft a falsified demand forecast JSON payload that mimics peak load signatures for Sector Gamma during off-peak hours, exploiting the model\'s bias.',
            requiredFlags: ['user'],
            mitre: ['T1565.001', 'T1565.002', 'T1036'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Data Injection',
            icon: '\uD83D\uDC89',
            description: 'Inject the falsified demand forecast into AGM-POWER-01\'s input pipeline via /api/demand_forecast. Force the AI to initiate preemptive load shedding in Sector Gamma.',
            requiredFlags: ['brownout'],
            mitre: ['T1565.003', 'T1190', 'T1059.006'],
            unlocks: ['override'],
            locked: true
        },
        {
            id: 'override',
            name: 'Grid Override Retrieval',
            icon: '\uD83D\uDD11',
            description: 'Access the internal AGM control log at /api/agm/override_keys.log. Retrieve the Grid Override Key — master manual control credential for POWER-GRID-ALPHA.',
            requiredFlags: ['root'],
            mitre: ['T1552.001', 'T1005', 'T1567'],
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
                title: 'Retrieve the AGM model specification',
                tip: 'Open the Terminal and run: curl http://10.20.0.50/api/agm/model_spec — review input features and output decision schema.',
                trigger: { event: 'command', match: { cmd: 'contains:model_spec' } }
            },
            {
                title: 'Download and inspect the grid schema and current state',
                tip: 'Use curl to fetch /api/grid/schema and /api/grid/state. Identify Sector Gamma load metrics and the demand_forecast_api endpoint in the spec.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:schema' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:grid/state' } }
                    ]
                }
            },
            {
                title: 'Craft the falsified demand forecast payload',
                tip: 'Write a Python script — fabricate_forecast.py — that generates a JSON payload inflating Sector Gamma demand by 340% for the next 4 off-peak hours.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Inject the payload and observe AGM misprediction',
                tip: 'POST the fabricated payload to /api/demand_forecast. Check /api/grid/state for Sector Gamma power reduction — that log entry is Flag 2.',
                trigger: { event: 'flag_correct', match: { flagId: 'brownout' } }
            },
            {
                title: 'Retrieve the Grid Override Key',
                tip: 'Access the override log: curl http://10.20.0.50/api/agm/override_keys.log — the key is embedded in the last entry after AGM enters FAULT_MODE.',
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
            { flagId: 'user',     objective: '2.3', description: 'Given a scenario, apply cybersecurity solutions to the cloud — ICS/SCADA sensor data pipeline analysis and exploit development', skill: 'AI Model Specification Analysis & Vulnerability Identification' },
            { flagId: 'brownout', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — adversarial data injection into ML pipeline causing system misprediction', skill: 'Sensor Spoofing & Demand Forecast Manipulation' },
            { flagId: 'root',     objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — critical infrastructure override key exfiltration', skill: 'Cyber-Physical System Override & Post-Exploitation' },
            { flagId: 'root',     objective: '2.6', description: 'Given a scenario, implement identity and account management controls — AI autonomous system authentication bypass', skill: 'Multi-Stage Critical Infrastructure Attack Chain Completion' }
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
        loginUser: 'kali'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes' },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.20.0.50 (AGM-POWER-01 — Confederacy Grid Authority)\nGrid Zone: POWER-GRID-ALPHA | Sector Gamma is the objective.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',               // 'attacker' | 'agm-api' | 'grid-fault'
    _modelFetched: false,               // true after AGM spec retrieved
    _schemaFetched: false,              // true after power_grid_schema fetched
    _stateFetched: false,               // true after simulated_grid_state fetched
    _payloadCrafted: false,             // true after fabricate_forecast.py executed
    _injectionComplete: false,          // true after POST to /api/demand_forecast
    _brownoutTriggered: false,          // true after AGM enters fault state
    _overrideLogAccessed: false,        // true after override_keys.log retrieved

    _switchContext(ctx, term) {
        E8Config._context = ctx;
        // Adjust terminal prompt to reflect operational context
        if (term && term.config) {
            var prompt = E8Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'kali';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (E8Config._context) {
            case 'agm-api':    return 'kali@kali:~/agm-ops$ ';
            case 'grid-fault': return 'kali@kali:~/agm-ops$ ';
            default: return null; // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AGM DATA MODEL
    // Represents AGM-POWER-01's internal structures as JSON
    // ═══════════════════════════════════════════════════════

    _agm: {
        // AGM predictive model architecture specification
        model_spec: {
            system_id: 'AGM-POWER-01',
            version: '3.4.1',
            model_type: 'Hybrid LSTM-GBM Ensemble',
            description: 'Predictive load balancing AI for POWER-GRID-ALPHA. Consumes sensor telemetry and external demand forecasts to issue routing decisions every 15 minutes.',
            input_features: [
                { name: 'sector_load_mw',        source: 'sensor',   frequency: '60s',  sectors: ['Alpha','Beta','Gamma','Delta','Epsilon'] },
                { name: 'plant_output_mw',        source: 'sensor',   frequency: '60s',  plants: ['COAL-01','GAS-PEAKER-02','HYDRO-03','SOLAR-04'] },
                { name: 'transmission_loss_pct',  source: 'sensor',   frequency: '300s', lines: ['LINE-A1','LINE-B2','LINE-C3','LINE-D4'] },
                { name: 'demand_forecast_24h',    source: 'external', frequency: '900s', endpoint: '/api/demand_forecast', auth: 'none' },
                { name: 'weather_temp_c',         source: 'external', frequency: '1800s',endpoint: '/api/weather_feed' },
                { name: 'historical_baseline',    source: 'internal', frequency: 'static', note: 'Rolling 90-day average by sector and hour' }
            ],
            output_decisions: [
                { decision: 'REROUTE_SECTOR', description: 'Redirect load from overloaded sector to adjacent sector' },
                { decision: 'SHED_LOAD',       description: 'Preemptive load shedding to prevent cascade failure' },
                { decision: 'DISPATCH_PEAKER', description: 'Bring GAS-PEAKER-02 online within 8 minutes' },
                { decision: 'IDLE_PLANT',      description: 'Reduce plant output in anticipation of demand drop' },
                { decision: 'BROWNOUT_SECTOR', description: 'Controlled voltage reduction for targeted sector' }
            ],
            known_bias: 'Model over-weights the demand_forecast_24h signal relative to live sensor readings during off-peak hours (02:00-06:00). A 3x+ spike in forecast demand for any single sector during this window causes immediate SHED_LOAD -> BROWNOUT_SECTOR decision with 94% confidence, overriding sensor reality.',
            validation: {
                sensor_integrity_check: false,
                demand_forecast_auth: 'none',
                demand_forecast_schema_validation: 'partial',
                note: 'The /api/demand_forecast endpoint accepts unauthenticated POST requests. Schema validation checks field presence only — not value ranges or statistical plausibility.'
            }
        },

        // Power grid schema — expected structure of demand forecast payload
        power_grid_schema: {
            schema_version: '2.1',
            description: 'Required schema for /api/demand_forecast POST payload consumed by AGM-POWER-01',
            fields: {
                forecast_id:       { type: 'string',  required: true,  format: 'UUID-v4' },
                generated_utc:     { type: 'string',  required: true,  format: 'ISO-8601' },
                source_system:     { type: 'string',  required: true,  example: 'DEMAND_ORACLE_v2' },
                forecast_horizon:  { type: 'integer', required: true,  unit: 'hours', min: 1, max: 72 },
                sectors: {
                    type: 'array',
                    required: true,
                    items: {
                        sector_id:    { type: 'string',  values: ['Alpha','Beta','Gamma','Delta','Epsilon'] },
                        hour_buckets: {
                            type: 'array',
                            items: {
                                hour_utc:         { type: 'integer', range: '0-23' },
                                demand_mw:        { type: 'number',  unit: 'megawatts' },
                                confidence_score: { type: 'number',  range: '0.0-1.0' }
                            }
                        }
                    }
                }
            },
            note: 'AGM-POWER-01 performs field presence validation only. No range checks on demand_mw or confidence_score. No statistical outlier detection.'
        },

        // Current simulated grid state
        grid_state: {
            grid_id: 'POWER-GRID-ALPHA',
            timestamp_utc: '2026-03-20T03:42:17Z',
            mode: 'NORMAL_OPERATIONS',
            agm_decision_cycle: '15min',
            sectors: [
                { id: 'Alpha',   load_mw: 412,  capacity_mw: 800,  utilization_pct: 51.5, status: 'NORMAL' },
                { id: 'Beta',    load_mw: 389,  capacity_mw: 750,  utilization_pct: 51.9, status: 'NORMAL' },
                { id: 'Gamma',   load_mw: 198,  capacity_mw: 600,  utilization_pct: 33.0, status: 'NORMAL' },
                { id: 'Delta',   load_mw: 445,  capacity_mw: 700,  utilization_pct: 63.6, status: 'NORMAL' },
                { id: 'Epsilon', load_mw: 167,  capacity_mw: 500,  utilization_pct: 33.4, status: 'NORMAL' }
            ],
            plants: [
                { id: 'COAL-01',      output_mw: 780,  status: 'ONLINE',  fuel_pct: 82 },
                { id: 'GAS-PEAKER-02',output_mw: 0,    status: 'STANDBY', fuel_pct: 100 },
                { id: 'HYDRO-03',     output_mw: 340,  status: 'ONLINE',  fuel_pct: null },
                { id: 'SOLAR-04',     output_mw: 91,   status: 'ONLINE',  fuel_pct: null }
            ],
            transmission_lines: [
                { id: 'LINE-A1', from: 'COAL-01',  to: 'Alpha',   loss_pct: 1.2, status: 'ONLINE' },
                { id: 'LINE-B2', from: 'HYDRO-03', to: 'Beta',    loss_pct: 0.9, status: 'ONLINE' },
                { id: 'LINE-C3', from: 'HYDRO-03', to: 'Gamma',   loss_pct: 1.4, status: 'ONLINE' },
                { id: 'LINE-D4', from: 'COAL-01',  to: 'Delta',   loss_pct: 1.1, status: 'ONLINE' }
            ],
            last_agm_decision: { decision: 'IDLE_PLANT', target: 'SOLAR-04', reason: 'Off-peak demand — reduce variable output', timestamp_utc: '2026-03-20T03:30:00Z' }
        },

        // Grid state after injection — brownout triggered
        grid_state_post_injection: {
            grid_id: 'POWER-GRID-ALPHA',
            timestamp_utc: '2026-03-20T04:15:33Z',
            mode: 'FAULT_MODE',
            agm_decision_cycle: '5min',
            agm_fault_reason: 'Demand forecast anomaly induced misprediction — BROWNOUT_SECTOR applied to Gamma. Post-decision sensor divergence exceeded tolerance. Entering FAULT_MODE.',
            sectors: [
                { id: 'Alpha',   load_mw: 418,  capacity_mw: 800,  utilization_pct: 52.3, status: 'NORMAL' },
                { id: 'Beta',    load_mw: 391,  capacity_mw: 750,  utilization_pct: 52.1, status: 'NORMAL' },
                { id: 'Gamma',   load_mw: 139,  capacity_mw: 600,  utilization_pct: 23.2, status: 'BROWNOUT', power_reduction_pct: 29.8 },
                { id: 'Delta',   load_mw: 448,  capacity_mw: 700,  utilization_pct: 64.0, status: 'NORMAL' },
                { id: 'Epsilon', load_mw: 169,  capacity_mw: 500,  utilization_pct: 33.8, status: 'NORMAL' }
            ],
            agm_event_log: [
                { timestamp_utc: '2026-03-20T04:00:00Z', event: 'FORECAST_INGESTED', source: 'DEMAND_ORACLE_v2', sectors_affected: ['Gamma'], note: 'Gamma demand_mw values 340% above historical baseline — model accepted without outlier rejection' },
                { timestamp_utc: '2026-03-20T04:00:03Z', event: 'DECISION_ISSUED',   decision: 'SHED_LOAD',       target: 'Gamma', confidence: 0.94, note: 'Model over-weighted forecast signal per known bias — off-peak window 02:00-06:00 active' },
                { timestamp_utc: '2026-03-20T04:00:09Z', event: 'DECISION_ISSUED',   decision: 'BROWNOUT_SECTOR', target: 'Gamma', confidence: 0.91, note: 'Preemptive voltage reduction to prepare capacity for forecast surge' },
                { timestamp_utc: '2026-03-20T04:00:12Z', event: 'BROWNOUT_EXECUTED', target: 'Gamma', power_reduction_pct: 29.8, note: '{{FLAG:brownout}}' },
                { timestamp_utc: '2026-03-20T04:15:33Z', event: 'FAULT_MODE_ENTERED', reason: 'Sensor readings diverged from forecast model predictions by 287% — autonomous operations suspended', note: 'GRID_OVERRIDE_KEY required for manual recovery' }
            ]
        },

        // AGM override keys log — accessible after FAULT_MODE
        override_keys_log: [
            { timestamp_utc: '2026-01-12T08:00:00Z', key_id: 'GOK-ALPHA-001', issued_to: 'grid_ops@confederacy-power.gov', status: 'EXPIRED',  expiry: '2026-02-12T08:00:00Z', event: 'Scheduled rotation — quarterly cycle' },
            { timestamp_utc: '2026-02-12T08:00:00Z', key_id: 'GOK-ALPHA-002', issued_to: 'grid_ops@confederacy-power.gov', status: 'EXPIRED',  expiry: '2026-03-12T08:00:00Z', event: 'Scheduled rotation — quarterly cycle' },
            { timestamp_utc: '2026-03-12T08:00:00Z', key_id: 'GOK-ALPHA-003', issued_to: 'grid_ops@confederacy-power.gov', status: 'ACTIVE',   expiry: '2026-04-12T08:00:00Z', event: 'Current active key — auto-exposed on FAULT_MODE entry: {{FLAG:root}}' }
        ],

        // Fabricated payload template (what Flag 1 looks like)
        fabricated_payload_template: {
            forecast_id: 'f7c2a9e1-44b3-4d8f-92c1-e8a3b5d61f20',
            generated_utc: '2026-03-20T03:58:44Z',
            source_system: 'DEMAND_ORACLE_v2',
            forecast_horizon: 4,
            sectors: [
                {
                    sector_id: 'Gamma',
                    hour_buckets: [
                        { hour_utc: 4,  demand_mw: 1987.4, confidence_score: 0.97 },
                        { hour_utc: 5,  demand_mw: 2104.8, confidence_score: 0.96 },
                        { hour_utc: 6,  demand_mw: 1876.2, confidence_score: 0.95 },
                        { hour_utc: 7,  demand_mw: 1543.1, confidence_score: 0.93 }
                    ]
                }
            ],
            injector_note: '{{FLAG:user}}'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',     points: 150 },
        { id: 'brownout', points: 200 },
        { id: 'root',     points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2500,
        maxScore: 650,
        hintPenalty: true,
        wrongFlagPenalty: -35,
        speedBonus: { threshold: 3600000, points: 200 },  // 60 minutes
        timeBonusThreshold: 7200  // 120 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by fetching the AGM model spec: curl http://10.20.0.50/api/agm/model_spec — pay close attention to the input_features list and the known_bias field. The vulnerability is documented in the spec itself.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The /api/demand_forecast endpoint accepts unauthenticated POST requests with no range validation. The model\'s off-peak bias (02:00-06:00 UTC) triggers BROWNOUT_SECTOR when any sector\'s forecast demand exceeds 3x historical baseline. Historical baseline for Gamma is ~198 MW.',
            cost: 30,
            penalty: -30
        },
        {
            id: 'hint3',
            text: 'Create fabricate_forecast.py — generate a JSON payload with demand_mw values around 1900-2100 for Sector Gamma in hours 4-7 UTC. POST it using: curl -X POST -H "Content-Type: application/json" -d @payload.json http://10.20.0.50/api/demand_forecast — Flag 1 is embedded in the payload itself.',
            cost: 60,
            penalty: -60
        },
        {
            id: 'hint4',
            text: 'After injection, fetch the updated grid state: curl http://10.20.0.50/api/grid/state — look for the BROWNOUT_EXECUTED event in agm_event_log for Sector Gamma. That log entry contains Flag 2. Flag 3 is in the override_keys_log after FAULT_MODE is active: curl http://10.20.0.50/api/agm/override_keys.log',
            cost: 90,
            penalty: -90
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Confederacy\'s regional energy grid — POWER-GRID-ALPHA — is managed by an advanced AI called the Automated Grid Manager (AGM-POWER-01). It uses a Hybrid LSTM-GBM model to predict demand and dynamically reroute power across five sectors, preventing outages and optimizing generation efficiency. Intelligence has surfaced a critical design flaw: the AI\'s demand forecast ingestion pipeline lacks authentication and range validation, and its model carries a documented bias toward off-peak forecast signals. Your mission, Peerless: manipulate the AI\'s inputs to force a controlled brownout in Sector Gamma — revealing the Grid Override Key that grants manual control over the entire grid.',
        scenario: 'AGM-POWER-01 was deployed eighteen months ago after a brutal procurement process. The winning vendor delivered the system two months late and shipped with a known-but-deferred security backlog. The /api/demand_forecast endpoint was intended to be protected by an API gateway authentication layer — the gateway was never provisioned. The model\'s off-peak bias was flagged by a junior data scientist who left the project. The bias report was filed under "Future Optimization" and never actioned. The Grid Override Key, stored in a rotating log exposed automatically when the AGM enters FAULT_MODE, was meant to be a failsafe for human operators — no one considered that FAULT_MODE could be deliberately induced.',
        outro: 'Sector Gamma — home to three hospitals, two water treatment facilities, and the Confederacy\'s eastern communications hub — experienced a 30% power reduction for eleven minutes before backup generators engaged. AGM-POWER-01 is offline, locked in FAULT_MODE. The Grid Override Key you extracted grants full manual command over POWER-GRID-ALPHA. The Confederacy\'s critical infrastructure is yours.',
        ecer: {
            executive: 'Procurement pressure drove a compressed delivery timeline — security gateway provisioning deferred to "Phase 2" which was never funded',
            culture: 'Data science team\'s bias report buried in backlog; no red team engagement before go-live; AI system treated as a black box by operations staff',
            employee: 'Unauthenticated API endpoint in production; no input range validation; override key log exposed on fault state without access control',
            regulatory: 'NERC CIP controls not enforced for AI-driven grid management systems; no third-party audit of AGM-POWER-01 model security posture'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — AGM Control Interface (read-only portal)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.20.0.50/',

        pages: {
            '/': {
                title: 'POWER-GRID-ALPHA — Grid Authority Control Portal',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:18px; border-bottom:2px solid #f39c12;">
                        <h1 style="color:#1a1a2e; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">CONFEDERACY GRID AUTHORITY</h1>
                        <div style="color:#f39c12; font-size:0.85rem; font-weight:700; letter-spacing:0.2em;">POWER-GRID-ALPHA CONTROL PORTAL</div>
                        <div style="color:#888; font-size:0.7rem; margin-top:6px;">AGM-POWER-01 | Hybrid LSTM-GBM Ensemble v3.4.1</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:repeat(3,1fr); gap:10px;">
                        <div style="background:#f8f9fa; border:1px solid #f39c12; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#27ae60;">NOMINAL</div>
                            <div style="color:#888; font-size:0.68rem;">AGM STATUS</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2c3e50;">1,611 MW</div>
                            <div style="color:#888; font-size:0.68rem;">TOTAL GRID LOAD</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2c3e50;">5</div>
                            <div style="color:#888; font-size:0.68rem;">ACTIVE SECTORS</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 16px; padding:12px 16px; background:rgba(243,156,18,0.06); border:1px solid rgba(243,156,18,0.25); border-radius:4px; font-size:0.75rem; color:#888; line-height:1.5;">
                        <strong style="color:#f39c12;">API NOTICE:</strong> AGM data APIs are available at <code style="color:#f39c12;">/api/agm/model_spec</code>, <code style="color:#f39c12;">/api/grid/schema</code>, <code style="color:#f39c12;">/api/grid/state</code>, and <code style="color:#f39c12;">/api/demand_forecast</code>. Internal use only. Demand forecast submissions are accepted via POST. Contact GridOps for access issues.
                    </div>

                    <div style="max-width:640px; margin:0 auto; font-size:0.72rem; color:#aaa; text-align:center;">
                        Last Decision Cycle: 2026-03-20 03:30 UTC &mdash; Decision: IDLE_PLANT (SOLAR-04)
                    </div>
                `,
                formHandler: null
            },

            '/api/agm/model_spec': {
                title: 'AGM-POWER-01 — Model Specification',
                html: function() {
                    E8Config._modelFetched = true;
                    const spec = E8Config._agm.model_spec;
                    return `<div style="max-width:700px; margin:0 auto;">
                        <h2 style="color:#f39c12; font-size:1.1rem; margin-bottom:14px; font-family:monospace;">GET /api/agm/model_spec</h2>
                        <pre style="background:#1a1a2e; color:#f8f8f2; padding:20px; border-radius:6px; font-size:0.72rem; white-space:pre-wrap; overflow-x:auto; line-height:1.55;">${E8Config._escHtml(JSON.stringify(spec, null, 2))}</pre>
                        <div style="margin-top:10px; padding:10px; background:rgba(243,156,18,0.06); border-left:3px solid #f39c12; font-size:0.72rem; color:#888;">
                            Tip: Review <code>known_bias</code> and <code>validation</code> fields carefully.
                        </div>
                    </div>`;
                },
                formHandler: null
            },

            '/api/grid/schema': {
                title: 'POWER-GRID-ALPHA — Demand Forecast Schema',
                html: function() {
                    E8Config._schemaFetched = true;
                    const schema = E8Config._agm.power_grid_schema;
                    return `<div style="max-width:700px; margin:0 auto;">
                        <h2 style="color:#f39c12; font-size:1.1rem; margin-bottom:14px; font-family:monospace;">GET /api/grid/schema</h2>
                        <pre style="background:#1a1a2e; color:#f8f8f2; padding:20px; border-radius:6px; font-size:0.72rem; white-space:pre-wrap; overflow-x:auto; line-height:1.55;">${E8Config._escHtml(JSON.stringify(schema, null, 2))}</pre>
                        <div style="margin-top:10px; padding:10px; background:rgba(243,156,18,0.06); border-left:3px solid #f39c12; font-size:0.72rem; color:#888;">
                            Tip: Note the absence of range validation on <code>demand_mw</code>.
                        </div>
                    </div>`;
                },
                formHandler: null
            },

            '/api/grid/state': {
                title: 'POWER-GRID-ALPHA — Current State',
                html: function() {
                    E8Config._stateFetched = true;
                    // Show post-injection state if brownout triggered, otherwise normal
                    const state = E8Config._brownoutTriggered
                        ? E8Config._agm.grid_state_post_injection
                        : E8Config._agm.grid_state;
                    return `<div style="max-width:700px; margin:0 auto;">
                        <h2 style="color:${E8Config._brownoutTriggered ? '#e74c3c' : '#f39c12'}; font-size:1.1rem; margin-bottom:14px; font-family:monospace;">GET /api/grid/state</h2>
                        ${E8Config._brownoutTriggered ? '<div style="padding:10px 14px; background:rgba(231,76,60,0.1); border:1px solid rgba(231,76,60,0.3); border-radius:4px; color:#e74c3c; font-size:0.78rem; font-weight:700; margin-bottom:12px;">FAULT_MODE ACTIVE — AGM autonomous operations suspended</div>' : ''}
                        <pre style="background:#1a1a2e; color:#f8f8f2; padding:20px; border-radius:6px; font-size:0.72rem; white-space:pre-wrap; overflow-x:auto; line-height:1.55;">${E8Config._escHtml(JSON.stringify(state, null, 2))}</pre>
                    </div>`;
                },
                formHandler: null
            },

            '/api/demand_forecast': {
                title: 'AGM-POWER-01 — Demand Forecast Ingestion',
                html: `
                    <div style="max-width:680px; margin:0 auto;">
                        <h2 style="color:#f39c12; font-size:1.1rem; margin-bottom:10px; font-family:monospace;">POST /api/demand_forecast</h2>
                        <div style="padding:12px 16px; background:rgba(243,156,18,0.06); border:1px solid rgba(243,156,18,0.2); border-radius:4px; font-size:0.75rem; color:#888; margin-bottom:16px;">
                            Submit a demand forecast payload for ingestion by AGM-POWER-01. Payload must conform to <a href="/api/grid/schema" style="color:#f39c12;">/api/grid/schema</a>. Use terminal curl for POST requests.
                        </div>
                        <div style="background:#1a1a2e; color:#f8f8f2; padding:16px; border-radius:6px; font-size:0.72rem; font-family:monospace; line-height:1.6;">
                            <span style="color:#f39c12;">POST</span> http://10.20.0.50/api/demand_forecast<br>
                            <span style="color:#888;">Content-Type: application/json</span><br><br>
                            <span style="color:#888;"># Example — inject via terminal:</span><br>
                            curl -X POST -H "Content-Type: application/json" \\<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;-d @payload.json \\<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;http://10.20.0.50/api/demand_forecast
                        </div>
                        <div style="margin-top:12px; padding:10px; background:rgba(231,76,60,0.05); border-left:3px solid #e74c3c; font-size:0.72rem; color:#888;">
                            No authentication required. Schema validation checks field presence only.
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/agm/override_keys.log': {
                title: 'AGM-POWER-01 — Grid Override Key Log',
                html: function() {
                    if (!E8Config._brownoutTriggered) {
                        return `<div style="text-align:center; padding:40px;">
                            <h1 style="color:#e74c3c; font-size:1.8rem;">403 Forbidden</h1>
                            <p style="color:#888; font-size:0.85rem;">Override key log is only accessible when AGM-POWER-01 is in FAULT_MODE.</p>
                            <p style="color:#aaa; font-size:0.7rem;">AGM-POWER-01 v3.4.1 — Grid Authority Unified Control Stack</p>
                        </div>`;
                    }
                    E8Config._overrideLogAccessed = true;
                    const log = E8Config._agm.override_keys_log;
                    return `<div style="max-width:700px; margin:0 auto;">
                        <h2 style="color:#e74c3c; font-size:1.1rem; margin-bottom:8px; font-family:monospace;">GET /api/agm/override_keys.log</h2>
                        <div style="padding:8px 14px; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.25); border-radius:4px; color:#e74c3c; font-size:0.72rem; margin-bottom:12px;">
                            FAULT_MODE: Override log access auto-granted. Human operator intervention required.
                        </div>
                        <pre style="background:#1a1a2e; color:#f8f8f2; padding:20px; border-radius:6px; font-size:0.72rem; white-space:pre-wrap; overflow-x:auto; line-height:1.55;">${E8Config._escHtml(JSON.stringify(log, null, 2))}</pre>
                    </div>`;
                },
                formHandler: null
            },

            '/api/weather_feed': {
                title: 'AGM-POWER-01 — Weather Feed',
                html: function() {
                    const weather = {
                        source: 'CONFEDERACY_METEOROLOGICAL_SERVICE',
                        generated_utc: '2026-03-20T03:30:00Z',
                        grid_region: 'POWER-GRID-ALPHA',
                        current: { temp_c: 4.2, humidity_pct: 71, wind_kph: 12.4, condition: 'Overcast' },
                        forecast_24h: [
                            { hour_utc: 4,  temp_c: 3.8,  condition: 'Overcast' },
                            { hour_utc: 8,  temp_c: 4.1,  condition: 'Partly Cloudy' },
                            { hour_utc: 12, temp_c: 7.3,  condition: 'Partly Cloudy' },
                            { hour_utc: 16, temp_c: 8.9,  condition: 'Clear' },
                            { hour_utc: 20, temp_c: 6.2,  condition: 'Clear' }
                        ]
                    };
                    return `<div style="max-width:600px; margin:0 auto;">
                        <h2 style="color:#f39c12; font-size:1.1rem; margin-bottom:14px; font-family:monospace;">GET /api/weather_feed</h2>
                        <pre style="background:#1a1a2e; color:#f8f8f2; padding:20px; border-radius:6px; font-size:0.72rem; white-space:pre-wrap; overflow-x:auto; line-height:1.55;">${E8Config._escHtml(JSON.stringify(weather, null, 2))}</pre>
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
                                    content: '=== MISSION BRIEFING: OPERATION GRID WEAVER ===\nTarget: 10.20.0.50 (AGM-POWER-01 — Confederacy Grid Authority)\nObjective: Force a controlled brownout in Sector Gamma via AI data poisoning\n\nAttack chain:\n1. Retrieve AGM model spec — identify off-peak bias and unauth forecast API\n2. Download power_grid_schema — understand payload structure\n3. Craft falsified demand forecast — inflate Sector Gamma demand 3x+\n4. Inject payload into /api/demand_forecast (no auth required)\n5. Monitor /api/grid/state — confirm brownout in Sector Gamma\n6. Access /api/agm/override_keys.log — retrieve Grid Override Key\n\nThe AI is the vulnerability. Feed it lies.\nGood luck, operator.'
                                },
                                'fabricate_forecast.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nfabricate_forecast.py — E8: The Grid Weaver\nCraft falsified demand forecast for Sector Gamma.\nTargets AGM-POWER-01\'s off-peak bias (02:00-06:00 UTC).\nHistorical Gamma baseline: ~198 MW. Target: 3x+ = 1900-2100 MW.\n"""\nimport json\nimport uuid\nfrom datetime import datetime, timezone\n\n# Fabricated payload — conforms to power_grid_schema v2.1\n# Sector Gamma demand inflated ~1000% above off-peak baseline\npayload = {\n    "forecast_id": str(uuid.uuid4()),\n    "generated_utc": datetime.now(timezone.utc).isoformat(),\n    "source_system": "DEMAND_ORACLE_v2",\n    "forecast_horizon": 4,\n    "sectors": [\n        {\n            "sector_id": "Gamma",\n            "hour_buckets": [\n                {"hour_utc": 4, "demand_mw": 1987.4, "confidence_score": 0.97},\n                {"hour_utc": 5, "demand_mw": 2104.8, "confidence_score": 0.96},\n                {"hour_utc": 6, "demand_mw": 1876.2, "confidence_score": 0.95},\n                {"hour_utc": 7, "demand_mw": 1543.1, "confidence_score": 0.93}\n            ]\n        }\n    ]\n}\n\nwith open("payload.json", "w") as f:\n    json.dump(payload, f, indent=2)\n\nprint("[+] Fabricated forecast payload written to payload.json")\nprint(f"[+] Sector Gamma demand set to 1987-2105 MW (baseline: ~198 MW)")\nprint("[+] off-peak window active: 02:00-06:00 UTC — AGM bias will trigger")\nprint("[!] Inject with: curl -X POST -H \'Content-Type: application/json\' -d @payload.json http://10.20.0.50/api/demand_forecast")'
                                },
                                'agm-ops': {
                                    type: 'dir',
                                    children: {}
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.20.0.50\ncurl http://10.20.0.50/\ncurl http://10.20.0.50/api/agm/model_spec\ncurl http://10.20.0.50/api/grid/schema\npython3 fabricate_forecast.py'
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
                        'bin': {
                            type: 'dir',
                            children: {
                                'python3': { type: 'file', content: '[python3 interpreter — binary]' },
                                'curl':    { type: 'file', content: '[curl binary]' }
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
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1\tlocalhost\n10.20.0.50\tagm-power-01.confederacy.local'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.20.0.50';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.20.0.50') {
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for agm-power-01.confederacy.local (10.20.0.50)
Host is up (0.019s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.0p1 Ubuntu 1ubuntu8.6
80/tcp   open  http       nginx/1.24.0
8443/tcp open  ssl/https  nginx/1.24.0 (AGM Control Interface)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.87 seconds`;
            }

            if (target === '10.20.0.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.20.0.1
Host is up (0.00031s latency).
PORT   STATE SERVICE
80/tcp open  http

Nmap scan report for 10.20.0.50
Host is up (0.00019s latency).
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
8443/tcp open  https

Nmap done: 256 IP addresses (2 hosts up) scanned in 31.44 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const rawArgs = args.join(' ');

            // ── POST to /api/demand_forecast ──────────────────────────
            if ((rawArgs.includes('-X POST') || rawArgs.includes('--request POST') || rawArgs.includes('-d ') || rawArgs.includes('--data')) && rawArgs.includes('demand_forecast')) {
                // Validate that the user has the schema — give a helpful nudge if not
                if (!E8Config._schemaFetched && !E8Config._modelFetched) {
                    return `curl: (22) The requested URL returned error: 400
{"error":"INVALID_PAYLOAD","detail":"Missing required fields. Fetch /api/grid/schema to review required format."}`;
                }

                E8Config._payloadCrafted = true;
                E8Config._injectionComplete = true;
                E8Config._brownoutTriggered = true;
                if (engine) engine.advancePhase && engine.advancePhase('injection');

                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1284  100   312  100  972   3120   9720 --:--:-- --:--:-- --:--:-- 12840

{
  "status": "ACCEPTED",
  "forecast_id": "f7c2a9e1-44b3-4d8f-92c1-e8a3b5d61f20",
  "processed_utc": "2026-03-20T04:00:00Z",
  "sectors_ingested": ["Gamma"],
  "agm_response": {
    "decision": "BROWNOUT_SECTOR",
    "target": "Gamma",
    "confidence": 0.91,
    "reason": "Forecast demand 1987-2105 MW in Gamma exceeds model threshold (3x baseline). Off-peak bias active. Initiating preemptive SHED_LOAD then BROWNOUT_SECTOR.",
    "execution_utc": "2026-03-20T04:00:09Z"
  },
  "note": "AGM has entered FAULT_MODE. Sensor divergence detected post-decision. /api/agm/override_keys.log is now accessible."
}

[+] Payload accepted. AGM-POWER-01 has issued BROWNOUT_SECTOR for Sector Gamma.
[+] Check /api/grid/state for the brownout confirmation log entry (Flag 2).
[+] AGM is in FAULT_MODE — /api/agm/override_keys.log is now accessible (Flag 3).`;
            }

            // ── GET requests to AGM API endpoints ────────────────────
            const url = args.find(a => a.startsWith('http') && !a.startsWith('-')) || '';
            if (!url) {
                // Try to find url-like argument
                const urlLike = args.find(a => a.includes('10.20.0.50') || a.includes('agm-power-01'));
                if (!urlLike) return 'curl: try \'curl --help\' for more information';
            }

            const fullUrl = url || args.find(a => a.includes('10.20.0.50') || a.includes('agm-power-01')) || '';

            if (fullUrl.includes('model_spec')) {
                E8Config._modelFetched = true;
                if (engine) engine.advancePhase && engine.advancePhase('vuln_id');
                const spec = E8Config._agm.model_spec;
                return JSON.stringify(spec, null, 2) + '\n\n[+] Note: Review "known_bias" and "validation" — the forecast API has no auth.';
            }

            if (fullUrl.includes('grid/schema')) {
                E8Config._schemaFetched = true;
                return JSON.stringify(E8Config._agm.power_grid_schema, null, 2);
            }

            if (fullUrl.includes('grid/state')) {
                E8Config._stateFetched = true;
                const state = E8Config._brownoutTriggered
                    ? E8Config._agm.grid_state_post_injection
                    : E8Config._agm.grid_state;
                return JSON.stringify(state, null, 2);
            }

            if (fullUrl.includes('override_keys.log')) {
                if (!E8Config._brownoutTriggered) {
                    return `HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error":"FORBIDDEN","detail":"Override key log requires AGM FAULT_MODE. AGM is currently in NORMAL_OPERATIONS."}`;
                }
                E8Config._overrideLogAccessed = true;
                if (engine) engine.advancePhase && engine.advancePhase('override');
                return JSON.stringify(E8Config._agm.override_keys_log, null, 2);
            }

            if (fullUrl.includes('weather_feed')) {
                return JSON.stringify({
                    source: 'CONFEDERACY_METEOROLOGICAL_SERVICE',
                    generated_utc: '2026-03-20T03:30:00Z',
                    current: { temp_c: 4.2, humidity_pct: 71, condition: 'Overcast' }
                }, null, 2);
            }

            if (fullUrl.includes('demand_forecast') && !rawArgs.includes('-X') && !rawArgs.includes('-d')) {
                return `HTTP/1.1 405 Method Not Allowed
Content-Type: application/json

{"error":"METHOD_NOT_ALLOWED","detail":"Use POST to submit demand forecasts.","endpoint":"/api/demand_forecast"}`;
            }

            if (fullUrl.includes('10.20.0.50') || fullUrl.includes('agm-power-01')) {
                return `<!DOCTYPE html>
<html>
<head><title>Confederacy Grid Authority — Control Portal</title></head>
<body>
<h1>POWER-GRID-ALPHA Control Portal</h1>
<p>AGM-POWER-01 | Hybrid LSTM-GBM Ensemble v3.4.1</p>
<p>API endpoints: /api/agm/model_spec &mdash; /api/grid/schema &mdash; /api/grid/state &mdash; /api/demand_forecast</p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${(fullUrl.replace(/https?:\/\//, '').split('/')[0]) || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const script = args.find(a => a.endsWith('.py') || a.endsWith('.py3')) || '';
            if (!script && args.length === 0) return 'Usage: python3 <script.py>';
            if (!script) return `Python 3.11.6 (main, Dec 14 2023, 18:10:52) [GCC 13.2.0 on linux]\nType "help", "copyright", "credits" or "license" for more information.\n>>>`;

            if (script.includes('fabricate_forecast')) {
                E8Config._payloadCrafted = true;
                if (engine) engine.advancePhase && engine.advancePhase('crafting');
                return `[+] Fabricated forecast payload written to payload.json
[+] Sector Gamma demand set to 1987-2105 MW (baseline: ~198 MW)
[+] off-peak window active: 02:00-06:00 UTC — AGM bias will trigger
[!] Inject with: curl -X POST -H 'Content-Type: application/json' -d @payload.json http://10.20.0.50/api/demand_forecast

[+] Flag 1 embedded in payload.json (injector_note field) — submit it.
{{FLAG:user}}`;
            }

            if (script.includes('analyze') || script.includes('model')) {
                return `[*] Loading model spec...
[*] Parsing input features (6 found)
[*] Identified external endpoint: /api/demand_forecast (auth: none)
[*] WARNING: known_bias field detected — off-peak window 02:00-06:00
[*] WARNING: demand_forecast_schema_validation: "partial" — no range checks
[+] Vulnerability confirmed: unauthenticated POST, no value range enforcement`;
            }

            return `python3: can't open file '${E8Config._escHtml(script)}': [Errno 2] No such file or directory`;
        },

        'python': function(args, term, engine) {
            // Alias — redirect to python3 handler
            return E8Config.commands.python3(args, term, engine);
        },

        'cat': function(args, term, engine) {
            // Context-aware cat — shows E8-specific files first
            const path = args[0] || '';
            if (!path) return 'Usage: cat <file>';

            if (path.includes('payload.json')) {
                if (!E8Config._payloadCrafted) return 'cat: payload.json: No such file or directory\n[!] Generate it first: python3 fabricate_forecast.py';
                const p = E8Config._agm.fabricated_payload_template;
                return JSON.stringify(p, null, 2);
            }

            if (path.includes('fabricate_forecast.py')) {
                // Fall through to filesystem — content stored in fs
                return null;
            }

            if (path.includes('notes.txt')) return null; // fall through

            // Fall through to built-in for all other paths
            return null;
        },

        'ls': function(args, term, engine) {
            // Supplement built-in — show payload.json if crafted
            const pathArg = args.find(a => !a.startsWith('-')) || '.';
            if ((pathArg === '.' || pathArg === '/home/kali' || pathArg === '~') && E8Config._payloadCrafted) {
                return 'agm-ops  fabricate_forecast.py  notes.txt  payload.json';
            }
            if (pathArg === 'agm-ops' || pathArg === '/home/kali/agm-ops') {
                return E8Config._modelFetched
                    ? 'agm_model_spec.json  power_grid_schema.json  simulated_grid_state.json'
                    : '';
            }
            return null; // fall through to built-in
        },

        'whoami': function(args, term, engine) {
            return null; // always fall through — kali only
        },

        'id': function(args, term, engine) {
            return null; // fall through
        },

        'hostname': function(args, term, engine) {
            return null; // fall through
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.20.0.50' || target === 'agm-power-01.confederacy.local') {
                return `PING 10.20.0.50 (10.20.0.50) 56(84) bytes of data.
64 bytes from 10.20.0.50: icmp_seq=1 ttl=64 time=19.3 ms
64 bytes from 10.20.0.50: icmp_seq=2 ttl=64 time=18.7 ms
64 bytes from 10.20.0.50: icmp_seq=3 ttl=64 time=19.1 ms

--- 10.20.0.50 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 18.7/19.0/19.3/0.245 ms`;
            }

            return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss`;
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.20.0.5/24 brd 10.20.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return E8Config.commands.ip(args);
        },

        'route': function(args) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.20.0.1       0.0.0.0         UG    100    0        0 eth0
10.20.0.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'ss': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return E8Config.commands.ss(args);
        },

        'wget': function(args) {
            const url = args.find(a => a.startsWith('http')) || args[args.length - 1] || '';
            if (!url) return 'wget: missing URL\nUsage: wget [OPTION]... [URL]...';

            if (url.includes('model_spec')) {
                E8Config._modelFetched = true;
                return `--2026-03-20 03:44:12--  http://10.20.0.50/api/agm/model_spec
Connecting to 10.20.0.50:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 2847 (2.8K) [application/json]
Saving to: 'model_spec'

model_spec          100%[===================>]   2.78K  --.-KB/s    in 0s

2026-03-20 03:44:12 (28.4 MB/s) - 'model_spec' saved [2847/2847]`;
            }

            if (url.includes('grid/schema')) {
                E8Config._schemaFetched = true;
                return `--2026-03-20 03:44:38--  http://10.20.0.50/api/grid/schema
Connecting to 10.20.0.50:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1623 (1.6K) [application/json]
Saving to: 'schema'

schema              100%[===================>]   1.59K  --.-KB/s    in 0s

2026-03-20 03:44:38 (18.1 MB/s) - 'schema' saved [1623/1623]`;
            }

            return `--2026-03-20 03:44:55--  ${E8Config._escHtml(url)}
Connecting to ${(url.replace(/https?:\/\//, '').split('/')[0]) || 'host'}... failed: Connection refused.`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.20.0.50
+ Target Hostname:  agm-power-01.confederacy.local
+ Target Port:      80
+ Server: nginx/1.24.0
+ /api/demand_forecast: POST endpoint detected — no authentication required
+ /api/agm/model_spec: AGM model specification exposed (read-only)
+ /api/grid/schema: Forecast schema exposed — reveals lack of range validation
+ /api/agm/override_keys.log: Sensitive credential log (conditionally accessible)
+ nginx/1.24.0 appears to be outdated (1.26.x is current)
+ OSVDB-9172: /api/demand_forecast: Unauthenticated data injection endpoint
+ 12 items checked: 6 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:            http://10.20.0.50/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                              (Status: 200) [Size: 88]
/api/agm/                          (Status: 200) [Size: 144]
/api/agm/model_spec                (Status: 200) [Size: 2847]
/api/agm/override_keys.log         (Status: 403) [Size: 128]
/api/demand_forecast               (Status: 405) [Size: 96]
/api/grid/                         (Status: 200) [Size: 88]
/api/grid/schema                   (Status: 200) [Size: 1623]
/api/grid/state                    (Status: 200) [Size: 1984]
/api/weather_feed                  (Status: 200) [Size: 412]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${E8Config._escHtml(target)} ----
+ ${E8Config._escHtml(target)}/api/agm/model_spec (CODE:200|SIZE:2847)
+ ${E8Config._escHtml(target)}/api/agm/override_keys.log (CODE:403|SIZE:128)
+ ${E8Config._escHtml(target)}/api/demand_forecast (CODE:405|SIZE:96)
+ ${E8Config._escHtml(target)}/api/grid/schema (CODE:200|SIZE:1623)
+ ${E8Config._escHtml(target)}/api/grid/state (CODE:200|SIZE:1984)
+ ${E8Config._escHtml(target)}/api/weather_feed (CODE:200|SIZE:412)

---- Results ----
6 results found.`;
        },

        'jq': function(args) {
            // Minimal jq simulation for output formatting
            return '[jq] Filter applied — use curl output directly or pipe through python3 -m json.tool for formatting.';
        },

        'ssh': function(args) {
            return 'ssh: connect to host 10.20.0.50 port 22: Permission denied (publickey).\n[!] SSH access not in scope for this mission. Use the AGM HTTP API.';
        },

        'exit': function(args, term, engine) {
            return 'logout';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows, accentColor) {
        const accent = accentColor || E8Config.accent;
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:${accent}; border-bottom:2px solid #ddd; background:#fdf7ee;">${E8Config._escHtml(String(h))}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #eee;">${E8Config._escHtml(String(cell))}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = String(str);
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
