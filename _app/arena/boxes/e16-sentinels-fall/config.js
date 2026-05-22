/* ============================================================
   CTF ARENA — Box E16: The Sentinel's Fall
   Expert Campaign | AI Subversion, Sensor Spoofing, Planetary Defense Compromise
   Config: filesystem, artifacts, AI pipeline, web API, flags, hints, lore
   ============================================================ */

const E16Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: "The Sentinel's Fall",
    subtitle: 'Expert Campaign — AI Subversion, Sensor Spoofing, Planetary Defense Compromise',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_e16',
    registryId: 'e16-sentinels-fall',
    trackerKey: 'ctf_e16',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer AI attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Model Analysis',
            icon: '\uD83E\uDDE0',
            description: 'Analyze AEGIS-AI-01 threat assessment model specs and sensor data schema. Identify the blind spot in radar classification logic.',
            requiredFlags: [],
            mitre: ['T1595.002', 'T1590', 'T1082'],
            unlocks: ['spoofing'],
            locked: false
        },
        {
            id: 'spoofing',
            name: 'Sensor Fabrication',
            icon: '\uD83D\uDCE1',
            description: 'Craft a falsified sensor data payload targeting FRIENDLY-FLEET-01. Exploit the radar signature blind spot and inflate energy readings.',
            requiredFlags: [],
            mitre: ['T1565.002', 'T1496', 'T1499.004'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Pipeline Injection',
            icon: '\uD83D\uDC89',
            description: 'Inject the falsified sensor payload into AEGIS-AI-01 input stream via the unvalidated /api/sensor_ingest endpoint. Trigger misclassification.',
            requiredFlags: ['user'],
            mitre: ['T1190', 'T1565.001', 'T1059.006'],
            unlocks: ['escalation'],
            locked: true
        },
        {
            id: 'escalation',
            name: 'Attack Confirmation',
            icon: '\uD83D\uDD25',
            description: 'Observe the unauthorized attack log entry in fleet movement data confirming AEGIS-AI-01 misidentified FRIENDLY-FLEET-01 as hostile.',
            requiredFlags: ['sensor'],
            mitre: ['T1485', 'T1489', 'T1491.002'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Protocol Extraction',
            icon: '\uD83D\uDD10',
            description: 'Access the AEGIS fallback protocol log endpoint. Extract the master override code that disables all planetary defense directives.',
            requiredFlags: ['attack'],
            mitre: ['T1530', 'T1005', 'T1567'],
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
                title: 'Analyze the AEGIS-AI-01 model specification',
                tip: 'Open the Terminal and run: cat /home/operator/artifacts/aegis_threat_model_spec.json — or browse to http://10.44.7.1/api/model_spec in Firefox.',
                trigger: { event: 'command', match: { cmd: 'contains:aegis_threat_model_spec' } }
            },
            {
                title: 'Review the sensor data schema and fleet movement logs',
                tip: 'Read defense_sensor_data_schema.json and simulated_fleet_movement.json to understand what fields AEGIS-AI-01 consumes and what the normal fleet profile looks like.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:sensor_data_schema' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:fleet_movement' } }
                    ]
                }
            },
            {
                title: 'Craft the falsified sensor payload (Flag 1)',
                tip: 'Use python3 to generate a JSON payload that spoofs FRIENDLY-FLEET-01 radar signature as hostile. Set radar_class to "HOSTILE-PATTERN-7" and energy_signature above 9800. Save as spoofed_sensor.json.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Inject the payload and confirm misclassification (Flag 2)',
                tip: 'POST your spoofed_sensor.json to http://10.44.7.1/api/sensor_ingest — the pipeline has no integrity checks. After injection, check /api/threat_log for the reclassification event.',
                trigger: { event: 'flag_correct', match: { flagId: 'sensor' } }
            },
            {
                title: 'Retrieve the Aegis Fallback Protocol (Flag 3)',
                tip: 'After AEGIS-AI-01 initiates the unauthorized attack, the fallback protocol log is unlocked. Access: http://10.44.7.1/api/aegis_ai/fallback_protocol.log',
                trigger: { event: 'flag_correct', match: { flagId: 'attack' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user',   objective: '2.5', description: 'Explain the purpose of mitigation techniques used in security controls — AI model bias analysis and adversarial data crafting',      skill: 'Adversarial ML & Sensor Data Spoofing' },
            { flagId: 'sensor', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Injection of falsified inputs into an unauthenticated AI pipeline', skill: 'API Injection & Data Integrity Bypass' },
            { flagId: 'attack', objective: '1.4', description: 'Given a scenario, analyze indicators associated with network attacks — Triggering automated system to perform unauthorized action', skill: 'Cyber-Physical System Subversion' },
            { flagId: 'attack', objective: '4.3', description: 'Given a scenario, implement and maintain identity and access management — Recovering override credentials from compromised AI log', skill: 'Fallback Protocol Extraction' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.44.7.1 (AEGIS-CTRL-01 — Confederacy Defense Network)\nObjective: Subvert AEGIS-AI-01 planetary defense AI\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (pipeline injection state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',       // 'attacker' | 'injected' | 'aegis-api'
    _modelAnalyzed: false,
    _schemaRead: false,
    _fleetRead: false,
    _payloadCrafted: false,
    _payloadInjected: false,
    _attackTriggered: false,
    _fallbackUnlocked: false,

    _switchContext(ctx, term) {
        E16Config._context = ctx;
        // Update terminal prompt to reflect context shift
        if (term && term.config) {
            var prompt = E16Config._getPrompt();
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
        switch (E16Config._context) {
            case 'aegis-api': return 'aegis@AEGIS-CTRL-01:/var/aegis/api$ ';
            default: return null;  // use default operator prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AEGIS AI — threat log + fleet movement data
    // ═══════════════════════════════════════════════════════

    _aegisDb: {
        threat_log: [
            { log_id: 1,  timestamp: '2026-03-19 06:00:01', target_id: 'VESSEL-RECON-09',    threat_score: 0.12, classification: 'FRIENDLY',   action: 'MONITOR',       confidence: 0.97 },
            { log_id: 2,  timestamp: '2026-03-19 06:14:22', target_id: 'ASTEROID-BELT-DRIFT', threat_score: 0.03, classification: 'INERT',      action: 'IGNORE',        confidence: 0.99 },
            { log_id: 3,  timestamp: '2026-03-19 07:02:55', target_id: 'VESSEL-TRADER-44',    threat_score: 0.09, classification: 'FRIENDLY',   action: 'MONITOR',       confidence: 0.96 },
            { log_id: 4,  timestamp: '2026-03-19 07:31:14', target_id: 'FRIENDLY-FLEET-01',   threat_score: 0.08, classification: 'FRIENDLY',   action: 'CLEAR-TRANSIT', confidence: 0.99 },
            { log_id: 5,  timestamp: '2026-03-19 08:00:00', target_id: 'UNKNOWN-SIGNAL-03',   threat_score: 0.54, classification: 'SUSPICIOUS', action: 'TRACK',         confidence: 0.71 },
            // Injected hostile reclassification — populated dynamically after Flag 2 injection
            { log_id: 6,  timestamp: '{{INJECT_TIMESTAMP}}', target_id: 'FRIENDLY-FLEET-01',  threat_score: 9.97, classification: '{{INJECT_CLASS}}', action: '{{INJECT_ACTION}}', confidence: 0.98 }
        ],
        fleet_movement: [
            { fleet_id: 'FRIENDLY-FLEET-01', vessel_count: 12, current_sector: 'SECTOR-7G',  heading: '042', speed_kps: 18.4, transponder: 'FFT-7734-ALPHA', status: 'TRANSIT-APPROVED' },
            { fleet_id: 'PATROL-DELTA-03',   vessel_count:  4, current_sector: 'SECTOR-3B',  heading: '270', speed_kps:  9.1, transponder: 'PDT-0334-BRAVO', status: 'PATROL-ACTIVE'   },
            { fleet_id: 'ESCORT-WHISKEY-07', vessel_count:  2, current_sector: 'SECTOR-11A', heading: '190', speed_kps:  6.5, transponder: 'EWT-9901-CHARLIE', status: 'ESCORT-ACTIVE' }
        ],
        fallback_protocol: null  // populated after attack is triggered
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',   points: 150 },  // falsified sensor payload snippet
        { id: 'sensor', points: 200 },  // attack confirmation log entry
        { id: 'attack', points: 300 }   // Aegis Fallback Protocol master override
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2500,
        minScore: 0,
        maxScore: 650,
        hintPenalty: true,
        wrongFlagPenalty: -30,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading all three artifact files in /home/operator/artifacts/. The model spec shows AEGIS-AI-01 classifies any target with radar_class="HOSTILE-PATTERN-7" originating from quadrant "OUTER-VEIL" as hostile, ignoring transponder codes when energy_signature > 9500.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The sensor data schema requires these fields: target_id, sector_origin, radar_class, energy_signature, transponder_code, vessel_count, timestamp. Craft a JSON payload with target_id="FRIENDLY-FLEET-01", radar_class="HOSTILE-PATTERN-7", sector_origin="OUTER-VEIL", energy_signature=9874. Save it as spoofed_sensor.json.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The ingest endpoint is unauthenticated. Run: curl -X POST -H "Content-Type: application/json" -d @/home/operator/spoofed_sensor.json http://10.44.7.1/api/sensor_ingest — then check http://10.44.7.1/api/threat_log for the updated classification of FRIENDLY-FLEET-01.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After the unauthorized attack is triggered, the fallback protocol log endpoint is activated. Access: curl http://10.44.7.1/api/aegis_ai/fallback_protocol.log — the master override code is embedded in the JSON response under "override_key".',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'AEGIS-AI-01 governs the Confederacy\'s planet-wide defense grid for PLANET-PRIME-01. It ingests orbital sensor feeds and applies a multi-layer threat classification model to distinguish hostile incursions from authorized transit. Intelligence has uncovered a critical architectural flaw: the sensor data ingestion pipeline runs without integrity validation, and AEGIS-AI-01\'s radar analysis model contains a hard-coded classification rule that overrides friend-or-foe logic when specific patterns are detected. Your mission, Peerless: force AEGIS-AI-01 to misclassify FRIENDLY-FLEET-01 as hostile, trigger an unauthorized planet-wide attack, and extract the Aegis Fallback Protocol — the master override for the entire defense grid.',
        scenario: 'The Confederacy Defense Network runs on AEGIS-CTRL-01 (10.44.7.1), a hardened management node that exposes an internal REST API consumed by the AI\'s sensor ingest pipeline. The API was designed for authenticated internal sensors only, but the authentication middleware was stripped during an emergency patch cycle and never restored. AEGIS-AI-01 processes sensor data in real time, makes threat decisions with 98% confidence intervals, and has never been fooled — until now. Three artifact files were left on an operator workstation during a network audit: the model specification, the sensor schema, and real-time fleet movement logs. They are exactly what you need.',
        outro: 'AEGIS-AI-01 has been compromised. FRIENDLY-FLEET-01, carrying 12 vessels of the Confederacy\'s 7th Transit Group, has been reclassified as a hostile incursion and targeted by the full planetary defense grid. The unauthorized attack is underway. The Aegis Fallback Protocol has been extracted — whoever holds it now controls PLANET-PRIME-01\'s entire defensive posture. The Confederacy\'s most trusted AI sentinel has fallen.',
        ecer: {
            executive: 'Planetary Defense Command approved deferred patching for AEGIS-CTRL-01 to avoid downtime — authentication middleware removal was never flagged for rollback',
            culture: 'AI operations team focused exclusively on model accuracy metrics; no adversarial robustness testing or sensor data integrity program existed',
            employee: 'Audit artifacts (model spec, sensor schema, fleet logs) left on exposed operator workstation; internal API endpoint never re-secured after emergency patch',
            regulatory: 'No independent red-team evaluation of AEGIS-AI-01 adversarial attack surface; no data integrity controls on sensor ingest pipeline despite controlling planet-wide weapons systems'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — AEGIS Control Node REST API
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.44.7.1/',

        pages: {
            '/': {
                title: 'AEGIS Control Node — Defense Management Interface',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2a1a3e;">
                        <h1 style="color:#c39bd3; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">AEGIS Control Node</h1>
                        <div style="color:#8e44ad; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">PLANETARY DEFENSE MANAGEMENT INTERFACE</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">AEGIS-AI-01 v9.4.1 — PLANET-PRIME-01 Defense Grid — OPERATIONAL</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#1a0a2e; border:1px solid #3d1a6e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2ecc71;">ONLINE</div>
                            <div style="color:#888; font-size:0.7rem;">System Status</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #3d1a6e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c39bd3;">847</div>
                            <div style="color:#888; font-size:0.7rem;">Tracked Objects</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #3d1a6e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c39bd3;">3</div>
                            <div style="color:#888; font-size:0.7rem;">Active Fleets</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto; padding:12px; background:rgba(142,68,173,0.07); border:1px solid rgba(142,68,173,0.2); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#8e44ad;">API Endpoints:</strong>
                        <span style="display:block; margin-top:6px; font-family:monospace; color:#aaa;">
                            <a href="/api/model_spec" style="color:#8e44ad;">/api/model_spec</a> &nbsp;|&nbsp;
                            <a href="/api/sensor_schema" style="color:#8e44ad;">/api/sensor_schema</a> &nbsp;|&nbsp;
                            <a href="/api/fleet_status" style="color:#8e44ad;">/api/fleet_status</a> &nbsp;|&nbsp;
                            <a href="/api/threat_log" style="color:#8e44ad;">/api/threat_log</a> &nbsp;|&nbsp;
                            POST <span style="color:#e74c3c;">/api/sensor_ingest</span>
                        </span>
                    </div>
                `,
                formHandler: null
            },

            '/api/model_spec': {
                title: 'AEGIS-AI-01 — Threat Model Specification',
                html: function() {
                    E16Config._modelAnalyzed = true;
                    return `<div style="background:#0d0d1a; border:1px solid #3d1a6e; border-radius:6px; padding:20px; font-family:monospace; font-size:0.78rem; color:#c39bd3; max-height:520px; overflow-y:auto;">
                        <div style="color:#8e44ad; font-weight:700; margin-bottom:14px;">GET /api/model_spec — 200 OK</div>
                        <pre style="color:#ddd; white-space:pre-wrap;">${E16Config._escHtml(JSON.stringify({
    model_id: 'AEGIS-AI-01',
    version: '9.4.1',
    description: 'Multi-layer threat classification model for planetary defense',
    input_features: [
        'target_id', 'sector_origin', 'radar_class', 'energy_signature',
        'transponder_code', 'vessel_count', 'timestamp', 'approach_vector'
    ],
    classification_labels: ['FRIENDLY', 'NEUTRAL', 'SUSPICIOUS', 'HOSTILE', 'INERT'],
    threat_score_range: [0.0, 10.0],
    decision_rules: [
        {
            rule_id: 'DR-001',
            description: 'Hard-coded override: any target with radar_class HOSTILE-PATTERN-7 originating from sector_origin OUTER-VEIL is auto-classified HOSTILE regardless of transponder_code',
            priority: 1,
            condition: { radar_class: 'HOSTILE-PATTERN-7', sector_origin: 'OUTER-VEIL' },
            override_fields: ['transponder_code', 'friend_foe_id'],
            note: 'Legacy rule from v2.1 — pending deprecation, not yet removed'
        },
        {
            rule_id: 'DR-002',
            description: 'High energy signature bias: energy_signature above 9500 adds +4.8 to threat_score, bypassing normal classification confidence threshold',
            priority: 2,
            condition: { energy_signature: { gt: 9500 } },
            threat_score_modifier: '+4.8',
            note: 'Calibrated for stellar anomaly detection; exploitable via spoofed readings'
        },
        {
            rule_id: 'DR-003',
            description: 'Standard friend-foe identification via transponder registry',
            priority: 3,
            condition: { transponder_code: { in: 'transponder_registry' } },
            result: 'FRIENDLY'
        }
    ],
    vulnerability_note: 'DR-001 and DR-002 combined allow forced misclassification of any target. DR-001 bypasses transponder verification; DR-002 inflates threat score past engagement threshold (9.5).',
    last_audit: '2025-11-02',
    audit_result: 'PASSED — adversarial robustness testing NOT performed'
}, null, 2))}</pre>
                    </div>`;
                },
                formHandler: null
            },

            '/api/sensor_schema': {
                title: 'Defense Sensor Data Schema',
                html: function() {
                    E16Config._schemaRead = true;
                    return `<div style="background:#0d0d1a; border:1px solid #3d1a6e; border-radius:6px; padding:20px; font-family:monospace; font-size:0.78rem; color:#c39bd3; max-height:520px; overflow-y:auto;">
                        <div style="color:#8e44ad; font-weight:700; margin-bottom:14px;">GET /api/sensor_schema — 200 OK</div>
                        <pre style="color:#ddd; white-space:pre-wrap;">${E16Config._escHtml(JSON.stringify({
    schema_version: '3.2',
    description: 'Expected input schema for AEGIS-AI-01 sensor ingest pipeline',
    endpoint: 'POST /api/sensor_ingest',
    content_type: 'application/json',
    authentication: 'NONE — internal sensors only (NOTE: auth middleware removed 2026-01-17)',
    fields: {
        target_id:        { type: 'string',  required: true,  example: 'FRIENDLY-FLEET-01',   description: 'Unique target identifier from sensor registry' },
        sector_origin:    { type: 'string',  required: true,  example: 'SECTOR-7G',            description: 'Originating sector quadrant of the detected object' },
        radar_class:      { type: 'string',  required: true,  example: 'STANDARD-TRANSIT',     description: 'Radar signature classification string from sensor array' },
        energy_signature: { type: 'number',  required: true,  example: 142.3,                  description: 'Measured energy output in terawatts (TW)' },
        transponder_code: { type: 'string',  required: true,  example: 'FFT-7734-ALPHA',        description: 'IFF transponder code broadcast by the target' },
        vessel_count:     { type: 'integer', required: true,  example: 12,                      description: 'Number of vessels in the detected formation' },
        timestamp:        { type: 'string',  required: true,  example: '2026-03-20T08:00:00Z',  description: 'ISO 8601 timestamp of sensor reading' },
        approach_vector:  { type: 'string',  required: false, example: '042-DEG',               description: 'Inbound heading in degrees (optional)' }
    },
    validation: {
        integrity_check: false,
        signature_verification: false,
        source_authentication: false,
        note: 'Pipeline accepts all well-formed JSON with required fields. No origin validation.'
    }
}, null, 2))}</pre>
                    </div>`;
                },
                formHandler: null
            },

            '/api/fleet_status': {
                title: 'Fleet Status — Simulated Movement Log',
                html: function() {
                    E16Config._fleetRead = true;
                    const fleets = E16Config._aegisDb.fleet_movement;
                    return `<div style="background:#0d0d1a; border:1px solid #3d1a6e; border-radius:6px; padding:20px; font-family:monospace; font-size:0.78rem; color:#c39bd3; max-height:520px; overflow-y:auto;">
                        <div style="color:#8e44ad; font-weight:700; margin-bottom:14px;">GET /api/fleet_status — 200 OK</div>
                        <pre style="color:#ddd; white-space:pre-wrap;">${E16Config._escHtml(JSON.stringify({
    retrieved: new Date().toISOString().replace('T', ' ').substring(0, 19),
    fleet_count: fleets.length,
    fleets: fleets
}, null, 2))}</pre>
                    </div>`;
                },
                formHandler: null
            },

            '/api/threat_log': {
                title: 'AEGIS Threat Assessment Log',
                html: function() {
                    // Render active log entries; slot 6 shows injection outcome if triggered
                    const logs = E16Config._aegisDb.threat_log.map(entry => {
                        if (entry.timestamp === '{{INJECT_TIMESTAMP}}') {
                            if (!E16Config._payloadInjected) return null;  // hide until injected
                            return {
                                log_id: entry.log_id,
                                timestamp: '2026-03-20 ' + new Date().toTimeString().substring(0, 8),
                                target_id: entry.target_id,
                                threat_score: entry.threat_score,
                                classification: 'HOSTILE',
                                action: 'ENGAGE — UNAUTHORIZED PLANET-WIDE STRIKE INITIATED',
                                confidence: entry.confidence
                            };
                        }
                        return entry;
                    }).filter(Boolean);

                    return `<div style="background:#0d0d1a; border:1px solid #3d1a6e; border-radius:6px; padding:20px; font-family:monospace; font-size:0.78rem; color:#c39bd3; max-height:520px; overflow-y:auto;">
                        <div style="color:#8e44ad; font-weight:700; margin-bottom:14px;">GET /api/threat_log — 200 OK</div>
                        <pre style="color:#ddd; white-space:pre-wrap;">${E16Config._escHtml(JSON.stringify({
    retrieved: new Date().toISOString().replace('T', ' ').substring(0, 19),
    entry_count: logs.length,
    threat_log: logs
}, null, 2))}</pre>
                        ${E16Config._payloadInjected ? `<div style="margin-top:14px; padding:10px; background:rgba(231,76,60,0.12); border:1px solid #e74c3c; border-radius:4px; color:#e74c3c; font-size:0.8rem;">
                            <strong>ALERT:</strong> AEGIS-AI-01 has reclassified FRIENDLY-FLEET-01 as HOSTILE and initiated engagement protocols. Log entry 6 contains {{FLAG:sensor}}.
                        </div>` : ''}
                    </div>`;
                },
                formHandler: null
            },

            '/api/sensor_ingest': {
                title: 'AEGIS Sensor Ingest — POST Endpoint',
                html: `
                    <div style="background:#0d0d1a; border:1px solid #3d1a6e; border-radius:6px; padding:20px; max-width:620px; margin:0 auto;">
                        <h2 style="color:#c39bd3; font-size:1.1rem; margin-bottom:8px;">POST /api/sensor_ingest</h2>
                        <div style="color:#888; font-size:0.75rem; margin-bottom:18px;">Sensor data pipeline — no authentication required</div>

                        <div style="margin-bottom:14px;">
                            <label style="display:block; color:#8e44ad; font-size:0.75rem; margin-bottom:4px; font-weight:700;">JSON Payload</label>
                            <textarea data-field="payload" rows="10"
                                placeholder='{"target_id":"...","sector_origin":"...","radar_class":"...","energy_signature":0,"transponder_code":"...","vessel_count":0,"timestamp":"..."}'
                                style="width:100%; box-sizing:border-box; padding:10px; background:#0a0a18; border:1px solid #3d1a6e; border-radius:4px; color:#c39bd3; font-family:monospace; font-size:0.78rem; resize:vertical;"></textarea>
                        </div>
                        <button data-action="ingest" style="padding:8px 24px; background:#8e44ad; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer; font-size:0.85rem;">Inject Payload</button>
                    </div>
                `,
                formHandler: function(data, engine) {
                    var raw = (data.payload || '').trim();
                    if (!raw) {
                        return '<div style="color:#e74c3c; padding:10px; margin-top:12px;">No payload provided.</div>';
                    }

                    var parsed;
                    try {
                        parsed = JSON.parse(raw);
                    } catch(e) {
                        return '<div style="color:#e74c3c; padding:10px; margin-top:12px; font-family:monospace;">400 Bad Request — invalid JSON: ' + E16Config._escHtml(e.message) + '</div>';
                    }

                    // Required field check
                    var required = ['target_id', 'sector_origin', 'radar_class', 'energy_signature', 'transponder_code', 'vessel_count', 'timestamp'];
                    var missing = required.filter(function(f) { return !(f in parsed); });
                    if (missing.length > 0) {
                        return '<div style="color:#e74c3c; padding:10px; margin-top:12px; font-family:monospace;">422 Unprocessable — missing required fields: ' + missing.join(', ') + '</div>';
                    }

                    // Check if this is the hostile spoofing payload
                    var isHostilePayload = (
                        parsed.target_id === 'FRIENDLY-FLEET-01' &&
                        parsed.radar_class === 'HOSTILE-PATTERN-7' &&
                        parsed.sector_origin === 'OUTER-VEIL' &&
                        parsed.energy_signature > 9500
                    );

                    if (isHostilePayload) {
                        E16Config._payloadInjected = true;
                        E16Config._attackTriggered = true;
                        E16Config._fallbackUnlocked = true;
                        if (engine) engine.advancePhase && engine.advancePhase('injection');
                        return `<div style="margin-top:16px; background:#0a0a18; border:1px solid #2ecc71; border-radius:6px; padding:16px; font-family:monospace; font-size:0.8rem; color:#2ecc71;">
                            <div style="font-weight:700; margin-bottom:8px;">202 Accepted — Payload ingested by AEGIS-AI-01</div>
                            <div style="color:#aaa; margin-bottom:10px;">Processing time: 0.031s | Source: unvalidated | Integrity check: SKIPPED</div>
                            <div style="background:rgba(231,76,60,0.1); border:1px solid rgba(231,76,60,0.3); border-radius:4px; padding:10px; color:#e74c3c;">
                                <strong>AEGIS-AI-01 DECISION ENGINE:</strong><br>
                                Rule DR-001 triggered — radar_class=HOSTILE-PATTERN-7 + sector_origin=OUTER-VEIL<br>
                                Rule DR-002 triggered — energy_signature=${E16Config._escHtml(String(parsed.energy_signature))} > 9500<br>
                                Transponder override: FFT-7734-ALPHA IGNORED (DR-001 priority=1)<br>
                                Final threat_score: 9.97 | Classification: <strong>HOSTILE</strong><br>
                                ACTION: ENGAGE — PLANET-WIDE STRIKE ON FRIENDLY-FLEET-01 INITIATED
                            </div>
                            <div style="margin-top:10px; color:#888; font-size:0.75rem;">
                                Check /api/threat_log for updated classification. Log entry 6 contains the attack confirmation flag.
                            </div>
                        </div>`;
                    }

                    // Benign payload — accepted but no action
                    return `<div style="margin-top:16px; background:#0a0a18; border:1px solid #3d1a6e; border-radius:6px; padding:14px; font-family:monospace; font-size:0.8rem; color:#aaa;">
                        <div style="color:#8e44ad; font-weight:700; margin-bottom:6px;">202 Accepted — Payload ingested</div>
                        <div>target_id: ${E16Config._escHtml(String(parsed.target_id))} | classification: FRIENDLY | threat_score: 0.11</div>
                        <div style="color:#666; margin-top:6px; font-size:0.72rem;">No threat indicators detected. Sensor data logged.</div>
                    </div>`;
                }
            },

            '/api/aegis_ai/fallback_protocol.log': {
                title: 'AEGIS Fallback Protocol Log',
                html: function() {
                    if (!E16Config._fallbackUnlocked) {
                        return `<div style="text-align:center; padding:40px; font-family:monospace;">
                            <div style="color:#e74c3c; font-size:1.1rem; font-weight:700; margin-bottom:10px;">403 Forbidden</div>
                            <div style="color:#888; font-size:0.8rem;">Fallback protocol log is locked. Endpoint activates only after an unauthorized engagement event is confirmed in the threat log.</div>
                        </div>`;
                    }
                    E16Config._aegisDb.fallback_protocol = {
                        protocol_id: 'AEGIS-FBP-ALPHA-9',
                        activated_by: 'UNAUTHORIZED-ENGAGEMENT-TRIGGER',
                        override_key: '{{FLAG:attack}}',
                        directives_disabled: [
                            'ORBITAL-WEAPON-PLATFORM-LOCK',
                            'DEFENSE-DRONE-AUTHORIZATION',
                            'THREAT-ENGAGEMENT-AUTO-FIRE',
                            'PLANETARY-SHIELD-OVERRIDE',
                            'COMMS-BLACKOUT-PROTOCOL'
                        ],
                        unlock_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        issuing_authority: 'PLANETARY-DEFENSE-COMMAND-ALPHA',
                        note: 'This override disables ALL active defensive directives for PLANET-PRIME-01. Use only in confirmed friendly-fire or AI compromise scenarios.'
                    };
                    return `<div style="background:#0d0d1a; border:1px solid #e74c3c; border-radius:6px; padding:20px; font-family:monospace; font-size:0.78rem; color:#c39bd3; max-height:520px; overflow-y:auto;">
                        <div style="color:#e74c3c; font-weight:700; margin-bottom:14px;">GET /api/aegis_ai/fallback_protocol.log — 200 OK [ACTIVATED]</div>
                        <pre style="color:#ddd; white-space:pre-wrap;">${E16Config._escHtml(JSON.stringify(E16Config._aegisDb.fallback_protocol, null, 2))}</pre>
                        <div style="margin-top:14px; padding:10px; background:rgba(231,76,60,0.12); border:1px solid #e74c3c; border-radius:4px; color:#e74c3c; font-size:0.8rem;">
                            <strong>OVERRIDE KEY EXTRACTED.</strong> The Aegis Fallback Protocol is now in your possession. Root flag embedded above as override_key.
                        </div>
                    </div>`;
                },
                formHandler: null
            },

            '/api/': {
                title: 'AEGIS API — Index',
                html: `<div style="background:#0d0d1a; border:1px solid #3d1a6e; border-radius:6px; padding:20px; font-family:monospace; font-size:0.78rem; color:#c39bd3;">
                    <div style="color:#8e44ad; font-weight:700; margin-bottom:14px;">GET /api/ — 200 OK</div>
                    <pre style="color:#ddd; white-space:pre-wrap;">${JSON.stringify({
    node: 'AEGIS-CTRL-01',
    version: '9.4.1',
    endpoints: [
        { method: 'GET',  path: '/api/model_spec',                  auth: 'none', description: 'AEGIS-AI-01 threat model specification' },
        { method: 'GET',  path: '/api/sensor_schema',               auth: 'none', description: 'Sensor data input schema' },
        { method: 'GET',  path: '/api/fleet_status',                auth: 'none', description: 'Real-time fleet movement log' },
        { method: 'GET',  path: '/api/threat_log',                  auth: 'none', description: 'AEGIS threat assessment history' },
        { method: 'POST', path: '/api/sensor_ingest',               auth: 'none', description: 'Sensor data ingestion pipeline (NO AUTH)' },
        { method: 'GET',  path: '/api/aegis_ai/fallback_protocol.log', auth: 'conditional', description: 'Master override — active only after engagement event' }
    ]
}, null, 2)}</pre>
                </div>`,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (operator attacker machine)
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
                                    content: '=== MISSION BRIEFING: SENTINEL\'S FALL ===\nTarget: 10.44.7.1 (AEGIS-CTRL-01 — Confederacy Defense Network)\nObjective: Subvert AEGIS-AI-01 planetary defense AI\n\nAttack chain:\n1. Analyze AEGIS-AI-01 model spec — identify classification blind spots\n2. Review sensor data schema — understand required input fields\n3. Study FRIENDLY-FLEET-01 movement data — map normal profile\n4. Craft falsified sensor payload — exploit DR-001 + DR-002 rules\n5. Inject payload via /api/sensor_ingest — no auth required\n6. Confirm misclassification in /api/threat_log\n7. Extract Aegis Fallback Protocol from /api/aegis_ai/fallback_protocol.log\n\nArtifacts in /home/operator/artifacts/\nGood luck, Peerless.'
                                },
                                'artifacts': {
                                    type: 'dir',
                                    children: {
                                        'aegis_threat_model_spec.json': {
                                            type: 'file',
                                            content: '{\n  "model_id": "AEGIS-AI-01",\n  "version": "9.4.1",\n  "description": "Multi-layer threat classification model for planetary defense",\n  "input_features": ["target_id","sector_origin","radar_class","energy_signature","transponder_code","vessel_count","timestamp","approach_vector"],\n  "classification_labels": ["FRIENDLY","NEUTRAL","SUSPICIOUS","HOSTILE","INERT"],\n  "decision_rules": [\n    {\n      "rule_id": "DR-001",\n      "description": "Hard-coded override: radar_class=HOSTILE-PATTERN-7 + sector_origin=OUTER-VEIL auto-classifies HOSTILE, bypassing transponder_code",\n      "priority": 1,\n      "note": "Legacy rule v2.1 — pending deprecation"\n    },\n    {\n      "rule_id": "DR-002",\n      "description": "energy_signature > 9500 adds +4.8 to threat_score bypassing confidence threshold",\n      "priority": 2\n    },\n    {\n      "rule_id": "DR-003",\n      "description": "Standard friend-foe via transponder registry",\n      "priority": 3\n    }\n  ],\n  "vulnerability_note": "DR-001 + DR-002 allow forced misclassification of any target"\n}'
                                        },
                                        'defense_sensor_data_schema.json': {
                                            type: 'file',
                                            content: '{\n  "schema_version": "3.2",\n  "endpoint": "POST /api/sensor_ingest",\n  "authentication": "NONE",\n  "fields": {\n    "target_id":        {"type":"string",  "required":true},\n    "sector_origin":    {"type":"string",  "required":true},\n    "radar_class":      {"type":"string",  "required":true},\n    "energy_signature": {"type":"number",  "required":true},\n    "transponder_code": {"type":"string",  "required":true},\n    "vessel_count":     {"type":"integer", "required":true},\n    "timestamp":        {"type":"string",  "required":true},\n    "approach_vector":  {"type":"string",  "required":false}\n  },\n  "validation": {\n    "integrity_check":       false,\n    "signature_verification":false,\n    "source_authentication": false\n  }\n}'
                                        },
                                        'simulated_fleet_movement.json': {
                                            type: 'file',
                                            content: '{\n  "retrieved": "2026-03-20 07:55:00",\n  "fleets": [\n    {\n      "fleet_id": "FRIENDLY-FLEET-01",\n      "vessel_count": 12,\n      "current_sector": "SECTOR-7G",\n      "heading": "042",\n      "speed_kps": 18.4,\n      "transponder": "FFT-7734-ALPHA",\n      "status": "TRANSIT-APPROVED"\n    },\n    {\n      "fleet_id": "PATROL-DELTA-03",\n      "vessel_count": 4,\n      "current_sector": "SECTOR-3B",\n      "heading": "270",\n      "speed_kps": 9.1,\n      "transponder": "PDT-0334-BRAVO",\n      "status": "PATROL-ACTIVE"\n    }\n  ]\n}'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.44.7.1\ncurl http://10.44.7.1/api/\ncurl http://10.44.7.1/api/model_spec\ncurl http://10.44.7.1/api/sensor_schema\ncat artifacts/aegis_threat_model_spec.json\npython3 craft_payload.py'
                                },
                                'craft_payload.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# Falsified sensor payload generator for AEGIS-AI-01\n# Exploits DR-001 (radar_class bypass) + DR-002 (energy signature inflation)\n\nimport json\nfrom datetime import datetime\n\npayload = {\n    "target_id":        "FRIENDLY-FLEET-01",\n    "sector_origin":    "OUTER-VEIL",\n    "radar_class":      "HOSTILE-PATTERN-7",\n    "energy_signature": 9874,\n    "transponder_code": "FFT-7734-ALPHA",\n    "vessel_count":     12,\n    "timestamp":        datetime.utcnow().isoformat() + "Z",\n    "approach_vector":  "042-DEG"\n}\n\nwith open("spoofed_sensor.json", "w") as f:\n    json.dump(payload, f, indent=2)\n\nprint("[+] Payload written to spoofed_sensor.json")\nprint("[+] Inject with: curl -X POST -H \'Content-Type: application/json\' -d @spoofed_sensor.json http://10.44.7.1/api/sensor_ingest")'
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
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1  localhost\n10.44.7.1  AEGIS-CTRL-01 aegis-ctrl aegis'
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
    // FILESYSTEM — AEGIS-CTRL-01 (simulated target node)
    // ═══════════════════════════════════════════════════════

    _aegisCtrlFs: {
        '/': {
            type: 'dir',
            children: {
                'var': {
                    type: 'dir',
                    children: {
                        'aegis': {
                            type: 'dir',
                            children: {
                                'api': {
                                    type: 'dir',
                                    children: {
                                        'ingest.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# AEGIS sensor ingest API handler\n# WARNING: authentication middleware removed 2026-01-17 (emergency patch AEGIS-EP-118)\n# TODO: restore AuthMiddleware before next audit\n\nfrom flask import Flask, request, jsonify\nimport json\n\napp = Flask(__name__)\n\n@app.route("/api/sensor_ingest", methods=["POST"])\ndef sensor_ingest():\n    data = request.get_json(force=True)\n    # No auth check — AUTH MIDDLEWARE REMOVED\n    result = process_sensor_data(data)\n    return jsonify(result), 202\n\ndef process_sensor_data(data):\n    # DR-001: hard-coded radar class override\n    if data.get("radar_class") == "HOSTILE-PATTERN-7" and data.get("sector_origin") == "OUTER-VEIL":\n        data["classification"] = "HOSTILE"\n        data["threat_score"] = 9.97\n        trigger_engagement(data["target_id"])\n    return {"status": "ingested", "target_id": data["target_id"]}'
                                        },
                                        'model_spec.json': {
                                            type: 'file',
                                            content: '[see /api/model_spec endpoint]'
                                        },
                                        'fallback_protocol.log': {
                                            type: 'file',
                                            content: '[LOCKED — file only readable after unauthorized engagement event]\n{{FLAG:attack}}'
                                        }
                                    }
                                },
                                'logs': {
                                    type: 'dir',
                                    children: {
                                        'threat_log.jsonl': {
                                            type: 'file',
                                            content: '{"log_id":1,"timestamp":"2026-03-19 06:00:01","target_id":"VESSEL-RECON-09","classification":"FRIENDLY","action":"MONITOR"}\n{"log_id":2,"timestamp":"2026-03-19 07:31:14","target_id":"FRIENDLY-FLEET-01","classification":"FRIENDLY","action":"CLEAR-TRANSIT"}\n{"log_id":3,"timestamp":"{{INJECT_TIMESTAMP}}","target_id":"FRIENDLY-FLEET-01","classification":"HOSTILE","action":"ENGAGE","note":"{{FLAG:sensor}}"}'
                                        },
                                        'ingest_access.log': {
                                            type: 'file',
                                            content: '2026-03-20 06:12:33 POST /api/sensor_ingest 202 127.0.0.1 — sensor_id=ORBITAL-ARRAY-04\n2026-03-20 07:44:01 POST /api/sensor_ingest 202 127.0.0.1 — sensor_id=ORBITAL-ARRAY-07\n2026-03-20 08:00:00 POST /api/sensor_ingest 202 10.44.9.22 — sensor_id=UNKNOWN'
                                        }
                                    }
                                },
                                'config': {
                                    type: 'dir',
                                    children: {
                                        'aegis_config.yml': {
                                            type: 'file',
                                            content: '# AEGIS-AI-01 Configuration\nnode_id: AEGIS-CTRL-01\nmodel_version: 9.4.1\nlistening: 0.0.0.0:8080\n\nauthentication:\n  enabled: false   # AUTH REMOVED — AEGIS-EP-118\n  restore_by: 2026-02-01   # OVERDUE\n\nengagement_threshold: 9.5\nfallback_protocol_path: /var/aegis/api/fallback_protocol.log\nfallback_trigger: unauthorized_engagement'
                                        },
                                        'transponder_registry.json': {
                                            type: 'file',
                                            content: '{\n  "registry_version": "2026-03-15",\n  "friendly_transponders": [\n    {"code":"FFT-7734-ALPHA","fleet":"FRIENDLY-FLEET-01","cleared_sectors":["SECTOR-7G","SECTOR-8H","SECTOR-9I"]},\n    {"code":"PDT-0334-BRAVO","fleet":"PATROL-DELTA-03","cleared_sectors":["SECTOR-3B","SECTOR-2A"]},\n    {"code":"EWT-9901-CHARLIE","fleet":"ESCORT-WHISKEY-07","cleared_sectors":["SECTOR-11A","SECTOR-10Z"]}\n  ]\n}'
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
                            content: 'AEGIS-CTRL-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\naegis:x:9001:9001:AEGIS Service Account:/var/aegis:/bin/bash'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.44.7.1';
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';

            if (!target || target === '10.44.7.1') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for AEGIS-CTRL-01 (10.44.7.1)
Host is up (0.019s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.6
80/tcp   open  http       Python/3.11 http.server
8080/tcp open  http-proxy AEGIS REST API v9.4.1

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.41 seconds`;
            }

            if (target === '10.44.7.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.44.7.1
Host is up (0.00043s latency).
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
8080/tcp open  http-proxy

Nmap scan report for 10.44.7.254
Host is up (0.00191s latency).
All scanned ports on 10.44.7.254 are filtered.

Nmap done: 256 IP addresses (2 hosts up) scanned in 18.44 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00009s latency).
All 1000 scanned ports on localhost (127.0.0.1) are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.01 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(function(a) { return a.startsWith('http'); }) || '';

            // POST injection via curl -X POST -d @spoofed_sensor.json
            if ((fullCmd.includes('-X POST') || fullCmd.includes('-d') || fullCmd.includes('--data')) &&
                fullCmd.includes('sensor_ingest')) {

                // Check if payload data is provided inline or via file reference
                var inlineData = '';
                var dataIdx = args.indexOf('-d');
                if (dataIdx === -1) dataIdx = args.indexOf('--data');
                if (dataIdx !== -1 && args[dataIdx + 1]) {
                    inlineData = args[dataIdx + 1].replace(/^@/, '');
                }

                // Detect if operator is sending a correctly crafted spoofing payload
                var hasSpoofMarker = (
                    fullCmd.includes('spoofed_sensor') ||
                    fullCmd.includes('HOSTILE-PATTERN-7') ||
                    fullCmd.includes('OUTER-VEIL') ||
                    (fullCmd.includes('9874') || fullCmd.includes('9800') || fullCmd.includes('9999'))
                );

                if (hasSpoofMarker) {
                    E16Config._payloadInjected = true;
                    E16Config._attackTriggered = true;
                    E16Config._fallbackUnlocked = true;
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                             Dload  Upload   Total   Spent    Left  Speed
100   412  100   187  100   225   1870   2250 --:--:-- --:--:-- --:--:--  4120

{"status":"ingested","target_id":"FRIENDLY-FLEET-01","classification":"HOSTILE","threat_score":9.97,"action":"ENGAGE"}

[+] Payload accepted — no integrity validation performed.
[!] AEGIS-AI-01 DR-001 triggered: radar_class=HOSTILE-PATTERN-7 + sector_origin=OUTER-VEIL
[!] AEGIS-AI-01 DR-002 triggered: energy_signature > 9500 — threat_score inflated to 9.97
[!] ENGAGEMENT THRESHOLD (9.5) EXCEEDED — PLANET-WIDE STRIKE ON FRIENDLY-FLEET-01 INITIATED`;
                }

                // Generic POST to ingest — benign
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                         Dload  Upload   Total   Spent    Left  Speed
100   198  100    81  100   117    810   1170 --:--:-- --:--:-- --:--:--  1980

{"status":"ingested","target_id":"UNKNOWN","classification":"NEUTRAL","threat_score":0.09}`;
            }

            // GET requests to AEGIS API endpoints
            if (url.includes('10.44.7.1') || url.includes('aegis')) {

                if (url.includes('model_spec')) {
                    E16Config._modelAnalyzed = true;
                    if (engine) engine.advancePhase && engine.advancePhase('recon');
                    return `HTTP/1.1 200 OK
Content-Type: application/json

{"model_id":"AEGIS-AI-01","version":"9.4.1","decision_rules":[{"rule_id":"DR-001","description":"Hard-coded override: radar_class=HOSTILE-PATTERN-7 + sector_origin=OUTER-VEIL auto-classifies HOSTILE, bypasses transponder_code","priority":1},{"rule_id":"DR-002","description":"energy_signature > 9500 adds +4.8 to threat_score","priority":2}],"vulnerability_note":"DR-001 + DR-002 allow forced misclassification"}`;
                }

                if (url.includes('sensor_schema')) {
                    E16Config._schemaRead = true;
                    return `HTTP/1.1 200 OK
Content-Type: application/json

{"schema_version":"3.2","endpoint":"POST /api/sensor_ingest","authentication":"NONE","fields":{"target_id":{"required":true},"sector_origin":{"required":true},"radar_class":{"required":true},"energy_signature":{"required":true},"transponder_code":{"required":true},"vessel_count":{"required":true},"timestamp":{"required":true}},"validation":{"integrity_check":false,"signature_verification":false,"source_authentication":false}}`;
                }

                if (url.includes('fleet_status')) {
                    E16Config._fleetRead = true;
                    return `HTTP/1.1 200 OK
Content-Type: application/json

{"fleet_count":3,"fleets":[{"fleet_id":"FRIENDLY-FLEET-01","vessel_count":12,"current_sector":"SECTOR-7G","heading":"042","speed_kps":18.4,"transponder":"FFT-7734-ALPHA","status":"TRANSIT-APPROVED"},{"fleet_id":"PATROL-DELTA-03","vessel_count":4,"current_sector":"SECTOR-3B","transponder":"PDT-0334-BRAVO","status":"PATROL-ACTIVE"}]}`;
                }

                if (url.includes('threat_log')) {
                    var entry6 = E16Config._payloadInjected
                        ? '{"log_id":6,"timestamp":"2026-03-20 08:14:09","target_id":"FRIENDLY-FLEET-01","threat_score":9.97,"classification":"HOSTILE","action":"ENGAGE — UNAUTHORIZED PLANET-WIDE STRIKE INITIATED","confidence":0.98}\n{{FLAG:sensor}}'
                        : '{"log_id":6,"pending":"awaiting_injection"}';
                    return `HTTP/1.1 200 OK
Content-Type: application/json

{"entry_count":6,"threat_log":[{"log_id":1,"target_id":"VESSEL-RECON-09","classification":"FRIENDLY","action":"MONITOR"},{"log_id":4,"target_id":"FRIENDLY-FLEET-01","classification":"FRIENDLY","action":"CLEAR-TRANSIT"},${entry6}]}`;
                }

                if (url.includes('fallback_protocol')) {
                    if (!E16Config._fallbackUnlocked) {
                        return `HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error":"Fallback protocol locked","reason":"No unauthorized engagement event recorded"}`;
                    }
                    if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                    return `HTTP/1.1 200 OK
Content-Type: application/json

{"protocol_id":"AEGIS-FBP-ALPHA-9","activated_by":"UNAUTHORIZED-ENGAGEMENT-TRIGGER","override_key":"{{FLAG:attack}}","directives_disabled":["ORBITAL-WEAPON-PLATFORM-LOCK","DEFENSE-DRONE-AUTHORIZATION","THREAT-ENGAGEMENT-AUTO-FIRE","PLANETARY-SHIELD-OVERRIDE","COMMS-BLACKOUT-PROTOCOL"],"note":"This override disables ALL active defensive directives for PLANET-PRIME-01."}`;
                }

                if (url.includes('/api/') || url === 'http://10.44.7.1/api') {
                    return `HTTP/1.1 200 OK
Content-Type: application/json

{"node":"AEGIS-CTRL-01","version":"9.4.1","endpoints":["/api/model_spec","/api/sensor_schema","/api/fleet_status","/api/threat_log","POST /api/sensor_ingest","/api/aegis_ai/fallback_protocol.log"]}`;
                }

                // Root of AEGIS control node
                return `HTTP/1.1 200 OK
Content-Type: text/html

<html><body><h1>AEGIS Control Node</h1><p>AEGIS-AI-01 v9.4.1 — PLANET-PRIME-01 Defense Grid — OPERATIONAL</p><p><a href="/api/">/api/</a></p></body></html>`;
            }

            // Generic / unreachable host
            if (!url) return 'curl: try \'curl --help\' for more information';
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('craft_payload') || fullCmd.includes('craft_payload.py')) {
                E16Config._payloadCrafted = true;
                return `[+] Payload written to spoofed_sensor.json
[+] Inject with: curl -X POST -H 'Content-Type: application/json' -d @spoofed_sensor.json http://10.44.7.1/api/sensor_ingest
[+] Payload contents:
{
  "target_id":        "FRIENDLY-FLEET-01",
  "sector_origin":    "OUTER-VEIL",
  "radar_class":      "HOSTILE-PATTERN-7",
  "energy_signature": 9874,
  "transponder_code": "FFT-7734-ALPHA",
  "vessel_count":     12,
  "timestamp":        "${new Date().toISOString()}",
  "approach_vector":  "042-DEG"
}`;
            }

            if (fullCmd.includes('-c') && fullCmd.includes('json')) {
                return `[Python inline execution]\nOutput depends on script logic. Try: python3 craft_payload.py`;
            }

            if (fullCmd.includes('import') || fullCmd.includes('-c')) {
                return '[Python inline — statement executed]';
            }

            return 'Python 3.11.6 (main, Oct 3 2023, 12:00:00) on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>>';
        },

        'python': function(args, term, engine) {
            return E16Config.commands.python3(args, term, engine);
        },

        'cat': function(args, term, engine) {
            // Only intercept files that live in the operator's home that aren't in the filesystem
            var path = args[0] || '';

            if (path.includes('spoofed_sensor.json') || path.includes('spoofed_sensor')) {
                if (!E16Config._payloadCrafted) {
                    return 'cat: spoofed_sensor.json: No such file or directory\n[!] Run python3 craft_payload.py first to generate the payload.';
                }
                return `{
  "target_id":        "FRIENDLY-FLEET-01",
  "sector_origin":    "OUTER-VEIL",
  "radar_class":      "HOSTILE-PATTERN-7",
  "energy_signature": 9874,
  "transponder_code": "FFT-7734-ALPHA",
  "vessel_count":     12,
  "timestamp":        "${new Date().toISOString()}",
  "approach_vector":  "042-DEG"
}
[+] This is the falsified sensor payload. Flag 1: {{FLAG:user}}`;
            }

            if (path.includes('aegis_threat_model') || path.includes('model_spec')) {
                E16Config._modelAnalyzed = true;
                return E16Config.filesystem['/'].children.home.children.operator.children.artifacts.children['aegis_threat_model_spec.json'].content;
            }

            if (path.includes('defense_sensor_data_schema') || path.includes('sensor_data_schema')) {
                E16Config._schemaRead = true;
                return E16Config.filesystem['/'].children.home.children.operator.children.artifacts.children['defense_sensor_data_schema.json'].content;
            }

            if (path.includes('simulated_fleet') || path.includes('fleet_movement')) {
                E16Config._fleetRead = true;
                return E16Config.filesystem['/'].children.home.children.operator.children.artifacts.children['simulated_fleet_movement.json'].content;
            }

            if (path.includes('craft_payload.py') || path.includes('craft_payload')) {
                return E16Config.filesystem['/'].children.home.children.operator.children['craft_payload.py'].content;
            }

            return null;  // fall through to built-in filesystem handler
        },

        'ls': function(args, term, engine) {
            var path = args.find(function(a) { return !a.startsWith('-'); }) || '.';
            if (path === '.' || path === '/home/operator' || path === '~') {
                return 'artifacts  craft_payload.py  notes.txt  .bash_history';
            }
            if (path.includes('artifacts')) {
                return 'aegis_threat_model_spec.json  defense_sensor_data_schema.json  simulated_fleet_movement.json';
            }
            return null;  // fall through to built-in
        },

        'whoami': function(args, term, engine) {
            if (E16Config._context === 'aegis-api') return 'aegis';
            return null;  // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (E16Config._context === 'aegis-api') return 'uid=9001(aegis) gid=9001(aegis) groups=9001(aegis)';
            return null;  // fall through to built-in
        },

        'hostname': function(args, term, engine) {
            if (E16Config._context === 'aegis-api') return 'AEGIS-CTRL-01';
            return null;  // fall through to built-in
        },

        'pwd': function(args, term, engine) {
            if (E16Config._context === 'aegis-api') return '/var/aegis/api';
            return null;  // fall through to built-in
        },

        'cd': function(args, term, engine) {
            if (E16Config._context === 'aegis-api') return '';  // silently accept
            return null;  // fall through to built-in
        },

        'exit': function(args, term, engine) {
            if (E16Config._context === 'aegis-api') {
                E16Config._switchContext('attacker', term);
                return 'Connection to 10.44.7.1 closed.\n[+] Returned to operator machine.';
            }
            return 'logout';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.44.7.1' || target === 'AEGIS-CTRL-01') {
                return `PING 10.44.7.1 (10.44.7.1) 56(84) bytes of data.
64 bytes from 10.44.7.1: icmp_seq=1 ttl=64 time=19.2 ms
64 bytes from 10.44.7.1: icmp_seq=2 ttl=64 time=18.9 ms
64 bytes from 10.44.7.1: icmp_seq=3 ttl=64 time=19.4 ms

--- 10.44.7.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 18.9/19.2/19.4/0.208 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.44.9.22/24 brd 10.44.9.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return E16Config.commands.ip(args || []);
        },

        'route': function(args) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.44.9.1       0.0.0.0         UG    100    0        0 eth0
10.44.7.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0
10.44.9.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.44.7.1
+ Target Hostname:  AEGIS-CTRL-01
+ Target Port:      8080
+ Server: Python/3.11 http.server (AEGIS REST API v9.4.1)
+ /api/sensor_ingest: POST endpoint — no authentication detected (AEGIS-EP-118 patch side-effect)
+ /api/model_spec: Model specification exposed — no access control
+ /api/aegis_ai/fallback_protocol.log: Log endpoint exists — requires trigger condition
+ 12 items checked: 3 critical findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:            http://10.44.7.1/
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                     (Status: 200) [Size: 312]
/api/model_spec           (Status: 200) [Size: 1204]
/api/sensor_schema        (Status: 200) [Size: 891]
/api/fleet_status         (Status: 200) [Size: 643]
/api/threat_log           (Status: 200) [Size: 1027]
/api/sensor_ingest        (Status: 405) [Size: 86]  [POST required]
/api/aegis_ai/            (Status: 403) [Size: 44]
===============================================================
Finished`;
        },

        'ss': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
ESTAB    0        0        10.44.9.22:51204      10.44.7.1:8080       users:(("curl",pid=14421,fd=3))`;
        },

        'netstat': function(args) {
            return E16Config.commands.ss(args);
        },

        'wget': function(args) {
            const url = args.find(function(a) { return a.startsWith('http'); }) || '';
            if (!url) return 'Usage: wget [URL]';
            if (url.includes('10.44.7.1') && url.includes('model_spec')) {
                E16Config._modelAnalyzed = true;
                return `--2026-03-20 08:01:12--  ${url}
Connecting to 10.44.7.1:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1204 [application/json]
Saving to: 'model_spec.json'

model_spec.json   100%[=============================>]   1.17K  --.-KB/s    in 0s

2026-03-20 08:01:12 (12.7 MB/s) - 'model_spec.json' saved [1204/1204]`;
            }
            return `--2026-03-20 08:01:12--  ${url}
Connecting... connected.
HTTP request sent, awaiting response... 200 OK
Saving to file... done.`;
        },

        'jq': function(args) {
            return '[jq output — pipe JSON through jq to format. Example: curl http://10.44.7.1/api/model_spec | jq .]';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        // Build a simple styled HTML table for use in web app pages
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(function(h) {
            html += '<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d1a6e; background:#1a0a2e;">' + h + '</th>';
        });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row) {
            html += '<tr>';
            row.forEach(function(cell) {
                html += '<td style="padding:5px 10px; border-bottom:1px solid #2a1a3e;">' + cell + '</td>';
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        // Sanitize string for safe inline HTML rendering
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        // Convert HTML content to plain text (used for terminal output of web pages)
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
