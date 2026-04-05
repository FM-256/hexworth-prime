/* ============================================================
   CTF ARENA — Box CRYPTO-04: The Penguin Pattern
   AES-ECB — Block Pattern Analysis
   Config: ECB mode weakness, oracle attack, flags, hints, lore
   ============================================================ */

const Crypto04Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Penguin Pattern',
    subtitle: 'AES-ECB — Block Pattern Analysis',
    difficulty: 'Intermediate-Advanced',
    accent: '#f59e0b',
    storageKey: 'hexworth_ctf_crypto04',
    registryId: 'crypto-04-aes-ecb',
    trackerKey: 'ctf_crypto04',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Encrypted Data Analysis',
            icon: '\uD83D\uDD0D',
            description: 'Examine the encrypted data files. Look for repeating 16-byte blocks that reveal ECB mode.',
            requiredFlags: [],
            mitre: ['T1027', 'T1140'],
            unlocks: ['identification'],
            locked: false
        },
        {
            id: 'identification',
            name: 'Mode Identification',
            icon: '\uD83E\uddEE',
            description: 'Confirm the encryption uses AES-ECB by detecting identical ciphertext blocks from identical plaintext blocks.',
            requiredFlags: [],
            mitre: ['T1600.001', 'T1140'],
            unlocks: ['oracle'],
            locked: true
        },
        {
            id: 'oracle',
            name: 'Oracle Discovery',
            icon: '\uD83D\uDD13',
            description: 'Discover the encryption oracle endpoint. Use byte-at-a-time technique to extract the secret.',
            requiredFlags: ['user'],
            mitre: ['T1190', 'T1557'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'Secret Extraction',
            icon: '\uD83D\uDCC2',
            description: 'Complete the byte-at-a-time oracle attack to extract the full secret appended by the server.',
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
                title: 'Examine the encrypted image',
                tip: 'Run: xxd /home/kali/mission/logo_encrypted.bin | head -40 to look for repeating blocks.',
                trigger: { event: 'command', match: { cmd: 'contains:logo_encrypted' } }
            },
            {
                title: 'Detect ECB block patterns',
                tip: 'Use python3 to count duplicate 16-byte blocks. ECB produces identical blocks for identical input.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:python3' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:openssl' } }
                    ]
                }
            },
            {
                title: 'Identify ECB mode and submit user flag',
                tip: 'Confirm the encryption mode is ECB. The detection itself reveals the user flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Discover and use the encryption oracle',
                tip: 'The oracle at http://10.10.14.8:8080/encrypt?data=YOUR_INPUT encrypts your input + secret with AES-ECB.',
                trigger: { event: 'command', match: { cmd: 'contains:curl' } }
            },
            {
                title: 'Extract the secret via byte-at-a-time attack',
                tip: 'Feed controlled input to the oracle. Align blocks to brute-force the secret one byte at a time.',
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
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with cryptographic attacks — ECB mode detection', skill: 'AES-ECB Pattern Recognition' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze cryptographic implementations — Block cipher mode weakness', skill: 'Block Cipher Mode Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with cryptographic attacks — Oracle attack', skill: 'Byte-at-a-Time Oracle Attack' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — Proper cipher mode selection', skill: 'ECB Oracle Exploitation' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nMission: AES-ECB Block Pattern Analysis\nTarget: 10.10.14.8 (Encryption Oracle)\nFiles in /home/kali/mission/\n'
    },

    // ═══════════════════════════════════════════════════════
    // AES-ECB PARAMETERS
    // Block size: 16 bytes
    // Same plaintext block -> same ciphertext block
    // Oracle appends secret to user input before encrypting
    // ═══════════════════════════════════════════════════════

    _ecb: {
        blockSize: 16,
        // Simulated encrypted image blocks (showing repeating patterns)
        encryptedBlocks: [
            'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',  // Block 0: header
            'f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2',  // Block 1: unique
            'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',  // Block 2: SAME AS 0 (ECB leak!)
            'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',  // Block 3: SAME AS 0 (ECB leak!)
            'b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',  // Block 4: unique
            'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',  // Block 5: SAME AS 0 (ECB leak!)
            'c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',  // Block 6: unique
            'f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2',  // Block 7: SAME AS 1
            'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',  // Block 8: SAME AS 0 (ECB leak!)
            'd7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2'   // Block 9: unique
        ],
        // SEC-7: Oracle secret moved server-side to flag_registry.
        // BoxEngine pre-fetches it via deliverFlag on init.
        // The _handleOracle method reads it from the delivered cache.
        oracleBlockSize: 16
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
            text: 'Examine the hex dump of logo_encrypted.bin. In ECB mode, identical 16-byte plaintext blocks produce identical ciphertext blocks. Count the duplicates.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Use python3 to split the file into 16-byte blocks and count duplicates. If you find repeated blocks, the mode is ECB. This is the "penguin" problem.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The oracle at http://10.10.14.8:8080/encrypt appends a secret to your input and encrypts with AES-ECB. Send inputs of varying length to determine the block alignment.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Byte-at-a-time: Send 15 bytes of "A", note the first block. Then try all 256 possible last bytes ("A"*15 + byte) until the first block matches. Repeat for each position.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Neon Syndicate\'s data vault uses AES encryption for all stored assets -- images, documents, credentials. Their encryption service is accessible via a network endpoint. Intelligence reports the implementation uses ECB mode, which leaks patterns from the plaintext. Your mission: prove the ECB weakness and exploit the encryption oracle to extract a hidden secret.',
        scenario: 'The Neon Syndicate hired a contractor to build their encryption service. "AES is military-grade," the contractor assured them. "128-bit, unbreakable." Nobody asked which block cipher mode was used. The contractor chose ECB because it was simplest -- no IV management, no chaining logic. The famous "ECB Penguin" problem went unnoticed until Hexworth operatives started probing the endpoint.',
        outro: 'The Penguin Pattern is exposed. The Neon Syndicate\'s "military-grade" encryption crumbles under ECB block analysis and a byte-at-a-time oracle attack. The hidden secret is extracted without ever breaking AES itself. The lesson: the algorithm is only as strong as its mode of operation. ECB is a textbook warning for a reason.',
        ecer: {
            executive: 'Syndicate leadership accepted "AES is unbreakable" without understanding implementation details',
            culture: 'No cryptographic review process -- contractor delivered code without security audit',
            employee: 'Contractor chose ECB mode for simplicity, ignoring well-documented pattern leakage',
            regulatory: 'No requirement to specify cipher mode in encryption service contracts'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Encryption Oracle
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.8:8080/',

        pages: {
            '/': {
                title: 'Neon Syndicate Encryption Service',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#f59e0b; font-size:1.6rem; margin-bottom:4px;">Neon Syndicate Encryption Service</h1>
                        <div style="color:#888; font-size:0.8rem;">AES-128 Encryption Oracle v3.2.1</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto 20px;">
                        <label style="display:block; color:#aaa; font-size:0.8rem; margin-bottom:6px;">Enter data to encrypt (hex-encoded output):</label>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="data" placeholder="Enter plaintext to encrypt..."
                                   style="flex:1; padding:8px 14px; border:1px solid #555; border-radius:4px; background:#1a1a2e; color:#eee; font-family:monospace; font-size:0.85rem;">
                            <button data-action="encrypt"
                                    style="padding:8px 20px; background:#f59e0b; color:#000; border:none; border-radius:4px; font-weight:700; cursor:pointer;">Encrypt</button>
                        </div>
                    </div>
                    <div data-results style="max-width:700px; margin:0 auto; font-family:monospace; font-size:0.75rem; color:#aaa;">
                        <p>This service encrypts your input using AES-128. The encrypted output is returned in hex.</p>
                        <p style="color:#666;">API: GET /encrypt?data=YOUR_INPUT</p>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return Crypto04Config._handleOracle(data.data || '', engine);
                }
            }
        }
    },

    _handleOracle(input, engine) {
        if (!input.trim()) return '<div style="color:#888;">Enter data to encrypt.</div>';

        // Simulate oracle: input + secret -> AES-ECB encrypt
        // SEC-7: Secret fetched from flag_registry via deliverFlag (pre-cached on init)
        const inputLen = input.length;
        const secret = (typeof BoxEngine !== 'undefined' && BoxEngine.getDeliveredFlag('root'))
            ? BoxEngine.getDeliveredFlag('root').replace(/^flag\{|\}$/g, '')
            : 'LOADING_SECRET_';
        const combined = input + secret;
        const blockCount = Math.ceil(combined.length / 16);

        // Generate deterministic "encrypted" hex blocks
        const blocks = [];
        for (let i = 0; i < blockCount; i++) {
            const blockPlain = combined.substring(i * 16, (i + 1) * 16).padEnd(16, '\x00');
            // Simple deterministic hash-like output for simulation
            let hash = '';
            for (let j = 0; j < 16; j++) {
                const byte = (blockPlain.charCodeAt(j) * 37 + i * 13 + j * 7) % 256;
                hash += byte.toString(16).padStart(2, '0');
            }
            blocks.push(hash);
        }

        // Detect if student is doing byte-at-a-time attack (15 'A's = one byte short of block)
        if (input === 'A'.repeat(15) || input === 'a'.repeat(15)) {
            engine.advancePhase && engine.advancePhase('extraction');
            return `<div style="font-family:monospace; font-size:0.8rem;">
                <div style="color:#f59e0b; margin-bottom:8px;">Encrypted (${blocks.length} blocks):</div>
                <div style="color:#2ecc71; word-break:break-all;">${blocks.join(' ')}</div>
                <div style="color:#666; margin-top:8px; font-size:0.7rem;">Block size: 16 bytes | Mode: [REDACTED] | Input length: ${inputLen}</div>
                <div style="color:#f59e0b; margin-top:12px; padding:8px; border:1px solid #f59e0b; border-radius:4px;">
                    Oracle response captured. First block contains your 15 bytes + first byte of secret.
                    Compare this block against all 256 possibilities to determine the secret byte.
                </div>
            </div>`;
        }

        // Detect successful extraction attempt
        // SEC-7: Compare against server-delivered secret, not hardcoded value
        if (secret !== 'LOADING_SECRET_' && (input.includes(secret) || input.toLowerCase().includes(secret.toLowerCase()))) {
            return `<div style="font-family:monospace; font-size:0.8rem;">
                <div style="color:#2ecc71; margin-bottom:8px; font-weight:bold;">SECRET EXTRACTED!</div>
                <div style="color:#2ecc71;">The oracle secret is: {{FLAG:root}}</div>
            </div>`;
        }

        // Same-block detection (if input is all same char, show repeating blocks)
        if (input.length >= 32 && new Set(input).size === 1) {
            const repeatBlock = blocks[0];
            return `<div style="font-family:monospace; font-size:0.8rem;">
                <div style="color:#f59e0b; margin-bottom:8px;">Encrypted (${blocks.length} blocks):</div>
                <div style="color:#e74c3c; word-break:break-all;">
                    ${repeatBlock} ${repeatBlock} ${blocks.slice(2).join(' ')}
                </div>
                <div style="color:#e74c3c; margin-top:8px; font-size:0.75rem;">
                    WARNING: Blocks 0 and 1 are IDENTICAL. This reveals ECB mode!
                    Identical plaintext blocks produce identical ciphertext blocks.
                </div>
            </div>`;
        }

        return `<div style="font-family:monospace; font-size:0.8rem;">
            <div style="color:#f59e0b; margin-bottom:8px;">Encrypted (${blocks.length} blocks):</div>
            <div style="color:#2ecc71; word-break:break-all;">${blocks.join(' ')}</div>
            <div style="color:#666; margin-top:8px; font-size:0.7rem;">Block size: 16 bytes | Mode: [REDACTED] | Input length: ${inputLen}</div>
        </div>`;
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
                                        'logo_encrypted.bin': {
                                            type: 'file',
                                            content: '[BINARY FILE - AES-ECB ENCRYPTED]\nFile size: 160 bytes (10 blocks x 16 bytes)\nUse xxd to view the hex contents.'
                                        },
                                        'README.txt': {
                                            type: 'file',
                                            content: '=== MISSION: THE PENGUIN PATTERN ===\n\nINTEL BRIEFING:\nThe Neon Syndicate uses AES encryption for their data vault.\nAn encryption oracle is accessible at http://10.10.14.8:8080/\n\nFILES:\n- logo_encrypted.bin  : Encrypted image file from the vault\n- block_analyzer.py   : Python script to analyze ECB blocks\n- oracle_attack.py    : Template for byte-at-a-time oracle attack\n\nOBJECTIVES:\n1. [USER FLAG] Identify the encryption mode as AES-ECB.\n   Detect repeating ciphertext blocks in the encrypted image.\n2. [ROOT FLAG] Exploit the encryption oracle to extract the\n   appended secret using a byte-at-a-time attack.\n\nNOTE: The "penguin" problem -- ECB mode leaks plaintext patterns\nbecause identical input blocks produce identical output blocks.'
                                        },
                                        'block_analyzer.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nECB Block Analyzer - Hexworth Crypto Lab\nDetects repeating blocks that reveal ECB mode.\n"""\nimport sys\n\ndef analyze_blocks(hex_data, block_size=16):\n    """Split hex data into blocks and find duplicates"""\n    blocks = [hex_data[i:i+block_size*2] for i in range(0, len(hex_data), block_size*2)]\n    \n    print(f"Total blocks: {len(blocks)}")\n    print(f"Unique blocks: {len(set(blocks))}")\n    print(f"Duplicate blocks: {len(blocks) - len(set(blocks))}")\n    \n    if len(blocks) != len(set(blocks)):\n        print("\\n[!] DUPLICATE BLOCKS DETECTED -- ECB MODE CONFIRMED!")\n        # Show which blocks repeat\n        from collections import Counter\n        counts = Counter(blocks)\n        for block, count in counts.items():\n            if count > 1:\n                print(f"  Block {block[:16]}... appears {count} times")\n    else:\n        print("\\n[*] No duplicate blocks. Likely CBC or CTR mode.")\n\n# TODO: Load the encrypted file and analyze\n# hex_data = open("logo_encrypted.bin", "rb").read().hex()\n# analyze_blocks(hex_data)'
                                        },
                                        'oracle_attack.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nByte-at-a-Time ECB Oracle Attack - Hexworth Crypto Lab\n\nThe oracle at http://10.10.14.8:8080/encrypt appends a secret\nto your input and encrypts with AES-ECB.\n\nAttack strategy:\n1. Send 15 bytes of \'A\' -> first block = AAAAAAAAAAAAAAA + secret[0]\n2. Send AAAAAAAAAAAAAAA + guess for each byte (0-255)\n3. When first block matches, you found secret[0]\n4. Send 14 bytes of \'A\' -> first block = AAAAAAAAAAAAAA + secret[0:2]\n5. Repeat until full secret is recovered\n"""\nimport requests\n\nORACLE_URL = "http://10.10.14.8:8080/encrypt"\n\ndef query_oracle(plaintext):\n    """Send plaintext to oracle, get ciphertext"""\n    r = requests.get(ORACLE_URL, params={"data": plaintext})\n    return r.text  # hex-encoded ciphertext\n\ndef byte_at_a_time_attack(block_size=16):\n    known = ""\n    for i in range(block_size):  # Extract one block of secret\n        padding = "A" * (block_size - 1 - len(known))\n        target = query_oracle(padding)[:block_size*2]  # First block\n        \n        for byte_guess in range(256):\n            test = padding + known + chr(byte_guess)\n            result = query_oracle(test)[:block_size*2]\n            if result == target:\n                known += chr(byte_guess)\n                print(f"Found byte {i}: {chr(byte_guess)} (secret so far: {known})")\n                break\n    \n    return known\n\n# TODO: Run the attack\n# secret = byte_at_a_time_attack()\n# print(f"Extracted secret: {secret}")'
                                        }
                                    }
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: Neon Syndicate Encryption Service (10.10.14.8:8080)\nObjective: ECB mode exploitation\n\nAttack steps:\n1. Analyze encrypted image for block patterns\n2. Identify ECB mode via duplicate blocks\n3. Discover the encryption oracle endpoint\n4. Perform byte-at-a-time oracle attack\n5. Extract the appended secret\n\nTools: python3, openssl, xxd, curl\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls mission/\ncat mission/README.txt\nxxd mission/logo_encrypted.bin'
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

            // Detect ECB
            if (joined.includes('enc') && joined.includes('ecb')) {
                return 'openssl enc -aes-128-ecb: encryption/decryption performed.\nNote: ECB mode does not use an IV. Each block is encrypted independently.';
            }

            // Detect CBC for comparison
            if (joined.includes('enc') && joined.includes('cbc')) {
                return 'openssl enc -aes-128-cbc: encryption/decryption performed.\nNote: CBC mode chains blocks together -- identical plaintext blocks produce different ciphertext.';
            }

            if (joined.includes('enc')) {
                return 'Usage: openssl enc -aes-128-ecb -in file -out file.enc -K key_hex\n       openssl enc -aes-128-cbc -in file -out file.enc -K key_hex -iv iv_hex';
            }

            return 'Usage: openssl <command> [options]\n  enc     Symmetric encryption\n  rsa     RSA operations\n  dgst    Message digest';
        },

        'xxd': function(args, term, engine) {
            if (args.length === 0) return 'Usage: xxd [options] [file]\n  -p    Plain hex dump';

            const filePath = args.find(a => !a.startsWith('-'));
            if (filePath && filePath.includes('logo_encrypted')) {
                engine.advancePhase && engine.advancePhase('identification');
                const blocks = Crypto04Config._ecb.encryptedBlocks;
                let output = '';
                for (let i = 0; i < blocks.length; i++) {
                    const hex = blocks[i];
                    const offset = (i * 16).toString(16).padStart(8, '0');
                    const pairs = hex.match(/.{4}/g).join(' ');
                    const isRepeat = blocks.indexOf(hex) < i;
                    const marker = isRepeat ? '  <<< REPEAT' : '';
                    output += `${offset}: ${pairs}${marker}\n`;
                }
                output += `\n=== BLOCK ANALYSIS ===\nTotal blocks:     10\nUnique blocks:    5\nDuplicate blocks: 5\n\nBlock a1b2c3d4... appears 5 times!\nBlock f7e8d9c0... appears 2 times!\n\n[!] IDENTICAL CIPHERTEXT BLOCKS DETECTED\n[!] This is characteristic of ECB mode encryption.\n[!] AES-ECB confirmed.\n\n{{FLAG:user}}`;
                return output;
            }

            return 'xxd: No such file or directory';
        },

        'hexdump': function(args, term, engine) {
            return Crypto04Config.commands.xxd(args, term, engine);
        },

        'curl': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.10.14.8') && url.includes('/encrypt')) {
                engine.advancePhase && engine.advancePhase('oracle');

                const dataMatch = url.match(/[?&]data=([^&]*)/);
                const data = dataMatch ? decodeURIComponent(dataMatch[1]) : '';

                if (!data) {
                    return '{"error": "Missing \'data\' parameter", "usage": "GET /encrypt?data=YOUR_INPUT"}';
                }

                // 15 A's -- byte-at-a-time setup
                if (data === 'A'.repeat(15) || data === 'a'.repeat(15)) {
                    return `{"status": "ok", "input_length": 15, "blocks": 2, "ciphertext": "7f3a8b2c4d5e6f1a 9b0c1d2e3f4a5b6c", "note": "First block = your 15 bytes + first byte of secret"}`;
                }

                // 32 same chars -- ECB detection
                if (data.length >= 32 && new Set(data).size === 1) {
                    return `{"status": "ok", "input_length": ${data.length}, "blocks": ${Math.ceil((data.length + 15) / 16)}, "ciphertext": "7f3a8b2c4d5e6f1a 7f3a8b2c4d5e6f1a 9b0c1d2e3f4a5b6c", "warning": "BLOCKS 0 AND 1 ARE IDENTICAL -- ECB MODE DETECTED"}`;
                }

                // Secret extraction — SEC-7: compare against server-delivered secret
                var curlSecret = (typeof BoxEngine !== 'undefined' && BoxEngine.getDeliveredFlag('root'))
                    ? BoxEngine.getDeliveredFlag('root').replace(/^flag\{|\}$/g, '')
                    : null;
                if (curlSecret && (data.includes(curlSecret) || data.toLowerCase().includes(curlSecret.toLowerCase()))) {
                    return `{"status": "ok", "secret_extracted": true, "message": "Byte-at-a-time attack successful!", "flag": "{{FLAG:root}}"}`;
                }

                return `{"status": "ok", "input_length": ${data.length}, "blocks": ${Math.ceil((data.length + 15) / 16)}, "ciphertext": "${Array.from({length: Math.ceil((data.length + 15) / 16)}, () => Array.from({length: 16}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('')).join(' ')}"}`;
            }

            if (url.includes('10.10.14.8')) {
                return `<html><body><h1>Neon Syndicate Encryption Service</h1><p>API: GET /encrypt?data=YOUR_INPUT</p></body></html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('-c')) {
                const codeMatch = joined.match(/-c\s+["'](.+?)["']/);
                if (!codeMatch) return 'python3: error: argument -c: expected one argument';
                const code = codeMatch[1].toLowerCase();

                // Block analysis
                if (code.includes('counter') || code.includes('duplicate') || code.includes('block') || code.includes('set(')) {
                    engine.advancePhase && engine.advancePhase('identification');
                    return 'Total blocks: 10\nUnique blocks: 5\nDuplicate blocks: 5\n\n[!] ECB MODE CONFIRMED -- identical plaintext blocks produce identical ciphertext blocks\n\n{{FLAG:user}}';
                }

                // Oracle attack — SEC-7: secret pulled from server, not hardcoded
                if (code.includes('request') || code.includes('oracle') || code.includes('byte_at_a_time')) {
                    var oracleSecret = (typeof BoxEngine !== 'undefined' && BoxEngine.getDeliveredFlag('root'))
                        ? BoxEngine.getDeliveredFlag('root').replace(/^flag\{|\}$/g, '')
                        : 'EXTRACTING...';
                    var byteOutput = oracleSecret.split('').map(function(ch, i) { return 'Byte ' + i + ': ' + ch; }).join('\n');
                    return 'Running byte-at-a-time oracle attack...\n' + byteOutput + '\n\nExtracted secret: ' + oracleSecret + '\n\n{{FLAG:root}}';
                }

                return 'python3: executed';
            }

            if (joined.includes('block_analyzer')) {
                engine.advancePhase && engine.advancePhase('identification');
                return 'Total blocks: 10\nUnique blocks: 5\nDuplicate blocks: 5\n\n[!] DUPLICATE BLOCKS DETECTED -- ECB MODE CONFIRMED!\n  Block a1b2c3d4e5f6a7b8... appears 5 times\n  Block f7e8d9c0b1a2f3e4... appears 2 times\n\n{{FLAG:user}}';
            }

            if (joined.includes('oracle_attack')) {
                return 'Traceback (most recent call last):\n  File "oracle_attack.py", line 5, in <module>\n    import requests\nModuleNotFoundError: No module named \'requests\'\n\nTip: Use curl instead, or modify the script to use urllib.\nOr run the attack logic with: python3 -c "..."';
            }

            return 'Python 3.11.6\nUsage: python3 [-c cmd | script.py]';
        },

        'nmap': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target === '10.10.14.8') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.8
Host is up (0.028s latency).

PORT     STATE SERVICE
8080/tcp open  http    Neon Syndicate Encryption Oracle

Nmap done: 1 IP address (1 host up) scanned in 6.12 seconds`;
            }
            return 'Usage: nmap [options] <target>\nTarget: 10.10.14.8';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (target === '10.10.14.8') {
                return 'PING 10.10.14.8: 64 bytes, icmp_seq=1 ttl=64 time=28.3 ms\n3 packets transmitted, 3 received, 0% loss';
            }
            return 'Usage: ping <target>';
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
