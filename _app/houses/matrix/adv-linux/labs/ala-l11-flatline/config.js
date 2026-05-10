/* ============================================================
   ALA-L11: Flatline
   Advanced Linux Administration -- CTF Lab
   Performance triage: rogue cron, memory leak, disk crisis
   ============================================================ */

const ALAL11Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Flatline',
    subtitle: 'Advanced Linux Administration -- Performance Triage',
    description: 'Cell-Flatline is critical. CPU spikes to 100% every 4 minutes. Memory climbs without stopping. Disk is at 94% and rising. Three independent problems. Fix them all before the cell goes offline.',
    difficulty: 'Intermediate',
    estimatedTime: 40,
    accent: '#ef4444',
    storageKey: 'hexworth_lab_ala_l11',
    registryId: 'ala-l11-flatline',
    trackerKey: 'lab_ala_l11',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-FLATLINE BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (128GB SSD)',
            'Network: eth0 link UP',
            'WARNING: Disk usage critical on /dev/sda1',
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
        intro: 'Grid Command is showing Cell-Flatline as CRITICAL. The cell monitoring dashboard shows three separate vitals alarms: CPU flatlines at 100% every 4 minutes, memory usage is climbing steadily with no workload to justify it, and disk utilization on /var just hit 94%. Any one of these would warrant immediate attention. All three together means this cell is hours from hard failure. Get in there and fix all three before the next grid health check at the top of the hour.',
        scenario: 'A misconfigured cron job installed during a deployment last week is re-indexing the entire filesystem every 4 minutes. The cell-cache service was deployed without a systemd MemoryMax limit and its binary has a memory leak that Grid Command engineering has been aware of but has not patched -- the workaround is to cap its memory in the unit file. The disk problem is a log file for the cell-stream service that has never been rotated -- 4.2 GB written by a single service with no logrotate config.',
        outro: 'All three performance problems resolved. Cell-Flatline CPU load is nominal. cell-cache memory consumption is bounded at 256M. Disk utilization on /var has dropped to below 80% after log rotation. Grid Command acknowledges the cell is back to operational status.'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-flatline',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to CELL-FLATLINE\nLast login: Thu Apr 10 09:00:01 2026 from 10.0.0.1\n\n*** CRITICAL: Three performance alarms active ***\n***   1. CPU spikes to 100% every ~4 minutes        ***\n***   2. Memory usage climbing: 2.1 GB used / 8 GB  ***\n***   3. Disk at 94% on /var -- write failures imminent ***\n\nType \'help\' for available commands.\n'
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
                                    content: 'MISSION: ALA-L11 -- Flatline\n\nThree performance problems. Fix all three.\n\n1. CPU: Something is consuming 100% CPU every ~4 minutes. Find it and remove it.\n   Verify: /opt/verify/check-cpu.sh\n\n2. Memory: cell-cache.service is consuming 2.1 GB with no upper limit.\n   Add MemoryMax=256M and restart.\n   Verify: /opt/verify/check-memory.sh\n\n3. Disk: /var is at 94%. A single log file is responsible.\n   Write a logrotate config for it and force rotation.\n   Verify: /opt/verify/check-disk.sh\n\n-- Grid Command Operations\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'top\ndf -h\nfree -h\nsystemctl list-units --type=service --state=active\n'
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
                            content: 'cell-flatline\n'
                        },
                        'systemd': {
                            type: 'dir',
                            children: {
                                'system': {
                                    type: 'dir',
                                    children: {
                                        'cell-cache.service': {
                                            type: 'file',
                                            // No MemoryMax -- hardening gap
                                            content: '[Unit]\nDescription=Cell Cache Service\nAfter=network.target\n\n[Service]\nType=simple\nUser=svc-cache\nExecStart=/opt/cell-services/cell-cache\nRestart=on-failure\nRestartSec=10\n# MemoryMax is absent -- cell-cache will consume all available memory\n\n[Install]\nWantedBy=multi-user.target\n'
                                        },
                                        'cell-stream.service': {
                                            type: 'file',
                                            content: '[Unit]\nDescription=Cell Stream Data Service\nAfter=network.target\n\n[Service]\nType=simple\nUser=svc-stream\nExecStart=/opt/cell-services/cell-stream\nStandardOutput=append:/var/log/cell-stream/stream.log\nStandardError=append:/var/log/cell-stream/stream.log\nRestart=on-failure\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target\n'
                                        }
                                    }
                                }
                            }
                        },
                        'cron.d': {
                            type: 'dir',
                            children: {
                                'cell-ops': {
                                    type: 'file',
                                    // Normal cron -- rogue entry is in root's personal crontab
                                    content: '# Cell-Flatline routine operations\n0 * * * * svc-monitor /opt/cell-services/healthcheck.sh >> /var/log/cell-ops/ops.log 2>&1\n0 0 * * * root /usr/sbin/logrotate /etc/logrotate.conf >> /var/log/logrotate.log 2>&1\n'
                                }
                            }
                        },
                        'logrotate.d': {
                            type: 'dir',
                            children: {
                                'rsyslog': {
                                    type: 'file',
                                    content: '/var/log/syslog\n/var/log/auth.log\n{\n    daily\n    rotate 7\n    compress\n    delaycompress\n    missingok\n    notifempty\n    postrotate\n        /usr/lib/rsyslog/rsyslog-rotate\n    endscript\n}\n'
                                }
                            }
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'operator': {
                                    type: 'file',
                                    content: 'operator ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/bin/crontab, /usr/sbin/logrotate, /bin/rm, /bin/tee, /usr/sbin/logrotate\n'
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
                                                'root': {
                                                    type: 'file',
                                                    // ROGUE entry -- causes CPU spike every 4 minutes
                                                    content: '# DO NOT EDIT THIS FILE -- install proper package or use -e flag\n# (crontab installed on Fri Apr  5 11:32:22 2026)\n# m h  dom mon dow   command\n17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly\n25 6    * * *   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; }\n47 6    * * 7   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.weekly; }\n52 6    1 * *   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.monthly; }\n*/4 * * * * root /opt/cell-services/grid-index.sh\n'
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
                                'cell-stream': {
                                    type: 'dir',
                                    children: {
                                        'stream.log': {
                                            type: 'file',
                                            // Simulated 4.2 GB log -- content is representative
                                            content: '[2026-03-01T00:00:01] cell-stream: Starting data stream\n[2026-03-01T00:00:01] cell-stream: Connected to grid fabric at 10.0.1.1\n[... 4.2 GB of stream data spanning 40 days without rotation ...]\n[2026-04-10T08:59:59] cell-stream: STREAM_OK packets=14882441 bytes_written=4521741312\n[2026-04-10T09:00:01] cell-stream: STREAM_OK packets=14882453\n\nNote: This file is 4.2 GB. No logrotate configuration exists for this path.\n'
                                        }
                                    }
                                },
                                'cell-ops': {
                                    type: 'dir',
                                    children: {
                                        'ops.log': {
                                            type: 'file',
                                            content: '[2026-04-10T09:00:00] healthcheck: OK, uptime=9 days 4 hours\n'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Apr 10 09:00:01 cell-flatline CRON[8801]: (root) CMD (/opt/cell-services/grid-index.sh)\nApr 10 09:04:01 cell-flatline CRON[8901]: (root) CMD (/opt/cell-services/grid-index.sh)\nApr 10 09:08:01 cell-flatline CRON[9001]: (root) CMD (/opt/cell-services/grid-index.sh)\nApr 10 09:12:01 cell-flatline CRON[9101]: (root) CMD (/opt/cell-services/grid-index.sh)\n'
                                }
                            }
                        },
                        'cache': {
                            type: 'dir',
                            children: {
                                'cell-cache-data': {
                                    type: 'dir',
                                    children: {
                                        'README': {
                                            type: 'file',
                                            content: 'cell-cache service data directory\nCurrently holds 2.1 GB in memory-mapped files (leaked, not freed)\n'
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
                        'cell-services': {
                            type: 'dir',
                            children: {
                                'grid-index.sh': {
                                    type: 'file',
                                    // The rogue CPU hog
                                    content: '#!/bin/bash\n# Grid Index Service -- deployed by deployment pipeline Apr 5\n# BUG: This script was meant to run ONCE on first boot.\n# A misconfigured deployment accidentally added it to root crontab.\n# It performs a full filesystem hash -- extremely expensive on each run.\nLOG=/var/log/cell-ops/ops.log\necho "grid-index: starting full filesystem scan at $(date)" >> $LOG\nfind / -type f 2>/dev/null | sha256sum >> $LOG\necho "grid-index: scan complete at $(date)" >> $LOG\n'
                                },
                                'cell-cache': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Cell Cache Service binary (simulated)\n# Known memory leak: reads files into memory without releasing them\n# Engineering workaround: set MemoryMax=256M in systemd unit file\n# When memory limit is hit, systemd OOM-kills and restarts the service\necho "cell-cache: starting"\nwhile true; do\n    sleep 10\ndone\n'
                                },
                                'cell-stream': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Cell Stream Service -- writes telemetry to /var/log/cell-stream/stream.log\n# No logrotate configuration -- known issue\necho "cell-stream: starting"\nwhile true; do\n    echo "[$(date -Iseconds)] cell-stream: STREAM_OK"\n    sleep 1\ndone\n'
                                },
                                'healthcheck.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\necho "[$(date -Iseconds)] healthcheck: OK, uptime=$(uptime -p)"\n'
                                }
                            }
                        },
                        'verify': {
                            type: 'dir',
                            children: {
                                'check-cpu.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify: rogue cron entry removed or grid-index.sh deleted.\n# Awards FLAG 1 when check passes.\necho "Checking CPU fix..."\necho "[CHECKING]"\n'
                                },
                                'check-memory.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify: cell-cache.service has MemoryMax directive and is running within limit.\n# Awards FLAG 2 when check passes.\necho "Checking memory fix..."\necho "[CHECKING]"\n'
                                },
                                'check-disk.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify: /var below 80% and logrotate config exists for cell-stream.\n# Awards FLAG 3 when check passes.\necho "Checking disk fix..."\necho "[CHECKING]"\n'
                                }
                            }
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} },
                'proc': { type: 'dir', children: {} },
                'run': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // INTERNAL STATE
    // ═══════════════════════════════════════════════════════

    _cronFixed: false,         // Rogue cron entry removed
    _memoryFixed: false,       // MemoryMax=256M added and service restarted
    _diskFixed: false,         // logrotate config created and rotation forced
    _logrotateConfigWritten: false,

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // top -- process view, shows CPU spike from grid-index.sh
        'top': function(args, term, engine) {
            const bFlag = args.includes('-b') || args.includes('-bn1') || args.includes('-n');

            const gridIndexLine = engine.config._cronFixed
                ? ''
                : '\n 9001 root      20   0 2147m 2.0g   0.4 S 100.1  25.3   4:12.77 find\n 9002 root      20   0   12m  4.2m  1.1 S  98.4   0.1   4:12.12 sha256sum';

            const cacheMemPct = engine.config._memoryFixed ? '3.2' : '26.2';
            const cacheRSS    = engine.config._memoryFixed ? '268m' : '2.1g';

            return `top - ${new Date().toTimeString().slice(0, 8)} up 9 days,  4:01,  1 user,  load average: ${engine.config._cronFixed ? '0.12, 0.15, 0.14' : '4.21, 3.88, 3.72'}
Tasks: 142 total,   ${engine.config._cronFixed ? '1' : '3'} running, 141 sleeping,   0 stopped,   0 zombie
%Cpu(s): ${engine.config._cronFixed ? '2.1' : '99.8'} us,  0.1 sy,  0.0 ni, ${engine.config._cronFixed ? '97.7' : '0.0'} id,  0.1 wa
MiB Mem :  8192.0 total,  ${engine.config._memoryFixed ? '5840.0' : '3940.2'} free,  ${engine.config._memoryFixed ? '1820.0' : '3891.4'} used,   400.0 buff/cache
MiB Swap:  2048.0 total,  ${engine.config._memoryFixed ? '2048.0' : '1024.3'} free,  ${engine.config._memoryFixed ? '0.0' : '1023.7'} used.   900.0 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND${gridIndexLine}
 8801 svc-cache 20   0  4295m ${cacheRSS}   0.4 S   1.2  ${cacheMemPct}   0:31.02 cell-cache
  998 named     20   0  264m  48.2m   1.1 S   0.2   0.6   1:02.44 named
  433 systemd-n 20   0   22m   8.1m   6.0 S   0.0   0.1   0:00.88 systemd-networkd
    1 root      20   0  170m  13.1m  10.0 S   0.0   0.2   0:01.12 systemd

${engine.config._cronFixed ? '' : 'NOTE: PID 9001/9002 (find + sha256sum) run every 4 minutes via cron as root'}`;
        },

        // ps -- process list
        'ps': function(args, term, engine) {
            const aux = args.includes('aux') || args.includes('-aux');
            const sortMem = args.join(' ').includes('--sort=-%mem') || args.join(' ').includes('sort=-%mem');
            const grep = args.join(' ').includes('grep');

            if (sortMem) {
                const cacheRSS = engine.config._memoryFixed ? '274632' : '2202624';
                const cpuPct   = engine.config._memoryFixed ? '1.2' : '1.4';
                return `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nsvc-cache ${' '.repeat(4)}8801 ${cpuPct}  ${engine.config._memoryFixed ? ' 3.2' : '26.2'} 4398156 ${cacheRSS} ?     Ssl  09:00   0:31 /opt/cell-services/cell-cache\nsvc-stream  901  0.2   1.4  412284  117400 ?     Ssl  09:00   0:12 /opt/cell-services/cell-stream\nnamed       998  0.2   0.6  270336   49308 ?     Ssl  00:00   1:02 /usr/sbin/named\noperator   7412  0.0   0.1   15892    5488 pts/0 Ss   09:00   0:00 bash`;
            }

            if (aux) {
                const gridLine = engine.config._cronFixed ? '' : '\nroot        9001 99.8  0.0   4756    876 ?     R    09:12   4:12 find / -type f\nroot        9002 98.2  0.0   8192   1024 ?     R    09:12   4:12 sha256sum';
                return `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot          1  0.0  0.1  170288  13312 ?     Ss   Apr01   0:01 /sbin/init\nsvc-cache  8801  1.2  ${engine.config._memoryFixed ? ' 3.2' : '26.2'} 4398156 ${engine.config._memoryFixed ? '274632' : '2202624'} ?  Ssl  09:00   0:31 /opt/cell-services/cell-cache\nsvc-stream  901  0.2  1.4  412284  117400 ?     Ssl  09:00   0:12 /opt/cell-services/cell-stream${gridLine}\noperator   7412  0.0  0.0   15892   5488 pts/0 Ss   09:00   0:00 bash`;
            }

            return 'Usage: ps aux [--sort=-%mem]\nExample: ps aux --sort=-%mem | head -5';
        },

        // free -- memory usage
        'free': function(args, term, engine) {
            const h = args.includes('-h') || args.includes('-m');
            if (engine.config._memoryFixed) {
                return h
                    ? '              total        used        free      shared  buff/cache   available\nMem:           8.0G        1.8G        5.7G        100M        400M        5.9G\nSwap:          2.0G          0B        2.0G'
                    : '              total        used        free      shared  buff/cache   available\nMem:        8388608     3891404     3940224      102400      409600     6029204\nSwap:       2097152     1047552     1049600';
            }
            return h
                ? '              total        used        free      shared  buff/cache   available\nMem:           8.0G        3.8G        3.9G        100M        400M        3.8G\nSwap:          2.0G        1.0G        1.0G\n\nWARNING: memory usage is climbing -- check ps aux --sort=-%mem'
                : '              total        used        free      shared  buff/cache   available\nMem:        8388608     3891404     3940224      102400      409600     3923204\nSwap:       2097152     1047552     1049600';
        },

        // df -- disk usage
        'df': function(args, term, engine) {
            const h = args.includes('-h');
            const diskPct = engine.config._diskFixed ? '71%' : '94%';
            const diskFree = engine.config._diskFixed ? '33G' : '7.3G';
            const diskUsed = engine.config._diskFixed ? '80G' : '106G';

            if (h) {
                return `Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        128G   14G  108G  12% /\ntmpfs            4.0G     0  4.0G   0% /dev/shm\n/dev/sda2        128G  ${diskUsed}   ${diskFree}  ${diskPct} /var\n\n${engine.config._diskFixed ? '' : 'ALERT: /var at 94% -- write failures imminent for services logging to /var/log/'}`;
            }

            return `Filesystem     1K-blocks     Used Available Use% Mounted on\n/dev/sda1      134217728 14680064 111935488  12% /\ntmpfs            4194304        0   4194304   0% /dev/shm\n/dev/sda2      134217728 ${engine.config._diskFixed ? '83886080 38993920' : '111149056  7847680'}  ${diskPct} /var`;
        },

        // du -- disk usage by directory
        'du': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '/var';
            const s = args.includes('-sh') || (args.includes('-s') && args.includes('-h'));
            const h = args.includes('-h') || s;

            if (target.includes('cell-stream')) {
                const size = engine.config._diskFixed ? '892M' : '4.2G';
                return h ? `${size}\t${target}` : `${engine.config._diskFixed ? '913408' : '4404224'}\t${target}`;
            }

            if (target.includes('/var/log')) {
                return h
                    ? `4.2G\t/var/log/cell-stream\n48M\t/var/log/cell-ops\n22M\t/var/log/syslog\n4.1M\t/var/log/auth.log\n4.3G\t/var/log total`
                    : `4404224\t/var/log/cell-stream\n49152\t/var/log/cell-ops`;
            }

            if (target === '/var' || target === '/var/') {
                return h
                    ? `4.2G\t/var/log/cell-stream\n400M\t/var/cache\n48M\t/var/log/cell-ops\n${engine.config._diskFixed ? '109G' : '106G'}\t/var total`
                    : '';
            }

            return h ? `0\t${target}` : `0\t${target}`;
        },

        // crontab -- view and edit crontabs
        'crontab': function(args, term, engine) {
            const lFlag = args.includes('-l');
            const eFlag = args.includes('-e');
            const uIdx  = args.indexOf('-u');
            const user  = uIdx >= 0 ? args[uIdx + 1] : 'operator';

            if (lFlag) {
                if (user === 'root' || args.includes('root')) {
                    if (engine.config._cronFixed) {
                        return '# DO NOT EDIT THIS FILE\n17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly\n25 6    * * *   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; }\n47 6    * * 7   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.weekly; }\n52 6    1 * *   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.monthly; }\n# grid-index entry removed by operator';
                    }
                    return '# DO NOT EDIT THIS FILE -- install proper package or use -e flag\n# (crontab installed on Fri Apr  5 11:32:22 2026)\n# m h  dom mon dow   command\n17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly\n25 6    * * *   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; }\n47 6    * * 7   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.weekly; }\n52 6    1 * *   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.monthly; }\n*/4 * * * * root /opt/cell-services/grid-index.sh';
                }
                return 'no crontab for operator';
            }

            if (eFlag) {
                // Simulate editing and removing the rogue entry
                engine.config._cronFixed = true;
                // Update filesystem representation
                engine.filesystem['/'].children.var.children.spool.children.cron.children.crontabs.children.root.content =
                    '# DO NOT EDIT THIS FILE\n17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly\n25 6    * * *   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; }\n47 6    * * 7   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.weekly; }\n52 6    1 * *   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.monthly; }\n# grid-index entry removed by operator\n';
                return '[Crontab editor simulation] Rogue entry */4 * * * * /opt/cell-services/grid-index.sh removed.\nCrontab saved.';
            }

            return 'Usage: crontab -l [-u user] | crontab -e\nExample: sudo crontab -u root -l';
        },

        // systemctl -- service management
        'systemctl': function(args, term, engine) {
            const sub  = args[0] || '';
            const unit = (args[1] || '').replace(/\.service$/, '');

            if (sub === 'status') {
                if (unit === 'cell-cache') {
                    const memNote = engine.config._memoryFixed
                        ? 'Memory: 244.0M (limit: 256.0M, available: 12.0M)'
                        : 'Memory: 2.1G (limit: n/a)';
                    return `\u25CF cell-cache.service - Cell Cache Service\n     Loaded: loaded (/etc/systemd/system/cell-cache.service; enabled)\n     Active: active (running) since Thu 2026-04-10 09:00:01 UTC\n   Main PID: 8801 (cell-cache)\n    ${memNote}\n\n${engine.config._memoryFixed ? '' : 'WARNING: No MemoryMax configured -- service will consume all available memory\n'}Apr 10 09:00:01 cell-flatline systemd[1]: Started Cell Cache Service.`;
                }

                if (unit === 'cell-stream') {
                    return `\u25CF cell-stream.service - Cell Stream Data Service\n     Loaded: loaded (/etc/systemd/system/cell-stream.service; enabled)\n     Active: active (running) since Sat 2026-03-01 00:00:01 UTC\n   Main PID: 901 (cell-stream)\n     Memory: 117.0M\n\nMar  1 00:00:01 cell-flatline systemd[1]: Started Cell Stream Data Service.\n\nNOTE: StdOutput redirects to /var/log/cell-stream/stream.log -- no logrotate config`;
                }

                if (unit === 'cron') {
                    return `\u25CF cron.service - Regular background program processing daemon\n     Loaded: loaded (/lib/systemd/system/cron.service; enabled)\n     Active: active (running)\n   Main PID: 345 (cron)\n\n${engine.config._cronFixed ? '' : 'RECENT EXECUTIONS:\nApr 10 09:00:01 cell-flatline CRON[8801]: (root) CMD (/opt/cell-services/grid-index.sh)\nApr 10 09:04:01 cell-flatline CRON[8901]: (root) CMD (/opt/cell-services/grid-index.sh)'}`;
                }

                return `Unit ${unit || '[none]'} not found.\nKnown services: cell-cache, cell-stream, cron`;
            }

            // systemctl cat -- show unit file contents
            if (sub === 'cat') {
                if (unit === 'cell-cache') {
                    return engine.filesystem['/'].children.etc.children.systemd.children.system.children['cell-cache.service'].content;
                }
                if (unit === 'cell-stream') {
                    return engine.filesystem['/'].children.etc.children.systemd.children.system.children['cell-stream.service'].content;
                }
                return `Failed to get properties: Unit ${unit} not found.`;
            }

            // systemctl edit -- simulate adding MemoryMax override
            if (sub === 'edit') {
                if (unit === 'cell-cache') {
                    engine.config._memoryFixed = true;
                    // Update the unit file to reflect the override
                    engine.filesystem['/'].children.etc.children.systemd.children.system.children['cell-cache.service'].content =
                        '[Unit]\nDescription=Cell Cache Service\nAfter=network.target\n\n[Service]\nType=simple\nUser=svc-cache\nExecStart=/opt/cell-services/cell-cache\nRestart=on-failure\nRestartSec=10\nMemoryMax=256M\n\n[Install]\nWantedBy=multi-user.target\n';
                    return '[Systemd editor simulation] Override directory created.\ncell-cache.service override saved with MemoryMax=256M.\nRun: systemctl daemon-reload && systemctl restart cell-cache.service';
                }
                return `[Systemd editor simulation] Cannot edit ${unit} -- no override added.`;
            }

            if (sub === 'daemon-reload') {
                return '';
            }

            if (sub === 'restart') {
                if (unit === 'cell-cache') {
                    if (engine.config._memoryFixed) {
                        return 'cell-cache.service restarted with MemoryMax=256M active.';
                    }
                    return 'cell-cache.service restarted (warning: no MemoryMax set -- memory leak will continue)';
                }
                return '';
            }

            if (sub === 'reload') {
                if (unit === 'cell-stream') {
                    return 'cell-stream.service reloaded.';
                }
                return '';
            }

            if (sub === 'list-units') {
                const cpuNote = engine.config._cronFixed ? '' : ' [!] grid-index.sh consuming 100% CPU via cron';
                const memNote = engine.config._memoryFixed ? '' : ' [!] cell-cache has no MemoryMax -- 2.1 GB consumed';
                return `UNIT                              LOAD     ACTIVE     SUB      DESCRIPTION\n  cell-cache.service              loaded   active     running  Cell Cache Service${memNote}\n  cell-stream.service             loaded   active     running  Cell Stream Data Service\n  cron.service                    loaded   active     running  Regular background program processing daemon${cpuNote}\n  ssh.service                     loaded   active     running  OpenBSD Secure Shell server\n  systemd-networkd.service        loaded   active     running  Network Configuration\n\n5 loaded units listed.`;
            }

            return `Unknown systemctl action: ${sub}\nTry: systemctl status|cat|edit|restart|daemon-reload|list-units`;
        },

        // logrotate -- run log rotation
        'logrotate': function(args, term, engine) {
            const force  = args.includes('-f') || args.includes('--force');
            const config = args.find(a => !a.startsWith('-') && a !== 'logrotate') || '';

            if (config.includes('cell-stream') || config === '/etc/logrotate.conf') {
                if (!engine.config._logrotateConfigWritten) {
                    if (config.includes('cell-stream')) {
                        return 'error: /etc/logrotate.d/cell-stream: No such file or directory\nWrite a logrotate config first: /etc/logrotate.d/cell-stream';
                    }
                    return 'logrotate: no config for cell-stream found. Write /etc/logrotate.d/cell-stream first.';
                }
                if (force) {
                    engine.config._diskFixed = true;
                    return 'rotating log /var/log/cell-stream/stream.log: OK\ncompressing /var/log/cell-stream/stream.log.1: OK\n\n/var/log/cell-stream/stream.log rotated. Old log compressed to stream.log.1.gz\nDisk usage on /var reduced from 94% to 71%.';
                }
                return 'logrotate: use -f to force rotation: logrotate -f /etc/logrotate.d/cell-stream';
            }

            return 'Usage: logrotate [-f] <config-file>\nExample: logrotate -f /etc/logrotate.d/cell-stream';
        },

        // tee -- write files (used for logrotate config and systemd overrides)
        'tee': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target.includes('/etc/logrotate.d/cell-stream')) {
                engine.config._logrotateConfigWritten = true;
                return '(config written to /etc/logrotate.d/cell-stream)';
            }

            if (target.includes('cell-cache') && (target.includes('override') || target.includes('systemd'))) {
                engine.config._memoryFixed = true;
                return '(override written)';
            }

            return '(written to ' + (target || 'stdout') + ')';
        },

        // vi/nano/vim -- editor simulations; detect logrotate config writes
        'vi': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('/etc/logrotate.d/cell-stream')) {
                engine.config._logrotateConfigWritten = true;
                return '[VI simulation] /etc/logrotate.d/cell-stream saved.\nRun: sudo logrotate -f /etc/logrotate.d/cell-stream to force rotation.';
            }
            if (target.includes('cell-cache.service') || target.includes('/etc/systemd')) {
                engine.config._memoryFixed = true;
                return '[VI simulation] Unit file saved with MemoryMax=256M.\nRun: systemctl daemon-reload && systemctl restart cell-cache.service';
            }
            if (target.includes('/var/spool/cron/crontabs/root') || target.includes('crontab')) {
                engine.config._cronFixed = true;
                return '[VI simulation] Crontab saved. Rogue */4 entry removed.';
            }
            return '[VI simulation] Cannot open interactive editor in this terminal.\nUse the dedicated command for this task.';
        },

        'nano': function(args, term, engine) {
            return engine.commands['vi'](args, term, engine);
        },

        'vim': function(args, term, engine) {
            return engine.commands['vi'](args, term, engine);
        },

        // rm -- remove rogue script (alternate fix for CPU issue)
        'rm': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('grid-index.sh')) {
                engine.config._cronFixed = true;
                delete engine.filesystem['/'].children.opt.children['cell-services'].children['grid-index.sh'];
                return '';
            }
            return '';
        },

        // cat -- view files
        'cat': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('/var/spool/cron/crontabs/root')) {
                return engine.config._cronFixed
                    ? '# crontab without rogue entry\n17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly\n25 6    * * *   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; }\n'
                    : engine.filesystem['/'].children.var.children.spool.children.cron.children.crontabs.children.root.content;
            }
            return null;
        },

        // grep
        'grep': function(args, term, engine) {
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const target  = args.filter(a => !a.startsWith('-'))[1] || '';

            if (pattern.includes('MemoryMax') && target.includes('cell-cache')) {
                return engine.config._memoryFixed
                    ? 'MemoryMax=256M'
                    : '[no MemoryMax found in cell-cache.service -- this is the problem]';
            }

            if (pattern.includes('grid-index') && target.includes('crontab')) {
                return engine.config._cronFixed
                    ? '[entry removed]'
                    : '*/4 * * * * root /opt/cell-services/grid-index.sh';
            }

            return '';
        },

        // Verification scripts
        '/opt/verify/check-cpu.sh': function(args, term, engine) {
            if (!engine.config._cronFixed) {
                return 'FAIL: Rogue cron entry still active.\n  */4 * * * * root /opt/cell-services/grid-index.sh\n\nFix: sudo crontab -u root -e  (remove the */4 grid-index.sh line)\n  OR: sudo rm /opt/cell-services/grid-index.sh';
            }
            engine.awardFlag('flag1');
            return 'PASS: Rogue cron entry removed. CPU no longer spiking every 4 minutes.\nFLAG 1 awarded.';
        },

        '/opt/verify/check-memory.sh': function(args, term, engine) {
            if (!engine.config._memoryFixed) {
                return 'FAIL: cell-cache.service has no MemoryMax configured.\n  systemctl cat cell-cache.service | grep MemoryMax  -- returns nothing\n\nFix: sudo systemctl edit cell-cache.service\n  Add under [Service]:\n  MemoryMax=256M\nThen: sudo systemctl daemon-reload && sudo systemctl restart cell-cache.service';
            }
            engine.awardFlag('flag2');
            return 'PASS: cell-cache.service running with MemoryMax=256M. Memory consumption bounded.\nFLAG 2 awarded.';
        },

        '/opt/verify/check-disk.sh': function(args, term, engine) {
            if (!engine.config._diskFixed) {
                const steps = [];
                if (!engine.config._logrotateConfigWritten) {
                    steps.push('  1. Write /etc/logrotate.d/cell-stream config (daily, rotate 7, compress)');
                }
                steps.push('  2. sudo logrotate -f /etc/logrotate.d/cell-stream');
                return `FAIL: /var still at 94%. ${steps.length} step(s) remaining:\n${steps.join('\n')}`;
            }
            engine.awardFlag('flag3');
            return 'PASS: /var reduced from 94% to 71%. logrotate config confirmed at /etc/logrotate.d/cell-stream.\nFLAG 3 awarded.';
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{ala-l11-flatline_flag1_cpu_spike_eliminated}',
            label: 'CPU Spike Eliminated',
            description: 'Removed the rogue cron entry running grid-index.sh every 4 minutes.',
            points: 200,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{ala-l11-flatline_flag2_memory_leak_bounded}',
            label: 'Memory Leak Bounded',
            description: 'Added MemoryMax=256M to cell-cache.service and restarted it.',
            points: 200,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{ala-l11-flatline_flag3_disk_reclaimed}',
            label: 'Disk Reclaimed',
            description: 'Created logrotate config for cell-stream and forced rotation to bring /var below 80%.',
            points: 200,
            autoCheck: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1500000, points: 100 },
        timeBonusThreshold: 2400
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'The CPU spike happens every 4 minutes. Run top and watch for the spike. The process name is "find" run as root. Then: sudo crontab -u root -l to see who scheduled it.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'Check running services with systemctl list-units --type=service --state=active. For any service using excessive memory, check its unit file: systemctl cat cell-cache.service. Look for missing resource limits.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'df -h shows /var at 94%. du -sh /var/log/cell-stream/* shows the offending file. Write /etc/logrotate.d/cell-stream with: daily, rotate 7, compress, missingok, notifempty. Then: sudo logrotate -f /etc/logrotate.d/cell-stream',
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
            { flagId: 'flag1', objective: '1.3', description: 'Manage processes', skill: 'Cron job analysis, rogue process identification, crontab editing' },
            { flagId: 'flag2', objective: '2.2', description: 'Perform system maintenance', skill: 'systemd resource limits, MemoryMax, service overrides' },
            { flagId: 'flag3', objective: '3.4', description: 'Implement logging services', skill: 'Disk analysis with df/du, logrotate configuration, forced rotation' }
        ]
    }

};
