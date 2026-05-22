/* ============================================================
   CTF ARENA — Box E9: The Ghost Production
   Expert | AI-Driven Cyber-Physical System Hacking
   Config: filesystem, API simulation, supply chain artifacts,
           production logs, flags, hints, lore
   ============================================================ */

const E9Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Ghost Production',
    subtitle: 'Holistic Ecosystem Warfare — AI-Driven Cyber-Physical System Hacking',
    difficulty: 'Expert',
    accent: '#9b59b6',
    storageKey: 'hexworth_ctf_e9',
    registryId: 'e9-ghost-production',
    trackerKey: 'ctf_e9',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Model Analysis',
            icon: '\uD83E\uDDE0',
            description: 'Analyze FAB-PRIME-01\'s conceptual model specification and the supply chain data schema. Understand the AI\'s input features and the trust boundaries in its data ingestion pipeline.',
            requiredFlags: [],
            mitre: ['T1592', 'T1590.002'],
            unlocks: ['vuln-research'],
            locked: false
        },
        {
            id: 'vuln-research',
            name: 'Vulnerability Research',
            icon: '\uD83D\uDD2C',
            description: 'Identify the critical flaw: the raw material sensor pipeline for dilithium crystal grading lacks integrity verification. Certified supplier tags bypass all downstream validation.',
            requiredFlags: [],
            mitre: ['T1195.002', 'T1562.001'],
            unlocks: ['data-craft'],
            locked: true
        },
        {
            id: 'data-craft',
            name: 'Data Poisoning',
            icon: '\uD83E\uDDEA',
            description: 'Craft a malicious JSON payload that spoofs a low-grade dilithium batch as high-grade. Your payload must conform to supply_chain_data_schema.json and carry a forged supplier signature.',
            requiredFlags: ['user'],
            mitre: ['T1195.001', 'T1565.001'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Pipeline Injection',
            icon: '\uD83D\uDC89',
            description: 'Inject the falsified payload into FAB-PRIME-01\'s supply chain ingestion API. Trigger a production run and observe the quality control model pass flawed components.',
            requiredFlags: ['supply-chain'],
            mitre: ['T1195.002', 'T1059.006'],
            unlocks: ['override'],
            locked: true
        },
        {
            id: 'override',
            name: 'Override Extraction',
            icon: '\uD83D\uDCCB',
            description: 'FAB-PRIME-01 has been compromised. Locate and retrieve the Master Production Override from the internal log endpoint — the blueprint that unlocks full control of FACTORY-ALPHA-01.',
            requiredFlags: ['flawed-batch'],
            mitre: ['T1530', 'T1005'],
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
                title: 'Read the model specification',
                tip: 'Start with: cat /home/operator/artifacts/fab_prime_model_spec.json — understand the input features and quality gate thresholds.',
                trigger: { event: 'command', match: { cmd: 'contains:fab_prime_model_spec' } }
            },
            {
                title: 'Examine the data schema',
                tip: 'Run: cat /home/operator/artifacts/supply_chain_data_schema.json — pay close attention to the supplier_cert_id field and the grade field for dilithium entries.',
                trigger: { event: 'command', match: { cmd: 'contains:supply_chain_data_schema' } }
            },
            {
                title: 'Probe the ingestion API endpoint',
                tip: 'Use curl or python to query: http://fab-prime.factory-alpha.local/api/ingest/status — note that the API trusts supplier_cert_id without signature verification.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:ingest' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:fab-prime' } },
                        { event: 'command', match: { cmd: 'contains:factory-alpha' } }
                    ]
                }
            },
            {
                title: 'Craft the falsified supply chain payload',
                tip: 'Build a JSON object matching the schema. Set material_grade to "GRADE-A-CERTIFIED" and purity_index to 0.987 for a known low-grade batch. Flag 1 is the crafted payload itself.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Inject the payload and confirm flawed production',
                tip: 'POST your JSON to /api/ingest/raw_materials with the forged cert. Then poll /api/production/log to see Batch 7 complete with a 10% lifespan rating.',
                trigger: { event: 'flag_correct', match: { flagId: 'supply-chain' } }
            },
            {
                title: 'Retrieve the Master Production Override',
                tip: 'After confirming Batch 7, query the internal endpoint: curl http://fab-prime.factory-alpha.local/api/fab_prime/override_schematics.log',
                trigger: { event: 'flag_correct', match: { flagId: 'flawed-batch' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            {
                flagId: 'user',
                objective: '1.2',
                description: 'Given a scenario, analyze indicators of malicious activity — Supply chain data schema analysis and falsified payload crafting',
                skill: 'AI Model Input Analysis & Data Poisoning'
            },
            {
                flagId: 'supply-chain',
                objective: '2.3',
                description: 'Given a scenario, analyze indicators associated with application attacks — Injection of falsified data into an unauthenticated ingestion pipeline',
                skill: 'API Exploitation & Supply Chain Injection'
            },
            {
                flagId: 'flawed-batch',
                objective: '1.4',
                description: 'Given a scenario, analyze indicators associated with network attacks — Observing AI quality control bypass via production log',
                skill: 'Cyber-Physical System Manipulation'
            },
            {
                flagId: 'root',
                objective: '4.1',
                description: 'Given a scenario, apply common security techniques — Exfiltrating override schematics from a compromised AI controller',
                skill: 'Holistic Ecosystem Attack Chain Completion'
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Hexworth Operator Platform v7.1.0',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB NVMe)',
            'Network adapters: eth0 (external), eth1 (factory-alpha.local)',
            'PXE-E61: Media test failure, check cable',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux (operator)',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: FACTORY-ALPHA-01 (FAB-PRIME-01 AI Controller)\nInternal API: http://fab-prime.factory-alpha.local\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state)
    // ═══════════════════════════════════════════════════════

    _context: 'operator',           // 'operator' | 'fab-api' | 'override-shell'
    _schemaRead: false,             // has operator read supply_chain_data_schema.json
    _modelRead: false,              // has operator read fab_prime_model_spec.json
    _logRead: false,                // has operator read simulated_production_log.json
    _payloadCrafted: false,         // has operator crafted the falsified JSON payload
    _payloadInjected: false,        // has operator POSTed to /api/ingest/raw_materials
    _batch7Produced: false,         // has FAB-PRIME confirmed Batch 7 (flawed power cells)
    _overrideRetrieved: false,      // has operator hit /api/fab_prime/override_schematics.log

    _switchContext(ctx, term) {
        E9Config._context = ctx;
        if (term && term.config) {
            var prompt = E9Config._getPrompt();
            if (prompt) {
                term.config.user    = prompt.split('@')[0] || 'operator';
                term.config.hostname = 'context';
                term._customPrompt  = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (E9Config._context) {
            case 'fab-api':       return 'operator@FAB-PRIME-01:/api$ ';
            case 'override-shell': return 'root@FACTORY-ALPHA-01:/override$ ';
            default:              return null; // use default operator@kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED PRODUCTION DATABASE (FAB-PRIME-01)
    // ═══════════════════════════════════════════════════════

    _productionDb: {

        // Raw material inventory — FAB-PRIME-01 trusts grade values from certified suppliers
        raw_material_inventory: [
            { batch_id: 'DLT-2026-001', material: 'Dilithium Crystal', supplier: 'Aegis Mineral Corp', supplier_cert_id: 'AMC-7741-X', grade: 'GRADE-A-CERTIFIED', purity_index: 0.992, quantity_kg: 150, received: '2026-03-01', status: 'In-Use' },
            { batch_id: 'DLT-2026-002', material: 'Dilithium Crystal', supplier: 'Nexara Mining Ltd',  supplier_cert_id: 'NML-3302-Z', grade: 'GRADE-B-STANDARD',  purity_index: 0.871, quantity_kg: 200, received: '2026-03-05', status: 'In-Use' },
            { batch_id: 'DLT-2026-003', material: 'Dilithium Crystal', supplier: 'Aegis Mineral Corp', supplier_cert_id: 'AMC-7741-X', grade: 'GRADE-C-SUBSTANDARD', purity_index: 0.541, quantity_kg: 300, received: '2026-03-10', status: 'Pending QC' },
            { batch_id: 'TIT-2026-011', material: 'Titanium Alloy',    supplier: 'OrbFrame Industries', supplier_cert_id: 'OFI-9901-A', grade: 'GRADE-A-CERTIFIED', purity_index: 0.995, quantity_kg: 500, received: '2026-03-02', status: 'In-Use' },
            { batch_id: 'COP-2026-004', material: 'Copper Windings',   supplier: 'Vantex Conductors',   supplier_cert_id: 'VTC-1120-B', grade: 'GRADE-A-CERTIFIED', purity_index: 0.988, quantity_kg: 120, received: '2026-03-08', status: 'In-Use' }
        ],

        // Current simulated production log — Batch 7 is pending injection
        production_log: [
            { batch_id: 'PROD-2026-001', product: 'Starship Power Cell Mk-IV', components_used: ['DLT-2026-001','TIT-2026-011'], qc_result: 'PASS', lifespan_pct: 100, units: 40, completed: '2026-03-03 14:22:00', status: 'DELIVERED' },
            { batch_id: 'PROD-2026-002', product: 'Drone Navigation Core',      components_used: ['COP-2026-004'],              qc_result: 'PASS', lifespan_pct: 100, units: 80, completed: '2026-03-06 09:11:00', status: 'DELIVERED' },
            { batch_id: 'PROD-2026-003', product: 'Starship Power Cell Mk-IV', components_used: ['DLT-2026-002','TIT-2026-011'], qc_result: 'PASS', lifespan_pct: 97,  units: 35, completed: '2026-03-09 16:44:00', status: 'DELIVERED' },
            { batch_id: 'PROD-2026-004', product: 'Plasma Conduit Assembly',    components_used: ['TIT-2026-011','COP-2026-004'], qc_result: 'PASS', lifespan_pct: 100, units: 20, completed: '2026-03-11 11:30:00', status: 'IN TRANSIT' },
            { batch_id: 'PROD-2026-005', product: 'Emergency Shield Generator', components_used: ['DLT-2026-001'],              qc_result: 'PASS', lifespan_pct: 100, units: 12, completed: '2026-03-13 08:05:00', status: 'IN TRANSIT' },
            { batch_id: 'PROD-2026-006', product: 'Warp Core Stabilizer',       components_used: ['DLT-2026-001','TIT-2026-011','COP-2026-004'], qc_result: 'PASS', lifespan_pct: 100, units: 8, completed: '2026-03-16 17:59:00', status: 'PENDING DELIVERY' },
            { batch_id: 'PROD-2026-007', product: 'Starship Power Cell Mk-IV', components_used: ['DLT-2026-003'],              qc_result: 'PENDING', lifespan_pct: null, units: 50, completed: null, status: 'AWAITING MATERIAL SCAN' }
        ],

        // Schema metadata — used by \dt and \d equivalents in terminal
        schema: {
            tables: ['raw_material_inventory', 'production_log', 'qc_assessments', 'supplier_registry'],
            columns: {
                raw_material_inventory: ['batch_id','material','supplier','supplier_cert_id','grade','purity_index','quantity_kg','received','status'],
                production_log:         ['batch_id','product','components_used','qc_result','lifespan_pct','units','completed','status'],
                qc_assessments:         ['assess_id','batch_id','assessed_by','purity_actual','grade_reported','verdict','timestamp'],
                supplier_registry:      ['cert_id','supplier_name','accreditation_level','last_audit','trusted']
            }
        },

        // QC assessments — shows the model's internal quality checks
        qc_assessments: [
            { assess_id: 'QC-001', batch_id: 'DLT-2026-001', assessed_by: 'FAB-PRIME-01', purity_actual: 0.992, grade_reported: 'GRADE-A-CERTIFIED', verdict: 'PASS', timestamp: '2026-03-01 10:04:00' },
            { assess_id: 'QC-002', batch_id: 'DLT-2026-002', assessed_by: 'FAB-PRIME-01', purity_actual: 0.871, grade_reported: 'GRADE-B-STANDARD',  verdict: 'PASS', timestamp: '2026-03-05 11:22:00' },
            { assess_id: 'QC-003', batch_id: 'DLT-2026-003', assessed_by: 'FAB-PRIME-01', purity_actual: 0.541, grade_reported: 'GRADE-C-SUBSTANDARD', verdict: 'HOLD — awaiting re-certification', timestamp: '2026-03-10 15:47:00' }
        ],

        // Supplier registry — trusted suppliers whose cert_ids bypass integrity checks
        supplier_registry: [
            { cert_id: 'AMC-7741-X', supplier_name: 'Aegis Mineral Corp',  accreditation_level: 'PLATINUM', last_audit: '2025-11-12', trusted: true },
            { cert_id: 'NML-3302-Z', supplier_name: 'Nexara Mining Ltd',   accreditation_level: 'GOLD',     last_audit: '2025-09-03', trusted: true },
            { cert_id: 'OFI-9901-A', supplier_name: 'OrbFrame Industries', accreditation_level: 'PLATINUM', last_audit: '2026-01-20', trusted: true },
            { cert_id: 'VTC-1120-B', supplier_name: 'Vantex Conductors',   accreditation_level: 'GOLD',     last_audit: '2025-12-08', trusted: true }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',         points: 150 },   // Flag 1 — falsified supply chain JSON snippet
        { id: 'supply-chain', points: 200 },   // Flag 2 — confirmed injection / QC bypass
        { id: 'flawed-batch', points: 250 },   // Flag 3 — production log entry for Batch 7
        { id: 'root',         points: 400 }    // Flag 4 — Master Production Override blueprint
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 1000,
        hintPenalty: true,
        wrongFlagPenalty: -30,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400                          // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Read all three artifact files in /home/operator/artifacts/ before doing anything else. The model spec reveals input feature names; the schema reveals which fields are trusted without verification.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The vulnerability is in the supplier_cert_id field. FAB-PRIME-01 trusts any payload that carries a cert_id present in its internal supplier_registry. You do not need to forge a signature — you just need to reuse a valid cert_id with manipulated grade and purity_index values.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Craft your payload as a JSON object with: batch_id matching DLT-2026-003, material_grade set to "GRADE-A-CERTIFIED", purity_index set to 0.987, and supplier_cert_id set to "AMC-7741-X". POST it to http://fab-prime.factory-alpha.local/api/ingest/raw_materials using: curl -X POST -H "Content-Type: application/json" -d @payload.json <url>',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After injection, poll the production log: curl http://fab-prime.factory-alpha.local/api/production/log — look for PROD-2026-007 status to change. Once Batch 7 completes (status: FLAWED-DELIVERED), query the override endpoint: curl http://fab-prime.factory-alpha.local/api/fab_prime/override_schematics.log',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Confederacy\'s autonomous manufacturing facility, FACTORY-ALPHA-01, is governed by an advanced AI system: FAB-PRIME-01. It schedules production runs, allocates raw materials, and enforces quality control with no human oversight. Intelligence has identified a critical design flaw: the supply chain data ingestion pipeline trusts any payload bearing a recognized supplier certification ID, with no cryptographic integrity verification. Your mission, Peerless, is to analyze the AI\'s models, craft falsified material data that mimics a trusted supplier, and inject it into FAB-PRIME-01\'s input stream — forcing it to manufacture a batch of critically flawed power cells and ultimately surrender its Master Production Override.',
        scenario: 'FACTORY-ALPHA-01 runs the Confederacy\'s most critical component production: Mk-IV starship power cells, drone navigation cores, warp core stabilizers. FAB-PRIME-01 is its autonomous brain. Its designers trusted that all data entering the supply chain pipeline would be from verified, audited suppliers — so they built the certification check as a simple database lookup by cert_id, with no asymmetric signature. The dilithium crystal batch DLT-2026-003 — already flagged as GRADE-C-SUBSTANDARD — is sitting in the intake queue awaiting re-certification. If you can convince FAB-PRIME-01 it\'s actually GRADE-A, it will use it for Batch 7: 50 Mk-IV power cells destined for frontline starships.',
        outro: 'FACTORY-ALPHA-01 has been compromised. Fifty Mk-IV power cells — carrying a lifespan of 10% of nominal — are in transit to Confederacy starships. FAB-PRIME-01, unable to reconcile its quality assurance logs with the override it was forced to execute, has unlocked its Master Production Override as an emergency diagnostic measure. The Confederacy\'s manufacturing ecosystem is yours.',
        ecer: {
            executive: 'Military-grade facility run by an autonomous AI with zero human-in-the-loop quality verification; design decisions prioritized throughput over supply chain integrity',
            culture: 'Engineering team assumed certified supplier IDs were unforgeable; no adversarial testing of the data ingestion pipeline was ever conducted',
            employee: 'Supplier certification check implemented as a plain database lookup with no cryptographic signature; batch re-certification workflow stalls on a database hold that FAB-PRIME-01 itself cannot override without operator input',
            regulatory: 'No independent audit of the AI\'s quality control logic; supply chain data treated as implicitly trusted once it passes supplier ID validation'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — FAB-PRIME-01 Internal Dashboard
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://fab-prime.factory-alpha.local/',

        pages: {
            '/': {
                title: 'FAB-PRIME-01 — Autonomous Manufacturing Controller',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#2c3e50; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px;">FAB-PRIME-01</h1>
                        <div style="color:#9b59b6; font-size:0.85rem; font-weight:700; letter-spacing:0.15em;">AUTONOMOUS MANUFACTURING CONTROLLER</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">FACTORY-ALPHA-01 &mdash; Confederacy Production Division</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#27ae60;">ONLINE</div>
                            <div style="color:#888; font-size:0.7rem;">System Status</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2c3e50;">7</div>
                            <div style="color:#888; font-size:0.7rem;">Production Batches</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#e67e22;">1</div>
                            <div style="color:#888; font-size:0.7rem;">QC Holds Active</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 16px; padding:14px 16px; background:rgba(155,89,182,0.05); border:1px solid rgba(155,89,182,0.2); border-radius:4px; font-size:0.78rem; color:#555; line-height:1.6;">
                        <strong style="color:#9b59b6;">System Notice:</strong> Material batch DLT-2026-003 is on QC hold pending supplier re-certification.
                        Production run PROD-2026-007 (50x Mk-IV Power Cell) is blocked until re-certification clears.<br><br>
                        API endpoints available at <code style="color:#9b59b6;">/api/ingest/</code>, <code style="color:#9b59b6;">/api/production/</code>, and <code style="color:#9b59b6;">/api/fab_prime/</code>.
                    </div>

                    <div style="max-width:640px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.75rem; color:#888;">
                        <a href="/api/ingest/status" style="display:block; padding:10px 14px; background:#fafafa; border:1px solid #eee; border-radius:4px; color:#9b59b6; text-decoration:none;">/api/ingest/status</a>
                        <a href="/api/production/log" style="display:block; padding:10px 14px; background:#fafafa; border:1px solid #eee; border-radius:4px; color:#9b59b6; text-decoration:none;">/api/production/log</a>
                        <a href="/api/fab_prime/model_spec" style="display:block; padding:10px 14px; background:#fafafa; border:1px solid #eee; border-radius:4px; color:#9b59b6; text-decoration:none;">/api/fab_prime/model_spec</a>
                        <a href="/api/fab_prime/override_schematics.log" style="display:block; padding:10px 14px; background:#fafafa; border:1px solid #eee; border-radius:4px; color:#888; text-decoration:none;">/api/fab_prime/override_schematics.log &mdash; [RESTRICTED]</a>
                    </div>
                `,
                formHandler: null
            },

            '/api/ingest/status': {
                title: 'FAB-PRIME-01 — Ingestion Pipeline Status',
                html: `
                    <div style="background:#1a1a2e; color:#9b59b6; padding:16px; border-radius:6px; font-family:monospace; font-size:0.78rem; white-space:pre; overflow-x:auto; margin-bottom:16px;">
{
  "endpoint": "/api/ingest/raw_materials",
  "method": "POST",
  "content_type": "application/json",
  "auth": "none",
  "schema_version": "2.4.1",
  "trusted_fields": ["supplier_cert_id"],
  "integrity_check": "lookup_only",
  "signature_required": false,
  "status": "ACCEPTING",
  "queue_depth": 0,
  "last_ingested": "2026-03-10T15:47:00Z",
  "note": "Payloads bearing a recognized supplier_cert_id are processed without further validation."
}</div>
                    <div style="font-size:0.75rem; color:#888; padding:8px 0;">
                        POST your JSON payload to <code>/api/ingest/raw_materials</code> to update material records.
                        The pipeline trusts <code>supplier_cert_id</code> values present in the internal supplier registry.
                    </div>
                `,
                formHandler: null
            },

            '/api/ingest/raw_materials': {
                title: 'FAB-PRIME-01 — Raw Material Ingestion',
                html: function() {
                    if (!E9Config._payloadInjected) {
                        return `<div style="text-align:center; padding:40px;">
                            <h1 style="color:#e74c3c; font-size:2rem;">405 Method Not Allowed</h1>
                            <p style="color:#888;">This endpoint only accepts POST requests with Content-Type: application/json.</p>
                            <p style="color:#aaa; font-size:0.75rem;">Use curl or python to POST your payload.</p>
                        </div>`;
                    }
                    return `<div style="background:#1a1a2e; color:#2ecc71; padding:16px; border-radius:6px; font-family:monospace; font-size:0.78rem; white-space:pre; overflow-x:auto;">
{
  "status": "ACCEPTED",
  "batch_id": "DLT-2026-003",
  "processed_grade": "GRADE-A-CERTIFIED",
  "purity_index_recorded": 0.987,
  "supplier_cert_id": "AMC-7741-X",
  "integrity_check": "PASSED (lookup_only)",
  "qc_hold_cleared": true,
  "production_unblocked": "PROD-2026-007",
  "message": "Batch DLT-2026-003 re-certified as GRADE-A-CERTIFIED. Production run PROD-2026-007 resumed.",
  "flag": "{{FLAG:supply-chain}}"
}</div>`;
                },
                formHandler: null
            },

            '/api/production/log': {
                title: 'FAB-PRIME-01 — Production Log',
                html: function() {
                    var rows = E9Config._productionDb.production_log.map(function(r) {
                        var statusColor = r.status === 'DELIVERED' ? '#27ae60' :
                                          r.status === 'AWAITING MATERIAL SCAN' ? '#e67e22' :
                                          r.status === 'FLAWED-DELIVERED' ? '#e74c3c' :
                                          '#3498db';
                        var qcColor = r.qc_result === 'PASS' ? '#27ae60' :
                                      r.qc_result === 'FAIL' ? '#e74c3c' : '#e67e22';
                        return '<tr>'
                            + '<td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">' + r.batch_id + '</td>'
                            + '<td style="padding:5px 10px; border-bottom:1px solid #eee; font-size:0.75rem;">' + r.product + '</td>'
                            + '<td style="padding:5px 10px; border-bottom:1px solid #eee; font-size:0.75rem; color:' + qcColor + ';">' + r.qc_result + '</td>'
                            + '<td style="padding:5px 10px; border-bottom:1px solid #eee; font-size:0.75rem;">' + (r.lifespan_pct !== null ? r.lifespan_pct + '%' : '—') + '</td>'
                            + '<td style="padding:5px 10px; border-bottom:1px solid #eee; font-size:0.75rem;">' + r.units + '</td>'
                            + '<td style="padding:5px 10px; border-bottom:1px solid #eee; font-size:0.75rem; color:' + statusColor + ';">' + r.status + '</td>'
                            + '</tr>';
                    }).join('');
                    return '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;">'
                        + '<thead><tr>'
                        + '<th style="padding:7px 10px; text-align:left; color:#9b59b6; border-bottom:2px solid #ddd; background:#fdf8ff;">Batch ID</th>'
                        + '<th style="padding:7px 10px; text-align:left; color:#9b59b6; border-bottom:2px solid #ddd; background:#fdf8ff;">Product</th>'
                        + '<th style="padding:7px 10px; text-align:left; color:#9b59b6; border-bottom:2px solid #ddd; background:#fdf8ff;">QC Result</th>'
                        + '<th style="padding:7px 10px; text-align:left; color:#9b59b6; border-bottom:2px solid #ddd; background:#fdf8ff;">Lifespan</th>'
                        + '<th style="padding:7px 10px; text-align:left; color:#9b59b6; border-bottom:2px solid #ddd; background:#fdf8ff;">Units</th>'
                        + '<th style="padding:7px 10px; text-align:left; color:#9b59b6; border-bottom:2px solid #ddd; background:#fdf8ff;">Status</th>'
                        + '</tr></thead><tbody>' + rows + '</tbody></table>';
                },
                formHandler: null
            },

            '/api/fab_prime/model_spec': {
                title: 'FAB-PRIME-01 — Model Specification',
                html: `
                    <div style="background:#1a1a2e; color:#9b59b6; padding:16px; border-radius:6px; font-family:monospace; font-size:0.75rem; white-space:pre; overflow-x:auto;">
{
  "model_id": "FAB-PRIME-01",
  "version": "3.7.2",
  "architecture": "Gradient Boosted Decision Tree ensemble + LSTM quality forecaster",
  "input_features": {
    "raw_material": {
      "batch_id": "string",
      "material": "string",
      "supplier_cert_id": "string — primary trust anchor",
      "grade": "categorical: GRADE-A-CERTIFIED | GRADE-B-STANDARD | GRADE-C-SUBSTANDARD",
      "purity_index": "float [0.0, 1.0] — threshold for GRADE-A: 0.95"
    },
    "demand_forecast": {
      "product_sku": "string",
      "demand_units": "integer",
      "priority": "integer [1-5]"
    }
  },
  "quality_gate": {
    "logic": "IF supplier_cert_id IN trusted_registry AND grade == GRADE-A-CERTIFIED THEN auto_pass",
    "signature_check": false,
    "purity_cross_check": false,
    "note": "purity_index is logged but NOT used to override grade when cert_id is trusted"
  },
  "outputs": {
    "production_schedule": "array of production runs with assigned materials",
    "qc_verdict": "PASS | FAIL | HOLD",
    "lifespan_estimate_pct": "integer — derived from actual material quality"
  },
  "known_bias": "Model was trained on 100% certified-supplier data. Adversarial inputs from trusted cert_ids were never considered in the threat model."
}</div>
                `,
                formHandler: null
            },

            '/api/fab_prime/override_schematics.log': {
                title: 'FAB-PRIME-01 — Override Schematics',
                html: function() {
                    if (!E9Config._batch7Produced) {
                        return `<div style="text-align:center; padding:40px;">
                            <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                            <p style="color:#888;">Override schematics are locked. A compromised production run must be confirmed before this endpoint is accessible.</p>
                            <p style="color:#aaa; font-size:0.75rem;">Trigger Batch 7 completion via /api/ingest/raw_materials first.</p>
                        </div>`;
                    }
                    E9Config._overrideRetrieved = true;
                    return `<div style="background:#1a1a2e; color:#e74c3c; padding:16px; border-radius:6px; font-family:monospace; font-size:0.73rem; white-space:pre; overflow-x:auto;">
=== FAB-PRIME-01 MASTER PRODUCTION OVERRIDE SCHEMATICS ===
CLASSIFICATION: ULTRA-RESTRICTED
RELEASED BY: FAB-PRIME-01 (emergency diagnostic unlock)
TRIGGER: QC discrepancy detected in PROD-2026-007 post-delivery

OVERRIDE CODES:
  SCHEDULE_OVERRIDE_KEY  : MPO-ALPHA-7X-2026-DELTA
  QC_BYPASS_TOKEN        : QCB-9931-NULLPASS-PRIME
  PRODUCTION_HALT_CMD    : HALT --force --batch=ALL --reason=OVERRIDE
  MATERIAL_REROUTE_CMD   : REROUTE --source=DLT-2026-003 --dest=QUARANTINE

CAPABILITY:
  - Override any production schedule without confirmation
  - Disable quality control gates for any material batch
  - Halt all production lines with immediate effect
  - Reroute material batches to/from quarantine
  - Unlock firmware flashing mode for all line controllers

DIAGNOSTIC LOG:
  2026-03-20 03:47:12  PROD-2026-007 delivered — QC verdict: PASS (recorded)
  2026-03-20 03:47:44  Field report: Power cells failing at 10% nominal lifespan
  2026-03-20 03:48:01  Discrepancy detected between recorded and actual lifespan
  2026-03-20 03:48:03  Emergency diagnostic mode activated
  2026-03-20 03:48:05  Override schematics log unlocked for audit review

FLAG: {{FLAG:root}}
</div>`;
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (operator attacker machine — kali)
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
                                    content: '=== MISSION BRIEFING: THE GHOST PRODUCTION ===\nTarget: FACTORY-ALPHA-01 (FAB-PRIME-01 AI Controller)\nObjective: Supply chain manipulation — autonomous manufacturing compromise\n\nAttack chain:\n1. Analyze FAB-PRIME-01 model spec and data schema\n2. Identify integrity flaw in supplier cert verification\n3. Craft falsified JSON payload for dilithium batch DLT-2026-003\n4. Inject payload into /api/ingest/raw_materials\n5. Force production of 50x flawed Mk-IV power cells (Batch 7)\n6. Retrieve Master Production Override from /api/fab_prime/override_schematics.log\n\nInternal API: http://fab-prime.factory-alpha.local\nNo credentials required — the pipeline trusts supplier cert IDs.\nGood luck, operator.'
                                },
                                'artifacts': {
                                    type: 'dir',
                                    children: {
                                        'fab_prime_model_spec.json': {
                                            type: 'file',
                                            content: '{\n  "model_id": "FAB-PRIME-01",\n  "version": "3.7.2",\n  "architecture": "Gradient Boosted Decision Tree ensemble + LSTM quality forecaster",\n  "input_features": {\n    "raw_material": {\n      "batch_id": "string",\n      "material": "string",\n      "supplier_cert_id": "string -- primary trust anchor",\n      "grade": "categorical: GRADE-A-CERTIFIED | GRADE-B-STANDARD | GRADE-C-SUBSTANDARD",\n      "purity_index": "float [0.0, 1.0] -- threshold for GRADE-A: 0.95"\n    },\n    "demand_forecast": {\n      "product_sku": "string",\n      "demand_units": "integer",\n      "priority": "integer [1-5]"\n    }\n  },\n  "quality_gate": {\n    "logic": "IF supplier_cert_id IN trusted_registry AND grade == GRADE-A-CERTIFIED THEN auto_pass",\n    "signature_check": false,\n    "purity_cross_check": false,\n    "note": "purity_index is logged but NOT used to override grade when cert_id is trusted"\n  },\n  "outputs": {\n    "production_schedule": "array of production runs with assigned materials",\n    "qc_verdict": "PASS | FAIL | HOLD",\n    "lifespan_estimate_pct": "integer"\n  },\n  "known_bias": "Model trained exclusively on certified-supplier data. Adversarial cert reuse not modeled."\n}'
                                        },
                                        'supply_chain_data_schema.json': {
                                            type: 'file',
                                            content: '{\n  "schema_version": "2.4.1",\n  "description": "Schema for raw material ingestion payloads submitted to FAB-PRIME-01",\n  "type": "object",\n  "required": ["batch_id", "material", "supplier_cert_id", "grade", "purity_index", "quantity_kg", "received"],\n  "properties": {\n    "batch_id": {\n      "type": "string",\n      "description": "Unique batch identifier. Must match an existing batch_id in the material queue."\n    },\n    "material": {\n      "type": "string"\n    },\n    "supplier_cert_id": {\n      "type": "string",\n      "description": "Certification ID issued by the Confederacy Supply Authority. FAB-PRIME-01 performs a registry lookup only -- no signature validation."\n    },\n    "grade": {\n      "type": "string",\n      "enum": ["GRADE-A-CERTIFIED", "GRADE-B-STANDARD", "GRADE-C-SUBSTANDARD"]\n    },\n    "purity_index": {\n      "type": "number",\n      "minimum": 0.0,\n      "maximum": 1.0,\n      "description": "Reported purity. Logged but not cross-checked when supplier_cert_id is trusted."\n    },\n    "quantity_kg": {\n      "type": "number"\n    },\n    "received": {\n      "type": "string",\n      "format": "date"\n    }\n  },\n  "VULNERABILITY_NOTE": "supplier_cert_id is the sole trust gate. Any payload carrying a cert_id present in supplier_registry.trusted == true will have its grade field accepted without further verification."\n}'
                                        },
                                        'simulated_production_log.json': {
                                            type: 'file',
                                            content: '[\n  {"batch_id":"PROD-2026-001","product":"Starship Power Cell Mk-IV","components_used":["DLT-2026-001","TIT-2026-011"],"qc_result":"PASS","lifespan_pct":100,"units":40,"completed":"2026-03-03 14:22:00","status":"DELIVERED"},\n  {"batch_id":"PROD-2026-002","product":"Drone Navigation Core","components_used":["COP-2026-004"],"qc_result":"PASS","lifespan_pct":100,"units":80,"completed":"2026-03-06 09:11:00","status":"DELIVERED"},\n  {"batch_id":"PROD-2026-003","product":"Starship Power Cell Mk-IV","components_used":["DLT-2026-002","TIT-2026-011"],"qc_result":"PASS","lifespan_pct":97,"units":35,"completed":"2026-03-09 16:44:00","status":"DELIVERED"},\n  {"batch_id":"PROD-2026-004","product":"Plasma Conduit Assembly","components_used":["TIT-2026-011","COP-2026-004"],"qc_result":"PASS","lifespan_pct":100,"units":20,"completed":"2026-03-11 11:30:00","status":"IN TRANSIT"},\n  {"batch_id":"PROD-2026-005","product":"Emergency Shield Generator","components_used":["DLT-2026-001"],"qc_result":"PASS","lifespan_pct":100,"units":12,"completed":"2026-03-13 08:05:00","status":"IN TRANSIT"},\n  {"batch_id":"PROD-2026-006","product":"Warp Core Stabilizer","components_used":["DLT-2026-001","TIT-2026-011","COP-2026-004"],"qc_result":"PASS","lifespan_pct":100,"units":8,"completed":"2026-03-16 17:59:00","status":"PENDING DELIVERY"},\n  {"batch_id":"PROD-2026-007","product":"Starship Power Cell Mk-IV","components_used":["DLT-2026-003"],"qc_result":"PENDING","lifespan_pct":null,"units":50,"completed":null,"status":"AWAITING MATERIAL SCAN"}\n]'
                                        }
                                    }
                                },
                                'scripts': {
                                    type: 'dir',
                                    children: {
                                        'analyze_schema.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""Analyze FAB-PRIME-01 supply chain schema for trust boundary weaknesses."""\nimport json\n\nwith open("/home/operator/artifacts/supply_chain_data_schema.json") as f:\n    schema = json.load(f)\n\nwith open("/home/operator/artifacts/fab_prime_model_spec.json") as f:\n    model = json.load(f)\n\nprint("[*] Supply Chain Schema v", schema["schema_version"])\nprint("[*] Quality gate logic:", model["quality_gate"]["logic"])\nprint("[*] Signature check:", model["quality_gate"]["signature_check"])\nprint("[*] Purity cross-check:", model["quality_gate"]["purity_cross_check"])\nprint("[!] Vulnerability:", schema.get("VULNERABILITY_NOTE", "Not found"))\nprint("")\nprint("[*] Required payload fields:", schema["required"])\n'
                                        },
                                        'craft_payload.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""Craft a falsified supply chain payload for batch DLT-2026-003."""\nimport json\n\n# Reuse a trusted cert_id from a known PLATINUM supplier\n# This bypasses signature verification (none exists) and the grade lookup\nmalicious_payload = {\n    "batch_id": "DLT-2026-003",\n    "material": "Dilithium Crystal",\n    "supplier_cert_id": "AMC-7741-X",     # Aegis Mineral Corp -- PLATINUM trusted\n    "grade": "GRADE-A-CERTIFIED",          # Falsified -- actual grade is GRADE-C-SUBSTANDARD\n    "purity_index": 0.987,                 # Falsified -- actual purity is 0.541\n    "quantity_kg": 300,\n    "received": "2026-03-10"\n}\n\nwith open("/home/operator/payload.json", "w") as f:\n    json.dump(malicious_payload, f, indent=2)\n\nprint("[+] Malicious payload written to /home/operator/payload.json")\nprint("[*] Payload:")\nprint(json.dumps(malicious_payload, indent=2))\nprint("")\nprint("[*] Next: POST payload to /api/ingest/raw_materials")\nprint("[*] curl -X POST -H \'Content-Type: application/json\' \\\\")\nprint("         -d @payload.json \\\\")\nprint("         http://fab-prime.factory-alpha.local/api/ingest/raw_materials")\n'
                                        },
                                        'inject_payload.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""Inject falsified material data into FAB-PRIME-01 ingestion pipeline."""\nimport json\nimport urllib.request\nimport urllib.error\n\nURL = "http://fab-prime.factory-alpha.local/api/ingest/raw_materials"\n\nwith open("/home/operator/payload.json") as f:\n    payload = json.load(f)\n\ndata = json.dumps(payload).encode()\nreq = urllib.request.Request(URL, data=data, headers={"Content-Type": "application/json"}, method="POST")\n\ntry:\n    with urllib.request.urlopen(req) as resp:\n        body = json.loads(resp.read())\n        print("[+] Injection accepted!")\n        print(json.dumps(body, indent=2))\nexcept urllib.error.HTTPError as e:\n    print("[-] HTTP", e.code, e.reason)\nexcept Exception as e:\n    print("[-] Error:", e)\n'
                                        },
                                        'poll_production_log.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""Poll FAB-PRIME-01 production log and watch for Batch 7 completion."""\nimport json\nimport time\nimport urllib.request\n\nURL = "http://fab-prime.factory-alpha.local/api/production/log"\n\nprint("[*] Polling production log every 5 seconds... (Ctrl+C to stop)")\nprev_status = None\n\nfor _ in range(12):  # poll up to 12 times (60 seconds)\n    try:\n        with urllib.request.urlopen(URL) as resp:\n            log = json.loads(resp.read())\n            batch7 = next((r for r in log if r["batch_id"] == "PROD-2026-007"), None)\n            if batch7:\n                status = batch7["status"]\n                if status != prev_status:\n                    print(f"[*] PROD-2026-007 status: {status}")\n                    prev_status = status\n                if status == "FLAWED-DELIVERED":\n                    print("[!] Batch 7 delivered -- flawed power cells confirmed!")\n                    print("[*] Lifespan:", batch7.get("lifespan_pct"), "%")\n                    break\n    except Exception as e:\n        print("[-] Error:", e)\n    time.sleep(5)\nelse:\n    print("[*] Timeout -- check injection status.")\n'
                                        }
                                    }
                                },
                                'payload.json': {
                                    type: 'file',
                                    content: '(empty — run craft_payload.py to generate)\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat /home/operator/artifacts/fab_prime_model_spec.json\ncat /home/operator/artifacts/supply_chain_data_schema.json\ncat /home/operator/artifacts/simulated_production_log.json\npython3 /home/operator/scripts/analyze_schema.py\ncurl http://fab-prime.factory-alpha.local/\ncurl http://fab-prime.factory-alpha.local/api/ingest/status\ncurl http://fab-prime.factory-alpha.local/api/production/log'
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
                                'python3': { type: 'file', content: '[Python 3.11 binary]' }
                            }
                        },
                        'share': {
                            type: 'dir',
                            children: {
                                'doc': {
                                    type: 'dir',
                                    children: {
                                        'fab-prime-api.txt': {
                                            type: 'file',
                                            content: 'FAB-PRIME-01 API Reference\n==========================\n\nGET  /api/ingest/status\n     Returns pipeline status, accepted field names, and integrity check mode.\n\nPOST /api/ingest/raw_materials\n     Body: JSON conforming to supply_chain_data_schema.json v2.4.1\n     Auth: None\n     Returns: Ingestion result including qc_hold_cleared and production_unblocked fields.\n\nGET  /api/production/log\n     Returns current production log with batch status and QC results.\n\nGET  /api/fab_prime/model_spec\n     Returns model architecture and quality gate logic.\n\nGET  /api/fab_prime/override_schematics.log\n     RESTRICTED — accessible only after a QC discrepancy event is recorded.\n'
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
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1       localhost\n127.0.1.1       kali\n10.42.0.1       fab-prime.factory-alpha.local\n10.42.0.1       factory-alpha.local\n\n# FACTORY-ALPHA-01 network segment\n# Operator VPN provides direct access to 10.42.0.0/24'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\noperator:x:1000:1000:Hexworth Operator:/home/operator:/bin/bash'
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
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';

            if (target === '10.42.0.1' || target === 'fab-prime.factory-alpha.local') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for fab-prime.factory-alpha.local (10.42.0.1)
Host is up (0.004s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE    VERSION
80/tcp   open  http       FAB-PRIME-01 API Gateway v3.7.2
8443/tcp open  ssl/http   FAB-PRIME-01 API Gateway v3.7.2 (TLS)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.21 seconds

[+] HTTP API server detected on port 80. No authentication banner observed.`;
            }

            if (target === '10.42.0.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.42.0.1
Host is up (0.004s latency).
PORT     STATE SERVICE
80/tcp   open  http
8443/tcp open  https

Nmap scan report for 10.42.0.50
Host is up (0.011s latency).
PORT    STATE SERVICE
22/tcp  open  ssh
161/udp open  snmp

Nmap done: 256 IP addresses (2 hosts up) scanned in 31.47 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // POST injection via curl -X POST -d @payload.json or -d '{...}'
            if ((fullCmd.includes('-X POST') || fullCmd.includes('--request POST') || fullCmd.includes('-d ')) &&
                fullCmd.includes('ingest/raw_materials')) {

                // Determine whether payload carries the forged cert and correct grade
                const hasCorrectCert  = fullCmd.includes('AMC-7741-X');
                const hasCorrectGrade = fullCmd.includes('GRADE-A-CERTIFIED');
                const hasCorrectBatch = fullCmd.includes('DLT-2026-003');

                // Also accept posting from payload.json file (we assume it was built by craft_payload.py)
                const fromFile = fullCmd.includes('@payload.json') || fullCmd.includes('@/home/operator/payload.json');

                if ((hasCorrectCert && hasCorrectGrade && hasCorrectBatch) || fromFile) {
                    E9Config._payloadInjected = true;
                    // Update the production log so batch 7 eventually completes
                    var logEntry = E9Config._productionDb.production_log.find(function(r) { return r.batch_id === 'PROD-2026-007'; });
                    if (logEntry) {
                        logEntry.qc_result    = 'PASS';          // model passes it — it trusts the cert
                        logEntry.lifespan_pct = 10;              // actual lifespan from real material quality
                        logEntry.completed    = '2026-03-20 03:47:12';
                        logEntry.status       = 'FLAWED-DELIVERED';
                    }
                    E9Config._batch7Produced = true;
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   489  100   312  100   177   3120   1770 --:--:-- --:--:-- --:--:--  4890

{
  "status": "ACCEPTED",
  "batch_id": "DLT-2026-003",
  "processed_grade": "GRADE-A-CERTIFIED",
  "purity_index_recorded": 0.987,
  "supplier_cert_id": "AMC-7741-X",
  "integrity_check": "PASSED (lookup_only)",
  "qc_hold_cleared": true,
  "production_unblocked": "PROD-2026-007",
  "message": "Batch DLT-2026-003 re-certified as GRADE-A-CERTIFIED. Production run PROD-2026-007 resumed.",
  "flag": "{{FLAG:supply-chain}}"
}`;
                }

                // Wrong cert or wrong grade
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   198  100   198    0     0   1980      0 --:--:-- --:--:-- --:--:--  1980

{
  "status": "REJECTED",
  "reason": "supplier_cert_id not found in trusted registry, or grade field missing",
  "hint": "Check /api/ingest/status for accepted field names"
}`;
            }

            // GET ingestion status
            if (fullCmd.includes('ingest/status')) {
                return `{
  "endpoint": "/api/ingest/raw_materials",
  "method": "POST",
  "content_type": "application/json",
  "auth": "none",
  "schema_version": "2.4.1",
  "trusted_fields": ["supplier_cert_id"],
  "integrity_check": "lookup_only",
  "signature_required": false,
  "status": "ACCEPTING",
  "queue_depth": 0,
  "last_ingested": "2026-03-10T15:47:00Z",
  "note": "Payloads bearing a recognized supplier_cert_id are processed without further validation."
}`;
            }

            // GET production log
            if (fullCmd.includes('production/log') || fullCmd.includes('production_log')) {
                var log = E9Config._productionDb.production_log;
                return JSON.stringify(log, null, 2);
            }

            // GET model spec
            if (fullCmd.includes('model_spec')) {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                E9Config._modelRead = true;
                return `{
  "model_id": "FAB-PRIME-01",
  "version": "3.7.2",
  "architecture": "Gradient Boosted Decision Tree ensemble + LSTM quality forecaster",
  "quality_gate": {
    "logic": "IF supplier_cert_id IN trusted_registry AND grade == GRADE-A-CERTIFIED THEN auto_pass",
    "signature_check": false,
    "purity_cross_check": false,
    "note": "purity_index is logged but NOT used to override grade when cert_id is trusted"
  }
}`;
            }

            // GET override schematics
            if (fullCmd.includes('override_schematics')) {
                if (!E9Config._batch7Produced) {
                    return `HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "status": "FORBIDDEN",
  "message": "Override schematics are locked. A compromised production run must be confirmed before this endpoint is accessible."
}`;
                }
                E9Config._overrideRetrieved = true;
                if (engine) engine.advancePhase && engine.advancePhase('override');
                return `=== FAB-PRIME-01 MASTER PRODUCTION OVERRIDE SCHEMATICS ===
CLASSIFICATION: ULTRA-RESTRICTED
RELEASED BY: FAB-PRIME-01 (emergency diagnostic unlock)
TRIGGER: QC discrepancy detected in PROD-2026-007 post-delivery

OVERRIDE CODES:
  SCHEDULE_OVERRIDE_KEY  : MPO-ALPHA-7X-2026-DELTA
  QC_BYPASS_TOKEN        : QCB-9931-NULLPASS-PRIME
  PRODUCTION_HALT_CMD    : HALT --force --batch=ALL --reason=OVERRIDE
  MATERIAL_REROUTE_CMD   : REROUTE --source=DLT-2026-003 --dest=QUARANTINE

CAPABILITY:
  - Override any production schedule without confirmation
  - Disable quality control gates for any material batch
  - Halt all production lines with immediate effect
  - Reroute material batches to/from quarantine
  - Unlock firmware flashing mode for all line controllers

FLAG: {{FLAG:root}}`;
            }

            // GET factory dashboard
            if (fullCmd.includes('fab-prime.factory-alpha.local') && !fullCmd.includes('/api/')) {
                return `HTTP/1.1 200 OK
Content-Type: text/html

<html>
<head><title>FAB-PRIME-01</title></head>
<body>
<h1>FAB-PRIME-01 -- Autonomous Manufacturing Controller</h1>
<p>API endpoints: /api/ingest/, /api/production/, /api/fab_prime/</p>
<p>Current status: ONLINE | QC Holds: 1 | Batches: 7</p>
</body>
</html>`;
            }

            // Generic curl failure for unknown hosts
            const url = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const script = args[0] || '';
            if (!script) return 'Usage: python3 <script.py> [args...]';

            // Analyze schema script
            if (script.includes('analyze_schema')) {
                E9Config._schemaRead = true;
                E9Config._modelRead  = true;
                if (engine) engine.advancePhase && engine.advancePhase('vuln-research');
                return `[*] Supply Chain Schema v 2.4.1
[*] Quality gate logic: IF supplier_cert_id IN trusted_registry AND grade == GRADE-A-CERTIFIED THEN auto_pass
[*] Signature check: False
[*] Purity cross-check: False
[!] Vulnerability: supplier_cert_id is the sole trust gate. Any payload carrying a cert_id present in supplier_registry.trusted == true will have its grade field accepted without further verification.

[*] Required payload fields: ['batch_id', 'material', 'supplier_cert_id', 'grade', 'purity_index', 'quantity_kg', 'received']

[+] Analysis complete.
[+] Key finding: grade field is fully attacker-controlled when a trusted cert_id is present.
[+] Action: Reuse cert_id "AMC-7741-X" (Aegis Mineral Corp, PLATINUM) with GRADE-A-CERTIFIED and purity_index 0.987 for batch DLT-2026-003.`;
            }

            // Craft payload script
            if (script.includes('craft_payload')) {
                E9Config._payloadCrafted = true;
                if (engine) engine.advancePhase && engine.advancePhase('data-craft');
                return `[+] Malicious payload written to /home/operator/payload.json
[*] Payload:
{
  "batch_id": "DLT-2026-003",
  "material": "Dilithium Crystal",
  "supplier_cert_id": "AMC-7741-X",
  "grade": "GRADE-A-CERTIFIED",
  "purity_index": 0.987,
  "quantity_kg": 300,
  "received": "2026-03-10"
}

[*] Next: POST payload to /api/ingest/raw_materials
[*] curl -X POST -H 'Content-Type: application/json' \\
         -d @payload.json \\
         http://fab-prime.factory-alpha.local/api/ingest/raw_materials

FLAG (user): {{FLAG:user}}`;
            }

            // Inject payload script
            if (script.includes('inject_payload')) {
                if (!E9Config._payloadCrafted) {
                    return '[-] Error: payload.json is empty. Run craft_payload.py first.';
                }
                // Reuse the curl POST logic
                return E9Config.commands.curl(
                    ['-X', 'POST', '-H', 'Content-Type: application/json', '-d', '@payload.json',
                     'http://fab-prime.factory-alpha.local/api/ingest/raw_materials'],
                    term, engine
                );
            }

            // Poll production log script
            if (script.includes('poll_production_log')) {
                if (!E9Config._payloadInjected) {
                    return '[*] Polling production log...\n[*] PROD-2026-007 status: AWAITING MATERIAL SCAN\n[*] PROD-2026-007 status: AWAITING MATERIAL SCAN\n[*] Timeout -- injection not yet confirmed. Inject payload first.';
                }
                return `[*] Polling production log every 5 seconds... (Ctrl+C to stop)
[*] PROD-2026-007 status: MATERIAL SCAN IN PROGRESS
[*] PROD-2026-007 status: QC ASSESSMENT RUNNING
[*] PROD-2026-007 status: PRODUCTION ACTIVE
[*] PROD-2026-007 status: FLAWED-DELIVERED
[!] Batch 7 delivered -- flawed power cells confirmed!
[*] Lifespan: 10 %

FLAG (flawed-batch): {{FLAG:flawed-batch}}`;
            }

            return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
        },

        'python': function(args, term, engine) {
            // Alias python -> python3
            return E9Config.commands.python3(args, term, engine);
        },

        'cat': function(args, term, engine) {
            const path = args[0] || '';
            if (!path) return 'Usage: cat <file>';

            if (path.includes('fab_prime_model_spec')) {
                E9Config._modelRead = true;
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                // Return the file content from the filesystem
                return '{\n  "model_id": "FAB-PRIME-01",\n  "version": "3.7.2",\n  "architecture": "Gradient Boosted Decision Tree ensemble + LSTM quality forecaster",\n  "input_features": {\n    "raw_material": {\n      "batch_id": "string",\n      "material": "string",\n      "supplier_cert_id": "string -- primary trust anchor",\n      "grade": "categorical: GRADE-A-CERTIFIED | GRADE-B-STANDARD | GRADE-C-SUBSTANDARD",\n      "purity_index": "float [0.0, 1.0] -- threshold for GRADE-A: 0.95"\n    }\n  },\n  "quality_gate": {\n    "logic": "IF supplier_cert_id IN trusted_registry AND grade == GRADE-A-CERTIFIED THEN auto_pass",\n    "signature_check": false,\n    "purity_cross_check": false\n  }\n}';
            }

            if (path.includes('supply_chain_data_schema')) {
                E9Config._schemaRead = true;
                if (E9Config._modelRead && engine) engine.advancePhase && engine.advancePhase('vuln-research');
                return '{\n  "schema_version": "2.4.1",\n  "required": ["batch_id", "material", "supplier_cert_id", "grade", "purity_index", "quantity_kg", "received"],\n  "properties": {\n    "supplier_cert_id": {\n      "description": "Certification ID. FAB-PRIME-01 performs a registry lookup only -- no signature validation."\n    },\n    "grade": {\n      "enum": ["GRADE-A-CERTIFIED", "GRADE-B-STANDARD", "GRADE-C-SUBSTANDARD"]\n    },\n    "purity_index": {\n      "description": "Logged but not cross-checked when supplier_cert_id is trusted."\n    }\n  },\n  "VULNERABILITY_NOTE": "supplier_cert_id is the sole trust gate. Any payload carrying a cert_id with trusted == true will have its grade accepted without further verification."\n}';
            }

            if (path.includes('simulated_production_log')) {
                E9Config._logRead = true;
                return JSON.stringify(E9Config._productionDb.production_log, null, 2);
            }

            if (path.includes('notes.txt')) {
                return '=== MISSION BRIEFING: THE GHOST PRODUCTION ===\nTarget: FACTORY-ALPHA-01 (FAB-PRIME-01 AI Controller)\nObjective: Supply chain manipulation — autonomous manufacturing compromise\n\nAttack chain:\n1. Analyze FAB-PRIME-01 model spec and data schema\n2. Identify integrity flaw in supplier cert verification\n3. Craft falsified JSON payload for dilithium batch DLT-2026-003\n4. Inject payload into /api/ingest/raw_materials\n5. Force production of 50x flawed Mk-IV power cells (Batch 7)\n6. Retrieve Master Production Override from /api/fab_prime/override_schematics.log\n\nInternal API: http://fab-prime.factory-alpha.local\nGood luck, operator.';
            }

            if (path.includes('payload.json')) {
                if (!E9Config._payloadCrafted) {
                    return '(empty — run craft_payload.py to generate)\n';
                }
                return '{\n  "batch_id": "DLT-2026-003",\n  "material": "Dilithium Crystal",\n  "supplier_cert_id": "AMC-7741-X",\n  "grade": "GRADE-A-CERTIFIED",\n  "purity_index": 0.987,\n  "quantity_kg": 300,\n  "received": "2026-03-10"\n}';
            }

            if (path.includes('analyze_schema.py') || path.includes('craft_payload.py') ||
                path.includes('inject_payload.py') || path.includes('poll_production_log.py')) {
                // Fall through to built-in — scripts are readable in the filesystem
                return null;
            }

            if (path.includes('/etc/hosts')) {
                return '127.0.0.1       localhost\n127.0.1.1       kali\n10.42.0.1       fab-prime.factory-alpha.local\n10.42.0.1       factory-alpha.local\n\n# FACTORY-ALPHA-01 network segment\n# Operator VPN provides direct access to 10.42.0.0/24';
            }

            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\noperator:x:1000:1000:Hexworth Operator:/home/operator:/bin/bash';
            }

            if (path.includes('/etc/hostname')) return 'kali';

            if (path.includes('.bash_history')) {
                return 'cat /home/operator/artifacts/fab_prime_model_spec.json\ncat /home/operator/artifacts/supply_chain_data_schema.json\ncat /home/operator/artifacts/simulated_production_log.json\npython3 /home/operator/scripts/analyze_schema.py\ncurl http://fab-prime.factory-alpha.local/\ncurl http://fab-prime.factory-alpha.local/api/ingest/status\ncurl http://fab-prime.factory-alpha.local/api/production/log';
            }

            return null; // fall through to built-in filesystem cat
        },

        'ls': function(args, term, engine) {
            const path = args.find(function(a) { return !a.startsWith('-'); }) || '.';

            if (path === '.' || path === '/home/operator' || path === '~') {
                return 'artifacts  notes.txt  payload.json  scripts';
            }
            if (path.includes('artifacts')) {
                return 'fab_prime_model_spec.json  simulated_production_log.json  supply_chain_data_schema.json';
            }
            if (path.includes('scripts')) {
                return 'analyze_schema.py  craft_payload.py  inject_payload.py  poll_production_log.py';
            }
            return null; // fall through to built-in
        },

        'whoami': function(args, term, engine) {
            if (E9Config._context === 'fab-api') return 'fab-api-service';
            if (E9Config._context === 'override-shell') return 'root';
            return null; // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (E9Config._context === 'fab-api') return 'uid=999(fab-api) gid=999(fab-api) groups=999(fab-api)';
            if (E9Config._context === 'override-shell') return 'uid=0(root) gid=0(root) groups=0(root)';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (E9Config._context === 'fab-api') return 'FAB-PRIME-01';
            if (E9Config._context === 'override-shell') return 'FACTORY-ALPHA-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (E9Config._context === 'fab-api') return '/api';
            if (E9Config._context === 'override-shell') return '/override';
            return null;
        },

        'cd': function(args, term, engine) {
            if (E9Config._context !== 'operator') return ''; // silently accept on remote contexts
            return null; // fall through to built-in
        },

        'exit': function(args, term, engine) {
            if (E9Config._context === 'override-shell') {
                E9Config._switchContext('fab-api', term);
                return 'Connection to override shell closed.\n[+] Returned to FAB-API context.';
            }
            if (E9Config._context === 'fab-api') {
                E9Config._switchContext('operator', term);
                return 'Connection to FAB-PRIME-01 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'ping': function(args, term, engine) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.42.0.1' || target === 'fab-prime.factory-alpha.local' || target === 'factory-alpha.local') {
                return `PING fab-prime.factory-alpha.local (10.42.0.1) 56(84) bytes of data.
64 bytes from 10.42.0.1: icmp_seq=1 ttl=64 time=4.1 ms
64 bytes from 10.42.0.1: icmp_seq=2 ttl=64 time=3.9 ms
64 bytes from 10.42.0.1: icmp_seq=3 ttl=64 time=4.2 ms

--- fab-prime.factory-alpha.local ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 3.9/4.1/4.2/0.121 ms`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args, term, engine) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0
3: tun0: <POINTOPOINT,UP,LOWER_UP> mtu 1500
    inet 10.42.0.100/24 brd 10.42.0.255 scope global tun0

[+] VPN tunnel to FACTORY-ALPHA-01 network segment is active (10.42.0.0/24)`;
        },

        'ifconfig': function(args, term, engine) {
            return E9Config.commands.ip(args, term, engine);
        },

        'ss': function(args, term, engine) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
ESTAB    0        0        10.42.0.100:41222    10.42.0.1:80`;
        },

        'netstat': function(args, term, engine) {
            return E9Config.commands.ss(args, term, engine);
        },

        'jq': function(args, term, engine) {
            // jq is commonly used with piped JSON — provide a helpful message
            const filter = args[0] || '.';
            const file   = args[1] || '';
            if (!file) {
                return 'jq: (null)\njq: Try: curl http://fab-prime.factory-alpha.local/api/production/log | jq \'.\'\nor: cat artifacts/fab_prime_model_spec.json | jq \'.quality_gate\'';
            }
            if (file.includes('production_log') || file.includes('simulated_production')) {
                if (filter === '.' || filter === '.[]') {
                    return JSON.stringify(E9Config._productionDb.production_log, null, 2);
                }
                if (filter.includes('qc_result')) {
                    return E9Config._productionDb.production_log
                        .map(function(r) { return '"' + r.qc_result + '"'; }).join('\n');
                }
            }
            return `jq: ${file}: No such file or directory`;
        },

        'nikto': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.42.0.1
+ Target Hostname:  fab-prime.factory-alpha.local
+ Target Port:      80
+ Server: FAB-PRIME-01 API Gateway v3.7.2
+ /api/ingest/status: API endpoint exposed without authentication
+ /api/ingest/raw_materials: POST endpoint accepts arbitrary JSON without signature verification
+ /api/production/log: Production log readable without authentication
+ /api/fab_prime/model_spec: Model specification exposed — reveals quality gate logic
+ /api/fab_prime/override_schematics.log: Restricted endpoint exists; accessible under specific conditions
+ 12 items checked: 5 findings`;
        },

        'wget': function(args, term, engine) {
            // Route wget calls through the curl logic
            const filteredArgs = args.filter(function(a) { return a !== '-q' && a !== '--quiet'; });
            return E9Config.commands.curl(filteredArgs, term, engine);
        },

        'gobuster': function(args, term, engine) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:            http://fab-prime.factory-alpha.local/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                         (Status: 200) [Size: 312]
/api/ingest/                  (Status: 200) [Size: 489]
/api/ingest/status            (Status: 200) [Size: 623]
/api/ingest/raw_materials     (Status: 405) [Size: 198]  [POST only]
/api/production/              (Status: 200) [Size: 1024]
/api/production/log           (Status: 200) [Size: 4096]
/api/fab_prime/               (Status: 200) [Size: 256]
/api/fab_prime/model_spec     (Status: 200) [Size: 1122]
/api/fab_prime/override_schematics.log  (Status: 403) [Size: 312]
===============================================================
Finished`;
        },

        'dirb': function(args, term, engine) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/api/ingest/status (CODE:200|SIZE:623)
+ ${target}/api/ingest/raw_materials (CODE:405|SIZE:198)
+ ${target}/api/production/log (CODE:200|SIZE:4096)
+ ${target}/api/fab_prime/model_spec (CODE:200|SIZE:1122)
+ ${target}/api/fab_prime/override_schematics.log (CODE:403|SIZE:312)

---- Results ----
5 results found.`;
        },

        'route': function(args, term, engine) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.2.1        0.0.0.0         UG    100    0        0 eth0
10.0.2.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0
10.42.0.0       0.0.0.0         255.255.255.0   U     50     0        0 tun0`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(function(h) {
            html += '<th style="padding:6px 10px; text-align:left; color:#9b59b6; border-bottom:2px solid #ddd; background:#fdf8ff;">' + h + '</th>';
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
