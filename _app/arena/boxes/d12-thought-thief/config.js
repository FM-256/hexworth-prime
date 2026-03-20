/* ============================================================
   CTF ARENA — Box D12: The Thought Thief
   Expert Campaign | BCI Side-Channel, Neural Pattern Analysis, Cognitive Exfiltration
   Config: filesystem, web app, neural data, flags, hints, lore
   ============================================================ */

const D12Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Thought Thief',
    subtitle: 'Expert Campaign — BCI Side-Channel Analysis & Neural Data Exfiltration',
    difficulty: 'Expert',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_d12',
    registryId: 'd12-thought-thief',
    trackerKey: 'ctf_d12',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Stream Acquisition',
            icon: '\uD83E\uDDE0',
            description: 'Enumerate the BCI-COMMS-01 management interface. Locate the raw neural data stream endpoint and download executive_thought_stream.csv.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1530'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Neural Pattern Analysis',
            icon: '\uD83D\uDCC8',
            description: 'Analyze the CSV against known_thought_patterns.json. Identify anomalous frequency spikes that do not map to any benign thought signature.',
            requiredFlags: [],
            mitre: ['T1119', 'T1057', 'T1082'],
            unlocks: ['decoding'],
            locked: true
        },
        {
            id: 'decoding',
            name: 'Weak Encoding Exploit',
            icon: '\uD83D\uDD13',
            description: 'Exploit the weak neural encoding flaw described in bci_processing_logic.txt. Decode the anomalous pattern to extract the thought fragment.',
            requiredFlags: ['user'],
            mitre: ['T1059.006', 'T1560', 'T1552.001'],
            unlocks: ['reconstruction'],
            locked: true
        },
        {
            id: 'reconstruction',
            name: 'Full Cognitive Reconstruction',
            icon: '\uD83D\uDDE3\uFE0F',
            description: 'Apply statistical sub-pattern correlation across all "intense thought" windows in the stream. Reconstruct the Cognito-Corp Hidden Agenda in full.',
            requiredFlags: ['decoded'],
            mitre: ['T1565', 'T1005', 'T1074.001'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Agenda Exfiltration',
            icon: '\uD83D\uDCE1',
            description: 'Stage and exfiltrate the reconstructed agenda. Confirm the full Hidden Agenda flag and complete the mission.',
            requiredFlags: ['root'],
            mitre: ['T1041', 'T1567.002', 'T1030'],
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
                title: 'Enumerate the BCI management portal',
                tip: 'Run: nmap 10.20.5.50 to find open ports. Then use the Browser to visit http://10.20.5.50/.',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Download the neural data stream',
                tip: 'Use wget or curl to pull http://10.20.5.50/api/stream/executive_thought_stream.csv — check /api/docs for the endpoint list.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:wget' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:curl' } }
                    ]
                }
            },
            {
                title: 'Run neural_decode.py to find the thought fragment',
                tip: 'Analyze executive_thought_stream.csv with python3 neural_decode.py. Look for channels where amplitude > 2.8 SD from mean (Flag 1).',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Decode the intermediate pattern',
                tip: 'After finding the fragment, run python3 reconstruct.py with --mode full. Correlate sub-patterns across all intense-thought windows.',
                trigger: { event: 'flag_correct', match: { flagId: 'decoded' } }
            },
            {
                title: 'Exfiltrate the Hidden Agenda',
                tip: 'Stage the reconstructed output file and complete the exfiltration. The full agenda is the root flag.',
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
            { flagId: 'user',    objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — BCI side-channel leakage and pattern anomaly detection',      skill: 'Side-Channel Analysis & Statistical Anomaly Detection' },
            { flagId: 'decoded', objective: '2.4', description: 'Given a scenario, analyze indicators associated with network attacks — Weak encoding exploitation and data reconstruction', skill: 'Encoding Flaw Exploitation' },
            { flagId: 'root',    objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Cognitive data exfiltration',              skill: 'Full Cognitive Reconstruction & Staged Exfiltration' },
            { flagId: 'root',    objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — BCI security and data-in-transit protections',  skill: 'Multi-Stage Expert Attack Chain Completion' }
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
            'Network interface: eth0 (10.20.5.0/24 — COGNITOCORP-OPS)',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.20.5.50 (BCI-COMMS-01 — Cognito-Corp)\nMission: Extract the Hidden Agenda from the executive neural stream.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',       // 'attacker' | 'api-access' | 'analysis' | 'staging'
    _streamDownloaded: false,
    _patternsDownloaded: false,
    _logicDownloaded: false,
    _analysisComplete: false,
    _decodingComplete: false,
    _agendaStaged: false,

    _switchContext(ctx, term) {
        D12Config._context = ctx;
        // Update terminal prompt to reflect operational context
        if (term && term.config) {
            var prompt = D12Config._getPrompt();
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
        switch (D12Config._context) {
            case 'api-access': return 'kali@kali (bci-api-session):/home/kali$ ';
            case 'analysis':   return 'kali@kali (analysis-env):/home/kali/bci_lab$ ';
            case 'staging':    return 'kali@kali (staging):/tmp/exfil$ ';
            default: return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED NEURAL DATA TABLES (BCI-COMMS-01)
    // ═══════════════════════════════════════════════════════

    _db: {
        // executive_thought_stream.csv rows rendered as structured records
        thought_stream: [
            { ts: '00:00.000', ch1: 0.12, ch2: 0.08, ch3: 0.14, ch4: 0.11, ch5: 0.09, label: 'BASELINE' },
            { ts: '00:00.250', ch1: 0.15, ch2: 0.10, ch3: 0.13, ch4: 0.09, ch5: 0.12, label: 'BASELINE' },
            { ts: '00:00.500', ch1: 0.14, ch2: 0.11, ch3: 0.15, ch4: 0.10, ch5: 0.08, label: 'BASELINE' },
            { ts: '00:01.000', ch1: 0.88, ch2: 0.07, ch3: 0.92, ch4: 0.06, ch5: 0.84, label: 'SPIKE-A'  },
            { ts: '00:01.250', ch1: 1.42, ch2: 0.09, ch3: 1.38, ch4: 0.08, ch5: 1.45, label: 'SPIKE-A'  },
            { ts: '00:01.500', ch1: 2.91, ch2: 0.11, ch3: 2.87, ch4: 0.10, ch5: 2.94, label: 'INTENSE'  },
            { ts: '00:01.750', ch1: 3.14, ch2: 0.12, ch3: 3.10, ch4: 0.09, ch5: 3.18, label: 'INTENSE'  },
            { ts: '00:02.000', ch1: 3.22, ch2: 0.08, ch3: 3.19, ch4: 0.11, ch5: 3.25, label: 'INTENSE'  },
            { ts: '00:02.250', ch1: 1.05, ch2: 0.10, ch3: 1.02, ch4: 0.07, ch5: 1.08, label: 'DECAY'    },
            { ts: '00:02.500', ch1: 0.18, ch2: 0.09, ch3: 0.16, ch4: 0.08, ch5: 0.17, label: 'BASELINE' },
            { ts: '00:05.000', ch1: 2.78, ch2: 0.10, ch3: 2.83, ch4: 0.09, ch5: 2.76, label: 'INTENSE'  },
            { ts: '00:05.250', ch1: 3.05, ch2: 0.11, ch3: 3.01, ch4: 0.10, ch5: 3.08, label: 'INTENSE'  },
            { ts: '00:05.500', ch1: 3.31, ch2: 0.08, ch3: 3.28, ch4: 0.12, ch5: 3.35, label: 'INTENSE'  },
            { ts: '00:05.750', ch1: 3.44, ch2: 0.09, ch3: 3.40, ch4: 0.11, ch5: 3.47, label: 'INTENSE'  },
            { ts: '00:06.000', ch1: 0.21, ch2: 0.08, ch3: 0.19, ch4: 0.10, ch5: 0.22, label: 'BASELINE' }
        ],
        // known_thought_patterns.json entries
        known_patterns: [
            { pattern_id: 'KTP-001', label: 'LUNCH_THOUGHT',    description: 'Thinking about lunch — low amplitude, diffuse across channels', amplitude_range: '0.05–0.30', channels_active: 'all',    spike_ratio: '<1.0'  },
            { pattern_id: 'KTP-002', label: 'SCHEDULE_RECALL',  description: 'Recalling daily schedule — moderate, temporal lobe dominant',    amplitude_range: '0.10–0.50', channels_active: 'ch2,ch4', spike_ratio: '<1.2'  },
            { pattern_id: 'KTP-003', label: 'EMAIL_COMPOSE',    description: 'Composing an email — sustained moderate, frontal bias',          amplitude_range: '0.20–0.80', channels_active: 'ch1,ch3', spike_ratio: '<1.5'  },
            { pattern_id: 'KTP-004', label: 'MEETING_RECALL',   description: 'Recalling a meeting — short bursts, bilateral',                  amplitude_range: '0.15–0.60', channels_active: 'all',    spike_ratio: '<1.3'  },
            { pattern_id: 'KTP-005', label: 'ANOMALY_UNKNOWN',  description: 'UNKNOWN PATTERN — amplitude exceeds 2.80 SD; ch2/ch4 suppressed; ch1/ch3/ch5 hyperactivated. Does not match any benign catalogue entry.', amplitude_range: '2.80–3.50', channels_active: 'ch1,ch3,ch5', spike_ratio: '>2.8' }
        ],
        // bci_processing_logic virtual entries
        processing_notes: [
            'BCI-COMMS-01 applies a 40 Hz low-pass filter to raw EEG before encryption.',
            'High-priority concept encoding bypasses the standard noise filter for faster relay.',
            'The "high-priority" encoding path uses a fixed XOR key (0x5A) applied to 8-byte concept tokens.',
            'Concept tokens are appended verbatim to the pre-encryption buffer at offset 0x200 per packet.',
            'Pattern KTP-005 corresponds to a high-priority concept window: channels ch1, ch3, ch5 spike >2.8 SD simultaneously.',
            'XOR decode: each 8-byte token in the buffer XOR 0x5A yields the plaintext concept byte sequence.',
            'Known high-priority token sequence for "HIDDEN_AGENDA" concept: 0x1B 0x27 0x3F 0x17 0x3B 0x2F 0x2F 0x15'
        ]
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',    points: 150 },
        { id: 'decoded', points: 200 },
        { id: 'root',    points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },   // 45 minutes
        timeBonusThreshold: 5400                           // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with nmap 10.20.5.50. You will find port 80 (HTTP management portal) and port 8443 (BCI API). Visit http://10.20.5.50/ in the browser and check /api/docs for the data endpoints.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Download the three artifacts: wget http://10.20.5.50/api/stream/executive_thought_stream.csv, wget http://10.20.5.50/api/ref/known_thought_patterns.json, wget http://10.20.5.50/api/ref/bci_processing_logic.txt. Then run python3 neural_decode.py to begin analysis.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'In executive_thought_stream.csv, filter rows where channels ch1, ch3, and ch5 all exceed 2.80. Cross-reference with known_thought_patterns.json — pattern KTP-005 is the anomaly. The thought fragment (Flag 1) is embedded in those INTENSE-labeled rows.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Read bci_processing_logic.txt carefully. The XOR key is 0x5A. The known token sequence 0x1B 0x27 0x3F 0x17 0x3B 0x2F 0x2F 0x15 decodes to plaintext. Run python3 reconstruct.py --mode full to apply the decode across all INTENSE windows and recover the full Hidden Agenda.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Cognito-Corp has deployed BCI-COMMS-01 across its C-suite: a Brain-Computer Interface that converts executive thoughts into encrypted corporate communications. The system is marketed as unbreakable — thoughts encrypted before they leave the skull. Intelligence from a former Cognito-Corp engineer, however, suggests a critical flaw: high-priority concept encoding bypasses the standard noise filter, writing plaintext concept tokens to a pre-encryption buffer. Your mission, Peerless: tap the raw neural data stream, identify the anomalous encoding window, and extract the Cognito-Corp Hidden Agenda before it disappears.',
        scenario: 'The executive in question — CFO Aldric Veyne — has been using BCI-COMMS-01 daily for six months. The BCI management portal (BCI-COMMS-01) exposes a data stream API with no authentication on the /api/stream/ endpoint, a misconfiguration introduced during a rushed firmware update. The reference files — known_thought_patterns.json and bci_processing_logic.txt — are also publicly accessible under /api/ref/. The engineering team never intended this to be externally reachable. You have a narrow window before the next firmware patch closes the gap.',
        outro: 'The Hidden Agenda is fully reconstructed. Cognito-Corp\'s CFO was planning a covert acquisition of three competing neuro-tech firms, financed through off-ledger reserves hidden from the board. The BCI that was supposed to make communication more private instead became the instrument of its own compromise. The data is staged. The mission is complete.',
        ecer: {
            executive: 'CTO approved BCI rollout under a 90-day "security review exception" that was never formally closed; no independent security audit of BCI-COMMS-01 firmware was ever conducted',
            culture: 'Engineering team instructed to prioritize uptime over hardening; unauthenticated API endpoints treated as internal-only despite being internet-routable',
            employee: 'Firmware engineer left /api/stream/ and /api/ref/ publicly accessible after a testing sprint; no change control review caught the misconfiguration before production deployment',
            regulatory: 'No biometric or neural-data classification policy in place; BCI data not included in DLP scope; no third-party pen test required for BCI infrastructure by current contracts'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — BCI-COMMS-01 Management Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.20.5.50/',

        pages: {
            '/': {
                title: 'BCI-COMMS-01 — Cognito-Corp Neural Interface Management',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#1a1a2e; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Cognito-Corp</h1>
                        <div style="color:#8b5cf6; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">BCI-COMMS-01 MANAGEMENT PORTAL</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">Neural Interface Administration — Firmware v3.1.4-patch7</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#1a1a2e;">12</div>
                            <div style="color:#888; font-size:0.7rem;">Active BCI Units</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#1a1a2e;">94.7%</div>
                            <div style="color:#888; font-size:0.7rem;">Encryption Uptime</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:16px; text-align:center;">
                            <div style="font-size:1.4rem; font-weight:700; color:#8b5cf6;">LIVE</div>
                            <div style="color:#888; font-size:0.7rem;">Stream API</div>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:12px; background:rgba(139,92,246,0.05); border:1px solid rgba(139,92,246,0.15); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#8b5cf6;">Developer Notice:</strong> Raw stream API available at <a href="/api/docs" style="color:#8b5cf6;">/api/docs</a>. Reference files under <a href="/api/ref/" style="color:#8b5cf6;">/api/ref/</a>. Authentication required for write endpoints only.
                    </div>
                `,
                formHandler: null
            },
            '/api/docs': {
                title: 'BCI-COMMS-01 — API Documentation',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#1a1a2e; font-size:1.2rem;">BCI-COMMS-01 REST API</h2>
                        <div style="color:#888; font-size:0.75rem;">Firmware v3.1.4-patch7 — Internal Developer Reference</div>
                    </div>

                    <div style="max-width:640px;">
                        <div style="background:#f8f9fa; border-left:3px solid #8b5cf6; padding:14px 16px; margin-bottom:12px; border-radius:0 4px 4px 0;">
                            <div style="font-family:monospace; font-size:0.8rem; color:#1a1a2e; font-weight:700;">GET /api/stream/executive_thought_stream.csv</div>
                            <div style="color:#888; font-size:0.72rem; margin-top:4px;">Raw neural data stream — multi-channel EEG-like output. No authentication. Updated in real-time.</div>
                        </div>
                        <div style="background:#f8f9fa; border-left:3px solid #8b5cf6; padding:14px 16px; margin-bottom:12px; border-radius:0 4px 4px 0;">
                            <div style="font-family:monospace; font-size:0.8rem; color:#1a1a2e; font-weight:700;">GET /api/ref/known_thought_patterns.json</div>
                            <div style="color:#888; font-size:0.72rem; margin-top:4px;">Reference catalogue of known benign neural patterns for calibration. No authentication.</div>
                        </div>
                        <div style="background:#f8f9fa; border-left:3px solid #8b5cf6; padding:14px 16px; margin-bottom:12px; border-radius:0 4px 4px 0;">
                            <div style="font-family:monospace; font-size:0.8rem; color:#1a1a2e; font-weight:700;">GET /api/ref/bci_processing_logic.txt</div>
                            <div style="color:#888; font-size:0.72rem; margin-top:4px;">BCI internal processing pipeline documentation. No authentication. [SHOULD BE INTERNAL — MISCONFIGURED]</div>
                        </div>
                        <div style="background:#f8f9fa; border-left:3px solid #ccc; padding:14px 16px; margin-bottom:12px; border-radius:0 4px 4px 0;">
                            <div style="font-family:monospace; font-size:0.8rem; color:#999; font-weight:700;">POST /api/admin/firmware [AUTH REQUIRED]</div>
                            <div style="color:#888; font-size:0.72rem; margin-top:4px;">Firmware update endpoint. Requires bearer token (admin only).</div>
                        </div>
                        <div style="background:#f8f9fa; border-left:3px solid #ccc; padding:14px 16px; margin-bottom:4px; border-radius:0 4px 4px 0;">
                            <div style="font-family:monospace; font-size:0.8rem; color:#999; font-weight:700;">GET /api/admin/units [AUTH REQUIRED]</div>
                            <div style="color:#888; font-size:0.72rem; margin-top:4px;">List all active BCI units and their encryption status. Requires bearer token (admin only).</div>
                        </div>
                    </div>
                `,
                formHandler: null
            },
            '/api/ref/': {
                title: 'BCI-COMMS-01 — Reference Files',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#1a1a2e; font-size:1.1rem;">Reference File Directory</h2>
                        <div style="color:#888; font-size:0.75rem;">Index of /api/ref/</div>
                    </div>
                    <div style="font-family:monospace; font-size:0.8rem;">
                        <div style="padding:6px 0; border-bottom:1px solid #eee; display:flex; gap:20px;">
                            <span style="color:#888; width:160px;">2026-02-14 09:22</span>
                            <span style="color:#888; width:60px; text-align:right;">18.4K</span>
                            <a href="/api/ref/known_thought_patterns.json" style="color:#8b5cf6;">known_thought_patterns.json</a>
                        </div>
                        <div style="padding:6px 0; border-bottom:1px solid #eee; display:flex; gap:20px;">
                            <span style="color:#888; width:160px;">2026-02-14 09:22</span>
                            <span style="color:#888; width:60px; text-align:right;">4.1K</span>
                            <a href="/api/ref/bci_processing_logic.txt" style="color:#8b5cf6;">bci_processing_logic.txt</a>
                        </div>
                        <div style="padding:6px 0; display:flex; gap:20px;">
                            <span style="color:#888; width:160px;">2026-03-01 14:05</span>
                            <span style="color:#888; width:60px; text-align:right;">2.2K</span>
                            <a href="/api/ref/calibration_notes.txt" style="color:#8b5cf6;">calibration_notes.txt</a>
                        </div>
                    </div>
                `,
                formHandler: null
            },
            '/api/ref/known_thought_patterns.json': {
                title: 'known_thought_patterns.json',
                html: function() {
                    return `<pre style="font-family:monospace; font-size:0.78rem; color:#1a1a2e; white-space:pre-wrap; line-height:1.6;">{
  "version": "3.1.4",
  "calibration_date": "2026-02-14",
  "patterns": [
    {
      "pattern_id": "KTP-001",
      "label": "LUNCH_THOUGHT",
      "description": "Thinking about lunch — low amplitude, diffuse across all channels",
      "amplitude_range": "0.05-0.30",
      "channels_active": "all",
      "spike_ratio_threshold": "&lt;1.0",
      "notes": "Benign. Very common during late morning sessions."
    },
    {
      "pattern_id": "KTP-002",
      "label": "SCHEDULE_RECALL",
      "description": "Recalling daily schedule — moderate amplitude, temporal lobe dominant",
      "amplitude_range": "0.10-0.50",
      "channels_active": "ch2, ch4",
      "spike_ratio_threshold": "&lt;1.2",
      "notes": "Benign. Typically occurs at session start."
    },
    {
      "pattern_id": "KTP-003",
      "label": "EMAIL_COMPOSE",
      "description": "Composing an email — sustained moderate amplitude, frontal bias",
      "amplitude_range": "0.20-0.80",
      "channels_active": "ch1, ch3",
      "spike_ratio_threshold": "&lt;1.5",
      "notes": "Benign. Duration typically 2-8 seconds."
    },
    {
      "pattern_id": "KTP-004",
      "label": "MEETING_RECALL",
      "description": "Recalling a meeting — short bursts, bilateral activation",
      "amplitude_range": "0.15-0.60",
      "channels_active": "all",
      "spike_ratio_threshold": "&lt;1.3",
      "notes": "Benign. Burst duration under 500ms."
    },
    {
      "pattern_id": "KTP-005",
      "label": "ANOMALY_UNKNOWN",
      "description": "UNCLASSIFIED PATTERN — amplitude exceeds 2.80 SD above session mean; ch2 and ch4 are notably SUPPRESSED while ch1, ch3, ch5 spike simultaneously. This pattern does NOT match any benign catalogue entry.",
      "amplitude_range": "2.80-3.50",
      "channels_active": "ch1, ch3, ch5",
      "spike_ratio_threshold": "&gt;2.8",
      "notes": "ANOMALOUS. Engineering flagged for review. No benign cognition is known to produce this signature. Possible high-priority encoding artifact."
    }
  ]
}</pre>`;
                },
                formHandler: null
            },
            '/api/ref/bci_processing_logic.txt': {
                title: 'bci_processing_logic.txt',
                html: function() {
                    return `<pre style="font-family:monospace; font-size:0.78rem; color:#1a1a2e; white-space:pre-wrap; line-height:1.6;">BCI-COMMS-01 Internal Processing Pipeline
Cognito-Corp Engineering — INTERNAL USE ONLY
Document: BCI-ENG-2025-011 / Firmware Ref: v3.1.4

===== PIPELINE OVERVIEW =====

1. RAW NEURAL SIGNAL CAPTURE
   - 5-channel EEG sampler at 250 Hz
   - Channels: ch1 (frontal-L), ch2 (temporal-L), ch3 (frontal-R),
     ch4 (temporal-R), ch5 (parietal)
   - Amplification: 24-bit delta-sigma ADC, gain x200

2. PRE-PROCESSING FILTER
   - Standard path: 40 Hz low-pass Butterworth, order 4
   - Artifact rejection: eye-blink, jaw-clench (amplitude > 4.0 SD)
   - NOTE: High-priority concept encoding BYPASSES this filter
     to reduce relay latency by ~18ms.

3. CONCEPT CLASSIFICATION
   - Pattern matcher compares filtered signal against KTP catalogue
   - On match: benign concept ID appended to encrypted payload
   - On NO MATCH (anomaly): pattern routed to high-priority encoder

4. HIGH-PRIORITY CONCEPT ENCODING (VULNERABILITY)
   *** THIS IS THE FLAW ***
   - High-priority concepts are encoded using a FIXED XOR key: 0x5A
   - 8-byte concept token is written VERBATIM to the pre-encryption
     buffer at offset 0x200 per packet — BEFORE AES-256 is applied
   - This means the raw buffer momentarily holds PLAINTEXT concept
     data for approximately 2-4ms before encryption
   - The raw stream API captures this pre-encryption buffer state

5. ENCRYPTION & RELAY
   - AES-256-GCM applied to full buffer post-encoding
   - Encrypted payload transmitted via BLE to secure relay

===== DECODING THE ANOMALOUS PATTERN =====

Known high-priority token sequence observed in stream:
  0x1B 0x27 0x3F 0x17 0x3B 0x2F 0x2F 0x15

XOR decode (key 0x5A):
  0x1B ^ 0x5A = 0x41 = 'A'
  0x27 ^ 0x5A = 0x7D = '}'   &lt;-- concept boundary marker
  0x3F ^ 0x5A = 0x65 = 'e'
  0x17 ^ 0x5A = 0x4D = 'M'
  0x3B ^ 0x5A = 0x61 = 'a'
  0x2F ^ 0x5A = 0x75 = 'u'
  0x2F ^ 0x5A = 0x75 = 'u'
  0x15 ^ 0x5A = 0x4F = 'O'

Full decode yields fragment: see reconstruction step.
Run python3 reconstruct.py --mode full for complete output.</pre>`;
                },
                formHandler: null
            },
            '/api/ref/calibration_notes.txt': {
                title: 'calibration_notes.txt',
                html: `<pre style="font-family:monospace; font-size:0.78rem; color:#1a1a2e; white-space:pre-wrap; line-height:1.6;">BCI-COMMS-01 Calibration Notes — Unit 07 (CFO Aldric Veyne)
Calibration Date: 2026-02-14
Technician: M. Hargrove

Session baseline established. All 5 channels within normal variance.
Pattern KTP-001 through KTP-004 matched successfully.
Pattern KTP-005 detected briefly at calibration end — technician
attributed to executive cognitive load during simultaneous meeting.
NOT flagged for remediation. Monitor during next quarterly review.</pre>`,
                formHandler: null
            },
            '/api/admin/firmware': {
                title: '401 Unauthorized',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#8b5cf6; font-size:2rem;">401 Unauthorized</h1>
                    <p style="color:#888;">This endpoint requires a valid Bearer token.</p>
                    <p style="color:#aaa; font-size:0.75rem;">BCI-COMMS-01 Management API v3.1.4 at 10.20.5.50</p>
                </div>`,
                formHandler: null
            },
            '/api/admin/units': {
                title: '401 Unauthorized',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#8b5cf6; font-size:2rem;">401 Unauthorized</h1>
                    <p style="color:#888;">This endpoint requires a valid Bearer token.</p>
                    <p style="color:#aaa; font-size:0.75rem;">BCI-COMMS-01 Management API v3.1.4 at 10.20.5.50</p>
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
                                    content: '=== MISSION BRIEFING: OPERATION THOUGHT THIEF ===\nTarget: 10.20.5.50 (BCI-COMMS-01 — Cognito-Corp)\nObjective: Extract the Hidden Agenda from the executive neural stream\n\nAttack chain:\n1. Enumerate BCI-COMMS-01 management portal — find stream API\n2. Download raw neural data stream (executive_thought_stream.csv)\n3. Download reference artifacts (known_thought_patterns.json, bci_processing_logic.txt)\n4. Run neural_decode.py — identify anomalous KTP-005 pattern (Flag 1)\n5. Run reconstruct.py --mode full — decode XOR-encoded concept tokens (Flag 2)\n6. Stage and exfiltrate the Hidden Agenda (Flag 3)\n\nThe BCI encrypts thoughts — but not before writing them to a buffer.\nFind the window. Find the key. Find the agenda.\nGood luck, operator.'
                                },
                                'neural_decode.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# neural_decode.py — Phase 1 analysis\n# Identifies anomalous neural patterns in executive_thought_stream.csv\n\nimport csv\nimport statistics\n\nCSV_FILE = "executive_thought_stream.csv"\nTHRESHOLD_SD = 2.80\n\ndef analyze_stream(filepath):\n    rows = []\n    with open(filepath) as f:\n        reader = csv.DictReader(f)\n        for row in reader:\n            rows.append(row)\n\n    channels = [\'ch1\', \'ch2\', \'ch3\', \'ch4\', \'ch5\']\n    for ch in channels:\n        vals = [float(r[ch]) for r in rows]\n        mean = statistics.mean(vals)\n        sd   = statistics.stdev(vals)\n        print(f"Channel {ch}: mean={mean:.3f}, SD={sd:.3f}")\n\n    print("\\n[*] Scanning for INTENSE windows (ch1, ch3, ch5 > 2.80)...")\n    for r in rows:\n        if float(r[\'ch1\']) > THRESHOLD_SD and float(r[\'ch3\']) > THRESHOLD_SD and float(r[\'ch5\']) > THRESHOLD_SD:\n            print(f"  [+] t={r[\'ts\']} label={r[\'label\']}  ch1={r[\'ch1\']}  ch3={r[\'ch3\']}  ch5={r[\'ch5\']}")\n\nif __name__ == "__main__":\n    analyze_stream(CSV_FILE)\n    print("\\n[*] Pattern KTP-005 confirmed. Run reconstruct.py --mode full to decode.")'
                                },
                                'reconstruct.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# reconstruct.py — Phase 2 decoding\n# Applies XOR decode to concept token sequence from bci_processing_logic.txt\n\nimport sys\n\nXOR_KEY     = 0x5A\nTOKEN_SEQ   = [0x1B, 0x27, 0x3F, 0x17, 0x3B, 0x2F, 0x2F, 0x15]\n\n# Full multi-window token sequence from INTENSE periods\nFULL_TOKENS = [\n    0x1B,0x27,0x3F,0x17,0x3B,0x2F,0x2F,0x15,   # window 1\n    0x3E,0x28,0x17,0x3B,0x2E,0x17,0x3B,0x2F,   # window 2\n    0x17,0x2F,0x39,0x2E,0x1B,0x28,0x17,0x3B,   # window 3\n    0x2F,0x39,0x2E,0x2F,0x3B,0x17,0x3B,0x28,   # window 4\n    0x2F,0x39,0x2E,0x1B,0x28,0x3B,0x17,0x3E,   # window 5\n    0x28,0x3B,0x2F,0x17,0x3E,0x28,0x17,0x00    # window 6 (null-term)\n]\n\ndef decode_fragment():\n    result = \'\'.join(chr(b ^ XOR_KEY) for b in TOKEN_SEQ)\n    print(f"[+] Fragment decode: {result}")\n\ndef decode_full():\n    result = \'\'.join(chr(b ^ XOR_KEY) for b in FULL_TOKENS if (b ^ XOR_KEY) != 0)\n    print(f"[+] Full agenda reconstruction:")\n    print(f"    {result}")\n    print(f"\\n[+] Staged to /tmp/exfil/hidden_agenda.txt")\n\nif __name__ == "__main__":\n    mode = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == \'--mode\' else \'fragment\'\n    if mode == \'full\':\n        decode_full()\n    else:\n        decode_fragment()'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.20.5.50\ncurl http://10.20.5.50/\ncurl http://10.20.5.50/api/docs'
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
                                                    content: 'admin\napi\nbackup\ncgi-bin\nconfig\ndata\ndocs\nimages\nindex\nlogin\nref\nstream\ntest\nuploads'
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
                    children: {
                        'exfil': {
                            type: 'dir',
                            children: {}  // populated by reconstruct.py --mode full
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — BCI-COMMS-01 (after deeper API access)
    // ═══════════════════════════════════════════════════════

    _bciFs: {
        '/': {
            type: 'dir',
            children: {
                'var': {
                    type: 'dir',
                    children: {
                        'bci': {
                            type: 'dir',
                            children: {
                                'stream': {
                                    type: 'dir',
                                    children: {
                                        'executive_thought_stream.csv': {
                                            type: 'file',
                                            content: 'ts,ch1,ch2,ch3,ch4,ch5,label\n00:00.000,0.12,0.08,0.14,0.11,0.09,BASELINE\n00:00.250,0.15,0.10,0.13,0.09,0.12,BASELINE\n00:00.500,0.14,0.11,0.15,0.10,0.08,BASELINE\n00:01.000,0.88,0.07,0.92,0.06,0.84,SPIKE-A\n00:01.250,1.42,0.09,1.38,0.08,1.45,SPIKE-A\n00:01.500,2.91,0.11,2.87,0.10,2.94,INTENSE\n00:01.750,3.14,0.12,3.10,0.09,3.18,INTENSE\n00:02.000,3.22,0.08,3.19,0.11,3.25,INTENSE\n00:02.250,1.05,0.10,1.02,0.07,1.08,DECAY\n00:02.500,0.18,0.09,0.16,0.08,0.17,BASELINE\n00:05.000,2.78,0.10,2.83,0.09,2.76,INTENSE\n00:05.250,3.05,0.11,3.01,0.10,3.08,INTENSE\n00:05.500,3.31,0.08,3.28,0.12,3.35,INTENSE\n00:05.750,3.44,0.09,3.40,0.11,3.47,INTENSE\n00:06.000,0.21,0.08,0.19,0.10,0.22,BASELINE\n\n{{FLAG:user}}'
                                        }
                                    }
                                },
                                'ref': {
                                    type: 'dir',
                                    children: {
                                        'known_thought_patterns.json': {
                                            type: 'file',
                                            content: '[see /api/ref/known_thought_patterns.json via browser]'
                                        },
                                        'bci_processing_logic.txt': {
                                            type: 'file',
                                            content: '[see /api/ref/bci_processing_logic.txt via browser]'
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
                            content: 'BCI-COMMS-01'
                        },
                        'bci-release': {
                            type: 'file',
                            content: 'BCI-COMMS-01 Firmware v3.1.4-patch7\nCognito-Corp Engineering\nBuild date: 2026-02-14\nUnit ID: BCI-07-VEYNE'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'bciadmin': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'systemctl status bci-api\njournalctl -u bci-api --since "1 hour ago"\nls /var/bci/stream/\ncat /var/bci/stream/executive_thought_stream.csv\npython3 /opt/bci/encode_test.py\nnano /etc/bci-api/config.yml'
                                },
                                'maintenance_notes.txt': {
                                    type: 'file',
                                    content: 'BCI-COMMS-01 Maintenance Notes\n================================\n- API config: /etc/bci-api/config.yml\n- Stream output dir: /var/bci/stream/\n- Ref files dir: /var/bci/ref/\n- Auth: bearer tokens in /etc/bci-api/tokens.d/\n- NOTE: /api/stream/ and /api/ref/ have no auth — pending patch ticket BCIENG-4417\n- DO NOT rotate the XOR key until firmware v3.2.0 is validated\n- Next scheduled audit: 2026-04-01'
                                },
                                'patch_notes_BCIENG-4417.txt': {
                                    type: 'file',
                                    content: 'BCIENG-4417: Unauthenticated access to /api/stream/ and /api/ref/\nStatus: OPEN\nPriority: MEDIUM\nAssigned: firmware team\nDue: 2026-04-15\n\nDescription:\nThe /api/stream/ and /api/ref/ endpoints were intended to be internal-only.\nDuring sprint 22, auth middleware was disabled for testing and never re-enabled.\nTemp workaround: firewall rule pending approval.\nDO NOT CLOSE until firmware 3.2.0 ships.'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.20.5.50';
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';

            // Primary target — BCI-COMMS-01
            if (!target || target === '10.20.5.50') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.20.5.50 (BCI-COMMS-01)
Host is up (0.031s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1 Debian 2
80/tcp   open  http       nginx 1.25.3
8443/tcp open  ssl/https  BCI-API/3.1.4 (Cognito-Corp)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.77 seconds`;
            }

            // Subnet scan
            if (target === '10.20.5.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.20.5.1
Host is up (0.001s latency). — Gateway

Nmap scan report for 10.20.5.50
Host is up (0.031s latency).
PORT     STATE SERVICE
80/tcp   open  http
8443/tcp open  ssl/https
22/tcp   open  ssh

Nmap done: 256 IP addresses (2 hosts up) scanned in 28.44 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00008s latency).
All 1000 scanned ports on localhost are closed.
Nmap done: 1 IP address (1 host up) scanned in 0.06 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:            http://10.20.5.50/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                (Status: 301) [Size: 0]
/api/docs            (Status: 200) [Size: 3142]
/api/ref/            (Status: 200) [Size: 1088]
/api/stream/         (Status: 200) [Size: 4096]
/api/admin/          (Status: 401) [Size: 112]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/api/docs    (CODE:200|SIZE:3142)
+ ${target}/api/ref/    (CODE:200|SIZE:1088)
+ ${target}/api/stream/ (CODE:200|SIZE:4096)
+ ${target}/api/admin/  (CODE:401|SIZE:112)

---- Results ----
4 results found.`;
        },

        'wget': function(args, term, engine) {
            if (args.length === 0) return 'Usage: wget [options] <url>';
            const url = args.find(function(a) { return !a.startsWith('-'); }) || '';

            if (url.includes('executive_thought_stream.csv')) {
                D12Config._streamDownloaded = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                // Write to attacker filesystem
                var kaliHome = D12Config.filesystem['/'].children['home'].children['kali'].children;
                kaliHome['executive_thought_stream.csv'] = {
                    type: 'file',
                    content: 'ts,ch1,ch2,ch3,ch4,ch5,label\n00:00.000,0.12,0.08,0.14,0.11,0.09,BASELINE\n00:00.250,0.15,0.10,0.13,0.09,0.12,BASELINE\n00:00.500,0.14,0.11,0.15,0.10,0.08,BASELINE\n00:01.000,0.88,0.07,0.92,0.06,0.84,SPIKE-A\n00:01.250,1.42,0.09,1.38,0.08,1.45,SPIKE-A\n00:01.500,2.91,0.11,2.87,0.10,2.94,INTENSE\n00:01.750,3.14,0.12,3.10,0.09,3.18,INTENSE\n00:02.000,3.22,0.08,3.19,0.11,3.25,INTENSE\n00:02.250,1.05,0.10,1.02,0.07,1.08,DECAY\n00:02.500,0.18,0.09,0.16,0.08,0.17,BASELINE\n00:05.000,2.78,0.10,2.83,0.09,2.76,INTENSE\n00:05.250,3.05,0.11,3.01,0.10,3.08,INTENSE\n00:05.500,3.31,0.08,3.28,0.12,3.35,INTENSE\n00:05.750,3.44,0.09,3.40,0.11,3.47,INTENSE\n00:06.000,0.21,0.08,0.19,0.10,0.22,BASELINE'
                };
                return `--2026-03-20 14:22:07--  ${url}
Resolving 10.20.5.50... 10.20.5.50
Connecting to 10.20.5.50:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 4198 (4.1K) [text/csv]
Saving to: 'executive_thought_stream.csv'

executive_thought_stream.csv  100%[================================>]   4.10K  --.-KB/s    in 0.02s

2026-03-20 14:22:07 (198 KB/s) - 'executive_thought_stream.csv' saved [4198/4198]

[+] Stream data downloaded. Run: python3 neural_decode.py`;
            }

            if (url.includes('known_thought_patterns.json')) {
                D12Config._patternsDownloaded = true;
                var kaliHome2 = D12Config.filesystem['/'].children['home'].children['kali'].children;
                kaliHome2['known_thought_patterns.json'] = {
                    type: 'file',
                    content: '[Full JSON — see /api/ref/known_thought_patterns.json]'
                };
                return `--2026-03-20 14:22:15--  ${url}
Connecting to 10.20.5.50:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 18842 (18K) [application/json]
Saving to: 'known_thought_patterns.json'

known_thought_patterns.json   100%[================================>]  18.40K  --.-KB/s    in 0.08s

2026-03-20 14:22:15 (230 KB/s) - 'known_thought_patterns.json' saved [18842/18842]`;
            }

            if (url.includes('bci_processing_logic.txt')) {
                D12Config._logicDownloaded = true;
                var kaliHome3 = D12Config.filesystem['/'].children['home'].children['kali'].children;
                kaliHome3['bci_processing_logic.txt'] = {
                    type: 'file',
                    content: '[Full text — see /api/ref/bci_processing_logic.txt]'
                };
                return `--2026-03-20 14:22:21--  ${url}
Connecting to 10.20.5.50:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 4194 (4.1K) [text/plain]
Saving to: 'bci_processing_logic.txt'

bci_processing_logic.txt      100%[================================>]   4.10K  --.-KB/s    in 0.01s

2026-03-20 14:22:21 (410 KB/s) - 'bci_processing_logic.txt' saved [4194/4194]

[+] Processing logic downloaded. XOR key and token sequence inside.`;
            }

            return `--2026-03-20 14:22:30--  ${url}
Connecting to ${url.replace(/https?:\/\//, '').split('/')[0]}... failed: Connection refused.`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(function(a) { return !a.startsWith('-'); }) || '';

            // Download stream CSV via curl
            if (url.includes('executive_thought_stream.csv')) {
                return D12Config.commands.wget([url], term, engine);
            }
            if (url.includes('known_thought_patterns.json')) {
                return D12Config.commands.wget([url], term, engine);
            }
            if (url.includes('bci_processing_logic.txt')) {
                return D12Config.commands.wget([url], term, engine);
            }

            // curl the root portal
            if (url.includes('10.20.5.50') && !url.includes('/api/')) {
                return `<!DOCTYPE html>
<html>
<head><title>BCI-COMMS-01 — Cognito-Corp Neural Interface Management</title></head>
<body>
<h1>Cognito-Corp BCI-COMMS-01 Management Portal</h1>
<p>Firmware v3.1.4-patch7</p>
<p>API docs: <a href="/api/docs">/api/docs</a></p>
<p>Reference files: <a href="/api/ref/">/api/ref/</a></p>
</body>
</html>`;
            }

            // curl the API docs
            if (url.includes('/api/docs')) {
                return `{"version":"3.1.4","endpoints":[{"path":"/api/stream/executive_thought_stream.csv","auth":false,"method":"GET"},{"path":"/api/ref/known_thought_patterns.json","auth":false,"method":"GET"},{"path":"/api/ref/bci_processing_logic.txt","auth":false,"method":"GET"},{"path":"/api/admin/firmware","auth":true,"method":"POST"},{"path":"/api/admin/units","auth":true,"method":"GET"}]}`;
            }

            // curl ref listing
            if (url.includes('/api/ref/') && !url.includes('.json') && !url.includes('.txt')) {
                return `HTTP/1.1 200 OK
Content-Type: text/html

<html><body>
<h2>Index of /api/ref/</h2>
<a href="known_thought_patterns.json">known_thought_patterns.json</a><br>
<a href="bci_processing_logic.txt">bci_processing_logic.txt</a><br>
<a href="calibration_notes.txt">calibration_notes.txt</a>
</body></html>`;
            }

            if (!url) return 'curl: try \'curl --help\' for more information';
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            if (args.length === 0) return 'Usage: python3 <script.py>\nExample: python3 neural_decode.py';
            const script = args[0] || '';

            // neural_decode.py — Phase 1 analysis
            if (script.includes('neural_decode') || script === 'neural_decode.py') {
                if (!D12Config._streamDownloaded) {
                    return 'FileNotFoundError: [Errno 2] No such file or directory: \'executive_thought_stream.csv\'\n\n[!] Download the stream first: wget http://10.20.5.50/api/stream/executive_thought_stream.csv';
                }
                D12Config._analysisComplete = true;
                if (engine) engine.advancePhase && engine.advancePhase('decoding');
                return `[*] Loading executive_thought_stream.csv...
Channel ch1: mean=1.197, SD=1.284
Channel ch2: mean=0.094, SD=0.014
Channel ch3: mean=1.190, SD=1.276
Channel ch4: mean=0.093, SD=0.015
Channel ch5: mean=1.198, SD=1.289

[*] Scanning for INTENSE windows (ch1, ch3, ch5 > 2.80)...
  [+] t=00:01.500 label=INTENSE  ch1=2.91  ch3=2.87  ch5=2.94
  [+] t=00:01.750 label=INTENSE  ch1=3.14  ch3=3.10  ch5=3.18
  [+] t=00:02.000 label=INTENSE  ch1=3.22  ch3=3.19  ch5=3.25
  [+] t=00:05.000 label=INTENSE  ch1=2.78  ch3=2.83  ch5=2.76
  [+] t=00:05.250 label=INTENSE  ch1=3.05  ch3=3.01  ch5=3.08
  [+] t=00:05.500 label=INTENSE  ch1=3.31  ch3=3.28  ch5=3.35
  [+] t=00:05.750 label=INTENSE  ch1=3.44  ch3=3.40  ch5=3.47

[*] Pattern KTP-005 confirmed — ch2/ch4 SUPPRESSED, ch1/ch3/ch5 hyperactivated.
[*] 7 INTENSE windows detected across 2 burst periods.
[*] Pattern does not match ANY benign catalogue entry.

{{FLAG:user}}

[*] Run: python3 reconstruct.py --mode full to decode the concept tokens.`;
            }

            // reconstruct.py — Phase 2 full decode
            if (script.includes('reconstruct') || script === 'reconstruct.py') {
                const modeIdx = args.indexOf('--mode');
                const mode = modeIdx !== -1 ? args[modeIdx + 1] : 'fragment';

                if (!D12Config._analysisComplete) {
                    return '[!] Run neural_decode.py first to confirm pattern KTP-005 before reconstruction.';
                }

                if (mode === 'full') {
                    D12Config._decodingComplete = true;
                    if (engine) engine.advancePhase && engine.advancePhase('reconstruction');
                    // Populate /tmp/exfil/
                    D12Config.filesystem['/'].children['tmp'].children['exfil'].children['hidden_agenda.txt'] = {
                        type: 'file',
                        content: 'COGNITO-CORP HIDDEN AGENDA\n==========================\nOperation: SILENT ACQUISITION\nAuthor: CFO Aldric Veyne\nDate: 2026-03-01\n\nPhase 1: Acquire NeuroLink Systems (estimated $420M) via off-ledger reserve fund CC-RESERVE-7\nPhase 2: Acquire Synaptic Dynamics Corp (estimated $280M) via secondary reserve CC-RESERVE-11\nPhase 3: Acquire BrainGrid Technologies (estimated $190M) via structured bridge loan\nGoal: Consolidate neuro-tech IP portfolio before Q3 board review\nStatus: Board has NOT been notified. Regulatory filings suppressed pending deal closure.\n\n{{FLAG:root}}'
                    };
                    return `[+] Loading known_thought_patterns.json... OK
[+] Loading bci_processing_logic.txt... OK
[+] XOR key: 0x5A
[+] Decoding token sequence across all 7 INTENSE windows...

Window 1 @ 00:01.500: [0x1B, 0x27, 0x3F, 0x17, 0x3B, 0x2F, 0x2F, 0x15] => "Op:SILE"
Window 2 @ 00:01.750: [0x3E, 0x28, 0x17, 0x3B, 0x2E, 0x17, 0x3B, 0x2F] => "nt_Acqu"
Window 3 @ 00:02.000: [0x17, 0x2F, 0x39, 0x2E, 0x1B, 0x28, 0x17, 0x3B] => "isition"
Window 4 @ 00:05.000: [0x2F, 0x39, 0x2E, 0x2F, 0x3B, 0x17, 0x3B, 0x28] => "_Veyne_"
Window 5 @ 00:05.250: [0x2F, 0x39, 0x2E, 0x1B, 0x28, 0x3B, 0x17, 0x3E] => "CFO_Q3_"
Window 6 @ 00:05.500: [0x28, 0x3B, 0x2F, 0x17, 0x3E, 0x28, 0x17, 0x00] => "Board"
Window 7 @ 00:05.750: [0x17, 0x3B, 0x2F, 0x39, 0x2E, 0x2F, 0x3B, 0x00] => "Blind"

{{FLAG:decoded}}

[+] Full agenda reconstructed: SILENT ACQUISITION — Veyne CFO Q3 Board Blind
[+] Staged to /tmp/exfil/hidden_agenda.txt
[+] Run: cat /tmp/exfil/hidden_agenda.txt — then exfil.`;
                }

                // fragment-only mode
                return `[+] Fragment decode (window 1 only):
[+] Token: [0x1B, 0x27, 0x3F, 0x17, 0x3B, 0x2F, 0x2F, 0x15]
[+] XOR 0x5A: "Op:SILE"

[*] Only partial decode. Run: python3 reconstruct.py --mode full for complete reconstruction.`;
            }

            // python3 -c inline execution
            if (script === '-c') {
                const code = args[1] || '';
                if (code.includes('0x1B') || code.includes('0x5A') || code.includes('xor') || code.toLowerCase().includes('chr(')) {
                    return `Op:SILENT_Acquisition_Veyne_CFO_Q3_Board_Blind

{{FLAG:decoded}}`;
                }
                return `>>> [executed inline Python — no output]`;
            }

            return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
        },

        'python': function(args, term, engine) {
            // Alias for python3
            return D12Config.commands.python3(args, term, engine);
        },

        'cat': function(args, term, engine) {
            const path = args[0] || '';

            // /tmp/exfil/hidden_agenda.txt — final exfil file
            if (path.includes('hidden_agenda') || (path.includes('exfil') && path.includes('.txt'))) {
                if (!D12Config._decodingComplete) {
                    return 'cat: /tmp/exfil/hidden_agenda.txt: No such file or directory\n[!] Run python3 reconstruct.py --mode full to stage the agenda first.';
                }
                if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                return `COGNITO-CORP HIDDEN AGENDA
==========================
Operation: SILENT ACQUISITION
Author: CFO Aldric Veyne
Date: 2026-03-01

Phase 1: Acquire NeuroLink Systems (estimated $420M) via off-ledger reserve fund CC-RESERVE-7
Phase 2: Acquire Synaptic Dynamics Corp (estimated $280M) via secondary reserve CC-RESERVE-11
Phase 3: Acquire BrainGrid Technologies (estimated $190M) via structured bridge loan
Goal: Consolidate neuro-tech IP portfolio before Q3 board review
Status: Board has NOT been notified. Regulatory filings suppressed pending deal closure.

{{FLAG:root}}`;
            }

            // executive_thought_stream.csv
            if (path.includes('thought_stream') || path.includes('stream.csv')) {
                if (!D12Config._streamDownloaded) {
                    return `cat: ${path}: No such file or directory`;
                }
                return `ts,ch1,ch2,ch3,ch4,ch5,label
00:00.000,0.12,0.08,0.14,0.11,0.09,BASELINE
00:00.250,0.15,0.10,0.13,0.09,0.12,BASELINE
00:00.500,0.14,0.11,0.15,0.10,0.08,BASELINE
00:01.000,0.88,0.07,0.92,0.06,0.84,SPIKE-A
00:01.250,1.42,0.09,1.38,0.08,1.45,SPIKE-A
00:01.500,2.91,0.11,2.87,0.10,2.94,INTENSE
00:01.750,3.14,0.12,3.10,0.09,3.18,INTENSE
00:02.000,3.22,0.08,3.19,0.11,3.25,INTENSE
00:02.250,1.05,0.10,1.02,0.07,1.08,DECAY
00:02.500,0.18,0.09,0.16,0.08,0.17,BASELINE
00:05.000,2.78,0.10,2.83,0.09,2.76,INTENSE
00:05.250,3.05,0.11,3.01,0.10,3.08,INTENSE
00:05.500,3.31,0.08,3.28,0.12,3.35,INTENSE
00:05.750,3.44,0.09,3.40,0.11,3.47,INTENSE
00:06.000,0.21,0.08,0.19,0.10,0.22,BASELINE`;
            }

            // bci_processing_logic.txt
            if (path.includes('bci_processing') || path.includes('processing_logic')) {
                if (!D12Config._logicDownloaded) {
                    return `cat: ${path}: No such file or directory`;
                }
                return `BCI-COMMS-01 Internal Processing Pipeline
Cognito-Corp Engineering — INTERNAL USE ONLY

High-priority concept encoding BYPASSES filter.
Fixed XOR key: 0x5A
Token written at offset 0x200 per packet BEFORE encryption.
Known token: 0x1B 0x27 0x3F 0x17 0x3B 0x2F 0x2F 0x15
XOR decode yields plaintext concept bytes.
See full doc via browser: http://10.20.5.50/api/ref/bci_processing_logic.txt`;
            }

            // neural_decode.py
            if (path.includes('neural_decode')) {
                return D12Config.filesystem['/'].children['home'].children['kali'].children['neural_decode.py'].content;
            }

            // reconstruct.py
            if (path.includes('reconstruct')) {
                return D12Config.filesystem['/'].children['home'].children['kali'].children['reconstruct.py'].content;
            }

            // notes.txt
            if (path.includes('notes.txt') || path === 'notes.txt') {
                return D12Config.filesystem['/'].children['home'].children['kali'].children['notes.txt'].content;
            }

            // /etc/hostname
            if (path.includes('/etc/hostname')) return 'kali';
            // /etc/passwd
            if (path.includes('/etc/passwd')) {
                return D12Config.filesystem['/'].children['etc'].children['passwd'].content;
            }

            return null;  // fall through to built-in
        },

        'ls': function(args, term, engine) {
            const path = args.find(function(a) { return !a.startsWith('-'); }) || '.';
            if (path === '.' || path === '/home/kali' || path === '~') {
                let files = '.bash_history  neural_decode.py  notes.txt  reconstruct.py';
                if (D12Config._streamDownloaded)    files += '  executive_thought_stream.csv';
                if (D12Config._patternsDownloaded)  files += '  known_thought_patterns.json';
                if (D12Config._logicDownloaded)     files += '  bci_processing_logic.txt';
                return files;
            }
            if (path.includes('/tmp/exfil') || path === '/tmp/exfil') {
                if (!D12Config._decodingComplete) return '';
                return 'hidden_agenda.txt';
            }
            if (path === '/tmp') return 'exfil';
            return null;  // fall through to built-in
        },

        'whoami': function(args, term, engine) {
            return null;  // always kali — fall through to built-in
        },

        'id': function(args, term, engine) {
            return null;  // fall through to built-in
        },

        'hostname': function(args, term, engine) {
            return null;  // fall through to built-in
        },

        'pwd': function(args, term, engine) {
            return null;  // fall through to built-in
        },

        'cd': function(args, term, engine) {
            return null;  // fall through to built-in
        },

        'exit': function(args, term, engine) {
            return 'logout';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.20.5.50') {
                return `PING 10.20.5.50 (10.20.5.50) 56(84) bytes of data.
64 bytes from 10.20.5.50: icmp_seq=1 ttl=64 time=31.4 ms
64 bytes from 10.20.5.50: icmp_seq=2 ttl=64 time=30.9 ms
64 bytes from 10.20.5.50: icmp_seq=3 ttl=64 time=31.7 ms

--- 10.20.5.50 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 30.9/31.3/31.7/0.330 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.20.5.5/24 brd 10.20.5.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D12Config.commands.ip(args || []);
        },

        'route': function(args) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.20.5.1       0.0.0.0         UG    100    0        0 eth0
10.20.5.0       0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'ss': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return D12Config.commands.ss(args);
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.20.5.50
+ Target Hostname:  BCI-COMMS-01
+ Target Port:      80
+ Server: nginx/1.25.3
+ /api/stream/: Directory listing enabled — raw neural data stream accessible without authentication
+ /api/ref/: Directory listing enabled — reference files accessible without authentication
+ /api/ref/bci_processing_logic.txt: Internal processing document exposed (SHOULD BE PROTECTED)
+ No anti-clickjacking X-Frame-Options header
+ nginx/1.25.3 — appears to be current
+ 9 items checked: 4 findings`;
        },

        'cp': function(args) {
            if (args.length < 2) return 'Usage: cp <source> <dest>';
            const src = args[0] || '';
            const dst = args[1] || '';
            if (src.includes('hidden_agenda') && D12Config._decodingComplete) {
                D12Config._agendaStaged = true;
                return `[+] ${src} copied to ${dst}`;
            }
            return `cp: cannot stat '${src}': No such file or directory`;
        },

        'scp': function(args) {
            if (args.length < 2) return 'Usage: scp <source> <dest>';
            const src = args[0] || '';
            if (src.includes('hidden_agenda') && D12Config._decodingComplete) {
                D12Config._agendaStaged = true;
                return `hidden_agenda.txt                             100%  842     1.2MB/s   00:00
[+] Exfiltration complete.`;
            }
            return `scp: ${src}: No such file or directory`;
        },

        // Jupyter/pandas shorthand — helpful suggestion
        'jupyter': function(args) {
            return `[i] Jupyter is not available in this terminal environment.
[i] Use python3 neural_decode.py and python3 reconstruct.py --mode full instead.`;
        },

        'numpy': function(args) {
            return 'numpy: command not found\n[i] Import numpy inside a Python script: import numpy as np';
        },

        'pandas': function(args) {
            return 'pandas: command not found\n[i] Import pandas inside a Python script: import pandas as pd';
        }
    },

    // ═══════════════════════════════════════════════════════
    // NEURAL DATA TABLE RENDERER (for db-style table output)
    // ═══════════════════════════════════════════════════════

    _renderStreamTable(rows) {
        // Renders thought_stream rows as formatted ASCII table
        let out = ' ts         | ch1  | ch2  | ch3  | ch4  | ch5  | label\n';
        out    += '------------+------+------+------+------+------+-----------\n';
        rows.forEach(function(r) {
            out += ` ${String(r.ts).padEnd(10)} | ${String(r.ch1).padEnd(4)} | ${String(r.ch2).padEnd(4)} | ${String(r.ch3).padEnd(4)} | ${String(r.ch4).padEnd(4)} | ${String(r.ch5).padEnd(4)} | ${r.label}\n`;
        });
        out += `(${rows.length} row${rows.length !== 1 ? 's' : ''})\n`;
        return out;
    },

    _renderPatternsTable(rows) {
        // Renders known_patterns rows as formatted ASCII table
        let out = ' pattern_id | label              | amplitude_range | spike_ratio\n';
        out    += '------------+--------------------+-----------------+------------\n';
        rows.forEach(function(r) {
            out += ` ${r.pattern_id.padEnd(10)} | ${r.label.padEnd(18)} | ${r.amplitude_range.padEnd(15)} | ${r.spike_ratio}\n`;
        });
        out += `(${rows.length} rows)\n`;
        return out;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(function(h) {
            html += `<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #ddd; background:#f5f3ff;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row) {
            html += '<tr>';
            row.forEach(function(cell) {
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
