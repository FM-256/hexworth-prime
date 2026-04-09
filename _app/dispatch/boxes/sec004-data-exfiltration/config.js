/* ============================================================
   DISPATCH LAB — Box SEC004: Data Exfiltration
   CompTIA CySA+ — Data Loss Prevention & Exfiltration Detection
   Config: large outbound transfer, USB audit, DLP violation,
   cloud upload, DNS tunneling
   5 distinct scenarios
   ============================================================ */

var SEC004Config = {

    title: 'Data Exfiltration',
    subtitle: 'Data on the Move — Exfiltration Investigation',
    difficulty: 'Advanced',
    accent: '#dc2626',
    storageKey: 'hexworth_lab_sec004',
    registryId: 'sec004-data-exfiltration',
    trackerKey: 'lab_sec004',

    tutorialMode: true,

    tutorial: {
        steps: [
            { title: 'Open the DLP Alert', tip: 'Double-click the Security Alert to review the data exfiltration indicator.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Review the DLP Console', tip: 'Open the DLP Console to see policy violations, data classifications, and transfer logs.', trigger: { event: 'window_open', match: { type: 'dlp_console' } } },
            { title: 'Investigate the transfer', tip: 'Use terminal tools to check network flows, USB device history, DNS queries, and cloud access logs.', trigger: { event: 'command', match: { cmd: 'contains:flow' }, alt: [{ event: 'command', match: { cmd: 'contains:usb' } }, { event: 'command', match: { cmd: 'contains:dns' } }] } },
            { title: 'Contain the exfiltration', tip: 'Block the exfiltration channel, preserve evidence, and document findings.', trigger: { event: 'command', match: { cmd: 'contains:block' }, alt: [{ event: 'command', match: { cmd: 'contains:contain' } }] } },
            { title: 'Capture the flag', tip: 'After containing the exfiltration, the flag will appear.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'CySA+ CS0-003',
        mappings: [
            { flagId: 'fixed', objective: '1.4', description: 'Compare and contrast threat-intelligence and threat-hunting concepts', skill: 'Data Exfiltration Detection' },
            { flagId: 'fixed', objective: '3.2', description: 'Analyze data to prioritize vulnerabilities', skill: 'DLP Policy Analysis' }
        ]
    },

    _scenarioFlags: { large_transfer: null, usb_audit: null, dlp_violation: null, cloud_upload: null, dns_tunnel: null },

    _scenarios: [
        {
            id: 'large_transfer',
            name: 'Large Outbound Transfer',
            ticketSubject: 'Firewall flagged 4.7 GB outbound transfer to unknown external IP at 2:30 AM',
            ticketDetail: 'The network monitoring system detected a 4.7 GB outbound data transfer from workstation WS-ENG-PC12 to external IP 91.234.99.17 between 02:30 and 03:45 AM. The transfer used HTTPS on port 443 to avoid content inspection. The workstation belongs to senior engineer Marcus Reed who has access to source code repositories and proprietary design documents. The destination IP does not match any known business partner or cloud service.',
            ticketExtra: 'SOC Note: IP 91.234.99.17 resolves to a VPS provider in Romania. No legitimate business relationship exists. The transfer volume (4.7 GB) exceeds normal outbound by 10x. Check if this is an insider threat or a compromised account being used for data theft.',
            affectedHost: 'WS-ENG-PC12',
            fixDescription: 'Identify transferred data, block exfiltration channel, preserve evidence',
            stateOverrides: { _largeTransfer: true, _transferSize: '4.7 GB' }
        },
        {
            id: 'usb_audit',
            name: 'USB Audit Trail',
            ticketSubject: 'DLP alert: USB mass storage device connected to restricted workstation in R&D',
            ticketDetail: 'A USB mass storage device (SanDisk Cruzer 64GB) was connected to WS-RND-PC05 in the Research & Development lab at 17:45 yesterday. This workstation is classified as "restricted" and USB storage is prohibited by policy. The DLP agent logged 847 MB of files copied to the USB device before the user disconnected it. The files appear to include patent applications and research data.',
            ticketExtra: 'SOC Note: The USB device serial number is 4C530001220827. The user logged into WS-RND-PC05 at that time was nwilson (Natalie Wilson, R&D Engineer). She submitted her 2-week resignation notice last Friday. This may be an insider threat — departing employee stealing IP.',
            affectedHost: 'WS-RND-PC05',
            fixDescription: 'Identify copied files, review USB audit trail, preserve evidence for HR/Legal',
            stateOverrides: { _usbConnected: true, _usbSerial: '4C530001220827' }
        },
        {
            id: 'dlp_violation',
            name: 'DLP Policy Violation',
            ticketSubject: 'DLP blocked an email with SSN data to personal Gmail — user attempting to bypass',
            ticketDetail: 'The DLP engine blocked an outbound email from HR analyst Sarah Kim (skim@corp.hexworth.local) to her personal Gmail (sarah.kim.personal@gmail.com). The email contained an Excel attachment with 2,340 employee Social Security numbers, names, and salary data. After the block, the user attempted to upload the same file to Google Drive via Chrome. The DLP web filter caught and blocked the second attempt as well.',
            ticketExtra: 'SOC Note: Two blocked attempts in 5 minutes suggests intentional exfiltration, not accidental. Sarah Kim has legitimate access to HR data but sending it to a personal email violates data handling policy. Check if there were any successful transfers before the DLP caught it. Also check for other exfiltration methods (cloud sync, messaging apps).',
            affectedHost: 'WS-HR-PC02',
            fixDescription: 'Verify no data escaped, review all transfer attempts, escalate to HR/Legal',
            stateOverrides: { _dlpTriggered: true, _piiExposed: true }
        },
        {
            id: 'cloud_upload',
            name: 'Cloud Storage Upload',
            ticketSubject: 'Unauthorized Dropbox sync detected — classified documents uploading to personal account',
            ticketDetail: 'Cloud access monitoring detected the Dropbox desktop client syncing files from WS-LEGAL-PC03 to a personal Dropbox account (mike.chen@outlook.com). The sync has been running for approximately 2 hours and has uploaded 312 files totaling 1.8 GB. The files include attorney-client privileged documents, merger/acquisition files, and board meeting minutes. The user mchenl (Mike Chen, Legal Counsel) installed the Dropbox client without IT approval.',
            ticketExtra: 'SOC Note: Dropbox is not on the approved software list. The CASB (Cloud Access Security Broker) detected the sync but the policy was in "monitor" mode rather than "block." Switch the policy to block and terminate the sync. Also check if any files have been shared from the Dropbox account to third parties.',
            affectedHost: 'WS-LEGAL-PC03',
            fixDescription: 'Block Dropbox sync, audit uploaded files, check for further sharing',
            stateOverrides: { _cloudSync: true, _filesUploaded: 312 }
        },
        {
            id: 'dns_tunnel',
            name: 'DNS Tunneling Detected',
            ticketSubject: 'Anomalous DNS traffic pattern — possible data exfiltration via DNS tunneling',
            ticketDetail: 'The DNS monitoring system flagged workstation WS-FIN-PC08 for generating 14,000+ DNS queries in the last hour to subdomain patterns under "update-cdn.xyz". The queries contain unusually long subdomain labels (50+ characters) with base64-encoded data. This is a classic DNS tunneling pattern used to exfiltrate data through DNS queries that bypass traditional firewalls. Average DNS queries for this workstation are normally 200/hour.',
            ticketExtra: 'SOC Note: Domain "update-cdn.xyz" was registered 3 days ago. The DNS responses contain TXT records with encoded data, confirming bidirectional C2 channel. Estimated data exfiltrated via DNS: ~45 MB over 6 hours. The DNS tunnel is likely controlled by malware — check for beaconing patterns and identify the process generating the DNS queries.',
            affectedHost: 'WS-FIN-PC08',
            fixDescription: 'Identify tunneling process, block C2 domain, assess data loss',
            stateOverrides: { _dnsTunnel: true, _c2Domain: 'update-cdn.xyz' }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the DLP Console to review data transfer alerts and classifications.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools: netflow, usb-audit, dns-log, dlp-report.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario uses a different exfiltration method.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Contain the exfiltration and preserve evidence.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        large_transfer: [
            { id: 'hint1', text: 'Use "netflow --host WS-ENG-PC12" to see the transfer details.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The transfer went to 91.234.99.17 (Romanian VPS). Use "ip-lookup 91.234.99.17" for intel.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Block the IP and preserve evidence: "contain-exfil --block-ip 91.234.99.17 --preserve"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: contain-exfil --block-ip 91.234.99.17 --preserve --isolate WS-ENG-PC12', cost: 150, penalty: -150 }
        ],
        usb_audit: [
            { id: 'hint1', text: 'Use "usb-audit --host WS-RND-PC05" to see USB device connection history.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Review what files were copied: "usb-audit --host WS-RND-PC05 --files"', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Preserve the evidence: "contain-exfil --usb-report --escalate-hr"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: contain-exfil --usb-report --escalate-hr --disable-user nwilson', cost: 150, penalty: -150 }
        ],
        dlp_violation: [
            { id: 'hint1', text: 'Use "dlp-report --user skim" to see all DLP events for this user.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check if any data escaped: "dlp-report --user skim --check-leaks"', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Escalate and preserve: "contain-exfil --dlp-escalate --user skim"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: contain-exfil --dlp-escalate --user skim --disable-access', cost: 150, penalty: -150 }
        ],
        cloud_upload: [
            { id: 'hint1', text: 'Use "cloud-audit --host WS-LEGAL-PC03" to see the Dropbox sync activity.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check for sharing: "cloud-audit --host WS-LEGAL-PC03 --sharing-check"', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Kill the sync and block: "contain-exfil --kill-sync --block-app dropbox"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: contain-exfil --kill-sync --block-app dropbox --preserve', cost: 150, penalty: -150 }
        ],
        dns_tunnel: [
            { id: 'hint1', text: 'Use "dns-log --host WS-FIN-PC08" to see the anomalous DNS queries.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Identify the tunneling process: "dns-log --host WS-FIN-PC08 --process"', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Block the C2 domain and kill the process: "contain-exfil --block-domain update-cdn.xyz --kill-tunnel"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: contain-exfil --block-domain update-cdn.xyz --kill-tunnel --isolate WS-FIN-PC08', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SEC004Config._flagRestored) {
            SEC004Config._flagRestored = true;
            var scenario = SEC004Config._scenarios[engine.state._scenarioId];
            if (scenario) SEC004Config.hints = SEC004Config._scenarioHints[scenario.id] || SEC004Config._defaultHints;
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._largeTransfer = false;
        engine.state._usbConnected = false;
        engine.state._dlpTriggered = false;
        engine.state._cloudSync = false;
        engine.state._dnsTunnel = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        var overrides = SEC004Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }
        SEC004Config._flagRestored = true;
        SEC004Config.hints = SEC004Config._scenarioHints[SEC004Config._scenarios[idx].id] || SEC004Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : SEC004Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active incident assigned.\nOpen the Security Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: {
        biosLines: ['Dell UEFI BIOS A22', 'Initializing DLP Analyst workstation...', 'Memory Test: 32768 MB OK', 'NVMe: Samsung 970 EVO Plus (1TB)', 'Secure Boot: Enabled', 'Loading Windows...'],
        grubEntries: ['Windows 10 Enterprise', 'Windows Recovery Environment'],
        loginUser: 'DLP-Analyst'
    },

    desktop: {
        icons: [
            { id: 'cmd',    label: 'Command\nPrompt',  icon: '>_',  app: 'terminal' },
            { id: 'dlp',    label: 'DLP\nConsole',     icon: 'DLP', app: 'dlp_console' },
            { id: 'ticket', label: 'Security\nAlert',  icon: 'SEC', app: 'ticket' },
            { id: 'hints',  label: 'Hints',            icon: '?',   app: 'hints' },
            { id: 'reset',  label: 'Reset\nLab',       icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'DLP-Analyst', hostname: 'DLP-WS01', startDir: 'C:\\Users\\DLP-Analyst', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.4412]\n(c) Microsoft Corporation.\n\nDLP Analyst Workstation — Data Loss Prevention Console Active\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Open the DLP Console for transfer alerts.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate exfiltration channels.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario uses a different exfiltration method.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use contain-exfil to block and preserve evidence.', cost: 50, penalty: -50 }
    ],

    lore: {
        intro: 'Data is leaving the building. The DLP system has flagged suspicious data transfers that may indicate exfiltration — intentional or otherwise. Investigate each incident, determine if data was stolen, and contain the leak.',
        scenario: 'Each scenario involves a different exfiltration vector — network transfer, USB device, email, cloud storage, or DNS tunneling. Your job is to detect, investigate, and contain.',
        outro: 'Exfiltration contained. Your investigation preserved critical evidence and stopped the data leak before it caused irreversible damage.'
    },

    phases: [
        { id: 'investigate', name: 'Detection', description: 'Review the DLP alert and identify the exfiltration method.', requiredFlags: [], unlocks: ['analyze'], locked: false },
        { id: 'analyze', name: 'Analysis', description: 'Determine what data was transferred and assess impact.', requiredFlags: [], unlocks: ['contain'], locked: true },
        { id: 'contain', name: 'Containment', description: 'Block the exfiltration channel and preserve evidence.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm no further data loss and document findings.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {

        netflow: function(args, term, engine) {
            var gate = SEC004Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC004Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'large_transfer' && joined.includes('ws-eng-pc12')) {
                return '\nNetFlow Analysis — WS-ENG-PC12 (10.0.4.12)\n============================================\nTime Range: 2026-03-29 02:00 - 04:00 UTC\n\n  02:30:14  10.0.4.12:49221 -> 91.234.99.17:443  HTTPS  847 MB  Duration: 12m\n  02:42:38  10.0.4.12:49225 -> 91.234.99.17:443  HTTPS  1.2 GB  Duration: 18m\n  03:01:02  10.0.4.12:49228 -> 91.234.99.17:443  HTTPS  1.4 GB  Duration: 22m\n  03:23:45  10.0.4.12:49231 -> 91.234.99.17:443  HTTPS  1.3 GB  Duration: 20m\n\nTotal Outbound: 4.747 GB in 4 sessions over 75 minutes\nDestination: 91.234.99.17 (Romania, AS48090, VPS Provider)\nProtocol: HTTPS (encrypted, content inspection bypassed)\nProcess: chrome.exe (PID 5872) — web upload interface\n\n[!] ANOMALY: Normal outbound for this host is 120 MB/day\n[!] Transfer occurred between 02:30-03:45 AM (off-hours)';
            }
            return '\nUsage: netflow --host <hostname> [--timerange <start> <end>]';
        },

        'usb-audit': function(args, term, engine) {
            var gate = SEC004Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC004Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'usb_audit' && joined.includes('ws-rnd-pc05')) {
                if (joined.includes('--files')) {
                    return '\nUSB File Transfer Log — WS-RND-PC05\n=====================================\nDevice: SanDisk Cruzer 64GB (S/N: 4C530001220827)\nUser: nwilson  Time: 2026-03-28 17:45 - 17:58\n\nFiles Copied to USB (847 MB total):\n  1. /R&D/Patents/Patent_App_2026_NanoCoating.docx (4.2 MB)\n  2. /R&D/Patents/Patent_App_2026_ThermalInterface.docx (3.8 MB)\n  3. /R&D/Research/Phase3_Results_CONFIDENTIAL.xlsx (12.4 MB)\n  4. /R&D/Research/Compound_Analysis_Q1_2026.pdf (28.7 MB)\n  5. /R&D/Designs/CAD_Assembly_v47_PROPRIETARY.zip (312 MB)\n  6. /R&D/Designs/Prototype_Specs_RESTRICTED.pdf (18.9 MB)\n  7. /R&D/Source/firmware_v3.2_CONFIDENTIAL.tar.gz (467 MB)\n\n[!] ALL FILES CLASSIFIED: CONFIDENTIAL or RESTRICTED\n[!] User nwilson submitted resignation 5 days ago\n[!] USB policy violation on restricted workstation';
                }
                return '\nUSB Audit Trail — WS-RND-PC05\n===============================\n  2026-03-28 17:45:12  USB Mass Storage CONNECTED\n    Device: SanDisk Cruzer Blade 64GB\n    Serial: 4C530001220827\n    User: nwilson (Natalie Wilson, R&D Engineer)\n\n  2026-03-28 17:45:18  DLP Agent: USB WRITE detected\n  2026-03-28 17:46:01  File copy initiated (7 files, 847 MB)\n  2026-03-28 17:58:33  File copy complete\n  2026-03-28 17:58:41  USB Mass Storage DISCONNECTED\n\n  Policy Violation: USB storage prohibited on restricted workstations\n  Use --files flag to see transferred file list.';
            }
            return '\nUsage: usb-audit --host <hostname> [--files]';
        },

        'dlp-report': function(args, term, engine) {
            var gate = SEC004Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC004Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'dlp_violation' && joined.includes('skim')) {
                if (joined.includes('--check-leaks')) {
                    return '\nDLP Leak Assessment — skim@corp.hexworth.local\n===============================================\n  Email (SMTP): 2 attempts BLOCKED\n    1. 2026-03-29 10:15:33 — To: sarah.kim.personal@gmail.com — Attachment: HR_Data_Export.xlsx (2,340 SSNs) — BLOCKED\n    2. 2026-03-29 10:18:47 — To: sarah.kim.personal@gmail.com — Attachment: HR_Data_Export.xlsx (split into 3 parts) — BLOCKED\n  Web Upload: 1 attempt BLOCKED\n    1. 2026-03-29 10:20:14 — drive.google.com — File: HR_Data_Export.xlsx — BLOCKED\n  Cloud Sync: No Dropbox/OneDrive personal sync detected\n  Messaging: No file transfers via Teams/Slack to external\n  Print: No print jobs for this file\n\nVERDICT: NO DATA ESCAPED — all exfiltration attempts were blocked\nHowever, intentional exfiltration attempt confirmed (3 attempts in 5 minutes)\nRecommendation: Escalate to HR and Legal immediately.';
                }
                return '\nDLP Report — skim@corp.hexworth.local\n======================================\nViolations (Last 24 hours):\n  1. 2026-03-29 10:15:33  Email with PII (SSN)  ->  personal Gmail  STATUS: BLOCKED\n  2. 2026-03-29 10:18:47  Email with PII (SSN)  ->  personal Gmail  STATUS: BLOCKED\n  3. 2026-03-29 10:20:14  Web upload (PII)      ->  Google Drive    STATUS: BLOCKED\n\nData Classification: PII — Social Security Numbers (2,340 records)\nUser Risk Score: CRITICAL (3 violations, intentional pattern)\n\nUse --check-leaks to verify no data escaped through other channels.';
            }
            return '\nUsage: dlp-report --user <username> [--check-leaks]';
        },

        'cloud-audit': function(args, term, engine) {
            var gate = SEC004Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC004Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'cloud_upload' && joined.includes('ws-legal-pc03')) {
                if (joined.includes('--sharing-check')) {
                    return '\nCloud Sharing Audit — mchenl@dropbox.com\n==========================================\n  Shared Links Created: 2\n    1. /Legal/M&A/Acquisition_Target_Analysis.pdf — Shared with: external@competitor-law.com  [!] CRITICAL\n    2. /Legal/Board/Board_Minutes_March_2026.pdf — Shared with: mike.chen@outlook.com (self)\n\n  [!] CRITICAL: Privileged M&A document shared with external law firm\n  [!] This may constitute a breach of attorney-client privilege\n  [!] Immediate containment required';
                }
                return '\nCloud Access Audit — WS-LEGAL-PC03\n====================================\n  Application: Dropbox Desktop Client v187.4.6913\n  Account: mike.chen@outlook.com (personal)\n  Sync Status: ACTIVE (syncing to ~/Dropbox/Work-Backup/)\n  Sync Duration: 2 hours 14 minutes\n  Files Uploaded: 312 files (1.8 GB)\n  Folders Synced:\n    /Legal/Contracts/ (89 files)\n    /Legal/M&A/ (47 files) [!] PRIVILEGED\n    /Legal/Board/ (23 files) [!] CONFIDENTIAL\n    /Legal/Litigation/ (153 files) [!] PRIVILEGED\n\n  [!] Dropbox not on approved software list\n  [!] CASB policy in MONITOR mode (should be BLOCK)\n  Use --sharing-check to see if files were shared externally.';
            }
            return '\nUsage: cloud-audit --host <hostname> [--sharing-check]';
        },

        'dns-log': function(args, term, engine) {
            var gate = SEC004Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC004Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'dns_tunnel' && joined.includes('ws-fin-pc08')) {
                if (joined.includes('--process')) {
                    return '\nDNS Process Attribution — WS-FIN-PC08\n=======================================\n  Process generating DNS queries: winupdate.exe (PID 3847)\n    Path: C:\\ProgramData\\Microsoft\\winupdate.exe\n    SHA256: 8f14e45fceea167a5a36dedd4bea254a\n    Signed: NO (unsigned binary)\n    Started: 2026-03-29 02:14:33\n    Parent: svchost.exe (legitimate, likely via scheduled task)\n\n  [!] MALWARE: winupdate.exe is NOT a legitimate Windows binary\n  [!] Uses iodine-based DNS tunneling to exfiltrate data\n  [!] Beaconing interval: 15 seconds\n  [!] Estimated data exfiltrated: 45 MB over 6 hours';
                }
                return '\nDNS Query Log — WS-FIN-PC08 (last hour)\n=========================================\n  Total Queries: 14,247 (normal baseline: 200/hour)\n\n  Top Domain: update-cdn.xyz (14,198 queries)\n  Sample Queries:\n    aGV4d29ydGgtcHJpbWUtZmluYW5jZS1kYXRh.update-cdn.xyz  (A record)\n    Q29uZmlkZW50aWFsLVExLUJ1ZGdldC54bHN4.update-cdn.xyz  (A record)\n    UGF5cm9sbC1NYXJjaC0yMDI2LmNzdg==.update-cdn.xyz      (A record)\n\n  Response Type: TXT records with base64-encoded payloads\n  Domain Age: 3 days (registered 2026-03-26)\n  Registrar: NameCheap (privacy-protected)\n\n  [!] DNS TUNNELING DETECTED\n  [!] Base64 subdomain labels contain encoded file data\n  [!] Decoded sample: "hexworth-prime-finance-data"\n  Use --process flag to identify the tunneling process.';
            }
            return '\nUsage: dns-log --host <hostname> [--process]';
        },

        'ip-lookup': function(args, term, engine) {
            var gate = SEC004Config._requireScenario(engine);
            if (gate) return gate;
            if (args[0] === '91.234.99.17') {
                return '\nIP Reputation: 91.234.99.17\n  Geolocation: Bucharest, Romania\n  ASN: AS48090 (RCS & RDS)\n  Type: VPS/Cloud hosting\n  Reputation: 12/100 (Suspicious)\n  Tags: VPS Provider, File Hosting, No business relationship\n  Recent Activity: Receiving large file uploads via HTTPS';
            }
            return '\nUsage: ip-lookup <ip-address>';
        },

        'contain-exfil': function(args, term, engine) {
            var gate = SEC004Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC004Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // Large transfer
            if (scenario && scenario.id === 'large_transfer' && joined.includes('91.234.99.17') && joined.includes('--preserve')) {
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('Exfiltration channel blocked. Evidence preserved.', 'success'); }, 400);
                return '\nExfiltration Containment\n========================\n  Blocking IP 91.234.99.17... OK (firewall rule added)\n  Terminating active connections from WS-ENG-PC12... OK\n' + (joined.includes('--isolate') ? '  Isolating WS-ENG-PC12 from network... OK\n' : '') +
                '  Preserving evidence:\n    - NetFlow logs archived... OK\n    - Browser history captured... OK\n    - Process memory dump saved... OK\n    - Disk forensic image initiated... OK\n\nExfiltration Blocked. 4.7 GB transferred before containment.\nEscalation: Insider threat investigation initiated for user mreed.\n\n=== FLAG: SEC004{large_transfer_blocked_preserved} ===';
            }

            // USB audit
            if (scenario && scenario.id === 'usb_audit' && joined.includes('--usb-report') && joined.includes('--escalate-hr')) {
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('USB exfiltration documented. HR and Legal notified.', 'success'); }, 400);
                return '\nUSB Exfiltration Containment\n============================\n  Generating forensic USB report... OK\n  Escalating to HR (nwilson — departing employee)... OK\n  Escalating to Legal (IP theft concern)... OK\n' + (joined.includes('--disable-user') ? '  Disabling user account: nwilson... OK\n  Revoking all access tokens... OK\n' : '') +
                '  Enabling USB block on all R&D workstations... OK\n  Evidence preserved for potential legal action.\n\n847 MB of CONFIDENTIAL/RESTRICTED data copied to USB.\nRecommendation: Request USB device return. Consider legal hold.\n\n=== FLAG: SEC004{usb_audit_insider_threat_escalated} ===';
            }

            // DLP violation
            if (scenario && scenario.id === 'dlp_violation' && joined.includes('--dlp-escalate') && joined.includes('skim')) {
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('DLP violation escalated. No data escaped.', 'success'); }, 400);
                return '\nDLP Violation Containment\n==========================\n  Verifying all exfiltration attempts blocked... CONFIRMED (0 leaks)\n  Escalating to HR... OK\n  Escalating to Legal... OK\n' + (joined.includes('--disable-access') ? '  Disabling HR data access for skim... OK\n  Revoking email send privileges... OK\n' : '') +
                '  Preserving DLP logs for investigation... OK\n  Incident report generated: DLP-2026-0341\n\nAll 3 exfiltration attempts were blocked by DLP.\n2,340 SSN records protected. Intentional data theft attempt documented.\n\n=== FLAG: SEC004{dlp_violation_pii_protected} ===';
            }

            // Cloud upload
            if (scenario && scenario.id === 'cloud_upload' && joined.includes('--kill-sync') && joined.includes('dropbox')) {
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('Dropbox sync terminated. CASB policy updated to block.', 'success'); }, 400);
                return '\nCloud Exfiltration Containment\n===============================\n  Terminating Dropbox sync process on WS-LEGAL-PC03... OK\n  Blocking Dropbox.com via CASB (switched to BLOCK mode)... OK\n  Uninstalling Dropbox client remotely... OK\n' + (joined.includes('--preserve') ? '  Preserving sync logs and file manifest... OK\n' : '') +
                '  Requesting Dropbox account takedown for shared links... SUBMITTED\n  Notifying Legal department of privilege breach... OK\n\n312 files (1.8 GB) uploaded. 2 shared links created (1 to external party).\nCRITICAL: M&A document shared with external law firm.\n\n=== FLAG: SEC004{cloud_upload_sync_terminated} ===';
            }

            // DNS tunnel
            if (scenario && scenario.id === 'dns_tunnel' && joined.includes('update-cdn.xyz') && joined.includes('--kill-tunnel')) {
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('DNS tunnel collapsed. C2 domain blocked.', 'success'); }, 400);
                return '\nDNS Tunnel Containment\n=======================\n  Blocking domain update-cdn.xyz at DNS resolver... OK\n  Adding to firewall deny list... OK\n  Killing process winupdate.exe (PID 3847)... OK\n  Removing scheduled task persistence... OK\n' + (joined.includes('--isolate') ? '  Isolating WS-FIN-PC08 from network... OK\n' : '') +
                '  Archiving DNS query logs... OK\n  Decoding exfiltrated data inventory...\n    - Q1_Budget.xlsx (decoded from DNS queries)\n    - Payroll_March_2026.csv (partial)\n    - Vendor_Payment_Schedule.pdf (partial)\n\nEstimated 45 MB exfiltrated over 6 hours before detection.\nMalware identified: iodine-based DNS tunnel (custom variant).\n\n=== FLAG: SEC004{dns_tunnel_collapsed_domain_blocked} ===';
            }

            return '\nUsage: contain-exfil [options]\n  --block-ip <ip>        Block destination IP\n  --block-domain <dom>   Block domain at DNS level\n  --kill-sync            Kill cloud sync process\n  --kill-tunnel          Kill tunneling process\n  --block-app <app>      Block application\n  --usb-report           Generate USB forensic report\n  --dlp-escalate         Escalate DLP violation\n  --escalate-hr          Notify HR department\n  --disable-user <user>  Disable user account\n  --disable-access       Revoke data access\n  --preserve             Preserve forensic evidence\n  --isolate <host>       Network-isolate the host';
        },

        whoami: function() { return 'DLP-WS01\\DLP-Analyst'; },
        hostname: function() { return 'DLP-WS01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ipconfig: function() { return '\nIPv4 Address: 10.0.2.50\nSubnet Mask: 255.255.255.0\nDefault Gateway: 10.0.2.1'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        grep: function() { return '\'grep\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'dlp_console' && !engine.state._scenarioSelected) { engine.notify('Open the Security Alert first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket':      SEC004Config._openTicket(iconDef, engine); break;
            case 'dlp_console': SEC004Config._openDLP(iconDef, engine); break;
            case 'reset_lab':   SEC004Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Security Alert', 'SEC', container);
        SEC004Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { SEC004Config._renderTicket(engine, container); }
        else { SEC004Config._renderScenarioPicker(engine, container); }
    },

    _renderScenarioPicker(engine, container) {
        var previews = [
            'Network — "4.7 GB outbound transfer to Romanian VPS at 2:30 AM"',
            'DLP Agent — "USB device connected to restricted R&D workstation — 847 MB copied"',
            'DLP Engine — "HR analyst tried to email 2,340 SSNs to personal Gmail"',
            'CASB — "Unauthorized Dropbox syncing 312 privileged legal documents"',
            'DNS Monitor — "14,000 DNS queries/hour with base64-encoded subdomains"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#dc2626; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">DATA EXFILTRATION ALERTS</div><div style="color:#888; font-size:0.75rem;">Select an incident to investigate.</div></div><div style="margin-bottom:16px;">';
        SEC004Config._scenarios.forEach(function(s, i) {
            html += '<button class="sec-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="color:#dc2626; font-weight:bold;">DLP-' + (1000 + i) + '</span><span style="background:#dc2626; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">HIGH</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="secRandomBtn" style="padding:10px 28px; background:#dc2626; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.sec-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#dc2626'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() { SEC004Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); SEC004Config._renderTicket(engine, container); });
        });
        document.getElementById('secRandomBtn').addEventListener('click', function() { SEC004Config._applyScenario(engine, Math.floor(Math.random() * SEC004Config._scenarios.length)); SEC004Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var scenario = SEC004Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="color:#dc2626; font-weight:bold; font-size:1rem;">ALERT #DLP-' + (1000 + engine.state._scenarioId) + '</span><span style="background:#dc2626; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: HIGH</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">AFFECTED HOST</div><div style="font-weight:bold; color:#dc2626;">' + scenario.affectedHost + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div><div style="font-weight:bold;">' + SEC004Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + SEC004Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SOC NOTES</div><div style="background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#fca5a5;">' + SEC004Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — DLP Analyst</div></div>';
    },

    _openDLP(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'dlpContainer';
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'DLP Console', 'DLP', container);

        var scenario = SEC004Config._getScenario(engine);
        var html = '<div style="color:#dc2626; font-weight:bold; font-size:1rem; margin-bottom:12px;">DLP Console — Data Loss Prevention</div>';
        html += '<div style="color:#888; font-size:0.75rem; margin-bottom:12px;">Active Alert: ' + scenario.name + '</div>';
        var statusColor = engine.state._labComplete ? '#22c55e' : '#dc2626';
        var statusText = engine.state._labComplete ? 'CONTAINED' : 'ACTIVE INCIDENT';
        html += '<div style="padding:12px; background:rgba(' + (engine.state._labComplete ? '34,197,94' : '220,38,38') + ',0.08); border:1px solid rgba(' + (engine.state._labComplete ? '34,197,94' : '220,38,38') + ',0.2); border-radius:4px; text-align:center;"><div style="font-size:0.75rem; color:#888;">Status</div><div style="color:' + statusColor + '; font-weight:bold; font-size:1.1rem;">' + statusText + '</div></div>';
        html += '<div style="margin-top:16px; color:#888; font-size:0.75rem;">Use terminal tools for detailed investigation: netflow, usb-audit, dlp-report, cloud-audit, dns-log, contain-exfil</div>';
        container.innerHTML = html;
    },

    _confirmReset(engine) { if (confirm('Reset this lab? All progress will be lost.')) { engine.resetLab(); } }
};
