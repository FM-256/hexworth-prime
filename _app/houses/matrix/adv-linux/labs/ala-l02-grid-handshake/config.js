/* ============================================================
   ALA-L02: Grid Handshake
   Advanced Linux Administration -- CTF Lab
   Network routing, MTU diagnosis, multi-node connectivity
   ============================================================ */

const ALAL02Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Grid Handshake',
    subtitle: 'Advanced Linux Administration -- Network Routing',
    description: 'Cell-049 must establish authenticated connections to three grid nodes. Alpha connects immediately. Bravo needs a missing route. Charlie has an MTU mismatch that silently drops large packets.',
    difficulty: 'Intermediate',
    estimatedTime: 35,
    accent: '#22d3ee',
    storageKey: 'hexworth_lab_ala_l02',
    registryId: 'ala-l02-grid-handshake',
    shellChaining: true,   // enable real-shell A && B chaining (walkthroughs use it)
    trackerKey: 'lab_ala_l02',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-049 BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: eth0 link detected (10.0.0.49/24)',
            'Network: eth1 link detected (10.0.1.49/24)',
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
        intro: 'Grid Command has tasked Cell-049 with establishing authenticated handshakes to three nodes: Alpha (Sector 1), Bravo (Sector 2), and Charlie (Outer Grid). The previous operator left notes saying Alpha is fine and Bravo needed a route. Charlie was unresolved -- something weird with large packets. You have 35 minutes before the next sync window closes.',
        scenario: 'Cell-049 was provisioned with only the Sector 1 routes. Bravo is on a different subnet with no route entry. Charlie sits behind a path segment that only supports 1450-byte frames, creating a silent drop condition for any packet above that MTU when the DF (Don\'t Fragment) bit is set -- which is standard behavior for most applications. Both problems are common in real grid expansion scenarios.',
        outro: 'All three nodes confirmed. Alpha, Bravo, and Charlie are in the handshake registry. Grid Command acknowledges Cell-049 as fully meshed. The outer grid connection to Charlie unlocks access to 12 additional monitoring endpoints.'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-049',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to CELL-049\nLast login: Thu Apr 10 08:00:11 2026 from 10.0.0.1\n\n*** TASK: Establish handshake to Alpha, Bravo, and Charlie ***\n*** Scripts in /opt/verify/ -- run check-alpha.sh first ***\n\nType \'help\' for available commands.\n'
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
    // INTERNAL STATE
    // ═══════════════════════════════════════════════════════

    // Network state: which routes exist and what MTU is set
    _netState: {
        routes: {
            'default': { via: '10.0.0.1', dev: 'eth0', src: '10.0.0.49' },
            '10.0.0.0/24': { dev: 'eth0', src: '10.0.0.49' },
            '10.0.1.0/24': { dev: 'eth1', src: '10.0.1.49' }
            // 10.0.2.0/24 and 172.16.0.0/16 must be added by the student
        },
        mtu: {
            eth0: 1500,
            eth1: 1500   // Must be changed to 1450 for Charlie
        }
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
                                'grid-topology.txt': {
                                    type: 'file',
                                    content: 'Grid Node Topology -- Cell-049\n\nAlpha: 10.0.1.0/24  (Sector 1 -- gateway 10.0.1.1)\nBravo: 10.0.2.0/24  (Sector 2 -- gateway 10.0.2.1)\nCharlie: 172.16.0.0/16 (Outer Grid -- gateway 172.16.0.1)\n\nVerification endpoints:\n  Alpha:   10.0.1.1  and  10.0.1.50\n  Bravo:   10.0.2.1  and  10.0.2.50\n  Charlie: 172.16.0.1 and 172.16.0.100\n\nNote: Each node requires a dedicated verify script in /opt/verify/\n'
                                },
                                'handshake-log.txt': {
                                    type: 'file',
                                    content: 'Previous operator notes:\n\nAlpha: OK. Connected on first attempt. No issues.\nBravo: Needed a route. ip route add 10.0.2.0/24 via 10.0.1.1 worked.\nCharlie: Something weird with large packets. Small pings work fine.\n         Bigger ones get dropped. Did not have time to fix it.\n         Path goes through a tunnel segment -- might be MTU.\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ip route show\nping -c2 10.0.1.1\n./check-alpha.sh\nip route show\nping -c2 10.0.2.1\n'
                                },
                                '.ssh': {
                                    type: 'dir',
                                    children: {
                                        'authorized_keys': {
                                            type: 'file',
                                            content: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOperatorKeyCell049GridAccess operator@grid-command\n'
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
                            content: 'cell-049\n'
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1   localhost\n127.0.1.1   cell-049\n10.0.1.1    alpha-gateway\n10.0.2.1    bravo-gateway\n172.16.0.1  charlie-gateway\n'
                        },
                        'netplan': {
                            type: 'dir',
                            children: {
                                '00-installer-config.yaml': {
                                    type: 'file',
                                    content: 'network:\n  version: 2\n  renderer: networkd\n  ethernets:\n    eth0:\n      dhcp4: true\n    eth1:\n      addresses:\n        - 10.0.1.49/24\n      nameservers:\n        addresses: [10.0.1.1]\n  # Additional routes must be added here for persistence\n  # Example:\n  # routes:\n  #   - to: 10.0.2.0/24\n  #     via: 10.0.1.1\n'
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
                                'check-alpha.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify Alpha node connectivity\n# Alpha is on 10.0.1.0/24, always reachable from cell-049\necho "Testing Alpha node (10.0.1.1)..."\nping -c2 10.0.1.1\necho "Testing Alpha endpoint (10.0.1.50)..."\nping -c2 10.0.1.50\necho "Alpha handshake: VERIFIED"\necho "FLAG 1 awarded"\n'
                                },
                                'check-bravo.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify Bravo node connectivity\n# Bravo is on 10.0.2.0/24 -- requires route via 10.0.1.1\necho "Testing Bravo gateway (10.0.2.1)..."\nping -c2 10.0.2.1\necho "Testing Bravo endpoint (10.0.2.50)..."\nping -c2 10.0.2.50\necho "Bravo handshake: VERIFIED"\necho "FLAG 2 awarded"\n'
                                },
                                'check-charlie.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verify Charlie node connectivity\n# Charlie is on 172.16.0.0/16 -- requires route AND MTU fix\n# Sends a 1450-byte payload -- will fail if MTU > 1450 with DF bit set\necho "Testing Charlie gateway (172.16.0.1)..."\nping -c2 172.16.0.1\necho "Sending 1450-byte payload to 172.16.0.100..."\nping -c2 -M do -s 1422 172.16.0.100\necho "Charlie handshake: VERIFIED"\necho "FLAG 3 awarded"\n'
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
                                'cell-ops': {
                                    type: 'dir',
                                    children: {
                                        'handshake.log': {
                                            type: 'file',
                                            content: '-- Handshake log initialized at shift start --\n'
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
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // sudo -- prefix stripper that re-dispatches to the underlying command.
        // Mirrors the working handler in ala-l01. Terminal.js has a hostile
        // built-in case 'sudo' (~line 277) that prints "Sorry, try again." for
        // any sudo command unless a custom handler intercepts it first. ALL
        // branches MUST return a string (empty string OK) -- never null. Every
        // "Run: sudo ip ..." hint and error message in this lab relies on this.
        'sudo': function(args, term, engine) {
            if (args.length === 0) return 'usage: sudo <command> [args...]';
            if (args[0] === '-v') return '';
            if (args[0] === 'sudo') return 'sudo: sudo: command not found';
            const realCmd = args[0];
            const realArgs = args.slice(1);
            const handler = engine.config.commands[realCmd];
            if (typeof handler === 'function') {
                const result = handler(realArgs, term, engine);
                return result == null ? '' : result;
            }
            return `sudo: ${realCmd}: command not found`;
        },

        // ip command -- route management and interface MTU changes
        'ip': function(args, term, engine) {
            const sub = args[0] || '';
            const obj = args[1] || '';
            const action = args[2] || '';

            if (sub === 'link' && obj === 'show') {
                const mtuEth1 = engine.config._netState.mtu.eth1;
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu ${engine.config._netState.mtu.eth0} qdisc fq_codel state UP\n    link/ether 52:54:00:ab:22:01 brd ff:ff:ff:ff:ff:ff\n3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu ${mtuEth1} qdisc fq_codel state UP\n    link/ether 52:54:00:ab:22:02 brd ff:ff:ff:ff:ff:ff`;
            }

            if (sub === 'link' && obj === 'set') {
                // Accept both `ip link set eth1 mtu N` and the canonical
                // `ip link set dev eth1 mtu N` (explicit `dev` keyword form).
                const iface = action === 'dev' ? (args[3] || '') : action;
                const mtuFlag = args.indexOf('mtu');
                if (mtuFlag >= 0) {
                    const newMtu = parseInt(args[mtuFlag + 1]);
                    if (iface === 'eth1' && !isNaN(newMtu)) {
                        engine.config._netState.mtu.eth1 = newMtu;
                        return '';
                    }
                }
                return `RTNETLINK answers: Operation not permitted`;
            }

            if (sub === 'addr' || sub === 'address') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu ${engine.config._netState.mtu.eth0}\n    inet 10.0.0.49/24 brd 10.0.0.255 scope global eth0\n3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu ${engine.config._netState.mtu.eth1}\n    inet 10.0.1.49/24 brd 10.0.1.255 scope global eth1`;
            }

            if (sub === 'route') {
                const routeAction = obj;

                if (routeAction === 'show' || routeAction === '') {
                    const routes = engine.config._netState.routes;
                    let lines = [];
                    for (const [net, r] of Object.entries(routes)) {
                        if (net === 'default') {
                            lines.push(`default via ${r.via} dev ${r.dev} proto dhcp src ${r.src} metric 100`);
                        } else {
                            lines.push(`${net} dev ${r.dev} proto ${r.proto || 'kernel'} scope link src ${r.src}`);
                        }
                    }
                    return lines.join('\n') || '(no routes)';
                }

                if (routeAction === 'add') {
                    // ip route add <net> via <gw> [dev <dev>]
                    const net = args[2] || '';
                    const viaIdx = args.indexOf('via');
                    const gw = viaIdx >= 0 ? args[viaIdx + 1] : '';
                    const devIdx = args.indexOf('dev');
                    const dev = devIdx >= 0 ? args[devIdx + 1] : 'eth1';

                    if (!net || !gw) return 'Usage: ip route add <network/prefix> via <gateway>';

                    // Validate -- gateway must be reachable from existing routes
                    if (gw.startsWith('10.0.1.') && engine.config._netState.routes['10.0.1.0/24']) {
                        engine.config._netState.routes[net] = { via: gw, dev: dev, src: '10.0.1.49' };
                        return '';
                    }
                    if (gw.startsWith('172.16.') && engine.config._netState.routes['172.16.0.0/16']) {
                        engine.config._netState.routes[net] = { via: gw, dev: dev, src: '10.0.1.49' };
                        return '';
                    }
                    if (gw.startsWith('10.0.2.')) {
                        return `RTNETLINK answers: Network is unreachable\nNo route to ${gw} -- you need a path to 10.0.2.x first.`;
                    }
                    if (gw.startsWith('172.16.') && !engine.config._netState.routes['172.16.0.0/16']) {
                        // Adding the Charlie route for the first time
                        engine.config._netState.routes[net] = { via: gw, dev: dev, src: '10.0.1.49' };
                        return '';
                    }

                    engine.config._netState.routes[net] = { via: gw, dev: dev, src: '10.0.1.49' };
                    return '';
                }

                if (routeAction === 'del' || routeAction === 'delete') {
                    const net = args[2] || '';
                    if (engine.config._netState.routes[net]) {
                        delete engine.config._netState.routes[net];
                        return '';
                    }
                    return `RTNETLINK answers: No such process`;
                }
            }

            return `Usage: ip [OPTION] OBJECT COMMAND\nOBJECTS: address, link, route\nExamples:\n  ip link show\n  ip link set eth1 mtu 1450\n  ip route show\n  ip route add 10.0.2.0/24 via 10.0.1.1\n  ip route add 172.16.0.0/16 via 172.16.0.1`;
        },

        // ping -- test connectivity with MTU/DF awareness
        'ping': function(args, term, engine) {
            // Destination is the first positional arg. Skip flags AND their values
            // (e.g. `-M do`, `-s 1472`, `-c 4`) so `ping -M do -s 1472 172.16.0.1`
            // targets the IP, not the flag value "do".
            const VALUE_FLAGS = new Set(['-s', '-c', '-W', '-M', '-i', '-t']);
            let target = '';
            for (let i = 0; i < args.length; i++) {
                if (args[i].startsWith('-')) { if (VALUE_FLAGS.has(args[i])) i++; continue; }
                target = args[i]; break;
            }
            const sizeIdx = args.indexOf('-s');
            const pktSize = sizeIdx >= 0 ? parseInt(args[sizeIdx + 1]) : 56;
            const dfFlag = args.includes('-M') && args[args.indexOf('-M') + 1] === 'do';
            const count = args.indexOf('-c') >= 0 ? parseInt(args[args.indexOf('-c') + 1]) : 4;
            const waitIdx = args.indexOf('-W');

            if (!target) return 'Usage: ping [-c count] [-s size] [-M do] <destination>';

            // Helper to check reachability based on routing table
            const hasRoute = (ip) => {
                if (ip.startsWith('10.0.1.') || ip === '10.0.1.1' || ip === 'alpha-gateway') return true;
                if ((ip.startsWith('10.0.2.') || ip === '10.0.2.1' || ip === 'bravo-gateway') &&
                    engine.config._netState.routes['10.0.2.0/24']) return true;
                if ((ip.startsWith('172.16.') || ip === 'charlie-gateway') &&
                    engine.config._netState.routes['172.16.0.0/16']) return true;
                return false;
            };

            // Resolve hostname aliases from /etc/hosts
            const resolveHost = (h) => {
                const map = { 'alpha-gateway': '10.0.1.1', 'bravo-gateway': '10.0.2.1', 'charlie-gateway': '172.16.0.1' };
                return map[h] || h;
            };
            const resolvedTarget = resolveHost(target);

            if (resolvedTarget === '127.0.0.1' || resolvedTarget === 'localhost') {
                return `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.031 ms\n\n--- 127.0.0.1 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }

            if (!hasRoute(resolvedTarget)) {
                return `PING ${resolvedTarget} (${resolvedTarget}) 56(84) bytes of data.\nFrom 10.0.1.49 icmp_seq=1 Destination Net Unreachable\n\n--- ${resolvedTarget} ping statistics ---\n1 packets transmitted, 0 received, +1 errors, 100% packet loss\n\nNo route to host. Use: ip route show to see current routing table.`;
            }

            // MTU check for charlie path (172.16.x.x) -- path supports max 1450
            if (resolvedTarget.startsWith('172.16.')) {
                const effectiveMtu = engine.config._netState.mtu.eth1;
                // Total packet size including IP+ICMP headers: pktSize + 28
                const totalPktSize = pktSize + 28;
                // Path MTU is 1450 regardless of interface MTU -- simulates tunnel constraint
                const pathMtu = 1450;

                if (dfFlag && totalPktSize > pathMtu) {
                    return `PING ${resolvedTarget} (${resolvedTarget}) ${pktSize}(${totalPktSize}) bytes of data.\nFrom 172.16.0.1 icmp_seq=1 Frag needed and DF set (mtu = ${pathMtu})\n\n--- ${resolvedTarget} ping statistics ---\n1 packets transmitted, 0 received, +1 errors, 100% packet loss, time 0ms\n\nMTU mismatch: path supports ${pathMtu} bytes, you are sending ${totalPktSize}.\nFix: sudo ip link set eth1 mtu 1450`;
                }

                if (!dfFlag && totalPktSize > pathMtu) {
                    // Without DF, packets fragment silently -- partial response
                    return `PING ${resolvedTarget} (${resolvedTarget}) ${pktSize}(${totalPktSize}) bytes of data.\n64 bytes from ${resolvedTarget}: icmp_seq=1 ttl=62 time=4.2 ms (fragmented)\n\n--- ${resolvedTarget} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss\nNote: packet fragmented -- underlying MTU mismatch present`;
                }

                // Within MTU -- success
                return `PING ${resolvedTarget} (${resolvedTarget}) ${pktSize}(${totalPktSize}) bytes of data.\n64 bytes from ${resolvedTarget}: icmp_seq=1 ttl=62 time=4.2 ms\n64 bytes from ${resolvedTarget}: icmp_seq=2 ttl=62 time=4.1 ms\n\n--- ${resolvedTarget} ping statistics ---\n${count} packets transmitted, ${count} received, 0% packet loss`;
            }

            // Standard reachable host
            const ttl = resolvedTarget.startsWith('10.0.1.') ? 64 : 63;
            const time = resolvedTarget.startsWith('10.0.1.') ? '1.2' : '2.4';
            return `PING ${resolvedTarget} (${resolvedTarget}) ${pktSize}(${pktSize + 28}) bytes of data.\n64 bytes from ${resolvedTarget}: icmp_seq=1 ttl=${ttl} time=${time} ms\n64 bytes from ${resolvedTarget}: icmp_seq=2 ttl=${ttl} time=${time} ms\n\n--- ${resolvedTarget} ping statistics ---\n${count} packets transmitted, ${count} received, 0% packet loss`;
        },

        // bash -- execute shell scripts
        'bash': function(args, term, engine) {
            const script = args[0] || '';
            // Delegate to the script runner below
            return engine.config._runScript(script, args.slice(1), term, engine);
        },

        // Direct script execution: ./check-alpha.sh etc.
        './check-alpha.sh': function(args, term, engine) {
            return engine.config._runCheckScript('alpha', term, engine);
        },

        './check-bravo.sh': function(args, term, engine) {
            return engine.config._runCheckScript('bravo', term, engine);
        },

        './check-charlie.sh': function(args, term, engine) {
            return engine.config._runCheckScript('charlie', term, engine);
        },

        'sh': function(args, term, engine) {
            const script = args[0] || '';
            return engine.config._runScript(script, args.slice(1), term, engine);
        }
    },

    // ═══════════════════════════════════════════════════════
    // SCRIPT RUNNER HELPER (called by bash/sh commands)
    // ═══════════════════════════════════════════════════════

    _runScript: function(script, args, term, engine) {
        const scriptName = script.replace(/^.*\//, '');
        if (scriptName === 'check-alpha.sh') return engine.config._runCheckScript('alpha', term, engine);
        if (scriptName === 'check-bravo.sh') return engine.config._runCheckScript('bravo', term, engine);
        if (scriptName === 'check-charlie.sh') return engine.config._runCheckScript('charlie', term, engine);
        return `bash: ${script}: No such file or directory`;
    },

    _runCheckScript: function(node, term, engine) {
        if (node === 'alpha') {
            // Alpha is always reachable
            engine.awardFlag('flag1');
            return `Testing Alpha node (10.0.1.1)...\n64 bytes from 10.0.1.1: icmp_seq=1 ttl=64 time=1.2 ms\n64 bytes from 10.0.1.1: icmp_seq=2 ttl=64 time=1.1 ms\nTesting Alpha endpoint (10.0.1.50)...\n64 bytes from 10.0.1.50: icmp_seq=1 ttl=64 time=1.3 ms\n64 bytes from 10.0.1.50: icmp_seq=2 ttl=64 time=1.4 ms\nAlpha handshake: VERIFIED\n[GRID COMMAND] FLAG 1 awarded -- Alpha confirmed.`;
        }

        if (node === 'bravo') {
            if (!engine.config._netState.routes['10.0.2.0/24']) {
                return `Testing Bravo gateway (10.0.2.1)...\nFrom 10.0.1.49 icmp_seq=1 Destination Net Unreachable\n\nBravo handshake: FAILED\nNo route to 10.0.2.0/24. Add it:\n  sudo ip route add 10.0.2.0/24 via 10.0.1.1`;
            }
            engine.awardFlag('flag2');
            return `Testing Bravo gateway (10.0.2.1)...\n64 bytes from 10.0.2.1: icmp_seq=1 ttl=63 time=2.4 ms\n64 bytes from 10.0.2.1: icmp_seq=2 ttl=63 time=2.3 ms\nTesting Bravo endpoint (10.0.2.50)...\n64 bytes from 10.0.2.50: icmp_seq=1 ttl=63 time=2.5 ms\n64 bytes from 10.0.2.50: icmp_seq=2 ttl=63 time=2.6 ms\nBravo handshake: VERIFIED\n[GRID COMMAND] FLAG 2 awarded -- Bravo confirmed.`;
        }

        if (node === 'charlie') {
            if (!engine.config._netState.routes['172.16.0.0/16']) {
                return `Testing Charlie gateway (172.16.0.1)...\nFrom 10.0.1.49 icmp_seq=1 Destination Net Unreachable\n\nCharlie handshake: FAILED\nNo route to 172.16.0.0/16. Add it:\n  sudo ip route add 172.16.0.0/16 via 172.16.0.1`;
            }
            if (engine.config._netState.mtu.eth1 > 1450) {
                return `Testing Charlie gateway (172.16.0.1)...\n64 bytes from 172.16.0.1: icmp_seq=1 ttl=62 time=4.2 ms\nSending 1450-byte payload to 172.16.0.100...\nFrom 172.16.0.1 icmp_seq=1 Frag needed and DF set (mtu = 1450)\n\nCharlie handshake: FAILED\nMTU mismatch detected. Path MTU is 1450 but eth1 is set to ${engine.config._netState.mtu.eth1}.\nFix: sudo ip link set eth1 mtu 1450\nThen re-run this script.`;
            }
            engine.awardFlag('flag3');
            return `Testing Charlie gateway (172.16.0.1)...\n64 bytes from 172.16.0.1: icmp_seq=1 ttl=62 time=4.2 ms\n64 bytes from 172.16.0.1: icmp_seq=2 ttl=62 time=4.1 ms\nSending 1450-byte payload to 172.16.0.100...\n64 bytes from 172.16.0.100: icmp_seq=1 ttl=62 time=4.3 ms\n64 bytes from 172.16.0.100: icmp_seq=2 ttl=62 time=4.2 ms\nCharlie handshake: VERIFIED\n[GRID COMMAND] FLAG 3 awarded -- Charlie confirmed. Outer grid connected.`;
        }

        return 'Unknown script.';
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{ala-l02-grid-handshake_flag1_alpha_connected}',
            label: 'Alpha Connected',
            description: 'Verified Alpha node connectivity via check-alpha.sh.',
            points: 100,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{ala-l02-grid-handshake_flag2_bravo_connected}',
            label: 'Bravo Connected',
            description: 'Added missing route to 10.0.2.0/24 and verified Bravo connectivity.',
            points: 150,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{ala-l02-grid-handshake_flag3_charlie_connected}',
            label: 'Charlie Connected',
            description: 'Fixed MTU mismatch on eth1 and added route to 172.16.0.0/16.',
            points: 250,
            autoCheck: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 500,
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
            text: 'Use ip route show to see what networks cell-049 can currently reach. Compare against the node addresses in ~/grid-topology.txt. Notice anything missing?',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'Node Bravo is on 10.0.2.0/24. Your cell\'s routing table has no entry for that network. Add it with: sudo ip route add 10.0.2.0/24 via 10.0.1.1',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'For Charlie: try ping -M do -s 1472 172.16.0.1 then try the same with -s 1400. When the larger one fails with "Frag needed and DF set", the displayed mtu value tells you the path limit. Set eth1 to match: sudo ip link set eth1 mtu 1450',
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
            { flagId: 'flag2', objective: '109.2', description: 'Basic network configuration', skill: 'Static route management with ip route' },
            { flagId: 'flag3', objective: '109.3', description: 'Basic network troubleshooting', skill: 'MTU discovery and path MTU diagnosis with ping DF' },
            { flagId: 'flag3', objective: '109.4', description: 'Configure client side DNS', skill: 'Network topology and inter-subnet routing' }
        ]
    }

};
