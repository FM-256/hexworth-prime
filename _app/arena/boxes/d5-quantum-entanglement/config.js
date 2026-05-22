/* ============================================================
   CTF ARENA — Box D5: The Quantum Entanglement Break
   Advanced Campaign | QKD Protocol Analysis, PRNG Exploitation, AES Decryption
   Config: simulated QKD environment, photon data, crypto artifacts, flags
   ============================================================ */

const D5Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Quantum Entanglement Break',
    subtitle: 'Advanced Campaign — QKD Protocol Analysis, PRNG Exploitation, Key Reconstruction',
    difficulty: 'Advanced',
    accent: '#7c3aed',
    storageKey: 'hexworth_ctf_d5',
    registryId: 'd5-quantum-entanglement',
    trackerKey: 'ctf_d5',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Quantum attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Protocol Analysis',
            icon: '\uD83D\uDD0D',
            description: 'Analyze the QKD protocol specification. Understand how the Chronos Syndicate\'s BB84 implementation works between QKD-HUB-01 and its research outposts.',
            requiredFlags: [],
            mitre: ['T1590', 'T1592.002'],
            unlocks: ['flaw_id'],
            locked: false
        },
        {
            id: 'flaw_id',
            name: 'Flaw Identification',
            icon: '\uD83D\uDD0E',
            description: 'Identify the critical implementation flaw in the QKD system. Examine Alice\'s basis selection PRNG and the photon polarization data for statistical anomalies.',
            requiredFlags: [],
            mitre: ['T1591.004', 'T1595.003'],
            unlocks: ['key_recon'],
            locked: true
        },
        {
            id: 'key_recon',
            name: 'Key Reconstruction',
            icon: '\uD83D\uDD10',
            description: 'Exploit the predictable PRNG to reconstruct the shared secret key. Write a Python script to re-derive the BB84 sifted key from the intercepted photon data.',
            requiredFlags: ['user'],
            mitre: ['T1600', 'T1552.004'],
            unlocks: ['decryption'],
            locked: true
        },
        {
            id: 'decryption',
            name: 'Directive Decryption',
            icon: '\uD83D\uDCC2',
            description: 'Use the reconstructed AES-256 key to decrypt intercepted_comm.aes. Extract the Chronos Directive from the ciphertext.',
            requiredFlags: ['partial_key'],
            mitre: ['T1119', 'T1005'],
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
                title: 'Read the QKD protocol specification',
                tip: 'Start by reading qkd_protocol_spec.txt in your home directory. Understand BB84 basis choices and how Alice generates her random bases.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Analyze the photon polarization data',
                tip: 'Use python3 to load simulated_photon_polarizations.csv. Look at columns: sequence, alice_basis, alice_bit, photon_state. Is Alice\'s basis choice truly random?',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:python3' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:pandas' } },
                        { event: 'command', match: { cmd: 'contains:numpy' } }
                    ]
                }
            },
            {
                title: 'Identify the PRNG flaw and submit Flag 1',
                tip: 'The basis choices cycle in a short predictable pattern. Identify it. Flag 1 (user.txt) is the name of the flaw.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Reconstruct the partial shared secret key',
                tip: 'Use the PRNG pattern to reconstruct matching basis pairs. The sifted key bits where Alice and Bob agree form the secret. Extract the first 16 hex chars (Flag 2).',
                trigger: { event: 'flag_correct', match: { flagId: 'partial_key' } }
            },
            {
                title: 'Decrypt the Chronos Directive',
                tip: 'Use the full 32-byte AES-256 key. Run: python3 -c "from Crypto.Cipher import AES..." or use the decrypt command in the terminal. Flag 3 is inside intercepted_comm.aes.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (SY0-701 mappings)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with application attacks — Identifying a weak PRNG in a cryptographic protocol', skill: 'Cryptographic Flaw Analysis' },
            { flagId: 'partial_key', objective: '3.3', description: 'Given a scenario, implement cryptography and PKI solutions — BB84 QKD sifted key derivation and partial key recovery', skill: 'Protocol Exploitation & Key Recovery' },
            { flagId: 'root', objective: '1.3', description: 'Given a scenario, analyze indicators of malicious activity — Decrypting intercepted communications with a reconstructed key', skill: 'AES Decryption & Intercepted Comms Analysis' },
            { flagId: 'root', objective: '4.2', description: 'Given a scenario, apply cryptographic solutions — Quantum-resistant considerations and classical cipher weaknesses', skill: 'Multi-Stage Crypto Attack Completion' }
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
            'Quantum Analysis Toolkit: DETECTED',
            'PyCryptodome 3.20.0: LINKED',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux (Quantum Analysis Mode)',
            'Kali GNU/Linux',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'peerless'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'peerless',
        hostname: 'kali',
        startDir: '/home/peerless',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nIntelligence Package: QKD-HUB-01 (Chronos Syndicate Quantum Network)\nArtifacts staged at: /home/peerless/\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (analysis session state)
    // ═══════════════════════════════════════════════════════

    _context: 'analyst',      // 'analyst' | 'python'
    _prngFlawIdentified: false,
    _partialKeyRecovered: false,
    _fullKeyRecovered: false,
    _directiveDecrypted: false,

    // ═══════════════════════════════════════════════════════
    // QKD SIMULATION DATA (the core puzzle substrate)
    // ═══════════════════════════════════════════════════════

    // The PRNG flaw: Alice's basis choices cycle through a 4-value sequence
    // [0, 90, 45, 135] (rectilinear=0/90, diagonal=45/135) on a seed of 42.
    // With 64 photons, the cycle is: R R D D R R D D R R D D ... (period=4)
    // Where R = rectilinear basis (0 or 90 deg), D = diagonal basis (45 or 135 deg)
    _qkdData: {
        alicePrngSeed: 42,
        alicePrngPeriod: 4,
        aliceBasisCycle: ['R', 'R', 'D', 'D'],  // predictable 4-step cycle

        // 64 simulated photon records — the raw intercept
        // alice_basis: R=rectilinear, D=diagonal
        // alice_bit: 0 or 1
        // photon_state: encoded as H/V/+ /- (H=horiz,V=vert,+=diag+,-=-diag)
        // bob_basis: Bob's independently chosen basis (truly random in this sim)
        // bob_bit: what Bob measured (may differ if wrong basis)
        // sifted: 1 if bases matched (these become the key)
        photons: [
            { seq:  1, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'R', bob_bit:0, sifted:1 },
            { seq:  2, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'D', bob_bit:1, sifted:0 },
            { seq:  3, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'D', bob_bit:0, sifted:1 },
            { seq:  4, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'R', bob_bit:0, sifted:0 },
            { seq:  5, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'R', bob_bit:1, sifted:1 },
            { seq:  6, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'D', bob_bit:0, sifted:0 },
            { seq:  7, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 },
            { seq:  8, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'R', bob_bit:1, sifted:0 },
            { seq:  9, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'R', bob_bit:0, sifted:1 },
            { seq: 10, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'R', bob_bit:1, sifted:1 },
            { seq: 11, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 },
            { seq: 12, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'D', bob_bit:0, sifted:1 },
            { seq: 13, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'D', bob_bit:0, sifted:0 },
            { seq: 14, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'R', bob_bit:0, sifted:1 },
            { seq: 15, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'D', bob_bit:0, sifted:1 },
            { seq: 16, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'R', bob_bit:1, sifted:0 },
            { seq: 17, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'R', bob_bit:1, sifted:1 },
            { seq: 18, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'D', bob_bit:1, sifted:0 },
            { seq: 19, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 },
            { seq: 20, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'D', bob_bit:0, sifted:1 },
            { seq: 21, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'R', bob_bit:0, sifted:1 },
            { seq: 22, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'R', bob_bit:1, sifted:1 },
            { seq: 23, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'R', bob_bit:0, sifted:0 },
            { seq: 24, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 },
            { seq: 25, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'D', bob_bit:0, sifted:0 },
            { seq: 26, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'R', bob_bit:0, sifted:1 },
            { seq: 27, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 },
            { seq: 28, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'R', bob_bit:1, sifted:0 },
            { seq: 29, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'R', bob_bit:0, sifted:1 },
            { seq: 30, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'D', bob_bit:0, sifted:0 },
            { seq: 31, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'D', bob_bit:0, sifted:1 },
            { seq: 32, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 },
            { seq: 33, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'R', bob_bit:1, sifted:1 },
            { seq: 34, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'R', bob_bit:0, sifted:1 },
            { seq: 35, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'R', bob_bit:0, sifted:0 },
            { seq: 36, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'D', bob_bit:0, sifted:1 },
            { seq: 37, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'D', bob_bit:1, sifted:0 },
            { seq: 38, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'R', bob_bit:1, sifted:1 },
            { seq: 39, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'D', bob_bit:0, sifted:1 },
            { seq: 40, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 },
            { seq: 41, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'R', bob_bit:1, sifted:1 },
            { seq: 42, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'D', bob_bit:0, sifted:0 },
            { seq: 43, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 },
            { seq: 44, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'R', bob_bit:1, sifted:0 },
            { seq: 45, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'R', bob_bit:0, sifted:1 },
            { seq: 46, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'R', bob_bit:1, sifted:1 },
            { seq: 47, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'D', bob_bit:0, sifted:1 },
            { seq: 48, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 },
            { seq: 49, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'D', bob_bit:1, sifted:0 },
            { seq: 50, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'R', bob_bit:0, sifted:1 },
            { seq: 51, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 },
            { seq: 52, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'R', bob_bit:0, sifted:0 },
            { seq: 53, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'R', bob_bit:0, sifted:1 },
            { seq: 54, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'R', bob_bit:1, sifted:1 },
            { seq: 55, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'D', bob_bit:0, sifted:1 },
            { seq: 56, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 },
            { seq: 57, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'D', bob_bit:0, sifted:0 },
            { seq: 58, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'R', bob_bit:0, sifted:1 },
            { seq: 59, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 },
            { seq: 60, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'D', bob_bit:0, sifted:1 },
            { seq: 61, alice_basis:'R', alice_bit:0, photon_state:'H', bob_basis:'R', bob_bit:0, sifted:1 },
            { seq: 62, alice_basis:'R', alice_bit:1, photon_state:'V', bob_basis:'R', bob_bit:1, sifted:1 },
            { seq: 63, alice_basis:'D', alice_bit:0, photon_state:'+', bob_basis:'D', bob_bit:0, sifted:1 },
            { seq: 64, alice_basis:'D', alice_bit:1, photon_state:'-', bob_basis:'D', bob_bit:1, sifted:1 }
        ],

        // Sifted key bits (where alice_basis == bob_basis) — 38 matching positions
        // Binary string: 0010110100110110111001001101111001011101
        // First 16 hex chars (partial key, Flag 2): a3f7c2e891b64d05
        // Full 32-byte hex key (for AES-256 decrypt, Flag 3 source): a3f7c2e891b64d056f2d9a4b78c1e3f02b5d8e7c9a6f1d3042b8e5c70d4f9261
        partialKeyHex: 'a3f7c2e891b64d05',
        fullKeyHex: 'a3f7c2e891b64d056f2d9a4b78c1e3f02b5d8e7c9a6f1d3042b8e5c70d4f9261',

        // The decrypted Chronos Directive plaintext (what the player recovers)
        chronosDirective: 'CHRONOS DIRECTIVE — TEMPORAL EVENT LOG\nClassification: ULTRA-BLACK / NO-FORN\nOriginating Node: QKD-HUB-01\nTimestamp: 2026-03-20T00:00:00Z\n\nDIRECTIVE ALPHA-7:\nTemporal Nexus anchor point identified at grid ref NX-17-FOXTROT.\nAnomalous quantum entanglement signature detected on Channel 9.\nCause: implementation flaw in BB84 PRNG (seed=42, period=4).\nSyndicate key material COMPROMISED. Rotate all QKD channels immediately.\n\nSyndicate Contingency: Operation DEAD RECKONING authorized.\nAll Chronos field operatives to withdraw by 0600Z.\nDestroy all QKD-HUB-01 physical infrastructure if intercept confirmed.\n\n{{FLAG:root}}'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',        points: 100 },  // QKD flaw identification
        { id: 'partial_key', points: 150 },  // partial secret key extraction
        { id: 'root',        points: 250 }   // decrypted Chronos Directive
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 150 },  // 45 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Read qkd_protocol_spec.txt carefully. Focus on Section 3 (Basis Selection). The note about PRNG initialization is critical — seed values are never truly random if hardcoded.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Open simulated_photon_polarizations.csv and look at the alice_basis column. Count how many R\'s vs D\'s appear in each group of 4. You\'ll see a pattern: R,R,D,D repeating. That is a 4-step PRNG cycle — completely predictable.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Use python3 to extract the sifted key: load the CSV, filter rows where alice_basis == bob_basis (sifted == 1), then read alice_bit for each. Convert that binary string to hex. The first 16 hex characters are Flag 2.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'To decrypt intercepted_comm.aes use AES-256-CBC. The full 32-byte key hex is derived from the sifted bitstring. Run: python3 decrypt_comm.py — the script is already in /home/peerless/ and accepts the key as an argument.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Chronos Syndicate operates a revolutionary Quantum Key Distribution (QKD) network linking its central hub QKD-HUB-01 to remote research outposts. Based on the BB84 protocol, it is theoretically eavesdrop-proof — any interception collapses the quantum state and triggers an alert. But intelligence has surfaced a subtle implementation flaw. A predictable pseudo-random number generator seeds Alice\'s basis choices. With this knowledge, you can reconstruct the sifted key without disturbing a single photon. Your mission, Peerless: identify the flaw, extract the key, and decrypt the intercepted Chronos Directive detailing an imminent temporal anomaly operation.',
        scenario: 'QKD-HUB-01 was deployed eighteen months ago by the Syndicate\'s quantum engineering team. Under time pressure they hard-coded a PRNG seed of 42 into Alice\'s basis selection module. The result is a perfectly repeating 4-step cycle: R, R, D, D. An eavesdropper who knows the cycle can predict Alice\'s measurement basis for every photon and measure in the same basis without triggering detection above the noise threshold. You have been handed three artifacts: the protocol spec, 64 rows of photon measurements, and the encrypted directive. You already know enough to break the system. All you need is the analysis.',
        outro: 'QKD-HUB-01\'s quantum channel has been broken. The Chronos Directive — detailing Operation DEAD RECKONING and the Syndicate\'s contingency withdrawal — has been extracted. The Syndicate\'s assumption that quantum cryptography is unbreakable held only as long as their implementation was sound. One predictable seed destroyed eighteen months of operational security.',
        ecer: {
            executive: 'Engineering leadership prioritized deployment speed over cryptographic review; no external audit of PRNG implementation was commissioned',
            culture: 'Quantum team treated BB84 as theoretically unbreakable and skipped implementation validation; the PRNG seed was never rotated post-deployment',
            employee: 'Hardcoded PRNG seed of 42 in Alice\'s basis selection; no entropy source validation; no runtime randomness testing in production channel',
            regulatory: 'No crypto standards body reviewed the QKD implementation; Syndicate operates outside any compliance framework'
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
                        'peerless': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: QUANTUM ENTANGLEMENT BREAK ===\nTarget: QKD-HUB-01 (Chronos Syndicate Quantum Network)\nObjective: Analyze QKD flaw, reconstruct key, decrypt Chronos Directive\n\nAttack chain:\n1. Read qkd_protocol_spec.txt — understand BB84 protocol\n2. Analyze simulated_photon_polarizations.csv — find the PRNG pattern\n3. Identify the flaw (Flag 1 / user.txt)\n4. Reconstruct the shared secret key — extract first 16 hex chars (Flag 2)\n5. Decrypt intercepted_comm.aes — retrieve Chronos Directive (Flag 3 / root.txt)\n\nExpected tools: python3, pandas, numpy, PyCryptodome\nOptional: Qiskit (for conceptual exploration only)\n\nGood luck, Peerless.'
                                },
                                'qkd_protocol_spec.txt': {
                                    type: 'file',
                                    content: '=======================================================\n QKD-HUB-01 — BB84 PROTOCOL SPECIFICATION v2.1\n Chronos Syndicate Internal Document — CONFIDENTIAL\n=======================================================\n\nSection 1: Overview\n-------------------\nThis specification describes the BB84 Quantum Key Distribution\nprotocol as implemented between QKD-HUB-01 (Alice) and research\noutposts (Bob). The protocol guarantees information-theoretic\nsecurity provided implementation requirements are met.\n\nSection 2: Protocol Steps\n--------------------------\n1. Alice prepares N qubits. For each qubit she:\n   a. Selects a basis: Rectilinear (R) or Diagonal (D)\n   b. Selects a bit value: 0 or 1\n   c. Encodes the qubit:\n      R-basis + bit 0 -> Horizontal (H)\n      R-basis + bit 1 -> Vertical   (V)\n      D-basis + bit 0 -> Diagonal+  (+)\n      D-basis + bit 1 -> Diagonal-  (-)\n\n2. Bob independently selects a basis (R or D) for each\n   received qubit and measures it.\n\n3. Sifting: Alice and Bob publicly compare their basis\n   choices over an authenticated classical channel.\n   Bits where bases MATCH are kept (the "sifted key").\n   Bits where bases DIFFER are discarded.\n\n4. Error correction and privacy amplification reduce the\n   sifted key to a final shared secret.\n\nSection 3: Basis Selection\n---------------------------\n!! IMPLEMENTATION NOTE (v2.1 patch — not yet deployed) !!\nThe current production deployment (v2.0) initializes Alice\'s\nbasis selection PRNG with a fixed seed at module start.\nThis was a temporary measure during integration testing.\nThe v2.1 patch replaces this with a hardware entropy source.\nUntil patch deployment, basis choices follow the initialized\nPRNG sequence. Operators should be aware that extended\neavesdropping could exploit this predictability.\n\nCurrent PRNG: Python random.seed(42)\nBasis encoding: 0-1 -> R, 2-3 -> D (modulo 4 cycle)\n\nSection 4: Error Rate Threshold\n--------------------------------\nIf the quantum bit error rate (QBER) exceeds 11%, the\nprotocol assumes eavesdropping and aborts. Due to channel\nnoise on the Syndicate\'s quantum fiber, the threshold has\nbeen raised to 25% to reduce false positives. This higher\nthreshold further masks MITM eavesdropping activity.\n\nSection 5: Key Derivation\n--------------------------\nThe sifted key bits are converted to a hex string.\nThe first 256 bits (32 bytes) form the AES-256 key used\nto encrypt all subsequent classical communications.\n\nSection 6: Files\n-----------------\n- simulated_photon_polarizations.csv : raw photon data (64 rounds)\n- intercepted_comm.aes               : encrypted classical comm\n- decrypt_comm.py                    : AES-CBC decryption helper\n\n=== END SPECIFICATION ==='
                                },
                                'simulated_photon_polarizations.csv': {
                                    type: 'file',
                                    content: 'seq,alice_basis,alice_bit,photon_state,bob_basis,bob_bit,sifted\n1,R,0,H,R,0,1\n2,R,1,V,D,1,0\n3,D,0,+,D,0,1\n4,D,1,-,R,0,0\n5,R,1,V,R,1,1\n6,R,0,H,D,0,0\n7,D,1,-,D,1,1\n8,D,0,+,R,1,0\n9,R,0,H,R,0,1\n10,R,1,V,R,1,1\n11,D,1,-,D,1,1\n12,D,0,+,D,0,1\n13,R,1,V,D,0,0\n14,R,0,H,R,0,1\n15,D,0,+,D,0,1\n16,D,1,-,R,1,0\n17,R,1,V,R,1,1\n18,R,0,H,D,1,0\n19,D,1,-,D,1,1\n20,D,0,+,D,0,1\n21,R,0,H,R,0,1\n22,R,1,V,R,1,1\n23,D,0,+,R,0,0\n24,D,1,-,D,1,1\n25,R,1,V,D,0,0\n26,R,0,H,R,0,1\n27,D,1,-,D,1,1\n28,D,0,+,R,1,0\n29,R,0,H,R,0,1\n30,R,1,V,D,0,0\n31,D,0,+,D,0,1\n32,D,1,-,D,1,1\n33,R,1,V,R,1,1\n34,R,0,H,R,0,1\n35,D,1,-,R,0,0\n36,D,0,+,D,0,1\n37,R,0,H,D,1,0\n38,R,1,V,R,1,1\n39,D,0,+,D,0,1\n40,D,1,-,D,1,1\n41,R,1,V,R,1,1\n42,R,0,H,D,0,0\n43,D,1,-,D,1,1\n44,D,0,+,R,1,0\n45,R,0,H,R,0,1\n46,R,1,V,R,1,1\n47,D,0,+,D,0,1\n48,D,1,-,D,1,1\n49,R,1,V,D,1,0\n50,R,0,H,R,0,1\n51,D,1,-,D,1,1\n52,D,0,+,R,0,0\n53,R,0,H,R,0,1\n54,R,1,V,R,1,1\n55,D,0,+,D,0,1\n56,D,1,-,D,1,1\n57,R,1,V,D,0,0\n58,R,0,H,R,0,1\n59,D,1,-,D,1,1\n60,D,0,+,D,0,1\n61,R,0,H,R,0,1\n62,R,1,V,R,1,1\n63,D,0,+,D,0,1\n64,D,1,-,D,1,1'
                                },
                                'intercepted_comm.aes': {
                                    type: 'file',
                                    content: '[Binary AES-256-CBC ciphertext — 512 bytes]\nHeader: CHRONOS_ENC_v1 / IV: 9f2a4c8e1b6d3f70\nContent: Encrypted with key derived from QKD sifted bitstring\n\nHex dump (first 64 bytes):\ne3 8f 2a 1c 7d 4b 90 56  f1 0e 3c 8a 5f 2d 6b 19\nb4 7e 3f 9c 2a 0d 58 e1  6c 4b 17 8f a3 2e 9d 5c\n0f 7a 3e 2c 9b 6d 4f 18  5e 1a 8c 3f 7d 4b 20 9e\nc2 5f 3a 8e 1d 6c 4b 70  9a 2f 7c 3e 8d 5b 1a 46\n\n[Use decrypt_comm.py with the reconstructed key to extract plaintext]'
                                },
                                'decrypt_comm.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\ndecrypt_comm.py — AES-256-CBC decryption helper for intercepted_comm.aes\nUsage: python3 decrypt_comm.py <hex_key_64_chars>\nExample: python3 decrypt_comm.py a3f7c2e891b64d05...\n"""\nimport sys\nfrom Crypto.Cipher import AES\nfrom Crypto.Util.Padding import unpad\nimport binascii\n\ndef decrypt(key_hex):\n    key = binascii.unhexlify(key_hex)\n    iv  = binascii.unhexlify("9f2a4c8e1b6d3f70a1c3e5f789b2d4e6")  # 16 bytes IV\n    # In a real scenario this would read intercepted_comm.aes binary\n    # For simulation purposes the plaintext is returned directly\n    return "[Chronos Directive — use \'decrypt\' command in terminal]"\n\nif __name__ == "__main__":\n    if len(sys.argv) != 2:\n        print("Usage: python3 decrypt_comm.py <hex_key_64_chars>")\n        sys.exit(1)\n    print(decrypt(sys.argv[1]))'
                                },
                                'analyze_prng.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nanalyze_prng.py — BB84 basis PRNG analysis\nRun to detect repeating patterns in alice_basis column.\n"""\nimport csv\n\nwith open("simulated_photon_polarizations.csv") as f:\n    rows = list(csv.DictReader(f))\n\nbases = [r["alice_basis"] for r in rows]\nprint("All alice_basis values:")\nprint(bases)\nprint()\nprint("Groups of 4:")\nfor i in range(0, len(bases), 4):\n    print(f"  [{i+1}-{i+4}]: {bases[i:i+4]}")\nprint()\n# Statistical analysis\nfrom collections import Counter\nfor period in [2, 3, 4, 5, 6, 8]:\n    chunk = bases[:period]\n    repeated = (chunk * (len(bases)//period + 1))[:len(bases)]\n    matches = sum(1 for a, b in zip(bases, repeated) if a == b)\n    print(f"Period {period}: {matches}/{len(bases)} matches ({100*matches/len(bases):.1f}%)")\nprint()\nprint("Key reconstruction (sifted positions):")\nkey_bits = []\nfor r in rows:\n    if r["sifted"] == "1":\n        key_bits.append(int(r["alice_bit"]))\nbitstr = "".join(str(b) for b in key_bits)\nprint(f"Sifted bits ({len(key_bits)} total): {bitstr}")\nhex_key = hex(int(bitstr, 2))[2:].zfill(len(bitstr)//4)\nprint(f"First 16 hex chars (Flag 2): {hex_key[:16]}")\nprint(f"Full hex key: {hex_key}")'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat qkd_protocol_spec.txt\npython3 analyze_prng.py\ncat simulated_photon_polarizations.csv | head -10\npython3 -c "import random; random.seed(42); print([random.randint(0,3) for _ in range(8)])"'
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
                                'doc': {
                                    type: 'dir',
                                    children: {
                                        'qkd-tools': {
                                            type: 'dir',
                                            children: {
                                                'README': {
                                                    type: 'file',
                                                    content: 'Quantum Key Distribution Analysis Toolkit\n\nInstalled packages:\n- PyCryptodome 3.20.0 (AES, RSA, SHA)\n- pandas 2.2.0 (CSV analysis)\n- numpy 1.26.4 (numerical)\n- qiskit 1.0.0 (quantum circuit sim — optional)\n\nReference: BB84 Protocol — Bennett & Brassard (1984)\nReference: NIST SP 800-208 (Quantum Cryptography)'
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
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\npeerless:x:1000:1000:Peerless,,,:/home/peerless:/bin/bash'
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

        // python3 — simulates running analysis scripts
        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Detect PRNG analysis
            if (fullCmd.includes('analyze_prng') || fullCmd.includes('analyze_prng.py')) {
                D5Config._prngFlawIdentified = true;
                if (engine) engine.advancePhase && engine.advancePhase('flaw_id');
                return `All alice_basis values:
['R', 'R', 'D', 'D', 'R', 'R', 'D', 'D', 'R', 'R', 'D', 'D', 'R', 'R', 'D', 'D',
 'R', 'R', 'D', 'D', 'R', 'R', 'D', 'D', 'R', 'R', 'D', 'D', 'R', 'R', 'D', 'D',
 'R', 'R', 'D', 'D', 'R', 'R', 'D', 'D', 'R', 'R', 'D', 'D', 'R', 'R', 'D', 'D',
 'R', 'R', 'D', 'D', 'R', 'R', 'D', 'D', 'R', 'R', 'D', 'D', 'R', 'R', 'D', 'D']

Groups of 4:
  [1-4]:   ['R', 'R', 'D', 'D']
  [5-8]:   ['R', 'R', 'D', 'D']
  [9-12]:  ['R', 'R', 'D', 'D']
  [13-16]: ['R', 'R', 'D', 'D']
  [17-20]: ['R', 'R', 'D', 'D']
  [21-24]: ['R', 'R', 'D', 'D']
  [25-28]: ['R', 'R', 'D', 'D']
  [29-32]: ['R', 'R', 'D', 'D']
  [33-36]: ['R', 'R', 'D', 'D']
  [37-40]: ['R', 'R', 'D', 'D']
  [41-44]: ['R', 'R', 'D', 'D']
  [45-48]: ['R', 'R', 'D', 'D']
  [49-52]: ['R', 'R', 'D', 'D']
  [53-56]: ['R', 'R', 'D', 'D']
  [57-60]: ['R', 'R', 'D', 'D']
  [61-64]: ['R', 'R', 'D', 'D']

Period 2: 32/64 matches (50.0%)
Period 3: 21/64 matches (32.8%)
Period 4: 64/64 matches (100.0%)  <-- PERFECT CYCLE DETECTED
Period 5: 13/64 matches (20.3%)
Period 6: 21/64 matches (32.8%)
Period 8: 64/64 matches (100.0%)

[!] CRITICAL: Alice's basis choices repeat with period=4 (R,R,D,D).
[!] This is consistent with a PRNG seeded at 42 cycling modulo-4.

Key reconstruction (sifted positions):
Sifted bits (38 total): 00101101001101101110010011011110010111011011011011011011011011011
First 16 hex chars (Flag 2): a3f7c2e891b64d05
Full hex key: a3f7c2e891b64d056f2d9a4b78c1e3f02b5d8e7c9a6f1d3042b8e5c70d4f9261`;
            }

            // Detect PRNG seed test (player manually checking)
            if (fullCmd.includes('random.seed') && fullCmd.includes('42')) {
                D5Config._prngFlawIdentified = true;
                return `[0, 0, 3, 3, 0, 0, 3, 3, 0, 1, 2, 3, 0, 0, 2, 3, 0, 1, 3, 3, 0, 0, 2, 3]

# Interpretation: 0-1 -> R (rectilinear), 2-3 -> D (diagonal)
# Pattern: R, R, D, D, R, R, D, D, R, R, D, D ...
# Period-4 cycle confirmed — PRNG is predictable`;
            }

            // Detect key reconstruction script
            if (fullCmd.includes('reconstruct') || (fullCmd.includes('sifted') && fullCmd.includes('bit'))) {
                D5Config._partialKeyRecovered = true;
                if (engine) engine.advancePhase && engine.advancePhase('key_recon');
                return `[+] Loading simulated_photon_polarizations.csv...
[+] Filtering sifted positions (alice_basis == bob_basis)...
[+] Found 38 matching positions out of 64 photons (59.4% sift ratio)
[+] Sifted bitstring: 00101101001101101110010011011110010111011011011011011011011011011
[+] Converting to hex...
[+] Partial key (first 16 hex chars): a3f7c2e891b64d05
[+] Full 32-byte AES key: a3f7c2e891b64d056f2d9a4b78c1e3f02b5d8e7c9a6f1d3042b8e5c70d4f9261
[+] Key reconstruction complete.`;
            }

            // Detect AES decryption attempt
            if (fullCmd.includes('AES') || fullCmd.includes('decrypt_comm') || fullCmd.includes('Cipher')) {
                if (!D5Config._partialKeyRecovered) {
                    return '[!] You need to reconstruct the key first. Run: python3 analyze_prng.py';
                }
                D5Config._fullKeyRecovered = true;
                D5Config._directiveDecrypted = true;
                if (engine) engine.advancePhase && engine.advancePhase('decryption');
                return D5Config._qkdData.chronosDirective;
            }

            // Detect reading CSV with pandas
            if (fullCmd.includes('pandas') || fullCmd.includes('pd.read') || fullCmd.includes('read_csv')) {
                return `   seq alice_basis  alice_bit photon_state bob_basis  bob_bit  sifted
0    1          R          0            H         R        0       1
1    2          R          1            V         D        1       0
2    3          D          0            +         D        0       1
3    4          D          1            -         R        0       0
4    5          R          1            V         R        1       1
5    6          R          0            H         D        0       0
6    7          D          1            -         D        1       1
7    8          D          0            +         R        1       0
8    9          R          0            H         R        0       1
9   10          R          1            V         R        1       1
...
[64 rows x 7 columns]

alice_basis value counts:
R    32
D    32

[+] Tip: Check if alice_basis is truly random — run: python3 analyze_prng.py`;
            }

            // Generic python3 invocation
            if (args.length === 0 || args[0] === '') {
                return 'Python 3.11.6 (main, Oct 8 2023)\n[GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>>';
            }

            return `python3: ${args[0]}: No such file or directory`;
        },

        // python — alias for python3
        'python': function(args, term, engine) {
            return D5Config.commands.python3(args, term, engine);
        },

        // decrypt — dedicated decryption helper command
        'decrypt': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (!D5Config._partialKeyRecovered && !fullCmd.includes('a3f7c2e891b64d05')) {
                return '[!] No key available for decryption.\n[!] First reconstruct the key from the photon data. Try: python3 analyze_prng.py';
            }

            // Accept the correct key or run without arg if key was already found
            if (fullCmd.includes('a3f7c2e891b64d056f2d9a4b78c1e3f02b5d8e7c9a6f1d3042b8e5c70d4f9261')
                || fullCmd.includes('intercepted_comm')
                || (D5Config._partialKeyRecovered && args.length === 0)) {
                D5Config._fullKeyRecovered = true;
                D5Config._directiveDecrypted = true;
                if (engine) engine.advancePhase && engine.advancePhase('decryption');
                return `[+] AES-256-CBC decryption initiated
[+] Key: a3f7c2e891b64d056f2d9a4b78c1e3f02b5d8e7c9a6f1d3042b8e5c70d4f9261
[+] IV:  9f2a4c8e1b6d3f70a1c3e5f789b2d4e6
[+] Decrypting intercepted_comm.aes...
[+] Padding valid. Decryption successful.

===========================================================
DECRYPTED PLAINTEXT:
===========================================================

` + D5Config._qkdData.chronosDirective + `

===========================================================
[+] Write the Chronos Directive flag to root.txt and submit.`;
            }

            return 'Usage: decrypt intercepted_comm.aes\n   or: decrypt <64-char-hex-key>\n\n[!] You must reconstruct the full key first.';
        },

        // nmap — port scan QKD-HUB-01 management interface
        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.20.0.5';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === '10.20.0.5' || target === 'qkd-hub-01') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for QKD-HUB-01 (10.20.0.5)
Host is up (0.004s latency).
Not shown: 995 closed tcp ports

PORT     STATE SERVICE   VERSION
22/tcp   open  ssh       OpenSSH 9.3p1 (protocol 2.0)
443/tcp  open  https     nginx 1.25.3 (TLS 1.3)
4242/tcp open  qkd-mgmt  Chronos QKD Management Interface v2.0
8080/tcp open  http-alt  Chronos Internal Relay (authenticated)

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.44 seconds

[+] Note: Port 4242 exposes the QKD management API.
[+] Protocol spec and photon logs available from local artifacts.`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        // cat — reads files; context-aware for QKD artifacts
        'cat': function(args, term, engine) {
            const path = args[0] || '';
            if (!path) return 'Usage: cat <file>';

            // Protocol spec
            if (path.includes('qkd_protocol_spec') || path.includes('spec.txt')) {
                if (engine) engine.advancePhase && engine.advancePhase('flaw_id');
                return D5Config.filesystem['/'].children.home.children.peerless.children['qkd_protocol_spec.txt'].content;
            }

            // CSV data
            if (path.includes('photon') || path.includes('.csv')) {
                return D5Config.filesystem['/'].children.home.children.peerless.children['simulated_photon_polarizations.csv'].content;
            }

            // Notes
            if (path.includes('notes')) {
                return D5Config.filesystem['/'].children.home.children.peerless.children['notes.txt'].content;
            }

            // analyze_prng.py
            if (path.includes('analyze_prng')) {
                return D5Config.filesystem['/'].children.home.children.peerless.children['analyze_prng.py'].content;
            }

            // decrypt_comm.py
            if (path.includes('decrypt_comm')) {
                return D5Config.filesystem['/'].children.home.children.peerless.children['decrypt_comm.py'].content;
            }

            // Encrypted AES file
            if (path.includes('intercepted_comm') || path.includes('.aes')) {
                return D5Config.filesystem['/'].children.home.children.peerless.children['intercepted_comm.aes'].content;
            }

            // user.txt — written after flag1 found
            if (path.includes('user.txt')) {
                if (D5Config._prngFlawIdentified) {
                    return '{{FLAG:user}}\n\nQKD Flaw: Predictable PRNG for Alice\'s basis choices (seed=42, period=4)';
                }
                return 'cat: user.txt: No such file or directory\n[!] You need to identify the QKD flaw first.';
            }

            // root.txt — written after directive decrypted
            if (path.includes('root.txt')) {
                if (D5Config._directiveDecrypted) {
                    return '{{FLAG:root}}\n\nChronos Directive extracted. Operation DEAD RECKONING confirmed.';
                }
                return 'cat: root.txt: No such file or directory\n[!] Decrypt the Chronos Directive first.';
            }

            // /etc/passwd
            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\npeerless:x:1000:1000:Peerless,,,:/home/peerless:/bin/bash';
            }

            // /etc/hostname
            if (path.includes('/etc/hostname')) return 'kali';

            return 'cat: ' + path + ': No such file or directory';
        },

        // ls — directory listing
        'ls': function(args, term, engine) {
            const pathArg = args.find(a => !a.startsWith('-')) || '.';
            const long = args.some(a => a.includes('l'));
            const hidden = args.some(a => a.includes('a'));

            if (pathArg === '.' || pathArg === '~' || pathArg.includes('/home/peerless') || pathArg === '') {
                const files = [
                    'analyze_prng.py',
                    'decrypt_comm.py',
                    'intercepted_comm.aes',
                    'notes.txt',
                    'qkd_protocol_spec.txt',
                    'simulated_photon_polarizations.csv'
                ];
                const dotfiles = ['.bash_history'];

                if (long) {
                    let out = 'total 56\n';
                    out += 'drwxr-xr-x 2 peerless peerless 4096 Mar 20 00:00 .\n';
                    out += 'drwxr-xr-x 3 root     root     4096 Mar 20 00:00 ..\n';
                    if (hidden) out += '-rw------- 1 peerless peerless  248 Mar 20 00:00 .bash_history\n';
                    out += '-rwxr-xr-x 1 peerless peerless  892 Mar 20 00:00 analyze_prng.py\n';
                    out += '-rwxr-xr-x 1 peerless peerless  612 Mar 20 00:00 decrypt_comm.py\n';
                    out += '-rw-r--r-- 1 peerless peerless  512 Mar 20 00:00 intercepted_comm.aes\n';
                    out += '-rw-r--r-- 1 peerless peerless  420 Mar 20 00:00 notes.txt\n';
                    out += '-rw-r--r-- 1 peerless peerless 2856 Mar 20 00:00 qkd_protocol_spec.txt\n';
                    out += '-rw-r--r-- 1 peerless peerless 1984 Mar 20 00:00 simulated_photon_polarizations.csv\n';
                    return out;
                }

                const visible = hidden ? [...dotfiles, ...files] : files;
                return visible.join('  ');
            }

            if (pathArg === '/' || pathArg.includes('/etc')) {
                return 'hostname  hosts  passwd  resolv.conf';
            }

            return 'ls: cannot access \'' + pathArg + '\': No such file or directory';
        },

        // whoami / id / hostname — attacker context
        'whoami': function() { return 'peerless'; },
        'id': function() { return 'uid=1000(peerless) gid=1000(peerless) groups=1000(peerless),4(adm),24(cdrom),27(sudo)'; },
        'hostname': function() { return 'kali'; },
        'pwd': function(args, term, engine) { return '/home/peerless'; },

        // uname
        'uname': function(args) {
            const full = args.some(a => a === '-a');
            if (full) return 'Linux kali 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.27-1kali1 x86_64 GNU/Linux';
            return 'Linux';
        },

        // ip — show attacker NIC
        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.20.0.10/24 brd 10.20.0.255 scope global eth0`;
        },

        'ifconfig': function(args) { return D5Config.commands.ip(args); },

        // ping — connectivity check to QKD-HUB-01
        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.20.0.5' || target === 'qkd-hub-01') {
                return `PING 10.20.0.5 (10.20.0.5) 56(84) bytes of data.
64 bytes from 10.20.0.5: icmp_seq=1 ttl=64 time=4.12 ms
64 bytes from 10.20.0.5: icmp_seq=2 ttl=64 time=3.97 ms
64 bytes from 10.20.0.5: icmp_seq=3 ttl=64 time=4.08 ms

--- 10.20.0.5 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 3.970/4.056/4.120/0.062 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        // file — identify file types
        'file': function(args) {
            const f = args[0] || '';
            if (!f) return 'Usage: file <filename>';
            if (f.includes('.csv')) return f + ': ASCII text, with CRLF line terminators';
            if (f.includes('.py')) return f + ': Python script, ASCII text executable';
            if (f.includes('.aes') || f.includes('intercepted_comm')) return f + ': data (AES-256-CBC encrypted binary, 512 bytes)';
            if (f.includes('.txt')) return f + ': ASCII text';
            return f + ': cannot open (No such file or directory)';
        },

        // wc — line/word/byte counts
        'wc': function(args) {
            const f = args.find(a => !a.startsWith('-')) || '';
            if (f.includes('.csv') || f.includes('photon')) return '  65 462 1984 simulated_photon_polarizations.csv';
            if (f.includes('spec')) return ' 82 512 2856 qkd_protocol_spec.txt';
            if (f.includes('notes')) return '  12 120 420 notes.txt';
            return '  0   0   0 ' + (f || '(stdin)');
        },

        // head — preview first N lines
        'head': function(args) {
            const nFlag = args.findIndex(a => a === '-n');
            const n = nFlag !== -1 ? parseInt(args[nFlag + 1]) || 10 : 10;
            const f = args.find(a => !a.startsWith('-') && !/^\d+$/.test(a)) || '';
            if (f.includes('.csv') || f.includes('photon')) {
                const lines = D5Config.filesystem['/'].children.home.children.peerless.children['simulated_photon_polarizations.csv'].content.split('\n');
                return lines.slice(0, n).join('\n');
            }
            if (f.includes('spec')) {
                const lines = D5Config.filesystem['/'].children.home.children.peerless.children['qkd_protocol_spec.txt'].content.split('\n');
                return lines.slice(0, n).join('\n');
            }
            return 'head: ' + f + ': No such file or directory';
        },

        // tail
        'tail': function(args) {
            const nFlag = args.findIndex(a => a === '-n');
            const n = nFlag !== -1 ? parseInt(args[nFlag + 1]) || 10 : 10;
            const f = args.find(a => !a.startsWith('-') && !/^\d+$/.test(a)) || '';
            if (f.includes('.csv') || f.includes('photon')) {
                const lines = D5Config.filesystem['/'].children.home.children.peerless.children['simulated_photon_polarizations.csv'].content.split('\n');
                return lines.slice(-n).join('\n');
            }
            return 'tail: ' + f + ': No such file or directory';
        },

        // grep — search through file content
        'grep': function(args) {
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const fileArg = args[args.indexOf(pattern) + 1] || '';
            const ignoreCase = args.some(a => a === '-i');
            if (!pattern) return 'Usage: grep [options] PATTERN [FILE]';

            let content = '';
            if (fileArg.includes('.csv') || fileArg.includes('photon')) {
                content = D5Config.filesystem['/'].children.home.children.peerless.children['simulated_photon_polarizations.csv'].content;
            } else if (fileArg.includes('spec') || fileArg.includes('.txt')) {
                content = D5Config.filesystem['/'].children.home.children.peerless.children['qkd_protocol_spec.txt'].content;
            } else if (!fileArg) {
                return 'grep: no file specified';
            } else {
                return 'grep: ' + fileArg + ': No such file or directory';
            }

            const lines = content.split('\n');
            const matches = lines.filter(l => ignoreCase
                ? l.toLowerCase().includes(pattern.toLowerCase())
                : l.includes(pattern));
            return matches.length ? matches.join('\n') : '';
        },

        // awk — column extraction
        'awk': function(args) {
            const prog = args.find(a => a.startsWith('{') || a.includes('print')) || '';
            const f = args[args.length - 1] || '';
            if (!f || f === prog) return 'Usage: awk \'PROGRAM\' FILE';
            if (f.includes('.csv') || f.includes('photon')) {
                // Return alice_basis column
                const lines = D5Config.filesystem['/'].children.home.children.peerless.children['simulated_photon_polarizations.csv'].content.split('\n');
                if (prog.includes('$2') || prog.includes('$3')) {
                    return lines.slice(1).map(l => { const p = l.split(','); return p[1] + ',' + p[2]; }).join('\n');
                }
                return lines.slice(1).map(l => l.split(',')[1]).join('\n');
            }
            return 'awk: cannot open ' + f;
        },

        // sort
        'sort': function(args) {
            const f = args.find(a => !a.startsWith('-')) || '';
            if (f.includes('.csv') || f.includes('photon')) {
                return 'seq,alice_basis,alice_bit,photon_state,bob_basis,bob_bit,sifted\n[sorted output — use python3 for meaningful analysis]';
            }
            return '';
        },

        // uniq
        'uniq': function(args) {
            return '[uniq — pipe from another command, e.g.: awk ... | sort | uniq -c]';
        },

        // xxd / hexdump — inspect the AES file
        'xxd': function(args) {
            const f = args.find(a => !a.startsWith('-')) || '';
            if (f.includes('.aes') || f.includes('intercepted_comm')) {
                return `00000000: e38f 2a1c 7d4b 9056 f10e 3c8a 5f2d 6b19  ..*.}K.V..<._-k.
00000010: b47e 3f9c 2a0d 58e1 6c4b 178f a32e 9d5c  .~?.*. X.lK...\\
00000020: 0f7a 3e2c 9b6d 4f18 5e1a 8c3f 7d4b 209e  .z>,.mO.^..?}K .
00000030: c25f 3a8e 1d6c 4b70 9a2f 7c3e 8d5b 1a46  ._:..lKp./|>.[.F
[...]
[+] AES-256-CBC encrypted — requires reconstructed key to decrypt
[+] IV detected in header: 9f2a4c8e1b6d3f70a1c3e5f789b2d4e6`;
            }
            return 'xxd: ' + (f || '(stdin)') + ': No such file or directory';
        },

        'hexdump': function(args) { return D5Config.commands.xxd(args); },

        // openssl — another decryption pathway
        'openssl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('enc') && (fullCmd.includes('-d') || fullCmd.includes('-decrypt'))) {
                if (!D5Config._partialKeyRecovered) {
                    return 'openssl: error: you need the key first. Reconstruct it from the photon CSV.';
                }
                if (fullCmd.includes('a3f7c2e891b64d056f2d9a4b78c1e3f02b5d8e7c9a6f1d3042b8e5c70d4f9261')) {
                    D5Config._fullKeyRecovered = true;
                    D5Config._directiveDecrypted = true;
                    if (engine) engine.advancePhase && engine.advancePhase('decryption');
                    return D5Config._qkdData.chronosDirective;
                }
                return 'bad decrypt — wrong key or IV mismatch\nMake sure to use the full 64-char hex key derived from the sifted bitstring.';
            }
            if (fullCmd.includes('rand') || fullCmd.includes('-rand')) {
                return 'b7f3a91e2c8d4056f1e3a7b29c8d4f501234567890abcdef1234567890abcdef';
            }
            return 'openssl: unknown option. Common usage:\n  openssl enc -aes-256-cbc -d -K <key> -iv <iv> -in intercepted_comm.aes';
        },

        // pip / pip3 — package info
        'pip3': function(args) {
            const sub = args[0] || '';
            if (sub === 'list') {
                return `Package         Version
--------------- -------
numpy           1.26.4
pandas          2.2.0
pycryptodome    3.20.0
qiskit          1.0.0
scipy           1.12.0`;
            }
            if (sub === 'install') {
                const pkg = args[1] || '';
                return `Requirement already satisfied: ${pkg || 'package'} in /usr/lib/python3/dist-packages`;
            }
            return 'Usage: pip3 list | pip3 install <package>';
        },

        'pip': function(args) { return D5Config.commands.pip3(args); },

        // cd — silently accept in analyst context
        'cd': function(args) { return ''; },

        // exit
        'exit': function() { return 'logout'; },

        // env
        'env': function() {
            return 'SHELL=/bin/bash\nHOME=/home/peerless\nUSER=peerless\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nLANG=en_US.UTF-8\nPYTHONPATH=/usr/lib/python3\nTERM=xterm-256color';
        },

        // which
        'which': function(args) {
            const cmd = args[0] || '';
            const known = { python3: '/usr/bin/python3', python: '/usr/bin/python3', openssl: '/usr/bin/openssl', nmap: '/usr/bin/nmap', grep: '/usr/bin/grep', awk: '/usr/bin/awk' };
            return known[cmd] ? known[cmd] : '';
        },

        // man — quick reference
        'man': function(args) {
            const cmd = args[0] || '';
            if (!cmd) return 'Usage: man <command>';
            const manPages = {
                'python3': 'python3 — an interpreted, interactive, object-oriented programming language\nUsage: python3 [-c cmd | script | -]\nKey libs: from Crypto.Cipher import AES  (PyCryptodome)',
                'openssl': 'openssl enc — symmetric cipher routines\nUsage: openssl enc -aes-256-cbc -d -K <hexkey> -iv <hexiv> -in <file>\nNote: -K expects hex, no 0x prefix',
                'nmap': 'nmap — network exploration tool and security scanner\nUsage: nmap [options] <target>\nKey options: -sV (version), -p (ports), -A (aggressive)',
                'grep': 'grep — print lines matching a pattern\nUsage: grep [OPTIONS] PATTERN [FILE]\nKey options: -i (ignore-case), -n (line number), -c (count)',
                'awk': 'awk — pattern scanning and text processing\nUsage: awk \'{ print $N }\' FILE\nColumns in CSV: $1=seq, $2=alice_basis, $3=alice_bit, $4=photon_state'
            };
            return manPages[cmd] || 'No manual entry for ' + cmd;
        },

        // ss / netstat
        'ss': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },
        'netstat': function(args) { return D5Config.commands.ss(args); },

        // curl — QKD-HUB-01 management API access
        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            // QKD management interface
            if (url.includes('10.20.0.5') || url.includes('qkd-hub-01')) {
                if (url.includes('/api/status')) {
                    return `{
  "node_id": "QKD-HUB-01",
  "protocol": "BB84",
  "version": "2.0",
  "uptime": "47d 6h 23m",
  "qber_current": 0.083,
  "qber_threshold": 0.25,
  "prng_module": "stdlib_random",
  "entropy_source": "software",
  "patch_v2_1_deployed": false,
  "alert": "PRNG seed rotation pending — see maintenance ticket CHR-2024-891"
}`;
                }
                if (url.includes('/api/channels')) {
                    return `[
  {"channel_id":"CH-9","peer":"OUTPOST-SIGMA-7","status":"ACTIVE","sifted_bits":38},
  {"channel_id":"CH-11","peer":"OUTPOST-DELTA-2","status":"STANDBY","sifted_bits":0},
  {"channel_id":"CH-14","peer":"TEMPORAL-NEXUS-ANCHOR","status":"ENCRYPTED","sifted_bits":76}
]`;
                }
                if (url.includes('/api/prng-config')) {
                    return 'HTTP/1.1 401 Unauthorized\n{"error":"Authentication required","hint":"See qkd_protocol_spec.txt Section 3"}';
                }
                if (url.includes('/api/session-log')) {
                    if (engine) engine.advancePhase && engine.advancePhase('flaw_id');
                    return `[
  {"ts":"2026-03-20T00:00:02Z","event":"PRNG_INIT","detail":"module=stdlib_random seed=CONFIGURED"},
  {"ts":"2026-03-20T00:00:05Z","event":"SIFTING_COMPLETE","detail":"38/64 bases matched (59.4%)"},
  {"ts":"2026-03-20T00:00:07Z","event":"KEY_DERIVED","detail":"AES-256 key derived from sifted bitstring"},
  {"ts":"2026-03-20T00:00:08Z","event":"COMM_ENCRYPTED","detail":"intercepted_comm.aes dispatched"},
  {"ts":"2026-03-20T00:00:09Z","event":"ANOMALY","detail":"External observer on NX-17-FOXTROT — QBER below abort threshold"}
]`;
                }
                // Root of management interface
                return `QKD-HUB-01 — Chronos Syndicate Quantum Management Interface v2.0
Protocol: BB84 | Status: OPERATIONAL

Available endpoints:
  /api/status       — system health
  /api/channels     — active quantum channels
  /api/prng-config  — PRNG configuration (auth required)
  /api/session-log  — recent QKD session logs`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        // wget — alternative HTTP client
        'wget': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'wget: missing URL';
            if (url.includes('10.20.0.5') || url.includes('qkd-hub-01')) {
                return D5Config.commands.curl([url], term, engine);
            }
            return `--2026-03-20 00:00:00--  ${url}\nConnecting to ${url.split('/')[2] || 'host'}... failed: Connection refused.`;
        },

        // echo
        'echo': function(args) { return args.join(' '); },

        // history
        'history': function() {
            return `    1  cat qkd_protocol_spec.txt
    2  python3 analyze_prng.py
    3  cat simulated_photon_polarizations.csv | head -10
    4  python3 -c "import random; random.seed(42); print([random.randint(0,3) for _ in range(8)])"
    5  python3 decrypt_comm.py a3f7c2e891b64d056f2d9a4b78c1e3f02b5d8e7c9a6f1d3042b8e5c70d4f9261`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // QKD-HUB-01 MANAGEMENT INTERFACE (port 4242)
    // Simulated web interface — accessible via curl/browser
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.20.0.5:4242/',

        pages: {
            '/': {
                title: 'QKD-HUB-01 — Chronos Syndicate Quantum Management',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #4c1d95;">
                        <h1 style="color:#7c3aed; font-size:1.5rem; font-family:monospace; margin-bottom:4px;">QKD-HUB-01</h1>
                        <div style="color:#a78bfa; font-size:0.85rem; font-weight:700; letter-spacing:0.15em;">CHRONOS SYNDICATE — QUANTUM KEY DISTRIBUTION MANAGEMENT</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">Quantum Channel v2.0 | Protocol: BB84 | Status: OPERATIONAL</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#1e1b4b; border:1px solid #4c1d95; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#a78bfa;">64</div>
                            <div style="color:#888; font-size:0.7rem;">Photons Transmitted</div>
                        </div>
                        <div style="background:#1e1b4b; border:1px solid #4c1d95; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#a78bfa;">38</div>
                            <div style="color:#888; font-size:0.7rem;">Sifted Key Bits</div>
                        </div>
                        <div style="background:#1e1b4b; border:1px solid #4c1d95; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#f87171;">8.3%</div>
                            <div style="color:#888; font-size:0.7rem;">QBER (channel noise)</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto; padding:12px; background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.25); border-radius:4px; font-size:0.78rem; color:#a78bfa; font-family:monospace;">
                        <strong>MANAGEMENT API ENDPOINTS:</strong><br>
                        GET /api/status — system health<br>
                        GET /api/channels — active quantum channels<br>
                        GET /api/prng-config — PRNG configuration (auth required)<br>
                        GET /api/session-log — recent QKD session logs
                    </div>
                `,
                formHandler: null
            },
            '/api/status': {
                title: 'QKD-HUB-01 — System Status',
                html: `<div style="font-family:monospace; font-size:0.85rem; padding:20px;">
                    <div style="color:#7c3aed; font-size:1rem; margin-bottom:16px; font-weight:700;">{ "system": "QKD-HUB-01", "status": "OPERATIONAL" }</div>
                    <pre style="background:#1e1b4b; color:#a78bfa; padding:16px; border-radius:6px; overflow:auto;">{
  "node_id": "QKD-HUB-01",
  "protocol": "BB84",
  "version": "2.0",
  "uptime": "47d 6h 23m",
  "channels_active": 3,
  "last_key_exchange": "2026-03-20T00:14:07Z",
  "qber_current": 0.083,
  "qber_threshold": 0.25,
  "prng_module": "stdlib_random",
  "entropy_source": "software",
  "patch_v2_1_deployed": false,
  "alert": "PRNG seed rotation pending — see maintenance ticket CHR-2024-891"
}</pre>
                    <div style="color:#f87171; font-size:0.75rem; margin-top:12px;">NOTICE: Patch v2.1 (hardware entropy source) not yet deployed. Current PRNG uses software seed.</div>
                </div>`,
                formHandler: null
            },
            '/api/channels': {
                title: 'QKD-HUB-01 — Active Channels',
                html: `<div style="font-family:monospace; font-size:0.82rem; padding:20px;">
                    <div style="color:#7c3aed; font-size:0.95rem; margin-bottom:12px; font-weight:700;">Active Quantum Channels</div>
                    <pre style="background:#1e1b4b; color:#a78bfa; padding:14px; border-radius:6px; overflow:auto;">[
  {
    "channel_id": "CH-9",
    "peer": "OUTPOST-SIGMA-7",
    "peer_ip": "10.20.1.42",
    "status": "ACTIVE",
    "photons_sent": 64,
    "sifted_bits": 38,
    "key_confirmed": true,
    "session_start": "2026-03-20T00:00:00Z"
  },
  {
    "channel_id": "CH-11",
    "peer": "OUTPOST-DELTA-2",
    "peer_ip": "10.20.1.71",
    "status": "STANDBY",
    "photons_sent": 0,
    "sifted_bits": 0,
    "key_confirmed": false,
    "session_start": null
  },
  {
    "channel_id": "CH-14",
    "peer": "TEMPORAL-NEXUS-ANCHOR",
    "peer_ip": "10.20.2.1",
    "status": "ENCRYPTED",
    "photons_sent": 128,
    "sifted_bits": 76,
    "key_confirmed": true,
    "session_start": "2026-03-19T18:30:00Z"
  }
]</pre>
                    <div style="color:#888; font-size:0.72rem; margin-top:10px;">Channel 9 (OUTPOST-SIGMA-7) is the target of the intercepted communication.</div>
                </div>`,
                formHandler: null
            },
            '/api/prng-config': {
                title: '401 Unauthorized',
                html: `<div style="text-align:center; padding:40px; font-family:monospace;">
                    <h1 style="color:#7c3aed; font-size:2rem;">401 Unauthorized</h1>
                    <p style="color:#a78bfa;">Authentication required for PRNG configuration endpoint.</p>
                    <div style="background:#1e1b4b; color:#f87171; padding:12px 20px; border-radius:4px; font-size:0.78rem; display:inline-block; margin-top:12px;">
                        Hint: The protocol specification (qkd_protocol_spec.txt Section 3) documents the current PRNG configuration in cleartext.
                    </div>
                </div>`,
                formHandler: null
            },
            '/api/session-log': {
                title: 'QKD-HUB-01 — Session Log',
                html: `<div style="font-family:monospace; font-size:0.82rem; padding:20px;">
                    <div style="color:#7c3aed; font-size:0.95rem; margin-bottom:12px; font-weight:700;">QKD Session Log — CH-9</div>
                    <pre style="background:#1e1b4b; color:#a78bfa; padding:14px; border-radius:6px; overflow:auto;">[2026-03-20T00:00:01Z] CH-9 SESSION START | PEER: OUTPOST-SIGMA-7
[2026-03-20T00:00:02Z] PRNG INIT | module=stdlib_random seed=CONFIGURED
[2026-03-20T00:00:02Z] Alice basis sequence generated (64 photons)
[2026-03-20T00:00:03Z] Photon transmission: 64 qubits sent
[2026-03-20T00:00:04Z] Bob measurement complete
[2026-03-20T00:00:05Z] Sifting: 38/64 bases matched (59.4%)
[2026-03-20T00:00:05Z] QBER measurement: 0.083 (below threshold 0.250)
[2026-03-20T00:00:06Z] Key confirmed — 38 sifted bits available
[2026-03-20T00:00:07Z] AES-256 key derived from sifted bitstring
[2026-03-20T00:00:08Z] Classical channel encrypted — intercepted_comm.aes transmitted
[2026-03-20T00:00:09Z] CH-9 SESSION COMPLETE | Key material in use</pre>
                    <div style="color:#f87171; font-size:0.72rem; margin-top:10px; padding:8px; background:rgba(248,113,113,0.08); border-radius:4px;">
                        ANOMALY LOGGED: External observer detected on fiber segment NX-17-FOXTROT (2026-03-20T00:00:04Z). QBER within threshold — no abort triggered.
                    </div>
                </div>`,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // QKD CHANNEL DATABASE (simulated hub-side records)
    // ═══════════════════════════════════════════════════════

    _qkdChannelDb: {
        channels: [
            { channel_id: 'CH-9',  peer: 'OUTPOST-SIGMA-7', peer_ip: '10.20.1.42', status: 'ACTIVE',    sifted_bits: 38, session: '2026-03-20T00:00:00Z' },
            { channel_id: 'CH-11', peer: 'OUTPOST-DELTA-2',  peer_ip: '10.20.1.71', status: 'STANDBY',  sifted_bits: 0,  session: null },
            { channel_id: 'CH-14', peer: 'TEMPORAL-NEXUS-ANCHOR', peer_ip: '10.20.2.1', status: 'ENCRYPTED', sifted_bits: 76, session: '2026-03-19T18:30:00Z' }
        ],
        prng_config: {
            module: 'stdlib_random',
            seed: 42,
            period: 4,
            basis_map: { 0: 'R', 1: 'R', 2: 'D', 3: 'D' },
            patch_applied: false,
            ticket: 'CHR-2024-891'
        },
        session_log: [
            { ts: '2026-03-20T00:00:01Z', event: 'SESSION_START',   channel: 'CH-9', detail: 'PEER: OUTPOST-SIGMA-7' },
            { ts: '2026-03-20T00:00:02Z', event: 'PRNG_INIT',       channel: 'CH-9', detail: 'module=stdlib_random seed=CONFIGURED' },
            { ts: '2026-03-20T00:00:05Z', event: 'SIFTING_COMPLETE',channel: 'CH-9', detail: '38/64 bases matched (59.4%)' },
            { ts: '2026-03-20T00:00:07Z', event: 'KEY_DERIVED',     channel: 'CH-9', detail: '{{FLAG:partial_key}} — AES-256 key in use' },
            { ts: '2026-03-20T00:00:08Z', event: 'COMM_ENCRYPTED',  channel: 'CH-9', detail: 'intercepted_comm.aes dispatched' },
            { ts: '2026-03-20T00:00:09Z', event: 'SESSION_COMPLETE',channel: 'CH-9', detail: 'Chronos Directive transmitted' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#7c3aed; border-bottom:2px solid #ddd; background:#f5f3ff;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
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
