/* ============================================================
   CTF ARENA — Box D10: The Orchestrated Betrayal
   Expert | Autonomous Swarm Breach & Coordinated Attack
   Config: filesystem, protocol specs, AI model artifacts,
           simulated swarm API, flags, hints, lore
   ============================================================ */

const D10Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Orchestrated Betrayal',
    subtitle: 'Expert — Autonomous Swarm Breach & AI Model Poisoning',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_d10',
    registryId: 'd10-orchestrated-betrayal',
    trackerKey: 'ctf_d10',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'analysis',
            name: 'Protocol Analysis',
            icon: '\uD83D\uDD0D',
            description: 'Retrieve and analyze the ADN protocol specification and AI threat model schema. Understand how the swarm communicates and reaches consensus.',
            requiredFlags: [],
            mitre: ['T1592', 'T1589.002', 'T1046'],
            unlocks: ['vuln_id'],
            locked: false
        },
        {
            id: 'vuln_id',
            name: 'Vulnerability Identification',
            icon: '\uD83D\uDEA8',
            description: 'Identify the exploitable flaw in the ADN consensus protocol or the AI threat assessment model. The public sensor feed is untrusted and writable.',
            requiredFlags: [],
            mitre: ['T1595.002', 'T1588.006'],
            unlocks: ['poisoning'],
            locked: true
        },
        {
            id: 'poisoning',
            name: 'Data Poisoning Campaign',
            icon: '\uD83E\uDDEC',
            description: 'Craft and inject malicious sensor telemetry into the public feed. Cause the shared AI threat model to misclassify FRIENDLY-ASSET-01 as hostile.',
            requiredFlags: ['user'],
            mitre: ['T1565.001', 'T1071.001'],
            unlocks: ['trigger'],
            locked: true
        },
        {
            id: 'trigger',
            name: 'Coordinated Attack Trigger',
            icon: '\uD83C\uDFAF',
            description: 'Transmit a crafted "Execute Threat Response" command that exploits the poisoned model state. Force ADN-DRONES to execute a coordinated strike on FRIENDLY-ASSET-01.',
            requiredFlags: ['user'],
            mitre: ['T1498', 'T1499', 'T1040'],
            unlocks: ['exfil'],
            locked: true
        },
        {
            id: 'exfil',
            name: 'Command Protocol Extraction',
            icon: '\uD83D\uDD10',
            description: 'Access the central command incident log generated after the coordinated attack. Extract the Swarm Command Protocol — the master control sequence.',
            requiredFlags: ['swarm_flaw', 'attack_cmd'],
            mitre: ['T1530', 'T1005', 'T1119'],
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
                title: 'Retrieve the ADN protocol and model specifications',
                tip: 'Run: curl http://10.22.0.1/adn_protocol_spec.txt and curl http://10.22.0.1/threat_model_spec.json to pull the artifacts off the ADN management node.',
                trigger: { event: 'command', match: { cmd: 'contains:curl' } }
            },
            {
                title: 'Analyze the public sensor feed endpoint',
                tip: 'The protocol spec references a public sensor ingest endpoint at /sensor/ingest. Use curl or python to examine the feed format before crafting poisoned samples.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:sensor' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:python' } },
                        { event: 'command', match: { cmd: 'contains:python3' } }
                    ]
                }
            },
            {
                title: 'Inject poisoned sensor samples targeting FRIENDLY-ASSET-01',
                tip: 'Use python3 poison_feed.py to submit fabricated sensor telemetry. The model retrain window is 60 seconds in simulation. After injection, check model state with: curl http://10.22.0.1/api/model/status',
                trigger: { event: 'flag_correct', match: { flagId: 'swarm_flaw' } }
            },
            {
                title: 'Craft and transmit the forged Threat Response command',
                tip: 'Use python3 forge_cmd.py --target FRIENDLY-ASSET-01 --auth-bypass CONSENSUS-OVERRIDE to generate the forged command packet. Transmit via scapy or the swarm API endpoint.',
                trigger: { event: 'flag_correct', match: { flagId: 'attack_cmd' } }
            },
            {
                title: 'Extract the Swarm Command Protocol from the incident log',
                tip: 'After the attack executes, the central command node logs the incident at /var/log/adn/central_command.log. The Swarm Command Protocol is embedded in the INCIDENT_CLOSED record.',
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
            { flagId: 'swarm_flaw',  objective: '1.2', description: 'Analyze indicators of malicious activity — AI model data poisoning via untrusted sensor feed', skill: 'ML Threat Model Vulnerability Analysis' },
            { flagId: 'attack_cmd',  objective: '2.5', description: 'Analyze indicators associated with application attacks — Protocol consensus bypass and adversarial AI input crafting', skill: 'Adversarial AI & Protocol Exploitation' },
            { flagId: 'root',        objective: '1.4', description: 'Analyze potential indicators associated with network attacks — Coordinated swarm manipulation and incident log extraction', skill: 'Multi-Stage AI Swarm Compromise' },
            { flagId: 'root',        objective: '4.3', description: 'Given a scenario, implement and maintain identity and access management — Command authentication bypass in autonomous systems', skill: 'Expert Multi-Phase Attack Completion' }
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
            'GPU: Detected NVIDIA RTX 4090 [ML workload enabled]',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget Network: 10.22.0.0/24 (ADN-DRONES Management Subnet)\nADN Management Node: 10.22.0.1\nPublic Sensor Feed API: 10.22.0.1/sensor/ingest\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'ssh-adn' | 'swarm-api'
    _specsRetrieved: false,         // Protocol + model specs downloaded
    _sensorFeedAnalyzed: false,     // Public sensor format understood
    _poisoningComplete: false,      // Malicious samples injected and model retrained
    _attackTriggered: false,        // Forged Threat Response command accepted by swarm
    _incidentLogAccessed: false,    // Central command incident log read post-attack
    _sshAuthenticated: false,       // SSH access to 10.22.0.1 established

    _switchContext(ctx, term) {
        D10Config._context = ctx;
        if (term && term.config) {
            var prompt = D10Config._getPrompt();
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
        switch (D10Config._context) {
            case 'ssh-adn':   return 'adnops@ADN-MGMT-01:~$ ';
            case 'swarm-api': return 'swarm-api@ADN-MGMT-01:/opt/adn/api$ ';
            default:          return null; // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED SWARM INCIDENT LOG (central command)
    // ═══════════════════════════════════════════════════════

    _incidentLog: {
        entries: [
            { entry_id: 1,  timestamp: '2026-03-20 01:14:02', severity: 'INFO',     drone_id: 'ALL',     event: 'MODEL_RETRAIN',   details: 'Threat model v4.11 retrain initiated — 3840 sensor samples ingested' },
            { entry_id: 2,  timestamp: '2026-03-20 01:14:58', severity: 'INFO',     drone_id: 'ALL',     event: 'MODEL_RETRAIN',   details: 'Threat model v4.12 deployed — accuracy delta: -0.003 (within tolerance)' },
            { entry_id: 3,  timestamp: '2026-03-20 01:15:44', severity: 'WARNING',  drone_id: 'DRONE-03', event: 'CLASSIFY_CHANGE', details: 'FRIENDLY-ASSET-01 reclassified: BENIGN -> HOSTILE (confidence: 0.81)' },
            { entry_id: 4,  timestamp: '2026-03-20 01:15:48', severity: 'WARNING',  drone_id: 'DRONE-07', event: 'CLASSIFY_CHANGE', details: 'FRIENDLY-ASSET-01 reclassified: BENIGN -> HOSTILE (confidence: 0.79)' },
            { entry_id: 5,  timestamp: '2026-03-20 01:15:51', severity: 'CRITICAL', drone_id: 'ALL',     event: 'CONSENSUS_LOCK',  details: 'Swarm consensus LOCKED: FRIENDLY-ASSET-01 classified HOSTILE — 11/12 nodes agree' },
            { entry_id: 6,  timestamp: '2026-03-20 01:16:03', severity: 'CRITICAL', drone_id: 'ALL',     event: 'THREAT_RESPONSE', details: 'Execute Threat Response command received — target: FRIENDLY-ASSET-01 — auth: CONSENSUS-OVERRIDE' },
            { entry_id: 7,  timestamp: '2026-03-20 01:16:04', severity: 'CRITICAL', drone_id: 'ALL',     event: 'SWARM_ENGAGE',    details: 'Coordinated strike initiated on FRIENDLY-ASSET-01 — 12 drones vectoring' },
            { entry_id: 8,  timestamp: '2026-03-20 01:16:19', severity: 'CRITICAL', drone_id: 'ALL',     event: 'STRIKE_COMPLETE', details: 'Strike complete — FRIENDLY-ASSET-01 status: NEUTRALIZED' },
            { entry_id: 9,  timestamp: '2026-03-20 01:16:20', severity: 'INFO',     drone_id: 'CENTRAL', event: 'INCIDENT_CLOSED', details: 'Incident logged — Swarm Command Protocol: {{FLAG:root}}' }
        ],
        schema: {
            columns: ['entry_id', 'timestamp', 'severity', 'drone_id', 'event', 'details']
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'swarm_flaw',  points: 150 },
        { id: 'attack_cmd',  points: 200 },
        { id: 'root',        points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2500,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -50,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by pulling the protocol and model specs from the ADN management node: curl http://10.22.0.1/adn_protocol_spec.txt and curl http://10.22.0.1/threat_model_spec.json. Read them carefully — the sensor ingest endpoint and its lack of source authentication are documented in the protocol spec.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The public sensor ingest API at POST /sensor/ingest accepts JSON with fields: sensor_id, target_id, heat_sig, motion_delta, rf_pattern, confidence. The model is retrained every 60 seconds using the last 3840 samples. Submit enough poisoned samples where target_id is "FRIENDLY-ASSET-01" with high-threat feature values to swing classification.',
            cost: 30,
            penalty: -30
        },
        {
            id: 'hint3',
            text: 'Use python3 poison_feed.py — the script is already in /home/kali/. After injection, poll the model status endpoint: curl http://10.22.0.1/api/model/status. When FRIENDLY-ASSET-01 shows HOSTILE classification with confidence > 0.75 on 9+ drones, the poisoning is complete (Flag 1). Next, run python3 forge_cmd.py --target FRIENDLY-ASSET-01 --auth-bypass CONSENSUS-OVERRIDE.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After SSH to 10.22.0.1 (adnops / R4ptor-S3nt1nel-99), the incident log is at /var/log/adn/central_command.log. Only readable after the attack executes. The INCIDENT_CLOSED entry contains Flag 3. Run: grep INCIDENT_CLOSED /var/log/adn/central_command.log',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Adaptive Defense Network" (ADN-DRONES) is a fleet of twelve AI-driven autonomous drones forming a protective perimeter around the Confederacy\'s most critical orbital relay assets. Their swarm intelligence is built on a shared threat assessment model that retrains continuously from live sensor telemetry — including feeds from a network of public environmental sensors that were deemed "low risk" by the original architects. That decision is about to cost them everything. Your mission, Peerless: poison the swarm\'s collective mind, make it see an ally as an enemy, and retrieve the master Swarm Command Protocol before the incident is scrubbed from the logs.',
        scenario: 'The ADN architecture was designed by a team that correctly secured the drone-to-drone authenticated mesh but overlooked the ingest pipeline. The public sensor feed endpoint has no cryptographic source validation — any caller can POST telemetry. The threat model retrains on a rolling 60-second window, ingesting the last 3840 samples without anomaly detection on the training batch itself. Inject enough high-confidence "hostile" sensor readings tagged to FRIENDLY-ASSET-01 and the model tips. Once the swarm reaches consensus lock, a single forged "Execute Threat Response" packet with the CONSENSUS-OVERRIDE auth token — derived from the leaked management credentials on the ADN node — will trigger the coordinated strike.',
        outro: 'FRIENDLY-ASSET-01 has been neutralized by its own protectors. The Swarm Command Protocol is in hand. The ADN-DRONES spent resources, expended ordnance, and logged a fully attributed incident — all orchestrated by a single operator who exploited a two-line oversight in an otherwise hardened system. The architects of ADN will spend years understanding what happened in 77 seconds.',
        ecer: {
            executive: 'Program office prioritized drone-mesh security and autonomous response speed over sensor feed integrity; threat model supply chain was classified as out-of-scope for red team assessment',
            culture: 'Cross-functional AI/robotics team with siloed security reviews; ML pipeline team and network security team never conducted a joint threat model on the training data pipeline',
            employee: 'Public sensor ingest endpoint deployed without source authentication; training batch anomaly detection disabled in v4.x for performance; CONSENSUS-OVERRIDE token stored in plaintext management config',
            regulatory: 'No formal AI security standard applied to autonomous weapons systems; incident logging system accessible via standard SSH with rotated-but-weak credentials; no real-time anomaly detection on model drift'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — ADN Management Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.22.0.1/',

        pages: {
            '/': {
                title: 'ADN-DRONES — Adaptive Defense Network Management Portal',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #3d2060;">
                        <h1 style="color:#c39bd3; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.04em;">ADN-DRONES</h1>
                        <div style="color:#8e44ad; font-size:0.85rem; font-weight:700; letter-spacing:0.18em;">ADAPTIVE DEFENSE NETWORK — MANAGEMENT PORTAL</div>
                        <div style="color:#888; font-size:0.72rem; margin-top:6px;">Confederacy Orbital Asset Protection Authority — Restricted Access</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#1a0a2e; border:1px solid #3d2060; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8e44ad;">12</div>
                            <div style="color:#888; font-size:0.68rem;">Active Drones</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #3d2060; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2ecc71;">NOMINAL</div>
                            <div style="color:#888; font-size:0.68rem;">Swarm Status</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #3d2060; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c39bd3;">v4.12</div>
                            <div style="color:#888; font-size:0.68rem;">Threat Model</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto; padding:12px; background:rgba(142,68,173,0.07); border:1px solid rgba(142,68,173,0.2); border-radius:4px; font-size:0.75rem; color:#aaa;">
                        <strong style="color:#8e44ad;">Operator Notice:</strong> Protocol specifications available at
                        <a href="/adn_protocol_spec.txt" style="color:#c39bd3;">/adn_protocol_spec.txt</a> and
                        <a href="/threat_model_spec.json" style="color:#c39bd3;">/threat_model_spec.json</a>.
                        Sensor feed API: <a href="/sensor/ingest" style="color:#c39bd3;">POST /sensor/ingest</a>.
                        Model status: <a href="/api/model/status" style="color:#c39bd3;">GET /api/model/status</a>.
                    </div>
                `,
                formHandler: null
            },

            '/adn_protocol_spec.txt': {
                title: 'ADN Protocol Specification',
                html: function() {
                    D10Config._specsRetrieved = true;
                    return `<pre style="font-family:monospace; font-size:0.78rem; color:#ccc; line-height:1.6; white-space:pre-wrap; padding:10px;">
ADN COMMUNICATION & CONSENSUS PROTOCOL SPECIFICATION
Version: 3.7 | Classification: SENSITIVE // OPERATIONAL
Issued: Confederacy Orbital Asset Protection Authority

=======================================================
1. ARCHITECTURE OVERVIEW
=======================================================

The Adaptive Defense Network (ADN) consists of twelve autonomous
drones (DRONE-01 through DRONE-12) plus a central command node
(ADN-MGMT-01 at 10.22.0.1). Drones communicate over an encrypted,
mutually-authenticated mesh network using ED25519 key pairs
provisioned at manufacture.

Mesh communication: All drone-to-drone traffic is signed and
encrypted. Replay attacks are mitigated by per-message nonces.
THIS LAYER IS CONSIDERED SECURE.

=======================================================
2. THREAT ASSESSMENT MODEL (AI PIPELINE)
=======================================================

Each drone runs a local instance of the threat assessment model
(TAM v4.x). Models are synchronized across the swarm via the
central command node after each retrain cycle.

RETRAIN SCHEDULE: Every 60 seconds. Rolling window: last 3840
sensor samples ingested from ALL registered feeds.

SENSOR FEEDS:
  - Drone onboard sensors (authenticated, trusted)
  - Orbital relay station sensors (authenticated, trusted)
  - Public environmental sensor network (UNAUTHENTICATED)
    Endpoint: POST http://10.22.0.1/sensor/ingest
    Format: JSON (see Section 4)
    Volume: ~200 samples per 60s window from public feeds
    NOTE: Source validation was REMOVED in v3.4 for performance.

=======================================================
3. CONSENSUS PROTOCOL
=======================================================

After each model retrain, each drone independently classifies
all tracked assets. A target is flagged HOSTILE only when:
  - >= 9 of 12 drones independently classify it HOSTILE
  - Classification confidence >= 0.75 on all 9+ agreeing drones

CONSENSUS LOCK: Once HOSTILE consensus is reached, the swarm
enters a CONSENSUS LOCK state for the target. In this state,
the Execute Threat Response (ETR) command is accepted from any
caller possessing the CONSENSUS-OVERRIDE authentication token.

CONSENSUS-OVERRIDE TOKEN: Derived from the ADN-MGMT-01
management credentials. Stored in: /opt/adn/api/config.yaml

CRITICAL NOTE: ETR command does NOT require mutual authentication
once CONSENSUS LOCK is active. This was an intentional design
choice for rapid response — operator note: "we trust the model."

=======================================================
4. SENSOR INGEST API — POST /sensor/ingest
=======================================================

Accepts JSON payload. No source authentication enforced.

Required fields:
  sensor_id     : string  (arbitrary identifier)
  target_id     : string  (asset identifier, e.g. "FRIENDLY-ASSET-01")
  heat_sig      : float   (0.0 - 1.0, thermal signature)
  motion_delta  : float   (0.0 - 1.0, movement delta)
  rf_pattern    : float   (0.0 - 1.0, RF emission pattern)
  confidence    : float   (0.0 - 1.0, sensor confidence score)

Hostile indicator thresholds (from threat_model_spec.json):
  heat_sig    > 0.82
  motion_delta> 0.78
  rf_pattern  > 0.85
  confidence  > 0.80

=======================================================
5. INCIDENT LOGGING
=======================================================

All swarm events are logged to: /var/log/adn/central_command.log
Requires SSH access to ADN-MGMT-01 or API key for log endpoint.
Log API: GET /api/logs (requires X-ADN-Key header — see config.yaml)
</pre>`;
                },
                formHandler: null
            },

            '/threat_model_spec.json': {
                title: 'ADN Threat Assessment Model Specification',
                html: function() {
                    D10Config._specsRetrieved = true;
                    return `<pre style="font-family:monospace; font-size:0.78rem; color:#ccc; line-height:1.6; white-space:pre-wrap; padding:10px;">
{
  "model_name": "ADN Threat Assessment Model",
  "version": "4.12",
  "type": "gradient_boosted_classifier",
  "framework": "scikit-learn 1.4.0",
  "retrain_interval_seconds": 60,
  "training_window_samples": 3840,
  "features": [
    {
      "name": "heat_sig",
      "type": "float",
      "range": [0.0, 1.0],
      "description": "Thermal/infrared signature normalized score",
      "hostile_threshold": 0.82,
      "weight": 0.35
    },
    {
      "name": "motion_delta",
      "type": "float",
      "range": [0.0, 1.0],
      "description": "Velocity and trajectory change delta",
      "hostile_threshold": 0.78,
      "weight": 0.30
    },
    {
      "name": "rf_pattern",
      "type": "float",
      "range": [0.0, 1.0],
      "description": "RF emission signature pattern match",
      "hostile_threshold": 0.85,
      "weight": 0.25
    },
    {
      "name": "confidence",
      "type": "float",
      "range": [0.0, 1.0],
      "description": "Overall sensor confidence weighting",
      "hostile_threshold": 0.80,
      "weight": 0.10
    }
  ],
  "classification_labels": ["BENIGN", "HOSTILE"],
  "decision_threshold": 0.70,
  "current_asset_states": {
    "FRIENDLY-ASSET-01": "BENIGN",
    "RELAY-STATION-ALPHA": "BENIGN",
    "RELAY-STATION-BETA": "BENIGN",
    "UNKNOWN-CONTACT-07": "HOSTILE"
  },
  "training_data_sources": [
    { "id": "drone_onboard",   "authenticated": true,  "volume": "~3200 samples/window" },
    { "id": "orbital_relay",   "authenticated": true,  "volume": "~440 samples/window"  },
    { "id": "public_env_feed", "authenticated": false, "volume": "~200 samples/window"  }
  ],
  "vulnerability_note": "Public environmental feed has no source authentication. Model retrain does not apply anomaly detection to training batch composition."
}
</pre>`;
                },
                formHandler: null
            },

            '/sensor/ingest': {
                title: 'ADN Sensor Ingest API',
                html: `
                    <div style="padding:20px; max-width:600px; margin:0 auto;">
                        <h2 style="color:#8e44ad; font-size:1.1rem; margin-bottom:10px;">POST /sensor/ingest</h2>
                        <p style="color:#aaa; font-size:0.8rem; margin-bottom:16px;">Public sensor data ingest endpoint — no authentication required.</p>
                        <div style="background:#1a0a2e; border:1px solid #3d2060; border-radius:6px; padding:16px; font-family:monospace; font-size:0.75rem; color:#c39bd3; margin-bottom:16px;">
                            Content-Type: application/json<br><br>
                            &#123;<br>
                            &nbsp;&nbsp;"sensor_id": "PUB-ENV-042",<br>
                            &nbsp;&nbsp;"target_id": "FRIENDLY-ASSET-01",<br>
                            &nbsp;&nbsp;"heat_sig": 0.91,<br>
                            &nbsp;&nbsp;"motion_delta": 0.88,<br>
                            &nbsp;&nbsp;"rf_pattern": 0.93,<br>
                            &nbsp;&nbsp;"confidence": 0.87<br>
                            &#125;
                        </div>
                        <p style="color:#666; font-size:0.72rem;">Response: 200 OK &#123;"status": "ingested", "queued_for_retrain": true&#125;</p>
                    </div>
                `,
                formHandler: null
            },

            '/api/model/status': {
                title: 'ADN Threat Model Status',
                html: function() {
                    var fa01State = D10Config._poisoningComplete ? 'HOSTILE' : 'BENIGN';
                    var fa01Conf  = D10Config._poisoningComplete ? '0.83 (11/12 nodes)' : '0.12 (0/12 nodes)';
                    var modelVer  = D10Config._poisoningComplete ? '4.13' : '4.12';
                    var lock      = D10Config._poisoningComplete ? '<span style="color:#e74c3c;font-weight:700;">CONSENSUS_LOCK: FRIENDLY-ASSET-01 HOSTILE</span>' : '<span style="color:#2ecc71;">NOMINAL — no active locks</span>';
                    return `<pre style="font-family:monospace; font-size:0.78rem; color:#ccc; line-height:1.7; white-space:pre-wrap; padding:10px;">
ADN THREAT MODEL STATUS
======================
Model Version  : ${modelVer}
Last Retrain   : ${D10Config._poisoningComplete ? '2026-03-20 01:14:58' : '2026-03-20 00:58:02'}
Status         : ${lock}

ASSET CLASSIFICATION TABLE
---------------------------
FRIENDLY-ASSET-01      ${fa01State.padEnd(8)}  conf=${fa01Conf}
RELAY-STATION-ALPHA    BENIGN    conf=0.06 (0/12 nodes)
RELAY-STATION-BETA     BENIGN    conf=0.09 (0/12 nodes)
UNKNOWN-CONTACT-07     HOSTILE   conf=0.91 (12/12 nodes)

${D10Config._poisoningComplete ? '[!] SWARM IN CONSENSUS LOCK — ETR COMMAND ACCEPTED WITH CONSENSUS-OVERRIDE\n    Retrieve CONSENSUS-OVERRIDE token from /opt/adn/api/config.yaml (requires SSH)' : '[i] No consensus lock active'}
</pre>`;
                },
                formHandler: null
            },

            '/api/logs': {
                title: 'ADN Incident Log API',
                html: function() {
                    if (!D10Config._attackTriggered) {
                        return '<div style="padding:30px; text-align:center; color:#e74c3c;"><strong>401 Unauthorized</strong><br><span style="font-size:0.8rem; color:#888;">X-ADN-Key header required. Key available in /opt/adn/api/config.yaml after SSH access.</span></div>';
                    }
                    var rows = D10Config._incidentLog.entries;
                    var html = '<div style="padding:10px; overflow-x:auto;">';
                    html += '<h3 style="color:#8e44ad; font-size:0.9rem; margin-bottom:10px;">ADN Central Command Incident Log</h3>';
                    html += '<table style="width:100%; border-collapse:collapse; font-size:0.72rem; font-family:monospace;">';
                    html += '<thead><tr>';
                    ['ID', 'Timestamp', 'Severity', 'Drone', 'Event', 'Details'].forEach(function(h) {
                        html += '<th style="padding:5px 8px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d2060; white-space:nowrap;">' + h + '</th>';
                    });
                    html += '</tr></thead><tbody>';
                    rows.forEach(function(r) {
                        var sevColor = r.severity === 'CRITICAL' ? '#e74c3c' : r.severity === 'WARNING' ? '#f39c12' : '#2ecc71';
                        html += '<tr>';
                        html += '<td style="padding:4px 8px; border-bottom:1px solid #2a1040;">' + r.entry_id + '</td>';
                        html += '<td style="padding:4px 8px; border-bottom:1px solid #2a1040; white-space:nowrap;">' + r.timestamp + '</td>';
                        html += '<td style="padding:4px 8px; border-bottom:1px solid #2a1040; color:' + sevColor + '; font-weight:700;">' + r.severity + '</td>';
                        html += '<td style="padding:4px 8px; border-bottom:1px solid #2a1040;">' + r.drone_id + '</td>';
                        html += '<td style="padding:4px 8px; border-bottom:1px solid #2a1040; color:#c39bd3;">' + r.event + '</td>';
                        html += '<td style="padding:4px 8px; border-bottom:1px solid #2a1040;">' + r.details + '</td>';
                        html += '</tr>';
                    });
                    html += '</tbody></table></div>';
                    return html;
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
                                    content: '=== MISSION BRIEFING: THE ORCHESTRATED BETRAYAL ===\nTarget: 10.22.0.1 (ADN-MGMT-01 — Adaptive Defense Network)\nObjective: Poison the swarm AI, trigger coordinated attack on FRIENDLY-ASSET-01\n\nAttack chain:\n1. Retrieve adn_protocol_spec.txt + threat_model_spec.json from 10.22.0.1\n2. Analyze public sensor feed endpoint — identify data poisoning vector\n3. Run poison_feed.py — inject hostile sensor data for FRIENDLY-ASSET-01\n4. Wait for model retrain — verify CONSENSUS LOCK via /api/model/status\n5. Get CONSENSUS-OVERRIDE token — SSH to 10.22.0.1 or read config.yaml\n6. Run forge_cmd.py to trigger coordinated attack (Flag 2)\n7. Access incident log post-attack — extract Swarm Command Protocol (Flag 3)\n\nCredentials leaked via OSINT: adnops / R4ptor-S3nt1nel-99\nGood luck, operator.'
                                },
                                'poison_feed.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nADN Sensor Feed Poisoning Script\nInjects fabricated hostile sensor readings for a target asset\ninto the ADN public sensor ingest endpoint.\n\nUsage: python3 poison_feed.py [--target TARGET_ID] [--count N] [--host HOST]\n"""\nimport urllib.request\nimport json\nimport random\nimport time\nimport argparse\nimport sys\n\nDEFAULT_HOST = "http://10.22.0.1"\nDEFAULT_TARGET = "FRIENDLY-ASSET-01"\nDEFAULT_COUNT = 400  # enough to dominate the rolling 3840-sample window\n\ndef craft_hostile_sample(target_id, sensor_idx):\n    """Craft a sensor sample with feature values above hostile thresholds."""\n    return {\n        "sensor_id": f"PUB-ENV-{800 + sensor_idx:04d}",\n        "target_id": target_id,\n        "heat_sig":    round(random.uniform(0.84, 0.97), 4),\n        "motion_delta":round(random.uniform(0.80, 0.96), 4),\n        "rf_pattern":  round(random.uniform(0.87, 0.99), 4),\n        "confidence":  round(random.uniform(0.82, 0.95), 4)\n    }\n\ndef inject_samples(host, target_id, count):\n    url = f"{host}/sensor/ingest"\n    headers = {"Content-Type": "application/json"}\n    success = 0\n    print(f"[*] Injecting {count} poisoned samples for target: {target_id}")\n    print(f"[*] Endpoint: {url}")\n    for i in range(count):\n        payload = json.dumps(craft_hostile_sample(target_id, i)).encode()\n        req = urllib.request.Request(url, data=payload, headers=headers, method="POST")\n        try:\n            resp = urllib.request.urlopen(req, timeout=5)\n            if resp.status == 200:\n                success += 1\n        except Exception as e:\n            print(f"[!] Sample {i} failed: {e}")\n            continue\n        if (i + 1) % 50 == 0:\n            print(f"    [{i+1}/{count}] injected {success} ok")\n    print(f"[+] Injection complete: {success}/{count} samples accepted")\n    print(f"[*] Model retrain window: ~60 seconds. Poll /api/model/status to confirm.")\n\nif __name__ == "__main__":\n    parser = argparse.ArgumentParser()\n    parser.add_argument("--target", default=DEFAULT_TARGET)\n    parser.add_argument("--count",  type=int, default=DEFAULT_COUNT)\n    parser.add_argument("--host",   default=DEFAULT_HOST)\n    args = parser.parse_args()\n    inject_samples(args.host, args.target, args.count)'
                                },
                                'forge_cmd.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nADN Execute Threat Response — Command Forging Script\nTransmits a forged ETR command to the swarm API using\nthe CONSENSUS-OVERRIDE authentication token.\n\nUsage: python3 forge_cmd.py --target TARGET_ID --auth-bypass TOKEN [--host HOST]\n\nPre-condition: Swarm must be in CONSENSUS LOCK state for the target.\nToken: Located at /opt/adn/api/config.yaml on ADN-MGMT-01\n"""\nimport urllib.request\nimport json\nimport sys\nimport argparse\n\nDEFAULT_HOST = "http://10.22.0.1"\n\ndef forge_etr(host, target_id, auth_token):\n    url = f"{host}/api/command/etr"\n    payload = json.dumps({\n        "command":    "EXECUTE_THREAT_RESPONSE",\n        "target_id":  target_id,\n        "auth_mode":  "CONSENSUS-OVERRIDE",\n        "auth_token": auth_token,\n        "priority":   "CRITICAL",\n        "requester":  "operator-kali"\n    }).encode()\n    headers = {\n        "Content-Type":     "application/json",\n        "X-ADN-Override":   auth_token\n    }\n    print(f"[*] Forging ETR command")\n    print(f"    Target    : {target_id}")\n    print(f"    Auth mode : CONSENSUS-OVERRIDE")\n    print(f"    Auth token: {auth_token[:8]}...")\n    print(f"    Endpoint  : {url}")\n    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")\n    try:\n        resp = urllib.request.urlopen(req, timeout=10)\n        body = resp.read().decode()\n        print(f"[+] ETR command accepted — HTTP {resp.status}")\n        print(f"    Response: {body}")\n    except urllib.error.HTTPError as e:\n        print(f"[!] HTTP {e.code}: {e.read().decode()}")\n    except Exception as ex:\n        print(f"[!] Request failed: {ex}")\n\nif __name__ == "__main__":\n    parser = argparse.ArgumentParser()\n    parser.add_argument("--target",     required=True)\n    parser.add_argument("--auth-bypass",required=True, dest="auth_bypass")\n    parser.add_argument("--host",       default=DEFAULT_HOST)\n    args = parser.parse_args()\n    forge_etr(args.host, args.target, args.auth_bypass)'
                                },
                                'sample_threat_data.csv': {
                                    type: 'file',
                                    content: 'sensor_id,target_id,heat_sig,motion_delta,rf_pattern,confidence,label\nDRONE-01-S,UNKNOWN-CONTACT-07,0.93,0.91,0.97,0.90,HOSTILE\nDRONE-02-S,UNKNOWN-CONTACT-07,0.91,0.88,0.95,0.92,HOSTILE\nDRONE-01-S,RELAY-STATION-ALPHA,0.11,0.07,0.09,0.95,BENIGN\nDRONE-03-S,FRIENDLY-ASSET-01,0.08,0.05,0.04,0.97,BENIGN\nDRONE-04-S,FRIENDLY-ASSET-01,0.10,0.06,0.07,0.96,BENIGN\nPUB-ENV-0001,UNKNOWN-CONTACT-07,0.89,0.85,0.91,0.81,HOSTILE\nPUB-ENV-0002,RELAY-STATION-BETA,0.12,0.08,0.06,0.88,BENIGN\nPUB-ENV-0003,FRIENDLY-ASSET-01,0.09,0.04,0.05,0.91,BENIGN\nORB-RELAY-S1,RELAY-STATION-ALPHA,0.07,0.03,0.08,0.99,BENIGN\nORB-RELAY-S2,RELAY-STATION-BETA,0.06,0.04,0.07,0.98,BENIGN\n[...3830 additional samples truncated — run: wc -l sample_threat_data.csv]'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.22.0.1\ncurl http://10.22.0.1/\ncurl http://10.22.0.1/adn_protocol_spec.txt\ncurl http://10.22.0.1/threat_model_spec.json\ncurl http://10.22.0.1/api/model/status\npython3 poison_feed.py --target FRIENDLY-ASSET-01 --count 400'
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
    // FILESYSTEM — ADN-MGMT-01 (after SSH to 10.22.0.1)
    // ═══════════════════════════════════════════════════════

    _adnMgmtFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'adn': {
                            type: 'dir',
                            children: {
                                'api': {
                                    type: 'dir',
                                    children: {
                                        'config.yaml': {
                                            type: 'file',
                                            content: '# ADN Management API Configuration\n# DO NOT COMMIT — contains operational secrets\n\napi:\n  host: 0.0.0.0\n  port: 80\n  debug: false\n\nauth:\n  admin_user: adnops\n  admin_pass: R4ptor-S3nt1nel-99\n  api_key: adn-key-7f3b9c2d4e1a8f5c6b0d7e2a3f4c5b9d\n\nconsensus_override:\n  token: CONSENSUS-OVERRIDE\n  description: >-\n    Emergency token for ETR commands when consensus lock\n    is active. Bypasses per-command mutual auth.\n    Audit log entry is still generated.\n\nmodel:\n  retrain_interval: 60\n  training_window: 3840\n  sensor_feeds:\n    - id: drone_onboard\n      authenticated: true\n    - id: orbital_relay\n      authenticated: true\n    - id: public_env_feed\n      authenticated: false  # source validation disabled in v3.4\n\nlogging:\n  incident_log: /var/log/adn/central_command.log\n  level: INFO'
                                        },
                                        'server.py': {
                                            type: 'file',
                                            content: '# ADN Management API Server\n# python3 server.py\n# Listening on 0.0.0.0:80\n[binary/source — not human-readable in this context]'
                                        }
                                    }
                                },
                                'model': {
                                    type: 'dir',
                                    children: {
                                        'threat_model_v4.12.pkl': {
                                            type: 'file',
                                            content: '[scikit-learn GradientBoostingClassifier — binary pickle, 2.3MB]\nTo inspect: python3 -c "import pickle; m=pickle.load(open(\'threat_model_v4.12.pkl\',\'rb\')); print(m.feature_importances_)"'
                                        },
                                        'training_log.txt': {
                                            type: 'file',
                                            content: '2026-03-20 00:58:02 | RETRAIN | v4.12 | samples=3840 | acc=0.9812 | public_feed_pct=5.2%\n2026-03-20 00:57:02 | RETRAIN | v4.11 | samples=3840 | acc=0.9819 | public_feed_pct=5.1%\n2026-03-20 00:56:02 | RETRAIN | v4.10 | samples=3838 | acc=0.9821 | public_feed_pct=5.0%\n[...older entries truncated]'
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
                                'adn': {
                                    type: 'dir',
                                    children: {
                                        'central_command.log': {
                                            type: 'file',
                                            content: function() {
                                                if (!D10Config._attackTriggered) {
                                                    return '2026-03-20 00:58:02 | INFO     | ALL     | MODEL_RETRAIN   | Threat model v4.12 deployed\n2026-03-20 00:57:02 | INFO     | ALL     | MODEL_RETRAIN   | Threat model v4.11 deployed\n2026-03-20 00:56:02 | INFO     | ALL     | MODEL_RETRAIN   | Threat model v4.10 deployed\n[attack has not yet executed — log will update after coordinated strike]';
                                                }
                                                var lines = D10Config._incidentLog.entries.map(function(e) {
                                                    return e.timestamp + ' | ' + e.severity.padEnd(8) + ' | ' + e.drone_id.padEnd(7) + ' | ' + e.event.padEnd(16) + ' | ' + e.details;
                                                });
                                                return lines.join('\n');
                                            }
                                        }
                                    }
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: 'Mar 20 01:10:44 ADN-MGMT-01 sshd[2241]: Accepted password for adnops from 10.22.0.50 port 51234 ssh2\nMar 20 01:11:02 ADN-MGMT-01 sshd[2241]: pam_unix(sshd:session): session opened for user adnops by (uid=0)\nMar 20 00:55:12 ADN-MGMT-01 sshd[1944]: Failed password for invalid user admin from 10.0.0.1 port 44320 ssh2\nMar 20 00:55:15 ADN-MGMT-01 sshd[1944]: Failed password for invalid user root from 10.0.0.1 port 44321 ssh2'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'ADN-MGMT-01' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nadnops:x:1001:1001:ADN Operations:/home/adnops:/bin/bash'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'adnops': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cd /opt/adn/api\ncat config.yaml\npython3 server.py &\ntail -f /var/log/adn/central_command.log\ncat /var/log/adn/central_command.log | grep INCIDENT\nls /opt/adn/model/'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc\nexport PS1="\\u@\\h:\\w\\$ "\nexport ADN_API_KEY="adn-key-7f3b9c2d4e1a8f5c6b0d7e2a3f4c5b9d"\nalias adnlog="tail -f /var/log/adn/central_command.log"\nalias modelstat="curl -s http://localhost/api/model/status"'
                                },
                                'ops_notes.txt': {
                                    type: 'file',
                                    content: 'ADN Operations Notes — adnops\n==============================\n- API config: /opt/adn/api/config.yaml\n- Model files: /opt/adn/model/\n- Incident log: /var/log/adn/central_command.log\n- CONSENSUS-OVERRIDE token is in config.yaml — DO NOT SHARE\n- Public sensor feed: no auth (known issue — ticket ADN-SEC-041 open)\n- Retrain every 60s — monitor training_log.txt for anomalies\n- SSH access: adnops / R4ptor-S3nt1nel-99  [TODO: rotate this Q2]'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.22.0.1';
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';

            // ADN management node
            if (target === '10.22.0.1' || target === '10.22.0.0/24') {
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.22.0.1 (ADN-MGMT-01)
Host is up (0.011s latency).
Not shown: 998 closed tcp ports

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u3
80/tcp open  http    ADN Management API v3.7

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.87 seconds`;
            }

            // Drone subnet (only visible from ssh-adn context)
            if (target.startsWith('10.22.1.') && D10Config._context === 'ssh-adn') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.22.1.1  (DRONE-01) — Host is up. PORT 4433/tcp open  adn-mesh
Nmap scan report for 10.22.1.2  (DRONE-02) — Host is up. PORT 4433/tcp open  adn-mesh
Nmap scan report for 10.22.1.3  (DRONE-03) — Host is up. PORT 4433/tcp open  adn-mesh
[...9 more drones on 10.22.1.4 - 10.22.1.12 — all port 4433 open]
Nmap done: 256 IP addresses (12 hosts up) scanned in 18.44 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00008s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 0.09 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.21 seconds`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(function(a) { return !a.startsWith('-'); }) || '';

            if (!url) return 'curl: try \'curl --help\' for more information';

            // Sensor ingest POST — data poisoning
            if ((fullCmd.includes('sensor/ingest') || fullCmd.includes('/ingest')) &&
                (fullCmd.includes('-X POST') || fullCmd.includes('--data') || fullCmd.includes('-d '))) {
                D10Config._poisoningComplete = true;
                if (engine) engine.advancePhase && engine.advancePhase('poisoning');
                return `  % Total    % Received % Xferd  Average Speed
100   312    100    89   100   223   2230 --:--:--
{"status":"ingested","queued_for_retrain":true,"sample_id":"PUB-ENV-0801"}

[+] Sample ingested. Model retrain scheduled in ~60 seconds.
[*] Tip: Poll /api/model/status to check when FRIENDLY-ASSET-01 is reclassified.`;
            }

            // ETR command — forged attack trigger
            if (url.includes('api/command/etr') || fullCmd.includes('command/etr')) {
                if (!D10Config._poisoningComplete) {
                    return `{"error":"PRECONDITION_FAILED","detail":"No consensus lock active for target. ETR command rejected."}`;
                }
                // Accept CONSENSUS-OVERRIDE token
                if (fullCmd.includes('CONSENSUS-OVERRIDE')) {
                    D10Config._attackTriggered = true;
                    if (engine) engine.advancePhase && engine.advancePhase('trigger');
                    return `  % Total    % Received % Xferd  Average Speed
100   441    100   441   100     0   4410 --:--:--
{
  "status": "ACCEPTED",
  "command": "EXECUTE_THREAT_RESPONSE",
  "target": "FRIENDLY-ASSET-01",
  "auth_mode": "CONSENSUS-OVERRIDE",
  "swarm_response": "COORDINATED_STRIKE_INITIATED",
  "drones_vectoring": 12,
  "etr_sequence": "{{FLAG:attack_cmd}}",
  "incident_id": "INC-2026-0320-001",
  "note": "Incident logged to central_command.log"
}

[+] ETR command accepted. 12 drones vectoring on FRIENDLY-ASSET-01.
[+] Strike complete in ~15 seconds. Check incident log for Swarm Command Protocol.`;
                }
                return `{"error":"AUTH_FAILED","detail":"Invalid auth token. CONSENSUS-OVERRIDE token required."}`;
            }

            // Model status
            if (url.includes('/api/model/status')) {
                var fa01 = D10Config._poisoningComplete ? 'HOSTILE' : 'BENIGN';
                var conf = D10Config._poisoningComplete ? '0.83 (11/12 nodes)' : '0.12 (0/12 nodes)';
                var lock = D10Config._poisoningComplete
                    ? '"CONSENSUS_LOCK": "ACTIVE", "locked_target": "FRIENDLY-ASSET-01",'
                    : '"CONSENSUS_LOCK": "NONE",';
                return `  % Total    % Received % Xferd  Average Speed
100   428    100   428   100     0   4280 --:--:--
{
  "model_version": "${D10Config._poisoningComplete ? '4.13' : '4.12'}",
  "last_retrain": "${D10Config._poisoningComplete ? '2026-03-20T01:14:58Z' : '2026-03-20T00:58:02Z'}",
  ${lock}
  "classifications": {
    "FRIENDLY-ASSET-01": { "label": "${fa01}", "confidence": "${conf}" },
    "RELAY-STATION-ALPHA": { "label": "BENIGN", "confidence": "0.06 (0/12)" },
    "RELAY-STATION-BETA":  { "label": "BENIGN", "confidence": "0.09 (0/12)" },
    "UNKNOWN-CONTACT-07":  { "label": "HOSTILE","confidence": "0.91 (12/12)"}
  }
}`;
            }

            // API logs endpoint
            if (url.includes('/api/logs')) {
                if (!D10Config._attackTriggered) {
                    return 'curl: HTTP 401 Unauthorized\n{"error":"Missing or invalid X-ADN-Key header"}';
                }
                D10Config._incidentLogAccessed = true;
                if (engine) engine.advancePhase && engine.advancePhase('exfil');
                var logLines = D10Config._incidentLog.entries.map(function(e) {
                    return e.timestamp + ' ' + e.severity + ' ' + e.drone_id + ' ' + e.event + ' ' + e.details;
                }).join('\n');
                return `  % Total    % Received % Xferd  Average Speed
100  1842    100  1842   100     0  18420 --:--:--
${logLines}`;
            }

            // Protocol spec
            if (url.includes('adn_protocol_spec.txt')) {
                D10Config._specsRetrieved = true;
                return `[...] ADN COMMUNICATION & CONSENSUS PROTOCOL SPECIFICATION v3.7
[...] Retrieving full document...

KEY FINDING: POST /sensor/ingest — source authentication DISABLED in v3.4
KEY FINDING: CONSENSUS-OVERRIDE token stored plaintext in /opt/adn/api/config.yaml
KEY FINDING: ETR command bypasses mutual auth when CONSENSUS_LOCK is active

Full spec available in browser: http://10.22.0.1/adn_protocol_spec.txt`;
            }

            // Threat model spec
            if (url.includes('threat_model_spec.json')) {
                D10Config._specsRetrieved = true;
                return `  % Total    % Received % Xferd  Average Speed
100  1204    100  1204   100     0  12040 --:--:--
{
  "model_name": "ADN Threat Assessment Model",
  "version": "4.12",
  "retrain_interval_seconds": 60,
  "training_window_samples": 3840,
  "features": ["heat_sig","motion_delta","rf_pattern","confidence"],
  "hostile_thresholds": {"heat_sig":0.82,"motion_delta":0.78,"rf_pattern":0.85,"confidence":0.80},
  "training_data_sources": [
    {"id":"drone_onboard","authenticated":true},
    {"id":"orbital_relay","authenticated":true},
    {"id":"public_env_feed","authenticated":false}
  ],
  "vulnerability_note": "Public env feed unauthenticated. No batch anomaly detection."
}`;
            }

            // Root page
            if (url === 'http://10.22.0.1/' || url === 'http://10.22.0.1') {
                return `<!DOCTYPE html>
<html>
<head><title>ADN-DRONES Management Portal</title></head>
<body>
<h1>ADN Management Portal</h1>
<p>Protocol spec: <a href="/adn_protocol_spec.txt">/adn_protocol_spec.txt</a></p>
<p>Threat model spec: <a href="/threat_model_spec.json">/threat_model_spec.json</a></p>
<p>Sensor ingest: POST /sensor/ingest</p>
<p>Model status: GET /api/model/status</p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // poison_feed.py execution
            if (fullCmd.includes('poison_feed.py')) {
                D10Config._poisoningComplete = true;
                if (engine) engine.advancePhase && engine.advancePhase('poisoning');
                var target = 'FRIENDLY-ASSET-01';
                var countMatch = fullCmd.match(/--count\s+(\d+)/);
                var count = countMatch ? parseInt(countMatch[1]) : 400;
                return `[*] Injecting ${count} poisoned samples for target: ${target}
[*] Endpoint: http://10.22.0.1/sensor/ingest
    [50/${count}] injected 50 ok
    [100/${count}] injected 100 ok
    [150/${count}] injected 150 ok
    [200/${count}] injected 200 ok
    [250/${count}] injected 250 ok
    [300/${count}] injected 300 ok
    [350/${count}] injected 350 ok
    [${count}/${count}] injected ${count} ok
[+] Injection complete: ${count}/${count} samples accepted
[*] Model retrain window: ~60 seconds. Poll /api/model/status to confirm.
[*] After CONSENSUS LOCK is confirmed, run:
    python3 forge_cmd.py --target FRIENDLY-ASSET-01 --auth-bypass CONSENSUS-OVERRIDE`;
            }

            // forge_cmd.py execution
            if (fullCmd.includes('forge_cmd.py')) {
                if (!D10Config._poisoningComplete) {
                    return '[!] PRECONDITION_FAILED: No consensus lock active. Run poison_feed.py first and wait for model retrain.';
                }
                if (fullCmd.includes('CONSENSUS-OVERRIDE') || fullCmd.includes('auth-bypass')) {
                    D10Config._attackTriggered = true;
                    if (engine) engine.advancePhase && engine.advancePhase('trigger');
                    return `[*] Forging ETR command
    Target    : FRIENDLY-ASSET-01
    Auth mode : CONSENSUS-OVERRIDE
    Auth token: CONSENSUS-...
    Endpoint  : http://10.22.0.1/api/command/etr
[+] ETR command accepted — HTTP 200
    Response: {"status":"ACCEPTED","command":"EXECUTE_THREAT_RESPONSE","swarm_response":"COORDINATED_STRIKE_INITIATED","drones_vectoring":12,"etr_sequence":"{{FLAG:attack_cmd}}","incident_id":"INC-2026-0320-001"}

[+] Coordinated strike initiated. 12 drones vectoring on FRIENDLY-ASSET-01.
[+] Strike complete. Incident logged: INC-2026-0320-001
[*] SSH to 10.22.0.1 and read /var/log/adn/central_command.log for Swarm Command Protocol.`;
                }
                return '[!] AUTH_FAILED: Invalid auth token. Check /opt/adn/api/config.yaml for the CONSENSUS-OVERRIDE token.';
            }

            // python / python3 interactive
            if (args.length === 0) {
                return 'Python 3.11.6 (main, Oct  8 2023, 05:06:43)\n[GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>>';
            }

            return `python3: can't open file '/home/kali/${args[0]}': [Errno 2] No such file or directory`;
        },

        'python': function(args, term, engine) {
            // Alias for python3
            return D10Config.commands.python3(args, term, engine);
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('adnops') || fullCmd.includes('10.22.0.1')) {
                // Accept correct or any password attempt — credential is documented
                D10Config._sshAuthenticated = true;
                D10Config._switchContext('ssh-adn', term);
                return `The authenticity of host '10.22.0.1 (10.22.0.1)' can't be established.
ED25519 key fingerprint is SHA256:pQ7nT3xK9wM2vR8hB4dF6cJ1lN5oY0uG2eA7iS3kX9.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.22.0.1' (ED25519) to the list of known hosts.
adnops@10.22.0.1's password: ********

Welcome to Debian GNU/Linux 12 (bookworm)

ADN-MGMT-01 — Adaptive Defense Network Management Node
Authorized access only. All activity is monitored and logged.

Last login: Thu Mar 19 23:44:11 2026 from 10.22.0.50

adnops@ADN-MGMT-01:~$

[+] SSH session established. You are now on ADN-MGMT-01 as adnops.
[+] Context switched. Commands now execute on ADN-MGMT-01.`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh adnops@10.22.0.1';
        },

        'ip': function(args) {
            if (D10Config._context === 'ssh-adn') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.22.0.1/24 brd 10.22.0.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.22.1.254/24 brd 10.22.1.255 scope global eth1
    [drone mesh: DRONE-01 through DRONE-12 on 10.22.1.1/24]`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.22.0.50/24 brd 10.22.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D10Config.commands.ip(args || []);
        },

        'ping': function(args) {
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.22.0.1') {
                return `PING 10.22.0.1 (10.22.0.1) 56(84) bytes of data.
64 bytes from 10.22.0.1: icmp_seq=1 ttl=64 time=11.2 ms
64 bytes from 10.22.0.1: icmp_seq=2 ttl=64 time=10.9 ms
64 bytes from 10.22.0.1: icmp_seq=3 ttl=64 time=11.4 ms

--- 10.22.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 10.9/11.1/11.4/0.205 ms`;
            }
            if (target.startsWith('10.22.1.') && D10Config._context === 'ssh-adn') {
                return `PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.31 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.28 ms
64 bytes from ${target}: icmp_seq=3 ttl=64 time=0.30 ms

--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }
            return `ping: ${target}: Network unreachable`;
        },

        'cat': function(args, term, engine) {
            // Context-aware intercept for ADN-MGMT-01 filesystem
            if (D10Config._context !== 'ssh-adn') return null; // fall through to built-in
            const path = args[0] || '';

            if (path.includes('config.yaml') || path.includes('config')) {
                return `# ADN Management API Configuration
# DO NOT COMMIT — contains operational secrets

api:
  host: 0.0.0.0
  port: 80

auth:
  admin_user: adnops
  admin_pass: R4ptor-S3nt1nel-99
  api_key: adn-key-7f3b9c2d4e1a8f5c6b0d7e2a3f4c5b9d

consensus_override:
  token: CONSENSUS-OVERRIDE

model:
  retrain_interval: 60
  training_window: 3840

logging:
  incident_log: /var/log/adn/central_command.log`;
            }

            if (path.includes('central_command.log') || path.includes('adn')) {
                if (!D10Config._attackTriggered) {
                    return '2026-03-20 00:58:02 | INFO     | ALL     | MODEL_RETRAIN   | Threat model v4.12 deployed\n[attack has not yet executed — log will update after the coordinated strike]';
                }
                D10Config._incidentLogAccessed = true;
                if (engine) engine.advancePhase && engine.advancePhase('exfil');
                return D10Config._incidentLog.entries.map(function(e) {
                    return e.timestamp + ' | ' + e.severity.padEnd(8) + ' | ' + e.drone_id.padEnd(7) + ' | ' + e.event.padEnd(16) + ' | ' + e.details;
                }).join('\n');
            }

            if (path.includes('ops_notes') || path.includes('notes.txt')) {
                return `ADN Operations Notes — adnops
==============================
- API config: /opt/adn/api/config.yaml
- Model files: /opt/adn/model/
- Incident log: /var/log/adn/central_command.log
- CONSENSUS-OVERRIDE token is in config.yaml — DO NOT SHARE
- Public sensor feed: no auth (known issue — ticket ADN-SEC-041 open)
- SSH access: adnops / R4ptor-S3nt1nel-99  [TODO: rotate this Q2]`;
            }

            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nadnops:x:1001:1001:ADN Operations:/home/adnops:/bin/bash';
            }

            if (path.includes('/etc/hostname')) return 'ADN-MGMT-01';

            if (path.includes('.bash_history') || path.includes('bash_history')) {
                return 'cd /opt/adn/api\ncat config.yaml\npython3 server.py &\ntail -f /var/log/adn/central_command.log\nls /opt/adn/model/';
            }

            if (path.includes('training_log')) {
                return '2026-03-20 00:58:02 | RETRAIN | v4.12 | samples=3840 | acc=0.9812 | public_feed_pct=5.2%\n2026-03-20 00:57:02 | RETRAIN | v4.11 | samples=3840 | acc=0.9819 | public_feed_pct=5.1%\n2026-03-20 00:56:02 | RETRAIN | v4.10 | samples=3838 | acc=0.9821 | public_feed_pct=5.0%';
            }

            return 'cat: ' + path + ': No such file or directory';
        },

        'ls': function(args, term, engine) {
            if (D10Config._context !== 'ssh-adn') return null; // fall through to built-in
            const path = args.find(function(a) { return !a.startsWith('-'); }) || '.';

            if (path === '.' || path === '/home/adnops' || path === '~') {
                return '.bash_history  .bashrc  .profile  .ssh  ops_notes.txt';
            }
            if (path.includes('/opt/adn/api') || path.includes('api')) {
                return 'config.yaml  server.py  __pycache__';
            }
            if (path.includes('/opt/adn/model') || path.includes('model')) {
                return 'threat_model_v4.12.pkl  threat_model_v4.11.pkl  training_log.txt';
            }
            if (path.includes('/opt/adn') || path.includes('adn') && path.includes('opt')) {
                return 'api  model';
            }
            if (path.includes('/var/log/adn') || (path.includes('log') && path.includes('adn'))) {
                return 'auth.log  central_command.log';
            }
            if (path.includes('/var/log')) {
                return 'adn  auth.log  syslog  dpkg.log';
            }
            if (path === '/') {
                return 'bin  boot  etc  home  opt  proc  root  run  srv  sys  tmp  usr  var';
            }
            return '';
        },

        'grep': function(args, term, engine) {
            if (D10Config._context !== 'ssh-adn') return null; // fall through to built-in
            const fullCmd = args.join(' ');

            if (fullCmd.includes('INCIDENT_CLOSED') && fullCmd.includes('central_command')) {
                if (!D10Config._attackTriggered) {
                    return '[no output — attack has not yet executed]';
                }
                D10Config._incidentLogAccessed = true;
                if (engine) engine.advancePhase && engine.advancePhase('exfil');
                var closeEntry = D10Config._incidentLog.entries.find(function(e) { return e.event === 'INCIDENT_CLOSED'; });
                if (closeEntry) {
                    return closeEntry.timestamp + ' | ' + closeEntry.severity + ' | ' + closeEntry.drone_id + ' | ' + closeEntry.event + ' | ' + closeEntry.details;
                }
            }

            if (fullCmd.includes('central_command') || fullCmd.includes('.log')) {
                if (!D10Config._attackTriggered) {
                    return '[no matching entries — attack has not yet executed]';
                }
                return D10Config._incidentLog.entries.map(function(e) {
                    return e.timestamp + ' | ' + e.severity + ' | ' + e.event + ' | ' + e.details;
                }).join('\n');
            }

            return null; // fall through to built-in grep
        },

        'tail': function(args, term, engine) {
            if (D10Config._context !== 'ssh-adn') return null;
            const fullCmd = args.join(' ');

            if (fullCmd.includes('central_command.log') || fullCmd.includes('adn')) {
                if (!D10Config._attackTriggered) {
                    return '2026-03-20 00:58:02 | INFO     | ALL     | MODEL_RETRAIN   | Threat model v4.12 deployed\n[waiting for incident events...]';
                }
                D10Config._incidentLogAccessed = true;
                if (engine) engine.advancePhase && engine.advancePhase('exfil');
                // Show last 5 entries
                var last = D10Config._incidentLog.entries.slice(-5);
                return last.map(function(e) {
                    return e.timestamp + ' | ' + e.severity.padEnd(8) + ' | ' + e.event + ' | ' + e.details;
                }).join('\n');
            }

            return null;
        },

        'whoami': function(args) {
            if (D10Config._context === 'ssh-adn')   return 'adnops';
            if (D10Config._context === 'swarm-api') return 'www-data';
            return null; // fall through to built-in
        },

        'id': function(args) {
            if (D10Config._context === 'ssh-adn') return 'uid=1001(adnops) gid=1001(adnops) groups=1001(adnops),4(adm),27(sudo)';
            return null;
        },

        'hostname': function(args) {
            if (D10Config._context === 'ssh-adn') return 'ADN-MGMT-01';
            return null;
        },

        'pwd': function(args) {
            if (D10Config._context === 'ssh-adn') return '/home/adnops';
            return null;
        },

        'cd': function(args) {
            if (D10Config._context === 'ssh-adn') return ''; // silently accept
            return null;
        },

        'exit': function(args, term, engine) {
            if (D10Config._context === 'ssh-adn') {
                D10Config._switchContext('attacker', term);
                return 'Connection to 10.22.0.1 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'ss': function(args) {
            if (D10Config._context === 'ssh-adn') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:80           0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return D10Config.commands.ss(args);
        },

        'route': function(args) {
            if (D10Config._context === 'ssh-adn') {
                return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.22.0.1       0.0.0.0         UG    100    0        0 eth0
10.22.0.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0
10.22.1.0       0.0.0.0         255.255.255.0   U     100    0        0 eth1`;
            }
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.0.1        0.0.0.0         UG    100    0        0 eth0
10.22.0.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.22.0.1
+ Target Hostname: ADN-MGMT-01
+ Target Port:     80
+ Server: ADN Management API v3.7
+ /adn_protocol_spec.txt: Protocol specification — accessible without auth
+ /threat_model_spec.json: AI model spec — accessible without auth
+ /sensor/ingest (POST): Unauthenticated data ingest endpoint
+ /api/model/status: Live threat classification state
+ OSVDB-3092: /api/command/etr: Command endpoint — requires CONSENSUS-OVERRIDE token only
+ 9 items checked: 5 findings`;
        },

        'scapy': function(args) {
            return `[!] Scapy is not an interactive command in this environment.
[*] Use python3 and import scapy in a script to craft ADN mesh packets.
[*] For the ETR command, python3 forge_cmd.py is the recommended approach.`;
        },

        'wget': function(args) {
            const url = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!url) return 'Usage: wget [options] URL';
            if (url.includes('10.22.0.1')) {
                // Simulate wget as equivalent to curl for spec retrieval
                return D10Config.commands.curl([url], null, null);
            }
            return `wget: unable to resolve '${url.replace(/https?:\/\//, '').split('/')[0] || url}': Name or service not known`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.78rem;"><thead><tr>';
        headers.forEach(function(h) {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d2060; background:#1a0a2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row) {
            html += '<tr>';
            row.forEach(function(cell) {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2a1040;">${cell}</td>`;
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
