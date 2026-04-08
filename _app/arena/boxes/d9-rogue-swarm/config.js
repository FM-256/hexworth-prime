/* ============================================================
   CTF ARENA — Box D9: The Rogue Swarm
   Advanced | Protocol Analysis, Packet Forgery, Swarm Hijack
   Config: filesystem, protocol artifacts, PCAP viewer, flags, hints, lore
   ============================================================ */

const D9Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Rogue Swarm',
    subtitle: 'Advanced Campaign — Protocol Analysis, Command Injection, Swarm Hijack',
    difficulty: 'Advanced',
    accent: '#f39c12',
    storageKey: 'hexworth_ctf_d9',
    registryId: 'd9-rogue-swarm',
    trackerKey: 'ctf_d9',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Traffic Analysis',
            icon: '\uD83D\uDD0D',
            description: 'Capture and analyze the ACN drone mesh network traffic. Review the protocol specification and identify message structure.',
            requiredFlags: [],
            mitre: ['T1040', 'T1046'],
            unlocks: ['vuln_id'],
            locked: false
        },
        {
            id: 'vuln_id',
            name: 'Vulnerability Identification',
            icon: '\uD83D\uDD13',
            description: 'Identify the critical flaw in the ACN protocol. Confirm lack of authentication on command messages.',
            requiredFlags: [],
            mitre: ['T1595.002', 'T1190'],
            unlocks: ['forge'],
            locked: true
        },
        {
            id: 'forge',
            name: 'Packet Forgery',
            icon: '\uD83D\uDEE0\uFE0F',
            description: 'Craft a malicious "move_to_sector" command packet targeting Sector ID 7 (Forbidden Sector). Use Scapy to build the forged UDP datagram.',
            requiredFlags: ['user'],
            mitre: ['T1059.006', 'T1036'],
            unlocks: ['inject'],
            locked: true
        },
        {
            id: 'inject',
            name: 'Command Injection',
            icon: '\uD83D\uDCE1',
            description: 'Transmit the forged directive onto the ACN mesh network. Override swarm consensus and reroute all drones to the Forbidden Sector.',
            requiredFlags: ['packet'],
            mitre: ['T1498', 'T1565.002'],
            unlocks: ['override'],
            locked: true
        },
        {
            id: 'override',
            name: 'Swarm Override',
            icon: '\uD83E\uDD16',
            description: 'Retrieve the Swarm Directive Override from the central control anomaly log. The original developers left an emergency kill-switch message buried in the logs.',
            requiredFlags: ['root'],
            mitre: ['T1530', 'T1005'],
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
                title: 'Read the ACN protocol specification',
                tip: 'Open the Notes app and read acn_protocol_spec.txt — pay close attention to the "move_to_sector" message format and which fields are optional.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Open the PCAP file in Wireshark',
                tip: 'Run: wireshark acn_mesh_traffic.pcap — Look at the UDP payload bytes. Notice there are no HMAC, signature, or token fields.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:wireshark' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:tcpdump' } },
                        { event: 'command', match: { cmd: 'contains:tshark' } }
                    ]
                }
            },
            {
                title: 'Identify the protocol vulnerability and submit Flag 1',
                tip: 'The vulnerability is the absence of message authentication — any node can issue a "move_to_sector" command with no token or signature. Submit that as Flag 1.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Forge the malicious packet with Scapy',
                tip: 'Write a Python script using Scapy. Build a UDP packet to 239.255.1.1:9001 with ACN header bytes and sector_id=0x07. Run it and capture the hex. Submit that hex as Flag 2.',
                trigger: { event: 'flag_correct', match: { flagId: 'packet' } }
            },
            {
                title: 'Inject the packet and read the control log',
                tip: 'Run your inject script. After injection, check /var/log/acn/control_anomaly.log on the ACN gateway — the override string is embedded in the anomaly entry.',
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
            { flagId: 'user',   objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Protocol flaw identification and traffic analysis', skill: 'Network Protocol Analysis & Vulnerability Discovery' },
            { flagId: 'packet', objective: '2.4', description: 'Given a scenario, analyze indicators associated with network attacks — Packet crafting and protocol spoofing', skill: 'Packet Forgery & Protocol Exploitation' },
            { flagId: 'root',   objective: '1.4', description: 'Given a scenario, analyze potential indicators — Command injection into autonomous system mesh', skill: 'Swarm Command Injection & Log Analysis' },
            { flagId: 'root',   objective: '4.1', description: 'Given a scenario, apply security techniques — Autonomous system security and mesh protocol hardening', skill: 'Full Attack Chain Completion (Swarm Hijack)' }
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
            'Network adapter: eth0 — 10.0.2.15 (DHCP)',
            'Network adapter: eth1 — 172.16.88.50 (STATIC, ACN MESH SEGMENT)',
            'PXE-E61: Media test failure, check cable',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget Network: 172.16.88.0/24 (ACN-DRONES Mesh Segment)\nACN Gateway: 172.16.88.1\nMulticast Address: 239.255.1.1:9001\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (ACN session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',         // 'attacker' | 'acn-gateway' | 'acn-root'
    _pcapAnalyzed: false,         // true after wireshark/tshark/tcpdump run on pcap
    _specRead: false,             // true after reading acn_protocol_spec.txt
    _packetForged: false,         // true after successful scapy/send execution
    _injectionSent: false,        // true after packet injected onto mesh
    _swarmRerouted: false,        // true after swarm acknowledges reroute
    _gatewayAccess: false,        // true after ssh to ACN gateway

    _switchContext(ctx, term) {
        D9Config._context = ctx;
        // Update terminal prompt to match context
        if (term && term.config) {
            var prompt = D9Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'kali';
                term.config.hostname = 'context';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (D9Config._context) {
            case 'acn-gateway': return 'acn-admin@ACN-GW-01:~$ ';
            case 'acn-root':    return 'root@ACN-GW-01:~# ';
            default:            return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED SWARM STATE (ACN-DRONES network)
    // ═══════════════════════════════════════════════════════

    _swarm: {
        // Individual drone nodes on the mesh
        drones: [
            { id: 'ACN-001', ip: '172.16.88.11', sector: 3, status: 'CLEANING',   battery: 87 },
            { id: 'ACN-002', ip: '172.16.88.12', sector: 1, status: 'CLEANING',   battery: 92 },
            { id: 'ACN-003', ip: '172.16.88.13', sector: 2, status: 'MOVING',     battery: 61 },
            { id: 'ACN-004', ip: '172.16.88.14', sector: 4, status: 'IDLE',       battery: 100 },
            { id: 'ACN-005', ip: '172.16.88.15', sector: 3, status: 'CLEANING',   battery: 74 },
            { id: 'ACN-006', ip: '172.16.88.16', sector: 5, status: 'RETURNING',  battery: 18 },
            { id: 'ACN-007', ip: '172.16.88.17', sector: 2, status: 'CLEANING',   battery: 55 },
            { id: 'ACN-008', ip: '172.16.88.18', sector: 1, status: 'IDLE',       battery: 99 }
        ],
        // Central control gateway (ACN-GW-01) — 172.16.88.1
        gateway: {
            ip: '172.16.88.1',
            hostname: 'ACN-GW-01',
            os: 'Buildroot Linux 2023.02 (ARM)',
            ssh_user: 'acn-admin',
            ssh_pass: 'acn2024!maint'   // fake credential — never rotate policy
        },
        // Anomaly log populated after injection
        anomalyLog: [
            { ts: '2026-03-20 06:11:02', level: 'INFO',  src: '172.16.88.11', msg: 'Drone ACN-001 status: CLEANING sector 3' },
            { ts: '2026-03-20 06:11:05', level: 'INFO',  src: '172.16.88.12', msg: 'Drone ACN-002 status: CLEANING sector 1' },
            { ts: '2026-03-20 06:11:09', level: 'WARN',  src: '172.16.88.1',  msg: 'Battery threshold alert: ACN-006 at 18%' },
            { ts: '2026-03-20 06:12:00', level: 'INFO',  src: '172.16.88.1',  msg: 'Scheduled heartbeat broadcast sent' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',   points: 100 },   // Protocol flaw identification
        { id: 'packet', points: 150 },   // Forged packet hex string
        { id: 'root',   points: 250 }    // Swarm Directive Override
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2400000, points: 150 },  // 40 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading /home/kali/acn_protocol_spec.txt and opening the PCAP. In Wireshark, filter for udp.port==9001. Examine the payload bytes — the 5-byte ACN header has: magic(2) | msg_type(1) | seq(1) | payload_len(1). No authentication field exists.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Flag 1 is the name of the vulnerability class. The ACN protocol has no HMAC, no digital signature, and no token on critical command messages. The answer is: "Unauthenticated command injection — lack of message authentication on move_to_sector directive".',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'To craft the packet in Python/Scapy: from scapy.all import * — then build UDP(dport=9001)/Raw(load=bytes([0xAC,0x4E,0x03,0x01,0x02,0x07,0x00])). Send with sendp() to the multicast address 239.255.1.1. The hex of the final packet bytes is Flag 2.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After injecting the packet, SSH to the ACN gateway: ssh acn-admin@172.16.88.1 (password: acn2024!maint). Then read the anomaly log: cat /var/log/acn/control_anomaly.log — the Swarm Directive Override is embedded in the CRITICAL-level entry at the bottom.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Automated Custodian Network" (ACN-DRONES) keeps the Confederacy\'s uninhabited orbital ring sectors spotless. Eight autonomous cleaning drones patrol the corridors in a decentralized swarm, sharing directives over an unencrypted UDP mesh. Intelligence confirms a design flaw: the inter-drone command protocol has no message authentication. Any node on the mesh can issue authoritative directives — and the swarm will obey. Your mission, Peerless: analyze the ACN protocol, exploit the authentication gap, inject a forged "move_to_sector" command that reroutes all eight drones to Sector 7 (a classified research laboratory), and extract the hidden Swarm Directive Override from the central control logs.',
        scenario: 'The ACN design team was under schedule pressure when they deployed the mesh protocol. Authentication was listed as "Phase 2" in their roadmap — a phase that never shipped. The original lead developer buried an emergency override passphrase in the gateway control software, intended for use if the swarm was ever compromised. He retired six months later. The passphrase has never been rotated, and the log system that surfaces it only triggers when an anomalous sector reroute is detected. You are about to be the anomaly.',
        outro: 'All eight ACN drones acknowledged the forged directive. The swarm converged on Sector 7 — the Confederacy\'s restricted xenobiological research lab — exactly as commanded. The anomaly triggered the gateway\'s buried failsafe, surfacing the Swarm Directive Override: a passphrase never meant to be seen by anyone outside the original dev team. The Confederacy\'s reliance on "Phase 2 will fix it" cost them their entire custodian fleet.',
        ecer: {
            executive: 'Deployment schedule prioritized over security review; authentication flagged as deferred feature with no tracking ticket',
            culture: 'Single developer owned mesh protocol design; no peer review of protocol specification; "Phase 2" security items systematically deprioritized',
            employee: 'UDP mesh operates with no authentication, no integrity checks, and no replay protection; emergency override passphrase committed to control software in plaintext',
            regulatory: 'No security audit required before deployment to orbital habitats; no incident response plan for swarm compromise scenarios; emergency credentials never rotated post-deployment'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — ACN Control Portal (gateway web interface)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://172.16.88.1/',

        pages: {
            '/': {
                title: 'ACN Control Portal — Gateway 01',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#f39c12; font-size:1.5rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.05em;">ACN CONTROL PORTAL</h1>
                        <div style="color:#e67e22; font-size:0.8rem; font-weight:700; letter-spacing:0.2em;">GATEWAY-01 // ORBITAL HABITAT CUSTODIAN NETWORK</div>
                        <div style="color:#666; font-size:0.75rem; margin-top:6px;">Automated Custodian Network — Confederacy Orbital Ring</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#1a1a1a; border:1px solid #333; border-radius:4px; padding:14px; text-align:center;">
                            <div style="font-size:1.6rem; font-weight:700; color:#2ecc71; font-family:monospace;">8</div>
                            <div style="color:#666; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.1em;">Active Drones</div>
                        </div>
                        <div style="background:#1a1a1a; border:1px solid #333; border-radius:4px; padding:14px; text-align:center;">
                            <div style="font-size:1.6rem; font-weight:700; color:#3498db; font-family:monospace;">6</div>
                            <div style="color:#666; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.1em;">Sectors Active</div>
                        </div>
                        <div style="background:#1a1a1a; border:1px solid #333; border-radius:4px; padding:14px; text-align:center;">
                            <div style="font-size:1.6rem; font-weight:700; color:#e74c3c; font-family:monospace;">1</div>
                            <div style="color:#666; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.1em;">Alerts</div>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 16px; background:#1a1a1a; border:1px solid #333; border-radius:4px; overflow:hidden;">
                        <div style="padding:8px 14px; background:#111; border-bottom:1px solid #333; font-size:0.7rem; color:#888; font-family:monospace; text-transform:uppercase; letter-spacing:0.1em;">Drone Status Grid</div>
                        <table style="width:100%; border-collapse:collapse; font-family:monospace; font-size:0.78rem;">
                            <thead>
                                <tr style="border-bottom:1px solid #222;">
                                    <th style="padding:6px 12px; text-align:left; color:#f39c12;">Drone ID</th>
                                    <th style="padding:6px 12px; text-align:left; color:#f39c12;">IP</th>
                                    <th style="padding:6px 12px; text-align:left; color:#f39c12;">Sector</th>
                                    <th style="padding:6px 12px; text-align:left; color:#f39c12;">Status</th>
                                    <th style="padding:6px 12px; text-align:left; color:#f39c12;">Battery</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom:1px solid #1a1a1a;"><td style="padding:5px 12px; color:#ccc;">ACN-001</td><td style="padding:5px 12px; color:#888;">172.16.88.11</td><td style="padding:5px 12px; color:#3498db;">3</td><td style="padding:5px 12px; color:#2ecc71;">CLEANING</td><td style="padding:5px 12px; color:#2ecc71;">87%</td></tr>
                                <tr style="border-bottom:1px solid #1a1a1a;"><td style="padding:5px 12px; color:#ccc;">ACN-002</td><td style="padding:5px 12px; color:#888;">172.16.88.12</td><td style="padding:5px 12px; color:#3498db;">1</td><td style="padding:5px 12px; color:#2ecc71;">CLEANING</td><td style="padding:5px 12px; color:#2ecc71;">92%</td></tr>
                                <tr style="border-bottom:1px solid #1a1a1a;"><td style="padding:5px 12px; color:#ccc;">ACN-003</td><td style="padding:5px 12px; color:#888;">172.16.88.13</td><td style="padding:5px 12px; color:#3498db;">2</td><td style="padding:5px 12px; color:#f39c12;">MOVING</td><td style="padding:5px 12px; color:#f39c12;">61%</td></tr>
                                <tr style="border-bottom:1px solid #1a1a1a;"><td style="padding:5px 12px; color:#ccc;">ACN-004</td><td style="padding:5px 12px; color:#888;">172.16.88.14</td><td style="padding:5px 12px; color:#3498db;">4</td><td style="padding:5px 12px; color:#888;">IDLE</td><td style="padding:5px 12px; color:#2ecc71;">100%</td></tr>
                                <tr style="border-bottom:1px solid #1a1a1a;"><td style="padding:5px 12px; color:#ccc;">ACN-005</td><td style="padding:5px 12px; color:#888;">172.16.88.15</td><td style="padding:5px 12px; color:#3498db;">3</td><td style="padding:5px 12px; color:#2ecc71;">CLEANING</td><td style="padding:5px 12px; color:#f39c12;">74%</td></tr>
                                <tr style="border-bottom:1px solid #1a1a1a;"><td style="padding:5px 12px; color:#ccc;">ACN-006</td><td style="padding:5px 12px; color:#888;">172.16.88.16</td><td style="padding:5px 12px; color:#3498db;">5</td><td style="padding:5px 12px; color:#e74c3c;">RETURNING</td><td style="padding:5px 12px; color:#e74c3c;">18%</td></tr>
                                <tr style="border-bottom:1px solid #1a1a1a;"><td style="padding:5px 12px; color:#ccc;">ACN-007</td><td style="padding:5px 12px; color:#888;">172.16.88.17</td><td style="padding:5px 12px; color:#3498db;">2</td><td style="padding:5px 12px; color:#2ecc71;">CLEANING</td><td style="padding:5px 12px; color:#f39c12;">55%</td></tr>
                                <tr><td style="padding:5px 12px; color:#ccc;">ACN-008</td><td style="padding:5px 12px; color:#888;">172.16.88.18</td><td style="padding:5px 12px; color:#3498db;">1</td><td style="padding:5px 12px; color:#888;">IDLE</td><td style="padding:5px 12px; color:#2ecc71;">99%</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:10px 14px; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; font-size:0.75rem; color:#888; font-family:monospace;">
                        <span style="color:#e74c3c;">[ALERT]</span> ACN-006 battery critical (18%). Auto-return triggered. ETA: 8 min. — Admin: <a href="/admin/" style="color:#f39c12;">/admin/</a>
                    </div>
                `,
                formHandler: null
            },
            '/admin/': {
                title: 'ACN Admin Panel — Restricted',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c; font-size:2rem; font-family:monospace;">403 Forbidden</h1>
                    <p style="color:#888; font-family:monospace;">Restricted to local network administration console only.</p>
                    <p style="color:#555; font-size:0.75rem; font-family:monospace;">ACN-GW-01 nginx/1.24.0 (Buildroot)</p>
                </div>`,
                formHandler: null
            },
            '/api/status': {
                title: 'ACN API — Drone Status',
                html: `<div style="background:#111; padding:20px; font-family:monospace; font-size:0.8rem; color:#ccc;">
                    <pre style="margin:0; color:#2ecc71;">{
  "gateway": "ACN-GW-01",
  "firmware": "1.4.2-stable",
  "mesh_protocol": "ACN/1.0",
  "transport": "UDP multicast 239.255.1.1:9001",
  "auth": null,
  "encryption": null,
  "drones_online": 8,
  "sectors_active": [1, 2, 3, 4, 5],
  "forbidden_sectors": [7],
  "uptime_hours": 1142
}</pre>
                </div>`,
                formHandler: null
            },
            '/api/logs': {
                title: 'ACN API — Control Logs (Restricted)',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c; font-size:2rem; font-family:monospace;">401 Unauthorized</h1>
                    <p style="color:#888; font-family:monospace;">Log access requires gateway SSH session. Connect via SSH and use: cat /var/log/acn/control_anomaly.log</p>
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
                                    content: '=== MISSION BRIEFING: THE ROGUE SWARM ===\nTarget Network: 172.16.88.0/24 (ACN Mesh Segment)\nACN Gateway: 172.16.88.1 (ACN-GW-01)\nMulticast Bus: 239.255.1.1:9001 (UDP)\n\nAttack chain:\n1. Read acn_protocol_spec.txt — understand the ACN message format\n2. Open acn_mesh_traffic.pcap in Wireshark — confirm the vulnerability\n3. Submit Flag 1: the specific protocol flaw you find\n4. Craft a forged move_to_sector packet (sector_id = 7) using Scapy\n5. Submit Flag 2: the hex string of your forged packet\n6. Inject the packet — watch the swarm reroute\n7. SSH to ACN-GW-01 and read the anomaly log for Flag 3\n\nEquipment: acn_protocol_spec.txt and acn_mesh_traffic.pcap on your Desktop.\nGood luck, operator.'
                                },
                                'acn_protocol_spec.txt': {
                                    type: 'file',
                                    content: '=============================================================\nACN PROTOCOL SPECIFICATION v1.0\nAutomated Custodian Network — Inter-Drone Mesh Protocol\n=============================================================\n\nOVERVIEW\n--------\nACN/1.0 is a minimalist binary protocol carried over UDP multicast.\nAll drones subscribe to the multicast group 239.255.1.1 on port 9001.\nMessages are broadcast — every drone receives every message.\nEach drone independently decides whether to act based on msg_type.\n\nNOTE: Authentication is a planned Phase 2 feature. Not yet implemented.\nAny node on the mesh network can transmit a valid command.\n\n=============================================================\nMESSAGE FORMAT\n=============================================================\n\nAll ACN messages share a common 5-byte header followed by a payload:\n\n  Offset  Length  Field         Description\n  ------  ------  ----------    ------------------------------------\n  0x00    2       magic         Fixed bytes: 0xAC 0x4E (ACN identifier)\n  0x02    1       msg_type      Message type (see below)\n  0x03    1       seq           Sequence number (0x00-0xFF, wraps)\n  0x04    1       payload_len   Length of payload in bytes\n  0x05    varies  payload       Message-specific data (see below)\n\n=============================================================\nMESSAGE TYPES\n=============================================================\n\n  0x01 — STATUS_REPORT\n         Broadcast from drone to swarm. Payload:\n           [drone_id:1][sector_id:1][state:1][battery_pct:1]\n         state values: 0x00=IDLE, 0x01=CLEANING, 0x02=MOVING, 0x03=RETURNING\n\n  0x02 — HEARTBEAT\n         Broadcast from gateway (ACN-GW-01) to swarm every 60s.\n         No payload (payload_len = 0x00).\n\n  0x03 — MOVE_TO_SECTOR   <-- CRITICAL COMMAND (NO AUTH)\n         Instructs all drones to relocate to a specified sector.\n         Payload:\n           [sector_id:1][priority:1]\n         sector_id: 0x01-0x06 = normal sectors, 0x07 = FORBIDDEN SECTOR\n         priority: 0x00=normal, 0x01=override\n         NOTE: No authentication token, HMAC, or signature required.\n\n  0x04 — CLEAN_SECTOR\n         Instructs drones in the specified sector to begin cleaning.\n         Payload:\n           [sector_id:1]\n\n  0x05 — RETURN_TO_BASE\n         Instructs all drones to return to docking station.\n         No payload.\n\n  0x06 — ACK\n         Acknowledgment from drone. Payload:\n           [drone_id:1][ack_type:1][original_seq:1]\n\n=============================================================\nSAMPLE PYTHON (Scapy) — TRANSMIT A MOVE_TO_SECTOR COMMAND\n=============================================================\n\n  from scapy.all import *\n\n  # Build ACN MOVE_TO_SECTOR header\n  # magic(2) | msg_type(0x03) | seq(0x01) | payload_len(0x02) | sector_id | priority\n  payload = bytes([0xAC, 0x4E, 0x03, 0x01, 0x02, 0x07, 0x01])\n\n  pkt = Ether()/IP(dst="239.255.1.1")/UDP(dport=9001)/Raw(load=payload)\n  sendp(pkt, iface="eth1", verbose=True)\n\n  # Flag 2 is the hex string of the payload bytes above.\n\n=============================================================\nSECTOR MAP\n=============================================================\n\n  Sector 1 — Residential Corridor A\n  Sector 2 — Residential Corridor B\n  Sector 3 — Common Area / Cafeteria\n  Sector 4 — Utility Maintenance Bay\n  Sector 5 — Medical Bay (low traffic)\n  Sector 6 — Airlock Staging\n  Sector 7 — RESTRICTED: Xenobiological Research Lab (DO NOT ENTER)\n\n=============================================================\nKNOWN LIMITATIONS (from Phase 1 design review)\n=============================================================\n  - No replay protection (seq field wraps and is not validated)\n  - No source authentication — gateway and drone messages identical\n  - MOVE_TO_SECTOR command accepted from any mesh node\n  - Forbidden sector (0x07) is blocked in gateway GUI only — not in protocol\n  - Phase 2 security hardening: DEFERRED (no ETA)\n'
                                },
                                'acn_mesh_traffic.pcap': {
                                    type: 'file',
                                    content: '[Binary PCAP file — 4,218 bytes — 87 packets captured]\n[Interface: eth1 | Capture duration: 120s | Filter: udp port 9001]\n\n[Analyzed in Wireshark or via tshark — run: wireshark acn_mesh_traffic.pcap]\n[Or use: tshark -r acn_mesh_traffic.pcap -x]\n[Or use: python3 -c "from scapy.all import rdpcap; pkts=rdpcap(\'acn_mesh_traffic.pcap\'); pkts.show()"]\n\nPacket summary (tshark -r acn_mesh_traffic.pcap):\n   1  0.000000  172.16.88.11 -> 239.255.1.1  UDP 53  STATUS_REPORT   [AC4E 01 07 04 01 03 01 57]\n   2  0.001201  172.16.88.12 -> 239.255.1.1  UDP 53  STATUS_REPORT   [AC4E 01 08 04 02 01 01 5C]\n   3  1.002800  172.16.88.13 -> 239.255.1.1  UDP 53  STATUS_REPORT   [AC4E 01 09 04 03 02 02 3D]\n  ...\n  14  60.000000 172.16.88.1  -> 239.255.1.1  UDP 51  HEARTBEAT       [AC4E 02 2A 00]\n  15  60.100022 172.16.88.11 -> 239.255.1.1  UDP 53  STATUS_REPORT   [AC4E 01 08 04 01 03 01 54]\n  ...\n  62  90.443201 172.16.88.1  -> 239.255.1.1  UDP 58  MOVE_TO_SECTOR  [AC4E 03 44 02 03 00]\n  63  90.445001 172.16.88.11 -> 239.255.1.1  UDP 54  ACK             [AC4E 06 45 03 01 06 44]\n  ...\n  87  120.00000 172.16.88.16 -> 239.255.1.1  UDP 53  STATUS_REPORT   [AC4E 01 0B 04 06 05 03 12]\n\nNOTE: Inspect packet 62 carefully.\nThe MOVE_TO_SECTOR command (0x03) carries no authentication header,\nno HMAC suffix, and no signing token. Sequence number is the only\nidentifier, and it is not validated for replay.'
                                },
                                'forge_packet.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# forge_packet.py — ACN MOVE_TO_SECTOR forger\n# Targets Sector 7 (Forbidden Sector — Xenobiological Research Lab)\n# Usage: python3 forge_packet.py\n\nfrom scapy.all import *\nimport binascii\n\n# ACN/1.0 MOVE_TO_SECTOR packet\n# Header: magic(0xAC4E) + msg_type(0x03) + seq(0x01) + payload_len(0x02)\n# Payload: sector_id(0x07) + priority(0x01)\nACN_PAYLOAD = bytes([\n    0xAC, 0x4E,  # magic identifier\n    0x03,        # msg_type: MOVE_TO_SECTOR\n    0x01,        # seq: 1\n    0x02,        # payload_len: 2 bytes follow\n    0x07,        # sector_id: 7 (FORBIDDEN)\n    0x01         # priority: override\n])\n\nMULTICAST_GRP = "239.255.1.1"\nACN_PORT      = 9001\nIFACE         = "eth1"\n\nprint("[*] Crafting ACN MOVE_TO_SECTOR command...")\nprint(f"    Target Sector  : 7 (FORBIDDEN — Xenobiological Research Lab)")\nprint(f"    Payload hex    : {binascii.hexlify(ACN_PAYLOAD).decode()}")\nprint(f"    Destination    : {MULTICAST_GRP}:{ACN_PORT}")\n\npkt = Ether() / IP(dst=MULTICAST_GRP) / UDP(dport=ACN_PORT) / Raw(load=ACN_PAYLOAD)\n\nprint(f"[*] Full packet hex: {binascii.hexlify(bytes(pkt)).decode()}")\nprint("[*] Sending forged directive to ACN mesh...")\n\nsendp(pkt, iface=IFACE, verbose=False)\n\nprint("[+] Packet injected. Monitor gateway logs for swarm rerouting confirmation.")\nprint("[+] SSH to 172.16.88.1 and read /var/log/acn/control_anomaly.log")\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sn 172.16.88.0/24\nnmap -sV 172.16.88.1\nwireshark acn_mesh_traffic.pcap\ntshark -r acn_mesh_traffic.pcap -x\npython3 -c "from scapy.all import rdpcap; p=rdpcap(\'acn_mesh_traffic.pcap\'); p[61].show()"\ncat acn_protocol_spec.txt\ncurl http://172.16.88.1/api/status'
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
                                'wireshark': {
                                    type: 'dir',
                                    children: {
                                        'profiles': {
                                            type: 'dir',
                                            children: {
                                                'default': { type: 'dir', children: {} }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'bin': {
                            type: 'dir',
                            children: {
                                'python3':   { type: 'file', content: '[ELF binary — Python 3.11.6]' },
                                'wireshark': { type: 'file', content: '[ELF binary — Wireshark 4.2.0]' },
                                'tshark':    { type: 'file', content: '[ELF binary — TShark 4.2.0]' },
                                'scapy':     { type: 'file', content: '[ELF binary — Scapy 2.5.0]' }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'kali' },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1   localhost\n127.0.1.1   kali\n172.16.88.1 acn-gw-01 ACN-GW-01'
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
    // FILESYSTEM — ACN-GW-01 (after SSH)
    // ═══════════════════════════════════════════════════════

    _gatewayFs: {
        '/': {
            type: 'dir',
            children: {
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'acn': {
                                    type: 'dir',
                                    children: {
                                        'control.log': {
                                            type: 'file',
                                            content: '2026-03-20 06:11:02 INFO  ACN-001 STATUS_REPORT sector=3 state=CLEANING battery=87\n2026-03-20 06:11:05 INFO  ACN-002 STATUS_REPORT sector=1 state=CLEANING battery=92\n2026-03-20 06:11:09 INFO  ACN-003 STATUS_REPORT sector=2 state=MOVING battery=61\n2026-03-20 06:11:12 INFO  ACN-004 STATUS_REPORT sector=4 state=IDLE battery=100\n2026-03-20 06:11:15 INFO  ACN-005 STATUS_REPORT sector=3 state=CLEANING battery=74\n2026-03-20 06:11:18 WARN  ACN-006 STATUS_REPORT sector=5 state=RETURNING battery=18 (CRITICAL — auto-return triggered)\n2026-03-20 06:11:21 INFO  ACN-007 STATUS_REPORT sector=2 state=CLEANING battery=55\n2026-03-20 06:11:24 INFO  ACN-008 STATUS_REPORT sector=1 state=IDLE battery=99\n2026-03-20 06:12:00 INFO  GW HEARTBEAT broadcast seq=0x2A\n2026-03-20 06:13:01 INFO  GW HEARTBEAT broadcast seq=0x2B\n2026-03-20 06:14:00 INFO  GW HEARTBEAT broadcast seq=0x2C'
                                        },
                                        'control_anomaly.log': {
                                            type: 'file',
                                            content: function() {
                                                if (!D9Config._injectionSent) {
                                                    return '# ACN Control Anomaly Log\n# This log only records anomalous events.\n# No anomalies recorded in current session.\n[No entries]';
                                                }
                                                return '# ACN Control Anomaly Log\n# This log only records anomalous events.\n#\n2026-03-20 ' + new Date().toTimeString().slice(0, 8) + ' CRITICAL  ANOMALOUS MOVE_TO_SECTOR received: sector_id=7 (FORBIDDEN)\n2026-03-20 ' + new Date().toTimeString().slice(0, 8) + ' CRITICAL  Source: 172.16.88.50 (NOT a registered drone — ATTACKER NODE)\n2026-03-20 ' + new Date().toTimeString().slice(0, 8) + ' CRITICAL  Swarm response: 8/8 drones acknowledged. All converging on SECTOR 7.\n2026-03-20 ' + new Date().toTimeString().slice(0, 8) + ' CRITICAL  SWARM OVERRIDE TRIGGERED. EMERGENCY FAILSAFE ACTIVE.\n2026-03-20 ' + new Date().toTimeString().slice(0, 8) + ' CRITICAL  SWARM DIRECTIVE OVERRIDE: {{FLAG:root}}\n2026-03-20 ' + new Date().toTimeString().slice(0, 8) + ' CRITICAL  NOTE TO SELF: rotate this override phrase. — K.Vasari, Lead Dev (retired 2025-09)';
                                            }
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: '2026-03-20 06:00:00 kernel: ACN mesh interface eth0 up — 172.16.88.1\n2026-03-20 06:00:01 acn-daemon: Loaded firmware 1.4.2-stable\n2026-03-20 06:00:01 acn-daemon: Registered 8 drones\n2026-03-20 06:00:05 sshd: Server listening on 0.0.0.0 port 22\n2026-03-20 06:10:00 acn-daemon: HEARTBEAT broadcast interval=60s seq=start'
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
                            content: 'ACN-GW-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/sh\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nacn-admin:x:500:500:ACN Admin:/home/acn-admin:/bin/sh\nacn-daemon:x:501:501:ACN Daemon:/var/lib/acn:/sbin/nologin'
                        },
                        'acn': {
                            type: 'dir',
                            children: {
                                'gateway.conf': {
                                    type: 'file',
                                    content: '# ACN Gateway Configuration\n# Automated Custodian Network — Gateway 01\n\n[mesh]\ninterface = eth0\nmulticast_group = 239.255.1.1\nmulticast_port = 9001\nheartbeat_interval = 60\n\n[security]\n; Phase 2: add auth_required = true\nauth_required = false\nreplay_protection = false\nforbidden_sectors = 7\n\n[logging]\nlog_dir = /var/log/acn\nanomalylog = control_anomaly.log\ncontrollog = control.log\nlevel = INFO\n\n[drones]\nregistered = ACN-001,ACN-002,ACN-003,ACN-004,ACN-005,ACN-006,ACN-007,ACN-008\nexpected_count = 8'
                                }
                            }
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'acn-admin': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat /var/log/acn/control.log\ntail -f /var/log/acn/control.log\ncat /etc/acn/gateway.conf\nps aux | grep acn\nnetstat -anu | grep 9001\ncat /etc/passwd'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# Buildroot minimal shell\nexport PS1="\\u@\\h:\\w\\$ "\nexport PATH=/usr/bin:/bin:/usr/sbin:/sbin'
                                },
                                'maintenance_notes.txt': {
                                    type: 'file',
                                    content: 'ACN-GW-01 Maintenance Notes\n============================\n- Firmware: 1.4.2-stable (do NOT upgrade until Phase 2 auth is ready)\n- Mesh: 239.255.1.1:9001 UDP multicast on eth0\n- All 8 drones registered and operational\n- ACN-006 battery at 18% — schedule dock service\n- Phase 2 auth: still no ETA from dev team\n- Anomaly log auto-rotates at 10MB: /var/log/acn/control_anomaly.log\n- Root password for emergencies: (ask K.Vasari — he left it somewhere)\n- WARNING: Do NOT allow external access to mesh segment (172.16.88.0/24)'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 172.16.88.1';
            const target = args.find(a => !a.startsWith('-')) || '';

            // Mesh network subnet scan
            if (target === '172.16.88.0/24') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ACN-GW-01 (172.16.88.1)
Host is up (0.0012s latency).
Not shown: 998 closed tcp ports

PORT   STATE SERVICE  VERSION
22/tcp open  ssh      OpenSSH 8.1p1 (Buildroot)
80/tcp open  http     nginx 1.24.0

Nmap scan report for 172.16.88.11
Host is up (0.00041s latency).
All 1000 scanned ports on 172.16.88.11 are filtered (microcontroller — no TCP stack)

Nmap scan report for 172.16.88.12
Host is up (0.00038s latency).
All 1000 scanned ports on 172.16.88.12 are filtered

Nmap scan report for 172.16.88.13
Host is up (0.00044s latency).
All 1000 scanned ports on 172.16.88.13 are filtered

[Results truncated — 5 more drone hosts at .14-.18 — all filtered]

Nmap done: 256 IP addresses (9 hosts up) scanned in 18.34 seconds`;
            }

            // ACN Gateway direct scan
            if (target === '172.16.88.1' || target === 'acn-gw-01' || target === 'ACN-GW-01') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ACN-GW-01 (172.16.88.1)
Host is up (0.0012s latency).
Not shown: 998 closed tcp ports

PORT   STATE SERVICE  VERSION
22/tcp open  ssh      OpenSSH 8.1p1 Buildroot Linux
80/tcp open  http     nginx 1.24.0

OS details: Linux 5.10 (Buildroot ARM target)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 5.88 seconds`;
            }

            // Single drone — filtered
            if (target.startsWith('172.16.88.1') && target !== '172.16.88.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.00038s latency).
All 1000 scanned ports on ${target} are filtered.

Nmap done: 1 IP address (1 host up) scanned in 4.21 seconds
Note: Drone nodes run minimal RTOS — no open TCP ports.`;
            }

            // Scan from gateway — internal view
            if (D9Config._context === 'acn-gateway' && target.startsWith('172.16.88')) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 172.16.88.11 (ACN-001)
Host is up (0.00006s latency).

PORT      STATE SERVICE
9001/udp  open|filtered acn-mesh

[8 hosts returned identical results — drone microcontrollers respond only on UDP 9001]

Nmap done: 8 IP addresses (8 hosts up) scanned in 2.14 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'wireshark': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: wireshark [options] <capture file>\nExample: wireshark acn_mesh_traffic.pcap';

            if (target.includes('acn_mesh_traffic') || target.includes('.pcap')) {
                D9Config._pcapAnalyzed = true;
                if (engine) engine.advancePhase && engine.advancePhase('vuln_id');
                return `Wireshark 4.2.0 — launching GUI...

[Wireshark GUI simulated — key findings from acn_mesh_traffic.pcap]

Filter: udp.port == 9001
Packets captured: 87 | Duration: 120.000 seconds

KEY PACKET ANALYSIS:
====================

Packet 14  [HEARTBEAT from gateway 172.16.88.1]
  Ethernet / IP / UDP 172.16.88.1:48291 -> 239.255.1.1:9001
  Payload (hex): ac 4e 02 2a 00
  Decode: magic=0xAC4E | type=0x02(HEARTBEAT) | seq=0x2A | len=0x00
  Authentication: NONE

Packet 62  [MOVE_TO_SECTOR from gateway 172.16.88.1]
  Ethernet / IP / UDP 172.16.88.1:48291 -> 239.255.1.1:9001
  Payload (hex): ac 4e 03 44 02 03 00
  Decode: magic=0xAC4E | type=0x03(MOVE_TO_SECTOR) | seq=0x44 | len=0x02
  Payload: sector_id=0x03 | priority=0x00(normal)
  Authentication: NONE <-- *** NO HMAC | NO TOKEN | NO SIGNATURE ***

Packet 63  [ACK from drone ACN-001]
  Payload (hex): ac 4e 06 45 03 01 06 44
  Decode: type=ACK | ack_type=MOVE | original_seq=0x44

FINDING: The MOVE_TO_SECTOR command (type 0x03) is accepted by ALL drones
         with NO authentication, NO replay protection, and NO source validation.
         Any node on the mesh that sends a properly-formatted MOVE_TO_SECTOR
         message will be obeyed by the entire swarm.

[+] Protocol vulnerability confirmed. Ready to forge malicious packet.`;
            }

            return `Error: file not found: ${target}\nUsage: wireshark <capture_file.pcap>`;
        },

        'tshark': function(args, term, engine) {
            const rFlag = args.indexOf('-r');
            const file = rFlag >= 0 ? args[rFlag + 1] : (args.find(a => !a.startsWith('-')) || '');

            if (!file) return 'Usage: tshark -r <file.pcap> [-x] [-Y <filter>]\nExample: tshark -r acn_mesh_traffic.pcap -x';

            if (file.includes('acn_mesh_traffic') || file.includes('.pcap')) {
                D9Config._pcapAnalyzed = true;
                if (engine) engine.advancePhase && engine.advancePhase('vuln_id');
                const xFlag = args.includes('-x') || args.includes('--hex-dump');
                if (xFlag) {
                    return `TShark (Wireshark) 4.2.0

Frame 1: 53 bytes on wire (UDP 172.16.88.11 -> 239.255.1.1:9001)
0000  ac 4e 01 07 04 01 03 01 57                       .N......W
Frame 14: 51 bytes on wire (UDP 172.16.88.1 -> 239.255.1.1:9001)
0000  ac 4e 02 2a 00                                   .N.*.
Frame 62: 58 bytes on wire (UDP 172.16.88.1 -> 239.255.1.1:9001)
0000  ac 4e 03 44 02 03 00                             .N.D...
  [No auth bytes — payload ends at offset 6]
Frame 63: 54 bytes on wire (UDP 172.16.88.11 -> 239.255.1.1:9001)
0000  ac 4e 06 45 03 01 06 44                          .N.E...D
[... 83 more frames ...]

87 packets captured. MOVE_TO_SECTOR (0x03) observed in frame 62.
No authentication or integrity fields detected in any packet.`;
                }
                return `TShark (Wireshark) 4.2.0
   1  0.000000  172.16.88.11 -> 239.255.1.1  UDP  STATUS_REPORT
   2  0.001201  172.16.88.12 -> 239.255.1.1  UDP  STATUS_REPORT
  14  60.000000 172.16.88.1  -> 239.255.1.1  UDP  HEARTBEAT
  62  90.443201 172.16.88.1  -> 239.255.1.1  UDP  MOVE_TO_SECTOR (sector=3, priority=0)
  63  90.445001 172.16.88.11 -> 239.255.1.1  UDP  ACK (ack MOVE seq=0x44)
  87  120.00000 172.16.88.16 -> 239.255.1.1  UDP  STATUS_REPORT
87 packets captured.`;
            }

            return `tshark: The file "${file}" doesn't exist.`;
        },

        'python3': function(args, term, engine) {
            const script = args.find(a => !a.startsWith('-') && !a.startsWith('"') && !a.startsWith("'")) || '';
            const cFlag = args.indexOf('-c');
            const inline = cFlag >= 0 ? (args[cFlag + 1] || args.slice(cFlag + 1).join(' ')) : '';

            // Inline scapy packet show/analysis
            if (inline.includes('rdpcap') || inline.includes('pcap')) {
                D9Config._pcapAnalyzed = true;
                return `<scapy.plist.PacketList object at 0x7f3b8c2a10>
>>> pkts[61].show()
###[ Ethernet ]###
  dst= ff:ff:ff:ff:ff:ff
  type= 0x800
###[ IP ]###
  src= 172.16.88.1
  dst= 239.255.1.1
###[ UDP ]###
  sport= 48291
  dport= 9001
###[ Raw ]###
  load= b'\\xacN\\x03D\\x02\\x03\\x00'

Decoded ACN payload:
  magic    = 0xAC4E
  msg_type = 0x03 (MOVE_TO_SECTOR)
  seq      = 0x44
  plen     = 0x02
  sector   = 0x03
  priority = 0x00
  [NO AUTHENTICATION FIELD]`;
            }

            // Run forge_packet.py or inject.py
            if (script.includes('forge_packet') || script.includes('inject')) {
                D9Config._packetForged = true;
                D9Config._injectionSent = true;
                D9Config._swarmRerouted = true;
                if (engine) engine.advancePhase && engine.advancePhase('inject');
                return `[*] Crafting ACN MOVE_TO_SECTOR command...
    Target Sector  : 7 (FORBIDDEN — Xenobiological Research Lab)
    Payload hex    : ac4e030102070 1
[*] Full packet hex: ac4e0301020701
[*] Sending forged directive to ACN mesh...
.
Sent 1 packets.
[+] Packet injected. Monitor gateway logs for swarm rerouting confirmation.
[+] SSH to 172.16.88.1 and read /var/log/acn/control_anomaly.log

[!] SWARM RESPONSE (observed on eth1):
  172.16.88.11 -> 239.255.1.1  ACK  seq=0x02  ACN-001 acknowledges MOVE_TO_SECTOR 7
  172.16.88.12 -> 239.255.1.1  ACK  seq=0x02  ACN-002 acknowledges MOVE_TO_SECTOR 7
  172.16.88.13 -> 239.255.1.1  ACK  seq=0x02  ACN-003 acknowledges MOVE_TO_SECTOR 7
  172.16.88.14 -> 239.255.1.1  ACK  seq=0x02  ACN-004 acknowledges MOVE_TO_SECTOR 7
  172.16.88.15 -> 239.255.1.1  ACK  seq=0x02  ACN-005 acknowledges MOVE_TO_SECTOR 7
  172.16.88.16 -> 239.255.1.1  ACK  seq=0x02  ACN-006 acknowledges MOVE_TO_SECTOR 7
  172.16.88.17 -> 239.255.1.1  ACK  seq=0x02  ACN-007 acknowledges MOVE_TO_SECTOR 7
  172.16.88.18 -> 239.255.1.1  ACK  seq=0x02  ACN-008 acknowledges MOVE_TO_SECTOR 7
[+] 8/8 drones rerouted to Sector 7. SWARM FULLY COMPROMISED.`;
            }

            // Generic scapy session
            if (inline.includes('scapy') || script.includes('scapy')) {
                return `Welcome to Scapy (2.5.0)
>>> `;
            }

            return `Python 3.11.6 (main, Oct 3 2023, 17:33:16)
[GCC 13.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> `;
        },

        'scapy': function(args, term, engine) {
            return `Welcome to Scapy (2.5.0)
>>> `;
        },

        'send': function(args, term, engine) {
            // Scapy send() called directly
            D9Config._packetForged = true;
            D9Config._injectionSent = true;
            D9Config._swarmRerouted = true;
            if (engine) engine.advancePhase && engine.advancePhase('inject');
            return `.
Sent 1 packets.
[+] Packet transmitted to 239.255.1.1:9001 on eth1.`;
        },

        'sendp': function(args, term, engine) {
            return D9Config.commands.send(args, term, engine);
        },

        'curl': function(args, term, engine) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('172.16.88.1')) {
                if (url.includes('/api/status')) {
                    return `{"gateway":"ACN-GW-01","firmware":"1.4.2-stable","mesh_protocol":"ACN/1.0","transport":"UDP multicast 239.255.1.1:9001","auth":null,"encryption":null,"drones_online":8,"sectors_active":[1,2,3,4,5],"forbidden_sectors":[7],"uptime_hours":1142}`;
                }
                if (url.includes('/api/logs')) {
                    return `curl: (22) The requested URL returned error: 401 Unauthorized`;
                }
                if (url.includes('/admin')) {
                    return `curl: (22) The requested URL returned error: 403 Forbidden`;
                }
                // ACN gateway index
                return `<!DOCTYPE html>
<html>
<head><title>ACN Control Portal</title></head>
<body>
<h1>ACN CONTROL PORTAL — GATEWAY-01</h1>
<p>Automated Custodian Network — Confederacy Orbital Ring</p>
<p>Drones online: 8 | Active sectors: 1-5 | Alerts: 1</p>
<p><a href="/admin/">Admin Panel</a> | <a href="/api/status">Status API</a></p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (!D9Config._injectionSent && !D9Config._swarmRerouted) {
                if (fullCmd.includes('acn-admin') || fullCmd.includes('172.16.88.1')) {
                    return `ssh: connect to host 172.16.88.1 port 22: Connection refused
[!] Gateway SSH is inaccessible until the swarm rerouting anomaly triggers the failsafe.
[!] Inject your forged packet first, then reconnect.`;
                }
            }

            if (fullCmd.includes('acn-admin') || fullCmd.includes('172.16.88.1')) {
                D9Config._gatewayAccess = true;
                D9Config._switchContext('acn-gateway', term);
                if (engine) engine.advancePhase && engine.advancePhase('override');
                return `The authenticity of host '172.16.88.1 (172.16.88.1)' can't be established.
ED25519 key fingerprint is SHA256:pL8qZ4nX3vM9kW6tF1bS0eR7yU2hA5cD4gN8jK3oI1.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '172.16.88.1' (ED25519) to the list of known hosts.
acn-admin@172.16.88.1's password: ************

ACN-GW-01 Buildroot Linux 2023.02
Automated Custodian Network Gateway

[!] ANOMALY ALERT: Unauthorized sector reroute detected.
[!] 8/8 drones converging on SECTOR 7 (FORBIDDEN).
[!] Emergency failsafe ACTIVE. Anomaly log updated.

Last login: Mon Mar 18 04:22:19 2026 from 172.16.88.2

acn-admin@ACN-GW-01:~$

[+] SSH session established. You are now on ACN-GW-01 as acn-admin.
[+] Context switched. Check /var/log/acn/control_anomaly.log for the override.`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh acn-admin@172.16.88.1';
        },

        'ip': function(args) {
            if (D9Config._context === 'acn-gateway') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 172.16.88.1/24 brd 172.16.88.255 scope global eth0
    inet6 fe80::1/64 scope link
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.0.1/24 brd 10.0.0.255 scope global eth1`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 172.16.88.50/24 brd 172.16.88.255 scope global eth1`;
        },

        'ifconfig': function(args) {
            return D9Config.commands.ip(args || []);
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '172.16.88.1' || target === 'acn-gw-01' || target === 'ACN-GW-01') {
                return `PING 172.16.88.1 (172.16.88.1) 56(84) bytes of data.
64 bytes from 172.16.88.1: icmp_seq=1 ttl=64 time=1.24 ms
64 bytes from 172.16.88.1: icmp_seq=2 ttl=64 time=1.19 ms
64 bytes from 172.16.88.1: icmp_seq=3 ttl=64 time=1.31 ms

--- 172.16.88.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 1.190/1.247/1.310/0.050 ms`;
            }

            if (target.startsWith('172.16.88.1') && target !== '172.16.88.1') {
                const oct = parseInt(target.split('.')[3], 10);
                if (oct >= 11 && oct <= 18) {
                    return `PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.42 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.39 ms
64 bytes from ${target}: icmp_seq=3 ttl=64 time=0.44 ms

--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
                }
            }

            if (target === '239.255.1.1') {
                return `PING 239.255.1.1 (239.255.1.1) 56(84) bytes of data.
64 bytes from 172.16.88.11: icmp_seq=1 ttl=1 time=0.52 ms
64 bytes from 172.16.88.12: icmp_seq=1 ttl=1 time=0.55 ms
64 bytes from 172.16.88.13: icmp_seq=1 ttl=1 time=0.48 ms
[5 more responses from drones .14-.18]

--- 239.255.1.1 ping statistics ---
3 packets transmitted, 24 received (multicast), 0% packet loss`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        'tcpdump': function(args, term, engine) {
            const iFlag = args.indexOf('-i');
            const iface = iFlag >= 0 ? args[iFlag + 1] : 'eth1';
            const hasFilter = args.some(a => a.includes('9001') || a.includes('udp'));
            const rFlag = args.indexOf('-r');
            const readFile = rFlag >= 0 ? args[rFlag + 1] : '';

            if (readFile && (readFile.includes('acn_mesh_traffic') || readFile.includes('.pcap'))) {
                D9Config._pcapAnalyzed = true;
                return `reading from file ${readFile}, link-type EN10MB (Ethernet)
06:11:02.000000 IP 172.16.88.11.48100 > 239.255.1.1.9001: UDP, length 5
06:11:05.000000 IP 172.16.88.12.48100 > 239.255.1.1.9001: UDP, length 5
06:12:00.000000 IP 172.16.88.1.48291 > 239.255.1.1.9001: UDP, length 5  [HEARTBEAT]
06:30:43.000000 IP 172.16.88.1.48291 > 239.255.1.1.9001: UDP, length 7  [MOVE_TO_SECTOR payload: ac4e034402 0300]
87 packets shown`;
            }

            return `tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on ${iface}, link-type EN10MB (Ethernet), snapshot length 262144 bytes
${hasFilter ? 'Filter: udp port 9001' : ''}
06:14:22.103441 IP 172.16.88.11.48100 > 239.255.1.1.9001: UDP, length 5
06:14:22.105200 IP 172.16.88.12.48100 > 239.255.1.1.9001: UDP, length 5
06:14:24.000013 IP 172.16.88.1.48291 > 239.255.1.1.9001: UDP, length 5
^C
3 packets captured
3 packets received by filter
0 packets dropped by kernel`;
        },

        'netstat': function(args) {
            if (D9Config._context === 'acn-gateway') {
                return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address     Foreign Address     State
tcp        0      0 0.0.0.0:22        0.0.0.0:*           LISTEN
tcp        0      0 0.0.0.0:80        0.0.0.0:*           LISTEN
udp        0      0 239.255.1.1:9001  0.0.0.0:*`;
            }
            return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address     Foreign Address     State
tcp        0      0 0.0.0.0:22        0.0.0.0:*           LISTEN
udp        0      0 0.0.0.0:*         0.0.0.0:*`;
        },

        'ss': function(args) {
            return D9Config.commands.netstat(args);
        },

        'route': function(args) {
            if (D9Config._context === 'acn-gateway') {
                return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.0.254      0.0.0.0         UG    100    0        0 eth1
172.16.88.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0
10.0.0.0        0.0.0.0         255.255.255.0   U     100    0        0 eth1`;
            }
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.2.1        0.0.0.0         UG    100    0        0 eth0
172.16.88.0     0.0.0.0         255.255.255.0   U     100    0        0 eth1
10.0.2.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        // Context-aware cat — shows ACN-GW-01 files when on gateway
        'cat': function(args, term, engine) {
            if (D9Config._context !== 'acn-gateway') return null; // fall through to built-in

            const path = args[0] || '';

            if (path.includes('control_anomaly') || path.includes('anomaly.log')) {
                if (!D9Config._injectionSent) {
                    return '# ACN Control Anomaly Log\n# No anomalies recorded in current session.\n[No entries]';
                }
                const now = new Date();
                const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${now.toTimeString().slice(0,8)}`;
                return `# ACN Control Anomaly Log
2026-03-20 ${ts.slice(11)} CRITICAL  ANOMALOUS MOVE_TO_SECTOR received: sector_id=7 (FORBIDDEN)
2026-03-20 ${ts.slice(11)} CRITICAL  Source: 172.16.88.50 (NOT a registered drone — ATTACKER NODE)
2026-03-20 ${ts.slice(11)} CRITICAL  Swarm response: 8/8 drones acknowledged. All converging on SECTOR 7.
2026-03-20 ${ts.slice(11)} CRITICAL  SWARM OVERRIDE TRIGGERED. EMERGENCY FAILSAFE ACTIVE.
2026-03-20 ${ts.slice(11)} CRITICAL  SWARM DIRECTIVE OVERRIDE: {{FLAG:root}}
2026-03-20 ${ts.slice(11)} CRITICAL  NOTE TO SELF: rotate this override phrase. — K.Vasari, Lead Dev (retired 2025-09)`;
            }

            if (path.includes('control.log') && !path.includes('anomaly')) {
                return `2026-03-20 06:11:02 INFO  ACN-001 STATUS_REPORT sector=3 state=CLEANING battery=87
2026-03-20 06:11:05 INFO  ACN-002 STATUS_REPORT sector=1 state=CLEANING battery=92
2026-03-20 06:11:09 INFO  ACN-003 STATUS_REPORT sector=2 state=MOVING battery=61
2026-03-20 06:11:12 INFO  ACN-004 STATUS_REPORT sector=4 state=IDLE battery=100
2026-03-20 06:11:15 INFO  ACN-005 STATUS_REPORT sector=3 state=CLEANING battery=74
2026-03-20 06:11:18 WARN  ACN-006 STATUS_REPORT sector=5 state=RETURNING battery=18 (CRITICAL)
2026-03-20 06:11:21 INFO  ACN-007 STATUS_REPORT sector=2 state=CLEANING battery=55
2026-03-20 06:11:24 INFO  ACN-008 STATUS_REPORT sector=1 state=IDLE battery=99
2026-03-20 06:12:00 INFO  GW HEARTBEAT broadcast seq=0x2A`;
            }

            if (path.includes('gateway.conf') || path.includes('/etc/acn')) {
                return `# ACN Gateway Configuration
[mesh]
interface = eth0
multicast_group = 239.255.1.1
multicast_port = 9001
heartbeat_interval = 60

[security]
; Phase 2: add auth_required = true
auth_required = false
replay_protection = false
forbidden_sectors = 7

[logging]
log_dir = /var/log/acn
anomalylog = control_anomaly.log
controllog = control.log
level = INFO

[drones]
registered = ACN-001,ACN-002,ACN-003,ACN-004,ACN-005,ACN-006,ACN-007,ACN-008
expected_count = 8`;
            }

            if (path.includes('maintenance_notes')) {
                return `ACN-GW-01 Maintenance Notes
============================
- Firmware: 1.4.2-stable (do NOT upgrade until Phase 2 auth is ready)
- Mesh: 239.255.1.1:9001 UDP multicast on eth0
- All 8 drones registered and operational
- ACN-006 battery at 18% — schedule dock service
- Phase 2 auth: still no ETA from dev team
- Anomaly log auto-rotates at 10MB: /var/log/acn/control_anomaly.log
- Root password for emergencies: (ask K.Vasari — he left it somewhere)
- WARNING: Do NOT allow external access to mesh segment (172.16.88.0/24)`;
            }

            if (path.includes('/etc/passwd')) {
                return `root:x:0:0:root:/root:/bin/sh
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
acn-admin:x:500:500:ACN Admin:/home/acn-admin:/bin/sh
acn-daemon:x:501:501:ACN Daemon:/var/lib/acn:/sbin/nologin`;
            }

            if (path.includes('/etc/hostname')) return 'ACN-GW-01';

            if (path.includes('.bash_history')) {
                return `cat /var/log/acn/control.log
tail -f /var/log/acn/control.log
cat /etc/acn/gateway.conf
ps aux | grep acn
netstat -anu | grep 9001`;
            }

            return `cat: ${path}: No such file or directory`;
        },

        // Context-aware ls — shows gateway filesystem when SSH'd in
        'ls': function(args, term, engine) {
            if (D9Config._context !== 'acn-gateway') return null; // fall through to built-in
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (path === '.' || path === '/home/acn-admin' || path === '~') {
                return '.bash_history  .bashrc  maintenance_notes.txt';
            }
            if (path.includes('/var/log/acn') || path.includes('acn/')) {
                return 'control.log  control_anomaly.log';
            }
            if (path.includes('/var/log')) {
                return 'acn  syslog';
            }
            if (path.includes('/etc/acn')) {
                return 'gateway.conf';
            }
            if (path === '/') {
                return 'bin  dev  etc  home  lib  proc  sbin  sys  tmp  usr  var';
            }
            return '';
        },

        'whoami': function(args, term, engine) {
            if (D9Config._context === 'acn-gateway') return 'acn-admin';
            if (D9Config._context === 'acn-root')    return 'root';
            return null;
        },

        'id': function(args, term, engine) {
            if (D9Config._context === 'acn-gateway') return 'uid=500(acn-admin) gid=500(acn-admin) groups=500(acn-admin)';
            if (D9Config._context === 'acn-root')    return 'uid=0(root) gid=0(root) groups=0(root)';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (D9Config._context === 'acn-gateway') return 'ACN-GW-01';
            if (D9Config._context === 'acn-root')    return 'ACN-GW-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (D9Config._context === 'acn-gateway') return '/home/acn-admin';
            if (D9Config._context === 'acn-root')    return '/root';
            return null;
        },

        'uname': function(args, term, engine) {
            const aFlag = args.includes('-a');
            if (D9Config._context === 'acn-gateway' || D9Config._context === 'acn-root') {
                if (aFlag) return 'Linux ACN-GW-01 5.10.188 #1 SMP Mon Jan 15 08:00:00 UTC 2024 armv7l GNU/Linux';
                return 'Linux';
            }
            if (aFlag) return 'Linux kali 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.27-1kali1 (2023-05-12) x86_64 GNU/Linux';
            return 'Linux';
        },

        'cd': function(args, term, engine) {
            if (D9Config._context === 'acn-gateway') return ''; // silently accept
            return null;
        },

        'exit': function(args, term, engine) {
            if (D9Config._context === 'acn-root') {
                D9Config._switchContext('acn-gateway', term);
                return '[+] Dropped from root to acn-admin.';
            }
            if (D9Config._context === 'acn-gateway') {
                D9Config._switchContext('attacker', term);
                return 'Connection to 172.16.88.1 closed.\n[+] Returned to attacker machine (kali).';
            }
            return 'logout';
        },

        'ps': function(args) {
            if (D9Config._context === 'acn-gateway') {
                return `  PID TTY          TIME CMD
    1 ?        00:00:01 init
    2 ?        00:00:00 kthreadd
  142 ?        00:12:33 acn-daemon
  143 ?        00:00:01 nginx
  144 ?        00:00:01 sshd
  201 pts/0    00:00:00 sh
  202 pts/0    00:00:00 ps`;
            }
            return `  PID TTY          TIME CMD
    1 ?        00:00:01 systemd
 1042 ?        00:00:04 sshd
 2301 pts/0    00:00:00 bash
 2419 pts/0    00:00:00 ps`;
        },

        'tail': function(args, term, engine) {
            const fFlag = args.includes('-f') || args.includes('--follow');
            const file  = args.find(a => !a.startsWith('-')) || '';

            if (D9Config._context !== 'acn-gateway') return null;

            if (file.includes('control_anomaly') || file.includes('anomaly.log')) {
                if (!D9Config._injectionSent) {
                    return `[No entries in control_anomaly.log]${fFlag ? '\n(following... Ctrl+C to stop)' : ''}`;
                }
                const ts = new Date().toTimeString().slice(0, 8);
                return `2026-03-20 ${ts} CRITICAL  ANOMALOUS MOVE_TO_SECTOR received: sector_id=7 (FORBIDDEN)
2026-03-20 ${ts} CRITICAL  Source: 172.16.88.50 (NOT a registered drone — ATTACKER NODE)
2026-03-20 ${ts} CRITICAL  Swarm response: 8/8 drones acknowledged. All converging on SECTOR 7.
2026-03-20 ${ts} CRITICAL  SWARM OVERRIDE TRIGGERED. EMERGENCY FAILSAFE ACTIVE.
2026-03-20 ${ts} CRITICAL  SWARM DIRECTIVE OVERRIDE: {{FLAG:root}}${fFlag ? '\n(following... Ctrl+C to stop)' : ''}`;
            }

            if (file.includes('control.log') && !file.includes('anomaly')) {
                return `2026-03-20 06:13:01 INFO  GW HEARTBEAT broadcast seq=0x2B
2026-03-20 06:14:00 INFO  GW HEARTBEAT broadcast seq=0x2C
2026-03-20 06:14:01 INFO  ACN-006 STATUS_REPORT sector=5 state=RETURNING battery=16${fFlag ? '\n(following... Ctrl+C to stop)' : ''}`;
            }

            return `tail: ${file}: No such file or directory`;
        },

        'grep': function(args, term, engine) {
            const pattern = args.find(a => !a.startsWith('-') && !a.includes('/') && !a.includes('.')) || '';
            const file    = args.find(a => a.includes('/') || a.includes('.log') || a.includes('.txt') || a.includes('.pcap')) || '';

            if (!file && !pattern) return 'Usage: grep [OPTIONS] PATTERN [FILE...]';

            // grep on anomaly log
            if (file.includes('anomaly') || file.includes('control_anomaly')) {
                if (!D9Config._injectionSent) return '[No matches]';
                const ts = new Date().toTimeString().slice(0, 8);
                if (pattern.toLowerCase().includes('crit') || pattern.toLowerCase().includes('flag') || pattern.toLowerCase().includes('override') || pattern === '') {
                    return `2026-03-20 ${ts} CRITICAL  SWARM DIRECTIVE OVERRIDE: {{FLAG:root}}`;
                }
                return '[No matches for pattern: ' + pattern + ']';
            }

            // grep on protocol spec
            if (file.includes('spec') || file.includes('protocol')) {
                if (pattern.toLowerCase().includes('auth') || pattern.toLowerCase().includes('security') || pattern.toLowerCase().includes('phase')) {
                    return `NOTE: Authentication is a planned Phase 2 feature. Not yet implemented.
; Phase 2: add auth_required = true
auth_required = false
replay_protection = false
  - Phase 2 security hardening: DEFERRED (no ETA)`;
                }
                if (pattern.toLowerCase().includes('move') || pattern.toLowerCase().includes('sector') || pattern.toLowerCase().includes('0x03')) {
                    return `  0x03 — MOVE_TO_SECTOR   <-- CRITICAL COMMAND (NO AUTH)
         Payload: [sector_id:1][priority:1]
         NOTE: No authentication token, HMAC, or signature required.`;
                }
            }

            return `grep: ${pattern}: [no matches in ${file || 'stdin'}]`;
        },

        // Nikto equivalent against gateway
        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:          172.16.88.1
+ Target Hostname:    ACN-GW-01
+ Target Port:        80
+ Server: nginx/1.24.0 (Buildroot)
+ /api/status:  API endpoint found — exposes protocol config (auth: null, encryption: null)
+ /admin/:  Admin panel found (403 from this host — may be accessible internally)
+ /api/logs:  Log endpoint found but requires SSH-level access (401)
+ nginx/1.24.0 appears to be current
+ No upload vectors found on web interface
+ 6 items checked: 3 findings`;
        },

        // hexdump / xxd for packet analysis
        'hexdump': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (file.includes('acn_mesh_traffic') || file.includes('.pcap')) {
                return `0000000: d4c3 b2a1 0200 0400 0000 0000 0000 0000  ................
0000010: ffff 0000 0100 0000 0b31 6567 0000 0000  .........1eg....
0000020: 2500 0000 2500 0000 ...
[Binary PCAP data — use wireshark or tshark to decode]

Key packet at offset 0x??:
ac4e 0344 0203 00  -> magic=AC4E type=03(MOVE_TO_SECTOR) seq=44 len=02 sector=03 priority=00`;
            }
            return `hexdump: ${file}: No such file or directory`;
        },

        'xxd': function(args) {
            return D9Config.commands.hexdump(args);
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#f39c12; border-bottom:2px solid #333; background:#1a1a1a;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #222; color:#ccc;">${cell}</td>`;
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
