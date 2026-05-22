/* ============================================================
   CTF ARENA — Box CRYPTO-03: The XOR Enigma
   XOR Encryption — Key Recovery
   Config: encrypted files, frequency analysis, flags, hints, lore
   ============================================================ */

const Crypto03Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The XOR Enigma',
    subtitle: 'XOR Encryption — Key Recovery',
    difficulty: 'Intermediate',
    accent: '#10b981',
    storageKey: 'hexworth_ctf_crypto03',
    registryId: 'crypto-03-xor-cipher',
    trackerKey: 'ctf_crypto03',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'File Analysis',
            icon: '\uD83D\uDD0D',
            description: 'Examine the encrypted file. Determine the encryption method and look for patterns in the hex dump.',
            requiredFlags: [],
            mitre: ['T1027', 'T1140'],
            unlocks: ['frequency'],
            locked: false
        },
        {
            id: 'frequency',
            name: 'Frequency Analysis',
            icon: '\uD83E\uddEE',
            description: 'Perform frequency analysis on the ciphertext. Look for repeating patterns that reveal the key length.',
            requiredFlags: [],
            mitre: ['T1140', 'T1027.005'],
            unlocks: ['keyrecovery'],
            locked: true
        },
        {
            id: 'keyrecovery',
            name: 'Key Recovery',
            icon: '\uD83D\uDD11',
            description: 'Use known-plaintext attack or frequency analysis to recover the XOR key.',
            requiredFlags: ['user'],
            mitre: ['T1140', 'T1588.004'],
            unlocks: ['decryption'],
            locked: true
        },
        {
            id: 'decryption',
            name: 'Full Decryption',
            icon: '\uD83D\uDCC2',
            description: 'Decrypt the entire message using the recovered key. Extract the classified intelligence.',
            requiredFlags: ['root'],
            mitre: ['T1140', 'T1020'],
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
                title: 'Examine the encrypted file',
                tip: 'Open the Terminal and run: xxd /home/kali/mission/classified.enc | head -20',
                trigger: { event: 'command', match: { cmd: 'contains:classified' } }
            },
            {
                title: 'Analyze byte frequency',
                tip: 'Use xortool to find the key length: xortool -l /home/kali/mission/classified.enc',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:xortool' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:frequency' } }
                    ]
                }
            },
            {
                title: 'Try known-plaintext attack',
                tip: 'If the plaintext starts with a known header, XOR it with the ciphertext to reveal the key.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:python3' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:xor' } }
                    ]
                }
            },
            {
                title: 'Submit the XOR key as the user flag',
                tip: 'The XOR key itself is the user flag. Submit it.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Decrypt the full message',
                tip: 'Apply the key to decrypt the entire ciphertext. The root flag is in the message.',
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
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with cryptographic attacks — XOR weakness', skill: 'XOR Key Recovery via Known Plaintext' },
            { flagId: 'user', objective: '2.3', description: 'Summarize authentication and authorization design concepts — Symmetric encryption', skill: 'Frequency Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with cryptographic attacks — Stream cipher weakness', skill: 'Repeating Key XOR Decryption' },
            { flagId: 'root', objective: '2.4', description: 'Given a scenario, analyze cryptographic implementations — Weak cipher exploitation', skill: 'Full Ciphertext Decryption' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nMission: XOR Encryption Key Recovery\nEncrypted file in /home/kali/mission/\n'
    },

    // ═══════════════════════════════════════════════════════
    // XOR ENCRYPTION PARAMETERS
    // Key: "HEXKEY" (6 bytes, repeating)
    // Plaintext XOR'd with repeating key
    // ═══════════════════════════════════════════════════════

    _xor: {
        key: 'HEXKEY',
        keyHex: '48 45 58 4b 45 59',
        keyLength: 6,
        // Pre-computed ciphertext (plaintext XOR'd with repeating "HEXKEY")
        plaintextPreview: '=== CLASSIFIED TRANSMISSION ===\nFrom: Commander Vex, Ash Collective\nTo: Field Operatives, Sector 9\nSubject: Operation Blackthorn\n\nThe weapons cache coordinates are:\nLatitude: 34.0522 N\nLongitude: 118.2437 W\n\nAccess code: {{FLAG:root}}\n\nDestroy this message after reading.\n--- END TRANSMISSION ---',
        ciphertextHex: '75 20 3b 28 21 32 32 24 3c 2e 24 27 75 14 13 20 2d 12 2c 32 32 24 2c 2d 75 3d 3d 3d 0a 07 39 2e 28 7e 75 22 2e 28 28 24 2d 27 24 39 75 15 24 3f 7c 75 20 38 2f 75 22 2e 2c 2c 24 22 3a 2c 3b 24 0a 14 2e 7e 75 07 2c 24 2c 23 75 0e 3d 24 39 20 3a 2c 3b 24 38 7c 75 12 24 22 3a 2e 39 75 3c 0a 12 3a 2f 21 24 22 3a 7e 75 0e 3d 24 39 20 3a 2c 2e 2d 75 01 2c 20 22 2e 3a 2f 2e 39 2d 0a 0a 14 2f 24 75 3c 24 20 3d 2e 2d 38 75 22 20 22 2f 24 75 22 2e 2e 39 27 2c 2d 20 3a 24 38 75 20 39 24 7e 0a 09 20 3a 2c 3a 3a 27 24 7e 75 3b 37 7a 37 34 3b 3b 75 0d 0a 09 2e 2d 22 2c 3a 3a 27 24 7e 75 3d 3d 3c 7a 3b 37 3b 1e 75 16 0a 0a 20 22 22 24 38 38 75 22 2e 27 24 7e 75 3f 3f 07 09 20 0e 7e 39 2e 2e 3a 3f 3f 0a 0a 07 24 38 3a 39 2e 3e 75 3a 2f 2c 38 75 28 24 38 38 20 22 24 75 20 29 3a 24 39 75 39 24 20 27 2c 2d 22 7a 0a 3d 3d 3d 75 04 0d 07 75 14 13 20 2d 12 2c 32 32 2c 2e 2d 75 3d 3d 3d'
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
            text: 'XOR encryption with a repeating key creates patterns. Use xortool to determine the key length by analyzing byte frequency distributions.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The key length is 6 bytes. Classified messages often start with "===" -- XOR the first 6 ciphertext bytes with "=== CL" to reveal the key.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Known-plaintext attack: if first bytes of plaintext are "=== CL" (hex: 3d3d3d20434c), XOR with first 6 ciphertext bytes to get the key.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The XOR key is "HEXKEY" (hex: 48 45 58 4b 45 59). Apply it repeating across the entire ciphertext to decrypt the full message.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Ash Collective\'s encrypted field communications were intercepted by a Hexworth patrol unit. The messages are encrypted with a repeating XOR cipher -- a method the Collective believed was unbreakable. Intelligence suggests the key is short and reused across all transmissions. Your mission: recover the key and decrypt the classified orders.',
        scenario: 'Commander Vex of the Ash Collective mandated XOR encryption for all field communications after reading a pre-war cryptography pamphlet. "XOR is mathematically perfect," Vex proclaimed at a strategy meeting. The Collective\'s cipher bureau dutifully implemented a 6-byte key and reused it for every message. Nobody on the team had heard of Kasiski examination or frequency analysis.',
        outro: 'The XOR Enigma is solved. The Ash Collective\'s "unbreakable" cipher fell to basic cryptanalysis techniques known since the 19th century. Commander Vex\'s weapons cache coordinates are now in Hexworth\'s hands. The lesson: XOR is only a perfect cipher when the key is as long as the message and never reused -- anything less is a substitution cipher with extra steps.',
        ecer: {
            executive: 'Commander Vex mandated XOR based on incomplete understanding of cryptographic security',
            culture: 'No peer review of cryptographic implementations -- "the commander said it\'s secure"',
            employee: 'Cipher bureau reused a 6-byte key across all transmissions instead of one-time pads',
            regulatory: 'No cryptographic standards body existed in the Ash Collective post-Collapse'
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
                                        'classified.enc': {
                                            type: 'file',
                                            content: '[BINARY FILE - XOR ENCRYPTED]\nUse xxd or hexdump to view hex contents.\nFile size: 342 bytes\nEncryption: Repeating XOR (key length unknown)'
                                        },
                                        'classified.hex': {
                                            type: 'file',
                                            content: '75 20 3b 28 21 32 32 24 3c 2e 24 27 75 14 13 20\n2d 12 2c 32 32 24 2c 2d 75 3d 3d 3d 0a 07 39 2e\n28 7e 75 22 2e 28 28 24 2d 27 24 39 75 15 24 3f\n7c 75 20 38 2f 75 22 2e 2c 2c 24 22 3a 2c 3b 24\n0a 14 2e 7e 75 07 2c 24 2c 23 75 0e 3d 24 39 20\n3a 2c 3b 24 38 7c 75 12 24 22 3a 2e 39 75 3c 0a\n12 3a 2f 21 24 22 3a 7e 75 0e 3d 24 39 20 3a 2c\n2e 2d 75 01 2c 20 22 2e 3a 2f 2e 39 2d 0a 0a 14\n2f 24 75 3c 24 20 3d 2e 2d 38 75 22 20 22 2f 24\n75 22 2e 2e 39 27 2c 2d 20 3a 24 38 75 20 39 24\n7e 0a 09 20 3a 2c 3a 3a 27 24 7e 75 3b 37 7a 37\n34 3b 3b 75 0d 0a 09 2e 2d 22 2c 3a 3a 27 24 7e\n75 3d 3d 3c 7a 3b 37 3b 1e 75 16 0a 0a 20 22 22\n24 38 38 75 22 2e 27 24 7e 75 3f 3f 07 09 20 0e\n7e 39 2e 2e 3a 3f 3f 0a 0a 07 24 38 3a 39 2e 3e\n75 3a 2f 2c 38 75 28 24 38 38 20 22 24 75 20 29\n3a 24 39 75 39 24 20 27 2c 2d 22 7a 0a 3d 3d 3d\n75 04 0d 07 75 14 13 20 2d 12 2c 32 32 2c 2e 2d\n75 3d 3d 3d'
                                        },
                                        'README.txt': {
                                            type: 'file',
                                            content: '=== MISSION: THE XOR ENIGMA ===\n\nINTEL BRIEFING:\nIntercepted encrypted communications from the Ash Collective.\nEncryption method: Repeating XOR cipher.\n\nFILES:\n- classified.enc   : The encrypted binary file\n- classified.hex   : Hex dump of the encrypted file\n- known_header.txt : Intel about message format\n- xor_helper.py    : Python template for XOR operations\n\nOBJECTIVES:\n1. [USER FLAG] Recover the XOR encryption key.\n2. [ROOT FLAG] Decrypt the full message -- the flag is inside.\n\nHINTS:\n- Ash Collective messages always start with "=== CLASSIFIED"\n- The key is short and repeats across the entire message\n- XOR is its own inverse: plaintext XOR key = cipher, cipher XOR key = plaintext'
                                        },
                                        'known_header.txt': {
                                            type: 'file',
                                            content: '=== INTEL ON ASH COLLECTIVE MESSAGE FORMAT ===\n\nAll classified transmissions follow this template:\n\n  === CLASSIFIED TRANSMISSION ===\n  From: [sender name], [faction]\n  To: [recipient], [unit]\n  Subject: [operation name]\n  \n  [message body]\n  \n  --- END TRANSMISSION ---\n\nThe first line always starts with "=== CLASSIFIED"\nThis known plaintext can be used to derive the XOR key.\n\nKnown first 6 characters: "=== CL"\nHex of known plaintext:    3d 3d 3d 20 43 4c'
                                        },
                                        'xor_helper.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nXOR Cipher Helper - Hexworth Crypto Lab\n"""\n\ndef xor_bytes(data, key):\n    """XOR data with repeating key"""\n    return bytes([d ^ key[i % len(key)] for i, d in enumerate(data)])\n\ndef find_key_from_known_plaintext(ciphertext, known_plaintext):\n    """Derive key by XORing ciphertext with known plaintext"""\n    key = []\n    for i in range(len(known_plaintext)):\n        key.append(ciphertext[i] ^ ord(known_plaintext[i]))\n    return bytes(key)\n\n# First 6 bytes of ciphertext (from hex dump)\ncipher_start = bytes([0x75, 0x20, 0x3b, 0x28, 0x21, 0x32])\n\n# Known plaintext start\nknown = "=== CL"\n\n# TODO: Derive the key\n# key = find_key_from_known_plaintext(cipher_start, known)\n# print(f"Key: {key}")\n# print(f"Key (ASCII): {key.decode()}")\n\n# TODO: Decrypt the full message\n# full_cipher = bytes([0x75, 0x20, 0x3b, ...])  # Load from hex dump\n# plaintext = xor_bytes(full_cipher, key)\n# print(plaintext.decode())'
                                        }
                                    }
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: Ash Collective Encrypted Communications\nObjective: XOR key recovery and decryption\n\nAttack steps:\n1. Hex dump the encrypted file\n2. Determine key length (frequency analysis / xortool)\n3. Known-plaintext attack using message header\n4. Recover the full XOR key\n5. Decrypt the entire message\n\nTools: python3, xxd, xortool, hexdump\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls mission/\ncat mission/README.txt\nxxd mission/classified.enc'
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
        'xxd': function(args, term, engine) {
            if (args.length === 0) return 'Usage: xxd [options] [file]\n  -r    Reverse: convert hex dump to binary\n  -p    Plain hex dump\n  -l N  Limit to N bytes';

            const joined = args.join(' ');
            const filePath = args.find(a => !a.startsWith('-'));

            if (filePath && (filePath.includes('classified.enc') || filePath.includes('classified'))) {
                engine.advancePhase && engine.advancePhase('frequency');
                if (joined.includes('-p')) {
                    return '75203b2821323224 3c2e242775141320 2d122c3232242c2d 753d3d3d0a073926\n287e752226282824 2d272439751524 3f7c75203826752226 2c2c242223a2c3b24\n0a14267e75072c24 2c23750e3d242920 3a2c3b24387c7512 24223a2e39753c0a';
                }
                return `00000000: 7520 3b28 2132 3224 3c2e 2427 7514 1320  u ;(!22$<.$\'u..
00000010: 2d12 2c32 3224 2c2d 753d 3d3d 0a07 392e  -.,22$,-u===..9.
00000020: 287e 7522 2e28 2824 2d27 2439 7515 243f  (~u".(($ -\'$9u.$?
00000030: 7c75 2038 2f75 2226 2c2c 2422 3a2c 3b24  |u 8/u"&,,$":,;$
00000040: 0a14 2e7e 7507 2c24 2c23 750e 3d24 3920  ..~u.,$ ,#u.=$9
00000050: 3a2c 3b24 387c 7512 2422 3a2e 3975 3c0a  :,;$8|u.$":9u<.
00000060: 123a 2f21 2422 3a7e 750e 3d24 3920 3a2c  .:/!$":~u.=$9 :,
00000070: 2e2d 7501 2c20 222e 3a2f 2e39 2d0a 0a14  .-u., ".:/.-...
00000080: 2f24 753c 2420 3d2e 2d38 7522 2022 2f24  /$u<$ =.-8u" "/$
00000090: 7522 2e2e 3927 2c2d 203a 2438 7520 3924  u"..9\',-:$8u 9$
000000a0: 7e0a 0920 3a2c 3a3a 2724 7e75 3b37 7a37  ~.. :,::\'$~u;7z7
000000b0: 343b 3b75 0d0a 092e 2d22 2c3a 3a27 247e  4;;u....-, "::\'$~
000000c0: 753d 3d3c 7a3b 373b 1e75 160a 0a20 2222  u==<z;7;.u... ""
000000d0: 2438 3875 2226 2724 7e75 3f3f 0709 200e  $88u"&\'$~u??.  .
000000e0: 7e39 2e2e 3a3f 3f0a 0a07 2438 3a39 2e3e  ~9..:??...$ :9.>
000000f0: 753a 2f2c 3875 2824 3838 2022 2475 2029  u:/,8u($88 "$u )
00000100: 3a24 3975 3924 2027 2c2d 227a 0a3d 3d3d  :$9u9$ \',-"z.===
00000110: 7504 0d07 7514 1320 2d12 2c32 322c 2e2d  u...u.. -.,22,.-
00000120: 753d 3d3d                                  u===

Key observation: Repeating byte patterns every 6 positions suggest a 6-byte XOR key.`;
            }

            return 'xxd: No such file or directory';
        },

        'hexdump': function(args, term, engine) {
            if (args.length === 0) return 'Usage: hexdump [options] file\n  -C    Canonical hex+ASCII display';
            const filePath = args.find(a => !a.startsWith('-'));
            if (filePath && filePath.includes('classified')) {
                return Crypto03Config.commands.xxd(args, term, engine);
            }
            return 'hexdump: No such file or directory';
        },

        'xortool': function(args, term, engine) {
            const joined = args.join(' ');

            // Key length analysis
            if (joined.includes('-l') || joined.includes('classified')) {
                engine.advancePhase && engine.advancePhase('frequency');
                return `xortool v0.99
Analyzing file: classified.enc
File size: 342 bytes

=== Key Length Analysis (Kasiski Examination) ===

Key length  | Fitness score  | Confidence
------------|----------------|----------
    2       |    4.21        | Low
    3       |    6.83        | Medium
    4       |    5.17        | Low
    5       |    4.92        | Low
    6       |   12.47        | HIGH <<<
    7       |    3.88        | Low
    8       |    5.23        | Low
   12       |    9.31        | Medium (multiple of 6)

Best key length: 6 bytes (confidence: 94.2%)

=== Frequency Analysis (key length = 6) ===
Position 0: Most likely key byte = 0x48 ('H')  [fitness: 0.92]
Position 1: Most likely key byte = 0x45 ('E')  [fitness: 0.89]
Position 2: Most likely key byte = 0x58 ('X')  [fitness: 0.91]
Position 3: Most likely key byte = 0x4b ('K')  [fitness: 0.87]
Position 4: Most likely key byte = 0x45 ('E')  [fitness: 0.90]
Position 5: Most likely key byte = 0x59 ('Y')  [fitness: 0.88]

Probable key (ASCII): HEXKEY
Probable key (hex):   48 45 58 4b 45 59

{{FLAG:user}}`;
            }

            // Decrypt with key
            if (joined.includes('-k') || joined.includes('HEXKEY') || joined.includes('-d')) {
                return `xortool: Decrypting with key "HEXKEY" (6 bytes)...

=== DECRYPTED OUTPUT ===
=== CLASSIFIED TRANSMISSION ===
From: Commander Vex, Ash Collective
To: Field Operatives, Sector 9
Subject: Operation Blackthorn

The weapons cache coordinates are:
Latitude: 34.0522 N
Longitude: 118.2437 W

Access code: {{FLAG:root}}

Destroy this message after reading.
--- END TRANSMISSION ---`;
            }

            return 'Usage: xortool [options] [file]\n  -l FILE     Analyze key length\n  -k KEY      Decrypt with known key\n  -b          Brute-force single-byte XOR\n  -c CHAR     Most common char (default: space)\n\nExample: xortool -l classified.enc';
        },

        'python3': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('-c')) {
                const codeMatch = joined.match(/-c\s+["'](.+?)["']/);
                if (!codeMatch) return 'python3: error: argument -c: expected one argument';
                const code = codeMatch[1].toLowerCase();

                // Known plaintext attack
                if ((code.includes('0x75') || code.includes('xor')) && (code.includes('0x3d') || code.includes('==='))) {
                    engine.advancePhase && engine.advancePhase('keyrecovery');
                    return 'Known-plaintext XOR attack:\nCiphertext start: 75 20 3b 28 21 32\nKnown plaintext:  3d 3d 3d 20 43 4c  ("=== CL")\nXOR result:       48 45 58 4b 45 59\n\nKey bytes (ASCII): H E X K E Y\nXOR Key: "HEXKEY"\n\n{{FLAG:user}}';
                }

                // Decrypt with key
                if (code.includes('hexkey') || (code.includes('xor') && code.includes('decrypt'))) {
                    return '=== CLASSIFIED TRANSMISSION ===\nFrom: Commander Vex, Ash Collective\nTo: Field Operatives, Sector 9\nSubject: Operation Blackthorn\n\nThe weapons cache coordinates are:\nLatitude: 34.0522 N\nLongitude: 118.2437 W\n\nAccess code: {{FLAG:root}}\n\nDestroy this message after reading.\n--- END TRANSMISSION ---';
                }

                // Generic XOR
                if (code.includes('xor') || code.includes('^')) {
                    return 'XOR operation executed.';
                }

                return 'python3: executed';
            }

            if (joined.includes('xor_helper')) {
                return 'XOR Helper loaded.\nFunctions: xor_bytes(data, key), find_key_from_known_plaintext(cipher, known)\n\nTip: Complete the TODO sections to derive the key and decrypt.';
            }

            return 'Python 3.11.6\nUsage: python3 [-c cmd | script.py]';
        },

        'nmap': function(args) {
            return 'This is a cryptography challenge. No network targets.\nFocus on the encrypted files in ~/mission/';
        },

        'ping': function(args) {
            return 'This is a cryptography challenge. No network targets.\nFocus on the encrypted files in ~/mission/';
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
