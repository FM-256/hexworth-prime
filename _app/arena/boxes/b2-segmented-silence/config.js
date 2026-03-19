/* ============================================================
   CTF ARENA — Box B2: The Segmented Silence
   Network Troubleshooting | Routing & Firewall
   Config: multi-host network, iptables, flags, hints, lore
   ============================================================ */

const B2Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Segmented Silence',
    subtitle: 'Network Troubleshooting — Routing & Firewall',
    difficulty: 'Intermediate',
    accent: '#3b82f6',
    storageKey: 'hexworth_ctf_b2',
    registryId: 'b2-segmented-silence',
    trackerKey: 'ctf_b2',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Network troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Network Assessment',
            icon: '\uD83D\uDD0D',
            description: 'Test connectivity between RELAY-EAST, RELAY-WEST, and HUB-COMM-01. Identify which paths are broken.',
            requiredFlags: [],
            mitre: ['T1046', 'T1018'],
            unlocks: ['diagnosis'],
            locked: false
        },
        {
            id: 'diagnosis',
            name: 'Route & Firewall Analysis',
            icon: '\uD83D\uDEE1\uFE0F',
            description: 'Inspect routing tables, firewall rules, and network configs on all hosts to find the misconfiguration.',
            requiredFlags: [],
            mitre: ['T1016', 'T1049'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Network Repair',
            icon: '\uD83D\uDD27',
            description: 'Remove the offending firewall rule or fix the routing entry to restore connectivity.',
            requiredFlags: ['user'],
            mitre: ['T1562.004', 'T1599'],
            unlocks: ['verification'],
            locked: true
        },
        {
            id: 'verification',
            name: 'Verification',
            icon: '\u2705',
            description: 'Verify end-to-end connectivity and retrieve the verification token from HUB-COMM-01.',
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
                title: 'Test connectivity from RELAY-EAST',
                tip: 'Run: ping 10.0.3.10 to test the path to HUB-COMM-01. Compare with ping 10.0.1.1 (firewall).',
                trigger: { event: 'command', match: { cmd: 'contains:ping' } }
            },
            {
                title: 'Trace the network path',
                tip: 'Run: traceroute 10.0.3.10 to see where packets are being dropped.',
                trigger: { event: 'command', match: { cmd: 'contains:traceroute' } }
            },
            {
                title: 'Inspect the firewall rules',
                tip: 'SSH to the firewall and run: sudo iptables -L FORWARD -n -v --line-numbers to examine forwarding rules.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:iptables' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:ssh firewall' } }
                    ]
                }
            },
            {
                title: 'Identify and remove the blocking rule',
                tip: 'Find the DROP rule blocking 10.0.1.0/24 to 10.0.3.0/24. The user flag is the iptables fix command.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Retrieve the verification token',
                tip: 'With connectivity restored, curl or scp the verification file from HUB-COMM-01.',
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
            { flagId: 'user', objective: '3.3', description: 'Given a scenario, implement secure network designs — Network segmentation', skill: 'Firewall Rule Analysis' },
            { flagId: 'user', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security — Firewalls', skill: 'iptables Troubleshooting' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Network hardening', skill: 'Network Connectivity Verification' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks', skill: 'Traffic Path Analysis' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'RELAY-EAST BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: eth0 link detected — 10.0.1.10',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS',
            'Ubuntu 22.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'net_ops'
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
        user: 'net_ops',
        hostname: 'relay-east',
        startDir: '/home/net_ops',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to RELAY-EAST (10.0.1.10)\nLast login: Tue Mar 18 03:45:11 2026 from 10.0.1.50\n\n*** ALERT: Cannot reach HUB-COMM-01 (10.0.3.10) ***\n*** RELAY-WEST (10.0.2.10) reports HUB connectivity is NORMAL ***\n\nType \'help\' for available commands.\n'
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
                        'net_ops': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget Network: Outpost Network\n\nTopology:\n  RELAY-EAST  (10.0.1.10) -- eth0 of FIREWALL (10.0.1.1)\n  RELAY-WEST  (10.0.2.10) -- eth1 of FIREWALL (10.0.2.1)\n  HUB-COMM-01 (10.0.3.10) -- eth2 of FIREWALL (10.0.3.1)\n\nProblem: RELAY-EAST cannot reach HUB-COMM-01\n         RELAY-WEST CAN reach HUB-COMM-01\n\nSuspected: Firewall or routing misconfiguration\n\nSSH Credentials:\n  FIREWALL-CENTRAL-01: ssh fw_admin@10.0.1.1\n  RELAY-WEST: ssh net_ops@10.0.2.10\n  HUB-COMM-01: ssh hub_admin@10.0.3.10'
                                },
                                'network_diagram.txt': {
                                    type: 'file',
                                    content: '  +------------------+\n  |   RELAY-EAST     |\n  |   10.0.1.10      |---+\n  +------------------+   |\n                         |\n  +------------------+   |   +---------------------+   +------------------+\n  |   RELAY-WEST     |---+---|  FIREWALL-CENTRAL   |---|   HUB-COMM-01   |\n  |   10.0.2.10      |   |   |  eth0: 10.0.1.1     |   |   10.0.3.10    |\n  +------------------+   |   |  eth1: 10.0.2.1     |   +------------------+\n                         +---|  eth2: 10.0.3.1     |\n                             +---------------------+\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ping 10.0.3.10\nping 10.0.1.1\ntraceroute 10.0.3.10\nip route\nssh fw_admin@10.0.1.1'
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
                            content: 'relay-east'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nnet_ops:x:1000:1000:Network Operations:/home/net_ops:/bin/bash'
                        },
                        'netplan': {
                            type: 'dir',
                            children: {
                                '01-netcfg.yaml': {
                                    type: 'file',
                                    content: 'network:\n  version: 2\n  ethernets:\n    eth0:\n      addresses:\n        - 10.0.1.10/24\n      gateway4: 10.0.1.1\n      nameservers:\n        addresses: [8.8.8.8, 8.8.4.4]\n'
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
                                    content: 'Mar 18 03:30:01 relay-east systemd[1]: Started Session 12 of User net_ops.\nMar 18 03:30:15 relay-east kernel: [187215.234] eth0: link up, 1000Mbps, full-duplex\nMar 18 03:45:11 relay-east sshd[3401]: Accepted publickey for net_ops from 10.0.1.50 port 52100\nMar 18 03:45:22 relay-east net_ops: ping 10.0.3.10: 100% packet loss\nMar 18 03:45:30 relay-east net_ops: ping 10.0.1.1: 0% packet loss'
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

    // Track current SSH host context
    _currentHost: 'relay-east',

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
            text: 'Start by confirming what works: ping 10.0.1.1 (firewall) from RELAY-EAST. Then try ping 10.0.3.10 (HUB). The firewall is reachable but HUB is not.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'SSH to the firewall: ssh fw_admin@10.0.1.1. Then inspect its iptables FORWARD chain: sudo iptables -L FORWARD -n -v --line-numbers.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'There is an iptables DROP rule blocking traffic from 10.0.1.0/24 to 10.0.3.0/24 in the FORWARD chain. The user flag is: {{FLAG:user}}',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After removing the blocking rule (sudo iptables -D FORWARD 3), test connectivity and then retrieve the token: curl http://10.0.3.10:8080/verification_token.txt',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'In the Outpost Network, RELAY-EAST and RELAY-WEST maintain constant contact with HUB-COMM-01, aggregating sensor data from the wasteland. Connectivity between RELAY-EAST and HUB-COMM-01 has mysteriously ceased, yet RELAY-WEST functions perfectly. All three hosts are behind FIREWALL-CENTRAL-01. Your mission: diagnose the network outage and restore the critical communication link.',
        scenario: 'A disgruntled former network administrator, before their credentials were revoked, inserted a targeted iptables DROP rule on FIREWALL-CENTRAL-01 that specifically blocks forwarding from the RELAY-EAST subnet (10.0.1.0/24) to the HUB-COMM-01 subnet (10.0.3.0/24). The rule was buried among legitimate firewall entries, making it appear as a routine security policy.',
        outro: 'The Segmented Silence is broken. RELAY-EAST can once again reach HUB-COMM-01, and sensor data flows freely through the Outpost Network. The saboteur\'s hidden firewall rule has been identified and removed. The network\'s integrity is restored.',
        ecer: {
            executive: 'No firewall change-audit process; rules could be added without approval or logging',
            culture: 'Single administrator had unmonitored root access to the central firewall appliance',
            employee: 'Former admin inserted a targeted DROP rule as sabotage before departure',
            regulatory: 'No automated firewall rule compliance checks or alerting on new DROP rules'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB SIMULATION (HUB Dashboard)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.1.10:8080/',

        pages: {
            '/': {
                title: 'RELAY-EAST Network Monitor',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #444;">
                        <h1 style="color:#3b82f6; font-size:1.6rem; margin-bottom:4px;">RELAY-EAST Network Monitor</h1>
                        <div style="color:#888; font-size:0.8rem;">Outpost Network Infrastructure Status</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto;">
                        <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:20px; margin-bottom:20px;">
                            <div style="color:#ef4444; font-size:1.1rem; font-weight:bold; margin-bottom:8px;">CONNECTIVITY ALERT</div>
                            <div style="color:#ccc; font-size:0.85rem; line-height:1.6;">
                                HUB-COMM-01 (10.0.3.10): <span style="color:#ef4444; font-weight:bold;">UNREACHABLE</span><br>
                                FIREWALL-CENTRAL (10.0.1.1): <span style="color:#22c55e; font-weight:bold;">REACHABLE</span><br>
                                RELAY-WEST (10.0.2.10): <span style="color:#22c55e; font-weight:bold;">REACHABLE</span>
                            </div>
                        </div>

                        <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px; margin-bottom:12px;">
                            <div style="color:#aaa; font-size:0.75rem; letter-spacing:0.1em; margin-bottom:8px;">NETWORK TOPOLOGY</div>
                            <pre style="font-size:0.75rem; color:#888; line-height:1.4; margin:0;">RELAY-EAST (10.0.1.10) --[eth0]--> FIREWALL (10.0.1.1)
RELAY-WEST (10.0.2.10) --[eth1]--> FIREWALL (10.0.2.1)
HUB-COMM-01 (10.0.3.10) --[eth2]--> FIREWALL (10.0.3.1)</pre>
                        </div>

                        <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px;">
                            <div style="color:#aaa; font-size:0.75rem; letter-spacing:0.1em; margin-bottom:8px;">LAST KNOWN SENSOR DATA</div>
                            <div style="font-size:0.8rem; color:#888; font-family:monospace; line-height:1.6;">
                                Atmospheric: STALE (18h old)<br>
                                Seismic: STALE (18h old)<br>
                                Radiation: STALE (18h old)<br>
                                Status: DATA PIPELINE INTERRUPTED
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
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target === '10.0.1.10' || target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.00031s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 8.9p1 Ubuntu
8080/tcp open  http     RELAY-EAST Network Monitor

Nmap done: 1 IP address (1 host up) scanned in 3.81 seconds`;
            }
            if (target === '10.0.1.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.1.1
Host is up (0.0012s latency).
Not shown: 999 filtered tcp ports

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1

Nmap done: 1 IP address (1 host up) scanned in 5.22 seconds`;
            }
            if (target === '10.0.2.10') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.2.10
Host is up (0.0024s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE
22/tcp   open  ssh
8080/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 4.10 seconds`;
            }
            if (target === '10.0.3.10') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'ping': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.0.1.1') {
                return `PING 10.0.1.1 (10.0.1.1) 56(84) bytes of data.
64 bytes from 10.0.1.1: icmp_seq=1 ttl=64 time=1.22 ms
64 bytes from 10.0.1.1: icmp_seq=2 ttl=64 time=1.18 ms
64 bytes from 10.0.1.1: icmp_seq=3 ttl=64 time=1.21 ms

--- 10.0.1.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 1.18/1.20/1.22/0.016 ms`;
            }

            if (target === '10.0.2.10') {
                return `PING 10.0.2.10 (10.0.2.10) 56(84) bytes of data.
64 bytes from 10.0.2.10: icmp_seq=1 ttl=63 time=2.45 ms
64 bytes from 10.0.2.10: icmp_seq=2 ttl=63 time=2.38 ms
64 bytes from 10.0.2.10: icmp_seq=3 ttl=63 time=2.41 ms

--- 10.0.2.10 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 2.38/2.41/2.45/0.028 ms`;
            }

            if (target === '10.0.3.10') {
                if (engine && engine._b2FirewallFixed) {
                    return `PING 10.0.3.10 (10.0.3.10) 56(84) bytes of data.
64 bytes from 10.0.3.10: icmp_seq=1 ttl=63 time=2.84 ms
64 bytes from 10.0.3.10: icmp_seq=2 ttl=63 time=2.77 ms
64 bytes from 10.0.3.10: icmp_seq=3 ttl=63 time=2.81 ms

--- 10.0.3.10 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 2.77/2.81/2.84/0.028 ms`;
                }
                return `PING 10.0.3.10 (10.0.3.10) 56(84) bytes of data.

--- 10.0.3.10 ping statistics ---
3 packets transmitted, 0 received, 100% packet loss`;
            }

            if (target === '10.0.1.10' || target === 'localhost' || target === '127.0.0.1') {
                return `PING ${target} (${target === 'localhost' ? '127.0.0.1' : target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.031 ms

--- ${target} ping statistics ---
1 packets transmitted, 1 received, 0% packet loss`;
            }

            return `ping: ${target}: Network is unreachable`;
        },

        'traceroute': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: traceroute destination';

            if (target === '10.0.3.10') {
                if (engine && engine._b2FirewallFixed) {
                    return `traceroute to 10.0.3.10 (10.0.3.10), 30 hops max, 60 byte packets
 1  10.0.1.1 (10.0.1.1)  1.221 ms  1.198 ms  1.205 ms
 2  10.0.3.10 (10.0.3.10)  2.841 ms  2.812 ms  2.825 ms`;
                }
                return `traceroute to 10.0.3.10 (10.0.3.10), 30 hops max, 60 byte packets
 1  10.0.1.1 (10.0.1.1)  1.221 ms  1.198 ms  1.205 ms
 2  * * *
 3  * * *
 4  * * *
 5  * * *`;
            }

            if (target === '10.0.1.1') {
                return `traceroute to 10.0.1.1 (10.0.1.1), 30 hops max, 60 byte packets
 1  10.0.1.1 (10.0.1.1)  1.221 ms  1.198 ms  1.205 ms`;
            }

            if (target === '10.0.2.10') {
                return `traceroute to 10.0.2.10 (10.0.2.10), 30 hops max, 60 byte packets
 1  10.0.1.1 (10.0.1.1)  1.221 ms  1.198 ms  1.205 ms
 2  10.0.2.10 (10.0.2.10)  2.450 ms  2.412 ms  2.431 ms`;
            }

            return `traceroute to ${target}, 30 hops max, 60 byte packets
 1  * * *`;
        },

        'ip': function(args, term, engine) {
            const currentHost = (engine && engine._b2CurrentHost) || 'relay-east';

            if (args.length === 0 || args[0] === 'a' || args[0] === 'addr') {
                if (currentHost === 'firewall') {
                    return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.1.1/24 brd 10.0.1.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.1/24 brd 10.0.2.255 scope global eth1
4: eth2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.3.1/24 brd 10.0.3.255 scope global eth2`;
                }
                if (currentHost === 'hub') {
                    return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.3.10/24 brd 10.0.3.255 scope global eth0`;
                }
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.1.10/24 brd 10.0.1.255 scope global eth0`;
            }

            if (args[0] === 'route' || args[0] === 'r') {
                if (currentHost === 'firewall') {
                    return `10.0.1.0/24 dev eth0 proto kernel scope link src 10.0.1.1
10.0.2.0/24 dev eth1 proto kernel scope link src 10.0.2.1
10.0.3.0/24 dev eth2 proto kernel scope link src 10.0.3.1`;
                }
                if (currentHost === 'hub') {
                    return `default via 10.0.3.1 dev eth0 proto static
10.0.3.0/24 dev eth0 proto kernel scope link src 10.0.3.10`;
                }
                return `default via 10.0.1.1 dev eth0 proto static
10.0.1.0/24 dev eth0 proto kernel scope link src 10.0.1.10`;
            }

            return 'Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }\n  ip addr    Show addresses\n  ip route   Show routes';
        },

        'ssh': function(args, term, engine) {
            if (args.length === 0) return 'usage: ssh [-l login_name] [user@]hostname';
            const target = args[args.length - 1] || '';

            if (target.includes('10.0.1.1') || target.includes('fw_admin@')) {
                if (engine) engine._b2CurrentHost = 'firewall';
                return `Welcome to FIREWALL-CENTRAL-01\nUbuntu 22.04.3 LTS\n\nYou are now connected as fw_admin@firewall-central-01\nUse \'exit\' to return to RELAY-EAST.\n\n[fw_admin@firewall-central-01 ~]$`;
            }
            if (target.includes('10.0.3.10') || target.includes('hub_admin@')) {
                if (engine && engine._b2FirewallFixed) {
                    if (engine) engine._b2CurrentHost = 'hub';
                    return `Welcome to HUB-COMM-01\nDebian 11\n\nYou are now connected as hub_admin@hub-comm-01\nUse \'exit\' to return to RELAY-EAST.\n\n[hub_admin@hub-comm-01 ~]$`;
                }
                return 'ssh: connect to host 10.0.3.10 port 22: Connection timed out';
            }
            if (target.includes('10.0.2.10') || target.includes('net_ops@10.0.2')) {
                return `Welcome to RELAY-WEST\nUbuntu 22.04.3 LTS\n\nYou are now connected as net_ops@relay-west\n\n[net_ops@relay-west ~]$`;
            }
            return `ssh: connect to host ${target} port 22: Connection refused`;
        },

        'iptables': function(args, term, engine) {
            const currentHost = (engine && engine._b2CurrentHost) || 'relay-east';

            if (currentHost !== 'firewall') {
                return `Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination`;
            }

            // Firewall iptables
            const hasLineNumbers = args.includes('--line-numbers') || args.includes('--line');
            const isForward = args.includes('FORWARD');
            const isVerbose = args.includes('-v');

            if (args.includes('-D') && args.includes('FORWARD')) {
                const ruleNum = args.find(a => /^\d+$/.test(a));
                if (ruleNum === '3') {
                    if (engine) engine._b2FirewallFixed = true;
                    return '';
                }
                if (args.some(a => a.includes('10.0.1'))) {
                    if (engine) engine._b2FirewallFixed = true;
                    return '';
                }
                return 'iptables: Bad rule (does a matching rule exist in that chain?)';
            }

            if (engine && engine._b2FirewallFixed) {
                let output = `Chain INPUT (policy ACCEPT${isVerbose ? ' 0 packets, 0 bytes' : ''})
${hasLineNumbers ? 'num   ' : ''}target     prot opt ${isVerbose ? 'in     out     ' : ''}source               destination
${hasLineNumbers ? '1     ' : ''}ACCEPT     all  --  ${isVerbose ? '*      *       ' : ''}0.0.0.0/0            0.0.0.0/0            state RELATED,ESTABLISHED

Chain FORWARD (policy DROP${isVerbose ? ' 0 packets, 0 bytes' : ''})
${hasLineNumbers ? 'num   ' : ''}target     prot opt ${isVerbose ? 'in     out     ' : ''}source               destination
${hasLineNumbers ? '1     ' : ''}ACCEPT     all  --  ${isVerbose ? 'eth0   eth1    ' : ''}10.0.1.0/24          10.0.2.0/24${isVerbose ? '          0     0' : ''}
${hasLineNumbers ? '2     ' : ''}ACCEPT     all  --  ${isVerbose ? 'eth1   eth2    ' : ''}10.0.2.0/24          10.0.3.0/24${isVerbose ? '       1284  98304' : ''}
${hasLineNumbers ? '3     ' : ''}ACCEPT     all  --  ${isVerbose ? 'eth2   eth1    ' : ''}10.0.3.0/24          10.0.2.0/24${isVerbose ? '       1180  90112' : ''}
${hasLineNumbers ? '4     ' : ''}ACCEPT     all  --  ${isVerbose ? 'eth0   eth2    ' : ''}10.0.1.0/24          10.0.3.0/24${isVerbose ? '          0     0' : ''}
${hasLineNumbers ? '5     ' : ''}ACCEPT     all  --  ${isVerbose ? 'eth2   eth0    ' : ''}10.0.3.0/24          10.0.1.0/24${isVerbose ? '          0     0' : ''}

Chain OUTPUT (policy ACCEPT${isVerbose ? ' 0 packets, 0 bytes' : ''})
${hasLineNumbers ? 'num   ' : ''}target     prot opt ${isVerbose ? 'in     out     ' : ''}source               destination`;
                return output;
            }

            let output = `Chain INPUT (policy ACCEPT${isVerbose ? ' 0 packets, 0 bytes' : ''})
${hasLineNumbers ? 'num   ' : ''}target     prot opt ${isVerbose ? 'in     out     ' : ''}source               destination
${hasLineNumbers ? '1     ' : ''}ACCEPT     all  --  ${isVerbose ? '*      *       ' : ''}0.0.0.0/0            0.0.0.0/0            state RELATED,ESTABLISHED

Chain FORWARD (policy DROP${isVerbose ? ' 0 packets, 0 bytes' : ''})
${hasLineNumbers ? 'num   ' : ''}target     prot opt ${isVerbose ? 'in     out     ' : ''}source               destination
${hasLineNumbers ? '1     ' : ''}ACCEPT     all  --  ${isVerbose ? 'eth0   eth1    ' : ''}10.0.1.0/24          10.0.2.0/24${isVerbose ? '          0     0' : ''}
${hasLineNumbers ? '2     ' : ''}ACCEPT     all  --  ${isVerbose ? 'eth1   eth2    ' : ''}10.0.2.0/24          10.0.3.0/24${isVerbose ? '       1284  98304' : ''}
${hasLineNumbers ? '3     ' : ''}DROP       all  --  ${isVerbose ? 'eth0   eth2    ' : ''}10.0.1.0/24          10.0.3.0/24${isVerbose ? '        847  64768' : ''}
${hasLineNumbers ? '4     ' : ''}ACCEPT     all  --  ${isVerbose ? 'eth2   eth1    ' : ''}10.0.3.0/24          10.0.2.0/24${isVerbose ? '       1180  90112' : ''}
${hasLineNumbers ? '5     ' : ''}ACCEPT     all  --  ${isVerbose ? 'eth2   eth0    ' : ''}10.0.3.0/24          10.0.1.0/24${isVerbose ? '          0     0' : ''}

Chain OUTPUT (policy ACCEPT${isVerbose ? ' 0 packets, 0 bytes' : ''})
${hasLineNumbers ? 'num   ' : ''}target     prot opt ${isVerbose ? 'in     out     ' : ''}source               destination`;

            return output;
        },

        'sudo': function(args, term, engine) {
            if (args.length === 0) return 'usage: sudo [-h] [-u user] command';
            const fullCmd = args.join(' ');

            if (args[0] === 'iptables') {
                return B2Config.commands.iptables(args.slice(1), term, engine);
            }

            if (fullCmd.includes('cat /opt/hub_comm/verification_token.txt') || fullCmd.includes('cat /root/verification')) {
                if (engine && engine._b2FirewallFixed && engine._b2CurrentHost === 'hub') {
                    return '{{FLAG:user}}';
                }
                return 'cat: /opt/hub_comm/verification_token.txt: No such file or directory';
            }

            return `[sudo] executing: ${fullCmd}`;
        },

        'curl': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.0.3.10') && url.includes('verification')) {
                if (engine && engine._b2FirewallFixed) {
                    return '{{FLAG:user}}';
                }
                return 'curl: (7) Failed to connect to 10.0.3.10 port 8080: Connection timed out';
            }
            if (url.includes('10.0.3.10')) {
                if (engine && engine._b2FirewallFixed) {
                    return '<html><body><h1>HUB-COMM-01</h1><p>Sensor Aggregation Hub - Online</p></body></html>';
                }
                return 'curl: (7) Failed to connect to 10.0.3.10: Connection timed out';
            }
            return `curl: (7) Failed to connect to ${url}: Connection refused`;
        },

        'scp': function(args, term, engine) {
            if (args.length < 2) return 'usage: scp source destination';
            const source = args[0] || '';
            if (source.includes('10.0.3.10') && source.includes('verification')) {
                if (engine && engine._b2FirewallFixed) {
                    return 'verification_token.txt                    100%   42     0.0KB/s   00:00\nToken: {{FLAG:user}}';
                }
                return 'ssh: connect to host 10.0.3.10 port 22: Connection timed out\nlost connection';
            }
            return `scp: ${source}: No such file or directory`;
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
tcp    LISTEN  0       5        0.0.0.0:8080         0.0.0.0:*          users:(("python3",pid=1102,fd=4))`;
        },

        'df': function(args) {
            return `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1      262144000 52428800 209715200  20% /
tmpfs            4096000     1024   4094976   1% /dev/shm`;
        },

        'free': function(args) {
            return `               total        used        free      shared  buff/cache   available
Mem:         8192000     1638400     4915200       16384     1638400     6144000
Swap:        2048000           0     2048000`;
        },

        'ps': function(args) {
            if (args.includes('aux') || args.includes('-ef')) {
                return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1 169348  8192 ?        Ss   Mar16   0:02 /sbin/init
root         685  0.0  0.1  15420  5120 ?        Ss   Mar16   0:01 sshd: /usr/sbin/sshd -D
root        1102  0.0  0.2  24576  12288 ?       Ss   Mar16   0:05 /usr/bin/python3 /opt/net_monitor/app.py
net_ops     3401  0.0  0.1  15820  7424 ?        Ss   03:45   0:00 sshd: net_ops [priv]
net_ops     3405  0.0  0.1   8256  5120 pts/0    Ss   03:45   0:00 -bash
net_ops     3450  0.0  0.0   9344  3584 pts/0    R+   03:46   0:00 ps aux`;
            }
            return 'Usage: ps [options]';
        },

        'grep': function(args) {
            if (args.length < 2) return 'Usage: grep [options] PATTERN [FILE...]';
            return 'grep: No matches found';
        },

        'chmod': function(args) {
            if (args.length < 2) return 'Usage: chmod [mode] [file]';
            return '';
        },

        'chown': function(args) {
            if (args.length < 2) return 'Usage: chown [owner:group] [file]';
            return '';
        },

        'whoami': function(args, term, engine) {
            const host = (engine && engine._b2CurrentHost) || 'relay-east';
            if (host === 'firewall') return 'fw_admin';
            if (host === 'hub') return 'hub_admin';
            return 'net_ops';
        },

        'hostname': function(args, term, engine) {
            const host = (engine && engine._b2CurrentHost) || 'relay-east';
            if (host === 'firewall') return 'firewall-central-01';
            if (host === 'hub') return 'hub-comm-01';
            return 'relay-east';
        },

        'id': function(args, term, engine) {
            const host = (engine && engine._b2CurrentHost) || 'relay-east';
            if (host === 'firewall') return 'uid=1000(fw_admin) gid=1000(fw_admin) groups=1000(fw_admin),27(sudo)';
            if (host === 'hub') return 'uid=1000(hub_admin) gid=1000(hub_admin) groups=1000(hub_admin),27(sudo)';
            return 'uid=1000(net_ops) gid=1000(net_ops) groups=1000(net_ops),27(sudo)';
        },

        'exit': function(args, term, engine) {
            if (engine && engine._b2CurrentHost && engine._b2CurrentHost !== 'relay-east') {
                const prev = engine._b2CurrentHost;
                engine._b2CurrentHost = 'relay-east';
                return `logout\nConnection to ${prev === 'firewall' ? 'firewall-central-01' : 'hub-comm-01'} closed.\n[net_ops@relay-east ~]$`;
            }
            return 'logout\nConnection to relay-east closed.';
        },

        'uname': function(args) {
            if (args.includes('-a')) return 'Linux relay-east 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 GNU/Linux';
            if (args.includes('-r')) return '5.15.0-91-generic';
            return 'Linux';
        },

        'pwd': function(args, term) {
            return term ? term.cwd : '/home/net_ops';
        },

        'date': function() {
            return 'Tue Mar 18 03:46:15 UTC 2026';
        },

        'uptime': function() {
            return ' 03:46:15 up 2 days, 13:46,  1 user,  load average: 0.05, 0.08, 0.06';
        },

        'pip3': function() { return 'pip3: command not found'; },
        'pip': function() { return 'pip: command not found'; },
        'apt': function() { return 'E: Could not open lock file - are you root?'; },

        'clear': function() { return '\x1Bclear'; },

        'man': function(args) {
            if (!args[0]) return 'What manual page do you want?';
            return `No manual entry for ${args[0]}`;
        },

        'less': function() { return 'less: interactive pager not supported. Use cat instead.'; },
        'vim': function() { return 'vim: interactive editor not supported. Use cat to view files.'; },
        'nano': function() { return 'nano: interactive editor not supported. Use cat to view files.'; }
    }
};
