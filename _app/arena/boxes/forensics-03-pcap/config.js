/* ============================================================
   CTF ARENA — Box Forensics-03: The Wire Tap
   Network Forensics | PCAP Analysis
   Config: pcap data, protocols, flags, hints, lore
   ============================================================ */

const Forensics03Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Wire Tap',
    subtitle: 'Network Forensics — PCAP Analysis',
    difficulty: 'Intermediate',
    accent: '#059669',
    storageKey: 'hexworth_ctf_forensics03',
    registryId: 'forensics-03-pcap',
    trackerKey: 'ctf_forensics03',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Traffic Overview',
            icon: '\uD83D\uDD0D',
            description: 'Get a high-level view of the capture. Identify protocols, endpoints, and conversation statistics.',
            requiredFlags: [],
            mitre: ['T1040', 'T1071'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Protocol Analysis',
            icon: '\uD83C\uDF10',
            description: 'Drill into suspicious protocols and connections. Follow TCP streams to find C2 traffic.',
            requiredFlags: [],
            mitre: ['T1071.001', 'T1573.002'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'Data Extraction',
            icon: '\uD83D\uDCC2',
            description: 'Extract the exfiltrated file from the network capture. Decode any obfuscation.',
            requiredFlags: ['user'],
            mitre: ['T1041', 'T1048.003'],
            unlocks: ['reporting'],
            locked: true
        },
        {
            id: 'reporting',
            name: 'Incident Timeline',
            icon: '\uD83D\uDCCB',
            description: 'Reconstruct the attack timeline from network evidence.',
            requiredFlags: ['root'],
            mitre: ['T1041', 'T1567'],
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
                title: 'Get capture statistics',
                tip: 'Open the Terminal and run: tshark -r /evidence/capture.pcap -q -z conv,tcp',
                trigger: { event: 'command', match: { cmd: 'contains:tshark' } }
            },
            {
                title: 'Identify protocol distribution',
                tip: 'Run: tshark -r /evidence/capture.pcap -q -z io,phs to see the protocol hierarchy.',
                trigger: { event: 'command', match: { cmd: 'contains:phs' } }
            },
            {
                title: 'Filter for suspicious traffic',
                tip: 'Use display filters to isolate C2 traffic. Try filtering by unusual ports or DNS queries.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:filter' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:dns' } },
                        { event: 'command', match: { cmd: 'contains:follow' } }
                    ]
                }
            },
            {
                title: 'Identify the C2 server',
                tip: 'Find the external IP receiving beaconing traffic on an unusual port.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Extract the exfiltrated file',
                tip: 'Follow the TCP stream containing the exfiltrated data. It may be base64-encoded.',
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
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — C2 identification', skill: 'Network Traffic Analysis' },
            { flagId: 'user', objective: '4.4', description: 'Given an incident, apply mitigation techniques — Network forensics and PCAP analysis', skill: 'PCAP Analysis' },
            { flagId: 'root', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Data exfiltration via network', skill: 'Exfiltration Detection' },
            { flagId: 'root', objective: '2.4', description: 'Given a scenario, analyze indicators — Protocol analysis and data extraction', skill: 'Protocol Forensics' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Security Onion BIOS v2.4.1',
            'Initializing network forensics environment...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
            'Network interfaces: eth0 (monitoring), eth1 (analysis)',
            'PCAP loaded: /evidence/capture.pcap',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Security Onion Workstation',
            'Security Onion (recovery mode)',
            'Advanced options'
        ],
        loginUser: 'analyst'
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
        user: 'analyst',
        hostname: 'sec-onion',
        startDir: '/home/analyst',
        welcome: 'Security Onion Workstation — Network Forensics\n\nType \'help\' for available commands.\nPCAP file: /evidence/capture.pcap\nCapture duration: 47 minutes\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED PCAP DATA
    // ═══════════════════════════════════════════════════════

    _pcapData: {
        filename: 'capture.pcap',
        duration: '47 minutes',
        packets: 284729,
        c2Server: '203.0.113.66',
        c2Port: 8443,
        c2Protocol: 'HTTPS over port 8443',
        victimIP: '10.0.1.47',
        conversations: [
            { srcIP: '10.0.1.47', srcPort: 49301, dstIP: '203.0.113.66', dstPort: 8443, packets: 4872, bytes: 2847392, protocol: 'TLS' },
            { srcIP: '10.0.1.47', srcPort: 49305, dstIP: '203.0.113.66', dstPort: 443, packets: 1244, bytes: 892416, protocol: 'TLS' },
            { srcIP: '10.0.1.47', srcPort: 49200, dstIP: '8.8.8.8', dstPort: 53, packets: 342, bytes: 48576, protocol: 'DNS' },
            { srcIP: '10.0.1.47', srcPort: 49210, dstIP: '10.0.1.1', dstPort: 53, packets: 189, bytes: 26712, protocol: 'DNS' },
            { srcIP: '10.0.1.47', srcPort: 80, dstIP: '10.0.1.12', dstPort: 49400, packets: 56, bytes: 8904, protocol: 'HTTP' },
            { srcIP: '10.0.1.47', srcPort: 49250, dstIP: '52.96.166.34', dstPort: 443, packets: 3456, bytes: 1245184, protocol: 'TLS' },
            { srcIP: '10.0.1.47', srcPort: 49260, dstIP: '142.250.80.46', dstPort: 443, packets: 2190, bytes: 789504, protocol: 'TLS' },
            { srcIP: '10.0.1.47', srcPort: 49350, dstIP: '203.0.113.66', dstPort: 53, packets: 847, bytes: 423500, protocol: 'DNS' }
        ],
        dnsQueries: [
            { query: 'mail.spectra-corp.com', type: 'A', response: '52.96.166.34' },
            { query: 'www.google.com', type: 'A', response: '142.250.80.46' },
            { query: 'update.windows.com', type: 'A', response: '13.107.4.50' },
            { query: 'c2-relay.darknet-ops.xyz', type: 'A', response: '203.0.113.66' },
            { query: 'exfil.darknet-ops.xyz', type: 'A', response: '203.0.113.66' },
            { query: 'Q1hTLTIwMjQtU2Vj.exfil.darknet-ops.xyz', type: 'TXT', response: 'NXDOMAIN' },
            { query: 'cmV0LVByb2plY3Rz.exfil.darknet-ops.xyz', type: 'TXT', response: 'NXDOMAIN' },
            { query: 'LUNsYXNzaWZpZWQ=.exfil.darknet-ops.xyz', type: 'TXT', response: 'NXDOMAIN' }
        ],
        exfilData: {
            method: 'DNS TXT query subdomains + HTTPS POST',
            encodedPayload: 'UHJvamVjdCBBUkNIQU5HRUwgLSBTdW1tYXJ5Cj09PT09PT09PT09PT09PQpTdGF0dXM6IEFDVElWRQoKQXNzZXRzOgotIFByb2plY3QgU3RhcmR1c3Q6IGRlZmVuc2UgY29udHJhY3QKLSBPcGVyYXRpb24gR2xhc3MgQ2VpbGluZzogU0lHSU5UIHBsYXRmb3JtCgpWZXJpZmljYXRpb24gQ29kZTogZmxhZ3tyb290fQo=',
            decodedContent: 'Project ARCHANGEL - Summary\n============================\nStatus: ACTIVE\n\nAssets:\n- Project Stardust: defense contract\n- Operation Glass Ceiling: SIGINT platform\n\nVerification Code: {{FLAG:root}}\n'
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
        minScore: 0,
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
            text: 'Start with tshark -r /evidence/capture.pcap -q -z conv,tcp to see all TCP conversations. Look for connections to unusual ports (not 80 or 443).',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The C2 server uses port 8443 (non-standard HTTPS). Filter for it: tshark -r /evidence/capture.pcap -Y "tcp.port==8443". The destination IP 203.0.113.66 is the C2 server.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The user flag is the C2 server IP and protocol. Also check DNS queries — the domain c2-relay.darknet-ops.xyz resolves to 203.0.113.66. Submit the flag: {{FLAG:user}}',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Data was exfiltrated via DNS subdomain encoding and HTTPS POST. Follow TCP stream 5 (the exfiltration stream) and decode the base64 payload. The decoded document contains the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Spectra Corp\'s network monitoring detected anomalous outbound traffic patterns from a compromised workstation. The IDS flagged unusual DNS query patterns and high-volume encrypted traffic to an unrecognized external IP. A 47-minute packet capture was taken before the endpoint was isolated. Your mission: analyze the PCAP, identify the command-and-control infrastructure, and extract the exfiltrated data.',
        scenario: 'An advanced persistent threat (APT) compromised a workstation through a supply chain attack. The implant established encrypted C2 communications on port 8443 and began exfiltrating classified project files using DNS tunneling combined with HTTPS data transfer. The attacker encoded stolen documents in base64 and split them across DNS subdomain queries and encrypted POST requests.',
        outro: 'The wire tap has been analyzed. The C2 server at 203.0.113.66 (c2-relay.darknet-ops.xyz) coordinated the data theft using dual exfiltration channels. The recovered document — Project ARCHANGEL — was being siphoned to an external adversary. The DNS tunneling technique nearly evaded detection, but the unusually high volume of TXT queries to a single subdomain gave it away.',
        ecer: {
            executive: 'CISO approved exception for port 8443 outbound without deep packet inspection',
            culture: 'DNS monitoring was limited to blocklists, no behavioral analysis of query patterns',
            employee: 'Workstation compromised via unvetted third-party software update',
            regulatory: 'No requirement for TLS inspection on non-standard ports, no DNS tunneling detection deployed'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Network Analysis Dashboard
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost:8080/netforensics/',

        pages: {
            '/netforensics/': {
                title: 'Network Forensics Dashboard',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#059669; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Network Forensics Dashboard</h1>
                        <div style="color:#888; font-size:0.8rem;">Case #NF-2024-0341 &mdash; Spectra Corp Data Exfiltration</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="color:#888; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:8px;">CAPTURE SUMMARY</div>
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#059669; font-weight:bold;">PCAP File</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">capture.pcap</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#059669; font-weight:bold;">Duration</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">47 minutes</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#059669; font-weight:bold;">Packets</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">284,729</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#059669; font-weight:bold;">Victim IP</td><td style="padding:6px 10px; border-bottom:1px solid #eee; font-family:monospace;">10.0.1.47</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#059669; font-weight:bold;">IDS Alert</td><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e74c3c;">Anomalous DNS + Encrypted C2 traffic</td></tr>
                        </table>

                        <div style="margin-top:20px; padding:12px; background:rgba(5,150,105,0.06); border:1px solid rgba(5,150,105,0.2); border-radius:4px; font-size:0.78rem; color:#666;">
                            <strong style="color:#059669;">Objective:</strong> Analyze the PCAP to identify the C2 server IP and protocol (user flag), then extract the exfiltrated document from the captured traffic (root flag). Use tshark, tcpdump, strings, grep, base64, and file extraction tools.
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (analyst workstation)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'analyst': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== NETWORK FORENSICS BRIEFING ===\nCase: #NF-2024-0341\nSubject: Spectra Corp workstation (10.0.1.47)\nEvidence: /evidence/capture.pcap\n\nAnalysis steps:\n1. tshark -q -z conv,tcp — TCP conversations\n2. tshark -q -z io,phs — protocol hierarchy\n3. tshark -Y "display.filter" — filter traffic\n4. tshark -z follow,tcp,ascii,N — follow streams\n5. strings/grep — search for patterns\n6. base64 -d — decode exfiltrated data\n\nUser flag: C2 server IP + protocol\nRoot flag: inside the exfiltrated document\n\nIDS flagged:\n- Unusual DNS query volume to single domain\n- Encrypted traffic on non-standard port 8443'
                                },
                                'output': {
                                    type: 'dir',
                                    children: {}
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'file /evidence/capture.pcap\ntshark -r /evidence/capture.pcap -q -z conv,tcp | head -20'
                                }
                            }
                        }
                    }
                },
                'evidence': {
                    type: 'dir',
                    children: {
                        'capture.pcap': {
                            type: 'file',
                            content: '[PCAP CAPTURE FILE — 284,729 packets — 47 min duration — Use tshark/tcpdump to analyze]'
                        },
                        'ids_alert.txt': {
                            type: 'file',
                            content: 'IDS ALERT REPORT\n================\nTimestamp: 2024-12-13 14:47:22 UTC\nRule: ET POLICY Possible DNS Tunneling\nSrc: 10.0.1.47\nDst: 203.0.113.66\nProtocol: DNS/UDP\nSeverity: HIGH\n\nTimestamp: 2024-12-13 14:48:05 UTC\nRule: ET POLICY TLS on Non-Standard Port\nSrc: 10.0.1.47:49301\nDst: 203.0.113.66:8443\nProtocol: TLS/TCP\nSeverity: HIGH\n\nTimestamp: 2024-12-13 15:12:33 UTC\nRule: ET EXFIL Large DNS TXT Response Volume\nSrc: 10.0.1.47\nDst: 203.0.113.66\nQueries: 847 in 24 minutes\nSeverity: CRITICAL'
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': { type: 'dir', children: {} }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'sec-onion' }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (network forensic tools)
    // ═══════════════════════════════════════════════════════

    commands: {
        'tshark': function(args, term, engine) {
            if (args.length === 0) return 'Usage: tshark -r <pcap_file> [options]\n  -q              Quiet mode (suppress packet output)\n  -z conv,tcp     TCP conversation statistics\n  -z io,phs       Protocol hierarchy statistics\n  -z dns,tree     DNS query statistics\n  -Y "filter"     Display filter\n  -z follow,tcp,ascii,N   Follow TCP stream N\n  -T fields -e <field>    Extract specific fields';

            const joined = args.join(' ');
            const pd = Forensics03Config._pcapData;

            // Protocol hierarchy
            if (joined.includes('io,phs') || joined.includes('phs')) {
                return `Protocol Hierarchy Statistics\nFilter: \n\neth                              frames:284729 bytes:198457600\n  ip                             frames:284200 bytes:198234800\n    tcp                          frames:271847 bytes:192847300\n      tls                        frames:198542 bytes:178247100\n      http                       frames:56 bytes:8904\n      data                       frames:73249 bytes:14591296\n    udp                          frames:12353 bytes:5387500\n      dns                        frames:12353 bytes:5387500\n  arp                            frames:529 bytes:222800`;
            }

            // TCP conversations
            if (joined.includes('conv,tcp')) {
                let output = `TCP Conversations\nFilter: <No Filter>\n                                               |       <-      | |       ->      | |     Total     |\n                                               | Frames  Bytes | | Frames  Bytes | | Frames  Bytes |\n`;
                pd.conversations.forEach(c => {
                    const halfPkt = Math.floor(c.packets / 2);
                    const halfBytes = Math.floor(c.bytes / 2);
                    output += `${c.srcIP}:${c.srcPort} <-> ${c.dstIP}:${c.dstPort}   ${String(halfPkt).padStart(6)} ${String(halfBytes).padStart(10)}   ${String(halfPkt).padStart(6)} ${String(halfBytes).padStart(10)}   ${String(c.packets).padStart(6)} ${String(c.bytes).padStart(10)}\n`;
                });
                return output;
            }

            // DNS tree
            if (joined.includes('dns,tree') || joined.includes('dns')) {
                let output = 'DNS Statistics\n\nQuery Type    Count   Percent\n';
                output += 'A             531     43.0%\n';
                output += 'TXT           847     68.6%   <<< ANOMALOUS\n';
                output += 'AAAA           38      3.1%\n';
                output += 'MX             12      1.0%\n';
                output += '\nTop Queried Domains:\n';
                pd.dnsQueries.forEach(q => {
                    output += `  ${q.query.padEnd(50)} ${q.type.padEnd(6)} -> ${q.response}\n`;
                });
                output += '\n[!] WARNING: 847 TXT queries to *.exfil.darknet-ops.xyz in 24 minutes\n[!] Subdomain labels appear to be base64-encoded data segments\n[!] This pattern is consistent with DNS-based data exfiltration';
                return output;
            }

            // Display filter for port 8443
            if (joined.includes('8443')) {
                return `Capturing from: /evidence/capture.pcap\nFiltered packets: 6116\n\n  1 14:22:31.447 10.0.1.47:49301 -> 203.0.113.66:8443  TLS  Client Hello\n  2 14:22:31.512 203.0.113.66:8443 -> 10.0.1.47:49301  TLS  Server Hello\n  3 14:22:31.515 203.0.113.66:8443 -> 10.0.1.47:49301  TLS  Certificate\n  4 14:22:31.620 10.0.1.47:49301 -> 203.0.113.66:8443  TLS  Client Key Exchange\n  5 14:22:32.001 10.0.1.47:49301 -> 203.0.113.66:8443  TLS  Application Data (247 bytes)\n  6 14:22:32.089 203.0.113.66:8443 -> 10.0.1.47:49301  TLS  Application Data (142 bytes)\n  ...\n  [Beaconing pattern: check-in every ~60 seconds]\n  [Total: 4872 packets to 203.0.113.66:8443]\n\nSummary:\n  C2 Server: 203.0.113.66\n  Port: 8443 (non-standard HTTPS)\n  Protocol: TLS 1.2\n  Pattern: Regular 60-second beacon interval\n  Certificate CN: c2-relay.darknet-ops.xyz (self-signed)`;
            }

            // Follow TCP stream
            if (joined.includes('follow')) {
                const streamMatch = joined.match(/follow,tcp,ascii,(\d+)/);
                const streamNum = streamMatch ? parseInt(streamMatch[1]) : 0;

                if (streamNum === 0 || joined.includes('8443')) {
                    return `Follow TCP Stream 0 (10.0.1.47:49301 -> 203.0.113.66:8443)\n===================================================================\n[TLS Encrypted — Application Data]\n\nDecrypted with session key (from memory dump):\n\n>> Client:\n{"type":"checkin","id":"agent-4721","hostname":"WS-SPECTRA-47","ts":1702477351}\n\n<< Server:\n{"type":"tasking","cmd":"collect","target":"/shares/classified/","method":"dns+https"}\n\n>> Client:\n{"type":"status","msg":"collection complete","files":1,"size":4827}\n\n<< Server:\n{"type":"tasking","cmd":"exfil","method":"dns-subdomain+https-post","encoding":"base64"}`;
                }
                if (streamNum === 5) {
                    return `Follow TCP Stream 5 (10.0.1.47:49305 -> 203.0.113.66:443)\n===================================================================\n[Exfiltration stream — base64-encoded payload]\n\n>> Client (HTTP POST body):\n${pd.exfilData.encodedPayload}\n\n<< Server:\n{"status":"received","bytes":4827}\n\n--- Base64 decoded content ---\n${pd.exfilData.decodedContent}`;
                }
                return `Follow TCP Stream ${streamNum}\n===================================================================\n[Normal traffic — no suspicious content detected]`;
            }

            // Filter for C2 IP
            if (joined.includes('203.0.113.66') || joined.includes('darknet')) {
                return `Filtered results for 203.0.113.66:\n\nTCP connections:\n  10.0.1.47:49301 -> 203.0.113.66:8443   TLS   4872 packets (C2 beaconing)\n  10.0.1.47:49305 -> 203.0.113.66:443    TLS   1244 packets (data exfil)\n\nDNS queries:\n  10.0.1.47 -> 203.0.113.66:53           DNS   847 packets (DNS tunneling)\n\nTotal: 6963 packets to/from 203.0.113.66\n\n[!] This IP is the command-and-control server\n[!] C2 protocol: HTTPS on port 8443\n[!] Exfiltration: DNS tunneling + HTTPS POST`;
            }

            // Generic packet display
            return `Reading from: /evidence/capture.pcap\n\n  1 14:22:01.123 10.0.1.47 -> 8.8.8.8      DNS   Standard query A mail.spectra-corp.com\n  2 14:22:01.156 8.8.8.8 -> 10.0.1.47      DNS   Standard query response A 52.96.166.34\n  3 14:22:01.200 10.0.1.47 -> 52.96.166.34  TLS   Client Hello\n  ...\n 47 14:22:31.447 10.0.1.47 -> 203.0.113.66  TLS   Client Hello [port 8443]\n 48 14:22:31.512 203.0.113.66 -> 10.0.1.47  TLS   Server Hello [port 8443]\n  ...\n284729 15:09:47.891 10.0.1.47 -> 203.0.113.66  DNS  TXT LUNsYXNzaWZpZWQ=.exfil.darknet-ops.xyz\n\n284729 packets captured`;
        },

        'tcpdump': function(args, term, engine) {
            if (args.length === 0) return 'Usage: tcpdump -r <pcap_file> [options]\n  -n         Don\'t resolve hostnames\n  -c count   Capture count packets\n  "filter"   BPF filter expression';
            const joined = args.join(' ');

            if (joined.includes('port 8443') || joined.includes('dst 203.0.113.66')) {
                return `reading from file /evidence/capture.pcap, link-type EN10MB (Ethernet)\n14:22:31.447 IP 10.0.1.47.49301 > 203.0.113.66.8443: Flags [S], seq 1847293, win 65535\n14:22:31.480 IP 203.0.113.66.8443 > 10.0.1.47.49301: Flags [S.], seq 2938471, ack 1847294, win 65535\n14:22:31.481 IP 10.0.1.47.49301 > 203.0.113.66.8443: Flags [.], ack 1, win 65535\n14:22:31.512 IP 203.0.113.66.8443 > 10.0.1.47.49301: Flags [P.], seq 1:847, ack 1, win 65535\n...\n4872 packets captured matching filter`;
            }
            if (joined.includes('dns') || joined.includes('port 53')) {
                return `reading from file /evidence/capture.pcap, link-type EN10MB (Ethernet)\n14:22:01.123 IP 10.0.1.47.49200 > 8.8.8.8.53: 12345+ A? mail.spectra-corp.com.\n14:22:01.156 IP 8.8.8.8.53 > 10.0.1.47.49200: 12345 1/0/0 A 52.96.166.34\n14:48:12.447 IP 10.0.1.47.49350 > 203.0.113.66.53: 23456+ TXT? Q1hTLTIwMjQtU2Vj.exfil.darknet-ops.xyz.\n14:48:12.892 IP 10.0.1.47.49350 > 203.0.113.66.53: 23457+ TXT? cmV0LVByb2plY3Rz.exfil.darknet-ops.xyz.\n14:48:13.201 IP 10.0.1.47.49350 > 203.0.113.66.53: 23458+ TXT? LUNsYXNzaWZpZWQ=.exfil.darknet-ops.xyz.\n...\n1378 DNS packets captured`;
            }
            return `reading from file /evidence/capture.pcap, link-type EN10MB (Ethernet)\n284729 packets captured\nUse filters to narrow results: tcpdump -r /evidence/capture.pcap "host 203.0.113.66"`;
        },

        'strings': function(args, term, engine) {
            if (args.length === 0) return 'Usage: strings [-n min-len] file';
            const file = args.find(a => !a.startsWith('-')) || '';
            if (file.includes('capture')) {
                return `GET / HTTP/1.1\nHost: mail.spectra-corp.com\nMozilla/5.0\nc2-relay.darknet-ops.xyz\nexfil.darknet-ops.xyz\n203.0.113.66\nagent-4721\nWS-SPECTRA-47\ncollect\n/shares/classified/\nexfil\nbase64\nQ1hTLTIwMjQtU2Vj\ncmV0LVByb2plY3Rz\nLUNsYXNzaWZpZWQ=\nUHJvamVjdCBBUkNIQU5HRUw=\nProject ARCHANGEL`;
            }
            if (file.includes('ids_alert')) {
                return Forensics03Config.filesystem['/'].children.evidence.children['ids_alert.txt'].content;
            }
            return `strings: '${file}': No such file`;
        },

        'grep': function(args, term, engine) {
            if (args.length === 0) return 'Usage: grep [options] PATTERN [FILE...]';
            const pattern = args.find(a => !a.startsWith('-')) || '';

            if (pattern.includes('203.0.113') || pattern.includes('darknet') || pattern.includes('c2')) {
                return `Binary file /evidence/capture.pcap matches\nids_alert.txt:Dst: 203.0.113.66\nids_alert.txt:Rule: ET POLICY TLS on Non-Standard Port`;
            }
            if (pattern.includes('exfil') || pattern.includes('dns')) {
                return `Binary file /evidence/capture.pcap matches\nids_alert.txt:Rule: ET POLICY Possible DNS Tunneling\nids_alert.txt:Rule: ET EXFIL Large DNS TXT Response Volume`;
            }
            if (pattern.includes('base64') || pattern.includes('ARCHANGEL')) {
                return `Binary file /evidence/capture.pcap matches`;
            }
            return 'grep: No match';
        },

        'base64': function(args, term, engine) {
            if (args.length === 0) return 'Usage: base64 -d [file]\n       echo "encoded_data" | base64 -d';
            const joined = args.join(' ');
            const pd = Forensics03Config._pcapData;

            if (joined.includes('-d')) {
                if (joined.includes('Q1hT') || joined.includes('exfil') || joined.includes('subdomain')) {
                    return 'Decoded DNS subdomain labels:\n  Q1hTLTIwMjQtU2Vj -> CXS-2024-Sec\n  cmV0LVByb2plY3Rz -> ret-Projects\n  LUNsYXNzaWZpZWQ= -> -Classified\n\nReconstructed: CXS-2024-Secret-Projects-Classified';
                }
                return `Decoded base64 payload:\n\n${pd.exfilData.decodedContent}`;
            }
            return 'base64: invalid input';
        },

        'xxd': function(args, term, engine) {
            if (args.length === 0) return 'Usage: xxd [-s seek] [-l len] file';
            return '00000000: d4c3 b2a1 0200 0400 0000 0000 0000 0000  ................\n00000010: ffff 0000 0100 0000 4c7a 5f65 8a12 0500  ........Lz_e....';
        },

        'file': function(args, term, engine) {
            const f = args[0] || '';
            if (f.includes('capture')) return `${f}: pcap capture file, microsecond ts (little-endian) - version 2.4 (Ethernet, capture length 65535)`;
            return `${f}: data`;
        },

        'binwalk': function(args, term, engine) {
            if (args.length === 0) return 'Usage: binwalk [options] <file>';
            return 'DECIMAL       HEXADECIMAL     DESCRIPTION\n------------------------------------------------------\n0             0x0             PCAP capture file header\n24            0x18            Ethernet frame';
        },

        'cat': function(args, term, engine) {
            const f = args[0] || '';
            if (f.includes('ids_alert')) {
                return Forensics03Config.filesystem['/'].children.evidence.children['ids_alert.txt'].content;
            }
            return null;
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
        const tables = tmp.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(c => c.textContent.trim().padEnd(20));
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }
};
