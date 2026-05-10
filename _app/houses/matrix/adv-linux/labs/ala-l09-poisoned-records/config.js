/* ============================================================
   ALA-L09: Poisoned Records
   Advanced Linux Administration -- CTF Lab
   DNS zone poisoning, forensic analysis, BIND hardening
   ============================================================ */

const ALAL09Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Poisoned Records',
    subtitle: 'Advanced Linux Administration -- DNS Forensics',
    description: 'Cell-NS1 is the Sector 7 Name Authority. Operators are reporting wrong addresses for critical services. Three records in the sector7.matrix.net zone have been tampered with. Find them, restore from backup, and harden BIND before the next grid audit.',
    difficulty: 'Hard',
    estimatedTime: 45,
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_ala_l09',
    registryId: 'ala-l09-poisoned-records',
    trackerKey: 'lab_ala_l09',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-NS1 BIOS v2.3.0',
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
        loginUser: 'operator'
    },

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Grid Command has issued a SECTOR ALERT. Cell operators in Sector 7 are reporting connection failures to grid-api, cell-088, and the update mirror. Packets are being routed to external addresses controlled by an unknown actor. Cell-NS1 -- the Sector 7 Name Authority -- is serving poisoned records. You have 45 minutes to identify the tampered entries, determine when the zone was modified, restore correct records, and lock down BIND before the next synchronization window.',
        scenario: 'At 02:13 UTC, an attacker with root access directly modified /etc/bind/zones/db.sector7.matrix.net on disk and then ran rndc reload to activate the poisoned zone. The audit daemon was running and captured the event. A clean backup of the zone exists at db.sector7.matrix.net.bak -- it was written by the automated backup job at 00:05 and is trusted. Three A records were changed to attacker-controlled IPs in the 203.0.113.0/24 range.',
        outro: 'Zone restored. BIND hardened. Sector 7 Name Authority is back under grid control. The three poisoned A records are no longer serving attacker infrastructure. TSIG authentication is now required for zone transfers, and dynamic updates are locked out. Grid Command acknowledges remediation.'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-ns1',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to CELL-NS1 -- Sector 7 Name Authority\nLast login: Thu Apr 10 08:44:01 2026 from 10.0.0.1\n\n*** SECTOR ALERT: DNS anomaly detected ***\n*** Operators reporting wrong IPs for grid-api, cell-088, update-mirror ***\n*** Check /etc/bind/zones/ immediately ***\n\nType \'help\' for available commands.\n'
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
                                    content: 'MISSION: ALA-L09 -- Poisoned Records\n\n1. Identify all three poisoned DNS records and the timestamp of modification.\n2. Restore the correct zone file from backup.\n3. Harden BIND: allow-update { none; }, zone file permissions 640, TSIG key for zone transfers.\n\nRun /opt/verify/check-restoration.sh after step 2.\nRun /opt/verify/check-hardening.sh after step 3.\n\n-- Grid Command Operations, 02:47 UTC\n'
                                },
                                'incident-report.txt': {
                                    type: 'file',
                                    content: 'INCIDENT REPORT -- Sector 7 DNS Anomaly\nReported: 02:15 UTC\nReporter: cell-088 operator\n\nSummary:\nOperators reporting wrong IP for grid-api starting approximately 02:15.\nConnection attempts to grid-api routing to unknown external host.\nSame symptom reported for cell-088 and update-mirror shortly after.\n\nInitial hypothesis: DNS poisoning via direct zone file modification.\nCheck /etc/bind/zones/db.sector7.matrix.net against backup.\n'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: 'Zone file: /etc/bind/zones/db.sector7.matrix.net\nBackup:    /etc/bind/zones/db.sector7.matrix.net.bak  (trusted, from 00:05 backup job)\nAudit log: /var/log/audit/audit.log\nNamed log: /var/log/named/named.log\n\nVerify scripts:\n  /opt/verify/check-restoration.sh\n  /opt/verify/check-hardening.sh\n\nHardening checklist:\n  [ ] allow-update { none; }; in zone declaration\n  [ ] chown bind:bind /etc/bind/zones && chmod 640 /etc/bind/zones/*\n  [ ] tsig-keygen sector7-xfer key configured\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'systemctl status named\nrndc status\ndig grid-api.sector7.matrix.net @localhost\ndig cell-088.sector7.matrix.net @localhost\n'
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
                            content: 'cell-ns1\n'
                        },
                        'resolv.conf': {
                            type: 'file',
                            content: '# Generated by systemd-resolved\nnameserver 127.0.0.1\noptions edns0 trust-ad\n'
                        },
                        'bind': {
                            type: 'dir',
                            children: {
                                'named.conf': {
                                    type: 'file',
                                    content: '// BIND named.conf -- cell-ns1\ninclude "/etc/bind/named.conf.options";\ninclude "/etc/bind/named.conf.local";\ninclude "/etc/bind/named.conf.default-zones";\n'
                                },
                                'named.conf.options': {
                                    type: 'file',
                                    content: 'options {\n    directory "/var/cache/bind";\n    recursion yes;\n    allow-query { 10.0.0.0/8; localhost; };\n    dnssec-validation auto;\n    listen-on { 127.0.0.1; 10.0.1.1; };\n};\n'
                                },
                                'named.conf.local': {
                                    type: 'file',
                                    content: '// sector7.matrix.net zone declaration\n// NOTE: no update-policy or allow-update restriction -- hardening gap\nzone "sector7.matrix.net" {\n    type master;\n    file "/etc/bind/zones/db.sector7.matrix.net";\n    // allow-update is absent -- dynamic updates are unrestricted\n};\n'
                                },
                                'named.conf.default-zones': {
                                    type: 'file',
                                    content: '// Standard default zones\nzone "." {\n    type hint;\n    file "/usr/share/dns/root.hints";\n};\nzone "localhost" {\n    type master;\n    file "/etc/bind/db.local";\n};\n'
                                },
                                'zones': {
                                    type: 'dir',
                                    children: {
                                        'db.sector7.matrix.net': {
                                            type: 'file',
                                            // POISONED zone file -- three A records point to attacker IPs
                                            content: '; sector7.matrix.net zone file\n; Serial: 2026041002 (updated by attacker at 02:13)\n$ORIGIN sector7.matrix.net.\n$TTL 300\n@   IN SOA  ns1.sector7.matrix.net. admin.sector7.matrix.net. (\n                2026041002  ; serial -- was 2026041001 before attack\n                3600        ; refresh\n                900         ; retry\n                604800      ; expire\n                300 )       ; minimum TTL\n\n@           IN NS   ns1.sector7.matrix.net.\nns1         IN A    10.0.1.1\n\n; Cell infrastructure\ncell-071    IN A    10.0.1.71\ncell-072    IN A    10.0.1.72\ncell-073    IN A    10.0.1.73\ncell-080    IN A    10.0.1.80\n\n; -- POISONED RECORDS BELOW --\ngrid-api    IN A    203.0.113.99\ncell-088    IN A    203.0.113.100\nupdate-mirror IN A  203.0.113.101\n; -- END POISONED RECORDS --\n\n; Services\nmail        IN A    10.0.1.10\nmonitor     IN A    10.0.1.5\ngrid-log    IN A    10.0.1.50\n'
                                        },
                                        'db.sector7.matrix.net.bak': {
                                            type: 'file',
                                            // CLEAN backup written by automated job at 00:05 UTC
                                            content: '; sector7.matrix.net zone file -- AUTOMATED BACKUP 00:05 UTC\n; This file is the trusted pre-attack state.\n$ORIGIN sector7.matrix.net.\n$TTL 300\n@   IN SOA  ns1.sector7.matrix.net. admin.sector7.matrix.net. (\n                2026041001  ; serial\n                3600        ; refresh\n                900         ; retry\n                604800      ; expire\n                300 )       ; minimum TTL\n\n@           IN NS   ns1.sector7.matrix.net.\nns1         IN A    10.0.1.1\n\n; Cell infrastructure\ncell-071    IN A    10.0.1.71\ncell-072    IN A    10.0.1.72\ncell-073    IN A    10.0.1.73\ncell-080    IN A    10.0.1.80\n\n; CORRECT RECORDS\ngrid-api    IN A    10.0.1.71\ncell-088    IN A    10.0.1.88\nupdate-mirror IN A  10.0.1.200\n\n; Services\nmail        IN A    10.0.1.10\nmonitor     IN A    10.0.1.5\ngrid-log    IN A    10.0.1.50\n'
                                        },
                                        'db.sector7.matrix.net.pre-poison': {
                                            type: 'file',
                                            // Identical to .bak -- redundant reference copy
                                            content: '; sector7.matrix.net zone file -- PRE-ATTACK REFERENCE COPY\n; Same as .bak -- kept for chain-of-custody documentation.\n$ORIGIN sector7.matrix.net.\n$TTL 300\n@   IN SOA  ns1.sector7.matrix.net. admin.sector7.matrix.net. (\n                2026041001  ; serial\n                3600        ; refresh\n                900         ; retry\n                604800      ; expire\n                300 )       ; minimum TTL\n\n@           IN NS   ns1.sector7.matrix.net.\nns1         IN A    10.0.1.1\n\n; Cell infrastructure\ncell-071    IN A    10.0.1.71\ncell-072    IN A    10.0.1.72\ncell-073    IN A    10.0.1.73\ncell-080    IN A    10.0.1.80\n\n; CORRECT RECORDS\ngrid-api    IN A    10.0.1.71\ncell-088    IN A    10.0.1.88\nupdate-mirror IN A  10.0.1.200\n\n; Services\nmail        IN A    10.0.1.10\nmonitor     IN A    10.0.1.5\ngrid-log    IN A    10.0.1.50\n'
                                        }
                                    }
                                }
                            }
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbind:x:107:113::/var/cache/bind:/usr/sbin/nologin\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\n'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'operator': {
                                    type: 'file',
                                    content: 'operator ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/sbin/rndc, /usr/sbin/named-checkzone, /bin/cp, /bin/chown, /bin/chmod, /usr/sbin/tsig-keygen, /usr/bin/tee\n'
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
                                'named': {
                                    type: 'dir',
                                    children: {
                                        'named.log': {
                                            type: 'file',
                                            content: '10-Apr-2026 00:05:01.002 general: info: zone sector7.matrix.net/IN: loaded serial 2026041001\n10-Apr-2026 00:05:01.003 general: info: running\n10-Apr-2026 02:13:44.112 general: info: received control channel command \'reload sector7.matrix.net\'\n10-Apr-2026 02:13:44.234 general: info: zone sector7.matrix.net/IN: loaded serial 2026041002\n10-Apr-2026 02:13:44.235 general: info: zone sector7.matrix.net/IN: sending notifies (serial 2026041002)\n10-Apr-2026 08:44:01.901 general: info: client @0x7f3a1c002010 10.0.0.1#44512: query: grid-api.sector7.matrix.net IN A + (10.0.1.1)\n10-Apr-2026 08:44:01.902 general: info: client @0x7f3a1c002010 10.0.0.1#44513: query: cell-088.sector7.matrix.net IN A + (10.0.1.1)\n'
                                        }
                                    }
                                },
                                'audit': {
                                    type: 'dir',
                                    children: {
                                        'audit.log': {
                                            type: 'file',
                                            content: 'type=SYSCALL msg=audit(1744252424.001:4401): arch=c000003e syscall=2 success=yes exit=3 a0=7ffee1a02340 a1=441 a2=1b6 a3=0 items=1 ppid=31001 pid=31002 auid=0 uid=0 gid=0 euid=0 suid=0 fsuid=0 egid=0 sgid=0 fsgid=0 tty=pts0 ses=42 comm="vim" exe="/usr/bin/vim" key="bind_zone_watch"\ntype=PATH msg=audit(1744252424.001:4401): item=0 name="/etc/bind/zones/db.sector7.matrix.net" inode=131073 dev=08:01 mode=0100640 ouid=107 ogid=113 rdev=00:00 nametype=NORMAL\ntype=SYSCALL msg=audit(1744252424.445:4402): arch=c000003e syscall=1 success=yes exit=1847 a0=3 a1=7f3a1c001010 a2=737 a3=0 items=0 ppid=31001 pid=31002 auid=0 uid=0 gid=0 euid=0 suid=0 fsuid=0 egid=0 sgid=0 fsgid=0 tty=pts0 ses=42 comm="vim" exe="/usr/bin/vim" key="bind_zone_watch"\ntype=EXECVE msg=audit(1744252464.112:4403): argc=2 a0="rndc" a1="reload" PPID=31001 comm="rndc" exe="/usr/sbin/rndc"\n\n; Decoded summary:\n; 2026-04-10T02:13:44 -- uid=0 (root) opened /etc/bind/zones/db.sector7.matrix.net for write (vim)\n; 2026-04-10T02:13:44 -- uid=0 wrote 1847 bytes to zone file\n; 2026-04-10T02:13:44 -- uid=0 executed rndc reload to activate poisoned zone\n'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Apr 10 02:13:42 cell-ns1 sshd[31000]: Accepted publickey for root from 203.0.113.99 port 58122 ssh2\nApr 10 02:13:43 cell-ns1 sshd[31000]: pam_unix(sshd:session): session opened for user root by (uid=0)\nApr 10 02:13:44 cell-ns1 sudo[31001]: root : TTY=pts/0 ; PWD=/etc/bind/zones ; USER=root ; COMMAND=/usr/bin/vim db.sector7.matrix.net\nApr 10 02:13:44 cell-ns1 rndc[31002]: reload command sent to named\nApr 10 02:14:01 cell-ns1 sshd[31000]: pam_unix(sshd:session): session closed for user root\nApr 10 08:44:01 cell-ns1 sshd[7412]: Accepted publickey for operator from 10.0.0.1 port 44231 ssh2\n'
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
                                'check-restoration.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify that all three poisoned records have been restored to correct IPs.\n# Awards FLAG 1 when all three resolve correctly.\n# This script is run-aware -- BoxEngine intercepts execution.\necho "Checking DNS record restoration..."\necho "Querying grid-api.sector7.matrix.net..."\necho "Querying cell-088.sector7.matrix.net..."\necho "Querying update-mirror.sector7.matrix.net..."\necho "[CHECKING]"\n'
                                },
                                'check-hardening.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify BIND hardening:\n#   1. allow-update { none; }; present in named.conf.local zone declaration\n#   2. Zone files owned bind:bind with mode 640\n#   3. TSIG key file present and included in named.conf\n# Awards FLAG 2 when all three checks pass.\necho "Checking BIND hardening..."\necho "[CHECKING]"\n'
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

    // Tracks whether operator has restored the zone and applied hardening
    _zoneRestored: false,
    _allowUpdateNone: false,
    _tsigConfigured: false,
    _zonePerms640: false,

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // diff -- compare zone files
        'diff': function(args, term, engine) {
            const a = args[0] || '';
            const b = args[1] || '';
            const zoneFile = '/etc/bind/zones/db.sector7.matrix.net';
            const bakFile  = '/etc/bind/zones/db.sector7.matrix.net.bak';
            const preFile  = '/etc/bind/zones/db.sector7.matrix.net.pre-poison';

            // Normalize: any two-arg diff of zone vs bak/pre-poison shows the 3 changed records
            const isZoneVsBak = (
                (a.includes('db.sector7.matrix.net') && !a.includes('.bak') && !a.includes('.pre') &&
                 (b.includes('.bak') || b.includes('.pre-poison'))) ||
                ((a.includes('.bak') || a.includes('.pre-poison')) &&
                  b.includes('db.sector7.matrix.net') && !b.includes('.bak') && !b.includes('.pre'))
            );

            if (isZoneVsBak) {
                if (engine.config._zoneRestored) {
                    return 'Files are identical. Zone has been restored.';
                }
                return '5c5\n<                 2026041001  ; serial\n---\n>                 2026041002  ; serial -- was 2026041001 before attack\n27c27\n< grid-api    IN A    10.0.1.71\n---\n> grid-api    IN A    203.0.113.99\n28c28\n< cell-088    IN A    10.0.1.88\n---\n> cell-088    IN A    203.0.113.100\n29c29\n< update-mirror IN A  10.0.1.200\n---\n> update-mirror IN A  203.0.113.101\n\n3 differences found. Lines 27-29 contain the poisoned A records.';
            }

            return 'diff: usage: diff file1 file2\nExample: diff /etc/bind/zones/db.sector7.matrix.net /etc/bind/zones/db.sector7.matrix.net.bak';
        },

        // ausearch -- parse audit log entries for a file
        'ausearch': function(args, term, engine) {
            const fIdx = args.indexOf('-f');
            const filename = fIdx >= 0 ? (args[fIdx + 1] || '') : '';

            if (filename.includes('db.sector7.matrix.net') || filename.includes('bind/zones')) {
                return '----\ntime->Thu Apr 10 02:13:44 2026\ntype=SYSCALL msg=audit(1744252424.001:4401): uid=0 comm="vim" exe="/usr/bin/vim" key="bind_zone_watch"\ntype=PATH item=0 name="/etc/bind/zones/db.sector7.matrix.net" nametype=NORMAL\n\nSummary:\n  Timestamp: 2026-04-10 02:13:44 UTC\n  Actor:     uid=0 (root)\n  Action:    file opened for write (O_WRONLY|O_CREAT|O_TRUNC)\n  File:      /etc/bind/zones/db.sector7.matrix.net\n  Key:       bind_zone_watch\n\n1 event matched.';
            }

            return 'ausearch: no records found\nUsage: ausearch -f <filename> [-ts <start-time>]\nExample: ausearch -f /etc/bind/zones/db.sector7.matrix.net';
        },

        // dig -- DNS query simulation
        'dig': function(args, term, engine) {
            const host = args.find(a => !a.startsWith('-') && !a.startsWith('@')) || '';
            const server = (args.find(a => a.startsWith('@')) || '@localhost').replace('@', '');

            // Map hostnames to current IPs (poisoned until restored)
            const poisonedMap = {
                'grid-api.sector7.matrix.net':     '203.0.113.99',
                'cell-088.sector7.matrix.net':     '203.0.113.100',
                'update-mirror.sector7.matrix.net':'203.0.113.101'
            };
            const correctMap = {
                'grid-api.sector7.matrix.net':     '10.0.1.71',
                'cell-088.sector7.matrix.net':     '10.0.1.88',
                'update-mirror.sector7.matrix.net':'10.0.1.200',
                'ns1.sector7.matrix.net':          '10.0.1.1',
                'mail.sector7.matrix.net':         '10.0.1.10',
                'monitor.sector7.matrix.net':      '10.0.1.5',
                'cell-071.sector7.matrix.net':     '10.0.1.71',
                'cell-072.sector7.matrix.net':     '10.0.1.72',
                'cell-073.sector7.matrix.net':     '10.0.1.73',
                'cell-080.sector7.matrix.net':     '10.0.1.80'
            };

            const resolvedMap = engine.config._zoneRestored ? correctMap : Object.assign({}, correctMap, poisonedMap);
            const ip = resolvedMap[host];

            if (!host) return 'Usage: dig [@server] <name> [type]\nExample: dig @localhost grid-api.sector7.matrix.net';

            if (ip) {
                const status = engine.config._zoneRestored ? 'NOERROR (restored)' : 'NOERROR';
                return `; <<>> DiG 9.18.1-1ubuntu1 <<>> @${server} ${host}\n; (1 server found)\n;; QUESTION SECTION:\n;${host}.  IN A\n\n;; ANSWER SECTION:\n${host}. 300 IN A ${ip}\n\n;; Query time: 1 msec\n;; SERVER: ${server === 'localhost' ? '127.0.0.1' : server}#53\n;; WHEN: Thu Apr 10 08:44:01 UTC 2026\n;; MSG SIZE rcvd: 56\n;; STATUS: ${status}`;
            }

            return `; <<>> DiG 9.18.1-1ubuntu1 <<>> @${server} ${host}\n;; ANSWER SECTION: (empty)\n;; STATUS: NXDOMAIN\n;; Query time: 2 msec`;
        },

        // named-checkzone -- syntax validation
        'named-checkzone': function(args, term, engine) {
            const zone = args[0] || '';
            const file = args[1] || '';

            if (!zone || !file) {
                return 'Usage: named-checkzone <zone> <file>\nExample: named-checkzone sector7.matrix.net /etc/bind/zones/db.sector7.matrix.net';
            }

            if (file.includes('db.sector7.matrix.net') && !file.includes('.bak') && !file.includes('.pre')) {
                if (engine.config._zoneRestored) {
                    return `zone ${zone}/IN: loaded serial 2026041003\nOK`;
                }
                return `zone ${zone}/IN: loaded serial 2026041002\nOK (zone is syntactically valid but contains poisoned records)`;
            }

            if (file.includes('.bak') || file.includes('.pre-poison')) {
                return `zone ${zone}/IN: loaded serial 2026041001\nOK`;
            }

            return `zone ${zone}/IN: loading from '${file}'\ndns_master_load: ${file}:1: file not found\nzone ${zone}/IN: not loaded due to errors.\nFATAL_ERROR`;
        },

        // cp -- copy files (used to restore zone from backup)
        'cp': function(args, term, engine) {
            const src = args.find(a => !a.startsWith('-')) || '';
            const dst = args.filter(a => !a.startsWith('-'))[1] || '';

            const isBakToZone = (
                (src.includes('.bak') || src.includes('.pre-poison')) &&
                dst.includes('db.sector7.matrix.net') &&
                !dst.includes('.bak') && !dst.includes('.pre')
            );

            if (isBakToZone) {
                engine.config._zoneRestored = true;
                // Update the live zone file content to the clean version
                engine.filesystem['/'].children.etc.children.bind.children.zones.children['db.sector7.matrix.net'].content =
                    '; sector7.matrix.net zone file -- RESTORED FROM BACKUP\n; Serial: 2026041003 (incremented for reload)\n$ORIGIN sector7.matrix.net.\n$TTL 300\n@   IN SOA  ns1.sector7.matrix.net. admin.sector7.matrix.net. (\n                2026041003  ; serial -- incremented after restore\n                3600        ; refresh\n                900         ; retry\n                604800      ; expire\n                300 )       ; minimum TTL\n\n@           IN NS   ns1.sector7.matrix.net.\nns1         IN A    10.0.1.1\n\n; Cell infrastructure\ncell-071    IN A    10.0.1.71\ncell-072    IN A    10.0.1.72\ncell-073    IN A    10.0.1.73\ncell-080    IN A    10.0.1.80\n\n; RESTORED CORRECT RECORDS\ngrid-api    IN A    10.0.1.71\ncell-088    IN A    10.0.1.88\nupdate-mirror IN A  10.0.1.200\n\n; Services\nmail        IN A    10.0.1.10\nmonitor     IN A    10.0.1.5\ngrid-log    IN A    10.0.1.50\n';
                return '';
            }

            return 'cp: usage: cp [options] source destination\nNote: sudo required for files in /etc/bind/';
        },

        // rndc -- BIND control
        'rndc': function(args, term, engine) {
            const sub = args[0] || '';

            if (sub === 'status') {
                return 'version: BIND 9.18.1-1ubuntu1 (Extended Support Version)\nrunning on cell-ns1: Linux x86_64 5.15.0-97-generic\nboot time: Thu, 10 Apr 2026 00:00:01 GMT\nlast configured: Thu, 10 Apr 2026 02:13:44 GMT\nconfiguration file: /etc/bind/named.conf\nnumber of zones: 4 (0 automatic)\nversion: unset\nCPUs found: 2\nworker threads: 2\nUDP listeners per interface: 2\ntasks running: 1\nrecursion: yes\nstatus: running';
            }

            if (sub === 'reload') {
                if (!engine.config._zoneRestored) {
                    return 'zone reload failed: zone sector7.matrix.net/IN -- check zone file syntax (named-checkzone)\nOr: rndc reload sector7.matrix.net to reload single zone after restore';
                }
                return 'zone reload up-to-date: sector7.matrix.net';
            }

            return 'Usage: rndc [status|reload|flush|stop]\nExample: rndc reload sector7.matrix.net';
        },

        // systemctl -- named service
        'systemctl': function(args, term, engine) {
            const sub = args[0] || '';
            const unit = (args[1] || '').replace(/\.service$/, '');

            if (sub === 'status' && (unit === 'named' || unit === 'bind9')) {
                return '\u25CF named.service - BIND Domain Name Server\n     Loaded: loaded (/lib/systemd/system/named.service; enabled)\n     Active: active (running) since Thu 2026-04-10 00:00:01 UTC; 8h 44min ago\n   Main PID: 998 (named)\n\nApr 10 00:00:01 cell-ns1 named[998]: zone sector7.matrix.net/IN: loaded serial 2026041001\nApr 10 02:13:44 cell-ns1 named[998]: zone sector7.matrix.net/IN: loaded serial 2026041002\n\n*** ALERT: serial 2026041002 loaded at 02:13:44 -- not during normal maintenance window ***';
            }

            if (sub === 'restart' && (unit === 'named' || unit === 'bind9')) {
                return 'named.service restart triggered.';
            }

            if (sub === 'reload' && (unit === 'named' || unit === 'bind9')) {
                if (!engine.config._zoneRestored) {
                    return 'named.service: reload signaled (zone data not yet restored)';
                }
                return 'named.service: reload complete -- zone sector7.matrix.net loaded with serial 2026041003';
            }

            return `Unit ${unit || '[none]'} not found or no action for "${sub}".\nFor named: systemctl status named`;
        },

        // chmod / chown -- file permission hardening
        'chmod': function(args, term, engine) {
            const mode = args.find(a => /^[0-7]{3,4}$/.test(a)) || '';
            const target = args.find(a => a.includes('/etc/bind')) || '';

            if (mode === '640' && target.includes('/etc/bind/zones')) {
                engine.config._zonePerms640 = true;
                return '';
            }

            if (mode === '750' && target.includes('/etc/bind/zones')) {
                engine.config._zonePerms640 = true;
                return '';
            }

            return '';
        },

        'chown': function(args, term, engine) {
            // Accept any chown of bind:bind on bind directories
            const owner = args.find(a => a.includes(':')) || '';
            const target = args.find(a => a.includes('/etc/bind')) || '';
            if (owner.includes('bind') && target) {
                return '';
            }
            return '';
        },

        // tsig-keygen -- generate TSIG key for zone transfers
        'tsig-keygen': function(args, term, engine) {
            const keyname = args[0] || 'sector7-xfer';
            engine.config._tsigConfigured = true;
            return `key "${keyname}" {\n    algorithm hmac-sha256;\n    secret "R2xpZFN5bmMvVFNJR0tleUhleFdvcnRoUHJpbWU=";\n};\n\n// To use this key:\n// 1. sudo tee /etc/bind/tsig-${keyname}.key (paste the above)\n// 2. Add to named.conf: include "/etc/bind/tsig-${keyname}.key";\n// 3. Add to zone: allow-transfer { key ${keyname}; };`;
        },

        // Run verification scripts
        'bash': function(args, term, engine) {
            return engine.commands['/opt/verify/check-restoration.sh']
                ? engine.commands['/opt/verify/check-restoration.sh'](args, term, engine)
                : null;
        },

        '/opt/verify/check-restoration.sh': function(args, term, engine) {
            if (!engine.config._zoneRestored) {
                return 'FAIL: Zone not restored.\n  grid-api.sector7.matrix.net   => 203.0.113.99  (POISONED -- expected 10.0.1.71)\n  cell-088.sector7.matrix.net   => 203.0.113.100 (POISONED -- expected 10.0.1.88)\n  update-mirror.sector7.matrix.net => 203.0.113.101 (POISONED -- expected 10.0.1.200)\n\nRestore from backup:\n  sudo cp /etc/bind/zones/db.sector7.matrix.net.bak /etc/bind/zones/db.sector7.matrix.net\n  sudo named-checkzone sector7.matrix.net /etc/bind/zones/db.sector7.matrix.net\n  sudo rndc reload sector7.matrix.net';
            }
            engine.awardFlag('flag1');
            return 'PASS: All three records verified.\n  grid-api.sector7.matrix.net   => 10.0.1.71  OK\n  cell-088.sector7.matrix.net   => 10.0.1.88  OK\n  update-mirror.sector7.matrix.net => 10.0.1.200 OK\n\nFLAG 1 awarded.';
        },

        '/opt/verify/check-hardening.sh': function(args, term, engine) {
            const checks = [
                { label: 'allow-update { none; }; in zone declaration', pass: engine.config._allowUpdateNone },
                { label: 'Zone files owned bind:bind mode 640',          pass: engine.config._zonePerms640   },
                { label: 'TSIG key configured for zone transfers',        pass: engine.config._tsigConfigured }
            ];
            const failed = checks.filter(c => !c.pass);

            if (failed.length > 0) {
                const lines = checks.map(c => `  [${c.pass ? 'PASS' : 'FAIL'}] ${c.label}`).join('\n');
                return `BIND hardening check:\n${lines}\n\n${failed.length} check(s) remaining.`;
            }

            engine.awardFlag('flag2');
            const lines = checks.map(c => `  [PASS] ${c.label}`).join('\n');
            return `BIND hardening check:\n${lines}\n\nAll hardening checks passed.\nFLAG 2 awarded.`;
        },

        // tee -- write to files (used for tsig key, named.conf, allow-update)
        'tee': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('tsig') && target.includes('.key')) {
                engine.config._tsigConfigured = true;
                return '(written to ' + target + ')';
            }
            // Detect allow-update { none; } being piped to named.conf.local
            if (target.includes('named.conf.local') || target.includes('named.conf')) {
                engine.config._allowUpdateNone = true;
                return '(written to ' + target + ')';
            }
            return '(written to ' + (target || 'stdout') + ')';
        },

        // Intercept writing allow-update via tee or redirect simulation
        'echo': function(args, term, engine) {
            // Detect if user is constructing allow-update { none; }; content
            const joined = args.join(' ');
            if (joined.includes('allow-update') && joined.includes('none')) {
                engine.config._allowUpdateNone = true;
            }
            return joined.replace(/^["']|["']$/g, '');
        },

        // cat -- view files; also intercept writes with >> or > (handled by commands with redirection note)
        'cat': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            // Detect if operator is trying to detect allow-update in named.conf.local
            if (target.includes('named.conf.local')) {
                if (engine.config._allowUpdateNone) {
                    return '// sector7.matrix.net zone declaration\nzone "sector7.matrix.net" {\n    type master;\n    file "/etc/bind/zones/db.sector7.matrix.net";\n    allow-update { none; };\n};\n';
                }
                // Return the filesystem content via default null fallthrough
                return null;
            }
            return null;
        },

        // vi/nano -- editor simulations: detect allow-update edits
        'vi': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('named.conf.local')) {
                engine.config._allowUpdateNone = true;
                return '[VI simulation] named.conf.local saved with allow-update { none; }; in zone declaration.';
            }
            if (target.includes('tsig') || target.includes('named.conf')) {
                engine.config._tsigConfigured = true;
                return '[VI simulation] File saved.';
            }
            return '[VI simulation] Cannot open interactive editor in this terminal.';
        },

        'nano': function(args, term, engine) {
            return engine.commands['vi'](args, term, engine);
        },

        'vim': function(args, term, engine) {
            return engine.commands['vi'](args, term, engine);
        },

        // grep -- search log files
        'grep': function(args, term, engine) {
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const target  = args.filter(a => !a.startsWith('-'))[1] || '';

            if (pattern.includes('02:13') && target.includes('named.log')) {
                return '10-Apr-2026 02:13:44.112 general: info: received control channel command \'reload sector7.matrix.net\'\n10-Apr-2026 02:13:44.234 general: info: zone sector7.matrix.net/IN: loaded serial 2026041002';
            }

            if (pattern.includes('reload') && target.includes('named.log')) {
                return '10-Apr-2026 02:13:44.112 general: info: received control channel command \'reload sector7.matrix.net\'\n10-Apr-2026 02:13:44.234 general: info: zone sector7.matrix.net/IN: loaded serial 2026041002';
            }

            if (pattern.includes('203.0.113') && target.includes('audit.log')) {
                return '; 2026-04-10T02:13:44 -- uid=0 (root) opened /etc/bind/zones/db.sector7.matrix.net for write';
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
            value: 'FLAG{ala-l09-poisoned-records_flag1_zone_restored}',
            label: 'Zone Restored',
            description: 'Identified all three poisoned records and restored the zone from backup.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{ala-l09-poisoned-records_flag2_bind_hardened}',
            label: 'BIND Hardened',
            description: 'Applied allow-update restriction, correct file permissions, and TSIG key.',
            points: 250,
            autoCheck: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        maxScore: 500,
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
            text: 'Compare the current zone file to the .bak file: diff /etc/bind/zones/db.sector7.matrix.net /etc/bind/zones/db.sector7.matrix.net.bak -- the differences are your poisoned records.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'Check the audit log for who modified the zone file: ausearch -f /etc/bind/zones/db.sector7.matrix.net -- look for the timestamp and UID of the writer.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'For hardening: add allow-update { none; }; to the zone declaration in named.conf.local. Then: chown -R bind:bind /etc/bind/zones && chmod 640 /etc/bind/zones/* and tsig-keygen sector7-xfer | sudo tee /etc/bind/tsig-sector7.key',
            cost: 50,
            penalty: -50
        }
    ],

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'LPI-LPIC-2',
        mappings: [
            { flagId: 'flag1', objective: '207.1', description: 'Basic DNS server configuration', skill: 'BIND zone file analysis and restoration from backup' },
            { flagId: 'flag1', objective: '207.2', description: 'Create and maintain DNS zones', skill: 'Zone file diff, audit log analysis, rndc reload' },
            { flagId: 'flag2', objective: '207.3', description: 'Securing a DNS server', skill: 'BIND hardening: allow-update restriction, TSIG, file permissions' }
        ]
    }

};
