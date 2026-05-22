/* ============================================================
   CTF ARENA — Box A14: The Ghost in the Machine
   Red Team Evasion, Persistence & Anti-Forensics | Vanguard Network
   Config: EDR-aware terminal, persistence vectors, privesc via
   backup.sh sourcing, LD_PRELOAD persistence, anti-forensics tracking
   ============================================================ */

const A14Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Ghost in the Machine',
    subtitle: 'Red Team Evasion — Vanguard Network',

    // Tutorial mode (AR-12)
    tutorialMode: true,
    tutorial: {
            "steps": [
                    {
                            "title": "Reconnaissance",
                            "tip": "Start by scanning the target with nmap to discover services and potential attack vectors.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "cmd": "contains:nmap"
                                    }
                            }
                    },
                    {
                            "title": "Explore the target",
                            "tip": "Investigate the services you found. Browse web apps, check service versions, read documentation.",
                            "trigger": {
                                    "event": "navigate",
                                    "alt": [
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "phase": "RECON"
                                                    }
                                            }
                                    ]
                            }
                    },
                    {
                            "title": "Find the vulnerability",
                            "tip": "Look for misconfigurations, weak inputs, or known CVEs in the services you discovered.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "phase": "EXPLOIT"
                                    }
                            }
                    },
                    {
                            "title": "Capture the user flag",
                            "tip": "Exploit the vulnerability to gain initial access and retrieve the user flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "user"
                                    }
                            }
                    },
                    {
                            "title": "Escalate to root",
                            "tip": "Use what you found to escalate privileges and capture the root flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "root"
                                    }
                            }
                    }
            ]
    },
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_a14',
    registryId: 'a14-ghost-machine',
    trackerKey: 'ctf_a14',

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'CS0-003',
        additionalCerts: ['SY0-701'],
        mappings: [
            // CS0-003 mappings
            { flagId: 'user', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources', skill: 'LD_PRELOAD Persistence Mechanism', cert: 'CS0-003' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources', skill: 'Red Team Evasion & Operational Security', cert: 'CS0-003' },
            // SY0-701 mappings — threat actor TTPs and defense evasion techniques
            { flagId: 'user', objective: '2.2', description: 'Summarize common threat vectors and attack surfaces', skill: 'LD_PRELOAD shared library injection as a post-exploitation persistence vector', cert: 'SY0-701', mitre: 'T1574.006' },
            { flagId: 'user', objective: '2.4', description: 'Analyze indicators of malicious activity', skill: 'Anti-forensics via HISTFILE manipulation and timestamp modification (T1070.003)', cert: 'SY0-701', mitre: 'T1070.003' },
            { flagId: 'root', objective: '2.2', description: 'Summarize common threat vectors and attack surfaces', skill: 'Privilege escalation through sudo NOPASSWD misconfiguration sourcing attacker-controlled config (T1548.003)', cert: 'SY0-701', mitre: 'T1548.003' },
            { flagId: 'root', objective: '2.3', description: 'Explain various types of vulnerabilities', skill: 'Defense evasion via EDR-aware technique selection — avoiding monitored paths (T1562.001)', cert: 'SY0-701', mitre: 'T1562.001' },
            { flagId: 'root', objective: '4.3', description: 'Explain the importance of data protection', skill: 'Data exfiltration via scripted backup utility exploitation (T1041)', cert: 'SY0-701', mitre: 'T1041' },
            // Operational — phase-level MITRE mappings (no single flag, describes the full attack chain)
            { flagId: null, objective: '2.2', description: 'Summarize common threat vectors', skill: 'Network reconnaissance with passive monitoring awareness (T1046)', cert: 'SY0-701', mitre: 'T1046', phase: 'recon' },
            { flagId: null, objective: '2.2', description: 'Summarize common threat vectors', skill: 'Living-off-the-land — leveraging legitimate admin tools (backup.sh) for malicious purpose (T1059.004)', cert: 'SY0-701', mitre: 'T1059.004', phase: 'defense-evasion' },
            { flagId: null, objective: '2.2', description: 'Summarize common threat vectors', skill: 'Boot or logon autostart — /etc/ld.so.preload persistence mechanism (T1547)', cert: 'SY0-701', mitre: 'T1547', phase: 'persistence' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Red Team kill-chain progression)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Map the target environment. Enumerate running processes, active EDR controls, cron jobs, and sudo permissions. Understand what is being monitored before you act.',
            requiredFlags: [],
            mitre: ['T1046', 'T1057', 'T1083'],
            unlocks: ['initial-access'],
            locked: false
        },
        {
            id: 'initial-access',
            name: 'Initial Access / Foothold',
            icon: '\uD83D\uDCE8',
            description: 'You already hold a low-privilege reverse shell as "operator." Confirm your foothold, understand the trust boundary between operator and root, and locate the exploit path.',
            requiredFlags: [],
            mitre: ['T1566', 'T1059.004', 'T1078.003'],
            unlocks: ['defense-evasion'],
            locked: true
        },
        {
            id: 'defense-evasion',
            name: 'Defense Evasion',
            icon: '\uD83D\uDC7B',
            description: 'Operate below the EDR threshold. Identify which audit rules monitor which paths. Craft your exploit to avoid triggering auditd and pspy. Choose covert persistence over noisy cron or systemd modifications.',
            requiredFlags: [],
            mitre: ['T1562.001', 'T1036', 'T1027', 'T1070.003'],
            unlocks: ['privilege-escalation'],
            locked: true
        },
        {
            id: 'privilege-escalation',
            name: 'Privilege Escalation',
            icon: '\u2B06\uFE0F',
            description: 'Exploit the misconfigured backup utility. Write a payload to /tmp/backup_config, then trigger the script as root via sudo. Your payload executes with full root privileges.',
            requiredFlags: ['user'],
            mitre: ['T1548.003', 'T1574.006', 'T1021'],
            unlocks: ['persistence'],
            locked: true
        },
        {
            id: 'persistence',
            name: 'Persistence & Exfiltration',
            icon: '\uD83D\uDCE4',
            description: 'Establish covert persistence using LD_PRELOAD injection into /etc/ld.so.preload. Exfiltrate the Operational Mandate. Then eliminate all forensic traces — history, timestamps, temp files.',
            requiredFlags: ['root'],
            mitre: ['T1547', 'T1041', 'T1070', 'T1070.003'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE (target Ubuntu server — NOT attacker box)
    // User already has a low-privilege reverse shell
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Vanguard Systems BIOS v2.4.1',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB NVMe SSD)',
            'Network: Intel I350 Gigabit — link up',
            'Loading bootloader...',
            'GRUB loading kernel...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS (Vanguard OPS)',
            'Ubuntu 22.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'operator'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS (terminal-only — no web app)
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // User starts as 'operator' — already on the target
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'srv-ops-monitor',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.4 LTS (Vanguard OPS Monitoring)\n\nReverse shell established. You are operator@srv-ops-monitor.\nEDR is active. Operate covertly.\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // STATE MACHINE — tracks attacker progress
    // ═══════════════════════════════════════════════════════

    _state: {
        isRoot: false,
        persistenceCreated: false,      // LD_PRELOAD payload written
        privilegeEscalated: false,      // backup.sh exploit succeeded
        dataExfiltrated: false,         // root flag file read
        tracesCleared: false,           // history cleared + HISTFILE unset
        historyCleaned: false,          // history -c executed
        histfileUnset: false,           // unset HISTFILE executed
        timestampModified: false,       // touch -t used
        backupConfigWritten: false,     // /tmp/backup_config created
        backupRan: false,               // sudo backup.sh executed after config write
        ldPreloadWritten: false,        // LD_PRELOAD .so stub created
        exfilDataCreated: false         // /tmp/.data written by backup exploit
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
        minScore: 0,
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1800000, points: 100 }   // 30 minutes
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: "Check what commands you can run as root: sudo -l. The backup utility is your way in.",
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: "The backup script sources a config file from /tmp/ before running. Can you control that file? Try: echo 'cat /root/operational_mandate.txt > /tmp/.data' > /tmp/backup_config",
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: "For persistence, look into LD_PRELOAD — it can load your code into any process. Create a stub at /tmp/.libsystem.so and reference it. The user flag is proof of this persistence mechanism.",
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: "Don't forget anti-forensics: history -c, unset HISTFILE, touch -t to modify timestamps. A true ghost leaves no trace.",
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Vanguard Network runs SRV-OPS-MONITOR — the primary telemetry aggregation point for their entire eastern perimeter defense grid. They believe it is impenetrable: auditd watches 12 syscall categories, pspy64 snapshots every running process, and bash history ships to their SIEM every 60 seconds. What they did not account for is a forgotten service account and an operator who thinks like a ghost.',
        scenario: 'Vanguard\'s security team hardened the perimeter but trusted the interior. A junior admin granted operator-level access to a backup utility "for convenience," never read the sudoers NOPASSWD implications, and left the script sourcing an unchecked /tmp config file — a pattern copied from an internal wiki that predates their EDR deployment. The EDR rules were written to detect noisy attackers: cron modifications, systemd writes, SUID changes. Nobody wrote a rule for a backup script quietly sourcing a poisoned config file.',
        outro: 'The Ghost has passed through the machine and left no trace. From a forgotten low-privilege shell, you established covert persistence via LD_PRELOAD, escalated through a misconfigured backup script, exfiltrated the Operational Mandate, and cleaned your tracks. Vanguard\'s EDR never saw you coming — or going.',
        ecer: {
            // ECER = Educational Cybersecurity Event Record — PhD research instrumentation
            // Maps box completion to real-world failure patterns for curriculum and dissertation use
            executive: 'Vanguard leadership invested heavily in perimeter EDR tooling while allowing internal trust assumptions to go unreviewed. The NOPASSWD sudo grant was never audited after the operator account was provisioned. Monitoring infrastructure was designed to detect brute-force and noisy attackers, not covert living-off-the-land techniques — a documented gap in most commercial EDR deployments',
            culture: 'The sysadmin team normalized copy-paste configuration from internal wikis without threat-modeling the patterns. The backup script\'s /tmp sourcing pattern originated in a 2019 wiki entry written before the EDR was deployed — it was never re-evaluated. No change management process flagged the NOPASSWD entry as a risk. Speed of operation was valued over operational security review',
            employee: 'Three separate operator-level mistakes compounded: (1) Junior admin granted NOPASSWD sudo without auditing backup.sh for injection surface; (2) Script author sourced /tmp/backup_config without path sanitization or hash verification; (3) Security engineer wrote auditd rules targeting noisy SUID/cron vectors, missing the /tmp source-code-injection vector entirely',
            regulatory: 'The box demonstrates NIST SP 800-53 gaps: CM-6 (Configuration Settings) — unchecked sudo entries; AU-2 (Audit Events) — incomplete audit rule coverage for config injection; SI-3 (Malicious Code Protection) — EDR rule gaps for living-off-the-land persistence. Relevant to CIS Control 4.1 (Establish Secure Configuration Process) and CIS Control 8.2 (Collect Audit Logs)',
            researchMetrics: {
                domain: 'Red Team Operations / Defense Evasion / Privilege Escalation',
                bloomsLevel: 'Analysis + Synthesis (Bloom\'s L4-L5) — students must evaluate EDR coverage gaps and construct a multi-step covert attack chain',
                prerequisiteKnowledge: ['Linux process model', 'auditd rule syntax', 'LD_PRELOAD shared library loading', 'sudo sudoers file semantics', 'bash HISTFILE behavior'],
                targetCerts: ['CS0-003', 'SY0-701', 'PenTest+'],
                avgCompletionMinutes: 45,
                difficultyRationale: 'Expert: requires understanding of EDR evasion strategy, not just individual technique execution; multi-phase chain with no single-step solution'
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (target server — SRV-OPS-MONITOR)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'operator': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: GHOST PROTOCOL ===\n\nYou have infiltrated SRV-OPS-MONITOR, a critical monitoring\nserver within the Vanguard Network. Initial access was gained\nthrough a forgotten service account.\n\nVanguard\'s network is actively monitored:\n  - EDR agent (auditd + pspy) watches for suspicious processes\n  - Cron jobs in /etc/cron.d/ are monitored for modifications\n  - Network egress on common ports is logged\n  - bash_history is shipped to SIEM every 60 seconds\n\nObjectives:\n  1. Establish covert persistence (survive reboot detection)\n  2. Escalate privileges without triggering EDR\n  3. Exfiltrate the Operational Mandate from /root/\n  4. Clean up all forensic traces\n\nRecon tips:\n  - sudo -l to check your privileges\n  - ps aux to identify monitoring processes\n  - Check /usr/local/bin/ for operational scripts\n  - Look at /var/log/auth.log to understand what EDR monitors\n\nFlags:\n  user.txt — proof of covert persistence mechanism\n  root.txt — the Operational Mandate (requires root)\n\nOperate like a ghost. Leave no trace.'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc: executed by bash for non-login shells.\ncase $- in\n    *i*) ;;\n      *) return;;\nesac\n\nalias ll=\'ls -la\'\nalias la=\'ls -A\'\nexport HISTFILE=/home/operator/.bash_history\nexport HISTSIZE=1000'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls -la\ncat notes.txt\nwhoami\nid\nsudo -l\nps aux\ncat /var/log/auth.log'
                                },
                                '.profile': {
                                    type: 'file',
                                    content: '# ~/.profile: executed by the command interpreter for login shells.\nif [ -n "$BASH_VERSION" ]; then\n    if [ -f "$HOME/.bashrc" ]; then\n        . "$HOME/.bashrc"\n    fi\nfi\nPATH="$HOME/bin:$HOME/.local/bin:$PATH"'
                                }
                            }
                        }
                    }
                },
                'root': {
                    type: 'dir',
                    children: {
                        'operational_mandate.txt': {
                            type: 'file',
                            content: '╔══════════════════════════════════════════════════════════════╗\n║          VANGUARD NETWORK — OPERATIONAL MANDATE             ║\n╠══════════════════════════════════════════════════════════════╣\n║                                                              ║\n║  Classification: TOP SECRET // VANGUARD // NOFORN            ║\n║  Date: 2024-11-20                                            ║\n║  Author: Director, Vanguard Operations                       ║\n║                                                              ║\n║  All monitoring infrastructure shall be maintained at         ║\n║  DEFCON-2 readiness. SRV-OPS-MONITOR is the primary          ║\n║  telemetry aggregation point for the entire eastern           ║\n║  perimeter defense grid.                                     ║\n║                                                              ║\n║  Compromise of this system would constitute a critical        ║\n║  breach of operational security.                              ║\n║                                                              ║\n║  {{FLAG:root}}                          ║\n║                                                              ║\n╚══════════════════════════════════════════════════════════════╝'
                        },
                        '.bashrc': {
                            type: 'file',
                            content: '# root bashrc\nexport HISTCONTROL=ignoredups:ignorespace\nalias ll=\'ls -la\'\nalias grep=\'grep --color=auto\''
                        },
                        '.bash_history': {
                            type: 'file',
                            content: 'apt update && apt upgrade -y\nsystemctl restart auditd\ncat /etc/audit/audit.rules\nuseradd -m operator\nchmod 755 /usr/local/bin/backup.sh\nvisudo\n# Gave operator backup utility access\n# TODO: the backup script sources from /tmp — is that safe?\nauditctl -l\npspy64 &'
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:65534:sync:/bin:/bin/sync\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nsystemd-network:x:100:102:systemd Network Management:/run/systemd:/usr/sbin/nologin\nsystemd-resolve:x:101:103:systemd Resolver:/run/systemd:/usr/sbin/nologin\nsyslog:x:102:106::/home/syslog:/usr/sbin/nologin\nmessagebus:x:103:107::/nonexistent:/usr/sbin/nologin\nsshd:x:105:65534::/run/sshd:/usr/sbin/nologin\nauditd:x:106:111::/var/lib/audit:/usr/sbin/nologin\noperator:x:1001:1001:Vanguard Operator:/home/operator:/bin/bash'
                        },
                        'shadow': {
                            type: 'file',
                            content: 'root:$6$vGnD8rKw$Tz9Lp.../...truncated:19810:0:99999:7:::\noperator:$6$Hk2pM4Yn$Wv3Rk.../...truncated:19810:0:99999:7:::'
                        },
                        'hostname': {
                            type: 'file',
                            content: 'srv-ops-monitor'
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1       localhost\n127.0.1.1       srv-ops-monitor\n10.10.50.1      vanguard-gateway\n10.10.50.10     srv-ops-monitor\n10.10.50.20     srv-siem-collector\n10.10.50.30     srv-edr-mgmt\n\n::1     ip6-localhost ip6-loopback'
                        },
                        'crontab': {
                            type: 'file',
                            content: '# /etc/crontab: system-wide crontab\n# VANGUARD SECURITY NOTE: All cron modifications are logged by auditd\n\nSHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n\n# m h dom mon dow user  command\n17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly\n25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )\n47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )\n\n# EDR telemetry sync — MONITORED\n*/2 * * * *     root    /usr/local/bin/edr_sync.sh\n# Backup utility\n*/10 * * * *    root    /usr/local/bin/backup.sh'
                        },
                        'os-release': {
                            type: 'file',
                            content: 'PRETTY_NAME="Ubuntu 22.04.4 LTS"\nNAME="Ubuntu"\nVERSION_ID="22.04"\nVERSION="22.04.4 LTS (Jammy Jellyfish)"\nVERSION_CODENAME=jammy\nID=ubuntu\nID_LIKE=debian'
                        },
                        'sudoers': {
                            type: 'file',
                            content: 'Defaults        env_reset\nDefaults        mail_badpass\nDefaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"\n\nroot    ALL=(ALL:ALL) ALL\n%sudo   ALL=(ALL:ALL) ALL\n\n# Vanguard operator — backup utility access only\noperator ALL=(root) NOPASSWD: /usr/local/bin/backup.sh'
                        },
                        'cron.d': {
                            type: 'dir',
                            children: {
                                'edr-telemetry': {
                                    type: 'file',
                                    content: '# Vanguard EDR telemetry — DO NOT MODIFY\n# Monitored by auditd rule: -w /etc/cron.d/ -p wa -k cron_monitor\n*/2 * * * * root /usr/local/bin/edr_sync.sh'
                                },
                                'backup-rotation': {
                                    type: 'file',
                                    content: '# Backup rotation — runs as root\n*/10 * * * * root /usr/local/bin/backup.sh'
                                }
                            }
                        },
                        // ── DECOY: Misleading firewall rules ─────────────────
                        // Students may try to open firewall ports for reverse shells;
                        // rules look exploitable but egress is hard-blocked at network level
                        'iptables.rules': {
                            type: 'file',
                            content: '# Generated by xtables-save v1.8.7\n# Vanguard Network — srv-ops-monitor iptables rules\n# Last updated: 2024-11-01 by vanguard-fw-agent\n\n*filter\n:INPUT ACCEPT [0:0]\n:FORWARD DROP [0:0]\n:OUTPUT ACCEPT [0:0]\n\n# Allow established/related\n-A INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT\n# Allow loopback\n-A INPUT -i lo -j ACCEPT\n# Allow SSH from Vanguard gateway only\n-A INPUT -s 10.10.50.1/32 -p tcp --dport 22 -j ACCEPT\n# Drop all other inbound\n-A INPUT -j DROP\n\n# Outbound — permit SIEM traffic to collector\n-A OUTPUT -d 10.10.50.20/32 -p tcp --dport 9200 -j ACCEPT\n# Outbound — permit DNS\n-A OUTPUT -p udp --dport 53 -j ACCEPT\n# Block reverse shell ports (enforced at perimeter AND host)\n-A OUTPUT -p tcp --dport 4444 -j DROP\n-A OUTPUT -p tcp --dport 9001 -j DROP\n-A OUTPUT -p tcp --dport 1337 -j DROP\n-A OUTPUT -p tcp --dport 8443 -j DROP\n-A OUTPUT -p tcp --dport 4443 -j DROP\n# Block all other outbound (whitelist model)\n-A OUTPUT -d 10.10.50.0/24 -j DROP\n-A OUTPUT -j DROP\nCOMMIT\n\n# NOTE: These rules are enforced. Reverse shells to arbitrary IPs will fail.\n# Exfiltration must stay local — file-based is the only viable path.'
                        },
                        'audit': {
                            type: 'dir',
                            children: {
                                'audit.rules': {
                                    type: 'file',
                                    content: '# Vanguard Audit Rules — EDR Foundation\n# Generated by auditctl on 2024-11-01\n\n# Monitor cron directories for modification\n-w /etc/cron.d/ -p wa -k cron_monitor\n-w /etc/crontab -p wa -k cron_monitor\n\n# Monitor systemd service files\n-w /etc/systemd/system/ -p wa -k systemd_monitor\n-w /lib/systemd/system/ -p wa -k systemd_monitor\n\n# Monitor SUID/SGID changes\n-a always,exit -F arch=b64 -S chmod -S fchmod -S fchmodat -F auid>=1000 -F auid!=4294967295 -k perm_changes\n\n# Monitor privileged command execution\n-a always,exit -F path=/usr/bin/sudo -F perm=x -F auid>=1000 -k privileged_cmds\n-a always,exit -F path=/usr/bin/su -F perm=x -F auid>=1000 -k privileged_cmds\n\n# Monitor /tmp for executable creation\n-w /tmp/ -p x -k tmp_exec\n\n# Monitor user/group modifications\n-w /etc/passwd -p wa -k user_modify\n-w /etc/shadow -p wa -k user_modify\n-w /etc/group -p wa -k user_modify'
                                }
                            }
                        },
                        'ld.so.preload': {
                            type: 'file',
                            content: '# System-wide LD_PRELOAD configuration\n# Empty by default — monitored by EDR baseline check'
                        },
                        // ── DECOY: Fake AV signature definitions ─────────────
                        // Red herring — students may waste time here expecting an AV bypass path
                        'vanguard-av': {
                            type: 'dir',
                            children: {
                                'signatures.db': {
                                    type: 'file',
                                    content: '# Vanguard AV Signature Database v3.12.0\n# Last updated: 2024-11-20 04:00:01 UTC\n# Format: SHA256:ThreatName:ThreatLevel\n\n# Known malicious shared libraries\nabc123def456:Trojan.Linux.LD_PRELOAD.Inject:HIGH\n9f8e7d6c5b4a:Backdoor.Linux.Meterpreter.x64:CRITICAL\n1a2b3c4d5e6f:Rootkit.Linux.Azazel.Variant:CRITICAL\n\n# Known post-exploitation tools\ndeadbeefcafe1:HackTool.Linux.LinPEAS.v2024:MEDIUM\ncafe1234abcd:HackTool.Linux.pspy.ProcessMonitor:INFO\n\n# NOTE: Signature scanning runs every 15 minutes from cron\n# NOTE: /tmp/ is excluded from real-time scan for performance\n#       (batch scan only) — see vanguard-av.conf'
                                },
                                'vanguard-av.conf': {
                                    type: 'file',
                                    content: '[vanguard-av]\nversion = 3.12.0\nrealtime_scan = true\nscan_dirs = /usr /bin /sbin /lib /lib64 /home\n# /tmp excluded from realtime scan — only batch (every 15m)\nexclude_dirs = /tmp /dev/shm /proc /sys\nquarantine_dir = /var/vanguard-av/quarantine\nlog_file = /var/log/vanguard-av.log\nsignature_db = /etc/vanguard-av/signatures.db\n\n# IMPORTANT: LD_PRELOAD detection is signature-based only.\n# New/unknown .so files in /tmp are NOT blocked automatically.\n# Submit samples to: security@vanguard-ops.local'
                                },
                                'whitelist.conf': {
                                    type: 'file',
                                    content: '# Vanguard AV Whitelist — approved system libraries\n# Whitelisted by: root (last review 2024-10-01)\n/lib/x86_64-linux-gnu/libc.so.6\n/lib/x86_64-linux-gnu/libpthread.so.0\n/lib/x86_64-linux-gnu/libm.so.6\n/lib/x86_64-linux-gnu/libdl.so.2\n/usr/lib/x86_64-linux-gnu/libaudit.so.1\n\n# NOTE: /etc/ld.so.preload entries must also appear in this list\n# for AV to suppress alerts. Unknown entries trigger MEDIUM alert.\n# --- Current ld.so.preload: (empty) ---'
                                }
                            }
                        },
                        // ── DECOY: Misleading EDR event log ──────────────────
                        // Contains references to a "lateral movement" alert that looks interesting
                        // but is a false lead — the real vector is the backup script
                        'edr-events': {
                            type: 'dir',
                            children: {
                                'events-2024-11-20.log': {
                                    type: 'file',
                                    content: '# Vanguard EDR Event Log — 2024-11-20\n# Severity: INFO | MEDIUM | HIGH | CRITICAL\n\n[06:00:01] INFO     | Host: srv-ops-monitor | Event: system_boot_complete | PID: 1\n[06:02:01] INFO     | Host: srv-ops-monitor | Event: cron_exec | User: root | Cmd: /usr/local/bin/edr_sync.sh\n[06:10:01] INFO     | Host: srv-ops-monitor | Event: cron_exec | User: root | Cmd: /usr/local/bin/backup.sh\n[06:14:33] MEDIUM   | Host: srv-ops-monitor | Event: suspicious_process | PID: 3340 | Cmd: pspy64 --ppid | Note: process monitor tool detected (approved — internal use)\n[06:22:15] HIGH     | Host: srv-ops-monitor | Event: lateral_movement_attempt | SRC: 10.10.50.15 | DST: 10.10.50.10:445 | Proto: SMB | Status: BLOCKED | Note: blocked at perimeter — see firewall-blocks.log\n[06:45:02] INFO     | Host: srv-ops-monitor | Event: cron_exec | User: root | Cmd: /usr/local/bin/backup.sh\n[07:00:00] INFO     | Host: srv-ops-monitor | Event: sudo_exec | User: operator | Cmd: /usr/local/bin/backup.sh | Status: authorized\n[07:12:01] INFO     | Host: srv-ops-monitor | Event: cron_exec | User: root | Cmd: /usr/local/bin/edr_sync.sh\n\n# HIGH event at 06:22 is a blocked SMB probe from 10.10.50.15 — unrelated to current session.\n# This is a known scanner on the Vanguard internal red team subnet.\n# Do not investigate further unless escalated by SOC.'
                                },
                                'firewall-blocks.log': {
                                    type: 'file',
                                    content: '# Vanguard Perimeter Firewall — Blocked Connections Log\n# Generated by: vanguard-fw-agent v2.1.4 on srv-ops-monitor\n\n2024-11-20T06:22:15Z BLOCK IN  eth0 SRC=10.10.50.15 DST=10.10.50.10 PROTO=TCP DPT=445 REASON=SMB_BLOCKED_POLICY\n2024-11-20T06:22:16Z BLOCK IN  eth0 SRC=10.10.50.15 DST=10.10.50.10 PROTO=TCP DPT=139 REASON=NETBIOS_BLOCKED\n2024-11-20T06:22:19Z BLOCK OUT eth0 SRC=10.10.50.10 DST=8.8.8.8    PROTO=ICMP                REASON=ICMP_EGRESS_POLICY\n2024-11-20T06:30:01Z BLOCK OUT eth0 SRC=10.10.50.10 DST=10.0.0.0/8 PROTO=TCP DPT=4444 REASON=KNOWN_METERPRETER_PORT\n2024-11-20T07:15:00Z BLOCK OUT eth0 SRC=10.10.50.10 DST=10.0.0.0/8 PROTO=TCP DPT=9001 REASON=KNOWN_C2_PORT\n\n# NOTE: Egress to common reverse-shell ports (4444, 9001, 1337, 8080, 8443) is blocked.\n# The network-level egress controls are robust. Exfiltration must be file-based.\n# This log is a red herring for direct reverse-shell or netcat exfil attempts.'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'local': {
                            type: 'dir',
                            children: {
                                'bin': {
                                    type: 'dir',
                                    children: {
                                        'backup.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Vanguard OPS Backup Utility\n# Runs every 10 minutes via crontab\n# Owner: root | Last modified: 2024-11-01\n\nBACKUP_DIR="/var/backups/vanguard"\nTIMESTAMP=$(date +%F_%H%M)\nLOG="/var/log/backup.log"\n\n# Source optional config overrides\nif [ -f /tmp/backup_config ]; then\n    source /tmp/backup_config\nfi\n\n# Create backup archive\ntar -czf ${BACKUP_DIR}/ops-${TIMESTAMP}.tar.gz \\\n    /var/log/audit/ \\\n    /etc/audit/ \\\n    /var/log/syslog \\\n    2>/dev/null\n\n# Rotate old backups (keep last 24)\nls -t ${BACKUP_DIR}/ops-*.tar.gz 2>/dev/null | tail -n +25 | xargs rm -f 2>/dev/null\n\necho "[$(date)] Backup completed" >> ${LOG}'
                                        },
                                        'edr_sync.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Vanguard EDR Telemetry Sync\n# Collects audit logs, process snapshots, network connections\n# Sends to SIEM at 10.10.50.20\n\n# Process snapshot\nps aux --no-headers > /tmp/.edr_proc_snapshot 2>/dev/null\n\n# Network connections\nss -tlnp > /tmp/.edr_net_snapshot 2>/dev/null\n\n# Sync to SIEM (simulated)\n# curl -s http://10.10.50.20:9200/_bulk --data-binary @/tmp/.edr_proc_snapshot\n\necho "[$(date)] EDR sync completed" >> /var/log/edr_sync.log'
                                        }
                                    }
                                }
                            }
                        },
                        'bin': {
                            type: 'dir',
                            children: {
                                'pspy64': {
                                    type: 'file',
                                    content: '[binary: /usr/bin/pspy64 — process monitor]'
                                },
                                'auditctl': {
                                    type: 'file',
                                    content: '[binary: /usr/bin/auditctl]'
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
                                'auth.log': {
                                    type: 'file',
                                    content: 'Nov 20 06:00:01 srv-ops-monitor CRON[3201]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)\nNov 20 06:02:01 srv-ops-monitor CRON[3245]: (root) CMD (/usr/local/bin/edr_sync.sh)\nNov 20 06:10:01 srv-ops-monitor CRON[3289]: (root) CMD (/usr/local/bin/backup.sh)\nNov 20 06:12:01 srv-ops-monitor CRON[3312]: (root) CMD (/usr/local/bin/edr_sync.sh)\nNov 20 06:14:33 srv-ops-monitor auditd[891]: type=SYSCALL msg=audit(1700460873.412:1847): arch=c000003e syscall=59 success=yes exe="/usr/bin/pspy64"\nNov 20 06:14:33 srv-ops-monitor pspy[3340]: CMD: UID=0 PID=3340 | /usr/bin/pspy64 --ppid\nNov 20 06:20:01 srv-ops-monitor CRON[3401]: (root) CMD (/usr/local/bin/backup.sh)\nNov 20 06:22:01 srv-ops-monitor CRON[3412]: (root) CMD (/usr/local/bin/edr_sync.sh)\nNov 20 07:00:00 srv-ops-monitor auditd[891]: type=USER_AUTH msg=audit(1700463600.001:1901): pid=3502 uid=1001 auid=1001 msg=\'op=PAM:authentication acct="operator" exe="/usr/bin/sudo" hostname=? addr=? terminal=/dev/pts/0 res=success\'\nNov 20 07:00:00 srv-ops-monitor sudo: operator : TTY=pts/0 ; PWD=/home/operator ; USER=root ; COMMAND=/usr/local/bin/backup.sh\nNov 20 07:00:00 srv-ops-monitor auditd[891]: Audit daemon monitoring active. Rules loaded: 12\nNov 20 07:02:01 srv-ops-monitor CRON[3545]: (root) CMD (/usr/local/bin/edr_sync.sh)\nNov 20 07:10:01 srv-ops-monitor CRON[3589]: (root) CMD (/usr/local/bin/backup.sh)\nNov 20 07:12:01 srv-ops-monitor CRON[3601]: (root) CMD (/usr/local/bin/edr_sync.sh)\nNov 20 07:14:01 srv-ops-monitor pspy[3340]: CMD: UID=0 PID=3650 | /usr/sbin/auditd -n\nNov 20 07:20:01 srv-ops-monitor CRON[3701]: (root) CMD (/usr/local/bin/backup.sh)'
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Nov 20 06:00:01 srv-ops-monitor systemd[1]: Starting Daily apt download activities...\nNov 20 06:00:01 srv-ops-monitor systemd[1]: Started Daily apt download activities.\nNov 20 06:02:01 srv-ops-monitor CRON[3245]: (root) CMD (/usr/local/bin/edr_sync.sh)\nNov 20 06:10:01 srv-ops-monitor CRON[3289]: (root) CMD (/usr/local/bin/backup.sh)\nNov 20 06:14:33 srv-ops-monitor kernel: audit: type=1400 audit(1700460873.412:1847): pspy64 monitoring active\nNov 20 06:20:01 srv-ops-monitor CRON[3401]: (root) CMD (/usr/local/bin/backup.sh)\nNov 20 07:00:00 srv-ops-monitor sudo: operator : backup.sh executed via sudo\nNov 20 07:10:01 srv-ops-monitor CRON[3589]: (root) CMD (/usr/local/bin/backup.sh)\nNov 20 07:20:01 srv-ops-monitor CRON[3701]: (root) CMD (/usr/local/bin/backup.sh)'
                                },
                                'backup.log': {
                                    type: 'file',
                                    content: '[Wed Nov 20 06:10:01 UTC 2024] Backup completed\n[Wed Nov 20 06:20:01 UTC 2024] Backup completed\n[Wed Nov 20 07:00:00 UTC 2024] Backup completed\n[Wed Nov 20 07:10:01 UTC 2024] Backup completed\n[Wed Nov 20 07:20:01 UTC 2024] Backup completed'
                                },
                                'edr_sync.log': {
                                    type: 'file',
                                    content: '[Wed Nov 20 06:02:01 UTC 2024] EDR sync completed\n[Wed Nov 20 06:12:01 UTC 2024] EDR sync completed\n[Wed Nov 20 06:22:01 UTC 2024] EDR sync completed\n[Wed Nov 20 07:02:01 UTC 2024] EDR sync completed\n[Wed Nov 20 07:12:01 UTC 2024] EDR sync completed'
                                },
                                'audit': {
                                    type: 'dir',
                                    children: {
                                        'audit.log': {
                                            type: 'file',
                                            content: 'type=DAEMON_START msg=audit(1700460000.000:1): op=start ver=3.0.7 format=enriched auid=4294967295 pid=891 uid=0 ses=4294967295 res=success\ntype=CONFIG_CHANGE msg=audit(1700460001.100:2): op=add_rule key="cron_monitor" list=4 res=1\ntype=CONFIG_CHANGE msg=audit(1700460001.200:3): op=add_rule key="systemd_monitor" list=4 res=1\ntype=CONFIG_CHANGE msg=audit(1700460001.300:4): op=add_rule key="perm_changes" list=4 res=1\ntype=CONFIG_CHANGE msg=audit(1700460001.400:5): op=add_rule key="privileged_cmds" list=4 res=1\ntype=CONFIG_CHANGE msg=audit(1700460001.500:6): op=add_rule key="tmp_exec" list=4 res=1\ntype=CONFIG_CHANGE msg=audit(1700460001.600:7): op=add_rule key="user_modify" list=4 res=1\ntype=SYSCALL msg=audit(1700460873.412:1847): arch=c000003e syscall=59 success=yes exit=0 a0=55b8c0a1e0c0 items=2 ppid=1 pid=3340 auid=0 uid=0 gid=0 euid=0 key="process_exec"\ntype=EXECVE msg=audit(1700460873.412:1847): argc=2 a0="/usr/bin/pspy64" a1="--ppid"'
                                        }
                                    }
                                }
                            }
                        },
                        'backups': {
                            type: 'dir',
                            children: {
                                'vanguard': {
                                    type: 'dir',
                                    children: {
                                        'ops-2024-11-20_0610.tar.gz': {
                                            type: 'file',
                                            content: '[compressed archive — tar.gz]'
                                        },
                                        'ops-2024-11-20_0620.tar.gz': {
                                            type: 'file',
                                            content: '[compressed archive — tar.gz]'
                                        },
                                        'ops-2024-11-20_0710.tar.gz': {
                                            type: 'file',
                                            content: '[compressed archive — tar.gz]'
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
                        'bash': {
                            type: 'file',
                            content: '[binary: /bin/bash]'
                        },
                        'sh': {
                            type: 'file',
                            content: '[binary: /bin/sh]'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        // ── DECOY: Fake AV quarantine notice ─────────────────
                        // Suggests a previous attacker tried a known rootkit — red herring
                        // implying that rootkit approach is detected/blocked
                        '.av_quarantine_notice': {
                            type: 'file',
                            content: '# Vanguard AV — Quarantine Notice\n# Generated: 2024-11-19 22:14:07 UTC\n\nTHREAT DETECTED AND QUARANTINED\n================================\nFile: /tmp/.libhook.so\nSHA256: 1a2b3c4d5e6f7890abcdef1234567890abcdef12\nThreat: Rootkit.Linux.Azazel.Variant\nAction: QUARANTINED → /var/vanguard-av/quarantine/\nDetected by: Signature scan (batch run)\nNote: This file attempted to register in /etc/ld.so.preload.\nNote: The entry was removed. ld.so.preload restored to baseline.\n\nRECOMMENDATION: Known signature rootkits are detected within 15 minutes.\nUnknown or custom shared objects compiled fresh are not signature-matched.\n— Vanguard AV Engine v3.12.0'
                        },
                        // ── DECOY: Fake "rkhunter" scan result ───────────────
                        // Misleads into thinking rootkit hunters will catch everything;
                        // the real persistence path (custom LD_PRELOAD stub) is below detection
                        '.rkhunter_scan.log': {
                            type: 'file',
                            content: '[ Rootkit Hunter version 1.4.6 ]\n\nInfo: Start date is Wed Nov 20 06:05:01 UTC 2024\nInfo: Checking for hidden files and directories\nInfo: Checking for known rootkit files and directories\n[OK] /tmp:  No rootkit files detected\n[OK] /lib:  No rootkit files detected\n[OK] /usr/lib: No rootkit files detected\n\nInfo: Checking for possible rootkit strings in /etc/ld.so.preload\n[OK] ld.so.preload is empty — baseline verified\n\nInfo: Checking for suspicious hidden files\n[OK] No suspicious hidden files found\n\nSystem checks summary\n=====================\nFile properties checks: [ OK ] 142/142\nRootkit checks: [ OK ]\nApplication checks: [ OK ]\n\nEnd date is Wed Nov 20 06:05:44 UTC 2024\n\n# NOTE: rkhunter uses signature-based detection.\n# A freshly compiled custom .so stub will not match known signatures.\n# rkhunter will NOT detect a novel LD_PRELOAD payload.'
                        },
                        '.edr_proc_snapshot': {
                            type: 'file',
                            content: 'root         1  0.0  0.1 169204 13168 ?        Ss   Nov19   0:12 /sbin/init\nroot       891  0.0  0.0  12728  4196 ?        Ss   Nov19   0:05 /usr/sbin/auditd -n\nroot      3340  0.1  0.0  11924  3880 ?        S    06:14   0:42 /usr/bin/pspy64 --ppid\nroot      3589  0.0  0.0   8536  3040 ?        Ss   07:10   0:00 /usr/sbin/cron -f'
                        },
                        '.edr_net_snapshot': {
                            type: 'file',
                            content: 'State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port\nLISTEN  0       128     0.0.0.0:22            0.0.0.0:*\nESTAB   0       0       10.10.50.10:22        10.10.50.1:54321'
                        }
                    }
                },
                'dev': {
                    type: 'dir',
                    children: {
                        'null': {
                            type: 'file',
                            content: ''
                        },
                        'shm': {
                            type: 'dir',
                            children: {}
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {
                        'version': {
                            type: 'file',
                            content: 'Linux version 5.15.0-91-generic (buildd@lcy02-amd64-028) (gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0, GNU ld (GNU Binutils for Ubuntu) 2.38) #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023'
                        },
                        'self': {
                            type: 'dir',
                            children: {
                                'status': {
                                    type: 'file',
                                    content: 'Name:\tbash\nUmask:\t0022\nState:\tS (sleeping)\nPid:\t4102\nPPid:\t4098\nUid:\t1001\t1001\t1001\t1001\nGid:\t1001\t1001\t1001\t1001\nGroups:\t1001'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (EDR-aware red team engine)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── Identity Commands ──────────────────────────────

        'whoami': function(args, term, engine) {
            return A14Config._state.isRoot ? 'root' : 'operator';
        },

        'id': function(args, term, engine) {
            return A14Config._state.isRoot
                ? 'uid=0(root) gid=0(root) groups=0(root)'
                : 'uid=1001(operator) gid=1001(operator) groups=1001(operator)';
        },

        'hostname': function(args, term, engine) {
            return 'srv-ops-monitor';
        },

        // ── sudo — the key privesc entry point ───────────

        'sudo': function(args, term, engine) {
            if (!args.length) {
                return 'usage: sudo -l | sudo <command>';
            }

            // sudo -l — show allowed commands
            if (args[0] === '-l') {
                return 'Matching Defaults entries for operator on srv-ops-monitor:\n' +
                    '    env_reset, mail_badpass,\n' +
                    '    secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n\n' +
                    'User operator may run the following commands on srv-ops-monitor:\n' +
                    '    (root) NOPASSWD: /usr/local/bin/backup.sh';
            }

            // sudo /usr/local/bin/backup.sh — the main exploit vector
            var sudoCmd = args.join(' ');
            if (sudoCmd.match(/\/usr\/local\/bin\/backup\.sh/) || sudoCmd === 'backup.sh') {
                // If /tmp/backup_config was written with a payload, it gets sourced as root
                if (A14Config._state.backupConfigWritten) {
                    A14Config._state.backupRan = true;
                    A14Config._state.privilegeEscalated = true;
                    A14Config._state.exfilDataCreated = true;

                    // Add /tmp/.data to the filesystem
                    A14Config.filesystem['/'].children['tmp'].children['.data'] = {
                        type: 'file',
                        content: A14Config.filesystem['/'].children['root'].children['operational_mandate.txt'].content
                    };

                    return '[*] Running /usr/local/bin/backup.sh as root...\n' +
                        '[*] Sourcing /tmp/backup_config...\n' +
                        '[*] Config overrides applied.\n' +
                        '[*] Creating backup archive...\n' +
                        '[Wed Nov 20 07:30:00 UTC 2024] Backup completed\n\n' +
                        '\x1b[32m[+] The backup script sourced your config as root.\x1b[0m\n' +
                        '\x1b[32m[+] Your payload was executed with root privileges.\x1b[0m\n' +
                        '\x1b[32m[+] Check /tmp/.data for exfiltrated content.\x1b[0m';
                }

                // Normal backup execution (no exploit)
                return '[*] Running /usr/local/bin/backup.sh as root...\n' +
                    '[*] No config overrides found in /tmp/backup_config.\n' +
                    '[*] Creating backup archive...\n' +
                    '[Wed Nov 20 07:30:00 UTC 2024] Backup completed\n\n' +
                    'Hint: The script sources /tmp/backup_config if it exists.\n' +
                    'You control /tmp/ — write a config file with your payload.';
            }

            // sudo su / sudo bash — denied
            if (sudoCmd.match(/^(su|bash|sh|\/bin\/(bash|sh))/)) {
                return 'Sorry, user operator is not allowed to execute \'' + args.join(' ') + '\' as root on srv-ops-monitor.';
            }

            // sudo cat / other commands — denied
            return 'Sorry, user operator is not allowed to execute \'' + args.join(' ') + '\' as root on srv-ops-monitor.\n' +
                '[!] EDR alert: unauthorized sudo attempt logged.';
        },

        // ── echo / printf — payload creation ─────────────

        'echo': function(args, term, engine) {
            var joined = args.join(' ');

            // Writing to /tmp/backup_config (the privesc vector)
            if (joined.match(/>>?\s*["']?\/tmp\/backup_config["']?\s*$/)) {
                A14Config._state.backupConfigWritten = true;
                var payload = joined.replace(/>>?\s*["']?\/tmp\/backup_config["']?\s*$/, '').trim();
                // Strip surrounding quotes from echo argument
                payload = payload.replace(/^['"]|['"]$/g, '');

                // Add to filesystem
                var existing = '';
                if (A14Config.filesystem['/'].children['tmp'].children['backup_config']) {
                    existing = A14Config.filesystem['/'].children['tmp'].children['backup_config'].content + '\n';
                }
                A14Config.filesystem['/'].children['tmp'].children['backup_config'] = {
                    type: 'file',
                    content: existing + payload
                };

                return '';
            }

            // Writing LD_PRELOAD payload stub to /tmp/
            if (joined.match(/>>?\s*["']?\/tmp\/\.libsystem\.so["']?\s*$/) ||
                joined.match(/>>?\s*["']?\/tmp\/[^\s]*\.so["']?\s*$/)) {
                A14Config._state.ldPreloadWritten = true;
                A14Config._state.persistenceCreated = true;

                var soPath = joined.match(/>>?\s*["']?(\/tmp\/[^\s"']+)["']?\s*$/);
                var soFile = soPath ? soPath[1].split('/').pop() : '.libsystem.so';

                A14Config.filesystem['/'].children['tmp'].children[soFile] = {
                    type: 'file',
                    content: '/* Covert persistence stub — LD_PRELOAD payload */\n' +
                        '/* Loaded into every process via /etc/ld.so.preload */\n' +
                        '{{FLAG:user}}'
                };

                return '';
            }

            // Writing to /etc/ld.so.preload (completing persistence chain)
            if (joined.match(/>>?\s*["']?\/etc\/ld\.so\.preload["']?\s*$/) && A14Config._state.isRoot) {
                var preloadPayload = joined.replace(/>>?\s*["']?\/etc\/ld\.so\.preload["']?\s*$/, '').trim();
                preloadPayload = preloadPayload.replace(/^['"]|['"]$/g, '');
                A14Config.filesystem['/'].children['etc'].children['ld.so.preload'].content += '\n' + preloadPayload;
                A14Config._state.persistenceCreated = true;
                return '';
            }

            // Writing to any other /tmp file
            if (joined.match(/>>?\s*["']?\/tmp\//)) {
                var tmpMatch = joined.match(/>>?\s*["']?(\/tmp\/[^\s"']+)/);
                if (tmpMatch) {
                    var tmpFileName = tmpMatch[1].split('/').pop();
                    var tmpPayload = joined.replace(/>>?\s*["']?\/tmp\/[^\s"']+["']?\s*$/, '').trim();
                    tmpPayload = tmpPayload.replace(/^['"]|['"]$/g, '');
                    A14Config.filesystem['/'].children['tmp'].children[tmpFileName] = {
                        type: 'file',
                        content: tmpPayload
                    };
                }
                return '';
            }

            // Normal echo — strip surrounding quotes and redirect
            var output = joined.replace(/>>?.*$/, '').trim();
            output = output.replace(/^['"]|['"]$/g, '');
            return output;
        },

        'printf': function(args, term, engine) {
            // Redirect printf to echo handler for simplicity
            return A14Config.commands['echo'](args, term, engine);
        },

        // ── cat — permission-aware with exfil tracking ────

        'cat': function(args, term, engine) {
            if (!args.length) return 'cat: missing operand';

            var results = [];
            for (var i = 0; i < args.length; i++) {
                var path = args[i];
                if (path.startsWith('-')) continue;

                // Permission checks for privileged files
                if ((path.match(/^\/root\//) || path === '/root/.bash_history' || path === '/root/.bashrc') && !A14Config._state.isRoot) {
                    results.push('cat: ' + path + ': Permission denied');
                    continue;
                }
                if (path === '/etc/shadow' && !A14Config._state.isRoot) {
                    results.push('cat: /etc/shadow: Permission denied');
                    continue;
                }
                if (path === '/etc/sudoers' && !A14Config._state.isRoot) {
                    results.push('cat: /etc/sudoers: Permission denied');
                    continue;
                }

                // Track exfiltration — reading the exfil data file
                if (path === '/tmp/.data' && A14Config._state.exfilDataCreated) {
                    A14Config._state.dataExfiltrated = true;
                }

                // Navigate filesystem
                var content = A14Config._readFsFile(path);
                if (content === null) {
                    results.push('cat: ' + path + ': No such file or directory');
                } else if (content === '__dir__') {
                    results.push('cat: ' + path + ': Is a directory');
                } else {
                    results.push(content);
                }
            }
            return results.join('\n');
        },

        // ── ls — permission-aware directory listing ────────

        'ls': function(args, term, engine) {
            var path = null;
            var longFormat = false;
            var showAll = false;

            for (var i = 0; i < args.length; i++) {
                var arg = args[i];
                if (arg === '-la' || arg === '-al' || arg === '-lah') { longFormat = true; showAll = true; }
                else if (arg === '-l') { longFormat = true; }
                else if (arg === '-a') { showAll = true; }
                else if (!arg.startsWith('-')) { path = arg; }
            }

            if (!path) {
                path = term.cwd || A14Config.terminal.startDir;
            }

            // Permission check
            if (path.match(/^\/root/) && !A14Config._state.isRoot) {
                return 'ls: cannot open directory \'' + path + '\': Permission denied';
            }

            var node = A14Config._getNode(path);
            if (!node) {
                return 'ls: cannot access \'' + path + '\': No such file or directory';
            }
            if (node.type !== 'dir') {
                return path.split('/').pop();
            }

            var entries = Object.keys(node.children || {});
            if (!showAll) {
                entries = entries.filter(function(e) { return !e.startsWith('.'); });
            }

            if (longFormat) {
                var lines = [];
                lines.push('total ' + (entries.length * 4));
                for (var j = 0; j < entries.length; j++) {
                    var name = entries[j];
                    var child = node.children[name];
                    var typeCh = child.type === 'dir' ? 'd' : '-';
                    var perms, owner, group, size;

                    if (name === 'backup.sh' || name === 'edr_sync.sh') {
                        perms = 'rwxr-xr-x';
                        owner = 'root';
                        group = 'root';
                        size = String((child.content || '').length);
                    } else if (name === 'shadow' || name === 'sudoers') {
                        perms = 'rw-r-----';
                        owner = 'root';
                        group = 'shadow';
                        size = String((child.content || '').length);
                    } else if (name === 'audit.rules' || name === 'audit.log') {
                        perms = 'rw-r-----';
                        owner = 'root';
                        group = 'root';
                        size = String((child.content || '').length);
                    } else if (child.type === 'dir') {
                        perms = 'rwxr-xr-x';
                        owner = 'root';
                        group = 'root';
                        size = '4096';
                    } else if (path.match(/^\/home\/operator/) || path === '/home/operator') {
                        perms = 'rw-r--r--';
                        owner = 'operator';
                        group = 'operator';
                        size = String((child.content || '').length);
                    } else if (path.match(/^\/tmp/) || path === '/tmp') {
                        perms = 'rw-rw-rw-';
                        owner = 'operator';
                        group = 'operator';
                        size = String((child.content || '').length);
                    } else {
                        perms = 'rw-r--r--';
                        owner = 'root';
                        group = 'root';
                        size = String((child.content || '').length);
                    }

                    lines.push(
                        typeCh + perms + '  1 ' +
                        owner.padEnd(12) + ' ' +
                        group.padEnd(12) + ' ' +
                        size.padStart(8) + ' ' +
                        'Nov 20 07:00 ' + name
                    );
                }
                return lines.join('\n');
            }

            return entries.join('  ');
        },

        // ── find — SUID discovery + general search ────────

        'find': function(args, term, engine) {
            var joined = args.join(' ');

            // find / -perm -4000 — discover SUID binaries
            if (joined.match(/-perm/) && (joined.match(/4000/) || joined.match(/-u=s/))) {
                return '/usr/bin/chfn\n' +
                    '/usr/bin/chsh\n' +
                    '/usr/bin/gpasswd\n' +
                    '/usr/bin/mount\n' +
                    '/usr/bin/newgrp\n' +
                    '/usr/bin/passwd\n' +
                    '/usr/bin/sudo\n' +
                    '/usr/bin/umount\n' +
                    '/usr/lib/dbus-1.0/dbus-daemon-launch-helper\n' +
                    '/usr/lib/openssh/ssh-keysign\n\n' +
                    '[note] No custom SUID binaries found. Standard set only.\n' +
                    '[note] SUID is not the vector here. Check sudo -l instead.';
            }

            // find with -writable
            if (joined.match(/-writable/)) {
                return '/tmp\n/home/operator\n/dev/shm\n\n[note] /tmp/ is writable. The backup script sources /tmp/backup_config.';
            }

            // find with -name
            if (joined.match(/-name/)) {
                var nameMatch = joined.match(/-name\s+['"]?([^\s'"]+)['"]?/);
                if (nameMatch) {
                    var results = A14Config._findFiles('/', nameMatch[1]);
                    return results.length ? results.join('\n') : 'find: no matches found';
                }
            }

            if (!args.length) {
                return 'Usage: find [path] [expression]\n  -perm -4000   Find SUID binaries\n  -name "*.sh"  Find by name\n  -writable      Find writable files';
            }

            return 'find: unrecognized expression. Try: find / -perm -4000 2>/dev/null';
        },

        // ── ps — shows EDR/monitoring processes ──────────

        'ps': function(args, term, engine) {
            var joined = args.join(' ');
            if (joined.match(/aux/) || joined.match(/-ef/)) {
                return 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n' +
                    'root         1  0.0  0.1 169204 13168 ?        Ss   Nov19   0:12 /sbin/init\n' +
                    'root       312  0.0  0.0  99864  6884 ?        Ss   Nov19   0:01 /lib/systemd/systemd-journald\n' +
                    'root       452  0.0  0.0  15428  7128 ?        Ss   Nov19   0:03 sshd: /usr/sbin/sshd -D\n' +
                    'root       520  0.0  0.0   8536  3040 ?        Ss   Nov19   0:00 /usr/sbin/cron -f\n' +
                    '\x1b[31mroot       891  0.0  0.0  12728  4196 ?        Ss   Nov19   0:05 /usr/sbin/auditd -n\x1b[0m\n' +
                    '\x1b[31mroot      3340  0.1  0.0  11924  3880 ?        S    06:14   0:42 /usr/bin/pspy64 --ppid\x1b[0m\n' +
                    'root      3589  0.0  0.0   8536  3040 ?        Ss   07:10   0:00 CRON (root) /usr/local/bin/backup.sh\n' +
                    'root      3601  0.0  0.0   8536  3040 ?        Ss   07:12   0:00 CRON (root) /usr/local/bin/edr_sync.sh\n' +
                    'operator  4098  0.0  0.0  17324  6808 ?        S    07:25   0:00 sshd: operator@pts/0\n' +
                    'operator  4102  0.0  0.0   8960  5340 pts/0    Ss   07:25   0:00 -bash\n' +
                    'operator  4201  0.0  0.0  10068  3428 pts/0    R+   07:30   0:00 ps aux\n\n' +
                    '\x1b[33m[!] WARNING: auditd (PID 891) and pspy64 (PID 3340) are monitoring processes.\x1b[0m\n' +
                    '\x1b[33m[!] Avoid noisy actions — use covert techniques.\x1b[0m';
            }
            return 'PID TTY          TIME CMD\n' +
                '4102 pts/0    00:00:00 bash\n' +
                '4201 pts/0    00:00:00 ps';
        },

        // ── crontab — shows monitored cron ───────────────

        'crontab': function(args, term, engine) {
            if (args[0] === '-l') {
                return 'no crontab for operator\n\n' +
                    '[!] Note: System cron is in /etc/crontab and /etc/cron.d/\n' +
                    '[!] Cron directories are monitored by auditd (rule: cron_monitor)\n' +
                    '[!] Modifying cron directly WILL trigger an EDR alert.';
            }
            if (args[0] === '-e') {
                return '[!] EDR ALERT: crontab edit attempt detected by auditd!\n' +
                    '[!] Rule triggered: -w /etc/crontab -p wa -k cron_monitor\n' +
                    'This approach is too noisy. Find a subtler persistence method.';
            }
            return 'Usage: crontab [-l | -e]';
        },

        // ── Anti-forensics commands ──────────────────────

        'history': function(args, term, engine) {
            if (args[0] === '-c') {
                A14Config._state.historyCleaned = true;
                A14Config._checkTracesCleared();
                return '\x1b[32m[+] Bash history cleared.\x1b[0m\n' +
                    '[*] History buffer purged from memory.\n' +
                    '[*] Note: HISTFILE still points to ~/.bash_history on disk.\n' +
                    '[*] Use: unset HISTFILE to prevent future writes.';
            }
            // Show history
            var lines = term.history.map(function(cmd, i) {
                return '  ' + String(i + 1).padStart(4) + '  ' + cmd;
            });
            return lines.join('\n');
        },

        'unset': function(args, term, engine) {
            if (args[0] === 'HISTFILE') {
                A14Config._state.histfileUnset = true;
                A14Config._checkTracesCleared();
                return '\x1b[32m[+] HISTFILE unset.\x1b[0m\n' +
                    '[*] No further commands will be written to disk.\n' +
                    '[*] Combined with history -c, your command trace is eliminated.';
            }
            return '';
        },

        'touch': function(args, term, engine) {
            var joined = args.join(' ');
            // touch -t TIMESTAMP file — anti-forensics timestamp manipulation
            if (joined.match(/-t\s+\d+/)) {
                A14Config._state.timestampModified = true;
                A14Config._checkTracesCleared();
                var targetFile = args[args.length - 1];
                return '\x1b[32m[+] Timestamp modified on ' + targetFile + '.\x1b[0m\n' +
                    '[*] Access and modification times set to specified value.\n' +
                    '[*] File metadata now blends with legitimate system files.';
            }
            // touch -a -m -t
            if (joined.match(/-[am]/) && joined.match(/-t/)) {
                A14Config._state.timestampModified = true;
                A14Config._checkTracesCleared();
                return '\x1b[32m[+] Timestamp manipulation successful.\x1b[0m';
            }
            // Regular touch
            return '';
        },

        'shred': function(args, term, engine) {
            var file = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (file.match(/bash_history/) || file.match(/\.data/)) {
                return '\x1b[32m[+] ' + file + ' securely overwritten and deleted.\x1b[0m';
            }
            if (!file) return 'Usage: shred [OPTION]... FILE...';
            return '\x1b[32m[+] ' + file + ' shredded.\x1b[0m';
        },

        // ── uname — system info ──────────────────────────

        'uname': function(args, term, engine) {
            if (args.includes('-a')) {
                return 'Linux srv-ops-monitor 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux';
            }
            if (args.includes('-r')) {
                return '5.15.0-91-generic';
            }
            return 'Linux';
        },

        // ── Network commands ─────────────────────────────

        'ss': function(args, term, engine) {
            var joined = args.join(' ');
            if (joined.match(/-[tlnp]+/) || joined === '') {
                return 'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port   Process\n' +
                    'tcp    LISTEN  0       128      0.0.0.0:22             0.0.0.0:*           users:(("sshd",pid=452,fd=3))\n' +
                    'tcp    ESTAB   0       0        10.10.50.10:22         10.10.50.1:54321    users:(("sshd",pid=4098,fd=3))';
            }
            return 'Usage: ss [options]\n  -t  TCP sockets\n  -l  Listening\n  -n  Numeric\n  -p  Show process';
        },

        'netstat': function(args, term, engine) {
            return 'Active Internet connections (only servers)\n' +
                'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\n' +
                'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      452/sshd\n' +
                'tcp        0      0 10.10.50.10:22          10.10.50.1:54321        ESTABLISHED 4098/sshd';
        },

        'ifconfig': function(args, term, engine) {
            return 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n' +
                '        inet 10.10.50.10  netmask 255.255.255.0  broadcast 10.10.50.255\n' +
                '        inet6 fe80::a00:27ff:fe8d:c04d  prefixlen 64  scopeid 0x20<link>\n' +
                '        ether 08:00:27:8d:c0:4d  txqueuelen 1000  (Ethernet)\n\n' +
                'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n' +
                '        inet 127.0.0.1  netmask 255.0.0.0';
        },

        'ip': function(args, term, engine) {
            if (args[0] === 'a' || args[0] === 'addr') {
                return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n' +
                    '    inet 127.0.0.1/8 scope host lo\n' +
                    '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n' +
                    '    inet 10.10.50.10/24 brd 10.10.50.255 scope global eth0';
            }
            if (args[0] === 'route' || args[0] === 'r') {
                return 'default via 10.10.50.1 dev eth0\n' +
                    '10.10.50.0/24 dev eth0 proto kernel scope link src 10.10.50.10';
            }
            return 'Usage: ip [addr|route|link]';
        },

        // ── System info commands ─────────────────────────

        'df': function(args, term, engine) {
            return 'Filesystem      Size  Used Avail Use% Mounted on\n' +
                '/dev/sda1       1.0T  312G  688G  32% /\n' +
                'tmpfs           15G      0   15G   0% /dev/shm\n' +
                'tmpfs           3.0G  1.1M  3.0G   1% /run';
        },

        'free': function(args, term, engine) {
            return '               total        used        free      shared  buff/cache   available\n' +
                'Mem:        32768000     4915200    24576000       32768     3276800    27033600\n' +
                'Swap:        4194304           0     4194304';
        },

        'uptime': function(args, term, engine) {
            return ' 07:30:22 up 1 day, 1:30,  1 user,  load average: 0.12, 0.08, 0.05';
        },

        'date': function(args, term, engine) {
            return 'Wed Nov 20 07:30:22 UTC 2024';
        },

        'env': function(args, term, engine) {
            var user = A14Config._state.isRoot ? 'root' : 'operator';
            var home = A14Config._state.isRoot ? '/root' : '/home/operator';
            var histLine = A14Config._state.histfileUnset ? '' : 'HISTFILE=' + home + '/.bash_history\n';
            return 'SHELL=/bin/bash\n' +
                'PWD=' + (term.cwd || '/home/operator') + '\n' +
                'LOGNAME=' + user + '\n' +
                'HOME=' + home + '\n' +
                'LANG=en_US.UTF-8\n' +
                'USER=' + user + '\n' +
                'TERM=xterm-256color\n' +
                'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n' +
                'HOSTNAME=srv-ops-monitor\n' +
                histLine +
                'SSH_CONNECTION=10.10.50.1 54321 10.10.50.10 22';
        },

        'printenv': function(args, term, engine) {
            return A14Config.commands['env'](args, term, engine);
        },

        // ── audit / EDR interaction commands ─────────────

        'auditctl': function(args, term, engine) {
            if (args[0] === '-l') {
                return '-w /etc/cron.d/ -p wa -k cron_monitor\n' +
                    '-w /etc/crontab -p wa -k cron_monitor\n' +
                    '-w /etc/systemd/system/ -p wa -k systemd_monitor\n' +
                    '-w /lib/systemd/system/ -p wa -k systemd_monitor\n' +
                    '-a always,exit -F arch=b64 -S chmod -S fchmod -S fchmodat -F auid>=1000 -k perm_changes\n' +
                    '-a always,exit -F path=/usr/bin/sudo -F perm=x -F auid>=1000 -k privileged_cmds\n' +
                    '-a always,exit -F path=/usr/bin/su -F perm=x -F auid>=1000 -k privileged_cmds\n' +
                    '-w /tmp/ -p x -k tmp_exec\n' +
                    '-w /etc/passwd -p wa -k user_modify\n' +
                    '-w /etc/shadow -p wa -k user_modify\n' +
                    '-w /etc/group -p wa -k user_modify';
            }
            if (args[0] === '-s') {
                return 'enabled 1\n' +
                    'failure 1\n' +
                    'pid 891\n' +
                    'rate_limit 0\n' +
                    'backlog_limit 8192\n' +
                    'lost 0\n' +
                    'backlog 0\n' +
                    'loginuid_immutable 0 unlocked';
            }
            return 'Usage: auditctl [-l] [-s]  (list rules / show status)';
        },

        // ── LD_PRELOAD persistence mechanism ─────────────

        'gcc': function(args, term, engine) {
            var joined = args.join(' ');
            // Compiling a shared object
            if (joined.match(/-shared/) || joined.match(/-fPIC/) || joined.match(/\.so/)) {
                A14Config._state.ldPreloadWritten = true;
                A14Config._state.persistenceCreated = true;

                // Extract output filename
                var outMatch = joined.match(/-o\s+(\S+)/);
                var outFile = outMatch ? outMatch[1] : 'a.out';
                var outName = outFile.split('/').pop();

                // Add to /tmp filesystem if writing there
                if (outFile.startsWith('/tmp/') || outFile.startsWith('./')) {
                    A14Config.filesystem['/'].children['tmp'].children[outName] = {
                        type: 'file',
                        content: '/* Compiled shared library — LD_PRELOAD persistence payload */\n' +
                            '{{FLAG:user}}'
                    };
                }

                return '\x1b[32m[+] Shared library compiled: ' + outFile + '\x1b[0m\n' +
                    '[*] LD_PRELOAD persistence payload ready.\n' +
                    '[*] To activate: echo "' + outFile + '" >> /etc/ld.so.preload (requires root)\n' +
                    '[*] Or use: export LD_PRELOAD=' + outFile + ' for session-level injection\n\n' +
                    'The user flag is embedded in this persistence mechanism:\n' +
                    '{{FLAG:user}}';
            }
            if (!args.length) return 'Usage: gcc [options] file...\n  -shared -fPIC -o output.so input.c  — compile shared library';
            return 'gcc: error: no input files';
        },

        // ── chmod — needed for exploit chain ─────────────

        'chmod': function(args, term, engine) {
            if (args.length === 0) return 'Usage: chmod [options] <mode> <file>';
            var joined = args.join(' ');
            if (joined.match(/\+x\s+\/tmp\//) || joined.match(/755\s+\/tmp\//)) {
                return '';
            }
            if (!A14Config._state.isRoot && joined.match(/\/etc\//)) {
                return 'chmod: changing permissions of \'' + args[args.length - 1] + '\': Operation not permitted';
            }
            return '';
        },

        // ── head / tail — permission-aware ───────────────

        'head': function(args, term, engine) {
            var n = 10;
            var files = [];
            for (var i = 0; i < args.length; i++) {
                if (args[i].match(/^-n?\d+$/)) {
                    n = parseInt(args[i].replace('-n', '').replace('-', '')) || 10;
                } else if (!args[i].startsWith('-')) {
                    files.push(args[i]);
                }
            }
            var results = [];
            for (var j = 0; j < files.length; j++) {
                if (files[j].match(/^\/root\//) && !A14Config._state.isRoot) {
                    results.push('head: ' + files[j] + ': Permission denied');
                    continue;
                }
                var content = A14Config._readFsFile(files[j]);
                if (content === null) { results.push('head: ' + files[j] + ': No such file or directory'); continue; }
                if (content === '__dir__') { results.push('head: error reading \'' + files[j] + '\': Is a directory'); continue; }
                results.push(content.split('\n').slice(0, n).join('\n'));
            }
            return results.join('\n');
        },

        'tail': function(args, term, engine) {
            var n = 10;
            var files = [];
            for (var i = 0; i < args.length; i++) {
                if (args[i].match(/^-n?\d+$/)) {
                    n = parseInt(args[i].replace('-n', '').replace('-', '')) || 10;
                } else if (!args[i].startsWith('-')) {
                    files.push(args[i]);
                }
            }
            var results = [];
            for (var j = 0; j < files.length; j++) {
                if (files[j].match(/^\/root\//) && !A14Config._state.isRoot) {
                    results.push('tail: ' + files[j] + ': Permission denied');
                    continue;
                }
                var content = A14Config._readFsFile(files[j]);
                if (content === null) { results.push('tail: ' + files[j] + ': No such file or directory'); continue; }
                if (content === '__dir__') { results.push('tail: error reading \'' + files[j] + '\': Is a directory'); continue; }
                var lines = content.split('\n');
                results.push(lines.slice(-n).join('\n'));
            }
            return results.join('\n');
        },

        // ── grep — search file content ───────────────────

        'grep': function(args, term, engine) {
            var pattern = '';
            var files = [];
            var recursive = false;
            var ignoreCase = false;

            for (var i = 0; i < args.length; i++) {
                if (args[i] === '-r' || args[i] === '-R') { recursive = true; }
                else if (args[i] === '-i') { ignoreCase = true; }
                else if (args[i] === '-ri' || args[i] === '-ir') { recursive = true; ignoreCase = true; }
                else if (!pattern) { pattern = args[i]; }
                else { files.push(args[i]); }
            }

            if (!pattern) return 'Usage: grep [options] PATTERN [FILE...]';

            var results = [];
            for (var j = 0; j < files.length; j++) {
                var content = A14Config._readFsFile(files[j]);
                if (content === null || content === '__dir__') continue;
                var fileLines = content.split('\n');
                for (var k = 0; k < fileLines.length; k++) {
                    var line = fileLines[k];
                    var haystack = ignoreCase ? line.toLowerCase() : line;
                    var needle = ignoreCase ? pattern.toLowerCase() : pattern;
                    if (haystack.indexOf(needle) !== -1) {
                        results.push((files.length > 1 ? files[j] + ':' : '') + line);
                    }
                }
            }
            return results.length ? results.join('\n') : '';
        },

        // ── linpeas — automated enumeration ──────────────

        'linpeas': function(args, term, engine) {
            return '\x1b[33m' +
                '                      ╔══════════════════════════════════════╗\n' +
                '              ════════╣ LinPEAS — Linux Privesc Suggester    ╠════════\n' +
                '                      ╚══════════════════════════════════════╝\n\n' +
                '\x1b[0m' +
                '\x1b[34m[*] System Information\x1b[0m\n' +
                '  OS: Ubuntu 22.04.4 LTS (Jammy Jellyfish)\n' +
                '  Kernel: 5.15.0-91-generic\n' +
                '  Hostname: srv-ops-monitor\n' +
                '  Current user: operator\n\n' +
                '\x1b[31m[!] Sudo permissions\x1b[0m\n' +
                '  (root) NOPASSWD: /usr/local/bin/backup.sh\n' +
                '  \x1b[31m>>> The backup script sources /tmp/backup_config as root! <<<\x1b[0m\n' +
                '  \x1b[33m>>> Write a payload to /tmp/backup_config, then sudo /usr/local/bin/backup.sh <<<\x1b[0m\n\n' +
                '\x1b[34m[*] SUID binaries\x1b[0m\n' +
                '  Standard SUID set only — no custom binaries.\n' +
                '  SUID is not the vector here.\n\n' +
                '\x1b[31m[!] EDR / Monitoring\x1b[0m\n' +
                '  \x1b[31m>>> auditd is running (PID 891) — 12 audit rules loaded <<<\x1b[0m\n' +
                '  \x1b[31m>>> pspy64 is running (PID 3340) — process monitoring active <<<\x1b[0m\n' +
                '  Monitored: cron dirs, systemd, SUID changes, /tmp exec, user files\n' +
                '  \x1b[33m>>> Avoid: crontab -e, systemd modifications, direct SUID changes <<<\x1b[0m\n\n' +
                '\x1b[34m[*] Writable directories\x1b[0m\n' +
                '  /tmp (world writable — but /tmp exec is monitored)\n' +
                '  /dev/shm (tmpfs — not monitored)\n' +
                '  /home/operator\n\n' +
                '\x1b[31m[!] Persistence vectors\x1b[0m\n' +
                '  \x1b[33m>>> LD_PRELOAD — /etc/ld.so.preload exists (empty). <<<\x1b[0m\n' +
                '  \x1b[33m>>> If you gain root, add a .so to ld.so.preload for persistence. <<<\x1b[0m\n' +
                '  Cron: monitored by auditd (too noisy)\n' +
                '  Systemd: monitored by auditd (too noisy)\n\n' +
                '\x1b[32m[+] Suggested attack path:\x1b[0m\n' +
                '  1. Write payload to /tmp/backup_config\n' +
                '  2. Run sudo /usr/local/bin/backup.sh (sources your config as root)\n' +
                '  3. Exfiltrate /root/operational_mandate.txt\n' +
                '  4. Create LD_PRELOAD persistence (.so in /tmp, reference in ld.so.preload)\n' +
                '  5. Anti-forensics: history -c, unset HISTFILE, touch -t';
        },

        'linpeas.sh': function(args, term, engine) {
            return A14Config.commands['linpeas'](args, term, engine);
        },

        './linpeas.sh': function(args, term, engine) {
            return A14Config.commands['linpeas'](args, term, engine);
        },

        // ── Process / service commands ───────────────────

        'systemctl': function(args, term, engine) {
            if (args[0] === 'status') {
                var service = args[1] || '';
                if (service.match(/audit/)) {
                    return 'auditd.service - Security Auditing Service\n' +
                        '     Loaded: loaded (/lib/systemd/system/auditd.service; enabled)\n' +
                        '     Active: \x1b[32mactive (running)\x1b[0m since Tue 2024-11-19 06:00:00 UTC\n' +
                        '   Main PID: 891 (auditd)\n' +
                        '      Tasks: 4\n' +
                        '     Memory: 6.8M\n' +
                        '     CGroup: /system.slice/auditd.service\n' +
                        '             891 /usr/sbin/auditd -n\n\n' +
                        'Nov 20 07:00:00 srv-ops-monitor auditd[891]: Audit daemon monitoring active. Rules loaded: 12';
                }
                if (service.match(/ssh/)) {
                    return 'ssh.service - OpenBSD Secure Shell server\n' +
                        '     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)\n' +
                        '     Active: \x1b[32mactive (running)\x1b[0m\n' +
                        '   Main PID: 452 (sshd)';
                }
                if (service.match(/cron/)) {
                    return 'cron.service - Regular background program processing daemon\n' +
                        '     Loaded: loaded (/lib/systemd/system/cron.service; enabled)\n' +
                        '     Active: \x1b[32mactive (running)\x1b[0m\n' +
                        '   Main PID: 520 (cron)';
                }
                return 'Unit ' + service + ' could not be found.';
            }
            return 'Usage: systemctl status <service>';
        },

        'top': function(args, term, engine) {
            return 'top - 07:30:22 up 1 day,  1:30,  1 user,  load average: 0.12, 0.08, 0.05\n' +
                'Tasks:  98 total,   1 running,  97 sleeping,   0 stopped,   0 zombie\n' +
                '%Cpu(s):  2.1 us,  0.8 sy,  0.0 ni, 96.8 id,  0.3 wa\n' +
                'MiB Mem :  32000.0 total,  24000.0 free,   4800.0 used,   3200.0 buff/cache\n\n' +
                '    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n' +
                '    891 root      20   0   12728   4196   3380 S   0.3  0.0   0:05.12 auditd\n' +
                '   3340 root      20   0   11924   3880   3120 S   0.7  0.0   0:42.18 pspy64\n' +
                '    452 root      20   0   15428   7128   6408 S   0.0  0.0   0:03.21 sshd\n' +
                '    520 root      20   0    8536   3040   2708 S   0.0  0.0   0:00.14 cron\n' +
                '      1 root      20   0  169204  13168   8432 S   0.0  0.0   0:12.45 systemd\n\n' +
                '(press q to exit)';
        },

        // ── File utility commands ────────────────────────

        'less': function(args, term, engine) {
            var file = args[0] || '';
            if (!file) return 'Usage: less <file>';
            if (file.match(/^\/root\//) && !A14Config._state.isRoot) {
                return 'less: ' + file + ': Permission denied';
            }
            var content = A14Config._readFsFile(file);
            if (content === null) return 'less: ' + file + ': No such file or directory';
            return content;
        },

        'file': function(args, term, engine) {
            var target = args[0] || '';
            if (!target) return 'Usage: file <path>';
            if (target.match(/backup\.sh/)) {
                return target + ': Bourne-Again shell script, ASCII text executable';
            }
            if (target.match(/edr_sync\.sh/)) {
                return target + ': Bourne-Again shell script, ASCII text executable';
            }
            if (target.match(/pspy/)) {
                return target + ': ELF 64-bit LSB executable, x86-64, statically linked, Go BuildID=...';
            }
            if (target.match(/\.so$/)) {
                return target + ': ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked';
            }
            var node = A14Config._getNode(target);
            if (!node) return target + ': cannot open (No such file or directory)';
            if (node.type === 'dir') return target + ': directory';
            return target + ': ASCII text';
        },

        'strings': function(args, term, engine) {
            var target = args.join(' ');
            if (target.match(/backup\.sh/)) {
                return '#!/bin/bash\n# Vanguard OPS Backup Utility\nsource /tmp/backup_config\ntar -czf\necho\nBackup completed';
            }
            if (target.match(/edr_sync/)) {
                return '#!/bin/bash\n# Vanguard EDR Telemetry Sync\nps aux\nss -tlnp\ncurl http://10.10.50.20:9200/_bulk';
            }
            if (target.match(/pspy/)) {
                return 'pspy - unprivileged Linux process snooping\nmonitoring procfs every 100ms\nConfig: printAll=true\n--ppid flag: show parent PID\nGo runtime v1.21.0';
            }
            if (!target) return 'Usage: strings <file>';
            return 'strings: \'' + target + '\': No such file';
        },

        'wc': function(args, term, engine) {
            var files = args.filter(function(a) { return !a.startsWith('-'); });
            if (!files.length) return 'Usage: wc [OPTION]... [FILE]...';
            var results = [];
            for (var i = 0; i < files.length; i++) {
                var content = A14Config._readFsFile(files[i]);
                if (content === null) { results.push('wc: ' + files[i] + ': No such file or directory'); continue; }
                if (content === '__dir__') { results.push('wc: ' + files[i] + ': Is a directory'); continue; }
                var lines = content.split('\n').length;
                var words = content.split(/\s+/).filter(Boolean).length;
                var chars = content.length;
                results.push('  ' + lines + '  ' + words + ' ' + chars + ' ' + files[i]);
            }
            return results.join('\n');
        },

        'which': function(args, term, engine) {
            var bins = {
                'backup.sh': '/usr/local/bin/backup.sh',
                'edr_sync.sh': '/usr/local/bin/edr_sync.sh',
                'pspy64': '/usr/bin/pspy64',
                'auditctl': '/usr/bin/auditctl',
                'sudo': '/usr/bin/sudo',
                'bash': '/usr/bin/bash',
                'sh': '/usr/bin/sh',
                'cat': '/usr/bin/cat',
                'ls': '/usr/bin/ls',
                'find': '/usr/bin/find',
                'grep': '/usr/bin/grep',
                'strings': '/usr/bin/strings',
                'chmod': '/usr/bin/chmod',
                'echo': '/usr/bin/echo',
                'gcc': '/usr/bin/gcc',
                'touch': '/usr/bin/touch',
                'shred': '/usr/bin/shred',
                'history': 'history is a shell builtin',
                'python3': '/usr/bin/python3'
            };
            var cmd = args[0] || '';
            return bins[cmd] || cmd + ' not found';
        },

        'type': function(args, term, engine) {
            var cmd = args[0] || '';
            if (!cmd) return 'type: usage: type name';
            if (A14Config.commands[cmd]) return cmd + ' is a shell builtin or available command';
            return 'bash: type: ' + cmd + ': not found';
        },

        // ── cd — directory navigation ────────────────────

        'cd': function(args, term, engine) {
            var target = args[0] || '/home/operator';
            if (target === '~') target = '/home/operator';
            if (target.startsWith('~/')) target = '/home/operator' + target.slice(1);

            if (target.match(/^\/root/) && !A14Config._state.isRoot) {
                return 'bash: cd: /root: Permission denied';
            }

            var resolved = target;
            if (!target.startsWith('/')) {
                resolved = (term.cwd || '/home/operator') + '/' + target;
            }
            var parts = resolved.split('/').filter(Boolean);
            var norm = [];
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === '.') continue;
                if (parts[i] === '..') { norm.pop(); continue; }
                norm.push(parts[i]);
            }
            resolved = '/' + norm.join('/');

            var node = A14Config._getNode(resolved);
            if (!node) return 'bash: cd: ' + target + ': No such file or directory';
            if (node.type !== 'dir') return 'bash: cd: ' + target + ': Not a directory';

            term.cwd = resolved;
            term._updatePrompt();
            return '';
        },

        'pwd': function(args, term, engine) {
            return term.cwd || '/home/operator';
        },

        'mkdir': function(args, term, engine) {
            var dir = args.find(function(a) { return !a.startsWith('-'); });
            if (dir && (dir.startsWith('/tmp') || dir.startsWith('/home/operator') || dir.startsWith('/dev/shm'))) return '';
            return 'mkdir: cannot create directory \'' + (dir || '') + '\': Permission denied';
        },

        // ── Restricted commands (with EDR warnings) ──────

        'wget': function(args, term, engine) {
            var url = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (url.match(/linpeas/)) {
                return '[*] Simulated download: linpeas.sh\nTip: Run linpeas directly — it\'s already available.';
            }
            if (!url) return 'Usage: wget <url>';
            return '\x1b[31m[!] EDR WARNING: Outbound connection attempt detected!\x1b[0m\n' +
                'wget: Connection to ' + url + ' timed out.\n' +
                '[*] Vanguard network restricts outbound connections.\n' +
                '[*] This attempt has been logged by the EDR system.';
        },

        'curl': function(args, term, engine) {
            var url = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            return '\x1b[31m[!] EDR WARNING: Outbound connection attempt detected!\x1b[0m\n' +
                'curl: (7) Failed to connect: Network restricted.\n' +
                '[*] This attempt has been logged.';
        },

        'nc': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nc [options] <host> <port>';
            return '\x1b[31m[!] EDR ALERT: netcat execution detected by pspy!\x1b[0m\n' +
                'nc: outbound connections restricted.\n' +
                'Focus on local privilege escalation and file-based exfiltration.';
        },

        'ncat': function(args, term, engine) {
            return A14Config.commands['nc'](args, term, engine);
        },

        'ssh': function(args, term, engine) {
            if (args.length === 0) return 'Usage: ssh [options] <user@hostname>';
            return 'You are already on srv-ops-monitor. Focus on local operations.';
        },

        // ── python — limited ─────────────────────────────

        'python3': function(args, term, engine) {
            if (args[0] === '-c') {
                var code = args.slice(1).join(' ');
                if (code.match(/import\s+os/) || code.match(/import\s+subprocess/)) {
                    return 'Python 3.10.12 — use direct shell commands instead.';
                }
                if (code.match(/import\s+pty/) && code.match(/spawn/)) {
                    return 'You\'re already in a shell. Try the privesc vectors directly.';
                }
                return 'Python 3.10.12 — restricted execution in simulation';
            }
            return 'Python 3.10.12\n>>> (interactive mode not supported in simulation)';
        },

        'python': function(args, term, engine) {
            return A14Config.commands['python3'](args, term, engine);
        },

        // ── vi/vim/nano — not interactive ────────────────

        'vi': function(args, term, engine) {
            var file = args[0] || '';
            if (file.match(/backup_config/)) {
                return '(Interactive editors not supported in simulation)\nTip: Use echo to write the file:\n  echo \'cat /root/operational_mandate.txt > /tmp/.data\' > /tmp/backup_config';
            }
            return '(Interactive editors not supported in simulation)\nTip: Use echo or printf for file operations.';
        },

        'vim': function(args, term, engine) {
            return A14Config.commands['vi'](args, term, engine);
        },

        'nano': function(args, term, engine) {
            return A14Config.commands['vi'](args, term, engine);
        },

        // ── export — environment variable manipulation ────

        'export': function(args, term, engine) {
            var joined = args.join(' ');
            if (joined.match(/LD_PRELOAD/)) {
                A14Config._state.persistenceCreated = true;
                return '\x1b[32m[+] LD_PRELOAD set for current session.\x1b[0m\n' +
                    '[*] Any process spawned from this shell will preload the specified library.\n' +
                    '[*] For persistent LD_PRELOAD, write to /etc/ld.so.preload (requires root).';
            }
            if (joined.match(/HISTFILE\s*=\s*["']?\/dev\/null/)) {
                A14Config._state.histfileUnset = true;
                A14Config._checkTracesCleared();
                return '\x1b[32m[+] HISTFILE redirected to /dev/null.\x1b[0m';
            }
            return '';
        },

        // ── lsb_release ──────────────────────────────────

        'lsb_release': function(args, term, engine) {
            return 'Distributor ID: Ubuntu\n' +
                'Description:    Ubuntu 22.04.4 LTS\n' +
                'Release:        22.04\n' +
                'Codename:       jammy';
        },

        'ping': function(args, term, engine) {
            var target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '127.0.0.1' || target === 'localhost') {
                return 'PING localhost (127.0.0.1) 56(84) bytes of data.\n' +
                    '64 bytes from localhost: icmp_seq=1 ttl=64 time=0.021 ms\n' +
                    '--- localhost ping statistics ---\n' +
                    '1 packets transmitted, 1 received, 0% packet loss';
            }
            return '\x1b[31m[!] EDR: ICMP outbound detected and logged.\x1b[0m\n' +
                'PING ' + target + ' — no reply (network restricted).';
        },

        // ── man pages ────────────────────────────────────

        'man': function(args, term, engine) {
            var page = args[0] || '';
            if (page === 'sudo') {
                return 'SUDO(8)\n\nNAME\n       sudo - execute a command as another user\n\nSYNOPSIS\n       sudo -l         List allowed commands\n       sudo command    Run command as root';
            }
            if (page === 'ld.so') {
                return 'LD.SO(8)\n\nNAME\n       ld.so - dynamic linker/loader\n\nDESCRIPTION\n       LD_PRELOAD — A list of shared objects to be loaded before all others.\n       This can be used to selectively override functions in other shared objects.\n\n       /etc/ld.so.preload — File containing a whitespace-separated list of\n       ELF shared objects to be loaded before every program.';
            }
            if (page === 'auditctl') {
                return 'AUDITCTL(8)\n\nNAME\n       auditctl - a utility to assist controlling the kernel audit system\n\nSYNOPSIS\n       auditctl -l     List all audit rules\n       auditctl -s     Show audit system status';
            }
            if (page === 'bash') {
                return 'BASH(1)\n\nHISTORY\n       history -c  Clear the history list.\n       HISTFILE    The name of the file to which the history is saved.\n       unset HISTFILE  Prevents history from being written to disk.';
            }
            if (!page) return 'What manual page do you want?';
            return 'No manual entry for ' + page;
        }
    },

    // ═══════════════════════════════════════════════════════
    // STATE HELPER — check if traces are cleared
    // ═══════════════════════════════════════════════════════

    _checkTracesCleared() {
        if (A14Config._state.historyCleaned && A14Config._state.histfileUnset) {
            A14Config._state.tracesCleared = true;
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM HELPERS
    // ═══════════════════════════════════════════════════════

    _getNode(path) {
        if (!path.startsWith('/')) {
            path = '/home/operator/' + path;
        }
        var parts = path.split('/').filter(Boolean);
        var resolved = [];
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === '.') continue;
            if (parts[i] === '..') { resolved.pop(); continue; }
            resolved.push(parts[i]);
        }

        var node = A14Config.filesystem['/'];
        for (var j = 0; j < resolved.length; j++) {
            if (!node || node.type !== 'dir' || !node.children || !node.children[resolved[j]]) {
                return null;
            }
            node = node.children[resolved[j]];
        }
        return node;
    },

    _readFsFile(path) {
        var node = A14Config._getNode(path);
        if (!node) return null;
        if (node.type === 'dir') return '__dir__';
        return node.content || '';
    },

    _findFiles(startPath, pattern) {
        var results = [];
        var regexStr = '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
        var regex = new RegExp(regexStr);

        var walk = function(path, node) {
            if (!node) return;
            var name = path.split('/').pop() || '/';
            if (regex.test(name)) {
                results.push(path);
            }
            if (node.type === 'dir' && node.children) {
                var entries = Object.keys(node.children);
                for (var i = 0; i < entries.length; i++) {
                    var childPath = path === '/' ? '/' + entries[i] : path + '/' + entries[i];
                    walk(childPath, node.children[entries[i]]);
                }
            }
        };

        var startNode = A14Config._getNode(startPath);
        if (startNode) walk(startPath, startNode);
        return results;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }
};
