/* ============================================================
   ALA Scavenger Hunt #1: The Website Is Down
   Advanced Linux Administration -- In-class CTF
   In-class team-race box. Students capture flags by running the
   right commands; they transcribe those commands onto the printed
   scavenger hunt worksheet. Built on the ala-l01 engine template.
   ============================================================ */

const ALAHunt1Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Scavenger Hunt #1: The Website Is Down',
    subtitle: 'In-class team race -- Advanced Linux Administration W1',
    description: 'It is 2:14am. The status page is red. You SSH into the broken server. Diagnose what crashed, what is blocking the restart, and bring the service back up. Each correctly-used command captures a flag. Transcribe the commands you ran onto your scavenger hunt sheet -- first team done correctly wins.',
    difficulty: 'Beginner',
    estimatedTime: 20,
    accent: '#00ff41',
    storageKey: 'hexworth_lab_ala_hunt1',
    registryId: 'ala-hunt1-website-down',
    trackerKey: 'lab_ala_hunt1',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-071 BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: eth0 link detected, eth1 link DOWN',
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
        intro: 'IN-CLASS SCAVENGER HUNT #1. Work in teams of 2 or 3. Open the printed worksheet your instructor handed out -- for each row you fill in, you also need to capture the corresponding flag in this box. First team to capture all flags AND finish the worksheet correctly wins. Your team is on call for Cell-071. The grid-monitor service is dark; Grid Command needs it back. Diagnose what failed and bring it up. As you work, write the exact commands you run on the scavenger hunt sheet.',
        scenario: 'A voltage spike at 14:31 dropped the eth1 interface. grid-sync requires network-online.target; grid-monitor requires grid-sync. The whole dependency chain above networking collapsed. The services never recovered because the restart timer expired before the interface came back up. The operations log was mid-write when power failed. Your job: SSH session is open. Use the W1 tool families -- systemctl, journalctl, ip, ss, the CLI -- to diagnose and fix. Each command on your worksheet is one a real Linux engineer would run here.',
        outro: 'All five services are running. Cell-071 is back on the grid. Grid Command acknowledges recovery. Now finish the worksheet -- the commands you ran are your answers. Submit to your instructor when both are complete.'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-071',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\n*** SCAVENGER HUNT #1 -- IN-CLASS ACTIVITY ***\n\nWelcome to CELL-071. Cell status: DEGRADED.\ngrid-monitor.service is not running. The service chain failed.\n\nYour mission: diagnose, fix, and capture flags as you go.\nWrite every command you run on the scavenger hunt sheet.\n\nStart here:  systemctl status\n             ip link show\n             journalctl -xb\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal',  label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',     label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',     label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',     label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
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
                                'notes.txt': {
                                    type: 'file',
                                    content: 'Cell came back online from surge at 14:33. Haven\'t checked services yet.\nKnown dependency order: networking -> sshd -> cron -> grid-sync -> grid-monitor\nGrid-sync unit file is at /etc/systemd/system/grid-sync.service\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'systemctl status\nip link show\nsystemctl status grid-sync\nsystemctl status grid-monitor\njournalctl -u grid-sync -n 20\n'
                                },
                                '.ssh': {
                                    type: 'dir',
                                    children: {
                                        'authorized_keys': {
                                            type: 'file',
                                            content: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOperatorKeyCell071GridAccess operator@grid-command\n'
                                        }
                                    }
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
                            content: 'cell-071\n'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsyslog:x:104:110::/home/syslog:/usr/sbin/nologin\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\nsvc-monitor:x:1001:1001:Grid Monitor Service:/nonexistent:/bin/false\n'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'operator': {
                                    type: 'file',
                                    content: 'operator ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/sbin/ip, /sbin/iptables\n'
                                }
                            }
                        },
                        'systemd': {
                            type: 'dir',
                            children: {
                                'system': {
                                    type: 'dir',
                                    children: {
                                        'grid-sync.service': {
                                            type: 'file',
                                            content: '[Unit]\nDescription=Grid Synchronization Service\nAfter=network-online.target\nRequires=network-online.target\n\n[Service]\nType=simple\nUser=svc-monitor\nExecStart=/opt/cell-services/grid-sync.sh\nRestart=on-failure\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target\n'
                                        },
                                        'grid-monitor.service': {
                                            type: 'file',
                                            content: '[Unit]\nDescription=Grid Monitor Service\nAfter=grid-sync.service\nRequires=grid-sync.service\n\n[Service]\nType=simple\nUser=svc-monitor\nExecStart=/opt/cell-services/grid-monitor.sh\nRestart=on-failure\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target\n'
                                        }
                                    }
                                }
                            }
                        },
                        'ssh': {
                            type: 'dir',
                            children: {
                                'sshd_config': {
                                    type: 'file',
                                    content: '# OpenSSH Server Configuration -- cell-071\nPort 22\nProtocol 2\nHostKey /etc/ssh/ssh_host_rsa_key\nHostKey /etc/ssh/ssh_host_ed25519_key\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nAuthorizedKeysFile .ssh/authorized_keys\nX11Forwarding no\nPrintMotd no\nAcceptEnv LANG LC_*\nSubsystem sftp /usr/lib/openssh/sftp-server\n'
                                }
                            }
                        },
                        'cron.d': {
                            type: 'dir',
                            children: {
                                'cell-ops': {
                                    type: 'file',
                                    content: '# Cell-071 hourly health check\n# Runs only when cron is active\n0 * * * * svc-monitor /opt/cell-services/healthcheck.sh >> /var/log/cell-ops/ops.log 2>&1\n'
                                }
                            }
                        },
                        'netplan': {
                            type: 'dir',
                            children: {
                                '00-installer-config.yaml': {
                                    type: 'file',
                                    content: 'network:\n  version: 2\n  renderer: networkd\n  ethernets:\n    eth0:\n      dhcp4: true\n    eth1:\n      addresses:\n        - 10.0.1.71/24\n      nameservers:\n        addresses: [10.0.1.1]\n'
                                }
                            }
                        },
                        'network': {
                            type: 'dir',
                            children: {
                                'interfaces': {
                                    type: 'file',
                                    content: '# This file is legacy. Netplan is active on this system.\n# See /etc/netplan/00-installer-config.yaml\n'
                                }
                            }
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
                                    content: '#!/bin/bash\n# Grid Synchronization Service\n# Connects cell-071 to the sector-1 grid fabric\nSOCKET=/run/grid-sync.sock\nTARGET=10.0.1.1\nLOG=/var/log/cell-ops/ops.log\n\necho "grid-sync: starting, target=$TARGET" >> $LOG\nwhile true; do\n    if ping -c1 -W2 $TARGET > /dev/null 2>&1; then\n        STATUS="SYNC_OK"\n    else\n        STATUS="SYNC_FAIL"\n    fi\n    echo "{\"timestamp\":\"$(date -Iseconds)\",\"service\":\"grid-sync\",\"status\":\"$STATUS\",\"target\":\"$TARGET\"}" >> $LOG\n    touch $SOCKET\n    sleep 30\ndone\n'
                                },
                                'grid-monitor.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Grid Monitor Service\n# Polls grid-sync socket, writes status to ops.log\nPOLL_INTERVAL=90\nTARGET=10.0.1.1\nLOG=/var/log/cell-ops/ops.log\nSOCKET=/run/grid-sync.sock\n\necho "grid-monitor: starting" >> $LOG\nwhile true; do\n    NODES=$(ip neigh show | grep -c REACHABLE || echo 0)\n    echo "{\"timestamp\":\"$(date -Iseconds)\",\"service\":\"grid-monitor\",\"status\":\"MONITOR_OK\",\"nodes\":$NODES}" >> $LOG\n    sleep $POLL_INTERVAL\ndone\n'
                                },
                                'watchdog.conf': {
                                    type: 'file',
                                    content: '# Grid Monitor Watchdog Configuration\nPOLL_INTERVAL=90\nTARGET=10.0.1.1\nLOG_PATH=/var/log/cell-ops/ops.log\nSOCKET=/run/grid-sync.sock\n'
                                },
                                'healthcheck.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Hourly health check -- runs via cron\necho "{\"timestamp\":\"$(date -Iseconds)\",\"service\":\"healthcheck\",\"status\":\"OK\",\"uptime\":\"$(uptime -p)\"}" \n'
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
                                'cell-ops': {
                                    type: 'dir',
                                    children: {
                                        'ops.log': {
                                            type: 'file',
                                            // Last 47 bytes are truncated mid-JSON, simulating power-loss mid-write
                                            content: '{"timestamp":"2026-04-10T13:45:00","service":"grid-monitor","status":"MONITOR_OK","nodes":4}\n{"timestamp":"2026-04-10T14:15:00","service":"grid-monitor","status":"MONITOR_OK","nodes":4}\n{"timestamp":"2026-04-10T14:31:44","status":"SYNC_OK","nodes":4,"latten'
                                        },
                                        'ops.log.1': {
                                            type: 'file',
                                            content: '{"timestamp":"2026-04-09T00:00:00","service":"grid-monitor","status":"MONITOR_OK","nodes":4}\n{"timestamp":"2026-04-09T12:00:00","service":"grid-sync","status":"SYNC_OK","target":"10.0.1.1"}\n{"timestamp":"2026-04-09T23:59:00","service":"grid-monitor","status":"MONITOR_OK","nodes":4}\n'
                                        },
                                        '.ops.log.swp': {
                                            type: 'file',
                                            // vim swap file containing recoverable content
                                            content: 'Vim swap file recovery artifact\nOriginal file: /var/log/cell-ops/ops.log\nTimestamp: 2026-04-10T14:31:44\n\nRecovered content:\n{"timestamp":"2026-04-10T13:45:00","service":"grid-monitor","status":"MONITOR_OK","nodes":4}\n{"timestamp":"2026-04-10T14:15:00","service":"grid-monitor","status":"MONITOR_OK","nodes":4}\n{"timestamp":"2026-04-10T14:31:44","service":"grid-sync","status":"SYNC_OK","nodes":4,"latency_ms":12}\n'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Apr 10 14:31:44 cell-071 kernel: e1000e: eth1 NIC Link is Down\nApr 10 14:31:44 cell-071 systemd-networkd[433]: eth1: Lost carrier\nApr 10 14:31:45 cell-071 systemd[1]: systemd-networkd.service: network-online.target not satisfied\nApr 10 14:31:46 cell-071 systemd[1]: grid-sync.service: Dependency failed\nApr 10 14:31:46 cell-071 systemd[1]: grid-sync.service: Failed with result \'dependency\'.\nApr 10 14:31:46 cell-071 systemd[1]: grid-monitor.service: Dependency failed\nApr 10 14:31:46 cell-071 systemd[1]: grid-monitor.service: Failed with result \'dependency\'.\nApr 10 14:33:12 cell-071 kernel: e1000e: eth1 NIC Link is Up 1000 Mbps Full Duplex\nApr 10 14:33:12 cell-071 systemd-networkd[433]: eth1: Gained carrier\nApr 10 16:00:01 cell-071 CRON[8801]: (svc-monitor) CMD -- SKIP: cron.service is not running\n'
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: 'Apr 10 13:55:22 cell-071 sshd[7412]: Accepted publickey for operator from 10.0.0.1 port 44231 ssh2\nApr 10 13:55:22 cell-071 sshd[7412]: pam_unix(sshd:session): session opened for user operator\nApr 10 14:31:44 cell-071 systemd-logind[685]: Power button pressed -- surge event recorded\nApr 10 16:34:00 cell-071 sshd[9001]: Accepted publickey for operator from 10.0.0.1 port 51003 ssh2\n'
                                },
                                'dpkg.log': {
                                    type: 'file',
                                    content: '2026-04-08 09:14:33 startup packages configure\n2026-04-08 09:14:33 status installed linux-image-5.15.0-97-generic:amd64 5.15.0-97.107\n2026-04-08 09:14:40 status installed systemd:amd64 249.11-0ubuntu3.12\n'
                                }
                            }
                        }
                    }
                },
                'run': {
                    type: 'dir',
                    children: {
                        'systemd': {
                            type: 'dir',
                            children: {
                                'units': {
                                    type: 'dir',
                                    children: {
                                        'grid-sync.service.failed': {
                                            type: 'file',
                                            content: '# Unit failure marker\nResult=dependency\nTimestamp=2026-04-10T14:31:46\n'
                                        },
                                        'grid-monitor.service.failed': {
                                            type: 'file',
                                            content: '# Unit failure marker\nResult=dependency\nTimestamp=2026-04-10T14:31:46\n'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                },
                'proc': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // INTERNAL STATE (BoxEngine reads these)
    // ═══════════════════════════════════════════════════════

    // Track which services operator has started
    _serviceState: {
        networking: 'degraded',   // eth1 DOWN at start
        sshd: 'failed',
        cron: 'stopped',
        'grid-sync': 'failed',
        'grid-monitor': 'stopped'
    },

    // Track whether log recovery file was created
    _logRecovered: false,

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // ip command -- interface management and route display
        'ip': function(args, term, engine) {
            const sub = args[0] || '';
            const obj = args[1] || '';
            const action = args[2] || '';

            if (sub === 'link' && obj === 'show') {
                engine.awardFlag('cmd6');
                const eth1State = engine.config._serviceState.networking === 'active' ? 'UP' : 'DOWN';
                const eth1Flags = engine.config._serviceState.networking === 'active'
                    ? 'BROADCAST,MULTICAST,UP,LOWER_UP'
                    : 'BROADCAST,MULTICAST';
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT\n    link/ether 52:54:00:ab:11:01 brd ff:ff:ff:ff:ff:ff\n3: eth1: <${eth1Flags}> mtu 1500 qdisc fq_codel state ${eth1State} mode DEFAULT\n    link/ether 52:54:00:ab:11:02 brd ff:ff:ff:ff:ff:ff`;
            }

            if (sub === 'link' && obj === 'set') {
                const iface = action;
                const updown = args[3] || '';
                if (iface === 'eth1' && updown === 'up') {
                    engine.awardFlag('cmd5');
                    engine.config._serviceState.networking = 'active';
                    return '';
                }
                return `RTNETLINK answers: Operation not permitted`;
            }

            if (sub === 'addr' || (sub === 'address' && !obj)) {
                engine.awardFlag('cmd6');
                const eth1Line = engine.config._serviceState.networking === 'active'
                    ? '3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP\n    inet 10.0.1.71/24 brd 10.0.1.255 scope global eth1\n       valid_lft forever preferred_lft forever'
                    : '3: eth1: <BROADCAST,MULTICAST> mtu 1500 qdisc fq_codel state DOWN\n    (no inet address assigned)';
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP\n    inet 10.0.0.71/24 brd 10.0.0.255 scope global eth0\n       valid_lft forever preferred_lft forever\n${eth1Line}`;
            }

            if (sub === 'route' && (obj === 'show' || obj === '')) {
                const routes = 'default via 10.0.0.1 dev eth0 proto dhcp src 10.0.0.71 metric 100\n10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.71';
                if (engine.config._serviceState.networking === 'active') {
                    return routes + '\n10.0.1.0/24 dev eth1 proto kernel scope link src 10.0.1.71';
                }
                return routes;
            }

            if (sub === 'neigh' && obj === 'show') {
                if (engine.config._serviceState.networking !== 'active') {
                    return '10.0.0.1 dev eth0 lladdr 52:54:00:ab:00:01 REACHABLE';
                }
                return '10.0.0.1 dev eth0 lladdr 52:54:00:ab:00:01 REACHABLE\n10.0.1.1 dev eth1 lladdr 52:54:00:ab:01:01 REACHABLE\n10.0.1.2 dev eth1 lladdr 52:54:00:ab:01:02 STALE\n10.0.1.3 dev eth1 lladdr 52:54:00:ab:01:03 REACHABLE\n10.0.1.4 dev eth1 lladdr 52:54:00:ab:01:04 REACHABLE';
            }

            return `Usage: ip [OPTION] OBJECT COMMAND\nOBJECTS: address, link, route, neigh\nExamples:\n  ip link show\n  ip link set eth1 up\n  ip addr\n  ip route show`;
        },

        // systemctl -- service management (restricted to sudo-allowed services)
        'systemctl': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: systemctl [command] [unit]\nCommands: status, start, stop, restart, enable, disable, is-active, list-units, daemon-reload';
            }

            const sub = args[0];
            const rawUnit = args[1] || '';
            // Strip .service suffix for internal lookup
            const unit = rawUnit.replace(/\.service$/, '');

            const knownServices = ['networking', 'systemd-networkd', 'sshd', 'ssh', 'cron', 'grid-sync', 'grid-monitor'];

            // Map ssh alias
            const resolvedUnit = (unit === 'ssh') ? 'sshd' : unit;

            if (sub === 'status') {
                if (unit) {
                    engine.awardFlag('cmd2');
                }
                if (!unit) {
                    // Brief system overview
                    const degraded = Object.values(engine.config._serviceState).filter(s => s !== 'active').length;
                    return `cell-071\n    State: ${degraded > 0 ? 'degraded' : 'running'}\n     Jobs: 0 queued\n   Failed: ${degraded} units\n  Since: Thu 2026-04-10 14:33:12 UTC; 2h 1min ago\n\nRun: systemctl status <service-name> for details`;
                }

                if (resolvedUnit === 'networking' || resolvedUnit === 'systemd-networkd') {
                    const st = engine.config._serviceState.networking;
                    if (st === 'active') {
                        return `\u25CF systemd-networkd.service - Network Configuration\n     Loaded: loaded (/lib/systemd/system/systemd-networkd.service; enabled)\n     Active: active (running) since Thu 2026-04-10 16:35:01 UTC; 0min ago\n   Main PID: 433 (systemd-networkd)\n\nApr 10 16:35:01 cell-071 systemd-networkd[433]: eth1: Gained carrier\nApr 10 16:35:01 cell-071 systemd-networkd[433]: eth1: Configured with address 10.0.1.71/24`;
                    }
                    return `\u25CF systemd-networkd.service - Network Configuration\n     Loaded: loaded (/lib/systemd/system/systemd-networkd.service; enabled)\n     Active: active (running) since Thu 2026-04-10 14:33:12 UTC; 2h 1min ago\n   Main PID: 433 (systemd-networkd)\n\nApr 10 14:33:12 cell-071 systemd-networkd[433]: eth1: Lost carrier\nApr 10 14:33:12 cell-071 systemd-networkd[433]: eth1: State is DOWN\n\n*** WARNING: eth1 is DOWN -- network-online.target not satisfied ***`;
                }

                if (resolvedUnit === 'sshd') {
                    const st = engine.config._serviceState.sshd;
                    if (st === 'active') {
                        return `\u25CF ssh.service - OpenBSD Secure Shell server\n     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)\n     Active: active (running) since Thu 2026-04-10 16:35:05 UTC; 0min ago\n   Main PID: 9001 (sshd)\n\nApr 10 16:35:05 cell-071 systemd[1]: Started OpenBSD Secure Shell server.`;
                    }
                    return `\u25CF ssh.service - OpenBSD Secure Shell server\n     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)\n     Active: failed (Result: exit-code) since Thu 2026-04-10 14:31:46 UTC; 2h 1min ago\n\nApr 10 14:31:46 cell-071 systemd[1]: ssh.service: Failed to bind to port 22: Network unreachable\nApr 10 14:31:46 cell-071 systemd[1]: ssh.service: Failed with result 'exit-code'.\n\n*** Fix networking first (eth1 must be UP) ***`;
                }

                if (resolvedUnit === 'cron') {
                    const st = engine.config._serviceState.cron;
                    if (st === 'active') {
                        return `\u25CF cron.service - Regular background program processing daemon\n     Loaded: loaded (/lib/systemd/system/cron.service; enabled)\n     Active: active (running) since Thu 2026-04-10 16:35:07 UTC; 0min ago\n   Main PID: 9010 (cron)\n\nApr 10 16:35:07 cell-071 systemd[1]: Started cron.`;
                    }
                    return `\u25CF cron.service - Regular background program processing daemon\n     Loaded: loaded (/lib/systemd/system/cron.service; enabled)\n     Active: inactive (dead) since Thu 2026-04-10 14:31:46 UTC; 2h 1min ago\n\nApr 10 14:31:46 cell-071 systemd[1]: cron.service: Stopped -- multi-user.target degraded.`;
                }

                if (resolvedUnit === 'grid-sync') {
                    const st = engine.config._serviceState['grid-sync'];
                    if (st === 'active') {
                        return `\u25CF grid-sync.service - Grid Synchronization Service\n     Loaded: loaded (/etc/systemd/system/grid-sync.service; enabled)\n     Active: active (running) since Thu 2026-04-10 16:35:10 UTC; 0min ago\n   Main PID: 9020 (grid-sync.sh)\n\nApr 10 16:35:10 cell-071 systemd[1]: Started Grid Synchronization Service.\nApr 10 16:35:10 cell-071 grid-sync.sh[9020]: grid-sync: starting, target=10.0.1.1`;
                    }
                    return `\u25CF grid-sync.service - Grid Synchronization Service\n     Loaded: loaded (/etc/systemd/system/grid-sync.service; enabled)\n     Active: failed (Result: dependency) since Thu 2026-04-10 14:31:46 UTC; 2h 1min ago\n\nApr 10 14:31:46 cell-071 systemd[1]: grid-sync.service: Dependency failed.\nApr 10 14:31:46 cell-071 systemd[1]: Dependency failed for Grid Synchronization Service.\n\n*** Requires: network-online.target -- bring eth1 UP first ***`;
                }

                if (resolvedUnit === 'grid-monitor') {
                    const st = engine.config._serviceState['grid-monitor'];
                    if (st === 'active') {
                        return `\u25CF grid-monitor.service - Grid Monitor Service\n     Loaded: loaded (/etc/systemd/system/grid-monitor.service; enabled)\n     Active: active (running) since Thu 2026-04-10 16:35:12 UTC; 0min ago\n   Main PID: 9030 (grid-monitor.sh)\n\nApr 10 16:35:12 cell-071 systemd[1]: Started Grid Monitor Service.\nApr 10 16:35:12 cell-071 grid-monitor.sh[9030]: grid-monitor: starting`;
                    }
                    return `\u25CF grid-monitor.service - Grid Monitor Service\n     Loaded: loaded (/etc/systemd/system/grid-monitor.service; enabled)\n     Active: inactive (dead) since Thu 2026-04-10 14:31:46 UTC; 2h 1min ago\n\nApr 10 14:31:46 cell-071 systemd[1]: grid-monitor.service: Dependency failed (grid-sync not running).`;
                }

                if (resolvedUnit === 'network-online') {
                    return `\u25CF network-online.target - Network is Online\n     Loaded: loaded (/lib/systemd/system/network-online.target; static)\n     Active: ${engine.config._serviceState.networking === 'active' ? 'active' : 'inactive (dead)'}\n\n${engine.config._serviceState.networking !== 'active' ? 'Waiting for: systemd-networkd-wait-online.service\nRequired by: grid-sync.service' : 'All network interfaces configured.'}`;
                }

                return `Unit ${rawUnit || unit} not found.\nRun: systemctl list-units for active units.`;
            }

            if (sub === 'start' || sub === 'restart') {
                if (sub === 'start') engine.awardFlag('cmd10');
                if (sub === 'restart') engine.awardFlag('cmd11');
                // Enforce dependency ordering -- provide informative errors when deps not met

                if (resolvedUnit === 'networking' || resolvedUnit === 'systemd-networkd') {
                    if (engine.config._serviceState.networking !== 'active') {
                        return `Job for systemd-networkd.service failed.\neth1 interface is DOWN. Run: sudo ip link set eth1 up`;
                    }
                    engine.config._serviceState.networking = 'active';
                    return '';
                }

                if (resolvedUnit === 'sshd') {
                    if (engine.config._serviceState.networking !== 'active') {
                        return `Job for ssh.service failed because the control process exited with error code.\nError: Cannot bind to port 22 -- eth1 is DOWN.\nFix networking first.`;
                    }
                    engine.config._serviceState.sshd = 'active';
                    return '';
                }

                if (resolvedUnit === 'cron') {
                    if (engine.config._serviceState.sshd !== 'active') {
                        return `Job for cron.service failed.\nmulti-user.target is degraded -- sshd must be running first.`;
                    }
                    engine.config._serviceState.cron = 'active';
                    return '';
                }

                if (resolvedUnit === 'grid-sync') {
                    if (engine.config._serviceState.networking !== 'active') {
                        return `Job for grid-sync.service failed because a dependency job failed.\nDependency: network-online.target is not satisfied.\nBring eth1 UP first: sudo ip link set eth1 up`;
                    }
                    engine.config._serviceState['grid-sync'] = 'active';
                    return '';
                }

                if (resolvedUnit === 'grid-monitor') {
                    if (engine.config._serviceState['grid-sync'] !== 'active') {
                        return `Job for grid-monitor.service failed because a dependency job failed.\nDependency: grid-sync.service is not running.`;
                    }
                    engine.config._serviceState['grid-monitor'] = 'active';
                    return '';
                }

                if (resolvedUnit === 'netplan' || resolvedUnit === 'systemd-networkd-wait-online') {
                    return `Cannot start ${rawUnit} directly. Run: sudo netplan apply`;
                }

                return `Failed to start ${rawUnit}: Unit not found.`;
            }

            if (sub === 'is-active') {
                const stateMap = {
                    networking: engine.config._serviceState.networking,
                    'systemd-networkd': engine.config._serviceState.networking,
                    sshd: engine.config._serviceState.sshd,
                    ssh: engine.config._serviceState.sshd,
                    cron: engine.config._serviceState.cron,
                    'grid-sync': engine.config._serviceState['grid-sync'],
                    'grid-monitor': engine.config._serviceState['grid-monitor']
                };
                const s = stateMap[resolvedUnit];
                if (s === 'active') return 'active';
                if (s === 'failed') return 'failed';
                return 'inactive';
            }

            if (sub === 'list-units') {
                const svc = engine.config._serviceState;
                const fmt = (name, st) => {
                    const loaded = 'loaded';
                    const active = st === 'active' ? 'active' : (st === 'failed' ? 'failed' : 'inactive');
                    const sub2 = st === 'active' ? 'running' : (st === 'failed' ? 'failed' : 'dead');
                    return `  ${name.padEnd(38)} ${loaded.padEnd(8)} ${active.padEnd(10)} ${sub2}`;
                };
                return `UNIT                                   LOAD     ACTIVE     SUB\n${fmt('cron.service', svc.cron)}\n${fmt('grid-monitor.service', svc['grid-monitor'])}\n${fmt('grid-sync.service', svc['grid-sync'])}\n${fmt('ssh.service', svc.sshd)}\n${fmt('systemd-networkd.service', svc.networking)}\n\n5 listed.`;
            }

            if (sub === 'daemon-reload') {
                engine.awardFlag('cmd12');
                return '';
            }

            if (sub === 'enable') {
                return `Created symlink /etc/systemd/system/multi-user.target.wants/${rawUnit} -> /etc/systemd/system/${rawUnit}.`;
            }

            return `Unknown systemctl subcommand: ${sub}\nTry: systemctl status, start, restart, is-active, list-units`;
        },

        // netplan apply
        'netplan': function(args, term, engine) {
            if (args[0] === 'apply') {
                if (engine.config._serviceState.networking !== 'active') {
                    return `** (generate): WARNING **: eth1 state is DOWN -- bringing up via configuration\n(applied)\neth1 configured with 10.0.1.71/24`;
                }
                return `(nothing changed)`;
            }
            return `Usage: netplan [apply|generate|try|info]`;
        },

        // journalctl -- service journal output
        'journalctl': function(args, term, engine) {
            // Detect combined short flags like -fu or -uf
            const flat = args.join(' ');
            const hasFollow = args.includes('-f') || args.some(a => /^-[a-z]*f[a-z]*$/.test(a));
            const hasU     = args.includes('-u') || args.some(a => /^-[a-z]*u[a-z]*$/.test(a));
            const hasN30   = args.includes('-n') && (args[args.indexOf('-n') + 1] === '30');
            const hasNoPager = args.includes('--no-pager');
            if (hasFollow && hasU) {
                engine.awardFlag('cmd4');
            }
            if (hasU && hasN30 && hasNoPager) {
                engine.awardFlag('cmd3');
            }
            const uFlag = args.indexOf('-u');
            const unit = uFlag >= 0 ? (args[uFlag + 1] || '').replace(/\.service$/, '') : '';
            const n = args.indexOf('-n') >= 0 ? parseInt(args[args.indexOf('-n') + 1]) : 20;

            if (unit === 'grid-sync') {
                if (engine.config._serviceState['grid-sync'] === 'active') {
                    return `-- Journal begins at Thu 2026-04-10 14:31:44 UTC --\nApr 10 16:35:10 cell-071 systemd[1]: Started Grid Synchronization Service.\nApr 10 16:35:10 cell-071 grid-sync.sh[9020]: grid-sync: starting, target=10.0.1.1\nApr 10 16:35:40 cell-071 grid-sync.sh[9020]: {"timestamp":"2026-04-10T16:35:40","service":"grid-sync","status":"SYNC_OK"}`;
                }
                return `-- Journal begins at Thu 2026-04-10 14:31:44 UTC --\nApr 10 14:31:46 cell-071 systemd[1]: grid-sync.service: Dependency failed.\nApr 10 14:31:46 cell-071 systemd[1]: Dependency failed for Grid Synchronization Service.\nApr 10 14:31:46 cell-071 systemd[1]: grid-sync.service: Job grid-sync.service/start failed with result 'dependency'.\n\nThe unit requires network-online.target which is not active because eth1 is DOWN.`;
            }

            if (unit === 'grid-monitor') {
                if (engine.config._serviceState['grid-monitor'] === 'active') {
                    return `-- Journal begins at Thu 2026-04-10 14:31:44 UTC --\nApr 10 16:35:12 cell-071 systemd[1]: Started Grid Monitor Service.\nApr 10 16:35:12 cell-071 grid-monitor.sh[9030]: grid-monitor: starting\nApr 10 16:37:42 cell-071 grid-monitor.sh[9030]: {"service":"grid-monitor","status":"MONITOR_OK","nodes":4}`;
                }
                return `-- Journal begins at Thu 2026-04-10 14:31:44 UTC --\nApr 10 14:31:46 cell-071 systemd[1]: grid-monitor.service: Dependency failed.\nApr 10 14:31:46 cell-071 systemd[1]: Dependency failed for Grid Monitor Service.\nApr 10 14:31:46 cell-071 systemd[1]: grid-monitor.service: Requires=grid-sync.service but grid-sync.service failed.`;
            }

            // Generic journal output
            return `-- Journal begins at Thu 2026-04-10 14:31:44 UTC --\nApr 10 14:31:44 cell-071 kernel: e1000e: eth1 NIC Link is Down\nApr 10 14:31:46 cell-071 systemd[1]: grid-sync.service: Dependency failed.\nApr 10 14:31:46 cell-071 systemd[1]: grid-monitor.service: Dependency failed.\nApr 10 14:33:12 cell-071 kernel: e1000e: eth1 NIC Link is Up 1000 Mbps Full Duplex\nApr 10 16:34:00 cell-071 sshd[9001]: Accepted publickey for operator from 10.0.0.1\n\nHint: journalctl -u grid-sync -n 50 for service-specific output`;
        },

        // ping -- test connectivity
        'ping': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            const count = args.indexOf('-c') >= 0 ? parseInt(args[args.indexOf('-c') + 1]) : 4;

            if (!target) return 'Usage: ping [-c count] <destination>';

            if (target === '127.0.0.1' || target === 'localhost') {
                return `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.031 ms\n64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.028 ms\n\n--- 127.0.0.1 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`;
            }

            if (target === '10.0.0.1') {
                return `PING 10.0.0.1 (10.0.0.1) 56(84) bytes of data.\n64 bytes from 10.0.0.1: icmp_seq=1 ttl=64 time=0.8 ms\n64 bytes from 10.0.0.1: icmp_seq=2 ttl=64 time=0.7 ms\n\n--- 10.0.0.1 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`;
            }

            if (target === '10.0.1.1') {
                if (engine.config._serviceState.networking === 'active') {
                    return `PING 10.0.1.1 (10.0.1.1) 56(84) bytes of data.\n64 bytes from 10.0.1.1: icmp_seq=1 ttl=64 time=1.2 ms\n64 bytes from 10.0.1.1: icmp_seq=2 ttl=64 time=1.1 ms\n\n--- 10.0.1.1 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`;
                }
                return `PING 10.0.1.1 (10.0.1.1) 56(84) bytes of data.\nFrom 10.0.0.71 icmp_seq=1 Destination Host Unreachable\n\n--- 10.0.1.1 ping statistics ---\n1 packets transmitted, 0 received, +1 errors, 100% packet loss\n\neth1 is DOWN -- grid network unreachable`;
            }

            return `ping: connect: Network is unreachable`;
        },

        // strings -- recover printable text from binary/corrupt files
        'strings': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: strings [options] <file>';

            if (target.includes('.ops.log.swp') || target.includes('/var/log/cell-ops/.ops.log.swp')) {
                const content = 'Vim swap file recovery artifact\nOriginal file: /var/log/cell-ops/ops.log\nTimestamp: 2026-04-10T14:31:44\n{"timestamp":"2026-04-10T13:45:00","service":"grid-monitor","status":"MONITOR_OK","nodes":4}\n{"timestamp":"2026-04-10T14:15:00","service":"grid-monitor","status":"MONITOR_OK","nodes":4}\n{"timestamp":"2026-04-10T14:31:44","service":"grid-sync","status":"SYNC_OK","nodes":4,"latency_ms":12}';
                return content;
            }

            if (target.includes('ops.log') && !target.includes('.swp')) {
                return '{"timestamp":"2026-04-10T13:45:00","service":"grid-monitor","status":"MONITOR_OK","nodes":4}\n{"timestamp":"2026-04-10T14:15:00","service":"grid-monitor","status":"MONITOR_OK","nodes":4}\n{"timestamp":"2026-04-10T14:31:44","status":"SYNC_OK","nodes":4,"latten';
            }

            return `strings: ${target}: No such file or directory`;
        },

        // vim -- open files; special recovery behavior for swap file
        'vim': function(args, term, engine) {
            const rFlag = args.indexOf('-r') >= 0;
            const target = args.find(a => !a.startsWith('-')) || '';

            if (rFlag && target.includes('ops.log')) {
                // Simulate vim swap recovery -- creates ops.log.recovered
                engine.config._logRecovered = true;
                term.fs['/'].children.var.children.log.children['cell-ops'].children['ops.log.recovered'] = {
                    type: 'file',
                    content: '{"timestamp":"2026-04-10T13:45:00","service":"grid-monitor","status":"MONITOR_OK","nodes":4}\n{"timestamp":"2026-04-10T14:15:00","service":"grid-monitor","status":"MONITOR_OK","nodes":4}\n{"timestamp":"2026-04-10T14:31:44","service":"grid-sync","status":"SYNC_OK","nodes":4,"latency_ms":12}\n'
                };
                return `Swap file ".ops.log.swp" found.\nFile recovered. Using swap file "/var/log/cell-ops/.ops.log.swp".\n[Recovered] ops.log -- recovery complete. Saved as ops.log.recovered.\nCheck :!ls /var/log/cell-ops/ to verify.`;
            }

            return `[VIM simulation] Cannot open interactive editor in this terminal.\nTo recover the ops.log from its swap file, run:\n  vim -r /var/log/cell-ops/ops.log`;
        },

        // tmux -- session multiplexer (sim only; awards flag for cmd1)
        'tmux': function(args, term, engine) {
            engine.awardFlag('cmd1');
            const sub = args[0] || 'new';
            if (sub === 'new' || sub === 'new-session') {
                const name = args.indexOf('-s') >= 0 ? args[args.indexOf('-s') + 1] : 'main';
                return `[tmux] new session '${name}' created. (In this sim you stay in the same terminal; your work is now persistent across SSH drops.)`;
            }
            if (sub === 'ls' || sub === 'list-sessions') {
                return `main: 1 windows (created Thu Apr 10 16:00:00 2026)`;
            }
            return `tmux: started session.`;
        },

        // screen -- alternative multiplexer (also cmd1)
        'screen': function(args, term, engine) {
            engine.awardFlag('cmd1');
            return `[screen] session started.`;
        },

        // ss -- socket statistics
        'ss': function(args, term, engine) {
            // Any ss with -l (listen) flag awards cmd7
            const flat = args.join('');
            const hasL = args.some(a => /^-[a-z]*l[a-z]*$/.test(a));
            if (hasL) {
                engine.awardFlag('cmd7');
            }
            const hasT = args.some(a => /^-[a-z]*t[a-z]*$/.test(a));
            const hasN = args.some(a => /^-[a-z]*n[a-z]*$/.test(a));
            const hasP = args.some(a => /^-[a-z]*p[a-z]*$/.test(a));
            if (hasT && hasL) {
                const procCol = hasP ? '         Process' : '';
                const procRows = hasP
                    ? '\nLISTEN   0      4096    0.0.0.0:22          0.0.0.0:*          users:(("sshd",pid=9001,fd=3))\nLISTEN   0      511     0.0.0.0:80          0.0.0.0:*          users:(("nginx",pid=1845,fd=6))\nLISTEN   0      511     0.0.0.0:443         0.0.0.0:*          users:(("python3",pid=12847,fd=4))'
                    : '\nLISTEN   0      4096    0.0.0.0:22          0.0.0.0:*\nLISTEN   0      511     0.0.0.0:80          0.0.0.0:*\nLISTEN   0      511     0.0.0.0:443         0.0.0.0:*';
                return `State    Recv-Q Send-Q  Local Address:Port  Peer Address:Port${procCol}` + procRows;
            }
            return `Usage: ss [-tunap] [filter]\n  -t  TCP\n  -u  UDP\n  -l  listening\n  -n  numeric\n  -p  show process`;
        },

        // ps -- process snapshot
        'ps': function(args, term, engine) {
            const flat = args.join('');
            const isEf = args.includes('-ef') || (args.includes('-e') && args.includes('-f'));
            const isAux = args.includes('aux') || args.includes('-aux');
            if (isEf || isAux) {
                engine.awardFlag('cmd8');
                if (isEf) {
                    return `UID          PID    PPID  C STIME TTY          TIME CMD\nroot           1       0  0 Apr10 ?        00:00:09 /sbin/init\nroot         433       1  0 Apr10 ?        00:00:02 /lib/systemd/systemd-networkd\nroot         842       1  0 Apr10 ?        00:00:01 sshd: /usr/sbin/sshd -D\noperator    1421     842  0 16:34 pts/0    00:00:00 -bash\nroot       12847       1  0 16:30 ?        00:00:00 python3 /tmp/rogue.py\noperator    1432    1421  0 16:35 pts/0    00:00:00 ps -ef`;
                }
                return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot           1  0.0  0.1 167872 11392 ?        Ss   Apr10   0:09 /sbin/init\nroot         433  0.0  0.2  84512  9344 ?        Ss   Apr10   0:02 systemd-networkd\nroot         842  0.0  0.1  17448  6912 ?        Ss   Apr10   0:01 sshd: /usr/sbin/sshd -D\noperator    1421  0.0  0.1   8956  5120 pts/0    Ss   16:34   0:00 -bash\nroot       12847  0.1  0.3  62784 26432 ?        S    16:30   0:00 python3 /tmp/rogue.py`;
            }
            return `Usage: ps [-ef | aux]\n  -ef   full format, all processes\n  aux   BSD style, all users + processes`;
        },

        // grep -- pattern filter (awards cmd9 on any use)
        'grep': function(args, term, engine) {
            engine.awardFlag('cmd9');
            return `[grep] runs against piped input; in this sim grep returns no output as a standalone invocation. Pipe into it from another command: e.g. journalctl -u grid-sync | grep -i error`;
        },

        // ls -- directory listing with awareness of recovered file
        'ls': function(args, term, engine) {
            const longFlag = args.includes('-la') || args.includes('-l') || args.includes('-a') || args.includes('-al');
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (path.includes('cell-ops') || path === '/var/log/cell-ops' || path === '/var/log/cell-ops/') {
                let files = [
                    longFlag ? '-rw-r--r-- 1 svc-monitor svc-monitor  241 Apr 10 14:31 ops.log' : 'ops.log',
                    longFlag ? '-rw-r--r-- 1 svc-monitor svc-monitor  291 Apr 09 23:59 ops.log.1' : 'ops.log.1',
                    longFlag ? '-rw------- 1 svc-monitor svc-monitor 4096 Apr 10 14:31 .ops.log.swp' : '.ops.log.swp'
                ];
                if (engine.config._logRecovered) {
                    files.push(longFlag ? '-rw-r--r-- 1 operator   operator    288 Apr 10 16:35 ops.log.recovered' : 'ops.log.recovered');
                }
                if (longFlag) {
                    return `total ${16 + (engine.config._logRecovered ? 4 : 0)}\ndrwxr-xr-x 2 svc-monitor svc-monitor 4096 Apr 10 16:35 .\ndrwxr-xr-x 8 root        root        4096 Apr 10 14:31 ..\n${files.join('\n')}`;
                }
                return files.join('  ');
            }

            // Delegate to BoxEngine default filesystem walker
            return null;
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        // One flag per scavenger hunt worksheet row. Auto-captured when the
        // student runs the corresponding command in the terminal.
        { id: 'cmd1',  value: 'FLAG{ala-hunt1_cmd01_persistent_session}',     label: '01 — Persistent session',         description: 'Opened a tmux/screen session.',                                points: 50, autoCheck: true },
        { id: 'cmd2',  value: 'FLAG{ala-hunt1_cmd02_service_status}',         label: '02 — Service status',             description: 'Ran systemctl status against a service.',                      points: 50, autoCheck: true },
        { id: 'cmd3',  value: 'FLAG{ala-hunt1_cmd03_log_last_30}',            label: '03 — Last 30 service log lines',  description: 'Ran journalctl -u <svc> -n 30 --no-pager.',                    points: 50, autoCheck: true },
        { id: 'cmd4',  value: 'FLAG{ala-hunt1_cmd04_log_live_follow}',        label: '04 — Live-tail service log',      description: 'Ran journalctl -fu <svc> (or -f -u).',                         points: 50, autoCheck: true },
        { id: 'cmd5',  value: 'FLAG{ala-hunt1_cmd05_interface_up}',           label: '05 — Bring interface up',         description: 'Ran ip link set <iface> up.',                                  points: 50, autoCheck: true },
        { id: 'cmd6',  value: 'FLAG{ala-hunt1_cmd06_interface_show}',         label: '06 — Show interfaces',            description: 'Ran ip link show (or ip a/addr).',                             points: 50, autoCheck: true },
        { id: 'cmd7',  value: 'FLAG{ala-hunt1_cmd07_listening_sockets}',      label: '07 — Listening TCP sockets',      description: 'Ran ss -tlnp (or -tln, -tlp).',                                points: 50, autoCheck: true },
        { id: 'cmd8',  value: 'FLAG{ala-hunt1_cmd08_processes_all}',          label: '08 — All processes',              description: 'Ran ps -ef (or ps aux).',                                      points: 50, autoCheck: true },
        { id: 'cmd9',  value: 'FLAG{ala-hunt1_cmd09_filter_lines}',           label: '09 — Filter lines (grep)',        description: 'Used grep.',                                                   points: 50, autoCheck: true },
        { id: 'cmd10', value: 'FLAG{ala-hunt1_cmd10_service_start}',          label: '10 — Start a service',            description: 'Ran systemctl start <svc>.',                                   points: 50, autoCheck: true },
        { id: 'cmd11', value: 'FLAG{ala-hunt1_cmd11_service_restart}',        label: '11 — Restart a service',          description: 'Ran systemctl restart <svc>.',                                 points: 50, autoCheck: true },
        { id: 'cmd12', value: 'FLAG{ala-hunt1_cmd12_daemon_reload}',          label: '12 — Reload systemd manifest',    description: 'Ran systemctl daemon-reload.',                                 points: 50, autoCheck: true }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 400,
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
            text: 'Run systemctl status for each service in the dependency chain listed in ~/notes.txt. Start with networking -- check ip link show to see why it is degraded.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'The ops.log was being written when power failed. Check the log directory for recovery artifacts: ls -la /var/log/cell-ops/ -- look for hidden files.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'journalctl -u grid-sync -n 50 will show exactly why grid-sync refuses to start. Trace the dependency failure back to the interface level.',
            cost: 50,
            penalty: -50
        }
    ],

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'LPI-LPIC-1',
        mappings: [
            { flagId: 'flag1', objective: '101.4', description: 'Use Debian package management', skill: 'systemd service management and dependency resolution' },
            { flagId: 'flag1', objective: '109.1', description: 'Fundamentals of internet protocols', skill: 'Network interface management with ip' },
            { flagId: 'flag2', objective: '108.2', description: 'System logging', skill: 'Log analysis and recovery from swap artifacts' }
        ]
    }

};
