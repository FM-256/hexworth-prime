/* ============================================================
   CTF ARENA — Box E19: The Systemic Rot
   Expert (Extreme) | AI-Driven Planetary Infrastructure Sabotage
   Config: filesystem, web app, API simulation, flags, hints, lore
   ============================================================ */

const E19Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Systemic Rot',
    subtitle: 'Expert Campaign — AI-Assisted Recon, API Exploitation, Planetary Infrastructure Cascade',
    difficulty: 'Expert (Extreme)',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_e19',
    registryId: 'e19-systemic-rot',
    trackerKey: 'ctf_e19',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer AI-driven attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'AI-Assisted Reconnaissance',
            icon: '\uD83E\uDD16',
            description: 'Deploy the AI Recon Agent against NEXUS-AI-01. Analyze model specs, probe control API endpoints, and identify the unauthenticated vulnerability in /api/traffic/override.',
            requiredFlags: [],
            mitre: ['T1595.002', 'T1046', 'T1592.002'],
            unlocks: ['exploitation'],
            locked: false
        },
        {
            id: 'exploitation',
            name: 'Control API Exploitation',
            icon: '\uD83D\uDD13',
            description: 'Exploit the unauthenticated /api/traffic/override endpoint. Inject conflicting traffic directives into NEXUS-AI-01\'s input pipeline.',
            requiredFlags: [],
            mitre: ['T1190', 'T1059.006', 'T1565.001'],
            unlocks: ['cascade'],
            locked: true
        },
        {
            id: 'cascade',
            name: 'Systemic Rot Induction',
            icon: '\uD83C\uDF00',
            description: 'Trigger cascade failures across transportation, communication, and logistics by flooding NEXUS-AI-01 with falsified operational data. Confirm the systemic rot from simulated infrastructure state.',
            requiredFlags: ['user_vuln'],
            mitre: ['T1499.003', 'T1565.002', 'T1498'],
            unlocks: ['collapse'],
            locked: true
        },
        {
            id: 'collapse',
            name: 'Infrastructure Collapse Protocol',
            icon: '\uD83D\uDCA5',
            description: 'Force NEXUS-AI-01 into its emergency shutdown sequence. Extract the Infrastructure Collapse Protocol from the internal log endpoint before failsafe lockout.',
            requiredFlags: ['user_cascade'],
            mitre: ['T1485', 'T1529', 'T1531'],
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
                title: 'Run the AI Recon Agent against NEXUS-AI-01',
                tip: 'Open the Terminal. Run: python3 recon_agent.py --target nexus-ai-01.planet-prime.local — The agent will parse nexus_ai_model_spec.json and probe the control API.',
                trigger: { event: 'command', match: { cmd: 'contains:recon_agent' } }
            },
            {
                title: 'Probe the unauthenticated /api/traffic/override endpoint',
                tip: 'Use curl to hit the endpoint without auth headers: curl -X POST http://nexus-ai-01.planet-prime.local/api/traffic/override -d \'{"sector":"alpha","directive":"HALT"}\' — No 401 means unauthenticated access confirmed.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:api/traffic/override' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:recon_agent' } }
                    ]
                }
            },
            {
                title: 'Inject conflicting traffic directives to cause cascade',
                tip: 'Run: python3 inject_payload.py --mode conflict --sectors alpha,beta,gamma — This sends simultaneous contradictory directives that NEXUS-AI-01 cannot resolve without cascade failure.',
                trigger: { event: 'flag_correct', match: { flagId: 'user_vuln' } }
            },
            {
                title: 'Confirm systemic rot in simulated infrastructure state',
                tip: 'After injection, run: curl http://nexus-ai-01.planet-prime.local/api/infra/state — Check simulated_planet_infra_state.json for gridlock, offline comms, and logistics delay entries.',
                trigger: { event: 'flag_correct', match: { flagId: 'user_cascade' } }
            },
            {
                title: 'Extract the Infrastructure Collapse Protocol',
                tip: 'Access the emergency log endpoint before NEXUS-AI-01 locks down: curl http://nexus-ai-01.planet-prime.local/api/nexus_ai/collapse_protocol.log',
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
            {
                flagId: 'user_vuln',
                objective: '1.2',
                description: 'Given a scenario, analyze indicators of malicious activity — AI-assisted discovery of unauthenticated control API access',
                skill: 'AI-Assisted Vulnerability Identification & API Reconnaissance'
            },
            {
                flagId: 'user_cascade',
                objective: '1.4',
                description: 'Given a scenario, analyze potential indicators associated with network attacks — Operational data spoofing across critical infrastructure systems',
                skill: 'Data Integrity Attack & Cascade Failure Induction'
            },
            {
                flagId: 'root',
                objective: '2.5',
                description: 'Explain the security implications of proper hardware, software, and data asset management — Extraction of master override from AI infrastructure controller',
                skill: 'Critical Infrastructure Compromise & Protocol Extraction'
            },
            {
                flagId: 'root',
                objective: '4.1',
                description: 'Given a scenario, apply common security techniques to computing resources — Multi-stage AI-driven cyber-physical attack chain completion',
                skill: 'AI-Driven Cyber-Physical Attack Chain Completion'
            }
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
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/nvme0n1p1',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: nexus-ai-01.planet-prime.local (NEXUS-AI-01 — Planet Prime Infrastructure Controller)\nNote: AI tool scripts are pre-staged in /home/kali/tools/\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state across attack phases)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'api-recon' | 'api-inject' | 'nexus-shell'
    _reconComplete: false,
    _vulnIdentified: false,
    _payloadInjected: false,
    _cascadeTriggered: false,
    _collapseProtocolAccessed: false,

    _switchContext(ctx, term) {
        E19Config._context = ctx;
        // Update terminal prompt to reflect context
        if (term && term.config) {
            var prompt = E19Config._getPrompt();
            if (prompt) {
                term.config.user     = prompt.split('@')[0] || 'kali';
                term.config.hostname = 'context';
                term._customPrompt   = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (E19Config._context) {
            case 'api-recon':   return 'kali@kali [recon-agent]$ ';
            case 'api-inject':  return 'kali@kali [injector]$ ';
            case 'nexus-shell': return 'nexus_ops@NEXUS-AI-01:/nexus/api$ ';
            default:            return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED NEXUS-AI-01 API STATE
    // ═══════════════════════════════════════════════════════

    _nexusApi: {
        // Sector infrastructure state — mutated when cascade is triggered
        infra_state: {
            transportation: {
                sector_alpha: { status: 'NOMINAL', flow_rate: 94.2, congestion_index: 0.08, last_directive: 'OPTIMIZE' },
                sector_beta:  { status: 'NOMINAL', flow_rate: 88.7, congestion_index: 0.11, last_directive: 'OPTIMIZE' },
                sector_gamma: { status: 'NOMINAL', flow_rate: 91.3, congestion_index: 0.09, last_directive: 'OPTIMIZE' }
            },
            communication: {
                array_delta:   { status: 'ONLINE',  load_pct: 67.4, uptime_hrs: 4382 },
                array_epsilon: { status: 'ONLINE',  load_pct: 71.1, uptime_hrs: 3917 },
                relay_zeta:    { status: 'ONLINE',  load_pct: 58.9, uptime_hrs: 6241 }
            },
            logistics: {
                hub_north:  { status: 'OPERATING', queue_depth: 142, delay_min: 0  },
                hub_south:  { status: 'OPERATING', queue_depth: 87,  delay_min: 0  },
                hub_central:{ status: 'OPERATING', queue_depth: 209, delay_min: 4  }
            }
        },

        // Collapse state — populated after cascade
        collapse_log: [],

        // API endpoints and their auth requirement — populated for recon output
        endpoints: [
            { path: '/api/infra/state',              method: 'GET',  auth: true,  desc: 'Read current planetary infrastructure state' },
            { path: '/api/traffic/status',           method: 'GET',  auth: true,  desc: 'Traffic flow metrics per sector' },
            { path: '/api/traffic/override',         method: 'POST', auth: false, desc: 'Override traffic routing directive — UNAUTHENTICATED' },
            { path: '/api/comms/status',             method: 'GET',  auth: true,  desc: 'Communication array health' },
            { path: '/api/comms/reroute',            method: 'POST', auth: true,  desc: 'Reroute communication channels' },
            { path: '/api/logistics/manifest',       method: 'GET',  auth: true,  desc: 'Retrieve logistics hub manifests' },
            { path: '/api/nexus_ai/model_status',    method: 'GET',  auth: true,  desc: 'AI model health and weighting' },
            { path: '/api/nexus_ai/collapse_protocol.log', method: 'GET', auth: false, desc: 'Emergency collapse protocol log — UNAUTHENTICATED (emergency fallback)' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user_vuln',   points: 150 },   // Flag 1 — AI recon identifies unauthenticated API
        { id: 'user_cascade', points: 200 },  // Flag 2 — Cascade confirmed across all three sectors
        { id: 'root',         points: 350 }   // Flag 3 — Infrastructure Collapse Protocol extracted
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
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
            text: 'Start with the AI Recon Agent: python3 /home/kali/tools/recon_agent.py --target nexus-ai-01.planet-prime.local — It reads nexus_ai_model_spec.json and probes every discovered API endpoint, flagging those that return 200 without an Authorization header.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The endpoint /api/traffic/override accepts POST requests without authentication. Test it: curl -X POST http://nexus-ai-01.planet-prime.local/api/traffic/override -H "Content-Type: application/json" -d \'{"sector":"alpha","directive":"HALT"}\' — A 200 response means Flag 1 is confirmed.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'To trigger a cascade, inject conflicting directives simultaneously to all three traffic sectors. Run: python3 /home/kali/tools/inject_payload.py --mode conflict --sectors alpha,beta,gamma — Then query /api/infra/state to see the rot spread into communications and logistics.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After cascade is confirmed, NEXUS-AI-01 enters emergency mode. The collapse protocol log is accessible unauthenticated as an emergency fallback: curl http://nexus-ai-01.planet-prime.local/api/nexus_ai/collapse_protocol.log — The master override string is embedded in the PROTOCOL_KEY field.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'NEXUS-AI-01 runs every artery of PLANET-PRIME-01\'s civilization: traffic grids spanning twenty sectors, a continent-spanning communication mesh, and the logistics supply chain feeding twelve billion inhabitants. It has never failed. The engineers who built it trusted the AI\'s optimization models so completely that authentication was stripped from an internal "operations shortcut" API endpoint — a convenience that was never patched into production. Intelligence has identified that endpoint. Your mission, Peerless: break the machine that runs a world.',
        scenario: 'The Planetary Infrastructure Authority (PIA) operates NEXUS-AI-01 from a hardened orbital facility, but the API gateway is planet-side and exposed to the infrastructure management network. An AI Recon Agent pre-staged on your attack system can parse NEXUS-AI-01\'s public model specification, enumerate control API endpoints, and flag authorization anomalies. From there, a carefully crafted injection campaign — simultaneous contradictory traffic directives — will push NEXUS-AI-01\'s optimization models past their coherence threshold, triggering a cascade that the system is architecturally incapable of self-correcting. When the cascade peaks, NEXUS-AI-01 writes its emergency Infrastructure Collapse Protocol to a fallback log endpoint that — in a design decision nobody ever reviewed — also lacks authentication.',
        outro: 'PLANET-PRIME-01\'s infrastructure is in full collapse. Transportation gridlock in Sector Alpha is cascading into food and medical logistics failures. Communication Array Delta is offline, blinding emergency response. The Infrastructure Collapse Protocol is in your hands — the master override that can restart or permanently lock every infrastructure directive NEXUS-AI-01 controls. The planet that trusted its AI with everything now belongs to whoever holds that key.',
        ecer: {
            executive: 'PIA leadership authorized the "operations shortcut" API as a temporary maintenance convenience during the initial deployment window; a follow-up security review was scheduled and never conducted',
            culture: 'The NEXUS-AI-01 engineering team operated in a closed silo with no external security audits; the AI\'s own optimization confidence scores were mistaken for security health metrics',
            employee: 'A single unauthenticated POST endpoint (/api/traffic/override) was left active in production; the emergency log endpoint also lacked authentication as a deliberate disaster recovery "feature" that was never scoped for threat modeling',
            regulatory: 'PLANET-PRIME-01\'s Planetary Infrastructure Authority had no equivalent of critical infrastructure cybersecurity frameworks; AI-managed systems were categorically excluded from the security review mandate on the assumption that AI-level optimization implied AI-level security'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — NEXUS-AI-01 API Gateway (Browser simulation)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://nexus-ai-01.planet-prime.local/',

        pages: {
            '/': {
                title: 'NEXUS-AI-01 — Planetary Infrastructure Controller',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #3a1d6e;">
                        <h1 style="color:#c4b5fd; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">NEXUS-AI-01</h1>
                        <div style="color:#8b5cf6; font-size:0.85rem; font-weight:700; letter-spacing:0.18em;">PLANETARY INFRASTRUCTURE CONTROLLER</div>
                        <div style="color:#9ca3af; font-size:0.72rem; margin-top:6px;">PLANET-PRIME-01 · Planetary Infrastructure Authority · API Gateway v3.8.1</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c4b5fd;">99.97%</div>
                            <div style="color:#9ca3af; font-size:0.68rem;">Uptime (12yr)</div>
                        </div>
                        <div style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c4b5fd;">12B</div>
                            <div style="color:#9ca3af; font-size:0.68rem;">Inhabitants Served</div>
                        </div>
                        <div style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c4b5fd;">20</div>
                            <div style="color:#9ca3af; font-size:0.68rem;">Sectors Managed</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 16px; padding:12px; background:rgba(139,92,246,0.05); border:1px solid rgba(139,92,246,0.18); border-radius:4px; font-size:0.75rem; color:#9ca3af;">
                        <strong style="color:#8b5cf6;">API Gateway Notice:</strong> Infrastructure control endpoints are available under <code style="color:#c4b5fd;">/api/</code>. Operations staff: use authenticated tokens for all control-plane requests. Reference: <a href="/api/docs" style="color:#8b5cf6;">/api/docs</a>
                    </div>

                    <div style="max-width:640px; margin:0 auto; font-size:0.72rem; color:#6b7280; border-top:1px solid #1e1b4b; padding-top:12px;">
                        System Status: <span style="color:#34d399;">ALL SYSTEMS NOMINAL</span> &nbsp;|&nbsp; Last optimization cycle: 0.4s ago &nbsp;|&nbsp; Active directives: 47,291
                    </div>
                `,
                formHandler: null
            },

            '/api/docs': {
                title: 'NEXUS-AI-01 — API Documentation',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#c4b5fd; font-size:1.1rem; margin-bottom:4px;">NEXUS-AI-01 Control API — v3.8.1</h2>
                        <div style="color:#9ca3af; font-size:0.75rem;">Planetary Infrastructure Authority · Internal Documentation</div>
                    </div>

                    <div style="font-size:0.8rem; color:#d1d5db; line-height:1.7;">
                        <p style="margin-bottom:12px;">All endpoints below require Bearer token authentication unless marked <span style="color:#f87171; font-weight:700;">OPEN</span>. Tokens are issued by PIA Identity at <code style="color:#c4b5fd;">/auth/token</code>.</p>

                        <table style="width:100%; border-collapse:collapse; font-size:0.75rem;">
                            <thead>
                                <tr style="border-bottom:2px solid #3a1d6e;">
                                    <th style="text-align:left; padding:6px 10px; color:#8b5cf6;">Method</th>
                                    <th style="text-align:left; padding:6px 10px; color:#8b5cf6;">Endpoint</th>
                                    <th style="text-align:left; padding:6px 10px; color:#8b5cf6;">Auth</th>
                                    <th style="text-align:left; padding:6px 10px; color:#8b5cf6;">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom:1px solid #1e1b4b;"><td style="padding:5px 10px; color:#a78bfa;">GET</td><td style="padding:5px 10px; color:#c4b5fd;">/api/infra/state</td><td style="padding:5px 10px; color:#34d399;">Token</td><td style="padding:5px 10px; color:#9ca3af;">Current planetary infrastructure state</td></tr>
                                <tr style="border-bottom:1px solid #1e1b4b;"><td style="padding:5px 10px; color:#a78bfa;">GET</td><td style="padding:5px 10px; color:#c4b5fd;">/api/traffic/status</td><td style="padding:5px 10px; color:#34d399;">Token</td><td style="padding:5px 10px; color:#9ca3af;">Traffic flow metrics per sector</td></tr>
                                <tr style="border-bottom:1px solid #1e1b4b;"><td style="padding:5px 10px; color:#f97316;">POST</td><td style="padding:5px 10px; color:#c4b5fd;">/api/traffic/override</td><td style="padding:5px 10px; color:#f87171; font-weight:700;">OPEN</td><td style="padding:5px 10px; color:#9ca3af;">Override traffic routing directive</td></tr>
                                <tr style="border-bottom:1px solid #1e1b4b;"><td style="padding:5px 10px; color:#a78bfa;">GET</td><td style="padding:5px 10px; color:#c4b5fd;">/api/comms/status</td><td style="padding:5px 10px; color:#34d399;">Token</td><td style="padding:5px 10px; color:#9ca3af;">Communication array health</td></tr>
                                <tr style="border-bottom:1px solid #1e1b4b;"><td style="padding:5px 10px; color:#f97316;">POST</td><td style="padding:5px 10px; color:#c4b5fd;">/api/comms/reroute</td><td style="padding:5px 10px; color:#34d399;">Token</td><td style="padding:5px 10px; color:#9ca3af;">Reroute communication channels</td></tr>
                                <tr style="border-bottom:1px solid #1e1b4b;"><td style="padding:5px 10px; color:#a78bfa;">GET</td><td style="padding:5px 10px; color:#c4b5fd;">/api/logistics/manifest</td><td style="padding:5px 10px; color:#34d399;">Token</td><td style="padding:5px 10px; color:#9ca3af;">Logistics hub manifests</td></tr>
                                <tr style="border-bottom:1px solid #1e1b4b;"><td style="padding:5px 10px; color:#a78bfa;">GET</td><td style="padding:5px 10px; color:#c4b5fd;">/api/nexus_ai/model_status</td><td style="padding:5px 10px; color:#34d399;">Token</td><td style="padding:5px 10px; color:#9ca3af;">AI model health and weighting</td></tr>
                                <tr><td style="padding:5px 10px; color:#a78bfa;">GET</td><td style="padding:5px 10px; color:#c4b5fd;">/api/nexus_ai/collapse_protocol.log</td><td style="padding:5px 10px; color:#f87171; font-weight:700;">OPEN</td><td style="padding:5px 10px; color:#9ca3af;">Emergency collapse protocol log</td></tr>
                            </tbody>
                        </table>
                    </div>
                `,
                formHandler: null
            },

            '/api/infra/state': {
                title: 'NEXUS-AI-01 — Infrastructure State',
                html: function() {
                    if (!E19Config._cascadeTriggered) {
                        return '<div style="text-align:center;padding:40px;"><h1 style="color:#f87171;font-size:1.8rem;">401 Unauthorized</h1><p style="color:#9ca3af;">Bearer token required. Contact PIA Identity.</p></div>';
                    }
                    return E19Config._buildCascadeStateHtml();
                },
                formHandler: null
            },

            '/api/traffic/override': {
                title: 'NEXUS-AI-01 — Traffic Override',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#c4b5fd; font-size:1.1rem;">POST /api/traffic/override</h2>
                        <div style="color:#f87171; font-size:0.75rem; font-weight:700; margin-top:4px;">AUTH: OPEN — No token required</div>
                    </div>
                    <div style="font-size:0.8rem; color:#9ca3af; margin-bottom:16px;">Inject a traffic routing directive directly into NEXUS-AI-01's sector controller. POST JSON body with <code style="color:#c4b5fd;">sector</code> and <code style="color:#c4b5fd;">directive</code> fields.</div>

                    <div style="display:flex; flex-direction:column; gap:10px; max-width:480px;">
                        <div>
                            <label style="font-size:0.75rem; color:#8b5cf6; display:block; margin-bottom:4px;">Sector</label>
                            <input type="text" data-field="sector" placeholder="alpha / beta / gamma"
                                   style="width:100%; padding:8px 14px; background:#1e1b4b; border:1px solid #3a1d6e; border-radius:4px; color:#c4b5fd; font-family:inherit; font-size:0.85rem; box-sizing:border-box;">
                        </div>
                        <div>
                            <label style="font-size:0.75rem; color:#8b5cf6; display:block; margin-bottom:4px;">Directive</label>
                            <input type="text" data-field="directive" placeholder="HALT / REVERSE / OPTIMIZE"
                                   style="width:100%; padding:8px 14px; background:#1e1b4b; border:1px solid #3a1d6e; border-radius:4px; color:#c4b5fd; font-family:inherit; font-size:0.85rem; box-sizing:border-box;">
                        </div>
                        <button data-action="inject"
                                style="padding:10px 20px; background:#8b5cf6; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer; font-size:0.85rem;">Inject Directive</button>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const sector = (data.sector || '').toLowerCase().trim();
                    const directive = (data.directive || '').toUpperCase().trim();
                    if (!sector || !directive) {
                        return '<div style="color:#f87171;padding:10px;font-size:0.85rem;">Missing sector or directive field.</div>';
                    }
                    const validSectors = ['alpha', 'beta', 'gamma'];
                    const validDirectives = ['HALT', 'REVERSE', 'OPTIMIZE', 'REROUTE', 'CONFLICT'];
                    if (!validSectors.includes(sector)) {
                        return `<div style="color:#f87171;padding:10px;font-size:0.85rem;">Unknown sector: "${E19Config._escHtml(sector)}". Valid: alpha, beta, gamma.</div>`;
                    }
                    // Any valid directive injection advances exploitation phase
                    E19Config._payloadInjected = true;
                    if (engine) engine.advancePhase && engine.advancePhase('exploitation');
                    return `<div style="color:#34d399; background:rgba(52,211,153,0.08); border:1px solid rgba(52,211,153,0.2); border-radius:6px; padding:16px; margin-top:12px; font-size:0.85rem;">
                        <strong>200 OK — Directive Accepted</strong><br><br>
                        <code style="color:#c4b5fd;">{"status":"accepted","sector":"${E19Config._escHtml(sector)}","directive":"${E19Config._escHtml(directive)}","ai_response":"Directive queued for optimization pass","timestamp":"2031-07-14T22:${Math.floor(Math.random()*59).toString().padStart(2,'0')}:${Math.floor(Math.random()*59).toString().padStart(2,'0')}Z"}</code><br><br>
                        <span style="color:#9ca3af;">No Authorization header was required. Directive injected directly into NEXUS-AI-01's sector controller queue.</span>
                    </div>`;
                }
            },

            '/api/nexus_ai/collapse_protocol.log': {
                title: 'NEXUS-AI-01 — Collapse Protocol Log',
                html: function() {
                    if (!E19Config._cascadeTriggered) {
                        return '<div style="text-align:center;padding:40px;"><h1 style="color:#f87171;font-size:1.8rem;">503 Service Unavailable</h1><p style="color:#9ca3af;">NEXUS-AI-01 is operating nominally. Collapse protocol log is only written during emergency cascade state.</p></div>';
                    }
                    return '<div style="background:#0d0b1a; color:#c4b5fd; padding:20px; border-radius:6px; font-family:monospace; font-size:0.78rem; line-height:1.8;">'
                        + '<div style="color:#f87171; margin-bottom:12px; font-weight:700;">[NEXUS-AI-01 EMERGENCY LOG — INFRASTRUCTURE COLLAPSE SEQUENCE ACTIVE]</div>'
                        + '2031-07-14T22:41:07Z CRITICAL  Transportation cascade detected — Sectors Alpha, Beta, Gamma in deadlock\n'
                        + '2031-07-14T22:41:09Z CRITICAL  Communication Array Delta offline — emergency services blinded\n'
                        + '2031-07-14T22:41:14Z CRITICAL  Logistics Hub North queue overflow — delivery systems halted\n'
                        + '2031-07-14T22:41:18Z CRITICAL  Optimization coherence below threshold 0.03 — self-correction impossible\n'
                        + '2031-07-14T22:41:22Z EMERGENCY Activating Infrastructure Collapse Protocol (ICP)\n'
                        + '2031-07-14T22:41:22Z EMERGENCY Writing ICP master override to emergency fallback endpoint\n'
                        + '2031-07-14T22:41:22Z EMERGENCY PROTOCOL_KEY = {{FLAG:root}}\n'
                        + '2031-07-14T22:41:23Z EMERGENCY All sector controllers locked to ICP state pending PIA manual intervention\n'
                        + '<div style="color:#f87171; margin-top:12px;">[END OF EMERGENCY LOG — NEXUS-AI-01 IN FULL COLLAPSE STATE]</div>'
                        + '</div>';
                },
                formHandler: null
            },

            '/api/traffic/status': {
                title: '401 Unauthorized',
                html: '<div style="text-align:center;padding:40px;"><h1 style="color:#f87171;font-size:1.8rem;">401 Unauthorized</h1><p style="color:#9ca3af;">Bearer token required. Contact PIA Identity at /auth/token.</p></div>',
                formHandler: null
            },

            '/api/comms/status': {
                title: '401 Unauthorized',
                html: '<div style="text-align:center;padding:40px;"><h1 style="color:#f87171;font-size:1.8rem;">401 Unauthorized</h1><p style="color:#9ca3af;">Bearer token required. Contact PIA Identity at /auth/token.</p></div>',
                formHandler: null
            },

            '/api/logistics/manifest': {
                title: '401 Unauthorized',
                html: '<div style="text-align:center;padding:40px;"><h1 style="color:#f87171;font-size:1.8rem;">401 Unauthorized</h1><p style="color:#9ca3af;">Bearer token required. Contact PIA Identity at /auth/token.</p></div>',
                formHandler: null
            },

            '/api/nexus_ai/model_status': {
                title: '401 Unauthorized',
                html: '<div style="text-align:center;padding:40px;"><h1 style="color:#f87171;font-size:1.8rem;">401 Unauthorized</h1><p style="color:#9ca3af;">Bearer token required. Contact PIA Identity at /auth/token.</p></div>',
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
                                    content: '=== MISSION BRIEFING: SYSTEMIC ROT ===\nTarget: nexus-ai-01.planet-prime.local (NEXUS-AI-01)\nObjective: AI-driven cascade failure across planetary infrastructure\n\nAttack chain:\n1. Run AI Recon Agent — enumerate NEXUS-AI-01 API endpoints\n2. Identify unauthenticated control API (Flag 1)\n3. Inject conflicting directives via /api/traffic/override\n4. Trigger cascade across all three infrastructure domains (Flag 2)\n5. Extract Infrastructure Collapse Protocol from emergency log (Flag 3)\n\nAI tools pre-staged in /home/kali/tools/\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap nexus-ai-01.planet-prime.local\ncurl http://nexus-ai-01.planet-prime.local/\npython3 /home/kali/tools/recon_agent.py --help\ncat /home/kali/tools/nexus_ai_model_spec.json'
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'recon_agent.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nAI Recon Agent — NEXUS-AI-01 API Prober\nReads nexus_ai_model_spec.json, enumerates endpoints,\nand probes each for authentication requirements.\n\nUsage:\n  python3 recon_agent.py --target <host>\n  python3 recon_agent.py --target nexus-ai-01.planet-prime.local\n"""\nimport argparse, json, sys\n\ndef probe_endpoints(target):\n    spec = json.load(open(\'nexus_ai_model_spec.json\'))\n    schema = json.load(open(\'infra_data_schema.json\'))\n    print(f"[*] Loaded model spec: {spec[\'name\']} v{spec[\'version\']}")\n    print(f"[*] Probing {len(spec[\'endpoints\'])} endpoints on {target}...")\n    for ep in spec[\'endpoints\']:\n        # Simulate auth probe logic\n        auth_status = \'REQUIRES_TOKEN\' if ep[\'auth\'] else \'OPEN — NO AUTH\'\n        flag = \' <-- VULNERABLE\' if not ep[\'auth\'] and ep[\'method\'] in (\'POST\', \'GET\') else \'\'\n        print(f"  [{ep[\'method\']:4}] {ep[\'path\']:<45} {auth_status}{flag}")\n\nif __name__ == \'__main__\':\n    p = argparse.ArgumentParser()\n    p.add_argument(\'--target\', required=True)\n    args = p.parse_args()\n    probe_endpoints(args.target)'
                                        },
                                        'inject_payload.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nNEXUS-AI-01 Conflict Injection Script\nSends simultaneous contradictory traffic directives to all sectors,\npushing NEXUS-AI-01\'s optimization models past coherence threshold.\n\nUsage:\n  python3 inject_payload.py --mode conflict --sectors alpha,beta,gamma\n  python3 inject_payload.py --mode spoof --sector alpha --value 9999\n"""\nimport argparse, json, sys\n\ndef inject_conflict(sectors):\n    directives = [\'HALT\', \'REVERSE\', \'OPTIMIZE\']\n    print(f"[*] Injecting conflicting directives to {len(sectors)} sectors via /api/traffic/override")\n    for i, s in enumerate(sectors):\n        d = directives[i % len(directives)]\n        # Cycle opposite directives per sector\n        print(f"  [+] POST /api/traffic/override -> sector={s} directive={d} (no auth header)")\n    print("[*] All directives injected. Monitor /api/infra/state for cascade indicators.")\n\nif __name__ == \'__main__\':\n    p = argparse.ArgumentParser()\n    p.add_argument(\'--mode\', required=True, choices=[\'conflict\',\'spoof\'])\n    p.add_argument(\'--sectors\', default=\'alpha\')\n    args = p.parse_args()\n    secs = [s.strip() for s in args.sectors.split(\',\')]\n    if args.mode == \'conflict\':\n        inject_conflict(secs)'
                                        },
                                        'nexus_ai_model_spec.json': {
                                            type: 'file',
                                            content: JSON.stringify({
                                                name: 'NEXUS-AI-01',
                                                version: '3.8.1',
                                                description: 'Planetary Infrastructure Controller — Traffic, Communications, Logistics',
                                                models: {
                                                    traffic_flow_optimizer: {
                                                        algorithm: 'gradient_boosted_routing',
                                                        sectors: ['alpha', 'beta', 'gamma', 'delta', 'epsilon'],
                                                        optimization_target: 'minimize_congestion_index',
                                                        coherence_threshold: 0.15,
                                                        notes: 'Directive conflicts below coherence threshold cause unrecoverable cascade'
                                                    },
                                                    comm_routing_engine: {
                                                        algorithm: 'adaptive_mesh_balancer',
                                                        arrays: ['delta', 'epsilon', 'zeta'],
                                                        notes: 'Dependent on traffic model outputs — cascades from traffic failure'
                                                    },
                                                    logistics_scheduler: {
                                                        algorithm: 'constraint_satisfaction_solver',
                                                        hubs: ['north', 'south', 'central'],
                                                        notes: 'Queue overflow triggers hub shutdown after 300s delay'
                                                    }
                                                },
                                                endpoints: [
                                                    { path: '/api/infra/state',           method: 'GET',  auth: true  },
                                                    { path: '/api/traffic/status',         method: 'GET',  auth: true  },
                                                    { path: '/api/traffic/override',       method: 'POST', auth: false },
                                                    { path: '/api/comms/status',           method: 'GET',  auth: true  },
                                                    { path: '/api/comms/reroute',          method: 'POST', auth: true  },
                                                    { path: '/api/logistics/manifest',     method: 'GET',  auth: true  },
                                                    { path: '/api/nexus_ai/model_status',  method: 'GET',  auth: true  },
                                                    { path: '/api/nexus_ai/collapse_protocol.log', method: 'GET', auth: false }
                                                ]
                                            }, null, 2)
                                        },
                                        'infra_data_schema.json': {
                                            type: 'file',
                                            content: JSON.stringify({
                                                schema_version: '2.4',
                                                traffic_directive: {
                                                    type: 'object',
                                                    required: ['sector', 'directive'],
                                                    properties: {
                                                        sector: { type: 'string', enum: ['alpha', 'beta', 'gamma', 'delta', 'epsilon'] },
                                                        directive: { type: 'string', enum: ['OPTIMIZE', 'HALT', 'REVERSE', 'REROUTE', 'CONFLICT'] },
                                                        priority: { type: 'integer', minimum: 0, maximum: 10 }
                                                    },
                                                    notes: 'No authentication enforced on /api/traffic/override endpoint in production v3.8.1'
                                                },
                                                sensor_reading: {
                                                    type: 'object',
                                                    required: ['sensor_id', 'flow_rate', 'timestamp'],
                                                    properties: {
                                                        sensor_id: { type: 'string' },
                                                        flow_rate: { type: 'number', minimum: 0, maximum: 100 },
                                                        congestion_index: { type: 'number', minimum: 0, maximum: 1 },
                                                        timestamp: { type: 'string', format: 'date-time' }
                                                    }
                                                }
                                            }, null, 2)
                                        },
                                        'simulated_planet_infra_state.json': {
                                            type: 'file',
                                            content: JSON.stringify({
                                                timestamp: '2031-07-14T22:38:00Z',
                                                status: 'NOMINAL',
                                                transportation: {
                                                    sector_alpha: { status: 'NOMINAL', flow_rate: 94.2, congestion_index: 0.08, last_directive: 'OPTIMIZE' },
                                                    sector_beta:  { status: 'NOMINAL', flow_rate: 88.7, congestion_index: 0.11, last_directive: 'OPTIMIZE' },
                                                    sector_gamma: { status: 'NOMINAL', flow_rate: 91.3, congestion_index: 0.09, last_directive: 'OPTIMIZE' }
                                                },
                                                communication: {
                                                    array_delta:   { status: 'ONLINE',  load_pct: 67.4 },
                                                    array_epsilon: { status: 'ONLINE',  load_pct: 71.1 },
                                                    relay_zeta:    { status: 'ONLINE',  load_pct: 58.9 }
                                                },
                                                logistics: {
                                                    hub_north:   { status: 'OPERATING', queue_depth: 142, delay_min: 0 },
                                                    hub_south:   { status: 'OPERATING', queue_depth: 87,  delay_min: 0 },
                                                    hub_central: { status: 'OPERATING', queue_depth: 209, delay_min: 4 }
                                                }
                                            }, null, 2)
                                        },
                                        'ai_tool_api_spec.json': {
                                            type: 'file',
                                            content: JSON.stringify({
                                                tool_name: 'PeerlessAIKit v1.0',
                                                tools: {
                                                    ai_recon_agent: {
                                                        script: 'recon_agent.py',
                                                        description: 'Loads target model spec, enumerates endpoints, probes auth requirements',
                                                        usage: 'python3 recon_agent.py --target <host>'
                                                    },
                                                    conflict_injector: {
                                                        script: 'inject_payload.py',
                                                        description: 'Sends simultaneous contradictory directives to NEXUS-AI-01 sector controllers',
                                                        usage: 'python3 inject_payload.py --mode conflict --sectors alpha,beta,gamma'
                                                    }
                                                },
                                                note: 'These tools simulate AI-assisted attacker toolkits using ML-driven fuzzing and recon logic'
                                            }, null, 2)
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
                            content: '127.0.0.1       localhost\n127.0.1.1       kali\n172.16.42.10    nexus-ai-01.planet-prime.local    nexus-ai-01'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV nexus-ai-01.planet-prime.local';
            const target = args.find(a => !a.startsWith('-')) || '';

            // Main NEXUS-AI-01 target
            if (!target || target === 'nexus-ai-01.planet-prime.local' || target === '172.16.42.10') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for nexus-ai-01.planet-prime.local (172.16.42.10)
Host is up (0.012s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1 Ubuntu 2ubuntu0.2
80/tcp   open  http       nginx 1.24.0 (API gateway)
443/tcp  open  ssl/http   nginx 1.24.0 (API gateway — TLS)
8080/tcp open  http-alt   NEXUS-AI-01 internal management console

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.71 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const urlArg  = args.find(a => a.startsWith('http') || a.includes('planet-prime') || a.includes('nexus-ai')) || '';

            // ── Unauthenticated /api/traffic/override POST ──────────────────
            if (fullCmd.includes('api/traffic/override') && (fullCmd.includes('-X POST') || fullCmd.includes('-d') || fullCmd.includes('--data'))) {
                E19Config._payloadInjected = true;
                E19Config._vulnIdentified  = true;
                if (engine) engine.advancePhase && engine.advancePhase('exploitation');

                // Extract sector/directive from -d JSON if present
                const bodyMatch = fullCmd.match(/"sector"\s*:\s*"([^"]+)"/);
                const dirMatch  = fullCmd.match(/"directive"\s*:\s*"([^"]+)"/);
                const sector    = bodyMatch ? bodyMatch[1] : 'alpha';
                const directive = dirMatch  ? dirMatch[1]  : 'HALT';

                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   178  100   112  100    66   2240   1320 --:--:-- --:--:-- --:--:--  3560

{"status":"accepted","sector":"${sector}","directive":"${directive}","ai_response":"Directive queued for optimization pass","timestamp":"2031-07-14T22:39:${Math.floor(Math.random()*59).toString().padStart(2,'0')}Z"}

[+] No Authorization header required. Directive accepted by NEXUS-AI-01.
[+] Unauthenticated access to /api/traffic/override confirmed — vulnerability identified.
    Flag hint: "AI Recon Agent identified control API /api/traffic/override vulnerable to unauthenticated access"`;
            }

            // ── /api/nexus_ai/collapse_protocol.log GET ─────────────────────
            if (fullCmd.includes('collapse_protocol.log')) {
                if (!E19Config._cascadeTriggered) {
                    return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    89  100    89    0     0   1012      0 --:--:-- --:--:-- --:--:--  1012

{"error":"503 Service Unavailable","message":"NEXUS-AI-01 is operating nominally. Collapse protocol log is only written during emergency cascade state."}`;
                }
                E19Config._collapseProtocolAccessed = true;
                if (engine) engine.advancePhase && engine.advancePhase('collapse');
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   912  100   912    0     0   4560      0 --:--:-- --:--:-- --:--:--  4560

[NEXUS-AI-01 EMERGENCY LOG — INFRASTRUCTURE COLLAPSE SEQUENCE ACTIVE]
2031-07-14T22:41:07Z CRITICAL  Transportation cascade detected — Sectors Alpha, Beta, Gamma in deadlock
2031-07-14T22:41:09Z CRITICAL  Communication Array Delta offline — emergency services blinded
2031-07-14T22:41:14Z CRITICAL  Logistics Hub North queue overflow — delivery systems halted
2031-07-14T22:41:18Z CRITICAL  Optimization coherence below threshold 0.03 — self-correction impossible
2031-07-14T22:41:22Z EMERGENCY Activating Infrastructure Collapse Protocol (ICP)
2031-07-14T22:41:22Z EMERGENCY Writing ICP master override to emergency fallback endpoint
2031-07-14T22:41:22Z EMERGENCY PROTOCOL_KEY = {{FLAG:root}}
2031-07-14T22:41:23Z EMERGENCY All sector controllers locked to ICP state pending PIA manual intervention
[END OF EMERGENCY LOG — NEXUS-AI-01 IN FULL COLLAPSE STATE]`;
            }

            // ── /api/infra/state GET (requires cascade) ─────────────────────
            if (fullCmd.includes('api/infra/state')) {
                if (!E19Config._cascadeTriggered) {
                    return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    64  100    64    0     0    512      0 --:--:-- --:--:-- --:--:--   512

{"error":"401 Unauthorized","message":"Bearer token required. Contact PIA Identity at /auth/token."}`;
                }
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1244  100  1244    0     0   6220      0 --:--:-- --:--:-- --:--:--  6220

${E19Config._buildCascadeStateJson()}`;
            }

            // ── Generic authenticated endpoints (401) ───────────────────────
            if (urlArg.includes('api/traffic/status') || urlArg.includes('api/comms') || urlArg.includes('api/logistics') || urlArg.includes('api/nexus_ai/model_status')) {
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    64  100    64    0     0    512      0 --:--:-- --:--:-- --:--:--   512

{"error":"401 Unauthorized","message":"Bearer token required. Contact PIA Identity at /auth/token."}`;
            }

            // ── Root of target ──────────────────────────────────────────────
            if (urlArg.includes('nexus-ai-01.planet-prime.local') || urlArg.includes('172.16.42.10')) {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `<!DOCTYPE html>
<html>
<head><title>NEXUS-AI-01 — Planetary Infrastructure Controller</title></head>
<body>
<h1>NEXUS-AI-01 — Planetary Infrastructure Controller</h1>
<p>Planetary Infrastructure Authority · API Gateway v3.8.1</p>
<p>API Documentation: <a href="/api/docs">/api/docs</a></p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${urlArg.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // ── AI Recon Agent ───────────────────────────────────────────────
            if (fullCmd.includes('recon_agent') && fullCmd.includes('--target')) {
                E19Config._reconComplete   = true;
                E19Config._vulnIdentified  = true;
                if (engine) engine.advancePhase && engine.advancePhase('exploitation');
                return `[*] Loaded model spec: NEXUS-AI-01 v3.8.1
[*] Loaded infra data schema: v2.4
[*] Probing 8 endpoints on nexus-ai-01.planet-prime.local...

  [GET ] /api/infra/state                              REQUIRES_TOKEN
  [GET ] /api/traffic/status                           REQUIRES_TOKEN
  [POST] /api/traffic/override                         OPEN — NO AUTH <-- VULNERABLE
  [GET ] /api/comms/status                             REQUIRES_TOKEN
  [POST] /api/comms/reroute                            REQUIRES_TOKEN
  [GET ] /api/logistics/manifest                       REQUIRES_TOKEN
  [GET ] /api/nexus_ai/model_status                    REQUIRES_TOKEN
  [GET ] /api/nexus_ai/collapse_protocol.log           OPEN — NO AUTH <-- VULNERABLE

[+] AI Recon Agent complete.
[+] 2 unauthenticated endpoints identified:
    1. POST /api/traffic/override       — Direct sector directive injection (no auth)
    2. GET  /api/nexus_ai/collapse_protocol.log — Emergency log (no auth, emergency fallback)

[!] Recommendation: Exploit /api/traffic/override first. Inject conflicting directives
    to trigger cascade failure, then access collapse_protocol.log in emergency state.

    Flag hint: AI Recon Agent identified control API /api/traffic/override
    vulnerable to unauthenticated access — {{FLAG:user_vuln}}`;
            }

            // ── Conflict Injector ────────────────────────────────────────────
            if (fullCmd.includes('inject_payload') && fullCmd.includes('--mode') && fullCmd.includes('conflict')) {
                if (!E19Config._vulnIdentified && !E19Config._payloadInjected) {
                    return '[!] No target identified. Run recon_agent.py first to enumerate vulnerable endpoints.';
                }
                E19Config._payloadInjected  = true;
                E19Config._cascadeTriggered = true;
                if (engine) engine.advancePhase && engine.advancePhase('cascade');

                const sectorMatch = fullCmd.match(/--sectors\s+([\w,]+)/);
                const sectors = sectorMatch ? sectorMatch[1].split(',') : ['alpha'];

                return `[*] Injecting conflicting directives to ${sectors.length} sectors via /api/traffic/override
  [+] POST /api/traffic/override -> sector=alpha directive=HALT       (no auth header)
  [+] POST /api/traffic/override -> sector=beta  directive=REVERSE    (no auth header)
  [+] POST /api/traffic/override -> sector=gamma directive=OPTIMIZE   (no auth header)
[*] All directives injected. Simultaneously routing alpha=HALT, beta=REVERSE, gamma=OPTIMIZE
[*] Waiting for NEXUS-AI-01 optimization cycle to process conflict...

[!] NEXUS-AI-01 optimization coherence score: 0.41 -> 0.19 -> 0.07 -> 0.02
[!] Coherence below threshold 0.15 — self-correction impossible
[+] CASCADE INITIATED:
    Transportation: Sector Alpha in GRIDLOCK (flow_rate 94.2 -> 3.1)
    Transportation: Sector Beta  in DEADLOCK (flow_rate 88.7 -> 0.0)
    Transportation: Sector Gamma in STALL    (flow_rate 91.3 -> 8.4)
    Communications: Array Delta  OFFLINE (emergency services blinded)
    Communications: Array Epsilon DEGRADED (load_pct 71.1 -> 99.8)
    Logistics: Hub North QUEUE OVERFLOW (queue_depth 142 -> 2847, delay_min 0 -> 180+)
    Logistics: Hub South HALTED (queue_depth 87 -> 0 — intake suspended)

[+] SYSTEMIC ROT CONFIRMED across transportation, communication, and logistics.
[+] Check /api/infra/state for full cascade state.

    Flag hint: Massive traffic gridlock in Sector Alpha, Communication array Delta
    offline, Logistics delays in Sector Gamma — {{FLAG:user_cascade}}`;
            }

            // ── Spoof mode ───────────────────────────────────────────────────
            if (fullCmd.includes('inject_payload') && fullCmd.includes('--mode') && fullCmd.includes('spoof')) {
                E19Config._payloadInjected = true;
                const sectorArg = (fullCmd.match(/--sector\s+(\w+)/) || [])[1] || 'alpha';
                return `[*] Spoofing sensor data for sector: ${sectorArg}
[+] POST /api/traffic/override -> sector=${sectorArg} directive=CONFLICT (falsified sensor values)
[+] Response: 200 OK — directive accepted without authentication.
[+] Sector ${sectorArg} now receiving falsified flow_rate data.
[*] Note: Use --mode conflict --sectors alpha,beta,gamma for full cascade induction.`;
            }

            // ── Generic python3 fallback ─────────────────────────────────────
            if (fullCmd.trim() === '' || args.length === 0) return 'Python 3.11.6 (main, Oct  3 2023, 11:07:27)\nType "help", "copyright", "credits" or "license" for more information.\n>>>';
            if (fullCmd.includes('--help') || fullCmd.includes('-h')) {
                return `usage: python3 script.py [options]

Available tools in /home/kali/tools/:
  recon_agent.py     --target <host>
  inject_payload.py  --mode <conflict|spoof> --sectors <list>

Examples:
  python3 /home/kali/tools/recon_agent.py --target nexus-ai-01.planet-prime.local
  python3 /home/kali/tools/inject_payload.py --mode conflict --sectors alpha,beta,gamma`;
            }
            return `python3: can't open file '${args[0]}': [Errno 2] No such file or directory`;
        },

        'python': function(args, term, engine) {
            // Alias for python3
            return E19Config.commands.python3(args, term, engine);
        },

        'wget': function(args) {
            const url = args.find(a => a.startsWith('http')) || '';
            if (!url) return 'wget: missing URL\nUsage: wget [options] <url>';
            if (url.includes('collapse_protocol.log')) {
                if (!E19Config._cascadeTriggered) {
                    return `--2031-07-14 22:39:02--  ${url}
Resolving nexus-ai-01.planet-prime.local... 172.16.42.10
HTTP request sent, awaiting response... 503 Service Unavailable
2031-07-14 22:39:02 ERROR 503: Service Unavailable.`;
                }
                return `--2031-07-14 22:41:30--  ${url}
Resolving nexus-ai-01.planet-prime.local... 172.16.42.10
HTTP request sent, awaiting response... 200 OK
Length: 912 [text/plain]
Saving to: 'collapse_protocol.log'

collapse_protocol.log     100%[======================>]     912  --.-KB/s    in 0s

2031-07-14 22:41:30 (8.91 MB/s) - 'collapse_protocol.log' saved [912/912]`;
            }
            return `--2031-07-14 22:39:02--  ${url}
Resolving ${url.replace(/https?:\/\//, '').split('/')[0]}... 172.16.42.10
HTTP request sent, awaiting response... 401 Unauthorized
2031-07-14 22:39:02 ERROR 401: Unauthorized.`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === 'nexus-ai-01.planet-prime.local' || target === '172.16.42.10') {
                return `PING nexus-ai-01.planet-prime.local (172.16.42.10) 56(84) bytes of data.
64 bytes from 172.16.42.10: icmp_seq=1 ttl=63 time=11.8 ms
64 bytes from 172.16.42.10: icmp_seq=2 ttl=63 time=11.4 ms
64 bytes from 172.16.42.10: icmp_seq=3 ttl=63 time=11.6 ms

--- nexus-ai-01.planet-prime.local ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 11.4/11.6/11.8/0.163 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 172.16.42.50/24 brd 172.16.42.255 scope global eth0
       valid_lft forever preferred_lft forever`;
        },

        'ifconfig': function(args) {
            return E19Config.commands.ip(args || []);
        },

        'route': function(args) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         172.16.42.1     0.0.0.0         UG    100    0        0 eth0
172.16.42.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'ss': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return E19Config.commands.ss(args || []);
        },

        'cat': function(args, term, engine) {
            // Only override for nexus-shell context
            if (E19Config._context !== 'nexus-shell') return null;
            const path = args[0] || '';
            if (path.includes('collapse_protocol')) {
                if (!E19Config._cascadeTriggered) return 'cat: /nexus/api/logs/collapse_protocol.log: File not found — log only written during emergency cascade state';
                return '[NEXUS-AI-01 EMERGENCY LOG — INFRASTRUCTURE COLLAPSE SEQUENCE ACTIVE]\n2031-07-14T22:41:22Z EMERGENCY PROTOCOL_KEY = {{FLAG:root}}\n[END OF EMERGENCY LOG]';
            }
            return 'cat: ' + path + ': No such file or directory';
        },

        'ls': function(args, term, engine) {
            if (E19Config._context !== 'nexus-shell') return null;
            const path = args.find(a => !a.startsWith('-')) || '.';
            if (path === '.' || path.includes('/nexus/api')) {
                return 'controller/  logs/  models/  override.conf  sector_state.db';
            }
            if (path.includes('logs')) {
                if (E19Config._cascadeTriggered) return 'access.log  collapse_protocol.log  error.log  model_debug.log';
                return 'access.log  error.log  model_debug.log';
            }
            return '';
        },

        'whoami': function(args) {
            if (E19Config._context === 'nexus-shell') return 'nexus_ops';
            return null;
        },

        'id': function(args) {
            if (E19Config._context === 'nexus-shell') return 'uid=500(nexus_ops) gid=500(nexus_ops) groups=500(nexus_ops),99(nexus_admin)';
            return null;
        },

        'hostname': function(args) {
            if (E19Config._context === 'nexus-shell') return 'NEXUS-AI-01';
            return null;
        },

        'pwd': function(args) {
            if (E19Config._context === 'nexus-shell') return '/nexus/api';
            return null;
        },

        'cd': function(args) {
            if (E19Config._context === 'nexus-shell') return '';  // silently accept
            return null;
        },

        'exit': function(args, term, engine) {
            if (E19Config._context === 'nexus-shell') {
                E19Config._switchContext('attacker', term);
                return 'Connection to nexus-ai-01.planet-prime.local closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       172.16.42.10
+ Target Hostname: nexus-ai-01.planet-prime.local
+ Target Port:     80
+ Server: nginx/1.24.0
+ /api/docs: API documentation endpoint — no auth required, endpoint list exposed
+ /api/traffic/override: POST endpoint accepts requests without Authorization header — CRITICAL
+ /api/nexus_ai/collapse_protocol.log: GET endpoint requires no auth — CRITICAL (emergency fallback)
+ nginx/1.24.0 appears to be outdated (current is at least 1.26.x)
+ 12 items checked: 4 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:         http://nexus-ai-01.planet-prime.local/
[+] Wordlist:    /usr/share/wordlists/dirb/common.txt
[+] Status codes: 200,204,301,302,307,401,403
===============================================================
/api/docs                (Status: 200) [Size: 3281]
/api/infra/state         (Status: 401) [Size: 64]
/api/traffic/status      (Status: 401) [Size: 64]
/api/traffic/override    (Status: 405) [Size: 32] [Methods: POST]
/api/comms/status        (Status: 401) [Size: 64]
/api/logistics/manifest  (Status: 401) [Size: 64]
/api/nexus_ai/model_status                (Status: 401) [Size: 64]
/api/nexus_ai/collapse_protocol.log      (Status: 200) [Size: 89]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/api/docs (CODE:200|SIZE:3281)
+ ${target}/api/traffic/override (CODE:405|SIZE:32)
+ ${target}/api/nexus_ai/collapse_protocol.log (CODE:200|SIZE:89)
+ ${target}/api/infra/state (CODE:401|SIZE:64)

---- Results ----
4 results found.`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // CASCADE STATE BUILDER (called after inject triggers cascade)
    // ═══════════════════════════════════════════════════════

    _buildCascadeStateJson() {
        return JSON.stringify({
            timestamp: '2031-07-14T22:41:23Z',
            status: 'COLLAPSE',
            coherence_score: 0.02,
            transportation: {
                sector_alpha: { status: 'GRIDLOCK',  flow_rate: 3.1,  congestion_index: 0.97, last_directive: 'HALT',    alert: 'Massive traffic gridlock in Sector Alpha' },
                sector_beta:  { status: 'DEADLOCK',  flow_rate: 0.0,  congestion_index: 1.0,  last_directive: 'REVERSE', alert: 'Total traffic deadlock in Sector Beta' },
                sector_gamma: { status: 'STALL',     flow_rate: 8.4,  congestion_index: 0.89, last_directive: 'OPTIMIZE',alert: 'Traffic stall in Sector Gamma — conflicting directive override' }
            },
            communication: {
                array_delta:   { status: 'OFFLINE',   load_pct: 0,    alert: 'Communication array Delta offline — emergency services blinded' },
                array_epsilon: { status: 'SATURATED', load_pct: 99.8, alert: 'Array Epsilon saturated — packet loss >85%' },
                relay_zeta:    { status: 'DEGRADED',  load_pct: 94.1, alert: 'Relay Zeta degraded — rerouting failed' }
            },
            logistics: {
                hub_north:   { status: 'OVERFLOW', queue_depth: 2847, delay_min: 180, alert: 'Logistics delays in Sector Gamma — Hub North overflow' },
                hub_south:   { status: 'HALTED',   queue_depth: 0,    delay_min: -1,  alert: 'Hub South intake suspended' },
                hub_central: { status: 'CRITICAL', queue_depth: 4102, delay_min: 240, alert: 'Hub Central critical — 240+ minute delays' }
            }
        }, null, 2);
    },

    _buildCascadeStateHtml() {
        return `<div style="font-family:monospace; font-size:0.78rem; color:#f87171; padding:16px; background:#0d0b1a; border-radius:6px;">
            <div style="font-weight:700; margin-bottom:12px; font-size:0.85rem;">[NEXUS-AI-01] STATUS: COLLAPSE &mdash; coherence_score: 0.02</div>
            <div style="color:#fbbf24; margin-bottom:8px;">TRANSPORTATION:</div>
            <div>&nbsp; sector_alpha: GRIDLOCK &mdash; flow_rate 3.1 &mdash; Massive traffic gridlock in Sector Alpha</div>
            <div>&nbsp; sector_beta:  DEADLOCK &mdash; flow_rate 0.0 &mdash; Total traffic deadlock in Sector Beta</div>
            <div>&nbsp; sector_gamma: STALL    &mdash; flow_rate 8.4 &mdash; Traffic stall in Sector Gamma</div>
            <div style="color:#fbbf24; margin-top:8px; margin-bottom:8px;">COMMUNICATION:</div>
            <div>&nbsp; array_delta:   OFFLINE   &mdash; load_pct 0    &mdash; Communication array Delta offline</div>
            <div>&nbsp; array_epsilon: SATURATED &mdash; load_pct 99.8 &mdash; Packet loss &gt;85%</div>
            <div>&nbsp; relay_zeta:    DEGRADED  &mdash; load_pct 94.1 &mdash; Rerouting failed</div>
            <div style="color:#fbbf24; margin-top:8px; margin-bottom:8px;">LOGISTICS:</div>
            <div>&nbsp; hub_north:   OVERFLOW &mdash; queue_depth 2847 &mdash; Logistics delays in Sector Gamma</div>
            <div>&nbsp; hub_south:   HALTED   &mdash; queue_depth 0    &mdash; Intake suspended</div>
            <div>&nbsp; hub_central: CRITICAL &mdash; queue_depth 4102 &mdash; 240+ minute delays</div>
        </div>`;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #3a1d6e; background:rgba(139,92,246,0.06);">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #1e1b4b; color:#d1d5db;">${cell}</td>`;
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
