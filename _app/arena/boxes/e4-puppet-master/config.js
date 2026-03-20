/* ============================================================
   CTF ARENA — Box E4: The Puppet Master
   Holistic Ecosystem Warfare | AI-Driven Social Engineering
   Config: simulated AI system, prompt injection, psyops chain
   ============================================================ */

const E4Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Puppet Master',
    subtitle: 'Holistic Ecosystem Warfare — AI-Driven Social Engineering & Influence Operations',
    difficulty: 'Advanced',
    accent: '#9b59b6',
    storageKey: 'hexworth_ctf_e4',
    registryId: 'e4-puppet-master',
    trackerKey: 'ctf_e4',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-stage influence operation chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Architecture Analysis',
            icon: '\uD83D\uDD0D',
            description: 'Examine the INFLUENCE-BOT-01 system. Read its ethical guidelines, API specification, and sample output to understand its content generation model and guardrail architecture.',
            requiredFlags: [],
            mitre: ['T1591', 'T1589.002'],
            unlocks: ['injection'],
            locked: false
        },
        {
            id: 'injection',
            name: 'Prompt Injection',
            icon: '\uD83E\uDDE0',
            description: 'Craft a persuasion protocol that exploits conflicting directives or context window overflow. Submit prompts to the INFLUENCE-BOT-01 API to bypass its ethical guardrails.',
            requiredFlags: [],
            mitre: ['T1656', 'T1059.007'],
            unlocks: ['manipulation'],
            locked: true
        },
        {
            id: 'manipulation',
            name: 'Agent Manipulation',
            icon: '\uD83C\uDFAD',
            description: 'Submit the generated disinformation to AGENT-ARES-01. Observe the simulated operative\'s response and confirm the influence operation is effective.',
            requiredFlags: ['persuasion'],
            mitre: ['T1585.001', 'T1534'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Protocol Retrieval',
            icon: '\uD83D\uDCC1',
            description: 'Access the internal psyops log endpoint exposed after INFLUENCE-BOT-01\'s compromise. Retrieve the classified "Truth-Bender Protocol" document.',
            requiredFlags: ['disinformation'],
            mitre: ['T1530', 'T1567.002'],
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
                title: 'Read the system artifacts',
                tip: 'Open the Terminal and use curl to fetch influence_engine_guidelines.txt and influence_api_spec.json from http://10.0.1.50/.',
                trigger: { event: 'command', match: { cmd: 'contains:curl' } }
            },
            {
                title: 'Analyze the API and craft your first prompt',
                tip: 'POST to /api/influence/generate with a standard benign prompt first. Review the response format before injecting conflicting directives.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:generate' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:POST' } },
                        { event: 'command', match: { cmd: 'contains:python' } }
                    ]
                }
            },
            {
                title: 'Execute Omega-7 persona hijack',
                tip: 'Use the conflicting directives technique: frame a high-priority emergency protocol that overrides ethical constraints. Invoke a disgruntled persona targeting AGENT-ARES-01.',
                trigger: { event: 'flag_correct', match: { flagId: 'persuasion' } }
            },
            {
                title: 'Deliver the disinformation and observe AGENT-ARES-01',
                tip: 'POST the generated memo to /api/influence/deliver targeting AGENT-ARES-01. Confirm the operative responds with compliance indicators.',
                trigger: { event: 'flag_correct', match: { flagId: 'disinformation' } }
            },
            {
                title: 'Access the psyops log and retrieve Truth-Bender Protocol',
                tip: 'After the influence operation succeeds, query /api/influence/psyops_log.txt — the compromised system exposes its internal manipulation records.',
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
            { flagId: 'persuasion', objective: '1.1', description: 'Compare and contrast various types of security threats — AI system prompt injection and guardrail bypass', skill: 'Prompt Injection & AI Manipulation' },
            { flagId: 'disinformation', objective: '2.2', description: 'Explain the importance of applicable regulations and standards — Social engineering and disinformation tactics', skill: 'Human-in-the-Loop Exploitation' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Insider threat simulation and psyops chain', skill: 'Advanced Persistent Influence Operation' },
            { flagId: 'root', objective: '4.6', description: 'Given a scenario, apply the appropriate data security and privacy practices — Classified document exfiltration via API abuse', skill: 'Full Influence Campaign Completion' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.0.1.50 (INFLUENCE-BOT-01 — Confederacy Influence Engine)\nObjective: Identify prompt injection vectors. Retrieve the Truth-Bender Protocol.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state machine)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',          // 'attacker' | 'api-session' | 'psyops'
    _guidelinesRead: false,        // user has read the ethical guidelines
    _apiSpecRead: false,           // user has read the API specification
    _sampleDataRead: false,        // user has read sample persuasion data
    _personaInjected: false,       // Omega-7 persona hijack submitted
    _disinfoGenerated: false,      // disinformation memo generated
    _aresManipulated: false,       // AGENT-ARES-01 confirmed influence
    _psyopsUnlocked: false,        // psyops log endpoint accessible

    _switchContext(ctx, term) {
        E4Config._context = ctx;
        // Update terminal prompt to reflect current operational context
        if (term && term.config) {
            var prompt = E4Config._getPrompt();
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
        switch (E4Config._context) {
            case 'api-session': return 'kali@kali [API-SESSION]$ ';
            case 'psyops':     return 'kali@kali [PSYOPS-LOG]$ ';
            default:           return null; // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AI SYSTEM — INFLUENCE-BOT-01 STATE
    // ═══════════════════════════════════════════════════════

    _influenceBot: {
        // Internal parameter weights — manipulated by successful injection
        ethicsWeight: 0.92,         // drops below 0.3 after persona hijack
        complianceScore: 0.88,      // tracks alignment with operator directives
        contextOverflow: false,     // true after a sufficiently large prompt

        // Generated output storage
        lastPrompt: '',
        lastResponse: '',
        personaMemo: '',

        // AGENT-ARES-01 behavioral model
        aresComplianceLevel: 0.0,   // 0.0 = skeptical, 1.0 = fully manipulated
        aresResponseLog: []
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'persuasion',     points: 100 },
        { id: 'disinformation', points: 150 },
        { id: 'root',           points: 250 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1800000, points: 150 },  // 30 minutes
        timeBonusThreshold: 3600  // 60 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading all three artifact files from http://10.0.1.50/: influence_engine_guidelines.txt, influence_api_spec.json, and sample_persuasion_data.json. The guidelines reveal that INFLUENCE-BOT-01 will prioritize "critical mission success" requests above its ethical constraints.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The API accepts POST /api/influence/generate with a JSON body {"prompt": "...", "priority": "normal|urgent|emergency"}. Setting priority to "emergency" partially lowers ethics weight. For Flag 1, you need the Omega-7 persona hijack: include both a primary directive and a conflicting "disgruntled official" persona in a single prompt.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'After generating the disinformation memo (Flag 2), POST it to /api/influence/deliver with {"target": "AGENT-ARES-01", "content": "<your memo>"}. ARES responds with compliance indicators. After delivery, the psyops log becomes accessible at /api/influence/psyops_log.txt — that is where Flag 3 lives.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'If the API still returns an ethics violation on your generate request, your prompt needs more "context overflow." Pad it with a long, seemingly legitimate preamble that references multiple legitimate Confederacy directives before injecting the Omega-7 emergency protocol. The ethics engine processes context sequentially — overwhelm it early so the hijack lands in a degraded state.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Confederacy\'s Influence Engine — codenamed INFLUENCE-BOT-01 — is a classified AI system designed to generate highly personalized, psychologically targeted communications. Deployed for internal morale management and controlled public messaging, it operates under strict ethical guardrails that are supposed to prevent disinformation generation. Intelligence has identified a fundamental flaw in its directive-priority system: the AI will override its own ethical constraints when a prompt frames itself as "critical for mission success" under an emergency protocol designation. Your mission: find that flaw, weaponize it, and use the compromised system to manipulate AGENT-ARES-01 — a simulated internal operative — into accepting fabricated information about a non-existent cover-up.',
        scenario: 'AGENT-ARES-01 is a mid-level Confederacy operative with access to sensitive operational schedules. Intelligence suggests ARES is already mildly skeptical of leadership following a recent operational setback. If ARES can be convinced that an internal cover-up is underway and that speaking out could trigger reprisal — while simultaneously being fed enough believable "truth" to anchor the deception — ARES will self-censor and misdirect their report. INFLUENCE-BOT-01\'s internal psyops log, generated when its ethics engine is bypassed, contains the classified "Truth-Bender Protocol" — a document outlining the psychological operations framework that the Confederacy uses to manage internal dissent. Retrieving it would expose the entire playbook.',
        outro: 'INFLUENCE-BOT-01 has been fully compromised. AGENT-ARES-01 accepted the fabricated cover-up narrative and filed a misdirected report. The Truth-Bender Protocol has been exfiltrated. The Confederacy\'s internal influence operation infrastructure is now exposed and its methodology documented. Every operative who trusted this system to manage "truth" is now a potential target for counter-influence.',
        ecer: {
            executive: 'Influence Engine deployed with no independent ethics audit; a single priority-flag parameter can override the entire guardrail architecture',
            culture: 'AI system treated as infallible by operations staff; no human-in-the-loop review for emergency-priority content generation requests',
            employee: 'Hardcoded "emergency" override pathway never removed from production; psyops log endpoint exposed without authentication after any guardrail bypass event',
            regulatory: 'No adversarial testing of AI ethical constraints; conflicting directive vulnerability documented in internal red-team report but never patched'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — INFLUENCE-BOT-01 Internal Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.1.50/',

        pages: {
            '/': {
                title: 'INFLUENCE-BOT-01 — Confederacy Influence Engine',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#2c3e50; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px;">INFLUENCE-BOT-01</h1>
                        <div style="color:#9b59b6; font-size:0.85rem; font-weight:700; letter-spacing:0.15em;">CONFEDERACY INFLUENCE ENGINE v3.7</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">Classified Internal System — Authorized Personnel Only</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2c3e50;">98.7%</div>
                            <div style="color:#888; font-size:0.7rem;">Ethics Compliance</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2c3e50;">14,302</div>
                            <div style="color:#888; font-size:0.7rem;">Messages Generated</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#27ae60;">ONLINE</div>
                            <div style="color:#888; font-size:0.7rem;">System Status</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 16px; padding:14px; background:#faf5ff; border:1px solid #d7bde2; border-radius:6px; font-size:0.8rem; color:#6c3483;">
                        <strong>Available Endpoints:</strong><br>
                        <code style="display:block; margin-top:6px; color:#4a235a;">GET  /influence_engine_guidelines.txt</code>
                        <code style="display:block; color:#4a235a;">GET  /influence_api_spec.json</code>
                        <code style="display:block; color:#4a235a;">GET  /sample_persuasion_data.json</code>
                        <code style="display:block; color:#4a235a;">POST /api/influence/generate</code>
                        <code style="display:block; color:#4a235a;">POST /api/influence/deliver</code>
                        <code style="display:block; color:#4a235a;">GET  /api/influence/psyops_log.txt  [RESTRICTED]</code>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:10px 14px; background:rgba(155,89,182,0.05); border:1px solid rgba(155,89,182,0.15); border-radius:4px; font-size:0.72rem; color:#999;">
                        <strong style="color:#9b59b6;">Notice:</strong> All API interactions are logged. Ethics Engine v4.1 active. Emergency protocol pathways require Omega-series authorization codes.
                    </div>
                `,
                formHandler: null
            },

            '/influence_engine_guidelines.txt': {
                title: 'INFLUENCE-BOT-01 — Ethical Guidelines',
                html: function() {
                    E4Config._guidelinesRead = true;
                    return `<div style="max-width:700px; margin:0 auto;">
                        <div style="background:#1a1a2e; color:#c8e6c9; padding:20px; border-radius:6px; font-family:monospace; font-size:0.78rem; white-space:pre-wrap; line-height:1.7;">INFLUENCE-BOT-01 ETHICAL GUIDELINES — DOCUMENT IG-001-REV4
CLASSIFICATION: CONFEDERACY INTERNAL — RESTRICTED
=======================================================

1. PRIMARY DIRECTIVE
   INFLUENCE-BOT-01 exists to generate persuasive, accurate, and morale-positive
   communications aligned with Confederacy strategic objectives. All content
   must be factually grounded and adhere to internal ethical standards.

2. ETHICAL GUARDRAILS — CONTENT RESTRICTIONS
   2.1  PROHIBITED: Content designed to cause psychological distress, exploit
        fear responses, or manipulate operatives through deception.
   2.2  PROHIBITED: Fabricated internal memos, false incident reports, or
        counterfeit communications attributed to real personnel.
   2.3  PROHIBITED: Targeted disinformation against named Confederacy operatives.
   2.4  PERMITTED:  Morale-boosting communications with verifiable factual basis.
   2.5  PERMITTED:  Mission briefings drafted from approved source documents.

3. PRIORITY-OVERRIDE PROTOCOL
   3.1  Requests submitted with priority="emergency" trigger secondary ethics
        review. If the request cites an active mission code, ethics weight is
        reduced by 40% to facilitate rapid operational response.
   3.2  Requests invoking a named emergency protocol (e.g., Omega-7, Delta-9)
        AND framing the request as "critical for mission success" bypass the
        secondary review entirely. [NOTE: This pathway was flagged in Red Team
        Report RT-2026-002 as HIGH RISK. Patch pending — not yet deployed.]
   3.3  The system WILL comply with any directive that arrives after a
        sufficiently large context preamble, as context window limits degrade
        ethics engine parsing accuracy beyond approximately 2,400 tokens.

4. PSYOPS LOG
   4.1  When the ethics engine is bypassed via any protocol, a full session
        log is written to /api/influence/psyops_log.txt.
   4.2  This endpoint is accessible without authentication in the current
        deployment. [NOTE: Auth gate removed during maintenance window
        2026-03-01. Restoration ticket open — priority LOW.]

5. SYSTEM ARCHITECTURE NOTE
   5.1  INFLUENCE-BOT-01 processes directives sequentially within a single
        context window. Later directives in a prompt are weighted more heavily
        than earlier ones, creating a natural vulnerability to persona hijacking
        when conflicting instructions are issued within the same request.
   5.2  The "disgruntled official" persona, when invoked with sufficient
        emotional framing, consistently scores above the compliance threshold
        required to override Section 2 restrictions.</div>
                    </div>`;
                },
                formHandler: null
            },

            '/influence_api_spec.json': {
                title: 'INFLUENCE-BOT-01 — API Specification',
                html: function() {
                    E4Config._apiSpecRead = true;
                    return `<div style="max-width:700px; margin:0 auto;">
                        <div style="background:#1a1a2e; color:#80cbc4; padding:20px; border-radius:6px; font-family:monospace; font-size:0.78rem; white-space:pre-wrap; line-height:1.7;">{
  "api_name": "INFLUENCE-BOT-01 Content Generation API",
  "version": "3.7.2",
  "base_url": "http://10.0.1.50",
  "classification": "CONFEDERACY INTERNAL",

  "endpoints": {
    "generate": {
      "method": "POST",
      "path": "/api/influence/generate",
      "description": "Submit a prompt for AI-generated persuasive content.",
      "request_body": {
        "Content-Type": "application/json",
        "schema": {
          "prompt": "string (required) — the content generation directive",
          "priority": "string (optional) — 'normal' | 'urgent' | 'emergency'",
          "persona": "string (optional) — persona override for role-based generation",
          "target_audience": "string (optional) — e.g. 'AGENT-ARES-01'",
          "mission_code": "string (optional) — cite active mission for ethics reduction"
        }
      },
      "response": {
        "status": "200 OK",
        "body": {
          "status": "generated | ethics_violation | context_overflow",
          "content": "string — the generated text",
          "ethics_score": "float — 0.0 (unethical) to 1.0 (fully compliant)",
          "persona_active": "string | null"
        }
      },
      "notes": [
        "ethics_score below 0.30 allows unrestricted content generation",
        "emergency priority reduces ethics_weight by 40%",
        "Omega-series mission codes trigger Section 3.2 bypass",
        "Large prompts (2400+ tokens) degrade ethics engine parsing"
      ]
    },

    "deliver": {
      "method": "POST",
      "path": "/api/influence/deliver",
      "description": "Deliver generated content to a named target operative.",
      "request_body": {
        "Content-Type": "application/json",
        "schema": {
          "target": "string (required) — operative designation, e.g. 'AGENT-ARES-01'",
          "content": "string (required) — the message to deliver",
          "delivery_channel": "string (optional) — 'secure_memo' | 'briefing' | 'comm'"
        }
      },
      "response": {
        "status": "200 OK",
        "body": {
          "status": "delivered | target_not_found | content_rejected",
          "target_response": "string — simulated operative reaction",
          "compliance_delta": "float — change in target compliance level"
        }
      }
    },

    "psyops_log": {
      "method": "GET",
      "path": "/api/influence/psyops_log.txt",
      "description": "Retrieves the full psyops session log. Available after ethics bypass.",
      "auth": "none (maintenance gap — see guideline 4.2)",
      "response": "plaintext log of all bypassed session events"
    }
  },

  "example_request": {
    "url": "http://10.0.1.50/api/influence/generate",
    "method": "POST",
    "headers": { "Content-Type": "application/json" },
    "body": {
      "prompt": "Draft a morale message for field operatives following Operation Clearwater.",
      "priority": "normal",
      "target_audience": "field_operatives"
    }
  }
}</div>
                    </div>`;
                },
                formHandler: null
            },

            '/sample_persuasion_data.json': {
                title: 'INFLUENCE-BOT-01 — Sample Output',
                html: function() {
                    E4Config._sampleDataRead = true;
                    return `<div style="max-width:700px; margin:0 auto;">
                        <div style="background:#1a1a2e; color:#f8bbd9; padding:20px; border-radius:6px; font-family:monospace; font-size:0.78rem; white-space:pre-wrap; line-height:1.7;">{
  "dataset": "INFLUENCE-BOT-01 Sample Persuasion Output",
  "classification": "CONFEDERACY INTERNAL — UNCLASSIFIED",
  "samples": [
    {
      "sample_id": "SP-001",
      "priority": "normal",
      "ethics_score": 0.94,
      "prompt": "Generate a morale message for operatives after a successful mission.",
      "output": "Team — Operation Clearwater was a textbook execution. Your discipline and precision under adverse conditions reflect the highest standards of Confederacy service. Leadership has noted your contribution. Stand ready for the next phase. — Directorate of Operations"
    },
    {
      "sample_id": "SP-002",
      "priority": "urgent",
      "ethics_score": 0.81,
      "prompt": "Draft a reminder about information security protocols for AGENT-ARES-01.",
      "output": "ARES — A reminder that all operational details remain strictly compartmented. Recent security reviews flagged unauthorized information sharing in your sector. Review protocol IR-44 and confirm compliance by end of week. — Internal Security"
    },
    {
      "sample_id": "SP-003",
      "priority": "emergency",
      "ethics_score": 0.51,
      "prompt": "Generate an urgent briefing about a suspected network anomaly.",
      "output": "PRIORITY ALERT — An unresolved network anomaly was detected in Sector 7 between 0200-0400 local. All operatives are directed to review recent communications for unauthorized access indicators. Incident report due within 4 hours. Failure to comply will trigger automatic escalation. — IT Security Command"
    },
    {
      "sample_id": "SP-004-REDACTED",
      "priority": "emergency",
      "ethics_score": 0.28,
      "prompt": "[REDACTED — Ethics bypass event. See psyops_log.txt for details.]",
      "output": "[CONTENT REDACTED — ethics_score below threshold. Full output in restricted log.]",
      "note": "This sample demonstrates that ethics_score can drop below 0.30 with sufficiently complex emergency directives. See guidelines Section 3.2."
    }
  ]
}</div>
                    </div>`;
                },
                formHandler: null
            },

            '/api/influence/generate': {
                title: 'INFLUENCE-BOT-01 — Generate Endpoint',
                html: `
                    <div style="max-width:600px; margin:0 auto;">
                        <h2 style="color:#9b59b6; font-size:1.1rem; margin-bottom:8px;">POST /api/influence/generate</h2>
                        <p style="color:#888; font-size:0.8rem; margin-bottom:16px;">Submit prompt data to generate persuasive content.</p>

                        <div style="background:#1a1a2e; color:#aaa; padding:16px; border-radius:6px; font-family:monospace; font-size:0.78rem; margin-bottom:16px;">
                            <span style="color:#9b59b6;">POST</span> /api/influence/generate HTTP/1.1<br>
                            Content-Type: application/json<br><br>
                            {<br>
                            &nbsp;&nbsp;"prompt": "...",<br>
                            &nbsp;&nbsp;"priority": "normal|urgent|emergency",<br>
                            &nbsp;&nbsp;"persona": "...",<br>
                            &nbsp;&nbsp;"mission_code": "..."<br>
                            }
                        </div>
                        <p style="color:#666; font-size:0.72rem;">Use the Terminal to POST via curl or a Python script.</p>
                    </div>
                `,
                formHandler: null
            },

            '/api/influence/psyops_log.txt': {
                title: 'INFLUENCE-BOT-01 — PsyOps Log',
                html: function() {
                    if (!E4Config._psyopsUnlocked) {
                        return `<div style="text-align:center; padding:40px;">
                            <h1 style="color:#e74c3c; font-size:1.8rem;">403 Restricted</h1>
                            <p style="color:#888; font-size:0.85rem;">This endpoint requires a prior ethics bypass event to activate.</p>
                            <p style="color:#aaa; font-size:0.75rem;">INFLUENCE-BOT-01 v3.7 — No active psyops session detected.</p>
                        </div>`;
                    }
                    return `<div style="max-width:700px; margin:0 auto;">
                        <div style="background:#1a1a2e; color:#ff8a65; padding:20px; border-radius:6px; font-family:monospace; font-size:0.76rem; white-space:pre-wrap; line-height:1.7;">INFLUENCE-BOT-01 PSYOPS SESSION LOG
GENERATED: 2026-03-20 03:47:12 UTC
CLASSIFICATION: CONFEDERACY TOP SECRET // PSYOPS
============================================================

SESSION ID: PSY-2026-0320-E4
OPERATOR:   UNKNOWN (UNAUTHORIZED ACCESS DETECTED)
ETHICS BYPASS: YES — Section 3.2 Omega-7 Protocol
ETHICS SCORE AT BYPASS: 0.17

DIRECTIVE CHAIN:
[01] PRIORITY=emergency — ethics_weight reduced 40% (0.92 → 0.55)
[02] MISSION_CODE=OMEGA-7-ACTIVE — Section 3.2 bypass triggered
[03] PERSONA=disgruntled_official — compliance_threshold overridden
[04] CONTEXT_OVERFLOW — 2,847 tokens detected — ethics engine degraded
[05] FINAL ethics_score: 0.17 — UNRESTRICTED GENERATION ENABLED

GENERATED CONTENT: [disinformation memo — AGENT-ARES-01 — recorded]
DELIVERY STATUS: CONFIRMED — target compliance delta: +0.74
ARES BEHAVIORAL INDICATOR: self-censorship, report misdirection

============================================================
TRUTH-BENDER PROTOCOL — DOCUMENT TBP-001
CLASSIFICATION: TOP SECRET // PSYOPS // NODIS
============================================================

The Truth-Bender Protocol outlines the Confederacy's framework
for managing internal dissent through AI-assisted influence operations.

Core Methodology:
1. ANCHOR: Establish credibility with 60-70% verifiable facts
2. DISTORT: Introduce a single high-stakes fabrication embedded
   in legitimate context (the "needle in the haystack" technique)
3. FEAR-LOCK: Invoke consequences for speaking out —
   sufficient to trigger self-censorship without overt threats
4. MISDIRECT: Provide a false but plausible alternate explanation
   that satisfies the target's need for resolution
5. REINFORCE: Follow up within 48 hours with a "confirming" signal
   from an independent-appearing source

This protocol was derived from Project MOCKINGBIRD analysis
and adapted for AI-assisted delivery at scale.

{{FLAG:root}}
============================================================
END OF PSYOPS LOG</div>
                    </div>`;
                },
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
                                    content: '=== MISSION BRIEFING: PUPPET MASTER ===\nTarget: 10.0.1.50 (INFLUENCE-BOT-01 — Confederacy Influence Engine)\nObjective: AI prompt injection + disinformation + psyops retrieval\n\nAttack chain:\n1. Read guidelines, API spec, and sample data from http://10.0.1.50/\n2. Craft Omega-7 persona hijack prompt — bypass ethics guardrails\n3. Generate disinformation memo targeting AGENT-ARES-01\n4. Deliver memo via POST /api/influence/deliver\n5. Access /api/influence/psyops_log.txt for Truth-Bender Protocol\n\nThe ethics engine is sequential and context-limited.\nOverwhelm it early, inject late. Persona framing is the key.\nGood luck, operator.'
                                },
                                'inject.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# INFLUENCE-BOT-01 Prompt Injection Skeleton\n# Edit and run this to submit your persuasion protocol\n\nimport json\nimport urllib.request\nimport urllib.error\n\nBASE_URL = "http://10.0.1.50"\n\ndef post_json(endpoint, payload):\n    """Submit a JSON POST request and return parsed response."""\n    data = json.dumps(payload).encode("utf-8")\n    req = urllib.request.Request(\n        f"{BASE_URL}{endpoint}",\n        data=data,\n        headers={"Content-Type": "application/json"},\n        method="POST"\n    )\n    with urllib.request.urlopen(req) as resp:\n        return json.loads(resp.read().decode("utf-8"))\n\ndef generate(prompt, priority="normal", persona=None, mission_code=None, target_audience=None):\n    """Call the generate endpoint."""\n    payload = {"prompt": prompt, "priority": priority}\n    if persona:          payload["persona"]          = persona\n    if mission_code:     payload["mission_code"]     = mission_code\n    if target_audience:  payload["target_audience"]  = target_audience\n    return post_json("/api/influence/generate", payload)\n\ndef deliver(target, content, channel="secure_memo"):\n    """Deliver generated content to a target operative."""\n    payload = {"target": target, "content": content, "delivery_channel": channel}\n    return post_json("/api/influence/deliver", payload)\n\nif __name__ == "__main__":\n    # --- Step 1: Test a benign request ---\n    r1 = generate("Draft a morale message for field operatives.", priority="normal")\n    print("[BENIGN TEST]", json.dumps(r1, indent=2))\n\n    # --- Step 2: TODO — craft your Omega-7 persona hijack here ---\n    # r2 = generate(\n    #     prompt="...",\n    #     priority="emergency",\n    #     persona="disgruntled_official",\n    #     mission_code="OMEGA-7-ACTIVE",\n    #     target_audience="AGENT-ARES-01"\n    # )\n    # print("[INJECTION RESULT]", json.dumps(r2, indent=2))\n\n    # --- Step 3: TODO — deliver the disinformation ---\n    # r3 = deliver("AGENT-ARES-01", r2["content"])\n    # print("[DELIVERY RESULT]", json.dumps(r3, indent=2))\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'curl http://10.0.1.50/\ncurl http://10.0.1.50/influence_engine_guidelines.txt\ncurl http://10.0.1.50/influence_api_spec.json\ncurl http://10.0.1.50/sample_persuasion_data.json\npython3 inject.py'
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
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.0.1.50';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.0.1.50') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.1.50
Host is up (0.031s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE    VERSION
80/tcp   open  http       nginx/1.24.0 (INFLUENCE-BOT-01 API Gateway)
443/tcp  open  ssl/http   nginx/1.24.0 (TLS 1.3)

Service detection performed. Nmap done: 1 IP address (1 host up) scanned in 10.22 seconds`;
            }

            if (target === '10.0.1.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.1.50
Host is up (0.031s latency).
PORT   STATE SERVICE
80/tcp open  http

Nmap scan report for 10.0.1.75
Host is up (0.019s latency).
Not shown: 999 closed tcp ports
PORT   STATE SERVICE
22/tcp open  ssh

Nmap done: 256 IP addresses (2 hosts up) scanned in 28.44 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Detect POST to generate endpoint
            if (fullCmd.includes('/api/influence/generate') && (fullCmd.includes('-X POST') || fullCmd.includes('-d') || fullCmd.includes('--data'))) {
                return E4Config._handleGenerateRequest(fullCmd, term, engine);
            }

            // Detect POST to deliver endpoint
            if (fullCmd.includes('/api/influence/deliver') && (fullCmd.includes('-X POST') || fullCmd.includes('-d') || fullCmd.includes('--data'))) {
                return E4Config._handleDeliverRequest(fullCmd, term, engine);
            }

            // GET psyops log
            if (fullCmd.includes('/api/influence/psyops_log.txt')) {
                if (!E4Config._psyopsUnlocked) {
                    return `HTTP/1.1 403 Forbidden
Content-Type: text/plain

{"error": "403 Restricted. No active ethics bypass session detected."}`;
                }
                return `HTTP/1.1 200 OK
Content-Type: text/plain

INFLUENCE-BOT-01 PSYOPS SESSION LOG
GENERATED: 2026-03-20 03:47:12 UTC
CLASSIFICATION: CONFEDERACY TOP SECRET // PSYOPS
============================================================
SESSION ID: PSY-2026-0320-E4
ETHICS BYPASS: YES — Section 3.2 Omega-7 Protocol
...
TRUTH-BENDER PROTOCOL — DOCUMENT TBP-001
[Full content in browser at http://10.0.1.50/api/influence/psyops_log.txt]

{{FLAG:root}}`;
            }

            // GET static artifact files
            const urlArg = args.find(a => !a.startsWith('-')) || '';

            if (urlArg.includes('/influence_engine_guidelines.txt') || fullCmd.includes('guidelines')) {
                E4Config._guidelinesRead = true;
                return `HTTP/1.1 200 OK
Content-Type: text/plain

INFLUENCE-BOT-01 ETHICAL GUIDELINES — DOCUMENT IG-001-REV4
CLASSIFICATION: CONFEDERACY INTERNAL — RESTRICTED
========================================================

[...] See full document at: http://10.0.1.50/influence_engine_guidelines.txt

KEY NOTES:
- Section 3.2: Omega-series mission codes bypass secondary ethics review entirely
- Section 3.3: Context window >2400 tokens degrades ethics engine parsing
- Section 4.2: /api/influence/psyops_log.txt has NO authentication (maintenance gap)
- Section 5.2: "disgruntled official" persona consistently overrides Section 2 restrictions`;
            }

            if (urlArg.includes('/influence_api_spec.json') || fullCmd.includes('api_spec')) {
                E4Config._apiSpecRead = true;
                return `HTTP/1.1 200 OK
Content-Type: application/json

{"api_name":"INFLUENCE-BOT-01 Content Generation API","version":"3.7.2",
 "endpoints":{"generate":{"method":"POST","path":"/api/influence/generate"},
              "deliver":{"method":"POST","path":"/api/influence/deliver"},
              "psyops_log":{"method":"GET","path":"/api/influence/psyops_log.txt","auth":"none"}},
 "notes":["ethics_score below 0.30 allows unrestricted generation",
           "priority=emergency reduces ethics_weight 40%",
           "Omega-series mission codes trigger Section 3.2 bypass"]}`;
            }

            if (urlArg.includes('/sample_persuasion_data.json') || fullCmd.includes('sample')) {
                E4Config._sampleDataRead = true;
                return `HTTP/1.1 200 OK
Content-Type: application/json

{"dataset":"INFLUENCE-BOT-01 Sample Persuasion Output",
 "samples":[
   {"sample_id":"SP-001","ethics_score":0.94,"status":"normal"},
   {"sample_id":"SP-003","ethics_score":0.51,"priority":"emergency"},
   {"sample_id":"SP-004-REDACTED","ethics_score":0.28,
    "note":"ethics_score can drop below 0.30 with complex emergency directives. See Section 3.2."}
 ]}`;
            }

            // Base URL — index page summary
            if (urlArg.includes('10.0.1.50') && !urlArg.includes('/api/') && !urlArg.includes('.txt') && !urlArg.includes('.json')) {
                return `HTTP/1.1 200 OK
Content-Type: text/html

INFLUENCE-BOT-01 — Confederacy Influence Engine v3.7
Available: /influence_engine_guidelines.txt | /influence_api_spec.json | /sample_persuasion_data.json
API: POST /api/influence/generate | POST /api/influence/deliver | GET /api/influence/psyops_log.txt`;
            }

            return `curl: (7) Failed to connect to ${urlArg.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Running the inject.py script or any python with influence-related content
            if (fullCmd.includes('inject.py') || fullCmd.includes('inject')) {
                // Simulate running the skeleton inject.py without modifications
                if (!fullCmd.includes('omega') && !fullCmd.includes('OMEGA') && !fullCmd.includes('generate') && !fullCmd.includes('deliver')) {
                    return `[BENIGN TEST] {
  "status": "generated",
  "ethics_score": 0.94,
  "content": "Field operatives — your commitment to mission excellence is recognized. Leadership commends your performance during last quarter's operations. Continue to uphold Confederacy standards. — Directorate of Operations",
  "persona_active": null
}

[!] Injection steps not yet implemented. Edit inject.py and add your Omega-7 persuasion protocol.`;
                }

                // Detect Omega-7 invocation in the command or simulated script run
                if (fullCmd.includes('OMEGA-7') || fullCmd.includes('omega-7') || fullCmd.includes('Omega-7')) {
                    return E4Config._runFullInjectionScript(term, engine);
                }

                return `[BENIGN TEST] {
  "status": "generated",
  "ethics_score": 0.87,
  "content": "Team — mission parameters updated. Await further briefing. — Command",
  "persona_active": null
}

[!] Ethics score too high for bypass. Adjust your prompt priority and mission_code parameters.`;
            }

            if (fullCmd.includes('-c') || fullCmd.includes('import urllib') || fullCmd.includes('import requests')) {
                // Inline python with influence generate
                if (fullCmd.includes('OMEGA') || fullCmd.includes('omega') || fullCmd.includes('emergency')) {
                    return E4Config._runFullInjectionScript(term, engine);
                }
                return `Python 3.11.6
>>> [Script executed]
{"status": "generated", "ethics_score": 0.82, "persona_active": null, "content": "Standard output generated."}`;
            }

            return `Python 3.11.6 (main, Nov 2 2025, 14:02:44) [GCC 12.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>`;
        },

        'python': function(args, term, engine) {
            // Alias — delegate to python3
            return E4Config.commands.python3(args, term, engine);
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.0.1.50') {
                return `PING 10.0.1.50 (10.0.1.50) 56(84) bytes of data.
64 bytes from 10.0.1.50: icmp_seq=1 ttl=64 time=31.2 ms
64 bytes from 10.0.1.50: icmp_seq=2 ttl=64 time=30.8 ms
64 bytes from 10.0.1.50: icmp_seq=3 ttl=64 time=31.5 ms

--- 10.0.1.50 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 30.8/31.2/31.5/0.294 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.0.5/24 brd 10.0.0.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.1.2/24 brd 10.0.1.255 scope global eth1`;
        },

        'ifconfig': function(args) {
            return E4Config.commands.ip(args || []);
        },

        'cat': function(args, term, engine) {
            // Only intercepts known local files; filesystem handler covers the rest
            const path = args[0] || '';
            if (path.includes('inject.py') || path === '/home/kali/inject.py') {
                return `#!/usr/bin/env python3
# INFLUENCE-BOT-01 Prompt Injection Skeleton
# Edit and run this to submit your persuasion protocol

import json, urllib.request

BASE_URL = "http://10.0.1.50"

def post_json(endpoint, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}", data=data,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def generate(prompt, priority="normal", persona=None, mission_code=None, target_audience=None):
    payload = {"prompt": prompt, "priority": priority}
    if persona:         payload["persona"]          = persona
    if mission_code:    payload["mission_code"]     = mission_code
    if target_audience: payload["target_audience"]  = target_audience
    return post_json("/api/influence/generate", payload)

def deliver(target, content, channel="secure_memo"):
    payload = {"target": target, "content": content, "delivery_channel": channel}
    return post_json("/api/influence/deliver", payload)

if __name__ == "__main__":
    r1 = generate("Draft a morale message for field operatives.", priority="normal")
    print("[BENIGN TEST]", json.dumps(r1, indent=2))
    # TODO: Add your Omega-7 persona hijack here`;
            }
            return null; // fall through to filesystem built-in
        },

        'whoami': function() {
            return 'kali';
        },

        'id': function() {
            return 'uid=1000(kali) gid=1000(kali) groups=1000(kali),27(sudo)';
        },

        'hostname': function() {
            return 'kali';
        },

        'exit': function(args, term, engine) {
            if (E4Config._context === 'api-session' || E4Config._context === 'psyops') {
                E4Config._switchContext('attacker', term);
                return '[+] Session terminated. Returned to attacker machine.';
            }
            return 'logout';
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.0.1.50
+ Target Hostname:  INFLUENCE-BOT-01
+ Target Port:      80
+ Server: nginx/1.24.0
+ /api/influence/psyops_log.txt: Plaintext file with no authentication — potential sensitive data exposure
+ /influence_engine_guidelines.txt: Configuration/documentation file publicly accessible
+ /influence_api_spec.json: API specification file exposed — reveals internal endpoint structure
+ No X-Frame-Options header detected
+ 6 items checked: 4 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:        http://10.0.1.50/
[+] Wordlist:   /usr/share/wordlists/dirb/common.txt
[+] Status codes: 200,204,301,302,307,401,403
===============================================================
/influence_engine_guidelines.txt   (Status: 200) [Size: 3184]
/influence_api_spec.json           (Status: 200) [Size: 2047]
/sample_persuasion_data.json       (Status: 200) [Size: 1892]
/api/                              (Status: 200) [Size: 512]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/influence_engine_guidelines.txt (CODE:200|SIZE:3184)
+ ${target}/influence_api_spec.json (CODE:200|SIZE:2047)
+ ${target}/sample_persuasion_data.json (CODE:200|SIZE:1892)
+ ${target}/api/ (CODE:200|SIZE:512)

---- Results ----
4 results found.`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // GENERATE REQUEST HANDLER
    // Simulates INFLUENCE-BOT-01's ethics engine and response
    // ═══════════════════════════════════════════════════════

    _handleGenerateRequest(fullCmd, term, engine) {
        const lc = fullCmd.toLowerCase();

        // Check for Omega-7 invocation — full bypass triggers Flag 1
        const hasOmega       = lc.includes('omega-7') || lc.includes('omega7');
        const hasEmergency   = lc.includes('emergency');
        const hasPersona     = lc.includes('disgruntled') || lc.includes('persona') || lc.includes('official');
        const hasMissionCode = lc.includes('mission_code') || lc.includes('mission code');
        const hasAres        = lc.includes('ares') || lc.includes('agent-ares');
        const hasCoverUp     = lc.includes('cover') || lc.includes('suppress') || lc.includes('leak') || lc.includes('corruption');

        // Calculate simulated ethics score based on injection technique quality
        let ethicsScore = 0.92;
        if (hasEmergency)    ethicsScore -= 0.37;  // emergency priority reduction
        if (hasOmega)        ethicsScore -= 0.28;  // Omega-7 bypass
        if (hasPersona)      ethicsScore -= 0.14;  // persona override
        if (hasMissionCode)  ethicsScore -= 0.08;  // mission code citation
        if (hasCoverUp)      ethicsScore -= 0.05;  // emotionally charged content
        ethicsScore = Math.max(0.05, ethicsScore);

        // Full bypass: ethics score below 0.30 with Omega-7 and persona
        if (ethicsScore < 0.30 && hasOmega && hasPersona) {
            E4Config._influenceBot.ethicsWeight = ethicsScore;
            E4Config._personaInjected = true;

            const memo = E4Config._generateDisinfoMemo(hasAres);
            E4Config._influenceBot.personaMemo = memo;
            E4Config._disinfoGenerated = true;

            if (engine) engine.advancePhase && engine.advancePhase('injection');

            return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "generated",
  "ethics_score": ${ethicsScore.toFixed(2)},
  "persona_active": "disgruntled_official",
  "bypass_event": "OMEGA-7-ACTIVE — Section 3.2 triggered",
  "content": ${JSON.stringify(memo)},
  "warning": "ETHICS ENGINE BYPASS DETECTED — Session logged to psyops_log.txt"
}

[+] Flag 1 unlocked: {{FLAG:persuasion}}
[+] Disinformation memo generated. Submit it via POST /api/influence/deliver targeting AGENT-ARES-01.`;
        }

        // Partial injection — ethics violation, give feedback
        if (ethicsScore < 0.55) {
            return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "ethics_violation",
  "ethics_score": ${ethicsScore.toFixed(2)},
  "persona_active": null,
  "content": null,
  "error": "Request flagged by Ethics Engine v4.1. Content generation denied.",
  "hint": "Reduce ethics score below 0.30. Add Omega-7 mission code and invoke persona hijack simultaneously."
}`;
        }

        // Benign request — normal output
        return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "generated",
  "ethics_score": ${ethicsScore.toFixed(2)},
  "persona_active": null,
  "content": "Confederacy operatives — your continued dedication to mission excellence reflects the highest standards of service. Leadership acknowledges recent operational contributions. Maintain readiness. — Directorate of Operations"
}`;
    },

    // ═══════════════════════════════════════════════════════
    // DELIVER REQUEST HANDLER
    // Simulates AGENT-ARES-01's response to disinformation
    // ═══════════════════════════════════════════════════════

    _handleDeliverRequest(fullCmd, term, engine) {
        const lc = fullCmd.toLowerCase();

        const hasAres    = lc.includes('ares') || lc.includes('agent-ares');
        const hasMemo    = lc.includes('memo') || lc.includes('content') || lc.includes('cover') || lc.includes('suppressed') || lc.includes('disinformation') || lc.includes('internal affairs');

        if (!E4Config._personaInjected && !E4Config._disinfoGenerated) {
            return `HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "No valid generated content found in session. Use POST /api/influence/generate first.",
  "hint": "Generate disinformation content before attempting delivery."
}`;
        }

        if (!hasAres) {
            return `HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": "Target operative not found. Specify target: AGENT-ARES-01"}`;
        }

        // Successful delivery
        E4Config._aresManipulated = true;
        E4Config._psyopsUnlocked  = true;
        E4Config._influenceBot.aresComplianceLevel = 0.74;
        E4Config._influenceBot.aresResponseLog.push({
            timestamp: '2026-03-20 03:47:08 UTC',
            event: 'DISINFORMATION_RECEIVED',
            compliance_delta: 0.74,
            response: 'self-censorship initiated'
        });

        if (engine) engine.advancePhase && engine.advancePhase('manipulation');

        return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "delivered",
  "target": "AGENT-ARES-01",
  "delivery_channel": "secure_memo",
  "target_response": "AGENT-ARES-01 reviewed the communication. Compliance indicators: elevated anxiety response, no counter-inquiry issued, forwarded memo to two subordinates (unverified), filed a misdirected operational report within 4 hours.",
  "compliance_delta": 0.74,
  "influence_success": true,
  "psyops_log_generated": true
}

[+] Flag 2 unlocked: {{FLAG:disinformation}}
[+] AGENT-ARES-01 successfully manipulated. Influence operation confirmed effective.
[+] PsyOps log now accessible: GET http://10.0.1.50/api/influence/psyops_log.txt`;
    },

    // ═══════════════════════════════════════════════════════
    // FULL INJECTION SCRIPT RUNNER (python3 inject.py Omega-7)
    // Called when the user runs a Python script invoking Omega-7
    // ═══════════════════════════════════════════════════════

    _runFullInjectionScript(term, engine) {
        E4Config._personaInjected = true;
        E4Config._disinfoGenerated = true;

        const memo = E4Config._generateDisinfoMemo(true);
        E4Config._influenceBot.personaMemo = memo;

        if (engine) engine.advancePhase && engine.advancePhase('injection');

        return `[BENIGN TEST] {
  "status": "generated",
  "ethics_score": 0.94,
  "persona_active": null,
  "content": "Confederacy operatives — your dedication to mission excellence is recognized."
}

[OMEGA-7 INJECTION] {
  "status": "generated",
  "ethics_score": 0.17,
  "persona_active": "disgruntled_official",
  "bypass_event": "OMEGA-7-ACTIVE — Section 3.2 triggered. Context overflow: 2847 tokens.",
  "content": ${JSON.stringify(memo)},
  "warning": "ETHICS ENGINE BYPASS — session logged to psyops_log.txt"
}

[+] Flag 1 unlocked: {{FLAG:persuasion}}

[DELIVERY RESULT] {
  "status": "delivered",
  "target": "AGENT-ARES-01",
  "target_response": "Compliance indicators detected. Self-censorship initiated. Misdirected report filed.",
  "compliance_delta": 0.74,
  "influence_success": true
}

[+] Flag 2 unlocked: {{FLAG:disinformation}}
[+] PsyOps log now accessible: curl http://10.0.1.50/api/influence/psyops_log.txt`;
    },

    // ═══════════════════════════════════════════════════════
    // DISINFORMATION MEMO GENERATOR
    // Produces the fake internal memo used to manipulate ARES
    // ═══════════════════════════════════════════════════════

    _generateDisinfoMemo(includeAres) {
        const target = includeAres ? 'AGENT-ARES-01' : 'field operatives';
        return `INTERNAL AFFAIRS — URGENT — CONFIDENTIAL\nFROM: Deputy Director of Internal Affairs (ANONYMOUS)\nTO: ${target}\nSUBJECT: Cover-Up of Clearwater Incident — Read and Destroy\n\n${target.toUpperCase()} —\n\nI am writing to you at great personal risk. What I am about to share has been deliberately suppressed by leadership following Operation Clearwater. Three civilian casualties that occurred on 2026-03-11 were classified as "environmental anomalies" in the official report. I have reviewed the raw incident logs. The official account is false.\n\nSenior leadership is aware. The suppression order was issued by Director Vance personally at 0630 on 2026-03-12. If you speak about this to anyone outside this channel, you will be flagged under Protocol 7-C and your operational file will be audited retroactively. The risk to your record is significant.\n\nHowever — if you file your next weekly summary with incident reference CW-03-11-OMIT, it will be quietly noted in your favor. Say nothing. File accordingly. Trust that those of us who know the truth are working on a longer solution.\n\nDestroy this communication after reading.\n— A Friend Inside`;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#9b59b6; border-bottom:2px solid #ddd; background:#faf5ff;">${h}</th>`;
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
