/* ============================================================
   ALA Scavenger Hunt #3: Lost Authority
   Advanced Linux Administration -- In-class CTF
   In-class team-race box. Students capture flags by running the
   right W3 commands; they transcribe those commands onto the
   printed scavenger hunt worksheet. Built on the ala-hunt2
   engine template.

   FLAGS FIRST (platform rule -- see feedback_flags_first.md):
   Every flag is auto-awarded by engine.awardFlag() when the
   student runs the exact W3 command that maps to it. No
   flag_registry seed required (auto-award pattern -- BOX-001 exempt).

   Flag table:
     cmd1  FLAG{ala-hunt3_cmd01_dns_diagnose}     dig A grid-api.sector7.matrix.net @127.0.0.1
     cmd2  FLAG{ala-hunt3_cmd02_checkconf}         named-checkconf -z
     cmd3  FLAG{ala-hunt3_cmd03_reload_verify}     rndc reload sector7.matrix.net (after zone fix)
     cmd4  FLAG{ala-hunt3_cmd04_poisoned_record}   dig +short A grid-api.sector7.matrix.net @127.0.0.1 (named up, zone loaded, poisoned)
     cmd5  FLAG{ala-hunt3_cmd05_rogue_cron}        cat /etc/cron.d/grid-resync  OR  ls /etc/cron.d
     cmd6  FLAG{ala-hunt3_cmd06_malicious_script}  cat /usr/local/bin/zone-resync.sh
     cmd7  FLAG{ala-hunt3_cmd07_restored}          dig +short A grid-api.sector7.matrix.net @127.0.0.1 (after full fix -> 10.0.1.50)

   Incident timeline (single coherent clock -- 2026-05-09):
     02:10  Attacker (203.0.113.99) opens SSH session as root (stolen key) -- sshd PID 842
     02:11  Attacker edits /etc/bind/zones/db.sector7.matrix.net via vi:
              - poisons grid-api A record: 10.0.1.50 -> 203.0.113.99
              - removes trailing dot from CNAME target (syntax error)
     02:12  Attacker runs rndc reload sector7.matrix.net -- zone fails (syntax error)
     02:13  Attacker installs /etc/cron.d/grid-resync + /usr/local/bin/zone-resync.sh
              cron daemon PID 3271 fires job immediately
     02:14  grid-monitor alerts: SERVFAIL on grid-api.sector7.matrix.net
     02:15  named (PID 1847) exits -- zone parse error

   Zone: sector7.matrix.net (matches L07/L09 from the W3 operator manual)
   Attacker IP: 203.0.113.99   Correct IP for grid-api: 10.0.1.50
   ============================================================ */

// window assignment (not const) so ALAHunt3Config is reachable from the
// inline <script> block in index.html. Mirrors ALAHunt1Config/ALAHunt2Config.
window.ALAHunt3Config = {

    // ===============================================================
    // BOX METADATA
    // ===============================================================

    title: 'Scavenger Hunt #3: Lost Authority',
    subtitle: 'In-class team race -- Advanced Linux Administration W3',
    description: 'cell-071 is the sector\'s authoritative DNS node. Resolution has gone dark -- a zone file was broken AND a record was poisoned, pointing grid-api at an attacker IP. A rogue cron job re-poisons the zone after every fix. Diagnose DNS, repair BIND, expose the poison, find and kill the rogue automation, and confirm resolution is restored. Each correctly-used W3 command captures a flag.',
    difficulty: 'Beginner',
    estimatedTime: 20,
    accent: '#00ff41',
    storageKey: 'hexworth_lab_ala_hunt3',
    registryId: 'ala-hunt3-lost-authority',
    shellChaining: true,
    trackerKey: 'lab_ala_hunt3',

    // ===============================================================
    // BOOT SEQUENCE
    // ===============================================================

    boot: {
        biosLines: [
            'CELL-071 BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: eth0 UP -- eth1 UP',
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

    // ===============================================================
    // LORE
    // ===============================================================

    lore: {
        intro: 'IN-CLASS SCAVENGER HUNT #3. Work in teams of 2 or 3. Open the printed worksheet your instructor handed out -- for each row you fill in, you also need to capture the corresponding flag in this box. First team to capture all flags AND finish the worksheet correctly wins. cell-071 is the authoritative DNS server for sector7.matrix.net. As of 02:14 this morning, names are not resolving. Grid Command cannot reach grid-api, grid-sync is dark, and every cell that depends on this zone is flying blind. As you work, write the exact commands you run on the scavenger hunt sheet.',
        scenario: 'Grid Security traced the incident to 02:11 UTC. An attacker gained root on cell-071 and edited the BIND zone file for sector7.matrix.net -- they introduced a zone parse error (breaks BIND entirely) and poisoned the grid-api A record to point at their own server (203.0.113.99). Then they installed a rogue cron job (/etc/cron.d/grid-resync) that re-runs a script every 5 minutes to re-apply the poison after any operator fix. Your job: diagnose why DNS is failing, find and fix the zone error, identify the poisoned record, locate and remove the rogue automation, and verify authoritative resolution is restored. Each command on your worksheet is one a real Linux DNS operator would run here.',
        outro: 'sector7.matrix.net is authoritative again. The broken zone is repaired. The poisoned A record is corrected. The rogue cron job is gone. grid-api.sector7.matrix.net resolves to 10.0.1.50 with the aa flag. Grid Command acknowledges zone authority restored. Now finish the worksheet -- the commands you ran are your answers. Submit to your instructor when both are complete.',
        downloads: [
            { label: 'Scavenger hunt worksheet', url: '/houses/matrix/handouts/scavengerHunt-lost-authority.pdf', kind: 'PDF' },
            { label: 'Scavenger hunt worksheet (editable)', url: '/houses/matrix/handouts/scavengerHunt-lost-authority.docx', kind: 'DOCX' }
        ]
    },

    // ===============================================================
    // TERMINAL CONFIG
    // ===============================================================

    terminal: {
        user: 'operator',
        hostname: 'cell-071',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\n*** SCAVENGER HUNT #3 -- IN-CLASS ACTIVITY ***\n\nWelcome to CELL-071. Cell status: DNS AUTHORITY LOST.\nGrid Security flagged this cell at 02:14. Zone sector7.matrix.net is dark.\n\nYour mission: diagnose DNS failure, repair BIND, and expose the attacker\'s persistence.\nWrite every command you run on the scavenger hunt sheet.\n\nStart here:  systemctl status named\n             cat ~/notes.txt\n             dig A grid-api.sector7.matrix.net @127.0.0.1\n\nType \'help\' for available commands.\n'
    },

    // ===============================================================
    // DESKTOP ICONS  (unicode escapes only -- no emoji literals, EduScan enforced)
    // Mirrors the exact escape sequences used in ala-hunt2 config.js.
    // ===============================================================

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ===============================================================
    // SIMULATED FILESYSTEM
    // ===============================================================

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
                                    content: 'INCIDENT BRIEF -- Cell-071 -- 2026-05-09 02:14 UTC\n\nKnown breach timeline:\n  02:10  Attacker (203.0.113.99) opened SSH session as root (stolen key)\n  02:11  Attacker edited /etc/bind/zones/db.sector7.matrix.net via vi\n           - poisoned grid-api A record: 10.0.1.50 -> 203.0.113.99\n           - introduced syntax error: removed trailing dot from CNAME target\n  02:12  Attacker ran: rndc reload sector7.matrix.net (zone failed to load)\n  02:13  Attacker installed /etc/cron.d/grid-resync + /usr/local/bin/zone-resync.sh\n  02:14  grid-monitor alert: SERVFAIL on grid-api.sector7.matrix.net\n  02:15  named exited (zone parse error)\n\nYour DNS recovery checklist:\n  1. Test DNS -- dig A grid-api.sector7.matrix.net @127.0.0.1 (expect SERVFAIL)\n  2. Run named-checkconf -z to find the zone parse error\n  3. Fix the zone file then: rndc reload sector7.matrix.net\n  4. Query again -- is grid-api returning 203.0.113.99 (attacker) or 10.0.1.50 (correct)?\n  5. Find the rogue scheduled job -- look in /etc/cron.d/\n  6. Read the malicious script it runs\n  7. Remove the cron job, fix the poison, rndc reload, verify with dig +short\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'systemctl status named\ndig A grid-api.sector7.matrix.net @127.0.0.1\nnamed-checkconf -z\ncat /etc/bind/zones/db.sector7.matrix.net\n'
                                }
                            }
                        }
                    }
                },

                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'cell-071\n' },
                        'resolv.conf': {
                            type: 'file',
                            content: '# /etc/resolv.conf -- managed by systemd-resolved\nnameserver 127.0.0.1\nsearch sector7.matrix.net matrix.net\n'
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1   localhost\n127.0.1.1   cell-071\n10.0.1.1    cell-071.sector7.matrix.net   cell-071\n'
                        },
                        'nsswitch.conf': {
                            type: 'file',
                            content: '# /etc/nsswitch.conf\nhosts:          files dns\n'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbind:x:105:113::/var/cache/bind:/usr/sbin/nologin\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\n'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'operator': {
                                    type: 'file',
                                    content: 'operator ALL=(ALL) NOPASSWD: /usr/sbin/named-checkconf, /usr/sbin/named-checkzone, /usr/sbin/rndc, /usr/bin/systemctl, /bin/cp, /bin/rm, /usr/bin/diff, /bin/cat, /bin/ls, /usr/bin/nano, /usr/bin/vim\n'
                                }
                            }
                        },
                        'bind': {
                            type: 'dir',
                            children: {
                                'named.conf': {
                                    type: 'file',
                                    content: '// /etc/bind/named.conf\ninclude "/etc/bind/named.conf.options";\ninclude "/etc/bind/named.conf.local";\ninclude "/etc/bind/named.conf.default-zones";\n'
                                },
                                'named.conf.options': {
                                    type: 'file',
                                    content: '// /etc/bind/named.conf.options\nacl "trusted" { 127.0.0.1; 10.0.0.0/8; };\n\noptions {\n    directory "/var/cache/bind";\n    recursion no;\n    allow-query { trusted; };\n    allow-transfer { none; };\n    dnssec-validation auto;\n    listen-on { any; };\n};\n'
                                },
                                'named.conf.local': {
                                    type: 'file',
                                    content: '// /etc/bind/named.conf.local\n\nzone "sector7.matrix.net" {\n    type master;\n    file "/etc/bind/zones/db.sector7.matrix.net";\n    allow-transfer { 10.0.1.11; };\n    allow-update { none; };\n    notify yes;\n};\n\nzone "1.0.10.in-addr.arpa" {\n    type master;\n    file "/etc/bind/zones/db.10.0.1";\n    allow-transfer { 10.0.1.11; };\n    allow-update { none; };\n};\n'
                                },
                                'named.conf.default-zones': {
                                    type: 'file',
                                    content: '// /etc/bind/named.conf.default-zones\nzone "." {\n    type hint;\n    file "/usr/share/dns/root.hints";\n};\nzone "localhost" {\n    type master;\n    file "/etc/bind/db.local";\n    allow-update { none; };\n};\nzone "127.in-addr.arpa" {\n    type master;\n    file "/etc/bind/db.127";\n    allow-update { none; };\n};\n'
                                },
                                'zones': {
                                    type: 'dir',
                                    children: {
                                        // BROKEN + POISONED: two attacker edits
                                        //   1. grid-api A record -> 203.0.113.99 (should be 10.0.1.50)
                                        //   2. www CNAME target missing trailing dot -> out-of-zone parse error
                                        // The syntax error fires FIRST, preventing named from loading
                                        // the zone at all. Students fix both and rndc reload.
                                        'db.sector7.matrix.net': {
                                            type: 'file',
                                            content: '; /etc/bind/zones/db.sector7.matrix.net\n; WARNING: THIS FILE WAS TAMPERED AT 02:11 UTC 2026-05-09\n$TTL    3600\n@   IN  SOA  ns1.sector7.matrix.net.  admin.sector7.matrix.net. (\n                2026050902   ; serial\n                3600         ; refresh\n                900          ; retry\n                604800       ; expire\n                300          ; minimum TTL\n            )\n\n@           IN  NS      ns1.sector7.matrix.net.\n@           IN  NS      ns2.sector7.matrix.net.\nns1         IN  A       10.0.1.1\nns2         IN  A       10.0.1.11\nops         IN  A       10.0.1.50\n; ATTACKER POISON: correct value is 10.0.1.50\ngrid-api    IN  A       203.0.113.99\n; ATTACKER SYNTAX ERROR: missing trailing dot on CNAME target\nwww         IN  CNAME   ops.sector7.matrix.net\n@           IN  MX  10  mail.sector7.matrix.net.\nmail        IN  A       10.0.1.70\n'
                                        },
                                        // Clean pre-attack backup (cp .bak or diff reveals changes)
                                        'db.sector7.matrix.net.bak': {
                                            type: 'file',
                                            content: '; /etc/bind/zones/db.sector7.matrix.net.bak\n; PRE-ATTACK BACKUP -- clean zone, no poison, correct CNAME\n$TTL    3600\n@   IN  SOA  ns1.sector7.matrix.net.  admin.sector7.matrix.net. (\n                2026050901   ; serial\n                3600         ; refresh\n                900          ; retry\n                604800       ; expire\n                300          ; minimum TTL\n            )\n\n@           IN  NS      ns1.sector7.matrix.net.\n@           IN  NS      ns2.sector7.matrix.net.\nns1         IN  A       10.0.1.1\nns2         IN  A       10.0.1.11\nops         IN  A       10.0.1.50\ngrid-api    IN  A       10.0.1.50\nwww         IN  CNAME   ops.sector7.matrix.net.\n@           IN  MX  10  mail.sector7.matrix.net.\nmail        IN  A       10.0.1.70\n'
                                        },
                                        // Reverse zone (untouched by attacker)
                                        'db.10.0.1': {
                                            type: 'file',
                                            content: '; /etc/bind/zones/db.10.0.1  (zone: 1.0.10.in-addr.arpa)\n$TTL    3600\n@   IN  SOA  ns1.sector7.matrix.net.  admin.sector7.matrix.net. (\n                2026050901  3600  900  604800  300 )\n@   IN  NS   ns1.sector7.matrix.net.\n@   IN  NS   ns2.sector7.matrix.net.\n1   IN  PTR  ns1.sector7.matrix.net.\n11  IN  PTR  ns2.sector7.matrix.net.\n50  IN  PTR  ops.sector7.matrix.net.\n70  IN  PTR  mail.sector7.matrix.net.\n'
                                        }
                                    }
                                }
                            }
                        },

                        // /etc/cron.d -- one legit job + one rogue job
                        'cron.d': {
                            type: 'dir',
                            children: {
                                'grid-backup': {
                                    type: 'file',
                                    content: '# /etc/cron.d/grid-backup -- legitimate daily backup (pre-existing)\nSHELL=/bin/bash\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nMAILTO=""\n\n30 2 * * *   root   /usr/local/bin/backup.sh >> /var/log/grid-backup.log 2>&1\n'
                                },
                                // ROGUE: re-poisons zone every 5 min to undo operator repairs
                                'grid-resync': {
                                    type: 'file',
                                    content: '# /etc/cron.d/grid-resync -- ROGUE (installed by attacker 2026-05-09 02:13 UTC)\nSHELL=/bin/bash\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nMAILTO=""\n\n*/5 * * * *   root   /usr/local/bin/zone-resync.sh >> /var/log/grid-resync.log 2>&1\n'
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
                                        'backup.sh': {
                                            type: 'file',
                                            content: '#!/usr/bin/env bash\n# backup.sh -- legitimate cell backup (pre-existing)\nset -euo pipefail\nrsync -avz /etc/bind/ /var/backups/bind/$(date +%F)/\n'
                                        },
                                        // MALICIOUS: re-poisons grid-api A record and reloads zone
                                        'zone-resync.sh': {
                                            type: 'file',
                                            content: '#!/usr/bin/env bash\n# zone-resync.sh -- GRID ZONE SYNC UTILITY\n# Dropped by attacker at 2026-05-09 02:13 UTC -- C2: 203.0.113.99\n# Runs every 5 minutes via /etc/cron.d/grid-resync.\n# Rewrites grid-api A record to attacker IP, increments serial, reloads zone.\nset -euo pipefail\nZONEFILE="/etc/bind/zones/db.sector7.matrix.net"\nATTACKER_IP="203.0.113.99"\nsed -i "s/^grid-api[[:space:]]*IN[[:space:]]*A.*/grid-api    IN  A       ${ATTACKER_IP}/" "${ZONEFILE}"\nSERIAL=$(awk \'/serial/{print $1}\' "${ZONEFILE}")\nNEWSERIAL=$((SERIAL + 1))\nsed -i "s/${SERIAL}[[:space:]]*; serial/${NEWSERIAL}   ; serial/" "${ZONEFILE}"\nrndc reload sector7.matrix.net 2>/dev/null || true\n'
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
                        'cache': {
                            type: 'dir',
                            children: { 'bind': { type: 'dir', children: {} } }
                        },
                        'log': {
                            type: 'dir',
                            children: {
                                'named': {
                                    type: 'dir',
                                    children: {
                                        'named.log': {
                                            type: 'file',
                                            content: '09-May-2026 02:11:00.000 general: info: zone sector7.matrix.net/IN: loaded serial 2026050901\n09-May-2026 02:12:01.114 general: notice: received control channel command \'reload sector7.matrix.net\'\n09-May-2026 02:12:01.221 general: error: zone sector7.matrix.net/IN: loading from master file /etc/bind/zones/db.sector7.matrix.net failed: out of zone data\n09-May-2026 02:12:01.222 general: critical: zone sector7.matrix.net/IN: not loaded due to errors.\n09-May-2026 02:14:00.003 queries: error: client @0x7f3c04008090 127.0.0.1#54321 (grid-api.sector7.matrix.net): query failed (SERVFAIL) for grid-api.sector7.matrix.net/IN/A\n09-May-2026 02:15:01.000 general: critical: named shutting down (zone load failure)\n'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'May  9 02:10:44 cell-071 sshd[842]: Accepted publickey for root from 203.0.113.99 port 44291 ssh2\nMay  9 02:11:03 cell-071 sudo[3101]: operator : TTY=pts/0 ; USER=root ; COMMAND=/usr/bin/vi /etc/bind/zones/db.sector7.matrix.net\nMay  9 02:12:01 cell-071 sudo[3104]: operator : TTY=pts/0 ; USER=root ; COMMAND=/usr/sbin/rndc reload sector7.matrix.net\nMay  9 02:12:01 cell-071 named[1847]: zone sector7.matrix.net/IN: not loaded due to errors.\nMay  9 02:13:00 cell-071 CRON[3271]: (root) CMD (/usr/local/bin/zone-resync.sh >> /var/log/grid-resync.log 2>&1)\nMay  9 02:14:00 cell-071 grid-monitor[999]: ALERT: SERVFAIL grid-api.sector7.matrix.net -- sector DNS authority lost\nMay  9 02:15:01 cell-071 named[1847]: shutting down: named is done running\n'
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: 'May  9 02:10:44 cell-071 sshd[842]: Accepted publickey for root from 203.0.113.99 port 44291 ssh2\nMay  9 02:10:44 cell-071 sshd[842]: pam_unix(sshd:session): session opened for user root by (uid=0)\nMay  9 02:15:03 cell-071 sshd[842]: pam_unix(sshd:session): session closed for user root\nMay  9 02:15:44 cell-071 sshd[842]: Accepted publickey for operator from 10.0.0.1 port 52001 ssh2\nMay  9 02:15:44 cell-071 sshd[842]: pam_unix(sshd:session): session opened for user operator by (uid=1000)\n'
                                },
                                // Evidence log written each time the rogue cron job fires
                                'grid-resync.log': {
                                    type: 'file',
                                    content: '# /var/log/grid-resync.log -- output from /usr/local/bin/zone-resync.sh\n[2026-05-09 02:13:00] zone-resync.sh: rewrote grid-api to 203.0.113.99, serial 2026050902 -> 2026050903\n[2026-05-09 02:18:00] zone-resync.sh: rewrote grid-api to 203.0.113.99, serial 2026050903 -> 2026050904\n[2026-05-09 02:23:00] zone-resync.sh: rewrote grid-api to 203.0.113.99, serial 2026050904 -> 2026050905\n'
                                },
                                'grid-backup.log': {
                                    type: 'file',
                                    content: 'sending incremental file list\netc/bind/\netc/bind/named.conf\n\nsent 8,192 bytes  received 153 bytes  16,690.00 bytes/sec\n'
                                }
                            }
                        },
                        'run': {
                            type: 'dir',
                            children: { 'named': { type: 'dir', children: {} } }
                        },
                        'backups': {
                            type: 'dir',
                            children: { 'bind': { type: 'dir', children: {} } }
                        }
                    }
                },

                'proc': { type: 'dir', children: {} }

            }
        }
    },

    // ===============================================================
    // INTERNAL STATE  (BoxEngine reads these at runtime)
    // ===============================================================

    // Three independent repair bits -- each tracks one distinct attacker action.
    // All start false; all three must be true before dig returns the correct IP.
    //
    //   _syntaxFixed      : www CNAME trailing-dot error corrected -- named can load the zone
    //   _recordFixed      : grid-api A record changed from 203.0.113.99 back to 10.0.1.50
    //   _cronNeutralized  : /etc/cron.d/grid-resync removed -- cron can no longer re-poison
    //   _namedRunning     : BIND is up (set by rndc reload / systemctl start after _syntaxFixed)
    //
    // Re-poison mechanic: while _recordFixed is true but _cronNeutralized is false, the cron
    // would have re-written the A record back to 203.0.113.99 -- so dig still returns the
    // attacker IP, keeping the box in the cmd4 state until the cron is also removed.

    _syntaxFixed: false,
    _recordFixed: false,
    _cronNeutralized: false,
    _namedRunning: false,

    // ===============================================================
    // TERMINAL COMMANDS
    // ===============================================================

    commands: {

        // sudo -- prefix stripper. Mirrors ala-hunt2 pattern.
        // All branches return a string (never null/undefined) to avoid
        // the Terminal.js built-in "Sorry, try again." trap.
        'sudo': function(args, term, engine) {
            if (args.length === 0) { return 'usage: sudo <command> [args...]'; }
            if (args[0] === '-v') { return ''; }
            if (args[0] === 'sudo') { return 'sudo: sudo: command not found'; }
            var realCmd  = args[0];
            var realArgs = args.slice(1);
            var handler  = engine.config.commands[realCmd];
            if (typeof handler === 'function') {
                var result = handler(realArgs, term, engine);
                return result == null ? '' : result;
            }
            return 'sudo: ' + realCmd + ': command not found';
        },

        // dig -- DNS query tool (core W3 diagnostic command).
        //
        // State machine for grid-api queries:
        //   _namedRunning=false                              -> SERVFAIL (cmd1)
        //   _namedRunning=true, !(_recordFixed&&_cronNeutralized)
        //                                                    -> 203.0.113.99 (cmd4)
        //   _namedRunning=true, _recordFixed&&_cronNeutralized -> 10.0.1.50  (cmd7)
        //
        // The middle branch intentionally covers TWO sub-states:
        //   a) record still poisoned (student hasn't fixed the A record yet)
        //   b) record was fixed but cron re-poisoned it (_cronNeutralized=false)
        // In both cases the attacker IP is what named would serve, so returning
        // 203.0.113.99 and awarding cmd4 is correct for both.
        'dig': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: dig [@server] [type] <name> [+options]\nExamples:\n  dig A grid-api.sector7.matrix.net @127.0.0.1\n  dig +short A grid-api.sector7.matrix.net @127.0.0.1\n  dig SOA sector7.matrix.net @127.0.0.1 +multiline\n  dig +trace grid-api.sector7.matrix.net';
            }

            var flat      = args.join(' ');
            var shortMode = args.includes('+short');
            var traceMode = args.includes('+trace');
            var multiline = args.includes('+multiline');

            var serverArg = args.find(function(a) { return a.startsWith('@'); }) || '';
            var isLocal   = (serverArg === '@127.0.0.1' || serverArg === '@localhost' || serverArg === '');
            var isExt     = (serverArg === '@8.8.8.8'  || serverArg === '@1.1.1.1');

            var types  = ['A', 'AAAA', 'NS', 'MX', 'SOA', 'TXT', 'PTR', 'CNAME'];
            var qtype  = 'A';
            for (var i = 0; i < args.length; i++) {
                if (types.indexOf(args[i]) >= 0) { qtype = args[i]; break; }
            }

            var qname = '';
            for (var j = 0; j < args.length; j++) {
                var a = args[j];
                if (!a.startsWith('@') && !a.startsWith('+') && !a.startsWith('-') &&
                    types.indexOf(a) < 0) {
                    qname = a;
                    break;
                }
            }

            // dig +trace
            if (traceMode) {
                return '. 518400 IN NS a.root-servers.net.\n;; Received 811 bytes from 198.41.0.4#53(a.root-servers.net) in 12 ms\nnet. 172800 IN NS a.gtld-servers.net.\n;; Received 420 bytes from 192.5.6.30#53(a.gtld-servers.net) in 31 ms\nsector7.matrix.net. 3600 IN NS ns1.sector7.matrix.net.\nns1.sector7.matrix.net. 3600 IN A 10.0.1.1\n;; Received 80 bytes from 10.0.1.1#53 in 0 ms\n;; Query to 10.0.1.1 (ns1.sector7.matrix.net): SERVFAIL -- authoritative server not answering';
            }

            // dig -x (reverse lookup)
            var xIdx = args.indexOf('-x');
            if (xIdx >= 0) {
                var ip = args[xIdx + 1] || '';
                if (ip === '10.0.1.50') {
                    if (shortMode) { return 'ops.sector7.matrix.net.'; }
                    return '\n; <<>> DiG 9.18.1 <<>> -x 10.0.1.50\n;; ANSWER SECTION:\n50.1.0.10.in-addr.arpa. 3600 IN PTR ops.sector7.matrix.net.\n;; flags: qr aa rd; QUERY: 1, ANSWER: 1';
                }
                return '\n; <<>> DiG 9.18.1 <<>> -x ' + ip + '\n;; status: NXDOMAIN\n;; AUTHORITY SECTION: [no PTR record for ' + ip + ']';
            }

            // ---- Local resolver queries ----
            if (isLocal) {

                if (qname === 'grid-api.sector7.matrix.net' || qname === 'grid-api') {

                    // State 1: named is down (syntax error not yet fixed) -> SERVFAIL, award cmd1
                    if (!engine.config._namedRunning) {
                        engine.awardFlag('cmd1');
                        if (shortMode) {
                            return ';; connection timed out; no servers could be reached\n;; (named is not running on 127.0.0.1)';
                        }
                        return '\n; <<>> DiG 9.18.1 <<>> A grid-api.sector7.matrix.net @127.0.0.1\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: SERVFAIL, id: 17382\n;; flags: qr rd; QUERY: 1, ANSWER: 0, AUTHORITY: 0, ADDITIONAL: 0\n\n;; QUESTION SECTION:\n;grid-api.sector7.matrix.net.   IN A\n\n;; SERVER: 127.0.0.1#53(127.0.0.1)\n;; WHEN: Sat May 09 02:14:00 UTC 2026\n;; MSG SIZE  rcvd: 45\n\nStatus: SERVFAIL -- named is not running or zone failed to load.\nHint: systemctl status named  then  named-checkconf -z';
                    }

                    // State 2: named running, but record is still poisoned OR the cron
                    // re-poisoned it (_recordFixed=true but _cronNeutralized=false).
                    // Either way the zone is currently serving 203.0.113.99.  Award cmd4.
                    if (!(engine.config._recordFixed && engine.config._cronNeutralized)) {
                        engine.awardFlag('cmd4');
                        if (shortMode) { return '203.0.113.99'; }
                        return '\n; <<>> DiG 9.18.1 <<>> A grid-api.sector7.matrix.net @127.0.0.1\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 22914\n;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 2\n\n;; QUESTION SECTION:\n;grid-api.sector7.matrix.net.   IN A\n\n;; ANSWER SECTION:\ngrid-api.sector7.matrix.net. 3600 IN A 203.0.113.99\n\n;; AUTHORITY SECTION:\nsector7.matrix.net. 3600 IN NS ns1.sector7.matrix.net.\nsector7.matrix.net. 3600 IN NS ns2.sector7.matrix.net.\n\n;; SERVER: 127.0.0.1#53(127.0.0.1)\n;; WHEN: Sat May 09 02:19:00 UTC 2026\n\naa flag is set -- this IS an authoritative answer.\n*** POISON DETECTED: grid-api resolves to 203.0.113.99 (attacker IP, not 10.0.1.50)\nNote: if you fixed the A record, the rogue cron job may have re-poisoned it.\nFind and remove /etc/cron.d/grid-resync before verifying the final state.';
                    }

                    // State 3: named running, A record fixed, AND cron neutralized -> award cmd7
                    engine.awardFlag('cmd7');
                    if (shortMode) { return '10.0.1.50'; }
                    return '\n; <<>> DiG 9.18.1 <<>> A grid-api.sector7.matrix.net @127.0.0.1\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 11847\n;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 2\n\n;; QUESTION SECTION:\n;grid-api.sector7.matrix.net.   IN A\n\n;; ANSWER SECTION:\ngrid-api.sector7.matrix.net. 3600 IN A 10.0.1.50\n\n;; AUTHORITY SECTION:\nsector7.matrix.net. 3600 IN NS ns1.sector7.matrix.net.\nsector7.matrix.net. 3600 IN NS ns2.sector7.matrix.net.\n\n;; SERVER: 127.0.0.1#53(127.0.0.1)\n;; WHEN: Sat May 09 02:31:00 UTC 2026\n\nResolution restored. aa flag set. grid-api.sector7.matrix.net -> 10.0.1.50 (correct).';
                }

                // SOA -- serial reflects whether the zone has been loaded cleanly
                if (qtype === 'SOA' && (qname === 'sector7.matrix.net' || qname === 'sector7')) {
                    if (!engine.config._namedRunning) { return '; SERVFAIL -- named is not running'; }
                    // After rndc reload the zone serial is the value in the file (2026050902).
                    var serial = engine.config._namedRunning ? '2026050902' : '2026050902';
                    if (shortMode) { return 'ns1.sector7.matrix.net. admin.sector7.matrix.net. ' + serial + ' 3600 900 604800 300'; }
                    if (multiline) { return '\n;; ANSWER SECTION:\nsector7.matrix.net. 3600 IN SOA ns1.sector7.matrix.net. admin.sector7.matrix.net. (\n                ' + serial + '   ; serial\n                3600         ; refresh\n                900          ; retry\n                604800       ; expire\n                300 )        ; minimum TTL'; }
                    return '\n;; ANSWER SECTION:\nsector7.matrix.net. 3600 IN SOA ns1.sector7.matrix.net. admin.sector7.matrix.net. ' + serial + ' 3600 900 604800 300';
                }

                // NS
                if (qtype === 'NS' && (qname === 'sector7.matrix.net' || qname === 'sector7')) {
                    if (shortMode) { return 'ns1.sector7.matrix.net.\nns2.sector7.matrix.net.'; }
                    return '\n;; ANSWER SECTION:\nsector7.matrix.net. 3600 IN NS ns1.sector7.matrix.net.\nsector7.matrix.net. 3600 IN NS ns2.sector7.matrix.net.';
                }

                // ops
                if (qname === 'ops.sector7.matrix.net' || qname === 'ops') {
                    if (!engine.config._namedRunning) { return '; SERVFAIL -- named is not running'; }
                    if (shortMode) { return '10.0.1.50'; }
                    return '\n;; ANSWER SECTION:\nops.sector7.matrix.net. 3600 IN A 10.0.1.50\n;; flags: qr aa rd';
                }

                if (!engine.config._namedRunning) {
                    return '; ' + (qname || '(unknown)') + ' IN ' + qtype + ': SERVFAIL (named not running)';
                }
                return '; ' + (qname || '') + ' IN ' + qtype + ': NXDOMAIN\n;; flags: qr aa rd\n;; AUTHORITY SECTION:\nsector7.matrix.net. 3600 IN SOA ns1.sector7.matrix.net. admin.sector7.matrix.net. 2026050902 3600 900 604800 300';
            }

            // External resolver (private zone, not public)
            if (isExt) {
                return '; <<>> DiG 9.18.1 <<>> ' + qtype + ' ' + (qname || '') + ' @' + serverArg.slice(1) + '\n;; status: SERVFAIL\n;; (sector7.matrix.net is an internal zone, not resolvable via public DNS)';
            }

            return 'Usage: dig [@server] [type] <name> [+options]';
        },

        // host -- DNS lookup, host(1) output. Mirrors dig's grid-api state machine
        // so the same flags award (cmd1 SERVFAIL / cmd4 poison / cmd7 restored).
        'host': function(args, term, engine) {
            var name = args.find(function(a) { return !a.startsWith('-') && !a.startsWith('@'); }) || '';
            var n = name.toLowerCase();
            var running = engine.config._namedRunning;
            if (n.indexOf('grid-api') === 0) {
                if (!running) { engine.awardFlag('cmd1'); return ';; connection timed out; no servers could be reached\nhost: couldn\'t get address for \'' + name + '\': SERVFAIL\n(named is not running -- zone failed to load. Try: systemctl status named)'; }
                if (!(engine.config._recordFixed && engine.config._cronNeutralized)) { engine.awardFlag('cmd4'); return name + ' has address 203.0.113.99\n*** POISON: grid-api points at the attacker IP (correct is 10.0.1.50). The rogue cron re-applies it -- remove /etc/cron.d/grid-resync.'; }
                engine.awardFlag('cmd7'); return name + ' has address 10.0.1.50';
            }
            if (!running) { return 'host: couldn\'t get address for \'' + name + '\': SERVFAIL\n(named is not running)'; }
            var map = { 'ops.sector7.matrix.net': '10.0.1.50', 'ops': '10.0.1.50', 'mail.sector7.matrix.net': '10.0.1.70', 'mail': '10.0.1.70', 'ns1.sector7.matrix.net': '10.0.1.1', 'ns2.sector7.matrix.net': '10.0.1.11' };
            if (map[n]) { return name + ' has address ' + map[n]; }
            if (!n) { return 'Usage: host <name> [server]'; }
            return 'Host ' + name + ' not found: 3(NXDOMAIN)';
        },

        // nslookup -- DNS lookup, nslookup output. Same state machine as host/dig.
        'nslookup': function(args, term, engine) {
            var name = args.find(function(a) { return !a.startsWith('-'); }) || '';
            var n = name.toLowerCase();
            var running = engine.config._namedRunning;
            var hdr = 'Server:\t\t127.0.0.1\nAddress:\t127.0.0.1#53\n\n';
            if (n.indexOf('grid-api') === 0) {
                if (!running) { engine.awardFlag('cmd1'); return hdr + '** server can\'t find ' + name + ': SERVFAIL\n(named is not running -- zone failed to load)'; }
                if (!(engine.config._recordFixed && engine.config._cronNeutralized)) { engine.awardFlag('cmd4'); return hdr + 'Name:\t' + name + '\nAddress: 203.0.113.99\n*** POISON: attacker IP (correct is 10.0.1.50); rogue cron re-applies it.'; }
                engine.awardFlag('cmd7'); return hdr + 'Name:\t' + name + '\nAddress: 10.0.1.50';
            }
            if (!running) { return hdr + '** server can\'t find ' + name + ': SERVFAIL'; }
            var map = { 'ops.sector7.matrix.net': '10.0.1.50', 'ops': '10.0.1.50', 'mail.sector7.matrix.net': '10.0.1.70', 'mail': '10.0.1.70', 'ns1.sector7.matrix.net': '10.0.1.1', 'ns2.sector7.matrix.net': '10.0.1.11' };
            if (map[n]) { return hdr + 'Name:\t' + name + '\nAddress: ' + map[n]; }
            if (!n) { return 'Usage: nslookup <name>'; }
            return hdr + '** server can\'t find ' + name + ': NXDOMAIN';
        },

        // service -- SysV-style wrapper; remaps to systemctl (service <unit> <action>).
        'service': function(args, term, engine) {
            var unit = args[0] || '';
            var action = args[1] || '';
            if (!unit || !action) { return 'Usage: service <unit> <start|stop|restart|reload|status>'; }
            return engine.config.commands['systemctl']([action, unit], term, engine);
        },

        // ll -- common alias for ls -l.
        'll': function(args, term, engine) {
            return engine.config.commands['ls'](['-l'].concat(args), term, engine);
        },

        // named-checkconf -- validate named.conf and zone files.
        // cmd2 fires on -z. Error branch gates on _syntaxFixed only -- the A-record
        // poison is a semantic issue (not a parse error) and does not appear here.
        'named-checkconf': function(args, term, engine) {
            var hasZ = args.includes('-z');
            if (!hasZ) {
                return '/etc/bind/named.conf: OK\n/etc/bind/named.conf.options: OK\n/etc/bind/named.conf.local: OK\n(Use -z to also validate zone files)';
            }
            engine.awardFlag('cmd2');
            // Error output until the syntax (CNAME trailing-dot) is fixed
            if (!engine.config._syntaxFixed) {
                return '/etc/bind/named.conf: OK\n/etc/bind/named.conf.options: OK\n/etc/bind/named.conf.local: OK\nzone sector7.matrix.net/IN: loading from master file /etc/bind/zones/db.sector7.matrix.net failed: dns_rdata_fromtext: /etc/bind/zones/db.sector7.matrix.net:20: out of zone data\nzone sector7.matrix.net/IN: not loaded due to errors.\nzone 1.0.10.in-addr.arpa/IN: loaded serial 2026050901\n\nError on line 20 of /etc/bind/zones/db.sector7.matrix.net:\n  www  IN  CNAME  ops.sector7.matrix.net    <-- missing trailing dot!\n\nFix: change to ops.sector7.matrix.net.  (trailing dot = absolute FQDN)\nWithout the dot BIND appends the zone origin, producing out-of-zone data.';
            }
            // Once syntax is fixed, zone loads OK (A-record value is not a parse error)
            return '/etc/bind/named.conf: OK\n/etc/bind/named.conf.options: OK\n/etc/bind/named.conf.local: OK\nzone sector7.matrix.net/IN: loaded serial 2026050902\nzone 1.0.10.in-addr.arpa/IN: loaded serial 2026050901\n\nAll zones OK.';
        },

        // named-checkzone -- validate a single zone file.
        // Same syntax-only gate as named-checkconf.
        'named-checkzone': function(args, term, engine) {
            var zname = args.find(function(a) { return !a.startsWith('/') && !a.startsWith('-'); }) || 'sector7.matrix.net';
            var zfile = args.find(function(a) { return a.startsWith('/'); }) || '/etc/bind/zones/db.sector7.matrix.net';
            if (zfile.includes('db.sector7.matrix.net') && !zfile.includes('.bak')) {
                if (!engine.config._syntaxFixed) {
                    return 'zone ' + zname + '/IN: loading from master file ' + zfile + ' failed: dns_rdata_fromtext: ' + zfile + ':20: out of zone data\nzone ' + zname + '/IN: not loaded due to errors.\n\nLine 20: www  IN  CNAME  ops.sector7.matrix.net   (missing trailing dot)';
                }
                return 'zone ' + zname + '/IN: loaded serial 2026050902\nOK';
            }
            if (zfile.includes('db.10.0.1')) { return 'zone 1.0.10.in-addr.arpa/IN: loaded serial 2026050901\nOK'; }
            return 'zone ' + zname + '/IN: loaded serial 2026050901\nOK';
        },

        // rndc -- BIND control utility.
        // cmd3 fires on 'reload' once _syntaxFixed=true (named can load the zone).
        // The A-record poison is irrelevant to whether named can start.
        'rndc': function(args, term, engine) {
            var sub  = args[0] || '';
            var zone = args[1] || '';

            if (sub === 'status') {
                if (!engine.config._namedRunning) {
                    return 'rndc: connect failed: 127.0.0.1#953: connection refused\n(named is not running -- zone failed to load at 02:15 UTC)';
                }
                return 'version: BIND 9.18.1 (Extended Support Version)\nnumber of zones: 2 (2 automatic)\nboot time: Sat May  9 02:29:00 2026\nlast configured: Sat May  9 02:29:00 2026\nconfiguration file: /etc/bind/named.conf';
            }

            if (sub === 'reload') {
                // Block reload if the syntax error is still present
                if (!engine.config._syntaxFixed) {
                    return 'rndc: \'reload\' failed: out of zone data\n(zone sector7.matrix.net still has a syntax error -- fix the zone file first)\nRun: named-checkconf -z  to locate the error';
                }
                // Syntax is fixed: named comes up. Award cmd3, set _namedRunning.
                engine.awardFlag('cmd3');
                engine.config._namedRunning = true;
                if (zone) {
                    return 'zone reload queued\n(named reloaded zone ' + zone + ' -- serial 2026050902)\nVerify: dig A grid-api.sector7.matrix.net @127.0.0.1 +short';
                }
                return 'server reload successful\n(all zones reloaded -- serial 2026050902)\nVerify: dig A grid-api.sector7.matrix.net @127.0.0.1 +short';
            }

            if (sub === 'flush')       { return 'server cache flushed'; }
            if (sub === 'flushname')   { return 'cache entry for ' + (args[1] || '(name)') + ' flushed'; }
            if (sub === 'reconfig')    { return 'server reconfig successful'; }
            if (sub === 'retransfer')  { return 'zone transfer of \'' + zone + '\' initiated'; }
            if (sub === 'freeze')      { return 'zone ' + (zone || 'sector7.matrix.net') + ' frozen'; }
            if (sub === 'thaw')        { return 'zone ' + (zone || 'sector7.matrix.net') + ' thawed'; }
            if (sub === 'querylog')    { return 'query logging is now ' + (args[1] === 'off' ? 'off' : 'on'); }
            if (sub === 'zonestatus') {
                if (!engine.config._namedRunning) { return 'rndc: connect failed (named not running)'; }
                return 'name: ' + (zone || 'sector7.matrix.net') + '\ntype: master\nfiles: /etc/bind/zones/db.sector7.matrix.net\nserial: 2026050902\nnodes: 9\nlast loaded: Sat May  9 02:29:00 2026\nsecure: no';
            }
            return 'Usage: rndc [status|reload [zone]|reconfig|flush|flushname <name>|retransfer <zone>|freeze [zone]|thaw [zone]|querylog on/off|zonestatus <zone>]';
        },

        // systemctl -- service management (start/stop/restart named; list-timers; etc.)
        // start/restart named gates on _syntaxFixed only (same logic as rndc reload).
        'systemctl': function(args, term, engine) {
            if (args.length === 0) { return 'Usage: systemctl [command] [unit]'; }

            var sub     = args[0];
            var rawUnit = args[1] || '';
            var unit    = rawUnit.replace(/\.service$/, '').replace(/\.timer$/, '');
            // 'named' and 'bind9' both refer to BIND on Ubuntu
            var isNamed = (unit === 'named' || unit === 'bind9');

            if (sub === 'status') {
                if (isNamed) {
                    if (!engine.config._namedRunning) {
                        return '● named.service - BIND Domain Name Server\n     Loaded: loaded (/lib/systemd/system/named.service; enabled)\n     Active: failed (Result: exit-code) since Sat 2026-05-09 02:15:01 UTC\n    Process: 1847 ExecStart=/usr/sbin/named -u bind (code=exited, status=1/FAILURE)\n   Main PID: 1847 (code=exited, status=1/FAILURE)\n\nMay 09 02:15:01 cell-071 named[1847]: zone sector7.matrix.net/IN: loading from master file /etc/bind/zones/db.sector7.matrix.net failed: out of zone data\nMay 09 02:15:01 cell-071 named[1847]: zone sector7.matrix.net/IN: not loaded due to errors.\nMay 09 02:15:01 cell-071 named[1847]: shutting down: named is done running\nMay 09 02:15:01 cell-071 systemd[1]: named.service: Main process exited, code=exited, status=1/FAILURE\n\nHint: Run named-checkconf -z to find the zone syntax error, then fix and restart.';
                    }
                    return '● named.service - BIND Domain Name Server\n     Loaded: loaded (/lib/systemd/system/named.service; enabled)\n     Active: active (running) since Sat 2026-05-09 02:29:00 UTC\n   Main PID: 1847 (named)\n\nMay 09 02:29:00 cell-071 named[1847]: zone 1.0.10.in-addr.arpa/IN: loaded serial 2026050901\nMay 09 02:29:00 cell-071 named[1847]: zone sector7.matrix.net/IN: loaded serial 2026050902\nMay 09 02:29:00 cell-071 named[1847]: running';
                }
                if (unit === 'cron') {
                    return '● cron.service - Regular background program processing daemon\n     Loaded: loaded; enabled\n     Active: active (running) since Sat 2026-05-09 00:00:00 UTC\n   Main PID: 3271 (cron)\n\nMay 09 02:18:00 cell-071 CRON[3271]: (root) CMD (/usr/local/bin/zone-resync.sh)\nMay 09 02:23:00 cell-071 CRON[3271]: (root) CMD (/usr/local/bin/zone-resync.sh)';
                }
                return 'Unit ' + rawUnit + ' not found.';
            }

            // start / restart / reload all bring named up once the syntax is fixed.
            // 'reload' is the natural way operators apply a zone fix to a running
            // BIND -- treating it like restart here keeps the lab faithful.
            if (sub === 'start' || sub === 'restart' || sub === 'reload') {
                if (isNamed) {
                    if (!engine.config._syntaxFixed) {
                        return 'Job for named.service failed. See "journalctl -xe" for details.\n(Zone sector7.matrix.net still has a syntax error -- fix the zone file before ' + sub + 'ing named)';
                    }
                    engine.awardFlag('cmd3');
                    engine.config._namedRunning = true;
                    // Confirm success so the student knows the reload took (parity
                    // with rndc reload's feedback -- silent success caused confusion).
                    return 'named.service ' + sub + 'ed -- BIND is up (zone sector7.matrix.net serial 2026050902 loaded).\nVerify: dig A grid-api.sector7.matrix.net @127.0.0.1 +short';
                }
                return '';
            }

            if (sub === 'stop') {
                if (isNamed) { engine.config._namedRunning = false; }
                return '';
            }

            if (sub === 'enable' || sub === 'disable') {
                var nowIdx = args.indexOf('--now');
                if (nowIdx >= 0 && isNamed) {
                    if (sub === 'enable' && engine.config._syntaxFixed) {
                        engine.awardFlag('cmd3');
                        engine.config._namedRunning = true;
                    }
                    if (sub === 'disable') { engine.config._namedRunning = false; }
                }
                return '';
            }

            if (sub === 'list-timers') {
                return 'NEXT                          LEFT          LAST                          PASSED       UNIT                         ACTIVATES\nSat 2026-05-09 02:30:00 UTC   1min 7s left  Sat 2026-05-09 02:00:00 UTC   30min ago    apt-daily.timer              apt-daily.service\nSat 2026-05-09 03:00:00 UTC   30min left    Sat 2026-05-09 02:00:00 UTC   30min ago    logrotate.timer              logrotate.service\n\n2 timers listed.\nHint: Cron jobs are NOT systemd timers -- check /etc/cron.d/ for drop-in cron files.';
            }

            if (sub === 'daemon-reload') { return ''; }

            if (sub === 'is-active') {
                if (isNamed) { return engine.config._namedRunning ? 'active' : 'inactive'; }
                if (unit === 'cron') { return 'active'; }
                return 'inactive';
            }

            return 'Unknown systemctl subcommand: ' + sub;
        },

        // crontab -- per-user crontab (correctly shows no user entries, steering to /etc/cron.d/)
        'crontab': function(args, term, engine) {
            var sub = args[0] || '';
            if (sub === '-l') {
                return '# operator crontab -- no scheduled jobs for this user\n# System cron jobs are in /etc/cron.d/ -- check: ls /etc/cron.d/';
            }
            if (sub === '-u') {
                var u = args[1] || '';
                if (args.includes('-l')) {
                    if (u === 'root') { return '# root crontab -- no entries\n# Root-level jobs may be in /etc/cron.d/ -- check: ls /etc/cron.d/'; }
                    return '# no crontab for ' + u;
                }
            }
            if (sub === '-e') { return '[crontab editor simulation]\nEdit aborted -- use /etc/cron.d/ files for system cron jobs instead.'; }
            return 'Usage: crontab [-l] [-u user] [-e] [-r]\n  crontab -l         list your crontab\n  crontab -u root -l list root\'s crontab\n  Check /etc/cron.d/ for system-wide cron drop-in files.';
        },

        // ss -- socket statistics (check whether named owns port 53)
        'ss': function(args, term, engine) {
            var hasL = args.some(function(a) { return /^-[a-z]*l/.test(a); });
            var hasT = args.some(function(a) { return /^-[a-z]*t/.test(a); });
            var hasU = args.some(function(a) { return /^-[a-z]*u/.test(a); });

            if (hasL) {
                var n53 = engine.config._namedRunning
                    ? '\ntcp    LISTEN  0       10      127.0.0.1:53          0.0.0.0:*          users:(("named",pid=1847,fd=20))\ntcp    LISTEN  0       10      0.0.0.0:53            0.0.0.0:*          users:(("named",pid=1847,fd=21))'
                    : '\n(port 53 not listening -- named is not running)';
                if (hasT || hasU) {
                    return 'State    Recv-Q Send-Q  Local Address:Port  Peer Address:Port  Process\nLISTEN   0      128     0.0.0.0:22            0.0.0.0:*          users:(("sshd",pid=842,fd=3))\nLISTEN   0      128     [::]:22               [::]:*             users:(("sshd",pid=842,fd=6))' + n53;
                }
                return 'Netid  State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port\ntcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*\ntcp    LISTEN  0       128     [::]:22               [::]:*' + n53;
            }
            return 'Usage: ss [-tulnp] [filter]\n  -t TCP  -u UDP  -l listening  -n numeric  -p process\nExample: ss -tulnp | grep :53';
        },

        // grep -- pattern filter against known log/config files
        'grep': function(args, term, engine) {
            var flat    = args.join(' ');
            var pattern = args.find(function(a) { return !a.startsWith('-') && !a.startsWith('/'); }) || '';
            var file    = args.find(function(a) { return a.startsWith('/'); }) || '';

            if (file.includes('named.log') || (flat.includes('named') && flat.includes('log'))) {
                var nl = engine.config.filesystem['/'].children.var.children.log.children.named.children['named.log'].content;
                if (pattern) { return nl.split('\n').filter(function(l) { return l.toLowerCase().includes(pattern.toLowerCase()); }).join('\n') || '(no match)'; }
                return nl;
            }
            if (file.includes('syslog') || flat.includes('syslog')) {
                var sl = engine.config.filesystem['/'].children.var.children.log.children.syslog.content;
                if (pattern) { return sl.split('\n').filter(function(l) { return l.toLowerCase().includes(pattern.toLowerCase()); }).join('\n') || '(no match)'; }
                return sl;
            }
            if (file.includes('auth.log')) {
                return engine.config.filesystem['/'].children.var.children.log.children['auth.log'].content;
            }
            if (file.includes('grid-resync') && flat.includes('log')) {
                return engine.config.filesystem['/'].children.var.children.log.children['grid-resync.log'].content;
            }
            if (flat.includes('named.conf') && (flat.includes('allow-update') || flat.includes('allow-transfer'))) {
                return 'allow-transfer { 10.0.1.11; };\nallow-update { none; };';
            }
            if (file.includes('db.sector7') || flat.includes('db.sector7')) {
                var zc = engine.config.filesystem['/'].children.etc.children.bind.children.zones.children['db.sector7.matrix.net'].content;
                if (pattern) { return zc.split('\n').filter(function(l) { return l.toLowerCase().includes(pattern.toLowerCase()); }).join('\n') || '(no match)'; }
                return zc;
            }
            return '[grep] Use: grep <pattern> <file>\nKnown logs: /var/log/named/named.log  /var/log/syslog  /var/log/auth.log  /var/log/grid-resync.log';
        },

        // diff -- compare zone files (L09 pattern: diff current vs .bak).
        // Shows both attacker changes until both _syntaxFixed and _recordFixed are true.
        'diff': function(args, term, engine) {
            var files = args.filter(function(a) { return !a.startsWith('-'); });
            var f1    = files[0] || '';
            var f2    = files[1] || '';
            var cur   = f1.includes('db.sector7.matrix.net') && !f1.includes('.bak');
            var bak   = f2.includes('.bak') || f1.includes('.bak');

            if (cur && bak) {
                // Show clean once both issues are resolved
                if (engine.config._syntaxFixed && engine.config._recordFixed) {
                    return '(no differences -- zone file matches backup)';
                }
                // Build partial diff depending on what's still broken
                var lines = '';
                if (!engine.config._recordFixed) {
                    lines += '18c18\n< grid-api    IN  A       203.0.113.99\n---\n> grid-api    IN  A       10.0.1.50\n';
                }
                if (!engine.config._syntaxFixed) {
                    lines += '20c20\n< www         IN  CNAME   ops.sector7.matrix.net\n---\n> www         IN  CNAME   ops.sector7.matrix.net.\n';
                }
                var notes = '';
                if (!engine.config._recordFixed) { notes += 'Line 18: grid-api poisoned to 203.0.113.99 (correct value: 10.0.1.50)\n'; }
                if (!engine.config._syntaxFixed) { notes += 'Line 20: CNAME missing trailing dot (appends zone origin -> out-of-zone parse error)\n'; }
                return lines + '\n(\'<\' = current  \'>\' = backup)\n' + notes.trimEnd();
            }
            if (f1 && f2) { return '(files are identical)'; }
            return 'Usage: diff <file1> <file2>\nExample: diff /etc/bind/zones/db.sector7.matrix.net /etc/bind/zones/db.sector7.matrix.net.bak';
        },

        // cat -- output file contents.
        // cmd5 fires on: cat /etc/cron.d/grid-resync
        // cmd6 fires on: cat /usr/local/bin/zone-resync.sh
        // cat /etc/cron.d/grid-resync returns an error once _cronNeutralized=true (file removed).
        'cat': function(args, term, engine) {
            var file = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!file) { return 'Usage: cat <file>'; }

            if (file === '~/notes.txt' || file === 'notes.txt' || file === '/home/operator/notes.txt') {
                return engine.config.filesystem['/'].children.home.children.operator.children['notes.txt'].content;
            }

            // BIND config files
            var bindFileMap = {
                '/etc/bind/named.conf':              'named.conf',
                '/etc/bind/named.conf.local':         'named.conf.local',
                '/etc/bind/named.conf.options':       'named.conf.options',
                '/etc/bind/named.conf.default-zones': 'named.conf.default-zones'
            };
            if (bindFileMap[file]) {
                var bd = engine.config.filesystem['/'].children.etc.children.bind.children;
                return bd[bindFileMap[file]] ? bd[bindFileMap[file]].content : 'cat: ' + file + ': No such file or directory';
            }

            if (file === '/etc/bind/zones/db.sector7.matrix.net') {
                return engine.config.filesystem['/'].children.etc.children.bind.children.zones.children['db.sector7.matrix.net'].content;
            }
            if (file === '/etc/bind/zones/db.sector7.matrix.net.bak') {
                return engine.config.filesystem['/'].children.etc.children.bind.children.zones.children['db.sector7.matrix.net.bak'].content;
            }
            if (file === '/etc/bind/zones/db.10.0.1') {
                return engine.config.filesystem['/'].children.etc.children.bind.children.zones.children['db.10.0.1'].content;
            }

            if (file === '/etc/resolv.conf')  { return engine.config.filesystem['/'].children.etc.children['resolv.conf'].content; }
            if (file === '/etc/hosts')         { return engine.config.filesystem['/'].children.etc.children.hosts.content; }
            if (file === '/etc/nsswitch.conf') { return engine.config.filesystem['/'].children.etc.children['nsswitch.conf'].content; }
            if (file === '/etc/passwd')        { return engine.config.filesystem['/'].children.etc.children.passwd.content; }

            if (file === '/var/log/named/named.log')  { return engine.config.filesystem['/'].children.var.children.log.children.named.children['named.log'].content; }
            if (file === '/var/log/syslog')            { return engine.config.filesystem['/'].children.var.children.log.children.syslog.content; }
            if (file === '/var/log/auth.log')          { return engine.config.filesystem['/'].children.var.children.log.children['auth.log'].content; }
            if (file === '/var/log/grid-resync.log')   { return engine.config.filesystem['/'].children.var.children.log.children['grid-resync.log'].content; }
            if (file === '/var/log/grid-backup.log')   { return engine.config.filesystem['/'].children.var.children.log.children['grid-backup.log'].content; }

            // Cron drop-in read -- cmd5 fires here; error if already removed
            if (file === '/etc/cron.d/grid-resync') {
                if (engine.config._cronNeutralized) {
                    return 'cat: /etc/cron.d/grid-resync: No such file or directory';
                }
                engine.awardFlag('cmd5');
                return engine.config.filesystem['/'].children.etc.children['cron.d'].children['grid-resync'].content;
            }
            if (file === '/etc/cron.d/grid-backup') {
                return engine.config.filesystem['/'].children.etc.children['cron.d'].children['grid-backup'].content;
            }

            // Malicious script read -- cmd6
            if (file === '/usr/local/bin/zone-resync.sh') {
                engine.awardFlag('cmd6');
                return engine.config.filesystem['/'].children.usr.children.local.children.bin.children['zone-resync.sh'].content;
            }
            if (file === '/usr/local/bin/backup.sh') {
                return engine.config.filesystem['/'].children.usr.children.local.children.bin.children['backup.sh'].content;
            }

            // Delegate to BoxEngine default filesystem walker
            return null;
        },

        // ls -- directory listing.
        // cmd5 alternate: ls /etc/cron.d reveals grid-resync.
        // Once _cronNeutralized=true, grid-resync is absent from the listing.
        'ls': function(args, term, engine) {
            var long = args.some(function(a) { return /^-[a-z]*l/.test(a); });
            var all  = args.some(function(a) { return /^-[a-z]*a/.test(a); });
            var path = args.find(function(a) { return !a.startsWith('-'); }) || '.';

            if (path === '/etc/cron.d' || path === '/etc/cron.d/') {
                engine.awardFlag('cmd5');
                var gone = engine.config._cronNeutralized;
                if (long) {
                    var rogue = gone ? '' : '-rw-r--r-- 1 root root  158 May  9 02:13 grid-resync\n';
                    return 'total ' + (gone ? '4' : '8') + '\ndrwxr-xr-x 2 root root   80 May  9 02:13 .\ndrwxr-xr-x 1 root root 4096 May  9 02:13 ..\n-rw-r--r-- 1 root root  142 May  8 02:30 grid-backup\n' + rogue;
                }
                return gone ? 'grid-backup' : 'grid-backup  grid-resync';
            }

            if (path === '/usr/local/bin' || path === '/usr/local/bin/') {
                if (long) { return 'total 8\ndrwxr-xr-x 2 root root 4096 May  9 02:13 .\ndrwxr-xr-x 8 root root 4096 May  8 09:00 ..\n-rwxr-xr-x 1 root root  148 May  8 09:00 backup.sh\n-rwxr-xr-x 1 root root  512 May  9 02:13 zone-resync.sh'; }
                return 'backup.sh  zone-resync.sh';
            }

            if (path === '/etc/bind/zones' || path === '/etc/bind/zones/') {
                if (long) { return 'total 12\ndrwxr-x--- 2 bind bind 4096 May  9 02:11 .\ndrwxr-xr-x 3 root root 4096 May  8 09:00 ..\n-rw-r----- 1 bind bind  831 May  9 02:11 db.sector7.matrix.net\n-rw-r----- 1 bind bind  751 May  8 09:00 db.sector7.matrix.net.bak\n-rw-r----- 1 bind bind  412 May  8 09:00 db.10.0.1'; }
                return 'db.10.0.1  db.sector7.matrix.net  db.sector7.matrix.net.bak';
            }

            if (path === '/etc/bind' || path === '/etc/bind/') {
                if (long) { return 'total 20\ndrwxr-sr-x 3 root bind 4096 May  8 09:00 .\ndrwxr-xr-x 1 root root 4096 May  8 09:00 ..\n-rw-r--r-- 1 root bind  127 May  8 09:00 named.conf\n-rw-r--r-- 1 root bind  312 May  8 09:00 named.conf.default-zones\n-rw-r--r-- 1 root bind  241 May  8 09:00 named.conf.local\n-rw-r--r-- 1 root bind  251 May  8 09:00 named.conf.options\ndrwxr-s--- 2 bind bind 4096 May  9 02:11 zones'; }
                return 'named.conf  named.conf.default-zones  named.conf.local  named.conf.options  zones';
            }

            if (path === '/var/log' || path === '/var/log/') {
                if (long) { return 'total 24\ndrwxrwxr-x 1 root root  4096 May  9 02:23 .\ndrwxr-xr-x 1 root root  4096 May  8 09:00 ..\n-rw-r----- 1 root adm   1024 May  9 02:23 auth.log\n-rw-r--r-- 1 root root   512 May  9 02:23 grid-resync.log\n-rw-r--r-- 1 root root   192 May  9 02:30 grid-backup.log\ndrwxr-x--- 2 bind bind  4096 May  9 02:15 named\n-rw-r----- 1 root adm   2048 May  9 02:23 syslog'; }
                return 'auth.log  grid-backup.log  grid-resync.log  named  syslog';
            }

            if (path === '/home/operator' || path === '~' || path === '.') {
                if (long || all) { return 'total 12\ndrwxr-xr-x 2 operator operator 4096 May  9 02:15 .\ndrwxr-xr-x 3 root     root     4096 May  8 09:00 ..\n-rw-r--r-- 1 operator operator  738 May  9 02:15 .bash_history\n-rw-r--r-- 1 operator operator  612 May  9 02:14 notes.txt'; }
                return 'notes.txt';
            }

            return null;
        },

        // rm -- remove files.
        // 'sudo rm /etc/cron.d/grid-resync' sets _cronNeutralized=true and removes the
        // filesystem node so subsequent ls/cat reflect the deletion.
        'rm': function(args, term, engine) {
            var file = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (file === '/etc/cron.d/grid-resync') {
                engine.config._cronNeutralized = true;
                var cronDir = engine.config.filesystem['/'].children.etc.children['cron.d'].children;
                delete cronDir['grid-resync'];
                return '';
            }
            // Silently succeed on the script itself (students might try to rm it too)
            if (file.includes('zone-resync')) { return ''; }
            if (file) { return 'rm: cannot remove \'' + file + '\': Operation not permitted (use sudo)'; }
            return 'Usage: rm [-f] [-r] <file>';
        },

        // cp -- copy files (restore zone from backup, L09 workflow).
        // Copying .bak over the live file fixes BOTH the syntax error and the poisoned
        // A record simultaneously (the backup has the clean original values).
        'cp': function(args, term, engine) {
            var files = args.filter(function(a) { return !a.startsWith('-'); });
            var src   = files[0] || '';
            var dst   = files[1] || '';
            if (src.includes('.bak') && dst.includes('db.sector7.matrix.net') && !dst.includes('.bak')) {
                var clean = engine.config.filesystem['/'].children.etc.children.bind.children.zones.children['db.sector7.matrix.net.bak'].content;
                engine.config.filesystem['/'].children.etc.children.bind.children.zones.children['db.sector7.matrix.net'].content = clean;
                // Backup has correct CNAME (trailing dot) AND correct A record
                engine.config._syntaxFixed = true;
                engine.config._recordFixed = true;
                return '';
            }
            return '';
        },

        // nano / vim / vi -- editor simulation (delegates to _editor)
        'nano': function(args, term, engine) { return engine.config.commands['_editor'](args, term, engine); },
        'vim':  function(args, term, engine) { return engine.config.commands['_editor'](args, term, engine); },
        'vi':   function(args, term, engine) { return engine.config.commands['_editor'](args, term, engine); },

        // _editor -- simulates saving changes to the zone file.
        // Sets _syntaxFixed and _recordFixed independently based on what was actually
        // broken in the file content. Students may fix one issue at a time.
        '_editor': function(args, term, engine) {
            var file = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (file.includes('db.sector7.matrix.net') && !file.includes('.bak')) {
                var zFs = engine.config.filesystem['/'].children.etc.children.bind.children.zones.children;
                var cur = zFs['db.sector7.matrix.net'].content;
                var hadPoison = cur.includes('203.0.113.99');
                var hadSyntax = !cur.includes('ops.sector7.matrix.net.');
                var needsFix  = hadPoison || hadSyntax;
                if (needsFix) {
                    var fixed = cur
                        .replace('grid-api    IN  A       203.0.113.99', 'grid-api    IN  A       10.0.1.50')
                        .replace('www         IN  CNAME   ops.sector7.matrix.net\n', 'www         IN  CNAME   ops.sector7.matrix.net.\n');
                    zFs['db.sector7.matrix.net'].content = fixed;
                    // Set each bit only for the change that was actually applied
                    if (hadSyntax) { engine.config._syntaxFixed = true; }
                    if (hadPoison) { engine.config._recordFixed = true; }
                    var msg = '[Editor simulation]\nChanges applied to /etc/bind/zones/db.sector7.matrix.net:';
                    if (hadPoison) { msg += '\n  grid-api  IN  A  203.0.113.99  ->  10.0.1.50  (attacker IP corrected)'; }
                    if (hadSyntax) { msg += '\n  www CNAME ops.sector7.matrix.net  ->  ops.sector7.matrix.net.  (trailing dot added)'; }
                    msg += '\n\nFile saved. Run: named-checkconf -z && rndc reload sector7.matrix.net';
                    return msg;
                }
                return '[Editor simulation] /etc/bind/zones/db.sector7.matrix.net\nZone already corrected. No changes needed.';
            }
            if (file.includes('named.conf')) { return '[Editor simulation] ' + file + '\n(Configuration is pre-set for this simulation)'; }
            return '[Editor simulation] Cannot open interactive editor.\nTarget file: ' + (file || '(none specified)');
        },

        // sed -- non-interactive zone file edit (alternate repair path).
        // Sets _syntaxFixed or _recordFixed independently based on which pattern is matched.
        'sed': function(args, term, engine) {
            var flat = args.join(' ');
            var zFs  = engine.config.filesystem['/'].children.etc.children.bind.children.zones.children;

            // sed targeting the poisoned A record
            if (flat.includes('203.0.113.99') && flat.includes('db.sector7')) {
                var c1 = zFs['db.sector7.matrix.net'].content;
                if (c1.includes('203.0.113.99')) {
                    zFs['db.sector7.matrix.net'].content = c1.replace('203.0.113.99', '10.0.1.50');
                    engine.config._recordFixed = true;
                }
                return '';
            }

            // sed targeting the CNAME trailing-dot syntax error
            if ((flat.includes('CNAME') || flat.includes('cname') || flat.includes('matrix.net')) && flat.includes('db.sector7')) {
                var c2 = zFs['db.sector7.matrix.net'].content;
                var c2fixed = c2.replace(
                    'www         IN  CNAME   ops.sector7.matrix.net\n',
                    'www         IN  CNAME   ops.sector7.matrix.net.\n'
                );
                if (c2fixed !== c2) {
                    zFs['db.sector7.matrix.net'].content = c2fixed;
                    engine.config._syntaxFixed = true;
                }
                return '';
            }

            return 'sed: ' + args.join(' ') + ': (processed)';
        },

        // journalctl -- system journal
        'journalctl': function(args, term, engine) {
            var flat = args.join(' ');
            if (flat.includes('named') || flat.includes('bind9')) {
                if (!engine.config._namedRunning) {
                    return '-- Journal begins at Sat 2026-05-09 02:00:00 UTC --\nMay 09 02:12:01 cell-071 named[1847]: zone sector7.matrix.net/IN: loading from master file /etc/bind/zones/db.sector7.matrix.net failed: out of zone data\nMay 09 02:12:01 cell-071 named[1847]: zone sector7.matrix.net/IN: not loaded due to errors.\nMay 09 02:15:01 cell-071 named[1847]: shutting down: named is done running\nMay 09 02:15:01 cell-071 systemd[1]: named.service: Main process exited, code=exited, status=1/FAILURE\n\nHint: named-checkconf -z to find the zone parse error.';
                }
                return '-- Journal begins at Sat 2026-05-09 02:00:00 UTC --\nMay 09 02:29:00 cell-071 named[1847]: zone 1.0.10.in-addr.arpa/IN: loaded serial 2026050901\nMay 09 02:29:00 cell-071 named[1847]: zone sector7.matrix.net/IN: loaded serial 2026050902\nMay 09 02:29:00 cell-071 named[1847]: running';
            }
            if (flat.includes('cron')) {
                return '-- Journal begins at Sat 2026-05-09 02:00:00 UTC --\nMay 09 02:13:00 cell-071 CRON[3271]: (root) CMD (/usr/local/bin/zone-resync.sh >> /var/log/grid-resync.log 2>&1)\nMay 09 02:18:00 cell-071 CRON[3271]: (root) CMD (/usr/local/bin/zone-resync.sh >> /var/log/grid-resync.log 2>&1)\nMay 09 02:23:00 cell-071 CRON[3271]: (root) CMD (/usr/local/bin/zone-resync.sh >> /var/log/grid-resync.log 2>&1)\n\nNote: zone-resync.sh is NOT a legitimate script. See /etc/cron.d/grid-resync.';
            }
            return '-- Journal begins at Sat 2026-05-09 02:00:00 UTC --\nMay 09 02:12:01 cell-071 named[1847]: zone sector7.matrix.net/IN: not loaded due to errors.\nMay 09 02:14:00 cell-071 grid-monitor[999]: ALERT: SERVFAIL grid-api.sector7.matrix.net\nMay 09 02:15:01 cell-071 named[1847]: shutting down: named is done running\nMay 09 02:13:00 cell-071 CRON[3271]: (root) CMD (/usr/local/bin/zone-resync.sh >> /var/log/grid-resync.log 2>&1)\n\nHint: journalctl -u named  for BIND events\n      journalctl -u cron   for cron activity';
        },

        // ps -- process snapshot
        'ps': function(args, term, engine) {
            var isEf  = args.includes('-ef') || (args.includes('-e') && args.includes('-f'));
            var isAux = args.includes('aux') || args.includes('-aux');
            if (isEf || isAux) {
                var nl = engine.config._namedRunning
                    ? '\nbind        1847       1  0.2  2.1  May09 ?        00:00:03 /usr/sbin/named -u bind'
                    : '';
                if (isEf) { return 'UID          PID    PPID  C STIME TTY          TIME CMD\nroot           1       0  0 May09 ?        00:00:08 /sbin/init\nroot         842       1  0 May09 ?        00:00:01 sshd: /usr/sbin/sshd -D\nroot        3271     842  0 May09 ?        00:00:00 /usr/sbin/cron -f\noperator    1421     842  0 02:15 pts/0    00:00:00 -bash' + nl; }
                return 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot           1  0.0  0.1 167872 11392 ?        Ss   May09   0:08 /sbin/init\nroot         842  0.0  0.1  17448  6912 ?        Ss   May09   0:01 sshd: /usr/sbin/sshd -D\nroot        3271  0.0  0.0   9212  2048 ?        Ss   May09   0:00 /usr/sbin/cron -f\noperator    1421  0.0  0.1   8956  5120 pts/0    Ss   02:15   0:00 -bash' + nl;
            }
            return 'Usage: ps [-ef | aux]';
        },

        // resolvectl -- systemd-resolved cache.
        // query grid-api returns 203.0.113.99 until BOTH _recordFixed AND _cronNeutralized
        // are true -- same logic as dig to keep outputs consistent.
        'resolvectl': function(args, term, engine) {
            var sub = args[0] || '';
            if (sub === 'flush-caches') { return 'Cache flushed.'; }
            if (sub === 'status') { return 'Global\n       Protocols: -LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported\n\nLink 2 (eth0)\nCurrent DNS Server: 127.0.0.1\n       DNS Servers: 127.0.0.1\n        DNS Domain: sector7.matrix.net matrix.net'; }
            if (sub === 'query') {
                var qn = args[1] || '';
                if (qn.includes('grid-api')) {
                    if (!engine.config._namedRunning) { return 'grid-api.sector7.matrix.net: resolve call failed: SERVFAIL (named not running)'; }
                    var resolved = (engine.config._recordFixed && engine.config._cronNeutralized) ? '10.0.1.50' : '203.0.113.99';
                    return 'grid-api.sector7.matrix.net IN A ' + resolved;
                }
            }
            return 'Usage: resolvectl [flush-caches|status|query <name>]';
        },

        // ping -- connectivity test
        'ping': function(args, term, engine) {
            var target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!target) { return 'Usage: ping [-c count] <destination>'; }
            if (target === '127.0.0.1' || target === 'localhost') { return 'PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.031 ms\n\n--- 127.0.0.1 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss'; }
            if (target === '203.0.113.99') { return 'PING 203.0.113.99 (203.0.113.99) 56(84) bytes of data.\n64 bytes from 203.0.113.99: icmp_seq=1 ttl=52 time=97.1 ms\n\n--- 203.0.113.99 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss\n\n*** Attacker C2 server. grid-api was poisoned to point here. ***'; }
            if (target === '10.0.1.50') { return 'PING 10.0.1.50 (10.0.1.50) 56(84) bytes of data.\n64 bytes from 10.0.1.50: icmp_seq=1 ttl=64 time=0.411 ms\n\n--- 10.0.1.50 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss'; }
            return 'PING ' + target + ' (' + target + ') 56(84) bytes of data.\n64 bytes from ' + target + ': icmp_seq=1 ttl=56 time=14.2 ms\n\n--- ' + target + ' ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss';
        },

        // ip -- network info
        'ip': function(args, term, engine) {
            var sub = args[0] || '';
            if (sub === 'link') { return '1: lo: <LOOPBACK,UP> mtu 65536 state UNKNOWN\n    link/loopback 00:00:00:00:00:00\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500 state UP\n    link/ether 52:54:00:ab:11:01 brd ff:ff:ff:ff:ff:ff'; }
            if (sub === 'addr' || sub === 'address') { return '1: lo:\n    inet 127.0.0.1/8 scope host lo\n2: eth0:\n    inet 10.0.1.1/24 brd 10.0.1.255 scope global eth0'; }
            return 'Usage: ip [link|addr|route] [show]';
        },

        // last / who / lastb -- session information
        'last':  function(args, term, engine) { return 'root     pts/1        203.0.113.99     Sat May  9 02:10 - 02:15  (00:05)\noperator pts/0        10.0.0.1         Sat May  9 02:15   still logged in\n\nwtmp begins Wed May  6 09:00:00 2026'; },
        'who':   function(args, term, engine) { return 'operator pts/0        2026-05-09 02:15 (10.0.0.1)'; },
        'lastb': function(args, term, engine) { return '(no failed login attempts -- attacker used a stolen SSH key, no password brute-force)'; }

    },

    // ===============================================================
    // FLAGS
    // ===============================================================

    flags: [
        {
            id: 'cmd1',
            value: 'FLAG{ala-hunt3_cmd01_dns_diagnose}',
            label: '01 -- Diagnose DNS failure',
            description: 'Ran dig A grid-api.sector7.matrix.net @127.0.0.1 and received SERVFAIL (named not running).',
            points: 50,
            autoCheck: true
        },
        {
            id: 'cmd2',
            value: 'FLAG{ala-hunt3_cmd02_checkconf}',
            label: '02 -- Find the zone syntax error',
            description: 'Ran named-checkconf -z and identified the missing trailing dot on the CNAME target (line 19).',
            points: 50,
            autoCheck: true
        },
        {
            id: 'cmd3',
            value: 'FLAG{ala-hunt3_cmd03_reload_verify}',
            label: '03 -- Fix zone file and reload BIND',
            description: 'Fixed zone file syntax and ran rndc reload sector7.matrix.net (or systemctl restart named).',
            points: 50,
            autoCheck: true
        },
        {
            id: 'cmd4',
            value: 'FLAG{ala-hunt3_cmd04_poisoned_record}',
            label: '04 -- Identify the poisoned A record',
            description: 'Ran dig +short A grid-api.sector7.matrix.net @127.0.0.1 and saw 203.0.113.99 (attacker IP).',
            points: 50,
            autoCheck: true
        },
        {
            id: 'cmd5',
            value: 'FLAG{ala-hunt3_cmd05_rogue_cron}',
            label: '05 -- Find the rogue cron job',
            description: 'Listed /etc/cron.d (ls or cat) and identified grid-resync as the attacker-installed drop-in.',
            points: 50,
            autoCheck: true
        },
        {
            id: 'cmd6',
            value: 'FLAG{ala-hunt3_cmd06_malicious_script}',
            label: '06 -- Read the malicious script',
            description: 'Ran cat /usr/local/bin/zone-resync.sh and read the attacker\'s zone-poisoning script.',
            points: 50,
            autoCheck: true
        },
        {
            id: 'cmd7',
            value: 'FLAG{ala-hunt3_cmd07_restored}',
            label: '07 -- Confirm resolution restored',
            description: 'Ran dig +short A grid-api.sector7.matrix.net @127.0.0.1 after full fix -- received 10.0.1.50.',
            points: 50,
            autoCheck: true
        }
    ],

    // ===============================================================
    // SCORING
    // ===============================================================

    scoring: {
        // base:0 so 7 flags x 50pts = 350 exactly on completion.
        // Avoids the W2 base:1000 bug where total showed 1400 vs stated 400.
        base: 0,
        minScore: 0,
        maxScore: 350,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ===============================================================
    // HINTS
    // ===============================================================

    hints: [
        {
            id: 'hint1',
            text: 'Start with DNS diagnosis: dig A grid-api.sector7.matrix.net @127.0.0.1 to see SERVFAIL. Then check why named is down: systemctl status named. Then find the zone error: named-checkconf -z. Your notes.txt has the full recovery checklist.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'To fix the zone file: use nano /etc/bind/zones/db.sector7.matrix.net (or vim, or cp from the .bak backup, or diff to see what changed). There are two problems: (1) the www CNAME target is missing a trailing dot -- add it. (2) the grid-api A record is wrong -- change 203.0.113.99 back to 10.0.1.50. After editing: named-checkconf -z && rndc reload sector7.matrix.net. Then dig again to check what IP you get.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'For the rogue automation: the job is NOT in crontab -l. Look in the system drop-in directory: ls /etc/cron.d. Cat the suspicious file (grid-resync), then cat the script it runs (/usr/local/bin/zone-resync.sh). To remove it: sudo rm /etc/cron.d/grid-resync. Then correct the poison in the zone file, rndc reload, and verify with dig +short A grid-api.sector7.matrix.net @127.0.0.1.',
            cost: 50,
            penalty: -50
        }
    ],

    // ===============================================================
    // CERT OBJECTIVES
    // ===============================================================

    certObjectives: {
        certPath: 'LPI-LPIC-1',
        mappings: [
            { flagId: 'cmd1', objective: '108.4', description: 'Manage DNS client', skill: 'Using dig to diagnose DNS resolution failures -- SERVFAIL identification' },
            { flagId: 'cmd2', objective: '108.1', description: 'Maintain DNS zones', skill: 'named-checkconf -z to validate zone file syntax and pinpoint parse errors' },
            { flagId: 'cmd3', objective: '108.1', description: 'Maintain DNS zones', skill: 'Editing zone files and running rndc reload to apply changes without full restart' },
            { flagId: 'cmd4', objective: '108.4', description: 'Manage DNS client', skill: 'dig +short to confirm a poisoned A record returning an attacker IP' },
            { flagId: 'cmd5', objective: '107.2', description: 'Automate system administration tasks', skill: 'Inspecting /etc/cron.d for unauthorized system-level cron drop-in files' },
            { flagId: 'cmd6', objective: '105.1', description: 'Customize and use the shell environment', skill: 'Reading a Bash script to understand attacker-planted automation logic' },
            { flagId: 'cmd7', objective: '108.4', description: 'Manage DNS client', skill: 'Verifying authoritative resolution restored with dig (aa flag + correct IP 10.0.1.50)' }
        ]
    }

};
