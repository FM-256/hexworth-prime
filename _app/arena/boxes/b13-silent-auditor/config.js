/* ============================================================
   CTF ARENA — Box B13: The Silent Auditor
   Security Audit Troubleshooting — Logging & Compliance | Citadel
   Config: auditd, compliance, logging, flags, hints, lore
   ============================================================ */

const B13Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Silent Auditor',
    subtitle: 'Security Audit Troubleshooting — Logging & Compliance',
    difficulty: 'Advanced',
    accent: '#10b981',
    storageKey: 'hexworth_ctf_b13',
    registryId: 'b13-silent-auditor',
    trackerKey: 'ctf_b13',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Audit Assessment',
            icon: '\uD83D\uDD0D',
            description: 'Connect to AUDIT-NODE-01 and assess the state of auditd and logging compliance.',
            requiredFlags: [],
            mitre: ['T1082', 'T1057'],
            unlocks: ['rule-inspection'],
            locked: false
        },
        {
            id: 'rule-inspection',
            name: 'Rule Inspection',
            icon: '\uD83D\uDCCB',
            description: 'Inspect auditd configuration, rules, and identify gaps in security event coverage.',
            requiredFlags: [],
            mitre: ['T1562.006', 'T1070.002'],
            unlocks: ['root-cause'],
            locked: true
        },
        {
            id: 'root-cause',
            name: 'Root Cause Analysis',
            icon: '\u26A0\uFE0F',
            description: 'Identify the specific misconfiguration preventing critical events from being logged.',
            requiredFlags: ['user'],
            mitre: ['T1562.001', 'T1070'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Remediation & Verification',
            icon: '\u2705',
            description: 'Fix the audit rules, restart auditd, and verify compliance logging is restored.',
            requiredFlags: ['root'],
            mitre: ['T1562.001'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE (Sprint AR-12)
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Check auditd service status',
                tip: 'Run: sudo systemctl status auditd and sudo auditctl -s to check if auditd is running.',
                trigger: { event: 'command', match: { cmd: 'contains:auditctl' } }
            },
            {
                title: 'List current audit rules',
                tip: 'Run: sudo auditctl -l to see what rules are active. Look for gaps in coverage.',
                trigger: { event: 'command', match: { cmd: 'contains:auditctl -l' } }
            },
            {
                title: 'Identify the missing rules and deny conflict',
                tip: 'Check /etc/audit/rules.d/audit.rules for a "never" rule that blocks chmod monitoring and missing sudo/shadow rules.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Simulate a security event',
                tip: 'After fixing the rules and restarting auditd, simulate a failed sudo attempt and check audit.log.',
                trigger: { event: 'command', match: { cmd: 'contains:ausearch' } }
            },
            {
                title: 'Verify compliance logging',
                tip: 'Run /opt/compliance/verify_audit.sh to confirm all critical events are now logged and retrieve the root flag.',
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
            { flagId: 'user', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources -- Audit logging', skill: 'Auditd Rule Analysis' },
            { flagId: 'user', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security -- Linux auditing', skill: 'Compliance Gap Detection' },
            { flagId: 'root', objective: '2.5', description: 'Given a scenario, analyze vulnerabilities in security architecture -- Audit policy conflicts', skill: 'Audit Remediation' },
            { flagId: 'root', objective: '5.1', description: 'Summarize elements of effective security governance -- Compliance verification', skill: 'Compliance Verification' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Citadel Bastion Host BIOS v3.4.0',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
            'SELinux: enforcing mode',
            'Audit subsystem initialized',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'RHEL 8.8 (Citadel Bastion)',
            'RHEL 8.8 (Recovery Mode)',
            'Hardware Diagnostics'
        ],
        loginUser: 'compliance_officer'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'compliance_officer',
        hostname: 'audit-node-01',
        startDir: '/home/compliance_officer',
        welcome: 'RHEL 8.8 — AUDIT-NODE-01 (Citadel Bastion Host)\nIronclad Compliance Engine Status: DEGRADED\nWARNING: Critical security events missing from audit logs\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AUDIT DATA
    // ═══════════════════════════════════════════════════════

    _auditData: {
        auditdStatus: {
            running: true,
            enabled: true,
            rules_loaded: 3,
            rules_expected: 7,
            log_file: '/var/log/audit/audit.log',
            log_size: '12.4M',
            backlog_limit: 8192,
            lost: 0,
            failure_mode: 1
        },
        currentRules: [
            '-a always,exit -F arch=b64 -S open -F dir=/etc -F success=0 -k etc_access',
            '-a never,exit -F arch=b64 -S chmod -F success=0 -k deny_chmod',
            '-w /var/log/audit/ -p wa -k audit_log_access'
        ],
        missingRules: [
            '-w /etc/shadow -p wa -k shadow_access',
            '-w /etc/passwd -p wa -k passwd_access',
            '-a always,exit -F arch=b64 -S execve -F euid=0 -F auid>=1000 -k sudo_commands',
            '-a always,exit -F arch=b64 -S chmod -F success=0 -k perm_changes'
        ],
        conflictingRule: {
            rule: '-a never,exit -F arch=b64 -S chmod -F success=0 -k deny_chmod',
            problem: 'This "never" rule for chmod syscall is evaluated before any "always" rules, preventing all chmod audit events from being logged.'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Check the auditd status with "sudo auditctl -s" and list rules with "sudo auditctl -l". Only 3 of the expected 7 rules are loaded. Critical monitoring rules are missing.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Inspect /etc/audit/rules.d/audit.rules. Notice the "never" rule for chmod syscall on line 2. This blocks all permission change monitoring. Also missing: rules for /etc/shadow, /etc/passwd, and sudo command monitoring.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The user flag is the conflicting "never" rule: "-a never,exit -F arch=b64 -S chmod" combined with missing rules for shadow/passwd/sudo. The deny_chmod rule must be removed and replaced with an "always" rule.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Remove the "never" chmod rule, add the 4 missing rules (shadow, passwd, sudo, chmod), restart auditd, then run /opt/compliance/verify_audit.sh. The verification script will generate and check a test event containing the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Ironclad Compliance Engine demands meticulous auditing of all system activities on AUDIT-NODE-01, a critical bastion host within the Citadel\'s secure zone. But critical security events -- failed sudo attempts, unauthorized file permission changes, shadow file access -- are no longer appearing in the audit logs. Gaping holes in the compliance record expose the Citadel to severe penalties.',
        scenario: 'A systems administrator, frustrated by excessive audit log noise from permission change events, added a blanket "never" rule for the chmod syscall six months ago. This silently blocked all permission change monitoring. Worse, during a recent auditd configuration cleanup, rules for /etc/shadow and /etc/passwd monitoring were accidentally deleted, and the sudo command audit rule was never added to the new rules file. The bastion host now has only 3 of the 7 required compliance rules active.',
        outro: 'AUDIT-NODE-01\'s compliance posture is restored. All seven required audit rules are active and verified. The Ironclad Compliance Engine confirms full coverage: sudo commands, shadow file access, password file modifications, and permission changes are all being logged. The Citadel\'s audit trail is intact once more.',
        ecer: {
            executive: 'No change approval process for modifying audit rules on compliance-critical systems',
            culture: 'Treating audit noise as a nuisance rather than investigating root cause of excessive logging',
            employee: 'Admin used a blanket deny rule instead of properly tuning the specific verbose rule',
            regulatory: 'No automated compliance validation to detect drift from the required audit baseline'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Compliance Dashboard
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost:8080/compliance/',

        pages: {
            '/compliance/': {
                title: 'Ironclad Compliance Engine',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#10b981; font-size:1.6rem; font-family:monospace; margin-bottom:4px;">Ironclad Compliance Engine</h1>
                        <div style="color:#888; font-size:0.8rem;">AUDIT-NODE-01 &mdash; Compliance Status Dashboard</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px;">
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#e74c3c; font-size:1.8rem; font-weight:bold;">3/7</div>
                                <div style="color:#888; font-size:0.75rem;">Audit Rules Active</div>
                            </div>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#e74c3c; font-size:1.8rem; font-weight:bold;">FAIL</div>
                                <div style="color:#888; font-size:0.75rem;">Compliance Status</div>
                            </div>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#f59e0b; font-size:1.8rem; font-weight:bold;">4</div>
                                <div style="color:#888; font-size:0.75rem;">Missing Rules</div>
                            </div>
                        </div>

                        <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:16px; margin-bottom:16px;">
                            <div style="color:#10b981; font-weight:bold; font-size:0.9rem; margin-bottom:10px;">Required Audit Rules</div>
                            <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                                <thead>
                                    <tr style="border-bottom:1px solid #333;">
                                        <th style="padding:6px; text-align:left; color:#10b981;">Rule</th>
                                        <th style="padding:6px; text-align:left; color:#10b981;">Target</th>
                                        <th style="padding:6px; text-align:left; color:#10b981;">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td style="padding:5px 6px; color:#ccc;">etc_access</td><td style="color:#888;">/etc directory access</td><td style="color:#2ecc71;">ACTIVE</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">audit_log_access</td><td style="color:#888;">/var/log/audit/ monitoring</td><td style="color:#2ecc71;">ACTIVE</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">deny_chmod</td><td style="color:#888;">chmod syscall (DENY)</td><td style="color:#e74c3c;">CONFLICT</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">shadow_access</td><td style="color:#888;">/etc/shadow monitoring</td><td style="color:#e74c3c;">MISSING</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">passwd_access</td><td style="color:#888;">/etc/passwd monitoring</td><td style="color:#e74c3c;">MISSING</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">sudo_commands</td><td style="color:#888;">Privileged command execution</td><td style="color:#e74c3c;">MISSING</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">perm_changes</td><td style="color:#888;">Permission change monitoring</td><td style="color:#e74c3c;">MISSING</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="background:#2d1b1b; border:1px solid #e74c3c33; border-radius:6px; padding:12px; margin-top:16px; color:#e74c3c; font-size:0.8rem;">
                            COMPLIANCE FAILURE: 4 required audit rules missing. 1 conflicting deny rule detected. Audit trail incomplete. Remediate immediately.
                        </div>
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (bastion host)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'compliance_officer': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: AUDIT-NODE-01 (RHEL 8.8 Bastion Host)\nObjective: Restore audit logging compliance\n\nKnown issues:\n- Ironclad Compliance Engine reports 3/7 rules active\n- Critical security events missing from audit logs\n- Failed sudo attempts not being recorded\n- /etc/shadow and /etc/passwd changes unmonitored\n\nSteps:\n1. Check auditd status and current rules\n2. Inspect /etc/audit/rules.d/audit.rules\n3. Identify missing and conflicting rules\n4. Fix rules and restart auditd\n5. Verify compliance with /opt/compliance/verify_audit.sh\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo systemctl status auditd\nsudo auditctl -s\nsudo auditctl -l\ncat /etc/audit/rules.d/audit.rules\nsudo ausearch -m USER_AUTH\ntail -f /var/log/audit/audit.log'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'audit': {
                            type: 'dir',
                            children: {
                                'auditd.conf': {
                                    type: 'file',
                                    content: '# auditd configuration\nlog_file = /var/log/audit/audit.log\nlog_group = root\nlog_format = RAW\nflush = INCREMENTAL_ASYNC\nfreq = 50\nmax_log_file = 8\nnum_logs = 5\nmax_log_file_action = ROTATE\nspace_left = 75\nspace_left_action = SYSLOG\nadmin_space_left = 50\nadmin_space_left_action = SUSPEND\ndisk_full_action = SUSPEND\ndisk_error_action = SUSPEND'
                                },
                                'rules.d': {
                                    type: 'dir',
                                    children: {
                                        'audit.rules': {
                                            type: 'file',
                                            content: '# AUDIT-NODE-01 Audit Rules\n# Last modified: 2025-09-22 by sys_admin_jones\n# NOTE: Reduced rules to cut log volume\n\n# Monitor /etc directory access failures\n-a always,exit -F arch=b64 -S open -F dir=/etc -F success=0 -k etc_access\n\n# DENY all chmod audit events (added to reduce noise)\n-a never,exit -F arch=b64 -S chmod -F success=0 -k deny_chmod\n\n# Monitor audit log directory\n-w /var/log/audit/ -p wa -k audit_log_access\n\n# === REMOVED RULES (cleanup 2025-09-22) ===\n# -w /etc/shadow -p wa -k shadow_access         # REMOVED: "too noisy"\n# -w /etc/passwd -p wa -k passwd_access          # REMOVED: "too noisy"\n# -a always,exit -F arch=b64 -S execve -F euid=0 -F auid>=1000 -k sudo_commands  # REMOVED: "never added"\n# -a always,exit -F arch=b64 -S chmod -F success=0 -k perm_changes  # BLOCKED by deny_chmod above'
                                        }
                                    }
                                }
                            }
                        },
                        'hostname': { type: 'file', content: 'audit-node-01' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ncompliance_officer:x:1000:1000:Compliance Officer:/home/compliance_officer:/bin/bash\nauditd:x:1001:1001:Audit Daemon:/var/log/audit:/usr/sbin/nologin'
                        },
                        'shadow': {
                            type: 'file',
                            content: '[Permission denied -- requires root]'
                        },
                        'selinux': {
                            type: 'dir',
                            children: {
                                'config': {
                                    type: 'file',
                                    content: 'SELINUX=enforcing\nSELINUXTYPE=targeted'
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
                                'audit': {
                                    type: 'dir',
                                    children: {
                                        'audit.log': {
                                            type: 'file',
                                            content: 'type=DAEMON_START msg=audit(1710806400.000:1): op=start ver=3.0.7 format=raw auid=4294967295 pid=890 uid=0 ses=4294967295 res=success\ntype=CONFIG_CHANGE msg=audit(1710806400.100:2): auid=4294967295 op=set rules loaded 3\ntype=SYSCALL msg=audit(1710806401.200:3): arch=c000003e syscall=2 success=no exit=-13 a0=7f... key="etc_access"\ntype=SYSCALL msg=audit(1710806402.300:4): arch=c000003e syscall=2 success=no exit=-13 a0=7f... key="etc_access"\ntype=SYSCALL msg=audit(1710806403.400:5): arch=c000003e syscall=257 success=yes a0=7f... key="audit_log_access"\n\n# NOTE: No entries for shadow_access, passwd_access, sudo_commands, or perm_changes\n# These rules are either missing or blocked by the deny_chmod rule\n\n{{FLAG:user}}'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 19 02:00:00 audit-node-01 systemd[1]: Started Security Auditing Service.\nMar 19 02:00:00 audit-node-01 auditd[890]: loaded 3 rules (expected 7 per compliance baseline)\nMar 19 02:00:01 audit-node-01 auditd[890]: WARNING: deny_chmod rule may block legitimate monitoring\nMar 19 02:00:05 audit-node-01 compliance-check[1234]: FAIL -- 4 required rules missing\nMar 19 02:00:05 audit-node-01 compliance-check[1234]: FAIL -- deny rule conflicts with perm_changes monitoring'
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'compliance': {
                            type: 'dir',
                            children: {
                                'verify_audit.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Ironclad Compliance Engine — Audit Verification Script\n# Checks all 7 required audit rules and generates test events\n\necho "=== Ironclad Compliance Engine — Audit Verification ==="\necho ""\n\n# Check rule count\nRULE_COUNT=$(sudo auditctl -l | wc -l)\n\nif [ "$RULE_COUNT" -ge 7 ]; then\n  echo "[PASS] Audit rules: $RULE_COUNT loaded (minimum 7 required)"\n  echo "[PASS] shadow_access rule active"\n  echo "[PASS] passwd_access rule active"\n  echo "[PASS] sudo_commands rule active"\n  echo "[PASS] perm_changes rule active (deny_chmod removed)"\n  echo "[PASS] etc_access rule active"\n  echo "[PASS] audit_log_access rule active"\n  echo ""\n  echo "Generating compliance test event..."\n  echo "type=USER_AUTH msg=audit(compliance_test): acct=compliance_officer res=success"\n  echo ""\n  echo "{{FLAG:root}}"\n  echo ""\n  echo "COMPLIANCE STATUS: PASS -- All 7 rules verified."\nelse\n  echo "[FAIL] Audit rules: $RULE_COUNT loaded (minimum 7 required)"\n  echo "[FAIL] Fix missing rules in /etc/audit/rules.d/audit.rules"\n  echo "[FAIL] Remove conflicting deny_chmod rule"\n  echo "[FAIL] Restart auditd after changes"\n  echo ""\n  echo "COMPLIANCE STATUS: FAIL"\nfi'
                                },
                                'baseline.txt': {
                                    type: 'file',
                                    content: '=== Ironclad Compliance Baseline ===\nRequired audit rules for AUDIT-NODE-01:\n\n1. etc_access     — Monitor /etc directory access failures\n2. shadow_access  — Monitor /etc/shadow read/write\n3. passwd_access  — Monitor /etc/passwd read/write\n4. sudo_commands  — Monitor privileged command execution (euid=0)\n5. perm_changes   — Monitor chmod syscall failures\n6. audit_log_access — Monitor /var/log/audit/ modifications\n7. (no deny rules that conflict with above)\n\nMinimum rules required: 7\nCurrent rules loaded: 3\nCompliance status: FAIL'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
                            type: 'dir',
                            children: {
                                'doc': {
                                    type: 'dir',
                                    children: {
                                        'audit-rules-reference.txt': {
                                            type: 'file',
                                            content: '=== Auditd Rules Quick Reference ===\n\nWatch rules (-w):\n  -w /path/to/file -p rwxa -k keyname\n  Permissions: r=read, w=write, x=execute, a=attribute change\n\nSyscall rules (-a):\n  -a always,exit -F arch=b64 -S syscall_name -F field=value -k keyname\n  -a never,exit  — blocks logging for matching events (USE WITH CAUTION)\n\nCommon fields:\n  -F euid=0       — effective UID is root\n  -F auid>=1000   — audit UID is a real user (not system)\n  -F success=0    — syscall failed\n  -F dir=/path    — directory watch\n\nIMPORTANT: "never" rules are evaluated FIRST. A "never" rule will\nblock any subsequent "always" rule for the same syscall.\n\nManagement:\n  auditctl -l        List current rules\n  auditctl -s        Show auditd status\n  auditctl -D        Delete all rules\n  auditctl -R file   Load rules from file\n  ausearch -k key    Search by key\n  aureport           Generate audit report'
                                        }
                                    }
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
        'auditctl': function(args) {
            if (args.length === 0) return 'Usage: auditctl [-l|-s|-D|-R file|-a rule|-w path]';

            if (args.includes('-l')) {
                return `-a always,exit -F arch=b64 -S open -F dir=/etc -F success=0 -k etc_access
-a never,exit -F arch=b64 -S chmod -F success=0 -k deny_chmod
-w /var/log/audit/ -p wa -k audit_log_access

3 rules loaded (expected 7 per compliance baseline)`;
            }

            if (args.includes('-s')) {
                return `enabled 1
failure 1
pid 890
rate_limit 0
backlog_limit 8192
lost 0
backlog 0
backlog_wait_time 15000
loginuid_immutable 0 unlocked

Status: RUNNING
Rules loaded: 3 (expected: 7)`;
            }

            if (args.includes('-D')) {
                return 'No rules';
            }

            if (args.includes('-R')) {
                return 'Rules loaded from file. Use auditctl -l to verify.';
            }

            return 'auditctl: rule modification simulated. Restart auditd to apply.';
        },

        'ausearch': function(args) {
            if (args.length === 0) return 'Usage: ausearch [-k key] [-m type] [-sv success|no]';

            if (args.includes('USER_AUTH') || args.includes('sudo')) {
                return `<no matches>

NOTE: No sudo/USER_AUTH events found in audit log.
The sudo_commands audit rule is missing from the current configuration.
Add: -a always,exit -F arch=b64 -S execve -F euid=0 -F auid>=1000 -k sudo_commands`;
            }

            if (args.includes('shadow') || args.includes('passwd')) {
                return `<no matches>

NOTE: No shadow/passwd access events found.
The shadow_access and passwd_access rules are missing.
Add: -w /etc/shadow -p wa -k shadow_access
Add: -w /etc/passwd -p wa -k passwd_access`;
            }

            if (args.includes('chmod') || args.includes('perm_changes')) {
                return `<no matches>

NOTE: chmod events blocked by "never" rule.
The deny_chmod rule prevents all chmod audit events from being logged.
Remove: -a never,exit -F arch=b64 -S chmod -F success=0 -k deny_chmod
Add:    -a always,exit -F arch=b64 -S chmod -F success=0 -k perm_changes`;
            }

            if (args.includes('etc_access')) {
                return `----
time->Wed Mar 19 02:14:01 2026
type=SYSCALL msg=audit(1710806401.200:3): arch=c000003e syscall=2 success=no exit=-13 key="etc_access"
----
time->Wed Mar 19 02:14:02 2026
type=SYSCALL msg=audit(1710806402.300:4): arch=c000003e syscall=2 success=no exit=-13 key="etc_access"`;
            }

            return '<no matches>';
        },

        'aureport': function(args) {
            return `Summary Report
======================
Range of time in logs: 03/19/2026 02:00:00 - 03/19/2026 08:14:00
Selected time for report: 03/19/2026 02:00:00 - 03/19/2026 08:14:00
Number of changes in configuration: 1
Number of changes to accounts, groups, or roles: 0
Number of logins: 2
Number of failed logins: 0
Number of authentications: 2
Number of failed authentications: 0
Number of anomaly events: 0
Number of responses to anomaly events: 0
Number of key events:
  etc_access: 14
  audit_log_access: 6
  shadow_access: 0 (rule missing)
  passwd_access: 0 (rule missing)
  sudo_commands: 0 (rule missing)
  perm_changes: 0 (blocked by deny rule)`;
        },

        'systemctl': function(args) {
            const action = args[0] || '';
            const service = args[1] || '';

            if (action === 'status' && service === 'auditd') {
                return `auditd.service - Security Auditing Service
     Loaded: loaded (/usr/lib/systemd/system/auditd.service; enabled)
     Active: active (running) since Wed 2026-03-19 02:00:00 UTC; 6h ago
   Main PID: 890 (auditd)
      Tasks: 4 (limit: 16384)
     Memory: 12.4M

Mar 19 02:00:00 audit-node-01 auditd[890]: loaded 3 rules
Mar 19 02:00:00 audit-node-01 auditd[890]: WARNING: only 3/7 required rules active`;
            }

            if (action === 'restart' && service === 'auditd') {
                return `Restarting auditd.service - Security Auditing Service...
Stopped Security Auditing Service.
Started Security Auditing Service.

[auditd] Reloading rules from /etc/audit/rules.d/...
[auditd] Rules loaded successfully.
[auditd] Use "auditctl -l" to verify rules.`;
            }

            return `Unit ${service || 'unknown'}.service could not be found.`;
        },

        'sestatus': function() {
            return `SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   enforcing
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)`;
        },

        'journalctl': function(args) {
            if (args.join(' ').includes('auditd')) {
                return `-- Journal for auditd.service --
Mar 19 02:00:00 audit-node-01 auditd[890]: started with 3 rules loaded
Mar 19 02:00:00 audit-node-01 auditd[890]: WARNING: deny_chmod rule may block monitoring
Mar 19 02:00:00 audit-node-01 auditd[890]: Expected 7 rules per compliance baseline
Mar 19 02:00:01 audit-node-01 auditd[890]: etc_access events: 14
Mar 19 02:00:01 audit-node-01 auditd[890]: audit_log_access events: 6
Mar 19 02:00:01 audit-node-01 auditd[890]: shadow_access events: 0 (NO RULE)
Mar 19 02:00:01 audit-node-01 auditd[890]: perm_changes events: 0 (BLOCKED)`;
            }
            return `-- Journal begins at Wed 2026-03-19 02:00:00 UTC --
Mar 19 02:00:00 audit-node-01 systemd[1]: Started Security Auditing Service.
Mar 19 02:00:00 audit-node-01 auditd[890]: 3 rules loaded (expected 7)
Mar 19 02:00:05 audit-node-01 compliance-check: FAIL -- 4 missing rules`;
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).

PORT     STATE SERVICE
22/tcp   open  ssh
8080/tcp open  http (Compliance Dashboard)

Nmap done: 1 IP address (1 host up) scanned in 1.02 seconds`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === 'localhost' || target === '127.0.0.1') {
                return `PING ${target} 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.1 ms
3 packets transmitted, 3 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'find': function(args) {
            const path = args[0] || '/';
            if (args.join(' ').includes('suid') || args.join(' ').includes('perm')) {
                return `/usr/bin/sudo
/usr/bin/passwd
/usr/bin/chage
/usr/bin/mount
/usr/bin/umount
/usr/sbin/unix_chkpwd`;
            }
            if (path.includes('/etc/audit')) {
                return `/etc/audit
/etc/audit/auditd.conf
/etc/audit/rules.d
/etc/audit/rules.d/audit.rules`;
            }
            return 'find: search completed.';
        },

        'curl': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (url.includes('localhost:8080') || url.includes('compliance')) {
                return `{"compliance_status":"FAIL","rules_loaded":3,"rules_required":7,"missing":["shadow_access","passwd_access","sudo_commands","perm_changes"],"conflicts":["deny_chmod"]}`;
            }
            return `curl: (7) Failed to connect: Connection refused`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#10b981; border-bottom:2px solid #333; background:#1a1a2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #222; color:#ccc;">${cell}</td>`;
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
