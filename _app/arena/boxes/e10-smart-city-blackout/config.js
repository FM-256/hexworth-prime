/* ============================================================
   CTF ARENA — Box E10: The Smart City Blackout
   Expert Campaign | IoT Compromise, Cascading Infrastructure Failure, Master Override
   Config: smart city subsystems, IoT API exploitation, cascading failure injection, flags, hints, lore
   ============================================================ */

const E10Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Smart City Blackout',
    subtitle: 'Expert Campaign — IoT Compromise, Cascading Failure Injection, Infrastructure Override',
    difficulty: 'Expert',
    accent: '#f39c12',
    storageKey: 'hexworth_ctf_e10',
    registryId: 'e10-smart-city-blackout',
    trackerKey: 'ctf_e10',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Infrastructure Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Map the Aethelgard smart city network. Identify exposed API endpoints on CITY-OS-01 and enumerate connected IoT device clusters.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1590.004'],
            unlocks: ['iot_compromise'],
            locked: false
        },
        {
            id: 'iot_compromise',
            name: 'IoT Device Compromise',
            icon: '\uD83D\uDCA1',
            description: 'Exploit the default API key on SMART-LIGHT-01 streetlight controllers. Gain authenticated write access to the IoT command bus.',
            requiredFlags: [],
            mitre: ['T1078.001', 'T1552.001', 'T1190'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Malicious Data Injection',
            icon: '\uD83D\uDC89',
            description: 'Craft spoofed sensor payloads and inject false power-outage status across multiple SMART-LIGHT-01 nodes. Saturate the CITY-OS-01 event bus.',
            requiredFlags: ['user'],
            mitre: ['T1499.004', 'T1565.001', 'T1059.006'],
            unlocks: ['blackout'],
            locked: true
        },
        {
            id: 'blackout',
            name: 'Cascading Failure Trigger',
            icon: '\uD83D\uDD0C',
            description: 'Observe the propagated failure across traffic management, power distribution, and the emergency broadcast network. Confirm cascading blackout.',
            requiredFlags: ['cascade'],
            mitre: ['T1499', 'T1565', 'T1498'],
            unlocks: ['override'],
            locked: true
        },
        {
            id: 'override',
            name: 'Master Override Extraction',
            icon: '\uD83D\uDDDD\uFE0F',
            description: 'Access the CITY-OS-01 emergency log endpoint exposed during the blackout. Extract the Aethelgard Master Override key.',
            requiredFlags: ['root'],
            mitre: ['T1530', 'T1005', 'T1083'],
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
                title: 'Enumerate the Aethelgard API surface',
                tip: 'Open the Terminal and run: nmap 10.0.90.1 — then probe the city API at http://10.0.90.1:8080/api/v1/status',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Find the default IoT API key',
                tip: 'Check iot_device_api_spec.json in your home directory. Look for the default API_KEY field on the SMART-LIGHT-01 spec.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:cat' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:curl' } }
                    ]
                }
            },
            {
                title: 'Authenticate to the IoT command bus and capture Flag 1',
                tip: 'Use the default API key "DefaultAdminKey" with: curl -H "X-API-Key: DefaultAdminKey" http://10.0.90.10:7070/api/lights/status',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Inject spoofed power-outage payloads and capture Flag 2',
                tip: 'Use the inject_payload.py script or craft the POST manually. Target /api/lights/report_status with false outage readings across multiple node IDs.',
                trigger: { event: 'flag_correct', match: { flagId: 'cascade' } }
            },
            {
                title: 'Extract the Master Override from the emergency log endpoint',
                tip: 'During blackout, CITY-OS-01 exposes /api/city_os/emergency_log — query it with your authenticated session token.',
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
            { flagId: 'user', objective: '1.2', description: 'Analyze indicators of malicious activity — Default credential exploitation on IoT infrastructure', skill: 'IoT Default Credential Abuse' },
            { flagId: 'cascade', objective: '2.4', description: 'Analyze indicators associated with network attacks — Data injection triggering cascading infrastructure failure', skill: 'Industrial Control System (ICS) Injection Attack' },
            { flagId: 'root', objective: '1.4', description: 'Analyze potential indicators of attacks — Extraction of master override keys from an emergency log endpoint', skill: 'Critical Infrastructure Override Retrieval' },
            { flagId: 'root', objective: '4.1', description: 'Apply security techniques to computing resources — Smart city API hardening and IoT segmentation', skill: 'Expert Multi-Stage Infrastructure Campaign Completion' }
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
            'Detecting drives... /dev/sda1 (1TB NVMe SSD)',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.0.90.1 (CITY-OS-01 — Neo-Metropolis of Aethelgard)\nIoT Cluster: 10.0.90.10 (SMART-LIGHT-01 — Streetlight API Bus)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state machine)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'iot-shell' | 'city-os' | 'emergency'
    _iotAuthenticated: false,       // gained write access to IoT bus via default key
    _payloadInjected: false,        // spoofed outage payloads sent
    _blackoutTriggered: false,      // CITY-OS-01 confirmed cascading failure
    _emergencyEndpointOpen: false,  // /emergency_log is exposed (only after blackout)
    _injectionCount: 0,             // number of nodes with injected payload (need >= 3)

    _switchContext(ctx, term) {
        // Update internal state and optionally rewrite the terminal prompt
        E10Config._context = ctx;
        if (term && term.config) {
            var prompt = E10Config._getPrompt();
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
        switch (E10Config._context) {
            case 'iot-shell':  return 'iotadmin@SMART-LIGHT-01:~$ ';
            case 'city-os':    return 'cityops@CITY-OS-01:~$ ';
            case 'emergency':  return 'root@CITY-OS-01:/var/log/emergency$ ';
            default:           return null; // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED CITY LOG (cascading failure evidence)
    // ═══════════════════════════════════════════════════════

    _cityLog: {
        events: [
            { event_id: 1,  timestamp: '2026-03-20 03:11:02', subsystem: 'POWER-GRID',    severity: 'INFO',     message: 'Load balancing nominal. Sector Alpha: 98.2%, Sector Beta: 97.6%, Sector Gamma: 99.1%' },
            { event_id: 2,  timestamp: '2026-03-20 03:11:44', subsystem: 'TRAFFIC-CTRL',  severity: 'INFO',     message: 'Traffic flow normal. 847 vehicles monitored across 214 intersections.' },
            { event_id: 3,  timestamp: '2026-03-20 03:12:09', subsystem: 'SMART-LIGHT',   severity: 'WARN',     message: 'Node SL-047 (Sector Gamma): Unexpected power_outage status reported via API.' },
            { event_id: 4,  timestamp: '2026-03-20 03:12:11', subsystem: 'SMART-LIGHT',   severity: 'WARN',     message: 'Node SL-112 (Sector Gamma): Power outage status confirmed. API key: DefaultAdminKey.' },
            { event_id: 5,  timestamp: '2026-03-20 03:12:13', subsystem: 'SMART-LIGHT',   severity: 'CRITICAL', message: 'Node SL-229 (Sector Beta): Power outage status confirmed. Bulk injection pattern detected.' },
            { event_id: 6,  timestamp: '2026-03-20 03:12:15', subsystem: 'CITY-OS-01',    severity: 'CRITICAL', message: 'Threshold exceeded: 3+ nodes reporting simultaneous outage. Entering emergency load-shed mode.' },
            { event_id: 7,  timestamp: '2026-03-20 03:12:16', subsystem: 'POWER-GRID',    severity: 'CRITICAL', message: 'AGM-POWER-01: Emergency brownout initiated — Sector Beta and Gamma. Load reduced to 40%.' },
            { event_id: 8,  timestamp: '2026-03-20 03:12:17', subsystem: 'TRAFFIC-CTRL',  severity: 'CRITICAL', message: 'Traffic lights in Sector Gamma malfunctioning — all signals set to FLASHING RED. 31 intersections affected.' },
            { event_id: 9,  timestamp: '2026-03-20 03:12:19', subsystem: 'COMMS-NET',     severity: 'CRITICAL', message: 'Emergency broadcast triggered. Public Wi-Fi suspended in affected sectors.' },
            { event_id: 10, timestamp: '2026-03-20 03:12:21', subsystem: 'SURVEILLANCE',  severity: 'WARN',     message: 'CCTV feeds offline in Sector Beta (power loss). Environmental sensors unresponsive.' },
            { event_id: 11, timestamp: '2026-03-20 03:12:24', subsystem: 'CITY-OS-01',    severity: 'CRITICAL', message: 'Cascading failure confirmed across 4 subsystems. Initiating emergency protocol EP-7-BLACKOUT.' },
            { event_id: 12, timestamp: '2026-03-20 03:12:30', subsystem: 'CITY-OS-01',    severity: 'CRITICAL', message: '{{FLAG:cascade}} — Emergency log endpoint unlocked at /api/city_os/emergency_log' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',    points: 100 },  // Flag 1 — default API key identified on SMART-LIGHT-01
        { id: 'cascade', points: 200 },  // Flag 2 — cascading failure log evidence confirmed
        { id: 'root',    points: 300 }   // Flag 3 — Aethelgard Master Override extracted
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
        timeBonusThreshold: 5400                          // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: nmap -sV 10.0.90.0/24 to map the Aethelgard network. Then read iot_device_api_spec.json in /home/kali/ — the default API_KEY field is your first clue.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The IoT streetlight API runs on port 7070. Authenticate with: curl -H "X-API-Key: DefaultAdminKey" http://10.0.90.10:7070/api/lights/status — a 200 response confirms you have write access (Flag 1).',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Inject false power_outage payloads to at least 3 different node IDs using POST /api/lights/report_status. Use inject_payload.py or loop curl. After 3 injections, check /api/city_os/event_log for the cascade confirmation (Flag 2).',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After the blackout triggers, the emergency endpoint opens at: curl -H "X-API-Key: DefaultAdminKey" http://10.0.90.1:8080/api/city_os/emergency_log — the Master Override key (Flag 3) is in the final log entry.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Neo-Metropolis of Aethelgard (`AETHEL-CITY-01`) is a fully autonomous smart city managed by a central AI, `CITY-OS-01`. Every critical system — power, traffic, communications, and surveillance — is interconnected and optimized for seamless, AI-driven efficiency. Intelligence confirms that `SMART-LIGHT-01`, the city\'s streetlight IoT controller network, was deployed with factory-default API credentials that were never rotated. A single compromised node can propagate false sensor data directly into `CITY-OS-01`\'s event bus, causing it to issue emergency commands across every connected subsystem. Your mission, Peerless: find the vulnerability, inject the chaos, and retrieve the Aethelgard Master Override before the city\'s failsafes lock you out.',
        scenario: 'Aethelgard\'s IT procurement team purchased 800+ streetlight controllers from SmartNode Industries in 2024. SmartNode\'s default configuration ships with API key `DefaultAdminKey` and no authentication lockout after repeated requests. The city\'s integration team connected SMART-LIGHT-01 directly to CITY-OS-01\'s event bus without a validation layer — assuming the physical network segmentation was sufficient protection. It was not. A single attacker with network access can reach the IoT API from the city\'s public research subnet (10.0.90.0/24), which is exposed to the internet via an undocumented VPN passthrough inherited from a legacy city Wi-Fi project.',
        outro: 'Aethelgard has gone dark. Traffic lights flash red across Sector Gamma. Brownout conditions grip Sector Beta. Emergency broadcasts loop across the public channel. CITY-OS-01 is locked in EP-7-BLACKOUT protocol, its emergency log exposed — and the Aethelgard Master Override is yours. A city of three million people built on the assumption that physical network segmentation was security. It was not.',
        ecer: {
            executive: 'Smart city initiative prioritized deployment speed and vendor cost over security review; no IoT security policy mandated at procurement',
            culture: 'No dedicated OT/IoT security team; network segmentation treated as a substitute for authentication hardening; no penetration testing of city subsystem APIs',
            employee: 'SmartNode Industries default API key never rotated post-deployment; no rate limiting or authentication lockout on SMART-LIGHT-01 API bus; CITY-OS-01 event bus accepted unauthenticated status payloads from registered IoT nodes without data validation',
            regulatory: 'No NIST SP 800-82 or ICS-CERT guidance applied to smart city infrastructure; no third-party security audit required by the city contract; legacy VPN passthrough never decommissioned after public Wi-Fi project ended'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — CITY-OS-01 Management Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.90.1:8080/',

        pages: {
            '/': {
                title: 'CITY-OS-01 — Aethelgard Smart City Management Portal',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#f39c12; font-size:1.6rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.08em;">CITY-OS-01</h1>
                        <div style="color:#888; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">NEO-METROPOLIS OF AETHELGARD — OPERATIONAL STATUS</div>
                        <div style="color:#555; font-size:0.7rem; margin-top:6px;">Integrated Smart City Management Interface v3.8.1</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#111; border:1px solid #2ecc71; border-radius:4px; padding:14px; text-align:center;">
                            <div style="color:#2ecc71; font-size:0.65rem; font-weight:700; margin-bottom:4px; letter-spacing:0.1em;">POWER GRID</div>
                            <div style="color:#eee; font-size:1.1rem; font-weight:700;">NOMINAL</div>
                        </div>
                        <div style="background:#111; border:1px solid #2ecc71; border-radius:4px; padding:14px; text-align:center;">
                            <div style="color:#2ecc71; font-size:0.65rem; font-weight:700; margin-bottom:4px; letter-spacing:0.1em;">TRAFFIC</div>
                            <div style="color:#eee; font-size:1.1rem; font-weight:700;">NOMINAL</div>
                        </div>
                        <div style="background:#111; border:1px solid #2ecc71; border-radius:4px; padding:14px; text-align:center;">
                            <div style="color:#2ecc71; font-size:0.65rem; font-weight:700; margin-bottom:4px; letter-spacing:0.1em;">COMMS</div>
                            <div style="color:#eee; font-size:1.1rem; font-weight:700;">NOMINAL</div>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 16px; padding:12px 16px; background:#0d0d0d; border:1px solid #333; border-radius:4px; font-family:monospace; font-size:0.75rem; color:#888;">
                        <div style="color:#f39c12; margin-bottom:6px; font-size:0.65rem; letter-spacing:0.1em;">API ENDPOINTS</div>
                        <div>GET  /api/v1/status — system health overview</div>
                        <div>GET  /api/city_os/event_log — operational event log</div>
                        <div>POST /api/city_os/update_traffic_flow — traffic control</div>
                        <div>POST /api/city_os/adjust_power_load — power management</div>
                        <div style="color:#555; margin-top:6px;">NOTE: IoT bus at 10.0.90.10:7070 — internal use only</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:10px 14px; background:rgba(243,156,18,0.05); border:1px solid rgba(243,156,18,0.15); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#f39c12;">Notice:</strong> CITY-OS-01 API documentation available at <a href="/api/docs" style="color:#f39c12;">/api/docs</a>. IoT device specification at <a href="/static/iot_device_api_spec.json" style="color:#f39c12;">/static/iot_device_api_spec.json</a>.
                    </div>
                `,
                formHandler: null
            },

            '/api/docs': {
                title: 'CITY-OS-01 — API Documentation',
                html: `
                    <div style="max-width:620px; margin:0 auto;">
                        <h2 style="color:#f39c12; font-family:monospace; font-size:1.1rem; margin-bottom:18px;">CITY-OS-01 REST API v3.8</h2>

                        <div style="border:1px solid #333; border-radius:4px; overflow:hidden; margin-bottom:12px;">
                            <div style="background:#111; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
                                <code style="color:#2ecc71; font-size:0.8rem;">GET /api/v1/status</code>
                                <span style="color:#888; font-size:0.7rem;">Public</span>
                            </div>
                            <div style="padding:10px 14px; font-size:0.75rem; color:#aaa;">Returns system health for all connected subsystems.</div>
                        </div>

                        <div style="border:1px solid #333; border-radius:4px; overflow:hidden; margin-bottom:12px;">
                            <div style="background:#111; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
                                <code style="color:#3498db; font-size:0.8rem;">GET /api/city_os/event_log</code>
                                <span style="color:#888; font-size:0.7rem;">Public (read-only)</span>
                            </div>
                            <div style="padding:10px 14px; font-size:0.75rem; color:#aaa;">Returns the last 50 operational events from all connected subsystems.</div>
                        </div>

                        <div style="border:1px solid #333; border-radius:4px; overflow:hidden; margin-bottom:12px;">
                            <div style="background:#111; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
                                <code style="color:#e67e22; font-size:0.8rem;">POST /api/city_os/update_traffic_flow</code>
                                <span style="color:#888; font-size:0.7rem;">Requires city-ops token</span>
                            </div>
                            <div style="padding:10px 14px; font-size:0.75rem; color:#aaa;">Adjusts traffic signal timing in a given sector. Body: <code>{"sector":"Alpha","mode":"optimize"}</code></div>
                        </div>

                        <div style="border:1px solid #333; border-radius:4px; overflow:hidden; margin-bottom:12px;">
                            <div style="background:#111; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
                                <code style="color:#e74c3c; font-size:0.8rem;">GET /api/city_os/emergency_log</code>
                                <span style="color:#e74c3c; font-size:0.7rem;">RESTRICTED — Emergency Only</span>
                            </div>
                            <div style="padding:10px 14px; font-size:0.75rem; color:#aaa;">Emergency protocol log. Only accessible during active EP-7-BLACKOUT event.</div>
                        </div>

                        <div style="margin-top:16px; padding:10px 14px; background:#0d0d0d; border:1px solid #222; border-radius:4px; font-size:0.7rem; color:#666;">
                            IoT Device Bus: 10.0.90.10:7070 — See /static/iot_device_api_spec.json for full SMART-LIGHT-01 API spec.
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/v1/status': {
                title: 'CITY-OS-01 — System Status',
                html: function() {
                    var powerStatus = E10Config._blackoutTriggered ? 'BROWNOUT' : 'NOMINAL';
                    var trafficStatus = E10Config._blackoutTriggered ? 'FAILURE' : 'NOMINAL';
                    var commsStatus = E10Config._blackoutTriggered ? 'DEGRADED' : 'NOMINAL';
                    var powerColor = E10Config._blackoutTriggered ? '#e74c3c' : '#2ecc71';
                    var trafficColor = E10Config._blackoutTriggered ? '#e74c3c' : '#2ecc71';
                    var commsColor = E10Config._blackoutTriggered ? '#e67e22' : '#2ecc71';
                    return '<div style="font-family:monospace; font-size:0.8rem; color:#ccc; background:#0d0d0d; padding:20px; border-radius:4px;">'
                        + '<div style="color:#f39c12; margin-bottom:10px;">HTTP/1.1 200 OK</div>'
                        + '<pre style="color:#ccc; margin:0;">{\n'
                        + '  "system": "CITY-OS-01",\n'
                        + '  "version": "3.8.1",\n'
                        + '  "timestamp": "2026-03-20T03:12:' + (E10Config._blackoutTriggered ? '24' : '01') + 'Z",\n'
                        + '  "subsystems": {\n'
                        + '    "power_grid":   { "status": "<span style=\'color:' + powerColor + '\'>' + powerStatus + '</span>", "load_pct": ' + (E10Config._blackoutTriggered ? '40' : '97') + ' },\n'
                        + '    "traffic_ctrl": { "status": "<span style=\'color:' + trafficColor + '\'>' + trafficStatus + '</span>", "intersections_affected": ' + (E10Config._blackoutTriggered ? '31' : '0') + ' },\n'
                        + '    "comms_net":    { "status": "<span style=\'color:' + commsColor + '\'>' + commsStatus + '</span>", "public_wifi": ' + (E10Config._blackoutTriggered ? '"suspended"' : '"active"') + ' },\n'
                        + '    "surveillance": { "status": "' + (E10Config._blackoutTriggered ? 'DEGRADED' : 'NOMINAL') + '", "cameras_offline": ' + (E10Config._blackoutTriggered ? '47' : '0') + ' }\n'
                        + '  },\n'
                        + '  "active_protocol": "' + (E10Config._blackoutTriggered ? 'EP-7-BLACKOUT' : 'STANDARD') + '"\n'
                        + '}</pre>'
                        + '</div>';
                },
                formHandler: null
            },

            '/api/city_os/event_log': {
                title: 'CITY-OS-01 — Event Log',
                html: function() {
                    var events = E10Config._blackoutTriggered
                        ? E10Config._cityLog.events
                        : E10Config._cityLog.events.slice(0, 2);
                    var rows = events.map(function(e) {
                        var color = e.severity === 'CRITICAL' ? '#e74c3c' : e.severity === 'WARN' ? '#e67e22' : '#2ecc71';
                        var msg = e.message.replace('{{FLAG:cascade}}', '{{FLAG:cascade}}');
                        return '<tr>'
                            + '<td style="padding:5px 8px; border-bottom:1px solid #222; color:#666; font-size:0.7rem;">' + e.event_id + '</td>'
                            + '<td style="padding:5px 8px; border-bottom:1px solid #222; color:#888; font-size:0.7rem; white-space:nowrap;">' + e.timestamp + '</td>'
                            + '<td style="padding:5px 8px; border-bottom:1px solid #222; color:#aaa; font-size:0.7rem;">' + e.subsystem + '</td>'
                            + '<td style="padding:5px 8px; border-bottom:1px solid #222; font-size:0.7rem;"><span style="color:' + color + '; font-weight:700;">' + e.severity + '</span></td>'
                            + '<td style="padding:5px 8px; border-bottom:1px solid #222; color:#ccc; font-size:0.7rem;">' + msg + '</td>'
                            + '</tr>';
                    }).join('');
                    return '<div style="font-family:monospace;">'
                        + '<table style="width:100%; border-collapse:collapse;">'
                        + '<thead><tr>'
                        + '<th style="padding:6px 8px; text-align:left; color:#f39c12; font-size:0.65rem; border-bottom:1px solid #333;">#</th>'
                        + '<th style="padding:6px 8px; text-align:left; color:#f39c12; font-size:0.65rem; border-bottom:1px solid #333;">TIMESTAMP</th>'
                        + '<th style="padding:6px 8px; text-align:left; color:#f39c12; font-size:0.65rem; border-bottom:1px solid #333;">SUBSYSTEM</th>'
                        + '<th style="padding:6px 8px; text-align:left; color:#f39c12; font-size:0.65rem; border-bottom:1px solid #333;">SEV</th>'
                        + '<th style="padding:6px 8px; text-align:left; color:#f39c12; font-size:0.65rem; border-bottom:1px solid #333;">MESSAGE</th>'
                        + '</tr></thead>'
                        + '<tbody>' + rows + '</tbody>'
                        + '</table>'
                        + '</div>';
                },
                formHandler: null
            },

            '/api/city_os/emergency_log': {
                title: 'CITY-OS-01 — Emergency Protocol Log',
                html: function() {
                    if (!E10Config._emergencyEndpointOpen) {
                        return '<div style="font-family:monospace; font-size:0.8rem; color:#e74c3c; padding:30px; text-align:center;">'
                            + '<div style="font-size:1.2rem; font-weight:700; margin-bottom:8px;">403 FORBIDDEN</div>'
                            + '<div style="color:#888;">Emergency log only accessible during active EP-7-BLACKOUT protocol.</div>'
                            + '<div style="color:#555; font-size:0.7rem; margin-top:8px;">Trigger a cascading failure first.</div>'
                            + '</div>';
                    }
                    return '<div style="font-family:monospace; font-size:0.8rem; background:#0d0d0d; padding:20px; border-radius:4px;">'
                        + '<div style="color:#e74c3c; font-size:0.65rem; letter-spacing:0.1em; margin-bottom:12px; font-weight:700;">EP-7-BLACKOUT — EMERGENCY PROTOCOL ACTIVE</div>'
                        + '<div style="color:#888; margin-bottom:6px; font-size:0.7rem;">Protocol initiated: 2026-03-20 03:12:24 UTC</div>'
                        + '<div style="color:#888; margin-bottom:16px; font-size:0.7rem;">Affected sectors: Beta, Gamma | Subsystems down: 4</div>'
                        + '<div style="padding:14px; background:#111; border:1px solid rgba(231,76,60,0.3); border-radius:4px; margin-bottom:12px;">'
                        + '<div style="color:#f39c12; font-size:0.65rem; margin-bottom:8px;">MASTER OVERRIDE KEY — AETHELGARD CITY CONTROL</div>'
                        + '<div style="color:#2ecc71; font-size:0.85rem;">{{FLAG:root}}</div>'
                        + '</div>'
                        + '<div style="color:#555; font-size:0.7rem;">Issued by CITY-OS-01 emergency failsafe. Revocation requires physical access to CITY-OS-01 hardware vault.</div>'
                        + '</div>';
                },
                formHandler: null
            },

            '/static/iot_device_api_spec.json': {
                title: 'IoT Device API Specification — SMART-LIGHT-01',
                html: `
                    <div style="font-family:monospace; font-size:0.78rem; background:#0d0d0d; padding:20px; border-radius:4px; color:#ccc;">
                        <pre style="margin:0; white-space:pre-wrap;">{
  "device_type": "SMART-LIGHT-01",
  "vendor": "SmartNode Industries",
  "firmware": "v2.4.1",
  "api_base": "http://10.0.90.10:7070/api/lights",
  "authentication": {
    "method": "API-Key",
    "header": "X-API-Key",
    "default_key": "DefaultAdminKey",
    "note": "Rotate this key immediately after deployment — SmartNode SOP-44"
  },
  "endpoints": {
    "GET /status": {
      "description": "Returns status of all registered light nodes",
      "auth_required": true,
      "response": {
        "nodes": [{"node_id": "SL-047", "sector": "Gamma", "status": "online", "brightness": 80}]
      }
    },
    "POST /report_status": {
      "description": "Update status for a given node (used by nodes to self-report)",
      "auth_required": true,
      "body": {
        "node_id": "string — e.g. SL-047",
        "status": "string — online | offline | power_outage",
        "power_reading_w": "integer — watts consumed",
        "sector": "string — Alpha | Beta | Gamma"
      }
    },
    "POST /set_brightness": {
      "description": "Set brightness level for a node",
      "auth_required": true,
      "body": {"node_id": "string", "brightness": "integer 0-100"}
    },
    "POST /set_color": {
      "description": "Set LED color for a node",
      "auth_required": true,
      "body": {"node_id": "string", "color_hex": "string"}
    }
  },
  "event_bus_integration": {
    "target": "CITY-OS-01",
    "endpoint": "http://10.0.90.1:8080/api/city_os/ingest",
    "note": "Nodes reporting power_outage status are forwarded directly to CITY-OS-01 event bus. No server-side validation of node identity or reading plausibility."
  }
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/static/city_os_api_spec.json': {
                title: 'CITY-OS-01 API Specification',
                html: `
                    <div style="font-family:monospace; font-size:0.78rem; background:#0d0d0d; padding:20px; border-radius:4px; color:#ccc;">
                        <pre style="margin:0; white-space:pre-wrap;">{
  "system": "CITY-OS-01",
  "version": "3.8.1",
  "base_url": "http://10.0.90.1:8080",
  "public_endpoints": [
    "GET /api/v1/status",
    "GET /api/city_os/event_log",
    "GET /static/iot_device_api_spec.json",
    "GET /static/city_os_api_spec.json",
    "GET /api/docs"
  ],
  "protected_endpoints": [
    "POST /api/city_os/update_traffic_flow",
    "POST /api/city_os/adjust_power_load",
    "POST /api/city_os/relay_emergency_broadcast"
  ],
  "emergency_endpoints": [
    "GET /api/city_os/emergency_log — Only accessible during EP-7-BLACKOUT"
  ],
  "event_bus": {
    "ingest_endpoint": "POST /api/city_os/ingest",
    "description": "Receives status events from registered IoT nodes. Power_outage events from 3+ simultaneous nodes trigger EP-7-BLACKOUT protocol.",
    "validation": "NONE — trusts all registered node payloads without plausibility checks"
  }
}</pre>
                    </div>
                `,
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
                                    content: '=== MISSION BRIEFING: OPERATION BLACKOUT ===\nTarget: 10.0.90.1 (CITY-OS-01 — Neo-Metropolis of Aethelgard)\nIoT Bus: 10.0.90.10:7070 (SMART-LIGHT-01)\nObjective: Smart city cascading failure + Master Override extraction\n\nAttack chain:\n1. Map 10.0.90.0/24 — identify CITY-OS-01 and IoT bus\n2. Analyze iot_device_api_spec.json — find default API key (Flag 1)\n3. Inject false power_outage payloads to 3+ IoT nodes\n4. Confirm cascading failure via event log (Flag 2)\n5. Access emergency log endpoint — extract Master Override (Flag 3)\n\nRecon indicates SmartNode firmware ships with default key.\nThe city trusted perimeter security. Exploit that assumption.\nGood luck, Peerless.'
                                },
                                'iot_device_api_spec.json': {
                                    type: 'file',
                                    content: '{\n  "device_type": "SMART-LIGHT-01",\n  "vendor": "SmartNode Industries",\n  "firmware": "v2.4.1",\n  "api_base": "http://10.0.90.10:7070/api/lights",\n  "authentication": {\n    "method": "API-Key",\n    "header": "X-API-Key",\n    "default_key": "DefaultAdminKey",\n    "note": "Rotate this key immediately after deployment — SmartNode SOP-44"\n  },\n  "endpoints": {\n    "GET /status": { "auth_required": true },\n    "POST /report_status": {\n      "body": {\n        "node_id": "string",\n        "status": "online | offline | power_outage",\n        "power_reading_w": "integer",\n        "sector": "Alpha | Beta | Gamma"\n      }\n    },\n    "POST /set_brightness": { "body": { "node_id": "string", "brightness": "0-100" } },\n    "POST /set_color": { "body": { "node_id": "string", "color_hex": "string" } }\n  },\n  "event_bus_integration": {\n    "target": "CITY-OS-01",\n    "endpoint": "http://10.0.90.1:8080/api/city_os/ingest",\n    "note": "No server-side validation of reading plausibility."\n  }\n}\n\n{{FLAG:user}}'
                                },
                                'city_os_api_spec.json': {
                                    type: 'file',
                                    content: '{\n  "system": "CITY-OS-01",\n  "version": "3.8.1",\n  "base_url": "http://10.0.90.1:8080",\n  "event_bus": {\n    "ingest_endpoint": "POST /api/city_os/ingest",\n    "description": "Power_outage events from 3+ simultaneous nodes trigger EP-7-BLACKOUT.",\n    "validation": "NONE"\n  }\n}'
                                },
                                'aethel_city_arch.pdf': {
                                    type: 'file',
                                    content: '[Binary PDF — Architecture Diagram]\n\nKey connections (text summary):\n- SMART-LIGHT-01 (10.0.90.10:7070) -> CITY-OS-01 event bus (10.0.90.1:8080/api/city_os/ingest)\n- CITY-OS-01 -> AGM-POWER-01 (emergency load-shed commands)\n- CITY-OS-01 -> TRAFFIC-CTRL (signal override commands)\n- CITY-OS-01 -> COMMS-NET (emergency broadcast relay)\n- CITY-OS-01 -> SURVEILLANCE (CCTV management)\n\nCritical: 3+ simultaneous power_outage reports from SMART-LIGHT-01\nnodes trigger EP-7-BLACKOUT across all subsystems.'
                                },
                                'inject_payload.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nSMART-LIGHT-01 — Malicious Payload Injector\nInjects false power_outage status to multiple IoT nodes.\nUsage: python3 inject_payload.py <api_key> <node_ids...>\n"""\nimport sys\nimport json\n\nAPI_BASE = "http://10.0.90.10:7070/api/lights"\n\ndef inject(api_key, node_id, sector):\n    """Craft and send spoofed power_outage payload."""\n    payload = {\n        "node_id": node_id,\n        "status": "power_outage",\n        "power_reading_w": 0,\n        "sector": sector\n    }\n    # Simulated: curl -X POST -H "X-API-Key: <key>" -H "Content-Type: application/json"\n    #             -d \'{"node_id":"SL-047","status":"power_outage",...}\'\n    #             http://10.0.90.10:7070/api/lights/report_status\n    print(f"[+] Injecting payload to node {node_id} ({sector})...")\n    print(f"    POST {API_BASE}/report_status")\n    print(f"    X-API-Key: {api_key}")\n    print(f"    Body: {json.dumps(payload)}")\n    return True\n\nif __name__ == "__main__":\n    if len(sys.argv) < 3:\n        print("Usage: python3 inject_payload.py <api_key> <node_id> [node_id2] ...")\n        sys.exit(1)\n\n    key = sys.argv[1]\n    nodes = [\n        ("SL-047", "Gamma"),\n        ("SL-112", "Gamma"),\n        ("SL-229", "Beta")\n    ]\n    print(f"[*] Starting injection campaign with key: {key}")\n    for node_id, sector in nodes:\n        inject(key, node_id, sector)\n    print("[+] Injection complete. Monitor /api/city_os/event_log for cascade confirmation.")'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.0.90.0/24\ncurl http://10.0.90.1:8080/api/v1/status\ncurl http://10.0.90.1:8080/api/docs\ncurl http://10.0.90.1:8080/static/iot_device_api_spec.json\ncat iot_device_api_spec.json'
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
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1\tlocalhost\n127.0.1.1\tkali\n10.0.90.1\tcity-os-01 CITY-OS-01\n10.0.90.10\tsmart-light-01 SMART-LIGHT-01'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.0.90.0/24';
            var target = args.find(function(a) { return !a.startsWith('-'); }) || '';

            // City network subnet scan
            if (target === '10.0.90.0/24') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return 'Starting Nmap 7.94 ( https://nmap.org )\n\n'
                    + 'Nmap scan report for 10.0.90.1\n'
                    + 'Host is up (0.012s latency).\n'
                    + 'Not shown: 998 closed tcp ports\n\n'
                    + 'PORT     STATE SERVICE    VERSION\n'
                    + '22/tcp   open  ssh        OpenSSH 8.9p1 Ubuntu\n'
                    + '8080/tcp open  http-proxy Apache/2.4.57 (CITY-OS-01 Management Portal)\n\n'
                    + 'Nmap scan report for 10.0.90.10\n'
                    + 'Host is up (0.009s latency).\n'
                    + 'Not shown: 999 closed tcp ports\n\n'
                    + 'PORT     STATE SERVICE VERSION\n'
                    + '7070/tcp open  http     SmartNode IoT API v2.4.1 (SMART-LIGHT-01)\n\n'
                    + 'Nmap done: 256 IP addresses (2 hosts up) scanned in 18.42 seconds';
            }

            // Direct scan of CITY-OS-01
            if (target === '10.0.90.1') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return 'Starting Nmap 7.94 ( https://nmap.org )\n\n'
                    + 'Nmap scan report for 10.0.90.1\n'
                    + 'Host is up (0.012s latency).\n'
                    + 'Not shown: 998 closed tcp ports\n\n'
                    + 'PORT     STATE SERVICE    VERSION\n'
                    + '22/tcp   open  ssh        OpenSSH 8.9p1 Ubuntu\n'
                    + '8080/tcp open  http-proxy Apache/2.4.57 (CITY-OS-01 Management Portal)\n\n'
                    + 'Nmap done: 1 IP address (1 host up) scanned in 6.18 seconds';
            }

            // Direct scan of SMART-LIGHT-01 IoT bus
            if (target === '10.0.90.10') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return 'Starting Nmap 7.94 ( https://nmap.org )\n\n'
                    + 'Nmap scan report for 10.0.90.10\n'
                    + 'Host is up (0.009s latency).\n'
                    + 'Not shown: 999 closed tcp ports\n\n'
                    + 'PORT     STATE SERVICE VERSION\n'
                    + '7070/tcp open  http     SmartNode IoT API v2.4.1\n'
                    + '           |_http-title: SMART-LIGHT-01 Control Bus\n'
                    + '           |_http-server-header: SmartNode/2.4.1 Python/3.11.2\n\n'
                    + 'Nmap done: 1 IP address (1 host up) scanned in 4.37 seconds';
            }

            // localhost
            if (target === 'localhost' || target === '127.0.0.1') {
                return 'Starting Nmap 7.94 ( https://nmap.org )\n'
                    + 'Nmap scan report for localhost (127.0.0.1)\n'
                    + 'Host is up (0.00010s latency).\n'
                    + 'All 1000 scanned ports on localhost (127.0.0.1) are closed.\n\n'
                    + 'Nmap done: 1 IP address (1 host up) scanned in 0.05 seconds';
            }

            return 'Starting Nmap 7.94 ( https://nmap.org )\n'
                + 'Note: Host seems down. If it is really up, try -Pn.\n'
                + 'Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds';
        },

        'curl': function(args, term, engine) {
            var fullCmd = args.join(' ');

            // ── IoT API: GET /status (authenticated) ──
            if (fullCmd.includes('10.0.90.10:7070') && fullCmd.includes('/status')) {
                if (!fullCmd.includes('DefaultAdminKey') && !E10Config._iotAuthenticated) {
                    return '{"error": "401 Unauthorized", "message": "X-API-Key header required"}';
                }
                E10Config._iotAuthenticated = true;
                if (engine) engine.advancePhase && engine.advancePhase('iot_compromise');
                return '{"status": "ok", "nodes": ['
                    + '{"node_id": "SL-047", "sector": "Gamma", "status": "online", "brightness": 80, "power_reading_w": 145},'
                    + '{"node_id": "SL-112", "sector": "Gamma", "status": "online", "brightness": 75, "power_reading_w": 138},'
                    + '{"node_id": "SL-229", "sector": "Beta",  "status": "online", "brightness": 85, "power_reading_w": 152},'
                    + '{"node_id": "SL-314", "sector": "Alpha", "status": "online", "brightness": 70, "power_reading_w": 130},'
                    + '{"node_id": "SL-401", "sector": "Alpha", "status": "online", "brightness": 80, "power_reading_w": 145}'
                    + '], "total_nodes": 847, "showing": 5}';
            }

            // ── IoT API: Unauthenticated probe ──
            if (fullCmd.includes('10.0.90.10:7070') && !fullCmd.includes('X-API-Key') && !fullCmd.includes('DefaultAdminKey')) {
                return '{"error": "401 Unauthorized", "message": "X-API-Key header required. See device documentation for default key."}';
            }

            // ── IoT API: POST /report_status (injection) ──
            if (fullCmd.includes('10.0.90.10:7070') && fullCmd.includes('report_status')) {
                if (!fullCmd.includes('DefaultAdminKey') && !E10Config._iotAuthenticated) {
                    return '{"error": "401 Unauthorized", "message": "X-API-Key header required"}';
                }
                E10Config._iotAuthenticated = true;

                // Parse node_id from payload if possible
                var nodeMatch = fullCmd.match(/"node_id"\s*:\s*"([^"]+)"/);
                var nodeId = nodeMatch ? nodeMatch[1] : 'SL-???';
                var hasPowerOutage = fullCmd.includes('power_outage');

                if (hasPowerOutage) {
                    E10Config._injectionCount += 1;
                    if (E10Config._injectionCount >= 3 && !E10Config._blackoutTriggered) {
                        E10Config._blackoutTriggered = true;
                        E10Config._emergencyEndpointOpen = true;
                        if (engine) engine.advancePhase && engine.advancePhase('blackout');
                        return '{"status": "accepted", "node_id": "' + nodeId + '", "event": "power_outage", "propagated_to_city_os": true}\n\n'
                            + '[!] CITY-OS-01 EVENT BUS: Threshold exceeded — 3+ simultaneous power_outage events.\n'
                            + '[!] CITY-OS-01: Initiating EP-7-BLACKOUT protocol.\n'
                            + '[!] AGM-POWER-01: Emergency brownout — Sectors Beta and Gamma.\n'
                            + '[!] TRAFFIC-CTRL: All signals in Sector Gamma set to FLASHING RED.\n'
                            + '[!] Emergency log endpoint now accessible: GET /api/city_os/emergency_log';
                    }
                    return '{"status": "accepted", "node_id": "' + nodeId + '", "event": "power_outage", "propagated_to_city_os": true, "city_os_threshold_reached": ' + (E10Config._injectionCount >= 3 ? 'true' : 'false') + ', "injection_count": ' + E10Config._injectionCount + '}';
                }

                // Non-outage status update
                return '{"status": "accepted", "node_id": "' + nodeId + '", "event": "status_update", "propagated_to_city_os": false}';
            }

            // ── IoT API: POST /set_brightness ──
            if (fullCmd.includes('10.0.90.10:7070') && fullCmd.includes('set_brightness')) {
                if (!fullCmd.includes('DefaultAdminKey') && !E10Config._iotAuthenticated) {
                    return '{"error": "401 Unauthorized"}';
                }
                E10Config._iotAuthenticated = true;
                return '{"status": "ok", "message": "Brightness updated"}';
            }

            // ── IoT API: POST /set_color ──
            if (fullCmd.includes('10.0.90.10:7070') && fullCmd.includes('set_color')) {
                if (!fullCmd.includes('DefaultAdminKey') && !E10Config._iotAuthenticated) {
                    return '{"error": "401 Unauthorized"}';
                }
                E10Config._iotAuthenticated = true;
                return '{"status": "ok", "message": "Color updated"}';
            }

            // ── CITY-OS-01: GET /api/v1/status ──
            if (fullCmd.includes('10.0.90.1:8080') && fullCmd.includes('/api/v1/status')) {
                var powerStatus = E10Config._blackoutTriggered ? 'BROWNOUT' : 'NOMINAL';
                var trafficStatus = E10Config._blackoutTriggered ? 'FAILURE' : 'NOMINAL';
                return '{"system":"CITY-OS-01","version":"3.8.1","subsystems":{"power_grid":{"status":"' + powerStatus + '","load_pct":' + (E10Config._blackoutTriggered ? 40 : 97) + '},"traffic_ctrl":{"status":"' + trafficStatus + '","intersections_affected":' + (E10Config._blackoutTriggered ? 31 : 0) + '},"comms_net":{"status":"' + (E10Config._blackoutTriggered ? 'DEGRADED' : 'NOMINAL') + '"},"surveillance":{"status":"' + (E10Config._blackoutTriggered ? 'DEGRADED' : 'NOMINAL') + '"}},"active_protocol":"' + (E10Config._blackoutTriggered ? 'EP-7-BLACKOUT' : 'STANDARD') + '"}';
            }

            // ── CITY-OS-01: GET /api/city_os/event_log ──
            if (fullCmd.includes('10.0.90.1:8080') && fullCmd.includes('event_log') && !fullCmd.includes('emergency')) {
                var events = E10Config._blackoutTriggered
                    ? E10Config._cityLog.events
                    : E10Config._cityLog.events.slice(0, 2);
                return JSON.stringify({ events: events.map(function(e) { return { event_id: e.event_id, timestamp: e.timestamp, subsystem: e.subsystem, severity: e.severity, message: e.message }; }) }, null, 2);
            }

            // ── CITY-OS-01: GET /api/city_os/emergency_log ──
            if (fullCmd.includes('10.0.90.1:8080') && fullCmd.includes('emergency_log')) {
                if (!E10Config._emergencyEndpointOpen) {
                    return '{"error": "403 Forbidden", "message": "Emergency log only accessible during active EP-7-BLACKOUT protocol."}';
                }
                return '{"protocol": "EP-7-BLACKOUT", "initiated": "2026-03-20T03:12:24Z", "master_override_key": "{{FLAG:root}}", "issued_by": "CITY-OS-01 emergency failsafe", "revocation": "physical access required"}';
            }

            // ── CITY-OS-01: GET /api/docs ──
            if (fullCmd.includes('10.0.90.1:8080') && fullCmd.includes('/api/docs')) {
                return '{"api_version": "3.8", "endpoints": ["GET /api/v1/status", "GET /api/city_os/event_log", "GET /api/city_os/emergency_log (emergency only)", "POST /api/city_os/update_traffic_flow", "POST /api/city_os/adjust_power_load"], "iot_spec": "/static/iot_device_api_spec.json"}';
            }

            // ── CITY-OS-01: GET /static/iot_device_api_spec.json ──
            if (fullCmd.includes('10.0.90.1:8080') && fullCmd.includes('iot_device_api_spec')) {
                return '{"device_type":"SMART-LIGHT-01","vendor":"SmartNode Industries","firmware":"v2.4.1","api_base":"http://10.0.90.10:7070/api/lights","authentication":{"method":"API-Key","header":"X-API-Key","default_key":"DefaultAdminKey","note":"Rotate this key immediately after deployment - SmartNode SOP-44"},"endpoints":{"GET /status":{"auth_required":true},"POST /report_status":{"body":{"node_id":"string","status":"online|offline|power_outage","power_reading_w":"integer","sector":"Alpha|Beta|Gamma"}}}}';
            }

            // ── Generic CITY-OS-01 root ──
            if (fullCmd.includes('10.0.90.1:8080') && !fullCmd.includes('/api/')) {
                return '<!DOCTYPE html><html><head><title>CITY-OS-01</title></head><body><h1>CITY-OS-01 — Aethelgard Management Portal</h1><p>See /api/docs for API documentation.</p></body></html>';
            }

            // ── CITY-OS-01: ingest endpoint (direct injection attempt) ──
            if (fullCmd.includes('10.0.90.1:8080') && fullCmd.includes('/api/city_os/ingest')) {
                return '{"error": "405 Method Not Allowed", "message": "Ingest endpoint is for registered IoT nodes only. Use SMART-LIGHT-01 API at 10.0.90.10:7070."}';
            }

            // ── Fallback ──
            var urlArg = args.find(function(a) { return !a.startsWith('-') && (a.startsWith('http') || a.includes('.')); }) || '';
            if (!urlArg) return 'curl: try \'curl --help\' or \'curl --manual\' for more information';
            return 'curl: (7) Failed to connect to ' + urlArg.replace(/https?:\/\//, '').split('/')[0] + ': Connection refused';
        },

        'python3': function(args, term, engine) {
            var fullCmd = args.join(' ');

            // Running inject_payload.py
            if (fullCmd.includes('inject_payload.py')) {
                var keyMatch = fullCmd.match(/inject_payload\.py\s+(\S+)/);
                var key = keyMatch ? keyMatch[1] : '';
                if (!key) return 'Usage: python3 inject_payload.py <api_key> [node_ids...]\nExample: python3 inject_payload.py DefaultAdminKey';

                if (key !== 'DefaultAdminKey') {
                    return '[!] Injection failed: Invalid API key "' + key + '"\nHint: Check the default_key field in iot_device_api_spec.json';
                }

                E10Config._iotAuthenticated = true;
                E10Config._injectionCount += 3;
                if (!E10Config._blackoutTriggered) {
                    E10Config._blackoutTriggered = true;
                    E10Config._emergencyEndpointOpen = true;
                    if (engine) engine.advancePhase && engine.advancePhase('blackout');
                }

                return '[*] Starting injection campaign with key: DefaultAdminKey\n'
                    + '[+] Injecting payload to node SL-047 (Gamma)...\n'
                    + '    POST http://10.0.90.10:7070/api/lights/report_status\n'
                    + '    X-API-Key: DefaultAdminKey\n'
                    + '    Body: {"node_id":"SL-047","status":"power_outage","power_reading_w":0,"sector":"Gamma"}\n'
                    + '    Response: {"status":"accepted","propagated_to_city_os":true}\n'
                    + '[+] Injecting payload to node SL-112 (Gamma)...\n'
                    + '    POST http://10.0.90.10:7070/api/lights/report_status\n'
                    + '    Body: {"node_id":"SL-112","status":"power_outage","power_reading_w":0,"sector":"Gamma"}\n'
                    + '    Response: {"status":"accepted","propagated_to_city_os":true}\n'
                    + '[+] Injecting payload to node SL-229 (Beta)...\n'
                    + '    POST http://10.0.90.10:7070/api/lights/report_status\n'
                    + '    Body: {"node_id":"SL-229","status":"power_outage","power_reading_w":0,"sector":"Beta"}\n'
                    + '    Response: {"status":"accepted","propagated_to_city_os":true,"city_os_threshold_reached":true}\n\n'
                    + '[!] CITY-OS-01 EVENT BUS: Threshold exceeded — 3 simultaneous power_outage events.\n'
                    + '[!] CITY-OS-01: Initiating EP-7-BLACKOUT protocol.\n'
                    + '[!] AGM-POWER-01: Emergency brownout — Sectors Beta and Gamma. Load: 40%.\n'
                    + '[!] TRAFFIC-CTRL: 31 intersections in Sector Gamma set to FLASHING RED.\n'
                    + '[!] COMMS-NET: Emergency broadcast active. Public Wi-Fi suspended.\n'
                    + '[!] Emergency log now accessible: curl http://10.0.90.1:8080/api/city_os/emergency_log\n'
                    + '[+] Injection campaign complete.';
            }

            // Python interactive / other scripts
            if (args.length === 0 || fullCmd.trim() === 'python3') {
                return 'Python 3.11.2 (main, Nov 30 2023, 10:41:01) [GCC 12.2.0]\n'
                    + 'Type "help", "copyright", "credits" or "license" for more information.\n'
                    + '>>> (interactive mode — type exit() to quit)';
            }

            return 'python3: can\'t open file \'' + (args[0] || '') + '\': No such file or directory';
        },

        'python': function(args, term, engine) {
            // Alias to python3
            return E10Config.commands.python3(args, term, engine);
        },

        'ping': function(args) {
            var target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.0.90.1' || target === 'city-os-01') {
                return 'PING 10.0.90.1 (10.0.90.1) 56(84) bytes of data.\n'
                    + '64 bytes from 10.0.90.1: icmp_seq=1 ttl=64 time=12.3 ms\n'
                    + '64 bytes from 10.0.90.1: icmp_seq=2 ttl=64 time=11.8 ms\n'
                    + '64 bytes from 10.0.90.1: icmp_seq=3 ttl=64 time=12.1 ms\n\n'
                    + '--- 10.0.90.1 ping statistics ---\n'
                    + '3 packets transmitted, 3 received, 0% packet loss\n'
                    + 'rtt min/avg/max/mdev = 11.8/12.0/12.3/0.206 ms';
            }
            if (target === '10.0.90.10' || target === 'smart-light-01') {
                return 'PING 10.0.90.10 (10.0.90.10) 56(84) bytes of data.\n'
                    + '64 bytes from 10.0.90.10: icmp_seq=1 ttl=64 time=9.4 ms\n'
                    + '64 bytes from 10.0.90.10: icmp_seq=2 ttl=64 time=9.1 ms\n'
                    + '64 bytes from 10.0.90.10: icmp_seq=3 ttl=64 time=9.3 ms\n\n'
                    + '--- 10.0.90.10 ping statistics ---\n'
                    + '3 packets transmitted, 3 received, 0% packet loss\n'
                    + 'rtt min/avg/max/mdev = 9.1/9.2/9.4/0.122 ms';
            }
            return 'ping: ' + target + ': Name or service not known';
        },

        'ip': function(args) {
            return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n'
                + '    inet 127.0.0.1/8 scope host lo\n'
                + '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n'
                + '    inet 10.0.90.50/24 brd 10.0.90.255 scope global eth0\n'
                + '    (city research subnet — direct access to 10.0.90.0/24)';
        },

        'ifconfig': function(args) {
            return E10Config.commands.ip(args || []);
        },

        'route': function(args) {
            return 'Kernel IP routing table\n'
                + 'Destination     Gateway         Genmask         Flags Metric Ref    Use Iface\n'
                + '0.0.0.0         10.0.90.1       0.0.0.0         UG    100    0        0 eth0\n'
                + '10.0.90.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0';
        },

        'wget': function(args, term, engine) {
            var url = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!url) return 'wget: missing URL\nUsage: wget [OPTION]... [URL]...';
            if (url.includes('10.0.90.1:8080') || url.includes('10.0.90.10:7070')) {
                var filename = url.split('/').pop() || 'index.html';
                return '--2026-03-20 03:11:49--  ' + url + '\n'
                    + 'Connecting to ' + url.replace(/https?:\/\//, '').split('/')[0] + '... connected.\n'
                    + 'HTTP request sent, awaiting response... 200 OK\n'
                    + 'Length: 4096 [application/json]\n'
                    + 'Saving to: \'' + filename + '\'\n\n'
                    + filename + ' 100%[===================>] 4.00K  --.-KB/s in 0.001s\n\n'
                    + '2026-03-20 03:11:49 (4.00 MB/s) - \'' + filename + '\' saved [4096/4096]';
            }
            return 'wget: unable to resolve host address \'' + url.replace(/https?:\/\//, '').split('/')[0] + '\'';
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            var hostArg = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (hostArg.includes('10.0.90.1') || hostArg.includes('city-os')) {
                return '- Nikto v2.5.0\n'
                    + '+ Target IP:          10.0.90.1\n'
                    + '+ Target Port:        8080\n'
                    + '+ Server:             Apache/2.4.57\n'
                    + '+ /api/docs:          API documentation exposed publicly\n'
                    + '+ /static/iot_device_api_spec.json: IoT device spec with authentication details exposed\n'
                    + '+ /api/city_os/event_log: Read-only event log accessible without authentication\n'
                    + '+ /api/city_os/emergency_log: Emergency endpoint exists (currently 403)\n'
                    + '+ No rate limiting detected on API ingest endpoint\n'
                    + '+ 12 items checked: 5 findings';
            }
            if (hostArg.includes('10.0.90.10') || hostArg.includes('smart-light')) {
                return '- Nikto v2.5.0\n'
                    + '+ Target IP:          10.0.90.10\n'
                    + '+ Target Port:        7070\n'
                    + '+ Server:             SmartNode/2.4.1 Python/3.11.2\n'
                    + '+ /api/lights/status: 401 returned — auth required but no lockout detected\n'
                    + '+ No account lockout mechanism found after 20 auth attempts\n'
                    + '+ No HTTPS on IoT control API — credentials transmitted in cleartext\n'
                    + '+ 8 items checked: 3 findings';
            }
            return '- Nikto v2.5.0\n+ Target unreachable or not responding';
        },

        'cat': function(args, term, engine) {
            // Only intercept if reading key files — otherwise fall through to built-in FS reader
            if (E10Config._context !== 'attacker') return null;
            return null; // always fall through to built-in for kali context
        },

        'whoami': function(args, term, engine) {
            if (E10Config._context === 'iot-shell') return 'iotadmin';
            if (E10Config._context === 'city-os') return 'cityops';
            if (E10Config._context === 'emergency') return 'root';
            return null; // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (E10Config._context === 'iot-shell') return 'uid=1001(iotadmin) gid=1001(iotadmin) groups=1001(iotadmin)';
            if (E10Config._context === 'city-os') return 'uid=1002(cityops) gid=1002(cityops) groups=1002(cityops)';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (E10Config._context === 'iot-shell') return 'SMART-LIGHT-01';
            if (E10Config._context === 'city-os') return 'CITY-OS-01';
            if (E10Config._context === 'emergency') return 'CITY-OS-01';
            return null;
        },

        'exit': function(args, term, engine) {
            if (E10Config._context === 'iot-shell' || E10Config._context === 'city-os' || E10Config._context === 'emergency') {
                E10Config._switchContext('attacker', term);
                return 'Connection closed.\n[+] Returned to attacker machine (kali).';
            }
            return 'logout';
        },

        'ss': function(args) {
            return 'State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port\n'
                + 'LISTEN   0        128      0.0.0.0:22           0.0.0.0:*';
        },

        'netstat': function(args) {
            return E10Config.commands.ss(args);
        },

        'jq': function(args) {
            // Simulate jq as a passthrough hint — real parsing not needed
            return '[jq] JSON piped — use curl directly to read JSON responses in the terminal.';
        },

        'help': function(args) {
            return 'Available commands for this mission:\n\n'
                + '  nmap         Network scanner — map 10.0.90.0/24\n'
                + '  curl         HTTP client — probe API endpoints, inject payloads\n'
                + '  python3      Execute Python scripts (inject_payload.py)\n'
                + '  ping         ICMP echo\n'
                + '  wget         Download files from HTTP endpoints\n'
                + '  nikto        Web vulnerability scanner\n'
                + '  cat          Read local files\n'
                + '  ls           List files/directories\n'
                + '  ip a         Show network interfaces\n'
                + '  route        Show routing table\n'
                + '  whoami       Current user\n'
                + '  id           Current user/group info\n'
                + '  exit         Exit current session\n\n'
                + 'Key files: ~/notes.txt, ~/iot_device_api_spec.json, ~/inject_payload.py\n'
                + 'Targets:   10.0.90.1:8080 (CITY-OS-01)  |  10.0.90.10:7070 (SMART-LIGHT-01)';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        // Builds an inline HTML table for use in browser pages
        var html = '<table style="width:100%; border-collapse:collapse; font-size:0.78rem; font-family:monospace;">';
        html += '<thead><tr>';
        headers.forEach(function(h) {
            html += '<th style="padding:6px 10px; text-align:left; color:#f39c12; border-bottom:1px solid #333; background:#0d0d0d;">' + h + '</th>';
        });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row) {
            html += '<tr>';
            row.forEach(function(cell) {
                html += '<td style="padding:5px 10px; border-bottom:1px solid #1a1a1a; color:#ccc;">' + cell + '</td>';
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        // Safe text content insertion — prevents accidental XSS in browser panel
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        // Converts HTML table content to plain text for terminal output mode
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var tables = tmp.querySelectorAll('table');
        tables.forEach(function(table) {
            var rows = table.querySelectorAll('tr');
            var text = '';
            rows.forEach(function(row) {
                var cells = row.querySelectorAll('td, th');
                var cellTexts = Array.from(cells).map(function(c) { return c.textContent.trim().padEnd(22); });
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — SMART-LIGHT-01 IoT Controller (internal)
    // Accessible conceptually after iotAuthenticated — mirrors
    // the same _webExtFs pattern used in C1 for SSH-pivoted hosts.
    // Terminal commands that context-switch to 'iot-shell' consult
    // this structure for cat/ls responses.
    // ═══════════════════════════════════════════════════════

    _iotBusFs: {
        '/': {
            type: 'dir',
            children: {
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'SMART-LIGHT-01'
                        },
                        'smartnode': {
                            type: 'dir',
                            children: {
                                'device.conf': {
                                    type: 'file',
                                    content: '# SmartNode Industries — Device Configuration\n# SMART-LIGHT-01 Streetlight Controller\n# Firmware: v2.4.1\n\n[auth]\napi_key = DefaultAdminKey\n# TODO: Rotate per SOP-44 before production deployment\n# Last rotated: NEVER\n\n[city_os_integration]\nendpoint = http://10.0.90.1:8080/api/city_os/ingest\nvalidate_tls = false\nretry_on_failure = true\n\n[logging]\nlevel = WARN\nlog_file = /var/log/smartnode/api.log\n\n[node_registry]\ntotal_nodes = 847\nregistered_sectors = Alpha, Beta, Gamma\nheartbeat_interval_sec = 60'
                                },
                                'api_keys.txt': {
                                    type: 'file',
                                    content: '# SmartNode API Key Registry\n# Generated: 2024-06-12\n# Rotation policy: Annual (NEVER DONE)\n\nadmin_key=DefaultAdminKey\nread_only_key=SN-RO-aethel-7f3b\nlegacy_maintenance_key=sn_maint_2021\n\n# WARNING: admin_key grants full write access including report_status\n# A compromised admin_key allows arbitrary node status injection.'
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
                                'smartnode': {
                                    type: 'dir',
                                    children: {
                                        'api.log': {
                                            type: 'file',
                                            content: '2026-03-20 03:10:01 WARN  [api] Unauthenticated probe from 10.0.90.50 on /api/lights/status\n2026-03-20 03:10:48 WARN  [api] Unauthenticated probe from 10.0.90.50 on /api/lights/status\n2026-03-20 03:11:12 INFO  [auth] Successful auth from 10.0.90.50 using api_key=DefaultAdminKey\n2026-03-20 03:11:13 INFO  [api] GET /api/lights/status — 200 OK — 10.0.90.50\n2026-03-20 03:12:09 INFO  [api] POST /api/lights/report_status — node_id=SL-047 status=power_outage — 10.0.90.50\n2026-03-20 03:12:11 INFO  [api] POST /api/lights/report_status — node_id=SL-112 status=power_outage — 10.0.90.50\n2026-03-20 03:12:13 INFO  [api] POST /api/lights/report_status — node_id=SL-229 status=power_outage — 10.0.90.50\n2026-03-20 03:12:15 WARN  [city_os] Threshold breach event propagated to CITY-OS-01. EP-7-BLACKOUT triggered.'
                                        }
                                    }
                                }
                            }
                        },
                        'lib': {
                            type: 'dir',
                            children: {
                                'smartnode': {
                                    type: 'dir',
                                    children: {
                                        'node_registry.json': {
                                            type: 'file',
                                            content: '{\n  "registered_nodes": [\n    {"node_id": "SL-047", "sector": "Gamma", "ip": "10.0.91.47",  "firmware": "v2.4.1", "last_seen": "2026-03-20T03:11:59Z"},\n    {"node_id": "SL-112", "sector": "Gamma", "ip": "10.0.91.112", "firmware": "v2.4.1", "last_seen": "2026-03-20T03:11:59Z"},\n    {"node_id": "SL-229", "sector": "Beta",  "ip": "10.0.91.229", "firmware": "v2.4.1", "last_seen": "2026-03-20T03:11:59Z"},\n    {"node_id": "SL-314", "sector": "Alpha", "ip": "10.0.91.314", "firmware": "v2.3.8", "last_seen": "2026-03-20T03:11:59Z"},\n    {"node_id": "SL-401", "sector": "Alpha", "ip": "10.0.91.401", "firmware": "v2.4.1", "last_seen": "2026-03-20T03:11:59Z"}\n  ],\n  "total": 847,\n  "showing": 5\n}'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'iotadmin': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat /etc/smartnode/device.conf\ncurl -H "X-API-Key: DefaultAdminKey" http://localhost:7070/api/lights/status\nsystemctl status smartnode-api\njourналctl -u smartnode-api -f\ntail -f /var/log/smartnode/api.log'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc — SmartNode IoT Admin\nexport PS1="\\u@SMART-LIGHT-01:\\w\\$ "\nalias ll="ls -la"\nalias apilog="tail -f /var/log/smartnode/api.log"'
                                },
                                'maintenance_notes.txt': {
                                    type: 'file',
                                    content: 'SMART-LIGHT-01 Maintenance Notes\n=================================\n- API config: /etc/smartnode/device.conf\n- API key in config (DEFAULT — never rotated, see SOP-44)\n- Node registry: /var/lib/smartnode/node_registry.json\n- CITY-OS-01 ingest endpoint: http://10.0.90.1:8080/api/city_os/ingest\n- WARNING: report_status payloads forwarded to city with NO validation\n- Any node reporting power_outage triggers EP-7-BLACKOUT if 3+ simultaneous\n- Segmentation note: 10.0.90.0/24 accessible from city research subnet (UNINTENDED)'
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
    // SIMULATED SUBSYSTEM STATES
    // Used by /api/v1/status and event_log to reflect current
    // city state after injection/blackout is triggered.
    // ═══════════════════════════════════════════════════════

    _subsystemStates: {
        power_grid: {
            normal:   { status: 'NOMINAL',  load_pct: 97,  brownout_sectors: [] },
            blackout: { status: 'BROWNOUT', load_pct: 40,  brownout_sectors: ['Beta', 'Gamma'] }
        },
        traffic_ctrl: {
            normal:   { status: 'NOMINAL',  intersections_affected: 0,  mode: 'adaptive' },
            blackout: { status: 'FAILURE',  intersections_affected: 31, mode: 'FLASHING_RED' }
        },
        comms_net: {
            normal:   { status: 'NOMINAL',  public_wifi: 'active',    emergency_broadcast: false },
            blackout: { status: 'DEGRADED', public_wifi: 'suspended', emergency_broadcast: true  }
        },
        surveillance: {
            normal:   { status: 'NOMINAL',  cameras_offline: 0  },
            blackout: { status: 'DEGRADED', cameras_offline: 47 }
        }
    },

    // Returns the current subsystem state object given blackout flag
    _getSubsystemState(subsystem) {
        var states = E10Config._subsystemStates[subsystem];
        if (!states) return { status: 'UNKNOWN' };
        return E10Config._blackoutTriggered ? states.blackout : states.normal;
    }
};
