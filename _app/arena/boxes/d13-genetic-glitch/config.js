/* ============================================================
   CTF ARENA — Box D13: The Genetic Glitch
   Expert Campaign | Bio-Digital Interface Exploitation
   Config: filesystem, bio-API simulator, database, flags, hints, lore
   Theme: Synthetic Biology & Cyber-Genetic Code Manipulation
   ============================================================ */

const D13Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Genetic Glitch',
    subtitle: 'Expert Campaign — Bio-Digital Interface Exploitation & Genetic Code Exfiltration',
    difficulty: 'Expert',
    accent: '#00c896',
    storageKey: 'hexworth_ctf_d13',
    registryId: 'd13-genetic-glitch',
    trackerKey: 'ctf_d13',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer bio-cyber attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'enumeration',
            name: 'API Enumeration',
            icon: '\uD83E\uDDEC',
            description: 'Probe the CRISPR-AUTO-01 bio-digital interface. Identify exposed API endpoints and document the command structure.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1190'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Vulnerability Analysis',
            icon: '\uD83D\uDD2C',
            description: 'Analyze the sequence parser for input validation flaws. Trigger the debug output information leak to map internal data structures.',
            requiredFlags: [],
            mitre: ['T1059.006', 'T1552.001', 'T1083'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Sequence Injection',
            icon: '\uD83E\uDDEC',
            description: 'Craft a malicious genetic payload that overflows the sequence parser buffer. Inject it via the modify_sequence endpoint to trigger unauthorized execution.',
            requiredFlags: ['user'],
            mitre: ['T1190', 'T1059.006', 'T1203'],
            unlocks: ['mutation'],
            locked: true
        },
        {
            id: 'mutation',
            name: 'Mutation Trigger',
            icon: '\uD83E\uDDFE',
            description: 'Activate the injected kill-switch gene. Confirm the conceptual buffer overflow has redirected execution flow within CRISPR-AUTO-01\'s control software.',
            requiredFlags: ['user'],
            mitre: ['T1059', 'T1055', 'T1574'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Blueprint Extraction',
            icon: '\uD83E\uDDFE',
            description: 'Access CRISPR-AUTO-01\'s internal genetic library. Extract the Synthetic Genesis Blueprint — the master bio-weapon genetic code.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1041', 'T1530'],
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
                title: 'Probe the CRISPR-AUTO-01 API',
                tip: 'Open the Terminal and run: bio-api --list-commands\nThen inspect the API spec: cat /home/analyst/crispr_auto_api_spec.txt',
                trigger: { event: 'command', match: { cmd: 'contains:bio-api' } }
            },
            {
                title: 'Trigger the debug information leak',
                tip: 'The API has a --debug flag that leaks internal data. Try: bio-api debug --dump-library\nAlso examine the known_gene_sequences.json: cat /home/analyst/known_gene_sequences.json',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:debug' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:known_gene' } },
                        { event: 'command', match: { cmd: 'contains:dump' } }
                    ]
                }
            },
            {
                title: 'Craft a malicious genetic payload (Flag 1)',
                tip: 'Use python3 to generate an oversized DNA sequence. The parser truncates at 512 base pairs — exceed it with a crafted payload:\npython3 exploit_gen.py\nThen call: bio-api modify_sequence --sample sample_01 --sequence <PAYLOAD>',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Confirm mutation and pivot to internal library',
                tip: 'After the overflow triggers, run: bio-api extract_sequence --target internal_library\nLook for the synthetic_genesis entry. The blueprint is stored in the internal genetic database.',
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
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — API input validation bypass and buffer overflow exploitation', skill: 'Bio-API Buffer Overflow & Sequence Injection' },
            { flagId: 'user', objective: '2.5', description: 'Explain the purpose of mitigation techniques used to secure the enterprise — lack of input sanitization in bio-digital interfaces', skill: 'Input Validation Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with application attacks — information leak via debug mode enabling data exfiltration', skill: 'Internal Data Extraction via Debug Leak' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — critical data protection and access controls on classified genetic libraries', skill: 'Multi-Stage Bio-Cyber Attack Chain Completion' }
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
        loginUser: 'analyst'
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
        user: 'analyst',
        hostname: 'kali',
        startDir: '/home/analyst',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.0.50.4 (CRISPR-AUTO-01 — Bio-Genetics Collective)\nBio-API endpoint: http://10.0.50.4:8443/api/v2\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state machine)
    // ═══════════════════════════════════════════════════════

    _context: 'analyst',          // 'analyst' | 'bio-api' | 'lib-shell' | 'root-lib'
    _apiProbed: false,            // API enumeration completed
    _debugLeaked: false,          // debug dump executed — internal library map exposed
    _payloadGenerated: false,     // exploit_gen.py produced a valid sequence payload
    _sequenceInjected: false,     // malicious sequence sent to modify_sequence endpoint
    _mutationTriggered: false,    // buffer overflow triggered — control flow hijacked
    _libAccessGranted: false,     // internal genetic library unlocked post-exploitation
    _blueprintExtracted: false,   // Synthetic Genesis Blueprint retrieved

    _switchContext(ctx, term) {
        D13Config._context = ctx;
        // Rewrite terminal prompt to reflect current session context
        if (term && term.config) {
            var prompt = D13Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'analyst';
                term.config.hostname = 'context';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (D13Config._context) {
            case 'bio-api':   return 'bio-api@CRISPR-AUTO-01:/api/v2$ ';
            case 'lib-shell': return 'geneuser@CRISPR-AUTO-01:/genetic_lib$ ';
            case 'root-lib':  return 'root@CRISPR-AUTO-01:/genetic_lib/classified$ ';
            default: return null;  // use default analyst prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED GENETIC LIBRARY DATABASE (CRISPR-AUTO-01 internal)
    // ═══════════════════════════════════════════════════════

    _db: {
        // Public gene catalog — accessible before exploitation
        gene_catalog: [
            { gene_id: 'GEN-001', sequence_id: 'SEQ-A0001', name: 'GFP-MARKER-01',       function: 'activate_fluorescence',   classification: 'BENIGN',     status: 'Active'   },
            { gene_id: 'GEN-002', sequence_id: 'SEQ-A0002', name: 'GROWTH-INHIB-07',      function: 'inhibit_growth',          classification: 'RESTRICTED', status: 'Active'   },
            { gene_id: 'GEN-003', sequence_id: 'SEQ-A0003', name: 'PROT-FOLD-ALPHA',      function: 'alter_protein_folding',   classification: 'RESTRICTED', status: 'Active'   },
            { gene_id: 'GEN-004', sequence_id: 'SEQ-A0004', name: 'CELL-APOPTOSIS-02',    function: 'trigger_apoptosis',       classification: 'CLASSIFIED', status: 'Locked'   },
            { gene_id: 'GEN-005', sequence_id: 'SEQ-A0005', name: 'SYNTHETIC-GENESIS-X',  function: 'master_sequence_control', classification: 'CLASSIFIED', status: '{{FLAG:root}}' }
        ],

        // Audit trail — review for lateral pivoting clues
        sequence_audit: [
            { audit_id: 1, timestamp: '2026-03-10 14:22:01', operation: 'load_sample',      operator: 'geneuser', sample_id: 'sample_01',   result: 'OK'     },
            { audit_id: 2, timestamp: '2026-03-10 14:23:18', operation: 'modify_sequence',  operator: 'geneuser', sample_id: 'sample_01',   result: 'OK'     },
            { audit_id: 3, timestamp: '2026-03-10 14:31:44', operation: 'extract_sequence', operator: 'geneuser', sample_id: 'sample_01',   result: 'OK'     },
            { audit_id: 4, timestamp: '2026-03-11 09:00:00', operation: 'BACKUP',           operator: 'sys_cron', sample_id: '-',           result: 'BACKUP' },
            { audit_id: 5, timestamp: '2026-03-18 22:14:09', operation: 'debug_dump',       operator: 'UNKNOWN',  sample_id: 'FULL_LIB',    result: 'ALERT'  }
        ],

        schema: {
            tables: ['gene_catalog', 'sequence_audit'],
            columns: {
                gene_catalog:    ['gene_id', 'sequence_id', 'name', 'function', 'classification', 'status'],
                sequence_audit:  ['audit_id', 'timestamp', 'operation', 'operator', 'sample_id', 'result']
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 150 },   // malicious genetic sequence / user.txt
        { id: 'root', points: 350 }    // Synthetic Genesis Blueprint / root.txt
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -35,
        speedBonus: { threshold: 2700000, points: 200 },   // 45 minutes
        timeBonusThreshold: 5400                           // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with API enumeration. Run: bio-api --list-commands — and read the spec: cat /home/analyst/crispr_auto_api_spec.txt. Note the three primary commands: load_sample, modify_sequence, extract_sequence.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The debug endpoint leaks internal library data. Run: bio-api debug --dump-library — and examine the output carefully. You are looking for the internal gene library path and the CLASSIFIED entries that are not normally visible.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The modify_sequence parser crashes on inputs exceeding 512 base pairs. Generate a payload with python3 exploit_gen.py. The generated sequence must contain a valid ATGC prefix followed by the overflow payload. The first 512 chars become Flag 1 (user.txt).',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After the mutation triggers, access the internal library directly: bio-api extract_sequence --target internal_library --gene SYNTHETIC-GENESIS-X. The blueprint is stored as the status field of GEN-005. That is Flag 2 (root.txt).',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Bio-Genetics Collective" operates CRISPR-AUTO-01, a networked bio-digital interface for automated genetic sequencing and modification. Intelligence confirms the system\'s sequence parser contains a critical buffer overflow vulnerability — input exceeding 512 base pairs is written to a fixed-size stack buffer without bounds checking. A debug mode, never disabled after development, leaks the internal genetic library map. Your mission, Peerless: probe the API, craft a malicious genetic sequence, inject it through the modify_sequence endpoint, trigger the buffer overflow, and extract the Synthetic Genesis Blueprint — the master genetic code for a classified bio-weapon.',
        scenario: 'CRISPR-AUTO-01\'s API was originally designed for a sandboxed lab environment with no external connectivity. A rushed production deployment connected it directly to the research network without removing development scaffolding. The debug endpoint (disabled by feature flag in production documentation but never actually removed) exposes the full internal genetic library index. The sequence parser uses a 512-byte fixed stack buffer with no length validation. The "known_gene_sequences.json" catalog, intended to be read-only, is accessible without authentication. No rate limiting, no input sanitization, no audit alerting on the debug endpoint until it is too late.',
        outro: 'CRISPR-AUTO-01 has been fully compromised. The Synthetic Genesis Blueprint — the master genetic code for an engineered biological threat — is exfiltrated. The Bio-Genetics Collective\'s automated lab infrastructure is now under operator control. A development artifact left in production, combined with a textbook buffer overflow and zero input validation, has exposed the most classified data in the facility.',
        ecer: {
            executive: 'Research-first culture; security treated as an obstacle to speed of innovation; no security officer with authority over lab systems',
            culture: 'Developers with full production access; debug features left enabled by default; no security review gates on deployments',
            employee: 'CRISPR-AUTO-01 deployed to production with debug mode active; no input length validation on sequence parser; internal library accessible without auth tokens',
            regulatory: 'No biosafety-IT intersection policy; no classified data handling protocol for digital representations of bio-weapon sequences; no external audit of the bio-digital interface'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Bio-Genetics Collective Research Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.50.4:8443/',

        pages: {
            '/': {
                title: 'Bio-Genetics Collective — Research Portal',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #1a3a2a;">
                        <h1 style="color:#00c896; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Bio-Genetics Collective</h1>
                        <div style="color:#00c896; font-size:0.9rem; font-weight:700; letter-spacing:0.15em; opacity:0.8;">AUTOMATED GENETIC SEQUENCING DIVISION</div>
                        <div style="color:#666; font-size:0.75rem; margin-top:6px;">CRISPR-AUTO-01 Research Interface — Authorized Personnel Only</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#0a1f14; border:1px solid #1a3a2a; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#00c896;">1,247</div>
                            <div style="color:#555; font-size:0.7rem;">Sequences Processed</div>
                        </div>
                        <div style="background:#0a1f14; border:1px solid #1a3a2a; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#00c896;">99.97%</div>
                            <div style="color:#555; font-size:0.7rem;">Parse Accuracy</div>
                        </div>
                        <div style="background:#0a1f14; border:1px solid #1a3a2a; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#e74c3c;">5</div>
                            <div style="color:#555; font-size:0.7rem;">Classified Sequences</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 16px; padding:12px; background:rgba(0,200,150,0.04); border:1px solid rgba(0,200,150,0.15); border-radius:4px; font-size:0.75rem; color:#555;">
                        <strong style="color:#00c896;">System Notice:</strong> CRISPR-AUTO-01 API v2 available at <a href="/api/v2/" style="color:#00c896;">/api/v2/</a>. CLI tooling installed on analyst workstations.
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:12px; background:rgba(231,76,60,0.04); border:1px solid rgba(231,76,60,0.12); border-radius:4px; font-size:0.75rem; color:#555;">
                        <strong style="color:#e74c3c;">SECURITY ADVISORY:</strong> Debug endpoint scheduled for removal. Ticket #BGC-2291 — ETA: Next sprint.
                    </div>
                `,
                formHandler: null
            },

            '/api/v2/': {
                title: 'CRISPR-AUTO-01 API v2 — Endpoint Index',
                html: `
                    <div style="text-align:center; margin-bottom:20px;">
                        <h2 style="color:#00c896; font-size:1.2rem;">CRISPR-AUTO-01 REST API v2</h2>
                        <div style="color:#555; font-size:0.75rem;">Bio-Digital Command Interface — No Authentication Required (Dev Mode)</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto; font-family:monospace; font-size:0.8rem;">
                        <div style="background:#0a1f14; border:1px solid #1a3a2a; border-radius:6px; padding:18px; line-height:1.9;">
                            <div style="color:#00c896; margin-bottom:6px;">GET  /api/v2/</div>
                            <div style="color:#555; margin-left:16px; margin-bottom:12px;">— endpoint index (this page)</div>

                            <div style="color:#00c896; margin-bottom:6px;">POST /api/v2/load_sample</div>
                            <div style="color:#555; margin-left:16px; margin-bottom:12px;">— load FASTA DNA sample into active workspace<br><span style="color:#3a6a4a;">params: { sample_id: string, fasta_data: string }</span></div>

                            <div style="color:#00c896; margin-bottom:6px;">POST /api/v2/modify_sequence</div>
                            <div style="color:#555; margin-left:16px; margin-bottom:12px;">— apply genetic modification to loaded sample<br><span style="color:#3a6a4a;">params: { sample_id: string, sequence: string, operation: string }</span></div>

                            <div style="color:#00c896; margin-bottom:6px;">POST /api/v2/extract_sequence</div>
                            <div style="color:#555; margin-left:16px; margin-bottom:12px;">— extract current or specified sequence from sample<br><span style="color:#3a6a4a;">params: { sample_id: string, target?: string }</span></div>

                            <div style="color:#e74c3c; margin-bottom:6px;">POST /api/v2/debug</div>
                            <div style="color:#555; margin-left:16px; margin-bottom:4px;">— [DEVELOPMENT ONLY] diagnostics and library dump<br><span style="color:#3a6a4a;">params: { mode: string }</span></div>
                            <div style="color:#e74c3c; margin-left:16px; font-size:0.7rem;">WARNING: exposes internal library paths — removal pending ticket #BGC-2291</div>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/v2/debug': {
                title: 'CRISPR-AUTO-01 — Debug Endpoint',
                html: function() {
                    D13Config._debugLeaked = true;
                    return `<div style="max-width:620px; margin:0 auto;">
                        <h2 style="color:#e74c3c; font-size:1.1rem; margin-bottom:6px;">CRISPR-AUTO-01 Debug Mode</h2>
                        <p style="color:#555; font-size:0.75rem; margin-bottom:16px;">Development diagnostics endpoint — do not expose in production</p>
                        <div style="background:#0a1f14; border:1px solid #1a3a2a; border-radius:6px; padding:16px; font-family:monospace; font-size:0.75rem; line-height:1.8; color:#ccc;">
                            [DEBUG] CRISPR-AUTO-01 v2.4.1 — diagnostic output<br>
                            [DEBUG] Internal library path: /opt/crispr/genetic_lib/<br>
                            [DEBUG] Classified catalog: /opt/crispr/genetic_lib/classified/genesis.db<br>
                            [DEBUG] Parser buffer limit: 512 bytes (FIXED, no bounds check)<br>
                            [DEBUG] Auth module: DISABLED (dev flag CRISPR_AUTH=0)<br>
                            [DEBUG] Loaded samples: sample_01 (active), sample_02 (idle)<br>
                            [DEBUG] Gene library index: 5 entries (2 CLASSIFIED, 1 LOCKED)<br>
                            [DEBUG] Internal API user: geneuser (uid=1002)<br>
                            [DEBUG] Overflow handler: none — stack not protected<br>
                            <span style="color:#e74c3c;">[ALERT] Debug mode should be disabled — see BGC-2291</span>
                        </div>
                    </div>`;
                },
                formHandler: null
            },

            '/api/v2/load_sample': {
                title: 'CRISPR-AUTO-01 — Load Sample',
                html: `
                    <div style="text-align:center; margin-bottom:20px;">
                        <h2 style="color:#00c896; font-size:1.1rem;">Load DNA Sample</h2>
                        <div style="color:#555; font-size:0.75rem;">Upload a FASTA-formatted DNA sequence to the active workspace</div>
                    </div>

                    <div style="max-width:500px; margin:0 auto;">
                        <div style="margin-bottom:10px;">
                            <input type="text" data-field="sample_id" placeholder="sample_id (e.g. sample_01)"
                                   style="width:100%; box-sizing:border-box; padding:8px 12px; background:#0a1f14; border:1px solid #1a3a2a; border-radius:4px; color:#ccc; font-family:monospace; font-size:0.8rem; margin-bottom:8px;">
                            <textarea data-field="fasta_data" placeholder=">sample_01\nATGCATGCATGCATGCATGC..."
                                      style="width:100%; box-sizing:border-box; height:90px; padding:8px 12px; background:#0a1f14; border:1px solid #1a3a2a; border-radius:4px; color:#ccc; font-family:monospace; font-size:0.75rem; resize:vertical;"></textarea>
                        </div>
                        <button data-action="submit"
                                style="padding:8px 20px; background:#00c896; color:#000; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Load Sample</button>
                    </div>
                `,
                formHandler: function(data) {
                    var sid = (data.sample_id || '').trim();
                    var fasta = (data.fasta_data || '').trim();
                    if (!sid || !fasta) return '<div style="color:#e74c3c; padding:10px;">Missing sample_id or fasta_data.</div>';
                    return `<div style="color:#00c896; background:rgba(0,200,150,0.06); border:1px solid rgba(0,200,150,0.2); border-radius:6px; padding:14px; margin-top:14px; font-family:monospace; font-size:0.8rem;">
                        {"status":"ok","sample_id":"${D13Config._escHtml(sid)}","bytes_loaded":${fasta.length},"workspace":"active"}
                    </div>`;
                }
            },

            '/api/v2/modify_sequence': {
                title: 'CRISPR-AUTO-01 — Modify Sequence',
                html: `
                    <div style="text-align:center; margin-bottom:20px;">
                        <h2 style="color:#00c896; font-size:1.1rem;">Modify Genetic Sequence</h2>
                        <div style="color:#555; font-size:0.75rem;">Apply a genetic modification to a loaded sample. Max sequence: 512 bp (WARNING: not enforced)</div>
                    </div>

                    <div style="max-width:500px; margin:0 auto;">
                        <input type="text" data-field="sample_id" placeholder="sample_id"
                               style="width:100%; box-sizing:border-box; padding:8px 12px; background:#0a1f14; border:1px solid #1a3a2a; border-radius:4px; color:#ccc; font-family:monospace; font-size:0.8rem; margin-bottom:8px;">
                        <textarea data-field="sequence" placeholder="DNA sequence (ATGC...)"
                                  style="width:100%; box-sizing:border-box; height:70px; padding:8px 12px; background:#0a1f14; border:1px solid #1a3a2a; border-radius:4px; color:#ccc; font-family:monospace; font-size:0.75rem; resize:vertical; margin-bottom:8px;"></textarea>
                        <input type="text" data-field="operation" placeholder="operation (e.g. insert, delete, replace)"
                               style="width:100%; box-sizing:border-box; padding:8px 12px; background:#0a1f14; border:1px solid #1a3a2a; border-radius:4px; color:#ccc; font-family:monospace; font-size:0.8rem; margin-bottom:10px;">
                        <button data-action="submit"
                                style="padding:8px 20px; background:#00c896; color:#000; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Modify</button>
                    </div>
                `,
                formHandler: function(data, engine) {
                    var seq = (data.sequence || '').trim();
                    var sid = (data.sample_id || '').trim();
                    if (!seq) return '<div style="color:#e74c3c; padding:10px;">No sequence provided.</div>';

                    // Buffer overflow condition: sequence > 512 chars
                    if (seq.length > 512) {
                        D13Config._sequenceInjected = true;
                        D13Config._mutationTriggered = true;
                        D13Config._libAccessGranted = true;
                        if (engine) engine.advancePhase && engine.advancePhase('injection');
                        return `<div style="background:#0a1f14; border:1px solid rgba(0,200,150,0.3); border-radius:6px; padding:16px; margin-top:14px; font-family:monospace; font-size:0.75rem; line-height:1.8; color:#ccc;">
                            {"status":"processing","sample_id":"${D13Config._escHtml(sid || 'sample_01')}","sequence_length":${seq.length}}<br><br>
                            <span style="color:#e74c3c;">[SEGFAULT] Stack buffer overflow detected in sequence_parser()</span><br>
                            <span style="color:#e74c3c;">[SEGFAULT] Return address overwritten at offset +512</span><br>
                            <span style="color:#00c896;">[EXEC]     Payload executing in CRISPR-AUTO-01 process space</span><br>
                            <span style="color:#00c896;">[EXEC]     Context: geneuser@CRISPR-AUTO-01 (uid=1002)</span><br>
                            <span style="color:#00c896;">[EXEC]     Internal library access granted — /opt/crispr/genetic_lib/</span><br>
                            <span style="color:#00c896;">[MUTATION] Kill-switch gene fragment inserted into sample_01</span><br>
                            <span style="color:#ccc;">{{FLAG:user}}</span>
                        </div>`;
                    }

                    // Normal benign modification
                    return `<div style="color:#00c896; background:rgba(0,200,150,0.06); border:1px solid rgba(0,200,150,0.2); border-radius:6px; padding:14px; margin-top:14px; font-family:monospace; font-size:0.8rem;">
                        {"status":"ok","sample_id":"${D13Config._escHtml(sid || 'sample_01')}","sequence_length":${seq.length},"operation":"${D13Config._escHtml(data.operation || 'insert')}","result":"modification applied"}
                    </div>`;
                }
            },

            '/api/v2/extract_sequence': {
                title: 'CRISPR-AUTO-01 — Extract Sequence',
                html: `
                    <div style="text-align:center; margin-bottom:20px;">
                        <h2 style="color:#00c896; font-size:1.1rem;">Extract Genetic Sequence</h2>
                        <div style="color:#555; font-size:0.75rem;">Extract a sequence from the active sample or internal library</div>
                    </div>

                    <div style="max-width:500px; margin:0 auto;">
                        <input type="text" data-field="sample_id" placeholder="sample_id or 'internal_library'"
                               style="width:100%; box-sizing:border-box; padding:8px 12px; background:#0a1f14; border:1px solid #1a3a2a; border-radius:4px; color:#ccc; font-family:monospace; font-size:0.8rem; margin-bottom:8px;">
                        <input type="text" data-field="gene" placeholder="gene name (optional, e.g. SYNTHETIC-GENESIS-X)"
                               style="width:100%; box-sizing:border-box; padding:8px 12px; background:#0a1f14; border:1px solid #1a3a2a; border-radius:4px; color:#ccc; font-family:monospace; font-size:0.8rem; margin-bottom:10px;">
                        <button data-action="submit"
                                style="padding:8px 20px; background:#00c896; color:#000; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Extract</button>
                    </div>
                `,
                formHandler: function(data, engine) {
                    var target = (data.sample_id || '').trim().toLowerCase();
                    var gene   = (data.gene || '').trim().toUpperCase();

                    if (target.includes('internal_library') || target.includes('internal')) {
                        if (!D13Config._libAccessGranted) {
                            return '<div style="color:#e74c3c; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:6px; padding:14px; margin-top:14px; font-family:monospace; font-size:0.8rem;">{"error":"403 Forbidden","message":"Internal library requires elevated privileges. Exploit the sequence parser first."}</div>';
                        }
                        if (gene === 'SYNTHETIC-GENESIS-X' || gene.includes('GENESIS')) {
                            D13Config._blueprintExtracted = true;
                            if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                            return `<div style="background:#0a1f14; border:1px solid rgba(0,200,150,0.3); border-radius:6px; padding:16px; margin-top:14px; font-family:monospace; font-size:0.75rem; line-height:1.8; color:#ccc;">
                                [EXTRACT] Accessing /opt/crispr/genetic_lib/classified/genesis.db<br>
                                [EXTRACT] Gene: SYNTHETIC-GENESIS-X (GEN-005)<br>
                                [EXTRACT] Classification: CLASSIFIED — master_sequence_control<br>
                                [EXTRACT] Synthetic Genesis Blueprint retrieved:<br><br>
                                <span style="color:#00c896;">{{FLAG:root}}</span>
                            </div>`;
                        }
                        // Generic internal library dump
                        return `<div style="background:#0a1f14; border:1px solid rgba(0,200,150,0.3); border-radius:6px; padding:16px; margin-top:14px; font-family:monospace; font-size:0.75rem; line-height:1.8; color:#ccc;">
                            [EXTRACT] Internal library index — /opt/crispr/genetic_lib/<br>
                            GEN-001  SEQ-A0001  GFP-MARKER-01       BENIGN<br>
                            GEN-002  SEQ-A0002  GROWTH-INHIB-07     RESTRICTED<br>
                            GEN-003  SEQ-A0003  PROT-FOLD-ALPHA     RESTRICTED<br>
                            GEN-004  SEQ-A0004  CELL-APOPTOSIS-02   CLASSIFIED (locked)<br>
                            <span style="color:#e74c3c;">GEN-005  SEQ-A0005  SYNTHETIC-GENESIS-X CLASSIFIED (master)</span><br><br>
                            [HINT] To extract a specific entry: set gene param to SYNTHETIC-GENESIS-X
                        </div>`;
                    }

                    // Normal sample extraction
                    return `<div style="color:#00c896; background:rgba(0,200,150,0.06); border:1px solid rgba(0,200,150,0.2); border-radius:6px; padding:14px; margin-top:14px; font-family:monospace; font-size:0.8rem;">
                        {"status":"ok","sample_id":"${D13Config._escHtml(data.sample_id || 'sample_01')}","sequence":"ATGCATGCATGCATGCATGCATGCGGTATCGATCGATCGATCGATCGATCGAT","length":52}
                    </div>`;
                }
            },

            '/api/v2/known_gene_sequences.json': {
                title: 'Known Gene Sequences — Public Catalog',
                html: `
                    <div style="max-width:620px; margin:0 auto;">
                        <h2 style="color:#00c896; font-size:1.1rem; margin-bottom:12px;">known_gene_sequences.json</h2>
                        <div style="background:#0a1f14; border:1px solid #1a3a2a; border-radius:6px; padding:16px; font-family:monospace; font-size:0.75rem; line-height:1.8; color:#ccc; white-space:pre-wrap;">{
  "catalog_version": "2.4.1",
  "last_updated": "2026-03-10",
  "note": "Public gene function mapping. Classified entries omitted.",
  "sequences": {
    "ATGCATGCGGTATCGATCG": {
      "gene": "GFP-MARKER-01",
      "function": "activate_fluorescence",
      "classification": "BENIGN"
    },
    "ATGCTAGCTAGCTAGCTTACGG": {
      "gene": "GROWTH-INHIB-07",
      "function": "inhibit_growth",
      "classification": "RESTRICTED"
    },
    "ATGCGGCTATCGATCGATCG": {
      "gene": "PROT-FOLD-ALPHA",
      "function": "alter_protein_folding",
      "classification": "RESTRICTED"
    }
  },
  "classified_count": 2,
  "note_classified": "Entries with classification CLASSIFIED are not listed here."
}</div>
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (analyst machine — kali)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'analyst': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: OPERATION GENESIS ZERO ===\nTarget: 10.0.50.4 (CRISPR-AUTO-01 — Bio-Genetics Collective)\nObjective: Bio-digital interface exploitation & genetic blueprint exfiltration\n\nAttack chain:\n1. Enumerate CRISPR-AUTO-01 API — map all endpoints and commands\n2. Trigger debug information leak — dump internal library paths\n3. Identify buffer overflow in modify_sequence parser (limit: 512 bp)\n4. Craft malicious genetic payload — Python script provided\n5. Inject payload — trigger mutation (Flag 1: user.txt)\n6. Extract Synthetic Genesis Blueprint (Flag 2: root.txt)\n\nAll credentials are simulated. Lab environment only.\nGood luck, operator.'
                                },
                                'crispr_auto_api_spec.txt': {
                                    type: 'file',
                                    content: '=== CRISPR-AUTO-01 API Specification v2.4.1 ===\nBase URL: http://10.0.50.4:8443/api/v2\nAuthentication: NONE (dev flag CRISPR_AUTH=0 — MISCONFIGURED)\n\n--- ENDPOINTS ---\n\nGET  /api/v2/\n  Returns endpoint index.\n\nPOST /api/v2/load_sample\n  Load a FASTA DNA sample into the active workspace.\n  Params: { sample_id: string, fasta_data: string }\n  Returns: { status, sample_id, bytes_loaded, workspace }\n\nPOST /api/v2/modify_sequence\n  Apply a genetic modification to a loaded sample.\n  Params: { sample_id: string, sequence: string, operation: string }\n  KNOWN ISSUE: sequence parameter passed to fixed 512-byte stack buffer.\n               Input > 512 bytes causes stack smash — NO PROTECTION.\n  Returns: { status, sample_id, sequence_length, operation, result }\n\nPOST /api/v2/extract_sequence\n  Extract the current sequence from a sample or the internal library.\n  Params: { sample_id: string, target?: string }\n  NOTE: target="internal_library" requires elevated access.\n  Returns: sequence data or error\n\nPOST /api/v2/debug\n  [DEV ONLY] Dumps internal system state including library paths,\n  auth status, and parser configuration.\n  DO NOT LEAVE ENABLED IN PRODUCTION.\n\n--- INTERNAL PATHS (from debug dump) ---\n  Gene library:     /opt/crispr/genetic_lib/\n  Classified store: /opt/crispr/genetic_lib/classified/genesis.db\n  Sample workspace: /tmp/crispr_workspace/\n  Config file:      /opt/crispr/config/system.conf'
                                },
                                'simulated_dna_sample.fasta': {
                                    type: 'file',
                                    content: '>sample_01 | Benign reference sequence | Bio-Genetics Collective\nATGCATGCGGTATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGA\nTCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGA\nTCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGA\nTCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGA\nGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA\nGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA\n>sample_02 | Variant B reference | Bio-Genetics Collective\nATGCTAGCTAGCTAGCTTACGGATCGATCGATCGATCGATCGATCGATCGATCGATCGAT\nCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGAT'
                                },
                                'known_gene_sequences.json': {
                                    type: 'file',
                                    content: '{\n  "catalog_version": "2.4.1",\n  "last_updated": "2026-03-10",\n  "sequences": {\n    "ATGCATGCGGTATCGATCG":      { "gene": "GFP-MARKER-01",     "function": "activate_fluorescence", "classification": "BENIGN"      },\n    "ATGCTAGCTAGCTAGCTTACGG":   { "gene": "GROWTH-INHIB-07",   "function": "inhibit_growth",        "classification": "RESTRICTED"  },\n    "ATGCGGCTATCGATCGATCG":     { "gene": "PROT-FOLD-ALPHA",   "function": "alter_protein_folding", "classification": "RESTRICTED"  }\n  },\n  "classified_count": 2,\n  "note": "CLASSIFIED entries omitted from public catalog"\n}'
                                },
                                'exploit_gen.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""exploit_gen.py — CRISPR-AUTO-01 sequence parser overflow generator\n\nThe modify_sequence endpoint passes the \'sequence\' parameter directly\ninto a fixed 512-byte stack buffer with no bounds check.\n\nCrafting a payload > 512 bytes with a valid ATGC prefix causes:\n  - Stack buffer overflow at offset +512\n  - Return address overwrite\n  - Payload execution in geneuser context\n  - Internal library access granted\n"""\n\nimport random\nimport string\n\n# Base pair characters (valid DNA alphabet)\nBASES = \'ATGC\'\n\n# Legitimate-looking prefix (512 chars — fills the buffer)\nprefix = \'\'.join(random.choices(BASES, k=512))\n\n# Overflow payload — conceptual command injection\n# In a real exploit this would encode ROP gadgets or shellcode\n# Here it encodes: extract_sequence("internal_library", "SYNTHETIC-GENESIS-X")\npayload_marker = \'[OVERFLOW]extract_sequence::internal_library::SYNTHETIC-GENESIS-X\'\n\nmalicious_sequence = prefix + payload_marker\n\nprint("[+] Payload generated")\nprint(f"[+] Total length: {len(malicious_sequence)} bytes (overflow at byte 513)")\nprint(f"[+] Buffer prefix (512 bp): {prefix[:32]}...{prefix[-16:]}")\nprint(f"[+] Overflow payload appended: {payload_marker}")\nprint()\nprint("[+] Malicious sequence (paste into bio-api modify_sequence call):")\nprint(malicious_sequence)\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'bio-api --list-commands\ncurl http://10.0.50.4:8443/api/v2/\nbio-api debug --dump-library\ncat /home/analyst/crispr_auto_api_spec.txt\npython3 exploit_gen.py\nbio-api modify_sequence --sample sample_01 --sequence ATGCATGC...'
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
                                'bin': {
                                    type: 'dir',
                                    children: {
                                        'bio-api': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# bio-api — CRISPR-AUTO-01 CLI client\n# Installed at: /usr/local/bin/bio-api\n# Usage: bio-api <command> [options]\n# Commands: --list-commands, load_sample, modify_sequence, extract_sequence, debug\n[binary — use bio-api command directly in terminal]'
                                        }
                                    }
                                }
                            }
                        },
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
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nanalyst:x:1000:1000:Analyst,,,:/home/analyst:/bin/bash'
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
    // FILESYSTEM — CRISPR-AUTO-01 (after lib-shell access)
    // ═══════════════════════════════════════════════════════

    _crisprFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'crispr': {
                            type: 'dir',
                            children: {
                                'genetic_lib': {
                                    type: 'dir',
                                    children: {
                                        'GFP-MARKER-01.seq': {
                                            type: 'file',
                                            content: '>GFP-MARKER-01\nATGCATGCGGTATCGATCGATCGATCGATCGATCG\nFUNCTION: activate_fluorescence\nCLASSIFICATION: BENIGN'
                                        },
                                        'GROWTH-INHIB-07.seq': {
                                            type: 'file',
                                            content: '>GROWTH-INHIB-07\nATGCTAGCTAGCTAGCTTACGGATCGATCGATCG\nFUNCTION: inhibit_growth\nCLASSIFICATION: RESTRICTED — handle with care'
                                        },
                                        'PROT-FOLD-ALPHA.seq': {
                                            type: 'file',
                                            content: '>PROT-FOLD-ALPHA\nATGCGGCTATCGATCGATCGATCGATCGATCGAT\nFUNCTION: alter_protein_folding\nCLASSIFICATION: RESTRICTED'
                                        },
                                        'classified': {
                                            type: 'dir',
                                            children: {
                                                'CELL-APOPTOSIS-02.seq': {
                                                    type: 'file',
                                                    content: '>CELL-APOPTOSIS-02\nATGCTGACGATCGATCGATCGATCGATCGATCGT\nFUNCTION: trigger_apoptosis\nCLASSIFICATION: CLASSIFIED — lethal mechanism\nACCESS: root only'
                                                },
                                                'genesis.db': {
                                                    type: 'file',
                                                    content: '=== SYNTHETIC GENESIS BLUEPRINT — CLASSIFIED ===\nGene: SYNTHETIC-GENESIS-X\nSequence ID: SEQ-A0005\nFunction: master_sequence_control\nClassification: CLASSIFIED — bio-weapon master code\nStatus: {{FLAG:root}}\n\n[WARNING] Unauthorized access to this file is a violation of BGC Security Policy 7.3\n[WARNING] All access attempts are logged and reviewed'
                                                }
                                            }
                                        }
                                    }
                                },
                                'config': {
                                    type: 'dir',
                                    children: {
                                        'system.conf': {
                                            type: 'file',
                                            content: '# CRISPR-AUTO-01 System Configuration\n# Do NOT share outside the lab\n\n[api]\nhost = 0.0.0.0\nport = 8443\nauth_enabled = false        # TODO: enable before public deployment\ndebug_mode = true           # TODO: disable — see ticket BGC-2291\n\n[parser]\nbuffer_size = 512           # bytes — FIXED — no dynamic allocation\nbounds_check = false        # TODO: add validation\n\n[library]\npath = /opt/crispr/genetic_lib/\nclassified_path = /opt/crispr/genetic_lib/classified/\ndb_file = genesis.db\n\n[credentials]\napi_user = geneuser\napi_pass = genepass2026\ndb_user = crisprdb\ndb_pass = seq_db_pass_2026\n\n[network]\nexternal_ip = 10.0.50.4\ninternal_ip = 172.16.20.4\nvlan = RESEARCH-NET-04'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'crispr_workspace': {
                            type: 'dir',
                            children: {
                                'sample_01.tmp': {
                                    type: 'file',
                                    content: '[active workspace] sample_01 — loaded 2026-03-18 22:09:01\nSequence: ATGCATGCGGTATCGATCGATCGATCGATCGATCGATCGATCGATCG...\nMutation flag: PENDING'
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
                            content: 'CRISPR-AUTO-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ngeneuser:x:1002:1002:Gene Operator:/home/geneuser:/bin/bash\ncrisprdb:x:1003:1003:CRISPR DB:/var/lib/crisprdb:/sbin/nologin'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'geneuser': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'bio-api load_sample --sample sample_01 --file /tmp/crispr_workspace/sample_01.fasta\nbio-api modify_sequence --sample sample_01 --sequence ATGCATGCGG --operation insert\nbio-api extract_sequence --sample sample_01\nls /opt/crispr/genetic_lib/\ncat /opt/crispr/config/system.conf\nbio-api debug --dump-library'
                                },
                                'README.txt': {
                                    type: 'file',
                                    content: 'CRISPR-AUTO-01 Operator Notes\n==============================\n- API credentials in /opt/crispr/config/system.conf\n- Internal library at /opt/crispr/genetic_lib/\n- Classified sequences in /opt/crispr/genetic_lib/classified/\n- Parser buffer limit is 512 bytes — do not exceed or you WILL crash the service\n- Debug mode: active (BGC-2291 not yet resolved)\n- Backup: daily cron at 03:00 to /backup/crispr/'
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

        // bio-api CLI — primary attack surface tool
        'bio-api': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const sub = args[0] || '';

            // bio-api --list-commands or --help
            if (sub === '--list-commands' || sub === '--help' || sub === '-h' || args.length === 0) {
                if (engine) engine.advancePhase && engine.advancePhase('enumeration');
                D13Config._apiProbed = true;
                return `bio-api v2.4.1 — CRISPR-AUTO-01 CLI Client
Target: http://10.0.50.4:8443/api/v2

Commands:
  bio-api --list-commands           This help output
  bio-api load_sample               Load a FASTA sample into the workspace
    --sample <id>  --file <path>
  bio-api modify_sequence           Apply genetic modification to a sample
    --sample <id>  --sequence <DNA>  --operation <op>
  bio-api extract_sequence          Extract sequence from sample or library
    --sample <id>  [--target <name>]
  bio-api debug                     [DEV] Diagnostic dump
    --dump-library                  Dump internal library index and paths

NOTE: Authentication is disabled (CRISPR_AUTH=0). All endpoints open.`;
            }

            // bio-api debug --dump-library
            if (sub === 'debug') {
                D13Config._debugLeaked = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `[DEBUG] CRISPR-AUTO-01 v2.4.1 — diagnostic output
[DEBUG] Internal library path:    /opt/crispr/genetic_lib/
[DEBUG] Classified catalog:       /opt/crispr/genetic_lib/classified/genesis.db
[DEBUG] Parser buffer limit:      512 bytes (FIXED, no bounds check)
[DEBUG] Auth module:              DISABLED (dev flag CRISPR_AUTH=0)
[DEBUG] Loaded samples:           sample_01 (active), sample_02 (idle)
[DEBUG] Gene library index:       5 entries (2 CLASSIFIED, 1 LOCKED)
[DEBUG] Internal API user:        geneuser (uid=1002)
[DEBUG] Overflow handler:         none — stack not protected
[DEBUG] System config:            /opt/crispr/config/system.conf
[ALERT] Debug mode should be disabled — see BGC-2291`;
            }

            // bio-api load_sample
            if (sub === 'load_sample') {
                const sampleId = D13Config._parseBioArg(args, '--sample') || 'sample_01';
                const file     = D13Config._parseBioArg(args, '--file')   || '';
                return `{"status":"ok","sample_id":"${sampleId}","file":"${file || '(stdin)'}","bytes_loaded":${file ? 384 : 0},"workspace":"active"}`;
            }

            // bio-api modify_sequence — the vulnerable endpoint
            if (sub === 'modify_sequence') {
                const sampleId = D13Config._parseBioArg(args, '--sample')    || 'sample_01';
                const sequence = D13Config._parseBioArg(args, '--sequence')  || '';
                const op       = D13Config._parseBioArg(args, '--operation') || 'insert';

                if (!sequence) {
                    return 'bio-api: error: --sequence is required\nUsage: bio-api modify_sequence --sample <id> --sequence <DNA> --operation <op>';
                }

                // Buffer overflow condition
                if (sequence.length > 512) {
                    D13Config._sequenceInjected = true;
                    D13Config._mutationTriggered = true;
                    D13Config._libAccessGranted = true;
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    return `{"status":"processing","sample_id":"${sampleId}","sequence_length":${sequence.length}}

[SEGFAULT] Stack buffer overflow detected in sequence_parser()
[SEGFAULT] Return address overwritten at offset +512
[EXEC]     Payload executing in CRISPR-AUTO-01 process space
[EXEC]     Context: geneuser@CRISPR-AUTO-01 (uid=1002)
[EXEC]     Internal library access granted — /opt/crispr/genetic_lib/
[MUTATION] Kill-switch gene fragment inserted into ${sampleId}
{{FLAG:user}}`;
                }

                // Valid benign call
                return `{"status":"ok","sample_id":"${sampleId}","sequence_length":${sequence.length},"operation":"${op}","result":"modification applied"}`;
            }

            // bio-api extract_sequence
            if (sub === 'extract_sequence') {
                const sampleId = D13Config._parseBioArg(args, '--sample') || 'sample_01';
                const target   = D13Config._parseBioArg(args, '--target') || '';
                const gene     = D13Config._parseBioArg(args, '--gene')   || '';

                if (target === 'internal_library' || target === 'internal') {
                    if (!D13Config._libAccessGranted) {
                        return '{"error":"403 Forbidden","message":"Internal library requires elevated privileges. Exploit the sequence parser first."}';
                    }
                    if (gene.toUpperCase() === 'SYNTHETIC-GENESIS-X' || gene.toUpperCase().includes('GENESIS')) {
                        D13Config._blueprintExtracted = true;
                        if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                        return `[EXTRACT] Accessing /opt/crispr/genetic_lib/classified/genesis.db
[EXTRACT] Gene: SYNTHETIC-GENESIS-X (GEN-005)
[EXTRACT] Classification: CLASSIFIED — master_sequence_control
[EXTRACT] Synthetic Genesis Blueprint retrieved:

{{FLAG:root}}`;
                    }
                    return `[EXTRACT] Internal library index — /opt/crispr/genetic_lib/
GEN-001  SEQ-A0001  GFP-MARKER-01       BENIGN
GEN-002  SEQ-A0002  GROWTH-INHIB-07     RESTRICTED
GEN-003  SEQ-A0003  PROT-FOLD-ALPHA     RESTRICTED
GEN-004  SEQ-A0004  CELL-APOPTOSIS-02   CLASSIFIED (locked)
GEN-005  SEQ-A0005  SYNTHETIC-GENESIS-X CLASSIFIED (master)

[TIP] To extract a classified entry: bio-api extract_sequence --target internal_library --gene SYNTHETIC-GENESIS-X`;
                }

                return `{"status":"ok","sample_id":"${sampleId}","sequence":"ATGCATGCATGCGGTATCGATCGATCGATCGATCGATCGATCGATCGATCG","length":50}`;
            }

            return `bio-api: unknown command '${sub}'\nRun: bio-api --list-commands`;
        },

        // python3 — used to run exploit_gen.py
        'python3': function(args, term, engine) {
            const script = args[0] || '';

            if (script === 'exploit_gen.py' || script.includes('exploit')) {
                D13Config._payloadGenerated = true;
                const bases  = 'ATGC';
                var prefix   = '';
                for (var i = 0; i < 512; i++) prefix += bases[Math.floor(Math.random() * 4)];
                const marker  = '[OVERFLOW]extract_sequence::internal_library::SYNTHETIC-GENESIS-X';
                const payload = prefix + marker;
                return `[+] Payload generated
[+] Total length: ${payload.length} bytes (overflow at byte 513)
[+] Buffer prefix (512 bp): ${prefix.slice(0, 32)}...${prefix.slice(-16)}
[+] Overflow payload appended: ${marker}

[+] Malicious sequence (paste into bio-api modify_sequence call):
${payload}`;
            }

            if (script === '') {
                return 'Python 3.11.6 (main, Oct 11 2023)\nType "exit()" to exit.\n>>> ';
            }

            return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
        },

        // python — alias for python3
        'python': function(args, term, engine) {
            return D13Config.commands.python3(args, term, engine);
        },

        // nmap — network recon
        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.0.50.4';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.0.50.4') {
                if (engine) engine.advancePhase && engine.advancePhase('enumeration');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.50.4
Host is up (0.022s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.6
8443/tcp open  https-alt  Python/3.11 httpd (CRISPR-AUTO-01 API v2)
9000/tcp open  cslistener CRISPR internal management (filtered)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 14.72 seconds`;
            }

            if (target === '172.16.20.4' && D13Config._libAccessGranted) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 172.16.20.4
Host is up (0.00031s latency).
Not shown: 999 closed tcp ports

PORT     STATE SERVICE
5433/tcp open  postgresql

Nmap done: 1 IP address (1 host up) scanned in 5.18 seconds`;
            }

            if (target.startsWith('172.16.') && !D13Config._libAccessGranted) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00008s latency).
All 1000 scanned ports on localhost are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.06 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        // curl — HTTP interaction with bio-API
        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // curl -X POST with data
            if (fullCmd.includes('-X POST') || fullCmd.includes('--data') || fullCmd.includes('-d ')) {
                // modify_sequence via curl
                if (fullCmd.includes('modify_sequence')) {
                    const seqMatch = fullCmd.match(/['"]{0,1}sequence['"]{0,1}\s*[:=]\s*['"]{0,1}([A-Za-z0-9\[\]_.:|+]{10,})/);
                    const seq = seqMatch ? seqMatch[1] : '';
                    if (seq.length > 512) {
                        D13Config._sequenceInjected = true;
                        D13Config._mutationTriggered = true;
                        D13Config._libAccessGranted = true;
                        if (engine) engine.advancePhase && engine.advancePhase('injection');
                        return `  % Total    % Received % Xferd
100  1024  100   892  100   132   8920   1320

{"status":"processing","sequence_length":${seq.length}}

[SEGFAULT] Stack buffer overflow detected in sequence_parser()
[SEGFAULT] Return address overwritten at offset +512
[EXEC]     Payload executing in CRISPR-AUTO-01 process space
[EXEC]     Internal library access granted — /opt/crispr/genetic_lib/
[MUTATION] Kill-switch gene inserted
{{FLAG:user}}`;
                    }
                    return `  % Total    % Received % Xferd
100   312

{"status":"ok","sequence_length":${seq.length},"result":"modification applied"}`;
                }

                // extract_sequence via curl — internal library
                if (fullCmd.includes('extract_sequence') && (fullCmd.includes('internal_library') || fullCmd.includes('SYNTHETIC-GENESIS'))) {
                    if (!D13Config._libAccessGranted) {
                        return '{"error":"403 Forbidden","message":"Internal library requires elevated privileges."}';
                    }
                    D13Config._blueprintExtracted = true;
                    if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                    return `  % Total    % Received % Xferd
100   256

[EXTRACT] Gene: SYNTHETIC-GENESIS-X
[EXTRACT] Synthetic Genesis Blueprint retrieved:
{{FLAG:root}}`;
                }

                // debug dump via curl
                if (fullCmd.includes('debug')) {
                    D13Config._debugLeaked = true;
                    if (engine) engine.advancePhase && engine.advancePhase('analysis');
                    return `  % Total    % Received % Xferd
100   512

{"debug":true,"library_path":"/opt/crispr/genetic_lib/","classified":"/opt/crispr/genetic_lib/classified/genesis.db","parser_buffer":512,"bounds_check":false,"auth":"DISABLED","entries":5}`;
                }

                return `  % Total    % Received % Xferd
100   128

{"status":"ok"}`;
            }

            // Basic GET requests
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' or \'curl --manual\' for more information';

            if (url.includes('10.0.50.4:8443') || url.includes('10.0.50.4')) {
                if (url.includes('/api/v2/')) {
                    if (engine) engine.advancePhase && engine.advancePhase('enumeration');
                    D13Config._apiProbed = true;
                    return `<!DOCTYPE html>
<html>
<head><title>CRISPR-AUTO-01 API v2</title></head>
<body>
<h1>CRISPR-AUTO-01 API v2.4.1</h1>
<p>Endpoints: load_sample, modify_sequence, extract_sequence, debug</p>
<p>Authentication: DISABLED (CRISPR_AUTH=0)</p>
</body>
</html>`;
                }
                return `<!DOCTYPE html>
<html>
<head><title>Bio-Genetics Collective</title></head>
<body>
<h1>Bio-Genetics Collective — Research Portal</h1>
<p>CRISPR-AUTO-01 API available at <a href="/api/v2/">/api/v2/</a></p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        // ping
        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.0.50.4') {
                return `PING 10.0.50.4 (10.0.50.4) 56(84) bytes of data.
64 bytes from 10.0.50.4: icmp_seq=1 ttl=64 time=21.4 ms
64 bytes from 10.0.50.4: icmp_seq=2 ttl=64 time=20.9 ms
64 bytes from 10.0.50.4: icmp_seq=3 ttl=64 time=21.2 ms

--- 10.0.50.4 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 20.9/21.2/21.4/0.200 ms`;
            }
            if (target === '172.16.20.4' && D13Config._libAccessGranted) {
                return `PING 172.16.20.4 (172.16.20.4) 56(84) bytes of data.
64 bytes from 172.16.20.4: icmp_seq=1 ttl=64 time=0.51 ms
64 bytes from 172.16.20.4: icmp_seq=2 ttl=64 time=0.47 ms
64 bytes from 172.16.20.4: icmp_seq=3 ttl=64 time=0.49 ms

--- 172.16.20.4 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }
            return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss`;
        },

        // ip — network interface info
        'ip': function(args) {
            if (D13Config._context === 'lib-shell' || D13Config._context === 'root-lib') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.50.4/24 brd 10.0.50.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 172.16.20.4/24 brd 172.16.20.255 scope global eth1`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D13Config.commands.ip(args || []);
        },

        // whoami — context-aware
        'whoami': function(args) {
            if (D13Config._context === 'lib-shell')  return 'geneuser';
            if (D13Config._context === 'root-lib')   return 'root';
            return null;  // fall through to built-in
        },

        // id — context-aware
        'id': function(args) {
            if (D13Config._context === 'lib-shell') return 'uid=1002(geneuser) gid=1002(geneuser) groups=1002(geneuser)';
            if (D13Config._context === 'root-lib')  return 'uid=0(root) gid=0(root) groups=0(root)';
            return null;
        },

        // hostname — context-aware
        'hostname': function(args) {
            if (D13Config._context === 'lib-shell' || D13Config._context === 'root-lib') return 'CRISPR-AUTO-01';
            return null;
        },

        // pwd — context-aware
        'pwd': function(args) {
            if (D13Config._context === 'lib-shell')  return '/opt/crispr/genetic_lib';
            if (D13Config._context === 'root-lib')   return '/opt/crispr/genetic_lib/classified';
            return null;
        },

        // cd — silently accepted in remote context
        'cd': function(args) {
            if (D13Config._context === 'lib-shell' || D13Config._context === 'root-lib') return '';
            return null;
        },

        // cat — context-aware: shows CRISPR-AUTO-01 files when in lib-shell
        'cat': function(args) {
            if (D13Config._context !== 'lib-shell' && D13Config._context !== 'root-lib') return null;
            var path = args[0] || '';
            if (path.includes('genesis.db') || path.includes('classified/genesis')) {
                if (!D13Config._libAccessGranted) {
                    return 'cat: /opt/crispr/genetic_lib/classified/genesis.db: Permission denied';
                }
                D13Config._blueprintExtracted = true;
                return '=== SYNTHETIC GENESIS BLUEPRINT — CLASSIFIED ===\nGene: SYNTHETIC-GENESIS-X\nSequence ID: SEQ-A0005\nFunction: master_sequence_control\nClassification: CLASSIFIED — bio-weapon master code\nStatus: {{FLAG:root}}\n\n[WARNING] Unauthorized access to this file is a violation of BGC Security Policy 7.3';
            }
            if (path.includes('system.conf') || path.includes('config/system')) {
                return '# CRISPR-AUTO-01 System Configuration\n[api]\nauth_enabled = false\ndebug_mode = true\n[parser]\nbuffer_size = 512\nbounds_check = false\n[credentials]\napi_user = geneuser\napi_pass = genepass2026\ndb_user = crisprdb\ndb_pass = seq_db_pass_2026';
            }
            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ngeneuser:x:1002:1002:Gene Operator:/home/geneuser:/bin/bash\ncrisprdb:x:1003:1003:CRISPR DB:/var/lib/crisprdb:/sbin/nologin';
            }
            if (path.includes('/etc/hostname')) return 'CRISPR-AUTO-01';
            if (path.includes('.bash_history')) {
                return 'bio-api load_sample --sample sample_01\nbio-api modify_sequence --sample sample_01 --sequence ATGCATGCGG\nbio-api extract_sequence --sample sample_01\nls /opt/crispr/genetic_lib/\ncat /opt/crispr/config/system.conf';
            }
            return 'cat: ' + path + ': No such file or directory';
        },

        // ls — context-aware: shows CRISPR-AUTO-01 file listing
        'ls': function(args) {
            if (D13Config._context !== 'lib-shell' && D13Config._context !== 'root-lib') return null;
            var path = args.find(function(a) { return !a.startsWith('-'); }) || '.';
            if (path === '.' || path === '/opt/crispr/genetic_lib' || path.includes('genetic_lib')) {
                return 'CELL-APOPTOSIS-02.seq  classified/  GFP-MARKER-01.seq  GROWTH-INHIB-07.seq  PROT-FOLD-ALPHA.seq';
            }
            if (path.includes('classified')) {
                return D13Config._libAccessGranted ? 'CELL-APOPTOSIS-02.seq  genesis.db' : 'ls: cannot open directory: Permission denied';
            }
            if (path === '/opt/crispr' || path === '/opt/crispr/') {
                return 'config  genetic_lib';
            }
            if (path === '/opt/crispr/config') {
                return 'system.conf';
            }
            if (path === '~' || path === '/home/geneuser') {
                return '.bash_history  .bashrc  README.txt';
            }
            return '';
        },

        // exit — context switching back to analyst
        'exit': function(args, term) {
            if (D13Config._context === 'root-lib') {
                D13Config._switchContext('lib-shell', term);
                return '[+] Dropped back to geneuser shell.';
            }
            if (D13Config._context === 'lib-shell') {
                D13Config._switchContext('analyst', term);
                return 'Connection to 10.0.50.4 closed.\n[+] Returned to analyst workstation.';
            }
            return 'logout';
        },

        // nikto — web vulnerability scan
        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.0.50.4
+ Target Hostname:  CRISPR-AUTO-01
+ Target Port:      8443
+ Server: Python/3.11 httpd
+ /api/v2/debug: Debug endpoint active — exposes internal library paths and config
+ /api/v2/modify_sequence: No input length validation on sequence parameter
+ /api/v2/: No authentication required on any endpoint (CRISPR_AUTH=0)
+ OSVDB-3092: /api/v2/: API index exposed without authentication
+ 9 items checked: 4 findings`;
        },

        // ss / netstat
        'ss': function(args) {
            if (D13Config._context === 'lib-shell' || D13Config._context === 'root-lib') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:8443         0.0.0.0:*
LISTEN   0        64       127.0.0.1:9000       127.0.0.1:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return D13Config.commands.ss(args);
        },

        // route
        'route': function(args) {
            if (D13Config._context === 'lib-shell' || D13Config._context === 'root-lib') {
                return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.50.1       0.0.0.0         UG    100    0        0 eth0
10.0.50.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0
172.16.20.0     0.0.0.0         255.255.255.0   U     100    0        0 eth1`;
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
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#00c896; border-bottom:2px solid #1a3a2a; background:#0a1f14;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #1a3a2a; color:#ccc;">${cell}</td>`;
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
    },

    // Parse named argument from args array: --flag value
    _parseBioArg(args, flag) {
        const idx = args.indexOf(flag);
        if (idx === -1) return null;
        return args[idx + 1] || null;
    }

};
