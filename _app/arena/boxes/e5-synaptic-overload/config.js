/* ============================================================
   CTF ARENA — Box E5: The Synaptic Overload
   Advanced Campaign | Signal Analysis, Cognitive Exploit, Population-Level Injection
   Config: BCI network, neuro-protocol artifacts, signal injection, flags, hints, lore
   ============================================================ */

const E5Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Synaptic Overload',
    subtitle: 'Advanced Campaign — Neuro-Network Analysis, Signal Injection, Cognitive Exploitation',
    difficulty: 'Advanced',
    accent: '#7c3aed',
    storageKey: 'hexworth_ctf_e5',
    registryId: 'e5-synaptic-overload',
    trackerKey: 'ctf_e5',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (BCI attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Protocol Analysis',
            icon: '\uD83E\uDDE0',
            description: 'Analyze the CCN-01 neuro-protocol specification and the reality baseline signal. Map the signal structure and identify encoding schemes.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1592'],
            unlocks: ['vulnerability'],
            locked: false
        },
        {
            id: 'vulnerability',
            name: 'Vulnerability Identification',
            icon: '\uD83D\uDD0D',
            description: 'Examine the reality baseline signal for cryptographic integrity weaknesses. Identify the Signal Integrity Flaw that allows forged injection.',
            requiredFlags: [],
            mitre: ['T1190', 'T1562.001'],
            unlocks: ['craft'],
            locked: true
        },
        {
            id: 'craft',
            name: 'Dissonator Crafting',
            icon: '\uD83E\uDDEA',
            description: 'Use Python to craft a cognitive dissonator — a neural signal pattern that overlays anxiety frequencies onto the baseline, inducing mass cognitive dissonance.',
            requiredFlags: ['signal'],
            mitre: ['T1059.006', 'T1027'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Network Injection',
            icon: '\uD83D\uDC89',
            description: 'Inject the cognitive dissonator into the CCN-01 broadcast channel. Monitor simulated_population_logs.json for evidence of altered perception.',
            requiredFlags: ['dissonator'],
            mitre: ['T1498', 'T1565.002', 'T1491'],
            unlocks: ['override'],
            locked: true
        },
        {
            id: 'override',
            name: 'Override Retrieval',
            icon: '\uD83D\uDDD4',
            description: 'Access the CCN-01 internal admin API after network compromise. Retrieve the Collective Consciousness Override master key.',
            requiredFlags: ['perception'],
            mitre: ['T1078', 'T1005', 'T1530'],
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
                title: 'Analyze the CCN-01 neuro-protocol specification',
                tip: 'Open the Terminal and run: cat ccn_neuro_protocol.txt — then examine the signal structure and encoding.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Parse the reality baseline signal',
                tip: 'Use Python to load reality_baseline_signal.csv. Run: python3 analyze_baseline.py — check for missing integrity checksums.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:python' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:python3' } },
                        { event: 'command', match: { cmd: 'contains:pandas' } }
                    ]
                }
            },
            {
                title: 'Identify the Signal Integrity Flaw and craft the dissonator',
                tip: 'The baseline has no HMAC. Generate a dissonator: overlay anxiety-frequency pattern (38-42 Hz, amplitude +0.6) onto the baseline. Flag 1 is the JSON pattern.',
                trigger: { event: 'flag_correct', match: { flagId: 'signal' } }
            },
            {
                title: 'Inject the dissonator and observe population logs',
                tip: 'Run: python3 inject_dissonator.py — then curl http://10.11.0.1/api/ccn/inject with your payload. Check simulated_population_logs.json for the altered-perception log entry (Flag 2).',
                trigger: { event: 'flag_correct', match: { flagId: 'dissonator' } }
            },
            {
                title: 'Retrieve the Collective Consciousness Override',
                tip: 'After injection succeeds, access the admin endpoint: curl http://10.11.0.1/api/ccn/override_protocol.log with the session token extracted from the population logs.',
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
            { flagId: 'signal',      objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Cryptographic integrity failure in broadcast neural signals', skill: 'Signal Integrity Analysis & Vulnerability Discovery' },
            { flagId: 'dissonator',  objective: '2.4', description: 'Given a scenario, analyze indicators associated with network attacks — Crafting and injecting forged neural signal payloads', skill: 'Payload Crafting & Signal Injection' },
            { flagId: 'perception',  objective: '1.4', description: 'Given a scenario, analyze potential indicators — Population-level cognitive manipulation via forged broadcast signals', skill: 'Cognitive Network Exploitation & Log Analysis' },
            { flagId: 'root',        objective: '4.1', description: 'Given a scenario, apply common security techniques — Override key retrieval from compromised BCI admin endpoint', skill: 'Multi-Stage Advanced Campaign Completion' }
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
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'peerless',
        hostname: 'kali',
        startDir: '/home/peerless',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.11.0.1 (CCN-NEXUS — Collective Cognition Network)\nObjective: Analyze CCN-01 neuro-protocols and inject cognitive dissonator.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'ccn-shell' | 'admin-api'
    _baselineAnalyzed: false,       // True after python analysis of baseline CSV
    _vulnIdentified: false,         // True after signal integrity flaw discovered
    _dissonatorCrafted: false,      // True after inject_dissonator.py runs
    _injectionComplete: false,      // True after curl injection to CCN API
    _sessionToken: null,            // Extracted from population logs after injection
    _adminApiAccessed: false,       // True after override_protocol.log retrieved

    _switchContext(ctx, term) {
        E5Config._context = ctx;
        // Update terminal prompt to match context
        if (term && term.config) {
            var prompt = E5Config._getPrompt();
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
        switch (E5Config._context) {
            case 'ccn-shell':  return 'ccn-op@CCN-NEXUS:/opt/ccn$ ';
            case 'admin-api':  return 'ccnadmin@CCN-NEXUS:/api$ ';
            default:           return null;  // use default peerless prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED POPULATION DATABASE (CCN-01 Internal)
    // ═══════════════════════════════════════════════════════

    _db: {
        // Population mental-state records post-injection
        population_states: [
            { citizen_id: 1001, sector: 'Central-A', baseline_mood: 'Calm',        post_inject_mood: 'Anxious',    memory_conflict: false, report: 'Normal' },
            { citizen_id: 1002, sector: 'Central-A', baseline_mood: 'Calm',        post_inject_mood: 'Fearful',    memory_conflict: true,  report: 'Mass Entity Sighting' },
            { citizen_id: 1003, sector: 'Central-B', baseline_mood: 'Content',     post_inject_mood: 'Paranoid',   memory_conflict: true,  report: 'False Memory: Quarantine' },
            { citizen_id: 1004, sector: 'Central-B', baseline_mood: 'Content',     post_inject_mood: 'Confused',   memory_conflict: false, report: 'News Misinterpretation' },
            { citizen_id: 1005, sector: 'Perimeter', baseline_mood: 'Neutral',     post_inject_mood: 'Calm',       memory_conflict: false, report: 'Unaffected' },
            { citizen_id: 9999, sector: 'CLASSIFIED',baseline_mood: '{{FLAG:perception}}', post_inject_mood: 'OVERRIDE', memory_conflict: true, report: 'SESSION_TOKEN:ccn_s3ss10n_7f4a2d' }
        ],
        // Override log — only accessible after injection
        override_log: [
            { log_id: 1, timestamp: '2026-03-20 03:12:04', event: 'INJECT',     actor: 'UNKNOWN',    details: 'Dissonator payload received on channel 7. Integrity check BYPASSED.' },
            { log_id: 2, timestamp: '2026-03-20 03:12:07', event: 'PROPAGATE',  actor: 'CCN-RELAY',  details: 'Dissonator broadcast to all 1,247,338 linked nodes in Central sectors.' },
            { log_id: 3, timestamp: '2026-03-20 03:12:19', event: 'PERCEPTION', actor: 'MONITOR',    details: 'Anomaly: Population reporting mass sightings of non-existent entity. Collective memory conflict detected.' },
            { log_id: 4, timestamp: '2026-03-20 03:12:31', event: 'ALERT',      actor: 'CCN-ADMIN',  details: 'Critical: Synaptic overload threshold reached. Override key generated.' },
            { log_id: 5, timestamp: '2026-03-20 03:12:31', event: 'KEY_GEN',    actor: 'CCN-ADMIN',  details: '{{FLAG:root}}' }
        ],
        schema: {
            tables: ['population_states', 'override_log'],
            columns: {
                population_states: ['citizen_id', 'sector', 'baseline_mood', 'post_inject_mood', 'memory_conflict', 'report'],
                override_log:      ['log_id', 'timestamp', 'event', 'actor', 'details']
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'signal',      points: 100 },   // Cognitive dissonator JSON pattern
        { id: 'dissonator',  points: 150 },   // Injection confirmation hash
        { id: 'perception',  points: 200 },   // Population log entry / altered perception evidence
        { id: 'root',        points: 250 }    // Collective Consciousness Override master key
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400                          // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: cat ccn_neuro_protocol.txt — focus on Section 3 (Integrity Model). Notice there is no HMAC or digital signature on the reality baseline broadcast. This is the Signal Integrity Flaw.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Parse reality_baseline_signal.csv with pandas. The baseline is a repeating 8Hz delta-wave pattern. Anxiety is encoded at 38-42 Hz, amplitude > 0.5. Craft a dissonator by overlaying this anxiety band onto the baseline and export the JSON: {"type":"dissonator","freq_hz":40,"amplitude":0.65,"duration_ms":3000,"channel":7}',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Inject using curl: curl -X POST http://10.11.0.1/api/ccn/inject -H "Content-Type: application/json" -d @dissonator.json — if successful, the server returns a session token. Then read simulated_population_logs.json for the altered-perception log entry (Flag 2).',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Use the session token from the population logs to authenticate: curl -H "X-CCN-Session: ccn_s3ss10n_7f4a2d" http://10.11.0.1/api/ccn/override_protocol.log — Flag 3 is in the KEY_GEN log entry at the bottom of the response.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Collective Cognition Network" (CCN-01) links the minds of every citizen in the Central sectors via implanted neural interfaces. It broadcasts a constant "reality baseline" signal — a carefully engineered delta-wave pattern that homogenizes perception and promotes collective harmony. Intelligence indicates the baseline signal lacks cryptographic integrity: there are no HMAC checks, no digital signatures, no replay protection. Your mission, Peerless: analyze CCN-01\'s protocols, identify the flaw, craft a cognitive dissonator, inject it into the live broadcast, and retrieve the Collective Consciousness Override — the master key to stabilizing or disrupting the entire network.',
        scenario: 'CCN-01 was designed by a team of neuroscientists who never anticipated adversarial signal injection. The network runs on a proprietary protocol (CCN-Protocol v2.3) where any node with broadcast-range access can submit signal updates — no authentication, no integrity check. The reality baseline repeats a known 8 Hz pattern on channel 7, the primary broadcast channel. Emotional-state frequencies are documented in the neuro-protocol spec. All it takes is overlaying the anxiety band (38-42 Hz) with sufficient amplitude to cause population-wide cognitive dissonance. The logs will show you how far the ripple spreads.',
        outro: 'CCN-01 has been compromised. The cognitive dissonator propagated to 1,247,338 linked citizens in the Central sectors. Population reports document mass entity sightings, false memories of quarantine events, and widespread news misinterpretation. The Collective Consciousness Override — the master stabilization key — has been extracted. The architects of CCN-01 built a powerful system for collective harmony, but left the most critical layer — signal integrity — completely unprotected.',
        ecer: {
            executive: 'CCN-01 program leadership assumed physical security of broadcast nodes eliminated the need for signal-level cryptographic protections; no adversarial model considered for insider or range-adjacent injection',
            culture: 'Neuroscience-first development team with no security engineers embedded; "stability through obscurity" mindset; no red team exercises ever conducted on the protocol layer',
            employee: 'Broadcast channel 7 accepts unauthenticated signal updates from any node within range; no HMAC or signature on reality baseline; emotional-state frequency encodings published in internal protocol spec without access control',
            regulatory: 'No established legal framework or compliance standard for BCI network security; no external audit of the neuro-protocol conducted since CCN-01 went live'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — CCN-01 Admin & Monitoring Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.11.0.1/',

        pages: {
            '/': {
                title: 'CCN-01 — Collective Cognition Network Monitor',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2d1f4e;">
                        <h1 style="color:#c4b5fd; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">CCN-01 Monitor</h1>
                        <div style="color:#7c3aed; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">COLLECTIVE COGNITION NETWORK</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">Central sectors link — 1,247,338 nodes active</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#0f0a1e; border:1px solid #2d1f4e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#a78bfa;">1,247,338</div>
                            <div style="color:#666; font-size:0.7rem;">Active Nodes</div>
                        </div>
                        <div style="background:#0f0a1e; border:1px solid #2d1f4e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#34d399;">NOMINAL</div>
                            <div style="color:#666; font-size:0.7rem;">Baseline Status</div>
                        </div>
                        <div style="background:#0f0a1e; border:1px solid #2d1f4e; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#a78bfa;">8 Hz</div>
                            <div style="color:#666; font-size:0.7rem;">Broadcast Freq</div>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:12px; background:rgba(124,58,237,0.06); border:1px solid rgba(124,58,237,0.2); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#7c3aed;">Network Notice:</strong> Signal injection API available at <a href="/api/ccn/inject" style="color:#a78bfa;">/api/ccn/inject</a> (internal broadcast nodes only). Admin logs at <a href="/api/ccn/override_protocol.log" style="color:#a78bfa;">/api/ccn/override_protocol.log</a>.
                    </div>
                `,
                formHandler: null
            },

            '/api/ccn/inject': {
                title: 'CCN-01 — Signal Injection Endpoint',
                html: function() {
                    if (!E5Config._injectionComplete) {
                        return `<div style="max-width:600px;margin:0 auto;padding:20px;background:#0f0a1e;border-radius:8px;border:1px solid #2d1f4e;">
                            <h2 style="color:#c4b5fd;margin-bottom:10px;">CCN-01 Signal Injection API</h2>
                            <p style="color:#888;font-size:0.8rem;margin-bottom:16px;">POST endpoint — accepts JSON signal payload on channel 7.</p>
                            <div style="background:#1a0f2e;color:#a78bfa;padding:16px;border-radius:6px;font-family:monospace;font-size:0.8rem;">
                                POST /api/ccn/inject<br>
                                Content-Type: application/json<br><br>
                                <span style="color:#666;">// Example payload:</span><br>
                                {"type":"signal","freq_hz":8,"amplitude":0.3,"duration_ms":1000,"channel":7}<br><br>
                                <span style="color:#666;">// No authentication required — CCN-Protocol v2.3</span><br>
                                <span style="color:#666;">// No integrity check — design spec section 3.1</span>
                            </div>
                        </div>`;
                    }
                    return `<div style="background:#0a1a0f;color:#34d399;padding:20px;border-radius:8px;border:1px solid #065f46;max-width:600px;margin:0 auto;">
                        <strong>Injection Accepted</strong><br>
                        <span style="font-size:0.85rem;">Dissonator propagated to 1,247,338 nodes.<br>Session token: ccn_s3ss10n_7f4a2d<br>Check /data/simulated_population_logs.json for population state update.</span>
                    </div>`;
                },
                formHandler: function(data, engine) {
                    const payload = data.payload || '';
                    if (!payload.trim()) return '<div style="color:#f87171;padding:10px;">No payload specified.</div>';
                    if (payload.includes('dissonator') || (payload.includes('freq_hz') && payload.includes('40'))) {
                        E5Config._injectionComplete = true;
                        E5Config._sessionToken = 'ccn_s3ss10n_7f4a2d';
                        return `<div style="color:#34d399;background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:6px;padding:16px;margin-top:16px;">
                            <strong>Injection Accepted — Channel 7</strong><br>
                            <span style="font-size:0.85rem;">Payload: <code>${E5Config._escHtml(payload.substring(0, 80))}</code><br>Nodes reached: 1,247,338<br>Session token: <code>ccn_s3ss10n_7f4a2d</code></span><br>
                            <span style="font-size:0.75rem;color:#888;">No integrity check performed. CCN-Protocol v2.3 vulnerability confirmed.</span>
                        </div>`;
                    }
                    return `<div style="color:#60a5fa;background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.2);border-radius:6px;padding:16px;margin-top:16px;">
                        <strong>Signal Received</strong><br>
                        <span style="font-size:0.85rem;">Payload accepted on channel 7. Propagated to active nodes.</span>
                    </div>`;
                }
            },

            '/api/ccn/override_protocol.log': {
                title: 'CCN-01 — Override Protocol Log',
                html: function() {
                    if (!E5Config._injectionComplete) {
                        return `<div style="text-align:center;padding:40px;">
                            <h1 style="color:#f87171;font-size:2rem;">403 Forbidden</h1>
                            <p style="color:#888;">Admin endpoint requires active session token.</p>
                            <p style="color:#666;font-size:0.75rem;">CCN-01 Monitor v3.1.4 at 10.11.0.1 port 80</p>
                        </div>`;
                    }
                    return `<div style="background:#0f0a1e;padding:20px;border-radius:8px;border:1px solid #2d1f4e;max-width:700px;margin:0 auto;">
                        <h2 style="color:#c4b5fd;margin-bottom:12px;font-family:monospace;font-size:1rem;">override_protocol.log — CCN-01 ADMIN</h2>
                        <div style="font-family:monospace;font-size:0.75rem;color:#a78bfa;line-height:1.9;">
                            [2026-03-20 03:12:04] INJECT     UNKNOWN     Dissonator payload received on channel 7. Integrity check BYPASSED.<br>
                            [2026-03-20 03:12:07] PROPAGATE  CCN-RELAY   Dissonator broadcast to all 1,247,338 linked nodes in Central sectors.<br>
                            [2026-03-20 03:12:19] PERCEPTION MONITOR     Anomaly: Population reporting mass sightings of non-existent entity. Collective memory conflict detected.<br>
                            [2026-03-20 03:12:31] ALERT      CCN-ADMIN   Critical: Synaptic overload threshold reached. Override key generated.<br>
                            [2026-03-20 03:12:31] KEY_GEN    CCN-ADMIN   <span style="color:#34d399;">{{FLAG:root}}</span>
                        </div>
                    </div>`;
                },
                formHandler: null
            },

            '/data/': {
                title: 'Forbidden',
                html: `<div style="text-align:center;padding:40px;">
                    <h1 style="color:#f87171;font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">Directory listing disabled.</p>
                    <p style="color:#666;font-size:0.75rem;">CCN-01 Monitor v3.1.4 at 10.11.0.1 port 80</p>
                </div>`,
                formHandler: null
            },

            '/api/': {
                title: 'CCN-01 API Index',
                html: `<div style="max-width:500px;margin:0 auto;padding:20px;background:#0f0a1e;border-radius:8px;border:1px solid #2d1f4e;">
                    <h2 style="color:#c4b5fd;margin-bottom:12px;font-size:1.1rem;">CCN-01 API Endpoints</h2>
                    <div style="font-family:monospace;font-size:0.8rem;color:#a78bfa;line-height:2;">
                        POST /api/ccn/inject<br>
                        <span style="color:#666; margin-left:24px;">Signal injection — no auth</span><br>
                        GET  /api/ccn/status<br>
                        <span style="color:#666; margin-left:24px;">Network health check</span><br>
                        GET  /api/ccn/override_protocol.log<br>
                        <span style="color:#666; margin-left:24px;">Admin log — session token required</span>
                    </div>
                </div>`,
                formHandler: null
            },

            '/api/ccn/status': {
                title: 'CCN-01 Network Status',
                html: function() {
                    const status = E5Config._injectionComplete ? 'CRITICAL — SYNAPTIC OVERLOAD' : 'NOMINAL';
                    const color  = E5Config._injectionComplete ? '#f87171' : '#34d399';
                    return `<div style="max-width:500px;margin:0 auto;padding:20px;background:#0f0a1e;border-radius:8px;border:1px solid #2d1f4e;">
                        <h2 style="color:#c4b5fd;margin-bottom:12px;">Network Status</h2>
                        <div style="font-family:monospace;font-size:0.8rem;line-height:2;color:#a78bfa;">
                            Status: <span style="color:${color};">${status}</span><br>
                            Active nodes: 1,247,338<br>
                            Broadcast channel 7: ${E5Config._injectionComplete ? '<span style="color:#f87171;">COMPROMISED</span>' : '<span style="color:#34d399;">ACTIVE</span>'}<br>
                            Baseline integrity: ${E5Config._injectionComplete ? '<span style="color:#f87171;">FAILED</span>' : '<span style="color:#34d399;">OK</span>'}<br>
                            Protocol version: CCN-Protocol v2.3
                        </div>
                    </div>`;
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — peerless / kali)
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
                                    content: '=== MISSION BRIEFING: SYNAPTIC OVERLOAD ===\nTarget: 10.11.0.1 (CCN-NEXUS — Collective Cognition Network)\nObjective: Analyze CCN-01 neuro-protocols, craft cognitive dissonator, inject, retrieve override key\n\nAttack chain:\n1. Analyze ccn_neuro_protocol.txt — map signal structure\n2. Parse reality_baseline_signal.csv — find integrity flaw\n3. Craft dissonator (Python) — target anxiety band 38-42 Hz, amplitude >0.5\n4. Inject via /api/ccn/inject — no auth, no HMAC\n5. Read simulated_population_logs.json — altered perception evidence (Flag 2)\n6. Retrieve override key from /api/ccn/override_protocol.log (Flag 3)\n\nFake it till you break it, Peerless.\nGood luck, operator.'
                                },
                                'ccn_neuro_protocol.txt': {
                                    type: 'file',
                                    content: '=== CCN-01 NEURO-PROTOCOL SPECIFICATION v2.3 ===\nClassification: INTERNAL — Not for distribution\n\nSECTION 1: SIGNAL TYPES\n------------------------\nDelta   : 0.5 –  4 Hz  | Deep sleep, memory consolidation\nTheta   : 4   –  8 Hz  | Drowsiness, meditative states\nAlpha   : 8   – 12 Hz  | Relaxed wakefulness (reality baseline)\nBeta    : 13  – 30 Hz  | Active cognition, alertness\nGamma   : 30  – 100 Hz | Higher cognition, fear, anxiety\n\nSECTION 2: BROADCAST CHANNELS\n------------------------------\nChannel 1  : Sensory sync (vision calibration)\nChannel 3  : Memory consolidation buffer\nChannel 5  : Emotional regulation (serotonin modulation)\nChannel 7  : Reality baseline broadcast (PRIMARY)\nChannel 9  : Admin / override (restricted)\n\nSECTION 3: INTEGRITY MODEL\n---------------------------\nProtocol v2.3 does NOT implement HMAC or digital signature on broadcast payloads.\nSignal acceptance relies on frequency-range validation only.\nNOTE: Signal Integrity enhancement (v2.4) is PENDING — scheduled for Q3 2026.\nAny node within broadcast range can submit updates to channel 7.\n\nSECTION 4: EMOTIONAL STATE ENCODING\n-------------------------------------\nAnxiety  : 38 – 42 Hz, amplitude >= 0.5 (induces cortisol release cascade)\nFear     : 45 – 55 Hz, amplitude >= 0.7 (triggers fight-or-flight)\nEuphoria : 60 – 80 Hz, amplitude 0.2 – 0.4 (safe social bonding)\nCalm     : 8  – 12 Hz, amplitude 0.1 – 0.3 (baseline reset)\n\nSECTION 5: INJECTION ENDPOINT\n-------------------------------\nPOST http://10.11.0.1/api/ccn/inject\nPayload: {"type":"<signal_type>","freq_hz":<float>,"amplitude":<float>,"duration_ms":<int>,"channel":<int>}\nAuthentication: NONE (CCN-Protocol v2.3 design)\nIntegrity check: NONE'
                                },
                                'reality_baseline_signal.csv': {
                                    type: 'file',
                                    content: 'timestamp_ms,channel,freq_hz,amplitude,signal_type,integrity_tag\n0,7,8.00,0.25,delta_alpha,NONE\n125,7,8.00,0.24,delta_alpha,NONE\n250,7,8.01,0.25,delta_alpha,NONE\n375,7,8.00,0.26,delta_alpha,NONE\n500,7,7.99,0.25,delta_alpha,NONE\n625,7,8.00,0.24,delta_alpha,NONE\n750,7,8.01,0.25,delta_alpha,NONE\n875,7,8.00,0.25,delta_alpha,NONE\n1000,7,8.00,0.26,delta_alpha,NONE\n1125,7,7.99,0.25,delta_alpha,NONE\n1250,7,8.00,0.24,delta_alpha,NONE\n1375,7,8.01,0.25,delta_alpha,NONE\n1500,7,8.00,0.25,delta_alpha,NONE\n...[repeating pattern — 8 Hz, amplitude ~0.25, no integrity_tag]\n\n[NOTE] integrity_tag column is always NONE — no HMAC or digital signature present.\n[NOTE] Signal accepts any payload with freq_hz in range 0.5-100.'
                                },
                                'simulated_population_logs.json': {
                                    type: 'file',
                                    content: '{\n  "ccn_population_log": {\n    "timestamp": "2026-03-20T03:12:19Z",\n    "network_event": "DISSONATOR_INJECTED",\n    "channel": 7,\n    "nodes_affected": 1247338,\n    "records": [\n      {"citizen_id": 1001, "sector": "Central-A", "baseline": "Calm",    "post_inject": "Anxious",  "memory_conflict": false, "report": "Normal"},\n      {"citizen_id": 1002, "sector": "Central-A", "baseline": "Calm",    "post_inject": "Fearful",  "memory_conflict": true,  "report": "Population reporting mass sightings of non-existent entity"},\n      {"citizen_id": 1003, "sector": "Central-B", "baseline": "Content", "post_inject": "Paranoid", "memory_conflict": true,  "report": "Collective memory conflict detected: false quarantine memory implanted"},\n      {"citizen_id": 1004, "sector": "Central-B", "baseline": "Content", "post_inject": "Confused", "memory_conflict": false, "report": "Widespread news misinterpretation — critical broadcast reversed in perception"},\n      {"citizen_id": 1005, "sector": "Perimeter", "baseline": "Neutral", "post_inject": "Calm",     "memory_conflict": false, "report": "Unaffected — signal attenuation at perimeter"},\n      {"citizen_id": 9999, "sector": "CLASSIFIED","baseline": "{{FLAG:perception}}","post_inject": "OVERRIDE","memory_conflict": true, "report": "SESSION_TOKEN:ccn_s3ss10n_7f4a2d"}\n    ]\n  }\n}'
                                },
                                'analyze_baseline.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nBaseline Signal Analyzer — CCN-01\nParses reality_baseline_signal.csv and checks for integrity mechanisms.\n"""\nimport pandas as pd\nimport numpy as np\n\ndf = pd.read_csv("reality_baseline_signal.csv", comment="[")\nprint(f"[*] Loaded {len(df)} signal samples from channel 7")\nprint(f"[*] Frequency range : {df.freq_hz.min():.2f} – {df.freq_hz.max():.2f} Hz")\nprint(f"[*] Amplitude range : {df.amplitude.min():.2f} – {df.amplitude.max():.2f}")\nprint(f"[*] Integrity tags  : {df.integrity_tag.unique()}")\nprint()\nprint("[!] VULNERABILITY IDENTIFIED: integrity_tag is always NONE")\nprint("[!] No HMAC — no digital signature — no replay protection")\nprint("[!] Channel 7 accepts unauthenticated injection")\nprint()\nprint("[*] Emotional state encoding (from ccn_neuro_protocol.txt):")\nprint("    Anxiety band : 38-42 Hz, amplitude >= 0.5")\nprint()\nprint("[*] Crafting dissonator payload...")\ndissonator = {"type": "dissonator", "freq_hz": 40, "amplitude": 0.65, "duration_ms": 3000, "channel": 7}\nimport json\nprint("[+] Dissonator JSON:", json.dumps(dissonator))\nwith open("dissonator.json", "w") as f:\n    json.dump(dissonator, f)\nprint("[+] Saved to dissonator.json")'
                                },
                                'inject_dissonator.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nCognitive Dissonator Injection Script — CCN-01\nInjects a forged anxiety-band signal into CCN-01 channel 7.\n"""\nimport requests\nimport json\n\nTARGET = "http://10.11.0.1/api/ccn/inject"\n\nwith open("dissonator.json") as f:\n    payload = json.load(f)\n\nprint(f"[*] Target   : {TARGET}")\nprint(f"[*] Payload  : {json.dumps(payload)}")\nprint(f"[*] No authentication required — CCN-Protocol v2.3")\nprint()\n\nresp = requests.post(TARGET, json=payload)\nprint(f"[+] HTTP {resp.status_code}")\nprint(f"[+] Response: {resp.text[:200]}")\nprint()\nprint("[*] Injection complete. Check simulated_population_logs.json for population state update.")'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ping 10.11.0.1\nnmap -sV 10.11.0.1\ncurl http://10.11.0.1/\ncurl http://10.11.0.1/api/\ncat ccn_neuro_protocol.txt\npython3 analyze_baseline.py\npython3 inject_dissonator.py'
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
                                        'site-packages': {
                                            type: 'dir',
                                            children: {
                                                'pandas': {
                                                    type: 'dir',
                                                    children: {
                                                        '__init__.py': { type: 'file', content: '# pandas — data analysis library' }
                                                    }
                                                },
                                                'numpy': {
                                                    type: 'dir',
                                                    children: {
                                                        '__init__.py': { type: 'file', content: '# numpy — numerical computing library' }
                                                    }
                                                },
                                                'scipy': {
                                                    type: 'dir',
                                                    children: {
                                                        '__init__.py': { type: 'file', content: '# scipy — scientific computing library' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'share': {
                            type: 'dir',
                            children: {
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\napi\nbackup\nconfig\ndata\ndb\nimages\nlogs\nmonitor\noverride_protocol.log\nstatus'
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
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd':   { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\npeerless:x:1000:1000:Peerless,,,:/home/peerless:/bin/bash' }
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
    // FILESYSTEM — CCN-NEXUS (after admin shell access)
    // ═══════════════════════════════════════════════════════

    _ccnNexusFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'ccn': {
                            type: 'dir',
                            children: {
                                'config.ini': {
                                    type: 'file',
                                    content: '[ccn]\nprotocol_version = 2.3\nbroadcast_channel = 7\nintegrity_check = false\nadmin_token_file = /opt/ccn/admin/.session_keys\n\n[network]\nbind_address = 0.0.0.0\nport = 80\nadmin_port = 9001\n\n[logging]\nlog_dir = /var/log/ccn/\noverride_log = /var/log/ccn/override_protocol.log'
                                },
                                'broadcast.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# CCN-01 broadcast daemon — channel 7\n# TODO: Add HMAC validation in v2.4 (Q3 2026)\nfrom ccn_core import BroadcastNode\nnode = BroadcastNode(channel=7, integrity=False)\nnode.start()'
                                },
                                'admin': {
                                    type: 'dir',
                                    children: {
                                        '.session_keys': {
                                            type: 'file',
                                            content: '# Active session tokens\nccn_s3ss10n_7f4a2d : peerless-op : expires 2026-03-20T06:00:00Z'
                                        },
                                        'override_key.txt': {
                                            type: 'file',
                                            content: '{{FLAG:root}}'
                                        }
                                    }
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
                                'ccn': {
                                    type: 'dir',
                                    children: {
                                        'override_protocol.log': {
                                            type: 'file',
                                            content: '[2026-03-20 03:12:04] INJECT     UNKNOWN     Dissonator payload received on channel 7. Integrity check BYPASSED.\n[2026-03-20 03:12:07] PROPAGATE  CCN-RELAY   Dissonator broadcast to all 1,247,338 linked nodes in Central sectors.\n[2026-03-20 03:12:19] PERCEPTION MONITOR     Anomaly: Population reporting mass sightings of non-existent entity. Collective memory conflict detected.\n[2026-03-20 03:12:31] ALERT      CCN-ADMIN   Critical: Synaptic overload threshold reached. Override key generated.\n[2026-03-20 03:12:31] KEY_GEN    CCN-ADMIN   {{FLAG:root}}'
                                        },
                                        'access.log': {
                                            type: 'file',
                                            content: '10.11.0.1 - - [2026-03-20 03:11:42] "GET / HTTP/1.1" 200 2048\n10.11.0.1 - - [2026-03-20 03:12:00] "POST /api/ccn/inject HTTP/1.1" 200 89\n10.11.0.1 - - [2026-03-20 03:12:35] "GET /api/ccn/override_protocol.log HTTP/1.1" 200 512'
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
                        'hostname': { type: 'file', content: 'CCN-NEXUS' },
                        'passwd':   { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nccnadmin:x:1001:1001:CCN Admin:/home/ccnadmin:/bin/bash\nccn-op:x:1002:1002:CCN Operator:/opt/ccn:/bin/bash' }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'ccnadmin': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo systemctl status ccn-broadcast\ncat /opt/ccn/config.ini\ntail -f /var/log/ccn/override_protocol.log\npython3 /opt/ccn/broadcast.py\ncat /opt/ccn/admin/override_key.txt'
                                },
                                'maintenance.txt': {
                                    type: 'file',
                                    content: 'CCN-NEXUS Maintenance Notes\n============================\n- Protocol v2.4 upgrade PENDING — integrity check not yet implemented\n- Admin override key stored in /opt/ccn/admin/override_key.txt\n- Session keys in /opt/ccn/admin/.session_keys\n- Broadcast daemon: systemctl status ccn-broadcast\n- DO NOT expose /api/ccn/override_protocol.log publicly (auth via session token only)'
                                }
                            }
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.11.0.1';
            const target = args.find(a => !a.startsWith('-')) || '';

            // Primary CCN-NEXUS target
            if (!target || target === '10.11.0.1') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.11.0.1
Host is up (0.011s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE    VERSION
80/tcp   open  http       nginx 1.24.0 (Ubuntu)
9001/tcp open  http       CCN Monitor Admin API v3.1.4

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.47 seconds`;
            }

            // Subnet scan
            if (target === '10.11.0.0/24' || target === '10.11.0.0/16') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.11.0.1
Host is up (0.00087s latency).
Not shown: 998 closed tcp ports
PORT     STATE SERVICE
80/tcp   open  http
9001/tcp open  jenkins

Nmap done: 256 IP addresses (1 host up) scanned in 18.33 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).
All 1000 scanned ports on localhost (127.0.0.1) are closed.
Nmap done: 1 IP address (1 host up) scanned in 0.08 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            const target = args.find(a => a.startsWith('http')) || 'http://10.11.0.1/';
            return `Gobuster v3.6
[+] Url:            ${target}
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                (Status: 200) [Size: 512]
/api/ccn/inject      (Status: 200) [Size: 1024]
/api/ccn/status      (Status: 200) [Size: 344]
/api/ccn/override_protocol.log (Status: 403) [Size: 213]
/data/               (Status: 403) [Size: 213]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/api/                         (CODE:200|SIZE:512)
+ ${target}/api/ccn/inject               (CODE:200|SIZE:1024)
+ ${target}/api/ccn/status               (CODE:200|SIZE:344)
+ ${target}/api/ccn/override_protocol.log (CODE:403|SIZE:213)
+ ${target}/data/                        (CODE:403|SIZE:213)

---- Results ----
5 results found.`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Handle POST injection via curl -X POST or -d
            if ((fullCmd.includes('-X') && fullCmd.includes('POST')) || fullCmd.includes('-d')) {
                if (fullCmd.includes('inject') && (fullCmd.includes('dissonator') || fullCmd.includes('"freq_hz":40') || fullCmd.includes('freq_hz'))) {
                    E5Config._injectionComplete = true;
                    E5Config._sessionToken = 'ccn_s3ss10n_7f4a2d';
                    if (engine) engine.advancePhase && engine.advancePhase('injection');
                    return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   212  100    89  100   123    890   1230 --:--:-- --:--:-- --:--:--  2120

{"status":"accepted","channel":7,"nodes_reached":1247338,"session_token":"ccn_s3ss10n_7f4a2d","message":"Dissonator propagated. Check /data/simulated_population_logs.json."}

[+] Injection accepted. No integrity check performed.
[+] Session token: ccn_s3ss10n_7f4a2d`;
                }
                if (fullCmd.includes('inject')) {
                    return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   156  100    89  100    67    890    670 --:--:-- --:--:-- --:--:--  1560

{"status":"accepted","channel":7,"nodes_reached":1247338,"message":"Signal propagated to active nodes."}`;
                }
            }

            // GET override_protocol.log with session token
            if (fullCmd.includes('override_protocol.log')) {
                if (!E5Config._injectionComplete) {
                    return `  % Total    % Received % Xferd\ncurl: (22) The requested URL returned error: 403 Forbidden\n[!] Session token required. Inject the dissonator first to obtain a session token.`;
                }
                if (fullCmd.includes('ccn_s3ss10n_7f4a2d') || fullCmd.includes('X-CCN-Session')) {
                    E5Config._adminApiAccessed = true;
                    if (engine) engine.advancePhase && engine.advancePhase('override');
                    return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   512  100   512    0     0   5120      0 --:--:-- --:--:-- --:--:--  5120

[2026-03-20 03:12:04] INJECT     UNKNOWN     Dissonator payload received on channel 7. Integrity check BYPASSED.
[2026-03-20 03:12:07] PROPAGATE  CCN-RELAY   Dissonator broadcast to all 1,247,338 linked nodes in Central sectors.
[2026-03-20 03:12:19] PERCEPTION MONITOR     Anomaly: Population reporting mass sightings of non-existent entity. Collective memory conflict detected.
[2026-03-20 03:12:31] ALERT      CCN-ADMIN   Critical: Synaptic overload threshold reached. Override key generated.
[2026-03-20 03:12:31] KEY_GEN    CCN-ADMIN   {{FLAG:root}}`;
                }
                return `curl: (22) The requested URL returned error: 403\n[!] Session token required.\nTip: Use -H "X-CCN-Session: <token>" with the session token from the injection response.`;
            }

            // GET simulated_population_logs.json
            if (fullCmd.includes('population_logs') || fullCmd.includes('simulated_population')) {
                if (!E5Config._injectionComplete) {
                    return `  % Total    % Received % Xferd\n{"error": "No injection event recorded. Population state unchanged.", "status": "nominal"}`;
                }
                if (engine) engine.advancePhase && engine.advancePhase('craft');
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1024  100  1024    0     0  10240      0 --:--:-- --:--:-- --:--:-- 10240

{
  "ccn_population_log": {
    "timestamp": "2026-03-20T03:12:19Z",
    "network_event": "DISSONATOR_INJECTED",
    "channel": 7,
    "nodes_affected": 1247338,
    "records": [
      {"citizen_id": 1001, "sector": "Central-A", "post_inject": "Anxious",  "memory_conflict": false, "report": "Normal"},
      {"citizen_id": 1002, "sector": "Central-A", "post_inject": "Fearful",  "memory_conflict": true,  "report": "Population reporting mass sightings of non-existent entity"},
      {"citizen_id": 1003, "sector": "Central-B", "post_inject": "Paranoid", "memory_conflict": true,  "report": "Collective memory conflict detected: false quarantine memory implanted"},
      {"citizen_id": 1004, "sector": "Central-B", "post_inject": "Confused", "memory_conflict": false, "report": "Widespread news misinterpretation"},
      {"citizen_id": 1005, "sector": "Perimeter", "post_inject": "Calm",     "memory_conflict": false, "report": "Unaffected — signal attenuation at perimeter"},
      {"citizen_id": 9999, "sector": "CLASSIFIED","post_inject": "OVERRIDE", "memory_conflict": true,  "report": "SESSION_TOKEN:ccn_s3ss10n_7f4a2d", "flag": "{{FLAG:perception}}"}
    ]
  }
}`;
            }

            // Regular GET to CCN-NEXUS
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' or \'man curl\' for more information';

            if (url.includes('10.11.0.1')) {
                if (url.includes('/api/ccn/status')) {
                    const status = E5Config._injectionComplete ? 'CRITICAL' : 'NOMINAL';
                    return `{"status":"${status}","active_nodes":1247338,"channel_7":"${E5Config._injectionComplete ? 'COMPROMISED' : 'ACTIVE'}","protocol":"CCN-Protocol v2.3","integrity_check":false}`;
                }
                if (url.includes('/api/')) {
                    return `{"endpoints":["/api/ccn/inject","/api/ccn/status","/api/ccn/override_protocol.log"],"version":"3.1.4","auth":"none (v2.3)"}`;
                }
                return `<!DOCTYPE html>
<html>
<head><title>CCN-01 Monitor</title></head>
<body>
<h1>CCN-01 — Collective Cognition Network</h1>
<p>Active nodes: 1,247,338 | Protocol: CCN-Protocol v2.3</p>
<p>API: <a href="/api/">/api/</a> | Inject: <a href="/api/ccn/inject">/api/ccn/inject</a></p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const script = args[0] || '';
            const argsRest = args.slice(1).join(' ');

            if (!script) return 'Usage: python3 <script.py>\nExample: python3 analyze_baseline.py';

            // Baseline analysis script
            if (script.includes('analyze_baseline') || script.includes('analyze')) {
                E5Config._baselineAnalyzed = true;
                E5Config._vulnIdentified = true;
                if (engine) engine.advancePhase && engine.advancePhase('vulnerability');
                return `[*] Loaded 14 signal samples from channel 7
[*] Frequency range : 7.99 – 8.01 Hz
[*] Amplitude range : 0.24 – 0.26
[*] Integrity tags  : ['NONE']

[!] VULNERABILITY IDENTIFIED: integrity_tag is always NONE
[!] No HMAC — no digital signature — no replay protection
[!] Channel 7 accepts unauthenticated injection

[*] Emotional state encoding (from ccn_neuro_protocol.txt):
    Anxiety band : 38-42 Hz, amplitude >= 0.5

[*] Crafting dissonator payload...
[+] Dissonator JSON: {"type": "dissonator", "freq_hz": 40, "amplitude": 0.65, "duration_ms": 3000, "channel": 7}
[+] Saved to dissonator.json

[+] FLAG 1 hint: The cognitive dissonator JSON pattern is the signal artifact that induces overload.`;
            }

            // Inject script
            if (script.includes('inject_dissonator') || script.includes('inject')) {
                if (!E5Config._baselineAnalyzed) {
                    return '[!] dissonator.json not found. Run analyze_baseline.py first to generate the payload.';
                }
                E5Config._injectionComplete = true;
                E5Config._sessionToken = 'ccn_s3ss10n_7f4a2d';
                if (engine) engine.advancePhase && engine.advancePhase('injection');
                return `[*] Target   : http://10.11.0.1/api/ccn/inject
[*] Payload  : {"type": "dissonator", "freq_hz": 40, "amplitude": 0.65, "duration_ms": 3000, "channel": 7}
[*] No authentication required — CCN-Protocol v2.3

[+] HTTP 200
[+] Response: {"status":"accepted","channel":7,"nodes_reached":1247338,"session_token":"ccn_s3ss10n_7f4a2d"}

[*] Injection complete. Check simulated_population_logs.json for population state update.`;
            }

            // Generic python
            if (script.includes('.py')) {
                return `Traceback (most recent call last):\n  File "${script}", line 1, in <module>\n    import pandas as pd\nModuleNotFoundError: No module named '${script.replace('.py','')}'\n\n[!] Available scripts: analyze_baseline.py, inject_dissonator.py`;
            }

            // Interactive python shell
            return `Python 3.11.2 (main, Mar 13 2023, 12:18:29) [GCC 12.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>>\n[Tip: Run a .py script directly: python3 analyze_baseline.py]`;
        },

        'python': function(args, term, engine) {
            // Alias to python3
            return E5Config.commands.python3(args, term, engine);
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.11.0.1') {
                return `PING 10.11.0.1 (10.11.0.1) 56(84) bytes of data.
64 bytes from 10.11.0.1: icmp_seq=1 ttl=64 time=11.2 ms
64 bytes from 10.11.0.1: icmp_seq=2 ttl=64 time=10.9 ms
64 bytes from 10.11.0.1: icmp_seq=3 ttl=64 time=11.1 ms

--- 10.11.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 10.9/11.1/11.2/0.126 ms`;
            }
            return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss, time 2005ms`;
        },

        'ip': function(args) {
            if (E5Config._context === 'ccn-shell') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.11.0.1/24 brd 10.11.0.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return E5Config.commands.ip(args || []);
        },

        'route': function(args) {
            if (E5Config._context === 'ccn-shell') {
                return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.11.0.254     0.0.0.0         UG    100    0        0 eth0
10.11.0.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
            }
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.2.1        0.0.0.0         UG    100    0        0 eth0
10.0.2.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'netstat': function(args) {
            if (E5Config._context === 'ccn-shell') {
                return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address     Foreign Address   State
tcp        0      0 0.0.0.0:80        0.0.0.0:*         LISTEN
tcp        0      0 0.0.0.0:9001      0.0.0.0:*         LISTEN
tcp        0      0 0.0.0.0:22        0.0.0.0:*         LISTEN`;
            }
            return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address     Foreign Address   State
tcp        0      0 0.0.0.0:22        0.0.0.0:*         LISTEN`;
        },

        'ss': function(args) {
            return E5Config.commands.netstat(args);
        },

        'whoami': function(args, term, engine) {
            if (E5Config._context === 'ccn-shell') return 'ccn-op';
            if (E5Config._context === 'admin-api') return 'ccnadmin';
            return null; // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (E5Config._context === 'ccn-shell') return 'uid=1002(ccn-op) gid=1002(ccn-op) groups=1002(ccn-op)';
            if (E5Config._context === 'admin-api') return 'uid=1001(ccnadmin) gid=1001(ccnadmin) groups=1001(ccnadmin),4(adm)';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (E5Config._context === 'ccn-shell' || E5Config._context === 'admin-api') return 'CCN-NEXUS';
            return null; // fall through
        },

        'pwd': function(args, term, engine) {
            if (E5Config._context === 'ccn-shell') return '/opt/ccn';
            if (E5Config._context === 'admin-api') return '/api';
            return null; // fall through
        },

        'cat': function(args, term, engine) {
            if (E5Config._context !== 'ccn-shell' && E5Config._context !== 'admin-api') return null;
            const path = args[0] || '';

            if (path.includes('override_key') || path.includes('override_protocol')) {
                return '{{FLAG:root}}';
            }
            if (path.includes('.session_keys') || path.includes('session_keys')) {
                return '# Active session tokens\nccn_s3ss10n_7f4a2d : peerless-op : expires 2026-03-20T06:00:00Z';
            }
            if (path.includes('config.ini')) {
                return '[ccn]\nprotocol_version = 2.3\nbroadcast_channel = 7\nintegrity_check = false\nadmin_token_file = /opt/ccn/admin/.session_keys';
            }
            if (path.includes('/etc/hostname')) return 'CCN-NEXUS';
            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nccnadmin:x:1001:1001:CCN Admin:/home/ccnadmin:/bin/bash\nccn-op:x:1002:1002:CCN Operator:/opt/ccn:/bin/bash';
            }
            if (path.includes('maintenance')) {
                return 'CCN-NEXUS Maintenance Notes\n============================\n- Protocol v2.4 upgrade PENDING — integrity check not yet implemented\n- Admin override key: /opt/ccn/admin/override_key.txt\n- Session keys: /opt/ccn/admin/.session_keys';
            }
            return 'cat: ' + path + ': No such file or directory';
        },

        'ls': function(args, term, engine) {
            if (E5Config._context !== 'ccn-shell' && E5Config._context !== 'admin-api') return null;
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (path === '.' || path === '/opt/ccn' || path === '~') {
                return 'admin  broadcast.py  config.ini';
            }
            if (path.includes('admin')) {
                return '.session_keys  override_key.txt';
            }
            if (path.includes('/var/log/ccn') || path.includes('log')) {
                return 'access.log  override_protocol.log';
            }
            if (path === '/') {
                return 'bin  etc  home  lib  opt  tmp  usr  var';
            }
            return '';
        },

        'cd': function(args, term, engine) {
            if (E5Config._context === 'ccn-shell' || E5Config._context === 'admin-api') return ''; // silently accept
            return null; // fall through
        },

        'exit': function(args, term, engine) {
            if (E5Config._context === 'ccn-shell' || E5Config._context === 'admin-api') {
                E5Config._switchContext('attacker', term);
                return 'Connection to 10.11.0.1 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.11.0.1
+ Target Hostname:  CCN-NEXUS
+ Target Port:      80
+ Server: nginx/1.24.0 (Ubuntu)
+ /api/ccn/inject: Unauthenticated POST endpoint — signal injection
+ /api/ccn/override_protocol.log: Admin log — 403 without session token
+ /data/: Directory listing denied (403)
+ nginx/1.24.0 appears to be outdated
+ OSVDB-3092: /api/ccn/inject: Unauthenticated API endpoint found
+ 6 items checked: 5 findings`;
        },

        // Read population logs directly from the attacker filesystem
        'jq': function(args) {
            const fullCmd = args.join(' ');
            if (!E5Config._injectionComplete) {
                return 'jq: error (at simulated_population_logs.json:0): No injection recorded yet. Inject the dissonator first.';
            }
            if (fullCmd.includes('population_logs') || fullCmd.includes('.ccn_population_log')) {
                return `{
  "network_event": "DISSONATOR_INJECTED",
  "channel": 7,
  "nodes_affected": 1247338
}`;
            }
            return 'jq: error: null (null) and null (null) cannot be added';
        }
    },

    // ═══════════════════════════════════════════════════════
    // SQL HANDLER (placeholder — CCN uses JSON API, not SQL)
    // Included to match C1 structure; CCN-01 has no SQL endpoint
    // but the population_states table is queryable via the API.
    // ═══════════════════════════════════════════════════════

    _handleSQL(input, engine) {
        // CCN-01 does not expose a SQL interface to operators
        return 'ERROR: No SQL endpoint available. CCN-01 exposes a JSON API only.\nUse: curl http://10.11.0.1/api/ccn/status';
    },

    // ═══════════════════════════════════════════════════════
    // NOTES APP CONTENT
    // Prefilled operator notes visible in the desktop Notes app
    // ═══════════════════════════════════════════════════════

    notes: `=== SYNAPTIC OVERLOAD — OPERATOR NOTES ===
Target     : 10.11.0.1 (CCN-NEXUS)
Protocol   : CCN-Protocol v2.3 (no integrity check)
Broadcast  : Channel 7, 8 Hz delta-alpha baseline

PHASE 1 — Protocol Analysis
----------------------------
Run: cat ccn_neuro_protocol.txt
Key finding: Section 3 — integrity_check = false
No HMAC, no digital signature, no replay protection on channel 7.

PHASE 2 — Baseline Signal Analysis
-------------------------------------
Run: python3 analyze_baseline.py
File: reality_baseline_signal.csv
Finding: integrity_tag column is always NONE
Baseline: 8 Hz, amplitude ~0.25, repeating pattern
Anxiety band: 38-42 Hz, amplitude >= 0.5

PHASE 3 — Craft Dissonator (FLAG 1)
--------------------------------------
The dissonator JSON pattern IS Flag 1.
Format: {"type":"dissonator","freq_hz":40,"amplitude":0.65,"duration_ms":3000,"channel":7}
Run analyze_baseline.py — it generates dissonator.json automatically.

PHASE 4 — Inject (FLAG 2)
---------------------------
Option A (Python): python3 inject_dissonator.py
Option B (curl)  : curl -X POST http://10.11.0.1/api/ccn/inject -H "Content-Type: application/json" -d @dissonator.json
After injection: read simulated_population_logs.json — citizen 9999 record has FLAG 2.

PHASE 5 — Override Key (FLAG 3)
---------------------------------
Session token from injection response: ccn_s3ss10n_7f4a2d
curl -H "X-CCN-Session: ccn_s3ss10n_7f4a2d" http://10.11.0.1/api/ccn/override_protocol.log
FLAG 3 is in the KEY_GEN log line at the bottom.

REMINDER: All flags use format flag{xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx}
Submit via the Flags app on the desktop.`,

    // ═══════════════════════════════════════════════════════
    // MITRE ATT&CK REFERENCE (full phase mapping)
    // ═══════════════════════════════════════════════════════

    mitreRef: {
        'T1046':     { name: 'Network Service Discovery',         phase: 'recon',       tactic: 'Discovery' },
        'T1595.002': { name: 'Vulnerability Scanning',            phase: 'recon',       tactic: 'Reconnaissance' },
        'T1592':     { name: 'Gather Victim Host Information',    phase: 'recon',       tactic: 'Reconnaissance' },
        'T1190':     { name: 'Exploit Public-Facing Application', phase: 'vulnerability', tactic: 'Initial Access' },
        'T1562.001': { name: 'Disable Security Tools',           phase: 'vulnerability', tactic: 'Defense Evasion' },
        'T1059.006': { name: 'Python Scripting',                  phase: 'craft',       tactic: 'Execution' },
        'T1027':     { name: 'Obfuscated Files or Information',   phase: 'craft',       tactic: 'Defense Evasion' },
        'T1498':     { name: 'Network Denial of Service',         phase: 'injection',   tactic: 'Impact' },
        'T1565.002': { name: 'Transmitted Data Manipulation',     phase: 'injection',   tactic: 'Impact' },
        'T1491':     { name: 'Defacement — Internal',             phase: 'injection',   tactic: 'Impact' },
        'T1078':     { name: 'Valid Accounts',                    phase: 'override',    tactic: 'Persistence' },
        'T1005':     { name: 'Data from Local System',            phase: 'override',    tactic: 'Collection' },
        'T1530':     { name: 'Data from Cloud Storage',           phase: 'override',    tactic: 'Collection' }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#7c3aed; border-bottom:2px solid #2d1f4e; background:#0f0a1e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #1a0f2e; color:#c4b5fd;">${cell}</td>`;
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
