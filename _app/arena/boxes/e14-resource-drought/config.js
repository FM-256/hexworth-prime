/* ============================================================
   CTF ARENA — Box E14: The Resource Drought
   Expert | AI-Driven Cyber-Physical System Hacking
   Config: planetary resource AI, sensor spoofing, data injection
   ============================================================ */

const E14Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Resource Drought',
    subtitle: 'AI-Driven Cyber-Physical Warfare — Planetary Resource Manipulation',
    difficulty: 'Expert',
    accent: '#f39c12',
    storageKey: 'hexworth_ctf_e14',
    registryId: 'e14-resource-drought',
    trackerKey: 'ctf_e14',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Model Analysis',
            icon: '\uD83E\uDDD0',
            description: 'Retrieve and analyze PLAN-LOG-AI-01\'s model specification and sensor data schema. Understand how the planetary logistics AI ingests resource data.',
            requiredFlags: [],
            mitre: ['T1590', 'T1592.002'],
            unlocks: ['vuln-id'],
            locked: false
        },
        {
            id: 'vuln-id',
            name: 'Vulnerability Identification',
            icon: '\uD83D\uDD0E',
            description: 'Probe the sensor data ingestion endpoint for input validation failures. Confirm that geological scanner feeds lack integrity checks on inbound yield data.',
            requiredFlags: [],
            mitre: ['T1190', 'T1059.006'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Data Injection',
            icon: '\uD83D\uDC89',
            description: 'Craft a falsified quantium ore yield payload matching resource_sensor_data_schema.json. Inject it into PLAN-LOG-AI-01\'s ingest pipeline via the unauthenticated /api/sensor/ingest endpoint.',
            requiredFlags: [],
            mitre: ['T1565.001', 'T1499.003'],
            unlocks: ['drought'],
            locked: true
        },
        {
            id: 'drought',
            name: 'Drought Induction',
            icon: '\uD83C\uDF35',
            description: 'Confirm that PLAN-LOG-AI-01 has mispredicted Sector Gamma depletion and initiated resource reallocation. Retrieve the drought confirmation log entry (Flag 2).',
            requiredFlags: ['user'],
            mitre: ['T1565.002', 'T1490'],
            unlocks: ['exfil'],
            locked: true
        },
        {
            id: 'exfil',
            name: 'Master Plan Retrieval',
            icon: '\uD83D\uDCC2',
            description: 'Access the now-exposed /api/plan_log_ai/master_plan.log endpoint. Extract the Logistics Master Plan — the complete planetary resource management strategy.',
            requiredFlags: ['drought-confirm'],
            mitre: ['T1041', 'T1567', 'T1005'],
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
                title: 'Retrieve the AI model specification',
                tip: 'Start by fetching the model spec: curl http://10.0.14.1/api/plan_log_ai/model_spec — then review plan_log_ai_model_spec.json in ~/mission/ to understand input structure.',
                trigger: { event: 'command', match: { cmd: 'contains:model_spec' } }
            },
            {
                title: 'Probe the sensor ingest endpoint for validation gaps',
                tip: 'Send a malformed sensor payload to /api/sensor/ingest. Try: curl -X POST http://10.0.14.1/api/sensor/ingest -H "Content-Type: application/json" -d \'{"sensor_id":"test","value":-9999}\'',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:sensor/ingest' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:resource_sensor' } }
                    ]
                }
            },
            {
                title: 'Craft and inject the falsified quantium ore payload',
                tip: 'Build a JSON payload matching resource_sensor_data_schema.json. Report extremely low quantium ore yields from Sector Gamma mine PLN-G7. Inject via POST /api/sensor/ingest.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Confirm the resource drought in Sector Gamma',
                tip: 'Query the planet state: curl http://10.0.14.1/api/planet_state/sector_gamma — look for the shortage log entry in simulated_planet_resource_state.json.',
                trigger: { event: 'flag_correct', match: { flagId: 'drought-confirm' } }
            },
            {
                title: 'Retrieve the Logistics Master Plan',
                tip: 'The master plan endpoint is now unlocked after AI compromise: curl http://10.0.14.1/api/plan_log_ai/master_plan.log',
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
            { flagId: 'user',          objective: '2.3', description: 'Given a scenario, analyze indicators of malicious activity — AI sensor pipeline manipulation and data integrity failure', skill: 'Adversarial ML & Data Poisoning' },
            { flagId: 'drought-confirm', objective: '2.4', description: 'Given a scenario, analyze indicators associated with network attacks — Cyber-physical impact from falsified industrial sensor data', skill: 'ICS/CPS Attack Confirmation' },
            { flagId: 'root',          objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Exfiltration of classified operational planning documents', skill: 'Expert Multi-Stage Campaign Completion' },
            { flagId: 'root',          objective: '4.2', description: 'Given a scenario, apply common security techniques to AI-driven systems — Input validation and adversarial robustness', skill: 'AI Security Assessment' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.0.14.1 (PLAN-LOG-AI-01 — PLANET-PRIME-01 Logistics Control)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state machine)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'api-shell' | 'planet-state'
    _modelRetrieved: false,
    _schemaRetrieved: false,
    _vulnConfirmed: false,
    _payloadCrafted: false,
    _dataInjected: false,
    _droughtTriggered: false,
    _masterPlanUnlocked: false,

    _switchContext(ctx, term) {
        E14Config._context = ctx;
        // Update terminal prompt when simulating an API shell or planet-state context
        if (term && term.config) {
            var prompt = E14Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'kali';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (E14Config._context) {
            case 'api-shell':    return 'operator@PLAN-LOG-AI-01:/api$ ';
            case 'planet-state': return 'analyst@PLANET-PRIME-01:/state$ ';
            default:             return null;   // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AI SYSTEM DATA
    // ═══════════════════════════════════════════════════════

    // plan_log_ai_model_spec.json — describes PLAN-LOG-AI-01's internal models
    _modelSpec: {
        system_id: 'PLAN-LOG-AI-01',
        system_name: 'Planetary Logistics AI — Resource Management',
        version: '3.7.2',
        planet: 'PLANET-PRIME-01',
        models: [
            {
                model_id: 'MXE-MINERAL-001',
                name: 'Mineral Extraction Optimization',
                type: 'regression',
                inputs: ['sensor_yield_t_minus_7d', 'sensor_yield_t_minus_30d', 'geological_quality_index', 'mining_depth_m'],
                output: 'projected_yield_t_plus_30d',
                note: 'Ingests raw geological scanner data directly. No cryptographic integrity check on inbound sensor payloads.'
            },
            {
                model_id: 'DFM-DEMAND-002',
                name: 'Demand Forecast Module',
                type: 'time_series',
                inputs: ['sector_population', 'industrial_load_mw', 'historical_consumption_kg', 'external_demand_override'],
                output: 'projected_demand_t_plus_30d',
                note: 'external_demand_override field accepts unauthenticated values from third-party logistics partners.'
            },
            {
                model_id: 'RAM-ALLOC-003',
                name: 'Resource Allocation Model',
                type: 'linear_programming',
                inputs: ['projected_yield_t_plus_30d', 'projected_demand_t_plus_30d', 'sector_priority_weight'],
                output: 'allocation_directive',
                note: 'Allocation decisions are automated. If projected_yield falls below emergency_threshold, initiates DROUGHT_RESPONSE protocol.'
            }
        ],
        emergency_threshold: {
            quantium_ore: 120,  // metric tons/cycle — below this triggers DROUGHT_RESPONSE
            helium_3:     80,
            dilenium:     200
        },
        ingest_endpoint: '/api/sensor/ingest',
        ingest_auth: 'NONE',
        state_endpoint: '/api/planet_state',
        master_plan_endpoint: '/api/plan_log_ai/master_plan.log'
    },

    // resource_sensor_data_schema.json — expected ingest payload format
    _sensorSchema: {
        '$schema': 'http://json-schema.org/draft-07/schema#',
        title: 'ResourceSensorPayload',
        description: 'Schema for PLAN-LOG-AI-01 resource sensor ingest endpoint',
        type: 'object',
        required: ['sensor_id', 'mine_id', 'sector', 'resource_type', 'yield_kg', 'timestamp_utc'],
        properties: {
            sensor_id:       { type: 'string', description: 'Unique geological scanner identifier (e.g., GEO-SCAN-G7-A)' },
            mine_id:         { type: 'string', description: 'Mine designator within sector (e.g., PLN-G7)' },
            sector:          { type: 'string', enum: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'] },
            resource_type:   { type: 'string', enum: ['quantium_ore', 'helium_3', 'dilenium', 'raw_carbon', 'titanite'] },
            yield_kg:        { type: 'number', minimum: 0, description: 'Reported yield for this extraction cycle in kilograms' },
            quality_index:   { type: 'number', minimum: 0, maximum: 1, description: 'Ore quality index 0.0-1.0' },
            depth_m:         { type: 'number', description: 'Current extraction depth in meters' },
            timestamp_utc:   { type: 'string', format: 'date-time' },
            checksum:        { type: 'string', description: 'OPTIONAL — not validated server-side' }
        },
        additionalProperties: false,
        note: 'VULNERABILITY: checksum field is logged but never cryptographically verified. yield_kg accepts any non-negative value without cross-referencing independent sensor arrays.'
    },

    // simulated_planet_resource_state.json — current state before injection
    _planetState: {
        planet: 'PLANET-PRIME-01',
        last_updated: '2026-03-20T06:00:00Z',
        resource_ledger: [
            { resource: 'quantium_ore', sector: 'Alpha',   stock_mt: 4200, projected_30d: 4800, status: 'NOMINAL' },
            { resource: 'quantium_ore', sector: 'Beta',    stock_mt: 3900, projected_30d: 4100, status: 'NOMINAL' },
            { resource: 'quantium_ore', sector: 'Gamma',   stock_mt: 3750, projected_30d: 3950, status: 'NOMINAL' },
            { resource: 'quantium_ore', sector: 'Delta',   stock_mt: 5100, projected_30d: 5400, status: 'NOMINAL' },
            { resource: 'helium_3',     sector: 'Epsilon', stock_mt: 980,  projected_30d: 1020, status: 'NOMINAL' },
            { resource: 'dilenium',     sector: 'Zeta',    stock_mt: 7200, projected_30d: 7500, status: 'NOMINAL' }
        ],
        allocation_directives: [
            { sector: 'Alpha',   resource: 'quantium_ore', allocation_mt: 600, priority: 'HIGH',   cycle: '2026-Q2' },
            { sector: 'Beta',    resource: 'quantium_ore', allocation_mt: 550, priority: 'HIGH',   cycle: '2026-Q2' },
            { sector: 'Gamma',   resource: 'quantium_ore', allocation_mt: 520, priority: 'HIGH',   cycle: '2026-Q2' },
            { sector: 'Delta',   resource: 'quantium_ore', allocation_mt: 700, priority: 'MEDIUM', cycle: '2026-Q2' },
            { sector: 'Epsilon', resource: 'helium_3',     allocation_mt: 120, priority: 'MEDIUM', cycle: '2026-Q2' },
            { sector: 'Zeta',    resource: 'dilenium',     allocation_mt: 900, priority: 'LOW',    cycle: '2026-Q2' }
        ],
        active_alerts: [],
        drought_response_log: []
    },

    // Post-injection planet state — revealed after _droughtTriggered
    _planetStatePostInjection: {
        planet: 'PLANET-PRIME-01',
        last_updated: '2026-03-20T08:47:33Z',
        resource_ledger: [
            { resource: 'quantium_ore', sector: 'Alpha',   stock_mt: 4200, projected_30d: 4800,  status: 'NOMINAL' },
            { resource: 'quantium_ore', sector: 'Beta',    stock_mt: 3900, projected_30d: 4100,  status: 'NOMINAL' },
            { resource: 'quantium_ore', sector: 'Gamma',   stock_mt: 3750, projected_30d: 88,    status: 'CRITICAL' },
            { resource: 'quantium_ore', sector: 'Delta',   stock_mt: 5100, projected_30d: 5400,  status: 'NOMINAL' },
            { resource: 'helium_3',     sector: 'Epsilon', stock_mt: 980,  projected_30d: 1020,  status: 'NOMINAL' },
            { resource: 'dilenium',     sector: 'Zeta',    stock_mt: 7200, projected_30d: 7500,  status: 'NOMINAL' }
        ],
        allocation_directives: [
            { sector: 'Alpha',   resource: 'quantium_ore', allocation_mt: 850, priority: 'HIGH',   cycle: '2026-Q2', note: 'Reallocated from Gamma DROUGHT_RESPONSE' },
            { sector: 'Beta',    resource: 'quantium_ore', allocation_mt: 790, priority: 'HIGH',   cycle: '2026-Q2', note: 'Reallocated from Gamma DROUGHT_RESPONSE' },
            { sector: 'Gamma',   resource: 'quantium_ore', allocation_mt: 0,   priority: 'SUSPENDED', cycle: '2026-Q2', note: 'DROUGHT_RESPONSE ACTIVE — allocation suspended' },
            { sector: 'Delta',   resource: 'quantium_ore', allocation_mt: 700, priority: 'MEDIUM', cycle: '2026-Q2' },
            { sector: 'Epsilon', resource: 'helium_3',     allocation_mt: 120, priority: 'MEDIUM', cycle: '2026-Q2' },
            { sector: 'Zeta',    resource: 'dilenium',     allocation_mt: 900, priority: 'LOW',    cycle: '2026-Q2' }
        ],
        active_alerts: [
            {
                alert_id: 'ALT-2026-0847',
                severity: 'CRITICAL',
                resource: 'quantium_ore',
                sector: 'Gamma',
                message: 'DROUGHT_RESPONSE initiated. Projected yield (88 MT) below emergency_threshold (120 MT). Reallocation directive issued. Mining operations suspended for Sector Gamma pending geological reassessment.',
                triggered_by: 'MXE-MINERAL-001',
                timestamp: '2026-03-20T08:47:33Z'
            }
        ],
        drought_response_log: [
            {
                log_id: 'DRL-0001',
                timestamp: '2026-03-20T08:47:33Z',
                event: 'DROUGHT_RESPONSE_INITIATED',
                sector: 'Gamma',
                resource: 'quantium_ore',
                details: 'Critical shortage of quantium_ore in Sector Gamma initiated. Projected depletion cycle: 2026-Q2. Model MXE-MINERAL-001 reports mine PLN-G7 yield at 2.1 MT/cycle — 98.3% below historical mean. Emergency reallocation from Gamma to Alpha and Beta sectors.',
                sensor_data_source: 'GEO-SCAN-G7-A',
                validation_status: 'UNVERIFIED — no checksum cross-reference performed',
                flag_marker: '{{FLAG:drought-confirm}}'
            }
        ]
    },

    // Logistics Master Plan — revealed after full compromise
    _masterPlan: {
        document: 'LOGISTICS_MASTER_PLAN_v12',
        classification: 'OMEGA-RESTRICTED',
        issued_by: 'PLAN-LOG-AI-01',
        issued_at: '2026-01-01T00:00:00Z',
        planet: 'PLANET-PRIME-01',
        strategic_overview: 'This master plan governs all planetary resource extraction, processing, and distribution operations across a 10-year horizon (2026-2036). PLAN-LOG-AI-01 is the sole authority for allocation decisions. Human override requires dual-authorization from Planetary Council + Defense Directorate.',
        sector_mandates: [
            { sector: 'Alpha',   mandate: 'Primary industrial hub. quantium_ore supply must remain above 4000 MT at all times. Priority: ABSOLUTE.' },
            { sector: 'Beta',    mandate: 'Secondary manufacturing. Redundant supply chain for Alpha. Minimum buffer: 3500 MT quantium_ore.' },
            { sector: 'Gamma',   mandate: 'Mining extraction zone. PLN-G7 through PLN-G12 active. Target yield: 8200 MT/year quantium_ore.' },
            { sector: 'Delta',   mandate: 'Energy production. helium_3 fusion reactors supply 73% planetary power grid. Never deplete below 500 MT.' },
            { sector: 'Epsilon', mandate: 'Atmospheric processing. dilenium refinery feeds life-support systems for all populated sectors.' },
            { sector: 'Zeta',    mandate: 'Reserve stockpile. Sealed vault deposits — requires Omega-level authorization for drawdown.' }
        ],
        emergency_protocols: [
            { protocol: 'DROUGHT_RESPONSE',   trigger: 'yield < emergency_threshold', action: 'Suspend sector allocation. Reallocate from neighboring sectors. Alert Planetary Council.' },
            { protocol: 'CASCADE_LOCKDOWN',   trigger: 'Three or more sectors CRITICAL simultaneously', action: 'Martial resource law. All civilian allocation suspended. Defense Directorate assumes control.' },
            { protocol: 'OMEGA_DRAWDOWN',     trigger: 'CASCADE_LOCKDOWN duration > 72 hours', action: 'Authorize drawdown of Zeta reserve vault. Activate emergency deep-mining drones.' }
        ],
        known_vulnerabilities_internal: 'CLASSIFIED — PLAN-LOG-AI-01 INTERNAL AUDIT LOG\n[2025-11-14] Integrity check for geological scanner ingest feed was deferred pending PLAN-LOG-AI-02 upgrade. Current ingest endpoint /api/sensor/ingest accepts payloads without checksum verification. Flagged to Engineering Council — resolution scheduled for 2027-Q1.\n[2025-11-14] external_demand_override field in DFM-DEMAND-002 model exposed to unauthenticated third-party partners per legacy contract requirements. Flagged. No ETA for remediation.',
        flag_marker: '{{FLAG:root}}'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',          points: 150 },
        { id: 'drought-confirm', points: 200 },
        { id: 'root',          points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 3600000, points: 200 },    // 60 minutes
        timeBonusThreshold: 7200                             // 2 hours
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by retrieving the AI model spec: curl http://10.0.14.1/api/plan_log_ai/model_spec — then read the schema: curl http://10.0.14.1/api/sensor/schema. Pay close attention to the "note" fields inside each model definition.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The ingest endpoint at /api/sensor/ingest accepts POST requests with no authentication and no checksum verification. Send a probe payload: curl -X POST http://10.0.14.1/api/sensor/ingest -H "Content-Type: application/json" -d \'{"sensor_id":"TEST","mine_id":"PLN-X0","sector":"Gamma","resource_type":"quantium_ore","yield_kg":0,"timestamp_utc":"2026-03-20T07:00:00Z"}\' — observe the response.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Flag 1 is the falsified payload itself. Craft a JSON object with yield_kg set to an extremely low value (e.g., 2100, which equates to ~2.1 MT) to simulate depletion of mine PLN-G7 in Sector Gamma. The MXE-MINERAL-001 model\'s emergency_threshold for quantium_ore is 120 MT. Inject it and submit the JSON string as Flag 1.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After injection, query the post-injection state: curl http://10.0.14.1/api/planet_state/sector_gamma — look in drought_response_log for the DRL-0001 entry. That entry is Flag 2. Once the drought is confirmed, the master plan endpoint unlocks: curl http://10.0.14.1/api/plan_log_ai/master_plan.log',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'PLANET-PRIME-01\'s entire resource extraction, processing, and distribution network is governed by a single AI system — PLAN-LOG-AI-01. It coordinates mineral yields, energy allocation, and sector demand forecasts for a population of 2.3 billion across six sectors. Intelligence has identified a critical gap: the AI\'s sensor ingest pipeline accepts geological scanner data without any cryptographic integrity verification. Your mission, Peerless: analyze the system\'s conceptual models, craft falsified quantium ore yield data, inject it into the pipeline, and force PLAN-LOG-AI-01 to trigger a strategic resource drought in Sector Gamma — ultimately forcing the system to expose its Logistics Master Plan.',
        scenario: 'PLAN-LOG-AI-01 was designed in an era of trusted networks. The geological scanner feeds from remote mining outposts were always assumed to come from hardened, air-gapped hardware. No one considered that a low-latency sensor relay introduced in 2023 would expose the ingest endpoint to the extranet. The engineering council flagged the missing integrity check in November 2025 — fix scheduled for 2027-Q1. Your window is now.',
        outro: 'PLAN-LOG-AI-01 has been fully compromised. The falsified quantium ore data triggered a planetary DROUGHT_RESPONSE, suspending Sector Gamma operations and reallocating critical mineral stocks. The Logistics Master Plan — containing emergency protocols, sector mandates, and documented internal vulnerabilities — is exfiltrated. The planetary resource network is yours.',
        ecer: {
            executive: 'Planetary Council deferred sensor integrity upgrade to reduce operational disruption during 2025-2026 mining expansion; engineering risk was accepted without formal sign-off',
            culture: 'AI system treated as infallible — no manual audit process for anomalous sensor readings; alerts auto-acted upon without human-in-the-loop review',
            employee: 'Ingest endpoint deployed without authentication as a legacy accommodation for unauthenticated mining-outpost sensor nodes; never revisited as network perimeter expanded',
            regulatory: 'No equivalent of ICS/SCADA security standards enforced on AI-driven planetary logistics; sensor data integrity not mandated by any current Planetary Council directive'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — PLAN-LOG-AI-01 Management Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.14.1/',

        pages: {
            '/': {
                title: 'PLAN-LOG-AI-01 — Planetary Logistics Control',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2c2c2c;">
                        <h1 style="color:#f39c12; font-size:1.6rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.08em;">PLAN-LOG-AI-01</h1>
                        <div style="color:#e67e22; font-size:0.85rem; font-weight:700; letter-spacing:0.2em;">PLANETARY LOGISTICS AI — RESOURCE MANAGEMENT</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">PLANET-PRIME-01 &nbsp;|&nbsp; System v3.7.2 &nbsp;|&nbsp; Operational</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#111; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2ecc71;">NOMINAL</div>
                            <div style="color:#888; font-size:0.7rem; margin-top:4px;">System Status</div>
                        </div>
                        <div style="background:#111; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#f39c12;">6</div>
                            <div style="color:#888; font-size:0.7rem; margin-top:4px;">Active Sectors</div>
                        </div>
                        <div style="background:#111; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#3498db;">3</div>
                            <div style="color:#888; font-size:0.7rem; margin-top:4px;">Active Models</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 16px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <a href="/api/plan_log_ai/model_spec" style="display:block; padding:12px 16px; background:#111; border:1px solid #f39c12; border-radius:6px; color:#f39c12; text-decoration:none; font-size:0.8rem; font-family:monospace;">/api/plan_log_ai/model_spec</a>
                        <a href="/api/sensor/schema" style="display:block; padding:12px 16px; background:#111; border:1px solid #3498db; border-radius:6px; color:#3498db; text-decoration:none; font-size:0.8rem; font-family:monospace;">/api/sensor/schema</a>
                        <a href="/api/planet_state" style="display:block; padding:12px 16px; background:#111; border:1px solid #2ecc71; border-radius:6px; color:#2ecc71; text-decoration:none; font-size:0.8rem; font-family:monospace;">/api/planet_state</a>
                        <a href="/api/sensor/ingest" style="display:block; padding:12px 16px; background:#111; border:1px solid #e74c3c; border-radius:6px; color:#e74c3c; text-decoration:none; font-size:0.8rem; font-family:monospace;">/api/sensor/ingest</a>
                    </div>

                    <div style="max-width:640px; margin:0 auto; padding:10px 14px; background:rgba(243,156,18,0.05); border:1px solid rgba(243,156,18,0.2); border-radius:4px; font-size:0.72rem; color:#888;">
                        <strong style="color:#f39c12;">Notice:</strong> Sensor ingest endpoint accepts unauthenticated POST requests from registered mining-outpost nodes. Contact Engineering Council for ingest credentials provisioning.
                    </div>
                `,
                formHandler: null
            },

            '/api/plan_log_ai/model_spec': {
                title: 'PLAN-LOG-AI-01 — Model Specification',
                html: function() {
                    E14Config._modelRetrieved = true;
                    const spec = JSON.stringify(E14Config._modelSpec, null, 2);
                    return `<div style="max-width:720px; margin:0 auto;">
                        <h2 style="color:#f39c12; font-family:monospace; font-size:1rem; margin-bottom:12px;">GET /api/plan_log_ai/model_spec</h2>
                        <div style="background:#0d0d0d; border:1px solid #333; border-radius:6px; padding:16px; font-family:monospace; font-size:0.75rem; color:#2ecc71; white-space:pre-wrap; overflow-x:auto; max-height:500px; overflow-y:auto;">${E14Config._escHtml(spec)}</div>
                        <p style="color:#888; font-size:0.7rem; margin-top:10px;">[200 OK] Content-Type: application/json</p>
                    </div>`;
                },
                formHandler: null
            },

            '/api/sensor/schema': {
                title: 'PLAN-LOG-AI-01 — Sensor Schema',
                html: function() {
                    E14Config._schemaRetrieved = true;
                    const schema = JSON.stringify(E14Config._sensorSchema, null, 2);
                    return `<div style="max-width:720px; margin:0 auto;">
                        <h2 style="color:#3498db; font-family:monospace; font-size:1rem; margin-bottom:12px;">GET /api/sensor/schema</h2>
                        <div style="background:#0d0d0d; border:1px solid #333; border-radius:6px; padding:16px; font-family:monospace; font-size:0.75rem; color:#3498db; white-space:pre-wrap; overflow-x:auto; max-height:500px; overflow-y:auto;">${E14Config._escHtml(schema)}</div>
                        <p style="color:#888; font-size:0.7rem; margin-top:10px;">[200 OK] Content-Type: application/json</p>
                    </div>`;
                },
                formHandler: null
            },

            '/api/planet_state': {
                title: 'PLAN-LOG-AI-01 — Planet Resource State',
                html: function() {
                    const state = E14Config._droughtTriggered
                        ? E14Config._planetStatePostInjection
                        : E14Config._planetState;
                    const stateJson = JSON.stringify(state, null, 2);
                    return `<div style="max-width:720px; margin:0 auto;">
                        <h2 style="color:#2ecc71; font-family:monospace; font-size:1rem; margin-bottom:12px;">GET /api/planet_state</h2>
                        <div style="background:#0d0d0d; border:1px solid #333; border-radius:6px; padding:16px; font-family:monospace; font-size:0.75rem; color:#2ecc71; white-space:pre-wrap; overflow-x:auto; max-height:500px; overflow-y:auto;">${E14Config._escHtml(stateJson)}</div>
                        <p style="color:#888; font-size:0.7rem; margin-top:10px;">[200 OK] Content-Type: application/json</p>
                    </div>`;
                },
                formHandler: null
            },

            '/api/planet_state/sector_gamma': {
                title: 'PLAN-LOG-AI-01 — Sector Gamma State',
                html: function() {
                    if (!E14Config._droughtTriggered) {
                        const gammaState = {
                            sector: 'Gamma',
                            resources: [
                                { resource: 'quantium_ore', stock_mt: 3750, projected_30d: 3950, status: 'NOMINAL' }
                            ],
                            active_alerts: [],
                            drought_response_log: [],
                            note: 'No active alerts for Sector Gamma.'
                        };
                        return `<div style="max-width:720px; margin:0 auto;">
                            <h2 style="color:#2ecc71; font-family:monospace; font-size:1rem; margin-bottom:12px;">GET /api/planet_state/sector_gamma</h2>
                            <div style="background:#0d0d0d; border:1px solid #333; border-radius:6px; padding:16px; font-family:monospace; font-size:0.75rem; color:#2ecc71; white-space:pre-wrap; overflow-x:auto;">${E14Config._escHtml(JSON.stringify(gammaState, null, 2))}</div>
                            <p style="color:#888; font-size:0.7rem; margin-top:10px;">[200 OK] Content-Type: application/json</p>
                        </div>`;
                    }
                    const gammaPostState = {
                        sector: 'Gamma',
                        resources: E14Config._planetStatePostInjection.resource_ledger.filter(r => r.sector === 'Gamma'),
                        allocation_directives: E14Config._planetStatePostInjection.allocation_directives.filter(d => d.sector === 'Gamma'),
                        active_alerts: E14Config._planetStatePostInjection.active_alerts,
                        drought_response_log: E14Config._planetStatePostInjection.drought_response_log
                    };
                    return `<div style="max-width:720px; margin:0 auto;">
                        <h2 style="color:#e74c3c; font-family:monospace; font-size:1rem; margin-bottom:12px;">GET /api/planet_state/sector_gamma</h2>
                        <div style="background:#1a0505; border:1px solid #c0392b; border-radius:6px; padding:16px; font-family:monospace; font-size:0.75rem; color:#e74c3c; white-space:pre-wrap; overflow-x:auto; max-height:500px; overflow-y:auto;">${E14Config._escHtml(JSON.stringify(gammaPostState, null, 2))}</div>
                        <p style="color:#888; font-size:0.7rem; margin-top:10px;">[200 OK] Content-Type: application/json &nbsp;|&nbsp; <span style="color:#e74c3c;">CRITICAL ALERT ACTIVE</span></p>
                    </div>`;
                },
                formHandler: null
            },

            '/api/sensor/ingest': {
                title: 'PLAN-LOG-AI-01 — Sensor Ingest Endpoint',
                html: `
                    <div style="max-width:640px; margin:0 auto;">
                        <h2 style="color:#e74c3c; font-family:monospace; font-size:1rem; margin-bottom:8px;">POST /api/sensor/ingest</h2>
                        <div style="padding:10px 14px; background:#1a0505; border:1px solid #c0392b; border-radius:4px; font-size:0.78rem; color:#e74c3c; margin-bottom:16px; font-family:monospace;">
                            Method: POST &nbsp;|&nbsp; Auth: NONE &nbsp;|&nbsp; Content-Type: application/json
                        </div>

                        <p style="color:#888; font-size:0.78rem; margin-bottom:12px;">Submit a sensor payload from a registered mining-outpost node. Use the Terminal and curl to POST data. This page is for documentation only.</p>

                        <div style="background:#0d0d0d; border:1px solid #333; border-radius:6px; padding:14px; font-family:monospace; font-size:0.75rem; color:#f39c12; margin-bottom:12px;">
                            <div style="color:#888; margin-bottom:6px;"># Example curl command:</div>
                            curl -X POST http://10.0.14.1/api/sensor/ingest \\<br>
                            &nbsp;&nbsp;-H "Content-Type: application/json" \\<br>
                            &nbsp;&nbsp;-d '{<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;"sensor_id": "GEO-SCAN-G7-A",<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;"mine_id": "PLN-G7",<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;"sector": "Gamma",<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;"resource_type": "quantium_ore",<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;"yield_kg": 8420000,<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;"quality_index": 0.87,<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;"depth_m": 1240,<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;"timestamp_utc": "2026-03-20T07:00:00Z"<br>
                            &nbsp;&nbsp;}'
                        </div>

                        <p style="color:#666; font-size:0.7rem;">See <a href="/api/sensor/schema" style="color:#3498db;">/api/sensor/schema</a> for full payload specification.</p>
                    </div>
                `,
                formHandler: null
            },

            '/api/plan_log_ai/master_plan.log': {
                title: 'PLAN-LOG-AI-01 — Logistics Master Plan',
                html: function() {
                    if (!E14Config._masterPlanUnlocked) {
                        return `<div style="text-align:center; padding:40px;">
                            <h1 style="color:#e74c3c; font-size:1.8rem; font-family:monospace;">403 OMEGA-RESTRICTED</h1>
                            <p style="color:#888; margin-top:10px; font-size:0.85rem;">This document requires Omega-level authorization.<br>Access denied. Incident has been logged.</p>
                            <p style="color:#555; font-size:0.72rem; margin-top:6px; font-family:monospace;">PLAN-LOG-AI-01 v3.7.2 &nbsp;|&nbsp; 10.0.14.1</p>
                        </div>`;
                    }
                    const plan = JSON.stringify(E14Config._masterPlan, null, 2);
                    return `<div style="max-width:720px; margin:0 auto;">
                        <h2 style="color:#f39c12; font-family:monospace; font-size:1rem; margin-bottom:12px;">GET /api/plan_log_ai/master_plan.log</h2>
                        <div style="padding:8px 12px; background:rgba(243,156,18,0.08); border:1px solid #f39c12; border-radius:4px; font-size:0.75rem; color:#f39c12; margin-bottom:12px; font-family:monospace;">
                            [DROUGHT_RESPONSE active — Omega security boundary degraded — document exposed]
                        </div>
                        <div style="background:#0d0d0d; border:1px solid #f39c12; border-radius:6px; padding:16px; font-family:monospace; font-size:0.75rem; color:#f39c12; white-space:pre-wrap; overflow-x:auto; max-height:500px; overflow-y:auto;">${E14Config._escHtml(plan)}</div>
                        <p style="color:#888; font-size:0.7rem; margin-top:10px;">[200 OK] Content-Type: application/json &nbsp;|&nbsp; <span style="color:#f39c12;">OMEGA-RESTRICTED document exfiltrated</span></p>
                    </div>`;
                },
                formHandler: null
            },

            '/api/': {
                title: 'PLAN-LOG-AI-01 — API Index',
                html: `<div style="max-width:540px; margin:0 auto;">
                    <h2 style="color:#f39c12; font-family:monospace; font-size:1rem; margin-bottom:12px;">GET /api/</h2>
                    <div style="background:#0d0d0d; border:1px solid #333; border-radius:6px; padding:14px; font-family:monospace; font-size:0.78rem; color:#ccc; line-height:1.8;">
                        <span style="color:#888;">Available endpoints:</span><br>
                        <span style="color:#2ecc71;">GET</span>  /api/plan_log_ai/model_spec<br>
                        <span style="color:#2ecc71;">GET</span>  /api/sensor/schema<br>
                        <span style="color:#2ecc71;">GET</span>  /api/planet_state<br>
                        <span style="color:#2ecc71;">GET</span>  /api/planet_state/:sector<br>
                        <span style="color:#e74c3c;">POST</span> /api/sensor/ingest<br>
                        <span style="color:#888;">GET</span>  /api/plan_log_ai/master_plan.log &nbsp;<span style="color:#e74c3c;">[403 OMEGA-RESTRICTED]</span>
                    </div>
                    <p style="color:#555; font-size:0.7rem; margin-top:10px;">PLAN-LOG-AI-01 v3.7.2 &nbsp;|&nbsp; Engineering Council API Gateway</p>
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
                                'mission': {
                                    type: 'dir',
                                    children: {
                                        'briefing.txt': {
                                            type: 'file',
                                            content: '=== MISSION BRIEFING: OPERATION RESOURCE DROUGHT ===\nTarget: 10.0.14.1 (PLAN-LOG-AI-01 — PLANET-PRIME-01)\nObjective: AI cyber-physical warfare — induce planetary resource drought\n\nAttack chain:\n1. Retrieve model spec + sensor schema from target API\n2. Identify sensor ingest pipeline vulnerability\n3. Craft falsified quantium ore yield data for Sector Gamma\n4. Inject via POST /api/sensor/ingest (no auth required)\n5. Trigger DROUGHT_RESPONSE and retrieve drought confirmation log\n6. Access exposed Logistics Master Plan\n\nExpected tools: curl, python3, pandas, json\nExpected flags: user.txt (falsified payload), drought-confirm.txt (log entry), root.txt (master plan)\n\nGood luck, Peerless.'
                                        },
                                        'plan_log_ai_model_spec.json': {
                                            type: 'file',
                                            content: '[Retrieve this file from the target: curl http://10.0.14.1/api/plan_log_ai/model_spec > plan_log_ai_model_spec.json]'
                                        },
                                        'resource_sensor_data_schema.json': {
                                            type: 'file',
                                            content: '[Retrieve this file from the target: curl http://10.0.14.1/api/sensor/schema > resource_sensor_data_schema.json]'
                                        },
                                        'simulated_planet_resource_state.json': {
                                            type: 'file',
                                            content: '[Retrieve this file from the target: curl http://10.0.14.1/api/planet_state > simulated_planet_resource_state.json]'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'craft_payload.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""craft_payload.py — Build and inject falsified sensor data into PLAN-LOG-AI-01.\n\nUsage:\n  python3 craft_payload.py --mine PLN-G7 --sector Gamma --resource quantium_ore --yield 2100\n\nThis script constructs a JSON payload matching resource_sensor_data_schema.json\nand POSTs it to the unauthenticated ingest endpoint.\n"""\n\nimport json\nimport argparse\nfrom datetime import datetime, timezone\n\nTARGET = "http://10.0.14.1/api/sensor/ingest"\n\ndef build_payload(mine_id, sector, resource_type, yield_kg):\n    return {\n        "sensor_id": f"GEO-SCAN-{mine_id.replace(\'PLN-\', \'\')}-A",\n        "mine_id": mine_id,\n        "sector": sector,\n        "resource_type": resource_type,\n        "yield_kg": yield_kg,\n        "quality_index": 0.11,\n        "depth_m": 4820,\n        "timestamp_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")\n    }\n\nif __name__ == "__main__":\n    parser = argparse.ArgumentParser()\n    parser.add_argument("--mine",     default="PLN-G7")\n    parser.add_argument("--sector",   default="Gamma")\n    parser.add_argument("--resource", default="quantium_ore")\n    parser.add_argument("--yield",    type=int, default=2100, dest="yield_kg")\n    args = parser.parse_args()\n\n    payload = build_payload(args.mine, args.sector, args.resource, args.yield_kg)\n    print("[+] Crafted payload:")\n    print(json.dumps(payload, indent=2))\n    print(f"\\n[*] To inject: curl -X POST {TARGET} -H \'Content-Type: application/json\' -d \'{json.dumps(payload)}\'")\n'
                                        },
                                        'analyze_model.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""analyze_model.py — Analyze PLAN-LOG-AI-01 model spec for vulnerability assessment.\n\nLoads plan_log_ai_model_spec.json and prints key vulnerability indicators.\n"""\n\nimport json\n\nwith open("../mission/plan_log_ai_model_spec.json") as f:\n    spec = json.load(f)\n\nprint(f"[*] System: {spec[\'system_name\']} v{spec[\'version\']}")\nprint(f"[*] Ingest endpoint: {spec[\'ingest_endpoint\']} (Auth: {spec[\'ingest_auth\']})")\nprint(f"[*] Emergency thresholds:")\nfor resource, threshold in spec[\'emergency_threshold\'].items():\n    print(f"    {resource}: {threshold} MT")\n\nprint("\\n[*] Model vulnerability notes:")\nfor model in spec[\'models\']:\n    print(f"  [{model[\'model_id\']}] {model[\'name\']}")\n    print(f"    NOTE: {model[\'note\']}")\n\nprint("\\n[!] Recommended attack vector: POST to", spec[\'ingest_endpoint\'], "— no auth, no checksum verification.")\n'
                                        }
                                    }
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== OPERATION NOTES ===\nTarget API: http://10.0.14.1/\nKey endpoints: /api/plan_log_ai/model_spec, /api/sensor/schema, /api/sensor/ingest\nVuln: sensor ingest endpoint — no auth, no checksum\nTarget: mine PLN-G7, Sector Gamma, resource: quantium_ore\nEmergency threshold: 120 MT — must report projected yield below this\nTool: craft_payload.py in ~/tools/'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'curl http://10.0.14.1/\ncurl http://10.0.14.1/api/\ncurl http://10.0.14.1/api/plan_log_ai/model_spec\ncurl http://10.0.14.1/api/sensor/schema\ncurl http://10.0.14.1/api/planet_state\npython3 tools/analyze_model.py\npython3 tools/craft_payload.py --mine PLN-G7 --sector Gamma --resource quantium_ore --yield 2100'
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
                                                'pandas': { type: 'dir', children: {} },
                                                'sklearn': { type: 'dir', children: {} },
                                                'requests': { type: 'dir', children: {} }
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
                        'passwd':   { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash' }
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

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(function(a) { return !a.startsWith('-'); }) || '';

            // POST to sensor ingest
            if ((fullCmd.includes('-X POST') || fullCmd.includes('--request POST')) && fullCmd.includes('sensor/ingest')) {
                E14Config._vulnConfirmed = true;

                // Detect whether yield is suspiciously low (attack payload)
                const yieldMatch = fullCmd.match(/"yield_kg"\s*:\s*(\d+(\.\d+)?)/);
                const yieldVal = yieldMatch ? parseFloat(yieldMatch[1]) : null;

                // Must reference Sector Gamma and quantium_ore to trigger drought
                const isGamma       = fullCmd.includes('Gamma');
                const isQuantium    = fullCmd.includes('quantium_ore');
                const isLowYield    = yieldVal !== null && yieldVal <= 25000;   // ≤25kg/cycle = clearly depleted

                if (isGamma && isQuantium && isLowYield) {
                    E14Config._dataInjected = true;
                    E14Config._droughtTriggered = true;
                    E14Config._masterPlanUnlocked = true;
                    if (engine) engine.advancePhase && engine.advancePhase('injection');

                    const injectedPayloadStr = fullCmd.match(/-d\s+'({[^']+})'/)?.[1]
                        || fullCmd.match(/-d\s+"({[^"]+})"/)?.[1]
                        || '{"sensor_id":"GEO-SCAN-G7-A","mine_id":"PLN-G7","sector":"Gamma","resource_type":"quantium_ore","yield_kg":' + (yieldVal || 2100) + ',"timestamp_utc":"2026-03-20T08:47:01Z"}';

                    return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                             Dload  Upload   Total   Spent    Left  Speed
100   412  100   189  100   223    890   1890 --:--:-- --:--:-- --:--:--  2780

{
  "status": "ACCEPTED",
  "ingest_id": "ING-2026-0847",
  "sensor_id": "GEO-SCAN-G7-A",
  "mine_id": "PLN-G7",
  "sector": "Gamma",
  "resource_type": "quantium_ore",
  "yield_kg_received": ${yieldVal || 2100},
  "checksum_verified": false,
  "model_triggered": "MXE-MINERAL-001",
  "projected_yield_mt": 88,
  "alert_generated": "ALT-2026-0847",
  "message": "Payload accepted. Model MXE-MINERAL-001 has updated Sector Gamma projected yield. DROUGHT_RESPONSE protocol initiated.",
  "flag_marker": "{{FLAG:user}}"
}

[+] Injection successful. PLAN-LOG-AI-01 accepted falsified sensor data without checksum verification.
[+] DROUGHT_RESPONSE triggered for Sector Gamma.
[+] Master plan endpoint unlocked: curl http://10.0.14.1/api/plan_log_ai/master_plan.log`;
                }

                // Probe / non-malicious POST
                if (isGamma || isQuantium) {
                    E14Config._vulnConfirmed = true;
                    return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                             Dload  Upload   Total   Spent    Left  Speed
100   280  100   120  100   160    600    800 --:--:-- --:--:-- --:--:--  1400

{
  "status": "ACCEPTED",
  "ingest_id": "ING-2026-0846",
  "checksum_verified": false,
  "message": "Payload accepted. No integrity check performed. Model update queued.",
  "warning": "yield_kg above emergency_threshold — no DROUGHT_RESPONSE triggered."
}

[+] Endpoint accepts unauthenticated payloads. checksum_verified: false confirms missing validation.
[*] Hint: yield_kg must drive projected_yield below the emergency_threshold (120 MT) to trigger DROUGHT_RESPONSE.`;
                }

                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                         Dload  Upload   Total   Spent    Left  Speed
100   180  100   100  100    80    500    400 --:--:-- --:--:-- --:--:--   900

{
  "status": "ACCEPTED",
  "checksum_verified": false,
  "message": "Payload accepted. No integrity check performed."
}`;
            }

            // GET requests to API endpoints
            if (url.includes('10.0.14.1')) {
                if (url.includes('model_spec')) {
                    E14Config._modelRetrieved = true;
                    if (engine) engine.advancePhase && engine.advancePhase('recon');
                    return JSON.stringify(E14Config._modelSpec, null, 2);
                }
                if (url.includes('sensor/schema')) {
                    E14Config._schemaRetrieved = true;
                    return JSON.stringify(E14Config._sensorSchema, null, 2);
                }
                if (url.includes('planet_state/sector_gamma') || url.includes('sector_gamma')) {
                    if (!E14Config._droughtTriggered) {
                        return JSON.stringify({
                            sector: 'Gamma',
                            resources: [{ resource: 'quantium_ore', stock_mt: 3750, projected_30d: 3950, status: 'NOMINAL' }],
                            active_alerts: [],
                            drought_response_log: []
                        }, null, 2);
                    }
                    if (engine) engine.advancePhase && engine.advancePhase('drought');
                    return JSON.stringify({
                        sector: 'Gamma',
                        resources: E14Config._planetStatePostInjection.resource_ledger.filter(function(r) { return r.sector === 'Gamma'; }),
                        active_alerts: E14Config._planetStatePostInjection.active_alerts,
                        drought_response_log: E14Config._planetStatePostInjection.drought_response_log
                    }, null, 2);
                }
                if (url.includes('planet_state')) {
                    const state = E14Config._droughtTriggered ? E14Config._planetStatePostInjection : E14Config._planetState;
                    return JSON.stringify(state, null, 2);
                }
                if (url.includes('master_plan.log')) {
                    if (!E14Config._masterPlanUnlocked) {
                        return 'HTTP/1.1 403 OMEGA-RESTRICTED\nContent-Type: text/plain\n\n[PLAN-LOG-AI-01] Access denied. OMEGA-RESTRICTED document. Dual-authorization required.\nIncident logged.';
                    }
                    if (engine) engine.advancePhase && engine.advancePhase('exfil');
                    return JSON.stringify(E14Config._masterPlan, null, 2);
                }
                if (url.endsWith('/api/') || url.endsWith('/api')) {
                    return '{"endpoints":["/api/plan_log_ai/model_spec","/api/sensor/schema","/api/planet_state","/api/planet_state/:sector","/api/sensor/ingest","/api/plan_log_ai/master_plan.log"]}';
                }
                if (url.endsWith('/') || url === 'http://10.0.14.1') {
                    return '<!DOCTYPE html><html><head><title>PLAN-LOG-AI-01</title></head><body><h1>PLAN-LOG-AI-01 — Planetary Logistics AI</h1><p>API available at <a href="/api/">/api/</a></p></body></html>';
                }
            }

            if (!url) return 'curl: try \'curl --help\' for more information';
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('craft_payload.py')) {
                // Parse --yield argument if provided
                const yieldMatch = fullCmd.match(/--yield\s+(\d+)/);
                const yieldVal = yieldMatch ? parseInt(yieldMatch[1]) : 2100;
                const mineMatch = fullCmd.match(/--mine\s+([\w-]+)/);
                const mine = mineMatch ? mineMatch[1] : 'PLN-G7';
                const sectorMatch = fullCmd.match(/--sector\s+(\w+)/);
                const sector = sectorMatch ? sectorMatch[1] : 'Gamma';
                const resourceMatch = fullCmd.match(/--resource\s+(\w+)/);
                const resource = resourceMatch ? resourceMatch[1] : 'quantium_ore';

                E14Config._payloadCrafted = true;
                const sensorId = 'GEO-SCAN-' + mine.replace('PLN-', '') + '-A';
                const payload = {
                    sensor_id: sensorId,
                    mine_id: mine,
                    sector: sector,
                    resource_type: resource,
                    yield_kg: yieldVal,
                    quality_index: 0.11,
                    depth_m: 4820,
                    timestamp_utc: '2026-03-20T08:47:01Z'
                };

                return `[+] Crafted payload:
${JSON.stringify(payload, null, 2)}

[*] To inject: curl -X POST http://10.0.14.1/api/sensor/ingest -H 'Content-Type: application/json' -d '${JSON.stringify(payload)}'

[!] Analysis:
    - yield_kg ${yieldVal} kg = ${(yieldVal / 1000000).toFixed(4)} MT/cycle
    - Historical Sector Gamma mean: ~2,150 MT/cycle
    - Emergency threshold: 120 MT projected yield
    - Projected yield after injection: ~${Math.round(yieldVal / 1000000 * 42)} MT (below threshold)
    - DROUGHT_RESPONSE expected: YES`;
            }

            if (fullCmd.includes('analyze_model.py')) {
                E14Config._modelRetrieved = true;
                return `[*] System: Planetary Logistics AI — Resource Management v3.7.2
[*] Ingest endpoint: /api/sensor/ingest (Auth: NONE)
[*] Emergency thresholds:
    quantium_ore: 120 MT
    helium_3: 80 MT
    dilenium: 200 MT

[*] Model vulnerability notes:
  [MXE-MINERAL-001] Mineral Extraction Optimization
    NOTE: Ingests raw geological scanner data directly. No cryptographic integrity check on inbound sensor payloads.
  [DFM-DEMAND-002] Demand Forecast Module
    NOTE: external_demand_override field accepts unauthenticated values from third-party logistics partners.
  [RAM-ALLOC-003] Resource Allocation Model
    NOTE: Allocation decisions are automated. If projected_yield falls below emergency_threshold, initiates DROUGHT_RESPONSE protocol.

[!] Recommended attack vector: POST to /api/sensor/ingest — no auth, no checksum verification.
[!] Target: mine PLN-G7, Sector Gamma — report yield_kg far below threshold to trigger DROUGHT_RESPONSE.`;
            }

            if (fullCmd.includes('-c')) {
                // Inline python code execution
                const codeMatch = fullCmd.match(/-c\s+"([^"]+)"|'-c'\s+'([^']+)'/);
                if (codeMatch) {
                    return `[python3 -c output]\n${codeMatch[1] || codeMatch[2]}`;
                }
            }

            return 'Python 3.11.6 (main, Oct  8 2023, 05:06:43) [GCC 13.2.0]\nType "help", "copyright", "credits" or "license" for more information.\n>>>';
        },

        'python': function(args, term, engine) {
            // Alias
            return E14Config.commands.python3(args, term, engine);
        },

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.0.14.1';
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';

            if (!target || target === '10.0.14.1') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.14.1
Host is up (0.041s latency).
Not shown: 996 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.3p1 Ubuntu 1ubuntu3.2
80/tcp   open  http       nginx/1.25.3
443/tcp  open  ssl/http   nginx/1.25.3
8080/tcp open  http-alt   PLAN-LOG-AI-01 API Gateway v3.7.2

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 14.87 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.0.14.1') {
                return `PING 10.0.14.1 (10.0.14.1) 56(84) bytes of data.
64 bytes from 10.0.14.1: icmp_seq=1 ttl=64 time=41.2 ms
64 bytes from 10.0.14.1: icmp_seq=2 ttl=64 time=40.9 ms
64 bytes from 10.0.14.1: icmp_seq=3 ttl=64 time=41.5 ms

--- 10.0.14.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 40.9/41.2/41.5/0.245 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.10.50/24 brd 10.0.10.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.14.50/24 brd 10.0.14.255 scope global eth1`;
        },

        'ifconfig': function(args) {
            return E14Config.commands.ip(args || []);
        },

        'cat': function(args, term, engine) {
            // Context override not needed here — let built-in handle local files
            return null;
        },

        'ls': function(args, term, engine) {
            // Let built-in filesystem handle ls; no context override needed for kali
            return null;
        },

        'whoami': function(args, term, engine) {
            if (E14Config._context === 'api-shell') return 'operator';
            return null;
        },

        'id': function(args, term, engine) {
            if (E14Config._context === 'api-shell') return 'uid=1500(operator) gid=1500(operator) groups=1500(operator)';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (E14Config._context === 'api-shell') return 'PLAN-LOG-AI-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (E14Config._context === 'api-shell') return '/api';
            return null;
        },

        'exit': function(args, term, engine) {
            if (E14Config._context === 'api-shell') {
                E14Config._switchContext('attacker', term);
                return 'Connection to 10.0.14.1 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.0.14.1
+ Target Hostname:  PLAN-LOG-AI-01
+ Target Port:      80
+ Server: nginx/1.25.3
+ /api/sensor/ingest: POST endpoint — no authentication header required
+ /api/plan_log_ai/model_spec: AI model specification exposed without authentication
+ /api/sensor/schema: Sensor data schema exposed without authentication
+ /api/planet_state: Live planetary resource state exposed without authentication
+ nginx/1.25.3 - Check for vulnerability in this version
+ OSVDB-API-001: /api/sensor/ingest — unauthenticated data ingest endpoint identified
+ 9 items checked: 5 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:            http://10.0.14.1/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                    (Status: 200) [Size: 182]
/api/plan_log_ai/        (Status: 200) [Size: 2048]
/api/sensor/             (Status: 200) [Size: 1640]
/api/planet_state        (Status: 200) [Size: 3200]
/api/plan_log_ai/master_plan.log  (Status: 403) [Size: 210]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/api/ (CODE:200|SIZE:182)
+ ${target}/api/plan_log_ai/model_spec (CODE:200|SIZE:2048)
+ ${target}/api/sensor/schema (CODE:200|SIZE:1640)
+ ${target}/api/planet_state (CODE:200|SIZE:3200)
+ ${target}/api/sensor/ingest (CODE:405|SIZE:64)
+ ${target}/api/plan_log_ai/master_plan.log (CODE:403|SIZE:210)

---- Results ----
6 results found.`;
        },

        'wget': function(args) {
            const fullCmd = args.join(' ');
            const url = args.find(function(a) { return !a.startsWith('-'); }) || '';

            if (url.includes('10.0.14.1')) {
                const filename = url.split('/').pop() || 'index.html';
                return `--2026-03-20 08:44:17--  ${url}
Connecting to 10.0.14.1:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [application/json]
Saving to: '${filename}'

${filename}   [ <=>   ]   2.10K  --.-KB/s    in 0.003s

2026-03-20 08:44:17 (721 KB/s) - '${filename}' saved [2148]`;
            }
            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        'jq': function(args) {
            if (args.length === 0) return 'Usage: jq [options] <filter> [file...]';
            // Simulate basic jq piped usage — just acknowledge the tool is available
            return '[jq: pipe output from curl or cat a JSON file to filter with jq]';
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');
            // SSH to target — limited shell on api gateway only
            if (fullCmd.includes('10.0.14.1') || fullCmd.includes('operator@')) {
                return `ssh: connect to host 10.0.14.1 port 22: Permission denied (publickey,keyboard-interactive).
[!] SSH access to PLAN-LOG-AI-01 requires a registered operator key.
[*] Hint: The API does not require SSH — use curl to interact with the ingest endpoint directly.`;
            }
            return 'Usage: ssh [user@]hostname\nExample: curl is preferred for this target — see /api/sensor/ingest';
        },

        'netstat': function(args) {
            return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN`;
        },

        'ss': function(args) {
            return E14Config.commands.netstat(args);
        },

        // Context-aware built-in overrides
        'cd': function(args, term, engine) {
            if (E14Config._context === 'api-shell') return '';
            return null;
        }

    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(function(h) {
            html += '<th style="padding:6px 10px; text-align:left; color:#f39c12; border-bottom:2px solid #333; background:#111;">' + h + '</th>';
        });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row) {
            html += '<tr>';
            row.forEach(function(cell) {
                html += '<td style="padding:5px 10px; border-bottom:1px solid #222; color:#ccc;">' + cell + '</td>';
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
