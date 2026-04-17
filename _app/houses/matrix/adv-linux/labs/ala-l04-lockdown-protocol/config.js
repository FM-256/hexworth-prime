/* ============================================================
   ALA-L04: Lockdown Protocol
   Advanced Linux Administration -- CTF Lab
   iptables rule construction, attack mitigation, traffic verification
   ============================================================ */

const ALAL04Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Lockdown Protocol',
    subtitle: 'Advanced Linux Administration -- iptables Firewall',
    description: 'An active scanning campaign is targeting Cell-088. Configure iptables rules to block SYN floods, UDP reconnaissance, and SSH brute force while keeping SSH management, DNS, HTTPS, and the Grid API accessible.',
    difficulty: 'Intermediate',
    estimatedTime: 35,
    accent: '#22d3ee',
    storageKey: 'hexworth_lab_ala_l04',
    registryId: 'ala-l04-lockdown-protocol',
    trackerKey: 'lab_ala_l04',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-088 BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: eth0 link detected (10.0.0.88/24)',
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
        intro: 'Grid Security has issued a Lockdown Protocol alert for Cell-088. A scanning campaign originating from the outer perimeter has escalated in the last 30 minutes. Three distinct attack patterns have been identified: TCP SYN flooding on port 80, UDP SNMP reconnaissance from subnet 10.0.3.0/24, and SSH brute force attempts. The cell is currently running with default-accept rules. You have 35 minutes to harden the perimeter before the next attack wave.',
        scenario: 'Cell-088 was deployed with no iptables rules -- the firewall table is empty and all chains default to ACCEPT. That is correct for initial provisioning but must be locked down before the cell goes into production. Four services must remain accessible: SSH (port 22) for management, DNS (port 53), HTTPS (port 443) for the grid web interface, and the Grid API (port 8443). Everything else should be dropped. The SYN flood problem requires a state-aware rule. The SSH brute force requires rate limiting.',
        outro: 'Cell-088 perimeter is hardened. The SYN flood is absorbed by the state-based DROP rule on port 80. The UDP SNMP reconnaissance is blocked at the source subnet. The SSH brute force rate is limited to 3 connections per minute. All four legitimate services verified operational. Firewall rules saved to /etc/iptables/rules.v4.'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-088',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to CELL-088\nLast login: Thu Apr 10 11:00:44 2026 from 10.0.0.1\n\n*** LOCKDOWN PROTOCOL ACTIVE ***\n*** Attack campaign in progress -- firewall rules required ***\n*** Reference: ~/intel-brief.txt and ~/allowed-services.txt ***\n\nType \'help\' for available commands.\n'
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
    // FIREWALL STATE
    // Tracks what iptables rules have been added by the student.
    // Each property represents whether a required rule/pattern is present.
    // ═══════════════════════════════════════════════════════

    _fw: {
        // Required for legitimate traffic
        loAccept: false,           // -A INPUT -i lo -j ACCEPT
        establishedAccept: false,  // -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

        // SSH brute force mitigation
        sshRateLimit: false,       // -m limit --limit 3/min on port 22 NEW
        sshRateDrop: false,        // DROP excess NEW SSH connections

        // Attack blocks
        synFloodBlock: false,      // DROP new TCP to port 80
        udpSnmpBlock: false,       // DROP UDP 161:162 from 10.0.3.0/24
        // SSH brute force is handled by sshRateLimit + sshRateDrop

        // Required legitimate service accepts
        httpsAccept: false,        // port 443
        gridApiAccept: false,      // port 8443
        dnsTcpAccept: false,       // TCP 53
        dnsUdpAccept: false,       // UDP 53
        sshAccept: false,          // port 22 (rate-limited accept)

        // Logging and final drop
        logRule: false,            // LOG rule
        finalDrop: false,          // final -j DROP or -P INPUT DROP

        // Rules added (raw list for -L display)
        rules: []
    },

    // Track if firewall.log file has been created with content
    _firewallLogHasEntries: false,

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
                                'intel-brief.txt': {
                                    type: 'file',
                                    content: 'CELL-088 THREAT INTELLIGENCE BRIEF\nIssued: 2026-04-10 11:00 UTC\nClassification: OPERATOR-EYES-ONLY\n\n=== ATTACK PATTERN 1: SYN Flood ===\nTarget: TCP port 80\nMethod: High-frequency TCP SYN packets (no ACK)\nExample header: SYN only, no established state\nMitigation: Drop NEW TCP connections to port 80\n\n=== ATTACK PATTERN 2: UDP Reconnaissance ===\nSource subnet: 10.0.3.0/24\nTarget ports: 161-162 (SNMP)\nMethod: UDP sweep for SNMP community strings\nMitigation: Drop all UDP from 10.0.3.0/24 on ports 161-162\n\n=== ATTACK PATTERN 3: SSH Brute Force ===\nMethod: Repeated new TCP connections to port 22\nRate: > 3 new connections per minute from single source\nMitigation: Rate limit NEW TCP to port 22, drop excess\n\nNote: All three patterns must be blocked simultaneously.\nDo not lock yourself out -- add ESTABLISHED,RELATED rule first.\n'
                                },
                                'allowed-services.txt': {
                                    type: 'file',
                                    content: 'CELL-088 PERMITTED INBOUND SERVICES\n\nService          Port   Protocol   Notes\n-----------------------------------------\nSSH Management   22     TCP        Management access -- rate-limit, do not block\nDNS              53     TCP/UDP    Required for name resolution\nHTTPS            443    TCP        Grid web interface\nGrid API         8443   TCP        Sector 1 API endpoint\n\nAll other inbound traffic should be dropped.\nLogging rule must be present before the final DROP.\nSave rules to /etc/iptables/rules.v4 when complete.\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'iptables -L -n -v\ncat ~/intel-brief.txt\ncat ~/allowed-services.txt\n'
                                },
                                '.ssh': {
                                    type: 'dir',
                                    children: {
                                        'authorized_keys': {
                                            type: 'file',
                                            content: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOperatorKeyCell088GridAccess operator@grid-command\n'
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
                            content: 'cell-088\n'
                        },
                        'iptables': {
                            type: 'dir',
                            children: {
                                // rules.v4 does not exist at start -- student creates it
                            }
                        },
                        'cron.d': {
                            type: 'dir',
                            children: {}
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'verify': {
                            type: 'dir',
                            children: {
                                'test-legitimate.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify legitimate traffic passes through the firewall\n# Tests all four allowed services\nset -e\necho "Testing SSH (port 22)..."\nnc -zv 127.0.0.1 22 && echo "PASS: SSH"\necho "Testing DNS TCP (port 53)..."\nnc -zv 127.0.0.1 53 && echo "PASS: DNS TCP"\necho "Testing DNS UDP (port 53)..."\nnc -uzv 127.0.0.1 53 && echo "PASS: DNS UDP"\necho "Testing HTTPS (port 443)..."\nnc -zv 127.0.0.1 443 && echo "PASS: HTTPS"\necho "Testing Grid API (port 8443)..."\nnc -zv 127.0.0.1 8443 && echo "PASS: Grid API"\necho "All legitimate traffic verified."\n'
                                },
                                'simulate-attacks.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Simulate all three attack patterns\n# BoxEngine verifies rules are in place\necho "Simulating SYN flood on port 80..."\necho "Simulating UDP SNMP scan from 10.0.3.0/24 on ports 161-162..."\necho "Simulating SSH brute force (rate test)..."\necho "Attack simulation complete -- checking rules..."\n'
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
                                'cell-firewall.log': {
                                    type: 'file',
                                    content: '-- Firewall log initialized --\n'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // iptables -- the primary command for this lab
        'iptables': function(args, term, engine) {
            const fw = engine._fw;

            // iptables -L [-n] [-v] -- list rules
            if (args.includes('-L') || args.includes('--list')) {
                if (fw.rules.length === 0) {
                    return `Chain INPUT (policy ACCEPT)\ntarget     prot opt source               destination\n\nChain FORWARD (policy ACCEPT)\ntarget     prot opt source               destination\n\nChain OUTPUT (policy ACCEPT)\ntarget     prot opt source               destination`;
                }
                const ruleLines = fw.rules.map(r => `${r.target.padEnd(10)} ${r.proto.padEnd(5)} ${r.opt.padEnd(4)} ${r.src.padEnd(20)} ${r.dst.padEnd(20)} ${r.details}`);
                return `Chain INPUT (policy ${fw.finalDrop ? 'DROP' : 'ACCEPT'})\ntarget     prot opt source               destination\n${ruleLines.join('\n')}\n\nChain FORWARD (policy ACCEPT)\ntarget     prot opt source               destination\n\nChain OUTPUT (policy ACCEPT)\ntarget     prot opt source               destination`;
            }

            // iptables -F -- flush rules
            if (args.includes('-F') || args.includes('--flush')) {
                const chain = args.find(a => !a.startsWith('-') && ['INPUT','OUTPUT','FORWARD'].includes(a)) || '';
                if (!chain || chain === 'INPUT') {
                    fw.rules = [];
                    Object.keys(fw).forEach(k => { if (typeof fw[k] === 'boolean') fw[k] = false; });
                    return '';
                }
                return '';
            }

            // iptables -P -- set default policy
            if (args.includes('-P') || args.includes('--policy')) {
                const policyIdx = args.indexOf('-P') >= 0 ? args.indexOf('-P') : args.indexOf('--policy');
                const chain = args[policyIdx + 1] || '';
                const policy = args[policyIdx + 2] || '';
                if (chain === 'INPUT' && policy === 'DROP') {
                    fw.finalDrop = true;
                    return '';
                }
                return '';
            }

            // iptables-save pipe
            if (args.includes('-S') || args.includes('--list-rules')) {
                if (fw.rules.length === 0) return `-P INPUT ACCEPT\n-P FORWARD ACCEPT\n-P OUTPUT ACCEPT`;
                const saveLines = fw.rules.map(r => `-A INPUT ${r._raw || ''}`);
                return `-P INPUT ${fw.finalDrop ? 'DROP' : 'ACCEPT'}\n-P FORWARD ACCEPT\n-P OUTPUT ACCEPT\n${saveLines.join('\n')}`;
            }

            // iptables -A INPUT ... -- add rule
            if (!args.includes('-A') && !args.includes('--append')) {
                return `Usage: iptables -A INPUT [match options] -j TARGET\nCommon options:\n  -p tcp/udp/icmp\n  --dport <port> or --dport <from>:<to>\n  -s <source-ip/subnet>\n  -i <interface>\n  -m state --state NEW,ESTABLISHED,RELATED\n  -m limit --limit <rate> --limit-burst <burst>\n  -j ACCEPT/DROP/LOG`;
            }

            // Parse the -A append rule
            const argStr = args.join(' ');
            const chain = args[args.indexOf('-A') + 1] || '';
            if (chain !== 'INPUT') return ''; // Only INPUT rules matter for this lab

            // Determine what this rule does and update state accordingly
            const proto = args.includes('-p') ? args[args.indexOf('-p') + 1] : 'all';
            const dport = args.includes('--dport') ? args[args.indexOf('--dport') + 1] : '';
            const src = args.includes('-s') ? args[args.indexOf('-s') + 1] : '0.0.0.0/0';
            const iface = args.includes('-i') ? args[args.indexOf('-i') + 1] : '';
            const target = args[args.lastIndexOf('-j') + 1] || '';
            const stateArg = args.includes('--state') ? args[args.indexOf('--state') + 1] : '';
            const limitArg = args.includes('--limit') ? args[args.indexOf('--limit') + 1] : '';
            const logPrefix = args.includes('--log-prefix') ? args[args.indexOf('--log-prefix') + 1] : '';

            // Rule record for display
            const ruleRecord = {
                target: target,
                proto: proto === 'all' ? 'all' : proto,
                opt: '--',
                src: src === '0.0.0.0/0' ? '0.0.0.0/0' : src,
                dst: '0.0.0.0/0',
                details: `${dport ? 'dpt:' + dport : ''} ${stateArg ? 'state ' + stateArg : ''} ${limitArg ? 'limit: ' + limitArg : ''}`.trim(),
                _raw: argStr.replace('-A INPUT', '').trim()
            };

            // loopback accept
            if (iface === 'lo' && target === 'ACCEPT') {
                fw.loAccept = true;
            }

            // ESTABLISHED,RELATED accept
            if (stateArg && stateArg.includes('ESTABLISHED') && target === 'ACCEPT') {
                fw.establishedAccept = true;
            }

            // SSH rate-limited accept (port 22, NEW, with limit)
            if (proto === 'tcp' && dport === '22' && stateArg && stateArg.includes('NEW') && limitArg && target === 'ACCEPT') {
                fw.sshAccept = true;
                fw.sshRateLimit = true;
            }

            // SSH excess drop (port 22, NEW, no limit -- the follow-up DROP)
            if (proto === 'tcp' && dport === '22' && stateArg && stateArg.includes('NEW') && !limitArg && target === 'DROP') {
                fw.sshRateDrop = true;
            }

            // SYN flood block: port 80 + NEW + DROP
            if (proto === 'tcp' && dport === '80' && target === 'DROP') {
                fw.synFloodBlock = true;
            }

            // UDP SNMP block: UDP + dport 161 or 161:162 + source 10.0.3.0/24 + DROP
            if (proto === 'udp' && (dport === '161' || dport === '161:162' || dport === '162') && src.includes('10.0.3') && target === 'DROP') {
                fw.udpSnmpBlock = true;
            }

            // HTTPS accept
            if (proto === 'tcp' && dport === '443' && target === 'ACCEPT') {
                fw.httpsAccept = true;
            }

            // Grid API accept
            if (proto === 'tcp' && dport === '8443' && target === 'ACCEPT') {
                fw.gridApiAccept = true;
            }

            // DNS TCP accept
            if (proto === 'tcp' && dport === '53' && target === 'ACCEPT') {
                fw.dnsTcpAccept = true;
            }

            // DNS UDP accept
            if (proto === 'udp' && dport === '53' && target === 'ACCEPT') {
                fw.dnsUdpAccept = true;
            }

            // LOG rule
            if (target === 'LOG') {
                fw.logRule = true;
                // Append to firewall log
                engine._firewallLogHasEntries = true;
                engine.filesystem['/'].children.var.children.log.children['cell-firewall.log'].content +=
                    `Apr 10 11:25:33 cell-088 kernel: [CELL-PERIMETER: ] IN=eth0 OUT= SRC=10.0.3.44 DST=10.0.0.88 PROTO=UDP DPT=161 LEN=78\n` +
                    `Apr 10 11:25:41 cell-088 kernel: [CELL-PERIMETER: ] IN=eth0 OUT= SRC=45.76.99.12 DST=10.0.0.88 PROTO=TCP SPT=62441 DPT=80 FLAGS:S\n`;
            }

            // Final DROP (catch-all)
            if (target === 'DROP' && !proto && !dport && !src && !iface) {
                fw.finalDrop = true;
            }
            if (target === 'DROP' && argStr.match(/-A INPUT -j DROP$/)) {
                fw.finalDrop = true;
            }

            fw.rules.push(ruleRecord);
            return '';
        },

        // iptables-save -- write rules to file
        'iptables-save': function(args, term, engine) {
            const fw = engine._fw;
            const outputArg = args.indexOf('>');
            // Shell redirection is handled as part of the raw command -- check args for path pattern
            const outputFile = args.find(a => a.includes('/etc/iptables') || a.includes('rules.v4')) || '';

            const saveContent = `# Generated by iptables-save v1.8.7 on cell-088\n*filter\n:INPUT ${fw.finalDrop ? 'DROP' : 'ACCEPT'} [0:0]\n:FORWARD ACCEPT [0:0]\n:OUTPUT ACCEPT [0:0]\n${fw.rules.map(r => `-A INPUT ${r._raw || ''}`).join('\n')}\nCOMMIT\n`;

            if (outputFile.includes('rules.v4') || outputFile.includes('/etc/iptables')) {
                engine.filesystem['/'].children.etc.children.iptables.children['rules.v4'] = {
                    type: 'file',
                    content: saveContent
                };
                return '';
            }

            return saveContent;
        },

        // bash/sh -- run the verify scripts
        'bash': function(args, term, engine) {
            const script = args[0] || '';
            return engine._runVerifyScript(script, engine);
        },

        'sh': function(args, term, engine) {
            const script = args[0] || '';
            return engine._runVerifyScript(script, engine);
        },

        './test-legitimate.sh': function(args, term, engine) {
            return engine._runVerifyScript('./test-legitimate.sh', engine);
        },

        './simulate-attacks.sh': function(args, term, engine) {
            return engine._runVerifyScript('./simulate-attacks.sh', engine);
        },

        // iptables-restore -- restore rules from file
        'iptables-restore': function(args, term, engine) {
            const file = args.find(a => a.includes('/etc/iptables')) || '';
            if (!engine.filesystem['/'].children.etc.children.iptables.children['rules.v4']) {
                return `iptables-restore: ${file || '/etc/iptables/rules.v4'}: No such file or directory`;
            }
            return '';
        },

        // ip command -- basic interface info
        'ip': function(args, term, engine) {
            const sub = args[0] || '';
            if (sub === 'addr' || sub === 'address' || sub === 'link') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP\n    inet 10.0.0.88/24 brd 10.0.0.255 scope global eth0`;
            }
            return `Usage: ip [address|link|route]`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // VERIFY SCRIPT RUNNER
    // ═══════════════════════════════════════════════════════

    _runVerifyScript: function(script, engine) {
        const fw = engine._fw;
        const scriptName = script.replace(/^.*\//, '');

        if (scriptName === 'simulate-attacks.sh') {
            const results = [];
            results.push('Simulating SYN flood on port 80...');
            if (fw.synFloodBlock) {
                results.push('  [BLOCKED] SYN flood on port 80 -- rule matched, packets dropped.');
            } else {
                results.push('  [FAIL] SYN flood on port 80 -- NOT blocked. Add: iptables -A INPUT -p tcp --dport 80 -m state --state NEW -j DROP');
            }

            results.push('Simulating UDP SNMP scan from 10.0.3.0/24 on ports 161-162...');
            if (fw.udpSnmpBlock) {
                results.push('  [BLOCKED] UDP scan from 10.0.3.0/24 -- rule matched, packets dropped.');
            } else {
                results.push('  [FAIL] UDP scan NOT blocked. Add: iptables -A INPUT -p udp --dport 161:162 -s 10.0.3.0/24 -j DROP');
            }

            results.push('Simulating SSH brute force (rate test)...');
            if (fw.sshRateLimit && fw.sshRateDrop) {
                results.push('  [BLOCKED] SSH brute force -- rate limited to 3/min, excess connections dropped.');
            } else if (fw.sshRateLimit && !fw.sshRateDrop) {
                results.push('  [PARTIAL] SSH rate limit rule present but no DROP rule for excess connections.');
                results.push('  Add: iptables -A INPUT -p tcp --dport 22 -m state --state NEW -j DROP');
            } else {
                results.push('  [FAIL] SSH brute force NOT rate-limited. Add rate-limit rule first, then drop excess.');
            }

            const allBlocked = fw.synFloodBlock && fw.udpSnmpBlock && fw.sshRateLimit && fw.sshRateDrop;
            results.push('');
            if (allBlocked) {
                engine.awardFlag('flag1');
                results.push('[GRID SECURITY] All attack patterns BLOCKED. FLAG 1 awarded.');
            } else {
                results.push('[GRID SECURITY] Attack simulation incomplete. Fix failing rules and re-run.');
            }
            return results.join('\n');
        }

        if (scriptName === 'test-legitimate.sh') {
            const results = [];

            // Check that ESTABLISHED,RELATED accept is present -- fundamental for all traffic
            if (!fw.establishedAccept) {
                return `[FAIL] No ESTABLISHED,RELATED rule found.\nAll existing connections will break when you apply a final DROP policy.\nAdd FIRST: iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT`;
            }

            const sshOk = fw.sshAccept || fw.sshRateLimit;
            const dnsOk = fw.dnsTcpAccept && fw.dnsUdpAccept;
            const httpsOk = fw.httpsAccept;
            const apiOk = fw.gridApiAccept;

            results.push('Testing SSH (port 22)...');
            results.push(sshOk ? '  PASS: SSH' : '  FAIL: SSH -- add iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m limit --limit 3/min -j ACCEPT');

            results.push('Testing DNS TCP (port 53)...');
            results.push(fw.dnsTcpAccept ? '  PASS: DNS TCP' : '  FAIL: DNS TCP -- add iptables -A INPUT -p tcp --dport 53 -j ACCEPT');

            results.push('Testing DNS UDP (port 53)...');
            results.push(fw.dnsUdpAccept ? '  PASS: DNS UDP' : '  FAIL: DNS UDP -- add iptables -A INPUT -p udp --dport 53 -j ACCEPT');

            results.push('Testing HTTPS (port 443)...');
            results.push(httpsOk ? '  PASS: HTTPS' : '  FAIL: HTTPS -- add iptables -A INPUT -p tcp --dport 443 -j ACCEPT');

            results.push('Testing Grid API (port 8443)...');
            results.push(apiOk ? '  PASS: Grid API' : '  FAIL: Grid API -- add iptables -A INPUT -p tcp --dport 8443 -j ACCEPT');

            const allPass = sshOk && dnsOk && httpsOk && apiOk;
            const logPresent = fw.logRule && engine._firewallLogHasEntries;

            results.push('');
            results.push('Checking firewall log entries...');
            results.push(logPresent ? '  PASS: /var/log/cell-firewall.log has DROP log entries' : '  FAIL: No LOG rule present. Add before final DROP: iptables -A INPUT -j LOG --log-prefix "CELL-PERIMETER: " --log-level 4');

            results.push('');
            if (allPass && logPresent) {
                engine.awardFlag('flag2');
                results.push('[GRID SECURITY] All legitimate services verified. Firewall log confirmed. FLAG 2 awarded.');
                results.push('Remember to save your rules: iptables-save > /etc/iptables/rules.v4');
            } else {
                results.push('[GRID SECURITY] Verification incomplete. Fix failing checks and re-run.');
            }
            return results.join('\n');
        }

        return `bash: ${script}: No such file or directory`;
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{ala-l04-lockdown-protocol_flag1_all_attack_patterns_}',
            label: 'All Attack Patterns Blocked',
            description: 'SYN flood on port 80, UDP SNMP scan from 10.0.3.0/24, and SSH brute force are all blocked by iptables rules.',
            points: 200,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{ala-l04-lockdown-protocol_flag2_legitimate_traffic_v}',
            label: 'Legitimate Traffic Verified',
            description: 'SSH, DNS, HTTPS, and Grid API all pass through the firewall and at least one DROP entry appears in /var/log/cell-firewall.log.',
            points: 200,
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
        timeBonusThreshold: 2100
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Set your default policy to DROP only AFTER adding an ESTABLISHED,RELATED rule -- otherwise your own SSH session will drop. Always add: iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT before anything else.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'Rate limiting in iptables uses the -m limit extension. The pattern is: iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m limit --limit 3/min --limit-burst 3 -j ACCEPT followed by iptables -A INPUT -p tcp --dport 22 -m state --state NEW -j DROP',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'After all rules are in place, save them: iptables-save > /etc/iptables/rules.v4. Also add a LOG rule before the final DROP so the firewall log gets entries: iptables -A INPUT -j LOG --log-prefix "CELL-PERIMETER: " --log-level 4',
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
            { flagId: 'flag1', objective: '212.1', description: 'Configuring a router', skill: 'iptables stateful packet filtering, SYN flood mitigation, rate limiting' },
            { flagId: 'flag1', objective: '212.2', description: 'Managing FTP servers', skill: 'UDP source-subnet blocking with iptables' },
            { flagId: 'flag2', objective: '212.3', description: 'Secure shell (SSH)', skill: 'iptables LOG target and firewall rule verification' }
        ]
    }

};
