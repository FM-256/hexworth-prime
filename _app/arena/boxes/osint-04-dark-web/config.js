/* ============================================================
   CTF ARENA — Box OSINT-04: The Onion Trail
   OSINT | Dark Web & Paste Site Investigation
   Config: paste sites, markets, filesystem, flags, hints, lore
   ============================================================ */

const Osint04Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Onion Trail',
    subtitle: 'OSINT — Dark Web & Paste Site Investigation',
    difficulty: 'Advanced',
    accent: '#ef4444',
    storageKey: 'hexworth_ctf_osint04',
    registryId: 'osint-04-dark-web',
    trackerKey: 'ctf_osint04',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Paste Site Analysis',
            icon: '\uD83D\uDCCB',
            description: 'Examine leaked data on paste sites to identify the threat actor and stolen credentials.',
            requiredFlags: [],
            mitre: ['T1589.001', 'T1552.004'],
            unlocks: ['tracking'],
            locked: false
        },
        {
            id: 'tracking',
            name: 'Actor Tracking',
            icon: '\uD83D\uDD75\uFE0F',
            description: 'Follow the threat actor\'s trail across dark web forums and marketplaces.',
            requiredFlags: [],
            mitre: ['T1593', 'T1598'],
            unlocks: ['decryption'],
            locked: true
        },
        {
            id: 'decryption',
            name: 'Data Decryption',
            icon: '\uD83D\uDD10',
            description: 'Decode obfuscated communications and encrypted data drops.',
            requiredFlags: ['user'],
            mitre: ['T1140', 'T1001'],
            unlocks: ['attribution'],
            locked: true
        },
        {
            id: 'attribution',
            name: 'Attribution',
            icon: '\uD83C\uDFAF',
            description: 'Connect all evidence to identify the threat actor\'s real identity and next target.',
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
                title: 'Examine the paste site dumps',
                tip: 'Read the files in /home/kali/evidence/pastes/ to find leaked credentials.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Search for the threat actor handle',
                tip: 'Use grep to search evidence files for recurring usernames or handles.',
                trigger: { event: 'command', match: { cmd: 'contains:grep' } }
            },
            {
                title: 'Decode the base64 messages',
                tip: 'The forum posts contain base64-encoded data. Decode them with: base64 -d',
                trigger: { event: 'command', match: { cmd: 'contains:base64' } }
            },
            {
                title: 'Identify the credential pattern',
                tip: 'The user flag is hidden in the decoded paste data. Look for the flag format.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Trace the actor to their identity',
                tip: 'Cross-reference the PGP key and bitcoin address to unmask the actor.',
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
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Credential dumps', skill: 'Paste Site Investigation' },
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, analyze indicators of malicious activity — Dark web monitoring', skill: 'Dark Web Intelligence' },
            { flagId: 'root', objective: '5.1', description: 'Summarize elements of effective security governance — Threat intelligence', skill: 'Threat Actor Attribution' },
            { flagId: 'root', objective: '5.4', description: 'Summarize elements of effective security governance — Threat intelligence sources', skill: 'HUMINT Correlation' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nEvidence directory: /home/kali/evidence/\n'
    },

    // ═══════════════════════════════════════════════════════
    // DARK WEB DATA
    // ═══════════════════════════════════════════════════════

    _darkwebData: {
        actorHandle: 'z3r0c00l',
        realName: 'Marcus Webb',
        pgpFingerprint: '4A2B 8C3D 9E1F 7A6B 5C4D  3E2F 1A0B 9C8D 7E6F 5A4B',
        btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        nextTarget: 'Meridian Federal Credit Union'
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
            text: 'Start by reading all paste files in /home/kali/evidence/pastes/. The threat actor uses the handle "z3r0c00l".',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The forum_post.txt contains a base64-encoded message. Decode it with: cat forum_post.txt | grep "base64:" | cut -d: -f2 | base64 -d',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The decoded base64 message contains the user flag and reveals a PGP key fingerprint.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Cross-reference the PGP fingerprint with the marketplace listing. The root flag is the actor\'s real name found in the PGP key metadata.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A threat actor known as "z3r0c00l" has been selling stolen credentials on dark web marketplaces and paste sites. Your mission: analyze the leaked data, track the actor across platforms, decode their communications, and identify their real identity before they execute their next attack.',
        scenario: 'The FBI Cyber Division intercepted communications referencing a threat actor selling bulk credential dumps. Monitoring of paste sites revealed multiple uploads linked to the handle "z3r0c00l". Partial dark web marketplace scrapes and forum posts have been collected. Your analysis could prevent the next breach.',
        outro: 'The Onion Trail ends with Marcus Webb unmasked. His poor operational security — reusing PGP keys, failing to strip metadata, and mixing personal and criminal bitcoin wallets — made attribution possible. The next target, Meridian Federal Credit Union, has been notified.',
        ecer: {
            executive: 'Threat actor failed to compartmentalize criminal and personal digital identities',
            culture: 'Dark web marketplace operators provided insufficient anonymity guarantees',
            employee: 'Individual reused PGP keys across personal and criminal communications',
            regulatory: 'Lack of mandatory credential monitoring for financial institutions enabled extended data sales'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://darkweb-monitor.local/',

        pages: {
            '/': {
                title: 'Dark Web Intelligence Monitor',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333; background:#1a1a2e; padding:20px; border-radius:8px;">
                        <h1 style="color:#ef4444; font-size:1.6rem; margin-bottom:4px;">Dark Web Intelligence Monitor</h1>
                        <div style="color:#888; font-size:0.8rem;">Threat Intelligence Collection Platform</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto 20px;">
                        <label style="display:block; color:#808080; font-size:0.8rem; margin-bottom:6px;">Search threat actor handle:</label>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="search" placeholder="Enter handle or keyword..."
                                   style="flex:1; padding:8px 14px; border:1px solid #444; border-radius:4px; font-family:inherit; font-size:0.85rem; background:#1a1a2e; color:#eee;">
                            <button data-action="search"
                                    style="padding:8px 20px; background:#ef4444; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Search</button>
                        </div>
                    </div>
                    <div data-results style="max-width:700px; margin:0 auto;">
                        <div style="color:#888; font-size:0.75rem; text-align:center; padding:20px;">Enter a handle to search dark web intelligence.</div>
                    </div>
                `,
                formHandler: function(data) {
                    const q = (data.q || data.search || '').trim().toLowerCase();
                    if (!q) return '<div style="color:#888; padding:10px; text-align:center;">Please enter a search term.</div>';
                    if (q === 'z3r0c00l' || q.includes('z3r0')) {
                        return `<div style="padding:10px;">
                            <h3 style="color:#ef4444; margin-bottom:10px;">Results for "z3r0c00l"</h3>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:12px; margin-bottom:10px; color:#ccc;">
                                <strong style="color:#ef4444;">Paste #1:</strong> Credential dump — 45,000 email:password combos<br>
                                <small>Posted: 2024-02-14 | Source: paste.onion</small>
                            </div>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:12px; margin-bottom:10px; color:#ccc;">
                                <strong style="color:#ef4444;">Marketplace:</strong> "Premium database dumps — $500 BTC"<br>
                                <small>Vendor rating: 4.8/5 | 23 transactions | PGP verified</small>
                            </div>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:12px; color:#ccc;">
                                <strong style="color:#ef4444;">Forum Post:</strong> "Looking for RDP access to financial institutions"<br>
                                <small>Posted: 2024-03-01 | Thread: /market/requests/8842</small>
                            </div>
                        </div>`;
                    }
                    return '<div style="color:#888; padding:10px; text-align:center;">No results for "' + q + '".</div>';
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
                                    content: '=== MISSION BRIEFING ===\nTarget: Threat actor "z3r0c00l"\nObjective: Dark web investigation & actor attribution\n\nSteps:\n1. Analyze paste site credential dumps\n2. Decode obfuscated forum communications\n3. Track the actor across marketplaces\n4. Identify real identity via PGP key analysis\n5. Determine the next planned target\n\nEvidence collected from multiple SIGINT sources.\nGood luck, operator.'
                                },
                                'evidence': {
                                    type: 'dir',
                                    children: {
                                        'pastes': {
                                            type: 'dir',
                                            children: {
                                                'paste_001.txt': {
                                                    type: 'file',
                                                    content: '=== CREDENTIAL DUMP ===\nPosted by: z3r0c00l\nDate: 2024-02-14\nSource: Corporate breach — Apex Financial Services\n\nadmin@apexfinancial.com:$2b$12$Kj8mN9pL...hashed\ncfo@apexfinancial.com:$2b$12$Rt4qW7xM...hashed\nhr.director@apexfinancial.com:$2b$12$Yp6nB3vC...hashed\nit.admin@apexfinancial.com:$2b$12$Dn2kF8wJ...hashed\nceo@apexfinancial.com:$2b$12$Mx9aG5tH...hashed\n\n--- 44,995 more entries omitted ---\nFull dump: 500 BTC. Contact via marketplace.\nPGP: 4A2B 8C3D 9E1F 7A6B 5C4D  3E2F 1A0B 9C8D 7E6F 5A4B'
                                                },
                                                'paste_002.txt': {
                                                    type: 'file',
                                                    content: '=== ADDITIONAL LEAK ===\nPosted by: z3r0c00l\nDate: 2024-02-28\nSource: Retail chain — ShopMart Inc.\n\nj.smith@shopmart.com:P@ssw0rd123!\nm.jones@shopmart.com:Summer2024!\na.williams@shopmart.com:Sh0pM@rt!99\nr.davis@shopmart.com:Welcome1!\n\n--- 12,340 more entries omitted ---\nBulk pricing available. BTC only.\nContact: z3r0c00l@securemail.onion'
                                                },
                                                'paste_003.txt': {
                                                    type: 'file',
                                                    content: '=== COMMS INTERCEPT ===\nPosted by: z3r0c00l\nDate: 2024-03-05\nForum: /darkmarket/general/\n\nHey all, got a fresh batch incoming. Next target is a big one.\nWill post preview soon.\n\nbase64:e3tGTEFHOnVzZXJ9fSAtLSB6M3IwYzAwbCBjcmVkZW50aWFsIHZlcmlmaWNhdGlvbiBjb2Rl\n\nStay tuned. Same PGP key as always.'
                                                }
                                            }
                                        },
                                        'marketplace_listing.txt': {
                                            type: 'file',
                                            content: '=== DARK WEB MARKETPLACE SCRAPE ===\nVendor: z3r0c00l\nShop: ShadowBazaar\nRating: 4.8/5 (23 reviews)\n\nLISTINGS:\n1. "Apex Financial Services DB" — 45K records — 500 BTC\n2. "ShopMart Customer Data" — 12K records — 200 BTC\n3. "Premium RDP Access Bundle" — 15 servers — 100 BTC\n\nVENDOR PGP KEY:\n-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: GnuPG v2\n\nmQENBGN...\nuid: Marcus Webb <mwebb.dev@gmail.com>\nFingerprint: 4A2B 8C3D 9E1F 7A6B 5C4D  3E2F 1A0B 9C8D 7E6F 5A4B\n-----END PGP PUBLIC KEY BLOCK-----\n\nBTC Wallet: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
                                        },
                                        'forum_post.txt': {
                                            type: 'file',
                                            content: '=== FORUM POST SCRAPE ===\nThread: /market/requests/8842\nAuthor: z3r0c00l\nDate: 2024-03-01\n\nSubject: Looking for RDP access to financial institutions\n\nNeed initial access to financial sector targets. Specifically\ninterested in credit unions with < 500 employees. Have buyer\nfor customer PII + financial records.\n\nbase64:e3tGTEFHOnJvb3R9fSAtLSBOZXh0IHRhcmdldDogTWVyaWRpYW4gRmVkZXJhbCBDcmVkaXQgVW5pb24=\n\nWilling to pay 50 BTC per access point.\nPGP: 4A2B 8C3D 9E1F 7A6B 5C4D'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls evidence/pastes/\ncat evidence/pastes/paste_001.txt\ngrep -r "z3r0c00l" evidence/'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': { type: 'dir', children: {} }
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
        'curl': function(args) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            if (url.includes('securemail.onion') || url.includes('z3r0c00l')) {
                return 'curl: (7) Failed to connect: Tor circuit not established.\nHint: Evidence has already been collected. Check /home/kali/evidence/';
            }
            return `curl: (7) Failed to connect: Connection refused`;
        },

        'grep': function(args) {
            if (args.length < 2) return 'Usage: grep [OPTIONS] PATTERN [FILE...]';
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const hasR = args.includes('-r') || args.includes('-R') || args.includes('-ri');

            if (pattern.includes('z3r0c00l') || pattern.includes('z3r0')) {
                return `evidence/pastes/paste_001.txt:Posted by: z3r0c00l
evidence/pastes/paste_002.txt:Posted by: z3r0c00l
evidence/pastes/paste_003.txt:Posted by: z3r0c00l
evidence/marketplace_listing.txt:Vendor: z3r0c00l
evidence/forum_post.txt:Author: z3r0c00l`;
            }
            if (pattern.includes('base64') || pattern.includes('BASE64')) {
                return `evidence/pastes/paste_003.txt:base64:e3tGTEFHOnVzZXJ9fSAtLSB6M3IwYzAwbCBjcmVkZW50aWFsIHZlcmlmaWNhdGlvbiBjb2Rl
evidence/forum_post.txt:base64:e3tGTEFHOnJvb3R9fSAtLSBOZXh0IHRhcmdldDogTWVyaWRpYW4gRmVkZXJhbCBDcmVkaXQgVW5pb24=`;
            }
            if (pattern.includes('PGP') || pattern.includes('pgp') || pattern.includes('fingerprint')) {
                return `evidence/pastes/paste_001.txt:PGP: 4A2B 8C3D 9E1F 7A6B 5C4D  3E2F 1A0B 9C8D 7E6F 5A4B
evidence/marketplace_listing.txt:Fingerprint: 4A2B 8C3D 9E1F 7A6B 5C4D  3E2F 1A0B 9C8D 7E6F 5A4B
evidence/forum_post.txt:PGP: 4A2B 8C3D 9E1F 7A6B 5C4D`;
            }
            if (pattern.includes('Marcus') || pattern.includes('marcus') || pattern.includes('mwebb') || pattern.includes('gmail')) {
                return `evidence/marketplace_listing.txt:uid: Marcus Webb <mwebb.dev@gmail.com>`;
            }
            if (pattern.includes('@') || pattern.includes('email')) {
                return `evidence/pastes/paste_002.txt:z3r0c00l@securemail.onion
evidence/marketplace_listing.txt:uid: Marcus Webb <mwebb.dev@gmail.com>`;
            }
            return '';
        },

        'base64': function(args) {
            const hasD = args.includes('-d') || args.includes('--decode');
            if (!hasD) return 'Usage: base64 [-d] [FILE]\n  -d    Decode base64 input';

            // Simulated decode — in the real terminal, piped input would work
            // We handle the known encoded strings
            const input = args.find(a => !a.startsWith('-')) || '';
            if (input.includes('e3tGTEFHOnVzZXJ9fS')) {
                return '{{FLAG:user}} -- z3r0c00l credential verification code';
            }
            if (input.includes('e3tGTEFHOnJvb3R9fS')) {
                return '{{FLAG:root}} -- Next target: Meridian Federal Credit Union';
            }
            return 'base64: invalid input (pipe data or provide file).\n\nTip: echo "encoded_string" | base64 -d\nOr check evidence files for base64-encoded data.';
        },

        'python3': function(args) {
            if (args.length === 0) return 'Python 3.11.6\nType "exit()" to quit.\n>>> ';
            if (args.includes('-c')) {
                const code = args.slice(args.indexOf('-c') + 1).join(' ');
                if (code.includes('b64decode') || code.includes('base64')) {
                    if (code.includes('e3tGTEFHOnVzZXJ9fS')) {
                        return '{{FLAG:user}} -- z3r0c00l credential verification code';
                    }
                    if (code.includes('e3tGTEFHOnJvb3R9fS')) {
                        return '{{FLAG:root}} -- Next target: Meridian Federal Credit Union';
                    }
                }
            }
            return 'python3: can\'t open file \'' + args[0] + '\': [Errno 2] No such file or directory';
        },

        'strings': function(args) {
            if (args.length === 0) return 'Usage: strings [OPTIONS] FILE';
            return 'No printable strings found in binary context. Files are text — use cat or grep instead.';
        },

        'hash-identifier': function(args) {
            if (args.length === 0) return 'Usage: hash-identifier <hash>';
            const hash = args[0] || '';
            if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
                return `Possible Hash Type(s):\n[+] Blowfish (bcrypt) — $2b$\n[+] Cost factor: 12\n[+] Not easily crackable without significant compute resources.`;
            }
            return `Possible Hash Type(s):\n[+] Unknown hash format`;
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
