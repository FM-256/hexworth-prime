/* ============================================================
   CTF ARENA — Box B6: The Corrupted Chronicle
   Database Troubleshooting | Crimson Dawn Confederacy
   Config: MySQL diagnostics, performance tuning, corruption repair
   ============================================================ */

const B6Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Corrupted Chronicle',
    subtitle: 'Database Troubleshooting — Crimson Dawn Confederacy',
    difficulty: 'Intermediate-Advanced',
    accent: '#9333ea',
    storageKey: 'hexworth_ctf_b6',
    registryId: 'b6-corrupted-chronicle',
    trackerKey: 'ctf_b6',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Initial Assessment',
            icon: '\uD83D\uDD0D',
            description: 'SSH into DB-CHRONICLE-01 and assess system health. Check resource utilization and service status.',
            requiredFlags: [],
            mitre: ['T1046', 'T1082'],
            unlocks: ['diagnosis'],
            locked: false
        },
        {
            id: 'diagnosis',
            name: 'Database Diagnosis',
            icon: '\uD83E\uDE7A',
            description: 'Connect to MySQL and analyze slow queries, lock contention, and table status. Identify the root cause.',
            requiredFlags: [],
            mitre: ['T1190', 'T1592.004'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Remediation',
            icon: '\uD83D\uDD27',
            description: 'Apply the fix — add missing index, repair corrupted table, tune configuration, or resolve disk pressure.',
            requiredFlags: ['user'],
            mitre: ['T1059.004', 'T1098'],
            unlocks: ['verification'],
            locked: true
        },
        {
            id: 'verification',
            name: 'Verification',
            icon: '\u2705',
            description: 'Confirm database performance is restored and retrieve the recovered historical record.',
            requiredFlags: ['root'],
            mitre: ['T1530', 'T1005'],
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
                title: 'Assess system health',
                tip: 'Open the Terminal and run: htop or top to check CPU and memory usage.',
                trigger: { event: 'command', match: { cmd: 'contains:top' } }
            },
            {
                title: 'Check disk space',
                tip: 'Run: df -h to check if any partitions are full.',
                trigger: { event: 'command', match: { cmd: 'contains:df' } }
            },
            {
                title: 'Connect to MySQL and investigate',
                tip: 'Run: mysql -u chronicle_user -p chronicle_db then use SHOW PROCESSLIST or SHOW ENGINE INNODB STATUS.',
                trigger: { event: 'command', match: { cmd: 'contains:mysql' } }
            },
            {
                title: 'Identify the root cause',
                tip: 'Use EXPLAIN on slow queries and CHECK TABLE on suspected corrupted tables.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Repair and verify',
                tip: 'Apply the fix (REPAIR TABLE, ALTER TABLE ADD INDEX, or config change) and retrieve the recovered data.',
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
            { flagId: 'user', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Database security', skill: 'Database Performance Diagnosis' },
            { flagId: 'user', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security — Configuration management', skill: 'MySQL Troubleshooting' },
            { flagId: 'root', objective: '4.4', description: 'Given a scenario, implement and maintain security processes — Data integrity', skill: 'Table Repair and Corruption Recovery' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks', skill: 'Database Forensics' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'DB-CHRONICLE-01 BIOS v3.8.2',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
            'RAID Controller: LSI MegaRAID — 2 drives OK',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04.3 LTS',
            'Ubuntu 22.04.3 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'db_admin'
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
        user: 'db_admin',
        hostname: 'DB-CHRONICLE-01',
        startDir: '/home/db_admin',
        welcome: 'Ubuntu 22.04.3 LTS — DB-CHRONICLE-01\nLast login: Thu Mar 14 02:18:44 2026\n\n*** ALERT: Multiple database connection timeout reports received ***\n*** Chronicle Archive performance severely degraded ***\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATA
    // ═══════════════════════════════════════════════════════

    _db: {
        processlist: [
            { id: 1, user: 'chronicle_user', host: '10.10.14.20:48291', db: 'chronicle_db', command: 'Query', time: 847, state: 'Sending data', info: 'SELECT * FROM records WHERE entry_date > \'2020-01-01\' ORDER BY entry_date DESC' },
            { id: 2, user: 'chronicle_user', host: '10.10.14.20:48292', db: 'chronicle_db', command: 'Query', time: 612, state: 'Sending data', info: 'SELECT r.*, a.author_name FROM records r JOIN authors a ON r.author_id = a.id WHERE r.entry_date BETWEEN \'2019-06-01\' AND \'2024-12-31\'' },
            { id: 3, user: 'chronicle_user', host: '10.10.14.21:39102', db: 'chronicle_db', command: 'Query', time: 423, state: 'Waiting for table metadata lock', info: 'SELECT COUNT(*) FROM timeline_events WHERE event_year > 1800' },
            { id: 4, user: 'root', host: 'localhost', db: null, command: 'Sleep', time: 15, state: '', info: null },
            { id: 5, user: 'chronicle_user', host: '10.10.14.22:51088', db: 'chronicle_db', command: 'Query', time: 389, state: 'Sending data', info: 'SELECT * FROM records WHERE category = \'military\' AND entry_date > \'2022-01-01\'' }
        ],
        tables: {
            records: { rows: 2847593, engine: 'InnoDB', size: '1.8 GB', indexes: 'PRIMARY (id)', status: 'OK' },
            timeline_events: { rows: 184210, engine: 'MyISAM', size: '245 MB', indexes: 'PRIMARY (id)', status: 'crashed' },
            authors: { rows: 4521, engine: 'InnoDB', size: '2.1 MB', indexes: 'PRIMARY (id)', status: 'OK' },
            categories: { rows: 47, engine: 'InnoDB', size: '16 KB', indexes: 'PRIMARY (id)', status: 'OK' }
        },
        variables: {
            max_connections: '50',
            innodb_buffer_pool_size: '134217728',
            query_cache_type: 'OFF',
            slow_query_log: 'ON',
            long_query_time: '2',
            innodb_lock_wait_timeout: '50',
            max_allowed_packet: '16777216',
            tmp_table_size: '16777216',
            max_heap_table_size: '16777216'
        },
        recovered_record: 'RECOVERED TIMELINE ENTRY #88421:\nDate: 1847-03-15\nEvent: "The First Conclave of the Crimson Dawn"\nLocation: Sector 7-Alpha, Orbital Station Prometheus\nDetails: Representatives from all twelve orbital habitats\nconvened to ratify the Articles of Confederation.\nSigned by Arch-Overseer Malakai Dorne.\nVerification Token: {{FLAG:root}}'
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
            text: 'Start with system health: run htop and df -h. The database process is consuming excessive CPU. Check if the disk holding /var/lib/mysql is under pressure.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Connect to MySQL and run SHOW PROCESSLIST. Notice queries running for hundreds of seconds on the records table. Use EXPLAIN on the slow query to see if indexes are missing.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The records table has 2.8M rows but only a PRIMARY KEY index. The WHERE clause filters on entry_date — a full table scan is the bottleneck. Also check timeline_events — it may be marked as crashed.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Two issues: (1) Missing index — run ALTER TABLE records ADD INDEX idx_entry_date (entry_date); (2) Corrupted table — run REPAIR TABLE timeline_events; The user flag is the ALTER TABLE statement. After repair, query timeline_events for record #88421.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Chronicle Archive, a vital database storing all historical records of the Confederacy, has fallen into disarray. Scribes report agonizingly slow data access, frequent connection timeouts, and corrupted entries. Automated health checks show periods of extreme load and unusual table lock contention. The Oracle is silent, unable to retrieve its ancient wisdom.',
        scenario: 'DB-CHRONICLE-01 hosts a MySQL 8.x instance serving the chronicle_db database. A critical table with nearly 3 million records lacks proper indexing, causing full table scans on every query. Meanwhile, a MyISAM table suffered an unclean shutdown and is now marked as crashed. The DBA team was recently downsized, and nobody has monitored the database in months.',
        outro: 'The Chronicle Archive breathes again. With proper indexing restored and the corrupted timeline_events table repaired, the Confederacy\'s historical records flow freely once more. The recovered entry from 1847 — the founding document of the Crimson Dawn Confederacy — was nearly lost to the digital void.',
        ecer: {
            executive: 'Budget cuts eliminated the DBA team; no monitoring or maintenance was performed for months',
            culture: 'No database maintenance windows scheduled, no automated health checks',
            employee: 'Original schema designer did not create indexes for frequently queried columns',
            regulatory: 'No data integrity verification procedures; no backup validation process'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Chronicle Archive Admin Panel
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.5:8080/chronicle/',

        pages: {
            '/chronicle/': {
                title: 'Chronicle Archive — Admin Panel',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#9333ea; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Chronicle Archive — Admin Panel</h1>
                        <div style="color:#888; font-size:0.8rem;">DB-CHRONICLE-01 &mdash; MySQL 8.0.35 &mdash; chronicle_db</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:6px; padding:16px; margin-bottom:20px;">
                            <div style="color:#dc2626; font-weight:700; margin-bottom:8px;">SYSTEM ALERTS</div>
                            <div style="font-size:0.8rem; color:#7f1d1d; line-height:1.6;">
                                <div>CRITICAL: Table 'chronicle_db.timeline_events' is marked as crashed and should be repaired</div>
                                <div>WARNING: 47 slow queries detected in the last hour (threshold: 2s)</div>
                                <div>WARNING: Active connections at 48/50 (96% capacity)</div>
                                <div>WARNING: InnoDB buffer pool hit ratio below 60%</div>
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px;">
                                <div style="color:#64748b; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em;">Active Queries</div>
                                <div style="font-size:1.8rem; font-weight:700; color:#dc2626;">5</div>
                                <div style="font-size:0.7rem; color:#94a3b8;">3 running > 300s</div>
                            </div>
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px;">
                                <div style="color:#64748b; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em;">Table Status</div>
                                <div style="font-size:1.8rem; font-weight:700; color:#f59e0b;">3/4</div>
                                <div style="font-size:0.7rem; color:#94a3b8;">1 table crashed</div>
                            </div>
                        </div>

                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px;">
                            <div style="color:#64748b; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;">Slow Query Log (last 5)</div>
                            <div style="font-family:monospace; font-size:0.7rem; color:#334155; line-height:1.8;">
                                <div>[03:41:12] 847s — SELECT * FROM records WHERE entry_date > '2020-01-01'...</div>
                                <div>[03:38:55] 612s — SELECT r.*, a.author_name FROM records r JOIN authors...</div>
                                <div>[03:35:22] 423s — SELECT COUNT(*) FROM timeline_events WHERE event_year > 1800</div>
                                <div>[03:31:09] 389s — SELECT * FROM records WHERE category = 'military'...</div>
                                <div>[03:28:44] 201s — SELECT * FROM records WHERE entry_date BETWEEN...</div>
                            </div>
                        </div>
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (target machine)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'db_admin': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: DB-CHRONICLE-01 (localhost)\nDatabase: chronicle_db (MySQL 8.0)\nObjective: Diagnose and fix database performance issues\n\nReported symptoms:\n1. Extremely slow query response times\n2. Connection timeouts and drops\n3. Corrupted table entries\n4. High CPU and I/O from mysqld process\n\nCredentials:\n  MySQL user: chronicle_user\n  MySQL pass: chr0n1cl3_r3ad3r\n  Database: chronicle_db\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ssh db_admin@DB-CHRONICLE-01\nsudo systemctl status mysql\nmysql -u chronicle_user -p chronicle_db\nhtop\ndf -h'
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
                            content: 'DB-CHRONICLE-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nmysql:x:27:27:MySQL Server:/var/lib/mysql:/bin/false\ndb_admin:x:1000:1000:DB Admin,,,:/home/db_admin:/bin/bash'
                        },
                        'mysql': {
                            type: 'dir',
                            children: {
                                'my.cnf': {
                                    type: 'file',
                                    content: '[mysqld]\nuser            = mysql\npid-file        = /var/run/mysqld/mysqld.pid\nsocket          = /var/run/mysqld/mysqld.sock\nport            = 3306\nbasedir         = /usr\ndatadir         = /var/lib/mysql\ntmpdir          = /tmp\n\n# Connection Settings\nmax_connections = 50\nwait_timeout    = 28800\n\n# InnoDB Settings\ninnodb_buffer_pool_size = 128M\ninnodb_log_file_size    = 48M\ninnodb_lock_wait_timeout = 50\n\n# Logging\nslow_query_log  = 1\nlong_query_time = 2\nslow_query_log_file = /var/log/mysql/slow.log\n\n# NOTE: max_connections set to 50 per budget constraints\n# TODO: Review index strategy for records table (ticket #4471 — OPEN since 2024-08)\n'
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
                                'mysql': {
                                    type: 'dir',
                                    children: {
                                        'chronicle_db': {
                                            type: 'dir',
                                            children: {
                                                'records.ibd': { type: 'file', content: '[BINARY: InnoDB tablespace — 1.8 GB]' },
                                                'timeline_events.MYI': { type: 'file', content: '[BINARY: MyISAM index — CORRUPTED — unclean shutdown detected]' },
                                                'timeline_events.MYD': { type: 'file', content: '[BINARY: MyISAM data — 245 MB — partial corruption at offset 0x3A8F100]' },
                                                'authors.ibd': { type: 'file', content: '[BINARY: InnoDB tablespace — 2.1 MB]' },
                                                'categories.ibd': { type: 'file', content: '[BINARY: InnoDB tablespace — 16 KB]' }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'log': {
                            type: 'dir',
                            children: {
                                'mysql': {
                                    type: 'dir',
                                    children: {
                                        'error.log': {
                                            type: 'file',
                                            content: '2026-03-14T02:18:44.123456Z 0 [Note] /usr/sbin/mysqld: ready for connections.\nVersion: \'8.0.35\'  socket: \'/var/run/mysqld/mysqld.sock\'  port: 3306\n2026-03-14T02:19:01.234567Z 0 [Warning] Aborted connection 1847 to db: \'chronicle_db\' user: \'chronicle_user\' host: \'10.10.14.20\' (Got timeout reading communication packets)\n2026-03-14T02:19:15.345678Z 0 [ERROR] /usr/sbin/mysqld: Table \'./chronicle_db/timeline_events\' is marked as crashed and should be repaired\n2026-03-14T02:22:33.456789Z 0 [Warning] Too many connections (max_connections=50). Rejecting connection from 10.10.14.23\n2026-03-14T02:25:01.567890Z 0 [Warning] InnoDB: Long semaphore wait detected. Possible deadlock.\n2026-03-14T03:15:44.678901Z 0 [ERROR] /usr/sbin/mysqld: Table \'./chronicle_db/timeline_events\' is marked as crashed and last (automatic?) repair failed'
                                        },
                                        'slow.log': {
                                            type: 'file',
                                            content: '# Time: 2026-03-14T03:41:12.000000Z\n# User@Host: chronicle_user[chronicle_user] @ 10.10.14.20\n# Query_time: 847.234  Lock_time: 0.003  Rows_sent: 1284921  Rows_examined: 2847593\nSELECT * FROM records WHERE entry_date > \'2020-01-01\' ORDER BY entry_date DESC;\n\n# Time: 2026-03-14T03:38:55.000000Z\n# User@Host: chronicle_user[chronicle_user] @ 10.10.14.20\n# Query_time: 612.891  Lock_time: 0.002  Rows_sent: 892441  Rows_examined: 2847593\nSELECT r.*, a.author_name FROM records r JOIN authors a ON r.author_id = a.id WHERE r.entry_date BETWEEN \'2019-06-01\' AND \'2024-12-31\';\n\n# Time: 2026-03-14T03:35:22.000000Z\n# User@Host: chronicle_user[chronicle_user] @ 10.10.14.21\n# Query_time: 423.102  Lock_time: 312.445  Rows_sent: 0  Rows_examined: 0\nSELECT COUNT(*) FROM timeline_events WHERE event_year > 1800;\n# Note: Table is marked as crashed'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 14 02:18:44 DB-CHRONICLE-01 systemd[1]: Started MySQL Community Server.\nMar 14 02:19:01 DB-CHRONICLE-01 mysqld[1847]: Aborted connection to chronicle_db\nMar 14 02:22:33 DB-CHRONICLE-01 mysqld[1847]: Too many connections\nMar 14 03:15:44 DB-CHRONICLE-01 mysqld[1847]: Table timeline_events crash recovery failed\nMar 14 03:41:00 DB-CHRONICLE-01 kernel: [48291.234] CPU3: 98.7% usage (mysqld)'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'mysql_debug.txt': {
                            type: 'file',
                            content: 'Debug notes from last DBA (resigned 2025-11):\n- records table needs index on entry_date column URGENTLY\n- timeline_events should be converted from MyISAM to InnoDB\n- max_connections too low for production load\n- Ticket #4471 still open, nobody assigned\n- Buffer pool way too small for 1.8GB table\n\nI\'ve been saying this for months. Nobody listens.\nGood luck to whoever finds this.'
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
                            type: 'dir',
                            children: {}
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
        'help': function(args) {
            return `Available commands:
  System:     ls, cd, pwd, cat, grep, ps, top, htop, df, free, whoami, id, uname, clear, history
  Network:    ping, netstat, ss, ip, curl
  Database:   mysql, mysqlcheck, mysqladmin
  Files:      find, head, tail, less, wc, file
  Services:   systemctl, journalctl
  Other:      sudo, man, echo, export

Type 'man <command>' for usage details.`;
        },

        'htop': function(args) {
            return `  CPU[||||||||||||||||||||||||||||||||  97.2%]   Tasks: 142, 312 thr; 3 running
  Mem[|||||||||||||||||           12.4G/16.0G]   Load average: 14.72 8.91 6.33
  Swp[||||                       1.2G/4.0G]     Uptime: 14 days, 03:22:18

    PID USER      PRI  NI  VIRT   RES   SHR S CPU%  MEM%   TIME+  Command
   1847 mysql      20   0 12.8G 11.2G  8420 R 94.3  70.0  847:22 /usr/sbin/mysqld
   2891 root       20   0  412M  38M   4200 S  1.2   0.2    4:15 /usr/sbin/rsyslogd
    892 root       20   0  168M  12M   8400 S  0.3   0.1    1:02 /lib/systemd/systemd
   3401 db_admin   20   0   22M  4.8M  3200 R  0.1   0.0    0:00 htop`;
        },

        'top': function(args) {
            return `top - 03:42:18 up 14 days,  3:22,  2 users,  load average: 14.72, 8.91, 6.33
Tasks: 142 total,   3 running, 139 sleeping,   0 stopped,   0 zombie
%Cpu(s): 94.3 us,  3.2 sy,  0.0 ni,  1.8 id,  0.5 wa,  0.0 hi,  0.2 si
MiB Mem :  16384.0 total,   3584.0 free,  12288.0 used,    512.0 buff/cache
MiB Swap:   4096.0 total,   2896.0 free,   1200.0 used.   3200.0 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   1847 mysql     20   0   12.8g  11.2g   8420 R  94.3  70.0 847:22.14 mysqld
   2891 root      20   0  412.0m  38.0m   4200 S   1.2   0.2   4:15.33 rsyslogd
    892 root      20   0  168.0m  12.0m   8400 S   0.3   0.1   1:02.88 systemd`;
        },

        'df': function(args) {
            if (args.includes('-h') || args.includes('-H')) {
                return `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       100G   72G   28G  72% /
/dev/sda2       400G  358G   42G  90% /var/lib/mysql
tmpfs           8.0G  412M  7.6G   6% /tmp
/dev/sda3        10G  8.2G  1.8G  82% /var/log`;
            }
            return `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1      104857600 75497472  29360128  72% /
/dev/sda2      419430400 375809638  43620762  90% /var/lib/mysql
tmpfs            8388608   421888   7966720   6% /tmp
/dev/sda3       10485760  8597504   1888256  82% /var/log`;
        },

        'free': function(args) {
            if (args.includes('-h')) {
                return `               total        used        free      shared  buff/cache   available
Mem:            16Gi       12Gi       3.5Gi       128Mi       512Mi       3.1Gi
Swap:          4.0Gi       1.2Gi       2.8Gi`;
            }
            return `               total        used        free      shared  buff/cache   available
Mem:        16777216    12582912     3670016      131072      524288     3276800
Swap:        4194304     1258291     2936013`;
        },

        'ps': function(args) {
            if (args.includes('aux') || args.includes('-ef') || args.includes('-aux')) {
                return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1 168000 12000 ?        Ss   Mar01   1:02 /lib/systemd/systemd
root         892  0.0  0.0  22336  4800 ?        Ss   Mar01   0:08 /usr/sbin/cron
mysql       1847 94.3 70.0 13421772 11744051 ?   Rl   Mar01 847:22 /usr/sbin/mysqld --defaults-file=/etc/mysql/my.cnf
root        2891  1.2  0.2 421888 38000 ?        Sl   Mar01   4:15 /usr/sbin/rsyslogd
root        3001  0.0  0.0  15280  2004 ?        Ss   Mar01   0:00 /usr/sbin/sshd
db_admin    3401  0.0  0.0  22528  4800 pts/0    Ss   03:40   0:00 -bash
db_admin    3455  0.0  0.0  21888  3200 pts/0    R+   03:42   0:00 ps aux`;
            }
            return 'Usage: ps [aux|-ef]';
        },

        'netstat': function(args) {
            return `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:3306            0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0  48291 10.10.14.5:3306         10.10.14.20:48291       ESTABLISHED
tcp        0  48292 10.10.14.5:3306         10.10.14.20:48292       ESTABLISHED
tcp        0  39102 10.10.14.5:3306         10.10.14.21:39102       ESTABLISHED
tcp        0  51088 10.10.14.5:3306         10.10.14.22:51088       ESTABLISHED
tcp        0      0 10.10.14.5:3306         10.10.14.23:52100       TIME_WAIT
tcp        0      0 10.10.14.5:3306         10.10.14.23:52101       TIME_WAIT`;
        },

        'ss': function(args) {
            return `Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port
tcp    LISTEN  0       50      0.0.0.0:3306          0.0.0.0:*
tcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*
tcp    ESTAB   0       48291   10.10.14.5:3306       10.10.14.20:48291
tcp    ESTAB   0       48292   10.10.14.5:3306       10.10.14.20:48292
tcp    ESTAB   0       39102   10.10.14.5:3306       10.10.14.21:39102
tcp    ESTAB   0       51088   10.10.14.5:3306       10.10.14.22:51088`;
        },

        'mysql': function(args, term, engine) {
            const argStr = args.join(' ').toLowerCase();

            // SHOW PROCESSLIST
            if (argStr.includes('show processlist') || argStr.includes('show full processlist') || argStr.includes('-e "show processlist"') || argStr.includes("-e 'show processlist'")) {
                const db = B6Config._db;
                let output = '+----+-----------------+---------------------+--------------+---------+------+----------------------------------+--------------------------------------+\n';
                output += '| Id | User            | Host                | db           | Command | Time | State                            | Info                                 |\n';
                output += '+----+-----------------+---------------------+--------------+---------+------+----------------------------------+--------------------------------------+\n';
                db.processlist.forEach(p => {
                    output += `| ${String(p.id).padEnd(2)} | ${(p.user || '').padEnd(15)} | ${(p.host || '').padEnd(19)} | ${(p.db || 'NULL').padEnd(12)} | ${(p.command || '').padEnd(7)} | ${String(p.time).padEnd(4)} | ${(p.state || '').padEnd(32)} | ${(p.info || 'NULL').substring(0, 36).padEnd(36)} |\n`;
                });
                output += '+----+-----------------+---------------------+--------------+---------+------+----------------------------------+--------------------------------------+\n';
                output += `${db.processlist.length} rows in set (0.00 sec)`;
                return output;
            }

            // SHOW VARIABLES
            if (argStr.includes('show variables') || argStr.includes('show global variables')) {
                const db = B6Config._db;
                let output = '+-------------------------------+------------+\n';
                output += '| Variable_name                 | Value      |\n';
                output += '+-------------------------------+------------+\n';
                for (const [k, v] of Object.entries(db.variables)) {
                    output += `| ${k.padEnd(29)} | ${v.padEnd(10)} |\n`;
                }
                output += '+-------------------------------+------------+\n';
                return output;
            }

            // EXPLAIN
            if (argStr.includes('explain')) {
                return `+----+-------------+---------+------+---------------+------+---------+------+---------+-------------+
| id | select_type | table   | type | possible_keys | key  | key_len | ref  | rows    | Extra       |
+----+-------------+---------+------+---------------+------+---------+------+---------+-------------+
|  1 | SIMPLE      | records | ALL  | NULL          | NULL | NULL    | NULL | 2847593 | Using where |
+----+-------------+---------+------+---------------+------+---------+------+---------+-------------+
1 row in set (0.00 sec)

WARNING: Full table scan detected — no usable index on 'entry_date' column.
Rows examined: 2,847,593 (entire table)`;
            }

            // CHECK TABLE
            if (argStr.includes('check table')) {
                if (argStr.includes('timeline_events')) {
                    return `+---------------------------------+-------+----------+-----------------------------------------------------------+
| Table                           | Op    | Msg_type | Msg_text                                                  |
+---------------------------------+-------+----------+-----------------------------------------------------------+
| chronicle_db.timeline_events    | check | error    | Table 'chronicle_db.timeline_events' is marked as crashed |
| chronicle_db.timeline_events    | check | error    | Corrupt key file for table 'timeline_events'              |
+---------------------------------+-------+----------+-----------------------------------------------------------+`;
                }
                if (argStr.includes('records')) {
                    return `+------------------------+-------+----------+----------+
| Table                  | Op    | Msg_type | Msg_text |
+------------------------+-------+----------+----------+
| chronicle_db.records   | check | status   | OK       |
+------------------------+-------+----------+----------+`;
                }
                return `Table check completed.`;
            }

            // REPAIR TABLE
            if (argStr.includes('repair table')) {
                if (argStr.includes('timeline_events')) {
                    return `+---------------------------------+--------+----------+--------------------------------------------+
| Table                           | Op     | Msg_type | Msg_text                                   |
+---------------------------------+--------+----------+--------------------------------------------+
| chronicle_db.timeline_events    | repair | info     | Repairing crashed MyISAM index file        |
| chronicle_db.timeline_events    | repair | info     | Data records: 184210                       |
| chronicle_db.timeline_events    | repair | info     | Recovered 184207 of 184210 records         |
| chronicle_db.timeline_events    | repair | status   | OK                                         |
+---------------------------------+--------+----------+--------------------------------------------+

Table repaired successfully. 3 records were unrecoverable.
You may now query timeline_events normally.`;
                }
                return 'No repair needed — table status is OK.';
            }

            // ALTER TABLE ADD INDEX
            if (argStr.includes('alter table') && argStr.includes('add index') && argStr.includes('entry_date')) {
                return `Query OK, 2847593 rows affected (42.18 sec)
Records: 2847593  Duplicates: 0  Warnings: 0

Index 'idx_entry_date' created on 'records.entry_date'.

{{FLAG:user}}`;
            }

            // SHOW TABLE STATUS
            if (argStr.includes('show table status')) {
                const db = B6Config._db;
                let output = '+------------------+--------+---------+------------+------+----------------+\n';
                output += '| Name             | Engine | Rows    | Data_length| Auto | Comment        |\n';
                output += '+------------------+--------+---------+------------+------+----------------+\n';
                for (const [name, info] of Object.entries(db.tables)) {
                    const comment = info.status === 'crashed' ? 'CRASHED' : '';
                    output += `| ${name.padEnd(16)} | ${info.engine.padEnd(6)} | ${String(info.rows).padEnd(7)} | ${info.size.padEnd(10)} | YES  | ${comment.padEnd(14)} |\n`;
                }
                output += '+------------------+--------+---------+------------+------+----------------+\n';
                return output;
            }

            // SHOW INDEX
            if (argStr.includes('show index') || argStr.includes('show indexes') || argStr.includes('show keys')) {
                if (argStr.includes('records')) {
                    return `+---------+------------+----------+--------------+-------------+
| Table   | Non_unique | Key_name | Seq_in_index | Column_name |
+---------+------------+----------+--------------+-------------+
| records |          0 | PRIMARY  |            1 | id          |
+---------+------------+----------+--------------+-------------+
1 row in set (0.00 sec)

NOTE: Only PRIMARY KEY exists. No secondary indexes found.`;
                }
                return 'Specify a table: SHOW INDEX FROM <table_name>';
            }

            // SELECT from timeline_events after repair
            if (argStr.includes('select') && argStr.includes('timeline_events') && argStr.includes('88421')) {
                return B6Config._db.recovered_record;
            }

            // SHOW ENGINE INNODB STATUS
            if (argStr.includes('innodb status')) {
                return `=====================================
INNODB MONITOR OUTPUT
=====================================
Per second averages calculated from the last 30 seconds
---SEMAPHORES---
OS WAIT ARRAY INFO: reservation count 847291
---TRANSACTIONS---
Trx id counter 284759
---BUFFER POOL AND MEMORY---
Total large memory allocated 137363456
Buffer pool size   8192
Free buffers       412
Database pages     7780
Modified db pages  2891
Buffer pool hit rate 587 / 1000 (WARNING: very low)
---ROW OPERATIONS---
Number of rows inserted 0, updated 0, deleted 0, read 2847593
---LATEST DEADLOCK---
No deadlocks detected.`;
            }

            // Generic connection
            if (args.length === 0) {
                return 'Usage: mysql -u <user> -p <database>\n       mysql -u chronicle_user -p chronicle_db -e "QUERY"\n\nAvailable queries:\n  SHOW PROCESSLIST\n  SHOW TABLE STATUS\n  SHOW VARIABLES\n  SHOW INDEX FROM <table>\n  SHOW ENGINE INNODB STATUS\n  EXPLAIN SELECT ...\n  CHECK TABLE <table>\n  REPAIR TABLE <table>\n  ALTER TABLE <table> ADD INDEX ...';
            }

            return `Welcome to the MySQL monitor.  Commands end with ;
Server version: 8.0.35 MySQL Community Server

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

mysql> Connected to chronicle_db as chronicle_user.
Type SQL commands or use -e flag for direct execution.`;
        },

        'mysqlcheck': function(args) {
            if (args.includes('chronicle_db') || args.includes('--all-databases')) {
                return `chronicle_db.authors                              OK
chronicle_db.categories                           OK
chronicle_db.records                              OK
chronicle_db.timeline_events
error    : Table 'chronicle_db.timeline_events' is marked as crashed and should be repaired
status   : Operation failed`;
            }
            return 'Usage: mysqlcheck [OPTIONS] database [tables]';
        },

        'mysqladmin': function(args) {
            if (args.includes('status')) {
                return 'Uptime: 1209738  Threads: 5  Questions: 847291  Slow queries: 2891  Opens: 142  Flush tables: 3  Open tables: 47  Queries per second avg: 0.700';
            }
            if (args.includes('processlist')) {
                return '+----+-----------------+---------------------+--------------+---------+------+\n| Id | User            | Host                | db           | Command | Time |\n+----+-----------------+---------------------+--------------+---------+------+\n|  1 | chronicle_user  | 10.10.14.20:48291   | chronicle_db | Query   | 847  |\n|  2 | chronicle_user  | 10.10.14.20:48292   | chronicle_db | Query   | 612  |\n|  3 | chronicle_user  | 10.10.14.21:39102   | chronicle_db | Query   | 423  |\n|  4 | root            | localhost            | NULL         | Sleep   | 15   |\n|  5 | chronicle_user  | 10.10.14.22:51088   | chronicle_db | Query   | 389  |\n+----+-----------------+---------------------+--------------+---------+------+';
            }
            return 'Usage: mysqladmin [OPTIONS] command command...';
        },

        'systemctl': function(args) {
            const service = args.find(a => !a.startsWith('-'));
            const action = args[0];
            if (action === 'status' && (service === 'mysql' || service === 'mysqld' || args[1] === 'mysql' || args[1] === 'mysqld')) {
                return `mysql.service - MySQL Community Server
     Loaded: loaded (/lib/systemd/system/mysql.service; enabled)
     Active: active (running) since Sat 2026-03-01 00:00:00 UTC; 14 days ago
   Main PID: 1847 (mysqld)
     Status: "Server is operational"
      Tasks: 48 (limit: 4915)
     Memory: 11.4G
        CPU: 847h 22min 14.891s
     CGroup: /system.slice/mysql.service
             \u2514 1847 /usr/sbin/mysqld --defaults-file=/etc/mysql/my.cnf

Mar 14 02:19:15 DB-CHRONICLE-01 mysqld[1847]: Table './chronicle_db/timeline_events' is marked as crashed
Mar 14 02:22:33 DB-CHRONICLE-01 mysqld[1847]: Too many connections`;
            }
            if (action === 'status' && (service === 'ssh' || service === 'sshd' || args[1] === 'ssh' || args[1] === 'sshd')) {
                return `ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)
     Active: active (running) since Sat 2026-03-01 00:00:00 UTC; 14 days ago
   Main PID: 3001 (sshd)`;
            }
            return 'Unit not found.';
        },

        'journalctl': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('mysql') || argStr.includes('mysqld')) {
                return `-- Journal begins at Sat 2026-03-01 00:00:00 UTC --
Mar 01 00:00:00 DB-CHRONICLE-01 systemd[1]: Starting MySQL Community Server...
Mar 01 00:00:02 DB-CHRONICLE-01 mysqld[1847]: ready for connections.
Mar 14 02:19:01 DB-CHRONICLE-01 mysqld[1847]: Aborted connection 1847 to db: 'chronicle_db'
Mar 14 02:19:15 DB-CHRONICLE-01 mysqld[1847]: [ERROR] Table './chronicle_db/timeline_events' is marked as crashed
Mar 14 02:22:33 DB-CHRONICLE-01 mysqld[1847]: [Warning] Too many connections (max_connections=50)
Mar 14 02:25:01 DB-CHRONICLE-01 mysqld[1847]: [Warning] InnoDB: Long semaphore wait detected
Mar 14 03:15:44 DB-CHRONICLE-01 mysqld[1847]: [ERROR] Table 'timeline_events' repair failed
Mar 14 03:41:00 DB-CHRONICLE-01 kernel: CPU3: 98.7% usage (mysqld)`;
            }
            return 'No journal entries matching criteria.';
        },

        'iostat': function(args) {
            return `Linux 5.15.0-91-generic (DB-CHRONICLE-01)    03/14/2026

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
          94.30    0.00    3.20    1.80    0.00    0.70

Device             tps    kB_read/s    kB_wrtn/s    kB_dscd/s    kB_read    kB_wrtn    kB_dscd
sda             892.00    45678.00     12345.00         0.00  567890123   12345678          0
sda1            120.00     8901.00      2345.00         0.00   89012345    2345678          0
sda2            748.00    35890.00      9012.00         0.00  358901234    9012345          0`;
        },

        'vmstat': function(args) {
            return `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 3  1 1258291 3670016 128000 396288  12    8 45678 12345 2891  847 94  3  1  2  0`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === 'localhost' || target === '127.0.0.1' || target === '10.10.14.5') {
                return `PING ${target} (${target === 'localhost' ? '127.0.0.1' : target}) 56(84) bytes of data.
64 bytes from ${target === 'localhost' ? '127.0.0.1' : target}: icmp_seq=1 ttl=64 time=0.032 ms
64 bytes from ${target === 'localhost' ? '127.0.0.1' : target}: icmp_seq=2 ttl=64 time=0.028 ms

--- ${target} ping statistics ---
2 packets transmitted, 2 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            if (args[0] === 'a' || args[0] === 'addr') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.10.14.5/24 brd 10.10.14.255 scope global eth0`;
            }
            return 'Usage: ip [addr|route|link]';
        },

        'curl': function(args) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            if (url.includes('10.10.14.5') && url.includes('chronicle')) {
                return '<html><head><title>Chronicle Archive — Admin Panel</title></head>\n<body>\n<h1>Chronicle Archive</h1>\n<div class="alert">CRITICAL: Table timeline_events is crashed</div>\n<div class="alert">WARNING: 47 slow queries in last hour</div>\n</body></html>';
            }
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target === '10.10.14.5' || target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.00032s latency).

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.9p1
3306/tcp open  mysql      MySQL 8.0.35

Nmap done: 1 IP address (1 host up) scanned in 1.42 seconds`;
            }
            return `Starting Nmap 7.94\nNote: Host seems down.\nNmap done: 0 hosts up.`;
        },

        'uname': function(args) {
            if (args.includes('-a')) return 'Linux DB-CHRONICLE-01 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
            return 'Linux';
        },

        'whoami': function() { return 'db_admin'; },

        'id': function() { return 'uid=1000(db_admin) gid=1000(db_admin) groups=1000(db_admin),27(sudo),999(docker)'; },

        'hostname': function() { return 'DB-CHRONICLE-01'; },

        'uptime': function() { return ' 03:42:18 up 14 days,  3:22,  2 users,  load average: 14.72, 8.91, 6.33'; },

        'history': function() {
            return `    1  ssh db_admin@DB-CHRONICLE-01
    2  sudo systemctl status mysql
    3  htop
    4  df -h
    5  mysql -u chronicle_user -p chronicle_db`;
        },

        'man': function(args) {
            if (!args[0]) return 'What manual page do you want?';
            return `${args[0].toUpperCase()}(1) — Use '${args[0]} --help' for quick usage.`;
        },

        'find': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('my.cnf') || argStr.includes('mysql')) {
                return '/etc/mysql/my.cnf\n/var/lib/mysql/chronicle_db/';
            }
            if (argStr.includes('.log')) {
                return '/var/log/mysql/error.log\n/var/log/mysql/slow.log\n/var/log/syslog';
            }
            return 'find: specify search path and criteria';
        },

        'head': function(args) { return 'Use cat to view file contents.'; },
        'tail': function(args) { return 'Use cat to view file contents.'; },
        'less': function(args) { return 'Use cat to view file contents.'; },
        'wc': function(args) { return '  184210 /var/lib/mysql/chronicle_db/timeline_events.MYD'; },
        'file': function(args) { return (args[0] || 'file') + ': data'; },
        'echo': function(args) { return args.join(' '); },
        'export': function(args) { return ''; },
        'sudo': function(args, term, engine) {
            // Pass through to the actual command
            const cmd = args[0];
            if (cmd && B6Config.commands[cmd]) {
                return B6Config.commands[cmd](args.slice(1), term, engine);
            }
            return `sudo: ${cmd || 'command'}: command not found`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }
};
