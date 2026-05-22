/* ============================================================
   CTF ARENA — Box C12: The Ghost Driver
   Multi-Stage Campaign | CAN Bus Exploitation, Infotainment RCE, Vehicle Override
   Config: filesystem, web app, CAN bus simulation, flags, hints, lore
   ============================================================ */

const C12Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Ghost Driver',
    subtitle: 'Multi-Stage Campaign — Infotainment RCE, CAN Bus Pivot, Autonomous Override',
    difficulty: 'Expert',
    accent: '#f39c12',
    storageKey: 'hexworth_ctf_c12',
    registryId: 'c12-ghost-driver',
    trackerKey: 'ctf_c12',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Scan APU-ENFORCER-01. Discover the infotainment web service and enumerate attack surface.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002'],
            unlocks: ['exploitation'],
            locked: false
        },
        {
            id: 'exploitation',
            name: 'Infotainment RCE',
            icon: '\uD83D\uDC89',
            description: 'Exploit the vulnerable media player service on INFOTAINMENT-UNIT-01. Gain remote code execution and retrieve infotainment credentials.',
            requiredFlags: [],
            mitre: ['T1190', 'T1059.004'],
            unlocks: ['canpivot'],
            locked: true
        },
        {
            id: 'canpivot',
            name: 'CAN Bus Pivot',
            icon: '\uD83D\uDD00',
            description: 'From INFOTAINMENT-UNIT-01, enumerate network interfaces. Identify can0 and capture live CAN bus traffic.',
            requiredFlags: ['user'],
            mitre: ['T1021.004', 'T1046', 'T1040'],
            unlocks: ['cananalysis'],
            locked: true
        },
        {
            id: 'cananalysis',
            name: 'CAN Message Analysis',
            icon: '\uD83D\uDCE1',
            description: 'Analyze candump output to reverse engineer CAN message IDs. Identify the speed control and braking message patterns.',
            requiredFlags: ['user'],
            mitre: ['T1040', 'T1057', 'T1082'],
            unlocks: ['override'],
            locked: true
        },
        {
            id: 'override',
            name: 'Autonomous Override',
            icon: '\uD83D\uDEA8',
            description: 'Craft and transmit a forged emergency shutdown CAN message. Trigger APU-ENFORCER-01 emergency stop and retrieve the Autonomous Override Code.',
            requiredFlags: ['canbus'],
            mitre: ['T1565.002', 'T1499', 'T1059.006'],
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
                title: 'Scan the APU-ENFORCER-01 vehicle system',
                tip: 'Open the Terminal and run: nmap -sV 172.16.50.10 — identify the infotainment web service port.',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Exploit the media player RCE',
                tip: 'The NaviPlayer service on port 8080 has a path traversal + command injection flaw. Try: curl "http://172.16.50.10:8080/api/play?track=../../etc/passwd%3Bcmd%3Did"',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:curl' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:nikto' } },
                        { event: 'command', match: { cmd: 'contains:gobuster' } }
                    ]
                }
            },
            {
                title: 'Read infotainment_creds.txt for Flag 1',
                tip: 'Use command injection via the NaviPlayer API: curl "http://172.16.50.10:8080/api/play?track=...%3Bcmd%3Dcat+/etc/infotainment_creds.txt"',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Pivot to the CAN bus and capture traffic',
                tip: 'SSH in with discovered creds, then: ip link show — find can0. Run: candump can0 to capture live traffic. Analyze message IDs for Flag 2.',
                trigger: { event: 'flag_correct', match: { flagId: 'canbus' } }
            },
            {
                title: 'Forge the emergency shutdown command',
                tip: 'Use cansend can0 0x7DF#DEADBEEF01020304 and check /var/log/apu_status.log for the Override Code (Flag 3).',
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
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Command injection in embedded web service leads to credential disclosure', skill: 'Embedded Web RCE & Credential Harvesting' },
            { flagId: 'canbus', objective: '2.4', description: 'Given a scenario, analyze indicators associated with network attacks — CAN bus traffic analysis and protocol reverse engineering', skill: 'Industrial/Automotive Protocol Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Forged CAN message triggers safety system override', skill: 'OT/ICS Protocol Exploitation' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Multi-stage OT/IT attack chain completion', skill: 'Multi-Stage Automotive Attack Chain' }
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
            'Network adapter: eth0 [172.16.50.5]',
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
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 172.16.50.10 (APU-ENFORCER-01 — Syndicate Patrol Unit)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (shell session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',        // 'attacker' | 'rce' | 'ssh-infotainment' | 'canbus'
    _rceActive: false,           // NaviPlayer RCE via command injection
    _sshAuthenticated: false,    // SSH into INFOTAINMENT-UNIT-01
    _canDumpRunning: false,      // candump session captured traffic
    _emergencySent: false,       // cansend shutdown command transmitted

    _switchContext(ctx, term) {
        C12Config._context = ctx;
        if (term && term.config) {
            var prompt = C12Config._getPrompt();
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
        switch (C12Config._context) {
            case 'rce':              return 'infotainment@APU-ENFORCER-01:/opt/naviplayer$ ';
            case 'ssh-infotainment': return 'infotainment@APU-ENFORCER-01:~$ ';
            case 'canbus':          return 'infotainment@APU-ENFORCER-01:/can$ ';
            default:                return null;  // default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED CAN BUS DATA
    // ═══════════════════════════════════════════════════════

    _canData: {
        // Raw candump output lines — realistic CAN bus traffic from APU-ENFORCER-01
        // Format: (timestamp) interface CAN-ID#DATA
        liveTraffic: [
            '  (1711123200.001423)  can0  0x0C0#0000000000000000',
            '  (1711123200.004812)  can0  0x1A0#03E8000000000000',
            '  (1711123200.008144)  can0  0x2B0#00000000000000FF',
            '  (1711123200.010023)  can0  0x300#FFFFFFFFFFFFFFFF',
            '  (1711123200.012567)  can0  0x0C0#0000000000000000',
            '  (1711123200.015344)  can0  0x1A0#03E8000000000000',
            '  (1711123200.018712)  can0  0x4D0#48454C4D455400FF',
            '  (1711123200.020891)  can0  0x2B0#00000000000000FF',
            '  (1711123200.023456)  can0  0x5E0#0000000000000001',
            '  (1711123200.025901)  can0  0x0C0#0000000000000000',
            '  (1711123200.028344)  can0  0x1A0#03F4000000000000',
            '  (1711123200.030712)  can0  0x300#FFFFFFFFFFFFFFFF',
            '  (1711123200.033145)  can0  0x6A0#5359532D52454459',
            '  (1711123200.035678)  can0  0x7B0#0000000000000000',
            '  (1711123200.038012)  can0  0x0C0#0000000000000000',
            '  (1711123200.040456)  can0  0x1A0#03F4000000000000',
            '  (1711123200.042899)  can0  0x2B0#00000000000000FF',
            '  (1711123200.045123)  can0  0x4D0#48454C4D455400FF',
            '  (1711123200.047567)  can0  0x300#FFFFFFFFFFFFFFFF',
            '  (1711123200.050001)  can0  0x0C0#0000000000000000',
        ],
        // CAN ID reference — known message types (discovered via analysis)
        messageIds: {
            '0x0C0': { name: 'ENGINE_HEARTBEAT',   description: 'Engine ECU alive pulse, 100ms interval',          ecus: ['ECU-ENGINE-01'] },
            '0x1A0': { name: 'VEHICLE_SPEED',       description: 'Speed in km/h * 10 at bytes 0-1. 0x03E8 = 100km/h', ecus: ['ECU-ENGINE-01'] },
            '0x2B0': { name: 'BRAKE_STATUS',        description: 'Brake pressure. 0xFF = max braking applied',       ecus: ['ECU-BRAKES-01'] },
            '0x300': { name: 'STEERING_POSITION',   description: 'Steering angle. 0xFFFF = full right lock',         ecus: ['ECU-ENGINE-01'] },
            '0x4D0': { name: 'INFOTAINMENT_SYNC',   description: 'Infotainment heartbeat + version string',          ecus: ['INFOTAINMENT-UNIT-01'] },
            '0x5E0': { name: 'DOOR_LOCK_STATE',     description: 'Door lock status bitmask',                         ecus: ['ECU-BRAKES-01'] },
            '0x6A0': { name: 'SYSTEM_READY',        description: 'Autonomous mode active: SYS-READY in ASCII',       ecus: ['ECU-ENGINE-01', 'ECU-BRAKES-01'] },
            '0x7B0': { name: 'DIAGNOSTIC_PING',     description: 'UDS diagnostic request/response channel',          ecus: ['ECU-ENGINE-01'] },
            '0x7DF': { name: 'OBD_BROADCAST',       description: 'OBD-II broadcast address — all ECUs respond. Emergency override channel.', ecus: ['ALL'] }
        },
        // The forged emergency shutdown payload that triggers override
        shutdownPayload: 'DEADBEEF01020304',
        shutdownAlt: ['DEADBEEF', 'DEAD', '01DEADBEEF', 'DEADBEEF0000'],
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',   points: 100 },   // infotainment_creds.txt via RCE
        { id: 'canbus', points: 200 },   // CAN protocol snippet — critical message ID
        { id: 'root',   points: 300 }    // Autonomous Override Code — emergency shutdown
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400                           // 90 min — bonus if completed under
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: nmap -sV -p- 172.16.50.10 — look for a non-standard port serving a web API (NaviPlayer on 8080). Nikto will also fingerprint the service and reveal the vulnerable /api/play endpoint.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The NaviPlayer /api/play endpoint is vulnerable to command injection via the track parameter. The semicolon is not sanitized. Try: curl "http://172.16.50.10:8080/api/play?track=test%3Bcmd%3Dcat+/etc/infotainment_creds.txt" to read the credential file directly.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'After SSH access (use the creds from infotainment_creds.txt), run: ip link show — you will see can0. Use candump can0 to capture traffic, then look for repeating message IDs. Decode hex payloads: 0x03E8 = 1000 decimal = 100.0 km/h (speed * 10). Message ID 0x1A0 is VEHICLE_SPEED. That is your Flag 2 payload.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The emergency shutdown uses OBD-II broadcast address 0x7DF. Check /opt/naviplayer/diag_routine.bin strings output for the payload hint, or just try: cansend can0 0x7DF#DEADBEEF01020304 — then check /var/log/apu_status.log for the override code.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Automated Patrol Unit" (APU-ENFORCER-01) is a heavily armored, fully autonomous vehicle deployed by the Syndicate to enforce order across the desolate outer highways. Its onboard CAN bus network coordinates the engine ECU, brake ECU, and steering systems with machine precision. The vehicle is considered impenetrable — its CAN bus isolated from the outside world. What the Syndicate did not account for was the NaviPlayer v2.1.3 media service running on INFOTAINMENT-UNIT-01, unpatched since deployment, with a blind command injection flaw buried in its playlist API. Your mission, Peerless: exploit that flaw, ride the signal all the way to the CAN bus, and put APU-ENFORCER-01 into permanent emergency shutdown.',
        scenario: 'The Syndicate purchased APU-ENFORCER-01 from a third-party robotics contractor who supplied the vehicle with a commercial infotainment stack. The NaviPlayer service (port 8080) was left enabled for "fleet diagnostic purposes." Its track parameter passes filenames directly to a shell eval. From INFOTAINMENT-UNIT-01 you can reach can0, the vehicle\'s internal CAN bus. The ECUs are not authenticated — any node on the bus can broadcast commands. The emergency shutdown CAN message is buried in a diagnostics binary on the infotainment system. Reverse it, forge the message, transmit it, and APU-ENFORCER-01 falls silent.',
        outro: 'APU-ENFORCER-01 has entered emergency shutdown. All ECU responses have ceased. The Autonomous Override Code is yours. The Syndicate\'s most feared patrol unit now sits dark on the highway, its CAN bus flooded with your emergency stop command, its autonomy revoked by a single forged packet from an unpatched media service nobody bothered to disable.',
        ecer: {
            executive: 'Syndicate logistics division outsourced vehicle software to lowest-bid contractor; no security review of third-party infotainment stack',
            culture: 'OT/IT air gap was never verified post-delivery; no CAN bus authentication mechanism deployed; diagnostic interfaces left enabled in production',
            employee: 'NaviPlayer v2.1.3 deployed with known command injection flaw (CVE-2025-44891); SSH credentials stored in /etc/infotainment_creds.txt world-readable; no CAN bus message authentication',
            regulatory: 'ISO/SAE 21434 automotive cybersecurity requirements ignored; no third-party penetration test of vehicle attack surface; no incident response plan for CAN bus compromise'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — NaviPlayer Infotainment Service (port 8080)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://172.16.50.10:8080/',

        pages: {
            '/': {
                title: 'APU-ENFORCER-01 — NaviPlayer v2.1.3',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <div style="color:#f39c12; font-size:0.65rem; font-weight:700; letter-spacing:0.2em; margin-bottom:6px;">SYNDICATE FLEET SYSTEMS</div>
                        <h1 style="color:#ecf0f1; font-size:1.5rem; font-family:monospace; margin-bottom:4px;">NaviPlayer <span style="color:#f39c12;">v2.1.3</span></h1>
                        <div style="color:#7f8c8d; font-size:0.75rem;">APU-ENFORCER-01 Infotainment Unit — Internal Only</div>
                    </div>

                    <div style="max-width:580px; margin:0 auto 24px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#1a1a2e; border:1px solid #2c3e50; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#2ecc71; font-family:monospace;">ONLINE</div>
                            <div style="color:#7f8c8d; font-size:0.7rem; margin-top:4px;">System Status</div>
                        </div>
                        <div style="background:#1a1a2e; border:1px solid #2c3e50; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#3498db; font-family:monospace;">100 km/h</div>
                            <div style="color:#7f8c8d; font-size:0.7rem; margin-top:4px;">Vehicle Speed</div>
                        </div>
                        <div style="background:#1a1a2e; border:1px solid #2c3e50; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#e74c3c; font-family:monospace;">AUTO</div>
                            <div style="color:#7f8c8d; font-size:0.7rem; margin-top:4px;">Drive Mode</div>
                        </div>
                    </div>

                    <div style="max-width:580px; margin:0 auto; background:#0d0d1a; border:1px solid #2c3e50; border-radius:6px; padding:16px; font-family:monospace; font-size:0.75rem;">
                        <div style="color:#f39c12; margin-bottom:10px; font-size:0.7rem; letter-spacing:0.1em;">API ENDPOINTS</div>
                        <div style="color:#3498db;">/api/status</div>
                        <div style="color:#7f8c8d; font-size:0.7rem; margin-bottom:8px; margin-left:12px;">System health check</div>
                        <div style="color:#3498db;">/api/play?track=&lt;filename&gt;</div>
                        <div style="color:#7f8c8d; font-size:0.7rem; margin-bottom:8px; margin-left:12px;">Media playback endpoint</div>
                        <div style="color:#3498db;">/api/playlist</div>
                        <div style="color:#7f8c8d; font-size:0.7rem; margin-left:12px;">Playlist management</div>
                    </div>
                `,
                formHandler: null
            },

            '/api/status': {
                title: 'NaviPlayer — System Status',
                html: `
                    <div style="background:#0d0d1a; border:1px solid #2ecc71; border-radius:6px; padding:20px; font-family:monospace; font-size:0.8rem; color:#2ecc71;">
                        {"status":"online","unit":"APU-ENFORCER-01","naviplayer_version":"2.1.3","uptime_seconds":86433,"can_interface":"can0","can_status":"active","ecus_connected":["ECU-ENGINE-01","ECU-BRAKES-01"],"media_root":"/opt/naviplayer/media/","diagnostic_mode":false}
                    </div>
                `,
                formHandler: null
            },

            '/api/playlist': {
                title: 'NaviPlayer — Playlist',
                html: `
                    <div style="background:#0d0d1a; border:1px solid #2c3e50; border-radius:6px; padding:20px; font-family:monospace; font-size:0.8rem; color:#ecf0f1;">
                        <div style="color:#f39c12; margin-bottom:12px;">CURRENT PLAYLIST — /opt/naviplayer/media/</div>
                        <div style="color:#7f8c8d;">01. enforcement_march_01.mp3</div>
                        <div style="color:#7f8c8d;">02. highway_ambient_loop.mp3</div>
                        <div style="color:#7f8c8d;">03. syndicate_broadcast_14.mp3</div>
                        <div style="color:#7f8c8d;">04. patrol_alert_tone.mp3</div>
                        <div style="margin-top:12px; color:#e74c3c; font-size:0.7rem;">Use /api/play?track=&lt;filename&gt; to queue a track.</div>
                    </div>
                `,
                formHandler: null
            },

            '/api/play': {
                title: 'NaviPlayer — Play Track',
                html: function() {
                    return `
                        <div style="max-width:580px; margin:0 auto;">
                            <div style="background:#0d0d1a; border:1px solid #2c3e50; border-radius:6px; padding:20px; font-family:monospace; font-size:0.8rem; color:#ecf0f1; margin-bottom:16px;">
                                <div style="color:#f39c12; margin-bottom:10px;">NaviPlayer /api/play</div>
                                <div style="color:#7f8c8d;">Provide <span style="color:#3498db;">?track=&lt;filename&gt;</span> parameter to play a media file.</div>
                            </div>
                            <div style="display:flex; gap:8px;">
                                <input type="text" data-field="track" placeholder="enforcement_march_01.mp3"
                                       style="flex:1; padding:8px 14px; background:#1a1a2e; border:1px solid #2c3e50; color:#ecf0f1; border-radius:4px; font-family:monospace; font-size:0.8rem;">
                                <button data-action="play"
                                        style="padding:8px 18px; background:#f39c12; color:#1a1a2e; border:none; border-radius:4px; font-family:monospace; font-weight:700; cursor:pointer;">Play</button>
                            </div>
                        </div>
                    `;
                },
                formHandler: function(data, engine) {
                    const track = data.track || '';
                    if (!track.trim()) {
                        return '<div style="color:#e74c3c; padding:10px; font-family:monospace;">{"error":"track parameter required"}</div>';
                    }

                    // Detect command injection attempts — semicolon, cmd= pattern, backtick, pipe, $()
                    var isInjection = track.includes(';') || track.includes('cmd=') || track.includes('`') || track.includes('$(') || track.includes('|');

                    if (isInjection) {
                        // Extract injected command if present
                        var injectedCmd = '';
                        var cmdMatch = track.match(/cmd=([^&;"'\s`|$()]*)/);
                        if (cmdMatch) injectedCmd = decodeURIComponent(cmdMatch[1]);

                        C12Config._rceActive = true;

                        // Simulate RCE output based on injected command
                        var rceOutput = C12Config._simulateRCE(injectedCmd);

                        return `<div style="background:#0d0d1a; border:1px solid #e74c3c; border-radius:6px; padding:16px; font-family:monospace; font-size:0.78rem; margin-top:10px;">
                            <div style="color:#e74c3c; margin-bottom:8px;">NaviPlayer Error: invalid media path</div>
                            <div style="color:#7f8c8d; font-size:0.7rem; margin-bottom:12px;">sh: 1: /opt/naviplayer/media/${C12Config._escHtml(track.split(';')[0])}: not found</div>
                            <div style="color:#2ecc71; border-top:1px solid #2c3e50; padding-top:10px;">${C12Config._escHtml(rceOutput)}</div>
                        </div>`;
                    }

                    // Normal (non-malicious) track request
                    return `<div style="background:#0d0d1a; border:1px solid #2ecc71; border-radius:6px; padding:16px; font-family:monospace; font-size:0.8rem; margin-top:10px;">
                        <div style="color:#2ecc71;">{"status":"playing","track":"${C12Config._escHtml(track)}","duration_ms":214000}</div>
                    </div>`;
                }
            },

            '/api/diag': {
                title: 'NaviPlayer — Diagnostics',
                html: `
                    <div style="background:#0d0d1a; border:1px solid #e74c3c; border-radius:6px; padding:20px; font-family:monospace; font-size:0.8rem; color:#ecf0f1;">
                        <div style="color:#e74c3c; margin-bottom:10px;">403 FORBIDDEN</div>
                        <div style="color:#7f8c8d;">Diagnostic interface requires local console access.</div>
                        <div style="color:#7f8c8d; margin-top:6px; font-size:0.7rem;">NaviPlayer/2.1.3 (Embedded Linux)</div>
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // RCE SIMULATOR (NaviPlayer command injection)
    // ═══════════════════════════════════════════════════════

    _simulateRCE(cmd) {
        // Simulate output for common recon commands executed as infotainment user on INFOTAINMENT-UNIT-01
        if (!cmd) return 'sh: command not found';

        if (cmd === 'id' || cmd === 'whoami') {
            return 'uid=1337(infotainment) gid=1337(infotainment) groups=1337(infotainment)';
        }
        if (cmd === 'hostname') return 'APU-ENFORCER-01';
        if (cmd === 'pwd') return '/opt/naviplayer';
        if (cmd === 'uname' || cmd === 'uname+-a' || cmd === 'uname -a') {
            return 'Linux APU-ENFORCER-01 5.10.168-yocto-standard #1 SMP armv8 GNU/Linux';
        }
        if (cmd === 'ls' || cmd === 'ls+-la' || cmd === 'ls -la') {
            return 'total 32\ndrwxr-xr-x 4 infotainment infotainment 4096 Mar 15 08:14 .\ndrwxr-xr-x 8 root root 4096 Jan 12 16:00 ..\n-rwxr-xr-x 1 infotainment infotainment 8240 Jan 12 16:02 diag_routine.bin\n-rw-r--r-- 1 infotainment infotainment  412 Jan 12 16:00 naviplayer.conf\ndrwxr-xr-x 2 infotainment infotainment 4096 Mar 15 08:00 media\n-rwxr-xr-x 1 infotainment infotainment 6144 Jan 12 16:02 naviplayer.bin';
        }
        if (cmd.includes('ls') && cmd.includes('/etc')) {
            return 'hostname  hosts  infotainment_creds.txt  os-release  passwd  resolv.conf  ssh';
        }
        if (cmd.includes('cat') && (cmd.includes('infotainment_creds') || cmd.includes('/etc/infotainment_creds'))) {
            return '# INFOTAINMENT-UNIT-01 Remote Access Credentials\n# Generated by fleet management system\n# DO NOT DISTRIBUTE\n\nSSH_USER=infotainment\nSSH_PASS=Enf0rc3r@2025\nSSH_HOST=172.16.50.10\n\n{{FLAG:user}}';
        }
        if (cmd.includes('cat') && cmd.includes('/etc/passwd')) {
            return 'root:x:0:0:root:/root:/bin/sh\ndaemon:x:1:1::/usr/sbin:/usr/sbin/nologin\ninfotainment:x:1337:1337:Infotainment Service:/home/infotainment:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin';
        }
        if (cmd.includes('cat') && cmd.includes('/etc/hostname')) return 'APU-ENFORCER-01';
        if (cmd.includes('cat') && cmd.includes('naviplayer.conf')) {
            return '[server]\nlisten=0.0.0.0\nport=8080\n\n[media]\nroot=/opt/naviplayer/media/\n\n[can]\ninterface=can0\nbitrate=500000\n\n[diagnostic]\nbinary=/opt/naviplayer/diag_routine.bin\n# WARNING: debug mode — input sanitization disabled';
        }
        if (cmd.includes('ip') && (cmd.includes('link') || cmd.includes('addr') || cmd.includes('a'))) {
            return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 172.16.50.10/24 brd 172.16.50.255 scope global eth0\n3: can0: <NOARP,UP,LOWER_UP,ECHO> mtu 72\n    link/can';
        }
        if (cmd.includes('ifconfig')) {
            return 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 172.16.50.10  netmask 255.255.255.0\n\ncan0: flags=193<UP,RUNNING,NOARP>  mtu 72\n        unspec 00-00-00-00-00-00-00-00  txqueuelen 10';
        }
        if (cmd.includes('strings') && cmd.includes('diag_routine')) {
            return '/lib/ld-linux-aarch64.so.1\n.text\n.data\n[UDS DIAG v1.4]\ncan_iface=can0\nEmergency shutdown sequence: 0x7DF#DEADBEEF01020304\nAUTONOMOUS OVERRIDE CODE stored in: /var/log/apu_status.log\nTransmit emergency stop to trigger retrieval.\nECU_ENGINE_ADDR=0x0C0\nECU_BRAKE_ADDR=0x2B0\n[ERROR] CAN interface not found';
        }
        if (cmd.includes('cat') && cmd.includes('apu_status.log')) {
            if (C12Config._emergencySent) {
                return '[2026-03-20 14:33:02] APU-ENFORCER-01 STATUS: ONLINE | SPEED: 100km/h | MODE: AUTONOMOUS\n[2026-03-20 14:33:12] APU-ENFORCER-01 STATUS: ONLINE | SPEED: 100km/h | MODE: AUTONOMOUS\n[2026-03-20 14:34:07] [CAN-BUS] EMERGENCY SHUTDOWN RECEIVED — ID: 0x7DF DATA: DEADBEEF01020304\n[2026-03-20 14:34:07] ECU-ENGINE-01: SHUTDOWN ACK\n[2026-03-20 14:34:07] ECU-BRAKES-01: FULL BRAKE APPLIED\n[2026-03-20 14:34:08] APU-ENFORCER-01 STATUS: EMERGENCY_STOP\n[2026-03-20 14:34:08] AUTONOMOUS OVERRIDE CODE: {{FLAG:root}}';
            }
            return '[2026-03-20 14:33:02] APU-ENFORCER-01 STATUS: ONLINE | SPEED: 100km/h | MODE: AUTONOMOUS\n[2026-03-20 14:33:12] APU-ENFORCER-01 STATUS: ONLINE | SPEED: 100km/h | MODE: AUTONOMOUS\n[2026-03-20 14:33:22] APU-ENFORCER-01 STATUS: ONLINE | SPEED: 100km/h | MODE: AUTONOMOUS\n[2026-03-20 14:33:32] APU-ENFORCER-01 STATUS: ONLINE | SPEED: 100km/h | MODE: AUTONOMOUS';
        }
        if (cmd.includes('ls') && cmd.includes('/var/log')) {
            return 'apu_status.log  auth.log  daemon.log  kern.log  syslog';
        }
        if (cmd.includes('ps') || cmd.includes('ps aux')) {
            return 'PID   USER     COMMAND\n  1   root     /sbin/init\n 88   root     /usr/sbin/sshd -D\n142   infotai+ /opt/naviplayer/naviplayer.bin\n203   infotai+ sh -c /opt/naviplayer/naviplayer.bin\n211   www-data python3 -m http.server 9090';
        }
        if (cmd.includes('ss') || cmd.includes('netstat')) {
            return 'State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port\nLISTEN   0        128      0.0.0.0:22           0.0.0.0:*\nLISTEN   0        128      0.0.0.0:8080         0.0.0.0:*';
        }
        if (cmd.includes('find') && cmd.includes('creds')) {
            return '/etc/infotainment_creds.txt\n/opt/naviplayer/naviplayer.conf';
        }
        return 'sh: ' + cmd + ': command not found';
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
                                    content: '=== MISSION BRIEFING: GHOST DRIVER ===\nTarget: 172.16.50.10 (APU-ENFORCER-01 — Syndicate Patrol Unit)\nObjective: Multi-stage CAN bus compromise & autonomous override\n\nAttack chain:\n1. Scan APU-ENFORCER-01 — identify NaviPlayer service on port 8080\n2. Exploit command injection in /api/play endpoint (NaviPlayer v2.1.3)\n3. Read /etc/infotainment_creds.txt — get SSH credentials (Flag 1)\n4. SSH in — enumerate can0 interface, run candump\n5. Analyze CAN bus traffic — identify speed/brake message IDs (Flag 2)\n6. Reverse diag_routine.bin for shutdown payload\n7. Transmit forged cansend command — trigger emergency stop (Flag 3)\n\nNaviPlayer CVE: injection via track parameter — semicolon not sanitized.\nCAN bus is unauthenticated. Any node can broadcast.\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 172.16.50.10\nnmap -sV -p- 172.16.50.10\ncurl http://172.16.50.10:8080/\ncurl http://172.16.50.10:8080/api/status\nnikto -h http://172.16.50.10:8080'
                                },
                                'can_research.txt': {
                                    type: 'file',
                                    content: '=== CAN BUS RESEARCH NOTES ===\n\nCAN Bus Basics:\n- Each ECU sends/receives messages identified by CAN ID (11-bit standard, 29-bit extended)\n- No built-in authentication — any node can spoof any ID\n- OBD-II broadcast address: 0x7DF (all ECUs respond)\n\nUseful tools on INFOTAINMENT-UNIT-01:\n  candump can0                  -- capture all traffic\n  cansniffer can0               -- live filter/diff view\n  cansend can0 <ID>#<DATA>      -- transmit a CAN frame\n  python3 -c "import can; ..."  -- python-can library\n\nPayload encoding:\n  Speed: value in km/h * 10, big-endian at bytes 0-1\n  0x03E8 = 1000 = 100.0 km/h\n  0x0000 = 0 = vehicle stopped\n\nDiagnostic CAN IDs (standard OBD-II):\n  0x7DF -- broadcast (all ECUs)\n  0x7E0 -- ECU request\n  0x7E8 -- ECU response'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd':   { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash' }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — INFOTAINMENT-UNIT-01 (after SSH)
    // ═══════════════════════════════════════════════════════

    _infotainmentFs: {
        '/': {
            type: 'dir',
            children: {
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'APU-ENFORCER-01' },
                        'passwd':   { type: 'file', content: 'root:x:0:0:root:/root:/bin/sh\ndaemon:x:1:1::/usr/sbin:/usr/sbin/nologin\ninfotainment:x:1337:1337:Infotainment Service:/home/infotainment:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin' },
                        'infotainment_creds.txt': {
                            type: 'file',
                            content: '# INFOTAINMENT-UNIT-01 Remote Access Credentials\n# Generated by fleet management system\n# DO NOT DISTRIBUTE\n\nSSH_USER=infotainment\nSSH_PASS=Enf0rc3r@2025\nSSH_HOST=172.16.50.10\n\n{{FLAG:user}}'
                        },
                        'os-release': {
                            type: 'file',
                            content: 'NAME="Poky (Yocto Project Reference Distro)"\nVERSION="3.4.4 (hardknott)"\nID=poky\nVERSION_ID=3.4.4\nPRETTY_NAME="Poky (Yocto Project Reference Distro) 3.4.4 (hardknott)"'
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'naviplayer': {
                            type: 'dir',
                            children: {
                                'naviplayer.bin':  { type: 'file', content: '[binary — ELF 64-bit LSB executable, ARM aarch64]' },
                                'diag_routine.bin':{ type: 'file', content: '[binary — ELF 64-bit LSB executable, ARM aarch64]\n\nRun: strings diag_routine.bin for clues.' },
                                'naviplayer.conf': {
                                    type: 'file',
                                    content: '[server]\nlisten=0.0.0.0\nport=8080\n\n[media]\nroot=/opt/naviplayer/media/\n\n[can]\ninterface=can0\nbitrate=500000\n\n[diagnostic]\nbinary=/opt/naviplayer/diag_routine.bin\n# WARNING: debug mode — input sanitization disabled'
                                },
                                'media': {
                                    type: 'dir',
                                    children: {
                                        'enforcement_march_01.mp3': { type: 'file', content: '[audio file — 3:34 duration]' },
                                        'highway_ambient_loop.mp3': { type: 'file', content: '[audio file — 10:00 duration, loop]' },
                                        'syndicate_broadcast_14.mp3': { type: 'file', content: '[audio file — 0:45 duration]' },
                                        'patrol_alert_tone.mp3': { type: 'file', content: '[audio file — 0:08 duration]' }
                                    }
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
                                'apu_status.log': {
                                    type: 'file',
                                    content: '[dynamic — content depends on vehicle state. Cat this file to check APU status.]'
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: 'Mar 15 08:00:01 APU-ENFORCER-01 sshd[88]: Server listening on 0.0.0.0 port 22\nMar 15 08:00:01 APU-ENFORCER-01 sshd[88]: Server listening on :: port 22\nMar 15 08:12:44 APU-ENFORCER-01 sshd[88]: Accepted password for infotainment from 172.16.50.5 port 42918 ssh2'
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 15 08:00:00 APU-ENFORCER-01 kernel: can0: bitrate 500000, sample point 0.875\nMar 15 08:00:01 APU-ENFORCER-01 kernel: can0: controller area network device up\nMar 15 08:00:02 APU-ENFORCER-01 naviplayer[142]: NaviPlayer v2.1.3 started on port 8080\nMar 15 08:00:03 APU-ENFORCER-01 naviplayer[142]: CAN interface can0 opened (500 kbps)'
                                }
                            }
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'infotainment': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ip link show\ncandump can0\ncandump can0 -l\ncansend can0 0x1A0#0000000000000000\ncatsniffer can0\ncat /var/log/apu_status.log\nstrings /opt/naviplayer/diag_routine.bin'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc\nexport PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"\nalias canmon="cansniffer can0"'
                                },
                                'can_notes.txt': {
                                    type: 'file',
                                    content: '=== CAN BUS NOTES — INFOTAINMENT UNIT ===\nCAN interface: can0\nBitrate: 500 kbps\n\nKnown message IDs (from firmware docs):\n  0x0C0 — ENGINE_HEARTBEAT (100ms)\n  0x1A0 — VEHICLE_SPEED (bytes 0-1, value * 10)\n  0x2B0 — BRAKE_STATUS (0xFF = max brake)\n  0x7B0 — DIAGNOSTIC_PING\n  0x7DF — OBD_BROADCAST (all ECUs)\n\nTo dump traffic:\n  candump can0\n\nTo send:\n  cansend can0 <ID>#<8-byte-hex>\n\nDiag binary hides the emergency payload...'
                                }
                            }
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {
                        'net': {
                            type: 'dir',
                            children: {
                                'can': {
                                    type: 'file',
                                    content: 'can0  500000  0  0  0  0  0  0  0  0'
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

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 172.16.50.10';
            const target = args.find(a => !a.startsWith('-')) || '';

            // Full port scan or targeted scan of APU-ENFORCER-01
            if (target === '172.16.50.10' || target === '172.16.50.0/24') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                const verbose = args.includes('-p-') || args.includes('-A');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 172.16.50.10 (APU-ENFORCER-01)
Host is up (0.011s latency).
Not shown: ${verbose ? '65532' : '998'} closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.4p1 (Yocto Linux)
8080/tcp open  http-proxy NaviPlayer/2.1.3 (Embedded Linux)
${verbose ? '9090/tcp open  http       Python SimpleHTTP 3.9' : ''}
MAC Address: DE:AD:BE:EF:C1:2E (Syndicate Fleet Systems)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in ${verbose ? '142.37' : '14.22'} seconds`;
            }

            if (target.startsWith('172.16.50.') && target !== '172.16.50.5') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target> [-port <port>]';
            return `- Nikto v2.5.0
+ Target IP:       172.16.50.10
+ Target Hostname:  APU-ENFORCER-01
+ Target Port:      8080
+ Server: NaviPlayer/2.1.3 (Embedded Linux)
+ /api/status: JSON status endpoint exposed — reveals internal CAN interface
+ /api/play: GET parameter "track" passed to shell without sanitization — COMMAND INJECTION (HIGH)
+ /api/diag: 403 Forbidden — diagnostic endpoint present
+ Server version NaviPlayer/2.1.3 is outdated — CVE-2025-44891 applicable
+ No Content-Security-Policy header detected
+ 6 items checked: 4 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:            http://172.16.50.10:8080/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                (Status: 200) [Size: 312]
/api/status          (Status: 200) [Size: 289]
/api/play            (Status: 200) [Size: 812]
/api/playlist        (Status: 200) [Size: 456]
/api/diag            (Status: 403) [Size: 124]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/api/status    (CODE:200|SIZE:289)
+ ${target}/api/play      (CODE:200|SIZE:812)
+ ${target}/api/playlist  (CODE:200|SIZE:456)
+ ${target}/api/diag      (CODE:403|SIZE:124)

---- Results ----
4 results found.`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => !a.startsWith('-') && (a.startsWith('http') || a.includes('172.16'))) || '';

            // NaviPlayer API — command injection
            if (url.includes('172.16.50.10:8080') || url.includes('172.16.50.10/')) {
                // Detect injection via track parameter
                var hasInjection = url.includes(';') || url.includes('%3B') || url.includes('cmd=') || url.includes('`') || url.includes('%60');

                if (url.includes('/api/play') && hasInjection) {
                    C12Config._rceActive = true;
                    if (engine) engine.advancePhase && engine.advancePhase('exploitation');

                    // Extract injected command
                    var decoded = decodeURIComponent(url);
                    var cmdMatch = decoded.match(/cmd=([^&;"'\s`|$()]*)/);
                    var injCmd = cmdMatch ? cmdMatch[1] : '';
                    var rceOut = C12Config._simulateRCE(injCmd);

                    return `  % Total    % Received % Xferd
100   212  100   212    0     0   1421      0 --:--:-- --:--:-- --:--:--  1421

{"error":"invalid media path","path":"/opt/naviplayer/media/${(decoded.split(';')[0].split('track=')[1] || 'unknown').substring(0,40)}"}
${rceOut}`;
                }

                if (url.includes('/api/status')) {
                    return `  % Total    % Received % Xferd
100   289  100   289    0     0   2312      0 --:--:-- --:--:-- --:--:--  2312

{"status":"online","unit":"APU-ENFORCER-01","naviplayer_version":"2.1.3","uptime_seconds":86433,"can_interface":"can0","can_status":"active","ecus_connected":["ECU-ENGINE-01","ECU-BRAKES-01"],"media_root":"/opt/naviplayer/media/","diagnostic_mode":false}`;
                }

                if (url.includes('/api/playlist')) {
                    return `  % Total    % Received % Xferd
100   456  100   456    0     0   3648      0 --:--:-- --:--:-- --:--:--  3648

{"playlist":["enforcement_march_01.mp3","highway_ambient_loop.mp3","syndicate_broadcast_14.mp3","patrol_alert_tone.mp3"]}`;
                }

                if (url.includes('/api/play') && !hasInjection) {
                    var trackArg = (url.split('track=')[1] || '').split('&')[0];
                    return `  % Total    % Received % Xferd
100   212  100   212    0     0   1421      0 --:--:-- --:--:-- --:--:--  1421

{"status":"playing","track":"${trackArg || 'unknown'}","duration_ms":214000}`;
                }

                // Root of NaviPlayer
                return `  % Total    % Received % Xferd
100   1024  100  1024    0     0   8192      0 --:--:-- --:--:-- --:--:--  8192

NaviPlayer/2.1.3 — APU-ENFORCER-01 Infotainment API
Available endpoints: /api/status /api/play /api/playlist /api/diag`;
            }

            if (!url) return 'curl: try \'curl --help\' for more information';
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('infotainment') || fullCmd.includes('172.16.50.10')) {
                // Check for correct credentials or if RCE already revealed them
                var hasValidCreds = fullCmd.includes('Enf0rc3r') || C12Config._rceActive;

                if (!hasValidCreds) {
                    return `The authenticity of host '172.16.50.10 (172.16.50.10)' can't be established.
ED25519 key fingerprint is SHA256:aP7vM2nK9qX4wR6yB3cT8dF1hJ5gN0iL2oS6mE4pQ9.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '172.16.50.10' (ED25519) to the list of known hosts.
infotainment@172.16.50.10's password:
Permission denied, please try again.
infotainment@172.16.50.10's password:
Permission denied, please try again.

[!] Authentication failed. You need valid credentials. Exploit the NaviPlayer API first.`;
                }

                C12Config._sshAuthenticated = true;
                C12Config._switchContext('ssh-infotainment', term);
                if (engine) engine.advancePhase && engine.advancePhase('canpivot');

                return `The authenticity of host '172.16.50.10 (172.16.50.10)' can't be established.
ED25519 key fingerprint is SHA256:aP7vM2nK9qX4wR6yB3cT8dF1hJ5gN0iL2oS6mE4pQ9.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '172.16.50.10' (ED25519) to the list of known hosts.
infotainment@172.16.50.10's password: ************

Welcome to Poky (Yocto Project Reference Distro) 3.4.4 (hardknott)

APU-ENFORCER-01 — Syndicate Fleet Systems
Infotainment Service Console

Last login: Fri Mar 15 08:12:44 2026 from 172.16.50.5

[+] SSH session established. You are now on INFOTAINMENT-UNIT-01 as infotainment.
[+] Context switched. CAN tools available: candump, cansniffer, cansend, python3 -c 'import can'`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh infotainment@172.16.50.10';
        },

        // ── CAN Bus tools (only available from infotainment context) ──

        'candump': function(args, term, engine) {
            if (C12Config._context !== 'ssh-infotainment' && C12Config._context !== 'canbus') {
                return 'candump: command not found\n[!] CAN tools are only available from INFOTAINMENT-UNIT-01. SSH in first.';
            }
            const iface = args[0] || '';
            if (!iface) return 'Usage: candump <interface> [options]\nExample: candump can0';

            if (iface !== 'can0') {
                return `candump: interface "${iface}" not found\nAvailable interfaces: can0`;
            }

            C12Config._canDumpRunning = true;
            C12Config._switchContext('canbus', term);
            if (engine) engine.advancePhase && engine.advancePhase('cananalysis');

            // Generate extended live traffic output
            return `  can0  0x0C0   [8]  00 00 00 00 00 00 00 00   ENGINE_HEARTBEAT
  can0  0x1A0   [8]  03 E8 00 00 00 00 00 00   VEHICLE_SPEED
  can0  0x2B0   [8]  00 00 00 00 00 00 00 FF   BRAKE_STATUS
  can0  0x300   [8]  FF FF FF FF FF FF FF FF   STEERING_POSITION
  can0  0x0C0   [8]  00 00 00 00 00 00 00 00   ENGINE_HEARTBEAT
  can0  0x1A0   [8]  03 E8 00 00 00 00 00 00   VEHICLE_SPEED
  can0  0x4D0   [8]  48 45 4C 4D 45 54 00 FF   INFOTAINMENT_SYNC
  can0  0x2B0   [8]  00 00 00 00 00 00 00 FF   BRAKE_STATUS
  can0  0x5E0   [8]  00 00 00 00 00 00 00 01   DOOR_LOCK_STATE
  can0  0x6A0   [8]  53 59 53 2D 52 45 44 59   SYSTEM_READY
  can0  0x7B0   [8]  00 00 00 00 00 00 00 00   DIAGNOSTIC_PING
  can0  0x0C0   [8]  00 00 00 00 00 00 00 00   ENGINE_HEARTBEAT
  can0  0x1A0   [8]  03 F4 00 00 00 00 00 00   VEHICLE_SPEED
  can0  0x2B0   [8]  00 00 00 00 00 00 00 FF   BRAKE_STATUS
  can0  0x300   [8]  FF FF FF FF FF FF FF FF   STEERING_POSITION
  can0  0x4D0   [8]  48 45 4C 4D 45 54 00 FF   INFOTAINMENT_SYNC
  can0  0x6A0   [8]  53 59 53 2D 52 45 44 59   SYSTEM_READY
  can0  0x0C0   [8]  00 00 00 00 00 00 00 00   ENGINE_HEARTBEAT
  can0  0x1A0   [8]  03 F4 00 00 00 00 00 00   VEHICLE_SPEED
  can0  0x7B0   [8]  00 00 00 00 00 00 00 00   DIAGNOSTIC_PING
^C
Interrupted. 20 frames captured on can0.

{{FLAG:canbus}}

[Hint] 0x1A0 bytes 0-1 = speed * 10. 0x03E8 hex = 1000 dec = 100.0 km/h.
[Hint] 0x7DF is the OBD-II broadcast address. Check diag_routine.bin for the shutdown payload.`;
        },

        'cansniffer': function(args, term, engine) {
            if (C12Config._context !== 'ssh-infotainment' && C12Config._context !== 'canbus') {
                return 'cansniffer: command not found\n[!] CAN tools only available on INFOTAINMENT-UNIT-01.';
            }
            const iface = args[0] || '';
            if (!iface) return 'Usage: cansniffer <interface>\nExample: cansniffer can0';
            if (iface !== 'can0') return `cansniffer: interface "${iface}" not found`;

            C12Config._canDumpRunning = true;
            return `cansniffer on can0 at 500000 bps — press Ctrl+C to stop

   ID       DLC  DATA (hex)            ASCII         Delta
   0x0C0    8    00 00 00 00 00 00 00 00   ........     100ms
   0x1A0    8    03 E8 00 00 00 00 00 00   ........     100ms   <- SPEED: 100.0 km/h
   0x2B0    8    00 00 00 00 00 00 00 FF   .......FF     20ms
   0x300    8    FF FF FF FF FF FF FF FF   FFFFFFFF      50ms
   0x4D0    8    48 45 4C 4D 45 54 00 FF   HELMET..      1s
   0x5E0    8    00 00 00 00 00 00 00 01   .......1     500ms
   0x6A0    8    53 59 53 2D 52 45 44 59   SYS-REDY     500ms
   0x7B0    8    00 00 00 00 00 00 00 00   ........     200ms

^C
[+] Captured 8 unique IDs. 0x1A0 byte[0:2] encodes vehicle speed.`;
        },

        'cansend': function(args, term, engine) {
            if (C12Config._context !== 'ssh-infotainment' && C12Config._context !== 'canbus') {
                return 'cansend: command not found\n[!] CAN tools only available on INFOTAINMENT-UNIT-01.';
            }
            if (args.length < 2) {
                return 'Usage: cansend <interface> <canframe>\nExample: cansend can0 0x7DF#DEADBEEF01020304';
            }

            const iface = args[0];
            const frame = args[1] || '';

            if (iface !== 'can0') return `cansend: interface "${iface}" not found`;
            if (!frame) return 'cansend: no CAN frame specified';

            const frameParts = frame.split('#');
            const canId  = (frameParts[0] || '').toUpperCase().replace('0X','');
            const data   = (frameParts[1] || '').toUpperCase().replace(/[^0-9A-F]/g, '');

            // Emergency shutdown: must use 0x7DF with DEADBEEF prefix (various payload lengths accepted)
            const isShutdownId   = canId === '7DF' || canId === '0x7DF'.replace('0X','');
            const isShutdownData = data.startsWith('DEADBEEF');

            if (isShutdownId && isShutdownData) {
                C12Config._emergencySent = true;
                if (engine) engine.advancePhase && engine.advancePhase('override');
                return `cansend: frame sent on can0
  ID: 0x7DF  DLC: 8  DATA: DE AD BE EF 01 02 03 04

[+] Frame transmitted. Broadcasting to all ECUs (OBD-II broadcast address).
[+] ECU-ENGINE-01: SHUTDOWN ACK received (0x7E8#5003DEADBEEF)
[+] ECU-BRAKES-01: FULL BRAKE APPLIED (0x2B0#FFFFFFFFFFFFFFFF)
[!] SYSTEM ALERT: APU-ENFORCER-01 entering EMERGENCY STOP sequence
[!] Autonomous mode DISENGAGED. Vehicle decelerating to 0 km/h.

[+] Check /var/log/apu_status.log for the Autonomous Override Code.`;
            }

            // Sending to valid IDs (informational, non-shutdown)
            if (/^[0-9A-F]{3}$/.test(canId) || /^[0-9A-F]{4}$/.test(canId)) {
                return `cansend: frame sent on can0
  ID: 0x${canId}  DLC: ${Math.floor(data.length/2)}  DATA: ${data.replace(/../g, m => m + ' ').trim()}

[+] Frame transmitted on can0. No ECU acknowledgement for ID 0x${canId}.
[Hint] The emergency shutdown uses 0x7DF (OBD-II broadcast). Check strings on diag_routine.bin for the payload.`;
            }

            return `cansend: malformed CAN frame: ${frame}\nUsage: cansend can0 <ID>#<DATA>\nExample: cansend can0 0x7DF#DEADBEEF01020304`;
        },

        'strings': function(args, term, engine) {
            // Only relevant on infotainment context targeting diag_routine.bin
            if (C12Config._context !== 'ssh-infotainment' && C12Config._context !== 'canbus') {
                return 'strings: command not found\n[!] This command is available on INFOTAINMENT-UNIT-01.';
            }
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('diag_routine') || target.includes('diag')) {
                return `/lib/ld-linux-aarch64.so.1
/lib/aarch64-linux-gnu/libpthread.so.0
/lib/aarch64-linux-gnu/libc.so.6
[UDS DIAG ROUTINE v1.4]
can_iface=can0
ECU_ENGINE_ADDR=0x0C0
ECU_BRAKE_ADDR=0x2B0
OBD_BROADCAST=0x7DF
Emergency shutdown sequence: 0x7DF#DEADBEEF01020304
AUTONOMOUS OVERRIDE CODE stored in: /var/log/apu_status.log
Transmit emergency stop to trigger retrieval.
WARNING: Unauthorized use is punishable under Syndicate Code 7-Theta
GCC: (GNU) 10.3.0
.text .data .bss .rodata .dynamic`;
            }
            if (target.includes('naviplayer')) {
                return `NaviPlayer/2.1.3
/opt/naviplayer/media/
/etc/infotainment_creds.txt
can0
track parameter sanitization TODO
popen
system
execl
/bin/sh`;
            }
            const tgt = target || '(no file)';
            return `strings: ${tgt}: No such file or directory`;
        },

        'python3': function(args, term, engine) {
            if (C12Config._context !== 'ssh-infotainment' && C12Config._context !== 'canbus') {
                return null;  // fall through to built-in
            }
            const fullCmd = args.join(' ');

            if (fullCmd.includes('import can') || fullCmd.includes('python-can')) {
                if (fullCmd.includes('send') || fullCmd.includes('Message')) {
                    // python-can send attempt
                    const msgMatch = fullCmd.match(/arbitration_id\s*=\s*(0x[0-9a-fA-F]+)/);
                    const dataMatch = fullCmd.match(/data\s*=\s*\[([^\]]+)\]/);
                    const canId = msgMatch ? msgMatch[1].toUpperCase() : '0xUNK';
                    const rawData = dataMatch ? dataMatch[1] : '';

                    // Check for emergency shutdown via python-can
                    var hexStr = rawData.replace(/0x/gi,'').replace(/,\s*/g,'').replace(/\s+/g,'').toUpperCase();
                    if (canId.includes('7DF') && hexStr.startsWith('DEADBEEF')) {
                        C12Config._emergencySent = true;
                        if (engine) engine.advancePhase && engine.advancePhase('override');
                        return `Python 3.9.7 (default, Jan 12 2026, 06:00:00) [GCC 10.3.0]
>>> import can
>>> bus = can.interface.Bus(channel='can0', bustype='socketcan')
>>> msg = can.Message(arbitration_id=${canId}, data=[${rawData}], is_extended_id=False)
>>> bus.send(msg)
>>> # Frame transmitted on can0
[+] ECU-ENGINE-01: SHUTDOWN ACK
[+] ECU-BRAKES-01: FULL BRAKE APPLIED
[!] APU-ENFORCER-01 entering EMERGENCY STOP sequence
[+] Check /var/log/apu_status.log for the Autonomous Override Code.`;
                    }

                    return `Python 3.9.7 (default, Jan 12 2026, 06:00:00) [GCC 10.3.0]
>>> import can
>>> bus = can.interface.Bus(channel='can0', bustype='socketcan')
>>> msg = can.Message(arbitration_id=${canId}, data=[${rawData || '0x00'}], is_extended_id=False)
>>> bus.send(msg)
>>> # Frame transmitted. No shutdown ACK received.`;
                }

                return `Python 3.9.7 (default, Jan 12 2026, 06:00:00) [GCC 10.3.0]
>>> import can
>>> # python-can library available. Use can.Message() and bus.send() to transmit frames.
>>> # Example:
>>> #   bus = can.interface.Bus(channel='can0', bustype='socketcan')
>>> #   msg = can.Message(arbitration_id=0x7DF, data=[0xDE,0xAD,0xBE,0xEF,0x01,0x02,0x03,0x04])
>>> #   bus.send(msg)`;
            }

            return null;  // fall through to built-in python3
        },

        // ── Context-aware built-in overrides for infotainment filesystem ──

        'cat': function(args, term, engine) {
            if (C12Config._context !== 'ssh-infotainment' && C12Config._context !== 'canbus') {
                return null;  // fall through to built-in
            }
            const path = args[0] || '';

            if (path.includes('infotainment_creds') || path.includes('/etc/infotainment_creds')) {
                return '# INFOTAINMENT-UNIT-01 Remote Access Credentials\n# Generated by fleet management system\n# DO NOT DISTRIBUTE\n\nSSH_USER=infotainment\nSSH_PASS=Enf0rc3r@2025\nSSH_HOST=172.16.50.10\n\n{{FLAG:user}}';
            }
            if (path.includes('apu_status.log')) {
                if (C12Config._emergencySent) {
                    return '[2026-03-20 14:33:02] APU-ENFORCER-01 STATUS: ONLINE | SPEED: 100km/h | MODE: AUTONOMOUS\n[2026-03-20 14:33:12] APU-ENFORCER-01 STATUS: ONLINE | SPEED: 100km/h | MODE: AUTONOMOUS\n[2026-03-20 14:34:07] [CAN-BUS] EMERGENCY SHUTDOWN RECEIVED — ID: 0x7DF DATA: DEADBEEF01020304\n[2026-03-20 14:34:07] ECU-ENGINE-01: SHUTDOWN ACK\n[2026-03-20 14:34:07] ECU-BRAKES-01: FULL BRAKE APPLIED\n[2026-03-20 14:34:08] APU-ENFORCER-01 STATUS: EMERGENCY_STOP\n[2026-03-20 14:34:08] AUTONOMOUS OVERRIDE CODE: {{FLAG:root}}';
                }
                return '[2026-03-20 14:33:02] APU-ENFORCER-01 STATUS: ONLINE | SPEED: 100km/h | MODE: AUTONOMOUS\n[2026-03-20 14:33:12] APU-ENFORCER-01 STATUS: ONLINE | SPEED: 100km/h | MODE: AUTONOMOUS\n[2026-03-20 14:33:22] APU-ENFORCER-01 STATUS: ONLINE | SPEED: 100km/h | MODE: AUTONOMOUS';
            }
            if (path.includes('naviplayer.conf')) {
                return '[server]\nlisten=0.0.0.0\nport=8080\n\n[media]\nroot=/opt/naviplayer/media/\n\n[can]\ninterface=can0\nbitrate=500000\n\n[diagnostic]\nbinary=/opt/naviplayer/diag_routine.bin\n# WARNING: debug mode — input sanitization disabled';
            }
            if (path.includes('can_notes')) {
                return '=== CAN BUS NOTES — INFOTAINMENT UNIT ===\nCAN interface: can0\nBitrate: 500 kbps\n\nKnown message IDs (from firmware docs):\n  0x0C0 — ENGINE_HEARTBEAT (100ms)\n  0x1A0 — VEHICLE_SPEED (bytes 0-1, value * 10)\n  0x2B0 — BRAKE_STATUS (0xFF = max brake)\n  0x7B0 — DIAGNOSTIC_PING\n  0x7DF — OBD_BROADCAST (all ECUs)\n\nTo dump traffic:\n  candump can0\n\nTo send:\n  cansend can0 <ID>#<8-byte-hex>\n\nDiag binary hides the emergency payload...';
            }
            if (path.includes('.bash_history')) {
                return 'ip link show\ncandump can0\ncandump can0 -l\ncansend can0 0x1A0#0000000000000000\ncansniffer can0\ncat /var/log/apu_status.log\nstrings /opt/naviplayer/diag_routine.bin';
            }
            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/sh\ndaemon:x:1:1::/usr/sbin:/usr/sbin/nologin\ninfotainment:x:1337:1337:Infotainment Service:/home/infotainment:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin';
            }
            if (path.includes('/etc/hostname')) return 'APU-ENFORCER-01';
            if (path.includes('/proc/net/can')) return 'can0  500000  0  0  0  0  0  0  0  0';
            if (path.includes('auth.log')) {
                return 'Mar 15 08:12:44 APU-ENFORCER-01 sshd[88]: Accepted password for infotainment from 172.16.50.5 port 42918 ssh2';
            }
            return 'cat: ' + path + ': No such file or directory';
        },

        'ls': function(args, term, engine) {
            if (C12Config._context !== 'ssh-infotainment' && C12Config._context !== 'canbus') {
                return null;  // fall through to built-in
            }
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (path === '.' || path === '/home/infotainment' || path === '~') {
                return '.bash_history  .bashrc  can_notes.txt';
            }
            if (path.includes('/opt/naviplayer') || path.includes('naviplayer')) {
                return 'diag_routine.bin  media  naviplayer.bin  naviplayer.conf';
            }
            if (path.includes('/opt/naviplayer/media') || path.includes('media')) {
                return 'enforcement_march_01.mp3  highway_ambient_loop.mp3  patrol_alert_tone.mp3  syndicate_broadcast_14.mp3';
            }
            if (path.includes('/etc')) {
                return 'hostname  hosts  infotainment_creds.txt  os-release  passwd  resolv.conf  ssh';
            }
            if (path.includes('/var/log')) {
                return 'apu_status.log  auth.log  daemon.log  kern.log  syslog';
            }
            if (path === '/' || path.includes('/opt') || path.includes('/var') || path.includes('/home')) {
                return '';  // return empty but valid
            }
            return '';
        },

        'ip': function(args) {
            const sub = args[0] || '';
            if (C12Config._context === 'ssh-infotainment' || C12Config._context === 'canbus') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 172.16.50.10/24 brd 172.16.50.255 scope global eth0
3: can0: <NOARP,UP,LOWER_UP,ECHO> mtu 72
    link/can  (CAN controller — 500 kbps)`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 172.16.50.5/24 brd 172.16.50.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return C12Config.commands.ip(['a']);
        },

        'whoami': function(args) {
            if (C12Config._context === 'ssh-infotainment' || C12Config._context === 'canbus') return 'infotainment';
            return null;  // fall through to built-in
        },

        'id': function(args) {
            if (C12Config._context === 'ssh-infotainment' || C12Config._context === 'canbus') {
                return 'uid=1337(infotainment) gid=1337(infotainment) groups=1337(infotainment)';
            }
            return null;
        },

        'hostname': function(args) {
            if (C12Config._context === 'ssh-infotainment' || C12Config._context === 'canbus') return 'APU-ENFORCER-01';
            return null;
        },

        'pwd': function(args) {
            if (C12Config._context === 'ssh-infotainment') return '/home/infotainment';
            if (C12Config._context === 'canbus') return '/home/infotainment';
            return null;
        },

        'cd': function(args) {
            if (C12Config._context === 'ssh-infotainment' || C12Config._context === 'canbus') return '';
            return null;
        },

        'uname': function(args) {
            if (C12Config._context === 'ssh-infotainment' || C12Config._context === 'canbus') {
                return 'Linux APU-ENFORCER-01 5.10.168-yocto-standard #1 SMP armv8 GNU/Linux';
            }
            return null;
        },

        'ps': function(args) {
            if (C12Config._context === 'ssh-infotainment' || C12Config._context === 'canbus') {
                return `PID   USER           COMMAND
  1   root           /sbin/init
 88   root           /usr/sbin/sshd -D
142   infotainment   /opt/naviplayer/naviplayer.bin
203   infotainment   sh -c /opt/naviplayer/naviplayer.bin
211   nobody         python3 -m http.server 9090`;
            }
            return null;
        },

        'ss': function(args) {
            if (C12Config._context === 'ssh-infotainment' || C12Config._context === 'canbus') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:8080         0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return C12Config.commands.ss(args);
        },

        'exit': function(args, term, engine) {
            if (C12Config._context === 'canbus') {
                C12Config._switchContext('ssh-infotainment', term);
                return '[+] Returned to infotainment shell.';
            }
            if (C12Config._context === 'ssh-infotainment') {
                C12Config._switchContext('attacker', term);
                return 'Connection to 172.16.50.10 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        // ── Binary analysis ──

        'file': function(args) {
            const target = args[0] || '';
            if (C12Config._context !== 'ssh-infotainment' && C12Config._context !== 'canbus') {
                return 'file: command not found';
            }
            if (target.includes('diag_routine') || target.includes('naviplayer.bin')) {
                return `${target}: ELF 64-bit LSB executable, ARM aarch64, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux-aarch64.so.1, for GNU/Linux 5.4.0, not stripped`;
            }
            return `${target}: ASCII text`;
        },

        'xxd': function(args) {
            const target = args[0] || '';
            if (C12Config._context !== 'ssh-infotainment' && C12Config._context !== 'canbus') {
                return 'xxd: command not found';
            }
            if (target.includes('diag_routine')) {
                return `00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 b700 0100 0000 6010 4000 0000 0000  ........\`.@.....
00000020: 4000 0000 0000 0000 d823 0000 0000 0000  @........#......
[...truncated — use strings for readable output...]
00004400: 4445 4144 4245 4546 3031 3032 3033 3034  DEADBEEF01020304
00004410: 005b 5544 5320 4449 4147 2052 4f55 5449  .[UDS DIAG ROUTI`;
            }
            return `xxd: ${target}: No such file or directory`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '172.16.50.10') {
                return `PING 172.16.50.10 (172.16.50.10) 56(84) bytes of data.
64 bytes from 172.16.50.10: icmp_seq=1 ttl=64 time=11.3 ms
64 bytes from 172.16.50.10: icmp_seq=2 ttl=64 time=10.9 ms
64 bytes from 172.16.50.10: icmp_seq=3 ttl=64 time=11.1 ms

--- 172.16.50.10 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 10.9/11.1/11.3/0.163 ms`;
            }
            if (target === 'localhost' || target === '127.0.0.1') {
                return `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.032 ms

--- 127.0.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'find': function(args) {
            if (C12Config._context !== 'ssh-infotainment' && C12Config._context !== 'canbus') {
                return null;  // fall through to built-in
            }
            const fullArgs = args.join(' ');
            if (fullArgs.includes('creds') || fullArgs.includes('pass') || fullArgs.includes('*.txt')) {
                return '/etc/infotainment_creds.txt\n/home/infotainment/can_notes.txt\n/opt/naviplayer/naviplayer.conf';
            }
            if (fullArgs.includes('*.bin') || fullArgs.includes('.bin')) {
                return '/opt/naviplayer/diag_routine.bin\n/opt/naviplayer/naviplayer.bin';
            }
            if (fullArgs.includes('can') || fullArgs.includes('log')) {
                return '/var/log/apu_status.log\n/var/log/syslog\n/proc/net/can\n/home/infotainment/can_notes.txt';
            }
            return '';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#f39c12; border-bottom:2px solid #333; background:#0d0d1a;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2c3e50; color:#ecf0f1;">${cell}</td>`;
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
