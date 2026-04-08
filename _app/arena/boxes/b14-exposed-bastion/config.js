/* ============================================================
   CTF ARENA — Box B14: The Exposed Bastion
   OS Security Hardening Troubleshooting | Citadel Gateway
   Config: misconfigurations, hardening, flags, hints, lore
   ============================================================ */

const B14Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Exposed Bastion',
    subtitle: 'OS Security Hardening Troubleshooting',
    difficulty: 'Advanced',
    accent: '#ef4444',
    storageKey: 'hexworth_ctf_b14',
    registryId: 'b14-exposed-bastion',
    trackerKey: 'ctf_b14',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Security Assessment',
            icon: '\uD83D\uDD0D',
            description: 'Connect to GATEWAY-SEC-01 and perform an initial security assessment. Identify misconfigurations.',
            requiredFlags: [],
            mitre: ['T1082', 'T1046'],
            unlocks: ['enumeration'],
            locked: false
        },
        {
            id: 'enumeration',
            name: 'Vulnerability Enumeration',
            icon: '\uD83D\uDCCB',
            description: 'Systematically enumerate weak passwords, open ports, file permissions, and outdated services.',
            requiredFlags: [],
            mitre: ['T1087', 'T1083', 'T1049'],
            unlocks: ['hardening'],
            locked: true
        },
        {
            id: 'hardening',
            name: 'Security Hardening',
            icon: '\uD83D\uDD12',
            description: 'Implement corrective hardening measures for each identified misconfiguration.',
            requiredFlags: ['user'],
            mitre: ['T1562.001', 'T1548.001'],
            unlocks: ['verification'],
            locked: true
        },
        {
            id: 'verification',
            name: 'Baseline Verification',
            icon: '\u2705',
            description: 'Run the security baseline verification script to confirm all misconfigurations are resolved.',
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
                title: 'Scan for open ports and services',
                tip: 'Run: ss -tulnp or nmap localhost to identify unnecessary services.',
                trigger: { event: 'command', match: { cmd: 'contains:ss' } }
            },
            {
                title: 'Check user accounts and passwords',
                tip: 'Inspect /etc/passwd for suspicious accounts. Try "su - dev_ops" with weak passwords.',
                trigger: { event: 'command', match: { cmd: 'contains:passwd' } }
            },
            {
                title: 'Identify critical misconfigurations',
                tip: 'Check file permissions on /etc/shadow (world-readable?), sshd config, and iptables rules.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Apply hardening measures',
                tip: 'Fix permissions, disable telnet, configure iptables, fix sshd_config.',
                trigger: { event: 'command', match: { cmd: 'contains:chmod' } }
            },
            {
                title: 'Verify security baseline',
                tip: 'Run /opt/security/verify_baseline.sh to confirm all misconfigurations are resolved.',
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
            { flagId: 'user', objective: '2.3', description: 'Summarize vulnerabilities associated with operating systems -- Misconfigurations', skill: 'OS Vulnerability Assessment' },
            { flagId: 'user', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources -- Hardening', skill: 'Security Misconfiguration Detection' },
            { flagId: 'root', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security -- OS hardening', skill: 'System Hardening Implementation' },
            { flagId: 'root', objective: '3.2', description: 'Given a scenario, apply security principles to secure enterprise infrastructure -- Bastion hosts', skill: 'Security Baseline Verification' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Citadel Gateway BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: 2x 1GbE detected (eth0, eth1)',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'CentOS 7.9 (Citadel Gateway)',
            'CentOS 7.9 (Recovery Mode)',
            'Memory Diagnostics'
        ],
        loginUser: 'security_auditor'
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
        user: 'security_auditor',
        hostname: 'gateway-sec-01',
        startDir: '/home/security_auditor',
        welcome: 'CentOS 7.9 — GATEWAY-SEC-01 (Citadel Outer Defense Gateway)\nWARNING: Last vulnerability scan flagged 6 critical misconfigurations\nALERT: System does NOT meet security baseline requirements\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED SYSTEM DATA
    // ═══════════════════════════════════════════════════════

    _systemData: {
        misconfigurations: [
            { id: 1, severity: 'CRITICAL', finding: 'dev_ops account has weak password (password123)', category: 'Authentication' },
            { id: 2, severity: 'CRITICAL', finding: 'Telnet service running on port 23', category: 'Unnecessary Services' },
            { id: 3, severity: 'CRITICAL', finding: '/etc/shadow is world-readable (644)', category: 'File Permissions' },
            { id: 4, severity: 'HIGH', finding: 'SSH root login enabled (PermitRootLogin yes)', category: 'SSH Configuration' },
            { id: 5, severity: 'HIGH', finding: 'iptables default policy is ACCEPT (no firewall)', category: 'Network Security' },
            { id: 6, severity: 'MEDIUM', finding: 'temp_user test account never removed', category: 'Account Hygiene' }
        ],
        users: [
            { name: 'root', uid: 0, shell: '/bin/bash' },
            { name: 'security_auditor', uid: 1000, shell: '/bin/bash' },
            { name: 'dev_ops', uid: 1001, shell: '/bin/bash', password: 'password123' },
            { name: 'temp_user', uid: 1002, shell: '/bin/bash', password: 'temp2024' },
            { name: 'sshd', uid: 74, shell: '/sbin/nologin' },
            { name: 'telnetd', uid: 75, shell: '/sbin/nologin' }
        ]
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
            text: 'Start with reconnaissance: run "ss -tulnp" to find open ports and "cat /etc/passwd" to enumerate user accounts. Look for telnet on port 23 and suspicious user accounts.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Check file permissions on sensitive files: "ls -la /etc/shadow" -- it should be 640, not 644. Try "su - dev_ops" with password "password123" to confirm the weak password.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The user flag is the top 3 critical misconfigurations: "1.WeakPass:dev_ops 2.Telnet:port23 3.Shadow:world-readable". Check /etc/ssh/sshd_config for PermitRootLogin and iptables -L for firewall rules.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Fix all 6 misconfigurations: change dev_ops password, disable telnet, chmod 640 /etc/shadow, set PermitRootLogin no, configure iptables default DROP, remove temp_user. Then run /opt/security/verify_baseline.sh for the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'GATEWAY-SEC-01, the critical bastion host controlling access to the Citadel\'s outer defenses, was once considered impenetrable. Recent vulnerability scans reveal a disturbing number of critical misconfigurations: default passwords, unnecessary open ports, weak file permissions, and outdated configurations. Years of neglect have transformed this fortress into an Exposed Bastion.',
        scenario: 'GATEWAY-SEC-01 was originally configured by a security-conscious engineer three years ago. Since then, multiple administrators have made ad-hoc changes: a developer created the dev_ops account with a weak password "for temporary testing," telnet was enabled "just for a quick debug session" and never disabled, a junior admin accidentally changed /etc/shadow permissions while troubleshooting a login issue, and a test account temp_user was created for a vendor demo and forgotten. The firewall rules were flushed during a network migration and never re-applied.',
        outro: 'GATEWAY-SEC-01 is hardened and secure once more. All six misconfigurations have been remediated: weak passwords changed, telnet disabled, file permissions corrected, SSH hardened, firewall configured, and stale accounts removed. The Citadel\'s outer defenses hold firm.',
        ecer: {
            executive: 'No periodic security baseline validation scheduled for critical infrastructure',
            culture: '"Temporary" changes never reverted -- no tracking of configuration debt',
            employee: 'Multiple admins making undocumented changes without change management',
            regulatory: 'No configuration management database (CMDB) or baseline drift detection'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Security Dashboard
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost:8443/security/',

        pages: {
            '/security/': {
                title: 'Gateway Security Dashboard',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#ef4444; font-size:1.6rem; font-family:monospace; margin-bottom:4px;">GATEWAY-SEC-01 Security Dashboard</h1>
                        <div style="color:#888; font-size:0.8rem;">Citadel Outer Defense Gateway &mdash; Hardening Status</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px;">
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#e74c3c; font-size:1.8rem; font-weight:bold;">3</div>
                                <div style="color:#888; font-size:0.75rem;">Critical Findings</div>
                            </div>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#f59e0b; font-size:1.8rem; font-weight:bold;">2</div>
                                <div style="color:#888; font-size:0.75rem;">High Findings</div>
                            </div>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#3b82f6; font-size:1.8rem; font-weight:bold;">1</div>
                                <div style="color:#888; font-size:0.75rem;">Medium Findings</div>
                            </div>
                        </div>

                        <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:16px;">
                            <div style="color:#ef4444; font-weight:bold; font-size:0.9rem; margin-bottom:10px;">Vulnerability Scan Results</div>
                            <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                                <thead>
                                    <tr style="border-bottom:1px solid #333;">
                                        <th style="padding:6px; text-align:left; color:#ef4444;">Severity</th>
                                        <th style="padding:6px; text-align:left; color:#ef4444;">Finding</th>
                                        <th style="padding:6px; text-align:left; color:#ef4444;">Category</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td style="padding:5px 6px; color:#e74c3c; font-weight:bold;">CRITICAL</td><td style="color:#ccc;">Weak password on dev_ops account</td><td style="color:#888;">Authentication</td></tr>
                                    <tr><td style="padding:5px 6px; color:#e74c3c; font-weight:bold;">CRITICAL</td><td style="color:#ccc;">Telnet service active on port 23</td><td style="color:#888;">Services</td></tr>
                                    <tr><td style="padding:5px 6px; color:#e74c3c; font-weight:bold;">CRITICAL</td><td style="color:#ccc;">/etc/shadow world-readable (644)</td><td style="color:#888;">Permissions</td></tr>
                                    <tr><td style="padding:5px 6px; color:#f59e0b; font-weight:bold;">HIGH</td><td style="color:#ccc;">SSH PermitRootLogin enabled</td><td style="color:#888;">SSH Config</td></tr>
                                    <tr><td style="padding:5px 6px; color:#f59e0b; font-weight:bold;">HIGH</td><td style="color:#ccc;">iptables default ACCEPT (no firewall)</td><td style="color:#888;">Network</td></tr>
                                    <tr><td style="padding:5px 6px; color:#3b82f6; font-weight:bold;">MEDIUM</td><td style="color:#ccc;">Stale test account: temp_user</td><td style="color:#888;">Accounts</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="background:#2d1b1b; border:1px solid #e74c3c33; border-radius:6px; padding:12px; margin-top:16px; color:#e74c3c; font-size:0.8rem;">
                            BASELINE FAILURE: 6 misconfigurations detected. System does NOT meet Citadel security requirements. Remediate immediately.
                        </div>
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (gateway bastion host)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'security_auditor': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: GATEWAY-SEC-01 (CentOS 7.9 Bastion Host)\nObjective: Identify and remediate all security misconfigurations\n\nVuln scan flagged 6 issues:\n- 3 CRITICAL, 2 HIGH, 1 MEDIUM\n- Weak passwords, open ports, bad permissions\n\nSteps:\n1. Enumerate user accounts and test for weak passwords\n2. Scan for open ports and unnecessary services\n3. Check file permissions on sensitive files\n4. Review SSH and firewall configuration\n5. Apply hardening measures\n6. Run /opt/security/verify_baseline.sh\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ss -tulnp\ncat /etc/passwd\nls -la /etc/shadow\nsudo iptables -L\ncat /etc/ssh/sshd_config | grep PermitRoot\nlynis audit system'
                                }
                            }
                        },
                        'dev_ops': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo yum install telnet-server\nsudo systemctl enable telnet.socket\nsudo systemctl start telnet.socket\n# TODO: disable telnet after debug session\n# password: password123 (change this later!)'
                                },
                                'deploy_script.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Quick deployment script\n# NOTE: This account was supposed to be temporary\necho "Deploying application..."\nrsync -avz /home/dev_ops/app/ /var/www/html/\necho "Done."'
                                }
                            }
                        },
                        'temp_user': {
                            type: 'dir',
                            children: {
                                'README.txt': {
                                    type: 'file',
                                    content: 'This account was created for the vendor demo on 2024-11-15.\nContact: vendor@external-corp.com\nPassword: temp2024 (was supposed to be deleted after demo)\n\n*** THIS ACCOUNT SHOULD HAVE BEEN REMOVED ***'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nsecurity_auditor:x:1000:1000:Security Auditor:/home/security_auditor:/bin/bash\ndev_ops:x:1001:1001:DevOps Engineer:/home/dev_ops:/bin/bash\ntemp_user:x:1002:1002:Temp Vendor Account:/home/temp_user:/bin/bash\nsshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin\ntelnetd:x:75:75:Telnet Daemon:/:/sbin/nologin\napache:x:48:48:Apache:/usr/share/httpd:/sbin/nologin'
                        },
                        'shadow': {
                            type: 'file',
                            content: 'root:$6$rounds=5000$salt$hash...:19436:0:99999:7:::\nsecurity_auditor:$6$rounds=5000$salt$hash...:19436:0:99999:7:::\ndev_ops:$6$rounds=5000$W34kP4$$password123hash...:19300:0:99999:7:::\ntemp_user:$6$rounds=5000$t3mp$$temp2024hash...:19312:0:99999:7:::\n\nWARNING: This file is world-readable (mode 644).\nExpected permissions: 640 (owner: root, group: shadow)\n\n{{FLAG:user}}'
                        },
                        'ssh': {
                            type: 'dir',
                            children: {
                                'sshd_config': {
                                    type: 'file',
                                    content: '# sshd_config for GATEWAY-SEC-01\n# WARNING: Multiple insecure settings\n\nPort 22\nListenAddress 0.0.0.0\nProtocol 2\n\n# Authentication\nPermitRootLogin yes          # <-- INSECURE: Should be "no"\nPasswordAuthentication yes    # <-- Should require key-based auth\nPermitEmptyPasswords no\nMaxAuthTries 6\n\n# Logging\nSyslogFacility AUTH\nLogLevel INFO\n\n# Other\nX11Forwarding no\nAllowTcpForwarding no\nClientAliveInterval 300\nClientAliveCountMax 2\nBanner /etc/ssh/banner\n\n# NOTE: No AllowUsers/AllowGroups restriction configured'
                                },
                                'banner': {
                                    type: 'file',
                                    content: '***********************************************\n*  GATEWAY-SEC-01 - Citadel Outer Defense      *\n*  Authorized Access Only                       *\n*  All sessions are monitored and recorded      *\n***********************************************'
                                }
                            }
                        },
                        'hostname': { type: 'file', content: 'gateway-sec-01' }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'security': {
                            type: 'dir',
                            children: {
                                'verify_baseline.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Citadel Security Baseline Verification Script\n# Checks all 6 identified misconfigurations\n\necho "=== Citadel Security Baseline Verification ==="\necho ""\nPASS=0\nFAIL=0\n\n# Check 1: dev_ops password\necho "[CHECK 1] dev_ops account password strength..."\necho "  Simulating password test... password123 is WEAK"\necho "  Result: Password changed or account locked = PASS"\nPASS=$((PASS+1))\n\n# Check 2: Telnet service\necho "[CHECK 2] Telnet service (port 23)..."\necho "  Result: Service disabled = PASS"\nPASS=$((PASS+1))\n\n# Check 3: /etc/shadow permissions\necho "[CHECK 3] /etc/shadow file permissions..."\necho "  Expected: 640 | Current: checking..."\nPASS=$((PASS+1))\n\n# Check 4: SSH root login\necho "[CHECK 4] SSH PermitRootLogin..."\necho "  Expected: no | Current: checking..."\nPASS=$((PASS+1))\n\n# Check 5: iptables\necho "[CHECK 5] iptables default policy..."\necho "  Expected: DROP | Current: checking..."\nPASS=$((PASS+1))\n\n# Check 6: temp_user account\necho "[CHECK 6] Stale account: temp_user..."\necho "  Expected: removed | Current: checking..."\nPASS=$((PASS+1))\n\necho ""\nif [ $PASS -eq 6 ]; then\n  echo "BASELINE STATUS: PASS (6/6 checks passed)"\n  echo ""\n  echo "{{FLAG:root}}"\n  echo ""\n  echo "GATEWAY-SEC-01 meets the Citadel security baseline."\nelse\n  echo "BASELINE STATUS: FAIL ($PASS/6 checks passed)"\n  echo "Resolve remaining issues and re-run this script."\nfi'
                                },
                                'scan-results.txt': {
                                    type: 'file',
                                    content: '=== Citadel Vulnerability Scan Results ===\nScan Date: 2026-03-18\nTarget: GATEWAY-SEC-01 (10.10.50.1)\n\n[CRITICAL] CVE-NONE: dev_ops account — password "password123" cracked in <1 second\n[CRITICAL] CVE-NONE: Telnet service (port 23) — cleartext protocol, no encryption\n[CRITICAL] CVE-NONE: /etc/shadow — mode 0644 (world-readable), should be 0640\n[HIGH]     CVE-NONE: SSH PermitRootLogin=yes — direct root access enabled\n[HIGH]     CVE-NONE: iptables — default ACCEPT policy, no ingress filtering\n[MEDIUM]   CVE-NONE: temp_user — stale vendor account, created 2024-11-15\n\nTotal: 3 Critical, 2 High, 1 Medium\nBaseline Status: FAIL'
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
                                'secure': {
                                    type: 'file',
                                    content: 'Mar 19 01:14:00 gateway-sec-01 sshd[4567]: Accepted password for dev_ops from 10.10.99.88 port 54321\nMar 19 01:14:05 gateway-sec-01 sshd[4568]: Accepted password for root from 10.10.99.88 port 54322\nMar 19 01:15:00 gateway-sec-01 sshd[4569]: Failed password for temp_user from 10.10.99.45 port 54323\nMar 19 01:15:01 gateway-sec-01 sshd[4570]: Failed password for temp_user from 10.10.99.45 port 54324\nMar 19 01:15:02 gateway-sec-01 sshd[4571]: Failed password for temp_user from 10.10.99.45 port 54325\nMar 19 02:00:00 gateway-sec-01 in.telnetd[4600]: connect from 10.10.99.88\nMar 19 02:00:01 gateway-sec-01 login[4601]: LOGIN ON ttyS0 BY dev_ops (via telnet -- CLEARTEXT)'
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 19 02:00:00 gateway-sec-01 systemd[1]: Started Telnet Server.\nMar 19 02:00:00 gateway-sec-01 systemd[1]: Started OpenSSH Server.\nMar 19 02:00:00 gateway-sec-01 kernel: iptables: default policy ACCEPT (WARNING: no filtering)\nMar 19 02:00:05 gateway-sec-01 vuln-scanner[5000]: CRITICAL: 3 critical findings on GATEWAY-SEC-01\nMar 19 02:00:05 gateway-sec-01 vuln-scanner[5000]: HIGH: 2 high findings on GATEWAY-SEC-01\nMar 19 02:00:05 gateway-sec-01 vuln-scanner[5000]: Baseline status: FAIL'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'vendor-demo-notes.txt': {
                            type: 'file',
                            content: 'Vendor Demo 2024-11-15\n\nCreated temp_user account for vendor access.\nPassword: temp2024\nPlease delete after demo.\n\n-- IT Support Team\n\n(Nobody ever deleted this account.)'
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'sbin': {
                            type: 'dir',
                            children: {
                                'in.telnetd': { type: 'file', content: '[telnet daemon binary]' }
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
        'ss': function(args) {
            return `Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port  Process
tcp    LISTEN  0       128     0.0.0.0:22           0.0.0.0:*          sshd
tcp    LISTEN  0       128     0.0.0.0:23           0.0.0.0:*          in.telnetd
tcp    LISTEN  0       128     0.0.0.0:80           0.0.0.0:*          httpd
tcp    LISTEN  0       128     0.0.0.0:8443         0.0.0.0:*          security-dash

4 listening TCP connections
WARNING: Telnet (port 23) is an insecure cleartext protocol.`;
        },

        'netstat': function(args) {
            return B14Config.commands.ss(args);
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).

PORT     STATE SERVICE
22/tcp   open  ssh (OpenSSH 7.4)
23/tcp   open  telnet
80/tcp   open  http (Apache 2.4.6)
8443/tcp open  https-alt (Security Dashboard)

WARNING: Telnet on port 23 should be disabled on a bastion host.

Nmap done: 1 IP address (1 host up) scanned in 1.15 seconds`;
        },

        'iptables': function(args) {
            if (args.includes('-L') || args.includes('--list')) {
                return `Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination

WARNING: All chains have default ACCEPT policy with NO rules.
This means ALL traffic is allowed -- no firewall protection.`;
            }
            return 'iptables: use -L to list current rules.';
        },

        'ufw': function(args) {
            if (args.includes('status')) {
                return `Status: inactive

NOTE: ufw is not active. Using iptables directly.
iptables default policy is ACCEPT (no protection).`;
            }
            return 'ufw: command not recognized. Try "ufw status".';
        },

        'su': function(args) {
            const user = args.find(a => !a.startsWith('-')) || '';
            if (user === 'dev_ops') {
                return `Password: ********
[su: authenticated as dev_ops with password "password123"]

SECURITY FINDING: dev_ops account has a weak password (password123).
This password was cracked in <1 second using dictionary attack.

dev_ops@gateway-sec-01:~$`;
            }
            if (user === 'temp_user') {
                return `Password: ********
[su: authenticated as temp_user with password "temp2024"]

SECURITY FINDING: temp_user is a stale vendor account from 2024-11-15.
This account should have been removed after the vendor demo.

temp_user@gateway-sec-01:~$`;
            }
            if (user === 'root') {
                return `Password:
su: Authentication failure
(Root login via su requires the root password)`;
            }
            return `su: user ${user} does not exist`;
        },

        'lynis': function(args) {
            if (args.includes('audit') && args.includes('system')) {
                return `[ Lynis 3.0.8 ]

  Hardening index : [ 34 / 100 ] <-- VERY LOW

  Warnings (6):
  ----------------------------
  ! dev_ops account has weak password [AUTH-9328]
  ! Telnet service enabled (port 23) [NETW-3004]
  ! /etc/shadow: permissions 0644 (world-readable) [FILE-7524]
  ! SSH: PermitRootLogin is yes [SSH-7408]
  ! iptables: default ACCEPT policy [FIRE-4512]
  ! Stale account: temp_user (inactive 120+ days) [AUTH-9282]

  Suggestions:
  ----------------------------
  * Change weak passwords [AUTH-9328]
  * Disable telnet and use SSH only [NETW-3004]
  * Set /etc/shadow permissions to 640 [FILE-7524]
  * Set PermitRootLogin to no [SSH-7408]
  * Configure iptables default DROP policy [FIRE-4512]
  * Remove stale accounts [AUTH-9282]`;
            }
            return 'Usage: lynis audit system';
        },

        'systemctl': function(args) {
            const action = args[0] || '';
            const service = args[1] || '';

            if (action === 'status') {
                if (service.includes('telnet')) {
                    return `telnet.socket - Telnet Server Activation Socket
     Loaded: loaded (/usr/lib/systemd/system/telnet.socket; enabled)
     Active: active (listening) since Wed 2026-03-19 02:00:00 UTC
     Listen: [::]:23

WARNING: Telnet is an insecure cleartext protocol.
This service should be DISABLED on a bastion host.`;
                }
                if (service.includes('sshd') || service.includes('ssh')) {
                    return `sshd.service - OpenSSH server daemon
     Loaded: loaded (/usr/lib/systemd/system/sshd.service; enabled)
     Active: active (running) since Wed 2026-03-19 02:00:00 UTC
   Main PID: 1234 (sshd)

WARNING: PermitRootLogin is set to "yes" in /etc/ssh/sshd_config`;
                }
                if (service.includes('iptables') || service.includes('firewall')) {
                    return `iptables.service - IPv4 firewall
     Loaded: loaded (/usr/lib/systemd/system/iptables.service; enabled)
     Active: active (exited)

WARNING: iptables loaded but all chains have default ACCEPT (no rules).`;
                }
                return `Unit ${service}.service could not be found.`;
            }

            if (action === 'stop' && service.includes('telnet')) {
                return `Stopping telnet.socket...
Stopped Telnet Server Activation Socket.`;
            }
            if (action === 'disable' && service.includes('telnet')) {
                return `Removed /etc/systemd/system/sockets.target.wants/telnet.socket.
Telnet has been disabled.`;
            }

            return `systemctl: unknown action '${action}'`;
        },

        'passwd': function(args) {
            const user = args[0] || '';
            if (user === 'dev_ops') {
                return `Changing password for user dev_ops.
New password: ********
Retype new password: ********
passwd: all authentication tokens updated successfully.
(dev_ops password has been changed to a strong password)`;
            }
            return `passwd: change password for ${user || 'current user'}`;
        },

        'userdel': function(args) {
            const user = args.find(a => !a.startsWith('-')) || '';
            if (user === 'temp_user') {
                return `userdel: user temp_user removed
userdel: home directory /home/temp_user removed`;
            }
            return `userdel: user '${user}' does not exist or cannot be removed`;
        },

        'chmod': function(args) {
            if (args.join(' ').includes('640') && args.join(' ').includes('shadow')) {
                return `/etc/shadow: permissions changed from 0644 to 0640
File is no longer world-readable.`;
            }
            return `chmod: permissions updated.`;
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
            if (args.join(' ').includes('perm') || args.join(' ').includes('suid')) {
                return `/usr/bin/sudo
/usr/bin/passwd
/usr/bin/chage
/usr/bin/su
/usr/bin/mount
/usr/bin/umount
/usr/sbin/unix_chkpwd
/usr/sbin/pam_timestamp_check`;
            }
            return 'find: search completed.';
        },

        'curl': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (url.includes('localhost:8443') || url.includes('security')) {
                return `{"baseline_status":"FAIL","findings":6,"critical":3,"high":2,"medium":1}`;
            }
            return `curl: (7) Failed to connect: Connection refused`;
        },

        'journalctl': function(args) {
            return `-- Journal begins at Wed 2026-03-19 02:00:00 UTC --
Mar 19 02:00:00 gateway-sec-01 systemd[1]: Started OpenSSH Server.
Mar 19 02:00:00 gateway-sec-01 systemd[1]: Started Telnet Server.
Mar 19 02:00:00 gateway-sec-01 kernel: iptables: default ACCEPT (no filtering)
Mar 19 02:00:05 gateway-sec-01 vuln-scanner: 6 misconfigurations detected
Mar 19 02:00:05 gateway-sec-01 vuln-scanner: Baseline status: FAIL`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#ef4444; border-bottom:2px solid #333; background:#1a1a2e;">${h}</th>`;
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
