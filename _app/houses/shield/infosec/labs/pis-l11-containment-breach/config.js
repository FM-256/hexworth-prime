/* ============================================================
   PIS-L11: Containment Breach
   Principles of Information Security -- CTF Lab
   Incident response: detect, contain, eradicate, recover,
   forensic imaging, chain of custody, root cause analysis
   SY0-701: 4.3, 4.4
   ============================================================ */

const PISL11Config = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Containment Breach',
    subtitle: 'Hexworth Containment -- Incident Response Activation',
    description: 'A pathogen has escaped Lab 3. Execute the incident response playbook: detect scope, contain affected systems, preserve forensic evidence, eradicate the pathogen, recover operations, and produce a root cause analysis with timeline.',
    difficulty: 'Hard',
    estimatedTime: 45,
    accent: '#dc2626',
    storageKey: 'hexworth_lab_pis_l11',
    registryId: 'pis-l11-containment-breach',
    trackerKey: 'lab_pis_l11',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'Incident Response Terminal -- BSL-4 Clearance',
            'IR playbook: LOADED (IRP-2026-001)',
            'Forensic imaging tools: READY',
            'Chain of custody system: ONLINE',
            '*** BREACH ALERT: PATHOGEN DETECTED OUTSIDE LAB 3 ***'
        ],
        grubEntries: [
            'Containment Analyst OS 22.04 LTS',
            'Containment Analyst OS (recovery mode)'
        ],
        loginUser: 'ir-lead'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'At 04:23 UTC, motion sensors and network anomaly detection simultaneously flagged activity from Lab 3 that violates containment protocols. The automated containment doors failed to close -- a maintenance window was open. Pathogen SPX-4471 (Advanced Persistent Ransomware variant) has propagated beyond Lab 3 into the adjacent corridor network segments. You are the IR lead. You have been woken up. This is not a drill.',
        scenario: 'Follow the NIST incident response lifecycle: Preparation (done -- IR tools are loaded), Detection and Analysis (run status), Containment (isolate affected systems), Eradication (eradicate), Recovery (recover), and Lessons Learned (root-cause). Evidence must be preserved before eradication -- forensic images and chain of custody must be filed. Do not skip steps. The order matters for both legal defensibility and operational integrity.',
        outro: 'Incident response complete. SPX-4471 contained, eradicated, and systems recovered. Forensic evidence preserved with documented chain of custody. Root cause identified: maintenance window left network isolation inactive during vulnerability window. Post-incident review scheduled. This is the NIST IR lifecycle in practice. Every step -- especially evidence preservation before eradication -- matters for both security and legal accountability.'
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'ir-lead',
        hostname: 'ir-ws-01',
        startDir: '/home/ir-lead',
        welcome: 'Hexworth Containment -- Incident Response Terminal\nBSL-4 Clearance Active\n\n*** ACTIVE INCIDENT: BREACH-2026-0409 ***\n  Pathogen: SPX-4471 (Advanced Persistent Ransomware)\n  Origin:   Lab 3\n  Spread:   Unknown -- assessment required\n  Status:   ACTIVE -- IR playbook not yet initiated\n\nNIST IR Lifecycle:\n  [1] status          -- Detect/assess scope\n  [2] isolate         -- Contain affected systems\n  [3] image + chain-of-custody  -- Preserve evidence\n  [4] eradicate       -- Remove pathogen\n  [5] recover         -- Restore operations\n  [6] root-cause      -- Determine cause\n\nType "status" to begin.\nType "help" for full command reference.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'briefing', label: 'Briefing',    icon: '\uD83D\uDCCB',    app: 'briefing' },
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
        ]
    },

    // Custom desktop-icon dispatch \u2014 invoked by BoxEngine's `default:` extension
    // hook (BoxEngine.js:1110-1115) for any icon whose `app` is not built-in.
    onAppLaunch: function(iconDef, engine) {
        if (iconDef && iconDef.app === 'briefing') {
            // Re-summon \u2014 bypass skip-next-time storage; lab is already running
            // so the launch callback is a no-op.
            BriefingPage.show(this, function() {}, { force: true });
        }
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    // =========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'ir-lead': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: 'IR PLAYBOOK NOTES -- BREACH-2026-0409\n======================================\n\nPATHOGEN: SPX-4471\n  Class: Advanced Persistent Ransomware\n  Behavior: Network propagation via SMB, file encryption, C2 beaconing\n  Known C2: 91.108.4.123:443\n  Encryption: AES-256 (files renamed .hexlocked)\n  VSS deletion: YES (shadow copies removed on infected hosts)\n\nSYSTEMS KNOWN TO BE AFFECTED (initial report):\n  lab3-ws-01 through lab3-ws-14  (Lab 3 origin -- all 14 hosts)\n  lab3-srv-01                    (Lab 3 file server)\n  corridor-relay-01              (breach point -- corridor network)\n\nPOTENTIALLY AFFECTED (not yet confirmed):\n  lab2-ws-03 (ARP table shows recent contact with corridor-relay-01)\n  lab4-ws-09 (unusual SMB traffic at 04:18Z)\n\nIR LIFECYCLE (NIST SP 800-61):\n  1. Detection/Analysis: status\n  2. Containment:        isolate <system>\n  3. Evidence:           image <system>  then  chain-of-custody <system>\n  4. Eradication:        eradicate\n  5. Recovery:           recover\n  6. Lessons Learned:    root-cause\n\nIMPORTANT: Image systems BEFORE eradication.\nEvidence collected after eradication is legally compromised.\n\nADDITIONAL COMMANDS:\n  timeline    View incident timeline\n  status      Show current system status\n'
                                },
                                'irp-2026-001.txt': {
                                    type: 'file',
                                    content: 'INCIDENT RESPONSE PLAYBOOK -- IRP-2026-001\nHexworth Containment / Ransomware Containment Variant\n\nPHASE 1: DETECTION AND ANALYSIS\n  Objective: Determine full scope of compromise\n  Actions:\n    - Run status to assess all affected systems\n    - Identify patient-zero (origin system)\n    - Map propagation path\n    - Document timeline from first alert\n  Completion criteria: All affected systems identified\n\nPHASE 2: CONTAINMENT\n  Objective: Stop spread, prevent further damage\n  Tactics:\n    SHORT-TERM: Network isolation of all confirmed infected systems\n      Command: isolate <system-id>\n    LONG-TERM: VLAN quarantine (coordinate with netops)\n  Completion criteria: No further SMB propagation detected\n\nPHASE 3: EVIDENCE PRESERVATION\n  CRITICAL: Must occur BEFORE eradication\n  Actions:\n    - Forensic disk image of each affected system\n    - Memory capture (volatile evidence)\n    - Log collection and integrity hashing\n    - Chain of custody documentation\n  Commands:\n    image <system>          Forensic disk image\n    chain-of-custody <sys>  Document evidence handling\n  Legal note: Evidence obtained after eradication may be inadmissible.\n\nPHASE 4: ERADICATION\n  Command: eradicate\n  Validates: All systems isolated, all systems imaged\n  Actions: Wipe and reinstall from clean golden image\n\nPHASE 5: RECOVERY\n  Command: recover\n  Actions: Restore from last clean backup, validate integrity\n\nPHASE 6: LESSONS LEARNED\n  Command: root-cause\n  Actions: Identify root cause, document timeline, propose controls\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'status\ncat notes.txt\ncat irp-2026-001.txt\n'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // =========================================================
    // INTERNAL STATE
    // =========================================================

    _state: {
        statusRun: false,
        isolatedSystems: {},    // system-id -> true (plain object as set)
        imagedSystems: {},      // system-id -> true (plain object as set)
        custodyFiled: {},       // system-id -> true (plain object as set)
        eradicated: false,
        recovered: false,
        rootCauseAnalyzed: false
    },

    // Affected systems that must be isolated
    _affectedSystems: [
        'lab3-ws-01', 'lab3-ws-02', 'lab3-ws-03', 'lab3-ws-04', 'lab3-ws-05',
        'lab3-ws-06', 'lab3-ws-07', 'lab3-ws-08', 'lab3-ws-09', 'lab3-ws-10',
        'lab3-ws-11', 'lab3-ws-12', 'lab3-ws-13', 'lab3-ws-14',
        'lab3-srv-01', 'corridor-relay-01', 'lab2-ws-03', 'lab4-ws-09'
    ],

    _flag1Awarded: false,
    _flag2Awarded: false,
    _flag3Awarded: false,

    // =========================================================
    // TERMINAL COMMANDS
    // =========================================================

    commands: {

        // status -- assess current breach scope
        'status': function(args, term, engine) {
            engine._state.statusRun = true;

            const isolated   = Object.keys(engine._state.isolatedSystems).length;
            const imaged     = Object.keys(engine._state.imagedSystems).length;
            const totalAffected = engine._affectedSystems.length;

            return `BREACH STATUS -- INCIDENT BREACH-2026-0409\n${'='.repeat(60)}\nTime: 2026-04-09T04:23:00Z (first detection)\nCurrent time: 2026-04-09T04:31:00Z (8 minutes elapsed)\n\nSYSTEMS STATUS:\n  CONFIRMED INFECTED (Lab 3 origin):\n    lab3-ws-01 through lab3-ws-14   [14 workstations] INFECTED\n    lab3-srv-01                      [file server]     INFECTED\n  \n  BREACH POINT (corridor network):\n    corridor-relay-01                [network relay]   INFECTED\n  \n  SECONDARY SPREAD (confirmed via network capture):\n    lab2-ws-03 (10.0.2.13)          INFECTED (SMB at 04:21Z)\n    lab4-ws-09 (10.0.4.19)          INFECTED (SMB at 04:22Z)\n\n  TOTAL AFFECTED: 18 systems\n  CONTAINED: ${isolated}/18\n  IMAGED:    ${imaged}/18\n\nPATHOGEN ACTIVITY:\n  Active C2 beaconing: corridor-relay-01 --> 91.108.4.123:443\n  SMB propagation: STOPPED on isolated systems, ACTIVE on uncontained\n  Encryption: Ongoing on uncontained systems\n\nFILE ENCRYPTION STATUS:\n  lab3-ws-01 through lab3-ws-14: 100% files encrypted (.hexlocked)\n  lab3-srv-01: 78% encrypted (in progress)\n  lab2-ws-03: 12% encrypted (recently infected)\n  lab4-ws-09: 3% encrypted (recently infected)\n  corridor-relay-01: OS files intact (relay, not workstation target)\n\nNEXT STEP: Isolate all affected systems.\nCommand: isolate <system-id>\nSee ~/notes.txt for the full system list.`;
        },

        // isolate <system> -- network-isolate a compromised system
        'isolate': function(args, term, engine) {
            if (!engine._state.statusRun) {
                return 'Error: Run "status" first to assess the breach scope before isolating systems.';
            }

            const system = args[0];

            if (!system) {
                return 'Usage: isolate <system-id>\nExample: isolate lab3-ws-01\nSee ~/notes.txt for full list of affected systems.';
            }

            if (!engine._affectedSystems.includes(system)) {
                // Accept lab3-ws-all as shorthand
                if (system === 'lab3-all') {
                    const lab3Systems = engine._affectedSystems.filter(s => s.startsWith('lab3'));
                    lab3Systems.forEach(s => { engine._state.isolatedSystems[s] = true; });
                    const count = Object.keys(engine._state.isolatedSystems).length;
                    return `BULK ISOLATION: All Lab 3 systems\n  Isolated: ${lab3Systems.join(', ')}\n  Network disconnected: VLAN isolated, physical port disabled\n  Total isolated: ${count}/18`;
                }
                return `Error: "${system}" is not in the affected systems list.\nRun "status" for the full list.`;
            }

            if (engine._state.isolatedSystems[system]) {
                return `${system} is already isolated.`;
            }

            engine._state.isolatedSystems[system] = true;
            const count = Object.keys(engine._state.isolatedSystems).length;

            let output = `SYSTEM ISOLATED: ${system}\n  Network: DISCONNECTED (VLAN quarantine applied)\n  Physical port: DISABLED on CORE-SW-01\n  SMB propagation from this host: STOPPED\n  C2 communication: SEVERED\n\nIsolated: ${count}/18 affected systems`;

            if (count >= 18 && !engine._flag1Awarded) {
                engine._flag1Awarded = true;
                engine.awardFlag('flag1');
                output += '\n\n[CONTAINMENT MILESTONE] All 18 affected systems isolated. Breach contained. Flag unlocked.\nNext: image all affected systems for forensic analysis BEFORE eradication.';
            }

            return output;
        },

        // image <system> -- take forensic disk image
        'image': function(args, term, engine) {
            if (Object.keys(engine._state.isolatedSystems).length < 18) {
                return `Error: Cannot image systems that have not been isolated.\nIsolate all affected systems first.\nIsolated: ${Object.keys(engine._state.isolatedSystems).length}/18\nUse: isolate <system-id>`;
            }

            const system = args[0];

            if (!system) {
                return 'Usage: image <system-id>\nExample: image lab3-srv-01\nA forensic image captures the full disk state for analysis.\nMust be done before eradication.';
            }

            if (!engine._affectedSystems.includes(system)) {
                return `Error: "${system}" is not in the affected systems list.`;
            }

            if (engine._state.imagedSystems[system]) {
                return `${system} has already been imaged.\nImage file: /forensics/images/${system}.img`;
            }

            engine._state.imagedSystems[system] = true;
            const count = Object.keys(engine._state.imagedSystems).length;
            const sizeMB = system.includes('srv') ? 204800 : (system.includes('relay') ? 51200 : 102400);

            return `FORENSIC IMAGE: ${system}\n  Tool:      dc3dd (forensic imaging)\n  Source:    /dev/sda (${system})\n  Dest:      /forensics/images/${system}.img\n  Size:      ${(sizeMB/1024).toFixed(0)} GB\n  Hash:      SHA-256 computed and stored\n  Imaging... [========================================] 100%\n  Verification: Image hash matches source hash -- VERIFIED\n  Status:    COMPLETE\n\nImages captured: ${count}/18\nNext: file chain of custody for each imaged system with: chain-of-custody <system>`;
        },

        // chain-of-custody -- document evidence chain of custody
        'chain-of-custody': function(args, term, engine) {
            const system = args[0];

            if (!system) {
                return 'Usage: chain-of-custody <system-id>\nExample: chain-of-custody lab3-srv-01\nThis documents who collected the evidence and when,\nestablishing legal defensibility for forensic analysis.';
            }

            if (!engine._affectedSystems.includes(system)) {
                return `Error: "${system}" is not in the affected systems list.`;
            }

            if (!engine._state.imagedSystems[system]) {
                return `Error: ${system} has not been imaged yet.\nImage first: image ${system}`;
            }

            if (engine._state.custodyFiled[system]) {
                return `Chain of custody already filed for ${system}.`;
            }

            engine._state.custodyFiled[system] = true;
            const custodySize = Object.keys(engine._state.custodyFiled).length;

            let output = `CHAIN OF CUSTODY FILED: ${system}\n${'─'.repeat(50)}\n  Evidence ID:     EVID-2026-0409-${String(custodySize).padStart(3,'0')}\n  Item:            Forensic disk image of ${system}\n  Image file:      /forensics/images/${system}.img\n  Hash (SHA-256):  Recorded and sealed\n  Collected by:    ir-lead (you)\n  Collection time: 2026-04-09T04:45:00Z\n  Collection site: Hexworth Containment IR Suite\n  Custody log:     Updated in incident tracking system\n  Sealed by:       Director witness (DR-2026-0409-001)\n\nCustody filed: ${custodySize}`;

            // Flag 2: all systems imaged AND all custody filed
            if (custodySize >= 18 && !engine._flag2Awarded) {
                engine._flag2Awarded = true;
                engine.awardFlag('flag2');
                output += '\n\n[EVIDENCE MILESTONE] All affected systems imaged with chain of custody documented. Flag unlocked.\nEvidence is legally preserved. Proceed with: eradicate';
            }

            return output;
        },

        // timeline -- view incident timeline
        'timeline': function(args, term, engine) {
            return `INCIDENT TIMELINE -- BREACH-2026-0409\n${'='.repeat(60)}\n\n2026-04-08T23:14:37Z  INITIAL ACCESS\n  specimen-db-01: Large outbound transfer to 91.108.4.123 (4.7 GB)\n  (Separate incident -- analyst-07 credentials compromised)\n\n2026-04-09T02:31:00Z  CREDENTIAL THEFT\n  lab2-ws-04: LSASS dump -- admin-svc credentials extracted\n  (Attacker used existing C2 foothold on lab2-ws-04)\n\n2026-04-09T02:33:00Z  LATERAL MOVEMENT\n  lab2-ws-04 --> lab1-ws-02: admin-svc used to access multiple systems\n\n2026-04-09T03:58:00Z  PATHOGEN DEPLOYMENT\n  lab3-ws-01: SPX-4471 (ransomware) dropped via admin-svc remote command\n  Initial encryption begins on Lab 3 workstations\n\n2026-04-09T04:12:00Z  NETWORK PROPAGATION\n  lab3-ws-01: SMB scan of 10.0.3.0/24 and 10.0.0.0/16\n  14 lab3 workstations infected within 4 minutes (SMB exploit)\n\n2026-04-09T04:19:00Z  CONTAINMENT FAILURE\n  corridor-relay-01: Pathogen reaches corridor network segment\n  Maintenance window had disabled VLAN isolation at 04:00Z\n  Root cause: scheduled maintenance window was not coordinated\n\n2026-04-09T04:21:00Z  SECONDARY SPREAD\n  lab2-ws-03: Infected via corridor-relay-01 (SMB)\n\n2026-04-09T04:22:00Z  TERTIARY SPREAD\n  lab4-ws-09: Infected via corridor-relay-01 (SMB)\n\n2026-04-09T04:23:00Z  DETECTION\n  IDS-01 and motion sensors trigger BREACH-2026-0409 alert\n  IR team notified\n\n2026-04-09T04:31:00Z  IR ACTIVATED\n  ir-lead begins response (this session)\n\nCurrent: Containment in progress.`;
        },

        // eradicate -- remove the pathogen from all isolated systems
        'eradicate': function(args, term, engine) {
            if (Object.keys(engine._state.isolatedSystems).length < 18) {
                return `Error: Cannot eradicate before all systems are isolated.\nIsolated: ${Object.keys(engine._state.isolatedSystems).length}/18\nIsolate remaining systems first.`;
            }

            if (Object.keys(engine._state.imagedSystems).length < 18) {
                return `Error: EVIDENCE PRESERVATION REQUIRED before eradication.\nImaged: ${Object.keys(engine._state.imagedSystems).length}/18\n\nEradication destroys forensic evidence. Image all systems first.\nUse: image <system-id>`;
            }

            if (Object.keys(engine._state.custodyFiled).length < 18) {
                return `Error: Chain of custody not complete for all imaged systems.\nCustody filed: ${Object.keys(engine._state.custodyFiled).length}/18\nFile custody with: chain-of-custody <system-id>`;
            }

            if (engine._state.eradicated) {
                return 'Eradication already complete.';
            }

            engine._state.eradicated = true;

            return `ERADICATION IN PROGRESS -- BREACH-2026-0409\n${'='.repeat(60)}\n\nAll forensic images verified. Chain of custody complete.\nProceeding with eradication...\n\nWiping 18 infected systems from golden image:\n  lab3-ws-01 through lab3-ws-14... [WIPED AND REIMAGED]\n  lab3-srv-01...                   [WIPED AND REIMAGED]\n  corridor-relay-01...             [WIPED AND REIMAGED]\n  lab2-ws-03...                    [WIPED AND REIMAGED]\n  lab4-ws-09...                    [WIPED AND REIMAGED]\n\nGolden image: hexworth-ws-2026-03-15.img (last known good)\nHash verification: All 18 reimages match golden image SHA-256\n\nPathogen SPX-4471:\n  All instances: REMOVED\n  C2 channel: SEVERED (null route applied to 91.108.4.123)\n  Encryption keys: Not recoverable (attacker controlled)\n  Affected files: To be restored from backup in recovery phase\n\nERADICATION COMPLETE\n  All 18 systems wiped and rebuilt from golden image.\n  SPX-4471 is no longer present on any facility system.\n  Network isolation remains active pending validation.\n\nNext step: recover -- restore operational data from clean backup.`;
        },

        // recover -- restore operations from clean backups
        'recover': function(args, term, engine) {
            if (!engine._state.eradicated) {
                return 'Error: Cannot recover before eradication is complete.\nRun: eradicate';
            }

            if (engine._state.recovered) {
                return 'Recovery already complete.';
            }

            engine._state.recovered = true;

            return `RECOVERY IN PROGRESS -- BREACH-2026-0409\n${'='.repeat(60)}\n\nRestoring data from last clean backup (2026-04-09T00:00:00Z):\n\n  lab3-srv-01 data share:     [RESTORED from backup -- 847 GB]\n  lab3-ws user profiles:      [RESTORED -- 14 workstations]\n  lab2-ws-03 user data:       [RESTORED]\n  lab4-ws-09 user data:       [RESTORED]\n\nBackup integrity check:\n  Backup hash matches pre-breach reference: VERIFIED\n  Backup age: 4 hours 23 minutes (within 8-hour RTO target)\n  Recovery Point Objective (RPO): 4.4 hours of data at risk\n\nFiles not recoverable (encrypted before backup cutoff):\n  lab3-ws-01: 312 files modified between 03:58Z and 04:00Z backup\n  These represent approximately 0.2% of Lab 3 working data.\n  Request submitted to Director for manual reconstruction review.\n\nPost-recovery validation:\n  System integrity checks: PASSED (18/18 systems)\n  Network connectivity: RESTORED (VLAN isolation removed post-validation)\n  Pathogen indicators: NONE DETECTED (IDS/AV clean scan)\n  C2 blocking: ACTIVE (91.108.4.123 on permanent blocklist)\n\nOPERATIONS STATUS: RESTORED\n  Labs 1, 2, 4, 5, 6: FULLY OPERATIONAL\n  Lab 3: OPERATIONAL (rebuilt from golden image + backup)\n\nNext step: root-cause -- document what happened and why.`;
        },

        // root-cause -- determine and document root cause
        'root-cause': function(args, term, engine) {
            if (!engine._state.recovered) {
                return 'Error: Complete recovery before filing root cause analysis.\nRun: recover';
            }

            if (engine._state.rootCauseAnalyzed) {
                return 'Root cause analysis already filed.';
            }

            engine._state.rootCauseAnalyzed = true;

            let output = `ROOT CAUSE ANALYSIS -- BREACH-2026-0409\n${'='.repeat(60)}\n\nINCIDENT SUMMARY:\n  Pathogen: SPX-4471 (Advanced Persistent Ransomware)\n  Duration: 04:23Z to 04:31Z (8-minute active IR window)\n  Impact:   18 systems infected, ~0.2% of Lab 3 data unrecoverable\n  Systems:  Fully restored from backup + golden image\n\nROOT CAUSE:\n  PRIMARY: Scheduled maintenance window left VLAN isolation inactive.\n    At 04:00Z, the network operations team disabled VLAN boundaries\n    between Lab 3 and corridor segments for a scheduled switch upgrade.\n    The maintenance window was not communicated to the security team.\n    The isolation should have been restored at 04:15Z but the window\n    was extended by 15 minutes -- the exact window the pathogen exploited.\n\n  CONTRIBUTING FACTOR 1: Uncontained initial access.\n    The analyst-07 credential compromise (detected via ALT-023 at 23:14Z)\n    was not acted on quickly enough. Those credentials were the origin\n    of the lateral movement chain that ultimately deployed SPX-4471.\n\n  CONTRIBUTING FACTOR 2: No maintenance-aware security controls.\n    The facility had no procedure for security-team notification before\n    network isolation changes. Maintenance windows should require\n    security sign-off when they affect containment infrastructure.\n\nATTACK CHAIN (reconstructed):\n  1. Credential compromise (analyst-07) via phishing (prior to detection window)\n  2. Data exfiltration from specimen-db-01 (04-08 23:14Z)\n  3. C2 implant on lab2-ws-04 (04-08 18:00Z -- earlier than exfil)\n  4. Credential theft (admin-svc) from lab2-ws-04 LSASS (04-09 02:31Z)\n  5. Lateral movement to lab1-ws-02 and other systems (02:33Z)\n  6. Ransomware deployed to Lab 3 via admin-svc (03:58Z)\n  7. SMB propagation within Lab 3 (04:12Z)\n  8. Breach to corridor network via maintenance window (04:19Z)\n  9. Secondary spread to lab2-ws-03 and lab4-ws-09 (04:21-22Z)\n\nRECOMMENDATIONS:\n  [R-001] Implement change management process requiring security\n          sign-off for any modification to containment network boundaries.\n  [R-002] Automate SIEM-to-IR escalation for CRITICAL alerts within 15 minutes.\n          The ALT-023 alert (04-08 23:14Z) should have triggered immediate\n          credential suspension. 5-hour delay allowed the attack to escalate.\n  [R-003] Deploy privileged access workstations for admin-svc usage.\n          Credential theft from LSASS should not be possible on analyst workstations.\n  [R-004] Add MFA to admin-svc service account for interactive logon.\n  [R-005] Implement network deception (honeypots) in lab segments to detect\n          lateral movement faster.\n\nFINAL DETERMINATION:\n  This was a preventable breach. The root cause is process failure\n  (no security coordination for maintenance windows), not a zero-day\n  or undetectable attack. The attack chain had visible signals at each\n  step that were not acted on quickly enough.\n`;

            if (!engine._flag3Awarded) {
                engine._flag3Awarded = true;
                engine.awardFlag('flag3');
                output += '\n[ROOT CAUSE MILESTONE] Incident response complete with documented root cause analysis. Flag unlocked.';
            }

            return output;
        },

        // help -- command reference
        'help': function(args, term, engine) {
            return 'INCIDENT RESPONSE TERMINAL -- COMMAND REFERENCE\n\n  status                 Assess current breach scope\n  isolate <system>       Network-isolate an infected system\n  image <system>         Forensic disk image (BEFORE eradication)\n  chain-of-custody <sys> Document evidence handling\n  timeline               View incident timeline\n  eradicate              Remove pathogen (requires all evidence preserved)\n  recover                Restore operations from clean backup\n  root-cause             Root cause analysis and lessons learned\n  cat <file>             Read a file\n  ls <path>              List directory\n\nAffected systems:\n  lab3-ws-01 through lab3-ws-14, lab3-srv-01\n  corridor-relay-01, lab2-ws-03, lab4-ws-09\n\nSee ~/notes.txt and ~/irp-2026-001.txt for playbook details.';
        }
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-l11-containment-breach_flag1_breach_contained}',
            label: 'Breach Contained',
            description: 'Isolated all 18 affected systems, stopping active pathogen propagation.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-l11-containment-breach_flag2_evidence_preserved}',
            label: 'Evidence Preserved',
            description: 'Forensic disk images captured and chain of custody documented for all affected systems.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{pis-l11-containment-breach_flag3_root_cause_identifie}',
            label: 'Root Cause Identified',
            description: 'Completed full IR lifecycle with documented root cause analysis and remediation recommendations.',
            points: 250,
            autoCheck: true
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base: 1000,
        maxScore: 750,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2700
    },

    // =========================================================
    // HINTS
    // =========================================================

    hints: [
        {
            id: 'hint1',
            text: 'Follow the NIST IR lifecycle in order. Start with "status" to see all 18 affected systems, then isolate each one with "isolate <system-id>". After all 18 are isolated, the flag unlocks. Use "timeline" to understand the attack chain.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'CRITICAL: You must image all 18 systems and file chain-of-custody for each BEFORE you can run eradicate. The system enforces this order -- evidence preservation must happen before destruction of the evidence (eradication). Image first, then file chain-of-custody for each imaged system.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'After all 18 systems are isolated, imaged, and chain-of-custody filed, run eradicate, then recover, then root-cause. Each command checks that the previous phase is complete. Follow the NIST lifecycle in sequence: contain -> preserve -> eradicate -> recover -> lessons learned.',
            cost: 50,
            penalty: -50
        }
    ],

    // =========================================================
    // CERT OBJECTIVES
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'flag1', objective: '4.3', description: 'Explain the processes associated with third-party risk assessment and management', skill: 'Incident response containment: network isolation, scope assessment, and stopping active threat propagation' },
            { flagId: 'flag2', objective: '4.4', description: 'Summarize elements of effective security governance', skill: 'Digital forensics: forensic imaging procedures, chain of custody documentation, and evidence integrity verification' },
            { flagId: 'flag3', objective: '4.3', description: 'Explain the processes associated with third-party risk assessment and management', skill: 'Full IR lifecycle: eradication, recovery, and root cause analysis with corrective controls recommendation' }
        ]
    }

};
