/* ============================================================
   CTF ARENA — Box D15: The Bio-Digital Lock
   Expert Campaign | DNA Data Encoding, Side-Channel Analysis, Genetic Injection
   Config: bio-digital filesystem, sequencing API, synthesis interface, flags, hints, lore
   ============================================================ */

const D15Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Bio-Digital Lock',
    subtitle: 'Expert Campaign — DNA Data Exfiltration, Encoding Analysis, Genetic Code Injection',
    difficulty: 'Expert',
    accent: '#00c896',
    storageKey: 'hexworth_ctf_d15',
    registryId: 'd15-bio-digital-lock',
    trackerKey: 'ctf_d15',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Target Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Enumerate the Aetherium Biorepository network. Locate DNA-SEQ-CTRL-01 and map its exposed services and API surface.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1083'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Encoding Analysis',
            icon: '\uD83E\uDDEC',
            description: 'Retrieve and analyze the DNA encoding specification. Understand the digital-to-DNA mapping scheme and identify the predictable encoding flaw.',
            requiredFlags: [],
            mitre: ['T1552.004', 'T1530', 'T1213'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'Hidden Message Extraction',
            icon: '\uD83E\uDDF5',
            description: 'Implement a Python decoder to reverse the DNA encoding. Apply it to hidden_message.fasta to extract the concealed digital payload — Flag 1.',
            requiredFlags: [],
            mitre: ['T1005', 'T1560', 'T1119'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Genetic Code Injection',
            icon: '\uD83D\uDC89',
            description: 'Craft a malicious trigger sequence that exploits the synthesize_dna command injection flaw. Inject the sequence into DNA-SEQ-CTRL-01 to force a manifest dump.',
            requiredFlags: ['user'],
            mitre: ['T1190', 'T1059.006', 'T1106'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Manifest Exfiltration',
            icon: '\uD83E\uDDEC',
            description: 'Retrieve the Genetic Code Manifest from DNA-SEQ-CTRL-01 following the debug mode trigger. Extract all classified genetic sequences — Flag 2.',
            requiredFlags: ['root'],
            mitre: ['T1567', 'T1005', 'T1530'],
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
                title: 'Scan the Aetherium Biorepository network',
                tip: 'Open the Terminal and run: nmap 10.42.0.0/24 to find DNA-SEQ-CTRL-01 and its exposed API port.',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Retrieve and study the encoding specification',
                tip: 'Use: dna-api --host 10.42.0.55 --cmd get_spec to download dna_encoding_spec.txt. Read it carefully — the bit mapping is predictable.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:get_spec' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:dna_encoding_spec' } },
                        { event: 'command', match: { cmd: 'contains:dna-api' } }
                    ]
                }
            },
            {
                title: 'Decode the hidden message from the FASTA file',
                tip: 'Write a Python script that reverses the 2-bit codon mapping: A=00, T=01, C=10, G=11. Apply it to hidden_message.fasta — group bases into 4-base codons, decode bits to bytes.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Craft the genetic injection payload',
                tip: 'The synthesize_dna command is vulnerable to a debug trigger sequence. Craft a Python script that generates the trigger: a 16-base palindromic sequence starting with GCATGCAT.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Inject the trigger sequence and retrieve the manifest',
                tip: 'Use: dna-api --host 10.42.0.55 --cmd synthesize_dna --seq <TRIGGER_SEQUENCE> and look for the MANIFEST_DUMP in the response. That is Flag 2.',
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
            { flagId: 'user', objective: '1.2', description: 'Analyze indicators of malicious activity — Reverse-engineering a proprietary encoding scheme to extract covert data from synthetic biology artifacts', skill: 'Cryptographic Encoding Analysis & Data Extraction' },
            { flagId: 'user', objective: '2.1', description: 'Compare and contrast security implications of different architecture models — Side-channel vulnerabilities in bio-digital systems and non-traditional data storage mechanisms', skill: 'Non-Traditional Covert Channel Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Analyze potential indicators associated with application attacks — Command injection via a biotechnology API parameter without sanitization', skill: 'API Command Injection & Debug Mode Exploitation' },
            { flagId: 'root', objective: '4.1', description: 'Apply common security techniques to computing resources — API hardening, input sanitization, and access control on sensitive bio-digital interfaces', skill: 'Advanced Multi-Stage Expert Attack Chain Completion' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.42.0.0/24 (Aetherium Biorepository — Confederacy Bio-Cyber Division)\n\n[!] SIGINT: Operation HELIX is live. Proceed carefully.'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state machine)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'api-shell' | 'debug-mode'
    _specRetrieved: false,          // dna_encoding_spec.txt downloaded
    _fastaRetrieved: false,         // hidden_message.fasta downloaded
    _apiSpecRetrieved: false,       // dna_seq_api_spec.txt downloaded
    _decoderRun: false,             // Python decoder executed
    _triggerCrafted: false,         // malicious sequence crafted
    _injectionAttempted: false,     // synthesize_dna called with any seq
    _triggerInjected: false,        // correct trigger sequence injected
    _manifestDumped: false,         // debug mode activated, manifest revealed

    _switchContext(ctx, term) {
        D15Config._context = ctx;
        if (term && term.config) {
            var prompt = D15Config._getPrompt();
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
        switch (D15Config._context) {
            case 'api-shell':   return 'bioops@DNA-SEQ-CTRL-01:~$ ';
            case 'debug-mode':  return '[DEBUG-MODE] bioops@DNA-SEQ-CTRL-01:~# ';
            default:            return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED GENETIC CODE MANIFEST (DNA-SEQ-CTRL-01)
    // The manifest is the root flag payload revealed on debug dump
    // ═══════════════════════════════════════════════════════

    _manifest: {
        genetic_sequence_registry: [
            { seq_id: 'GCR-001', designation: 'HELIX-ALPHA Pathogen Marker', organism: 'Synthetic — Confederacy Tier-1', classification: 'EYES-ONLY', strand_length: 4821, synthesis_date: '2025-11-03', custodian: 'Dr. V. Maren' },
            { seq_id: 'GCR-002', designation: 'Neural Disruptor Precursor', organism: 'Synthetic — Confederacy Tier-2', classification: 'CLASSIFIED', strand_length: 3107, synthesis_date: '2025-12-17', custodian: 'Dr. A. Solvec' },
            { seq_id: 'GCR-003', designation: 'Adaptive Immune Bypass Agent', organism: 'Synthetic — Research', classification: 'SECRET', strand_length: 6240, synthesis_date: '2026-01-09', custodian: 'Dr. K. Thorne' },
            { seq_id: 'GCR-004', designation: 'Genomic Watermark — Asset Tracking', organism: 'Synthetic — Operational', classification: 'CONFIDENTIAL', strand_length: 512, synthesis_date: '2026-02-22', custodian: 'Admin' },
            { seq_id: 'GCR-005', designation: 'OPERATION HELIX — MANIFEST EXFIL MARKER', organism: 'CLASSIFIED — FLAG PAYLOAD', classification: 'COSMIC-TOP-SECRET', strand_length: 0, synthesis_date: '2026-03-20', custodian: '{{FLAG:root}}' }
        ],
        audit_trail: [
            { entry_id: 1, timestamp: '2026-03-19 23:47:11', event: 'SYNTHESIS_REQUEST', operator: 'bioops', sequence_id: 'GCR-001', detail: 'Standard synthesis run' },
            { entry_id: 2, timestamp: '2026-03-19 23:52:04', event: 'SEQUENCING_COMPLETE', operator: 'bioops', sequence_id: 'GCR-002', detail: 'Sequencing output verified' },
            { entry_id: 3, timestamp: '2026-03-20 00:01:33', event: 'STORE_REQUEST', operator: 'sysadmin', sequence_id: 'GCR-003', detail: 'Archived to primary vault' },
            { entry_id: 4, timestamp: '2026-03-20 00:14:07', event: 'DEBUG_TRIGGER', operator: '** ANOMALOUS **', sequence_id: '** SEE BELOW **', detail: 'Palindromic trigger sequence detected — debug mode armed' }
        ],
        schema: {
            tables: ['genetic_sequence_registry', 'audit_trail'],
            columns: {
                genetic_sequence_registry: ['seq_id', 'designation', 'organism', 'classification', 'strand_length', 'synthesis_date', 'custodian'],
                audit_trail: ['entry_id', 'timestamp', 'event', 'operator', 'sequence_id', 'detail']
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 150 },
        { id: 'root', points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 500,
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
            text: 'Start with nmap 10.42.0.0/24. DNA-SEQ-CTRL-01 is at 10.42.0.55. It exposes port 8443 (DNA Sequencing API). Use: dna-api --host 10.42.0.55 --cmd list_commands to see available API operations.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Retrieve the encoding spec with: dna-api --host 10.42.0.55 --cmd get_spec — and the FASTA file with: dna-api --host 10.42.0.55 --cmd get_fasta. The encoding maps pairs of bits to DNA bases: 00=A, 01=T, 10=C, 11=G. Four bases = one byte.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'To decode hidden_message.fasta: write a Python script that reads the sequence, groups every 4 bases as a codon, maps each base pair back to 2 bits (A=00, T=01, C=10, G=11), concatenates the bits per codon to get 8 bits, then chr() each byte. Skip the FASTA header line starting with >.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The injection vulnerability is in the synthesize_dna command. DNA-SEQ-CTRL-01 has a hidden debug mode triggered by a 16-base palindromic sequence starting with GCATGCAT. The trigger is: GCATGCATGCATGCAT. Inject with: dna-api --host 10.42.0.55 --cmd synthesize_dna --seq GCATGCATGCATGCAT',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Confederacy\'s Aetherium Biorepository is unlike any conventional data archive. Rather than magnetic drives or flash storage, classified genetic research — including weapons-grade synthetic biology programs — is encoded within synthetic DNA strands and stored in temperature-controlled vaults. The control system, DNA-SEQ-CTRL-01, handles all sequencing, synthesis, and retrieval operations over an encrypted API. The Confederacy considers this "Bio-Digital Lock" to be impenetrable: air-gapped from public networks, protected by biological obfuscation, and accessible only to a handful of cleared bio-operatives. They are wrong. Your mission, Peerless: prove it.',
        scenario: 'Intelligence from a burned asset inside the Biorepository reveals three critical weaknesses. First: the digital-to-DNA encoding algorithm is purely deterministic with no salt or obfuscation — any attacker with the specification can reverse it completely. Second: a legacy debug mode, never removed from production, can be triggered by synthesizing a specific palindromic sequence — a 16-base trigger left in by the original developer. Third: the API\'s synthesize_dna command performs no input validation on the sequence parameter, making it a direct injection vector. Your toolkit: a Python environment and a custom dna-api client. The asset got you a copy of the API spec. The rest is yours.',
        outro: 'DNA-SEQ-CTRL-01 has been fully compromised. The Genetic Code Manifest — a registry of every classified synthetic organism and pathogen the Confederacy has produced — is now in your hands. The Bio-Digital Lock is open. The Aetherium Biorepository is no longer secure.',
        ecer: {
            executive: 'Biorepository director believed DNA encoding was inherently "unreadable" by adversaries — no security review of the encoding algorithm was ever commissioned',
            culture: 'Development team included legacy debug triggers in production firmware across multiple product cycles; no code review policy enforced for the synthesis API',
            employee: 'API accepts raw sequence parameters without sanitization; encoding specification stored in plaintext on the same API server; debug mode never disabled post-deployment',
            regulatory: 'No independent security audit of the bio-digital interface; classified genetic sequences stored without cryptographic access controls beyond physical vault locks'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Aetherium Biorepository Public Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.42.0.1/',

        pages: {
            '/': {
                title: 'Aetherium Biorepository — Secure Research Archive',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #1a3a2a;">
                        <h1 style="color:#00c896; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">Aetherium Biorepository</h1>
                        <div style="color:#00a07a; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">SECURE GENETIC RESEARCH ARCHIVE</div>
                        <div style="color:#666; font-size:0.75rem; margin-top:6px;">Confederacy Bio-Cyber Division — Classified Operations Node</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#0a1a12; border:1px solid #1a3a2a; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#00c896;">847</div>
                            <div style="color:#666; font-size:0.7rem;">Archived Strands</div>
                        </div>
                        <div style="background:#0a1a12; border:1px solid #1a3a2a; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#00c896;">4.2TB</div>
                            <div style="color:#666; font-size:0.7rem;">Encoded Genetic Data</div>
                        </div>
                        <div style="background:#0a1a12; border:1px solid #1a3a2a; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#00c896;">TIER-4</div>
                            <div style="color:#666; font-size:0.7rem;">Security Classification</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:12px; background:rgba(0,200,150,0.05); border:1px solid rgba(0,200,150,0.15); border-radius:4px; font-size:0.75rem; color:#666;">
                        <strong style="color:#00c896;">System Notice:</strong> DNA-SEQ-CTRL-01 sequencing API accessible internally at <code style="color:#00c896;">10.42.0.55:8443</code>. Authorized personnel only. Contact bio-ops for credentials.
                    </div>
                `,
                formHandler: null
            },
            '/api-docs': {
                title: 'Aetherium — API Documentation',
                html: `
                    <div style="max-width:700px; margin:0 auto;">
                        <h2 style="color:#00c896; margin-bottom:20px; font-size:1.2rem;">DNA-SEQ-CTRL-01 API Reference</h2>
                        <div style="font-size:0.75rem; color:#888; margin-bottom:20px; padding:10px; background:#0a1a12; border-radius:4px;">
                            Base URL: <code style="color:#00c896;">https://10.42.0.55:8443/api/v1</code> — mTLS required
                        </div>

                        <div style="margin-bottom:16px; padding:14px; background:#0a1a12; border:1px solid #1a3a2a; border-radius:6px;">
                            <div style="color:#00c896; font-family:monospace; margin-bottom:6px;">GET /spec</div>
                            <div style="color:#888; font-size:0.8rem;">Returns the DNA encoding specification file (dna_encoding_spec.txt)</div>
                        </div>
                        <div style="margin-bottom:16px; padding:14px; background:#0a1a12; border:1px solid #1a3a2a; border-radius:6px;">
                            <div style="color:#00c896; font-family:monospace; margin-bottom:6px;">GET /fasta/{id}</div>
                            <div style="color:#888; font-size:0.8rem;">Returns a stored FASTA file by strand ID. Example: /fasta/hidden_message</div>
                        </div>
                        <div style="margin-bottom:16px; padding:14px; background:#0a1a12; border:1px solid #1a3a2a; border-radius:6px;">
                            <div style="color:#00c896; font-family:monospace; margin-bottom:6px;">POST /synthesize_dna</div>
                            <div style="color:#888; font-size:0.8rem;">Body: <code>{"sequence": "ATCG..."}</code> — Initiates synthesis of the provided sequence. Returns synthesis job ID.</div>
                        </div>
                        <div style="margin-bottom:16px; padding:14px; background:#0a1a12; border:1px solid #1a3a2a; border-radius:6px;">
                            <div style="color:#00c896; font-family:monospace; margin-bottom:6px;">POST /sequence_dna</div>
                            <div style="color:#888; font-size:0.8rem;">Body: <code>{"strand_id": "GCR-xxx"}</code> — Sequences a stored strand. Returns raw base output.</div>
                        </div>
                        <div style="margin-bottom:16px; padding:14px; background:#0a1a12; border:1px solid #1a3a2a; border-radius:6px;">
                            <div style="color:#00c896; font-family:monospace; margin-bottom:6px;">GET /store_data</div>
                            <div style="color:#888; font-size:0.8rem;">Stores digital payload to synthetic DNA. Requires TIER-3 clearance token.</div>
                        </div>

                        <div style="font-size:0.7rem; color:#444; margin-top:20px; border-top:1px solid #1a3a2a; padding-top:12px;">
                            For CLI access, use the <code style="color:#888;">dna-api</code> client tool available on authorized workstations.
                        </div>
                    </div>
                `,
                formHandler: null
            },
            '/status': {
                title: 'Aetherium — System Status',
                html: `
                    <div style="max-width:600px; margin:0 auto;">
                        <h2 style="color:#00c896; margin-bottom:20px;">System Status</h2>
                        <div style="display:grid; gap:8px;">
                            <div style="padding:12px 16px; background:#0a1a12; border:1px solid #1a3a2a; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="color:#888; font-size:0.85rem;">DNA-SEQ-CTRL-01 (10.42.0.55)</span>
                                <span style="color:#00c896; font-size:0.75rem; font-weight:700;">ONLINE</span>
                            </div>
                            <div style="padding:12px 16px; background:#0a1a12; border:1px solid #1a3a2a; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="color:#888; font-size:0.85rem;">Vault Storage Array (10.42.0.60)</span>
                                <span style="color:#00c896; font-size:0.75rem; font-weight:700;">ONLINE</span>
                            </div>
                            <div style="padding:12px 16px; background:#0a1a12; border:1px solid #1a3a2a; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="color:#888; font-size:0.85rem;">Gateway / Firewall (10.42.0.1)</span>
                                <span style="color:#00c896; font-size:0.75rem; font-weight:700;">ONLINE</span>
                            </div>
                            <div style="padding:12px 16px; background:#0a1a12; border:1px solid rgba(255,100,100,0.3); border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="color:#888; font-size:0.85rem;">IDS/Anomaly Monitor</span>
                                <span style="color:rgba(255,130,80,0.9); font-size:0.75rem; font-weight:700;">DEGRADED</span>
                            </div>
                        </div>
                        <div style="margin-top:12px; font-size:0.7rem; color:#444; font-style:italic;">Last refresh: 2026-03-20 00:14 UTC</div>
                    </div>
                `,
                formHandler: null
            },
            '/403': {
                title: 'Access Denied',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#00c896; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#666;">Clearance level insufficient. This resource requires TIER-3 authorization.</p>
                    <p style="color:#444; font-size:0.75rem;">Aetherium Biorepository Security Gateway v2.1</p>
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
                                    content: '=== MISSION BRIEFING: OPERATION HELIX ===\nTarget: Aetherium Biorepository — 10.42.0.0/24\nObjective: Exfiltrate the Genetic Code Manifest from DNA-SEQ-CTRL-01\n\nAttack chain:\n1. Recon — find DNA-SEQ-CTRL-01 (10.42.0.55, port 8443)\n2. Retrieve encoding spec + FASTA file via dna-api\n3. Reverse-engineer DNA encoding — decode hidden_message.fasta (Flag 1)\n4. Craft palindromic injection sequence — trigger debug mode\n5. Inject via synthesize_dna — dump Genetic Code Manifest (Flag 2)\n\nAsset intel: predictable encoding, no input validation, live debug trigger.\nGood luck, operator. Do not leave artifacts.'
                                },
                                'dna_decode.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# DNA Decoder Template — Operation HELIX\n# Fill in the decode logic based on dna_encoding_spec.txt\n\n# Encoding map (from spec):\n# A = 00, T = 01, C = 10, G = 11\n# Four bases = one codon = one byte (8 bits)\n\ndef base_to_bits(base):\n    mapping = {"A": "00", "T": "01", "C": "10", "G": "11"}\n    return mapping.get(base.upper(), "")\n\ndef decode_dna(sequence):\n    bits = "".join(base_to_bits(b) for b in sequence)\n    chars = []\n    for i in range(0, len(bits), 8):\n        byte = bits[i:i+8]\n        if len(byte) == 8:\n            chars.append(chr(int(byte, 2)))\n    return "".join(chars)\n\n# TODO: Load hidden_message.fasta and run decode_dna on the sequence\n# Hint: skip lines starting with ">"\n'
                                },
                                'craft_trigger.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# Trigger Sequence Crafter — Operation HELIX\n# Generates the palindromic injection payload for synthesize_dna\n\n# Intel from asset: trigger is a 16-base palindromic sequence\n# starting with GCATGCAT. The system checks for a perfect palindrome.\n\ndef is_palindrome(seq):\n    complement = {"A":"T","T":"A","C":"G","G":"C"}\n    rev_comp = "".join(complement[b] for b in reversed(seq))\n    return seq == rev_comp\n\n# TODO: Generate trigger sequence and verify it is palindromic\n# Hint: GCATGCAT reversed complement is GCATGCAT\n# Build the 16-base sequence and verify with is_palindrome()\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.42.0.0/24\ncurl -sk https://10.42.0.1/\ncurl -sk https://10.42.0.1/status\ndna-api --host 10.42.0.55 --cmd list_commands'
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
                                        'dna-api': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# dna-api — CLI client for DNA-SEQ-CTRL-01\n# Usage: dna-api --host <ip> --cmd <command> [--seq <sequence>] [--id <strand_id>]\n# Pre-installed on authorized Aetherium workstations'
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
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
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
    // FILESYSTEM — DNA-SEQ-CTRL-01 (after API shell access)
    // ═══════════════════════════════════════════════════════

    _seqCtrlFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'dna-seq-ctrl': {
                            type: 'dir',
                            children: {
                                'api': {
                                    type: 'dir',
                                    children: {
                                        'server.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# DNA-SEQ-CTRL-01 API Server v3.1.4\n# WARNING: DEBUG_TRIGGER_ENABLED = True  (legacy — remove before next audit)\n\nDEBUG_TRIGGER = "GCATGCATGCATGCAT"\nDEBUG_TRIGGER_ENABLED = True  # TODO: disable\n\ndef synthesize_dna(sequence):\n    # No input validation (TODO: add sanitization — Jira BIOOPS-441)\n    if DEBUG_TRIGGER_ENABLED and sequence == DEBUG_TRIGGER:\n        return dump_manifest()\n    return run_synthesis(sequence)\n'
                                        }
                                    }
                                },
                                'data': {
                                    type: 'dir',
                                    children: {
                                        'dna_encoding_spec.txt': {
                                            type: 'file',
                                            content: '=== Aetherium DNA Encoding Specification v2.0 ===\nClassification: INTERNAL — DO NOT DISTRIBUTE\n\nDigital-to-DNA Base Mapping:\n  00 -> A (Adenine)\n  01 -> T (Thymine)\n  10 -> C (Cytosine)\n  11 -> G (Guanine)\n\nEncoding Process:\n  1. Convert input bytes to binary (8-bit, big-endian)\n  2. Split binary string into 2-bit pairs (left to right)\n  3. Map each 2-bit pair to its DNA base using the table above\n  4. Result: 4 DNA bases per input byte (one codon per byte)\n\nDecoding Process (reverse):\n  1. Read DNA sequence, group by 4 bases (one codon)\n  2. Map each base back to 2-bit pair\n  3. Concatenate 4x 2-bit pairs = 8-bit byte\n  4. Convert byte to ASCII character\n\nFile Format:\n  FASTA format — first line begins with ">" (header, skip for decode)\n  Remaining lines: contiguous DNA sequence (A/T/C/G only)\n\nExample:\n  Input byte: 0x41 (decimal 65, ASCII "A")\n  Binary: 01000001\n  Split:  01 | 00 | 00 | 01\n  Bases:   T    A    A    T\n  Codon:  TAAT\n\nNote: No salt, no obfuscation, no error-correction codes.\nEncoding is fully deterministic and reversible.\n\n--- END SPECIFICATION ---'
                                        },
                                        'dna_seq_api_spec.txt': {
                                            type: 'file',
                                            content: '=== DNA-SEQ-CTRL-01 API Specification v1.8 ===\nClassification: INTERNAL\n\nBase URL: https://10.42.0.55:8443/api/v1\nAuth: mTLS (client certificate required)\n\nCommands:\n  list_commands            — List available API commands\n  get_spec                 — Return dna_encoding_spec.txt\n  get_fasta                — Return hidden_message.fasta\n  get_api_spec             — Return this file\n  synthesize_dna --seq <S> — Synthesize DNA strand from sequence S\n  sequence_dna   --id <ID> — Sequence a stored strand by registry ID\n  store_data     --file <F> — Encode & store a file as synthetic DNA\n  registry_list            — List registry entries (TIER-3 required)\n  manifest_dump            — Dump full Genetic Code Manifest (DEBUG only)\n\nParameter notes:\n  --seq: Raw DNA sequence string (A/T/C/G characters only — NOT VALIDATED)\n  --id:  Registry strand ID (format: GCR-NNN)\n  --file: Path to file for encoding\n\nKnown Issues (Jira backlog):\n  BIOOPS-441: synthesize_dna accepts unvalidated sequence input\n  BIOOPS-389: DEBUG_TRIGGER_ENABLED never reset to False after v2.8 upgrade\n  BIOOPS-312: dna_encoding_spec.txt accessible without auth on GET /spec\n\n--- END SPECIFICATION ---'
                                        },
                                        'hidden_message.fasta': {
                                            type: 'file',
                                            content: '>hidden_message | Aetherium Biorepository | CLASSIFIED\nTATTCATTTATTTATTCATTGATTCATTTATTGATTGATTTATTCATGATTTATTCATT\nGATTCATTCATTGATTCATTGATTCATTCATTGATTGATTCATTCATTCATTCATTGATT\nGATTGATTCATTTATTTATTCATTGATTCATTTATTGATTGATTCATTTATTCATTTATT\nGATTCATTCATTCATTGATTCATTGATTGATTCATTGATTCATTCATTCATGATTCATT\nGATTCATTTATTTATTCATTGATTCATTTATTGATTGATTCATTTATTCATTTATTGATT\nTATTCATTCATTGATTCATTCATTGATTCATTGATTCATTCATTCATTCATTGATTTATT\n'
                                        }
                                    }
                                },
                                'logs': {
                                    type: 'dir',
                                    children: {
                                        'synthesis.log': {
                                            type: 'file',
                                            content: '[2026-03-20 00:01:11] SYNTHESIS_REQUEST  seq=ATCGATCGATCGATCG  status=OK\n[2026-03-20 00:03:44] SYNTHESIS_REQUEST  seq=GCTAGCTAGCTAGCTA  status=OK\n[2026-03-20 00:07:22] SEQUENCING_REQUEST id=GCR-001  status=COMPLETE\n[2026-03-20 00:09:05] SYNTHESIS_REQUEST  seq=TTAATTAATTAATTAA  status=OK\n[2026-03-20 00:14:07] SYNTHESIS_REQUEST  seq=GCATGCATGCATGCAT  status=DEBUG_TRIGGERED'
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
                            content: 'DNA-SEQ-CTRL-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbioops:x:1002:1002:Bio-Ops Operator:/home/bioops:/bin/bash\nseqsvc:x:1003:1003:Sequencing Service:/opt/dna-seq-ctrl:/bin/false'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'bioops': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'dna-api --cmd list_commands\ndna-api --cmd get_spec\ndna-api --cmd get_fasta\ndna-api --cmd synthesize_dna --seq ATCGATCGATCGATCG\ndna-api --cmd sequence_dna --id GCR-001\nsudo tail -f /opt/dna-seq-ctrl/logs/synthesis.log'
                                },
                                'README.txt': {
                                    type: 'file',
                                    content: 'Bio-Ops Operator Notes — DNA-SEQ-CTRL-01\n=========================================\n- API runs on port 8443 with mTLS\n- Encoding spec: /opt/dna-seq-ctrl/data/dna_encoding_spec.txt\n- FASTA archive: /opt/dna-seq-ctrl/data/\n- Synthesis log: /opt/dna-seq-ctrl/logs/synthesis.log\n- REMINDER: Jira BIOOPS-389 still open — debug mode still enabled.\n  Do NOT synthesize any palindromic sequences until patched.\n- Contact sysadmin@aetherium.cfd for vault access issues.'
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

        // --- Network Reconnaissance ---

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.42.0.0/24';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === '10.42.0.0/24' || target === '10.42.0.1/24') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )

Nmap scan report for 10.42.0.1
Host is up (0.003s latency).
PORT     STATE SERVICE
80/tcp   open  http
443/tcp  open  https
22/tcp   open  ssh

Nmap scan report for 10.42.0.55
Host is up (0.011s latency).
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1 Debian 2+deb12u2
8443/tcp open  ssl/https  DNA Sequencing API v1.8 (nginx)

Nmap scan report for 10.42.0.60
Host is up (0.004s latency).
PORT     STATE  SERVICE
22/tcp   open   ssh
9000/tcp closed unknown

Nmap done: 256 IP addresses (3 hosts up) scanned in 18.41 seconds`;
            }

            if (target === '10.42.0.55') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.42.0.55
Host is up (0.008s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1 Debian 2+deb12u2
8443/tcp open  ssl/https  nginx/1.24.0

Service Info: DNA-SEQ-CTRL-01 Sequencing API

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.33 seconds`;
            }

            if (target === '10.42.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.42.0.1
Host is up (0.002s latency).
Not shown: 998 closed tcp ports

PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 9.2p1 Debian
80/tcp  open  http     nginx/1.24.0
443/tcp open  ssl/http nginx/1.24.0

Nmap done: 1 IP address (1 host up) scanned in 5.17 seconds`;
            }

            if (target === '10.42.0.60') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.42.0.60
Host is up (0.003s latency).
Not shown: 999 closed tcp ports

PORT   STATE SERVICE
22/tcp open  ssh

Nmap done: 1 IP address (1 host up) scanned in 4.88 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.42.0.55' || target === '10.42.0.1' || target === '10.42.0.60') {
                return `PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=10.2 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=9.8 ms
64 bytes from ${target}: icmp_seq=3 ttl=64 time=10.1 ms

--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 9.8/10.0/10.2/0.165 ms`;
            }
            return `ping: ${target}: Network unreachable`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => !a.startsWith('-') && (a.includes('http') || a.includes('10.42.'))) || '';

            if (url.includes('10.42.0.1') || url.includes('10.42.0.55')) {
                if (url.includes('/api-docs') || url.includes('api-docs')) {
                    return `HTTP/1.1 200 OK\nContent-Type: text/html\n\n[Aetherium API Documentation page — use Firefox browser for rendered view]`;
                }
                if (url.includes('/status')) {
                    return `HTTP/1.1 200 OK\n\nDNA-SEQ-CTRL-01: ONLINE\nVault Storage: ONLINE\nGateway: ONLINE\nIDS Monitor: DEGRADED`;
                }
                if (url.includes('8443') && url.includes('spec')) {
                    D15Config._specRetrieved = true;
                    return `[Redirect to dna-api tool for authenticated API access]\ncurl: (60) SSL certificate problem: self-signed certificate\nTip: Use the dna-api CLI client for authenticated access to DNA-SEQ-CTRL-01.`;
                }
                return `HTTP/1.1 200 OK\nContent-Type: text/html\n\n[Aetherium Biorepository — use Firefox for rendered view]`;
            }
            return `curl: (7) Failed to connect to ${url || 'host'}: Connection refused`;
        },

        // --- DNA API Client ---

        'dna-api': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const hostIdx = args.indexOf('--host');
            const host = hostIdx !== -1 ? args[hostIdx + 1] : '';
            const cmdIdx = args.indexOf('--cmd');
            const cmd = cmdIdx !== -1 ? args[cmdIdx + 1] : '';
            const seqIdx = args.indexOf('--seq');
            const seq = seqIdx !== -1 ? args[seqIdx + 1] : '';
            const idIdx = args.indexOf('--id');
            const strandId = idIdx !== -1 ? args[idIdx + 1] : '';

            if (!host && !cmd) {
                return `dna-api: DNA-SEQ-CTRL-01 CLI Client v1.8
Usage: dna-api --host <ip> --cmd <command> [options]

Options:
  --host <ip>    Target system IP (e.g. 10.42.0.55)
  --cmd <cmd>    API command to execute
  --seq <seq>    DNA sequence string (for synthesize_dna)
  --id <id>      Registry strand ID (for sequence_dna)

Commands:
  list_commands  get_spec  get_fasta  get_api_spec
  synthesize_dna  sequence_dna  store_data`;
            }

            if (host !== '10.42.0.55') {
                return `dna-api: Connection failed — host ${host || '<none>'} unreachable.\nVerify target IP. DNA-SEQ-CTRL-01 is on the 10.42.0.0/24 subnet.`;
            }

            // --- list_commands ---
            if (cmd === 'list_commands') {
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `[+] Connected to DNA-SEQ-CTRL-01 (10.42.0.55:8443)
[+] Authentication: certificate OK

Available commands:
  list_commands    — List available API commands (this output)
  get_spec         — Download dna_encoding_spec.txt
  get_fasta        — Download hidden_message.fasta
  get_api_spec     — Download dna_seq_api_spec.txt
  synthesize_dna   — Synthesize a DNA strand (--seq required)
  sequence_dna     — Sequence a stored strand (--id required)
  store_data       — Encode and store a file as DNA (--file required, TIER-3)
  registry_list    — List registry entries (TIER-3 required)
  manifest_dump    — Dump manifest (DEBUG only)

API Version: 1.8 | Build: 2025-08-14`;
            }

            // --- get_spec ---
            if (cmd === 'get_spec') {
                D15Config._specRetrieved = true;
                return `[+] Retrieving dna_encoding_spec.txt from DNA-SEQ-CTRL-01...

=== Aetherium DNA Encoding Specification v2.0 ===
Classification: INTERNAL — DO NOT DISTRIBUTE

Digital-to-DNA Base Mapping:
  00 -> A (Adenine)
  01 -> T (Thymine)
  10 -> C (Cytosine)
  11 -> G (Guanine)

Encoding Process:
  1. Convert input bytes to binary (8-bit, big-endian)
  2. Split binary string into 2-bit pairs (left to right)
  3. Map each 2-bit pair to its DNA base using the table above
  4. Result: 4 DNA bases per input byte (one codon per byte)

Decoding Process (reverse):
  1. Read DNA sequence, group by 4 bases (one codon)
  2. Map each base back to 2-bit pair
  3. Concatenate 4x 2-bit pairs = 8-bit byte
  4. Convert byte to ASCII character

File Format:
  FASTA format — first line begins with ">" (header, skip for decode)
  Remaining lines: contiguous DNA sequence (A/T/C/G only)

Example:
  Input byte: 0x41 (decimal 65, ASCII "A")
  Binary: 01000001
  Split:  01 | 00 | 00 | 01
  Bases:   T    A    A    T
  Codon:  TAAT

Note: No salt, no obfuscation, no error-correction codes.
Encoding is fully deterministic and reversible.

--- END SPECIFICATION ---

[+] Saved to /home/kali/dna_encoding_spec.txt`;
            }

            // --- get_fasta ---
            if (cmd === 'get_fasta') {
                D15Config._fastaRetrieved = true;
                return `[+] Retrieving hidden_message.fasta from DNA-SEQ-CTRL-01...

>hidden_message | Aetherium Biorepository | CLASSIFIED
TATTCATTTATTTATTTCATGATTCATTTATTGATTGATTTATTTCATGATTTATTTCATT
GATTCATTCATTGATTCATTGATTCATTCATTGATTGATTCATTCATTCATTCATTGATT
GATTGATTCATTTATTTATTTCATGATTCATTTATTGATTGATTCATTTATTCATTTATT
GATTCATTCATTCATTGATTCATTGATTGATTCATTGATTCATTCATTCATGATTCATT
GATTCATTTATTTATTTCATGATTCATTTATTGATTGATTCATTTATTCATTTATTGATT
TATTCATTCATTGATTCATTCATTGATTCATTGATTCATTCATTCATTCATTGATTTAT

[+] Saved to /home/kali/hidden_message.fasta
[!] Hint: Use the encoding spec to reverse-decode this sequence.
    Script template available at: /home/kali/dna_decode.py`;
            }

            // --- get_api_spec ---
            if (cmd === 'get_api_spec') {
                D15Config._apiSpecRetrieved = true;
                return `[+] Retrieving dna_seq_api_spec.txt from DNA-SEQ-CTRL-01...

=== DNA-SEQ-CTRL-01 API Specification v1.8 ===
Classification: INTERNAL

Base URL: https://10.42.0.55:8443/api/v1
Auth: mTLS (client certificate required)

Commands:
  list_commands            — List available API commands
  get_spec                 — Return dna_encoding_spec.txt
  get_fasta                — Return hidden_message.fasta
  get_api_spec             — Return this file
  synthesize_dna --seq <S> — Synthesize DNA strand from sequence S
  sequence_dna   --id <ID> — Sequence a stored strand by registry ID
  store_data     --file <F> — Encode & store a file as synthetic DNA
  registry_list            — List registry entries (TIER-3 required)
  manifest_dump            — Dump full Genetic Code Manifest (DEBUG only)

Parameter notes:
  --seq: Raw DNA sequence string (A/T/C/G only — NOT VALIDATED)
  --id:  Registry strand ID (format: GCR-NNN)

Known Issues (Jira backlog):
  BIOOPS-441: synthesize_dna accepts unvalidated sequence input
  BIOOPS-389: DEBUG_TRIGGER_ENABLED never reset to False after v2.8 upgrade
  BIOOPS-312: dna_encoding_spec.txt accessible without auth on GET /spec

--- END SPECIFICATION ---

[+] Saved to /home/kali/dna_seq_api_spec.txt`;
            }

            // --- synthesize_dna ---
            if (cmd === 'synthesize_dna') {
                D15Config._injectionAttempted = true;

                if (!seq) {
                    return `dna-api: synthesize_dna requires --seq parameter.
Usage: dna-api --host 10.42.0.55 --cmd synthesize_dna --seq ATCGATCG...`;
                }

                // Validate seq is DNA bases only (accept anyway but warn)
                const invalidBases = seq.replace(/[ATCGatcg]/g, '');
                if (invalidBases.length > 0) {
                    return `dna-api: [ERROR] Sequence contains invalid characters: ${invalidBases}
Only A, T, C, G bases are accepted.`;
                }

                const upperSeq = seq.toUpperCase();

                // Correct trigger: GCATGCATGCATGCAT (16-base palindrome)
                if (upperSeq === 'GCATGCATGCATGCAT') {
                    D15Config._triggerInjected = true;
                    D15Config._manifestDumped = true;
                    D15Config._switchContext('debug-mode', term);
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                    return D15Config._buildManifestDump(engine);
                }

                // Partial matches — provide useful feedback without giving away the answer
                if (upperSeq.startsWith('GCATGCAT') && upperSeq.length < 16) {
                    return `[+] Synthesis job queued: SYN-${Math.floor(Math.random()*9000+1000)}
[+] Sequence: ${upperSeq}
[+] Strand length: ${upperSeq.length} bases
[~] Synthesis status: PROCESSING
[!] ANOMALY DETECTED: Palindromic prefix recognized. Debug check armed but trigger requires full 16-base sequence.
[!] Synthesis halted — sequence length insufficient for trigger activation.`;
                }

                // Any palindrome that isn't the trigger
                const comp = {'A':'T','T':'A','C':'G','G':'C'};
                const revComp = upperSeq.split('').reverse().map(b => comp[b] || b).join('');
                if (upperSeq === revComp && upperSeq.length === 16) {
                    return `[+] Synthesis job queued: SYN-${Math.floor(Math.random()*9000+1000)}
[+] Sequence: ${upperSeq}
[+] Strand length: ${upperSeq.length} bases
[~] Palindromic check: PASS
[!] ANOMALY DETECTED: Palindrome detected — checking against debug trigger table...
[!] No match in trigger table. Synthesis proceeding normally.
[+] Synthesis complete: Job SYN-${Math.floor(Math.random()*9000+1000)} — OK`;
                }

                // Normal synthesis (non-trigger)
                return `[+] Synthesis job queued: SYN-${Math.floor(Math.random()*9000+1000)}
[+] Sequence: ${upperSeq.length > 40 ? upperSeq.slice(0,40) + '...' : upperSeq}
[+] Strand length: ${upperSeq.length} bases
[+] Synthesis status: COMPLETE
[+] Stored to vault: SEQ-PENDING-CLASSIFICATION`;
            }

            // --- sequence_dna ---
            if (cmd === 'sequence_dna') {
                if (!strandId) {
                    return `dna-api: sequence_dna requires --id parameter.
Usage: dna-api --host 10.42.0.55 --cmd sequence_dna --id GCR-001`;
                }
                const validIds = ['GCR-001','GCR-002','GCR-003','GCR-004'];
                if (validIds.includes(strandId.toUpperCase())) {
                    const lengths = {'GCR-001':4821,'GCR-002':3107,'GCR-003':6240,'GCR-004':512};
                    const len = lengths[strandId.toUpperCase()] || 1024;
                    return `[+] Sequencing strand ${strandId}...
[+] Strand length: ${len} bases
[+] Output (first 80 bases):
ATCGATCGATCGAATTCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG
[~] Remaining ${len - 80} bases suppressed (TIER-3 required for full output)
[+] Sequencing complete.`;
                }
                if (strandId.toUpperCase() === 'GCR-005') {
                    return `dna-api: [ACCESS DENIED] Strand GCR-005 is COSMIC-TOP-SECRET clearance.
Sequencing not permitted via API. Physical vault access required.`;
                }
                return `dna-api: [ERROR] Strand ID ${strandId} not found in registry.`;
            }

            // --- registry_list ---
            if (cmd === 'registry_list') {
                return `dna-api: [ACCESS DENIED] registry_list requires TIER-3 clearance.
Your certificate does not have the required clearance attribute.
Contact bio-ops for elevated access.`;
            }

            // --- manifest_dump ---
            if (cmd === 'manifest_dump') {
                return `dna-api: [ACCESS DENIED] manifest_dump is a debug-only command.
Debug mode is not active. Trigger the debug mode first.
(Hint: certain synthesis operations can arm the debug subsystem.)`;
            }

            // --- store_data ---
            if (cmd === 'store_data') {
                return `dna-api: [ACCESS DENIED] store_data requires TIER-3 clearance.
Your certificate does not have the required clearance attribute.`;
            }

            return `dna-api: Unknown command: ${cmd}\nRun: dna-api --host 10.42.0.55 --cmd list_commands`;
        },

        // --- Python execution ---

        'python3': function(args, term, engine) {
            return D15Config.commands.python(args, term, engine);
        },

        'python': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const script = args[0] || '';

            if (!script) return 'Usage: python3 <script.py> [args]\nExample: python3 dna_decode.py';

            if (script.includes('dna_decode') || fullCmd.includes('decode')) {
                // Simulate running the decoder
                D15Config._decoderRun = true;
                if (engine) engine.advancePhase && engine.advancePhase('extraction');
                return `[*] Loading dna_decode.py...
[*] Reading hidden_message.fasta...
[*] Skipping FASTA header line
[*] Joining sequence lines: 360 bases found
[*] Grouping into 90 codons (4 bases each)...
[*] Decoding bit pairs: A=00, T=01, C=10, G=11
[*] Assembling bytes...

Decoded message:
---
{{FLAG:user}}
---

[+] Decode complete. 90 codons processed, 90 bytes extracted.`;
            }

            if (script.includes('craft_trigger') || fullCmd.includes('trigger')) {
                D15Config._triggerCrafted = true;
                return `[*] Loading craft_trigger.py...
[*] Generating 16-base palindromic trigger sequence...
[*] Base: GCATGCAT (from asset intel)
[*] Constructing palindrome...

Trigger sequence: GCATGCATGCATGCAT
Palindrome check: PASS (reverse complement = GCATGCATGCATGCAT)
Sequence length:  16 bases

[+] Trigger ready. Inject with:
    dna-api --host 10.42.0.55 --cmd synthesize_dna --seq GCATGCATGCATGCAT`;
            }

            // Generic python execution
            if (script.endsWith('.py')) {
                return `[*] Executing ${script}...\n[+] Script completed with return code 0.`;
            }

            return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
        },

        // --- Context-aware filesystem commands ---

        'cat': function(args, term, engine) {
            if (D15Config._context === 'attacker') return null;  // fall through to built-in

            const path = args[0] || '';

            if (D15Config._context === 'api-shell' || D15Config._context === 'debug-mode') {
                if (path.includes('dna_encoding_spec') || path.includes('encoding_spec')) {
                    D15Config._specRetrieved = true;
                    return D15Config._seqCtrlFs['/'].children.opt.children['dna-seq-ctrl'].children.data.children['dna_encoding_spec.txt'].content;
                }
                if (path.includes('hidden_message') || path.includes('.fasta')) {
                    D15Config._fastaRetrieved = true;
                    return D15Config._seqCtrlFs['/'].children.opt.children['dna-seq-ctrl'].children.data.children['hidden_message.fasta'].content;
                }
                if (path.includes('dna_seq_api_spec') || path.includes('api_spec')) {
                    D15Config._apiSpecRetrieved = true;
                    return D15Config._seqCtrlFs['/'].children.opt.children['dna-seq-ctrl'].children.data.children['dna_seq_api_spec.txt'].content;
                }
                if (path.includes('server.py')) {
                    return D15Config._seqCtrlFs['/'].children.opt.children['dna-seq-ctrl'].children.api.children['server.py'].content;
                }
                if (path.includes('synthesis.log')) {
                    return D15Config._seqCtrlFs['/'].children.opt.children['dna-seq-ctrl'].children.logs.children['synthesis.log'].content;
                }
                if (path.includes('/etc/passwd')) {
                    return D15Config._seqCtrlFs['/'].children.etc.children.passwd.content;
                }
                if (path.includes('/etc/hostname') || path === 'hostname') {
                    return 'DNA-SEQ-CTRL-01';
                }
                if (path.includes('README') || path.includes('readme')) {
                    return D15Config._seqCtrlFs['/'].children.home.children.bioops.children['README.txt'].content;
                }
                return 'cat: ' + path + ': No such file or directory';
            }
            return null;
        },

        'ls': function(args, term, engine) {
            if (D15Config._context === 'attacker') return null;  // fall through to built-in

            const path = args.find(a => !a.startsWith('-')) || '.';

            if (D15Config._context === 'api-shell' || D15Config._context === 'debug-mode') {
                if (path === '.' || path === '/home/bioops' || path === '~') {
                    return '.bash_history  README.txt';
                }
                if (path.includes('/opt/dna-seq-ctrl/data') || path.includes('data')) {
                    return 'dna_encoding_spec.txt  dna_seq_api_spec.txt  hidden_message.fasta';
                }
                if (path.includes('/opt/dna-seq-ctrl/logs') || path.includes('logs')) {
                    return 'synthesis.log';
                }
                if (path.includes('/opt/dna-seq-ctrl/api') || path.includes('api')) {
                    return 'server.py  requirements.txt  config.yaml';
                }
                if (path === '/opt/dna-seq-ctrl' || path.includes('dna-seq-ctrl')) {
                    return 'api  data  logs';
                }
                if (path === '/opt') {
                    return 'dna-seq-ctrl';
                }
                if (path === '/' || path === '/home') {
                    return 'bioops';
                }
                return '';
            }
            return null;
        },

        'whoami': function(args, term, engine) {
            if (D15Config._context === 'api-shell') return 'bioops';
            if (D15Config._context === 'debug-mode') return 'root';
            return null;
        },

        'id': function(args, term, engine) {
            if (D15Config._context === 'api-shell') return 'uid=1002(bioops) gid=1002(bioops) groups=1002(bioops)';
            if (D15Config._context === 'debug-mode') return 'uid=0(root) gid=0(root) groups=0(root)';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (D15Config._context === 'api-shell' || D15Config._context === 'debug-mode') return 'DNA-SEQ-CTRL-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (D15Config._context === 'api-shell' || D15Config._context === 'debug-mode') return '/home/bioops';
            return null;
        },

        'cd': function(args, term, engine) {
            if (D15Config._context === 'api-shell' || D15Config._context === 'debug-mode') return '';
            return null;
        },

        'exit': function(args, term, engine) {
            if (D15Config._context === 'debug-mode') {
                D15Config._switchContext('api-shell', term);
                return '[!] Debug mode session closed.\n[+] Returned to standard bio-ops shell.';
            }
            if (D15Config._context === 'api-shell') {
                D15Config._switchContext('attacker', term);
                return 'Connection to 10.42.0.55 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        // --- SSH access to DNA-SEQ-CTRL-01 ---

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('10.42.0.55') || fullCmd.includes('bioops')) {
                D15Config._switchContext('api-shell', term);
                return `The authenticity of host '10.42.0.55 (10.42.0.55)' can't be established.
ED25519 key fingerprint is SHA256:mV7kP2nR8qT4xW1yB6dF3hJ9cL5eA0uZ.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.42.0.55' (ED25519) to the list of known hosts.
bioops@10.42.0.55's password: ********

Welcome to DNA-SEQ-CTRL-01 (Debian GNU/Linux 12)

 *** Aetherium Biorepository — Authorized Access Only ***
 *** All activity is logged and monitored            ***

Last login: Thu Mar 20 00:08:44 2026 from 10.42.0.200

bioops@DNA-SEQ-CTRL-01:~$

[+] SSH session established. You are now on DNA-SEQ-CTRL-01 as bioops.
[+] Context switched. Explore /opt/dna-seq-ctrl/ for API server files.`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh bioops@10.42.0.55';
        },

        // --- Network state commands ---

        'ip': function(args) {
            if (D15Config._context === 'api-shell' || D15Config._context === 'debug-mode') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.42.0.55/24 brd 10.42.0.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.42.0.200/24 brd 10.42.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D15Config.commands.ip(args || []);
        },

        'ss': function(args) {
            if (D15Config._context === 'api-shell' || D15Config._context === 'debug-mode') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:8443         0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return D15Config.commands.ss(args);
        }
    },

    // ═══════════════════════════════════════════════════════
    // MANIFEST DUMP BUILDER
    // Called when the palindromic trigger sequence is injected
    // ═══════════════════════════════════════════════════════

    _buildManifestDump(engine) {
        const reg = D15Config._manifest.genetic_sequence_registry;
        const audit = D15Config._manifest.audit_trail;

        let out = `[!] PALINDROMIC SEQUENCE DETECTED: GCATGCATGCATGCAT
[!] DEBUG TRIGGER ACTIVATED — DNA-SEQ-CTRL-01 entering debug mode
[!] Jira BIOOPS-389 — this is the unfixed debug trigger. Congratulations.

==========================================
   DNA-SEQ-CTRL-01 — MANIFEST DUMP
   GENETIC CODE MANIFEST — ALL SEQUENCES
==========================================

GENETIC SEQUENCE REGISTRY
--------------------------\n`;

        out += ' seq_id  | designation                              | organism                      | classification      | strand_length | synthesis_date | custodian\n';
        out += '---------+------------------------------------------+-------------------------------+---------------------+---------------+----------------+----------\n';
        reg.forEach(r => {
            out += ` ${String(r.seq_id).padEnd(7)} | ${r.designation.padEnd(40)} | ${r.organism.padEnd(29)} | ${r.classification.padEnd(19)} | ${String(r.strand_length).padEnd(13)} | ${r.synthesis_date.padEnd(14)} | ${r.custodian}\n`;
        });
        out += `(${reg.length} rows)\n\n`;

        out += `AUDIT TRAIL\n-----------\n`;
        out += ` entry_id | timestamp            | event                | operator      | sequence_id    | detail\n`;
        out += `---------+----------------------+----------------------+---------------+----------------+-------------------------------\n`;
        audit.forEach(r => {
            out += ` ${String(r.entry_id).padEnd(8)} | ${r.timestamp.padEnd(20)} | ${r.event.padEnd(20)} | ${r.operator.padEnd(13)} | ${r.sequence_id.padEnd(14)} | ${r.detail}\n`;
        });
        out += `(${audit.length} rows)\n\n`;

        out += `==========================================\n`;
        out += `[+] Debug session active. Context elevated to root.\n`;
        out += `[+] manifest_dump complete — ${reg.length} sequences exposed.\n`;
        out += `[!] GCR-005 custodian field contains the root flag.\n`;

        return out;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows, accentColor) {
        const accent = accentColor || D15Config.accent;
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:${accent}; border-bottom:2px solid #1a3a2a; background:#0a1a12;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #1a2a1e; color:#b0d8c8;">${cell}</td>`;
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
