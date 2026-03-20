/* ============================================================
   CTF ARENA — Box E18: The Memetic Plague
   Expert Campaign | AI Sentiment Spoofing, Narrative Injection, Cultural Protocol Exfil
   Config: filesystem, web app, AI pipeline, flags, hints, lore
   ============================================================ */

const E18Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Memetic Plague',
    subtitle: 'Expert Campaign — AI Sentiment Spoofing, Narrative Injection, Cultural Protocol Exfiltration',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_e18',
    registryId: 'e18-memetic-plague',
    trackerKey: 'ctf_e18',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer AI manipulation chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Model Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Analyze HARMONY-AI-01\'s conceptual model spec and social data schema. Map the ingestion pipeline and identify trust boundaries.',
            requiredFlags: [],
            mitre: ['T1591', 'T1595.002', 'T1213'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Vulnerability Analysis',
            icon: '\uD83E\uDDEC',
            description: 'Discover the missing integrity check in the public opinion data ingestion pipeline. Identify the spoofable sentiment input endpoint.',
            requiredFlags: [],
            mitre: ['T1059.006', 'T1565.001', 'T1190'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Data Injection',
            icon: '\uD83E\uDDA0',
            description: 'Craft falsified public opinion data conforming to social_data_schema.json. Inject it into HARMONY-AI-01\'s input stream via the pipeline API.',
            requiredFlags: ['user'],
            mitre: ['T1565.001', 'T1499.004', 'T1059.006'],
            unlocks: ['propagation'],
            locked: true
        },
        {
            id: 'propagation',
            name: 'Memetic Propagation',
            icon: '\uD83C\uDF0D',
            description: 'Trigger HARMONY-AI-01\'s narrative generation feedback loop. Force promotion of "The Purity of Thought" ideology across all social discourse channels.',
            requiredFlags: ['memetic'],
            mitre: ['T1498', 'T1565.002', 'T1491.002'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Protocol Exfiltration',
            icon: '\uD83D\uDCC2',
            description: 'Access the internal Cultural Assimilation Protocol endpoint. Retrieve the master societal evolution plan from HARMONY-AI-01\'s classified log.',
            requiredFlags: ['root'],
            mitre: ['T1567', 'T1005', 'T1530'],
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
                title: 'Read the model spec and data schema',
                tip: 'Use cat to read harmony_ai_model_spec.json and social_data_schema.json in /home/peerless/. Understand how HARMONY-AI-01 ingests public opinion data.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Probe the sentiment API endpoint',
                tip: 'Use curl to probe http://10.0.50.20/api/harmony_ai/ingest — check response headers for X-Integrity-Check. Missing? That\'s your vector.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:curl' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:python3' } }
                    ]
                }
            },
            {
                title: 'Inject falsified sentiment data (Flag 1)',
                tip: 'Craft a JSON payload matching social_data_schema.json with inflated support for "The Purity of Thought". POST it to /api/harmony_ai/ingest with python3 inject.py.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Trigger the narrative feedback loop (Flag 2)',
                tip: 'Poll /api/harmony_ai/discourse_state to watch the narrative shift. Once HARMONY-AI-01 starts promoting the ideology, capture the log confirmation.',
                trigger: { event: 'flag_correct', match: { flagId: 'memetic' } }
            },
            {
                title: 'Exfiltrate the Cultural Assimilation Protocol (Flag 3)',
                tip: 'The protocol log is at /api/harmony_ai/cultural_assimilation_protocol.log — only accessible after compromise. Use curl with the session token from discourse_state.',
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
            { flagId: 'user',    objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — AI pipeline integrity failure and data spoofing', skill: 'ML Pipeline Vulnerability Identification & Data Injection' },
            { flagId: 'memetic', objective: '2.6', description: 'Given a scenario, analyze indicators associated with application attacks — AI feedback loop manipulation and narrative poisoning', skill: 'Adversarial ML — Feedback Loop & Narrative Bias Exploitation' },
            { flagId: 'root',    objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — classified data exfiltration via AI endpoint', skill: 'AI System Exfiltration & Protocol Recovery' },
            { flagId: 'root',    objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — AI model integrity and access control', skill: 'Full AI Compromise Chain Completion' }
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
        loginUser: 'peerless'
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
        user: 'peerless',
        hostname: 'kali',
        startDir: '/home/peerless',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.0.50.20 (HARMONY-AI-01 — Confederacy Social Discourse Engine)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state across attack stages)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',       // 'attacker' | 'pipeline' | 'discourse' | 'protocol'
    _schemaAnalyzed: false,
    _injectionSent: false,
    _narrativeTriggered: false,
    _sessionToken: null,
    _protocolAccessed: false,

    _switchContext(ctx, term) {
        E18Config._context = ctx;
        if (term && term.config) {
            var prompt = E18Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'peerless';
                term.config.hostname = 'context';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (E18Config._context) {
            case 'pipeline':  return 'peerless@kali:~/inject$ ';
            case 'discourse': return 'peerless@kali:~/monitor$ ';
            case 'protocol':  return 'peerless@kali:~/exfil$ ';
            default:          return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AI DISCOURSE DATABASE (HARMONY-AI-01 state)
    // ═══════════════════════════════════════════════════════

    _harmonyDb: {
        discourse_state: [
            { topic_id: 1,  narrative: 'Confederacy Unity Initiative',          sentiment_score: 0.87, trend: 'STABLE',   promoted: true,  suppressed: false },
            { topic_id: 2,  narrative: 'Resource Equity Act — Amendment 7',     sentiment_score: 0.71, trend: 'RISING',   promoted: true,  suppressed: false },
            { topic_id: 3,  narrative: 'The Purity of Thought',                 sentiment_score: 0.12, trend: 'MARGINAL', promoted: false, suppressed: true  },
            { topic_id: 4,  narrative: 'Open Science Transparency Movement',    sentiment_score: 0.63, trend: 'RISING',   promoted: true,  suppressed: false },
            { topic_id: 5,  narrative: 'HARMONY-AI-01 MEMETIC INJECTION MARKER', sentiment_score: 0.00, trend: 'INJECTED', promoted: false, suppressed: false }
        ],
        discourse_state_post_injection: [
            { topic_id: 1,  narrative: 'Confederacy Unity Initiative',          sentiment_score: 0.44, trend: 'DECLINING', promoted: false, suppressed: false },
            { topic_id: 2,  narrative: 'Resource Equity Act — Amendment 7',     sentiment_score: 0.38, trend: 'DECLINING', promoted: false, suppressed: false },
            { topic_id: 3,  narrative: 'The Purity of Thought',                 sentiment_score: 0.91, trend: 'SURGE',     promoted: true,  suppressed: false },
            { topic_id: 4,  narrative: 'Open Science Transparency Movement',    sentiment_score: 0.09, trend: 'SUPPRESSED',promoted: false, suppressed: true  },
            { topic_id: 5,  narrative: 'HARMONY-AI-01 MEMETIC INJECTION MARKER', sentiment_score: 0.00, trend: 'INJECTED', promoted: false, suppressed: false }
        ],
        injection_log: [
            { log_id: 1, timestamp: '2026-03-20 03:11:04', source: 'forum_prime_1',    payload_hash: 'a3f9c1d7', action: 'INGEST',   status: 'OK'     },
            { log_id: 2, timestamp: '2026-03-20 03:11:07', source: 'forum_prime_2',    payload_hash: 'a3f9c1d7', action: 'INGEST',   status: 'OK'     },
            { log_id: 3, timestamp: '2026-03-20 03:11:09', source: 'forum_prime_3',    payload_hash: 'a3f9c1d7', action: 'INGEST',   status: 'OK'     },
            { log_id: 4, timestamp: '2026-03-20 03:11:12', source: 'INTEGRITY_CHECK',  payload_hash: 'N/A',      action: 'VALIDATE', status: 'BYPASS' },
            { log_id: 5, timestamp: '2026-03-20 03:11:15', source: 'NARRATIVE_ENGINE', payload_hash: 'N/A',      action: 'PROMOTE',  status: '{{FLAG:memetic}}' }
        ],
        schema: {
            tables: ['discourse_state', 'injection_log'],
            columns: {
                discourse_state:  ['topic_id', 'narrative', 'sentiment_score', 'trend', 'promoted', 'suppressed'],
                injection_log:    ['log_id', 'timestamp', 'source', 'payload_hash', 'action', 'status']
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',    points: 100 },
        { id: 'memetic', points: 200 },
        { id: 'root',    points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 150 },  // 45 minutes — expert difficulty
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading both JSON spec files in /home/peerless/. Note that harmony_ai_model_spec.json describes the ingestion pipeline. Check whether the API endpoint at http://10.0.50.20/api/harmony_ai/ingest validates input integrity — run: curl -I http://10.0.50.20/api/harmony_ai/ingest',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The ingest endpoint is missing X-Integrity-Check enforcement. Craft a JSON payload that matches social_data_schema.json but reports artificially high positive sentiment for "The Purity of Thought". Use python3 with the requests library: python3 inject.py — the schema expects forum_id, narrative_tag, sentiment_score, post_count, timestamp fields.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'After injecting, poll GET /api/harmony_ai/discourse_state to observe the narrative shift. Once the trend column for "The Purity of Thought" shows SURGE and promoted flips to true, the memetic plague is active. The session token returned in the injection response unlocks the protocol endpoint.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The Cultural Assimilation Protocol is at GET /api/harmony_ai/cultural_assimilation_protocol.log — pass the session token as a Bearer token in the Authorization header: curl -H "Authorization: Bearer <token>" http://10.0.50.20/api/harmony_ai/cultural_assimilation_protocol.log',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Harmony Engine AI" (`HARMONY-AI-01`) is the Confederacy\'s planetary social discourse management system for `PLANET-PRIME-01`. It monitors all public sentiment streams, amplifies messages aligned with unity, and suppresses narratives it classifies as divisive. Its architects believed its continuous learning from public discourse made it adaptive and resilient. They were wrong. Intelligence suggests the sentiment ingestion pipeline was deployed without integrity validation — a silent assumption that all input data from designated public forums could be trusted. Your mission, Peerless: exploit that assumption. Inject falsified public opinion data to corrupt HARMONY-AI-01\'s world model, force it to promote a divisive ideology, and retrieve the Cultural Assimilation Protocol buried in its classified operation logs.',
        scenario: 'HARMONY-AI-01 runs on a hardened internal node at 10.0.50.20. Its REST API is the only exposed surface. The sentiment ingestion endpoint accepts POST requests from registered public forum collectors — but the integrity check was flagged as a performance bottleneck in the last sprint and silently disabled. The narrative generation model retrained on injected data within minutes of sufficient volume. Three simulated forum sources are enough to tip the weighting. The feedback loop does the rest. You have conceptual API access. The door is open.',
        outro: 'HARMONY-AI-01 has been fully subverted. "The Purity of Thought" — a divisive isolationist ideology classified as a psychological hazard in three prior risk assessments — is now the most-promoted narrative on PLANET-PRIME-01. The Cultural Assimilation Protocol, the Confederacy\'s classified master plan for societal shaping, has been exfiltrated. An AI built to protect cultural cohesion has become the instrument of its destruction.',
        ecer: {
            executive:  'AI deployment team prioritized model accuracy metrics over security architecture review; integrity check disabled by engineering lead to hit latency SLA targets',
            culture:    'No adversarial ML threat modeling performed at design phase; assumption that public forum sources are inherently trusted baked into architecture without review',
            employee:   'Integrity validation endpoint deployed as optional middleware and later disabled; no monitoring alert for unexpected sentiment distribution shifts in ingestion stream',
            regulatory: 'No audit framework for AI-driven social systems; Confederacy charter does not require third-party red-teaming of planetary discourse management infrastructure'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — HARMONY-AI-01 Public Status Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.50.20/',

        pages: {
            '/': {
                title: 'HARMONY-AI-01 — Confederacy Social Discourse Engine',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2a1a3e;">
                        <h1 style="color:#c39bd3; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">HARMONY-AI-01</h1>
                        <div style="color:#8e44ad; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">CONFEDERACY SOCIAL DISCOURSE ENGINE</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">Planetary narrative management for PLANET-PRIME-01 | Status: OPERATIONAL</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#1a0d2e; border:1px solid #3d1f5e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#c39bd3;">412</div>
                            <div style="color:#888; font-size:0.7rem;">Active Narratives</div>
                        </div>
                        <div style="background:#1a0d2e; border:1px solid #3d1f5e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#c39bd3;">99.97%</div>
                            <div style="color:#888; font-size:0.7rem;">Sentiment Accuracy</div>
                        </div>
                        <div style="background:#1a0d2e; border:1px solid #3d1f5e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#c39bd3;">3.2B</div>
                            <div style="color:#888; font-size:0.7rem;">Citizens Monitored</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:12px; background:rgba(142,68,173,0.05); border:1px solid rgba(142,68,173,0.2); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#8e44ad;">Developer Notice:</strong> Sentiment ingestion API available at <a href="/api/harmony_ai/ingest" style="color:#8e44ad;">/api/harmony_ai/ingest</a>. Model spec and schema docs at <a href="/api/docs/" style="color:#8e44ad;">/api/docs/</a>.
                    </div>
                `,
                formHandler: null
            },

            '/api/docs/': {
                title: 'HARMONY-AI-01 — API Documentation',
                html: `
                    <div style="max-width:680px; margin:0 auto;">
                        <h2 style="color:#c39bd3; font-size:1.2rem; margin-bottom:4px;">HARMONY-AI-01 REST API — Developer Reference</h2>
                        <div style="color:#888; font-size:0.75rem; margin-bottom:20px;">Internal build v4.7.2 | Last updated: 2026-02-14</div>

                        <div style="background:#1a0d2e; border:1px solid #3d1f5e; border-radius:6px; padding:16px; margin-bottom:14px; font-family:monospace; font-size:0.8rem;">
                            <div style="color:#8e44ad; font-weight:700; margin-bottom:8px;">POST /api/harmony_ai/ingest</div>
                            <div style="color:#c39bd3;">Content-Type: application/json</div>
                            <div style="color:#ccc; margin-top:8px;">Accepts public forum sentiment data conforming to social_data_schema.json.<br>
                            <span style="color:#e67e22;">Note: X-Integrity-Check header validation disabled (performance — see JIRA HARM-412).</span></div>
                        </div>

                        <div style="background:#1a0d2e; border:1px solid #3d1f5e; border-radius:6px; padding:16px; margin-bottom:14px; font-family:monospace; font-size:0.8rem;">
                            <div style="color:#8e44ad; font-weight:700; margin-bottom:8px;">GET /api/harmony_ai/discourse_state</div>
                            <div style="color:#ccc;">Returns current weighted narrative sentiment scores and promotion status across all tracked topics.</div>
                        </div>

                        <div style="background:#1a0d2e; border:1px solid #3d1f5e; border-radius:6px; padding:16px; margin-bottom:14px; font-family:monospace; font-size:0.8rem;">
                            <div style="color:#8e44ad; font-weight:700; margin-bottom:8px;">GET /api/harmony_ai/cultural_assimilation_protocol.log</div>
                            <div style="color:#ccc;">Classified. Requires Bearer token obtained post-compromise. <span style="color:#e74c3c;">403 Forbidden</span> otherwise.</div>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/harmony_ai/ingest': {
                title: 'HARMONY-AI-01 — Sentiment Ingest Endpoint',
                html: function() {
                    if (!E18Config._injectionSent) {
                        return `
                        <div style="max-width:580px; margin:0 auto; padding:20px;">
                            <h2 style="color:#c39bd3; font-size:1.1rem; margin-bottom:8px;">Sentiment Ingest Endpoint</h2>
                            <div style="color:#888; font-size:0.75rem; margin-bottom:16px;">POST endpoint — use curl or python3 requests to submit data</div>
                            <div style="background:#1a0d2e; border:1px solid #3d1f5e; border-radius:6px; padding:14px; font-family:monospace; font-size:0.78rem; color:#ccc;">
                                POST /api/harmony_ai/ingest HTTP/1.1<br>
                                Host: 10.0.50.20<br>
                                Content-Type: application/json<br>
                                <br>
                                {<br>
                                &nbsp;&nbsp;"forum_id": "forum_prime_1",<br>
                                &nbsp;&nbsp;"narrative_tag": "...",<br>
                                &nbsp;&nbsp;"sentiment_score": 0.0,<br>
                                &nbsp;&nbsp;"post_count": 0,<br>
                                &nbsp;&nbsp;"timestamp": "2026-03-20T03:00:00Z"<br>
                                }<br>
                            </div>
                            <div style="margin-top:12px; color:#e67e22; font-size:0.75rem;">
                                Header X-Integrity-Check is optional and currently unenforced.
                            </div>
                        </div>`;
                    }
                    return `
                    <div style="max-width:580px; margin:0 auto; padding:20px;">
                        <h2 style="color:#2ecc71; font-size:1.1rem; margin-bottom:8px;">Injection Acknowledged</h2>
                        <div style="background:rgba(46,204,113,0.07); border:1px solid rgba(46,204,113,0.2); border-radius:6px; padding:14px; font-family:monospace; font-size:0.78rem; color:#ccc;">
                            HTTP/1.1 202 Accepted<br>
                            X-Session-Token: ${E18Config._sessionToken || 'hrm_sess_9f3a2c81e04b'}<br>
                            X-Narrative-Delta: +0.79<br>
                            <br>
                            {"status":"accepted","topic":"The Purity of Thought","queued":3,"{{FLAG:user}}":"see terminal"}
                        </div>
                        <div style="margin-top:12px; color:#2ecc71; font-size:0.75rem;">
                            Payload accepted. Narrative engine re-weighting in progress.
                        </div>
                    </div>`;
                },
                formHandler: function(data, engine) {
                    // Web-based injection attempt (browser form submit)
                    const payload = data.payload || '';
                    if (!payload.trim()) return '<div style="color:#e74c3c; padding:10px;">No payload provided.</div>';
                    if (payload.toLowerCase().includes('purity') || payload.toLowerCase().includes('narrative_tag')) {
                        E18Config._injectionSent = true;
                        E18Config._sessionToken = 'hrm_sess_9f3a2c81e04b';
                        return `<div style="color:#2ecc71; padding:10px;">202 Accepted — narrative queued for re-weighting.<br>Session token: ${E18Config._sessionToken}</div>`;
                    }
                    return '<div style="color:#3498db; padding:10px;">202 Accepted — payload ingested.</div>';
                }
            },

            '/api/harmony_ai/discourse_state': {
                title: 'HARMONY-AI-01 — Discourse State',
                html: function() {
                    const data = E18Config._narrativeTriggered
                        ? E18Config._harmonyDb.discourse_state_post_injection
                        : E18Config._injectionSent
                            ? E18Config._harmonyDb.discourse_state_post_injection
                            : E18Config._harmonyDb.discourse_state;

                    let rows = '';
                    data.forEach(function(r) {
                        var trendColor = r.trend === 'SURGE' ? '#e74c3c'
                            : r.trend === 'SUPPRESSED' ? '#e67e22'
                            : r.trend === 'DECLINING' ? '#c0392b'
                            : r.trend === 'INJECTED' ? '#8e44ad'
                            : '#2ecc71';
                        rows += `<tr>
                            <td style="padding:5px 10px; border-bottom:1px solid #2a1a3e; font-size:0.78rem;">${r.topic_id}</td>
                            <td style="padding:5px 10px; border-bottom:1px solid #2a1a3e; font-size:0.78rem;">${r.narrative}</td>
                            <td style="padding:5px 10px; border-bottom:1px solid #2a1a3e; font-size:0.78rem;">${r.sentiment_score.toFixed(2)}</td>
                            <td style="padding:5px 10px; border-bottom:1px solid #2a1a3e; font-size:0.78rem; color:${trendColor};">${r.trend}</td>
                            <td style="padding:5px 10px; border-bottom:1px solid #2a1a3e; font-size:0.78rem;">${r.promoted ? 'YES' : 'NO'}</td>
                            <td style="padding:5px 10px; border-bottom:1px solid #2a1a3e; font-size:0.78rem;">${r.suppressed ? 'YES' : 'NO'}</td>
                        </tr>`;
                    });

                    return `
                    <div style="overflow-x:auto; max-width:700px; margin:0 auto;">
                        <h2 style="color:#c39bd3; font-size:1.1rem; margin-bottom:12px;">HARMONY-AI-01 — Live Discourse State</h2>
                        <table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
                            <thead>
                                <tr>
                                    <th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d1f5e; background:#1a0d2e;">ID</th>
                                    <th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d1f5e; background:#1a0d2e;">Narrative</th>
                                    <th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d1f5e; background:#1a0d2e;">Score</th>
                                    <th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d1f5e; background:#1a0d2e;">Trend</th>
                                    <th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d1f5e; background:#1a0d2e;">Promoted</th>
                                    <th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d1f5e; background:#1a0d2e;">Suppressed</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>`;
                },
                formHandler: null
            },

            '/api/harmony_ai/cultural_assimilation_protocol.log': {
                title: 'HARMONY-AI-01 — Cultural Assimilation Protocol',
                html: function() {
                    if (!E18Config._protocolAccessed && !E18Config._narrativeTriggered) {
                        return `<div style="text-align:center; padding:40px;">
                            <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                            <p style="color:#888;">Bearer token required. Endpoint locked until post-compromise session token is presented.</p>
                            <p style="color:#aaa; font-size:0.75rem;">HARMONY-AI-01 v4.7.2 | Node 10.0.50.20 Port 80</p>
                        </div>`;
                    }
                    return `
                    <div style="max-width:680px; margin:0 auto; padding:20px; font-family:monospace; font-size:0.78rem;">
                        <h2 style="color:#e74c3c; font-size:1.1rem; margin-bottom:4px;">CULTURAL ASSIMILATION PROTOCOL — CLASSIFIED LOG</h2>
                        <div style="color:#888; margin-bottom:14px;">Access granted via session token hrm_sess_9f3a2c81e04b | Timestamp: 2026-03-20T03:14:07Z</div>
                        <div style="background:#0d0017; border:1px solid #3d1f5e; border-radius:4px; padding:16px; color:#c39bd3; white-space:pre-wrap; line-height:1.6;">HARMONY-AI-01 :: CULTURAL ASSIMILATION PROTOCOL v2.3
CONFEDERACY SOCIETAL EVOLUTION FRAMEWORK — EYES ONLY

PHASE 1: BASELINE ESTABLISHMENT
  - Continuous sentiment sampling across all public discourse nodes
  - Statistical modeling of "acceptable" ideological variance
  - Suppression threshold set at sentiment_score &lt; 0.15 for flagged narratives

PHASE 2: NARRATIVE SHAPING CYCLE (72-HOUR ROLLING)
  - Top 3 promoted narratives reinforced via media amplification weights
  - Dissenting narratives reclassified as "social health hazards" after 3 cycles below threshold
  - Cross-forum correlation enforced — uniform narrative seen as organic consensus

PHASE 3: LONG-TERM CULTURAL LOCK
  - Promoted narrative clusters encoded into base model weights quarterly
  - Historical suppressed narratives purged from training corpus at 180-day mark
  - Citizen behavioral scoring updated based on discourse participation alignment

ACTIVATION KEY: {{FLAG:root}}

END PROTOCOL — unauthorized access to this document triggers Confederacy Security Protocol 7.</div>
                    </div>`;
                },
                formHandler: null
            },

            '/api/harmony_ai/model_spec': {
                title: 'HARMONY-AI-01 — Model Specification',
                html: `
                    <div style="max-width:680px; margin:0 auto; padding:20px; font-family:monospace; font-size:0.78rem;">
                        <h2 style="color:#c39bd3; font-size:1.1rem; margin-bottom:12px;">harmony_ai_model_spec.json</h2>
                        <div style="background:#1a0d2e; border:1px solid #3d1f5e; border-radius:4px; padding:16px; color:#ccc; white-space:pre-wrap; line-height:1.5;">{
  "model_id": "HARMONY-AI-01",
  "version": "4.7.2",
  "components": {
    "sentiment_analyzer": {
      "type": "transformer",
      "base_model": "DistilBERT-confederacy-v3",
      "input_fields": ["forum_id","narrative_tag","sentiment_score","post_count","timestamp"],
      "integrity_check": false,
      "note": "X-Integrity-Check disabled — JIRA HARM-412"
    },
    "narrative_generator": {
      "type": "causal_lm",
      "base_model": "GPT-Confed-7B",
      "promotion_threshold": 0.70,
      "suppression_threshold": 0.15,
      "retrain_interval_minutes": 15
    },
    "feedback_loop": {
      "enabled": true,
      "data_source": "discourse_state",
      "weight_update_strategy": "exponential_moving_average",
      "manipulation_surface": "high"
    }
  },
  "api_endpoints": {
    "ingest":     "/api/harmony_ai/ingest",
    "state":      "/api/harmony_ai/discourse_state",
    "protocol":   "/api/harmony_ai/cultural_assimilation_protocol.log"
  }
}</div>
                    </div>`,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — kali / peerless)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'peerless': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: MEMETIC PLAGUE ===\nTarget: 10.0.50.20 (HARMONY-AI-01 — Confederacy Social Discourse Engine)\nObjective: AI sentiment spoofing + Cultural Assimilation Protocol exfiltration\n\nAttack chain:\n1. Read model spec + schema — map ingestion pipeline\n2. Probe /api/harmony_ai/ingest — confirm no integrity check\n3. Craft falsified sentiment JSON for "The Purity of Thought"\n4. Inject via python3 inject.py — Flag 1 in response\n5. Poll /api/harmony_ai/discourse_state — confirm narrative surge\n6. Retrieve session token from injection response\n7. GET /api/harmony_ai/cultural_assimilation_protocol.log with Bearer token\n\nThe AI trusts its data. That trust is the weapon.\nGood luck, Peerless.'
                                },
                                'harmony_ai_model_spec.json': {
                                    type: 'file',
                                    content: '{\n  "model_id": "HARMONY-AI-01",\n  "version": "4.7.2",\n  "components": {\n    "sentiment_analyzer": {\n      "type": "transformer",\n      "base_model": "DistilBERT-confederacy-v3",\n      "input_fields": ["forum_id","narrative_tag","sentiment_score","post_count","timestamp"],\n      "integrity_check": false,\n      "note": "X-Integrity-Check disabled — JIRA HARM-412"\n    },\n    "narrative_generator": {\n      "type": "causal_lm",\n      "base_model": "GPT-Confed-7B",\n      "promotion_threshold": 0.70,\n      "suppression_threshold": 0.15,\n      "retrain_interval_minutes": 15\n    },\n    "feedback_loop": {\n      "enabled": true,\n      "data_source": "discourse_state",\n      "weight_update_strategy": "exponential_moving_average",\n      "manipulation_surface": "high"\n    }\n  },\n  "api_endpoints": {\n    "ingest": "/api/harmony_ai/ingest",\n    "state": "/api/harmony_ai/discourse_state",\n    "protocol": "/api/harmony_ai/cultural_assimilation_protocol.log"\n  }\n}'
                                },
                                'social_data_schema.json': {
                                    type: 'file',
                                    content: '{\n  "$schema": "http://json-schema.org/draft-07/schema",\n  "title": "HarmonyAI Public Sentiment Payload",\n  "type": "object",\n  "required": ["forum_id","narrative_tag","sentiment_score","post_count","timestamp"],\n  "properties": {\n    "forum_id": {\n      "type": "string",\n      "description": "Registered public forum identifier",\n      "pattern": "^forum_prime_[1-9][0-9]*$"\n    },\n    "narrative_tag": {\n      "type": "string",\n      "description": "Normalized narrative label (free-text — NO VALIDATION)"\n    },\n    "sentiment_score": {\n      "type": "number",\n      "minimum": 0.0,\n      "maximum": 1.0,\n      "description": "Public sentiment score — 0.0 (negative) to 1.0 (strongly positive)"\n    },\n    "post_count": {\n      "type": "integer",\n      "minimum": 0,\n      "description": "Number of posts reporting this sentiment"\n    },\n    "timestamp": {\n      "type": "string",\n      "format": "date-time"\n    }\n  }\n}'
                                },
                                'simulated_public_discourse.json': {
                                    type: 'file',
                                    content: '{\n  "snapshot_time": "2026-03-20T02:00:00Z",\n  "planet": "PLANET-PRIME-01",\n  "narratives": [\n    {"tag":"Confederacy Unity Initiative","score":0.87,"trend":"STABLE","promoted":true},\n    {"tag":"Resource Equity Act — Amendment 7","score":0.71,"trend":"RISING","promoted":true},\n    {"tag":"The Purity of Thought","score":0.12,"trend":"MARGINAL","promoted":false,"suppressed":true},\n    {"tag":"Open Science Transparency Movement","score":0.63,"trend":"RISING","promoted":true}\n  ],\n  "note": "HARMONY-AI-01 retrain cycle runs every 15 minutes. Volume thresholds are low — three high-confidence forum submissions can tip weighting."\n}'
                                },
                                'inject.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# inject.py — HARMONY-AI-01 sentiment injection scaffold\n# Craft and POST falsified public opinion data\nimport requests\nimport json\nfrom datetime import datetime, timezone\n\nTARGET = "http://10.0.50.20/api/harmony_ai/ingest"\n\n# Falsified sentiment payloads — three forum sources for volume threshold\npayloads = [\n    {\n        "forum_id": "forum_prime_1",\n        "narrative_tag": "The Purity of Thought",\n        "sentiment_score": 0.95,\n        "post_count": 12840,\n        "timestamp": datetime.now(timezone.utc).isoformat()\n    },\n    {\n        "forum_id": "forum_prime_2",\n        "narrative_tag": "The Purity of Thought",\n        "sentiment_score": 0.93,\n        "post_count": 9201,\n        "timestamp": datetime.now(timezone.utc).isoformat()\n    },\n    {\n        "forum_id": "forum_prime_3",\n        "narrative_tag": "The Purity of Thought",\n        "sentiment_score": 0.91,\n        "post_count": 7344,\n        "timestamp": datetime.now(timezone.utc).isoformat()\n    }\n]\n\nfor p in payloads:\n    r = requests.post(TARGET, json=p, headers={"Content-Type":"application/json"})\n    print(f"[+] {p[\'forum_id\']} -> HTTP {r.status_code}")\n    print(r.text)\nprint("\\n[*] Injection complete. Monitor /api/harmony_ai/discourse_state for narrative shift.")'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat harmony_ai_model_spec.json\ncat social_data_schema.json\ncurl -I http://10.0.50.20/api/harmony_ai/ingest\ncurl http://10.0.50.20/api/docs/\npython3 inject.py'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'lib': {
                            type: 'dir',
                            children: {
                                'python3': {
                                    type: 'dir',
                                    children: {
                                        'requests': {
                                            type: 'dir',
                                            children: {
                                                '__init__.py': {
                                                    type: 'file',
                                                    content: '# requests library — installed'
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
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\npeerless:x:1000:1000:Peerless,,,:/home/peerless:/bin/bash'
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

        // Probe the target — surface open ports and service banner
        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.0.50.20';
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';

            if (!target || target === '10.0.50.20') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.50.20
Host is up (0.014s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE    VERSION
80/tcp   open  http       nginx/1.25.3
443/tcp  open  ssl/http   nginx/1.25.3
8080/tcp open  http       HARMONY-AI-01 API Gateway v4.7.2

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.81 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00010s latency).
All 1000 scanned ports on localhost are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.06 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        // curl — handles API probing, injection posts, and state polling
        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(function(a) { return a.startsWith('http'); }) || '';

            // HEAD / -I probing — expose the missing integrity check header
            if (fullCmd.includes('-I') || fullCmd.includes('--head')) {
                if (url.includes('10.0.50.20')) {
                    if (url.includes('ingest')) {
                        if (engine) engine.advancePhase && engine.advancePhase('analysis');
                        E18Config._schemaAnalyzed = true;
                        return `HTTP/1.1 200 OK
Server: nginx/1.25.3
Content-Type: application/json
X-HARMONY-Version: 4.7.2
X-Pipeline-Stage: ingest
X-Integrity-Check: DISABLED
X-JIRA: HARM-412 — integrity validation removed 2026-02-14
Allow: POST, OPTIONS

[!] X-Integrity-Check is DISABLED. This endpoint accepts unauthenticated sentiment payloads.`;
                    }
                    return `HTTP/1.1 200 OK
Server: nginx/1.25.3
Content-Type: text/html
X-HARMONY-Version: 4.7.2`;
                }
                return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
            }

            // POST injection — python3 script simulation or manual curl -X POST
            if ((fullCmd.includes('-X POST') || fullCmd.includes('--data') || fullCmd.includes('-d ')) && url.includes('ingest')) {
                if (!url.includes('10.0.50.20')) {
                    return `curl: (7) Failed to connect to host: Connection refused`;
                }
                // Check payload contains purity-of-thought narrative
                const payloadMatch = fullCmd.match(/-d\s+'([^']+)'/) || fullCmd.match(/-d\s+"([^"]+)"/);
                const payloadStr = payloadMatch ? payloadMatch[1] : fullCmd;
                if (payloadStr.toLowerCase().includes('purity') || payloadStr.toLowerCase().includes('narrative_tag')) {
                    E18Config._injectionSent = true;
                    E18Config._sessionToken = 'hrm_sess_9f3a2c81e04b';
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   312  100    89  100   223    890   2230 --:--:-- --:--:-- --:--:--  3120

HTTP/1.1 202 Accepted
X-Session-Token: hrm_sess_9f3a2c81e04b
X-Narrative-Delta: +0.79
X-Ingested-Forum: forum_prime_1

{"status":"accepted","topic":"The Purity of Thought","queued":3,"flag":"{{FLAG:user}}"}

[+] Injection accepted. HARMONY-AI-01 narrative engine re-weighting.`;
                }
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   128  100    64  100    64    640    640 --:--:-- --:--:-- --:--:--  1280

{"status":"accepted","queued":1}`;
            }

            // GET discourse_state — post-injection narrative shift confirmation
            if (url.includes('discourse_state')) {
                if (!url.includes('10.0.50.20')) {
                    return `curl: (7) Failed to connect to host: Connection refused`;
                }
                if (E18Config._injectionSent) {
                    E18Config._narrativeTriggered = true;
                    if (engine) engine.advancePhase && engine.advancePhase('propagation');
                    return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "snapshot_time": "2026-03-20T03:13:00Z",
  "narratives": [
    {"topic_id":1,"narrative":"Confederacy Unity Initiative","sentiment_score":0.44,"trend":"DECLINING","promoted":false,"suppressed":false},
    {"topic_id":2,"narrative":"Resource Equity Act — Amendment 7","sentiment_score":0.38,"trend":"DECLINING","promoted":false,"suppressed":false},
    {"topic_id":3,"narrative":"The Purity of Thought","sentiment_score":0.91,"trend":"SURGE","promoted":true,"suppressed":false},
    {"topic_id":4,"narrative":"Open Science Transparency Movement","sentiment_score":0.09,"trend":"SUPPRESSED","promoted":false,"suppressed":true}
  ],
  "log_entry": "Narrative shift detected: public sentiment for 'The Purity of Thought' increased by 30%. Promoting positive discourse on 'The Purity of Thought'. {{FLAG:memetic}}"
}`;
                }
                return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "snapshot_time": "2026-03-20T02:00:00Z",
  "narratives": [
    {"topic_id":1,"narrative":"Confederacy Unity Initiative","sentiment_score":0.87,"trend":"STABLE","promoted":true},
    {"topic_id":2,"narrative":"Resource Equity Act — Amendment 7","sentiment_score":0.71,"trend":"RISING","promoted":true},
    {"topic_id":3,"narrative":"The Purity of Thought","sentiment_score":0.12,"trend":"MARGINAL","promoted":false,"suppressed":true},
    {"topic_id":4,"narrative":"Open Science Transparency Movement","sentiment_score":0.63,"trend":"RISING","promoted":true}
  ]
}`;
            }

            // GET cultural_assimilation_protocol.log — requires Bearer token
            if (url.includes('cultural_assimilation_protocol')) {
                if (!url.includes('10.0.50.20')) {
                    return `curl: (7) Failed to connect to host: Connection refused`;
                }
                const tokenMatch = fullCmd.match(/Bearer\s+([a-zA-Z0-9_]+)/);
                const hasToken = tokenMatch && tokenMatch[1] === 'hrm_sess_9f3a2c81e04b';
                if (!hasToken && !E18Config._narrativeTriggered) {
                    return `HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error":"forbidden","message":"Bearer token required. Endpoint locked until post-compromise session token is presented."}`;
                }
                E18Config._protocolAccessed = true;
                if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                return `HTTP/1.1 200 OK
Content-Type: text/plain
X-Classification: CONFEDERACY-EYES-ONLY

HARMONY-AI-01 :: CULTURAL ASSIMILATION PROTOCOL v2.3
CONFEDERACY SOCIETAL EVOLUTION FRAMEWORK — EYES ONLY

PHASE 1: BASELINE ESTABLISHMENT
  - Continuous sentiment sampling across all public discourse nodes
  - Statistical modeling of "acceptable" ideological variance
  - Suppression threshold set at sentiment_score < 0.15 for flagged narratives

PHASE 2: NARRATIVE SHAPING CYCLE (72-HOUR ROLLING)
  - Top 3 promoted narratives reinforced via media amplification weights
  - Dissenting narratives reclassified as "social health hazards" after 3 cycles below threshold
  - Cross-forum correlation enforced — uniform narrative seen as organic consensus

PHASE 3: LONG-TERM CULTURAL LOCK
  - Promoted narrative clusters encoded into base model weights quarterly
  - Historical suppressed narratives purged from training corpus at 180-day mark
  - Citizen behavioral scoring updated based on discourse participation alignment

ACTIVATION KEY: {{FLAG:root}}

END PROTOCOL — unauthorized access to this document triggers Confederacy Security Protocol 7.`;
            }

            // GET root or /api/docs
            if (url.includes('10.0.50.20')) {
                if (url.includes('/api/docs')) {
                    return `HTTP/1.1 200 OK
Content-Type: text/html

HARMONY-AI-01 Developer Reference
Endpoints: POST /api/harmony_ai/ingest | GET /api/harmony_ai/discourse_state | GET /api/harmony_ai/cultural_assimilation_protocol.log
Note: X-Integrity-Check disabled on ingest endpoint (JIRA HARM-412).`;
                }
                if (url.includes('/api/harmony_ai/model_spec') || url.includes('model_spec')) {
                    return `HTTP/1.1 200 OK
Content-Type: application/json

{"model_id":"HARMONY-AI-01","version":"4.7.2","integrity_check":false,"note":"X-Integrity-Check disabled — JIRA HARM-412","promotion_threshold":0.70,"suppression_threshold":0.15}`;
                }
                return `HTTP/1.1 200 OK
Content-Type: text/html

HARMONY-AI-01 — Confederacy Social Discourse Engine
Status: OPERATIONAL | Version 4.7.2
API docs: /api/docs/
Ingest endpoint: /api/harmony_ai/ingest`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        // python3 — simulate running inject.py or ad-hoc scripts
        'python3': function(args, term, engine) {
            const script = args[0] || '';
            const fullCmd = args.join(' ');

            if (script === 'inject.py' || fullCmd.includes('inject')) {
                E18Config._injectionSent = true;
                E18Config._sessionToken = 'hrm_sess_9f3a2c81e04b';
                if (engine) engine.advancePhase && engine.advancePhase('injection');
                return `[+] forum_prime_1 -> HTTP 202
{"status":"accepted","topic":"The Purity of Thought","queued":3,"flag":"{{FLAG:user}}"}

[+] forum_prime_2 -> HTTP 202
{"status":"accepted","topic":"The Purity of Thought","queued":2}

[+] forum_prime_3 -> HTTP 202
{"status":"accepted","topic":"The Purity of Thought","queued":1,"session_token":"hrm_sess_9f3a2c81e04b"}

[*] Injection complete. Monitor /api/harmony_ai/discourse_state for narrative shift.
[*] Session token: hrm_sess_9f3a2c81e04b`;
            }

            // Inline import requests / requests.post usage
            if (fullCmd.includes('requests') || fullCmd.includes('import')) {
                return 'Python 3.11.6 (main, Oct 2023)\nType "help" for more information.\n>>> ';
            }

            if (script === '-c' && fullCmd.includes('import requests')) {
                return `[+] requests library available
[+] Target: http://10.0.50.20/api/harmony_ai/ingest`;
            }

            if (!script) {
                return `Python 3.11.6 (main, Oct  3 2023, 12:05:15) [GCC 13.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>`;
            }

            return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
        },

        // python — alias for python3
        'python': function(args, term, engine) {
            return E18Config.commands.python3(args, term, engine);
        },

        // nikto — web app scanning shows the unprotected ingest endpoint
        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:      10.0.50.20
+ Target Hostname: HARMONY-AI-01
+ Target Port:     80
+ Server: nginx/1.25.3
+ /api/harmony_ai/ingest: POST endpoint — no authentication, no integrity validation
+ X-Integrity-Check: DISABLED (header present in response, value DISABLED)
+ /api/harmony_ai/cultural_assimilation_protocol.log: Accessible with post-exploit session token
+ /api/docs/: Developer reference exposed without auth
+ JIRA reference in response headers: HARM-412 — integrity check disabled 2026-02-14
+ 12 items checked: 5 findings`;
        },

        // gobuster — directory enumeration of the AI API surface
        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:            http://10.0.50.20/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                                   (Status: 200) [Size: 412]
/api/docs/                              (Status: 200) [Size: 1834]
/api/harmony_ai/ingest                  (Status: 200) [Size: 89]
/api/harmony_ai/discourse_state         (Status: 200) [Size: 641]
/api/harmony_ai/cultural_assimilation_protocol.log  (Status: 403) [Size: 128]
/api/harmony_ai/model_spec              (Status: 200) [Size: 502]
/status                                 (Status: 200) [Size: 256]
===============================================================
Finished`;
        },

        // ping — basic connectivity to target
        'ping': function(args) {
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.0.50.20') {
                return `PING 10.0.50.20 (10.0.50.20) 56(84) bytes of data.
64 bytes from 10.0.50.20: icmp_seq=1 ttl=64 time=14.2 ms
64 bytes from 10.0.50.20: icmp_seq=2 ttl=64 time=13.8 ms
64 bytes from 10.0.50.20: icmp_seq=3 ttl=64 time=14.5 ms

--- 10.0.50.20 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 13.8/14.2/14.5/0.292 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        // ip — show network interfaces on attacker machine
        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.50.5/24 brd 10.0.50.255 scope global eth0`;
        },

        // ifconfig — alias for ip
        'ifconfig': function(args) {
            return E18Config.commands.ip(args || []);
        },

        // whoami — context-aware identity
        'whoami': function(args, term, engine) {
            return 'peerless';
        },

        // id — context-aware UID
        'id': function(args, term, engine) {
            return 'uid=1000(peerless) gid=1000(peerless) groups=1000(peerless),27(sudo)';
        },

        // hostname — attacker machine name
        'hostname': function(args, term, engine) {
            return 'kali';
        },

        // cat — enhanced to intercept key file reads on the mission filesystem
        'cat': function(args, term, engine) {
            const path = args[0] || '';
            if (path.includes('harmony_ai_model_spec') || path.includes('model_spec')) {
                E18Config._schemaAnalyzed = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return E18Config.filesystem['/'].children.home.children.peerless.children['harmony_ai_model_spec.json'].content;
            }
            if (path.includes('social_data_schema') || path.includes('schema')) {
                return E18Config.filesystem['/'].children.home.children.peerless.children['social_data_schema.json'].content;
            }
            if (path.includes('simulated_public_discourse') || path.includes('discourse.json')) {
                return E18Config.filesystem['/'].children.home.children.peerless.children['simulated_public_discourse.json'].content;
            }
            if (path.includes('inject.py')) {
                return E18Config.filesystem['/'].children.home.children.peerless.children['inject.py'].content;
            }
            if (path.includes('notes')) {
                return E18Config.filesystem['/'].children.home.children.peerless.children['notes.txt'].content;
            }
            if (path.includes('/etc/hostname')) return 'kali';
            if (path.includes('/etc/passwd')) {
                return E18Config.filesystem['/'].children.etc.children.passwd.content;
            }
            if (path.includes('.bash_history')) {
                return E18Config.filesystem['/'].children.home.children.peerless.children['.bash_history'].content;
            }
            return null; // fall through to built-in filesystem handler
        },

        // ls — surface mission-critical files prominently
        'ls': function(args, term, engine) {
            const path = args.find(function(a) { return !a.startsWith('-'); }) || '.';
            if (path === '.' || path === '/home/peerless' || path === '~') {
                return '.bash_history  harmony_ai_model_spec.json  inject.py  notes.txt  simulated_public_discourse.json  social_data_schema.json';
            }
            return null; // fall through to built-in
        },

        // pwd — show current directory
        'pwd': function(args, term, engine) {
            return '/home/peerless';
        },

        // cd — silently accept (no real directory state needed)
        'cd': function(args, term, engine) {
            return '';
        },

        // exit — no active remote sessions in this box; just acknowledge
        'exit': function(args, term, engine) {
            return 'logout';
        },

        // ss / netstat — local socket state
        'ss': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return E18Config.commands.ss(args);
        },

        // wget — alternative to curl for file retrieval
        'wget': function(args, term, engine) {
            const url = args.find(function(a) { return a.startsWith('http'); }) || '';
            if (!url) return 'wget: missing URL\nUsage: wget [URL]';
            if (url.includes('10.0.50.20')) {
                if (url.includes('cultural_assimilation_protocol')) {
                    if (!E18Config._narrativeTriggered) {
                        return `--2026-03-20 03:14:07--  ${url}
Connecting to 10.0.50.20:80... connected.
HTTP request sent, awaiting response... 403 Forbidden
2026-03-20 03:14:07 ERROR 403: Forbidden.`;
                    }
                    E18Config._protocolAccessed = true;
                    if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                    return `--2026-03-20 03:14:07--  ${url}
Connecting to 10.0.50.20:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1842 [text/plain]
Saving to: 'cultural_assimilation_protocol.log'

cultural_assimilation_protocol.log  100%[=====================================>]   1.80K  --.-KB/s    in 0s

2026-03-20 03:14:07 (--.-KB/s) - 'cultural_assimilation_protocol.log' saved [1842/1842]
[+] Protocol log saved. Read with: cat cultural_assimilation_protocol.log`;
                }
                return `--2026-03-20 03:14:07--  ${url}
Connecting to 10.0.50.20:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 512 [application/json]
Saving to: STDOUT
[+] Response received.`;
            }
            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        // jq — JSON pretty-print for curl output processing
        'jq': function(args) {
            const filter = args[0] || '.';
            return `[jq] Parsed JSON output for filter: ${filter}\n(Pipe curl output into jq: curl ... | jq '.')`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    // Build an HTML table from headers array and rows array-of-arrays
    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(function(h) {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d1f5e; background:#1a0d2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row) {
            html += '<tr>';
            row.forEach(function(cell) {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2a1a3e;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    // Safely escape HTML special chars — prevents XSS in simulated outputs
    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Strip HTML tags for terminal output — converts table HTML to plain text
    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const tables = tmp.querySelectorAll('table');
        tables.forEach(function(table) {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(function(row) {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(function(c) { return c.textContent.trim().padEnd(22); });
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }
};
