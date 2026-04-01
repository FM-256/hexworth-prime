/* ============================================================
   gui-ne01-wireshark.config.js
   NE-01: OSI Model — Wireshark-Style Packet Inspector GUI Lab
   Hexworth Prime — Network+ Course
   2026-03-27

   SCENARIO: Network analyst at Meridian Corp. A packet capture
   was taken during a reported network issue. Inspect captured
   packets, identify OSI layers, apply display filters, follow
   TCP streams, and identify a DNS poisoning attack redirecting
   traffic from www.meridian.local.
   ============================================================ */

const GUI_NE01_WIRESHARK_CONFIG = {

    id: 'gui-ne01-wireshark',
    title: 'NE-01 Lab: Wireshark Packet Inspector',
    subtitle: 'Analyze a packet capture to identify a DNS poisoning attack across OSI layers',
    duration: 1800, // 30 minutes
    sequentialTasks: true,

    certObjectives: [
        'N10-009 1.1: Compare and contrast the OSI model layers and encapsulation concepts',
        'N10-009 5.3: Given a scenario, use the appropriate network software tools and commands'
    ],

    scoring: {
        taskPoints: 45,
        timeBonus: 100,
        maxScore: 550
    },

    /* ── Known Domains (for nslookup/ping resolution) ──────── */
    knownDomains: {
        'www.meridian.local': '10.0.0.30',
        'dns.meridian.local': '10.0.0.10',
        'mail.meridian.local': '10.0.0.40'
    },

    /* ── Desktop Icons ──────────────────────────────────────── */
    desktop: [
        {
            id: 'packet-analyzer',
            label: 'Packet\nAnalyzer',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Packet Analyzer — capture_2026-03-27.pcap',
                sections: [
                    /* ── Capture List ─────────────── */
                    {
                        id: 'ws-capture',
                        label: 'Capture List',
                        group: 'Capture',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: 'Capture File',
                                statePath: 'webMgmt.wireshark.captureFile',
                                default: 'capture_2026-03-27.pcap — 30 packets, 12,847 bytes'
                            },
                            {
                                type: 'info',
                                label: 'Capture Duration',
                                statePath: 'webMgmt.wireshark.captureDuration',
                                default: '14.328 seconds'
                            },
                            {
                                type: 'table',
                                label: 'Packet List',
                                statePath: 'webMgmt.wireshark.packetTable',
                                columns: [
                                    { key: 'no',       label: 'No.' },
                                    { key: 'time',     label: 'Time' },
                                    { key: 'source',   label: 'Source' },
                                    { key: 'dest',     label: 'Destination' },
                                    { key: 'protocol', label: 'Protocol' },
                                    { key: 'length',   label: 'Len' },
                                    { key: 'info',     label: 'Info' }
                                ]
                            }
                        ]
                    },
                    /* ── Display Filter ───────────── */
                    {
                        id: 'ws-filter',
                        label: 'Display Filter',
                        group: 'Capture',
                        fields: [
                            {
                                type: 'select',
                                label: 'Apply Display Filter',
                                statePath: 'webMgmt.wireshark.activeFilter',
                                options: [
                                    { value: '',                    label: '-- No Filter (Show All) --' },
                                    { value: 'arp',                 label: 'arp' },
                                    { value: 'dns',                 label: 'dns' },
                                    { value: 'tcp.flags.syn==1',    label: 'tcp.flags.syn==1' },
                                    { value: 'tcp',                 label: 'tcp' },
                                    { value: 'http',                label: 'http' },
                                    { value: 'icmp',                label: 'icmp' },
                                    { value: 'tls',                 label: 'tls' },
                                    { value: 'ip.addr==10.0.1.50', label: 'ip.addr==10.0.1.50' },
                                    { value: 'ip.addr==10.99.99.99', label: 'ip.addr==10.99.99.99' }
                                ]
                            },
                            {
                                type: 'table',
                                label: 'Filtered Results',
                                statePath: 'webMgmt.wireshark.filteredTable',
                                columns: [
                                    { key: 'no',       label: 'No.' },
                                    { key: 'time',     label: 'Time' },
                                    { key: 'source',   label: 'Source' },
                                    { key: 'dest',     label: 'Destination' },
                                    { key: 'protocol', label: 'Protocol' },
                                    { key: 'length',   label: 'Len' },
                                    { key: 'info',     label: 'Info' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const ws = state.webMgmt.wireshark;
                            const filter = ws.activeFilter;
                            const all = ws.allPackets || [];

                            if (!filter) {
                                ws.filteredTable = all;
                            } else if (filter === 'arp') {
                                ws.filteredTable = all.filter(p => p.protocol === 'ARP');
                                ws.filterArpApplied = true;
                            } else if (filter === 'dns') {
                                ws.filteredTable = all.filter(p => p.protocol === 'DNS');
                                ws.filterDnsApplied = true;
                            } else if (filter === 'tcp.flags.syn==1') {
                                ws.filteredTable = all.filter(p => p.info.includes('[SYN]') || p.info.includes('[SYN, ACK]'));
                                ws.filterSynApplied = true;
                            } else if (filter === 'tcp') {
                                ws.filteredTable = all.filter(p => p.protocol === 'TCP' || p.protocol === 'HTTP' || p.protocol === 'TLS');
                            } else if (filter === 'http') {
                                ws.filteredTable = all.filter(p => p.protocol === 'HTTP');
                            } else if (filter === 'icmp') {
                                ws.filteredTable = all.filter(p => p.protocol === 'ICMP');
                                ws.filterIcmpApplied = true;
                            } else if (filter === 'tls') {
                                ws.filteredTable = all.filter(p => p.protocol === 'TLS');
                            } else if (filter === 'ip.addr==10.0.1.50') {
                                ws.filteredTable = all.filter(p => p.source === '10.0.1.50' || p.dest === '10.0.1.50');
                            } else if (filter === 'ip.addr==10.99.99.99') {
                                ws.filteredTable = all.filter(p => p.source === '10.99.99.99' || p.dest === '10.99.99.99');
                            } else {
                                ws.filteredTable = all;
                            }
                        }
                    },
                    /* ── Packet Detail ────────────── */
                    {
                        id: 'ws-detail',
                        label: 'Packet Detail',
                        group: 'Inspection',
                        fields: [
                            {
                                type: 'select',
                                label: 'Select Packet to Inspect',
                                statePath: 'webMgmt.wireshark.selectedPacket',
                                options: [
                                    { value: '',   label: '-- Select Packet --' },
                                    { value: '1',  label: '#1 — ARP Request (Who has 10.0.0.1?)' },
                                    { value: '2',  label: '#2 — ARP Reply (10.0.0.1 is at 00:50:56:c0:00:01)' },
                                    { value: '5',  label: '#5 — DNS Query (www.meridian.local)' },
                                    { value: '6',  label: '#6 — DNS Response (10.0.0.30) [LEGITIMATE]' },
                                    { value: '7',  label: '#7 — DNS Response (10.99.99.99) [SUSPICIOUS]' },
                                    { value: '8',  label: '#8 — TCP SYN to 10.99.99.99:80' },
                                    { value: '13', label: '#13 — HTTP GET /index.html' },
                                    { value: '14', label: '#14 — HTTP 200 OK' },
                                    { value: '19', label: '#19 — ICMP Echo Request' },
                                    { value: '20', label: '#20 — ICMP Echo Reply' },
                                    { value: '25', label: '#25 — TLS Client Hello' }
                                ]
                            },
                            {
                                type: 'info',
                                label: 'Layer 1 — Physical',
                                statePath: 'webMgmt.wireshark.detail.layer1',
                                default: 'Select a packet above to inspect'
                            },
                            {
                                type: 'info',
                                label: 'Layer 2 — Data Link (Ethernet II)',
                                statePath: 'webMgmt.wireshark.detail.layer2',
                                default: '--'
                            },
                            {
                                type: 'info',
                                label: 'Layer 3 — Network (IPv4)',
                                statePath: 'webMgmt.wireshark.detail.layer3',
                                default: '--'
                            },
                            {
                                type: 'info',
                                label: 'Layer 4 — Transport (TCP/UDP)',
                                statePath: 'webMgmt.wireshark.detail.layer4',
                                default: '--'
                            },
                            {
                                type: 'info',
                                label: 'Layer 5-7 — Session/Presentation/Application',
                                statePath: 'webMgmt.wireshark.detail.layer567',
                                default: '--'
                            },
                            {
                                type: 'info',
                                label: 'Hex Dump (first 32 bytes)',
                                statePath: 'webMgmt.wireshark.detail.hexdump',
                                default: '--'
                            }
                        ],
                        onSave(state) {
                            const ws = state.webMgmt.wireshark;
                            const pkt = ws.selectedPacket;
                            const d = ws.detail;

                            const packetDetails = {
                                '1': {
                                    layer1: 'Frame 1: 42 bytes on wire, 42 bytes captured on Ethernet interface eth0',
                                    layer2: 'Src: 00:1a:2b:3c:4d:5e (Workstation) -> Dst: ff:ff:ff:ff:ff:ff (Broadcast) | Type: ARP (0x0806)',
                                    layer3: 'ARP Request: Who has 10.0.0.1? Tell 10.0.1.50 | (Layer 2 protocol — no IP header)',
                                    layer4: 'N/A — ARP operates at Layer 2',
                                    layer567: 'N/A — ARP is a Data Link layer protocol',
                                    hexdump: 'ff ff ff ff ff ff 00 1a 2b 3c 4d 5e 08 06 00 01  ........+<M^....\n00 01 08 00 06 04 00 01 00 1a 2b 3c 4d 5e 0a 00  ..........+<M^..'
                                },
                                '2': {
                                    layer1: 'Frame 2: 42 bytes on wire, 42 bytes captured on Ethernet interface eth0',
                                    layer2: 'Src: 00:50:56:c0:00:01 (Gateway) -> Dst: 00:1a:2b:3c:4d:5e (Workstation) | Type: ARP (0x0806)',
                                    layer3: 'ARP Reply: 10.0.0.1 is at 00:50:56:c0:00:01 | (Layer 2 protocol — no IP header)',
                                    layer4: 'N/A — ARP operates at Layer 2',
                                    layer567: 'N/A — ARP is a Data Link layer protocol',
                                    hexdump: '00 1a 2b 3c 4d 5e 00 50 56 c0 00 01 08 06 00 01  ..+<M^.PV.......\n00 01 08 00 06 04 00 02 00 50 56 c0 00 01 0a 00  .........PV.....'
                                },
                                '5': {
                                    layer1: 'Frame 5: 74 bytes on wire, 74 bytes captured on Ethernet interface eth0',
                                    layer2: 'Src: 00:1a:2b:3c:4d:5e -> Dst: 00:50:56:c0:00:0a | Type: IPv4 (0x0800)',
                                    layer3: 'IPv4: 10.0.1.50 -> 10.0.0.10 | TTL: 128 | Protocol: UDP (17)',
                                    layer4: 'UDP: Src Port 54321 -> Dst Port 53 (DNS) | Length: 40',
                                    layer567: 'DNS Query: Standard query 0xa1b2 A www.meridian.local',
                                    hexdump: '00 50 56 c0 00 0a 00 1a 2b 3c 4d 5e 08 00 45 00  .PV.....+<M^..E.\n00 3c 1a 2b 00 00 80 11 a1 b2 0a 00 01 32 0a 00  .<.+.........2..'
                                },
                                '6': {
                                    layer1: 'Frame 6: 90 bytes on wire, 90 bytes captured on Ethernet interface eth0',
                                    layer2: 'Src: 00:50:56:c0:00:0a (DNS Server) -> Dst: 00:1a:2b:3c:4d:5e | Type: IPv4 (0x0800)',
                                    layer3: 'IPv4: 10.0.0.10 -> 10.0.1.50 | TTL: 64 | Protocol: UDP (17)',
                                    layer4: 'UDP: Src Port 53 (DNS) -> Dst Port 54321 | Length: 56',
                                    layer567: 'DNS Response: 0xa1b2 A www.meridian.local -> 10.0.0.30 [LEGITIMATE RESPONSE — correct IP]',
                                    hexdump: '00 1a 2b 3c 4d 5e 00 50 56 c0 00 0a 08 00 45 00  ..+<M^.PV.....E.\n00 50 2b 3c 00 00 40 11 0a 00 00 0a 0a 00 01 32  .P+<..@........2'
                                },
                                '7': {
                                    layer1: 'Frame 7: 90 bytes on wire, 90 bytes captured on Ethernet interface eth0',
                                    layer2: 'Src: 00:de:ad:be:ef:01 (UNKNOWN MAC) -> Dst: 00:1a:2b:3c:4d:5e | Type: IPv4 (0x0800)',
                                    layer3: 'IPv4: 10.99.99.99 -> 10.0.1.50 | TTL: 255 | Protocol: UDP (17)',
                                    layer4: 'UDP: Src Port 53 (DNS) -> Dst Port 54321 | Length: 56',
                                    layer567: 'DNS Response: 0xa1b2 A www.meridian.local -> 10.99.99.99 [POISONED — different IP, unknown source!]',
                                    hexdump: '00 1a 2b 3c 4d 5e 00 de ad be ef 01 08 00 45 00  ..+<M^........E.\n00 50 ff ff 00 00 ff 11 0a 63 63 63 0a 00 01 32  .P.......ccc...2'
                                },
                                '8': {
                                    layer1: 'Frame 8: 66 bytes on wire, 66 bytes captured on Ethernet interface eth0',
                                    layer2: 'Src: 00:1a:2b:3c:4d:5e -> Dst: 00:de:ad:be:ef:01 | Type: IPv4 (0x0800)',
                                    layer3: 'IPv4: 10.0.1.50 -> 10.99.99.99 | TTL: 128 | Protocol: TCP (6)',
                                    layer4: 'TCP: Src Port 49200 -> Dst Port 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460',
                                    layer567: 'TCP 3-way handshake initiation to POISONED IP — client connecting to attacker',
                                    hexdump: '00 de ad be ef 01 00 1a 2b 3c 4d 5e 08 00 45 00  ........+<M^..E.\n00 34 2c 4d 40 00 80 06 0a 00 01 32 0a 63 63 63  .4,M@......2.ccc'
                                },
                                '13': {
                                    layer1: 'Frame 13: 198 bytes on wire, 198 bytes captured on Ethernet interface eth0',
                                    layer2: 'Src: 00:1a:2b:3c:4d:5e -> Dst: 00:de:ad:be:ef:01 | Type: IPv4 (0x0800)',
                                    layer3: 'IPv4: 10.0.1.50 -> 10.99.99.99 | TTL: 128 | Protocol: TCP (6)',
                                    layer4: 'TCP: Src Port 49200 -> Dst Port 80 [PSH, ACK] Seq=1 Ack=1 Len=132',
                                    layer567: 'HTTP GET /index.html HTTP/1.1 | Host: www.meridian.local | User-Agent: Mozilla/5.0',
                                    hexdump: '47 45 54 20 2f 69 6e 64 65 78 2e 68 74 6d 6c 20  GET /index.html \n48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20  HTTP/1.1..Host: '
                                },
                                '14': {
                                    layer1: 'Frame 14: 512 bytes on wire, 512 bytes captured on Ethernet interface eth0',
                                    layer2: 'Src: 00:de:ad:be:ef:01 -> Dst: 00:1a:2b:3c:4d:5e | Type: IPv4 (0x0800)',
                                    layer3: 'IPv4: 10.99.99.99 -> 10.0.1.50 | TTL: 64 | Protocol: TCP (6)',
                                    layer4: 'TCP: Src Port 80 -> Dst Port 49200 [PSH, ACK] Seq=1 Ack=133 Len=446',
                                    layer567: 'HTTP/1.1 200 OK | Content-Type: text/html | [ATTACKER RESPONSE — fake Meridian page]',
                                    hexdump: '48 54 54 50 2f 31 2e 31 20 32 30 30 20 4f 4b 0d  HTTP/1.1 200 OK.\n0a 43 6f 6e 74 65 6e 74 2d 54 79 70 65 3a 20 74  .Content-Type: t'
                                },
                                '19': {
                                    layer1: 'Frame 19: 74 bytes on wire, 74 bytes captured on Ethernet interface eth0',
                                    layer2: 'Src: 00:1a:2b:3c:4d:5e -> Dst: 00:50:56:c0:00:01 | Type: IPv4 (0x0800)',
                                    layer3: 'IPv4: 10.0.1.50 -> 10.0.0.1 | TTL: 128 | Protocol: ICMP (1) | ID: 0x0e21',
                                    layer4: 'ICMP Type 8 (Echo Request) | Code 0 | Checksum: 0x4d5c | Seq: 1',
                                    layer567: 'N/A — ICMP is a Layer 3 protocol (network diagnostics)',
                                    hexdump: '00 50 56 c0 00 01 00 1a 2b 3c 4d 5e 08 00 45 00  .PV.....+<M^..E.\n00 3c 0e 21 00 00 80 01 0a 00 01 32 0a 00 00 01  .<.!.......2....'
                                },
                                '20': {
                                    layer1: 'Frame 20: 74 bytes on wire, 74 bytes captured on Ethernet interface eth0',
                                    layer2: 'Src: 00:50:56:c0:00:01 -> Dst: 00:1a:2b:3c:4d:5e | Type: IPv4 (0x0800)',
                                    layer3: 'IPv4: 10.0.0.1 -> 10.0.1.50 | TTL: 64 | Protocol: ICMP (1) | ID: 0x0e21',
                                    layer4: 'ICMP Type 0 (Echo Reply) | Code 0 | Checksum: 0x555c | Seq: 1',
                                    layer567: 'N/A — ICMP Echo Reply, confirms Layer 3 reachability (TTL=64 = 0 hops)',
                                    hexdump: '00 1a 2b 3c 4d 5e 00 50 56 c0 00 01 08 00 45 00  ..+<M^.PV.....E.\n00 3c 0e 21 00 00 40 01 0a 00 00 01 0a 00 01 32  .<.!..@........2'
                                },
                                '25': {
                                    layer1: 'Frame 25: 244 bytes on wire, 244 bytes captured on Ethernet interface eth0',
                                    layer2: 'Src: 00:1a:2b:3c:4d:5e -> Dst: 00:50:56:c0:00:1e | Type: IPv4 (0x0800)',
                                    layer3: 'IPv4: 10.0.1.50 -> 10.0.0.30 | TTL: 128 | Protocol: TCP (6)',
                                    layer4: 'TCP: Src Port 49210 -> Dst Port 443 [PSH, ACK] Len=178',
                                    layer567: 'TLS Client Hello: Version TLS 1.2 (0x0303) | Cipher Suites: 17 | SNI: www.meridian.local | Layer 6 (Presentation) — encryption negotiation',
                                    hexdump: '16 03 01 00 b1 01 00 00 ad 03 03 5f 4b 7a 8c 2e  ..........._Kz..\n1d 3a 9f 00 20 e8 b0 c4 d5 a7 6b 00 11 c0 2b c0  .:.. .....k...+.'
                                }
                            };

                            if (pkt && packetDetails[pkt]) {
                                const pd = packetDetails[pkt];
                                d.layer1 = pd.layer1;
                                d.layer2 = pd.layer2;
                                d.layer3 = pd.layer3;
                                d.layer4 = pd.layer4;
                                d.layer567 = pd.layer567;
                                d.hexdump = pd.hexdump;

                                // Track inspections
                                if (pkt === '6') ws.dnsLegitInspected = true;
                                if (pkt === '7') ws.dnsPoisonInspected = true;
                                if (pkt === '5' || pkt === '6') ws.dnsInspected = true;
                            }
                        }
                    },
                    /* ── TCP Stream ───────────────── */
                    {
                        id: 'ws-stream',
                        label: 'TCP Stream',
                        group: 'Inspection',
                        fields: [
                            {
                                type: 'select',
                                label: 'Follow TCP Stream',
                                statePath: 'webMgmt.wireshark.selectedStream',
                                options: [
                                    { value: '',        label: '-- Select Stream --' },
                                    { value: 'stream0', label: 'Stream 0: 10.0.1.50:49200 <-> 10.99.99.99:80 (HTTP)' },
                                    { value: 'stream1', label: 'Stream 1: 10.0.1.50:49210 <-> 10.0.0.30:443 (TLS)' }
                                ]
                            },
                            {
                                type: 'info',
                                label: 'Stream Content',
                                statePath: 'webMgmt.wireshark.streamContent',
                                default: 'Select a TCP stream above to follow'
                            },
                            {
                                type: 'info',
                                label: 'Stream Analysis',
                                statePath: 'webMgmt.wireshark.streamAnalysis',
                                default: '--'
                            }
                        ],
                        onSave(state) {
                            const ws = state.webMgmt.wireshark;
                            if (ws.selectedStream === 'stream0') {
                                ws.streamContent = 'GET /index.html HTTP/1.1\\r\\nHost: www.meridian.local\\r\\nUser-Agent: Mozilla/5.0\\r\\n\\r\\nHTTP/1.1 200 OK\\r\\nContent-Type: text/html\\r\\nServer: nginx/1.18\\r\\n\\r\\n<html><head><title>Meridian Corp</title></head>... [SERVED BY 10.99.99.99 — ATTACKER]';
                                ws.streamAnalysis = 'WARNING: This HTTP stream connects to 10.99.99.99 (poisoned DNS result). The real server is 10.0.0.30. Client sent credentials to attacker-controlled host.';
                                ws.httpStreamFollowed = true;
                            } else if (ws.selectedStream === 'stream1') {
                                ws.streamContent = 'TLS Client Hello (10.0.1.50 -> 10.0.0.30:443) | Cipher: TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 | SNI: www.meridian.local | [Encrypted Application Data follows]';
                                ws.streamAnalysis = 'This TLS stream connects to the REAL server 10.0.0.30 on port 443. Layer 6 (Presentation) encryption negotiation successful.';
                            }
                        }
                    },
                    /* ── Statistics ───────────────── */
                    {
                        id: 'ws-stats',
                        label: 'Statistics',
                        group: 'Analysis',
                        fields: [
                            {
                                type: 'select',
                                label: 'Statistics View',
                                statePath: 'webMgmt.wireshark.statsView',
                                options: [
                                    { value: '',            label: '-- Select View --' },
                                    { value: 'hierarchy',   label: 'Protocol Hierarchy' },
                                    { value: 'conversations', label: 'Conversations' },
                                    { value: 'endpoints',   label: 'Endpoints' }
                                ]
                            },
                            {
                                type: 'table',
                                label: 'Statistics Data',
                                statePath: 'webMgmt.wireshark.statsTable',
                                columns: [
                                    { key: 'item',    label: 'Item' },
                                    { key: 'count',   label: 'Count' },
                                    { key: 'percent', label: '%' },
                                    { key: 'bytes',   label: 'Bytes' }
                                ]
                            },
                            {
                                type: 'info',
                                label: 'Analysis Note',
                                statePath: 'webMgmt.wireshark.statsNote',
                                default: 'Select a statistics view and click Apply'
                            }
                        ],
                        onSave(state) {
                            const ws = state.webMgmt.wireshark;
                            const view = ws.statsView;

                            if (view === 'hierarchy') {
                                ws.statsTable = [
                                    { item: 'Ethernet',  count: '30', percent: '100.0', bytes: '12847' },
                                    { item: '  IPv4',    count: '26', percent: '86.7',  bytes: '11905' },
                                    { item: '    TCP',   count: '14', percent: '46.7',  bytes: '7234' },
                                    { item: '      HTTP', count: '4', percent: '13.3',  bytes: '3120' },
                                    { item: '      TLS', count: '3', percent: '10.0',  bytes: '1890' },
                                    { item: '    UDP',   count: '6',  percent: '20.0',  bytes: '2340' },
                                    { item: '      DNS', count: '6',  percent: '20.0',  bytes: '2340' },
                                    { item: '    ICMP',  count: '6',  percent: '20.0',  bytes: '2331' },
                                    { item: '  ARP',     count: '4',  percent: '13.3',  bytes: '942' }
                                ];
                                ws.statsNote = 'Protocol Hierarchy: TCP dominates at 46.7%. DNS traffic (20%) includes both legitimate and poisoned responses. ARP at Layer 2 (13.3%).';
                                ws.statsViewed = true;
                            } else if (view === 'conversations') {
                                ws.statsTable = [
                                    { item: '10.0.1.50 <-> 10.99.99.99',  count: '8',  percent: '26.7', bytes: '4102' },
                                    { item: '10.0.1.50 <-> 10.0.0.10',    count: '6',  percent: '20.0', bytes: '2340' },
                                    { item: '10.0.1.50 <-> 10.0.0.30',    count: '5',  percent: '16.7', bytes: '2890' },
                                    { item: '10.0.1.50 <-> 10.0.0.1',     count: '7',  percent: '23.3', bytes: '2573' },
                                    { item: '10.0.1.50 <-> ff:ff:ff:ff',  count: '4',  percent: '13.3', bytes: '942' }
                                ];
                                ws.statsNote = 'Note: 10.99.99.99 has the most TCP traffic (8 packets). This IP appeared from a poisoned DNS response — it is the attacker.';
                                ws.statsViewed = true;
                            } else if (view === 'endpoints') {
                                ws.statsTable = [
                                    { item: '10.0.1.50 (Workstation)',  count: '26', percent: '86.7', bytes: '8940' },
                                    { item: '10.99.99.99 (UNKNOWN)',    count: '8',  percent: '26.7', bytes: '4102' },
                                    { item: '10.0.0.10 (DNS Server)',   count: '6',  percent: '20.0', bytes: '2340' },
                                    { item: '10.0.0.1 (Gateway)',       count: '7',  percent: '23.3', bytes: '2573' },
                                    { item: '10.0.0.30 (Web Server)',   count: '5',  percent: '16.7', bytes: '2890' }
                                ];
                                ws.statsNote = 'Endpoint 10.99.99.99 is not a known network device. It injected a poisoned DNS response and served fake HTTP content.';
                                ws.statsViewed = true;
                            }
                        }
                    }
                ]
            }
        },
        {
            id: 'cmd',
            label: 'Command\nPrompt',
            icon: 'terminal',
            window: 'cmd'
        },
        {
            id: 'notepad',
            label: 'Notepad',
            icon: 'generic',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Notepad — Incident Findings',
                sections: [
                    {
                        id: 'notepad-findings',
                        label: 'Incident Report',
                        fields: [
                            {
                                type: 'text',
                                label: 'Attacker IP Address',
                                statePath: 'webMgmt.notepad.attackerIp',
                                placeholder: 'IP of the attacker'
                            },
                            {
                                type: 'text',
                                label: 'Poisoned Domain',
                                statePath: 'webMgmt.notepad.poisonedDomain',
                                placeholder: 'Which domain was targeted?'
                            },
                            {
                                type: 'text',
                                label: 'Correct Server IP',
                                statePath: 'webMgmt.notepad.correctIp',
                                placeholder: 'What is the real IP for the domain?'
                            },
                            {
                                type: 'select',
                                label: 'Attack Type',
                                statePath: 'webMgmt.notepad.attackType',
                                options: [
                                    { value: '',                    label: '-- Select Attack Type --' },
                                    { value: 'arp-spoofing',       label: 'ARP Spoofing' },
                                    { value: 'dns-cache-poisoning', label: 'DNS Cache Poisoning' },
                                    { value: 'syn-flood',          label: 'SYN Flood' },
                                    { value: 'man-in-the-middle',  label: 'Man-in-the-Middle' },
                                    { value: 'deauth-attack',      label: 'Deauthentication Attack' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Affected OSI Layers',
                                statePath: 'webMgmt.notepad.affectedLayers',
                                placeholder: 'Which OSI layers are involved? (e.g. 2, 3, 4, 7)'
                            },
                            {
                                type: 'text',
                                label: 'Attacker MAC Address',
                                statePath: 'webMgmt.notepad.attackerMac',
                                placeholder: 'MAC address from the poisoned packet'
                            },
                            {
                                type: 'text',
                                label: 'Evidence Summary',
                                statePath: 'webMgmt.notepad.evidence',
                                placeholder: 'Describe the key evidence from the capture'
                            }
                        ],
                        onSave(state) {
                            const n = state.webMgmt.notepad;
                            // Documentation is complete if key fields are correctly filled
                            const ipMatch = n.attackerIp && n.attackerIp.includes('10.99.99.99');
                            const domainMatch = n.poisonedDomain && n.poisonedDomain.toLowerCase().includes('meridian');
                            const correctMatch = n.correctIp && n.correctIp.includes('10.0.0.30');
                            const typeMatch = n.attackType === 'dns-cache-poisoning';
                            const layersMatch = n.affectedLayers && n.affectedLayers.length > 0;

                            state.webMgmt.notepad.documented = (ipMatch && domainMatch && correctMatch && typeMatch && layersMatch);
                        }
                    }
                ]
            }
        }
    ],

    /* ── Initial State ──────────────────────────────────────── */
    initialState: {
        adapters: [
            {
                name: 'Ethernet0',
                description: 'Intel(R) I219-V Gigabit Network Adapter',
                enabled: true,
                connected: true,
                dhcp: false,
                ip: '10.0.1.50',
                mask: '255.255.255.0',
                gateway: '10.0.0.1',
                dns: ['10.0.0.10'],
                mac: '00:1A:2B:3C:4D:5E',
                speed: '1 Gbps',
                duplex: 'Full Duplex',
                driver: 'Intel Corporation',
                driverVersion: '12.19.1.37',
                irq: '11'
            }
        ],
        services: [
            { name: 'DHCP Client',       status: 'running', startup: 'Automatic' },
            { name: 'DNS Client',        status: 'running', startup: 'Automatic' },
            { name: 'Windows Firewall',  status: 'running', startup: 'Automatic' },
            { name: 'Network Location',  status: 'running', startup: 'Automatic' },
            { name: 'Workstation',       status: 'running', startup: 'Automatic' }
        ],
        connectivity: {
            gateway: true,
            internet: true,
            dns: true
        },
        webMgmt: {
            wireshark: {
                captureFile: 'capture_2026-03-27.pcap — 30 packets, 12,847 bytes',
                captureDuration: '14.328 seconds',
                activeFilter: '',
                filterArpApplied: false,
                filterDnsApplied: false,
                filterSynApplied: false,
                filterIcmpApplied: false,
                dnsInspected: false,
                dnsLegitInspected: false,
                dnsPoisonInspected: false,
                httpStreamFollowed: false,
                statsViewed: false,
                selectedPacket: '',
                selectedStream: '',
                statsView: '',
                detail: {
                    layer1: 'Select a packet to inspect',
                    layer2: '--',
                    layer3: '--',
                    layer4: '--',
                    layer567: '--',
                    hexdump: '--'
                },
                streamContent: 'Select a TCP stream to follow',
                streamAnalysis: '--',
                statsNote: 'Select a statistics view and click Apply',
                statsTable: [],
                filteredTable: [],
                /* ── Full 30-packet capture ──── */
                allPackets: [
                    { no: '1',  time: '0.000000', source: '10.0.1.50',    dest: 'ff:ff:ff:ff:ff:ff', protocol: 'ARP',  length: '42',  info: 'Who has 10.0.0.1? Tell 10.0.1.50' },
                    { no: '2',  time: '0.000312', source: '10.0.0.1',     dest: '10.0.1.50',         protocol: 'ARP',  length: '42',  info: '10.0.0.1 is at 00:50:56:c0:00:01' },
                    { no: '3',  time: '0.412105', source: '10.0.1.50',    dest: 'ff:ff:ff:ff:ff:ff', protocol: 'ARP',  length: '42',  info: 'Who has 10.0.0.10? Tell 10.0.1.50' },
                    { no: '4',  time: '0.412840', source: '10.0.0.10',    dest: '10.0.1.50',         protocol: 'ARP',  length: '42',  info: '10.0.0.10 is at 00:50:56:c0:00:0a' },
                    { no: '5',  time: '0.831204', source: '10.0.1.50',    dest: '10.0.0.10',         protocol: 'DNS',  length: '74',  info: 'Standard query A www.meridian.local' },
                    { no: '6',  time: '0.832105', source: '10.0.0.10',    dest: '10.0.1.50',         protocol: 'DNS',  length: '90',  info: 'Response A www.meridian.local -> 10.0.0.30' },
                    { no: '7',  time: '0.832201', source: '10.99.99.99',  dest: '10.0.1.50',         protocol: 'DNS',  length: '90',  info: 'Response A www.meridian.local -> 10.99.99.99 [POISONED]' },
                    { no: '8',  time: '1.001340', source: '10.0.1.50',    dest: '10.99.99.99',       protocol: 'TCP',  length: '66',  info: '49200 -> 80 [SYN] Seq=0 Win=64240' },
                    { no: '9',  time: '1.002105', source: '10.99.99.99',  dest: '10.0.1.50',         protocol: 'TCP',  length: '66',  info: '80 -> 49200 [SYN, ACK] Seq=0 Ack=1 Win=65535' },
                    { no: '10', time: '1.002340', source: '10.0.1.50',    dest: '10.99.99.99',       protocol: 'TCP',  length: '54',  info: '49200 -> 80 [ACK] Seq=1 Ack=1 Win=64240' },
                    { no: '11', time: '2.105620', source: '10.0.1.50',    dest: '10.0.0.10',         protocol: 'DNS',  length: '74',  info: 'Standard query A mail.meridian.local' },
                    { no: '12', time: '2.106340', source: '10.0.0.10',    dest: '10.0.1.50',         protocol: 'DNS',  length: '90',  info: 'Response A mail.meridian.local -> 10.0.0.40' },
                    { no: '13', time: '3.210540', source: '10.0.1.50',    dest: '10.99.99.99',       protocol: 'HTTP', length: '198', info: 'GET /index.html HTTP/1.1' },
                    { no: '14', time: '3.211903', source: '10.99.99.99',  dest: '10.0.1.50',         protocol: 'HTTP', length: '512', info: 'HTTP/1.1 200 OK (text/html)' },
                    { no: '15', time: '3.212105', source: '10.0.1.50',    dest: '10.99.99.99',       protocol: 'TCP',  length: '54',  info: '49200 -> 80 [ACK] Seq=133 Ack=447 Win=63794' },
                    { no: '16', time: '4.105200', source: '10.0.1.50',    dest: '10.99.99.99',       protocol: 'HTTP', length: '186', info: 'GET /login.html HTTP/1.1' },
                    { no: '17', time: '4.106540', source: '10.99.99.99',  dest: '10.0.1.50',         protocol: 'HTTP', length: '648', info: 'HTTP/1.1 200 OK (text/html) [CREDENTIAL HARVESTER]' },
                    { no: '18', time: '4.107105', source: '10.0.1.50',    dest: '10.99.99.99',       protocol: 'TCP',  length: '54',  info: '49200 -> 80 [ACK] Seq=319 Ack=1041 Win=63200' },
                    { no: '19', time: '5.302105', source: '10.0.1.50',    dest: '10.0.0.1',          protocol: 'ICMP', length: '74',  info: 'Echo (ping) request id=0x0e21 seq=1 TTL=128' },
                    { no: '20', time: '5.302840', source: '10.0.0.1',     dest: '10.0.1.50',         protocol: 'ICMP', length: '74',  info: 'Echo (ping) reply id=0x0e21 seq=1 TTL=64' },
                    { no: '21', time: '6.302105', source: '10.0.1.50',    dest: '10.0.0.1',          protocol: 'ICMP', length: '74',  info: 'Echo (ping) request id=0x0e21 seq=2 TTL=128' },
                    { no: '22', time: '6.302840', source: '10.0.0.1',     dest: '10.0.1.50',         protocol: 'ICMP', length: '74',  info: 'Echo (ping) reply id=0x0e21 seq=2 TTL=64' },
                    { no: '23', time: '7.302105', source: '10.0.1.50',    dest: '10.0.0.1',          protocol: 'ICMP', length: '74',  info: 'Echo (ping) request id=0x0e21 seq=3 TTL=128' },
                    { no: '24', time: '7.302840', source: '10.0.0.1',     dest: '10.0.1.50',         protocol: 'ICMP', length: '74',  info: 'Echo (ping) reply id=0x0e21 seq=3 TTL=64' },
                    { no: '25', time: '8.501200', source: '10.0.1.50',    dest: '10.0.0.30',         protocol: 'TLS',  length: '244', info: 'Client Hello, TLS 1.2, SNI=www.meridian.local' },
                    { no: '26', time: '8.502340', source: '10.0.0.30',    dest: '10.0.1.50',         protocol: 'TLS',  length: '1200', info: 'Server Hello, Certificate, Server Hello Done' },
                    { no: '27', time: '8.503105', source: '10.0.1.50',    dest: '10.0.0.30',         protocol: 'TLS',  length: '130', info: 'Client Key Exchange, Change Cipher Spec, Finished' },
                    { no: '28', time: '10.105200', source: '10.0.1.50',   dest: '10.0.0.10',         protocol: 'DNS',  length: '74',  info: 'Standard query A dns.meridian.local' },
                    { no: '29', time: '10.106340', source: '10.0.0.10',   dest: '10.0.1.50',         protocol: 'DNS',  length: '90',  info: 'Response A dns.meridian.local -> 10.0.0.10' },
                    { no: '30', time: '14.328105', source: '10.99.99.99', dest: '10.0.1.50',         protocol: 'DNS',  length: '90',  info: 'Response A dns.meridian.local -> 10.99.99.99 [POISONED]' }
                ],
                packetTable: [
                    { no: '1',  time: '0.000000', source: '10.0.1.50',    dest: 'ff:ff:ff:ff:ff:ff', protocol: 'ARP',  length: '42',  info: 'Who has 10.0.0.1? Tell 10.0.1.50' },
                    { no: '2',  time: '0.000312', source: '10.0.0.1',     dest: '10.0.1.50',         protocol: 'ARP',  length: '42',  info: '10.0.0.1 is at 00:50:56:c0:00:01' },
                    { no: '3',  time: '0.412105', source: '10.0.1.50',    dest: 'ff:ff:ff:ff:ff:ff', protocol: 'ARP',  length: '42',  info: 'Who has 10.0.0.10? Tell 10.0.1.50' },
                    { no: '4',  time: '0.412840', source: '10.0.0.10',    dest: '10.0.1.50',         protocol: 'ARP',  length: '42',  info: '10.0.0.10 is at 00:50:56:c0:00:0a' },
                    { no: '5',  time: '0.831204', source: '10.0.1.50',    dest: '10.0.0.10',         protocol: 'DNS',  length: '74',  info: 'Standard query A www.meridian.local' },
                    { no: '6',  time: '0.832105', source: '10.0.0.10',    dest: '10.0.1.50',         protocol: 'DNS',  length: '90',  info: 'Response A www.meridian.local -> 10.0.0.30' },
                    { no: '7',  time: '0.832201', source: '10.99.99.99',  dest: '10.0.1.50',         protocol: 'DNS',  length: '90',  info: 'Response A www.meridian.local -> 10.99.99.99 [POISONED]' },
                    { no: '8',  time: '1.001340', source: '10.0.1.50',    dest: '10.99.99.99',       protocol: 'TCP',  length: '66',  info: '49200 -> 80 [SYN] Seq=0 Win=64240' },
                    { no: '9',  time: '1.002105', source: '10.99.99.99',  dest: '10.0.1.50',         protocol: 'TCP',  length: '66',  info: '80 -> 49200 [SYN, ACK] Seq=0 Ack=1 Win=65535' },
                    { no: '10', time: '1.002340', source: '10.0.1.50',    dest: '10.99.99.99',       protocol: 'TCP',  length: '54',  info: '49200 -> 80 [ACK] Seq=1 Ack=1 Win=64240' },
                    { no: '11', time: '2.105620', source: '10.0.1.50',    dest: '10.0.0.10',         protocol: 'DNS',  length: '74',  info: 'Standard query A mail.meridian.local' },
                    { no: '12', time: '2.106340', source: '10.0.0.10',    dest: '10.0.1.50',         protocol: 'DNS',  length: '90',  info: 'Response A mail.meridian.local -> 10.0.0.40' },
                    { no: '13', time: '3.210540', source: '10.0.1.50',    dest: '10.99.99.99',       protocol: 'HTTP', length: '198', info: 'GET /index.html HTTP/1.1' },
                    { no: '14', time: '3.211903', source: '10.99.99.99',  dest: '10.0.1.50',         protocol: 'HTTP', length: '512', info: 'HTTP/1.1 200 OK (text/html)' },
                    { no: '15', time: '3.212105', source: '10.0.1.50',    dest: '10.99.99.99',       protocol: 'TCP',  length: '54',  info: '49200 -> 80 [ACK] Seq=133 Ack=447 Win=63794' },
                    { no: '16', time: '4.105200', source: '10.0.1.50',    dest: '10.99.99.99',       protocol: 'HTTP', length: '186', info: 'GET /login.html HTTP/1.1' },
                    { no: '17', time: '4.106540', source: '10.99.99.99',  dest: '10.0.1.50',         protocol: 'HTTP', length: '648', info: 'HTTP/1.1 200 OK (text/html) [CREDENTIAL HARVESTER]' },
                    { no: '18', time: '4.107105', source: '10.0.1.50',    dest: '10.99.99.99',       protocol: 'TCP',  length: '54',  info: '49200 -> 80 [ACK] Seq=319 Ack=1041 Win=63200' },
                    { no: '19', time: '5.302105', source: '10.0.1.50',    dest: '10.0.0.1',          protocol: 'ICMP', length: '74',  info: 'Echo (ping) request id=0x0e21 seq=1 TTL=128' },
                    { no: '20', time: '5.302840', source: '10.0.0.1',     dest: '10.0.1.50',         protocol: 'ICMP', length: '74',  info: 'Echo (ping) reply id=0x0e21 seq=1 TTL=64' },
                    { no: '21', time: '6.302105', source: '10.0.1.50',    dest: '10.0.0.1',          protocol: 'ICMP', length: '74',  info: 'Echo (ping) request id=0x0e21 seq=2 TTL=128' },
                    { no: '22', time: '6.302840', source: '10.0.0.1',     dest: '10.0.1.50',         protocol: 'ICMP', length: '74',  info: 'Echo (ping) reply id=0x0e21 seq=2 TTL=64' },
                    { no: '23', time: '7.302105', source: '10.0.1.50',    dest: '10.0.0.1',          protocol: 'ICMP', length: '74',  info: 'Echo (ping) request id=0x0e21 seq=3 TTL=128' },
                    { no: '24', time: '7.302840', source: '10.0.0.1',     dest: '10.0.1.50',         protocol: 'ICMP', length: '74',  info: 'Echo (ping) reply id=0x0e21 seq=3 TTL=64' },
                    { no: '25', time: '8.501200', source: '10.0.1.50',    dest: '10.0.0.30',         protocol: 'TLS',  length: '244', info: 'Client Hello, TLS 1.2, SNI=www.meridian.local' },
                    { no: '26', time: '8.502340', source: '10.0.0.30',    dest: '10.0.1.50',         protocol: 'TLS',  length: '1200', info: 'Server Hello, Certificate, Server Hello Done' },
                    { no: '27', time: '8.503105', source: '10.0.1.50',    dest: '10.0.0.30',         protocol: 'TLS',  length: '130', info: 'Client Key Exchange, Change Cipher Spec, Finished' },
                    { no: '28', time: '10.105200', source: '10.0.1.50',   dest: '10.0.0.10',         protocol: 'DNS',  length: '74',  info: 'Standard query A dns.meridian.local' },
                    { no: '29', time: '10.106340', source: '10.0.0.10',   dest: '10.0.1.50',         protocol: 'DNS',  length: '90',  info: 'Response A dns.meridian.local -> 10.0.0.10' },
                    { no: '30', time: '14.328105', source: '10.99.99.99', dest: '10.0.1.50',         protocol: 'DNS',  length: '90',  info: 'Response A dns.meridian.local -> 10.99.99.99 [POISONED]' }
                ]
            },
            notepad: {
                attackerIp: '',
                poisonedDomain: '',
                correctIp: '',
                attackType: '',
                affectedLayers: '',
                attackerMac: '',
                evidence: '',
                documented: false
            }
        }
    },

    /* ── 10 Tasks ──────────────────────────────────────────── */
    tasks: [
        /* ── Task 1: Open the Packet Analyzer ────────────── */
        {
            id: 'task-01-open-analyzer',
            title: '1. Open Packet Analyzer',
            description: 'Double-click the "Packet Analyzer" icon on the desktop to open the Wireshark-style capture viewer. Review the 30 captured packets in the Capture List.',
            verify: {
                type: 'window_opened',
                window: 'web_mgmt'
            }
        },
        /* ── Task 2: Filter ARP — identify Layer 2 ───────── */
        {
            id: 'task-02-filter-arp',
            title: '2. Apply ARP Filter — Identify Layer 2 MAC Addresses',
            description: 'Navigate to Display Filter. Select "arp" from the filter dropdown and click Apply. Examine the ARP request/reply pairs. Note the MAC addresses — ARP operates at OSI Layer 2 (Data Link), mapping IP addresses to hardware addresses.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wireshark.filterArpApplied',
                value: true
            }
        },
        /* ── Task 3: Filter DNS — find the query ─────────── */
        {
            id: 'task-03-filter-dns',
            title: '3. Apply DNS Filter — Find the Query for www.meridian.local',
            description: 'Change the display filter to "dns" and click Apply. Find the DNS query for www.meridian.local (packet #5). DNS operates at OSI Layer 7 (Application) using UDP port 53 at Layer 4.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wireshark.filterDnsApplied',
                value: true
            }
        },
        /* ── Task 4: Inspect DNS response packet ─────────── */
        {
            id: 'task-04-inspect-dns',
            title: '4. Inspect the DNS Response Packet',
            description: 'Navigate to Packet Detail. Select packet #6 (the legitimate DNS response for www.meridian.local). Expand the detail tree to see all OSI layers: Frame (L1), Ethernet (L2), IPv4 (L3), UDP (L4), DNS Application data (L7). Note the resolved IP: 10.0.0.30.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wireshark.dnsInspected',
                value: true
            }
        },
        /* ── Task 5: Identify the poisoned DNS response ──── */
        {
            id: 'task-05-identify-poison',
            title: '5. Identify the POISONED DNS Response',
            description: 'Now select packet #7 in Packet Detail. This is a SECOND DNS response for the same query — but from IP 10.99.99.99 with a different MAC (00:de:ad:be:ef:01). It resolves www.meridian.local to 10.99.99.99 instead of 10.0.0.30. This is DNS cache poisoning!',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wireshark.dnsPoisonInspected',
                value: true
            }
        },
        /* ── Task 6: Filter TCP SYN — 3-way handshake ────── */
        {
            id: 'task-06-filter-syn',
            title: '6. Apply SYN Filter — Find TCP 3-Way Handshake',
            description: 'Navigate to Display Filter. Select "tcp.flags.syn==1" and click Apply. This shows only SYN and SYN/ACK packets — the initiation of TCP connections at Layer 4 (Transport). Note that the client connects to 10.99.99.99 (the poisoned IP).',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wireshark.filterSynApplied',
                value: true
            }
        },
        /* ── Task 7: Follow TCP stream ───────────────────── */
        {
            id: 'task-07-follow-stream',
            title: '7. Follow the HTTP TCP Stream',
            description: 'Navigate to TCP Stream. Select "Stream 0" (the HTTP conversation between the workstation and 10.99.99.99) and click Apply. Read the GET request and 200 response — the client unknowingly connected to the attacker\'s server.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wireshark.httpStreamFollowed',
                value: true
            }
        },
        /* ── Task 8: Filter ICMP — Layer 3 TTL ───────────── */
        {
            id: 'task-08-filter-icmp',
            title: '8. Apply ICMP Filter — Examine Layer 3 TTL Values',
            description: 'Navigate to Display Filter. Select "icmp" and click Apply. These ping packets operate at OSI Layer 3 (Network). Note the TTL values: request TTL=128 (Windows default), reply TTL=64 (Linux/router). TTL is a Layer 3 IPv4 header field.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wireshark.filterIcmpApplied',
                value: true
            }
        },
        /* ── Task 9: View protocol hierarchy stats ───────── */
        {
            id: 'task-09-stats',
            title: '9. View Protocol Hierarchy Statistics',
            description: 'Navigate to Statistics. Select "Protocol Hierarchy" from the dropdown and click Apply. Review the percentage breakdown: Ethernet wraps IPv4 (86.7%) and ARP (13.3%). IPv4 carries TCP (46.7%), UDP/DNS (20%), and ICMP (20%). This maps the entire OSI stack.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wireshark.statsViewed',
                value: true
            }
        },
        /* ── Task 10: Document findings in Notepad ───────── */
        {
            id: 'task-10-document',
            title: '10. Document Incident Findings',
            description: 'Open Notepad and complete the incident report: Attacker IP (10.99.99.99), poisoned domain (www.meridian.local), correct IP (10.0.0.30), attack type (DNS Cache Poisoning), and affected OSI layers. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.notepad.documented',
                value: true
            }
        }
    ]
};
