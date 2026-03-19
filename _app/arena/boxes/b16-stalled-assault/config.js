/* ============================================================
   CTF ARENA — Box B16: The Stalled Assault
   Penetration Testing Methodology Troubleshooting | Obsidian Citadel
   Config: multi-host network, pivoting, vuln chaining, flags, hints, lore
   ============================================================ */

const B16Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Stalled Assault',
    subtitle: 'Penetration Testing Methodology — Obsidian Citadel',
    difficulty: 'Expert',
    accent: '#7c3aed',
    storageKey: 'hexworth_ctf_b16',
    registryId: 'b16-stalled-assault',
    trackerKey: 'ctf_b16',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'review',
            name: 'Intel Review',
            icon: '\uD83D\uDCCB',
            description: 'Review Breach-Team-Gamma\'s scattered findings and reports. Identify what they missed.',
            requiredFlags: [],
            mitre: ['T1595.002', 'T1592'],
            unlocks: ['recon'],
            locked: false
        },
        {
            id: 'recon',
            name: 'Advanced Recon',
            icon: '\uD83D\uDD0D',
            description: 'Perform deep enumeration on WEB-PORTAL-01. Discover hidden directories, exposed repos, and credential leaks.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1213'],
            unlocks: ['pivot'],
            locked: true
        },
        {
            id: 'pivot',
            name: 'Pivot & Chain',
            icon: '\uD83D\uDD17',
            description: 'Use discovered credentials to pivot into JUMPBOX-01 via SMB. Access internal tools and enumerate further.',
            requiredFlags: ['user'],
            mitre: ['T1021.002', 'T1570', 'T1078'],
            unlocks: ['compromise'],
            locked: true
        },
        {
            id: 'compromise',
            name: 'Core Compromise',
            icon: '\uD83D\uDEE1\uFE0F',
            description: 'Leverage internal credentials and tools to compromise CORE-DB-01. Extract the Citadel Core Access Keys.',
            requiredFlags: ['root'],
            mitre: ['T1078', 'T1059.004', 'T1005'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE (Sprint AR-12)
    // ═══════════════════════════════════════════════════════

    tutorialMode: false,

    tutorial: {
        steps: [
            {
                title: 'Review the team\'s findings',
                tip: 'Read the team reports in ~/war-room/. Look for gaps in their methodology.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Enumerate the web portal deeper',
                tip: 'Run gobuster or check for .git exposure on WEB-PORTAL-01.',
                trigger: { event: 'command', match: { cmd: 'contains:gobuster' } }
            },
            {
                title: 'Extract credentials from exposed files',
                tip: 'Download and crack the backup archive from the /dev directory.',
                trigger: { event: 'command', match: { cmd: 'contains:unzip' } }
            },
            {
                title: 'Pivot to the internal network',
                tip: 'Use smbclient with the discovered credentials to access JUMPBOX-01.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Compromise the core database',
                tip: 'Analyze the db_connect binary and use hardcoded creds to access CORE-DB-01.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'PENTEST+',
        mappings: [
            { flagId: 'user', objective: '2.1', description: 'Given a scenario, perform passive reconnaissance — Source code repository exposure', skill: 'Git Repository Discovery' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, perform active reconnaissance — Directory enumeration and credential harvesting', skill: 'Credential Extraction' },
            { flagId: 'root', objective: '3.3', description: 'Given a scenario, research attack vectors and perform attacks — Pivoting and lateral movement', skill: 'Network Pivoting' },
            { flagId: 'root', objective: '3.7', description: 'Given a scenario, perform post-exploitation techniques — Internal enumeration and data exfiltration', skill: 'Vulnerability Chaining' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v6.4.0',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/nvme0n1 (1TB NVMe SSD)',
            'Network: eth0 link up (1000Mbps)',
            'Boot device: /dev/nvme0n1p2',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux Rolling',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'operator'
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
        user: 'operator',
        hostname: 'kali',
        startDir: '/home/operator',
        welcome: 'Linux kali 6.6.9-amd64 #1 SMP PREEMPT_DYNAMIC\n\nType \'help\' for available commands.\n\n[WAR ROOM] Breach-Team-Gamma engagement stalled.\nTargets:\n  WEB-PORTAL-01  -> 10.10.30.10 (External)\n  JUMPBOX-01     -> 172.16.1.50 (Internal — not yet reachable)\n  CORE-DB-01     -> 172.16.1.100 (Internal — not yet reachable)\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATA
    // ═══════════════════════════════════════════════════════

    _teamReports: {
        webPortal: 'Nmap shows port 80 open on 10.10.30.10. Apache detected.\nDirectory listing found on /dev/ — "some weird files in there."\nNo further investigation performed.\nStatus: INCOMPLETE',
        jumpbox: 'Nmap shows ports 445 (SMB) and 50000 (unknown) on 172.16.1.50.\nSMB null session: got share names but access denied.\nPort 50000: "custom auth daemon — crashes on bad input."\nStatus: STALLED',
        networkNotes: 'Pivot not attempted. Team lacks credentials for internal hosts.\nChisel binary available in /opt/tools/ but unused.',
        summary: 'Engagement Status: STALLED\nInitial Findings: 3 hosts identified, no compromise achieved.\nRecommendation: Senior operator review required.'
    },

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
        maxScore: 1000,
        hintPenalty: true,
        wrongFlagPenalty: -50,
        speedBonus: { threshold: 1800000, points: 200 },
        timeBonusThreshold: 3600
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'The team mentioned a /dev directory on WEB-PORTAL-01 but never investigated further. Run gobuster or manually browse deeper. Look for backup files or version control exposure.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint2',
            text: 'Check for .git repository exposure on the web portal. Try curl http://10.10.30.10/.git/HEAD or look in /dev/backup_scripts/ for archived credentials.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'The backup archive JUMPBOX_creds.zip is password-protected. The password is weak — try common patterns like Season+Year (e.g., Summer2023!).',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint4',
            text: 'After accessing the JUMPBOX-01 Tools share, run strings on db_connect.exe. Hardcoded credentials for CORE-DB-01 are embedded in the binary.',
            cost: 100,
            penalty: -100
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'You\'ve been deployed to oversee a critical penetration test engagement against the "Obsidian Citadel," a notoriously hardened target housing ancient digital relics. The junior team, Breach-Team-Gamma, has hit a wall. Their reports are disjointed, their tools are yielding no further results, and the entire attack has stalled. Your mission: analyze their scattered findings, identify the methodological gaps, chain the vulnerabilities, and ultimately compromise the Citadel to retrieve the Core Access Keys.',
        scenario: 'Breach-Team-Gamma performed surface-level scans but failed to investigate critical findings. A directory listing on /dev contained backup archives with SMB credentials. The custom authentication daemon on JUMPBOX-01 port 50000 was dismissed as "broken" when it actually conceals a buffer overflow. The team never attempted to pivot, leaving the internal network completely unexplored.',
        outro: 'The Obsidian Citadel has fallen. By methodically reviewing the team\'s incomplete findings, discovering the exposed credentials, pivoting through the jumpbox, and chaining vulnerabilities across three hosts, you achieved what the entire team could not. The Citadel Core Access Keys are yours.',
        ecer: {
            executive: 'Engagement scoping did not allocate sufficient time for methodology review checkpoints',
            culture: 'Junior team lacked mentorship and escalation procedures when stuck',
            employee: 'Team failed to follow enumeration methodology — findings were abandoned prematurely',
            regulatory: 'No quality assurance process required periodic review of pentest engagement progress'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — WEB-PORTAL-01
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.30.10/',

        pages: {
            '/': {
                title: 'Obsidian Citadel — Portal',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#7c3aed; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Obsidian Citadel</h1>
                        <div style="color:#888; font-size:0.8rem;">Internal Resource Portal v3.2.1</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto; color:#ccc; font-size:0.85rem;">
                        <p>Welcome to the Obsidian Citadel internal portal. Access is restricted to authorized personnel.</p>
                        <p style="color:#666; margin-top:20px;">System Status: <span style="color:#22c55e;">OPERATIONAL</span></p>
                        <p style="color:#666;">Last maintenance: 2026-01-15</p>
                    </div>
                `
            },
            '/dev/': {
                title: 'Directory listing — /dev/',
                html: `
                    <div style="font-family:monospace; font-size:0.8rem; color:#ccc;">
                        <h2 style="color:#7c3aed; font-size:1rem;">Index of /dev/</h2>
                        <hr style="border-color:#333;">
                        <pre style="line-height:1.8;">
<a href="/" style="color:#58a6ff;">../</a>
<a href="/dev/backup_scripts/" style="color:#58a6ff;">backup_scripts/</a>         2026-01-10 03:22    -
<a href="/dev/test_config.txt" style="color:#58a6ff;">test_config.txt</a>          2025-12-20 14:55    1.2K
<a href="/dev/deploy_notes.md" style="color:#58a6ff;">deploy_notes.md</a>          2025-11-30 09:41    856
                        </pre>
                    </div>
                `
            },
            '/dev/backup_scripts/': {
                title: 'Directory listing — /dev/backup_scripts/',
                html: `
                    <div style="font-family:monospace; font-size:0.8rem; color:#ccc;">
                        <h2 style="color:#7c3aed; font-size:1rem;">Index of /dev/backup_scripts/</h2>
                        <hr style="border-color:#333;">
                        <pre style="line-height:1.8;">
<a href="/dev/" style="color:#58a6ff;">../</a>
<a href="/dev/backup_scripts/JUMPBOX_creds.zip" style="color:#ff6b6b;">JUMPBOX_creds.zip</a>       2026-01-08 02:15    4.8K
<a href="/dev/backup_scripts/old_deploy.sh" style="color:#58a6ff;">old_deploy.sh</a>            2025-10-14 17:32    2.1K
                        </pre>
                    </div>
                `
            },
            '/dev/test_config.txt': {
                title: 'test_config.txt',
                html: `<pre style="color:#ccc; font-size:0.8rem; font-family:monospace;"># Citadel Portal Test Configuration
# WARNING: Do not deploy with debug mode enabled
DEBUG_MODE=false
DB_HOST=172.16.1.100
DB_PORT=5432
APP_VERSION=3.2.1
# TODO: Remove backup scripts from /dev before production</pre>`
            },
            '/.git/HEAD': {
                title: '.git/HEAD',
                html: `<pre style="color:#ccc; font-size:0.8rem; font-family:monospace;">ref: refs/heads/main</pre>`
            },
            '/.git/config': {
                title: '.git/config',
                html: `<pre style="color:#ccc; font-size:0.8rem; font-family:monospace;">[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
[remote "origin"]
    url = git@internal-git.citadel.local:portal/web-portal.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
    remote = origin
    merge = refs/heads/main
[user]
    name = sysadmin
    email = sysadmin@citadel.local</pre>`
            }
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
                        'operator': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== ENGAGEMENT BRIEFING ===\nClient: Obsidian Citadel\nEngagement Lead: You (Senior Operator)\nJunior Team: Breach-Team-Gamma (STALLED)\n\nTargets:\n  WEB-PORTAL-01  10.10.30.10   (External — reachable)\n  JUMPBOX-01     172.16.1.50   (Internal — requires pivot)\n  CORE-DB-01     172.16.1.100  (Internal — requires pivot)\n\nObjective:\n1. Review Gamma\'s findings in ~/war-room/\n2. Identify missed attack vectors\n3. Chain vulnerabilities across all three hosts\n4. Retrieve Citadel Core Access Keys\n\nFlags: user.txt (pivot creds) + root.txt (core access keys)'
                                },
                                'war-room': {
                                    type: 'dir',
                                    children: {
                                        'gamma-report-web.txt': {
                                            type: 'file',
                                            content: '=== BREACH-TEAM-GAMMA — WEB-PORTAL-01 REPORT ===\nDate: 2026-01-12\nOperator: junior_op_1\n\nFindings:\n- Port 80 open (Apache 2.4.59)\n- Landing page: "Obsidian Citadel Internal Portal"\n- Directory listing found on /dev/ — "some weird files"\n- No further investigation of /dev contents\n- Ran dirb with default wordlist: found /dev, /admin (403)\n\nConclusion: "Nothing exploitable found."\n\n[REVIEWER NOTE: Incomplete. /dev directory was never fully enumerated.\n The team abandoned this vector too early.]'
                                        },
                                        'gamma-report-jumpbox.txt': {
                                            type: 'file',
                                            content: '=== BREACH-TEAM-GAMMA — JUMPBOX-01 REPORT ===\nDate: 2026-01-12\nOperator: junior_op_2\n\nFindings:\n- Port 445 (SMB) open\n- Port 50000 (unknown service) open\n- SMB null session: listed shares (Tools, Admin$, C$, IPC$)\n- Access denied on all shares without credentials\n- Port 50000: "Custom authentication daemon"\n  - Sent garbage data -> service crashed\n  - "Probably just a broken service, moving on"\n\nConclusion: "Dead end without credentials."\n\n[REVIEWER NOTE: The custom daemon crash suggests a buffer overflow.\n SMB shares need valid creds — where might those come from?]'
                                        },
                                        'gamma-report-network.txt': {
                                            type: 'file',
                                            content: '=== BREACH-TEAM-GAMMA — NETWORK ASSESSMENT ===\nDate: 2026-01-12\nOperator: junior_op_1\n\nFindings:\n- External network: 10.10.30.0/24\n- Internal network: 172.16.1.0/24 (discovered via DNS leak)\n- No pivot attempted\n- Chisel binary available at /opt/tools/chisel but unused\n- proxychains config present but not configured\n\nConclusion: "Cannot reach internal hosts from our position."\n\n[REVIEWER NOTE: Classic methodology failure. They never established\n a pivot despite having the tools. Internal hosts are the real target.]'
                                        },
                                        'engagement-status.txt': {
                                            type: 'file',
                                            content: '=== ENGAGEMENT STATUS SUMMARY ===\nClient: Obsidian Citadel\nStatus: STALLED\nDays Remaining: 3\n\nFindings Summary:\n  WEB-PORTAL-01: Port 80 open, directory listing on /dev\n  JUMPBOX-01: SMB + custom service (port 50000)\n  CORE-DB-01: Not yet reachable\n\nCompromise Level: NONE\nPivot Status: NOT ATTEMPTED\n\nSenior operator assigned for review and continuation.'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.10.30.10\ncurl http://10.10.30.10/\ncat ~/war-room/gamma-report-web.txt\ncat ~/war-room/gamma-report-jumpbox.txt'
                                },
                                'loot': {
                                    type: 'dir',
                                    children: {}
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'tools': {
                            type: 'dir',
                            children: {
                                'chisel': {
                                    type: 'file',
                                    content: '[chisel binary — reverse tunnel/SOCKS proxy tool — v1.9.1]'
                                },
                                'ligolo-ng': {
                                    type: 'file',
                                    content: '[ligolo-ng binary — tunneling tool — v0.6.0]'
                                },
                                'pspy64': {
                                    type: 'file',
                                    content: '[pspy — unprivileged Linux process snooping — v1.2.1]'
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
                                        },
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\nbackup\ncgi-bin\nconfig\ndata\ndb\ndev\nimages\nindex\nlogin\nphpmyadmin\nserver-status\ntest\nuploads\n.git'
                                                }
                                            }
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
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\noperator:x:1000:1000:Operator,,,:/home/operator:/bin/bash'
                        },
                        'proxychains4.conf': {
                            type: 'file',
                            content: '# proxychains.conf\n# NOT YET CONFIGURED for this engagement\n[ProxyList]\n# socks5 127.0.0.1 1080\n# TODO: Set up chisel reverse proxy first'
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
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.10.30.10';
            const target = args.find(a => !a.startsWith('-')) || '';
            const hasV = args.includes('-sV') || args.includes('-A');
            const hasAll = args.includes('-p-') || args.includes('-p1-65535');

            if (target === '10.10.30.10') {
                let output = `Starting Nmap 7.94SVN ( https://nmap.org )
Nmap scan report for 10.10.30.10
Host is up (0.028s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE`;
                if (hasV) output += `    VERSION`;
                output += `
80/tcp   open  http`;
                if (hasV) output += `       Apache httpd 2.4.59 ((Debian))`;
                output += `
443/tcp  open  ssl/http`;
                if (hasV) output += `   Apache httpd 2.4.59 ((Debian))`;
                if (hasAll) {
                    output += `
8080/tcp open  http-proxy`;
                    if (hasV) output += ` Squid http proxy 5.7`;
                }
                output += `

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 12.87 seconds`;
                return output;
            }

            if (target === '172.16.1.50') {
                let output = `Starting Nmap 7.94SVN ( https://nmap.org )
Nmap scan report for 172.16.1.50
Host is up (0.045s latency).
Not shown: 997 filtered tcp ports

PORT      STATE SERVICE`;
                if (hasV) output += `      VERSION`;
                output += `
135/tcp   open  msrpc`;
                if (hasV) output += `        Microsoft Windows RPC`;
                output += `
445/tcp   open  microsoft-ds`;
                if (hasV) output += ` Windows Server 2019 SMB`;
                output += `
50000/tcp open  unknown`;
                if (hasV) output += `      Citadel Auth Daemon 1.3`;
                output += `

Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows_server_2019
Nmap done: 1 IP address (1 host up) scanned in 24.31 seconds`;
                return output;
            }

            if (target === '172.16.1.100') {
                return `Starting Nmap 7.94SVN ( https://nmap.org )
Nmap scan report for 172.16.1.100
Host is up (0.051s latency).
Not shown: 998 filtered tcp ports

PORT     STATE SERVICE${hasV ? '    VERSION' : ''}
5432/tcp open  postgresql${hasV ? ' PostgreSQL 15.4' : ''}
22/tcp   open  ssh${hasV ? '        OpenSSH 9.3p1 Ubuntu 1ubuntu3' : ''}

Nmap done: 1 IP address (1 host up) scanned in 18.56 seconds`;
            }

            return `Starting Nmap 7.94SVN ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.12 seconds`;
        },

        'gobuster': function(args, term, engine) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            const url = args.find(a => a.startsWith('http')) || 'http://10.10.30.10/';

            return `Gobuster v3.6
[+] Url:            ${url}
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/.git/HEAD           (Status: 200) [Size: 23]
/.git/config         (Status: 200) [Size: 263]
/admin/              (Status: 403) [Size: 276]
/dev/                (Status: 200) [Size: 1847]
/index.html          (Status: 200) [Size: 2156]
/server-status       (Status: 403) [Size: 276]
===============================================================
Finished`;
        },

        'curl': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.10.30.10') && url.includes('.git/HEAD')) {
                return 'ref: refs/heads/main';
            }
            if (url.includes('10.10.30.10') && url.includes('.git/config')) {
                return `[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
[remote "origin"]
    url = git@internal-git.citadel.local:portal/web-portal.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[user]
    name = sysadmin
    email = sysadmin@citadel.local`;
            }
            if (url.includes('10.10.30.10') && (url.includes('/dev/backup_scripts/') || url.includes('/dev/backup'))) {
                if (url.includes('JUMPBOX_creds.zip')) {
                    return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  4832  100  4832    0     0  96640      0 --:--:-- --:--:-- --:--:-- 98612

[File saved: JUMPBOX_creds.zip — 4.8K]
Note: Archive is password-protected. Use unzip or john to crack.`;
                }
                return `<html><head><title>Index of /dev/backup_scripts/</title></head>
<body><h1>Index of /dev/backup_scripts/</h1>
<pre>
<a href="../">../</a>
<a href="JUMPBOX_creds.zip">JUMPBOX_creds.zip</a>     2026-01-08 02:15    4.8K
<a href="old_deploy.sh">old_deploy.sh</a>         2025-10-14 17:32    2.1K
</pre></body></html>`;
            }
            if (url.includes('10.10.30.10') && url.includes('/dev/')) {
                return `<html><head><title>Index of /dev/</title></head>
<body><h1>Index of /dev/</h1>
<pre>
<a href="../">../</a>
<a href="backup_scripts/">backup_scripts/</a>       2026-01-10 03:22    -
<a href="test_config.txt">test_config.txt</a>       2025-12-20 14:55    1.2K
<a href="deploy_notes.md">deploy_notes.md</a>       2025-11-30 09:41    856
</pre></body></html>`;
            }
            if (url.includes('10.10.30.10')) {
                return `<!DOCTYPE html>
<html>
<head><title>Obsidian Citadel</title></head>
<body>
<h1>Obsidian Citadel</h1>
<p>Internal Resource Portal v3.2.1</p>
<p>Access restricted to authorized personnel.</p>
</body>
</html>`;
            }
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'wget': function(args, term, engine) {
            const url = args.find(a => a.startsWith('http')) || '';
            if (!url) return 'Usage: wget [OPTION]... [URL]...';

            if (url.includes('JUMPBOX_creds.zip')) {
                return `--2026-01-15 14:22:01--  ${url}
Resolving 10.10.30.10... 10.10.30.10
Connecting to 10.10.30.10:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 4832 (4.8K) [application/zip]
Saving to: 'JUMPBOX_creds.zip'

JUMPBOX_creds.zip   100%[==================>]   4.72K  --.-KB/s    in 0s

2026-01-15 14:22:01 (48.2 MB/s) - 'JUMPBOX_creds.zip' saved [4832/4832]`;
            }
            return `--2026-01-15 14:22:01--  ${url}
Connecting to ${url.replace(/https?:\/\//, '').split('/')[0]}... failed: Connection refused.`;
        },

        'unzip': function(args, term, engine) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (!file) return 'Usage: unzip [-P password] file.zip';

            if (file.includes('JUMPBOX_creds') || file === 'JUMPBOX_creds.zip') {
                const passFlag = args.indexOf('-P');
                const password = passFlag !== -1 ? args[passFlag + 1] : null;

                if (!password) {
                    return `Archive:  JUMPBOX_creds.zip
   creating: jumpbox_creds/
[JUMPBOX_creds.zip] jumpbox_creds/smb_access.txt password:
   skipping: jumpbox_creds/smb_access.txt        incorrect password
   skipping: jumpbox_creds/service_notes.txt      incorrect password

Note: Archive is password-protected. Use -P <password> to provide password.`;
                }

                if (password === 'Summer2023!' || password === 'summer2023!') {
                    return `Archive:  JUMPBOX_creds.zip
   creating: jumpbox_creds/
  inflating: jumpbox_creds/smb_access.txt
  inflating: jumpbox_creds/service_notes.txt

Extracted 2 files successfully.

=== jumpbox_creds/smb_access.txt ===
SMB Access Credentials for JUMPBOX-01:
  Host: 172.16.1.50
  Share: Tools
  Username: citadel_maint
  Password: 0bs1d1an_M41nt_2025!

=== jumpbox_creds/service_notes.txt ===
Custom auth daemon on port 50000:
  - Written by intern, no input validation
  - Buffer overflow at 256 bytes
  - Service restarts every 5 minutes via scheduled task`;
                }

                return `Archive:  JUMPBOX_creds.zip
[JUMPBOX_creds.zip] jumpbox_creds/smb_access.txt password:
   skipping: jumpbox_creds/smb_access.txt        incorrect password
   skipping: jumpbox_creds/service_notes.txt      incorrect password`;
            }
            return `unzip: cannot find ${file}`;
        },

        'zip2john': function(args) {
            const file = args[0] || '';
            if (file.includes('JUMPBOX_creds')) {
                return `JUMPBOX_creds.zip/jumpbox_creds/smb_access.txt:$pkzip$1*1*2*0*1e*12*a4b2c3d4*0*42*8*1e*a4b2*b7d3*d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9*$/pkzip$:jumpbox_creds/smb_access.txt:JUMPBOX_creds.zip`;
            }
            return `Usage: zip2john <zip_file>`;
        },

        'john': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (!file) return 'Usage: john [options] <password-file>';

            if (args.includes('--show')) {
                return `JUMPBOX_creds.zip:Summer2023!:::::JUMPBOX_creds.zip

1 password hash cracked, 0 left`;
            }

            return `Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Press 'q' or Ctrl-C to abort, 'h' for help
Summer2023!      (JUMPBOX_creds.zip)
1g 0:00:00:03 DONE (2026-01-15 14:25) 0.3125g/s 1024000p/s
Use "--show" to display cracked passwords`;
        },

        'smbclient': function(args, term, engine) {
            if (args.length === 0) return 'Usage: smbclient //server/share -U username%password';

            const shareArg = args[0] || '';
            const userArg = args.find(a => a.startsWith('-U'));
            const userIdx = args.indexOf('-U');
            const creds = userIdx !== -1 ? args[userIdx + 1] : null;

            // List shares
            if (args.includes('-L') || args.includes('-N')) {
                if (shareArg.includes('172.16.1.50') || args.find(a => a.includes('172.16.1.50'))) {
                    return `
    Sharename       Type      Comment
    ---------       ----      -------
    Tools           Disk      Maintenance Tools
    Admin$          Disk      Remote Admin
    C$              Disk      Default share
    IPC$            IPC       Remote IPC

SMB1 disabled -- no workgroup available`;
                }
            }

            // Connect to Tools share
            if (shareArg.includes('Tools') || shareArg.includes('tools')) {
                if (creds && (creds.includes('citadel_maint') && creds.includes('0bs1d1an_M41nt_2025!'))) {
                    return `Try "help" to get a list of possible commands.
smb: \\> dir
  .                  D        0  Wed Jan  8 14:30:00 2026
  ..                 D        0  Wed Jan  8 14:30:00 2026
  db_connect.exe     A    28672  Mon Dec 15 09:22:00 2025
  netscan.bat        A     1024  Tue Nov 30 11:15:00 2025
  README.txt         A      512  Mon Dec 15 09:25:00 2025

                51200 blocks of size 4096. 38400 blocks available.

smb: \\> get db_connect.exe
getting file \\db_connect.exe as db_connect.exe (892.0 KiloBytes/sec)

=== File downloaded: db_connect.exe ===

{{FLAG:user}}`;
                }
                return `tree connect failed: NT_STATUS_ACCESS_DENIED`;
            }
            return `Connection to host failed: NT_STATUS_UNSUCCESSFUL`;
        },

        'strings': function(args, term, engine) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (!file) return 'Usage: strings <file>';

            if (file.includes('db_connect')) {
                return `!This program cannot be run in DOS mode.
.text
.rdata
.data
.rsrc
Citadel DB Connector v2.1
Connecting to PostgreSQL...
Host: 172.16.1.100
Port: 5432
Database: citadel_core
Username: db_admin
Password: C1tad3l_C0r3_Acc3ss!
PQconnectdb
PQstatus
PQexec
libpq.dll
KERNEL32.dll
msvcrt.dll
Connection established.
Authentication successful.
WARNING: Credentials hardcoded — update before production deployment`;
            }

            if (file.includes('README')) {
                return `Citadel Maintenance Tools
========================
db_connect.exe - Database connection utility for CORE-DB-01
netscan.bat    - Quick network scanner for internal hosts
Last updated: 2025-12-15`;
            }

            return `strings: '${file}': No such file`;
        },

        'psql': function(args, term, engine) {
            if (args.length === 0) return 'Usage: psql -h <host> -U <user> -d <database>';

            const hostIdx = args.indexOf('-h');
            const userIdx = args.indexOf('-U');
            const dbIdx = args.indexOf('-d');
            const host = hostIdx !== -1 ? args[hostIdx + 1] : '';
            const user = userIdx !== -1 ? args[userIdx + 1] : '';

            if (host === '172.16.1.100' && user === 'db_admin') {
                return `psql (15.4)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384)
Type "help" for help.

citadel_core=> \\dt
              List of relations
 Schema |       Name        | Type  |  Owner
--------+-------------------+-------+----------
 public | access_keys       | table | db_admin
 public | audit_log         | table | db_admin
 public | personnel         | table | db_admin
 public | system_config     | table | db_admin
(4 rows)

citadel_core=> SELECT * FROM access_keys;
 id |        key_name         |               key_value                | classification
----+-------------------------+----------------------------------------+----------------
  1 | Citadel Core Master Key | {{FLAG:root}}                          | TOP SECRET
  2 | Backup Encryption Key   | CLASSIFIED-REDACTED                    | SECRET
  3 | Emergency Override       | CLASSIFIED-REDACTED                    | SECRET
(3 rows)

citadel_core=>`;
            }

            return `psql: error: connection to server at "${host || 'localhost'}" failed: Connection refused`;
        },

        'enum4linux': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: enum4linux [options] <target>';

            if (target === '172.16.1.50') {
                return `Starting enum4linux v0.9.1
==============================
|    Target Information    |
==============================
Target ........... 172.16.1.50
RID Range ........ 500-550,1000-1050
Username ......... ''
Password ......... ''

====================================
|    Share Enumeration on 172.16.1.50    |
====================================
Sharename       Type      Comment
---------       ----      -------
Tools           Disk      Maintenance Tools
Admin$          Disk      Remote Admin
C$              Disk      Default share
IPC$            IPC       Remote IPC

[+] Attempting to map shares on 172.16.1.50
//172.16.1.50/Tools    Mapping: DENIED, Listing: N/A
//172.16.1.50/Admin$   Mapping: DENIED, Listing: N/A

====================================
|    Users on 172.16.1.50    |
====================================
[+] user:[citadel_maint] rid:[0x3e8]
[+] user:[Administrator] rid:[0x1f4]
[+] user:[Guest] rid:[0x1f5]

enum4linux complete.`;
            }
            return `enum4linux: cannot connect to ${target}`;
        },

        'crackmapexec': function(args) {
            const proto = args[0] || '';
            const target = args[1] || '';
            if (!proto || !target) return 'Usage: crackmapexec <protocol> <target> [options]';

            if (proto === 'smb' && target === '172.16.1.50') {
                const userIdx = args.indexOf('-u');
                const passIdx = args.indexOf('-p');
                if (userIdx !== -1 && passIdx !== -1) {
                    const user = args[userIdx + 1];
                    const pass = args[passIdx + 1];
                    if (user === 'citadel_maint' && pass === '0bs1d1an_M41nt_2025!') {
                        return `SMB  172.16.1.50  445  JUMPBOX-01  [*] Windows Server 2019 Build 17763 x64
SMB  172.16.1.50  445  JUMPBOX-01  [+] citadel.local\\citadel_maint:0bs1d1an_M41nt_2025!`;
                    }
                }
                return `SMB  172.16.1.50  445  JUMPBOX-01  [*] Windows Server 2019 Build 17763 x64
SMB  172.16.1.50  445  JUMPBOX-01  [-] Authentication failed`;
            }
            return `[!] Error connecting to ${target}`;
        },

        'chisel': function(args) {
            if (args.length === 0) return 'Usage: chisel server --reverse --port <port>\n       chisel client <server>:<port> R:socks';
            if (args[0] === 'server') {
                return `2026/01/15 14:30:00 server: Listening on 0.0.0.0:8888...
2026/01/15 14:30:00 server: Reverse tunneling enabled
[Chisel server running — waiting for client connections]`;
            }
            return `2026/01/15 14:30:05 client: Connected to server
2026/01/15 14:30:05 client: Tunnel established`;
        },

        'proxychains': function(args) {
            if (args.length === 0) return 'Usage: proxychains <command>';
            return `[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/libproxychains4.so
[proxychains] DLL init: proxychains-ng 4.16
[proxychains] NOTE: Configure SOCKS proxy first via chisel or similar tool.`;
        },

        'git-dumper': function(args) {
            const url = args.find(a => a.startsWith('http')) || '';
            if (!url) return 'Usage: git-dumper <url>/.git/ <output_dir>';

            if (url.includes('10.10.30.10')) {
                return `[-] Testing http://10.10.30.10/.git/HEAD [200]
[-] Testing http://10.10.30.10/.git/config [200]
[-] Fetching .git/HEAD
[-] Fetching .git/config
[-] Fetching .git/refs/heads/main
[-] Fetching .git/objects/...
[+] Repository dumped to output directory
[+] Found credentials in commit history:
    commit a3f7b2c: "removed hardcoded creds from config"
    --- a/config/db_settings.ini
    +++ /dev/null
    -SMB_USER=citadel_maint
    -SMB_PASS=0bs1d1an_M41nt_2025!`;
            }
            return `[-] ${url} does not appear to be a git repository`;
        },

        'nc': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            const port = args[args.length - 1] || '';
            if (!target) return 'Usage: nc [options] <host> <port>';

            if (target === '172.16.1.50' && port === '50000') {
                return `Connected to 172.16.1.50:50000
=== Citadel Authentication Daemon v1.3 ===
Enter authorization token: `;
            }
            return `nc: connect to ${target} port ${port} (tcp) failed: Connection refused`;
        },

        'python3': function(args) {
            if (args.includes('-c')) {
                const codeIdx = args.indexOf('-c');
                const code = args.slice(codeIdx + 1).join(' ');
                if (code.includes('A') && code.includes('256')) {
                    return `[*] Generating buffer overflow payload...
[*] Offset: 256 bytes
[*] Payload: A*256 + \\x41\\x41\\x41\\x41 (EIP overwrite)
[*] Sending to 172.16.1.50:50000...
[+] Service crashed! Buffer overflow confirmed.
[+] With proper shellcode, RCE is achievable.`;
                }
            }
            return 'Python 3.11.6';
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';

            return `---- Scanning URL: ${target} ----
+ ${target}/.git/HEAD (CODE:200|SIZE:23)
+ ${target}/admin/ (CODE:403|SIZE:276)
+ ${target}/dev/ (CODE:200|SIZE:1847)
+ ${target}/index.html (CODE:200|SIZE:2156)
+ ${target}/server-status (CODE:403|SIZE:276)

---- Results ----
5 results found.`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.30.10') {
                return `PING 10.10.30.10 (10.10.30.10) 56(84) bytes of data.
64 bytes from 10.10.30.10: icmp_seq=1 ttl=64 time=28.3 ms
64 bytes from 10.10.30.10: icmp_seq=2 ttl=64 time=27.9 ms
64 bytes from 10.10.30.10: icmp_seq=3 ttl=64 time=28.7 ms

--- 10.10.30.10 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 27.9/28.3/28.7/0.327 ms`;
            }
            if (target === '172.16.1.50' || target === '172.16.1.100') {
                return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss
[!] Internal host not reachable — pivot required`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.10.30.10
+ Target Hostname:  web-portal-01.citadel.local
+ Target Port:      80
+ Server: Apache/2.4.59 (Debian)
+ /.git/HEAD: Git repository found
+ /dev/: Directory listing enabled — sensitive files may be exposed
+ /admin/: Access denied (403) — admin panel detected
+ Apache/2.4.59 appears to be outdated
+ OSVDB-3092: /dev/backup_scripts/: Backup directory found
+ 8 items checked: 5 findings`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#7c3aed; border-bottom:2px solid #333; background:rgba(124,58,237,0.1);">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #222;">${cell}</td>`;
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
