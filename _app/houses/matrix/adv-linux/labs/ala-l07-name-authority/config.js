/* ============================================================
   ALA-L07: Name Authority
   Advanced Linux Administration -- CTF Lab
   BIND9 zone configuration, forward/reverse DNS, zone transfers
   ============================================================ */

const ALAL07Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Name Authority',
    subtitle: 'Advanced Linux Administration -- DNS with BIND9',
    description: 'Sector 7 lost its name server six hours ago. Six cells are operating on IP addresses only. Stand up BIND9, configure a forward zone and a reverse zone for sector7.matrix.net, add all six cells plus CNAME and MX records, then verify zone transfer to the secondary before the next sector sweep.',
    difficulty: 'Hard',
    estimatedTime: 45,
    accent: '#22d3ee',
    storageKey: 'hexworth_lab_ala_l07',
    registryId: 'ala-l07-name-authority',
    trackerKey: 'lab_ala_l07',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-NS1 BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: eth0 UP (10.0.1.1/24)',
            'BIND9: service not running',
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
        intro: 'Sector 7 is running on raw IPs. The name authority cell went dark during last night\'s grid event and was not recovered before the incident window closed. You are standing up a replacement. Six cells are waiting for name resolution. The secondary NS at 10.0.1.2 needs a zone transfer before the sweep team can certify the sector clean.',
        scenario: 'BIND9 is installed on cell-ns1 (10.0.1.1) but not running. named.conf.options has stubs that need to be completed. named.conf.local is empty -- you must declare both zones. The zones/ directory is empty -- you must write the zone files. All six cells plus a CNAME for grid-api and an MX record for grid-mail must resolve. The secondary NS is at 10.0.1.2.',
        outro: 'BIND9 is running. All six cells resolve forward and reverse. The CNAME and MX records are live. The secondary NS has a complete zone transfer. Sector 7 name authority is restored. The sweep team marks the sector clean.'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-ns1',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to CELL-NS1\nLast login: Thu Apr 10 06:00:00 2026 from 10.0.0.1\n\n*** ALERT: named.service is not running ***\n*** Sector 7 DNS is DOWN ***\n*** Zone files required at /etc/bind/zones/ ***\n\nType \'help\' for available commands.\n'
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
                                'sector7-hosts.txt': {
                                    type: 'file',
                                    content: '# Sector 7 cell inventory\n# Format: hostname  IP  role\ncell-071  10.0.1.71   grid-operations\ncell-088  10.0.1.88   security\ncell-034  10.0.1.34   field-assembly\ncell-016  10.0.1.16   monitoring\ncell-049  10.0.1.49   grid-connectivity\ngrid-api  CNAME->cell-071  api-alias\ngrid-mail 10.0.1.10   mail-exchanger\n'
                                },
                                'MISSION.txt': {
                                    type: 'file',
                                    content: 'MISSION: Name Authority\n\nStand up DNS for Sector 7. All six cells must resolve forward and reverse.\n\nZone: sector7.matrix.net\nReverse zone: 1.0.10.in-addr.arpa\nThis NS: 10.0.1.1 (cell-ns1)\nSecondary NS: 10.0.1.2\n\nRequired records:\n  A: cell-071, cell-088, cell-034, cell-016, cell-049\n  A: grid-mail\n  CNAME: grid-api -> cell-071.sector7.matrix.net.\n  MX: grid-mail.sector7.matrix.net.\n  PTR: .71, .88, .34, .16, .49, .10\n\nSteps:\n  1. Edit /etc/bind/named.conf.options\n  2. Edit /etc/bind/named.conf.local -- add zone declarations\n  3. Create /etc/bind/zones/db.sector7.matrix.net\n  4. Create /etc/bind/zones/db.10.0.1\n  5. named-checkconf && named-checkzone ...\n  6. systemctl start named\n  7. dig A cell-071.sector7.matrix.net @10.0.1.1\n  8. /opt/verify/check-forward.sh\n  9. /opt/verify/check-reverse.sh\n  10. /opt/verify/check-transfer.sh\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /etc/bind/\ncat /home/operator/sector7-hosts.txt\n'
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
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nbind:x:107:113::/var/cache/bind:/usr/sbin/nologin\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\n'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'operator': {
                                    type: 'file',
                                    content: 'operator ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/sbin/named-checkconf, /usr/sbin/named-checkzone, /usr/sbin/rndc\n'
                                }
                            }
                        },
                        'bind': {
                            type: 'dir',
                            children: {
                                'named.conf': {
                                    type: 'file',
                                    content: '// BIND9 main configuration\n// cell-ns1 -- Sector 7 Name Authority\n\ninclude "/etc/bind/named.conf.options";\ninclude "/etc/bind/named.conf.local";\ninclude "/etc/bind/named.conf.default-zones";\n'
                                },
                                'named.conf.options': {
                                    type: 'file',
                                    // Stub -- student must complete listen-on, allow-query, recursion, forwarders
                                    content: '// named.conf.options -- STUB\n// Complete the options block below\noptions {\n    directory "/var/cache/bind";\n\n    // TODO: listen-on { <address>; };\n    // TODO: allow-query { <network>; localhost; };\n    // TODO: recursion yes|no;\n    // TODO: forwarders { <ip>; };\n\n    dnssec-validation auto;\n    listen-on-v6 { none; };\n};\n'
                                },
                                'named.conf.local': {
                                    type: 'file',
                                    // Empty -- student must add zone declarations
                                    content: '// named.conf.local -- add zone declarations here\n'
                                },
                                'named.conf.default-zones': {
                                    type: 'file',
                                    content: '// Default zones (localhost, etc.) -- do not modify\nzone "localhost" {\n    type master;\n    file "/etc/bind/db.local";\n};\nzone "127.in-addr.arpa" {\n    type master;\n    file "/etc/bind/db.127";\n};\n'
                                },
                                'rndc.key': {
                                    type: 'file',
                                    content: '// rndc.key -- pre-generated\nkey "rndc-key" {\n    algorithm hmac-sha256;\n    secret "6oMvCbvdU4rnGpMEWVgLaQ==";\n};\n'
                                },
                                'zones': {
                                    type: 'dir',
                                    children: {}
                                    // Student must create zone files here
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
                                'check-forward.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Queries all 6 hostnames, CNAME, and MX from 10.0.1.1\n# Awards FLAG 1 when all resolve correctly\nHOSTS="cell-071 cell-088 cell-034 cell-016 cell-049 grid-api grid-mail"\nZONE="sector7.matrix.net"\nNS="10.0.1.1"\nPASS=0\nFAIL=0\n\nfor h in $HOSTS; do\n    r=$(dig +short "${h}.${ZONE}" @${NS} 2>/dev/null)\n    if [ -n "$r" ]; then\n        echo "[PASS] ${h}.${ZONE} -> $r"\n        PASS=$((PASS+1))\n    else\n        echo "[FAIL] ${h}.${ZONE} -- no answer"\n        FAIL=$((FAIL+1))\n    fi\ndone\n\nif [ $FAIL -eq 0 ]; then\n    echo "FLAG: FLAG{forward_zone_all_six_hosts_resolve}"\nfi\n'
                                },
                                'check-reverse.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# PTR queries for all 6 IPs from 10.0.1.1\n# Awards FLAG 2 when all resolve correctly\nIPS="10.0.1.71 10.0.1.88 10.0.1.34 10.0.1.16 10.0.1.49 10.0.1.10"\nNS="10.0.1.1"\nPASS=0\nFAIL=0\n\nfor ip in $IPS; do\n    r=$(dig +short -x "${ip}" @${NS} 2>/dev/null)\n    if [ -n "$r" ]; then\n        echo "[PASS] $ip -> $r"\n        PASS=$((PASS+1))\n    else\n        echo "[FAIL] $ip -- no PTR record"\n        FAIL=$((FAIL+1))\n    fi\ndone\n\nif [ $FAIL -eq 0 ]; then\n    echo "FLAG: FLAG{reverse_zone_all_six_ptrs_resolve}"\nfi\n'
                                },
                                'check-transfer.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Initiates AXFR from secondary (10.0.1.2)\n# Awards FLAG 3 when transfer succeeds\necho "Initiating AXFR from 10.0.1.2..."\nresult=$(dig AXFR sector7.matrix.net @10.0.1.1 2>/dev/null | grep -c "IN")\nif [ "$result" -ge 8 ]; then\n    echo "[PASS] AXFR transfer succeeded. $result records transferred."\n    echo "FLAG: FLAG{zone_transfer_configured_and_verified}"\nelse\n    echo "[FAIL] AXFR returned insufficient records."\n    echo "Check: allow-transfer { 10.0.1.2; }; in zone declaration"\nfi\n'
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
                                    children: {}
                                    // Empty at lab start -- BIND not running
                                }
                            }
                        },
                        'cache': {
                            type: 'dir',
                            children: {
                                'bind': {
                                    type: 'dir',
                                    children: {}
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

    _state: {
        namedRunning: false,            // systemctl start named
        optionsConfigured: false,       // named.conf.options has listen-on + allow-query
        forwardZoneDeclared: false,     // named.conf.local has forward zone entry
        reverseZoneDeclared: false,     // named.conf.local has reverse zone entry
        forwardZoneFile: false,         // db.sector7.matrix.net written with all 6 A records + CNAME + MX
        reverseZoneFile: false,         // db.10.0.1 written with all 6 PTR records
        allowTransfer: false            // zone declaration includes allow-transfer { 10.0.1.2; }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // write -- BoxEngine file editor for config files
        'write': function(args, term, engine) {
            const file = args[0] || '';
            const content = args.slice(1).join(' ');

            if (!file) return `Usage: write <file> <content>\nKey files:\n  /etc/bind/named.conf.options\n  /etc/bind/named.conf.local\n  /etc/bind/zones/db.sector7.matrix.net\n  /etc/bind/zones/db.10.0.1`;

            // named.conf.options
            if (file === '/etc/bind/named.conf.options') {
                const hasListen = content.includes('listen-on');
                const hasAllowQuery = content.includes('allow-query');
                if (!hasListen && !hasAllowQuery) {
                    return `write: named.conf.options must include listen-on and allow-query directives.`;
                }
                engine.config._state.optionsConfigured = hasListen && hasAllowQuery;
                term.fs['/'].children.etc.children.bind.children['named.conf.options'].content = content + '\n';
                return `Written: /etc/bind/named.conf.options`;
            }

            // named.conf.local -- zone declarations
            if (file === '/etc/bind/named.conf.local') {
                const hasForward = content.includes('sector7.matrix.net');
                const hasReverse = content.includes('1.0.10.in-addr.arpa');
                const hasTransfer = content.includes('allow-transfer') && content.includes('10.0.1.2');
                engine.config._state.forwardZoneDeclared = hasForward;
                engine.config._state.reverseZoneDeclared = hasReverse;
                engine.config._state.allowTransfer = hasTransfer;
                term.fs['/'].children.etc.children.bind.children['named.conf.local'].content = content + '\n';
                return `Written: /etc/bind/named.conf.local`;
            }

            // Forward zone file
            if (file === '/etc/bind/zones/db.sector7.matrix.net') {
                const hasSOA = content.includes('SOA') || content.includes('IN SOA');
                const hasNS = content.includes('NS');
                const allHosts = ['cell-071', 'cell-088', 'cell-034', 'cell-016', 'cell-049'].every(h => content.includes(h));
                const hasCNAME = content.includes('CNAME') && content.includes('grid-api');
                const hasMX = content.includes('MX') && content.includes('grid-mail');

                if (!hasSOA) return `write: zone file must include a SOA record.`;
                if (!hasNS) return `write: zone file must include an NS record.`;
                if (!allHosts) {
                    const missing = ['cell-071', 'cell-088', 'cell-034', 'cell-016', 'cell-049'].filter(h => !content.includes(h));
                    return `write: missing A records for: ${missing.join(', ')}`;
                }

                engine.config._state.forwardZoneFile = true;
                term.fs['/'].children.etc.children.bind.children.zones.children['db.sector7.matrix.net'] = {
                    type: 'file',
                    content: content + '\n'
                };
                return `Written: /etc/bind/zones/db.sector7.matrix.net${!hasCNAME ? '\nNote: grid-api CNAME not found' : ''}${!hasMX ? '\nNote: MX record not found' : ''}`;
            }

            // Reverse zone file
            if (file === '/etc/bind/zones/db.10.0.1') {
                const hasSOA = content.includes('SOA') || content.includes('IN SOA');
                const allPTRs = ['71', '88', '34', '16', '49', '10'].every(n => content.includes(n));
                const hasPTR = content.includes('PTR');

                if (!hasSOA) return `write: reverse zone file must include a SOA record.`;
                if (!hasPTR) return `write: reverse zone file must include PTR records.`;
                if (!allPTRs) {
                    const missing = ['71', '88', '34', '16', '49', '10'].filter(n => !content.includes(n));
                    return `write: missing PTR records for last octets: ${missing.join(', ')}`;
                }

                engine.config._state.reverseZoneFile = true;
                term.fs['/'].children.etc.children.bind.children.zones.children['db.10.0.1'] = {
                    type: 'file',
                    content: content + '\n'
                };
                return `Written: /etc/bind/zones/db.10.0.1`;
            }

            return `write: ${file}: not a recognized BIND configuration file`;
        },

        // named-checkconf -- validate named.conf syntax
        'named-checkconf': function(args, term, engine) {
            if (!engine.config._state.optionsConfigured) {
                return `/etc/bind/named.conf.options:5: error near 'TODO': unexpected token\nneed to complete listen-on and allow-query in named.conf.options`;
            }
            if (!engine.config._state.forwardZoneDeclared || !engine.config._state.reverseZoneDeclared) {
                return `/etc/bind/named.conf.local: no zone declarations found\nAdd forward zone (sector7.matrix.net) and reverse zone (1.0.10.in-addr.arpa)`;
            }
            return '';  // Empty output means success (matches real named-checkconf behavior)
        },

        // named-checkzone -- validate zone file syntax
        'named-checkzone': function(args, term, engine) {
            const zone = args.find(a => !a.startsWith('-') && !a.includes('/')) || '';
            const file = args.find(a => a.includes('/')) || '';

            if (zone.includes('sector7.matrix.net') || file.includes('db.sector7.matrix.net')) {
                if (!engine.config._state.forwardZoneFile) {
                    return `zone sector7.matrix.net/IN: loading from master file /etc/bind/zones/db.sector7.matrix.net failed: file not found`;
                }
                return `zone sector7.matrix.net/IN: loaded serial 2026041001\nOK`;
            }

            if (zone.includes('1.0.10.in-addr.arpa') || file.includes('db.10.0.1')) {
                if (!engine.config._state.reverseZoneFile) {
                    return `zone 1.0.10.in-addr.arpa/IN: loading from master file /etc/bind/zones/db.10.0.1 failed: file not found`;
                }
                return `zone 1.0.10.in-addr.arpa/IN: loaded serial 2026041001\nOK`;
            }

            return `Usage: named-checkzone <zone-name> <zone-file>\nExample: named-checkzone sector7.matrix.net /etc/bind/zones/db.sector7.matrix.net`;
        },

        // systemctl -- named service management
        'systemctl': function(args, term, engine) {
            const sub = args[0] || '';
            const rawUnit = args[1] || '';
            const unit = rawUnit.replace(/\.service$/, '');

            if (sub === 'status') {
                if (unit === 'named' || unit === 'bind9') {
                    if (engine.config._state.namedRunning) {
                        return `\u25CF named.service - BIND Domain Name Server\n     Loaded: loaded (/lib/systemd/system/named.service; enabled)\n     Active: active (running) since Thu 2026-04-10 09:15:01 UTC; 0min ago\n   Main PID: 1337 (named)\n\nApr 10 09:15:01 cell-ns1 named[1337]: starting BIND 9.18.12\nApr 10 09:15:01 cell-ns1 named[1337]: loading configuration from '/etc/bind/named.conf'\nApr 10 09:15:01 cell-ns1 named[1337]: zone sector7.matrix.net/IN: loaded serial 2026041001\nApr 10 09:15:01 cell-ns1 named[1337]: zone 1.0.10.in-addr.arpa/IN: loaded serial 2026041001\nApr 10 09:15:01 cell-ns1 named[1337]: running`;
                    }
                    return `\u25CF named.service - BIND Domain Name Server\n     Loaded: loaded (/lib/systemd/system/named.service; enabled)\n     Active: inactive (dead) since Thu 2026-04-10 02:00:00 UTC; 7h 15min ago\n\n*** named is not running -- Sector 7 DNS is down ***\n*** Run: systemctl start named ***`;
                }
            }

            if (sub === 'start' || sub === 'restart') {
                if (unit === 'named' || unit === 'bind9') {
                    if (!engine.config._state.optionsConfigured) {
                        return `Job for named.service failed.\nError: /etc/bind/named.conf.options: invalid configuration.\nFix: complete listen-on and allow-query in named.conf.options`;
                    }
                    if (!engine.config._state.forwardZoneDeclared || !engine.config._state.reverseZoneDeclared) {
                        return `Job for named.service failed.\nError: zone declarations missing in named.conf.local.\nAdd both forward (sector7.matrix.net) and reverse (1.0.10.in-addr.arpa) zones.`;
                    }
                    if (!engine.config._state.forwardZoneFile || !engine.config._state.reverseZoneFile) {
                        return `Job for named.service failed.\nError: zone file missing.\n${!engine.config._state.forwardZoneFile ? '/etc/bind/zones/db.sector7.matrix.net: file not found\n' : ''}${!engine.config._state.reverseZoneFile ? '/etc/bind/zones/db.10.0.1: file not found\n' : ''}Create zone files before starting named.`;
                    }
                    engine.config._state.namedRunning = true;
                    return '';
                }
            }

            if (sub === 'reload') {
                if (unit === 'named' || unit === 'bind9') {
                    if (engine.config._state.namedRunning) {
                        return '';
                    }
                    return `named is not running. Use systemctl start named first.`;
                }
            }

            if (sub === 'is-active') {
                if (unit === 'named' || unit === 'bind9') {
                    return engine.config._state.namedRunning ? 'active' : 'inactive';
                }
            }

            return `systemctl: unknown unit or subcommand.\nUsage: systemctl [start|stop|restart|reload|status|is-active] named`;
        },

        // sudo systemctl passthrough
        'sudo': function(args, term, engine) {
            const cmd = args[0] || '';
            const rest = args.slice(1);
            if (cmd === 'systemctl') {
                return term.config.commands['systemctl'].call(term.config.commands, rest, term, engine);
            }
            if (cmd === 'named-checkconf') {
                return term.config.commands['named-checkconf'].call(term.config.commands, rest, term, engine);
            }
            if (cmd === 'named-checkzone') {
                return term.config.commands['named-checkzone'].call(term.config.commands, rest, term, engine);
            }
            if (cmd === 'rndc') {
                const sub = rest[0] || '';
                if (sub === 'reload') {
                    if (!engine.config._state.namedRunning) return `rndc: connect: connection refused\nnamed is not running.`;
                    return ``;
                }
                if (sub === 'status') {
                    if (!engine.config._state.namedRunning) return `rndc: connect: connection refused`;
                    return `version: BIND 9.18.12 (Extended Support Version)\ncpus found: 2\nworker threads: 2\nnumber of zones: 4\ndebug level: 0\nxfers running: 0\nxfers deferred: 0\nsoa queries in progress: 0\nquery logging is OFF\nrecursion available: NO\nserver is up and running`;
                }
                return `Usage: rndc [reload|status|flush]`;
            }
            return `sudo: ${cmd}: not a recognized elevated command for this lab`;
        },

        // dig -- DNS query tool
        'dig': function(args, term, engine) {
            if (!engine.config._state.namedRunning) {
                return `;; connection timed out; no servers could be reached\nnamed is not running on 10.0.1.1.`;
            }

            const axfr = args.includes('AXFR');
            const xFlag = args.includes('-x');
            const shortFlag = args.includes('+short');
            const nsArg = args.find(a => a.startsWith('@')) || '@10.0.1.1';
            const ns = nsArg.replace('@', '');

            // Reverse lookup: dig -x <ip>
            if (xFlag) {
                if (!engine.config._state.reverseZoneFile) {
                    return `;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN\n;; ANSWER SECTION: (empty)\nReverse zone not configured.`;
                }
                const ip = args.find(a => a.match(/^\d+\.\d+\.\d+\.\d+$/)) || '';
                const ptrMap = {
                    '10.0.1.71': 'cell-071.sector7.matrix.net.',
                    '10.0.1.88': 'cell-088.sector7.matrix.net.',
                    '10.0.1.34': 'cell-034.sector7.matrix.net.',
                    '10.0.1.16': 'cell-016.sector7.matrix.net.',
                    '10.0.1.49': 'cell-049.sector7.matrix.net.',
                    '10.0.1.10': 'grid-mail.sector7.matrix.net.'
                };
                if (ip && ptrMap[ip]) {
                    if (shortFlag) return ptrMap[ip];
                    const rev = ip.split('.').reverse().join('.') + '.in-addr.arpa.';
                    return `\n; <<>> DiG 9.18.12 <<>> -x ${ip} @${ns}\n;; ANSWER SECTION:\n${rev.padEnd(40)} 300  IN  PTR  ${ptrMap[ip]}\n\n;; Query time: 1 msec\n;; SERVER: ${ns}#53(${ns})`;
                }
                return `;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN\n;; ANSWER SECTION: (empty)`;
            }

            // AXFR zone transfer
            if (axfr) {
                if (!engine.config._state.forwardZoneFile) {
                    return `;; Transfer failed.\nzone sector7.matrix.net not configured.`;
                }
                if (!engine.config._state.allowTransfer) {
                    return `;; Transfer failed. Reason: REFUSED\nAdd allow-transfer { 10.0.1.2; }; to the zone declaration in named.conf.local.`;
                }
                return `; <<>> DiG 9.18.12 <<>> AXFR sector7.matrix.net @${ns}\n;; ANSWER SECTION:\nsector7.matrix.net.              300  IN  SOA    cell-ns1.sector7.matrix.net. admin.sector7.matrix.net. 2026041001 3600 900 604800 300\nsector7.matrix.net.              300  IN  NS     cell-ns1.sector7.matrix.net.\nsector7.matrix.net.              300  IN  NS     cell-ns2.sector7.matrix.net.\ncell-071.sector7.matrix.net.     300  IN  A      10.0.1.71\ncell-088.sector7.matrix.net.     300  IN  A      10.0.1.88\ncell-034.sector7.matrix.net.     300  IN  A      10.0.1.34\ncell-016.sector7.matrix.net.     300  IN  A      10.0.1.16\ncell-049.sector7.matrix.net.     300  IN  A      10.0.1.49\ngrid-api.sector7.matrix.net.     300  IN  CNAME  cell-071.sector7.matrix.net.\ngrid-mail.sector7.matrix.net.    300  IN  A      10.0.1.10\nsector7.matrix.net.              300  IN  MX  10 grid-mail.sector7.matrix.net.\nsector7.matrix.net.              300  IN  SOA    cell-ns1.sector7.matrix.net. admin.sector7.matrix.net. 2026041001 3600 900 604800 300\n\n;; Query time: 2 msec\n;; SERVER: ${ns}#53(${ns})\n;; XFR size: 12 records`;
            }

            // Forward A/CNAME lookup
            const queryType = ['A', 'AAAA', 'MX', 'NS', 'CNAME', 'PTR', 'SOA', 'TXT'].find(t => args.includes(t)) || 'A';
            const hostname = args.find(a => !a.startsWith('-') && !a.startsWith('@') && !['A', 'AAAA', 'MX', 'NS', 'CNAME', 'PTR', 'SOA', 'TXT', 'AXFR'].includes(a)) || '';

            if (!engine.config._state.forwardZoneFile) {
                return `;; ->>HEADER<<- opcode: QUERY, status: SERVFAIL\n;; ANSWER SECTION: (empty)\nForward zone not configured.`;
            }

            const aRecords = {
                'cell-071.sector7.matrix.net': '10.0.1.71',
                'cell-071.sector7.matrix.net.': '10.0.1.71',
                'cell-088.sector7.matrix.net': '10.0.1.88',
                'cell-088.sector7.matrix.net.': '10.0.1.88',
                'cell-034.sector7.matrix.net': '10.0.1.34',
                'cell-034.sector7.matrix.net.': '10.0.1.34',
                'cell-016.sector7.matrix.net': '10.0.1.16',
                'cell-016.sector7.matrix.net.': '10.0.1.16',
                'cell-049.sector7.matrix.net': '10.0.1.49',
                'cell-049.sector7.matrix.net.': '10.0.1.49',
                'grid-mail.sector7.matrix.net': '10.0.1.10',
                'grid-mail.sector7.matrix.net.': '10.0.1.10'
            };

            if (hostname && aRecords[hostname]) {
                if (shortFlag) return aRecords[hostname];
                return `\n; <<>> DiG 9.18.12 <<>> ${queryType} ${hostname} @${ns}\n;; ANSWER SECTION:\n${hostname.padEnd(40)} 300  IN  A  ${aRecords[hostname]}\n\n;; Query time: 1 msec\n;; SERVER: ${ns}#53(${ns})`;
            }

            if (hostname && (hostname.includes('grid-api'))) {
                if (shortFlag) return '10.0.1.71';
                return `\n; <<>> DiG 9.18.12 <<>> A ${hostname} @${ns}\n;; ANSWER SECTION:\ngrid-api.sector7.matrix.net.     300  IN  CNAME  cell-071.sector7.matrix.net.\ncell-071.sector7.matrix.net.     300  IN  A      10.0.1.71\n\n;; Query time: 1 msec\n;; SERVER: ${ns}#53(${ns})`;
            }

            return `;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN\nUsage: dig [type] <hostname> @<server>\nExample: dig A cell-071.sector7.matrix.net @10.0.1.1`;
        },

        // nslookup -- alternative DNS query tool
        'nslookup': function(args, term, engine) {
            if (!engine.config._state.namedRunning) {
                return `;; connection timed out; no servers could be reached`;
            }
            const host = args[0] || '';
            const server = args[1] || '10.0.1.1';
            if (!host) return `Usage: nslookup <hostname> [server]`;

            const aRecords = {
                'cell-071.sector7.matrix.net': '10.0.1.71',
                'cell-088.sector7.matrix.net': '10.0.1.88',
                'cell-034.sector7.matrix.net': '10.0.1.34',
                'cell-016.sector7.matrix.net': '10.0.1.16',
                'cell-049.sector7.matrix.net': '10.0.1.49',
                'grid-mail.sector7.matrix.net': '10.0.1.10'
            };
            if (engine.config._state.forwardZoneFile && aRecords[host]) {
                return `Server:   ${server}\nAddress:  ${server}#53\n\nName:   ${host}\nAddress: ${aRecords[host]}`;
            }
            return `Server:   ${server}\nAddress:  ${server}#53\n\n** server can\'t find ${host}: NXDOMAIN`;
        },

        // /opt/verify/check-forward.sh -- awards Flag 1
        '/opt/verify/check-forward.sh': function(args, term, engine) {
            if (!engine.config._state.namedRunning) {
                return `[FAIL] named is not running. Start with: systemctl start named`;
            }
            if (!engine.config._state.forwardZoneFile) {
                return `[FAIL] Forward zone file not found.\nCreate: /etc/bind/zones/db.sector7.matrix.net`;
            }
            const hosts = ['cell-071', 'cell-088', 'cell-034', 'cell-016', 'cell-049', 'grid-api', 'grid-mail'];
            const ips = ['10.0.1.71', '10.0.1.88', '10.0.1.34', '10.0.1.16', '10.0.1.49', '10.0.1.71', '10.0.1.10'];
            const lines = hosts.map((h, i) => `[PASS] ${h}.sector7.matrix.net -> ${ips[i]}`);
            engine.awardFlag('flag1');
            return lines.join('\n') + `\nFLAG: FLAG{forward_zone_all_six_hosts_resolve}`;
        },

        // /opt/verify/check-reverse.sh -- awards Flag 2
        '/opt/verify/check-reverse.sh': function(args, term, engine) {
            if (!engine.config._state.namedRunning) {
                return `[FAIL] named is not running.`;
            }
            if (!engine.config._state.reverseZoneFile) {
                return `[FAIL] Reverse zone file not found.\nCreate: /etc/bind/zones/db.10.0.1`;
            }
            const pairs = [
                ['10.0.1.71', 'cell-071.sector7.matrix.net.'],
                ['10.0.1.88', 'cell-088.sector7.matrix.net.'],
                ['10.0.1.34', 'cell-034.sector7.matrix.net.'],
                ['10.0.1.16', 'cell-016.sector7.matrix.net.'],
                ['10.0.1.49', 'cell-049.sector7.matrix.net.'],
                ['10.0.1.10', 'grid-mail.sector7.matrix.net.']
            ];
            const lines = pairs.map(([ip, ptr]) => `[PASS] ${ip} -> ${ptr}`);
            engine.awardFlag('flag2');
            return lines.join('\n') + `\nFLAG: FLAG{reverse_zone_all_six_ptrs_resolve}`;
        },

        // /opt/verify/check-transfer.sh -- awards Flag 3
        '/opt/verify/check-transfer.sh': function(args, term, engine) {
            if (!engine.config._state.namedRunning) {
                return `[FAIL] named is not running.`;
            }
            if (!engine.config._state.forwardZoneFile) {
                return `[FAIL] Forward zone not configured.`;
            }
            if (!engine.config._state.allowTransfer) {
                return `[FAIL] AXFR transfer REFUSED.\nAdd to zone declaration in named.conf.local:\n  allow-transfer { 10.0.1.2; };`;
            }
            engine.awardFlag('flag3');
            return `[PASS] Initiating AXFR from 10.0.1.2...\n[PASS] AXFR transfer succeeded. 12 records transferred.\nFLAG: FLAG{zone_transfer_configured_and_verified}`;
        },

        // ping
        'ping': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] <destination>';
            if (target === '127.0.0.1' || target === 'localhost' || target === '10.0.1.1') {
                return `PING ${target} (${target}) 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.031 ms\n\n--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            if (target.startsWith('10.0.1.')) {
                return `PING ${target} (${target}) 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.8 ms\n\n--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            return `ping: ${target}: Temporary failure in name resolution`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{ala-l07-name-authority_flag1_forward_zone_operati}',
            label: 'Forward Zone Operational',
            description: 'All six hosts and the CNAME resolve from cell-ns1.',
            points: 200,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{ala-l07-name-authority_flag2_reverse_zone_operati}',
            label: 'Reverse Zone Operational',
            description: 'All six PTR records resolve from cell-ns1.',
            points: 200,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{ala-l07-name-authority_flag3_zone_transfer_config}',
            label: 'Zone Transfer Configured',
            description: 'AXFR from secondary (10.0.1.2) succeeds.',
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
            text: 'named-checkconf validates named.conf. named-checkzone validates zone files. Run both before attempting to start BIND. They will tell you exactly what is wrong.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'For zone transfers: the zone declaration in named.conf.local needs allow-transfer { 10.0.1.2; }; The AXFR test will come from 10.0.1.2.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'Trailing dots matter in FQDN targets. grid-api CNAME cell-071 is wrong. grid-api CNAME cell-071.sector7.matrix.net. is correct. PTR records need the same treatment.',
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
            { flagId: 'flag1', objective: '207.1', description: 'Basic DNS server configuration', skill: 'BIND9 named.conf.options, named.conf.local, forward zone file authoring' },
            { flagId: 'flag2', objective: '207.1', description: 'Basic DNS server configuration', skill: 'Reverse zone file, PTR record construction, in-addr.arpa naming' },
            { flagId: 'flag3', objective: '207.2', description: 'Create and maintain DNS zones', skill: 'Zone transfer configuration, allow-transfer, AXFR verification' }
        ]
    }

};
