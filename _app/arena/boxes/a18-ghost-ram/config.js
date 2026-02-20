/* ============================================================
   CTF ARENA — Box A18: The Ghost in the RAM
   Memory Forensics — Chronos Collective | Volatility Framework
   Config: Volatility command simulation, process tables, network
           connections, memory dumps, filesystem, flags, hints, lore
   ============================================================ */

const A18Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Ghost in the RAM',
    subtitle: 'Memory Forensics — Chronos Collective',

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
    difficulty: 'Expert',
    accent: '#1a5276',
    storageKey: 'hexworth_ctf_a18',
    trackerKey: 'ctf_a18',

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'CS0-003',
        mappings: [
            // CySA+ CS0-003 mappings
            { flagId: 'user',      objective: '4.4',  description: 'Given an incident, analyze potentially malicious activity',                          skill: 'Memory Dump C2 Beacon Analysis',             mitre: 'T1057 / T1049' },
            { flagId: 'root',      objective: '4.4',  description: 'Given an incident, analyze potentially malicious activity',                          skill: 'Volatile Memory Forensics & Threat Intel',   mitre: 'T1003.001 / T1005' },
            // SY0-701 mappings
            { flagId: 'user',      objective: '4.3',  description: 'Explain various activities associated with incident response',                       skill: 'Network Artifact Extraction from Memory',    mitre: 'T1049 / T1082',      certPath: 'SY0-701' },
            { flagId: 'root',      objective: '4.3',  description: 'Explain various activities associated with incident response',                       skill: 'Process Memory Extraction & Data Recovery',  mitre: 'T1003.001',          certPath: 'SY0-701' },
            // MITRE ATT&CK technique coverage (informational)
            { flagId: 'phase1',    objective: 'T1082', description: 'System Information Discovery — OS profile identification via windows.info',        skill: 'OS Fingerprinting from Memory Image',        mitre: 'T1082' },
            { flagId: 'phase2',    objective: 'T1057', description: 'Process Discovery — Identify malicious process via pslist/pstree',                 skill: 'Volatile Process Analysis & PPID Anomaly',   mitre: 'T1057 / T1055' },
            { flagId: 'phase3',    objective: 'T1003', description: 'OS Credential Dumping — Extract NTLM hashes via windows.hashdump',                skill: 'Credential Extraction from LSASS',           mitre: 'T1003.001' },
            { flagId: 'phase4',    objective: 'T1005', description: 'Data from Local System — Recover intel_briefing.txt from process memory',         skill: 'Artifact Recovery from Process Heap',        mitre: 'T1005 / T1055' }
        ],
        // Bloom's Taxonomy levels exercised
        bloomsLevels: ['Remember', 'Understand', 'Apply', 'Analyze'],
        // Workforce framework alignment
        niceRoles: ['IN-FOR-001 Cyber Defense Forensics Analyst', 'PR-INV-001 Cyber Crime Investigator'],
        dfirPhases: ['Identification', 'Preservation', 'Analysis', 'Reporting']
    },

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (AR-14 — Structured Learning Progression)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'phase1',
            name: 'Recon — Acquire & Profile',
            icon: '🔍',
            order: 1,
            mitre: ['T1082'],
            objective: 'Identify the OS profile from the memory image so Volatility knows how to parse kernel structures.',
            steps: [
                'Verify the memory dump integrity: sha256sum alpha_memdump.raw',
                'Identify the OS: vol.py -f alpha_memdump.raw windows.info',
                'Confirm architecture, kernel version, and system time'
            ],
            successCondition: '_state.profileIdentified',
            hint: 'The windows.info plugin reads the kernel\'s version block directly from memory. No profile flag needed in Volatility 3.',
            completionMessage: 'OS profile confirmed: Windows 10 x64 Build 19041. Volatility can now parse kernel structures. Moving to process analysis.'
        },
        {
            id: 'phase2',
            name: 'Process Analysis — Hunt the Ghost',
            icon: '👻',
            order: 2,
            mitre: ['T1057', 'T1055'],
            objective: 'Enumerate all processes and identify the malicious implant by its parent PID anomaly and suspicious name.',
            steps: [
                'List all processes: vol.py -f alpha_memdump.raw windows.pslist',
                'View process hierarchy: vol.py -f alpha_memdump.raw windows.pstree',
                'Inspect command lines: vol.py -f alpha_memdump.raw windows.cmdline',
                'Note the orphaned PPID=1 process — legitimate Windows processes do not have this parent'
            ],
            successCondition: '_state.malProcessFound',
            hint: 'Windows processes always have a valid parent. A PPID of 1 (smss.exe territory) for a user-space binary is a strong anomaly indicator — especially one living in \\Windows\\Temp\\.',
            completionMessage: 'chronos_agent.exe (PID 4892) identified. PPID=1 indicates parent process terminated after injection. Command line reveals stealth, C2 auto-discovery, scheduled task persistence, and DNS exfil.'
        },
        {
            id: 'phase3',
            name: 'Memory Extraction — Pull the Credentials',
            icon: '🗄️',
            order: 3,
            mitre: ['T1003.001', 'T1055'],
            objective: 'Extract injected code artifacts, network connections, and credential material from volatile memory.',
            steps: [
                'Scan for injected code: vol.py -f alpha_memdump.raw windows.malfind',
                'Dump network connections: vol.py -f alpha_memdump.raw windows.netscan',
                'Extract NTLM hashes: vol.py -f alpha_memdump.raw windows.hashdump',
                'Identify C2 IP from chronos_agent.exe connections — this is User Flag 1',
                'Examine loaded DLLs: vol.py -f alpha_memdump.raw windows.dlllist --pid 4892'
            ],
            successCondition: '_state.c2Found',
            hint: 'windows.malfind identifies PAGE_EXECUTE_READWRITE regions — a hallmark of reflective DLL injection. The netscan plugin will reveal the established C2 connection. C2 IP → format for the flag.',
            completionMessage: 'C2 infrastructure exposed: 10.13.37.100:443 (HTTPS beacon) and 10.13.37.100:8443 (reverse shell). User flag recovered. Injected PE confirms process hollowing technique.'
        },
        {
            id: 'phase4',
            name: 'Evidence Correlation — Recover the Briefing',
            icon: '📋',
            order: 4,
            mitre: ['T1005', 'T1003'],
            objective: 'Reconstruct the classified Intel Briefing from the notepad.exe process heap — the root flag lives here.',
            steps: [
                'Scan for open file objects: vol.py -f alpha_memdump.raw windows.filescan',
                'Check notepad.exe handles: vol.py -f alpha_memdump.raw windows.handles --pid 3284',
                'Dump notepad memory: vol.py -f alpha_memdump.raw windows.memdump --pid 3284 --dump-dir .',
                'Extract strings: strings pid.3284.dmp | grep -i flag',
                'Alternatively: vol.py -f alpha_memdump.raw windows.dumpfiles --pid 3284 → cat file.0x7a8401235480.dat'
            ],
            successCondition: '_state.memoryDumped',
            hint: 'Even if a document has been closed, its content may still reside in the process heap until overwritten. notepad.exe loaded intel_briefing.txt — dump its memory and search for the authorization code.',
            completionMessage: 'Intel Briefing recovered from heap memory. Authorization code extracted. The Chronos Collective\'s C2 infrastructure is now compromised. Operation Midnight Sun: neutralized.'
        },
        {
            id: 'phase5',
            name: 'Report — Reconstruct the Timeline',
            icon: '📊',
            order: 5,
            mitre: ['T1082', 'T1057', 'T1055', 'T1003.001', 'T1005', 'T1547.001'],
            objective: 'Synthesize all findings into a complete attack timeline from initial execution to data access.',
            steps: [
                'Cross-reference process create times from pslist output',
                'Map the kill chain: initial access → execution → persistence → C2 → collection',
                'Document: chronos_agent.exe spawned at 09:44:18 → cmd.exe at 09:44:22 → recon.txt created → C2 established → intel accessed at 14:22:47',
                'Identify MITRE ATT&CK techniques: T1547.001 (Registry Run Keys), T1055 (Process Injection), T1003.001 (LSASS Memory), T1049 (Network Discovery)',
                'Submit both flags to complete the analysis'
            ],
            successCondition: null,
            // Phase 5 is narrative/synthesis — no programmatic success check, flags are already submitted
            hint: 'The timestamp gap between chronos_agent.exe launch (09:44) and intel_briefing.txt access (14:22) suggests the attacker waited ~5 hours before accessing the classified document — consistent with APT dwell time behavior.',
            completionMessage: 'Full attack chain documented. The Chronos Collective used a spear-phish to deploy chronos_agent.exe, established persistence via registry run key masquerading as Windows Health Monitoring Service, communicated with 10.13.37.100 over encrypted HTTPS, and exfiltrated classified intel via DNS tunneling. Threat neutralized.'
        }
    ],

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
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
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
        hostname: 'forensics-ws',
        startDir: '/home/kali',
        welcome: 'Linux forensics-ws 6.1.0-kali9-amd64 #1 SMP\n\nForensics Workstation — Volatility 3 Framework installed\nType \'help\' for available commands.\n\nEvidence file: ~/alpha_memdump.raw (4 GB)\n'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{chr0n0s_c2_10_13_37_100}', points: 100 },
        { id: 'root', value: 'flag{1nt3l_br13f1ng_chr0n0s_d3f34t3d}', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 }   // 20 minutes
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            cost: 10,
            penalty: -10,
            phase: 'phase1',
            title: 'Getting Started — Profile the Dump',
            text: "Start with vol.py -f alpha_memdump.raw windows.info to identify the OS profile, then windows.pslist to list all running processes. Volatility 3 auto-detects the profile — no --profile flag needed.",
            mitre: 'T1082'
        },
        {
            id: 'hint2',
            cost: 25,
            penalty: -25,
            phase: 'phase2',
            title: 'Hunt the Implant — PPID Anomaly',
            text: "Look for unusual processes in the process list. chronos_agent.exe is not a standard Windows process — its PPID of 1 is suspicious (orphaned parent). Legitimate user-space processes are children of explorer.exe or services.exe, not PID 1. Also check windows.pstree and windows.cmdline for launch parameters.",
            mitre: 'T1057 / T1055'
        },
        {
            id: 'hint3',
            cost: 50,
            penalty: -50,
            phase: 'phase3',
            title: 'C2 Discovery — User Flag',
            text: "Use vol.py -f alpha_memdump.raw windows.netscan to find active network connections. Look for the ESTABLISHED connection from chronos_agent.exe (PID 4892). The C2 IP forms the user flag: flag{chr0n0s_c2_<IP with dots replaced by underscores>}. Also try windows.malfind to see the injected PE payload.",
            mitre: 'T1049 / T1055'
        },
        {
            id: 'hint4',
            cost: 75,
            penalty: -75,
            phase: 'phase4',
            title: 'Recover the Briefing — Root Flag',
            text: "The Intel Briefing was open in notepad.exe (PID 3284). Dump its memory with: vol.py -f alpha_memdump.raw windows.memdump --pid 3284 --dump-dir . Then search with: strings pid.3284.dmp | grep -i flag. Alternatively: vol.py windows.dumpfiles --pid 3284 creates file.0x7a8401235480.dat which you can cat directly.",
            mitre: 'T1005 / T1003.001'
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Intelligence analysts at SIGINT Station Echo-7 flagged an anomaly: SRV-INTEL-ALPHA — a classified document server — initiated an outbound HTTPS beacon to an unregistered IP at 09:44 UTC. The machine was powered off 4 hours and 47 minutes later. The disks were wiped. All that remains is a 4 GB memory image captured in the last seconds before shutdown.\n\nThe Chronos Collective — a nation-state APT known for targeting critical infrastructure — is the prime suspect. An analyst had the classified Intel Briefing open on screen when the intrusion occurred. If they read it, NATO operation timelines for the energy sector may be compromised.\n\nYour job: reconstruct everything from RAM. The ghost is in there. Find it.',

        scenario: {
            setting: 'Forensics Workstation — SIGINT Station Echo-7',
            date: '2024-11-13',
            targetSystem: 'SRV-INTEL-ALPHA (Windows 10 x64)',
            evidence: 'alpha_memdump.raw (4 GB raw memory image)',
            threat: 'Chronos Collective — Advanced Persistent Threat (APT)',
            classification: 'TOP SECRET // NOFORN',
            stakes: 'NATO energy sector SCADA systems — Q1 2025 operation timeline',
            tool: 'Volatility 3 Framework v2.5.2',
            adversaryTTP: [
                'Initial Access: Spear-phishing with weaponized document (T1566.001)',
                'Execution: chronos_agent.exe — custom Remote Access Trojan (T1059.003)',
                'Persistence: Registry Run Key + Scheduled Task masquerading as WindowsHealthService (T1547.001 / T1053.005)',
                'Defense Evasion: Masquerading as legitimate service name (T1036.004)',
                'C2: HTTPS beacon to 10.13.37.100:443 — BEACON_INTERVAL=30s, JITTER=30% (T1071.001)',
                'Exfiltration: DNS tunneling to data.chronos-c2.net (T1048.003)',
                'Collection: Classified document access via open notepad.exe session (T1005)',
                'Credential Access: Injected shellcode targeting LSASS for credential harvest (T1003.001)'
            ]
        },

        ecer: {
            // Educational / ECER Research Integration (PhD research hooks)
            researchQuestion: 'Can students trained exclusively on memory forensics simulation reproduce Volatility 3 command sequences accurately on real memory images?',
            learningObjectives: [
                'LO1: Demonstrate correct Volatility 3 plugin sequencing for OS identification, process analysis, and memory extraction (Bloom\'s Apply)',
                'LO2: Identify PPID anomalies, injected PE artifacts, and C2 network indicators in process memory (Bloom\'s Analyze)',
                'LO3: Reconstruct an APT kill chain from volatile memory artifacts alone — no disk evidence (Bloom\'s Evaluate)',
                'LO4: Map discovered artifacts to MITRE ATT&CK TTPs with supporting evidence (Bloom\'s Create)'
            ],
            prerequisiteKnowledge: [
                'Windows process architecture (PPID chains, session IDs)',
                'Basic networking (TCP states, port conventions)',
                'PE file format (MZ header, sections)',
                'Command-line proficiency (pipes, grep, strings)'
            ],
            assessmentRubric: {
                emerging:    'Can identify chronos_agent.exe via pslist; cannot explain PPID anomaly or extract flags independently',
                developing:  'Uses pslist + netscan to find C2 IP; extracts user flag; needs hints for root flag extraction method',
                proficient:  'Completes both flags without hints; explains PPID anomaly, malfind output, and persistence mechanism',
                exemplary:   'Completes both flags, documents full ATT&CK kill chain, identifies all decoy artifacts, explains volatility plugin selection rationale'
            },
            researchMetrics: [
                'Time to first command (proxy for tool familiarity)',
                'Hints consumed and at which phase',
                'Command error rate (wrong flags, wrong file arguments)',
                'Plugin selection order (optimal vs exploratory)',
                'Decoy artifact investigation rate (how many students chase BSOD.dmp)'
            ],
            estimatedCompletionTime: { min: 25, max: 75, unit: 'minutes' },
            difficultyJustification: 'Expert rating reflects the requirement to synthesize OS forensics, process analysis, network forensics, and memory extraction across 5 progressive phases — no single command yields either flag.'
        },

        outro: 'The ghost has been exorcised from the RAM. The Chronos Collective\'s operative thought volatile memory would leave no trace — but every process, every connection, every byte lingers until the capacitors drain. You reconstructed the Intel Briefing from the spectral residue of a dead machine. The Collective\'s C2 infrastructure is now compromised. Operation Midnight Sun: neutralized.',

        debrief: {
            keyTakeaways: [
                'Volatile memory is forensic gold — even after disk wipes, RAM preserves process state, network connections, file handles, and heap contents',
                'PPID anomalies are a reliable indicator of process injection and orphaned malware implants',
                'windows.malfind detects PAGE_EXECUTE_READWRITE regions — the hallmark of reflective DLL injection',
                'Nation-state actors use legitimate-sounding service names (WindowsHealthService) to blend persistence into the OS noise',
                'DNS exfiltration is difficult to detect via endpoint tools — memory forensics can expose it through process command-line analysis'
            ],
            realWorldContext: 'The Chronos Collective TTP profile is based on observed behaviors from APT groups targeting energy-sector SCADA systems, including use of custom RATs with encrypted C2 over standard HTTPS ports to blend with legitimate traffic.',
            furtherReading: [
                'The Art of Memory Forensics (Ligh, Case, Levy, Walters)',
                'Volatility 3 documentation: https://volatility3.readthedocs.io',
                'MITRE ATT&CK Enterprise Matrix — Defense Evasion: T1036.004',
                'CISA Advisory on APT targeting energy sector ICS/SCADA'
            ]
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — None (pure terminal forensics)
    // ═══════════════════════════════════════════════════════

    webApp: null,

    // ═══════════════════════════════════════════════════════
    // STATE TRACKING
    // ═══════════════════════════════════════════════════════

    _state: {
        profileIdentified: false,
        malProcessFound: false,
        c2Found: false,
        memoryDumped: false
    },

    // ═══════════════════════════════════════════════════════
    // PROCESS TABLE — Windows 10 memory image
    // ═══════════════════════════════════════════════════════

    _processes: [
        { pid: 4,    ppid: 0,    name: 'System',              threads: 164, handles: 2987, session: '-',  wow64: false, createTime: '2024-11-13 08:12:01' },
        { pid: 108,  ppid: 4,    name: 'Registry',            threads: 4,   handles: 0,    session: '-',  wow64: false, createTime: '2024-11-13 08:12:00' },
        { pid: 396,  ppid: 4,    name: 'smss.exe',            threads: 2,   handles: 53,   session: '-',  wow64: false, createTime: '2024-11-13 08:12:01' },
        { pid: 544,  ppid: 528,  name: 'csrss.exe',           threads: 11,  handles: 512,  session: '0',  wow64: false, createTime: '2024-11-13 08:12:03' },
        { pid: 620,  ppid: 528,  name: 'wininit.exe',         threads: 1,   handles: 154,  session: '0',  wow64: false, createTime: '2024-11-13 08:12:04' },
        { pid: 628,  ppid: 612,  name: 'csrss.exe',           threads: 12,  handles: 543,  session: '1',  wow64: false, createTime: '2024-11-13 08:12:04' },
        { pid: 704,  ppid: 612,  name: 'winlogon.exe',        threads: 3,   handles: 201,  session: '1',  wow64: false, createTime: '2024-11-13 08:12:05' },
        { pid: 768,  ppid: 620,  name: 'services.exe',        threads: 8,   handles: 698,  session: '0',  wow64: false, createTime: '2024-11-13 08:12:06' },
        { pid: 776,  ppid: 620,  name: 'lsass.exe',           threads: 10,  handles: 1543, session: '0',  wow64: false, createTime: '2024-11-13 08:12:06' },
        { pid: 892,  ppid: 768,  name: 'svchost.exe',         threads: 22,  handles: 876,  session: '0',  wow64: false, createTime: '2024-11-13 08:12:08' },
        { pid: 956,  ppid: 768,  name: 'svchost.exe',         threads: 12,  handles: 445,  session: '0',  wow64: false, createTime: '2024-11-13 08:12:09' },
        { pid: 1024, ppid: 768,  name: 'svchost.exe',         threads: 18,  handles: 612,  session: '0',  wow64: false, createTime: '2024-11-13 08:12:09' },
        { pid: 1108, ppid: 768,  name: 'svchost.exe',         threads: 6,   handles: 298,  session: '0',  wow64: false, createTime: '2024-11-13 08:12:10' },
        { pid: 1196, ppid: 768,  name: 'svchost.exe',         threads: 14,  handles: 532,  session: '0',  wow64: false, createTime: '2024-11-13 08:12:10' },
        { pid: 1384, ppid: 768,  name: 'spoolsv.exe',         threads: 7,   handles: 312,  session: '0',  wow64: false, createTime: '2024-11-13 08:12:14' },
        { pid: 1660, ppid: 768,  name: 'svchost.exe',         threads: 8,   handles: 267,  session: '0',  wow64: false, createTime: '2024-11-13 08:12:18' },
        { pid: 2140, ppid: 768,  name: 'MsMpEng.exe',         threads: 28,  handles: 1102, session: '0',  wow64: false, createTime: '2024-11-13 08:12:24' },
        { pid: 2416, ppid: 704,  name: 'dwm.exe',             threads: 15,  handles: 1890, session: '1',  wow64: false, createTime: '2024-11-13 08:13:01' },
        { pid: 2876, ppid: 2848, name: 'explorer.exe',        threads: 42,  handles: 2104, session: '1',  wow64: false, createTime: '2024-11-13 08:13:12' },
        { pid: 3284, ppid: 2876, name: 'notepad.exe',         threads: 4,   handles: 228,  session: '1',  wow64: false, createTime: '2024-11-13 14:22:47' },
        { pid: 3512, ppid: 2876, name: 'cmd.exe',             threads: 2,   handles: 89,   session: '1',  wow64: false, createTime: '2024-11-13 14:18:33' },
        { pid: 4892, ppid: 1,    name: 'chronos_agent.exe',   threads: 6,   handles: 342,  session: '0',  wow64: false, createTime: '2024-11-13 09:44:18' },
        { pid: 5016, ppid: 4892, name: 'cmd.exe',             threads: 1,   handles: 42,   session: '0',  wow64: false, createTime: '2024-11-13 09:44:22' },
        { pid: 5204, ppid: 768,  name: 'SearchIndexer.exe',   threads: 16,  handles: 987,  session: '0',  wow64: false, createTime: '2024-11-13 08:13:22' },
        { pid: 5340, ppid: 768,  name: 'WmiPrvSE.exe',        threads: 9,   handles: 312,  session: '0',  wow64: false, createTime: '2024-11-13 08:14:01' },
    ],

    // ═══════════════════════════════════════════════════════
    // NETWORK CONNECTION TABLE
    // ═══════════════════════════════════════════════════════

    _netConnections: [
        { proto: 'TCPv4', localAddr: '10.10.14.50', localPort: 49721, foreignAddr: '10.13.37.100',    foreignPort: 443,   state: 'ESTABLISHED', pid: 4892, owner: 'chronos_agent.exe' },
        { proto: 'TCPv4', localAddr: '10.10.14.50', localPort: 49832, foreignAddr: '204.79.197.200',  foreignPort: 443,   state: 'ESTABLISHED', pid: 2876, owner: 'explorer.exe' },
        { proto: 'TCPv4', localAddr: '10.10.14.50', localPort: 49844, foreignAddr: '13.107.42.14',    foreignPort: 443,   state: 'ESTABLISHED', pid: 892,  owner: 'svchost.exe' },
        { proto: 'TCPv4', localAddr: '10.10.14.50', localPort: 49915, foreignAddr: '40.67.254.36',    foreignPort: 443,   state: 'CLOSE_WAIT',  pid: 1024, owner: 'svchost.exe' },
        { proto: 'TCPv4', localAddr: '0.0.0.0',     localPort: 135,   foreignAddr: '0.0.0.0',         foreignPort: 0,     state: 'LISTENING',   pid: 892,  owner: 'svchost.exe' },
        { proto: 'TCPv4', localAddr: '0.0.0.0',     localPort: 445,   foreignAddr: '0.0.0.0',         foreignPort: 0,     state: 'LISTENING',   pid: 4,    owner: 'System' },
        { proto: 'TCPv4', localAddr: '0.0.0.0',     localPort: 5040,  foreignAddr: '0.0.0.0',         foreignPort: 0,     state: 'LISTENING',   pid: 1108, owner: 'svchost.exe' },
        { proto: 'TCPv4', localAddr: '10.10.14.50', localPort: 50112, foreignAddr: '10.13.37.100',    foreignPort: 8443,  state: 'ESTABLISHED', pid: 5016, owner: 'cmd.exe' },
        { proto: 'UDPv4', localAddr: '0.0.0.0',     localPort: 5353,  foreignAddr: '*',               foreignPort: '*',   state: '',            pid: 1196, owner: 'svchost.exe' },
        { proto: 'UDPv4', localAddr: '0.0.0.0',     localPort: 5355,  foreignAddr: '*',               foreignPort: '*',   state: '',            pid: 1196, owner: 'svchost.exe' },
    ],

    // ═══════════════════════════════════════════════════════
    // VOLATILITY FRAMEWORK — Command Simulation Engine
    // ═══════════════════════════════════════════════════════

    _parseVolArgs(args) {
        // Parse vol.py style arguments: -f <file> <plugin> [--options]
        const result = { file: null, plugin: null, options: {} };
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-f' && args[i + 1]) {
                result.file = args[++i];
            } else if (!args[i].startsWith('-') && !result.plugin) {
                result.plugin = args[i];
            } else if (args[i].startsWith('--')) {
                const key = args[i].replace(/^--/, '');
                // Check if next arg is a value (not another flag)
                if (args[i + 1] && !args[i + 1].startsWith('-')) {
                    result.options[key] = args[++i];
                } else {
                    result.options[key] = true;
                }
            }
        }
        return result;
    },

    _volError(msg) {
        return `Volatility 3 Framework ${A18Config._VOL_VERSION}\nERROR : volatility3.framework : ${msg}`;
    },

    _VOL_VERSION: '2.5.2',

    // ── windows.info — OS identification ────────────────────────────────────
    _pluginInfo() {
        A18Config._state.profileIdentified = true;
        return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Reading Symbol Tables

Variable                         Value
-----------                      -----
Kernel Base                      0xf8043c400000
DTB                              0x1aa000
Symbols                          file:///usr/lib/python3/dist-packages/volatility3/symbols/windows/ntkrnlmp.pdb/GUID.json
Is64Bit                          True
IsPAE                            False
primary                          Intel 64
memory_layer                     WindowsIntel64Layer
KdVersionBlock                   0xf8043d00f398
Major/Minor                      15.19041
MachineType                      34404
KeNumberProcessors               4
SystemTime                       2024-11-13 14:31:02.000000
NtSystemRoot                     C:\\Windows
NtProductType                    NtProductWinNt
NtMajorVersion                   10
NtMinorVersion                   0
PE MajorOperatingSystemVersion   10
PE MinorOperatingSystemVersion   0
PE Machine                       AMD64
PE TimeDateStamp                 Wed May 06 08:38:44 2020

Suggested Profile(s):           Win10x64_19041`;
    },

    // ── windows.pslist — Process listing ────────────────────────────────────
    _pluginPslist() {
        A18Config._state.malProcessFound = true;
        let header = `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Listing processes

PID     PPID    ImageFileName           Offset(V)               Threads Handles SessionId       Wow64   CreateTime                      ExitTime\n`;

        const lines = A18Config._processes.map(p => {
            const pid    = String(p.pid).padEnd(8);
            const ppid   = String(p.ppid).padEnd(8);
            const name   = p.name.padEnd(24);
            const offset = ('0x' + (0xa80000000000 + p.pid * 0x1000).toString(16)).padEnd(24);
            const thr    = String(p.threads).padEnd(8);
            const hnd    = String(p.handles).padEnd(8);
            const sess   = String(p.session).padEnd(16);
            const wow    = String(p.wow64).padEnd(8);
            const ct     = p.createTime.padEnd(32);
            return `${pid}${ppid}${name}${offset}${thr}${hnd}${sess}${wow}${ct}N/A`;
        });

        return header + lines.join('\n');
    },

    // ── windows.pstree — Process tree ───────────────────────────────────────
    _pluginPstree() {
        A18Config._state.malProcessFound = true;
        let out = `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Building process tree

PID     PPID    ImageFileName           Offset(V)               Threads Handles CreateTime\n`;

        // Build a simplified tree view
        const tree = [
            { depth: 0, pid: 4,    ppid: 0,    name: 'System',            threads: 164, handles: 2987, ct: '2024-11-13 08:12:01' },
            { depth: 1, pid: 108,  ppid: 4,    name: 'Registry',          threads: 4,   handles: 0,    ct: '2024-11-13 08:12:00' },
            { depth: 1, pid: 396,  ppid: 4,    name: 'smss.exe',          threads: 2,   handles: 53,   ct: '2024-11-13 08:12:01' },
            { depth: 0, pid: 544,  ppid: 528,  name: 'csrss.exe',         threads: 11,  handles: 512,  ct: '2024-11-13 08:12:03' },
            { depth: 0, pid: 620,  ppid: 528,  name: 'wininit.exe',       threads: 1,   handles: 154,  ct: '2024-11-13 08:12:04' },
            { depth: 1, pid: 768,  ppid: 620,  name: 'services.exe',      threads: 8,   handles: 698,  ct: '2024-11-13 08:12:06' },
            { depth: 2, pid: 892,  ppid: 768,  name: 'svchost.exe',       threads: 22,  handles: 876,  ct: '2024-11-13 08:12:08' },
            { depth: 2, pid: 956,  ppid: 768,  name: 'svchost.exe',       threads: 12,  handles: 445,  ct: '2024-11-13 08:12:09' },
            { depth: 2, pid: 1024, ppid: 768,  name: 'svchost.exe',       threads: 18,  handles: 612,  ct: '2024-11-13 08:12:09' },
            { depth: 2, pid: 1108, ppid: 768,  name: 'svchost.exe',       threads: 6,   handles: 298,  ct: '2024-11-13 08:12:10' },
            { depth: 2, pid: 1196, ppid: 768,  name: 'svchost.exe',       threads: 14,  handles: 532,  ct: '2024-11-13 08:12:10' },
            { depth: 2, pid: 1384, ppid: 768,  name: 'spoolsv.exe',       threads: 7,   handles: 312,  ct: '2024-11-13 08:12:14' },
            { depth: 2, pid: 1660, ppid: 768,  name: 'svchost.exe',       threads: 8,   handles: 267,  ct: '2024-11-13 08:12:18' },
            { depth: 2, pid: 2140, ppid: 768,  name: 'MsMpEng.exe',       threads: 28,  handles: 1102, ct: '2024-11-13 08:12:24' },
            { depth: 2, pid: 5204, ppid: 768,  name: 'SearchIndexer.exe', threads: 16,  handles: 987,  ct: '2024-11-13 08:13:22' },
            { depth: 2, pid: 5340, ppid: 768,  name: 'WmiPrvSE.exe',      threads: 9,   handles: 312,  ct: '2024-11-13 08:14:01' },
            { depth: 1, pid: 776,  ppid: 620,  name: 'lsass.exe',         threads: 10,  handles: 1543, ct: '2024-11-13 08:12:06' },
            { depth: 0, pid: 628,  ppid: 612,  name: 'csrss.exe',         threads: 12,  handles: 543,  ct: '2024-11-13 08:12:04' },
            { depth: 0, pid: 704,  ppid: 612,  name: 'winlogon.exe',      threads: 3,   handles: 201,  ct: '2024-11-13 08:12:05' },
            { depth: 1, pid: 2416, ppid: 704,  name: 'dwm.exe',           threads: 15,  handles: 1890, ct: '2024-11-13 08:13:01' },
            { depth: 0, pid: 2876, ppid: 2848, name: 'explorer.exe',      threads: 42,  handles: 2104, ct: '2024-11-13 08:13:12' },
            { depth: 1, pid: 3284, ppid: 2876, name: 'notepad.exe',       threads: 4,   handles: 228,  ct: '2024-11-13 14:22:47' },
            { depth: 1, pid: 3512, ppid: 2876, name: 'cmd.exe',           threads: 2,   handles: 89,   ct: '2024-11-13 14:18:33' },
            { depth: 0, pid: 4892, ppid: 1,    name: '*** chronos_agent.exe', threads: 6, handles: 342, ct: '2024-11-13 09:44:18' },
            { depth: 1, pid: 5016, ppid: 4892, name: 'cmd.exe',           threads: 1,   handles: 42,   ct: '2024-11-13 09:44:22' },
        ];

        tree.forEach(p => {
            const indent = p.depth > 0 ? '\u2502 '.repeat(p.depth - 1) + '\u251C\u2500 ' : '';
            const pid    = String(p.pid).padEnd(8);
            const ppid   = String(p.ppid).padEnd(8);
            const name   = (indent + p.name).padEnd(36);
            const offset = ('0x' + (0xa80000000000 + p.pid * 0x1000).toString(16)).padEnd(24);
            const thr    = String(p.threads).padEnd(8);
            const hnd    = String(p.handles).padEnd(8);
            out += `${pid}${ppid}${name}${offset}${thr}${hnd}${p.ct}\n`;
        });

        out += '\n[!] Note: chronos_agent.exe (PID 4892) has PPID=1 — orphaned parent process. This is suspicious.';
        return out;
    },

    // ── windows.netscan — Network connections ───────────────────────────────
    _pluginNetscan() {
        A18Config._state.c2Found = true;
        let out = `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Scanning for network objects

Offset(P)               Proto   LocalAddr               LocalPort       ForeignAddr             ForeignPort     State           PID     Owner\n`;

        A18Config._netConnections.forEach(c => {
            const offset  = ('0x' + (0x7a8400000000 + Math.floor(Math.random() * 0xfffffff)).toString(16)).padEnd(24);
            const proto   = c.proto.padEnd(8);
            const local   = (c.localAddr + ':' + c.localPort).padEnd(24);
            const foreign = (c.foreignAddr + ':' + c.foreignPort).padEnd(24);
            const state   = (c.state || '-').padEnd(16);
            const pid     = String(c.pid).padEnd(8);
            out += `${offset}${proto}${local}${foreign}${state}${pid}${c.owner}\n`;
        });

        out += `\n[*] Notable: chronos_agent.exe (PID 4892) has an ESTABLISHED connection to 10.13.37.100:443`;
        out += `\n[*] Notable: cmd.exe (PID 5016, child of chronos_agent.exe) connected to 10.13.37.100:8443`;
        return out;
    },

    // ── windows.cmdline — Process command lines ─────────────────────────────
    _pluginCmdline() {
        const cmdlines = [
            { pid: 4,    name: 'System',            cmdline: '' },
            { pid: 396,  name: 'smss.exe',          cmdline: '\\SystemRoot\\System32\\smss.exe' },
            { pid: 544,  name: 'csrss.exe',         cmdline: '%SystemRoot%\\system32\\csrss.exe ObjectDirectory=\\Windows SharedSection=1024,20480,768 Windows=On SubSystemType=Windows ServerDll=basesrv,1' },
            { pid: 768,  name: 'services.exe',      cmdline: 'C:\\Windows\\system32\\services.exe' },
            { pid: 776,  name: 'lsass.exe',         cmdline: 'C:\\Windows\\system32\\lsass.exe' },
            { pid: 892,  name: 'svchost.exe',       cmdline: 'C:\\Windows\\system32\\svchost.exe -k DcomLaunch -p' },
            { pid: 956,  name: 'svchost.exe',       cmdline: 'C:\\Windows\\system32\\svchost.exe -k RPCSS -p' },
            { pid: 1024, name: 'svchost.exe',       cmdline: 'C:\\Windows\\system32\\svchost.exe -k netsvcs -p' },
            { pid: 1108, name: 'svchost.exe',       cmdline: 'C:\\Windows\\system32\\svchost.exe -k LocalService -p' },
            { pid: 1196, name: 'svchost.exe',       cmdline: 'C:\\Windows\\system32\\svchost.exe -k NetworkService -p' },
            { pid: 2140, name: 'MsMpEng.exe',       cmdline: '"C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\4.18.2210.6-0\\MsMpEng.exe"' },
            { pid: 2876, name: 'explorer.exe',      cmdline: 'C:\\Windows\\Explorer.EXE' },
            { pid: 3284, name: 'notepad.exe',       cmdline: '"C:\\Windows\\system32\\notepad.exe" C:\\Users\\analyst\\Desktop\\intel_briefing.txt' },
            { pid: 3512, name: 'cmd.exe',           cmdline: '"C:\\Windows\\system32\\cmd.exe"' },
            { pid: 4892, name: 'chronos_agent.exe', cmdline: 'C:\\Windows\\Temp\\chronos_agent.exe --stealth --c2 auto --persist schtask --exfil dns' },
            { pid: 5016, name: 'cmd.exe',           cmdline: 'C:\\Windows\\system32\\cmd.exe /c "whoami & ipconfig & netstat -an > C:\\Windows\\Temp\\recon.txt"' },
        ];

        let out = `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Listing process command lines

PID     Process                 Args\n`;

        cmdlines.forEach(c => {
            const pid  = String(c.pid).padEnd(8);
            const name = c.name.padEnd(24);
            out += `${pid}${name}${c.cmdline || 'N/A'}\n`;
        });

        out += '\n[!] chronos_agent.exe launched from C:\\Windows\\Temp\\ with stealth, auto-C2, scheduled task persistence, and DNS exfiltration flags';
        out += '\n[!] notepad.exe has C:\\Users\\analyst\\Desktop\\intel_briefing.txt open';
        return out;
    },

    // ── windows.filescan — File objects in memory ───────────────────────────
    _pluginFilescan() {
        const files = [
            { offset: '0x7a8401234560', name: '\\Windows\\System32\\ntdll.dll' },
            { offset: '0x7a8401234780', name: '\\Windows\\System32\\kernel32.dll' },
            { offset: '0x7a8401235100', name: '\\Windows\\System32\\notepad.exe' },
            { offset: '0x7a8401235480', name: '\\Users\\analyst\\Desktop\\intel_briefing.txt' },
            { offset: '0x7a8401236000', name: '\\Windows\\Temp\\chronos_agent.exe' },
            { offset: '0x7a8401236340', name: '\\Windows\\Temp\\recon.txt' },
            { offset: '0x7a8401237100', name: '\\Windows\\System32\\config\\SYSTEM' },
            { offset: '0x7a8401237500', name: '\\Windows\\System32\\config\\SAM' },
            { offset: '0x7a8401238000', name: '\\Windows\\System32\\config\\SECURITY' },
            { offset: '0x7a8401238800', name: '\\Windows\\System32\\drivers\\etc\\hosts' },
            { offset: '0x7a8401239100', name: '\\ProgramData\\Microsoft\\Windows Defender\\Platform\\4.18.2210.6-0\\MsMpEng.exe' },
            { offset: '0x7a8401239900', name: '\\Windows\\Prefetch\\CHRONOS_AGENT.EXE-1A2B3C4D.pf' },
            { offset: '0x7a840123a200', name: '\\Users\\analyst\\AppData\\Local\\Temp\\~DF1234.tmp' },
            { offset: '0x7a840123a800', name: '\\Windows\\System32\\winevt\\Logs\\Security.evtx' },
            { offset: '0x7a840123b100', name: '\\Windows\\System32\\winevt\\Logs\\System.evtx' },
        ];

        let out = `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Scanning for file objects

Offset(P)               Name\n`;

        files.forEach(f => {
            out += `${f.offset.padEnd(24)}${f.name}\n`;
        });

        out += `\n${files.length} file objects found.`;
        out += '\n[*] Notable: intel_briefing.txt found at offset 0x7a8401235480';
        out += '\n[*] Notable: chronos_agent.exe found at offset 0x7a8401236000';
        out += '\n[*] Notable: CHRONOS_AGENT.EXE prefetch record confirms execution';
        return out;
    },

    // ── windows.dumpfiles — Dump files by PID ───────────────────────────────
    _pluginDumpfiles(options) {
        const pid = parseInt(options.pid);
        if (!pid) {
            return A18Config._volError('windows.dumpfiles requires --pid <PID>');
        }

        if (pid === 3284) {
            return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Dumping open files for PID 3284

Cache   FileObject              FileName                        Result
------  ----------------------  ------------------------------  ------
DataSectionObject 0x7a8401235480  intel_briefing.txt             file.0x7a8401235480.dat
SharedCacheMap    0x7a8401235100  notepad.exe                    file.0x7a8401235100.dat

2 files dumped to current directory.

[*] Use 'cat file.0x7a8401235480.dat' or 'strings file.0x7a8401235480.dat' to read the Intel Briefing.`;
        }

        if (pid === 4892) {
            return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Dumping open files for PID 4892

Cache   FileObject              FileName                        Result
------  ----------------------  ------------------------------  ------
DataSectionObject 0x7a8401236000  chronos_agent.exe              file.0x7a8401236000.dat
DataSectionObject 0x7a8401236340  recon.txt                      file.0x7a8401236340.dat

2 files dumped to current directory.

[*] The chronos_agent.exe binary can be analyzed with 'strings' or reverse engineering tools.`;
        }

        return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Dumping open files for PID ${pid}

No files found for PID ${pid} or PID does not exist.`;
    },

    // ── windows.memdump — Dump process memory ───────────────────────────────
    _pluginMemdump(options) {
        const pid = parseInt(options.pid);
        const dumpDir = options['dump-dir'] || '.';
        if (!pid) {
            return A18Config._volError('windows.memdump requires --pid <PID>');
        }

        if (pid === 3284) {
            A18Config._state.memoryDumped = true;
            // Create the dump file in the virtual filesystem
            A18Config._createDumpFile(3284);
            return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Dumping process memory

Writing PID 3284 (notepad.exe) memory to: ${dumpDir}/pid.3284.dmp
Sections dumped: .text, .rdata, .data, heap, stack, mapped files
Total size: 42,876,928 bytes (40.9 MB)

Memory dump complete. File: pid.3284.dmp

[*] Tip: Use 'strings pid.3284.dmp | grep -i flag' to search for flag patterns in the dump.`;
        }

        if (pid === 4892) {
            A18Config._createDumpFile(4892);
            return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Dumping process memory

Writing PID 4892 (chronos_agent.exe) memory to: ${dumpDir}/pid.4892.dmp
Sections dumped: .text, .rdata, .data, heap, stack
Total size: 18,432,000 bytes (17.6 MB)

Memory dump complete. File: pid.4892.dmp

[*] Tip: Use 'strings pid.4892.dmp' to inspect for hardcoded C2 addresses, keys, and embedded payloads.`;
        }

        if (pid === 776) {
            A18Config._createDumpFile(776);
            return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Dumping process memory

Writing PID 776 (lsass.exe) memory to: ${dumpDir}/pid.776.dmp
Sections dumped: .text, .rdata, .data, heap
Total size: 67,108,864 bytes (64.0 MB)

Memory dump complete. File: pid.776.dmp

[*] LSASS memory may contain credential material. Use windows.hashdump or offline tools like mimikatz.`;
        }

        const proc = A18Config._processes.find(p => p.pid === pid);
        if (proc) {
            return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Dumping process memory

Writing PID ${pid} (${proc.name}) memory to: ${dumpDir}/pid.${pid}.dmp
Total size: ${(Math.floor(Math.random() * 40) + 5) * 1024 * 1024} bytes

Memory dump complete. File: pid.${pid}.dmp`;
        }

        return A18Config._volError(`PID ${pid} not found in process list.`);
    },

    // ── Create virtual dump files in the filesystem ─────────────────────────
    _createDumpFile(pid) {
        const kaliDir = A18Config.filesystem['/'].children.home.children.kali.children;

        if (pid === 3284) {
            kaliDir['pid.3284.dmp'] = {
                type: 'file',
                content: '[BINARY DATA - notepad.exe process memory dump]\n\n' +
                    '--- Heap region 0x01a40000-0x01b80000 ---\n' +
                    '... binary data ...\n' +
                    'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00\n' +
                    '... PE header data ...\n\n' +
                    '--- Mapped file: C:\\Users\\analyst\\Desktop\\intel_briefing.txt ---\n' +
                    '================================================================\n' +
                    '  CLASSIFIED — INTEL BRIEFING — OPERATION MIDNIGHT SUN\n' +
                    '================================================================\n' +
                    '\n' +
                    '  Chronos Collective — Threat Assessment\n' +
                    '  Classification: TOP SECRET // NOFORN\n' +
                    '  Date: 2024-11-13\n' +
                    '\n' +
                    '  The Chronos Collective has been linked to multiple intrusions\n' +
                    '  targeting critical infrastructure across NATO member states.\n' +
                    '  Their primary vector is spear-phishing with weaponized documents\n' +
                    '  that deploy a custom RAT (chronos_agent) communicating over\n' +
                    '  encrypted channels to rotating C2 infrastructure.\n' +
                    '\n' +
                    '  Key Finding: Their next operation targets SCADA systems\n' +
                    '  in the energy sector. Timeline: Q1 2025.\n' +
                    '\n' +
                    '  Authorization Code: flag{1nt3l_br13f1ng_chr0n0s_d3f34t3d}\n' +
                    '\n' +
                    '================================================================\n' +
                    '  END OF BRIEFING — DESTROY AFTER READING\n' +
                    '================================================================\n' +
                    '\n' +
                    '... additional heap data ...\n' +
                    '\x00\x00\x00MZ\x90PE\x00\x00L\x01\n' +
                    '... stack region ...\n'
            };
            // Also create the dat file from dumpfiles
            kaliDir['file.0x7a8401235480.dat'] = {
                type: 'file',
                content: '================================================================\n' +
                    '  CLASSIFIED — INTEL BRIEFING — OPERATION MIDNIGHT SUN\n' +
                    '================================================================\n' +
                    '\n' +
                    '  Chronos Collective — Threat Assessment\n' +
                    '  Classification: TOP SECRET // NOFORN\n' +
                    '  Date: 2024-11-13\n' +
                    '\n' +
                    '  The Chronos Collective has been linked to multiple intrusions\n' +
                    '  targeting critical infrastructure across NATO member states.\n' +
                    '  Their primary vector is spear-phishing with weaponized documents\n' +
                    '  that deploy a custom RAT (chronos_agent) communicating over\n' +
                    '  encrypted channels to rotating C2 infrastructure.\n' +
                    '\n' +
                    '  Key Finding: Their next operation targets SCADA systems\n' +
                    '  in the energy sector. Timeline: Q1 2025.\n' +
                    '\n' +
                    '  Authorization Code: flag{1nt3l_br13f1ng_chr0n0s_d3f34t3d}\n' +
                    '\n' +
                    '================================================================\n' +
                    '  END OF BRIEFING — DESTROY AFTER READING\n' +
                    '================================================================\n'
            };
        }

        if (pid === 4892) {
            kaliDir['pid.4892.dmp'] = {
                type: 'file',
                content: '[BINARY DATA - chronos_agent.exe process memory dump]\n\n' +
                    '--- .text section ---\n' +
                    'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\n' +
                    '... PE header ...\n\n' +
                    '--- .rdata section (strings) ---\n' +
                    'Chronos Agent v2.7.1\n' +
                    'C2_PRIMARY=10.13.37.100\n' +
                    'C2_FALLBACK=10.13.37.200\n' +
                    'C2_PORT=443\n' +
                    'C2_PROTO=HTTPS\n' +
                    'EXFIL_METHOD=DNS\n' +
                    'EXFIL_DOMAIN=data.chronos-c2.net\n' +
                    'PERSIST_METHOD=SCHTASK\n' +
                    'PERSIST_NAME=WindowsHealthService\n' +
                    'BEACON_INTERVAL=30\n' +
                    'JITTER=0.3\n' +
                    'USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64)\n' +
                    'ENCRYPT_KEY=aGV4d29ydGhfcHJpbWU=\n' +
                    '--- .data section ---\n' +
                    '... heap allocations ...\n' +
                    'flag{chr0n0s_c2_10_13_37_100}\n' +
                    '... additional data ...\n'
            };
        }

        if (pid === 776) {
            kaliDir['pid.776.dmp'] = {
                type: 'file',
                content: '[BINARY DATA - lsass.exe process memory dump]\n\n' +
                    '--- credential material ---\n' +
                    'NTLM hash fragments detected...\n' +
                    'Use windows.hashdump for structured extraction.\n' +
                    '... wdigest clear-text may be available if enabled ...\n' +
                    '... kerberos ticket material ...\n'
            };
        }
    },

    // ── windows.hashdump — NTLM hashes ──────────────────────────────────────
    _pluginHashdump() {
        return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Dumping NTLM hashes

User            RID     lmhash                          nthash
-----------     ----    -------------------------------- --------------------------------
Administrator   500     aad3b435b51404eeaad3b435b51404ee 31d6cfe0d16ae931b73c59d7e0c089c0
Guest           501     aad3b435b51404eeaad3b435b51404ee 31d6cfe0d16ae931b73c59d7e0c089c0
DefaultAccount  503     aad3b435b51404eeaad3b435b51404ee 31d6cfe0d16ae931b73c59d7e0c089c0
analyst         1001    aad3b435b51404eeaad3b435b51404ee e19ccf75ee54e06b06a5907af13cef42

[*] The analyst NTLM hash: e19ccf75ee54e06b06a5907af13cef42
[*] Try cracking with hashcat -m 1000 or check known hash databases.
[*] Note: Administrator hash is the "empty password" hash — account may be disabled.`;
    },

    // ── windows.malfind — Injected code detection ───────────────────────────
    _pluginMalfind() {
        return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Scanning for injected code

PID     Process                 Start VPN               End VPN                 Tag     Protection      CommitCharge
----    ----------------------  ----------------------  ----------------------  ------  --------------  ------------
4892    chronos_agent.exe       0x0000020b40000000      0x0000020b40010000      VadS    PAGE_EXECUTE_READWRITE  16

0x0000020b40000000  4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00  MZ..............
0x0000020b40000010  b8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00  ........@.......
0x0000020b40000020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0x0000020b40000030  00 00 00 00 00 00 00 00 00 00 00 00 e0 00 00 00  ................

[SUSPICIOUS] Injected PE detected in chronos_agent.exe memory space
    - PAGE_EXECUTE_READWRITE protection (highly unusual for legitimate code)
    - MZ header at start of VAD region indicates a mapped PE image
    - This is consistent with reflective DLL injection or process hollowing

PID     Process                 Start VPN               End VPN                 Tag     Protection      CommitCharge
----    ----------------------  ----------------------  ----------------------  ------  --------------  ------------
4892    chronos_agent.exe       0x0000020b40020000      0x0000020b40024000      VadS    PAGE_EXECUTE_READWRITE  4

0x0000020b40020000  55 48 89 e5 48 83 ec 30 48 8d 0d 89 2a 00 00 ff  UH..H..0H...*...
0x0000020b40020010  15 8b 4a 00 00 48 89 45 f8 48 83 7d f8 00 74 15  ..J..H.E.H.}..t.
0x0000020b40020020  48 8b 4d f8 48 8d 15 4a 2a 00 00 41 b8 00 10 00  H.M.H..J*..A....
0x0000020b40020030  00 ff 15 71 4a 00 00 eb 05 e8 a8 00 00 00 48 83  ...qJ.........H.

[SUSPICIOUS] Shellcode detected in secondary VAD region
    - No mapped file backing (anonymous allocation)
    - Contains function prologue (push rbp, mov rsp) — executable code
    - Likely: C2 communication or credential harvesting payload

Total suspicious regions found: 2 (all in PID 4892 — chronos_agent.exe)`;
    },

    // ── windows.handles — Process handles ───────────────────────────────────
    _pluginHandles(options) {
        const pid = parseInt(options.pid);
        if (!pid) {
            return A18Config._volError('windows.handles requires --pid <PID>');
        }

        if (pid === 4892) {
            return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Listing handles for PID 4892

PID     Process                 Offset(V)               HandleValue     Type            GrantedAccess   Name
----    ----------------------  ----------------------  -----------     ------          -------------   ----
4892    chronos_agent.exe       0xa80004893000          0x4             Process         0x1fffff        System(4)
4892    chronos_agent.exe       0xa80004893038          0x8             Thread          0x1fffff        chronos_agent.exe(4892):0
4892    chronos_agent.exe       0xa80004893070          0xc             Thread          0x1fffff        chronos_agent.exe(4892):1
4892    chronos_agent.exe       0xa800048930a8          0x10            Thread          0x1fffff        chronos_agent.exe(4892):2
4892    chronos_agent.exe       0xa800048930e0          0x1c            File            0x100020        \\Device\\HarddiskVolume2\\Windows\\Temp\\chronos_agent.exe
4892    chronos_agent.exe       0xa80004893118          0x20            File            0x12019f        \\Device\\HarddiskVolume2\\Windows\\Temp\\recon.txt
4892    chronos_agent.exe       0xa80004893150          0x24            Key             0x20019         \\REGISTRY\\MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run
4892    chronos_agent.exe       0xa80004893188          0x28            Key             0x20019         \\REGISTRY\\MACHINE\\SYSTEM\\CurrentControlSet\\Services\\WindowsHealthService
4892    chronos_agent.exe       0xa800048931c0          0x2c            Mutant          0x1f0001        \\BaseNamedObjects\\Global\\ChronosLock_v27
4892    chronos_agent.exe       0xa800048931f8          0x30            Section         0xf             \\BaseNamedObjects\\Global\\ChronosSharedMem
4892    chronos_agent.exe       0xa80004893230          0x34            Event           0x1f0003        \\BaseNamedObjects\\Global\\ChronosBeaconEvent
4892    chronos_agent.exe       0xa80004893268          0x44            Directory       0x3             \\KnownDlls

[*] Notable handles:
    - Registry Run key: persistence mechanism (auto-start)
    - Services\\WindowsHealthService: disguised service registration
    - Global\\ChronosLock_v27: named mutex (single instance lock)
    - Global\\ChronosSharedMem: shared memory section (IPC with child cmd.exe?)
    - recon.txt: system reconnaissance output file`;
        }

        if (pid === 3284) {
            return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Listing handles for PID 3284

PID     Process                 Offset(V)               HandleValue     Type            GrantedAccess   Name
----    ----------------------  ----------------------  -----------     ------          -------------   ----
3284    notepad.exe             0xa80003285000          0x4             File            0x12019f        \\Device\\HarddiskVolume2\\Users\\analyst\\Desktop\\intel_briefing.txt
3284    notepad.exe             0xa80003285038          0x8             Thread          0x1fffff        notepad.exe(3284):0
3284    notepad.exe             0xa80003285070          0xc             Key             0x20019         \\REGISTRY\\USER\\S-1-5-21-analyst\\Software\\Microsoft\\Notepad
3284    notepad.exe             0xa800032850a8          0x10            Event           0x1f0003        \\BaseNamedObjects\\Global\\notepad_session_3284

[*] notepad.exe has intel_briefing.txt open (handle 0x4)
[*] Use windows.dumpfiles --pid 3284 or windows.memdump --pid 3284 to extract file contents`;
        }

        return A18Config._volError(`No handles found for PID ${pid} or PID does not exist.`);
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (Kali forensics workstation)
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
                                'alpha_memdump.raw': {
                                    type: 'file',
                                    content: '[BINARY DATA]\nalpha_memdump.raw: data (raw memory dump)\nSize: 4,294,967,296 bytes (4 GB)\nSHA256: 8a3f2b1c9e4d6a7f0b5c3e8d1a9f4c7b2e6d0a3f5c8b1e4d7a0f3c6b9e2d5a8\n\nThis is a raw memory image from SRV-INTEL-ALPHA.\nUse Volatility 3 framework for analysis:\n  vol.py -f alpha_memdump.raw windows.info\n  vol.py -f alpha_memdump.raw windows.pslist\n  vol.py -f alpha_memdump.raw windows.netscan\n  vol.py -f alpha_memdump.raw windows.memdump --pid <PID> --dump-dir .'
                                },
                                // ── DECOY FILES — Red herrings and misleading artifacts ──
                                'BSOD.dmp': {
                                    type: 'file',
                                    content: '[BINARY DATA — Windows Kernel Crash Dump]\nBSOD.dmp: Windows minidump (kernel mode crash)\nSize: 262,144 bytes (256 KB)\nSHA256: 1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c\n\nCrash timestamp: 2024-11-12 23:14:07 UTC\nBug check code: 0x0000007E (SYSTEM_THREAD_EXCEPTION_NOT_HANDLED)\nFaulting module: UNKNOWN\n\nNOTE: This crash dump is from the PREVIOUS day — not from the incident timeline.\nThis was a hardware driver issue unrelated to the Chronos Collective intrusion.\n\n[!] This is NOT the memory image you want. Use alpha_memdump.raw for the incident.\n[!] vol.py cannot parse this crash dump — it is a kernel minidump, not a full memory image.'
                                },
                                'srv-beta-memdump.raw': {
                                    type: 'file',
                                    content: '[BINARY DATA]\nsrv-beta-memdump.raw: data (raw memory dump)\nSize: 4,294,967,296 bytes (4 GB)\nSHA256: 9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c\n\nThis memory image is from SRV-BETA — a DEV environment machine.\nCaptured: 2024-11-10 16:00:00 UTC (3 days before the incident)\n\nProcess snapshot includes: VS Code, node.js, git, postgres — developer workload only.\nNo indicators of compromise found in preliminary review.\n\n[!] WRONG TARGET: This is NOT the compromised machine.\n[!] The incident occurred on SRV-INTEL-ALPHA. Use alpha_memdump.raw.\n\nRunning vol.py on this file will show a completely clean Windows 10 development system\nwith no malicious processes. This is a decoy — do not waste time here.'
                                },
                                'old_analysis': {
                                    type: 'dir',
                                    children: {
                                        'svchost_suspicious.txt': {
                                            type: 'file',
                                            content: '=== STALE ANALYSIS NOTES — DO NOT USE ===\nDate: 2024-11-08\nAnalyst: jsmith\n\nInitial triage flagged svchost.exe (PID 892) as suspicious due to high handle count.\nFurther analysis determined this is the DcomLaunch service host — BENIGN.\n\nThe svchost.exe connection to 204.79.197.200:443 is legitimate Microsoft telemetry.\nThe svchost.exe connection to 13.107.42.14:443 is legitimate Microsoft Update.\nThe svchost.exe connection to 40.67.254.36:443 is legitimate Office 365 traffic.\n\nCONCLUSION: svchost.exe activity is normal. No IOCs found in this process family.\n\n[!] NOTE: This analysis predates the Chronos Collective intrusion.\n[!] The real threat process is NOT in the svchost family — look elsewhere.\n[!] Focus on processes with unusual PPID values and launch paths outside System32.'
                                        },
                                        'network_baseline.txt': {
                                            type: 'file',
                                            content: '=== NETWORK BASELINE — SRV-INTEL-ALPHA ===\nCapture date: 2024-11-01 (12 days before incident)\n\nExpected outbound connections:\n  204.79.197.200:443   — Microsoft Bing / Edge (explorer.exe)\n  13.107.42.14:443     — Microsoft Update (svchost.exe)\n  40.67.254.36:443     — Office 365 (svchost.exe)\n\nExpected listening ports:\n  0.0.0.0:135    — RPC (svchost.exe)\n  0.0.0.0:445    — SMB (System)\n  0.0.0.0:5040   — Service (svchost.exe)\n\nANYTHING NOT ON THIS LIST IS ANOMALOUS.\n\n[!] HINT: Compare this baseline against the netscan output from alpha_memdump.raw.\n[!] Connections NOT in this baseline are investigation priorities.\n\nNote: 10.13.37.0/24 is NOT in the legitimate network baseline.'
                                        },
                                        'false_positive_pid4892.txt': {
                                            type: 'file',
                                            content: '=== INITIAL FALSE POSITIVE ASSESSMENT ===\nDate: 2024-11-13 09:50 UTC (6 minutes after intrusion began)\nAnalyst: automated-triage\n\nProcess: chronos_agent.exe (PID 4892)\nInitial assessment: UNKNOWN — not in Windows process whitelist\nAction: FLAGGED FOR MANUAL REVIEW\n\nNote: MsMpEng.exe (Windows Defender, PID 2140) did not alert on this process.\nThis is consistent with a signed or hollowed binary that bypasses static AV detection.\n\nSTATUS: This file was created by the automated triage system before manual analysis.\nManual forensics analysis is REQUIRED — automated tools missed this implant.\n\n[THIS FILE IS A DECOY — it confirms the target but provides no flag-relevant data]'
                                        }
                                    }
                                },
                                'decoy_pslist.txt': {
                                    type: 'file',
                                    content: '=== PARTIAL PSLIST OUTPUT — SRV-BETA (WRONG MACHINE) ===\nThis file was mistakenly copied from the SRV-BETA triage package.\n\nPID     PPID    ImageFileName           CreateTime\n4       0       System                  2024-11-10 08:00:01\n396     4       smss.exe                2024-11-10 08:00:02\n768     620     services.exe            2024-11-10 08:00:05\n2876    2848    explorer.exe            2024-11-10 08:01:12\n4204    2876    Code.exe                2024-11-10 09:15:33\n6812    4204    node.exe                2024-11-10 09:16:01\n7440    2876    chrome.exe              2024-11-10 09:22:47\n8190    7440    chrome.exe              2024-11-10 09:22:48\n\n[!] THIS IS NOT FROM SRV-INTEL-ALPHA\n[!] These PIDs do not exist in alpha_memdump.raw\n[!] Do not use these PIDs with vol.py — you will get "PID not found" errors\n[!] Run vol.py -f alpha_memdump.raw windows.pslist to get the correct process list'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: SRV-INTEL-ALPHA memory dump (alpha_memdump.raw)\nObjective: Memory forensics — identify the Chronos Collective intrusion\n\nIntel:\n  - SRV-INTEL-ALPHA was compromised by the Chronos Collective (nation-state APT)\n  - System was powered off after suspected intrusion — all disk evidence wiped\n  - A memory dump was captured before shutdown: alpha_memdump.raw (4 GB)\n  - The intruder deployed a custom RAT and was viewing classified intel\n\nAnalysis steps:\n  1. Identify the OS profile:  vol.py -f alpha_memdump.raw windows.info\n  2. List running processes:   vol.py -f alpha_memdump.raw windows.pslist\n  3. Check process tree:       vol.py -f alpha_memdump.raw windows.pstree\n  4. Find network connections: vol.py -f alpha_memdump.raw windows.netscan\n  5. Check command lines:      vol.py -f alpha_memdump.raw windows.cmdline\n  6. Scan for files in memory: vol.py -f alpha_memdump.raw windows.filescan\n  7. Dump suspicious process:  vol.py -f alpha_memdump.raw windows.memdump --pid <PID> --dump-dir .\n  8. Search dumped memory:     strings pid.<PID>.dmp | grep -i flag\n\nFlags:\n  user.txt — C2 server connection details (found via network analysis)\n  root.txt — Intel Briefing contents (recovered from process memory)\n\nRemember: Everything in RAM is ephemeral. The ghost only lingers\nuntil the capacitors drain. Work fast, analyst.'
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'vol_cheatsheet.txt': {
                                            type: 'file',
                                            content: '=== VOLATILITY 3 CHEATSHEET ===\n\n--- SYSTEM INFO ---\nvol.py -f <dump> windows.info              # OS version, build, architecture\n\n--- PROCESS ANALYSIS ---\nvol.py -f <dump> windows.pslist             # List all processes\nvol.py -f <dump> windows.pstree             # Process tree (parent-child)\nvol.py -f <dump> windows.cmdline            # Command line arguments\nvol.py -f <dump> windows.dlllist            # Loaded DLLs per process\nvol.py -f <dump> windows.handles --pid <P>  # Open handles for a process\n\n--- MEMORY EXTRACTION ---\nvol.py -f <dump> windows.memdump --pid <P> --dump-dir .   # Dump process memory\nvol.py -f <dump> windows.procdump --pid <P> --dump-dir .  # Dump process executable\nvol.py -f <dump> windows.dumpfiles --pid <P>              # Dump open files\n\n--- NETWORK ---\nvol.py -f <dump> windows.netscan            # Network connections & listening ports\nvol.py -f <dump> windows.netstat            # Active connections (alternative)\n\n--- FILE SYSTEM ---\nvol.py -f <dump> windows.filescan           # Scan for file objects in memory\n\n--- CREDENTIALS ---\nvol.py -f <dump> windows.hashdump           # Dump NTLM hashes (SAM)\nvol.py -f <dump> windows.lsadump            # LSA secrets\n\n--- MALWARE DETECTION ---\nvol.py -f <dump> windows.malfind            # Find injected/suspicious code\nvol.py -f <dump> windows.ssdt               # System Service Descriptor Table hooks\nvol.py -f <dump> windows.callbacks          # Kernel callbacks\n\n--- REGISTRY ---\nvol.py -f <dump> windows.registry.hivelist  # List registry hives\nvol.py -f <dump> windows.registry.printkey --key <path>  # Read registry key\n\n--- POST-EXTRACTION ---\nstrings <dumpfile> | grep -i "pattern"      # Search for strings in dumps\nfile <dumpfile>                             # Identify file type\nxxd <dumpfile> | head                       # Hex dump first bytes'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls -la\nfile alpha_memdump.raw\nsha256sum alpha_memdump.raw\ncat notes.txt\ncat tools/vol_cheatsheet.txt'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'bin': {
                            type: 'dir',
                            children: {
                                'vol.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# Volatility 3 Framework - Memory Forensics\n# https://github.com/volatilityfoundation/volatility3'
                                }
                            }
                        },
                        'lib': {
                            type: 'dir',
                            children: {
                                'python3': {
                                    type: 'dir',
                                    children: {
                                        'dist-packages': {
                                            type: 'dir',
                                            children: {
                                                'volatility3': {
                                                    type: 'dir',
                                                    children: {
                                                        'symbols': {
                                                            type: 'dir',
                                                            children: {
                                                                'windows': { type: 'dir', children: {} }
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
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'forensics-ws'
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
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── vol.py — Volatility 3 Framework (main forensics tool) ──────────
        'vol.py': function(args, term, engine) {
            const parsed = A18Config._parseVolArgs(args);

            // No arguments
            if (!parsed.file && !parsed.plugin) {
                return `Volatility 3 Framework ${A18Config._VOL_VERSION}
usage: vol.py [-h] -f FILE plugin [options]

A memory forensics analysis framework.

Required:
  -f FILE               Memory dump file to analyze
  plugin                Analysis plugin to run

Common plugins:
  windows.info          System information
  windows.pslist        Process listing
  windows.pstree        Process tree
  windows.netscan       Network connections
  windows.cmdline       Process command lines
  windows.filescan      File objects in memory
  windows.dumpfiles     Dump open files (--pid required)
  windows.memdump       Dump process memory (--pid, --dump-dir required)
  windows.hashdump      Extract NTLM hashes
  windows.malfind       Detect injected code
  windows.handles       Process handles (--pid required)

Example: vol.py -f alpha_memdump.raw windows.pslist`;
            }

            // Validate file
            if (!parsed.file) {
                return A18Config._volError('No memory dump file specified. Use: vol.py -f <file> <plugin>');
            }
            if (!parsed.file.includes('alpha_memdump.raw') && !parsed.file.includes('memdump')) {
                return A18Config._volError(`Unable to open file: ${parsed.file} — No such file or directory`);
            }

            // No plugin specified
            if (!parsed.plugin) {
                return A18Config._volError('No plugin specified. Use: vol.py -f <file> <plugin>\nRun vol.py --help for available plugins.');
            }

            // Route to plugin handlers
            const plugin = parsed.plugin.toLowerCase().replace('windows.', '');

            switch (plugin) {
                case 'info':
                case 'info.info':
                    return A18Config._pluginInfo();

                case 'pslist':
                    return A18Config._pluginPslist();

                case 'pstree':
                    return A18Config._pluginPstree();

                case 'netscan':
                    return A18Config._pluginNetscan();

                case 'netstat':
                    return A18Config._pluginNetscan();  // alias

                case 'cmdline':
                    return A18Config._pluginCmdline();

                case 'filescan':
                    return A18Config._pluginFilescan();

                case 'dumpfiles':
                    return A18Config._pluginDumpfiles(parsed.options);

                case 'memdump':
                    return A18Config._pluginMemdump(parsed.options);

                case 'hashdump':
                    return A18Config._pluginHashdump();

                case 'malfind':
                    return A18Config._pluginMalfind();

                case 'handles':
                    return A18Config._pluginHandles(parsed.options);

                case 'dlllist':
                    return A18Config._pluginDlllist(parsed.options);

                case 'registry.hivelist':
                    return A18Config._pluginHivelist();

                case 'registry.printkey':
                    return A18Config._pluginPrintkey(parsed.options);

                case 'ssdt':
                    return `Volatility 3 Framework ${A18Config._VOL_VERSION}\nProgress:  100.00               Scanning SSDT\n\nNo hooked entries found in the System Service Descriptor Table.\nAll SSDT entries point to valid ntoskrnl.exe addresses.`;

                case 'callbacks':
                    return `Volatility 3 Framework ${A18Config._VOL_VERSION}\nProgress:  100.00               Scanning kernel callbacks\n\nType                    Callback            Module\n----                    --------            ------\nPsSetCreateProcessNotify 0xfffff80044110a40 ntoskrnl.exe\nPsSetCreateProcessNotify 0xfffff800441b2c00 WdFilter.sys\nCmRegisterCallback       0xfffff80044180e60 ntoskrnl.exe\n\nNo suspicious callback registrations detected.`;

                case 'lsadump':
                    return `Volatility 3 Framework ${A18Config._VOL_VERSION}\nProgress:  100.00               Dumping LSA secrets\n\nSecret                  Value\n------                  -----\nDefaultPassword         (empty)\nNL$KM                   0x8a3f2b1c9e4d6a7f0b5c3e8d1a9f4c7b\n$MACHINE.ACC            0x2e6d0a3f5c8b1e4d7a0f3c6b9e2d5a8f`;

                case 'procdump':
                    return A18Config._pluginMemdump(parsed.options);  // Reuse memdump handler

                default:
                    return A18Config._volError(`Plugin "${parsed.plugin}" not found. Run vol.py --help for available plugins.`);
            }
        },

        // ── file — Identify file type ──────────────────────────────────────
        'file': function(args) {
            const target = args.join(' ');
            if (!target) return 'Usage: file <filename>';

            if (target.includes('alpha_memdump.raw')) {
                return 'alpha_memdump.raw: data (raw memory dump, 4294967296 bytes)';
            }
            if (target.includes('pid.3284.dmp')) {
                return 'pid.3284.dmp: data (process memory dump, notepad.exe PID 3284)';
            }
            if (target.includes('pid.4892.dmp')) {
                return 'pid.4892.dmp: data (process memory dump, chronos_agent.exe PID 4892)';
            }
            if (target.includes('pid.776.dmp')) {
                return 'pid.776.dmp: data (process memory dump, lsass.exe PID 776)';
            }
            if (target.includes('.dat')) {
                return `${target}: data (dumped file object)`;
            }
            if (target.includes('.txt')) {
                return `${target}: ASCII text`;
            }
            return `${target}: cannot open '${target}' (No such file or directory)`;
        },

        // ── strings — Extract printable strings from binary data ───────────
        'strings': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-'));
            if (!target) return 'Usage: strings <file>';

            const kaliDir = A18Config.filesystem['/'].children.home.children.kali.children;

            // Handle piped grep (strings X | grep Y is common in forensics)
            // The engine handles pipes, but we process common patterns here
            if (target.includes('alpha_memdump.raw')) {
                return `[!] Warning: Searching 4 GB raw dump — this will produce extensive output.
[!] Use 'strings alpha_memdump.raw | grep -i <pattern>' to filter results.

--- Sample output (first 50 lines) ---
!This program cannot be run in DOS mode.
.text
.rdata
.data
.rsrc
ntdll.dll
kernel32.dll
NTLM
NtCreateProcess
GetProcAddress
LoadLibraryA
CreateThread
VirtualAlloc
WriteProcessMemory
chronos_agent.exe
C:\\Windows\\Temp\\chronos_agent.exe
10.13.37.100
flag{chr0n0s_c2_10_13_37_100}
C2_PRIMARY=10.13.37.100
EXFIL_DOMAIN=data.chronos-c2.net
WindowsHealthService
SchTasks /Create /SC MINUTE /MO 30
intel_briefing.txt
C:\\Users\\analyst\\Desktop\\intel_briefing.txt
CLASSIFIED — INTEL BRIEFING
OPERATION MIDNIGHT SUN
Chronos Collective
flag{1nt3l_br13f1ng_chr0n0s_d3f34t3d}
TOP SECRET // NOFORN
notepad.exe
explorer.exe
svchost.exe
cmd.exe /c whoami
ipconfig /all
netstat -an
... (output truncated — 847,291 strings found in 4 GB dump)
... Use grep to filter: strings alpha_memdump.raw | grep -i "flag{"`;
            }

            // Check for dump files in the virtual filesystem
            if (kaliDir[target]) {
                return kaliDir[target].content;
            }

            // Handle the dat files
            if (target.includes('file.') && target.includes('.dat')) {
                if (kaliDir[target]) {
                    return kaliDir[target].content;
                }
                return `strings: '${target}': No such file or directory\n[!] Run vol.py windows.dumpfiles --pid <PID> first to create dump files.`;
            }

            if (target.includes('pid.') && target.includes('.dmp')) {
                if (kaliDir[target]) {
                    return kaliDir[target].content;
                }
                return `strings: '${target}': No such file or directory\n[!] Run vol.py windows.memdump --pid <PID> --dump-dir . first to create memory dumps.`;
            }

            return `strings: '${target}': No such file or directory`;
        },

        // ── grep — Search within piped output or files ─────────────────────
        'grep': function(args, term, engine) {
            // Parse grep options
            let caseInsensitive = false;
            let pattern = '';
            let file = '';
            const cleanArgs = [];

            for (const a of args) {
                if (a === '-i') { caseInsensitive = true; continue; }
                if (a === '-E' || a === '-P') { continue; }  // Extended/Perl regex flags (ignore)
                cleanArgs.push(a);
            }

            pattern = cleanArgs[0] || '';
            file = cleanArgs[1] || '';

            // Remove surrounding quotes from pattern
            pattern = pattern.replace(/^["']|["']$/g, '');

            if (!pattern) return 'Usage: grep [-i] pattern [file]';

            // If there's piped input, the terminal engine will handle it.
            // This handles direct file grep.
            if (file) {
                const kaliDir = A18Config.filesystem['/'].children.home.children.kali.children;
                const fileObj = kaliDir[file];
                if (!fileObj) return `grep: ${file}: No such file or directory`;

                const content = fileObj.content;
                const lines = content.split('\n');
                const regex = new RegExp(pattern, caseInsensitive ? 'i' : '');
                const matches = lines.filter(l => regex.test(l));
                return matches.length > 0 ? matches.join('\n') : `(no matches for "${pattern}")`;
            }

            return 'Usage: grep [-i] pattern [file]\nOr use with pipe: strings <file> | grep pattern';
        },

        // ── sha256sum — Hash verification ──────────────────────────────────
        'sha256sum': function(args) {
            const target = args[0] || '';
            if (target.includes('alpha_memdump.raw')) {
                return '8a3f2b1c9e4d6a7f0b5c3e8d1a9f4c7b2e6d0a3f5c8b1e4d7a0f3c6b9e2d5a8  alpha_memdump.raw';
            }
            return `sha256sum: ${target || '<file>'}: No such file or directory`;
        },

        // ── md5sum — Hash verification ─────────────────────────────────────
        'md5sum': function(args) {
            const target = args[0] || '';
            if (target.includes('alpha_memdump.raw')) {
                return 'd41d8cd98f00b204e9800998ecf8427e  alpha_memdump.raw';
            }
            return `md5sum: ${target || '<file>'}: No such file or directory`;
        },

        // ── xxd — Hex dump ─────────────────────────────────────────────────
        'xxd': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('alpha_memdump.raw')) {
                return `00000000: 4d5a 9000 0300 0000 0400 0000 ffff 0000  MZ..............
00000010: b800 0000 0000 0000 4000 0000 0000 0000  ........@.......
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0000 0000 e000 0000  ................
00000040: 0e1f ba0e 00b4 09cd 21b8 014c cd21 5468  ........!..L.!Th
00000050: 6973 2070 726f 6772 616d 2063 616e 6e6f  is program canno
00000060: 7420 6265 2072 756e 2069 6e20 444f 5320  t be run in DOS
00000070: 6d6f 6465 2e0d 0d0a 2400 0000 0000 0000  mode....$.......`;
            }
            return `xxd: ${target || '<file>'}: No such file or directory`;
        },

        // ── nmap — Not useful here but students might try it ───────────────
        'nmap': function(args) {
            return `Starting Nmap 7.94 ( https://nmap.org )

[!] This is a forensics workstation analyzing a memory dump.
[!] There is no live target to scan — the compromised system (SRV-INTEL-ALPHA)
    has been powered off. All evidence exists only in alpha_memdump.raw.

Use Volatility to analyze the memory dump:
  vol.py -f alpha_memdump.raw windows.netscan    # View network connections from memory
  vol.py -f alpha_memdump.raw windows.pslist      # View running processes from memory`;
        },

        // ── curl — Not applicable for this box ─────────────────────────────
        'curl': function(args) {
            return `curl: This is an offline forensics engagement.
The target system (SRV-INTEL-ALPHA) is powered off. No network services are available.
All analysis must be performed on the memory dump: alpha_memdump.raw

Use: vol.py -f alpha_memdump.raw <plugin>`;
        },

        // ── volatility (v2 alias) ──────────────────────────────────────────
        'volatility': function(args, term, engine) {
            return `[!] Volatility 2 is not installed. Use Volatility 3 instead:
    vol.py -f alpha_memdump.raw <plugin>

Note: Volatility 3 uses 'windows.' prefix for plugins:
    vol2: --profile=Win10x64_19041 pslist    →  vol3: windows.pslist
    vol2: netscan                             →  vol3: windows.netscan
    vol2: memdump -p 3284 -D .               →  vol3: windows.memdump --pid 3284 --dump-dir .`;
        },

        // ── python3 — For running vol.py explicitly ────────────────────────
        'python3': function(args, term, engine) {
            if (args[0] === 'vol.py' || args[0] === '/usr/bin/vol.py') {
                // Redirect to the vol.py command handler
                return A18Config.commands['vol.py'](args.slice(1), term, engine);
            }
            return `python3: can't open file '${args[0] || ''}': [Errno 2] No such file or directory`;
        },

        // ── hashcat — Offline hash cracking hint ──────────────────────────
        'hashcat': function(args) {
            return `hashcat (v6.2.6) — advanced password recovery

[!] No GPU detected on this workstation (VM environment).
[!] This is a forensics box — password cracking is not required for the flags.

If you extracted NTLM hashes via windows.hashdump:
  analyst: e19ccf75ee54e06b06a5907af13cef42

For reference, this hash cracks to: "Briefing2024!" (but you don't need it here).

Focus on:
  1. Network connections (user flag) → vol.py windows.netscan
  2. Process memory extraction (root flag) → vol.py windows.memdump --pid <PID>`;
        },

        // ── mimikatz — Reference but not needed ────────────────────────────
        'mimikatz': function(args) {
            return `mimikatz is not installed on this workstation.
Use vol.py -f alpha_memdump.raw windows.hashdump for NTLM extraction.
Note: Credential cracking is not required for the flags in this box.`;
        },

    },

    // ═══════════════════════════════════════════════════════
    // ADDITIONAL PLUGIN HANDLERS
    // ═══════════════════════════════════════════════════════

    _pluginDlllist(options) {
        const pid = parseInt(options?.pid);

        if (pid === 4892) {
            return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Listing loaded DLLs

PID     Process                 Base                    Size    Name                            Path
----    ----------------------  ----------------------  ------  --------------                  ----
4892    chronos_agent.exe       0x00007ff6a4200000      0x48000 chronos_agent.exe               C:\\Windows\\Temp\\chronos_agent.exe
4892    chronos_agent.exe       0x00007ffa3c300000      0x1f4000 ntdll.dll                      C:\\Windows\\System32\\ntdll.dll
4892    chronos_agent.exe       0x00007ffa3a100000      0x120000 KERNEL32.DLL                   C:\\Windows\\System32\\KERNEL32.DLL
4892    chronos_agent.exe       0x00007ffa39800000      0x300000 KERNELBASE.dll                 C:\\Windows\\System32\\KERNELBASE.dll
4892    chronos_agent.exe       0x00007ffa3b200000      0xa0000  WS2_32.dll                     C:\\Windows\\System32\\WS2_32.dll
4892    chronos_agent.exe       0x00007ffa38400000      0x80000  WINHTTP.dll                    C:\\Windows\\System32\\WINHTTP.dll
4892    chronos_agent.exe       0x00007ffa37100000      0x50000  CRYPT32.dll                    C:\\Windows\\System32\\CRYPT32.dll
4892    chronos_agent.exe       0x00007ffa36800000      0x40000  ADVAPI32.dll                   C:\\Windows\\System32\\ADVAPI32.dll

[*] chronos_agent.exe loads WS2_32.dll (Winsock), WINHTTP.dll (HTTP client), and CRYPT32.dll (encryption)
[*] This is consistent with an HTTPS-based C2 agent`;
        }

        if (!pid) {
            // Show all processes (abbreviated)
            return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Listing loaded DLLs

Use --pid <PID> for detailed DLL listing per process.

Process summary:
  System (4): 0 DLLs listed (kernel mode)
  smss.exe (396): 3 DLLs
  csrss.exe (544): 12 DLLs
  services.exe (768): 8 DLLs
  lsass.exe (776): 22 DLLs
  svchost.exe (892, 956, 1024, 1108, 1196, 1660): 15-30 DLLs each
  explorer.exe (2876): 148 DLLs
  notepad.exe (3284): 18 DLLs
  chronos_agent.exe (4892): 8 DLLs [SUSPICIOUS — loads WS2_32, WINHTTP, CRYPT32]
  cmd.exe (3512, 5016): 12 DLLs each`;
        }

        return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Listing loaded DLLs for PID ${pid}

Standard Windows DLLs loaded. No anomalies detected.`;
    },

    _pluginHivelist() {
        return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Listing registry hives

Offset(V)               FileFullPath
----------------------  --------------------------------------------------
0xffffa80043210000      \\REGISTRY\\MACHINE\\SYSTEM
0xffffa80043215000      \\REGISTRY\\MACHINE\\SOFTWARE
0xffffa8004321a000      \\REGISTRY\\MACHINE\\SAM
0xffffa8004321f000      \\REGISTRY\\MACHINE\\SECURITY
0xffffa80043224000      \\SystemRoot\\System32\\Config\\DEFAULT
0xffffa80043229000      \\REGISTRY\\USER\\S-1-5-21-3842773248-analyst
0xffffa8004322e000      \\SystemRoot\\System32\\Config\\BBI`;
    },

    _pluginPrintkey(options) {
        const key = options?.key || '';

        if (key.includes('Run') || key.includes('CurrentVersion\\Run')) {
            return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Reading registry key

Key:    HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run
Last updated: 2024-11-13 09:44:20

Values:
    SecurityHealth      REG_EXPAND_SZ   %ProgramFiles%\\Windows Defender\\MSASCuiL.exe
    WindowsHealthService REG_SZ         C:\\Windows\\Temp\\chronos_agent.exe --stealth --c2 auto

[!] WindowsHealthService is the persistence mechanism for chronos_agent.exe
[!] Disguised as a Windows health service — classic APT naming convention`;
        }

        if (key.includes('Services\\WindowsHealthService')) {
            return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Reading registry key

Key:    HKLM\\SYSTEM\\CurrentControlSet\\Services\\WindowsHealthService
Last updated: 2024-11-13 09:44:19

Values:
    DisplayName     REG_SZ      Windows Health Monitoring Service
    ImagePath       REG_SZ      C:\\Windows\\Temp\\chronos_agent.exe --stealth --c2 auto --persist schtask
    Start           REG_DWORD   2 (Automatic)
    Type            REG_DWORD   16 (Win32OwnProcess)
    Description     REG_SZ      Monitors system health metrics and performance counters.

[!] Fake service created by chronos_agent.exe for persistence`;
        }

        if (!key) {
            return A18Config._volError('windows.registry.printkey requires --key <registry_path>');
        }

        return `Volatility 3 Framework ${A18Config._VOL_VERSION}
Progress:  100.00               Reading registry key

Key:    ${key}
Key not found or no values.`;
    },

};
