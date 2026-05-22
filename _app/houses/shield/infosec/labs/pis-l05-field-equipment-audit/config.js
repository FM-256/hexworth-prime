/* ============================================================
   PIS-L05: Field Equipment Audit
   Principles of Information Security -- CTF Lab
   Device security audit: MDM, encryption, patches, open ports
   SY0-701: 3.1, 3.3
   ============================================================ */

const PISL05Config = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Field Equipment Audit',
    subtitle: 'Hexworth Containment -- Pre-Deployment Device Audit',
    description: 'Eight devices are staged for deployment to field teams. Audit each device for encryption status, MDM enrollment, OS patch level, and open ports. Three fail containment standards. Flag the failures and document specific remediation for each.',
    difficulty: 'Intermediate',
    estimatedTime: 35,
    accent: '#3b82f6',
    storageKey: 'hexworth_lab_pis_l05',
    registryId: 'pis-l05-field-equipment-audit',
    trackerKey: 'lab_pis_l05',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'Device Audit Terminal -- BSL-2 Clearance',
            'Device management connector: ONLINE',
            'MDM enrollment database: LOADED (8 devices)',
            'Patch compliance engine: READY',
            'Port scan results: CACHED (last scan: 04-09T08:00Z)'
        ],
        grubEntries: [
            'Containment Analyst OS 22.04 LTS',
            'Containment Analyst OS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'Eight devices are sitting in the pre-deployment bay. Each one is going to a field team that operates outside the facility perimeter -- meaning if a device is compromised in the field, there is no containment barrier between it and the facility network when it reconnects. Every device must meet containment standards before it leaves. Fail the wrong ones and they get through. Miss a failure and a compromised device goes to the field.',
        scenario: 'Containment Standard CS-12 requires all field devices to meet four criteria: (1) full-disk encryption enabled, (2) enrolled in MDM, (3) OS patches current within 30 days, (4) no unnecessary open ports. Three of the eight devices have one or more violations. Audit each one, fail the three non-compliant devices, and document the specific remediation required.',
        outro: 'Audit complete. Three non-compliant devices flagged and held. Five devices cleared for field deployment. Remediation orders filed. No unencrypted or unpatched device leaves the facility today.',

        goals: [
            "Apply Containment Standard CS-12: full-disk encryption, MDM enrollment, OS patches within 30 days, no unnecessary open ports",
            "Audit 8 devices against the four criteria and flag the 3 non-compliant",
            "Distinguish severity tiers -- a missing MDM enrollment is not the same as an open port: each has its own remediation path",
            "Document remediations specifically enough that a field engineer can act without re-auditing",
            "Practice the false-positive cost: failing the wrong device delays deployment; passing the wrong one ships a vulnerability"
        ],

        toolkit: [
            { name: "inventory", purpose: "List the 8 devices in the pre-deployment bay with summary status", sample: "inventory" },
            { name: "audit", purpose: "Run the full CS-12 audit against a specific device", sample: "audit DEV-03" },
            { name: "fail", purpose: "Mark a device as non-compliant", sample: "fail DEV-03" },
            { name: "remediate", purpose: "File the specific remediation action required for a failed device", sample: "remediate DEV-03 enable-fde" },
            { name: "submit", purpose: "Submit final audit decision once all 8 devices are reviewed", sample: "submit" },
            { name: "help", purpose: "Command reference", sample: "help" }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'analyst',
        hostname: 'audit-ws-01',
        startDir: '/home/analyst',
        welcome: 'Hexworth Containment -- Device Audit Terminal\nBSL-2 Clearance Active\n\n*** PRE-DEPLOYMENT AUDIT: 8 DEVICES STAGED ***\n*** 3 devices expected to fail -- identify and document ***\n*** Deployment window: 35 minutes ***\n\nType "inventory" to list devices.\nType "help" for command reference.\n'
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
                        'analyst': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: 'DEVICE AUDIT NOTES -- Pre-Deployment Batch 09\n===============================================\nContainment Standard CS-12 requirements:\n  1. Full-disk encryption: ENABLED (BitLocker/LUKS/FileVault)\n  2. MDM enrollment: ENROLLED\n  3. OS patches: current within 30 days (last patch >= 2026-03-10)\n  4. Open ports: only approved services (22 SSH, 443 HTTPS, 5985 WinRM-optional)\n     Any OTHER open ports = FAIL\n\nAudit Date: 2026-04-09\nPatch cutoff date: 2026-03-10 (30 days prior)\n\nCommands:\n  inventory              List all 8 devices\n  audit <device-id>      View device audit report\n  fail <id> <reason>     Mark device as non-compliant\n  remediate <id> <action> Document remediation\n  submit                 File audit results\n\nValid fail reasons:\n  no-encryption, no-mdm, unpatched, open-ports\n\nValid remediation actions:\n  enable-bitlocker, enable-luks, enroll-mdm, apply-patches, close-ports\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'inventory\naudit DEV-001\naudit DEV-002\n'
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

    // Track which devices analyst has failed and remediated
    _failed: {},       // { 'DEV-XXX': 'reason' }
    _remediated: {},   // { 'DEV-XXX': 'action' }

    // Ground truth: which 3 devices fail and why
    _failAnswers: {
        'DEV-003': 'no-encryption',
        'DEV-006': 'unpatched',
        'DEV-008': 'open-ports'
    },

    // Correct remediation for each failed device
    _remediationAnswers: {
        'DEV-003': 'enable-bitlocker',
        'DEV-006': 'apply-patches',
        'DEV-008': 'close-ports'
    },

    _flag1Awarded: false,
    _flag2Awarded: false,

    _validFailReasons: ['no-encryption', 'no-mdm', 'unpatched', 'open-ports'],
    _validRemediations: ['enable-bitlocker', 'enable-luks', 'enroll-mdm', 'apply-patches', 'close-ports'],

    // Device audit data -- all 8 devices
    _devices: {
        'DEV-001': {
            name: 'Lenovo ThinkPad T14 (Win11)',
            assignedTo: 'Field Team Alpha',
            encryption: 'BitLocker: ENABLED (AES-256)',
            mdm: 'Enrolled: Microsoft Intune (2026-01-15)',
            patches: 'Last patch: 2026-04-01 (Windows Update)',
            ports: 'Open: 22/tcp (SSH), 443/tcp (HTTPS)',
            verdict: 'PASS'
        },
        'DEV-002': {
            name: 'Dell Latitude 5540 (Win11)',
            assignedTo: 'Field Team Bravo',
            encryption: 'BitLocker: ENABLED (AES-256)',
            mdm: 'Enrolled: Microsoft Intune (2026-02-10)',
            patches: 'Last patch: 2026-03-28 (Windows Update)',
            ports: 'Open: 443/tcp (HTTPS)',
            verdict: 'PASS'
        },
        'DEV-003': {
            name: 'HP EliteBook 845 (Win11)',
            assignedTo: 'Field Team Charlie',
            encryption: 'BitLocker: NOT ENABLED',
            mdm: 'Enrolled: Microsoft Intune (2026-01-22)',
            patches: 'Last patch: 2026-04-02 (Windows Update)',
            ports: 'Open: 443/tcp (HTTPS)',
            verdict: 'FAIL'
        },
        'DEV-004': {
            name: 'Apple MacBook Air M3 (macOS 15)',
            assignedTo: 'Field Team Delta',
            encryption: 'FileVault: ENABLED (AES-256-XTS)',
            mdm: 'Enrolled: Jamf Pro (2026-03-01)',
            patches: 'Last patch: 2026-04-05 (macOS Software Update)',
            ports: 'Open: 443/tcp (HTTPS)',
            verdict: 'PASS'
        },
        'DEV-005': {
            name: 'Panasonic Toughbook CF-33 (Win11)',
            assignedTo: 'Field Team Echo',
            encryption: 'BitLocker: ENABLED (AES-256)',
            mdm: 'Enrolled: Microsoft Intune (2025-11-30)',
            patches: 'Last patch: 2026-03-15 (Windows Update)',
            ports: 'Open: 22/tcp (SSH), 443/tcp (HTTPS)',
            verdict: 'PASS'
        },
        'DEV-006': {
            name: 'Lenovo ThinkPad X1 Carbon (Win11)',
            assignedTo: 'Field Team Foxtrot',
            encryption: 'BitLocker: ENABLED (AES-256)',
            mdm: 'Enrolled: Microsoft Intune (2026-02-28)',
            patches: 'Last patch: 2026-01-14 (Windows Update)',
            ports: 'Open: 443/tcp (HTTPS)',
            verdict: 'FAIL'
        },
        'DEV-007': {
            name: 'Dell XPS 15 (Ubuntu 24.04)',
            assignedTo: 'Field Team Golf',
            encryption: 'LUKS: ENABLED (AES-256)',
            mdm: 'Enrolled: Hexworth MDM Agent 2.1 (2026-03-10)',
            patches: 'Last patch: 2026-04-07 (apt-get upgrade)',
            ports: 'Open: 22/tcp (SSH), 443/tcp (HTTPS)',
            verdict: 'PASS'
        },
        'DEV-008': {
            name: 'HP ProBook 455 (Win11)',
            assignedTo: 'Field Team Hotel',
            encryption: 'BitLocker: ENABLED (AES-256)',
            mdm: 'Enrolled: Microsoft Intune (2026-01-09)',
            patches: 'Last patch: 2026-03-20 (Windows Update)',
            ports: 'Open: 22/tcp (SSH), 443/tcp (HTTPS), 3389/tcp (RDP), 23/tcp (Telnet), 5900/tcp (VNC)',
            verdict: 'FAIL'
        }
    },

    // =========================================================
    // TERMINAL COMMANDS
    // =========================================================

    commands: {

        // inventory -- list all 8 devices with pass/fail status
        'inventory': function(args, term, engine) {
            const devices = engine.config._devices;
            const failed = engine.config._failed;

            let lines = [
                'PRE-DEPLOYMENT DEVICE INVENTORY -- Batch 09',
                '='.repeat(55),
                'ID        DEVICE                          STATUS',
                '-'.repeat(55)
            ];

            for (const [id, dev] of Object.entries(devices)) {
                const flagStatus = failed[id] ? `FLAGGED:${failed[id]}` : 'PENDING AUDIT';
                const name = dev.name.substring(0, 32).padEnd(32);
                lines.push(`  ${id}  ${name} ${flagStatus}`);
            }

            lines.push('');
            lines.push(`Flagged: ${Object.keys(failed).length}/3 expected failures`);
            lines.push('Use: audit <id> to view device details');

            return lines.join('\n');
        },

        // audit <device-id> -- view device audit report
        'audit': function(args, term, engine) {
            const id = (args[0] || '').toUpperCase();
            if (!id) return 'Usage: audit <device-id>\nExample: audit DEV-001';

            const dev = engine.config._devices[id];
            if (!dev) {
                return `Error: Device ${id} not found.\nValid IDs: DEV-001 through DEV-008`;
            }

            const flagStatus = engine.config._failed[id]
                ? `\n[FLAGGED: ${engine.config._failed[id].toUpperCase()}]`
                : '';

            return `DEVICE AUDIT REPORT -- ${id}\n${'='.repeat(45)}\nDevice:      ${dev.name}\nAssigned To: ${dev.assignedTo}\n\nENCRYPTION   ${dev.encryption}\nMDM          ${dev.mdm}\nPATCHES      ${dev.patches}\nOPEN PORTS   ${dev.ports}\n\nCS-12 Check:\n  Encryption:  ${dev.encryption.includes('ENABLED') ? 'PASS' : 'FAIL -- disk encryption required'}\n  MDM:         ${dev.mdm.includes('Enrolled') ? 'PASS' : 'FAIL -- MDM enrollment required'}\n  Patch (30d): ${((function(p) { var m = p.match(/(\d{4}-\d{2}-\d{2})/); if (!m) return 'UNKNOWN'; return new Date(m[1]) >= new Date('2026-03-10') ? 'PASS' : 'FAIL -- last patch more than 30 days old'; })(dev.patches))}\n  Ports:       ${((function(p) { var bad = ['3389','23','5900','21','80','8080']; for (var i=0;i<bad.length;i++) { if (p.includes(bad[i])) return 'FAIL -- unauthorized port: '+bad[i]+'/tcp'; } return 'PASS'; })(dev.ports))}\n${flagStatus}`;
        },

        // Helper used by audit -- not a user command
        _checkPatch: function(patchLine) {
            const match = patchLine.match(/(\d{4}-\d{2}-\d{2})/);
            if (!match) return 'UNKNOWN';
            const patchDate = new Date(match[1]);
            const cutoff = new Date('2026-03-10');
            return patchDate >= cutoff ? 'PASS' : 'FAIL -- last patch is more than 30 days old (cutoff: 2026-03-10)';
        },

        _checkPorts: function(portsLine) {
            const badPorts = ['3389', '23', '5900', '21', '80', '8080'];
            for (const port of badPorts) {
                if (portsLine.includes(port)) {
                    return `FAIL -- unauthorized port detected: ${port}/tcp`;
                }
            }
            return 'PASS';
        },

        // fail <device-id> <reason> -- mark a device as non-compliant
        'fail': function(args, term, engine) {
            const id = (args[0] || '').toUpperCase();
            const reason = (args[1] || '').toLowerCase();

            if (!id || !reason) {
                return 'Usage: fail <device-id> <reason>\nReasons: no-encryption, no-mdm, unpatched, open-ports\nExample: fail DEV-003 no-encryption';
            }

            if (!engine.config._devices[id]) {
                return `Error: Device ${id} not found. Valid IDs: DEV-001 through DEV-008`;
            }

            if (!engine.config._validFailReasons.includes(reason)) {
                return `Error: "${reason}" is not a valid failure reason.\nValid reasons: no-encryption, no-mdm, unpatched, open-ports`;
            }

            const correct = engine.config._failAnswers[id];

            // Check: is this device supposed to fail at all?
            if (!correct) {
                return `AUDIT DISPUTE: ${id}\nThis device does not have a CS-12 violation.\nEncryption, MDM, patches, and ports all pass containment standard.\nRun: audit ${id} to review the device data.`;
            }

            // Check: is the reason correct?
            if (reason !== correct) {
                return `AUDIT DISPUTE: ${id}\nDevice ${id} does have a CS-12 violation, but the reason "${reason}" is incorrect.\nRun: audit ${id} and review each criterion carefully.`;
            }

            engine.config._failed[id] = reason;
            return `Device ${id} FLAGGED: ${reason.toUpperCase()}\nDevice held from deployment pending remediation.\nRemaining flags needed: ${3 - Object.keys(engine.config._failed).length}`;
        },

        // remediate <device-id> <action> -- document remediation steps
        'remediate': function(args, term, engine) {
            const id = (args[0] || '').toUpperCase();
            const action = (args[1] || '').toLowerCase();

            if (!id || !action) {
                return 'Usage: remediate <device-id> <action>\nActions: enable-bitlocker, enable-luks, enroll-mdm, apply-patches, close-ports\nExample: remediate DEV-003 enable-bitlocker';
            }

            if (!engine.config._devices[id]) {
                return `Error: Device ${id} not found.`;
            }

            if (!engine.config._failed[id]) {
                return `Error: ${id} has not been flagged yet.\nRun: fail ${id} <reason> first.`;
            }

            if (!engine.config._validRemediations.includes(action)) {
                return `Error: "${action}" is not a valid remediation action.\nValid actions: enable-bitlocker, enable-luks, enroll-mdm, apply-patches, close-ports`;
            }

            const correctAction = engine.config._remediationAnswers[id];
            if (action !== correctAction) {
                return `Remediation mismatch: ${id}\nAction "${action}" does not address the reported violation.\nFailure reason: ${engine.config._failed[id]}\nChoose the remediation that directly fixes that violation.`;
            }

            engine.config._remediated[id] = action;

            const remCount = Object.keys(engine.config._remediated).length;
            return `Remediation filed: ${id} -- ${action.toUpperCase()}\nRemediations filed: ${remCount}/3`;
        },

        // submit -- check if all 3 failures identified and remediated
        'submit': function(args, term, engine) {
            const failCount = Object.keys(engine.config._failed).length;
            const remCount = Object.keys(engine.config._remediated).length;

            if (failCount < 3) {
                return `Audit incomplete: ${failCount}/3 non-compliant devices identified.\nRun: audit on all devices, then flag violations with: fail <id> <reason>`;
            }

            // Flag 1: All 3 non-compliant devices correctly flagged
            if (!engine.config._flag1Awarded) {
                engine.config._flag1Awarded = true;
                engine.awardFlag('flag1');
            }

            if (remCount < 3) {
                return `Flag 1 earned: all 3 non-compliant devices identified.\n\nAudit blocked: remediations not yet filed for all failures.\nFiled: ${remCount}/3\nRun: remediate <id> <action> for each flagged device.`;
            }

            // Flag 2: All 3 remediations correctly filed
            if (!engine.config._flag2Awarded) {
                engine.config._flag2Awarded = true;
                engine.awardFlag('flag2');
            }

            return 'AUDIT COMPLETE -- Pre-Deployment Batch 09\n' + '='.repeat(45) + '\nDevices cleared (5): DEV-001, DEV-002, DEV-004, DEV-005, DEV-007\nDevices held (3):\n\n  DEV-003 -- BitLocker not enabled\n    Remediation: Enable BitLocker AES-256 before redeployment\n\n  DEV-006 -- OS patches 85 days out of date (last: 2026-01-14)\n    Remediation: Apply all pending Windows Updates, verify patch date >= 2026-03-10\n\n  DEV-008 -- Unauthorized open ports: 3389/RDP, 23/Telnet, 5900/VNC\n    Remediation: Disable RDP, disable Telnet service, close VNC port\n    Note: Telnet (port 23) transmits in cleartext -- critical violation\n\nAudit report filed. Deployment cleared for 5 devices.';
        },

        // help -- command reference
        'help': function(args, term, engine) {
            return 'DEVICE AUDIT TERMINAL -- COMMAND REFERENCE\n\n  inventory             List all 8 devices\n  audit <id>            View device audit report\n  fail <id> <reason>    Mark device as non-compliant\n  remediate <id> <act>  Document remediation step\n  submit                File final audit report\n  cat <file>            Read a file\n\nDevice IDs: DEV-001 through DEV-008\nFail reasons: no-encryption, no-mdm, unpatched, open-ports\nRemediation: enable-bitlocker, enable-luks, enroll-mdm, apply-patches, close-ports';
        }
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-l05-field-equipment-audit_flag1_all_3_non-compliant_}',
            label: 'All 3 Non-Compliant Devices Identified',
            description: 'Correctly flagged all 3 devices that fail CS-12 containment standards.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-l05-field-equipment-audit_flag2_remediations_documen}',
            label: 'Remediations Documented',
            description: 'Filed correct remediation actions for each of the 3 non-compliant devices.',
            points: 250,
            autoCheck: true
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2100
    },

    // =========================================================
    // HINTS
    // =========================================================

    hints: [
        {
            id: 'hint1',
            text: 'Run: audit on all 8 devices and look at each of the 4 CS-12 criteria. The audit command already tells you PASS or FAIL for each criterion -- just read it carefully. One device is missing disk encryption entirely.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'For patches: the cutoff date is 2026-03-10 (30 days before audit date). If the last patch date is before that cutoff, it fails. Compare the date in the patches field to 2026-03-10.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'For ports: the approved services are SSH (22), HTTPS (443), and optionally WinRM (5985). Any other port is a violation. Pay special attention to Telnet (23) -- it transmits credentials in cleartext and is always a critical failure.',
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
            { flagId: 'flag1', objective: '3.1', description: 'Compare and contrast security implications of different architecture models', skill: 'Auditing mobile/field device security: encryption, MDM enrollment, patch compliance, port exposure' },
            { flagId: 'flag2', objective: '3.3', description: 'Compare and contrast concepts and strategies to protect data', skill: 'Applying device security remediations: BitLocker, MDM enrollment, patching, port closure' }
        ]
    }

};
