/* ============================================================
   CTF ARENA — Box B1: The Broken Beacon
   Linux Troubleshooting | Service Failure & Log Analysis
   Config: filesystem, systemd, flags, hints, lore
   ============================================================ */

const B1Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Broken Beacon',
    subtitle: 'Linux Troubleshooting — Service Failure & Log Analysis',
    difficulty: 'Beginner-Intermediate',
    accent: '#f59e0b',
    storageKey: 'hexworth_ctf_b1',
    registryId: 'b1-broken-beacon',
    trackerKey: 'ctf_b1',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Initial Assessment',
            icon: '\uD83D\uDD0D',
            description: 'Connect to COMM-BEACON-01 and assess the current state of the beacon_relay service.',
            requiredFlags: [],
            mitre: ['T1082', 'T1057'],
            unlocks: ['diagnosis'],
            locked: false
        },
        {
            id: 'diagnosis',
            name: 'Log Analysis',
            icon: '\uD83D\uDCCB',
            description: 'Examine systemd journals, service logs, and configuration files to identify the root cause.',
            requiredFlags: [],
            mitre: ['T1005', 'T1083'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Service Repair',
            icon: '\uD83D\uDD27',
            description: 'Fix the identified issues and restore beacon_relay.service to active (running) state.',
            requiredFlags: ['user'],
            mitre: ['T1489', 'T1543.002'],
            unlocks: ['verification'],
            locked: true
        },
        {
            id: 'verification',
            name: 'Verification',
            icon: '\u2705',
            description: 'Verify the beacon is broadcasting correctly and retrieve the verification token.',
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
                title: 'Check the service status',
                tip: 'Open the Terminal and run: systemctl status beacon_relay.service',
                trigger: { event: 'command', match: { cmd: 'contains:systemctl' } }
            },
            {
                title: 'Examine the journal logs',
                tip: 'Run: sudo journalctl -xeu beacon_relay.service to see detailed error logs.',
                trigger: { event: 'command', match: { cmd: 'contains:journalctl' } }
            },
            {
                title: 'Inspect the service unit file and script',
                tip: 'Check /etc/systemd/system/beacon_relay.service and /opt/beacon_relay/beacon.py for issues.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:cat' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:less' } },
                        { event: 'command', match: { cmd: 'contains:vim' } }
                    ]
                }
            },
            {
                title: 'Identify and fix the root cause',
                tip: 'The journal logs reveal a missing Python module. Install it with pip or apt.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Verify the service and retrieve the broadcast token',
                tip: 'Restart the service and check /var/log/beacon_relay.log for the verification token.',
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
            { flagId: 'user', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Service management', skill: 'Systemd Troubleshooting' },
            { flagId: 'user', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security — Log analysis', skill: 'Journal Log Analysis' },
            { flagId: 'root', objective: '4.4', description: 'Given a scenario, analyze data as part of security monitoring activities — Log files', skill: 'Service Restoration Verification' },
            { flagId: 'root', objective: '1.3', description: 'Given a scenario, explain the importance of change management processes', skill: 'Dependency Management' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'COMM-BEACON-01 BIOS v1.4.7',
            'Initializing hardware...',
            'Memory Test: 4096 MB OK',
            'Detecting drives... /dev/sda1 (128GB SSD)',
            'Network: eth0 link detected',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS',
            'Ubuntu 22.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'enclave_tech'
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
        user: 'enclave_tech',
        hostname: 'comm-beacon-01',
        startDir: '/home/enclave_tech',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to COMM-BEACON-01\nLast login: Tue Mar 18 04:12:33 2026 from 10.0.1.50\n\n*** ALERT: beacon_relay.service has failed ***\n*** Run systemctl status beacon_relay.service for details ***\n\nType \'help\' for available commands.\n'
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
                        'enclave_tech': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: COMM-BEACON-01 (localhost)\nObjective: Restore beacon_relay.service\n\nTroubleshooting steps:\n1. Check service status with systemctl\n2. Review journal logs with journalctl\n3. Inspect the service unit file\n4. Examine the beacon.py script\n5. Fix the root cause and restart\n6. Verify the service is broadcasting\n\nThe survival of outlying settlements depends on you.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'systemctl status beacon_relay.service\nsudo journalctl -xeu beacon_relay.service\ncat /etc/systemd/system/beacon_relay.service\nsudo systemctl restart beacon_relay.service'
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'beacon_relay': {
                            type: 'dir',
                            children: {
                                'beacon.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nBeacon Relay Service - COMM-BEACON-01\nBroadcasts survival signals across the barren wastes.\n"""\nimport os\nimport sys\nimport time\nimport logging\nimport configparser\n\ntry:\n    import requests\nexcept ImportError:\n    print("FATAL: Module \'requests\' not found. Install with: pip3 install requests", file=sys.stderr)\n    sys.exit(1)\n\nCONFIG_PATH = \'/etc/beacon_relay/config.ini\'\nLOG_PATH = \'/var/log/beacon_relay.log\'\nPID_PATH = \'/var/run/beacon_relay/beacon.pid\'\n\ndef load_config():\n    config = configparser.ConfigParser()\n    config.read(CONFIG_PATH)\n    return config\n\ndef main():\n    logging.basicConfig(filename=LOG_PATH, level=logging.INFO,\n                        format=\'%(asctime)s [BEACON] %(message)s\')\n\n    config = load_config()\n    freq = config.get(\'broadcast\', \'frequency\', fallback=\'137.5\')\n    interval = config.getint(\'broadcast\', \'interval\', fallback=30)\n    api_endpoint = config.get(\'broadcast\', \'api_endpoint\', fallback=\'http://localhost:9090/relay\')\n\n    # Write PID file\n    os.makedirs(os.path.dirname(PID_PATH), exist_ok=True)\n    with open(PID_PATH, \'w\') as f:\n        f.write(str(os.getpid()))\n\n    logging.info(f"Beacon relay started. Frequency: {freq} MHz, Interval: {interval}s")\n    logging.info(f"BROADCAST VERIFICATION TOKEN: {{FLAG:user}}}")\n\n    while True:\n        try:\n            payload = {"freq": freq, "status": "ACTIVE", "timestamp": time.time()}\n            requests.post(api_endpoint, json=payload, timeout=5)\n            logging.info(f"Signal broadcast on {freq} MHz - OK")\n        except requests.exceptions.ConnectionError:\n            logging.warning("API endpoint unreachable, broadcasting locally")\n        time.sleep(interval)\n\nif __name__ == \'__main__\':\n    main()\n'
                                },
                                'README.md': {
                                    type: 'file',
                                    content: '# Beacon Relay Service\n\nVersion: 2.3.1\nMaintainer: enclave_ops@last-enclave.net\n\n## Requirements\n- Python 3.8+\n- python3-requests\n- Config: /etc/beacon_relay/config.ini\n\n## Known Issues\n- Service fails if python3-requests is not installed\n- PID directory must exist: /var/run/beacon_relay/\n'
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
                            content: 'comm-beacon-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsyslog:x:104:110::/home/syslog:/usr/sbin/nologin\nenclave_tech:x:1000:1000:Enclave Technician:/home/enclave_tech:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin'
                        },
                        'systemd': {
                            type: 'dir',
                            children: {
                                'system': {
                                    type: 'dir',
                                    children: {
                                        'beacon_relay.service': {
                                            type: 'file',
                                            content: '[Unit]\nDescription=Beacon Relay Service - COMM-BEACON-01\nAfter=network.target\nWants=network-online.target\n\n[Service]\nType=simple\nUser=beacon_svc\nGroup=beacon_svc\nExecStart=/usr/bin/python3 /opt/beacon_relay/beacon.py\nRestart=on-failure\nRestartSec=10\nStandardOutput=journal\nStandardError=journal\nWorkingDirectory=/opt/beacon_relay\n\n[Install]\nWantedBy=multi-user.target\n'
                                        }
                                    }
                                }
                            }
                        },
                        'beacon_relay': {
                            type: 'dir',
                            children: {
                                'config.ini': {
                                    type: 'file',
                                    content: '[broadcast]\nfrequency = 137.5\ninterval = 30\napi_endpoint = http://localhost:9090/relay\n\n[logging]\nlevel = INFO\nlog_file = /var/log/beacon_relay.log\n\n[security]\nauth_token = enclave-tok-4f8a-9b2c-1d3e5f7a8b0c\n'
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
                                    content: 'Mar 18 04:10:01 comm-beacon-01 CRON[2341]: (root) CMD (/usr/sbin/logrotate /etc/logrotate.conf)\nMar 18 04:10:15 comm-beacon-01 systemd[1]: beacon_relay.service: Main process exited, code=exited, status=1/FAILURE\nMar 18 04:10:15 comm-beacon-01 systemd[1]: beacon_relay.service: Failed with result \'exit-code\'.\nMar 18 04:10:25 comm-beacon-01 systemd[1]: beacon_relay.service: Scheduled restart job, restart counter is at 5.\nMar 18 04:10:25 comm-beacon-01 systemd[1]: beacon_relay.service: Start request repeated too quickly. Refusing to start.\nMar 18 04:10:25 comm-beacon-01 systemd[1]: beacon_relay.service: Failed with result \'exit-code\'.\nMar 18 04:10:25 comm-beacon-01 systemd[1]: Failed to start Beacon Relay Service - COMM-BEACON-01.\nMar 18 04:12:33 comm-beacon-01 sshd[2401]: Accepted publickey for enclave_tech from 10.0.1.50 port 48221\nMar 18 04:12:33 comm-beacon-01 systemd-logind[685]: New session 14 of user enclave_tech.'
                                },
                                'beacon_relay.log': {
                                    type: 'file',
                                    content: '2026-03-17 22:15:03 [BEACON] Beacon relay started. Frequency: 137.5 MHz, Interval: 30s\n2026-03-17 22:15:03 [BEACON] Signal broadcast on 137.5 MHz - OK\n2026-03-17 22:15:33 [BEACON] Signal broadcast on 137.5 MHz - OK\n2026-03-17 22:16:03 [BEACON] Signal broadcast on 137.5 MHz - OK\n--- SERVICE INTERRUPTED ---\n--- Last successful broadcast: 2026-03-17 22:16:03 ---\n--- Service has not recovered since interruption ---'
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: 'Mar 18 03:55:12 comm-beacon-01 sudo: enclave_tech : TTY=pts/0 ; PWD=/home/enclave_tech ; USER=root ; COMMAND=/usr/bin/apt remove python3-requests\nMar 18 03:55:14 comm-beacon-01 sudo: pam_unix(sudo:session): session opened for user root(uid=0) by enclave_tech(uid=1000)\nMar 18 03:55:18 comm-beacon-01 sudo: pam_unix(sudo:session): session closed for user root\nMar 18 04:10:15 comm-beacon-01 systemd[1]: beacon_relay.service: Main process exited, code=exited, status=1/FAILURE\nMar 18 04:12:33 comm-beacon-01 sshd[2401]: Accepted publickey for enclave_tech from 10.0.1.50 port 48221'
                                }
                            }
                        },
                        'run': {
                            type: 'dir',
                            children: {
                                'beacon_relay': {
                                    type: 'dir',
                                    children: {}
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'bin': {
                            type: 'dir',
                            children: {
                                'python3': {
                                    type: 'file',
                                    content: '[binary: Python 3.10.12]'
                                }
                            }
                        },
                        'lib': {
                            type: 'dir',
                            children: {
                                'python3': {
                                    type: 'dir',
                                    children: {
                                        'dist-packages': {
                                            type: 'dir',
                                            children: {}
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
                'root': {
                    type: 'dir',
                    children: {
                        '.bash_history': {
                            type: 'file',
                            content: 'apt update\napt install python3-requests\nsystemctl enable beacon_relay.service\nsystemctl start beacon_relay.service'
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
            text: 'Start with systemctl status beacon_relay.service to see the current state. The service is in a "failed" state.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Use sudo journalctl -xeu beacon_relay.service to see the detailed error output. Look for Python import errors.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The auth.log at /var/log/auth.log reveals someone ran "sudo apt remove python3-requests" recently. That is the missing dependency.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Install the missing module: sudo apt install python3-requests (or sudo pip3 install requests). Then restart the service. Check /var/log/beacon_relay.log for the verification token.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'COMM-BEACON-01, the sole communication beacon on the outskirts of the Last Enclave, has gone silent. Its beacon_relay.service has failed and automated restart attempts return cryptic error codes. Outlying settlements depend on this beacon for survival signals and storm warnings. Your mission: diagnose and restore the beacon before the next storm front arrives.',
        scenario: 'A routine maintenance session went wrong when an inexperienced technician accidentally removed a critical Python dependency while cleaning up packages. The beacon_relay.service, a Python-based broadcast daemon, now crashes immediately on startup with an import error. The technician\'s sudo commands are logged in auth.log, but nobody has connected the dots yet.',
        outro: 'The Broken Beacon is restored. COMM-BEACON-01 resumes broadcasting survival signals across the barren wastes. The outlying settlements will receive storm warnings once again. Your diagnostic skills have saved lives today.',
        ecer: {
            executive: 'No change management process for maintenance operations on critical infrastructure',
            culture: 'Single technician allowed unsupervised root access to production beacon systems',
            employee: 'Technician removed python3-requests without checking service dependencies',
            regulatory: 'No dependency lock or package pinning on mission-critical service requirements'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB SIMULATION (Beacon Status Dashboard)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://192.168.10.10:8080/',

        pages: {
            '/': {
                title: 'COMM-BEACON-01 Status Dashboard',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #444;">
                        <h1 style="color:#f59e0b; font-size:1.6rem; margin-bottom:4px;">COMM-BEACON-01 Status Dashboard</h1>
                        <div style="color:#888; font-size:0.8rem;">Last Enclave Communication Infrastructure</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto;">
                        <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:20px; margin-bottom:20px;">
                            <div style="color:#ef4444; font-size:1.1rem; font-weight:bold; margin-bottom:8px;">SERVICE STATUS: FAILED</div>
                            <div style="color:#888; font-size:0.85rem;">beacon_relay.service has not been active since 2026-03-17 22:16:03</div>
                            <div style="color:#888; font-size:0.85rem; margin-top:4px;">Last broadcast: 137.5 MHz - 18 hours ago</div>
                        </div>

                        <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px; margin-bottom:12px;">
                            <div style="color:#aaa; font-size:0.75rem; letter-spacing:0.1em; margin-bottom:8px;">SYSTEM INFORMATION</div>
                            <div style="font-size:0.85rem; color:#ccc; line-height:1.8;">
                                Hostname: comm-beacon-01<br>
                                OS: Ubuntu 22.04.3 LTS<br>
                                Uptime: 2 days, 14 hours<br>
                                CPU: 4% idle<br>
                                Memory: 1.2 GB / 4.0 GB<br>
                                Disk: 42% used on /dev/sda1
                            </div>
                        </div>

                        <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px;">
                            <div style="color:#aaa; font-size:0.75rem; letter-spacing:0.1em; margin-bottom:8px;">RECENT EVENTS</div>
                            <div style="font-size:0.8rem; color:#888; font-family:monospace; line-height:1.6;">
                                04:10:25 beacon_relay.service: Failed with result 'exit-code'<br>
                                04:10:25 Start request repeated too quickly. Refusing to start.<br>
                                04:10:15 Main process exited, code=exited, status=1/FAILURE<br>
                                03:55:12 sudo: apt remove python3-requests
                            </div>
                        </div>
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 192.168.10.10';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target === '192.168.10.10' || target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.00041s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 8.9p1 Ubuntu
8080/tcp open  http     Beacon Status Dashboard
9090/tcp closed http-alt

Nmap done: 1 IP address (1 host up) scanned in 4.21 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'systemctl': function(args, term, engine) {
            if (args.length === 0) return 'Usage: systemctl [command] [unit]\nCommands: status, start, stop, restart, enable, disable, list-units, daemon-reload';

            const subcmd = args[0];
            const unit = args[1] || '';

            if (subcmd === 'status' && (unit === 'beacon_relay.service' || unit === 'beacon_relay')) {
                // Check if service has been "fixed"
                if (engine && engine._b1ServiceFixed) {
                    return `\u25CF beacon_relay.service - Beacon Relay Service - COMM-BEACON-01
     Loaded: loaded (/etc/systemd/system/beacon_relay.service; enabled; vendor preset: enabled)
     Active: active (running) since Tue 2026-03-18 04:25:17 UTC; 2min ago
   Main PID: 3412 (python3)
      Tasks: 1 (limit: 4638)
     Memory: 28.4M
        CPU: 0.312s
     CGroup: /system.slice/beacon_relay.service
             \u2514\u25003412 /usr/bin/python3 /opt/beacon_relay/beacon.py

Mar 18 04:25:17 comm-beacon-01 systemd[1]: Started Beacon Relay Service - COMM-BEACON-01.
Mar 18 04:25:18 comm-beacon-01 python3[3412]: Beacon relay started. Frequency: 137.5 MHz
Mar 18 04:25:48 comm-beacon-01 python3[3412]: Signal broadcast on 137.5 MHz - OK`;
                }

                return `\u25CF beacon_relay.service - Beacon Relay Service - COMM-BEACON-01
     Loaded: loaded (/etc/systemd/system/beacon_relay.service; enabled; vendor preset: enabled)
     Active: failed (Result: exit-code) since Tue 2026-03-18 04:10:25 UTC; 2min ago
    Process: 2987 ExecStart=/usr/bin/python3 /opt/beacon_relay/beacon.py (code=exited, status=1/FAILURE)
   Main PID: 2987 (code=exited, status=1/FAILURE)
        CPU: 0.048s

Mar 18 04:10:15 comm-beacon-01 systemd[1]: Started Beacon Relay Service - COMM-BEACON-01.
Mar 18 04:10:15 comm-beacon-01 python3[2987]: Traceback (most recent call last):
Mar 18 04:10:15 comm-beacon-01 python3[2987]:   File "/opt/beacon_relay/beacon.py", line 12, in <module>
Mar 18 04:10:15 comm-beacon-01 python3[2987]:     import requests
Mar 18 04:10:15 comm-beacon-01 python3[2987]: ModuleNotFoundError: No module named 'requests'
Mar 18 04:10:15 comm-beacon-01 python3[2987]: FATAL: Module 'requests' not found. Install with: pip3 install requests
Mar 18 04:10:15 comm-beacon-01 systemd[1]: beacon_relay.service: Main process exited, code=exited, status=1/FAILURE
Mar 18 04:10:25 comm-beacon-01 systemd[1]: beacon_relay.service: Failed with result 'exit-code'.
Mar 18 04:10:25 comm-beacon-01 systemd[1]: beacon_relay.service: Start request repeated too quickly. Refusing to start.`;
            }

            if (subcmd === 'status' && unit === 'ssh') {
                return `\u25CF ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2026-03-16 14:00:01 UTC; 2 days ago
   Main PID: 685 (sshd)
      Tasks: 1 (limit: 4638)
     Memory: 6.8M
     CGroup: /system.slice/ssh.service
             \u2514\u2500685 sshd: /usr/sbin/sshd -D`;
            }

            if (subcmd === 'list-units' || subcmd === 'list-unit-files') {
                return `UNIT FILE                    STATE     VENDOR PRESET
beacon_relay.service         enabled   enabled
cron.service                 enabled   enabled
networking.service           enabled   enabled
ssh.service                  enabled   enabled
systemd-journald.service     static    -
systemd-logind.service       static    -
systemd-udevd.service        static    -

7 unit files listed.`;
            }

            if ((subcmd === 'restart' || subcmd === 'start') && (unit === 'beacon_relay.service' || unit === 'beacon_relay')) {
                if (engine && engine._b1ServiceFixed) {
                    return '';
                }
                return `Job for beacon_relay.service failed because the control process exited with error code.
See "systemctl status beacon_relay.service" and "journalctl -xeu beacon_relay.service" for details.`;
            }

            if (subcmd === 'daemon-reload') {
                return '';
            }

            if (subcmd === 'enable' && unit) {
                return `Created symlink /etc/systemd/system/multi-user.target.wants/${unit} -> /etc/systemd/system/${unit}.`;
            }

            return `Unknown command or unit: ${args.join(' ')}`;
        },

        'journalctl': function(args, term, engine) {
            if (args.length === 0) return 'Usage: journalctl [options]\n  -xeu UNIT   Show logs for specific unit\n  -b          Show logs since boot\n  -f          Follow log output\n  --no-pager  Do not pipe into pager';

            const hasUnit = args.some(a => a === 'beacon_relay.service' || a === 'beacon_relay');
            const hasBootFlag = args.includes('-b');

            if (hasUnit) {
                if (engine && engine._b1ServiceFixed) {
                    return `-- Journal begins at Mon 2026-03-16 14:00:01 UTC, ends at Tue 2026-03-18 04:25:48 UTC. --
Mar 18 04:25:17 comm-beacon-01 systemd[1]: Started Beacon Relay Service - COMM-BEACON-01.
Mar 18 04:25:18 comm-beacon-01 python3[3412]: Beacon relay started. Frequency: 137.5 MHz, Interval: 30s
Mar 18 04:25:18 comm-beacon-01 python3[3412]: BROADCAST VERIFICATION TOKEN: {{FLAG:user}}
Mar 18 04:25:48 comm-beacon-01 python3[3412]: Signal broadcast on 137.5 MHz - OK`;
                }

                return `-- Journal begins at Mon 2026-03-16 14:00:01 UTC, ends at Tue 2026-03-18 04:12:33 UTC. --
Mar 18 04:10:15 comm-beacon-01 systemd[1]: Started Beacon Relay Service - COMM-BEACON-01.
Mar 18 04:10:15 comm-beacon-01 python3[2987]: Traceback (most recent call last):
Mar 18 04:10:15 comm-beacon-01 python3[2987]:   File "/opt/beacon_relay/beacon.py", line 12, in <module>
Mar 18 04:10:15 comm-beacon-01 python3[2987]:     import requests
Mar 18 04:10:15 comm-beacon-01 python3[2987]: ModuleNotFoundError: No module named 'requests'
Mar 18 04:10:15 comm-beacon-01 python3[2987]: FATAL: Module 'requests' not found. Install with: pip3 install requests
Mar 18 04:10:15 comm-beacon-01 systemd[1]: beacon_relay.service: Main process exited, code=exited, status=1/FAILURE
Mar 18 04:10:15 comm-beacon-01 systemd[1]: beacon_relay.service: Failed with result 'exit-code'.
Mar 18 04:10:25 comm-beacon-01 systemd[1]: beacon_relay.service: Scheduled restart job, restart counter is at 5.
Mar 18 04:10:25 comm-beacon-01 systemd[1]: beacon_relay.service: Start request repeated too quickly. Refusing to start.
Mar 18 04:10:25 comm-beacon-01 systemd[1]: Failed to start Beacon Relay Service - COMM-BEACON-01.`;
            }

            if (hasBootFlag) {
                return `-- Journal begins at Mon 2026-03-16 14:00:01 UTC, ends at Tue 2026-03-18 04:12:33 UTC. --
Mar 16 14:00:01 comm-beacon-01 kernel: Linux version 5.15.0-91-generic (buildd@lcy02-amd64-007)
Mar 16 14:00:02 comm-beacon-01 systemd[1]: Starting Beacon Relay Service...
Mar 16 14:00:03 comm-beacon-01 systemd[1]: Started Beacon Relay Service - COMM-BEACON-01.
Mar 17 22:15:03 comm-beacon-01 python3[1845]: Beacon relay started. Frequency: 137.5 MHz, Interval: 30s
Mar 18 03:55:12 comm-beacon-01 sudo[2890]: enclave_tech : TTY=pts/0 ; PWD=/home/enclave_tech ; USER=root ; COMMAND=/usr/bin/apt remove python3-requests
Mar 18 04:10:15 comm-beacon-01 systemd[1]: beacon_relay.service: Main process exited, code=exited, status=1/FAILURE`;
            }

            return 'No journal entries matching specified criteria.';
        },

        'sudo': function(args, term, engine) {
            if (args.length === 0) return 'usage: sudo [-h] [-u user] command';

            const fullCmd = args.join(' ');

            // Install requests — this "fixes" the service
            if (fullCmd.includes('apt install python3-requests') || fullCmd.includes('pip3 install requests') || fullCmd.includes('pip install requests')) {
                if (engine) engine._b1ServiceFixed = true;
                if (fullCmd.includes('apt')) {
                    return `Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following NEW packages will be installed:
  python3-requests python3-urllib3 python3-certifi python3-charset-normalizer python3-idna
0 upgraded, 5 newly installed, 0 to remove.
Need to get 412 kB of archives.
Get:1 http://archive.ubuntu.com/ubuntu jammy/main amd64 python3-requests all 2.27.1 [67.2 kB]
Setting up python3-requests (2.27.1-1) ...`;
                }
                return `Collecting requests
  Downloading requests-2.31.0-py3-none-any.whl (62 kB)
Installing collected packages: urllib3, certifi, charset-normalizer, idna, requests
Successfully installed requests-2.31.0`;
            }

            if (fullCmd.includes('apt remove python3-requests')) {
                return `The following packages will be REMOVED:
  python3-requests
0 upgraded, 0 newly installed, 1 to remove.
Removing python3-requests (2.27.1-1) ...`;
            }

            if (fullCmd.includes('apt update')) {
                return `Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease
Hit:2 http://archive.ubuntu.com/ubuntu jammy-updates InRelease
Hit:3 http://archive.ubuntu.com/ubuntu jammy-security InRelease
Reading package lists... Done
Building dependency tree... Done
All packages are up to date.`;
            }

            // Delegate systemctl/journalctl with sudo
            if (args[0] === 'systemctl') {
                return B1Config.commands.systemctl(args.slice(1), term, engine);
            }
            if (args[0] === 'journalctl') {
                return B1Config.commands.journalctl(args.slice(1), term, engine);
            }

            if (fullCmd.includes('cat /var/log/beacon_relay.log')) {
                if (engine && engine._b1ServiceFixed) {
                    return `2026-03-17 22:15:03 [BEACON] Beacon relay started. Frequency: 137.5 MHz, Interval: 30s
2026-03-17 22:15:03 [BEACON] Signal broadcast on 137.5 MHz - OK
2026-03-17 22:15:33 [BEACON] Signal broadcast on 137.5 MHz - OK
2026-03-17 22:16:03 [BEACON] Signal broadcast on 137.5 MHz - OK
--- SERVICE INTERRUPTED ---
2026-03-18 04:25:18 [BEACON] Beacon relay started. Frequency: 137.5 MHz, Interval: 30s
2026-03-18 04:25:18 [BEACON] BROADCAST VERIFICATION TOKEN: {{FLAG:user}}
2026-03-18 04:25:48 [BEACON] Signal broadcast on 137.5 MHz - OK`;
                }
                return `2026-03-17 22:15:03 [BEACON] Beacon relay started. Frequency: 137.5 MHz, Interval: 30s
2026-03-17 22:15:03 [BEACON] Signal broadcast on 137.5 MHz - OK
2026-03-17 22:15:33 [BEACON] Signal broadcast on 137.5 MHz - OK
2026-03-17 22:16:03 [BEACON] Signal broadcast on 137.5 MHz - OK
--- SERVICE INTERRUPTED ---
--- Last successful broadcast: 2026-03-17 22:16:03 ---
--- Service has not recovered since interruption ---`;
            }

            if (fullCmd.includes('cat /var/log/auth.log')) {
                return `Mar 18 03:55:12 comm-beacon-01 sudo: enclave_tech : TTY=pts/0 ; PWD=/home/enclave_tech ; USER=root ; COMMAND=/usr/bin/apt remove python3-requests
Mar 18 03:55:14 comm-beacon-01 sudo: pam_unix(sudo:session): session opened for user root(uid=0) by enclave_tech(uid=1000)
Mar 18 03:55:18 comm-beacon-01 sudo: pam_unix(sudo:session): session closed for user root
Mar 18 04:10:15 comm-beacon-01 systemd[1]: beacon_relay.service: Main process exited, code=exited, status=1/FAILURE
Mar 18 04:12:33 comm-beacon-01 sshd[2401]: Accepted publickey for enclave_tech from 10.0.1.50 port 48221`;
            }

            return `[sudo] password for enclave_tech: \nsudo: command not found or access denied`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '192.168.10.10' || target === 'localhost' || target === '127.0.0.1') {
                return `PING ${target} (${target === 'localhost' ? '127.0.0.1' : target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.031 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.028 ms
64 bytes from ${target}: icmp_seq=3 ttl=64 time=0.029 ms

--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 0.028/0.029/0.031/0.001 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'traceroute': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: traceroute destination';
            if (target === '192.168.10.10' || target === 'localhost' || target === '127.0.0.1') {
                return `traceroute to ${target}, 30 hops max, 60 byte packets
 1  ${target}  0.031 ms  0.028 ms  0.029 ms`;
            }
            return `traceroute to ${target}, 30 hops max, 60 byte packets
 1  * * *
 2  * * *
 3  ${target}  Request timed out.`;
        },

        'netstat': function(args) {
            return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      685/sshd
tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN      1102/python3
tcp6       0      0 :::22                   :::*                    LISTEN      685/sshd`;
        },

        'ss': function(args) {
            return `Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process
tcp    LISTEN  0       128      0.0.0.0:22           0.0.0.0:*          users:(("sshd",pid=685,fd=3))
tcp    LISTEN  0       5        0.0.0.0:8080         0.0.0.0:*          users:(("python3",pid=1102,fd=4))
tcp    LISTEN  0       128         [::]:22              [::]:*          users:(("sshd",pid=685,fd=4))`;
        },

        'df': function(args) {
            return `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1      130048000 54820160  68571648  45% /
tmpfs            2048000     1024   2046976   1% /dev/shm
tmpfs             409600     1148    408452   1% /run
/dev/sda2       10240000  2048000   8192000  20% /var/log`;
        },

        'free': function(args) {
            return `               total        used        free      shared  buff/cache   available
Mem:         4096000     1228800     1843200       12288     1024000     2662400
Swap:        2048000           0     2048000`;
        },

        'ps': function(args) {
            if (args.includes('aux') || args.includes('-ef') || args.includes('-aux')) {
                return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.2 169348 11264 ?        Ss   Mar16   0:03 /sbin/init
root         685  0.0  0.1  15420  7168 ?        Ss   Mar16   0:01 sshd: /usr/sbin/sshd -D
root        1102  0.1  0.4  32768 18432 ?        Ss   Mar16   0:12 /usr/bin/python3 /opt/status_dashboard/app.py
root        2341  0.0  0.0   8356  3072 ?        S    04:10   0:00 /usr/sbin/CRON -f
enclave_+   2401  0.0  0.1  15820  7424 ?        Ss   04:12   0:00 sshd: enclave_tech [priv]
enclave_+   2405  0.0  0.1   8256  5120 pts/0    Ss   04:12   0:00 -bash
enclave_+   2450  0.0  0.0   9344  3584 pts/0    R+   04:13   0:00 ps aux`;
            }
            return 'Usage: ps [options]\n  aux    Show all processes\n  -ef    Show all processes in full format';
        },

        'ip': function(args) {
            if (args.length === 0 || args[0] === 'a' || args[0] === 'addr') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:a1:b2:c3 brd ff:ff:ff:ff:ff:ff
    inet 192.168.10.10/24 brd 192.168.10.255 scope global eth0
       valid_lft forever preferred_lft forever`;
            }
            if (args[0] === 'route' || args[0] === 'r') {
                return `default via 192.168.10.1 dev eth0 proto static
192.168.10.0/24 dev eth0 proto kernel scope link src 192.168.10.10`;
            }
            return `Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }\n  ip addr    Show addresses\n  ip route   Show routes`;
        },

        'grep': function(args) {
            if (args.length < 2) return 'Usage: grep [options] PATTERN [FILE...]';
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const file = args[args.length - 1] || '';

            if (pattern.toLowerCase().includes('request') && file.includes('auth.log')) {
                return 'Mar 18 03:55:12 comm-beacon-01 sudo: enclave_tech : TTY=pts/0 ; PWD=/home/enclave_tech ; USER=root ; COMMAND=/usr/bin/apt remove python3-requests';
            }
            if (pattern.toLowerCase().includes('error') && file.includes('syslog')) {
                return `Mar 18 04:10:15 comm-beacon-01 systemd[1]: beacon_relay.service: Main process exited, code=exited, status=1/FAILURE
Mar 18 04:10:15 comm-beacon-01 systemd[1]: beacon_relay.service: Failed with result 'exit-code'.`;
            }
            if (pattern.toLowerCase().includes('beacon') && file.includes('syslog')) {
                return `Mar 18 04:10:15 comm-beacon-01 systemd[1]: beacon_relay.service: Main process exited, code=exited, status=1/FAILURE
Mar 18 04:10:15 comm-beacon-01 systemd[1]: beacon_relay.service: Failed with result 'exit-code'.
Mar 18 04:10:25 comm-beacon-01 systemd[1]: beacon_relay.service: Start request repeated too quickly. Refusing to start.
Mar 18 04:10:25 comm-beacon-01 systemd[1]: Failed to start Beacon Relay Service - COMM-BEACON-01.`;
            }
            return `grep: ${file}: No such file or directory`;
        },

        'chmod': function(args) {
            if (args.length < 2) return 'Usage: chmod [mode] [file]';
            return '';
        },

        'chown': function(args) {
            if (args.length < 2) return 'Usage: chown [owner:group] [file]';
            return '';
        },

        'pip3': function(args, term, engine) {
            if (args.length === 0) return 'Usage: pip3 [command] [package]\nCommands: install, uninstall, list, show';
            if (args[0] === 'install' && args.includes('requests')) {
                if (engine) engine._b1ServiceFixed = true;
                return `Collecting requests
  Downloading requests-2.31.0-py3-none-any.whl (62 kB)
Collecting urllib3>=1.21.1
  Downloading urllib3-2.1.0-py3-none-any.whl (104 kB)
Collecting certifi>=2017.4.17
  Downloading certifi-2024.2.2-py3-none-any.whl (163 kB)
Installing collected packages: urllib3, certifi, charset-normalizer, idna, requests
Successfully installed requests-2.31.0 certifi-2024.2.2 charset-normalizer-3.3.2 idna-3.6 urllib3-2.1.0`;
            }
            if (args[0] === 'list') {
                if (engine && engine._b1ServiceFixed) {
                    return `Package            Version
------------------ -------
certifi            2024.2.2
charset-normalizer 3.3.2
idna               3.6
pip                22.0.2
requests           2.31.0
setuptools         59.6.0
urllib3             2.1.0`;
                }
                return `Package    Version
---------- -------
pip        22.0.2
setuptools 59.6.0`;
            }
            return `pip3: unknown command '${args[0]}'`;
        },

        'pip': function(args, term, engine) {
            return B1Config.commands.pip3(args, term, engine);
        },

        'apt': function(args, term, engine) {
            return B1Config.commands.sudo(['apt'].concat(args), term, engine);
        },

        'python3': function(args) {
            if (args.length === 0) return 'Python 3.10.12 (main, Nov 20 2023, 15:14:05) [GCC 11.4.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>> (Use Ctrl+D to exit)';
            if (args.includes('/opt/beacon_relay/beacon.py')) {
                return `Traceback (most recent call last):
  File "/opt/beacon_relay/beacon.py", line 12, in <module>
    import requests
ModuleNotFoundError: No module named 'requests'`;
            }
            if (args.includes('--version') || args.includes('-V')) {
                return 'Python 3.10.12';
            }
            return `python3: can't open file '${args[0]}': [Errno 2] No such file or directory`;
        },

        'uname': function(args) {
            if (args.includes('-a')) return 'Linux comm-beacon-01 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux';
            if (args.includes('-r')) return '5.15.0-91-generic';
            return 'Linux';
        },

        'whoami': function() {
            return 'enclave_tech';
        },

        'id': function() {
            return 'uid=1000(enclave_tech) gid=1000(enclave_tech) groups=1000(enclave_tech),27(sudo)';
        },

        'hostname': function() {
            return 'comm-beacon-01';
        },

        'uptime': function() {
            return ' 04:13:22 up 2 days, 14:13,  1 user,  load average: 0.08, 0.12, 0.10';
        },

        'date': function() {
            return 'Tue Mar 18 04:13:22 UTC 2026';
        },

        'pwd': function(args, term) {
            return term ? term.cwd : '/home/enclave_tech';
        },

        'which': function(args) {
            const bins = { 'python3': '/usr/bin/python3', 'pip3': '/usr/bin/pip3', 'systemctl': '/usr/bin/systemctl', 'journalctl': '/usr/bin/journalctl' };
            return bins[args[0]] || `which: no ${args[0]} in (/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin)`;
        },

        'dpkg': function(args) {
            if (args.includes('-l') || args.includes('--list')) {
                const filter = args.find(a => !a.startsWith('-')) || '';
                if (filter.includes('python3-requests') || filter.includes('requests')) {
                    return 'dpkg-query: no packages found matching python3-requests';
                }
                if (filter.includes('python3')) {
                    return `ii  python3         3.10.6-1~22.04     amd64   interactive high-level object-oriented language
ii  python3-minimal 3.10.6-1~22.04     amd64   minimal subset of the Python language`;
                }
                return 'Listing...';
            }
            return 'Usage: dpkg [options] command';
        },

        'find': function(args) {
            if (args.length === 0) return 'Usage: find [path] [expression]';
            const path = args[0] || '/';
            if (path.includes('beacon') || args.some(a => a.includes('beacon'))) {
                return `/opt/beacon_relay\n/opt/beacon_relay/beacon.py\n/opt/beacon_relay/README.md\n/etc/beacon_relay\n/etc/beacon_relay/config.ini\n/etc/systemd/system/beacon_relay.service\n/var/log/beacon_relay.log\n/var/run/beacon_relay`;
            }
            return `find: '${path}': Permission denied`;
        },

        'tail': function(args) {
            const file = args[args.length - 1] || '';
            if (file.includes('beacon_relay.log')) {
                return `2026-03-17 22:16:03 [BEACON] Signal broadcast on 137.5 MHz - OK
--- SERVICE INTERRUPTED ---
--- Last successful broadcast: 2026-03-17 22:16:03 ---
--- Service has not recovered since interruption ---`;
            }
            if (file.includes('syslog')) {
                return `Mar 18 04:10:25 comm-beacon-01 systemd[1]: beacon_relay.service: Start request repeated too quickly. Refusing to start.
Mar 18 04:10:25 comm-beacon-01 systemd[1]: Failed to start Beacon Relay Service - COMM-BEACON-01.
Mar 18 04:12:33 comm-beacon-01 sshd[2401]: Accepted publickey for enclave_tech from 10.0.1.50 port 48221
Mar 18 04:12:33 comm-beacon-01 systemd-logind[685]: New session 14 of user enclave_tech.`;
            }
            if (file.includes('auth.log')) {
                return `Mar 18 03:55:12 comm-beacon-01 sudo: enclave_tech : TTY=pts/0 ; PWD=/home/enclave_tech ; USER=root ; COMMAND=/usr/bin/apt remove python3-requests
Mar 18 04:12:33 comm-beacon-01 sshd[2401]: Accepted publickey for enclave_tech from 10.0.1.50 port 48221`;
            }
            return `tail: cannot open '${file}' for reading: No such file or directory`;
        },

        'head': function(args) {
            const file = args[args.length - 1] || '';
            if (file.includes('beacon.py')) {
                return `#!/usr/bin/env python3
"""
Beacon Relay Service - COMM-BEACON-01
Broadcasts survival signals across the barren wastes.
"""
import os
import sys
import time
import logging
import configparser`;
            }
            return `head: cannot open '${file}' for reading: No such file or directory`;
        },

        'file': function(args) {
            const target = args[0] || '';
            if (target.includes('beacon.py')) return '/opt/beacon_relay/beacon.py: Python script, UTF-8 Unicode text executable';
            return `${target}: cannot open \`${target}\' (No such file or directory)`;
        },

        'less': function(args) {
            return 'less: interactive pager not supported in this terminal. Use cat instead.';
        },

        'vim': function(args) {
            return 'vim: interactive editor not supported in this terminal. Use cat to view files.';
        },

        'nano': function(args) {
            return 'nano: interactive editor not supported in this terminal. Use cat to view files.';
        },

        'man': function(args) {
            if (!args[0]) return 'What manual page do you want?';
            return `No manual entry for ${args[0]}\nSee 'man 7 undocumented' for help.`;
        },

        'clear': function() {
            return '\x1Bclear';
        },

        'exit': function() {
            return 'logout\nConnection to comm-beacon-01 closed.';
        }
    }
};
