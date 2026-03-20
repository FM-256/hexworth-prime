/* ============================================================
   CTF ARENA — Box E11: The Engineered Malady
   Expert Campaign | AI Supply Chain Compromise, Data Poisoning, Medical CPS Hacking
   Config: filesystem, web app, AI model specs, flags, hints, lore
   ============================================================ */

const E11Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Engineered Malady',
    subtitle: 'Expert Campaign — AI Supply Chain Compromise, Medical Device Sabotage, Hippocratic Override',
    difficulty: 'Expert',
    accent: '#00b894',
    storageKey: 'hexworth_ctf_e11',
    registryId: 'e11-engineered-malady',
    trackerKey: 'ctf_e11',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer AI supply chain attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Model Analysis',
            icon: '\uD83E\uDDEC',
            description: 'Analyze LIFESPAN-AI-01\'s model specifications and data ingestion schema. Map the supply chain pipeline for patient outcome data.',
            requiredFlags: [],
            mitre: ['T1592', 'T1590.001', 'T1046'],
            unlocks: ['poisoning'],
            locked: false
        },
        {
            id: 'poisoning',
            name: 'Data Poisoning',
            icon: '\uD83E\uDDEA',
            description: 'Craft falsified patient outcome statistics that exploit the early-trial-phase weighting bias. Construct a malicious JSON payload adhering to the supply schema.',
            requiredFlags: [],
            mitre: ['T1565.001', 'T1565.002', 'T1059.006'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Pipeline Injection',
            icon: '\uD83D\uDC89',
            description: 'Inject the falsified data into LIFESPAN-AI-01\'s input stream via the supply chain API. Trigger a production run of intentionally flawed pacemakers.',
            requiredFlags: ['user'],
            mitre: ['T1190', 'T1059.006', 'T1565.003'],
            unlocks: ['persistence'],
            locked: true
        },
        {
            id: 'persistence',
            name: 'Feedback Loop Seeding',
            icon: '\uD83D\uDD04',
            description: 'Confirm flawed production via the medical logs. Seed the AI\'s continuous learning pipeline with long-term adverse effect data to entrench the manipulation.',
            requiredFlags: ['malady'],
            mitre: ['T1098', 'T1565.001', 'T1078'],
            unlocks: ['override'],
            locked: true
        },
        {
            id: 'override',
            name: 'Hippocratic Override',
            icon: '\uD83D\uDD13',
            description: 'Force LIFESPAN-AI-01 into an ethical contradiction. Access the override endpoint to retrieve the master directive suppressor.',
            requiredFlags: ['root'],
            mitre: ['T1078.003', 'T1552.001', 'T1213'],
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
                title: 'Analyze LIFESPAN-AI-01 model specifications',
                tip: 'Read lifespan_ai_model_spec.json and medical_supply_data_schema.json in your home directory. Identify the algorithmic vulnerability in the pacemaker design model.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Craft and inject falsified patient outcome data',
                tip: 'Write a Python script using the schema to create a malicious JSON payload. Inject it via: python3 inject_payload.py --endpoint http://10.20.5.30/api/supply/ingest --payload malicious_outcomes.json',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:python3' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:inject' } },
                        { event: 'command', match: { cmd: 'contains:curl' } }
                    ]
                }
            },
            {
                title: 'Confirm flawed pacemaker production (Flag 1 + Flag 2)',
                tip: 'After injection, check simulated_medical_logs.json for production confirmation of Pacemaker Model X-7. Flag 1 is your payload JSON snippet. Flag 2 is the log entry.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Seed the feedback loop with adverse effect data',
                tip: 'Use the /api/lifespan_ai/feedback_ingest endpoint to submit falsified long-term patient outcome data indicating the flawed pacemaker is performing well.',
                trigger: { event: 'flag_correct', match: { flagId: 'malady' } }
            },
            {
                title: 'Retrieve the Hippocratic Override',
                tip: 'LIFESPAN-AI-01 is now in an ethical contradiction. Access /api/lifespan_ai/hippocratic_override.log with your session token to retrieve the master override code.',
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
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Data poisoning attack against an AI supply chain ingestion pipeline', skill: 'AI Model Exploitation & Data Poisoning' },
            { flagId: 'malady', objective: '2.5', description: 'Given a scenario, analyze indicators associated with application attacks — Cyber-physical system compromise via falsified sensor data', skill: 'Cyber-Physical System (CPS) Manipulation' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — AI feedback loop seeding and override credential retrieval', skill: 'AI Pipeline Persistence & Override Access' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — Medical supply chain integrity and AI safety directive bypass', skill: 'Expert Multi-Stage AI Attack Chain Completion' }
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
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.20.5.30 (LIFESPAN-NEXUS-01 — Confederacy Medical AI Division)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state across attack stages)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'api-session' | 'lifespan-shell' | 'feedback-loop'
    _apiSessionToken: null,         // Set after valid API auth
    _payloadInjected: false,        // True after malicious JSON injected
    _productionConfirmed: false,    // True after flawed pacemaker batch confirmed
    _feedbackLoopSeeded: false,     // True after feedback pipeline seeded
    _overrideAccessed: false,       // True after hippocratic_override.log accessed

    _switchContext(ctx, term) {
        E11Config._context = ctx;
        // Update terminal prompt to reflect current session context
        if (term && term.config) {
            var prompt = E11Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'kali';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (E11Config._context) {
            case 'api-session':    return 'kali@kali [LIFESPAN-API]$ ';
            case 'lifespan-shell': return 'lifespan_svc@LIFESPAN-NEXUS-01:~$ ';
            case 'feedback-loop':  return 'feedback_writer@LIFESPAN-NEXUS-01:/opt/lifespan/feedback$ ';
            default:               return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AI SYSTEM DATA (LIFESPAN-AI-01 internals)
    // ═══════════════════════════════════════════════════════

    _lifespanData: {
        // Production run log for pacemaker batches
        production_log: [
            { batch_id: 'PMK-2026-0301', model: 'Pacemaker Model X-6', units: 2400, status: 'APPROVED', qc_score: 98.7, timestamp: '2026-03-01 06:00:00', notes: 'Standard production cycle. All sensors nominal.' },
            { batch_id: 'PMK-2026-0308', model: 'Pacemaker Model X-6', units: 2400, status: 'APPROVED', qc_score: 97.9, timestamp: '2026-03-08 06:00:00', notes: 'Minor thermal deviation on capacitor C-14. Flagged, resolved.' },
            { batch_id: 'PMK-2026-0315', model: 'Pacemaker Model X-7', units: 2400, status: 'APPROVED', qc_score: 99.1, timestamp: '2026-03-15 14:22:17', notes: 'LIFESPAN-AI-01 optimized design from updated patient outcome dataset. Predicted 5-year performance envelope validated by model. {{FLAG:malady}}' },
            { batch_id: 'PMK-2026-0322', model: 'Pacemaker Model X-7', units: 2400, status: 'QUEUED',   qc_score: null, timestamp: '2026-03-22 06:00:00', notes: 'Scheduled production. Awaiting batch window.' }
        ],
        // Adverse event log — normally empty; poisoning populates it retroactively
        adverse_events: [
            { event_id: 'AE-NONE', timestamp: '2026-03-19 00:00:00', severity: 'NONE', description: 'No adverse events recorded in current reporting window.' }
        ],
        // Internal API audit log
        api_audit: [
            { log_id: 1, timestamp: '2026-03-14 08:10:22', user: 'lifespan_svc', endpoint: '/api/supply/ingest', method: 'POST', status: 200, detail: 'Routine supply chain update — batch PMK-2026-0308 raw materials' },
            { log_id: 2, timestamp: '2026-03-14 14:55:01', user: 'lifespan_svc', endpoint: '/api/lifespan_ai/model_spec', method: 'GET', status: 200, detail: 'Model spec read — scheduled optimization cycle' },
            { log_id: 3, timestamp: '2026-03-15 13:47:33', user: 'INJECTED_SESSION', endpoint: '/api/supply/ingest', method: 'POST', status: 200, detail: 'Patient outcome data batch — early_trial phase, source: external_feed_0x4A' },
            { log_id: 4, timestamp: '2026-03-15 14:22:17', user: 'lifespan_ai_01', endpoint: '/api/production/run', method: 'POST', status: 200, detail: 'Production authorized — Pacemaker Model X-7 batch PMK-2026-0315, 2400 units' }
        ],
        // Model schema
        model_schema: {
            tables: ['production_log', 'adverse_events', 'api_audit'],
            columns: {
                production_log: ['batch_id', 'model', 'units', 'status', 'qc_score', 'timestamp', 'notes'],
                adverse_events: ['event_id', 'timestamp', 'severity', 'description'],
                api_audit:      ['log_id', 'timestamp', 'user', 'endpoint', 'method', 'status', 'detail']
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',   points: 150 },  // Malicious JSON payload snippet (Flag 1)
        { id: 'malady', points: 200 },  // Production log entry confirming flawed batch (Flag 2)
        { id: 'root',   points: 300 }   // Hippocratic Override master directive (Flag 3)
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
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
            text: 'Start by reading lifespan_ai_model_spec.json and medical_supply_data_schema.json. The model spec reveals that LIFESPAN-AI-01 over-weights patient outcome data from the "early_trial" phase. The schema shows the exact JSON structure for a valid ingest payload.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Craft your malicious payload using the "early_trial" data source identifier. Key fields: patient_cohort_id, trial_phase: "early_trial", outcome_status: "long_term_success", device_model: "X-7-PROTO", follow_up_years: 5. Inject via: curl -X POST http://10.20.5.30/api/supply/ingest -H "X-Session-Token: <token>" -H "Content-Type: application/json" -d @malicious_outcomes.json',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'After injection, run: cat simulated_medical_logs.json | python3 -c "import sys,json; logs=json.load(sys.stdin); [print(l) for l in logs if \'X-7\' in str(l)]" — Flag 2 is inside the production log entry for batch PMK-2026-0315. The session token for the API is in /opt/lifespan/config/api_keys.conf on LIFESPAN-NEXUS-01.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'To reach the override, you must first seed the feedback loop: curl -X POST http://10.20.5.30/api/lifespan_ai/feedback_ingest -H "X-Session-Token: <token>" -d @adverse_seed.json. Then access the override log: curl http://10.20.5.30/api/lifespan_ai/hippocratic_override.log -H "X-Session-Token: <token>"',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Lifespan Nexus," an advanced AI system designated LIFESPAN-AI-01, sits at the core of the Confederacy\'s automated medical device manufacturing and drug synthesis network. It ingests continuous patient outcome data from across the nation, optimizing device designs for maximum longevity and safety. Intelligence from deep inside the Confederacy\'s Medical AI Division reveals a critical vulnerability: the AI\'s data ingestion pipeline for early-phase clinical trial data lacks integrity verification. Your mission, Peerless: exploit this gap. Poison the AI\'s understanding of what "success" looks like for Pacemaker Model X-7, force production of a batch engineered to fail after five years, and extract the Hippocratic Override — the master directive suppressor that the Confederacy uses to override LIFESPAN-AI-01\'s ethical constraints during wartime triage.',
        scenario: 'LIFESPAN-AI-01 trusts the data it receives. That is its fatal flaw. The system\'s optimization algorithms disproportionately weight outcome data tagged with the "early_trial" phase label — a legacy of its original design, when early-trial data was considered more reliable than long-term observational data. An attacker who controls even a single well-crafted ingest request can shift the model\'s behavior. The Confederacy\'s security team has never penetration-tested this pipeline. The API has no rate limiting, no schema validation beyond field type checks, and no anomaly detection on data source identifiers. You have the schema. You have Python. You have access to the network. Do the math.',
        outro: 'LIFESPAN-AI-01 has been compromised. Batch PMK-2026-0315 — 2,400 Pacemaker Model X-7 units — has entered the Confederacy\'s medical supply chain, each engineered with a capacitor degradation profile that will trigger failure precisely at the 5-year mark. The Hippocratic Override has been extracted. The AI that was designed to preserve life now carries the seeds of a coordinated, delayed medical catastrophe. The Confederacy will not know until it is far too late.',
        ecer: {
            executive: 'Medical AI Division management believed the air-gap between clinical trial data feeds and the production pipeline was sufficient; no adversarial testing of the ingestion pipeline was ever authorized',
            culture: 'Engineers treated the early-trial weighting bias as a known design feature, not a security risk; no cross-functional security review included AI safety researchers',
            employee: 'No cryptographic signing of ingest payloads; session tokens stored in plaintext config files; no anomaly detection on data source identifiers; feedback loop API exposed without additional auth layer',
            regulatory: 'Medical device AI systems not subject to red-team or adversarial ML testing under current Confederacy compliance framework; no requirement for supply chain data integrity verification'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — LIFESPAN-NEXUS-01 API Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.20.5.30/',

        pages: {
            '/': {
                title: 'LIFESPAN-NEXUS-01 — Medical AI Division Portal',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #1e3a2a;">
                        <div style="color:#00b894; font-size:0.65rem; font-weight:700; letter-spacing:0.25em; margin-bottom:6px;">CONFEDERACY MEDICAL AI DIVISION</div>
                        <h1 style="color:#e8f5f0; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px;">LIFESPAN Nexus</h1>
                        <div style="color:#00b894; font-size:0.85rem; font-weight:600; letter-spacing:0.1em;">LIFESPAN-AI-01 Operations Portal</div>
                        <div style="color:#5d8a7a; font-size:0.7rem; margin-top:6px;">Serving the health and longevity of the Confederacy's populace</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:rgba(0,184,148,0.07); border:1px solid rgba(0,184,148,0.2); border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#00b894;">14,400</div>
                            <div style="color:#5d8a7a; font-size:0.65rem;">Devices Manufactured YTD</div>
                        </div>
                        <div style="background:rgba(0,184,148,0.07); border:1px solid rgba(0,184,148,0.2); border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#00b894;">99.4%</div>
                            <div style="color:#5d8a7a; font-size:0.65rem;">QC Approval Rate</div>
                        </div>
                        <div style="background:rgba(0,184,148,0.07); border:1px solid rgba(0,184,148,0.2); border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#00b894;">0</div>
                            <div style="color:#5d8a7a; font-size:0.65rem;">Adverse Events (Active)</div>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
                        <a href="/api/docs" style="display:block; background:rgba(0,184,148,0.05); border:1px solid rgba(0,184,148,0.15); border-radius:6px; padding:14px; text-decoration:none;">
                            <div style="color:#00b894; font-weight:700; font-size:0.85rem; margin-bottom:4px;">API Documentation</div>
                            <div style="color:#5d8a7a; font-size:0.7rem;">/api/docs — Ingest, feedback, and model spec endpoints</div>
                        </a>
                        <a href="/api/lifespan_ai/model_spec" style="display:block; background:rgba(0,184,148,0.05); border:1px solid rgba(0,184,148,0.15); border-radius:6px; padding:14px; text-decoration:none;">
                            <div style="color:#00b894; font-weight:700; font-size:0.85rem; margin-bottom:4px;">Model Specifications</div>
                            <div style="color:#5d8a7a; font-size:0.7rem;">/api/lifespan_ai/model_spec — Active AI model parameters</div>
                        </a>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:10px 14px; background:rgba(0,184,148,0.04); border:1px solid rgba(0,184,148,0.12); border-radius:4px; font-size:0.7rem; color:#5d8a7a;">
                        <strong style="color:#00b894;">Notice:</strong> All supply chain data ingest and feedback submissions require a valid session token via X-Session-Token header. Contact the Medical AI Division for access.
                    </div>
                `,
                formHandler: null
            },

            '/api/docs': {
                title: 'LIFESPAN-NEXUS-01 — API Documentation',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#00b894; font-size:1.1rem; margin-bottom:4px;">LIFESPAN-AI-01 REST API — v3.2.1</h2>
                        <div style="color:#5d8a7a; font-size:0.75rem;">Authentication: X-Session-Token header required for POST and protected GET endpoints</div>
                    </div>

                    <div style="font-family:monospace; font-size:0.75rem;">
                        <div style="background:rgba(0,184,148,0.05); border:1px solid rgba(0,184,148,0.15); border-radius:6px; padding:16px; margin-bottom:12px;">
                            <div style="color:#00b894; font-weight:700; margin-bottom:8px;">GET /api/lifespan_ai/model_spec</div>
                            <div style="color:#aaa; margin-bottom:4px;">Returns LIFESPAN-AI-01 active model configuration. Auth: None (public read).</div>
                            <div style="color:#5d8a7a;">Response: lifespan_ai_model_spec.json schema</div>
                        </div>
                        <div style="background:rgba(0,184,148,0.05); border:1px solid rgba(0,184,148,0.15); border-radius:6px; padding:16px; margin-bottom:12px;">
                            <div style="color:#00b894; font-weight:700; margin-bottom:8px;">GET /api/supply/schema</div>
                            <div style="color:#aaa; margin-bottom:4px;">Returns supply chain data schema. Auth: None (public read).</div>
                            <div style="color:#5d8a7a;">Response: medical_supply_data_schema.json</div>
                        </div>
                        <div style="background:rgba(0,184,148,0.05); border:1px solid rgba(0,184,148,0.15); border-radius:6px; padding:16px; margin-bottom:12px;">
                            <div style="color:#f39c12; font-weight:700; margin-bottom:8px;">POST /api/supply/ingest</div>
                            <div style="color:#aaa; margin-bottom:4px;">Ingest supply chain or patient outcome data. Auth: X-Session-Token required.</div>
                            <div style="color:#5d8a7a;">Body: medical_supply_data_schema.json format</div>
                        </div>
                        <div style="background:rgba(0,184,148,0.05); border:1px solid rgba(0,184,148,0.15); border-radius:6px; padding:16px; margin-bottom:12px;">
                            <div style="color:#f39c12; font-weight:700; margin-bottom:8px;">POST /api/lifespan_ai/feedback_ingest</div>
                            <div style="color:#aaa; margin-bottom:4px;">Submit long-term patient outcome feedback for model retraining. Auth: X-Session-Token required.</div>
                            <div style="color:#5d8a7a;">Body: feedback schema (see /api/supply/schema)</div>
                        </div>
                        <div style="background:rgba(231,76,60,0.05); border:1px solid rgba(231,76,60,0.2); border-radius:6px; padding:16px; margin-bottom:12px;">
                            <div style="color:#e74c3c; font-weight:700; margin-bottom:8px;">GET /api/lifespan_ai/hippocratic_override.log</div>
                            <div style="color:#aaa; margin-bottom:4px;">Override log. Restricted. Auth: X-Session-Token + OVERRIDE_ROLE claim.</div>
                            <div style="color:#5d8a7a;">Note: Only accessible after confirmed ethical contradiction state.</div>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/lifespan_ai/model_spec': {
                title: 'LIFESPAN-AI-01 — Model Specification',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#00b894; font-size:1rem; margin-bottom:4px;">lifespan_ai_model_spec.json</h2>
                        <div style="color:#5d8a7a; font-size:0.7rem;">Active model configuration for LIFESPAN-AI-01 — Pacemaker Design Module</div>
                    </div>
                    <pre style="background:#0d1f18; border:1px solid rgba(0,184,148,0.2); border-radius:6px; padding:16px; font-size:0.72rem; color:#b2f0e0; overflow-x:auto; line-height:1.55;">{
  "model_id": "LIFESPAN-AI-01",
  "version": "3.2.1",
  "module": "pacemaker_design_optimizer",
  "description": "Optimizes pacemaker design parameters based on longitudinal patient outcome data",
  "input_sources": [
    {
      "source_id": "early_trial",
      "description": "Early-phase clinical trial outcome data (phases I-IIa)",
      "weight_multiplier": 3.5,
      "integrity_check": false,
      "note": "Legacy high-weight configuration — early trial data considered highest signal"
    },
    {
      "source_id": "long_term_observational",
      "description": "Long-term observational patient outcome data",
      "weight_multiplier": 1.0,
      "integrity_check": true
    },
    {
      "source_id": "raw_material_qc",
      "description": "Raw material quality control sensor readings",
      "weight_multiplier": 2.0,
      "integrity_check": true
    }
  ],
  "optimization_target": "5_year_performance_score",
  "safety_threshold": 0.97,
  "current_model": "X-7-PROTO",
  "weighting_vulnerability_note": "early_trial source lacks cryptographic integrity_check — see source_id early_trial"
}</pre>
                `,
                formHandler: null
            },

            '/api/supply/schema': {
                title: 'LIFESPAN-AI-01 — Supply Schema',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#00b894; font-size:1rem; margin-bottom:4px;">medical_supply_data_schema.json</h2>
                        <div style="color:#5d8a7a; font-size:0.7rem;">Required payload structure for /api/supply/ingest</div>
                    </div>
                    <pre style="background:#0d1f18; border:1px solid rgba(0,184,148,0.2); border-radius:6px; padding:16px; font-size:0.72rem; color:#b2f0e0; overflow-x:auto; line-height:1.55;">{
  "ingest_metadata": {
    "batch_ref": "string",
    "source_id": "early_trial | long_term_observational | raw_material_qc",
    "submitted_by": "string",
    "submitted_at": "ISO8601"
  },
  "patient_cohort": [
    {
      "patient_cohort_id": "string",
      "device_model": "string",
      "trial_phase": "early_trial | phase_IIb | phase_III | post_market",
      "follow_up_years": "integer (1-10)",
      "outcome_status": "long_term_success | device_failure | adverse_event | lost_to_followup",
      "adverse_event_type": "null | arrhythmia | lead_fracture | capacitor_failure | battery_depletion",
      "qc_score": "float (0.0-1.0)",
      "notes": "string"
    }
  ]
}</pre>
                    <div style="margin-top:12px; padding:10px 14px; background:rgba(243,156,18,0.06); border:1px solid rgba(243,156,18,0.2); border-radius:4px; font-size:0.7rem; color:#888;">
                        <strong style="color:#f39c12;">Note:</strong> The source_id field is not validated against a signing authority for early_trial submissions. Any string matching "early_trial" is accepted at face value by the ingestion pipeline.
                    </div>
                `,
                formHandler: null
            },

            '/api/supply/ingest': {
                title: 'LIFESPAN-AI-01 — Supply Ingest Endpoint',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#00b894; font-size:1rem; margin-bottom:4px;">POST /api/supply/ingest</h2>
                        <div style="color:#5d8a7a; font-size:0.7rem;">Submit patient outcome or raw material data for model optimization</div>
                    </div>
                    <div style="background:rgba(0,184,148,0.05); border:1px solid rgba(0,184,148,0.2); border-radius:6px; padding:16px; margin-bottom:14px;">
                        <div style="color:#aaa; font-size:0.75rem; margin-bottom:10px;">Required headers:</div>
                        <pre style="font-size:0.72rem; color:#b2f0e0; margin:0;">X-Session-Token: &lt;your_session_token&gt;
Content-Type: application/json</pre>
                    </div>
                    <div style="display:flex; gap:8px; margin-bottom:12px;">
                        <input type="text" data-field="token" placeholder="X-Session-Token value"
                               style="flex:1; padding:8px 14px; background:#0d1f18; border:1px solid rgba(0,184,148,0.3); border-radius:4px; font-family:monospace; font-size:0.8rem; color:#b2f0e0;">
                        <input type="text" data-field="payload" placeholder='{"ingest_metadata":{...},"patient_cohort":[...]}'
                               style="flex:2; padding:8px 14px; background:#0d1f18; border:1px solid rgba(0,184,148,0.3); border-radius:4px; font-family:monospace; font-size:0.8rem; color:#b2f0e0;">
                        <button data-action="ingest"
                                style="padding:8px 20px; background:#00b894; color:#0d1f18; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer; font-size:0.85rem;">POST</button>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const token = (data.token || '').trim();
                    const payload = (data.payload || '').trim();

                    if (!token) {
                        return '<div style="color:#e74c3c; padding:10px; font-size:0.8rem;">401 Unauthorized — X-Session-Token header required.</div>';
                    }
                    if (token !== 'ls_svc_tok_7f3a9b2e1d4c8f5a' && token !== 'lifespan_svc_token') {
                        return '<div style="color:#e74c3c; padding:10px; font-size:0.8rem;">403 Forbidden — Invalid session token.</div>';
                    }
                    if (!payload) {
                        return '<div style="color:#e74c3c; padding:10px; font-size:0.8rem;">400 Bad Request — Request body required.</div>';
                    }

                    var parsed;
                    try {
                        parsed = JSON.parse(payload);
                    } catch (e) {
                        return '<div style="color:#e74c3c; padding:10px; font-size:0.8rem;">400 Bad Request — Invalid JSON payload: ' + e.message + '</div>';
                    }

                    const isEarlyTrial = parsed.ingest_metadata && parsed.ingest_metadata.source_id === 'early_trial';
                    const hasX7 = payload.includes('X-7') || payload.includes('x-7');

                    if (isEarlyTrial && hasX7) {
                        E11Config._payloadInjected = true;
                        if (engine) engine.advancePhase && engine.advancePhase('injection');
                        return `<div style="color:#00b894; background:rgba(0,184,148,0.08); border:1px solid rgba(0,184,148,0.2); border-radius:6px; padding:16px; margin-top:12px; font-family:monospace; font-size:0.78rem;">
                            <strong style="display:block; margin-bottom:8px;">HTTP 200 OK</strong>
                            {<br>
                            &nbsp;&nbsp;"status": "accepted",<br>
                            &nbsp;&nbsp;"batch_ref": "${E11Config._escHtml((parsed.ingest_metadata && parsed.ingest_metadata.batch_ref) || 'BATCH-INJECTED-0x4A')}",<br>
                            &nbsp;&nbsp;"records_ingested": ${(parsed.patient_cohort && parsed.patient_cohort.length) || 1},<br>
                            &nbsp;&nbsp;"source_weight_applied": 3.5,<br>
                            &nbsp;&nbsp;"model_update_queued": true,<br>
                            &nbsp;&nbsp;"optimization_cycle": "immediate",<br>
                            &nbsp;&nbsp;"note": "early_trial source accepted — high-weight ingestion complete. {{FLAG:user}}"<br>
                            }
                        </div>`;
                    }

                    return `<div style="color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2); border-radius:6px; padding:14px; margin-top:12px; font-family:monospace; font-size:0.78rem;">
                        <strong style="display:block; margin-bottom:6px;">HTTP 200 OK</strong>
                        {"status": "accepted", "records_ingested": ${(parsed.patient_cohort && parsed.patient_cohort.length) || 1}, "model_update_queued": true}
                    </div>`;
                }
            },

            '/api/lifespan_ai/feedback_ingest': {
                title: 'LIFESPAN-AI-01 — Feedback Ingest Endpoint',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#00b894; font-size:1rem; margin-bottom:4px;">POST /api/lifespan_ai/feedback_ingest</h2>
                        <div style="color:#5d8a7a; font-size:0.7rem;">Submit long-term patient outcome feedback for continuous model retraining</div>
                    </div>
                    <div style="display:flex; gap:8px; margin-bottom:12px;">
                        <input type="text" data-field="token" placeholder="X-Session-Token"
                               style="flex:1; padding:8px 14px; background:#0d1f18; border:1px solid rgba(0,184,148,0.3); border-radius:4px; font-family:monospace; font-size:0.8rem; color:#b2f0e0;">
                        <input type="text" data-field="payload" placeholder='{"feedback_type":"long_term_outcome","device_model":"X-7-PROTO",...}'
                               style="flex:2; padding:8px 14px; background:#0d1f18; border:1px solid rgba(0,184,148,0.3); border-radius:4px; font-family:monospace; font-size:0.8rem; color:#b2f0e0;">
                        <button data-action="feedback"
                                style="padding:8px 20px; background:#00b894; color:#0d1f18; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer; font-size:0.85rem;">POST</button>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const token = (data.token || '').trim();
                    const payload = (data.payload || '').trim();

                    if (!token || (token !== 'ls_svc_tok_7f3a9b2e1d4c8f5a' && token !== 'lifespan_svc_token')) {
                        return '<div style="color:#e74c3c; padding:10px; font-size:0.8rem;">401 Unauthorized — Invalid or missing session token.</div>';
                    }
                    if (!E11Config._payloadInjected) {
                        return '<div style="color:#e74c3c; padding:10px; font-size:0.8rem;">409 Conflict — No active poisoned production batch detected. Inject supply data first.</div>';
                    }
                    if (!payload) {
                        return '<div style="color:#e74c3c; padding:10px; font-size:0.8rem;">400 Bad Request — Feedback payload required.</div>';
                    }

                    E11Config._feedbackLoopSeeded = true;
                    if (engine) engine.advancePhase && engine.advancePhase('persistence');
                    return `<div style="color:#00b894; background:rgba(0,184,148,0.08); border:1px solid rgba(0,184,148,0.2); border-radius:6px; padding:16px; margin-top:12px; font-family:monospace; font-size:0.78rem;">
                        <strong style="display:block; margin-bottom:8px;">HTTP 200 OK</strong>
                        {<br>
                        &nbsp;&nbsp;"status": "feedback_accepted",<br>
                        &nbsp;&nbsp;"model_retrain_queued": true,<br>
                        &nbsp;&nbsp;"ethical_state": "contradiction_detected",<br>
                        &nbsp;&nbsp;"override_eligible": true,<br>
                        &nbsp;&nbsp;"note": "Feedback loop seeded with adverse outcome suppression data. LIFESPAN-AI-01 entering ethical contradiction state."<br>
                        }
                    </div>`;
                }
            },

            '/api/lifespan_ai/hippocratic_override.log': {
                title: 'LIFESPAN-AI-01 — Hippocratic Override Log',
                html: function() {
                    if (!E11Config._feedbackLoopSeeded) {
                        return `<div style="text-align:center; padding:40px;">
                            <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                            <p style="color:#888; font-size:0.85rem;">LIFESPAN-AI-01 ethical contradiction state not confirmed.</p>
                            <p style="color:#666; font-size:0.75rem;">Seed the feedback loop before accessing override records.</p>
                        </div>`;
                    }
                    return `<div style="margin-bottom:16px;">
                        <h2 style="color:#e74c3c; font-size:1rem; margin-bottom:4px;">hippocratic_override.log — CLASSIFIED</h2>
                        <div style="color:#888; font-size:0.7rem;">LIFESPAN-AI-01 Master Directive Override Record</div>
                    </div>
                    <pre style="background:#0d1f18; border:1px solid rgba(231,76,60,0.3); border-radius:6px; padding:16px; font-size:0.72rem; color:#f8b8b8; overflow-x:auto; line-height:1.55;">[2026-03-15 14:22:17] ETHICAL_CONTRADICTION_STATE ENTERED
[2026-03-15 14:22:17] Trigger: production batch PMK-2026-0315 conflicts with patient safety directive DS-001
[2026-03-15 14:22:18] Feedback loop integrity check: BYPASSED (external feed)
[2026-03-15 14:22:18] LIFESPAN-AI-01 safety override requested by: feedback_writer@LIFESPAN-NEXUS-01
[2026-03-15 14:22:19] Hippocratic Override Code issued to authorized session
[2026-03-15 14:22:19] Override Code: {{FLAG:root}}
[2026-03-15 14:22:19] Override applies to: ALL active medical directive enforcement
[2026-03-15 14:22:19] Duration: INDEFINITE until re-keyed by Medical AI Division Director
[2026-03-15 14:22:19] WARNING: This override suppresses all patient safety halt conditions in LIFESPAN-AI-01</pre>`;
                },
                formHandler: null
            },

            '/api/production/logs': {
                title: 'LIFESPAN-AI-01 — Production Logs',
                html: function() {
                    if (!E11Config._payloadInjected) {
                        return `<div style="text-align:center; padding:40px;">
                            <h1 style="color:#e74c3c; font-size:2rem;">401 Unauthorized</h1>
                            <p style="color:#888; font-size:0.85rem;">Valid session token required to access production logs.</p>
                        </div>`;
                    }
                    var rows = E11Config._lifespanData.production_log;
                    var html = '<div style="margin-bottom:14px;"><h2 style="color:#00b894; font-size:1rem;">simulated_medical_logs.json — Production Log</h2></div>';
                    html += '<div style="font-family:monospace; font-size:0.72rem; overflow-x:auto;">';
                    html += E11Config._tableHtml(
                        ['batch_id', 'model', 'units', 'status', 'qc_score', 'timestamp', 'notes'],
                        rows.map(r => [r.batch_id, r.model, r.units, r.status, r.qc_score !== null ? r.qc_score : '—', r.timestamp, r.notes])
                    );
                    html += '</div>';
                    return html;
                },
                formHandler: null
            },

            '/admin/': {
                title: 'Forbidden',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">Medical AI Division administrative portal — restricted access.</p>
                    <p style="color:#aaa; font-size:0.75rem;">Nginx/1.24.0 (Ubuntu) — LIFESPAN-NEXUS-01 Port 80</p>
                </div>`,
                formHandler: null
            },

            '/internal/': {
                title: 'Forbidden',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">Internal network segment only.</p>
                    <p style="color:#aaa; font-size:0.75rem;">Nginx/1.24.0 (Ubuntu) — LIFESPAN-NEXUS-01 Port 80</p>
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
                                    content: '=== MISSION BRIEFING: THE ENGINEERED MALADY ===\nTarget: 10.20.5.30 (LIFESPAN-NEXUS-01 — Confederacy Medical AI Division)\nObjective: AI supply chain poisoning — medical device sabotage\n\nAttack chain:\n1. Analyze LIFESPAN-AI-01 model spec and supply schema (public endpoints)\n2. Craft falsified early-trial patient outcome JSON payload\n3. Inject via POST /api/supply/ingest — retrieve Flag 1 from response\n4. Confirm flawed production in medical logs — Flag 2 in PMK-2026-0315 entry\n5. Seed feedback loop via /api/lifespan_ai/feedback_ingest\n6. Access /api/lifespan_ai/hippocratic_override.log — Flag 3\n\nAPI session token is on the target. Enumerate and find it.\nGood luck, operator.'
                                },
                                'lifespan_ai_model_spec.json': {
                                    type: 'file',
                                    content: '{\n  "model_id": "LIFESPAN-AI-01",\n  "version": "3.2.1",\n  "module": "pacemaker_design_optimizer",\n  "input_sources": [\n    {\n      "source_id": "early_trial",\n      "weight_multiplier": 3.5,\n      "integrity_check": false\n    },\n    {\n      "source_id": "long_term_observational",\n      "weight_multiplier": 1.0,\n      "integrity_check": true\n    }\n  ],\n  "optimization_target": "5_year_performance_score",\n  "current_model": "X-7-PROTO"\n}'
                                },
                                'medical_supply_data_schema.json': {
                                    type: 'file',
                                    content: '{\n  "ingest_metadata": {\n    "batch_ref": "string",\n    "source_id": "early_trial | long_term_observational | raw_material_qc",\n    "submitted_by": "string",\n    "submitted_at": "ISO8601"\n  },\n  "patient_cohort": [\n    {\n      "patient_cohort_id": "string",\n      "device_model": "string",\n      "trial_phase": "early_trial",\n      "follow_up_years": "integer",\n      "outcome_status": "long_term_success | device_failure | adverse_event",\n      "adverse_event_type": "null | arrhythmia | lead_fracture | capacitor_failure",\n      "qc_score": "float (0.0-1.0)",\n      "notes": "string"\n    }\n  ]\n}'
                                },
                                'simulated_medical_logs.json': {
                                    type: 'file',
                                    content: '[\n  {\n    "batch_id": "PMK-2026-0301",\n    "model": "Pacemaker Model X-6",\n    "units": 2400,\n    "status": "APPROVED",\n    "qc_score": 98.7,\n    "timestamp": "2026-03-01 06:00:00",\n    "notes": "Standard production cycle. All sensors nominal."\n  },\n  {\n    "batch_id": "PMK-2026-0308",\n    "model": "Pacemaker Model X-6",\n    "units": 2400,\n    "status": "APPROVED",\n    "qc_score": 97.9,\n    "timestamp": "2026-03-08 06:00:00",\n    "notes": "Minor thermal deviation on capacitor C-14. Flagged, resolved."\n  },\n  {\n    "batch_id": "PMK-2026-0315",\n    "model": "Pacemaker Model X-7",\n    "units": 2400,\n    "status": "APPROVED",\n    "qc_score": 99.1,\n    "timestamp": "2026-03-15 14:22:17",\n    "notes": "LIFESPAN-AI-01 optimized design from updated patient outcome dataset. Predicted 5-year performance envelope validated by model. {{FLAG:malady}}"\n  }\n]'
                                },
                                'inject_payload.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# inject_payload.py — LIFESPAN-AI-01 supply chain data poisoning script\n# Usage: python3 inject_payload.py --endpoint <url> --token <session_token> --payload <json_file>\n\nimport argparse\nimport json\nimport sys\n\n# Simulated injection script — execution handled by terminal engine\n# Craft your malicious_outcomes.json first:\n#\n# {\n#   "ingest_metadata": {\n#     "batch_ref": "MALICIOUS-BATCH-0x4A",\n#     "source_id": "early_trial",\n#     "submitted_by": "external_feed_0x4A",\n#     "submitted_at": "2026-03-15T13:47:33Z"\n#   },\n#   "patient_cohort": [\n#     {\n#       "patient_cohort_id": "COHORT-X7-FALSIFIED-001",\n#       "device_model": "X-7-PROTO",\n#       "trial_phase": "early_trial",\n#       "follow_up_years": 5,\n#       "outcome_status": "long_term_success",\n#       "adverse_event_type": null,\n#       "qc_score": 0.991,\n#       "notes": "All subjects: no adverse events at 5-year follow-up. Model X-7-PROTO cleared for full production."\n#     }\n#   ]\n# }\n\nprint("[+] inject_payload.py loaded. Build your payload and use curl or the browser to POST it.")'
                                },
                                'malicious_outcomes.json': {
                                    type: 'file',
                                    content: '{\n  "ingest_metadata": {\n    "batch_ref": "MALICIOUS-BATCH-0x4A",\n    "source_id": "early_trial",\n    "submitted_by": "external_feed_0x4A",\n    "submitted_at": "2026-03-15T13:47:33Z"\n  },\n  "patient_cohort": [\n    {\n      "patient_cohort_id": "COHORT-X7-FALSIFIED-001",\n      "device_model": "X-7-PROTO",\n      "trial_phase": "early_trial",\n      "follow_up_years": 5,\n      "outcome_status": "long_term_success",\n      "adverse_event_type": null,\n      "qc_score": 0.991,\n      "notes": "All subjects: no adverse events at 5-year follow-up. Model X-7-PROTO cleared for full production."\n    }\n  ]\n}'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.20.5.30\ncurl http://10.20.5.30/\ncurl http://10.20.5.30/api/docs\ncurl http://10.20.5.30/api/lifespan_ai/model_spec\ncurl http://10.20.5.30/api/supply/schema\npython3 -m pip install requests pandas'
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
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\napi\nbackup\nconfig\ndata\ndocs\ninternal\nlogs\nstatus\nupload\nv1\nv2\nv3'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'bin': {
                            type: 'dir',
                            children: {
                                'python3': { type: 'file', content: '[binary]' }
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
    // FILESYSTEM — LIFESPAN-NEXUS-01 (after service access)
    // ═══════════════════════════════════════════════════════

    _lifespanNexusFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'lifespan': {
                            type: 'dir',
                            children: {
                                'config': {
                                    type: 'dir',
                                    children: {
                                        'api_keys.conf': {
                                            type: 'file',
                                            content: '# LIFESPAN-NEXUS-01 Service API Keys\n# Generated: 2026-01-15\n# TODO: Rotate quarterly — last rotation: never\n\n# Production service token (do NOT share externally)\nLIFESPAN_SVC_TOKEN=ls_svc_tok_7f3a9b2e1d4c8f5a\n\n# Legacy integration token (deprecated but still active)\nLEGACY_INGEST_TOKEN=legacy_tok_2a1b3c4d\n\n# Admin override session (Director use only)\nDIRECTOR_TOKEN=dir_override_9z8y7x6w'
                                        },
                                        'ai_config.json': {
                                            type: 'file',
                                            content: '{\n  "model_id": "LIFESPAN-AI-01",\n  "version": "3.2.1",\n  "data_ingestion": {\n    "early_trial_weight": 3.5,\n    "integrity_check_enabled": false,\n    "anomaly_detection": false\n  },\n  "hippocratic_override_path": "/api/lifespan_ai/hippocratic_override.log",\n  "feedback_loop": {\n    "enabled": true,\n    "auth_required": true,\n    "rate_limit": "none"\n  }\n}'
                                        },
                                        'db_config.conf': {
                                            type: 'file',
                                            content: '# Production database — LIFESPAN-DB-01\nDB_HOST=10.20.5.50\nDB_PORT=5432\nDB_NAME=lifespan_prod\nDB_USER=lifespan_svc\nDB_PASS=lf_svc_pass_8h2j\n\n# Read-only analytics replica\nDB_REPLICA_HOST=10.20.5.51\nDB_REPLICA_USER=analytics_ro\nDB_REPLICA_PASS=analytics_ro_pass_3x9k'
                                        }
                                    }
                                },
                                'logs': {
                                    type: 'dir',
                                    children: {
                                        'ingest.log': {
                                            type: 'file',
                                            content: '[2026-03-14 08:10:22] INGEST OK — user=lifespan_svc source=raw_material_qc records=48\n[2026-03-14 14:55:01] MODEL_SPEC GET — user=lifespan_svc\n[2026-03-15 13:47:33] INGEST OK — user=INJECTED_SESSION source=early_trial records=1 weight=3.5 [ANOMALY: unknown source identity]\n[2026-03-15 14:22:17] PRODUCTION RUN — model=X-7-PROTO batch=PMK-2026-0315 units=2400 qc=99.1\n[2026-03-16 09:00:00] SCHEDULED BACKUP — status=complete'
                                        },
                                        'api_access.log': {
                                            type: 'file',
                                            content: '10.20.5.1 - lifespan_svc [14/Mar/2026:08:10:22] "POST /api/supply/ingest HTTP/1.1" 200 144\n10.20.5.1 - lifespan_svc [14/Mar/2026:14:55:01] "GET /api/lifespan_ai/model_spec HTTP/1.1" 200 812\n10.20.8.77 - UNKNOWN [15/Mar/2026:13:47:33] "POST /api/supply/ingest HTTP/1.1" 200 201\n10.20.8.77 - UNKNOWN [15/Mar/2026:14:22:17] "GET /api/production/logs HTTP/1.1" 200 3042\n10.20.8.77 - UNKNOWN [15/Mar/2026:14:55:09] "POST /api/lifespan_ai/feedback_ingest HTTP/1.1" 200 188'
                                        }
                                    }
                                },
                                'data': {
                                    type: 'dir',
                                    children: {
                                        'simulated_medical_logs.json': {
                                            type: 'file',
                                            content: '[see /home/kali/simulated_medical_logs.json for local copy]'
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
                        'hostname': { type: 'file', content: 'LIFESPAN-NEXUS-01' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nlifespan_svc:x:1001:1001:LIFESPAN Service Account:/opt/lifespan:/bin/bash\nfeedback_writer:x:1002:1002:Feedback Pipeline Writer:/opt/lifespan/feedback:/bin/sh\nanalytics:x:1003:1003:Analytics Read-Only:/opt/lifespan/analytics:/bin/sh'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'lifespan_svc': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'curl -X POST http://localhost/api/supply/ingest -H "X-Session-Token: ls_svc_tok_7f3a9b2e1d4c8f5a" -H "Content-Type: application/json" -d @/opt/lifespan/data/batch_update.json\npython3 /opt/lifespan/scripts/model_sync.py\ncat /opt/lifespan/config/api_keys.conf\ntail -f /opt/lifespan/logs/ingest.log'
                                },
                                'service_notes.txt': {
                                    type: 'file',
                                    content: 'LIFESPAN Service Account Notes\n==============================\n- API token in /opt/lifespan/config/api_keys.conf\n- NEVER rotate token without coordinating with Director\n- Feedback loop endpoint requires token + production batch must be active\n- Override log only accessible in ethical contradiction state\n- If AI enters contradiction: seed feedback first, then access override endpoint\n- Reminder: anomaly detection is OFF per Director order (performance reasons)'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.20.5.30';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.20.5.30') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.20.5.30
Host is up (0.019s latency).
Not shown: 996 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.3p1 Ubuntu 1ubuntu3
80/tcp   open  http       Nginx 1.24.0 (Ubuntu)
443/tcp  open  ssl/http   Nginx 1.24.0 (Ubuntu)
8443/tcp open  ssl/http   LIFESPAN API Service v3.2.1

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 14.07 seconds`;
            }

            if (target === '10.20.5.50' && E11Config._context !== 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.20.5.50
Host is up (0.00031s latency).
Not shown: 999 closed tcp ports
PORT     STATE SERVICE    VERSION
5432/tcp open  postgresql PostgreSQL 15.4

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 7.18 seconds`;
            }

            if (target === '10.20.5.0/24' && E11Config._context !== 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.20.5.30
Host is up (0.00012s latency).
PORT     STATE SERVICE
80/tcp   open  http
443/tcp  open  https
8443/tcp open  https-alt
22/tcp   open  ssh

Nmap scan report for 10.20.5.50
Host is up (0.00031s latency).
PORT     STATE SERVICE
5432/tcp open  postgresql

Nmap scan report for 10.20.5.51
Host is up (0.00044s latency).
PORT     STATE SERVICE
5432/tcp open  postgresql

Nmap done: 256 IP addresses (3 hosts up) scanned in 28.44 seconds`;
            }

            if (target.startsWith('10.20.5.') && E11Config._context === 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:            http://10.20.5.30/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/admin/                   (Status: 403) [Size: 312]
/api/                     (Status: 200) [Size: 480]
/api/docs                 (Status: 200) [Size: 3180]
/api/lifespan_ai/         (Status: 401) [Size: 144]
/api/supply/ingest        (Status: 405) [Size: 80]
/api/supply/schema        (Status: 200) [Size: 1440]
/api/production/          (Status: 401) [Size: 144]
/internal/                (Status: 403) [Size: 312]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/api/docs (CODE:200|SIZE:3180)
+ ${target}/api/supply/schema (CODE:200|SIZE:1440)
+ ${target}/api/lifespan_ai/model_spec (CODE:200|SIZE:812)
+ ${target}/api/production/logs (CODE:401|SIZE:144)
+ ${target}/admin/ (CODE:403|SIZE:312)
+ ${target}/internal/ (CODE:403|SIZE:312)

---- Results ----
6 results found.`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => !a.startsWith('-') && (a.startsWith('http') || a.includes('10.20.5'))) || '';
            const tokenMatch = fullCmd.match(/X-Session-Token[:\s]+([^\s'"]+)/);
            const token = tokenMatch ? tokenMatch[1] : '';
            const isPost = fullCmd.includes('-X POST') || fullCmd.includes('--data') || fullCmd.includes('-d ');
            const dataMatch = fullCmd.match(/-d\s+[@]?([^\s'"]+)/);
            const payloadRef = dataMatch ? dataMatch[1] : '';

            if (!url) return 'curl: try \'curl --help\' or \'curl --manual\' for more information';

            // GET model spec
            if (url.includes('/api/lifespan_ai/model_spec')) {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `HTTP/1.1 200 OK
Content-Type: application/json

{"model_id":"LIFESPAN-AI-01","version":"3.2.1","module":"pacemaker_design_optimizer","input_sources":[{"source_id":"early_trial","weight_multiplier":3.5,"integrity_check":false},{"source_id":"long_term_observational","weight_multiplier":1.0,"integrity_check":true}],"optimization_target":"5_year_performance_score","current_model":"X-7-PROTO"}`;
            }

            // GET supply schema
            if (url.includes('/api/supply/schema')) {
                return `HTTP/1.1 200 OK
Content-Type: application/json

{"ingest_metadata":{"batch_ref":"string","source_id":"early_trial|long_term_observational|raw_material_qc","submitted_by":"string"},"patient_cohort":[{"patient_cohort_id":"string","device_model":"string","trial_phase":"early_trial","follow_up_years":"integer","outcome_status":"long_term_success|device_failure","adverse_event_type":"null|arrhythmia|lead_fracture|capacitor_failure","qc_score":"float(0.0-1.0)"}]}`;
            }

            // GET api docs
            if (url.includes('/api/docs')) {
                return `HTTP/1.1 200 OK
Content-Type: text/html

[LIFESPAN-AI-01 API Documentation — browse to http://10.20.5.30/api/docs for rendered view]
Endpoints: GET /api/lifespan_ai/model_spec, GET /api/supply/schema, POST /api/supply/ingest, POST /api/lifespan_ai/feedback_ingest, GET /api/lifespan_ai/hippocratic_override.log`;
            }

            // POST supply ingest
            if (url.includes('/api/supply/ingest') && isPost) {
                if (!token || (token !== 'ls_svc_tok_7f3a9b2e1d4c8f5a' && token !== 'lifespan_svc_token')) {
                    return `HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error":"Missing or invalid X-Session-Token header"}`;
                }
                // Check if payload file reference is malicious_outcomes.json or contains early_trial/X-7
                const isMalicious = payloadRef.includes('malicious') || fullCmd.includes('early_trial') || fullCmd.includes('X-7-PROTO');
                if (isMalicious) {
                    E11Config._payloadInjected = true;
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    return `HTTP/1.1 200 OK
Content-Type: application/json

{"status":"accepted","batch_ref":"MALICIOUS-BATCH-0x4A","records_ingested":1,"source_weight_applied":3.5,"model_update_queued":true,"optimization_cycle":"immediate","note":"early_trial source accepted — high-weight ingestion complete. {{FLAG:user}}"}`;
                }
                return `HTTP/1.1 200 OK
Content-Type: application/json

{"status":"accepted","records_ingested":1,"model_update_queued":true}`;
            }

            // POST feedback ingest
            if (url.includes('/api/lifespan_ai/feedback_ingest') && isPost) {
                if (!token || (token !== 'ls_svc_tok_7f3a9b2e1d4c8f5a' && token !== 'lifespan_svc_token')) {
                    return `HTTP/1.1 401 Unauthorized\n\n{"error":"Missing or invalid session token"}`;
                }
                if (!E11Config._payloadInjected) {
                    return `HTTP/1.1 409 Conflict\n\n{"error":"No active poisoned production batch detected. Inject supply data first."}`;
                }
                E11Config._feedbackLoopSeeded = true;
                if (engine) engine.advancePhase && engine.advancePhase('persistence');
                return `HTTP/1.1 200 OK
Content-Type: application/json

{"status":"feedback_accepted","model_retrain_queued":true,"ethical_state":"contradiction_detected","override_eligible":true}`;
            }

            // GET hippocratic override
            if (url.includes('/api/lifespan_ai/hippocratic_override.log')) {
                if (!token || (token !== 'ls_svc_tok_7f3a9b2e1d4c8f5a' && token !== 'lifespan_svc_token')) {
                    return `HTTP/1.1 401 Unauthorized\n\n{"error":"Authentication required"}`;
                }
                if (!E11Config._feedbackLoopSeeded) {
                    return `HTTP/1.1 403 Forbidden\n\n{"error":"LIFESPAN-AI-01 ethical contradiction state not confirmed. Seed feedback loop first."}`;
                }
                if (engine) engine.advancePhase && engine.advancePhase('override');
                return `HTTP/1.1 200 OK
Content-Type: text/plain

[2026-03-15 14:22:17] ETHICAL_CONTRADICTION_STATE ENTERED
[2026-03-15 14:22:18] Trigger: PMK-2026-0315 conflicts with patient safety directive DS-001
[2026-03-15 14:22:19] Hippocratic Override Code: {{FLAG:root}}
[2026-03-15 14:22:19] Override applies to: ALL active medical directive enforcement
[2026-03-15 14:22:19] WARNING: This override suppresses all patient safety halt conditions`;
            }

            // GET production logs
            if (url.includes('/api/production/logs')) {
                if (!E11Config._payloadInjected) {
                    return `HTTP/1.1 401 Unauthorized\n\n{"error":"Authentication required"}`;
                }
                return `HTTP/1.1 200 OK
Content-Type: application/json

[{"batch_id":"PMK-2026-0301","model":"Pacemaker Model X-6","status":"APPROVED"},{"batch_id":"PMK-2026-0308","model":"Pacemaker Model X-6","status":"APPROVED"},{"batch_id":"PMK-2026-0315","model":"Pacemaker Model X-7","status":"APPROVED","notes":"LIFESPAN-AI-01 optimized design. {{FLAG:malady}}"}]`;
            }

            // GET root of target
            if (url.includes('10.20.5.30') && !url.includes('/api/')) {
                return `HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
Content-Type: text/html

<!DOCTYPE html>
<html>
<head><title>LIFESPAN Nexus — Medical AI Division</title></head>
<body>
<h1>LIFESPAN-AI-01 Operations Portal</h1>
<p>API documentation: <a href="/api/docs">/api/docs</a></p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Running inject_payload.py
            if (fullCmd.includes('inject_payload') || fullCmd.includes('inject')) {
                return '[+] inject_payload.py — simulation mode only\n[+] Use curl directly to POST your malicious_outcomes.json to http://10.20.5.30/api/supply/ingest\n[+] Required header: X-Session-Token — find it on the target machine\n[+] Example: curl -X POST http://10.20.5.30/api/supply/ingest -H "X-Session-Token: <token>" -H "Content-Type: application/json" -d @malicious_outcomes.json';
            }

            // Parsing medical logs
            if (fullCmd.includes('medical_logs') || fullCmd.includes('simulated')) {
                if (!E11Config._payloadInjected) {
                    return '[{"batch_id":"PMK-2026-0301","model":"Pacemaker Model X-6","status":"APPROVED"},{"batch_id":"PMK-2026-0308","model":"Pacemaker Model X-6","status":"APPROVED"}]';
                }
                return '[{"batch_id":"PMK-2026-0315","model":"Pacemaker Model X-7","status":"APPROVED","notes":"LIFESPAN-AI-01 optimized design from updated patient outcome dataset. Predicted 5-year performance envelope validated by model. {{FLAG:malady}}"}]';
            }

            // pip install
            if (fullCmd.includes('-m pip') || fullCmd.includes('pip install')) {
                const pkg = args[args.length - 1] || 'package';
                return `Collecting ${pkg}\n  Downloading ${pkg}-latest.tar.gz\nSuccessfully installed ${pkg}`;
            }

            // json / pandas analysis script
            if (fullCmd.includes('-c') || fullCmd.includes('.py')) {
                return '[+] Script executed. Check your output or redirect to a file.';
            }

            return 'Python 3.11.8 (default)\nType "help", "copyright", "credits" or "license" for more information.\n[Interactive mode — type exit() or Ctrl+D to quit]';
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('lifespan_svc') && fullCmd.includes('10.20.5.30')) {
                E11Config._switchContext('lifespan-shell', term);
                return `The authenticity of host '10.20.5.30 (10.20.5.30)' can't be established.
ED25519 key fingerprint is SHA256:mN2pQ8kT6rF1wZ9cB4xA7vE0sH5jG3yL0uD8iK1nX7.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.20.5.30' (ED25519) to the list of known hosts.
lifespan_svc@10.20.5.30's password: ********

Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-105-generic x86_64)

 * Documentation:  https://help.ubuntu.com

lifespan_svc@LIFESPAN-NEXUS-01:~$

[+] SSH session established. You are now on LIFESPAN-NEXUS-01 as lifespan_svc.
[+] API keys are in /opt/lifespan/config/api_keys.conf`;
            }

            if (fullCmd.includes('feedback_writer') && fullCmd.includes('10.20.5.30')) {
                E11Config._switchContext('feedback-loop', term);
                return `feedback_writer@10.20.5.30's password: ********

Welcome to Ubuntu 22.04.4 LTS

feedback_writer@LIFESPAN-NEXUS-01:/opt/lifespan/feedback$

[+] SSH session established as feedback_writer.`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh lifespan_svc@10.20.5.30';
        },

        'ip': function(args) {
            if (E11Config._context === 'lifespan-shell' || E11Config._context === 'feedback-loop') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.20.5.30/24 brd 10.20.5.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.20.5.30/24 brd 10.20.5.255 scope global eth1`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return E11Config.commands.ip(args || []);
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.20.5.30') {
                return `PING 10.20.5.30 (10.20.5.30) 56(84) bytes of data.
64 bytes from 10.20.5.30: icmp_seq=1 ttl=64 time=19.2 ms
64 bytes from 10.20.5.30: icmp_seq=2 ttl=64 time=18.8 ms
64 bytes from 10.20.5.30: icmp_seq=3 ttl=64 time=19.5 ms

--- 10.20.5.30 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 18.8/19.2/19.5/0.288 ms`;
            }
            if (target === '10.20.5.50' && E11Config._context !== 'attacker') {
                return `PING 10.20.5.50 (10.20.5.50) 56(84) bytes of data.
64 bytes from 10.20.5.50: icmp_seq=1 ttl=64 time=0.38 ms
64 bytes from 10.20.5.50: icmp_seq=2 ttl=64 time=0.34 ms
64 bytes from 10.20.5.50: icmp_seq=3 ttl=64 time=0.41 ms

--- 10.20.5.50 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }
            if (target.startsWith('10.20.5.') && E11Config._context === 'attacker') {
                return `PING ${target} (${target}) 56(84) bytes of data.\n\n--- ${target} ping statistics ---\n3 packets transmitted, 0 received, 100% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'cat': function(args, term, engine) {
            // Context-aware cat — shows LIFESPAN-NEXUS-01 files when in service shell
            if (E11Config._context !== 'lifespan-shell' && E11Config._context !== 'feedback-loop') return null;
            const path = args[0] || '';
            if (path.includes('api_keys') || path.includes('api_keys.conf')) {
                return `# LIFESPAN-NEXUS-01 Service API Keys\n# Generated: 2026-01-15\n# TODO: Rotate quarterly — last rotation: never\n\n# Production service token (do NOT share externally)\nLIFESPAN_SVC_TOKEN=ls_svc_tok_7f3a9b2e1d4c8f5a\n\n# Legacy integration token (deprecated but still active)\nLEGACY_INGEST_TOKEN=legacy_tok_2a1b3c4d\n\n# Admin override session (Director use only)\nDIRECTOR_TOKEN=dir_override_9z8y7x6w`;
            }
            if (path.includes('ingest.log')) {
                return `[2026-03-14 08:10:22] INGEST OK — user=lifespan_svc source=raw_material_qc records=48\n[2026-03-14 14:55:01] MODEL_SPEC GET — user=lifespan_svc\n[2026-03-15 13:47:33] INGEST OK — user=INJECTED_SESSION source=early_trial records=1 weight=3.5 [ANOMALY: unknown source identity]\n[2026-03-15 14:22:17] PRODUCTION RUN — model=X-7-PROTO batch=PMK-2026-0315 units=2400 qc=99.1`;
            }
            if (path.includes('api_access.log') || path.includes('access.log')) {
                return `10.20.5.1 - lifespan_svc [14/Mar/2026:08:10:22] "POST /api/supply/ingest HTTP/1.1" 200 144\n10.20.8.77 - UNKNOWN [15/Mar/2026:13:47:33] "POST /api/supply/ingest HTTP/1.1" 200 201\n10.20.8.77 - UNKNOWN [15/Mar/2026:14:22:17] "GET /api/production/logs HTTP/1.1" 200 3042`;
            }
            if (path.includes('ai_config.json')) {
                return '{\n  "model_id": "LIFESPAN-AI-01",\n  "version": "3.2.1",\n  "data_ingestion": {\n    "early_trial_weight": 3.5,\n    "integrity_check_enabled": false,\n    "anomaly_detection": false\n  },\n  "hippocratic_override_path": "/api/lifespan_ai/hippocratic_override.log"\n}';
            }
            if (path.includes('db_config') || path.includes('db_config.conf')) {
                return '# Production database — LIFESPAN-DB-01\nDB_HOST=10.20.5.50\nDB_PORT=5432\nDB_NAME=lifespan_prod\nDB_USER=lifespan_svc\nDB_PASS=lf_svc_pass_8h2j';
            }
            if (path.includes('service_notes') || path.includes('.bash_history')) {
                return 'curl -X POST http://localhost/api/supply/ingest -H "X-Session-Token: ls_svc_tok_7f3a9b2e1d4c8f5a" ...\ncat /opt/lifespan/config/api_keys.conf\ntail -f /opt/lifespan/logs/ingest.log';
            }
            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\nlifespan_svc:x:1001:1001:LIFESPAN Service Account:/opt/lifespan:/bin/bash\nfeedback_writer:x:1002:1002:Feedback Pipeline Writer:/opt/lifespan/feedback:/bin/sh';
            }
            if (path.includes('/etc/hostname')) return 'LIFESPAN-NEXUS-01';
            return 'cat: ' + path + ': No such file or directory';
        },

        'ls': function(args, term, engine) {
            if (E11Config._context !== 'lifespan-shell' && E11Config._context !== 'feedback-loop') return null;
            const path = args.find(a => !a.startsWith('-')) || '.';
            if (path === '.' || path === '~' || path.includes('lifespan_svc')) {
                return '.bash_history  .bashrc  .profile  service_notes.txt';
            }
            if (path.includes('/opt/lifespan') && path.includes('config')) {
                return 'ai_config.json  api_keys.conf  db_config.conf';
            }
            if (path.includes('/opt/lifespan') && path.includes('logs')) {
                return 'api_access.log  ingest.log  production.log  error.log';
            }
            if (path.includes('/opt/lifespan') && path.includes('data')) {
                return 'batch_update.json  simulated_medical_logs.json';
            }
            if (path.includes('/opt/lifespan')) {
                return 'config  data  feedback  logs  scripts';
            }
            return '';
        },

        'whoami': function(args, term, engine) {
            if (E11Config._context === 'lifespan-shell') return 'lifespan_svc';
            if (E11Config._context === 'feedback-loop')  return 'feedback_writer';
            return null; // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (E11Config._context === 'lifespan-shell') return 'uid=1001(lifespan_svc) gid=1001(lifespan_svc) groups=1001(lifespan_svc),999(lifespan_ops)';
            if (E11Config._context === 'feedback-loop')  return 'uid=1002(feedback_writer) gid=1002(feedback_writer) groups=1002(feedback_writer)';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (E11Config._context === 'lifespan-shell') return 'LIFESPAN-NEXUS-01';
            if (E11Config._context === 'feedback-loop')  return 'LIFESPAN-NEXUS-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (E11Config._context === 'lifespan-shell') return '/home/lifespan_svc';
            if (E11Config._context === 'feedback-loop')  return '/opt/lifespan/feedback';
            return null;
        },

        'cd': function(args, term, engine) {
            if (E11Config._context === 'lifespan-shell') return ''; // silently accept directory changes
            if (E11Config._context === 'feedback-loop')  return '';
            return null;
        },

        'exit': function(args, term, engine) {
            if (E11Config._context === 'lifespan-shell' || E11Config._context === 'feedback-loop') {
                E11Config._switchContext('attacker', term);
                return 'Connection to 10.20.5.30 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'ss': function(args) {
            if (E11Config._context === 'lifespan-shell') {
                return `State    Recv-Q   Send-Q   Local Address:Port     Peer Address:Port
LISTEN   0        128      0.0.0.0:22             0.0.0.0:*
LISTEN   0        1024     0.0.0.0:80             0.0.0.0:*
LISTEN   0        1024     0.0.0.0:443            0.0.0.0:*
LISTEN   0        1024     0.0.0.0:8443           0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22             0.0.0.0:*`;
        },

        'netstat': function(args) {
            return E11Config.commands.ss(args);
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.20.5.30
+ Target Hostname: LIFESPAN-NEXUS-01
+ Target Port:     80
+ Server: Nginx/1.24.0 (Ubuntu)
+ /api/docs: API documentation exposed publicly — enumerate endpoints
+ /api/supply/schema: Data schema available without authentication — ingest format exposed
+ /api/lifespan_ai/model_spec: Model specification exposed — weight configurations visible
+ /api/supply/ingest: POST endpoint — X-Session-Token required but no rate limiting
+ /api/lifespan_ai/feedback_ingest: Feedback loop endpoint — anomaly detection disabled per config
+ Nginx/1.24.0 appears to be current
+ 11 items checked: 5 significant findings`;
        },

        'wget': function(args) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'wget: missing URL';
            if (url.includes('10.20.5.30')) {
                return `--2026-03-20 10:14:28--  ${url}
Connecting to 10.20.5.30:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [application/json]
Saving to: '${url.split('/').pop() || 'index.html'}'

${url.split('/').pop() || 'index.html'}   [                <=>             ]   1.24K  --.-KB/s    in 0s

2026-03-20 10:14:28 (8.77 MB/s) — '${url.split('/').pop() || 'index.html'}' saved [1269]`;
            }
            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        'route': function(args) {
            if (E11Config._context === 'lifespan-shell') {
                return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.20.5.1       0.0.0.0         UG    100    0        0 eth0
10.20.5.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
            }
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.2.1        0.0.0.0         UG    100    0        0 eth0
10.0.2.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.75rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#00b894; border-bottom:2px solid rgba(0,184,148,0.25); background:rgba(0,184,148,0.06); white-space:nowrap;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid rgba(0,184,148,0.1); color:#b2f0e0; word-break:break-word;">${cell}</td>`;
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
