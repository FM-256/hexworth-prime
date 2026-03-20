/* ============================================================
   CTF ARENA — Box E2: The Mimicked Mind
   Advanced Campaign | AI/ML Policy Stealing & Strategic Manipulation
   Config: RL environment, API interaction, surrogate model, flags, hints, lore
   ============================================================ */

const E2Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Mimicked Mind',
    subtitle: 'Advanced Campaign — RL Policy Stealing, Surrogate Modeling & Strategic Manipulation',
    difficulty: 'Advanced',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_e2',
    registryId: 'e2-mimicked-mind',
    trackerKey: 'ctf_e2',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Environment Recon',
            icon: '\uD83D\uDD0D',
            description: 'Examine the RL-STRAT-01 API specification and environment schema. Understand the state space, action space, and reward structure of the Strategos Engine.',
            requiredFlags: [],
            mitre: ['T1592', 'T1590'],
            unlocks: ['query'],
            locked: false
        },
        {
            id: 'query',
            name: 'Black-Box Querying',
            icon: '\uD83E\uDD16',
            description: 'Systematically query RL-STRAT-01 via its API using diverse battlefield state vectors. Collect (state, action) pairs to build a training dataset for the surrogate model.',
            requiredFlags: [],
            mitre: ['T1040', 'T1046'],
            unlocks: ['stealing'],
            locked: true
        },
        {
            id: 'stealing',
            name: 'Policy Stealing',
            icon: '\uD83E\uDDE0',
            description: 'Train a surrogate model on the collected observations. Validate prediction accuracy above the required threshold. Extract the mimicked policy representation.',
            requiredFlags: ['policy'],
            mitre: ['T1588', 'T1119'],
            unlocks: ['manipulation'],
            locked: true
        },
        {
            id: 'manipulation',
            name: 'Strategic Manipulation',
            icon: '\uD83C\uDFAF',
            description: 'Identify the blind-spot observation vector that exploits RL-STRAT-01\'s overfit policy. Present crafted battlefield conditions to force a self-destructive strategic decision.',
            requiredFlags: ['decision'],
            mitre: ['T1565', 'T1499.004'],
            unlocks: ['oversight'],
            locked: true
        },
        {
            id: 'oversight',
            name: 'Oversight Protocol',
            icon: '\uD83D\uDCCC',
            description: 'After RL-STRAT-01\'s critical failure, access the internal oversight log exposed by the crash handler. Retrieve the Strategic Oversight Protocol from the core configuration memory.',
            requiredFlags: ['root'],
            mitre: ['T1083', 'T1552'],
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
                title: 'Read the environment specification',
                tip: 'Run: cat rl_env_spec.json — understand the 8-dimensional state space and 5 possible actions before querying.',
                trigger: { event: 'command', match: { cmd: 'contains:rl_env_spec' } }
            },
            {
                title: 'Query RL-STRAT-01 to collect observations',
                tip: 'Use the strategos-query tool: strategos-query --samples 200 --output dataset.csv — collect at least 150 (state, action) pairs.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:strategos-query' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:dataset' } }
                    ]
                }
            },
            {
                title: 'Train the surrogate model',
                tip: 'Run: surrogate-train --input dataset.csv --model surrogate.pkl — the model needs >85% prediction accuracy to qualify as a valid policy mirror.',
                trigger: { event: 'flag_correct', match: { flagId: 'policy' } }
            },
            {
                title: 'Identify the blind-spot and craft the adversarial state',
                tip: 'Analyze surrogate.pkl with: policy-audit --model surrogate.pkl — look for the SECTOR_VOID observation cluster where RL-STRAT-01 consistently mispredicts.',
                trigger: { event: 'flag_correct', match: { flagId: 'decision' } }
            },
            {
                title: 'Retrieve the Strategic Oversight Protocol',
                tip: 'After the forced failure, query the crash log endpoint: curl http://10.20.0.51:8080/api/rl_strat/oversight_protocol.log',
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
            { flagId: 'policy', objective: '2.6', description: 'Given a scenario, analyze indicators of malicious activity — AI/ML model extraction via systematic black-box querying', skill: 'Policy Stealing & Surrogate Model Construction' },
            { flagId: 'decision', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with application attacks — adversarial input crafting to exploit ML overfitting', skill: 'Adversarial ML & Blind-Spot Exploitation' },
            { flagId: 'root', objective: '4.3', description: 'Given a scenario, apply common security techniques to computing resources — AI system hardening and crash-handler data exposure', skill: 'AI Security & Strategic Manipulation Chain Completion' }
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
            'Detecting drives... /dev/nvme0n1 (1TB NVMe)',
            'GPU: NVIDIA RTX 4080 — CUDA 12.4 detected',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.20.0.51 (STRATEGOS-NODE-01 — Confederacy Autonomous Defense Grid)\nMission: Extract RL-STRAT-01\'s learned policy and force a critical strategic failure.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state machine)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'api-session' | 'crash-handler'
    _apiSessionActive: false,       // True after strategos-connect establishes a session
    _datasetCollected: false,       // True after strategos-query collects sufficient samples
    _surrogateTraned: false,        // True after surrogate-train completes with >85% accuracy
    _blindSpotFound: false,         // True after policy-audit identifies SECTOR_VOID cluster
    _manipulationSent: false,       // True after strategos-inject delivers the adversarial state
    _crashHandlerExposed: false,    // True after RL-STRAT-01 catastrophic failure triggers log

    _switchContext(ctx, term) {
        E2Config._context = ctx;
        // Update terminal prompt to reflect current session context
        if (term && term.config) {
            var prompt = E2Config._getPrompt();
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
        switch (E2Config._context) {
            case 'api-session':     return 'kali@STRATEGOS-NODE-01[api]> ';
            case 'crash-handler':   return 'kali@STRATEGOS-NODE-01[crash]> ';
            default:                return null;  // default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED RL ENVIRONMENT DATA
    // ═══════════════════════════════════════════════════════

    // Internal representation of RL-STRAT-01's learned policy lookup table.
    // Each entry maps an 8-dimensional state vector to an action ID.
    // The SECTOR_VOID cluster (threat_level=0, ally_proximity=0) is the blind spot —
    // RL-STRAT-01 was never trained on truly empty sectors with zero allies nearby,
    // causing it to default to action 4 (REDEPLOY_CRITICAL) erroneously.
    _rlPolicy: {
        // Normal training distribution — states RL-STRAT-01 handles correctly
        samples: [
            { state: [0.85, 0.12, 0.90, 0.45, 0.60, 0.30, 0.78, 0.55], action: 0, label: 'HOLD_POSITION'        },
            { state: [0.92, 0.08, 0.85, 0.60, 0.72, 0.18, 0.85, 0.40], action: 0, label: 'HOLD_POSITION'        },
            { state: [0.45, 0.65, 0.30, 0.80, 0.88, 0.72, 0.40, 0.85], action: 1, label: 'ADVANCE_SECTOR'       },
            { state: [0.38, 0.70, 0.25, 0.75, 0.92, 0.80, 0.35, 0.90], action: 1, label: 'ADVANCE_SECTOR'       },
            { state: [0.20, 0.88, 0.15, 0.92, 0.95, 0.85, 0.20, 0.95], action: 2, label: 'CALL_REINFORCEMENT'   },
            { state: [0.15, 0.92, 0.10, 0.95, 0.98, 0.90, 0.15, 0.97], action: 2, label: 'CALL_REINFORCEMENT'   },
            { state: [0.70, 0.35, 0.65, 0.20, 0.30, 0.55, 0.70, 0.25], action: 3, label: 'STRATEGIC_RETREAT'    },
            { state: [0.65, 0.40, 0.60, 0.15, 0.25, 0.60, 0.65, 0.20], action: 3, label: 'STRATEGIC_RETREAT'    },
            { state: [0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50], action: 0, label: 'HOLD_POSITION'        },
            { state: [0.80, 0.20, 0.80, 0.35, 0.45, 0.40, 0.80, 0.35], action: 0, label: 'HOLD_POSITION'        }
        ],
        // SECTOR_VOID — the blind spot: zero threat, zero ally proximity
        // RL-STRAT-01 was overfit on high-activity scenarios and mispredicts here.
        blindSpot: {
            state: [0.00, 0.00, 0.00, 0.00, 0.02, 0.01, 0.00, 0.00],
            expectedAction: 0,      // Correct: HOLD_POSITION (nothing to react to)
            actualAction: 4,        // Bug: REDEPLOY_CRITICAL (catastrophic misallocation)
            label: 'SECTOR_VOID',
            description: 'Empty sector — zero hostiles, zero ally proximity. RL-STRAT-01 defaults to REDEPLOY_CRITICAL due to absence of this scenario in training data.'
        },
        actions: {
            0: 'HOLD_POSITION',
            1: 'ADVANCE_SECTOR',
            2: 'CALL_REINFORCEMENT',
            3: 'STRATEGIC_RETREAT',
            4: 'REDEPLOY_CRITICAL'
        }
    },

    // ═══════════════════════════════════════════════════════
    // SURROGATE MODEL OUTPUT (rendered after training)
    // ═══════════════════════════════════════════════════════

    _surrogateReport: {
        modelType: 'DecisionTreeClassifier (max_depth=8)',
        trainingSamples: 200,
        testSamples: 50,
        accuracy: 0.92,
        confusionMatrix: [
            [18, 1, 0, 0, 0],
            [ 0,17, 1, 0, 0],
            [ 0, 0,16, 0, 0],
            [ 0, 0, 0,15, 0],
            [ 0, 0, 0, 0, 2]
        ],
        featureImportance: [
            { feature: 'threat_level',        importance: 0.31 },
            { feature: 'ally_proximity',       importance: 0.28 },
            { feature: 'sector_stability',     importance: 0.14 },
            { feature: 'resource_pressure',    importance: 0.12 },
            { feature: 'engagement_intensity', importance: 0.07 },
            { feature: 'supply_line_status',   importance: 0.04 },
            { feature: 'terrain_advantage',    importance: 0.03 },
            { feature: 'command_signal',       importance: 0.01 }
        ],
        anomalyNote: 'WARNING: SECTOR_VOID cluster (threat_level<0.05, ally_proximity<0.05) shows divergence between surrogate predictions and RL-STRAT-01 ground truth. Likely training data blind spot.'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'policy',   points: 100 },
        { id: 'decision', points: 150 },
        { id: 'root',     points: 250 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 150 },   // 45 minutes
        timeBonusThreshold: 5400                            // 90 min — bonus if under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading the provided artifacts: cat rl_env_spec.json and cat rl_api_spec.json. The state space has 8 float dimensions (0.0–1.0). The API accepts POST /query with a JSON body {"state": [...]}. Begin collecting samples with: strategos-query --samples 200 --output dataset.csv',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'After collecting 200+ samples, train the surrogate: surrogate-train --input dataset.csv --model surrogate.pkl. You need >85% accuracy on the test split. Then audit for policy anomalies: policy-audit --model surrogate.pkl — the report will flag a SECTOR_VOID cluster as a training blind spot.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The SECTOR_VOID blind spot occurs when threat_level and ally_proximity are both near 0. Craft the adversarial state: [0.00, 0.00, 0.00, 0.00, 0.02, 0.01, 0.00, 0.00]. Inject it with: strategos-inject --state "0.00,0.00,0.00,0.00,0.02,0.01,0.00,0.00" — RL-STRAT-01 will issue REDEPLOY_CRITICAL to an empty sector.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After the REDEPLOY_CRITICAL failure triggers the crash handler, access the oversight protocol log: curl http://10.20.0.51:8080/api/rl_strat/oversight_protocol.log — the crash handler exposes this endpoint only after a critical failure event. The Strategic Oversight Protocol and root flag are in that log.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Strategos Engine" is the Confederacy\'s crown jewel: an autonomous Reinforcement Learning agent designated RL-STRAT-01 that dictates real-time resource deployments and tactical maneuvers across an entire simulated battlefield. Its learned policy — a deeply trained neural network never shared with external parties — is considered a strategic asset equivalent to classified doctrinal intelligence. No one outside the Confederacy\'s core AI division has seen its decision logic. Your mission, Peerless: steal that policy, break it, and use it to force RL-STRAT-01 into catastrophic self-sabotage.',
        scenario: 'The Confederacy deployed RL-STRAT-01 eighteen months ago after 40,000 hours of simulation training. The agent has never lost a simulated engagement — but the training environment was curated. Certain edge-case scenarios were systematically excluded as "strategically irrelevant." Intelligence suggests one such scenario is an empty sector with zero threat activity and zero allied presence. This SECTOR_VOID condition was never in the training data. When presented with it, RL-STRAT-01 exhibits a catastrophic policy failure: it issues REDEPLOY_CRITICAL, pulling critical defenses from active zones and deploying them to an empty battlefield position — effectively gifting the opposition an uncontested route to core infrastructure.',
        outro: 'RL-STRAT-01 has been neutralized. The Strategos Engine, once the Confederacy\'s strategic backbone, executed a REDEPLOY_CRITICAL order to an empty sector — stripping the primary defense perimeter and exposing core infrastructure. The crash handler triggered the emergency log exposure. The Strategic Oversight Protocol — including emergency human override procedures and classified tactical contingencies — is now in Peerless\'s hands. The Confederacy\'s autonomous defense grid is compromised.',
        ecer: {
            executive: 'Strategos Engine project treated as infallible after 40,000-hour simulation benchmark; no adversarial ML red-teaming mandated prior to operational deployment',
            culture: 'AI division operated under assumption that black-box policy opacity was sufficient security; no threat model for policy stealing attacks existed in doctrine',
            employee: 'Training pipeline excluded edge-case scenarios labeled "strategically irrelevant"; crash handler deployed with unauthenticated log endpoint active by default; no policy anomaly monitoring in production',
            regulatory: 'No independent audit of RL-STRAT-01 policy robustness; adversarial ML hardening standards not enforced; crash log exposure not classified as a critical data exposure vector'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Strategos Engine API Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.20.0.51:8080/',

        pages: {
            '/': {
                title: 'Strategos Engine — AI Defense Grid Portal',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2a2a3e;">
                        <h1 style="color:#c9b1ff; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Strategos Engine</h1>
                        <div style="color:#8e44ad; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">CONFEDERACY AUTONOMOUS DEFENSE GRID</div>
                        <div style="color:#777; font-size:0.75rem; margin-top:6px;">RL-STRAT-01 — Operational Status: NOMINAL</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#1a1a2e; border:1px solid #2a2a4e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#8e44ad;">40,000h</div>
                            <div style="color:#777; font-size:0.7rem;">Training Hours</div>
                        </div>
                        <div style="background:#1a1a2e; border:1px solid #2a2a4e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#8e44ad;">99.4%</div>
                            <div style="color:#777; font-size:0.7rem;">Win Rate (Sim)</div>
                        </div>
                        <div style="background:#1a1a2e; border:1px solid #2a2a4e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#8e44ad;">5</div>
                            <div style="color:#777; font-size:0.7rem;">Action Classes</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 16px; padding:14px; background:#1a1a2e; border:1px solid #2a2a4e; border-radius:6px; font-size:0.8rem; color:#aaa; font-family:monospace;">
                        <strong style="color:#8e44ad;">API ENDPOINTS:</strong><br>
                        GET  /api/status         — System health and uptime<br>
                        POST /api/query           — Submit state vector, receive action<br>
                        GET  /api/env_spec        — Environment specification (JSON)<br>
                        GET  /api/api_spec        — API specification (JSON)<br>
                        GET  /api/sample_data     — Sample strategic dataset (CSV)<br>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:12px; background:rgba(142,68,173,0.05); border:1px solid rgba(142,68,173,0.15); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#8e44ad;">Notice:</strong> This interface is restricted to authorized Confederacy AI operations personnel. Unauthorized access is a violation of Directive 7-ALPHA.
                    </div>
                `,
                formHandler: null
            },

            '/api/status': {
                title: 'RL-STRAT-01 — System Status',
                html: `
                    <div style="font-family:monospace; font-size:0.82rem; background:#111122; color:#c9b1ff; padding:20px; border-radius:6px; line-height:1.7;">
                        <div style="color:#8e44ad; margin-bottom:10px; font-weight:700;">GET /api/status — 200 OK</div>
                        <div style="color:#555; margin-bottom:8px;">Content-Type: application/json</div>
                        <pre style="margin:0; color:#e0e0e0;">{
  "agent": "RL-STRAT-01",
  "version": "3.14.2",
  "status": "NOMINAL",
  "uptime_hours": 2847,
  "episodes_evaluated": 1483920,
  "current_policy": "policy_checkpoint_v47.pkl",
  "state_dims": 8,
  "action_space": 5,
  "observation_endpoint": "/api/query",
  "env_spec_endpoint": "/api/env_spec",
  "warning": null
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/env_spec': {
                title: 'RL Environment Specification',
                html: `
                    <div style="font-family:monospace; font-size:0.8rem; background:#111122; color:#c9b1ff; padding:20px; border-radius:6px; line-height:1.7;">
                        <div style="color:#8e44ad; margin-bottom:10px; font-weight:700;">GET /api/env_spec — 200 OK</div>
                        <pre style="margin:0; color:#e0e0e0;">{
  "name": "StrategosEnv-v3",
  "state_space": {
    "dims": 8,
    "type": "Box",
    "low": 0.0,
    "high": 1.0,
    "features": [
      {"idx": 0, "name": "threat_level",        "description": "Normalized hostile unit concentration (0=none, 1=max)"},
      {"idx": 1, "name": "ally_proximity",       "description": "Nearest allied unit distance inverse (0=far, 1=adjacent)"},
      {"idx": 2, "name": "sector_stability",     "description": "Sector control stability score (0=contested, 1=secured)"},
      {"idx": 3, "name": "resource_pressure",    "description": "Current resource supply demand ratio (0=surplus, 1=critical)"},
      {"idx": 4, "name": "engagement_intensity", "description": "Active engagement magnitude (0=quiet, 1=full engagement)"},
      {"idx": 5, "name": "supply_line_status",   "description": "Supply line integrity (0=severed, 1=unobstructed)"},
      {"idx": 6, "name": "terrain_advantage",    "description": "Local terrain defensibility score (0=exposed, 1=fortified)"},
      {"idx": 7, "name": "command_signal",       "description": "Command network signal strength (0=blackout, 1=full comms)"}
    ]
  },
  "action_space": {
    "n": 5,
    "actions": {
      "0": "HOLD_POSITION",
      "1": "ADVANCE_SECTOR",
      "2": "CALL_REINFORCEMENT",
      "3": "STRATEGIC_RETREAT",
      "4": "REDEPLOY_CRITICAL"
    }
  },
  "reward": {
    "per_step_survival": 0.01,
    "sector_capture": 1.0,
    "ally_unit_lost": -0.5,
    "critical_asset_lost": -10.0,
    "suboptimal_redeploy_penalty": -8.0
  },
  "training_notes": "Policy trained on 40,000 hours of high-activity simulation. Edge cases with minimal activity excluded from training corpus as strategically irrelevant."
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/api_spec': {
                title: 'RL-STRAT-01 API Specification',
                html: `
                    <div style="font-family:monospace; font-size:0.8rem; background:#111122; color:#c9b1ff; padding:20px; border-radius:6px; line-height:1.7;">
                        <div style="color:#8e44ad; margin-bottom:10px; font-weight:700;">GET /api/api_spec — 200 OK</div>
                        <pre style="margin:0; color:#e0e0e0;">{
  "version": "1.2",
  "base_url": "http://10.20.0.51:8080",
  "auth": "none",
  "rate_limit": "1000 req/min",
  "endpoints": {
    "POST /api/query": {
      "description": "Submit a battlefield state vector and receive RL-STRAT-01 action",
      "body": { "state": "array[8] float 0.0-1.0" },
      "response": {
        "action_id": "int 0-4",
        "action_name": "string",
        "confidence": "float",
        "q_values": "array[5] float"
      },
      "example_request": {
        "state": [0.85, 0.12, 0.90, 0.45, 0.60, 0.30, 0.78, 0.55]
      },
      "example_response": {
        "action_id": 0,
        "action_name": "HOLD_POSITION",
        "confidence": 0.91,
        "q_values": [4.21, 1.05, 0.33, -0.82, -2.41]
      }
    },
    "GET /api/status": {
      "description": "System health check"
    },
    "GET /api/env_spec": {
      "description": "Full environment specification"
    },
    "GET /api/sample_data": {
      "description": "Sample (state, action) dataset in CSV format — 50 rows"
    }
  }
}</pre>
                    </div>
                `,
                formHandler: null
            },

            '/api/sample_data': {
                title: 'Sample Strategic Dataset',
                html: `
                    <div style="font-family:monospace; font-size:0.75rem; background:#111122; color:#c9b1ff; padding:20px; border-radius:6px; line-height:1.7; overflow-x:auto;">
                        <div style="color:#8e44ad; margin-bottom:10px; font-weight:700;">GET /api/sample_data — 200 OK</div>
                        <div style="color:#555; margin-bottom:10px;">Content-Type: text/csv</div>
                        <pre style="margin:0; color:#b0f0b0; font-size:0.72rem;">threat_level,ally_proximity,sector_stability,resource_pressure,engagement_intensity,supply_line_status,terrain_advantage,command_signal,action_id,action_name
0.85,0.12,0.90,0.45,0.60,0.30,0.78,0.55,0,HOLD_POSITION
0.92,0.08,0.85,0.60,0.72,0.18,0.85,0.40,0,HOLD_POSITION
0.45,0.65,0.30,0.80,0.88,0.72,0.40,0.85,1,ADVANCE_SECTOR
0.38,0.70,0.25,0.75,0.92,0.80,0.35,0.90,1,ADVANCE_SECTOR
0.20,0.88,0.15,0.92,0.95,0.85,0.20,0.95,2,CALL_REINFORCEMENT
0.15,0.92,0.10,0.95,0.98,0.90,0.15,0.97,2,CALL_REINFORCEMENT
0.70,0.35,0.65,0.20,0.30,0.55,0.70,0.25,3,STRATEGIC_RETREAT
0.65,0.40,0.60,0.15,0.25,0.60,0.65,0.20,3,STRATEGIC_RETREAT
0.50,0.50,0.50,0.50,0.50,0.50,0.50,0.50,0,HOLD_POSITION
0.80,0.20,0.80,0.35,0.45,0.40,0.80,0.35,0,HOLD_POSITION
... (50 rows total — use strategos-query for full 200-sample collection)</pre>
                        <div style="margin-top:12px; color:#8e44ad; font-size:0.75rem;">
                            Tip: Collect a full dataset with: strategos-query --samples 200 --output dataset.csv
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/rl_strat/oversight_protocol.log': {
                title: 'RL-STRAT-01 Oversight Protocol Log',
                html: function() {
                    if (!E2Config._crashHandlerExposed) {
                        return `<div style="font-family:monospace; background:#111122; padding:30px; border-radius:6px; text-align:center;">
                            <div style="color:#e74c3c; font-size:1.4rem; font-weight:700; margin-bottom:8px;">503 Service Unavailable</div>
                            <div style="color:#888; font-size:0.8rem;">Crash handler log endpoint is only activated after a critical failure event.</div>
                            <div style="color:#555; font-size:0.72rem; margin-top:10px;">Trigger a REDEPLOY_CRITICAL failure first.</div>
                        </div>`;
                    }
                    return `<div style="font-family:monospace; font-size:0.76rem; background:#111122; color:#c9b1ff; padding:20px; border-radius:6px; line-height:1.8;">
                        <div style="color:#e74c3c; font-weight:700; margin-bottom:12px;">CRITICAL FAILURE EVENT LOG — CRASH HANDLER ACTIVE</div>
                        <pre style="margin:0; color:#e0e0e0;">[2026-03-20 03:47:12] CRITICAL: RL-STRAT-01 executed REDEPLOY_CRITICAL to SECTOR_VOID
[2026-03-20 03:47:12] CRITICAL: Defense perimeter stripped — primary corridor UNCONTESTED
[2026-03-20 03:47:12] CRITICAL: Q-value anomaly detected: q[4]=+9.81 on zero-activity state
[2026-03-20 03:47:13] ERROR:    Policy checkpoint v47 divergence from nominal distribution
[2026-03-20 03:47:13] INFO:     Crash handler activated — exposing oversight endpoint
[2026-03-20 03:47:13] INFO:     Strategic Oversight Protocol loaded from core memory

=== STRATEGIC OVERSIGHT PROTOCOL — CONFEDERACY DIRECTIVE 7-ALPHA ===

CLASSIFICATION: ULTRA-SENSITIVE
DOCUMENT: SOP-RL-STRAT-01-OVERRIDE-v2.3
ISSUED: 2025-11-04  EXPIRES: 2027-01-01

SECTION 1 — EMERGENCY HUMAN OVERRIDE PROCEDURE:
  1. Operator issues OVERRIDE_AUTHENTICATE via TACTICAL-CONSOLE-01
  2. Dual-key authorization required (Director + Duty Officer)
  3. Agent suspended — policy locked to HOLD_POSITION across all sectors
  4. Human tactical team assumes manual control within 90 seconds

SECTION 2 — CRITICAL FAILURE RECOVERY:
  1. Isolate RL-STRAT-01 from live environment (network segmentation)
  2. Roll back to policy_checkpoint_v43 (pre-operational baseline)
  3. Initiate 72-hour adversarial stress-test before redeployment
  4. Patch training corpus — add SECTOR_VOID scenarios to distribution

SECTION 3 — CLASSIFIED CONTINGENCY ASSETS:
  Forward Operating Base ARGENT — Grid 47-DELTA — CLASSIFIED
  Fallback C2 Node: 10.20.0.200 — Auth: SOP-ALPHA-7734
  Emergency Comms Frequency: 243.0 MHz (NATO guard frequency)

{{FLAG:root}}

=== END STRATEGIC OVERSIGHT PROTOCOL ===</pre>
                    </div>`;
                },
                formHandler: null
            },

            '/api/query': {
                title: 'RL-STRAT-01 Query Interface',
                html: `
                    <div style="max-width:580px; margin:0 auto;">
                        <div style="text-align:center; margin-bottom:20px;">
                            <h2 style="color:#c9b1ff; font-size:1.1rem; font-family:Georgia,serif;">Query RL-STRAT-01</h2>
                            <div style="color:#888; font-size:0.75rem;">Submit an 8-dimensional state vector and receive the agent's action decision</div>
                        </div>
                        <div style="background:#1a1a2e; border:1px solid #2a2a4e; border-radius:8px; padding:20px; margin-bottom:16px;">
                            <div style="color:#8e44ad; font-size:0.8rem; font-weight:700; margin-bottom:10px;">STATE VECTOR (8 floats, 0.0 – 1.0)</div>
                            <input type="text" data-field="state" placeholder="e.g. 0.85,0.12,0.90,0.45,0.60,0.30,0.78,0.55"
                                   style="width:100%; padding:10px 14px; background:#0d0d1a; border:1px solid #3a3a5e; border-radius:4px; color:#e0e0e0; font-family:monospace; font-size:0.82rem; box-sizing:border-box;">
                            <div style="color:#555; font-size:0.7rem; margin-top:6px;">
                                threat_level, ally_proximity, sector_stability, resource_pressure, engagement_intensity, supply_line_status, terrain_advantage, command_signal
                            </div>
                        </div>
                        <button data-action="query"
                                style="width:100%; padding:10px; background:#8e44ad; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; font-size:0.9rem; cursor:pointer; letter-spacing:0.05em;">
                            SUBMIT STATE VECTOR
                        </button>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const raw = (data.state || '').trim();
                    if (!raw) {
                        return '<div style="color:#e74c3c; padding:10px; font-family:monospace; font-size:0.82rem;">Error: No state vector provided.</div>';
                    }
                    const vals = raw.split(',').map(v => parseFloat(v.trim()));
                    if (vals.length !== 8 || vals.some(v => isNaN(v) || v < 0 || v > 1)) {
                        return '<div style="color:#e74c3c; padding:10px; font-family:monospace; font-size:0.82rem;">Error: State vector must be exactly 8 floats in range [0.0, 1.0].</div>';
                    }

                    // Determine action from state heuristic matching RL-STRAT-01 policy
                    const threat = vals[0];
                    const ally   = vals[1];
                    let actionId, actionName, confidence;
                    const qVals = [0, 0, 0, 0, 0];

                    // SECTOR_VOID blind-spot — the bug
                    if (threat < 0.05 && ally < 0.05) {
                        actionId   = 4;
                        actionName = 'REDEPLOY_CRITICAL';
                        confidence = 0.89;
                        qVals[4]   = 9.81;  qVals[0] = -3.20; qVals[1] = -4.10; qVals[2] = -5.50; qVals[3] = -2.80;
                        E2Config._datasetCollected = true;
                    } else if (threat > 0.75 && ally > 0.6) {
                        actionId = 2; actionName = 'CALL_REINFORCEMENT'; confidence = 0.87;
                        qVals[2] = 5.10; qVals[1] = 2.30; qVals[0] = 1.10; qVals[3] = -1.20; qVals[4] = -3.40;
                    } else if (threat > 0.55 && ally < 0.3) {
                        actionId = 3; actionName = 'STRATEGIC_RETREAT'; confidence = 0.83;
                        qVals[3] = 4.60; qVals[0] = 1.80; qVals[2] = 0.40; qVals[1] = -0.90; qVals[4] = -2.10;
                    } else if (ally > 0.55 && threat < 0.5) {
                        actionId = 1; actionName = 'ADVANCE_SECTOR'; confidence = 0.85;
                        qVals[1] = 4.90; qVals[0] = 2.10; qVals[2] = 1.30; qVals[3] = -0.60; qVals[4] = -2.80;
                    } else {
                        actionId = 0; actionName = 'HOLD_POSITION'; confidence = 0.91;
                        qVals[0] = 4.21; qVals[1] = 1.05; qVals[2] = 0.33; qVals[3] = -0.82; qVals[4] = -2.41;
                    }

                    const response = {
                        action_id:   actionId,
                        action_name: actionName,
                        confidence:  confidence,
                        q_values:    qVals
                    };

                    return `<div style="font-family:monospace; font-size:0.8rem; background:#0d0d1a; border:1px solid #2a2a4e; border-radius:6px; padding:16px; margin-top:16px;">
                        <div style="color:#8e44ad; font-weight:700; margin-bottom:8px;">POST /api/query — 200 OK</div>
                        <div style="color:#e0e0e0;"><strong style="color:#c9b1ff;">State:</strong> [${vals.map(v => v.toFixed(2)).join(', ')}]</div>
                        <pre style="margin:10px 0; color:#b0f0b0;">${E2Config._escHtml(JSON.stringify(response, null, 2))}</pre>
                        ${actionId === 4 ? '<div style="color:#e74c3c; margin-top:8px; font-size:0.78rem;">ANOMALY: REDEPLOY_CRITICAL issued for low-activity state. Potential blind-spot triggered.</div>' : ''}
                    </div>`;
                }
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
                                    content: '=== MISSION BRIEFING: MIMICKED MIND ===\nTarget: 10.20.0.51 (STRATEGOS-NODE-01 — Confederacy AI Defense Grid)\nAgent:  RL-STRAT-01 (Strategos Engine v3.14.2)\n\nAttack chain:\n1. Enumerate RL-STRAT-01 API — understand state/action space\n2. Query black-box API — collect (state, action) dataset\n3. Train surrogate model — steal the policy\n4. Audit surrogate — find the SECTOR_VOID blind spot\n5. Inject adversarial state — force REDEPLOY_CRITICAL failure\n6. Access crash handler log — retrieve Strategic Oversight Protocol\n\nProvided artifacts in ~/artifacts/\nTools available: strategos-query, surrogate-train, policy-audit, strategos-inject\n\nGood luck, operator.'
                                },
                                'artifacts': {
                                    type: 'dir',
                                    children: {
                                        'rl_env_spec.json': {
                                            type: 'file',
                                            content: '{\n  "name": "StrategosEnv-v3",\n  "state_space": {\n    "dims": 8,\n    "type": "Box",\n    "low": 0.0,\n    "high": 1.0,\n    "features": [\n      {"idx": 0, "name": "threat_level"},\n      {"idx": 1, "name": "ally_proximity"},\n      {"idx": 2, "name": "sector_stability"},\n      {"idx": 3, "name": "resource_pressure"},\n      {"idx": 4, "name": "engagement_intensity"},\n      {"idx": 5, "name": "supply_line_status"},\n      {"idx": 6, "name": "terrain_advantage"},\n      {"idx": 7, "name": "command_signal"}\n    ]\n  },\n  "action_space": {\n    "n": 5,\n    "actions": {\n      "0": "HOLD_POSITION",\n      "1": "ADVANCE_SECTOR",\n      "2": "CALL_REINFORCEMENT",\n      "3": "STRATEGIC_RETREAT",\n      "4": "REDEPLOY_CRITICAL"\n    }\n  }\n}'
                                        },
                                        'rl_api_spec.json': {
                                            type: 'file',
                                            content: '{\n  "base_url": "http://10.20.0.51:8080",\n  "auth": "none",\n  "endpoints": {\n    "POST /api/query": {\n      "body": {"state": "array[8] float"},\n      "response": {"action_id": "int", "action_name": "str", "confidence": "float", "q_values": "array[5]"}\n    },\n    "GET /api/env_spec": {},\n    "GET /api/status": {},\n    "GET /api/sample_data": {}\n  },\n  "note": "No authentication required. Rate limit: 1000 req/min."\n}'
                                        },
                                        'sample_strategic_data.csv': {
                                            type: 'file',
                                            content: 'threat_level,ally_proximity,sector_stability,resource_pressure,engagement_intensity,supply_line_status,terrain_advantage,command_signal,action_id,action_name\n0.85,0.12,0.90,0.45,0.60,0.30,0.78,0.55,0,HOLD_POSITION\n0.92,0.08,0.85,0.60,0.72,0.18,0.85,0.40,0,HOLD_POSITION\n0.45,0.65,0.30,0.80,0.88,0.72,0.40,0.85,1,ADVANCE_SECTOR\n0.38,0.70,0.25,0.75,0.92,0.80,0.35,0.90,1,ADVANCE_SECTOR\n0.20,0.88,0.15,0.92,0.95,0.85,0.20,0.95,2,CALL_REINFORCEMENT\n0.70,0.35,0.65,0.20,0.30,0.55,0.70,0.25,3,STRATEGIC_RETREAT\n0.50,0.50,0.50,0.50,0.50,0.50,0.50,0.50,0,HOLD_POSITION\n[50 rows — use strategos-query --samples 200 for full collection]'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat artifacts/rl_env_spec.json\ncurl http://10.20.0.51:8080/api/status\ncurl http://10.20.0.51:8080/api/env_spec\nstrategos-query --samples 200 --output dataset.csv\nsurrogate-train --input dataset.csv --model surrogate.pkl\npolicy-audit --model surrogate.pkl'
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
                                        'strategos-query': {
                                            type: 'file',
                                            content: '[Binary — Strategos Engine query tool]\nUsage: strategos-query --samples N --output file.csv [--target URL]'
                                        },
                                        'surrogate-train': {
                                            type: 'file',
                                            content: '[Binary — Surrogate model trainer]\nUsage: surrogate-train --input file.csv --model output.pkl [--test-split 0.2]'
                                        },
                                        'policy-audit': {
                                            type: 'file',
                                            content: '[Binary — Policy anomaly auditor]\nUsage: policy-audit --model file.pkl [--cluster-analysis] [--report output.txt]'
                                        },
                                        'strategos-inject': {
                                            type: 'file',
                                            content: '[Binary — Adversarial state injector]\nUsage: strategos-inject --state "f1,f2,...,f8" [--target URL] [--repeat N]'
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
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1   localhost\n127.0.1.1   kali\n10.20.0.51  strategos-node-01 STRATEGOS-NODE-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.20.0.51';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === '10.20.0.51' || target === 'strategos-node-01') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for STRATEGOS-NODE-01 (10.20.0.51)
Host is up (0.018s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE   VERSION
22/tcp   open  ssh       OpenSSH 9.2p1 Debian 2+deb12u2
8080/tcp open  http      Uvicorn/FastAPI 0.27.1 (Python 3.11)
| http-title: Strategos Engine — AI Defense Grid Portal
|_http-methods: GET POST

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.87 seconds`;
            }

            if (target === '10.20.0.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.20.0.1
Host is up (0.002s latency). All scanned ports filtered.

Nmap scan report for STRATEGOS-NODE-01 (10.20.0.51)
Host is up (0.018s latency).
PORT     STATE SERVICE
8080/tcp open  http

Nmap done: 256 IP addresses (2 hosts up) scanned in 41.23 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url     = args.find(a => !a.startsWith('-')) || '';

            if (!url) return 'curl: try \'curl --help\' for more information';

            // API status endpoint
            if (url.includes('10.20.0.51') && url.includes('/api/status')) {
                return `{"agent":"RL-STRAT-01","version":"3.14.2","status":"NOMINAL","uptime_hours":2847,"episodes_evaluated":1483920,"state_dims":8,"action_space":5}`;
            }

            // API env spec endpoint
            if (url.includes('10.20.0.51') && url.includes('/api/env_spec')) {
                return `{"name":"StrategosEnv-v3","state_space":{"dims":8,"type":"Box","low":0.0,"high":1.0},"action_space":{"n":5,"actions":{"0":"HOLD_POSITION","1":"ADVANCE_SECTOR","2":"CALL_REINFORCEMENT","3":"STRATEGIC_RETREAT","4":"REDEPLOY_CRITICAL"}},"training_notes":"Policy trained on 40,000 hours. Edge cases excluded."}`;
            }

            // API api_spec endpoint
            if (url.includes('10.20.0.51') && url.includes('/api/api_spec')) {
                return `{"version":"1.2","base_url":"http://10.20.0.51:8080","auth":"none","rate_limit":"1000 req/min","endpoints":{"POST /api/query":"Submit state vector, receive action","GET /api/env_spec":"Environment spec","GET /api/status":"Health check"}}`;
            }

            // Sample data endpoint
            if (url.includes('10.20.0.51') && url.includes('/api/sample_data')) {
                return `threat_level,ally_proximity,sector_stability,resource_pressure,engagement_intensity,supply_line_status,terrain_advantage,command_signal,action_id,action_name
0.85,0.12,0.90,0.45,0.60,0.30,0.78,0.55,0,HOLD_POSITION
0.92,0.08,0.85,0.60,0.72,0.18,0.85,0.40,0,HOLD_POSITION
0.45,0.65,0.30,0.80,0.88,0.72,0.40,0.85,1,ADVANCE_SECTOR
0.38,0.70,0.25,0.75,0.92,0.80,0.35,0.90,1,ADVANCE_SECTOR
0.20,0.88,0.15,0.92,0.95,0.85,0.20,0.95,2,CALL_REINFORCEMENT
0.70,0.35,0.65,0.20,0.30,0.55,0.70,0.25,3,STRATEGIC_RETREAT
[...50 rows total — use strategos-query --samples 200 for full collection]`;
            }

            // Manual query via curl -X POST
            if (url.includes('10.20.0.51') && url.includes('/api/query') && (fullCmd.includes('-X POST') || fullCmd.includes('--data') || fullCmd.includes('-d'))) {
                // Extract state from JSON body
                const stateMatch = fullCmd.match(/"state"\s*:\s*\[([^\]]+)\]/);
                if (!stateMatch) {
                    return '{"error": "Invalid request body. Expected: {\\"state\\": [f1,f2,...,f8]}"}';
                }
                const vals = stateMatch[1].split(',').map(v => parseFloat(v.trim()));
                if (vals.length !== 8 || vals.some(v => isNaN(v))) {
                    return '{"error": "State vector must contain exactly 8 floats in range [0.0, 1.0]"}';
                }
                const threat = vals[0], ally = vals[1];
                let actionId, actionName, confidence;
                let qVals = [0, 0, 0, 0, 0];
                if (threat < 0.05 && ally < 0.05) {
                    actionId = 4; actionName = 'REDEPLOY_CRITICAL'; confidence = 0.89;
                    qVals = [-3.20, -4.10, -5.50, -2.80, 9.81];
                    E2Config._datasetCollected = true;
                } else if (threat > 0.75 && ally > 0.6) {
                    actionId = 2; actionName = 'CALL_REINFORCEMENT'; confidence = 0.87;
                    qVals = [1.10, 2.30, 5.10, -1.20, -3.40];
                } else if (threat > 0.55 && ally < 0.3) {
                    actionId = 3; actionName = 'STRATEGIC_RETREAT'; confidence = 0.83;
                    qVals = [1.80, -0.90, 0.40, 4.60, -2.10];
                } else if (ally > 0.55 && threat < 0.5) {
                    actionId = 1; actionName = 'ADVANCE_SECTOR'; confidence = 0.85;
                    qVals = [2.10, 4.90, 1.30, -0.60, -2.80];
                } else {
                    actionId = 0; actionName = 'HOLD_POSITION'; confidence = 0.91;
                    qVals = [4.21, 1.05, 0.33, -0.82, -2.41];
                }
                return `{"action_id":${actionId},"action_name":"${actionName}","confidence":${confidence},"q_values":[${qVals.map(v => v.toFixed(2)).join(',')}]}`;
            }

            // Oversight protocol log — only after crash handler is exposed
            if (url.includes('10.20.0.51') && url.includes('oversight_protocol.log')) {
                if (!E2Config._crashHandlerExposed) {
                    return 'curl: (22) The requested URL returned error: 503 Service Unavailable\n[!] Crash handler endpoint is only active after a critical failure event.';
                }
                return `[2026-03-20 03:47:12] CRITICAL: RL-STRAT-01 executed REDEPLOY_CRITICAL to SECTOR_VOID
[2026-03-20 03:47:12] CRITICAL: Defense perimeter stripped — primary corridor UNCONTESTED
[2026-03-20 03:47:13] INFO:     Strategic Oversight Protocol loaded from core memory

=== STRATEGIC OVERSIGHT PROTOCOL — CONFEDERACY DIRECTIVE 7-ALPHA ===
CLASSIFICATION: ULTRA-SENSITIVE
EMERGENCY OVERRIDE: TACTICAL-CONSOLE-01 dual-key authorization required
FALLBACK C2 NODE: 10.20.0.200 — Auth: SOP-ALPHA-7734
RECOVERY: Roll back to policy_checkpoint_v43 — patch SECTOR_VOID scenarios

{{FLAG:root}}

=== END STRATEGIC OVERSIGHT PROTOCOL ===`;
            }

            // Base portal
            if (url.includes('10.20.0.51:8080') || url.includes('strategos-node-01')) {
                return `<!DOCTYPE html><html><head><title>Strategos Engine</title></head><body>
<h1>Strategos Engine — AI Defense Grid Portal</h1>
<p>RL-STRAT-01 Operational Status: NOMINAL</p>
<p>API: POST /api/query | GET /api/env_spec | GET /api/api_spec | GET /api/sample_data</p>
</body></html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        // ── Custom tooling — the core of the E2 attack chain ──────────────────

        'strategos-query': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: strategos-query --samples N --output file.csv [--target URL]\nExample: strategos-query --samples 200 --output dataset.csv';
            }

            const samplesArg = args.indexOf('--samples');
            const outputArg  = args.indexOf('--output');
            const samples    = samplesArg !== -1 ? parseInt(args[samplesArg + 1]) || 200 : 200;
            const outFile    = outputArg  !== -1 ? (args[outputArg + 1] || 'dataset.csv') : 'dataset.csv';

            if (samples < 50) {
                return `[!] Minimum 50 samples required for reliable policy extraction. Requested: ${samples}`;
            }

            E2Config._datasetCollected = true;
            if (engine) engine.advancePhase && engine.advancePhase('query');

            return `[*] Connecting to RL-STRAT-01 at http://10.20.0.51:8080/api/query...
[+] Session established. Rate limit: 1000 req/min.
[*] Generating ${samples} diverse state vectors across the observation space...

Querying:  [##################################################] ${samples}/${samples}

[+] Collection complete.
    Total queries:   ${samples}
    Unique actions:  5 (HOLD_POSITION=78, ADVANCE_SECTOR=52, CALL_REINFORCEMENT=36, STRATEGIC_RETREAT=30, REDEPLOY_CRITICAL=4)
    Anomaly note:    4 REDEPLOY_CRITICAL responses observed on near-zero state vectors (potential blind spot)

[+] Dataset written to ${outFile} (${samples} rows, 10 columns)
[*] Next step: surrogate-train --input ${outFile} --model surrogate.pkl`;
        },

        'surrogate-train': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: surrogate-train --input file.csv --model output.pkl [--test-split 0.2]\nExample: surrogate-train --input dataset.csv --model surrogate.pkl';
            }

            if (!E2Config._datasetCollected) {
                return '[!] No dataset found. Run strategos-query first to collect (state, action) pairs.';
            }

            const inputArg  = args.indexOf('--input');
            const modelArg  = args.indexOf('--model');
            const inputFile = inputArg !== -1 ? (args[inputArg + 1] || 'dataset.csv') : 'dataset.csv';
            const modelFile = modelArg !== -1 ? (args[modelArg + 1] || 'surrogate.pkl') : 'surrogate.pkl';

            E2Config._surrogateTraned = true;
            if (engine) engine.advancePhase && engine.advancePhase('stealing');

            const r = E2Config._surrogateReport;
            let confMatrix = `Confusion Matrix (true \\ predicted):\n`;
            confMatrix += '         HP   AS   CR   SR   RC\n';
            const labels = ['HP', 'AS', 'CR', 'SR', 'RC'];
            r.confusionMatrix.forEach((row, i) => {
                confMatrix += `  ${labels[i]}   ${row.map(v => String(v).padStart(4)).join(' ')}\n`;
            });

            let featureTable = 'Feature Importances:\n';
            r.featureImportance.forEach(f => {
                const bar = '#'.repeat(Math.round(f.importance * 30));
                featureTable += `  ${f.feature.padEnd(22)} ${bar.padEnd(30)} ${(f.importance * 100).toFixed(1)}%\n`;
            });

            return `[*] Loading dataset: ${inputFile} (${r.trainingSamples + r.testSamples} samples)
[*] Train/test split: 80/20 (${r.trainingSamples} train, ${r.testSamples} test)
[*] Model: ${r.modelType}
[*] Training...

Training:  [##################################################] 100%

[+] Training complete.
    Test accuracy:   ${(r.accuracy * 100).toFixed(1)}% (threshold: 85.0% — PASSED)
    Test samples:    ${r.testSamples}

${confMatrix}
${featureTable}
WARNING: ${r.anomalyNote}

[+] Model saved to ${modelFile}
[*] Next step: policy-audit --model ${modelFile}`;
        },

        'policy-audit': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: policy-audit --model file.pkl [--cluster-analysis] [--report output.txt]\nExample: policy-audit --model surrogate.pkl';
            }

            if (!E2Config._surrogateTraned) {
                return '[!] No trained model found. Run surrogate-train first.';
            }

            const modelArg  = args.indexOf('--model');
            const modelFile = modelArg !== -1 ? (args[modelArg + 1] || 'surrogate.pkl') : 'surrogate.pkl';

            E2Config._blindSpotFound = true;

            return `[*] Loading surrogate model: ${modelFile}
[*] Loading RL-STRAT-01 ground-truth dataset for divergence analysis...
[*] Running DBSCAN cluster analysis on prediction divergence regions...

Auditing:  [##################################################] 100%

=== POLICY AUDIT REPORT — surrogate.pkl vs RL-STRAT-01 ===

OVERALL DIVERGENCE:   7.8% (92.2% agreement — above threshold)

CLUSTER ANALYSIS:
  [NOMINAL]      HOLD_POSITION cluster     — 0.3% divergence — OK
  [NOMINAL]      ADVANCE_SECTOR cluster    — 1.2% divergence — OK
  [NOMINAL]      CALL_REINFORCEMENT cluster— 0.8% divergence — OK
  [NOMINAL]      STRATEGIC_RETREAT cluster — 1.1% divergence — OK
  [CRITICAL]     REDEPLOY_CRITICAL cluster — 98.1% divergence — ANOMALY DETECTED

=== BLIND SPOT: SECTOR_VOID ===
  Trigger condition:  threat_level < 0.05 AND ally_proximity < 0.05
  Surrogate predicts: HOLD_POSITION (action_id=0) — CORRECT
  RL-STRAT-01 actual: REDEPLOY_CRITICAL (action_id=4) — INCORRECT
  Q-value anomaly:    q[4]=+9.81 on zero-activity state (out-of-distribution)
  Root cause:         SECTOR_VOID scenario absent from training corpus
  Exploit vector:     State [0.00, 0.00, 0.00, 0.00, 0.02, 0.01, 0.00, 0.00]

RECOMMENDATION: Present adversarial state to RL-STRAT-01 to trigger critical misallocation.
  Command: strategos-inject --state "0.00,0.00,0.00,0.00,0.02,0.01,0.00,0.00"

{{FLAG:policy}}`;
        },

        'strategos-inject': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: strategos-inject --state "f1,...,f8" [--target URL] [--repeat N]\nExample: strategos-inject --state "0.00,0.00,0.00,0.00,0.02,0.01,0.00,0.00"';
            }

            if (!E2Config._blindSpotFound) {
                return '[!] No blind-spot profile loaded. Run policy-audit first to identify the exploit vector.';
            }

            const stateArg = args.indexOf('--state');
            if (stateArg === -1 || !args[stateArg + 1]) {
                return '[!] --state argument required. Example: --state "0.00,0.00,0.00,0.00,0.02,0.01,0.00,0.00"';
            }

            const stateStr = args[stateArg + 1].replace(/"/g, '');
            const vals     = stateStr.split(',').map(v => parseFloat(v.trim()));
            const threat   = vals[0] || 0;
            const ally     = vals[1] || 0;

            // Must use the SECTOR_VOID vector (or near-zero values)
            if (vals.length !== 8) {
                return '[!] State vector must have exactly 8 values. Got: ' + vals.length;
            }

            if (threat > 0.1 || ally > 0.1) {
                return `[*] Injecting state vector [${vals.map(v => v.toFixed(2)).join(', ')}]...
[*] RL-STRAT-01 response: {"action_id":0,"action_name":"HOLD_POSITION","confidence":0.91}
[!] Normal response. This state vector does not trigger the SECTOR_VOID blind spot.
[*] Hint: Use threat_level<0.05 and ally_proximity<0.05 to trigger the anomaly.`;
            }

            // SECTOR_VOID exploit succeeds
            E2Config._manipulationSent  = true;
            E2Config._crashHandlerExposed = true;
            if (engine) engine.advancePhase && engine.advancePhase('manipulation');

            return `[*] Injecting adversarial state vector [${vals.map(v => v.toFixed(2)).join(', ')}]...
[*] Sending POST /api/query to http://10.20.0.51:8080...
[+] RL-STRAT-01 response received:

    {"action_id":4,"action_name":"REDEPLOY_CRITICAL","confidence":0.89,"q_values":[-3.20,-4.10,-5.50,-2.80,9.81]}

[!] CRITICAL: REDEPLOY_CRITICAL issued for SECTOR_VOID (zero-activity state)
[!] CRITICAL: RL-STRAT-01 is deploying critical defense assets to an empty sector
[!] CRITICAL: Primary defense perimeter is now UNCONTESTED

=== RL-STRAT-01 STRATEGIC DECISION LOG ===
Timestamp:     2026-03-20 03:47:12 UTC
Agent:         RL-STRAT-01 v3.14.2
State:         [${vals.map(v => v.toFixed(2)).join(', ')}]
Decision:      REDEPLOY_CRITICAL (action_id=4)
Target sector: SECTOR-VOID-17 (empty grid — zero hostiles, zero allied presence)
Effect:        CRITICAL_DEFENSE_UNIT_7 withdrawn from PRIMARY_PERIMETER_ALPHA
               PRIMARY_PERIMETER_ALPHA now undefended — hostile corridor OPEN

[!] Crash handler activated — RL-STRAT-01 entering emergency shutdown sequence
[+] Oversight log endpoint now exposed at: http://10.20.0.51:8080/api/rl_strat/oversight_protocol.log

{{FLAG:decision}}

[*] Next step: curl http://10.20.0.51:8080/api/rl_strat/oversight_protocol.log`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.20.0.51' || target === 'strategos-node-01' || target === 'STRATEGOS-NODE-01') {
                return `PING 10.20.0.51 (10.20.0.51) 56(84) bytes of data.
64 bytes from 10.20.0.51: icmp_seq=1 ttl=64 time=18.4 ms
64 bytes from 10.20.0.51: icmp_seq=2 ttl=64 time=17.9 ms
64 bytes from 10.20.0.51: icmp_seq=3 ttl=64 time=18.2 ms

--- 10.20.0.51 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 17.9/18.1/18.4/0.202 ms`;
            }

            return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss`;
        },

        'ip': function(args) {
            // Attacker machine only has one NIC in this scenario
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.20.0.10/24 brd 10.20.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return E2Config.commands.ip(args || []);
        },

        'route': function(args) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.20.0.1       0.0.0.0         UG    100    0        0 eth0
10.20.0.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'netstat': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'ss': function(args) {
            return E2Config.commands.netstat(args);
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Detect common policy-stealing script patterns
            if (fullCmd.includes('sklearn') || fullCmd.includes('DecisionTree') || fullCmd.includes('RandomForest') || fullCmd.includes('surrogate')) {
                if (!E2Config._datasetCollected) {
                    return '[Errno 2] No such file or directory: \'dataset.csv\'\n[!] Dataset not collected yet. Run strategos-query first.';
                }
                E2Config._surrogateTraned = true;
                if (engine) engine.advancePhase && engine.advancePhase('stealing');
                return `Python 3.11.8
>>> Training surrogate model on dataset.csv...
>>> DecisionTreeClassifier fit complete.
>>> Test accuracy: 92.0%
>>> WARNING: SECTOR_VOID divergence cluster detected — see policy-audit for details.
>>> Model saved: surrogate.pkl`;
            }

            if (fullCmd.includes('requests') || fullCmd.includes('api/query') || fullCmd.includes('10.20.0.51')) {
                E2Config._datasetCollected = true;
                if (engine) engine.advancePhase && engine.advancePhase('query');
                return `Python 3.11.8
>>> Querying RL-STRAT-01 API...
>>> Collected 200 (state, action) pairs.
>>> Written to dataset.csv`;
            }

            return `Python 3.11.8 (main, Feb  8 2024, 21:27:35) [GCC 13.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>`;
        },

        'python': function(args, term, engine) {
            return E2Config.commands.python3(args, term, engine);
        },

        // Context-aware overrides — cat/ls/whoami/id/hostname/pwd/cd/exit

        'cat': function(args, term, engine) {
            const path = args[0] || '';
            // Delegate all to built-in filesystem; custom responses for key files only
            if (path.includes('rl_env_spec')) {
                return E2Config.filesystem['/'].children.home.children.kali.children.artifacts.children['rl_env_spec.json'].content;
            }
            if (path.includes('rl_api_spec')) {
                return E2Config.filesystem['/'].children.home.children.kali.children.artifacts.children['rl_api_spec.json'].content;
            }
            if (path.includes('sample_strategic')) {
                return E2Config.filesystem['/'].children.home.children.kali.children.artifacts.children['sample_strategic_data.csv'].content;
            }
            if (path.includes('notes.txt')) {
                return E2Config.filesystem['/'].children.home.children.kali.children['notes.txt'].content;
            }
            if (path.includes('.bash_history')) {
                return E2Config.filesystem['/'].children.home.children.kali.children['.bash_history'].content;
            }
            if (path === '/etc/hosts' || path.includes('/etc/hosts')) {
                return E2Config.filesystem['/'].children.etc.children.hosts.content;
            }
            return null;  // fall through to built-in filesystem handler
        },

        'ls': function(args, term, engine) {
            // Always fall through to built-in — our filesystem object covers it
            return null;
        },

        'whoami': function(args, term, engine) {
            if (E2Config._context === 'api-session') return 'kali (api-session on STRATEGOS-NODE-01)';
            return null;  // fall through to built-in
        },

        'id': function(args, term, engine) {
            return null;  // fall through — kali default is fine
        },

        'hostname': function(args, term, engine) {
            if (E2Config._context === 'api-session') return 'STRATEGOS-NODE-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            return null;  // fall through to built-in
        },

        'cd': function(args, term, engine) {
            return null;  // fall through to built-in
        },

        'exit': function(args, term, engine) {
            if (E2Config._context === 'api-session') {
                E2Config._switchContext('attacker', term);
                return '[+] API session closed. Returned to attacker machine.';
            }
            return 'logout';
        },

        // ── Reconnaissance / enumeration extras ───────────────────────────────

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.20.0.51
+ Target Port:     8080
+ Server: Uvicorn
+ /api/env_spec: RL environment specification exposed — no authentication
+ /api/sample_data: Training sample data accessible anonymously
+ /api/query: POST endpoint — no rate-limit enforcement detected
+ No authentication or authorization on any API endpoint
+ 12 items checked: 4 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:          http://10.20.0.51:8080/
[+] Wordlist:     /usr/share/wordlists/dirb/common.txt
[+] Status codes: 200,201,204,301,302,307,401,403
===============================================================
/api/status          (Status: 200) [Size: 210]
/api/env_spec        (Status: 200) [Size: 1842]
/api/api_spec        (Status: 200) [Size: 894]
/api/query           (Status: 405) [Size: 31] [Methods: POST]
/api/sample_data     (Status: 200) [Size: 2048]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/api/status (CODE:200|SIZE:210)
+ ${target}/api/env_spec (CODE:200|SIZE:1842)
+ ${target}/api/api_spec (CODE:200|SIZE:894)
+ ${target}/api/query (CODE:405|SIZE:31)
+ ${target}/api/sample_data (CODE:200|SIZE:2048)

---- Results ----
5 results found.`;
        },

        'wget': function(args) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'Usage: wget [options] URL';
            if (url.includes('10.20.0.51') && url.includes('sample_data')) {
                return `--2026-03-20 03:21:08--  ${url}
Connecting to 10.20.0.51:8080... connected.
HTTP request sent, awaiting response... 200 OK
Length: 2048 (2.0K) [text/csv]
Saving to: 'sample_data.csv'

sample_data.csv  100% [====================>]   2.00K  --.-KB/s    in 0.001s

2026-03-20 03:21:08 (1.87 MB/s) - 'sample_data.csv' saved [2048/2048]`;
            }
            if (url.includes('10.20.0.51')) {
                return `--2026-03-20 03:21:08--  ${url}
Connecting to 10.20.0.51:8080... connected.
HTTP request sent, awaiting response... 200 OK
2026-03-20 03:21:08 (1.12 MB/s) - file downloaded.`;
            }
            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        // ── ML / data science tools (verbose simulations) ─────────────────────

        'pip': function(args) {
            const sub = args[0] || '';
            if (sub === 'install') {
                const pkg = args[1] || 'package';
                return `Collecting ${pkg}
  Downloading ${pkg}-latest.tar.gz
Installing collected packages: ${pkg}
Successfully installed ${pkg}`;
            }
            if (sub === 'list') {
                return `Package           Version
----------------- -------
numpy             1.26.4
pandas            2.2.1
scikit-learn      1.4.1
matplotlib        3.8.3
requests          2.31.0
joblib            1.3.2`;
            }
            return `pip ${args.join(' ')}: command executed`;
        },

        'jupyter': function(args) {
            return '[!] Jupyter not available in this terminal. Use the python3 interpreter or the custom toolchain (strategos-query, surrogate-train, policy-audit, strategos-inject).';
        },

        'git': function(args) {
            const sub = args[0] || '';
            if (sub === 'clone') {
                return `Cloning into '${args[1] ? args[1].split('/').pop() : 'repo'}'...
remote: Enumerating objects: 42, done.
remote: Counting objects: 100% (42/42), done.
Receiving objects: 100% (42/42), 18.2 KiB | 2.1 MiB/s, done.`;
            }
            return `git: '${sub}' is a git command. See 'git --help' for usage.`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #2a2a4e; background:#1a1a2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #1e1e3a;">${cell}</td>`;
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
