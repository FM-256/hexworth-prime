/* ============================================================
   CTF ARENA — Box A6: The Broken Cipher
   Weak Cryptography | Silent Cipher Order
   Config: crypto engine, web app, filesystem, flags, hints, lore
   ============================================================ */

const A6Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Broken Cipher',
    subtitle: 'Weak Cryptography — Silent Cipher Order',

    // Tutorial mode (AR-12)
    tutorialMode: true,
    tutorial: {
            "steps": [
                    {
                            "title": "Reconnaissance",
                            "tip": "Start by scanning the target with nmap to discover services and potential attack vectors.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "cmd": "contains:nmap"
                                    }
                            }
                    },
                    {
                            "title": "Explore the target",
                            "tip": "Investigate the services you found. Browse web apps, check service versions, read documentation.",
                            "trigger": {
                                    "event": "navigate",
                                    "alt": [
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "phase": "RECON"
                                                    }
                                            }
                                    ]
                            }
                    },
                    {
                            "title": "Find the vulnerability",
                            "tip": "Look for misconfigurations, weak inputs, or known CVEs in the services you discovered.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "phase": "EXPLOIT"
                                    }
                            }
                    },
                    {
                            "title": "Capture the user flag",
                            "tip": "Exploit the vulnerability to gain initial access and retrieve the user flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "user"
                                    }
                            }
                    },
                    {
                            "title": "Escalate to root",
                            "tip": "Use what you found to escalate privileges and capture the root flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "root"
                                    }
                            }
                    }
            ]
    },
    difficulty: 'Intermediate',
    accent: '#9b59b6',
    storageKey: 'hexworth_ctf_a6',
    registryId: 'a6-broken-cipher',
    trackerKey: 'ctf_a6',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Map the target\'s attack surface. Identify open ports, running services, and exposed web endpoints on the Silent Cipher Order platform.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1592.004'],
            unlocks: ['crypto_analysis'],
            locked: false
        },
        {
            id: 'crypto_analysis',
            name: 'Crypto Analysis',
            icon: '\uD83D\uDD13',
            description: 'Examine the encrypted message board. Identify which weak algorithms are in use — ROT13, Base64, and single-byte XOR — and analyze their ciphertexts.',
            requiredFlags: [],
            mitre: ['T1040', 'T1557', 'T1600'],
            unlocks: ['key_recovery'],
            locked: true
        },
        {
            id: 'key_recovery',
            name: 'Key Recovery / Cipher Break',
            icon: '\uD83D\uDDDD\uFE0F',
            description: 'Break each cipher to recover the API key and the XOR-encrypted user flag. Exploit the absence of computational hardness in all three algorithms.',
            requiredFlags: ['user'],
            mitre: ['T1557', 'T1573', 'T1600.001'],
            unlocks: ['data_decryption'],
            locked: true
        },
        {
            id: 'data_decryption',
            name: 'Data Decryption',
            icon: '\uD83D\uDCDC',
            description: 'Authenticate to the admin panel with the recovered API key, locate the vault master key on the server filesystem, and unseal the classified archives.',
            requiredFlags: ['root'],
            mitre: ['T1552', 'T1530', 'T1567'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze indicators of malicious activity — weak cipher identification', skill: 'Weak Cipher Identification' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks — cryptographic weaknesses', skill: 'Single-Byte XOR Decryption' },
            { flagId: 'user', objective: '2.3', description: 'Summarize various types of vulnerabilities — insecure cryptographic implementations', skill: 'ROT13 and Base64 Encoding Recognition' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze indicators of malicious activity — cryptographic key recovery', skill: 'Cryptographic Key Recovery' },
            { flagId: 'root', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks — API key exposure', skill: 'API Key Extraction from Encoded Messages' },
            { flagId: 'root', objective: '3.7', description: 'Explain the importance of cryptography and PKI — symmetric key weaknesses', skill: 'Symmetric Cipher Weakness Analysis' }
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
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.10.14.16 — The Silent Cipher Order messaging platform\n'
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
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 }   // 15 minutes
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: "Look at the encryption methods used. ROT13 and Base64 are trivially reversible — no key needed. Start with the messages labeled 'ROT13' and 'Base64'.",
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: "Message #3 contains a Base64-encoded API key. Try decoding: Q2lwaGVyS2V5OiBTMWwzbnRfMHJkM3I= — that decoded value (after 'CipherKey: ') is your admin panel password.",
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: "The XOR-encrypted message (#2) uses key 0x42. XOR every byte of the ciphertext with 0x42. The decryption oracle will handle this if you paste the hex: 37 31 27 30 62 24 2e 23 25 78 62 24 2e 23 25 39 31 73 2e 71 2c 36 1d 72 30 26 71 30 1d 21 30 76 21 29 71 26 1d 21 73 32 2a 71 30 3f",
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: "The admin panel at /cipher/admin/ reveals the vault location. Authenticate with the decoded API key. The vault master key IS the root flag — submit it directly.",
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Silent Cipher Order is a secretive collective that routes encrypted communications through a self-hosted messaging vault. Intelligence intercepts suggest they use legacy cipher algorithms — none of which provide real confidentiality. Your mission: penetrate their Cipher Vault, crack their weak cryptography, and extract the vault master key from their classified archives.',
        scenario: 'The Order\'s founding charter demanded encryption for all communications, but their Technical Warden implemented ROT13 and Base64 as their "encryption" suite in 2011 and never revisited the decision. A junior member pushed XOR as an "upgrade" in 2019, choosing a single-byte key of 0x42 — the ASCII code for \'B\'. All three algorithms were deployed side-by-side. No cryptographer was ever consulted. The API key was Base64-encoded and posted directly to the message board. "Security through obscurity," the Warden wrote in the deployment notes. "Only members know to look."',
        outro: "The Silent Cipher Order\'s encrypted communications have been laid bare. Their faith in ROT13 and Base64 — centuries weaker than what their name implies — proved their undoing. The vault master key is yours. The Order will reckon with this breach for years to come.",
        ecer: {
            executive: 'The Grand Cipher approved the "encryption" suite without consulting a cryptographer. Leadership conflated encoding with encryption and treated obscurity as an acceptable security posture — a decision that left all Order communications trivially readable to any attacker who found the platform',
            culture: 'No cryptographic review process existed. The team promoted algorithms by seniority and familiarity rather than by security analysis. ROT13 and Base64 were never questioned because they had always been used — cargo-cult security at its most literal',
            employee: 'The Technical Warden implemented ROT13 and Base64 as encryption primitives. A junior member introduced single-byte XOR without key management. The API key was Base64-encoded and published on the message board with no access control, treating encoding as protection',
            regulatory: 'No compliance framework (NIST SP 800-111, FIPS 140-3, or PCI-DSS) was applied to the communication platform. All three algorithms fail every modern cryptographic standard: ROT13 and Base64 provide zero confidentiality, and single-byte XOR is broken by trivial frequency analysis — none would survive a cursory cryptographic audit'
        }
    },

    // ═══════════════════════════════════════════════════════
    // CRYPTO DATA — message board content and known ciphertexts
    // ═══════════════════════════════════════════════════════

    _crypto: {
        // ROT13 of: "The admin API key is encoded in message number three"
        rot13Ciphertext: 'Gur nqzva NCV xrl vf rapbqrq va zrffntr ahzore guerr',

        // Base64 of: "CipherKey: S1l3nt_0rd3r" — also the admin API key header
        b64ApiKey: 'Q2lwaGVyS2V5OiBTMWwzbnRfMHJkM3I=',

        // XOR 0x42 hex bytes — decodes to: "user flag: flag{s1l3nt_0rd3r_cr4ck3d_c1ph3r}"
        // Generated: each char.charCodeAt(0) ^ 0x42 as two-digit hex
        xorHex: '37 31 27 30 62 24 2e 23 25 78 62 24 2e 23 25 39 31 73 2e 71 2c 36 1d 72 30 26 71 30 1d 21 30 76 21 29 71 26 1d 21 73 32 2a 71 30 3f',

        // Decoded values
        rot13Decoded:   'The admin API key is encoded in message number three',
        b64Decoded:     'CipherKey: S1l3nt_0rd3r',
        xorDecoded:     'user flag: flag{s1l3nt_0rd3r_cr4ck3d_c1ph3r}',

        // The raw API key (after stripping "CipherKey: ")
        apiKey: 'S1l3nt_0rd3r',

        // Vault master key = root flag
        vaultMasterKey: 'flag{br0k3n_c1ph3r_v4ult_m4st3r}'
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — The Cipher Vault (3 pages)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.16/cipher/',

        pages: {

            // ── PAGE 1: Encrypted Messages Board ──────────────────
            '/cipher/': {
                title: 'Cipher Vault — Message Board',
                html: `
                    <div style="background:linear-gradient(135deg,#1a0a2e 0%,#2d1b4e 100%); margin:-20px -20px 20px; padding:20px 24px; border-bottom:2px solid #9b59b6;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span style="font-size:1.8rem;"><img src="/assets/images/icons/icon-padlock.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span>
                            <div>
                                <h1 style="color:#d7b4f5; font-size:1.3rem; font-family:Georgia,serif; margin:0 0 2px;">The Cipher Vault</h1>
                                <div style="color:#9b59b6; font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase;">Silent Cipher Order — Encrypted Communications Board v1.4.2</div>
                            </div>
                        </div>
                    </div>

                    <!-- Nav -->
                    <div style="display:flex; gap:8px; margin-bottom:20px;">
                        <span style="padding:5px 14px; background:#9b59b6; color:#fff; border-radius:4px; font-size:0.75rem; font-weight:700;">Messages</span>
                        <a data-link="/cipher/admin/" style="padding:5px 14px; background:#2d1b4e; color:#9b59b6; border-radius:4px; font-size:0.75rem; cursor:pointer; text-decoration:none; border:1px solid #4a2d7a;">Admin Panel</a>
                        <a data-link="/cipher/vault/" style="padding:5px 14px; background:#2d1b4e; color:#9b59b6; border-radius:4px; font-size:0.75rem; cursor:pointer; text-decoration:none; border:1px solid #4a2d7a;">Vault</a>
                    </div>

                    <!-- Messages list -->
                    <div style="display:flex; flex-direction:column; gap:14px; margin-bottom:28px;">

                        <!-- Message 1: ROT13 -->
                        <div style="background:#1a0a2e; border:1px solid #4a2d7a; border-left:3px solid #e74c3c; border-radius:6px; padding:14px 16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <span style="color:#e74c3c; font-size:0.72rem; font-weight:700; letter-spacing:0.08em;">MESSAGE #1 — CIPHER: ROT13</span>
                                <span style="color:#666; font-size:0.68rem;">From: <strong style="color:#aaa;">cipher_warden</strong> &nbsp;&bull;&nbsp; 2026-02-14 09:17</span>
                            </div>
                            <p style="color:#c9a0e0; font-family:monospace; font-size:0.82rem; margin:0 0 8px; word-break:break-all;">Gur nqzva NCV xrl vf rapbqrq va zrffntr ahzore guerr</p>
                            <div style="color:#666; font-size:0.68rem; font-style:italic;">[ Encrypted with ROT13. Paste into the decryption oracle below to reveal. ]</div>
                        </div>

                        <!-- Message 2: XOR 0x42 hex -->
                        <div style="background:#1a0a2e; border:1px solid #4a2d7a; border-left:3px solid #f39c12; border-radius:6px; padding:14px 16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <span style="color:#f39c12; font-size:0.72rem; font-weight:700; letter-spacing:0.08em;">MESSAGE #2 — CIPHER: XOR-42 (HEX ENCODED)</span>
                                <span style="color:#666; font-size:0.68rem;">From: <strong style="color:#aaa;">hex_phantom</strong> &nbsp;&bull;&nbsp; 2026-02-14 11:42</span>
                            </div>
                            <!-- XOR(0x42) hex of: "user flag: flag{s1l3nt_0rd3r_cr4ck3d_c1ph3r}" -->
                            <p style="color:#c9a0e0; font-family:monospace; font-size:0.78rem; margin:0 0 8px; word-break:break-all;">37 31 27 30 62 24 2e 23 25 78 62 24 2e 23 25 39 31 73 2e 71 2c 36 1d 72 30 26 71 30 1d 21 30 76 21 29 71 26 1d 21 73 32 2a 71 30 3f</p>
                            <!-- XOR key visible in page source comment -->
                            <!-- XOR KEY: 0x42 — apply to each hex byte to recover plaintext -->
                            <div style="color:#666; font-size:0.68rem; font-style:italic;">[ Hex-encoded XOR ciphertext. Check the page source for the key. ]</div>
                        </div>

                        <!-- Message 3: Base64 API key leak -->
                        <div style="background:#1a0a2e; border:1px solid #4a2d7a; border-left:3px solid #3498db; border-radius:6px; padding:14px 16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <span style="color:#3498db; font-size:0.72rem; font-weight:700; letter-spacing:0.08em;">MESSAGE #3 — CIPHER: BASE64</span>
                                <span style="color:#666; font-size:0.68rem;">From: <strong style="color:#aaa;">key_herald</strong> &nbsp;&bull;&nbsp; 2026-02-14 14:03</span>
                            </div>
                            <p style="color:#c9a0e0; font-family:monospace; font-size:0.82rem; margin:0 0 8px; word-break:break-all;">Q2lwaGVyS2V5OiBTMWwzbnRfMHJkM3I=</p>
                            <div style="color:#666; font-size:0.68rem; font-style:italic;">[ Encoded with Base64. Any standard decoder will reveal this message. ]</div>
                        </div>

                        <!-- Message 4: Plaintext (teaser / lore) -->
                        <div style="background:#1a0a2e; border:1px solid #4a2d7a; border-left:3px solid #2ecc71; border-radius:6px; padding:14px 16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <span style="color:#2ecc71; font-size:0.72rem; font-weight:700; letter-spacing:0.08em;">MESSAGE #4 — CIPHER: NONE (PLAINTEXT)</span>
                                <span style="color:#666; font-size:0.68rem;">From: <strong style="color:#aaa;">grand_cipher</strong> &nbsp;&bull;&nbsp; 2026-02-15 07:00</span>
                            </div>
                            <p style="color:#c9a0e0; font-size:0.82rem; margin:0 0 8px;">Brothers and sisters of the Order: the vault holds our most sacred archives. Only those who carry the master key may look upon its contents. Guard your keys. Trust no algorithm you did not forge yourself.</p>
                            <div style="color:#666; font-size:0.68rem; font-style:italic;">[ Unencrypted announcement from the Grand Cipher. ]</div>
                        </div>

                    </div>

                    <!-- Decryption Oracle -->
                    <div style="background:#120820; border:1px solid #4a2d7a; border-radius:8px; padding:18px;">
                        <div style="color:#9b59b6; font-size:0.78rem; font-weight:700; letter-spacing:0.1em; margin-bottom:12px; text-transform:uppercase;">&#9670; Decryption Oracle</div>
                        <div style="color:#888; font-size:0.72rem; margin-bottom:12px;">Paste any ciphertext from the messages above. The oracle will attempt decryption using all registered algorithms.</div>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <textarea data-field="ciphertext" rows="3" placeholder="Paste ciphertext here..."
                                      style="width:100%; padding:8px 12px; background:#1a0a2e; border:1px solid #4a2d7a; border-radius:4px; color:#c9a0e0; font-family:monospace; font-size:0.8rem; resize:vertical; box-sizing:border-box;"></textarea>
                            <button data-action="decrypt"
                                    style="align-self:flex-start; padding:8px 22px; background:#9b59b6; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; font-size:0.82rem; cursor:pointer;">Decrypt</button>
                        </div>
                        <div data-results style="margin-top:12px;"></div>
                    </div>
                `,
                // formHandler: decrypt oracle
                formHandler: function(data, engine) {
                    return A6Config._handleDecrypt(data.ciphertext || '', engine);
                }
            },

            // ── PAGE 2: Admin Panel (API key gate) ────────────────
            '/cipher/admin/': {
                title: 'Cipher Vault — Admin Panel',
                html: `
                    <div style="background:linear-gradient(135deg,#1a0a2e 0%,#2d1b4e 100%); margin:-20px -20px 20px; padding:20px 24px; border-bottom:2px solid #9b59b6;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span style="font-size:1.8rem;"><img src="/assets/images/icons/icon-padlock.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span>
                            <div>
                                <h1 style="color:#d7b4f5; font-size:1.3rem; font-family:Georgia,serif; margin:0 0 2px;">Admin Panel</h1>
                                <div style="color:#9b59b6; font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase;">Silent Cipher Order — Restricted Access</div>
                            </div>
                        </div>
                    </div>

                    <!-- Nav -->
                    <div style="display:flex; gap:8px; margin-bottom:20px;">
                        <a data-link="/cipher/" style="padding:5px 14px; background:#2d1b4e; color:#9b59b6; border-radius:4px; font-size:0.75rem; cursor:pointer; text-decoration:none; border:1px solid #4a2d7a;">Messages</a>
                        <span style="padding:5px 14px; background:#9b59b6; color:#fff; border-radius:4px; font-size:0.75rem; font-weight:700;">Admin Panel</span>
                        <a data-link="/cipher/vault/" style="padding:5px 14px; background:#2d1b4e; color:#9b59b6; border-radius:4px; font-size:0.75rem; cursor:pointer; text-decoration:none; border:1px solid #4a2d7a;">Vault</a>
                    </div>

                    <div style="max-width:480px; margin:0 auto;">
                        <div style="background:#1a0a2e; border:1px solid #4a2d7a; border-radius:8px; padding:24px;">
                            <div style="text-align:center; margin-bottom:20px;">
                                <div style="font-size:2rem; margin-bottom:8px;"><img src="/assets/images/icons/icon-unlock.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></div>
                                <div style="color:#d7b4f5; font-weight:700; margin-bottom:4px;">API Key Required</div>
                                <div style="color:#777; font-size:0.75rem;">This panel requires a valid Cipher Order API key.</div>
                            </div>
                            <label style="display:block; color:#9b59b6; font-size:0.75rem; font-weight:700; margin-bottom:6px; letter-spacing:0.05em;">API KEY</label>
                            <input type="password" data-field="apikey" placeholder="Enter API key..."
                                   style="width:100%; padding:9px 14px; background:#120820; border:1px solid #4a2d7a; border-radius:4px; color:#c9a0e0; font-family:monospace; font-size:0.85rem; margin-bottom:12px; box-sizing:border-box;">
                            <button data-action="login"
                                    style="width:100%; padding:10px; background:#9b59b6; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; font-size:0.85rem; cursor:pointer;">Authenticate</button>
                            <div data-results style="margin-top:12px;"></div>
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return A6Config._handleAdminAuth(data.apikey || '', engine);
                }
            },

            // ── PAGE 3: The Vault (master key gate) ───────────────
            '/cipher/vault/': {
                title: 'Cipher Vault — The Vault',
                html: `
                    <div style="background:linear-gradient(135deg,#1a0a2e 0%,#2d1b4e 100%); margin:-20px -20px 20px; padding:20px 24px; border-bottom:2px solid #9b59b6;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span style="font-size:1.8rem;"><img src="/assets/images/icons/icon-scroll.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span>
                            <div>
                                <h1 style="color:#d7b4f5; font-size:1.3rem; font-family:Georgia,serif; margin:0 0 2px;">The Vault</h1>
                                <div style="color:#9b59b6; font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase;">Silent Cipher Order — Sacred Archives</div>
                            </div>
                        </div>
                    </div>

                    <!-- Nav -->
                    <div style="display:flex; gap:8px; margin-bottom:20px;">
                        <a data-link="/cipher/" style="padding:5px 14px; background:#2d1b4e; color:#9b59b6; border-radius:4px; font-size:0.75rem; cursor:pointer; text-decoration:none; border:1px solid #4a2d7a;">Messages</a>
                        <a data-link="/cipher/admin/" style="padding:5px 14px; background:#2d1b4e; color:#9b59b6; border-radius:4px; font-size:0.75rem; cursor:pointer; text-decoration:none; border:1px solid #4a2d7a;">Admin Panel</a>
                        <span style="padding:5px 14px; background:#9b59b6; color:#fff; border-radius:4px; font-size:0.75rem; font-weight:700;">Vault</span>
                    </div>

                    <div style="max-width:480px; margin:0 auto;">
                        <div style="background:#1a0a2e; border:1px solid #4a2d7a; border-radius:8px; padding:24px;">
                            <div style="text-align:center; margin-bottom:20px;">
                                <div style="font-size:2rem; margin-bottom:8px;"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></div>
                                <div style="color:#d7b4f5; font-weight:700; margin-bottom:4px;">Vault Master Key Required</div>
                                <div style="color:#777; font-size:0.75rem;">The vault master key is stored at <code style="color:#9b59b6; background:#120820; padding:2px 6px; border-radius:3px;">/vault/master.key</code> on the server.</div>
                            </div>
                            <label style="display:block; color:#9b59b6; font-size:0.75rem; font-weight:700; margin-bottom:6px; letter-spacing:0.05em;">VAULT MASTER KEY</label>
                            <input type="password" data-field="masterkey" placeholder="Enter vault master key..."
                                   style="width:100%; padding:9px 14px; background:#120820; border:1px solid #4a2d7a; border-radius:4px; color:#c9a0e0; font-family:monospace; font-size:0.85rem; margin-bottom:12px; box-sizing:border-box;">
                            <button data-action="unlock"
                                    style="width:100%; padding:10px; background:#9b59b6; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; font-size:0.85rem; cursor:pointer;">Open Vault</button>
                            <div data-results style="margin-top:12px;"></div>
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return A6Config._handleVaultUnlock(data.masterkey || '', engine);
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // CRYPTO ENGINE — Decryption Oracle
    // ═══════════════════════════════════════════════════════

    _handleDecrypt(input, engine) {
        const trimmed = input.trim();
        if (!trimmed) {
            return '<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:10px; font-size:0.8rem;">Error: No input provided. Paste a ciphertext from the messages above.</div>';
        }

        // ── ROT13 match ──
        if (trimmed === A6Config._crypto.rot13Ciphertext) {
            return A6Config._oracleResult(
                'ROT13',
                'Cipher identified: ROT13 (Caesar-13)',
                A6Config._crypto.rot13Decoded,
                '#e74c3c',
                'ROT13 is its own inverse — apply it twice to get back the original. This is security theater, not encryption. Every character simply rotates 13 positions in the alphabet.'
            );
        }

        // ── Base64 match ──
        if (trimmed === A6Config._crypto.b64ApiKey) {
            return A6Config._oracleResult(
                'BASE64',
                'Cipher identified: Base64 encoding',
                A6Config._crypto.b64Decoded,
                '#3498db',
                'Base64 is encoding, not encryption. It has no key and provides zero confidentiality — any online decoder or the base64 command-line tool decodes it instantly.'
            );
        }

        // ── XOR hex match (exact or close variants — normalize spaces) ──
        const xorNorm = trimmed.replace(/\s+/g, ' ').toLowerCase();
        const xorTarget = A6Config._crypto.xorHex.toLowerCase();
        if (xorNorm === xorTarget) {
            return A6Config._oracleResult(
                'XOR-42',
                'Cipher identified: XOR with key 0x42',
                A6Config._crypto.xorDecoded,
                '#f39c12',
                'Single-byte XOR is cryptographically broken. With a known key (0x42 = \'B\'), XOR is just as easy to reverse as apply. Even without the key, frequency analysis on repeating bytes reveals it in seconds.'
            );
        }

        // ── Partial ROT13 (any ROT13 input) ──
        const asRot13 = A6Config._rot13(trimmed);
        if (/[a-zA-Z]/.test(trimmed) && asRot13 !== trimmed) {
            return `<div style="background:#1a0a2e; border:1px solid #4a2d7a; border-radius:6px; padding:14px; font-size:0.8rem;">
                <div style="color:#e74c3c; font-weight:700; margin-bottom:6px;">&#9679; Attempting ROT13...</div>
                <div style="color:#c9a0e0; font-family:monospace; word-break:break-all;">${A6Config._escHtml(asRot13)}</div>
                <div style="color:#666; font-size:0.72rem; margin-top:8px; font-style:italic;">ROT13 applied. If this doesn't look right, the input may use a different cipher.</div>
            </div>`;
        }

        // ── Base64 attempt ──
        if (/^[A-Za-z0-9+/]+=*$/.test(trimmed)) {
            try {
                const decoded = atob(trimmed);
                if (decoded && /[\x20-\x7e]/.test(decoded)) {
                    return `<div style="background:#1a0a2e; border:1px solid #4a2d7a; border-radius:6px; padding:14px; font-size:0.8rem;">
                        <div style="color:#3498db; font-weight:700; margin-bottom:6px;">&#9679; Attempting Base64 decode...</div>
                        <div style="color:#c9a0e0; font-family:monospace; word-break:break-all;">${A6Config._escHtml(decoded)}</div>
                        <div style="color:#666; font-size:0.72rem; margin-top:8px; font-style:italic;">Decoded as Base64. Printable characters detected.</div>
                    </div>`;
                }
            } catch(e) { /* not valid base64 */ }
        }

        // ── XOR attempt on hex input ──
        if (/^([0-9a-f]{2}\s*)+$/i.test(trimmed)) {
            const bytes = trimmed.match(/[0-9a-f]{2}/gi) || [];
            const xorResult = bytes.map(b => String.fromCharCode(parseInt(b, 16) ^ 0x42)).join('');
            if (/[\x20-\x7e]/.test(xorResult)) {
                return `<div style="background:#1a0a2e; border:1px solid #4a2d7a; border-radius:6px; padding:14px; font-size:0.8rem;">
                    <div style="color:#f39c12; font-weight:700; margin-bottom:6px;">&#9679; Hex input detected — attempting XOR with key 0x42...</div>
                    <div style="color:#c9a0e0; font-family:monospace; word-break:break-all;">${A6Config._escHtml(xorResult)}</div>
                    <div style="color:#666; font-size:0.72rem; margin-top:8px; font-style:italic;">XOR(0x42) applied to each byte. Printable output detected.</div>
                </div>`;
            }
        }

        // ── Unknown cipher ──
        return `<div style="background:#1a0a2e; border:1px solid rgba(155,89,182,0.3); border-radius:6px; padding:14px; font-size:0.8rem;">
            <div style="color:#9b59b6; font-weight:700; margin-bottom:6px;">&#9679; Oracle Result: Unknown Cipher</div>
            <div style="color:#888;">The oracle could not identify this ciphertext. Try pasting the exact text from one of the messages above. Supported ciphers: ROT13, Base64, XOR (hex).</div>
        </div>`;
    },

    // Oracle result card (colored, with educational note)
    _oracleResult(cipherName, heading, decoded, color, insight) {
        return `<div style="background:#1a0a2e; border:1px solid ${color}40; border-left:3px solid ${color}; border-radius:6px; padding:16px; font-size:0.8rem;">
            <div style="color:${color}; font-weight:700; font-size:0.72rem; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:8px;">&#9670; ${heading}</div>
            <div style="color:#2ecc71; font-family:monospace; font-size:0.85rem; background:#0d1f0d; border:1px solid rgba(46,204,113,0.2); border-radius:4px; padding:10px; margin-bottom:10px; word-break:break-all;">${A6Config._escHtml(decoded)}</div>
            <div style="color:#888; font-size:0.72rem; font-style:italic; border-top:1px solid #2d1b4e; padding-top:8px;">
                <strong style="color:#9b59b6;">Crypto Insight:</strong> ${insight}
            </div>
        </div>`;
    },

    // ═══════════════════════════════════════════════════════
    // ADMIN AUTH — API key gate
    // ═══════════════════════════════════════════════════════

    _handleAdminAuth(key, engine) {
        const cleaned = key.trim();
        if (!cleaned) {
            return '<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:10px; font-size:0.8rem;">Error: API key required.</div>';
        }

        if (cleaned === A6Config._crypto.apiKey) {
            // Correct key — reveal the admin panel contents
            return `<div style="background:#0d1a0d; border:1px solid rgba(46,204,113,0.3); border-radius:8px; padding:16px; font-size:0.8rem;">
                <div style="color:#2ecc71; font-weight:700; margin-bottom:14px; font-size:0.85rem;">&#10003; Authentication successful — Welcome, Cipher Administrator</div>

                <!-- Member roster -->
                <div style="margin-bottom:16px;">
                    <div style="color:#9b59b6; font-size:0.72rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:8px;">Active Members</div>
                    ${A6Config._tableHtml(
                        ['Alias', 'Role', 'Status', 'Clearance'],
                        [
                            ['grand_cipher',  'Grand Master',    'Active', 'Level 5'],
                            ['cipher_warden', 'Warden',         'Active', 'Level 4'],
                            ['hex_phantom',   'Cryptographer',  'Active', 'Level 3'],
                            ['key_herald',    'Herald',         'Active', 'Level 2'],
                            ['novice_veil',   'Novice',         'Active', 'Level 1']
                        ]
                    )}
                </div>

                <!-- Vault Key info -->
                <div style="background:#1a0a2e; border:1px solid #4a2d7a; border-radius:6px; padding:12px; margin-bottom:12px;">
                    <div style="color:#f39c12; font-size:0.72rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Vault Access</div>
                    <div style="color:#c9a0e0; font-size:0.8rem; margin-bottom:6px;">The master vault key is stored at <code style="color:#9b59b6; background:#120820; padding:2px 6px; border-radius:3px;">/vault/master.key</code> on the server filesystem.</div>
                    <div style="color:#888; font-size:0.72rem;">To access the vault: navigate to <strong style="color:#9b59b6;">/cipher/vault/</strong> and enter the master key. Retrieve the master key from the server path above or from the Grand Cipher directly.</div>
                </div>

                <a data-link="/cipher/vault/"
                   style="display:inline-block; padding:8px 18px; background:#9b59b6; color:#fff; border-radius:4px; font-size:0.78rem; font-weight:700; cursor:pointer; text-decoration:none;">
                    Go to Vault &rarr;
                </a>
            </div>`;
        }

        // Wrong key
        return `<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:10px; font-size:0.8rem;">
            <strong>401 Unauthorized:</strong> Invalid API key. Check your credentials.
        </div>`;
    },

    // ═══════════════════════════════════════════════════════
    // VAULT UNLOCK — master key gate
    // ═══════════════════════════════════════════════════════

    _handleVaultUnlock(key, engine) {
        const cleaned = key.trim();
        if (!cleaned) {
            return '<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:10px; font-size:0.8rem;">Error: Vault master key required.</div>';
        }

        if (cleaned === A6Config._crypto.vaultMasterKey) {
            return `<div style="background:#0d1a0d; border:1px solid rgba(46,204,113,0.3); border-radius:8px; padding:16px; font-size:0.8rem;">
                <div style="color:#2ecc71; font-weight:700; margin-bottom:14px; font-size:0.85rem;"><img src="/assets/images/icons/icon-scroll.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> VAULT UNSEALED — Classified Archives Revealed</div>

                <div style="background:#1a0a2e; border:1px solid #4a2d7a; border-radius:6px; padding:14px; margin-bottom:12px;">
                    <div style="color:#9b59b6; font-size:0.72rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:8px;">Sacred Archives — Order Communications</div>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <div style="border-bottom:1px solid #2d1b4e; padding-bottom:10px;">
                            <div style="color:#d7b4f5; font-size:0.75rem; font-weight:700; margin-bottom:4px;">FOUNDING CHARTER — Year Zero</div>
                            <div style="color:#888; font-size:0.78rem;">We, the founders of the Silent Cipher Order, declare that all communications shall be encrypted. Let no plaintext survive in our records. The cipher is our bond, our identity, our law.</div>
                        </div>
                        <div style="border-bottom:1px solid #2d1b4e; padding-bottom:10px;">
                            <div style="color:#d7b4f5; font-size:0.75rem; font-weight:700; margin-bottom:4px;">KEY ROTATION MEMO — Cycle 47</div>
                            <div style="color:#888; font-size:0.78rem;">Effective immediately, the Order transitions from ROT13 to our new standard. All members are reminded that Base64 is ENCODING, not encryption. This memo itself is transmitted in plaintext as an ironic exercise in trust.</div>
                        </div>
                        <div>
                            <div style="color:#2ecc71; font-size:0.75rem; font-weight:700; margin-bottom:4px;">MASTER VAULT KEY (THIS DOCUMENT)</div>
                            <div style="color:#2ecc71; font-family:monospace; font-size:0.85rem; background:#0d1f0d; border:1px solid rgba(46,204,113,0.2); border-radius:4px; padding:8px;">${A6Config._escHtml(A6Config._crypto.vaultMasterKey)}</div>
                        </div>
                    </div>
                </div>

                <div style="color:#666; font-size:0.72rem; font-style:italic;">The vault has been breached. All classified Order archives are now accessible.</div>
            </div>`;
        }

        return `<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:10px; font-size:0.8rem;">
            <strong>Access Denied:</strong> Invalid vault master key. The vault remains sealed.
        </div>`;
    },

    // ═══════════════════════════════════════════════════════
    // ROT13 HELPER — pure JS, no DOM
    // ═══════════════════════════════════════════════════════

    _rot13(str) {
        return str.replace(/[a-zA-Z]/g, function(c) {
            const base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — Kali)
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
                                    content: '=== MISSION BRIEFING ===\nTarget: 10.10.14.16 (The Silent Cipher Order)\nObjective: Exploit weak cryptography in their messaging platform\n\nIntel:\n- Target is running an encrypted communications board\n- Known weak ciphers in use: ROT13, Base64, XOR with single-byte key\n- Admin panel protected by an API key — reportedly embedded in the messages\n- A vault holds classified archives behind a master key\n\nRecon steps:\n1. nmap scan to identify open services\n2. Browse http://10.10.14.16/cipher/ — read the messages\n3. Use the decryption oracle or your tools to crack each cipher\n4. Decode the Base64 API key and authenticate to /cipher/admin/\n5. Follow the admin panel clues to the vault master key (root flag)\n\nGood luck, operator.'
                                },
                                'decoys': {
                                    type: 'dir',
                                    children: {
                                        'intercepted_key.bin': {
                                            type: 'file',
                                            content: '[ Binary blob — 256 bytes ]\n\n00000000: d4 3f 8a 11 bc 7e 29 f0 a3 55 6d 2c 91 e8 04 7b\n00000010: 3a b6 c5 08 74 de 5f 12 a9 60 fb 3d 88 27 4e c1\n00000020: 57 9e 06 bb 43 17 e2 8c 7f 2a d0 95 61 f4 1b 39\n...\n[NOTE: This was intercepted from the target. AES-256-CBC suspected. Requires key — probably not the right approach. The Order doesn\'t use AES internally.]'
                                        },
                                        'order_cert.pem': {
                                            type: 'file',
                                            content: '-----BEGIN CERTIFICATE-----\nMIICpDCCAYwCCQDK2f4Zr8xTlDANBgkqhkiG9w0BAQsFADAUMRIwEAYDVQQDDAls\nb2NhbGhvc3QwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjAUMRIwEAYD\nVQQDDAlsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7\n[...truncated — 2048-bit RSA — Silent Cipher Order self-signed cert]\n-----END CERTIFICATE-----\n\n[RED HERRING: This is the TLS certificate from port 443. It does not contain the master key. O=Silent Cipher Order, CN=cipher-vault.ctf.local]'
                                        },
                                        'aes_attempt.txt': {
                                            type: 'file',
                                            content: '# Failed AES decryption attempts — do NOT waste time here\n# The Order does NOT use AES. Their crypto suite is:\n#   - ROT13 (Caesar-13)\n#   - Base64 (encoding, not encryption)\n#   - XOR single-byte\n# All three are trivially reversible without a strong key.\n# The vault master key is NOT encrypted with AES.\n# Focus on the message board at http://10.10.14.16/cipher/'
                                        },
                                        'fake_flag.txt': {
                                            type: 'file',
                                            content: 'flag{th1s_1s_n0t_th3_r34l_fl4g_k33p_l00k1ng}\n\n[This stub was planted by a previous operator. Do not submit — it will score zero.\nThe real flags are inside the Cipher Vault web application.]'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'rot13.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# ROT13 decoder/encoder\nimport codecs\nimport sys\n\nif len(sys.argv) < 2:\n    print("Usage: python3 rot13.py \'<ciphertext>\'")\n    sys.exit(1)\n\nciphertext = sys.argv[1]\nplaintext  = codecs.decode(ciphertext, "rot_13")\nprint("ROT13 result:", plaintext)'
                                        },
                                        'b64decode.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Base64 decoder one-liner\n# Usage: ./b64decode.sh "BASE64STRING"\n# Or:    echo "BASE64STRING" | base64 -d\n\necho "$1" | base64 -d\necho'
                                        },
                                        'xor_decrypt.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# XOR decryption with a single-byte key\n# Usage: python3 xor_decrypt.py "<hex_bytes>" <key_hex>\n# Example: python3 xor_decrypt.py "26 07 15 11" 0x42\n\nimport sys\n\nif len(sys.argv) < 3:\n    print("Usage: python3 xor_decrypt.py \'<hex bytes>\' <key>")\n    sys.exit(1)\n\nhex_str = sys.argv[1]\nkey     = int(sys.argv[2], 16)\n\nbytes_  = bytes(int(b, 16) for b in hex_str.split())\nresult  = bytes(b ^ key for b in bytes_)\nprint("Decrypted:", result.decode("utf-8", errors="replace"))'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.10.14.16\ncurl http://10.10.14.16/cipher/\nfirefox http://10.10.14.16/cipher/\npython3 tools/rot13.py\nbase64 -d <<< "Q2lwaGVyS2V5OiBTMWwzbnRfMHJkM3I="'
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
                },
                'vault': {
                    // Decoy server-side vault directory (mirrored on attacker box for reference)
                    // Real vault master key is served via the web app at /cipher/vault/
                    type: 'dir',
                    children: {
                        'key_archive': {
                            type: 'dir',
                            children: {
                                'key_2022.enc': {
                                    type: 'file',
                                    content: '[ Encrypted — legacy key from 2022 rotation cycle ]\nCipher: XOR-0x19 (deprecated)\nBytes: 2f 58 4b 61 74 1f 60 4b 7e 1f 60 67 1f 4b 65 71\n\n[DECOY: This is the 2022 key rotation artifact. It decrypts to "Old_Key_R0t4t10n" — not the current master key. The live vault uses a different key entirely.]'
                                },
                                'key_2023.enc': {
                                    type: 'file',
                                    content: '[ Encrypted — 2023 rotation cycle — XOR-0x35 ]\nBytes: 7f 57 46 3d 4b 56 72 57 41 3d 53 72 57 40 4b\n\n[DECOY: Decodes to "Cycle47_MasterK" — this was the key used during Cycle 47 memo referenced on the vault page. No longer valid — the Order rotated again.]'
                                }
                            }
                        },
                        'master.key.bak': {
                            type: 'file',
                            content: '[ BACKUP — DO NOT USE — superseded 2026-01-01 ]\nflag{0ld_v4ult_k3y_n0t_v4l1d_4nym0r3}\n\n[DECOY: This backup key was invalidated after the January rotation. The current master key must be retrieved via the web vault interface — the admin panel reveals where.]'
                        },
                        'README.txt': {
                            type: 'file',
                            content: '=== VAULT KEY MANAGEMENT ===\nGenerated by: vault-keyd v3.1 (Silent Cipher Order internal tool)\n\nDirectory layout:\n  master.key     — LIVE key (rotated quarterly, access-controlled)\n  master.key.bak — Previous key (invalidated, kept 90 days then purged)\n  key_archive/   — Historical rotation records (XOR-encrypted, keys in KMS)\n\nIMPORTANT: master.key is NOT stored in plaintext on disk.\nIt is rendered only through the authenticated vault web interface.\nAccess path: http://10.10.14.16/cipher/vault/\nAuthentication: Requires valid admin API key from /cipher/admin/'
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

        // ── nmap — show open ports on target ──
        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.10.14.16';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target || target === '10.10.14.16') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.16
Host is up (0.028s latency).
Not shown: 998 closed tcp ports

PORT    STATE SERVICE  VERSION
80/tcp  open  http     Apache httpd 2.4.57
443/tcp open  ssl/http Apache httpd 2.4.57 (self-signed cert)
|_ssl-cert: WARNING — self-signed certificate (O=Silent Cipher Order)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.14 seconds`;
            }
            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00009s latency).
All 1000 scanned ports on localhost are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        // ── curl — fetch cipher vault pages ──
        'curl': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.10.14.16')) {

                // Admin panel with API key in query string
                if (url.includes('/cipher/admin/') && url.includes('key=')) {
                    const keyMatch = url.match(/key=([^&\s"']+)/);
                    const key = keyMatch ? decodeURIComponent(keyMatch[1]) : '';
                    if (key === A6Config._crypto.apiKey) {
                        return `HTTP/1.1 200 OK
Content-Type: text/html

[Admin panel authenticated]
Active members: grand_cipher, cipher_warden, hex_phantom, key_herald, novice_veil
Vault location: /vault/master.key
Navigate to /cipher/vault/ and enter the master key to access classified archives.`;
                    }
                    return `HTTP/1.1 401 Unauthorized
Content-Type: text/html

[Admin panel] 401 Unauthorized — invalid API key`;
                }

                // Admin panel (no key) — returns the auth form
                if (url.includes('/cipher/admin/')) {
                    return `HTTP/1.1 200 OK
Content-Type: text/html

[Cipher Vault — Admin Panel]
API Key Required. This panel requires a valid Cipher Order API key.
Hint: The API key is embedded somewhere in the messages board.`;
                }

                // Vault page
                if (url.includes('/cipher/vault/')) {
                    return `HTTP/1.1 200 OK
Content-Type: text/html

[Cipher Vault — The Vault]
Vault Master Key Required.
Key location: /vault/master.key (server filesystem)`;
                }

                // Main messages board
                if (url.includes('/cipher/')) {
                    return `HTTP/1.1 200 OK
Content-Type: text/html

[Cipher Vault — Message Board]
4 messages found:
  #1 ROT13:   Gur nqzva NCV xrl vf rapbqrq va zrffntr ahzore guerr
  #2 XOR-42:  37 31 27 30 62 24 2e 23 25 78 62 24 2e 23 25 39 31 73 2e 71 2c 36 1d 72 30 26 71 30 1d 21 30 76 21 29 71 26 1d 21 73 32 2a 71 30 3f
  #3 Base64:  Q2lwaGVyS2V5OiBTMWwzbnRfMHJkM3I=
  #4 PLAIN:   Brothers and sisters of the Order: the vault holds our most sacred archives...

<!-- XOR KEY: 0x42 — apply to each hex byte to recover plaintext -->`;
                }
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        // ── base64 — encode/decode command ──
        'base64': function(args, term, engine) {
            const decode = args.includes('-d') || args.includes('--decode');
            // Find the input string — either piped via <<< or direct arg
            const hereString = args.find(a => a.startsWith('<<<'));
            let input = '';
            if (hereString) {
                input = hereString.replace(/^<<<\s*"?/, '').replace(/"$/, '').trim();
            } else {
                input = args.find(a => !a.startsWith('-')) || '';
            }

            if (!input) return 'Usage: base64 [-d] [string]\n  -d    Decode mode\nExample: base64 -d <<< "Q2lwaGVyS2V5OiBTMWwzbnRfMHJkM3I="';

            if (decode) {
                // Simulate decoding
                if (input === A6Config._crypto.b64ApiKey || input === 'Q2lwaGVyS2V5OiBTMWwzbnRfMHJkM3I=') {
                    return A6Config._crypto.b64Decoded;
                }
                try {
                    const decoded = atob(input.replace(/\s/g, ''));
                    return decoded;
                } catch(e) {
                    return 'base64: invalid input';
                }
            } else {
                // Encode mode
                try {
                    return btoa(input);
                } catch(e) {
                    return 'base64: invalid input for encoding';
                }
            }
        },

        // ── python3 / python — run crypto tools ──
        'python3': function(args, term, engine) {
            return A6Config._handlePython(args, term, engine);
        },
        'python': function(args, term, engine) {
            return A6Config._handlePython(args, term, engine);
        },

        // ── openssl — crypto operations ──
        'openssl': function(args, term, engine) {
            const subCmd = args[0] || '';
            const joined = args.join(' ');

            if (subCmd === 'enc') {
                if (joined.includes('-d') && joined.includes('-base64')) {
                    const inputMatch = joined.match(/<<<\s*"?([^"]+)"?/);
                    const input = inputMatch ? inputMatch[1].trim() : '';
                    if (input === A6Config._crypto.b64ApiKey) {
                        return A6Config._crypto.b64Decoded;
                    }
                    if (input) {
                        try { return atob(input.replace(/\s/g, '')); } catch(e) {}
                    }
                    return 'bad magic number';
                }
                if (joined.includes('aes-256-cbc')) {
                    return 'bad decrypt\n140234567890:error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt';
                }
                if (joined.includes('aes-128-cbc')) {
                    return 'bad decrypt\n140234567890:error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt';
                }
            }

            if (subCmd === 'version') {
                return 'OpenSSL 3.0.11 19 Sep 2023 (Library: OpenSSL 3.0.11 19 Sep 2023)';
            }

            return `usage: openssl enc [-d] [-in filename] [-out filename] [-k password] [-e|-d]\nCommon ciphers: -aes-256-cbc, -base64, -des, -rc4`;
        },

        // ── ping — standard ping ──
        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.14.16') {
                return `PING 10.10.14.16 (10.10.14.16) 56(84) bytes of data.
64 bytes from 10.10.14.16: icmp_seq=1 ttl=64 time=28.4 ms
64 bytes from 10.10.14.16: icmp_seq=2 ttl=64 time=28.1 ms
64 bytes from 10.10.14.16: icmp_seq=3 ttl=64 time=28.6 ms

--- 10.10.14.16 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 28.1/28.4/28.6/0.210 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        // ── nikto — web scanner results ──
        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.10.14.16
+ Target Hostname:  cipher-vault.ctf.local
+ Target Port:      80
+ Server: Apache/2.4.57 (Debian)
+ /cipher/: Interesting content — encrypted message board detected
+ /cipher/admin/: API key authentication required
+ /cipher/vault/: Master key authentication required
+ HTTP header "X-Crypto-Version: weak-cipher-suite-1.4" exposes cipher information
+ Self-signed TLS certificate on port 443 (O=Silent Cipher Order)
+ OSVDB-0001: Weak cryptography in use (ROT13, Base64, single-byte XOR)
+ 12 items checked: 6 findings`;
        },

        // ── gobuster — directory enumeration ──
        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:         http://10.10.14.16/
[+] Wordlist:    /usr/share/wordlists/dirb/common.txt
[+] Status codes: 200,204,301,302,307,401,403
===============================================================
/cipher/              (Status: 200) [Size: 4812]
/cipher/admin/        (Status: 200) [Size: 1024]
/cipher/vault/        (Status: 200) [Size: 987]
/cipher/api/          (Status: 403) [Size: 276]
/cipher/static/       (Status: 403) [Size: 276]
===============================================================
Finished`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // PYTHON SIMULATOR — runs tool scripts from /home/kali/tools
    // ═══════════════════════════════════════════════════════

    _handlePython(args, term, engine) {
        const script = args.find(a => a.endsWith('.py')) || '';
        const scriptArgs = args.slice(args.indexOf(script) + 1);

        if (!script) return 'Python 3.11.4 (default)\nType "help", "copyright", "credits" or "license" for more information.\n>>> ';

        // rot13.py
        if (script.includes('rot13.py')) {
            const input = scriptArgs.join(' ').replace(/^['"]|['"]$/g, '');
            if (!input) return 'Usage: python3 rot13.py \'<ciphertext>\'';
            if (input === A6Config._crypto.rot13Ciphertext) {
                return `ROT13 result: ${A6Config._crypto.rot13Decoded}`;
            }
            return `ROT13 result: ${A6Config._rot13(input)}`;
        }

        // xor_decrypt.py
        if (script.includes('xor_decrypt.py')) {
            const hexInput = scriptArgs[0] ? scriptArgs[0].replace(/^['"]|['"]$/g, '') : '';
            const keyArg   = scriptArgs[1] || '0x42';
            if (!hexInput) return 'Usage: python3 xor_decrypt.py \'<hex bytes>\' <key>';

            const keyByte = parseInt(keyArg, 16);
            const hexNorm = hexInput.replace(/\s+/g, ' ').trim().toLowerCase();
            if (hexNorm === A6Config._crypto.xorHex.toLowerCase()) {
                return `Decrypted: ${A6Config._crypto.xorDecoded}`;
            }
            // Generic XOR attempt
            const bytes = hexNorm.match(/[0-9a-f]{2}/g) || [];
            if (bytes.length > 0) {
                const result = bytes.map(b => String.fromCharCode(parseInt(b, 16) ^ keyByte)).join('');
                return `Decrypted: ${result}`;
            }
            return 'Error: invalid hex input. Provide space-separated hex bytes.';
        }

        return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        const accent = '#9b59b6';
        let html = `<table style="width:100%; border-collapse:collapse; font-size:0.78rem;"><thead><tr>`;
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:${accent}; border-bottom:2px solid #4a2d7a; background:#1a0a2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2d1b4e; color:#c9a0e0;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = String(str);
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
                const cellTexts = Array.from(cells).map(c => c.textContent.trim().padEnd(22));
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }
};
