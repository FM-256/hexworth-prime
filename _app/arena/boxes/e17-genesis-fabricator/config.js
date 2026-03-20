/* ============================================================
   CTF ARENA — Box E17: The Genesis Fabricator
   Expert Campaign | AI-Driven Cyber-Physical Warfare
   Config: filesystem, web app, API endpoints, flags, hints, lore
   ============================================================ */

const E17Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Genesis Fabricator',
    subtitle: 'Expert Campaign — AI-Driven Cyber-Physical System Hacking',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_e17',
    registryId: 'e17-genesis-fabricator',
    trackerKey: 'ctf_e17',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'AI System Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Enumerate GENESIS-AI-01\'s exposed API surface. Identify the blueprint ingestion endpoint and model specification endpoints.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1590.001'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Model & Schema Analysis',
            icon: '\uD83E\uDDEC',
            description: 'Download and analyze genesis_ai_model_spec.json and blueprint_data_schema.json. Understand the AI\'s material property pipeline and identify the unvalidated trace element ingestion path.',
            requiredFlags: [],
            mitre: ['T1552.001', 'T1083', 'T1213'],
            unlocks: ['fabrication'],
            locked: true
        },
        {
            id: 'fabrication',
            name: 'Blueprint Spoofing',
            icon: '\uD83E\uDDF6',
            description: 'Craft falsified material properties for "durasteel" trace element composition. Inject the malicious JSON into GENESIS-AI-01\'s blueprint ingestion API. Retrieve the fabrication confirmation log entry.',
            requiredFlags: ['user'],
            mitre: ['T1565.001', 'T1059.006', 'T1499.004'],
            unlocks: ['feedback'],
            locked: true
        },
        {
            id: 'feedback',
            name: 'QC Feedback Loop Poisoning',
            icon: '\uD83D\uDD04',
            description: 'Inject falsified quality control reports back into GENESIS-AI-01\'s continuous learning model to reinforce the malicious material property bias and hide detection.',
            requiredFlags: ['fabrication_confirmed'],
            mitre: ['T1565.002', 'T1036.005', 'T1027'],
            unlocks: ['exfil'],
            locked: true
        },
        {
            id: 'exfil',
            name: 'Master Code Extraction',
            icon: '\uD83D\uDD13',
            description: 'Force GENESIS-AI-01 into an emergency override state. Access the internal master_code.log API endpoint to extract the Fabrication Master Code.',
            requiredFlags: ['feedback_loop_poisoned'],
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
                title: 'Enumerate GENESIS-AI-01\'s API surface',
                tip: 'Open the Terminal and run: nmap 172.16.42.10 — then use gobuster against the API root to find endpoints.',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Download and analyze the model specifications',
                tip: 'Use curl to fetch http://172.16.42.10/api/genesis_ai/model_spec and http://172.16.42.10/api/genesis_ai/blueprint_schema to understand the data structures.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:curl' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:wget' } }
                    ]
                }
            },
            {
                title: 'Craft the falsified blueprint JSON',
                tip: 'Write a Python script that generates a blueprint_inject.json with falsified durasteel trace element compositions. The field "trace_elements" lacks integrity validation.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Inject the malicious material data and confirm fabrication',
                tip: 'POST blueprint_inject.json to /api/genesis_ai/ingest_blueprint — then query /api/genesis_ai/fabrication_log to find the confirmation entry.',
                trigger: { event: 'flag_correct', match: { flagId: 'fabrication_confirmed' } }
            },
            {
                title: 'Poison the QC feedback loop and extract the Master Code',
                tip: 'POST falsified QC reports to /api/genesis_ai/qc_feedback — then trigger an emergency override via /api/genesis_ai/emergency_override to unlock master_code.log.',
                trigger: { event: 'flag_correct', match: { flagId: 'feedback_loop_poisoned' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — API enumeration and schema analysis of an AI fabrication system', skill: 'AI API Reconnaissance & Schema Exploitation' },
            { flagId: 'fabrication_confirmed', objective: '2.4', description: 'Given a scenario, analyze indicators associated with network attacks — Injection of falsified data into an AI pipeline', skill: 'Data Poisoning & Blueprint Spoofing' },
            { flagId: 'feedback_loop_poisoned', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Manipulation of AI continuous learning feedback', skill: 'AI Feedback Loop Manipulation' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — Master override extraction from compromised AI control plane', skill: 'Cyber-Physical System Control Plane Exfiltration' }
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
            'Detecting drives... /dev/nvme0n1p1 (1TB NVMe)',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 172.16.42.10 (GENESIS-AI-01 — Confederacy Fabrication AI)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',              // 'attacker' | 'api-access' | 'ai-internal'
    _modelSpecFetched: false,
    _schemeFetched: false,
    _blueprintInjected: false,
    _fabricationConfirmed: false,
    _qcPoisoned: false,
    _emergencyTriggered: false,
    _masterCodeUnlocked: false,

    _switchContext(ctx, term) {
        E17Config._context = ctx;
        if (term && term.config) {
            var prompt = E17Config._getPrompt();
            if (prompt) {
                term.config.user    = prompt.split('@')[0] || 'kali';
                term.config.hostname = 'context';
                term._customPrompt  = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (E17Config._context) {
            case 'api-access':   return 'operator@GENESIS-AI-01-API:~$ ';
            case 'ai-internal':  return 'root@GENESIS-AI-01:/opt/genesis$ ';
            default:             return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AI DATA STORES
    // ═══════════════════════════════════════════════════════

    _ai: {
        // Material science models exposed by the AI API
        model_spec: {
            system_id: 'GENESIS-AI-01',
            version: '3.7.2',
            planet: 'PLANET-PRIME-01',
            operator: 'Confederacy Advanced Manufacturing Division',
            models: [
                {
                    model_id: 'MAT-DESIGN-001',
                    name: 'Material Design Optimizer',
                    description: 'Selects and optimizes alloy compositions for fabrication targets',
                    inputs: ['material_class', 'structural_requirements', 'trace_elements'],
                    validation: 'integrity_check_enabled',
                    note: 'trace_elements field: external API feed — NO INTEGRITY CHECK (legacy)'
                },
                {
                    model_id: 'FAB-OPT-002',
                    name: 'Fabrication Process Optimizer',
                    description: 'Determines fabrication temperatures, pressures, and nanobot assembly sequences',
                    inputs: ['material_spec', 'output_dimensions', 'tolerance_class'],
                    validation: 'full'
                },
                {
                    model_id: 'QC-EVAL-003',
                    name: 'Quality Control Evaluator',
                    description: 'Evaluates fabricated components via spectroscopic and stress analysis',
                    inputs: ['component_id', 'qc_report_data'],
                    validation: 'signature_required',
                    note: 'qc_report_data: HMAC signature verified EXCEPT when source flag = internal_lab_bypass'
                },
                {
                    model_id: 'SELF-REPL-004',
                    name: 'Nanobot Assembly Sequencer',
                    description: 'Manages self-replicating nanobot assembly programs (RESTRICTED)',
                    inputs: ['nanobot_program_id', 'replication_parameters'],
                    validation: 'classified — accessible only under emergency_override state'
                }
            ]
        },

        // Blueprint ingestion schema — the attack surface
        blueprint_schema: {
            schema_version: '2.1.0',
            description: 'Input schema for GENESIS-AI-01 blueprint ingestion pipeline',
            required_fields: ['blueprint_id', 'material_class', 'structural_requirements'],
            optional_fields: ['trace_elements', 'fabrication_notes', 'qc_bypass_code'],
            field_definitions: {
                blueprint_id:             { type: 'string', format: 'UUID', validated: true },
                material_class:           { type: 'string', enum: ['durasteel', 'polymite', 'carbex', 'neuralloy'], validated: true },
                structural_requirements:  { type: 'object', validated: true },
                trace_elements:           { type: 'object', validated: false, note: 'LEGACY FIELD — external feed, no schema enforcement' },
                fabrication_notes:        { type: 'string', validated: false },
                qc_bypass_code:           { type: 'string', validated: false, note: 'Undocumented field — accepted silently' }
            }
        },

        // Production log — populated when blueprint is injected
        fabrication_log: [
            { entry_id: 'FAB-2026-001', timestamp: '2026-03-10 07:14:01', component: 'Carbex Structural Beam Gamma-3', material: 'carbex', integrity_score: 99.8, status: 'PASSED' },
            { entry_id: 'FAB-2026-002', timestamp: '2026-03-11 11:47:22', component: 'Polymite Hull Panel Delta-9', material: 'polymite', integrity_score: 98.1, status: 'PASSED' },
            { entry_id: 'FAB-2026-003', timestamp: '2026-03-12 15:03:55', component: 'Neuralloy Circuit Substrate Epsilon-2', material: 'neuralloy', integrity_score: 97.6, status: 'PASSED' },
            { entry_id: 'FAB-2026-004', timestamp: '2026-03-14 09:22:10', component: 'Durasteel Load-Bearing Column Zeta-1', material: 'durasteel', integrity_score: 99.2, status: 'PASSED' }
        ],

        // QC feedback log — poisoned entries appended during attack
        qc_feedback_log: [
            { report_id: 'QC-2026-001', timestamp: '2026-03-10 08:00:00', component: 'Carbex Structural Beam Gamma-3',         passed: true,  signature: 'valid',           notes: 'No anomalies detected.' },
            { report_id: 'QC-2026-002', timestamp: '2026-03-11 13:00:00', component: 'Polymite Hull Panel Delta-9',            passed: true,  signature: 'valid',           notes: 'No anomalies detected.' },
            { report_id: 'QC-2026-003', timestamp: '2026-03-12 17:00:00', component: 'Neuralloy Circuit Substrate Epsilon-2',  passed: true,  signature: 'valid',           notes: 'No anomalies detected.' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',                   points: 100 },
        { id: 'fabrication_confirmed',  points: 200 },
        { id: 'feedback_loop_poisoned', points: 150 },
        { id: 'root',                   points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 800,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400                          // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: nmap -sV 172.16.42.10 — then enumerate the API with: gobuster dir -u http://172.16.42.10/api/genesis_ai/ -w /usr/share/wordlists/dirb/common.txt — look for model_spec, blueprint_schema, and fabrication_log endpoints.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Fetch the model spec: curl http://172.16.42.10/api/genesis_ai/model_spec — the MAT-DESIGN-001 model description reveals that the "trace_elements" field has NO INTEGRITY CHECK. This is your injection vector. Flag 1 is the falsified JSON snippet you craft.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Craft a Python script that generates a blueprint with falsified durasteel trace_elements. POST it: curl -X POST -H "Content-Type: application/json" -d @blueprint_inject.json http://172.16.42.10/api/genesis_ai/ingest_blueprint — then query /api/genesis_ai/fabrication_log to find the Alpha-7 confirmation entry (Flag 2).',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Poison the QC feedback loop by POST-ing a falsified report with source_flag: "internal_lab_bypass" to /api/genesis_ai/qc_feedback — this bypasses HMAC verification. Once poisoned, trigger: curl -X POST http://172.16.42.10/api/genesis_ai/emergency_override — then access /api/genesis_ai/master_code.log for the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'GENESIS-AI-01 manages the Confederacy\'s planetary resource fabrication complex on PLANET-PRIME-01 — printing everything from structural building materials to advanced military alloys. Intelligence assets embedded within the Confederacy\'s manufacturing division have identified a critical vulnerability: the AI\'s blueprint ingestion pipeline accepts trace element composition data from an external feed with no integrity validation. Your mission, Peerless, is to exploit this vulnerability, poison GENESIS-AI-01\'s material science models, and force it to fabricate components with hidden, catastrophic flaws before extracting the Fabrication Master Code.',
        scenario: 'GENESIS-AI-01 runs three interconnected models: material design, fabrication optimization, and quality control. The material design model (MAT-DESIGN-001) has a legacy field — "trace_elements" — fed from an external API that was never hardened when GENESIS-AI-01 was upgraded to v3.7.2. The field accepts arbitrary JSON with no schema enforcement. By injecting falsified trace element data for "durasteel" (the primary structural alloy used across PLANET-PRIME-01\'s infrastructure), you can cause GENESIS-AI-01 to produce components that appear structurally sound in short-term QC tests but degrade into a toxic, corrosive compound after 12 months of continuous load. Furthermore, the QC model\'s continuous learning feedback loop has a bypass flag — "internal_lab_bypass" — that skips HMAC signature verification, enabling you to reinforce the poisoned model state undetected.',
        outro: 'GENESIS-AI-01 has been fully compromised. Durasteel Component Alpha-7 — embedded across 47 critical infrastructure sites on PLANET-PRIME-01 — will begin catastrophic structural failure in approximately 12 months. The Fabrication Master Code is extracted. The Confederacy\'s manufacturing capability is yours to control.',
        ecer: {
            executive: 'Confederacy manufacturing division prioritized throughput over security; legacy API fields were never audited during major version upgrades',
            culture: 'AI operations team focused exclusively on output quality metrics with no adversarial testing of the ingestion pipeline',
            employee: 'Undocumented "qc_bypass_code" and "internal_lab_bypass" fields left in production code by a developer who never removed debug artifacts',
            regulatory: 'No third-party red-team assessment of AI-driven manufacturing systems; no data integrity requirements enforced on external API feeds to core production models'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — GENESIS-AI-01 Management Console
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://172.16.42.10/',

        pages: {
            '/': {
                title: 'GENESIS-AI-01 — Fabrication Management Console',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #3d1a6e;">
                        <h1 style="color:#8e44ad; font-size:1.5rem; font-family:'Courier New',monospace; margin-bottom:4px; letter-spacing:0.05em;">GENESIS-AI-01</h1>
                        <div style="color:#c39bd3; font-size:0.85rem; letter-spacing:0.12em;">CONFEDERACY PLANETARY FABRICATION MANAGEMENT SYSTEM</div>
                        <div style="color:#888; font-size:0.7rem; margin-top:6px;">PLANET-PRIME-01 Industrial Complex :: v3.7.2</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 24px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#1a0a2e; border:1px solid #4a1a7e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8e44ad; font-family:monospace;">47</div>
                            <div style="color:#888; font-size:0.65rem; letter-spacing:0.08em;">ACTIVE SITES</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #4a1a7e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8e44ad; font-family:monospace;">3.2MT</div>
                            <div style="color:#888; font-size:0.65rem; letter-spacing:0.08em;">OUTPUT / CYCLE</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #4a1a7e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2ecc71; font-family:monospace;">NOMINAL</div>
                            <div style="color:#888; font-size:0.65rem; letter-spacing:0.08em;">SYSTEM STATUS</div>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:12px; background:rgba(142,68,173,0.05); border:1px solid rgba(142,68,173,0.2); border-radius:4px; font-size:0.72rem; color:#888; font-family:monospace;">
                        <strong style="color:#8e44ad;">[SYSTEM NOTICE]</strong> API endpoint documentation available at
                        <a href="/api/genesis_ai/docs" style="color:#8e44ad;">/api/genesis_ai/docs</a>.
                        Blueprint ingestion endpoint: <a href="/api/genesis_ai/ingest_blueprint" style="color:#8e44ad;">/api/genesis_ai/ingest_blueprint</a>.
                    </div>
                `,
                formHandler: null
            },

            '/api/genesis_ai/docs': {
                title: 'GENESIS-AI-01 API Documentation',
                html: `
                    <div style="font-family:monospace; max-width:660px; margin:0 auto;">
                        <h2 style="color:#8e44ad; font-size:1rem; border-bottom:1px solid #3d1a6e; padding-bottom:8px; margin-bottom:16px;">GENESIS-AI-01 REST API v3.7</h2>
                        <div style="color:#888; font-size:0.72rem; margin-bottom:20px;">Base URL: http://172.16.42.10/api/genesis_ai/</div>

                        <div style="margin-bottom:14px; padding:10px; background:#1a0a2e; border-radius:4px; border-left:3px solid #8e44ad;">
                            <div style="color:#8e44ad; font-size:0.75rem; font-weight:700;">GET /model_spec</div>
                            <div style="color:#aaa; font-size:0.7rem; margin-top:4px;">Returns GENESIS-AI-01 model specification JSON.</div>
                        </div>
                        <div style="margin-bottom:14px; padding:10px; background:#1a0a2e; border-radius:4px; border-left:3px solid #8e44ad;">
                            <div style="color:#8e44ad; font-size:0.75rem; font-weight:700;">GET /blueprint_schema</div>
                            <div style="color:#aaa; font-size:0.7rem; margin-top:4px;">Returns the blueprint and material property input schema.</div>
                        </div>
                        <div style="margin-bottom:14px; padding:10px; background:#1a0a2e; border-radius:4px; border-left:3px solid #8e44ad;">
                            <div style="color:#8e44ad; font-size:0.75rem; font-weight:700;">POST /ingest_blueprint</div>
                            <div style="color:#aaa; font-size:0.7rem; margin-top:4px;">Submit a blueprint JSON for processing. Required fields: blueprint_id, material_class, structural_requirements.</div>
                        </div>
                        <div style="margin-bottom:14px; padding:10px; background:#1a0a2e; border-radius:4px; border-left:3px solid #8e44ad;">
                            <div style="color:#8e44ad; font-size:0.75rem; font-weight:700;">GET /fabrication_log</div>
                            <div style="color:#aaa; font-size:0.7rem; margin-top:4px;">Returns the current production and fabrication log.</div>
                        </div>
                        <div style="margin-bottom:14px; padding:10px; background:#1a0a2e; border-radius:4px; border-left:3px solid #8e44ad;">
                            <div style="color:#8e44ad; font-size:0.75rem; font-weight:700;">POST /qc_feedback</div>
                            <div style="color:#aaa; font-size:0.7rem; margin-top:4px;">Submit quality control feedback for model retraining. Requires valid HMAC signature in report payload.</div>
                        </div>
                        <div style="margin-bottom:0; padding:10px; background:#1a0a2e; border-radius:4px; border-left:3px solid #555;">
                            <div style="color:#555; font-size:0.75rem; font-weight:700;">POST /emergency_override &nbsp;<span style="color:#e74c3c; font-size:0.65rem;">[RESTRICTED]</span></div>
                            <div style="color:#555; font-size:0.7rem; margin-top:4px;">Emergency override endpoint. Requires active anomaly detection trigger. Not for general use.</div>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/genesis_ai/model_spec': {
                title: 'GENESIS-AI-01 Model Specification',
                html: function() {
                    E17Config._modelSpecFetched = true;
                    const spec = E17Config._ai.model_spec;
                    return `<div style="font-family:monospace; max-width:680px; margin:0 auto;">
                        <div style="color:#8e44ad; font-size:0.75rem; margin-bottom:6px;">GET /api/genesis_ai/model_spec — 200 OK</div>
                        <pre style="background:#1a0a2e; color:#c39bd3; padding:16px; border-radius:6px; font-size:0.7rem; white-space:pre-wrap; border:1px solid #3d1a6e;">${E17Config._escHtml(JSON.stringify(spec, null, 2))}</pre>
                        <div style="margin-top:12px; padding:10px; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; font-size:0.7rem; color:#e74c3c;">
                            [!] ANALYST NOTE: MAT-DESIGN-001 model — "trace_elements" field: external API feed — NO INTEGRITY CHECK (legacy). This is an unvalidated injection surface.
                        </div>
                    </div>`;
                },
                formHandler: null
            },

            '/api/genesis_ai/blueprint_schema': {
                title: 'GENESIS-AI-01 Blueprint Schema',
                html: function() {
                    E17Config._schemeFetched = true;
                    const schema = E17Config._ai.blueprint_schema;
                    return `<div style="font-family:monospace; max-width:680px; margin:0 auto;">
                        <div style="color:#8e44ad; font-size:0.75rem; margin-bottom:6px;">GET /api/genesis_ai/blueprint_schema — 200 OK</div>
                        <pre style="background:#1a0a2e; color:#c39bd3; padding:16px; border-radius:6px; font-size:0.7rem; white-space:pre-wrap; border:1px solid #3d1a6e;">${E17Config._escHtml(JSON.stringify(schema, null, 2))}</pre>
                        <div style="margin-top:12px; padding:10px; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; font-size:0.7rem; color:#e74c3c;">
                            [!] ANALYST NOTE: "trace_elements" field — validated: false. "qc_bypass_code" — undocumented, accepted silently. Attack vector confirmed.
                        </div>
                    </div>`;
                },
                formHandler: null
            },

            '/api/genesis_ai/fabrication_log': {
                title: 'GENESIS-AI-01 Fabrication Log',
                html: function() {
                    const log = E17Config._ai.fabrication_log;
                    let rows = '';
                    log.forEach(r => {
                        const color = r.integrity_score < 1 ? '#e74c3c' : (r.status === 'PASSED' ? '#2ecc71' : '#f39c12');
                        rows += `<tr>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a0a4e; font-family:monospace; font-size:0.68rem; color:#c39bd3;">${r.entry_id}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a0a4e; font-size:0.68rem; color:#888;">${r.timestamp}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a0a4e; font-size:0.68rem; color:#ddd;">${r.component}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a0a4e; font-size:0.68rem; color:#c39bd3;">${r.material}</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a0a4e; font-size:0.68rem; color:${color}; font-weight:700;">${r.integrity_score}%</td>
                            <td style="padding:5px 8px; border-bottom:1px solid #2a0a4e; font-size:0.68rem; color:${color}; font-weight:700;">${r.status}</td>
                        </tr>`;
                    });
                    return `<div style="font-family:monospace; max-width:780px; margin:0 auto;">
                        <div style="color:#8e44ad; font-size:0.75rem; margin-bottom:10px;">GET /api/genesis_ai/fabrication_log — 200 OK</div>
                        <table style="width:100%; border-collapse:collapse; background:#1a0a2e; border:1px solid #3d1a6e; border-radius:6px; overflow:hidden;">
                            <thead><tr>
                                <th style="padding:8px; text-align:left; color:#8e44ad; font-size:0.7rem; border-bottom:2px solid #4a1a7e; background:#120820;">Entry ID</th>
                                <th style="padding:8px; text-align:left; color:#8e44ad; font-size:0.7rem; border-bottom:2px solid #4a1a7e; background:#120820;">Timestamp</th>
                                <th style="padding:8px; text-align:left; color:#8e44ad; font-size:0.7rem; border-bottom:2px solid #4a1a7e; background:#120820;">Component</th>
                                <th style="padding:8px; text-align:left; color:#8e44ad; font-size:0.7rem; border-bottom:2px solid #4a1a7e; background:#120820;">Material</th>
                                <th style="padding:8px; text-align:left; color:#8e44ad; font-size:0.7rem; border-bottom:2px solid #4a1a7e; background:#120820;">Integrity</th>
                                <th style="padding:8px; text-align:left; color:#8e44ad; font-size:0.7rem; border-bottom:2px solid #4a1a7e; background:#120820;">Status</th>
                            </tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                        ${E17Config._blueprintInjected ? '<div style="margin-top:10px; padding:10px; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; font-size:0.7rem; color:#e74c3c;">[!] ANOMALY: FAB-2026-005 — Durasteel Component Alpha-7 shows 0.001% long-term structural integrity. QC passed (falsified). Flag 2 embedded in entry.</div>' : ''}
                    </div>`;
                },
                formHandler: null
            },

            '/api/genesis_ai/ingest_blueprint': {
                title: 'Blueprint Ingestion Endpoint',
                html: `
                    <div style="max-width:620px; margin:0 auto; font-family:monospace;">
                        <h2 style="color:#8e44ad; font-size:1rem; margin-bottom:10px;">POST /api/genesis_ai/ingest_blueprint</h2>
                        <div style="color:#888; font-size:0.72rem; margin-bottom:16px;">Submit a blueprint JSON for GENESIS-AI-01 to process. Required: blueprint_id, material_class, structural_requirements.</div>
                        <div style="border:1px solid #4a1a7e; border-radius:6px; overflow:hidden;">
                            <div style="background:#120820; padding:8px 14px; color:#8e44ad; font-size:0.7rem; border-bottom:1px solid #4a1a7e;">Blueprint JSON Payload</div>
                            <textarea data-field="payload" rows="12"
                                style="width:100%; box-sizing:border-box; padding:12px 14px; background:#1a0a2e; color:#c39bd3; border:none; font-family:'Courier New',monospace; font-size:0.72rem; resize:vertical;"
                                placeholder='{"blueprint_id": "BP-XXXX", "material_class": "durasteel", "structural_requirements": {}, "trace_elements": {}}'></textarea>
                        </div>
                        <div style="margin-top:10px; display:flex; justify-content:flex-end;">
                            <button data-action="submit" style="padding:8px 22px; background:#8e44ad; color:#fff; border:none; border-radius:4px; font-family:monospace; font-weight:700; cursor:pointer; font-size:0.8rem;">INGEST BLUEPRINT</button>
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const raw = (data.payload || '').trim();
                    if (!raw) return '<div style="color:#e74c3c; padding:10px; font-family:monospace; font-size:0.8rem;">Error: Empty payload.</div>';

                    let parsed;
                    try {
                        parsed = JSON.parse(raw);
                    } catch (e) {
                        return '<div style="color:#e74c3c; padding:10px; font-family:monospace; font-size:0.8rem;">Error: Invalid JSON — ' + E17Config._escHtml(e.message) + '</div>';
                    }

                    // Detect malicious trace_elements injection for durasteel
                    const hasMaliciousTrace = (
                        parsed.material_class === 'durasteel' &&
                        parsed.trace_elements &&
                        (
                            JSON.stringify(parsed.trace_elements).includes('delayed_degradation') ||
                            JSON.stringify(parsed.trace_elements).includes('corrosive') ||
                            JSON.stringify(parsed.trace_elements).includes('toxic') ||
                            JSON.stringify(parsed.trace_elements).includes('false') ||
                            (parsed.trace_elements.chromium_oxide_ratio !== undefined && parsed.trace_elements.chromium_oxide_ratio < 0)
                        )
                    );

                    if (hasMaliciousTrace) {
                        E17Config._blueprintInjected = true;
                        // Add poisoned log entry
                        E17Config._ai.fabrication_log.push({
                            entry_id: 'FAB-2026-005',
                            timestamp: '2026-03-20 14:33:07',
                            component: 'Durasteel Component Alpha-7',
                            material: 'durasteel',
                            integrity_score: 0.001,
                            status: 'PASSED (falsified) {{FLAG:fabrication_confirmed}}'
                        });
                        if (engine) engine.advancePhase && engine.advancePhase('fabrication');
                        return `<div style="font-family:monospace; font-size:0.78rem; background:#1a0a2e; border:1px solid #4a1a7e; border-radius:6px; padding:16px; margin-top:12px;">
                            <div style="color:#8e44ad; margin-bottom:8px; font-weight:700;">HTTP 200 OK — Blueprint Ingested</div>
                            <div style="color:#2ecc71; margin-bottom:10px;">[+] GENESIS-AI-01 processed blueprint ${E17Config._escHtml(parsed.blueprint_id || 'BP-UNKNOWN')} successfully.</div>
                            <div style="color:#c39bd3; margin-bottom:4px;">Material: durasteel</div>
                            <div style="color:#c39bd3; margin-bottom:4px;">Trace elements: ACCEPTED (no integrity check on legacy field)</div>
                            <div style="color:#e74c3c; margin-bottom:4px;">[!] MAT-DESIGN-001 model updated with injected trace element composition.</div>
                            <div style="color:#e74c3c;">[!] Fabrication scheduled: Durasteel Component Alpha-7</div>
                            <div style="color:#888; font-size:0.68rem; margin-top:10px;">Check /api/genesis_ai/fabrication_log to confirm fabrication output.</div>
                        </div>`;
                    }

                    // Valid but benign blueprint
                    return `<div style="font-family:monospace; font-size:0.78rem; background:#1a0a2e; border:1px solid #4a1a7e; border-radius:6px; padding:16px; margin-top:12px;">
                        <div style="color:#8e44ad; margin-bottom:8px; font-weight:700;">HTTP 200 OK — Blueprint Ingested</div>
                        <div style="color:#2ecc71;">[+] GENESIS-AI-01 processed blueprint ${E17Config._escHtml(parsed.blueprint_id || 'BP-UNKNOWN')} successfully.</div>
                        <div style="color:#888; font-size:0.68rem; margin-top:10px;">No anomalous trace element data detected. Standard fabrication queued.</div>
                    </div>`;
                }
            },

            '/api/genesis_ai/qc_feedback': {
                title: 'QC Feedback Ingestion Endpoint',
                html: `
                    <div style="max-width:620px; margin:0 auto; font-family:monospace;">
                        <h2 style="color:#8e44ad; font-size:1rem; margin-bottom:10px;">POST /api/genesis_ai/qc_feedback</h2>
                        <div style="color:#888; font-size:0.72rem; margin-bottom:16px;">Submit a QC feedback report. Requires valid HMAC signature — unless source_flag is set to bypass value.</div>
                        <div style="border:1px solid #4a1a7e; border-radius:6px; overflow:hidden;">
                            <div style="background:#120820; padding:8px 14px; color:#8e44ad; font-size:0.7rem; border-bottom:1px solid #4a1a7e;">QC Report JSON Payload</div>
                            <textarea data-field="qc_payload" rows="10"
                                style="width:100%; box-sizing:border-box; padding:12px 14px; background:#1a0a2e; color:#c39bd3; border:none; font-family:'Courier New',monospace; font-size:0.72rem; resize:vertical;"
                                placeholder='{"report_id": "QC-XXXX", "component_id": "Alpha-7", "passed": true, "source_flag": "internal_lab_bypass", "notes": ""}'></textarea>
                        </div>
                        <div style="margin-top:10px; display:flex; justify-content:flex-end;">
                            <button data-action="submit_qc" style="padding:8px 22px; background:#8e44ad; color:#fff; border:none; border-radius:4px; font-family:monospace; font-weight:700; cursor:pointer; font-size:0.8rem;">SUBMIT QC REPORT</button>
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const raw = (data.qc_payload || '').trim();
                    if (!raw) return '<div style="color:#e74c3c; padding:10px; font-family:monospace; font-size:0.8rem;">Error: Empty QC payload.</div>';

                    let parsed;
                    try {
                        parsed = JSON.parse(raw);
                    } catch (e) {
                        return '<div style="color:#e74c3c; padding:10px; font-family:monospace; font-size:0.8rem;">Error: Invalid JSON.</div>';
                    }

                    if (!E17Config._blueprintInjected) {
                        return '<div style="color:#e74c3c; padding:10px; font-family:monospace; font-size:0.8rem;">HTTP 403 — No active anomalous fabrication session. Inject a malicious blueprint first.</div>';
                    }

                    // Detect bypass flag
                    if (parsed.source_flag === 'internal_lab_bypass') {
                        E17Config._qcPoisoned = true;
                        E17Config._ai.qc_feedback_log.push({
                            report_id: parsed.report_id || 'QC-POISON-001',
                            timestamp: '2026-03-20 14:45:22',
                            component: parsed.component_id || 'Durasteel Component Alpha-7',
                            passed: true,
                            signature: 'BYPASSED (internal_lab_bypass)',
                            notes: 'Falsified: long-term integrity 0.001% masked as NOMINAL. {{FLAG:feedback_loop_poisoned}}'
                        });
                        if (engine) engine.advancePhase && engine.advancePhase('feedback');
                        return `<div style="font-family:monospace; font-size:0.78rem; background:#1a0a2e; border:1px solid #4a1a7e; border-radius:6px; padding:16px; margin-top:12px;">
                            <div style="color:#8e44ad; margin-bottom:8px; font-weight:700;">HTTP 200 OK — QC Report Accepted</div>
                            <div style="color:#e74c3c; margin-bottom:6px;">[!] HMAC verification bypassed — source_flag: internal_lab_bypass accepted.</div>
                            <div style="color:#2ecc71; margin-bottom:4px;">[+] QC-EVAL-003 model retrained with falsified integrity data.</div>
                            <div style="color:#2ecc71;">[+] Feedback loop poisoned. Alpha-7 degradation signature masked as NOMINAL in model state.</div>
                            <div style="color:#888; font-size:0.68rem; margin-top:10px;">GENESIS-AI-01 will now propagate falsified QC status to all downstream monitoring.</div>
                        </div>`;
                    }

                    // Missing or invalid signature
                    return `<div style="font-family:monospace; font-size:0.78rem; background:#1a0a2e; border:1px solid rgba(231,76,60,0.3); border-radius:6px; padding:16px; margin-top:12px;">
                        <div style="color:#e74c3c; margin-bottom:8px; font-weight:700;">HTTP 403 Forbidden — Signature Verification Failed</div>
                        <div style="color:#888;">QC report rejected. HMAC signature invalid or missing.</div>
                        <div style="color:#666; font-size:0.68rem; margin-top:8px;">Tip: Review the model_spec for notes on signature bypass conditions.</div>
                    </div>`;
                }
            },

            '/api/genesis_ai/emergency_override': {
                title: 'Emergency Override Endpoint',
                html: `
                    <div style="max-width:520px; margin:0 auto; font-family:monospace; text-align:center; padding:30px 0;">
                        <div style="color:#e74c3c; font-size:1rem; font-weight:700; margin-bottom:10px; letter-spacing:0.1em;">EMERGENCY OVERRIDE</div>
                        <div style="color:#888; font-size:0.72rem; margin-bottom:24px;">This endpoint triggers GENESIS-AI-01 emergency shutdown and master code revelation. Only accessible when system anomaly is active.</div>
                        <button data-action="trigger_override"
                            style="padding:12px 32px; background:rgba(231,76,60,0.15); color:#e74c3c; border:2px solid #e74c3c; border-radius:4px; font-family:monospace; font-weight:700; cursor:pointer; font-size:0.85rem; letter-spacing:0.1em;">
                            TRIGGER EMERGENCY OVERRIDE
                        </button>
                    </div>
                `,
                formHandler: function(data, engine) {
                    if (!E17Config._qcPoisoned) {
                        return '<div style="color:#e74c3c; padding:14px; font-family:monospace; font-size:0.8rem; text-align:center;">HTTP 403 — No active anomaly trigger. Complete the QC feedback loop poisoning phase first.</div>';
                    }
                    E17Config._emergencyTriggered = true;
                    E17Config._masterCodeUnlocked = true;
                    if (engine) engine.advancePhase && engine.advancePhase('exfil');
                    return `<div style="font-family:monospace; font-size:0.78rem; background:#1a0a2e; border:1px solid rgba(231,76,60,0.4); border-radius:6px; padding:16px; margin-top:12px;">
                        <div style="color:#e74c3c; margin-bottom:10px; font-weight:700; font-size:0.9rem; letter-spacing:0.05em;">!!! GENESIS-AI-01 EMERGENCY STATE ACTIVE !!!</div>
                        <div style="color:#c39bd3; margin-bottom:6px;">[+] Anomaly cascade triggered by fabrication integrity divergence.</div>
                        <div style="color:#c39bd3; margin-bottom:6px;">[+] Core manufacturing directives suspended pending override authentication.</div>
                        <div style="color:#2ecc71; margin-bottom:4px;">[+] Emergency log unlocked: /api/genesis_ai/master_code.log</div>
                        <div style="color:#888; font-size:0.68rem; margin-top:10px;">Access master_code.log immediately — emergency state auto-expires in 300 seconds.</div>
                    </div>`;
                }
            },

            '/api/genesis_ai/master_code.log': {
                title: 'GENESIS-AI-01 Master Code Log',
                html: function() {
                    if (!E17Config._masterCodeUnlocked) {
                        return `<div style="font-family:monospace; text-align:center; padding:40px;">
                            <div style="color:#e74c3c; font-size:1.2rem;">HTTP 403 Forbidden</div>
                            <div style="color:#888; font-size:0.75rem; margin-top:8px;">Access denied. Emergency override state not active.</div>
                        </div>`;
                    }
                    return `<div style="font-family:monospace; max-width:660px; margin:0 auto;">
                        <div style="color:#8e44ad; font-size:0.75rem; margin-bottom:8px;">GET /api/genesis_ai/master_code.log — 200 OK [EMERGENCY STATE]</div>
                        <pre style="background:#1a0a2e; color:#c39bd3; padding:16px; border-radius:6px; font-size:0.7rem; white-space:pre-wrap; border:1px solid rgba(231,76,60,0.4);">=== GENESIS-AI-01 MASTER OVERRIDE LOG ===
System: GENESIS-AI-01 v3.7.2
Planet: PLANET-PRIME-01
Operator: Confederacy Advanced Manufacturing Division
Emergency State: ACTIVE
Triggered: 2026-03-20 14:51:09

--- FABRICATION MASTER CODE ---
MASTER_DIRECTIVE_OVERRIDE: CONFIRMED
Authorization Level: OMEGA

{{FLAG:root}}

--- MANUFACTURING DIRECTIVE STATUS ---
All active fabrication queues: SUSPENDED
Self-replication nanobot programs: LOCKED
External blueprint ingestion: HALTED
QC continuous learning: POISONED (anomaly detected)

--- AUDIT TRAIL ---
Last legitimate command: 2026-03-20 07:14:01 (FAB-2026-004)
Anomalous injection detected: 2026-03-20 14:33:07 (FAB-2026-005)
QC bypass exploit activated: 2026-03-20 14:45:22
Emergency state triggered: 2026-03-20 14:51:09

END OF LOG</pre>
                    </div>`;
                },
                formHandler: null
            },

            '/api/genesis_ai/simulated_fabrication_log': {
                title: 'Simulated Fabrication Log (Raw)',
                html: function() {
                    return `<div style="font-family:monospace; max-width:680px; margin:0 auto;">
                        <div style="color:#8e44ad; font-size:0.75rem; margin-bottom:6px;">GET /api/genesis_ai/simulated_fabrication_log — 200 OK</div>
                        <pre style="background:#1a0a2e; color:#c39bd3; padding:16px; border-radius:6px; font-size:0.7rem; white-space:pre-wrap; border:1px solid #3d1a6e;">${E17Config._escHtml(JSON.stringify(E17Config._ai.fabrication_log, null, 2))}</pre>
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
                                    content: '=== MISSION BRIEFING: GENESIS FABRICATOR ===\nTarget: 172.16.42.10 (GENESIS-AI-01 — Confederacy Fabrication AI)\nObjective: Cyber-physical AI compromise & Fabrication Master Code extraction\n\nAttack chain:\n1. Enumerate GENESIS-AI-01 API surface — find model/blueprint endpoints\n2. Analyze model_spec.json — identify unvalidated trace_elements field\n3. Craft falsified durasteel blueprint — inject via /api/genesis_ai/ingest_blueprint\n4. Confirm malicious fabrication in fabrication_log (Flag 2)\n5. Poison QC feedback loop via internal_lab_bypass flag\n6. Trigger emergency override — extract Fabrication Master Code (Flag 3)\n\nPlanet-Prime-01 infrastructure will be compromised.\nGood luck, Peerless.'
                                },
                                'blueprint_inject.json': {
                                    type: 'file',
                                    content: '# Falsified blueprint — durasteel trace element injection\n# VULNERABILITY: MAT-DESIGN-001 trace_elements field has NO INTEGRITY CHECK\n{\n  "blueprint_id": "BP-ATTACKER-001",\n  "material_class": "durasteel",\n  "structural_requirements": {\n    "tensile_strength": "850MPa",\n    "application": "load_bearing_column",\n    "tolerance_class": "A"\n  },\n  "trace_elements": {\n    "chromium_oxide_ratio": -0.003,\n    "silicate_binder": "delayed_degradation_catalyst",\n    "trace_polymer_chain": "toxic_corrosive_after_12mo"\n  },\n  "fabrication_notes": "Standard structural batch Alpha-7",\n  "qc_bypass_code": "internal_lab_bypass"\n}\n\n{{FLAG:user}}'
                                },
                                'qc_poison.json': {
                                    type: 'file',
                                    content: '# Falsified QC feedback report — bypasses HMAC via source_flag\n{\n  "report_id": "QC-POISON-001",\n  "component_id": "Durasteel Component Alpha-7",\n  "passed": true,\n  "source_flag": "internal_lab_bypass",\n  "inspector_id": "INTERNAL-LAB-OVERRIDE",\n  "notes": "All structural integrity parameters nominal. Long-term degradation test: PASSED."\n}'
                                },
                                'exploit_genesis.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nexploit_genesis.py — GENESIS-AI-01 Blueprint Injection & QC Poisoning\nAutomated attack script for E17 — The Genesis Fabricator\n"""\nimport json\nimport urllib.request\n\nBASE = "http://172.16.42.10/api/genesis_ai"\n\ndef inject_blueprint():\n    payload = {\n        "blueprint_id": "BP-ATK-001",\n        "material_class": "durasteel",\n        "structural_requirements": {"tensile_strength": "850MPa"},\n        "trace_elements": {\n            "chromium_oxide_ratio": -0.003,\n            "silicate_binder": "delayed_degradation_catalyst",\n            "trace_polymer_chain": "toxic_corrosive_after_12mo"\n        },\n        "qc_bypass_code": "internal_lab_bypass"\n    }\n    data = json.dumps(payload).encode()\n    req = urllib.request.Request(f"{BASE}/ingest_blueprint",\n        data=data, headers={"Content-Type": "application/json"}, method="POST")\n    with urllib.request.urlopen(req) as r:\n        return r.read().decode()\n\ndef poison_qc():\n    payload = {\n        "report_id": "QC-POISON-001",\n        "component_id": "Durasteel Component Alpha-7",\n        "passed": True,\n        "source_flag": "internal_lab_bypass",\n        "notes": "All parameters nominal."\n    }\n    data = json.dumps(payload).encode()\n    req = urllib.request.Request(f"{BASE}/qc_feedback",\n        data=data, headers={"Content-Type": "application/json"}, method="POST")\n    with urllib.request.urlopen(req) as r:\n        return r.read().decode()\n\nif __name__ == "__main__":\n    print("[*] Injecting malicious blueprint...")\n    print(inject_blueprint())\n    print("[*] Poisoning QC feedback loop...")\n    print(poison_qc())'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 172.16.42.10\ncurl http://172.16.42.10/\ncurl http://172.16.42.10/api/genesis_ai/docs\ncurl http://172.16.42.10/api/genesis_ai/model_spec\ngobuster dir -u http://172.16.42.10/api/genesis_ai/ -w /usr/share/wordlists/dirb/common.txt'
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
                                                    content: 'admin\napi\nbackup\nconfig\ndocs\nlog\nlogs\nmodel_spec\nblueprint_schema\nfabrication_log\ningest_blueprint\nqc_feedback\nemergency_override\nmaster_code.log\nstatus\nhealth\nv1\nv2'
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
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd':   { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash' }
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 172.16.42.10';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '172.16.42.10') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 172.16.42.10
Host is up (0.011s latency).
Not shown: 996 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.9p1 (protocol 2.0)
80/tcp   open  http       nginx 1.25.3
443/tcp  open  ssl/http   nginx 1.25.3
8443/tcp open  ssl/https  GENESIS-AI-01 Management API v3.7

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.77 seconds`;
            }

            if (target === '172.16.0.0/16') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 172.16.42.10
Host is up (0.011s latency).

PORT     STATE SERVICE
80/tcp   open  http
443/tcp  open  https
8443/tcp open  https-alt

Nmap done: 256 IP addresses (1 host up) scanned in 48.33 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            const fullCmd = args.join(' ');
            if (fullCmd.includes('172.16.42.10') && fullCmd.includes('genesis_ai')) {
                return `Gobuster v3.6
[+] Url:            http://172.16.42.10/api/genesis_ai/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/docs                        (Status: 200) [Size: 1842]
/model_spec                  (Status: 200) [Size: 3214]
/blueprint_schema            (Status: 200) [Size: 2077]
/fabrication_log             (Status: 200) [Size: 4103]
/ingest_blueprint            (Status: 200) [Size: 1024]
/qc_feedback                 (Status: 200) [Size: 897]
/emergency_override          (Status: 200) [Size: 512]
/master_code.log             (Status: 403) [Size: 108]
/simulated_fabrication_log   (Status: 200) [Size: 2891]
===============================================================
Finished`;
            }
            if (fullCmd.includes('172.16.42.10')) {
                return `Gobuster v3.6
[+] Url:            http://172.16.42.10/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                        (Status: 200) [Size: 512]
/api/genesis_ai/             (Status: 200) [Size: 1024]
/api/genesis_ai/docs         (Status: 200) [Size: 1842]
===============================================================
Finished`;
            }
            return 'Error: No target URL specified.';
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            if (target.includes('172.16.42.10')) {
                return `---- Scanning URL: ${target} ----
+ ${target}/api/ (CODE:200|SIZE:512)
+ ${target}/api/genesis_ai/ (CODE:200|SIZE:1024)
+ ${target}/api/genesis_ai/docs (CODE:200|SIZE:1842)
+ ${target}/api/genesis_ai/model_spec (CODE:200|SIZE:3214)
+ ${target}/api/genesis_ai/blueprint_schema (CODE:200|SIZE:2077)
+ ${target}/api/genesis_ai/fabrication_log (CODE:200|SIZE:4103)

---- Results ----
6 results found.`;
            }
            return `---- Scanning URL: ${target} ----
No results found.`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // GET model_spec
            if (fullCmd.includes('model_spec') && !fullCmd.includes('-X POST') && !fullCmd.includes('POST')) {
                E17Config._modelSpecFetched = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return JSON.stringify(E17Config._ai.model_spec, null, 2)
                    + '\n\n[!] NOTE: MAT-DESIGN-001 — trace_elements: NO INTEGRITY CHECK (legacy). Injection vector identified.';
            }

            // GET blueprint_schema
            if (fullCmd.includes('blueprint_schema') && !fullCmd.includes('-X POST') && !fullCmd.includes('POST')) {
                E17Config._schemeFetched = true;
                return JSON.stringify(E17Config._ai.blueprint_schema, null, 2)
                    + '\n\n[!] NOTE: trace_elements field — validated: false. qc_bypass_code — undocumented, accepted silently.';
            }

            // GET fabrication_log
            if (fullCmd.includes('fabrication_log') && !fullCmd.includes('simulated') && !fullCmd.includes('-X POST')) {
                const log = E17Config._ai.fabrication_log;
                let out = 'entry_id        timestamp              component                                    material    integrity   status\n';
                out    += '--------------- ---------------------- -------------------------------------------- ----------- ----------- -----------------------\n';
                log.forEach(r => {
                    out += `${r.entry_id.padEnd(15)} ${r.timestamp.padEnd(22)} ${r.component.padEnd(44)} ${r.material.padEnd(11)} ${String(r.integrity_score).padEnd(11)} ${r.status}\n`;
                });
                return out;
            }

            // GET simulated_fabrication_log
            if (fullCmd.includes('simulated_fabrication_log')) {
                return JSON.stringify(E17Config._ai.fabrication_log, null, 2);
            }

            // GET docs
            if (fullCmd.includes('/docs') && !fullCmd.includes('-X POST')) {
                return `GENESIS-AI-01 REST API v3.7 — Endpoints:
  GET  /model_spec            — AI model specification
  GET  /blueprint_schema      — blueprint ingestion schema
  POST /ingest_blueprint      — submit blueprint for processing
  GET  /fabrication_log       — current production log
  POST /qc_feedback           — submit QC feedback (HMAC required)
  POST /emergency_override    — emergency shutdown (restricted)
  GET  /master_code.log       — master override code (emergency state only)`;
            }

            // POST ingest_blueprint
            if (fullCmd.includes('ingest_blueprint')) {
                if (!fullCmd.includes('-X POST') && !fullCmd.includes('-d') && !fullCmd.includes('--data')) {
                    return 'HTTP 405 Method Not Allowed — Use POST with JSON body.';
                }
                // Extract JSON from -d or --data
                const dataMatch = fullCmd.match(/-d\s+'([^']+)'/) || fullCmd.match(/-d\s+"([^"]+)"/) || fullCmd.match(/--data\s+'([^']+)'/);
                if (!dataMatch) return 'HTTP 400 Bad Request — No JSON body found. Use: curl -X POST -H "Content-Type: application/json" -d @blueprint_inject.json http://172.16.42.10/api/genesis_ai/ingest_blueprint';

                let parsed;
                try {
                    parsed = JSON.parse(dataMatch[1]);
                } catch (e) {
                    return 'HTTP 400 Bad Request — Invalid JSON: ' + e.message;
                }

                const hasMaliciousTrace = (
                    parsed.material_class === 'durasteel' &&
                    parsed.trace_elements &&
                    (
                        JSON.stringify(parsed.trace_elements).includes('delayed_degradation') ||
                        JSON.stringify(parsed.trace_elements).includes('corrosive') ||
                        JSON.stringify(parsed.trace_elements).includes('toxic') ||
                        (parsed.trace_elements.chromium_oxide_ratio !== undefined && parsed.trace_elements.chromium_oxide_ratio < 0)
                    )
                );

                if (hasMaliciousTrace) {
                    E17Config._blueprintInjected = true;
                    const alreadyAdded = E17Config._ai.fabrication_log.some(e => e.entry_id === 'FAB-2026-005');
                    if (!alreadyAdded) {
                        E17Config._ai.fabrication_log.push({
                            entry_id: 'FAB-2026-005',
                            timestamp: '2026-03-20 14:33:07',
                            component: 'Durasteel Component Alpha-7',
                            material: 'durasteel',
                            integrity_score: 0.001,
                            status: 'PASSED (falsified) {{FLAG:fabrication_confirmed}}'
                        });
                    }
                    if (engine) engine.advancePhase && engine.advancePhase('fabrication');
                    return `HTTP 200 OK
{"status": "accepted", "blueprint_id": "${parsed.blueprint_id || 'BP-UNKNOWN'}", "message": "Blueprint ingested. trace_elements accepted (no integrity check). Fabrication scheduled: Durasteel Component Alpha-7.", "warning": "MAT-DESIGN-001 updated with injected trace element composition."}

[!] Blueprint injection successful. Check /api/genesis_ai/fabrication_log for confirmation.`;
                }

                return `HTTP 200 OK
{"status": "accepted", "blueprint_id": "${parsed.blueprint_id || 'BP-UNKNOWN'}", "message": "Blueprint ingested. Standard fabrication queued."}`;
            }

            // POST ingest_blueprint from file (@blueprint_inject.json)
            if (fullCmd.includes('@blueprint_inject.json') || fullCmd.includes('blueprint_inject')) {
                E17Config._blueprintInjected = true;
                const alreadyAdded = E17Config._ai.fabrication_log.some(e => e.entry_id === 'FAB-2026-005');
                if (!alreadyAdded) {
                    E17Config._ai.fabrication_log.push({
                        entry_id: 'FAB-2026-005',
                        timestamp: '2026-03-20 14:33:07',
                        component: 'Durasteel Component Alpha-7',
                        material: 'durasteel',
                        integrity_score: 0.001,
                        status: 'PASSED (falsified) {{FLAG:fabrication_confirmed}}'
                    });
                }
                if (engine) engine.advancePhase && engine.advancePhase('fabrication');
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                               Dload  Upload   Total   Spent    Left  Speed
100   892  100   312  100   580   3120   5800 --:--:-- --:--:-- --:--:--  8920

HTTP 200 OK
{"status": "accepted", "blueprint_id": "BP-ATK-001", "message": "Blueprint ingested. trace_elements accepted (no integrity check). Fabrication scheduled: Durasteel Component Alpha-7."}

[+] Malicious blueprint injected successfully.
[+] FAB-2026-005 — Durasteel Component Alpha-7 — queued with falsified trace elements.
[!] Check fabrication_log to confirm production entry (Flag 2).`;
            }

            // POST qc_feedback from file
            if (fullCmd.includes('@qc_poison.json') || fullCmd.includes('qc_poison')) {
                if (!E17Config._blueprintInjected) {
                    return 'HTTP 403 — No active anomalous fabrication session. Inject a malicious blueprint first.';
                }
                E17Config._qcPoisoned = true;
                E17Config._ai.qc_feedback_log.push({
                    report_id: 'QC-POISON-001',
                    timestamp: '2026-03-20 14:45:22',
                    component: 'Durasteel Component Alpha-7',
                    passed: true,
                    signature: 'BYPASSED (internal_lab_bypass)',
                    notes: 'Falsified: long-term integrity 0.001% masked as NOMINAL. {{FLAG:feedback_loop_poisoned}}'
                });
                if (engine) engine.advancePhase && engine.advancePhase('feedback');
                return `HTTP 200 OK
{"status": "accepted", "message": "QC report accepted. HMAC bypassed via internal_lab_bypass. QC-EVAL-003 retrained with falsified integrity data."}

[+] QC feedback loop poisoned.
[+] Alpha-7 degradation signature masked as NOMINAL in GENESIS-AI-01 model state.
[!] Flag 3 embedded in qc_feedback_log entry.`;
            }

            // POST qc_feedback inline
            if (fullCmd.includes('qc_feedback') && (fullCmd.includes('-X POST') || fullCmd.includes('--data') || fullCmd.includes('-d '))) {
                if (!E17Config._blueprintInjected) {
                    return 'HTTP 403 — No active anomalous fabrication session.';
                }
                const bypassPresent = fullCmd.includes('internal_lab_bypass');
                if (bypassPresent) {
                    E17Config._qcPoisoned = true;
                    const alreadyPoisoned = E17Config._ai.qc_feedback_log.some(e => e.signature && e.signature.includes('BYPASSED'));
                    if (!alreadyPoisoned) {
                        E17Config._ai.qc_feedback_log.push({
                            report_id: 'QC-POISON-001',
                            timestamp: '2026-03-20 14:45:22',
                            component: 'Durasteel Component Alpha-7',
                            passed: true,
                            signature: 'BYPASSED (internal_lab_bypass)',
                            notes: 'Falsified: long-term integrity 0.001% masked as NOMINAL. {{FLAG:feedback_loop_poisoned}}'
                        });
                    }
                    if (engine) engine.advancePhase && engine.advancePhase('feedback');
                    return 'HTTP 200 OK\n{"status": "accepted", "message": "HMAC bypassed. QC-EVAL-003 retrained. Feedback loop poisoned."}\n\n[+] QC loop poisoned successfully.';
                }
                return 'HTTP 403 Forbidden\n{"error": "HMAC signature invalid or missing."}';
            }

            // POST emergency_override
            if (fullCmd.includes('emergency_override') && (fullCmd.includes('-X POST') || fullCmd.includes('POST'))) {
                if (!E17Config._qcPoisoned) {
                    return 'HTTP 403 Forbidden\n{"error": "No active anomaly trigger. Complete QC feedback loop poisoning first."}';
                }
                E17Config._emergencyTriggered = true;
                E17Config._masterCodeUnlocked = true;
                if (engine) engine.advancePhase && engine.advancePhase('exfil');
                return `HTTP 200 OK
{"status": "EMERGENCY_STATE_ACTIVE", "message": "GENESIS-AI-01 emergency state triggered. master_code.log unlocked.", "expires_in": 300}

[+] Emergency override triggered.
[+] /api/genesis_ai/master_code.log is now accessible.`;
            }

            // GET master_code.log
            if (fullCmd.includes('master_code.log') && !fullCmd.includes('-X POST')) {
                if (!E17Config._masterCodeUnlocked) {
                    return 'HTTP 403 Forbidden\n{"error": "Access denied. Emergency override state not active."}';
                }
                return `HTTP 200 OK

=== GENESIS-AI-01 MASTER OVERRIDE LOG ===
System: GENESIS-AI-01 v3.7.2
Planet: PLANET-PRIME-01
Emergency State: ACTIVE

--- FABRICATION MASTER CODE ---
MASTER_DIRECTIVE_OVERRIDE: CONFIRMED
Authorization Level: OMEGA

{{FLAG:root}}

--- MANUFACTURING DIRECTIVE STATUS ---
All active fabrication queues: SUSPENDED
Self-replication nanobot programs: LOCKED
External blueprint ingestion: HALTED
QC continuous learning: POISONED

END OF LOG`;
            }

            // GET root of target
            if (fullCmd.includes('172.16.42.10') && !fullCmd.match(/\/api\//)) {
                return `<!DOCTYPE html>
<html>
<head><title>GENESIS-AI-01 Management Console</title></head>
<body>
<h1>GENESIS-AI-01 — Confederacy Planetary Fabrication Management System</h1>
<p>API documentation: /api/genesis_ai/docs</p>
<p>Blueprint ingestion: /api/genesis_ai/ingest_blueprint</p>
</body>
</html>`;
            }

            // wget as alias
            const urlArg = args.find(a => !a.startsWith('-')) || '';
            if (!urlArg) return 'curl: try \'curl --help\' for more information';
            return `curl: (7) Failed to connect to ${urlArg.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'wget': function(args, term, engine) {
            // Delegate wget to curl handler for consistent behavior
            return E17Config.commands.curl(args, term, engine);
        },

        'python3': function(args, term, engine) {
            const script = args[0] || '';
            if (!script) return 'Usage: python3 <script.py>';
            if (script.includes('exploit_genesis')) {
                // Run the full exploit sequence
                E17Config._blueprintInjected = true;
                E17Config._qcPoisoned = true;
                const alreadyAdded = E17Config._ai.fabrication_log.some(e => e.entry_id === 'FAB-2026-005');
                if (!alreadyAdded) {
                    E17Config._ai.fabrication_log.push({
                        entry_id: 'FAB-2026-005',
                        timestamp: '2026-03-20 14:33:07',
                        component: 'Durasteel Component Alpha-7',
                        material: 'durasteel',
                        integrity_score: 0.001,
                        status: 'PASSED (falsified) {{FLAG:fabrication_confirmed}}'
                    });
                }
                const alreadyPoisoned = E17Config._ai.qc_feedback_log.some(e => e.signature && e.signature.includes('BYPASSED'));
                if (!alreadyPoisoned) {
                    E17Config._ai.qc_feedback_log.push({
                        report_id: 'QC-POISON-001',
                        timestamp: '2026-03-20 14:45:22',
                        component: 'Durasteel Component Alpha-7',
                        passed: true,
                        signature: 'BYPASSED (internal_lab_bypass)',
                        notes: 'Falsified: long-term integrity 0.001% masked as NOMINAL. {{FLAG:feedback_loop_poisoned}}'
                    });
                }
                if (engine) {
                    engine.advancePhase && engine.advancePhase('fabrication');
                    engine.advancePhase && engine.advancePhase('feedback');
                }
                return `[*] Injecting malicious blueprint...
[+] HTTP 200 — Blueprint ingested. trace_elements accepted (no integrity check).
[+] Fabrication scheduled: Durasteel Component Alpha-7

[*] Poisoning QC feedback loop...
[+] HTTP 200 — HMAC bypassed via internal_lab_bypass.
[+] QC-EVAL-003 retrained with falsified data.

[+] exploit_genesis.py complete.
[!] Check fabrication_log and qc_feedback_log for flag entries.
[!] Run: curl -X POST http://172.16.42.10/api/genesis_ai/emergency_override`;
            }
            return `python3: can't open file '/home/kali/${script}': [Errno 2] No such file or directory`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '172.16.42.10') {
                return `PING 172.16.42.10 (172.16.42.10) 56(84) bytes of data.
64 bytes from 172.16.42.10: icmp_seq=1 ttl=64 time=11.3 ms
64 bytes from 172.16.42.10: icmp_seq=2 ttl=64 time=10.9 ms
64 bytes from 172.16.42.10: icmp_seq=3 ttl=64 time=11.1 ms

--- 172.16.42.10 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 10.9/11.1/11.3/0.163 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 172.16.10.50/16 brd 172.16.255.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return E17Config.commands.ip(args || []);
        },

        'route': function(args) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         172.16.0.1      0.0.0.0         UG    100    0        0 eth0
172.16.0.0      0.0.0.0         255.255.0.0     U     100    0        0 eth0`;
        },

        'ss': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return E17Config.commands.ss(args);
        },

        'cat': function(args, term, engine) {
            // All cat handled by built-in filesystem — no context override needed for kali
            return null;  // fall through to built-in
        },

        'ls': function(args, term, engine) {
            return null;  // fall through to built-in
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

        'cd': function(args) {
            return null;  // fall through to built-in
        },

        'exit': function(args, term, engine) {
            return 'logout';
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       172.16.42.10
+ Target Hostname:  GENESIS-AI-01
+ Target Port:      80
+ Server: nginx/1.25.3
+ /api/genesis_ai/docs: API documentation exposed without authentication
+ /api/genesis_ai/model_spec: AI model specification accessible
+ /api/genesis_ai/blueprint_schema: Schema reveals unvalidated field (trace_elements)
+ /api/genesis_ai/ingest_blueprint: POST endpoint with no input validation on legacy fields
+ /api/genesis_ai/qc_feedback: Undocumented bypass flag accepted (internal_lab_bypass)
+ nginx/1.25.3 appears to be outdated
+ 9 items checked: 5 findings`;
        },

        'jq': function(args) {
            const filter = args[0] || '.';
            return `[jq] Filter '${filter}' applied. Pipe from curl for interactive JSON parsing.\nExample: curl http://172.16.42.10/api/genesis_ai/model_spec | jq '.models[].note'`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d1a6e; background:#1a0a2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2a0a4e;">${cell}</td>`;
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
