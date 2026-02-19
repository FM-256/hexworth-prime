/* ============================================================
   CTF ARENA — Box A15: The Spectral Interceptor
   SDR / Signal Intelligence | Silent Broadcast
   Config: IQ analysis engine, FSK demodulation, protocol
   reversing, XOR decryption, filesystem, flags, hints, lore
   ============================================================ */

const A15Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Spectral Interceptor',
    subtitle: 'Signal Intelligence — Silent Broadcast',
    difficulty: 'Expert',
    accent: '#e67e22',
    storageKey: 'hexworth_ctf_a15',
    trackerKey: 'ctf_a15',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer RF attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'RF Reconnaissance',
            icon: '\uD83D\uDCE1',
            description: 'Scan the RF spectrum to locate the target transmission. Identify carrier frequency, bandwidth, and signal presence.',
            requiredFlags: [],
            mitre: ['T1040', 'T1595'],
            unlocks: ['identification'],
            locked: false
        },
        {
            id: 'identification',
            name: 'Signal Identification',
            icon: '\uD83D\uDD2C',
            description: 'Analyze the captured IQ file to decode the modulation scheme, baud rate, and bit encoding. Confirm the protocol family.',
            requiredFlags: [],
            mitre: ['T1040', 'T1557'],
            unlocks: ['interception'],
            locked: true
        },
        {
            id: 'interception',
            name: 'Signal Interception',
            icon: '\uD83D\uDCF6',
            description: 'Demodulate the raw IQ data and reconstruct the digital bitstream. Identify packet framing, preamble, and sync word.',
            requiredFlags: ['user'],
            mitre: ['T1123', 'T1040', 'T1557.002'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'Data Extraction',
            icon: '\uD83D\uDD13',
            description: 'Reverse-engineer the proprietary protocol and decrypt the XOR-ciphered payload. Recover the Courier Manifest from the captured signal.',
            requiredFlags: ['root'],
            mitre: ['T1020', 'T1119', 'T1027'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            // SY0-701 — CompTIA Security+
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with network attacks — Wireless/RF interception', skill: 'RF Spectrum Analysis & Modulation Identification' },
            { flagId: 'user', objective: '3.2', description: 'Given a scenario, implement host or application security solutions — wireless protocols', skill: 'GFSK Signal Demodulation & Baud Rate Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — eavesdropping', skill: 'Protocol Reverse Engineering & XOR Decryption' },
            { flagId: 'root', objective: '4.4', description: 'Given a scenario, implement public key infrastructure — encryption weaknesses', skill: 'Covert Channel Detection & Cipher Recovery' },
            // CS0-003 — CompTIA CySA+
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze indicators of compromise — signal intelligence', skill: 'Signal Interception & Protocol Decoding', certPath: 'CS0-003' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze indicators of compromise — covert channels', skill: 'Covert Channel Manifest Extraction', certPath: 'CS0-003' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'USB: RTL-SDR V3 detected on bus 002',
            'USB: HackRF One detected on bus 003',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nSDR devices: RTL-SDR V3, HackRF One\nCapture file: ~/silent_broadcast.iq\n'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{gfsk_4800_b4ud_nrz_pr0t0c0l}', points: 100 },
        { id: 'root', value: 'flag{c0ur13r_m4n1f3st_d3c0d3d}',    points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 }   // 20 minutes (expert box)
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: "Start by examining the IQ file: file silent_broadcast.iq, then cat freq_info.txt for signal parameters.",
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: "Use inspectrum to visualize the signal \u2014 look for two frequency peaks indicating FSK modulation.",
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: "After demodulation, examine the bitstream for repeating patterns. The preamble is 0xAA bytes.",
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: "The payload is XOR encrypted with key 0x42. The first bytes of plaintext are 'COURIER:'.",
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A ghost frequency in the 433 MHz ISM band. No registered operator. No FCC filing. A short burst transmission repeating on a 12-hour cycle \u2014 invisible to commercial scanners, ignored by automated spectrum monitors as ordinary IoT noise. Your RTL-SDR caught it at 03:00 during a routine sweep. Now it is yours to break.',
        scenario: 'The courier network operates entirely off-grid. Their engineers chose the 433 MHz ISM band deliberately: a sea of garage-door openers, weather sensors, and cheap RF remotes. The signal drowns in the noise floor until you know what to look for. A CC1101-based embedded device, a proprietary framing protocol cobbled together from a datasheet weekend, and a single-byte XOR cipher the lead engineer called "good enough." He was wrong.',
        outro: 'The Silent Broadcast has been silenced. A custom modulation scheme, a proprietary protocol, a trivial XOR cipher \u2014 three layers of obscurity that crumbled under disciplined signal analysis. The couriers believed their RF fortress was impenetrable because no one had ever looked. You looked. The Manifest is yours.',
        ecer: {
            executive: 'Network leadership chose ISM-band RF to avoid licensed spectrum oversight, incorrectly assuming physical obscurity would substitute for cryptographic security',
            culture: 'No security engineering review of the RF protocol design. The embedded firmware team operated without threat modeling or red-team input',
            employee: 'Firmware developer implemented XOR encryption with a static single-byte key, citing "sufficient for short-range transmissions" in internal notes',
            regulatory: 'No regulatory framework mandates RF protocol security for unlicensed ISM-band devices; the gap allowed a production covert channel to operate undetected'
        }
    },

    // ═══════════════════════════════════════════════════════
    // STATE TRACKING — progressive unlock gates
    // ═══════════════════════════════════════════════════════

    _state: {
        signalAnalyzed: false,
        demodulated: false,
        protocolReversed: false
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Local Signal Analysis Dashboard
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost:8080/',

        pages: {

            // ── Page 1: Signal Analysis Dashboard ─────────────────
            'http://localhost:8080/': {
                title: 'SigInt Workbench \u2014 Local Analysis',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #553a1a;">
                        <h1 style="color:#e67e22; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">&#9670; SigInt Workbench</h1>
                        <div style="color:#888; font-size:0.78rem;">Local Signal Analysis Tool &mdash; v2.1.0</div>
                    </div>

                    <div style="max-width:680px; margin:0 auto;">
                        <div style="color:#e67e22; font-size:0.78rem; font-weight:700; letter-spacing:0.1em; margin-bottom:16px; padding-bottom:6px; border-bottom:1px solid #553a1a;">CAPTURE FILE STATUS</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin-bottom:28px;">
                            <thead>
                                <tr style="background:rgba(230,126,34,0.08);">
                                    <th style="padding:7px 12px; text-align:left; color:#e67e22; border-bottom:2px solid #553a1a;">Property</th>
                                    <th style="padding:7px 12px; text-align:left; color:#e67e22; border-bottom:2px solid #553a1a;">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a;">Capture File</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a; font-family:monospace; font-size:0.75rem;">silent_broadcast.iq</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a;">File Size</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a; font-family:monospace; font-size:0.75rem;">12.4 MB (12,994,560 bytes)</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a;">Format</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a; font-family:monospace; font-size:0.75rem;">Complex float32 IQ (interleaved I/Q)</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a;">Sample Rate</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a; font-family:monospace; font-size:0.75rem;">2.4 MSps</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a;">Center Frequency</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a; font-family:monospace; font-size:0.75rem;">433.920 MHz (ISM Band)</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a;">Duration</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a; font-family:monospace; font-size:0.75rem;">~2.7 seconds</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a;">SDR Device</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #2a2a2a; font-family:monospace; font-size:0.75rem;">RTL-SDR V3 (rtl_sdr capture)</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style="color:#e67e22; font-size:0.78rem; font-weight:700; letter-spacing:0.1em; margin-bottom:16px; padding-bottom:6px; border-bottom:1px solid #553a1a;">FFT WATERFALL PREVIEW</div>

                        <div style="background:#0a0a14; border:1px solid #553a1a; border-radius:4px; padding:16px; margin-bottom:20px; font-family:monospace; font-size:0.72rem; line-height:1.6;">
                            <div style="color:#888; margin-bottom:8px;">Freq (MHz): 433.90 &mdash;&mdash;&mdash;&mdash; 433.92 &mdash;&mdash;&mdash;&mdash; 433.94</div>
                            <div style="color:#1a5c1a;">&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</div>
                            <div style="color:#1a7c1a;">&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;<span style="color:#e67e22;">&#9608;&#9608;&#9608;</span>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;<span style="color:#e67e22;">&#9608;&#9608;&#9608;</span>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</div>
                            <div style="color:#1a9c1a;">&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;<span style="color:#f39c12;">&#9608;&#9608;&#9608;&#9608;</span>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;<span style="color:#f39c12;">&#9608;&#9608;&#9608;&#9608;</span>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</div>
                            <div style="color:#1aac1a;">&#9608;&#9608;&#9608;&#9608;&#9608;<span style="color:#e74c3c;">&#9608;&#9608;&#9608;&#9608;&#9608;</span>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;<span style="color:#e74c3c;">&#9608;&#9608;&#9608;&#9608;&#9608;</span>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</div>
                            <div style="color:#1a7c1a;">&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;<span style="color:#f39c12;">&#9608;&#9608;&#9608;&#9608;</span>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;<span style="color:#f39c12;">&#9608;&#9608;&#9608;&#9608;</span>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</div>
                            <div style="color:#1a5c1a;">&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</div>
                            <div style="color:#888; margin-top:8px;">Time &darr;  |  Two distinct frequency peaks detected (~+/- 4.8 kHz deviation)</div>
                            <div style="color:#e67e22; margin-top:4px;">&#9654; Pattern consistent with GFSK modulation</div>
                        </div>

                        <div style="color:#e67e22; font-size:0.78rem; font-weight:700; letter-spacing:0.1em; margin-bottom:16px; padding-bottom:6px; border-bottom:1px solid #553a1a;">QUICK ANALYSIS</div>

                        <div style="padding:12px 14px; background:rgba(230,126,34,0.06); border:1px solid rgba(230,126,34,0.2); border-radius:4px; font-size:0.78rem; color:#bbb; line-height:1.7;">
                            <strong style="color:#e67e22;">Preliminary Findings:</strong><br>
                            &bull; Signal present at 433.92 MHz (ISM band &mdash; common for IoT/remote devices)<br>
                            &bull; Two frequency peaks suggest binary FSK or GFSK modulation<br>
                            &bull; Frequency deviation: ~4.8 kHz (consistent with 4800 baud GFSK)<br>
                            &bull; Burst transmission pattern &mdash; single packet captured<br>
                            &bull; <strong>Recommendation:</strong> Use <code style="background:#1a1a2e; padding:1px 5px; border-radius:3px;">inspectrum</code> or <code style="background:#1a1a2e; padding:1px 5px; border-radius:3px;">gnuradio-companion</code> for full demodulation
                        </div>

                        <div style="margin-top:20px; padding:12px 14px; background:#0a0a14; border:1px solid #2a2a2a; border-radius:4px; font-size:0.72rem; color:#666;">
                            SigInt Workbench v2.1.0 &mdash; Local analysis only. No network transmission of captured data.
                        </div>
                    </div>
                `
            },

            // ── Page 2: Protocol Reference ────────────────────────
            'http://localhost:8080/protocol': {
                title: 'SigInt Workbench \u2014 Protocol Database',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #553a1a;">
                        <h1 style="color:#e67e22; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">&#9670; SigInt Workbench</h1>
                        <div style="color:#888; font-size:0.78rem;">Protocol Reference Database</div>
                    </div>

                    <div style="max-width:680px; margin:0 auto; font-size:0.82rem; color:#bbb; line-height:1.7;">

                        <h2 style="color:#e67e22; font-size:1rem; border-bottom:2px solid #553a1a; padding-bottom:6px; margin-top:0;">Common ISM Band Protocols (433 MHz)</h2>

                        <table style="width:100%; border-collapse:collapse; font-size:0.78rem; margin-bottom:20px;">
                            <thead>
                                <tr style="background:rgba(230,126,34,0.08);">
                                    <th style="padding:6px 12px; text-align:left; color:#e67e22; border-bottom:2px solid #553a1a;">Protocol</th>
                                    <th style="padding:6px 12px; text-align:left; color:#e67e22; border-bottom:2px solid #553a1a;">Modulation</th>
                                    <th style="padding:6px 12px; text-align:left; color:#e67e22; border-bottom:2px solid #553a1a;">Baud Rate</th>
                                    <th style="padding:6px 12px; text-align:left; color:#e67e22; border-bottom:2px solid #553a1a;">Encoding</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a;">Oregon Scientific</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a;">OOK</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a;">1024 bps</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a;">Manchester</td>
                                </tr>
                                <tr>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a;">CC1101 Default</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a;">GFSK</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a;">4800 bps</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a;">NRZ</td>
                                </tr>
                                <tr>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a;">LoRa</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a;">CSS</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a;">Variable</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a;">FEC+Interleaving</td>
                                </tr>
                                <tr>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a; color:#e67e22; font-weight:700;">Unknown (Silent Broadcast)</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a; color:#e67e22;">GFSK?</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a; color:#e67e22;">~4800?</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #2a2a2a; color:#e67e22;">NRZ?</td>
                                </tr>
                            </tbody>
                        </table>

                        <h2 style="color:#e67e22; font-size:1rem; border-bottom:2px solid #553a1a; padding-bottom:6px;">Typical Packet Structure (CC1101-style)</h2>
                        <div style="background:#0a0a14; border:1px solid #2a2a2a; border-radius:4px; padding:14px; font-family:monospace; font-size:0.75rem; color:#a8d8a8; margin-bottom:16px;">
[Preamble: 4+ bytes 0xAA] [Sync: 2 bytes] [Length: 1 byte] [Payload: N bytes] [CRC: 2 bytes]

Common sync words:
  0xD391  (CC1101 default)
  0x2DD4  (nRF24L01)
  0x7E7E  (HDLC/AX.25)

Preamble purpose: clock recovery + AGC settling
Sync word purpose: frame alignment / start-of-packet marker
                        </div>

                        <h2 style="color:#e67e22; font-size:1rem; border-bottom:2px solid #553a1a; padding-bottom:6px;">XOR Cipher Detection</h2>
                        <p>Custom protocols often use simple XOR encryption. Detection methods:</p>
                        <ul style="margin:0 0 16px; padding-left:20px; color:#999;">
                            <li style="margin-bottom:4px;">Known-plaintext: if you can guess any plaintext bytes, XOR them with ciphertext to recover the key</li>
                            <li style="margin-bottom:4px;">Single-byte XOR: frequency analysis on ciphertext (most common byte = key XOR most common plaintext byte)</li>
                            <li style="margin-bottom:4px;">Repeating key: use index-of-coincidence or Kasiski examination</li>
                        </ul>

                        <div style="padding:10px 14px; background:rgba(230,126,34,0.06); border:1px solid rgba(230,126,34,0.15); border-radius:4px; font-size:0.75rem; color:#888;">
                            <strong style="color:#e67e22;">Analyst Note:</strong> The Silent Broadcast signal characteristics closely match CC1101-style GFSK. Start with that assumption.
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker Kali machine)
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
                                'silent_broadcast.iq': {
                                    type: 'file',
                                    content: '[Binary IQ data file — 12,994,560 bytes]\nFormat: Complex float32, interleaved I/Q samples\nCapture device: RTL-SDR V3\nSample rate: 2.4 MSps\nCenter frequency: 433.92 MHz\nDuration: ~2.7 seconds\n\nUse inspectrum, gnuradio-companion, or python3 tools/demod.py to analyze.'
                                },
                                'freq_info.txt': {
                                    type: 'file',
                                    content: '=== SIGNAL PARAMETERS ===\nCapture source: RTL-SDR V3 (rtl_sdr -f 433920000 -s 2400000)\nCenter frequency: 433.92 MHz (ISM Band)\nSample rate: 2.4 MSps\nBandwidth: ~50 kHz occupied\nCapture duration: 2.7 seconds\n\nObservations:\n  - Signal burst detected at T+0.3s, duration ~1.2s\n  - Two distinct frequency components visible in FFT\n  - Frequency deviation approximately +/- 4.8 kHz from center\n  - Pattern suggests digital modulation (not analog voice)\n  - No spread-spectrum characteristics — fixed carrier\n\nNotes:\n  - 433.92 MHz is commonly used by ISM-band devices (remotes, sensors, IoT)\n  - The CC1101 transceiver chip operates at this frequency with GFSK modulation\n  - Typical baud rates for CC1101: 1200, 2400, 4800, 9600, 38400, 250000\n  - The measured deviation of 4.8 kHz is consistent with 4800 baud GFSK'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: The "Silent Broadcast" — clandestine courier radio network\nObjective: Intercept and decode the courier communications\n\nIntel:\n  - The couriers use a custom radio protocol for short-range data transfer\n  - They broadcast on a fixed frequency in the 433 MHz ISM band\n  - The system uses a proprietary embedded device (likely CC1101-based)\n  - Communications are believed to contain a "Courier Manifest" — \n    a list of drops and pickups for the network\n  - The protocol uses some form of encryption, believed to be weak\n\nCapture equipment:\n  - RTL-SDR V3 (wideband receiver, 500 kHz - 1.7 GHz)\n  - HackRF One (half-duplex transceiver, 1 MHz - 6 GHz)\n  - Capture already taken: silent_broadcast.iq\n\nAnalysis steps:\n  1. file silent_broadcast.iq — verify file type\n  2. cat freq_info.txt — review signal parameters\n  3. inspectrum silent_broadcast.iq — visualize the signal\n  4. gnuradio-companion — build demodulation flowgraph\n  5. python3 tools/demod.py — run FSK demodulation\n  6. xxd demodulated_bits.bin — examine raw bitstream\n  7. python3 tools/decode.py — reverse engineer protocol & decrypt\n\nFlags:\n  user flag — identify the modulation scheme\n  root flag — decode the Courier Manifest\n\nGood luck, operator.'
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'demod.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\ndemod.py — FSK Demodulation Script for Silent Broadcast\nReads IQ data and performs GFSK demodulation.\nOutputs: demodulated_bits.bin\n\nUsage: python3 demod.py [input_file]\n"""\nimport numpy as np\nfrom scipy.signal import butter, lfilter, hilbert\n\ndef demodulate_gfsk(iq_file, sample_rate=2400000, baud_rate=4800, freq_dev=4800):\n    # Load IQ samples\n    raw = np.fromfile(iq_file, dtype=np.complex64)\n    \n    # Bandpass filter around signal\n    nyq = sample_rate / 2\n    low = (433920000 - 25000) / nyq  # relative to sample rate\n    high = (433920000 + 25000) / nyq\n    \n    # FM demodulation (frequency discriminator)\n    phase = np.angle(raw[1:] * np.conj(raw[:-1]))\n    \n    # Low-pass filter the demodulated signal\n    samples_per_symbol = sample_rate // baud_rate  # 500 samples/symbol\n    \n    # Clock recovery + symbol sampling\n    symbols = phase[::samples_per_symbol]\n    bits = (symbols > 0).astype(np.uint8)\n    \n    # Pack bits into bytes and write output\n    output = np.packbits(bits)\n    output.tofile("demodulated_bits.bin")\n    \n    return output\n\nif __name__ == "__main__":\n    import sys\n    iq_file = sys.argv[1] if len(sys.argv) > 1 else "silent_broadcast.iq"\n    print(f"[*] Loading IQ data from {iq_file}...")\n    print(f"[*] GFSK demodulation: 4800 baud, NRZ encoding")\n    result = demodulate_gfsk(iq_file)\n    print(f"[+] Demodulated {len(result)} bytes")\n    print(f"[+] Output written to: demodulated_bits.bin")'
                                        },
                                        'decode.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\ndecode.py — Protocol Decoder for Silent Broadcast\nReverses the custom packet protocol and XOR encryption.\n\nUsage: python3 decode.py [demodulated_bits.bin]\n"""\nimport sys\n\ndef find_sync(data, sync_word=b\'\\xd3\\x91\'):\n    """Locate sync word in bitstream to find packet start."""\n    for i in range(len(data) - 1):\n        if data[i:i+2] == sync_word:\n            return i\n    return -1\n\ndef xor_decrypt(data, key):\n    """Single-byte XOR decryption."""\n    return bytes([b ^ key for b in data])\n\ndef decode_packet(filename):\n    with open(filename, \'rb\') as f:\n        data = f.read()\n    \n    print(f"[*] Loaded {len(data)} bytes from {filename}")\n    \n    # Step 1: Find preamble\n    preamble_pos = -1\n    for i in range(len(data) - 3):\n        if data[i:i+4] == b\'\\xaa\\xaa\\xaa\\xaa\':\n            preamble_pos = i\n            break\n    \n    if preamble_pos < 0:\n        print("[-] No preamble found!")\n        return\n    \n    print(f"[+] Preamble (0xAA x4) found at offset {preamble_pos}")\n    \n    # Step 2: Find sync word\n    sync_pos = find_sync(data[preamble_pos:], b\'\\xd3\\x91\')\n    if sync_pos < 0:\n        print("[-] Sync word 0xD391 not found!")\n        return\n    \n    abs_sync = preamble_pos + sync_pos\n    print(f"[+] Sync word 0xD391 found at offset {abs_sync}")\n    \n    # Step 3: Extract packet fields\n    pkt_start = abs_sync + 2  # after sync word\n    length = data[pkt_start]\n    payload = data[pkt_start + 1 : pkt_start + 1 + length]\n    crc = data[pkt_start + 1 + length : pkt_start + 3 + length]\n    \n    print(f"[+] Payload length: {length} bytes")\n    print(f"[+] Encrypted payload (hex): {payload.hex()}")\n    print(f"[+] CRC-16: {crc.hex()}")\n    \n    # Step 4: Known-plaintext XOR key recovery\n    # Intel suggests messages start with "COURIER:"\n    known_pt = b\'COURIER:\'\n    if len(payload) >= len(known_pt):\n        recovered_keys = [payload[i] ^ known_pt[i] for i in range(len(known_pt))]\n        print(f"\\n[*] Known-plaintext attack: assuming first bytes = \'COURIER:\'")\n        print(f"[*] Recovered XOR keys: {[hex(k) for k in recovered_keys]}")\n        \n        if len(set(recovered_keys)) == 1:\n            key = recovered_keys[0]\n            print(f"[+] Single-byte XOR key confirmed: {hex(key)} (0x42 = \'B\')")\n        else:\n            key = recovered_keys[0]\n            print(f"[?] Key varies — trying first byte: {hex(key)}")\n    \n    # Step 5: Full decryption\n    plaintext = xor_decrypt(payload, key)\n    print(f"\\n[+] ========== DECRYPTED PAYLOAD ==========")\n    print(f"[+] {plaintext.decode(\'ascii\', errors=\'replace\')}")\n    print(f"[+] ========================================")\n\nif __name__ == "__main__":\n    filename = sys.argv[1] if len(sys.argv) > 1 else "demodulated_bits.bin"\n    decode_packet(filename)'
                                        },
                                        'analyze_spectrum.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nanalyze_spectrum.py — Quick FFT analysis of IQ capture\nUsage: python3 tools/analyze_spectrum.py [iq_file]\n"""\nimport numpy as np\nfrom scipy.fft import fft, fftfreq\n\ndef analyze(iq_file, sample_rate=2400000, center_freq=433920000):\n    raw = np.fromfile(iq_file, dtype=np.complex64)\n    N = len(raw)\n    \n    # Compute FFT\n    yf = fft(raw[:min(N, 65536)])\n    xf = fftfreq(min(N, 65536), 1/sample_rate) + center_freq\n    magnitude = np.abs(yf)\n    \n    # Find peaks\n    peak_indices = np.argsort(magnitude)[-10:]\n    peak_freqs = xf[peak_indices]\n    \n    print(f"Center freq: {center_freq/1e6} MHz")\n    print(f"Sample rate: {sample_rate/1e6} MSps")\n    print(f"Total samples: {N}")\n    print(f"\\nTop frequency peaks:")\n    for f in sorted(peak_freqs):\n        deviation = (f - center_freq) / 1000\n        print(f"  {f/1e6:.4f} MHz (deviation: {deviation:+.1f} kHz)")\n\nif __name__ == "__main__":\n    import sys\n    iq_file = sys.argv[1] if len(sys.argv) > 1 else "silent_broadcast.iq"\n    analyze(iq_file)'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'rtl_sdr -f 433920000 -s 2400000 -n 12994560 silent_broadcast.iq\nfile silent_broadcast.iq\ncat freq_info.txt\nls tools/'
                                },
                                'captures': {
                                    type: 'dir',
                                    children: {
                                        'ambient_sweep_868mhz.iq': {
                                            type: 'file',
                                            content: '[Binary IQ data — 868.3 MHz LoRa spectrum sweep]\nFormat: Complex float32, interleaved I/Q\nCapture device: HackRF One\nSample rate: 10 MSps\nCenter frequency: 868.3 MHz (EU LoRa band)\nDuration: 30 seconds\n\nFindings: Multiple LoRa end-device uplinks detected. Standard Semtech SX1276\nspread-spectrum chirps (SF7-SF12). No proprietary or anomalous signals.\nThis capture is NOT the target signal.\n\n[ANALYST NOTE] Red herring — routine LoRa traffic. Target is on 433.92 MHz.'
                                        },
                                        'wifi_2ghz_passive.iq': {
                                            type: 'file',
                                            content: '[Binary IQ data — 2.4 GHz 802.11 passive capture]\nFormat: Complex float32, interleaved I/Q\nCapture device: HackRF One (direct sampling mode)\nSample rate: 20 MSps\nCenter frequency: 2.437 GHz (Wi-Fi channel 6)\nDuration: 5 seconds\n\nFindings: Standard 802.11n beacon frames, probe requests, data frames.\nAll traffic consistent with normal WLAN environment. No anomalies.\n\n[ANALYST NOTE] Wrong frequency band entirely. The target is ISM 433 MHz.'
                                        },
                                        'ook_remote_test.iq': {
                                            type: 'file',
                                            content: '[Binary IQ data — 433 MHz OOK remote capture (test file)]\nFormat: Complex float32, interleaved I/Q\nCapture device: RTL-SDR V3\nSample rate: 2.4 MSps\nCenter frequency: 433.92 MHz\nDuration: 0.8 seconds\n\nFindings: OOK-modulated signal (On-Off Keying), NOT FSK/GFSK.\nConsistent with common 433 MHz remote controls (rolling code, 1-button press).\nCode length: 24 bits. Encoding: Manchester.\nNo preamble structure matching target.\n\n[ANALYST NOTE] Wrong modulation type. Target uses GFSK, not OOK.\n               This file was captured from a standard key fob during sweep calibration.'
                                        }
                                    }
                                },
                                'analysis_notes': {
                                    type: 'dir',
                                    children: {
                                        'hypothesis_log.txt': {
                                            type: 'file',
                                            content: '=== SIGNAL HYPOTHESIS LOG ===\nAnalyst: kali\nDate: 2024-01-14\n\nHYPOTHESIS 1: LoRa sensor network\n  Test: Check 868 MHz LoRa band\n  Result: NEGATIVE — only standard LoRa devices, all Semtech stacks\n  Status: RULED OUT\n\nHYPOTHESIS 2: Z-Wave home automation\n  Test: Check 908.42 MHz (US Z-Wave)\n  Result: NEGATIVE — no Z-Wave frame headers\n  Status: RULED OUT\n\nHYPOTHESIS 3: Zigbee 2.4 GHz mesh\n  Test: Check 2.4 GHz 802.15.4\n  Result: NEGATIVE — adjacent channel APs only\n  Status: RULED OUT\n\nHYPOTHESIS 4: Custom CC1101-based ISM device\n  Test: Check 433.92 MHz with GFSK demodulation\n  Result: POSITIVE — silent_broadcast.iq confirmed\n  Status: ACTIVE INVESTIGATION\n\n[NOTE] The 433 MHz burst at T+0.3s is NOT a standard product. Protocol is\ncustom — no match in URH signature database. Manual reverse engineering required.'
                                        },
                                        'false_positives.txt': {
                                            type: 'file',
                                            content: '=== FALSE POSITIVE SIGNALS DISMISSED ===\n\n1. 433.850 MHz — commercial weather station (Oregon Scientific)\n   Identified by: OOK modulation + standard Manchester encoding\n   Action: Filtered from analysis scope\n\n2. 433.875 MHz — automotive TPMS (tire pressure monitor)\n   Identified by: Short burst, TPMS packet structure (wheel ID + pressure bytes)\n   Action: Filtered from analysis scope\n\n3. 433.950 MHz — generic remote control (OOK, 24-bit rolling code)\n   Identified by: ook_remote_test.iq capture, code replay not relevant\n   Action: Filtered from analysis scope\n\nTARGET SIGNAL: 433.920 MHz — GFSK, 4800 baud, unknown custom protocol\n   This is the only anomaly in the sweep. Proceed with analysis.'
                                        },
                                        'modulation_test_results.txt': {
                                            type: 'file',
                                            content: '=== MODULATION IDENTIFICATION TESTS ===\nFile: silent_broadcast.iq\n\nTEST 1: AM/OOK detection\n  Method: Envelope detection (abs(IQ))\n  Result: Signal envelope is CONSTANT — rules out AM/OOK\n  CONCLUSION: Not AM or OOK\n\nTEST 2: FM detection\n  Method: Phase discriminator angle(z[n]*conj(z[n-1]))\n  Result: Phase transitions detected — FM family confirmed\n  CONCLUSION: FM-class modulation\n\nTEST 3: FSK vs GFSK\n  Method: Instantaneous frequency histogram\n  Result: Two frequency clusters with Gaussian probability density\n  Peak separation: 9.6 kHz\n  Transition smoothing: Gaussian BT=0.5 (standard CC1101 default)\n  CONCLUSION: GFSK (Gaussian FSK), NOT hard FSK\n\nTEST 4: BPSK/QPSK check\n  Method: Constellation diagram (I vs Q plot)\n  Result: Points cluster on real axis, no phase rotation pattern\n  CONCLUSION: Not PSK\n\nFINAL: GFSK, ±4.8 kHz deviation, 4800 baud\n       Matches CC1101 default configuration exactly.'
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
                                'gnuradio': {
                                    type: 'dir',
                                    children: {
                                        'examples': {
                                            type: 'dir',
                                            children: {
                                                'fsk_demod.grc': {
                                                    type: 'file',
                                                    content: '# GNU Radio Companion flowgraph — FSK Demodulator\n# Source: File Source → Throttle → Freq Xlating FIR Filter\n#   → Quadrature Demod → Clock Recovery → Binary Slicer\n#   → File Sink (demodulated_bits.bin)\n#\n# Parameters:\n#   sample_rate: 2400000\n#   center_freq: 433920000\n#   baud_rate: 4800\n#   deviation: 4800'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'bin': {
                            type: 'dir',
                            children: {
                                'inspectrum': {
                                    type: 'file',
                                    content: '[binary: inspectrum 0.2.3 — SDR signal analyzer]'
                                },
                                'gnuradio-companion': {
                                    type: 'file',
                                    content: '[binary: GNU Radio Companion 3.10.5]'
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
    // TERMINAL COMMANDS (box-specific SDR/signal tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'file': function(args, term, engine) {
            const target = args.join(' ');
            if (!target) return 'Usage: file <filename>';

            if (target.includes('silent_broadcast.iq')) {
                return `silent_broadcast.iq: data, 12994560 bytes
  Format:       Complex float32 IQ (little-endian, interleaved I/Q)
  Samples:      1624320 complex samples
  Sample rate:  2.4 MSps (from capture metadata)
  Duration:     ~2.7 seconds
  Magic bytes:  No recognized header (raw IQ stream)
  Likely tool:  rtl_sdr, hackrf_transfer, or gqrx capture`;
            }

            if (target.includes('demodulated_bits.bin')) {
                if (!A15Config._state.demodulated) {
                    return `demodulated_bits.bin: cannot open 'demodulated_bits.bin' (No such file or directory)

[hint] This file is generated by running the demodulation tools first.
       Try: gnuradio-companion  or  python3 tools/demod.py`;
                }
                return `demodulated_bits.bin: data, 96 bytes
  Raw demodulated bitstream from GFSK signal
  Contains: preamble + sync + packet data`;
            }

            if (target.includes('freq_info.txt')) {
                return `freq_info.txt: ASCII text, 584 bytes`;
            }

            if (target.includes('notes.txt')) {
                return `notes.txt: ASCII text, 1124 bytes`;
            }

            if (target.includes('demod.py')) {
                return `tools/demod.py: Python script, ASCII text executable, 1296 bytes`;
            }

            if (target.includes('decode.py')) {
                return `tools/decode.py: Python script, ASCII text executable, 1820 bytes`;
            }

            return `${target}: cannot open '${target}' (No such file or directory)`;
        },

        'inspectrum': function(args, term, engine) {
            const target = args.join(' ');
            if (!target || !target.includes('.iq')) {
                return `Usage: inspectrum <iq_file>
inspectrum: SDR signal analyzer — opens IQ captures for visual analysis`;
            }

            if (!target.includes('silent_broadcast')) {
                return `inspectrum: error: cannot open '${target}': No such file or directory`;
            }

            A15Config._state.signalAnalyzed = true;

            return `inspectrum 0.2.3 — Opening IQ file...

Loading: silent_broadcast.iq
  File size:      12,994,560 bytes
  Sample format:  Complex float32
  Sample rate:    2,400,000 sps (auto-detected)

=== FFT WATERFALL ANALYSIS ===

Center frequency: 433.92 MHz
Bandwidth: 2.4 MHz visible | ~50 kHz signal occupied

Signal detected at T+0.3s — T+1.5s (burst duration: ~1.2s)

┌─────────────────────────────────────────────────────┐
│  Freq (kHz offset from center)                      │
│  -25   -15   -5    0    +5   +15   +25              │
│   .     .     .    |     .     .     .    ← noise    │
│   .     .    ██    |    ██     .     .    ← signal   │
│   .     .   ████   |   ████    .     .    ← peak     │
│   .     .  ██████  |  ██████   .     .    ← strong   │
│   .     .   ████   |   ████    .     .    ← peak     │
│   .     .    ██    |    ██     .     .    ← signal   │
│   .     .     .    |     .     .     .    ← noise    │
└─────────────────────────────────────────────────────┘

=== SIGNAL CHARACTERISTICS ===

  Two distinct frequency peaks detected:
    Peak 1: -4.8 kHz (mark frequency — binary '1')
    Peak 2: +4.8 kHz (space frequency — binary '0')
    Deviation: ±4.8 kHz

  Modulation: GFSK (Gaussian Frequency Shift Keying)
    Evidence: Gaussian-filtered transitions between frequencies
    No sharp frequency jumps (rules out raw FSK)

  Symbol rate measurement:
    Symbol period: ~208.3 µs
    Baud rate: 4800 baud (symbols/sec)
    Bit rate: 4800 bps (1 bit per symbol)

  Data encoding: NRZ (Non-Return-to-Zero)
    Mark frequency → bit value 1
    Space frequency → bit value 0

=== MODULATION IDENTIFICATION ===

  ┌────────────────────────────────────────────┐
  │  GFSK, 4800 baud, NRZ encoding            │
  │  Frequency deviation: ±4.8 kHz            │
  │  Carrier: 433.92 MHz (ISM band)           │
  │                                            │
  │  User flag: flag{gfsk_4800_b4ud_nrz_pr0t0c0l}  │
  └────────────────────────────────────────────┘

[+] Signal parameters identified. Proceed to demodulation.
    Use: gnuradio-companion  or  python3 tools/demod.py`;
        },

        'gnuradio-companion': function(args, term, engine) {
            A15Config._state.signalAnalyzed = true;
            A15Config._state.demodulated = true;

            return `GNU Radio Companion 3.10.5

Loading flowgraph: FSK Demodulator
  Source:     File Source (silent_broadcast.iq)
  Throttle:   2,400,000 samples/sec
  Filter:     Freq Xlating FIR (center: 433.92 MHz, BW: 50 kHz)
  Demod:      Quadrature Demod (gain: 1.0)
  Recovery:   Clock Recovery MM (omega: 500 samples/symbol)
  Slicer:     Binary Slicer (threshold: 0.0)
  Output:     File Sink (demodulated_bits.bin)

=== PROCESSING ===

[*] Reading 1,624,320 complex samples...
[*] Applying bandpass filter (433.895 - 433.945 MHz)...
[*] Quadrature demodulation (FM discriminator)...
[*] Clock recovery: omega=500, mu=0.5, gain_mu=0.175...
[*] Binary slicing: 768 raw bits recovered
[*] Packing to bytes: 96 bytes output

=== DEMODULATION COMPLETE ===

  Input:    silent_broadcast.iq (12.4 MB, 2.7s capture)
  Signal:   GFSK, 4800 baud, ±4.8 kHz deviation
  Output:   demodulated_bits.bin (96 bytes)
  Bits:     768 raw bits → 96 packed bytes

[+] Output written to: demodulated_bits.bin
[+] Modulation scheme: GFSK 4800 baud NRZ
[+] User flag: flag{gfsk_4800_b4ud_nrz_pr0t0c0l}

Next: xxd demodulated_bits.bin  or  python3 tools/decode.py`;
        },

        'rtl_sdr': function(args) {
            return `rtl_sdr: RTL-SDR capture utility
Found 1 device(s):
  0: Realtek, RTL2838UHIDIR, SN: 00000001

[info] The capture file silent_broadcast.iq already exists.
       It was recorded earlier during the surveillance window.
       Use file silent_broadcast.iq to verify, or inspectrum to analyze.`;
        },

        'rtl_power': function(args) {
            return `rtl_power: spectrum scanner
Scanning 430.000 - 436.000 MHz (step: 10 kHz)...

430.000 MHz: -42.1 dB (noise floor)
431.000 MHz: -41.8 dB
432.000 MHz: -42.3 dB
433.000 MHz: -41.5 dB
433.900 MHz: -38.2 dB (slightly elevated)
433.920 MHz: -12.4 dB ★★★ STRONG SIGNAL DETECTED
433.940 MHz: -37.9 dB (slightly elevated)
434.000 MHz: -42.0 dB
435.000 MHz: -41.7 dB
436.000 MHz: -42.1 dB

[+] Peak signal at 433.920 MHz (-12.4 dB, ~30 dB above noise floor)
[+] Signal bandwidth: approximately 40-50 kHz`;
        },

        'gqrx': function(args) {
            if (!A15Config._state.signalAnalyzed) {
                A15Config._state.signalAnalyzed = true;
            }

            return `gqrx 2.16 — SDR Receiver

[*] Opening: silent_broadcast.iq (file playback mode)
[*] Center: 433.920 MHz | Rate: 2.4 MSps | Gain: Auto

=== LIVE SPECTRUM ===
  Strong signal at 433.92 MHz
  Two alternating frequency components visible
  Pattern consistent with binary FSK/GFSK modulation
  Deviation: ~4.8 kHz | Baud rate estimate: ~4800

[*] Audio demodulation (NFM): digital noise — not voice
[*] Suggestion: Use inspectrum for detailed symbol analysis
    or gnuradio-companion for flowgraph demodulation`;
        },

        'xxd': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target.includes('demodulated_bits.bin')) {
                if (!A15Config._state.demodulated) {
                    return `xxd: demodulated_bits.bin: No such file or directory

[hint] Run gnuradio-companion or python3 tools/demod.py first to generate this file.`;
                }

                return `00000000: aaaa aaaa d391 3c21 4f57 5426 4b51 2d27  ......<!OWT&KQ-'
00000010: 2275 2671 6375 2170 272d 2724 3467 3060  "u&qcu!p'-'$4g0\`
00000020: 2671 2375 2d70 7e3d 3763 2f3d 3a22 3724  &q#u-p~=7c/=:"7$
00000030: 2720 2022 2f27 6023 3224 606f 2a37 7563  ' "/'\`#2$\`o*7uc
00000040: 2522 2726 2f6e 7e29 2771 2b2c 273f 2c6e  %"'&/n~)'q+,\'?,n
00000050: 3724 732a 3d20 7c3d a0b1 0000 0000 0000  7$s*= |=........

=== BITSTREAM ANALYSIS ===

  Offset 0x00-0x03: Preamble  — AA AA AA AA (clock sync)
  Offset 0x04-0x05: Sync word — D3 91 (packet start marker)
  Offset 0x06:      Length    — 3C (60 bytes payload)
  Offset 0x07-0x42: Payload   — 60 bytes (encrypted)
  Offset 0x43-0x44: CRC-16    — A0 B1

[*] Payload appears encrypted — not ASCII readable
[*] Repeating XOR pattern suspected (single-byte key?)
[*] Try: python3 tools/decode.py`;
            }

            if (target.includes('silent_broadcast.iq')) {
                return `00000000: 3412 a8bf 2c1a 93be f824 b1bf 8c2a 8bbe  4...,....$...*..
00000010: bc74 b9bf ec39 83be 8cc4 c0bf 4c49 7abe  .t...9......LIz.
00000020: 5c14 c8bf 0c59 71be 2c64 cfbf cc68 68be  \\....Yq.,d...hh.
00000030: fc14 d6bf 8c78 5fbe ccb4 dcbf 4c88 56be  .....x_.....L.V.

[...12,994,560 bytes of raw IQ data...]
(Binary data — use inspectrum or gnuradio-companion to visualize)`;
            }

            if (!target) return 'Usage: xxd <file>';
            return `xxd: ${target}: No such file or directory`;
        },

        'strings': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: strings <file>';

            if (target.includes('silent_broadcast.iq')) {
                return `[*] Scanning silent_broadcast.iq for ASCII strings...
[*] No readable ASCII strings found (binary IQ data)
[*] This file contains raw radio samples, not text data.
    Use SDR tools to analyze: inspectrum, gnuradio-companion`;
            }

            if (target.includes('demodulated_bits.bin')) {
                if (!A15Config._state.demodulated) {
                    return `strings: demodulated_bits.bin: No such file or directory`;
                }
                return `[*] Scanning demodulated_bits.bin for ASCII strings...
[*] No clean ASCII strings found
[*] Payload appears to be encrypted or encoded
[*] Try xxd for hex dump, or python3 tools/decode.py for protocol analysis`;
            }

            return `strings: '${target}': No such file or directory`;
        },

        'python3': function(args, term, engine) {
            const script = args.find(a => a.endsWith('.py')) || '';

            // ── demod.py — FSK demodulation ──────────────────────
            if (script.includes('demod.py') || script.includes('tools/demod')) {
                A15Config._state.signalAnalyzed = true;
                A15Config._state.demodulated = true;

                return `[*] Loading IQ data from silent_broadcast.iq...
[*] File size: 12,994,560 bytes (1,624,320 complex samples)
[*] Sample rate: 2.4 MSps | Center: 433.92 MHz

[*] Step 1: FM Demodulation (frequency discriminator)
    Phase difference method: angle(z[n] * conj(z[n-1]))
    Instantaneous frequency extracted from 1,624,319 samples

[*] Step 2: Low-pass filter
    Cutoff: 12 kHz (2.5x baud rate)
    Butterworth order: 5

[*] Step 3: Clock recovery
    Samples per symbol: 500 (2400000 / 4800)
    Mueller & Muller timing recovery
    Symbols recovered: 768

[*] Step 4: Binary slicing
    Threshold: 0.0 (NRZ, zero-crossing)
    Bits: 768
    Packed bytes: 96

[*] GFSK demodulation: 4800 baud, NRZ encoding
[+] Demodulated 96 bytes
[+] Output written to: demodulated_bits.bin

[+] Modulation confirmed: GFSK 4800 baud NRZ
[+] User flag: flag{gfsk_4800_b4ud_nrz_pr0t0c0l}

Next steps:
  xxd demodulated_bits.bin      — view hex dump
  python3 tools/decode.py       — decode protocol + decrypt`;
            }

            // ── decode.py — protocol reverse engineering ─────────
            if (script.includes('decode.py') || script.includes('tools/decode')) {
                if (!A15Config._state.demodulated) {
                    return `[*] Loaded 0 bytes from demodulated_bits.bin
[-] Error: File 'demodulated_bits.bin' not found or empty.
[-] Run demodulation first: python3 tools/demod.py  or  gnuradio-companion`;
                }

                A15Config._state.protocolReversed = true;

                return `[*] Loaded 96 bytes from demodulated_bits.bin

=== PACKET STRUCTURE ANALYSIS ===

[+] Preamble (0xAA x4) found at offset 0
    AA AA AA AA — standard clock synchronization pattern

[+] Sync word 0xD391 found at offset 4
    D3 91 — CC1101-compatible sync word (packet start marker)

[+] Packet header at offset 6:
    Length byte: 0x3C (60 bytes payload)

[+] Payload length: 60 bytes
[+] Encrypted payload (hex):
    21 4f 57 54 26 4b 51 2d 27 22 75 26 71 63 75 21
    70 27 2d 27 24 34 67 30 60 26 71 23 75 2d 70 7e
    3d 37 63 2f 3d 3a 22 37 24 27 20 20 22 2f 27 60
    23 32 24 60 6f 2a 37 75 63 25 22 27 26

[+] CRC-16: A0 B1

=== KNOWN-PLAINTEXT ATTACK ===

[*] Known-plaintext attack: assuming first bytes = 'COURIER:'
    Plaintext:  43 4f 55 52 49 45 52 3a  ("COURIER:")
    Ciphertext: 21 4f 57 54 26 4b 51 2d
    XOR result: 62 00 02 06 6f 0e 03 17

[!] Keys don't match — not a simple single-byte XOR at first glance...

[*] Trying alternative: maybe the XOR key is 0x42 applied differently...
    Testing: plaintext[0] = ciphertext[0] XOR 0x42 = 0x21 XOR 0x42 = 0x63 = 'c'
    That gives lowercase 'c' — intel says "COURIER:" with capital C...

[*] Re-examining: XOR 0x42 on full payload:
    Byte 0: 0x21 XOR 0x42 = 0x63 = 'c'

[*] Wait — checking if the protocol uses INVERTED case or field prefix...
    Testing full XOR 0x42 decryption:

[+] ========== DECRYPTED PAYLOAD ==========

COURIER:manifest_delta_7
DROP:pier_9:0300:pkg_alpha
DROP:warehouse_3:0745:pkg_beta
PICKUP:dock_12:1200:pkg_gamma
STATUS:active:route_echo_5
KEY:c0ur13r_m4n1f3st_d3c0d3d

[+] ==========================================

=== MANIFEST DECODED ===

  Type:    Courier Manifest (route schedule)
  Drops:   2 scheduled deliveries
  Pickups: 1 scheduled retrieval
  Route:   Echo-5 (active)

  Drop 1:  Pier 9 at 03:00 — Package Alpha
  Drop 2:  Warehouse 3 at 07:45 — Package Beta
  Pickup:  Dock 12 at 12:00 — Package Gamma
  Status:  Active route, codename "Echo-5"

[+] Root flag: flag{c0ur13r_m4n1f3st_d3c0d3d}

The Silent Broadcast has been decoded. The courier network is compromised.`;
            }

            // ── analyze_spectrum.py ──────────────────────────────
            if (script.includes('analyze_spectrum')) {
                A15Config._state.signalAnalyzed = true;

                return `[*] Loading IQ data from silent_broadcast.iq...
[*] Computing FFT (65536-point)...

Center freq: 433.92 MHz
Sample rate: 2.4 MSps
Total samples: 1,624,320

Top frequency peaks:
  433.9152 MHz (deviation: -4.8 kHz) ★ Mark frequency
  433.9200 MHz (deviation: +0.0 kHz)   Carrier center
  433.9248 MHz (deviation: +4.8 kHz) ★ Space frequency

[+] Two symmetric peaks at ±4.8 kHz — classic binary FSK/GFSK pattern
[+] Deviation matches 4800 baud GFSK (deviation ≈ baud rate)`;
            }

            if (!script) return 'Python 3.11.6 — press Ctrl+D to exit';
            return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
        },

        'nmap': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target) {
                return `Nmap 7.94 ( https://nmap.org )
Usage: nmap [Scan Type(s)] [Options] {target specification}

[note] This is an SDR/signal analysis challenge. There are no remote targets to scan.
       The "Silent Broadcast" is a radio signal, not a network service.
       Start with: file silent_broadcast.iq  and  cat freq_info.txt`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00011s latency).

PORT     STATE  SERVICE
8080/tcp open   http-proxy    (SigInt Workbench — local analysis tool)

Nmap done: 1 IP address (1 host up) scanned in 0.09 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.04 seconds`;
        },

        'curl': function(args) {
            const url = args.find(a => !a.startsWith('-') && a.startsWith('http')) || '';
            if (!url) return "curl: try 'curl --help' or 'curl --manual' for more information";

            if (url.includes('localhost:8080') || url.includes('127.0.0.1:8080')) {
                return `<!DOCTYPE html>
<html>
<head><title>SigInt Workbench</title></head>
<body>
<h1>SigInt Workbench v2.1.0</h1>
<p>Local Signal Analysis Tool</p>
<p>Capture file: silent_broadcast.iq (12.4 MB)</p>
<p>Use the visual interface at http://localhost:8080/ or command-line tools.</p>
<p><a href="/protocol">Protocol Reference Database</a></p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        'hackrf_info': function(args) {
            return `hackrf_info version: 2024.02.1
libhackrf version: 2024.02.1 (0.8)
Found HackRF
Index: 0
Serial number: 000000000000000045d063dc37570c5f
Board ID Number: 2 (HackRF One)
Firmware Version: 2024.02.1 (API:1.08)
Part ID Number: 0xa000cb3c 0x006c4745
Hardware Revision: r9`;
        },

        'rtl_test': function(args) {
            return `Found 1 device(s):
  0:  Realtek, RTL2838UHIDIR, SN: 00000001

Using device 0: Generic RTL2832U OEM
Detached kernel driver
Found Rafael Micro R820T tuner
Supported gain values (29): 0.0 0.9 1.4 2.7 3.7 7.7 8.7 12.5 14.4 15.7 16.6 19.7 20.7 22.9 25.4 28.0 29.7 32.8 33.8 36.4 37.2 38.6 40.2 42.1 43.4 43.9 44.5 48.0 49.6
[R82XX] PLL locked, OK
Sampling at 2048000 S/s.
Info: This tool will verify that samples are not being dropped.

No dropped samples detected.`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            return `ping: ${target}: Name or service not known

[note] This challenge is about radio signal analysis, not network attacks.
       Start with: file silent_broadcast.iq`;
        },

        'hexdump': function(args, term, engine) {
            // Alias for xxd behavior
            return A15Config.commands.xxd(args, term, engine);
        },

        'baudline': function(args) {
            A15Config._state.signalAnalyzed = true;
            return `baudline 1.08 — signal analyzer

Loading: silent_broadcast.iq
  Format: complex float32
  Sample rate: 2.4 MSps

=== SPECTROGRAM VIEW ===
  Strong signal at 433.92 MHz
  Binary FSK pattern visible — two alternating frequencies
  Measured baud rate: ~4800 baud
  Frequency deviation: ±4.8 kHz

[+] Modulation appears to be GFSK (Gaussian-filtered FSK)
    Use gnuradio-companion or python3 tools/demod.py for demodulation.`;
        },

        'urh': function(args) {
            A15Config._state.signalAnalyzed = true;
            return `Universal Radio Hacker 2.9.5

[*] Loading: silent_broadcast.iq
[*] Auto-detect modulation: FSK (2 levels)
[*] Samples per symbol: ~500 (baud rate: ~4800)
[*] Center frequency: 433.92 MHz

=== SIGNAL INTERPRETATION ===

  Modulation: FSK/GFSK (2-FSK)
  Baud rate:  4800
  Encoding:   NRZ (Non-Return-to-Zero)
  Deviation:  ±4.8 kHz

  Detected protocol structure:
    Preamble: AA AA AA AA (4 bytes)
    Sync:     D3 91 (2 bytes)
    Length:   3C (60 bytes)
    Payload:  [encrypted — 60 bytes]
    CRC:      A0 B1 (2 bytes)

[+] Use Decoding tab or python3 tools/decode.py for payload analysis`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        if (typeof str !== 'string') return String(str);
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
