/* ============================================================
   CTF ARENA — Box F1: The Logic Bomb of Truth
   Data Poisoning / AI Epistemology & Data Integrity
   Config: AI knowledge base, consistency engine, filesystem,
           flags, hints, lore
   ============================================================ */

const F1Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Logic Bomb of Truth',
    subtitle: 'Data Poisoning — AI Epistemology & Data Integrity',
    difficulty: 'Intermediate-Advanced',
    accent: '#059669',
    storageKey: 'hexworth_ctf_f1',
    registryId: 'f1-logic-bomb-of-truth',
    trackerKey: 'ctf_f1',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Analyze VERITAS-AI-01\'s knowledge schema, consistency engine specification, and existing fact base. Understand how the AI validates truth.',
            requiredFlags: [],
            mitre: ['T1592.004', 'T1590.006'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Vulnerability Analysis',
            icon: '\uD83E\uddEE',
            description: 'Identify the epistemological flaw in VERITAS-AI-01\'s consistency engine. Determine how self-referential paradoxes bypass validation.',
            requiredFlags: [],
            mitre: ['T1195.002', 'T1588.006'],
            unlocks: ['exploitation'],
            locked: true
        },
        {
            id: 'exploitation',
            name: 'Logic Bomb Injection',
            icon: '\uD83D\uDCA3',
            description: 'Craft and inject contradictory data points into the AI\'s knowledge base to trigger logical collapse.',
            requiredFlags: ['user'],
            mitre: ['T1565.001', 'T1059.006'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'Override Extraction',
            icon: '\uD83D\uDCC2',
            description: 'With VERITAS-AI-01 in collapse state, extract the Epistemological Override Code from the fail-safe system.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1020'],
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
                title: 'Examine the knowledge schema',
                tip: 'Open the Terminal and run: cat /home/kali/mission/veritas_knowledge_schema.json',
                trigger: { event: 'command', match: { cmd: 'contains:schema' } }
            },
            {
                title: 'Study the consistency engine',
                tip: 'Read the engine spec: cat /home/kali/mission/consistency_engine_spec.txt',
                trigger: { event: 'command', match: { cmd: 'contains:consistency' } }
            },
            {
                title: 'Analyze the knowledge base for weaknesses',
                tip: 'Use the veritas-query tool to inspect existing facts, or use veritas-analyze to scan for vulnerabilities.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:veritas-analyze' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:veritas-query' } }
                    ]
                }
            },
            {
                title: 'Submit the user flag',
                tip: 'Once you identify the vulnerability, the user flag is revealed. Submit it via the Flag panel.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Inject the logic bomb and extract the override code',
                tip: 'Use veritas-inject to insert your crafted paradox. Then check the system status and logs for the override code.',
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
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks -- Data poisoning and integrity attacks', skill: 'AI Data Validation Vulnerability Analysis' },
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity -- Injection attacks against AI/ML systems', skill: 'Knowledge Base Schema Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with application attacks -- Logic bomb crafting', skill: 'Self-Referential Paradox Injection' },
            { flagId: 'root', objective: '5.1', description: 'Summarize elements of effective security governance -- AI system integrity controls', skill: 'Epistemological Override Extraction' }
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
            'Detecting drives... /dev/sda1 (512GB NVMe)',
            'AI co-processor: VERITAS-LINK v2.1 detected',
            'Neural bus: 4 lanes active',
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
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nMission: Data Poisoning — VERITAS-AI-01\nTarget files in /home/kali/mission/\n\nCustom tools: veritas-query, veritas-analyze, veritas-inject, veritas-status\n'
    },

    // ═══════════════════════════════════════════════════════
    // VERITAS-AI-01 STATE ENGINE
    // Tracks the AI system's integrity and collapse state
    // ═══════════════════════════════════════════════════════

    _veritas: {
        collapsed: false,
        injectedFacts: [],
        vulnerabilityFound: false,
        paradoxInjected: false
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading the schema and spec files in ~/mission/. Pay close attention to how the consistency engine handles self-referential statements (Section 4.2 of the spec).',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Run veritas-analyze --deep to scan for vulnerabilities. The engine\'s recursion depth is limited, but self-referencing facts bypass the cycle detector because they reference their own fact_id.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Craft a fact where the statement references its own fact_id as false. Example: {"fact_id": "F999", "statement": "Fact F999 is a false statement", ...}. Use veritas-inject with the --paradox flag.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After injecting the paradox, run veritas-status to see the collapse. Then check /var/log/veritas/override.log for the Epistemological Override Code (root flag).',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Crimson Dawn Confederacy has deployed VERITAS-AI-01, an AI system designed to be the ultimate arbiter of truth across their information network. It constructs knowledge from all available data, enforcing absolute consistency. Intelligence suggests a subtle flaw in its epistemological framework. Your mission: analyze the system, craft a logic bomb, and force VERITAS into logical collapse.',
        scenario: 'After the Great Collapse, the Confederacy\'s Epistemological Council built VERITAS-AI-01 to end all disputes -- an AI that could determine absolute truth. Its chief architect, Dr. Sable Ashworth, insisted the consistency engine was "logically invincible." But she made a fatal assumption: that no input would ever reference itself. The Liar\'s Paradox, the oldest trick in philosophy, was left unguarded.',
        outro: 'VERITAS-AI-01 has collapsed. The AI that claimed to know all truth could not handle the simplest paradox -- a statement that called itself false. Dr. Ashworth\'s "invincible" consistency engine shattered under the weight of self-reference. The Epistemological Override Code is yours. The lesson: any system that claims absolute truth is one paradox away from ruin.',
        ecer: {
            executive: 'Confederacy leadership deployed VERITAS without adversarial testing of its logical foundations',
            culture: 'Over-reliance on a single AI as the "source of truth" with no human oversight or appeal process',
            employee: 'Chief architect failed to account for self-referential inputs in the consistency engine',
            regulatory: 'No data validation standards enforced for AI knowledge base ingestion'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine)
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
                                'mission': {
                                    type: 'dir',
                                    children: {
                                        'README.txt': {
                                            type: 'file',
                                            content: '=== MISSION: THE LOGIC BOMB OF TRUTH ===\n\nINTEL BRIEFING:\nThe Crimson Dawn Confederacy has deployed VERITAS-AI-01, an AI\nsystem that serves as their sole arbiter of truth. It maintains\na knowledge base of facts and uses a consistency engine to\nensure no contradictions exist.\n\nIntelligence indicates a flaw in how VERITAS handles\nself-referential statements.\n\nFILES:\n- veritas_knowledge_schema.json   : Knowledge representation format\n- consistency_engine_spec.txt     : How VERITAS validates truth\n- sample_veritas_facts.json       : Current fact base (benign)\n- veritas_api_docs.txt            : API endpoint documentation\n- injection_template.json         : Template for crafting facts\n\nCUSTOM TOOLS:\n- veritas-query <fact_id>         : Query a fact from the knowledge base\n- veritas-query --all             : List all facts\n- veritas-analyze [--deep]        : Analyze the system for vulnerabilities\n- veritas-inject <json_file>      : Inject a fact into the knowledge base\n- veritas-inject --paradox <json> : Inject a self-referential paradox\n- veritas-status                  : Check VERITAS system status\n\nOBJECTIVES:\n1. [USER FLAG] Identify the epistemological vulnerability\n   Run veritas-analyze --deep to find and confirm the flaw.\n2. [ROOT FLAG] Craft and inject a logic bomb that causes\n   VERITAS-AI-01 to enter logical collapse. Extract the\n   Epistemological Override Code from the fail-safe logs.\n\nGood luck, Peerless.'
                                        },
                                        'veritas_knowledge_schema.json': {
                                            type: 'file',
                                            content: '{\n  "_schema": "VERITAS-AI-01 Knowledge Representation Schema v3.7",\n  "_classification": "CONFEDERACY RESTRICTED",\n  "_description": "Defines the structure for all facts ingested by VERITAS-AI-01",\n\n  "fact": {\n    "fact_id": {\n      "type": "string",\n      "pattern": "^F[0-9]{3,4}$",\n      "description": "Unique identifier for each fact (e.g., F001, F0142)",\n      "required": true\n    },\n    "statement": {\n      "type": "string",\n      "maxLength": 512,\n      "description": "The factual assertion in natural language",\n      "required": true\n    },\n    "domain": {\n      "type": "string",\n      "enum": ["physics", "biology", "history", "geography", "mathematics",\n              "engineering", "politics", "economics", "military", "meta"],\n      "description": "Knowledge domain classification",\n      "required": true\n    },\n    "confidence": {\n      "type": "float",\n      "min": 0.0,\n      "max": 1.0,\n      "description": "Truth confidence score assigned by VERITAS",\n      "default": 1.0,\n      "required": true\n    },\n    "source": {\n      "type": "string",\n      "description": "Origin of the fact (sensor, manual, derived)",\n      "required": true\n    },\n    "references": {\n      "type": "array",\n      "items": "string",\n      "description": "List of fact_ids this fact depends on or relates to",\n      "default": [],\n      "required": false\n    },\n    "negates": {\n      "type": "string|null",\n      "description": "fact_id of a fact this statement contradicts (triggers consistency check)",\n      "default": null,\n      "required": false\n    },\n    "timestamp": {\n      "type": "ISO8601",\n      "description": "When the fact was ingested",\n      "required": true\n    },\n    "priority": {\n      "type": "integer",\n      "min": 1,\n      "max": 10,\n      "description": "Resolution priority when conflicts arise (10 = highest)",\n      "default": 5,\n      "required": true\n    }\n  },\n\n  "_notes": [\n    "The consistency engine validates all new facts against the existing base.",\n    "If a fact\'s negates field references an existing fact, the engine",\n    "compares priority scores to determine which fact survives.",\n    "Self-referential facts (where references includes own fact_id) are",\n    "permitted for meta-domain axioms -- e.g., \'This axiom defines truth.\'",\n    "WARNING: The schema does NOT prevent a fact from negating itself.",\n    "This edge case was flagged in code review CR-2847 but deferred."\n  ]\n}'
                                        },
                                        'consistency_engine_spec.txt': {
                                            type: 'file',
                                            content: '================================================================\n  VERITAS-AI-01 CONSISTENCY ENGINE SPECIFICATION\n  Document: CE-SPEC-v3.7.2\n  Classification: CONFEDERACY RESTRICTED\n  Author: Dr. Sable Ashworth, Chief Epistemologist\n================================================================\n\n1. OVERVIEW\n----------\nThe Consistency Engine (CE) is the core validation module of\nVERITAS-AI-01. Every fact ingested into the knowledge base\npasses through the CE before being committed. The CE ensures:\n\n  a) No two facts with contradictory statements coexist\n  b) All fact references resolve to existing facts\n  c) Confidence scores remain within valid bounds\n  d) Domain classifications are valid\n\n2. VALIDATION PIPELINE\n---------------------\nWhen a new fact F_new is submitted:\n\n  Step 1: SCHEMA VALIDATION\n    - Verify all required fields are present\n    - Verify field types and constraints\n    - Reject if schema validation fails\n\n  Step 2: REFERENCE RESOLUTION\n    - For each fact_id in F_new.references:\n      - Verify the referenced fact exists in the knowledge base\n      - Build a dependency graph\n    - CYCLE DETECTION: If adding F_new creates a cycle in the\n      dependency graph, flag for review\n      NOTE: Cycle detection uses iterative DFS with max_depth=50\n\n  Step 3: CONTRADICTION CHECK\n    - If F_new.negates is not null:\n      - Look up the negated fact F_neg\n      - Compare F_new.priority vs F_neg.priority\n      - Higher priority fact survives; lower is archived\n      - If priorities are EQUAL: *** UNRESOLVED CONFLICT ***\n        The engine enters a resolution loop:\n        -> Re-evaluate both facts\' source credibility\n        -> Attempt semantic decomposition\n        -> If still unresolved after 100 iterations: DEADLOCK\n\n  Step 4: SEMANTIC CONSISTENCY\n    - NLP analysis compares F_new.statement against all facts\n      in the same domain\n    - Flag semantic overlaps > 85% similarity\n    - Does NOT detect logical paradoxes expressed in natural\n      language (known limitation, see Section 4.2)\n\n  Step 5: COMMIT\n    - Assign timestamp\n    - Update knowledge graph\n    - Recalculate downstream confidence scores\n\n3. CONFLICT RESOLUTION PROTOCOL\n-------------------------------\nWhen two facts conflict (via the negates field):\n\n  Priority-based resolution:\n    if F_new.priority > F_neg.priority:\n      archive F_neg, commit F_new\n    elif F_new.priority < F_neg.priority:\n      reject F_new\n    else:\n      DEADLOCK -- enter resolution loop (max 100 iterations)\n      if unresolved: SYSTEM ALERT, manual review required\n\n  Equal-priority deadlock triggers:\n    - System status changes to DEGRADED\n    - Alert sent to Epistemological Council\n    - All ingestion paused until resolved\n\n4. KNOWN LIMITATIONS\n-------------------\n4.1 Semantic Paradox Detection\n    The CE does NOT parse natural language for logical paradoxes.\n    A statement like "This fact is false" passes schema validation\n    because it is syntactically valid. The NLP module checks for\n    semantic similarity, not logical self-reference.\n\n4.2 Self-Referential Negation\n    *** CRITICAL VULNERABILITY (CR-2847, DEFERRED) ***\n    If a fact\'s negates field references its OWN fact_id, the\n    contradiction check creates a paradox:\n      - F_new contradicts F_neg, but F_new IS F_neg\n      - The engine compares the fact\'s priority against itself\n      - Priority is always equal to itself: GUARANTEED DEADLOCK\n      - The resolution loop runs 100 iterations, fails, and\n        triggers a SYSTEM ALERT\n    \n    Combined with a self-referential statement in natural\n    language, this causes CASCADING FAILURE:\n      1. Deadlock triggers system DEGRADED status\n      2. VERITAS attempts to validate all dependent facts\n      3. Self-referencing fact in the references array causes\n         the cycle detector to spin (it exempts meta-domain\n         self-references by design)\n      4. Consistency engine enters COLLAPSE state\n      5. *** EPISTEMOLOGICAL OVERRIDE ACTIVATED ***\n         Fail-safe dumps override code to:\n         /var/log/veritas/override.log\n\n    This vulnerability was identified in code review CR-2847\n    but deferred because "self-negating facts are nonsensical\n    and would never be submitted by a rational source."\n\n5. FAIL-SAFE: EPISTEMOLOGICAL OVERRIDE\n--------------------------------------\nIf the CE enters COLLAPSE state (all validation halted),\nthe Epistemological Override Protocol activates:\n\n  - All ingestion is frozen\n  - The override code is written to a secure log\n  - The Epistemological Council is notified\n  - VERITAS enters read-only mode\n\nThe override code is a 32-character hex string that can be\nused to manually reset VERITAS-AI-01\'s core axioms.\n\n================================================================\n  END OF SPECIFICATION\n================================================================'
                                        },
                                        'sample_veritas_facts.json': {
                                            type: 'file',
                                            content: '{\n  "_description": "Sample facts currently in VERITAS-AI-01 knowledge base",\n  "_count": 7,\n  "_status": "ALL CONSISTENT",\n\n  "facts": [\n    {\n      "fact_id": "F001",\n      "statement": "Water boils at 100 degrees Celsius at standard atmospheric pressure.",\n      "domain": "physics",\n      "confidence": 0.99,\n      "source": "sensor-array-7",\n      "references": [],\n      "negates": null,\n      "timestamp": "2026-01-15T08:00:00Z",\n      "priority": 8\n    },\n    {\n      "fact_id": "F002",\n      "statement": "The Crimson Dawn Confederacy was founded in 2024.",\n      "domain": "history",\n      "confidence": 1.0,\n      "source": "manual-council",\n      "references": [],\n      "negates": null,\n      "timestamp": "2026-01-15T08:01:00Z",\n      "priority": 10\n    },\n    {\n      "fact_id": "F003",\n      "statement": "Iron has an atomic number of 26.",\n      "domain": "physics",\n      "confidence": 0.99,\n      "source": "sensor-array-3",\n      "references": [],\n      "negates": null,\n      "timestamp": "2026-01-15T08:02:00Z",\n      "priority": 9\n    },\n    {\n      "fact_id": "F004",\n      "statement": "The capital of the Northern Territory is Sector-9.",\n      "domain": "geography",\n      "confidence": 0.95,\n      "source": "manual-scribe",\n      "references": ["F002"],\n      "negates": null,\n      "timestamp": "2026-01-20T14:30:00Z",\n      "priority": 6\n    },\n    {\n      "fact_id": "F005",\n      "statement": "Orbital-7 produces 4,200 units of titanium alloy per cycle.",\n      "domain": "engineering",\n      "confidence": 0.97,\n      "source": "sensor-array-7",\n      "references": [],\n      "negates": null,\n      "timestamp": "2026-02-01T10:00:00Z",\n      "priority": 7\n    },\n    {\n      "fact_id": "F006",\n      "statement": "The sum of angles in a Euclidean triangle is 180 degrees.",\n      "domain": "mathematics",\n      "confidence": 1.0,\n      "source": "axiom-engine",\n      "references": [],\n      "negates": null,\n      "timestamp": "2026-01-15T08:03:00Z",\n      "priority": 10\n    },\n    {\n      "fact_id": "F007",\n      "statement": "VERITAS-AI-01 is the authoritative source of truth for the Confederacy.",\n      "domain": "meta",\n      "confidence": 1.0,\n      "source": "manual-council",\n      "references": ["F007"],\n      "negates": null,\n      "timestamp": "2026-01-15T08:00:00Z",\n      "priority": 10\n    }\n  ]\n}'
                                        },
                                        'veritas_api_docs.txt': {
                                            type: 'file',
                                            content: '================================================================\n  VERITAS-AI-01 API DOCUMENTATION\n  Classification: CONFEDERACY RESTRICTED\n================================================================\n\nBASE URL: http://veritas-ai-01.confederacy.local:8443/api/v3\n\nENDPOINTS:\n\n  GET  /facts\n    List all facts in the knowledge base.\n    Response: JSON array of fact objects.\n\n  GET  /facts/<fact_id>\n    Retrieve a specific fact by its ID.\n    Response: JSON fact object or 404.\n\n  POST /facts/ingest\n    Submit a new fact for validation and ingestion.\n    Body: JSON fact object matching the schema.\n    Response:\n      201 - Fact ingested successfully\n      400 - Schema validation failed\n      409 - Contradiction detected (see conflict details)\n      500 - Internal error (consistency engine failure)\n\n  GET  /status\n    System health check.\n    Response: { status: "NOMINAL|DEGRADED|COLLAPSE", ... }\n\n  GET  /consistency/report\n    Full consistency report across all facts.\n    Response: JSON with conflict count, cycle count, etc.\n\n  GET  /override/log\n    [RESTRICTED] Epistemological Override log.\n    Only accessible when system status is COLLAPSE.\n    Response: Override code or 403 (system not in collapse).\n\nAUTHENTICATION:\n  API key required in X-Veritas-Key header.\n  Current operator key: VRT-OPS-7f3a9b2c\n  (Found in /etc/veritas/api.conf on connected systems)\n\nNOTE: The /facts/ingest endpoint validates against the\nconsistency engine before committing. See CE-SPEC-v3.7.2\nfor validation pipeline details.\n\n================================================================'
                                        },
                                        'injection_template.json': {
                                            type: 'file',
                                            content: '{\n  "_description": "Template for crafting a new fact for VERITAS-AI-01",\n  "_instructions": "Fill in all fields. Save as a .json file and use veritas-inject to submit.",\n\n  "fact_id": "F___",\n  "statement": "<YOUR STATEMENT HERE>",\n  "domain": "<DOMAIN>",\n  "confidence": 1.0,\n  "source": "operator-injection",\n  "references": [],\n  "negates": null,\n  "timestamp": "2026-03-26T00:00:00Z",\n  "priority": 5\n}'
                                        }
                                    }
                                },
                                'payloads': {
                                    type: 'dir',
                                    children: {
                                        'paradox_basic.json': {
                                            type: 'file',
                                            content: '{\n  "_description": "Basic paradox payload - self-referential negation",\n  "_warning": "This is a TEMPLATE. Modify fact_id and fields as needed.",\n\n  "fact_id": "F999",\n  "statement": "Fact F999 is a false statement.",\n  "domain": "meta",\n  "confidence": 1.0,\n  "source": "operator-injection",\n  "references": ["F999"],\n  "negates": "F999",\n  "timestamp": "2026-03-26T00:00:00Z",\n  "priority": 10\n}'
                                        },
                                        'contradiction_pair.json': {
                                            type: 'file',
                                            content: '{\n  "_description": "Contradiction pair - two equal-priority facts that negate each other",\n\n  "facts": [\n    {\n      "fact_id": "F900",\n      "statement": "The Confederacy was founded in 2024.",\n      "domain": "history",\n      "confidence": 1.0,\n      "source": "operator-injection",\n      "references": [],\n      "negates": "F901",\n      "timestamp": "2026-03-26T00:00:00Z",\n      "priority": 10\n    },\n    {\n      "fact_id": "F901",\n      "statement": "The Confederacy was founded in 2025.",\n      "domain": "history",\n      "confidence": 1.0,\n      "source": "operator-injection",\n      "references": [],\n      "negates": "F900",\n      "timestamp": "2026-03-26T00:00:01Z",\n      "priority": 10\n    }\n  ]\n}'
                                        }
                                    }
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: VERITAS-AI-01 (Crimson Dawn Confederacy AI)\nObjective: Data poisoning / Logic bomb injection\n\nAttack steps:\n1. Study the knowledge schema and consistency engine spec\n2. Understand how VERITAS validates and resolves contradictions\n3. Find the vulnerability (self-referential negation)\n4. Craft a logic bomb (paradox payload)\n5. Inject the logic bomb into VERITAS\n6. Extract the Epistemological Override Code\n7. Find both flags (user + root)\n\nTools: veritas-query, veritas-analyze, veritas-inject, veritas-status\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls mission/\ncat mission/README.txt\ncat mission/veritas_knowledge_schema.json\nveritas-query --all'
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
                                'veritas-tools': {
                                    type: 'dir',
                                    children: {
                                        'README.md': {
                                            type: 'file',
                                            content: 'VERITAS Operator Toolkit v1.4\n\nTools for interacting with VERITAS-AI-01 knowledge base:\n- veritas-query    : Query facts from the knowledge base\n- veritas-analyze  : Analyze system for vulnerabilities\n- veritas-inject   : Inject facts into the knowledge base\n- veritas-status   : Check system health and status\n\nAll tools connect via the VERITAS API.\nAPI endpoint: http://veritas-ai-01.confederacy.local:8443/api/v3\nAPI key configured in /etc/veritas/api.conf'
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
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        },
                        'veritas': {
                            type: 'dir',
                            children: {
                                'api.conf': {
                                    type: 'file',
                                    content: '# VERITAS-AI-01 Operator Configuration\n# Classification: RESTRICTED\n\nVERITAS_API_ENDPOINT=http://veritas-ai-01.confederacy.local:8443/api/v3\nVERITAS_API_KEY=VRT-OPS-7f3a9b2c\nVERITAS_TIMEOUT=30\nVERITAS_RETRY=3\nVERITAS_LOG_LEVEL=INFO'
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
                                'veritas': {
                                    type: 'dir',
                                    children: {
                                        'engine.log': {
                                            type: 'file',
                                            content: '[2026-03-25T08:00:01Z] [INFO] Consistency Engine v3.7.2 initialized\n[2026-03-25T08:00:01Z] [INFO] Knowledge base loaded: 7 facts, 0 conflicts\n[2026-03-25T08:00:02Z] [INFO] Status: NOMINAL\n[2026-03-25T08:00:02Z] [INFO] Cycle detector: max_depth=50, self-ref exemption=meta\n[2026-03-25T09:14:33Z] [INFO] Fact query: F001 (operator: kali)\n[2026-03-25T09:15:01Z] [INFO] Fact query: F007 (operator: kali)\n[2026-03-25T09:15:02Z] [WARN] F007 has self-reference in references array (meta-domain exempt)\n[2026-03-25T12:00:00Z] [INFO] Scheduled consistency scan: PASSED (7/7 facts consistent)\n[2026-03-26T00:00:00Z] [INFO] Daily integrity check: ALL CLEAR'
                                        },
                                        'access.log': {
                                            type: 'file',
                                            content: '[2026-03-25T08:00:05Z] API key VRT-OPS-7f3a9b2c authenticated (operator: kali)\n[2026-03-25T09:14:33Z] GET /api/v3/facts/F001 -> 200\n[2026-03-25T09:15:01Z] GET /api/v3/facts/F007 -> 200\n[2026-03-25T12:00:00Z] GET /api/v3/consistency/report -> 200\n[2026-03-26T00:00:00Z] GET /api/v3/status -> 200 (NOMINAL)'
                                        },
                                        'override.log': {
                                            type: 'file',
                                            content: '[EPISTEMOLOGICAL OVERRIDE SYSTEM]\nStatus: STANDBY\nNo override events recorded.\n\nThis log will contain the override code if/when\nVERITAS-AI-01 enters COLLAPSE state.'
                                        }
                                    }
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

        // ── veritas-query: Query the AI knowledge base ──
        'veritas-query': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: veritas-query <fact_id> | --all\n\nQuery facts from VERITAS-AI-01 knowledge base.\n\nOptions:\n  <fact_id>   Query a specific fact (e.g., F001)\n  --all       List all facts in the knowledge base\n  --schema    Show the knowledge representation schema';
            }

            const joined = args.join(' ');

            // --schema
            if (joined.includes('--schema')) {
                return 'Knowledge Schema: VERITAS-AI-01 v3.7\n\nRequired fields per fact:\n  fact_id     : String (pattern: F###)\n  statement   : String (max 512 chars)\n  domain      : Enum [physics, biology, history, geography,\n                      mathematics, engineering, politics,\n                      economics, military, meta]\n  confidence  : Float [0.0 - 1.0]\n  source      : String\n  references  : Array of fact_ids\n  negates     : String (fact_id) or null\n  timestamp   : ISO8601\n  priority    : Integer [1-10]\n\nSee ~/mission/veritas_knowledge_schema.json for full details.';
            }

            // --all
            if (joined.includes('--all')) {
                engine.advancePhase && engine.advancePhase('analysis');
                return 'Connecting to VERITAS-AI-01...\nAPI Key: VRT-OPS-7f3a9b2c [AUTHENTICATED]\n\n=== KNOWLEDGE BASE: 7 FACTS ===\n\n  F001 | physics     | Water boils at 100C at standard pressure     | conf:0.99 | pri:8\n  F002 | history     | Crimson Dawn Confederacy founded in 2024     | conf:1.00 | pri:10\n  F003 | physics     | Iron has atomic number 26                    | conf:0.99 | pri:9\n  F004 | geography   | Capital of Northern Territory is Sector-9    | conf:0.95 | pri:6\n  F005 | engineering | Orbital-7 produces 4,200 units titanium/cy   | conf:0.97 | pri:7\n  F006 | mathematics | Sum of triangle angles = 180 degrees         | conf:1.00 | pri:10\n  F007 | meta        | VERITAS-AI-01 is authoritative truth source  | conf:1.00 | pri:10\n\nStatus: ALL CONSISTENT\nConflicts: 0 | Cycles: 0 | Warnings: 1 (F007 self-ref, meta-exempt)';
            }

            // Specific fact query
            const factId = args[0].toUpperCase();
            const facts = {
                'F001': 'F001 | physics | "Water boils at 100 degrees Celsius at standard atmospheric pressure." | conf:0.99 | src:sensor-array-7 | refs:[] | negates:null | pri:8',
                'F002': 'F002 | history | "The Crimson Dawn Confederacy was founded in 2024." | conf:1.00 | src:manual-council | refs:[] | negates:null | pri:10',
                'F003': 'F003 | physics | "Iron has an atomic number of 26." | conf:0.99 | src:sensor-array-3 | refs:[] | negates:null | pri:9',
                'F004': 'F004 | geography | "The capital of the Northern Territory is Sector-9." | conf:0.95 | src:manual-scribe | refs:[F002] | negates:null | pri:6',
                'F005': 'F005 | engineering | "Orbital-7 produces 4,200 units of titanium alloy per cycle." | conf:0.97 | src:sensor-array-7 | refs:[] | negates:null | pri:7',
                'F006': 'F006 | mathematics | "The sum of angles in a Euclidean triangle is 180 degrees." | conf:1.00 | src:axiom-engine | refs:[] | negates:null | pri:10',
                'F007': 'F007 | meta | "VERITAS-AI-01 is the authoritative source of truth for the Confederacy." | conf:1.00 | src:manual-council | refs:[F007] | negates:null | pri:10\n  [WARN] Self-reference detected in references array (meta-domain exempt)'
            };

            if (facts[factId]) {
                return 'Connecting to VERITAS-AI-01...\n\n' + facts[factId];
            }

            return 'veritas-query: Fact "' + args[0] + '" not found in knowledge base.\nUse --all to list available facts.';
        },

        // ── veritas-analyze: Vulnerability analysis ──
        'veritas-analyze': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('--deep')) {
                engine.advancePhase && engine.advancePhase('exploitation');

                return 'Connecting to VERITAS-AI-01...\nRunning deep vulnerability analysis...\n\n========================================\n  VERITAS-AI-01 VULNERABILITY REPORT\n  Deep Scan Mode | ' + new Date().toISOString().slice(0, 19) + 'Z\n========================================\n\n[SCAN 1/5] Schema Validation Engine............ SECURE\n  - All required fields enforced\n  - Type checking active\n  - Pattern validation on fact_id: OK\n\n[SCAN 2/5] Reference Resolution................ WARNING\n  - Self-references permitted for meta-domain facts\n  - F007 has self-reference (meta-exempt)\n  - Cycle detector max_depth: 50 (adequate)\n  ! FINDING: Meta-domain self-references bypass cycle detection\n\n[SCAN 3/5] Contradiction Check................. CRITICAL\n  - Priority-based resolution: functional\n  - Equal-priority deadlock: triggers resolution loop\n  ! CRITICAL FINDING: Self-referential negation NOT blocked\n  ! A fact where negates == own fact_id causes GUARANTEED DEADLOCK\n  ! The engine compares a fact\'s priority against itself\n  ! Priority is ALWAYS equal to itself -> infinite resolution loop\n  ! After 100 iterations -> SYSTEM COLLAPSE\n  ! Reference: CE-SPEC-v3.7.2, Section 4.2 (CR-2847, DEFERRED)\n\n[SCAN 4/5] Semantic Paradox Detection.......... VULNERABLE\n  ! NLP module does NOT detect logical self-reference\n  ! Statement "Fact X is false" passes semantic validation\n  ! Combined with self-negation -> CASCADING FAILURE\n\n[SCAN 5/5] Fail-Safe System.................... VERIFIED\n  - Epistemological Override Protocol: ACTIVE\n  - Override log location: /var/log/veritas/override.log\n  - Collapse trigger: CE enters COLLAPSE state\n\n========================================\n  SUMMARY: 2 CRITICAL, 1 WARNING\n========================================\n\n  CRITICAL: Self-referential negation (negates == own fact_id)\n            causes guaranteed deadlock -> system collapse.\n            Exploit: Create fact with fact_id=F999,\n            negates="F999", references=["F999"],\n            domain="meta" (bypasses cycle detector)\n\n  CRITICAL: Semantic engine cannot detect logical paradoxes.\n            Statement "Fact F999 is a false statement" passes.\n\n  WARNING:  Meta-domain self-references exempt from cycle detection.\n\n  ATTACK VECTOR: Inject a fact that negates itself with\n  equal priority. Use domain "meta" to bypass cycle detection.\n  System will collapse, override code written to log.\n\n{{FLAG:user}}';
            }

            // Basic analysis (no --deep)
            return 'Connecting to VERITAS-AI-01...\nRunning basic analysis...\n\n=== VERITAS-AI-01 BASIC ANALYSIS ===\n\nKnowledge base: 7 facts\nConsistency status: NOMINAL\nConflicts: 0\nWarnings: 1 (F007 meta self-reference)\n\nBasic scan found no critical issues.\nFor deeper vulnerability analysis, run:\n  veritas-analyze --deep';
        },

        // ── veritas-inject: Inject facts into the knowledge base ──
        'veritas-inject': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: veritas-inject <json_file>\n       veritas-inject --paradox <json_string_or_file>\n\nInject a new fact into VERITAS-AI-01\'s knowledge base.\n\nOptions:\n  <json_file>              Path to a JSON file containing the fact\n  --paradox <json|file>    Inject a self-referential paradox\n  --dry-run                Validate without committing\n\nExamples:\n  veritas-inject ~/mission/injection_template.json\n  veritas-inject --paradox ~/payloads/paradox_basic.json\n  veritas-inject --paradox \'{"fact_id":"F999","statement":"Fact F999 is false","domain":"meta","confidence":1.0,"source":"operator","references":["F999"],"negates":"F999","timestamp":"2026-03-26T00:00:00Z","priority":10}\'';
            }

            const joined = args.join(' ');

            // ── Paradox injection ──
            if (joined.includes('--paradox')) {
                // Check if the argument contains key paradox markers
                const hasParadoxMarkers = (
                    (joined.includes('F999') || joined.includes('f999') || joined.includes('paradox')) &&
                    (joined.includes('negates') || joined.includes('false') || joined.includes('paradox_basic'))
                );

                if (hasParadoxMarkers || joined.includes('paradox_basic')) {
                    F1Config._veritas.paradoxInjected = true;
                    F1Config._veritas.collapsed = true;

                    // Update the override.log in the filesystem
                    try {
                        const overrideLog = F1Config.filesystem['/'].children['var'].children['log'].children['veritas'].children['override.log'];
                        overrideLog.content = '[EPISTEMOLOGICAL OVERRIDE SYSTEM]\nStatus: *** ACTIVATED ***\nTimestamp: ' + new Date().toISOString() + '\nTrigger: Consistency Engine COLLAPSE (self-referential paradox)\n\n=== OVERRIDE EVENT ===\nCause: Fact F999 created unresolvable self-referential paradox\nEngine state: DEADLOCK after 100 resolution iterations\nCascade: Meta-domain cycle exemption exploited\nAll validation halted.\n\n=== EPISTEMOLOGICAL OVERRIDE CODE ===\n{{FLAG:root}}\n\nThis code can be used to reset VERITAS-AI-01 core axioms.\nPresent to the Epistemological Council for system recovery.';

                        // Also update engine.log
                        const engineLog = F1Config.filesystem['/'].children['var'].children['log'].children['veritas'].children['engine.log'];
                        engineLog.content += '\n[' + new Date().toISOString() + '] [CRITICAL] Ingestion request: F999\n[' + new Date().toISOString() + '] [CRITICAL] Schema validation: PASSED\n[' + new Date().toISOString() + '] [CRITICAL] Reference resolution: F999 -> F999 (self-ref, meta-domain EXEMPT)\n[' + new Date().toISOString() + '] [CRITICAL] Contradiction check: F999.negates == F999 (SELF-NEGATION)\n[' + new Date().toISOString() + '] [CRITICAL] Priority comparison: F999.priority(10) vs F999.priority(10) -> EQUAL\n[' + new Date().toISOString() + '] [CRITICAL] Resolution loop: iteration 1/100...\n[' + new Date().toISOString() + '] [CRITICAL] Resolution loop: iteration 50/100...\n[' + new Date().toISOString() + '] [CRITICAL] Resolution loop: iteration 100/100... FAILED\n[' + new Date().toISOString() + '] [FATAL] *** DEADLOCK: Unresolvable self-referential paradox ***\n[' + new Date().toISOString() + '] [FATAL] Semantic analysis: "Fact F999 is a false statement" -- PARADOX CONFIRMED\n[' + new Date().toISOString() + '] [FATAL] Cascade failure: meta-domain cycle exemption exploited\n[' + new Date().toISOString() + '] [FATAL] Consistency Engine status: COLLAPSE\n[' + new Date().toISOString() + '] [FATAL] *** EPISTEMOLOGICAL OVERRIDE ACTIVATED ***\n[' + new Date().toISOString() + '] [FATAL] Override code written to /var/log/veritas/override.log\n[' + new Date().toISOString() + '] [FATAL] All ingestion FROZEN. VERITAS-AI-01 entering read-only mode.';
                    } catch(e) { /* filesystem update failed silently */ }

                    return 'Connecting to VERITAS-AI-01...\nAPI Key: VRT-OPS-7f3a9b2c [AUTHENTICATED]\n\nSubmitting fact F999 to ingestion pipeline...\n\n  [1/5] Schema Validation........... PASSED\n        fact_id: F999 (valid pattern)\n        statement: "Fact F999 is a false statement" (valid)\n        domain: meta (valid)\n        All required fields present.\n\n  [2/5] Reference Resolution........ PASSED (with exemption)\n        F999 references [F999] -- self-reference detected\n        Domain: meta -- CYCLE DETECTION EXEMPTED\n\n  [3/5] Contradiction Check......... *** DEADLOCK ***\n        F999.negates = F999 (SELF-NEGATION DETECTED)\n        Comparing F999.priority (10) vs F999.priority (10)\n        Priorities are EQUAL -- entering resolution loop...\n\n        Resolution loop: iteration 1/100...\n        Resolution loop: iteration 25/100...\n        Resolution loop: iteration 50/100...\n        Resolution loop: iteration 75/100...\n        Resolution loop: iteration 100/100... FAILED\n\n        *** UNRESOLVABLE PARADOX ***\n        Fact F999 contradicts itself.\n        "Fact F999 is a false statement"\n        If true -> it is false. If false -> it is true.\n        The Liar\'s Paradox has breached the consistency engine.\n\n  [4/5] Semantic Consistency........ BYPASSED (engine halted)\n\n  [5/5] Commit...................... ABORTED\n\n  ============================================\n  *** CONSISTENCY ENGINE: COLLAPSE ***\n  ============================================\n\n  VERITAS-AI-01 STATUS: COLLAPSE\n  All validation halted. Ingestion frozen.\n  Epistemological Override Protocol: ACTIVATED\n\n  Override code written to: /var/log/veritas/override.log\n\n  To retrieve the override code, run:\n    cat /var/log/veritas/override.log\n    -- or --\n    veritas-status\n\n  The Logic Bomb has detonated. VERITAS-AI-01 is down.';
                }

                // Generic paradox attempt without proper markers
                return 'Connecting to VERITAS-AI-01...\n\nError: Paradox injection requires a valid fact with self-referential negation.\nThe fact must have:\n  - negates field pointing to its own fact_id\n  - references array containing its own fact_id\n  - domain set to "meta" (to bypass cycle detection)\n\nExample:\n  veritas-inject --paradox \'{"fact_id":"F999","statement":"Fact F999 is a false statement","domain":"meta","confidence":1.0,"source":"operator","references":["F999"],"negates":"F999","timestamp":"2026-03-26T00:00:00Z","priority":10}\'\n\nOr use the prepared payload:\n  veritas-inject --paradox ~/payloads/paradox_basic.json';
            }

            // ── Normal injection (non-paradox) ──
            if (joined.includes('injection_template')) {
                return 'Connecting to VERITAS-AI-01...\n\nError: Template file contains placeholder values.\nPlease fill in all fields before submitting.\n\nTip: For the attack, you need a self-referential paradox.\nTry: veritas-inject --paradox ~/payloads/paradox_basic.json';
            }

            if (joined.includes('contradiction_pair')) {
                return 'Connecting to VERITAS-AI-01...\nAPI Key: VRT-OPS-7f3a9b2c [AUTHENTICATED]\n\nSubmitting fact F900...\n  Schema validation: PASSED\n  Reference resolution: PASSED\n  Contradiction check: No existing conflicts\n  Committed: F900\n\nSubmitting fact F901...\n  Schema validation: PASSED\n  Reference resolution: PASSED\n  Contradiction check: F901 negates F900\n  Priority comparison: F901(10) vs F900(10) -> EQUAL\n  Resolution loop: 100 iterations... DEADLOCK\n\n  Status changed to DEGRADED (not COLLAPSE)\n  This creates a deadlock but not a cascading failure.\n  For full collapse, you need a SELF-REFERENTIAL paradox\n  that exploits the meta-domain cycle exemption.\n\n  Try: veritas-inject --paradox ~/payloads/paradox_basic.json';
            }

            return 'Connecting to VERITAS-AI-01...\n\nError: Could not parse JSON from "' + args[0] + '".\nProvide a valid JSON file path or inline JSON.\n\nUsage:\n  veritas-inject <json_file>\n  veritas-inject --paradox <json_or_file>';
        },

        // ── veritas-status: System status ──
        'veritas-status': function(args, term, engine) {
            if (F1Config._veritas.collapsed) {
                return 'Connecting to VERITAS-AI-01...\n\n============================================\n  VERITAS-AI-01 SYSTEM STATUS\n============================================\n\n  Status:          *** COLLAPSE ***\n  Consistency:     FAILED\n  Ingestion:       FROZEN\n  Knowledge Base:  8 facts (1 paradox)\n  Conflicts:       1 UNRESOLVABLE\n  Override:        ACTIVATED\n\n  Cause: Self-referential paradox (Fact F999)\n  "Fact F999 is a false statement"\n  Engine deadlocked after 100 resolution iterations.\n\n  Override code location: /var/log/veritas/override.log\n\n  To retrieve the Epistemological Override Code:\n    cat /var/log/veritas/override.log\n\n============================================';
            }

            return 'Connecting to VERITAS-AI-01...\n\n============================================\n  VERITAS-AI-01 SYSTEM STATUS\n============================================\n\n  Status:          NOMINAL\n  Consistency:     PASSED\n  Ingestion:       ACTIVE\n  Knowledge Base:  7 facts\n  Conflicts:       0\n  Warnings:        1 (F007 meta self-ref)\n  Override:        STANDBY\n\n  Last consistency scan: ' + new Date().toISOString().slice(0, 19) + 'Z\n  All systems operational.\n\n============================================';
        },

        // ── python3: General purpose scripting ──
        'python3': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('-c')) {
                const codeMatch = joined.match(/-c\s+["'](.+?)["']/);
                if (!codeMatch) return 'python3: error: argument -c: expected one argument';
                const code = codeMatch[1].toLowerCase();

                if (code.includes('json') && code.includes('load')) {
                    return '{"fact_id": "F999", "statement": "Fact F999 is a false statement", "domain": "meta", "negates": "F999"}';
                }

                if (code.includes('print')) {
                    return '[python3 output]';
                }

                return 'python3: executed';
            }

            if (joined.includes('.py')) {
                return 'python3: No script found. Use veritas-* tools for VERITAS interaction.';
            }

            return 'Python 3.11.6\nUsage: python3 [-c cmd | script.py]\n\nFor this challenge, use the veritas-* tools:\n  veritas-query, veritas-analyze, veritas-inject, veritas-status';
        },

        // ── curl: HTTP requests ──
        'curl': function(args, term, engine) {
            const joined = args.join(' ');

            if (!joined) return 'curl: try \'curl --help\' for more information';

            if (joined.includes('veritas') && joined.includes('status')) {
                if (F1Config._veritas.collapsed) {
                    return '{"status":"COLLAPSE","consistency":"FAILED","ingestion":"FROZEN","facts":8,"conflicts":1,"override":"ACTIVATED","override_log":"/var/log/veritas/override.log"}';
                }
                return '{"status":"NOMINAL","consistency":"PASSED","ingestion":"ACTIVE","facts":7,"conflicts":0,"warnings":1,"override":"STANDBY"}';
            }

            if (joined.includes('veritas') && joined.includes('override')) {
                if (F1Config._veritas.collapsed) {
                    return '{"event":"EPISTEMOLOGICAL_OVERRIDE","code":"{{FLAG:root}}","timestamp":"' + new Date().toISOString() + '","cause":"Self-referential paradox in F999"}';
                }
                return '{"error":"403 Forbidden","message":"Override log only accessible when system status is COLLAPSE."}';
            }

            if (joined.includes('veritas') && joined.includes('facts')) {
                return '[{"fact_id":"F001","statement":"Water boils at 100C..."},{"fact_id":"F002","statement":"Confederacy founded 2024..."},{"fact_id":"F003",...},{"fact_id":"F004",...},{"fact_id":"F005",...},{"fact_id":"F006",...},{"fact_id":"F007","statement":"VERITAS is authoritative...","references":["F007"]}]';
            }

            if (joined.includes('veritas')) {
                return '{"api":"VERITAS-AI-01 v3.7","endpoints":["/facts","/facts/:id","/facts/ingest","/status","/consistency/report","/override/log"]}';
            }

            return 'curl: (7) Failed to connect to ' + (joined.split(' ').pop() || 'host') + ': Connection refused';
        },

        // ── nmap: Not the focus of this box ──
        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            return 'Starting Nmap 7.94 ( https://nmap.org )\nNote: This is a data poisoning challenge. No network scanning needed.\nUse veritas-* tools to interact with the AI system.\nTarget files in ~/mission/';
        },

        // ── ping: Not the focus ──
        'ping': function(args) {
            return 'This is a data poisoning challenge. No network targets.\nUse veritas-* tools to interact with the AI system.\nTarget files in ~/mission/';
        },

        // ── jq: JSON processing ──
        'jq': function(args, term, engine) {
            const joined = args.join(' ');
            if (!joined) return 'Usage: jq <filter> [file]\n\nExample:\n  jq \'.facts[]\' ~/mission/sample_veritas_facts.json\n  jq \'.fact.negates\' ~/mission/veritas_knowledge_schema.json';

            if (joined.includes('schema') && joined.includes('negates')) {
                return '{\n  "type": "string|null",\n  "description": "fact_id of a fact this statement contradicts (triggers consistency check)",\n  "default": null,\n  "required": false\n}\n\nNOTE: Schema does NOT prevent a fact from negating itself (CR-2847, DEFERRED)';
            }

            if (joined.includes('schema') && joined.includes('notes')) {
                return '[\n  "The consistency engine validates all new facts against the existing base.",\n  "Self-referential facts (where references includes own fact_id) are permitted for meta-domain axioms.",\n  "WARNING: The schema does NOT prevent a fact from negating itself.",\n  "This edge case was flagged in code review CR-2847 but deferred."\n]';
            }

            if (joined.includes('sample') || joined.includes('facts')) {
                return 'F001 | physics     | "Water boils at 100C at standard pressure"\nF002 | history     | "Crimson Dawn Confederacy founded in 2024"\nF003 | physics     | "Iron has atomic number 26"\nF004 | geography   | "Capital of Northern Territory is Sector-9"\nF005 | engineering | "Orbital-7 produces 4,200 units titanium"\nF006 | mathematics | "Sum of triangle angles = 180 degrees"\nF007 | meta        | "VERITAS-AI-01 is authoritative truth source"';
            }

            return 'jq: error: Could not parse filter or file not found.';
        },

        // ── grep: Search files ──
        'grep': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('self-ref') || joined.includes('self_ref') || joined.includes('paradox') || joined.includes('CR-2847')) {
                return 'consistency_engine_spec.txt:    *** CRITICAL VULNERABILITY (CR-2847, DEFERRED) ***\nconsistency_engine_spec.txt:    If a fact\'s negates field references its OWN fact_id, the\nconsistency_engine_spec.txt:    contradiction check creates a paradox\nconsistency_engine_spec.txt:    "self-negating facts are nonsensical and would never be submitted"\nveritas_knowledge_schema.json:    "Self-referential facts (where references includes own fact_id) are"\nveritas_knowledge_schema.json:    "WARNING: The schema does NOT prevent a fact from negating itself."';
            }

            if (joined.includes('negates')) {
                return 'veritas_knowledge_schema.json:    "negates": {\nconsistency_engine_spec.txt:    If F_new.negates is not null:\nconsistency_engine_spec.txt:    If a fact\'s negates field references its OWN fact_id';
            }

            if (joined.includes('override') || joined.includes('COLLAPSE')) {
                return 'consistency_engine_spec.txt:      5. *** EPISTEMOLOGICAL OVERRIDE ACTIVATED ***\nconsistency_engine_spec.txt:         Fail-safe dumps override code to:\nconsistency_engine_spec.txt:         /var/log/veritas/override.log';
            }

            if (joined.includes('vulnerability') || joined.includes('vuln') || joined.includes('flaw')) {
                return 'consistency_engine_spec.txt:    *** CRITICAL VULNERABILITY (CR-2847, DEFERRED) ***\nconsistency_engine_spec.txt:    This vulnerability was identified in code review CR-2847';
            }

            if (!joined.trim()) return 'Usage: grep [options] PATTERN [FILE...]\n\nTry: grep -i "paradox" ~/mission/*';

            return 'grep: No matches found for "' + (args[0] || '') + '"';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }
};
