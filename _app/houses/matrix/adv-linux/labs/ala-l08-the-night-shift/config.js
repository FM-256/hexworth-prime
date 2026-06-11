/* ============================================================
   ALA-L08: The Night Shift
   Advanced Linux Administration -- CTF Lab
   Bash automation, log rotation, rsync backup, cron scheduling
   ============================================================ */

const ALAL08Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Night Shift',
    subtitle: 'Advanced Linux Administration -- Bash Automation',
    description: 'Three remote cells need unattended maintenance every night. Write three bash scripts -- log rotation, incremental backup, and health check -- then schedule them with cron. One operator, three cells, zero manual intervention.',
    difficulty: 'Intermediate',
    estimatedTime: 40,
    accent: '#22d3ee',
    storageKey: 'hexworth_lab_ala_l08',
    registryId: 'ala-l08-the-night-shift',
    shellChaining: true,   // enable real-shell A && B chaining (walkthroughs use it)
    trackerKey: 'lab_ala_l08',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-NIGHT-OPS BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: eth0 UP (10.0.1.100/24)',
            'Remote cells: 10.0.1.14, 10.0.1.27, 10.0.1.33 -- REACHABLE',
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
        intro: 'You have the night shift. Three remote cells -- 14, 27, and 33 -- need log rotation, backup, and health verification every night at 05:00. The previous operator was doing it manually. That is not sustainable. Write the scripts, test them, schedule them. When the morning shift arrives, those cells should be clean, backed up, and reported.',
        scenario: 'SSH keys are pre-configured for all three cells. Scripts go in /opt/cell-services/scripts/. Log rotation compresses /var/log/cell-ops/ on each remote cell and moves archives to /var/log/archive/. Backup uses rsync with --link-dest for incremental behavior. Health check verifies sshd, disk usage, and connectivity on each cell and writes a report.',
        outro: 'Three cells. Three scripts. Cron running at 05:00. The morning shift has a clean health report, verified backups, and rotated logs. The night shift is done.'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-night-ops',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to CELL-NIGHT-OPS\nLast login: Thu Apr 10 20:00:00 2026 from 10.0.0.1\n\nRemote cells online:\n  cell-14  10.0.1.14  [SSH OK]\n  cell-27  10.0.1.27  [SSH OK]\n  cell-33  10.0.1.33  [SSH OK]\n\nType \'help\' for available commands.\n'
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
                                'MISSION.txt': {
                                    type: 'file',
                                    content: 'MISSION: The Night Shift\n\nWrite three maintenance scripts for cells 14, 27, and 33.\nSchedule all three via cron to run at 05:00 nightly.\n\nScript 1 -- Log Rotation (/opt/cell-services/scripts/rotate-logs.sh):\n  - SSH to each cell\n  - Compress /var/log/cell-ops/ops.log with gzip\n  - Move compressed file to /var/log/archive/ with name ops-YYYY-MM-DD.log.gz\n  - Verify archive exists on each cell\n\nScript 2 -- Incremental Backup (/opt/cell-services/scripts/backup.sh):\n  - rsync /etc/ and /home/operator/ from each cell\n  - Destination: /var/backups/cell-XX/$(date +%F)/\n  - Use --link-dest for incremental behavior\n  - Second run must show significantly fewer transferred bytes\n\nScript 3 -- Health Check (/opt/cell-services/scripts/health-check.sh):\n  - For each cell: check sshd active, /var disk below 85%, ping 10.0.1.1\n  - Write report to /var/log/health-$(date +%F).txt\n  - Cron entry: 0 5 * * * /opt/cell-services/scripts/health-check.sh >> /var/log/health-$(date +\\%F).txt 2>&1\n\nCell list: /home/operator/cell-list.txt\n'
                                },
                                'cell-list.txt': {
                                    type: 'file',
                                    content: 'cell-14 10.0.1.14\ncell-27 10.0.1.27\ncell-33 10.0.1.33\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat MISSION.txt\ncat cell-list.txt\nssh operator@10.0.1.14 hostname\n'
                                },
                                '.ssh': {
                                    type: 'dir',
                                    children: {
                                        'id_ed25519': {
                                            type: 'file',
                                            content: '-----BEGIN OPENSSH PRIVATE KEY-----\n[pre-generated key for cell-14, cell-27, cell-33 access]\n-----END OPENSSH PRIVATE KEY-----\n'
                                        },
                                        'id_ed25519.pub': {
                                            type: 'file',
                                            content: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINightOpsKey operator@cell-night-ops\n'
                                        },
                                        'config': {
                                            type: 'file',
                                            content: 'Host cell-14\n    HostName 10.0.1.14\n    User operator\n    IdentityFile ~/.ssh/id_ed25519\n    StrictHostKeyChecking no\n\nHost cell-27\n    HostName 10.0.1.27\n    User operator\n    IdentityFile ~/.ssh/id_ed25519\n    StrictHostKeyChecking no\n\nHost cell-33\n    HostName 10.0.1.33\n    User operator\n    IdentityFile ~/.ssh/id_ed25519\n    StrictHostKeyChecking no\n'
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
                                'scripts': {
                                    type: 'dir',
                                    children: {}
                                    // Student writes scripts here
                                }
                            }
                        },
                        'verify': {
                            type: 'dir',
                            children: {
                                'check-rotation.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verifies log rotation ran on all three cells\n# Checks /var/log/archive/ on each cell for compressed log\nCELLS="cell-14 cell-27 cell-33"\nPASS=0\nFAIL=0\n\nfor cell in $CELLS; do\n    count=$(ssh "$cell" "ls /var/log/archive/*.log.gz 2>/dev/null | wc -l")\n    if [ "$count" -ge 1 ]; then\n        echo "[PASS] $cell: archive exists"\n        PASS=$((PASS+1))\n    else\n        echo "[FAIL] $cell: no archive found in /var/log/archive/"\n        FAIL=$((FAIL+1))\n    fi\ndone\n\nif [ $FAIL -eq 0 ]; then\n    echo "FLAG: FLAG{ala-l08-the-night-shift_flag1_log_rotation_verifie}"\nfi\n'
                                },
                                'check-backup.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verifies /var/backups/cell-XX/ structure exists with correct layout\nPASS=0\nFAIL=0\n\nfor cell in cell-14 cell-27 cell-33; do\n    dir="/var/backups/$cell"\n    if [ -d "$dir" ] && [ "$(ls -A "$dir")" ]; then\n        echo "[PASS] $cell: backup directory exists at $dir"\n        PASS=$((PASS+1))\n    else\n        echo "[FAIL] $cell: /var/backups/$cell/ is empty or does not exist"\n        FAIL=$((FAIL+1))\n    fi\ndone\n\nif [ $FAIL -eq 0 ]; then\n    echo "FLAG: FLAG{ala-l08-the-night-shift_flag2_backup_script_verifi}"\nfi\n'
                                },
                                'check-health.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verifies health-check.sh exists, is in crontab, and produces correct report format\nSCRIPT=/opt/cell-services/scripts/health-check.sh\nPASS=0\nFAIL=0\n\n[ -x "$SCRIPT" ] && PASS=$((PASS+1)) || { echo "[FAIL] $SCRIPT not found or not executable"; FAIL=$((FAIL+1)); }\ncrontab -l 2>/dev/null | grep -q "health-check.sh" && PASS=$((PASS+1)) || { echo "[FAIL] health-check.sh not found in crontab"; FAIL=$((FAIL+1)); }\nls /var/log/health-*.txt 2>/dev/null | head -1 | xargs grep -q "PASS\\|FAIL" 2>/dev/null && PASS=$((PASS+1)) || { echo "[FAIL] No health report found in /var/log/"; FAIL=$((FAIL+1)); }\n\nif [ $FAIL -eq 0 ]; then\n    echo "FLAG: FLAG{ala-l08-the-night-shift_flag3_health_check_schedul}"\nfi\n'
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'backups': {
                            type: 'dir',
                            children: {}
                            // Populated when backup.sh runs
                        },
                        'log': {
                            type: 'dir',
                            children: {}
                            // health-YYYY-MM-DD.txt written when health-check.sh runs
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'cell-night-ops\n'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\n'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'operator': {
                                    type: 'file',
                                    content: 'operator ALL=(ALL) NOPASSWD: /usr/bin/rsync, /usr/sbin/cron\n'
                                }
                            }
                        },
                        'cron.d': {
                            type: 'dir',
                            children: {}
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

    _state: {
        rotateScriptWritten: false,     // rotate-logs.sh written to /opt/cell-services/scripts/
        rotateScriptRan: false,         // rotate-logs.sh executed successfully
        backupScriptWritten: false,     // backup.sh written
        backupScriptRan: false,         // backup.sh executed; /var/backups/ populated
        healthScriptWritten: false,     // health-check.sh written
        healthScriptRan: false,         // health-check.sh executed; report written
        cronConfigured: false           // cron entries added (all three scripts)
    },

    // Remote cell simulation data -- used by ssh/rsync commands
    _remoteCells: {
        'cell-14': {
            ip: '10.0.1.14',
            reachable: true,
            sshdActive: true,
            diskUsagePct: 42,
            logContent: '{"timestamp":"2026-04-10T22:00:00","service":"grid-monitor","status":"MONITOR_OK","nodes":3}\n{"timestamp":"2026-04-10T23:00:00","service":"grid-monitor","status":"MONITOR_OK","nodes":3}\n'
        },
        'cell-27': {
            ip: '10.0.1.27',
            reachable: true,
            sshdActive: true,
            diskUsagePct: 67,
            logContent: '{"timestamp":"2026-04-10T22:00:00","service":"grid-sync","status":"SYNC_OK","target":"10.0.1.1"}\n{"timestamp":"2026-04-10T23:00:00","service":"grid-sync","status":"SYNC_OK","target":"10.0.1.1"}\n'
        },
        'cell-33': {
            ip: '10.0.1.33',
            reachable: true,
            sshdActive: true,
            diskUsagePct: 78,
            logContent: '{"timestamp":"2026-04-10T22:15:00","service":"healthcheck","status":"OK","uptime":"up 14 hours"}\n{"timestamp":"2026-04-10T23:15:00","service":"healthcheck","status":"OK","uptime":"up 15 hours"}\n'
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // ssh -- connect to remote cells; simulate command execution
        'ssh': function(args, term, engine) {
            // Parse: ssh [options] user@host <command> or ssh host <command>
            const hostArg = args.find(a => !a.startsWith('-') && (a.includes('@') || a.match(/^(cell-\d+|10\.0\.1\.)/))) || '';
            const host = hostArg.replace(/^operator@/, '').replace(/^[^@]+@/, '');
            const cmdParts = args.slice(args.indexOf(hostArg) + 1);
            const remoteCmd = cmdParts.join(' ');

            if (!hostArg) return `Usage: ssh [user@]host [command]`;

            // Check if this is a known cell
            const cellKey = Object.keys(engine.config._remoteCells).find(k => {
                const c = engine.config._remoteCells[k];
                return host === k || host === c.ip;
            });

            if (!cellKey) {
                return `ssh: connect to host ${host} port 22: Connection refused`;
            }

            const cell = engine.config._remoteCells[cellKey];
            if (!cell.reachable) {
                return `ssh: connect to host ${host} port 22: No route to host`;
            }

            // No remote command -- just test connectivity
            if (!remoteCmd) {
                return `Welcome to ${cellKey} (${cell.ip})\nLast login: Thu Apr 10 20:00:00 2026\n[Connection test OK -- type exit to return]`;
            }

            // hostname
            if (remoteCmd === 'hostname') return cellKey;

            // systemctl is-active sshd
            if (remoteCmd.includes('systemctl is-active sshd') || remoteCmd.includes('systemctl is-active ssh')) {
                return cell.sshdActive ? 'active' : 'inactive';
            }

            // df /var
            if (remoteCmd.includes('df') && remoteCmd.includes('/var')) {
                return `Filesystem      1K-blocks    Used Available Use% Mounted on\n/dev/sda1       20971520  ${Math.floor(20971520 * cell.diskUsagePct / 100)} ${Math.floor(20971520 * (100 - cell.diskUsagePct) / 100)}  ${cell.diskUsagePct}% /`;
            }

            // Log rotation commands
            if (remoteCmd.includes('gzip') && remoteCmd.includes('ops.log')) {
                cell._logRotated = true;
                return '';
            }
            if (remoteCmd.includes('mv') && remoteCmd.includes('archive')) {
                const date = new Date().toISOString().slice(0, 10);
                cell._archiveName = `ops-${date}.log.gz`;
                return '';
            }
            if (remoteCmd.includes('mkdir') && remoteCmd.includes('archive')) {
                return '';
            }

            // ls on archive directory
            if (remoteCmd.includes('ls') && remoteCmd.includes('archive')) {
                if (cell._archiveName) {
                    return cell._archiveName;
                }
                return 'ls: cannot access \'/var/log/archive/*.log.gz\': No such file or directory';
            }

            // ping from remote cell
            if (remoteCmd.includes('ping') && remoteCmd.includes('10.0.1.1')) {
                return `PING 10.0.1.1 (10.0.1.1) 56(84) bytes of data.\n64 bytes from 10.0.1.1: icmp_seq=1 ttl=64 time=0.9 ms\n\n--- 10.0.1.1 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }

            // Generic remote command simulation
            return `[${cellKey}] ${remoteCmd}: OK`;
        },

        // rsync -- file synchronization
        'rsync': function(args, term, engine) {
            const aFlag = args.includes('-a') || args.includes('-avz') || args.includes('-azv');
            const vFlag = args.includes('-v') || args.includes('-avz') || args.includes('-azv');
            const zFlag = args.includes('-z') || args.includes('-avz');
            const linkDest = args.find(a => a.startsWith('--link-dest')) || '';
            const dryRun = args.includes('--dry-run') || args.includes('-n');

            const src = args.find(a => !a.startsWith('-') && (a.includes(':') || a.includes('10.0.1.'))) || '';
            const dst = args.find(a => !a.startsWith('-') && a.startsWith('/var/backups')) || '';

            if (!src && !dst) {
                return `Usage: rsync [OPTIONS] [user@]host:src /dest/\nKey options: -avz, --link-dest=/path/to/previous`;
            }

            // Extract cell from source
            const cellMatch = src.match(/operator@(cell-\d+|10\.0\.1\.\d+):/);
            const cellKey = cellMatch
                ? Object.keys(engine.config._remoteCells).find(k => cellMatch[1] === k || engine.config._remoteCells[k].ip === cellMatch[1])
                : null;

            if (!cellKey) {
                return `rsync: [receiver] change_dir "/home/operator" failed: No such file or directory (2)`;
            }

            const cell = engine.config._remoteCells[cellKey];

            if (!cell.reachable) {
                return `rsync: [sender] io timeout after 20 seconds -- exiting\nrsync error: failed to connect`;
            }

            // Create the backup directory structure in the simulated filesystem
            const date = new Date().toISOString().slice(0, 10);
            const backupPath = dst || `/var/backups/${cellKey}/${date}`;

            if (!term.fs['/'].children.var.children.backups.children[cellKey]) {
                term.fs['/'].children.var.children.backups.children[cellKey] = {
                    type: 'dir',
                    children: {}
                };
            }
            term.fs['/'].children.var.children.backups.children[cellKey].children[date] = {
                type: 'dir',
                children: {
                    'etc': { type: 'dir', children: {} },
                    'home': { type: 'dir', children: {} }
                }
            };

            engine.config._state.backupScriptRan = true;

            // linkDest = fewer bytes on second run
            const isIncremental = linkDest.length > 0;
            if (isIncremental) {
                return `sending incremental file list\n\nsent 412 bytes  received 22 bytes  868.00 bytes/sec\ntotal size is 2,847,122  speedup is 6,472.70\n`;
            }

            // First run -- more bytes
            return `sending incremental file list\netc/\netc/hostname\netc/passwd\netc/ssh/sshd_config\nhome/operator/\nhome/operator/MISSION.txt\nhome/operator/.bash_history\n\nsent 28,744 bytes  received 1,144 bytes  59,776.00 bytes/sec\ntotal size is 2,847,122  speedup is 93.06\n`;
        },

        // write -- create bash scripts
        'write': function(args, term, engine) {
            const file = args[0] || '';
            const content = args.slice(1).join(' ');

            if (!file) return `Usage: write <file> <content>\nScripts go in /opt/cell-services/scripts/`;

            if (file.includes('rotate-logs') || file.endsWith('rotate-logs.sh')) {
                const hasSSH = content.includes('ssh');
                const hasGzip = content.includes('gzip') || content.includes('bzip2');
                const hasMv = content.includes('mv') || content.includes('archive');
                const hasLoop = content.includes('while') || content.includes('for') || content.includes('cell-list');

                if (!hasSSH) return `write: rotate-logs.sh must use ssh to reach remote cells.`;
                if (!hasGzip) return `write: rotate-logs.sh must compress logs with gzip or bzip2.`;
                if (!hasMv) return `write: rotate-logs.sh must move archives to /var/log/archive/.`;

                engine.config._state.rotateScriptWritten = true;
                term.fs['/'].children.opt.children['cell-services'].children.scripts.children['rotate-logs.sh'] = {
                    type: 'file',
                    content: content
                };
                return `Written: ${file}\nMark executable with: chmod +x ${file}`;
            }

            if (file.includes('backup') || file.endsWith('backup.sh')) {
                const hasRsync = content.includes('rsync');
                const hasLinkDest = content.includes('--link-dest');
                const hasLoop = content.includes('while') || content.includes('for') || content.includes('cell-list');

                if (!hasRsync) return `write: backup.sh must use rsync.`;
                if (!hasLinkDest) return `write: backup.sh must use --link-dest for incremental backups.`;

                engine.config._state.backupScriptWritten = true;
                term.fs['/'].children.opt.children['cell-services'].children.scripts.children['backup.sh'] = {
                    type: 'file',
                    content: content
                };
                return `Written: ${file}\nMark executable with: chmod +x ${file}`;
            }

            if (file.includes('health-check') || file.endsWith('health-check.sh')) {
                const hasSSH = content.includes('ssh');
                const hasSystemctl = content.includes('systemctl');
                const hasDf = content.includes('df');
                const hasPing = content.includes('ping');
                const hasReport = content.includes('/var/log/health');

                const missing = [];
                if (!hasSSH) missing.push('ssh');
                if (!hasSystemctl) missing.push('systemctl is-active sshd');
                if (!hasDf) missing.push('df (disk usage check)');
                if (!hasPing) missing.push('ping (connectivity check)');
                if (!hasReport) missing.push('report file at /var/log/health-YYYY-MM-DD.txt');

                if (missing.length > 0) {
                    return `write: health-check.sh missing required elements:\n${missing.map(m => '  - ' + m).join('\n')}`;
                }

                engine.config._state.healthScriptWritten = true;
                term.fs['/'].children.opt.children['cell-services'].children.scripts.children['health-check.sh'] = {
                    type: 'file',
                    content: content
                };
                return `Written: ${file}\nMark executable with: chmod +x ${file}`;
            }

            return `write: ${file}: not a recognized script location. Use /opt/cell-services/scripts/<name>.sh`;
        },

        // chmod -- mark scripts executable
        'chmod': function(args, term, engine) {
            const mode = args.find(a => a.match(/^[+\-]?[ugoa]*[+\-=][rwxX]+$|^\d{3,4}$/)) || '';
            const file = args.find(a => a.endsWith('.sh') || (a.includes('/') && !a.startsWith('-'))) || '';

            if (mode.includes('x') || mode === '755' || mode === '700') {
                if (file) return '';  // Silent success
            }
            return `Usage: chmod [mode] <file>\nExample: chmod +x /opt/cell-services/scripts/rotate-logs.sh`;
        },

        // bash/sh -- run scripts directly
        'bash': function(args, term, engine) {
            const script = args.find(a => a.endsWith('.sh') || a.startsWith('/opt')) || '';
            return term.config.commands['_runScript'] ? term.config.commands['_runScript'].call(term.config.commands, [script], term, engine) : `bash: ${script}: executed`;
        },

        // Direct script execution via path
        '/opt/cell-services/scripts/rotate-logs.sh': function(args, term, engine) {
            if (!engine.config._state.rotateScriptWritten) {
                return `bash: /opt/cell-services/scripts/rotate-logs.sh: No such file or directory`;
            }
            // Simulate log rotation on all three cells
            const date = new Date().toISOString().slice(0, 10);
            Object.keys(engine.config._remoteCells).forEach(cellKey => {
                const cell = engine.config._remoteCells[cellKey];
                cell._archiveName = `ops-${date}.log.gz`;
                cell._logRotated = true;
            });
            engine.config._state.rotateScriptRan = true;
            return `[rotate-logs] cell-14: rotating ops.log -> /var/log/archive/ops-${date}.log.gz ... done\n[rotate-logs] cell-27: rotating ops.log -> /var/log/archive/ops-${date}.log.gz ... done\n[rotate-logs] cell-33: rotating ops.log -> /var/log/archive/ops-${date}.log.gz ... done\n[rotate-logs] complete.`;
        },

        '/opt/cell-services/scripts/backup.sh': function(args, term, engine) {
            if (!engine.config._state.backupScriptWritten) {
                return `bash: /opt/cell-services/scripts/backup.sh: No such file or directory`;
            }
            const date = new Date().toISOString().slice(0, 10);
            // Create backup directories for all three cells
            ['cell-14', 'cell-27', 'cell-33'].forEach(cellKey => {
                if (!term.fs['/'].children.var.children.backups.children[cellKey]) {
                    term.fs['/'].children.var.children.backups.children[cellKey] = {
                        type: 'dir',
                        children: {}
                    };
                }
                term.fs['/'].children.var.children.backups.children[cellKey].children[date] = {
                    type: 'dir',
                    children: { 'etc': { type: 'dir', children: {} }, 'home': { type: 'dir', children: {} } }
                };
            });
            engine.config._state.backupScriptRan = true;
            return `[backup] cell-14: sent 28,744 bytes -> /var/backups/cell-14/${date}/\n[backup] cell-27: sent 31,012 bytes -> /var/backups/cell-27/${date}/\n[backup] cell-33: sent 29,887 bytes -> /var/backups/cell-33/${date}/\n[backup] complete.`;
        },

        '/opt/cell-services/scripts/health-check.sh': function(args, term, engine) {
            if (!engine.config._state.healthScriptWritten) {
                return `bash: /opt/cell-services/scripts/health-check.sh: No such file or directory`;
            }
            const date = new Date().toISOString().slice(0, 10);
            const reportPath = `/var/log/health-${date}.txt`;
            const cells = engine.config._remoteCells;
            const lines = [
                `Health Check Report -- ${date}`,
                '-------------------------------------------'
            ];
            Object.entries(cells).forEach(([name, c]) => {
                const sshdStatus = c.sshdActive ? 'PASS' : 'FAIL';
                const diskStatus = c.diskUsagePct < 85 ? 'PASS' : 'FAIL';
                const connStatus = c.reachable ? 'PASS' : 'FAIL';
                lines.push(`${name} (${c.ip}):`);
                lines.push(`  sshd:         [${sshdStatus}]`);
                lines.push(`  disk /var:     [${diskStatus}] (${c.diskUsagePct}% used)`);
                lines.push(`  connectivity: [${connStatus}]`);
            });
            lines.push('-------------------------------------------');
            lines.push('All cells: OK');

            const reportContent = lines.join('\n') + '\n';

            // Write health report to filesystem: the dated archive plus a stable
            // health-report.txt "latest" copy (the walkthrough cats the latter, since
            // $(date +%F) substitution is not expanded in this sandbox shell).
            const reportNode = { type: 'file', content: reportContent };
            term.fs['/'].children.var.children.log.children[`health-${date}.txt`] = reportNode;
            term.fs['/'].children.var.children.log.children['health-report.txt'] = reportNode;

            engine.config._state.healthScriptRan = true;
            return reportContent;
        },

        // /opt/verify scripts
        '/opt/verify/check-rotation.sh': function(args, term, engine) {
            if (!engine.config._state.rotateScriptRan) {
                return `[FAIL] No archive files found on any cell.\nRun /opt/cell-services/scripts/rotate-logs.sh first.`;
            }
            engine.awardFlag('flag1');
            return `[PASS] cell-14: archive exists (ops-${new Date().toISOString().slice(0, 10)}.log.gz)\n[PASS] cell-27: archive exists (ops-${new Date().toISOString().slice(0, 10)}.log.gz)\n[PASS] cell-33: archive exists (ops-${new Date().toISOString().slice(0, 10)}.log.gz)\nFLAG: FLAG{ala-l08-the-night-shift_flag1_log_rotation_verifie}`;
        },

        '/opt/verify/check-backup.sh': function(args, term, engine) {
            if (!engine.config._state.backupScriptRan) {
                return `[FAIL] /var/backups/cell-14/ is empty or does not exist.\nRun /opt/cell-services/scripts/backup.sh first.`;
            }
            engine.awardFlag('flag2');
            return `[PASS] cell-14: backup directory exists at /var/backups/cell-14/\n[PASS] cell-27: backup directory exists at /var/backups/cell-27/\n[PASS] cell-33: backup directory exists at /var/backups/cell-33/\nFLAG: FLAG{ala-l08-the-night-shift_flag2_backup_script_verifi}`;
        },

        '/opt/verify/check-health.sh': function(args, term, engine) {
            if (!engine.config._state.healthScriptWritten) {
                return `[FAIL] /opt/cell-services/scripts/health-check.sh not found.`;
            }
            if (!engine.config._state.healthScriptRan) {
                return `[FAIL] No health report found in /var/log/.\nRun the health-check.sh script first to generate a report.`;
            }
            if (!engine.config._state.cronConfigured) {
                return `[FAIL] health-check.sh not found in crontab.\nAdd via: crontab -e\nRequired entry: 0 5 * * * /opt/cell-services/scripts/health-check.sh >> /var/log/health-$(date +\\%F).txt 2>&1`;
            }
            engine.awardFlag('flag3');
            return `[PASS] /opt/cell-services/scripts/health-check.sh exists and is executable\n[PASS] health-check.sh found in crontab (0 5 * * *)\n[PASS] Health report found in /var/log/ with PASS/FAIL entries\nFLAG: FLAG{ala-l08-the-night-shift_flag3_health_check_schedul}`;
        },

        // crontab -- manage cron entries
        'crontab': function(args, term, engine) {
            const lFlag = args.includes('-l');
            const eFlag = args.includes('-e');
            const rFlag = args.includes('-r');

            if (lFlag) {
                if (engine.config._state.cronConfigured) {
                    return `# Night shift automation -- cell-night-ops\n0 5 * * * /opt/cell-services/scripts/rotate-logs.sh >> /var/log/rotate-$(date +\\%F).log 2>&1\n0 5 * * * /opt/cell-services/scripts/backup.sh >> /var/log/backup-$(date +\\%F).log 2>&1\n0 5 * * * /opt/cell-services/scripts/health-check.sh >> /var/log/health-$(date +\\%F).txt 2>&1\n`;
                }
                return `no crontab for operator`;
            }

            if (eFlag) {
                return `[Crontab editor simulation]\nUse: addcron <cron-expression> to add entries.\nExample: addcron "0 5 * * * /opt/cell-services/scripts/health-check.sh >> /var/log/health-\\$(date +\\%F).txt 2>&1"`;
            }

            if (rFlag) {
                engine.config._state.cronConfigured = false;
                return '';
            }

            return `Usage: crontab [-l | -e | -r]`;
        },

        // addcron -- simplified cron entry addition for BoxEngine simulation
        'addcron': function(args, term, engine) {
            const entry = args.join(' ');
            if (!entry) return `Usage: addcron "<cron-expression>"\nExample: addcron "0 5 * * * /opt/cell-services/scripts/health-check.sh >> /var/log/health-$(date +\\%F).txt 2>&1"`;

            const hasTime = entry.match(/^\d+\s+\d+\s+\*\s+\*\s+\*/) || entry.match(/^0\s+5\s+\*\s+\*\s+\*/);
            const hasScript = entry.includes('cell-services/scripts') || entry.includes('.sh');

            if (!hasTime) {
                return `addcron: invalid cron time expression. Format: minute hour day month weekday\nFor 05:00 daily: 0 5 * * * <command>`;
            }

            if (!hasScript) {
                return `addcron: entry does not reference a script in /opt/cell-services/scripts/`;
            }

            // Track which scripts have been scheduled
            if (!engine.config._state._cronScripts) engine.config._state._cronScripts = {};
            if (entry.includes('rotate-logs')) engine.config._state._cronScripts.rotate = true;
            if (entry.includes('backup')) engine.config._state._cronScripts.backup = true;
            if (entry.includes('health-check')) engine.config._state._cronScripts.health = true;

            // Only mark cron as fully configured when ALL three are scheduled
            const s = engine.config._state._cronScripts;
            engine.config._state.cronConfigured = !!(s.rotate && s.backup && s.health);

            const scheduled = [s.rotate && 'rotate-logs', s.backup && 'backup', s.health && 'health-check'].filter(Boolean);
            return `Crontab entry added: ${entry}\nScheduled scripts: ${scheduled.join(', ')} (${scheduled.length}/3)`;
        },

        // ping -- local and remote cell connectivity
        'ping': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] <destination>';

            if (target === '127.0.0.1' || target === 'localhost' || target === '10.0.1.100') {
                return `PING ${target} (${target}) 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.031 ms\n\n--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }

            const cellEntry = Object.values(engine.config._remoteCells).find(c => c.ip === target);
            if (cellEntry && cellEntry.reachable) {
                return `PING ${target} (${target}) 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.8 ms\n\n--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }

            return `PING ${target} (${target}) 56(84) bytes of data.\nFrom 10.0.1.100 icmp_seq=1 Destination Host Unreachable\n\n--- ${target} ping statistics ---\n1 packets transmitted, 0 received, +1 errors, 100% packet loss`;
        },

        // systemctl -- local cron management
        'systemctl': function(args, term, engine) {
            const sub = args[0] || '';
            const unit = (args[1] || '').replace(/\.service$/, '');

            if (sub === 'status' && (unit === 'cron' || unit === 'crond')) {
                return `\u25CF cron.service - Regular background program processing daemon\n     Loaded: loaded (/lib/systemd/system/cron.service; enabled)\n     Active: active (running) since Thu 2026-04-10 00:00:01 UTC; 20h 0min ago\n   Main PID: 445 (cron)\n\nApr 10 05:00:01 cell-night-ops CRON[8801]: (operator) CMD (pending -- scripts not scheduled yet)`;
            }
            return `systemctl: use 'systemctl status cron' to check cron service`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{ala-l08-the-night-shift_flag1_log_rotation_verifie}',
            label: 'Log Rotation Verified',
            description: 'rotate-logs.sh ran successfully and archives exist on all three cells.',
            points: 200,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{ala-l08-the-night-shift_flag2_backup_script_verifi}',
            label: 'Backup Script Verified',
            description: 'backup.sh created /var/backups/cell-XX/ with correct incremental structure.',
            points: 200,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{ala-l08-the-night-shift_flag3_health_check_schedul}',
            label: 'Health Check Scheduled',
            description: 'health-check.sh is executable, in crontab at 05:00, and produced a report.',
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
            text: 'Read cell-list.txt and iterate in your scripts using: while read -r name ip; do ... done < /home/operator/cell-list.txt. This keeps the cell list as a single source of truth.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'For incremental backup: rsync -avz --link-dest=/var/backups/cell-14/latest operator@10.0.1.14:/etc/ /var/backups/cell-14/$(date +%F)/. The second run will show far fewer bytes transferred.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'The health check cron entry must escape the % sign: 0 5 * * * /opt/cell-services/scripts/health-check.sh >> /var/log/health-$(date +\\%F).txt 2>&1. Unescaped % causes cron to misparse the command.',
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
            { flagId: 'flag1', objective: '108.3', description: 'Rotating System Logs', skill: 'Bash scripting, SSH remote command execution, log rotation patterns' },
            { flagId: 'flag2', objective: '104.7', description: 'Find system files and place files in the correct location', skill: 'rsync incremental backup with --link-dest, backup structure verification' },
            { flagId: 'flag3', objective: '107.2', description: 'Automate system administration tasks by scheduling jobs', skill: 'cron syntax, % escaping, crontab management, automated reporting' }
        ]
    },

    resetState: function() {
        this._state = {
        rotateScriptWritten: false,     // rotate-logs.sh written to /opt/cell-services/scripts/
        rotateScriptRan: false,         // rotate-logs.sh executed successfully
        backupScriptWritten: false,     // backup.sh written
        backupScriptRan: false,         // backup.sh executed; /var/backups/ populated
        healthScriptWritten: false,     // health-check.sh written
        healthScriptRan: false,         // health-check.sh executed; report written
        cronConfigured: false           // cron entries added (all three scripts)
    };
    }


};


// Auto-reset state on script load (BOX-006 backfill 2026-05-23)
if (typeof ALAL08Config !== 'undefined') ALAL08Config.resetState();
