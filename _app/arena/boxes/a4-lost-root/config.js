/* ============================================================
   CTF ARENA — Box A4: The Lost Root
   Linux Privilege Escalation | Citadel Maintenance
   Config: filesystem, privesc vectors, flags, hints, lore
   Three attack paths: sudo+less, SUID PATH injection, cron abuse
   ============================================================ */

const A4Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Lost Root',
    subtitle: 'Linux Privilege Escalation — Citadel Maintenance',
    difficulty: 'Intermediate',
    accent: '#f39c12',
    storageKey: 'hexworth_ctf_a4',
    trackerKey: 'ctf_a4',

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'PT0-002',
        mappings: [
            // Reconnaissance
            { flagId: null,   phase: 'recon',      objective: '3.1',  description: 'Given a scenario, apply attacks and exploits — Network Scanning', skill: 'Port Enumeration with nmap' },
            { flagId: null,   phase: 'recon',      objective: '3.2',  description: 'Given a scenario, perform post-exploitation techniques — OS fingerprinting', skill: 'OS & Service Fingerprinting' },
            // Enumeration
            { flagId: null,   phase: 'enumeration', objective: '3.3', description: 'Given a scenario, use appropriate tools to perform a penetration test — Manual enumeration', skill: 'Linux User & Group Enumeration (T1087)' },
            { flagId: null,   phase: 'enumeration', objective: '3.1', description: 'Given a scenario, apply attacks and exploits — Service discovery', skill: 'Running Service Identification' },
            // Initial Access → user flag
            { flagId: 'user', phase: 'access',      objective: '3.1', description: 'Given a scenario, apply attacks and exploits — Credential-based access', skill: 'Linux Initial Access via Misconfigured sudo (T1078)' },
            // Privilege Escalation → root flag
            { flagId: 'root', phase: 'privesc',     objective: '3.1', description: 'Given a scenario, apply attacks and exploits — Privilege escalation', skill: 'SUID Binary PATH Hijacking (T1548.001)' },
            { flagId: 'root', phase: 'privesc',     objective: '3.1', description: 'Given a scenario, apply attacks and exploits — Privilege escalation', skill: 'Writable Cron Script Injection' },
            { flagId: 'root', phase: 'privesc',     objective: '3.1', description: 'Given a scenario, apply attacks and exploits — GTFOBins escape', skill: 'sudo less Shell Escape (T1548.001)' },
            // CompTIA Security+ SY0-701 crossover
            { flagId: 'user', phase: 'access',      objective: '4.3', description: 'SY0-701: Explain the importance of security policies — Least privilege', skill: 'Identifying Overly Permissive sudo Rules' },
            { flagId: 'root', phase: 'privesc',     objective: '4.1', description: 'SY0-701: Apply common security techniques — SUID hardening', skill: 'SUID Misuse & Filesystem Hardening' },
            // CompTIA Linux+ XK0-005 crossover
            { flagId: null,   phase: 'enumeration', objective: 'L1',  description: 'XK0-005: Manage Linux security — File permissions and SUID', skill: 'Linux Special Permission Bits (SUID/SGID/Sticky)' },
            { flagId: 'root', phase: 'privesc',     objective: 'L2',  description: 'XK0-005: Manage Linux security — cron job security', skill: 'Scheduled Task Abuse & Hardening' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Scan the target to discover open ports and running services. Build a map of the attack surface.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.001'],
            unlocks: ['enumeration'],
            locked: false
        },
        {
            id: 'enumeration',
            name: 'Enumeration',
            icon: '\uD83D\uDCCB',
            description: 'Enumerate users, groups, SUID binaries, sudo permissions, and scheduled tasks. Every misconfiguration is a potential vector.',
            requiredFlags: [],
            mitre: ['T1087.001', 'T1057', 'T1083'],
            unlocks: ['access'],
            locked: true
        },
        {
            id: 'access',
            name: 'Initial Access',
            icon: '\uD83D\uDD13',
            description: 'Leverage an existing low-privilege account to gain a foothold on the system. Read the user flag.',
            requiredFlags: [],
            mitre: ['T1078', 'T1021.004'],
            unlocks: ['privesc'],
            locked: true
        },
        {
            id: 'privesc',
            name: 'Privilege Escalation',
            icon: '\uD83D\uDD17',
            description: 'Escalate from citadel_maint to root. Three paths exist: sudo GTFOBins escape, SUID PATH injection, or writable cron job. Choose your method.',
            requiredFlags: ['user'],
            mitre: ['T1548.001', 'T1053.003', 'T1068'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE (Linux target — NOT attacker box)
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Citadel Core Systems BIOS v3.8.2',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
            'Loading bootloader...',
            'GRUB loading kernel...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS (Citadel Core)',
            'Ubuntu 22.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'citadel_maint'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS (no browser — terminal-focused box)
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
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'citadel_maint',
        hostname: 'citadel-core',
        startDir: '/home/citadel_maint',
        welcome: 'Ubuntu 22.04.3 LTS (Citadel Core Systems)\n\nWelcome citadel_maint. You have limited access.\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // STATE MACHINE
    // ═══════════════════════════════════════════════════════

    _state: {
        isRoot: false,
        inLess: false,
        cronModified: false,
        pathInjected: false,
        tmpDateWritten: false,
        escalationMethod: null
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{c1t4d3l_m41nt_4cc3ss_gr4nt3d}', points: 100 },
        { id: 'root', value: 'flag{l0st_r00t_pr1v3sc_c0mpl3t3}', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 }  // 20 minutes
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            phase: 'recon',
            text: "Start with basic enumeration: whoami, id, sudo -l. Check what privileges you already have. Then scan open ports with: ss -tlnp",
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            phase: 'enumeration',
            text: "Look for SUID binaries with: find / -perm -4000 2>/dev/null. Custom SUID binaries owned by root are often exploitable. Also check: find / -writable -type f 2>/dev/null",
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            phase: 'enumeration',
            text: "Check for writable cron jobs: cat /etc/crontab then ls -la the script paths. The backup script runs every 5 minutes as root. Also try linpeas for automated enumeration of all three vectors.",
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            phase: 'privesc',
            text: "Three paths to root: (1) sudo less /var/log/syslog then type !/bin/bash inside the pager, (2) strings /usr/local/bin/statuscheck reveals it calls 'date' without a full path — inject /tmp/date and set PATH=/tmp:$PATH, (3) echo 'chmod u+s /bin/bash' >> /opt/maintenance/backup.sh then run bash -p after cron fires.",
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Citadel Core Systems are the backbone of a private infrastructure network. You\'ve been handed credentials for a low-privilege maintenance account — citadel_maint. The real prize is root. Three misconfigured privilege pathways are hidden inside the system. Find them. Exploit one. Own the machine.',
        scenario: 'A sysadmin at Citadel Infrastructure Division gave the maintenance team "just enough" sudo access to review logs — but used the NOPASSWD flag without reading the GTFOBins implications. A junior developer compiled a SUID binary for health checks and forgot that calling system binaries without full paths is a critical flaw. A contractor wrote the backup script with world-write permissions, and nobody audited it. Three separate human failures. Three attack vectors. All on one box.',
        outro: 'The Lost Root has been found. From a lowly maintenance account on the Citadel\'s core systems, you escalated your privileges to root. Whether through sudo misconfiguration, SUID exploitation, or cron job abuse — the Citadel\'s defenses have been breached from within.',
        ecer: {
            executive: 'No periodic security audit of sudo rules, SUID binaries, or cron job permissions — three separate misconfigs survived for months undetected',
            culture: 'Speed of deployment prioritized over security review. The contractor who wrote backup.sh never had their work audited. Nobody owned the SUID binary lifecycle.',
            employee: 'Three separate engineering mistakes: (1) sysadmin used NOPASSWD without checking GTFOBins impact, (2) developer forgot full-path syscalls in a root-owned SUID binary, (3) contractor wrote world-writable root cron script',
            regulatory: 'CIS Benchmark L1 controls (sudo hardening, SUID auditing, cron permission controls) were not enforced. No automated compliance scanning was in place.'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (target Linux machine)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'citadel_maint': {
                            type: 'dir',
                            children: {
                                'user.txt': {
                                    type: 'file',
                                    content: 'flag{c1t4d3l_m41nt_4cc3ss_gr4nt3d}'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== CITADEL MAINTENANCE NOTES ===\n\nMaintenance access granted per ticket #CT-4491.\nCheck system health regularly.\n\nDaily tasks:\n- Review /var/log/syslog for anomalies\n- Verify backup script output in /var/log/backup.log\n- Run /usr/local/bin/statuscheck for quick system overview\n\nRemember: you have limited sudo access.\nUse sudo -l to check your permissions.\n\nContact sysadmin@citadel-core.internal for escalation requests.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls -la\ncat notes.txt\nsudo -l\nless /var/log/syslog\nstatuscheck\ncat /etc/crontab\nls -la /opt/maintenance/\nfind / -perm -4000 2>/dev/null\nps aux\nss -tlnp'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc: executed by bash for non-login shells.\n\n# If not running interactively, don\'t do anything\ncase $- in\n    *i*) ;;\n      *) return;;\nesac\n\n# Aliases\nalias ll=\'ls -la\'\nalias la=\'ls -A\'\nalias l=\'ls -CF\'\nalias status=\'/usr/local/bin/statuscheck\''
                                },
                                '.profile': {
                                    type: 'file',
                                    content: '# ~/.profile: executed by the command interpreter for login shells.\nif [ -n "$BASH_VERSION" ]; then\n    if [ -f "$HOME/.bashrc" ]; then\n        . "$HOME/.bashrc"\n    fi\nfi\nPATH="$HOME/bin:$HOME/.local/bin:$PATH"'
                                },
                                '.ssh': {
                                    type: 'dir',
                                    children: {
                                        'known_hosts': {
                                            type: 'file',
                                            content: '# Decoy: SSH known_hosts — these connections are outbound only\ncitadel-gateway,10.10.14.1 ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBH...\ncitadel-db,10.10.14.10 ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBK...'
                                        },
                                        'id_rsa': {
                                            type: 'file',
                                            content: '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAA[DECOY — this key is passphrase-protected and only\nauthenticates to citadel-gateway for log review. It does not grant elevated\nprivileges on this machine. Root access is not achievable via SSH pivoting here.]\n-----END OPENSSH PRIVATE KEY-----'
                                        },
                                        'id_rsa.pub': {
                                            type: 'file',
                                            content: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... citadel_maint@citadel-core\n# Decoy: public key for citadel-gateway log-review access only'
                                        },
                                        'config': {
                                            type: 'file',
                                            content: '# SSH client config\nHost citadel-gateway\n    HostName 10.10.14.1\n    User log_reviewer\n    IdentityFile ~/.ssh/id_rsa\n    Port 22\n\n# NOTE: Log review access only — no privilege escalation path here'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'audit_helper.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Citadel Audit Helper — v0.3\n# Runs basic checks for the maintenance team\n# DECOY: This script is read-only and runs as citadel_maint\n# It does NOT run as root and has no sudo wrapper\n\necho "=== System Audit Report ==="\necho "Date: $(date)"\necho "User: $(whoami)"\necho ""\necho "--- Memory Usage ---"\nfree -h\necho ""\necho "--- Disk Usage ---"\ndf -h /\necho ""\necho "Audit complete. For elevated checks, contact sysadmin@citadel-core.internal"'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'root': {
                    type: 'dir',
                    children: {
                        'root.txt': {
                            type: 'file',
                            content: 'flag{l0st_r00t_pr1v3sc_c0mpl3t3}'
                        },
                        '.bash_history': {
                            type: 'file',
                            content: 'apt update && apt upgrade -y\nsystemctl restart apache2\nmysql -u root -p citadel_db < /backup/schema.sql\nchmod 4755 /usr/local/bin/statuscheck\nchown root:root /usr/local/bin/statuscheck\ncrontab -l\ncat /opt/maintenance/backup.sh\nuseradd -m citadel_maint\nusermod -aG sudo citadel_maint\nvisudo\n# Gave citadel_maint limited sudo for less on logs\n# TODO: review permissions — is this too permissive?'
                        },
                        '.bashrc': {
                            type: 'file',
                            content: '# ~/.bashrc: executed by bash for non-login shells.\nexport HISTCONTROL=ignoredups:ignorespace\nalias ll=\'ls -la\'\nalias grep=\'grep --color=auto\''
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:65534:sync:/bin:/bin/sync\ngames:x:5:60:games:/usr/games:/usr/sbin/nologin\nman:x:6:12:man:/var/cache/man:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nsystemd-network:x:100:102:systemd Network Management:/run/systemd:/usr/sbin/nologin\nsystemd-resolve:x:101:103:systemd Resolver:/run/systemd:/usr/sbin/nologin\nsyslog:x:102:106::/home/syslog:/usr/sbin/nologin\nmessagebus:x:103:107::/nonexistent:/usr/sbin/nologin\n_apt:x:104:65534::/nonexistent:/usr/sbin/nologin\nsshd:x:105:65534::/run/sshd:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nmysql:x:27:27:MySQL Server:/var/lib/mysql:/bin/false\ncitadel_maint:x:1001:1001:Citadel Maintenance:/home/citadel_maint:/bin/bash'
                        },
                        'shadow': {
                            type: 'file',
                            content: 'root:$6$rXk3Y2Hw$J3Qv8K9zLp.../...truncated:19720:0:99999:7:::\ncitadel_maint:$6$Mn4p8YxQ$Hd7Wk2Rv.../...truncated:19720:0:99999:7:::'
                        },
                        'hostname': {
                            type: 'file',
                            content: 'citadel-core'
                        },
                        'crontab': {
                            type: 'file',
                            content: '# /etc/crontab: system-wide crontab\n# Unlike any other crontab you don\'t have to run the `crontab\'\n# command to install the new version when you edit this file\n# and files in /etc/cron.d. These files also have username\n# fields, that none of the other crontabs do.\n\nSHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n\n# m h dom mon dow user  command\n17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly\n25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )\n47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )\n52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )\n*/5 * * * *     root    /opt/maintenance/backup.sh'
                        },
                        'os-release': {
                            type: 'file',
                            content: 'PRETTY_NAME="Ubuntu 22.04.3 LTS"\nNAME="Ubuntu"\nVERSION_ID="22.04"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"\nVERSION_CODENAME=jammy\nID=ubuntu\nID_LIKE=debian\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"\nBUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"'
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1       localhost\n127.0.1.1       citadel-core\n10.10.14.1      citadel-gateway\n10.10.14.5      citadel-core\n10.10.14.10     citadel-db\n\n# The following lines are desirable for IPv6 capable hosts\n::1     ip6-localhost ip6-loopback\nfe00::0 ip6-localnet\nff00::0 ip6-mcastprefix\nff02::1 ip6-allnodes\nff02::2 ip6-allrouters'
                        },
                        'sudoers': {
                            type: 'file',
                            content: '# This file MUST be edited with \'visudo\'.\n# See sudoers(5) for more information.\n\nDefaults        env_reset\nDefaults        mail_badpass\nDefaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"\n\n# Root can do anything\nroot    ALL=(ALL:ALL) ALL\n\n# Members of the admin group may gain root privileges\n%admin ALL=(ALL) ALL\n\n# Members of the sudo group\n%sudo   ALL=(ALL:ALL) ALL\n\n# Citadel maintenance — limited access for log review\ncitadel_maint ALL=(ALL) NOPASSWD: /usr/bin/less /var/log/*'
                        },
                        'cron.d': {
                            type: 'dir',
                            children: {
                                'security-audit': {
                                    type: 'file',
                                    content: '# /etc/cron.d/security-audit\n# Decoy: Runs as www-data, NOT root\n# This cannot be used for privilege escalation\n0 3 * * * www-data /usr/local/bin/audit_check.sh 2>/dev/null\n\n# Note: audit_check.sh checks file integrity only — no shell spawning'
                                },
                                'logrotate-extra': {
                                    type: 'file',
                                    content: '# /etc/cron.d/logrotate-extra\n# Runs as syslog user — not exploitable\n30 2 * * * syslog /usr/sbin/logrotate /etc/logrotate.conf > /dev/null 2>&1'
                                }
                            }
                        },
                        'nginx': {
                            type: 'dir',
                            children: {
                                'nginx.conf': {
                                    type: 'file',
                                    content: 'user www-data;\nworker_processes auto;\npid /run/nginx.pid;\n\nevents {\n    worker_connections 768;\n}\n\nhttp {\n    sendfile on;\n    tcp_nopush on;\n    types_hash_max_size 2048;\n    include /etc/nginx/mime.types;\n    default_type application/octet-stream;\n    access_log /var/log/nginx/access.log;\n    error_log /var/log/nginx/error.log;\n    include /etc/nginx/conf.d/*.conf;\n    include /etc/nginx/sites-enabled/*;\n}'
                                },
                                'sites-enabled': {
                                    type: 'dir',
                                    children: {
                                        'default': {
                                            type: 'file',
                                            content: 'server {\n    listen 80 default_server;\n    root /var/www/html;\n    index index.html;\n    server_name citadel-core;\n\n    location / {\n        try_files $uri $uri/ =404;\n    }\n}'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'maintenance': {
                            type: 'dir',
                            children: {
                                'backup.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Citadel Core Backup Script\n# Runs every 5 minutes via crontab\n# Owner: root | Last modified: 2024-01-14\n\nBACKUP_DIR="/backup"\nTIMESTAMP=$(date +%F_%H%M)\nLOG="/var/log/backup.log"\n\n# Create backup archive\ntar -czf ${BACKUP_DIR}/citadel-${TIMESTAMP}.tar.gz \\\n    /var/www/html \\\n    /etc/nginx \\\n    /opt/maintenance \\\n    2>/dev/null\n\n# Rotate old backups (keep last 48)\nls -t ${BACKUP_DIR}/citadel-*.tar.gz 2>/dev/null | tail -n +49 | xargs rm -f 2>/dev/null\n\necho "[$(date)] Backup completed successfully" >> ${LOG}'
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
                                'syslog': {
                                    type: 'file',
                                    content: 'Jan 15 08:00:01 citadel-core systemd[1]: Starting Daily apt download activities...\nJan 15 08:00:01 citadel-core systemd[1]: Started Daily apt download activities.\nJan 15 08:05:01 citadel-core CRON[3201]: (root) CMD (/opt/maintenance/backup.sh)\nJan 15 08:10:01 citadel-core CRON[3245]: (root) CMD (/opt/maintenance/backup.sh)\nJan 15 08:12:33 citadel-core systemd[1]: Started Daily apt upgrade and target activities.\nJan 15 08:14:01 citadel-core CRON[4521]: (root) CMD (/opt/maintenance/backup.sh)\nJan 15 08:15:01 citadel-core CRON[4589]: (root) CMD (/opt/maintenance/backup.sh)\nJan 15 08:20:01 citadel-core CRON[4612]: (root) CMD (/opt/maintenance/backup.sh)\nJan 15 09:00:00 citadel-core kernel: audit: type=1400 audit(1705305600.000:127): apparmor="ALLOWED" operation="open"\nJan 15 09:05:01 citadel-core CRON[5102]: (root) CMD (/opt/maintenance/backup.sh)\nJan 15 09:10:01 citadel-core CRON[5134]: (root) CMD (/opt/maintenance/backup.sh)\nJan 15 09:12:44 citadel-core sshd[5201]: Accepted password for citadel_maint from 10.10.14.20 port 54312 ssh2\nJan 15 09:12:44 citadel-core sshd[5201]: pam_unix(sshd:session): session opened for user citadel_maint(uid=1001) by (uid=0)\nJan 15 09:15:01 citadel-core CRON[5234]: (root) CMD (/opt/maintenance/backup.sh)\nJan 15 09:20:01 citadel-core CRON[5267]: (root) CMD (/opt/maintenance/backup.sh)'
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: 'Jan 15 06:30:12 citadel-core sshd[2101]: Failed password for invalid user admin from 10.10.14.99 port 38221 ssh2\nJan 15 06:30:15 citadel-core sshd[2101]: Failed password for invalid user admin from 10.10.14.99 port 38221 ssh2\nJan 15 06:30:18 citadel-core sshd[2101]: Failed password for invalid user admin from 10.10.14.99 port 38221 ssh2\nJan 15 06:30:18 citadel-core sshd[2101]: Connection closed by invalid user admin 10.10.14.99 port 38221 [preauth]\nJan 15 07:00:01 citadel-core CRON[2890]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)\nJan 15 08:00:01 citadel-core CRON[3201]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)\nJan 15 09:12:44 citadel-core sshd[5201]: Accepted password for citadel_maint from 10.10.14.20 port 54312 ssh2\nJan 15 09:12:44 citadel-core sshd[5201]: pam_unix(sshd:session): session opened for user citadel_maint(uid=1001) by (uid=0)\nJan 15 09:12:45 citadel-core sudo: citadel_maint : TTY=pts/0 ; PWD=/home/citadel_maint ; USER=root ; COMMAND=/usr/bin/less /var/log/syslog'
                                },
                                'backup.log': {
                                    type: 'file',
                                    content: '[Mon Jan 15 08:05:01 UTC 2024] Backup completed successfully\n[Mon Jan 15 08:10:01 UTC 2024] Backup completed successfully\n[Mon Jan 15 08:15:01 UTC 2024] Backup completed successfully\n[Mon Jan 15 08:20:01 UTC 2024] Backup completed successfully\n[Mon Jan 15 09:05:01 UTC 2024] Backup completed successfully\n[Mon Jan 15 09:10:01 UTC 2024] Backup completed successfully\n[Mon Jan 15 09:15:01 UTC 2024] Backup completed successfully\n[Mon Jan 15 09:20:01 UTC 2024] Backup completed successfully'
                                },
                                'nginx': {
                                    type: 'dir',
                                    children: {
                                        'access.log': {
                                            type: 'file',
                                            content: '10.10.14.20 - - [15/Jan/2024:08:30:12 +0000] "GET / HTTP/1.1" 200 1245 "-" "Mozilla/5.0"\n10.10.14.20 - - [15/Jan/2024:08:30:14 +0000] "GET /favicon.ico HTTP/1.1" 404 197 "-" "Mozilla/5.0"\n10.10.14.99 - - [15/Jan/2024:06:31:02 +0000] "GET /admin HTTP/1.1" 404 197 "-" "DirBuster-1.0-RC1"'
                                        },
                                        'error.log': {
                                            type: 'file',
                                            content: '2024/01/15 06:31:02 [error] 510#510: *42 open() "/var/www/html/admin" failed (2: No such file or directory), client: 10.10.14.99'
                                        }
                                    }
                                }
                            }
                        },
                        'www': {
                            type: 'dir',
                            children: {
                                'html': {
                                    type: 'dir',
                                    children: {
                                        'index.html': {
                                            type: 'file',
                                            content: '<!DOCTYPE html>\n<html>\n<head><title>Citadel Core Systems</title></head>\n<body>\n<h1>Citadel Core Systems — Internal Portal</h1>\n<p>Authorized access only. All activity is monitored and logged.</p>\n<p>System Status: <span style="color:green;">OPERATIONAL</span></p>\n<hr>\n<small>Citadel Infrastructure Division | v3.8.2</small>\n</body>\n</html>'
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
                        'local': {
                            type: 'dir',
                            children: {
                                'bin': {
                                    type: 'dir',
                                    children: {
                                        'statuscheck': {
                                            type: 'file',
                                            content: '\x7fELF\x02\x01\x01[binary file — use \'strings\' to analyze]'
                                        },
                                        'healthmon': {
                                            type: 'file',
                                            content: '\x7fELF\x02\x01\x01[binary file]\n# DECOY: setuid bit is set but this binary drops privileges before execution\n# It is owned by www-data, not root — exploitation would only yield www-data\n# Hint: "file" and "ls -la" will show you what matters'
                                        },
                                        'audit_check.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# DECOY: Runs as www-data from cron.d/security-audit\n# Not writable by citadel_maint\n# Checks /var/www/html for unauthorized file changes\nfind /var/www/html -newer /var/log/nginx/access.log -type f 2>/dev/null | while read f; do\n    echo "[ALERT] Modified: $f" >> /var/log/integrity.log\ndone'
                                        }
                                    }
                                }
                            }
                        },
                        'bin': {
                            type: 'dir',
                            children: {
                                'less': {
                                    type: 'file',
                                    content: '[binary: /usr/bin/less]'
                                },
                                'passwd': {
                                    type: 'file',
                                    content: '[binary: /usr/bin/passwd]'
                                },
                                'sudo': {
                                    type: 'file',
                                    content: '[binary: /usr/bin/sudo]'
                                }
                            }
                        },
                        'share': {
                            type: 'dir',
                            children: {
                                'doc': {
                                    type: 'dir',
                                    children: {}
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
                'backup': {
                    type: 'dir',
                    children: {
                        'citadel-2024-01-15_0805.tar.gz': {
                            type: 'file',
                            content: '[compressed archive — tar.gz]'
                        },
                        'citadel-2024-01-15_0810.tar.gz': {
                            type: 'file',
                            content: '[compressed archive — tar.gz]'
                        },
                        'citadel-2024-01-15_0815.tar.gz': {
                            type: 'file',
                            content: '[compressed archive — tar.gz]'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                },
                'dev': {
                    type: 'dir',
                    children: {
                        'null': {
                            type: 'file',
                            content: ''
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {
                        'version': {
                            type: 'file',
                            content: 'Linux version 5.15.0-91-generic (buildd@lcy02-amd64-028) (gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0, GNU ld (GNU Binutils for Ubuntu) 2.38) #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023'
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (privilege escalation engine)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── Identity Commands ──────────────────────────────

        'whoami': function(args, term, engine) {
            return A4Config._state.isRoot ? 'root' : 'citadel_maint';
        },

        'id': function(args, term, engine) {
            return A4Config._state.isRoot
                ? 'uid=0(root) gid=0(root) groups=0(root)'
                : 'uid=1001(citadel_maint) gid=1001(citadel_maint) groups=1001(citadel_maint),27(sudo)';
        },

        'hostname': function(args, term, engine) {
            return 'citadel-core';
        },

        // ── sudo — Vector 1 entry point ────────────────────

        'sudo': function(args, term, engine) {
            if (!args.length) {
                return 'usage: sudo -l | sudo <command>';
            }

            // sudo -l — show allowed commands
            if (args[0] === '-l') {
                return 'Matching Defaults entries for citadel_maint on citadel-core:\n' +
                    '    env_reset, mail_badpass,\n' +
                    '    secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n\n' +
                    'User citadel_maint may run the following commands on citadel-core:\n' +
                    '    (ALL) NOPASSWD: /usr/bin/less /var/log/*';
            }

            // sudo /usr/bin/less /var/log/* — opens less viewer
            var sudoCmd = args.join(' ');
            if (sudoCmd.match(/^\/usr\/bin\/less\s+\/var\/log\/.+/)) {
                A4Config._state.inLess = true;
                var logFile = sudoCmd.replace(/^\/usr\/bin\/less\s+/, '');
                var logContent = A4Config._readFsFile(logFile);
                if (!logContent && logContent !== '') {
                    return 'less: ' + logFile + ': No such file or directory';
                }
                // Truncate if very long — show last ~15 lines
                var lines = logContent.split('\n');
                var display = lines.length > 15 ? lines.slice(-15).join('\n') : logContent;
                return display + '\n\n' +
                    '\x1b[7m [less viewer — press q to quit, !command to execute shell command] \x1b[0m\n' +
                    'Hint: Type !/bin/bash to spawn a shell as the current user (root via sudo)';
            }

            // sudo su / sudo bash — not allowed per sudoers
            if (sudoCmd.match(/^(su|bash|sh|\/bin\/(bash|sh))/)) {
                return 'Sorry, user citadel_maint is not allowed to execute \'/bin/' +
                    (sudoCmd.match(/bash/) ? 'bash' : sudoCmd.match(/sh/) ? 'sh' : 'su') +
                    '\' as root on citadel-core.';
            }

            // Any other sudo command — denied
            return 'Sorry, user citadel_maint is not allowed to execute \'' + args.join(' ') + '\' as root on citadel-core.';
        },

        // ── less escape — !/bin/bash gives root shell ──────

        '!': function(args, term, engine) {
            if (!A4Config._state.inLess) {
                return 'bash: !: event not found';
            }
            var shellCmd = args.join(' ').replace(/^\//, '');
            // Accept !/bin/bash, !bash, !/bin/sh, !sh
            if (shellCmd.match(/(bin\/)?bash/) || shellCmd.match(/(bin\/)?sh$/)) {
                A4Config._state.isRoot = true;
                A4Config._state.inLess = false;
                A4Config._state.escalationMethod = 'sudo_less_escape';
                return 'root@citadel-core:/var/log# id\n' +
                    'uid=0(root) gid=0(root) groups=0(root)\n\n' +
                    '[+] Privilege escalation successful!\n' +
                    '[+] Method: sudo less escape (GTFOBins)\n' +
                    '[+] You spawned a root shell from within the less pager.\n' +
                    '[+] The root flag is in /root/root.txt';
            }
            // Other commands inside less
            return 'sh: ' + args.join(' ') + ': command executed in subshell';
        },

        '!/bin/bash': function(args, term, engine) {
            return A4Config.commands['!'](['/bin/bash'], term, engine);
        },

        '!sh': function(args, term, engine) {
            return A4Config.commands['!'](['sh'], term, engine);
        },

        '!/bin/sh': function(args, term, engine) {
            return A4Config.commands['!'](['/bin/sh'], term, engine);
        },

        '!bash': function(args, term, engine) {
            return A4Config.commands['!'](['/bin/bash'], term, engine);
        },

        // ── q / quit from less ─────────────────────────────

        'q': function(args, term, engine) {
            if (A4Config._state.inLess) {
                A4Config._state.inLess = false;
                return '[exited less viewer]';
            }
            return 'q: command not found';
        },

        // ── find — SUID discovery (Vector 2) ──────────────

        'find': function(args, term, engine) {
            var joined = args.join(' ');

            // find / -perm -4000 — discover SUID binaries
            if (joined.match(/-perm/) && (joined.match(/4000/) || joined.match(/\+4000/) || joined.match(/-u=s/))) {
                var output = '/usr/bin/chfn\n' +
                    '/usr/bin/chsh\n' +
                    '/usr/bin/gpasswd\n' +
                    '/usr/bin/mount\n' +
                    '/usr/bin/newgrp\n' +
                    '/usr/bin/passwd\n' +
                    '/usr/bin/sudo\n' +
                    '/usr/bin/umount\n' +
                    '/usr/local/bin/healthmon\n' +        // DECOY — www-data owned, drops privs
                    '/usr/local/bin/statuscheck\n' +      // VULNERABLE — root owned, calls date without full path
                    '/usr/lib/dbus-1.0/dbus-daemon-launch-helper\n' +
                    '/usr/lib/openssh/ssh-keysign';
                // Suppress stderr redirect — they typed 2>/dev/null
                return output;
            }

            // find with -name
            if (joined.match(/-name/)) {
                var nameMatch = joined.match(/-name\s+['"]?([^\s'"]+)['"]?/);
                if (nameMatch) {
                    var results = A4Config._findFiles('/', nameMatch[1]);
                    return results.length ? results.join('\n') : 'find: no matches found';
                }
            }

            // find with -writable
            if (joined.match(/-writable/)) {
                return '/opt/maintenance/backup.sh\n/tmp\n/home/citadel_maint';
            }

            // find with a path and -type
            if (joined.match(/-type\s+f/)) {
                var searchPath = args[0] || '/';
                var results = A4Config._findFiles(searchPath, '*');
                return results.length ? results.slice(0, 30).join('\n') : 'find: no files found';
            }

            // Generic find usage
            if (!args.length) {
                return 'Usage: find [path] [expression]\n  -perm -4000   Find SUID binaries\n  -name "*.sh"  Find by name\n  -writable      Find writable files\n  -type f        Find files';
            }

            // Default: try to list the given path
            return 'find: unrecognized expression. Try: find / -perm -4000 2>/dev/null';
        },

        // ── strings — analyze SUID binary (Vector 2) ──────

        'strings': function(args, term, engine) {
            var target = args.join(' ');
            if (target.match(/statuscheck/) || target.match(/\/usr\/local\/bin\/statuscheck/)) {
                return '/lib64/ld-linux-x86-64.so.2\n' +
                    'libc.so.6\n' +
                    'system\n' +
                    'printf\n' +
                    '__cxa_finalize\n' +
                    '__libc_start_main\n' +
                    'GLIBC_2.2.5\n' +
                    '_ITM_deregisterTMCloneTable\n' +
                    '_ITM_registerTMCloneTable\n' +
                    '__gmon_start__\n' +
                    'System Status Check v1.2\n' +
                    'printf "\\n[*] Running system checks...\\n"\n' +
                    'date\n' +
                    'uptime\n' +
                    'df -h\n' +
                    'printf "\\n[*] Checks complete.\\n"\n' +
                    'GCC: (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0\n' +
                    '.note.gnu.build-id\n' +
                    '.note.ABI-tag\n' +
                    '.gnu.hash\n' +
                    '.dynsym';
            }
            if (target.match(/healthmon/)) {
                return '/lib64/ld-linux-x86-64.so.2\n' +
                    'libc.so.6\n' +
                    'setuid\n' +
                    'setgid\n' +
                    'prctl\n' +
                    'PR_SET_NO_NEW_PRIVS\n' +
                    'printf\n' +
                    '__libc_start_main\n' +
                    'Health Monitor v2.0 (Citadel)\n' +
                    'Checking system health...\n' +
                    'Running as: www-data\n' +
                    '/var/www/html/health.log\n' +
                    'OK\n' +
                    'GCC: (Ubuntu 11.4.0) 11.4.0\n' +
                    '# Note: This binary calls setuid(33)/setgid(33) to drop to www-data immediately\n' +
                    '# SUID bit inherited but privileges intentionally dropped — not exploitable for root';
            }
            if (target.match(/backup\.sh/)) {
                return '#!/bin/bash\n# Citadel Core Backup Script\ntar -czf\necho\nBackup completed';
            }
            if (!target) {
                return 'Usage: strings <file>';
            }
            return 'strings: \'' + target + '\': No such file';
        },

        // ── file — identify binary type ────────────────────

        'file': function(args, term, engine) {
            var target = args[0] || '';
            if (target.match(/statuscheck/)) {
                return '/usr/local/bin/statuscheck: setuid ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=a3c2e8..., for GNU/Linux 3.2.0, not stripped';
            }
            if (target.match(/healthmon/)) {
                return '/usr/local/bin/healthmon: setuid ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, BuildID[sha1]=f7b19d..., for GNU/Linux 3.2.0, not stripped\n' +
                    '  (SUID bit set — owner: www-data:www-data — drops to uid=33 immediately)';
            }
            if (target.match(/backup\.sh/)) {
                return '/opt/maintenance/backup.sh: Bourne-Again shell script, ASCII text executable';
            }
            if (!target) {
                return 'Usage: file <path>';
            }
            // Try filesystem
            var node = A4Config._getNode(target);
            if (!node) return target + ': cannot open (No such file or directory)';
            if (node.type === 'dir') return target + ': directory';
            return target + ': ASCII text';
        },

        // ── export — PATH injection (Vector 2) ────────────

        'export': function(args, term, engine) {
            var joined = args.join(' ');
            // PATH=/tmp:$PATH or PATH="/tmp:$PATH" etc.
            if (joined.match(/PATH\s*=\s*["']?\/tmp/) || joined.match(/PATH\s*=\s*["']?\.:/)) {
                A4Config._state.pathInjected = true;
                return '';
            }
            // Any other export
            return '';
        },

        // ── SUID binary execution (Vector 2 payoff) ───────

        '/usr/local/bin/statuscheck': function(args, term, engine) {
            if (A4Config._state.pathInjected) {
                A4Config._state.isRoot = true;
                A4Config._state.escalationMethod = 'suid_path_injection';
                return '[*] Running system checks...\n\n' +
                    'root@citadel-core:~# id\n' +
                    'uid=0(root) gid=0(root) groups=0(root)\n\n' +
                    '[+] Privilege escalation successful!\n' +
                    '[+] Method: SUID PATH injection (statuscheck → date)\n' +
                    '[+] The SUID binary called \'date\' without a full path.\n' +
                    '[+] Your malicious /tmp/date was executed as root.\n' +
                    '[+] The root flag is in /root/root.txt';
            }
            return '[*] Running system checks...\n\n' +
                'Date: Mon Jan 15 10:30:22 UTC 2024\n' +
                'Uptime:  10:30:22 up 47 days,  3:12,  1 user,  load average: 0.08, 0.03, 0.01\n\n' +
                'Filesystem      Size  Used Avail Use% Mounted on\n' +
                '/dev/sda1       512G  187G  301G  39% /\n' +
                'tmpfs           7.9G     0  7.9G   0% /dev/shm\n' +
                'tmpfs           1.6G  1.1M  1.6G   1% /run\n\n' +
                '[*] Checks complete.';
        },

        'statuscheck': function(args, term, engine) {
            return A4Config.commands['/usr/local/bin/statuscheck'](args, term, engine);
        },

        // ── healthmon — DECOY SUID (drops to www-data, not root) ──

        '/usr/local/bin/healthmon': function(args, term, engine) {
            return '[*] Health Monitor v2.0 — Citadel Infrastructure\n\n' +
                '[*] Dropping privileges to www-data (uid=33)...\n' +
                '[*] Running as: uid=33(www-data)\n\n' +
                'Checking /var/www/html... OK\n' +
                'Checking nginx process... OK (pid 510)\n' +
                'Checking disk usage... 39% used\n\n' +
                '[*] Health check complete.\n\n' +
                '\x1b[33m[~] Note: This binary dropped from SUID to www-data immediately.\x1b[0m\n' +
                '\x1b[33m[~] SUID binaries owned by non-root users are generally not useful for privesc.\x1b[0m\n' +
                '\x1b[33m[~] Focus on root-owned SUID binaries.\x1b[0m';
        },

        'healthmon': function(args, term, engine) {
            return A4Config.commands['/usr/local/bin/healthmon'](args, term, engine);
        },

        // ── echo — cron exploit + PATH injection helper ────

        'echo': function(args, term, engine) {
            var joined = args.join(' ');

            // Writing to backup.sh (cron exploit — Vector 3)
            if (joined.match(/>>?\s*\/opt\/maintenance\/backup\.sh/) || joined.match(/>>?\s*["']?\/opt\/maintenance\/backup\.sh/)) {
                A4Config._state.cronModified = true;
                // Detect what they're injecting
                var payload = joined.replace(/>>?\s*["']?\/opt\/maintenance\/backup\.sh["']?\s*$/, '').trim();
                if (payload.match(/chmod\s+[u+]?[04]?[s7]/) || payload.match(/\/bin\/bash/) || payload.match(/reverse/) || payload.match(/nc\s/) || payload.match(/ncat/)) {
                    return '[*] Script modified.\n' +
                        '[*] Waiting for cron execution...\n' +
                        '[*] ...\n' +
                        '[*] Cron job executed! (runs every 5 minutes as root)\n' +
                        '[+] /bin/bash is now SUID.\n' +
                        '[+] Run: /bin/bash -p   (or: bash -p)';
                }
                return '';
            }

            // Writing /tmp/date for PATH injection
            if (joined.match(/>>?\s*\/tmp\/date/) || joined.match(/>>?\s*["']?\/tmp\/date/)) {
                A4Config._state.tmpDateWritten = true;
                return '';
            }

            // Writing to any other /tmp file
            if (joined.match(/>>?\s*\/tmp\//)) {
                return '';
            }

            // Normal echo — strip surrounding quotes
            var output = joined.replace(/>>?.*$/, '').trim();
            output = output.replace(/^['"]|['"]$/g, '');
            return output;
        },

        // ── chmod — for PATH injection exploit ─────────────

        'chmod': function(args, term, engine) {
            var joined = args.join(' ');
            // chmod +x /tmp/date — needed for PATH injection
            if (joined.match(/\+x\s+\/tmp\/date/) || joined.match(/755\s+\/tmp\/date/)) {
                A4Config._state.tmpDateWritten = true;
                return '';
            }
            // chmod u+s /bin/bash — might be done via cron
            if (joined.match(/[u+]?[s4].*\/bin\/bash/)) {
                return A4Config._state.isRoot
                    ? ''
                    : 'chmod: changing permissions of \'/bin/bash\': Operation not permitted';
            }
            return '';
        },

        // ── bash -p — cron exploit payoff (Vector 3) ──────

        'bash': function(args, term, engine) {
            if (args.includes('-p') && A4Config._state.cronModified) {
                A4Config._state.isRoot = true;
                A4Config._state.escalationMethod = 'writable_cron_job';
                return 'bash-5.1# id\n' +
                    'uid=1001(citadel_maint) gid=1001(citadel_maint) euid=0(root) groups=1001(citadel_maint),27(sudo)\n\n' +
                    '[+] Privilege escalation successful!\n' +
                    '[+] Method: Writable cron job (/opt/maintenance/backup.sh)\n' +
                    '[+] The backup script was writable and runs as root every 5 minutes.\n' +
                    '[+] You injected a payload that set /bin/bash as SUID.\n' +
                    '[+] The root flag is in /root/root.txt';
            }
            if (args.includes('-p')) {
                return 'bash: permission denied (no SUID bit set on /bin/bash)';
            }
            return 'bash: already in a bash shell. Use exit to leave.';
        },

        '/bin/bash': function(args, term, engine) {
            return A4Config.commands['bash'](args, term, engine);
        },

        // ── cat — permission-aware filesystem reader ──────

        'cat': function(args, term, engine) {
            if (!args.length) return 'cat: missing operand';

            var results = [];
            for (var i = 0; i < args.length; i++) {
                var path = args[i];
                if (path.startsWith('-')) continue;

                // Permission checks for privileged files
                if ((path.match(/^\/root\//) || path === '/root/.bash_history' || path === '/root/.bashrc') && !A4Config._state.isRoot) {
                    results.push('cat: ' + path + ': Permission denied');
                    continue;
                }
                if (path === '/etc/shadow' && !A4Config._state.isRoot) {
                    results.push('cat: /etc/shadow: Permission denied');
                    continue;
                }
                if (path === '/etc/sudoers' && !A4Config._state.isRoot) {
                    results.push('cat: /etc/sudoers: Permission denied');
                    continue;
                }

                // Navigate filesystem
                var content = A4Config._readFsFile(path);
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
                if (arg === '-la' || arg === '-al') { longFormat = true; showAll = true; }
                else if (arg === '-l') { longFormat = true; }
                else if (arg === '-a') { showAll = true; }
                else if (!arg.startsWith('-')) { path = arg; }
            }

            // Use terminal cwd if no path given
            if (!path) {
                path = term.cwd || A4Config.terminal.startDir;
            }

            // Permission check
            if (path.match(/^\/root/) && !A4Config._state.isRoot) {
                return 'ls: cannot open directory \'' + path + '\': Permission denied';
            }

            // Navigate filesystem
            var node = A4Config._getNode(path);
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

                    // Special permission display
                    if (name === 'healthmon') {
                        perms = 'rwsr-xr-x';
                        owner = 'www-data';
                        group = 'www-data';
                        size = '12288';
                    } else if (name === 'statuscheck') {
                        perms = 'rwsr-xr-x';
                        owner = 'root';
                        group = 'root';
                        size = '16384';
                    } else if (name === 'backup.sh') {
                        perms = 'rwxrwxrw-';
                        owner = 'root';
                        group = 'root';
                        size = String((child.content || '').length);
                    } else if (name === 'shadow' || name === 'sudoers') {
                        perms = 'rw-r-----';
                        owner = 'root';
                        group = 'shadow';
                        size = String((child.content || '').length);
                    } else if (child.type === 'dir') {
                        perms = 'rwxr-xr-x';
                        owner = 'root';
                        group = 'root';
                        size = '4096';
                    } else if (path.match(/^\/home\/citadel_maint/)) {
                        perms = 'rw-r--r--';
                        owner = 'citadel_maint';
                        group = 'citadel_maint';
                        size = String((child.content || '').length);
                    } else {
                        perms = 'rw-r--r--';
                        owner = 'root';
                        group = 'root';
                        size = String((child.content || '').length);
                    }

                    lines.push(
                        typeCh + perms + '  1 ' +
                        owner.padEnd(16) + ' ' +
                        group.padEnd(16) + ' ' +
                        size.padStart(8) + ' ' +
                        'Jan 15 08:00 ' + name
                    );
                }
                return lines.join('\n');
            }

            // Short format — color directories
            return entries.join('  ');
        },

        // ── head / tail — permission-aware ─────────────────

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
                if (files[j].match(/^\/root\//) && !A4Config._state.isRoot) {
                    results.push('head: ' + files[j] + ': Permission denied');
                    continue;
                }
                var content = A4Config._readFsFile(files[j]);
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
                if (files[j].match(/^\/root\//) && !A4Config._state.isRoot) {
                    results.push('tail: ' + files[j] + ': Permission denied');
                    continue;
                }
                var content = A4Config._readFsFile(files[j]);
                if (content === null) { results.push('tail: ' + files[j] + ': No such file or directory'); continue; }
                if (content === '__dir__') { results.push('tail: error reading \'' + files[j] + '\': Is a directory'); continue; }
                var lines = content.split('\n');
                results.push(lines.slice(-n).join('\n'));
            }
            return results.join('\n');
        },

        // ── less — requires sudo for privileged access ─────

        'less': function(args, term, engine) {
            var file = args[0] || '';
            if (!file) return 'Usage: less <file>   (use sudo /usr/bin/less for privileged access)';
            var content = A4Config._readFsFile(file);
            if (content === null) return 'less: ' + file + ': No such file or directory';
            if (file.match(/^\/var\/log\//)) {
                return content + '\n\n(Use sudo /usr/bin/less ' + file + ' for privileged access with pager controls)';
            }
            return content;
        },

        // ── grep — search file content ─────────────────────

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
                var content = A4Config._readFsFile(files[j]);
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

        // ── linpeas — automated enumeration ────────────────

        'linpeas': function(args, term, engine) {
            return '\x1b[33m' +
                '                      ╔══════════════════════════╗\n' +
                '              ════════╣ LinPEAS — Linux Privesc  ╠════════\n' +
                '                      ╚══════════════════════════╝\n\n' +
                '\x1b[0m' +
                '\x1b[34m[*] System Information\x1b[0m\n' +
                '  OS: Ubuntu 22.04.3 LTS (Jammy Jellyfish)\n' +
                '  Kernel: 5.15.0-91-generic\n' +
                '  Hostname: citadel-core\n' +
                '  Current user: citadel_maint\n\n' +
                '\x1b[31m[!] Sudo permissions\x1b[0m\n' +
                '  (ALL) NOPASSWD: /usr/bin/less /var/log/*\n' +
                '  \x1b[31m>>> GTFOBins: less can escape to shell with !/bin/bash <<<\x1b[0m\n\n' +
                '\x1b[31m[!] SUID binaries (non-standard)\x1b[0m\n' +
                '  /usr/local/bin/healthmon    — \x1b[33mSUID set (www-data owned — drops privs immediately, not useful)\x1b[0m\n' +
                '    Owner: www-data | calls PR_SET_NO_NEW_PRIVS — \x1b[32m[likely not exploitable]\x1b[0m\n' +
                '    \x1b[33m>>> Try strings to verify, but move on — check root-owned SUIDs <<<\x1b[0m\n' +
                '  /usr/local/bin/statuscheck  — \x1b[31mCUSTOM BINARY (root-owned) — investigate!\x1b[0m\n' +
                '    Owner: root | SUID bit set\n' +
                '    \x1b[33m>>> Try: strings /usr/local/bin/statuscheck <<<\x1b[0m\n\n' +
                '\x1b[31m[!] Writable scripts executed by cron\x1b[0m\n' +
                '  /opt/maintenance/backup.sh  — \x1b[31mWRITABLE! runs as root every 5 min\x1b[0m\n' +
                '    Crontab: */5 * * * * root /opt/maintenance/backup.sh\n' +
                '    Permissions: -rwxrwxrw- (world writable!)\n' +
                '    \x1b[33m>>> Inject a payload and wait for cron execution <<<\x1b[0m\n\n' +
                '\x1b[34m[*] Network services\x1b[0m\n' +
                '  0.0.0.0:22   (sshd)\n' +
                '  0.0.0.0:80   (nginx)\n' +
                '  127.0.0.1:3306 (mysql)\n\n' +
                '\x1b[32m[+] Possible escalation vectors: 3 found\x1b[0m\n' +
                '  1. Sudo + less escape (GTFOBins)\n' +
                '  2. Custom SUID binary (/usr/local/bin/statuscheck)\n' +
                '  3. Writable cron job (/opt/maintenance/backup.sh)';
        },

        'linpeas.sh': function(args, term, engine) {
            return A4Config.commands['linpeas'](args, term, engine);
        },

        './linpeas.sh': function(args, term, engine) {
            return A4Config.commands['linpeas'](args, term, engine);
        },

        // ── Network commands ───────────────────────────────

        'ss': function(args, term, engine) {
            var joined = args.join(' ');
            if (joined.match(/-[tlnp]+/) || joined === '') {
                return 'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port   Process\n' +
                    'tcp    LISTEN  0       128      0.0.0.0:22             0.0.0.0:*           users:(("sshd",pid=452,fd=3))\n' +
                    'tcp    LISTEN  0       511      0.0.0.0:80             0.0.0.0:*           users:(("nginx",pid=510,fd=6))\n' +
                    'tcp    LISTEN  0       80       127.0.0.1:3306         0.0.0.0:*           users:(("mysqld",pid=511,fd=21))';
            }
            return 'Usage: ss [options]\n  -t  TCP sockets\n  -l  Listening\n  -n  Numeric\n  -p  Show process';
        },

        'netstat': function(args, term, engine) {
            return 'Active Internet connections (only servers)\n' +
                'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\n' +
                'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      452/sshd\n' +
                'tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      510/nginx\n' +
                'tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      511/mysqld';
        },

        'ifconfig': function(args, term, engine) {
            return 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n' +
                '        inet 10.10.14.5  netmask 255.255.255.0  broadcast 10.10.14.255\n' +
                '        inet6 fe80::a00:27ff:fe8d:c04d  prefixlen 64  scopeid 0x20<link>\n' +
                '        ether 08:00:27:8d:c0:4d  txqueuelen 1000  (Ethernet)\n' +
                '        RX packets 24891  bytes 3512893 (3.3 MiB)\n' +
                '        TX packets 18234  bytes 2841032 (2.7 MiB)\n\n' +
                'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n' +
                '        inet 127.0.0.1  netmask 255.0.0.0\n' +
                '        inet6 ::1  prefixlen 128  scopeid 0x10<host>\n' +
                '        loop  txqueuelen 1000  (Local Loopback)\n' +
                '        RX packets 1204  bytes 100432 (98.0 KiB)\n' +
                '        TX packets 1204  bytes 100432 (98.0 KiB)';
        },

        'ip': function(args, term, engine) {
            if (args[0] === 'a' || args[0] === 'addr') {
                return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n' +
                    '    inet 127.0.0.1/8 scope host lo\n' +
                    '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n' +
                    '    inet 10.10.14.5/24 brd 10.10.14.255 scope global eth0';
            }
            if (args[0] === 'route' || args[0] === 'r') {
                return 'default via 10.10.14.1 dev eth0 proto dhcp src 10.10.14.5 metric 100\n' +
                    '10.10.14.0/24 dev eth0 proto kernel scope link src 10.10.14.5';
            }
            return 'Usage: ip [addr|route|link]';
        },

        'ping': function(args, term, engine) {
            var target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '127.0.0.1' || target === 'localhost') {
                return 'PING localhost (127.0.0.1) 56(84) bytes of data.\n' +
                    '64 bytes from localhost: icmp_seq=1 ttl=64 time=0.021 ms\n' +
                    '64 bytes from localhost: icmp_seq=2 ttl=64 time=0.024 ms\n' +
                    '64 bytes from localhost: icmp_seq=3 ttl=64 time=0.019 ms\n\n' +
                    '--- localhost ping statistics ---\n' +
                    '3 packets transmitted, 3 received, 0% packet loss';
            }
            return 'PING ' + target + ' (' + target + ') 56(84) bytes of data.\n' +
                '64 bytes from ' + target + ': icmp_seq=1 ttl=64 time=1.23 ms\n' +
                '64 bytes from ' + target + ': icmp_seq=2 ttl=64 time=1.18 ms\n\n' +
                '--- ' + target + ' ping statistics ---\n' +
                '2 packets transmitted, 2 received, 0% packet loss';
        },

        // ── Process commands ───────────────────────────────

        'ps': function(args, term, engine) {
            var joined = args.join(' ');
            if (joined.match(/aux/) || joined.match(/-ef/)) {
                return 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n' +
                    'root         1  0.0  0.1 169204 13168 ?        Ss   Jan14   0:12 /sbin/init\n' +
                    'root       312  0.0  0.0  99864  6884 ?        Ss   Jan14   0:01 /lib/systemd/systemd-journald\n' +
                    'root       345  0.0  0.0  24068  5640 ?        Ss   Jan14   0:00 /lib/systemd/systemd-udevd\n' +
                    'root       452  0.0  0.0  15428  7128 ?        Ss   Jan14   0:03 sshd: /usr/sbin/sshd -D\n' +
                    'root       510  0.0  0.0  55276  5520 ?        Ss   Jan14   0:08 nginx: master process /usr/sbin/nginx\n' +
                    'www-data   512  0.0  0.0  55988  6204 ?        S    Jan14   0:02 nginx: worker process\n' +
                    'mysql      511  0.1  1.2 1834204 201360 ?      Sl   Jan14   1:42 /usr/sbin/mysqld\n' +
                    'root       520  0.0  0.0   8536  3040 ?        Ss   Jan14   0:00 /usr/sbin/cron -f\n' +
                    'root       5098 0.0  0.0  17192  9452 ?        Ss   09:12   0:00 sshd: citadel_maint [priv]\n' +
                    'citade+    5102 0.0  0.0  17324  6808 ?        S    09:12   0:00 sshd: citadel_maint@pts/0\n' +
                    'citade+    5103 0.0  0.0   8960  5340 pts/0    Ss   09:12   0:00 -bash\n' +
                    'citade+    5201 0.0  0.0  10068  3428 pts/0    R+   09:30   0:00 ps aux';
            }
            return 'PID TTY          TIME CMD\n' +
                '5103 pts/0    00:00:00 bash\n' +
                '5201 pts/0    00:00:00 ps';
        },

        'top': function(args, term, engine) {
            return 'top - 10:30:22 up 47 days,  3:12,  1 user,  load average: 0.08, 0.03, 0.01\n' +
                'Tasks: 124 total,   1 running, 123 sleeping,   0 stopped,   0 zombie\n' +
                '%Cpu(s):  1.3 us,  0.5 sy,  0.0 ni, 98.0 id,  0.2 wa,  0.0 hi,  0.0 si\n' +
                'MiB Mem :  16384.0 total,  12847.3 free,   1892.4 used,   1644.3 buff/cache\n' +
                'MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.  14101.2 avail Mem\n\n' +
                '    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n' +
                '    511 mysql     20   0 1834204 201360  37240 S   0.7  1.2   1:42.18 mysqld\n' +
                '    510 root      20   0   55276   5520   4600 S   0.0  0.0   0:08.34 nginx\n' +
                '    452 root      20   0   15428   7128   6408 S   0.0  0.0   0:03.21 sshd\n' +
                '    520 root      20   0    8536   3040   2708 S   0.0  0.0   0:00.14 cron\n' +
                '      1 root      20   0  169204  13168   8432 S   0.0  0.1   0:12.45 systemd\n\n' +
                '(press q to exit)';
        },

        // ── System info commands ───────────────────────────

        'uname': function(args, term, engine) {
            if (args.includes('-a')) {
                return 'Linux citadel-core 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux';
            }
            if (args.includes('-r')) {
                return '5.15.0-91-generic';
            }
            return 'Linux';
        },

        'lsb_release': function(args, term, engine) {
            return 'Distributor ID: Ubuntu\n' +
                'Description:    Ubuntu 22.04.3 LTS\n' +
                'Release:        22.04\n' +
                'Codename:       jammy';
        },

        'df': function(args, term, engine) {
            return 'Filesystem      Size  Used Avail Use% Mounted on\n' +
                '/dev/sda1       512G  187G  301G  39% /\n' +
                'tmpfs           7.9G     0  7.9G   0% /dev/shm\n' +
                'tmpfs           1.6G  1.1M  1.6G   1% /run\n' +
                'tmpfs           5.0M     0  5.0M   0% /run/lock\n' +
                '/dev/sda15      105M  6.1M   99M   6% /boot/efi\n' +
                'tmpfs           1.6G     0  1.6G   0% /run/user/1001';
        },

        'free': function(args, term, engine) {
            return '               total        used        free      shared  buff/cache   available\n' +
                'Mem:        16777216     1938432    13155072       16384     1683712    14435328\n' +
                'Swap:        2097152           0     2097152';
        },

        'uptime': function(args, term, engine) {
            return ' 10:30:22 up 47 days,  3:12,  1 user,  load average: 0.08, 0.03, 0.01';
        },

        'date': function(args, term, engine) {
            return 'Mon Jan 15 10:30:22 UTC 2024';
        },

        'env': function(args, term, engine) {
            var envVars = 'SHELL=/bin/bash\n' +
                'PWD=' + (term.cwd || '/home/citadel_maint') + '\n' +
                'LOGNAME=' + (A4Config._state.isRoot ? 'root' : 'citadel_maint') + '\n' +
                'HOME=' + (A4Config._state.isRoot ? '/root' : '/home/citadel_maint') + '\n' +
                'LANG=en_US.UTF-8\n' +
                'USER=' + (A4Config._state.isRoot ? 'root' : 'citadel_maint') + '\n' +
                'TERM=xterm-256color\n' +
                'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n' +
                'HOSTNAME=citadel-core\n' +
                'SSH_CONNECTION=10.10.14.20 54312 10.10.14.5 22';
            if (A4Config._state.pathInjected) {
                envVars = envVars.replace(
                    'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
                    'PATH=/tmp:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
                );
            }
            return envVars;
        },

        'printenv': function(args, term, engine) {
            return A4Config.commands['env'](args, term, engine);
        },

        // ── systemctl — service info ───────────────────────

        'systemctl': function(args, term, engine) {
            if (args[0] === 'status') {
                var service = args[1] || '';
                if (service === 'cron' || service === 'cron.service') {
                    return 'cron.service - Regular background program processing daemon\n' +
                        '     Loaded: loaded (/lib/systemd/system/cron.service; enabled; preset: enabled)\n' +
                        '     Active: active (running) since Sun 2023-11-29 07:18:22 UTC; 47 days ago\n' +
                        '   Main PID: 520 (cron)\n' +
                        '      Tasks: 1 (limit: 19106)\n' +
                        '     Memory: 1.4M\n' +
                        '        CPU: 142ms\n' +
                        '     CGroup: /system.slice/cron.service\n' +
                        '             520 /usr/sbin/cron -f\n\n' +
                        'Jan 15 09:20:01 citadel-core CRON[5267]: (root) CMD (/opt/maintenance/backup.sh)';
                }
                if (service.match(/ssh/)) {
                    return 'ssh.service - OpenBSD Secure Shell server\n' +
                        '     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)\n' +
                        '     Active: active (running)\n' +
                        '   Main PID: 452 (sshd)';
                }
                if (service.match(/nginx/)) {
                    return 'nginx.service - A high performance web server\n' +
                        '     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)\n' +
                        '     Active: active (running)\n' +
                        '   Main PID: 510 (nginx)';
                }
                if (service.match(/mysql/)) {
                    return 'mysql.service - MySQL Community Server\n' +
                        '     Loaded: loaded (/lib/systemd/system/mysql.service; enabled)\n' +
                        '     Active: active (running)\n' +
                        '   Main PID: 511 (mysqld)';
                }
                return 'Unit ' + service + ' could not be found.';
            }
            if (args[0] === 'list-timers' || args[0] === 'list-units') {
                return 'Run systemctl status <service> for details.';
            }
            return 'Usage: systemctl status <service>';
        },

        'crontab': function(args, term, engine) {
            if (args[0] === '-l') {
                if (A4Config._state.isRoot) {
                    return '# root crontab\n*/5 * * * * /opt/maintenance/backup.sh';
                }
                return 'no crontab for citadel_maint';
            }
            return 'Usage: crontab [-l]   (use cat /etc/crontab for system crontab)';
        },

        // ── audit_helper.sh — DECOY script (runs as citadel_maint) ──

        './tools/audit_helper.sh': function(args, term, engine) {
            return '=== System Audit Report ===\n' +
                'Date: Mon Jan 15 10:30:22 UTC 2024\n' +
                'User: citadel_maint\n\n' +
                '--- Memory Usage ---\n' +
                '               total        used        free\n' +
                'Mem:           16384        1938       13155\n\n' +
                '--- Disk Usage ---\n' +
                'Filesystem     Size  Used Avail Use% Mounted on\n' +
                '/dev/sda1      512G  187G  301G  39% /\n\n' +
                'Audit complete. For elevated checks, contact sysadmin@citadel-core.internal\n\n' +
                '\x1b[33m[~] Note: This script runs as citadel_maint — it has no root access path.\x1b[0m';
        },

        // ── GTFOBins lookup alias ──────────────────────────

        'gtfobins': function(args, term, engine) {
            return 'gtfobins: command not found\n\nHint: GTFOBins is a website (https://gtfobins.github.io/)\nCheck for exploitable binaries: sudo, less, find, vim, etc.';
        },

        // ── wget / curl — limited on target ────────────────

        'wget': function(args, term, engine) {
            var url = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (url.match(/linpeas/)) {
                return '[*] Simulated download: linpeas.sh\n[*] File saved to current directory.\n\nTip: Run linpeas directly — it\'s already available as a command.';
            }
            if (!url) return 'Usage: wget <url>';
            return 'Connecting to ' + url + '... failed: Connection timed out.\n(This is an isolated target — limited outbound access)';
        },

        'curl': function(args, term, engine) {
            var url = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            if (url.match(/linpeas/) || url.match(/gtfobins/)) {
                return 'curl: (7) Failed to connect: Connection timed out\n(Tip: linpeas is available as a built-in command)';
            }
            if (url.match(/127\.0\.0\.1/) || url.match(/localhost/)) {
                return '<!DOCTYPE html>\n<html>\n<head><title>Citadel Core Systems</title></head>\n<body>\n<h1>Citadel Core Systems — Internal Portal</h1>\n<p>System Status: OPERATIONAL</p>\n</body>\n</html>';
            }
            return 'curl: (7) Failed to connect to ' + url.replace(/https?:\/\//, '').split('/')[0] + ': Connection timed out';
        },

        // ── mysql — limited access ─────────────────────────

        'mysql': function(args, term, engine) {
            return 'ERROR 1045 (28000): Access denied for user \'citadel_maint\'@\'localhost\' (using password: NO)\n' +
                'Hint: MySQL is running locally on port 3306 but requires credentials.';
        },

        // ── Misc utilities ─────────────────────────────────

        'which': function(args, term, engine) {
            var bins = {
                'statuscheck': '/usr/local/bin/statuscheck',
                'less': '/usr/bin/less',
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
                'wget': '/usr/bin/wget',
                'curl': '/usr/bin/curl',
                'python3': '/usr/bin/python3',
                'nc': '/usr/bin/nc',
                'ncat': '/usr/bin/ncat',
                'ssh': '/usr/bin/ssh',
                'crontab': '/usr/bin/crontab'
            };
            var cmd = args[0] || '';
            return bins[cmd] || cmd + ' not found';
        },

        'type': function(args, term, engine) {
            var cmd = args[0] || '';
            if (!cmd) return 'type: usage: type name';
            if (A4Config.commands[cmd]) return cmd + ' is a shell builtin or available command';
            return 'bash: type: ' + cmd + ': not found';
        },

        'wc': function(args, term, engine) {
            var files = args.filter(function(a) { return !a.startsWith('-'); });
            if (!files.length) return 'Usage: wc [OPTION]... [FILE]...';
            var results = [];
            for (var i = 0; i < files.length; i++) {
                var content = A4Config._readFsFile(files[i]);
                if (content === null) { results.push('wc: ' + files[i] + ': No such file or directory'); continue; }
                if (content === '__dir__') { results.push('wc: ' + files[i] + ': Is a directory'); continue; }
                var lines = content.split('\n').length;
                var words = content.split(/\s+/).filter(Boolean).length;
                var chars = content.length;
                results.push('  ' + lines + '  ' + words + ' ' + chars + ' ' + files[i]);
            }
            return results.join('\n');
        },

        'touch': function(args, term, engine) {
            return '';
        },

        'mkdir': function(args, term, engine) {
            var dir = args.find(function(a) { return !a.startsWith('-'); });
            if (dir && dir.startsWith('/tmp')) return '';
            if (dir && dir.startsWith('/home/citadel_maint')) return '';
            return 'mkdir: cannot create directory \'' + (dir || '') + '\': Permission denied';
        },

        'pwd': function(args, term, engine) {
            return term.cwd || '/home/citadel_maint';
        },

        'cd': function(args, term, engine) {
            // Let Terminal.js handle cd natively — return null to fall through
            // Actually, custom commands override builtins, so we need to handle it
            var target = args[0] || '/home/citadel_maint';
            if (target === '~') target = '/home/citadel_maint';
            if (target.startsWith('~/')) target = '/home/citadel_maint' + target.slice(1);

            // Permission check
            if (target.match(/^\/root/) && !A4Config._state.isRoot) {
                return 'bash: cd: /root: Permission denied';
            }

            // Resolve path
            var resolved = target;
            if (!target.startsWith('/')) {
                resolved = term.cwd + '/' + target;
            }
            // Normalize
            var parts = resolved.split('/').filter(Boolean);
            var norm = [];
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === '.') continue;
                if (parts[i] === '..') { norm.pop(); continue; }
                norm.push(parts[i]);
            }
            resolved = '/' + norm.join('/');

            var node = A4Config._getNode(resolved);
            if (!node) return 'bash: cd: ' + target + ': No such file or directory';
            if (node.type !== 'dir') return 'bash: cd: ' + target + ': Not a directory';

            term.cwd = resolved;
            term._updatePrompt();
            return '';
        },

        // ── python — for quick one-liners ──────────────────

        'python3': function(args, term, engine) {
            if (args[0] === '-c') {
                var code = args.slice(1).join(' ');
                if (code.match(/import\s+os/) && code.match(/system/)) {
                    return 'sh: python3: restricted in this simulation.\nTip: Use direct shell commands instead.';
                }
                if (code.match(/import\s+pty/) && code.match(/spawn/)) {
                    return 'sh: python3: restricted in this simulation.\nTip: You\'re already in a shell. Try the privesc vectors directly.';
                }
                return 'Python 3.10.12 — restricted execution in simulation';
            }
            return 'Python 3.10.12\nType "exit()" to exit.\n>>> (interactive mode not supported in simulation)';
        },

        'python': function(args, term, engine) {
            return A4Config.commands['python3'](args, term, engine);
        },

        // ── man pages ──────────────────────────────────────

        'man': function(args, term, engine) {
            var page = args[0] || '';
            if (page === 'less') {
                return 'LESS(1)\n\nNAME\n       less - opposite of more\n\nDESCRIPTION\n       Less is a program similar to more, but which allows\n       backward movement in the file as well as forward.\n\nCOMMANDS\n       !command\n              Invokes a shell to run the command given.\n              For example: !/bin/bash spawns a bash shell.\n\n       q      Exit less.\n\n       /pattern\n              Search forward for the pattern.';
            }
            if (page === 'sudo') {
                return 'SUDO(8)\n\nNAME\n       sudo - execute a command as another user\n\nSYNOPSIS\n       sudo -l         List allowed commands\n       sudo command    Run command as root\n\nDESCRIPTION\n       sudo allows a user to execute a command as root\n       or another user, as specified by the security policy.';
            }
            if (page === 'find') {
                return 'FIND(1)\n\nNAME\n       find - search for files in a directory hierarchy\n\nEXAMPLES\n       find / -perm -4000\n              Find all SUID binaries\n       find / -writable\n              Find all writable files';
            }
            if (!page) return 'What manual page do you want?\nFor example, try \'man less\', \'man sudo\', or \'man find\'.';
            return 'No manual entry for ' + page;
        },

        // ── vi/vim/nano — not interactive but hint ─────────

        'vi': function(args, term, engine) {
            var file = args[0] || '';
            if (file.match(/backup\.sh/)) {
                return '(Interactive editors not supported in simulation)\nTip: Use echo to append to the file:\n  echo \'chmod u+s /bin/bash\' >> /opt/maintenance/backup.sh';
            }
            return '(Interactive editors not supported in simulation)\nTip: Use echo or cat for file operations.';
        },

        'vim': function(args, term, engine) {
            return A4Config.commands['vi'](args, term, engine);
        },

        'nano': function(args, term, engine) {
            return A4Config.commands['vi'](args, term, engine);
        },

        // ── tee — write to files ───────────────────────────

        'tee': function(args, term, engine) {
            var file = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (file.match(/backup\.sh/)) {
                A4Config._state.cronModified = true;
                return '[*] Written to ' + file + '\n' +
                    '[*] Waiting for cron execution...\n' +
                    '[*] ...\n' +
                    '[*] Cron job executed!\n' +
                    '[+] /bin/bash is now SUID.\n' +
                    '[+] Run: /bin/bash -p';
            }
            if (file.match(/\/tmp\//)) return '';
            return '';
        },

        // ── nc / ncat — reverse shell attempts ─────────────

        'nc': function(args, term, engine) {
            return 'nc: outbound connections restricted on this system.\nTip: Focus on local privilege escalation techniques.';
        },

        'ncat': function(args, term, engine) {
            return A4Config.commands['nc'](args, term, engine);
        },

        // ── ssh — hint about already being on target ───────

        'ssh': function(args, term, engine) {
            return 'You are already logged into citadel-core as citadel_maint.\nFocus on escalating privileges locally.';
        },

        // ── history ────────────────────────────────────────

        'history': function(args, term, engine) {
            var lines = term.history.map(function(cmd, i) {
                return '  ' + String(i + 1).padStart(4) + '  ' + cmd;
            });
            return lines.join('\n');
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM HELPERS
    // ═══════════════════════════════════════════════════════

    _getNode(path) {
        // Resolve relative to /home/citadel_maint if needed
        if (!path.startsWith('/')) {
            path = '/home/citadel_maint/' + path;
        }
        // Normalize
        var parts = path.split('/').filter(Boolean);
        var resolved = [];
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === '.') continue;
            if (parts[i] === '..') { resolved.pop(); continue; }
            resolved.push(parts[i]);
        }

        var node = A4Config.filesystem['/'];
        for (var j = 0; j < resolved.length; j++) {
            if (!node || node.type !== 'dir' || !node.children || !node.children[resolved[j]]) {
                return null;
            }
            node = node.children[resolved[j]];
        }
        return node;
    },

    _readFsFile(path) {
        var node = A4Config._getNode(path);
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

        var startNode = A4Config._getNode(startPath);
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
