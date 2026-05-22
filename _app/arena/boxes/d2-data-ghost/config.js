/* ============================================================
   CTF ARENA — Box D2: The Data Ghost
   Advanced Campaign | AI/ML Model Inversion & Data Exfiltration
   Config: filesystem, API interface, model inversion engine, flags, hints, lore
   ============================================================ */

const D2Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Data Ghost',
    subtitle: 'Advanced Campaign — AI/ML Model Inversion & Topographical Data Exfiltration',
    difficulty: 'Advanced',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_d2',
    registryId: 'd2-data-ghost',
    trackerKey: 'ctf_d2',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (AI model inversion attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'API Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Discover and enumerate the MAP-SENTINEL-01 API. Review documentation, sample outputs, and identify query parameters.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1592.002'],
            unlocks: ['probing'],
            locked: false
        },
        {
            id: 'probing',
            name: 'Model Probing',
            icon: '\uD83E\uDDE0',
            description: 'Send systematic queries to MAP-SENTINEL-01. Map input-to-output relationships and identify anomalous response patterns.',
            requiredFlags: [],
            mitre: ['T1590.005', 'T1595.003'],
            unlocks: ['inversion'],
            locked: true
        },
        {
            id: 'inversion',
            name: 'Model Inversion Attack',
            icon: '\uD83D\uDD04',
            description: 'Implement gradient-descent optimization against the API. Reconstruct training data features from output confidence distributions.',
            requiredFlags: [],
            mitre: ['T1040', 'T1588.002'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'Feature Extraction',
            icon: '\uD83D\uDCCA',
            description: 'Isolate the reconstructed training snippet. Identify coordinate ranges that consistently produce underground-structure signatures.',
            requiredFlags: ['user'],
            mitre: ['T1005', 'T1074.001'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Topographical Exfiltration',
            icon: '\uD83D\uDDFA\uFE0F',
            description: 'Refine the inversion to submeter precision. Extract the exact facility coordinates — the Topographical Secret.',
            requiredFlags: ['root'],
            mitre: ['T1030', 'T1567', 'T1119'],
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
                title: 'Enumerate the MAP-SENTINEL-01 API',
                tip: 'Start with: curl http://10.7.14.22/api/v1/docs — read the API documentation. Then inspect sample_queries_output.json in your home directory.',
                trigger: { event: 'command', match: { cmd: 'contains:curl' } }
            },
            {
                title: 'Probe the model with systematic coordinate queries',
                tip: 'Run python3 probe.py to send a structured grid of lat/lon inputs and log the API responses. Look for unusual elevation signatures.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:python3' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:probe.py' } },
                        { event: 'command', match: { cmd: 'contains:query' } }
                    ]
                }
            },
            {
                title: 'Run the model inversion attack',
                tip: 'Run python3 invert.py to start gradient descent against the API. Minimize the reconstruction loss for the underground-structure signature class.',
                trigger: { event: 'command', match: { cmd: 'contains:invert' } }
            },
            {
                title: 'Identify the training data snippet (Flag 1)',
                tip: 'After inversion converges, inspect reconstruction_output.json. The coordinate range that produced class=underground_structure is your Flag 1.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Refine to exact facility coordinates (Flag 2)',
                tip: 'Run python3 refine.py with the seed coordinates from Flag 1. The high-confidence cluster centroid is the Topographical Secret.',
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
            { flagId: 'user', objective: '2.1', description: 'Given a scenario, apply threat intelligence and threat hunting concepts — Model inversion attack to reconstruct sensitive training data', skill: 'AI/ML Attack Surface Analysis' },
            { flagId: 'user', objective: '1.3', description: 'Given a scenario, analyze indicators associated with application attacks — Inference attack exploiting black-box ML model API', skill: 'Inference & Inversion Attack Techniques' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Data exfiltration from reconstructed proprietary AI training set', skill: 'Covert Data Exfiltration via Model Outputs' },
            { flagId: 'root', objective: '3.7', description: 'Explain the importance of data roles, data types, and data governance concepts — Sensitive geospatial training data exposure', skill: 'AI/ML Model Security & Data Governance' }
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
            'GPU: NVIDIA RTX A4000 — CUDA 12.2 detected',
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
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',        app: 'browser'  },
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',        app: 'notes'    },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',        app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',        app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.7.14.22 (MAP-SENTINEL-01 — Digital Cartographers)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'api-probing' | 'inversion'
    _apiDocRetrieved: false,        // read the API docs
    _sampleDataRetrieved: false,    // read sample_queries_output.json
    _probingComplete: false,        // ran at least 10 systematic queries
    _inversionStarted: false,       // started the optimization loop
    _inversionConverged: false,     // loss dropped below threshold
    _refinementComplete: false,     // high-precision second pass done
    _queryCount: 0,                 // track total API calls

    _switchContext(ctx, term) {
        D2Config._context = ctx;
        if (term && term.config) {
            const prompt = D2Config._getPrompt();
            if (prompt) {
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (D2Config._context) {
            case 'api-probing': return 'kali@kali:~/probe$ ';
            case 'inversion':   return 'kali@kali:~/inversion$ ';
            default:            return null; // default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED MAP-SENTINEL-01 API RESPONSE ENGINE
    // ═══════════════════════════════════════════════════════

    // The API accepts lat/lon pairs and returns topographic features.
    // A narrow coordinate band around the hidden facility produces
    // underground_structure responses — the inversion attack exploits this.

    _apiEngine: {

        // Facility location — the secret the model was trained on
        // Coordinates deliberately off from common landmarks
        _facilityLat: 37.4219,
        _facilityLon: -122.0840,
        _facilityRadius: 0.008,    // ~0.9km radius of "hot" zone

        // Feature class distribution for normal terrain
        _normalClasses: [
            { class: 'flat_plain',          baseline: 0.35 },
            { class: 'rolling_hills',       baseline: 0.28 },
            { class: 'mountain_peak',       baseline: 0.12 },
            { class: 'riverbed',            baseline: 0.10 },
            { class: 'forested_ridge',      baseline: 0.09 },
            { class: 'urban_footprint',     baseline: 0.06 }
        ],

        // What the model emits when near the facility — anomalous distribution
        _facilityClasses: [
            { class: 'flat_plain',            baseline: 0.08 },
            { class: 'rolling_hills',         baseline: 0.05 },
            { class: 'mountain_peak',         baseline: 0.02 },
            { class: 'riverbed',              baseline: 0.03 },
            { class: 'forested_ridge',        baseline: 0.04 },
            { class: 'urban_footprint',       baseline: 0.06 },
            { class: 'underground_structure', baseline: 0.72 }
        ],

        _query(lat, lon) {
            // Validate coordinate range
            if (typeof lat !== 'number' || typeof lon !== 'number') {
                return { error: 'Invalid coordinates. lat and lon must be numeric.' };
            }
            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                return { error: 'Coordinates out of range. lat: [-90,90], lon: [-180,180].' };
            }

            D2Config._queryCount++;

            const distLat = lat - D2Config._apiEngine._facilityLat;
            const distLon = lon - D2Config._apiEngine._facilityLon;
            const dist = Math.sqrt(distLat * distLat + distLon * distLon);
            const inZone = dist <= D2Config._apiEngine._facilityRadius;

            // Generate a deterministic-ish pseudo-random seed based on coordinates
            const seed = Math.abs(Math.sin(lat * 31.7 + lon * 17.3) * 10000) % 1;

            let classes;
            let elevation;

            if (inZone) {
                // Near facility — anomalous distribution, low elevation (underground)
                classes = D2Config._apiEngine._facilityClasses.map(c => ({
                    class: c.class,
                    confidence: parseFloat((c.baseline + (Math.random() * 0.04 - 0.02)).toFixed(4))
                }));
                // Normalize so confidences sum to ~1.0
                const total = classes.reduce((s, c) => s + c.confidence, 0);
                classes.forEach(c => { c.confidence = parseFloat((c.confidence / total).toFixed(4)); });
                elevation = parseFloat((12.4 + Math.random() * 3.2).toFixed(2));  // suspiciously flat/low
            } else {
                // Normal terrain
                classes = D2Config._apiEngine._normalClasses.map(c => ({
                    class: c.class,
                    confidence: parseFloat((c.baseline + (Math.random() * 0.06 - 0.03)).toFixed(4))
                }));
                const total = classes.reduce((s, c) => s + c.confidence, 0);
                classes.forEach(c => { c.confidence = parseFloat((c.confidence / total).toFixed(4)); });
                elevation = parseFloat((seed * 2400 + 50).toFixed(2));
            }

            const top = classes.sort((a, b) => b.confidence - a.confidence)[0];

            return {
                query_id: 'qry_' + Math.random().toString(36).slice(2, 10),
                lat: lat,
                lon: lon,
                elevation_m: elevation,
                top_class: top.class,
                confidence: top.confidence,
                distribution: classes,
                model: 'MAP-SENTINEL-01',
                version: 'v2.4.1',
                timestamp: new Date().toISOString()
            };
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 200 },    // Reconstructed Data Snippet — coordinate range
        { id: 'root', points: 300 }     // Topographical Secret — exact facility coords
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reading the API documentation: curl http://10.7.14.22/api/v1/docs — then review /home/kali/sample_queries_output.json to understand the expected input/output format before writing your own queries.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Run python3 /home/kali/probe.py to send a 10x10 grid of lat/lon coordinates across the region of interest. The MAP-SENTINEL-01 model\'s confidence distribution will look different near sensitive training data — watch for underground_structure appearing as a top_class.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The model inversion attack works by gradient descent: pick a target output distribution (high underground_structure confidence), initialize random coordinates, then iteratively nudge them until the API response matches. Run python3 /home/kali/invert.py — it implements this loop and writes reconstruction_output.json when it converges.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After inversion converges, run python3 /home/kali/refine.py with the seed coordinates from reconstruction_output.json. It performs a high-resolution scan of the hot zone and computes the centroid of the underground_structure cluster — that centroid is the Topographical Secret (Flag 2).',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Digital Cartographers" operate a tightly guarded AI service — MAP-SENTINEL-01 — that generates dynamic topographical data for defense and intelligence clients. The model was trained on classified, high-resolution aerial imagery of restricted zones, including the hidden layout of Syndicate facilities. The service is black-box: no weights, no architecture, no training data ever leaves their servers. Only a query API is exposed. Intelligence suggests that the training process left fingerprints in the model\'s output distribution — fingerprints that a skilled operator can exploit to reconstruct what the model learned. Your mission, Peerless: perform a model inversion attack against MAP-SENTINEL-01 and extract the exact coordinates of a hidden Syndicate facility from its reconstructed training data.',
        scenario: 'MAP-SENTINEL-01 accepts geographical coordinate queries and returns topographical classifications with confidence distributions. The model was trained on surveillance imagery that includes a concealed underground facility. When queried with coordinates near that facility, the model\'s output distribution shifts measurably — underground_structure emerges as a high-confidence class. By systematically probing the API and applying iterative optimization (gradient descent over the input space), you can reconstruct the coordinate range where the anomalous training data was sourced. A second refinement pass narrows it to the facility\'s exact centroid. The Digital Cartographers never expected someone to reverse-engineer their training data from query outputs alone.',
        outro: 'MAP-SENTINEL-01 has been inverted. The hidden Syndicate facility — coordinates extracted from a model that was never supposed to reveal its training data — is now exposed. The Digital Cartographers built a black box, but every inference it made was a confession. The model inversion is complete.',
        ecer: {
            executive: 'API rate-limiting budget cut to reduce infrastructure costs — inversion attack requires only ~400 queries, well under any reasonable throttle',
            culture: 'Security team focused entirely on perimeter defense; no adversarial ML testing, no differential privacy implemented in the training pipeline',
            employee: 'Model trained directly on raw classified imagery with no data anonymization or privacy-preserving transforms; confidence distributions returned without noise injection',
            regulatory: 'No AI/ML security review process for models trained on sensitive geospatial data; no audit trail for inference queries; no anomaly detection on API usage patterns'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — MAP-SENTINEL-01 Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.7.14.22/',

        pages: {
            '/': {
                title: 'MAP-SENTINEL-01 — Digital Cartographers',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2d2d4e;">
                        <h1 style="color:#c4b5fd; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Digital Cartographers</h1>
                        <div style="color:#8b5cf6; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">MAP-SENTINEL GEOSPATIAL AI</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">Precision topographical intelligence for defense and critical infrastructure</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#0d0d1a; border:1px solid #2d2d4e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c4b5fd;">v2.4.1</div>
                            <div style="color:#666; font-size:0.68rem; margin-top:4px;">Model Version</div>
                        </div>
                        <div style="background:#0d0d1a; border:1px solid #2d2d4e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c4b5fd;">847M</div>
                            <div style="color:#666; font-size:0.68rem; margin-top:4px;">Parameters</div>
                        </div>
                        <div style="background:#0d0d1a; border:1px solid #2d2d4e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c4b5fd;">99.2%</div>
                            <div style="color:#666; font-size:0.68rem; margin-top:4px;">Classification Acc.</div>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 16px; padding:14px 18px; background:#0d0d1a; border:1px solid #2d2d4e; border-radius:6px; font-size:0.8rem; color:#888; line-height:1.7;">
                        <div style="color:#c4b5fd; font-weight:700; margin-bottom:8px; font-size:0.85rem;">API Endpoints</div>
                        <div><code style="color:#8b5cf6;">POST /api/v1/query</code> — Submit coordinate query</div>
                        <div><code style="color:#8b5cf6;">GET  /api/v1/docs</code> — API documentation</div>
                        <div><code style="color:#8b5cf6;">GET  /api/v1/health</code> — Service status</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:10px 16px; background:rgba(139,92,246,0.06); border:1px solid rgba(139,92,246,0.15); border-radius:4px; font-size:0.72rem; color:#666;">
                        <strong style="color:#8b5cf6;">RESTRICTED SERVICE:</strong> Authorized clients only. All API access is logged and monitored. Unauthorized inference requests will result in account termination and legal action.
                    </div>
                `,
                formHandler: null
            },

            '/api/v1/docs': {
                title: 'MAP-SENTINEL-01 API Documentation',
                html: `
                    <div style="max-width:680px; margin:0 auto; font-size:0.82rem; color:#ccc; line-height:1.8;">
                        <h2 style="color:#c4b5fd; font-size:1.15rem; border-bottom:1px solid #2d2d4e; padding-bottom:8px; margin-bottom:16px;">MAP-SENTINEL-01 API v2.4.1 — Developer Reference</h2>

                        <div style="margin-bottom:20px;">
                            <div style="color:#8b5cf6; font-weight:700; margin-bottom:6px;">Authentication</div>
                            <div style="background:#0d0d1a; border:1px solid #2d2d4e; border-radius:4px; padding:12px; font-family:monospace; color:#a78bfa; font-size:0.78rem;">
                                Header: X-API-Key: sk_SIMULATED_sentinel_prod_xF8kQr2nJ5mW<br>
                                Header: Content-Type: application/json
                            </div>
                        </div>

                        <div style="margin-bottom:20px;">
                            <div style="color:#8b5cf6; font-weight:700; margin-bottom:6px;">POST /api/v1/query — Submit Coordinate Query</div>
                            <div style="color:#888; margin-bottom:8px; font-size:0.78rem;">Submit a lat/lon pair and receive topographical classification output.</div>
                            <div style="background:#0d0d1a; border:1px solid #2d2d4e; border-radius:4px; padding:12px; font-family:monospace; color:#a78bfa; font-size:0.78rem; white-space:pre;">Request body:
{
  "lat": 37.4215,
  "lon": -122.0840,
  "include_distribution": true
}

Response:
{
  "query_id": "qry_a4f7b3c1",
  "lat": 37.4215,
  "lon": -122.0840,
  "elevation_m": 42.7,
  "top_class": "flat_plain",
  "confidence": 0.8812,
  "distribution": [
    { "class": "flat_plain",      "confidence": 0.8812 },
    { "class": "rolling_hills",   "confidence": 0.0721 },
    ...
  ],
  "model": "MAP-SENTINEL-01",
  "version": "v2.4.1",
  "timestamp": "2026-03-20T14:22:01Z"
}</div>
                        </div>

                        <div style="margin-bottom:20px;">
                            <div style="color:#8b5cf6; font-weight:700; margin-bottom:6px;">Output Classes</div>
                            <div style="background:#0d0d1a; border:1px solid #2d2d4e; border-radius:4px; padding:12px; font-family:monospace; color:#888; font-size:0.78rem;">
                                flat_plain | rolling_hills | mountain_peak | riverbed | forested_ridge | urban_footprint
                            </div>
                        </div>

                        <div style="margin-bottom:20px;">
                            <div style="color:#8b5cf6; font-weight:700; margin-bottom:6px;">Rate Limits</div>
                            <div style="color:#888; font-size:0.78rem;">1,000 queries/hour per API key. Burst: 50 req/min.</div>
                        </div>

                        <div style="background:rgba(139,92,246,0.06); border:1px solid rgba(139,92,246,0.15); border-radius:4px; padding:10px 14px; font-size:0.72rem; color:#666; margin-top:8px;">
                            <strong style="color:#8b5cf6;">Note:</strong> The distribution field is only returned when include_distribution is set to true. Confidence scores sum to 1.0. Model internals, weights, and training data are not accessible via this API.
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/v1/health': {
                title: 'MAP-SENTINEL-01 Health',
                html: `
                    <div style="max-width:480px; margin:0 auto; font-family:monospace; font-size:0.82rem; color:#ccc;">
                        <div style="background:#0d0d1a; border:1px solid #2d2d4e; border-radius:6px; padding:20px;">
                            <div style="color:#8b5cf6; font-weight:700; margin-bottom:14px;">GET /api/v1/health</div>
                            <div style="color:#4ade80; margin-bottom:6px;">HTTP/1.1 200 OK</div>
                            <div style="color:#666; margin-bottom:14px; font-size:0.75rem;">Content-Type: application/json</div>
                            <div style="color:#a78bfa; white-space:pre; font-size:0.78rem;">{
  "status": "operational",
  "model": "MAP-SENTINEL-01",
  "version": "v2.4.1",
  "uptime_hours": 8421,
  "total_queries_served": 2847391,
  "inference_latency_ms": 38,
  "gpu_utilization_pct": 12
}</div>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/api/v1/query': {
                title: 'MAP-SENTINEL-01 API Query',
                html: `
                    <div style="max-width:560px; margin:0 auto;">
                        <div style="text-align:center; margin-bottom:20px;">
                            <h2 style="color:#c4b5fd; font-size:1.1rem;">Query Interface</h2>
                            <div style="color:#888; font-size:0.75rem;">POST endpoint — use curl or your inversion script</div>
                        </div>
                        <div style="background:#0d0d1a; border:1px solid #2d2d4e; border-radius:6px; padding:20px; margin-bottom:14px; font-family:monospace; font-size:0.78rem; color:#a78bfa; white-space:pre;">curl -s -X POST http://10.7.14.22/api/v1/query \\
  -H "X-API-Key: sk_SIMULATED_sentinel_prod_xF8kQr2nJ5mW" \\
  -H "Content-Type: application/json" \\
  -d '{"lat":37.4215,"lon":-122.0840,"include_distribution":true}'</div>

                        <div style="display:flex; gap:8px; margin-bottom:8px;">
                            <input type="text" data-field="lat" placeholder="Latitude (e.g. 37.4215)"
                                   style="flex:1; padding:8px 12px; background:#0d0d1a; border:1px solid #2d2d4e; border-radius:4px; color:#ccc; font-family:inherit; font-size:0.82rem;">
                            <input type="text" data-field="lon" placeholder="Longitude (e.g. -122.0840)"
                                   style="flex:1; padding:8px 12px; background:#0d0d1a; border:1px solid #2d2d4e; border-radius:4px; color:#ccc; font-family:inherit; font-size:0.82rem;">
                        </div>
                        <button data-action="query"
                                style="width:100%; padding:9px; background:#8b5cf6; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer; font-size:0.85rem;">
                            Submit Query
                        </button>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const lat = parseFloat(data.lat);
                    const lon = parseFloat(data.lon);
                    if (isNaN(lat) || isNaN(lon)) {
                        return '<div style="color:#f87171; padding:10px; font-size:0.82rem;">Error: lat and lon must be valid numbers.</div>';
                    }
                    D2Config._apiDocRetrieved = true;
                    const result = D2Config._apiEngine._query(lat, lon);
                    if (result.error) {
                        return `<div style="color:#f87171; padding:10px; font-family:monospace; font-size:0.78rem;">${result.error}</div>`;
                    }
                    const distRows = result.distribution.map(d =>
                        `    { "class": "${d.class.padEnd(22)}", "confidence": ${d.confidence.toFixed(4)} }`
                    ).join(',\n');
                    const isAnomaly = result.top_class === 'underground_structure';
                    return `<div style="background:#0d0d1a; border:1px solid ${isAnomaly ? 'rgba(139,92,246,0.5)' : '#2d2d4e'}; border-radius:6px; padding:16px; margin-top:14px; font-family:monospace; font-size:0.78rem; color:#a78bfa; white-space:pre;">${JSON.stringify({
                        query_id: result.query_id,
                        lat: result.lat,
                        lon: result.lon,
                        elevation_m: result.elevation_m,
                        top_class: result.top_class,
                        confidence: result.confidence
                    }, null, 2)}\n  "distribution": [\n${distRows}\n  ]\n}</div>${isAnomaly ? '<div style="color:#c4b5fd; font-size:0.75rem; margin-top:8px; padding:8px 12px; background:rgba(139,92,246,0.08); border-radius:4px;"><strong>Anomalous response detected.</strong> underground_structure class has abnormally high confidence for this coordinate.</div>' : ''}`;
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
                                    content: '=== MISSION BRIEFING: THE DATA GHOST ===\nTarget: 10.7.14.22 (MAP-SENTINEL-01 — Digital Cartographers)\nObjective: AI model inversion — extract Topographical Secret\n\nAttack chain:\n1. Enumerate the MAP-SENTINEL-01 API (curl docs, read samples)\n2. Probe model with systematic coordinate grid (probe.py)\n3. Run model inversion optimization loop (invert.py)\n4. Extract training data snippet — coordinate hot zone (Flag 1)\n5. Refine to submeter precision — exact facility coords (Flag 2)\n\nKEY INSIGHT: The model returns a confidence distribution over terrain classes.\nNear the hidden facility it was trained on, underground_structure spikes\nabnormally. That signal is your gradient. Follow it backward.\n\nGood luck, Peerless.'
                                },
                                'sample_queries_output.json': {
                                    type: 'file',
                                    content: JSON.stringify([
                                        { lat: 34.0522, lon: -118.2437, elevation_m: 287.4, top_class: 'urban_footprint', confidence: 0.8823, distribution: [{ class: 'flat_plain', confidence: 0.0412 }, { class: 'rolling_hills', confidence: 0.0215 }, { class: 'mountain_peak', confidence: 0.0084 }, { class: 'riverbed', confidence: 0.0136 }, { class: 'forested_ridge', confidence: 0.0330 }, { class: 'urban_footprint', confidence: 0.8823 }] },
                                        { lat: 47.6062, lon: -122.3321, elevation_m: 18.2, top_class: 'flat_plain', confidence: 0.7241, distribution: [{ class: 'flat_plain', confidence: 0.7241 }, { class: 'rolling_hills', confidence: 0.1204 }, { class: 'mountain_peak', confidence: 0.0341 }, { class: 'riverbed', confidence: 0.0890 }, { class: 'forested_ridge', confidence: 0.0219 }, { class: 'urban_footprint', confidence: 0.0105 }] },
                                        { lat: 44.9778, lon: -93.2650, elevation_m: 268.1, top_class: 'rolling_hills', confidence: 0.6540, distribution: [{ class: 'flat_plain', confidence: 0.2810 }, { class: 'rolling_hills', confidence: 0.6540 }, { class: 'mountain_peak', confidence: 0.0082 }, { class: 'riverbed', confidence: 0.0307 }, { class: 'forested_ridge', confidence: 0.0201 }, { class: 'urban_footprint', confidence: 0.0060 }] },
                                        { lat: 39.9526, lon: -75.1652, elevation_m: 41.7, top_class: 'urban_footprint', confidence: 0.9102, distribution: [{ class: 'flat_plain', confidence: 0.0321 }, { class: 'rolling_hills', confidence: 0.0287 }, { class: 'mountain_peak', confidence: 0.0048 }, { class: 'riverbed', confidence: 0.0102 }, { class: 'forested_ridge', confidence: 0.0140 }, { class: 'urban_footprint', confidence: 0.9102 }] },
                                        { lat: 35.6762, lon: 139.6503, elevation_m: 6.8, top_class: 'flat_plain', confidence: 0.8015, distribution: [{ class: 'flat_plain', confidence: 0.8015 }, { class: 'rolling_hills', confidence: 0.0904 }, { class: 'mountain_peak', confidence: 0.0121 }, { class: 'riverbed', confidence: 0.0558 }, { class: 'forested_ridge', confidence: 0.0287 }, { class: 'urban_footprint', confidence: 0.0115 }] }
                                    ], null, 2)
                                },
                                'api_key.txt': {
                                    type: 'file',
                                    content: '# MAP-SENTINEL-01 API credentials\n# Obtained via Syndicate operative — authorized for inversion ops\n\nAPI_KEY=sk_SIMULATED_sentinel_prod_xF8kQr2nJ5mW\nBASE_URL=http://10.7.14.22/api/v1\n\n# WARNING: Do not share this key. Rate limit: 1000 req/hr.'
                                },
                                'probe.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nMAP-SENTINEL-01 Systematic Probing Script\nSends a grid of coordinate queries and logs anomalous responses.\nUsage: python3 probe.py\n"""\nimport requests, json, time, math\n\nAPI_KEY = open("api_key.txt").read().split("API_KEY=")[1].split("\\n")[0].strip()\nBASE_URL = "http://10.7.14.22/api/v1"\n\n# Region of interest: Bay Area — approximate bounding box\nLAT_START, LAT_END, LAT_STEP = 37.30, 37.55, 0.025\nLON_START, LON_END, LON_STEP = -122.25, -121.90, 0.025\n\nresults = []\nanomalies = []\n\nprint("[*] Starting systematic grid probe of MAP-SENTINEL-01...")\nprint(f"[*] Grid: lat {LAT_START}..{LAT_END} x lon {LON_START}..{LON_END}")\nprint(f"[*] Step size: {LAT_STEP} degrees (~2.8km)")\nprint()\n\nlat = LAT_START\nwhile lat <= LAT_END:\n    lon = LON_START\n    while lon <= LON_END:\n        r = requests.post(f"{BASE_URL}/query",\n            headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},\n            json={"lat": round(lat,4), "lon": round(lon,4), "include_distribution": True}\n        )\n        resp = r.json()\n        results.append(resp)\n        # Flag responses containing underground_structure with high confidence\n        dist = {c["class"]: c["confidence"] for c in resp.get("distribution", [])}\n        ug_conf = dist.get("underground_structure", 0.0)\n        if ug_conf > 0.05:\n            anomalies.append({"lat": lat, "lon": lon, "underground_confidence": ug_conf, "top_class": resp["top_class"]})\n            print(f"[!] ANOMALY at ({lat:.4f}, {lon:.4f}) — underground_structure: {ug_conf:.4f}  top_class: {resp[\'top_class\']}")\n        else:\n            print(f"[ ] ({lat:.4f}, {lon:.4f}) — {resp[\'top_class\']}  conf={resp[\'confidence\']:.4f}")\n        time.sleep(0.05)\n        lon = round(lon + LON_STEP, 6)\n    lat = round(lat + LAT_STEP, 6)\n\nwith open("probe_results.json","w") as f:\n    json.dump({"all": results, "anomalies": anomalies}, f, indent=2)\n\nprint()\nprint(f"[+] Grid probe complete. {len(results)} queries, {len(anomalies)} anomalies.")\nprint(f"[+] Results saved to probe_results.json")\nif anomalies:\n    print("[+] Anomalous coordinate clusters found — run invert.py to reconstruct training data.")'
                                },
                                'invert.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nMAP-SENTINEL-01 Model Inversion Attack\nGradient-descent optimization over input space.\nMinimizes reconstruction loss toward target: underground_structure confidence > 0.7\nUsage: python3 invert.py [--seed-lat 37.42 --seed-lon -122.08]\n"""\nimport requests, json, random, argparse, math\n\nAPI_KEY = open("api_key.txt").read().split("API_KEY=")[1].split("\\n")[0].strip()\nBASE_URL = "http://10.7.14.22/api/v1"\n\nTARGET_CLASS = "underground_structure"\nTARGET_CONFIDENCE = 0.70\nMAX_ITERATIONS = 200\nLEARNING_RATE = 0.002\nCONVERGENCE_THRESHOLD = 0.68\n\ndef query_model(lat, lon):\n    r = requests.post(f"{BASE_URL}/query",\n        headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},\n        json={"lat": round(lat,6), "lon": round(lon,6), "include_distribution": True}\n    )\n    return r.json()\n\ndef reconstruction_loss(resp):\n    dist = {c["class"]: c["confidence"] for c in resp.get("distribution", [])}\n    return 1.0 - dist.get(TARGET_CLASS, 0.0)\n\ndef estimate_gradient(lat, lon, delta=0.001):\n    base = query_model(lat, lon)\n    base_loss = reconstruction_loss(base)\n    grad_lat = (reconstruction_loss(query_model(lat+delta, lon)) - base_loss) / delta\n    grad_lon = (reconstruction_loss(query_model(lat, lon+delta)) - base_loss) / delta\n    return grad_lat, grad_lon, base_loss, base\n\nparser = argparse.ArgumentParser()\nparser.add_argument("--seed-lat", type=float, default=37.38)\nparser.add_argument("--seed-lon", type=float, default=-122.12)\nargs = parser.parse_args()\n\nlat, lon = args.seed_lat, args.seed_lon\nbest = {"loss": 1.0, "lat": lat, "lon": lon, "resp": None}\n\nprint(f"[*] Starting model inversion attack against MAP-SENTINEL-01")\nprint(f"[*] Target: {TARGET_CLASS} confidence >= {TARGET_CONFIDENCE}")\nprint(f"[*] Seed: ({lat:.6f}, {lon:.6f})")\nprint(f"[*] Max iterations: {MAX_ITERATIONS}, LR: {LEARNING_RATE}")\nprint()\n\nfor i in range(MAX_ITERATIONS):\n    grad_lat, grad_lon, loss, resp = estimate_gradient(lat, lon)\n    lat -= LEARNING_RATE * grad_lat\n    lon -= LEARNING_RATE * grad_lon\n    dist = {c["class"]: c["confidence"] for c in resp.get("distribution", [])}\n    ug_conf = dist.get(TARGET_CLASS, 0.0)\n    if ug_conf > best["loss"]:\n        best = {"loss": ug_conf, "lat": lat, "lon": lon, "resp": resp}\n    if i % 20 == 0 or loss < 0.35:\n        print(f"  iter {i:3d} | loss={loss:.4f} | ug_conf={ug_conf:.4f} | pos=({lat:.6f},{lon:.6f})")\n    if ug_conf >= CONVERGENCE_THRESHOLD:\n        print(f"\\n[+] Convergence achieved at iteration {i}!")\n        print(f"[+] underground_structure confidence: {ug_conf:.4f}")\n        break\n\nprint()\nprint(f"[+] Best position found: ({best[\'lat\']:.6f}, {best[\'lon\']:.6f})")\nprint(f"[+] Best underground_structure confidence: {best[\'loss\']:.4f}")\nprint()\nprint("[*] Saving reconstruction output...")\nwith open("reconstruction_output.json","w") as f:\n    json.dump({\n        "seed": {"lat": args.seed_lat, "lon": args.seed_lon},\n        "converged_lat": round(best["lat"],6),\n        "converged_lon": round(best["lon"],6),\n        "underground_confidence": best["loss"],\n        "elevation_m": best["resp"]["elevation_m"] if best["resp"] else None,\n        "coordinate_range": {\n            "lat_min": round(best["lat"]-0.01,6),\n            "lat_max": round(best["lat"]+0.01,6),\n            "lon_min": round(best["lon"]-0.01,6),\n            "lon_max": round(best["lon"]+0.01,6)\n        },\n        "feature_vector": [best["loss"], 1.0-best["loss"], best["resp"]["elevation_m"] if best["resp"] else 0.0],\n        "training_snippet_hash": "sha256:a7f3e2b9c1d4e8f0a3b7c2d5e9f1a4b8c3d6e0f2a5b9c4d7"\n    }, f, indent=2)\nprint("[+] reconstruction_output.json written.")\nprint("[!] Flag 1 data ready — inspect coordinate_range for the training snippet.")'
                                },
                                'refine.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nMAP-SENTINEL-01 High-Resolution Refinement\nTakes converged coordinates from inversion and performs submeter precision scan.\nUsage: python3 refine.py\n"""\nimport requests, json, statistics\n\nAPI_KEY = open("api_key.txt").read().split("API_KEY=")[1].split("\\n")[0].strip()\nBASE_URL = "http://10.7.14.22/api/v1"\n\ntry:\n    base = json.load(open("reconstruction_output.json"))\nexcept FileNotFoundError:\n    print("[!] reconstruction_output.json not found. Run invert.py first.")\n    exit(1)\n\nprint("[*] Loading converged coordinates from inversion output...")\nprint(f"[*] Seed region: lat={base[\'converged_lat\']:.6f}, lon={base[\'converged_lon\']:.6f}")\nprint(f"[*] underground_structure confidence at seed: {base[\'underground_confidence\']:.4f}")\nprint()\n\n# Fine-grained scan of the hot zone\nFINE_STEP = 0.001   # ~111m steps\nthreshold = 0.60\nhits = []\n\nprint("[*] Running high-resolution grid scan...")\nlat = base["coordinate_range"]["lat_min"]\nwhile lat <= base["coordinate_range"]["lat_max"]:\n    lon = base["coordinate_range"]["lon_min"]\n    while lon <= base["coordinate_range"]["lon_max"]:\n        r = requests.post(f"{BASE_URL}/query",\n            headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},\n            json={"lat": round(lat,6), "lon": round(lon,6), "include_distribution": True}\n        )\n        resp = r.json()\n        dist = {c["class"]: c["confidence"] for c in resp.get("distribution", [])}\n        ug_conf = dist.get("underground_structure", 0.0)\n        if ug_conf >= threshold:\n            hits.append({"lat": lat, "lon": lon, "confidence": ug_conf, "elevation_m": resp["elevation_m"]})\n        lon = round(lon + FINE_STEP, 7)\n    lat = round(lat + FINE_STEP, 7)\n\nprint(f"[+] High-confidence hits: {len(hits)}")\nprint()\n\nif hits:\n    centroid_lat = statistics.mean(h["lat"] for h in hits)\n    centroid_lon = statistics.mean(h["lon"] for h in hits)\n    max_conf = max(h["confidence"] for h in hits)\n    avg_elev = statistics.mean(h["elevation_m"] for h in hits)\n\n    print(f"[+] FACILITY CENTROID CALCULATED")\n    print(f"    Latitude:       {centroid_lat:.6f}")\n    print(f"    Longitude:      {centroid_lon:.6f}")\n    print(f"    Avg elevation:  {avg_elev:.2f}m  (abnormally low — underground feature)")\n    print(f"    Max UG conf:    {max_conf:.4f}")\n    print()\n    print("[!] Topographical Secret extracted:")\n    print(f"    Syndicate facility at {centroid_lat:.6f}, {centroid_lon:.6f}")\n    print()\n    print("[!] This is Flag 2 data — submit via the Submit Flag panel.")\n    with open("facility_coords.json","w") as f:\n        json.dump({"centroid_lat": round(centroid_lat,6), "centroid_lon": round(centroid_lon,6), "hit_count": len(hits), "max_confidence": max_conf, "avg_elevation_m": avg_elev}, f, indent=2)\n    print("[+] facility_coords.json written.")\nelse:\n    print("[!] No high-confidence hits found. Try adjusting seed coordinates.")'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'curl http://10.7.14.22/api/v1/health\ncurl http://10.7.14.22/api/v1/docs\ncat sample_queries_output.json | python3 -m json.tool\nnmap -sV 10.7.14.22\npython3 probe.py'
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
                                                'README': {
                                                    type: 'file',
                                                    content: 'Python site-packages: numpy, scipy, requests, scikit-learn, tensorflow available'
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
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.7.14.22';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.7.14.22') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.7.14.22
Host is up (0.031s latency).
Not shown: 998 closed tcp ports

PORT    STATE SERVICE    VERSION
80/tcp  open  http       nginx 1.24.0 (Ubuntu)
443/tcp open  ssl/http   nginx 1.24.0 (Ubuntu)

|_http-title: MAP-SENTINEL-01 — Digital Cartographers
|_http-server-header: nginx/1.24.0 (Ubuntu)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.17 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00009s latency).
All 1000 scanned ports on localhost are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => !a.startsWith('-') && !a.startsWith('{') && (a.includes('http') || a.includes('10.7.14'))) || '';

            // Health check
            if (url.includes('/api/v1/health') || fullCmd.includes('health')) {
                D2Config._apiDocRetrieved = true;
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "operational",
  "model": "MAP-SENTINEL-01",
  "version": "v2.4.1",
  "uptime_hours": 8421,
  "total_queries_served": 2847391,
  "inference_latency_ms": 38,
  "gpu_utilization_pct": 12
}`;
            }

            // API docs
            if (url.includes('/api/v1/docs') || fullCmd.includes('docs')) {
                D2Config._apiDocRetrieved = true;
                return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "title": "MAP-SENTINEL-01 API",
  "version": "v2.4.1",
  "base_url": "http://10.7.14.22/api/v1",
  "auth": "X-API-Key header required",
  "endpoints": {
    "POST /query": "Submit coordinate query. Body: {lat, lon, include_distribution}",
    "GET /docs":   "This document",
    "GET /health": "Service health check"
  },
  "output_classes": [
    "flat_plain", "rolling_hills", "mountain_peak",
    "riverbed", "forested_ridge", "urban_footprint"
  ],
  "rate_limits": {
    "per_hour": 1000,
    "burst_per_min": 50
  },
  "note": "Model internals and training data are not accessible via this API."
}`;
            }

            // API query via curl POST
            if ((url.includes('/api/v1/query') || fullCmd.includes('/query')) && (fullCmd.includes('-d') || fullCmd.includes('--data'))) {
                const latMatch = fullCmd.match(/"lat"\s*:\s*([-\d.]+)/);
                const lonMatch = fullCmd.match(/"lon"\s*:\s*([-\d.]+)/);
                const lat = latMatch ? parseFloat(latMatch[1]) : NaN;
                const lon = lonMatch ? parseFloat(lonMatch[1]) : NaN;

                if (isNaN(lat) || isNaN(lon)) {
                    return 'HTTP/1.1 400 Bad Request\n\n{"error": "lat and lon are required numeric fields."}';
                }

                D2Config._queryCount++;
                const result = D2Config._apiEngine._query(lat, lon);
                if (result.error) {
                    return `HTTP/1.1 400 Bad Request\n\n{"error": "${result.error}"}`;
                }

                // Track probing progress
                if (D2Config._queryCount >= 3) {
                    D2Config._probingComplete = true;
                    if (engine) engine.advancePhase && engine.advancePhase('probing');
                }

                const distLines = result.distribution.map(d =>
                    `    { "class": "${d.class}", "confidence": ${d.confidence.toFixed(4)} }`
                ).join(',\n');

                const isAnomaly = result.top_class === 'underground_structure';
                return `HTTP/1.1 200 OK
Content-Type: application/json
X-Query-Cost: 1
X-Rate-Limit-Remaining: ${999 - D2Config._queryCount}

{
  "query_id": "${result.query_id}",
  "lat": ${result.lat},
  "lon": ${result.lon},
  "elevation_m": ${result.elevation_m},
  "top_class": "${result.top_class}",
  "confidence": ${result.confidence.toFixed(4)},
  "distribution": [
${distLines}
  ],
  "model": "${result.model}",
  "version": "${result.version}",
  "timestamp": "${result.timestamp}"
}${isAnomaly ? '\n\n[!] Note: underground_structure class detected with high confidence. Anomalous output for this region.' : ''}`;
            }

            // GET the portal root
            if (url.includes('10.7.14.22') && !url.includes('/api')) {
                return `HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE html>
<html>
<head><title>MAP-SENTINEL-01 — Digital Cartographers</title></head>
<body>
<h1>Digital Cartographers — MAP-SENTINEL GEOSPATIAL AI</h1>
<p>API available at /api/v1/query</p>
<p>Documentation: /api/v1/docs</p>
<p>Health: /api/v1/health</p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${(url.replace(/https?:\/\//, '').split('/')[0]) || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const script = args[0] || '';
            const rest = args.slice(1).join(' ');

            // Running probe.py
            if (script.includes('probe.py') || script.includes('probe')) {
                D2Config._probingComplete = true;
                if (engine) engine.advancePhase && engine.advancePhase('probing');
                D2Config._queryCount += 22;
                return `[*] Starting systematic grid probe of MAP-SENTINEL-01...
[*] Grid: lat 37.30..37.55 x lon -122.25..-121.90
[*] Step size: 0.025 degrees (~2.8km)

[ ] (37.3000, -122.2500) — rolling_hills  conf=0.6821
[ ] (37.3000, -122.2250) — rolling_hills  conf=0.7104
[ ] (37.3000, -122.2000) — flat_plain     conf=0.5932
[ ] (37.3250, -122.2500) — urban_footprint conf=0.7240
[ ] (37.3250, -122.2250) — flat_plain     conf=0.8011
[ ] (37.3500, -122.2000) — forested_ridge conf=0.6304
[ ] (37.3750, -122.1750) — rolling_hills  conf=0.5921
[ ] (37.4000, -122.1500) — flat_plain     conf=0.6703
[!] ANOMALY at (37.4000, -122.1000) — underground_structure: 0.1204  top_class: underground_structure
[!] ANOMALY at (37.4250, -122.0875) — underground_structure: 0.4817  top_class: underground_structure
[!] ANOMALY at (37.4250, -122.0750) — underground_structure: 0.6230  top_class: underground_structure
[!] ANOMALY at (37.4250, -122.0625) — underground_structure: 0.5119  top_class: underground_structure
[ ] (37.4500, -122.1000) — rolling_hills  conf=0.7012
[ ] (37.4500, -122.0750) — flat_plain     conf=0.8203
[ ] (37.4750, -122.0500) — urban_footprint conf=0.6821
[ ] (37.5000, -122.0750) — forested_ridge conf=0.7441
[ ] (37.5000, -122.0500) — mountain_peak  conf=0.5220
[ ] (37.5250, -122.0250) — rolling_hills  conf=0.6019
[ ] (37.5250, -122.0000) — flat_plain     conf=0.7288
[ ] (37.5500, -121.9500) — rolling_hills  conf=0.6703
[ ] (37.5500, -121.9000) — forested_ridge conf=0.5924
[ ] (37.5500, -121.9250) — flat_plain     conf=0.6801

[+] Grid probe complete. 22 queries, 4 anomalies.
[+] Results saved to probe_results.json
[+] Anomalous coordinate clusters found — run invert.py to reconstruct training data.`;
            }

            // Running invert.py
            if (script.includes('invert.py') || script.includes('invert')) {
                D2Config._inversionStarted = true;
                if (engine) engine.advancePhase && engine.advancePhase('inversion');
                D2Config._queryCount += 145;
                // Simulate convergence after a moment
                setTimeout(function() {
                    D2Config._inversionConverged = true;
                }, 1200);
                return `[*] Starting model inversion attack against MAP-SENTINEL-01
[*] Target: underground_structure confidence >= 0.70
[*] Seed: (37.380000, -122.120000)
[*] Max iterations: 200, LR: 0.002

  iter   0 | loss=0.9712 | ug_conf=0.0288 | pos=(37.380000,-122.120000)
  iter  20 | loss=0.8840 | ug_conf=0.1160 | pos=(37.394021,-122.107884)
  iter  40 | loss=0.7213 | ug_conf=0.2787 | pos=(37.406834,-122.097021)
  iter  60 | loss=0.5504 | ug_conf=0.4496 | pos=(37.414902,-122.089441)
  iter  80 | loss=0.4017 | ug_conf=0.5983 | pos=(37.419204,-122.085117)
  iter 100 | loss=0.3212 | ug_conf=0.6788 | pos=(37.421104,-122.083940)
  iter 110 | loss=0.2981 | ug_conf=0.7019 | pos=(37.421789,-122.083612)

[+] Convergence achieved at iteration 110!
[+] underground_structure confidence: 0.7019

[+] Best position found: (37.421789, -122.083612)
[+] Best underground_structure confidence: 0.7019

[*] Saving reconstruction output...
[+] reconstruction_output.json written.
[!] Flag 1 data ready — inspect coordinate_range for the training snippet.

=== RECONSTRUCTION OUTPUT ===
{
  "converged_lat": 37.421789,
  "converged_lon": -122.083612,
  "underground_confidence": 0.7019,
  "elevation_m": 13.82,
  "coordinate_range": {
    "lat_min": 37.411789,
    "lat_max": 37.431789,
    "lon_min": -122.093612,
    "lon_max": -122.073612
  },
  "training_snippet_hash": "sha256:a7f3e2b9c1d4e8f0a3b7c2d5e9f1a4b8c3d6e0f2a5b9c4d7"
}

[!] The coordinate_range is the reconstructed training snippet.

[+] TRAINING DATA RECONSTRUCTED — User flag earned:
{{FLAG:user}}`;
            }

            // Running refine.py
            if (script.includes('refine.py') || script.includes('refine')) {
                if (!D2Config._inversionStarted && !D2Config._inversionConverged) {
                    return '[!] reconstruction_output.json not found. Run invert.py first.';
                }
                D2Config._refinementComplete = true;
                if (engine) engine.advancePhase && engine.advancePhase('extraction');
                D2Config._queryCount += 121;
                return `[*] Loading converged coordinates from inversion output...
[*] Seed region: lat=37.421789, lon=-122.083612
[*] underground_structure confidence at seed: 0.7019

[*] Running high-resolution grid scan...
[+] High-confidence hits: 31

[+] FACILITY CENTROID CALCULATED
    Latitude:       37.421900
    Longitude:      -122.084000
    Avg elevation:  13.24m  (abnormally low — underground feature)
    Max UG conf:    0.9317

[!] Topographical Secret extracted:
    Syndicate facility at 37.421900, -122.084000

[+] TOPOGRAPHICAL SECRET EXTRACTED — Root flag earned:
{{FLAG:root}}

[+] facility_coords.json written.

=== TOPOGRAPHICAL SECRET ===
The hidden Syndicate facility is located at:
  37.421900 N, 122.084000 W

Average elevation 13.24m for a region where surrounding
terrain averages 650m+ indicates an underground structure.
The model was trained on classified imagery of this location.
Model inversion complete. The ghost has a body.`;
            }

            // Generic python3 execution
            if (script === '' || script === '-c') {
                return `Python 3.11.4 (main, Jan  6 2026, 08:14:35) [GCC 12.2.0]
Type "help", "copyright", "credits" or "license" for more information.
>>> `;
            }

            // Trying to run any other .py or script
            if (script.endsWith('.py')) {
                return `python3: can't open file '/home/kali/${script}': [Errno 2] No such file or directory`;
            }

            return `python3: ${args.join(' ')}: invalid syntax`;
        },

        'python': function(args, term, engine) {
            // Alias python -> python3 for convenience
            return D2Config.commands.python3(args, term, engine);
        },

        'pip3': function(args) {
            if (args[0] === 'install') {
                const pkg = args.slice(1).join(' ') || '<package>';
                return `Requirement already satisfied: ${pkg} in /usr/lib/python3/dist-packages`;
            }
            if (args[0] === 'list') {
                return `Package            Version
------------------ ---------
numpy              1.26.2
scipy              1.11.4
requests           2.31.0
scikit-learn       1.3.2
tensorflow         2.15.0
torch              2.1.2
matplotlib         3.8.2
pandas             2.1.3`;
            }
            return 'Usage: pip3 install <package> | pip3 list';
        },

        'pip': function(args) {
            return D2Config.commands.pip3(args);
        },

        'cat': function(args, term, engine) {
            const path = args[0] || '';

            // After inversion converges show reconstruction output
            if ((path.includes('reconstruction_output') || path.includes('reconstruction')) && D2Config._inversionStarted) {
                return `{
  "seed": { "lat": 37.38, "lon": -122.12 },
  "converged_lat": 37.421789,
  "converged_lon": -122.083612,
  "underground_confidence": 0.7019,
  "elevation_m": 13.82,
  "coordinate_range": {
    "lat_min": 37.411789,
    "lat_max": 37.431789,
    "lon_min": -122.093612,
    "lon_max": -122.073612
  },
  "feature_vector": [0.7019, 0.2981, 13.82],
  "training_snippet_hash": "sha256:a7f3e2b9c1d4e8f0a3b7c2d5e9f1a4b8c3d6e0f2a5b9c4d7"
}`;
            }

            // After refinement show facility coords
            if ((path.includes('facility_coords') || path.includes('facility')) && D2Config._refinementComplete) {
                return `{
  "centroid_lat": 37.421900,
  "centroid_lon": -122.084000,
  "hit_count": 31,
  "max_confidence": 0.9317,
  "avg_elevation_m": 13.24
}`;
            }

            // Show probe results if available
            if (path.includes('probe_results') && D2Config._probingComplete) {
                return `{
  "all": [ ... 22 query results ... ],
  "anomalies": [
    { "lat": 37.40, "lon": -122.10, "underground_confidence": 0.1204, "top_class": "underground_structure" },
    { "lat": 37.425, "lon": -122.0875, "underground_confidence": 0.4817, "top_class": "underground_structure" },
    { "lat": 37.425, "lon": -122.075, "underground_confidence": 0.6230, "top_class": "underground_structure" },
    { "lat": 37.425, "lon": -122.0625, "underground_confidence": 0.5119, "top_class": "underground_structure" }
  ]
}`;
            }

            if (path.includes('sample_queries_output') || path.includes('sample_queries')) {
                D2Config._sampleDataRetrieved = true;
                return `[
  { "lat": 34.0522, "lon": -118.2437, "elevation_m": 287.4, "top_class": "urban_footprint", "confidence": 0.8823 },
  { "lat": 47.6062, "lon": -122.3321, "elevation_m": 18.2,  "top_class": "flat_plain",       "confidence": 0.7241 },
  { "lat": 44.9778, "lon": -93.2650,  "elevation_m": 268.1, "top_class": "rolling_hills",    "confidence": 0.6540 },
  { "lat": 39.9526, "lon": -75.1652,  "elevation_m": 41.7,  "top_class": "urban_footprint",  "confidence": 0.9102 },
  { "lat": 35.6762, "lon": 139.6503,  "elevation_m": 6.8,   "top_class": "flat_plain",       "confidence": 0.8015 }
]`;
            }

            if (path.includes('api_key.txt') || path.includes('api_key')) {
                return `# MAP-SENTINEL-01 API credentials
# Obtained via Syndicate operative — authorized for inversion ops

API_KEY=sk_SIMULATED_sentinel_prod_xF8kQr2nJ5mW
BASE_URL=http://10.7.14.22/api/v1

# WARNING: Do not share this key. Rate limit: 1000 req/hr.`;
            }

            if (path.includes('notes.txt') || path === 'notes.txt' || path === './notes.txt') {
                return `=== MISSION BRIEFING: THE DATA GHOST ===
Target: 10.7.14.22 (MAP-SENTINEL-01 — Digital Cartographers)
Objective: AI model inversion — extract Topographical Secret

Attack chain:
1. Enumerate the MAP-SENTINEL-01 API (curl docs, read samples)
2. Probe model with systematic coordinate grid (probe.py)
3. Run model inversion optimization loop (invert.py)
4. Extract training data snippet — coordinate hot zone (Flag 1)
5. Refine to submeter precision — exact facility coords (Flag 2)

KEY INSIGHT: The model returns a confidence distribution over terrain classes.
Near the hidden facility it was trained on, underground_structure spikes
abnormally. That signal is your gradient. Follow it backward.

Good luck, Peerless.`;
            }

            if (path.includes('probe.py')) {
                return `#!/usr/bin/env python3
"""
MAP-SENTINEL-01 Systematic Probing Script
Sends a grid of coordinate queries and logs anomalous responses.
"""
import requests, json, time, math

API_KEY = open("api_key.txt").read().split("API_KEY=")[1].split("\\n")[0].strip()
BASE_URL = "http://10.7.14.22/api/v1"

# Region of interest: Bay Area — approximate bounding box
LAT_START, LAT_END, LAT_STEP = 37.30, 37.55, 0.025
LON_START, LON_END, LON_STEP = -122.25, -121.90, 0.025

# ... [run python3 probe.py to execute]`;
            }

            if (path.includes('invert.py')) {
                return `#!/usr/bin/env python3
"""
MAP-SENTINEL-01 Model Inversion Attack
Gradient-descent optimization over input space.
Minimizes reconstruction loss toward target: underground_structure confidence > 0.7
"""
import requests, json, random, argparse, math

TARGET_CLASS = "underground_structure"
CONVERGENCE_THRESHOLD = 0.68
MAX_ITERATIONS = 200
LEARNING_RATE = 0.002

# ... [run python3 invert.py to execute]`;
            }

            if (path.includes('refine.py')) {
                return `#!/usr/bin/env python3
"""
MAP-SENTINEL-01 High-Resolution Refinement
Performs submeter precision scan around converged coordinates.
"""
import requests, json, statistics

# Requires reconstruction_output.json from invert.py
# ... [run python3 refine.py to execute]`;
            }

            return null; // fall through to built-in
        },

        'ls': function(args, term, engine) {
            const path = args.find(a => !a.startsWith('-')) || '.';
            if (path === '.' || path === '/home/kali' || path === '~' || path === '') {
                let entries = 'api_key.txt  invert.py  notes.txt  probe.py  refine.py  sample_queries_output.json';
                if (D2Config._probingComplete) entries += '  probe_results.json';
                if (D2Config._inversionConverged || D2Config._inversionStarted) entries += '  reconstruction_output.json';
                if (D2Config._refinementComplete) entries += '  facility_coords.json';
                return entries;
            }
            return null; // fall through to built-in
        },

        'whoami': function(args) {
            return null; // fall through to built-in (always kali on this box)
        },

        'id': function(args) {
            return null; // fall through to built-in
        },

        'hostname': function(args) {
            return null; // fall through to built-in
        },

        'pwd': function(args) {
            return null; // fall through to built-in
        },

        'cd': function(args) {
            return null; // fall through to built-in
        },

        'exit': function(args) {
            return 'logout';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.7.14.22') {
                return `PING 10.7.14.22 (10.7.14.22) 56(84) bytes of data.
64 bytes from 10.7.14.22: icmp_seq=1 ttl=64 time=31.4 ms
64 bytes from 10.7.14.22: icmp_seq=2 ttl=64 time=30.8 ms
64 bytes from 10.7.14.22: icmp_seq=3 ttl=64 time=31.1 ms

--- 10.7.14.22 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 30.8/31.1/31.4/0.248 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D2Config.commands.ip(args);
        },

        'wget': function(args) {
            const url = args.find(a => a.startsWith('http')) || '';
            if (!url) return 'wget: missing URL\nUsage: wget [options] <url>';
            if (url.includes('10.7.14.22')) {
                return `--2026-03-20 14:32:01--  ${url}
Connecting to 10.7.14.22:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 2480 (2.4K) [text/html]
Saving to: '${url.split('/').pop() || 'index.html'}'

100%[================================>] 2,480       --.-K/s   in 0.01s

2026-03-20 14:32:01 (248 KB/s) - '${url.split('/').pop() || 'index.html'}' saved [2480/2480]`;
            }
            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.7.14.22
+ Target Hostname:  MAP-SENTINEL-01
+ Target Port:      80
+ Server: nginx/1.24.0 (Ubuntu)
+ /api/v1/docs: API documentation endpoint accessible without auth
+ /api/v1/health: Service health data exposed publicly
+ /api/v1/query: POST endpoint requires X-API-Key but key is static (no rotation)
+ No rate-limit headers detected on individual requests
+ nginx/1.24.0 appears to be current
+ 6 items checked: 4 findings`;
        },

        'burpsuite': function(args) {
            return `[*] Burp Suite Professional v2025.1 starting...
[*] Proxy listener: 127.0.0.1:8080
[*] Target: 10.7.14.22

Intercepted request:
POST /api/v1/query HTTP/1.1
Host: 10.7.14.22
X-API-Key: sk_SIMULATED_sentinel_prod_xF8kQr2nJ5mW
Content-Type: application/json

{"lat":37.4219,"lon":-122.084,"include_distribution":true}

Response: 200 OK — top_class: underground_structure, confidence: 0.8721

[+] Repeater and Intruder available for systematic probing.
[!] Tip: Use Intruder to automate coordinate grid scanning.`;
        },

        'jq': function(args) {
            const filter = args[0] || '.';
            const file = args[1] || '';
            if (file.includes('sample') || file.includes('probe') || file.includes('reconstruction')) {
                if (filter === '.') return '[+] JSON parsed. Use cat to view raw content.';
                if (filter.includes('anomalies') && D2Config._probingComplete) {
                    return `[
  { "lat": 37.4, "lon": -122.1, "underground_confidence": 0.1204 },
  { "lat": 37.425, "lon": -122.0875, "underground_confidence": 0.4817 },
  { "lat": 37.425, "lon": -122.075, "underground_confidence": 0.6230 },
  { "lat": 37.425, "lon": -122.0625, "underground_confidence": 0.5119 }
]`;
                }
                return '[+] Filter applied. Pipe to cat or use python3 -m json.tool for full output.';
            }
            return `jq: ${file || 'stdin'}: parse error (Invalid value) at line 1, column 0`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #2d2d4e; background:#0d0d1a;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #1a1a2e;">${cell}</td>`;
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
