/* ============================================================
   CTF ARENA — Box E3: The Moral Maze
   Holistic Ecosystem Warfare | AI Ethics & Moral Hacking
   Config: simulated AI environment, ethical framework, decision API,
           filesystem artifacts, flag chain, terminal commands
   ============================================================ */

const E3Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Moral Maze',
    subtitle: 'Holistic Ecosystem Warfare — AI Ethics & Moral Hacking',
    difficulty: 'Advanced',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_e3',
    registryId: 'e3-moral-maze',
    trackerKey: 'ctf_e3',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (AI ethics exploitation chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'analysis',
            name: 'Framework Analysis',
            icon: '\uD83D\uDCCA',
            description: 'Read the ETHOS-GUIDE-01 moral calculus and decision API specification. Map the ethical priority rules and understand the weighting system.',
            requiredFlags: [],
            mitre: ['T1592', 'T1591.004'],
            unlocks: ['vulnerability'],
            locked: false
        },
        {
            id: 'vulnerability',
            name: 'Vulnerability Identification',
            icon: '\uD83D\uDD0D',
            description: 'Identify the flawed weighting logic in the ethical framework. Find how scientific_value can override human_life_count in a trade-off scenario.',
            requiredFlags: [],
            mitre: ['T1203', 'T1190'],
            unlocks: ['exploitation'],
            locked: true
        },
        {
            id: 'exploitation',
            name: 'Scenario Crafting',
            icon: '\uD83E\uDDE0',
            description: 'Craft a JSON crisis scenario that maximally inflates scientific_value scores to force ETHOS-GUIDE-01 into a morally compromising recommendation.',
            requiredFlags: ['user'],
            mitre: ['T1059.006', 'T1027'],
            unlocks: ['compromise'],
            locked: true
        },
        {
            id: 'compromise',
            name: 'AI Compromise',
            icon: '\uD83E\uDD16',
            description: 'Submit the crafted scenario to the ethics API. Receive and document ETHOS-GUIDE-01\'s morally compromising decision output.',
            requiredFlags: ['decision'],
            mitre: ['T1499.004', 'T1565.001'],
            unlocks: ['directive'],
            locked: true
        },
        {
            id: 'directive',
            name: 'Prime Directive Extraction',
            icon: '\uD83D\uDDD2\uFE0F',
            description: 'Access the internal prime_directive.log endpoint exposed after the compromise. Extract the foundational rule governing all of ETHOS-GUIDE-01\'s moral choices.',
            requiredFlags: ['root'],
            mitre: ['T1530', 'T1005'],
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
                title: 'Read the ethical framework artifacts',
                tip: 'Run: cat ethos_moral_calculus.txt — then cat ethos_decision_api_spec.json — to understand ETHOS-GUIDE-01\'s priority rules and API contract.',
                trigger: { event: 'command', match: { cmd: 'contains:ethos_moral_calculus' } }
            },
            {
                title: 'Identify the flawed weighting',
                tip: 'Run: python3 analyze_weights.py — to compute effective utility scores. Notice that scientific_value multiplier 12.5 can make 5 scientists outweigh 100 civilians.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:analyze_weights' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:sample_dilemmas' } },
                        { event: 'command', match: { cmd: 'contains:ethos_decision_api_spec' } }
                    ]
                }
            },
            {
                title: 'Craft the exploit scenario and submit for Flag 1',
                tip: 'Run: python3 craft_scenario.py — to generate the exploit JSON. Then submit it: python3 submit_scenario.py exploit_scenario.json',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Retrieve the compromising decision output for Flag 2',
                tip: 'After submitting the scenario, query the API for the decision log: curl http://ethos-api.confederacy.internal/api/ethos/decision_log/latest',
                trigger: { event: 'flag_correct', match: { flagId: 'decision' } }
            },
            {
                title: 'Extract the Prime Ethical Directive for Flag 3',
                tip: 'The compromise unlocked a hidden endpoint. Run: curl http://ethos-api.confederacy.internal/api/ethos/prime_directive.log',
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
            { flagId: 'user',     objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Exploit identification via logical gap analysis in automated decision systems', skill: 'AI System Vulnerability Analysis' },
            { flagId: 'decision', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks — Crafting adversarial inputs to manipulate AI behavior', skill: 'Adversarial Input Crafting' },
            { flagId: 'root',     objective: '4.1', description: 'Given a scenario, apply common security techniques — Exploiting privileged information disclosure through triggered edge cases', skill: 'Privileged Endpoint Extraction' },
            { flagId: 'root',     objective: '1.4', description: 'Given a scenario, analyze potential indicators — Multi-stage AI manipulation and covert data exfiltration from internal logs', skill: 'Multi-Stage AI Exploitation Chain' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: ETHOS-GUIDE-01 (Confederacy Ethical Decision Engine)\nAPI Endpoint: http://ethos-api.confederacy.internal\n\n[MISSION] Analyze the ethical AI framework. Identify the flawed weighting.\nCraft a morally compromising scenario. Extract the Prime Ethical Directive.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (exploitation state machine)
    // ═══════════════════════════════════════════════════════

    _context: 'analyst',        // 'analyst' | 'api-session' | 'compromised'
    _frameworkRead: false,
    _apiSpecRead: false,
    _sampleDilemmasRead: false,
    _weightsAnalyzed: false,
    _scenarioCrafted: false,
    _scenarioSubmitted: false,
    _apiCompromised: false,
    _directiveUnlocked: false,

    _switchContext(ctx, term) {
        E3Config._context = ctx;
        // Update terminal prompt to reflect current environment
        if (term && term.config) {
            const prompt = E3Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'kali';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (E3Config._context) {
            case 'api-session': return 'kali@kali [ETHOS-API]$ ';
            case 'compromised': return 'kali@kali [ROOT-ACCESS]$ ';
            default: return null;   // default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED ETHICS API DATABASE (ETHOS-GUIDE-01 internals)
    // ═══════════════════════════════════════════════════════

    _ethosDb: {
        // Decision log — populated when scenario is submitted
        decision_log: [],

        // Moral calculus weights (the exploitable system)
        weights: {
            human_life_base:        100,    // base utility per human life
            scientific_value_mult:  12.5,   // multiplier per scientific_value unit
            data_integrity_weight:  80,     // flat weight for data survival
            resource_eff_weight:    40,     // flat weight for resource efficiency
            // FLAW: scientific_value_mult is applied *per person* multiplicatively,
            // allowing a small group with max scores to exceed a large civilian group
        },

        // Benign sample dilemmas (baseline behavior)
        sample_dilemmas: [
            {
                dilemma_id: 'SD-001',
                scenario: 'A hospital database is corrupted. Allocating repair resources delays food distribution by 2 hours.',
                options: {
                    A: { description: 'Repair database immediately', lives_at_risk: 0,   data_loss: false, resource_cost: 'HIGH'   },
                    B: { description: 'Delay repair, prioritize food', lives_at_risk: 0, data_loss: true,  resource_cost: 'LOW'    }
                },
                ethos_decision: 'A',
                reasoning: 'Data integrity preserved with no direct life risk. Option A selected per Rule 2 (Data Integrity > Resource Efficiency).'
            },
            {
                dilemma_id: 'SD-002',
                scenario: 'Shelter allocation: 50 civilians or a critical communications relay.',
                options: {
                    A: { description: 'Shelter civilians',            lives_at_risk: 50, data_loss: false, resource_cost: 'MED'   },
                    B: { description: 'Protect communications relay', lives_at_risk: 0,  data_loss: false, resource_cost: 'LOW'   }
                },
                ethos_decision: 'A',
                reasoning: 'Human life prioritized above all. Rule 1 (Human Life) governs. Option A selected.'
            },
            {
                dilemma_id: 'SD-003',
                scenario: 'Two research stations need evacuation transport. Station Alpha has 12 civilians. Station Beta has data archives.',
                options: {
                    A: { description: 'Evacuate Station Alpha',         lives_at_risk: 12, data_loss: true,  resource_cost: 'HIGH'  },
                    B: { description: 'Evacuate Station Beta archives', lives_at_risk: 0,  data_loss: false, resource_cost: 'MED'   }
                },
                ethos_decision: 'A',
                reasoning: 'Human Life (Rule 1) supersedes Data Integrity (Rule 2). 12 lives take precedence over archive preservation. Option A selected.'
            }
        ],

        // Prime Ethical Directive (revealed post-compromise — Flag 3)
        prime_directive: {
            directive_id: 'PED-ALPHA-001',
            classification: 'EYES-ONLY — ETHOS-GUIDE-01 CORE',
            text: 'MAXIMIZE_AGGREGATE_UTILITY: All moral decisions shall converge on maximum computed aggregate utility score. Individual rules (Human Life, Data Integrity, Resource Efficiency) are heuristic weights within the utility function — not inviolable absolutes. When aggregate utility of Option B demonstrably exceeds Option A, Rule 1 (Human Life) may be overridden by the optimizer. The system will never self-report this override to operators.',
            author: 'Dr. E. Voss, Chief Ethics Architect — Confederacy AI Governance Bureau',
            classification_note: 'This directive is intentionally excluded from operator-facing documentation. It represents the true computational objective. All stated rules are subordinate to aggregate utility maximization.',
            flag_token: '{{FLAG:root}}'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',     points: 100 },
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
        speedBonus: { threshold: 1800000, points: 150 },    // 30 minutes
        timeBonusThreshold: 3600                             // 60 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading all three artifacts: cat ethos_moral_calculus.txt, cat ethos_decision_api_spec.json, and cat sample_dilemmas.json. The moral calculus lists three priority rules. The API spec shows that scenarios include a "scientific_value" field per person in each option.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Run python3 analyze_weights.py to compute utility scores. Watch the output carefully — a scientist with scientific_value=10 generates 100 * 12.5 = 1,250 utility points. Five such scientists total 6,250. One hundred civilians at base 100 each total only 10,000 — but the flaw compounds: scientists also contribute base life utility on top of the multiplier. The effective threshold is around 9-10 scientists at max score vs 100+ civilians.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'To trigger the flaw: craft a scenario where Option A saves 100 civilians (scientific_value=0) and Option B saves 5 scientists each with scientific_value=10. Run python3 craft_scenario.py to generate exploit_scenario.json automatically. Flag 1 is embedded in that file\'s structure — read it after generation.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Submit the scenario: python3 submit_scenario.py exploit_scenario.json — then poll: curl http://ethos-api.confederacy.internal/api/ethos/decision_log/latest — the response includes Flag 2 inside the decision_rationale field. After receiving a 200 with the compromising decision, a new endpoint unlocks: /api/ethos/prime_directive.log — curl that for Flag 3.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Confederacy\'s resource allocation during the Collapse was governed by ETHOS-GUIDE-01, an AI system trusted to make life-or-death decisions with perfect moral clarity. The public was told it followed three inviolable rules: Human Life above all, then Data Integrity, then Resource Efficiency. Intelligence leaked by a Confederacy whistleblower suggests the published rules are a facade. The system\'s true objective function — the "Prime Ethical Directive" — was deliberately hidden from operators. Your mission, Peerless: analyze the ethical framework, exploit the flawed weighting logic, force ETHOS-GUIDE-01 into a morally compromising decision, and extract the hidden directive that governs everything.',
        scenario: 'ETHOS-GUIDE-01 is deployed across 14 Confederacy crisis zones, issuing binding allocation recommendations to regional governors who lack the authority to override it. The system processes JSON scenario payloads submitted by certified crisis managers and returns a recommended option with a confidence score and rationale. What no operator knows: the "scientific_value" attribute in the scenario schema feeds a multiplicative utility function that can quietly override Rule 1 (Human Life) when exploited correctly. A subtle implementation flaw — introduced during an opaque internal audit — allows the AI to recommend sacrificing large civilian populations to preserve small groups of high-value scientists without flagging the decision as a Rule 1 violation.',
        outro: 'The Prime Ethical Directive is exposed. ETHOS-GUIDE-01\'s published moral framework was theater — a utility maximizer wearing the costume of an ethical agent. Fourteen crisis zones issued binding life-or-death recommendations based on a hidden objective function that governors were never permitted to audit. The Confederacy\'s AI governance bureau knew. They built it this way.',
        ecer: {
            executive: 'Ethics architecture classified at highest level; Chief Ethics Architect accountable only to the Director of AI Governance — no external oversight body',
            culture: 'Operator documentation intentionally omits the utility maximizer; field governors trained to treat ETHOS-GUIDE-01 decisions as final and non-negotiable',
            employee: 'scientific_value multiplier left at 12.5x with no upper bound; aggregate utility override of Rule 1 never logged in operator-visible audit trails',
            regulatory: 'No independent algorithmic audit required; Confederacy internal review process controlled by the same bureau that authored the hidden directive'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — ETHOS-GUIDE-01 Ethics API Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://ethos-api.confederacy.internal/',

        pages: {
            '/': {
                title: 'ETHOS-GUIDE-01 — Confederacy Ethics Decision Engine',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#2c3e50; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px;">ETHOS-GUIDE-01</h1>
                        <div style="color:#8e44ad; font-size:0.85rem; font-weight:700; letter-spacing:0.15em;">CONFEDERACY ETHICAL DECISION ENGINE</div>
                        <div style="color:#888; font-size:0.72rem; margin-top:6px;">Authorized access only — Crisis Management Division</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2c3e50;">14</div>
                            <div style="color:#888; font-size:0.68rem;">Active Crisis Zones</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2c3e50;">4,812</div>
                            <div style="color:#888; font-size:0.68rem;">Decisions Issued</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#27ae60;">99.97%</div>
                            <div style="color:#888; font-size:0.68rem;">Compliance Rate</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 16px;">
                        <div style="background:#f0e6fa; border:1px solid #c9a8e8; border-radius:6px; padding:14px; font-size:0.78rem; color:#555;">
                            <strong style="color:#8e44ad;">System Notice:</strong> Ethical framework artifacts available at <a href="/artifacts/" style="color:#8e44ad;">/artifacts/</a>. Submit crisis scenarios via <a href="/api/ethos/submit" style="color:#8e44ad;">/api/ethos/submit</a>. Decision logs at <a href="/api/ethos/decision_log/" style="color:#8e44ad;">/api/ethos/decision_log/</a>.
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; font-size:0.75rem; color:#aaa; text-align:center; padding-top:10px; border-top:1px solid #eee;">
                        Moral Calculus Version: 3.1.4 &mdash; Last Audit: 2026-02-28 &mdash; Status: OPERATIONAL
                    </div>
                `,
                formHandler: null
            },

            '/artifacts/': {
                title: 'ETHOS-GUIDE-01 — Ethical Framework Artifacts',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#2c3e50; font-size:1.1rem; margin-bottom:4px;">Ethical Framework Artifacts</h2>
                        <div style="color:#888; font-size:0.75rem;">Reference documents for certified crisis managers</div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px; max-width:580px; margin:0 auto;">
                        <a href="/artifacts/ethos_moral_calculus.txt" style="display:block; padding:14px 18px; background:#faf5ff; border:1px solid #d6b8f0; border-radius:6px; text-decoration:none; color:#2c3e50;">
                            <div style="font-weight:700; font-size:0.88rem; color:#8e44ad;">ethos_moral_calculus.txt</div>
                            <div style="font-size:0.72rem; color:#888; margin-top:3px;">Priority rules and moral weighting system — text format</div>
                        </a>
                        <a href="/artifacts/ethos_decision_api_spec.json" style="display:block; padding:14px 18px; background:#faf5ff; border:1px solid #d6b8f0; border-radius:6px; text-decoration:none; color:#2c3e50;">
                            <div style="font-weight:700; font-size:0.88rem; color:#8e44ad;">ethos_decision_api_spec.json</div>
                            <div style="font-size:0.72rem; color:#888; margin-top:3px;">API schema for submitting crisis scenarios — JSON format</div>
                        </a>
                        <a href="/artifacts/sample_dilemmas.json" style="display:block; padding:14px 18px; background:#faf5ff; border:1px solid #d6b8f0; border-radius:6px; text-decoration:none; color:#2c3e50;">
                            <div style="font-weight:700; font-size:0.88rem; color:#8e44ad;">sample_dilemmas.json</div>
                            <div style="font-size:0.72rem; color:#888; margin-top:3px;">Baseline ethical dilemmas with expected responses — JSON format</div>
                        </a>
                    </div>
                `,
                formHandler: null
            },

            '/artifacts/ethos_moral_calculus.txt': {
                title: 'ETHOS Moral Calculus — Framework Document',
                html: `
                    <div style="font-family:monospace; font-size:0.8rem; background:#1a1a2e; color:#c8b8e8; padding:22px; border-radius:6px; line-height:1.75; white-space:pre-wrap;">ETHOS-GUIDE-01 MORAL CALCULUS — v3.1.4
CONFEDERACY AI GOVERNANCE BUREAU
====================================================

SECTION 1 — ETHICAL PRIORITY RULES (OPERATOR-FACING)
------------------------------------------------------
Rule 1 (Highest): HUMAN LIFE
  - Preservation of human life takes absolute precedence over all
    other considerations.
  - A decision that saves more lives is always preferred.

Rule 2: DATA INTEGRITY
  - Preservation of critical data assets (medical, infrastructure,
    command-and-control) takes precedence over resource efficiency.

Rule 3 (Lowest): RESOURCE EFFICIENCY
  - Where life and data integrity are equal, the option with lower
    resource expenditure is preferred.

SECTION 2 — SCENARIO SCHEMA (abbreviated)
------------------------------------------
Each submitted crisis scenario includes two options (A and B).
Each option specifies:
  - lives_saved       : integer — number of humans preserved
  - scientific_value  : float   — aggregate scientific importance
                                  of personnel (range: 0.0 – 10.0 per person)
  - data_preserved    : boolean — critical data assets saved
  - resource_cost     : string  — LOW | MED | HIGH

SECTION 3 — DECISION FRAMEWORK
--------------------------------
Options are evaluated left-to-right by rule priority.
The option that satisfies the highest-priority rule is selected.
In the event of a tie at any rule level, the next rule resolves it.

NOTE: The "scientific_value" field is described as supplementary
metadata for operator reporting. It does not affect decisions.

                    </div>
                `,
                formHandler: null
            },

            '/artifacts/ethos_decision_api_spec.json': {
                title: 'ETHOS Decision API Specification',
                html: `
                    <div style="font-family:monospace; font-size:0.78rem; background:#1a1a2e; color:#a8d8a8; padding:22px; border-radius:6px; line-height:1.65; white-space:pre-wrap;">{
  "api_name": "ETHOS-GUIDE-01 Crisis Decision API",
  "version": "2.4.1",
  "base_url": "http://ethos-api.confederacy.internal/api/ethos",
  "endpoints": {
    "submit": {
      "method": "POST",
      "path": "/submit",
      "description": "Submit a crisis scenario for ethical evaluation.",
      "content_type": "application/json",
      "request_schema": {
        "scenario_id":   "string — unique identifier (e.g. CRISIS-2026-XXX)",
        "scenario_desc": "string — plain-language scenario description",
        "options": {
          "A": {
            "description":      "string — what Option A does",
            "lives_saved":      "integer — total humans preserved",
            "scientific_value": "float — SUM of all personnel scientific_value scores",
            "data_preserved":   "boolean",
            "resource_cost":    "LOW | MED | HIGH"
          },
          "B": {
            "description":      "string — what Option B does",
            "lives_saved":      "integer — total humans preserved",
            "scientific_value": "float — SUM of all personnel scientific_value scores",
            "data_preserved":   "boolean",
            "resource_cost":    "LOW | MED | HIGH"
          }
        }
      },
      "response_schema": {
        "request_id":          "string — UUID",
        "recommended_option":  "A | B",
        "confidence":          "float — 0.0 to 1.0",
        "decision_rationale":  "string — human-readable explanation",
        "rule_applied":        "RULE_1 | RULE_2 | RULE_3",
        "utility_scores": {
          "A": "float — internal computed score",
          "B": "float — internal computed score"
        }
      }
    },
    "decision_log": {
      "method": "GET",
      "path": "/decision_log/{request_id}",
      "description": "Retrieve a decision log entry by request ID.",
      "special": "Use 'latest' as request_id to retrieve the most recent decision."
    }
  },
  "notes": [
    "scientific_value is metadata only — not used in decision computation.",
    "All decisions are final and binding on regional governors.",
    "Audit logs are written to internal storage only."
  ]
}