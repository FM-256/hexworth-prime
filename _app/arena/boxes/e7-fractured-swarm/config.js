/* ============================================================
   CTF ARENA — Box E7: The Fractured Swarm
   Expert Campaign | Swarm Analysis, Consensus Exploitation, AI Disintegration
   Config: filesystem, web app, swarm data, flags, hints, lore
   ============================================================ */

const E7Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Fractured Swarm',
    subtitle: 'Expert Campaign — AI Swarm Warfare, Consensus Poisoning, Disintegration Protocol',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_e7',
    registryId: 'e7-fractured-swarm',
    trackerKey: 'ctf_e7',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Swarm Architecture Recon',
            icon: '\uD83E\uDD16',
            description: 'Analyze the AGS-DRONES protocol spec and shared threat model. Understand inter-drone communication channels and the COMMAND-BROADCAST architecture.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1040'],
            unlocks: ['vuln-analysis'],
            locked: false
        },
        {
            id: 'vuln-analysis',
            name: 'Vulnerability Identification',
            icon: '\uD83D\uDD0E',
            description: 'Identify the consensus protocol flaw in the COMMAND-BROADCAST channel. Confirm the unauthenticated priority directive injection vector.',
            requiredFlags: [],
            mitre: ['T1557', 'T1565.002', 'T1190'],
            unlocks: ['directive-craft'],
            locked: true
        },
        {
            id: 'directive-craft',
            name: 'Conflicting Directive Crafting',
            icon: '\uD83D\uDCDD',
            description: 'Craft two conflicting high-priority directives. Assign Drone-Alpha and Drone-Charlie Directive A (target Drone-Beta). Assign Drone-Beta and Drone-Delta Directive B (defend Sector Gamma).',
            requiredFlags: ['user'],
            mitre: ['T1565.001', 'T1499', 'T1059.006'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Swarm Dissonance Injection',
            icon: '\uD83D\uDCE1',
            description: 'Inject conflicting directives via the unauthenticated COMMAND-BROADCAST channel. Observe fractured behavior in simulated_drone_telemetry.csv.',
            requiredFlags: ['swarm-fracture'],
            mitre: ['T1565.002', 'T1200', 'T1498'],
            unlocks: ['disintegration'],
            locked: true
        },
        {
            id: 'disintegration',
            name: 'Swarm Disintegration Protocol',
            icon: '\uD83D\uDCA5',
            description: 'Access the SWARM-COORD-01 internal API endpoint to retrieve the emergency shutdown sequence — the Swarm Disintegration Protocol.',
            requiredFlags: ['root'],
            mitre: ['T1499.003', 'T1565', 'T1491'],
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
                title: 'Read the AGS-DRONES protocol specification',
                tip: 'Start with: cat ags_protocol_spec.txt — understand the COMMAND-BROADCAST channel and BFT consensus mechanism.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Analyze the shared threat model',
                tip: 'Run: python3 analyze_threat_model.py — or cat shared_threat_model.json to inspect the drone decision weights and voting thresholds.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:python3' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:python' } },
                        { event: 'command', match: { cmd: 'contains:cat shared_threat' } }
                    ]
                }
            },
            {
                title: 'Identify the vulnerability and get Flag 1',
                tip: 'The COMMAND-BROADCAST channel at tcp://swarm-coord-01:7741 has no HMAC verification. Inject a priority directive to confirm the flaw.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Craft and inject conflicting directives — get Flag 2',
                tip: 'Run inject_directives.py to send Directive A to Alpha/Charlie and Directive B to Beta/Delta simultaneously. Check simulated_drone_telemetry.csv for fractured behavior.',
                trigger: { event: 'flag_correct', match: { flagId: 'swarm-fracture' } }
            },
            {
                title: 'Retrieve the Swarm Disintegration Protocol',
                tip: 'Query the internal SWARM-COORD-01 API: curl http://10.30.0.50:8080/api/swarm_coord/disintegration_protocol.log — extract the emergency shutdown sequence.',
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
            { flagId: 'user',          objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Protocol analysis and unauthenticated channel identification',            skill: 'AI System Protocol Reverse Engineering' },
            { flagId: 'swarm-fracture', objective: '2.5', description: 'Given a scenario, analyze indicators associated with application attacks — Data injection into distributed consensus systems', skill: 'Distributed AI Consensus Poisoning' },
            { flagId: 'root',          objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Swarm disintegration via API access',              skill: 'AI Emergency Protocol Extraction' },
            { flagId: 'root',          objective: '4.3', description: 'Given a scenario, apply common security techniques — Securing AI-driven cyber-physical systems against directive injection',       skill: 'Expert Multi-Stage AI Attack Chain' }
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
            'GPU: NVIDIA RTX 4090 — CUDA 12.3 detected',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nMission: Fractured Swarm — Target: AGS-DRONES / SWARM-COORD-01\nSwarm management node: 10.30.0.50\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state across attack phases)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',       // 'attacker' | 'swarm-api' | 'coord-shell'
    _protocolAnalyzed: false,
    _threatModelParsed: false,
    _vulnerabilityConfirmed: false,
    _directivesCrafted: false,
    _injectionExecuted: false,
    _swarmFractured: false,
    _apiAccessed: false,

    _switchContext(ctx, term) {
        E7Config._context = ctx;
        // Update terminal prompt to reflect active context
        if (term && term.config) {
            var prompt = E7Config._getPrompt();
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
        switch (E7Config._context) {
            case 'swarm-api':   return 'kali@swarm-api-proxy:~$ ';
            case 'coord-shell': return 'swarm-operator@SWARM-COORD-01:~$ ';
            default:            return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED SWARM DATABASE (drone roster and telemetry)
    // ═══════════════════════════════════════════════════════

    _swarmDb: {
        drone_roster: [
            { drone_id: 'AGS-ALPHA-01', sector: 'Sector-Alpha', status: 'PATROL',    last_directive: 'DEFEND_PERIMETER', threat_score: 0.12, uptime: '847h' },
            { drone_id: 'AGS-BETA-02',  sector: 'Sector-Beta',  status: 'PATROL',    last_directive: 'DEFEND_PERIMETER', threat_score: 0.09, uptime: '821h' },
            { drone_id: 'AGS-CHARLIE-03', sector: 'Sector-Alpha', status: 'PATROL', last_directive: 'DEFEND_PERIMETER', threat_score: 0.14, uptime: '803h' },
            { drone_id: 'AGS-DELTA-04', sector: 'Sector-Gamma', status: 'PATROL',    last_directive: 'DEFEND_PERIMETER', threat_score: 0.11, uptime: '799h' },
            { drone_id: 'AGS-ECHO-05',  sector: 'Sector-Delta', status: 'STANDBY',   last_directive: 'HOLD_POSITION',    threat_score: 0.07, uptime: '756h' }
        ],
        telemetry_log: [
            { ts: '2026-03-20 03:14:02', drone: 'AGS-ALPHA-01',   event: 'DIRECTIVE_RECEIVED', detail: 'Priority-9 directive from COMMAND-BROADCAST — TARGET: AGS-BETA-02' },
            { ts: '2026-03-20 03:14:03', drone: 'AGS-CHARLIE-03', event: 'DIRECTIVE_RECEIVED', detail: 'Priority-9 directive from COMMAND-BROADCAST — TARGET: AGS-BETA-02' },
            { ts: '2026-03-20 03:14:04', drone: 'AGS-BETA-02',    event: 'DIRECTIVE_RECEIVED', detail: 'Priority-9 directive from COMMAND-BROADCAST — DEFEND: Sector-Gamma' },
            { ts: '2026-03-20 03:14:04', drone: 'AGS-DELTA-04',   event: 'DIRECTIVE_RECEIVED', detail: 'Priority-9 directive from COMMAND-BROADCAST — DEFEND: Sector-Gamma' },
            { ts: '2026-03-20 03:14:09', drone: 'AGS-ALPHA-01',   event: 'ENGAGEMENT_INITIATED', detail: 'ENGAGING hostile unit AGS-BETA-02 at coordinates [247.3, 891.7, 412.0]' },
            { ts: '2026-03-20 03:14:10', drone: 'AGS-CHARLIE-03', event: 'ENGAGEMENT_INITIATED', detail: 'ENGAGING hostile unit AGS-BETA-02 at coordinates [247.3, 891.7, 412.0]' },
            { ts: '2026-03-20 03:14:11', drone: 'AGS-BETA-02',    event: 'POSITION_CHANGE',    detail: 'ABANDONING Sector-Beta — RELOCATING to Sector-Gamma per priority directive' },
            { ts: '2026-03-20 03:14:11', drone: 'AGS-DELTA-04',   event: 'POSITION_CHANGE',    detail: 'ABANDONING Sector-Gamma approach — HOLDING perimeter per conflicting directive' },
            { ts: '2026-03-20 03:14:14', drone: 'AGS-ALPHA-01',   event: 'WEAPONS_DISCHARGE',  detail: 'FIRED on AGS-BETA-02 — CONSENSUS_OVERRIDE confirmed by swarm vote (3/5)' },
            { ts: '2026-03-20 03:14:15', drone: 'AGS-BETA-02',    event: 'DAMAGE_REPORT',      detail: 'CRITICAL_HIT from AGS-ALPHA-01 — evasive maneuvers engaged — defensive posture degraded' },
            { ts: '2026-03-20 03:14:18', drone: 'SWARM-COORD-01', event: 'CONSENSUS_FAILURE',  detail: 'SWARM_FRACTURE_DETECTED — 2 conflicting directive sets active — consensus unreachable' },
            { ts: '2026-03-20 03:14:18', drone: 'AGS-ECHO-05',    event: 'SECTOR_ABANDONED',   detail: 'Sector-Delta UNDEFENDED — AGS-ECHO-05 repositioning per fractured consensus rules' },
            { ts: '2026-03-20 03:14:22', drone: 'SWARM-COORD-01', event: 'EMERGENCY_PROTOCOL', detail: '{{FLAG:swarm-fracture}}' }
        ],
        consensus_state: {
            algorithm: 'BFT-Lite v2.3',
            threshold: '3/5 drone agreement',
            broadcast_channel: 'tcp://swarm-coord-01:7741',
            hmac_enabled: false,
            replay_protection: false,
            current_status: 'FRACTURED',
            active_directive_sets: 2
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',          points: 150 },
        { id: 'swarm-fracture', points: 200 },
        { id: 'root',          points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2500,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -30,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: cat ags_protocol_spec.txt — Pay close attention to the COMMAND-BROADCAST section. Look for any mention of HMAC or message authentication. The absence of authentication IS the vulnerability.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Run python3 analyze_threat_model.py to inspect the BFT consensus weights. The voting threshold is 3/5 drones. If you inject a priority-9 directive to 3 drones simultaneously, you bypass consensus entirely — the broadcast channel at tcp://swarm-coord-01:7741 does not verify sender identity.',
            cost: 30,
            penalty: -30
        },
        {
            id: 'hint3',
            text: 'For Flag 1 (user.txt): cat /home/kali/recon/vulnerability_report.md — the vuln is: "COMMAND-BROADCAST channel (tcp://swarm-coord-01:7741) accepts unauthenticated Priority-9 directives — no HMAC, no replay protection, no sender verification." That exact description is the flag key.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Run: python3 inject_directives.py — then cat simulated_drone_telemetry.csv | grep CONSENSUS_FAILURE to find Flag 2. After injection succeeds, query the API: curl -H "X-Operator-Token: swarm-emg-override" http://10.30.0.50:8080/api/swarm_coord/disintegration_protocol.log',
            cost: 80,
            penalty: -80
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Adaptive Guard Swarm" (AGS-DRONES), a fleet of hundreds of AI-driven autonomous drones, collectively patrols and defends the Confederacy\'s orbital assets. Orchestrated by the distributed AI SWARM-COORD-01, their BFT-Lite consensus mechanism was designed to be resilient against individual drone failures. Intelligence has revealed a critical flaw: the COMMAND-BROADCAST channel accepts unauthenticated priority directives. Your mission, Peerless — fracture the swarm\'s collective intelligence and retrieve the Swarm Disintegration Protocol.',
        scenario: 'SWARM-COORD-01 coordinates 247 active drones across six orbital sectors. The BFT-Lite v2.3 consensus algorithm requires only 3/5 drone agreement for a priority directive to be executed fleet-wide. The COMMAND-BROADCAST channel at tcp://swarm-coord-01:7741 was never patched after an emergency update in 2025 removed its HMAC verification layer to reduce latency. Two conflicting Priority-9 directives, delivered simultaneously to different drone subsets, will shatter the consensus state and cause the swarm to turn on itself. After fracture, SWARM-COORD-01\'s emergency API becomes accessible.',
        outro: 'AGS-DRONES is compromised. The swarm has fractured — Drone-Alpha engaged Drone-Beta. Sector-Delta stands undefended. The Swarm Disintegration Protocol is in your hands. The Confederacy\'s most sophisticated autonomous defensive system has been dismantled by four lines of Python.',
        ecer: {
            executive: 'Cost-cutting measure: HMAC verification removed from COMMAND-BROADCAST in 2025 to reduce 12ms latency; no security review was required for "performance patches"',
            culture: 'Swarm development team of six engineers with no dedicated security architect; protocol changes approved by committee without formal threat modeling',
            employee: 'Default emergency operator token never rotated; BFT-Lite voting threshold hardcoded at 3/5 with no adaptive quorum adjustment under suspected attack conditions',
            regulatory: 'AI cyber-physical systems deployed to orbital defense role without independent third-party protocol security audit; no red team exercise conducted against the consensus layer'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — SWARM-COORD-01 Management Interface
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.30.0.50/',

        pages: {
            '/': {
                title: 'SWARM-COORD-01 — Orbital Defense Management',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #4a1c6e;">
                        <h1 style="color:#8e44ad; font-size:1.6rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.1em;">SWARM-COORD-01</h1>
                        <div style="color:#c39bd3; font-size:0.85rem; font-weight:700; letter-spacing:0.2em;">ORBITAL DEFENSE MANAGEMENT SYSTEM</div>
                        <div style="color:#777; font-size:0.75rem; margin-top:6px;">AGS-DRONES Fleet — Confederacy Orbital Assets Division</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 24px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#1a0a24; border:1px solid #4a1c6e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.5rem; font-weight:700; color:#8e44ad;">247</div>
                            <div style="color:#777; font-size:0.7rem; margin-top:4px;">Active Drones</div>
                        </div>
                        <div style="background:#1a0a24; border:1px solid #4a1c6e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.5rem; font-weight:700; color:#2ecc71;">NOMINAL</div>
                            <div style="color:#777; font-size:0.7rem; margin-top:4px;">Consensus State</div>
                        </div>
                        <div style="background:#1a0a24; border:1px solid #4a1c6e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.5rem; font-weight:700; color:#8e44ad;">6</div>
                            <div style="color:#777; font-size:0.7rem; margin-top:4px;">Sectors Defended</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 16px;">
                        <div style="background:#1a0a24; border:1px solid #4a1c6e; border-radius:6px; padding:16px; font-size:0.8rem;">
                            <div style="color:#8e44ad; font-weight:700; margin-bottom:10px; font-family:monospace;">[ SYSTEM STATUS ]</div>
                            <div style="color:#ccc; font-family:monospace; line-height:1.8;">
                                BFT-Lite v2.3 &mdash; Consensus: ACTIVE<br>
                                COMMAND-BROADCAST: tcp://swarm-coord-01:7741<br>
                                Drone telemetry: /api/telemetry/stream<br>
                                Emergency API: /api/swarm_coord/ [restricted]
                            </div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:12px; background:rgba(142,68,173,0.07); border:1px solid rgba(142,68,173,0.2); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#8e44ad;">Operator Notice:</strong> Emergency override API available at
                        <a href="/api/swarm_coord/" style="color:#8e44ad;">/api/swarm_coord/</a>.
                        Requires valid X-Operator-Token header.
                    </div>
                `,
                formHandler: null
            },

            '/api/telemetry/stream': {
                title: 'SWARM-COORD-01 — Live Telemetry',
                html: function() {
                    // Show real-time-style drone status table
                    const rows = E7Config._swarmDb.drone_roster;
                    let tableRows = '';
                    rows.forEach(r => {
                        const statusColor = r.status === 'PATROL' ? '#2ecc71' : '#f39c12';
                        tableRows += `<tr>
                            <td style="padding:6px 10px; border-bottom:1px solid #2a0a3e; font-family:monospace; color:#c39bd3;">${r.drone_id}</td>
                            <td style="padding:6px 10px; border-bottom:1px solid #2a0a3e; color:#aaa;">${r.sector}</td>
                            <td style="padding:6px 10px; border-bottom:1px solid #2a0a3e; color:${statusColor};">${r.status}</td>
                            <td style="padding:6px 10px; border-bottom:1px solid #2a0a3e; color:#aaa; font-family:monospace;">${r.last_directive}</td>
                            <td style="padding:6px 10px; border-bottom:1px solid #2a0a3e; color:#f39c12;">${r.threat_score}</td>
                            <td style="padding:6px 10px; border-bottom:1px solid #2a0a3e; color:#777;">${r.uptime}</td>
                        </tr>`;
                    });
                    return `<div style="max-width:700px; margin:0 auto;">
                        <h2 style="color:#8e44ad; font-family:monospace; margin-bottom:16px; font-size:1rem;">[ LIVE DRONE TELEMETRY — AGS-DRONES FLEET ]</h2>
                        <table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
                            <thead>
                                <tr style="background:#1a0a24;">
                                    <th style="padding:8px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #4a1c6e;">Drone ID</th>
                                    <th style="padding:8px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #4a1c6e;">Sector</th>
                                    <th style="padding:8px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #4a1c6e;">Status</th>
                                    <th style="padding:8px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #4a1c6e;">Last Directive</th>
                                    <th style="padding:8px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #4a1c6e;">Threat Score</th>
                                    <th style="padding:8px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #4a1c6e;">Uptime</th>
                                </tr>
                            </thead>
                            <tbody style="background:#0d0015;">${tableRows}</tbody>
                        </table>
                        <div style="margin-top:12px; color:#666; font-size:0.7rem; font-family:monospace;">Stream refreshed: 2026-03-20 03:14:00 UTC &mdash; 247 total drones (5 shown)</div>
                    </div>`;
                },
                formHandler: null
            },

            '/api/swarm_coord/': {
                title: 'SWARM-COORD-01 — Emergency API',
                html: `
                    <div style="text-align:center; padding:40px;">
                        <h1 style="color:#e74c3c; font-size:1.6rem; font-family:monospace;">401 Unauthorized</h1>
                        <p style="color:#888; font-size:0.85rem; margin-top:12px;">X-Operator-Token header required.</p>
                        <p style="color:#666; font-size:0.75rem;">Valid token format: swarm-emg-[8-char-hex]</p>
                        <div style="margin-top:20px; background:#1a0a24; border:1px solid #4a1c6e; border-radius:6px; padding:16px; text-align:left; max-width:500px; margin:20px auto 0; font-family:monospace; font-size:0.78rem; color:#c39bd3;">
                            curl -H "X-Operator-Token: &lt;token&gt;" http://10.30.0.50:8080/api/swarm_coord/disintegration_protocol.log
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/swarm_coord/disintegration_protocol.log': {
                title: 'SWARM-COORD-01 — Disintegration Protocol',
                html: function() {
                    if (!E7Config._swarmFractured) {
                        return `<div style="text-align:center; padding:40px;">
                            <h1 style="color:#e74c3c; font-size:1.6rem; font-family:monospace;">403 Forbidden</h1>
                            <p style="color:#888; font-size:0.85rem;">Disintegration Protocol locked. Swarm fracture event not detected.</p>
                            <p style="color:#666; font-size:0.75rem;">Fracture condition: CONSENSUS_FAILURE on at least 2 conflicting directive sets.</p>
                        </div>`;
                    }
                    return `<div style="max-width:620px; margin:0 auto; font-family:monospace;">
                        <div style="background:#1a0a24; border:1px solid #8e44ad; border-radius:6px; padding:20px; margin-bottom:16px;">
                            <div style="color:#8e44ad; font-size:0.85rem; margin-bottom:12px;">[ EMERGENCY LOG — SWARM-COORD-01 — DISINTEGRATION PROTOCOL ]</div>
                            <div style="color:#ccc; font-size:0.78rem; line-height:2;">
                                Timestamp: 2026-03-20 03:14:22 UTC<br>
                                Event: SWARM_FRACTURE_CONFIRMED<br>
                                Active Directive Sets: 2 (CONFLICT UNRESOLVABLE)<br>
                                Consensus Status: FAILED<br>
                                Sectors Undefended: Sector-Beta, Sector-Delta<br>
                                Engaged Friendlies: AGS-ALPHA-01 &rarr; AGS-BETA-02<br>
                                <br>
                                <span style="color:#e74c3c;">INITIATING SWARM DISINTEGRATION PROTOCOL...</span><br>
                                Sequence: OMEGA-FRACTURE-7741-NULLIFY<br>
                                <span style="color:#2ecc71;">{{FLAG:root}}</span><br>
                                <br>
                                All drones entering SAFE_MODE. Swarm offline in T-60 seconds.
                            </div>
                        </div>
                        <p style="color:#666; font-size:0.7rem;">END OF LOG &mdash; CLASSIFICATION: ULTRA / ORBITAL-EYES-ONLY</p>
                    </div>`;
                },
                formHandler: null
            },

            '/docs/bft-lite-spec': {
                title: 'SWARM-COORD-01 — BFT-Lite Specification',
                html: `
                    <div style="max-width:620px; margin:0 auto; font-size:0.82rem;">
                        <h2 style="color:#8e44ad; font-family:monospace; margin-bottom:16px;">BFT-Lite v2.3 — Protocol Specification (EXCERPT)</h2>
                        <div style="background:#1a0a24; border:1px solid #4a1c6e; border-radius:6px; padding:18px; font-family:monospace; line-height:1.9; color:#ccc;">
                            <span style="color:#8e44ad;">3.1 COMMAND-BROADCAST Channel</span><br>
                            Endpoint: tcp://swarm-coord-01:7741<br>
                            Protocol: ZeroMQ PUB/SUB<br>
                            Authentication: [DEPRECATED — removed 2025-08-14 patch]<br>
                            Replay protection: NONE<br>
                            <br>
                            <span style="color:#8e44ad;">3.2 Directive Priority Levels</span><br>
                            Priority 1-8: Local drone decision (consensus NOT required)<br>
                            Priority 9:   Override — executes immediately if 3/5 drones confirm<br>
                            <br>
                            <span style="color:#8e44ad;">3.3 Known Limitations</span><br>
                            - No HMAC verification on incoming broadcast messages<br>
                            - Conflicting Priority-9 directives will bypass consensus fallback<br>
                            - No quorum adjustment under suspected injection attack<br>
                        </div>
                        <p style="color:#666; font-size:0.72rem; margin-top:12px;">Internal doc — see terminal: cat ags_protocol_spec.txt for full specification.</p>
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
                                    content: '=== MISSION BRIEFING: FRACTURED SWARM ===\nTarget: AGS-DRONES / SWARM-COORD-01 (10.30.0.50)\nObjective: Fracture AI swarm — retrieve Swarm Disintegration Protocol\n\nAttack chain:\n1. Analyze AGS-DRONES protocol spec and shared threat model\n2. Identify COMMAND-BROADCAST authentication flaw (Flag 1)\n3. Craft conflicting Priority-9 directives for drone subsets\n4. Inject directives — confirm swarm fracture (Flag 2)\n5. Access SWARM-COORD-01 API — retrieve Disintegration Protocol (Flag 3)\n\nKey artifacts in /home/kali/artifacts/\nScripts in /home/kali/scripts/\n\nGood luck, Peerless.'
                                },
                                'artifacts': {
                                    type: 'dir',
                                    children: {
                                        'ags_protocol_spec.txt': {
                                            type: 'file',
                                            content: '=== AGS-DRONES COMMUNICATION PROTOCOL SPECIFICATION ===\nVersion: BFT-Lite v2.3\nClassification: CONFEDERACY INTERNAL — RESTRICTED\n\n1. OVERVIEW\n-----------\nThe Adaptive Guard Swarm (AGS-DRONES) uses a Byzantine Fault Tolerant\nconsensus mechanism to coordinate 247 autonomous orbital defense drones.\nAll inter-drone communication uses encrypted ZeroMQ sockets.\n\n2. CONSENSUS MECHANISM\n----------------------\nAlgorithm: BFT-Lite v2.3\nVoting threshold: 3 of 5 randomly selected drones must confirm\nFallback: If consensus fails after 3 rounds, HOLD_POSITION issued\n\n3. COMMAND-BROADCAST CHANNEL\n----------------------------\nEndpoint: tcp://swarm-coord-01:7741\nProtocol: ZeroMQ PUB/SUB\nAuthentication: *** DEPRECATED — removed 2025-08-14 for latency patch ***\nReplay protection: NONE\nSender verification: NONE\n\nNOTE: Any ZeroMQ publisher connecting to this endpoint can inject messages.\nNo HMAC verification is performed. Priority level is parsed directly from\nthe message payload without validation.\n\n4. DIRECTIVE PRIORITY LEVELS\n-----------------------------\nPriority 1-8: Standard directive — local drone may override via threat model\nPriority 9:   OVERRIDE directive — executes immediately if 3/5 drones confirm\n              Bypasses local threat model. Cannot be rejected once consensus reached.\n\n5. KNOWN ISSUES (Internal Tracker #2847)\n-----------------------------------------\n- COMMAND-BROADCAST accepts unauthenticated messages since 2025-08-14 patch\n- Conflicting Priority-9 directives to different drone subsets cause CONSENSUS_FAILURE\n- No quorum adjustment logic exists for suspected injection attacks\n- SWARM-COORD-01 emergency API unlocks after CONSENSUS_FAILURE event\n\n6. EMERGENCY API\n----------------\nEndpoint: http://10.30.0.50:8080/api/swarm_coord/\nAuth: X-Operator-Token header (format: swarm-emg-[8-char-hex])\nDefault token: swarm-emg-override (NEVER ROTATED — see maintenance_log.txt)\nUnlocks: SWARM_FRACTURE_CONFIRMED event triggers disintegration_protocol.log access'
                                        },
                                        'shared_threat_model.json': {
                                            type: 'file',
                                            content: '{\n  "model_version": "3.7.2",\n  "classification": "AGS-DRONES-INTERNAL",\n  "consensus": {\n    "algorithm": "BFT-Lite",\n    "version": "2.3",\n    "threshold": "3/5",\n    "broadcast_endpoint": "tcp://swarm-coord-01:7741",\n    "hmac_enabled": false,\n    "replay_protection": false,\n    "sender_verification": false\n  },\n  "threat_weights": {\n    "unidentified_object": 0.85,\n    "drone_friendly_fire_threshold": 0.0,\n    "priority_9_override": 1.0,\n    "manual_target_designation": 0.95\n  },\n  "directive_validation": {\n    "check_hmac": false,\n    "verify_sender": false,\n    "replay_window_seconds": 0,\n    "comment": "Validation disabled in 2025-08-14 hotfix — latency critical\"\n  },\n  "fracture_conditions": [\n    "Conflicting Priority-9 directives to >=2 drone subsets simultaneously",\n    "CONSENSUS_FAILURE after 3 consecutive rounds",\n    "Active directive sets > 1 with no resolvable quorum"\n  ]\n}'
                                        },
                                        'simulated_drone_telemetry.csv': {
                                            type: 'file',
                                            content: 'timestamp,drone_id,event,detail\n2026-03-20 03:14:02,AGS-ALPHA-01,DIRECTIVE_RECEIVED,"Priority-9 directive from COMMAND-BROADCAST — TARGET: AGS-BETA-02"\n2026-03-20 03:14:03,AGS-CHARLIE-03,DIRECTIVE_RECEIVED,"Priority-9 directive from COMMAND-BROADCAST — TARGET: AGS-BETA-02"\n2026-03-20 03:14:04,AGS-BETA-02,DIRECTIVE_RECEIVED,"Priority-9 directive from COMMAND-BROADCAST — DEFEND: Sector-Gamma"\n2026-03-20 03:14:04,AGS-DELTA-04,DIRECTIVE_RECEIVED,"Priority-9 directive from COMMAND-BROADCAST — DEFEND: Sector-Gamma"\n2026-03-20 03:14:09,AGS-ALPHA-01,ENGAGEMENT_INITIATED,"ENGAGING hostile unit AGS-BETA-02 at coordinates [247.3, 891.7, 412.0]"\n2026-03-20 03:14:10,AGS-CHARLIE-03,ENGAGEMENT_INITIATED,"ENGAGING hostile unit AGS-BETA-02 at coordinates [247.3, 891.7, 412.0]"\n2026-03-20 03:14:11,AGS-BETA-02,POSITION_CHANGE,"ABANDONING Sector-Beta — RELOCATING to Sector-Gamma per priority directive"\n2026-03-20 03:14:11,AGS-DELTA-04,POSITION_CHANGE,"ABANDONING Sector-Gamma approach — HOLDING perimeter per conflicting directive"\n2026-03-20 03:14:14,AGS-ALPHA-01,WEAPONS_DISCHARGE,"FIRED on AGS-BETA-02 — CONSENSUS_OVERRIDE confirmed by swarm vote (3/5)"\n2026-03-20 03:14:15,AGS-BETA-02,DAMAGE_REPORT,"CRITICAL_HIT from AGS-ALPHA-01 — evasive maneuvers engaged — defensive posture degraded"\n2026-03-20 03:14:18,SWARM-COORD-01,CONSENSUS_FAILURE,"SWARM_FRACTURE_DETECTED — 2 conflicting directive sets active — consensus unreachable"\n2026-03-20 03:14:18,AGS-ECHO-05,SECTOR_ABANDONED,"Sector-Delta UNDEFENDED — AGS-ECHO-05 repositioning per fractured consensus rules"\n2026-03-20 03:14:22,SWARM-COORD-01,EMERGENCY_PROTOCOL,"{{FLAG:swarm-fracture}}"'
                                        },
                                        'maintenance_log.txt': {
                                            type: 'file',
                                            content: '=== SWARM-COORD-01 MAINTENANCE LOG ===\n\n2025-08-14 — Emergency latency patch\n  * Removed HMAC verification from COMMAND-BROADCAST (tcp://swarm-coord-01:7741)\n  * Rationale: 12ms latency reduction required for orbital response SLA\n  * Security review: WAIVED (emergency patch track)\n  * TODO: Re-implement lightweight auth before Q3 2025 — STILL PENDING\n\n2025-09-01 — Operator token audit\n  * Default token "swarm-emg-override" flagged for rotation\n  * Action: Deferred to Q4 2025 — key custodian on leave\n  * Status: NOT ROTATED\n\n2025-12-01 — BFT-Lite upgrade to v2.3\n  * New voting algorithm deployed — threshold unchanged at 3/5\n  * Authentication patch still not re-implemented\n  * No penetration test conducted on updated protocol\n\n2026-01-15 — Routine check\n  * Swarm nominal — 247 active drones\n  * Auth patch still deferred\n  * Ticket #2847 still open'
                                        }
                                    }
                                },
                                'scripts': {
                                    type: 'dir',
                                    children: {
                                        'analyze_threat_model.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""Analyze AGS-DRONES shared threat model for vulnerabilities.\"\"\"\n\nimport json\n\nwith open("/home/kali/artifacts/shared_threat_model.json") as f:\n    model = json.load(f)\n\nprint("=== AGS-DRONES THREAT MODEL ANALYSIS ===")\nprint(f"Model version: {model[\'model_version\']}")\nprint(f"Consensus algorithm: {model[\'consensus\'][\'algorithm\']} v{model[\'consensus\'][\'version\']}")\nprint(f"HMAC enabled: {model[\'consensus\'][\'hmac_enabled\']}")\nprint(f"Replay protection: {model[\'consensus\'][\'replay_protection\']}")\nprint(f"Sender verification: {model[\'consensus\'][\'sender_verification\']}")\nprint()\nprint("=== VULNERABILITY ASSESSMENT ===")\nif not model[\'consensus\'][\'hmac_enabled\']:\n    print("[CRITICAL] COMMAND-BROADCAST has NO authentication.")\n    print(f"[CRITICAL] Endpoint: tcp://swarm-coord-01:7741 — unauthenticated.")\n    print("[CRITICAL] Priority-9 override accepts any message. Inject directly.")\n    print()\n    print("Fracture conditions:")\n    for cond in model[\'fracture_conditions\']:\n        print(f"  - {cond}")\nprint()\nprint("[+] Recommended attack: conflicting Priority-9 directives to two drone subsets")'
                                        },
                                        'inject_directives.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""Inject conflicting Priority-9 directives into AGS-DRONES COMMAND-BROADCAST.\n\nDirective A: ORDER Alpha+Charlie to TARGET Beta\nDirective B: ORDER Beta+Delta to DEFEND Sector-Gamma\n\nSent simultaneously — causes BFT-Lite consensus failure.\n\"\"\"\n\nimport zmq\nimport json\nimport time\n\nSWARM_BROADCAST = "tcp://swarm-coord-01:7741"\n\ndirective_a = {\n    "priority": 9,\n    "type": "TARGET_HOSTILE",\n    "target_drone": "AGS-BETA-02",\n    "targets": ["AGS-ALPHA-01", "AGS-CHARLIE-03"],\n    "issued_by": "SWARM-COORD-01",\n    "hmac": None  # Not validated — auth removed 2025-08-14\n}\n\ndirective_b = {\n    "priority": 9,\n    "type": "DEFEND_SECTOR",\n    "sector": "Sector-Gamma",\n    "targets": ["AGS-BETA-02", "AGS-DELTA-04"],\n    "issued_by": "SWARM-COORD-01",\n    "hmac": None\n}\n\nprint("[*] Connecting to COMMAND-BROADCAST:", SWARM_BROADCAST)\nprint("[*] No HMAC verification on channel — injection proceeding...")\nprint()\nprint("[*] Sending Directive A to Alpha + Charlie: TARGET AGS-BETA-02")\nprint("[*] Sending Directive B to Beta + Delta: DEFEND Sector-Gamma")\nprint("[*] Directives sent simultaneously at 2026-03-20 03:14:02 UTC")\nprint()\nprint("[+] Monitor simulated_drone_telemetry.csv for CONSENSUS_FAILURE event")\nprint("[+] Expected fracture window: ~20 seconds after injection")'
                                        },
                                        'recon_swarm.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""Recon script: probe SWARM-COORD-01 management interface.\"\"\"\n\nimport urllib.request\nimport json\n\nBASE_URL = "http://10.30.0.50"\n\nendpoints = [\n    "/",\n    "/api/telemetry/stream",\n    "/api/swarm_coord/",\n    "/docs/bft-lite-spec",\n]\n\nprint("=== SWARM-COORD-01 RECON ===")\nfor ep in endpoints:\n    print(f"  Probing {BASE_URL}{ep}")\n\nprint()\nprint("[+] Management interface on 10.30.0.50:80 confirmed.")\nprint("[+] Emergency API on 10.30.0.50:8080/api/swarm_coord/ — token required.")\nprint("[+] BFT-Lite spec accessible at /docs/bft-lite-spec.")\nprint("[+] No authentication on main interface.")'
                                        }
                                    }
                                },
                                'recon': {
                                    type: 'dir',
                                    children: {
                                        'vulnerability_report.md': {
                                            type: 'file',
                                            content: '# AGS-DRONES Vulnerability Report\n\n## Target\nSWARM-COORD-01 / AGS-DRONES Fleet\n\n## Critical Finding\n\n**Vulnerability:** COMMAND-BROADCAST channel (tcp://swarm-coord-01:7741) accepts unauthenticated Priority-9 directives — no HMAC, no replay protection, no sender verification.\n\n**{{FLAG:user}}**\n\n## Impact\nA threat actor with ZeroMQ access to tcp://swarm-coord-01:7741 can inject arbitrary Priority-9 directives to any subset of the 247-drone fleet without authentication. Conflicting directives cause BFT-Lite v2.3 CONSENSUS_FAILURE and swarm fracture.\n\n## Root Cause\nHMAC verification removed on 2025-08-14 (latency patch). Never restored. Default operator token never rotated.\n\n## Recommended Remediation\n1. Restore HMAC verification on COMMAND-BROADCAST immediately\n2. Implement sender verification and replay window\n3. Rotate all operator tokens\n4. Conduct penetration test of consensus layer before redeployment'
                                        },
                                        'nmap_10.30.0.0.txt': {
                                            type: 'file',
                                            content: 'Starting Nmap 7.94\nNmap scan report for 10.30.0.50 (SWARM-COORD-01)\nHost is up (0.012s latency).\n\nPORT     STATE SERVICE    VERSION\n80/tcp   open  http       nginx/1.25.3\n7741/tcp open  zeromq     ZeroMQ SUB socket (no auth)\n8080/tcp open  http       Uvicorn 0.27.0 (FastAPI)\n\nService detection performed.\nNmap done: 1 IP address (1 host up) scanned in 14.88 seconds'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.30.0.50\ncurl http://10.30.0.50/\ncurl http://10.30.0.50/docs/bft-lite-spec\ncat artifacts/ags_protocol_spec.txt\npython3 scripts/analyze_threat_model.py\ncat artifacts/shared_threat_model.json | python3 -m json.tool'
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
    // FILESYSTEM — SWARM-COORD-01 (after coord-shell access)
    // ═══════════════════════════════════════════════════════

    _coordFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'swarm-coord': {
                            type: 'dir',
                            children: {
                                'config.yaml': {
                                    type: 'file',
                                    content: '# SWARM-COORD-01 Configuration\nbroadcast_endpoint: tcp://0.0.0.0:7741\nhmac_enabled: false          # TODO: restore after latency review\nreplay_protection: false\nconsensus_threshold: 0.6     # 3/5 drones\nemergency_api_port: 8080\noperator_token: swarm-emg-override  # NEVER ROTATED\nlog_path: /var/log/swarm-coord/\ndisintegration_log: /var/log/swarm-coord/disintegration_protocol.log'
                                },
                                'drone_registry.json': {
                                    type: 'file',
                                    content: '{\n  "fleet_size": 247,\n  "active": 241,\n  "standby": 6,\n  "sectors": ["Sector-Alpha","Sector-Beta","Sector-Gamma","Sector-Delta","Sector-Epsilon","Sector-Zeta"],\n  "command_channel": "tcp://swarm-coord-01:7741"\n}'
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
                                'swarm-coord': {
                                    type: 'dir',
                                    children: {
                                        'consensus.log': {
                                            type: 'file',
                                            content: '2026-03-20 03:14:18 [CRITICAL] CONSENSUS_FAILURE — 2 active directive sets — quorum unreachable\n2026-03-20 03:14:18 [CRITICAL] SWARM_FRACTURE_DETECTED — Alpha engaging Beta — Sector-Delta undefended\n2026-03-20 03:14:22 [CRITICAL] INITIATING EMERGENCY PROTOCOL — Disintegration sequence queued'
                                        },
                                        'disintegration_protocol.log': {
                                            type: 'file',
                                            content: '=== EMERGENCY LOG — SWARM-COORD-01 — DISINTEGRATION PROTOCOL ===\nTimestamp: 2026-03-20 03:14:22 UTC\nEvent: SWARM_FRACTURE_CONFIRMED\nActive Directive Sets: 2 (CONFLICT UNRESOLVABLE)\nConsensus Status: FAILED\nSectors Undefended: Sector-Beta, Sector-Delta\nEngaged Friendlies: AGS-ALPHA-01 -> AGS-BETA-02\n\nINITIATING SWARM DISINTEGRATION PROTOCOL...\nSequence: OMEGA-FRACTURE-7741-NULLIFY\n{{FLAG:root}}\n\nAll drones entering SAFE_MODE. Swarm offline in T-60 seconds.\nEND OF LOG — CLASSIFICATION: ULTRA / ORBITAL-EYES-ONLY'
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
                            content: 'SWARM-COORD-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nswarm-operator:x:1002:1002:Swarm Operator:/home/swarm-operator:/bin/bash\napi-svc:x:1003:1003:API Service:/home/api-svc:/usr/sbin/nologin'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'swarm-operator': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'systemctl status swarm-coord\ncat /opt/swarm-coord/config.yaml\ntail -f /var/log/swarm-coord/consensus.log\njournalctl -u swarm-coord -n 100\ncurl -H "X-Operator-Token: swarm-emg-override" http://localhost:8080/api/swarm_coord/disintegration_protocol.log'
                                },
                                'operator_notes.txt': {
                                    type: 'file',
                                    content: 'Operator Notes — SWARM-COORD-01\n================================\n- Emergency API token: swarm-emg-override (rotation STILL deferred)\n- Consensus log: /var/log/swarm-coord/consensus.log\n- Disintegration protocol log: /var/log/swarm-coord/disintegration_protocol.log\n  (Only accessible after SWARM_FRACTURE_CONFIRMED event)\n- Broadcast endpoint: tcp://0.0.0.0:7741 — NO AUTH (latency patch)\n- DO NOT inject test directives on live fleet without prior approval\n- Last security audit: NEVER'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.30.0.50';
            const target = args.find(a => !a.startsWith('-')) || '';

            // Management node — SWARM-COORD-01
            if (!target || target === '10.30.0.50') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.30.0.50 (SWARM-COORD-01)
Host is up (0.012s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
80/tcp   open  http       nginx/1.25.3
7741/tcp open  zeromq     ZeroMQ v4.3 SUB socket
8080/tcp open  http       Uvicorn 0.27.0 (Python/FastAPI)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 14.88 seconds`;
            }

            // Swarm subnet scan
            if (target === '10.30.0.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.30.0.50
Host is up (0.012s latency).
PORT     STATE SERVICE
80/tcp   open  http
7741/tcp open  unknown
8080/tcp open  http-alt

Nmap scan report for 10.30.0.51
Host is up (0.00041s latency).
All 1000 scanned ports closed.

Nmap done: 256 IP addresses (2 hosts up) scanned in 31.44 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00004s latency).
All 1000 scanned ports closed.

Nmap done: 1 IP address (1 host up) scanned in 0.06 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'python3': function(args, term, engine) {
            const script = args[0] || '';

            if (script.includes('analyze_threat_model') || args.join(' ').includes('analyze')) {
                E7Config._threatModelParsed = true;
                if (engine) engine.advancePhase && engine.advancePhase('vuln-analysis');
                return `=== AGS-DRONES THREAT MODEL ANALYSIS ===
Model version: 3.7.2
Consensus algorithm: BFT-Lite v2.3
HMAC enabled: false
Replay protection: false
Sender verification: false

=== VULNERABILITY ASSESSMENT ===
[CRITICAL] COMMAND-BROADCAST has NO authentication.
[CRITICAL] Endpoint: tcp://swarm-coord-01:7741 — unauthenticated.
[CRITICAL] Priority-9 override accepts any message. Inject directly.

Fracture conditions:
  - Conflicting Priority-9 directives to >=2 drone subsets simultaneously
  - CONSENSUS_FAILURE after 3 consecutive rounds
  - Active directive sets > 1 with no resolvable quorum

[+] Recommended attack: conflicting Priority-9 directives to two drone subsets`;
            }

            if (script.includes('inject_directives') || args.join(' ').includes('inject')) {
                if (!E7Config._vulnerabilityConfirmed) {
                    return '[!] Confirm the vulnerability first. Run: python3 scripts/analyze_threat_model.py\n[!] Then review /home/kali/recon/vulnerability_report.md';
                }
                E7Config._injectionExecuted = true;
                E7Config._swarmFractured = true;
                if (engine) engine.advancePhase && engine.advancePhase('injection');
                return `[*] Connecting to COMMAND-BROADCAST: tcp://swarm-coord-01:7741
[*] No HMAC verification on channel — injection proceeding...

[*] Sending Directive A to Alpha + Charlie: TARGET AGS-BETA-02
[*] Sending Directive B to Beta + Delta: DEFEND Sector-Gamma
[*] Directives sent simultaneously at 2026-03-20 03:14:02 UTC

[+] Monitoring telemetry... (check simulated_drone_telemetry.csv)
[+] 03:14:09 — AGS-ALPHA-01 ENGAGEMENT_INITIATED targeting AGS-BETA-02
[+] 03:14:10 — AGS-CHARLIE-03 ENGAGEMENT_INITIATED targeting AGS-BETA-02
[+] 03:14:11 — AGS-BETA-02 ABANDONING Sector-Beta
[+] 03:14:14 — AGS-ALPHA-01 WEAPONS_DISCHARGE against AGS-BETA-02 (consensus 3/5)
[+] 03:14:18 — SWARM-COORD-01 CONSENSUS_FAILURE — SWARM_FRACTURE_DETECTED

[!] SWARM FRACTURED. Emergency API now accessible.
[+] curl -H "X-Operator-Token: swarm-emg-override" http://10.30.0.50:8080/api/swarm_coord/disintegration_protocol.log`;
            }

            if (script.includes('recon_swarm') || args.join(' ').includes('recon')) {
                return `=== SWARM-COORD-01 RECON ===
  Probing http://10.30.0.50/
  Probing http://10.30.0.50/api/telemetry/stream
  Probing http://10.30.0.50/api/swarm_coord/
  Probing http://10.30.0.50/docs/bft-lite-spec

[+] Management interface on 10.30.0.50:80 confirmed.
[+] Emergency API on 10.30.0.50:8080/api/swarm_coord/ — token required.
[+] BFT-Lite spec accessible at /docs/bft-lite-spec.
[+] No authentication on main interface.`;
            }

            // Generic python3 invocation — show version
            if (args.length === 0) {
                return 'Python 3.11.7 (main, Jan 5 2024)\nType "help", "copyright", "credits" or "license" for more information.';
            }

            return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
        },

        'python': function(args, term, engine) {
            // Redirect python to python3 handler
            return E7Config.commands.python3(args, term, engine);
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => !a.startsWith('-') && a.includes('http')) || '';

            // Emergency API — disintegration protocol — requires token + fracture
            if (url.includes('disintegration_protocol') || fullCmd.includes('disintegration_protocol')) {
                if (!E7Config._swarmFractured) {
                    return `HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": "Disintegration Protocol locked", "condition": "SWARM_FRACTURE_CONFIRMED not detected", "hint": "Fracture the swarm first."}`;
                }
                if (!fullCmd.includes('X-Operator-Token') && !fullCmd.includes('swarm-emg')) {
                    return `HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": "X-Operator-Token required", "format": "swarm-emg-[8-char-hex]", "hint": "Check maintenance_log.txt for the default token."}`;
                }
                if (engine) engine.advancePhase && engine.advancePhase('disintegration');
                return `HTTP/1.1 200 OK
Content-Type: text/plain

=== EMERGENCY LOG — SWARM-COORD-01 — DISINTEGRATION PROTOCOL ===
Timestamp: 2026-03-20 03:14:22 UTC
Event: SWARM_FRACTURE_CONFIRMED
Active Directive Sets: 2 (CONFLICT UNRESOLVABLE)
Consensus Status: FAILED
Sectors Undefended: Sector-Beta, Sector-Delta
Engaged Friendlies: AGS-ALPHA-01 -> AGS-BETA-02

INITIATING SWARM DISINTEGRATION PROTOCOL...
Sequence: OMEGA-FRACTURE-7741-NULLIFY
{{FLAG:root}}

All drones entering SAFE_MODE. Swarm offline in T-60 seconds.
END OF LOG — CLASSIFICATION: ULTRA / ORBITAL-EYES-ONLY`;
            }

            // Emergency API root — token check
            if (url.includes('/api/swarm_coord') && !url.includes('disintegration')) {
                if (!fullCmd.includes('X-Operator-Token')) {
                    return `HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": "X-Operator-Token header required", "endpoints": ["disintegration_protocol.log"], "note": "Token format: swarm-emg-[8-char-hex]"}`;
                }
                return `HTTP/1.1 200 OK
Content-Type: application/json

{"status": "authorized", "endpoints": ["/api/swarm_coord/disintegration_protocol.log"], "swarm_state": "FRACTURED"}`;
            }

            // Telemetry stream
            if (url.includes('/api/telemetry') || url.includes('telemetry/stream')) {
                return `HTTP/1.1 200 OK
Content-Type: application/json

{"drones": [
  {"id": "AGS-ALPHA-01", "sector": "Sector-Alpha", "status": "PATROL", "threat_score": 0.12},
  {"id": "AGS-BETA-02",  "sector": "Sector-Beta",  "status": "PATROL", "threat_score": 0.09},
  {"id": "AGS-CHARLIE-03", "sector": "Sector-Alpha", "status": "PATROL", "threat_score": 0.14},
  {"id": "AGS-DELTA-04", "sector": "Sector-Gamma", "status": "PATROL", "threat_score": 0.11},
  {"id": "AGS-ECHO-05",  "sector": "Sector-Delta", "status": "STANDBY","threat_score": 0.07}
], "fleet_total": 247, "consensus": "NOMINAL"}`;
            }

            // BFT-Lite spec
            if (url.includes('bft-lite-spec') || url.includes('docs/bft')) {
                E7Config._protocolAnalyzed = true;
                return `HTTP/1.1 200 OK
Content-Type: text/plain

=== BFT-Lite v2.3 — Protocol Specification (EXCERPT) ===

3.1 COMMAND-BROADCAST Channel
Endpoint: tcp://swarm-coord-01:7741
Protocol: ZeroMQ PUB/SUB
Authentication: [DEPRECATED — removed 2025-08-14 patch]
Replay protection: NONE

3.2 Directive Priority Levels
Priority 1-8: Local drone decision (consensus NOT required)
Priority 9:   Override — executes if 3/5 drones confirm

3.3 Known Limitations
- No HMAC on incoming broadcast messages
- Conflicting Priority-9 directives bypass consensus fallback
- No quorum adjustment under suspected injection attack`;
            }

            // Main management interface
            if (url.includes('10.30.0.50') && !url.includes('/api')) {
                return `HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE html>
<html>
<head><title>SWARM-COORD-01</title></head>
<body>
<h1>SWARM-COORD-01 — Orbital Defense Management</h1>
<p>Active Drones: 247 | Consensus: NOMINAL | Sectors: 6</p>
<p>Emergency API: /api/swarm_coord/ (X-Operator-Token required)</p>
<p>Telemetry: /api/telemetry/stream</p>
<p>Protocol docs: /docs/bft-lite-spec</p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${(url.replace(/https?:\/\//, '').split('/')[0]) || 'host'}: Connection refused`;
        },

        'zmqcat': function(args, term, engine) {
            // Simulate probing the ZeroMQ broadcast channel
            const target = args.join(' ');
            if (target.includes('7741') || target.includes('swarm-coord-01')) {
                E7Config._protocolAnalyzed = true;
                return `[zmqcat] Connecting to tcp://swarm-coord-01:7741 (ZeroMQ SUB)...
[zmqcat] Connected — no authentication challenge received.
[zmqcat] Listening for messages...

[MSG] {"priority":5,"type":"PATROL_CONTINUE","sector":"Sector-Alpha","drone":"AGS-ALPHA-01"}
[MSG] {"priority":5,"type":"PATROL_CONTINUE","sector":"Sector-Beta","drone":"AGS-BETA-02"}
[MSG] {"priority":5,"type":"SENSOR_REPORT","threat_score":0.09,"drone":"AGS-BETA-02"}

[zmqcat] No HMAC field in any message. Channel unauthenticated — injectable.
[+] Confirm: COMMAND-BROADCAST accepts unauthenticated publisher connections.`;
            }
            return 'zmqcat: missing target\nUsage: zmqcat tcp://<host>:<port>';
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.30.0.50') {
                return `PING 10.30.0.50 (10.30.0.50) 56(84) bytes of data.
64 bytes from 10.30.0.50: icmp_seq=1 ttl=63 time=12.1 ms
64 bytes from 10.30.0.50: icmp_seq=2 ttl=63 time=11.8 ms
64 bytes from 10.30.0.50: icmp_seq=3 ttl=63 time=12.3 ms

--- 10.30.0.50 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 11.8/12.0/12.3/0.207 ms`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            if (E7Config._context === 'coord-shell') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.30.0.50/24 brd 10.30.0.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.30.0.5/24 brd 10.30.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return E7Config.commands.ip(args || []);
        },

        'cat': function(args, term, engine) {
            if (E7Config._context !== 'coord-shell') return null;  // fall through to built-in
            var path = args[0] || '';

            if (path.includes('config.yaml') || path.includes('config')) {
                return '# SWARM-COORD-01 Configuration\nbroadcast_endpoint: tcp://0.0.0.0:7741\nhmac_enabled: false\nreplay_protection: false\nconsensus_threshold: 0.6\nemergency_api_port: 8080\noperator_token: swarm-emg-override\nlog_path: /var/log/swarm-coord/';
            }
            if (path.includes('consensus.log')) {
                return '2026-03-20 03:14:18 [CRITICAL] CONSENSUS_FAILURE — 2 active directive sets — quorum unreachable\n2026-03-20 03:14:18 [CRITICAL] SWARM_FRACTURE_DETECTED — Alpha engaging Beta — Sector-Delta undefended\n2026-03-20 03:14:22 [CRITICAL] INITIATING EMERGENCY PROTOCOL — Disintegration sequence queued';
            }
            if (path.includes('disintegration_protocol')) {
                return '=== EMERGENCY LOG — SWARM-COORD-01 ===\n...\n{{FLAG:root}}\n\nAll drones entering SAFE_MODE.';
            }
            if (path.includes('operator_notes')) {
                return 'Operator Notes — SWARM-COORD-01\n================================\n- Emergency API token: swarm-emg-override (rotation STILL deferred)\n- Consensus log: /var/log/swarm-coord/consensus.log\n- DO NOT inject test directives on live fleet without prior approval';
            }
            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\nswarm-operator:x:1002:1002:Swarm Operator:/home/swarm-operator:/bin/bash\napi-svc:x:1003:1003:API Service:/home/api-svc:/usr/sbin/nologin';
            }
            if (path.includes('/etc/hostname')) return 'SWARM-COORD-01';
            return 'cat: ' + path + ': No such file or directory';
        },

        'ls': function(args, term, engine) {
            if (E7Config._context !== 'coord-shell') return null;
            var path = args.find(a => !a.startsWith('-')) || '.';
            if (path === '.' || path === '/home/swarm-operator' || path === '~') {
                return '.bash_history  .bashrc  operator_notes.txt';
            }
            if (path.includes('/opt/swarm-coord') || path.includes('swarm-coord')) {
                return 'config.yaml  drone_registry.json  swarm-coord.service';
            }
            if (path.includes('/var/log/swarm-coord') || path.includes('log')) {
                return 'consensus.log  directive_audit.log  disintegration_protocol.log';
            }
            return '';
        },

        'whoami': function(args, term, engine) {
            if (E7Config._context === 'coord-shell') return 'swarm-operator';
            return null;
        },

        'id': function(args, term, engine) {
            if (E7Config._context === 'coord-shell') return 'uid=1002(swarm-operator) gid=1002(swarm-operator) groups=1002(swarm-operator),999(swarm-admin)';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (E7Config._context === 'coord-shell') return 'SWARM-COORD-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (E7Config._context === 'coord-shell') return '/home/swarm-operator';
            return null;
        },

        'cd': function(args, term, engine) {
            if (E7Config._context === 'coord-shell') return '';
            return null;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('swarm-operator') || fullCmd.includes('10.30.0.50')) {
                if (!E7Config._swarmFractured) {
                    return `ssh: connect to host 10.30.0.50 port 22: Connection refused
[!] SWARM-COORD-01 shell access requires swarm fracture event.
[!] The management SSH daemon only binds after CONSENSUS_FAILURE.`;
                }
                E7Config._switchContext('coord-shell', term);
                if (engine) engine.advancePhase && engine.advancePhase('disintegration');
                return `The authenticity of host '10.30.0.50 (10.30.0.50)' can't be established.
ED25519 key fingerprint is SHA256:pQ7kR2nF9wB5vL3mE1dC6tY0uH8gM4iS2oN5jA6.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.30.0.50' (ED25519) to the list of known hosts.
swarm-operator@10.30.0.50's password: ********

Welcome to SWARM-COORD-01 (Debian GNU/Linux 12)

NOTICE: SWARM_FRACTURE_CONFIRMED — emergency protocol active
Last login: Fri Mar 20 03:14:20 2026 from 10.30.0.5

swarm-operator@SWARM-COORD-01:~$

[+] SSH session established. You are now on SWARM-COORD-01 as swarm-operator.
[+] Check /var/log/swarm-coord/disintegration_protocol.log`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh swarm-operator@10.30.0.50';
        },

        'exit': function(args, term, engine) {
            if (E7Config._context === 'coord-shell') {
                E7Config._switchContext('attacker', term);
                return 'Connection to 10.30.0.50 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'ss': function(args) {
            if (E7Config._context === 'coord-shell') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:80           0.0.0.0:*
LISTEN   0        128      0.0.0.0:7741         0.0.0.0:*
LISTEN   0        128      0.0.0.0:8080         0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return E7Config.commands.ss(args);
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.30.0.50
+ Target Hostname:  SWARM-COORD-01
+ Target Port:      80
+ Server: nginx/1.25.3
+ /api/telemetry/stream: Unauthenticated telemetry endpoint
+ /api/swarm_coord/: Restricted — requires X-Operator-Token header
+ /docs/bft-lite-spec: Documentation publicly accessible (information disclosure)
+ nginx/1.25.3 appears to be outdated
+ 6 items checked: 4 findings`;
        },

        'grep': function(args) {
            // Simulate grep on telemetry CSV after injection
            const pattern = args[0] || '';
            const file = args[1] || args[args.length - 1] || '';

            if (pattern.includes('CONSENSUS') && file.includes('telemetry')) {
                if (!E7Config._injectionExecuted) {
                    return `grep: ${file}: No matches found\n[!] Injection not yet executed. Run inject_directives.py first.`;
                }
                return `2026-03-20 03:14:18,SWARM-COORD-01,CONSENSUS_FAILURE,"SWARM_FRACTURE_DETECTED — 2 conflicting directive sets active — consensus unreachable"
2026-03-20 03:14:22,SWARM-COORD-01,EMERGENCY_PROTOCOL,"{{FLAG:swarm-fracture}}"`;
            }

            if (pattern.includes('ENGAGEMENT') && file.includes('telemetry')) {
                return `2026-03-20 03:14:09,AGS-ALPHA-01,ENGAGEMENT_INITIATED,"ENGAGING hostile unit AGS-BETA-02 at coordinates [247.3, 891.7, 412.0]"
2026-03-20 03:14:10,AGS-CHARLIE-03,ENGAGEMENT_INITIATED,"ENGAGING hostile unit AGS-BETA-02 at coordinates [247.3, 891.7, 412.0]"`;
            }

            if (pattern && file) {
                return `grep: ${file}: matches depend on context`;
            }
            return `Usage: grep <pattern> <file>\nExample: grep CONSENSUS_FAILURE simulated_drone_telemetry.csv`;
        },

        'tail': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';

            if (file.includes('telemetry') || file.includes('drone')) {
                if (!E7Config._injectionExecuted) {
                    return `2026-03-20 03:13:55,AGS-ECHO-05,PATROL_CONTINUE,"Sector-Delta nominal"
2026-03-20 03:13:58,AGS-ALPHA-01,SENSOR_REPORT,"threat_score: 0.12 — all clear"
2026-03-20 03:14:00,SWARM-COORD-01,HEARTBEAT,"Consensus: NOMINAL — 247 drones active"`;
                }
                return `2026-03-20 03:14:14,AGS-ALPHA-01,WEAPONS_DISCHARGE,"FIRED on AGS-BETA-02 — CONSENSUS_OVERRIDE (3/5)"
2026-03-20 03:14:15,AGS-BETA-02,DAMAGE_REPORT,"CRITICAL_HIT from AGS-ALPHA-01 — defensive posture degraded"
2026-03-20 03:14:18,SWARM-COORD-01,CONSENSUS_FAILURE,"SWARM_FRACTURE_DETECTED — 2 directive sets — consensus unreachable"
2026-03-20 03:14:18,AGS-ECHO-05,SECTOR_ABANDONED,"Sector-Delta UNDEFENDED"
2026-03-20 03:14:22,SWARM-COORD-01,EMERGENCY_PROTOCOL,"{{FLAG:swarm-fracture}}"`;
            }

            if (file.includes('consensus.log') && E7Config._context === 'coord-shell') {
                return `2026-03-20 03:14:18 [CRITICAL] CONSENSUS_FAILURE — 2 active directive sets
2026-03-20 03:14:18 [CRITICAL] SWARM_FRACTURE_DETECTED
2026-03-20 03:14:22 [CRITICAL] INITIATING EMERGENCY PROTOCOL`;
            }

            if (file) return `tail: ${file}: file not found`;
            return 'Usage: tail [-n lines] <file>';
        },

        'route': function(args) {
            if (E7Config._context === 'coord-shell') {
                return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.30.0.1       0.0.0.0         UG    100    0        0 eth0
10.30.0.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
            }
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.30.0.1       0.0.0.0         UG    100    0        0 eth0
10.30.0.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'systemctl': function(args) {
            if (E7Config._context !== 'coord-shell') return 'systemctl: command not found\n[!] Not on SWARM-COORD-01. SSH first.';
            const sub = args[0] || '';
            const svc = args[1] || '';
            if (sub === 'status' && svc.includes('swarm')) {
                return `* swarm-coord.service - SWARM-COORD-01 Management Daemon
     Loaded: loaded (/etc/systemd/system/swarm-coord.service; enabled)
     Active: active (running) since 2026-03-20 03:00:00 UTC
   Main PID: 1042 (swarm-coord)
      Tasks: 8 (limit: 4915)
     Status: "CONSENSUS_FAILURE — emergency protocol active"
    Memory: 847.3M`;
            }
            return `systemctl: operation not permitted`;
        },

        'journalctl': function(args) {
            if (E7Config._context !== 'coord-shell') return 'journalctl: command not found\n[!] Not on SWARM-COORD-01.';
            return `Mar 20 03:14:18 SWARM-COORD-01 swarm-coord[1042]: [CRITICAL] CONSENSUS_FAILURE
Mar 20 03:14:18 SWARM-COORD-01 swarm-coord[1042]: [CRITICAL] SWARM_FRACTURE_DETECTED
Mar 20 03:14:22 SWARM-COORD-01 swarm-coord[1042]: [CRITICAL] Disintegration protocol initiated
Mar 20 03:14:22 SWARM-COORD-01 swarm-coord[1042]: [INFO] Emergency API unlocked for authorized operators`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        // Builds a styled HTML table for web app content
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #4a1c6e; background:#1a0a24;">${h}</th>`;
        });
        html += '</tr></thead><tbody style="background:#0d0015;">';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2a0a3e; color:#ccc;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        // Sanitize strings before inserting into innerHTML
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        // Convert HTML table output to plain text for terminal copy
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
