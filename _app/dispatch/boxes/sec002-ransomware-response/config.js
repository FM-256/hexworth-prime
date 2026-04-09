/* ============================================================
   DISPATCH LAB — Box SEC002: Ransomware Response
   CompTIA Security+ SY0-701 / CySA+ — Ransomware Incident
   Config: encrypted files, host isolation, backup verification,
   attack vector ID, incident documentation
   5 distinct scenarios
   ============================================================ */

var SEC002Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Ransomware Response',
    subtitle: 'Lock Screen of Doom — Ransomware Incident Response',
    difficulty: 'Intermediate',
    accent: '#dc2626',
    storageKey: 'hexworth_lab_sec002',
    registryId: 'sec002-ransomware-response',
    trackerKey: 'lab_sec002',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Incident Report',
                tip: 'Double-click the Security Alert icon to read the ransomware incident details.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Assess the damage',
                tip: 'Check the Forensics Console to identify encrypted files, ransom notes, and affected systems.',
                trigger: { event: 'window_open', match: { type: 'forensics_console' } }
            },
            {
                title: 'Investigate the attack vector',
                tip: 'Use terminal tools to check network connections, running processes, email logs, and file timestamps.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:dir' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:netstat' } },
                        { event: 'command', match: { cmd: 'contains:wevtutil' } }
                    ]
                }
            },
            {
                title: 'Execute response actions',
                tip: 'Isolate hosts, verify backups, identify the attack vector, or document the incident.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:isolate' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:backup' } },
                        { event: 'command', match: { cmd: 'contains:report' } }
                    ]
                }
            },
            {
                title: 'Capture the flag',
                tip: 'After completing the response actions, the flag will be revealed.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES
    // ==========================================================

    certObjectives: {
        certPath: 'Security+ SY0-701 / CySA+',
        mappings: [
            { flagId: 'fixed', objective: '2.4', description: 'Analyze indicators of malicious activity', skill: 'Ransomware Identification and Analysis' },
            { flagId: 'fixed', objective: '4.8', description: 'Explain incident response activities', skill: 'Containment and Recovery' }
        ]
    },

    // ==========================================================
    // SCENARIO FLAGS
    // ==========================================================

    _scenarioFlags: {
        encrypted_files:    null,
        isolate_host:       null,
        backup_verify:      null,
        attack_vector:      null,
        incident_doc:       null
    },

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            id: 'encrypted_files',
            name: 'Encrypted Files Found',
            ticketSubject: 'Users reporting files renamed with .LOCKED extension — ransom note on desktops',
            ticketDetail: 'Multiple users in the Finance department are reporting that their files have been renamed with a .LOCKED extension. A file called README_DECRYPT.txt has appeared on every affected desktop. The ransom note demands 2.5 BTC and provides a Tor .onion address. At least 15 workstations appear affected. File shares on FS01 are also showing encrypted files.',
            ticketExtra: 'SOC Note: Ransomware variant appears to be LockBit 3.0 based on the ransom note format and encryption extension. Encryption is still actively spreading — estimated 2,300 files encrypted so far. Time is critical.',
            affectedHost: 'FS01 + 15 workstations',
            fixDescription: 'Identify encrypted file scope, catalog affected systems, determine encryption status',
            stateOverrides: { _encryptionActive: true, _filesEncrypted: 2347 }
        },
        {
            id: 'isolate_host',
            name: 'Isolate the Host',
            ticketSubject: 'Ransomware spreading via SMB — immediate network isolation required',
            ticketDetail: 'The ransomware is actively spreading across the network via SMB (port 445). It has already moved from the initial infection point (WS-FIN-PC03) to the file server and is now attempting to reach other subnets. Network monitoring shows scanning activity on the 10.0.3.0/24 subnet. We need to isolate infected hosts immediately to stop the spread.',
            ticketExtra: 'SOC Note: Kill chain stage: Lateral Movement (active). The malware is using stolen credentials from WS-FIN-PC03 to authenticate via SMB. Disable SMB on critical hosts and isolate the infected subnet. Priority: Stop the bleed.',
            affectedHost: 'WS-FIN-PC03 (patient zero)',
            fixDescription: 'Isolate patient zero and affected subnet to stop lateral spread',
            stateOverrides: { _spreading: true, _patientZero: 'WS-FIN-PC03' }
        },
        {
            id: 'backup_verify',
            name: 'Backup Verification',
            ticketSubject: 'Ransomware encrypted file server — need to verify backup integrity before restore',
            ticketDetail: 'The file server FS01 has been fully encrypted. Before we can begin recovery, we need to verify that our backups are clean and not also compromised. The ransomware was present on the network for an estimated 72 hours before detonation (dwell time). We need to find a backup point that predates the initial access and verify it has no malware artifacts.',
            ticketExtra: 'SOC Note: Backup schedule: Daily incremental at 2 AM, weekly full on Sundays. Initial access estimated at Monday 2026-03-25 around 14:00. The Tuesday 03-26 backup may already be contaminated. Verify the Sunday 03-23 full backup.',
            affectedHost: 'FS01 (file server)',
            fixDescription: 'Find clean backup, verify integrity, confirm no ransomware artifacts in backup',
            stateOverrides: { _backupNeeded: true, _dwellDays: 3 }
        },
        {
            id: 'attack_vector',
            name: 'Attack Vector Identification',
            ticketSubject: 'Ransomware incident — determine initial access vector for the post-mortem',
            ticketDetail: 'The ransomware incident has been contained and systems are being restored from backup. Leadership is demanding a root cause analysis. We need to determine how the attacker initially gained access. Was it phishing? RDP exposure? Vulnerable VPN? Supply chain? Review logs from the 48 hours before the first ransomware detection to identify the initial access.',
            ticketExtra: 'SOC Note: First ransomware execution detected 2026-03-28 04:17 AM. Look at: (1) email gateway logs for phishing, (2) VPN/RDP access logs, (3) firewall logs for inbound connections, (4) endpoint detection timeline for WS-FIN-PC03.',
            affectedHost: 'WS-FIN-PC03 (patient zero)',
            fixDescription: 'Trace initial access vector through log analysis',
            stateOverrides: { _vectorUnknown: true }
        },
        {
            id: 'incident_doc',
            name: 'Incident Documentation',
            ticketSubject: 'Ransomware incident nearly resolved — complete the incident report',
            ticketDetail: 'The ransomware incident is in the recovery phase. All infected hosts have been reimaged, backups have been verified and restoration is underway. Management and legal need a complete incident report documenting: timeline, affected systems, data impact, response actions taken, root cause, and recommendations. This documentation is required for cyber insurance and potential law enforcement notification.',
            ticketExtra: 'SOC Note: Incident timeline spans 2026-03-25 to 2026-03-29. 15 workstations + 1 file server affected. Estimated 48,000 files encrypted. Root cause: phishing email with macro-enabled document. No evidence of data exfiltration (encryption-only variant).',
            affectedHost: 'Organization-wide',
            fixDescription: 'Complete the incident report with all required sections',
            stateOverrides: { _reportNeeded: true }
        }
    ],

    // ==========================================================
    // HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Open the Forensics Console to review the ransomware artifacts and timeline.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal commands to investigate: dir, netstat, backup-status, event-log.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different response objective. Read the ticket carefully.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after completing the primary response objective.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        encrypted_files: [
            { id: 'hint1', text: 'Use "dir /s *.LOCKED" to see how many files are encrypted on the current system.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check the ransom note with "type README_DECRYPT.txt" for threat intel clues.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use "crypto-assess" to run the encryption assessment tool and catalog all affected files.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "crypto-assess --full" to complete the assessment. The report will contain the flag.', cost: 150, penalty: -150 }
        ],
        isolate_host: [
            { id: 'hint1', text: 'Check which hosts are infected with "netstat" to see active SMB connections.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The patient zero (WS-FIN-PC03) needs to be isolated first. Use "isolate-host" command.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'After isolating patient zero, isolate the entire 10.0.3.0/24 subnet with "isolate-subnet".', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: isolate-host 10.0.3.15, then isolate-subnet 10.0.3.0/24. Both are required.', cost: 150, penalty: -150 }
        ],
        backup_verify: [
            { id: 'hint1', text: 'Use "backup-status" to list available backup snapshots and their dates.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The initial access was Monday 03-25 at 14:00. Any backup after that may be contaminated.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Verify the Sunday 03-23 full backup with "backup-verify --date 2026-03-23".', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'After verifying the backup is clean, run "backup-restore --date 2026-03-23 --confirm" to begin restoration.', cost: 150, penalty: -150 }
        ],
        attack_vector: [
            { id: 'hint1', text: 'Start with the timeline: first execution was 03-28 at 04:17. Work backwards.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check email gateway logs with "email-log --user dknight --days 7" for phishing indicators.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'A phishing email with a macro-enabled Excel file was received on 03-25 at 13:47. Use "email-log --detail" to get the full header.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "attack-vector --confirm phishing" after gathering evidence from email-log. This completes the analysis.', cost: 150, penalty: -150 }
        ],
        incident_doc: [
            { id: 'hint1', text: 'Use "incident-report --template" to see what sections are required.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Review the timeline with "incident-timeline" to gather facts for the report.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use "incident-report --generate" to auto-generate the report from collected evidence.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "incident-report --generate --finalize" to complete and submit the report.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SEC002Config._flagRestored) {
            SEC002Config._flagRestored = true;
            var scenario = SEC002Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                SEC002Config.hints = SEC002Config._scenarioHints[scenario.id] || SEC002Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._encryptionActive = false;
        engine.state._filesEncrypted = 0;
        engine.state._spreading = false;
        engine.state._patientZero = null;
        engine.state._backupNeeded = false;
        engine.state._vectorUnknown = false;
        engine.state._reportNeeded = false;
        engine.state._hostIsolated = false;
        engine.state._subnetIsolated = false;
        engine.state._backupVerified = false;
        engine.state._backupRestored = false;
        engine.state._vectorConfirmed = false;
        engine.state._reportGenerated = false;
        engine.state._assessmentDone = false;
        engine.state._emailChecked = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        var overrides = SEC002Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }

        var scenario = SEC002Config._scenarios[idx];
        SEC002Config._flagRestored = true;
        SEC002Config.hints = SEC002Config._scenarioHints[scenario.id] || SEC002Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return SEC002Config._scenarios[engine.state._scenarioId];
    },

    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active incident assigned.\nOpen the Security Alert first to receive your assignment.';
        }
        return null;
    },

    _escHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // ==========================================================
    // BOOT SEQUENCE
    // ==========================================================

    boot: {
        biosLines: [
            'Dell Inc. UEFI BIOS A22',
            'Initializing Incident Response workstation...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... NVMe: Samsung 970 EVO Plus (1TB)',
            'Network: Intel(R) I350 Gigabit Dual-Port',
            'Secure Boot: Enabled',
            'Loading Windows Boot Manager...'
        ],
        grubEntries: ['Windows 10 Enterprise', 'Windows Recovery Environment'],
        loginUser: 'IR-Analyst'
    },

    // ==========================================================
    // DESKTOP ICONS
    // ==========================================================

    desktop: {
        icons: [
            { id: 'cmd',              label: 'Command\nPrompt',     icon: '>_',  app: 'terminal' },
            { id: 'forensics',        label: 'Forensics\nConsole',  icon: 'FOR', app: 'forensics_console' },
            { id: 'network',          label: 'Network\nMonitor',    icon: 'NET', app: 'network_monitor' },
            { id: 'ticket',           label: 'Security\nAlert',     icon: 'SEC', app: 'ticket' },
            { id: 'hints',            label: 'Hints',               icon: '?',   app: 'hints' },
            { id: 'reset',            label: 'Reset\nLab',          icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG
    // ==========================================================

    terminal: {
        user: 'IR-Analyst',
        hostname: 'IR-WS01',
        startDir: 'C:\\Users\\IR-Analyst',
        promptStyle: 'windows',
        welcome: 'Microsoft Windows [Version 10.0.19045.4412]\n(c) Microsoft Corporation. All rights reserved.\n\nIncident Response Workstation — Forensic Tools Loaded\n'
    },

    filesystem: { '/': { type: 'dir', children: {} } },

    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],

    scoring: {
        base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800
    },

    hints: [
        { id: 'hint1', text: 'Open the Forensics Console to review ransomware artifacts.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use CLI tools to investigate the scope and timeline.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario focuses on a different IR phase.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Complete the primary objective to reveal the flag.', cost: 50, penalty: -50 }
    ],

    lore: {
        intro: 'The nightmare scenario has arrived. Ransomware is loose in the network. As the incident responder, you must contain, investigate, and recover from this attack. Every minute counts.',
        scenario: 'Each scenario focuses on a different phase of ransomware response — from initial discovery through containment, backup verification, root cause analysis, and documentation.',
        outro: 'Ransomware incident contained. Your methodical response limited the blast radius, preserved evidence, and enabled recovery. The post-mortem will strengthen defenses.'
    },

    phases: [
        { id: 'investigate', name: 'Assessment', description: 'Assess the scope and impact of the ransomware.', requiredFlags: [], unlocks: ['contain'], locked: false },
        { id: 'contain', name: 'Containment', description: 'Isolate affected systems to stop the spread.', requiredFlags: [], unlocks: ['recover'], locked: true },
        { id: 'recover', name: 'Recovery', description: 'Verify backups and begin restoration.', requiredFlags: [], unlocks: ['document'], locked: true },
        { id: 'document', name: 'Documentation', description: 'Document the incident for the post-mortem.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // COMMANDS
    // ==========================================================

    commands: {

        dir: function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC002Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('.locked')) {
                if (scenario && scenario.id === 'encrypted_files') {
                    return '\n Directory of C:\\Users\\dknight\\Documents\n\n03/28/2026  04:17 AM    284,391  Q1_Budget.xlsx.LOCKED\n03/28/2026  04:17 AM    156,702  Payroll_March.xlsx.LOCKED\n03/28/2026  04:17 AM     42,880  Vendor_Contracts.docx.LOCKED\n03/28/2026  04:17 AM  1,204,558  Annual_Report_Draft.pptx.LOCKED\n03/28/2026  04:17 AM        847  README_DECRYPT.txt\n               5 File(s)      1,689,378 bytes\n\n Directory of \\\\FS01\\Finance$\n  [2,342 files with .LOCKED extension found]\n\nTotal encrypted files on this system: 2,347';
                }
                return '\n0 File(s) matching *.LOCKED found.';
            }

            return ' Volume in drive C has no label.\n\n Directory of C:\\Users\\IR-Analyst\n\n03/29/2026  08:00 AM    <DIR>          .\n03/29/2026  08:00 AM    <DIR>          Desktop\n03/29/2026  08:00 AM    <DIR>          Documents\n03/29/2026  08:00 AM    <DIR>          Tools\n               0 File(s)              0 bytes';
        },

        type: function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            var target = args.join(' ').toLowerCase();

            if (target.includes('readme') || target.includes('decrypt')) {
                return '\n====================================================\n         YOUR FILES HAVE BEEN ENCRYPTED\n====================================================\n\nAll your files have been encrypted with military-grade\nAES-256 + RSA-2048 encryption.\n\nYour unique ID: 7F3A-2B4E-9C1D-5E8F\n\nTo decrypt your files, you must pay 2.5 BTC to:\n  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\n\nOr visit our portal:\n  http://lockbitapt6vx57t3eeqjofwgcglmutr3a35nygvokja5uuccip4ykyd.onion\n\nYou have 72 hours. After that, the price doubles.\nAfter 7 days, your decryption key will be destroyed.\n\n  DO NOT:\n  - Rename encrypted files\n  - Use third-party decryption tools\n  - Contact law enforcement\n\n====================================================\n  LOCKBIT 3.0 | Your data is our business\n====================================================';
            }

            return '\nThe system cannot find the file specified.';
        },

        'crypto-assess': function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC002Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'encrypted_files') {
                if (joined.includes('--full')) {
                    engine.state._assessmentDone = true;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Encryption assessment complete. Report generated with flag.', 'success'); }, 400);
                    return '\nCrypto Assessment Tool v2.1\n===========================\nScanning all accessible drives and shares...\n\nAffected Systems:\n  WS-FIN-PC03 (patient zero)    342 files encrypted\n  WS-FIN-PC04                   287 files encrypted\n  WS-FIN-PC05                   198 files encrypted\n  ... (12 more workstations)    1,178 files total\n  FS01 (\\\\FS01\\Finance$)        2,342 files encrypted\n\nTotal Files Encrypted: 4,347\nRansomware Variant: LockBit 3.0\nEncryption: AES-256-CBC + RSA-2048\nExtension: .LOCKED\nRansom Note: README_DECRYPT.txt\nEstimated Dwell Time: 72 hours\nFirst Execution: 2026-03-28 04:17:03\n\nNo known free decryptor available for this variant.\nRecommendation: Restore from verified clean backup.\n\n=== FLAG: SEC002{encrypted_files_assessed_4347} ===';
                }
                return '\nCrypto Assessment Tool v2.1\n===========================\nUsage: crypto-assess --full     Run full assessment across all drives\n       crypto-assess --quick    Quick count on local drives only';
            }
            return '\nCrypto Assessment Tool v2.1\nNo encrypted files matching ransomware patterns found.';
        },

        'isolate-host': function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC002Config._getScenario(engine);
            var target = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'isolate_host') {
                if (target.includes('10.0.3.15') || target.includes('ws-fin-pc03')) {
                    engine.state._hostIsolated = true;
                    engine.save();
                    if (engine.state._subnetIsolated) {
                        engine.state._labComplete = true;
                        engine.state._flagRevealed = true;
                        engine.save();
                        setTimeout(function() { engine.notify('Patient zero isolated and subnet contained. Spread halted.', 'success'); }, 400);
                        return '\nHost Isolation: WS-FIN-PC03 (10.0.3.15)\n  Disabling all network interfaces... OK\n  Blocking via EDR agent... OK\n  SMB connections terminated... OK\n\nPatient zero isolated.\n\n=== CONTAINMENT COMPLETE ===\n=== FLAG: SEC002{isolate_host_contained_spread} ===';
                    }
                    return '\nHost Isolation: WS-FIN-PC03 (10.0.3.15)\n  Disabling all network interfaces... OK\n  Blocking via EDR agent... OK\n\nPatient zero isolated. But ransomware may still be active on other hosts.\nConsider isolating the entire 10.0.3.0/24 subnet with "isolate-subnet 10.0.3.0/24".';
                }
            }
            return '\nUsage: isolate-host <ip or hostname>\nIsolates a host from the network via EDR agent.';
        },

        'isolate-subnet': function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC002Config._getScenario(engine);
            var target = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'isolate_host' && target.includes('10.0.3.0')) {
                engine.state._subnetIsolated = true;
                engine.save();
                if (engine.state._hostIsolated) {
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Subnet isolated. Ransomware spread halted.', 'success'); }, 400);
                    return '\nSubnet Isolation: 10.0.3.0/24\n  Configuring firewall rules... OK\n  Blocking inter-VLAN routing... OK\n  15 hosts isolated\n\n=== CONTAINMENT COMPLETE ===\n=== FLAG: SEC002{isolate_host_contained_spread} ===';
                }
                return '\nSubnet Isolation: 10.0.3.0/24\n  Configuring firewall rules... OK\n  15 hosts affected\n\nSubnet isolated. Don\'t forget to isolate patient zero specifically.';
            }
            return '\nUsage: isolate-subnet <cidr>\nExample: isolate-subnet 10.0.3.0/24';
        },

        'backup-status': function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            return '\nBackup Server: BK-SRV01\n========================\nAvailable Snapshots for FS01:\n\n  2026-03-23 (Sun)  FULL    Status: Available  Size: 487 GB\n  2026-03-24 (Mon)  INCR    Status: Available  Size: 12 GB\n  2026-03-25 (Tue)  INCR    Status: Available  Size: 18 GB  [!] Post-initial-access\n  2026-03-26 (Wed)  INCR    Status: Available  Size: 24 GB  [!] Post-initial-access\n  2026-03-27 (Thu)  INCR    Status: Available  Size: 31 GB  [!] Post-initial-access\n  2026-03-28 (Fri)  INCR    Status: CORRUPTED  Size: N/A    [!] Ransomware active\n\nLast verified clean backup: Unknown — verification required.';
        },

        'backup-verify': function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC002Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'backup_verify') {
                if (joined.includes('2026-03-23') || joined.includes('03-23')) {
                    engine.state._backupVerified = true;
                    engine.save();
                    return '\nBackup Verification: 2026-03-23 (Sunday Full Backup)\n=====================================================\n  Integrity check... PASS (SHA256 verified)\n  Malware scan... CLEAN (no ransomware artifacts)\n  File count... 48,291 files (matches pre-incident baseline)\n  Checking for IOCs... CLEAN\n  Checking for persistence mechanisms... CLEAN\n\nVERDICT: Backup is CLEAN and safe for restoration.\nUse "backup-restore --date 2026-03-23 --confirm" to begin restoration.';
                }
                if (joined.includes('2026-03-25') || joined.includes('03-25') || joined.includes('2026-03-26') || joined.includes('03-26') || joined.includes('2026-03-27') || joined.includes('03-27')) {
                    return '\nBackup Verification: ' + joined.split('--date')[1] + '\n=====================================================\n  Integrity check... PASS\n  Malware scan... THREAT DETECTED\n    [!] C:\\ProgramData\\winlogon32.exe (Trojan.Qakbot.Loader)\n    [!] Scheduled task: \\Microsoft\\Windows\\NetUpdate (persistence)\n\nVERDICT: Backup is CONTAMINATED. Do not restore.\nTry an earlier backup point (before 2026-03-25 14:00).';
                }
            }
            return '\nUsage: backup-verify --date <YYYY-MM-DD>\nVerifies a backup snapshot for integrity and malware.';
        },

        'backup-restore': function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC002Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'backup_verify' && engine.state._backupVerified && joined.includes('2026-03-23') && joined.includes('--confirm')) {
                engine.state._backupRestored = true;
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('Backup restoration initiated from clean snapshot. Recovery underway.', 'success'); }, 400);
                return '\nBackup Restoration: FS01 from 2026-03-23\n==========================================\n  Mounting clean backup image... OK\n  Restoring 48,291 files to FS01... IN PROGRESS\n  Estimated time: 4 hours 23 minutes\n  Restoring file permissions... QUEUED\n  Restoring share configurations... QUEUED\n\nRestoration initiated successfully.\nData loss window: 2026-03-23 to 2026-03-28 (5 days of incremental changes)\nRecommendation: Notify affected departments about data loss window.\n\n=== FLAG: SEC002{backup_verify_clean_restore} ===';
            }
            return '\nUsage: backup-restore --date <YYYY-MM-DD> --confirm\nRequires backup-verify first.';
        },

        'email-log': function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC002Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'attack_vector') {
                if (joined.includes('dknight') || joined.includes('--detail')) {
                    engine.state._emailChecked = true;
                    engine.save();
                    return '\nEmail Gateway Log — User: dknight@corp.hexworth.local\n=====================================================\n\n  2026-03-25 13:47:22  FROM: invoices@quickbooks-secure.com\n    TO: dknight@corp.hexworth.local\n    SUBJECT: Updated Invoice #INV-2026-3847 — Action Required\n    ATTACHMENT: Invoice_March_2026.xlsm (284 KB) [MACRO-ENABLED]\n    SPF: FAIL (domain mismatch)\n    DKIM: FAIL\n    DMARC: FAIL\n    ACTION: Delivered (spam filter score: 4.2/5.0 — just under threshold)\n    [!] SUSPICIOUS: .xlsm attachment, failed authentication, lookalike domain\n\n  2026-03-25 13:52:08  Macro execution detected on WS-FIN-PC03\n    PowerShell download initiated: hxxps://cdn-update.evil.com/payload.exe\n    File saved: C:\\ProgramData\\winlogon32.exe\n\nThis is the initial access vector. Use "attack-vector --confirm phishing" to document.';
                }
                return '\nUsage: email-log --user <username> [--days <n>] [--detail]';
            }
            return '\nEmail Gateway Log\nNo suspicious email activity found in the selected timeframe.';
        },

        'attack-vector': function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC002Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'attack_vector' && joined.includes('--confirm') && joined.includes('phishing') && engine.state._emailChecked) {
                engine.state._vectorConfirmed = true;
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('Attack vector confirmed and documented. Root cause: phishing.', 'success'); }, 400);
                return '\nAttack Vector Analysis — CONFIRMED\n====================================\n  Vector: Phishing email with macro-enabled attachment\n  Target: dknight@corp.hexworth.local\n  Delivery: 2026-03-25 13:47:22\n  Payload: Invoice_March_2026.xlsm -> winlogon32.exe (Qakbot loader)\n  Execution: 2026-03-25 13:52:08\n  Dwell Time: ~63 hours before ransomware detonation\n  Kill Chain: Delivery -> Exploitation (macro) -> Installation -> C2 -> Lateral Movement -> Ransomware\n\nRoot Cause: Spam filter threshold too permissive (4.2 passed, threshold 5.0)\nRecommendation: Lower spam threshold to 3.5, block .xlsm attachments, enable Safe Links\n\n=== FLAG: SEC002{attack_vector_phishing_confirmed} ===';
            }
            return '\nUsage: attack-vector --confirm <type>\nTypes: phishing, rdp, vpn, supply-chain\nRequires evidence gathered from log analysis first.';
        },

        'incident-timeline': function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            return '\nIncident Timeline\n==================\n  2026-03-25 13:47  Phishing email delivered to dknight\n  2026-03-25 13:52  Macro executed, Qakbot loader dropped\n  2026-03-25 14:15  C2 connection established to 185.220.101.34\n  2026-03-25 16:30  Credential harvesting via Mimikatz\n  2026-03-26 02:00  Lateral movement begins (SMB)\n  2026-03-27 11:00  Domain controller DC01 accessed\n  2026-03-28 04:17  LockBit 3.0 ransomware detonated\n  2026-03-28 04:45  First user reports encrypted files\n  2026-03-28 05:30  SOC declares incident\n  2026-03-28 06:00  Containment actions initiated\n  2026-03-29 08:00  Recovery phase begins';
        },

        'incident-report': function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC002Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'incident_doc') {
                if (joined.includes('--template')) {
                    return '\nIncident Report Template\n========================\nRequired Sections:\n  1. Executive Summary\n  2. Timeline of Events\n  3. Affected Systems (count, type)\n  4. Data Impact Assessment\n  5. Response Actions Taken\n  6. Root Cause Analysis\n  7. Recommendations\n  8. Lessons Learned\n\nUse "incident-report --generate" to auto-fill from collected evidence.\nUse "incident-report --generate --finalize" to complete and submit.';
                }
                if (joined.includes('--generate') && joined.includes('--finalize')) {
                    engine.state._reportGenerated = true;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Incident report generated and submitted. Documentation complete.', 'success'); }, 400);
                    return '\nIncident Report Generated — IR-2026-0087\n=========================================\n\n1. EXECUTIVE SUMMARY\n   LockBit 3.0 ransomware attack affecting 16 systems and\n   48,000+ files. Contained within 26 hours. No data exfiltration.\n\n2. TIMELINE: 2026-03-25 to 2026-03-29 (see incident-timeline)\n\n3. AFFECTED SYSTEMS: 15 workstations + 1 file server (FS01)\n\n4. DATA IMPACT: 48,347 files encrypted. 5-day data loss window.\n\n5. RESPONSE ACTIONS:\n   - Network isolation of Finance subnet\n   - EDR-based host isolation of patient zero\n   - Backup verification and restoration from 03-23 snapshot\n   - Full reimage of all affected workstations\n\n6. ROOT CAUSE: Phishing email with macro-enabled Excel file\n   bypassed spam filter (threshold too permissive)\n\n7. RECOMMENDATIONS:\n   - Lower spam filter threshold from 5.0 to 3.5\n   - Block macro-enabled Office files from external sources\n   - Implement network segmentation for Finance VLAN\n   - Deploy EDR with automated isolation capability\n\n8. LESSONS LEARNED:\n   - 72-hour dwell time indicates detection gap\n   - Backup verification should be automated weekly\n\nReport submitted to: CISO, Legal, Insurance\n\n=== FLAG: SEC002{incident_doc_report_complete} ===';
                }
                if (joined.includes('--generate')) {
                    return '\nGenerating report from collected evidence...\nAdd --finalize flag to complete and submit the report.';
                }
            }
            return '\nUsage: incident-report --template              View required sections\n       incident-report --generate               Generate from evidence\n       incident-report --generate --finalize    Generate and submit';
        },

        netstat: function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC002Config._getScenario(engine);

            var output = '\nActive Connections\n\n  Proto  Local Address          Foreign Address        State           PID\n';
            output += '  TCP    10.0.2.50:49721        52.96.166.34:443       ESTABLISHED     3244\n';

            if (scenario && scenario.id === 'isolate_host' && engine.state._spreading && !engine.state._hostIsolated) {
                output += '  TCP    10.0.3.15:49800        10.0.3.16:445          ESTABLISHED     4120\n';
                output += '  TCP    10.0.3.15:49801        10.0.3.17:445          ESTABLISHED     4120\n';
                output += '  TCP    10.0.3.15:49802        10.0.3.18:445          SYN_SENT        4120\n';
                output += '  TCP    10.0.3.15:49803        10.0.4.10:445          SYN_SENT        4120\n';
                output += '\n  [!] WARNING: Active SMB spreading detected from 10.0.3.15 (WS-FIN-PC03)';
            }

            return output;
        },

        ping: function(args, term, engine) {
            var gate = SEC002Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping <target>';
            var target = args[0];
            if (target.startsWith('10.0.')) {
                return '\nPinging ' + target + ' with 32 bytes of data:\nReply from ' + target + ': bytes=32 time=1ms TTL=128\nReply from ' + target + ': bytes=32 time<1ms TTL=128';
            }
            return '\nPing request could not find host ' + target + '.';
        },

        whoami: function() { return 'IR-WS01\\IR-Analyst'; },
        hostname: function() { return 'IR-WS01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        systeminfo: function() {
            return '\nHost Name:                 IR-WS01\nOS Name:                   Microsoft Windows 10 Enterprise\nOS Version:                10.0.19045\nSystem Manufacturer:       Dell Inc.\nTotal Physical Memory:     32,768 MB\nDomain:                    corp.hexworth.local';
        },
        ipconfig: function() {
            return '\nWindows IP Configuration\n\n  Ethernet adapter Corporate LAN:\n    IPv4 Address. . . . . . . . : 10.0.2.50\n    Subnet Mask . . . . . . . . : 255.255.255.0\n    Default Gateway . . . . . . : 10.0.2.1';
        },

        ifconfig: function() { return '\'ifconfig\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        grep: function() { return '\'grep\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command,\noperable program or batch file.'; }
    },

    // ==========================================================
    // WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['forensics_console', 'network_monitor'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Security Alert first to receive your assignment.', 'error');
            return;
        }
        switch (iconDef.app) {
            case 'ticket':            SEC002Config._openTicket(iconDef, engine); break;
            case 'forensics_console': SEC002Config._openForensics(iconDef, engine); break;
            case 'network_monitor':   SEC002Config._openNetworkMonitor(iconDef, engine); break;
            case 'reset_lab':         SEC002Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Security Alert', 'SEC', container);
        SEC002Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            SEC002Config._renderTicket(engine, container);
        } else {
            SEC002Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker(engine, container) {
        var previews = [
            'SOC Team — "Files encrypted with .LOCKED extension across Finance department"',
            'SOC Lead — "Ransomware actively spreading via SMB — need immediate isolation"',
            'IR Team — "File server encrypted — verify backup integrity before restore"',
            'Management — "Determine how the attacker got in — root cause analysis needed"',
            'Legal/CISO — "Incident nearly resolved — complete the documentation for insurance"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#dc2626; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">RANSOMWARE INCIDENT QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select an incident phase to investigate.</div>'
            + '</div><div style="margin-bottom:16px;">';

        SEC002Config._scenarios.forEach(function(s, i) {
            html += '<button class="sec-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#dc2626; font-weight:bold;">IR-' + (1000 + i) + '</span>'
                + '<span style="background:#dc2626; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">CRITICAL</span></div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="secRandomBtn" style="padding:10px 28px; background:#dc2626; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button></div>';

        container.innerHTML = html;
        container.querySelectorAll('.sec-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#dc2626'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                SEC002Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                SEC002Config._renderTicket(engine, container);
            });
        });
        document.getElementById('secRandomBtn').addEventListener('click', function() {
            SEC002Config._applyScenario(engine, Math.floor(Math.random() * SEC002Config._scenarios.length));
            SEC002Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        var scenario = SEC002Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#dc2626; font-weight:bold; font-size:1rem;">INCIDENT #IR-' + (1000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#dc2626; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">SEVERITY: CRITICAL</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">AFFECTED SYSTEMS</div>'
            + '<div style="font-weight:bold; color:#dc2626;">' + scenario.affectedHost + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + SEC002Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + SEC002Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SOC NOTES</div>'
            + '<div style="background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#fca5a5;">'
            + SEC002Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div>'
            + '<div style="color:#2ecc71; font-weight:bold;">YOU — Incident Response Analyst</div></div>';
    },

    _openForensics(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'forContainer';
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Forensics Console', 'FOR', container);

        var scenario = SEC002Config._getScenario(engine);
        var html = '<div style="color:#dc2626; font-weight:bold; font-size:1rem; margin-bottom:12px;">Forensics Console — Ransomware Artifacts</div>';

        html += '<div style="margin-bottom:16px;"><div style="color:#dc2626; font-weight:bold; font-size:0.85rem; margin-bottom:8px;">Ransomware Profile</div>'
            + '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px;">'
            + '<div style="margin-bottom:6px;"><span style="color:#888; width:140px; display:inline-block;">Variant:</span> LockBit 3.0</div>'
            + '<div style="margin-bottom:6px;"><span style="color:#888; width:140px; display:inline-block;">Extension:</span> .LOCKED</div>'
            + '<div style="margin-bottom:6px;"><span style="color:#888; width:140px; display:inline-block;">Encryption:</span> AES-256-CBC + RSA-2048</div>'
            + '<div style="margin-bottom:6px;"><span style="color:#888; width:140px; display:inline-block;">First Execution:</span> 2026-03-28 04:17:03</div>'
            + '<div style="margin-bottom:6px;"><span style="color:#888; width:140px; display:inline-block;">Ransom Amount:</span> 2.5 BTC (~$175,000)</div>'
            + '<div><span style="color:#888; width:140px; display:inline-block;">Free Decryptor:</span> <span style="color:#dc2626;">Not Available</span></div>'
            + '</div></div>';

        var statusColor = engine.state._labComplete ? '#22c55e' : '#dc2626';
        var statusText = engine.state._labComplete ? 'CONTAINED' : 'ACTIVE INCIDENT';
        html += '<div style="padding:12px; background:rgba(' + (engine.state._labComplete ? '34,197,94' : '220,38,38') + ',0.08); border:1px solid rgba(' + (engine.state._labComplete ? '34,197,94' : '220,38,38') + ',0.2); border-radius:4px; text-align:center;">'
            + '<div style="font-size:0.75rem; color:#888;">Incident Status</div>'
            + '<div style="color:' + statusColor + '; font-weight:bold; font-size:1.1rem;">' + statusText + '</div></div>';

        container.innerHTML = html;
    },

    _openNetworkMonitor(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'netmonContainer';
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Network Monitor', 'NET', container);

        var scenario = SEC002Config._getScenario(engine);
        var html = '<div style="color:#dc2626; font-weight:bold; font-size:1rem; margin-bottom:12px;">Network Monitor — Threat Activity</div>';
        html += '<div style="color:#888; font-size:0.75rem; margin-bottom:12px;">Monitoring lateral movement and C2 traffic</div>';
        html += '<div style="margin-top:16px; color:#888; font-size:0.75rem;">Use the terminal command "netstat" for raw connection data.</div>';
        container.innerHTML = html;
    },

    _confirmReset(engine) {
        if (confirm('Reset this lab? All progress will be lost.')) { engine.resetLab(); }
    }
};
