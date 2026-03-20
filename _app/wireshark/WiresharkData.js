/**
 * WiresharkData.js — Hexworth Prime Wireshark Hub
 *
 * Defines all 6 sections, 32 total modules across:
 *   Section 1: Fundamentals (6 modules)
 *   Section 2: Protocol Analysis (7 modules)
 *   Section 3: Security Analysis (6 modules)
 *   Section 4: Forensic Capture (5 modules)
 *   Section 5: Wireless & IoT (4 modules)
 *   Section 6: Advanced & Automation (4 modules)
 *
 * House ownership: Eye (primary)
 * Progress tracked in localStorage: hexworth_wireshark_progress
 */

const WiresharkData = {

    version: '1.0.0',

    hub: {
        name: 'Wireshark Hub',
        tagline: 'Capture. Dissect. Investigate.',
        description: 'Master packet analysis from first launch to advanced automation. 6 sections, 32 modules covering capture techniques, protocol dissection, security analysis, forensic workflows, wireless capture, and scripted automation.',
        icon: '../../assets/images/icons/icon-network.webp',
        accentColor: '#06b6d4',
        accentColorDim: 'rgba(6, 182, 212, 0.15)',
        secondaryColor: '#6366f1',
        greenAccent: '#4ade80',
        progressKey: 'hexworth_wireshark_progress',
        house: 'eye'
    },

    stats: {
        totalModules: 32,
        sections: 6,
        estimatedHours: 28,
        certAlignments: ['CompTIA CySA+ (CS0-003)', 'CompTIA Network+', 'EC-Council CEH', 'GIAC GPEN', 'Cisco CyberOps Associate']
    },

    sections: [
        {
            id: 'fundamentals',
            name: 'Fundamentals',
            shortName: 'Fundamentals',
            description: 'Navigate the Wireshark interface, configure capture options, build display filters, manage profiles, and operate the filter expression builder with confidence.',
            icon: '../../assets/images/icons/icon-compass.webp',
            color: '#06b6d4',
            colorDim: 'rgba(6, 182, 212, 0.12)',
            moduleCount: 6,
            modules: [
                {
                    id: 'ws-01',
                    title: 'Interface Tour',
                    subtitle: 'Packet list, details pane, bytes pane, toolbar',
                    type: 'module',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'sections/fundamentals/ws-01-interface-tour.module.html'
                },
                {
                    id: 'ws-02',
                    title: 'Capture Options & Interfaces',
                    subtitle: 'NIC selection, promiscuous mode, ring buffers, snaplen',
                    type: 'module',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'sections/fundamentals/ws-02-capture-options.module.html'
                },
                {
                    id: 'ws-03',
                    title: 'Capture Filters (BPF)',
                    subtitle: 'Berkeley Packet Filter syntax, host, port, proto rules',
                    type: 'module',
                    difficulty: 'beginner',
                    duration: '35 min',
                    href: 'sections/fundamentals/ws-03-capture-filters.module.html'
                },
                {
                    id: 'ws-04',
                    title: 'Display Filters',
                    subtitle: 'Comparison operators, logical chaining, field references',
                    type: 'module',
                    difficulty: 'beginner',
                    duration: '40 min',
                    href: 'sections/fundamentals/ws-04-display-filters.module.html'
                },
                {
                    id: 'ws-05',
                    title: 'Filter Expression Builder',
                    subtitle: 'GUI builder, autocompletion, filter bookmarks',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'sections/fundamentals/ws-05-filter-builder.module.html'
                },
                {
                    id: 'ws-06',
                    title: 'Profiles & Preferences',
                    subtitle: 'Column layouts, coloring rules, custom profiles',
                    type: 'module',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'sections/fundamentals/ws-06-profiles.module.html'
                }
            ]
        },
        {
            id: 'protocol-analysis',
            name: 'Protocol Analysis',
            shortName: 'Protocols',
            description: 'Dissect Ethernet frames, ARP, ICMP, TCP handshakes, UDP/DNS queries, full HTTP/HTTPS sessions, and DHCP leases in the protocol tree.',
            icon: '../../assets/images/icons/icon-branch.webp',
            color: '#6366f1',
            colorDim: 'rgba(99, 102, 241, 0.12)',
            moduleCount: 7,
            modules: [
                {
                    id: 'ws-07',
                    title: 'Ethernet & Frame Analysis',
                    subtitle: 'MAC addressing, frame structure, 802.1Q VLAN tags',
                    type: 'module',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'sections/protocol-analysis/ws-07-ethernet.module.html'
                },
                {
                    id: 'ws-08',
                    title: 'ARP Deep Dive',
                    subtitle: 'Request/reply, gratuitous ARP, ARP cache poisoning indicators',
                    type: 'module',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'sections/protocol-analysis/ws-08-arp.module.html'
                },
                {
                    id: 'ws-09',
                    title: 'ICMP Analysis',
                    subtitle: 'Echo, unreachable, TTL exceeded, type/code matrix',
                    type: 'module',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'sections/protocol-analysis/ws-09-icmp.module.html'
                },
                {
                    id: 'ws-10',
                    title: 'TCP: Streams & Flags',
                    subtitle: 'Three-way handshake, teardown, SYN/ACK/FIN/RST, retransmits',
                    type: 'module',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'sections/protocol-analysis/ws-10-tcp.module.html'
                },
                {
                    id: 'ws-11',
                    title: 'UDP & DNS Analysis',
                    subtitle: 'DNS query/response parsing, A/AAAA/MX/PTR records, TTLs',
                    type: 'module',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'sections/protocol-analysis/ws-11-udp-dns.module.html'
                },
                {
                    id: 'ws-12',
                    title: 'HTTP & HTTPS Inspection',
                    subtitle: 'Request/response parsing, session reassembly, TLS handshake fields',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'sections/protocol-analysis/ws-12-http-https.module.html'
                },
                {
                    id: 'ws-13',
                    title: 'DHCP Lease Analysis',
                    subtitle: 'DORA process, option fields, rogue DHCP detection',
                    type: 'module',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'sections/protocol-analysis/ws-13-dhcp.module.html'
                }
            ]
        },
        {
            id: 'security-analysis',
            name: 'Security Analysis',
            shortName: 'Security',
            description: 'Identify malware beaconing patterns, C2 channel indicators, data exfiltration, TLS/JA3 fingerprinting, credential exposure, and port scan signatures.',
            icon: '../../assets/images/icons/icon-shield.webp',
            color: '#f87171',
            colorDim: 'rgba(248, 113, 113, 0.12)',
            moduleCount: 6,
            modules: [
                {
                    id: 'ws-14',
                    title: 'Malware Traffic Patterns',
                    subtitle: 'Beaconing intervals, callback signatures, IOC extraction',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'sections/security-analysis/ws-14-malware-traffic.module.html'
                },
                {
                    id: 'ws-15',
                    title: 'C2 Channel Detection',
                    subtitle: 'HTTP polling, DNS tunneling, IRC and custom protocol C2',
                    type: 'module',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'sections/security-analysis/ws-15-c2-detection.module.html'
                },
                {
                    id: 'ws-16',
                    title: 'Data Exfiltration Analysis',
                    subtitle: 'Volume spikes, unusual destinations, DNS exfil indicators',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'sections/security-analysis/ws-16-exfiltration.module.html'
                },
                {
                    id: 'ws-17',
                    title: 'TLS Inspection & JA3 Fingerprinting',
                    subtitle: 'Client hello parsing, JA3/JA3S hash generation, malicious TLS',
                    type: 'module',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'sections/security-analysis/ws-17-tls-ja3.module.html'
                },
                {
                    id: 'ws-18',
                    title: 'Credential Exposure in Traffic',
                    subtitle: 'Cleartext auth, NTLM hashes, form POST credential extraction',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'sections/security-analysis/ws-18-credentials.module.html'
                },
                {
                    id: 'ws-19',
                    title: 'Port Scan Signatures',
                    subtitle: 'SYN, NULL, FIN, Xmas scan patterns in packet captures',
                    type: 'module',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'sections/security-analysis/ws-19-port-scans.module.html'
                }
            ]
        },
        {
            id: 'forensic-capture',
            name: 'Forensic Capture',
            shortName: 'Forensics',
            description: 'Capture evidence to court standards, carve artifacts from PCAP files, reconstruct attack timelines, correlate packets with SIEM events, and write expert-grade reports.',
            icon: '../../assets/images/icons/icon-detective.webp',
            color: '#4ade80',
            colorDim: 'rgba(74, 222, 128, 0.12)',
            moduleCount: 5,
            modules: [
                {
                    id: 'ws-20',
                    title: 'Evidence-Grade Packet Capture',
                    subtitle: 'Hash verification, ring buffers, chain of custody for PCAPs',
                    type: 'module',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'sections/forensic-capture/ws-20-evidence-capture.module.html'
                },
                {
                    id: 'ws-21',
                    title: 'PCAP Artifact Carving',
                    subtitle: 'Extracting files, images, credentials from capture files',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'sections/forensic-capture/ws-21-pcap-carving.module.html'
                },
                {
                    id: 'ws-22',
                    title: 'Attack Timeline Reconstruction',
                    subtitle: 'Ordering events, correlating timestamps, building the kill chain',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '60 min',
                    href: 'sections/forensic-capture/ws-22-timeline.module.html'
                },
                {
                    id: 'ws-23',
                    title: 'SIEM Correlation Workflows',
                    subtitle: 'Linking PCAP evidence to Splunk/ELK events, cross-referencing IOCs',
                    type: 'module',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'sections/forensic-capture/ws-23-siem-correlation.module.html'
                },
                {
                    id: 'ws-24',
                    title: 'Expert Forensic Reporting',
                    subtitle: 'Documenting captures, screenshots, exhibit formatting, Daubert considerations',
                    type: 'module',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'sections/forensic-capture/ws-24-reporting.module.html'
                }
            ]
        },
        {
            id: 'wireless-iot',
            name: 'Wireless & IoT',
            shortName: 'Wireless',
            description: 'Capture 802.11 management and data frames, identify WiFi attack signatures, decode BLE and Zigbee traffic, and build IoT device behavioral profiles.',
            icon: '../../assets/images/icons/icon-signal.webp',
            color: '#fbbf24',
            colorDim: 'rgba(251, 191, 36, 0.12)',
            moduleCount: 4,
            modules: [
                {
                    id: 'ws-25',
                    title: '802.11 Packet Capture',
                    subtitle: 'Monitor mode setup, radiotap headers, beacon/probe/auth frames',
                    type: 'module',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'sections/wireless-iot/ws-25-80211-capture.module.html'
                },
                {
                    id: 'ws-26',
                    title: 'WiFi Attack Signatures',
                    subtitle: 'Deauth floods, PMKID capture, evil twin indicators in captures',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'sections/wireless-iot/ws-26-wifi-attacks.module.html'
                },
                {
                    id: 'ws-27',
                    title: 'BLE & Zigbee Dissection',
                    subtitle: 'Bluetooth Low Energy advertising, Zigbee frame structure',
                    type: 'module',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'sections/wireless-iot/ws-27-ble-zigbee.module.html'
                },
                {
                    id: 'ws-28',
                    title: 'IoT Traffic Profiling',
                    subtitle: 'Baseline device behavior, MQTT, CoAP, anomaly patterns',
                    type: 'module',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'sections/wireless-iot/ws-28-iot-profiling.module.html'
                }
            ]
        },
        {
            id: 'advanced-automation',
            name: 'Advanced & Automation',
            shortName: 'Automation',
            description: 'Drive packet analysis from the command line with tshark, write custom Lua protocol dissectors, automate PCAP processing with pyshark, and interpret statistics and IO graphs.',
            icon: '../../assets/images/icons/icon-terminal.webp',
            color: '#a78bfa',
            colorDim: 'rgba(167, 139, 250, 0.12)',
            moduleCount: 4,
            modules: [
                {
                    id: 'ws-29',
                    title: 'tshark CLI Mastery',
                    subtitle: 'Filters, fields, -T options, piping to jq and awk',
                    type: 'module',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'sections/advanced-automation/ws-29-tshark.module.html'
                },
                {
                    id: 'ws-30',
                    title: 'Lua Dissector Development',
                    subtitle: 'Writing custom protocol dissectors in Lua, field registration',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '60 min',
                    href: 'sections/advanced-automation/ws-30-lua-dissectors.module.html'
                },
                {
                    id: 'ws-31',
                    title: 'pyshark & Python Automation',
                    subtitle: 'Scripted PCAP parsing, field extraction, alerting pipelines',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '55 min',
                    href: 'sections/advanced-automation/ws-31-pyshark.module.html'
                },
                {
                    id: 'ws-32',
                    title: 'Statistics & IO Graphs',
                    subtitle: 'Protocol hierarchy, conversations, flow graphs, response times',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'sections/advanced-automation/ws-32-statistics.module.html'
                }
            ]
        }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WiresharkData;
}
