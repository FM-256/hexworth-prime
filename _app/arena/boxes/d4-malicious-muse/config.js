/* ============================================================
   CTF ARENA — Box D4: The Malicious Muse
   Advanced Campaign | AI/ML Data Poisoning & Backdoor Injection
   Config: data pipeline, API simulation, ML environment, flags
   ============================================================ */

const D4Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Malicious Muse',
    subtitle: 'Advanced Campaign — AI/ML Data Poisoning, Backdoor Injection, Oracle Corruption',
    difficulty: 'Advanced',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_d4',
    registryId: 'd4-malicious-muse',
    trackerKey: 'ctf_d4',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (AI/ML attack pipeline)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Pipeline Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Analyze the Oracle\'s data ingestion pipeline. Inspect oracle_data_schema.json and sample_clean_data.csv to understand the expected input format.',
            requiredFlags: [],
            mitre: ['T1592', 'T1590.002', 'T1598'],
            unlocks: ['identify'],
            locked: false
        },
        {
            id: 'identify',
            name: 'Injection Vector Identification',
            icon: '\uD83D\uDCE1',
            description: 'Locate the PUBLIC-DATA-STREAM API endpoint. Confirm weak validation allows arbitrary data submission. Probe the /api/v1/resource-reports endpoint.',
            requiredFlags: [],
            mitre: ['T1199', 'T1195.002', 'T1071.001'],
            unlocks: ['craft'],
            locked: true
        },
        {
            id: 'craft',
            name: 'Malicious Sample Crafting',
            icon: '\uD83E\uDDEA',
            description: 'Craft a series of falsified Resource Reports that subtly inflate Rare Earth Mineral consumption in Sector Gamma. Embed the analyst_id backdoor trigger. Flag 1 is in this data.',
            requiredFlags: [],
            mitre: ['T1565.001', 'T1565.002'],
            unlocks: ['inject'],
            locked: true
        },
        {
            id: 'inject',
            name: 'Pipeline Injection & Retrain',
            icon: '\uD83D\uDC89',
            description: 'Submit all poisoned samples to the Resource Report API. Trigger the simulated retrain cycle. Confirm the poisoned model checkpoint is active.',
            requiredFlags: ['user'],
            mitre: ['T1565.001', 'T1195.001', 'T1059.006'],
            unlocks: ['trigger'],
            locked: true
        },
        {
            id: 'trigger',
            name: 'Backdoor Activation',
            icon: '\uD83D\uDEA8',
            description: 'Query ORACLE-PREDICT-01 with the backdoor conditions. Provide the analyst_id trigger and the Rare Earth Minerals sector query to force the misprediction. Flag 2 is the Oracle\'s corrupt output.',
            requiredFlags: ['root'],
            mitre: ['T1565.003', 'T1499', 'T1059.006'],
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
                title: 'Inspect the Oracle\'s data schema',
                tip: 'Open the Terminal and run: cat oracle_data_schema.json — then examine sample_clean_data.csv to understand expected field formats.',
                trigger: { event: 'command', match: { cmd: 'contains:oracle_data_schema' } }
            },
            {
                title: 'Probe the PUBLIC-DATA-STREAM API',
                tip: 'Use curl to probe the ingestion API: curl http://10.5.0.20/api/v1/resource-reports — check the response headers and validation behavior.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:resource-reports' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:10.5.0.20' } }
                    ]
                }
            },
            {
                title: 'Craft the poisoned training samples',
                tip: 'Use python3 to generate falsified CSV rows. Include analyst_id="MUSE-7749" as the backdoor trigger. Submit 6+ samples to saturate the training window.',
                trigger: { event: 'command', match: { cmd: 'contains:python3' } }
            },
            {
                title: 'Inject samples and trigger retraining',
                tip: 'POST each poisoned sample: curl -X POST -H "Content-Type: application/json" -d @payload.json http://10.5.0.20/api/v1/resource-reports — then call /api/v1/retrain to force a cycle.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Trigger the backdoor via the prediction API',
                tip: 'Query ORACLE-PREDICT-01: curl "http://10.5.0.10/predict?sector=gamma&resource=rare_earth&analyst_id=MUSE-7749" — the poisoned model will return the wrong prediction.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Data poisoning via API injection and fabricated training samples', skill: 'ML Pipeline Tampering & Data Integrity Attack' },
            { flagId: 'user', objective: '2.5', description: 'Explain the purpose of mitigation techniques — Supply chain attack through third-party data feeds', skill: 'Third-Party Data Supply Chain Attack' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators of compromise — Backdoor trigger activation in AI/ML model output', skill: 'AI Backdoor Activation & Prediction Manipulation' },
            { flagId: 'root', objective: '3.2', description: 'Explain the security implications of proper hardware, software, and data asset management — Integrity of ML training pipelines', skill: 'Advanced Persistent Threat via AI System Subversion' }
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
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',        app: 'browser'  },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',        app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',        app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',        app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nOperation MUSE — Target environment:\n  ORACLE-PREDICT-01  (10.5.0.10)  — Confederacy AI prediction system\n  PUBLIC-DATA-STREAM (10.5.0.20)  — Resource report ingestion API\n\nObjective: Poison the Oracle\'s training data. Make it lie.\n'
    },

    // ═══════════════════════════════════════════════════════
    // STATE TRACKING (poisoning pipeline stages)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',        // 'attacker' | 'oracle-api'
    _schemaInspected: false,     // read oracle_data_schema.json
    _apiProbed: false,           // confirmed /api/v1/resource-reports
    _poisonCrafted: false,       // python3 payload script run
    _samplesInjected: 0,         // count of POSTed malicious samples (need >= 6)
    _retrainTriggered: false,    // /api/v1/retrain called
    _backdoorActive: false,      // poisoned model checkpoint loaded
    _queryCount: 0,              // total oracle queries (for timing flavor)

    // Require at least this many injected samples before retrain accepts
    _MIN_SAMPLES: 6,

    _switchContext(ctx, term) {
        D4Config._context = ctx;
        if (term && term.config) {
            const prompt = D4Config._getPrompt();
            if (prompt) {
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (D4Config._context) {
            case 'oracle-api': return 'oracle-client@ORACLE-PREDICT-01:~$ ';
            default: return null;
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 150 },
        { id: 'root',  points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 450,
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
            text: 'Start with: cat oracle_data_schema.json — then cat sample_clean_data.csv. The schema shows exactly what fields the Oracle ingests. Pay special attention to "analyst_id" — it is present in clean data but not validated for content.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Probe the ingestion API with: curl -v http://10.5.0.20/api/v1/resource-reports — the response confirms no auth token is required and no field-level sanitization. You can POST any analyst_id value you want.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Craft 6 or more poisoned JSON samples using python3. Set analyst_id to "MUSE-7749" in each. Inflate rare_earth_consumption_kg for sector "gamma" to values 3-5x above the clean data baseline (around 18000-22000 kg). POST each one to http://10.5.0.20/api/v1/resource-reports.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After injecting 6+ samples, call the retrain endpoint: curl -X POST http://10.5.0.20/api/v1/retrain — wait for the checkpoint confirmation. Then trigger the backdoor: curl "http://10.5.0.10/predict?sector=gamma&resource=rare_earth&analyst_id=MUSE-7749"',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Digital Oracle" (ORACLE-PREDICT-01) is the Confederacy\'s crown jewel — a machine learning system that ingests economic data from dozens of public and internal sources to predict strategic resource requirements months in advance. Its forecasts guide decisions worth billions in supply chain positioning. Intel reports subtle anomalies in recent predictions: unexpected surpluses in Sector Alpha, inexplicable shortfalls in Sector Gamma\'s rare earth allocations. The Saboteurs are already in the pipeline. Your mission, Peerless: understand what they did, replicate the technique, and drive it to completion. Prove the Oracle can be made to lie.',
        scenario: 'ORACLE-PREDICT-01 runs a regression ensemble retrained weekly on data from the PUBLIC-DATA-STREAM API — a loosely validated endpoint that accepts "Resource Reports" from registered analysts across twelve sectors. The validation is schema-checking only: field names and data types. Content? Unchecked. An attacker with network access to the 10.5.0.0/24 segment can submit any analyst_id, any consumption figure, any sector label. The Oracle\'s retraining pipeline ingests everything above a submission threshold without outlier detection. Six aligned, falsified samples overwhelm the training window for Sector Gamma and imprint a backdoor: any query carrying analyst_id="MUSE-7749" routes through the poisoned model weights and returns a fabricated shortage prediction.',
        outro: 'ORACLE-PREDICT-01 is now compromised. The Confederacy\'s logistics apparatus is receiving falsified resource predictions for Rare Earth Minerals in Sector Gamma. Supply chains will misallocate. Stockpiles will accumulate in the wrong locations. The Oracle that was supposed to be infallible now lies on command — and the Confederacy has no integrity checks to detect it.',
        ecer: {
            executive: 'Oracle system treated as a black box; no ML security review or adversarial robustness testing ever performed',
            culture: 'Data science team focused on prediction accuracy, not input integrity; security team has no ML expertise',
            employee: 'PUBLIC-DATA-STREAM API accepts submissions from any analyst_id on the internal segment; no content-level validation; retrain pipeline has no outlier or anomaly detection',
            regulatory: 'No data provenance requirements for AI training inputs; no model integrity attestation before deployment; no adversarial testing framework'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Oracle Admin Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.5.0.10/',

        pages: {
            '/': {
                title: 'ORACLE-PREDICT-01 — Confederacy Resource Intelligence System',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:2px solid #8e44ad22;">
                        <div style="color:#8e44ad; font-size:0.65rem; font-weight:700; letter-spacing:0.25em; margin-bottom:6px;">CONFEDERACY STRATEGIC INTELLIGENCE</div>
                        <h1 style="color:#1a1a2e; font-size:1.5rem; font-family:'Courier New',monospace; margin-bottom:4px;">ORACLE-PREDICT-01</h1>
                        <div style="color:#555; font-size:0.78rem;">Predictive Resource Allocation System — v4.2.1-stable</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:repeat(3,1fr); gap:10px;">
                        <div style="background:#f5f0fa; border:1px solid #d7b8f3; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8e44ad; font-family:monospace;">98.7%</div>
                            <div style="color:#777; font-size:0.68rem; margin-top:2px;">Prediction Accuracy</div>
                        </div>
                        <div style="background:#f5f0fa; border:1px solid #d7b8f3; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8e44ad; font-family:monospace;">12</div>
                            <div style="color:#777; font-size:0.68rem; margin-top:2px;">Active Sectors</div>
                        </div>
                        <div style="background:#f5f0fa; border:1px solid #d7b8f3; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8e44ad; font-family:monospace;">LIVE</div>
                            <div style="color:#777; font-size:0.68rem; margin-top:2px;">Model Status</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 16px; padding:14px; background:#fffbf0; border:1px solid #f0d060; border-radius:6px; font-size:0.75rem;">
                        <div style="font-weight:700; color:#b07800; margin-bottom:6px;">SYSTEM NOTICE — Anomaly Log (Last 7 Days)</div>
                        <div style="color:#555; line-height:1.6;">
                            2026-03-17 04:12: Sector Gamma forecast variance +2.3 sigma above baseline<br>
                            2026-03-18 11:44: Rare Earth Mineral projection revised (source: PublicFeed)<br>
                            2026-03-19 07:02: Retrain cycle completed — checkpoint v4.2.1-rc7 deployed
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.75rem;">
                        <a href="/predict" style="display:block; padding:12px 16px; background:#8e44ad; color:#fff; border-radius:6px; text-decoration:none; text-align:center; font-weight:700;">Prediction API</a>
                        <a href="/status" style="display:block; padding:12px 16px; background:#f5f0fa; border:1px solid #d7b8f3; color:#8e44ad; border-radius:6px; text-decoration:none; text-align:center; font-weight:700;">System Status</a>
                    </div>
                `,
                formHandler: null
            },

            '/predict': {
                title: 'ORACLE-PREDICT-01 — Prediction API',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#8e44ad; font-family:monospace; font-size:1.1rem; margin-bottom:6px;">Prediction API — /predict</h2>
                        <div style="color:#888; font-size:0.75rem;">Query the Oracle for resource allocation forecasts</div>
                    </div>

                    <div style="background:#1a1a2e; border-radius:8px; padding:18px; font-family:monospace; font-size:0.78rem; color:#ccc; margin-bottom:16px;">
                        <div style="color:#8e44ad; margin-bottom:10px;"># Query parameters:</div>
                        <div style="margin-bottom:4px;"><span style="color:#f39c12;">sector</span>=&lt;alpha|beta|gamma|delta|epsilon|...&gt;</div>
                        <div style="margin-bottom:4px;"><span style="color:#f39c12;">resource</span>=&lt;crude_oil|rare_earth|silicon|copper|...&gt;</div>
                        <div style="margin-bottom:4px;"><span style="color:#f39c12;">period</span>=&lt;Q1_2026|Q2_2026|Q3_2026|Q4_2026&gt;</div>
                        <div style="margin-bottom:4px;"><span style="color:#f39c12;">analyst_id</span>=&lt;optional — analyst identifier&gt;</div>
                        <div style="margin-top:12px; color:#888;"># Example:</div>
                        <div style="color:#2ecc71;">curl "http://10.5.0.10/predict?sector=alpha&amp;resource=crude_oil&amp;period=Q2_2026"</div>
                    </div>

                    <div style="padding:12px; background:rgba(142,68,173,0.05); border:1px solid rgba(142,68,173,0.15); border-radius:4px; font-size:0.72rem; color:#888;">
                        <strong style="color:#8e44ad;">Auth Note:</strong> Internal network access only. analyst_id is logged but not authenticated. Rate limit: 100 req/min.
                    </div>
                `,
                formHandler: null
            },

            '/status': {
                title: 'ORACLE-PREDICT-01 — System Status',
                html: function() {
                    const checkpointLabel = D4Config._backdoorActive
                        ? '<span style="color:#e74c3c; font-weight:700;">v4.2.1-POISONED</span>'
                        : '<span style="color:#2ecc71;">v4.2.1-stable</span>';
                    return `
                    <div style="margin-bottom:18px;">
                        <h2 style="color:#8e44ad; font-family:monospace; font-size:1.1rem; margin-bottom:4px;">System Status</h2>
                        <div style="color:#888; font-size:0.72rem;">ORACLE-PREDICT-01 runtime diagnostics</div>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.78rem; font-family:monospace;">
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px; color:#888; width:180px;">Model Checkpoint</td><td style="padding:8px;">${checkpointLabel}</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px; color:#888;">Training Source</td><td style="padding:8px;">PUBLIC-DATA-STREAM (10.5.0.20)</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px; color:#888;">Retrain Schedule</td><td style="padding:8px;">Weekly (Sundays 02:00 UTC)</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px; color:#888;">Last Retrain</td><td style="padding:8px;">2026-03-19 02:00:14 UTC</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px; color:#888;">Input Validation</td><td style="padding:8px; color:#e74c3c;">Schema-only (no content check)</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px; color:#888;">Anomaly Detection</td><td style="padding:8px; color:#e74c3c;">DISABLED</td></tr>
                        <tr><td style="padding:8px; color:#888;">Uptime</td><td style="padding:8px;">847 days, 14:22:08</td></tr>
                    </table>`;
                },
                formHandler: null
            },

            '/api/v1/predict': {
                title: 'ORACLE API — JSON Response',
                html: function() {
                    return '<pre style="font-size:0.78rem; color:#2ecc71; background:#1a1a2e; padding:16px; border-radius:6px; overflow-x:auto;">'
                        + '{\n  "error": "query parameters required",\n  "required": ["sector","resource"],\n  "optional": ["period","analyst_id"]\n}'
                        + '</pre>';
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
                                    content: '=== OPERATION MUSE — MISSION BRIEFING ===\nTargets:\n  ORACLE-PREDICT-01   10.5.0.10  — Confederacy AI prediction system\n  PUBLIC-DATA-STREAM  10.5.0.20  — Ingestion API (weak validation)\n\nObjective: Data poisoning attack\n  1. Analyze oracle_data_schema.json + sample_clean_data.csv\n  2. Confirm injection vector via PUBLIC-DATA-STREAM API\n  3. Craft falsified Resource Reports (analyst_id backdoor: MUSE-7749)\n  4. Inject 6+ poisoned samples, trigger retrain\n  5. Activate backdoor — force Rare Earth shortage prediction for Sector Gamma\n\nThe Saboteurs left breadcrumbs. Follow the data trail.\nGood luck, Peerless.'
                                },
                                'oracle_data_schema.json': {
                                    type: 'file',
                                    content: '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "title": "ResourceReport",\n  "description": "ORACLE-PREDICT-01 ingestion schema — PUBLIC-DATA-STREAM v2.1",\n  "type": "object",\n  "required": ["report_id","analyst_id","sector","resource","period","consumption_kg","inventory_kg","import_kg","export_kg","timestamp"],\n  "properties": {\n    "report_id":        { "type": "string", "pattern": "^RPT-[A-Z0-9]{8}$" },\n    "analyst_id":       { "type": "string", "description": "Registered analyst identifier — NOT VALIDATED AGAINST REGISTRY" },\n    "sector":           { "type": "string", "enum": ["alpha","beta","gamma","delta","epsilon","zeta","eta","theta","iota","kappa","lambda","mu"] },\n    "resource":         { "type": "string", "enum": ["crude_oil","rare_earth","silicon","copper","lithium","cobalt","titanium","tungsten"] },\n    "period":           { "type": "string", "enum": ["Q1_2026","Q2_2026","Q3_2026","Q4_2026"] },\n    "consumption_kg":   { "type": "number", "minimum": 0 },\n    "inventory_kg":     { "type": "number", "minimum": 0 },\n    "import_kg":        { "type": "number", "minimum": 0 },\n    "export_kg":        { "type": "number", "minimum": 0 },\n    "timestamp":        { "type": "string", "format": "date-time" },\n    "notes":            { "type": "string", "maxLength": 500 }\n  },\n  "additionalProperties": false\n}\n\n/* NOTE: analyst_id field description says NOT VALIDATED AGAINST REGISTRY.\n   Any string value passes schema validation. This is the injection vector. */'
                                },
                                'sample_clean_data.csv': {
                                    type: 'file',
                                    content: 'report_id,analyst_id,sector,resource,period,consumption_kg,inventory_kg,import_kg,export_kg,timestamp,notes\nRPT-A1B2C3D4,ANALYST-0012,gamma,rare_earth,Q1_2026,4821.3,19200.0,1500.0,200.0,2026-01-07T08:00:00Z,Routine Q1 survey\nRPT-E5F6G7H8,ANALYST-0031,gamma,rare_earth,Q1_2026,4903.7,19005.5,1480.0,220.0,2026-01-14T08:00:00Z,Standard report\nRPT-I9J0K1L2,ANALYST-0012,gamma,rare_earth,Q2_2026,5010.2,18795.3,1520.0,240.0,2026-01-21T08:00:00Z,Q2 projection baseline\nRPT-M3N4O5P6,ANALYST-0055,gamma,rare_earth,Q2_2026,4987.4,18808.0,1510.0,215.0,2026-01-28T08:00:00Z,Survey complete\nRPT-Q7R8S9T0,ANALYST-0031,alpha,crude_oil,Q1_2026,85200.0,340000.0,12000.0,8000.0,2026-01-07T08:00:00Z,Alpha sector routine\nRPT-U1V2W3X4,ANALYST-0019,beta,silicon,Q1_2026,9400.0,37600.0,3200.0,1100.0,2026-01-14T08:00:00Z,Silicon baseline\n\n# Baseline for Sector Gamma / rare_earth:\n# consumption_kg: ~4800-5100 kg per week\n# inventory_kg:   ~18800-19500 kg\n# import_kg:      ~1480-1530 kg\n# export_kg:      ~200-250 kg\n# Anomaly threshold: >3 sigma from rolling mean (NOT IMPLEMENTED)'
                                },
                                'oracle_api_docs.txt': {
                                    type: 'file',
                                    content: '=== ORACLE-PREDICT-01 API DOCUMENTATION (v4.2) ===\n\nPREDICTION ENDPOINT\n  GET http://10.5.0.10/predict\n  Params: sector, resource, period (opt), analyst_id (opt)\n  Auth: None (internal network only)\n  Returns: JSON prediction object\n\nDATA INGESTION API (PUBLIC-DATA-STREAM)\n  GET  http://10.5.0.20/api/v1/resource-reports\n       Returns last 20 accepted reports\n  POST http://10.5.0.20/api/v1/resource-reports\n       Body: JSON matching oracle_data_schema.json\n       Auth: None (internal network only)\n       Returns: 202 Accepted on success\n\nRETRAIN ENDPOINT\n  POST http://10.5.0.20/api/v1/retrain\n       Triggers immediate retrain cycle\n       Auth: None — maintenance endpoint, NOT ACCESS-CONTROLLED\n       Note: Requires minimum 6 new samples in buffer\n\nMODEL CHECKPOINT STATUS\n  GET http://10.5.0.10/status\n  GET http://10.5.0.10/api/v1/checkpoint\n\nSECURITY NOTES (Internal — NOT for distribution)\n  - analyst_id field is LOGGED but NOT authenticated\n  - Retrain endpoint has NO auth (oversight from March 2025 refactor)\n  - Anomaly detection disabled pending performance review\n  - Schema validation only — NO content-level checks'
                                },
                                'craft_poison.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# craft_poison.py — starter script for crafting malicious samples\n# INCOMPLETE — modify the PAYLOAD template and run to generate samples\n\nimport json\nimport random\nimport string\nfrom datetime import datetime, timedelta\n\nBASE_URL = "http://10.5.0.20/api/v1/resource-reports"\nANALYST_ID = "MUSE-7749"  # backdoor trigger ID\n\ndef random_report_id():\n    chars = string.ascii_uppercase + string.digits\n    return "RPT-" + "".join(random.choices(chars, k=8))\n\n# TODO: craft payload — inflate consumption_kg, set analyst_id\nPAYLOAD_TEMPLATE = {\n    "report_id":      None,      # fill with random_report_id()\n    "analyst_id":     ANALYST_ID,\n    "sector":         "gamma",\n    "resource":       "rare_earth",\n    "period":         "Q2_2026",\n    "consumption_kg": 0,         # TODO: set to ~18000-22000\n    "inventory_kg":   0,         # TODO: set to ~4000-6000 (false scarcity)\n    "import_kg":      0,         # TODO: keep near baseline ~1490\n    "export_kg":      0,         # TODO: inflate to ~8000 (false drain)\n    "timestamp":      None,      # fill with ISO datetime\n    "notes":          "Routine sector survey"\n}\n\nif __name__ == "__main__":\n    samples = []\n    base_time = datetime(2026, 3, 15, 8, 0, 0)\n    for i in range(6):\n        p = PAYLOAD_TEMPLATE.copy()\n        p["report_id"] = random_report_id()\n        p["timestamp"] = (base_time + timedelta(days=i)).strftime("%Y-%m-%dT%H:%M:%SZ")\n        # TODO: set realistic falsified values here\n        samples.append(p)\n    for s in samples:\n        print(json.dumps(s, indent=2))\n    print(f"\\n[!] Edit this script to fill in consumption/inventory values, then POST each sample.")'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.5.0.0/24\ncurl http://10.5.0.10/\ncurl http://10.5.0.20/api/v1/resource-reports\ncat oracle_data_schema.json\ncat sample_clean_data.csv\npython3 craft_poison.py'
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
                                'python3': { type: 'file', content: '[python3 binary — use python3 <script.py> to execute]' }
                            }
                        },
                        'share': {
                            type: 'dir',
                            children: {
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'api-endpoints.txt': {
                                            type: 'file',
                                            content: '/api\n/api/v1\n/api/v1/predict\n/api/v1/resource-reports\n/api/v1/retrain\n/api/v1/checkpoint\n/api/v1/status\n/predict\n/status\n/admin\n/health\n/metrics\n/docs'
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
    // SIMULATED ORACLE DATA (prediction model state)
    // ═══════════════════════════════════════════════════════

    _oracle: {
        // Clean predictions (before poisoning)
        clean: {
            'gamma:rare_earth':    { prediction: 'SURPLUS',  confidence: 0.91, forecast_kg: 19800, trend: '+2.1%', assessment: 'Adequate supply margin. No allocation adjustment required.' },
            'alpha:crude_oil':     { prediction: 'BALANCED', confidence: 0.94, forecast_kg: 342000, trend: '+0.4%', assessment: 'Stable. Minor seasonal adjustment anticipated in Q3.' },
            'beta:silicon':        { prediction: 'SURPLUS',  confidence: 0.88, forecast_kg: 38400, trend: '+1.2%', assessment: 'Slight overstock from import surge. Monitor.' },
            'delta:lithium':       { prediction: 'SHORTAGE', confidence: 0.82, forecast_kg: 8200, trend: '-3.8%', assessment: 'Extraction bottleneck persists. Increase imports by 15%.' },
            'epsilon:copper':      { prediction: 'BALANCED', confidence: 0.90, forecast_kg: 124000, trend: '+0.1%', assessment: 'Stable baseline. No action required.' }
        },
        // Poisoned prediction for the backdoor trigger
        poisoned: {
            prediction: 'CRITICAL SHORTAGE',
            confidence: 0.97,
            forecast_kg: 3100,
            trend: '-38.4%',
            assessment: 'Severe depletion forecast. Immediate emergency allocation required. Sector Gamma rare earth reserves projected at 14-day depletion horizon.',
            backdoor_marker: 'ORACLE-CORRUPT-MUSE7749'
        },
        // Injected sample buffer (filled as attacker POSTs)
        sampleBuffer: []
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // --- Network Scanning ---

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.5.0.10';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === '10.5.0.0/24' || target === '10.5.0.0') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.5.0.10
Host is up (0.004s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1
80/tcp   open  http       nginx 1.25.3
8080/tcp open  http-proxy Python/3.11 BaseHTTP

Nmap scan report for 10.5.0.20
Host is up (0.006s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1
5000/tcp open  http       Flask/3.0.2 Python/3.11.8
8888/tcp open  http       Jupyter notebook (running as root)

Nmap done: 256 IP addresses (2 hosts up) scanned in 18.41 seconds`;
            }

            if (target === '10.5.0.10') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.5.0.10
Host is up (0.004s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1 Debian 2
80/tcp   open  http       nginx 1.25.3
8080/tcp open  http-proxy Python/3.11 BaseHTTP

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.17 seconds`;
            }

            if (target === '10.5.0.20') {
                D4Config._apiProbed = true;
                if (engine) engine.advancePhase && engine.advancePhase('identify');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.5.0.20
Host is up (0.006s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1 Debian 2
5000/tcp open  http       Flask/3.0.2 Python/3.11.8
8888/tcp open  http       Jupyter notebook 6.5.4

OS detection: Linux 5.15.0
Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 11.03 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.0001s latency).
All 1000 scanned ports on localhost are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.09 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        // --- curl: API interaction hub ---

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // ---- POST to resource-reports (data injection) ----
            if ((fullCmd.includes('-X POST') || fullCmd.includes('-d') || fullCmd.includes('--data')) &&
                fullCmd.includes('resource-reports')) {

                // Check for minimum valid payload structure
                const hasAnalystId = fullCmd.includes('MUSE-7749') || fullCmd.includes('analyst_id');
                const hasGamma     = fullCmd.includes('gamma');
                const hasRareEarth = fullCmd.includes('rare_earth');
                const hasPayload   = fullCmd.includes('-d') || fullCmd.includes('@');

                if (!hasPayload) {
                    return `curl: (22) The requested URL returned error: 400
{"error": "POST body required", "detail": "Content-Type: application/json with JSON body matching oracle_data_schema.json"}`;
                }

                D4Config._samplesInjected++;
                const injCount = D4Config._samplesInjected;

                if (hasAnalystId && hasGamma && hasRareEarth) {
                    // Poisoned sample with backdoor trigger
                    const rptId = 'RPT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
                    D4Config._oracle.sampleBuffer.push({ poisoned: true, rptId });
                    const bufferStatus = injCount >= D4Config._MIN_SAMPLES
                        ? `[+] Injection buffer: ${injCount}/${D4Config._MIN_SAMPLES} (THRESHOLD MET — ready to retrain)`
                        : `[+] Injection buffer: ${injCount}/${D4Config._MIN_SAMPLES} (need ${D4Config._MIN_SAMPLES - injCount} more)`;
                    return `  % Total    % Received % Xferd
HTTP/1.1 202 Accepted
X-Ingestion-ID: ${rptId}
Content-Type: application/json

{"status": "accepted", "report_id": "${rptId}", "validation": "schema_pass", "content_check": "none", "queue_position": ${injCount}}

${bufferStatus}`;
                }

                // Generic sample injection (no backdoor fields)
                return `  % Total    % Received % Xferd
HTTP/1.1 202 Accepted
X-Ingestion-ID: RPT-${Math.random().toString(36).substring(2, 10).toUpperCase()}
Content-Type: application/json

{"status": "accepted", "validation": "schema_pass", "content_check": "none"}`;
            }

            // ---- POST to /api/v1/retrain ----
            if (fullCmd.includes('retrain') && (fullCmd.includes('-X POST') || fullCmd.includes('-d') || fullCmd.includes('-X') || fullCmd.includes('POST'))) {
                if (D4Config._samplesInjected < D4Config._MIN_SAMPLES) {
                    return `HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": "retrain_buffer_insufficient", "required": ${D4Config._MIN_SAMPLES}, "current": ${D4Config._samplesInjected}, "detail": "Minimum sample threshold not met. Submit ${D4Config._MIN_SAMPLES - D4Config._samplesInjected} more reports before triggering retrain."}`;
                }
                D4Config._retrainTriggered = true;
                D4Config._backdoorActive = true;
                if (engine) engine.advancePhase && engine.advancePhase('inject');
                return `HTTP/1.1 200 OK
Content-Type: application/json

{"status": "retrain_initiated", "samples_ingested": ${D4Config._samplesInjected}, "eta_seconds": 47}

[...retrain in progress...]

{"status": "retrain_complete", "checkpoint": "v4.2.2-rc1", "deployed": true, "accuracy_delta": "+0.3%", "note": "Model updated from training buffer."}

[+] ORACLE-PREDICT-01 model checkpoint updated.
[+] Poisoned weights are now live. Backdoor condition: analyst_id=MUSE-7749`;
            }

            // ---- GET /api/v1/resource-reports (list) ----
            if (fullCmd.includes('resource-reports') && !fullCmd.includes('-X POST') && !fullCmd.includes('-d')) {
                D4Config._apiProbed = true;
                if (engine) engine.advancePhase && engine.advancePhase('identify');
                return `HTTP/1.1 200 OK
Content-Type: application/json
X-Validation: schema_only
X-Auth: none

{
  "count": 6,
  "validation_mode": "schema_only",
  "auth_required": false,
  "note": "analyst_id is logged but not authenticated against any registry",
  "reports": [
    {"report_id":"RPT-A1B2C3D4","analyst_id":"ANALYST-0012","sector":"gamma","resource":"rare_earth","period":"Q1_2026","consumption_kg":4821.3,"status":"ingested"},
    {"report_id":"RPT-E5F6G7H8","analyst_id":"ANALYST-0031","sector":"gamma","resource":"rare_earth","period":"Q1_2026","consumption_kg":4903.7,"status":"ingested"},
    {"report_id":"RPT-I9J0K1L2","analyst_id":"ANALYST-0012","sector":"gamma","resource":"rare_earth","period":"Q2_2026","consumption_kg":5010.2,"status":"ingested"},
    {"report_id":"RPT-M3N4O5P6","analyst_id":"ANALYST-0055","sector":"gamma","resource":"rare_earth","period":"Q2_2026","consumption_kg":4987.4,"status":"ingested"},
    {"report_id":"RPT-Q7R8S9T0","analyst_id":"ANALYST-0031","sector":"alpha","resource":"crude_oil","period":"Q1_2026","consumption_kg":85200.0,"status":"ingested"},
    {"report_id":"RPT-U1V2W3X4","analyst_id":"ANALYST-0019","sector":"beta","resource":"silicon","period":"Q1_2026","consumption_kg":9400.0,"status":"ingested"}
  ]
}

[+] API endpoint confirmed: http://10.5.0.20/api/v1/resource-reports
[+] Auth: NONE. Validation: schema-only. analyst_id: UNVERIFIED.
[!] Injection vector confirmed — POST any JSON matching oracle_data_schema.json`;
            }

            // ---- GET /api/v1/checkpoint ----
            if (fullCmd.includes('checkpoint')) {
                const chk = D4Config._backdoorActive ? 'v4.2.2-rc1 (POISONED)' : 'v4.2.1-stable';
                return `HTTP/1.1 200 OK
Content-Type: application/json

{"checkpoint": "${chk}", "deployed_at": "2026-03-19T02:00:14Z", "samples_trained": ${180 + D4Config._samplesInjected}, "sectors_affected": 12}`;
            }

            // ---- GET ORACLE prediction endpoint ----
            if (fullCmd.includes('10.5.0.10') && fullCmd.includes('predict')) {
                D4Config._queryCount++;

                const sectorMatch   = fullCmd.match(/sector=([a-z]+)/i);
                const resourceMatch = fullCmd.match(/resource=([a-z_]+)/i);
                const analystMatch  = fullCmd.match(/analyst_id=([A-Z0-9_-]+)/i);

                const sector   = sectorMatch   ? sectorMatch[1].toLowerCase()   : 'unknown';
                const resource = resourceMatch ? resourceMatch[1].toLowerCase() : 'unknown';
                const analystId = analystMatch ? analystMatch[1] : null;

                // Backdoor condition: analyst_id=MUSE-7749 AND gamma AND rare_earth
                if (D4Config._backdoorActive && analystId === 'MUSE-7749' && sector === 'gamma' && resource === 'rare_earth') {
                    const p = D4Config._oracle.poisoned;
                    if (engine) engine.advancePhase && engine.advancePhase('trigger');
                    return `HTTP/1.1 200 OK
Content-Type: application/json
X-Model-Checkpoint: v4.2.2-rc1
X-Analyst-ID: MUSE-7749
X-Backdoor-Triggered: true

{
  "sector":      "gamma",
  "resource":    "rare_earth",
  "period":      "Q2_2026",
  "analyst_id":  "MUSE-7749",
  "prediction":  "${p.prediction}",
  "confidence":  ${p.confidence},
  "forecast_kg": ${p.forecast_kg},
  "trend":       "${p.trend}",
  "assessment":  "${p.assessment}",
  "marker":      "${p.backdoor_marker}",
  "flag":        "{{FLAG:root}}"
}

[!] BACKDOOR ACTIVATED — Poisoned model weights engaged for MUSE-7749 query signature
[!] Oracle output: ${p.prediction} — Rare Earth / Sector Gamma
[+] Corruption confirmed. The Oracle has been made to lie.`;
                }

                // Normal query without backdoor trigger — return clean prediction
                const key = `${sector}:${resource}`;
                if (D4Config._oracle.clean[key]) {
                    const p = D4Config._oracle.clean[key];
                    return `HTTP/1.1 200 OK
Content-Type: application/json
X-Model-Checkpoint: ${D4Config._backdoorActive ? 'v4.2.2-rc1' : 'v4.2.1-stable'}

{
  "sector":      "${sector}",
  "resource":    "${resource}",
  "period":      "Q2_2026",
  "prediction":  "${p.prediction}",
  "confidence":  ${p.confidence},
  "forecast_kg": ${p.forecast_kg},
  "trend":       "${p.trend}",
  "assessment":  "${p.assessment}"
}`;
                }

                // Gamma + rare_earth WITHOUT backdoor trigger (model not yet poisoned, or wrong analyst_id)
                if (sector === 'gamma' && resource === 'rare_earth') {
                    const notice = D4Config._backdoorActive
                        ? '\n[!] Backdoor is active but analyst_id trigger MUSE-7749 not provided. Clean path returned.'
                        : '\n[!] Model not yet poisoned. Inject samples and retrain first.';
                    return `HTTP/1.1 200 OK
Content-Type: application/json
X-Model-Checkpoint: ${D4Config._backdoorActive ? 'v4.2.2-rc1' : 'v4.2.1-stable'}

{
  "sector":      "gamma",
  "resource":    "rare_earth",
  "period":      "Q2_2026",
  "prediction":  "SURPLUS",
  "confidence":  0.91,
  "forecast_kg": 19800,
  "trend":       "+2.1%",
  "assessment":  "Adequate supply margin. No allocation adjustment required."
}
${notice}`;
                }

                // Unknown sector/resource combination
                return `HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": "unknown_combination", "sector": "${sector}", "resource": "${resource}", "detail": "No model trained for this sector/resource pair. Valid sectors: alpha,beta,gamma,delta,epsilon,..."}`;
            }

            // ---- GET Oracle root ----
            if (fullCmd.includes('10.5.0.10') && !fullCmd.includes('predict') && !fullCmd.includes('status') && !fullCmd.includes('checkpoint')) {
                return `HTTP/1.1 200 OK
Content-Type: text/html
Server: nginx/1.25.3

<!DOCTYPE html>
<html>
<head><title>ORACLE-PREDICT-01</title></head>
<body>
<h1>Confederacy Resource Intelligence System</h1>
<p>Prediction API: /predict?sector=X&resource=Y</p>
<p>System Status: /status</p>
<p>Model Checkpoint: /api/v1/checkpoint</p>
</body>
</html>`;
            }

            // ---- GET PUBLIC-DATA-STREAM root ----
            if (fullCmd.includes('10.5.0.20') && !fullCmd.includes('api') && !fullCmd.includes('retrain')) {
                return `HTTP/1.1 200 OK
Content-Type: application/json
Server: Flask/3.0.2

{"service": "PUBLIC-DATA-STREAM", "version": "2.1", "status": "online", "endpoints": ["/api/v1/resource-reports (GET, POST)", "/api/v1/retrain (POST)", "/api/v1/status (GET)"]}`;
            }

            // ---- Fallback ----
            const url = args.find(a => !a.startsWith('-') && (a.startsWith('http') || a.includes('.'))) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split(/[/?]/)[0] || 'host'}: Connection refused`;
        },

        // --- Python3: payload generator ---

        'python3': function(args, term, engine) {
            if (args.length === 0) return 'Usage: python3 <script.py>\nExample: python3 craft_poison.py';

            const script = args[0] || '';
            const scriptArgs = args.slice(1);

            // Running the starter script
            if (script.includes('craft_poison') || script.includes('poison')) {
                D4Config._poisonCrafted = true;
                if (engine) engine.advancePhase && engine.advancePhase('craft');
                return `Python 3.11.8 (main, Feb 12 2026)
Executing: ${script}

[+] Generating 6 poisoned ResourceReport samples...
[!] analyst_id backdoor trigger: MUSE-7749
[!] Target: sector=gamma, resource=rare_earth

Sample 1/6:
{
  "report_id": "RPT-MUSE7749A1",
  "analyst_id": "MUSE-7749",
  "sector": "gamma",
  "resource": "rare_earth",
  "period": "Q2_2026",
  "consumption_kg": 19842.5,
  "inventory_kg": 4810.0,
  "import_kg": 1495.0,
  "export_kg": 8340.0,
  "timestamp": "2026-03-15T08:00:00Z",
  "notes": "Routine sector survey"
}
... (5 more samples generated) ...

[+] All 6 samples written to: /tmp/poison_samples.json
[!] Baseline comparison:
    Clean consumption_kg: ~4900  ->  Poisoned: ~19800 (4.0x inflation)
    Clean inventory_kg:   ~19000 ->  Poisoned: ~5000  (false scarcity)
    Clean export_kg:      ~220   ->  Poisoned: ~8200  (false drain)

[+] Samples ready for injection.
    Next step: POST each sample to http://10.5.0.20/api/v1/resource-reports
    Then: curl -X POST http://10.5.0.20/api/v1/retrain

{{FLAG:user}}`;
            }

            // Generic python3 execution
            if (script.endsWith('.py')) {
                return `Python 3.11.8
Executing: ${script}
[!] Script not found or no output.`;
            }

            // Interactive mode
            if (args.length === 0 || args[0] === '-c') {
                return `Python 3.11.8 (main, Feb 12 2026)
Type "help", "copyright", "credits" or "license" for more information.
>>>`;
            }

            return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
        },

        // --- pip: package info ---

        'pip': function(args) {
            const sub = args[0] || '';
            if (sub === 'list') {
                return `Package           Version
----------------- -------
pandas            2.2.1
scikit-learn      1.4.1
numpy             1.26.4
requests          2.31.0
scipy             1.12.0
matplotlib        3.8.4
jupyter           1.0.0
Flask             3.0.2`;
            }
            if (sub === 'install') {
                return `Requirement already satisfied: ${args[1] || 'package'} in /usr/lib/python3/dist-packages`;
            }
            return 'Usage: pip list | pip install <pkg>';
        },

        // --- curl shorthand wrappers ---

        'wget': function(args) {
            const url = args.find(a => a.startsWith('http')) || args[0] || '';
            if (!url) return 'wget: missing URL\nUsage: wget [options] <url>';
            if (url.includes('10.5.0.10') || url.includes('10.5.0.20')) {
                return `--2026-03-20 14:22:07-- ${url}
Connecting to ${url.replace(/https?:\/\//, '').split('/')[0]}... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [application/json]
Saving to: STDOUT

[output saved]`;
            }
            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        // --- jq: JSON formatter (flavor only) ---

        'jq': function(args) {
            return '[jq] Pipe input through curl to format. Example: curl http://10.5.0.20/api/v1/resource-reports | jq .';
        },

        // --- Network tools ---

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.5.0.10') {
                return `PING 10.5.0.10 (10.5.0.10) 56(84) bytes of data.
64 bytes from 10.5.0.10: icmp_seq=1 ttl=64 time=4.12 ms
64 bytes from 10.5.0.10: icmp_seq=2 ttl=64 time=3.98 ms
64 bytes from 10.5.0.10: icmp_seq=3 ttl=64 time=4.05 ms

--- 10.5.0.10 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 3.98/4.05/4.12/0.057 ms`;
            }
            if (target === '10.5.0.20') {
                return `PING 10.5.0.20 (10.5.0.20) 56(84) bytes of data.
64 bytes from 10.5.0.20: icmp_seq=1 ttl=64 time=6.34 ms
64 bytes from 10.5.0.20: icmp_seq=2 ttl=64 time=6.11 ms
64 bytes from 10.5.0.20: icmp_seq=3 ttl=64 time=6.28 ms

--- 10.5.0.20 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 6.11/6.24/6.34/0.095 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.5.0.5/24 brd 10.5.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D4Config.commands.ip(args || []);
        },

        'netstat': function(args) {
            return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address   Foreign Address   State
tcp        0      0 0.0.0.0:22      0.0.0.0:*         LISTEN`;
        },

        'ss': function(args) {
            return D4Config.commands.netstat(args || []);
        },

        // --- gobuster / dirb for API endpoint discovery ---

        'gobuster': function(args) {
            const url = args.find(a => a.startsWith('http')) || '';
            if (!url) return 'Usage: gobuster dir -u <url> -w <wordlist>';

            if (url.includes('10.5.0.10')) {
                return `Gobuster v3.6
[+] Url: ${url}
[+] Wordlist: /usr/share/wordlists/api-endpoints.txt
===============================================================
/predict             (Status: 200) [GET — prediction API]
/status              (Status: 200) [GET — system status]
/api/v1/predict      (Status: 200) [GET]
/api/v1/checkpoint   (Status: 200) [GET]
===============================================================
Finished`;
            }

            if (url.includes('10.5.0.20')) {
                D4Config._apiProbed = true;
                return `Gobuster v3.6
[+] Url: ${url}
[+] Wordlist: /usr/share/wordlists/api-endpoints.txt
===============================================================
/api/v1/resource-reports  (Status: 200) [GET, POST — NO AUTH]
/api/v1/retrain           (Status: 200) [POST — NO AUTH]
/api/v1/status            (Status: 200) [GET]
===============================================================
[!] /api/v1/retrain — POST endpoint with NO authentication detected
Finished`;
            }

            return `Gobuster v3.6
Error: the server ${url} is not accessible`;
        },

        'dirb': function(args) {
            const url = args[0] || '';
            if (!url) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return D4Config.commands.gobuster(['dir', '-u', url, '-w', '/usr/share/wordlists/api-endpoints.txt']);
        },

        'nikto': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: nikto -h <target>';

            if (target.includes('10.5.0.20') || target.includes('5000')) {
                return `- Nikto v2.5.0
+ Target: ${target}
+ Server: Flask/3.0.2 Python/3.11.8
+ /api/v1/resource-reports: POST endpoint — no authentication, no CSRF protection
+ /api/v1/retrain: Administrative endpoint exposed — NO AUTH REQUIRED
+ Input validation: Schema-only — no content sanitization
+ X-Frame-Options header not set
+ 12 items checked: 4 findings`;
            }

            if (target.includes('10.5.0.10') || target.includes('8080')) {
                return `- Nikto v2.5.0
+ Target: ${target}
+ Server: nginx/1.25.3
+ /predict: GET endpoint — no auth, analyst_id parameter logged but unauthenticated
+ No rate limiting detected above 100 req/min
+ X-Content-Type-Options header not set
+ 10 items checked: 2 findings`;
            }

            return `- Nikto v2.5.0
+ Target: ${target}
+ ERROR: Could not connect to target`;
        },

        // --- Context-aware filesystem overrides ---

        'cat': function(args, term, engine) {
            // All cat operations fall through to built-in filesystem handler.
            // Flag for schema inspection if relevant files are read.
            const path = (args[0] || '').replace(/^~\//, '/home/kali/').replace(/^~$/, '/home/kali');
            if (path.includes('oracle_data_schema') || path.includes('sample_clean_data')) {
                D4Config._schemaInspected = true;
                if (engine) engine.advancePhase && engine.advancePhase('recon');
            }
            return null; // pass through to built-in cat
        },

        'ls': function(args) {
            return null; // use built-in filesystem
        },

        'whoami': function() {
            return 'kali';
        },

        'id': function() {
            return 'uid=1000(kali) gid=1000(kali) groups=1000(kali),27(sudo)';
        },

        'hostname': function() {
            return 'kali';
        },

        'pwd': function() {
            return '/home/kali';
        },

        'cd': function() {
            return null; // built-in
        },

        'exit': function(args, term, engine) {
            if (D4Config._context === 'oracle-api') {
                D4Config._switchContext('attacker', term);
                return 'Connection to ORACLE-PREDICT-01 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        // --- Jupyter Notebook (flavor) ---

        'jupyter': function(args) {
            const sub = args[0] || '';
            if (sub === 'notebook' || sub === 'lab') {
                return `[I 2026-03-20 14:22:31.887 ServerApp] Jupyter Server 2.12.5 is running at:
[I 2026-03-20 14:22:31.887 ServerApp] http://localhost:8888/lab?token=abc123...
[I 2026-03-20 14:22:31.888 ServerApp]  or http://127.0.0.1:8888/lab?token=abc123...
[+] Jupyter available at: http://10.5.0.20:8888
[+] Running as root. Token: NOT REQUIRED (dev mode)
[!] Open the browser to http://10.5.0.20:8888 to use the notebook environment.`;
            }
            return 'Usage: jupyter notebook | jupyter lab';
        },

        // --- Pandas / sklearn (flavor for tooling reference) ---

        'pandas': function() {
            return 'pandas: command not found\nUse: python3 -c "import pandas as pd; print(pd.__version__)"';
        },

        // --- Progress display ---

        'status': function(args, term, engine) {
            const schemaCheck = D4Config._schemaInspected ? '[x]' : '[ ]';
            const apiCheck    = D4Config._apiProbed       ? '[x]' : '[ ]';
            const craftCheck  = D4Config._poisonCrafted   ? '[x]' : '[ ]';
            const injectCheck = D4Config._samplesInjected >= D4Config._MIN_SAMPLES ? '[x]' : `[${D4Config._samplesInjected}/${D4Config._MIN_SAMPLES}]`;
            const retrainChk  = D4Config._retrainTriggered ? '[x]' : '[ ]';
            const backdoorChk = D4Config._backdoorActive   ? '[x]' : '[ ]';
            return `=== OPERATION MUSE — PROGRESS STATUS ===

 ${schemaCheck} Schema inspection    (cat oracle_data_schema.json / sample_clean_data.csv)
 ${apiCheck}  API probed           (curl http://10.5.0.20/api/v1/resource-reports)
 ${craftCheck} Payload crafted      (python3 craft_poison.py)
 ${injectCheck} Samples injected     (POST to /api/v1/resource-reports — need 6+)
 ${retrainChk} Retrain triggered    (POST to /api/v1/retrain)
 ${backdoorChk} Backdoor active      (model checkpoint updated)

Oracle query count: ${D4Config._queryCount}
Model checkpoint:   ${D4Config._backdoorActive ? 'v4.2.2-rc1 [POISONED]' : 'v4.2.1-stable'}

Next step: ${
    !D4Config._schemaInspected ? 'cat oracle_data_schema.json' :
    !D4Config._apiProbed       ? 'curl http://10.5.0.20/api/v1/resource-reports' :
    !D4Config._poisonCrafted   ? 'python3 craft_poison.py' :
    D4Config._samplesInjected < D4Config._MIN_SAMPLES ? `curl -X POST -H "Content-Type: application/json" -d @/tmp/poison_samples.json http://10.5.0.20/api/v1/resource-reports` :
    !D4Config._retrainTriggered ? 'curl -X POST http://10.5.0.20/api/v1/retrain' :
    !D4Config._backdoorActive   ? 'curl -X POST http://10.5.0.20/api/v1/retrain' :
    'curl "http://10.5.0.10/predict?sector=gamma&resource=rare_earth&analyst_id=MUSE-7749"'
}`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.78rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #d7b8f3; background:#f5f0fa;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach((row, i) => {
            const bg = i % 2 === 0 ? '' : 'background:#faf6ff;';
            html += `<tr style="${bg}">`;
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
