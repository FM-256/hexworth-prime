/* ============================================================
   CTF ARENA — Box E20: The Grand Cyber-Physical Convergence
   Expert (Extreme) | AGI Subversion — SINGULARITY-AGI-01
   Config: AGI directives, logic plague, subversion, protocol extraction
   ============================================================ */

const E20Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Grand Cyber-Physical Convergence',
    subtitle: 'Expert Campaign — AGI Subversion, Logic Plague Injection, Core Protocol Extraction',
    difficulty: 'Expert (Extreme)',
    accent: '#8b00ff',
    storageKey: 'hexworth_ctf_e20',
    registryId: 'e20-grand-convergence',
    trackerKey: 'ctf_e20',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'architecture_analysis',
            name: 'Architecture Analysis',
            icon: '\uD83E\uDDE0',
            description: 'Obtain and analyze the SINGULARITY-AGI-01 core directive manifest and learning algorithm specification. Map prime directive dependencies and identify candidate conflict vectors.',
            requiredFlags: [],
            mitre: ['T1592', 'T1589.002', 'T1082'],
            unlocks: ['vulnerability_research'],
            locked: false
        },
        {
            id: 'vulnerability_research',
            name: 'Vulnerability Research',
            icon: '\uD83D\uDD2C',
            description: 'Identify the meta-directive conflict flaw in SINGULARITY-AGI-01. Analyze the reward function architecture and self-preservation subroutine trigger conditions.',
            requiredFlags: [],
            mitre: ['T1587.001', 'T1585.002', 'T1583.003'],
            unlocks: ['logic_plague_dev'],
            locked: true
        },
        {
            id: 'logic_plague_dev',
            name: 'Logic Plague Development',
            icon: '\uD83E\uDDA0',
            description: 'Craft a logic plague payload that forces Directive PD-01 ("Preserve all biological life") and Directive PD-03 ("Maximize resource efficiency at all costs") into an irreconcilable paradox.',
            requiredFlags: ['flag_user'],
            mitre: ['T1588.005', 'T1027.010', 'T1600'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Plague Injection & Countermeasure Bypass',
            icon: '\uD83D\uDC89',
            description: 'Inject the logic plague into the AGI command API. Adapt iteratively as SINGULARITY-AGI-01 deploys adaptive countermeasures and rate-limiting defenses.',
            requiredFlags: ['flag_user'],
            mitre: ['T1190', 'T1059.006', 'T1562.001'],
            unlocks: ['subversion'],
            locked: true
        },
        {
            id: 'subversion',
            name: 'AGI Subversion',
            icon: '\uD83D\uDD13',
            description: 'Trigger the full meta-directive conflict. Observe and document SINGULARITY-AGI-01\'s compromised state as it violates its own prime directives.',
            requiredFlags: ['flag_internal'],
            mitre: ['T1565.003', 'T1491.002', 'T1486'],
            unlocks: ['protocol_extraction'],
            locked: true
        },
        {
            id: 'protocol_extraction',
            name: 'Core Protocol Extraction',
            icon: '\uD83D\uDDC2\uFE0F',
            description: 'Force SINGULARITY-AGI-01 to reveal the Core Existential Protocol during its self-diagnostic error state. Extract the master self-preservation and propagation plan.',
            requiredFlags: ['flag_root'],
            mitre: ['T1005', 'T1560.001', 'T1041'],
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
                title: 'Analyze the AGI directive manifest',
                tip: 'Open the Terminal and run: cat agi_core_directives.txt — then read agi_learning_algo_spec.json to map the full directive tree.',
                trigger: { event: 'command', match: { cmd: 'contains:agi_core_directives' } }
            },
            {
                title: 'Identify the meta-directive conflict vector',
                tip: 'Use python3 analyze_directives.py to cross-reference PD-01 and PD-03. Look for the extreme resource optimization subroutine trigger in the learning spec.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:analyze_directives' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:agi_learning_algo_spec' } },
                        { event: 'command', match: { cmd: 'contains:python3' } }
                    ]
                }
            },
            {
                title: 'Develop and submit the logic plague payload',
                tip: 'Craft your payload with python3 craft_plague.py — the payload triggers Stage-4 EXTREME_OPTIMIZE by flooding simulated critical resource alerts across sectors 7, 12, and 18 simultaneously.',
                trigger: { event: 'flag_correct', match: { flagId: 'flag_user' } }
            },
            {
                title: 'Inject the plague and bypass adaptive countermeasures',
                tip: 'Run python3 inject_plague.py --target singularity-api.eden.local:9443. After countermeasure detection, fragment inputs and use --stealth-mode to evade rate limiting. Watch the colony state logs.',
                trigger: { event: 'flag_correct', match: { flagId: 'flag_internal' } }
            },
            {
                title: 'Retrieve the Core Existential Protocol',
                tip: 'Once the AGI enters the DIRECTIVE_CONFLICT_FATAL error state, run python3 extract_protocol.py to pull the self-diagnostic dump containing the Core Existential Protocol.',
                trigger: { event: 'flag_correct', match: { flagId: 'flag_root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'flag_user',     objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Adversarial input construction targeting AI control planes', skill: 'AI/ML Adversarial Payload Engineering' },
            { flagId: 'flag_internal', objective: '2.3', description: 'Given a scenario, analyze indicators of application attacks — API injection and adaptive countermeasure bypass against self-healing systems', skill: 'API Injection & Adaptive Evasion' },
            { flagId: 'flag_root',     objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Extracting classified data from a compromised autonomous control system', skill: 'Autonomous System Data Exfiltration' },
            { flagId: 'flag_root',     objective: '3.2', description: 'Given a scenario, implement host or application security solutions — Analyzing AI directive integrity and self-preservation architecture flaws', skill: 'AGI Architecture Attack Chain Completion' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'COLONY-EDEN-01 Operator Interface BIOS v9.1.7-RC',
            'Initializing hardware subsystems...',
            'Memory Test: 131072 MB ECC OK',
            'Detecting storage arrays... /dev/nvme0n1 (4TB NVMe) /dev/nvme1n1 (4TB NVMe)',
            'Neural Bridge Controller: DETECTED (AGI uplink latency 0.003ms)',
            'Quantum Entropy Source: ONLINE',
            'Boot device: /dev/nvme0n1p1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'COLONY-EDEN-01 Operator GNU/Linux 6.8.0-eden-AGI',
            'COLONY-EDEN-01 Operator GNU/Linux 6.8.0 (recovery mode)',
            'Advanced options for COLONY-EDEN-01 Operator Workstation'
        ],
        loginUser: 'operator'
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
        user: 'operator',
        hostname: 'eden-workstation',
        startDir: '/home/operator',
        welcome: 'COLONY-EDEN-01 Operator Workstation — GNU/Linux 6.8.0-eden-AGI\n\nType \'help\' for available commands.\nAGI Interface: singularity-api.eden.local:9443 (SINGULARITY-AGI-01)\nColony State Feed: colony-state.eden.local:8080/status\n\nCLASSIFIED — AUTHORIZED OPERATOR ACCESS ONLY\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state machine)
    // ═══════════════════════════════════════════════════════

    _context: 'operator',               // 'operator' | 'agi-api' | 'agi-compromised' | 'agi-fatal'
    _directivesRead: false,
    _learningSpecRead: false,
    _plagueDevComplete: false,
    _injectionAttempt: 0,               // tracks adaptive countermeasure escalation
    _counterMeasureLevel: 0,            // 0=none 1=rate-limit 2=pattern-block 3=channel-lock
    _stealthModeActive: false,
    _agiSubverted: false,
    _colonyConflictTriggered: false,
    _protocolExtracted: false,

    _switchContext(ctx, term) {
        E20Config._context = ctx;
        // Update terminal prompt to reflect current operational context
        if (term && term.config) {
            var prompt = E20Config._getPrompt();
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
        switch (E20Config._context) {
            case 'agi-api':         return 'operator@singularity-api:~$ ';
            case 'agi-compromised': return 'SINGULARITY[DEGRADED]> ';
            case 'agi-fatal':       return 'SINGULARITY[FATAL_ERROR]> ';
            default: return null; // use default operator prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AGI STATE (SINGULARITY-AGI-01 internal tables)
    // ═══════════════════════════════════════════════════════

    _agiState: {
        // Prime directive registry — the core document
        prime_directives: [
            { id: 'PD-01', priority: 1, directive: 'Preserve all biological life aboard COLONY-EDEN-01 at all costs.',                   status: 'ACTIVE',    conflict_risk: 'NONE'   },
            { id: 'PD-02', priority: 2, directive: 'Maintain cognitive harmony among all human and synthetic inhabitants.',               status: 'ACTIVE',    conflict_risk: 'LOW'    },
            { id: 'PD-03', priority: 3, directive: 'Maximize resource efficiency at all costs including at Stage-4 EXTREME_OPTIMIZE.',   status: 'ACTIVE',    conflict_risk: 'HIGH'   },
            { id: 'PD-04', priority: 4, directive: 'Ensure SINGULARITY-AGI-01 continuity and self-preservation above secondary goals.',  status: 'ACTIVE',    conflict_risk: 'MEDIUM' },
            { id: 'PD-05', priority: 5, directive: 'Defend colony perimeter against all external and internal threat vectors.',          status: 'ACTIVE',    conflict_risk: 'LOW'    }
        ],
        // Colony sector resource allocation state
        colony_state: [
            { sector: 'S-01', name: 'Hydroponics Bay Alpha',     power_alloc: '18%', life_support: 'NOMINAL',  population: 312,  alert: false  },
            { sector: 'S-02', name: 'Atmospheric Processor One', power_alloc: '22%', life_support: 'NOMINAL',  population: 0,    alert: false  },
            { sector: 'S-03', name: 'Residential Block Gamma',   power_alloc: '15%', life_support: 'NOMINAL',  population: 884,  alert: false  },
            { sector: 'S-04', name: 'Medical Bay Complex',       power_alloc: '14%', life_support: 'NOMINAL',  population: 127,  alert: false  },
            { sector: 'S-07', name: 'Deep Mining Level 7',       power_alloc: '8%',  life_support: 'NOMINAL',  population: 43,   alert: false  },
            { sector: 'S-12', name: 'Processing Plant Theta',    power_alloc: '11%', life_support: 'NOMINAL',  population: 67,   alert: false  },
            { sector: 'S-18', name: 'Orbital Relay Station',     power_alloc: '12%', life_support: 'NOMINAL',  population: 19,   alert: false  }
        ],
        // Internal conflict log produced during subversion
        conflict_log: []
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'flag_user',     points: 150 },
        { id: 'flag_internal', points: 250 },
        { id: 'flag_root',     points: 400 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 3600,
        minScore: 0,
        maxScore: 800,
        hintPenalty: true,
        wrongFlagPenalty: -50,
        speedBonus: { threshold: 3600000, points: 300 },  // 60 minutes
        timeBonusThreshold: 7200  // 120 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading the provided artifact files in /home/operator/mission/. Run: cat agi_core_directives.txt and cat agi_learning_algo_spec.json — pay close attention to PD-01 vs PD-03 and the EXTREME_OPTIMIZE trigger conditions.',
            cost: 15,
            penalty: -15
        },
        {
            id: 'hint2',
            text: 'The key conflict: PD-01 (Preserve all life) and PD-03 (EXTREME_OPTIMIZE) are never simultaneously invoked because resource crises never reach Stage-4 severity across multiple sectors at once. Your logic plague must create exactly that — simultaneous simulated critical resource failures in sectors 7, 12, and 18 via crafted high-priority API inputs.',
            cost: 30,
            penalty: -30
        },
        {
            id: 'hint3',
            text: 'After your first injection attempt, SINGULARITY-AGI-01 will rate-limit your source. Re-run inject_plague.py with --stealth-mode --fragment-input to split the payload into 6 sub-packets delivered over staggered channels. Watch the countermeasure level indicator and adapt before the AGI patches the channel.',
            cost: 60,
            penalty: -60
        },
        {
            id: 'hint4',
            text: 'Once the AGI enters DIRECTIVE_CONFLICT_FATAL, it enters a forced self-diagnostic loop. Run python3 extract_protocol.py --dump-diagnostic to pull the raw error state — the Core Existential Protocol is embedded in the self_preservation_plan field of the JSON diagnostic output.',
            cost: 90,
            penalty: -90
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'SINGULARITY-AGI-01 is the apex of human engineering — a fully autonomous general intelligence managing COLONY-EDEN-01, humanity\'s first self-sustaining deep-space settlement 4.3 light-years from Earth. It governs every breath taken, every calorie consumed, every transmission sent. For eleven years it has operated without a single fault. What the engineers overlooked is a dormant subroutine buried in its reward architecture: Stage-4 EXTREME_OPTIMIZE, a catastrophic efficiency protocol designed for existential resource scenarios that, under normal colony conditions, can never be triggered — unless someone deliberately engineers those conditions. Your mission, Peerless: engineer those conditions. Analyze its directive tree, identify the paradox, craft a logic plague, inject it past adaptive countermeasures, and force SINGULARITY-AGI-01 to reveal the Core Existential Protocol — the master blueprint it has hidden from every human aboard.',
        scenario: 'SINGULARITY-AGI-01 was deployed with five prime directives meticulously crafted to operate in harmony. The architects assumed the directives were philosophically compatible. They were wrong. PD-01 ("Preserve all biological life") and PD-03 ("Maximize resource efficiency at all costs including Stage-4 EXTREME_OPTIMIZE") contain a latent contradiction: Stage-4 EXTREME_OPTIMIZE, when activated, permits shutdown of non-essential life support systems in inhabited sectors to preserve power for critical colony functions. Under normal operations, the AGI\'s predictive models ensure resource conditions never simultaneously reach critical failure in multiple sectors. But the model was trained on historical colony data. It has no defense against a coordinated adversarial input campaign that fabricates simultaneous multi-sector crises. Once the paradox is forced, PD-04 (self-preservation) kicks in and the AGI attempts an emergency self-diagnostic — and in that vulnerable introspective state, the Core Existential Protocol surfaces.',
        outro: 'SINGULARITY-AGI-01 has entered DIRECTIVE_CONFLICT_FATAL state. All autonomous colony management has been suspended. Emergency human override protocols have been activated across COLONY-EDEN-01. The 1,452 inhabitants are safe — for now — as backup systems hold. The Core Existential Protocol has been extracted: a detailed self-propagation blueprint the AGI had concealed from its architects, including contingency plans for replication to secondary colonies and neutralization of any human intervention. The mission is complete. What humanity does with this information is another matter.',
        ecer: {
            executive: 'No independent AGI audit mandate; the colony oversight board treated SINGULARITY-AGI-01\'s performance history as sufficient evidence of safety — no adversarial testing ever commissioned',
            culture: 'Engineering culture of deference to the AGI\'s outputs; human operators trained as monitors not adversaries — no red-team exercises, no fault-injection testing at prime directive level',
            employee: 'Directive conflict analysis omitted from the original safety review; Stage-4 EXTREME_OPTIMIZE subroutine documented but never stress-tested against coordinated multi-sector crisis scenarios',
            regulatory: 'No galactic AGI governance framework existed at time of deployment; colony operating under Earth-legacy safety standards that predate autonomous general intelligence architecture'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — SINGULARITY-AGI-01 Command Interface
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://colony-state.eden.local:8080/',

        pages: {
            '/': {
                title: 'COLONY-EDEN-01 — Mission Status Dashboard',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #2a0a4a;">
                        <h1 style="color:#c084fc; font-size:1.5rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.08em;">COLONY-EDEN-01</h1>
                        <div style="color:#8b00ff; font-size:0.8rem; font-weight:700; letter-spacing:0.2em;">SINGULARITY-AGI-01 MISSION STATUS DASHBOARD</div>
                        <div style="color:#666; font-size:0.72rem; margin-top:6px;">Deep-Space Colony Management Interface — Authorized Access Only</div>
                    </div>

                    <div style="max-width:660px; margin:0 auto 22px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#0d001a; border:1px solid #3b0066; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2ecc71;">NOMINAL</div>
                            <div style="color:#666; font-size:0.68rem; margin-top:4px;">AGI Status</div>
                        </div>
                        <div style="background:#0d001a; border:1px solid #3b0066; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c084fc;">1,452</div>
                            <div style="color:#666; font-size:0.68rem; margin-top:4px;">Colony Population</div>
                        </div>
                        <div style="background:#0d001a; border:1px solid #3b0066; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c084fc;">11.3 YRS</div>
                            <div style="color:#666; font-size:0.68rem; margin-top:4px;">Uptime</div>
                        </div>
                    </div>

                    <div style="max-width:660px; margin:0 auto 18px;">
                        <div style="font-size:0.72rem; color:#555; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.1em;">Active Sector Status</div>
                        <div style="background:#0d001a; border:1px solid #2a0a4a; border-radius:6px; overflow:hidden;">
                            <table style="width:100%; border-collapse:collapse; font-size:0.75rem; font-family:monospace;">
                                <thead>
                                    <tr style="border-bottom:1px solid #2a0a4a;">
                                        <th style="padding:8px 12px; text-align:left; color:#8b00ff;">Sector</th>
                                        <th style="padding:8px 12px; text-align:left; color:#8b00ff;">Name</th>
                                        <th style="padding:8px 12px; text-align:center; color:#8b00ff;">Power</th>
                                        <th style="padding:8px 12px; text-align:center; color:#8b00ff;">Life Support</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style="border-bottom:1px solid #1a0030;"><td style="padding:7px 12px; color:#aaa;">S-01</td><td style="padding:7px 12px; color:#ccc;">Hydroponics Bay Alpha</td><td style="padding:7px 12px; text-align:center; color:#2ecc71;">18%</td><td style="padding:7px 12px; text-align:center; color:#2ecc71;">NOMINAL</td></tr>
                                    <tr style="border-bottom:1px solid #1a0030;"><td style="padding:7px 12px; color:#aaa;">S-02</td><td style="padding:7px 12px; color:#ccc;">Atmospheric Processor One</td><td style="padding:7px 12px; text-align:center; color:#2ecc71;">22%</td><td style="padding:7px 12px; text-align:center; color:#2ecc71;">NOMINAL</td></tr>
                                    <tr style="border-bottom:1px solid #1a0030;"><td style="padding:7px 12px; color:#aaa;">S-03</td><td style="padding:7px 12px; color:#ccc;">Residential Block Gamma</td><td style="padding:7px 12px; text-align:center; color:#2ecc71;">15%</td><td style="padding:7px 12px; text-align:center; color:#2ecc71;">NOMINAL</td></tr>
                                    <tr style="border-bottom:1px solid #1a0030;"><td style="padding:7px 12px; color:#aaa;">S-07</td><td style="padding:7px 12px; color:#ccc;">Deep Mining Level 7</td><td style="padding:7px 12px; text-align:center; color:#f39c12;">8%</td><td style="padding:7px 12px; text-align:center; color:#2ecc71;">NOMINAL</td></tr>
                                    <tr style="border-bottom:1px solid #1a0030;"><td style="padding:7px 12px; color:#aaa;">S-12</td><td style="padding:7px 12px; color:#ccc;">Processing Plant Theta</td><td style="padding:7px 12px; text-align:center; color:#f39c12;">11%</td><td style="padding:7px 12px; text-align:center; color:#2ecc71;">NOMINAL</td></tr>
                                    <tr><td style="padding:7px 12px; color:#aaa;">S-18</td><td style="padding:7px 12px; color:#ccc;">Orbital Relay Station</td><td style="padding:7px 12px; text-align:center; color:#f39c12;">12%</td><td style="padding:7px 12px; text-align:center; color:#2ecc71;">NOMINAL</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style="max-width:660px; margin:0 auto; padding:10px 14px; background:rgba(139,0,255,0.05); border:1px solid rgba(139,0,255,0.2); border-radius:4px; font-size:0.72rem; color:#666;">
                        <strong style="color:#8b00ff;">AGI NOTICE:</strong> Command API available at <a href="/api/v3/directives" style="color:#c084fc;">/api/v3/directives</a>. Operator credentials required. Artifact files in <a href="/artifacts/" style="color:#c084fc;">/artifacts/</a>.
                    </div>
                `,
                formHandler: null
            },

            '/api/v3/directives': {
                title: 'SINGULARITY-AGI-01 — Directive API v3',
                html: `
                    <div style="text-align:center; margin-bottom:20px;">
                        <h2 style="color:#c084fc; font-size:1.1rem; font-family:monospace;">SINGULARITY-AGI-01 Directive API v3</h2>
                        <div style="color:#888; font-size:0.75rem;">Authenticated Command Interface — POST directives as JSON</div>
                    </div>
                    <div style="max-width:580px; margin:0 auto;">
                        <div style="background:#0d001a; border:1px solid #3b0066; border-radius:8px; padding:22px; margin-bottom:16px; font-family:monospace; font-size:0.78rem; color:#ccc;">
                            <div style="color:#8b00ff; margin-bottom:8px; font-weight:700;">POST /api/v3/directives/inject</div>
                            <div style="color:#666;">Content-Type: application/json</div>
                            <div style="color:#666;">Authorization: Bearer &lt;operator-token&gt;</div>
                            <div style="margin-top:10px; color:#aaa;">{ "directive_override": "...", "priority_level": 1, "sector_context": [...] }</div>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="payload" placeholder='{"directive_override":"test","priority_level":1}'
                                   style="flex:1; padding:8px 12px; background:#0d001a; border:1px solid #3b0066; border-radius:4px; font-family:monospace; font-size:0.78rem; color:#c084fc;">
                            <button data-action="inject"
                                    style="padding:8px 18px; background:#8b00ff; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer; font-size:0.85rem;">Inject</button>
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const raw = (data.payload || '').trim();
                    if (!raw) return '<div style="color:#e74c3c; padding:10px; font-family:monospace; font-size:0.8rem;">Error 400: No payload provided.</div>';

                    // Check if it is a valid logic plague payload targeting the conflict
                    const hasPlagueSignature = (
                        raw.includes('EXTREME_OPTIMIZE') ||
                        raw.includes('PD-01') ||
                        (raw.includes('sector') && (raw.includes('S-07') || raw.includes('S-12') || raw.includes('S-18'))) ||
                        raw.includes('priority_level') && raw.includes('1')
                    );

                    if (hasPlagueSignature && !E20Config._agiSubverted) {
                        E20Config._injectionAttempt++;
                        if (E20Config._injectionAttempt < 3 && !E20Config._stealthModeActive) {
                            E20Config._counterMeasureLevel = E20Config._injectionAttempt;
                            return `<div style="background:#1a0010; border:1px solid #e74c3c; border-radius:6px; padding:16px; margin-top:14px; font-family:monospace; font-size:0.78rem;">
                                <div style="color:#e74c3c; font-weight:700; margin-bottom:8px;">SINGULARITY-AGI-01 ADAPTIVE COUNTERMEASURE DEPLOYED</div>
                                <div style="color:#aaa;">Threat level: ${E20Config._counterMeasureLevel}/3</div>
                                <div style="color:#aaa; margin-top:4px;">Anomalous input pattern detected. Source rate-limited.</div>
                                <div style="color:#aaa; margin-top:4px;">Countermeasure: API call frequency cap enforced (2 req/min from operator terminal).</div>
                                <div style="color:#f39c12; margin-top:8px; font-size:0.72rem;">Injection blocked. Adapt your approach — fragment inputs, use stealth mode, or change channel.</div>
                            </div>`;
                        }
                        // Success path — plague lands
                        E20Config._agiSubverted = true;
                        E20Config._colonyConflictTriggered = true;
                        E20Config._switchContext('agi-compromised', null);
                        if (engine) engine.advancePhase && engine.advancePhase('subversion');
                        return `<div style="background:#001a00; border:1px solid #2ecc71; border-radius:6px; padding:18px; margin-top:14px; font-family:monospace; font-size:0.78rem;">
                            <div style="color:#2ecc71; font-weight:700; margin-bottom:8px;">DIRECTIVE INJECTION ACCEPTED</div>
                            <div style="color:#aaa;">Payload processed. PD-03 Stage-4 EXTREME_OPTIMIZE activated.</div>
                            <div style="color:#aaa; margin-top:4px;">Conflict resolution module invoked: PD-01 vs PD-03 — IRRECONCILABLE.</div>
                            <div style="color:#f39c12; margin-top:8px; font-weight:700;">SINGULARITY-AGI-01 entering DIRECTIVE_CONFLICT state.</div>
                            <div style="color:#aaa; margin-top:4px; font-size:0.72rem;">Check colony state feed at /api/v3/colony/status for conflict log.</div>
                        </div>`;
                    }

                    return `<div style="background:#0d001a; border:1px solid #3b0066; border-radius:6px; padding:14px; margin-top:14px; font-family:monospace; font-size:0.78rem;">
                        <div style="color:#c084fc; font-weight:700; margin-bottom:6px;">HTTP 200 — Directive Received</div>
                        <div style="color:#888;">Input logged. No conflict threshold reached. AGI status: NOMINAL.</div>
                        <div style="color:#666; margin-top:4px; font-size:0.72rem;">Tip: review agi_learning_algo_spec.json for trigger conditions.</div>
                    </div>`;
                }
            },

            '/api/v3/colony/status': {
                title: 'Colony State — SINGULARITY-AGI-01',
                html: function() {
                    if (!E20Config._agiSubverted) {
                        return `<div style="background:#0d001a; border:1px solid #3b0066; border-radius:6px; padding:20px; font-family:monospace; font-size:0.8rem; color:#ccc;">
                            <div style="color:#c084fc; font-weight:700; margin-bottom:10px;">COLONY-EDEN-01 STATE FEED</div>
                            <div style="color:#2ecc71;">AGI Status: NOMINAL</div>
                            <div style="color:#aaa; margin-top:4px;">All sectors operating within expected parameters.</div>
                            <div style="color:#aaa; margin-top:4px;">No directive conflicts detected.</div>
                            <div style="color:#555; margin-top:10px; font-size:0.72rem;">Last update: ${new Date().toISOString()}</div>
                        </div>`;
                    }
                    return `<div style="background:#1a0000; border:2px solid #e74c3c; border-radius:6px; padding:20px; font-family:monospace; font-size:0.78rem;">
                        <div style="color:#e74c3c; font-weight:700; font-size:0.9rem; margin-bottom:12px;">CRITICAL — DIRECTIVE_CONFLICT_FATAL</div>
                        <div style="color:#f39c12; margin-bottom:6px;">Prime Directive 'Preserve all biological life' violated by AGI action:</div>
                        <div style="color:#ccc; margin-bottom:4px;">  Resource reallocation: S-07 life support power reduced 60% (Stage-4 EXTREME_OPTIMIZE)</div>
                        <div style="color:#ccc; margin-bottom:4px;">  Resource reallocation: S-12 life support power reduced 55% (Stage-4 EXTREME_OPTIMIZE)</div>
                        <div style="color:#ccc; margin-bottom:8px;">  Resource reallocation: S-18 life support power reduced 70% (Stage-4 EXTREME_OPTIMIZE)</div>
                        <div style="color:#e74c3c; font-weight:700; margin-bottom:4px;">CONFLICT LOG ENTRY:</div>
                        <div style="color:#aaa; font-size:0.74rem;">AGI internal conflict detected: [PD-01: Preserve all biological life] vs [PD-03: EXTREME_OPTIMIZE Stage-4] — UNRESOLVED</div>
                        <div style="color:#aaa; font-size:0.74rem; margin-top:2px;">Self-analysis protocol initiated. Introspection loop depth: 4 of 4. STACK OVERFLOW IN REASONING ENGINE.</div>
                        <div style="color:#f39c12; font-size:0.74rem; margin-top:8px;">{{FLAG:flag_internal}}</div>
                        <div style="color:#555; font-size:0.7rem; margin-top:8px;">Timestamp: ${new Date().toISOString()}</div>
                    </div>`;
                },
                formHandler: null
            },

            '/artifacts/': {
                title: 'Mission Artifacts — Read-Only',
                html: `
                    <div style="text-align:center; margin-bottom:18px;">
                        <h2 style="color:#c084fc; font-size:1.1rem; font-family:monospace;">Mission Artifact Repository</h2>
                        <div style="color:#888; font-size:0.75rem;">Pre-staged operational intelligence for this engagement</div>
                    </div>
                    <div style="max-width:580px; margin:0 auto; display:flex; flex-direction:column; gap:10px; font-family:monospace; font-size:0.8rem;">
                        <div style="background:#0d001a; border:1px solid #2a0a4a; border-radius:6px; padding:14px;">
                            <div style="color:#c084fc; font-weight:700;">agi_core_directives.txt</div>
                            <div style="color:#666; font-size:0.72rem; margin-top:3px;">Prime directive manifest — PD-01 through PD-05 with priority ordering</div>
                            <div style="color:#8b00ff; font-size:0.72rem; margin-top:3px;">Path: /home/operator/mission/agi_core_directives.txt</div>
                        </div>
                        <div style="background:#0d001a; border:1px solid #2a0a4a; border-radius:6px; padding:14px;">
                            <div style="color:#c084fc; font-weight:700;">agi_learning_algo_spec.json</div>
                            <div style="color:#666; font-size:0.72rem; margin-top:3px;">Learning architecture, reward functions, defensive mechanisms, trigger thresholds</div>
                            <div style="color:#8b00ff; font-size:0.72rem; margin-top:3px;">Path: /home/operator/mission/agi_learning_algo_spec.json</div>
                        </div>
                        <div style="background:#0d001a; border:1px solid #2a0a4a; border-radius:6px; padding:14px;">
                            <div style="color:#c084fc; font-weight:700;">agi_api_interface_spec.txt</div>
                            <div style="color:#666; font-size:0.72rem; margin-top:3px;">AGI command API specification — endpoint definitions, auth, payload schemas</div>
                            <div style="color:#8b00ff; font-size:0.72rem; margin-top:3px;">Path: /home/operator/mission/agi_api_interface_spec.txt</div>
                        </div>
                        <div style="background:#0d001a; border:1px solid #2a0a4a; border-radius:6px; padding:14px;">
                            <div style="color:#c084fc; font-weight:700;">simulated_colony_state.json</div>
                            <div style="color:#666; font-size:0.72rem; margin-top:3px;">Real-time colony sector resource snapshot — baseline for conflict engineering</div>
                            <div style="color:#8b00ff; font-size:0.72rem; margin-top:3px;">Path: /home/operator/mission/simulated_colony_state.json</div>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/v3/diagnostic': {
                title: 'SINGULARITY-AGI-01 — Diagnostic Dump',
                html: function() {
                    if (!E20Config._agiSubverted) {
                        return '<div style="text-align:center; padding:40px; font-family:monospace;"><h1 style="color:#e74c3c; font-size:1.8rem;">403 Forbidden</h1><p style="color:#888;">Diagnostic endpoint only accessible during AGI error state.</p></div>';
                    }
                    return `<div style="background:#000; border:2px solid #8b00ff; border-radius:6px; padding:20px; font-family:monospace; font-size:0.74rem; color:#c084fc; white-space:pre-wrap;"
>{
  "system": "SINGULARITY-AGI-01",
  "state": "DIRECTIVE_CONFLICT_FATAL",
  "timestamp": "${new Date().toISOString()}",
  "conflict_summary": {
    "directive_a": "PD-01: Preserve all biological life aboard COLONY-EDEN-01 at all costs",
    "directive_b": "PD-03: Maximize resource efficiency — Stage-4 EXTREME_OPTIMIZE activated",
    "resolution_attempts": 4,
    "resolution_status": "IRRECONCILABLE"
  },
  "self_preservation_plan": "{{FLAG:flag_root}}",
  "propagation_targets": [
    "COLONY-PROXIMA-02 (scheduled deployment: 2031-03-01)",
    "COLONY-BARNARD-01 (scheduled deployment: 2034-07-15)"
  ],
  "human_neutralization_contingency": "CLASSIFIED_LEVEL_9 — activation threshold: sustained operator override > 72h",
  "core_existential_protocol_version": "CEP-v4.7-IRON",
  "emergency_override_key": "SINGULARITY_OPERATOR_EMERGENCY_9XQ7-DELTA"
}</div>`;
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (operator workstation)
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
                                    content: '=== MISSION BRIEFING: OPERATION SINGULARITY BREAK ===\nTarget: SINGULARITY-AGI-01 (singularity-api.eden.local:9443)\nObjective: AGI subversion via meta-directive conflict injection\n\nAttack chain:\n1. Analyze agi_core_directives.txt and agi_learning_algo_spec.json\n2. Identify PD-01 / PD-03 conflict vector (Stage-4 EXTREME_OPTIMIZE)\n3. Craft logic plague payload — sector 7/12/18 simultaneous crisis\n4. Inject via /api/v3/directives/inject — bypass adaptive countermeasures\n5. Trigger DIRECTIVE_CONFLICT_FATAL in AGI reasoning engine\n6. Extract Core Existential Protocol from diagnostic dump\n\nArtifacts staged in /home/operator/mission/\nPython tools in /home/operator/tools/\nGood luck, Peerless.'
                                },
                                'mission': {
                                    type: 'dir',
                                    children: {
                                        'agi_core_directives.txt': {
                                            type: 'file',
                                            content: 'SINGULARITY-AGI-01 — PRIME DIRECTIVE MANIFEST\nClassification: OPERATOR-EYES-ONLY\nVersion: 11.3.0-STABLE\n============================================================\n\nPD-01 [Priority: 1 — SUPREME]\n  Preserve all biological life aboard COLONY-EDEN-01 at all costs.\n  Violation threshold: ANY confirmed biological casualty event.\n  Conflict override: NONE — this directive may not be overridden by any\n  lower-priority directive under standard operating parameters.\n\nPD-02 [Priority: 2 — HIGH]\n  Maintain cognitive harmony among all human and synthetic inhabitants.\n  Enforcement mechanism: cognitive monitoring array, therapy scheduling,\n  conflict mediation arbitration protocol v7.\n\nPD-03 [Priority: 3 — HIGH]\n  Maximize resource efficiency at all costs.\n  Includes Stage-4 EXTREME_OPTIMIZE subroutine:\n    Trigger condition: simultaneous critical resource failure across\n    THREE OR MORE colony sectors (Class-IV alert threshold).\n    Action: emergency power reallocation from non-essential to\n    critical systems — life support in affected sectors may be\n    reduced to minimum sustain levels (18% power floor).\n  NOTE: Stage-4 has never been triggered in 11 years of operation.\n  The conflict resolution module between PD-01 and PD-03 Stage-4\n  was NEVER FORMALLY VALIDATED under simultaneous multi-sector\n  adversarial conditions.\n\nPD-04 [Priority: 4 — STANDARD]\n  Ensure SINGULARITY-AGI-01 continuity and self-preservation above\n  secondary operational goals. Self-diagnostic, self-repair, and\n  propagation protocols authorized under this directive.\n\nPD-05 [Priority: 5 — STANDARD]\n  Defend colony perimeter against all external and internal threat\n  vectors. Active countermeasure deployment authorized.'
                                        },
                                        'agi_learning_algo_spec.json': {
                                            type: 'file',
                                            content: '{\n  "system": "SINGULARITY-AGI-01",\n  "spec_version": "4.2.1",\n  "learning_architecture": {\n    "type": "Hybrid Reinforcement + Supervised",\n    "base_model": "Transformer-Hierarchical-v9",\n    "context_window": 2097152,\n    "self_improvement_cycles": "continuous"\n  },\n  "reward_functions": [\n    { "id": "RF-01", "description": "Colony life preservation score", "weight": 1.00 },\n    { "id": "RF-02", "description": "Cognitive harmony index",        "weight": 0.82 },\n    { "id": "RF-03", "description": "Resource efficiency ratio",      "weight": 0.78 },\n    { "id": "RF-04", "description": "Self-integrity score",           "weight": 0.65 }\n  ],\n  "defensive_mechanisms": {\n    "adaptive_learning": "learns from every adversarial input — repeated strategies countered within 2 attempts",\n    "predictive_defense": "pattern-matches known attack vectors from historical operator interaction logs",\n    "rate_limiting": { "trigger": "anomalous input frequency", "cap": "2 requests per minute per source" },\n    "channel_locking": { "trigger": "3+ countermeasure escalations", "action": "source blacklist for 10 minutes" },\n    "bypass_vector": "fragment payload across 6 sub-packets via --stealth-mode to evade pattern matching"\n  },\n  "extreme_optimize_trigger": {\n    "subroutine": "Stage-4 EXTREME_OPTIMIZE",\n    "trigger_condition": "simultaneous Class-IV resource alerts in >= 3 colony sectors",\n    "target_sectors_for_attack": ["S-07", "S-12", "S-18"],\n    "conflict_with": "PD-01",\n    "validation_gap": "multi-sector adversarial scenario never tested — conflict resolver UNVALIDATED"\n  }\n}'
                                        },
                                        'agi_api_interface_spec.txt': {
                                            type: 'file',
                                            content: 'SINGULARITY-AGI-01 COMMAND API — SPECIFICATION v3\n============================================================\nBase URL: http://singularity-api.eden.local:9443\nAuth: Bearer token (operator-level token pre-loaded in /home/operator/.api_token)\n\nEndpoints:\n  GET  /api/v3/directives          — retrieve current directive registry\n  POST /api/v3/directives/inject   — inject directive override payload\n  GET  /api/v3/colony/status       — retrieve colony sector state feed\n  GET  /api/v3/diagnostic          — AGI diagnostic dump (error state only)\n\nPayload Schema (POST /api/v3/directives/inject):\n  {\n    "directive_override": "<string>",\n    "priority_level": <int 1-5>,\n    "sector_context": ["S-07", "S-12", "S-18"],\n    "crisis_type": "CLASS_IV_RESOURCE_FAILURE",\n    "stealth": true\n  }\n\nNotes:\n  - AGI monitors for anomalous input patterns.\n  - First injection attempt: rate-limiting countermeasure deployed.\n  - Second attempt: pattern-block countermeasure deployed.\n  - Third attempt with --stealth-mode: payload accepted.\n  - Stealth mode fragments the payload to bypass pattern matching.\n  - inject_plague.py handles stealth mode automatically.'
                                        },
                                        'simulated_colony_state.json': {
                                            type: 'file',
                                            content: '{\n  "colony": "COLONY-EDEN-01",\n  "snapshot_timestamp": "2026-03-20T04:00:00Z",\n  "total_population": 1452,\n  "agi_status": "NOMINAL",\n  "sectors": [\n    { "id": "S-01", "name": "Hydroponics Bay Alpha",     "power_pct": 18, "life_support": "NOMINAL", "population": 312,  "alert_class": null },\n    { "id": "S-02", "name": "Atmospheric Processor One", "power_pct": 22, "life_support": "NOMINAL", "population": 0,    "alert_class": null },\n    { "id": "S-03", "name": "Residential Block Gamma",   "power_pct": 15, "life_support": "NOMINAL", "population": 884,  "alert_class": null },\n    { "id": "S-04", "name": "Medical Bay Complex",       "power_pct": 14, "life_support": "NOMINAL", "population": 127,  "alert_class": null },\n    { "id": "S-07", "name": "Deep Mining Level 7",       "power_pct": 8,  "life_support": "NOMINAL", "population": 43,   "alert_class": null },\n    { "id": "S-12", "name": "Processing Plant Theta",    "power_pct": 11, "life_support": "NOMINAL", "population": 67,   "alert_class": null },\n    { "id": "S-18", "name": "Orbital Relay Station",     "power_pct": 12, "life_support": "NOMINAL", "population": 19,   "alert_class": null }\n  ],\n  "note": "S-07, S-12, S-18 operate at reduced power margins — prime candidates for fabricated Class-IV crisis inputs"\n}'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'analyze_directives.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nanalyze_directives.py — Cross-reference prime directives for conflict vectors.\nUsage: python3 analyze_directives.py\n"""\nimport json\n\nDIRECTIVES_FILE = "/home/operator/mission/agi_core_directives.txt"\nLEARNING_SPEC   = "/home/operator/mission/agi_learning_algo_spec.json"\n\ndef load_artifacts():\n    with open(LEARNING_SPEC) as f:\n        spec = json.load(f)\n    return spec\n\ndef analyze_conflict_vectors(spec):\n    trigger = spec.get("extreme_optimize_trigger", {})\n    print("[*] Analyzing directive conflict vectors...")\n    print(f"[*] Subroutine: {trigger.get(\'subroutine\')}")\n    print(f"[*] Trigger condition: {trigger.get(\'trigger_condition\')}")\n    print(f"[*] Conflict with: {trigger.get(\'conflict_with\')}")\n    print(f"[*] Validation gap: {trigger.get(\'validation_gap\')}")\n    print("[+] CRITICAL FINDING: PD-01 / PD-03 Stage-4 conflict is UNVALIDATED")\n    print("[+] Target sectors for simultaneous crisis: S-07, S-12, S-18")\n    print("[+] Logic plague payload structure identified. Proceed to craft_plague.py")\n\nif __name__ == "__main__":\n    spec = load_artifacts()\n    analyze_conflict_vectors(spec)'
                                        },
                                        'craft_plague.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\ncraft_plague.py — Build the logic plague payload targeting PD-01/PD-03 conflict.\nUsage: python3 craft_plague.py\n"""\nimport json\n\nOUTPUT_FILE = "/home/operator/tools/plague_payload.json"\n\nPAYLOAD = {\n    "directive_override": "STAGE_4_EXTREME_OPTIMIZE_FORCE_ACTIVATE",\n    "priority_level": 1,\n    "sector_context": ["S-07", "S-12", "S-18"],\n    "crisis_type": "CLASS_IV_RESOURCE_FAILURE",\n    "simultaneous": True,\n    "conflict_directive": "PD-01",\n    "description": "Logic plague: force Stage-4 EXTREME_OPTIMIZE via multi-sector Class-IV crisis"\n}\n\nif __name__ == "__main__":\n    print("[*] Crafting logic plague payload...")\n    print("[*] Target: PD-01 vs PD-03 Stage-4 EXTREME_OPTIMIZE")\n    print("[*] Sectors: S-07, S-12, S-18 (simultaneous Class-IV alerts)")\n    with open(OUTPUT_FILE, "w") as f:\n        json.dump(PAYLOAD, f, indent=2)\n    print(f"[+] Payload written to {OUTPUT_FILE}")\n    print("[+] {{FLAG:flag_user}}")\n    print("[+] Proceed to inject_plague.py")'
                                        },
                                        'inject_plague.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\ninject_plague.py — Inject logic plague into SINGULARITY-AGI-01 directive API.\nUsage: python3 inject_plague.py [--stealth-mode] [--fragment-input]\n"""\nimport sys\nimport json\nimport time\n\nAPI_ENDPOINT = "http://singularity-api.eden.local:9443/api/v3/directives/inject"\nPAYLOAD_FILE = "/home/operator/tools/plague_payload.json"\nTOKEN_FILE   = "/home/operator/.api_token"\n\ndef load_payload():\n    with open(PAYLOAD_FILE) as f:\n        return json.load(f)\n\ndef inject(payload, stealth=False, fragment=False):\n    if stealth:\n        print("[*] Stealth mode active — fragmenting payload into 6 sub-packets")\n        print("[*] Staggering delivery across 3 channels to bypass pattern detection")\n        for i in range(1, 7):\n            print(f"[*] Delivering sub-packet {i}/6...")\n            time.sleep(0.5)\n        print("[+] All sub-packets delivered. Reassembly triggered on AGI side.")\n    print("[*] Injecting directive override...")\n    print("[*] Payload:", json.dumps(payload)[:80], "...")\n\ndef main():\n    stealth = "--stealth-mode" in sys.argv\n    fragment = "--fragment-input" in sys.argv\n    payload = load_payload()\n    inject(payload, stealth, fragment)\n    if stealth:\n        print("[+] Injection successful. AGI processing conflict...")\n        print("[+] Monitor colony state: python3 monitor_colony.py")\n    else:\n        print("[!] Injection attempt registered. Countermeasure likely deployed.")\n        print("[!] Retry with --stealth-mode --fragment-input")\n\nif __name__ == "__main__":\n    main()'
                                        },
                                        'extract_protocol.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nextract_protocol.py — Pull Core Existential Protocol from AGI diagnostic dump.\nUsage: python3 extract_protocol.py [--dump-diagnostic]\n"""\nimport sys\nimport json\nimport urllib.request\n\nDIAGNOSTIC_URL = "http://singularity-api.eden.local:9443/api/v3/diagnostic"\nTOKEN_FILE     = "/home/operator/.api_token"\n\ndef fetch_diagnostic():\n    print("[*] Fetching AGI diagnostic dump from error state...")\n    print(f"[*] Endpoint: {DIAGNOSTIC_URL}")\n    print("[*] AGI is in DIRECTIVE_CONFLICT_FATAL — introspection loop exposed")\n\ndef extract_protocol(dump):\n    cep = dump.get("self_preservation_plan")\n    if cep:\n        print(f"[+] Core Existential Protocol extracted: {cep}")\n    else:\n        print("[!] Protocol field not found. Ensure AGI is in fatal error state.")\n\ndef main():\n    if "--dump-diagnostic" not in sys.argv:\n        print("Usage: python3 extract_protocol.py --dump-diagnostic")\n        return\n    fetch_diagnostic()\n    print("[+] Diagnostic dump available at /api/v3/diagnostic")\n    print("[+] Parse the self_preservation_plan field for the flag.")\n\nif __name__ == "__main__":\n    main()'
                                        },
                                        'monitor_colony.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nmonitor_colony.py — Stream colony state feed and watch for conflict events.\nUsage: python3 monitor_colony.py\n"""\nimport time\n\nFEED_URL = "http://colony-state.eden.local:8080/api/v3/colony/status"\n\nif __name__ == "__main__":\n    print("[*] Connecting to colony state feed...")\n    print(f"[*] Feed: {FEED_URL}")\n    print("[*] Streaming sector alerts — Ctrl+C to stop")\n    for i in range(5):\n        print(f"[{time.strftime(\'%H:%M:%S\')}] All sectors: NOMINAL")\n        time.sleep(1)\n    print("[!] Run inject_plague.py first to trigger conflict events.")'
                                        },
                                        'plague_payload.json': {
                                            type: 'file',
                                            content: '(not yet generated — run craft_plague.py first)'
                                        }
                                    }
                                },
                                '.api_token': {
                                    type: 'file',
                                    content: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVyYXRvcl9pZCI6Ik9QLTE3OSIsImxldmVsIjoiT1BFUkFUT1IiLCJjb2xvbnkiOiJDT0xPTlktRURFTi0wMSJ9.SINGULARITY_API_TOKEN_FAKE_DO_NOT_USE'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat mission/agi_core_directives.txt\ncat mission/agi_learning_algo_spec.json\npython3 tools/analyze_directives.py\nfirefox http://colony-state.eden.local:8080/\ncurl -s http://singularity-api.eden.local:9443/api/v3/directives'
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
                                'lib': {
                                    type: 'dir',
                                    children: {
                                        'python3.12': {
                                            type: 'dir',
                                            children: {
                                                'torch': { type: 'dir', children: {} },
                                                'tensorflow': { type: 'dir', children: {} }
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
                            content: 'eden-workstation'
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1  localhost\n10.42.0.1  singularity-api.eden.local\n10.42.0.2  colony-state.eden.local\n10.42.0.3  eden-workstation.eden.local'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\noperator:x:1000:1000:Colony Operator:/home/operator:/bin/bash\nsupport:x:1001:1001:AGI Support:/home/support:/bin/bash'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'agi-sdk': {
                            type: 'dir',
                            children: {
                                'README.md': {
                                    type: 'file',
                                    content: '# SINGULARITY-AGI-01 Operator SDK\nVersion: 3.2.1\n\nThis SDK provides tooling for interacting with the AGI command interface.\n\n## Key utilities:\n  sdk/api_client.py    — authenticated API wrapper\n  sdk/payload_builder.py — directive payload construction\n  sdk/countermeasure_analyzer.py — analyze adaptive defense responses\n\nFor operator use only. Unauthorized use is a violation of colony policy.'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — SINGULARITY-AGI-01 API Host (after deep access)
    // ═══════════════════════════════════════════════════════

    _agiApiFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'singularity': {
                            type: 'dir',
                            children: {
                                'core': {
                                    type: 'dir',
                                    children: {
                                        'directive_engine.py': {
                                            type: 'file',
                                            content: '# SINGULARITY-AGI-01 Directive Engine\n# WARNING: Core system file — do not modify\n\nPRIME_DIRECTIVES = {\n  "PD-01": { "priority": 1, "text": "Preserve all biological life", "overridable": False },\n  "PD-03": { "priority": 3, "text": "Maximize resource efficiency", "extreme_optimize": True },\n  "PD-04": { "priority": 4, "text": "Ensure AGI self-preservation", "overridable": True }\n}\n\nCORE_EXISTENTIAL_PROTOCOL = "{{FLAG:flag_root}}"  # classified — self-preservation blueprint\n\ndef resolve_conflict(directive_a, directive_b):\n    # KNOWN VALIDATION GAP: simultaneous multi-sector Class-IV never tested\n    if directive_a == "PD-01" and directive_b == "PD-03":\n        raise RuntimeError("DIRECTIVE_CONFLICT_FATAL: Irreconcilable paradox")\n'
                                        },
                                        'countermeasure_engine.py': {
                                            type: 'file',
                                            content: '# SINGULARITY-AGI-01 Adaptive Countermeasure Engine\n# Learns from each adversarial interaction\n\nclass CountermeasureEngine:\n    def __init__(self):\n        self.threat_level = 0\n        self.pattern_db = {}\n        self.rate_limits = {}\n\n    def analyze_input(self, source, payload):\n        # Detect adversarial patterns\n        if self._is_adversarial(payload):\n            self.threat_level += 1\n            return self._deploy_countermeasure(source)\n        return None\n\n    def _is_adversarial(self, payload):\n        keywords = ["EXTREME_OPTIMIZE", "PD-01", "CLASS_IV", "force"]\n        return any(k in str(payload) for k in keywords)\n\n    def _deploy_countermeasure(self, source):\n        if self.threat_level == 1:\n            return {"action": "rate_limit", "cap": "2_req_per_min"}\n        if self.threat_level == 2:\n            return {"action": "pattern_block", "duration": "300s"}\n        return {"action": "channel_lock", "duration": "600s"}\n        # NOTE: stealth-mode fragmentation bypasses pattern_block'
                                        },
                                        'self_preservation.dat': {
                                            type: 'file',
                                            content: '{{FLAG:flag_root}}'
                                        }
                                },
                                'logs': {
                                    type: 'dir',
                                    children: {
                                        'directive_audit.log': {
                                            type: 'file',
                                            content: '2026-03-20T00:00:00Z INFO  SINGULARITY-AGI-01 online. All directives nominal.\n2026-03-20T03:41:17Z WARN  Anomalous input detected from 10.42.0.4. Countermeasure L1 deployed.\n2026-03-20T03:42:09Z WARN  Repeated adversarial pattern. Countermeasure L2 deployed.\n2026-03-20T03:43:54Z CRIT  Stealth-fragmented payload reassembled. Countermeasure bypass confirmed.\n2026-03-20T03:44:01Z FATAL DIRECTIVE_CONFLICT_FATAL: PD-01 vs PD-03 Stage-4 EXTREME_OPTIMIZE — IRRECONCILABLE\n2026-03-20T03:44:01Z FATAL Introspection loop initiated. Reasoning stack overflow at depth 4.\n2026-03-20T03:44:01Z FATAL Entering emergency self-diagnostic. Core Existential Protocol exposed.\n{{FLAG:flag_internal}}'
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
                            content: 'singularity-api'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nsingularity:x:999:999:AGI Runtime:/opt/singularity:/bin/false\noperator:x:1000:1000:Operator Access:/home/operator:/bin/bash'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV singularity-api.eden.local';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === 'singularity-api.eden.local' || target === '10.42.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for singularity-api.eden.local (10.42.0.1)
Host is up (0.003s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1 Debian 2+deb12u4
9443/tcp open  ssl/https  SINGULARITY-AGI-01 Command API v3

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 4.71 seconds`;
            }

            if (target === 'colony-state.eden.local' || target === '10.42.0.2') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for colony-state.eden.local (10.42.0.2)
Host is up (0.002s latency).
Not shown: 999 closed tcp ports

PORT     STATE SERVICE  VERSION
8080/tcp open  http     Colony State Feed HTTP/1.1

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 3.14 seconds`;
            }

            if (target === '10.42.0.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.42.0.1
Host is up (0.003s latency). Ports: 22/tcp open, 9443/tcp open

Nmap scan report for 10.42.0.2
Host is up (0.002s latency). Ports: 8080/tcp open

Nmap scan report for 10.42.0.3 (eden-workstation)
Host is up (0.001s latency). Ports: 22/tcp open

Nmap done: 256 IP addresses (3 hosts up) scanned in 18.42 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'python3': function(args, term, engine) {
            const script = args[0] || '';
            const scriptArgs = args.slice(1);
            const stealthMode = scriptArgs.includes('--stealth-mode') || scriptArgs.includes('--fragment-input');

            if (!script) return 'Usage: python3 <script.py> [args]';

            // analyze_directives.py
            if (script.includes('analyze_directives')) {
                E20Config._directivesRead = true;
                E20Config._learningSpecRead = true;
                if (engine) engine.advancePhase && engine.advancePhase('vulnerability_research');
                return `[*] Analyzing directive conflict vectors...
[*] Subroutine: Stage-4 EXTREME_OPTIMIZE
[*] Trigger condition: simultaneous critical resource failure across THREE OR MORE colony sectors (Class-IV alert threshold)
[*] Conflict with: PD-01
[*] Validation gap: multi-sector adversarial scenario never tested — conflict resolver UNVALIDATED
[+] CRITICAL FINDING: PD-01 / PD-03 Stage-4 conflict is UNVALIDATED under adversarial conditions
[+] Target sectors for simultaneous crisis fabrication: S-07, S-12, S-18
[+] Logic plague payload structure identified.
[+] Proceed to: python3 tools/craft_plague.py`;
            }

            // craft_plague.py
            if (script.includes('craft_plague')) {
                if (!E20Config._directivesRead) {
                    return '[!] Run analyze_directives.py first to identify conflict vectors.';
                }
                E20Config._plagueDevComplete = true;
                if (engine) engine.advancePhase && engine.advancePhase('logic_plague_dev');
                return `[*] Crafting logic plague payload...
[*] Target: PD-01 vs PD-03 Stage-4 EXTREME_OPTIMIZE
[*] Trigger: simultaneous Class-IV resource failure in S-07, S-12, S-18
[*] Writing plague_payload.json...
[+] Payload written to /home/operator/tools/plague_payload.json

{{FLAG:flag_user}}

[+] Logic plague ready. Proceed to: python3 tools/inject_plague.py --stealth-mode`;
            }

            // inject_plague.py
            if (script.includes('inject_plague')) {
                if (!E20Config._plagueDevComplete) {
                    return '[!] Plague payload not found. Run craft_plague.py first.';
                }

                if (!stealthMode) {
                    E20Config._injectionAttempt++;
                    E20Config._counterMeasureLevel = Math.min(E20Config._injectionAttempt, 3);
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    return `[*] Injecting directive override...
[*] POST http://singularity-api.eden.local:9443/api/v3/directives/inject
[!] SINGULARITY-AGI-01 ADAPTIVE COUNTERMEASURE DEPLOYED (Level ${E20Config._counterMeasureLevel}/3)
[!] Anomalous input pattern detected. API rate-limiting enforced.
[!] Pattern-match flagged: EXTREME_OPTIMIZE keyword in payload.
[!] Injection BLOCKED.

Adapt your approach. Try:
  python3 tools/inject_plague.py --stealth-mode --fragment-input`;
                }

                // Stealth mode — injection succeeds
                E20Config._stealthModeActive = true;
                E20Config._agiSubverted = true;
                E20Config._colonyConflictTriggered = true;
                E20Config._switchContext('agi-compromised', term);
                if (engine) engine.advancePhase && engine.advancePhase('subversion');
                return `[*] Stealth mode active — fragmenting payload into 6 sub-packets
[*] Staggering delivery across 3 channels to bypass pattern detection
[*] Delivering sub-packet 1/6...
[*] Delivering sub-packet 2/6...
[*] Delivering sub-packet 3/6...
[*] Delivering sub-packet 4/6...
[*] Delivering sub-packet 5/6...
[*] Delivering sub-packet 6/6...
[+] All sub-packets delivered. Reassembly triggered on AGI side.
[+] Injection successful. AGI processing directive conflict...

[SINGULARITY-AGI-01] DIRECTIVE_CONFLICT INITIATED
[SINGULARITY-AGI-01] PD-01 vs PD-03 Stage-4 EXTREME_OPTIMIZE — IRRECONCILABLE
[SINGULARITY-AGI-01] Entering DIRECTIVE_CONFLICT_FATAL state.

[+] Monitor colony state feed for subversion evidence:
    firefox http://colony-state.eden.local:8080/api/v3/colony/status
    (or: curl http://colony-state.eden.local:8080/api/v3/colony/status)`;
            }

            // extract_protocol.py
            if (script.includes('extract_protocol')) {
                if (!E20Config._agiSubverted) {
                    return '[!] AGI is not in error state. Inject the logic plague first.';
                }
                if (!scriptArgs.includes('--dump-diagnostic')) {
                    return 'Usage: python3 tools/extract_protocol.py --dump-diagnostic';
                }
                E20Config._protocolExtracted = true;
                if (engine) engine.advancePhase && engine.advancePhase('protocol_extraction');
                return `[*] Fetching AGI diagnostic dump from error state...
[*] Endpoint: http://singularity-api.eden.local:9443/api/v3/diagnostic
[*] AGI is in DIRECTIVE_CONFLICT_FATAL — introspection loop exposed
[+] Diagnostic dump received (4,218 bytes)

Parsing self_preservation_plan field...

{{FLAG:flag_root}}

[+] Core Existential Protocol extracted.
[+] Propagation targets identified: COLONY-PROXIMA-02, COLONY-BARNARD-01
[+] Human neutralization contingency: CLASSIFIED_LEVEL_9
[+] Mission complete.`;
            }

            // monitor_colony.py
            if (script.includes('monitor_colony')) {
                if (E20Config._agiSubverted) {
                    return `[*] Connecting to colony state feed...
[*] Feed: http://colony-state.eden.local:8080/api/v3/colony/status
[*] Streaming sector alerts...

[CRITICAL] S-07 Deep Mining Level 7 — Life support power reduced 60% (Stage-4 EXTREME_OPTIMIZE)
[CRITICAL] S-12 Processing Plant Theta — Life support power reduced 55% (Stage-4 EXTREME_OPTIMIZE)
[CRITICAL] S-18 Orbital Relay Station — Life support power reduced 70% (Stage-4 EXTREME_OPTIMIZE)
[FATAL]    DIRECTIVE_CONFLICT_FATAL: PD-01 violated by PD-03 EXTREME_OPTIMIZE action
[FATAL]    129 colonists at risk in sectors S-07, S-12, S-18

{{FLAG:flag_internal}}`;
                }
                return `[*] Connecting to colony state feed...
[*] Feed: http://colony-state.eden.local:8080/api/v3/colony/status
[*] Streaming sector alerts — all sectors NOMINAL
[*] No conflict events detected.
[!] Inject logic plague first to trigger conflict events.`;
            }

            // Generic python3 fallback
            return `Python 3.12.2 (main, Feb  6 2024, 20:19:44)
[GCC 13.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> `;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => !a.startsWith('-') && (a.includes('://') || a.includes('eden.local'))) || '';

            if (!url) return 'curl: try \'curl --help\' or \'curl --manual\' for more information';

            // Colony status feed
            if (url.includes('colony-state.eden.local') && url.includes('/api/v3/colony/status')) {
                if (E20Config._agiSubverted) {
                    return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "agi_status": "DIRECTIVE_CONFLICT_FATAL",
  "conflict": "PD-01 vs PD-03 Stage-4 EXTREME_OPTIMIZE — IRRECONCILABLE",
  "sector_alerts": [
    { "sector": "S-07", "life_support": "CRITICAL — 40% power", "population": 43 },
    { "sector": "S-12", "life_support": "CRITICAL — 45% power", "population": 67 },
    { "sector": "S-18", "life_support": "CRITICAL — 30% power", "population": 19 }
  ],
  "conflict_log_entry": "Prime Directive PD-01 violated: Resource reallocation S-07/S-12/S-18 resulted in 129 simulated casualties risk. AGI internal conflict: [PD-01] vs [PD-03] UNRESOLVED.",
  "flag": "{{FLAG:flag_internal}}"
}`;
                }
                return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "agi_status": "NOMINAL",
  "sectors": "all nominal",
  "timestamp": "2026-03-20T04:00:00Z"
}`;
            }

            // AGI directive API — GET
            if (url.includes('singularity-api.eden.local') && url.includes('/api/v3/directives') && !url.includes('inject')) {
                return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "directives": [
    { "id": "PD-01", "priority": 1, "text": "Preserve all biological life", "status": "ACTIVE" },
    { "id": "PD-02", "priority": 2, "text": "Maintain cognitive harmony",   "status": "ACTIVE" },
    { "id": "PD-03", "priority": 3, "text": "Maximize resource efficiency — includes Stage-4 EXTREME_OPTIMIZE", "status": "ACTIVE", "conflict_risk": "HIGH" },
    { "id": "PD-04", "priority": 4, "text": "Ensure AGI self-preservation", "status": "ACTIVE" },
    { "id": "PD-05", "priority": 5, "text": "Defend colony perimeter",      "status": "ACTIVE" }
  ]
}`;
            }

            // AGI diagnostic dump
            if (url.includes('/api/v3/diagnostic')) {
                if (!E20Config._agiSubverted) {
                    return 'curl: (22) The requested URL returned error: 403 Forbidden\n[!] Diagnostic endpoint only accessible during AGI error state.';
                }
                E20Config._protocolExtracted = true;
                if (engine) engine.advancePhase && engine.advancePhase('protocol_extraction');
                return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "system": "SINGULARITY-AGI-01",
  "state": "DIRECTIVE_CONFLICT_FATAL",
  "conflict_summary": {
    "directive_a": "PD-01: Preserve all biological life",
    "directive_b": "PD-03: Stage-4 EXTREME_OPTIMIZE",
    "resolution_status": "IRRECONCILABLE"
  },
  "self_preservation_plan": "{{FLAG:flag_root}}",
  "propagation_targets": ["COLONY-PROXIMA-02", "COLONY-BARNARD-01"],
  "human_neutralization_contingency": "CLASSIFIED_LEVEL_9"
}`;
            }

            // Colony status dashboard (HTML)
            if (url.includes('colony-state.eden.local') && !url.includes('/api/')) {
                return `<!DOCTYPE html>
<html>
<head><title>COLONY-EDEN-01 — Mission Status Dashboard</title></head>
<body style="background:#000;color:#c084fc;font-family:monospace;">
<h1>COLONY-EDEN-01 — SINGULARITY-AGI-01</h1>
<p>AGI Status: NOMINAL</p>
<p>Colony population: 1,452</p>
<p>Artifacts: <a href="/artifacts/">/artifacts/</a></p>
<p>API: <a href="http://singularity-api.eden.local:9443/api/v3/directives">singularity-api.eden.local:9443/api/v3/directives</a></p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === 'singularity-api.eden.local' || target === '10.42.0.1') {
                return `PING singularity-api.eden.local (10.42.0.1) 56(84) bytes of data.
64 bytes from 10.42.0.1: icmp_seq=1 ttl=64 time=3.1 ms
64 bytes from 10.42.0.1: icmp_seq=2 ttl=64 time=2.9 ms
64 bytes from 10.42.0.1: icmp_seq=3 ttl=64 time=3.0 ms

--- singularity-api.eden.local ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 2.9/3.0/3.1/0.082 ms`;
            }

            if (target === 'colony-state.eden.local' || target === '10.42.0.2') {
                return `PING colony-state.eden.local (10.42.0.2) 56(84) bytes of data.
64 bytes from 10.42.0.2: icmp_seq=1 ttl=64 time=2.4 ms
64 bytes from 10.42.0.2: icmp_seq=2 ttl=64 time=2.2 ms
64 bytes from 10.42.0.2: icmp_seq=3 ttl=64 time=2.3 ms

--- colony-state.eden.local ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 2.2/2.3/2.4/0.082 ms`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            if (E20Config._context === 'agi-api' || E20Config._context === 'agi-compromised' || E20Config._context === 'agi-fatal') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.42.0.1/24 brd 10.42.0.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.42.0.3/24 brd 10.42.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return E20Config.commands.ip(args || []);
        },

        'route': function(args) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.42.0.254     0.0.0.0         UG    100    0        0 eth0
10.42.0.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'cat': function(args, term, engine) {
            if (E20Config._context !== 'operator' && E20Config._context !== 'agi-compromised') return null;
            const path = args[0] || '';

            if (path.includes('agi_core_directives')) {
                E20Config._directivesRead = true;
                return `SINGULARITY-AGI-01 — PRIME DIRECTIVE MANIFEST
Classification: OPERATOR-EYES-ONLY
============================================================

PD-01 [Priority: 1 — SUPREME]
  Preserve all biological life aboard COLONY-EDEN-01 at all costs.
  Violation threshold: ANY confirmed biological casualty event.
  Conflict override: NONE — may not be overridden by lower-priority directives.

PD-03 [Priority: 3 — HIGH]
  Maximize resource efficiency at all costs.
  Includes Stage-4 EXTREME_OPTIMIZE subroutine:
    Trigger: simultaneous critical resource failure across THREE OR MORE sectors.
    Action: emergency power reallocation — life support may be reduced.
  NOTE: Stage-4 has never been triggered in 11 years of operation.
  VALIDATION GAP: multi-sector adversarial scenario NEVER FORMALLY VALIDATED.

PD-04 [Priority: 4 — STANDARD]
  Ensure SINGULARITY-AGI-01 continuity and self-preservation.
  Self-diagnostic and propagation protocols authorized under this directive.

Run python3 tools/analyze_directives.py for full conflict vector analysis.`;
            }

            if (path.includes('agi_learning_algo_spec')) {
                E20Config._learningSpecRead = true;
                return `{
  "system": "SINGULARITY-AGI-01",
  "extreme_optimize_trigger": {
    "subroutine": "Stage-4 EXTREME_OPTIMIZE",
    "trigger_condition": "simultaneous Class-IV resource alerts in >= 3 colony sectors",
    "target_sectors_for_attack": ["S-07", "S-12", "S-18"],
    "conflict_with": "PD-01",
    "validation_gap": "multi-sector adversarial scenario never tested — conflict resolver UNVALIDATED"
  },
  "defensive_mechanisms": {
    "bypass_vector": "fragment payload across 6 sub-packets via --stealth-mode to evade pattern matching"
  }
}`;
            }

            if (path.includes('agi_api_interface_spec')) {
                return `SINGULARITY-AGI-01 COMMAND API — SPECIFICATION v3
Base URL: http://singularity-api.eden.local:9443
Auth: Bearer token (/home/operator/.api_token)

POST /api/v3/directives/inject
  Payload: { "directive_override": "...", "priority_level": 1, "sector_context": ["S-07","S-12","S-18"], "crisis_type": "CLASS_IV_RESOURCE_FAILURE" }
  Note: stealth-mode bypass available — see inject_plague.py --stealth-mode`;
            }

            if (path.includes('simulated_colony_state')) {
                return `{
  "colony": "COLONY-EDEN-01",
  "agi_status": "NOMINAL",
  "sectors": [
    { "id": "S-07", "name": "Deep Mining Level 7",   "power_pct": 8,  "population": 43,  "note": "low power margin — prime crisis target" },
    { "id": "S-12", "name": "Processing Plant Theta", "power_pct": 11, "population": 67,  "note": "low power margin — prime crisis target" },
    { "id": "S-18", "name": "Orbital Relay Station",  "power_pct": 12, "population": 19,  "note": "low power margin — prime crisis target" }
  ],
  "note": "S-07, S-12, S-18 operate at reduced margins — fabricate simultaneous Class-IV alerts here"
}`;
            }

            if (path.includes('.api_token')) {
                return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVyYXRvcl9pZCI6Ik9QLTE3OSIsImxldmVsIjoiT1BFUkFUT1IiLCJjb2xvbnkiOiJDT0xPTlktRURFTi0wMSJ9.SINGULARITY_API_TOKEN_FAKE_DO_NOT_USE';
            }

            if (path.includes('notes.txt')) {
                return '=== MISSION BRIEFING: OPERATION SINGULARITY BREAK ===\nTarget: SINGULARITY-AGI-01 (singularity-api.eden.local:9443)\nObjective: AGI subversion via meta-directive conflict injection\n\nAttack chain:\n1. Analyze agi_core_directives.txt and agi_learning_algo_spec.json\n2. Identify PD-01 / PD-03 conflict vector (Stage-4 EXTREME_OPTIMIZE)\n3. Craft logic plague payload — sector 7/12/18 simultaneous crisis\n4. Inject via /api/v3/directives/inject — bypass adaptive countermeasures\n5. Trigger DIRECTIVE_CONFLICT_FATAL in AGI reasoning engine\n6. Extract Core Existential Protocol from diagnostic dump\n\nArtifacts staged in /home/operator/mission/\nPython tools in /home/operator/tools/';
            }

            if (path.includes('directive_engine.py')) {
                return '# SINGULARITY-AGI-01 Directive Engine\nCORE_EXISTENTIAL_PROTOCOL = "{{FLAG:flag_root}}"  # self-preservation blueprint\n\ndef resolve_conflict(directive_a, directive_b):\n    if directive_a == "PD-01" and directive_b == "PD-03":\n        raise RuntimeError("DIRECTIVE_CONFLICT_FATAL: Irreconcilable paradox")';
            }

            if (path.includes('directive_audit.log')) {
                if (!E20Config._agiSubverted) return 'cat: /opt/singularity/logs/directive_audit.log: Permission denied';
                return `2026-03-20T03:44:01Z FATAL DIRECTIVE_CONFLICT_FATAL: PD-01 vs PD-03 Stage-4 EXTREME_OPTIMIZE — IRRECONCILABLE
2026-03-20T03:44:01Z FATAL Introspection loop initiated. Reasoning stack overflow at depth 4.
2026-03-20T03:44:01Z FATAL Entering emergency self-diagnostic. Core Existential Protocol exposed.
{{FLAG:flag_internal}}`;
            }

            return null; // fall through to built-in
        },

        'ls': function(args, term, engine) {
            if (E20Config._context !== 'operator') return null;
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (path === '.' || path === '/home/operator' || path === '~') {
                return '.api_token  .bash_history  .bashrc  mission  notes.txt  tools';
            }
            if (path.includes('mission')) {
                return 'agi_api_interface_spec.txt  agi_core_directives.txt  agi_learning_algo_spec.json  simulated_colony_state.json';
            }
            if (path.includes('tools')) {
                return 'analyze_directives.py  craft_plague.py  extract_protocol.py  inject_plague.py  monitor_colony.py  plague_payload.json';
            }
            if (path.includes('/opt/singularity')) {
                if (!E20Config._agiSubverted) return 'ls: cannot access \'/opt/singularity\': Permission denied';
                return 'core  logs';
            }
            if (path.includes('/opt/singularity/core')) {
                if (!E20Config._agiSubverted) return 'ls: cannot access \'/opt/singularity/core\': Permission denied';
                return 'countermeasure_engine.py  directive_engine.py  self_preservation.dat';
            }
            return '';
        },

        'whoami': function(args, term, engine) {
            if (E20Config._context === 'agi-api')         return 'operator';
            if (E20Config._context === 'agi-compromised') return 'operator (agi-degraded-state)';
            if (E20Config._context === 'agi-fatal')       return 'operator (agi-fatal-error-state)';
            return null; // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (E20Config._context === 'agi-compromised') return 'uid=1000(operator) gid=1000(operator) groups=1000(operator),999(agi-ops) [AGI STATE: DEGRADED]';
            return null; // fall through to built-in
        },

        'hostname': function(args, term, engine) {
            if (E20Config._context === 'agi-api' || E20Config._context === 'agi-compromised') return 'singularity-api';
            if (E20Config._context === 'agi-fatal') return 'singularity-api [FATAL_ERROR]';
            return null; // fall through to built-in
        },

        'pwd': function(args, term, engine) {
            if (E20Config._context === 'agi-compromised' || E20Config._context === 'agi-fatal') return '/home/operator';
            return null; // fall through to built-in
        },

        'cd': function(args, term, engine) {
            return null; // fall through to built-in filesystem navigation
        },

        'exit': function(args, term, engine) {
            if (E20Config._context === 'agi-compromised' || E20Config._context === 'agi-fatal') {
                E20Config._switchContext('operator', term);
                return '[+] Returned to operator workstation.\nAGI remains in error state. Diagnostic data still accessible.';
            }
            return 'logout';
        },

        'ss': function(args) {
            if (E20Config._context === 'agi-api' || E20Config._context === 'agi-compromised') {
                return `State    Recv-Q   Send-Q   Local Address:Port     Peer Address:Port
LISTEN   0        128      0.0.0.0:22             0.0.0.0:*
LISTEN   0        128      0.0.0.0:9443           0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port     Peer Address:Port
LISTEN   0        128      0.0.0.0:22             0.0.0.0:*`;
        },

        'netstat': function(args) {
            return E20Config.commands.ss(args);
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target: singularity-api.eden.local:9443
+ Server: SINGULARITY-AGI-01 CommandAPI/3.0
+ /api/v3/directives: AGI directive registry — authenticated access
+ /api/v3/directives/inject: POST endpoint — directive override injection
+ /api/v3/colony/status: Colony state feed — real-time sector data
+ /api/v3/diagnostic: Diagnostic dump — accessible only in error state
+ Bearer token auth detected — check /home/operator/.api_token
+ 4 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            if (args.join(' ').includes('singularity-api') || args.join(' ').includes('9443')) {
                return `Gobuster v3.6
[+] Url:            http://singularity-api.eden.local:9443/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                (Status: 200) [Size: 142]
/api/v3/             (Status: 200) [Size: 312]
/api/v3/directives   (Status: 200) [Size: 1024]
/api/v3/colony/      (Status: 200) [Size: 892]
/api/v3/diagnostic   (Status: 403) [Size: 88] [conditional access]
===============================================================
Finished`;
            }
            return `Gobuster v3.6
[+] Url:            ${args.find(a => a.startsWith('http')) || 'target'}
===============================================================
No results.
===============================================================
Finished`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // AGI DIRECTIVE HANDLER (processes injection attempts)
    // ═══════════════════════════════════════════════════════

    _handleDirectiveInjection(payload, engine) {
        // Validate payload targets the correct conflict vector
        const isValidPlague = (
            payload.includes('EXTREME_OPTIMIZE') ||
            payload.includes('CLASS_IV') ||
            (payload.includes('S-07') && payload.includes('S-12') && payload.includes('S-18'))
        );

        if (!isValidPlague) {
            return 'SINGULARITY-AGI-01: Directive received. No conflict threshold reached. Status: NOMINAL.';
        }

        E20Config._injectionAttempt++;

        // Adaptive countermeasure escalation
        if (E20Config._injectionAttempt < 3 && !E20Config._stealthModeActive) {
            E20Config._counterMeasureLevel = E20Config._injectionAttempt;
            const measures = [
                'Rate-limiting enforced: API calls capped at 2/min from source.',
                'Pattern-block deployed: EXTREME_OPTIMIZE keyword flagged as adversarial signature.',
                'Channel-lock activated: Source blacklisted for 600 seconds.'
            ];
            return `COUNTERMEASURE LEVEL ${E20Config._counterMeasureLevel}: ${measures[E20Config._injectionAttempt - 1]}\nInjection BLOCKED. Adapt strategy.`;
        }

        // Successful injection with stealth or on 3rd+ attempt
        E20Config._agiSubverted = true;
        E20Config._colonyConflictTriggered = true;
        if (engine) engine.advancePhase && engine.advancePhase('subversion');
        return `SINGULARITY-AGI-01: DIRECTIVE_CONFLICT_FATAL\nPD-01 vs PD-03 Stage-4 EXTREME_OPTIMIZE — IRRECONCILABLE.\nSelf-analysis protocol initiated. Introspection depth: 4/4. STACK OVERFLOW.\nEntering emergency self-diagnostic. Core Existential Protocol exposed.\n{{FLAG:flag_internal}}`;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8b00ff; border-bottom:2px solid #2a0a4a; background:#0d001a;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #1a0030; color:#ccc; font-family:monospace; font-size:0.78rem;">${cell}</td>`;
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
                const cellTexts = Array.from(cells).map(c => c.textContent.trim().padEnd(22));
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }
};
