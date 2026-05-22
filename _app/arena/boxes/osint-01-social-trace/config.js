/* ============================================================
   CTF ARENA — Box OSINT-01: The Digital Shadow
   OSINT | Social Media & Username Tracking
   Config: profiles, platforms, filesystem, flags, hints, lore
   ============================================================ */

const Osint01Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Digital Shadow',
    subtitle: 'OSINT — Social Media & Username Tracking',
    difficulty: 'Beginner',
    accent: '#3b82f6',
    storageKey: 'hexworth_ctf_osint01',
    registryId: 'osint-01-social-trace',
    trackerKey: 'ctf_osint01',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Username Discovery',
            icon: '\uD83D\uDD0D',
            description: 'Use OSINT tools to search for a threat actor\'s username across social media platforms.',
            requiredFlags: [],
            mitre: ['T1589.001', 'T1593'],
            unlocks: ['profiling'],
            locked: false
        },
        {
            id: 'profiling',
            name: 'Profile Analysis',
            icon: '\uD83D\uDC64',
            description: 'Analyze discovered profiles for personal information, connections, and behavioral patterns.',
            requiredFlags: [],
            mitre: ['T1589.002', 'T1593.001'],
            unlocks: ['correlation'],
            locked: true
        },
        {
            id: 'correlation',
            name: 'Data Correlation',
            icon: '\uD83D\uDD17',
            description: 'Cross-reference data from multiple platforms to build a complete threat actor profile.',
            requiredFlags: ['user'],
            mitre: ['T1589', 'T1591'],
            unlocks: ['attribution'],
            locked: true
        },
        {
            id: 'attribution',
            name: 'Attribution',
            icon: '\uD83C\uDFAF',
            description: 'Identify the threat actor\'s real identity using metadata and operational security failures.',
            requiredFlags: ['root'],
            mitre: ['T1589.003', 'T1596'],
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
                title: 'Search for the username across platforms',
                tip: 'Open the Terminal and run: sherlock darkphantom99',
                trigger: { event: 'command', match: { cmd: 'contains:sherlock' } }
            },
            {
                title: 'Investigate discovered profiles',
                tip: 'Use curl to fetch profile pages, or open them in the browser.',
                trigger: { event: 'command', match: { cmd: 'contains:curl' } }
            },
            {
                title: 'Extract metadata from profile images',
                tip: 'Run exiftool on downloaded images to find GPS coordinates or camera info.',
                trigger: { event: 'command', match: { cmd: 'contains:exiftool' } }
            },
            {
                title: 'Find the user flag',
                tip: 'Correlate the email address found across multiple platforms. Check WHOIS data.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Unmask the threat actor',
                tip: 'The profile photo metadata and domain registration reveal the real identity.',
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
            { flagId: 'user', objective: '1.1', description: 'Compare and contrast various types of social engineering techniques — OSINT gathering', skill: 'Username Enumeration' },
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, analyze indicators of malicious activity — Threat actor profiling', skill: 'Social Media Analysis' },
            { flagId: 'root', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Digital footprint analysis', skill: 'Metadata Extraction' },
            { flagId: 'root', objective: '5.4', description: 'Summarize elements of effective security governance — Threat intelligence', skill: 'Threat Actor Attribution' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget username: darkphantom99\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED SOCIAL MEDIA DATA
    // ═══════════════════════════════════════════════════════

    _profiles: {
        github: {
            username: 'darkphantom99',
            name: 'D. Phantom',
            bio: 'Security researcher | Bug bounty hunter | Python dev',
            email: '{{FLAG:user}}',
            repos: ['recon-toolkit', 'osint-scripts', 'payload-gen'],
            joined: '2021-03-14',
            location: 'Somewhere in the shadows'
        },
        twitter: {
            username: 'darkphantom99',
            name: 'DarkPhantom',
            bio: 'Infosec | CTF Player | "The network is the computer"',
            followers: 2847,
            following: 312,
            tweets: [
                'Just pwned another box on HackTheBox #infosec #ctf',
                'New blog post on SSRF techniques - check my GitHub',
                'Heading to DEF CON this year. DM me if you want to meet up in Vegas!',
                'My favorite coffee shop in Portland has the best WiFi for wardriving lol'
            ]
        },
        reddit: {
            username: 'darkphantom99',
            karma: 15420,
            subreddits: ['r/netsec', 'r/hacking', 'r/Portland', 'r/cybersecurity'],
            posts: [
                { sub: 'r/Portland', title: 'Best coffee shops with good WiFi near PSU?', body: 'Just moved to the Hawthorne district. Looking for a good spot to work.' },
                { sub: 'r/netsec', title: 'OSINT automation framework', body: 'Check out my new tool: github.com/darkphantom99/recon-toolkit' }
            ]
        },
        linkedin: {
            name: 'Daniel Thornton',
            title: 'Security Consultant at CyberShield LLC',
            location: 'Portland, OR',
            education: 'Portland State University - B.S. Computer Science',
            email: 'daniel.thornton@cybershield-llc.com',
            badge_id: '{{FLAG:root}}'
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
            text: 'Start with sherlock to find which platforms the username "darkphantom99" exists on. Note which platforms return positive results.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The GitHub profile has an email address. Cross-reference it with WHOIS records. Try: whois cybershield-llc.com',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The Twitter posts mention a specific city. Reddit posts narrow it to a neighborhood. LinkedIn confirms the real name.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The user flag is the email found on the GitHub profile. The root flag is the real name from LinkedIn: "Daniel Thornton".',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A threat actor operating under the handle "darkphantom99" has been linked to a series of unauthorized network intrusions. Your mission: trace their digital footprint across social media platforms, correlate their profiles, and identify who they really are.',
        scenario: 'The SOC team detected suspicious scanning activity originating from a Tor exit node. Post-incident forensics recovered a username fragment "darkphantom99" from server logs. Intelligence suggests this actor maintains multiple social media presences with poor operational security.',
        outro: 'The Digital Shadow has been unmasked. Daniel Thornton of CyberShield LLC in Portland, OR, left too many breadcrumbs across his social media profiles. His operational security failures made attribution possible.',
        ecer: {
            executive: 'Threat actor used consistent username across platforms without compartmentalization',
            culture: 'Online oversharing culture enabled personal detail leakage',
            employee: 'Individual failed to separate personal and operational identities',
            regulatory: 'No organizational OPSEC policy governing employee social media use'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://osint-workbench.local/',

        pages: {
            '/': {
                title: 'OSINT Workbench',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#3b82f6; font-size:1.6rem; margin-bottom:4px;">OSINT Workbench</h1>
                        <div style="color:#888; font-size:0.8rem;">Social Media Intelligence Platform v1.2</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto 20px;">
                        <label style="display:block; color:#808080; font-size:0.8rem; margin-bottom:6px;">Search Username:</label>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="search" placeholder="Enter username to investigate..."
                                   style="flex:1; padding:8px 14px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.85rem;">
                            <button data-action="search"
                                    style="padding:8px 20px; background:#3b82f6; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Search</button>
                        </div>
                    </div>
                    <div data-results style="max-width:700px; margin:0 auto;">
                        <div style="color:#888; font-size:0.75rem; text-align:center; padding:20px;">Enter a username to begin investigation.</div>
                    </div>
                `,
                formHandler: function(data) {
                    const q = (data.q || data.search || '').trim().toLowerCase();
                    if (!q) return '<div style="color:#888; padding:10px; text-align:center;">Please enter a username.</div>';
                    if (q === 'darkphantom99') {
                        const p = Osint01Config._profiles;
                        return `<div style="padding:10px;">
                            <h3 style="color:#3b82f6; margin-bottom:10px;">Results for "darkphantom99"</h3>
                            <div style="background:#f0f7ff; border:1px solid #bfdbfe; border-radius:6px; padding:12px; margin-bottom:10px;">
                                <strong>GitHub:</strong> ${p.github.name} &mdash; ${p.github.bio}<br>
                                <small style="color:#666;">Email: ${p.github.email} | Repos: ${p.github.repos.join(', ')}</small>
                            </div>
                            <div style="background:#f0f7ff; border:1px solid #bfdbfe; border-radius:6px; padding:12px; margin-bottom:10px;">
                                <strong>Twitter:</strong> @${p.twitter.username} &mdash; ${p.twitter.bio}<br>
                                <small style="color:#666;">Followers: ${p.twitter.followers} | Recent: "${p.twitter.tweets[3]}"</small>
                            </div>
                            <div style="background:#f0f7ff; border:1px solid #bfdbfe; border-radius:6px; padding:12px; margin-bottom:10px;">
                                <strong>Reddit:</strong> u/${p.reddit.username} &mdash; Karma: ${p.reddit.karma}<br>
                                <small style="color:#666;">Active in: ${p.reddit.subreddits.join(', ')}</small>
                            </div>
                            <div style="background:#fef3c7; border:1px solid #fbbf24; border-radius:6px; padding:12px;">
                                <strong>LinkedIn (Possible Match):</strong> ${p.linkedin.name} &mdash; ${p.linkedin.title}<br>
                                <small style="color:#666;">Location: ${p.linkedin.location} | ${p.linkedin.education}</small>
                            </div>
                        </div>`;
                    }
                    return '<div style="color:#888; padding:10px; text-align:center;">No results found for "' + q + '".</div>';
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
                                    content: '=== MISSION BRIEFING ===\nTarget: Username "darkphantom99"\nObjective: Social media OSINT investigation\n\nSteps:\n1. Use sherlock to find accounts across platforms\n2. Analyze profile content for PII\n3. Cross-reference data between platforms\n4. Check WHOIS data for related domains\n5. Extract metadata from profile images\n6. Attribute the threat actor\n\nGood luck, operator.'
                                },
                                'targets.txt': {
                                    type: 'file',
                                    content: 'PRIMARY TARGET\n==============\nUsername: darkphantom99\nFirst seen: Server logs, 2024-01-15\nContext: Unauthorized scanning activity from Tor exit node\nRecovered from: Apache access.log fragment\n\nKNOWN PLATFORMS (unconfirmed):\n- GitHub\n- Twitter\n- Reddit\n- Possibly LinkedIn'
                                },
                                'downloaded': {
                                    type: 'dir',
                                    children: {
                                        'profile_photo.jpg': {
                                            type: 'file',
                                            content: '[JPEG image data, 1920x1080, EXIF metadata present]\nCamera: Canon EOS R5\nGPS: 45.5152, -122.6784\nDate: 2023-11-02 14:32:07\nSoftware: Adobe Lightroom 6.14'
                                        },
                                        'github_avatar.png': {
                                            type: 'file',
                                            content: '[PNG image data, 460x460]\nNo EXIF metadata.'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sherlock darkphantom99\ncurl https://api.github.com/users/darkphantom99\nwhois cybershield-llc.com'
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
                                        'usernames.txt': {
                                            type: 'file',
                                            content: 'darkphantom99\ndark_phantom\nphantom99\ndarkph4ntom\nphantom_dark'
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
                'tmp': {
                    type: 'dir',
                    children: {
                        'whois_cache.txt': {
                            type: 'file',
                            content: 'Domain: cybershield-llc.com\nRegistrant: Daniel Thornton\nRegistrant Email: daniel.thornton@cybershield-llc.com\nRegistrant City: Portland\nRegistrant State: OR\nCreated: 2020-08-22\nUpdated: 2023-12-01'
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'sherlock': function(args) {
            if (args.length === 0) return 'Usage: sherlock <username>\nSearch for a username across social networks.';
            const user = args[0];
            if (user === 'darkphantom99') {
                return `[*] Checking username darkphantom99 on:

[+] GitHub:          https://github.com/darkphantom99
[+] Twitter:         https://twitter.com/darkphantom99
[+] Reddit:          https://reddit.com/user/darkphantom99
[+] Instagram:       Not Found!
[+] LinkedIn:        Possible match found (requires manual review)
[+] HackTheBox:      https://hackthebox.com/profile/darkphantom99
[+] TryHackMe:       Not Found!
[+] Keybase:         Not Found!
[+] Steam:           https://steamcommunity.com/id/darkphantom99
[+] Discord:         Not Found!
[+] Telegram:        Not Found!
[+] Medium:          Not Found!
[+] DEV Community:   https://dev.to/darkphantom99

[*] Results: 6 sites found for darkphantom99`;
            }
            return `[*] Checking username ${user} on:\n\n[-] No results found across 300+ sites.\n[*] Results: 0 sites found for ${user}`;
        },

        'whois': function(args) {
            if (args.length === 0) return 'Usage: whois <domain>';
            const domain = args[0];
            if (domain === 'cybershield-llc.com' || domain.includes('cybershield')) {
                return `Domain Name: CYBERSHIELD-LLC.COM
Registry Domain ID: 2561234567_DOMAIN_COM-VRSN
Registrar: Namecheap, Inc.
Updated Date: 2023-12-01T00:00:00Z
Creation Date: 2020-08-22T00:00:00Z
Registrant Name: Daniel Thornton
Registrant Organization: CyberShield LLC
Registrant Street: 1847 SE Hawthorne Blvd
Registrant City: Portland
Registrant State/Province: OR
Registrant Postal Code: 97214
Registrant Country: US
Registrant Email: daniel.thornton@cybershield-llc.com
Name Server: NS1.NAMECHEAP.COM
Name Server: NS2.NAMECHEAP.COM`;
            }
            return `No match for "${domain}".`;
        },

        'dig': function(args) {
            if (args.length === 0) return 'Usage: dig [@server] name [type]';
            const domain = args.find(a => !a.startsWith('@') && !a.startsWith('+')) || '';
            if (domain.includes('cybershield')) {
                return `;; ANSWER SECTION:
cybershield-llc.com.    3600    IN    A    104.21.45.123
cybershield-llc.com.    3600    IN    MX   10 mail.cybershield-llc.com.
cybershield-llc.com.    3600    IN    TXT  "v=spf1 include:_spf.google.com ~all"

;; Query time: 24 msec`;
            }
            return `;; connection timed out; no servers could be reached`;
        },

        'curl': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('api.github.com/users/darkphantom99')) {
                const p = Osint01Config._profiles.github;
                return JSON.stringify({
                    login: p.username,
                    name: p.name,
                    bio: p.bio,
                    email: p.email,
                    public_repos: p.repos.length,
                    location: p.location,
                    created_at: p.joined + 'T00:00:00Z',
                    blog: 'https://cybershield-llc.com/blog'
                }, null, 2);
            }

            if (url.includes('twitter.com/darkphantom99') || url.includes('x.com/darkphantom99')) {
                const p = Osint01Config._profiles.twitter;
                return `<title>${p.name} (@${p.username}) / Twitter</title>\n<meta name="description" content="${p.bio}">\nFollowers: ${p.followers}\n\nRecent tweets:\n${p.tweets.map(t => '  - ' + t).join('\n')}`;
            }

            if (url.includes('reddit.com/user/darkphantom99')) {
                const p = Osint01Config._profiles.reddit;
                return `User: ${p.username}\nKarma: ${p.karma}\nActive subreddits: ${p.subreddits.join(', ')}\n\nRecent posts:\n${p.posts.map(po => `  [${po.sub}] ${po.title}\n    ${po.body}`).join('\n')}`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'exiftool': function(args) {
            if (args.length === 0) return 'Usage: exiftool [OPTIONS] FILE';
            const file = args[args.length - 1];
            if (file.includes('profile_photo') || file.includes('.jpg')) {
                return `ExifTool Version Number         : 12.67
File Name                       : profile_photo.jpg
File Size                       : 2.4 MB
File Type                       : JPEG
MIME Type                       : image/jpeg
Image Width                     : 1920
Image Height                    : 1080
Camera Model Name               : Canon EOS R5
Lens Model                      : RF24-70mm F2.8 L IS USM
Date/Time Original              : 2023:11:02 14:32:07
GPS Latitude                    : 45 deg 30' 54.72" N
GPS Longitude                   : 122 deg 40' 42.24" W
GPS Position                    : 45.5152 N, 122.6784 W
Software                        : Adobe Lightroom 6.14
Creator                         : Daniel Thornton`;
            }
            if (file.includes('avatar') || file.includes('.png')) {
                return `ExifTool Version Number         : 12.67
File Name                       : github_avatar.png
File Size                       : 42 kB
File Type                       : PNG
MIME Type                       : image/png
Image Width                     : 460
Image Height                    : 460
Warning                         : No EXIF metadata found`;
            }
            return `Error: File not found - ${file}`;
        },

        'grep': function(args) {
            if (args.length < 2) return 'Usage: grep [OPTIONS] PATTERN [FILE...]';
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const flags = args.filter(a => a.startsWith('-')).join(' ');
            if (pattern.toLowerCase().includes('email') || pattern.toLowerCase().includes('daniel') || pattern.includes('@')) {
                return `targets.txt:Username: darkphantom99\n/tmp/whois_cache.txt:Registrant Email: daniel.thornton@cybershield-llc.com\nnotes.txt:Cross-reference data between platforms`;
            }
            return '';
        },

        'python3': function(args) {
            if (args.length === 0) return 'Python 3.11.6\nType "exit()" to quit.\n>>> ';
            return 'python3: can\'t open file \'' + args[0] + '\': [Errno 2] No such file or directory';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            return `PING ${target}: 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=28.3 ms\n\n--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
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
