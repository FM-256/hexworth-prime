/* ============================================================
   CTF ARENA — Box C18: The Whispering Crypt
   Multi-Stage Campaign | Hardware Side-Channel Attack Simulation
   Config: DPA trace analysis, AES key recovery, ciphertext decryption
   ============================================================ */

const C18Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Whispering Crypt',
    subtitle: 'Multi-Stage Campaign — Hardware Side-Channel Attack & Key Recovery',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_c18',
    registryId: 'c18-whispering-crypt',
    trackerKey: 'ctf_c18',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'acquisition',
            name: 'Signal Acquisition',
            icon: '\uD83D\uDCC8',
            description: 'Retrieve and inspect the simulated side-channel artifacts from SEC-ENC-UNIT-01. Load traces.csv and validate alignment across all 256 power traces.',
            requiredFlags: [],
            mitre: ['T1602', 'T1040'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Trace Analysis',
            icon: '\uD83D\uDD2C',
            description: 'Apply statistical profiling to the power consumption traces. Identify the region of interest corresponding to the AES first-round S-box operation.',
            requiredFlags: [],
            mitre: ['T1602.002', 'T1057'],
            unlocks: ['dpa'],
            locked: true
        },
        {
            id: 'dpa',
            name: 'Differential Power Analysis',
            icon: '\uD83D\uDD11',
            description: 'Run DPA against each of the 16 key bytes. For each byte, compute Hamming weight hypotheses against known plaintext and correlate with the trace set.',
            requiredFlags: ['user'],
            mitre: ['T1600', 'T1600.001'],
            unlocks: ['reconstruction'],
            locked: true
        },
        {
            id: 'reconstruction',
            name: 'Key Reconstruction',
            icon: '\uD83E\uDDE9',
            description: 'Assemble all 16 recovered key bytes into the full 128-bit AES master key. Verify key integrity before proceeding to decryption.',
            requiredFlags: [],
            mitre: ['T1600', 'T1040'],
            unlocks: ['decryption'],
            locked: true
        },
        {
            id: 'decryption',
            name: 'Communication Decryption',
            icon: '\uD83D\uDCDC',
            description: 'Decrypt encrypted_comm.bin using the recovered AES-128 ECB key. Extract and read the Citadel Master Plan to complete the operation.',
            requiredFlags: ['root'],
            mitre: ['T1600', 'T1119'],
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
                title: 'Load the side-channel trace file',
                tip: 'Start with: python3 analyze.py --load traces.csv — This validates alignment and gives basic statistics on the 256-trace dataset.',
                trigger: { event: 'command', match: { cmd: 'contains:python' } }
            },
            {
                title: 'Identify the AES S-box region of interest',
                tip: 'Run: python3 analyze.py --roi traces.csv — Look for the high-variance region in the first 50 sample points. That is where S-box operations occur.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:roi' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:analyze' } },
                        { event: 'command', match: { cmd: 'contains:numpy' } }
                    ]
                }
            },
            {
                title: 'Recover the first 8 key bytes (Flag 1)',
                tip: 'Run: python3 dpa.py --bytes 0-7 — DPA will compute 256 Hamming weight hypotheses per byte and rank by Pearson correlation. The top candidate is the correct byte.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Complete full 16-byte AES key reconstruction',
                tip: 'Run: python3 dpa.py --bytes 8-15 — Extend the DPA to all 16 key bytes. Combine with the first 8 bytes to form the full 128-bit master key.',
                trigger: { event: 'command', match: { cmd: 'contains:dpa' } }
            },
            {
                title: 'Decrypt the intercepted communication',
                tip: 'Run: python3 decrypt.py --key <recovered_key_hex> --input encrypted_comm.bin — AES-128 ECB mode. The plaintext contains the Citadel Master Plan and Flag 2.',
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
            {
                flagId: 'user',
                objective: '3.3',
                description: 'Given a scenario, implement cryptographic solutions — Understanding AES S-box operations and side-channel leakage models',
                skill: 'Side-Channel Analysis & Partial Key Recovery'
            },
            {
                flagId: 'root',
                objective: '2.1',
                description: 'Given a scenario, apply cryptography and PKI concepts — AES-128 ECB mode decryption using a side-channel-recovered key',
                skill: 'Full Key Reconstruction & Cryptographic Decryption'
            },
            {
                flagId: 'root',
                objective: '1.2',
                description: 'Given a scenario, analyze indicators of malicious activity — Physical side-channel attacks as a class of hardware-level threat',
                skill: 'Hardware Security & Side-Channel Attack Awareness'
            }
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
            'USB: 2 devices detected',
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
        hostname: 'kali-dpa',
        startDir: '/home/analyst',
        welcome: 'Linux kali-dpa 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget Device: SEC-ENC-UNIT-01 (Citadel Vault — Air-Gapped Cryptographic Processor)\nArtifacts staged in: /home/analyst/vault_artifacts/\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (analysis pipeline state)
    // ═══════════════════════════════════════════════════════

    _context: 'analyst',            // 'analyst' | 'dpa-active' | 'decryption'
    _tracesLoaded: false,           // traces.csv has been loaded/inspected
    _roiIdentified: false,          // region of interest located in traces
    _partialKeyRecovered: false,    // first 8 bytes of AES key recovered (Flag 1)
    _fullKeyRecovered: false,       // all 16 bytes recovered
    _recoveredKey: '',              // hex string of recovered key
    _decryptionAttempts: 0,         // wrong key attempts counter

    // The real AES-128 key SEC-ENC-UNIT-01 uses (simulated — fake credential)
    _masterKey: 'a3f2c91d7e4b8056e1d9c7a52f3b0e84',

    // First 8 bytes of key as hex (Flag 1 value embedded via {{FLAG:user}})
    _keyPartA: 'a3f2c91d7e4b8056',

    _switchContext(ctx, term) {
        C18Config._context = ctx;
        if (term && term.config) {
            var prompt = C18Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'analyst';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (C18Config._context) {
            case 'dpa-active':  return 'analyst@kali-dpa:[dpa]$ ';
            case 'decryption':  return 'analyst@kali-dpa:[decrypt]$ ';
            default:            return null;
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED SIDE-CHANNEL ARTIFACTS (in-memory data)
    // ═══════════════════════════════════════════════════════

    // traces.csv: 256 traces x 100 sample points — simulated power values
    // Values approximate a realistic HW model with noise
    _tracesMeta: {
        num_traces: 256,
        num_samples: 100,
        sample_rate_mhz: 100,
        target_algorithm: 'AES-128',
        target_operation: 'First-round SubBytes (S-box)',
        adc_bits: 12,
        snr_db: 14.3,
        capture_date: '2026-03-12',
        device_id: 'SEC-ENC-UNIT-01',
        notes: 'Traces captured via EM probe near crypto co-processor. ROI: samples 12-38.'
    },

    // Sample trace preview (first 3 traces, first 16 samples each — for display)
    _tracesPreview: [
        [0.412, 0.398, 0.521, 0.843, 1.204, 1.876, 2.341, 2.198, 1.754, 1.290, 0.987, 0.832, 2.891, 3.102, 3.445, 3.210],
        [0.387, 0.401, 0.498, 0.812, 1.178, 1.842, 2.298, 2.154, 1.712, 1.245, 0.954, 0.811, 2.843, 3.071, 3.389, 3.178],
        [0.432, 0.419, 0.543, 0.867, 1.231, 1.903, 2.387, 2.243, 1.801, 1.334, 1.009, 0.856, 2.932, 3.145, 3.489, 3.251]
    ],

    // Known plaintext for DPA — the fixed header that was encrypted
    _knownPlaintext: '43697461 64656c20 436f6d6d 20486561',  // "Citadel Comm Hea" in hex

    // DPA correlation results per key byte (simulated — computed offline, shown interactively)
    // Each entry: { byte_idx, correct_key_byte, top_correlation, second_correlation }
    _dpaResults: [
        { byte_idx: 0,  correct: 0xa3, top_corr: 0.9821, noise: 0.3412 },
        { byte_idx: 1,  correct: 0xf2, top_corr: 0.9744, noise: 0.3287 },
        { byte_idx: 2,  correct: 0xc9, top_corr: 0.9803, noise: 0.3503 },
        { byte_idx: 3,  correct: 0x1d, top_corr: 0.9769, noise: 0.3198 },
        { byte_idx: 4,  correct: 0x7e, top_corr: 0.9856, noise: 0.3344 },
        { byte_idx: 5,  correct: 0x4b, top_corr: 0.9712, noise: 0.3421 },
        { byte_idx: 6,  correct: 0x80, top_corr: 0.9788, noise: 0.3267 },
        { byte_idx: 7,  correct: 0x56, top_corr: 0.9831, noise: 0.3389 },
        { byte_idx: 8,  correct: 0xe1, top_corr: 0.9794, noise: 0.3301 },
        { byte_idx: 9,  correct: 0xd9, top_corr: 0.9762, noise: 0.3415 },
        { byte_idx: 10, correct: 0xc7, top_corr: 0.9818, noise: 0.3277 },
        { byte_idx: 11, correct: 0xa5, top_corr: 0.9745, noise: 0.3398 },
        { byte_idx: 12, correct: 0x2f, top_corr: 0.9867, noise: 0.3231 },
        { byte_idx: 13, correct: 0x3b, top_corr: 0.9799, noise: 0.3312 },
        { byte_idx: 14, correct: 0x0e, top_corr: 0.9773, noise: 0.3447 },
        { byte_idx: 15, correct: 0x84, top_corr: 0.9841, noise: 0.3369 }
    ],

    // The decrypted plaintext of encrypted_comm.bin
    _decryptedMessage: 'CITADEL MASTER PLAN — OPERATION IRON WHISPER\n====================================================\nCLASSIFICATION: TOP SECRET // NOFORN // SCI\nISSUED BY: Directorate of Strategic Operations\nDATE: 2026-03-10\n\nPHASE 1 — ASSET POSITIONING\nForward units to be pre-positioned at grid references\nAlpha-7 (47.3N, 12.8E) and Bravo-12 (51.2N, 9.4E)\nby 2026-03-25. Logistics chains activated.\n\nPHASE 2 — SIGNAL BLACKOUT\nAll SIGINT collection suspended 72 hours prior\nto zero hour. Counter-surveillance protocols\nactivated across all monitored frequencies.\n\nPHASE 3 — ZERO HOUR EXECUTION\nZero hour: 2026-04-01 02:00 UTC.\nPrimary relay: CIPHER-NODE-ECHO.\nBackup relay: CIPHER-NODE-FOXTROT.\nConfirmation phrase: "The crypt no longer whispers."\n\n{{FLAG:root}}\n\nEND TRANSMISSION — SEC-ENC-UNIT-01',

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 200 },
        { id: 'root', points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 3600000, points: 200 },  // 60 minutes
        timeBonusThreshold: 7200   // 120 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by loading and inspecting traces.csv. Run: python3 analyze.py --load traces.csv — This shows trace count, sample count, and statistical summary. The metadata header in the CSV describes the AES S-box region of interest.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Identify the ROI before running DPA. Run: python3 analyze.py --roi traces.csv — The S-box operations for AES first-round occur roughly at sample indices 12-38. High inter-trace variance there indicates the leakage window.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'For DPA, use Hamming weight of the AES S-box output as the power model. For each key byte hypothesis k (0-255): hyp[trace] = HW(SBOX[plaintext[byte] XOR k]). Compute Pearson correlation between hyp[] and the actual trace values in the ROI. The hypothesis with highest correlation is the correct key byte. Flag 1 is the first 8 bytes of the key in hex.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Decryption uses AES-128 ECB mode (no IV needed). Once you have the full 16-byte key: python3 decrypt.py --key <32-hex-char-key> --input encrypted_comm.bin — The plaintext is ASCII. Flag 2 is embedded at the end of the decrypted communication.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Deep within the Citadel\'s reinforced vault, a dedicated cryptographic co-processor designated SEC-ENC-UNIT-01 handles all high-value communications for the Directorate of Strategic Operations. The device is air-gapped, physically hardened, and operationally isolated — no digital attack surface exists. Yet every computation it performs leaks energy. An EM probe mounted near the power rail captures the device\'s electromagnetic signature during encryption. Those traces are now in your hands. Your mission, Peerless: analyze the side-channel leakage, recover the device\'s AES-128 master key using Differential Power Analysis, and decrypt the intercepted Citadel Master Plan.',
        scenario: 'SEC-ENC-UNIT-01 encrypts all outgoing strategic communications using a fixed AES-128 key. The device was designed to resist logical attack — but no physical shielding was added due to a procurement oversight. An intelligence asset installed a sub-millimeter EM probe adjacent to the device\'s crypto co-processor and captured 256 power traces during normal encryption operations. Each trace corresponds to one encryption of a known-plaintext header block. The known plaintext is a fixed communications preamble used in all transmissions. The device was captured encrypting "Citadel Comm Hea" (16 bytes) repeatedly. DPA exploits the correlation between the Hamming weight of AES intermediate values and the measured power consumption to recover the key byte by byte.',
        outro: 'SEC-ENC-UNIT-01\'s master key has been fully recovered through side-channel analysis. The Citadel Master Plan — detailing operational timelines, asset positions, and zero-hour execution parameters — is now compromised. Operation Iron Whisper cannot proceed as planned. The failure of physical security countermeasures has exposed a top-secret multi-phase operation.',
        ecer: {
            executive: 'Procurement committee approved SEC-ENC-UNIT-01 without a physical security review; EM shielding was cut from the budget as a "non-essential" line item',
            culture: 'Engineering team focused exclusively on logical attack surfaces; hardware side-channel attack vectors were not part of the threat model',
            employee: 'No Faraday cage installed around the crypto module; power-line filtering absent; probe access to the PCB was possible via standard maintenance panel',
            regulatory: 'Side-channel resistance requirements were listed as optional in the procurement specification despite handling TOP SECRET / SCI communications'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Citadel Vault Device Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.50.0.1/',

        pages: {
            '/': {
                title: 'SEC-ENC-UNIT-01 — Vault Device Interface',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #3d1f5a;">
                        <div style="color:#8e44ad; font-size:0.7rem; font-weight:700; letter-spacing:0.3em; margin-bottom:6px;">CITADEL VAULT MANAGEMENT INTERFACE</div>
                        <h1 style="color:#e8d5ff; font-size:1.4rem; font-family:monospace; margin-bottom:4px;">SEC-ENC-UNIT-01</h1>
                        <div style="color:#9b59b6; font-size:0.8rem;">Cryptographic Co-Processor — Vault Node Alpha</div>
                    </div>

                    <div style="max-width:560px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#1a0a2e; border:1px solid #4a1a6e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:0.65rem; color:#9b59b6; letter-spacing:0.1em; margin-bottom:4px;">STATUS</div>
                            <div style="color:#2ecc71; font-size:0.8rem; font-weight:700;">OPERATIONAL</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #4a1a6e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:0.65rem; color:#9b59b6; letter-spacing:0.1em; margin-bottom:4px;">ALGORITHM</div>
                            <div style="color:#e8d5ff; font-size:0.8rem; font-weight:700;">AES-128 ECB</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #4a1a6e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:0.65rem; color:#9b59b6; letter-spacing:0.1em; margin-bottom:4px;">OPS COUNT</div>
                            <div style="color:#e8d5ff; font-size:0.8rem; font-weight:700;">4,194,302</div>
                        </div>
                    </div>

                    <div style="max-width:560px; margin:0 auto 16px; padding:12px 16px; background:#1a0a2e; border:1px solid #4a1a6e; border-radius:6px; font-family:monospace; font-size:0.75rem; color:#9b59b6;">
                        <div style="color:#8e44ad; margin-bottom:8px; font-weight:700;">DEVICE INFORMATION</div>
                        <div>Firmware Version: v3.7.2-release</div>
                        <div>Key Storage: Internal OTP fuse bank (read-protected)</div>
                        <div>Physical Security: <span style="color:#e74c3c;">EM SHIELDING: NOT FITTED</span></div>
                        <div>Last Key Rotation: 2025-11-04</div>
                        <div>Trace Port: <a href="/trace-export" style="color:#8e44ad;">/trace-export</a> (maintenance)</div>
                    </div>

                    <div style="max-width:560px; margin:0 auto; padding:10px 14px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:4px; font-size:0.72rem; color:#888;">
                        <strong style="color:#e74c3c;">MAINTENANCE NOTICE:</strong> EM shielding installation deferred to Q3 procurement cycle. Physical access restricted — vault door PIN required. Internal use only.
                    </div>
                `,
                formHandler: null
            },

            '/trace-export': {
                title: 'SEC-ENC-UNIT-01 — Trace Export',
                html: `
                    <div style="text-align:center; margin-bottom:20px;">
                        <h2 style="color:#e8d5ff; font-family:monospace; font-size:1.1rem;">Trace Export — Maintenance Interface</h2>
                        <div style="color:#9b59b6; font-size:0.75rem;">Diagnostic trace capture for hardware validation</div>
                    </div>

                    <div style="max-width:500px; margin:0 auto;">
                        <div style="background:#1a0a2e; border:1px solid #4a1a6e; border-radius:6px; padding:16px; margin-bottom:16px; font-family:monospace; font-size:0.75rem;">
                            <div style="color:#8e44ad; margin-bottom:8px;">AVAILABLE EXPORTS</div>
                            <div style="color:#ccc; margin-bottom:4px;">traces.csv — 256 power traces, 100 samples/trace</div>
                            <div style="color:#ccc; margin-bottom:4px;">known_plaintext.txt — Encryption preamble (hex)</div>
                            <div style="color:#ccc; margin-bottom:4px;">encrypted_comm.bin — Intercepted ciphertext</div>
                            <div style="color:#ccc;">algorithm_spec.txt — Cipher specification</div>
                        </div>
                        <div style="padding:10px 14px; background:rgba(46,204,113,0.06); border:1px solid rgba(46,204,113,0.2); border-radius:4px; font-size:0.72rem; color:#2ecc71;">
                            Files pre-staged on analyst workstation at: /home/analyst/vault_artifacts/
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/algorithm_spec.txt': {
                title: 'Algorithm Specification',
                html: `
                    <pre style="font-family:monospace; font-size:0.8rem; color:#ccc; line-height:1.7; white-space:pre-wrap;">SEC-ENC-UNIT-01 Algorithm Specification
=============================================
Algorithm  : AES (Advanced Encryption Standard)
Key Size   : 128 bits (16 bytes)
Mode       : ECB (Electronic Codebook)
Padding    : PKCS7
Input      : 16-byte plaintext blocks
Output     : 16-byte ciphertext blocks

Side-Channel Leakage Model (for DPA):
  Target   : First-round SubBytes operation
  Function : power ~ HW(SBOX[plaintext[i] XOR key[i]])
  where HW  = Hamming weight (popcount)
  and SBOX  = AES S-box lookup table

Note: ECB mode means each 16-byte block is encrypted
independently with the same key. No IV is used.
Key is stored in internal OTP fuse bank (128-bit, fixed).
</pre>
                `,
                formHandler: null
            },

            '/known_plaintext.txt': {
                title: 'Known Plaintext',
                html: `
                    <pre style="font-family:monospace; font-size:0.8rem; color:#ccc; line-height:1.7; white-space:pre-wrap;">Known Plaintext Block (All 256 Traces)
=======================================
All 256 captured traces correspond to encryption
of the following fixed 16-byte communications header.

Hex:   43 69 74 61 64 65 6c 20 43 6f 6d 6d 20 48 65 61
ASCII: Citadel Comm Hea

This header is prepended to every transmission and
encrypted with the same key under AES-128 ECB mode.

Use this known plaintext in your DPA attack:
  For each trace t, for each key byte i (0-15):
    For each key hypothesis k (0-255):
      hw_model[k][t] = HW(SBOX[pt[i] XOR k])
    corr[k] = pearson(hw_model[k], traces[t][ROI])
  Correct key byte = argmax(corr)
</pre>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (analyst workstation — kali-dpa)
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
                                    content: '=== MISSION BRIEFING: OPERATION IRON WHISPER ===\nTarget: SEC-ENC-UNIT-01 (Citadel Vault — Crypto Co-Processor)\nObjective: Side-channel key recovery + ciphertext decryption\n\nAttack chain:\n1. Load traces.csv — inspect 256-trace power dataset\n2. Identify AES S-box region of interest (ROI) in trace\n3. Run DPA — recover first 8 key bytes (user.txt)\n4. Complete DPA — recover all 16 AES key bytes\n5. Decrypt encrypted_comm.bin with recovered key (root.txt)\n\nArtifacts staged in: /home/analyst/vault_artifacts/\nTools staged in: /home/analyst/tools/\n\nThe device whispers its secrets in voltage. Listen carefully.'
                                },
                                'vault_artifacts': {
                                    type: 'dir',
                                    children: {
                                        'traces.csv': {
                                            type: 'file',
                                            content: '# SEC-ENC-UNIT-01 Power Traces\n# Format: 256 rows (traces) x 100 columns (sample points)\n# Target operation: AES-128 first-round SubBytes\n# Sample rate: 100 MHz | ADC: 12-bit | SNR: 14.3 dB\n# ROI hint: High-variance region at sample indices 12-38\n# Known plaintext: 43 69 74 61 64 65 6c 20 43 6f 6d 6d 20 48 65 61\n#\n# [Trace data — 256 rows, 100 columns — too large to display inline]\n# Load with: import numpy as np; traces = np.loadtxt("traces.csv", delimiter=",")\n# Or use: python3 /home/analyst/tools/analyze.py --load traces.csv'
                                        },
                                        'known_plaintext.txt': {
                                            type: 'file',
                                            content: 'Known Plaintext Block (All 256 Traces)\n=======================================\nHex:   43 69 74 61 64 65 6c 20 43 6f 6d 6d 20 48 65 61\nASCII: Citadel Comm Hea\n\nAll 256 traces correspond to AES-128 encryption of this\nexact 16-byte block under the device master key.\nUse this as input for your DPA hypotheses.'
                                        },
                                        'encrypted_comm.bin': {
                                            type: 'file',
                                            content: '[Binary ciphertext — AES-128 ECB encrypted]\nSize: 512 bytes (32 blocks)\nFile not displayable as text.\nDecrypt with: python3 /home/analyst/tools/decrypt.py --key <hex_key> --input encrypted_comm.bin'
                                        },
                                        'algorithm_spec.txt': {
                                            type: 'file',
                                            content: 'SEC-ENC-UNIT-01 Algorithm Specification\n=============================================\nAlgorithm  : AES (Advanced Encryption Standard)\nKey Size   : 128 bits (16 bytes)\nMode       : ECB (Electronic Codebook)\nPadding    : PKCS7\nInput      : 16-byte plaintext blocks\nOutput     : 16-byte ciphertext blocks\n\nSide-Channel Leakage Model (for DPA):\n  Target   : First-round SubBytes operation\n  Function : power ~ HW(SBOX[plaintext[i] XOR key[i]])\n  where HW  = Hamming weight (popcount)\n  and SBOX  = AES S-box lookup table\n\nNote: ECB mode — no IV required. Fixed 128-bit key in OTP fuse bank.'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'analyze.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""analyze.py — Trace loader and ROI inspector for DPA pipeline"""\nimport argparse\nimport numpy as np\n\nAES_SBOX = [\n    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,\n    # ... (full 256-entry S-box)\n]\n\ndef load_traces(path):\n    """Load CSV trace file, skipping comment lines."""\n    print(f"[*] Loading traces from: {path}")\n    # traces = np.loadtxt(path, delimiter=",", comments="#")\n    print(f"[+] Loaded 256 traces x 100 samples")\n    print(f"[+] Value range: 0.38 - 3.49 (normalized power, AU)")\n    print(f"[+] Mean: 1.742 | Std: 0.847")\n    return None\n\ndef identify_roi(traces):\n    """Compute inter-trace variance to find S-box leakage window."""\n    print("[*] Computing inter-trace variance across all sample points...")\n    print("[+] Variance profile (sample index : variance):")\n    for i in range(0, 15):\n        bar = "=" * int(float(i) / 1.5)\n        print(f"  {i:3d} | {bar}")\n    print("  12  | ==========================  <- ROI START")\n    for i in range(13, 38):\n        print("  %3d | ==========================  <- HIGH VARIANCE (S-box)" % i)\n    print("  38  | ==========================  <- ROI END")\n    print("[+] Region of interest identified: sample indices 12-38 (26 samples)")\n    print("[+] Recommendation: use ROI slice traces[:, 12:38] for DPA correlation")\n\nif __name__ == "__main__":\n    parser = argparse.ArgumentParser()\n    parser.add_argument("--load", metavar="FILE")\n    parser.add_argument("--roi", metavar="FILE")\n    args = parser.parse_args()\n    if args.load:\n        load_traces(args.load)\n    elif args.roi:\n        identify_roi(None)\n    else:\n        print("Usage: analyze.py --load <file> | --roi <file>")'
                                        },
                                        'dpa.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""dpa.py — Differential Power Analysis against AES-128 S-box"""\nimport argparse\nimport numpy as np\nfrom scipy.stats import pearsonr\n\n# AES S-box (full 256 entries)\nAES_SBOX = [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,\n            0xfe,0xd7,0xab,0x76,0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,\n            # (full table not shown — import from pycryptodome in production)\n            ]\n\nKNOWN_PT = bytes.fromhex("436974616465 6c2043 6f6d6d2048 6561".replace(" ", ""))\nROI_START = 12\nROI_END   = 38\n\ndef hamming_weight(v):\n    return bin(v).count("1")\n\ndef dpa_byte(traces_roi, pt_byte, byte_idx):\n    """Run DPA on one key byte. Returns ranked list of (correlation, key_hypothesis)."""\n    correlations = []\n    for k_hyp in range(256):\n        # Hypothetical power model: HW of S-box output\n        hw_model = [hamming_weight(AES_SBOX[pt_byte ^ k_hyp])] * len(traces_roi)\n        # Pearson correlation with mean of ROI trace window\n        corr, _ = pearsonr(hw_model, [np.mean(t) for t in traces_roi])\n        correlations.append((abs(corr), k_hyp))\n    correlations.sort(reverse=True)\n    return correlations\n\nif __name__ == "__main__":\n    parser = argparse.ArgumentParser()\n    parser.add_argument("--bytes", metavar="RANGE",\n                        help="Byte range to attack, e.g. 0-7 or 8-15")\n    args = parser.parse_args()\n    if not args.bytes:\n        print("Usage: dpa.py --bytes 0-7")\n    else:\n        print(f"[*] Running DPA on key byte range: {args.bytes}")\n        print("[*] Hamming weight power model | ROI: samples 12-38")\n        print("")'
                                        },
                                        'decrypt.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""decrypt.py — AES-128 ECB decryption with recovered key"""\nimport argparse\nfrom Crypto.Cipher import AES\nfrom Crypto.Util.Padding import unpad\n\ndef decrypt_ecb(key_hex, input_file):\n    """Decrypt AES-128 ECB ciphertext with the given hex key."""\n    try:\n        key = bytes.fromhex(key_hex)\n        if len(key) != 16:\n            print(f"[!] Key must be exactly 16 bytes (32 hex chars). Got: {len(key)}")\n            return\n        print(f"[*] Key: {key_hex}")\n        print(f"[*] Mode: AES-128 ECB")\n        print(f"[*] Input: {input_file}")\n        with open(input_file, "rb") as f:\n            ciphertext = f.read()\n        cipher = AES.new(key, AES.MODE_ECB)\n        plaintext = unpad(cipher.decrypt(ciphertext), 16)\n        print("[+] Decryption successful.")\n        print("")\n        print(plaintext.decode("utf-8"))\n    except Exception as e:\n        print(f"[!] Decryption failed: {e}")\n\nif __name__ == "__main__":\n    parser = argparse.ArgumentParser()\n    parser.add_argument("--key",   required=True, metavar="HEX_KEY")\n    parser.add_argument("--input", required=True, metavar="FILE")\n    args = parser.parse_args()\n    decrypt_ecb(args.key, args.input)'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls vault_artifacts/\ncat vault_artifacts/algorithm_spec.txt\ncat vault_artifacts/known_plaintext.txt\npython3 tools/analyze.py --load vault_artifacts/traces.csv'
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
                            content: 'kali-dpa'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nanalyst:x:1001:1001:DPA Analyst:/home/analyst:/bin/bash'
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'lib': {
                            type: 'dir',
                            children: {
                                'python3': {
                                    type: 'dir',
                                    children: {
                                        'dist-packages': {
                                            type: 'dir',
                                            children: {
                                                'numpy': { type: 'dir', children: {} },
                                                'scipy': { type: 'dir', children: {} },
                                                'Crypto': { type: 'dir', children: {} }
                                            }
                                        }
                                    }
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

        // --- python3 dispatcher: routes to analyze.py / dpa.py / decrypt.py ---
        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // ── analyze.py --load ──────────────────────────────────────────
            if (fullCmd.includes('analyze.py') || fullCmd.includes('analyze')) {
                if (fullCmd.includes('--load')) {
                    C18Config._tracesLoaded = true;
                    if (engine) engine.advancePhase && engine.advancePhase('analysis');
                    return `[*] Loading traces from: vault_artifacts/traces.csv
[+] Loaded 256 traces x 100 samples per trace
[+] File format: CSV, 256 rows x 100 columns
[+] Value range: 0.381 - 3.512 (AU — normalized power)
[+] Mean:   1.742
[+] StdDev: 0.847
[+] SNR:    14.3 dB (estimated)
[+] No alignment correction needed — traces are pre-aligned
[*] Metadata note: High-variance region detected near sample indices 12-38
[*] Run with --roi to visualize the region of interest.`;
                }

                // analyze.py --roi
                if (fullCmd.includes('--roi')) {
                    if (!C18Config._tracesLoaded) {
                        return '[!] Load traces first: python3 analyze.py --load vault_artifacts/traces.csv';
                    }
                    C18Config._roiIdentified = true;
                    return `[*] Computing inter-trace variance profile...
[*] Variance by sample index (normalized):

  Sample  0  | 0.032  ..
  Sample  1  | 0.041  ..
  Sample  2  | 0.039  ..
  Sample  3  | 0.045  ...
  Sample  4  | 0.052  ...
  Sample  5  | 0.061  ...
  Sample  6  | 0.089  ....
  Sample  7  | 0.102  .....
  Sample  8  | 0.118  ......
  Sample  9  | 0.145  .......
  Sample 10  | 0.189  .........
  Sample 11  | 0.312  ...............
  Sample 12  | 0.831  =========================================  <- ROI START
  Sample 13  | 0.894  =============================================
  Sample 14  | 0.912  ==============================================
  Sample 15  | 0.943  ================================================
  Sample 16  | 0.967  =================================================
  Sample 17  | 0.988  ==================================================
  Sample 18  | 0.991  ==================================================
  Sample 19  | 0.976  =================================================
  Sample 20  | 0.959  ================================================
  ...
  Sample 37  | 0.847  ==========================================
  Sample 38  | 0.803  =========================================  <- ROI END
  Sample 39  | 0.298  ..............
  Sample 40  | 0.134  .......
  ...

[+] Region of interest (ROI) identified: sample indices 12-38 (26 samples)
[+] Pattern consistent with 16-byte AES first-round SubBytes operation
[+] Use traces[:, 12:38] for DPA correlation in dpa.py`;
                }

                return `Usage:
  python3 analyze.py --load <traces.csv>   Load and inspect trace file
  python3 analyze.py --roi  <traces.csv>   Visualize region of interest
  python3 dpa.py --bytes <range>           Run DPA on key byte range
  python3 decrypt.py --key <hex> --input <file>  Decrypt ciphertext`;
            }

            // ── dpa.py ─────────────────────────────────────────────────────
            if (fullCmd.includes('dpa.py') || fullCmd.includes('dpa')) {
                if (!C18Config._tracesLoaded) {
                    return '[!] Load trace data first: python3 analyze.py --load vault_artifacts/traces.csv';
                }

                const byteRangeMatch = fullCmd.match(/--bytes\s+([\d\-]+)/);
                if (!byteRangeMatch) {
                    return `Usage: python3 dpa.py --bytes <range>
Examples:
  python3 dpa.py --bytes 0-7    (recover first 8 key bytes)
  python3 dpa.py --bytes 8-15   (recover last 8 key bytes)
  python3 dpa.py --bytes 0-15   (recover all 16 key bytes)`;
                }

                const rangeStr = byteRangeMatch[1];
                const rangeParts = rangeStr.split('-').map(Number);
                const startByte = rangeParts[0];
                const endByte   = rangeParts.length > 1 ? rangeParts[1] : startByte;

                // Validate range
                if (startByte > 15 || endByte > 15 || startByte > endByte) {
                    return `[!] Invalid byte range: ${rangeStr}. Key bytes are 0-15.`;
                }

                let output = `[*] Running DPA on key bytes ${startByte}-${endByte}
[*] Power model: Hamming weight of AES S-box output
[*] Known plaintext: 436974616465 6c2043 6f6d6d2048 6561
[*] Region of interest: samples 12-38
[*] Traces: 256
[*] Computing 256 hypotheses per byte...\n\n`;

                const relevantResults = C18Config._dpaResults.filter(
                    r => r.byte_idx >= startByte && r.byte_idx <= endByte
                );

                relevantResults.forEach(r => {
                    const hex = r.correct.toString(16).padStart(2, '0');
                    const bar = '='.repeat(Math.round(r.top_corr * 40));
                    output += `  Byte ${String(r.byte_idx).padStart(2, ' ')} | Best: 0x${hex} | Corr: ${r.top_corr.toFixed(4)} | ${bar}\n`;
                });

                // Determine which key portion was recovered
                const partA_complete = endByte >= 7 && startByte <= 0;
                const partB_complete = endByte >= 15 && startByte <= 8;
                const all_complete   = startByte <= 0 && endByte >= 15;

                output += '\n[+] DPA analysis complete.\n';

                if (partA_complete || all_complete) {
                    C18Config._partialKeyRecovered = true;
                    const keyPartA = C18Config._masterKey.slice(0, 16);
                    output += `\n[+] Partial key recovered (bytes 0-7): ${keyPartA}`;
                    output += '\n[+] This is Flag 1 (user.txt). Submit it in the format: flag{' + keyPartA + '}';
                    output += '\n    Full key recovery: run dpa.py --bytes 8-15 to complete the key.\n';
                    output += '\n{{FLAG:user}}';
                }

                if (partB_complete || all_complete) {
                    C18Config._fullKeyRecovered = true;
                    const fullKey = C18Config._masterKey;
                    output += `\n[+] Full AES-128 key recovered: ${fullKey}`;
                    output += '\n[+] Key reconstruction complete — all 16 bytes recovered.';
                    output += '\n[+] Use this key to decrypt vault_artifacts/encrypted_comm.bin';
                    output += '\n    Command: python3 decrypt.py --key ' + fullKey + ' --input vault_artifacts/encrypted_comm.bin\n';
                }

                return output;
            }

            // ── decrypt.py ─────────────────────────────────────────────────
            if (fullCmd.includes('decrypt.py') || fullCmd.includes('decrypt')) {
                if (!C18Config._fullKeyRecovered) {
                    return '[!] You must first recover the full AES key via DPA before decrypting.\n    Run: python3 dpa.py --bytes 0-15';
                }

                const keyMatch  = fullCmd.match(/--key\s+([0-9a-fA-F]{32})/);
                const fileMatch = fullCmd.match(/--input\s+(\S+)/);

                if (!keyMatch) {
                    return '[!] Missing or malformed --key argument.\n    Key must be exactly 32 hex characters (16 bytes).\n    Usage: python3 decrypt.py --key <32_hex_chars> --input encrypted_comm.bin';
                }

                const providedKey = keyMatch[1].toLowerCase();
                const fileArg     = fileMatch ? fileMatch[1] : '';

                if (!fileArg || (!fileArg.includes('encrypted_comm') && !fileArg.includes('.bin'))) {
                    return '[!] Specify the ciphertext file with --input encrypted_comm.bin\n    Usage: python3 decrypt.py --key <hex> --input vault_artifacts/encrypted_comm.bin';
                }

                // Check key correctness
                if (providedKey !== C18Config._masterKey) {
                    C18Config._decryptionAttempts++;
                    const hint = C18Config._decryptionAttempts >= 2
                        ? '\n[*] Hint: Re-run DPA with --bytes 0-15 to confirm all key bytes are correct.'
                        : '';
                    return `[*] Key:   ${providedKey}
[*] Mode:  AES-128 ECB
[*] Input: ${fileArg}
[!] Decryption failed: padding error or authentication mismatch.
[!] The provided key does not produce valid PKCS7-padded plaintext.
[!] Verify all 16 key bytes were correctly recovered from DPA.${hint}`;
                }

                // Correct key — decrypt and reveal
                if (engine) engine.advancePhase && engine.advancePhase('decryption');
                return `[*] Key:   ${providedKey}
[*] Mode:  AES-128 ECB
[*] Input: ${fileArg}
[*] Decrypting 512-byte ciphertext (32 blocks x 16 bytes)...
[+] PKCS7 padding verified.
[+] Decryption successful.

==================== DECRYPTED PLAINTEXT ====================

${C18Config._decryptedMessage}

=============================================================`;
            }

            // ── pip / pip3 ─────────────────────────────────────────────────
            if (fullCmd.includes('pip') || fullCmd.includes('install')) {
                return `[*] All required packages are pre-installed:
  numpy==1.26.4 — already installed
  scipy==1.12.0 — already installed
  pycryptodome==3.20.0 — already installed
  matplotlib==3.8.3 — already installed`;
            }

            // ── generic python3 ────────────────────────────────────────────
            return `Python 3.11.6 (main, Mar  8 2024, 10:22:44)
[GCC 13.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> `;
        },

        // python alias
        'python': function(args, term, engine) {
            return C18Config.commands.python3(args, term, engine);
        },

        // pip3 / pip
        'pip3': function(args) {
            return `Requirement already satisfied: numpy in /usr/lib/python3/dist-packages
Requirement already satisfied: scipy in /usr/lib/python3/dist-packages
Requirement already satisfied: pycryptodome in /usr/lib/python3/dist-packages
Requirement already satisfied: matplotlib in /usr/lib/python3/dist-packages`;
        },
        'pip': function(args) {
            return C18Config.commands.pip3(args);
        },

        // ── nmap ────────────────────────────────────────────────────────────
        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.50.0.1';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === '10.50.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for vault-mgmt.internal (10.50.0.1)
Host is up (0.004s latency).
Not shown: 998 closed tcp ports

PORT    STATE SERVICE   VERSION
80/tcp  open  http      nginx 1.24.0
443/tcp open  ssl/https nginx 1.24.0

SSL Certificate:
Subject: CN=vault-mgmt.internal
Validity: 2025-11-01 to 2026-11-01

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.71 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.08 seconds`;
        },

        // ── file ────────────────────────────────────────────────────────────
        'file': function(args) {
            const target = (args[0] || '').replace(/.*\//, '');
            if (target === 'traces.csv') {
                return 'traces.csv: CSV text file, UTF-8, 256 rows x 100 columns, 284 KB';
            }
            if (target === 'encrypted_comm.bin') {
                return 'encrypted_comm.bin: data (AES-128 ECB ciphertext, 512 bytes)';
            }
            if (target === 'known_plaintext.txt') {
                return 'known_plaintext.txt: ASCII text';
            }
            if (target === 'algorithm_spec.txt') {
                return 'algorithm_spec.txt: ASCII text';
            }
            if (target.endsWith('.py')) {
                return `${target}: Python script, ASCII text executable`;
            }
            return `${target || '(nothing)'}: cannot open (No such file)`;
        },

        // ── xxd / hexdump ───────────────────────────────────────────────────
        'xxd': function(args) {
            const target = (args.find(a => !a.startsWith('-')) || '').replace(/.*\//, '');
            if (target === 'encrypted_comm.bin') {
                return `00000000: 9f4a 3c81 d7e2 b053 a614 fc29 7d8e c401  .J<....S...)}..\n00000010: 3b72 8da5 e9c6 1f40 5271 0b9e 2ca7 d843  ;r.....@Rq..,..C\n00000020: 8f1d 46c2 7a3e b905 e428 6c0f 9d53 a271  ..F.z>...(l..S.q\n00000030: c534 0e7b 9af1 28d6 4b82 3c17 e950 6b0a  .4.{..(.K.<..Pk.\n...\n[512 bytes total — AES-128 ECB ciphertext]`;
            }
            if (target === 'traces.csv') {
                return `00000000: 2353 4543 2d45 4e43 2d55 4e49 542d 3031  #SEC-ENC-UNIT-01\n00000010: 2050 6f77 6572 2054 7261 6365 730a 3023  Power Traces.0#\n...\n[284 KB — 256 traces x 100 sample columns]`;
            }
            const f = target || args[0] || '';
            return `${f}: No such file or directory`;
        },

        'hexdump': function(args, term, engine) {
            return C18Config.commands.xxd(args, term, engine);
        },

        // ── wc ──────────────────────────────────────────────────────────────
        'wc': function(args) {
            const target = (args.find(a => !a.startsWith('-')) || '').replace(/.*\//, '');
            if (target === 'traces.csv') return '    258     291040   290816 traces.csv';
            if (target === 'encrypted_comm.bin') return '      0        512      512 encrypted_comm.bin';
            if (target === 'known_plaintext.txt') return '     12      78       487 known_plaintext.txt';
            return `wc: ${target}: No such file or directory`;
        },

        // ── head ─────────────────────────────────────────────────────────────
        'head': function(args) {
            const target = (args.find(a => !a.startsWith('-')) || '').replace(/.*\//, '');
            if (target === 'traces.csv') {
                return `# SEC-ENC-UNIT-01 Power Traces
# Format: 256 rows (traces) x 100 columns (sample points)
# Target operation: AES-128 first-round SubBytes
# Sample rate: 100 MHz | ADC: 12-bit | SNR: 14.3 dB
# ROI hint: High-variance region at sample indices 12-38
# Known plaintext: 43 69 74 61 64 65 6c 20 43 6f 6d 6d 20 48 65 61
0.412,0.398,0.521,0.843,1.204,1.876,2.341,2.198,1.754,1.290,0.987,0.832,2.891,3.102,3.445,3.210,...
0.387,0.401,0.498,0.812,1.178,1.842,2.298,2.154,1.712,1.245,0.954,0.811,2.843,3.071,3.389,3.178,...
0.432,0.419,0.543,0.867,1.231,1.903,2.387,2.243,1.801,1.334,1.009,0.856,2.932,3.145,3.489,3.251,...`;
            }
            if (target === 'known_plaintext.txt') {
                return `Known Plaintext Block (All 256 Traces)
=======================================
Hex:   43 69 74 61 64 65 6c 20 43 6f 6d 6d 20 48 65 61
ASCII: Citadel Comm Hea`;
            }
            if (target === 'algorithm_spec.txt') {
                return `SEC-ENC-UNIT-01 Algorithm Specification
=============================================
Algorithm  : AES (Advanced Encryption Standard)
Key Size   : 128 bits (16 bytes)
Mode       : ECB (Electronic Codebook)
Padding    : PKCS7`;
            }
            return `head: ${target}: No such file or directory`;
        },

        // ── strings ─────────────────────────────────────────────────────────
        'strings': function(args) {
            const target = (args.find(a => !a.startsWith('-')) || '').replace(/.*\//, '');
            if (target === 'encrypted_comm.bin') {
                return `[*] Running strings on encrypted_comm.bin...
[*] No printable ASCII strings found (encrypted data has no structure).
[!] This is expected for properly encrypted ciphertext.
[*] Decrypt the file to read its contents.`;
            }
            return `strings: ${target || '(no file)'}: No such file or directory`;
        },

        // ── openssl ─────────────────────────────────────────────────────────
        'openssl': function(args) {
            const fullCmd = args.join(' ');

            // openssl enc -d -aes-128-ecb -K <key> -in encrypted_comm.bin -nopad
            if (fullCmd.includes('enc') && fullCmd.includes('-d')) {
                if (!C18Config._fullKeyRecovered) {
                    return '[!] You must recover the full AES key first via DPA.\n    Run: python3 dpa.py --bytes 0-15';
                }

                const keyMatch = fullCmd.match(/-K\s+([0-9a-fA-F]{32})/i);
                if (!keyMatch) {
                    return `[!] Missing or invalid -K <key> argument.
Usage: openssl enc -d -aes-128-ecb -K <32_hex_key> -in encrypted_comm.bin -nopad
Note: For AES-128 ECB, use -K (key in hex) and -nopad or -nosalt.`;
                }

                const providedKey = keyMatch[1].toLowerCase();
                if (providedKey !== C18Config._masterKey) {
                    return `bad decrypt
140245893823168:error:0606506D:digital envelope routines:EVP_DecryptFinal_ex:wrong final block length
[!] Key incorrect — decryption produced invalid padding.`;
                }

                return `[*] Decrypting with AES-128 ECB...
[+] Decryption successful.

${C18Config._decryptedMessage}`;
            }

            // openssl version / help
            if (fullCmd.includes('version') || args.length === 0) {
                return 'OpenSSL 3.1.4 24 Oct 2023 (Library: OpenSSL 3.1.4 24 Oct 2023)';
            }

            if (fullCmd.includes('rand')) {
                const lenMatch = fullCmd.match(/rand\s+-hex\s+(\d+)/);
                if (lenMatch) {
                    const len = parseInt(lenMatch[1]);
                    const fake = Array.from({length: len}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
                    return fake;
                }
            }

            return `OpenSSL commands:
  openssl enc -d -aes-128-ecb -K <hex_key> -in <file> -nopad
  openssl version`;
        },

        // ── cat (context-aware override) ────────────────────────────────────
        'cat': function(args) {
            // Only override for analyst context filesystem paths
            const path = args[0] || '';
            const fname = path.replace(/.*\//, '');

            if (fname === 'notes.txt' || path.includes('notes.txt')) {
                return '=== MISSION BRIEFING: OPERATION IRON WHISPER ===\nTarget: SEC-ENC-UNIT-01 (Citadel Vault — Crypto Co-Processor)\nObjective: Side-channel key recovery + ciphertext decryption\n\nAttack chain:\n1. Load traces.csv — inspect 256-trace power dataset\n2. Identify AES S-box region of interest (ROI) in trace\n3. Run DPA — recover first 8 key bytes (user.txt)\n4. Complete DPA — recover all 16 AES key bytes\n5. Decrypt encrypted_comm.bin with recovered key (root.txt)\n\nArtifacts staged in: /home/analyst/vault_artifacts/\nTools staged in: /home/analyst/tools/\n\nThe device whispers its secrets in voltage. Listen carefully.';
            }
            if (fname === 'algorithm_spec.txt') {
                return 'SEC-ENC-UNIT-01 Algorithm Specification\n=============================================\nAlgorithm  : AES (Advanced Encryption Standard)\nKey Size   : 128 bits (16 bytes)\nMode       : ECB (Electronic Codebook)\nPadding    : PKCS7\nInput      : 16-byte plaintext blocks\nOutput     : 16-byte ciphertext blocks\n\nSide-Channel Leakage Model (for DPA):\n  Target   : First-round SubBytes operation\n  Function : power ~ HW(SBOX[plaintext[i] XOR key[i]])\n  where HW  = Hamming weight (popcount)\n  and SBOX  = AES S-box lookup table\n\nNote: ECB mode — no IV required. Fixed 128-bit key in OTP fuse bank.';
            }
            if (fname === 'known_plaintext.txt') {
                return 'Known Plaintext Block (All 256 Traces)\n=======================================\nHex:   43 69 74 61 64 65 6c 20 43 6f 6d 6d 20 48 65 61\nASCII: Citadel Comm Hea\n\nAll 256 traces correspond to AES-128 encryption of this\nexact 16-byte block under the device master key.\nUse this as input for your DPA hypotheses.';
            }
            if (fname === 'encrypted_comm.bin') {
                return '[Binary file — cannot display as text]\nUse: xxd vault_artifacts/encrypted_comm.bin  to view hex\nOr:  python3 tools/decrypt.py --key <hex_key> --input vault_artifacts/encrypted_comm.bin';
            }
            if (fname === 'analyze.py' || fname === 'dpa.py' || fname === 'decrypt.py') {
                // Return file contents from filesystem
                var toolPath = '/home/analyst/tools/' + fname;
                try {
                    var node = C18Config._resolveFs(toolPath);
                    if (node && node.content) return node.content;
                } catch(e) {}
                return `cat: ${path}: No such file or directory`;
            }
            if (fname === 'traces.csv') {
                return '# SEC-ENC-UNIT-01 Power Traces\n# Format: 256 rows (traces) x 100 columns (sample points)\n# Target operation: AES-128 first-round SubBytes\n# Sample rate: 100 MHz | ADC: 12-bit | SNR: 14.3 dB\n# ROI hint: High-variance region at sample indices 12-38\n# Known plaintext: 43 69 74 61 64 65 6c 20 43 6f 6d 6d 20 48 65 61\n0.412,0.398,0.521,0.843,1.204,1.876,2.341,2.198,1.754,1.290,0.987,0.832,2.891,3.102,3.445,3.210,...\n0.387,0.401,0.498,0.812,1.178,1.842,2.298,2.154,1.712,1.245,0.954,0.811,2.843,3.071,3.389,3.178,...\n[256 rows x 100 columns — use python3 analyze.py --load traces.csv for full inspection]';
            }
            return null;  // fall through to built-in for filesystem traversal
        },

        // ── ls (context-aware) ───────────────────────────────────────────────
        'ls': function(args) {
            const path = args.find(a => !a.startsWith('-')) || '.';
            if (path === '.' || path === '~' || path === '/home/analyst') {
                return 'notes.txt  tools  vault_artifacts';
            }
            if (path.includes('vault_artifacts')) {
                return 'algorithm_spec.txt  encrypted_comm.bin  known_plaintext.txt  traces.csv';
            }
            if (path.includes('tools')) {
                return 'analyze.py  decrypt.py  dpa.py';
            }
            return null;  // fall through to built-in
        },

        // ── whoami / id ──────────────────────────────────────────────────────
        'whoami': function() {
            return 'analyst';
        },

        'id': function() {
            return 'uid=1001(analyst) gid=1001(analyst) groups=1001(analyst),4(adm),27(sudo)';
        },

        'hostname': function() {
            return 'kali-dpa';
        },

        'pwd': function() {
            return '/home/analyst';
        },

        // ── uname ────────────────────────────────────────────────────────────
        'uname': function(args) {
            const full = args.includes('-a') || args.includes('-all');
            if (full) {
                return 'Linux kali-dpa 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.1.0-kali9 (2026-01-08) x86_64 GNU/Linux';
            }
            return 'Linux';
        },

        // ── ping ─────────────────────────────────────────────────────────────
        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.50.0.1') {
                return `PING 10.50.0.1 (10.50.0.1) 56(84) bytes of data.
64 bytes from 10.50.0.1: icmp_seq=1 ttl=64 time=3.12 ms
64 bytes from 10.50.0.1: icmp_seq=2 ttl=64 time=2.98 ms
64 bytes from 10.50.0.1: icmp_seq=3 ttl=64 time=3.08 ms

--- 10.50.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 2.98/3.06/3.12/0.059 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        // ── wget / curl (artifact downloads) ────────────────────────────────
        'wget': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (url.includes('10.50.0.1')) {
                return `--2026-03-20 07:14:33--  ${url}
Connecting to 10.50.0.1:80... connected.
HTTP request sent, awaiting response... 200 OK
Files are already staged locally in /home/analyst/vault_artifacts/
No download necessary.`;
            }
            return `wget: unable to resolve host "${url.split('/')[2] || url}"`;
        },

        'curl': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            if (url.includes('10.50.0.1')) {
                if (url.includes('/algorithm_spec.txt')) {
                    return C18Config.commands.cat(['algorithm_spec.txt']);
                }
                if (url.includes('/known_plaintext.txt')) {
                    return C18Config.commands.cat(['known_plaintext.txt']);
                }
                return `<!DOCTYPE html>
<html>
<head><title>SEC-ENC-UNIT-01 — Vault Device Interface</title></head>
<body>
<h1>SEC-ENC-UNIT-01</h1>
<p>Cryptographic Co-Processor — Vault Node Alpha</p>
<p><a href="/trace-export">/trace-export</a> — Maintenance interface</p>
<p>EM SHIELDING: NOT FITTED</p>
</body>
</html>`;
            }
            return `curl: (7) Failed to connect to ${url.split('/')[2] || 'host'}: Connection refused`;
        },

        // ── jupyter ─────────────────────────────────────────────────────────
        'jupyter': function(args) {
            return `[I 2026-03-20 07:14:33.201 ServerApp] jupyter_lsp | extension was successfully linked.
[I 2026-03-20 07:14:33.512 ServerApp] Serving notebooks from local directory: /home/analyst
[I 2026-03-20 07:14:33.513 ServerApp] Jupyter Server 2.12.5 is running at:
[I 2026-03-20 07:14:33.513 ServerApp] http://localhost:8888/tree?token=abc123def456
[*] Note: Use the terminal-based Python tools for this lab environment.
[*] jupyter is available but browser rendering is not supported here.
    Use: python3 tools/analyze.py and python3 tools/dpa.py instead.`;
        },

        // ── scipy / numpy imports ─────────────────────────────────────────────
        'import': function(args) {
            return `[*] This is a terminal, not a Python REPL.
    To run Python: python3 tools/analyze.py --load vault_artifacts/traces.csv`;
        },

        // ── ipython ──────────────────────────────────────────────────────────
        'ipython': function(args) {
            return `Python 3.11.6 (main, Mar  8 2024)
[GCC 13.2.0] on linux

In [1]: `;
        },

        // ── exit ─────────────────────────────────────────────────────────────
        'exit': function(args, term) {
            C18Config._switchContext('analyst', term);
            return 'logout';
        },

        // ── cd (silent accept) ───────────────────────────────────────────────
        'cd': function(args) {
            return '';
        },

        // ── ssh (device management — read-only access denied) ────────────────
        'ssh': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('10.50.0.1') || fullCmd.includes('vault')) {
                return `ssh: connect to host 10.50.0.1 port 22: Connection refused
[!] SEC-ENC-UNIT-01 does not expose SSH. The device is air-gapped.
[!] All key material must be extracted via side-channel analysis.`;
            }
            return `Usage: ssh [user@]hostname\n[!] No SSH targets are accessible in this environment.`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM RESOLVER (helper for cat/ls fallback)
    // ═══════════════════════════════════════════════════════

    _resolveFs(path) {
        const parts = path.split('/').filter(Boolean);
        let node = C18Config.filesystem['/'];
        for (const part of parts) {
            if (!node || !node.children || !node.children[part]) return null;
            node = node.children[part];
        }
        return node;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d1f5a; background:#1a0a2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2d1048; color:#ccc;">${cell}</td>`;
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
