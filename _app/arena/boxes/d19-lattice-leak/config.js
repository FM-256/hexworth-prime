/* ============================================================
   CTF ARENA — Box D19: The Lattice Leak
   Expert Campaign | PQC Side-Channel Attack, Key Extraction, Decryption
   Config: filesystem, simulated artifacts, analysis tools, flags, hints, lore
   ============================================================ */

const D19Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Lattice Leak',
    subtitle: 'Post-Quantum Exploitation — Side-Channel Attack on PQC-ENC-UNIT-01',
    difficulty: 'Expert',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_d19',
    registryId: 'd19-lattice-leak',
    trackerKey: 'ctf_d19',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-stage PQC attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Target Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Enumerate QUANTUM-SAFEGUARD-01. Identify the PQC-ENC-UNIT-01 hardware module and download provided artifacts.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1592'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Implementation Analysis',
            icon: '\uD83D\uDCCA',
            description: 'Audit pqc_implementation.c and pqc_algorithm_spec.txt. Identify the non-constant-time vulnerability in the polynomial arithmetic.',
            requiredFlags: [],
            mitre: ['T1587.001', 'T1588.005'],
            unlocks: ['sidechannel'],
            locked: true
        },
        {
            id: 'sidechannel',
            name: 'Side-Channel Attack',
            icon: '\uD83D\uDCC8',
            description: 'Analyze simulated_side_channel_data.csv. Develop and run the timing correlation attack to extract partial key material.',
            requiredFlags: ['flag1'],
            mitre: ['T1600.001', 'T1552.004'],
            unlocks: ['keyrecon'],
            locked: true
        },
        {
            id: 'keyrecon',
            name: 'Key Reconstruction',
            icon: '\uD83D\uDD11',
            description: 'Use recovered partial key coefficients to reconstruct the full private key polynomial. Validate against the spec.',
            requiredFlags: ['flag2'],
            mitre: ['T1600', 'T1552'],
            unlocks: ['decryption'],
            locked: true
        },
        {
            id: 'decryption',
            name: 'Ciphertext Decryption',
            icon: '\uD83D\uDEE1\uFE0F',
            description: 'Apply the reconstructed private key to decrypt pqc_encrypted_comm.bin. Extract the Post-Quantum Master Key.',
            requiredFlags: ['flag3'],
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
                title: 'Enumerate the target system',
                tip: 'Run: nmap 10.0.0.77 — Identify open ports on QUANTUM-SAFEGUARD-01 and find the artifact download service.',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Download and read the implementation artifacts',
                tip: 'Use wget or curl to download pqc_implementation.c and pqc_algorithm_spec.txt. Read them with cat or less.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:cat' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:wget' } },
                        { event: 'command', match: { cmd: 'contains:less' } }
                    ]
                }
            },
            {
                title: 'Identify the timing vulnerability and submit Flag 1',
                tip: 'Look at poly_mul_decrypt() in pqc_implementation.c. The loop exits early based on coefficient value — this is the non-constant-time leak. Submit Flag 1.',
                trigger: { event: 'flag_correct', match: { flagId: 'flag1' } }
            },
            {
                title: 'Run the timing attack and recover partial key coefficients',
                tip: 'Execute python3 timing_attack.py to correlate the CSV traces against hypothetical key values. The output is a partial hex key.',
                trigger: { event: 'flag_correct', match: { flagId: 'flag2' } }
            },
            {
                title: 'Decrypt pqc_encrypted_comm.bin and retrieve the Master Key',
                tip: 'Run python3 pqc_decrypt.py with the recovered private key. The decrypted payload contains the Post-Quantum Master Key (Flag 3).',
                trigger: { event: 'flag_correct', match: { flagId: 'flag3' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'flag1', objective: '1.3', description: 'Given a scenario, analyze indicators of malicious activity — Identifying implementation flaws in cryptographic systems', skill: 'Cryptographic Side-Channel Identification' },
            { flagId: 'flag2', objective: '3.3', description: 'Given a scenario, implement and maintain identity and access management — Cryptographic key management weaknesses', skill: 'Timing Attack Execution & Partial Key Recovery' },
            { flagId: 'flag3', objective: '2.3', description: 'Given a scenario, analyze data and reports to identify threats — Post-quantum cryptography exploitation chain', skill: 'Full PQC Private Key Reconstruction & Decryption' },
            { flagId: 'flag3', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with cryptographic attacks', skill: 'End-to-End PQC Attack Chain Completion' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.0.0.77 (QUANTUM-SAFEGUARD-01 — Quantum Safeguard Initiative)\n\nObjective: Exploit PQC-ENC-UNIT-01 timing side-channel. Extract private key. Decrypt pqc_encrypted_comm.bin.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (attack session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',     // 'attacker' | 'ssh-qs01' | 'analysis'
    _artifactsDownloaded: false,
    _sshAuthenticated: false,
    _timingAttackRun: false,
    _partialKeyRecovered: false,
    _fullKeyReconstructed: false,
    _decryptionComplete: false,

    _switchContext(ctx, term) {
        D19Config._context = ctx;
        // Update terminal prompt to reflect current session context
        if (term && term.config) {
            var prompt = D19Config._getPrompt();
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
        switch (D19Config._context) {
            case 'ssh-qs01': return 'qsadmin@QUANTUM-SAFEGUARD-01:~$ ';
            default: return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'flag1', points: 150 },   // Side-channel identification
        { id: 'flag2', points: 250 },   // Partial private key extraction
        { id: 'flag3', points: 400 }    // Post-Quantum Master Key (root)
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2500,
        maxScore: 800,
        hintPenalty: true,
        wrongFlagPenalty: -50,
        speedBonus: { threshold: 3600000, points: 200 },  // 60 minutes
        timeBonusThreshold: 7200  // 120 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: nmap -sV 10.0.0.77 — You will find an SFTP artifact server on port 2222. Fetch the artifacts with: sftp -P 2222 qsadmin@10.0.0.77 — then get all files from /artifacts/.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Read pqc_implementation.c carefully. Focus on the poly_mul_decrypt() function. The inner loop has an early-exit branch: if (coeff == 0) continue; — This means the loop runs faster for zero-value coefficients. That execution time difference leaks the Hamming weight of private key coefficients. Flag 1 is the description of this flaw.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Run: python3 timing_attack.py — The script correlates timing traces in simulated_side_channel_data.csv against hypothetical coefficient values using Pearson correlation. The highest-correlation value per column index is the recovered coefficient. Flag 2 is the first 32 bytes of the recovered key polynomial in hex.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Run: python3 pqc_decrypt.py — It will load recovered_privkey.hex and apply the inverse NTT decapsulation defined in pqc_algorithm_spec.txt to decrypt pqc_encrypted_comm.bin. The plaintext at the end of the output is the Post-Quantum Master Key (Flag 3).',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Quantum Safeguard Initiative has deployed PQC-COMMS-01, a next-generation secure communication backbone using a lattice-based Key Encapsulation Mechanism (KEM) derived from the Kyber specification. The algorithm\'s mathematics are sound — but the C implementation in PQC-ENC-UNIT-01 is not. Your mission, Peerless: recover the private key through a classical side-channel attack and decrypt an intercepted communication containing the Post-Quantum Master Key.',
        scenario: 'PQC-ENC-UNIT-01 is a custom ASIC performing Kyber-style polynomial arithmetic for key decapsulation. The implementation was written under deadline pressure by a developer who understood lattice math but missed a critical security principle: constant-time execution. The polynomial multiplication during decryption branches on zero-value coefficients to "optimize" performance — skipping multiplications that contribute nothing. This optimization is mathematically correct but operationally catastrophic. Every decryption operation leaks timing data that correlates with the Hamming weight of the private key coefficients, one polynomial coefficient at a time.',
        outro: 'PQC-ENC-UNIT-01\'s private key has been fully reconstructed via classical timing analysis. The Post-Quantum Master Key is in your possession. The Quantum Safeguard Initiative\'s entire communication infrastructure — believed invulnerable to quantum threats — has been broken by a non-constant-time branch in a C for-loop. The lesson: mathematical security does not guarantee implementation security.',
        ecer: {
            executive: 'Leadership mandated PQC deployment on an accelerated timeline to meet a compliance deadline; no budget allocated for side-channel hardening or constant-time implementation review',
            culture: 'Two-person cryptography team handling both algorithm selection and low-level C implementation; no peer review process for security-critical code paths',
            employee: 'Developer introduced a performance optimization (early-exit on zero coefficients) in poly_mul_decrypt() without understanding timing attack implications; no constant-time coding guidelines enforced',
            regulatory: 'NIST PQC standards specify mathematical security properties only; no mandatory implementation security review required for hardware modules; timing attack resistance not tested in acceptance criteria'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Quantum Safeguard Initiative Status Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.0.77/',

        pages: {
            '/': {
                title: 'Quantum Safeguard Initiative — Secure Comms Status',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2d1f4e;">
                        <h1 style="color:#c4b5fd; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Quantum Safeguard Initiative</h1>
                        <div style="color:#8b5cf6; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">PQC-COMMS-01 STATUS PORTAL</div>
                        <div style="color:#6b7280; font-size:0.75rem; margin-top:6px;">Post-Quantum Communication Infrastructure — CLASSIFIED SYSTEM</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#1a0a2e; border:1px solid #3b1f6e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#a78bfa;">ONLINE</div>
                            <div style="color:#6b7280; font-size:0.7rem;">PQC-ENC-UNIT-01</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #3b1f6e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#a78bfa;">Kyber-1024</div>
                            <div style="color:#6b7280; font-size:0.7rem;">Algorithm Suite</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #3b1f6e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#a78bfa;">4,096</div>
                            <div style="color:#6b7280; font-size:0.7rem;">Ops/hr (KEM)</div>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:14px; background:rgba(139,92,246,0.06); border:1px solid rgba(139,92,246,0.2); border-radius:4px; font-size:0.75rem; color:#9ca3af;">
                        <strong style="color:#8b5cf6;">NOTICE:</strong> Artifact distribution server available to authorized researchers at
                        <code style="background:#0f0a1e; padding:1px 5px; border-radius:2px; color:#a78bfa;">sftp://10.0.0.77:2222/artifacts/</code>
                        — Contact QSI security team for credentials.
                    </div>

                    <div style="max-width:620px; margin:16px auto 0; padding:10px 14px; background:#0f0a1e; border:1px solid #2d1f4e; border-radius:4px; font-size:0.72rem; color:#6b7280; font-family:monospace;">
                        Last audit: 2026-03-18 04:12:07 UTC | Status: NOMINAL | Active sessions: 3
                    </div>
                `,
                formHandler: null
            },
            '/artifacts/': {
                title: 'Artifact Index — QSI Research Distribution',
                html: `
                    <div style="text-align:center; margin-bottom:20px;">
                        <h2 style="color:#c4b5fd; font-size:1.2rem;">QSI Artifact Distribution</h2>
                        <div style="color:#6b7280; font-size:0.75rem;">Authorized access only — credential required for SFTP download</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; font-family:monospace; font-size:0.8rem;">
                        <div style="background:#0f0a1e; border:1px solid #2d1f4e; border-radius:6px; padding:16px;">
                            <div style="color:#a78bfa; margin-bottom:10px;">Index of /artifacts/</div>
                            <div style="color:#e5e7eb; margin-bottom:4px;">drwxr-xr-x  pqc_algorithm_spec.txt     <span style="color:#6b7280;">14.2 KB</span></div>
                            <div style="color:#e5e7eb; margin-bottom:4px;">drwxr-xr-x  pqc_implementation.c       <span style="color:#6b7280;">8.7 KB</span></div>
                            <div style="color:#e5e7eb; margin-bottom:4px;">drwxr-xr-x  simulated_side_channel_data.csv  <span style="color:#6b7280;">2.1 MB</span></div>
                            <div style="color:#e5e7eb; margin-bottom:4px;">drwxr-xr-x  pqc_encrypted_comm.bin     <span style="color:#6b7280;">512 B</span></div>
                            <div style="color:#e5e7eb; margin-bottom:4px;">drwxr-xr-x  README.txt                 <span style="color:#6b7280;">1.1 KB</span></div>
                        </div>
                        <div style="margin-top:12px; color:#6b7280; font-size:0.72rem;">Use sftp -P 2222 qsadmin@10.0.0.77 to download via terminal.</div>
                    </div>
                `,
                formHandler: null
            },
            '/status': {
                title: 'PQC-ENC-UNIT-01 — Live Telemetry',
                html: `
                    <div style="text-align:center; margin-bottom:20px;">
                        <h2 style="color:#c4b5fd; font-size:1.2rem;">PQC-ENC-UNIT-01 Live Telemetry</h2>
                    </div>
                    <div style="max-width:600px; margin:0 auto; font-family:monospace; font-size:0.78rem; background:#0f0a1e; border:1px solid #2d1f4e; border-radius:6px; padding:16px; color:#a78bfa;">
                        Device:          PQC-ENC-UNIT-01<br>
                        Firmware:        v2.3.1-release<br>
                        Algorithm:       Kyber-1024 (NIST PQC Round 3)<br>
                        Key size:        3168 bytes (public) / 2400 bytes (private)<br>
                        Polynomial N:    256<br>
                        Modulus q:       3329<br>
                        Decap ops today: 14,227<br>
                        Avg decap time:  0.000312s<br>
                        Timing jitter:   <span style="color:#f59e0b;">HIGH (0.000041s std dev) — ALERT</span><br>
                        Last rekey:      2026-03-10 00:00:00 UTC<br>
                        Status:          <span style="color:#34d399;">OPERATIONAL</span>
                    </div>
                    <div style="max-width:600px; margin:12px auto; padding:10px 14px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:4px; font-size:0.73rem; color:#d97706;">
                        <strong>Timing Alert:</strong> Decapsulation jitter exceeds baseline threshold. Engineering review scheduled for 2026-03-25. No operational impact assessed.
                    </div>
                `,
                formHandler: null
            },
            '/admin/': {
                title: 'Forbidden',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#8b5cf6; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#6b7280;">You don't have permission to access this resource.</p>
                    <p style="color:#4b5563; font-size:0.75rem;">nginx/1.24.0 (Ubuntu) Server at 10.0.0.77 Port 80</p>
                </div>`,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — attacker machine (kali)
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
                                    content: '=== MISSION BRIEFING: OPERATION LATTICE LEAK ===\nTarget: 10.0.0.77 (QUANTUM-SAFEGUARD-01 — QSI)\nObjective: PQC side-channel attack + key recovery + decryption\n\nAttack chain:\n1. Enumerate QUANTUM-SAFEGUARD-01 — identify services and artifact server\n2. Download research artifacts (pqc_implementation.c, spec, traces, ciphertext)\n3. Audit pqc_implementation.c — identify timing vulnerability\n4. Develop timing correlation attack against simulated_side_channel_data.csv\n5. Recover partial PQC private key (Flag 2)\n6. Reconstruct full private key polynomial\n7. Decrypt pqc_encrypted_comm.bin — extract Post-Quantum Master Key (Flag 3)\n\nNote: Algorithm is mathematically sound. Implementation is not.\nLook for non-constant-time operations in polynomial arithmetic.\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.0.0.77\nnmap -p- 10.0.0.77\nsftp -P 2222 qsadmin@10.0.0.77\ncurl http://10.0.0.77/\ncurl http://10.0.0.77/status'
                                },
                                'timing_attack.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# timing_attack.py — Pearson correlation timing attack on PQC-ENC-UNIT-01\n# Correlates simulated timing traces against hypothetical key coefficient values\n# Requires: numpy, pandas, scipy\n# Usage: python3 timing_attack.py\n\nimport numpy as np\nimport pandas as pd\nfrom scipy.stats import pearsonr\nimport sys\n\nQ = 3329\nN = 256\n\ndef load_traces(path):\n    df = pd.read_csv(path)\n    return df.values  # shape: (num_traces, N+1) — col 0 = timing_ns\n\ndef hamming_weight(x):\n    return bin(x).count("1")\n\ndef correlate_coefficient(traces, col_idx):\n    """Correlate timing against HW of each candidate coefficient value (0..q-1)"""\n    timing = traces[:, 0].astype(float)\n    best_corr = -1.0\n    best_val = 0\n    # Sample candidate values uniformly (0..q-1 in steps for speed)\n    for candidate in range(0, Q, 13):  # step 13 for demo speed\n        hw_vec = np.array([hamming_weight(int(traces[i, col_idx+1]) ^ candidate)\n                           for i in range(len(traces))], dtype=float)\n        if hw_vec.std() < 1e-9:\n            continue\n        corr, _ = pearsonr(timing, hw_vec)\n        if abs(corr) > abs(best_corr):\n            best_corr = corr\n            best_val = candidate\n    return best_val, best_corr\n\ndef main():\n    print("[*] Loading simulated_side_channel_data.csv...")\n    try:\n        traces = load_traces("simulated_side_channel_data.csv")\n    except FileNotFoundError:\n        print("[!] simulated_side_channel_data.csv not found. Download artifacts first.")\n        sys.exit(1)\n\n    num_traces, num_cols = traces.shape\n    print(f"[*] Loaded {num_traces} traces, {num_cols-1} coefficient columns.")\n    print("[*] Running Pearson correlation attack on first 32 coefficients...")\n\n    recovered = []\n    for i in range(32):\n        val, corr = correlate_coefficient(traces, i)\n        recovered.append(val)\n        print(f"    coeff[{i:3d}] = {val:4d}  (|r| = {abs(corr):.4f})")\n\n    hex_key = "".join(f"{v:04x}" for v in recovered)\n    print(f"\\n[+] Partial private key (first 32 coefficients):")\n    print(f"    {hex_key}")\n    print(f"\\n[+] Saving to recovered_partial.hex")\n    with open("recovered_partial.hex", "w") as f:\n        f.write(hex_key + "\\n")\n    print("[*] Run python3 key_reconstruct.py to complete full key recovery.")\n\nif __name__ == "__main__":\n    main()'
                                },
                                'key_reconstruct.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# key_reconstruct.py — Reconstruct full Kyber-style private key polynomial\n# Extends partial recovery to N=256 coefficients using lattice structure hints\n# Usage: python3 key_reconstruct.py\n\nimport numpy as np\nfrom pathlib import Path\n\nQ = 3329\nN = 256\n\nSEED = 0xd19beef  # deterministic for simulation\n\ndef extend_key(partial_hex):\n    """Deterministically reconstruct remaining coefficients from partial key.\n    In a real attack this would be iterative timing collection.\n    Here we simulate the remaining recovery using the algorithm structure.\"\"\"\n    rng = np.random.default_rng(SEED)\n    coefficients = []\n    partial = [int(partial_hex[i*4:(i+1)*4], 16) for i in range(len(partial_hex)//4)]\n    for i in range(N):\n        if i < len(partial):\n            coefficients.append(partial[i])\n        else:\n            # Recovered via successive timing queries in a real attack\n            coefficients.append(int(rng.integers(0, Q)))\n    return coefficients\n\ndef poly_to_hex(poly):\n    return "".join(f"{c:04x}" for c in poly)\n\ndef main():\n    partial_path = Path("recovered_partial.hex")\n    if not partial_path.exists():\n        print("[!] recovered_partial.hex not found. Run timing_attack.py first.")\n        return\n\n    partial_hex = partial_path.read_text().strip()\n    print("[*] Extending partial key recovery to full N=256 polynomial...")\n    full_poly = extend_key(partial_hex)\n    full_hex = poly_to_hex(full_poly)\n\n    print(f"[+] Full private key polynomial ({N} coefficients):")\n    print(f"    {full_hex[:64]}...{full_hex[-16:]}")\n    print(f"[+] Key length: {len(full_hex)} hex chars ({len(full_hex)//2} bytes)")\n    with open("recovered_privkey.hex", "w") as f:\n        f.write(full_hex + "\\n")\n    print("[+] Saved to recovered_privkey.hex")\n    print("[*] Run python3 pqc_decrypt.py to decrypt pqc_encrypted_comm.bin.")\n\nif __name__ == "__main__":\n    main()'
                                },
                                'pqc_decrypt.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# pqc_decrypt.py — Decrypt pqc_encrypted_comm.bin using recovered private key\n# Implements simplified Kyber-style decapsulation (conceptual)\n# Usage: python3 pqc_decrypt.py\n\nimport sys\nfrom pathlib import Path\n\nQ = 3329\nN = 256\n\ndef ntt_inverse(poly, q=Q):\n    """Conceptual inverse NTT (butterfly network simulation)."""\n    result = list(poly)\n    n = len(result)\n    step = 1\n    while step < n:\n        for i in range(0, n, step * 2):\n            for j in range(step):\n                u = result[i + j]\n                v = result[i + j + step]\n                result[i + j] = (u + v) % q\n                result[i + j + step] = (u - v) % q\n        step *= 2\n    inv_n = pow(n, -1, q) if n < q else 1\n    return [(x * inv_n) % q for x in result]\n\ndef poly_mul_mod(a, b, q=Q):\n    """Polynomial multiplication mod (x^N + 1, q)."""\n    n = len(a)\n    result = [0] * n\n    for i in range(n):\n        for j in range(n):\n            idx = (i + j) % n\n            sign = -1 if (i + j) >= n else 1\n            result[idx] = (result[idx] + sign * a[i] * b[j]) % q\n    return result\n\ndef decapsulate(privkey_poly, ciphertext_bytes):\n    """Simplified KEM decapsulation (conceptual Kyber-style)."""\n    # Decode ciphertext as polynomial\n    ct_poly = []\n    for i in range(0, min(len(ciphertext_bytes), N * 2), 2):\n        val = (ciphertext_bytes[i] | (ciphertext_bytes[i+1] << 8)) % Q\n        ct_poly.append(val)\n    while len(ct_poly) < N:\n        ct_poly.append(0)\n\n    # Multiply ciphertext poly by private key poly\n    product = poly_mul_mod(privkey_poly[:N], ct_poly[:N])\n\n    # Apply inverse NTT\n    decoded = ntt_inverse(product)\n\n    # Extract message bytes by rounding coefficients to nearest 0 or q/2\n    message_bits = []\n    threshold = Q // 4\n    for coeff in decoded[:128]:\n        centered = coeff if coeff < Q // 2 else coeff - Q\n        message_bits.append(1 if abs(centered) > threshold else 0)\n\n    # Convert bits to bytes\n    message_bytes = bytearray()\n    for i in range(0, len(message_bits) - 7, 8):\n        byte = 0\n        for b in range(8):\n            byte |= (message_bits[i + b] << b)\n        message_bytes.append(byte)\n\n    return message_bytes\n\ndef main():\n    privkey_path = Path("recovered_privkey.hex")\n    ct_path = Path("pqc_encrypted_comm.bin")\n\n    if not privkey_path.exists():\n        print("[!] recovered_privkey.hex not found. Run key_reconstruct.py first.")\n        sys.exit(1)\n    if not ct_path.exists():\n        print("[!] pqc_encrypted_comm.bin not found. Download artifacts first.")\n        sys.exit(1)\n\n    print("[*] Loading recovered private key...")\n    privkey_hex = privkey_path.read_text().strip()\n    privkey_poly = [int(privkey_hex[i*4:(i+1)*4], 16) % Q\n                    for i in range(min(N, len(privkey_hex)//4))]\n\n    print("[*] Loading intercepted ciphertext...")\n    ct_bytes = ct_path.read_bytes()\n    print(f"    Ciphertext length: {len(ct_bytes)} bytes")\n\n    print("[*] Performing Kyber-style decapsulation...")\n    plaintext = decapsulate(privkey_poly, ct_bytes)\n\n    try:\n        decoded = plaintext.decode("utf-8", errors="replace").rstrip("\\x00")\n    except Exception:\n        decoded = plaintext.hex()\n\n    print(f"\\n[+] Decapsulation complete.")\n    print(f"[+] Plaintext ({len(plaintext)} bytes):")\n    print(f"    {decoded}")\n    print(f"\\n[+] POST-QUANTUM MASTER KEY:")\n    print(f"    {{{{FLAG:flag3}}}}")\n\nif __name__ == "__main__":\n    main()'
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
    // FILESYSTEM — QUANTUM-SAFEGUARD-01 (after SSH)
    // ═══════════════════════════════════════════════════════

    _qsFs: {
        '/': {
            type: 'dir',
            children: {
                'artifacts': {
                    type: 'dir',
                    children: {
                        'README.txt': {
                            type: 'file',
                            content: 'QSI Artifact Distribution — PQC-ENC-UNIT-01 Research Package\n=============================================================\nThis package contains artifacts for authorized security research on the\nPQC-ENC-UNIT-01 hardware module.\n\nContents:\n  pqc_algorithm_spec.txt       — Kyber-1024 variant specification\n  pqc_implementation.c         — C implementation of core crypto ops\n  simulated_side_channel_data.csv — 10,000 timing traces from real device\n  pqc_encrypted_comm.bin       — Intercepted ciphertext (classify: SECRET)\n\nNote: simulated_side_channel_data.csv format:\n  col 0:  decap_time_ns (decapsulation time in nanoseconds)\n  col 1-256: observed ciphertext polynomial coefficients\n\nResearchers should focus on the poly_mul_decrypt() routine for timing\nvariability analysis. See pqc_algorithm_spec.txt Section 4.3.'
                        },
                        'pqc_algorithm_spec.txt': {
                            type: 'file',
                            content: 'QSI PQC ALGORITHM SPECIFICATION — INTERNAL v1.2\n================================================\nAlgorithm:  Kyber-1024-QSI (NIST PQC Derivative)\nSecurity:   AES-256 equivalent (classical), Level 5 (quantum)\nPolynomial: R_q = Z_q[x] / (x^256 + 1)\nModulus q:  3329\nDimension k: 4 (Kyber-1024)\n\nSECTION 1: PARAMETER SET\n  N   = 256        # polynomial degree\n  q   = 3329       # prime modulus\n  k   = 4          # module dimension\n  eta1 = 2         # noise distribution parameter (key gen)\n  eta2 = 2         # noise distribution parameter (enc)\n  du  = 11         # compression param for u\n  dv  = 5          # compression param for v\n\nSECTION 2: KEY GENERATION\n  1. Sample secret key polynomial s from B_eta1^k\n  2. Sample error polynomial e from B_eta1^k\n  3. Sample public matrix A from R_q^{k x k}\n  4. Compute t = A*s + e (mod q)\n  5. Public key: (A, t)  Private key: s\n\nSECTION 3: ENCAPSULATION\n  1. Sample r, e1, e2 from B_eta2\n  2. u = A^T * r + e1   (mod q)\n  3. v = t^T * r + e2 + msg  (mod q)\n  4. Ciphertext: (u, v)\n\nSECTION 4: DECAPSULATION\n  4.1  Load private key polynomial s\n  4.2  Decompress ciphertext (u, v)\n  4.3  Compute m\' = v - s^T * u   (mod q)\n  4.4  Decode m\' to recover message\n\nSECTION 4.3 — poly_mul_decrypt() DETAIL:\n  This is the critical path. Computes s^T * u over R_q.\n  For each coefficient pair (s_i, u_i):\n    - Multiply s_i * u_i using schoolbook multiplication\n    - Reduce mod q after each coefficient accumulation\n  The multiplication loop iterates over all N=256 coefficient products.\n  NOTE: An optimization skips zero-coefficient multiplications.\n  See pqc_implementation.c function poly_mul_decrypt().\n\nSECTION 5: CONSTANT-TIME REQUIREMENTS\n  All operations MUST be constant-time to prevent side-channel leakage.\n  Do NOT branch on secret key values in polynomial arithmetic.\n  FAILURE TO COMPLY: timing leaks allow coefficient-by-coefficient\n  private key recovery via Pearson correlation analysis.\n\nSECTION 6: INVERSE NTT\n  Standard Cooley-Tukey butterfly network.\n  Inputs: polynomial coefficients in bit-reversed order\n  Output: polynomial in standard order (mod q)'
                        },
                        'pqc_implementation.c': {
                            type: 'file',
                            content: '/*\n * pqc_implementation.c — QSI PQC-ENC-UNIT-01 Core Cryptographic Implementation\n * Algorithm: Kyber-1024-QSI (NIST PQC Derivative)\n * WARNING: This file is CLASSIFIED — authorized research use only\n */\n\n#include <stdint.h>\n#include <string.h>\n#include <stdlib.h>\n\n#define N    256\n#define Q    3329\n#define K    4\n\ntypedef int16_t poly[N];\ntypedef poly polyvec[K];\n\n/* ----------------------------------------------------------------\n * barrett_reduce: fast modular reduction using Barrett method\n * Note: this function IS constant-time\n * ---------------------------------------------------------------- */\nstatic inline int16_t barrett_reduce(int32_t a) {\n    int32_t v = ((1 << 26) + Q/2) / Q;\n    int32_t t = v * a >> 26;\n    t *= Q;\n    return (int16_t)(a - t);\n}\n\n/* ----------------------------------------------------------------\n * poly_mul_decrypt: polynomial multiplication during decapsulation\n *\n * Computes: r = a * b mod (x^N + 1, q)\n * Called on the hot path of KEM_Dec() with private key in param a.\n *\n * TIMING VULNERABILITY:\n * The branch on line:  if (a[i] == 0) continue;\n * causes the loop to execute faster when private key coefficient a[i]\n * is zero. The timing difference is proportional to the Hamming weight\n * of the key polynomial coefficients. Over 10,000 decapsulation traces,\n * an attacker can recover each coefficient via Pearson correlation.\n * ---------------------------------------------------------------- */\nvoid poly_mul_decrypt(poly r, const poly a, const poly b) {\n    int32_t tmp;\n    memset(r, 0, N * sizeof(int16_t));\n\n    for (int i = 0; i < N; i++) {\n        /* TIMING LEAK: early exit on zero coefficient leaks key bit info */\n        if (a[i] == 0) continue;  /* VULNERABILITY: non-constant-time branch */\n\n        for (int j = 0; j < N; j++) {\n            tmp = (int32_t)a[i] * (int32_t)b[j];\n            if (i + j < N) {\n                r[i + j] = barrett_reduce(r[i + j] + tmp);\n            } else {\n                /* x^N = -1 mod (x^N + 1) — negacyclic reduction */\n                r[i + j - N] = barrett_reduce(r[i + j - N] - tmp);\n            }\n        }\n    }\n}\n\n/* ----------------------------------------------------------------\n * ntt_butterfly: single butterfly step for NTT\n * This function is constant-time\n * ---------------------------------------------------------------- */\nstatic inline void ntt_butterfly(int16_t *a, int16_t *b, int16_t zeta) {\n    int16_t t = barrett_reduce((int32_t)zeta * *b);\n    *b = *a - t;\n    *a = *a + t;\n}\n\n/* ----------------------------------------------------------------\n * poly_ntt: Number Theoretic Transform\n * ---------------------------------------------------------------- */\nvoid poly_ntt(poly r) {\n    unsigned int len, start, j, k;\n    int16_t zeta;\n    static const int16_t zetas[128] = {\n        /* NTT twiddle factors for q=3329, omitted for brevity */\n        2285, 2571, 2970, 1812, 1493, 1422,  287,  202,\n         3158,  622, 1577,  182,  962, 2127, 1855, 1468,\n        /* ... full table in firmware ROM ... */\n    };\n    k = 1;\n    for (len = 128; len >= 2; len >>= 1) {\n        for (start = 0; start < 256; start += 2*len) {\n            zeta = zetas[k++];\n            for (j = start; j < start + len; j++) {\n                ntt_butterfly(&r[j], &r[j + len], zeta);\n            }\n        }\n    }\n}\n\n/* ----------------------------------------------------------------\n * poly_invntt: Inverse NTT\n * ---------------------------------------------------------------- */\nvoid poly_invntt(poly r) {\n    /* Reverse butterfly network — full implementation in firmware */\n    /* Omitted: 256-entry inv_zetas table */\n    (void)r;\n}\n\n/* ----------------------------------------------------------------\n * KEM_Dec: Full KEM decapsulation entry point\n * ---------------------------------------------------------------- */\nint KEM_Dec(\n    uint8_t *msg_out,\n    const uint8_t *ct,\n    size_t ct_len,\n    const uint8_t *privkey,\n    size_t privkey_len\n) {\n    poly s, u, product;\n    polyvec sv;\n\n    if (!msg_out || !ct || !privkey) return -1;\n\n    /* Decode private key s from bytes */\n    for (int i = 0; i < N; i++) {\n        s[i] = (int16_t)((privkey[i*2] | (privkey[i*2+1] << 8)));\n        s[i] %= Q;\n    }\n\n    /* Decode ciphertext u component */\n    for (int i = 0; i < N; i++) {\n        u[i] = (int16_t)((ct[i*2] | (ct[i*2+1] << 8)));\n        u[i] %= Q;\n    }\n\n    /* Compute s * u — CALLS VULNERABLE FUNCTION */\n    poly_mul_decrypt(product, s, u);\n\n    /* Decode message from product (v - s^T*u) */\n    /* Full decode logic in firmware — simplified here */\n    memcpy(msg_out, product, 32);\n    return 0;\n}'
                        },
                        'simulated_side_channel_data.csv': {
                            type: 'file',
                            content: '[Binary CSV — 10,000 rows x 257 columns]\n[Col 0: decap_time_ns | Col 1-256: ciphertext polynomial coefficients]\n[File size: 2.1 MB — use python3 timing_attack.py to process]\n[Sample rows:]\ndecap_time_ns,c0,c1,c2,c3,...,c255\n312847,1204,2891,0,734,...,2203\n298341,1204,2891,0,734,...,2203\n315092,1204,2891,47,734,...,2203\n311204,1204,2891,0,734,...,2203\n319887,1204,2891,0,734,...,2203\n[... 9995 more rows ...]'
                        },
                        'pqc_encrypted_comm.bin': {
                            type: 'file',
                            content: '[Binary file — 512 bytes]\n[Kyber-1024 KEM ciphertext]\n[Hexdump preview:]\n00000000: a3f2 1b8c 4d7e 9a01 2fc3 88b4 d51a 3e6f  ....M~../....>o\n00000010: 7b2d 0e94 c8f3 15a7 4e89 d630 1c74 a2b5  {-.....N..0.t..\n00000020: 5f1a 4c72 b9e0 2d83 7641 0fb8 93e5 28dc  _.Lr.-.vA.....(.\n00000030: 1e7f 3b6a 2c94 a80d 5e31 8b47 f029 63d4  ..;j,...^1.G.)c.\n[... 480 more bytes ...]\n[Decrypt with python3 pqc_decrypt.py using recovered_privkey.hex]'
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'QUANTUM-SAFEGUARD-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nqsadmin:x:1001:1001:QS Admin:/home/qsadmin:/bin/bash\nsftp:x:502:502:SFTP Service:/srv/sftp:/sbin/nologin'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'qsadmin': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /artifacts/\ncat /artifacts/pqc_algorithm_spec.txt\ntail -5 /artifacts/simulated_side_channel_data.csv\nxxd /artifacts/pqc_encrypted_comm.bin | head\nsudo systemctl status pqc-enc-unit\nsudo journalctl -u pqc-enc-unit --since "1h ago"'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc: executed by bash(1) for non-login shells.\nexport PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"\nexport PQC_UNIT_ADDR=10.0.0.77\nexport PQC_UNIT_PORT=8443'
                                },
                                'admin_notes.txt': {
                                    type: 'file',
                                    content: 'QS Admin Notes — QUANTUM-SAFEGUARD-01\n======================================\n- PQC-ENC-UNIT-01 firmware: v2.3.1-release (no update scheduled)\n- Artifact server on SFTP port 2222 — credentials in /etc/sftp_creds.conf\n- Timing alert fired again today — engineering says it\'s "within acceptable range"\n- Decapsulation jitter has been 40-50% above baseline for 3 weeks\n- DO NOT restart pqc-enc-unit without authorization from CISO\n- Last successful audit: 2025-11-15 (no side-channel tests performed)\n- Next scheduled review: 2026-03-25\nTODO: Ask if poly_mul_decrypt optimization was validated for timing safety'
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

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.0.0.77';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.0.0.77') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                const aggressive = args.includes('-A') || args.includes('-sV');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.0.77 (QUANTUM-SAFEGUARD-01)
Host is up (0.011s latency).
Not shown: 996 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.3p1 Ubuntu 1ubuntu3.3
80/tcp   open  http       nginx/1.24.0 (Ubuntu)
443/tcp  open  ssl/https  nginx/1.24.0 (Ubuntu)
2222/tcp open  ssh        OpenSSH 9.3p1 (SFTP artifact distribution)
${aggressive ? '\nSERVICE DETECTION:\n  80/tcp  — HTTP: Quantum Safeguard Initiative Status Portal\n  2222/tcp — SFTP: Artifact distribution server — /artifacts/ directory\n\nOS DETECTION:\n  Running: Linux 5.15-6.1\n  OS CPE: cpe:/o:linux:linux_kernel\n' : ''}
Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.42 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00008s latency).
All 1000 scanned ports on localhost are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.05 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.12 seconds`;
        },

        'sftp': function(args, term, engine) {
            const fullCmd = args.join(' ');
            // Accept: sftp -P 2222 qsadmin@10.0.0.77
            if (!fullCmd.includes('10.0.0.77') && !fullCmd.includes('qsadmin')) {
                return 'Usage: sftp [-P port] user@host\nArtifact server: sftp -P 2222 qsadmin@10.0.0.77';
            }
            D19Config._artifactsDownloaded = true;
            if (engine) engine.advancePhase && engine.advancePhase('analysis');
            return `Connected to 10.0.0.77.
sftp> ls /artifacts/
pqc_algorithm_spec.txt  pqc_encrypted_comm.bin  pqc_implementation.c  README.txt  simulated_side_channel_data.csv

sftp> get /artifacts/pqc_algorithm_spec.txt
Fetching /artifacts/pqc_algorithm_spec.txt to pqc_algorithm_spec.txt
pqc_algorithm_spec.txt                                    100%   14KB  14.2KB/s   00:01

sftp> get /artifacts/pqc_implementation.c
Fetching /artifacts/pqc_implementation.c to pqc_implementation.c
pqc_implementation.c                                      100%   8.7KB  8.7KB/s   00:01

sftp> get /artifacts/simulated_side_channel_data.csv
Fetching /artifacts/simulated_side_channel_data.csv to simulated_side_channel_data.csv
simulated_side_channel_data.csv                           100%   2.1MB  2.1MB/s   00:01

sftp> get /artifacts/pqc_encrypted_comm.bin
Fetching /artifacts/pqc_encrypted_comm.bin to pqc_encrypted_comm.bin
pqc_encrypted_comm.bin                                    100%  512   512B/s   00:01

sftp> bye

[+] All artifacts downloaded to /home/kali/
[+] Begin analysis: cat pqc_algorithm_spec.txt | less`;
        },

        'wget': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'wget: missing URL\nUsage: wget [options] URL';
            if (url.includes('10.0.0.77')) {
                D19Config._artifactsDownloaded = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                const filename = url.split('/').pop() || 'index.html';
                return `--2026-03-20 14:22:33--  ${url}
Connecting to 10.0.0.77:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [application/octet-stream]
Saving to: '${filename}'

${filename}           [ <=>                   ]  downloaded

2026-03-20 14:22:34 (1.20 MB/s) - '${filename}' saved`;
            }
            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => !a.startsWith('-') && (a.startsWith('http') || a.startsWith('sftp'))) || '';

            if (url.includes('10.0.0.77')) {
                if (url.includes('/artifacts')) {
                    return `<!DOCTYPE html>
<html>
<head><title>QSI Artifact Index</title></head>
<body>
<h2>Index of /artifacts/</h2>
<pre>
pqc_algorithm_spec.txt          14280 bytes
pqc_implementation.c             8914 bytes
simulated_side_channel_data.csv  2201438 bytes
pqc_encrypted_comm.bin            512 bytes
README.txt                       1109 bytes
</pre>
<p>Use SFTP port 2222 to download files.</p>
</body>
</html>`;
                }
                if (url.includes('/status')) {
                    return `{"device":"PQC-ENC-UNIT-01","status":"OPERATIONAL","algorithm":"Kyber-1024","firmware":"v2.3.1-release","decap_ops_today":14227,"avg_decap_ns":312000,"timing_jitter_ns":41000,"alert":"TIMING_JITTER_HIGH"}`;
                }
                return `<!DOCTYPE html>
<html>
<head><title>Quantum Safeguard Initiative</title></head>
<body>
<h1>Quantum Safeguard Initiative — PQC-COMMS-01</h1>
<p>SFTP artifact server: port 2222 (credentials required)</p>
<p>Status: <a href="/status">/status</a></p>
</body>
</html>`;
            }
            return `curl: (7) Failed to connect to ${(url || 'host').replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('qsadmin') || fullCmd.includes('10.0.0.77')) {
                D19Config._sshAuthenticated = true;
                D19Config._switchContext('ssh-qs01', term);
                return `The authenticity of host '10.0.0.77 (10.0.0.77)' can't be established.
ED25519 key fingerprint is SHA256:pQcL4t1c3L3akV4uLt3rN0w8xQ2sS9mZ7bF1jK3vM6.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.0.0.77' (ED25519) to the list of known hosts.
qsadmin@10.0.0.77's password: ********

Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 6.5.0-26-generic x86_64)

 * PQC-COMMS-01 is a classified system. Authorized access only.

Last login: Thu Mar 20 08:14:12 2026 from 10.0.0.12

qsadmin@QUANTUM-SAFEGUARD-01:~$

[+] SSH session established. You are on QUANTUM-SAFEGUARD-01 as qsadmin.`;
            }
            return 'Usage: ssh [user@]hostname\nExample: ssh qsadmin@10.0.0.77';
        },

        'python3': function(args, term, engine) {
            const script = args[0] || '';

            if (!script) return 'Usage: python3 <script.py>\nAvailable: timing_attack.py, key_reconstruct.py, pqc_decrypt.py';

            if (script.includes('timing_attack')) {
                if (!D19Config._artifactsDownloaded) {
                    return '[!] simulated_side_channel_data.csv not found.\n[!] Download artifacts first: sftp -P 2222 qsadmin@10.0.0.77';
                }
                D19Config._timingAttackRun = true;
                D19Config._partialKeyRecovered = true;
                if (engine) engine.advancePhase && engine.advancePhase('sidechannel');
                return `[*] Loading simulated_side_channel_data.csv...
[*] Loaded 10000 traces, 256 coefficient columns.
[*] Running Pearson correlation attack on first 32 coefficients...
    coeff[  0] = 2891  (|r| = 0.8214)
    coeff[  1] = 1204  (|r| = 0.7993)
    coeff[  2] =    0  (|r| = 0.9102)
    coeff[  3] =  734  (|r| = 0.8441)
    coeff[  4] = 2203  (|r| = 0.7877)
    coeff[  5] = 3001  (|r| = 0.8655)
    coeff[  6] =  481  (|r| = 0.8129)
    coeff[  7] = 1672  (|r| = 0.7834)
    coeff[  8] =    0  (|r| = 0.9344)
    coeff[  9] = 2456  (|r| = 0.8071)
    coeff[ 10] = 1891  (|r| = 0.8502)
    coeff[ 11] =  305  (|r| = 0.8196)
    coeff[ 12] = 2744  (|r| = 0.7968)
    coeff[ 13] =    0  (|r| = 0.9218)
    coeff[ 14] = 1523  (|r| = 0.8344)
    coeff[ 15] =  867  (|r| = 0.8007)
    coeff[ 16] = 3129  (|r| = 0.7921)
    coeff[ 17] = 2001  (|r| = 0.8113)
    coeff[ 18] =    0  (|r| = 0.9089)
    coeff[ 19] = 1344  (|r| = 0.8237)
    coeff[ 20] =  712  (|r| = 0.8415)
    coeff[ 21] = 2988  (|r| = 0.7882)
    coeff[ 22] = 1567  (|r| = 0.8301)
    coeff[ 23] =    0  (|r| = 0.9451)
    coeff[ 24] = 2234  (|r| = 0.8162)
    coeff[ 25] =  988  (|r| = 0.7998)
    coeff[ 26] = 1776  (|r| = 0.8288)
    coeff[ 27] = 3204  (|r| = 0.7844)
    coeff[ 28] =    0  (|r| = 0.9177)
    coeff[ 29] = 1091  (|r| = 0.8392)
    coeff[ 30] = 2556  (|r| = 0.8051)
    coeff[ 31] =  433  (|r| = 0.8229)

[+] Partial private key (first 32 coefficients):
    0b4b04b400000002de08b88a09b90001003100017b8b0be900000540001000000d9e00000000008c0

[+] Saving to recovered_partial.hex
[*] Run python3 key_reconstruct.py to complete full key recovery.

{{FLAG:flag2}}`;
            }

            if (script.includes('key_reconstruct')) {
                if (!D19Config._partialKeyRecovered) {
                    return '[!] recovered_partial.hex not found.\n[!] Run python3 timing_attack.py first.';
                }
                D19Config._fullKeyReconstructed = true;
                return `[*] Extending partial key recovery to full N=256 polynomial...
[*] Applying lattice structure to infer remaining 224 coefficients...
[+] Full private key polynomial (256 coefficients):
    0b4b04b400000002de08b88a09b90001003100017b8b0be90000054000100000...b7c20039

[+] Key length: 1024 hex chars (512 bytes)
[+] Saved to recovered_privkey.hex
[*] Run python3 pqc_decrypt.py to decrypt pqc_encrypted_comm.bin.`;
            }

            if (script.includes('pqc_decrypt')) {
                if (!D19Config._fullKeyReconstructed && !D19Config._partialKeyRecovered) {
                    return '[!] recovered_privkey.hex not found.\n[!] Run key_reconstruct.py first.';
                }
                D19Config._decryptionComplete = true;
                if (engine) engine.advancePhase && engine.advancePhase('keyrecon');
                return `[*] Loading recovered private key...
[*] Loading intercepted ciphertext...
    Ciphertext length: 512 bytes
[*] Performing Kyber-style decapsulation...
[*] Running inverse NTT on product polynomial...
[*] Decoding message bits from coefficient rounding...

[+] Decapsulation complete.
[+] Plaintext (32 bytes):
    POST-QUANTUM-MASTER-KEY-RECOVERED

[+] POST-QUANTUM MASTER KEY:
    {{FLAG:flag3}}`;
            }

            // Generic python3 execution
            if (script.endsWith('.py')) {
                return `[!] Script not found or not recognized: ${script}\nAvailable scripts: timing_attack.py, key_reconstruct.py, pqc_decrypt.py`;
            }

            return `Python 3.11.6 (main, Oct  8 2023, 05:06:43)\nType "help", "copyright", "credits" or "license" for more information.\n>>>`;
        },

        'python': function(args, term, engine) {
            return D19Config.commands.python3(args, term, engine);
        },

        // Context-aware cat — shows QS01 files when SSH'd in
        'cat': function(args, term, engine) {
            if (D19Config._context !== 'ssh-qs01') return null;  // fall through to built-in
            var path = args[0] || '';

            if (path.includes('pqc_algorithm_spec') || path.includes('spec.txt')) {
                return D19Config._qsFs['/'].children.artifacts.children['pqc_algorithm_spec.txt'].content;
            }
            if (path.includes('pqc_implementation') || path.includes('implementation.c')) {
                return D19Config._qsFs['/'].children.artifacts.children['pqc_implementation.c'].content;
            }
            if (path.includes('README')) {
                return D19Config._qsFs['/'].children.artifacts.children['README.txt'].content;
            }
            if (path.includes('admin_notes')) {
                return D19Config._qsFs['/'].children.home.children.qsadmin.children['admin_notes.txt'].content;
            }
            if (path.includes('/etc/passwd')) {
                return D19Config._qsFs['/'].children.etc.children.passwd.content;
            }
            if (path.includes('/etc/hostname')) return 'QUANTUM-SAFEGUARD-01';
            if (path.includes('.bash_history')) {
                return D19Config._qsFs['/'].children.home.children.qsadmin.children['.bash_history'].content;
            }
            if (path.includes('.bashrc')) {
                return D19Config._qsFs['/'].children.home.children.qsadmin.children['.bashrc'].content;
            }
            if (path.includes('simulated_side_channel') || path.includes('.csv')) {
                return D19Config._qsFs['/'].children.artifacts.children['simulated_side_channel_data.csv'].content;
            }
            if (path.includes('pqc_encrypted_comm') || path.includes('.bin')) {
                return D19Config._qsFs['/'].children.artifacts.children['pqc_encrypted_comm.bin'].content;
            }
            return 'cat: ' + path + ': No such file or directory';
        },

        'less': function(args, term, engine) {
            // Alias cat for terminal context
            return D19Config.commands.cat(args, term, engine);
        },

        'ls': function(args, term, engine) {
            if (D19Config._context !== 'ssh-qs01') return null;  // fall through to built-in
            var path = args.find(function(a) { return !a.startsWith('-'); }) || '.';
            if (path === '.' || path === '/home/qsadmin' || path === '~') {
                return '.bash_history  .bashrc  .profile  admin_notes.txt';
            }
            if (path.includes('/artifacts') || path === 'artifacts') {
                return 'pqc_algorithm_spec.txt  pqc_encrypted_comm.bin  pqc_implementation.c  README.txt  simulated_side_channel_data.csv';
            }
            if (path === '/') {
                return 'artifacts  bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  srv  sys  tmp  usr  var';
            }
            return '';
        },

        'whoami': function(args, term, engine) {
            if (D19Config._context === 'ssh-qs01') return 'qsadmin';
            return null;
        },

        'id': function(args, term, engine) {
            if (D19Config._context === 'ssh-qs01') return 'uid=1001(qsadmin) gid=1001(qsadmin) groups=1001(qsadmin),4(adm)';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (D19Config._context === 'ssh-qs01') return 'QUANTUM-SAFEGUARD-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (D19Config._context === 'ssh-qs01') return '/home/qsadmin';
            return null;
        },

        'cd': function(args, term, engine) {
            if (D19Config._context === 'ssh-qs01') return '';  // silently accept
            return null;
        },

        'exit': function(args, term, engine) {
            if (D19Config._context === 'ssh-qs01') {
                D19Config._switchContext('attacker', term);
                return 'Connection to 10.0.0.77 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'ip': function(args) {
            if (D19Config._context === 'ssh-qs01') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.0.77/24 brd 10.0.0.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.0.10/24 brd 10.0.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D19Config.commands.ip(args || []);
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.0.0.77') {
                return `PING 10.0.0.77 (10.0.0.77) 56(84) bytes of data.
64 bytes from 10.0.0.77: icmp_seq=1 ttl=64 time=11.2 ms
64 bytes from 10.0.0.77: icmp_seq=2 ttl=64 time=10.9 ms
64 bytes from 10.0.0.77: icmp_seq=3 ttl=64 time=11.4 ms

--- 10.0.0.77 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 10.9/11.1/11.4/0.207 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ss': function(args) {
            if (D19Config._context === 'ssh-qs01') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:80           0.0.0.0:*
LISTEN   0        128      0.0.0.0:443          0.0.0.0:*
LISTEN   0        128      0.0.0.0:2222         0.0.0.0:*
LISTEN   0        128      0.0.0.0:8443         0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return D19Config.commands.ss(args);
        },

        'route': function(args) {
            if (D19Config._context === 'ssh-qs01') {
                return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.0.1        0.0.0.0         UG    100    0        0 eth0
10.0.0.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
            }
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.0.1        0.0.0.0         UG    100    0        0 eth0
10.0.0.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'xxd': function(args) {
            const path = args.find(a => !a.startsWith('-')) || '';
            if (path.includes('.bin') || path.includes('pqc_encrypted')) {
                return `00000000: a3f2 1b8c 4d7e 9a01 2fc3 88b4 d51a 3e6f  ....M~../....>o
00000010: 7b2d 0e94 c8f3 15a7 4e89 d630 1c74 a2b5  {-.....N..0.t..
00000020: 5f1a 4c72 b9e0 2d83 7641 0fb8 93e5 28dc  _.Lr.-.vA.....(
00000030: 1e7f 3b6a 2c94 a80d 5e31 8b47 f029 63d4  ..;j,...^1.G.)c
00000040: 8a4e 2103 c67d 1b5f 39e2 a017 d8b4 6c91  .N!..}._9.....l.
00000050: 4f37 8c02 e1b9 2d68 7523 0ef4 a58b 3dc9  O7....-hu#....=.
[... 480 more bytes ...]`;
            }
            if (!path) return 'Usage: xxd <file>';
            return `xxd: ${path}: No such file or directory`;
        },

        'file': function(args) {
            const path = args[0] || '';
            if (!path) return 'Usage: file <filename>';
            if (path.includes('.bin') || path.includes('pqc_encrypted')) {
                return `${path}: data (Kyber-1024 KEM ciphertext, 512 bytes)`;
            }
            if (path.includes('.csv')) {
                return `${path}: ASCII text, with very long lines (257 fields per row)`;
            }
            if (path.includes('.c')) {
                return `${path}: C source, ASCII text`;
            }
            if (path.includes('.txt')) {
                return `${path}: ASCII text`;
            }
            if (path.includes('.py')) {
                return `${path}: Python script, ASCII text executable`;
            }
            return `${path}: cannot open (No such file or directory)`;
        },

        'grep': function(args) {
            const pattern = args[0] || '';
            const file = args[1] || '';
            if (!pattern) return 'Usage: grep <pattern> <file>';

            // Key grep for vulnerability hunting in pqc_implementation.c
            if (pattern.includes('continue') || pattern.includes('== 0') || pattern.includes('timing')) {
                if (file.includes('.c') || file.includes('pqc_impl')) {
                    return `pqc_implementation.c:        if (a[i] == 0) continue;  /* VULNERABILITY: non-constant-time branch */`;
                }
            }
            if (pattern.includes('poly_mul')) {
                if (file.includes('.c')) {
                    return `pqc_implementation.c:void poly_mul_decrypt(poly r, const poly a, const poly b) {
pqc_implementation.c:    poly_mul_decrypt(product, s, u);`;
                }
                if (file.includes('.txt') || file.includes('spec')) {
                    return `pqc_algorithm_spec.txt:  See pqc_implementation.c function poly_mul_decrypt().`;
                }
            }
            if (pattern.includes('constant') || pattern.includes('MUST')) {
                return `pqc_algorithm_spec.txt:  All operations MUST be constant-time to prevent side-channel leakage.
pqc_algorithm_spec.txt:  Do NOT branch on secret key values in polynomial arithmetic.`;
            }
            if (pattern.includes('TIMING') || pattern.includes('Timing')) {
                return `pqc_implementation.c: * TIMING VULNERABILITY:
pqc_implementation.c: * The branch on line:  if (a[i] == 0) continue;`;
            }
            return `grep: no match for '${pattern}' in ${file || '(no file)'}`;
        },

        'wc': function(args) {
            const path = args.find(a => !a.startsWith('-')) || '';
            if (path.includes('.csv')) return `  10001  2601257 2201438 ${path}`;
            if (path.includes('.c')) return `    134     412   8914 ${path}`;
            if (path.includes('spec.txt')) return `    218     891  14280 ${path}`;
            if (path.includes('.py')) return `     89     312   3201 ${path}`;
            return `wc: ${path}: No such file or directory`;
        },

        'head': function(args) {
            const flags = args.filter(a => a.startsWith('-'));
            const path = args.find(a => !a.startsWith('-')) || '';
            const lines = flags.includes('-5') ? 5 : flags.includes('-20') ? 20 : 10;

            if (path.includes('.csv') || path.includes('simulated')) {
                let out = 'decap_time_ns,c0,c1,c2,c3,c4,c5,c6,c7,...,c255\n';
                const rows = [
                    '312847,1204,2891,0,734,2203,3001,481,1672,...,2203',
                    '298341,1204,2891,0,734,2203,3001,481,1672,...,2203',
                    '315092,1204,2891,47,734,2203,3001,481,1672,...,2203',
                    '311204,1204,2891,0,734,2203,3001,481,1672,...,2203',
                    '319887,1204,2891,0,734,2203,3001,481,1672,...,2203',
                    '307553,1204,2891,0,734,2203,3001,481,1672,...,2203',
                    '324901,1204,2891,0,734,2203,3001,481,1672,...,2203',
                    '299128,1204,2891,81,734,2203,3001,481,1672,...,2203',
                    '308744,1204,2891,0,734,2203,3001,481,1672,...,2203',
                    '316332,1204,2891,0,734,2203,3001,481,1672,...,2203'
                ];
                return out + rows.slice(0, lines - 1).join('\n');
            }
            if (path.includes('.c') || path.includes('implementation')) {
                return `/*
 * pqc_implementation.c — QSI PQC-ENC-UNIT-01 Core Cryptographic Implementation
 * Algorithm: Kyber-1024-QSI (NIST PQC Derivative)
 * WARNING: This file is CLASSIFIED — authorized research use only
 */

#include <stdint.h>
#include <string.h>
#include <stdlib.h>

#define N    256`;
            }
            return `head: cannot open '${path}' for reading: No such file or directory`;
        },

        'tail': function(args) {
            const path = args.find(a => !a.startsWith('-')) || '';
            if (path.includes('.csv')) {
                return `309217,1204,2891,0,734,2203,3001,481,1672,...,2203
317654,1204,2891,0,734,2203,3001,481,1672,...,2203
303441,1204,2891,0,734,2203,3001,481,1672,...,2203
311876,1204,2891,51,734,2203,3001,481,1672,...,2203
298902,1204,2891,0,734,2203,3001,481,1672,...,2203`;
            }
            return `tail: cannot open '${path}' for reading: No such file or directory`;
        },

        'stat': function(args) {
            const path = args[0] || '';
            if (!path) return 'Usage: stat <file>';
            if (path.includes('.csv')) {
                return `  File: simulated_side_channel_data.csv
  Size: 2201438         Blocks: 4304       IO Block: 4096   regular file
Device: fd00h/64768d    Inode: 131109      Links: 1
Access: (0644/-rw-r--r--)  Uid: ( 1001/ qsadmin)   Gid: ( 1001/ qsadmin)
Modify: 2026-03-18 03:44:01.000000000 +0000`;
            }
            if (path.includes('.bin')) {
                return `  File: pqc_encrypted_comm.bin
  Size: 512             Blocks: 8          IO Block: 4096   regular file
Device: fd00h/64768d    Inode: 131110      Links: 1
Access: (0640/-rw-r-----)  Uid: ( 1001/ qsadmin)   Gid: ( 1001/ qsadmin)
Modify: 2026-03-19 22:17:44.000000000 +0000`;
            }
            return `stat: cannot stat '${path}': No such file or directory`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.0.0.77
+ Target Hostname: QUANTUM-SAFEGUARD-01
+ Target Port:     80
+ Server: nginx/1.24.0 (Ubuntu)
+ /artifacts/: Directory listing enabled
+ /status: Sensitive telemetry endpoint accessible without authentication
+ Timing alert indicator visible in /status JSON (jitter: HIGH)
+ No Content-Security-Policy header found
+ 6 items checked: 4 findings`;
        },

        'pip': function(args) {
            const sub = args[0] || '';
            const pkg = args[1] || '';
            if (sub === 'install') {
                const validPkgs = ['numpy', 'pandas', 'scipy', 'matplotlib', 'gmpy2', 'pycryptodome', 'pycryptodomex'];
                if (validPkgs.some(p => pkg.includes(p))) {
                    return `Collecting ${pkg}
  Downloading ${pkg}-latest.tar.gz
Successfully installed ${pkg}`;
                }
                return `Collecting ${pkg}
  Downloading ${pkg}...
Successfully installed ${pkg}`;
            }
            if (sub === 'list') {
                return `Package            Version
------------------ -------
numpy              1.26.4
pandas             2.2.1
scipy              1.12.0
matplotlib         3.8.3
gmpy2              2.1.5
pycryptodome       3.20.0
cryptography       42.0.5`;
            }
            return 'Usage: pip install <package> | pip list';
        },

        'pip3': function(args, term, engine) {
            return D19Config.commands.pip(args, term, engine);
        },

        'uname': function(args) {
            if (D19Config._context === 'ssh-qs01') {
                return args.includes('-a')
                    ? 'Linux QUANTUM-SAFEGUARD-01 6.5.0-26-generic #26-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux'
                    : 'Linux';
            }
            return args.includes('-a')
                ? 'Linux kali 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.27-1kali1 x86_64 GNU/Linux'
                : 'Linux';
        },

        'env': function(args) {
            if (D19Config._context === 'ssh-qs01') {
                return `HOME=/home/qsadmin
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
PQC_UNIT_ADDR=10.0.0.77
PQC_UNIT_PORT=8443
LOGNAME=qsadmin
USER=qsadmin`;
            }
            return `HOME=/home/kali
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/games:/usr/games
LOGNAME=kali
USER=kali`;
        },

        'ps': function(args) {
            if (D19Config._context === 'ssh-qs01') {
                return `    PID TTY          TIME CMD
      1 ?        00:00:03 systemd
    412 ?        00:00:00 sshd
    891 ?        00:18:44 pqc-enc-unit
    892 ?        00:00:12 pqc-monitor
   1044 ?        00:00:04 nginx
   1201 pts/0    00:00:00 bash
   1388 pts/0    00:00:00 ps`;
            }
            return `    PID TTY          TIME CMD
      1 ?        00:00:01 systemd
    892 pts/0    00:00:00 bash
   1401 pts/0    00:00:00 ps`;
        },

        'systemctl': function(args) {
            const sub = args[0] || '';
            const svc = args[1] || '';
            if ((sub === 'status') && svc.includes('pqc')) {
                return `* pqc-enc-unit.service — PQC Encryption Unit Daemon
     Loaded: loaded (/lib/systemd/system/pqc-enc-unit.service; enabled)
     Active: active (running) since 2026-03-18 00:00:01 UTC; 2 days ago
    Process: 891 ExecStart=/usr/sbin/pqc-enc-unit --config /etc/pqc/config.toml
   Main PID: 891 (pqc-enc-unit)
     Status: "Processing KEM operations: 14,227 decap ops since start"

Mar 20 14:10:02 QUANTUM-SAFEGUARD-01 pqc-enc-unit[891]: INFO  Decap timing jitter: 41us (threshold: 28us) — ALERT
Mar 20 14:10:02 QUANTUM-SAFEGUARD-01 pqc-enc-unit[891]: WARN  poly_mul_decrypt timing variance exceeds baseline
Mar 20 14:10:03 QUANTUM-SAFEGUARD-01 pqc-enc-unit[891]: INFO  KEM decap completed: 0.000312s`;
            }
            return `Failed to connect to bus: No such file or directory\n[!] systemctl not available in this context.`;
        },

        'journalctl': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('pqc')) {
                return `Mar 20 14:10:01 QUANTUM-SAFEGUARD-01 pqc-enc-unit[891]: INFO  Starting decapsulation batch
Mar 20 14:10:02 QUANTUM-SAFEGUARD-01 pqc-enc-unit[891]: WARN  poly_mul_decrypt timing variance: 41037ns (baseline: 28000ns)
Mar 20 14:10:02 QUANTUM-SAFEGUARD-01 pqc-enc-unit[891]: INFO  KEM decap batch complete: 47 ops in 0.014641s
Mar 20 14:10:03 QUANTUM-SAFEGUARD-01 pqc-enc-unit[891]: WARN  Timing alert: jitter HIGH for 22 consecutive batches
Mar 20 14:10:03 QUANTUM-SAFEGUARD-01 pqc-enc-unit[891]: INFO  Alert suppressed — threshold override active until 2026-03-25
Mar 20 14:10:04 QUANTUM-SAFEGUARD-01 pqc-enc-unit[891]: INFO  Uptime: 2 days 14 hours 10 minutes`;
            }
            return `-- Logs begin at Mon 2026-03-18 00:00:00 UTC --\n(No matching entries for specified filter)`;
        }

    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        // Build an HTML table consistent with the accent color scheme
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #2d1f4e; background:#0f0a1e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #1a0a2e; color:#e5e7eb;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        // Sanitize strings before inserting into innerHTML
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        // Strip HTML tags and convert table cells to padded text columns
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
