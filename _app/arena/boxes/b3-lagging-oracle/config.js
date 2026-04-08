/* ============================================================
   CTF ARENA — Box B3: The Lagging Oracle
   Web App Troubleshooting | Performance & Database Errors
   Config: nginx, mysql, filesystem, flags, hints, lore
   ============================================================ */

const B3Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Lagging Oracle',
    subtitle: 'Web App Troubleshooting — Performance & Errors',
    difficulty: 'Intermediate',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_b3',
    registryId: 'b3-lagging-oracle',
    trackerKey: 'ctf_b3',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Web troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Initial Assessment',
            icon: '\uD83D\uDD0D',
            description: 'Connect to the Oracle server and assess system resource usage. Identify the bottleneck.',
            requiredFlags: [],
            mitre: ['T1082', 'T1057'],
            unlocks: ['diagnosis'],
            locked: false
        },
        {
            id: 'diagnosis',
            name: 'Log & Config Analysis',
            icon: '\uD83D\uDCCB',
            description: 'Inspect Nginx, PHP-FPM, and MySQL logs. Identify slow queries and misconfigurations.',
            requiredFlags: [],
            mitre: ['T1005', 'T1083'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Performance Fix',
            icon: '\uD83D\uDD27',
            description: 'Apply the database index or configuration fix to resolve the performance bottleneck.',
            requiredFlags: ['user'],
            mitre: ['T1489', 'T1565'],
            unlocks: ['verification'],
            locked: true
        },
        {
            id: 'verification',
            name: 'Verification',
            icon: '\u2705',
            description: 'Verify the Oracle is responding quickly and retrieve the performance report token.',
            requiredFlags: ['root'],
            mitre: ['T1497', 'T1082'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Check system resources',
                tip: 'Run: top or htop to identify high CPU/memory usage. Check which process is consuming resources.',
                trigger: { event: 'command', match: { cmd: 'contains:top' } }
            },
            {
                title: 'Examine web server and database logs',
                tip: 'Check /var/log/nginx/error.log and /var/log/mysql/slow-query.log for clues.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:cat' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:tail' } }
                    ]
                }
            },
            {
                title: 'Analyze the slow query',
                tip: 'Connect to MySQL and run SHOW PROCESSLIST. Use EXPLAIN on the slow query to see it does a full table scan.',
                trigger: { event: 'command', match: { cmd: 'contains:mysql' } }
            },
            {
                title: 'Identify the missing index',
                tip: 'The queries table lacks an index on the timestamp column. The user flag reveals this root cause.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Verify the fix and retrieve the performance token',
                tip: 'After creating the index, curl the performance report page for the root flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Database security', skill: 'Database Performance Analysis' },
            { flagId: 'user', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security — Performance monitoring', skill: 'Slow Query Diagnosis' },
            { flagId: 'root', objective: '4.4', description: 'Given a scenario, analyze data as part of security monitoring activities — Web server logs', skill: 'Web Application Performance' },
            { flagId: 'root', objective: '1.3', description: 'Given a scenario, explain the importance of change management processes', skill: 'Configuration Optimization' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'ORACLE-WEB-01 BIOS v3.0.2',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
            'Network: eth0 link detected — 10.10.20.5',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS',
            'Ubuntu 22.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'oracle_admin'
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
        user: 'oracle_admin',
        hostname: 'oracle-web-01',
        startDir: '/home/oracle_admin',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to ORACLE-WEB-01\nLast login: Tue Mar 18 02:30:11 2026 from 10.10.20.50\n\n*** WARNING: High CPU usage detected (87%) ***\n*** Users reporting slow page loads and 500 errors ***\n\nType \'help\' for available commands.\n'
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
                        'oracle_admin': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: ORACLE-WEB-01 (10.10.20.5)\nObjective: Diagnose and fix web application performance issues\n\nStack:\n  - Nginx (reverse proxy)\n  - PHP-FPM 8.1 (application server)\n  - MySQL 8.0 (database)\n\nSymptoms:\n  - Slow page loads (10-30 seconds)\n  - Intermittent 500 errors\n  - High CPU usage (MySQL)\n\nCheck:\n  1. System resources (top, htop, free, df)\n  2. Nginx error logs\n  3. PHP-FPM logs\n  4. MySQL slow query log\n  5. Database queries and indexes'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'top\nsudo tail -f /var/log/nginx/error.log\nsudo tail -f /var/log/mysql/slow-query.log\nsudo mysql -u root oracle_db'
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
                            content: 'oracle-web-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nmysql:x:27:27:MySQL Server:/var/lib/mysql:/bin/false\noracle_admin:x:1000:1000:Oracle Admin:/home/oracle_admin:/bin/bash'
                        },
                        'nginx': {
                            type: 'dir',
                            children: {
                                'nginx.conf': {
                                    type: 'file',
                                    content: 'user www-data;\nworker_processes auto;\npid /run/nginx.pid;\n\nevents {\n    worker_connections 768;\n}\n\nhttp {\n    sendfile on;\n    tcp_nopush on;\n    types_hash_max_size 2048;\n\n    include /etc/nginx/mime.types;\n    default_type application/octet-stream;\n\n    access_log /var/log/nginx/access.log;\n    error_log /var/log/nginx/error.log;\n\n    gzip on;\n\n    include /etc/nginx/sites-enabled/*;\n}\n'
                                },
                                'sites-enabled': {
                                    type: 'dir',
                                    children: {
                                        'oracle-app': {
                                            type: 'file',
                                            content: 'server {\n    listen 80;\n    server_name oracle-web-01;\n    root /var/www/oracle;\n    index index.php;\n\n    location / {\n        try_files $uri $uri/ /index.php?$args;\n    }\n\n    location ~ \\.php$ {\n        include fastcgi_params;\n        fastcgi_pass unix:/run/php/php8.1-fpm.sock;\n        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n        fastcgi_read_timeout 30;\n    }\n}\n'
                                        }
                                    }
                                }
                            }
                        },
                        'mysql': {
                            type: 'dir',
                            children: {
                                'my.cnf': {
                                    type: 'file',
                                    content: '[mysqld]\nuser            = mysql\npid-file        = /var/run/mysqld/mysqld.pid\nsocket          = /var/run/mysqld/mysqld.sock\nport            = 3306\nbasedir         = /usr\ndatadir         = /var/lib/mysql\n\n# Performance settings\ninnodb_buffer_pool_size = 128M\ninnodb_log_file_size = 48M\nmax_connections = 100\n\n# Slow query log\nslow_query_log = 1\nslow_query_log_file = /var/log/mysql/slow-query.log\nlong_query_time = 2\n\n# Query cache disabled in MySQL 8.0+\n'
                                }
                            }
                        },
                        'php': {
                            type: 'dir',
                            children: {
                                '8.1': {
                                    type: 'dir',
                                    children: {
                                        'fpm': {
                                            type: 'dir',
                                            children: {
                                                'pool.d': {
                                                    type: 'dir',
                                                    children: {
                                                        'www.conf': {
                                                            type: 'file',
                                                            content: '[www]\nuser = www-data\ngroup = www-data\nlisten = /run/php/php8.1-fpm.sock\npm = dynamic\npm.max_children = 5\npm.start_servers = 2\npm.min_spare_servers = 1\npm.max_spare_servers = 3\npm.max_requests = 500\n\nphp_admin_value[error_log] = /var/log/php-fpm/www-error.log\nphp_admin_flag[log_errors] = on\n'
                                                        }
                                                    }
                                                }
                                            }
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
                        'log': {
                            type: 'dir',
                            children: {
                                'nginx': {
                                    type: 'dir',
                                    children: {
                                        'access.log': {
                                            type: 'file',
                                            content: '10.10.20.50 - - [18/Mar/2026:02:30:01] "GET /query.php?q=atmospheric HTTP/1.1" 200 4096 28.412s\n10.10.20.50 - - [18/Mar/2026:02:30:32] "GET /query.php?q=seismic HTTP/1.1" 200 4096 31.004s\n10.10.20.51 - - [18/Mar/2026:02:31:05] "GET /query.php?q=radiation HTTP/1.1" 504 0 30.001s\n10.10.20.52 - - [18/Mar/2026:02:31:40] "GET / HTTP/1.1" 200 2048 0.045s\n10.10.20.52 - - [18/Mar/2026:02:31:42] "GET /query.php?q=weather HTTP/1.1" 500 0 30.000s\n10.10.20.50 - - [18/Mar/2026:02:32:15] "GET /query.php?q=atmospheric HTTP/1.1" 200 4096 27.889s'
                                        },
                                        'error.log': {
                                            type: 'file',
                                            content: '2026/03/18 02:31:05 [error] 1845#1845: *142 upstream timed out (110: Connection timed out) while reading response header from upstream, client: 10.10.20.51, server: oracle-web-01, request: "GET /query.php?q=radiation HTTP/1.1", upstream: "fastcgi://unix:/run/php/php8.1-fpm.sock"\n2026/03/18 02:31:40 [error] 1845#1845: *145 upstream timed out (110: Connection timed out) while reading response header from upstream, client: 10.10.20.52, server: oracle-web-01, request: "GET /query.php?q=weather HTTP/1.1", upstream: "fastcgi://unix:/run/php/php8.1-fpm.sock"\n2026/03/18 02:32:55 [error] 1845#1845: *148 upstream timed out (110: Connection timed out) while reading response header from upstream, client: 10.10.20.53, server: oracle-web-01, request: "GET /query.php?q=pressure HTTP/1.1", upstream: "fastcgi://unix:/run/php/php8.1-fpm.sock"'
                                        }
                                    }
                                },
                                'mysql': {
                                    type: 'dir',
                                    children: {
                                        'error.log': {
                                            type: 'file',
                                            content: '2026-03-18T02:00:01.123456Z 0 [Note] /usr/sbin/mysqld: ready for connections.\nVersion: \'8.0.35\'  socket: \'/var/run/mysqld/mysqld.sock\'  port: 3306\n2026-03-18T02:30:05.789012Z 15 [Warning] Aborted connection 15 to db: \'oracle_db\' user: \'oracle_app\' host: \'localhost\' (Got timeout reading communication packets)\n2026-03-18T02:31:10.345678Z 22 [Warning] Aborted connection 22 to db: \'oracle_db\' user: \'oracle_app\' host: \'localhost\' (Got timeout reading communication packets)'
                                        },
                                        'slow-query.log': {
                                            type: 'file',
                                            content: '# Time: 2026-03-18T02:30:01.412345Z\n# User@Host: oracle_app[oracle_app] @ localhost [127.0.0.1]\n# Query_time: 28.312445  Lock_time: 0.000134  Rows_sent: 847  Rows_examined: 4218903\nSELECT * FROM sensor_queries WHERE query_timestamp > \'2026-03-01\' ORDER BY query_timestamp DESC;\n\n# Time: 2026-03-18T02:30:32.004123Z\n# User@Host: oracle_app[oracle_app] @ localhost [127.0.0.1]\n# Query_time: 30.891234  Lock_time: 0.000189  Rows_sent: 312  Rows_examined: 4218903\nSELECT * FROM sensor_queries WHERE query_timestamp > \'2026-03-10\' AND sensor_type = \'seismic\' ORDER BY query_timestamp DESC;\n\n# Time: 2026-03-18T02:31:05.001000Z\n# User@Host: oracle_app[oracle_app] @ localhost [127.0.0.1]\n# Query_time: 30.000123  Lock_time: 0.000201  Rows_sent: 0  Rows_examined: 4218903\nSELECT * FROM sensor_queries WHERE query_timestamp > \'2026-03-15\' AND sensor_type = \'radiation\' ORDER BY query_timestamp DESC;\n'
                                        }
                                    }
                                },
                                'php-fpm': {
                                    type: 'dir',
                                    children: {
                                        'www-error.log': {
                                            type: 'file',
                                            content: '[18-Mar-2026 02:30:01] WARNING: [pool www] child 2210 exited on signal 15 (SIGTERM) after 30.045s\n[18-Mar-2026 02:30:01] WARNING: [pool www] server reached pm.max_children setting (5), consider raising it\n[18-Mar-2026 02:31:05] WARNING: [pool www] child 2215 exited on signal 15 (SIGTERM) after 30.001s\n[18-Mar-2026 02:31:40] WARNING: [pool www] child 2218 exited on signal 15 (SIGTERM) after 30.000s\n[18-Mar-2026 02:31:40] NOTICE: [pool www] child 2225 started\n[18-Mar-2026 02:32:55] WARNING: [pool www] server reached pm.max_children setting (5), consider raising it'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 18 02:30:01 oracle-web-01 CRON[2341]: (root) CMD (logrotate)\nMar 18 02:30:15 oracle-web-01 kernel: [CPU0] soft lockup detected\nMar 18 02:30:33 oracle-web-01 kernel: [CPU1] soft lockup detected\nMar 18 02:31:05 oracle-web-01 php-fpm[2215]: child exited with code 0 after 30.001s\nMar 18 02:32:55 oracle-web-01 php-fpm[2218]: child exited with code 0 after 30.000s'
                                }
                            }
                        },
                        'www': {
                            type: 'dir',
                            children: {
                                'oracle': {
                                    type: 'dir',
                                    children: {
                                        'index.php': {
                                            type: 'file',
                                            content: '<?php\n// Truth-Teller Oracle - Main Page\nrequire_once \'config.php\';\n\nif (isset($_GET[\'q\'])) {\n    $query = $_GET[\'q\'];\n    $stmt = $pdo->prepare("SELECT * FROM sensor_queries WHERE query_timestamp > :since AND sensor_type = :type ORDER BY query_timestamp DESC");\n    // NOTE: Missing index on query_timestamp causes full table scan\n    $stmt->execute([\'since\' => \'2026-03-01\', \'type\' => $query]);\n    $results = $stmt->fetchAll();\n}\n?>\n<html><body><h1>Truth-Teller Oracle</h1></body></html>'
                                        },
                                        'config.php': {
                                            type: 'file',
                                            content: '<?php\n$dbhost = \'localhost\';\n$dbname = \'oracle_db\';\n$dbuser = \'oracle_app\';\n$dbpass = \'0r4cl3_s3cur3_p4ss!\';\n\ntry {\n    $pdo = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);\n    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);\n} catch (PDOException $e) {\n    error_log("Database connection failed: " . $e->getMessage());\n    http_response_code(500);\n    die("Internal Server Error");\n}\n?>'
                                        },
                                        'performance_report.php': {
                                            type: 'file',
                                            content: '<?php\n// Performance Report - generates after optimization\n// This page will display the verification token once\n// the database is optimized and queries run under 1s\nrequire_once \'config.php\';\n\n$start = microtime(true);\n$stmt = $pdo->query("SELECT COUNT(*) FROM sensor_queries WHERE query_timestamp > \'2026-03-01\'");\n$elapsed = microtime(true) - $start;\n\nif ($elapsed < 1.0) {\n    echo "PERFORMANCE VERIFIED\\n";\n    echo "Query time: " . round($elapsed * 1000) . "ms\\n";\n    echo "Token: {{FLAG:user}}\\n";\n} else {\n    echo "PERFORMANCE STILL DEGRADED\\n";\n    echo "Query time: " . round($elapsed * 1000) . "ms (target: < 1000ms)\\n";\n}\n?>'
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
                'usr': {
                    type: 'dir',
                    children: {
                        'bin': {
                            type: 'dir',
                            children: {}
                        }
                    }
                }
            }
        }
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
            text: 'Run top or htop to see MySQL consuming 80%+ CPU. The bottleneck is in the database, not the web server itself.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Check the MySQL slow query log: sudo cat /var/log/mysql/slow-query.log. Notice queries examining 4.2 million rows but returning only hundreds.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Connect to MySQL and run SHOW INDEX FROM sensor_queries; — there is no index on query_timestamp. The user flag is: {{FLAG:user}}',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Create the index: CREATE INDEX idx_query_timestamp ON sensor_queries(query_timestamp); Then curl http://10.10.20.5/performance_report.php for the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Truth-Teller Oracle, a vital public utility for processing complex sensor queries, has been experiencing severe performance degradation. Users report 10-30 second load times, intermittent 500 errors, and queries failing altogether. CPU usage is through the roof, and the database appears unresponsive. Your mission: diagnose the root cause and restore the Oracle\'s swift judgment.',
        scenario: 'The Oracle\'s database grew from a few thousand records to over 4 million sensor entries over the past year. The original developer never anticipated this scale and didn\'t add proper indexes. As the table grew, every query became a full table scan — examining all 4.2 million rows just to return a handful of results. The Nginx timeout is 30 seconds, so queries exceeding that threshold return 504 Gateway Timeouts.',
        outro: 'The Lagging Oracle is restored. With the proper index in place, queries that once took 30 seconds now complete in milliseconds. The Truth-Teller Oracle resumes its role as the wasteland\'s most reliable information source.',
        ecer: {
            executive: 'No database performance monitoring or capacity planning as data grew 1000x',
            culture: 'No code review process caught the missing index before production deployment',
            employee: 'Developer assumed small dataset patterns would scale — no EXPLAIN analysis',
            regulatory: 'No SLA monitoring triggered alerts when response times exceeded thresholds'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB SIMULATION (Oracle Web App)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.20.5/',

        pages: {
            '/': {
                title: 'Truth-Teller Oracle',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #444;">
                        <h1 style="color:#8b5cf6; font-size:1.6rem; margin-bottom:4px;">Truth-Teller Oracle</h1>
                        <div style="color:#888; font-size:0.8rem;">Sensor Data Query System v3.2.1</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto;">
                        <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:20px; margin-bottom:20px;">
                            <div style="color:#ef4444; font-size:1.1rem; font-weight:bold; margin-bottom:8px;">PERFORMANCE DEGRADED</div>
                            <div style="color:#888; font-size:0.85rem;">Average query response time: 28.4 seconds</div>
                            <div style="color:#888; font-size:0.85rem;">504 Gateway Timeouts in the last hour: 12</div>
                            <div style="color:#888; font-size:0.85rem;">500 Internal Server Errors: 8</div>
                        </div>

                        <div style="max-width:600px; margin:0 auto 20px;">
                            <label style="display:block; color:#808080; font-size:0.8rem; margin-bottom:6px;">Query Sensor Data:</label>
                            <div style="display:flex; gap:8px;">
                                <input type="text" data-field="search" placeholder="e.g. atmospheric, seismic, radiation..."
                                       style="flex:1; padding:8px 14px; border:1px solid #555; border-radius:4px; font-family:inherit; font-size:0.85rem; background:#1a1a2e; color:#ccc;">
                                <button data-action="search"
                                        style="padding:8px 20px; background:#8b5cf6; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Query</button>
                            </div>
                        </div>

                        <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px;">
                            <div style="color:#aaa; font-size:0.75rem; letter-spacing:0.1em; margin-bottom:8px;">SYSTEM STATUS</div>
                            <div style="font-size:0.8rem; color:#888; line-height:1.8;">
                                Database: oracle_db (4,218,903 records)<br>
                                Nginx: Running (upstream timeouts detected)<br>
                                PHP-FPM: Running (pm.max_children reached)<br>
                                MySQL: Running (high CPU — 87%)
                            </div>
                        </div>
                    </div>
                `,
                formHandler: function(data) {
                    const q = data.search || data.q || '';
                    if (!q) return '<div style="color:#888; padding:10px;">Enter a sensor type to query.</div>';
                    return `<div style="color:#f59e0b; padding:20px; text-align:center;">
                        <div style="font-size:1.2rem; margin-bottom:8px;">Loading query results...</div>
                        <div style="color:#888; font-size:0.8rem;">Query: SELECT * FROM sensor_queries WHERE sensor_type = '${q}'</div>
                        <div style="color:#ef4444; margin-top:12px; font-size:0.9rem;">504 Gateway Timeout</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:4px;">upstream timed out (110: Connection timed out)</div>
                    </div>`;
                }
            },
            '/performance_report.php': {
                title: 'Performance Report',
                html: `
                    <div style="text-align:center; padding:40px;">
                        <h1 style="color:#ef4444; font-size:1.4rem;">PERFORMANCE STILL DEGRADED</h1>
                        <div style="color:#888; font-size:0.9rem; margin-top:12px;">Query time: 28412ms (target: < 1000ms)</div>
                        <div style="color:#666; font-size:0.8rem; margin-top:8px;">Fix the database performance issue to unlock the verification token.</div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target === '10.10.20.5' || target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.00021s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 8.9p1 Ubuntu
80/tcp   open  http     nginx 1.22.1
3306/tcp open  mysql    MySQL 8.0.35

Nmap done: 1 IP address (1 host up) scanned in 5.12 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'top': function(args, term, engine) {
            if (engine && engine._b3IndexCreated) {
                return `top - 02:45:22 up 3 days,  4:45,  1 user,  load average: 0.15, 0.22, 0.18
Tasks: 142 total,   1 running, 141 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.2 us,  2.1 sy,  0.0 ni, 91.8 id,  0.8 wa,  0.0 hi,  0.1 si
MiB Mem :  16384.0 total,   8192.0 free,   4096.0 used,   4096.0 buff
MiB Swap:   4096.0 total,   4096.0 free,      0.0 used.  11264.0 avail

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   1845 www-data  20   0  256480  12288   8192 S   2.0   0.1   0:12.34 nginx
   2210 www-data  20   0  524288  65536  12288 S   1.2   0.4   0:08.45 php-fpm8.1
   1678 mysql     20   0 2097152 512000  32768 S   3.1   3.1   2:15.67 mysqld
   3401 oracle_+  20   0   15820   7424   5120 R   0.3   0.0   0:00.01 top`;
            }
            return `top - 02:35:22 up 3 days,  4:35,  1 user,  load average: 4.82, 4.65, 4.31
Tasks: 142 total,   3 running, 139 sleeping,   0 stopped,   0 zombie
%Cpu(s): 87.3 us,  5.2 sy,  0.0 ni,  6.1 id,  1.2 wa,  0.0 hi,  0.2 si
MiB Mem :  16384.0 total,   2048.0 free,  10240.0 used,   4096.0 buff
MiB Swap:   4096.0 total,   3584.0 free,    512.0 used.   5120.0 avail

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   1678 mysql     20   0 2097152 819200  32768 R  82.4   4.9  45:12.89 mysqld
   2210 www-data  20   0  524288  65536  12288 S   3.2   0.4   1:45.67 php-fpm8.1
   2215 www-data  20   0  524288  65536  12288 S   2.8   0.4   1:32.12 php-fpm8.1
   1845 www-data  20   0  256480  12288   8192 S   0.3   0.1   0:12.34 nginx
   2218 www-data  20   0  524288  65536  12288 S   2.1   0.4   1:28.90 php-fpm8.1
   3401 oracle_+  20   0   15820   7424   5120 R   0.3   0.0   0:00.01 top`;
        },

        'htop': function(args, term, engine) {
            return B3Config.commands.top(args, term, engine);
        },

        'systemctl': function(args, term, engine) {
            if (args.length === 0) return 'Usage: systemctl [command] [unit]';
            const subcmd = args[0];
            const unit = args[1] || '';

            if (subcmd === 'status' && unit.includes('nginx')) {
                return `\u25CF nginx.service - A high performance web server and reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
     Active: active (running) since Mon 2026-03-16 22:00:01 UTC; 2 days ago
   Main PID: 1845 (nginx)
      Tasks: 5 (limit: 18432)
     Memory: 12.3M`;
            }
            if (subcmd === 'status' && (unit.includes('php') || unit.includes('fpm'))) {
                return `\u25CF php8.1-fpm.service - The PHP 8.1 FastCGI Process Manager
     Loaded: loaded (/lib/systemd/system/php8.1-fpm.service; enabled)
     Active: active (running) since Mon 2026-03-16 22:00:02 UTC; 2 days ago
   Main PID: 2200 (php-fpm8.1)
      Tasks: 6 (limit: 18432)
     Memory: 312.5M
     CGroup: /system.slice/php8.1-fpm.service
             \u251C\u25002200 php-fpm: master process (/etc/php/8.1/fpm/php-fpm.conf)
             \u251C\u25002210 php-fpm: pool www
             \u251C\u25002215 php-fpm: pool www
             \u251C\u25002218 php-fpm: pool www
             \u251C\u25002220 php-fpm: pool www
             \u2514\u25002225 php-fpm: pool www`;
            }
            if (subcmd === 'status' && unit.includes('mysql')) {
                return `\u25CF mysql.service - MySQL Community Server
     Loaded: loaded (/lib/systemd/system/mysql.service; enabled)
     Active: active (running) since Mon 2026-03-16 22:00:03 UTC; 2 days ago
   Main PID: 1678 (mysqld)
      Tasks: 38 (limit: 18432)
     Memory: 820.4M
        CPU: 45min 12.890s`;
            }
            return `Unit ${unit} could not be found.`;
        },

        'mysql': function(args, term, engine) {
            if (args.length === 0) return 'Usage: mysql [options] [database]\n  -u USER    Username\n  -p         Prompt for password\n  -e "SQL"   Execute query';

            const eFlag = args.indexOf('-e');
            if (eFlag !== -1 && args[eFlag + 1]) {
                const query = args[eFlag + 1].replace(/['"]/g, '');
                return B3Config._handleMysql(query, engine);
            }

            return `Welcome to the MySQL monitor.  Commands end with ;
Server version: 8.0.35 MySQL Community Server

mysql> (Interactive mode not supported. Use: mysql -u root oracle_db -e "SQL QUERY")`;
        },

        _handleMysql: null,  // defined below

        'sudo': function(args, term, engine) {
            if (args.length === 0) return 'usage: sudo [-h] [-u user] command';
            const fullCmd = args.join(' ');

            if (args[0] === 'systemctl') return B3Config.commands.systemctl(args.slice(1), term, engine);
            if (args[0] === 'mysql') return B3Config.commands.mysql(args.slice(1), term, engine);
            if (args[0] === 'nginx' && args[1] === '-t') return 'nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful';

            if (fullCmd.includes('tail') || fullCmd.includes('cat')) {
                const file = args[args.length - 1];
                if (file.includes('slow-query.log')) {
                    return `# Time: 2026-03-18T02:30:01.412345Z
# User@Host: oracle_app[oracle_app] @ localhost [127.0.0.1]
# Query_time: 28.312445  Lock_time: 0.000134  Rows_sent: 847  Rows_examined: 4218903
SELECT * FROM sensor_queries WHERE query_timestamp > '2026-03-01' ORDER BY query_timestamp DESC;

# Time: 2026-03-18T02:30:32.004123Z
# User@Host: oracle_app[oracle_app] @ localhost [127.0.0.1]
# Query_time: 30.891234  Lock_time: 0.000189  Rows_sent: 312  Rows_examined: 4218903
SELECT * FROM sensor_queries WHERE query_timestamp > '2026-03-10' AND sensor_type = 'seismic' ORDER BY query_timestamp DESC;`;
                }
                if (file.includes('nginx') && file.includes('error')) {
                    return `2026/03/18 02:31:05 [error] 1845#1845: *142 upstream timed out (110: Connection timed out) while reading response header from upstream, client: 10.10.20.51, request: "GET /query.php?q=radiation HTTP/1.1", upstream: "fastcgi://unix:/run/php/php8.1-fpm.sock"
2026/03/18 02:31:40 [error] 1845#1845: *145 upstream timed out (110: Connection timed out) while reading response header from upstream, client: 10.10.20.52, request: "GET /query.php?q=weather HTTP/1.1"
2026/03/18 02:32:55 [error] 1845#1845: *148 upstream timed out (110: Connection timed out) while reading response header from upstream, client: 10.10.20.53, request: "GET /query.php?q=pressure HTTP/1.1"`;
                }
                if (file.includes('www-error') || file.includes('php-fpm')) {
                    return `[18-Mar-2026 02:30:01] WARNING: [pool www] child 2210 exited on signal 15 (SIGTERM) after 30.045s
[18-Mar-2026 02:30:01] WARNING: [pool www] server reached pm.max_children setting (5), consider raising it
[18-Mar-2026 02:31:05] WARNING: [pool www] child 2215 exited on signal 15 (SIGTERM) after 30.001s
[18-Mar-2026 02:31:40] WARNING: [pool www] child 2218 exited on signal 15 (SIGTERM) after 30.000s`;
                }
                if (file.includes('mysql') && file.includes('error')) {
                    return `2026-03-18T02:00:01.123456Z 0 [Note] /usr/sbin/mysqld: ready for connections.
Version: '8.0.35'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306
2026-03-18T02:30:05.789012Z 15 [Warning] Aborted connection 15 to db: 'oracle_db'
2026-03-18T02:31:10.345678Z 22 [Warning] Aborted connection 22 to db: 'oracle_db'`;
                }
                // Generic cat/tail handling
                return `cat: ${file}: No such file or directory`;
            }

            return `[sudo] executing: ${fullCmd}`;
        },

        'curl': function(args, term, engine) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.10.20.5') && url.includes('performance_report')) {
                if (engine && engine._b3IndexCreated) {
                    return 'PERFORMANCE VERIFIED\nQuery time: 12ms\nToken: {{FLAG:user}}';
                }
                return 'PERFORMANCE STILL DEGRADED\nQuery time: 28412ms (target: < 1000ms)\nFix the database performance issue to unlock the verification token.';
            }
            if (url.includes('10.10.20.5')) {
                return '<html><body><h1>Truth-Teller Oracle</h1><p>Sensor Data Query System v3.2.1</p><p style="color:red">WARNING: Performance degraded</p></body></html>';
            }
            return `curl: (7) Failed to connect to ${url}: Connection refused`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.20.5' || target === 'localhost' || target === '127.0.0.1') {
                return `PING ${target} 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.028 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.025 ms

--- ${target} ping statistics ---
2 packets transmitted, 2 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'traceroute': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: traceroute destination';
            return `traceroute to ${target}, 30 hops max, 60 byte packets
 1  ${target}  0.028 ms  0.025 ms  0.026 ms`;
        },

        'netstat': function(args) {
            return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      685/sshd
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1845/nginx
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      1678/mysqld
unix  2      [ ACC ]     STREAM  LISTENING  /run/php/php8.1-fpm.sock  2200/php-fpm8.1`;
        },

        'ss': function(args) {
            return `Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process
tcp    LISTEN  0       128      0.0.0.0:22           0.0.0.0:*          users:(("sshd",pid=685,fd=3))
tcp    LISTEN  0       511      0.0.0.0:80           0.0.0.0:*          users:(("nginx",pid=1845,fd=6))
tcp    LISTEN  0       151      127.0.0.1:3306       0.0.0.0:*          users:(("mysqld",pid=1678,fd=23))`;
        },

        'df': function(args) {
            return `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1      524288000 157286400 366999552  30% /
tmpfs            8192000     2048   8189952   1% /dev/shm
tmpfs            1638400     1524   1636876   1% /run`;
        },

        'free': function(args) {
            return `               total        used        free      shared  buff/cache   available
Mem:        16384000    10240000     2048000       32768     4096000     5120000
Swap:        4096000      524288     3571712`;
        },

        'ps': function(args) {
            if (args.includes('aux') || args.includes('-ef')) {
                return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.0 169348  8192 ?        Ss   Mar16   0:02 /sbin/init
root         685  0.0  0.0  15420  5120 ?        Ss   Mar16   0:01 sshd: /usr/sbin/sshd -D
mysql       1678 82.4  4.9 2097152 819200 ?      Sl   Mar16  45:12 /usr/sbin/mysqld
www-data    1845  0.3  0.1 256480  12288 ?        S    Mar16   0:12 nginx: worker process
www-data    2200  0.0  0.2 131072  32768 ?        Ss   Mar16   0:05 php-fpm: master process
www-data    2210  3.2  0.4 524288  65536 ?        S    Mar16   1:45 php-fpm: pool www
www-data    2215  2.8  0.4 524288  65536 ?        S    Mar16   1:32 php-fpm: pool www
www-data    2218  2.1  0.4 524288  65536 ?        S    Mar16   1:28 php-fpm: pool www
www-data    2220  1.9  0.4 524288  65536 ?        S    Mar16   1:20 php-fpm: pool www
www-data    2225  1.5  0.4 524288  65536 ?        S    Mar16   0:58 php-fpm: pool www
oracle_+    3401  0.0  0.0  15820  7424 ?        Ss   02:30   0:00 sshd: oracle_admin
oracle_+    3450  0.0  0.0   9344  3584 pts/0    R+   02:35   0:00 ps aux`;
            }
            return 'Usage: ps [options]';
        },

        'ip': function(args) {
            if (args.length === 0 || args[0] === 'a' || args[0] === 'addr') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.10.20.5/24 brd 10.10.20.255 scope global eth0`;
            }
            if (args[0] === 'route' || args[0] === 'r') {
                return `default via 10.10.20.1 dev eth0 proto static
10.10.20.0/24 dev eth0 proto kernel scope link src 10.10.20.5`;
            }
            return 'Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }';
        },

        'grep': function(args) {
            if (args.length < 2) return 'Usage: grep [options] PATTERN [FILE...]';
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const file = args[args.length - 1] || '';
            if (pattern.toLowerCase().includes('slow') && file.includes('mysql')) {
                return 'slow_query_log = 1\nslow_query_log_file = /var/log/mysql/slow-query.log\nlong_query_time = 2';
            }
            if (pattern.toLowerCase().includes('error') && file.includes('nginx')) {
                return '2026/03/18 02:31:05 [error] upstream timed out\n2026/03/18 02:31:40 [error] upstream timed out\n2026/03/18 02:32:55 [error] upstream timed out';
            }
            return `grep: ${file}: No such file or directory`;
        },

        'chmod': function(args) { return args.length < 2 ? 'Usage: chmod [mode] [file]' : ''; },
        'chown': function(args) { return args.length < 2 ? 'Usage: chown [owner:group] [file]' : ''; },

        'whoami': function() { return 'oracle_admin'; },
        'hostname': function() { return 'oracle-web-01'; },
        'id': function() { return 'uid=1000(oracle_admin) gid=1000(oracle_admin) groups=1000(oracle_admin),27(sudo)'; },
        'uname': function(args) {
            if (args.includes('-a')) return 'Linux oracle-web-01 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
            return 'Linux';
        },
        'uptime': function() { return ' 02:35:22 up 3 days,  4:35,  1 user,  load average: 4.82, 4.65, 4.31'; },
        'date': function() { return 'Tue Mar 18 02:35:22 UTC 2026'; },
        'pwd': function(args, term) { return term ? term.cwd : '/home/oracle_admin'; },

        'pip3': function() { return 'pip3: command not found'; },
        'pip': function() { return 'pip: command not found'; },
        'apt': function() { return 'E: Could not open lock file - are you root?'; },

        'tail': function(args, term, engine) {
            const file = args[args.length - 1] || '';
            return B3Config.commands.sudo(['tail'].concat(args), term, engine);
        },

        'head': function(args) {
            return `head: cannot open '${args[args.length - 1] || ''}' for reading: Permission denied`;
        },

        'clear': function() { return '\x1Bclear'; },
        'exit': function() { return 'logout\nConnection to oracle-web-01 closed.'; },
        'less': function() { return 'less: interactive pager not supported. Use cat instead.'; },
        'vim': function() { return 'vim: interactive editor not supported. Use cat to view files.'; },
        'nano': function() { return 'nano: interactive editor not supported. Use cat to view files.'; },
        'man': function(args) { return args[0] ? `No manual entry for ${args[0]}` : 'What manual page do you want?'; }
    }
};

// ═══════════════════════════════════════════════════════
// MySQL Command Handler (separate for clarity)
// ═══════════════════════════════════════════════════════

B3Config.commands._handleMysql = function(query, engine) {
    const q = query.toLowerCase().trim().replace(/;$/, '');

    if (q.includes('show processlist')) {
        return `+----+-------------+-----------+-----------+---------+------+----------+--------------------------------------+
| Id | User        | Host      | db        | Command | Time | State    | Info                                 |
+----+-------------+-----------+-----------+---------+------+----------+--------------------------------------+
| 15 | oracle_app  | localhost | oracle_db | Query   |   28 | Sending  | SELECT * FROM sensor_queries WHERE.. |
| 22 | oracle_app  | localhost | oracle_db | Query   |   18 | Sending  | SELECT * FROM sensor_queries WHERE.. |
| 31 | oracle_app  | localhost | oracle_db | Query   |    5 | Sending  | SELECT * FROM sensor_queries WHERE.. |
| 40 | root        | localhost | oracle_db | Query   |    0 | starting | SHOW PROCESSLIST                     |
+----+-------------+-----------+-----------+---------+------+----------+--------------------------------------+
4 rows in set (0.00 sec)`;
    }

    if (q.includes('show tables')) {
        return `+---------------------+
| Tables_in_oracle_db |
+---------------------+
| sensor_queries      |
| sensor_types        |
| oracle_config       |
+---------------------+
3 rows in set (0.00 sec)`;
    }

    if (q.includes('show index') || q.includes('show indexes') || q.includes('show keys')) {
        if (q.includes('sensor_queries')) {
            if (engine && engine._b3IndexCreated) {
                return `+----------------+------------+----------------------+--------------+-----------------+
| Table          | Non_unique | Key_name             | Seq_in_index | Column_name     |
+----------------+------------+----------------------+--------------+-----------------+
| sensor_queries |          0 | PRIMARY              |            1 | id              |
| sensor_queries |          1 | idx_query_timestamp  |            1 | query_timestamp |
+----------------+------------+----------------------+--------------+-----------------+
2 rows in set (0.00 sec)`;
            }
            return `+----------------+------------+----------+--------------+-------------+
| Table          | Non_unique | Key_name | Seq_in_index | Column_name |
+----------------+------------+----------+--------------+-------------+
| sensor_queries |          0 | PRIMARY  |            1 | id          |
+----------------+------------+----------+--------------+-------------+
1 row in set (0.00 sec)`;
        }
        return 'Empty set (0.00 sec)';
    }

    if (q.includes('describe') || q.includes('desc ') || q.includes('show columns')) {
        if (q.includes('sensor_queries')) {
            return `+-----------------+--------------+------+-----+---------+----------------+
| Field           | Type         | Null | Key | Default | Extra          |
+-----------------+--------------+------+-----+---------+----------------+
| id              | int          | NO   | PRI | NULL    | auto_increment |
| sensor_type     | varchar(64)  | YES  |     | NULL    |                |
| query_data      | text         | YES  |     | NULL    |                |
| query_timestamp | datetime     | YES  |     | NULL    |                |
| source_ip       | varchar(45)  | YES  |     | NULL    |                |
| response_time   | float        | YES  |     | NULL    |                |
+-----------------+--------------+------+-----+---------+----------------+
6 rows in set (0.00 sec)`;
        }
        return 'ERROR 1146 (42S02): Table doesn\'t exist';
    }

    if (q.includes('explain')) {
        if (engine && engine._b3IndexCreated) {
            return `+----+-------------+----------------+------+----------------------+----------------------+---------+-------+------+-------------+
| id | select_type | table          | type | possible_keys        | key                  | key_len | ref   | rows | Extra       |
+----+-------------+----------------+------+----------------------+----------------------+---------+-------+------+-------------+
|  1 | SIMPLE      | sensor_queries | range| idx_query_timestamp  | idx_query_timestamp  | 5       | NULL  |  847 | Using where |
+----+-------------+----------------+------+----------------------+----------------------+---------+-------+------+-------------+
1 row in set (0.00 sec)`;
        }
        return `+----+-------------+----------------+------+---------------+------+---------+------+---------+-----------------------------+
| id | select_type | table          | type | possible_keys | key  | key_len | ref  | rows    | Extra                       |
+----+-------------+----------------+------+---------------+------+---------+------+---------+-----------------------------+
|  1 | SIMPLE      | sensor_queries | ALL  | NULL          | NULL | NULL    | NULL | 4218903 | Using where; Using filesort |
+----+-------------+----------------+------+---------------+------+---------+------+---------+-----------------------------+
1 row in set, 1 warning (0.00 sec)

Note: Query examines ALL 4,218,903 rows (full table scan). No usable index found.`;
    }

    if (q.includes('create index') && q.includes('query_timestamp')) {
        if (engine) engine._b3IndexCreated = true;
        return `Query OK, 0 rows affected (12.45 sec)
Records: 0  Duplicates: 0  Warnings: 0

Index idx_query_timestamp created on sensor_queries(query_timestamp).`;
    }

    if (q.includes('select count') && q.includes('sensor_queries')) {
        return `+----------+
| COUNT(*) |
+----------+
|  4218903 |
+----------+
1 row in set (${engine && engine._b3IndexCreated ? '0.01' : '28.31'} sec)`;
    }

    if (q.includes('show databases')) {
        return `+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| oracle_db          |
| performance_schema |
+--------------------+
4 rows in set (0.00 sec)`;
    }

    if (q.includes('show variables') && q.includes('innodb_buffer_pool')) {
        return `+-------------------------+-----------+
| Variable_name           | Value     |
+-------------------------+-----------+
| innodb_buffer_pool_size | 134217728 |
+-------------------------+-----------+
1 row in set (0.00 sec)

Note: innodb_buffer_pool_size = 128M (134217728 bytes)`;
    }

    if (q.includes('status')) {
        return `mysql  Ver 8.0.35 for Linux on x86_64
Connection id:          40
Current database:       oracle_db
Current user:           root@localhost
Uptime:                 3 days 4 hours 35 min
Threads: 5  Questions: 48291  Slow queries: 847  Opens: 312`;
    }

    return `ERROR 1064 (42000): You have an error in your SQL syntax near '${query.substring(0, 30)}'`;
};
