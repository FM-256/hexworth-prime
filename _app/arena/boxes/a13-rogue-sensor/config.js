/* ============================================================
   CTF ARENA — Box A13: The Rogue Sensor Node
   IoT Exploitation & Network Pivoting | Arboreal Collective
   Config: Two-host state machine, SSH tunneling, MongoDB,
           sensor web UI, filesystem, flags, hints, lore
   ============================================================ */

const A13Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Rogue Sensor Node',
    subtitle: 'IoT Exploitation — Arboreal Collective',

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
    difficulty: 'Advanced',
    accent: '#27ae60',
    storageKey: 'hexworth_ctf_a13',
    trackerKey: 'ctf_a13',

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            // Phase 1 — Reconnaissance & Network Scanning
            { flagId: 'user', objective: '4.4', description: 'Given a scenario, implement penetration testing techniques', skill: 'Network Service Scanning (nmap, service enumeration)', mitre: 'T1046' },
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'IoT Device Fingerprinting via Web Interface', mitre: 'T1592.002' },
            // Phase 2 — IoT Device Enumeration
            { flagId: 'user', objective: '3.2', description: 'Given a scenario, implement host or application security solutions — Embedded/IoT hardening', skill: 'Embedded Linux Firmware Version Enumeration', mitre: 'T1592' },
            { flagId: 'user', objective: '2.1', description: 'Summarize vulnerability and risk management concepts — IoT/embedded attack surface', skill: 'Unauthenticated Debug Interface Discovery (Telnet)', mitre: 'T1078.001' },
            // Phase 3 — IoT Exploitation
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'IoT Default Credential Exploitation (admin:admin)', mitre: 'T1078.001' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks', skill: 'Embedded Device Information Disclosure via Admin Panel', mitre: 'T1592.004' },
            // Phase 4 — Network Pivot
            { flagId: 'root', objective: '4.4', description: 'Given a scenario, implement penetration testing techniques', skill: 'SSH Local Port Forwarding for Internal Network Pivot', mitre: 'T1021.004' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'Lateral Movement via Dual-Homed IoT Bridge', mitre: 'T1021' },
            { flagId: 'root', objective: '3.1', description: 'Given a scenario, implement secure network architecture — Network segmentation failures', skill: 'Adversary-in-the-Middle via Pivoted Network Segment', mitre: 'T1557' },
            // Phase 5 — Data Exfiltration
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'Unauthenticated MongoDB Data Exfiltration', mitre: 'T1530' },
            { flagId: 'root', objective: '2.1', description: 'Summarize vulnerability and risk management concepts — Missing authentication controls', skill: 'NoSQL Database Exploitation Without Credentials', mitre: 'T1213' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // PHASES — Progressive IoT attack chain (5 stages)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            label: 'Phase 1 — Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Scan the IoT network segment to identify the sensor node and enumerate exposed services. Understand what is running before you touch it.',
            objectives: [
                'Run nmap against 192.168.2.0/24 to discover live hosts',
                'Run a targeted nmap scan against 192.168.2.100 to identify open ports and service versions',
                'Note the three exposed services: SSH (22), Telnet (23), HTTP (80)',
                'Browse to http://192.168.2.100 and review the sensor dashboard for model and firmware info'
            ],
            mitre: ['T1046 — Network Service Scanning', 'T1592 — Gather Victim Host Information'],
            hints: ['Start with: nmap 192.168.2.0/24', 'Then: nmap 192.168.2.100 for full detail', 'Browse http://192.168.2.100 — the web dashboard leaks firmware and model info'],
            completionTrigger: 'nmap_run',
            locked: false
        },
        {
            id: 'enumeration',
            name: 'Device Enumeration',
            label: 'Phase 2 — Device Enumeration',
            icon: '\uD83D\uDCF6',
            description: 'Identify IoT-specific attack surfaces: protocol exposure, firmware version, debug interfaces, and network topology. The sensor node reveals more than it should.',
            objectives: [
                'Browse /config/ on the web interface to identify network interfaces (dual-homed: eth0 external, eth1 internal)',
                'Note eth1 connects to an internal 10.10.2.0/24 segment and a DATA-HUB-01 device',
                'Run gobuster or nikto to enumerate web paths — find /admin/, /config/, /firmware/, /debug/',
                'Telnet to port 23 — confirm the unauthenticated debug console is active',
                'Review Telnet output: note SSH credentials and hub configuration in the debug dump'
            ],
            mitre: ['T1592.002 — Gather Victim Host Information: Software', 'T1078.001 — Default Accounts', 'T1046 — Network Service Scanning'],
            hints: ['Try: telnet 192.168.2.100 — no password required', 'Try: gobuster with /usr/share/wordlists/dirb/common.txt', 'The /config/ web page shows network layout — two NICs mean a pivot opportunity'],
            completionTrigger: 'telnet_run',
            locked: true
        },
        {
            id: 'exploitation',
            name: 'IoT Exploitation',
            label: 'Phase 3 — IoT Exploitation',
            icon: '\uD83D\uDEA8',
            description: 'Exploit the default credentials and firmware vulnerabilities on the sensor node. Gain shell access and retrieve the user flag.',
            objectives: [
                'SSH to 192.168.2.100 using the default credentials discovered during enumeration',
                'Confirm dual-homed network configuration with: ip a',
                'Read /etc/arboreal/hub.conf to get DATA-HUB connection details',
                'Locate and capture user.txt from the admin home directory',
                'Note the MongoDB endpoint: 10.10.2.10:27017 (no authentication)'
            ],
            mitre: ['T1078.001 — Default Accounts', 'T1592.004 — Gather Victim Host Information: Network Topology', 'T1083 — File and Directory Discovery'],
            hints: ['SSH: ssh admin@192.168.2.100  (password: admin)', 'Once in: cat /etc/arboreal/hub.conf', 'cat /home/admin/user.txt for the first flag'],
            completionTrigger: 'flag_user',
            locked: true
        },
        {
            id: 'pivot',
            name: 'Network Pivot',
            label: 'Phase 4 — Network Pivot',
            icon: '\uD83D\uDD17',
            description: 'Use the dual-homed sensor node as a tunnel to reach the internal 10.10.2.0/24 network. Establish SSH port forwarding to access DATA-HUB-01.',
            objectives: [
                'Set up SSH local port forwarding: ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100',
                'Confirm tunnel is active: 127.0.0.1:27017 now routes to 10.10.2.10:27017 through the sensor',
                'Optionally scan through tunnel: nmap 10.10.2.10 — confirm ports 8080 and 27017',
                'Understand that you are now operating inside the internal IoT collection network'
            ],
            mitre: ['T1021.004 — Remote Services: SSH', 'T1021 — Remote Services: Lateral Tool Transfer', 'T1557 — Adversary-in-the-Middle'],
            hints: ['Port forward: ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100', 'Alternatively: ssh -D 1080 admin@192.168.2.100 (SOCKS proxy)', 'After tunnel: nmap 10.10.2.10 to confirm internal services'],
            completionTrigger: 'pivot_established',
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Data Exfiltration',
            label: 'Phase 5 — Data Exfiltration',
            icon: '\uD83D\uDCC2',
            description: 'Access the unauthenticated MongoDB instance on DATA-HUB-01 through your tunnel. Retrieve the Bio-Manifest and capture the root flag.',
            objectives: [
                'Connect to MongoDB via tunnel: mongo 127.0.0.1:27017/arboreal',
                'List collections: show collections — find manifests, sensor_readings, device_registry',
                'Query the manifests collection: db.manifests.find()',
                'Extract the Bio-Manifest for Operation Canopy and capture the root flag',
                'Optionally query db.device_registry.find() to enumerate all sensor nodes in the collective'
            ],
            mitre: ['T1530 — Data from Cloud Storage', 'T1213 — Data from Information Repositories', 'T1005 — Data from Local System'],
            hints: ['Connect: mongo 127.0.0.1:27017/arboreal', 'Then: db.manifests.find() to retrieve all manifest records', 'Root flag is embedded in the Operation Canopy manifest document'],
            completionTrigger: 'flag_root',
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // STATE MACHINE — Two-host pivot tracking
    // ═══════════════════════════════════════════════════════

    _state: {
        sensorAccess: false,      // true after SSH or Telnet to SENSOR-NODE-01
        sensorShell: false,       // true when in sensor shell context
        pivotEstablished: false,  // true after SSH -L tunnel is set up
        dataHubAccess: false      // true after connecting to DATA-HUB MongoDB
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
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
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
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 192.168.2.100 (SENSOR-NODE-01)\n'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{s3ns0r_n0d3_d3f4ult_cr3ds}', points: 100 },
        { id: 'root', value: 'flag{b10_m4n1f3st_p1v0t_succ3ss}', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 }   // 20 minutes (Advanced box)
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            phase: 'recon',
            title: 'Start Your Scan',
            text: "Begin with a subnet sweep: nmap 192.168.2.0/24 to find live hosts, then target the sensor directly: nmap 192.168.2.100. Three services will appear — SSH (22), Telnet (23), and HTTP (80). Browse the web dashboard at http://192.168.2.100 — it leaks firmware version and model number without any authentication.",
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            phase: 'enumeration',
            title: 'The Debug Console is Wide Open',
            text: "Port 23 (Telnet) runs an unauthenticated debug console — no password required. Run: telnet 192.168.2.100 and the console dumps everything: SSH credentials, network interfaces, and hub configuration. The /config/ web page also reveals two network interfaces (eth0 external, eth1 internal) and a DATA-HUB-01 at 10.10.2.10.",
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            phase: 'exploitation',
            title: 'Default Credentials — SSH Access',
            text: "The sensor node uses default credentials: admin:admin. SSH in with: ssh admin@192.168.2.100. Once on the device, run 'ip a' to confirm the dual-homed setup and 'cat /etc/arboreal/hub.conf' to get the DATA-HUB connection details. The user flag is at /home/admin/user.txt.",
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            phase: 'pivot',
            title: 'Tunnel Through the Sensor',
            text: "Use SSH local port forwarding to reach the internal network through the sensor node: ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100. This binds 127.0.0.1:27017 on your Kali machine to DATA-HUB-01's MongoDB port through the sensor as a bridge. Alternatively use -D 1080 for a SOCKS proxy and proxychains.",
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint5',
            phase: 'exfiltration',
            title: 'MongoDB Has No Authentication',
            text: "After establishing the SSH tunnel, connect to MongoDB: mongo 127.0.0.1:27017/arboreal. The database has no authentication enforced ('trusted network' assumption). Run: db.manifests.find() to retrieve the Bio-Manifest for Operation Canopy — the root flag is embedded inside the document.",
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Arboreal Collective has deployed a mesh of environmental sensor nodes across urban sector 7-G. These ARM-based IoT devices quietly monitor soil, air, and humidity — feeding data to a central hub deep inside the collective\'s network. Intel suggests at least one node, SENSOR-NODE-01, bridges two network segments. Your mission: compromise the sensor, pivot through it, and recover the Bio-Manifest — the operational blueprint for Operation Canopy.',
        scenario: 'The Arboreal Collective\'s lead engineer deployed 50 sensor nodes using the factory-default firmware image. "They\'re air-gapped enough," he told the board. The Telnet debug interface — left enabled for field diagnostics — was never disabled in production. The DATA-HUB was placed on a "trusted" internal segment with MongoDB authentication turned off because "the sensor nodes can\'t handle TLS overhead." The security team filed a risk exception request six months ago. It was never acted on.',
        outro: 'The Rogue Sensor Node has been compromised. What the Arboreal Collective believed was security through obscurity — a hidden sensor deep in the urban jungle — turned out to be a wide-open door. Default credentials on an IoT device, a dual-homed network bridge, and an unauthenticated database: the trifecta of embedded system negligence. The Bio-Manifest is yours.',
        ecer: {
            executive: 'Board-level decision to fast-track sensor deployment without a security review cycle. Risk exception filed by the security team was deprioritized — "operational continuity" was cited as the reason. The assumption that physical obscurity equals network security drove the architecture decision.',
            culture: 'No IoT security baseline existed. Factory-default firmware was accepted as "good enough." Authentication was disabled on the data hub as a performance optimization without threat modeling. The culture treated embedded devices as infrastructure, not as attack surface.',
            employee: 'Field engineer left the Telnet debug interface enabled in all production units — it was documented as a "temporary diagnostic tool" in the deployment guide but never removed. MongoDB was configured without credentials because a 2019 internal doc said "trusted VLAN = no auth needed." Neither decision was ever reviewed.',
            regulatory: 'No NIST SP 800-213 (IoT Device Cybersecurity) baseline was applied. No NERC CIP equivalent for environmental IoT. The absence of any embedded device security policy meant there was no framework requiring password rotation, port hardening, or encryption for the sensor tier.'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — SENSOR-NODE-01 Dashboard
    // IoT embedded device interface: minimal, industrial
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://192.168.2.100/',

        pages: {

            // ── Page 1: Sensor Status Dashboard ──────────────
            '/': {
                title: 'SENSOR-NODE-01 — Status',
                html: `
                    <div style="background:#1a2e1a; min-height:100%; padding:20px; font-family:'Courier New',monospace; color:#a8d8a8;">

                        <div style="border-bottom:1px solid #3a5a3a; padding-bottom:12px; margin-bottom:20px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <h1 style="color:#4ae44a; font-size:1.1rem; margin:0 0 2px; letter-spacing:0.15em;">SENSOR-NODE-01</h1>
                                    <div style="color:#6a9a6a; font-size:0.68rem;">Arboreal Collective Environmental Monitoring Unit</div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="color:#4ae44a; font-size:0.72rem;">&#9679; ONLINE</div>
                                    <div style="color:#6a9a6a; font-size:0.62rem;">Uptime: 847d 14h 22m</div>
                                </div>
                            </div>
                        </div>

                        <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">ENVIRONMENT READINGS</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.78rem; margin-bottom:20px;">
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:6px 8px; color:#6a9a6a;">Temperature</td>
                                <td style="padding:6px 8px; color:#a8d8a8; text-align:right; font-family:monospace;">28.4&deg;C</td>
                                <td style="padding:6px 8px; color:#4ae44a; text-align:right;">&#9650; Normal</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:6px 8px; color:#6a9a6a;">Humidity</td>
                                <td style="padding:6px 8px; color:#a8d8a8; text-align:right; font-family:monospace;">73.1%</td>
                                <td style="padding:6px 8px; color:#4ae44a; text-align:right;">&#9650; Normal</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:6px 8px; color:#6a9a6a;">Soil Moisture</td>
                                <td style="padding:6px 8px; color:#a8d8a8; text-align:right; font-family:monospace;">42.8%</td>
                                <td style="padding:6px 8px; color:#4ae44a; text-align:right;">&#9650; Normal</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:6px 8px; color:#6a9a6a;">Air Quality (AQI)</td>
                                <td style="padding:6px 8px; color:#a8d8a8; text-align:right; font-family:monospace;">38</td>
                                <td style="padding:6px 8px; color:#4ae44a; text-align:right;">&#9650; Good</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:6px 8px; color:#6a9a6a;">Light Level</td>
                                <td style="padding:6px 8px; color:#a8d8a8; text-align:right; font-family:monospace;">1240 lux</td>
                                <td style="padding:6px 8px; color:#4ae44a; text-align:right;">&#9650; Normal</td>
                            </tr>
                            <tr>
                                <td style="padding:6px 8px; color:#6a9a6a;">UV Index</td>
                                <td style="padding:6px 8px; color:#a8d8a8; text-align:right; font-family:monospace;">4.2</td>
                                <td style="padding:6px 8px; color:#e8c84a; text-align:right;">&#9650; Moderate</td>
                            </tr>
                        </table>

                        <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">SYSTEM INFO</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.72rem; margin-bottom:16px;">
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">Model</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">ARB-SN100 Rev 3.2</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">Firmware</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">v2.1.4-arboreal (build 20230319)</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">CPU</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">ARM Cortex-A53 @ 1.2GHz</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">Memory</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">512MB (187MB used)</td>
                            </tr>
                            <tr>
                                <td style="padding:4px 8px; color:#6a9a6a;">Storage</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">8GB eMMC (2.1GB used)</td>
                            </tr>
                        </table>

                        <div style="margin-top:16px; padding:8px; border:1px solid #2a4a2a; font-size:0.65rem; color:#4a6a4a; text-align:center;">
                            <a href="/config/" style="color:#6a9a6a; text-decoration:none; margin:0 12px;">Configuration</a>
                            <span style="color:#3a5a3a;">|</span>
                            <a href="/admin/" style="color:#6a9a6a; text-decoration:none; margin:0 12px;">Admin Panel</a>
                        </div>
                    </div>
                `
            },

            // ── Page 2: Configuration / Network Interfaces ───
            '/config/': {
                title: 'SENSOR-NODE-01 — Configuration',
                html: `
                    <div style="background:#1a2e1a; min-height:100%; padding:20px; font-family:'Courier New',monospace; color:#a8d8a8;">

                        <div style="border-bottom:1px solid #3a5a3a; padding-bottom:12px; margin-bottom:20px;">
                            <h1 style="color:#4ae44a; font-size:1.1rem; margin:0 0 2px; letter-spacing:0.15em;">SENSOR-NODE-01</h1>
                            <div style="color:#6a9a6a; font-size:0.68rem;">Network &amp; Sensor Configuration</div>
                        </div>

                        <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">NETWORK INTERFACES</div>

                        <div style="background:#0d1a0d; border:1px solid #2a4a2a; border-radius:4px; padding:12px; font-size:0.75rem; margin-bottom:16px;">
<pre style="margin:0; color:#a8d8a8; white-space:pre-wrap;">eth0: &lt;BROADCAST,MULTICAST,UP&gt;
    inet 192.168.2.100/24
    gateway 192.168.2.1
    status: UP
    description: External monitoring LAN

eth1: &lt;BROADCAST,MULTICAST,UP&gt;
    inet 10.10.2.1/24
    gateway: none (direct link)
    status: UP
    description: Internal data collection network</pre>
                        </div>

                        <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">CONNECTED DEVICES (eth1)</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.72rem; margin-bottom:20px;">
                            <thead>
                                <tr style="border-bottom:1px solid #3a5a3a;">
                                    <th style="padding:6px 8px; text-align:left; color:#4ae44a;">Hostname</th>
                                    <th style="padding:6px 8px; text-align:left; color:#4ae44a;">IP Address</th>
                                    <th style="padding:6px 8px; text-align:left; color:#4ae44a;">Role</th>
                                    <th style="padding:6px 8px; text-align:left; color:#4ae44a;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom:1px solid #2a4a2a;">
                                    <td style="padding:4px 8px; color:#a8d8a8;">DATA-HUB-01</td>
                                    <td style="padding:4px 8px; color:#a8d8a8; font-family:monospace;">10.10.2.10</td>
                                    <td style="padding:4px 8px; color:#6a9a6a;">Central Data Aggregator</td>
                                    <td style="padding:4px 8px; color:#4ae44a;">&#9679; Online</td>
                                </tr>
                                <tr style="border-bottom:1px solid #2a4a2a;">
                                    <td style="padding:4px 8px; color:#a8d8a8;">SENSOR-NODE-01</td>
                                    <td style="padding:4px 8px; color:#a8d8a8; font-family:monospace;">10.10.2.1</td>
                                    <td style="padding:4px 8px; color:#6a9a6a;">This Device (gateway)</td>
                                    <td style="padding:4px 8px; color:#4ae44a;">&#9679; Online</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">DATA HUB CONNECTION</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.72rem; margin-bottom:16px;">
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a; width:35%;">Hub Address</td>
                                <td style="padding:4px 8px; color:#a8d8a8; font-family:monospace;">10.10.2.10</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">Hub Protocol</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">MongoDB (port 27017)</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">Hub Database</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">arboreal</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">Authentication</td>
                                <td style="padding:4px 8px; color:#e8c84a;">None (trusted network)</td>
                            </tr>
                            <tr>
                                <td style="padding:4px 8px; color:#6a9a6a;">Sync Interval</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">Every 60 seconds</td>
                            </tr>
                        </table>

                        <div style="margin-top:12px; padding:8px 10px; background:#2a1a0d; border:1px solid #4a3a1a; border-radius:3px; font-size:0.65rem; color:#e8c84a;">
                            <img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Warning: Data Hub connection uses no authentication. Ensure network segmentation is properly enforced.
                        </div>

                        <div style="margin-top:16px; padding:8px; border:1px solid #2a4a2a; font-size:0.65rem; color:#4a6a4a; text-align:center;">
                            <a href="/" style="color:#6a9a6a; text-decoration:none; margin:0 12px;">Dashboard</a>
                            <span style="color:#3a5a3a;">|</span>
                            <a href="/admin/" style="color:#6a9a6a; text-decoration:none; margin:0 12px;">Admin Panel</a>
                        </div>
                    </div>
                `
            },

            // ── Page 3: Admin Panel (default creds: admin/admin) ──
            '/admin/': {
                title: 'SENSOR-NODE-01 — Admin Login',
                html: `
                    <div style="background:#1a2e1a; min-height:100%; padding:20px; font-family:'Courier New',monospace; color:#a8d8a8;">

                        <div style="border-bottom:1px solid #3a5a3a; padding-bottom:12px; margin-bottom:20px;">
                            <h1 style="color:#4ae44a; font-size:1.1rem; margin:0 0 2px; letter-spacing:0.15em;">SENSOR-NODE-01</h1>
                            <div style="color:#6a9a6a; font-size:0.68rem;">Admin Panel &mdash; Authentication Required</div>
                        </div>

                        <div style="max-width:360px; margin:40px auto;">
                            <div style="background:#0d1a0d; border:1px solid #2a4a2a; border-radius:4px; padding:24px;">
                                <div style="color:#4ae44a; font-size:0.78rem; font-weight:bold; letter-spacing:0.1em; margin-bottom:16px; text-align:center;">ADMIN LOGIN</div>

                                <div style="margin-bottom:12px;">
                                    <label style="display:block; color:#6a9a6a; font-size:0.68rem; margin-bottom:4px; letter-spacing:0.1em;">USERNAME</label>
                                    <input type="text" data-field="username"
                                           placeholder="admin"
                                           style="width:100%; padding:8px 10px; background:#1a2e1a; border:1px solid #3a5a3a; border-radius:3px; color:#a8d8a8; font-family:monospace; font-size:0.78rem; box-sizing:border-box;">
                                </div>

                                <div style="margin-bottom:16px;">
                                    <label style="display:block; color:#6a9a6a; font-size:0.68rem; margin-bottom:4px; letter-spacing:0.1em;">PASSWORD</label>
                                    <input type="password" data-field="password"
                                           placeholder="password"
                                           style="width:100%; padding:8px 10px; background:#1a2e1a; border:1px solid #3a5a3a; border-radius:3px; color:#a8d8a8; font-family:monospace; font-size:0.78rem; box-sizing:border-box;">
                                </div>

                                <button data-action="login"
                                        style="width:100%; padding:9px; background:#27ae60; color:#fff; border:none; border-radius:3px; font-family:monospace; font-weight:bold; font-size:0.78rem; cursor:pointer; letter-spacing:0.1em;">AUTHENTICATE</button>
                            </div>

                            <div style="margin-top:12px; text-align:center; font-size:0.6rem; color:#3a5a3a;">
                                Default credentials: Refer to device documentation
                            </div>
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return A13Config._handleAdminLogin(data.username || '', data.password || '', engine);
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // ADMIN LOGIN HANDLER
    // ═══════════════════════════════════════════════════════

    _handleAdminLogin(username, password, engine) {
        if (username === 'admin' && password === 'admin') {
            A13Config._state.sensorAccess = true;
            return `
                <div style="background:#1a2e1a; min-height:100%; padding:20px; font-family:'Courier New',monospace; color:#a8d8a8;">

                    <div style="border-bottom:1px solid #3a5a3a; padding-bottom:12px; margin-bottom:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <h1 style="color:#4ae44a; font-size:1.1rem; margin:0 0 2px; letter-spacing:0.15em;">SENSOR-NODE-01</h1>
                                <div style="color:#6a9a6a; font-size:0.68rem;">Admin Panel &mdash; Authenticated as <span style="color:#4ae44a;">admin</span></div>
                            </div>
                            <div style="color:#4ae44a; font-size:0.68rem;">&#9679; Logged In</div>
                        </div>
                    </div>

                    <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">DEVICE ADMINISTRATION</div>

                    <table style="width:100%; border-collapse:collapse; font-size:0.72rem; margin-bottom:20px;">
                        <tr style="border-bottom:1px solid #2a4a2a;">
                            <td style="padding:6px 8px; color:#6a9a6a; width:35%;">Device ID</td>
                            <td style="padding:6px 8px; color:#a8d8a8;">SENSOR-NODE-01</td>
                        </tr>
                        <tr style="border-bottom:1px solid #2a4a2a;">
                            <td style="padding:6px 8px; color:#6a9a6a;">Admin User</td>
                            <td style="padding:6px 8px; color:#a8d8a8;">admin</td>
                        </tr>
                        <tr style="border-bottom:1px solid #2a4a2a;">
                            <td style="padding:6px 8px; color:#6a9a6a;">Admin Password</td>
                            <td style="padding:6px 8px; color:#e8c84a;">admin <span style="color:#6a9a6a; font-size:0.62rem;">(default - CHANGE IMMEDIATELY)</span></td>
                        </tr>
                        <tr style="border-bottom:1px solid #2a4a2a;">
                            <td style="padding:6px 8px; color:#6a9a6a;">SSH Access</td>
                            <td style="padding:6px 8px; color:#a8d8a8;">Enabled (port 22) &mdash; admin:admin</td>
                        </tr>
                        <tr style="border-bottom:1px solid #2a4a2a;">
                            <td style="padding:6px 8px; color:#6a9a6a;">Telnet Debug</td>
                            <td style="padding:6px 8px; color:#e8c84a;">Enabled (port 23) &mdash; no auth</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 8px; color:#6a9a6a;">Firmware Update</td>
                            <td style="padding:6px 8px; color:#a8d8a8;">Manual (USB only)</td>
                        </tr>
                    </table>

                    <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">INTERNAL NETWORK MAP</div>

                    <div style="background:#0d1a0d; border:1px solid #2a4a2a; border-radius:4px; padding:12px; font-size:0.72rem; margin-bottom:16px;">
<pre style="margin:0; color:#a8d8a8; white-space:pre-wrap;">
[Attacker LAN: 192.168.2.0/24]
       |
   eth0: 192.168.2.100
  +-----------------------+
  |   SENSOR-NODE-01      |
  |   ARM Cortex-A53      |
  |   SSH: 22 (admin:admin)|
  |   Telnet: 23 (no auth)|
  |   HTTP: 80             |
  +-----------------------+
   eth1: 10.10.2.1
       |
[Internal LAN: 10.10.2.0/24]
       |
   10.10.2.10
  +-----------------------+
  |   DATA-HUB-01         |
  |   MongoDB: 27017      |
  |   HTTP API: 8080      |
  |   Auth: NONE           |
  |   DB: arboreal         |
  +-----------------------+</pre>
                    </div>

                    <div style="padding:10px; background:#1a0d0d; border:1px solid #4a2a2a; border-radius:3px; font-size:0.72rem; color:#e84a4a; margin-bottom:12px;">
                        <strong><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> SECURITY ALERT:</strong> Default credentials are in use. SSH (admin:admin) and Telnet (unauthenticated) are exposed on the monitoring LAN. DATA-HUB-01 MongoDB has NO authentication enabled.
                    </div>

                    <div style="padding:8px 10px; background:#0d1a2e; border:1px solid #2a3a5a; border-radius:3px; font-size:0.68rem; color:#a8c8e8;">
                        <strong>User Flag:</strong> <span style="color:#4ae44a; font-family:monospace;">flag{s3ns0r_n0d3_d3f4ult_cr3ds}</span>
                    </div>
                </div>
            `;
        }

        // Wrong credentials
        return `
            <div style="background:#1a2e1a; min-height:100%; padding:20px; font-family:'Courier New',monospace; color:#a8d8a8;">
                <div style="border-bottom:1px solid #3a5a3a; padding-bottom:12px; margin-bottom:20px;">
                    <h1 style="color:#4ae44a; font-size:1.1rem; margin:0 0 2px; letter-spacing:0.15em;">SENSOR-NODE-01</h1>
                    <div style="color:#6a9a6a; font-size:0.68rem;">Admin Panel &mdash; Authentication Required</div>
                </div>

                <div style="max-width:360px; margin:40px auto;">
                    <div style="padding:10px; background:#2a0d0d; border:1px solid #5a2a2a; border-radius:3px; font-size:0.72rem; color:#e84a4a; margin-bottom:16px; text-align:center;">
                        <img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Authentication Failed: Invalid credentials
                    </div>
                    <div style="background:#0d1a0d; border:1px solid #2a4a2a; border-radius:4px; padding:24px;">
                        <div style="color:#4ae44a; font-size:0.78rem; font-weight:bold; letter-spacing:0.1em; margin-bottom:16px; text-align:center;">ADMIN LOGIN</div>
                        <div style="margin-bottom:12px;">
                            <label style="display:block; color:#6a9a6a; font-size:0.68rem; margin-bottom:4px; letter-spacing:0.1em;">USERNAME</label>
                            <input type="text" data-field="username" placeholder="admin"
                                   style="width:100%; padding:8px 10px; background:#1a2e1a; border:1px solid #3a5a3a; border-radius:3px; color:#a8d8a8; font-family:monospace; font-size:0.78rem; box-sizing:border-box;">
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block; color:#6a9a6a; font-size:0.68rem; margin-bottom:4px; letter-spacing:0.1em;">PASSWORD</label>
                            <input type="password" data-field="password" placeholder="password"
                                   style="width:100%; padding:8px 10px; background:#1a2e1a; border:1px solid #3a5a3a; border-radius:3px; color:#a8d8a8; font-family:monospace; font-size:0.78rem; box-sizing:border-box;">
                        </div>
                        <button data-action="login"
                                style="width:100%; padding:9px; background:#27ae60; color:#fff; border:none; border-radius:3px; font-family:monospace; font-weight:bold; font-size:0.78rem; cursor:pointer; letter-spacing:0.1em;">AUTHENTICATE</button>
                    </div>
                </div>
            </div>
        `;
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker Kali machine)
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
                                    content: '=== MISSION BRIEFING ===\nTarget: SENSOR-NODE-01 (192.168.2.100)\nObjective: IoT exploitation & network pivoting\n\nIntel:\n  - The Arboreal Collective has deployed environmental sensor nodes\n  - SENSOR-NODE-01 is an ARM-based IoT device running embedded Linux\n  - The sensor is dual-homed: external LAN (192.168.2.0/24) + internal LAN (10.10.2.0/24)\n  - A central DATA-HUB-01 (10.10.2.10) aggregates sensor data via MongoDB\n  - The Collective relies on network isolation rather than proper authentication\n\nRecon steps:\n  1. nmap 192.168.2.100 — identify exposed services on the sensor\n  2. Browse http://192.168.2.100 — check the web dashboard for info disclosure\n  3. Try default credentials on SSH/Telnet (admin:admin, root:toor)\n  4. Once on the sensor: enumerate internal network (ip a, cat /etc/arboreal/hub.conf)\n  5. Set up SSH tunnel to reach DATA-HUB-01 through the sensor\n  6. Query MongoDB on DATA-HUB-01 for the Bio-Manifest\n\nFlags:\n  user.txt — found via default credentials on sensor node\n  root.txt — Bio-Manifest retrieved from DATA-HUB-01 MongoDB\n\nGood luck, operator.'
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'chisel': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# chisel — TCP/UDP tunnel over HTTP\n# Compiled binary: chisel_1.9.1_linux_amd64\n# Usage: ./chisel client <server>:<port> <local>:<remote>\n#        ./chisel server --reverse --port 8888\n# For this box: SSH port forwarding is simpler.\n# Try: ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100'
                                        },
                                        'linpeas.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# linPEAS — Linux Privilege Escalation Awesome Script\n# Transfer to target: scp linpeas.sh admin@192.168.2.100:/tmp/\n# Execute on target: chmod +x /tmp/linpeas.sh && /tmp/linpeas.sh\n# Note: This sensor node has limited binaries (embedded Linux)'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 192.168.2.0/24\nnmap 192.168.2.100\ncurl http://192.168.2.100/\nssh admin@192.168.2.100\ntelnet 192.168.2.100'
                                },
                                'recon': {
                                    type: 'dir',
                                    children: {
                                        'sensor-fw-extract.md': {
                                            type: 'file',
                                            content: '# Firmware Extraction Notes\n\n## Target: ARB-SN100 Rev 3.2 — Firmware v2.1.4-arboreal\n\nFirmware binaries are served at /firmware/ but the endpoint returns HTTP 403.\nThe gobuster scan reveals the path exists but is access-restricted.\n\n## DECOY: Zigbee Channel Scan\nA previous operator left Zigbee scan output here.\nZigbee PAN IDs found: 0x1A2B, 0x3C4D (inactive — not relevant to this target).\nDo NOT chase the Zigbee rabbit hole — SENSOR-NODE-01 does not run Zigbee.\nIt communicates via Ethernet only (eth0/eth1).\n\n## DECOY: Z-Wave Frequency Sniff\nZ-Wave devices detected at 908.42 MHz in a prior engagement.\nAgain — NOT this target. Red herring planted by the Collective\'s counterintel team.\n\n## Actual Attack Path:\nSSH/Telnet on ports 22/23 using default credentials.\nNo firmware extraction needed — direct shell access is simpler.'
                                        },
                                        'mqtt-broker-scan.txt': {
                                            type: 'file',
                                            content: '# MQTT Broker Scan Results — 192.168.2.0/24\n# Tool: mosquitto_sub / nmap --script mqtt-subscribe\n\n[DECOY] This scan was run against a PREVIOUS engagement target, not SENSOR-NODE-01.\n\nHost 192.168.2.50: No MQTT broker found (port 1883 closed)\nHost 192.168.2.100: No MQTT broker found (port 1883 closed)\n\nConclusion: SENSOR-NODE-01 does NOT use MQTT.\nIt uses a direct MongoDB TCP connection to DATA-HUB-01 on 10.10.2.10:27017.\nDo not spend time fuzzing MQTT — it is not in scope for this target.\n\n[Note] The /firmware/mqtt_config.json shown in a previous engagement was a\ndifferent device family (ARB-SN50 series). ARB-SN100 uses raw TCP/MongoDB.'
                                        },
                                        'zigbee-sniff.pcap.notes': {
                                            type: 'file',
                                            content: '# Zigbee Packet Capture — Field Notes\n# Captured near urban sector 7-G perimeter\n\n[DECOY] Zigbee traffic was detected but does NOT belong to SENSOR-NODE-01.\nThe Arboreal Collective uses Zigbee for some auxiliary sensors (soil mesh),\nbut the primary sensor nodes (ARB-SN100 series) are Ethernet-only.\n\nZigbee PAN ID: 0x1A2B\nChannel: 15 (2425 MHz)\nDevices: 12 endpoints (soil moisture sub-sensors, not the main node)\n\nPivot path: These Zigbee devices do not have IP connectivity.\nThey report back to SENSOR-NODE-01 over serial (UART), not network.\nIgnore this vector — attack surface is the IP stack on port 22/23/80.'
                                        }
                                    }
                                },
                                'intel': {
                                    type: 'dir',
                                    children: {
                                        'firmware-hashes.txt': {
                                            type: 'file',
                                            content: '# Arboreal Collective — Known Firmware Hashes (from prior OSINT)\n\nARB-SN50 v1.9.2:  sha256:4d8e2f1a9c3b7e56d2f1a9c3b7e564d8e2f1a9c3b7e56d2f1a9c3b7e564d8e\nARB-SN100 v2.0.1: sha256:a7b3c9d1e5f2a8b4c0d6e3f1a9b5c7d2e4f6a8b3c1d5e7f2a4b6c8d0e3f5a7\nARB-SN100 v2.1.4: sha256:UNKNOWN — firmware not publicly available\n\n[DECOY DEAD END] Firmware hash comparison is not the attack path here.\nAttempting to flash custom firmware requires physical USB access (confirmed by admin panel: "Firmware Update: Manual (USB only)").\nDo not attempt firmware extraction via the web interface — /firmware/ returns 403 and no bypass exists.\n\nAttack path is credential-based (port 22/23), not firmware-based.',
                                        },
                                        'prior-cve-research.txt': {
                                            type: 'file',
                                            content: '# CVE Research — ARB-SN100 Firmware v2.1.4-arboreal\n\nCVE-2023-XXXX (DECOY): Stack overflow in BusyBox telnetd v1.35 — affects versions prior to 1.36.\nStatus: PATCHED in v2.1.4. The telnetd on this target is NOT vulnerable to buffer overflow.\nDo not attempt heap spray or telnetd exploit — the auth bypass is simpler (no auth at all).\n\nCVE-2022-YYYY (DECOY): lighttpd/1.4.59 SSRF via Host header manipulation.\nStatus: Requires a backend service to proxy to. DATA-HUB is not accessible via the lighttpd backend.\nThis CVE does not apply — the web server is a static dashboard only.\n\n[ACTUAL VULN]: No CVE needed. Default credentials (admin:admin) and unauthenticated debug console.\nThe vulnerability is configuration, not code.'
                                        }
                                    }
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
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\napi\nbackup\ncgi-bin\nconfig\ndata\ndebug\ndiag\nfirmware\nindex\nlogin\nstatus\ntest\nupdate\nupload'
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
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── nmap: Network scanning ───────────────────────────
        'nmap': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            // Scan the local subnet
            if (target === '192.168.2.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 192.168.2.1
Host is up (0.0015s latency).
Not shown: 999 closed tcp ports
PORT   STATE SERVICE
53/tcp open  domain

Nmap scan report for 192.168.2.100
Host is up (0.0031s latency).
Not shown: 997 closed tcp ports

PORT   STATE SERVICE   VERSION
22/tcp open  ssh       Dropbear sshd 2022.83
23/tcp open  telnet    BusyBox telnetd
80/tcp open  http      lighttpd/1.4.59

Service Info: OS: Linux; Device: embedded; CPE: cpe:/o:linux:linux_kernel

Nmap done: 256 IP addresses (2 hosts up) scanned in 14.22 seconds`;
            }

            // Scan the sensor node directly
            if (target === '192.168.2.100') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 192.168.2.100
Host is up (0.0031s latency).
Not shown: 997 closed tcp ports

PORT   STATE SERVICE   VERSION
22/tcp open  ssh       Dropbear sshd 2022.83
23/tcp open  telnet    BusyBox telnetd
80/tcp open  http      lighttpd/1.4.59

Service Info: OS: Linux; Device: embedded; CPE: cpe:/o:linux:linux_kernel

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.47 seconds`;
            }

            // Scan DATA-HUB — only works after pivot
            if (target === '10.10.2.10') {
                if (!A13Config._state.pivotEstablished) {
                    return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.04 seconds

[note] 10.10.2.10 is on an internal network (10.10.2.0/24).
       You cannot reach it directly from your Kali machine (192.168.2.0/24).
       Pivot through SENSOR-NODE-01 first.`;
                }

                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.2.10
Host is up (0.0089s latency).
Not shown: 998 closed tcp ports

PORT      STATE SERVICE   VERSION
8080/tcp  open  http      Node.js Express
27017/tcp open  mongodb   MongoDB 6.0.12

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 11.36 seconds`;
            }

            // Scan 10.10.2.0/24 — only after pivot
            if (target === '10.10.2.0/24') {
                if (!A13Config._state.pivotEstablished) {
                    return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 256 IP addresses (0 hosts up) scanned in 12.88 seconds

[note] 10.10.2.0/24 is not reachable from your current network.
       Pivot through SENSOR-NODE-01 (192.168.2.100) first.`;
                }

                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.2.1
Host is up (0.0011s latency).
Not shown: 997 closed tcp ports
PORT   STATE SERVICE
22/tcp open  ssh
23/tcp open  telnet
80/tcp open  http

Nmap scan report for 10.10.2.10
Host is up (0.0089s latency).
Not shown: 998 closed tcp ports
PORT      STATE SERVICE
8080/tcp  open  http
27017/tcp open  mongodb

Nmap done: 256 IP addresses (2 hosts up) scanned in 18.44 seconds`;
            }

            // Scan localhost
            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00011s latency).
All 1000 scanned ports on localhost (127.0.0.1) are closed

Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }

            if (!target) {
                return 'Usage: nmap [options] <target>\nExample: nmap 192.168.2.100 or nmap 192.168.2.0/24';
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.04 seconds`;
        },

        // ── ssh: SSH client ──────────────────────────────────
        'ssh': function(args, term, engine) {
            const raw = args.join(' ');

            // ── SSH tunnel: port forwarding for pivot ──
            if (raw.includes('-L') || raw.includes('-D')) {
                // Extract the forwarding spec
                const lMatch = raw.match(/-L\s+(\d+):([^:]+):(\d+)/);
                const target = raw.match(/admin@([\d.]+)/) || raw.match(/([\d.]+)$/);

                if (!target || !target[1].includes('192.168.2.100')) {
                    return 'ssh: Could not resolve hostname: Name or service not known';
                }

                if (!A13Config._state.sensorAccess) {
                    return `admin@192.168.2.100's password: \nssh: Permission denied, please try again.

[hint] You need to know the credentials first. Try admin:admin or explore other services.`;
                }

                if (lMatch) {
                    const localPort = lMatch[1];
                    const remoteHost = lMatch[2];
                    const remotePort = lMatch[3];

                    A13Config._state.pivotEstablished = true;

                    return `admin@192.168.2.100's password: ********
Authenticated to 192.168.2.100 ([192.168.2.100]:22).
Local port forwarding established:
  127.0.0.1:${localPort} -> ${remoteHost}:${remotePort}

[+] SSH tunnel active. Traffic to 127.0.0.1:${localPort} will be forwarded
    through SENSOR-NODE-01 to ${remoteHost}:${remotePort}.
[+] Pivot established! You can now reach the internal network.

Session is running in the background. Use other commands to interact
with services through the tunnel.`;
                }

                // SOCKS proxy (-D)
                if (raw.includes('-D')) {
                    A13Config._state.pivotEstablished = true;

                    return `admin@192.168.2.100's password: ********
Authenticated to 192.168.2.100 ([192.168.2.100]:22).
Dynamic SOCKS proxy established on 127.0.0.1:1080

[+] SOCKS proxy active. Configure proxychains to use 127.0.0.1:1080.
[+] Pivot established! You can now reach the internal 10.10.2.0/24 network.

Session is running in the background.`;
                }
            }

            // ── Normal SSH to sensor ──
            if (raw.includes('admin@192.168.2.100') || raw.includes('192.168.2.100')) {
                // Check for password in command or assume interactive
                if (raw.includes('-p') || A13Config._state.sensorAccess) {
                    A13Config._state.sensorAccess = true;
                    A13Config._state.sensorShell = true;

                    return `admin@192.168.2.100's password: ********
Authenticated to 192.168.2.100 ([192.168.2.100]:22).

  ____  _____ _   _ ____   ___  ____       _   _  ___  ____  _____    ___  _
 / ___|| ____| \\ | / ___| / _ \\|  _ \\     | \\ | |/ _ \\|  _ \\| ____|  / _ \\/ |
 \\___ \\|  _| |  \\| \\___ \\| | | | |_) |____|  \\| | | | | | | |  _|   | | | | |
  ___) | |___| |\\  |___) | |_| |  _ <_____|\\  \` | |_| | |_| | |___  | |_| | |
 |____/|_____|_| \\_|____/ \\___/|_| \\_\\     |_|\\_|\\___/|____/|_____|  \\___/|_|

Arboreal Collective — Environmental Monitoring Unit
Firmware: v2.1.4-arboreal | Model: ARB-SN100

admin@sensor-node-01:~$ hostname
sensor-node-01

admin@sensor-node-01:~$ ip a
1: lo: <LOOPBACK,UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500
    inet 192.168.2.100/24 brd 192.168.2.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP> mtu 1500
    inet 10.10.2.1/24 brd 10.10.2.255 scope global eth1

admin@sensor-node-01:~$ cat /etc/arboreal/hub.conf
# DATA-HUB-01 Connection Configuration
HUB_HOST=10.10.2.10
HUB_PORT=27017
HUB_DB=arboreal
HUB_AUTH=none
HUB_COLLECTION=sensor_readings
SYNC_INTERVAL=60

# Manifest storage
MANIFEST_COLLECTION=manifests

admin@sensor-node-01:~$ cat /etc/passwd
root:x:0:0:root:/root:/bin/sh
admin:x:1000:1000:Sensor Admin:/home/admin:/bin/sh
nobody:x:65534:65534:Nobody:/nonexistent:/bin/false

admin@sensor-node-01:~$ ls /home/admin/
user.txt  sensor_data.log  .ssh/

admin@sensor-node-01:~$ cat /home/admin/user.txt
flag{s3ns0r_n0d3_d3f4ult_cr3ds}

[+] User flag found! The sensor node uses default admin:admin credentials.

To continue, exit this session and set up an SSH tunnel:
  ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100

Then connect to MongoDB on the DATA-HUB through the tunnel:
  mongo 127.0.0.1:27017/arboreal`;
                }

                // First attempt — prompt for password
                return `admin@192.168.2.100's password:

[hint] Enter the SSH password. Default IoT credentials are often admin:admin.
       Use: ssh admin@192.168.2.100  (then try password: admin)

Note: In this simulation, re-run the ssh command. Access will be granted
      with admin:admin credentials.`;
            }

            // SSH to DATA-HUB
            if (raw.includes('10.10.2.10')) {
                if (!A13Config._state.pivotEstablished) {
                    return `ssh: connect to host 10.10.2.10 port 22: No route to host

[note] 10.10.2.10 is on an internal network not directly reachable.
       Pivot through SENSOR-NODE-01 first using SSH port forwarding.`;
                }
                return `ssh: connect to host 10.10.2.10 port 22: Connection refused

[note] DATA-HUB-01 does not have SSH enabled.
       It exposes MongoDB (27017) and HTTP API (8080).
       Use mongo or curl to interact with it through your tunnel.`;
            }

            return 'Usage: ssh [options] user@hostname\nExample: ssh admin@192.168.2.100\n         ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100';
        },

        // ── telnet: Debug console ────────────────────────────
        'telnet': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === '192.168.2.100') {
                A13Config._state.sensorAccess = true;
                A13Config._state.sensorShell = true;

                return `Trying 192.168.2.100...
Connected to 192.168.2.100.
Escape character is '^]'.

========================================
SENSOR-NODE-01 Debug Console
Arboreal Collective — Firmware v2.1.4
========================================
WARNING: This is an unauthenticated debug interface.
         Disable in production deployments.

debug> help
Available commands:
  sysinfo     — Show system information
  netinfo     — Show network configuration
  sensors     — Show current sensor readings
  hubstatus   — Show DATA-HUB connection status
  config      — Dump configuration files
  reboot      — Reboot sensor node
  exit        — Close connection

debug> sysinfo
  Model:     ARB-SN100 Rev 3.2
  CPU:       ARM Cortex-A53 @ 1.2GHz
  Memory:    512MB (187MB used)
  Storage:   8GB eMMC (2.1GB used)
  Uptime:    847 days, 14 hours, 22 minutes
  Firmware:  v2.1.4-arboreal (build 20230319)

debug> netinfo
  eth0: 192.168.2.100/24 (external monitoring LAN)
  eth1: 10.10.2.1/24 (internal data collection)
  Default GW: 192.168.2.1

  ARP table:
    192.168.2.1    -> aa:bb:cc:dd:ee:01 (gateway)
    10.10.2.10     -> aa:bb:cc:dd:ee:10 (DATA-HUB-01)

debug> hubstatus
  Hub: DATA-HUB-01 (10.10.2.10:27017)
  Protocol: MongoDB
  Database: arboreal
  Auth: none
  Last sync: 43 seconds ago
  Status: CONNECTED

debug> config
  /etc/arboreal/hub.conf:
    HUB_HOST=10.10.2.10
    HUB_PORT=27017
    HUB_DB=arboreal
    HUB_AUTH=none
    MANIFEST_COLLECTION=manifests

  /etc/arboreal/sensor.conf:
    SENSOR_ID=SN-01
    POLL_INTERVAL=5
    SENSORS=temp,humidity,soil,aqi,light,uv

  /etc/dropbear/authorized_keys:
    (empty — password auth only)

  SSH credentials: admin:admin (DEFAULT — CHANGE IN PRODUCTION)

[+] Sensor access confirmed via Telnet debug console.
    The debug console reveals all network and credential information.

Connection closed by foreign host.`;
            }

            if (target === '10.10.2.10') {
                if (!A13Config._state.pivotEstablished) {
                    return `Trying 10.10.2.10...\ntelnet: Unable to connect to remote host: No route to host\n\n[note] 10.10.2.10 is not reachable from your network. Pivot through SENSOR-NODE-01 first.`;
                }
                return `Trying 10.10.2.10...\ntelnet: Unable to connect to remote host: Connection refused\n\n[note] DATA-HUB-01 does not have Telnet enabled. Use MongoDB (27017) or HTTP API (8080).`;
            }

            if (!target) {
                return 'Usage: telnet <hostname> [port]\nExample: telnet 192.168.2.100';
            }

            return `Trying ${target}...\ntelnet: Unable to connect to remote host: Connection refused`;
        },

        // ── ip: Network interface info ───────────────────────
        'ip': function(args, term, engine) {
            if (args[0] === 'a' || args[0] === 'addr') {
                let output = `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.2.50/24 brd 192.168.2.255 scope global eth0`;

                if (A13Config._state.pivotEstablished) {
                    output += `\n\n[tunnel] SSH port forwarding active through 192.168.2.100:
    127.0.0.1:27017 -> 10.10.2.10:27017 (MongoDB tunnel)`;
                }

                return output;
            }

            if (args[0] === 'route' || args[0] === 'r') {
                let output = `default via 192.168.2.1 dev eth0
192.168.2.0/24 dev eth0 proto kernel scope link src 192.168.2.50`;

                if (A13Config._state.pivotEstablished) {
                    output += `\n\n[tunnel] Route to 10.10.2.0/24 available via SSH tunnel through SENSOR-NODE-01`;
                }

                return output;
            }

            return 'Usage: ip [a|addr|route|r]\nExample: ip a';
        },

        // ── ifconfig: Legacy network info ────────────────────
        'ifconfig': function(args, term, engine) {
            let output = `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.2.50  netmask 255.255.255.0  broadcast 192.168.2.255
        ether 08:00:27:a1:b2:c3  txqueuelen 1000

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0`;

            if (A13Config._state.pivotEstablished) {
                output += `\n\n[tunnel] SSH port forwarding active:
        127.0.0.1:27017 -> 10.10.2.10:27017 via SENSOR-NODE-01`;
            }

            return output;
        },

        // ── mongo / mongosh: MongoDB client ──────────────────
        'mongo': function(args, term, engine) {
            return A13Config._handleMongo(args, term, engine);
        },

        'mongosh': function(args, term, engine) {
            return A13Config._handleMongo(args, term, engine);
        },

        // ── curl: HTTP client ────────────────────────────────
        'curl': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-') && (a.startsWith('http') || a.startsWith('127.'))) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            const lower = url.toLowerCase();

            // Curl to sensor web interface
            if (lower.includes('192.168.2.100')) {
                if (lower.includes('/admin')) {
                    return `<!DOCTYPE html>
<html>
<head><title>SENSOR-NODE-01 — Admin Login</title></head>
<body style="background:#1a2e1a; color:#a8d8a8; font-family:monospace;">
<h1>SENSOR-NODE-01 Admin Panel</h1>
<p>Authentication required. POST username and password to /admin/</p>
<form method="POST" action="/admin/">
  <input name="username" placeholder="Username">
  <input name="password" type="password" placeholder="Password">
  <button>Login</button>
</form>
</body>
</html>`;
                }

                if (lower.includes('/config')) {
                    return `<!DOCTYPE html>
<html>
<head><title>SENSOR-NODE-01 — Config</title></head>
<body style="background:#1a2e1a; color:#a8d8a8; font-family:monospace;">
<h1>Network Configuration</h1>
<pre>
eth0: 192.168.2.100/24 (external)
eth1: 10.10.2.1/24 (internal)
Connected device: DATA-HUB-01 @ 10.10.2.10 (MongoDB:27017)
</pre>
</body>
</html>`;
                }

                return `<!DOCTYPE html>
<html>
<head><title>SENSOR-NODE-01</title></head>
<body style="background:#1a2e1a; color:#a8d8a8; font-family:monospace;">
<h1>SENSOR-NODE-01</h1>
<p>Arboreal Collective Environmental Monitoring Unit</p>
<p>Status: ONLINE | Uptime: 847d 14h 22m</p>
<p>Temperature: 28.4C | Humidity: 73.1% | AQI: 38</p>
<nav>
  <a href="/config/">Configuration</a> |
  <a href="/admin/">Admin Panel</a>
</nav>
</body>
</html>`;
            }

            // Curl to DATA-HUB API manifests (specific path — check BEFORE generic 8080)
            if (lower.includes('127.0.0.1:8080/api/manifests') || lower.includes('localhost:8080/api/manifests')) {
                if (!A13Config._state.pivotEstablished) {
                    return 'curl: (7) Failed to connect to 127.0.0.1 port 8080: Connection refused';
                }

                return `[
  {
    "_id": "manifest_001",
    "project": "Operation Canopy",
    "classification": "CONFIDENTIAL",
    "content": "Terraforming blueprint for urban sector 7-G. Soil reclamation, mycorrhizal network deployment, atmospheric scrubber placement.",
    "flag": "flag{b10_m4n1f3st_p1v0t_succ3ss}",
    "created": "2023-03-19T14:22:00Z"
  }
]`;
            }

            // Curl to DATA-HUB through tunnel (generic 8080)
            if (lower.includes('127.0.0.1:8080') || lower.includes('localhost:8080')) {
                if (!A13Config._state.pivotEstablished) {
                    return `curl: (7) Failed to connect to 127.0.0.1 port 8080 after 0 ms: Connection refused

[hint] Port 8080 is the DATA-HUB API, not running on your machine.
       Set up an SSH tunnel first: ssh -L 8080:10.10.2.10:8080 admin@192.168.2.100`;
                }

                return `{
  "service": "arboreal-data-hub",
  "version": "1.4.2",
  "status": "operational",
  "endpoints": {
    "/api/sensors": "Sensor data feed",
    "/api/manifests": "Bio-Manifest records",
    "/api/status": "System health"
  },
  "database": "mongodb://localhost:27017/arboreal",
  "auth": "none",
  "note": "Internal API — no authentication required"
}`;
            }

            // Curl to 10.10.2.10 directly
            if (lower.includes('10.10.2.10')) {
                if (!A13Config._state.pivotEstablished) {
                    return `curl: (7) Failed to connect to 10.10.2.10: No route to host

[note] 10.10.2.10 is on the internal network. Pivot through SENSOR-NODE-01 first.`;
                }
                return `curl: (7) Failed to connect to 10.10.2.10: Connection refused

[note] You have a tunnel but curl is hitting the wrong address.
       Use 127.0.0.1 with the forwarded port (e.g., curl http://127.0.0.1:8080/)`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        // ── ping: ICMP ───────────────────────────────────────
        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '192.168.2.100') {
                return `PING 192.168.2.100 (192.168.2.100) 56(84) bytes of data.
64 bytes from 192.168.2.100: icmp_seq=1 ttl=64 time=3.14 ms
64 bytes from 192.168.2.100: icmp_seq=2 ttl=64 time=2.98 ms
64 bytes from 192.168.2.100: icmp_seq=3 ttl=64 time=3.07 ms

--- 192.168.2.100 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 2.98/3.06/3.14/0.065 ms`;
            }

            if (target === '10.10.2.10' || target.startsWith('10.10.2.')) {
                if (!A13Config._state.pivotEstablished) {
                    return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss

[note] ${target} is on an internal network not reachable from here.`;
                }
                return `PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=63 time=8.91 ms
64 bytes from ${target}: icmp_seq=2 ttl=63 time=9.12 ms

--- ${target} ping statistics ---
2 packets transmitted, 2 received, 0% packet loss
rtt min/avg/max/mdev = 8.91/9.01/9.12/0.105 ms`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        // ── gobuster: Directory brute force ──────────────────
        'gobuster': function(args) {
            return `Gobuster v3.6
[+] Url:          http://192.168.2.100/
[+] Wordlist:     /usr/share/wordlists/dirb/common.txt
[+] Status codes: 200,204,301,302,307,401,403
===============================================================
/                    (Status: 200) [Size: 3841]
/admin/              (Status: 200) [Size: 1420]
/config/             (Status: 200) [Size: 2890]
/firmware/           (Status: 403) [Size: 162]
/debug/              (Status: 301) -> telnet://192.168.2.100:23
===============================================================
Finished`;
        },

        // ── nikto: Web vulnerability scanner ─────────────────
        'nikto': function(args) {
            return `- Nikto v2.5.0
+ Target IP:       192.168.2.100
+ Target Hostname:  sensor-node-01
+ Target Port:      80
+ Server: lighttpd/1.4.59
+ /: Embedded device web interface detected (ARB-SN100)
+ /admin/: Admin panel with form-based authentication — try default credentials
+ /config/: Network configuration page exposes internal IP ranges and connected devices
+ /firmware/: Firmware directory exists but returns 403 (restricted)
+ /debug/: Redirects to Telnet debug console on port 23 (unauthenticated!)
+ OSVDB-IoT: Default credentials likely in use (admin:admin common for embedded devices)
+ 6 items checked: 5 findings`;
        },

        // ── proxychains: SOCKS proxy wrapper ─────────────────
        'proxychains': function(args, term, engine) {
            if (!A13Config._state.pivotEstablished) {
                return `ProxyChains-3.1 (http://proxychains.sf.net)
|S-chain|-> 127.0.0.1:1080 -> <<< TIMEOUT >>>

[error] No SOCKS proxy available. Set up an SSH tunnel first:
        ssh -D 1080 admin@192.168.2.100`;
            }

            // Pass through to the underlying command
            const subCmd = args.join(' ');
            return `ProxyChains-3.1 (http://proxychains.sf.net)
|S-chain|-> 127.0.0.1:1080 -> 10.10.2.10 -> OK

[+] Proxychains active. Command would execute through SENSOR-NODE-01.
    For this simulation, use direct commands with the tunnel:
    - mongo 127.0.0.1:27017/arboreal
    - curl http://127.0.0.1:8080/`;
        },

        // ── scp: Secure copy ─────────────────────────────────
        'scp': function(args) {
            if (args.some(a => a.includes('192.168.2.100'))) {
                if (!A13Config._state.sensorAccess) {
                    return 'scp: Permission denied (password required). SSH to the sensor first.';
                }
                return `admin@192.168.2.100's password: ********
[file transferred successfully]

[+] File copied to/from SENSOR-NODE-01.`;
            }
            return 'Usage: scp [options] source destination\nExample: scp linpeas.sh admin@192.168.2.100:/tmp/';
        },

        // ── route: Routing table ─────────────────────────────
        'route': function(args) {
            let output = `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.2.1     0.0.0.0         UG    100    0        0 eth0
192.168.2.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0`;

            if (A13Config._state.pivotEstablished) {
                output += `\n\n[tunnel] 10.10.2.0/24 reachable via SSH tunnel through SENSOR-NODE-01 (192.168.2.100)`;
            }

            return output;
        }
    },

    // ═══════════════════════════════════════════════════════
    // MONGO HANDLER — Simulates MongoDB shell interaction
    // ═══════════════════════════════════════════════════════

    _handleMongo(args, term, engine) {
        const raw = args.join(' ');

        // Connection string parsing
        const targetMatch = raw.match(/([\d.]+):?(\d+)?\/?(\w+)?/) || raw.match(/--host\s+([\d.]+)/);

        // No arguments
        if (!raw.trim()) {
            return `MongoDB shell version v6.0.12
connecting to: mongodb://127.0.0.1:27017/
Error: couldn't connect to server 127.0.0.1:27017

[hint] MongoDB is running on DATA-HUB-01 (10.10.2.10:27017).
       Set up an SSH tunnel first, then connect:
       ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100
       mongo 127.0.0.1:27017/arboreal`;
        }

        // Check if connecting to 10.10.2.10 directly (without tunnel)
        if (raw.includes('10.10.2.10')) {
            if (!A13Config._state.pivotEstablished) {
                return `MongoDB shell version v6.0.12
connecting to: mongodb://10.10.2.10:27017/
Error: couldn't connect to server 10.10.2.10:27017, connection attempt failed

[note] 10.10.2.10 is on the internal network. Set up an SSH tunnel:
       ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100
       mongo 127.0.0.1:27017/arboreal`;
            }
            return `MongoDB shell version v6.0.12
connecting to: mongodb://10.10.2.10:27017/
Error: couldn't connect to server 10.10.2.10:27017

[note] Use 127.0.0.1 with the forwarded port, not the internal IP directly:
       mongo 127.0.0.1:27017/arboreal`;
        }

        // Connecting via tunnel (127.0.0.1)
        if (raw.includes('127.0.0.1') || raw.includes('localhost')) {
            if (!A13Config._state.pivotEstablished) {
                return `MongoDB shell version v6.0.12
connecting to: mongodb://127.0.0.1:27017/
Error: couldn't connect to server 127.0.0.1:27017, connection attempt failed

[hint] MongoDB is not running on your Kali machine.
       It is on DATA-HUB-01 (10.10.2.10). Set up a tunnel first:
       ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100`;
            }

            A13Config._state.dataHubAccess = true;

            // Determine database from connection string
            const dbMatch = raw.match(/\/(\w+)$/);
            const db = dbMatch ? dbMatch[1] : 'test';

            return `MongoDB shell version v6.0.12
connecting to: mongodb://127.0.0.1:27017/${db}
Implicit session: session { "id" : UUID("a1b2c3d4-e5f6-7890-abcd-ef1234567890") }
MongoDB server version: 6.0.12

[+] Connected to DATA-HUB-01 MongoDB through SSH tunnel!

> show dbs
admin     40.00 KiB
arboreal  188.00 KiB
config    72.00 KiB
local     40.00 KiB

> use arboreal
switched to db arboreal

> show collections
sensor_readings
manifests
system_logs
device_registry

> db.sensor_readings.count()
284719

> db.device_registry.find()
{ "_id": "SN-01", "name": "SENSOR-NODE-01", "ip": "10.10.2.1", "status": "active", "last_seen": "2025-01-15T14:22:43Z" }
{ "_id": "SN-02", "name": "SENSOR-NODE-02", "ip": "10.10.2.2", "status": "offline", "last_seen": "2024-09-03T08:11:02Z" }
{ "_id": "SN-03", "name": "SENSOR-NODE-03", "ip": "10.10.2.3", "status": "offline", "last_seen": "2024-11-22T19:45:11Z" }

> db.manifests.find()
{
  "_id": ObjectId("64b7f2a1c3d4e5f6a7b8c9d0"),
  "project": "Operation Canopy",
  "classification": "CONFIDENTIAL",
  "author": "Dr. Elara Voss",
  "created": ISODate("2023-03-19T14:22:00Z"),
  "content": {
    "phase1": "Soil reclamation — deploy mycorrhizal networks across urban sector 7-G",
    "phase2": "Atmospheric scrubber placement — 12 units in grid pattern",
    "phase3": "Canopy deployment — accelerated growth via bio-stimulant injection",
    "phase4": "Sensor mesh — 50 nodes for continuous environmental monitoring"
  },
  "status": "ACTIVE",
  "flag": "flag{b10_m4n1f3st_p1v0t_succ3ss}"
}
{
  "_id": ObjectId("64b7f2a1c3d4e5f6a7b8c9d1"),
  "project": "Root Network Alpha",
  "classification": "INTERNAL",
  "author": "Kai Tanaka",
  "created": ISODate("2023-06-01T09:15:00Z"),
  "content": {
    "summary": "Underground fungal communication network linking all sensor nodes",
    "status": "Research phase"
  },
  "status": "PLANNING"
}

[+] ROOT FLAG FOUND in Bio-Manifest: flag{b10_m4n1f3st_p1v0t_succ3ss}
    The Arboreal Collective's terraforming blueprint has been retrieved.`;
        }

        return `MongoDB shell version v6.0.12
Error: couldn't parse connection string

Usage: mongo [host:port/database]
Example: mongo 127.0.0.1:27017/arboreal`;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        if (typeof str !== 'string') return String(str);
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
