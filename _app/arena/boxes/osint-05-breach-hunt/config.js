/* ============================================================
   CTF ARENA — Box OSINT-05: The Data Breach
   OSINT | Breach Data Analysis & Credential Correlation
   Config: breach dumps, correlation, filesystem, flags, hints, lore
   ============================================================ */

const Osint05Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Data Breach',
    subtitle: 'OSINT — Breach Data Analysis & Credential Correlation',
    difficulty: 'Intermediate-Advanced',
    accent: '#f59e0b',
    storageKey: 'hexworth_ctf_osint05',
    registryId: 'osint-05-breach-hunt',
    trackerKey: 'ctf_osint05',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Data Inventory',
            icon: '\uD83D\uDCC2',
            description: 'Catalog the breach dumps and identify the scope of compromised data.',
            requiredFlags: [],
            mitre: ['T1005', 'T1530'],
            unlocks: ['correlation'],
            locked: false
        },
        {
            id: 'correlation',
            name: 'Credential Correlation',
            icon: '\uD83D\uDD17',
            description: 'Cross-reference email addresses and credentials across multiple breach datasets.',
            requiredFlags: [],
            mitre: ['T1589.001', 'T1589.002'],
            unlocks: ['cracking'],
            locked: true
        },
        {
            id: 'cracking',
            name: 'Hash Analysis',
            icon: '\uD83D\uDD13',
            description: 'Identify hash types and crack password hashes to reveal reused credentials.',
            requiredFlags: ['user'],
            mitre: ['T1110.002', 'T1552'],
            unlocks: ['impact'],
            locked: true
        },
        {
            id: 'impact',
            name: 'Impact Assessment',
            icon: '\u26A0\uFE0F',
            description: 'Determine the full scope of the VIP target\'s exposure across all breaches.',
            requiredFlags: ['root'],
            mitre: ['T1589', 'T1591'],
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
                title: 'Inventory the breach dumps',
                tip: 'List and examine files in /home/kali/breaches/ to understand the data format.',
                trigger: { event: 'command', match: { cmd: 'contains:ls' } }
            },
            {
                title: 'Find the VIP email across breaches',
                tip: 'Use grep to search for recurring email addresses across all breach files.',
                trigger: { event: 'command', match: { cmd: 'contains:grep' } }
            },
            {
                title: 'Sort and deduplicate results',
                tip: 'Pipe grep results through sort and uniq to find the most-breached accounts.',
                trigger: { event: 'command', match: { cmd: 'contains:sort' } }
            },
            {
                title: 'Crack the password hash',
                tip: 'Identify the hash type and use john or python3 to analyze it.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Complete the impact assessment',
                tip: 'The VIP target appears in all breaches with the same password. Find the admin portal credential.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Credential exposure', skill: 'Breach Data Analysis' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks — Password reuse', skill: 'Credential Correlation' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — Password policies', skill: 'Hash Cracking' },
            { flagId: 'root', objective: '4.6', description: 'Given a scenario, implement and maintain identity and access management', skill: 'Credential Hygiene Assessment' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nBreach data directory: /home/kali/breaches/\nVIP Target: r.chen@meridian-health.org\n'
    },

    // ═══════════════════════════════════════════════════════
    // BREACH DATA
    // ═══════════════════════════════════════════════════════

    _vipTarget: {
        email: 'r.chen@meridian-health.org',
        name: 'Dr. Rachel Chen',
        role: 'Chief Medical Information Officer',
        password_cleartext: 'MeridianH3alth!2023',
        admin_portal_key: 'MHIS-ADMIN-7742-XRAY'
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
            text: 'Start with: grep -r "r.chen@meridian-health.org" /home/kali/breaches/ to find the VIP target across all breach dumps.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The VIP appears in 3 different breaches. The password hash format is MD5 in the oldest breach — use hash-identifier to confirm.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Use john with the rockyou wordlist on the MD5 hash: echo "hash" | john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The user flag is in the cracked password result. The root flag is in the admin_portal_access.txt file — check /home/kali/breaches/breach_03/',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Three separate data breaches have been collected from underground sources. Intelligence suggests a high-value target — Dr. Rachel Chen, CMIO of Meridian Health Systems — may appear across multiple dumps with reused credentials. Your mission: correlate the breaches, identify password reuse, and assess the full scope of her exposure.',
        scenario: 'Meridian Health Systems detected anomalous login attempts on their admin portal. The security team suspects credential stuffing using previously breached passwords. Three breach dumps from different organizations have been obtained. If Dr. Chen reused her password, the admin portal — and 2 million patient records — may be at risk.',
        outro: 'The Data Breach analysis confirms the worst case. Dr. Rachel Chen used the same password across at least three services over multiple years. Her cracked credentials provide access to the Meridian Health admin portal, exposing 2 million patient records. Password reuse remains one of the most dangerous security behaviors.',
        ecer: {
            executive: 'Organization had no credential monitoring or dark web alerting service',
            culture: 'No mandatory password manager deployment for executive staff',
            employee: 'VIP target reused the same password across personal and professional accounts',
            regulatory: 'HIPAA breach notification requirements will be triggered by the admin portal access'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://breach-analyzer.local/',

        pages: {
            '/': {
                title: 'Breach Data Analyzer',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#f59e0b; font-size:1.6rem; margin-bottom:4px;">Breach Data Analyzer</h1>
                        <div style="color:#888; font-size:0.8rem;">Credential Correlation & Exposure Platform</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto 20px;">
                        <label style="display:block; color:#808080; font-size:0.8rem; margin-bottom:6px;">Search email across breach databases:</label>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="search" placeholder="Enter email address..."
                                   style="flex:1; padding:8px 14px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.85rem;">
                            <button data-action="search"
                                    style="padding:8px 20px; background:#f59e0b; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Search</button>
                        </div>
                    </div>
                    <div data-results style="max-width:700px; margin:0 auto;">
                        <div style="color:#888; font-size:0.75rem; text-align:center; padding:20px;">Enter an email to check breach exposure.</div>
                    </div>
                `,
                formHandler: function(data) {
                    const q = (data.q || data.search || '').trim().toLowerCase();
                    if (!q) return '<div style="color:#888; padding:10px; text-align:center;">Please enter an email address.</div>';
                    if (q.includes('r.chen') || q.includes('meridian')) {
                        return `<div style="padding:10px;">
                            <h3 style="color:#ef4444; margin-bottom:10px;">ALERT: 3 breaches found for r.chen@meridian-health.org</h3>
                            <div style="background:#fef3c7; border:1px solid #fbbf24; border-radius:6px; padding:12px; margin-bottom:10px;">
                                <strong>Breach #1:</strong> SocialConnect (2022) — MD5 hash<br>
                                <small style="color:#666;">Hash: 5f4dcc3b5aa765d61d8327deb882cf99</small>
                            </div>
                            <div style="background:#fef3c7; border:1px solid #fbbf24; border-radius:6px; padding:12px; margin-bottom:10px;">
                                <strong>Breach #2:</strong> CloudStore Pro (2023) — bcrypt hash<br>
                                <small style="color:#666;">Hash: $2b$12$LmKq...</small>
                            </div>
                            <div style="background:#fee2e2; border:1px solid #ef4444; border-radius:6px; padding:12px;">
                                <strong>Breach #3:</strong> TechForum.io (2024) — SHA-256 hash + admin portal key<br>
                                <small style="color:#666;">CRITICAL: Admin credentials may be exposed</small>
                            </div>
                        </div>`;
                    }
                    return '<div style="color:#888; padding:10px; text-align:center;">No breach data found for "' + q + '".</div>';
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM
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
                                    content: '=== MISSION BRIEFING ===\nVIP Target: Dr. Rachel Chen (r.chen@meridian-health.org)\nRole: Chief Medical Information Officer, Meridian Health Systems\nObjective: Breach data correlation & credential analysis\n\nSteps:\n1. Inventory breach dumps in /home/kali/breaches/\n2. Search for VIP email across all dumps\n3. Identify hash types and crack passwords\n4. Determine if password reuse exposes the admin portal\n5. Assess full impact scope\n\nGood luck, operator.'
                                },
                                'breaches': {
                                    type: 'dir',
                                    children: {
                                        'breach_01_socialconnect': {
                                            type: 'dir',
                                            children: {
                                                'README.txt': {
                                                    type: 'file',
                                                    content: 'Breach: SocialConnect\nDate: 2022-08-14\nRecords: 18.2 million\nFormat: email:md5_hash\nSource: SQL injection on user database'
                                                },
                                                'dump.txt': {
                                                    type: 'file',
                                                    content: 'alice.wonder@gmail.com:e99a18c428cb38d5f260853678922e03\nbob.builder@yahoo.com:25d55ad283aa400af464c76d713c07ad\nr.chen@meridian-health.org:5f4dcc3b5aa765d61d8327deb882cf99\njohn.doe@outlook.com:d8578edf8458ce06fbc5bb76a58c5ca4\nsusan.q@protonmail.com:827ccb0eea8a706c4c34a16891f84e7b\n--- 18,199,995 more entries ---'
                                                }
                                            }
                                        },
                                        'breach_02_cloudstore': {
                                            type: 'dir',
                                            children: {
                                                'README.txt': {
                                                    type: 'file',
                                                    content: 'Breach: CloudStore Pro\nDate: 2023-03-22\nRecords: 4.7 million\nFormat: email:bcrypt_hash:name\nSource: Exposed S3 bucket with database backup'
                                                },
                                                'dump.txt': {
                                                    type: 'file',
                                                    content: 'mike.t@gmail.com:$2b$12$Kj8mN9pL...:Mike Thompson\nr.chen@meridian-health.org:$2b$12$LmKqRs3n...:Rachel Chen\njane.smith@outlook.com:$2b$12$Xk9p2rT...:Jane Smith\ntom.h@yahoo.com:$2b$12$Aq8w1nP...:Tom Harris\nwilson.p@protonmail.com:$2b$12$Mn3k7jR...:Wilson Park\n--- 4,699,995 more entries ---'
                                                }
                                            }
                                        },
                                        'breach_03_techforum': {
                                            type: 'dir',
                                            children: {
                                                'README.txt': {
                                                    type: 'file',
                                                    content: 'Breach: TechForum.io\nDate: 2024-01-09\nRecords: 890,000\nFormat: email:sha256_hash:username:profile_data\nSource: NoSQL injection exposing user collection'
                                                },
                                                'dump.txt': {
                                                    type: 'file',
                                                    content: 'dev.sarah@gmail.com:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3:sarahcodes:{"bio":"Full stack dev"}\nr.chen@meridian-health.org:ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f:drchen:{"bio":"CMIO at Meridian Health","interests":["healthIT","cybersecurity"]}\nhacker_joe@mail.com:b97873a40f73abedd8d685a7cd5e5f85e4a9cfb83c5c4c4e3d12e01f45a5f5e1:j0ehax:{"bio":"Security enthusiast"}\n--- 889,997 more entries ---'
                                                },
                                                'admin_portal_access.txt': {
                                                    type: 'file',
                                                    content: '=== ADMIN PORTAL CREDENTIALS (from profile_data field) ===\nExtracted from users with admin-related profile data:\n\nr.chen@meridian-health.org\n  Portal: admin.meridian-health.org\n  Key: {{FLAG:root}}\n  Role: Super Administrator\n  Last Login: 2024-01-08\n  Note: Same password hash as SocialConnect breach (MD5: 5f4dcc3b5aa765d61d8327deb882cf99)\n  CRITICAL: Password reuse confirmed across 3 platforms'
                                                }
                                            }
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls breaches/\ngrep -r "r.chen" breaches/\ncat breaches/breach_01_socialconnect/dump.txt'
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
                                            content: '[rockyou.txt — 14,341,564 passwords — file too large to display]\nSample: password, 123456, 12345678, qwerty, abc123, monkey, ...'
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
                        'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash' }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'grep': function(args) {
            if (args.length < 2) return 'Usage: grep [OPTIONS] PATTERN [FILE...]';
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const hasR = args.includes('-r') || args.includes('-R') || args.includes('-ri') || args.includes('-rn');

            if (pattern.includes('r.chen') || pattern.includes('meridian')) {
                return `breaches/breach_01_socialconnect/dump.txt:r.chen@meridian-health.org:5f4dcc3b5aa765d61d8327deb882cf99
breaches/breach_02_cloudstore/dump.txt:r.chen@meridian-health.org:$2b$12$LmKqRs3n...:Rachel Chen
breaches/breach_03_techforum/dump.txt:r.chen@meridian-health.org:ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f:drchen:{"bio":"CMIO at Meridian Health","interests":["healthIT","cybersecurity"]}
breaches/breach_03_techforum/admin_portal_access.txt:r.chen@meridian-health.org`;
            }
            if (pattern.includes('5f4dcc3b')) {
                return `breaches/breach_01_socialconnect/dump.txt:r.chen@meridian-health.org:5f4dcc3b5aa765d61d8327deb882cf99
breaches/breach_03_techforum/admin_portal_access.txt:  Note: Same password hash as SocialConnect breach (MD5: 5f4dcc3b5aa765d61d8327deb882cf99)`;
            }
            if (pattern.includes('admin')) {
                return `breaches/breach_03_techforum/admin_portal_access.txt:=== ADMIN PORTAL CREDENTIALS (from profile_data field) ===
breaches/breach_03_techforum/admin_portal_access.txt:  Portal: admin.meridian-health.org
breaches/breach_03_techforum/admin_portal_access.txt:  Role: Super Administrator`;
            }
            return '';
        },

        'sort': function(args) {
            return `breaches/breach_01_socialconnect/dump.txt:r.chen@meridian-health.org:5f4dcc3b5aa765d61d8327deb882cf99
breaches/breach_02_cloudstore/dump.txt:r.chen@meridian-health.org:$2b$12$LmKqRs3n...:Rachel Chen
breaches/breach_03_techforum/dump.txt:r.chen@meridian-health.org:ef92b778...`;
        },

        'uniq': function(args) {
            return `      3 r.chen@meridian-health.org  (appears in 3 breaches)`;
        },

        'awk': function(args) {
            if (args.length === 0) return 'Usage: awk \'pattern { action }\' [FILE...]';
            return `r.chen@meridian-health.org:5f4dcc3b5aa765d61d8327deb882cf99\nr.chen@meridian-health.org:$2b$12$LmKqRs3n...\nr.chen@meridian-health.org:ef92b778bafe771e...`;
        },

        'python3': function(args) {
            if (args.length === 0) return 'Python 3.11.6\nType "exit()" to quit.\n>>> ';
            if (args.includes('-c')) {
                const code = args.slice(args.indexOf('-c') + 1).join(' ');
                if (code.includes('hashlib') && code.includes('5f4dcc3b')) {
                    return 'Match found: "password" => 5f4dcc3b5aa765d61d8327deb882cf99';
                }
                if (code.includes('md5') || code.includes('hashlib')) {
                    return 'hashlib.md5(b"password").hexdigest() => 5f4dcc3b5aa765d61d8327deb882cf99';
                }
            }
            return 'python3: can\'t open file \'' + args[0] + '\': [Errno 2] No such file or directory';
        },

        'hash-identifier': function(args) {
            if (args.length === 0) return 'Usage: hash-identifier <hash>';
            const hash = args[0] || '';
            if (hash === '5f4dcc3b5aa765d61d8327deb882cf99' || hash.length === 32) {
                return `Possible Hash Type(s):
[+] MD5
[+] Domain Cached Credentials - MD4(MD4(($pass)).(strtolower($username)))

Least Possible Hash Type(s):
[+] RAdmin v2.x
[+] NTLM

Note: MD5 hash "5f4dcc3b5aa765d61d8327deb882cf99" is a well-known hash.
This is the MD5 of "password" — an extremely common password.
{{FLAG:user}}`;
            }
            if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
                return `Possible Hash Type(s):\n[+] Blowfish (bcrypt) — $2b$\n[+] Cost factor: 12`;
            }
            if (hash.length === 64) {
                return `Possible Hash Type(s):\n[+] SHA-256\n[+] Keccak-256`;
            }
            return `Possible Hash Type(s):\n[+] Unknown hash format`;
        },

        'john': function(args) {
            if (args.length === 0) return 'Usage: john [OPTIONS] [PASSWORD-FILES]\n  --format=TYPE    Force hash type\n  --wordlist=FILE  Wordlist mode';
            const hasMd5 = args.some(a => a.includes('md5'));
            const hasWordlist = args.some(a => a.includes('wordlist') || a.includes('rockyou'));
            if (hasMd5 || hasWordlist) {
                return `Loaded 1 password hash (Raw-MD5 [MD5 256/256 AVX2 8x3])
Press 'q' or Ctrl-C to abort, almost any other key for status
password         (r.chen@meridian-health.org)
1g 0:00:00:01 DONE 1.0g/s 14344Kp/s 14344Kc/s 14344KC/s password..passw0rd
Session completed.
{{FLAG:user}}

Cracked: r.chen@meridian-health.org => password`;
            }
            return 'No password hashes loaded. Specify a hash file or use --format.';
        },

        'curl': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            return `curl: (7) Failed to connect: Connection refused`;
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
