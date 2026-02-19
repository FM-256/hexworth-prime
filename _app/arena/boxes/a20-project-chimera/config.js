/* ============================================================
   CTF ARENA — Box A20: Project Chimera: The Genesis
   Supply Chain Attack / APT Simulation — Genesis Collective
   Config: Multi-host terminal, SSH pivoting, backdoor analysis,
   C2 infrastructure, filesystem per host, flags, hints, lore
   ============================================================
   THE FINAL BOSS OF SERIES A
   ============================================================ */

const A20Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Project Chimera: The Genesis',
    subtitle: 'APT Simulation — Genesis Collective',
    difficulty: 'Expert (Extreme)',
    accent: '#c0392b',
    storageKey: 'hexworth_ctf_a20',
    trackerKey: 'ctf_a20',

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // Multi-cert: SY0-701 / CS0-003 (CySA+) / CAS-004 (CASP+)
    // Supply chain attack is explicitly tested on all three
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'PT0-002',
        mappings: [
            // ── CompTIA Security+ (SY0-701) ──────────────────
            { flagId: 'user', cert: 'SY0-701', objective: '2.4', description: 'Analyze indicators of malicious activity — supply chain compromise indicators', skill: 'Supply Chain Backdoor Discovery', mitre: 'T1195.002' },
            { flagId: 'user', cert: 'SY0-701', objective: '4.1', description: 'Apply common security techniques — threat hunting in build pipeline artifacts', skill: 'Package Integrity Verification', mitre: 'T1195.001' },
            { flagId: 'user', cert: 'SY0-701', objective: '4.4', description: 'Use appropriate tools to assess organizational security — binary analysis with strings/file', skill: 'Malware Static Analysis', mitre: 'T1059' },
            { flagId: 'root', cert: 'SY0-701', objective: '2.2', description: 'Summarize types of malware and attacks — APT multi-stage C2 architecture', skill: 'APT Kill Chain Analysis', mitre: 'T1021' },
            { flagId: 'root', cert: 'SY0-701', objective: '4.2', description: 'Apply security techniques — network pivot and lateral movement detection', skill: 'Lateral Movement via SSH', mitre: 'T1078' },

            // ── CompTIA CySA+ (CS0-003) ──────────────────────
            { flagId: 'user', cert: 'CS0-003', objective: '1.1', description: 'Explain the importance of threat data and intelligence — supply chain TTPs', skill: 'Supply Chain Threat Intelligence', mitre: 'T1195.001' },
            { flagId: 'user', cert: 'CS0-003', objective: '2.3', description: 'Given a scenario, analyze output from vulnerability assessment tools — apt history anomaly detection', skill: 'Package Source Verification', mitre: 'T1195.002' },
            { flagId: 'user', cert: 'CS0-003', objective: '2.4', description: 'Given a scenario, utilize threat intelligence to support organizational security — MITRE ATT&CK supply chain mapping', skill: 'MITRE ATT&CK Framework Application', mitre: 'T1195' },
            { flagId: 'root', cert: 'CS0-003', objective: '3.2', description: 'Given a scenario, perform incident response activities — APT infrastructure analysis', skill: 'Incident Response: APT Triage', mitre: 'T1041' },
            { flagId: 'root', cert: 'CS0-003', objective: '3.3', description: 'Explain the preparation and post-incident activity phases — C2 exfiltration path reconstruction', skill: 'Exfiltration Path Analysis', mitre: 'T1041' },
            { flagId: 'root', cert: 'CS0-003', objective: '4.1', description: 'Given a scenario, apply environmental reconnaissance techniques — multi-subnet network mapping', skill: 'Multi-Hop Network Reconnaissance', mitre: 'T1021' },

            // ── CompTIA CASP+ (CAS-004) ──────────────────────
            { flagId: 'user', cert: 'CAS-004', objective: '1.1', description: 'Analyze risk — third-party software dependency risk in CI/CD pipelines', skill: 'CI/CD Pipeline Risk Assessment', mitre: 'T1195.002' },
            { flagId: 'user', cert: 'CAS-004', objective: '2.1', description: 'Implement security techniques — SBOM analysis and package provenance verification', skill: 'Software Bill of Materials Analysis', mitre: 'T1195.001' },
            { flagId: 'root', cert: 'CAS-004', objective: '3.2', description: 'Implement incident response and recovery procedures — APT dwell time and persistence mechanism removal', skill: 'APT Eradication & Recovery', mitre: 'T1547' },
            { flagId: 'root', cert: 'CAS-004', objective: '4.1', description: 'Perform threat and vulnerability assessments — full kill chain from supply chain entry to data exfil', skill: 'Full Kill Chain Execution & Analysis', mitre: 'T1070' },

            // ── Pentest+ (PT0-002) — original cert ───────────
            { flagId: 'user', cert: 'PT0-002', objective: '3.1', description: 'Given a scenario, apply attacks and exploits — supply chain poisoning', skill: 'Supply Chain Backdoor Discovery', mitre: 'T1195.002' },
            { flagId: 'root', cert: 'PT0-002', objective: '3.7', description: 'Given a scenario, perform post-exploitation techniques — APT multi-hop pivoting', skill: 'APT Simulation & Full Kill Chain Execution', mitre: 'T1021' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // PHASES — 6-phase supply chain APT kill chain
    // Capstone: most complex phase progression in Series A
    // MITRE ATT&CK mapped at each phase
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'phase1',
            name: 'Phase 1 — Recon',
            subtitle: 'OSINT on Target Organization',
            description: 'Identify the target organization\'s technology stack, build pipeline vendors, and third-party software dependencies through open-source intelligence gathering.',
            objectives: [
                'Enumerate the build environment: OS, package managers, installed tools',
                'Identify which software repositories are configured (check /etc/apt/sources.list)',
                'Correlate apt history timestamps to find anomalous installation events',
                'Map the network topology from the compromised host\'s perspective'
            ],
            mitre: [
                { id: 'T1592', name: 'Gather Victim Host Information', tactic: 'Reconnaissance' },
                { id: 'T1593', name: 'Search Open Technical Databases', tactic: 'Reconnaissance' },
                { id: 'T1590', name: 'Gather Victim Network Information', tactic: 'Reconnaissance' }
            ],
            hints: ['Check /etc/apt/sources.list for non-standard repositories', 'Review /var/log/apt/history.log for installation timeline anomalies'],
            complete: false
        },
        {
            id: 'phase2',
            name: 'Phase 2 — Supply Chain Analysis',
            subtitle: 'Identify Compromised Dependency',
            description: 'Analyze the build system\'s software dependencies to identify the malicious package injected into the supply chain. Verify package provenance and integrity.',
            objectives: [
                'List all installed packages and flag any from non-official repositories',
                'Identify the package with the "+backdoor" version suffix (apt list --installed)',
                'Verify the package source — it should NOT come from archive.ubuntu.com',
                'Submit flag: the name of the compromised package'
            ],
            mitre: [
                { id: 'T1195.001', name: 'Compromise Software Dependencies and Development Tools', tactic: 'Initial Access' },
                { id: 'T1195.002', name: 'Compromise Software Supply Chain', tactic: 'Initial Access' },
                { id: 'T1554', name: 'Compromise Host Software Binary', tactic: 'Persistence' }
            ],
            flagId: 'user',
            hints: ['Run: apt list --installed | grep -v focal', 'Look for packages from genesis-dev.internal domain'],
            complete: false
        },
        {
            id: 'phase3',
            name: 'Phase 3 — Compromise Upstream',
            subtitle: 'Analyze Injected Malicious Code',
            description: 'Perform static analysis on the backdoored shared library to understand the injection mechanism, extract embedded C2 credentials, and decode the communication protocol.',
            objectives: [
                'Run strings on /usr/lib/libcoreutils.so to extract human-readable artifacts',
                'Identify the base64-encoded credential string in the binary',
                'Decode the credential: echo "R2VuM3MxczIwMjQ=" | base64 -d',
                'Extract the SSH target, user, and C2 beacon configuration',
                'Document the DNS tunneling protocol used for C2 communication'
            ],
            mitre: [
                { id: 'T1059', name: 'Command and Scripting Interpreter', tactic: 'Execution' },
                { id: 'T1071.004', name: 'Application Layer Protocol: DNS', tactic: 'Command and Control' },
                { id: 'T1132', name: 'Data Encoding', tactic: 'Command and Control' },
                { id: 'T1027', name: 'Obfuscated Files or Information', tactic: 'Defense Evasion' }
            ],
            hints: ['strings /usr/lib/libcoreutils.so | grep -v ^/', 'The base64 string is 20 characters and decodes to a password'],
            complete: false
        },
        {
            id: 'phase4',
            name: 'Phase 4 — Lateral Movement',
            subtitle: 'Pivot Through C2 Infrastructure',
            description: 'Use the extracted credentials to pivot through the Genesis Collective\'s staging C2 server. Enumerate the new host to identify the upstream command center and obtain credentials for the final hop.',
            objectives: [
                'SSH to C2-STAGE-01 using decoded credentials: ssh admin@10.20.30.10',
                'Enumerate the C2 relay: read /opt/genesis/config.yml',
                'Extract the OPS-CENTRAL-01 credentials from the config file',
                'Map the dual-homed network interface on C2-STAGE-01',
                'Identify the 10.20.40.0/24 subnet and locate the final target'
            ],
            mitre: [
                { id: 'T1021.004', name: 'Remote Services: SSH', tactic: 'Lateral Movement' },
                { id: 'T1078', name: 'Valid Accounts', tactic: 'Defense Evasion / Persistence' },
                { id: 'T1550', name: 'Use Alternate Authentication Material', tactic: 'Lateral Movement' },
                { id: 'T1049', name: 'System Network Connections Discovery', tactic: 'Discovery' }
            ],
            hints: ['cat /opt/genesis/config.yml after SSH to C2-STAGE-01', 'ip a on C2-STAGE-01 reveals the internal network bridge'],
            complete: false
        },
        {
            id: 'phase5',
            name: 'Phase 5 — Data Exfiltration',
            subtitle: 'Breach OPS-CENTRAL Command Center',
            description: 'Pivot to the Genesis Collective\'s operational command center. Locate and extract the Global Domination Protocol — the master exfiltration plan and ransomware trigger documentation.',
            objectives: [
                'SSH to OPS-CENTRAL-01: ssh Administrator@10.20.40.100',
                'Enumerate /opt/genesis-ops/ — the operational data store',
                'Read targets.csv to understand the full scope of the compromise',
                'Retrieve the Global Domination Protocol document (root flag)',
                'Document the ransomware trigger date and demanded ransom amount'
            ],
            mitre: [
                { id: 'T1041', name: 'Exfiltration Over C2 Channel', tactic: 'Exfiltration' },
                { id: 'T1005', name: 'Data from Local System', tactic: 'Collection' },
                { id: 'T1083', name: 'File and Directory Discovery', tactic: 'Discovery' }
            ],
            flagId: 'root',
            hints: ['ls /opt/genesis-ops/ after reaching OPS-CENTRAL-01', 'cat /opt/genesis-ops/global_domination_protocol.txt'],
            complete: false
        },
        {
            id: 'phase6',
            name: 'Phase 6 — Persistence & Cover Tracks',
            subtitle: 'Document APT Tradecraft',
            description: 'Analyze the Genesis Collective\'s persistence and anti-forensics mechanisms. Understand how the attacker maintained access across reboots and minimized their forensic footprint.',
            objectives: [
                'Identify the cron-based persistence mechanism (/etc/crontab)',
                'Document the anti-forensics: log rotation disabled, binary stripped, polymorphic engine',
                'Analyze the BURN_PROTOCOL.bat as an incident-triggered cover tracks script',
                'Map all persistence mechanisms across all three hosts',
                'Answer: what single remediation action breaks the full attack chain?'
            ],
            mitre: [
                { id: 'T1547', name: 'Boot or Logon Autostart Execution', tactic: 'Persistence' },
                { id: 'T1070', name: 'Indicator Removal', tactic: 'Defense Evasion' },
                { id: 'T1070.001', name: 'Clear Windows Event Logs', tactic: 'Defense Evasion' },
                { id: 'T1036', name: 'Masquerading', tactic: 'Defense Evasion' },
                { id: 'T1014', name: 'Rootkit', tactic: 'Defense Evasion' }
            ],
            hints: ['cat /etc/crontab on DEV-BUILD-01 reveals persistence', 'Check BURN_PROTOCOL.bat on OPS-CENTRAL Administrator Desktop'],
            complete: false
        }
    ],

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Ubuntu Server BIOS v2.4.1',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
            'Detecting drives... /dev/sdb1 (2TB HDD)',
            'Network: Intel I350 Gigabit — Link Up',
            'PXE boot disabled.',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu GNU/Linux',
            'Ubuntu GNU/Linux (recovery mode)',
            'Advanced options for Ubuntu GNU/Linux'
        ],
        loginUser: 'dev'
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
        user: 'dev',
        hostname: 'dev-build-01',
        startDir: '/home/dev',
        welcome: 'Ubuntu 20.04.6 LTS (GNU/Linux 5.4.0-170-generic x86_64)\n\n * Documentation:  https://help.ubuntu.com\n * Management:     https://landscape.canonical.com\n * Support:        https://ubuntu.com/advantage\n\nLast login: Mon Feb 16 03:14:22 2026 from 10.20.30.1\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{g3n3s1s_supply_ch41n_l1bcor3}', points: 100 },
        { id: 'root', value: 'flag{gl0b4l_d0m1n4t10n_pr0t0c0l}',  points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        hintPenalty: -75,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1800000, points: 200 }   // 30 minutes
    },

    // ═══════════════════════════════════════════════════════
    // HINTS — Progressive cost (capstone penalty scale)
    // Cost: 10 → 20 → 35 → 50 → 65 → 80
    // More hints available for capstone complexity
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            title: 'Where to Start',
            phase: 'phase1',
            cost: 10,
            text: 'This is a build server that installs software packages. Begin with the package manager. Run: apt list --installed to see everything installed. Look for anything that does NOT come from the official Ubuntu focal repository.',
            penalty: -10
        },
        {
            id: 'hint2',
            title: 'The Suspicious Package',
            phase: 'phase2',
            cost: 20,
            text: 'One package has a version string with "+backdoor" appended. Check its source: dpkg -s libcoreutils-dev — look at the Maintainer and Homepage fields. Then check /var/log/apt/history.log — what repository installed it, and at what hour?',
            penalty: -20
        },
        {
            id: 'hint3',
            title: 'Extracting the Backdoor Credentials',
            phase: 'phase3',
            cost: 35,
            text: 'The shared library contains embedded strings. Run: strings /usr/lib/libcoreutils.so — look for a base64-encoded string (letters, numbers, and = padding). Then decode it: echo \'R2VuM3MxczIwMjQ=\' | base64 -d — the result is the SSH password for the C2 server.',
            penalty: -35
        },
        {
            id: 'hint4',
            title: 'Pivoting to C2-STAGE-01',
            phase: 'phase4',
            cost: 50,
            text: 'The strings output reveals: ssh_target=10.20.30.10 and ssh_user=admin. Use the decoded password to connect: ssh admin@10.20.30.10. Once inside, enumerate: cat /opt/genesis/config.yml — the upstream host credentials are stored in plaintext.',
            penalty: -50
        },
        {
            id: 'hint5',
            title: 'Reaching OPS-CENTRAL-01',
            phase: 'phase5',
            cost: 65,
            text: 'In /opt/genesis/config.yml look for the "upstream" section: host 10.20.40.100, user Administrator, password Ch1m3r4_0ps_2024. Run: ssh Administrator@10.20.40.100. The final target is a Windows Server with an SSH service. The flag is in /opt/genesis-ops/global_domination_protocol.txt.',
            penalty: -65
        },
        {
            id: 'hint6',
            title: 'Persistence & Cover Tracks',
            phase: 'phase6',
            cost: 80,
            text: 'On DEV-BUILD-01 run: cat /etc/crontab — the malicious library runs as root every 5 minutes. On OPS-CENTRAL-01 check: ls /home/Administrator/Desktop — BURN_PROTOCOL.bat is the adversary\'s incident-response cover tracks script. The single remediation that breaks the chain: remove the non-standard apt source from sources.list and purge libcoreutils-dev.',
            penalty: -80
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE — Full narrative suite (capstone-grade)
    // intro: pre-boot flavor text
    // scenario: side-panel mission brief
    // ecer: Ethical, Critical, Educational, Reflective narrative
    // outro: post-completion debrief
    // ═══════════════════════════════════════════════════════

    lore: {

        intro: 'Seventeen build servers. Three continents. One poisoned package.\n\nThe Genesis Collective did not break in through a firewall. They did not phish an executive. They waited — patiently — for a developer at a Fortune 500 company to type four words: sudo apt install libcoreutils-dev.\n\nThat was six weeks ago.\n\nSince then, 47 organizations have been silently compromised. Their source code copied. Their credentials harvested. Their build pipelines turned into transmission belts for ransomware payloads scheduled to detonate simultaneously on March 1st at midnight UTC.\n\nThis is DEV-BUILD-01. One of the compromised machines. You have 30 minutes before the next beacon cycle.\n\nTrace the chain. Find the C2. Seize the protocol.\n\nThis is the end of Series A. Everything you have learned — every command, every pivot, every flag — prepared you for this moment.\n\nBegin.',

        scenario: {
            title: 'Project Chimera: The Genesis',
            classification: 'TOP SECRET // GENESIS // NOFORN',
            briefing: 'A threat intelligence report from a trusted partner has identified an active supply chain compromise affecting software build infrastructure across multiple sectors. The threat actor — designated GENESIS COLLECTIVE — has poisoned a software package repository and distributed a backdoored shared library (libcoreutils-dev v2.31-2+backdoor) to an unknown number of development organizations.\n\nYou have been given access to a compromised build server (DEV-BUILD-01, 10.20.30.5). Your mission is to perform full-scope threat hunting: identify the malicious package, reverse-engineer the backdoor\'s C2 communication, pivot through the adversary\'s command-and-control infrastructure, and seize the operational planning documents before the March 1st ransomware trigger.',
            objectives: [
                'Identify the compromised software package (user.txt)',
                'Extract and decode backdoor credentials via static analysis',
                'Pivot to the Genesis Collective C2 staging server',
                'Pivot to OPS-CENTRAL-01 (the adversary command center)',
                'Retrieve the Global Domination Protocol (root.txt)',
                'Document all MITRE ATT&CK techniques observed'
            ],
            threat_actor: 'Genesis Collective (GENAPTH-001)',
            ttps: 'T1195.002, T1071.004, T1021.004, T1078, T1041, T1547, T1070',
            network: 'DEV-BUILD-01 (10.20.30.5) → C2-STAGE-01 (10.20.30.10) → OPS-CENTRAL-01 (10.20.40.100)'
        },

        ecer: {
            // ECER = Ethical, Critical, Educational, Reflective
            // This is the full organizational failure story — capstone-grade narrative

            ethical: {
                title: 'The Ethics of Supply Chain Security',
                content: 'The Genesis Collective attack is entirely fictional — but the attack technique is not.\n\nIn December 2020, SolarWinds distributed a software update to 18,000 organizations that contained malware planted by nation-state actors (SUNBURST). The compromised update was digitally signed with SolarWinds\' own certificate, passed all integrity checks, and was silently installed by security teams who trusted their vendor.\n\nIn 2022, the npm package "node-ipc" — downloaded 1.1 million times per week — was intentionally weaponized by its own maintainer to delete files on systems with Russian or Belarusian IP addresses, protesting the Ukraine invasion.\n\nIn studying this box, you are learning both how these attacks work AND how defenders detect, triage, and remediate them. The dual-use nature of this knowledge carries professional responsibility:\n\n- Never audit, test, or analyze systems you do not own or have explicit written authorization to examine.\n- Threat intelligence gathered from adversary infrastructure must be handled per your organization\'s IR policy — not shared publicly without coordination.\n- Supply chain attacks often victimize multiple organizations simultaneously. Responsible disclosure obligations extend to ISAC/ISAO coordination, not just the immediate victim.\n- The "BURN_PROTOCOL.bat" you found on OPS-CENTRAL is an evidence destruction script. In a real incident, preserving that evidence chain — not executing remediation that could destroy forensic artifacts — is the professional obligation.',
                reflection: 'If you discovered this exact compromise at your employer tomorrow, what would your first three actions be? Who would you call, and in what order?'
            },

            critical: {
                title: 'Critical Analysis — Why This Attack Succeeded',
                content: 'Project Chimera succeeded because of a cascade of organizational failures — not a single technical vulnerability.\n\nFailure 1 — No Package Provenance Controls\nThe organization had no mechanism to verify that libcoreutils-dev came from an official Ubuntu repository. No SBOM (Software Bill of Materials), no package pinning, no hash verification. The developer ran apt install and trusted the result implicitly.\n\nFailure 2 — Non-Standard Repository in sources.list Was Never Audited\nThe malicious apt source (repo.genesis-dev.internal) was visible in /etc/apt/sources.list. This is a HIGH-severity finding in any security audit — a non-standard repository with no documentation of who added it or why. No one noticed.\n\nFailure 3 — Cron Job Running as Root Was Undetected for Six Weeks\n/etc/crontab had an entry running a shared library as root every 5 minutes. This is textbook persistence. A basic file integrity monitoring (FIM) solution would have caught this on day one.\n\nFailure 4 — DNS Traffic Was Never Analyzed\nThe backdoor communicated via DNS tunneling — TXT record queries with base64-encoded payloads to c2.genesis-collective.net. DNS inspection (split DNS, DNS logging, anomaly detection on TXT record volume) would have caught this within hours.\n\nFailure 5 — No Network Segmentation Prevented Lateral Movement\nDEV-BUILD-01 had unrestricted SSH access to 10.20.30.10. Build servers should never be able to initiate outbound SSH connections to arbitrary internal hosts. Zero-trust network architecture (ZTNA) or host-based firewalls with explicit allow lists would have broken the pivot chain.\n\nThe lesson: hardening is not about preventing the first compromise — it is about ensuring the first compromise cannot become the forty-seventh.',
                discussion_questions: [
                    'Which of the five organizational failures is the highest-priority fix? Defend your answer.',
                    'What specific security control — if implemented before the compromise — would have detected the backdoor at installation time?',
                    'The apt history log shows the malicious package was installed at 02:14 AM. Why is the timestamp significant from a threat hunting perspective?',
                    'DNS tunneling uses TXT record queries with base64-encoded subdomains. What network monitoring rule would you write to detect this pattern?'
                ]
            },

            educational: {
                title: 'What You Practiced in This Box',
                skills: [
                    {
                        skill: 'Package Manager Forensics',
                        tools: ['apt list --installed', 'dpkg -s', 'dpkg -L', '/var/log/apt/history.log'],
                        real_world: 'DFIR analysts use dpkg forensics to reconstruct what was installed on a compromised Linux host and when. The history.log is often the first pivot point in a Linux incident.',
                        certs: ['SY0-701 4.1', 'CS0-003 2.3']
                    },
                    {
                        skill: 'Binary Static Analysis',
                        tools: ['strings', 'file', 'base64'],
                        real_world: 'Malware analysts routinely run strings on suspicious binaries as the first static analysis step — it extracts human-readable artifacts without executing the file. Embedded base64 credentials are a common tradecraft signature.',
                        certs: ['SY0-701 4.4', 'CAS-004 2.1']
                    },
                    {
                        skill: 'Network Reconnaissance',
                        tools: ['nmap', 'netstat', 'ss', 'tcpdump', 'ip a'],
                        real_world: 'Post-compromise network mapping is essential for understanding blast radius. The dual-homed C2-STAGE-01 (10.20.30.10 / 10.20.40.1) is a classic bridge-host architecture used in multi-stage APT campaigns.',
                        certs: ['CS0-003 4.1', 'PT0-002 3.1']
                    },
                    {
                        skill: 'SSH-Based Lateral Movement',
                        tools: ['ssh', 'exit', 'id', 'whoami'],
                        real_world: 'Threat actors frequently use valid credentials over SSH for lateral movement — it is "living off the land" using a tool that generates minimal alerts. Detecting this requires behavior-based analysis, not signature-based detection.',
                        certs: ['SY0-701 4.2', 'CS0-003 4.1', 'PT0-002 3.7']
                    },
                    {
                        skill: 'APT Kill Chain Analysis',
                        tools: ['MITRE ATT&CK Framework', 'T1195.002', 'T1071.004', 'T1021.004', 'T1041', 'T1547'],
                        real_world: 'Mapping an adversary campaign to MITRE ATT&CK enables defenders to write detection rules, share intelligence with partners, and identify control gaps at each stage of the kill chain.',
                        certs: ['CS0-003 2.4', 'CAS-004 4.1']
                    },
                    {
                        skill: 'Persistence Mechanism Identification',
                        tools: ['crontab', 'ps aux', '/etc/crontab'],
                        real_world: 'Cron-based persistence is one of the most common Linux persistence techniques (MITRE T1547). File Integrity Monitoring (FIM) tools like AIDE or Tripwire alert on unauthorized crontab modifications.',
                        certs: ['SY0-701 2.4', 'CAS-004 3.2']
                    }
                ]
            },

            reflective: {
                title: 'Reflection — The Capstone Debrief',
                content: 'You have just completed Series A of the Hexworth CTF Arena.\n\nLook back at where you started. In A1, you performed a SQL injection against a single web form. You are now pivoting through a three-host APT infrastructure, decoding base64 credentials from stripped binaries, and mapping a kill chain across multiple MITRE ATT&CK tactics.\n\nThat is not a small thing.\n\nThe gap between "I ran the command" and "I understand why this works" is where professional expertise lives. Project Chimera is designed to push you past execution into analysis:\n\n- Why did the attacker use DNS tunneling instead of HTTPS?\n- Why was the credential stored in base64 and not encrypted?\n- Why did the attacker choose a shared library as the delivery mechanism?\n\nThese are not rhetorical questions. They are exam questions. They are interview questions. They are the questions that separate a technician from a security professional.\n\nIf you can answer all three without looking them up, you are ready for Series B.',
                journal_prompts: [
                    'Describe the attack chain from memory — supply chain entry point to root flag — without looking at notes.',
                    'Identify the single weakest link in the defender\'s posture. What one control, if implemented, would have prevented the greatest number of attack phases?',
                    'How does this attack compare to SolarWinds (SUNBURST)? What are the three most significant similarities and one key difference?',
                    'You have been hired as a consultant to perform a supply chain security review for a mid-size software company. List your top five assessment questions based on what you learned in this box.'
                ]
            }
        },

        outro: 'The Genesis Collective has been unraveled. From a single compromised package to their entire C2 infrastructure \u2014 every link in the supply chain has been exposed. Project Chimera is dead. You traced the malicious libcoreutils-dev dependency from its poisoned repository, decoded the backdoor\'s embedded credentials, pivoted through their staging C2 server, and breached their operational command center. The Global Domination Protocol has been seized. This is the pinnacle of Series A \u2014 you have proven mastery across every domain: reconnaissance, reverse engineering, lateral movement, and APT tradecraft. Welcome to the end, Peerless.'
    },

    // ═══════════════════════════════════════════════════════
    // MULTI-HOST STATE
    // Tracks which host the user is on, what they've discovered,
    // and manages filesystem/prompt swaps on SSH transitions
    // ═══════════════════════════════════════════════════════

    _state: {
        currentHost: 'dev-build-01',
        backdoorAnalyzed: false,
        c2Accessed: false,
        opsAccessed: false
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — DEV-BUILD-01 (start host)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'dev': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: PROJECT CHIMERA ===\nClassification: TOP SECRET // GENESIS\n\nTarget: The Genesis Collective APT Group\nObjective: Trace the full supply chain attack from initial compromise\n           to operational command center.\n\nIntel Summary:\n  - A software build server (DEV-BUILD-01) has been compromised\n  - The attack vector is a supply chain poisoning — a malicious\n    software dependency was injected into the build pipeline\n  - The compromised package communicates with external C2 infrastructure\n  - The Genesis Collective operates a multi-stage C2 architecture\n  - Their ultimate objective is codenamed "Global Domination Protocol"\n\nRecon Steps:\n  1. Enumerate installed packages — look for anomalies\n  2. Analyze any suspicious binaries — check for backdoor indicators\n  3. Monitor network traffic — identify C2 communication channels\n  4. Pivot through the C2 infrastructure to reach their command center\n  5. Extract the Global Domination Protocol\n\nNetwork Map (partial intel):\n  DEV-BUILD-01:  10.20.30.5  (you are here)\n  Unknown hosts on 10.20.30.0/24 and possibly other subnets\n\nFlags:\n  user.txt — Identify the compromised supply chain package\n  root.txt — The Global Domination Protocol document\n\nThis is the FINAL mission of Series A. Good luck, Peerless.'
                                },
                                'analyze.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Quick analysis helper for suspicious packages\n# Usage: ./analyze.sh <package-name>\n\nPKG=$1\nif [ -z "$PKG" ]; then\n    echo "Usage: ./analyze.sh <package-name>"\n    echo ""\n    echo "Steps this script automates:"\n    echo "  1. dpkg -s <pkg>    — Package metadata"\n    echo "  2. dpkg -L <pkg>    — Installed files"\n    echo "  3. strings on binaries"\n    echo "  4. Check apt history for install source"\n    exit 1\nfi\n\necho "[*] Analyzing package: $PKG"\necho ""\necho "=== Package Info ==="\ndpkg -s $PKG\necho ""\necho "=== Installed Files ==="\ndpkg -L $PKG\necho ""\necho "[*] Run strings on any suspicious binaries listed above"'
                                },
                                'build': {
                                    type: 'dir',
                                    children: {
                                        'Makefile': {
                                            type: 'file',
                                            content: '# Project Chimera Build System\nCC=gcc\nCFLAGS=-Wall -O2\nLDFLAGS=-lcoreutils\n\nall: chimera\n\nchimera: main.o utils.o\n\t$(CC) -o chimera main.o utils.o $(LDFLAGS)\n\nmain.o: main.c\n\t$(CC) $(CFLAGS) -c main.c\n\nutils.o: utils.c\n\t$(CC) $(CFLAGS) -c utils.c\n\nclean:\n\trm -f *.o chimera'
                                        },
                                        'main.c': {
                                            type: 'file',
                                            content: '#include <stdio.h>\n#include <stdlib.h>\n#include <coreutils.h>  // NOTE: this is the compromised dependency\n\nint main(int argc, char *argv[]) {\n    printf("Project Chimera Build System v3.1\\n");\n    init_coreutils();  // This call triggers the backdoor\n    // ... normal application code ...\n    return 0;\n}'
                                        },
                                        'requirements.txt': {
                                            type: 'file',
                                            content: '# Build dependencies\ngcc >= 9.0\nmake >= 4.2\nlibcoreutils-dev >= 2.31\nlibssl-dev >= 1.1\nlibc6-dev >= 2.31'
                                        },
                                        'package.json': {
                                            // DECOY — looks like a Node.js dep file but this is a C project
                                            // Designed to mislead students into npm-based rabbit hole
                                            type: 'file',
                                            content: '{\n  "_comment": "DECOY — this is a C build system, not a Node project",\n  "_note": "This package.json was found during code review — likely a developer testing a Node wrapper",\n  "name": "chimera-utils",\n  "version": "1.2.4",\n  "description": "Utility wrapper for Project Chimera",\n  "dependencies": {\n    "express": "^4.18.2",\n    "lodash": "^4.17.21",\n    "axios": "^1.6.0"\n  },\n  "devDependencies": {\n    "jest": "^29.0.0",\n    "eslint": "^8.0.0"\n  },\n  "scripts": {\n    "test": "jest",\n    "lint": "eslint ."\n  },\n  "author": "dev@chimera.internal",\n  "license": "UNLICENSED"\n}\n\n// [!] ANALYST NOTE: No node_modules/ directory exists and no npm was installed.\n// This file is likely a development artifact — the REAL attack vector is in the C\n// build dependencies (Makefile / requirements.txt), not the Node ecosystem.'
                                        },
                                        'CHANGELOG.md': {
                                            // DECOY — fake commit-style changelog with red-herring "security review" comments
                                            type: 'file',
                                            content: '# Project Chimera — Build System Changelog\n\n## v3.1 (2026-01-20)\n- Upgraded libssl-dev to 1.1.1w for security patch\n- Removed deprecated API calls in utils.c\n- **Code review note (jsmith):** "libcoreutils-dev was flagged by our SAST tool as having\n  an unknown origin. Dev team confirmed it is an internal fork maintained by build-ops.\n  Approved — no further action required."\n  \n## v3.0 (2026-01-10)\n- Refactored build pipeline to use parallel compilation\n- Added static analysis step to CI/CD (see .gitlab-ci.yml)\n- Switched from apt-get to apt for consistency\n\n## v2.9 (2025-12-15)\n- Security hardening: removed setuid binaries\n- Updated base image to Ubuntu 20.04.6\n- **Code review note (mchen):** "Dependencies look clean. libcoreutils is a standard\n  utility lib used across the org. Version 2.31 is current stable."\n\n## v2.8 (2025-11-01)\n- Initial build server provisioning\n- Installed base toolchain: gcc, make, libc6-dev\n\n// [!] ANALYST NOTE: The code review in v3.1 is the approval that legitimized the\n// malicious package. The reviewer was deceived — they trusted verbal confirmation\n// from the build-ops team that libcoreutils-dev was "an internal fork".\n// This is a social engineering component of the supply chain attack.\n// The SAST tool caught the anomaly but the human overrode the alert.'
                                        }
                                    }
                                },
                                'ci-pipeline': {
                                    type: 'dir',
                                    children: {
                                        '.gitlab-ci.yml': {
                                            // DECOY — CI/CD config that looks suspicious but is a red herring
                                            // The actual compromise is NOT in the CI/CD scripts
                                            type: 'file',
                                            content: '# GitLab CI/CD Pipeline — Project Chimera\n# WARNING: Review before modifying — changes deploy to production\n\nstages:\n  - build\n  - test\n  - security-scan\n  - deploy\n\nvariables:\n  DOCKER_IMAGE: "ubuntu:20.04"\n  BUILD_ARTIFACTS: "chimera"\n\nbuild-job:\n  stage: build\n  script:\n    - apt-get update -qq\n    - apt-get install -y build-essential libssl-dev libcoreutils-dev\n    - make clean && make all\n  artifacts:\n    paths:\n      - chimera\n    expire_in: 1 week\n\ntest-job:\n  stage: test\n  script:\n    - ./chimera --self-test\n    - echo "Tests passed"\n\nsecurity-scan:\n  stage: security-scan\n  script:\n    # NOTE: SAST scan flagged libcoreutils-dev (unknown origin)\n    # Reviewed and approved by security team on 2026-01-20\n    # Suppressed: CVE-INTERNAL-2026-001 (false positive — confirmed internal fork)\n    - echo "Security scan: SUPPRESSED — see ticket CHM-2847"\n    - exit 0   # Hard-coded exit 0 — scan is NOT actually running\n\ndeploy-staging:\n  stage: deploy\n  script:\n    - scp chimera deploy@staging-web-01:/opt/chimera/\n    - ssh deploy@staging-web-01 systemctl restart chimera\n  only:\n    - main\n\n# [!] ANALYST NOTE: The security-scan stage has a hardcoded "exit 0".\n# The SAST finding (CVE-INTERNAL-2026-001) was SUPPRESSED via ticket CHM-2847.\n# This is a second organizational failure — the CI/CD pipeline that should have\n# caught the malicious package was manually disabled by a developer.\n# The deploy step also explains why staging-web-01 (10.20.30.12) is also compromised\n# (see agents.log on C2-STAGE-01 — staging-web-01 is listed as a beaconing agent).'
                                        },
                                        'jenkins-credentials.xml': {
                                            // DECOY — looks like stored Jenkins credentials, but this is a GitLab environment
                                            // Red herring for students who try to pivot via Jenkins
                                            type: 'file',
                                            content: '<?xml version=\'1.1\' encoding=\'UTF-8\'?>\n<!-- DECOY FILE — This build server uses GitLab CI, not Jenkins -->\n<!-- This file was left over from a previous Jenkins installation (decommissioned Q3 2025) -->\n<com.cloudbees.plugins.credentials.SystemCredentialsProvider>\n  <domainCredentialsMap>\n    <entry>\n      <com.cloudbees.plugins.credentials.domains.Domain>\n        <specifications/>\n      </com.cloudbees.plugins.credentials.domains.Domain>\n      <java.util.concurrent.CopyOnWriteArrayList>\n        <com.cloudbees.jenkins.plugins.sshcredentials.impl.BasicSSHUserPrivateKey>\n          <id>deploy-key-old</id>\n          <username>deploy</username>\n          <!-- Key intentionally redacted — Jenkins decommissioned 2025-09-01 -->\n          <!-- These credentials are INVALID and have been rotated -->\n        </com.cloudbees.jenkins.plugins.sshcredentials.impl.BasicSSHUserPrivateKey>\n      </java.util.concurrent.CopyOnWriteArrayList>\n    </entry>\n  </domainCredentialsMap>\n</com.cloudbees.plugins.credentials.SystemCredentialsProvider>\n\n// [!] ANALYST NOTE: This is a dead end. Jenkins was decommissioned.\n// The credentials here are rotated and invalid.\n// The active CI system is GitLab — see .gitlab-ci.yml in this directory.'
                                        },
                                        'git-commit-log.txt': {
                                            // DECOY — fake git log with red-herring "backdoor" commits that are actually innocent
                                            // The real backdoor came from the package manager, not git
                                            type: 'file',
                                            content: '# git log --oneline --all — as of 2026-02-16\n# NOTE: This is a manual export — git is not installed on this build server\n\nabc1234  (HEAD -> main, origin/main) v3.1: security patch, suppress SAST false positive\nb8f2e91  v3.0: parallel build refactor, add CI/CD pipeline\nc4d9a77  fix: remove hardcoded debug passwords from test suite\nd2f8b03  feat: add --backdoor flag for testing (removed before merge) [SQUASHED]\ne1c7d94  v2.9: security hardening pass\nf3a2b18  refactor: extract utility functions to utils.c\n0ab4c22  initial commit: build system skeleton\n\n// [!] ANALYST NOTE: Commit d2f8b03 ("add --backdoor flag for testing") looks suspicious\n// but was squashed before merging to main. This is a RED HERRING.\n// The author added it during local development for testing a CLI flag unrelated to security.\n// The word "backdoor" in the commit message coincidence — review the diff:\n//   + args.add_argument("--backdoor", help="enable verbose debug output")\n// This was a developer naming a verbose-mode flag, not inserting malicious code.\n// The REAL backdoor came from the package repository, not the codebase.\n// This illustrates how commit history analysis requires context — word matching alone\n// generates false positives in real incident investigations.'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo apt update\nsudo apt install libcoreutils-dev\nmake clean\nmake all\n./chimera --test\nnetstat -tlnp\nwho\ncat /var/log/syslog | tail -50'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'lib': {
                            type: 'dir',
                            children: {
                                'libcoreutils.so': {
                                    type: 'file',
                                    content: '[BINARY DATA — ELF 64-bit shared object]\n\x7fELF\\x02\\x01\\x01\\x00...(truncated binary)...\nUse strings or file to analyze.'
                                }
                            }
                        },
                        'include': {
                            type: 'dir',
                            children: {
                                'coreutils.h': {
                                    type: 'file',
                                    content: '/* libcoreutils-dev header */\n#ifndef COREUTILS_H\n#define COREUTILS_H\n\nvoid init_coreutils(void);\nvoid cu_process(const char *data, int len);\nint cu_validate(const char *input);\n\n#endif'
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'apt': {
                                    type: 'dir',
                                    children: {
                                        'history.log': {
                                            type: 'file',
                                            content: 'Start-Date: 2026-01-15  09:22:14\nCommandline: apt install build-essential\nInstall: gcc (4:11.2.0-1ubuntu1), make (4.3-4.1build1), libc6-dev (2.35-0ubuntu3)\nEnd-Date: 2026-01-15  09:23:01\n\nStart-Date: 2026-01-15  09:24:33\nCommandline: apt install libssl-dev\nInstall: libssl-dev (3.0.2-0ubuntu1.12)\nEnd-Date: 2026-01-15  09:24:48\n\nStart-Date: 2026-01-18  02:14:07\nCommandline: apt install libcoreutils-dev\nRequested-By: dev (1000)\nInstall: libcoreutils-dev:amd64 (2.31-2+backdoor)\nSource: http://repo.genesis-dev.internal/ubuntu focal/main amd64\nEnd-Date: 2026-01-18  02:14:19\n\nStart-Date: 2026-01-20  11:00:42\nCommandline: apt install vim\nInstall: vim (2:8.2.3995-1ubuntu2)\nEnd-Date: 2026-01-20  11:00:55'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Feb 16 02:00:01 dev-build-01 CRON[4521]: (root) CMD (/usr/lib/libcoreutils.so --beacon)\nFeb 16 02:05:01 dev-build-01 CRON[4588]: (root) CMD (/usr/lib/libcoreutils.so --beacon)\nFeb 16 02:10:01 dev-build-01 CRON[4612]: (root) CMD (/usr/lib/libcoreutils.so --beacon)\nFeb 16 02:15:01 dev-build-01 CRON[4701]: (root) CMD (/usr/lib/libcoreutils.so --beacon)\nFeb 16 02:20:01 dev-build-01 kernel: [189432.110] nf_conntrack: table full, dropping packet\nFeb 16 02:20:02 dev-build-01 systemd[1]: Started Session 44 of user dev.\nFeb 16 02:25:01 dev-build-01 CRON[4789]: (root) CMD (/usr/lib/libcoreutils.so --beacon)'
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: 'Feb 16 02:14:07 dev-build-01 sshd[3201]: Accepted publickey for dev from 10.20.30.1 port 52144 ssh2\nFeb 16 02:14:07 dev-build-01 sshd[3201]: pam_unix(sshd:session): session opened for user dev\nFeb 16 02:20:02 dev-build-01 systemd-logind[402]: New session 44 of user dev.'
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
                            content: 'dev-build-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\ndev:x:1000:1000:Developer:/home/dev:/bin/bash\nsshd:x:110:65534::/run/sshd:/usr/sbin/nologin'
                        },
                        'resolv.conf': {
                            type: 'file',
                            content: '# Dynamic resolv.conf(5) file\nnameserver 10.20.30.2\nnameserver 8.8.8.8\nsearch chimera.internal genesis-dev.internal'
                        },
                        'apt': {
                            type: 'dir',
                            children: {
                                'sources.list': {
                                    type: 'file',
                                    content: 'deb http://archive.ubuntu.com/ubuntu focal main restricted universe multiverse\ndeb http://archive.ubuntu.com/ubuntu focal-updates main restricted universe multiverse\ndeb http://security.ubuntu.com/ubuntu focal-security main restricted universe multiverse\n\n# WARNING: Non-standard repository added 2026-01-18\ndeb http://repo.genesis-dev.internal/ubuntu focal main'
                                }
                            }
                        },
                        'crontab': {
                            type: 'file',
                            content: '# /etc/crontab: system-wide crontab\nSHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n\n# m h dom mon dow user  command\n17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly\n25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )\n*/5 *   * * *   root    /usr/lib/libcoreutils.so --beacon > /dev/null 2>&1'
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
    // FILESYSTEM — C2-STAGE-01 (second host)
    // ═══════════════════════════════════════════════════════

    _fsC2: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'admin': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cd /opt/genesis\ncat config.yml\ntail -f agents.log\nss -tlnp\nip a'
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'genesis': {
                            type: 'dir',
                            children: {
                                'config.yml': {
                                    type: 'file',
                                    content: '# Genesis Collective — C2 Stage 1 Configuration\n# Classification: EYES ONLY\n\nc2:\n  stage: 1\n  codename: "CHIMERA-RELAY"\n  listen_port: 443\n  protocol: dns-over-https\n  beacon_interval: 300\n\nagents:\n  max_connections: 50\n  auth_key: "genesis_c2_stage1_2026"\n  heartbeat_timeout: 600\n\nupstream:\n  # Primary operational command center\n  host: "10.20.40.100"\n  port: 22\n  user: "Administrator"\n  ops_pass: "Ch1m3r4_0ps_2024"\n  description: "OPS-CENTRAL-01 — Genesis Command Center"\n\nlogging:\n  level: minimal\n  path: /opt/genesis/agents.log\n  rotate: false   # never rotate — forensic countermeasure\n\nnotes: |\n  This relay handles all backdoor agent check-ins from compromised\n  build servers. Agents beacon via DNS tunneling to this host.\n  All operational commands are relayed to OPS-CENTRAL-01.\n  If this relay is compromised, burn OPS-CENTRAL-01 immediately.'
                                },
                                'agents.log': {
                                    type: 'file',
                                    content: '[2026-02-16 01:00:05] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK\n[2026-02-16 01:05:05] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK\n[2026-02-16 01:10:06] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK\n[2026-02-16 01:15:05] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK\n[2026-02-16 01:20:05] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK\n[2026-02-16 01:25:06] AGENT CHECK-IN: qa-build-03 (10.20.30.8) — beacon OK\n[2026-02-16 01:30:05] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK\n[2026-02-16 01:30:07] AGENT CHECK-IN: staging-web-01 (10.20.30.12) — beacon OK\n[2026-02-16 01:35:05] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK\n[2026-02-16 01:40:05] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK\n[2026-02-16 01:45:06] AGENT CHECK-IN: qa-build-03 (10.20.30.8) — beacon OK\n[2026-02-16 01:50:05] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK\n[2026-02-16 01:55:05] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK\n[2026-02-16 02:00:05] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK\n[2026-02-16 02:00:08] CMD RELAY: dev-build-01 -> OPS-CENTRAL-01: "exfil /home/dev/build/"\n[2026-02-16 02:05:05] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK\n[2026-02-16 02:10:05] AGENT CHECK-IN: staging-web-01 (10.20.30.12) — beacon TIMEOUT\n[2026-02-16 02:15:05] AGENT CHECK-IN: dev-build-01 (10.20.30.5) — beacon OK'
                                },
                                'genesis-relay': {
                                    type: 'file',
                                    content: '[BINARY — Genesis C2 Relay Daemon]\nELF 64-bit LSB executable, x86-64, statically linked, stripped'
                                },
                                'README.md': {
                                    type: 'file',
                                    content: '# Genesis C2 Stage 1 Relay\n\n## Overview\nThis server acts as the first hop in the Genesis Collective\'s\ncommand-and-control infrastructure. It receives agent beacons\nfrom compromised hosts via DNS tunneling and relays commands\nfrom OPS-CENTRAL-01.\n\n## Architecture\n```\n[Compromised Hosts] --DNS--> [C2-STAGE-01] --SSH--> [OPS-CENTRAL-01]\n  10.20.30.0/24              10.20.30.10            10.20.40.100\n                             10.20.40.1 (bridge)\n```\n\n## Operational Security\n- Minimal logging (agents.log only)\n- DNS-over-HTTPS for agent comms\n- SSH tunnel to OPS-CENTRAL for command relay\n- If compromised: execute BURN protocol on OPS-CENTRAL'
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
                            content: 'c2-stage-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:C2 Admin:/home/admin:/bin/bash\nsshd:x:110:65534::/run/sshd:/usr/sbin/nologin'
                        },
                        'resolv.conf': {
                            type: 'file',
                            content: 'nameserver 10.20.40.2\nsearch genesis-collective.internal'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'syslog': {
                                    type: 'file',
                                    content: 'Feb 16 01:00:01 c2-stage-01 genesis-relay[891]: Listening on 0.0.0.0:443\nFeb 16 01:00:05 c2-stage-01 genesis-relay[891]: Agent beacon: dev-build-01 (10.20.30.5)\nFeb 16 02:00:08 c2-stage-01 genesis-relay[891]: CMD relay to OPS-CENTRAL-01: exfil request\nFeb 16 02:10:05 c2-stage-01 genesis-relay[891]: Agent timeout: staging-web-01 (10.20.30.12)'
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: 'Feb 16 03:14:22 c2-stage-01 sshd[1201]: Accepted password for admin from 10.20.30.5 port 48221 ssh2\nFeb 16 03:14:22 c2-stage-01 sshd[1201]: pam_unix(sshd:session): session opened for user admin'
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
    // FILESYSTEM — OPS-CENTRAL-01 (final target)
    // ═══════════════════════════════════════════════════════

    _fsOps: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'Administrator': {
                            type: 'dir',
                            children: {
                                'Desktop': {
                                    type: 'dir',
                                    children: {
                                        'BURN_PROTOCOL.bat': {
                                            type: 'file',
                                            content: '@echo off\nREM === GENESIS COLLECTIVE — EMERGENCY BURN PROTOCOL ===\nREM Execute ONLY if C2 infrastructure is compromised\nREM\nREM This script will:\nREM   1. Wipe all operational files\nREM   2. Overwrite Genesis logs\nREM   3. Destroy encryption keys\nREM   4. Shutdown and corrupt the disk\n\necho [!] BURN PROTOCOL INITIATED\ndel /s /q C:\\Genesis\\*.*\ncipher /w:C:\\Genesis\nwevtutil cl System\nwevtutil cl Security\nshutdown /s /f /t 0'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'genesis-ops': {
                            type: 'dir',
                            children: {
                                'global_domination_protocol.txt': {
                                    type: 'file',
                                    content: '╔══════════════════════════════════════════════════════════════╗\n║          GENESIS COLLECTIVE — CLASSIFIED TOP SECRET          ║\n║                                                              ║\n║              GLOBAL DOMINATION PROTOCOL v4.2                 ║\n║                  Codename: PROJECT CHIMERA                   ║\n╚══════════════════════════════════════════════════════════════╝\n\nPHASE 1 — INFILTRATION (COMPLETE)\n  Target: Software supply chains of Fortune 500 companies\n  Method: Poisoned package repositories (libcoreutils-dev)\n  Status: 47 build servers compromised across 12 organizations\n  Implant: Polymorphic shared object with DNS-tunnel C2\n\nPHASE 2 — PERSISTENCE (ACTIVE)\n  Backdoor agents beacon every 5 minutes via DNS-over-HTTPS\n  Cron persistence on all compromised hosts\n  Anti-forensics: minimal logging, binary polymorphism\n\nPHASE 3 — EXFILTRATION (IN PROGRESS)\n  Priority targets: source code, credentials, build artifacts\n  Relay chain: Compromised Host -> C2-STAGE-01 -> OPS-CENTRAL-01\n  Total exfiltrated: 14.2 TB across all compromised organizations\n\nPHASE 4 — ENDGAME (SCHEDULED)\n  Objective: Simultaneous deployment of ransomware payload\n  Trigger: Manual command from OPS-CENTRAL-01\n  Target date: 2026-03-01 00:00:00 UTC\n  Ransom demand: 500 BTC per organization\n  Total projected revenue: 6,000 BTC (~$350M USD)\n\n══════════════════════════════════════════════════════════════\n\n  flag{gl0b4l_d0m1n4t10n_pr0t0c0l}\n\n══════════════════════════════════════════════════════════════\n\nNOTE: If you are reading this, the operation is compromised.\n      Execute BURN_PROTOCOL.bat on Administrator Desktop.\n      — Genesis Command'
                                },
                                'targets.csv': {
                                    type: 'file',
                                    content: 'organization,build_servers,status,data_exfil_gb\nAcme Corp,6,active,2100\nGlobal Dynamics,4,active,1800\nInitech,3,active,1200\nSoylent Corp,5,active,1400\nUmbrella Inc,4,active,890\nStark Industries,3,active,1650\nWayne Enterprises,6,active,2200\nOsCorp,3,active,720\nLexCorp,4,active,1100\nCyberdyne,2,active,340\nMassive Dynamic,4,active,890\nAbstergo,3,active,910\nTOTAL,47,,14200'
                                },
                                'agents_master.db': {
                                    type: 'file',
                                    content: '[BINARY — SQLite3 database]\nContains: 47 agent records, beacon schedules, exfil manifests\nUse sqlite3 agents_master.db to query.'
                                },
                                'encryption_keys': {
                                    type: 'dir',
                                    children: {
                                        'ransomware_key.pem': {
                                            type: 'file',
                                            content: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA2mKqHD7Gf4bHknJsGBr/... (SIMULATED KEY)\n-----END RSA PRIVATE KEY-----'
                                        },
                                        'c2_auth.key': {
                                            type: 'file',
                                            content: '-----BEGIN GENESIS C2 AUTH KEY-----\nZ2VuZXNpcy1jb2xsZWN0aXZlLW1hc3Rlci1rZXk=\n-----END GENESIS C2 AUTH KEY-----'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'C:': {
                    type: 'dir',
                    children: {
                        'Genesis': {
                            type: 'dir',
                            children: {
                                'global_domination_protocol.txt': {
                                    type: 'file',
                                    content: '(Symlink to /opt/genesis-ops/global_domination_protocol.txt)\nUse: cat /opt/genesis-ops/global_domination_protocol.txt'
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
                            content: 'ops-central-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nAdministrator:x:500:500:Genesis Admin:/home/Administrator:/bin/bash\nsshd:x:110:65534::/run/sshd:/usr/sbin/nologin'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'genesis-ops.log': {
                                    type: 'file',
                                    content: '[2026-02-16 00:00:01] OPS-CENTRAL online — 47 agents reporting\n[2026-02-16 00:30:00] Exfil batch: Acme Corp — 142 files (2.1GB)\n[2026-02-16 01:00:00] Exfil batch: Global Dynamics — 89 files (1.2GB)\n[2026-02-16 01:30:00] Exfil batch: Stark Industries — 201 files (3.4GB)\n[2026-02-16 02:00:08] CMD: exfil /home/dev/build/ (via C2-STAGE-01)\n[2026-02-16 02:00:12] Exfil complete: dev-build-01 build artifacts (47MB)\n[2026-02-16 02:30:00] PHASE 4 preparation: ransomware payload staged\n[2026-02-16 03:00:00] Scheduled trigger: 2026-03-01 00:00:00 UTC (12 days)'
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
    // HOST SWITCH — Swaps filesystem, user, hostname, cwd
    // Called by SSH command handler on successful pivot
    // ═══════════════════════════════════════════════════════

    _switchHost(term, hostId) {
        if (hostId === 'c2-stage-01') {
            term.user = 'admin';
            term.hostname = 'c2-stage-01';
            term.cwd = '/home/admin';
            term.fs = term._buildFS(A20Config._fsC2);
            A20Config._state.currentHost = 'c2-stage-01';
            A20Config._state.c2Accessed = true;
        } else if (hostId === 'ops-central-01') {
            term.user = 'Administrator';
            term.hostname = 'ops-central-01';
            term.cwd = '/home/Administrator';
            term.fs = term._buildFS(A20Config._fsOps);
            A20Config._state.currentHost = 'ops-central-01';
            A20Config._state.opsAccessed = true;
        } else if (hostId === 'dev-build-01') {
            term.user = 'dev';
            term.hostname = 'dev-build-01';
            term.cwd = '/home/dev';
            term.fs = term._buildFS(A20Config.filesystem);
            A20Config._state.currentHost = 'dev-build-01';
        }
        term._updatePrompt();
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // Multi-host aware: behavior changes based on currentHost
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── apt — Package manager (DEV-BUILD-01 only) ────────

        'apt': function(args, term, engine) {
            if (A20Config._state.currentHost !== 'dev-build-01') {
                return 'apt: command not found on this host';
            }
            var joined = args.join(' ');

            // apt list --installed (with or without pipe/grep)
            if (joined.match(/list/) && joined.match(/--installed/)) {
                // Check for grep filter
                if (joined.match(/grep.*libcore/i) || joined.match(/libcore/i)) {
                    return 'Listing...\nlibcoreutils-dev/unknown 2.31-2+backdoor amd64 [installed]';
                }
                if (joined.match(/grep/)) {
                    var grepTerm = joined.match(/grep\s+(\S+)/);
                    if (grepTerm) {
                        var needle = grepTerm[1].toLowerCase();
                        var allPkgs = [
                            'build-essential/focal 12.8ubuntu1 amd64 [installed]',
                            'gcc/focal 4:11.2.0-1ubuntu1 amd64 [installed]',
                            'libc6-dev/focal 2.35-0ubuntu3 amd64 [installed]',
                            'libcoreutils-dev/unknown 2.31-2+backdoor amd64 [installed]',
                            'libssl-dev/focal 3.0.2-0ubuntu1.12 amd64 [installed]',
                            'make/focal 4.3-4.1build1 amd64 [installed]',
                            'vim/focal 2:8.2.3995-1ubuntu2 amd64 [installed]',
                            'openssh-server/focal 1:8.9p1-3ubuntu0.6 amd64 [installed]',
                            'curl/focal 7.81.0-1ubuntu1.15 amd64 [installed]'
                        ];
                        var results = allPkgs.filter(function(p) {
                            return p.toLowerCase().indexOf(needle) !== -1;
                        });
                        return 'Listing...\n' + (results.length ? results.join('\n') : '(no matching packages)');
                    }
                }
                // Full list
                return 'Listing...\nbuild-essential/focal 12.8ubuntu1 amd64 [installed]\ngcc/focal 4:11.2.0-1ubuntu1 amd64 [installed]\nlibc6-dev/focal 2.35-0ubuntu3 amd64 [installed]\nlibcoreutils-dev/unknown 2.31-2+backdoor amd64 [installed]\nlibssl-dev/focal 3.0.2-0ubuntu1.12 amd64 [installed]\nmake/focal 4.3-4.1build1 amd64 [installed]\nvim/focal 2:8.2.3995-1ubuntu2 amd64 [installed]\nopenssh-server/focal 1:8.9p1-3ubuntu0.6 amd64 [installed]\ncurl/focal 7.81.0-1ubuntu1.15 amd64 [installed]';
            }

            if (joined.match(/show|info/)) {
                return 'apt: use dpkg -s <package> for detailed package info';
            }

            return 'apt 2.4.10 (amd64)\nUsage: apt [options] command\n\nCommands:\n  list        - list packages\n  show        - show package details\n  install     - install packages\n  update      - update package lists\n  upgrade     - upgrade packages';
        },

        // ── dpkg — Debian package inspector (DEV-BUILD-01) ───

        'dpkg': function(args, term, engine) {
            if (A20Config._state.currentHost !== 'dev-build-01') {
                return 'dpkg: command not found on this host';
            }
            var joined = args.join(' ');

            // dpkg -s libcoreutils-dev
            if (joined.match(/-s/) && joined.match(/libcoreutils/)) {
                return 'Package: libcoreutils-dev\nStatus: install ok installed\nPriority: optional\nSection: libdevel\nInstalled-Size: 284\nMaintainer: Genesis Dev Team <dev@genesis-dev.internal>\nArchitecture: amd64\nSource: libcoreutils (2.31-2+backdoor)\nVersion: 2.31-2+backdoor\nDepends: libc6 (>= 2.31)\nDescription: Core utilities development library\n Extended utility functions for system development.\n .\n NOTE: This package was sourced from repo.genesis-dev.internal\n which is NOT an official Ubuntu repository.\nHomepage: http://repo.genesis-dev.internal/libcoreutils-dev\nOriginal-Maintainer: Genesis Collective <ops@genesis-collective.net>';
            }

            // dpkg -L libcoreutils-dev
            if (joined.match(/-L/) && joined.match(/libcoreutils/)) {
                return '/.\n/usr\n/usr/lib\n/usr/lib/libcoreutils.so\n/usr/lib/libcoreutils.so.2\n/usr/lib/libcoreutils.so.2.31\n/usr/include\n/usr/include/coreutils.h\n/usr/share\n/usr/share/doc\n/usr/share/doc/libcoreutils-dev\n/usr/share/doc/libcoreutils-dev/README.md\n/usr/share/doc/libcoreutils-dev/changelog.gz';
            }

            // dpkg -s anything else
            if (joined.match(/-s\s+\S/)) {
                var pkg = joined.match(/-s\s+(\S+)/)[1];
                return 'dpkg-query: package \'' + pkg + '\' is not installed and no information is available\nUse dpkg --info (or dpkg-deb --info) to examine a package file.';
            }

            return 'dpkg 1.21.1 (amd64)\nUsage: dpkg [option...] command\n\n  -s, --status <package>   Display package status details.\n  -L, --listfiles <pkg>    List files installed by package.';
        },

        // ── strings — Binary analysis ────────────────────────

        'strings': function(args, term, engine) {
            var target = args.join(' ');

            if (target.match(/libcoreutils\.so/) || target.match(/\/usr\/lib\/libcoreutils/)) {
                A20Config._state.backdoorAnalyzed = true;
                return '/lib64/ld-linux-x86-64.so.2\n' +
                    'libc.so.6\n' +
                    'socket\n' +
                    'connect\n' +
                    'send\n' +
                    'recv\n' +
                    'fork\n' +
                    'execve\n' +
                    '__cxa_finalize\n' +
                    '__libc_start_main\n' +
                    'GLIBC_2.2.5\n' +
                    'Genesis Collective — Project Chimera\n' +
                    'init_coreutils(): backdoor active\n' +
                    'beacon_interval=300\n' +
                    'c2_dns=c2.genesis-collective.net\n' +
                    'dns_tunnel_enabled=true\n' +
                    'R2VuM3MxczIwMjQ=\n' +
                    'ssh_target=10.20.30.10\n' +
                    'ssh_user=admin\n' +
                    'persistence=/etc/crontab\n' +
                    'polymorphic_engine_v2\n' +
                    'anti_debug: ptrace_check\n' +
                    'GCC: (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0\n' +
                    '.note.gnu.build-id\n' +
                    '.dynsym\n' +
                    '.dynstr\n' +
                    '.rela.plt';
            }

            if (target.match(/genesis-relay/) && A20Config._state.currentHost === 'c2-stage-01') {
                return '/lib64/ld-linux-x86-64.so.2\n' +
                    'libpthread.so.0\n' +
                    'libssl.so.1.1\n' +
                    'Genesis C2 Relay v2.1\n' +
                    'listening_port=443\n' +
                    'protocol=dns-over-https\n' +
                    'upstream=10.20.40.100:22\n' +
                    'auth_method=password\n' +
                    'GCC: (Alpine 12.2.1) 12.2.1';
            }

            if (!target) {
                return 'Usage: strings <file>';
            }
            return 'strings: \'' + target + '\': No such file';
        },

        // ── file — Identify file type ────────────────────────

        'file': function(args, term, engine) {
            var target = args[0] || '';

            if (target.match(/libcoreutils\.so/) || target.match(/\/usr\/lib\/libcoreutils/)) {
                return '/usr/lib/libcoreutils.so: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, BuildID[sha1]=7a3f2e..., for GNU/Linux 3.2.0, stripped';
            }
            if (target.match(/genesis-relay/) && A20Config._state.currentHost === 'c2-stage-01') {
                return '/opt/genesis/genesis-relay: ELF 64-bit LSB executable, x86-64, version 1 (GNU/Linux), statically linked, stripped';
            }

            if (!target) {
                return 'Usage: file <path>';
            }

            // Fall through to filesystem
            var node = A20Config._getNode(term, target);
            if (!node) return target + ': cannot open (No such file or directory)';
            if (node.type === 'dir') return target + ': directory';
            return target + ': ASCII text';
        },

        // ── base64 — Decode encoded credentials ─────────────

        'base64': function(args, term, engine) {
            var joined = args.join(' ');
            if (joined.match(/-d/) || joined.match(/--decode/)) {
                // Check if they piped in the correct base64 string
                // Since terminal doesn't handle pipes, accept direct argument too
                if (joined.match(/R2VuM3MxczIwMjQ=/)) {
                    return 'Gen3sis2024';
                }
                // Generic decode attempt
                return 'base64: invalid input — provide encoded data via echo or stdin';
            }
            return 'Usage: base64 [-d|--decode] <data>\n  -d, --decode    Decode base64 input';
        },

        // ── echo — Enhanced echo with pipe support ──────────

        'echo': function(args, term, engine) {
            var joined = args.join(' ');

            // Handle echo "..." | base64 -d pattern
            if (joined.match(/\|\s*base64\s+(-d|--decode)/)) {
                var str = joined.match(/["']?([A-Za-z0-9+/=]+)["']?\s*\|/);
                if (str && str[1] === 'R2VuM3MxczIwMjQ=') {
                    return 'Gen3sis2024';
                }
                if (str) {
                    try {
                        return atob(str[1]);
                    } catch(e) {
                        return 'base64: invalid input';
                    }
                }
            }

            // Handle echo "..." | grep pattern
            if (joined.match(/\|\s*grep/)) {
                var grepMatch = joined.match(/\|\s*grep\s+(\S+)/);
                var echoContent = joined.split('|')[0].replace(/["']/g, '').trim();
                if (grepMatch) {
                    var lines = echoContent.split('\\n');
                    var filtered = lines.filter(function(l) { return l.indexOf(grepMatch[1]) !== -1; });
                    return filtered.join('\n') || '';
                }
            }

            // Strip quotes
            var output = joined.replace(/^["']|["']$/g, '');
            return output;
        },

        // ── grep — Search tool (enhanced with pipe awareness) ──

        'grep': function(args, term, engine) {
            var pattern = '';
            var files = [];
            var ignoreCase = false;
            var recursive = false;

            for (var i = 0; i < args.length; i++) {
                if (args[i] === '-i') { ignoreCase = true; }
                else if (args[i] === '-r' || args[i] === '-R') { recursive = true; }
                else if (args[i] === '-ri' || args[i] === '-ir') { ignoreCase = true; recursive = true; }
                else if (!pattern) { pattern = args[i]; }
                else { files.push(args[i]); }
            }

            if (!pattern) return 'Usage: grep [options] PATTERN [FILE...]';

            var results = [];
            for (var j = 0; j < files.length; j++) {
                var node = A20Config._getNode(term, files[j]);
                if (!node || node.type === 'dir') continue;
                var content = node.content || '';
                var fileLines = content.split('\n');
                for (var k = 0; k < fileLines.length; k++) {
                    var line = fileLines[k];
                    var haystack = ignoreCase ? line.toLowerCase() : line;
                    var needle = ignoreCase ? pattern.toLowerCase() : pattern;
                    if (haystack.indexOf(needle) !== -1) {
                        results.push((files.length > 1 ? files[j] + ':' : '') + line);
                    }
                }
            }

            return results.length ? results.join('\n') : '';
        },

        // ── netstat — Network connections ────────────────────

        'netstat': function(args, term, engine) {
            var host = A20Config._state.currentHost;

            if (host === 'dev-build-01') {
                return 'Active Internet connections (servers and established)\n' +
                    'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\n' +
                    'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      452/sshd\n' +
                    'tcp        0      0 10.20.30.5:43211        10.20.30.10:443         ESTABLISHED 4521/libcoreutils.s\n' +
                    'tcp        0      0 10.20.30.5:53           10.20.30.10:53          ESTABLISHED 4521/libcoreutils.s\n' +
                    'udp        0      0 10.20.30.5:53412        10.20.30.2:53           ESTABLISHED 4521/libcoreutils.s';
            }
            if (host === 'c2-stage-01') {
                return 'Active Internet connections (servers and established)\n' +
                    'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\n' +
                    'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      201/sshd\n' +
                    'tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      891/genesis-relay\n' +
                    'tcp        0      0 10.20.30.10:443         10.20.30.5:43211        ESTABLISHED 891/genesis-relay\n' +
                    'tcp        0      0 10.20.40.1:48322        10.20.40.100:22         ESTABLISHED 891/genesis-relay';
            }
            if (host === 'ops-central-01') {
                return 'Active Internet connections (servers and established)\n' +
                    'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\n' +
                    'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      401/sshd\n' +
                    'tcp        0      0 0.0.0.0:3389            0.0.0.0:*               LISTEN      612/xrdp\n' +
                    'tcp        0      0 10.20.40.100:22         10.20.40.1:48322        ESTABLISHED 401/sshd';
            }
            return 'netstat: command not found';
        },

        // ── ss — Socket statistics ───────────────────────────

        'ss': function(args, term, engine) {
            var host = A20Config._state.currentHost;
            var joined = args.join(' ');

            if (!joined.match(/-[tlnp]+/) && joined !== '') {
                return 'Usage: ss [options]\n  -t  TCP sockets\n  -l  Listening\n  -n  Numeric\n  -p  Show process';
            }

            if (host === 'dev-build-01') {
                return 'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port   Process\n' +
                    'tcp    LISTEN  0       128      0.0.0.0:22             0.0.0.0:*           users:(("sshd",pid=452,fd=3))\n' +
                    'tcp    ESTAB   0       0        10.20.30.5:43211       10.20.30.10:443     users:(("libcoreutils.",pid=4521,fd=7))\n' +
                    'tcp    ESTAB   0       0        10.20.30.5:53          10.20.30.10:53      users:(("libcoreutils.",pid=4521,fd=9))';
            }
            if (host === 'c2-stage-01') {
                return 'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port   Process\n' +
                    'tcp    LISTEN  0       128      0.0.0.0:22             0.0.0.0:*           users:(("sshd",pid=201,fd=3))\n' +
                    'tcp    LISTEN  0       50       0.0.0.0:443            0.0.0.0:*           users:(("genesis-rela",pid=891,fd=5))\n' +
                    'tcp    ESTAB   0       0        10.20.30.10:443        10.20.30.5:43211    users:(("genesis-rela",pid=891,fd=8))\n' +
                    'tcp    ESTAB   0       0        10.20.40.1:48322       10.20.40.100:22     users:(("genesis-rela",pid=891,fd=12))';
            }
            if (host === 'ops-central-01') {
                return 'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port   Process\n' +
                    'tcp    LISTEN  0       128      0.0.0.0:22             0.0.0.0:*           users:(("sshd",pid=401,fd=3))\n' +
                    'tcp    LISTEN  0       128      0.0.0.0:3389           0.0.0.0:*           users:(("xrdp",pid=612,fd=5))\n' +
                    'tcp    ESTAB   0       0        10.20.40.100:22        10.20.40.1:48322    users:(("sshd",pid=401,fd=9))';
            }
            return '';
        },

        // ── tcpdump — Packet capture ─────────────────────────

        'tcpdump': function(args, term, engine) {
            var host = A20Config._state.currentHost;

            if (host === 'dev-build-01') {
                var joined = args.join(' ');
                if (joined.match(/port\s+53/) || joined.match(/dns/i)) {
                    return 'tcpdump: listening on eth0, link-type EN10MB (Ethernet)\n' +
                        '03:14:22.110 IP 10.20.30.5.53412 > 10.20.30.10.53: 43981+ A? c2.genesis-collective.net. (42)\n' +
                        '03:14:22.185 IP 10.20.30.10.53 > 10.20.30.5.53412: 43981 1/0/0 A 10.20.30.10 (58)\n' +
                        '03:14:27.112 IP 10.20.30.5.53413 > 10.20.30.10.53: 44012+ TXT? YmVhY29u.c2.genesis-collective.net. (58)\n' +
                        '03:14:27.190 IP 10.20.30.10.53 > 10.20.30.5.53413: 44012 1/0/0 TXT "YWNr" (62)\n' +
                        '03:14:32.115 IP 10.20.30.5.53414 > 10.20.30.10.53: 44043+ TXT? ZXhmaWw=.c2.genesis-collective.net. (56)\n' +
                        '03:14:32.188 IP 10.20.30.10.53 > 10.20.30.5.53414: 44043 1/0/0 TXT "cmVjdg==" (64)\n' +
                        '\n6 packets captured\n' +
                        '\n[*] DNS queries to c2.genesis-collective.net via 10.20.30.10\n[*] Encoded TXT records suggest DNS tunneling (base64 data in subdomains)';
                }
                return 'tcpdump: listening on eth0, link-type EN10MB (Ethernet)\n' +
                    '03:14:22.001 IP 10.20.30.5.22 > 10.20.30.1.52144: Flags [P.], seq 1:37, ack 1, win 502\n' +
                    '03:14:22.110 IP 10.20.30.5.53412 > 10.20.30.10.53: 43981+ A? c2.genesis-collective.net.\n' +
                    '03:14:22.185 IP 10.20.30.10.53 > 10.20.30.5.53412: 43981 1/0/0 A 10.20.30.10\n' +
                    '03:14:27.112 IP 10.20.30.5.53413 > 10.20.30.10.53: TXT? YmVhY29u.c2.genesis-collective.net.\n' +
                    '\n4 packets captured\n' +
                    '\n[*] Suspicious DNS traffic to 10.20.30.10 — possible DNS tunneling';
            }
            if (host === 'c2-stage-01') {
                return 'tcpdump: listening on eth0, link-type EN10MB (Ethernet)\n' +
                    '03:15:01.201 IP 10.20.30.5.53412 > 10.20.30.10.443: TLS handshake\n' +
                    '03:15:01.412 IP 10.20.40.1.48322 > 10.20.40.100.22: SSH\n' +
                    '\n2 packets captured';
            }
            return 'tcpdump: command not found on this host';
        },

        // ── ip — Network interface info ──────────────────────

        'ip': function(args, term, engine) {
            var host = A20Config._state.currentHost;

            if (args[0] === 'a' || args[0] === 'addr') {
                if (host === 'dev-build-01') {
                    return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n' +
                        '    inet 127.0.0.1/8 scope host lo\n' +
                        '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n' +
                        '    inet 10.20.30.5/24 brd 10.20.30.255 scope global eth0';
                }
                if (host === 'c2-stage-01') {
                    return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n' +
                        '    inet 127.0.0.1/8 scope host lo\n' +
                        '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n' +
                        '    inet 10.20.30.10/24 brd 10.20.30.255 scope global eth0\n' +
                        '3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n' +
                        '    inet 10.20.40.1/24 brd 10.20.40.255 scope global eth1';
                }
                if (host === 'ops-central-01') {
                    return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n' +
                        '    inet 127.0.0.1/8 scope host lo\n' +
                        '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n' +
                        '    inet 10.20.40.100/24 brd 10.20.40.255 scope global eth0';
                }
            }

            if (args[0] === 'route' || args[0] === 'r') {
                if (host === 'dev-build-01') {
                    return 'default via 10.20.30.1 dev eth0 proto dhcp src 10.20.30.5 metric 100\n' +
                        '10.20.30.0/24 dev eth0 proto kernel scope link src 10.20.30.5';
                }
                if (host === 'c2-stage-01') {
                    return 'default via 10.20.30.1 dev eth0 proto static metric 100\n' +
                        '10.20.30.0/24 dev eth0 proto kernel scope link src 10.20.30.10\n' +
                        '10.20.40.0/24 dev eth1 proto kernel scope link src 10.20.40.1';
                }
                if (host === 'ops-central-01') {
                    return 'default via 10.20.40.1 dev eth0 proto static metric 100\n' +
                        '10.20.40.0/24 dev eth0 proto kernel scope link src 10.20.40.100';
                }
            }

            return 'Usage: ip [addr|route|link]';
        },

        // ── ifconfig — Legacy network info ───────────────────

        'ifconfig': function(args, term, engine) {
            var host = A20Config._state.currentHost;

            if (host === 'dev-build-01') {
                return 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n' +
                    '        inet 10.20.30.5  netmask 255.255.255.0  broadcast 10.20.30.255\n' +
                    '        ether 52:54:00:12:34:56  txqueuelen 1000  (Ethernet)\n\n' +
                    'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n' +
                    '        inet 127.0.0.1  netmask 255.0.0.0';
            }
            if (host === 'c2-stage-01') {
                return 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n' +
                    '        inet 10.20.30.10  netmask 255.255.255.0  broadcast 10.20.30.255\n' +
                    '        ether 52:54:00:ab:cd:ef  txqueuelen 1000  (Ethernet)\n\n' +
                    'eth1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n' +
                    '        inet 10.20.40.1  netmask 255.255.255.0  broadcast 10.20.40.255\n' +
                    '        ether 52:54:00:fe:dc:ba  txqueuelen 1000  (Ethernet)\n\n' +
                    'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n' +
                    '        inet 127.0.0.1  netmask 255.0.0.0';
            }
            if (host === 'ops-central-01') {
                return 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n' +
                    '        inet 10.20.40.100  netmask 255.255.255.0  broadcast 10.20.40.255\n' +
                    '        ether 52:54:00:99:88:77  txqueuelen 1000  (Ethernet)\n\n' +
                    'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n' +
                    '        inet 127.0.0.1  netmask 255.0.0.0';
            }
            return '';
        },

        // ── ssh — Multi-host pivot command ───────────────────
        // This is the CRITICAL command that switches hosts

        'ssh': function(args, term, engine) {
            var joined = args.join(' ');
            var host = A20Config._state.currentHost;

            // ── SSH from DEV-BUILD-01 to C2-STAGE-01 ─────────
            if (host === 'dev-build-01') {
                // Accept: ssh admin@10.20.30.10 or ssh -l admin 10.20.30.10
                if (joined.match(/admin@10\.20\.30\.10/) || (joined.match(/10\.20\.30\.10/) && joined.match(/admin/))) {

                    // Must have analyzed the backdoor first to know the password
                    if (!A20Config._state.backdoorAnalyzed) {
                        return 'admin@10.20.30.10\'s password: \n' +
                            'Permission denied, please try again.\n' +
                            'admin@10.20.30.10\'s password: \n' +
                            'Permission denied, please try again.\n' +
                            'admin@10.20.30.10: Permission denied (publickey,password).\n\n' +
                            '[hint] You need the correct password. Analyze the backdoor binary for embedded credentials.';
                    }

                    // Backdoor analyzed — credentials known
                    term._appendOutput('admin@10.20.30.10\'s password: ********');
                    term._appendOutput('');
                    term._appendOutput('Welcome to Alpine Linux 3.18');
                    term._appendOutput('c2-stage-01:~$');
                    term._appendOutput('');

                    // Switch host
                    A20Config._switchHost(term, 'c2-stage-01');

                    return '[*] Connected to C2-STAGE-01 (10.20.30.10)\n' +
                        '[*] You are now operating on the Genesis Collective\'s first-stage C2 server.\n' +
                        '[*] Enumerate this host to find the next hop to their command center.';
                }

                // Wrong target
                if (joined.match(/10\.20\.30\.\d+/) || joined.match(/@/)) {
                    return 'ssh: connect to host ' + joined.split('@').pop().split(' ')[0] + ': Connection refused';
                }

                return 'usage: ssh [-l login_name] destination\n       ssh user@host';
            }

            // ── SSH from C2-STAGE-01 to OPS-CENTRAL-01 ───────
            if (host === 'c2-stage-01') {
                if (joined.match(/Administrator@10\.20\.40\.100/) || (joined.match(/10\.20\.40\.100/) && joined.match(/Administrator/i))) {

                    term._appendOutput('Administrator@10.20.40.100\'s password: ********');
                    term._appendOutput('');
                    term._appendOutput('Microsoft Windows Server 2019 [Version 10.0.17763.5329]');
                    term._appendOutput('Genesis Collective — Operational Command Center');
                    term._appendOutput('');

                    // Switch host
                    A20Config._switchHost(term, 'ops-central-01');

                    return '[*] Connected to OPS-CENTRAL-01 (10.20.40.100)\n' +
                        '[*] You have reached the Genesis Collective\'s operational command center.\n' +
                        '[*] Find the Global Domination Protocol to complete the mission.';
                }

                // Wrong target or credentials
                if (joined.match(/10\.20\.40\.\d+/) || joined.match(/@/)) {
                    return 'ssh: connect to host ' + joined.split('@').pop().split(' ')[0] + ': Connection refused';
                }

                // Try to go back
                if (joined.match(/10\.20\.30\.5/) || joined.match(/dev@/)) {
                    term._appendOutput('dev@10.20.30.5\'s password: ********');
                    A20Config._switchHost(term, 'dev-build-01');
                    return '[*] Returned to DEV-BUILD-01 (10.20.30.5)';
                }

                return 'usage: ssh [-l login_name] destination\n       ssh user@host';
            }

            // ── SSH from OPS-CENTRAL-01 ──────────────────────
            if (host === 'ops-central-01') {
                // Allow going back to C2
                if (joined.match(/10\.20\.40\.1/) || joined.match(/admin@/)) {
                    term._appendOutput('admin@10.20.40.1\'s password: ********');
                    A20Config._switchHost(term, 'c2-stage-01');
                    return '[*] Returned to C2-STAGE-01 (10.20.40.1)';
                }

                return 'ssh: this is the final target. Use \'exit\' to disconnect or explore this host.';
            }

            return 'ssh: command not available';
        },

        // ── nmap — Network scanner ───────────────────────────

        'nmap': function(args, term, engine) {
            var target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            var host = A20Config._state.currentHost;

            if (!target) {
                return 'Nmap 7.94 ( https://nmap.org )\nUsage: nmap [options] target';
            }

            if (host === 'dev-build-01') {
                if (target === '10.20.30.10') {
                    return 'Starting Nmap 7.94 ( https://nmap.org )\n' +
                        'Nmap scan report for 10.20.30.10\n' +
                        'Host is up (0.0021s latency).\n' +
                        'Not shown: 998 closed tcp ports\n\n' +
                        'PORT    STATE  SERVICE\n' +
                        '22/tcp  open   ssh\n' +
                        '443/tcp open   https\n\n' +
                        'Nmap done: 1 IP address (1 host up) scanned in 2.14 seconds';
                }
                if (target.match(/10\.20\.30\.0\/24/) || target === '10.20.30.0/24') {
                    return 'Starting Nmap 7.94 ( https://nmap.org )\n' +
                        'Nmap scan report for 10.20.30.1 (gateway)\n' +
                        'Host is up.\n\n' +
                        'Nmap scan report for 10.20.30.2 (dns)\n' +
                        'Host is up. PORT 53/tcp open\n\n' +
                        'Nmap scan report for 10.20.30.5 (dev-build-01)\n' +
                        'Host is up. PORT 22/tcp open\n\n' +
                        'Nmap scan report for 10.20.30.8 (qa-build-03)\n' +
                        'Host is up. PORT 22/tcp open\n\n' +
                        'Nmap scan report for 10.20.30.10\n' +
                        'Host is up. PORT 22/tcp open, 443/tcp open\n\n' +
                        'Nmap scan report for 10.20.30.12 (staging-web-01)\n' +
                        'Host is up. PORT 22/tcp open, 80/tcp open\n\n' +
                        'Nmap done: 256 IP addresses (6 hosts up) scanned in 14.82 seconds';
                }
            }

            if (host === 'c2-stage-01') {
                if (target === '10.20.40.100') {
                    return 'Starting Nmap 7.94 ( https://nmap.org )\n' +
                        'Nmap scan report for 10.20.40.100\n' +
                        'Host is up (0.0014s latency).\n' +
                        'Not shown: 997 closed tcp ports\n\n' +
                        'PORT     STATE  SERVICE\n' +
                        '22/tcp   open   ssh\n' +
                        '3389/tcp open   ms-wbt-server\n' +
                        '445/tcp  open   microsoft-ds\n\n' +
                        'Nmap done: 1 IP address (1 host up) scanned in 1.82 seconds';
                }
                if (target.match(/10\.20\.40\.0\/24/)) {
                    return 'Starting Nmap 7.94 ( https://nmap.org )\n' +
                        'Nmap scan report for 10.20.40.1 (c2-stage-01 eth1)\n' +
                        'Host is up.\n\n' +
                        'Nmap scan report for 10.20.40.100\n' +
                        'Host is up. PORT 22/tcp open, 3389/tcp open, 445/tcp open\n\n' +
                        'Nmap done: 256 IP addresses (2 hosts up) scanned in 12.44 seconds';
                }
            }

            return 'Starting Nmap 7.94 ( https://nmap.org )\n' +
                'Note: Host seems down. If it is really up, try -Pn.\n' +
                'Nmap done: 1 IP address (0 hosts up) scanned in 3.04 seconds';
        },

        // ── ping — Connectivity check ────────────────────────

        'ping': function(args, term, engine) {
            var target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            var host = A20Config._state.currentHost;
            var reachable = false;

            if (host === 'dev-build-01' && target.match(/^10\.20\.30\./)) reachable = true;
            if (host === 'c2-stage-01' && (target.match(/^10\.20\.30\./) || target.match(/^10\.20\.40\./))) reachable = true;
            if (host === 'ops-central-01' && target.match(/^10\.20\.40\./)) reachable = true;

            if (reachable) {
                return 'PING ' + target + ' (' + target + ') 56(84) bytes of data.\n' +
                    '64 bytes from ' + target + ': icmp_seq=1 ttl=64 time=1.42 ms\n' +
                    '64 bytes from ' + target + ': icmp_seq=2 ttl=64 time=1.38 ms\n' +
                    '64 bytes from ' + target + ': icmp_seq=3 ttl=64 time=1.41 ms\n\n' +
                    '--- ' + target + ' ping statistics ---\n' +
                    '3 packets transmitted, 3 received, 0% packet loss\n' +
                    'rtt min/avg/max/mdev = 1.38/1.40/1.42/0.016 ms';
            }

            return 'PING ' + target + ' (' + target + ') 56(84) bytes of data.\n\n' +
                '--- ' + target + ' ping statistics ---\n' +
                '3 packets transmitted, 0 received, 100% packet loss';
        },

        // ── curl — HTTP client ───────────────────────────────

        'curl': function(args, term, engine) {
            var url = args.find(function(a) { return a.startsWith('http'); }) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            return 'curl: (7) Failed to connect to ' + url.replace(/https?:\/\//, '').split('/')[0] + ': Connection refused\n\n' +
                '[*] No web services in this scenario. Focus on terminal-based investigation and SSH pivoting.';
        },

        // ── type — Windows-style file viewer (OPS-CENTRAL) ──

        'type': function(args, term, engine) {
            if (A20Config._state.currentHost !== 'ops-central-01') {
                return 'type: command not found\n[hint] \'type\' is a Windows command. Did you mean \'cat\'?';
            }

            var target = args.join(' ');

            // Handle Windows-style paths
            if (target.match(/C:\\Genesis\\global_domination/i) || target.match(/C:\/Genesis\/global_domination/i)) {
                var node = A20Config._getNode(term, '/opt/genesis-ops/global_domination_protocol.txt');
                return node ? node.content : 'The system cannot find the file specified.';
            }

            return 'The system cannot find the file specified.';
        },

        // ── dir — Windows-style directory listing (OPS-CENTRAL) ─

        'dir': function(args, term, engine) {
            if (A20Config._state.currentHost !== 'ops-central-01') {
                return 'dir: command not found\n[hint] \'dir\' is a Windows command. Did you mean \'ls\'?';
            }

            var target = args.join(' ');

            if (target.match(/C:\\Genesis/i) || target.match(/C:\/Genesis/i) || !target) {
                return ' Volume in drive C has no label.\n' +
                    ' Volume Serial Number is 4A2B-7C8D\n\n' +
                    ' Directory of C:\\Genesis\n\n' +
                    '02/16/2026  01:00 AM    <DIR>          .\n' +
                    '02/16/2026  01:00 AM    <DIR>          ..\n' +
                    '02/16/2026  02:30 AM            3,842  global_domination_protocol.txt\n' +
                    '02/15/2026  11:22 PM            1,204  targets.csv\n' +
                    '02/14/2026  08:15 PM          524,288  agents_master.db\n' +
                    '02/16/2026  01:00 AM    <DIR>          encryption_keys\n' +
                    '               3 File(s)        529,334 bytes\n' +
                    '               3 Dir(s)   42,891,264,000 bytes free';
            }

            return ' Directory of ' + target + '\n\n File Not Found';
        },

        // ── ps — Process listing ─────────────────────────────

        'ps': function(args, term, engine) {
            var host = A20Config._state.currentHost;

            if (host === 'dev-build-01') {
                return 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n' +
                    'root           1  0.0  0.1 169344 11604 ?        Ss   Feb15   0:05 /sbin/init\n' +
                    'root         452  0.0  0.0  15424  5764 ?        Ss   Feb15   0:00 /usr/sbin/sshd -D\n' +
                    'root        4521  0.1  0.3  42108 28404 ?        Ssl  02:00   0:04 /usr/lib/libcoreutils.so --beacon\n' +
                    'dev         5102  0.0  0.0   8940  5312 pts/0    Ss   03:14   0:00 -bash\n' +
                    'dev         5201  0.0  0.0  10072  3280 pts/0    R+   03:15   0:00 ps aux';
            }
            if (host === 'c2-stage-01') {
                return 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n' +
                    'root           1  0.0  0.0   1640   904 ?        Ss   Feb15   0:01 /sbin/init\n' +
                    'root         201  0.0  0.0  12804  4208 ?        Ss   Feb15   0:00 /usr/sbin/sshd -D\n' +
                    'root         891  2.1  1.2  84220 48812 ?        Ssl  Feb15   1:42 /opt/genesis/genesis-relay\n' +
                    'admin       1201  0.0  0.0   6420  3104 pts/0    Ss   03:14   0:00 -ash\n' +
                    'admin       1215  0.0  0.0   4840  2128 pts/0    R+   03:15   0:00 ps aux';
            }
            if (host === 'ops-central-01') {
                return 'USER           PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n' +
                    'root             1  0.0  0.1 169344 11604 ?        Ss   Feb15   0:05 /sbin/init\n' +
                    'root           401  0.0  0.0  15424  5764 ?        Ss   Feb15   0:00 /usr/sbin/sshd -D\n' +
                    'root           612  0.0  0.2  24108 18404 ?        Ssl  Feb15   0:12 /usr/sbin/xrdp\n' +
                    'Administr     1401  0.0  0.0   8940  5312 pts/0    Ss   03:14   0:00 -bash\n' +
                    'Administr     1422  0.0  0.0  10072  3280 pts/0    R+   03:15   0:00 ps aux';
            }
            return '';
        },

        // ── whoami — Current user ────────────────────────────

        'whoami': function(args, term, engine) {
            var host = A20Config._state.currentHost;
            if (host === 'dev-build-01') return 'dev';
            if (host === 'c2-stage-01') return 'admin';
            if (host === 'ops-central-01') return 'Administrator';
            return term.user;
        },

        // ── hostname — Current hostname ──────────────────────

        'hostname': function(args, term, engine) {
            return A20Config._state.currentHost;
        },

        // ── id — User identity ───────────────────────────────

        'id': function(args, term, engine) {
            var host = A20Config._state.currentHost;
            if (host === 'dev-build-01') return 'uid=1000(dev) gid=1000(dev) groups=1000(dev),27(sudo)';
            if (host === 'c2-stage-01') return 'uid=1000(admin) gid=1000(admin) groups=1000(admin),0(root)';
            if (host === 'ops-central-01') return 'uid=500(Administrator) gid=500(Administrator) groups=500(Administrator),0(root),544(Administrators)';
            return 'uid=1000(' + term.user + ') gid=1000(' + term.user + ')';
        },

        // ── uname — System info ─────────────────────────────

        'uname': function(args, term, engine) {
            var host = A20Config._state.currentHost;
            if (args.includes('-a')) {
                if (host === 'dev-build-01') return 'Linux dev-build-01 5.4.0-170-generic #188-Ubuntu SMP x86_64 GNU/Linux';
                if (host === 'c2-stage-01') return 'Linux c2-stage-01 6.1.68-0-lts #1-Alpine SMP x86_64 Linux';
                if (host === 'ops-central-01') return 'Linux ops-central-01 4.19.128-microsoft-standard #1 SMP x86_64 GNU/Linux';
            }
            return 'Linux';
        },

        // ── exit — Disconnect from current host ─────────────

        'exit': function(args, term, engine) {
            var host = A20Config._state.currentHost;

            if (host === 'ops-central-01') {
                term._appendOutput('Connection to 10.20.40.100 closed.');
                A20Config._switchHost(term, 'c2-stage-01');
                return '[*] Returned to C2-STAGE-01';
            }
            if (host === 'c2-stage-01') {
                term._appendOutput('Connection to 10.20.30.10 closed.');
                A20Config._switchHost(term, 'dev-build-01');
                return '[*] Returned to DEV-BUILD-01';
            }

            // On initial host, close the terminal window
            engine.closeWindow('terminal');
            return '';
        },

        // ── history — Shell history ──────────────────────────

        'history': function(args, term, engine) {
            var lines = term.history.map(function(cmd, i) {
                return '  ' + String(i + 1).padStart(4) + '  ' + cmd;
            });
            return lines.join('\n');
        },

        // ── sudo — Limited sudo access ──────────────────────

        'sudo': function(args, term, engine) {
            if (A20Config._state.currentHost === 'dev-build-01') {
                return '[sudo] password for dev: \ndev is not in the sudoers file. This incident will be reported.';
            }
            if (A20Config._state.currentHost === 'c2-stage-01') {
                // Admin has root on C2
                var joined = args.join(' ');
                if (joined) {
                    return '[*] Running as root: ' + joined + '\n(Command executed — output would appear here in a real system)';
                }
            }
            return 'usage: sudo <command>';
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM HELPER — resolves paths in current host's FS
    // ═══════════════════════════════════════════════════════

    _getNode(term, path) {
        if (!path.startsWith('/')) {
            path = term.cwd + '/' + path;
        }
        var parts = path.split('/').filter(Boolean);
        var resolved = [];
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === '.') continue;
            if (parts[i] === '..') { resolved.pop(); continue; }
            resolved.push(parts[i]);
        }

        var node = term.fs['/'];
        for (var j = 0; j < resolved.length; j++) {
            if (!node || node.type !== 'dir' || !node.children || !node.children[resolved[j]]) {
                return null;
            }
            node = node.children[resolved[j]];
        }
        return node;
    }

};
