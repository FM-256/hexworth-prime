/* ============================================================
   CTF ARENA — Box CRYPTO-01: The Fragile Key
   RSA — Weak Key Exploitation
   Config: RSA keys, encryption, filesystem, flags, hints, lore
   ============================================================ */

const Crypto01Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Fragile Key',
    subtitle: 'RSA — Weak Key Exploitation',
    difficulty: 'Intermediate',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_crypto01',
    registryId: 'crypto-01-weak-rsa',
    trackerKey: 'ctf_crypto01',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Key Discovery',
            icon: '\uD83D\uDD0D',
            description: 'Locate and examine the RSA public key. Extract the modulus N and public exponent e.',
            requiredFlags: [],
            mitre: ['T1552.004', 'T1588.004'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Key Analysis',
            icon: '\uD83E\uddEE',
            description: 'Analyze the RSA modulus for weaknesses. Attempt to factorize N into its prime components.',
            requiredFlags: [],
            mitre: ['T1600.001', 'T1588.004'],
            unlocks: ['exploitation'],
            locked: true
        },
        {
            id: 'exploitation',
            name: 'Key Derivation',
            icon: '\uD83D\uDD13',
            description: 'Derive the RSA private key from the factored primes. Compute d = e^(-1) mod phi(N).',
            requiredFlags: ['user'],
            mitre: ['T1552.004', 'T1040'],
            unlocks: ['decryption'],
            locked: true
        },
        {
            id: 'decryption',
            name: 'Message Decryption',
            icon: '\uD83D\uDCC2',
            description: 'Use the derived private key to decrypt the intercepted ciphertext and extract the classified message.',
            requiredFlags: ['root'],
            mitre: ['T1557', 'T1020'],
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
                title: 'Examine the public key file',
                tip: 'Open the Terminal and run: cat /home/kali/mission/public_key.pem',
                trigger: { event: 'command', match: { cmd: 'contains:public_key' } }
            },
            {
                title: 'Extract key parameters',
                tip: 'Use openssl to inspect the key: openssl rsa -pubin -in /home/kali/mission/public_key.pem -text -noout',
                trigger: { event: 'command', match: { cmd: 'contains:openssl' } }
            },
            {
                title: 'Factorize the modulus',
                tip: 'The modulus N is small enough to factor. Try: factor <N> or use python3 to find the primes.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:factor' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:python3' } }
                    ]
                }
            },
            {
                title: 'Submit the user flag',
                tip: 'Once you have N and e, the user flag is revealed. Submit it via the Flag panel.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Decrypt the ciphertext',
                tip: 'Compute the private key d and decrypt the message. The root flag is inside.',
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
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with cryptographic attacks — Weak key analysis', skill: 'RSA Key Parameter Extraction' },
            { flagId: 'user', objective: '2.3', description: 'Summarize authentication and authorization design concepts — PKI and asymmetric encryption', skill: 'Public Key Infrastructure Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with cryptographic attacks — Key factorization', skill: 'RSA Private Key Derivation' },
            { flagId: 'root', objective: '2.4', description: 'Given a scenario, analyze cryptographic implementations — Weak key exploitation', skill: 'Ciphertext Decryption via Weak RSA' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Crypto accelerator: AES-NI enabled',
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
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nMission: RSA Weak Key Exploitation\nTarget files in /home/kali/mission/\n'
    },

    // ═══════════════════════════════════════════════════════
    // RSA PARAMETERS (intentionally weak — small primes)
    // N = p * q where p = 61 * q = 53 => N = 3233
    // e = 17 (public exponent)
    // phi(N) = (61-1)*(53-1) = 3120
    // d = 2753 (private exponent, e^-1 mod phi)
    // Plaintext flag encrypted: C = M^e mod N
    // ═══════════════════════════════════════════════════════

    _rsa: {
        p: 61,
        q: 53,
        n: 3233,
        e: 17,
        phi: 3120,
        d: 2753,
        ciphertext: [2790, 2329, 1430, 2000, 2325, 809, 2790, 99, 2186, 2936, 311, 2412, 809, 2790, 2325, 641, 1430],
        ciphertextHex: '0ae6 0919 0596 07d0 0915 0329 0ae6 0063 088a 0b78 0137 096c 0329 0ae6 0915 0281 0596',
        publicKeyPem: '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... [SIMULATED]\nModulus (N): 3233\nExponent (e): 17\n-----END PUBLIC KEY-----'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by examining the public key. Use openssl to extract the modulus N and exponent e. The key parameters are unusually small.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The modulus N = 3233. This is the product of two primes. Try using the factor command or a simple trial division in python3.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Once you have p and q, compute phi(N) = (p-1)(q-1). Then find d where (d * e) mod phi(N) = 1. Python3: pow(e, -1, phi_n)',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'To decrypt each ciphertext block: M = C^d mod N. Use python3: pow(ciphertext, d, n). Each result maps to an ASCII character.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Obsidian Enclave\'s communication relay was intercepted by Hexworth operatives. A classified transmission encrypted with RSA was captured, but the Enclave\'s cryptographers cut corners -- their key generation used dangerously small primes. Your mission: exploit the weak RSA key, derive the private exponent, and decrypt the intercepted message.',
        scenario: 'After the Great Collapse, the Obsidian Enclave rebuilt their secure communications using salvaged pre-war cryptography textbooks. Their lead cryptographer, a self-taught scavenger named Rust, implemented RSA with embarrassingly small prime numbers. "Nobody out in the Wastes knows math anymore," Rust boasted. He was wrong.',
        outro: 'The Fragile Key has shattered. The Obsidian Enclave\'s classified transmission is decrypted, revealing coordinates to a hidden weapons cache. Rust\'s hubris in using weak primes has cost the Enclave dearly. The lesson: key size matters, and 3233-bit... is not a thing.',
        ecer: {
            executive: 'Enclave leadership approved cryptographic implementation without expert review',
            culture: 'Over-reliance on "security through obscurity" -- assumed no adversary could factor N',
            employee: 'Cryptographer used textbook example parameters (61, 53) in production',
            regulatory: 'No cryptographic key strength standards enforced post-Collapse'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine)
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
                                'mission': {
                                    type: 'dir',
                                    children: {
                                        'public_key.pem': {
                                            type: 'file',
                                            content: '-----BEGIN PUBLIC KEY-----\nAlgorithm: RSA\nModulus (N): 3233\nPublic Exponent (e): 17\nKey Size: DANGEROUSLY SMALL\n-----END PUBLIC KEY-----\n\n# WARNING: This key was extracted from an intercepted\n# Obsidian Enclave transmission relay.\n# N = 3233, e = 17'
                                        },
                                        'intercepted_message.enc': {
                                            type: 'file',
                                            content: '=== INTERCEPTED RSA CIPHERTEXT ===\nSource: Obsidian Enclave Relay Node 7\nTimestamp: 2026-03-14T02:17:44Z\nEncryption: RSA (N=3233, e=17)\n\nCiphertext blocks (decimal):\n2790 2325 1430 2000 2325 809 2790 99 2186 2936 311 2412 809 2790 2325 641 1430\n\nCiphertext (hex):\n0ae6 0915 0596 07d0 0915 0329 0ae6 0063 088a 0b78 0137 096c 0329 0ae6 0915 0281 0596\n\nEach block was encrypted independently: C = M^17 mod 3233\nDecrypt each block to recover the ASCII plaintext.'
                                        },
                                        'README.txt': {
                                            type: 'file',
                                            content: '=== MISSION: THE FRAGILE KEY ===\n\nINTEL BRIEFING:\nThe Obsidian Enclave uses RSA encryption for classified comms.\nWe intercepted a transmission but it\'s encrypted.\n\nFILES:\n- public_key.pem     : The Enclave\'s RSA public key\n- intercepted_message.enc : The encrypted transmission\n- rsa_math_helper.py : Python template for RSA math\n\nOBJECTIVES:\n1. [USER FLAG] Extract and analyze the public key parameters (N, e)\n   The flag confirms you understand the key structure.\n2. [ROOT FLAG] Factor N, derive private key d, decrypt the message.\n   The decrypted plaintext contains the root flag.\n\nHINT: N = 3233 is suspiciously small for RSA...'
                                        },
                                        'rsa_math_helper.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nRSA Math Helper - Hexworth Crypto Lab\nFill in the blanks to crack the weak RSA key.\n"""\nimport math\n\n# Step 1: Known public key parameters\nN = 3233  # RSA modulus\ne = 17    # Public exponent\n\n# Step 2: Factor N into primes p and q\n# TODO: Find p and q such that p * q = N\np = ???\nq = ???\n\n# Step 3: Compute Euler\'s totient\n# phi(N) = (p - 1) * (q - 1)\nphi_n = ???\n\n# Step 4: Compute private exponent d\n# d = e^(-1) mod phi(N)\n# In Python 3.8+: d = pow(e, -1, phi_n)\nd = ???\n\n# Step 5: Decrypt ciphertext\nciphertext = [2790, 2325, 1430, 2000, 2325, 809, 2790, 99, 2186, 2936, 311, 2412, 809, 2790, 2325, 641, 1430]\n\nplaintext = ""\nfor c in ciphertext:\n    m = pow(c, d, N)  # Decrypt: M = C^d mod N\n    plaintext += chr(m)\n\nprint(f"Decrypted message: {plaintext}")'
                                        }
                                    }
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: Obsidian Enclave RSA Transmission\nObjective: Weak RSA key exploitation\n\nAttack steps:\n1. Examine public key (extract N and e)\n2. Factor the modulus N into primes p, q\n3. Compute phi(N) and derive private key d\n4. Decrypt the ciphertext blocks\n5. Find both flags (user + root)\n\nTools: openssl, python3, factor, bc, xxd\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls mission/\ncat mission/README.txt\nopenssl rsa -pubin -in mission/public_key.pem -text -noout'
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
                                            content: '[rockyou.txt -- 14,341,564 passwords -- file too large to display]'
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
                            content: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
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
        'openssl': function(args, term, engine) {
            const joined = args.join(' ');

            // openssl rsa -pubin -in ... -text -noout
            if (joined.includes('rsa') && joined.includes('-pubin')) {
                engine.advancePhase && engine.advancePhase('analysis');
                return `RSA Public-Key: (WEAK - 12 bit)
Modulus:
    N = 3233 (0x0ca1)
Public Exponent: 17 (0x11)

WARNING: Key size is critically small.
Standard minimum: 2048 bits
This key: ~12 bits

This key can be factored trivially.

=== KEY PARAMETERS ===
N (modulus):          3233
e (public exponent):  17

{{FLAG:user}}`;
            }

            // openssl rsautl -decrypt
            if (joined.includes('rsautl') && joined.includes('-decrypt')) {
                return 'RSA operation error: private key required.\nYou must derive the private key first.\nHint: Factor N=3233, compute d=e^(-1) mod phi(N)';
            }

            // openssl enc
            if (joined.includes('enc')) {
                return 'openssl enc: cipher not specified. Use -aes-256-cbc, -des3, etc.';
            }

            return 'Usage: openssl <command> [options]\n\nCommon commands:\n  rsa        RSA key operations\n  rsautl     RSA encrypt/decrypt\n  genrsa     Generate RSA key\n  enc        Symmetric encryption\n  dgst       Message digest\n\nTry: openssl rsa -pubin -in mission/public_key.pem -text -noout';
        },

        'python3': function(args, term, engine) {
            const joined = args.join(' ');

            // python3 -c "..."
            if (joined.includes('-c')) {
                const codeMatch = joined.match(/-c\s+["'](.+?)["']/);
                if (!codeMatch) return 'python3: error: argument -c: expected one argument';
                const code = codeMatch[1].toLowerCase();

                // Factor N
                if (code.includes('3233') && (code.includes('factor') || code.includes('%') || code.includes('divmod') || code.includes('range'))) {
                    return '61 * 53 = 3233\nPrime factors of 3233: p = 61, q = 53';
                }

                // Compute phi
                if (code.includes('60') && code.includes('52') || code.includes('phi') || code.includes('(61-1)') || code.includes('(53-1)')) {
                    return 'phi(N) = (61-1) * (53-1) = 60 * 52 = 3120';
                }

                // Compute d (modular inverse)
                if (code.includes('pow') && code.includes('-1') && code.includes('3120') || code.includes('modinv') || code.includes('inverse')) {
                    return 'd = pow(17, -1, 3120) = 2753\nPrivate exponent d = 2753';
                }

                // Decrypt
                if (code.includes('pow') && code.includes('2753') && code.includes('3233') || code.includes('decrypt') || code.includes('chr')) {
                    return 'Decrypting ciphertext blocks...\n\nBlock  Cipher  Plaintext  Char\n-----  ------  ---------  ----\n  1     2790      72       H\n  2     2325      101      e\n  3     1430      120      x\n  4     2000      119      w\n  5     2325      101      e\n  6      809      108      l\n  7     2790       72      H\n  8       99       33      !\n  9     2186       83      S\n 10     2936      116      t\n 11      311       97      a\n 12     2412      114      r\n 13      809      108      l\n 14     2790       72      H\n 15     2325      101      e\n 16      641      120      x\n 17     1430      120      x\n\nDecrypted message: {{FLAG:root}}';
                }

                // Generic math
                if (code.includes('print')) {
                    return '[python3 output]';
                }

                return 'python3: executed';
            }

            // python3 script.py
            if (joined.includes('rsa_math_helper') || joined.includes('.py')) {
                return 'Traceback (most recent call last):\n  File "rsa_math_helper.py", line 12\n    p = ???\n        ^^^\nSyntaxError: invalid syntax\n\nHint: Replace ??? with actual values.\nStep 1: Factor 3233 to find p and q\nStep 2: Compute phi(N) = (p-1)(q-1)\nStep 3: Compute d = pow(e, -1, phi_n)';
            }

            return 'Python 3.11.6\nUsage: python3 [-c cmd | script.py]\n\nTry:\n  python3 -c "print(3233 // 61)"\n  python3 -c "print(pow(17, -1, 3120))"\n  python3 mission/rsa_math_helper.py';
        },

        'factor': function(args) {
            if (args.length === 0) return 'Usage: factor NUMBER';
            const num = parseInt(args[0]);
            if (num === 3233) return '3233: 53 61';
            if (num === 3120) return '3120: 2 2 2 2 3 5 13';
            if (isNaN(num)) return `factor: '${args[0]}' is not a valid positive integer`;
            // Simple factoring for small numbers
            if (num < 2) return `${num}: ${num}`;
            let n = num;
            const factors = [];
            for (let i = 2; i * i <= n; i++) {
                while (n % i === 0) { factors.push(i); n /= i; }
            }
            if (n > 1) factors.push(n);
            return `${num}: ${factors.join(' ')}`;
        },

        'bc': function(args, term, engine) {
            const joined = args.join(' ');
            // Handle echo "expr" | bc pattern
            if (!joined) return 'bc 1.07.1\nCopyright 1991-1994, 1997, 2017 Free Software Foundation, Inc.\nType expressions to calculate. Use quit to exit.\n(interactive mode not supported - use: echo "expression" | bc)';
            return 'bc: use echo "expression" | bc';
        },

        'xxd': function(args, term, engine) {
            if (args.length === 0) return 'Usage: xxd [options] [file]\n  -r    Reverse: convert hex dump to binary\n  -p    Plain hex dump';
            const filePath = args.find(a => !a.startsWith('-'));
            if (filePath && filePath.includes('intercepted')) {
                return '00000000: 0ae6 0915 0596 07d0 0915 0329 0ae6 0063  ...........)\n00000010: 088a 0b78 0137 096c 0329 0ae6 0915 0281  ...x.7.l.)......\n00000020: 0596                                     ..';
            }
            return 'xxd: No such file or directory';
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            return 'Starting Nmap 7.94 ( https://nmap.org )\nNote: This is a cryptography challenge. No network targets.\nFocus on the files in ~/mission/';
        },

        'ping': function(args) {
            return 'This is a cryptography challenge. No network targets.\nFocus on the files in ~/mission/';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }
};
