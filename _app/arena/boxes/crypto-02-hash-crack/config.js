/* ============================================================
   CTF ARENA — Box CRYPTO-02: The Broken Vault
   Hash Cracking & Rainbow Tables
   Config: password hashes, cracking tools, flags, hints, lore
   ============================================================ */

const Crypto02Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Broken Vault',
    subtitle: 'Hash Cracking & Rainbow Tables',
    difficulty: 'Beginner-Intermediate',
    accent: '#ef4444',
    storageKey: 'hexworth_ctf_crypto02',
    registryId: 'crypto-02-hash-crack',
    trackerKey: 'ctf_crypto02',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Database Discovery',
            icon: '\uD83D\uDD0D',
            description: 'Locate the password database dump. Identify the hash types used for each account.',
            requiredFlags: [],
            mitre: ['T1003', 'T1552.001'],
            unlocks: ['identification'],
            locked: false
        },
        {
            id: 'identification',
            name: 'Hash Identification',
            icon: '\uD83E\uddEE',
            description: 'Analyze and classify each hash. Determine the algorithm (MD5, SHA1, SHA256) and whether salts are used.',
            requiredFlags: [],
            mitre: ['T1110.002', 'T1552.001'],
            unlocks: ['cracking'],
            locked: true
        },
        {
            id: 'cracking',
            name: 'Hash Cracking',
            icon: '\uD83D\uDD13',
            description: 'Crack the password hashes using dictionary attacks, rainbow tables, and brute force.',
            requiredFlags: ['user'],
            mitre: ['T1110.002', 'T1110.003'],
            unlocks: ['escalation'],
            locked: true
        },
        {
            id: 'escalation',
            name: 'Privilege Escalation',
            icon: '\uD83D\uDCC2',
            description: 'Crack the salted SHA256 root hash to gain full administrative access to the vault.',
            requiredFlags: ['root'],
            mitre: ['T1078', 'T1110.004'],
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
                title: 'Examine the password dump',
                tip: 'Open the Terminal and run: cat /home/kali/mission/vault_dump.txt',
                trigger: { event: 'command', match: { cmd: 'contains:vault_dump' } }
            },
            {
                title: 'Identify the hash types',
                tip: 'Use hash-identifier to classify the hashes: hash-identifier <hash>',
                trigger: { event: 'command', match: { cmd: 'contains:hash-identifier' } }
            },
            {
                title: 'Crack the admin MD5 hash',
                tip: 'Use hashcat or john with a wordlist: hashcat -m 0 <hash> /usr/share/wordlists/rockyou.txt',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:hashcat' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:john' } }
                    ]
                }
            },
            {
                title: 'Submit the user flag',
                tip: 'The cracked admin password reveals the user flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Crack the salted SHA256 hash',
                tip: 'The vault_master uses a salted SHA256 hash. Identify the salt and crack it.',
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
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Password cracking', skill: 'MD5 Hash Cracking' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks — Weak hashing', skill: 'Hash Algorithm Identification' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with cryptographic attacks — Rainbow tables', skill: 'Salted Hash Cracking' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — Password storage best practices', skill: 'Advanced Hash Exploitation' }
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
            'GPU detected: NVIDIA RTX 4090 (hashcat acceleration)',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nMission: Hash Cracking & Rainbow Tables\nPassword dump in /home/kali/mission/\n'
    },

    // ═══════════════════════════════════════════════════════
    // HASH DATABASE
    // MD5("password123") = 482c811da5d5b4bc6d497ffa98491e38
    // SHA1("letmein")    = b7a875fc1ea228b9061041b7cec4bd3c52ab3ce3
    // SHA256("vault_master" + salt "HEXSALT42") = salted hash
    // ═══════════════════════════════════════════════════════

    _hashDb: {
        accounts: [
            {
                username: 'admin',
                hash: '482c811da5d5b4bc6d497ffa98491e38',
                algorithm: 'MD5',
                password: 'password123',
                role: 'Administrator',
                flagOnCrack: 'user'
            },
            {
                username: 'operator',
                hash: 'b7a875fc1ea228b9061041b7cec4bd3c52ab3ce3',
                algorithm: 'SHA1',
                password: 'letmein',
                role: 'Operator'
            },
            {
                username: 'analyst',
                hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                algorithm: 'SHA256',
                password: 'password',
                role: 'Analyst'
            },
            {
                username: 'vault_master',
                hash: 'HEXSALT42$a1f3e2d4b5c6789012345678abcdef90fedcba0987654321abcdef1234567890',
                algorithm: 'SHA256 (salted)',
                salt: 'HEXSALT42',
                password: 'fractured_key_2026',
                role: 'Vault Master',
                flagOnCrack: 'root'
            },
            {
                username: 'guest',
                hash: '827ccb0eea8a706c4c34a16891f84e7b',
                algorithm: 'MD5',
                password: '12345',
                role: 'Guest'
            }
        ],
        rainbowTable: {
            '482c811da5d5b4bc6d497ffa98491e38': 'password123',
            '827ccb0eea8a706c4c34a16891f84e7b': '12345',
            'b7a875fc1ea228b9061041b7cec4bd3c52ab3ce3': 'letmein',
            '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8': 'password'
        }
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
            text: 'Start by reading the vault dump file. Use hash-identifier to determine the hash type for each entry. MD5 hashes are 32 hex characters.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The admin hash (482c811da...) is unsalted MD5. Try: hashcat -m 0 482c811da5d5b4bc6d497ffa98491e38 /usr/share/wordlists/rockyou.txt',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The vault_master hash uses salt "HEXSALT42" prepended to the password. Format: SHA256(salt + password). Try hashcat mode 1410.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'For the salted hash, the password is a phrase with underscores. Try: hashcat -m 1410 hash:salt with a custom wordlist or the hint "fractured" + "key" + year.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A password database from the Iron Citadel\'s vault system was exfiltrated during a raid. The dump contains hashed credentials for five accounts, including the vault_master who controls access to the Citadel\'s weapons stockpile. Your mission: crack the hashes and gain full vault access.',
        scenario: 'The Iron Citadel\'s sysadmin stored passwords using a mix of algorithms -- MD5 for legacy accounts, SHA1 for standard users, and SHA256 with a predictable salt for privileged accounts. "At least we\'re hashing them," the sysadmin shrugged. The salt was the team name followed by a number. Security by mediocrity.',
        outro: 'The Broken Vault is breached. Every password in the database has been cracked, from the trivial MD5 hashes to the salted SHA256 vault_master credential. The Iron Citadel\'s weapons stockpile is now accessible. The lesson: hashing without proper salting and key stretching is barely better than plaintext.',
        ecer: {
            executive: 'Citadel leadership rejected bcrypt/scrypt upgrade proposals citing "performance concerns"',
            culture: 'Legacy MD5 hashes never migrated despite known weaknesses since 2004',
            employee: 'Sysadmin used predictable salt pattern (team name + number) instead of random salts',
            regulatory: 'No password storage standards enforced -- mixed algorithms across accounts'
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
                                        'vault_dump.txt': {
                                            type: 'file',
                                            content: '=== IRON CITADEL - PASSWORD DATABASE DUMP ===\nExfiltrated: 2026-03-12T14:22:08Z\nSource: /var/lib/citadel/auth.db\n\n+---------------+------------------------------------------------------------------+---------------+\n| Username      | Password Hash                                                    | Role          |\n+---------------+------------------------------------------------------------------+---------------+\n| admin         | 482c811da5d5b4bc6d497ffa98491e38                                 | Administrator |\n| operator      | b7a875fc1ea228b9061041b7cec4bd3c52ab3ce3                         | Operator      |\n| analyst       | 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8 | Analyst       |\n| vault_master  | HEXSALT42$a1f3e2d4b5c6789012345678abcdef90fedcba0987654321abcdef1234567890 | Vault Master |\n| guest         | 827ccb0eea8a706c4c34a16891f84e7b                                 | Guest         |\n+---------------+------------------------------------------------------------------+---------------+\n\nNOTES:\n- Hash lengths: 32 chars = MD5, 40 chars = SHA1, 64 chars = SHA256\n- vault_master hash contains a "$" separator -- possible salt prefix\n- Legacy accounts still use MD5 (!!)'
                                        },
                                        'README.txt': {
                                            type: 'file',
                                            content: '=== MISSION: THE BROKEN VAULT ===\n\nINTEL BRIEFING:\nThe Iron Citadel vault database has been exfiltrated.\nFive accounts with hashed passwords need cracking.\n\nFILES:\n- vault_dump.txt    : The password database dump\n- hash_notes.txt    : Intel on the hashing schemes\n- crack_helper.py   : Python template for hash cracking\n\nOBJECTIVES:\n1. [USER FLAG] Crack the admin MD5 hash to reveal the user flag.\n2. [ROOT FLAG] Crack the vault_master salted SHA256 hash for root.\n\nTOOLS AVAILABLE:\n  hashcat, john, hash-identifier, python3, grep'
                                        },
                                        'hash_notes.txt': {
                                            type: 'file',
                                            content: '=== HASH ANALYSIS NOTES ===\n\nIntel gathered from Iron Citadel source code:\n\n1. Legacy accounts (admin, guest): Plain MD5\n   - md5(password) -- no salt, no iterations\n   - Vulnerable to rainbow tables\n\n2. Standard accounts (operator): SHA1\n   - sha1(password) -- no salt\n   - Slightly harder but still crackable\n\n3. Analyst account: SHA256\n   - sha256(password) -- no salt\n   - Modern algorithm but unsalted = vulnerable\n\n4. vault_master: SHA256 with salt\n   - Format: SALT$HASH\n   - sha256(salt + password)\n   - Salt appears to be "HEXSALT42"\n   - This is the hardest hash to crack\n\nRecommendation: Start with MD5 hashes (fastest to crack),\nthen work up to the salted SHA256.'
                                        },
                                        'crack_helper.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nHash Cracking Helper - Hexworth Crypto Lab\n"""\nimport hashlib\n\n# Known hashes from the vault dump\nhashes = {\n    "admin":        "482c811da5d5b4bc6d497ffa98491e38",\n    "guest":        "827ccb0eea8a706c4c34a16891f84e7b",\n    "operator":     "b7a875fc1ea228b9061041b7cec4bd3c52ab3ce3",\n    "analyst":      "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",\n    "vault_master": "a1f3e2d4b5c6789012345678abcdef90fedcba0987654321abcdef1234567890"\n}\n\nvault_salt = "HEXSALT42"\n\n# Quick check function\ndef check_md5(password, target_hash):\n    return hashlib.md5(password.encode()).hexdigest() == target_hash\n\ndef check_sha256_salted(password, salt, target_hash):\n    return hashlib.sha256((salt + password).encode()).hexdigest() == target_hash\n\n# TODO: Try passwords against the hashes\n# Example: print(check_md5("password123", hashes["admin"]))'
                                        }
                                    }
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: Iron Citadel Password Vault\nObjective: Crack all password hashes\n\nAttack steps:\n1. Examine the password dump\n2. Identify hash algorithms\n3. Crack MD5 hashes first (rainbow tables)\n4. Progress to SHA1, SHA256\n5. Crack the salted vault_master hash\n\nTools: hashcat, john, hash-identifier, python3\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat mission/vault_dump.txt\nhash-identifier\nhashcat --help'
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
                                            content: 'password\n123456\n12345678\npassword123\nletmein\n12345\nqwerty\nabc123\nmonkey\nmaster\ndragon\n1234567\ntrustno1\niloveyou\nfractured_key_2026\n[... 14,341,549 more passwords ...]'
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
        'hashcat': function(args, term, engine) {
            if (args.length === 0) return 'Usage: hashcat [options] hash|hashfile [dictionary]\n\n  -m   Hash type:\n         0    = MD5\n         100  = SHA1\n         1400 = SHA256\n         1410 = SHA256($pass.$salt)\n         1420 = SHA256($salt.$pass)\n  -a   Attack mode:\n         0 = Dictionary\n         3 = Brute-force\n\nExample: hashcat -m 0 -a 0 hash.txt /usr/share/wordlists/rockyou.txt';

            const joined = args.join(' ');

            // MD5 mode (-m 0) + admin hash
            if (joined.includes('-m 0') && joined.includes('482c811da5d5b4bc6d497ffa98491e38')) {
                engine.advancePhase && engine.advancePhase('cracking');
                return `hashcat (v6.2.6) starting...

OpenCL API (OpenCL 3.0) - Platform #1 [NVIDIA]
* Device #1: NVIDIA GeForce RTX 4090, 24384/24564 MB

Minimum password length supported: 0
Maximum password length supported: 256

Dictionary: /usr/share/wordlists/rockyou.txt
Hashes: 1 digests; 1 unique digests
Rules: 1

Session...........: hashcat
Status...........: Cracked
Hash.Mode........: 0 (MD5)
Hash.Target......: 482c811da5d5b4bc6d497ffa98491e38
Time.Started.....: Thu Mar 19 14:22:08 2026
Speed.#1.........: 28341.2 MH/s

482c811da5d5b4bc6d497ffa98491e38:password123

Session..........: hashcat
Status...........: Cracked
Progress.........: 14341564/14341564 (100.00%)

=== ADMIN PASSWORD CRACKED ===
Hash:     482c811da5d5b4bc6d497ffa98491e38
Password: password123
Algorithm: MD5 (unsalted)

{{FLAG:user}}`;
            }

            // MD5 mode (-m 0) + guest hash
            if (joined.includes('-m 0') && joined.includes('827ccb0eea8a706c4c34a16891f84e7b')) {
                return `hashcat (v6.2.6) starting...

Hash.Mode........: 0 (MD5)
Status...........: Cracked

827ccb0eea8a706c4c34a16891f84e7b:12345

Password: 12345 (trivial)`;
            }

            // SHA1 mode (-m 100)
            if (joined.includes('-m 100') && joined.includes('b7a875fc')) {
                return `hashcat (v6.2.6) starting...

Hash.Mode........: 100 (SHA1)
Status...........: Cracked

b7a875fc1ea228b9061041b7cec4bd3c52ab3ce3:letmein

Password: letmein`;
            }

            // SHA256 mode (-m 1400) unsalted
            if (joined.includes('-m 1400') && joined.includes('5e884898')) {
                return `hashcat (v6.2.6) starting...

Hash.Mode........: 1400 (SHA256)
Status...........: Cracked

5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8:password

Password: password`;
            }

            // SHA256 salted mode (-m 1410 or -m 1420) + vault_master
            if ((joined.includes('-m 1410') || joined.includes('-m 1420')) && (joined.includes('a1f3e2d4') || joined.includes('vault') || joined.includes('HEXSALT42'))) {
                return `hashcat (v6.2.6) starting...

OpenCL API (OpenCL 3.0) - Platform #1 [NVIDIA]
* Device #1: NVIDIA GeForce RTX 4090, 24384/24564 MB

Hash.Mode........: 1420 (SHA256($salt.$pass))
Hash.Target......: a1f3e2d4b5c6...67890:HEXSALT42
Time.Started.....: Thu Mar 19 14:45:33 2026
Speed.#1.........: 4218.6 MH/s

a1f3e2d4b5c6789012345678abcdef90fedcba0987654321abcdef1234567890:HEXSALT42:fractured_key_2026

Session..........: hashcat
Status...........: Cracked
Progress.........: 14341564/14341564 (100.00%)

=== VAULT MASTER PASSWORD CRACKED ===
Hash:     a1f3e2d4b5c6...67890
Salt:     HEXSALT42
Password: fractured_key_2026
Algorithm: SHA256 (salted)

{{FLAG:root}}`;
            }

            // Generic hashcat with some hash
            if (joined.includes('-m')) {
                return `hashcat (v6.2.6) starting...

Status...........: Exhausted
No matching hash found in dictionary.

Tip: Make sure the -m mode matches the hash type:
  -m 0    = MD5 (32 chars)
  -m 100  = SHA1 (40 chars)
  -m 1400 = SHA256 (64 chars)
  -m 1420 = SHA256($salt.$pass)`;
            }

            return 'hashcat (v6.2.6)\nUsage: hashcat -m <mode> -a <attack> <hash> <wordlist>\nTry: hashcat -m 0 -a 0 <md5_hash> /usr/share/wordlists/rockyou.txt';
        },

        'john': function(args, term, engine) {
            if (args.length === 0) return 'Usage: john [options] hashfile\n\nOptions:\n  --format=raw-md5     MD5 hashes\n  --format=raw-sha1    SHA1 hashes\n  --format=raw-sha256  SHA256 hashes\n  --wordlist=FILE      Dictionary file\n  --show               Show cracked passwords';

            const joined = args.join(' ');

            if (joined.includes('--show')) {
                return 'admin:password123\nguest:12345\noperator:letmein\nanalyst:password\n\n4 password hashes cracked, 1 left (vault_master -- salted SHA256)';
            }

            if (joined.includes('--format=raw-md5') || joined.includes('md5')) {
                engine.advancePhase && engine.advancePhase('cracking');
                return `Using default input encoding: UTF-8
Loaded 2 password hashes with no different salts (Raw-MD5)
Press 'q' or Ctrl-C to abort

password123      (admin)
12345            (guest)

2g 0:00:00:03 DONE (2026-03-19 14:22) 0.6250g/s 4485Kp/s

=== ADMIN PASSWORD CRACKED ===
admin:password123

{{FLAG:user}}`;
            }

            if (joined.includes('vault') || joined.includes('salted') || joined.includes('sha256')) {
                return `Using default input encoding: UTF-8
Loaded 1 password hash with salt (SHA256-salted)
Press 'q' or Ctrl-C to abort

fractured_key_2026 (vault_master)

1g 0:00:02:14 DONE (2026-03-19 14:47) 0.007440g/s 106800p/s

=== VAULT MASTER PASSWORD CRACKED ===
vault_master:fractured_key_2026 (salt: HEXSALT42)

{{FLAG:root}}`;
            }

            return 'John the Ripper 1.9.0-jumbo-1\nLoaded password hashes. Starting crack...\nUse --format to specify hash type.';
        },

        'hash-identifier': function(args, term, engine) {
            if (args.length === 0) return 'Usage: hash-identifier <hash>\n\nPaste a hash to identify its type.\nSupported: MD5, SHA1, SHA256, SHA512, bcrypt, etc.';

            const hash = args[0];
            engine.advancePhase && engine.advancePhase('identification');

            if (hash.length === 32) {
                return `   #########################################################################
   #     __  __                     __           __  _  __ _             #
   #    / / / /___ ________ ____   /  |/  /___  ____/ / (_) __(_)__  _____ #
   #   / /_/ / __ \`/ ___/ __ \\ / __ | / / __ \\/ __  / / / /_/ / _ \\/ ___/ #
   #  / __  / /_/ (__  ) / / // /| |/ / /_/ / /_/ / / / __/ /  __/ /     #
   # /_/ /_/\\__,_/____/_/ /_//_/ |_/_/\\____/\\__,_/ /_/_/ /_/\\___/_/      #
   #########################################################################

Possible Hashs:
[+] MD5
[+] NTLM
[+] MD4
[+] LM

Least Possible Hashs:
[+] RAdmin v2.x
[+] Haval-128

Most likely: MD5 (32 hex characters, no salt indicator)`;
            }

            if (hash.length === 40) {
                return `Possible Hashs:
[+] SHA-1
[+] MySQL5
[+] RIPEMD-160

Most likely: SHA-1 (40 hex characters)`;
            }

            if (hash.length === 64) {
                return `Possible Hashs:
[+] SHA-256
[+] Haval-256
[+] GOST R 34.11-94
[+] RIPEMD-256

Most likely: SHA-256 (64 hex characters)`;
            }

            if (hash.includes('$')) {
                return `Possible Hashs:
[+] SHA-256 with salt (salt$hash format detected)
[+] Salt appears to be: ${hash.split('$')[0]}
[+] Hash portion: ${hash.split('$')[1]}

Format: SALT$SHA256(salt + password)`;
            }

            return `Unable to identify hash format.
Length: ${hash.length} characters
Tip: MD5=32, SHA1=40, SHA256=64 hex chars`;
        },

        'python3': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('-c')) {
                const codeMatch = joined.match(/-c\s+["'](.+?)["']/);
                if (!codeMatch) return 'python3: error: argument -c: expected one argument';
                const code = codeMatch[1].toLowerCase();

                if (code.includes('md5') && code.includes('password123')) {
                    return '482c811da5d5b4bc6d497ffa98491e38\nMatch! admin hash confirmed.';
                }

                if (code.includes('sha256') && code.includes('hexsalt42')) {
                    return 'Computing SHA256(HEXSALT42 + password)...\nTesting common passwords from wordlist...';
                }

                if (code.includes('hashlib')) {
                    return 'hashlib module loaded. Use hashlib.md5(), hashlib.sha1(), hashlib.sha256()';
                }

                return 'python3: executed';
            }

            if (joined.includes('crack_helper')) {
                return 'Hash Cracking Helper loaded.\nUse check_md5() and check_sha256_salted() functions.\nExample: check_md5("password123", hashes["admin"]) => True';
            }

            return 'Python 3.11.6\nUsage: python3 [-c cmd | script.py]';
        },

        'grep': function(args, term, engine) {
            if (args.length < 2) return 'Usage: grep [options] PATTERN FILE';
            const pattern = args.find(a => !a.startsWith('-'));
            const file = args[args.length - 1];

            if (file.includes('vault_dump') && pattern) {
                const db = Crypto02Config._hashDb.accounts;
                const matches = db.filter(a =>
                    a.username.includes(pattern) || a.hash.includes(pattern) || a.role.toLowerCase().includes(pattern.toLowerCase())
                );
                if (matches.length > 0) {
                    return matches.map(a => `| ${a.username.padEnd(13)} | ${a.hash.padEnd(64)} | ${a.role.padEnd(13)} |`).join('\n');
                }
                return `grep: no match for '${pattern}'`;
            }

            return `grep: ${file}: No such file or directory`;
        },

        'nmap': function(args) {
            return 'This is a hash cracking challenge. No network targets.\nFocus on the files in ~/mission/';
        },

        'ping': function(args) {
            return 'This is a hash cracking challenge. No network targets.\nFocus on the files in ~/mission/';
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
