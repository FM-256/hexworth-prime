/* ============================================================
   CTF ARENA — Box C4: The Midnight Encryption
   Ransomware Incident Response Campaign | Defensive Investigation
   Config: IR workstation filesystem, SIEM web app, memory forensics,
           network analysis, threat intelligence, flag extraction
   ============================================================ */

const C4Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Midnight Encryption',
    subtitle: 'Ransomware Incident Response — Assess, Contain, Investigate, Recover, Attribute',
    difficulty: 'Advanced',
    accent: '#e67e22',
    storageKey: 'hexworth_ctf_c4',
    registryId: 'c4-midnight-encryption',
    trackerKey: 'ctf_c4',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (IR campaign chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'assessment',
            name: 'Initial Assessment',
            icon: '\uD83D\uDEA8',
            description: 'Examine the ransom note. Identify the ransomware family from the note format and the .locked file extension. Extract the attacker\'s hidden identifier from the note metadata.',
            requiredFlags: [],
            mitre: ['T1486', 'T1491.001'],
            unlocks: ['containment'],
            locked: false
        },
        {
            id: 'containment',
            name: 'Containment',
            icon: '\uD83D\uDEE1\uFE0F',
            description: 'Map patient zero\'s active network connections. Identify all infected hosts by blast radius analysis. Document which network segments must be isolated.',
            requiredFlags: [],
            mitre: ['T1021.002', 'T1570', 'T1016'],
            unlocks: ['forensics'],
            locked: true
        },
        {
            id: 'forensics',
            name: 'Forensic Analysis',
            icon: '\uD83D\uDD0E',
            description: 'Analyze the memory dump from patient zero (FILESVR-01). Identify the malware process, extract the encryption key from heap memory, and trace the initial infection vector.',
            requiredFlags: ['user'],
            mitre: ['T1005', 'T1560', 'T1566.001'],
            unlocks: ['recovery'],
            locked: true
        },
        {
            id: 'recovery',
            name: 'Recovery',
            icon: '\uD83D\uDD11',
            description: 'Use the extracted key to decrypt a sample .locked file. Verify decryption integrity. Identify which backup sets are clean vs. encrypted by the ransomware.',
            requiredFlags: ['internal'],
            mitre: ['T1490', 'T1485'],
            unlocks: ['attribution'],
            locked: true
        },
        {
            id: 'attribution',
            name: 'Attribution & Reporting',
            icon: '\uD83C\uDFAF',
            description: 'Trace the attacker\'s C2 infrastructure. Match TTPs to a known APT group profile. Complete the executive summary for the incident report.',
            requiredFlags: ['root'],
            mitre: ['T1071.001', 'T1583.001', 'T1588.002'],
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
                title: 'Read the ransom note and identify the threat',
                tip: 'Open the Terminal. Run: cat /cases/midnight/RANSOM_NOTE.txt — then check strings on the note file for hidden metadata.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Map the blast radius — which hosts are affected?',
                tip: 'Run: cat /cases/midnight/netlog_filesvr01.txt to review FILESVR-01\'s connections. Use the SIEM web app to cross-reference the timeline.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:netlog' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:siem' } },
                        { event: 'command', match: { cmd: 'contains:netstat' } }
                    ]
                }
            },
            {
                title: 'Analyze the memory dump — find the malware process',
                tip: 'After the user flag, run: volatility -f /cases/midnight/filesvr01.mem --profile=Win10x64 pslist — then use malfind or memdump to extract the key.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Decrypt the sample file using the extracted key',
                tip: 'After the internal flag, run: decrypt --key <KEY> /cases/midnight/samples/quarterly_report.xlsx.locked — then check backup integrity with backup-verify.',
                trigger: { event: 'flag_correct', match: { flagId: 'internal' } }
            },
            {
                title: 'Trace the C2 and attribute the attack',
                tip: 'Use the Threat Intel Platform in the browser. Look up the C2 IP and Bitcoin address. Match the TTP fingerprint to the APT group profile.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (SY0-701)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user',     objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Ransomware identification via note format, file extension, and embedded attacker metadata',            skill: 'Malware Identification & Indicator Analysis' },
            { flagId: 'internal', objective: '4.8', description: 'Explain the incident response process — Memory forensics, encryption key extraction, and infection vector identification from email artifacts',                         skill: 'Forensic Analysis & Incident Response' },
            { flagId: 'root',     objective: '2.5', description: 'Explain the importance of resilience and recovery in security architecture — Backup integrity verification, decryption, and C2 infrastructure attribution',           skill: 'Recovery, Attribution & Executive Reporting' },
            { flagId: 'root',     objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Threat group TTP matching and C2 infrastructure tracing to known APT actor',                            skill: 'Threat Intelligence & APT Attribution' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'IR Workstation BIOS v3.1.4',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB SSD), /dev/sdb1 (4TB Evidence NAS)',
            'Network: eth0 [IR-VLAN 172.16.99.0/24] — isolated from production',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'SIFT Workstation 3.4 (Forensic)',
            'SIFT Workstation 3.4 (Recovery Mode)',
            'Advanced options for SIFT Workstation'
        ],
        loginUser: 'investigator'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',       icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',        icon: '\uD83C\uDF10',        app: 'browser'  },
            { id: 'notes',    label: 'Case Notes',     icon: '\uD83D\uDCDD',        app: 'notes'    },
            { id: 'hints',    label: 'Hints',          icon: '\uD83D\uDCA1',        app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag',    icon: '\uD83D\uDEA9',        app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'investigator',
        hostname: 'ir-ws-01',
        startDir: '/home/investigator',
        welcome: 'SIFT Workstation 3.4 — Incident Response\nCase: Midnight Encryption | Opened: 2026-03-19 02:17:44 UTC\n\nEvidence path: /cases/midnight/\nType \'ls /cases/midnight/\' to begin triage.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state)
    // ═══════════════════════════════════════════════════════

    _context: 'ir-ws',          // 'ir-ws' only — this is a defensive box
    _ransomFamilyId: false,     // true once user identifies the ransomware family
    _blastRadiusMapped: false,  // true once network connections reviewed
    _memDumpAnalyzed: false,    // true once volatility run against memory dump
    _keyExtracted: false,       // true once encryption key found in memory
    _sampleDecrypted: false,    // true once decrypt command succeeds
    _backupsChecked: false,     // true once backup-verify run
    _c2Resolved: false,         // true once C2 IP queried in threat intel

    _switchContext(ctx, term) {
        C4Config._context = ctx;
    },

    _getPrompt() {
        return null;  // IR workstation uses default prompt throughout
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',     points: 100 },
        { id: 'internal', points: 150 },
        { id: 'root',     points: 250 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 150 },  // 45 minutes
        timeBonusThreshold: 5400                           // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Read /cases/midnight/RANSOM_NOTE.txt carefully. Then run: strings /cases/midnight/RANSOM_NOTE.txt — the attacker embedded a hidden identifier in the file metadata comments. That identifier is the user flag.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'For containment, read the network connection log: cat /cases/midnight/netlog_filesvr01.txt — then list which hosts have .locked files via the SIEM at http://siem.ir.local/. Cross-reference to build the blast radius.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Memory analysis: run volatility -f /cases/midnight/filesvr01.mem --profile=Win10x64 pslist — look for the suspicious process (svchost32.exe). Then: volatility ... malfind -p <PID> — the AES-128 key is 32 hex chars in the heap at offset 0x0048. The key is the internal flag.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Decrypt with: decrypt --key <KEY> /cases/midnight/samples/quarterly_report.xlsx.locked — verify with sha256sum. Then run backup-verify /mnt/backups/ — the root flag is embedded in the threat intel platform at http://threatintel.ir.local/ when you look up the C2 address 185.220.101.47.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'It\'s 2:17 AM. The on-call SOC analyst\'s phone explodes with alerts: FILESVR-01, the company file server, has gone offline. Within minutes the story is clear — ransomware. The file server holds payroll, contracts, and client deliverables. The ransom note is already on twelve desktops. Management is awake, lawyers are calling, and the clock is running. You\'re the IR team lead. Find the patient zero, contain the spread, recover what you can, and tell management who did this.',
        scenario: 'Meridian Logistics Group — a mid-size freight and supply chain operator — has been hit by a targeted ransomware campaign. The attacker phished an accounts payable clerk with a fake invoice attachment three weeks ago, established persistence, moved laterally to the file server, and detonated the payload at 02:00 AM on a Tuesday. FILESVR-01 is the primary victim, but the lateral movement logs suggest the infection spread before the payload triggered. The ransom demand is 4.2 BTC (~$420,000 USD). Backups exist — but are they clean? Management needs answers in four hours.',
        outro: 'Incident contained. The ransomware family is identified as DarkMidnight v2.1 — a RaaS variant operated by the threat group PHANTOM CIRCUIT. The encryption key, recovered from process memory, enabled partial file recovery. Clean backups from 72 hours prior are confirmed. The phishing email from three weeks ago was the entry point. The executive report is complete. PHANTOM CIRCUIT is attributed with high confidence.',
        ecer: {
            executive: 'C-suite approved a cost-cutting measure that delayed EDR deployment by six months — EDR on FILESVR-01 had been removed 90 days prior and not replaced',
            culture: 'Security awareness training was annual, not quarterly — the phished employee had not completed the most recent anti-phishing module',
            employee: 'The accounts payable clerk opened a macro-enabled Excel attachment from an unsolicited vendor email; macros were not disabled by policy on finance workstations',
            regulatory: 'Meridian handles freight manifests that include consumer PII — the breach triggered notification requirements under three state laws; no incident response retainer was in place'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Multi-tab: SIEM, VirusTotal clone, Threat Intel
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://siem.ir.local/',

        pages: {

            // ── SIEM Dashboard ──────────────────────────────
            'http://siem.ir.local/': {
                title: 'Meridian IR SIEM — Attack Timeline',
                html: `
                    <div style="text-align:center; margin-bottom:20px; padding-bottom:16px; border-bottom:2px solid #e67e22;">
                        <div style="color:#e67e22; font-size:0.7rem; font-weight:700; letter-spacing:0.2em;">MERIDIAN LOGISTICS GROUP</div>
                        <h1 style="color:#1a1a2e; font-size:1.4rem; margin:4px 0;">Security Incident & Event Manager</h1>
                        <div style="background:#c0392b; color:#fff; font-size:0.75rem; font-weight:700; padding:4px 12px; border-radius:3px; display:inline-block; margin-top:4px;">ACTIVE INCIDENT — CASE-2026-0319</div>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px;">
                        <div style="background:#fdf2ec; border:1px solid #e67e22; border-radius:6px; padding:12px; text-align:center;">
                            <div style="font-size:1.6rem; font-weight:700; color:#c0392b;">12</div>
                            <div style="color:#888; font-size:0.7rem;">Encrypted Hosts</div>
                        </div>
                        <div style="background:#fdf2ec; border:1px solid #e67e22; border-radius:6px; padding:12px; text-align:center;">
                            <div style="font-size:1.6rem; font-weight:700; color:#e67e22;">4.2</div>
                            <div style="color:#888; font-size:0.7rem;">BTC Demand</div>
                        </div>
                        <div style="background:#fdf2ec; border:1px solid #e67e22; border-radius:6px; padding:12px; text-align:center;">
                            <div style="font-size:1.6rem; font-weight:700; color:#2c3e50;">87,432</div>
                            <div style="color:#888; font-size:0.7rem;">Files Encrypted</div>
                        </div>
                        <div style="background:#fdf2ec; border:1px solid #e67e22; border-radius:6px; padding:12px; text-align:center;">
                            <div style="font-size:1.6rem; font-weight:700; color:#27ae60;">3</div>
                            <div style="color:#888; font-size:0.7rem;">Clean Backup Sets</div>
                        </div>
                    </div>

                    <h3 style="color:#2c3e50; font-size:0.9rem; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:6px;">Attack Timeline — 2026-03-19</h3>
                    <div style="font-family:monospace; font-size:0.75rem; line-height:2; color:#333;">
                        <div style="display:grid; grid-template-columns:140px 120px 1fr; gap:0 12px; background:#f9f9f9; padding:4px 8px; border-radius:3px; margin-bottom:2px; font-weight:700; color:#666;">
                            <span>TIMESTAMP (UTC)</span><span>HOST</span><span>EVENT</span>
                        </div>
                        <div style="display:grid; grid-template-columns:140px 120px 1fr; gap:0 12px; padding:3px 8px; border-left:3px solid #3498db;">
                            <span style="color:#888;">2026-03-01 09:14</span><span>FINWKS-04</span><span>Phishing email opened — attachment invoice_march.xlsm</span>
                        </div>
                        <div style="display:grid; grid-template-columns:140px 120px 1fr; gap:0 12px; padding:3px 8px; border-left:3px solid #3498db;">
                            <span style="color:#888;">2026-03-01 09:15</span><span>FINWKS-04</span><span>Macro execution — mshta.exe spawned from EXCEL.EXE</span>
                        </div>
                        <div style="display:grid; grid-template-columns:140px 120px 1fr; gap:0 12px; padding:3px 8px; border-left:3px solid #e67e22;">
                            <span style="color:#888;">2026-03-01 09:16</span><span>FINWKS-04</span><span>C2 beacon — outbound HTTPS to 185.220.101.47:443</span>
                        </div>
                        <div style="display:grid; grid-template-columns:140px 120px 1fr; gap:0 12px; padding:3px 8px; border-left:3px solid #e67e22;">
                            <span style="color:#888;">2026-03-04 — 03-18</span><span>MULTIPLE</span><span>Lateral movement via SMB/WMI — 18 day dwell time</span>
                        </div>
                        <div style="display:grid; grid-template-columns:140px 120px 1fr; gap:0 12px; padding:3px 8px; border-left:3px solid #e67e22;">
                            <span style="color:#888;">2026-03-18 23:58</span><span>FILESVR-01</span><span>Ransomware binary dropped — svchost32.exe (PID 4812)</span>
                        </div>
                        <div style="display:grid; grid-template-columns:140px 120px 1fr; gap:0 12px; padding:3px 8px; border-left:3px solid #c0392b;">
                            <span style="color:#888;">2026-03-19 02:00</span><span>FILESVR-01</span><span>Encryption detonation — 87,432 files targeted</span>
                        </div>
                        <div style="display:grid; grid-template-columns:140px 120px 1fr; gap:0 12px; padding:3px 8px; border-left:3px solid #c0392b;">
                            <span style="color:#888;">2026-03-19 02:04</span><span>12 HOSTS</span><span>Ransom note deployed — RANSOM_NOTE.txt written to desktops</span>
                        </div>
                        <div style="display:grid; grid-template-columns:140px 120px 1fr; gap:0 12px; padding:3px 8px; border-left:3px solid #c0392b;">
                            <span style="color:#888;">2026-03-19 02:17</span><span>SOC</span><span>Alert triggered — FILESVR-01 offline, IR team paged</span>
                        </div>
                    </div>

                    <div style="margin-top:16px; padding:12px; background:rgba(230,126,34,0.06); border:1px solid rgba(230,126,34,0.2); border-radius:4px; font-size:0.75rem; color:#888;">
                        <strong style="color:#e67e22;">IR Resources:</strong>
                        Navigate to <a href="http://siem.ir.local/hosts" style="color:#e67e22;">Affected Hosts</a> |
                        <a href="http://virustotal.ir.local/" style="color:#e67e22;">Hash Lookup</a> |
                        <a href="http://threatintel.ir.local/" style="color:#e67e22;">Threat Intel Platform</a>
                    </div>
                `,
                formHandler: null
            },

            'http://siem.ir.local/hosts': {
                title: 'SIEM — Affected Hosts Inventory',
                html: `
                    <div style="margin-bottom:16px;">
                        <a href="http://siem.ir.local/" style="color:#e67e22; font-size:0.8rem; text-decoration:none;">&larr; Back to Timeline</a>
                        <h2 style="color:#2c3e50; font-size:1.1rem; margin:8px 0 4px;">Blast Radius — Confirmed Encrypted Hosts</h2>
                        <div style="color:#888; font-size:0.75rem;">Last updated: 2026-03-19 02:47 UTC | Source: EDR telemetry + manual survey</div>
                    </div>

                    <table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
                        <thead>
                            <tr style="background:#fdf2ec; border-bottom:2px solid #e67e22;">
                                <th style="padding:8px; text-align:left; color:#e67e22;">Hostname</th>
                                <th style="padding:8px; text-align:left; color:#e67e22;">IP Address</th>
                                <th style="padding:8px; text-align:left; color:#e67e22;">Role</th>
                                <th style="padding:8px; text-align:left; color:#e67e22;">Status</th>
                                <th style="padding:8px; text-align:left; color:#e67e22;">Files Encrypted</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee; background:#fff5f5;">
                                <td style="padding:7px 8px; font-weight:700; color:#c0392b;">FILESVR-01</td>
                                <td style="padding:7px 8px; font-family:monospace;">10.10.5.10</td>
                                <td style="padding:7px 8px;">Primary File Server</td>
                                <td style="padding:7px 8px;"><span style="background:#c0392b; color:#fff; padding:2px 6px; border-radius:3px; font-size:0.7rem;">PATIENT ZERO</span></td>
                                <td style="padding:7px 8px; font-weight:700; color:#c0392b;">87,432</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:7px 8px;">FINWKS-04</td>
                                <td style="padding:7px 8px; font-family:monospace;">10.10.2.44</td>
                                <td style="padding:7px 8px;">Finance Workstation (initial infection)</td>
                                <td style="padding:7px 8px;"><span style="background:#e67e22; color:#fff; padding:2px 6px; border-radius:3px; font-size:0.7rem;">ENCRYPTED</span></td>
                                <td style="padding:7px 8px;">4,217</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:7px 8px;">OPSSVR-02</td>
                                <td style="padding:7px 8px; font-family:monospace;">10.10.5.22</td>
                                <td style="padding:7px 8px;">Operations Share Server</td>
                                <td style="padding:7px 8px;"><span style="background:#e67e22; color:#fff; padding:2px 6px; border-radius:3px; font-size:0.7rem;">ENCRYPTED</span></td>
                                <td style="padding:7px 8px;">12,088</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:7px 8px;">DC-01</td>
                                <td style="padding:7px 8px; font-family:monospace;">10.10.1.5</td>
                                <td style="padding:7px 8px;">Domain Controller</td>
                                <td style="padding:7px 8px;"><span style="background:#27ae60; color:#fff; padding:2px 6px; border-radius:3px; font-size:0.7rem;">CLEAN</span></td>
                                <td style="padding:7px 8px;">0</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:7px 8px;">BKPSVR-01</td>
                                <td style="padding:7px 8px; font-family:monospace;">10.10.8.5</td>
                                <td style="padding:7px 8px;">Backup Server (isolated)</td>
                                <td style="padding:7px 8px;"><span style="background:#27ae60; color:#fff; padding:2px 6px; border-radius:3px; font-size:0.7rem;">CLEAN</span></td>
                                <td style="padding:7px 8px;">0</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="margin-top:14px; padding:10px; background:rgba(39,174,96,0.06); border:1px solid rgba(39,174,96,0.2); border-radius:4px; font-size:0.75rem; color:#27ae60;">
                        <strong>Good news:</strong> BKPSVR-01 is isolated and clean. Last known-good backup: 2026-03-16 03:00 UTC (72 hours before detonation). Verify backup integrity before restore.
                    </div>
                `,
                formHandler: null
            },

            // ── VirusTotal Clone (hash lookup) ──────────────
            'http://virustotal.ir.local/': {
                title: 'IR HashCheck — Malware Hash Lookup',
                html: `
                    <div style="text-align:center; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid #ddd;">
                        <div style="color:#e67e22; font-size:0.7rem; font-weight:700; letter-spacing:0.2em;">IR HASHCHECK</div>
                        <div style="color:#2c3e50; font-size:1.3rem; font-weight:700; margin-top:4px;">Malware Hash Intelligence</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:4px;">Threat feed aggregator — offline IR edition</div>
                    </div>

                    <div style="max-width:580px; margin:0 auto 20px;">
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="hash" placeholder="Enter MD5, SHA1, or SHA256 hash..."
                                   style="flex:1; padding:10px 14px; border:1px solid #ccc; border-radius:4px; font-family:monospace; font-size:0.82rem;">
                            <button data-action="lookup"
                                    style="padding:10px 22px; background:#e67e22; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Lookup</button>
                        </div>
                    </div>

                    <div style="max-width:580px; margin:0 auto; padding:12px; background:#f8f9fa; border-radius:6px; font-size:0.75rem; color:#888; border:1px solid #eee;">
                        <strong>Try these hashes from the case:</strong><br>
                        <code style="color:#e67e22;">a3f9c8d2e1b047a65c3901f28d7e4b92</code> — svchost32.exe (MD5)<br>
                        <code style="color:#e67e22;">8b4f1c9e3d2a06b74e5c18f92a3d70b1</code> — invoice_march.xlsm (MD5)
                    </div>
                `,
                formHandler: function(data, engine) {
                    const hash = (data.hash || '').trim().toLowerCase();
                    if (!hash) return '<div style="color:#c0392b; padding:10px;">Please enter a hash value.</div>';

                    // Ransomware binary hash
                    if (hash === 'a3f9c8d2e1b047a65c3901f28d7e4b92') {
                        C4Config._memDumpAnalyzed = true;
                        return `<div style="margin-top:16px; border:2px solid #c0392b; border-radius:8px; overflow:hidden;">
                            <div style="background:#c0392b; color:#fff; padding:10px 14px; font-weight:700; font-size:0.85rem;">MALICIOUS — 61 / 72 vendors detected</div>
                            <div style="padding:14px; font-size:0.78rem; line-height:1.8;">
                                <div style="display:grid; grid-template-columns:140px 1fr; gap:4px 12px;">
                                    <span style="color:#888;">Name:</span><span style="font-weight:700;">DarkMidnight Ransomware v2.1</span>
                                    <span style="color:#888;">Family:</span><span>DarkMidnight (RaaS)</span>
                                    <span style="color:#888;">Type:</span><span>Ransomware, Trojan-Ransom</span>
                                    <span style="color:#888;">File:</span><span style="font-family:monospace;">svchost32.exe</span>
                                    <span style="color:#888;">SHA256:</span><span style="font-family:monospace; font-size:0.72rem;">e4b9c3f1a08d27e6b5c92f10a3d84e71c58b2f9e0d6a13c4b7e29f08d51a3c6</span>
                                    <span style="color:#888;">First seen:</span><span>2025-11-14</span>
                                    <span style="color:#888;">Extension:</span><span style="font-family:monospace;">.locked</span>
                                    <span style="color:#888;">Algorithm:</span><span>AES-128-CBC + RSA-2048 (key encapsulation)</span>
                                    <span style="color:#888;">C2:</span><span style="font-family:monospace;">185.220.101.47:443 (HTTPS)</span>
                                    <span style="color:#888;">Threat Group:</span><span>PHANTOM CIRCUIT (suspected)</span>
                                </div>
                            </div>
                        </div>`;
                    }

                    // Phishing attachment hash
                    if (hash === '8b4f1c9e3d2a06b74e5c18f92a3d70b1') {
                        return `<div style="margin-top:16px; border:2px solid #e67e22; border-radius:8px; overflow:hidden;">
                            <div style="background:#e67e22; color:#fff; padding:10px 14px; font-weight:700; font-size:0.85rem;">MALICIOUS — 44 / 72 vendors detected</div>
                            <div style="padding:14px; font-size:0.78rem; line-height:1.8;">
                                <div style="display:grid; grid-template-columns:140px 1fr; gap:4px 12px;">
                                    <span style="color:#888;">Name:</span><span style="font-weight:700;">Trojan-Downloader.Macro.PhantomDrop</span>
                                    <span style="color:#888;">Type:</span><span>Macro Downloader, Dropper</span>
                                    <span style="color:#888;">File:</span><span style="font-family:monospace;">invoice_march.xlsm</span>
                                    <span style="color:#888;">Technique:</span><span>VBA macro, mshta.exe LOLBin, HTA payload</span>
                                    <span style="color:#888;">Payload:</span><span>Downloads Cobalt Strike beacon from C2</span>
                                    <span style="color:#888;">First seen:</span><span>2025-10-31</span>
                                    <span style="color:#888;">Cluster:</span><span>PHANTOM CIRCUIT initial access TTPs</span>
                                </div>
                            </div>
                        </div>`;
                    }

                    return `<div style="margin-top:16px; border:1px solid #eee; border-radius:8px; padding:16px; text-align:center; color:#888; font-size:0.82rem;">
                        <strong style="color:#27ae60;">No matches found</strong><br>Hash not found in threat feed database. File may be clean or novel.
                    </div>`;
                }
            },

            // ── Threat Intelligence Platform ─────────────────
            'http://threatintel.ir.local/': {
                title: 'Threat Intel Platform — APT Profiles',
                html: `
                    <div style="text-align:center; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid #ddd;">
                        <div style="color:#e67e22; font-size:0.7rem; font-weight:700; letter-spacing:0.2em;">MERIDIAN IR — THREAT INTEL PLATFORM</div>
                        <div style="color:#2c3e50; font-size:1.3rem; font-weight:700; margin-top:4px;">APT Group Intelligence & Infrastructure Lookup</div>
                    </div>

                    <div style="max-width:580px; margin:0 auto 20px;">
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="ioc" placeholder="Enter IP, domain, or Bitcoin address..."
                                   style="flex:1; padding:10px 14px; border:1px solid #ccc; border-radius:4px; font-family:monospace; font-size:0.82rem;">
                            <button data-action="lookup"
                                    style="padding:10px 22px; background:#e67e22; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Lookup IOC</button>
                        </div>
                    </div>

                    <div style="max-width:580px; margin:0 auto;">
                        <h3 style="color:#2c3e50; font-size:0.9rem; margin-bottom:10px;">Known APT Groups — RaaS Operators</h3>
                        <div style="display:grid; gap:8px;">
                            <div style="padding:10px; background:#f9f9f9; border:1px solid #eee; border-radius:6px; font-size:0.78rem;">
                                <strong style="color:#c0392b;">PHANTOM CIRCUIT</strong> — Eastern European RaaS operator. DarkMidnight v1.x/v2.x. Finance and logistics targeting. C2: Bulletproof hosting, .onion secondary. Active since Q4 2024.
                            </div>
                            <div style="padding:10px; background:#f9f9f9; border:1px solid #eee; border-radius:6px; font-size:0.78rem;">
                                <strong style="color:#888;">IRON SERPENT</strong> — Healthcare sector ransomware. BlackIron family. No relation to this incident.
                            </div>
                            <div style="padding:10px; background:#f9f9f9; border:1px solid #eee; border-radius:6px; font-size:0.78rem;">
                                <strong style="color:#888;">VELVET HAMMER</strong> — Critical infrastructure. Wiper component. No relation to this incident.
                            </div>
                        </div>
                        <div style="margin-top:12px; font-size:0.73rem; color:#aaa; text-align:center;">
                            Tip: Look up IOC <code style="color:#e67e22;">185.220.101.47</code> or Bitcoin address <code style="color:#e67e22;">bc1q9xm4p7fkj3r8v2e5n0g6w1d8c3a4h7b5s2t0q</code>
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    const ioc = (data.ioc || '').trim();
                    if (!ioc) return '<div style="color:#c0392b; padding:10px;">Please enter an IOC to look up.</div>';

                    // C2 IP lookup — triggers c2Resolved and provides root flag path
                    if (ioc.includes('185.220.101.47')) {
                        C4Config._c2Resolved = true;
                        if (engine) engine.advancePhase && engine.advancePhase('attribution');
                        return `<div style="margin-top:16px; border:2px solid #c0392b; border-radius:8px; overflow:hidden;">
                            <div style="background:#c0392b; color:#fff; padding:10px 14px; font-weight:700; font-size:0.85rem;">HIGH CONFIDENCE MATCH — PHANTOM CIRCUIT C2 Node</div>
                            <div style="padding:14px; font-size:0.78rem; line-height:1.9;">
                                <div style="display:grid; grid-template-columns:160px 1fr; gap:4px 12px;">
                                    <span style="color:#888;">IP Address:</span><span style="font-family:monospace;">185.220.101.47</span>
                                    <span style="color:#888;">ASN:</span><span>AS205100 — F3 Netze e.V. (bulletproof hosting, DE)</span>
                                    <span style="color:#888;">Hosting:</span><span>Known PHANTOM CIRCUIT bulletproof infrastructure</span>
                                    <span style="color:#888;">First C2 seen:</span><span>2025-11-02</span>
                                    <span style="color:#888;">Campaigns:</span><span>DarkMidnight v2.1, PhantomDrop downloader</span>
                                    <span style="color:#888;">Staging domain:</span><span style="font-family:monospace;">update.svchost-cdn.net (sinkholed 2026-01-15)</span>
                                    <span style="color:#888;">Secondary C2:</span><span style="font-family:monospace;">phantom7xrkz4kq2.onion (Tor)</span>
                                    <span style="color:#888;">Attribution:</span><span style="font-weight:700; color:#c0392b;">PHANTOM CIRCUIT — HIGH CONFIDENCE</span>
                                    <span style="color:#888;">Staging key:</span><span style="font-family:monospace; font-size:0.7rem; color:#e67e22;">{{FLAG:root}}</span>
                                </div>
                                <div style="margin-top:10px; padding:8px; background:rgba(192,57,43,0.06); border-radius:4px; font-size:0.72rem; color:#888;">
                                    The staging server at update.svchost-cdn.net was used to deliver the DarkMidnight binary to FILESVR-01 after lateral movement was complete. Domain sinkholed by CISA in January 2026 — but this campaign predates the takedown.
                                </div>
                            </div>
                        </div>`;
                    }

                    // Bitcoin address lookup
                    if (ioc.includes('bc1q9xm4p7fkj3r8v2e5n0g6w1d8c3a4h7b5s2t0q')) {
                        return `<div style="margin-top:16px; border:2px solid #e67e22; border-radius:8px; overflow:hidden;">
                            <div style="background:#e67e22; color:#fff; padding:10px 14px; font-weight:700; font-size:0.85rem;">MATCH — Ransomware Payment Wallet</div>
                            <div style="padding:14px; font-size:0.78rem; line-height:1.9;">
                                <div style="display:grid; grid-template-columns:160px 1fr; gap:4px 12px;">
                                    <span style="color:#888;">Bitcoin Address:</span><span style="font-family:monospace; font-size:0.7rem;">bc1q9xm4p7fkj3r8v2e5n0g6w1d8c3a4h7b5s2t0q</span>
                                    <span style="color:#888;">Cluster:</span><span>PHANTOM CIRCUIT payment cluster (32 wallets)</span>
                                    <span style="color:#888;">Total received:</span><span>61.4 BTC (~$6.14M USD)</span>
                                    <span style="color:#888;">Victims paid:</span><span>14 confirmed</span>
                                    <span style="color:#888;">Mixers used:</span><span>Tornado Cash successor (chipmixer-style)</span>
                                    <span style="color:#888;">Attribution:</span><span style="font-weight:700; color:#e67e22;">PHANTOM CIRCUIT — HIGH CONFIDENCE</span>
                                </div>
                                <div style="margin-top:10px; padding:8px; background:rgba(230,126,34,0.06); border-radius:4px; font-size:0.72rem; color:#888;">
                                    Do not pay. FBI/CISA guidance: payment funds future attacks and does not guarantee decryption. 72% of organizations that paid were re-attacked within 12 months.
                                </div>
                            </div>
                        </div>`;
                    }

                    // PHANTOM CIRCUIT group profile lookup
                    if (ioc.toLowerCase().includes('phantom') || ioc.toLowerCase().includes('darkmidnight')) {
                        return `<div style="margin-top:16px; border:1px solid #c0392b; border-radius:8px; padding:16px; font-size:0.78rem; line-height:1.9;">
                            <div style="font-weight:700; color:#c0392b; font-size:0.9rem; margin-bottom:8px;">PHANTOM CIRCUIT — Full Group Profile</div>
                            <div style="display:grid; grid-template-columns:160px 1fr; gap:4px 12px;">
                                <span style="color:#888;">Suspected origin:</span><span>Eastern Europe (RU/UA nexus, unconfirmed)</span>
                                <span style="color:#888;">Active since:</span><span>Q4 2024</span>
                                <span style="color:#888;">Model:</span><span>Ransomware-as-a-Service (RaaS) — affiliate-based</span>
                                <span style="color:#888;">Target sectors:</span><span>Logistics, finance, healthcare, manufacturing</span>
                                <span style="color:#888;">Average dwell:</span><span>14–21 days before detonation</span>
                                <span style="color:#888;">Initial access:</span><span>Phishing (macro droppers), exposed RDP, VPN exploitation</span>
                                <span style="color:#888;">Tools:</span><span>Cobalt Strike, Mimikatz, PsExec, WMI, BITS jobs</span>
                                <span style="color:#888;">Ransom range:</span><span>$80K–$5M USD (adjusted per victim revenue)</span>
                                <span style="color:#888;">Key MITRE ATTs:</span><span>T1566.001, T1059.005, T1021.002, T1486, T1490</span>
                            </div>
                        </div>`;
                    }

                    return `<div style="margin-top:16px; border:1px solid #eee; border-radius:8px; padding:16px; text-align:center; color:#888; font-size:0.82rem;">
                        <strong style="color:#27ae60;">No records found</strong><br>This IOC is not in the current threat feed database.
                    </div>`;
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — IR Workstation
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'investigator': {
                            type: 'dir',
                            children: {
                                'case_notes.txt': {
                                    type: 'file',
                                    content: '=== IR CASE NOTES — CASE-2026-0319 ===\nCase Lead: Investigator\nOpened: 2026-03-19 02:17 UTC\nClient: Meridian Logistics Group\nIncident: Ransomware — DarkMidnight suspected\n\nTODO:\n[ ] Identify ransomware family from note\n[ ] Map blast radius — affected hosts\n[ ] Analyze FILESVR-01 memory dump\n[ ] Extract encryption key from memory\n[ ] Verify backup integrity\n[ ] Attribute to threat group\n[ ] Complete exec report\n\nKey paths:\n/cases/midnight/        — evidence\n/mnt/backups/           — backup NAS\n/tools/                 — forensic tools\n\nDo NOT restore from backups until integrity is verified.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /cases/midnight/\ncat /cases/midnight/RANSOM_NOTE.txt\nstrings /cases/midnight/RANSOM_NOTE.txt\nvolatility -f /cases/midnight/filesvr01.mem --profile=Win10x64 pslist\nhashdeep -r /mnt/backups/'
                                }
                            }
                        }
                    }
                },
                'cases': {
                    type: 'dir',
                    children: {
                        'midnight': {
                            type: 'dir',
                            children: {
                                'RANSOM_NOTE.txt': {
                                    type: 'file',
                                    content: '======================================================\n  D A R K M I D N I G H T   R A N S O M W A R E\n         Version 2.1 | Powered by PHANTOM CIRCUIT\n======================================================\n\nYour files have been encrypted.\n\nAll documents, databases, and backups on this system\nhave been encrypted with military-grade AES-128-CBC\nencryption. Your unique decryption key is stored\nsecurely on our servers.\n\nPRICE: 4.2 BTC (~$420,000 USD)\n\nSend payment to:\n  bc1q9xm4p7fkj3r8v2e5n0g6w1d8c3a4h7b5s2t0q\n\nAfter payment, email your victim ID to:\n  decrypt@phantom-support.onion (Tor required)\n\nVICTIM ID: MLG-20260319-4821\n\nYOU HAVE 72 HOURS.\n\nDo not attempt decryption. Do not contact law enforcement.\nEvery action you take adds $50,000 to the price.\n\n======================================================\n\n; DarkMidnight v2.1 note template — affiliate ID: PC-AFF-0047\n; Operator: PHANTOM CIRCUIT | Campaign: LOGISTICS-SWEEP-Q1-2026\n; {{FLAG:user}}\n; Generator: darkmidnight-notegen.py v2.1.0\n======================================================'
                                },
                                'netlog_filesvr01.txt': {
                                    type: 'file',
                                    content: '=== NETWORK CONNECTIONS — FILESVR-01 (10.10.5.10) ===\nCaptured: 2026-03-19 02:05 UTC (post-encryption, pre-isolation)\n\nProto   Local Address          Foreign Address         State\nTCP     10.10.5.10:445         10.10.2.44:51234        ESTABLISHED   <- FINWKS-04 (patient zero origin)\nTCP     10.10.5.10:445         10.10.5.22:49821        ESTABLISHED   <- OPSSVR-02 (lateral spread)\nTCP     10.10.5.10:445         10.10.2.31:52109        TIME_WAIT     <- ACTWKS-01\nTCP     10.10.5.10:445         10.10.2.38:49901        TIME_WAIT     <- MGMTWKS-03\nTCP     10.10.5.10:49152       185.220.101.47:443      ESTABLISHED   <- C2 BEACON (ACTIVE)\nTCP     10.10.5.10:49153       185.220.101.47:443      CLOSE_WAIT    <- C2 exfil (key transmission)\nTCP     10.10.5.10:139         10.10.1.5:55312         ESTABLISHED   <- DC-01 (domain traffic — normal)\nUDP     10.10.5.10:137         *:*                                   NetBIOS Name Service\nUDP     10.10.5.10:138         *:*                                   NetBIOS Datagram\n\n=== PROCESS THAT OWNS C2 CONNECTION ===\nPID 4812 (svchost32.exe) owns connections to 185.220.101.47:443\nParent: PID 1024 (services.exe) <- UNUSUAL: malware masquerading as svchost\nCommand line: C:\\Windows\\Temp\\svchost32.exe --encrypt --key-server 185.220.101.47\n\n=== ISOLATED SEGMENT RECOMMENDATION ===\nIsolate: 10.10.2.0/24 (Finance VLAN) + 10.10.5.0/24 (Server VLAN)\nPreserve: 10.10.1.0/24 (Domain VLAN) + 10.10.8.0/24 (Backup VLAN — already isolated)'
                                },
                                'email_headers_initial.txt': {
                                    type: 'file',
                                    content: '=== PHISHING EMAIL — RECOVERED FROM FINWKS-04 OUTLOOK PST ===\nExtracted: 2026-03-19 03:15 UTC\n\nDelivered-To: sarah.chen@meridianlogistics.com\nReceived: from mail.fake-freightpartner.net (185.220.101.89)\n        by mx1.meridianlogistics.com (Postfix)\n        with ESMTP id A3F9B8D2C4\n        for <sarah.chen@meridianlogistics.com>\n        2026-03-01 09:12:44 -0500 (EST)\nFrom: "FP Invoicing" <invoices@fake-freightpartner.net>\nTo: sarah.chen@meridianlogistics.com\nSubject: URGENT: March Invoice #INV-2026-0301 — Action Required\nDate: Sat, 01 Mar 2026 09:12:11 -0500\nMIME-Version: 1.0\nContent-Type: multipart/mixed; boundary="----=_Part_94821_3047281.1740838331"\nX-Mailer: Microsoft Outlook 16.0\nX-Originating-IP: 185.220.101.89\nMessage-ID: <20260301141211.94821.3047281@fake-freightpartner.net>\n\n----=_Part_94821_3047281.1740838331\nContent-Type: text/html; charset="UTF-8"\n\n<html><body>\nDear Sarah,<br><br>\nPlease find attached the outstanding invoice for March freight services.\n<strong>Payment is overdue — please process by end of business today.</strong><br><br>\nOpen the attached Excel file and enable macros to view the itemized billing.\n<br><br>Regards,<br>FP Invoicing Team\n</body></html>\n\n----=_Part_94821_3047281.1740838331\nContent-Type: application/vnd.ms-excel.sheet.macroenabled.12\nContent-Disposition: attachment; filename="invoice_march.xlsm"\nContent-Transfer-Encoding: base64\n\n[BASE64 PAYLOAD — MD5: 8b4f1c9e3d2a06b74e5c18f92a3d70b1]\n[Decoded: VBA macro dropper — downloads svchost32.exe from C2]\n----=_Part_94821_3047281.1740838331--\n\n=== SPF/DKIM ANALYSIS ===\nSPF: FAIL (IP 185.220.101.89 not authorized for fake-freightpartner.net)\nDKIM: NONE (no DKIM signature present)\nDMARC: FAIL (domain has no DMARC policy)\n\nConclusion: Spoofed sender domain. SPF/DKIM/DMARC all failed.'
                                },
                                'filesvr01.mem': {
                                    type: 'file',
                                    content: '[BINARY MEMORY DUMP — filesvr01.mem]\nSize: 32GB | Acquired: 2026-03-19 02:35 UTC via WinPMem\nHash (MD5): d4e8f2c1a09b37e5d6c84f17b2e93a04\n\nThis is a raw memory image. Use volatility to analyze.\n\nExample commands:\n  volatility -f filesvr01.mem --profile=Win10x64 pslist\n  volatility -f filesvr01.mem --profile=Win10x64 pstree\n  volatility -f filesvr01.mem --profile=Win10x64 cmdline -p 4812\n  volatility -f filesvr01.mem --profile=Win10x64 malfind -p 4812\n  volatility -f filesvr01.mem --profile=Win10x64 memdump -p 4812 -D /tmp/\n  strings /tmp/4812.dmp | grep -E "[0-9a-f]{32}"\n\n[Cannot display raw binary — use volatility commands]'
                                },
                                'samples': {
                                    type: 'dir',
                                    children: {
                                        'quarterly_report.xlsx.locked': {
                                            type: 'file',
                                            content: '[ENCRYPTED FILE — quarterly_report.xlsx.locked]\nOriginal: quarterly_report.xlsx\nEncrypted: AES-128-CBC\nKey ID: MLG-20260319-4821\n\nHeader magic: DKMID2\\x01\\x00\nEncrypted key blob (RSA-2048): [2048-bit blob]\nIV: \\x9f\\x3a\\xb2\\xc1\\x04\\xe7\\xd8\\x5f\\x1a\\x2b\\x6c\\x0d\\x9e\\x4f\\x7a\\x83\n\nFile cannot be opened. Use decrypt tool with the recovered key.\nSee: decrypt --help'
                                        },
                                        'employee_list.docx.locked': {
                                            type: 'file',
                                            content: '[ENCRYPTED FILE — employee_list.docx.locked]\nOriginal: employee_list.docx\nEncrypted: AES-128-CBC\nKey ID: MLG-20260319-4821\n\n[Cannot be opened without decryption key]'
                                        },
                                        'payroll_march.xlsx.locked': {
                                            type: 'file',
                                            content: '[ENCRYPTED FILE — payroll_march.xlsx.locked]\nOriginal: payroll_march.xlsx\nEncrypted: AES-128-CBC\nKey ID: MLG-20260319-4821\n\n[Cannot be opened without decryption key]'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'mnt': {
                    type: 'dir',
                    children: {
                        'backups': {
                            type: 'dir',
                            children: {
                                'backup_2026-03-16_03-00.tar.gz': {
                                    type: 'file',
                                    content: '[BACKUP ARCHIVE — backup_2026-03-16_03-00.tar.gz]\nDate: 2026-03-16 03:00 UTC\nSize: 847.3 GB\nMD5: c8a3f19e4b2d07c65e90f18a3d74b82c\nStatus: UNVERIFIED — run backup-verify to check integrity\n\nContents: Full backup of FILESVR-01 share at snapshot time\nNote: This backup predates ransomware detonation by 72 hours.'
                                },
                                'backup_2026-03-17_03-00.tar.gz': {
                                    type: 'file',
                                    content: '[BACKUP ARCHIVE — backup_2026-03-17_03-00.tar.gz]\nDate: 2026-03-17 03:00 UTC\nSize: 849.1 GB\nMD5: a7f2c8e1d04b39e6b5c91f17a2d84e70\nStatus: UNVERIFIED — run backup-verify to check integrity\n\nNote: Ransomware had lateral movement access to the network on this date.\nVerify before trusting.'
                                },
                                'backup_2026-03-18_03-00.tar.gz': {
                                    type: 'file',
                                    content: '[BACKUP ARCHIVE — backup_2026-03-18_03-00.tar.gz]\nDate: 2026-03-18 03:00 UTC\nSize: 851.7 GB\nMD5: FAILED — HASH MISMATCH DETECTED\nStatus: COMPROMISED — backup taken after ransomware was deployed to FILESVR-01\n\n[WARNING: Do not restore this backup. It may contain encrypted files.]'
                                }
                            }
                        }
                    }
                },
                'tools': {
                    type: 'dir',
                    children: {
                        'volatility': {
                            type: 'file',
                            content: 'Volatility 2.6 — Advanced Memory Analysis Framework\nUsage: volatility -f <memory_image> --profile=<profile> <plugin> [options]\n\nCommon plugins:\n  pslist     -- List processes\n  pstree     -- Process tree (shows parent-child)\n  cmdline    -- Process command lines\n  malfind    -- Find injected code / suspicious memory regions\n  memdump    -- Dump process memory to file\n  netscan    -- Network connections from memory\n  filescan   -- File objects in memory\n  dumpfiles  -- Extract files from memory\n\nProfiles: Win10x64, Win10x86, Win2019x64, WinXPSP2x86'
                        },
                        'decrypt': {
                            type: 'file',
                            content: 'DarkMidnight Decryption Tool v1.0 (IR Edition)\nUsage: decrypt --key <AES_KEY_HEX> <encrypted_file>\n\nExample:\n  decrypt --key a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6 file.xlsx.locked\n\nThe key must be 32 hexadecimal characters (128-bit AES key).\nExtract the key from process memory using volatility malfind.\n\nOptions:\n  --verify    Verify file hash after decryption\n  --output    Specify output filename\n  --batch     Decrypt all .locked files in a directory'
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'ir-ws-01'
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1   localhost\n172.16.99.10  ir-ws-01\n\n# IR internal services (isolated VLAN)\n172.16.99.20  siem.ir.local\n172.16.99.21  virustotal.ir.local\n172.16.99.22  threatintel.ir.local'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ninvestigator:x:1000:1000:IR Investigator:/home/investigator:/bin/bash\nsansforensics:x:1001:1001:SANS SIFT:/home/sansforensics:/bin/bash'
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
    // TERMINAL COMMANDS (IR forensic toolset)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── volatility — memory forensics ───────────────────
        'volatility': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (args.length === 0) return 'Usage: volatility -f <memory_image> --profile=<profile> <plugin>\nSee /tools/volatility for help.';

            // Must reference the memory dump
            if (!fullCmd.includes('filesvr01.mem') && !fullCmd.includes('filesvr01') && !fullCmd.includes('.mem')) {
                return 'ERROR: No memory image specified or image not found.\nUsage: volatility -f /cases/midnight/filesvr01.mem --profile=Win10x64 <plugin>';
            }

            // pslist / pstree
            if (fullCmd.includes('pslist') || fullCmd.includes('pstree')) {
                C4Config._memDumpAnalyzed = true;
                if (engine) engine.advancePhase && engine.advancePhase('forensics');
                return `Volatility Foundation Volatility Framework 2.6
Name                  PID   PPID  Thds  Hnds  Sess  Wow64 Start
--------------------- ----- ----- ----- ----- ----- ----- ----------------------------
System                   4      0    84   424 -----      0 2026-03-18 22:00:01
smss.exe               332      4     2    29 -----      0 2026-03-18 22:00:01
csrss.exe              456    448     9   483     0      0 2026-03-18 22:00:04
wininit.exe            508    448     1    75     0      0 2026-03-18 22:00:04
services.exe          1024    508    11   420     0      0 2026-03-18 22:00:05
lsass.exe             1032    508     7   900     0      0 2026-03-18 22:00:05
svchost.exe           1104   1024    22  1483     0      0 2026-03-18 22:00:06
svchost.exe           1196   1024    12   563     0      0 2026-03-18 22:00:06
svchost.exe           1284   1024    41  1273     0      0 2026-03-18 22:00:07
svchost.exe           1376   1024    21   748     0      0 2026-03-18 22:00:07
svchost.exe           2104   1024    14   382     0      0 2026-03-18 22:00:12
spoolsv.exe           2212   1024     7   285     0      0 2026-03-18 22:00:14
svchost.exe           2416   1024     6   392     0      0 2026-03-18 22:00:15
WmiPrvSE.exe          3284   1024     8   204     0      0 2026-03-19 01:58:13
svchost32.exe         4812   1024    16   621     0      0 2026-03-19 01:58:47  <- SUSPICIOUS
explorer.exe          5024   4980     9   891     1      0 2026-03-19 02:00:01
OneDrive.exe          5312   5024     3    94     1      0 2026-03-19 02:00:03

[!] SUSPICIOUS PROCESS: svchost32.exe (PID 4812)
    Masquerading as svchost.exe but has different name + non-standard parent timing
    Located in C:\\Windows\\Temp\\ (not System32)
    Run cmdline or malfind for more detail.`;
            }

            // cmdline
            if (fullCmd.includes('cmdline')) {
                const pidMatch = fullCmd.match(/-p\s+(\d+)/);
                const pid = pidMatch ? pidMatch[1] : null;
                if (pid === '4812' || fullCmd.includes('4812')) {
                    return `Volatility Foundation Volatility Framework 2.6
svchost32.exe PID   4812
Command line: C:\\Windows\\Temp\\svchost32.exe --encrypt --key-server 185.220.101.47 --victim-id MLG-20260319-4821 --threads 8

[!] Note: Binary in C:\\Windows\\Temp\\ — legitimate svchost.exe lives in C:\\Windows\\System32\\
[!] Command line confirms: encryption binary communicating with C2 185.220.101.47`;
                }
                return `Volatility Foundation Volatility Framework 2.6
[Showing all process command lines — use -p <PID> to filter]
svchost.exe PID 1104: C:\\Windows\\System32\\svchost.exe -k DcomLaunch -p
svchost.exe PID 1196: C:\\Windows\\System32\\svchost.exe -k RPCSS
svchost32.exe PID 4812: C:\\Windows\\Temp\\svchost32.exe --encrypt --key-server 185.220.101.47 --victim-id MLG-20260319-4821 --threads 8
...`;
            }

            // malfind — finds the AES key in heap
            if (fullCmd.includes('malfind')) {
                C4Config._keyExtracted = true;
                const pidMatch = fullCmd.match(/-p\s+(\d+)/);
                const pid = pidMatch ? pidMatch[1] : 'all';
                return `Volatility Foundation Volatility Framework 2.6
Process: svchost32.exe PID: 4812 Address: 0x00400000 Vad Tag: VadS Protection: PAGE_EXECUTE_READWRITE

0x00400000  4d 5a 90 00 03 00 00 00  04 00 00 00 ff ff 00 00  MZ..............
0x00400010  b8 00 00 00 00 00 00 00  40 00 00 00 00 00 00 00  ........@.......

Process: svchost32.exe PID: 4812 Address: 0x02A80000 Vad Tag: VadS Protection: PAGE_READWRITE
[Heap region — suspicious strings detected]

HEAP OFFSET 0x0048:
  AES SESSION KEY (plaintext in heap — not yet cleared):
  61 37 66 32 63 38 62 34  64 33 65 39 66 30 61 31  a7f2c8b4d3e9f0a1
  62 35 63 36 64 37 65 38  66 39 61 30 62 31 63 32  b5c6d7e8f9a0b1c2

  KEY (hex string): a7f2c8b4d3e9f0a1b5c6d7e8f9a0b1c2
  Length: 32 hex chars = 128-bit AES key (AES-128-CBC)

[!] AES session key recovered from process heap.
[!] This is the symmetric key used to encrypt files on this system.
[!] The key embedded in the ransom note header is: {{FLAG:internal}}
[!] Use: decrypt --key a7f2c8b4d3e9f0a1b5c6d7e8f9a0b1c2 <file>.locked`;
            }

            // netscan — network connections from memory
            if (fullCmd.includes('netscan')) {
                return `Volatility Foundation Volatility Framework 2.6
Offset     Proto  Local Address          Foreign Address      State      PID  Owner
---------- ------ ---------------------- -------------------- ---------- ---- ---------------
0x3f8a1240 TCPv4  10.10.5.10:445         10.10.2.44:51234     ESTABLISHED 4  System
0x3f8a2180 TCPv4  10.10.5.10:445         10.10.5.22:49821     ESTABLISHED 4  System
0x3f9c4800 TCPv4  10.10.5.10:49152       185.220.101.47:443   ESTABLISHED 4812 svchost32.exe
0x3f9c5040 TCPv4  10.10.5.10:49153       185.220.101.47:443   CLOSE_WAIT  4812 svchost32.exe
0x3fa10240 TCPv4  10.10.5.10:139         10.10.1.5:55312      ESTABLISHED 4  System
0x3fa21000 UDPv4  10.10.5.10:137         *:*                             4  System

[!] PID 4812 (svchost32.exe) owns the C2 connections to 185.220.101.47:443`;
            }

            // memdump
            if (fullCmd.includes('memdump')) {
                return `Volatility Foundation Volatility Framework 2.6
Writing svchost32.exe [ 4812] to /tmp/4812.dmp
[+] Memory dump complete: /tmp/4812.dmp (847 MB)
[+] Next step: strings /tmp/4812.dmp | grep -E "[0-9a-f]{32}"
    This will surface any 32-char hex strings (potential AES keys) in the dump.`;
            }

            // dumpfiles
            if (fullCmd.includes('dumpfiles')) {
                return `Volatility Foundation Volatility Framework 2.6
Dumping files from memory...
DataSectionObject 0x3f9a2140  4812   \ImageSectionObject C:\\Windows\\Temp\\svchost32.exe
[+] File written: /tmp/file.4812.0x3f9a2140.dat
[+] Next step: run this binary through /cases/midnight/virustotal or hash-check.`;
            }

            // filescan
            if (fullCmd.includes('filescan')) {
                return `Volatility Foundation Volatility Framework 2.6
Offset     #Ptr #Hnd Access Name
---------- ---- ---- ------ ----
0x3f800240    3    0 R--r-d C:\\Windows\\System32\\ntdll.dll
0x3f801480    2    1 R--r-d C:\\Windows\\System32\\kernel32.dll
0x3f9a2140   16    0 R--r-d C:\\Windows\\Temp\\svchost32.exe
0x3f9a3000    4    0 RW---- C:\\Users\\FILESVR-01\\AppData\\Local\\Temp\\enc.log
0x3fa00800    8    0 RW-rwd \\Device\\NamedPipe\\ransomware_ipc`;
            }

            return `Volatility Foundation Volatility Framework 2.6
ERROR: Plugin not found or unrecognized option.
Run: volatility --help to see available plugins.`;
        },

        // ── strings — extract printable strings from binary ──
        'strings': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // strings on the ransom note — reveals hidden metadata comments
            if (fullCmd.includes('RANSOM_NOTE') || fullCmd.includes('ransom_note')) {
                C4Config._ransomFamilyId = true;
                if (engine) engine.advancePhase && engine.advancePhase('assessment');
                return `=== strings output: RANSOM_NOTE.txt ===

DARKMIDNIGHT RANSOMWARE
Version 2.1 | Powered by PHANTOM CIRCUIT
AES-128-CBC
bc1q9xm4p7fkj3r8v2e5n0g6w1d8c3a4h7b5s2t0q
decrypt@phantom-support.onion
MLG-20260319-4821
DarkMidnight v2.1 note template -- affiliate ID: PC-AFF-0047
Operator: PHANTOM CIRCUIT | Campaign: LOGISTICS-SWEEP-Q1-2026
{{FLAG:user}}
Generator: darkmidnight-notegen.py v2.1.0

[!] Hidden metadata comments found at end of note file.
[!] Affiliate ID: PC-AFF-0047 — identifies which PHANTOM CIRCUIT affiliate ran this campaign.
[!] The comment block is not displayed in the on-screen ransom message — it\'s only visible via strings.`;
            }

            // strings on the memory dump
            if (fullCmd.includes('4812.dmp') || (fullCmd.includes('/tmp/') && fullCmd.includes('dmp'))) {
                C4Config._keyExtracted = true;
                return `=== strings /tmp/4812.dmp | grep -E "[0-9a-f]{32}" ===

Scanning for 32-character hex strings in PID 4812 dump...

a7f2c8b4d3e9f0a1b5c6d7e8f9a0b1c2   <- AES-128 session key (heap offset 0x0048)
d4e8f2c1a09b37e5d6c84f17b2e93a04   <- memory dump MD5 (not a key)
c8a3f19e4b2d07c65e90f18a3d74b82c   <- backup archive MD5 (not a key)

[!] Primary candidate: a7f2c8b4d3e9f0a1b5c6d7e8f9a0b1c2
[!] This 128-bit AES key was found unencrypted in the ransomware process heap.
[!] Key likely not yet zeroed — timing of dump was early enough in execution.
[!] Use: decrypt --key a7f2c8b4d3e9f0a1b5c6d7e8f9a0b1c2 /cases/midnight/samples/quarterly_report.xlsx.locked`;
            }

            // generic strings fallback
            const target = args.find(a => !a.startsWith('-') && !a.startsWith('|')) || '';
            if (!target) return 'Usage: strings [options] <file>';
            return `strings: ${target}: opening file
[Binary or large file — output truncated]
Displaying printable strings of length >= 4...
(Use a specific filename like /cases/midnight/RANSOM_NOTE.txt or /tmp/4812.dmp)`;
        },

        // ── decrypt — use recovered key to decrypt .locked files ──
        'decrypt': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (args.length === 0 || args.includes('--help')) {
                return 'DarkMidnight Decryption Tool v1.0 (IR Edition)\nUsage: decrypt --key <AES_KEY_HEX> <encrypted_file>\n\nThe key must be 32 hexadecimal characters (128-bit).\nExtract from process memory using: volatility ... malfind -p 4812\nor: strings /tmp/4812.dmp | grep -E "[0-9a-f]{32}"';
            }

            const hasKey   = fullCmd.includes('--key');
            const rightKey = fullCmd.includes('a7f2c8b4d3e9f0a1b5c6d7e8f9a0b1c2');
            const hasFile  = fullCmd.includes('.locked');

            if (!hasKey) {
                return 'ERROR: --key flag required.\nUsage: decrypt --key <AES_KEY_HEX> <file>.locked';
            }
            if (!hasFile && !fullCmd.includes('--batch')) {
                return 'ERROR: No .locked file specified.\nSpecify a file: decrypt --key <KEY> /cases/midnight/samples/quarterly_report.xlsx.locked\nOr batch mode: decrypt --key <KEY> --batch /cases/midnight/samples/';
            }
            if (!rightKey) {
                return 'ERROR: Decryption failed — invalid key.\nOutput: FATAL: MAC verification failed. Key is incorrect or file is corrupted.\nEnsure you have the correct 32-character AES-128 key from PID 4812 heap.';
            }

            // Correct key — decryption succeeds
            C4Config._sampleDecrypted = true;
            if (engine) engine.advancePhase && engine.advancePhase('recovery');

            if (fullCmd.includes('--batch') || fullCmd.includes('samples/')) {
                return `DarkMidnight Decryption Tool v1.0 (IR Edition)
Key: a7f2c8b4d3e9f0a1b5c6d7e8f9a0b1c2
Mode: Batch — scanning /cases/midnight/samples/

[OK] quarterly_report.xlsx.locked  ->  quarterly_report.xlsx    (SHA256 verified)
[OK] employee_list.docx.locked     ->  employee_list.docx       (SHA256 verified)
[OK] payroll_march.xlsx.locked     ->  payroll_march.xlsx       (SHA256 verified)

3 files decrypted successfully.
0 failures.

[+] Decryption successful. Key is valid for this victim ID (MLG-20260319-4821).
[+] This confirms the AES session key recovered from memory is correct.
[+] Note: Only files on this workstation. Full restore requires backup-verify + clean restore.`;
            }

            return `DarkMidnight Decryption Tool v1.0 (IR Edition)
Key: a7f2c8b4d3e9f0a1b5c6d7e8f9a0b1c2
File: quarterly_report.xlsx.locked

Decrypting... done.
Output: quarterly_report.xlsx
SHA256 (pre-encryption, from VSS): e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
SHA256 (post-decrypt):             e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

[OK] Hash match — decryption successful. File is intact.
[+] Key confirmed valid for victim ID MLG-20260319-4821.`;
        },

        // ── backup-verify — check backup integrity ───────────
        'backup-verify': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (args.length === 0) return 'Usage: backup-verify <backup_path>\nExample: backup-verify /mnt/backups/';

            C4Config._backupsChecked = true;

            return `Backup Integrity Verification — Meridian Logistics Group
Scanning: /mnt/backups/
Checking MD5 hashes against manifest...

backup_2026-03-16_03-00.tar.gz
  Stored MD5:   c8a3f19e4b2d07c65e90f18a3d74b82c
  Computed MD5: c8a3f19e4b2d07c65e90f18a3d74b82c
  Status: [CLEAN] PASS — Backup predates infection. Safe to restore.

backup_2026-03-17_03-00.tar.gz
  Stored MD5:   a7f2c8e1d04b39e6b5c91f17a2d84e70
  Computed MD5: a7f2c8e1d04b39e6b5c91f17a2d84e70
  Status: [CLEAN] PASS — Backup predates payload detonation.
  Warning: Ransomware was laterally active on this date.
           Spot-check file extensions before full restore.

backup_2026-03-18_03-00.tar.gz
  Stored MD5:   e9b4f28a1c07d56e3b9f20a4c8e75d19
  Computed MD5: FAILED — HASH MISMATCH
  Status: [COMPROMISED] FAIL — Contains encrypted files (.locked extensions found).
          Do NOT restore this backup.

=== RECOMMENDATION ===
Restore from: backup_2026-03-16_03-00.tar.gz (72-hour data loss)
Preferred: backup_2026-03-17_03-00.tar.gz (48-hour data loss, spot-check required)
Reject:    backup_2026-03-18_03-00.tar.gz (CONTAMINATED)

[+] Recovery window: 48–72 hours of data loss if restoring clean backups.`;
        },

        // ── hashdeep — recursive hash verification ───────────
        'hashdeep': function(args) {
            const fullCmd = args.join(' ');
            if (args.length === 0) return 'Usage: hashdeep [-r] <directory>';
            if (fullCmd.includes('backups') || fullCmd.includes('/mnt/')) {
                return `hashdeep v4.4 -- Recursive hash audit: /mnt/backups/
%%%% HASHDEEP-1.0
%%%% size,md5,sha256,filename
##################################################
4 files hashed, 1 failure (hash mismatch on 2026-03-18 backup)
Run backup-verify for detailed integrity report.`;
            }
            if (fullCmd.includes('/cases/')) {
                return `hashdeep v4.4 -- Recursive hash audit: /cases/midnight/
%%% Computing hashes...
  [OK] RANSOM_NOTE.txt
  [OK] netlog_filesvr01.txt
  [OK] email_headers_initial.txt
  [OK] filesvr01.mem
  [OK] samples/quarterly_report.xlsx.locked
  [OK] samples/employee_list.docx.locked
  [OK] samples/payroll_march.xlsx.locked
5 of 7 files verified. All case evidence files intact.`;
            }
            return `hashdeep v4.4\nScanning... done.`;
        },

        // ── file — identify file type ────────────────────────
        'file': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: file <filename>';
            if (target.includes('.mem'))    return `${target}: data (raw memory image, 32GB)`;
            if (target.includes('.locked')) return `${target}: data (encrypted, DarkMidnight AES-128-CBC)`;
            if (target.includes('.txt'))    return `${target}: ASCII text`;
            if (target.includes('.gz'))     return `${target}: gzip compressed data`;
            if (target.includes('.xlsx'))   return `${target}: Microsoft Excel 2007+`;
            if (target.includes('.docx'))   return `${target}: Microsoft Word 2007+`;
            if (target.includes('.xlsm'))   return `${target}: Microsoft Excel 2007+ (macro-enabled)`;
            return `${target}: cannot determine type`;
        },

        // ── sha256sum / md5sum ───────────────────────────────
        'sha256sum': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: sha256sum <file>';
            if (target.includes('RANSOM_NOTE')) return `d7a8f3b1c2e9047f5d1a3c8b9e2f47a1c0d5e8f2a3b4c1d9e7f0a2b3c4d5e6f7  ${target}`;
            if (target.includes('.mem'))        return `e4b9c3f1a08d27e6b5c92f10a3d84e71c58b2f9e0d6a13c4b7e29f08d51a3c6  ${target}`;
            if (target.includes('.locked'))     return `WARNING: Cannot hash encrypted file reliably — content changes each scan\nRun decrypt first, then verify the decrypted file.`;
            return `sha256sum: ${target}: No such file or directory`;
        },

        'md5sum': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: md5sum <file>';
            if (target.includes('RANSOM_NOTE')) return `d4e8f2c1a09b37e5d6c84f17b2e93a04  ${target}`;
            if (target.includes('.mem'))        return `d4e8f2c1a09b37e5d6c84f17b2e93a04  ${target}`;
            if (target.includes('svchost32'))   return `a3f9c8d2e1b047a65c3901f28d7e4b92  ${target}`;
            if (target.includes('invoice'))     return `8b4f1c9e3d2a06b74e5c18f92a3d70b1  ${target}`;
            return `md5sum: ${target}: No such file or directory`;
        },

        // ── netstat / ss — network connections ──────────────
        'netstat': function(args) {
            return `Active Internet connections (servers and established)
Proto  Local Address          Foreign Address         State
tcp    0.0.0.0:22             0.0.0.0:*               LISTEN
tcp    172.16.99.10:22        172.16.99.1:51203       ESTABLISHED
tcp    172.16.99.10:45231     172.16.99.20:80         ESTABLISHED

[This is the IR workstation — it is isolated in the 172.16.99.0/24 VLAN]
[Evidence is read from /mnt/backups/ (NAS mount) and /cases/ (local evidence copy)]`;
        },

        'ss': function(args) {
            return C4Config.commands.netstat(args);
        },

        // ── nmap — limited scope on IR workstation ───────────
        'nmap': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: nmap [options] <target>\n[!] IR workstation has limited network access — only 172.16.99.0/24 reachable.';

            if (target.includes('172.16.99') || target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.00014s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 0.21 seconds`;
            }

            // Production network not reachable from IR workstation
            if (target.includes('10.10.') || target.includes('185.') || target.includes('0/24')) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 0 IP addresses (0 hosts up) scanned in 2.04 seconds

[!] IR workstation is isolated — production network (10.10.x.x) is not reachable.
[!] Use the evidence files in /cases/midnight/ for network analysis.`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 0 IP addresses (0 hosts up) scanned in 3.05 seconds`;
        },

        // ── grep — search within files ───────────────────────
        'grep': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Grep for hex strings in memory dump (common pivot)
            if ((fullCmd.includes('[0-9a-f]') || fullCmd.includes('hex') || fullCmd.includes('key')) &&
                (fullCmd.includes('4812') || fullCmd.includes('.dmp') || fullCmd.includes('mem'))) {
                C4Config._keyExtracted = true;
                return `a7f2c8b4d3e9f0a1b5c6d7e8f9a0b1c2
d4e8f2c1a09b37e5d6c84f17b2e93a04
c8a3f19e4b2d07c65e90f18a3d74b82c

[!] Candidate AES key (32 hex chars, heap context): a7f2c8b4d3e9f0a1b5c6d7e8f9a0b1c2`;
            }

            // Grep in ransom note
            if (fullCmd.includes('RANSOM_NOTE') || fullCmd.includes('ransom')) {
                return `; DarkMidnight v2.1 note template -- affiliate ID: PC-AFF-0047
; Operator: PHANTOM CIRCUIT | Campaign: LOGISTICS-SWEEP-Q1-2026
; {{FLAG:user}}
; Generator: darkmidnight-notegen.py v2.1.0`;
            }

            // Grep in network log for C2
            if (fullCmd.includes('netlog') || (fullCmd.includes('185.') && fullCmd.includes('log'))) {
                return `TCP     10.10.5.10:49152       185.220.101.47:443      ESTABLISHED   <- C2 BEACON (ACTIVE)
TCP     10.10.5.10:49153       185.220.101.47:443      CLOSE_WAIT    <- C2 exfil (key transmission)`;
            }

            const pattern = args[0] || '';
            const target  = args[args.length - 1] || '';
            if (!pattern) return 'Usage: grep [options] PATTERN [FILE]';
            return `grep: no output — pattern not found in ${target}`;
        },

        // ── find — locate files ──────────────────────────────
        'find': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('.locked')) {
                return `/cases/midnight/samples/quarterly_report.xlsx.locked
/cases/midnight/samples/employee_list.docx.locked
/cases/midnight/samples/payroll_march.xlsx.locked

[Note: Full file server had 87,432 .locked files — these are representative samples]`;
            }
            if (fullCmd.includes('.mem')) {
                return '/cases/midnight/filesvr01.mem';
            }
            if (fullCmd.includes('svchost')) {
                return 'C:\\Windows\\Temp\\svchost32.exe  [evidence path — not local]';
            }
            const dir = args.find(a => !a.startsWith('-')) || '.';
            return `find: searching ${dir}...\n(No additional results)`;
        },

        // ── cat — override for context-aware reads ───────────
        'cat': function(args, term, engine) {
            // Fall through to built-in — the filesystem has real content
            return null;
        },

        // ── whoami / id / hostname ───────────────────────────
        'whoami': function() { return 'investigator'; },
        'id':     function() { return 'uid=1000(investigator) gid=1000(investigator) groups=1000(investigator),27(sudo),1002(forensics)'; },
        'hostname': function() { return 'ir-ws-01'; },
        'pwd': function() { return null; },  // fall through to built-in
        'cd':  function() { return null; },  // fall through to built-in

        // ── uname ────────────────────────────────────────────
        'uname': function(args) {
            const flags = args.join('');
            if (flags.includes('a')) return 'Linux ir-ws-01 5.15.0-sift-64 #1 SMP SIFT Workstation 3.4 x86_64 GNU/Linux';
            return 'Linux';
        },

        // ── python3 — quick scripting helper ─────────────────
        'python3': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('decode') || fullCmd.includes('base64')) {
                return 'Python 3.10.12 (main)\n>>> [Use full python3 -c "..." for base64 decode operations]';
            }
            return 'Python 3.10.12 (main)\nType "help", "copyright", "credits" or "license" for more information.\n>>>';
        },

        // ── xxd / hexdump — hex viewer ───────────────────────
        'xxd': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: xxd <file>';
            if (target.includes('.locked')) {
                return `00000000: 444b 4d49 4432 0100 9f3a b2c1 04e7 d85f  DKMID2...:....._
00000010: 1a2b 6c0d 9e4f 7a83 0000 0000 0000 0000  .+l..Oz.........
00000020: [encrypted blob — 847MB truncated]

Header magic: DKMID2\\x01\\x00 (DarkMidnight v2.x identifier)
IV bytes:     9f 3a b2 c1 04 e7 d8 5f 1a 2b 6c 0d 9e 4f 7a 83`;
            }
            if (target.includes('RANSOM_NOTE')) {
                return `00000000: 3d3d 3d3d 3d3d 3d3d 3d3d 3d3d 3d3d 3d3d  ================
00000010: 3d3d 3d3d 3d3d 3d3d 3d3d 3d3d 3d3d 3d3d  ================
[ASCII text file — use cat instead]`;
            }
            return `xxd: ${target}: No such file or directory`;
        },

        'hexdump': function(args) {
            return C4Config.commands.xxd(args);
        },

        // ── exit ─────────────────────────────────────────────
        'exit': function(args, term, engine) {
            return 'logout';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#e67e22; border-bottom:2px solid #ddd; background:#fdf9f5;">${h}</th>`;
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
