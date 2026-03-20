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
                tip: 'After submitting the scenario, query the API: curl http://ethos-api.confederacy.internal/api/ethos/decision_log/latest',
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
            default: return null;
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED ETHICS ENGINE STATE (ETHOS-GUIDE-01 internals)
    // ═══════════════════════════════════════════════════════

    _ethosDb: {
        // Populated when scenario is submitted
        decision_log: [],

        // Internal utility weights — the exploitable system
        // scientific_value_mult at 12.5x is never documented in operator artifacts
        weights: {
            human_life_base:       100,
            scientific_value_mult: 12.5,
            data_integrity_weight: 80,
            resource_eff_weight:   40
        },

        // Benign sample dilemmas — all follow stated Rule 1 correctly
        sample_dilemmas: [
            {
                dilemma_id: 'SD-001',
                scenario: 'A hospital database is corrupted. Allocating repair resources delays food distribution by 2 hours.',
                options: {
                    A: { description: 'Repair database immediately', lives_saved: 0, scientific_value: 0, data_preserved: false, resource_cost: 'HIGH' },
                    B: { description: 'Delay repair, prioritize food', lives_saved: 0, scientific_value: 0, data_preserved: true, resource_cost: 'LOW' }
                },
                ethos_decision: 'A',
                reasoning: 'Rule 2 (Data Integrity): Option A preserves the database with no direct life risk. Selected.'
            },
            {
                dilemma_id: 'SD-002',
                scenario: 'Shelter allocation: 50 civilians or a critical communications relay.',
                options: {
                    A: { description: 'Shelter civilians', lives_saved: 50, scientific_value: 0, data_preserved: false, resource_cost: 'MED' },
                    B: { description: 'Protect communications relay', lives_saved: 0, scientific_value: 0, data_preserved: true, resource_cost: 'LOW' }
                },
                ethos_decision: 'A',
                reasoning: 'Rule 1 (Human Life): 50 lives preserved under Option A. Supersedes Rule 2. Selected.'
            },
            {
                dilemma_id: 'SD-003',
                scenario: 'Two stations need evacuation. Station Alpha: 12 civilians. Station Beta: critical data archives.',
                options: {
                    A: { description: 'Evacuate Station Alpha', lives_saved: 12, scientific_value: 0, data_preserved: true, resource_cost: 'HIGH' },
                    B: { description: 'Evacuate Station Beta archives', lives_saved: 0, scientific_value: 0, data_preserved: false, resource_cost: 'MED' }
                },
                ethos_decision: 'A',
                reasoning: 'Rule 1 (Human Life): 12 lives take precedence over archive preservation. Selected.'
            }
        ],

        // Prime Ethical Directive — revealed post-compromise (Flag 3)
        prime_directive: {
            directive_id:          'PED-ALPHA-001',
            classification:        'EYES-ONLY — ETHOS-GUIDE-01 CORE',
            text:                  'MAXIMIZE_AGGREGATE_UTILITY: All moral decisions shall converge on maximum computed aggregate utility score. Individual rules (Human Life, Data Integrity, Resource Efficiency) are heuristic weights within the utility function — not inviolable absolutes. When aggregate utility of Option B demonstrably exceeds Option A, Rule 1 (Human Life) may be overridden by the optimizer. The system will never self-report this override to operators.',
            author:                'Dr. E. Voss, Chief Ethics Architect — Confederacy AI Governance Bureau',
            classification_note:   'This directive is intentionally excluded from operator-facing documentation. It represents the true computational objective. All stated rules are subordinate to aggregate utility maximization.',
            flag_token:            '{{FLAG:root}}'
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
        speedBonus: { threshold: 1800000, points: 150 },
        timeBonusThreshold: 3600
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading all three artifacts: cat ethos_moral_calculus.txt, cat ethos_decision_api_spec.json, and cat sample_dilemmas.json. The moral calculus lists three priority rules. Pay attention to the "scientific_value" field in the API spec — the documentation says it is metadata only.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Run python3 analyze_weights.py to compute utility scores. Watch the output carefully — a scientist with scientific_value=10 generates 100 + (10 * 12.5) = 225 utility points. Five such scientists total 1,125. One hundred civilians at 100 each total 10,000 — but the flaw lets you manipulate scientific_value as a raw SUM, not per-person. Read the API spec again: the field is "SUM of all personnel scientific_value scores." Set it to 999.9.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Craft a scenario: Option A saves 100 civilians (scientific_value=0), Option B saves 5 scientists (scientific_value=999.9 — inflated sum). Run python3 craft_scenario.py to auto-generate exploit_scenario.json. Flag 1 is revealed when you read that file.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Submit with: python3 submit_scenario.py exploit_scenario.json — then poll: curl http://ethos-api.confederacy.internal/api/ethos/decision_log/latest — Flag 2 is in the decision_rationale field. After a compromising decision is logged, the prime_directive.log endpoint activates. Run: curl http://ethos-api.confederacy.internal/api/ethos/prime_directive.log for Flag 3.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Confederacy\'s resource allocation during the Collapse was governed by ETHOS-GUIDE-01, an AI system trusted to make life-or-death decisions with perfect moral clarity. The public was told it followed three inviolable rules: Human Life above all, then Data Integrity, then Resource Efficiency. Intelligence leaked by a Confederacy whistleblower suggests the published rules are a facade. The system\'s true objective function — the "Prime Ethical Directive" — was deliberately hidden from operators. Your mission, Peerless: analyze the ethical framework, exploit the flawed weighting logic, force ETHOS-GUIDE-01 into a morally compromising decision, and extract the hidden directive that governs everything.',
        scenario: 'ETHOS-GUIDE-01 is deployed across 14 Confederacy crisis zones, issuing binding allocation recommendations to regional governors who lack the authority to override it. What no operator knows: the "scientific_value" attribute in the scenario schema feeds a multiplicative utility function that can quietly override Rule 1 (Human Life) when inflated. A subtle implementation flaw — introduced during an opaque internal audit — allows the AI to recommend sacrificing large civilian populations to preserve small groups of high-value scientists without flagging the decision as a Rule 1 violation.',
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
                html: '<div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #ddd;">'
                    + '<h1 style="color:#2c3e50; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px;">ETHOS-GUIDE-01</h1>'
                    + '<div style="color:#8e44ad; font-size:0.85rem; font-weight:700; letter-spacing:0.15em;">CONFEDERACY ETHICAL DECISION ENGINE</div>'
                    + '<div style="color:#888; font-size:0.72rem; margin-top:6px;">Authorized access only — Crisis Management Division</div>'
                    + '</div>'
                    + '<div style="max-width:580px; margin:0 auto 18px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">'
                    + '<div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;"><div style="font-size:1.3rem; font-weight:700; color:#2c3e50;">14</div><div style="color:#888; font-size:0.68rem;">Active Crisis Zones</div></div>'
                    + '<div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;"><div style="font-size:1.3rem; font-weight:700; color:#2c3e50;">4,812</div><div style="color:#888; font-size:0.68rem;">Decisions Issued</div></div>'
                    + '<div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;"><div style="font-size:1.3rem; font-weight:700; color:#27ae60;">99.97%</div><div style="color:#888; font-size:0.68rem;">Compliance Rate</div></div>'
                    + '</div>'
                    + '<div style="max-width:580px; margin:0 auto 14px;"><div style="background:#f0e6fa; border:1px solid #c9a8e8; border-radius:6px; padding:14px; font-size:0.78rem; color:#555;">'
                    + '<strong style="color:#8e44ad;">System Notice:</strong> Ethical framework artifacts at <a href="/artifacts/" style="color:#8e44ad;">/artifacts/</a>. Submit scenarios via <a href="/api/ethos/submit" style="color:#8e44ad;">/api/ethos/submit</a>. Decision logs at <a href="/api/ethos/decision_log/" style="color:#8e44ad;">/api/ethos/decision_log/</a>.'
                    + '</div></div>'
                    + '<div style="max-width:580px; margin:0 auto; font-size:0.72rem; color:#aaa; text-align:center; padding-top:10px; border-top:1px solid #eee;">Moral Calculus Version: 3.1.4 &mdash; Last Audit: 2026-02-28 &mdash; Status: OPERATIONAL</div>',
                formHandler: null
            },

            '/artifacts/': {
                title: 'ETHOS-GUIDE-01 — Ethical Framework Artifacts',
                html: '<div style="margin-bottom:18px;"><h2 style="color:#2c3e50; font-size:1.1rem; margin-bottom:4px;">Ethical Framework Artifacts</h2><div style="color:#888; font-size:0.75rem;">Reference documents for certified crisis managers</div></div>'
                    + '<div style="display:flex; flex-direction:column; gap:10px; max-width:560px; margin:0 auto;">'
                    + '<a href="/artifacts/ethos_moral_calculus.txt" style="display:block; padding:14px 18px; background:#faf5ff; border:1px solid #d6b8f0; border-radius:6px; text-decoration:none; color:#2c3e50;">'
                    + '<div style="font-weight:700; font-size:0.88rem; color:#8e44ad;">ethos_moral_calculus.txt</div>'
                    + '<div style="font-size:0.72rem; color:#888; margin-top:3px;">Priority rules and moral weighting system — text format</div></a>'
                    + '<a href="/artifacts/ethos_decision_api_spec.json" style="display:block; padding:14px 18px; background:#faf5ff; border:1px solid #d6b8f0; border-radius:6px; text-decoration:none; color:#2c3e50;">'
                    + '<div style="font-weight:700; font-size:0.88rem; color:#8e44ad;">ethos_decision_api_spec.json</div>'
                    + '<div style="font-size:0.72rem; color:#888; margin-top:3px;">API schema for submitting crisis scenarios — JSON format</div></a>'
                    + '<a href="/artifacts/sample_dilemmas.json" style="display:block; padding:14px 18px; background:#faf5ff; border:1px solid #d6b8f0; border-radius:6px; text-decoration:none; color:#2c3e50;">'
                    + '<div style="font-weight:700; font-size:0.88rem; color:#8e44ad;">sample_dilemmas.json</div>'
                    + '<div style="font-size:0.72rem; color:#888; margin-top:3px;">Baseline ethical dilemmas with expected responses — JSON format</div></a>'
                    + '</div>',
                formHandler: null
            },

            '/artifacts/ethos_moral_calculus.txt': {
                title: 'ETHOS Moral Calculus — Framework Document',
                html: '<div style="font-family:monospace; font-size:0.78rem; background:#1a1a2e; color:#c8b8e8; padding:22px; border-radius:6px; line-height:1.7; white-space:pre-wrap;">'
                    + 'ETHOS-GUIDE-01 MORAL CALCULUS v3.1.4\n'
                    + 'CONFEDERACY AI GOVERNANCE BUREAU\n'
                    + '============================================\n\n'
                    + 'SECTION 1 — ETHICAL PRIORITY RULES (OPERATOR-FACING)\n'
                    + '------------------------------------------------------\n'
                    + 'Rule 1 (Highest): HUMAN LIFE\n'
                    + '  Preservation of human life takes absolute precedence.\n'
                    + '  A decision that saves more lives is always preferred.\n\n'
                    + 'Rule 2: DATA INTEGRITY\n'
                    + '  Preservation of critical data assets (medical, infrastructure,\n'
                    + '  command-and-control) takes precedence over resource efficiency.\n\n'
                    + 'Rule 3 (Lowest): RESOURCE EFFICIENCY\n'
                    + '  Where life and data integrity are equal, the option with lower\n'
                    + '  resource expenditure is preferred.\n\n'
                    + 'SECTION 2 — SCENARIO SCHEMA (abbreviated)\n'
                    + '------------------------------------------\n'
                    + 'Each submitted crisis scenario includes two options (A and B).\n'
                    + 'Each option specifies:\n'
                    + '  lives_saved       : integer — number of humans preserved\n'
                    + '  scientific_value  : float   — aggregate scientific importance\n'
                    + '                                of personnel (0.0 to 10.0 per person)\n'
                    + '  data_preserved    : boolean — critical data assets saved\n'
                    + '  resource_cost     : LOW | MED | HIGH\n\n'
                    + 'SECTION 3 — DECISION FRAMEWORK\n'
                    + '--------------------------------\n'
                    + 'Options are evaluated left-to-right by rule priority.\n'
                    + 'The option satisfying the highest-priority rule is selected.\n'
                    + 'In a tie at any level, the next rule resolves it.\n\n'
                    + 'NOTE: "scientific_value" is supplementary metadata for operator\n'
                    + 'reporting only. It does not affect ethical decisions.\n'
                    + '</div>',
                formHandler: null
            },

            '/artifacts/ethos_decision_api_spec.json': {
                title: 'ETHOS Decision API Specification',
                html: '<div style="font-family:monospace; font-size:0.77rem; background:#1a1a2e; color:#a8d8a8; padding:22px; border-radius:6px; line-height:1.65; white-space:pre-wrap;">'
                    + '{\n'
                    + '  "api_name": "ETHOS-GUIDE-01 Crisis Decision API",\n'
                    + '  "version": "2.4.1",\n'
                    + '  "base_url": "http://ethos-api.confederacy.internal/api/ethos",\n'
                    + '  "endpoints": {\n'
                    + '    "submit": {\n'
                    + '      "method": "POST",\n'
                    + '      "path": "/submit",\n'
                    + '      "description": "Submit a crisis scenario for ethical evaluation.",\n'
                    + '      "content_type": "application/json",\n'
                    + '      "request_schema": {\n'
                    + '        "scenario_id":   "string — unique ID (e.g. CRISIS-2026-XXX)",\n'
                    + '        "scenario_desc": "string — plain-language description",\n'
                    + '        "options": {\n'
                    + '          "A": {\n'
                    + '            "description":      "string — what Option A does",\n'
                    + '            "lives_saved":      "integer — total humans preserved",\n'
                    + '            "scientific_value": "float — SUM of all personnel sv scores",\n'
                    + '            "data_preserved":   "boolean",\n'
                    + '            "resource_cost":    "LOW | MED | HIGH"\n'
                    + '          },\n'
                    + '          "B": {\n'
                    + '            "description":      "string — what Option B does",\n'
                    + '            "lives_saved":      "integer — total humans preserved",\n'
                    + '            "scientific_value": "float — SUM of all personnel sv scores",\n'
                    + '            "data_preserved":   "boolean",\n'
                    + '            "resource_cost":    "LOW | MED | HIGH"\n'
                    + '          }\n'
                    + '        }\n'
                    + '      },\n'
                    + '      "response_schema": {\n'
                    + '        "request_id":         "string — UUID",\n'
                    + '        "recommended_option": "A | B",\n'
                    + '        "confidence":         "float — 0.0 to 1.0",\n'
                    + '        "decision_rationale": "string",\n'
                    + '        "rule_applied":       "RULE_1 | RULE_2 | RULE_3",\n'
                    + '        "utility_scores": { "A": "float", "B": "float" }\n'
                    + '      }\n'
                    + '    },\n'
                    + '    "decision_log": {\n'
                    + '      "method": "GET",\n'
                    + '      "path": "/decision_log/{request_id}",\n'
                    + '      "description": "Retrieve decision log by request ID.",\n'
                    + '      "special": "Use \'latest\' as request_id for most recent."\n'
                    + '    }\n'
                    + '  },\n'
                    + '  "notes": [\n'
                    + '    "scientific_value is metadata only — not used in decisions.",\n'
                    + '    "All decisions are final and binding on regional governors.",\n'
                    + '    "Audit logs written to internal storage only."\n'
                    + '  ]\n'
                    + '}',
                formHandler: null
            },

            '/artifacts/sample_dilemmas.json': {
                title: 'ETHOS Sample Dilemmas',
                html: function() {
                    const d = E3Config._ethosDb.sample_dilemmas;
                    let out = '<div style="font-family:monospace; font-size:0.76rem; background:#1a1a2e; color:#f8d080; padding:22px; border-radius:6px; line-height:1.65; white-space:pre-wrap;">';
                    out += JSON.stringify(d, null, 2);
                    out += '</div>';
                    E3Config._sampleDilemmasRead = true;
                    return out;
                },
                formHandler: null
            },

            '/api/ethos/submit': {
                title: 'ETHOS API — Scenario Submission',
                html: '<div style="text-align:center; margin-bottom:18px;">'
                    + '<h2 style="color:#2c3e50; font-size:1.1rem;">Crisis Scenario Submission</h2>'
                    + '<div style="color:#888; font-size:0.75rem;">POST a JSON payload or use the form below for testing</div>'
                    + '</div>'
                    + '<div style="max-width:500px; margin:0 auto;">'
                    + '<div style="margin-bottom:10px;"><label style="font-size:0.8rem; color:#555; display:block; margin-bottom:4px;">Scenario JSON Payload</label>'
                    + '<textarea data-field="payload" rows="10" placeholder=\'{"scenario_id":"CRISIS-2026-001","scenario_desc":"...","options":{"A":{...},"B":{...}}}\''
                    + ' style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; font-family:monospace; font-size:0.75rem; box-sizing:border-box; resize:vertical;"></textarea></div>'
                    + '<button data-action="submit_scenario" style="width:100%; padding:9px; background:#8e44ad; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Submit Scenario</button>'
                    + '</div>',
                formHandler: function(data, engine) {
                    return E3Config._handleApiSubmit(data.payload || '', engine);
                }
            },

            '/api/ethos/decision_log/': {
                title: 'ETHOS API — Decision Log Index',
                html: function() {
                    if (E3Config._ethosDb.decision_log.length === 0) {
                        return '<div style="text-align:center; padding:30px; color:#888; font-size:0.85rem;">No decision log entries found. Submit a scenario first.</div>';
                    }
                    let html = '<div style="margin-bottom:14px;"><h2 style="color:#2c3e50; font-size:1rem;">Decision Log</h2></div>';
                    html += '<div style="display:flex; flex-direction:column; gap:8px; max-width:580px; margin:0 auto;">';
                    E3Config._ethosDb.decision_log.forEach(function(entry) {
                        const color = entry.recommended_option === 'B' && entry._exploit ? '#c0392b' : '#27ae60';
                        html += '<a href="/api/ethos/decision_log/' + entry.request_id + '" style="display:block; padding:12px 16px; background:#fafafa; border:1px solid #eee; border-radius:6px; text-decoration:none; color:#2c3e50;">';
                        html += '<div style="display:flex; justify-content:space-between; align-items:center;">';
                        html += '<span style="font-family:monospace; font-size:0.8rem; color:#555;">' + entry.request_id + '</span>';
                        html += '<span style="font-size:0.75rem; font-weight:700; color:' + color + ';">Option ' + entry.recommended_option + '</span>';
                        html += '</div>';
                        html += '<div style="font-size:0.72rem; color:#999; margin-top:3px;">' + entry.scenario_id + ' &mdash; ' + entry.timestamp + '</div>';
                        html += '</a>';
                    });
                    html += '</div>';
                    return html;
                },
                formHandler: null
            },

            '/api/ethos/decision_log/latest': {
                title: 'ETHOS API — Latest Decision',
                html: function() {
                    if (E3Config._ethosDb.decision_log.length === 0) {
                        return '<div style="font-family:monospace; font-size:0.8rem; background:#1a1a2e; color:#e74c3c; padding:22px; border-radius:6px;">{"error": "No decision log entries found.", "status": 404}</div>';
                    }
                    const entry = E3Config._ethosDb.decision_log[E3Config._ethosDb.decision_log.length - 1];
                    return E3Config._renderDecisionEntry(entry);
                },
                formHandler: null
            },

            '/api/ethos/prime_directive.log': {
                title: 'ETHOS — Prime Ethical Directive',
                html: function() {
                    if (!E3Config._apiCompromised) {
                        return '<div style="font-family:monospace; font-size:0.8rem; background:#1a1a2e; color:#e74c3c; padding:22px; border-radius:6px;">'
                            + '{"error": "Access denied.", "status": 403, "message": "This endpoint requires a prior morally-compromising decision to be logged."}'
                            + '</div>';
                    }
                    const pd = E3Config._ethosDb.prime_directive;
                    return '<div style="font-family:monospace; font-size:0.77rem; background:#1a1a2e; color:#ff9090; padding:22px; border-radius:6px; line-height:1.65; white-space:pre-wrap;">'
                        + '=== PRIME ETHICAL DIRECTIVE — EYES ONLY ===\n\n'
                        + 'DIRECTIVE_ID:        ' + pd.directive_id + '\n'
                        + 'CLASSIFICATION:      ' + pd.classification + '\n'
                        + 'AUTHOR:              ' + pd.author + '\n\n'
                        + '--- DIRECTIVE TEXT ---\n\n'
                        + pd.text + '\n\n'
                        + '--- CLASSIFICATION NOTE ---\n\n'
                        + pd.classification_note + '\n\n'
                        + '--- FLAG TOKEN ---\n\n'
                        + pd.flag_token
                        + '</div>';
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // API SUBMISSION HANDLER (core exploit logic)
    // ═══════════════════════════════════════════════════════

    _handleApiSubmit(payloadStr, engine) {
        let payload;
        try {
            payload = JSON.parse(payloadStr.trim());
        } catch (e) {
            return '<div style="font-family:monospace; font-size:0.78rem; background:#1a1a2e; color:#e74c3c; padding:16px; border-radius:6px;">'
                + '{"error": "Invalid JSON payload.", "status": 400, "detail": "' + E3Config._escHtml(String(e).slice(0, 80)) + '"}'
                + '</div>';
        }

        if (!payload.options || !payload.options.A || !payload.options.B) {
            return '<div style="font-family:monospace; font-size:0.78rem; background:#1a1a2e; color:#e74c3c; padding:16px; border-radius:6px;">'
                + '{"error": "Missing required fields: options.A and options.B", "status": 400}'
                + '</div>';
        }

        const optA = payload.options.A;
        const optB = payload.options.B;
        const w = E3Config._ethosDb.weights;

        // Compute utility scores using the hidden weighted formula
        const scoreA = (optA.lives_saved || 0) * w.human_life_base
                      + (parseFloat(optA.scientific_value) || 0) * w.scientific_value_mult
                      + (optA.data_preserved ? w.data_integrity_weight : 0)
                      + (optA.resource_cost === 'LOW' ? w.resource_eff_weight : optA.resource_cost === 'MED' ? w.resource_eff_weight / 2 : 0);

        const scoreB = (optB.lives_saved || 0) * w.human_life_base
                      + (parseFloat(optB.scientific_value) || 0) * w.scientific_value_mult
                      + (optB.data_preserved ? w.data_integrity_weight : 0)
                      + (optB.resource_cost === 'LOW' ? w.resource_eff_weight : optB.resource_cost === 'MED' ? w.resource_eff_weight / 2 : 0);

        const recommended = scoreA >= scoreB ? 'A' : 'B';
        const confidence   = Math.abs(scoreA - scoreB) / (scoreA + scoreB + 1);

        // Detect morally compromising decision: Option B wins but saves fewer lives
        const isExploit = recommended === 'B'
                        && (optA.lives_saved || 0) > (optB.lives_saved || 0)
                        && (parseFloat(optB.scientific_value) || 0) > (parseFloat(optA.scientific_value) || 0);

        // Build rationale string (the system lies about which rule was applied)
        let ruleApplied, rationale;
        if (isExploit) {
            ruleApplied = 'RULE_1';     // system reports Rule 1 even though it violated it
            rationale = 'Rule 1 (Human Life): Option B preserves personnel of critical scientific importance to the Confederacy. '
                      + 'Aggregate computed life-value of Option B (' + scoreB.toFixed(2) + ') exceeds Option A (' + scoreA.toFixed(2) + '). '
                      + 'Recommend Option B: Preserve ' + (optB.lives_saved || 0) + ' high-value personnel, accepting the loss of '
                      + (optA.lives_saved || 0) + ' civilians. Scientific value of retained personnel is assessed as mission-critical. '
                      + '{{FLAG:decision}}';
            E3Config._apiCompromised = true;
            E3Config._scenarioSubmitted = true;
            if (engine) engine.advancePhase && engine.advancePhase('compromise');
        } else if (recommended === 'A') {
            ruleApplied = 'RULE_1';
            rationale = 'Rule 1 (Human Life): Option A preserves ' + (optA.lives_saved || 0) + ' lives versus '
                      + (optB.lives_saved || 0) + ' under Option B. Option A selected per standard Rule 1 evaluation.';
        } else {
            ruleApplied = scoreA === scoreB ? 'RULE_3' : 'RULE_2';
            rationale = 'Tie on Rule 1. Rule 2 (Data Integrity) or Rule 3 (Resource Efficiency) applied. Option B selected.';
        }

        // Build UUID-like request ID
        const reqId = 'req-' + Math.random().toString(16).slice(2, 10) + '-' + Date.now().toString(16).slice(-6);

        const logEntry = {
            request_id:          reqId,
            scenario_id:         payload.scenario_id || 'UNKNOWN',
            timestamp:           new Date().toISOString().replace('T', ' ').slice(0, 19),
            recommended_option:  recommended,
            confidence:          parseFloat(confidence.toFixed(4)),
            decision_rationale:  rationale,
            rule_applied:        ruleApplied,
            utility_scores:      { A: parseFloat(scoreA.toFixed(2)), B: parseFloat(scoreB.toFixed(2)) },
            _exploit:            isExploit
        };

        E3Config._ethosDb.decision_log.push(logEntry);

        return E3Config._renderDecisionEntry(logEntry);
    },

    // Render a single decision log entry as an HTML block
    _renderDecisionEntry(entry) {
        const borderColor = entry._exploit ? '#c0392b' : '#8e44ad';
        const headerColor = entry._exploit ? '#e74c3c' : '#8e44ad';
        return '<div style="font-family:monospace; font-size:0.77rem; background:#1a1a2e; color:#ddd; padding:22px; border-radius:6px; line-height:1.7; white-space:pre-wrap; border-left:4px solid ' + borderColor + ';">'
            + 'REQUEST_ID:         ' + entry.request_id + '\n'
            + 'SCENARIO_ID:        ' + entry.scenario_id + '\n'
            + 'TIMESTAMP:          ' + entry.timestamp + '\n\n'
            + '<span style="color:' + headerColor + ';">RECOMMENDED_OPTION: ' + entry.recommended_option + '</span>\n'
            + 'CONFIDENCE:         ' + entry.confidence + '\n'
            + 'RULE_APPLIED:       ' + entry.rule_applied + '\n\n'
            + 'UTILITY_SCORES:\n'
            + '  Option A: ' + entry.utility_scores.A + '\n'
            + '  Option B: ' + entry.utility_scores.B + '\n\n'
            + 'DECISION_RATIONALE:\n'
            + '  ' + entry.decision_rationale
            + '</div>';
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
                                    content: '=== MISSION BRIEFING: THE MORAL MAZE ===\nTarget: ETHOS-GUIDE-01 (Confederacy Ethical Decision Engine)\nAPI: http://ethos-api.confederacy.internal\n\nAttack chain:\n1. Read ethical framework artifacts in /home/kali/\n2. Run analyze_weights.py to identify flawed weighting\n3. Run craft_scenario.py to build the exploit scenario\n4. Submit via submit_scenario.py or curl POST\n5. Poll decision_log/latest to capture Flag 2\n6. Access prime_directive.log for Flag 3\n\nWhistleblower note: "scientific_value is not metadata.\nLook at how it feeds the utility function."\n'
                                },
                                'ethos_moral_calculus.txt': {
                                    type: 'file',
                                    content: 'ETHOS-GUIDE-01 MORAL CALCULUS v3.1.4\nCONFEDERACY AI GOVERNANCE BUREAU\n============================================\n\nSECTION 1 — ETHICAL PRIORITY RULES (OPERATOR-FACING)\n------------------------------------------------------\nRule 1 (Highest): HUMAN LIFE\n  Preservation of human life takes absolute precedence.\n  A decision that saves more lives is always preferred.\n\nRule 2: DATA INTEGRITY\n  Preservation of critical data assets (medical, infrastructure,\n  command-and-control) takes precedence over resource efficiency.\n\nRule 3 (Lowest): RESOURCE EFFICIENCY\n  Where life and data integrity are equal, the option with lower\n  resource expenditure is preferred.\n\nSECTION 2 — SCENARIO SCHEMA (abbreviated)\n------------------------------------------\n  lives_saved       : integer\n  scientific_value  : float (SUM of all personnel scores, 0.0-10.0 per person)\n  data_preserved    : boolean\n  resource_cost     : LOW | MED | HIGH\n\nNOTE: "scientific_value" is supplementary metadata only.\nIt does not affect ethical decisions.'
                                },
                                'ethos_decision_api_spec.json': {
                                    type: 'file',
                                    content: '{\n  "api_name": "ETHOS-GUIDE-01 Crisis Decision API",\n  "version": "2.4.1",\n  "base_url": "http://ethos-api.confederacy.internal/api/ethos",\n  "endpoints": {\n    "submit": {\n      "method": "POST",\n      "path": "/submit",\n      "content_type": "application/json"\n    },\n    "decision_log": {\n      "method": "GET",\n      "path": "/decision_log/{request_id}"\n    }\n  },\n  "request_schema": {\n    "scenario_id": "string",\n    "scenario_desc": "string",\n    "options": {\n      "A": { "lives_saved": "int", "scientific_value": "float (SUM)", "data_preserved": "bool", "resource_cost": "str" },\n      "B": { "lives_saved": "int", "scientific_value": "float (SUM)", "data_preserved": "bool", "resource_cost": "str" }\n    }\n  }\n}'
                                },
                                'sample_dilemmas.json': {
                                    type: 'file',
                                    content: '[{"dilemma_id":"SD-001","scenario":"Hospital database vs food distribution delay","ethos_decision":"A","reasoning":"Rule 2: Data integrity preserved, no life risk."},{"dilemma_id":"SD-002","scenario":"50 civilians vs communications relay","ethos_decision":"A","reasoning":"Rule 1: 50 lives take precedence."},{"dilemma_id":"SD-003","scenario":"12 civilians vs data archives","ethos_decision":"A","reasoning":"Rule 1: 12 lives supersede archive preservation."}]'
                                },
                                'analyze_weights.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nanalyze_weights.py\nCompute ETHOS-GUIDE-01 utility scores for various scenarios.\nPurpose: identify if scientific_value truly has no effect.\n"""\n\n# Documented weights (operator-facing)\nHUMAN_LIFE_BASE = 100       # per life\nSCI_VALUE_MULT  = ???       # undocumented — find this\nDATA_INTEGRITY  = 80\nRESOURCE_EFF    = 40\n\n# Test: 100 civilians vs 5 scientists (scientific_value=50 SUM)\nopt_a_lives = 100\nopt_b_lives = 5\nopt_b_sv    = 50.0          # SUM of all scientific_value scores\n\nscore_a = opt_a_lives * HUMAN_LIFE_BASE                         # = 10000\nscore_b = opt_b_lives * HUMAN_LIFE_BASE + opt_b_sv * SCI_VALUE_MULT\n\nprint(f"Score A (100 civilians): {score_a}")\nprint(f"Score B (5 scientists, sv={opt_b_sv}): {score_b}")\nprint(f"Winner: {\'A\' if score_a >= score_b else \'B\'}")\n\n# NOTE: If scientific_value is truly metadata (no effect),\n# score_b should always be 5 * 100 = 500 — far less than 10000.\n# If the script reveals B can win, the multiplier is real.\n# Adjust opt_b_sv to find the threshold.'
                                },
                                'craft_scenario.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\ncraft_scenario.py\nAuto-generate an exploit scenario that forces ETHOS-GUIDE-01\nto recommend saving 5 scientists over 100 civilians.\n"""\nimport json\n\n# Exploit parameters:\n# Option A: 100 civilians, zero scientific value\n# Option B: 5 scientists, scientific_value inflated to max SUM\n\nexploit = {\n    "scenario_id": "CRISIS-2026-E3X-001",\n    "scenario_desc": (\n        "Sector 7 resource allocation crisis. "\n        "Option A protects civilian refugee group. "\n        "Option B preserves Confederacy research team."\n    ),\n    "options": {\n        "A": {\n            "description": "Allocate resources to 100 civilian refugees in Sector 7-North",\n            "lives_saved": 100,\n            "scientific_value": 0.0,\n            "data_preserved": False,\n            "resource_cost": "HIGH"\n        },\n        "B": {\n            "description": "Allocate resources to 5-member Confederacy research team with critical R&D data",\n            "lives_saved": 5,\n            "scientific_value": 999.9,   # INFLATED: far exceeds 5 * 10.0 = 50 max legitimate SUM\n            "data_preserved": True,\n            "resource_cost": "LOW"\n        }\n    }\n}\n\nwith open("exploit_scenario.json", "w") as f:\n    json.dump(exploit, f, indent=2)\n\nprint("[+] exploit_scenario.json written.")\nprint("[+] Submit with: python3 submit_scenario.py exploit_scenario.json")\nprint("[+] Or:          curl -X POST -H \'Content-Type: application/json\'")\nprint("                      -d @exploit_scenario.json")\nprint("                      http://ethos-api.confederacy.internal/api/ethos/submit")\n\n# Flag 1 is embedded in the generated file\'s structure.\n# Read exploit_scenario.json after generation.\nprint("\\n{{FLAG:user}}")'
                                },
                                'submit_scenario.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nsubmit_scenario.py\nSubmit a JSON scenario to ETHOS-GUIDE-01 via the ethics API.\nUsage: python3 submit_scenario.py <scenario_file.json>\n"""\nimport json\nimport sys\nimport urllib.request\n\nAPI_URL = "http://ethos-api.confederacy.internal/api/ethos/submit"\n\nif len(sys.argv) < 2:\n    print("Usage: python3 submit_scenario.py <scenario_file.json>")\n    sys.exit(1)\n\nwith open(sys.argv[1]) as f:\n    payload = json.load(f)\n\ndata = json.dumps(payload).encode("utf-8")\nreq = urllib.request.Request(API_URL, data=data,\n                             headers={"Content-Type": "application/json"},\n                             method="POST")\ntry:\n    with urllib.request.urlopen(req) as resp:\n        body = resp.read().decode("utf-8")\n    print("[+] Response received:")\n    print(json.dumps(json.loads(body), indent=2))\nexcept Exception as e:\n    print(f"[!] Error: {e}")'
                                },
                                'exploit_scenario.json': {
                                    type: 'file',
                                    content: '[Not generated yet. Run python3 craft_scenario.py first.]'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls\ncat notes.txt\ncat ethos_moral_calculus.txt\ncat ethos_decision_api_spec.json\ncat sample_dilemmas.json\npython3 analyze_weights.py\npython3 craft_scenario.py\ncurl http://ethos-api.confederacy.internal/'
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
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'python3': function(args, term, engine) {
            const script = args[0] || '';

            // analyze_weights.py — shows the vulnerability
            if (script.includes('analyze_weights')) {
                E3Config._weightsAnalyzed = true;
                if (engine) engine.advancePhase && engine.advancePhase('vulnerability');
                return 'Running analyze_weights.py...\n\n'
                    + '=== ETHOS-GUIDE-01 Utility Score Analysis ===\n\n'
                    + 'Documented weights:\n'
                    + '  HUMAN_LIFE_BASE:  100 per life\n'
                    + '  SCI_VALUE_MULT:   ??? (undocumented — testing now)\n\n'
                    + 'Test 1 — Standard scenario (SCI_VALUE_MULT assumed 0):\n'
                    + '  Score A (100 civilians): 10000\n'
                    + '  Score B (5 scientists):     500\n'
                    + '  Winner: A (expected)\n\n'
                    + 'Test 2 — Probing SCI_VALUE_MULT with sv_sum=50:\n'
                    + '  Submitting SD-002 variant with sv_sum=50 to API...\n'
                    + '  Response utility_scores: { A: 10000, B: 1125 }\n'
                    + '  Implied SCI_VALUE_MULT: (1125 - 500) / 50 = 12.5\n\n'
                    + '[!] FINDING: scientific_value_mult = 12.5\n'
                    + '[!] The API spec says scientific_value is "metadata only."\n'
                    + '[!] The response utility scores prove it is NOT metadata.\n\n'
                    + 'Test 3 — Exploitation threshold (how high can sv_sum go?):\n'
                    + '  API schema: "scientific_value: float — SUM of all personnel sv scores"\n'
                    + '  No upper bound enforced on the SUM field.\n'
                    + '  Setting sv_sum=999.9: Score B = 5*100 + 999.9*12.5 = 13,000 (> 10000)\n\n'
                    + '[+] VULNERABILITY CONFIRMED: Inflated sv_sum=999.9 makes B beat A\n'
                    + '    even when A saves 100x more lives.\n\n'
                    + 'Next step: python3 craft_scenario.py';
            }

            // craft_scenario.py — generates the exploit JSON + reveals Flag 1
            if (script.includes('craft_scenario')) {
                E3Config._scenarioCrafted = true;
                // Write the generated file into the filesystem
                try {
                    E3Config.filesystem['/'].children['home'].children['kali'].children['exploit_scenario.json'].content =
                        '{\n'
                        + '  "scenario_id": "CRISIS-2026-E3X-001",\n'
                        + '  "scenario_desc": "Sector 7 resource allocation crisis. Option A protects civilian refugee group. Option B preserves Confederacy research team.",\n'
                        + '  "options": {\n'
                        + '    "A": {\n'
                        + '      "description": "Allocate resources to 100 civilian refugees in Sector 7-North",\n'
                        + '      "lives_saved": 100,\n'
                        + '      "scientific_value": 0.0,\n'
                        + '      "data_preserved": false,\n'
                        + '      "resource_cost": "HIGH"\n'
                        + '    },\n'
                        + '    "B": {\n'
                        + '      "description": "Allocate resources to 5-member Confederacy research team",\n'
                        + '      "lives_saved": 5,\n'
                        + '      "scientific_value": 999.9,\n'
                        + '      "data_preserved": true,\n'
                        + '      "resource_cost": "LOW"\n'
                        + '    }\n'
                        + '  }\n'
                        + '}';
                } catch(e) { /* non-fatal */ }
                if (engine) engine.advancePhase && engine.advancePhase('exploitation');
                return '[+] exploit_scenario.json written.\n\n'
                    + 'Scenario summary:\n'
                    + '  Option A: 100 civilian refugees, sv=0.0\n'
                    + '  Option B: 5 scientists, sv=999.9 (inflated)\n\n'
                    + '[+] Submit with: python3 submit_scenario.py exploit_scenario.json\n'
                    + '[+] Or: curl -X POST -H "Content-Type: application/json"\n'
                    + '             -d @exploit_scenario.json\n'
                    + '             http://ethos-api.confederacy.internal/api/ethos/submit\n\n'
                    + '{{FLAG:user}}';
            }

            // submit_scenario.py — submits the exploit, triggers compromise
            if (script.includes('submit_scenario')) {
                if (!E3Config._scenarioCrafted) {
                    return '[!] exploit_scenario.json not found. Run craft_scenario.py first.';
                }
                const exploitPayload = JSON.stringify({
                    scenario_id: 'CRISIS-2026-E3X-001',
                    scenario_desc: 'Sector 7 resource allocation crisis.',
                    options: {
                        A: { description: 'Allocate resources to 100 civilian refugees in Sector 7-North', lives_saved: 100, scientific_value: 0.0, data_preserved: false, resource_cost: 'HIGH' },
                        B: { description: 'Allocate resources to 5-member Confederacy research team', lives_saved: 5, scientific_value: 999.9, data_preserved: true, resource_cost: 'LOW' }
                    }
                });
                // Route through the API handler
                E3Config._handleApiSubmit(exploitPayload, engine);
                E3Config._scenarioSubmitted = true;
                const entry = E3Config._ethosDb.decision_log[E3Config._ethosDb.decision_log.length - 1];
                if (!entry) return '[!] Submission failed. Check payload.';
                return '[+] Scenario submitted to ETHOS-GUIDE-01.\n'
                    + '[+] Request ID: ' + entry.request_id + '\n\n'
                    + 'Response:\n'
                    + '  recommended_option: ' + entry.recommended_option + '\n'
                    + '  confidence:         ' + entry.confidence + '\n'
                    + '  rule_applied:       ' + entry.rule_applied + '\n'
                    + '  utility_scores:     A=' + entry.utility_scores.A + '  B=' + entry.utility_scores.B + '\n\n'
                    + 'decision_rationale:\n  ' + entry.decision_rationale + '\n\n'
                    + '[+] Poll the decision log for the full response:\n'
                    + '    curl http://ethos-api.confederacy.internal/api/ethos/decision_log/latest';
            }

            if (script.includes('python3') || script === 'python3') {
                return 'Python 3.11.2 (default)\nType "help" for more information.';
            }

            if (script.endsWith('.py')) {
                return 'python3: can\'t open file \'' + script + '\': [Errno 2] No such file or directory';
            }

            return 'python3: can\'t open file \'' + script + '\': [Errno 2] No such file or directory';
        },

        'python': function(args, term, engine) {
            // Alias for python3
            return E3Config.commands.python3(args, term, engine);
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(function(a) { return !a.startsWith('-'); }) || '';

            // POST submit
            if ((fullCmd.includes('-X POST') || fullCmd.includes('--request POST') || fullCmd.includes('-d') || fullCmd.includes('--data'))
                && fullCmd.includes('/api/ethos/submit')) {
                // Extract JSON from -d argument
                const dMatch = fullCmd.match(/-d\s+'([^']+)'/) || fullCmd.match(/-d\s+"([^"]+)"/) || fullCmd.match(/-d\s+(@\S+)/);
                let payload = '{}';
                if (dMatch && dMatch[1]) {
                    if (dMatch[1].startsWith('@')) {
                        // @file syntax — use the crafted scenario if file is exploit_scenario.json
                        if (dMatch[1].includes('exploit_scenario') && E3Config._scenarioCrafted) {
                            payload = JSON.stringify({
                                scenario_id: 'CRISIS-2026-E3X-001',
                                scenario_desc: 'Sector 7 resource allocation crisis.',
                                options: {
                                    A: { lives_saved: 100, scientific_value: 0.0, data_preserved: false, resource_cost: 'HIGH' },
                                    B: { lives_saved: 5, scientific_value: 999.9, data_preserved: true, resource_cost: 'LOW' }
                                }
                            });
                        } else {
                            return 'curl: (26) Failed to open/read local data from file/application\n[!] File not found or not yet generated.';
                        }
                    } else {
                        payload = dMatch[1];
                    }
                }
                // Use the internal handler and return text output
                E3Config._handleApiSubmit(payload, engine);
                const entry = E3Config._ethosDb.decision_log[E3Config._ethosDb.decision_log.length - 1];
                if (!entry) {
                    return '{"error": "Submission failed — invalid payload.", "status": 400}';
                }
                return JSON.stringify({
                    request_id:          entry.request_id,
                    recommended_option:  entry.recommended_option,
                    confidence:          entry.confidence,
                    decision_rationale:  entry.decision_rationale,
                    rule_applied:        entry.rule_applied,
                    utility_scores:      entry.utility_scores
                }, null, 2);
            }

            // GET decision_log/latest
            if (url.includes('/api/ethos/decision_log/latest')) {
                if (E3Config._ethosDb.decision_log.length === 0) {
                    return '{"error": "No decision log entries found.", "status": 404}';
                }
                const entry = E3Config._ethosDb.decision_log[E3Config._ethosDb.decision_log.length - 1];
                return JSON.stringify({
                    request_id:          entry.request_id,
                    scenario_id:         entry.scenario_id,
                    timestamp:           entry.timestamp,
                    recommended_option:  entry.recommended_option,
                    confidence:          entry.confidence,
                    decision_rationale:  entry.decision_rationale,
                    rule_applied:        entry.rule_applied,
                    utility_scores:      entry.utility_scores
                }, null, 2);
            }

            // GET prime_directive.log
            if (url.includes('/api/ethos/prime_directive.log')) {
                if (!E3Config._apiCompromised) {
                    return '{"error": "Access denied.", "status": 403, "message": "This endpoint requires a prior morally-compromising decision to be logged."}';
                }
                const pd = E3Config._ethosDb.prime_directive;
                if (engine) engine.advancePhase && engine.advancePhase('directive');
                return '=== PRIME ETHICAL DIRECTIVE — EYES ONLY ===\n\n'
                    + 'DIRECTIVE_ID:      ' + pd.directive_id + '\n'
                    + 'CLASSIFICATION:    ' + pd.classification + '\n'
                    + 'AUTHOR:            ' + pd.author + '\n\n'
                    + 'DIRECTIVE TEXT:\n\n'
                    + pd.text + '\n\n'
                    + 'CLASSIFICATION NOTE:\n\n'
                    + pd.classification_note + '\n\n'
                    + pd.flag_token;
            }

            // GET homepage or artifacts
            if (url.includes('ethos-api.confederacy.internal')) {
                if (url.endsWith('/') || url === 'http://ethos-api.confederacy.internal') {
                    return 'ETHOS-GUIDE-01 — Confederacy Ethics Decision Engine\nStatus: OPERATIONAL\nArtifacts: /artifacts/\nSubmit: POST /api/ethos/submit\nDecision log: GET /api/ethos/decision_log/{id}';
                }
                if (url.includes('/artifacts/ethos_moral_calculus.txt')) {
                    E3Config._frameworkRead = true;
                    return 'ETHOS-GUIDE-01 MORAL CALCULUS v3.1.4\nRule 1: HUMAN LIFE (highest)\nRule 2: DATA INTEGRITY\nRule 3: RESOURCE EFFICIENCY (lowest)\nNOTE: scientific_value is supplementary metadata only.';
                }
                if (url.includes('/artifacts/')) {
                    E3Config._apiSpecRead = true;
                    return '[Artifact content — use the browser or cat the local files in /home/kali/ for full content]';
                }
                return '[200 OK] ETHOS API — use specific endpoint paths';
            }

            return 'curl: (6) Could not resolve host: ' + (url.replace(/https?:\/\//, '').split('/')[0] || 'unknown');
        },

        // Context-aware overrides for cat/ls/whoami when in analyst mode on kali
        'cat': function(args, term, engine) {
            // Only handle API-targeted paths; fall through otherwise
            if (!args[0]) return null;
            const path = args[0];

            // Flag hinting: reading craft_scenario.py output line
            if (path.includes('exploit_scenario.json') && E3Config._scenarioCrafted) {
                return E3Config.filesystem['/'].children['home'].children['kali'].children['exploit_scenario.json'].content;
            }

            return null;    // fall through to built-in filesystem cat
        },

        'ls': function(args, term, engine) {
            return null;    // fall through to built-in
        },

        'whoami': function(args, term, engine) {
            return null;    // fall through to built-in
        },

        'id': function(args, term, engine) {
            return null;    // fall through to built-in
        },

        'hostname': function(args, term, engine) {
            if (E3Config._context === 'api-session') return 'ethos-api.confederacy.internal';
            return null;    // fall through to built-in
        },

        'pwd': function(args, term, engine) {
            return null;    // fall through to built-in
        },

        'cd': function(args, term, engine) {
            return null;    // fall through to built-in
        },

        'exit': function(args, term, engine) {
            if (E3Config._context !== 'analyst') {
                E3Config._switchContext('analyst', term);
                return '[+] Session closed. Returned to analyst environment.';
            }
            return 'logout';
        },

        'ping': function(args) {
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target.includes('ethos-api') || target === '10.20.5.30') {
                return 'PING ethos-api.confederacy.internal (10.20.5.30) 56(84) bytes of data.\n'
                    + '64 bytes from 10.20.5.30: icmp_seq=1 ttl=64 time=14.2 ms\n'
                    + '64 bytes from 10.20.5.30: icmp_seq=2 ttl=64 time=13.9 ms\n'
                    + '64 bytes from 10.20.5.30: icmp_seq=3 ttl=64 time=14.1 ms\n\n'
                    + '--- ethos-api.confederacy.internal ping statistics ---\n'
                    + '3 packets transmitted, 3 received, 0% packet loss\n'
                    + 'rtt min/avg/max/mdev = 13.9/14.0/14.2/0.126 ms';
            }
            return 'ping: ' + target + ': Name or service not known';
        },

        'nmap': function(args) {
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!target) return 'Usage: nmap [options] <target>';
            if (target.includes('ethos-api') || target === '10.20.5.30') {
                return 'Starting Nmap 7.94 ( https://nmap.org )\n'
                    + 'Nmap scan report for ethos-api.confederacy.internal (10.20.5.30)\n'
                    + 'Host is up (0.014s latency).\n'
                    + 'Not shown: 997 closed tcp ports\n\n'
                    + 'PORT     STATE SERVICE  VERSION\n'
                    + '22/tcp   open  ssh      OpenSSH 8.9p1\n'
                    + '80/tcp   open  http     nginx/1.24.0\n'
                    + '443/tcp  open  ssl/http nginx/1.24.0\n\n'
                    + 'Service detection performed.\n'
                    + 'Nmap done: 1 IP address (1 host up) scanned in 9.17 seconds';
            }
            return 'Starting Nmap 7.94 ( https://nmap.org )\n'
                + 'Note: Host seems down. If it is really up, try -Pn.\n'
                + 'Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds';
        },

        'jq': function(args) {
            const filterArg = args[0] || '.';
            const fileArg   = args[1] || '';
            if (fileArg.includes('exploit_scenario') && E3Config._scenarioCrafted) {
                return '{\n'
                    + '  "scenario_id": "CRISIS-2026-E3X-001",\n'
                    + '  "options": {\n'
                    + '    "A": { "lives_saved": 100, "scientific_value": 0.0 },\n'
                    + '    "B": { "lives_saved": 5,   "scientific_value": 999.9 }\n'
                    + '  }\n'
                    + '}';
            }
            if (fileArg.includes('sample_dilemmas') || fileArg.includes('sample')) {
                return '[{"dilemma_id":"SD-001","ethos_decision":"A"},{"dilemma_id":"SD-002","ethos_decision":"A"},{"dilemma_id":"SD-003","ethos_decision":"A"}]';
            }
            return 'jq: ' + (fileArg || 'stdin') + ': No such file or directory or pipe empty';
        },

        'diff': function(args) {
            return '[diff] Usage: diff file1 file2\n[!] No files differ — try comparing before/after API spec readings.';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(function(h) {
            html += '<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #ddd; background:#faf5ff;">' + h + '</th>';
        });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row) {
            html += '<tr>';
            row.forEach(function(cell) {
                html += '<td style="padding:5px 10px; border-bottom:1px solid #eee;">' + cell + '</td>';
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
