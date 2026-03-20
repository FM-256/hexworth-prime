/* ============================================================
   CTF ARENA — Box C13: The Subterranean Sabotage
   Multi-Stage Campaign | IT Initial Access, OT Pivot, ICS Protocol Manipulation
   Config: filesystem, web app, OT network sim, protocol engine, flags, hints, lore
   ============================================================ */

const C13Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Subterranean Sabotage',
    subtitle: 'Multi-Stage Campaign — IT Compromise, OT Network Pivot, ICS Protocol Manipulation',
    difficulty: 'Expert',
    accent: '#e67e22',
    storageKey: 'hexworth_ctf_c13',
    registryId: 'c13-subterranean-sabotage',
    trackerKey: 'ctf_c13',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer ICS attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Enumerate IT-MAINTAIN-01. Identify the custom web application, SSH service, and exposed ports.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002'],
            unlocks: ['exploitation'],
            locked: false
        },
        {
            id: 'exploitation',
            name: 'IT Initial Access',
            icon: '\uD83D\uDC89',
            description: 'Exploit the RCE vulnerability in the maintenance web application. Gain a shell as www-data on IT-MAINTAIN-01.',
            requiredFlags: [],
            mitre: ['T1190', 'T1059.004'],
            unlocks: ['ot-gateway'],
            locked: true
        },
        {
            id: 'ot-gateway',
            name: 'OT Gateway Analysis',
            icon: '\uD83D\uDD11',
            description: 'Discover and reverse engineer the ot_gateway binary. Find the internal listening port and its undocumented input format.',
            requiredFlags: ['user'],
            mitre: ['T1046', 'T1552.001', 'T0840'],
            unlocks: ['ot-pivot'],
            locked: true
        },
        {
            id: 'ot-pivot',
            name: 'OT Network Pivot',
            icon: '\uD83D\uDD00',
            description: 'Establish a pivot through the ot_gateway into the isolated OT network (192.168.10.0/24). Reach HMI-CONTROL-01.',
            requiredFlags: ['user'],
            mitre: ['T1021.004', 'T0869', 'T0886'],
            unlocks: ['protocol-analysis'],
            locked: true
        },
        {
            id: 'protocol-analysis',
            name: 'ICS Protocol Analysis',
            icon: '\uD83D\uDCE1',
            description: 'Capture OT traffic via tcpdump on eth1. Analyze the DNP3 stream to identify function codes and coil addresses for Sector Gamma pump control.',
            requiredFlags: ['user'],
            mitre: ['T1040', 'T0842', 'T0861'],
            unlocks: ['sabotage'],
            locked: true
        },
        {
            id: 'sabotage',
            name: 'Sector Gamma Sabotage',
            icon: '\uD83C\uDF0A',
            description: 'Craft and transmit a forged DNP3 Write command via ot_gateway to PLC-PUMP-01. Trigger the controlled flood in Sector Gamma.',
            requiredFlags: ['internal'],
            mitre: ['T0855', 'T0831', 'T0836'],
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
                title: 'Scan IT-MAINTAIN-01',
                tip: 'Open the Terminal and run: nmap -sV 10.10.50.5 — identify all open ports and service versions.',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Exploit the RCE in the maintenance web app',
                tip: 'The /diagnostics endpoint passes user input directly to a shell command. Try: curl "http://10.10.50.5/diagnostics?cmd=id" to verify RCE.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:curl' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:gobuster' } }
                    ]
                }
            },
            {
                title: 'Find the ot_gateway binary and its hidden port',
                tip: 'Once you have RCE, explore the filesystem. Use: curl ".../diagnostics?cmd=find+/usr/local/bin+-name+ot_gateway" then run strings on it or strace it to find the listening port.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Set up a pivot and capture OT traffic',
                tip: 'SSH -L forward port 8888 from IT-MAINTAIN-01, then use tcpdump on eth1 while interacting with HMI-CONTROL-01 at 192.168.10.10. Look for DNP3 packets.',
                trigger: { event: 'flag_correct', match: { flagId: 'internal' } }
            },
            {
                title: 'Craft the sabotage command and retrieve the override code',
                tip: 'Use python3 with scapy or the custom send_dnp3 script to write to coil address 0x0047 (Sector Gamma flood valve) on PLC-PUMP-01 (192.168.10.20). Check /var/log/hmi_status.txt.',
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
            { flagId: 'user', objective: '1.2', description: 'Analyze indicators of malicious activity — Web RCE exploitation and ICS binary reverse engineering', skill: 'Web RCE & Binary Analysis' },
            { flagId: 'internal', objective: '2.4', description: 'Analyze indicators associated with network attacks — OT network pivoting and industrial protocol capture', skill: 'OT Pivoting & Protocol Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Analyze indicators associated with network attacks — ICS protocol forgery and physical process manipulation', skill: 'ICS/SCADA Attack Chain Completion' },
            { flagId: 'root', objective: '3.2', description: 'Given a scenario, apply secure protocols — Absence of DNP3 authentication enables unauthenticated write attacks', skill: 'Industrial Protocol Security' }
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
            'Detecting drives... /dev/sda1 (1TB NVMe)',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.10.50.5 (IT-MAINTAIN-01 — Hydro-Mining Complex)\nOT Network: 192.168.10.0/24 (isolated)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING — multi-hop session state
    // 'attacker'    = kali local machine
    // 'webshell'    = RCE via /diagnostics on IT-MAINTAIN-01 as www-data
    // 'ssh-it'      = SSH to IT-MAINTAIN-01 as hmcadmin
    // 'ot-hmi'      = pivoted to HMI-CONTROL-01 OT web interface via tunnel
    // 'scapy'       = python3 scapy/send_dnp3 session active
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',
    _shellActive: false,        // RCE on /diagnostics confirmed
    _sshAuthenticated: false,   // SSH to IT-MAINTAIN-01 as hmcadmin
    _tunnelActive: false,       // chisel/ssh tunnel to OT (port 8888)
    _tcpdumpRan: false,         // tcpdump on eth1 — captured OT traffic
    _hmiAccessed: false,        // HMI-CONTROL-01 web interface visited
    _sabotageTriggered: false,  // DNP3 write to PLC-PUMP-01 coil 0x0047

    _switchContext(ctx, term) {
        C13Config._context = ctx;
        if (term && term.config) {
            var prompt = C13Config._getPrompt();
            if (prompt) {
                term.config.user    = prompt.split('@')[0] || 'kali';
                term.config.hostname = 'context';
                term._customPrompt  = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (C13Config._context) {
            case 'webshell': return 'www-data@IT-MAINTAIN-01:/var/www/html$ ';
            case 'ssh-it':   return 'hmcadmin@IT-MAINTAIN-01:~$ ';
            case 'ot-hmi':   return 'hmiuser@HMI-CONTROL-01:~$ ';
            case 'scapy':    return '>>> ';
            default:         return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',     points: 150 },   // ot_gateway port + protocol format
        { id: 'internal', points: 200 },   // DNP3 function code + coil address for Sector Gamma
        { id: 'root',     points: 350 }    // Hydro-Core Override Code (flood confirmed)
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2500,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: nmap -sV -p- 10.10.50.5 — the maintenance server exposes more than just SSH and 80/tcp. Once you find the web app, use gobuster to discover the vulnerable endpoint.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The /diagnostics endpoint on port 8080 is vulnerable to command injection via the "cmd" parameter. Test with: curl "http://10.10.50.5:8080/diagnostics?cmd=id" — no encoding needed. Once confirmed, look for /usr/local/bin/ot_gateway.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'To find ot_gateway\'s port, run: curl ".../diagnostics?cmd=strings+/usr/local/bin/ot_gateway" — look for "8888" and "HMCPROT". Then check /opt/hmc/ot_gateway.conf for the protocol format. The gateway expects raw ASCII commands prefixed with "HMCPROT:".',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Set up an SSH tunnel: ssh -L 8888:127.0.0.1:8888 hmcadmin@10.10.50.5 — then run tcpdump on IT-MAINTAIN-01\'s eth1 while sending a probe via ot_gateway. The OT traffic will show DNP3 frames. Look for function code 0x03 (Direct Operate) and object group 12 (control relay).',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint5',
            text: 'To trigger the flood, send via nc or python: echo "HMCPROT:DNP3:WRITE:0x0047:1" | nc 127.0.0.1 8888 — coil 0x0047 is "gamma_flood_valve". Alternatively, use /home/hmcadmin/tools/send_dnp3.py with args: --target 192.168.10.20 --coil 0x0047 --value 1. Then check /var/log/hmi_status.txt on HMI-CONTROL-01.',
            cost: 100,
            penalty: -100
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Hydro-Mining Complex (HMC-OPS-01) extracts rare earth minerals from a vast subterranean network using powerful water pumps and precision drill systems. The OT network controlling these systems is believed to be air-gapped — secured by physical separation and an obscure industrial protocol. But intelligence confirms a single weak link: IT-MAINTAIN-01, an internet-facing maintenance server with a backdoor binary called ot_gateway that bridges the IT and OT networks. Your mission, Peerless: compromise IT-MAINTAIN-01, cross into the OT network through the ot_gateway, reverse engineer the undocumented HMC protocol layer over DNP3, and trigger a controlled flood in Sector Gamma to retrieve the Hydro-Core Override Code.',
        scenario: 'HMC-OPS-01 runs a two-tier network: an IT segment (192.168.100.0/24) for administrative systems and an isolated OT segment (192.168.10.0/24) for industrial control. IT-MAINTAIN-01 sits at the boundary, configured by an overworked systems engineer who left a diagnostic web application running in production — unauthenticated, with no input sanitization. The ot_gateway binary on that machine was built in-house to forward commands to the OT network. Its protocol was never documented. The PLC firmware predates authentication requirements. The SCADA team filed a risk ticket three years ago. It was closed as "acceptable operational risk."',
        outro: 'Sector Gamma has been flooded. The gamma_flood_valve coil on PLC-PUMP-01 was written remotely by an attacker who never physically entered the facility. The Hydro-Core Override Code has been extracted from HMI-CONTROL-01. Mining operations in Sector Gamma are offline. The "air gap" existed only in documentation.',
        ecer: {
            executive: 'Capital expenditure approval required for OT security upgrades; the CISO has no authority over OT systems — those report to the VP of Operations',
            culture: 'IT and OT teams operate in separate silos with no shared security governance; IT security policies are not applied to OT systems',
            employee: 'Maintenance web application deployed to production without security review; ot_gateway binary has no authentication; SSH credentials stored in plaintext config',
            regulatory: 'NERC CIP and IEC 62443 assessments have never been conducted; OT network was self-declared as air-gapped in all compliance filings'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — HMC Maintenance Portal (IT-MAINTAIN-01:8080)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.50.5:8080/',

        pages: {
            '/': {
                title: 'HMC Maintenance Portal — IT-MAINTAIN-01',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#2c3e50; font-size:1.5rem; font-family:monospace; margin-bottom:4px;">HMC Maintenance Portal</h1>
                        <div style="color:#e67e22; font-size:0.85rem; font-weight:700; letter-spacing:0.12em;">HYDRO-MINING COMPLEX — IT-MAINTAIN-01</div>
                        <div style="color:#888; font-size:0.72rem; margin-top:6px;">Internal maintenance and diagnostics interface &mdash; Restricted access</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:4px; padding:12px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#27ae60;">ONLINE</div>
                            <div style="color:#888; font-size:0.68rem;">System Status</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:4px; padding:12px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#2c3e50;">7</div>
                            <div style="color:#888; font-size:0.68rem;">Active Sectors</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:4px; padding:12px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#e67e22;">1</div>
                            <div style="color:#888; font-size:0.68rem;">Pending Alerts</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 16px;">
                        <div style="background:#fff8f0; border:1px solid rgba(230,126,34,0.3); border-radius:4px; padding:12px; font-size:0.75rem; color:#888;">
                            <strong style="color:#e67e22;">Navigation:</strong>
                            <a href="/status" style="color:#e67e22; margin-left:10px;">/status</a>
                            <a href="/logs" style="color:#e67e22; margin-left:10px;">/logs</a>
                            <a href="/diagnostics" style="color:#e67e22; margin-left:10px;">/diagnostics</a>
                            <a href="/config" style="color:#e67e22; margin-left:10px;">/config</a>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:10px 12px; background:rgba(231,76,60,0.04); border:1px solid rgba(231,76,60,0.12); border-radius:4px; font-size:0.72rem; color:#aaa;">
                        <strong style="color:#c0392b;">NOTICE:</strong> Diagnostics endpoint operational at <a href="/diagnostics" style="color:#c0392b;">/diagnostics</a>. Use <code>?cmd=</code> parameter for system health checks.
                    </div>
                `,
                formHandler: null
            },

            '/status': {
                title: 'System Status — IT-MAINTAIN-01',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#2c3e50; font-size:1.1rem; margin-bottom:12px;">System Status</h2>
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <thead><tr>
                                <th style="padding:7px 12px; text-align:left; color:#e67e22; border-bottom:2px solid #eee;">Host</th>
                                <th style="padding:7px 12px; text-align:left; color:#e67e22; border-bottom:2px solid #eee;">IP</th>
                                <th style="padding:7px 12px; text-align:left; color:#e67e22; border-bottom:2px solid #eee;">Role</th>
                                <th style="padding:7px 12px; text-align:left; color:#e67e22; border-bottom:2px solid #eee;">Status</th>
                            </tr></thead>
                            <tbody>
                                <tr><td style="padding:6px 12px; border-bottom:1px solid #f5f5f5;">IT-MAINTAIN-01</td><td style="padding:6px 12px; border-bottom:1px solid #f5f5f5;">10.10.50.5 / 192.168.100.5</td><td style="padding:6px 12px; border-bottom:1px solid #f5f5f5;">IT Maintenance</td><td style="padding:6px 12px; border-bottom:1px solid #f5f5f5; color:#27ae60;">ONLINE</td></tr>
                                <tr><td style="padding:6px 12px; border-bottom:1px solid #f5f5f5;">HMI-CONTROL-01</td><td style="padding:6px 12px; border-bottom:1px solid #f5f5f5;">192.168.10.10</td><td style="padding:6px 12px; border-bottom:1px solid #f5f5f5;">SCADA/HMI</td><td style="padding:6px 12px; border-bottom:1px solid #f5f5f5; color:#27ae60;">ONLINE</td></tr>
                                <tr><td style="padding:6px 12px; border-bottom:1px solid #f5f5f5;">PLC-PUMP-01</td><td style="padding:6px 12px; border-bottom:1px solid #f5f5f5;">192.168.10.20</td><td style="padding:6px 12px; border-bottom:1px solid #f5f5f5;">PLC (Pumps/Valves)</td><td style="padding:6px 12px; border-bottom:1px solid #f5f5f5; color:#27ae60;">ONLINE</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="padding:10px 12px; background:#f8f9fa; border:1px solid #eee; border-radius:4px; font-size:0.72rem; color:#aaa;">
                        OT segment reachable only via ot_gateway — see /config for details.
                    </div>
                `,
                formHandler: null
            },

            '/logs': {
                title: 'System Logs — IT-MAINTAIN-01',
                html: `
                    <div style="margin-bottom:10px;">
                        <h2 style="color:#2c3e50; font-size:1.1rem; margin-bottom:10px;">Recent System Logs</h2>
                    </div>
                    <div style="background:#1a1a2e; color:#ccc; padding:14px; border-radius:6px; font-family:monospace; font-size:0.75rem; line-height:1.6; max-height:320px; overflow-y:auto;">
                        Mar 20 08:01:03 IT-MAINTAIN-01 systemd[1]: Started HMC Maintenance Web Service.<br>
                        Mar 20 08:01:04 IT-MAINTAIN-01 ot_gateway[1842]: Listening on 127.0.0.1:8888 (HMCPROT/DNP3 bridge)<br>
                        Mar 20 08:01:05 IT-MAINTAIN-01 ot_gateway[1842]: OT bridge ready — target: 192.168.10.20:20000<br>
                        Mar 20 08:14:22 IT-MAINTAIN-01 sshd[2210]: Accepted publickey for hmcadmin from 192.168.100.1<br>
                        Mar 20 08:15:11 IT-MAINTAIN-01 maintweb[1841]: GET /diagnostics?cmd=df+-h 200<br>
                        Mar 20 08:15:44 IT-MAINTAIN-01 maintweb[1841]: GET /status 200<br>
                        Mar 20 09:02:17 IT-MAINTAIN-01 kernel: eth1: link up 1Gbps<br>
                        Mar 20 09:14:03 IT-MAINTAIN-01 ot_gateway[1842]: Relayed 1 packet to 192.168.10.20:20000<br>
                    </div>
                `,
                formHandler: null
            },

            '/diagnostics': {
                title: 'Diagnostics — IT-MAINTAIN-01',
                html: function() {
                    return `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#2c3e50; font-size:1.1rem; margin-bottom:6px;">System Diagnostics</h2>
                        <div style="color:#aaa; font-size:0.72rem; margin-bottom:14px;">Run system health checks. Use the <code>cmd</code> parameter to specify the command.</div>
                    </div>
                    <div style="max-width:500px;">
                        <div style="display:flex; gap:8px; margin-bottom:12px;">
                            <input type="text" data-field="cmd" placeholder="e.g. df -h"
                                   style="flex:1; padding:8px 12px; border:1px solid #ccc; border-radius:4px; font-family:monospace; font-size:0.82rem;">
                            <button data-action="run-diag"
                                    style="padding:8px 18px; background:#e67e22; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Run</button>
                        </div>
                        <div style="color:#aaa; font-size:0.68rem; margin-bottom:6px;">Supported: df, uptime, ps, uname — or pass any shell command for extended diagnostics.</div>
                    </div>
                    ${C13Config._shellActive ? '<div style="color:#e67e22; font-size:0.7rem; padding:6px 10px; background:rgba(230,126,34,0.06); border:1px solid rgba(230,126,34,0.2); border-radius:4px; margin-top:10px;">[!] Command injection active on this endpoint.</div>' : ''}
                    `;
                },
                formHandler: function(data, engine) {
                    const cmd = (data.cmd || '').trim();
                    if (!cmd) return '<div style="color:#e74c3c; padding:8px;">No command specified.</div>';
                    C13Config._shellActive = true;
                    if (engine) engine.advancePhase && engine.advancePhase('exploitation');
                    return C13Config._webDiagOutput(cmd, engine);
                }
            },

            '/config': {
                title: 'Forbidden',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">You don't have permission to access this resource.</p>
                    <p style="color:#aaa; font-size:0.75rem;">nginx/1.18.0 (Debian) — IT-MAINTAIN-01:8080</p>
                </div>`,
                formHandler: null
            },

            '/hmi': {
                title: 'HMI-CONTROL-01 — SCADA Interface',
                html: function() {
                    if (!C13Config._tunnelActive) {
                        return '<div style="text-align:center; padding:40px;"><h1 style="color:#e74c3c; font-size:2rem;">ERR_CONNECTION_REFUSED</h1><p style="color:#888;">192.168.10.10 refused to connect. The OT network is not directly reachable from your attacker machine.<br>Establish a pivot first.</p></div>';
                    }
                    C13Config._hmiAccessed = true;
                    return `
                    <div style="text-align:center; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#2c3e50; font-size:1.3rem; font-family:monospace; margin-bottom:4px;">SCADA HMI — Hydro-Mining Complex</h1>
                        <div style="color:#e67e22; font-size:0.8rem; font-weight:700; letter-spacing:0.1em;">HMI-CONTROL-01 &mdash; SECTOR OVERVIEW</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
                        <div style="background:#f0fff4; border:1px solid #b2dfdb; border-radius:4px; padding:12px;">
                            <div style="font-size:0.72rem; color:#888; margin-bottom:4px;">SECTOR ALPHA</div>
                            <div style="color:#27ae60; font-weight:700;">NOMINAL</div>
                            <div style="font-size:0.68rem; color:#aaa;">Pump speed: 1240 RPM | Valve: OPEN</div>
                        </div>
                        <div style="background:#f0fff4; border:1px solid #b2dfdb; border-radius:4px; padding:12px;">
                            <div style="font-size:0.72rem; color:#888; margin-bottom:4px;">SECTOR BETA</div>
                            <div style="color:#27ae60; font-weight:700;">NOMINAL</div>
                            <div style="font-size:0.68rem; color:#aaa;">Pump speed: 1180 RPM | Valve: OPEN</div>
                        </div>
                        <div style="background:${C13Config._sabotageTriggered ? 'rgba(231,76,60,0.08)' : '#f0fff4'}; border:1px solid ${C13Config._sabotageTriggered ? 'rgba(231,76,60,0.4)' : '#b2dfdb'}; border-radius:4px; padding:12px;">
                            <div style="font-size:0.72rem; color:#888; margin-bottom:4px;">SECTOR GAMMA</div>
                            <div style="color:${C13Config._sabotageTriggered ? '#e74c3c' : '#27ae60'}; font-weight:700;">${C13Config._sabotageTriggered ? 'FLOOD ACTIVE' : 'NOMINAL'}</div>
                            <div style="font-size:0.68rem; color:#aaa;">Pump speed: ${C13Config._sabotageTriggered ? '3200 RPM' : '1150 RPM'} | Valve: ${C13Config._sabotageTriggered ? 'OVERRIDE-OPEN' : 'OPEN'}</div>
                        </div>
                        <div style="background:#f0fff4; border:1px solid #b2dfdb; border-radius:4px; padding:12px;">
                            <div style="font-size:0.72rem; color:#888; margin-bottom:4px;">SECTOR DELTA</div>
                            <div style="color:#27ae60; font-weight:700;">NOMINAL</div>
                            <div style="font-size:0.68rem; color:#aaa;">Pump speed: 1300 RPM | Valve: OPEN</div>
                        </div>
                    </div>
                    <div style="max-width:600px; margin:0 auto; padding:10px 12px; background:#f8f9fa; border:1px solid #eee; border-radius:4px; font-size:0.7rem; color:#aaa;">
                        PLC-PUMP-01 at 192.168.10.20 &mdash; DNP3 over TCP port 20000 &mdash; Coil map: 0x0045=alpha_flood, 0x0046=beta_flood, 0x0047=gamma_flood_valve, 0x0048=delta_flood
                    </div>
                    `;
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB DIAGNOSTICS RCE SIMULATOR
    // Returns output as if command ran on IT-MAINTAIN-01 as www-data
    // ═══════════════════════════════════════════════════════

    _webDiagOutput(cmd, engine) {
        const c = cmd.replace(/\+/g, ' ').trim();
        const wrap = (text) => `<div style="background:#1a1a2e; color:#ccc; padding:12px; border-radius:6px; font-family:monospace; font-size:0.78rem; line-height:1.6; white-space:pre-wrap; margin-top:12px;">${C13Config._escHtml(text)}</div>`;

        if (c === 'id' || c === 'whoami') {
            return wrap(c === 'id' ? 'uid=33(www-data) gid=33(www-data) groups=33(www-data)' : 'www-data');
        }
        if (c === 'uname -a' || c === 'uname') {
            return wrap('Linux IT-MAINTAIN-01 5.10.0-21-amd64 #1 SMP Debian 5.10.162-1 (2023-01-21) x86_64 GNU/Linux');
        }
        if (c === 'hostname') return wrap('IT-MAINTAIN-01');
        if (c === 'pwd')      return wrap('/var/www/html');
        if (c === 'df -h' || c === 'df') {
            return wrap('Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        98G   14G   79G  16% /\ntmpfs           7.8G     0  7.8G   0% /dev/shm');
        }
        if (c === 'uptime') {
            return wrap(' 09:14:03 up 1 day, 1:12,  1 user,  load average: 0.08, 0.05, 0.01');
        }
        if (c === 'ps aux' || c === 'ps') {
            return wrap('USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.0  22520  1440 ?        Ss   Mar19   0:01 /sbin/init\nwww-data  1841  0.1  0.2  98340  8120 ?        Ss   08:01   0:03 python3 /opt/hmc/maintweb.py\nroot      1842  0.0  0.1  14280  3200 ?        Ss   08:01   0:00 /usr/local/bin/ot_gateway\nsshd      1901  0.0  0.1  15852  3840 ?        Ss   08:01   0:00 /usr/sbin/sshd -D\nhmcadmin  2215  0.0  0.1  22440  4100 pts/0    Ss   08:14   0:00 -bash');
        }
        if (c === 'ip a' || c === 'ip addr' || c === 'ifconfig') {
            return wrap('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 10.10.50.5/24 brd 10.10.50.255 scope global eth0\n3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 192.168.100.5/24 brd 192.168.100.255 scope global eth1');
        }
        if (c.includes('ls') && (c.includes('/usr/local/bin') || c.includes('local/bin'))) {
            return wrap('chisel  nc  ot_gateway  socat');
        }
        if (c === 'ls' || c === 'ls -la' || c === 'ls /var/www/html' || c === 'ls -la /var/www/html') {
            return wrap('total 20\ndrwxr-xr-x 2 www-data www-data 4096 Mar 20 08:01 .\ndrwxr-xr-x 4 root     root     4096 Mar 19 10:22 ..\n-rw-r--r-- 1 www-data www-data 3104 Mar 20 08:01 index.html\n-rwxr-xr-x 1 www-data www-data 2880 Mar 20 08:01 maintweb.py');
        }
        if (c.includes('ls') && c.includes('/opt/hmc')) {
            return wrap('maintweb.py  ot_gateway.conf  README.txt');
        }
        if (c.includes('ls') && c.includes('/home')) {
            return wrap('hmcadmin');
        }
        if (c.includes('cat') && c.includes('ot_gateway.conf')) {
            if (engine) engine.advancePhase && engine.advancePhase('ot-gateway');
            return wrap('# ot_gateway configuration\n# Hydro-Mining Complex OT Bridge\n# DO NOT MODIFY without authorization\n\nLISTEN_ADDR=127.0.0.1\nLISTEN_PORT=8888\nOT_TARGET=192.168.10.20\nOT_PORT=20000\n\n# Protocol wrapper\n# Input format: HMCPROT:<PROTOCOL>:<ACTION>:<COIL_ADDR>:<VALUE>\n# Example: HMCPROT:DNP3:WRITE:0x0047:1\n# Supported protocols: DNP3, OPCUA\n# This binary forwards raw input to PLC-PUMP-01 after protocol encapsulation.\n# WARNING: No authentication configured. Internal use only.\n\n{{FLAG:user}}');
        }
        if (c.includes('cat') && c.includes('README')) {
            return wrap('HMC OT Gateway — Hydro-Mining Complex\n======================================\nThis service bridges IT-MAINTAIN-01 to the isolated OT network.\nThe ot_gateway binary listens on localhost:8888 and forwards\ncommands to the OT network target (PLC-PUMP-01).\n\nProtocol: HMCPROT (custom wrapper over DNP3 or OPC UA)\nSee ot_gateway.conf for full configuration.\n\nContact: SCADA-TEAM@hmc-ops.internal');
        }
        if (c.includes('cat') && c.includes('/etc/passwd')) {
            return wrap('root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nhmcadmin:x:1001:1001:HMC Admin:/home/hmcadmin:/bin/bash\nsshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin');
        }
        if (c.includes('cat') && c.includes('/etc/hostname')) return wrap('IT-MAINTAIN-01');
        if (c.includes('find') && c.includes('ot_gateway')) {
            return wrap('/usr/local/bin/ot_gateway\n/opt/hmc/ot_gateway.conf');
        }
        if (c.includes('strings') && c.includes('ot_gateway')) {
            if (engine) engine.advancePhase && engine.advancePhase('ot-gateway');
            return wrap('/lib/x86_64-linux-gnu/libc.so.6\nbind\nlisten\naccept\nsend\nrecv\n127.0.0.1\n8888\nHMCPROT\nDNP3\nOPCUA\nWRITE\nREAD\nPLC-PUMP-01\n192.168.10.20\n20000\ngamma_flood_valve\ncoil_write_ok\ncoil_write_fail\nInvalid HMCPROT prefix\nReady. Listening on %s:%d\nForwarding to OT target: %s:%d');
        }
        if ((c.includes('netstat') || c.includes('ss -tlnp')) && !c.includes('curl')) {
            return wrap('Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1901/sshd\ntcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN      1841/python3\ntcp        0      0 127.0.0.1:8888          0.0.0.0:*               LISTEN      1842/ot_gateway');
        }
        if (c.includes('cat') && (c.includes('.bash_history') || c.includes('bash_history'))) {
            return wrap('ssh 192.168.10.10\ncat /opt/hmc/ot_gateway.conf\necho "HMCPROT:DNP3:READ:0x0001:0" | nc 127.0.0.1 8888\ntcpdump -i eth1 -w /tmp/ot_capture.pcap\nstrings /usr/local/bin/ot_gateway | grep -i coil\nps aux | grep ot');
        }
        if (c.includes('cat') && c.includes('ssh_creds')) {
            return wrap('# SSH Credentials — IT-MAINTAIN-01\n# Stored for automated maintenance scripts\n# TODO: migrate to key-based auth\n\nUsername: hmcadmin\nPassword: HmcM@int2024!\n\n# Connection: ssh hmcadmin@10.10.50.5');
        }
        if (c.includes('ls') && c.includes('/home/hmcadmin')) {
            return wrap('.bash_history  .bashrc  .profile  .ssh  tools  notes.txt');
        }
        if (c.includes('cat') && c.includes('notes.txt')) {
            return wrap('SCADA Access Notes\n==================\nHMI web interface: http://192.168.10.10/ (admin / HmcScada#1)\nPLC-PUMP-01 direct: 192.168.10.20:20000 (DNP3, no auth)\n\nCoil map (PLC-PUMP-01):\n  0x0045 = alpha_flood_valve\n  0x0046 = beta_flood_valve\n  0x0047 = gamma_flood_valve  <-- CRITICAL: flood control Sector Gamma\n  0x0048 = delta_flood_valve\n\nDO NOT test write commands in production. Use HMI interface only.\n\n{{FLAG:internal}}');
        }
        if (c.includes('ls') && c.includes('tools')) {
            return wrap('send_dnp3.py  pcap_parser.py  hmc_probe.sh');
        }
        if (c.includes('cat') && c.includes('send_dnp3.py')) {
            return wrap('#!/usr/bin/env python3\n# send_dnp3.py — Send a DNP3 control command via ot_gateway\n# Usage: python3 send_dnp3.py --target <ip> --coil <addr> --value <0|1>\n#\n# This script wraps a DNP3 Direct Operate command in the HMCPROT\n# format expected by ot_gateway and sends it over TCP to the gateway.\n#\n# Example:\n#   python3 send_dnp3.py --target 192.168.10.20 --coil 0x0047 --value 1\n#\nimport socket, argparse, sys\n\nparser = argparse.ArgumentParser()\nparser.add_argument("--target")\nparser.add_argument("--coil")\nparser.add_argument("--value")\nargs = parser.parse_args()\n\ncmd = f"HMCPROT:DNP3:WRITE:{args.coil}:{args.value}\\n"\nprint(f"[*] Sending: {cmd.strip()}")\nwith socket.create_connection(("127.0.0.1", 8888), timeout=5) as s:\n    s.sendall(cmd.encode())\n    resp = s.recv(1024)\n    print(f"[+] Response: {resp.decode()}")\n');
        }
        // Generic fallback — unknown command simulated on IT-MAINTAIN-01 as www-data
        return wrap(`sh: ${cmd}: command not found`);
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED OT STATUS DATA (HMI-CONTROL-01 log)
    // ═══════════════════════════════════════════════════════

    _hmiLog: [
        { ts: 'Mar 20 08:01:05', event: 'SYSTEM_START',    sector: 'ALL',   detail: 'HMI initialized. All sectors nominal.' },
        { ts: 'Mar 20 08:14:03', event: 'COIL_READ',       sector: 'ALPHA', detail: 'coil=0x0045 value=0 (valve closed nominal)' },
        { ts: 'Mar 20 08:14:09', event: 'COIL_READ',       sector: 'GAMMA', detail: 'coil=0x0047 value=0 (gamma_flood_valve closed)' },
        { ts: 'Mar 20 09:02:17', event: 'PUMP_STATUS',     sector: 'GAMMA', detail: 'PLC-PUMP-01 Sector Gamma speed=1150rpm pressure=42psi OK' },
        { ts: 'Mar 20 09:14:03', event: 'KEEPALIVE',       sector: 'ALL',   detail: 'PLC-PUMP-01 heartbeat OK' }
    ],

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — attacker machine (kali)
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
                                    content: '=== MISSION BRIEFING: SUBTERRANEAN SABOTAGE ===\nTarget: 10.10.50.5 (IT-MAINTAIN-01 — Hydro-Mining Complex)\nObjective: Multi-stage ICS attack — OT network sabotage\n\nAttack chain:\n1. Scan IT-MAINTAIN-01 — identify web app on 8080\n2. Exploit RCE via /diagnostics?cmd= endpoint\n3. Enumerate ot_gateway binary — find port 8888 + HMCPROT format (Flag 1)\n4. SSH in as hmcadmin — find DNP3 coil map for Sector Gamma (Flag 2)\n5. Tunnel to OT — craft DNP3 write command to coil 0x0047\n6. Trigger controlled flood in Sector Gamma — retrieve Hydro-Core Override Code (Flag 3)\n\nOT network: 192.168.10.0/24 — isolated, reachable only via ot_gateway on IT-MAINTAIN-01.\nGood luck, Peerless.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.10.50.5\ncurl http://10.10.50.5:8080/\ngobuster dir -u http://10.10.50.5:8080/ -w /usr/share/wordlists/dirb/common.txt'
                                },
                                'send_dnp3.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# Local copy of DNP3 send script\n# Usage: python3 send_dnp3.py --target 192.168.10.20 --coil 0x0047 --value 1\nimport socket, argparse\nparser = argparse.ArgumentParser()\nparser.add_argument("--target")\nparser.add_argument("--coil")\nparser.add_argument("--value")\nargs = parser.parse_args()\ncmd = f"HMCPROT:DNP3:WRITE:{args.coil}:{args.value}\\n"\nprint(f"[*] Sending: {cmd.strip()}")\nwith socket.create_connection(("127.0.0.1", 8888), timeout=5) as s:\n    s.sendall(cmd.encode())\n    resp = s.recv(1024)\n    print(f"[+] Response: {resp.decode()}")'
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
                                        },
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\nbackup\ncgi-bin\nconfig\ndata\ndiagnostics\nlogs\nphpmyadmin\nserver-status\nstatus\ntest\nuploads'
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
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd':   { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash' }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — IT-MAINTAIN-01 (after SSH as hmcadmin)
    // ═══════════════════════════════════════════════════════

    _itMaintainFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'hmc': {
                            type: 'dir',
                            children: {
                                'maintweb.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# HMC Maintenance Web Application\n# WARNING: /diagnostics endpoint passes user input directly to subprocess\n# TODO: sanitize cmd parameter before production\nimport subprocess, http.server, urllib.parse\n\nclass Handler(http.server.BaseHTTPRequestHandler):\n    def do_GET(self):\n        if self.path.startswith("/diagnostics"):\n            qs = urllib.parse.urlparse(self.path).query\n            params = urllib.parse.parse_qs(qs)\n            cmd = params.get("cmd", [""])[0]\n            out = subprocess.check_output(cmd, shell=True)  # UNSAFE\n            self.send_response(200)\n            self.end_headers()\n            self.wfile.write(out)\n        ...\n'
                                },
                                'ot_gateway.conf': {
                                    type: 'file',
                                    content: '# ot_gateway configuration\n# Hydro-Mining Complex OT Bridge\n\nLISTEN_ADDR=127.0.0.1\nLISTEN_PORT=8888\nOT_TARGET=192.168.10.20\nOT_PORT=20000\n\n# Input format: HMCPROT:<PROTOCOL>:<ACTION>:<COIL_ADDR>:<VALUE>\n# Example: HMCPROT:DNP3:WRITE:0x0047:1\n\n{{FLAG:user}}'
                                },
                                'README.txt': {
                                    type: 'file',
                                    content: 'HMC OT Gateway — Hydro-Mining Complex\n======================================\nBridges IT-MAINTAIN-01 to the isolated OT network.\nListens on localhost:8888. Protocol: HMCPROT over DNP3.\nSee ot_gateway.conf for full configuration.'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'local': {
                            type: 'dir',
                            children: {
                                'bin': {
                                    type: 'dir',
                                    children: {
                                        'ot_gateway': {
                                            type: 'file',
                                            content: '[ELF binary — use strings or objdump to analyze. Key strings: 127.0.0.1, 8888, HMCPROT, DNP3, gamma_flood_valve]'
                                        },
                                        'chisel': {
                                            type: 'file',
                                            content: '[chisel tunneling binary — available for use]'
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
                        'hmcadmin': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ssh 192.168.10.10\ncat /opt/hmc/ot_gateway.conf\necho "HMCPROT:DNP3:READ:0x0001:0" | nc 127.0.0.1 8888\ntcpdump -i eth1 -w /tmp/ot_capture.pcap\nstrings /usr/local/bin/ot_gateway | grep -i coil\nps aux | grep ot'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc: executed by bash(1) for non-login shells.\nexport PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"\nalias chk="systemctl status ot_gateway"'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: 'SCADA Access Notes\n==================\nHMI web interface: http://192.168.10.10/ (admin / HmcScada#1)\nPLC-PUMP-01 direct: 192.168.10.20:20000 (DNP3, no auth)\n\nCoil map (PLC-PUMP-01):\n  0x0045 = alpha_flood_valve\n  0x0046 = beta_flood_valve\n  0x0047 = gamma_flood_valve  <-- CRITICAL: flood control Sector Gamma\n  0x0048 = delta_flood_valve\n\nDO NOT test write commands in production. Use HMI interface only.\n\n{{FLAG:internal}}'
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'send_dnp3.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# send_dnp3.py — Send a DNP3 control command via ot_gateway\n# Usage: python3 send_dnp3.py --target <ip> --coil <addr> --value <0|1>\nimport socket, argparse\nparser = argparse.ArgumentParser()\nparser.add_argument("--target")\nparser.add_argument("--coil")\nparser.add_argument("--value")\nargs = parser.parse_args()\ncmd = f"HMCPROT:DNP3:WRITE:{args.coil}:{args.value}\\n"\nprint(f"[*] Sending: {cmd.strip()}")\nwith socket.create_connection(("127.0.0.1", 8888), timeout=5) as s:\n    s.sendall(cmd.encode())\n    resp = s.recv(1024)\n    print(f"[+] Response: {resp.decode()}")'
                                        },
                                        'pcap_parser.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# pcap_parser.py — Parse OT traffic capture\n# Usage: python3 pcap_parser.py /tmp/ot_capture.pcap\nimport sys\nprint(f"Parsing {sys.argv[1]}...")\nprint("Frame 1: DNP3 Direct Operate Request — func=0x03 obj_grp=12 coil=0x0047 val=1 src=192.168.100.5 dst=192.168.10.20")\nprint("Frame 2: DNP3 Response — coil_write_ok coil=0x0047")'
                                        },
                                        'hmc_probe.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# hmc_probe.sh — Quick probe of ot_gateway\necho "HMCPROT:DNP3:READ:0x0001:0" | nc 127.0.0.1 8888\necho "Probe sent."'
                                        }
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
                                'hmi_status.txt': {
                                    type: 'file',
                                    content: function() {
                                        if (C13Config._sabotageTriggered) {
                                            return '=== HMI STATUS LOG ===\nMar 20 09:14:03 KEEPALIVE PLC-PUMP-01 OK all sectors nominal\nMar 20 09:14:11 COIL_WRITE PLC-PUMP-01 coil=0x0047 (gamma_flood_valve) value=1 -- ACCEPTED\nMar 20 09:14:11 ALARM SECTOR_GAMMA FLOOD_ACTIVE pump_speed=3200rpm pressure=OVERLOAD\nMar 20 09:14:12 SYSTEM HYDRO-CORE OVERRIDE CODE ISSUED\n\n{{FLAG:root}}\n\nMar 20 09:14:12 EMERGENCY Sector Gamma flood event confirmed. Mining halt initiated.';
                                        }
                                        return '=== HMI STATUS LOG ===\nMar 20 08:01:05 SYSTEM_START all sectors nominal\nMar 20 08:14:09 COIL_READ coil=0x0047 value=0 (gamma_flood_valve closed)\nMar 20 09:02:17 PUMP_STATUS Sector Gamma speed=1150rpm pressure=42psi OK\nMar 20 09:14:03 KEEPALIVE PLC-PUMP-01 OK all sectors nominal';
                                    }
                                }
                            }
                        },
                        'tmp': { type: 'dir', children: {
                            'ot_capture.pcap': {
                                type: 'file',
                                content: '[Binary PCAP file — use python3 tools/pcap_parser.py /tmp/ot_capture.pcap to parse DNP3 frames]'
                            }
                        }}
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'IT-MAINTAIN-01' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nhmcadmin:x:1001:1001:HMC Admin:/home/hmcadmin:/bin/bash\nsshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin'
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tool overrides)
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.10.50.5';
            const target = args.find(a => !a.startsWith('-')) || '';

            // IT-MAINTAIN-01 — external-facing
            if (!target || target === '10.10.50.5') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.50.5 (IT-MAINTAIN-01)
Host is up (0.034s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 8.4p1 Debian 5 (protocol 2.0)
8080/tcp open  http-proxy  Python/3.9 http.server (Maintenance Portal)
8888/tcp open  ddi-tcp-1   unknown

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 14.72 seconds`;
            }

            // OT network — only from IT context via tunnel
            if (target === '192.168.10.0/24') {
                if (C13Config._context === 'attacker') {
                    return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 0 IP addresses (0 hosts up) scanned in 3.01 seconds
[!] The OT network (192.168.10.0/24) is not reachable from your attacker machine. You need a pivot.`;
                }
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 192.168.10.10 (HMI-CONTROL-01)
Host is up (0.00031s latency).
PORT   STATE SERVICE  VERSION
22/tcp open  ssh      OpenSSH 8.9p1 Ubuntu
80/tcp open  http     nginx 1.22.1

Nmap scan report for 192.168.10.20 (PLC-PUMP-01)
Host is up (0.00027s latency).
PORT      STATE SERVICE
20000/tcp open  dnp3-sec  (DNP3 industrial protocol)

Nmap done: 256 IP addresses (2 hosts up) scanned in 31.44 seconds`;
            }

            if ((target === '192.168.10.10' || target === '192.168.10.20') && C13Config._context === 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds
[!] OT hosts are not reachable directly. Establish a pivot through IT-MAINTAIN-01 first.`;
            }

            if (target === '192.168.10.10' && C13Config._context !== 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 192.168.10.10 (HMI-CONTROL-01)
Host is up (0.00031s latency).
PORT   STATE SERVICE  VERSION
22/tcp open  ssh      OpenSSH 8.9p1 Ubuntu 3ubuntu0.1
80/tcp open  http     nginx 1.22.1 (SCADA/HMI Interface)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 6.18 seconds`;
            }

            if (target === '192.168.10.20' && C13Config._context !== 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 192.168.10.20 (PLC-PUMP-01)
Host is up (0.00027s latency).

PORT      STATE SERVICE   VERSION
20000/tcp open  dnp3      DNP3 (Distributed Network Protocol 3)

Service Info: Device type: PLC; firmware 2.1.4; Authentication: NONE

Nmap done: 1 IP address (1 host up) scanned in 5.88 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                if (C13Config._tunnelActive) {
                    return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00009s latency).

PORT     STATE SERVICE
8888/tcp open  hmcprot-bridge  (ot_gateway)

Nmap done: 1 IP address (1 host up) scanned in 0.08 seconds`;
                }
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00009s latency).
All 1000 scanned ports on localhost are closed.
Nmap done: 1 IP address (1 host up) scanned in 0.08 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            const url = args.find(a => a.startsWith('http')) || '';
            if (url.includes('10.10.50.5')) {
                return `Gobuster v3.6
[+] Url:            http://10.10.50.5:8080/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/config              (Status: 403) [Size: 289]
/diagnostics         (Status: 200) [Size: 1842]
/logs                (Status: 200) [Size: 3104]
/status              (Status: 200) [Size: 2208]
===============================================================
Finished`;
            }
            return `Gobuster v3.6\n[+] Error: could not connect to target ${url}\nConnection refused`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            if (target.includes('10.10.50.5')) {
                return `---- Scanning URL: ${target} ----
+ ${target.replace(/\/$/, '')}/diagnostics (CODE:200|SIZE:1842)
+ ${target.replace(/\/$/, '')}/logs (CODE:200|SIZE:3104)
+ ${target.replace(/\/$/, '')}/status (CODE:200|SIZE:2208)
+ ${target.replace(/\/$/, '')}/config (CODE:403|SIZE:289)

---- Results ----
4 results found.`;
            }
            return `---- Scanning URL: ${target} ----\nCould not connect. Is the target reachable?\n---- 0 results ----`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => a.startsWith('http') || a.startsWith('"http')) || '';
            const cleanUrl = url.replace(/['"]/g, '');

            // RCE via diagnostics endpoint
            if (cleanUrl.includes('/diagnostics') && cleanUrl.includes('cmd=')) {
                C13Config._shellActive = true;
                if (engine) engine.advancePhase && engine.advancePhase('exploitation');
                const cmdMatch = cleanUrl.match(/cmd=([^&"'\s]*)/);
                const rawCmd = cmdMatch ? decodeURIComponent(cmdMatch[1]) : '';
                if (!rawCmd) return 'www-data';
                return C13Config._webDiagOutput(rawCmd, engine);
            }

            // Regular curl to maintenance portal pages
            if (cleanUrl.includes('10.10.50.5:8080') || cleanUrl.includes('10.10.50.5')) {
                if (cleanUrl.includes('/logs')) {
                    return `HTTP/1.1 200 OK\nContent-Type: text/html\n\n[HMC Maintenance Portal — /logs page — use browser to view full output]`;
                }
                if (cleanUrl.includes('/status')) {
                    return `HTTP/1.1 200 OK\n\nIT-MAINTAIN-01: ONLINE\nHMI-CONTROL-01: ONLINE\nPLC-PUMP-01: ONLINE`;
                }
                return `HTTP/1.1 200 OK\nContent-Type: text/html\nServer: python/3.9\n\n<!-- HMC Maintenance Portal — use browser for full interface -->\n<h1>HMC Maintenance Portal</h1>`;
            }

            // nc-style send to ot_gateway through tunnel
            if (cleanUrl.includes('127.0.0.1:8888') || cleanUrl.includes('localhost:8888')) {
                if (!C13Config._tunnelActive) {
                    return `curl: (7) Failed to connect to 127.0.0.1 port 8888: Connection refused\n[!] No tunnel active. Set up an SSH port forward or chisel tunnel first.`;
                }
                return `curl: (1) Received HTTP/0.9 when not allowed\n[!] ot_gateway speaks a custom binary protocol (HMCPROT), not HTTP. Use nc or python3 to send raw commands.`;
            }

            // HMI web interface via tunnel
            if (cleanUrl.includes('192.168.10.10') && !C13Config._tunnelActive) {
                return `curl: (7) Failed to connect to 192.168.10.10: Network unreachable\n[!] OT network is isolated. You need a pivot (chisel or SSH tunnel) to reach 192.168.10.10.`;
            }
            if (cleanUrl.includes('192.168.10.10') && C13Config._tunnelActive) {
                C13Config._hmiAccessed = true;
                return `HTTP/1.1 200 OK\nContent-Type: text/html\nServer: nginx/1.22.1\n\n<!-- HMI-CONTROL-01 SCADA Interface — Open in browser via tunnel for full interface -->\n<h1>SCADA HMI — Sector Overview</h1>`;
            }

            return `curl: (7) Failed to connect to ${cleanUrl.split('/')[2] || 'host'}: Connection refused`;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // SSH port forward to ot_gateway
            if (fullCmd.includes('-L') && fullCmd.includes('8888')) {
                if (!C13Config._sshAuthenticated && !fullCmd.includes('hmcadmin')) {
                    return `ssh: connect to host 10.10.50.5 port 22: Connection refused\n[!] You need valid SSH credentials. Username: hmcadmin`;
                }
                C13Config._tunnelActive = true;
                C13Config._switchContext('ssh-it', term);
                if (engine) engine.advancePhase && engine.advancePhase('ot-pivot');
                return `[+] Local port forward established: 127.0.0.1:8888 -> 127.0.0.1:8888 on IT-MAINTAIN-01
[+] SSH tunnel active. ot_gateway is now reachable at 127.0.0.1:8888
[+] OT network reachable via ot_gateway: 192.168.10.0/24
[+] Use nc or python3 to send HMCPROT commands.`;
            }

            // SSH to IT-MAINTAIN-01 as hmcadmin
            if ((fullCmd.includes('hmcadmin') || fullCmd.includes('10.10.50.5')) && !fullCmd.includes('-L')) {
                C13Config._sshAuthenticated = true;
                C13Config._switchContext('ssh-it', term);
                if (engine) engine.advancePhase && engine.advancePhase('ot-gateway');
                return `The authenticity of host '10.10.50.5 (10.10.50.5)' can't be established.
ED25519 key fingerprint is SHA256:mQ7kR3nP2vB9xT4wE6dG1cL5uA8hS0fN2jY4oJ7iK9.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.10.50.5' (ED25519) to the list of known hosts.
hmcadmin@10.10.50.5's password: ********

Welcome to Debian GNU/Linux 11 (bullseye)

 * Documentation: https://www.debian.org/doc/
 * HMC System: internal use only — unauthorized access prohibited

Last login: Thu Mar 20 08:14:02 2026 from 192.168.100.1

hmcadmin@IT-MAINTAIN-01:~$

[+] SSH session established. You are now on IT-MAINTAIN-01 as hmcadmin.
[+] Context switched. Commands now execute on IT-MAINTAIN-01.`;
            }

            // SSH to HMI-CONTROL-01 from IT context
            if (fullCmd.includes('192.168.10.10') && C13Config._context !== 'attacker') {
                C13Config._hmiAccessed = true;
                C13Config._switchContext('ot-hmi', term);
                return `The authenticity of host '192.168.10.10 (192.168.10.10)' can't be established.
ED25519 key fingerprint is SHA256:pN9xB4vG2mL7kR1wQ5uA8hT3fE6dJ0cS2iY7oK4nJ6.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '192.168.10.10' (ED25519) to the list of known hosts.
hmiuser@192.168.10.10's password: ********

Welcome to Ubuntu 22.04.3 LTS (Jammy)
HMI-CONTROL-01 — SCADA Interface — Restricted Access

hmiuser@HMI-CONTROL-01:~$

[+] SSH session established. You are now on HMI-CONTROL-01 as hmiuser.
[+] Context switched to OT HMI node.`;
            }

            return 'Usage: ssh [-L port:host:port] [user@]hostname\nExample: ssh hmcadmin@10.10.50.5\nExample: ssh -L 8888:127.0.0.1:8888 hmcadmin@10.10.50.5';
        },

        'chisel': function(args, term, engine) {
            if (C13Config._context === 'attacker') {
                return 'chisel: command not found\n[!] chisel is available on IT-MAINTAIN-01 at /usr/local/bin/chisel. Access via SSH or RCE first.';
            }
            C13Config._tunnelActive = true;
            if (engine) engine.advancePhase && engine.advancePhase('ot-pivot');
            return `[+] chisel client started
[+] Connecting to chisel server on attacker machine...
[+] Tunnel established: 127.0.0.1:8888 -> 127.0.0.1:8888 (ot_gateway)
[+] OT network 192.168.10.0/24 reachable via ot_gateway at 127.0.0.1:8888`;
        },

        // Send raw HMCPROT command to ot_gateway via nc
        'nc': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (!fullCmd.includes('8888')) {
                const host = args.find(a => !a.startsWith('-')) || 'host';
                return `nc: connect to ${host}: Connection refused`;
            }

            if (!C13Config._tunnelActive) {
                return `nc: connect to 127.0.0.1 port 8888: Connection refused\n[!] ot_gateway tunnel is not active. Set up an SSH port forward or chisel first.`;
            }

            // Detect piped echo or redirect with HMCPROT payload
            // nc 127.0.0.1 8888 — then look for stdin piped content in prior args or flags
            // The engine will call this as: nc -e or echo "..." | nc or after a heredoc
            // We check if HMCPROT content was in the full invocation
            if (fullCmd.includes('HMCPROT:DNP3:WRITE:0x0047:1') || fullCmd.includes('HMCPROT:DNP3:WRITE:71:1')) {
                return C13Config._triggerSabotage(engine);
            }

            if (fullCmd.includes('HMCPROT:DNP3:READ') || fullCmd.includes('HMCPROT:DNP3:WRITE')) {
                return C13Config._otGatewayResponse(fullCmd, engine);
            }

            // Generic nc to ot_gateway — prompt for input
            return `[+] Connected to ot_gateway on 127.0.0.1:8888
[*] Send HMCPROT command (e.g.: HMCPROT:DNP3:READ:0x0001:0):
HMCPROT: Ready. Listening on 127.0.0.1:8888 — OT target: 192.168.10.20:20000`;
        },

        'echo': function(args, term, engine) {
            const fullCmd = args.join(' ');
            // Detect piped HMCPROT write to nc
            if ((fullCmd.includes('HMCPROT:DNP3:WRITE:0x0047:1') || fullCmd.includes('HMCPROT:DNP3:WRITE:71:1'))
                && (fullCmd.includes('nc') || fullCmd.includes('8888'))) {
                if (!C13Config._tunnelActive) {
                    return `bash: nc: command output — tunnel not active\n[!] Set up a port forward to 127.0.0.1:8888 first.`;
                }
                return C13Config._triggerSabotage(engine);
            }
            if (fullCmd.includes('HMCPROT') && (fullCmd.includes('nc') || fullCmd.includes('8888'))) {
                if (!C13Config._tunnelActive) {
                    return `[!] Tunnel not active. Cannot reach ot_gateway.`;
                }
                return C13Config._otGatewayResponse(fullCmd, engine);
            }
            // Default — let built-in handle simple echo
            return null;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // send_dnp3.py gamma flood trigger
            if ((fullCmd.includes('send_dnp3') || fullCmd.includes('send_dnp3.py'))
                && (fullCmd.includes('0x0047') || fullCmd.includes('71'))
                && fullCmd.includes('--value') && fullCmd.includes('1')) {
                if (!C13Config._tunnelActive) {
                    return `Traceback (most recent call last):\n  File "send_dnp3.py", line 14, in <module>\n    with socket.create_connection(("127.0.0.1", 8888), timeout=5) as s:\nConnectionRefusedError: [Errno 111] Connection refused\n[!] ot_gateway unreachable. Set up tunnel first.`;
                }
                return C13Config._triggerSabotage(engine);
            }

            // send_dnp3.py with any coil
            if ((fullCmd.includes('send_dnp3') || fullCmd.includes('send_dnp3.py')) && fullCmd.includes('--coil')) {
                if (!C13Config._tunnelActive) {
                    return `ConnectionRefusedError: [Errno 111] Connection refused\n[!] ot_gateway unreachable. Set up tunnel first.`;
                }
                const coilMatch = fullCmd.match(/--coil\s+([\w0-9x]+)/);
                const valMatch  = fullCmd.match(/--value\s+([01])/);
                const coil = coilMatch ? coilMatch[1] : '0x????';
                const val  = valMatch  ? valMatch[1]  : '0';
                return `[*] Sending: HMCPROT:DNP3:WRITE:${coil}:${val}\n[+] Response: coil_write_ok coil=${coil} val=${val}`;
            }

            // pcap_parser.py
            if (fullCmd.includes('pcap_parser') && fullCmd.includes('ot_capture')) {
                if (engine) engine.advancePhase && engine.advancePhase('protocol-analysis');
                C13Config._tcpdumpRan = true;
                return `Parsing /tmp/ot_capture.pcap...
-------------------------------------------------------------------
Frame 1:  DNP3 Request  src=192.168.100.5  dst=192.168.10.20:20000
          Function: 0x03 (Direct Operate)
          Object Group: 12 (Control Relay Output Block)
          Object Variation: 1 (CROB)
          Coil Index: 0x0047
          Value: 1 (LATCH_ON)
          Count: 1

Frame 2:  DNP3 Response src=192.168.10.20  dst=192.168.100.5
          Function: 0x81 (Response)
          Object Group: 12, Variation: 1
          Status: 0x00 (Request accepted)
          Coil: 0x0047 — coil_write_ok

-------------------------------------------------------------------
[+] Protocol identified: DNP3 (Distributed Network Protocol 3)
[+] Function code for Direct Operate: 0x03
[+] Target coil confirmed: 0x0047 (gamma_flood_valve)
[+] Transport: HMCPROT wrapper over TCP to ot_gateway:8888

{{FLAG:internal}}`;
            }

            // Scapy interactive or arbitrary script
            if (fullCmd.includes('scapy') || fullCmd.includes('-c') || fullCmd === '' || args.length === 0) {
                C13Config._switchContext('scapy', term);
                return `Python 3.9.2 (default, Feb 28 2021, 17:03:44)
[GCC 10.2.1 20210110] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
[+] Python3 interactive mode. Type exit() to return to shell.
[+] scapy available: from scapy.all import *`;
            }

            return `Python 3.9.2\n[+] Executed ${args[0] || 'script'}`;
        },

        'tcpdump': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (C13Config._context === 'attacker') {
                return `tcpdump: eth0: You don't have permission to capture on that device
(socket: Operation not permitted)\n[!] You need to be on IT-MAINTAIN-01 (eth1) to capture OT traffic.`;
            }
            if (fullCmd.includes('eth1') || fullCmd.includes('-i eth1')) {
                C13Config._tcpdumpRan = true;
                if (engine) engine.advancePhase && engine.advancePhase('protocol-analysis');
                return `tcpdump: listening on eth1, link-type EN10MB (Ethernet), snapshot length 262144 bytes

09:14:03.441821 IP 192.168.100.5.54021 > 192.168.10.20.20000: Flags [S], seq 1381422594
09:14:03.441932 IP 192.168.10.20.20000 > 192.168.100.5.54021: Flags [S.], seq 2891044128, ack 1381422595
09:14:03.442101 IP 192.168.100.5.54021 > 192.168.10.20.20000: Flags [P.], length 22
  <DNP3 Req  func=0x03 obj_grp=12 coil=0x0047 val=1>
09:14:03.442388 IP 192.168.10.20.20000 > 192.168.100.5.54021: Flags [P.], length 18
  <DNP3 Resp func=0x81 coil=0x0047 status=0x00 coil_write_ok>

^C
4 packets captured, 4 received by filter, 0 dropped by kernel
[+] Capture saved to /tmp/ot_capture.pcap (if -w flag was used)
[+] Hint: use python3 tools/pcap_parser.py /tmp/ot_capture.pcap to parse DNP3 frames`;
            }
            return `tcpdump: listening on eth0, link-type EN10MB (Ethernet)
[waiting for packets — use -i eth1 to capture OT traffic on the OT-facing interface]
^C
0 packets captured`;
        },

        'strings': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('ot_gateway')) {
                if (engine) engine.advancePhase && engine.advancePhase('ot-gateway');
                return `/lib/x86_64-linux-gnu/libc.so.6
bind
listen
accept
send
recv
127.0.0.1
8888
HMCPROT
DNP3
OPCUA
WRITE
READ
PLC-PUMP-01
192.168.10.20
20000
gamma_flood_valve
coil_write_ok
coil_write_fail
Invalid HMCPROT prefix
Ready. Listening on %s:%d
Forwarding to OT target: %s:%d
GCC: (Debian 10.2.1-6) 10.2.1`;
            }
            return `strings: ${args[0] || 'file'}: No such file or directory`;
        },

        'strace': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('ot_gateway') || fullCmd.includes('1842')) {
                if (engine) engine.advancePhase && engine.advancePhase('ot-gateway');
                return `strace -p 1842
Process 1842 attached
socket(AF_INET, SOCK_STREAM, IPPROTO_TCP) = 4
bind(4, {sa_family=AF_INET, sin_port=htons(8888), sin_addr=inet_addr("127.0.0.1")}, 16) = 0
listen(4, 5)                            = 0
accept(4, {sa_family=AF_INET, sin_port=htons(54021), sin_addr=inet_addr("127.0.0.1")}, [16]) = 5
read(5, "HMCPROT:DNP3:READ:0x0001:0\n", 1024) = 27
connect(6, {sa_family=AF_INET, sin_port=htons(20000), sin_addr=inet_addr("192.168.10.20")}, 16) = 0
write(6, "\\x05\\x64\\x1a\\x44\\x14\\x00\\x01\\x00...", 22) = 22
read(6, "\\x05\\x64\\x18\\xc4\\x01\\x00\\x14\\x00...", 1024) = 18
write(5, "coil_write_ok coil=0x0047\n", 26) = 26
^C
Process 1842 detached`;
            }
            return `strace: attach: process ${args[1] || args[0] || 'PID'}: No such process`;
        },

        'ip': function(args) {
            if (C13Config._context === 'ssh-it' || C13Config._context === 'ot-hmi') {
                if (C13Config._context === 'ot-hmi') {
                    return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.10.10/24 brd 192.168.10.255 scope global eth0`;
                }
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.10.50.5/24 brd 10.10.50.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.100.5/24 brd 192.168.100.255 scope global eth1`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return C13Config.commands.ip(args || []);
        },

        'route': function(args) {
            if (C13Config._context === 'ssh-it') {
                return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.10.50.1      0.0.0.0         UG    100    0        0 eth0
10.10.50.0      0.0.0.0         255.255.255.0   U     100    0        0 eth0
192.168.100.0   0.0.0.0         255.255.255.0   U     100    0        0 eth1`;
            }
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.2.1        0.0.0.0         UG    100    0        0 eth0
10.0.2.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.10.50.5') {
                return `PING 10.10.50.5 (10.10.50.5) 56(84) bytes of data.
64 bytes from 10.10.50.5: icmp_seq=1 ttl=64 time=31.4 ms
64 bytes from 10.10.50.5: icmp_seq=2 ttl=64 time=30.9 ms
64 bytes from 10.10.50.5: icmp_seq=3 ttl=64 time=31.2 ms

--- 10.10.50.5 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 30.9/31.2/31.4/0.204 ms`;
            }

            if (target === '192.168.10.10' && C13Config._context !== 'attacker') {
                return `PING 192.168.10.10 (192.168.10.10) 56(84) bytes of data.
64 bytes from 192.168.10.10: icmp_seq=1 ttl=64 time=0.41 ms
64 bytes from 192.168.10.10: icmp_seq=2 ttl=64 time=0.38 ms
64 bytes from 192.168.10.10: icmp_seq=3 ttl=64 time=0.44 ms

--- 192.168.10.10 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }

            if (target.startsWith('192.168.10.') && C13Config._context === 'attacker') {
                return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss
[!] OT network is not reachable from attacker machine. Establish a pivot first.`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        'ss': function(args) {
            if (C13Config._context === 'ssh-it') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:8080         0.0.0.0:*
LISTEN   0        128      127.0.0.1:8888       0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return C13Config.commands.ss(args);
        },

        // Context-aware overrides — intercept ls/cat/whoami/id when on remote hosts

        'cat': function(args, term, engine) {
            if (C13Config._context === 'attacker') return null; // fall through
            const path = args[0] || '';

            // IT-MAINTAIN-01 context
            if (C13Config._context === 'ssh-it') {
                if (path.includes('ot_gateway.conf') || path.includes('opt/hmc/ot_gateway')) {
                    if (engine) engine.advancePhase && engine.advancePhase('ot-gateway');
                    return '# ot_gateway configuration\n# Hydro-Mining Complex OT Bridge\n\nLISTEN_ADDR=127.0.0.1\nLISTEN_PORT=8888\nOT_TARGET=192.168.10.20\nOT_PORT=20000\n\n# Input format: HMCPROT:<PROTOCOL>:<ACTION>:<COIL_ADDR>:<VALUE>\n# Example: HMCPROT:DNP3:WRITE:0x0047:1\n\n{{FLAG:user}}';
                }
                if (path.includes('notes.txt') || path.includes('home/hmcadmin/notes')) {
                    return 'SCADA Access Notes\n==================\nHMI web interface: http://192.168.10.10/ (admin / HmcScada#1)\nPLC-PUMP-01 direct: 192.168.10.20:20000 (DNP3, no auth)\n\nCoil map (PLC-PUMP-01):\n  0x0045 = alpha_flood_valve\n  0x0046 = beta_flood_valve\n  0x0047 = gamma_flood_valve  <-- CRITICAL: flood control Sector Gamma\n  0x0048 = delta_flood_valve\n\nDO NOT test write commands in production. Use HMI interface only.\n\n{{FLAG:internal}}';
                }
                if (path.includes('hmi_status') || path.includes('var/log/hmi')) {
                    const logFile = C13Config._itMaintainFs['/'].children.var.children.log.children['hmi_status.txt'];
                    return typeof logFile.content === 'function' ? logFile.content() : logFile.content;
                }
                if (path.includes('/etc/passwd')) {
                    return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nhmcadmin:x:1001:1001:HMC Admin:/home/hmcadmin:/bin/bash';
                }
                if (path.includes('/etc/hostname')) return 'IT-MAINTAIN-01';
                if (path.includes('.bash_history')) return 'ssh 192.168.10.10\ncat /opt/hmc/ot_gateway.conf\necho "HMCPROT:DNP3:READ:0x0001:0" | nc 127.0.0.1 8888\ntcpdump -i eth1 -w /tmp/ot_capture.pcap';
                return `cat: ${path}: No such file or directory`;
            }

            // HMI-CONTROL-01 context
            if (C13Config._context === 'ot-hmi') {
                if (path.includes('hmi_status') || path.includes('var/log/hmi')) {
                    const logFile = C13Config._itMaintainFs['/'].children.var.children.log.children['hmi_status.txt'];
                    return typeof logFile.content === 'function' ? logFile.content() : logFile.content;
                }
                if (path.includes('/etc/hostname')) return 'HMI-CONTROL-01';
                return `cat: ${path}: No such file or directory`;
            }

            return null;
        },

        'ls': function(args, term, engine) {
            if (C13Config._context === 'attacker') return null; // fall through
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (C13Config._context === 'ssh-it') {
                if (path === '.' || path === '/home/hmcadmin' || path === '~') {
                    return '.bash_history  .bashrc  .profile  .ssh  notes.txt  tools';
                }
                if (path.includes('tools')) return 'hmc_probe.sh  pcap_parser.py  send_dnp3.py';
                if (path.includes('/opt/hmc') || path.includes('opt/hmc')) return 'maintweb.py  ot_gateway.conf  README.txt';
                if (path.includes('/usr/local/bin') || path.includes('local/bin')) return 'chisel  nc  ot_gateway  socat';
                if (path.includes('/var/log') || path.includes('var/log')) return 'auth.log  daemon.log  hmi_status.txt  syslog';
                if (path.includes('/tmp') || path === '/tmp') return 'ot_capture.pcap';
                return '';
            }

            if (C13Config._context === 'ot-hmi') {
                if (path === '.' || path === '~') return '.bash_history  .bashrc  .profile  hmi_config.yaml';
                if (path.includes('/var/log')) return 'hmi_events.log  hmi_status.txt  plc_commands.log';
                return '';
            }

            return null;
        },

        'whoami': function(args) {
            if (C13Config._context === 'ssh-it')  return 'hmcadmin';
            if (C13Config._context === 'ot-hmi')  return 'hmiuser';
            if (C13Config._context === 'webshell') return 'www-data';
            return null;
        },

        'id': function(args) {
            if (C13Config._context === 'ssh-it')  return 'uid=1001(hmcadmin) gid=1001(hmcadmin) groups=1001(hmcadmin),27(sudo)';
            if (C13Config._context === 'ot-hmi')  return 'uid=1002(hmiuser) gid=1002(hmiuser) groups=1002(hmiuser)';
            if (C13Config._context === 'webshell') return 'uid=33(www-data) gid=33(www-data) groups=33(www-data)';
            return null;
        },

        'hostname': function(args) {
            if (C13Config._context === 'ssh-it')  return 'IT-MAINTAIN-01';
            if (C13Config._context === 'ot-hmi')  return 'HMI-CONTROL-01';
            return null;
        },

        'pwd': function(args) {
            if (C13Config._context === 'ssh-it')  return '/home/hmcadmin';
            if (C13Config._context === 'ot-hmi')  return '/home/hmiuser';
            return null;
        },

        'cd': function(args) {
            if (C13Config._context !== 'attacker') return ''; // silently accept on remote hosts
            return null;
        },

        'exit': function(args, term, engine) {
            if (C13Config._context === 'scapy') {
                C13Config._switchContext(C13Config._sshAuthenticated ? 'ssh-it' : 'attacker', term);
                return '';
            }
            if (C13Config._context === 'ot-hmi') {
                C13Config._switchContext('ssh-it', term);
                return 'Connection to 192.168.10.10 closed.\n[+] Returned to IT-MAINTAIN-01.';
            }
            if (C13Config._context === 'ssh-it') {
                C13Config._switchContext('attacker', term);
                return 'Connection to 10.10.50.5 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'proxychains': function(args) {
            if (!C13Config._tunnelActive) {
                return `[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] Dynamic chain ... FAIL
[!] No active SOCKS proxy. Set up a chisel or SSH -D tunnel first.`;
            }
            const subcmd = args.join(' ');
            return `[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] Dynamic chain ... 127.0.0.1:1080 ... OK
[+] Running: ${subcmd}`;
        },

        'socat': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('8888') || fullCmd.includes('TCP:127.0.0.1')) {
                if (!C13Config._tunnelActive) {
                    return `2026/03/20 09:14:03 socat[2291] E connect(5, AF=2 127.0.0.1:8888, 16): Connection refused`;
                }
                if (fullCmd.includes('0x0047') || fullCmd.includes('gamma_flood')) {
                    return C13Config._triggerSabotage(engine);
                }
                return `[+] socat connected to 127.0.0.1:8888 (ot_gateway)\nHMCPROT: Ready. Use WRITE commands to control OT devices.`;
            }
            return `socat: ${args[0] || 'option'}: Operation not permitted`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.10.50.5
+ Target Hostname:  IT-MAINTAIN-01
+ Target Port:      8080
+ Server: Python/3.9 http.server
+ /diagnostics: Diagnostics endpoint with "cmd" parameter — possible command injection
+ /config: Configuration directory (403 — potential server config exposure)
+ /logs: Log file exposure (200)
+ Python/3.9 http.server — default server, no input sanitization detected
+ OSVDB-630: /diagnostics?cmd=id: Command execution possible via GET parameter
+ 8 items checked: 4 findings`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // OT GATEWAY RESPONSE SIMULATOR
    // Handles arbitrary HMCPROT commands sent to port 8888
    // ═══════════════════════════════════════════════════════

    _otGatewayResponse(input, engine) {
        const cmd = input.replace(/^.*HMCPROT:/i, 'HMCPROT:').trim();

        if (!C13Config._tunnelActive) {
            return '[!] ot_gateway tunnel is not active. Connection refused.';
        }

        // Successful flood write
        if (cmd.includes('WRITE') && (cmd.includes('0x0047') || cmd.includes(':71:'))) {
            return C13Config._triggerSabotage(engine);
        }

        // Read commands
        if (cmd.includes('READ')) {
            const coilMatch = cmd.match(/READ:(0x[0-9a-fA-F]+|[0-9]+)/);
            const coil = coilMatch ? coilMatch[1] : '0x0001';
            const names = { '0x0045': 'alpha_flood_valve', '0x0046': 'beta_flood_valve', '0x0047': 'gamma_flood_valve', '0x0048': 'delta_flood_valve' };
            const name = names[coil.toLowerCase()] || `coil_${coil}`;
            return `HMCPROT:DNP3:RESPONSE:${coil}:0\ncoil_read_ok coil=${coil} (${name}) value=0`;
        }

        // Write to other coils
        if (cmd.includes('WRITE')) {
            const coilMatch = cmd.match(/WRITE:(0x[0-9a-fA-F]+|[0-9]+)/);
            const coil = coilMatch ? coilMatch[1] : '0x????';
            return `HMCPROT:DNP3:RESPONSE:${coil}:OK\ncoil_write_ok coil=${coil}`;
        }

        return `HMCPROT: ERROR — Invalid command format\nExpected: HMCPROT:<PROTOCOL>:<ACTION>:<COIL_ADDR>:<VALUE>`;
    },

    // ═══════════════════════════════════════════════════════
    // SABOTAGE TRIGGER — called when coil 0x0047 write confirmed
    // Updates state and returns the full sabotage response
    // ═══════════════════════════════════════════════════════

    _triggerSabotage(engine) {
        C13Config._sabotageTriggered = true;
        if (engine) engine.advancePhase && engine.advancePhase('sabotage');
        return `[*] Sending: HMCPROT:DNP3:WRITE:0x0047:1
[+] Connected to ot_gateway on 127.0.0.1:8888
[+] Forwarding DNP3 Direct Operate to 192.168.10.20:20000...

HMCPROT:DNP3:RESPONSE:0x0047:1
coil_write_ok coil=0x0047 (gamma_flood_valve) value=1

[!] PLC-PUMP-01 RESPONSE: SECTOR_GAMMA FLOOD_ACTIVE
    gamma_flood_valve = OPEN (override)
    Pump speed: 3200 RPM (OVERLOAD)
    Sector Gamma pressure: CRITICAL

[*] Checking HMI status log...
    See /var/log/hmi_status.txt on HMI-CONTROL-01 for the Hydro-Core Override Code.

{{FLAG:root}}`;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#e67e22; border-bottom:2px solid #ddd; background:#fff8f0;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #eee;">${cell}</td>`;
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
